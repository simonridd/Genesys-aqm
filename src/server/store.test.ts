import { seedAnswerSets } from '../domain/seedAnswerSets'
import { nextAnswerSetVersion, transitionAnswerSet } from '../domain/answerSets'
import { describe,it,expect } from 'vitest'
import type { Firestore } from 'firebase-admin/firestore'
import { seedGroupAssets } from '../domain/seedGroupAssets'
import { FirestoreStore } from './store'
import { isOperationalForm } from '../domain/formLifecycle'
import { seedForms } from '../domain/forms'
import { seedPolicies } from '../domain/policies'
import type { EvaluationRecord, PolicyRun } from '../domain/types'
import type { Schedule } from './schedules'
function fakeFirestore(){
  const values=new Map<string,unknown>()
  const validate=(value:unknown):void=>{
    if(Array.isArray(value)){expect(value.some(Array.isArray)).toBe(false);value.forEach(validate)}
    else if(value&&typeof value==='object')Object.values(value).forEach(validate)
  }
  const ref=(path:string)=>({get:async()=>({exists:values.has(path),data:()=>values.get(path)}),set:async(value:unknown)=>{validate(value);values.set(path,structuredClone(value))}})
  const collection=(name:string,filters:Array<[string,unknown]>=[],maximum=Infinity):unknown=>({doc:(id:string)=>ref(`${name}/${id}`),where:(field:string,_operator:string,value:unknown)=>collection(name,[...filters,[field,value]],maximum),limit:(n:number)=>collection(name,filters,n),get:async()=>({docs:[...values].filter(([key,value])=>key.startsWith(`${name}/`)&&filters.every(([field,expected])=>(value as Record<string,unknown>)[field]===expected)).slice(0,maximum).map(([key,value])=>({id:key.split('/')[1],data:()=>structuredClone(value)}))})})
  const db={collection,runTransaction:async<T>(fn:(tx:{get:(r:ReturnType<typeof ref>)=>ReturnType<ReturnType<typeof ref>['get']>;set:(r:ReturnType<typeof ref>,v:unknown)=>void;create:(r:ReturnType<typeof ref>,v:unknown)=>void;update:(r:ReturnType<typeof ref>,v:Record<string,unknown>)=>void})=>Promise<T>)=>fn({get:r=>r.get(),set:(r,v)=>{void r.set(v)},create:(r,v)=>{void r.set(v)},update:async(r,v)=>{const d=await r.get();await r.set({...d.data() as object,...v})}})}
  return db as unknown as Firestore
}
describe('Firestore repository shape',()=>{
  it('reads legacy sourceReview metadata as inert without recreating the record',async()=>{const db=fakeFirestore(),store=new FirestoreStore(db),legacy={...structuredClone(seedForms.at(-1)!),sourceReview:{status:'REVIEW_REQUIRED' as const}};await store.putForm(legacy);const anotherBrowser=new FirestoreStore(db);const loaded=(await anotherBrowser.form(legacy.id))!;expect(loaded).toEqual(legacy);expect(isOperationalForm(loaded)).toBe(true);expect(await anotherBrowser.forms()).toHaveLength(1)})

  it('serializes forms, policies, schedules, runs, records and claims',async()=>{
    const store=new FirestoreStore(fakeFirestore());const form=seedForms[0],policy=seedPolicies[0]
    const schedule:Schedule={id:'schedule',policyId:policy.id,enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',version:1}
    const run:PolicyRun={id:'run',policyId:policy.id,policySnapshot:policy,source:'genesys-cloud',startedAt:'2026-09-30T00:00:00Z',candidateConversationCount:0,matchedConversationCount:0,formsAssigned:[],evaluationsRequested:0,evaluationsSucceeded:0,evaluationsFailed:0,status:'completed',failures:[]}
    const record:EvaluationRecord={id:'evaluation',source:'jev',conversationId:'conversation',conversationSource:'genesys-cloud',agent:{id:'agent',name:'Agent'},queue:'Queue',channel:'voice',topic:'',policyMatches:[],form,evaluatedAt:'2026-09-30T00:00:00Z',overallScore:1,passed:true,criticalFailures:[],questions:[],provider:'typesafe',model:'test'}
    await store.putForm(form);await store.putPolicy(policy);await store.putSchedule(schedule);await store.putRun(run)
    expect(await store.forms()).toEqual([form]);expect(await store.policy(policy.id)).toEqual(policy);expect(await store.schedules()).toEqual([schedule]);expect(await store.runs()).toEqual([run])
    expect(await store.claim('claim','owner','2026-09-30T00:00:00Z','2026-09-30T01:00:00Z')).toBe(true)
    expect(await store.claim('claim','other','2026-09-30T00:30:00Z','2026-09-30T01:30:00Z')).toBe(false)
    expect(await store.reserveEvaluation(record.id,'2026-09-30T00:00:00Z')).toBe(true)
    expect(await store.reserveEvaluation(record.id,'2026-09-30T00:00:00Z')).toBe(false)
    await store.completeEvaluation(record.id,record)
    expect(await store.evaluationSlot(record.id)).toMatchObject({status:'completed',recordId:record.id})
    expect(await store.evaluations()).toEqual([record])
  })
})

it('persists reusable assets transactionally and preserves published immutable snapshots across store instances',async()=>{const db=fakeFirestore(),store=new FirestoreStore(db),asset=structuredClone(seedGroupAssets[0]);await store.putGroupAsset(asset);expect(await new FirestoreStore(db).groupAsset(asset.id)).toEqual(asset);await expect(store.putGroupAsset({...asset,name:'Mutated published asset'})).rejects.toThrow('immutable');await expect(store.putGroupAsset({...asset,id:'duplicate_family_version'})).rejects.toThrow('already exists');expect(await store.groupAsset(asset.id)).toEqual(asset)})

it('persists Answer Set family guards and immutable lifecycle transactionally across store instances',async()=>{const db=fakeFirestore(),store=new FirestoreStore(db),a={...structuredClone(seedAnswerSets[1]),status:'DRAFT' as const},now='2026-10-03T00:00:00.000Z';await store.putAnswerSet(a);expect((await db.collection('answerSetFamilies').doc(a.familyId).get()).data()).toEqual({familyId:a.familyId,type:a.type,versions:{'1':a.id}});const published=transitionAnswerSet(a,'PUBLISHED',now);await store.putAnswerSet(published);expect(await new FirestoreStore(db).answerSet(a.id)).toEqual(published);await expect(store.putAnswerSet({...published,name:'Changed'})).rejects.toThrow('immutable');await expect(store.putAnswerSet({...a,id:'duplicate'})).rejects.toThrow('already exists');await expect(store.putAnswerSet({...nextAnswerSetVersion(a,[a],now),type:'score'})).rejects.toThrow('base type');await store.putAnswerSet(transitionAnswerSet(published,'RETIRED',now));expect((await store.answerSet(a.id))?.options).toEqual(a.options)})
