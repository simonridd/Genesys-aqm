import { afterEach,describe,expect,it } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { Firestore } from 'firebase-admin/firestore'
import { createApi } from './api'
import { FirestoreStore, MemoryStore } from './store'
import { updateReview, requestSample } from './reviews'
import type { RunnerDeps } from './runner'
import { reviewFixture, reviewInput, fixtureAnswers } from '../fixtures/reviewFixture'
import type { HumanReview } from '../domain/reviews'
const now='2026-10-01T10:00:00.000Z',actor={userId:'verified-id',displayName:'Server Verified User'},servers:Server[]=[]
afterEach(async()=>{await Promise.all(servers.splice(0).map(server=>new Promise<void>(resolve=>server.close(()=>resolve()))))})
async function fixture(){
  const store=new MemoryStore(),record=reviewFixture();await store.putEvaluation(record)
  const deps:RunnerDeps={store,now:()=>new Date(now),genesys:{list:async()=>{throw Error('Genesys data MUST NOT be fetched')},load:async()=>{throw Error('Transcript MUST NOT be fetched')},withQueueNames:async()=>{throw Error('No provider calls')}},jev:{evaluate:async()=>{throw Error('Jev MUST NOT be called')}}}
  const server=createApi(deps,{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set([actor.userId]),schedulerEmail:'scheduler@example.com',schedulerAudience:'https://example.com'},async(_url,init)=>new Response(JSON.stringify((init?.headers as Record<string,string>).Authorization==='Bearer valid-token'?{id:actor.userId,name:actor.displayName}:{id:'denied'})))
  servers.push(server);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve))
  const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`,headers={Authorization:'Bearer valid-token','Content-Type':'application/json'}
  const put=(input:unknown,id=record.id)=>fetch(`${base}/api/reviews/${id}`,{method:'PUT',headers,body:JSON.stringify(input)})
  const get=(path:string)=>fetch(`${base}${path}`,{headers})
  return {store,record,put,get,base,headers}
}
describe('server review authority without provider calls',()=>{
  it('creates, saves, completes, persists verified identity and leaves original AI record byte-identical',async()=>{
    const {record,store,put,get}=await fixture(),before=JSON.stringify(await store.evaluation(record.id))
    const requested=await put({...reviewInput(record,'request'),reviewer:{userId:'spoof',displayName:'Invented'},transcript:'MUST NOT PERSIST',overallScore:1});expect(requested.status).toBe(200)
    expect((await requested.json() as {item:HumanReview}).item.events[0].actor).toEqual(actor)
    expect((await put(reviewInput(record,'start',1))).status).toBe(200)
    expect((await put({...reviewInput(record,'save',2),answers:fixtureAnswers.slice(0,1)})).status).toBe(200)
    expect((await put({...reviewInput(record,'complete',3),answers:[]})).status).toBe(400)
    const complete=await put(reviewInput(record,'complete',3));expect(complete.status).toBe(200)
    const review=(await complete.json() as {item:HumanReview}).item;expect(review.reviewer).toEqual(actor);expect(review.revision).toBe(4)
    expect(JSON.stringify(review)).not.toMatch(/spoof|Invented|transcript|valid-token|rawResponse|messages/)
    expect(JSON.stringify(await store.evaluation(record.id))).toBe(before)
    expect((await get(`/api/reviews/${record.id}`)).status).toBe(200)
    expect((await get('/api/reviews?reviewStatus=REVIEWED')).status).toBe(200)
    const page=await (await get('/api/evaluations?reviewStatus=REVIEWED')).json() as {items:Array<{humanReview:HumanReview}>};expect(page.items[0].humanReview.revision).toBe(4)
    const quality=await (await get('/api/analytics')).json() as {metrics:{averageScore:number}};expect(quality.metrics.averageScore).toBe(record.overallScore)
    const calibration=await (await get('/api/calibration')).json() as {metrics:{evaluationsReviewed:number}};expect(calibration.metrics.evaluationsReviewed).toBe(1)
    expect((await put(reviewInput(record,'save',4))).status).toBe(400)
  })
  it('rejects missing/unauthorized caller, fabricated evaluation, form mismatch and invalid question',async()=>{
    const {put,base,record}=await fixture()
    expect((await fetch(`${base}/api/reviews/${record.id}`,{method:'PUT',body:JSON.stringify(reviewInput(record))})).status).toBe(401)
    expect((await fetch(`${base}/api/reviews`,{headers:{Authorization:'Bearer denied'}})).status).toBe(401)
    expect((await put(reviewInput(record),'fabricated')).status).toBe(404)
    expect((await put({...reviewInput(record),formId:'fake'})).status).toBe(400)
    expect((await put({...reviewInput(record),answers:[{questionId:'fake',value:'Yes'}]})).status).toBe(400)
    expect((await put({...reviewInput(record),expectedRevision:undefined})).status).toBe(400)
  })
  it('returns 409 for two tabs racing and preserves the winning note/audit event',async()=>{
    const {put,record,store}=await fixture()
    const responses=await Promise.all(['first','second'].map(notes=>put({...reviewInput(record,'save'),notes})))
    expect(responses.map(response=>response.status).sort()).toEqual([200,409])
    const stale=await put({...reviewInput(record,'save'),notes:'stale'});expect(stale.status).toBe(409);expect(await stale.text()).toContain('Refresh')
    const review=await store.review(record.id);expect(review!.notes).not.toBe('stale');expect(review!.revision).toBe(1);expect(review!.events.filter(e=>e.kind==='review_saved')).toHaveLength(1)
  })
  it('keeps Mark for review without allowing the legacy endpoint to claim reviewed',async()=>{
    const {base,headers,record,store}=await fixture(),before=await store.evaluation(record.id)
    const post=(state:string)=>fetch(`${base}/api/evaluations/${record.id}/review`,{method:'POST',headers,body:JSON.stringify({state,expectedRevision:0})})
    expect((await post('REVIEWED')).status).toBe(400);expect((await post('REVIEW_REQUESTED')).status).toBe(200)
    expect((await store.review(record.id))?.status).toBe('REVIEW_REQUESTED');expect(await store.evaluation(record.id)).toEqual(before)
  })
  it('selects existing evaluations only, defaulting to real and obeying the 20 cap',async()=>{
    const {base,headers,store,record,get}=await fixture()
    for(let i=0;i<22;i++)await store.putEvaluation({...record,id:`real_${i}`})
    await store.putEvaluation({...record,id:'demo',source:'synthetic-demo',conversationSource:undefined})
    const post=(input:unknown)=>fetch(`${base}/api/calibration/sample`,{method:'POST',headers,body:JSON.stringify(input)})
    expect((await post({count:21,strategy:'recent'})).status).toBe(400)
    const sampled=await post({count:20,strategy:'deterministic',seed:'test'});expect(sampled.status).toBe(200)
    const body=await sampled.json() as {items:HumanReview[];selected:number};expect(body.selected).toBe(20);expect(body.items.every(r=>r.source==='genesys-cloud')).toBe(true)
    expect((await store.evaluations())).toHaveLength(24)
    expect((await (await get('/api/review-queue?reviewStatus=REVIEW_REQUESTED')).json() as {items:unknown[]}).items).toHaveLength(20)
    expect((await (await get('/api/review-queue?source=synthetic')).json() as {items:unknown[]}).items).toHaveLength(1)
  })
  it('refuses misleading complete calibration results beyond the bounded scan',async()=>{
    const {store,record,get}=await fixture();for(let i=0;i<2000;i++)await store.putEvaluation({...record,id:`extra_${i}`})
    const response=await get('/api/calibration');expect(response.status).toBe(400);expect(await response.text()).toContain('limit of 2000')
  })
})
it('sample persistence is atomic if any review has changed since selection',async()=>{
  class RacingStore extends MemoryStore {
    async writeReviews(writes:Parameters<MemoryStore['writeReviews']>[0]){
      if(writes.length>1){await super.writeReviews([writes[0]]);await super.writeReviews(writes);return}
      return super.writeReviews(writes)
    }
  }
  const store=new RacingStore();for(const id of ['first','second'])await store.putEvaluation(reviewFixture(id))
  await expect(requestSample(store,{count:2,strategy:'recent'},actor,now)).rejects.toThrow('Refresh')
  expect(await store.review('first')).toBeDefined();expect(await store.review('second')).toBeUndefined()
})
it('Firestore transaction enforces revisions and stores reviews in a separate collection',async()=>{
  const documents=new Map<string,unknown>(),writes:string[]=[]
  const ref=(path:string)=>({path,get:async()=>({exists:documents.has(path),data:()=>documents.get(path)})})
  const db={collection:(name:string)=>({doc:(id:string)=>ref(`${name}/${id}`)}),getAll:async(...refs:Array<ReturnType<typeof ref>>)=>Promise.all(refs.map(r=>r.get())),runTransaction:async(fn:(tx:unknown)=>Promise<unknown>)=>{
    const pending=new Map<string,unknown>()
    const result=await fn({get:async(ref:{path:string})=>({data:()=>documents.get(ref.path)}),set:(ref:{path:string},value:unknown)=>pending.set(ref.path,value)})
    for(const [path,value] of pending){documents.set(path,value);writes.push(path)}return result
  }} as unknown as Firestore
  const store=new FirestoreStore(db),memory=new MemoryStore(),record=reviewFixture();await memory.putEvaluation(record)
  const review=await updateReview(memory,record.id,reviewInput(record,'save'),actor,now)
  await store.writeReviews([{review,expectedRevision:0}]);expect(writes).toEqual([`humanReviews/${record.id}`])
  await expect(store.writeReviews([{review,expectedRevision:0}])).rejects.toThrow('Refresh')
  expect(await store.review(record.id)).toEqual(JSON.parse(JSON.stringify(review)));expect(await store.reviewsByIds([record.id,'absent'])).toHaveLength(1)
  const second={...review,id:'second',evaluationId:'second'}
  await expect(store.writeReviews([{review:second,expectedRevision:0},{review,expectedRevision:0}])).rejects.toThrow('Refresh')
  expect(await store.review('second')).toBeUndefined()
  expect(writes).toHaveLength(1);expect(JSON.stringify(documents.get(`humanReviews/${record.id}`))).not.toMatch(/messages|transcript|token/)
})
