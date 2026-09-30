import { afterEach,describe,it,expect } from 'vitest'
import { createApi } from './api'
import { MemoryStore } from './store'
import type { RunnerDeps } from './runner'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { seedForms } from '../domain/forms'
import type { Conversation, InteractionPolicy } from '../domain/types'
const servers:Server[]=[]
afterEach(async()=>{await Promise.all(servers.splice(0).map(server=>new Promise<void>(resolve=>server.close(()=>resolve()))))})
async function fixture(){const store=new MemoryStore();const deps:RunnerDeps={store,genesys:{list:async()=>({conversations:[],page:1,pageSize:25,total:0,hasMore:false}),load:async()=>{throw Error('no')},withQueueNames:async c=>c},jev:{evaluate:async()=>{throw Error('no')}},now:()=>new Date('2026-09-30T00:00:00Z')};const server=createApi(deps,{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set(['allowed']),schedulerEmail:'aqm-scheduler@example.com',schedulerAudience:'https://aqm.example.com'},async()=>new Response(JSON.stringify({id:'allowed'}),{status:200}));servers.push(server);await new Promise<void>(resolve=>server.listen(0,resolve));return `http://127.0.0.1:${(server.address() as AddressInfo).port}`}
describe('AQM API authorization',()=>{
  it('allows only the configured Pages origin for CORS and requires user auth',async()=>{const base=await fixture();const good=await fetch(`${base}/api/policies`,{method:'OPTIONS',headers:{Origin:'https://simonridd.github.io'}});expect(good.status).toBe(204);expect(good.headers.get('access-control-allow-origin')).toBe('https://simonridd.github.io');const bad=await fetch(`${base}/api/policies`,{method:'OPTIONS',headers:{Origin:'https://evil.example'}});expect(bad.status).toBe(403);expect(bad.headers.get('access-control-allow-origin')).toBeNull();expect((await fetch(`${base}/api/policies`)).status).toBe(401);expect((await fetch(`${base}/api/policies`,{headers:{Authorization:'Bearer token'}})).status).toBe(200)})
  it('does not accept browser bearer authorization on internal scheduler route',async()=>{const base=await fixture();const response=await fetch(`${base}/internal/scheduler/tick`,{method:'POST',headers:{Authorization:'Bearer browser-token'}});expect(response.status).toBe(403);expect(await response.text()).not.toContain('secret')})
  it('requires a fresh preview before manual server execution',async()=>{
    const store=new MemoryStore(),form=seedForms[0]
    const policy:InteractionPolicy={id:'policy',name:'Voice',description:'',enabled:true,version:1,criteria:{anyOf:[[{field:'channel',operator:'equals',value:'voice'}]]},evaluationFormIds:[form.id]}
    const conversation:Conversation={conversationId:'12345678-1234-1234-1234-123456789abc',startedAt:'2026-09-28T12:00:00Z',channel:'voice',agent:{id:'a',name:'Agent'},customer:{id:'b',name:'Customer'},metadata:{source:'genesys-cloud'},messages:[{id:'m',timestamp:'2026-09-28T12:00:01Z',speaker:'customer',text:'private transcript'}]}
    await store.putForm(form);await store.putPolicy(policy)
    const deps:RunnerDeps={store,genesys:{list:async()=>({conversations:[conversation],page:1,pageSize:25,total:1,hasMore:false}),load:async()=>conversation,withQueueNames:async c=>c},jev:{evaluate:async()=>({conversationId:conversation.conversationId,scorecardId:form.id,scorecardVersion:form.version,evaluatedAt:'2026-09-30T00:00:00Z',provider:'typesafe',model:'test',questions:[],overallScore:.8,countedWeight:1,rawResponse:{}})},now:()=>new Date('2026-09-30T00:00:00Z')}
    const server=createApi(deps,{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set(['allowed']),schedulerEmail:'aqm-scheduler@example.com',schedulerAudience:'https://aqm.example.com'},async()=>new Response(JSON.stringify({id:'allowed'}),{status:200}));servers.push(server);await new Promise<void>(resolve=>server.listen(0,resolve));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
    const period={periodStart:'2026-09-28T00:00:00Z',periodEnd:'2026-09-29T00:00:00Z'},headers={Authorization:'Bearer user-token','Content-Type':'application/json'}
    const post=(route:string,payload:unknown)=>fetch(`${base}${route}`,{method:'POST',headers,body:JSON.stringify(payload)})
    const preview=await post('/api/policies/policy/plan',{period});expect(preview.status).toBe(200);const plan=await preview.json() as {fingerprint:string;expectedEvaluations:number};expect(plan.expectedEvaluations).toBe(1)
    expect((await post('/api/policies/policy/run',{period,fingerprint:'wrong'})).status).toBe(409)
    const executed=await post('/api/policies/policy/run',{period,fingerprint:plan.fingerprint});expect(executed.status).toBe(200)
    expect((await store.evaluations())).toHaveLength(1);expect(JSON.stringify(await store.evaluations())).not.toContain('private transcript')
  })
})
