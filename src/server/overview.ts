import { collectAnalyticsData, operationalAnalytics } from './analytics'
import { reviewWorkload, type ReviewAuthority } from './reviewOperations'
import { alertSummary } from '../domain/operationalAlerts'
import type { OperationalAlert } from '../domain/operationalAlerts'
import type { InteractionPolicy, PolicyRun } from '../domain/types'
import type { OverviewSection, OverviewSnapshot, OverviewRun } from '../domain/overview'
import type { Store } from './store'
import type { Schedule } from './schedules'
import { defaultAlertConfig, type AlertConfig } from './alerts'

/** Evidence only: no credential verification or provider dispatch. */
export function providerEvidence(latest?:PolicyRun) {
 const genesysError=latest?.failures.some(f=>['GENESYS_AUTH_FAILURE','GENESYS_QUERY_FAILURE'].includes(f.code??'')||/^genesys_(auth|query_or_plan):/.test(f.reason))??false
 const attempted=!!latest&&(latest.evaluationsSucceeded+latest.evaluationsFailed>0)
 return {genesysAutomation:{status:!latest?'unverified':genesysError?'error':['completed','partial-failure'].includes(latest.status)?'verified':'unverified'},jev:{status:!attempted?'unverified':latest!.evaluationsFailed?'error':'verified'}} as const
}
export const overviewRun=(r:PolicyRun):OverviewRun=>({id:r.id,policyId:r.policyId,policyName:r.policySnapshot.name,status:r.status,startedAt:r.startedAt,...(r.completedAt?{completedAt:r.completedAt}:{}),trigger:r.executionMode??'manual',evaluationsSucceeded:r.evaluationsSucceeded,evaluationsFailed:r.evaluationsFailed})
const done=<T>(data:T):OverviewSection<T>=>({complete:true,data})
async function section<T>(work:()=>Promise<OverviewSection<T>>):Promise<OverviewSection<T>>{
 try{return await work()}catch(e){const limited=e instanceof Error&&/limit|indexed|aggregation/i.test(e.message);return {complete:false,status:limited?'incomplete':'unavailable',reason:limited?'Indexed aggregation required.':'Section temporarily unavailable.'}}
}
/** Request-local promise cache shares repeated page/settings reads across existing domain helpers. */
function sharedReads(store:Store):Store {
 const cache=new Map<string,Promise<unknown>>(),methods=new Set(['query','activeReviewPage','governanceRead','healthSnapshot'])
 return new Proxy(store,{get(target,key){const value=Reflect.get(target,key);if(typeof value!=='function')return value;if(!methods.has(String(key)))return value.bind(target);return (...args:unknown[])=>{const id=JSON.stringify([key,...args]);if(!cache.has(id))cache.set(id,Promise.resolve().then(()=>value.apply(target,args)));return cache.get(id)}}})
}
export async function operationalOverview(original:Store,now:string,days:7|30,authority:ReviewAuthority,configured:boolean,config:AlertConfig=defaultAlertConfig):Promise<OverviewSnapshot>{
 const store=sharedReads(original),from=new Date(Date.parse(now)-days*86400000).toISOString(),range={days,from,to:now}
 const [health,analytics,reviews,alerts,notifications,schedules,recentRuns,lastAutomatedRun]=await Promise.all([
  section(async()=>{const [snapshot,scheduler]=await Promise.all([store.healthSnapshot(),store.schedulerHealth()]);return done({api:'healthy' as const,firestore:'available' as const,...providerEvidence(snapshot.recentRuns[0]),scheduler:{status:scheduler?.lastSuccessfulTickAt?(Date.parse(now)-Date.parse(scheduler.lastSuccessfulTickAt)>config.schedulerToleranceMs?'stale' as const:'healthy' as const):configured?'configured_unverified' as const:'not_configured' as const,lastSuccessfulTickAt:scheduler?.lastSuccessfulTickAt??null}})}),
  section(async()=>{const a=await operationalAnalytics(store,new URLSearchParams({from,to:now,source:'genesys-cloud'}));return done({quality:{evaluations:a.metrics.evaluations,conversations:a.metrics.conversations,averageScore:a.metrics.averageScore,passRate:a.metrics.passRate,criticalFailures:a.metrics.criticalFailures,criticalFailureRate:a.metrics.criticalFailureRate},coverage:a.coverage,qualityTrend:a.byDay,runCounts:a.runCounts})}),
  section(async()=>{const w=await reviewWorkload(store,now,authority);if(!w.complete||!w.summary?.complete)return {complete:false,status:'incomplete',reason:'Indexed aggregation required.'};return done({open:w.summary.open,dueSoon:w.summary.dueSoon,overdue:w.summary.overdue,escalated:w.summary.escalated,unassigned:w.unassignedRequested??0})}),
  section(async()=>{const items:OperationalAlert[]=[];let cursor:string|undefined;do{const page=await store.activeAlertPage(Math.min(100,2000-items.length),cursor);items.push(...page.items);cursor=page.nextCursor}while(cursor&&items.length<2000);if(cursor)return {complete:false,status:'incomplete',reason:'Indexed aggregation required.'};const summary=alertSummary(items),rank={ERROR:0,WARNING:1,INFO:2};return done({openAlerts:summary.openAlertCount,errors:summary.errorAlertCount,warnings:summary.warningAlertCount,items:items.sort((a,b)=>rank[a.severity]-rank[b.severity]||b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id)).slice(0,5).map(a=>({id:a.id,severity:a.severity,title:a.title,createdAt:a.createdAt,...(a.policyId?{policyId:a.policyId}:{}),...(a.runId?{runId:a.runId}:{}),...(a.context?.evaluationId?{evaluationId:a.context.evaluationId}:{})}))})}),
  section(async()=>done(await store.notificationHealth(now))),
  section(async()=>{const [all,policies]=await Promise.all([collectAnalyticsData<Schedule>(store,'schedules',2000),collectAnalyticsData<InteractionPolicy>(store,'policies',2000)]),names=new Map(policies.map(p=>[p.id,p]));const enabled=all.filter(s=>s.enabled&&s.frequency!=='MANUAL'&&s.nextDueAt&&names.get(s.policyId)?.enabled).sort((a,b)=>a.nextDueAt!.localeCompare(b.nextDueAt!)||a.id.localeCompare(b.id));return done({nextRunAt:enabled[0]?.nextDueAt??null,items:enabled.slice(0,5).map(s=>({id:s.id,policyId:s.policyId,policyName:names.get(s.policyId)!.name,frequency:s.frequency,nextDueAt:s.nextDueAt!,lastSuccessfulAt:s.lastSuccessfulAt??null}))})}),
  section(async()=>{const snapshot=await store.healthSnapshot();return done({lastRun:snapshot.recentRuns[0]?overviewRun(snapshot.recentRuns[0]):null,items:snapshot.recentRuns.slice(0,5).map(overviewRun)})}),
  section(async()=>{const runs=await collectAnalyticsData<PolicyRun>(store,'policyRuns',500),last=runs.filter(r=>r.executionMode==='scheduled'&&r.status==='completed').sort((a,b)=>b.startedAt.localeCompare(a.startedAt)||a.id.localeCompare(b.id))[0];return done(last?overviewRun(last):null)})
 ])
 return {generatedAt:now,range,health,analytics,reviews,alerts,notifications,schedules,recentRuns,lastAutomatedRun}
}
