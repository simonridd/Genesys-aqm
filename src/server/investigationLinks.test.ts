import { afterEach,describe,it,expect } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createApi } from './api'
import type { RunnerDeps } from './runner'
import { investigationFixture,investigationCohort,investigationNow } from '../fixtures/investigationFixture'
import { overviewAuthority } from '../fixtures/overviewFixture'
import { operationalOverview } from './overview'
import { operationalAnalytics } from './analytics'
import { evaluationExploreUrl,analyticsQuestionFilters } from '../domain/navigation'
import { matchesEvaluationFilters,type ReviewEvaluation } from '../domain/reviews'
import { reviewWorkload } from './reviewOperations'
const servers:Server[]=[]
afterEach(async()=>{await Promise.all(servers.splice(0).map(server=>new Promise<void>(resolve=>server.close(()=>resolve()))))})
async function fixture(){
 const store=await investigationFixture(),noCalls=async()=>{throw Error('No provider calls')}
 const deps:RunnerDeps={store,now:()=>new Date(investigationNow),genesys:{list:noCalls,load:noCalls,withQueueNames:noCalls},jev:{evaluate:noCalls}}
 const server=createApi(deps,{origin:'https://app.test',region:'eu-west-1',allowedUserIds:new Set(['admin']),bootstrapAdminId:'admin',schedulerEmail:'scheduler@example.com',schedulerAudience:'https://example.com'},async()=>new Response(JSON.stringify({id:'admin',name:'Owner'})))
 servers.push(server);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve))
 const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
 const get=async(query:URLSearchParams)=>{const reply=await fetch(`${base}/api/evaluations?${query}`,{headers:{Authorization:'Bearer fixture'}});expect(reply.status).toBe(200);return await reply.json() as {items:ReviewEvaluation[];scanLimited:boolean;scanned:number;nextCursor?:string}}
 const rows=async()=>{const reviews=new Map((await store.reviewsByIds((await store.evaluations()).map(r=>r.id))).map(r=>[r.evaluationId,r]));return (await store.evaluations()).map(r=>({...r,humanReview:reviews.get(r.id)}))}
 return {store,get,rows,base}
}
const apiDates=(q:URLSearchParams)=>{const next=new URLSearchParams(q);for(const [key,end] of [['from','T00:00:00.000Z'],['to','T23:59:59.999Z']]){const value=next.get(key);if(value&&value.length===10)next.set(key,value+end)}return next}
describe('truthful investigation lists through real GET /api/evaluations',()=>{
 it('reconciles exact-version Analytics answered-question cohort including both date endpoints and passing answers',async()=>{
  const {store,get,rows}=await fixture(),filters=analyticsQuestionFilters(investigationCohort,'general_service@17','greeting')
  const q=apiDates(evaluationExploreUrl(new URL('https://app.test/?assignment=mine&reviewStatus=REVIEWED&critical=yes&evaluationId=old&question=old'),filters).searchParams)
  const result=await get(q),analytics=await operationalAnalytics(store,apiDates(new URLSearchParams(investigationCohort)))
  expect(result.items.map(r=>r.id).sort()).toEqual(['first','last'])
  expect(result.items).toHaveLength(analytics.byQuestion.find(q=>q.questionId==='greeting')!.count)
  expect(result.items.every(r=>r.form.version===17&&r.questions.find(q=>q.id==='greeting')!.credit!>=.67)).toBe(true)
  expect((await rows()).filter(r=>matchesEvaluationFilters(r,q,'admin',investigationNow)).map(r=>r.id).sort()).toEqual(['first','last'])
 })
 it('reconciles Overview Open, requested Unassigned, due stages and authenticated My queue',async()=>{
  const {store,get}=await fixture(),snapshot=await operationalOverview(store,investigationNow,30,overviewAuthority,true),workload=await reviewWorkload(store,investigationNow,overviewAuthority)
  expect(snapshot.reviews.complete).toBe(true);if(!snapshot.reviews.complete)throw Error('incomplete')
  expect(snapshot.reviews.data.open).toBe(7);expect(snapshot.reviews.data.unassigned).toBe(1);expect(workload.unassignedRequested).toBe(1)
  for(const [metric,filters] of [['open',{reviewQueue:'active'}],['unassigned',{reviewStatus:'REVIEW_REQUESTED',assignment:'unassigned'}],['dueSoon',{dueState:'DUE_SOON'}],['overdue',{due:'overdue',dueState:'OVERDUE'}],['escalated',{dueState:'ESCALATED'}]] as const){
   const {items}=await get(new URLSearchParams(filters));expect(items).toHaveLength(snapshot.reviews.data[metric]);expect(items.every(r=>['REVIEW_REQUESTED','IN_REVIEW'].includes(r.humanReview!.status))).toBe(true)
  }
  expect((await get(new URLSearchParams('dueState=OVERDUE'))).items.map(r=>r.id)).toEqual((await get(new URLSearchParams('due=overdue&dueState=OVERDUE'))).items.map(r=>r.id))
  const mine=await get(new URLSearchParams('reviewQueue=mine&assignment=mine&assigneeId=spoof'))
  expect(mine.items).toHaveLength(5);expect(mine.items.every(r=>r.humanReview?.assignment?.assignee.userId==='admin')).toBe(true)
 })
 it.each(['voice','email','messaging','future-channel','no-such-channel',''])('matches stored channel %s identically on server and browser',async channel=>{
  const {get,rows}=await fixture(),q=new URLSearchParams(channel?{channel}:{})
  const expected=(await rows()).filter(r=>r.purpose!=='FORM_TEST'&&(!channel||r.channel===channel))
  expect((await get(q)).items.map(r=>r.id).sort()).toEqual(expected.map(r=>r.id).sort())
  expect((await rows()).filter(r=>matchesEvaluationFilters(r,q)).map(r=>r.id).sort()).toEqual(expected.map(r=>r.id).sort())
 })
 it('keeps Calibration disagreement cohort and direct evaluation detail authoritative',async()=>{
  const {get,base}=await fixture(),filters={form:'general_service@17',reviewQuestion:'greeting',comparison:'disagreements',reviewStatus:'REVIEWED',source:'genesys-cloud',agent:'Fixture',queue:'Customer',from:'2026-10-01',to:'2026-10-02'}
  const q=apiDates(evaluationExploreUrl(new URL('https://app.test/?assignment=mine&critical=yes&channel=email&question=old&cohort=analytics'),filters).searchParams)
  expect((await get(q)).items.map(r=>r.id).sort()).toEqual(['completed_one','completed_two'])
  const reply=await fetch(`${base}/api/evaluations/first?form=general_service@18&reviewStatus=REVIEWED`,{headers:{Authorization:'Bearer fixture'}})
  expect(reply.status).toBe(200);expect((await reply.json()).id).toBe('first')
 })
 it('retains honest bounded scans and pagination when matches lie beyond the 500 record window',async()=>{
  const {store,get}=await fixture(),sample=(await store.evaluations())[0]
  for(let i=0;i<510;i++)await store.putEvaluation({...sample,id:`a_${String(i).padStart(3,'0')}`,channel:'email'})
  await store.putEvaluation({...sample,id:'z_voice',channel:'voice'})
  const q=new URLSearchParams({channel:'voice'}),first=await get(q)
  expect(first.scanLimited).toBe(true);expect(first.scanned).toBe(500);expect(first.items).toHaveLength(0)
  q.set('cursor',first.nextCursor!);expect((await get(q)).items.some(r=>r.id==='z_voice')).toBe(true)
 })
})
