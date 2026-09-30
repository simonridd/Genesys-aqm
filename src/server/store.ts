import type { EvaluationForm, EvaluationRecord, InteractionPolicy, PolicyRun } from '../domain/types'
import type { Schedule } from './schedules'
import type { Firestore } from 'firebase-admin/firestore'

export interface Claim { id: string; owner: string; leaseUntil: string; status: 'running' | 'completed'; claimedAt: string }
export interface EvaluationSlot { id: string; status: 'started' | 'completed'; startedAt: string; recordId?: string }
export interface Store {
  forms(): Promise<EvaluationForm[]>; policies(): Promise<InteractionPolicy[]>; schedules(): Promise<Schedule[]>; runs(): Promise<PolicyRun[]>; evaluations(): Promise<EvaluationRecord[]>
  form(id: string): Promise<EvaluationForm | undefined>; policy(id: string): Promise<InteractionPolicy | undefined>; schedule(id: string): Promise<Schedule | undefined>
  putForm(value: EvaluationForm): Promise<void>; putPolicy(value: InteractionPolicy): Promise<void>; putSchedule(value: Schedule): Promise<void>
  putRun(value: PolicyRun): Promise<void>; putEvaluation(value: EvaluationRecord): Promise<void>
  claim(id: string, owner: string, now: string, leaseUntil: string): Promise<boolean>; completeClaim(id: string, owner: string): Promise<void>; releaseClaim(id:string,owner:string):Promise<void>
  reserveEvaluation(id: string, now: string): Promise<boolean>; evaluationSlot(id: string): Promise<EvaluationSlot | undefined>; completeEvaluation(id: string, record: EvaluationRecord): Promise<void>
}
const copy = <T>(value: T): T => structuredClone(value)
export class MemoryStore implements Store {
  private formMap = new Map<string,EvaluationForm>(); private policyMap = new Map<string,InteractionPolicy>(); private scheduleMap = new Map<string,Schedule>()
  private runMap = new Map<string,PolicyRun>(); private evaluationMap = new Map<string,EvaluationRecord>(); private claimMap = new Map<string,Claim>(); private slots = new Map<string,EvaluationSlot>()
  async forms() { return copy([...this.formMap.values()]) } async policies() { return copy([...this.policyMap.values()]) } async schedules() { return copy([...this.scheduleMap.values()]) }
  async runs() { return copy([...this.runMap.values()]) } async evaluations() { return copy([...this.evaluationMap.values()]) }
  async form(id:string) { return copy(this.formMap.get(id)) } async policy(id:string) { return copy(this.policyMap.get(id)) } async schedule(id:string) { return copy(this.scheduleMap.get(id)) }
  async putForm(v:EvaluationForm) { this.formMap.set(v.id,copy(v)) } async putPolicy(v:InteractionPolicy) { this.policyMap.set(v.id,copy(v)) } async putSchedule(v:Schedule) { this.scheduleMap.set(v.id,copy(v)) }
  async putRun(v:PolicyRun) { this.runMap.set(v.id,copy(v)) } async putEvaluation(v:EvaluationRecord) { this.evaluationMap.set(v.id,copy(v)) }
  async claim(id:string,owner:string,now:string,leaseUntil:string) { const old=this.claimMap.get(id); if (old && (old.status==='completed' || old.leaseUntil>now)) return false; this.claimMap.set(id,{id,owner,claimedAt:now,leaseUntil,status:'running'}); return true }
  async completeClaim(id:string,owner:string) { const v=this.claimMap.get(id); if (v?.owner===owner) v.status='completed' }
  async releaseClaim(id:string,owner:string) { const v=this.claimMap.get(id);if(v?.owner===owner&&v.status==='running')v.leaseUntil='1970-01-01T00:00:00.000Z' }
  async reserveEvaluation(id:string,now:string) { if (this.slots.has(id)) return false; this.slots.set(id,{id,status:'started',startedAt:now}); return true }
  async evaluationSlot(id:string) { return copy(this.slots.get(id)) }
  async completeEvaluation(id:string,record:EvaluationRecord) { const slot=this.slots.get(id); if (!slot) throw new Error('Evaluation was not reserved.'); await this.putEvaluation(record); slot.status='completed'; slot.recordId=record.id }
}
function pathId(value:string) { if (!/^[A-Za-z0-9_-]{1,180}$/.test(value)) throw new Error('Invalid resource ID.'); return value }
const nestedArrayKey='__aqmNestedArrayV1'
function firestoreValue(value:unknown, arrayElement=false):unknown {
  if(Array.isArray(value)) {
    const items=value.map(item=>firestoreValue(item,true))
    return arrayElement?{[nestedArrayKey]:items}:items
  }
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,firestoreValue(item)]))
  return value
}
function canonicalValue(value:unknown):unknown {
  if(Array.isArray(value))return value.map(canonicalValue)
  if(value&&typeof value==='object'){
    const entries=Object.entries(value)
    if(entries.length===1&&entries[0][0]===nestedArrayKey&&Array.isArray(entries[0][1]))return entries[0][1].map(canonicalValue)
    return Object.fromEntries(entries.map(([key,item])=>[key,canonicalValue(item)]))
  }
  return value
}
const stored=(value:unknown)=>firestoreValue(JSON.parse(JSON.stringify(value))) as object
export class FirestoreStore implements Store {
  constructor(private readonly db: Firestore) {}
  private collection(name:string) { return this.db.collection(name) }
  private async all<T>(name:string):Promise<T[]> { const docs=await this.collection(name).get(); return docs.docs.map(d=>canonicalValue(d.data()) as T) }
  private async one<T>(name:string,id:string):Promise<T|undefined> { const doc=await this.collection(name).doc(pathId(id)).get(); return doc.exists?canonicalValue(doc.data()) as T:undefined }
  private async put<T>(name:string,id:string,value:T) { await this.collection(name).doc(pathId(id)).set(stored(value)) }
  forms(){return this.all<EvaluationForm>('evaluationForms')} policies(){return this.all<InteractionPolicy>('policies')} schedules(){return this.all<Schedule>('schedules')}
  runs(){return this.all<PolicyRun>('policyRuns')} evaluations(){return this.all<EvaluationRecord>('evaluationRecords')}
  form(id:string){return this.one<EvaluationForm>('evaluationForms',id)} policy(id:string){return this.one<InteractionPolicy>('policies',id)} schedule(id:string){return this.one<Schedule>('schedules',id)}
  putForm(v:EvaluationForm){return this.put('evaluationForms',v.id,v)} putPolicy(v:InteractionPolicy){return this.put('policies',v.id,v)} putSchedule(v:Schedule){return this.put('schedules',v.id,v)}
  putRun(v:PolicyRun){return this.put('policyRuns',v.id,v)} putEvaluation(v:EvaluationRecord){return this.put('evaluationRecords',v.id,v)}
  async claim(id:string,owner:string,now:string,leaseUntil:string) { const ref=this.collection('scheduleExecutionClaims').doc(pathId(id)); return this.db.runTransaction(async tx=>{const doc=await tx.get(ref);const old=doc.data() as Claim|undefined;if(old&&(old.status==='completed'||old.leaseUntil>now))return false;tx.set(ref,{id,owner,claimedAt:now,leaseUntil,status:'running'} satisfies Claim);return true}) }
  async completeClaim(id:string,owner:string) { const ref=this.collection('scheduleExecutionClaims').doc(pathId(id));await this.db.runTransaction(async tx=>{const doc=await tx.get(ref);if(doc.data()?.owner===owner)tx.update(ref,{status:'completed'})}) }
  async releaseClaim(id:string,owner:string) { const ref=this.collection('scheduleExecutionClaims').doc(pathId(id));await this.db.runTransaction(async tx=>{const doc=await tx.get(ref);if(doc.data()?.owner===owner&&doc.data()?.status==='running')tx.update(ref,{leaseUntil:'1970-01-01T00:00:00.000Z'})}) }
  async reserveEvaluation(id:string,now:string) { const ref=this.collection('evaluationSlots').doc(pathId(id));return this.db.runTransaction(async tx=>{const doc=await tx.get(ref);if(doc.exists)return false;tx.create(ref,{id,status:'started',startedAt:now} satisfies EvaluationSlot);return true}) }
  evaluationSlot(id:string){return this.one<EvaluationSlot>('evaluationSlots',id)}
  async completeEvaluation(id:string,record:EvaluationRecord) { const slot=this.collection('evaluationSlots').doc(pathId(id));const result=this.collection('evaluationRecords').doc(pathId(record.id));await this.db.runTransaction(async tx=>{const doc=await tx.get(slot);if(!doc.exists)throw new Error('Evaluation was not reserved.');tx.set(result,stored(record));tx.update(slot,{status:'completed',recordId:record.id})}) }
}
