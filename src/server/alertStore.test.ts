import { it,expect } from 'vitest'
import type { Firestore } from 'firebase-admin/firestore'
import { FirestoreStore } from './store'
const now='2026-10-01T12:00:00Z'
// Serial transaction fixture exercises the actual Firestore adapter's pointer and record writes.
function fixture(){
 const data=new Map<string,unknown>();let pending:Promise<unknown>=Promise.resolve()
 const db={collection:(name:string)=>({doc:(id:string)=>({path:`${name}/${id}`})}),runTransaction:<T>(fn:(tx:{get:(ref:{path:string})=>Promise<{exists:boolean;data:()=>unknown}>;set:(ref:{path:string},value:unknown)=>void;create:(ref:{path:string},value:unknown)=>void})=>Promise<T>)=>{
  const execute=()=>fn({get:async ref=>({exists:data.has(ref.path),data:()=>structuredClone(data.get(ref.path))}),set:(ref,value)=>{data.set(ref.path,structuredClone(value))},create:(ref,value)=>{if(data.has(ref.path))throw Error('Already exists');data.set(ref.path,structuredClone(value))}})
  const result=pending.then(execute);pending=result.catch(()=>{});return result
 }} as unknown as Firestore
 return {store:new FirestoreStore(db),data}
}
it('Firestore deduplication uses a transactional active pointer and preserves resolved history',async()=>{
 const {store,data}=fixture(),input={dedupKey:'SCHEDULER_STALE:global',type:'SCHEDULER_STALE' as const,severity:'WARNING' as const,title:'Stale scheduler',message:'No activity',source:'scheduler' as const,metadata:{toleranceMs:10800000}}
 const results=await Promise.all(Array.from({length:5},()=>store.upsertAlert(input,now)))
 expect(new Set(results.map(r=>r.id)).size).toBe(1);const id=results[0].id
 expect([...data.keys()].filter(k=>k.startsWith('operationalAlerts/'))).toHaveLength(1)
 await store.transitionAlert(id,'ACKNOWLEDGED',now,{userId:'operator'})
 expect((await store.upsertAlert(input,now)).status).toBe('ACKNOWLEDGED')
 await store.transitionAlert(id,'RESOLVED',now,{userId:'operator'})
 const fresh=await store.upsertAlert(input,now);expect(fresh.id).not.toBe(id)
 expect([...data.keys()].filter(k=>k.startsWith('operationalAlerts/'))).toHaveLength(2)
 expect([...data.keys()].filter(k=>k.startsWith('notificationEvents/'))).toHaveLength(3)
 expect((data.get(`operationalAlerts/${id}`) as {resolvedBy:{userId:string}}).resolvedBy.userId).toBe('operator')
})
it('Firestore records scheduler activity in an independent document without writing schedules',async()=>{
 const {store,data}=fixture();await store.recordSchedulerHealth(now,false);await store.recordSchedulerHealth('2026-10-01T13:00:00Z',true)
 expect(data.size).toBe(1);expect(data.get('operationalHealth/scheduler')).toEqual({initializedAt:now,lastSuccessfulTickAt:'2026-10-01T13:00:00Z'})
})
