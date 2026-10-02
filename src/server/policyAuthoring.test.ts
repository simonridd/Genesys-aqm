import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createApi } from './api'
import { MemoryStore } from './store'
import { savePolicy } from './policyAuthoring'
import { newPolicy } from '../domain/policyAuthoring'
import { seedForms } from '../domain/forms'
import type { AuditEvent, RoleAssignment } from '../domain/governance'
import type { InteractionPolicy, PolicyRun } from '../domain/types'
import type { RunnerDeps } from './runner'
import type { Schedule } from './schedules'
const now='2026-10-02T09:00:00.000Z'
const valid=(id='p'):InteractionPolicy=>({...newPolicy(id),criteria:{anyOf:[[{field:'channel',operator:'equals',value:'voice'}]]},evaluationFormIds:[seedForms[0].id]})
const servers:Server[]=[]
afterEach(async()=>{await Promise.all(servers.splice(0).map(s=>new Promise<void>(r=>s.close(()=>r()))))})
async function fixture(){
 const store=new MemoryStore();await store.putForm(seedForms[0])
 for(const [id,role] of [['author','AUTHOR'],['viewer','VIEWER'],['reviewer','REVIEWER']] as const)await store.atomic([{collection:'roleAssignments',id,value:{id,role} as RoleAssignment,expected:undefined}])
 const deps:RunnerDeps={store,now:()=>new Date(now),genesys:{list:async()=>{throw Error('No live Genesys')},load:async()=>{throw Error('No live Genesys')},withQueueNames:async c=>c},jev:{evaluate:async()=>{throw Error('No paid Jev')}}}
 const server=createApi(deps,{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set(['owner','author','viewer','reviewer']),bootstrapAdminId:'owner',schedulerEmail:'scheduler',schedulerAudience:'https://fixture'},async(_url,init)=>new Response(JSON.stringify({id:(init?.headers as Record<string,string>).Authorization.replace('Bearer ','')})))
 servers.push(server);await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
 const call=(path:string,method='GET',value?:unknown,user='author')=>fetch(base+path,{method,headers:{Authorization:`Bearer ${user}`,'Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)})
 return {store,call}
}
describe('durable policy authoring API',()=>{
 it('commits semantic saves once, rejects stale tabs with 409 and preserves failed save state',async()=>{
  const {store,call}=await fixture(),p=valid()
  const put=(value:unknown)=>call('/api/policies/p','PUT',value)
  const created=await put({...p,expectedVersion:null});expect(created.status).toBe(200);const first=(await created.json()).item;expect(first.version).toBe(1)
  const edited={...first,name:'Edited'};expect((await store.policy('p'))!.version).toBe(1)
  const saved=await put({...edited,expectedVersion:1});expect(saved.status).toBe(200);expect((await saved.json()).item.version).toBe(2)
  const stable=await store.policy('p');expect((await put({...stable,expectedVersion:2,updatedAt:'fabricated'})).status).toBe(200);expect(await store.policy('p')).toEqual(stable)
  const stale=await put({...first,name:'Stale tab',expectedVersion:1});expect(stale.status).toBe(409);expect((await stale.json()).error).toBe('This policy changed elsewhere. Refresh before saving.')
  expect((await put({...stable,name:'',expectedVersion:2})).status).toBe(400);expect(await store.policy('p')).toEqual(stable)
  expect((await put({...stable,name:'No precondition'})).status).toBe(409)
 })
 it('uses atomic conflict detection for simultaneous saves and checks form pins transactionally',async()=>{
  const store=new MemoryStore();await store.putForm(seedForms[0]);await savePolicy(store,valid(),null,now)
  const results=await Promise.allSettled([savePolicy(store,{...valid(),name:'One'},1,now),savePolicy(store,{...valid(),name:'Two'},1,now)])
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect((await store.policy('p'))!.version).toBe(2)
  const atomic=store.atomic.bind(store);vi.spyOn(store,'atomic').mockImplementationOnce(async writes=>{await store.putForm({...seedForms[0],status:'RETIRED',enabled:false});await atomic(writes)})
  await expect(savePolicy(store,{...valid(),name:'Retired during save'},2,now)).rejects.toThrow('changed elsewhere')
 })
 it('preserves legacy versions, clones independently without operational children and emits concise audit',async()=>{
  const {store,call}=await fixture();const legacy={...valid(),version:17,enabled:true};await store.putPolicy(legacy)
  const s:Schedule={id:'legacy_schedule',policyId:'p',enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',version:1,nextDueAt:'next',lastAttemptedAt:'attempt',lastSuccessfulAt:'success'};await store.putSchedule(s)
  const result=await call('/api/policies/p/clone','POST',{});expect(result.status).toBe(201);const clone=(await result.json()).item
  expect(clone).toMatchObject({version:1,enabled:false,criteria:legacy.criteria,sampling:legacy.sampling,evaluationFormIds:legacy.evaluationFormIds});expect(clone.id).not.toBe('p');expect(clone.schedule).toBeUndefined();expect(await store.schedules()).toEqual([s]);expect(await store.runs()).toEqual([])
  expect((await call('/api/policies/p','PUT',{...legacy,name:'Explicit edit',expectedVersion:17})).status).toBe(200);expect((await store.policy('p'))!.version).toBe(18)
  const events=(await store.query<AuditEvent>('auditEvents',100)).items;expect(events.map(e=>e.action)).toContain('policy.cloned');expect(JSON.stringify(events)).not.toContain('voice')
 })
 it('enforces policy and schedule writes while allowing readers to page durable policies',async()=>{
  const {call}=await fixture()
  for(const user of ['viewer','reviewer'])for(const [path,method] of [['/api/policies/p','PUT'],['/api/policies/p/clone','POST'],['/api/schedules/schedule_p','PUT']])expect((await call(path,method,{},user)).status).toBe(403)
  expect((await call('/api/policies/p','PUT',{...valid(),expectedVersion:null})).status).toBe(200)
  expect((await call('/api/policies?limit=1','GET',undefined,'viewer')).status).toBe(200)
  expect((await call('/api/policies?limit=101')).status).toBe(400)
  expect((await call('/api/policies/p','DELETE')).status).toBe(404)
 })
 it('saves manual/daily/weekly schedules with derived due time, preserved metadata, no duplicate identity and separate boundaries',async()=>{
  const {store,call}=await fixture();await store.putPolicy(valid())
  const s:Schedule={id:'legacy_schedule',policyId:'p',enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',version:1,nextDueAt:'2026-10-03T01:00:00.000Z',lastAttemptedAt:'2026-10-01T01:00:00.000Z',lastSuccessfulAt:'2026-10-01T01:01:00.000Z'};await store.putSchedule(s)
  for(const frequency of ['WEEKLY','MANUAL','DAILY'] as const){const response=await call('/api/schedules/legacy_schedule','PUT',{...s,frequency,weekday:1,enabled:frequency!=='MANUAL',nextDueAt:'fabricated',lastAttemptedAt:'fake',lastSuccessfulAt:'fake'});expect(response.status).toBe(200);const item=(await response.json()).item;expect(item.id).toBe(s.id);expect(item.lastAttemptedAt).toBe(s.lastAttemptedAt);expect(item.lastSuccessfulAt).toBe(s.lastSuccessfulAt);expect(item.nextDueAt).not.toBe('fabricated');if(frequency==='MANUAL'){expect(item.enabled).toBe(false);expect(item.nextDueAt).toBeUndefined()}else expect(Date.parse(item.nextDueAt)).toBeGreaterThan(Date.parse(now))}
  expect((await call('/api/schedules/schedule_p','PUT',{...s,id:'schedule_p'})).status).toBe(409);expect(await store.schedules()).toHaveLength(1)
  const before=await store.schedule(s.id),p=await store.policy('p');expect((await call('/api/policies/p','PUT',{...p,enabled:true,expectedVersion:1})).status).toBe(200);const enabled=await store.policy('p');expect((await call('/api/policies/p','PUT',{...enabled,enabled:false,expectedVersion:2})).status).toBe(200);expect(await store.schedule(s.id)).toEqual(before)
  const actions=(await store.query<AuditEvent>('auditEvents',100)).items.map(e=>e.action);expect(actions).toEqual(expect.arrayContaining(['policy.enable','policy.disable','schedule.update','schedule.disable','schedule.enable']))
  expect((await call('/api/schedules/legacy_schedule','PUT',{...s,localTime:'99:99'})).status).toBe(400);expect(await store.schedule(s.id)).toEqual(before)
 })
 it('creates a single schedule despite concurrent creation requests and audits create/save',async()=>{
  const {store,call}=await fixture();expect((await call('/api/policies/p','PUT',{...valid(),expectedVersion:null})).status).toBe(200)
  const schedule={id:'schedule_p',policyId:'p',enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',version:1}
  const responses=await Promise.all([call('/api/schedules/schedule_p','PUT',schedule),call('/api/schedules/schedule_p','PUT',schedule)]);expect(responses.every(r=>[200,409].includes(r.status))).toBe(true);expect(await store.schedules()).toHaveLength(1)
  const actions=(await store.query<AuditEvent>('auditEvents',100)).items.map(e=>e.action);expect(actions).toContain('policy.create');expect(actions.filter(a=>a==='schedule.create')).toHaveLength(1)
 })
 it('loading authoring collections never migrates Daily Voice policy, schedule, snapshots or evaluations',async()=>{
  const {store,call}=await fixture();const daily={...valid('daily_voice_customer_service_aqm'),name:'Daily Voice Customer Service AQM',version:17};await store.putPolicy(daily)
  const schedule:Schedule={id:'original',policyId:daily.id,version:1,enabled:true,frequency:'DAILY',localTime:'02:00',timezone:'Europe/London',nextDueAt:now,lastAttemptedAt:now,lastSuccessfulAt:now};await store.putSchedule(schedule)
  const run={id:'historical',policyId:daily.id,policySnapshot:structuredClone(daily)} as PolicyRun;await store.putRun(run)
  const before={policies:await store.policies(),schedules:await store.schedules(),runs:await store.runs(),evaluations:await store.evaluations()}
  for(const path of ['/api/policies?limit=1','/api/schedules?limit=1','/api/forms?limit=1'])expect((await call(path)).status).toBe(200)
  expect({policies:await store.policies(),schedules:await store.schedules(),runs:await store.runs(),evaluations:await store.evaluations()}).toEqual(before)
 })
})
