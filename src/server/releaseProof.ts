/** Bounded V0.6.4 operator entry point. Run only as an explicitly authorized Cloud Run Job.
 * Credentials remain in the existing server Secret Manager bindings. No content is logged.
 */
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { FirestoreStore } from './store'
import { ClientCredentialsGenesys, DirectJev } from './providers'
import { executeServerRun, manualRunId, planFingerprint, planServerRun, type RunnerDeps } from './runner'
import { dueSchedules, localInstant, monitoringPeriod, nextDueAfter, validateSchedule, type Schedule } from './schedules'
import { formStatus, validatePolicyFormPins } from '../domain/formLifecycle'
import { operationalAnalytics } from './analytics'
import type { Region } from '../domain/genesysAuth'
const policyId='daily_voice_customer_service_aqm',scheduleId=`${policyId}_daily`
const report=(value:unknown)=>console.log(JSON.stringify({aqmReleaseProof:value}))
async function main(){
  const mode=process.argv[2]
  if(!['plan','execute','verify','enable','email'].includes(mode))throw Error('Specify an authorized proof mode.')
  initializeApp({projectId:'genesys-aqm-2026'})
  const store=new FirestoreStore(getFirestore())
  const genesys=new ClientCredentialsGenesys(process.env.GENESYS_REGION as Region,process.env.GENESYS_CLIENT_ID!,process.env.GENESYS_CLIENT_SECRET!)
  let requests=0
  const deps:RunnerDeps={store,genesys,now:()=>new Date(),jev:{evaluate:async request=>{
    if(mode!=='execute'||++requests>3)throw Error('Paid proof budget exceeded or unauthorized mode.')
    return new DirectJev(process.env.JEV_API_KEY!).evaluate(request)
  }}}
  const form=await store.form('genesys_customer_service_ai_scoring')
  if(!form||formStatus(form)!=='PUBLISHED'||!form.enabled)throw Error('Existing published Customer Service form is unavailable.')
  const date=process.env.AQM_PROOF_DAY
  if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Pin the completed local proof day.')
  const nextDay=new Date(`${date}T12:00:00Z`);nextDay.setUTCDate(nextDay.getUTCDate()+1)
  const period={periodStart:localInstant(date),periodEnd:localInstant(nextDay.toISOString().slice(0,10))}
  const schedule:Schedule={id:scheduleId,policyId,enabled:false,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',version:1}
  if(mode==='email'){
    const page=await genesys.list({from:period.periodStart,to:period.periodEnd,channel:'email',page:1,pageSize:5})
    const conversation=page.conversations[0]?await genesys.load(page.conversations[0].conversationId):undefined
    report({emailLive:{candidatesObserved:page.conversations.length,hasMore:page.hasMore,conversationId:conversation?.conversationId,contentStatus:conversation?.metadata.transcriptStatus,detail:conversation?.metadata.transcriptDetail,messageCount:conversation?.messages.length??0,customerMessages:conversation?.messages.filter(m=>m.speaker==='customer').length??0,agentMessages:conversation?.messages.filter(m=>m.speaker==='agent').length??0,jevRequests:0}});return
  }
  let policy=await store.policy(policyId)
  const requestedQueue=process.env.AQM_PROOF_QUEUE
  if(!policy){
    if(mode!=='plan')throw Error('Build and review a plan first.')
    policy={id:policyId,name:'Daily Voice Customer Service AQM',description:'Conservative unattended proof; three completed inbound voice interactions from the previous London day.',enabled:true,version:1,criteria:{anyOf:[[{field:'channel',operator:'equals',value:'voice'},{field:'direction',operator:'equals',value:'inbound'},...(requestedQueue?[{field:'queue' as const,operator:'equals' as const,value:requestedQueue}]:[])]]},evaluationFormIds:[form.id],sampling:{strategy:'fixed_count',count:3},schedule:'manual'}
  }
  const errors=validatePolicyFormPins(policy,[form]);if(errors.length)throw Error(errors.join(' '))
  if(policy.sampling?.strategy!=='fixed_count'||policy.sampling.count!==3||policy.evaluationFormIds.length!==1||policy.evaluationFormIds[0]!==form.id)throw Error('Unexpected proof policy or spend configuration.')
  const runId=manualRunId(policy,period)
  if(mode==='verify'||mode==='enable'){
    const run=await store.run(runId)
    if(!run)throw Error('Manual proof run was not found.')
    const records=(await store.query<import('../domain/types').EvaluationRecord>('evaluationRecords',100)).items.filter(record=>record.policyRunId===runId)
    const rawKeys=records.some(record=>'messages' in record||'transcript' in record||'rawResponse' in record)
    if(mode==='enable'){
      if(run.status!=='completed'||run.evaluationsSucceeded<1||run.evaluationsFailed!==0||rawKeys||records.length!==run.evaluationsSucceeded||records.some(record=>record.form.version!==form.version||record.executionMode!=='manual'))throw Error('Manual proof verification is insufficient to enable scheduling.')
      const others=(await store.schedules()).filter(s=>s.policyId===policyId&&s.id!==scheduleId)
      if(others.length)throw Error('A conflicting schedule already exists.')
      const prior=await store.schedule(scheduleId)
      if(prior?.enabled){report({schedule:prior,alreadyEnabled:true});return}
      schedule.enabled=true;schedule.nextDueAt=nextDueAfter(schedule,new Date().toISOString());validateSchedule(schedule)
      await store.putSchedule(schedule)
      const stored=(await store.schedules()).filter(s=>s.policyId===policyId)
      report({schedule:stored[0],scheduleCount:stored.length,nextPeriod:monitoringPeriod(schedule,schedule.nextDueAt!),visibleWhenDue:dueSchedules(stored,schedule.nextDueAt!).length,jevRequests:0});return
    }
    const analytics=await operationalAnalytics(store,new URLSearchParams({policy:policyId,source:'genesys-cloud'}))
    report({runId,status:run.status,successes:run.evaluationsSucceeded,failures:run.evaluationsFailed,records:records.map(r=>({id:r.id,formId:r.form.id,formVersion:r.form.version,purpose:r.purpose,executionMode:r.executionMode,policyRunId:r.policyRunId})),rawContentFieldsPresent:rawKeys,analytics,jevRequests:0});return
  }
  let prepared:Awaited<ReturnType<typeof planServerRun>>
  try{prepared=await planServerRun(deps,policy,period)}catch(error){
    if(mode==='plan'&&error instanceof Error&&error.message.includes('500')){
      const counts=new Map<string,number>()
      for(let page=1;page<=20;page++){const result=await genesys.list({from:period.periodStart,to:period.periodEnd,channel:'voice',direction:'inbound',page,pageSize:25});for(const c of result.conversations)counts.set(c.metadata.queueId,(counts.get(c.metadata.queueId)??0)+1);if(!result.hasMore)break}
      const queues=await genesys.withQueueNames([...counts].filter(([id])=>!!id).map(([id])=>({conversationId:'distribution',startedAt:period.periodStart,channel:'voice',agent:{id:'',name:''},customer:{id:'',name:''},metadata:{queueId:id},messages:[]})))
      report({populationExceeds500:true,distributionScope:'up to 500 most recent inbound voice candidates; not a complete population',queues:queues.map(c=>({id:c.metadata.queueId,name:c.metadata.queue,observed:counts.get(c.metadata.queueId)})),jevRequests:0});return
    }
    throw error
  }
  const p=prepared.plan,fingerprint=planFingerprint(policy,period,p.selected)
  const duplicates=[]
  for(const item of p.selected){if(await store.findProductionEvaluation('genesys-cloud',item.conversation.conversationId,form.id,form.version))duplicates.push(item.conversation.conversationId)}
  report({mode,policyId,policyName:policy.name,criteria:policy.criteria,formId:form.id,formVersion:form.version,period,runId,fingerprint,candidate:p.candidateCount,eligible:p.eligibleCount,sampled:p.sampledCount,transcriptAvailable:p.evaluableCount,pendingEvaluations:p.expectedEvaluations,expectedJevRequests:p.expectedEvaluations,priorProductionDuplicates:duplicates,jevRequests:requests})
  if(mode==='plan'){
    if(!(await store.policy(policyId)))await store.putPolicy(policy)
    if(!(await store.schedule(scheduleId)))await store.putSchedule(schedule)
    return
  }
  if(process.env.AQM_PROOF_FINGERPRINT!==fingerprint||p.expectedEvaluations<1||p.expectedEvaluations>3||duplicates.length||await store.run(runId))throw Error('Paid proof review guard rejected execution.')
  const run=await executeServerRun(deps,policy,period,runId,'manual',prepared)
  report({runId:run.id,status:run.status,successes:run.evaluationsSucceeded,failures:run.evaluationsFailed,jevRequests:requests})
}
main().catch(error=>{report({error:error instanceof Error?error.message:'Proof failed'});process.exitCode=1})
