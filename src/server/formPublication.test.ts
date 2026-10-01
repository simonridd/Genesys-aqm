import { fixtureEvaluation } from '../fixtures/evaluationFixture'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createApi } from './api'
import { MemoryStore } from './store'
import { executeFormTest } from './formTests'
import type { RunnerDeps } from './runner'
import { genesysCustomerServiceForm } from '../domain/genesysForm'
import { isOperationalForm, transitionForm } from '../domain/formLifecycle'
import { sampleLibrary } from '../domain/conversations'
import type { EvaluationForm } from '../domain/types'

const servers: Server[] = []
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve())))) })
function fixture() {
  const store = new MemoryStore()
  const evaluate = vi.fn(async (request:import('../domain/types').EvaluationRequest) => fixtureEvaluation(request))
  const deps: RunnerDeps = {store, genesys:{list:async()=>{throw Error('unused')},load:async()=>{throw Error('unused')},withQueueNames:async items=>items},jev:{evaluate},now:()=>new Date('2026-10-01T00:00:00Z')}
  return {store,deps,evaluate}
}
describe('server recreated form publication', () => {
  it('publishes the existing draft in place without acknowledgement and accepts policy assignment',async()=>{
    const {store,deps}=fixture(),form={...structuredClone(genesysCustomerServiceForm),status:'DRAFT' as const,enabled:false,sourceReview:{status:'REVIEW_REQUIRED' as const}}
    await store.putForm(form)
    const server=createApi(deps,{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set(['allowed']),schedulerEmail:'fixture@example.com',schedulerAudience:'https://fixture'},async()=>new Response(JSON.stringify({id:'allowed'})))
    servers.push(server);await new Promise<void>(resolve=>server.listen(0,resolve))
    const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
    const call=(path:string,method:string,value:unknown,authorized=true)=>fetch(`${base}${path}`,{method,headers:{'Content-Type':'application/json',...(authorized?{Authorization:'Bearer fixture'}:{})},body:JSON.stringify(value)})
    const path=`/api/forms/${form.id}`,published=transitionForm(form,'PUBLISHED',deps.now().toISOString())
    expect((await call(path,'PUT',published,false)).status).toBe(401)
    expect((await call(path,'PUT',{...published,origin:undefined})).status).toBe(400)
    expect((await call(path,'PUT',{...published,questions:form.questions.map((q,i)=>i===0?{...q,type:'multi-select'}:q)})).status).toBe(400)
    expect((await call(path,'PUT',published)).status).toBe(200)
    expect(await store.form(form.id)).toEqual(published);expect(isOperationalForm((await store.form(form.id))!)).toBe(true)
    expect((await call('/api/policies/p','PUT',{id:'p',name:'P',description:'',enabled:true,criteria:{anyOf:[]},evaluationFormIds:[form.id]})).status).toBe(200)
    expect((await call(`${path}/source-review`,'POST',{acknowledged:true,form:published})).status).toBe(404)
    const forms=await (await fetch(`${base}/api/forms`,{headers:{Authorization:'Bearer another-browser'}})).json() as {items:EvaluationForm[]}
    expect(forms.items).toEqual([published]);expect(published.version).toBe(1);expect(published.questions).toEqual(form.questions)
  })
  it.each(['DRAFT','TESTING','PUBLISHED'] as const)('tests a reconstructed %s without production records, slots, or policy runs',async status=>{
    const {store,deps,evaluate}=fixture(), form={...structuredClone(genesysCustomerServiceForm),status}
    const reserve=vi.spyOn(store,'reserveEvaluation'),claim=vi.spyOn(store,'claim')
    const run=await executeFormTest(deps,{id:`sandbox_${status}`,form,source:'synthetic',selectedConversationIds:[sampleLibrary[0].conversation.conversationId],sampleConfiguration:{strategy:'manual',count:1}})
    expect(run.status).toBe('completed');expect(evaluate).toHaveBeenCalledTimes(1);expect(run.results[0].purpose).toBe('FORM_TEST');expect(run.formSnapshot.questions).toEqual(form.questions)
    expect(await store.evaluations()).toEqual([]);expect(await store.runs()).toEqual([]);expect(reserve).not.toHaveBeenCalled();expect(claim).not.toHaveBeenCalled()
  })
})
