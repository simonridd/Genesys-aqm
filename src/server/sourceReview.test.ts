import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createApi } from './api'
import { MemoryStore } from './store'
import { executeFormTest } from './formTests'
import type { RunnerDeps } from './runner'
import { genesysCustomerServiceForm } from '../domain/genesysForm'
import { sourceReviewRequired, transitionForm } from '../domain/formLifecycle'
import { sampleLibrary } from '../domain/conversations'
import type { EvaluationForm } from '../domain/types'

const servers: Server[] = []
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve())))) })
function fixture() {
  const store = new MemoryStore()
  const evaluate = vi.fn(async () => ({ conversationId:'fixture',scorecardId:genesysCustomerServiceForm.id,scorecardVersion:1,evaluatedAt:'2026-10-01T00:00:00Z',provider:'typesafe' as const,model:'fixture',questions:[],overallScore:.8,countedWeight:1,rawResponse:{} }))
  const deps: RunnerDeps = {store, genesys:{list:async()=>{throw Error('unused')},load:async()=>{throw Error('unused')},withQueueNames:async items=>items},jev:{evaluate},now:()=>new Date('2026-10-01T00:00:00Z')}
  return {store,deps,evaluate}
}
describe('server source review', () => {
  it('requires explicit authenticated acknowledgement, persists it and enforces publication/policy readiness', async () => {
    const {store,deps}=fixture(), form={...structuredClone(genesysCustomerServiceForm),enabled:true}
    await store.putForm(form) // Existing legacy Firestore record: no sourceReview.
    const server=createApi(deps,{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set(['allowed']),schedulerEmail:'fixture@example.com',schedulerAudience:'https://fixture'},async()=>new Response(JSON.stringify({id:'allowed'})))
    servers.push(server);await new Promise<void>(resolve=>server.listen(0,resolve))
    const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
    const call=(path:string,method:string,value:unknown,authorized=true)=>fetch(`${base}${path}`,{method,headers:{'Content-Type':'application/json',...(authorized?{Authorization:'Bearer fixture'}:{})},body:JSON.stringify(value)})
    const path=`/api/forms/${form.id}`, reviewPath=`${path}/source-review`
    const published={...form,status:'PUBLISHED',enabled:true}
    expect((await call(path,'PUT',published)).status).toBe(400)
    expect((await call(path,'PUT',{...published,sourceReview:{status:'REVIEWED'}})).status).toBe(400)
    expect(sourceReviewRequired((await store.form(form.id))!)).toBe(true)
    expect((await call(reviewPath,'POST',{acknowledged:true,form},false)).status).toBe(401)
    expect((await call(reviewPath,'POST',{acknowledged:false,form})).status).toBe(400)
    expect((await call(reviewPath,'POST',{acknowledged:true,form:{...form,name:'Stale definition'}})).status).toBe(400)
    const reordered={...form,questions:form.questions.map(question=>Object.fromEntries(Object.entries(question).reverse()))}
    const response=await call(reviewPath,'POST',{acknowledged:true,form:reordered});expect(response.status).toBe(200)
    const reviewed=(await response.json() as {item:EvaluationForm}).item
    expect(await store.form(form.id)).toEqual(reviewed)
    expect(reviewed.status).toBe('DRAFT');expect(reviewed.enabled).toBe(false)
    expect(reviewed).toMatchObject({origin:form.origin,sourceFormId:form.sourceFormId,questions:form.questions,sourceReview:{status:'REVIEWED',reviewedAt:deps.now().toISOString()}})
    const policy={id:'p',name:'P',description:'',enabled:true,criteria:{anyOf:[]},evaluationFormIds:[form.id]}
    expect((await call('/api/policies/p','PUT',policy)).status).toBe(400)
    // PUT cannot remove provenance or bypass supported question validation.
    expect((await call(path,'PUT',{...reviewed,origin:undefined})).status).toBe(400)
    expect((await call(path,'PUT',{...published,questions:form.questions.map((q,i)=>i===0?{...q,type:'multi-select'}:q)})).status).toBe(400)
    expect((await call(path,'PUT',transitionForm(reviewed,'PUBLISHED',deps.now().toISOString()))).status).toBe(200)
    expect((await call('/api/policies/p','PUT',policy)).status).toBe(200)
    const forms=await (await fetch(`${base}/api/forms`,{headers:{Authorization:'Bearer another-browser'}})).json() as {items:EvaluationForm[]}
    expect(forms.items).toHaveLength(1);expect(forms.items[0].sourceReview?.status).toBe('REVIEWED')
  })
  it('invalidates review when an editable definition changes, even when a caller sends REVIEWED',async()=>{
    const {store,deps}=fixture(),form={...structuredClone(genesysCustomerServiceForm),status:'TESTING' as const,sourceReview:{status:'REVIEWED' as const,reviewedAt:deps.now().toISOString()}}
    await store.putForm(form)
    const server=createApi(deps,{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set(['allowed']),schedulerEmail:'fixture@example.com',schedulerAudience:'https://fixture'},async()=>new Response(JSON.stringify({id:'allowed'})))
    servers.push(server);await new Promise<void>(resolve=>server.listen(0,resolve))
    const response=await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/forms/${form.id}`,{method:'PUT',headers:{Authorization:'Bearer fixture','Content-Type':'application/json'},body:JSON.stringify({...form,name:'Reviewed definition changed'})})
    expect(response.status).toBe(200);expect(sourceReviewRequired((await store.form(form.id))!)).toBe(true)
  })
  it.each(['DRAFT','TESTING'] as const)('tests an unreviewed reconstructed %s without production records, slots, or policy runs',async status=>{
    const {store,deps,evaluate}=fixture(), form={...structuredClone(genesysCustomerServiceForm),status}
    const reserve=vi.spyOn(store,'reserveEvaluation'),claim=vi.spyOn(store,'claim')
    const run=await executeFormTest(deps,{id:`sandbox_${status}`,form,source:'synthetic',selectedConversationIds:[sampleLibrary[0].conversation.conversationId],sampleConfiguration:{strategy:'manual',count:1}})
    expect(run.status).toBe('completed');expect(evaluate).toHaveBeenCalledTimes(1);expect(run.results[0].purpose).toBe('FORM_TEST');expect(run.formSnapshot.questions).toEqual(form.questions)
    expect(await store.evaluations()).toEqual([]);expect(await store.runs()).toEqual([]);expect(reserve).not.toHaveBeenCalled();expect(claim).not.toHaveBeenCalled()
  })
})
