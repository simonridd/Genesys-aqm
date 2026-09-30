import { createHash } from 'node:crypto'
import { matchPolicies } from '../domain/policies'
import { planPolicyRun, MAX_POLICY_CONVERSATIONS } from '../domain/policyRuns'
import { toScorecard } from '../domain/forms'
import { recordEvaluation } from '../domain/evaluations'
import type { Conversation, EvaluationForm, InteractionPolicy, MonitoringPeriod, PolicyRun, PolicyRunFailure } from '../domain/types'
import type { GenesysReader, JevEvaluator } from './providers'
import type { Store } from './store'
import { dueSchedules, monitoringPeriod, nextDueAfter, type Schedule } from './schedules'

const digest=(value:string)=>createHash('sha256').update(value).digest('hex').slice(0,40)
export function scheduledRunId(policy:InteractionPolicy,schedule:Schedule,period:MonitoringPeriod){return `r_${digest(JSON.stringify([policy.id,policy.version??1,schedule.id,period.periodStart,period.periodEnd]))}`}
export function manualRunId(policy:InteractionPolicy,period:MonitoringPeriod){return `m_${digest(JSON.stringify([policy.id,policy.version??1,period.periodStart,period.periodEnd]))}`}
export function executionClaimId(policy:InteractionPolicy,period:MonitoringPeriod){return `c_${digest(JSON.stringify([policy.id,policy.version??1,period.periodStart,period.periodEnd]))}`}
export function evaluationId(contextId:string,conversationId:string,form:EvaluationForm){return `e_${digest(JSON.stringify([contextId,conversationId,form.id,form.version]))}`}
export interface RunnerDeps { store:Store; genesys:GenesysReader; jev:JevEvaluator; now:()=>Date }
export function planFingerprint(policy:InteractionPolicy,period:MonitoringPeriod,selected:Array<{conversation:{conversationId:string};pendingFormIds:string[]}>) { return digest(JSON.stringify([policy.id,policy.version??1,period,selected.map(item=>[item.conversation.conversationId,item.pendingFormIds])])) }
export async function planServerRun(deps:RunnerDeps,policy:InteractionPolicy,period:MonitoringPeriod) {
  if (!policy.enabled) throw new Error('Policy is disabled.')
  const from=Date.parse(period.periodStart),to=Date.parse(period.periodEnd)
  if (!Number.isFinite(from)||!Number.isFinite(to)||to<=from||to>deps.now().getTime()+60_000||to-from>8*86400_000)throw new Error('Monitoring period must be a past interval of at most eight days.')
  const candidates:Conversation[]=[]
  // A London week across the autumn clock change is 169 hours. Split provider
  // queries at seven-day UTC boundaries while preserving the exact local week.
  for(let cursor=from;cursor<to;cursor+=7*86400_000){
    const chunkEnd=Math.min(cursor+7*86400_000,to)
    for(let page=1;page<=20;page++){
      const result=await deps.genesys.list({from:new Date(cursor).toISOString(),to:new Date(chunkEnd).toISOString(),page,pageSize:25})
      candidates.push(...result.conversations)
      if(candidates.length>500)throw new Error('More than 500 candidates; narrow the monitoring period.')
      if(!result.hasMore)break
      if(page===20)throw new Error('More than 500 candidates; narrow the monitoring period.')
    }
  }
  const scoped=policy.criteria.anyOf.some(g=>g.some(c=>c.field==='queue'))?await deps.genesys.withQueueNames(candidates):candidates
  const forms=await deps.store.forms()
  const preliminary=planPolicyRun(policy,scoped,forms,[],'genesys-cloud',period)
  if(preliminary.limitExceeded)throw new Error(`A run is limited to ${MAX_POLICY_CONVERSATIONS} sampled conversations.`)
  const selected=new Map<string,Conversation>();const retrievalFailures:PolicyRunFailure[]=[]
  for(const item of preliminary.selected){
    try {selected.set(item.conversation.conversationId,await deps.genesys.load(item.conversation.conversationId))}
    catch(error){retrievalFailures.push({conversationId:item.conversation.conversationId,reason:`transcript_retrieval: ${error instanceof Error?error.message:'Unknown error'}`})}
  }
  const ready=scoped.map(c=>selected.get(c.conversationId)??c)
  // Only records from this policy-version/period context suppress new work.
  const prior=(await deps.store.evaluations()).filter(r=>r.id===evaluationId(executionClaimId(policy,period),r.conversationId,r.form))
  const plan=planPolicyRun(policy,ready,forms,prior,'genesys-cloud',period)
  return {plan,forms,retrievalFailures}
}
export async function executeServerRun(deps:RunnerDeps,policy:InteractionPolicy,period:MonitoringPeriod,runId:string,provenance:'manual'|'scheduled',prepared?:Awaited<ReturnType<typeof planServerRun>>,scheduleId?:string) {
  const now=deps.now().toISOString(),owner=crypto.randomUUID()
  const claimId=executionClaimId(policy,period)
  if(!await deps.store.claim(claimId,owner,now,new Date(Date.parse(now)+60*60_000).toISOString()))throw new Error('lease_conflict: run is active or complete.')
  let run:PolicyRun|undefined
  try {
    const {plan,forms,retrievalFailures}=prepared??await planServerRun(deps,policy,period)
    const tasks=plan.selected.flatMap(item=>item.pendingFormIds.map(formId=>({conversation:item.conversation,form:forms.find(f=>f.id===formId)!})))
    const unavailableFailures=plan.selected.filter(item=>!item.transcriptAvailable&&!retrievalFailures.some(f=>f.conversationId===item.conversation.conversationId)).map(item=>({conversationId:item.conversation.conversationId,reason:'transcript_unavailable: No supported transcript content was returned.'}))
    run={id:runId,policyId:policy.id,policySnapshot:plan.policySnapshot,source:'genesys-cloud',executionMode:provenance,scheduleId,startedAt:now,candidateConversationCount:plan.candidateCount,matchedConversationCount:plan.eligibleCount,formsAssigned:plan.formIds,evaluationsRequested:tasks.length,evaluationsSucceeded:0,evaluationsFailed:0,status:'running',failures:[...retrievalFailures,...unavailableFailures],period,sampling:plan.sampling,deterministicSeed:plan.seed,sampledConversationIds:plan.selected.map(c=>c.conversation.conversationId),evaluableCount:plan.evaluableCount,previouslyEvaluatedCount:plan.previouslyEvaluatedCount,coverage:plan.coverage,agentCoverage:plan.agentCoverage}
    await deps.store.putRun(run)
    // A reserved slot is never retried automatically. An ambiguous post-Jev failure needs operator reconciliation.
    for(const task of tasks){
      const id=evaluationId(claimId,task.conversation.conversationId,task.form)
      const slot=await deps.store.evaluationSlot(id)
      if(slot?.status==='completed'){run.evaluationsSucceeded++;continue}
      if(slot || !await deps.store.reserveEvaluation(id,deps.now().toISOString())){run.failures.push({conversationId:task.conversation.conversationId,formId:task.form.id,reason:'evaluation_uncertain: prior Jev request may have been charged; reconcile before retry.'});run.evaluationsFailed++;continue}
      try{
        const result=await deps.jev.evaluate({conversation:task.conversation,scorecard:toScorecard(task.form),evaluatedAt:deps.now().toISOString(),version:'v0'})
        const record=recordEvaluation(task.conversation,task.form,result,matchPolicies(task.conversation,[policy]),id,{conversationSource:'genesys-cloud',policyRunId:runId,executionMode:provenance})
        await deps.store.completeEvaluation(id,record)
        run.evaluationsSucceeded++
      }catch(error){run.failures.push({conversationId:task.conversation.conversationId,formId:task.form.id,reason:`evaluation_uncertain: ${error instanceof Error?error.message:'Unknown Jev or persistence error'}`});run.evaluationsFailed++}
      await deps.store.putRun(run)
    }
    run.completedAt=deps.now().toISOString()
    run.status=run.failures.length?(run.evaluationsSucceeded?'partial-failure':'failed'):'completed'
    run.coverage={...plan.coverage,evaluationCount:plan.alreadyEvaluatedAssignmentCount+run.evaluationsSucceeded+run.evaluationsFailed,successfulEvaluationCount:plan.alreadyEvaluatedAssignmentCount+run.evaluationsSucceeded,failedEvaluationCount:run.evaluationsFailed,evaluatedConversationCount:new Set([...plan.selected.filter(c=>c.alreadyEvaluatedFormIds.length).map(c=>c.conversation.conversationId),...tasks.filter(t=>run!.failures.every(f=>f.conversationId!==t.conversation.conversationId||f.formId!==t.form.id)).map(t=>t.conversation.conversationId)]).size}
    await deps.store.putRun(run)
    if(run.status==='completed')await deps.store.completeClaim(claimId,owner)
    else await deps.store.releaseClaim(claimId,owner)
    return run
  }catch(error){
    const detail=error instanceof Error?error.message:'Unknown error'
    const kind=/authentication|token/i.test(detail)?'genesys_auth':/lease_conflict/i.test(detail)?'lease_conflict':run?'persistence_or_run':'genesys_query_or_plan'
    if(!run)run={id:runId,policyId:policy.id,policySnapshot:structuredClone(policy),source:'genesys-cloud',executionMode:provenance,scheduleId,startedAt:now,candidateConversationCount:0,matchedConversationCount:0,formsAssigned:[...policy.evaluationFormIds],evaluationsRequested:0,evaluationsSucceeded:0,evaluationsFailed:0,status:'failed',failures:[],period}
    run.status=run.evaluationsSucceeded?'partial-failure':'failed';run.completedAt=deps.now().toISOString();run.failures.push({conversationId:'',reason:`${kind}: ${detail}`})
    await deps.store.putRun(run)
    await deps.store.releaseClaim(claimId,owner)
    throw error
  }
}
export async function schedulerTick(deps:RunnerDeps){
  const now=deps.now().toISOString(),schedules=dueSchedules(await deps.store.schedules(),now)
  const outcomes:Array<{scheduleId:string;runId?:string;status:string}>=[]
  for(const schedule of schedules){
    const policy=await deps.store.policy(schedule.policyId)
    if(!policy){outcomes.push({scheduleId:schedule.id,status:'missing_policy'});continue}
    const period=monitoringPeriod(schedule,schedule.nextDueAt!)
    const runId=scheduledRunId(policy,schedule,period)
    try{
      const run=await executeServerRun(deps,policy,period,runId,'scheduled',undefined,schedule.id)
      schedule.lastAttemptedAt=now
      if(run.status==='completed')schedule.lastSuccessfulAt=run.completedAt
      schedule.nextDueAt=nextDueAfter(schedule,schedule.nextDueAt!)
      await deps.store.putSchedule(schedule)
      outcomes.push({scheduleId:schedule.id,runId,status:run.status})
    }catch(error){
      schedule.lastAttemptedAt=now
      await deps.store.putSchedule(schedule)
      outcomes.push({scheduleId:schedule.id,runId,status:error instanceof Error?error.message:'failed'})
    }
  }
  return outcomes
}
