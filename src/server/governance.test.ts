import { afterEach, describe, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createApi } from './api'
import { MemoryStore, FirestoreStore } from './store'
import { auditContext } from './audit'
import { defaultGovernance, rolePermissions, type AuditEvent, type RoleAssignment, type Role } from '../domain/governance'
import { auditPage, governanceSettings, sessionAccess, scanPurge, planPurge, executePurge } from './governance'
import { reviewFixture, reviewInput } from '../fixtures/reviewFixture'
import { buildReview } from '../domain/reviews'
import { seedForms } from '../domain/forms'
import { seedGroupAssets } from '../domain/seedGroupAssets'
import type { RunnerDeps } from './runner'
import type { Firestore } from 'firebase-admin/firestore'
const now='2026-10-01T12:00:00.000Z',old='2025-01-01T00:00:00.000Z',actor={userId:'owner',displayName:'Simon'}
const context={actor,now,correlationId:'fixture'}
const servers:Server[]=[]
afterEach(async()=>{await Promise.all(servers.splice(0).map(s=>new Promise<void>(r=>s.close(()=>r()))))})
async function fixture(){
 const store=new MemoryStore(),deps:RunnerDeps={store,now:()=>new Date(now),genesys:{list:async()=>{throw Error('No live Genesys')},load:async()=>{throw Error('No live Genesys')},withQueueNames:async c=>c},jev:{evaluate:async()=>{throw Error('No Jev')}}}
 const config={origin:'https://simonridd.github.io',region:'eu-west-1' as const,allowedUserIds:new Set(['owner','author','reviewer','viewer']),bootstrapAdminId:'owner',schedulerEmail:'scheduler',schedulerAudience:'https://example.com'}
 const server=createApi(deps,config,async(_url,init)=>{const userId=(init?.headers as Record<string,string>).Authorization.replace('Bearer ','');return new Response(JSON.stringify({id:userId,name:userId==='owner'?'Simon':userId}),{status:200})});servers.push(server);await new Promise<void>(r=>server.listen(0,r));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
 const call=(user:string,path:string,method='GET',value?:unknown)=>fetch(base+path,{method,headers:{...(user?{Authorization:`Bearer ${user}`}:{ }),'Content-Type':'application/json'},...(value!==undefined?{body:JSON.stringify(value)}:{})})
 for(const role of ['AUTHOR','REVIEWER','VIEWER'] as Role[])expect((await call('owner',`/api/roles/${role.toLowerCase()}`,'PUT',{role})).status).toBe(200)
 return {store,call}
}
describe('server-authoritative permissions',()=>{
 it('uses only the verified identity, preserves bootstrap and does not promote the first user',async()=>{
  const {store,call}=await fixture()
  expect((await (await call('owner','/api/session')).json()).role).toBe('ADMIN')
  expect((await sessionAccess(new MemoryStore(),{userId:'unknown'},'owner')).role).toBe('VIEWER')
  expect((await call('owner','/api/roles/owner','PUT',{role:'VIEWER'})).status).toBe(403)
  expect((await call('','/api/forms')).status).toBe(401);expect((await call('unknown','/api/forms')).status).toBe(401)
  expect((await call('viewer','/api/roles/viewer','PUT',{role:'ADMIN',userId:'owner'})).status).toBe(403)
  expect((await store.governanceRead<RoleAssignment>('roleAssignments','viewer'))?.role).toBe('VIEWER')
 })
 it('enforces every mutation family even when stale UI submits directly',async()=>{
  const {call}=await fixture(),paths=[['/api/forms/x','PUT'],['/api/question-groups/x','PUT'],['/api/policies/x','PUT'],['/api/schedules/x','PUT'],['/api/reviews/x','PUT'],['/api/evaluations/x/review','POST'],['/api/calibration/sample','POST'],['/api/alerts/x/acknowledge','POST'],['/api/alerts/x/resolve','POST'],['/api/evaluations/manual','POST'],['/api/form-tests/x','POST'],['/api/form-tests/x','DELETE'],['/api/governance','PUT'],['/api/retention/preview','POST'],['/api/retention/execute','POST'],['/api/roles/viewer','PUT']]
  for(const [path,method] of paths)expect((await call('viewer',path,method,{role:'ADMIN'})).status,`${method} ${path}`).toBe(403)
  for(const path of ['/api/forms','/api/policies','/api/evaluations','/api/analytics','/api/reviews','/api/governance'])expect((await call('viewer',path)).status,path).toBe(200)
  for(const path of ['/api/audit','/api/roles','/api/history?resourceType=role&resourceId=owner'])expect((await call('viewer',path)).status).toBe(403)
 })
 it('author publishes assets but cannot review or manage governance; reviewer reviews but cannot author',async()=>{
  const {store,call}=await fixture(),form={...structuredClone(seedForms[0]),id:'f',status:'DRAFT',enabled:false}
  expect((await call('author','/api/forms/f','PUT',form)).status).toBe(200)
  expect((await call('reviewer','/api/forms/f','PUT',form)).status).toBe(403)
  for(const path of ['/api/roles','/api/audit'])expect((await call('author',path)).status).toBe(403)
  expect((await call('author','/api/reviews/e','PUT',{})).status).toBe(403)
  const e=reviewFixture('e');await store.putEvaluation(e)
  expect((await call('reviewer','/api/reviews/e','PUT',reviewInput(e,'request'))).status).toBe(200)
  expect((await call('author','/api/history?resourceType=form&resourceId=f')).status).toBe(200)
  expect((await call('author','/api/history?resourceType=role&resourceId=author')).status).toBe(403)
  expect((await call('author','/api/alerts/missing/resolve','POST')).status).toBe(403)
  expect(rolePermissions.AUTHOR).toContain('alerts.acknowledge')
 })
 it('role changes take effect on the next request and cannot be overridden by browser role claims',async()=>{
  const {call}=await fixture();expect((await call('viewer','/api/forms/x','PUT',{})).status).toBe(403)
  expect((await call('owner','/api/roles/viewer','PUT',{role:'AUTHOR'})).status).toBe(200)
  expect((await call('viewer','/api/forms/x','PUT',{})).status).toBe(400)
  expect((await call('owner','/api/roles/viewer','PUT',{role:'VIEWER'})).status).toBe(200)
  expect((await call('viewer','/api/forms/x','PUT',{role:'ADMIN'})).status).toBe(403)
 })
 it('sole configured owner is bootstrap admin without assignments, multiple users need explicit owner',async()=>{
  const store=new MemoryStore();expect((await sessionAccess(store,actor,'owner')).role).toBe('ADMIN')
  expect((await sessionAccess(store,actor)).role).toBe('VIEWER')
  await store.atomic([{collection:'roleAssignments',id:'owner',value:{id:'owner',role:'VIEWER'},expected:undefined}]);expect((await sessionAccess(store,actor,'owner')).role).toBe('ADMIN')
 })
})
describe('append-only server audit',()=>{
 it('records form/group publications, policies, schedules, role and settings changes with safe actor metadata',async()=>{
  const {store,call}=await fixture(),form={...structuredClone(seedForms[0]),id:'f',familyId:'f',status:'DRAFT',enabled:false}
  expect((await call('author','/api/forms/f','PUT',form)).status).toBe(200)
  expect((await call('author','/api/forms/f','PUT',{...form,status:'PUBLISHED',enabled:true})).status).toBe(200)
  const group={...structuredClone(seedGroupAssets[0]),id:'g',familyId:'g',status:'DRAFT'}
  expect((await call('author','/api/question-groups/g','PUT',group)).status).toBe(200)
  expect((await call('author','/api/question-groups/g','PUT',{...group,status:'PUBLISHED'})).status).toBe(200)
  const policy={id:'p',name:'Private transcript DO-NOT-AUDIT',description:'secret transcript',enabled:false,version:1,evaluationFormIds:['f'],criteria:{anyOf:[[{field:'channel',operator:'equals',value:'voice'}]]}}
  expect((await call('author','/api/policies/p','PUT',{...policy,expectedVersion:null})).status).toBe(200)
  expect((await call('author','/api/policies/p','PUT',{...policy,description:'updated',expectedVersion:1})).status).toBe(200)
  const s={id:'schedule_p',policyId:'p',enabled:false,frequency:'MANUAL',timezone:'Europe/London',localTime:'02:00',version:1}
  expect((await call('author','/api/schedules/schedule_p','PUT',s)).status).toBe(200)
  expect((await call('author','/api/schedules/schedule_p','PUT',{...s,localTime:'03:00'})).status).toBe(200)
  expect((await call('owner','/api/governance','PUT',defaultGovernance)).status).toBe(200)
  const events=(await store.query<AuditEvent>('auditEvents',100)).items,actions=events.map(e=>e.action)
  expect(actions).toEqual(expect.arrayContaining(['role.assign','form.publish','group.publish','policy.update','schedule.update','retention.settings_changed']))
  const publication=events.find(e=>e.action==='form.publish')!;expect(publication.actor).toEqual({userId:'author',displayName:'author'});expect(publication.resourceVersion).toBe(1)
  expect(JSON.stringify(events)).not.toMatch(/DO-NOT-AUDIT|secret transcript|Bearer|accessToken/)
  expect((await call('owner','/api/audit','POST',{action:'fake'})).status).toBe(404)
  expect((await call('owner',`/api/audit/${publication.id}`,'DELETE')).status).toBe(403)
  await expect(store.atomic([{collection:'auditEvents',id:publication.id,value:{...publication,summary:'edit'},expected:publication}])).rejects.toThrow('append-only')
 })
 it('records the complete review lifecycle and alert transitions',async()=>{
  const {store,call}=await fixture(),e=reviewFixture('e');await store.putEvaluation(e)
  for(const [i,action] of (['request','start','save','complete'] as const).entries())expect((await call('reviewer','/api/reviews/e','PUT',reviewInput(e,action,i))).status).toBe(200)
  const a=await store.upsertAlert({dedupKey:'fixture',type:'SCHEDULED_RUN_FAILED',severity:'ERROR',title:'Failed',message:'No raw content',source:'scheduled-run',metadata:{}},now)
  expect((await call('author',`/api/alerts/${a.id}/acknowledge`,'POST')).status).toBe(200)
  expect((await call('owner',`/api/alerts/${a.id}/resolve`,'POST')).status).toBe(200)
  const actions=(await store.query<AuditEvent>('auditEvents',100)).items.map(e=>e.action)
  expect(actions).toEqual(expect.arrayContaining(['review.requested','review.started','review.saved','review.completed','alert.acknowledge','alert.resolve']))
 })
 it('bounds, paginates and filters audit queries without logging reads',async()=>{
  const {store,call}=await fixture(),before=(await store.query('auditEvents',100)).items.length
  const a=await (await call('owner','/api/audit?limit=1')).json();expect(a.items).toHaveLength(1);expect(a.nextCursor).toBeTruthy()
  const b=await (await call('owner',`/api/audit?limit=1&cursor=${a.nextCursor}`)).json();expect(b.items[0].id).not.toBe(a.items[0].id)
  const c=await auditPage(store,new URLSearchParams({actor:'owner',resourceType:'role',action:'role.assign',from:'2026-10-01',to:'2026-10-02'}));expect(c.items).toHaveLength(3);expect(c.scanned).toBeLessThanOrEqual(500)
  expect((await call('owner','/api/audit?limit=101')).status).toBe(400);expect((await store.query('auditEvents',100)).items.length).toBe(before)
 })
 it('Firestore mutation rolls back when audit creation fails',async()=>{
  const data=new Map<string,unknown>(),db={collection:(name:string)=>({doc:(id:string)=>({path:`${name}/${id}`})}),runTransaction:async(fn:(tx:unknown)=>Promise<unknown>)=>{const staged=new Map(data);await fn({get:async(ref:{path:string})=>({exists:staged.has(ref.path),data:()=>staged.get(ref.path)}),set:(ref:{path:string},v:unknown)=>staged.set(ref.path,v),create:()=>{throw Error('Audit write unavailable')}});data.clear();for(const [k,v] of staged)data.set(k,v)}} as unknown as Firestore
  const store=new FirestoreStore(db)
  await expect(auditContext.run(context,()=>store.putForm(seedForms[0]))).rejects.toThrow('Audit write unavailable');expect(data.size).toBe(0)
 })
})
describe('retention safety',()=>{
 async function data(){const store=new MemoryStore(),e={...reviewFixture('e'),evaluatedAt:old};await store.putEvaluation(e);await store.writeReviews([{review:buildReview(e,undefined,reviewInput(e),actor,old),expectedRevision:0}]);return {store,e}}
 it('defaults to indefinite and preview never mutates product records',async()=>{
  const {store}=await data();expect(await governanceSettings(store)).toEqual(defaultGovernance)
  const scan=await scanPurge(store,defaultGovernance,now);expect(scan.writes).toHaveLength(0)
  const plan=await auditContext.run(context,()=>planPurge(store,actor,now));expect(plan.counts.evaluations).toBe(0);expect(await store.evaluation('e')).toBeTruthy();expect(await store.review('e')).toBeTruthy()
 })
 it('rechecks the plan, requires confirmation, deletes evaluation+review together and preserves purge evidence',async()=>{
  const {store}=await data(),settings={...defaultGovernance,evaluationRetentionDays:365};await store.atomic([{collection:'governanceSettings',id:'governance',value:settings,expected:undefined}])
  const plan=await auditContext.run(context,()=>planPurge(store,actor,now));expect(plan.counts).toMatchObject({evaluations:1,reviews:1})
  await expect(auditContext.run(context,()=>executePurge(store,actor,now,plan.id,'no'))).rejects.toThrow('confirmation')
  await auditContext.run(context,()=>executePurge(store,actor,now,plan.id,'PURGE'));expect(await store.evaluation('e')).toBeUndefined();expect(await store.review('e')).toBeUndefined()
  expect((await auditContext.run(context,()=>executePurge(store,actor,now,plan.id,'PURGE'))).alreadyExecuted).toBe(true)
  expect((await store.query<AuditEvent>('auditEvents',100)).items.map(e=>e.action)).toEqual(expect.arrayContaining(['retention.purge_planned','retention.purge_executed']))
 })
 it('rejects changed data/settings, expired previews, different actors and forged preview IDs',async()=>{
  const {store,e}=await data(),settings={...defaultGovernance,evaluationRetentionDays:1};await store.atomic([{collection:'governanceSettings',id:'governance',value:settings,expected:undefined}])
  const plan=await auditContext.run(context,()=>planPurge(store,actor,now));await store.putEvaluation({...e,queue:'changed'})
  await expect(auditContext.run(context,()=>executePurge(store,actor,now,plan.id,'PURGE'))).rejects.toThrow('changed')
  await expect(auditContext.run(context,()=>executePurge(store,{userId:'other'},now,plan.id,'PURGE'))).rejects.toThrow('identity')
  await expect(auditContext.run(context,()=>executePurge(store,actor,now,'forged','PURGE'))).rejects.toThrow('Preview')
  const fresh=await auditContext.run(context,()=>planPurge(store,actor,now));await store.atomic([{collection:'governanceSettings',id:'governance',value:{...settings,evaluationRetentionDays:null},expected:settings}])
  await expect(auditContext.run(context,()=>executePurge(store,actor,now,fresh.id,'PURGE'))).rejects.toThrow('changed')
  await expect(auditContext.run(context,()=>executePurge(store,actor,'2026-10-02T12:00:00.000Z',fresh.id,'PURGE'))).rejects.toThrow('changed')
 })
 it('protects OPEN and ACKNOWLEDGED alerts; only old resolved alerts qualify',async()=>{
  const store=new MemoryStore(),input={dedupKey:'open',type:'SCHEDULER_STALE' as const,severity:'WARNING' as const,title:'Stale',message:'No activity',source:'scheduler' as const,metadata:{}}
  const open=await store.upsertAlert(input,old),ack=await store.upsertAlert({...input,dedupKey:'ack'},old),resolved=await store.upsertAlert({...input,dedupKey:'resolved'},old)
  await store.transitionAlert(ack.id,'ACKNOWLEDGED',old,actor);await store.transitionAlert(resolved.id,'RESOLVED',old,actor)
  const scan=await scanPurge(store,{...defaultGovernance,alertRetentionDays:1},now);expect(scan.counts.alerts).toBe(1);expect(scan.writes[0].id).toBe(resolved.id);expect(await store.alert(open.id)).toBeTruthy()
 })
 it('limits batches and supports continuation; old audit can expire but new purge events survive',async()=>{
  const {store,e}=await data();for(let i=0;i<80;i++)await store.putEvaluation({...e,id:`e_${i.toString().padStart(3,'0')}`})
  const settings={...defaultGovernance,evaluationRetentionDays:1,auditRetentionDays:1};await store.atomic([{collection:'governanceSettings',id:'governance',value:settings,expected:undefined}])
  await auditContext.run({...context,now:old},()=>store.putForm(seedForms[0]))
  const plan=await auditContext.run(context,()=>planPurge(store,actor,now));expect(plan.counts.evaluations).toBe(50);expect(plan.complete).toBe(false);expect(plan.scanned).toBeLessThanOrEqual(250)
  await auditContext.run(context,()=>executePurge(store,actor,now,plan.id,'PURGE'));expect((await store.evaluations())).toHaveLength(31)
  const next=await auditContext.run(context,()=>planPurge(store,actor,now,plan.continuation));await auditContext.run(context,()=>executePurge(store,actor,now,next.id,'PURGE'));expect((await store.evaluations())).toHaveLength(0)
  const events=(await store.query<AuditEvent>('auditEvents',100)).items;expect(events.some(e=>e.occurredAt===old)).toBe(false);expect(events.filter(e=>e.action==='retention.purge_executed')).toHaveLength(2)
 })
 it('query-derived calibration reflects remaining records and reviews cannot reappear after purge',async()=>{
  const {store}=await data();const {calibrationAnalytics,updateReview}=await import('./reviews');expect((await calibrationAnalytics(store,new URLSearchParams())).metrics.evaluationsReviewed).toBe(1)
  const settings={...defaultGovernance,evaluationRetentionDays:1};await store.atomic([{collection:'governanceSettings',id:'governance',value:settings,expected:undefined}]);const plan=await auditContext.run(context,()=>planPurge(store,actor,now));await auditContext.run(context,()=>executePurge(store,actor,now,plan.id,'PURGE'))
  expect((await calibrationAnalytics(store,new URLSearchParams())).metrics.evaluationsReviewed).toBe(0)
  await expect(updateReview(store,'e',{action:'request',expectedRevision:0,formId:'f',formVersion:1},actor,now)).rejects.toThrow('not found')
 })
})
describe('purge commit concurrency guards',()=>{
 it('rejects a dependent review added between scan and transaction commit',async()=>{
  const store=new MemoryStore(),e={...reviewFixture('concurrent'),evaluatedAt:old},settings={...defaultGovernance,evaluationRetentionDays:1};await store.putEvaluation(e);await store.atomic([{collection:'governanceSettings',id:'governance',value:settings,expected:undefined}])
  const plan=await auditContext.run(context,()=>planPurge(store,actor,now)),atomic=store.atomic.bind(store)
  store.atomic=async(writes,events)=>{if(writes.some(w=>w.collection==='evaluationRecords'))await store.writeReviews([{review:buildReview(e,undefined,reviewInput(e),actor,now),expectedRevision:0}]);return atomic(writes,events)}
  await expect(auditContext.run(context,()=>executePurge(store,actor,now,plan.id,'PURGE'))).rejects.toThrow('changed');expect(await store.evaluation(e.id)).toBeTruthy();expect(await store.review(e.id)).toBeTruthy()
 })
 it('rejects retention settings changed after recalculation but before commit',async()=>{
  const store=new MemoryStore(),e={...reviewFixture('concurrent'),evaluatedAt:old},settings={...defaultGovernance,evaluationRetentionDays:1};await store.putEvaluation(e);await store.atomic([{collection:'governanceSettings',id:'governance',value:settings,expected:undefined}])
  const plan=await auditContext.run(context,()=>planPurge(store,actor,now)),atomic=store.atomic.bind(store)
  store.atomic=async(writes,events)=>{if(writes.some(w=>w.collection==='evaluationRecords'))await atomic([{collection:'governanceSettings',id:'governance',value:defaultGovernance,expected:settings}]);return atomic(writes,events)}
  await expect(auditContext.run(context,()=>executePurge(store,actor,now,plan.id,'PURGE'))).rejects.toThrow('changed');expect(await store.evaluation(e.id)).toBeTruthy()
 })
})
