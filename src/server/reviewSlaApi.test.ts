import { it,expect } from 'vitest'
import type { AddressInfo } from 'node:net'
import { MemoryStore } from './store'
import { createApi } from './api'
import type { RunnerDeps } from './runner'
import { buildReview } from '../domain/reviews'
import { reviewFixture,reviewInput } from '../fixtures/reviewFixture'
import { defaultGovernance } from '../domain/governance'
const now='2026-10-02T12:00:00.000Z',owner={userId:'owner'}
it('enforces SLA settings, manual refresh and bulk due permissions; serves health and globally sorted paged My queue without providers',async()=>{
 const store=new MemoryStore(),users=['owner','reviewer','author','viewer']
 for(const [id,role] of [['reviewer','REVIEWER'],['author','AUTHOR'],['viewer','VIEWER']])await store.atomic([{collection:'roleAssignments',id,expected:undefined,value:{id,userId:id,role}}])
 for(let i=0;i<55;i++){const id=`r${String(i).padStart(3,'0')}`,record=reviewFixture(id);await store.putEvaluation(record);await store.writeReviews([{review:{...buildReview(record,undefined,reviewInput(record,'request'),owner,now),assignment:{assignee:{userId:'reviewer'},assignedAt:now,assignedBy:owner,...(i===54?{dueAt:'2026-09-29T12:00:00Z'}:{})}},expectedRevision:0}])}
 const fail=async()=>{throw Error('NO PROVIDERS')},deps:RunnerDeps={store,now:()=>new Date(now),genesys:{list:fail,load:fail,withQueueNames:fail},jev:{evaluate:fail}}
 const server=createApi(deps,{origin:'https://example.com',region:'eu-west-1',allowedUserIds:new Set(users),bootstrapAdminId:'owner',schedulerEmail:'',schedulerAudience:''},async(_url,init)=>new Response(JSON.stringify({id:(init?.headers as Record<string,string>).Authorization.replace('Bearer ','')})))
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
 const call=(actor:string,path:string,method='GET',value?:unknown)=>fetch(base+path,{method,headers:{Authorization:`Bearer ${actor}`,'Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)})
 try{
  for(const actor of users.slice(1)){expect((await call(actor,'/api/governance','PUT',defaultGovernance)).status).toBe(403);expect((await call(actor,'/api/review-sla/refresh','POST',{})).status).toBe(403);expect((await call(actor,'/api/reviews/bulk-due','POST',{items:[{evaluationId:'r054',expectedRevision:1}],dueAt:null})).status).toBe(403)}
  expect((await call('owner','/api/governance','PUT',{...defaultGovernance,reviewSla:{dueSoonHours:0,overdueEscalationHours:48}})).status).toBe(400)
  expect((await call('owner','/api/governance','PUT',defaultGovernance)).status).toBe(200)
  const refresh=await call('owner','/api/review-sla/refresh','POST',{});expect(refresh.status).toBe(200);expect(await refresh.json()).toMatchObject({complete:true,open:55,escalated:1})
  const page=await (await call('reviewer','/api/evaluations?reviewQueue=mine&limit=50')).json();expect(page.items[0].id).toBe('r054');expect(page.items).toHaveLength(50);const second=await (await call('reviewer',`/api/evaluations?reviewQueue=mine&limit=50&cursor=${page.nextCursor}`)).json();expect(second.items).toHaveLength(5);expect(new Set([...page.items,...second.items].map(r=>r.id)).size).toBe(55)
  const health=await (await call('viewer','/api/monitoring-health')).json();expect(health.reviewWorkload).toMatchObject({open:55,escalated:1,complete:true});expect(health.reviewSlaSweep.complete).toBe(true)
  expect((await call('owner','/api/reviews/bulk-due','POST',{items:[{evaluationId:'r054',expectedRevision:0}],dueAt:null})).status).toBe(409)
  expect((await call('owner','/api/reviews/bulk-due','POST',{items:[{evaluationId:'r054',expectedRevision:1}],dueAt:null})).status).toBe(200)
  await call('owner','/api/review-sla/refresh','POST',{});expect(await store.alerts(true)).toHaveLength(0)
  const audit=(await store.query<any>('auditEvents',100)).items;expect(audit.some(e=>e.action==='retention.settings_changed')).toBe(true);expect(audit.some(e=>e.action==='review.bulk_due_changed')).toBe(true)
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()))}
})
