import { alertSummary, type AlertType } from '../domain/operationalAlerts'
import type { PolicyRun } from '../domain/types'
import type { Store } from './store'
export interface AlertConfig { minimumSample: number; minimumAvailability: number; schedulerToleranceMs: number }
export const defaultAlertConfig:AlertConfig={minimumSample:5,minimumAvailability:.7,schedulerToleranceMs:3*3600_000}
const titles:Record<AlertType,string>={SCHEDULED_RUN_FAILED:'Scheduled run failed',SCHEDULED_RUN_PARTIAL:'Scheduled run partially completed',GENESYS_AUTH_FAILURE:'Genesys authentication failed',GENESYS_QUERY_FAILURE:'Genesys query failed',JEV_FAILURE:'Jev evaluation failed',LOW_TRANSCRIPT_AVAILABILITY:'Low transcript availability',LOW_DIGITAL_CONTENT_AVAILABILITY:'Low digital content availability',SCHEDULER_STALE:'Scheduler activity is stale',REVIEW_DUE_SOON:'Review due soon',REVIEW_OVERDUE:'Review overdue',REVIEW_ESCALATED:'Review escalated'}
const key=(type:AlertType,policyId?:string)=>`${type}:${policyId??'global'}`
async function recover(store:Store,type:AlertType,now:string,policyId?:string){for(const a of await store.alerts(true))if(a.dedupKey===key(type,policyId)&&a.status!=='RESOLVED')await store.transitionAlert(a.id,'RESOLVED',now)}
export async function scheduledRunAlerts(store:Store,run:PolicyRun,now:string,config=defaultAlertConfig){
  if(run.executionMode!=='scheduled'||run.status==='running')return
  const open=async(type:AlertType,severity:'ERROR'|'WARNING',metadata:Record<string,number|boolean>={})=>store.upsertAlert({dedupKey:key(type,run.policyId),type,severity,title:titles[type],message:type==='SCHEDULED_RUN_FAILED'||type==='SCHEDULED_RUN_PARTIAL'?'Inspect the related run for structured failure diagnostics.':'Review provider configuration and the related run.',source:'scheduled-run',policyId:run.policyId,scheduleId:run.scheduleId,runId:run.id,metadata},now)
  if(run.status==='failed')await open('SCHEDULED_RUN_FAILED','ERROR')
  if(run.status==='partial-failure')await open('SCHEDULED_RUN_PARTIAL','WARNING')
  for(const type of ['GENESYS_AUTH_FAILURE','GENESYS_QUERY_FAILURE','JEV_FAILURE'] as const)if(run.failures.some(f=>f.code===type))await open(type,'ERROR',{failedOperations:run.failures.filter(f=>f.code===type).length})
  // A completed list/query proves authenticated Genesys access, including a legitimate empty population.
  if(run.status==='completed'){
    await recover(store,'GENESYS_AUTH_FAILURE',now,run.policyId)
    await recover(store,'GENESYS_QUERY_FAILURE',now,run.policyId)
    if(run.evaluationsSucceeded>0)await recover(store,'JEV_FAILURE',now,run.policyId)
  }
  const sampled=run.coverage?.sampledCount??run.sampledConversationIds?.length??0,available=run.coverage?.evaluableCount??run.evaluableCount??0
  const digital=run.policySnapshot.criteria.anyOf.flat().filter(c=>c.field==='channel').map(c=>c.value)
  const populations=run.contentAvailability??[{channel:digital.length&&digital.every(c=>['email','messaging','message','chat'].includes(c))?'digital':'voice',sampled,available}]
  for(const kind of ['voice','digital'] as const){
    const channels=populations.filter(p=>(['email','messaging','message','chat','digital'].includes(p.channel)?'digital':'voice')===kind),sampled=channels.reduce((sum,p)=>sum+p.sampled,0),available=channels.reduce((sum,p)=>sum+p.available,0)
    if(sampled>=config.minimumSample&&available/sampled<config.minimumAvailability)await open(kind==='digital'?'LOW_DIGITAL_CONTENT_AVAILABILITY':'LOW_TRANSCRIPT_AVAILABILITY','WARNING',{sampled,available,availability:available/sampled,threshold:config.minimumAvailability})
  }
}
export async function checkSchedulerHealth(store:Store,now:string,configured:boolean,config=defaultAlertConfig){
  if(!configured)return
  // Starts a grace period for existing installations without rewriting any schedule.
  const state=await store.schedulerHealth()??await store.recordSchedulerHealth(now,false)
  const last=state.lastSuccessfulTickAt??state.initializedAt
  if(Date.parse(now)-Date.parse(last)>config.schedulerToleranceMs)await store.upsertAlert({dedupKey:key('SCHEDULER_STALE'),type:'SCHEDULER_STALE',severity:'WARNING',title:titles.SCHEDULER_STALE,message:'No successful scheduler tick has been observed within the configured tolerance.',source:'scheduler',metadata:{toleranceMs:config.schedulerToleranceMs}},now)
}
export async function healthySchedulerTick(store:Store,now:string){await store.recordSchedulerHealth(now,true);await recover(store,'SCHEDULER_STALE',now)}
export async function monitoringAlerts(store:Store,now:string,configured:boolean,config=defaultAlertConfig){await checkSchedulerHealth(store,now,configured,config);return alertSummary(await store.alerts(true))}
