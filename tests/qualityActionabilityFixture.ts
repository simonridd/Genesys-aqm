import { expect,type Page } from '@playwright/test'
import { MemoryStore } from '../src/server/store'
import { operationalAnalytics } from '../src/server/analytics'
import { operationalOverview } from '../src/server/overview'
import { governanceSettings } from '../src/server/governance'
import { reviewWorkload } from '../src/server/reviewOperations'
import { rolePermissions,type Role } from '../src/domain/governance'
import { matchesEvaluationFilters,buildReview } from '../src/domain/reviews'
import { reviewFixture,reviewInput } from '../src/fixtures/reviewFixture'
import { fixtureRun,overviewPolicy,overviewAuthority } from '../src/fixtures/overviewFixture'
export const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/',now='2026-10-02T12:00:00.000Z',api='https://aqm-api-bd54ukouga-nw.a.run.app'
export async function qualityFixture(page:Page,start='automation',role:Role='ADMIN'){
 const store=new MemoryStore(),requests:URL[]=[],errors:string[]=[],writes:string[]=[],blocked:string[]=[];let failAnalytics=false,failNames=false
 await store.putPolicy({...overviewPolicy,criteria:{anyOf:[[{field:'channel',operator:'equals',value:'voice'}]]}})
 const base=reviewFixture();base.form.name='Customer Service';base.form.status='PUBLISHED';base.form.questions=base.form.questions.map(q=>q.id==='understanding'?{...q,title:'Clear next step'}:q)
 await store.putForm(base.form);await store.putForm({...base.form,version:18})
 for(let i=0;i<12;i++){
  const version=i<8?17:18,queue=i<6?'Claims':'Service',agent=i%2?'Alex':'Sam',score=i<6?.5:.8
  const record={...structuredClone(base),id:`quality-${i}`,conversationId:`fictional-${i}`,form:{...structuredClone(base.form),version},agent:{id:agent.toLowerCase(),name:agent},queue,evaluatedAt:`2026-09-${i<6?'10':'20'}T10:00:00.000Z`,executionMode:'scheduled' as const,policyMatches:[{policyId:overviewPolicy.id,policyName:overviewPolicy.name,matchedGroup:[]}],overallScore:score,passed:score>=.67,criticalFailures:i<2?['greeting']:[],groupResults:undefined,criticalGroupFailures:[],questions:base.questions.map(q=>({...q,title:q.id==='understanding'?'Clear next step':q.title,credit:q.id==='understanding'?(version===17?1/3:2/3):q.id==='greeting'&&i<2?0:1,status:'ANSWERED' as const}))}
  await store.putEvaluation(record)
  if(i<3){const review=buildReview(record,undefined,reviewInput(record,i===0?'complete':'request'),{userId:'admin'},now);if(i>0)review.dueAt=i===1?'2026-09-28T12:00:00.000Z':'2026-10-02T06:00:00.000Z';await store.writeReviews([{review,expectedRevision:0}])}
 }
 for(let i=0;i<2;i++)await store.putRun({...fixtureRun(`coverage-${i}`,'2026-09-15T02:00:00.000Z',i?'partial-failure':'completed'),candidateConversationCount:625,matchedConversationCount:500,evaluationsSucceeded:225,evaluationsFailed:5,coverage:{candidateCount:625,eligibleCount:500,sampledCount:250,evaluableCount:230,evaluatedConversationCount:225,evaluationCount:230,successfulEvaluationCount:225,failedEvaluationCount:5,transcriptUnavailableCount:20},queueCoverage:[{queue:'Claims',eligible:300,sampled:150,evaluated:135},{queue:'Service',eligible:200,sampled:100,evaluated:90}],agentCoverage:[{agentId:'alex',agentName:'Alex',eligible:250,sampled:125,evaluated:110},{agentId:'sam',agentName:'Sam',eligible:250,sampled:125,evaluated:115}]})
 await store.recordSchedulerHealth('2026-10-02T11:30:00.000Z',true)
 await store.putSchedule({id:'schedule',policyId:overviewPolicy.id,enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',nextDueAt:'2026-10-03T01:00:00.000Z',version:1})
 await page.clock.install({time:new Date(now)})
 await page.addInitScript(start=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:start})),start)
 page.on('pageerror',e=>errors.push(e.message))
 const settings=(await governanceSettings(store)).reviewSla
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url()),p=u.pathname,m=route.request().method()
  if(u.origin===new URL(app).origin)return route.continue()
  if(u.origin==='https://login.mypurecloud.ie'&&p==='/oauth/token')return route.fulfill({json:{access_token:'fictional',token_type:'Bearer',expires_in:3600}})
  if(u.origin==='https://api.mypurecloud.ie'&&p==='/api/v2/users/me')return route.fulfill({json:{id:'admin',name:'Fictional Quality Leader',organization:{id:'fictional'}}})
  if(u.origin!==api){blocked.push(u.origin+p);return route.abort()}
  requests.push(u);if(m!=='GET'){writes.push(m+' '+p);return route.abort()}
  const json=(value:unknown)=>route.fulfill({json:value})
  if(p==='/api/session')return json({actor:{userId:'admin'},role,permissions:rolePermissions[role]})
  if(p==='/api/governance')return json(await governanceSettings(store))
  if(p==='/api/analytics')return failAnalytics?route.fulfill({status:503,json:{error:'Fictional HTTP 503 diagnostics'}}):json(await operationalAnalytics(store,u.searchParams))
  if(p==='/api/overview')return json(await operationalOverview(store,now,u.searchParams.get('range')==='30'?30:7,overviewAuthority,true))
  if(p==='/api/review-workload')return json(await reviewWorkload(store,now,overviewAuthority))
  if(p==='/api/forms')return failNames?route.fulfill({status:503,json:{error:'Names unavailable'}}):json({items:await store.forms()})
  if(p==='/api/policies')return failNames?route.fulfill({status:503,json:{error:'Names unavailable'}}):json({items:await store.policies()})
  if(p==='/api/schedules')return json({items:await store.schedules()})
  if(p==='/api/runs')return json({items:await store.runs()})
  if(p.startsWith('/api/runs/'))return json(await store.run(p.split('/')[3]))
  if(p==='/api/alerts')return json({items:[]})
  if(p==='/api/evaluations'){const records=await Promise.all((await store.evaluations()).map(async r=>({...r,humanReview:await store.review(r.id)})));return json({items:records.filter(r=>matchesEvaluationFilters(r,u.searchParams,'admin',now,settings)),scanLimited:false})}
  if(p.startsWith('/api/evaluations/')){const id=p.split('/')[3];return json({...await store.evaluation(id),humanReview:await store.review(id)})}
  return json({items:[]})
 })
 await page.goto(`${app}?code=fictional&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
 return {store,requests,errors,writes,blocked,failAnalytics:(value=true)=>{failAnalytics=value},failNames:()=>{failNames=true}}
}
