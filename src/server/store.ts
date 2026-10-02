import { alertNotificationEvent, type NotificationEvent, type NotificationDelivery } from '../domain/notifications'
import { openAlert, transitionAlert, type AlertInput, type AlertActor, type OperationalAlert, type SchedulerHealth } from '../domain/operationalAlerts'
import { isDeepStrictEqual } from 'node:util'
import { mutationAudits, auditContext } from './audit'
import type { AuditEvent } from '../domain/governance'
import { createHash } from 'node:crypto'
import { assertAssetWrite } from '../domain/groupAssets'
import type { HumanReview } from '../domain/reviews'
import type { EvaluationForm, EvaluationRecord, FormTestRun, InteractionPolicy, PolicyRun, QuestionGroupAsset } from '../domain/types'
import type { Schedule } from './schedules'
import type { Firestore } from 'firebase-admin/firestore'

const slaKey=(value:string)=>createHash('sha256').update(value).digest('hex')

export interface Claim { id: string; owner: string; leaseUntil: string; status: 'running' | 'completed'; claimedAt: string }
export interface EvaluationSlot { id: string; status: 'started' | 'completed'; startedAt: string; recordId?: string; providerRequestCount?: number }
export interface AtomicWrite {collection:CollectionName; id:string; value?:unknown; expected:unknown;checkOnly?:boolean}
export class StoreConflict extends Error {constructor(){super('Data changed. Preview or refresh again.')}}
export type CollectionName = 'operationalHealth' | 'notificationDestinationHealth' | 'notificationControl' | 'notificationDestinations' | 'notificationRules' | 'notificationDeliveries' | 'notificationEvents' | 'schedules' | 'roleAssignments' | 'governanceSettings' | 'auditEvents' | 'purgePlans' | 'evaluationForms' | 'policies' | 'policyRuns' | 'evaluationRecords' | 'formTestRuns' | 'humanReviews' | 'questionGroupAssets' | 'operationalAlerts'
export interface QueryPage<T> { items: T[]; nextCursor?: string; scanned: number }
export interface HealthSnapshot { recentRuns: PolicyRun[]; runCounts: { completed: number; partial: number; failed: number } }
export interface ReviewWrite { review: HumanReview; expectedRevision: number }
export class ReviewConflict extends Error { constructor(){super('Review changed in another tab or by another reviewer. Refresh before saving.')} }
export interface Store {
  activeReviewPage(limit:number,cursor?:string):Promise<QueryPage<HumanReview>>
  activeAlertPage(limit:number,cursor?:string):Promise<QueryPage<OperationalAlert>>
  syncReviewSla(id:string,expected:HumanReview|undefined,input:AlertInput|undefined,now:string,reason:string):Promise<void>

  notificationWork(kind:'events',now:string,limit:number):Promise<NotificationEvent[]>
  notificationWork(kind:'deliveries',now:string,limit:number):Promise<NotificationDelivery[]>
  notificationHistory(alertId?:string,destinationId?:string,limit?:number,cursor?:string):Promise<QueryPage<NotificationDelivery>>
  notificationHealth(now:string):Promise<import('../domain/notifications').NotificationHealth>

  governanceRead<T>(collection:CollectionName,id:string):Promise<T|undefined>
  atomic(writes:AtomicWrite[],events?:AuditEvent[]):Promise<void>

  alert(id:string):Promise<OperationalAlert|undefined>; alerts(activeOnly?:boolean):Promise<OperationalAlert[]>
  upsertAlert(input:AlertInput,now:string):Promise<OperationalAlert>
  transitionAlert(id:string,action:'ACKNOWLEDGED'|'RESOLVED',now:string,actor?:AlertActor):Promise<OperationalAlert|undefined>
  schedulerHealth():Promise<SchedulerHealth|undefined>; recordSchedulerHealth(now:string,successful:boolean):Promise<SchedulerHealth>

  groupAsset(id:string):Promise<QuestionGroupAsset|undefined>; putGroupAsset(asset:QuestionGroupAsset):Promise<void>
  recordProviderRequest(id:string,count:number):Promise<void>
  review(id:string):Promise<HumanReview|undefined>; reviewsByIds(ids:string[]):Promise<HumanReview[]>
  writeReviews(writes:ReviewWrite[]):Promise<void>
  findProductionEvaluation(source:string, conversationId:string, formId:string, version:number):Promise<EvaluationRecord|undefined>
  forms(): Promise<EvaluationForm[]>; policies(): Promise<InteractionPolicy[]>; schedules(): Promise<Schedule[]>; runs(): Promise<PolicyRun[]>; evaluations(): Promise<EvaluationRecord[]>
  form(id: string): Promise<EvaluationForm | undefined>; policy(id: string): Promise<InteractionPolicy | undefined>; schedule(id: string): Promise<Schedule | undefined>; run(id:string):Promise<PolicyRun|undefined>; evaluation(id:string):Promise<EvaluationRecord|undefined>
  putForm(value: EvaluationForm): Promise<void>; putPolicy(value: InteractionPolicy): Promise<void>; putSchedule(value: Schedule): Promise<void>
  putRun(value: PolicyRun): Promise<void>; putEvaluation(value: EvaluationRecord): Promise<void>
  claim(id: string, owner: string, now: string, leaseUntil: string): Promise<boolean>; completeClaim(id: string, owner: string): Promise<void>; releaseClaim(id:string,owner:string):Promise<void>
  reserveEvaluation(id: string, now: string): Promise<boolean>; evaluationSlot(id: string): Promise<EvaluationSlot | undefined>; completeEvaluation(id: string, record: EvaluationRecord): Promise<void>
  query<T>(collection:CollectionName, limit:number, cursor?:string):Promise<QueryPage<T>>
  healthSnapshot():Promise<HealthSnapshot>
  evaluationsByIds(ids:string[]):Promise<EvaluationRecord[]>
  formTestRun(id:string):Promise<FormTestRun|undefined>; createFormTestRun(run:FormTestRun):Promise<boolean>; putFormTestRun(run:FormTestRun):Promise<void>; deleteFormTestRun(id:string):Promise<void>
  recentFormTestRuns(limit:number):Promise<FormTestRun[]>
}
const reactivateSla=(alert:OperationalAlert,now:string):OperationalAlert=>({...alert,status:'OPEN',updatedAt:now,resolvedAt:undefined,resolvedBy:undefined,resolutionReason:undefined,events:[...alert.events,{action:'OPENED',at:now,automatic:true,reason:'Review SLA stage became active again after settings changed.'}]})
const copy = <T>(value: T): T => structuredClone(value)
export class MemoryStore implements Store {
  private governanceMaps = {operationalHealth:new Map<string,unknown>(),notificationDestinationHealth:new Map<string,unknown>(),notificationControl:new Map<string,unknown>(),notificationDestinations:new Map<string,unknown>(),notificationRules:new Map<string,unknown>(),notificationDeliveries:new Map<string,unknown>(),notificationEvents:new Map<string,unknown>(),roleAssignments:new Map<string,unknown>(),governanceSettings:new Map<string,unknown>(),auditEvents:new Map<string,unknown>(),purgePlans:new Map<string,unknown>()}
  private maps(){return {...this.governanceMaps,evaluationForms:this.formMap,policies:this.policyMap,schedules:this.scheduleMap,policyRuns:this.runMap,evaluationRecords:this.evaluationMap,formTestRuns:this.testMap,humanReviews:this.reviewMap,questionGroupAssets:this.assetMap,operationalAlerts:this.alertMap}}
  async governanceRead<T>(collection:CollectionName,id:string){return copy(this.maps()[collection].get(id)) as T|undefined}
  private audit(collection:string,id:string,next:unknown,prior?:unknown){for(const e of mutationAudits(collection,id,next,prior))this.governanceMaps.auditEvents.set(e.id,copy(e))}
  async atomic(writes:AtomicWrite[],events:AuditEvent[]=[]){
    for(const w of writes){if(w.collection==='auditEvents'&&w.value!==undefined)throw Error('Audit is append-only.');if(!isDeepStrictEqual(this.maps()[w.collection].get(w.id),w.expected))throw new StoreConflict()}
    for(const e of events)if(this.governanceMaps.auditEvents.has(e.id))throw Error('Audit already exists.')
    for(const w of writes){if(w.checkOnly)continue;const map=this.maps()[w.collection] as Map<string,unknown>;if(w.value===undefined)map.delete(w.id);else{this.audit(w.collection,w.id,w.value,w.expected);map.set(w.id,copy(w.value))}}
    for(const e of events)this.governanceMaps.auditEvents.set(e.id,copy(e))
  }

  async notificationWork(kind:'events',now:string,limit:number):Promise<NotificationEvent[]>
  async notificationWork(kind:'deliveries',now:string,limit:number):Promise<NotificationDelivery[]>
  async notificationWork(kind:'events'|'deliveries',now:string,limit:number):Promise<any[]> {
    return copy([...this.governanceMaps[kind==='events'?'notificationEvents':'notificationDeliveries'].values()].filter(v=>{const row=v as NotificationEvent&NotificationDelivery;return kind==='events'?!row.routed:!!row.nextAttemptAt&&row.nextAttemptAt<=now}).sort((a:any,b:any)=>(a.nextAttemptAt??a.createdAt).localeCompare(b.nextAttemptAt??b.createdAt)).slice(0,limit))
  }
  async notificationHistory(alertId?:string,destinationId?:string,limit=50,cursor?:string){const rows=([...this.governanceMaps.notificationDeliveries.values()] as NotificationDelivery[]).filter(v=>(!alertId||v.alertId===alertId)&&(!destinationId||v.destinationId===destinationId)&&(!cursor||v.id>cursor)).sort((a,b)=>a.id.localeCompare(b.id));return {items:copy(rows.slice(0,limit)),scanned:Math.min(rows.length,limit),nextCursor:rows.length>limit?rows[limit-1].id:undefined}}
  async notificationHealth(now:string){const rows=[...this.governanceMaps.notificationDeliveries.values()] as NotificationDelivery[];return {pending:rows.filter(d=>d.state==='PENDING'||d.state==='RETRYING').length,failed24h:rows.filter(d=>d.state==='FAILED'&&d.updatedAt>=new Date(Date.parse(now)-86400000).toISOString()).length,lastSuccessfulAt:rows.filter(d=>d.deliveredAt).map(d=>d.deliveredAt!).sort().at(-1)??null}}

  private reviewAlertKeys=new Map<string,{alertId?:string}>()
  async activeReviewPage(limit:number,cursor?:string){const rows=[...this.reviewMap.values()].filter(r=>['REVIEW_REQUESTED','IN_REVIEW'].includes(r.status)&&(!cursor||r.id>cursor)).sort((a,b)=>a.id.localeCompare(b.id));return {items:copy(rows.slice(0,limit)),scanned:Math.min(rows.length,limit),nextCursor:rows.length>limit?rows[limit-1].id:undefined}}
  async activeAlertPage(limit:number,cursor?:string){const rows=[...this.alertMap.values()].filter(r=>r.status!=='RESOLVED'&&(!cursor||r.id>cursor)).sort((a,b)=>a.id.localeCompare(b.id));return {items:copy(rows.slice(0,limit)),scanned:Math.min(rows.length,limit),nextCursor:rows.length>limit?rows[limit-1].id:undefined}}
  async syncReviewSla(id:string,expected:HumanReview|undefined,input:AlertInput|undefined,now:string,reason:string){
    if(!isDeepStrictEqual(this.reviewMap.get(id),expected))throw new StoreConflict()
    const currentKey=slaKey(`REVIEW_CURRENT:${id}`),stageKey=input?slaKey(input.dedupKey):undefined
    const oldId=this.reviewAlertKeys.get(currentKey)?.alertId,stage=stageKey?this.reviewAlertKeys.get(stageKey):undefined
    const old=oldId?this.alertMap.get(oldId):undefined
    if(old&&old.status!=='RESOLVED'&&old.dedupKey!==input?.dedupKey){const next={...transitionAlert(old,'RESOLVED',now),resolutionReason:reason};next.events[next.events.length-1].reason=reason;this.alertMap.set(next.id,copy(next));const event=alertNotificationEvent(next,'RESOLVED',now);if(!this.governanceMaps.notificationEvents.has(event.id))this.governanceMaps.notificationEvents.set(event.id,copy(event))}
    if(input&&stageKey&&!stage){const next={...openAlert(undefined,input,now),id:`review_${stageKey}`};this.alertMap.set(next.id,copy(next));this.reviewAlertKeys.set(stageKey,{alertId:next.id});const event=alertNotificationEvent(next,'OPEN',now);if(!this.governanceMaps.notificationEvents.has(event.id))this.governanceMaps.notificationEvents.set(event.id,copy(event))}
    const seen=stage?.alertId?this.alertMap.get(stage.alertId):undefined
    if(input&&seen?.status==='RESOLVED'&&seen.events.at(-1)?.automatic)this.alertMap.set(seen.id,copy(reactivateSla(seen,now)))
    this.reviewAlertKeys.set(currentKey,{...(input&&stageKey?{alertId:stage?.alertId??`review_${stageKey}`}:{})})
  }
  private alertMap=new Map<string,OperationalAlert>(); private schedulerState?:SchedulerHealth
  async alert(id:string){return copy(this.alertMap.get(id))}
  async alerts(activeOnly=false){return copy([...this.alertMap.values()].filter(a=>!activeOnly||a.status!=='RESOLVED'))}
  async upsertAlert(input:AlertInput,now:string){const prior=[...this.alertMap.values()].find(a=>a.dedupKey===input.dedupKey&&a.status!=='RESOLVED');const alert=openAlert(prior,input,now);this.alertMap.set(alert.id,copy(alert));if(!prior){const e=alertNotificationEvent(alert,'OPEN',now);this.governanceMaps.notificationEvents.set(e.id,copy(e))}return copy(alert)}
  async transitionAlert(id:string,action:'ACKNOWLEDGED'|'RESOLVED',now:string,actor?:AlertActor){const prior=this.alertMap.get(id);if(!prior)return;const next=transitionAlert(prior,action,now,actor);this.audit('operationalAlerts',id,next,prior);this.alertMap.set(id,copy(next));if(prior.status!=='RESOLVED'&&next.status==='RESOLVED'){const e=alertNotificationEvent(next,'RESOLVED',now);if(!this.governanceMaps.notificationEvents.has(e.id))this.governanceMaps.notificationEvents.set(e.id,copy(e))}return copy(next)}
  async schedulerHealth(){return copy(this.schedulerState)}
  async recordSchedulerHealth(now:string,successful:boolean){this.schedulerState={initializedAt:this.schedulerState?.initializedAt??now,lastSuccessfulTickAt:successful?now:this.schedulerState?.lastSuccessfulTickAt};return copy(this.schedulerState)}

  private assetMap = new Map<string,QuestionGroupAsset>()
  async groupAsset(id:string){return copy(this.assetMap.get(id))}
  async putGroupAsset(asset:QuestionGroupAsset){if([...this.assetMap.values()].some(a=>a.id!==asset.id&&a.familyId===asset.familyId&&a.version===asset.version))throw Error('This reusable family version already exists. Refresh the library.');assertAssetWrite(this.assetMap.get(asset.id),asset);this.audit('questionGroupAssets',asset.id,asset,this.assetMap.get(asset.id));this.assetMap.set(asset.id,copy(asset))}
  async recordProviderRequest(id:string,count:number){const slot=this.slots.get(id);if(!slot||slot.status!=='started')throw Error('Evaluation is not reserved.');slot.providerRequestCount=count}
  private reviewMap = new Map<string,HumanReview>(); private formMap = new Map<string,EvaluationForm>(); private policyMap = new Map<string,InteractionPolicy>(); private scheduleMap = new Map<string,Schedule>()
  private runMap = new Map<string,PolicyRun>(); private evaluationMap = new Map<string,EvaluationRecord>(); private testMap = new Map<string,FormTestRun>(); private claimMap = new Map<string,Claim>(); private slots = new Map<string,EvaluationSlot>()
  async review(id:string){return copy(this.reviewMap.get(id))}
  async reviewsByIds(ids:string[]){return copy(ids.flatMap(id=>{const value=this.reviewMap.get(id);return value?[value]:[]}))}
  async writeReviews(writes:ReviewWrite[]){
    if(new Set(writes.map(w=>w.review.id)).size!==writes.length)throw Error('Duplicate review write.')
    for(const {review} of writes)if(auditContext.getStore()&&!this.evaluationMap.has(review.evaluationId))throw new StoreConflict()
    for(const {review,expectedRevision} of writes)if((this.reviewMap.get(review.id)?.revision??0)!==expectedRevision||review.revision!==expectedRevision+1)throw new ReviewConflict()
    for(const {review} of writes){this.audit('humanReviews',review.id,review,this.reviewMap.get(review.id));this.reviewMap.set(review.id,copy(review))}
  }
  async findProductionEvaluation(source:string,conversationId:string,formId:string,version:number) { return copy([...this.evaluationMap.values()].find(record=>record.purpose!=='FORM_TEST'&&record.source==='jev'&&record.conversationSource===source&&record.conversationId===conversationId&&record.form.id===formId&&record.form.version===version)) }
  async forms() { return copy([...this.formMap.values()]) } async policies() { return copy([...this.policyMap.values()]) } async schedules() { return copy([...this.scheduleMap.values()]) }
  async runs() { return copy([...this.runMap.values()]) } async evaluations() { return copy([...this.evaluationMap.values()]) }
  async form(id:string) { return copy(this.formMap.get(id)) } async policy(id:string) { return copy(this.policyMap.get(id)) } async schedule(id:string) { return copy(this.scheduleMap.get(id)) } async run(id:string) { return copy(this.runMap.get(id)) } async evaluation(id:string) { return copy(this.evaluationMap.get(id)) }
  async putForm(v:EvaluationForm) { this.audit('evaluationForms',v.id,v,this.formMap.get(v.id));this.formMap.set(v.id,copy(v)) } async putPolicy(v:InteractionPolicy) { this.audit('policies',v.id,v,this.policyMap.get(v.id));this.policyMap.set(v.id,copy(v)) } async putSchedule(v:Schedule) { this.audit('schedules',v.id,v,this.scheduleMap.get(v.id));this.scheduleMap.set(v.id,copy(v)) }
  async putRun(v:PolicyRun) { this.runMap.set(v.id,copy(v)) } async putEvaluation(v:EvaluationRecord) { this.evaluationMap.set(v.id,copy(v)) }
  async claim(id:string,owner:string,now:string,leaseUntil:string) { const old=this.claimMap.get(id); if (old && (old.status==='completed' || old.leaseUntil>now)) return false; this.claimMap.set(id,{id,owner,claimedAt:now,leaseUntil,status:'running'}); return true }
  async completeClaim(id:string,owner:string) { const v=this.claimMap.get(id); if (v?.owner===owner) v.status='completed' }
  async releaseClaim(id:string,owner:string) { const v=this.claimMap.get(id);if(v?.owner===owner&&v.status==='running')v.leaseUntil='1970-01-01T00:00:00.000Z' }
  async reserveEvaluation(id:string,now:string) { if (this.slots.has(id)) return false; this.slots.set(id,{id,status:'started',startedAt:now}); return true }
  async evaluationSlot(id:string) { return copy(this.slots.get(id)) }
  async completeEvaluation(id:string,record:EvaluationRecord) { const slot=this.slots.get(id); if (!slot) throw new Error('Evaluation was not reserved.'); await this.putEvaluation(record); slot.status='completed'; slot.recordId=record.id }
  async query<T>(collection:CollectionName,limit:number,cursor?:string):Promise<QueryPage<T>> {
    const map=this.maps()[collection]
    const rows=[...map.entries()].sort(([a],[b])=>a.localeCompare(b)).filter(([id])=>!cursor||id>cursor)
    const page=rows.slice(0,limit)
    return {items:copy(page.map(([,value])=>value)) as T[],nextCursor:rows.length>limit?page.at(-1)?.[0]:undefined,scanned:page.length}
  }
  async healthSnapshot():Promise<HealthSnapshot>{const runs=[...this.runMap.values()];return {recentRuns:copy(runs.sort((a,b)=>b.startedAt.localeCompare(a.startedAt)).slice(0,20)),runCounts:{completed:runs.filter(run=>run.status==='completed').length,partial:runs.filter(run=>run.status==='partial-failure').length,failed:runs.filter(run=>run.status==='failed').length}}}
  async evaluationsByIds(ids:string[]) { return copy(ids.map(id=>this.evaluationMap.get(id)).filter((item):item is EvaluationRecord=>!!item)) }
  async formTestRun(id:string){return copy(this.testMap.get(id))}
  async createFormTestRun(run:FormTestRun){if(this.testMap.has(run.id))return false;this.testMap.set(run.id,copy(run));return true}
  async putFormTestRun(run:FormTestRun){this.testMap.set(run.id,copy(run))}
  async deleteFormTestRun(id:string){this.testMap.delete(id)}
  async recentFormTestRuns(limit:number){return copy([...this.testMap.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,limit))}
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
  governanceRead<T>(collection:CollectionName,id:string){return this.one<T>(collection,id)}
  private audit(tx:FirebaseFirestore.Transaction,collection:string,id:string,next:unknown,prior?:unknown){for(const e of mutationAudits(collection,id,next,prior))tx.create(this.collection('auditEvents').doc(e.id),stored(e))}
  async atomic(writes:AtomicWrite[],events:AuditEvent[]=[]){
    if(writes.length+events.length>400)throw Error('Batch limit exceeded.')
    await this.db.runTransaction(async tx=>{
      const refs=writes.map(w=>this.collection(w.collection).doc(pathId(w.id))),docs=await Promise.all(refs.map(ref=>tx.get(ref)))
      for(const [i,w] of writes.entries()){if(w.collection==='auditEvents'&&w.value!==undefined)throw Error('Audit is append-only.');const prior=docs[i].exists?canonicalValue(docs[i].data()):undefined;if(!isDeepStrictEqual(prior,w.expected))throw new StoreConflict()}
      writes.forEach((w,i)=>{if(w.checkOnly)return;if(w.value===undefined)tx.delete(refs[i]);else{tx.set(refs[i],stored(w.value));this.audit(tx,w.collection,w.id,w.value,w.expected)}})
      for(const e of events)tx.create(this.collection('auditEvents').doc(e.id),stored(e))
    })
  }

  async notificationWork(kind:'events',now:string,limit:number):Promise<NotificationEvent[]>
  async notificationWork(kind:'deliveries',now:string,limit:number):Promise<NotificationDelivery[]>
  async notificationWork(kind:'events'|'deliveries',now:string,limit:number):Promise<any[]> {
    const query=kind==='events'?this.collection('notificationEvents').where('routed','==',false).limit(limit):this.collection('notificationDeliveries').where('nextAttemptAt','<=',now).orderBy('nextAttemptAt').limit(limit)
    return (await query.get()).docs.map(d=>canonicalValue(d.data()))
  }
  async notificationHistory(alertId?:string,destinationId?:string,limit=50,cursor?:string){
    let q=this.collection('notificationDeliveries').orderBy('__name__').limit(limit+1)
    if(alertId)q=q.where('alertId','==',alertId)
    if(destinationId)q=q.where('destinationId','==',destinationId)
    if(cursor)q=q.startAfter(this.collection('notificationDeliveries').doc(pathId(cursor)))
    const docs=(await q.get()).docs;return {items:docs.slice(0,limit).map(d=>canonicalValue(d.data()) as NotificationDelivery),scanned:Math.min(docs.length,limit),nextCursor:docs.length>limit?docs[limit-1].id:undefined}
  }
  async notificationHealth(now:string){
    const c=this.collection('notificationDeliveries'),cutoff=new Date(Date.parse(now)-86400000).toISOString()
    // Single-field queries avoid a deployment dependency on composite indexes.
    const [pending,failed,last]=await Promise.all([c.where('state','in',['PENDING','RETRYING']).count().get(),c.where('updatedAt','>=',cutoff).get(),c.orderBy('deliveredAt','desc').limit(1).get()])
    return {pending:pending.data().count,failed24h:failed.docs.filter(d=>d.data().state==='FAILED').length,lastSuccessfulAt:last.docs[0]?.data().deliveredAt??null}
  }

  async activeReviewPage(limit:number,cursor?:string){let q=this.collection('humanReviews').where('status','in',['REVIEW_REQUESTED','IN_REVIEW']).orderBy('__name__').limit(limit+1);if(cursor)q=q.startAfter(this.collection('humanReviews').doc(pathId(cursor)));const docs=(await q.get()).docs,page=docs.slice(0,limit);return {items:page.map(d=>canonicalValue(d.data()) as HumanReview),scanned:page.length,nextCursor:docs.length>limit?page.at(-1)?.id:undefined}}
  async activeAlertPage(limit:number,cursor?:string){let q=this.collection('operationalAlerts').where('status','in',['OPEN','ACKNOWLEDGED']).orderBy('__name__').limit(limit+1);if(cursor)q=q.startAfter(this.collection('operationalAlerts').doc(pathId(cursor)));const docs=(await q.get()).docs,page=docs.slice(0,limit);return {items:page.map(d=>canonicalValue(d.data()) as OperationalAlert),scanned:page.length,nextCursor:docs.length>limit?page.at(-1)?.id:undefined}}
  async syncReviewSla(id:string,expected:HumanReview|undefined,input:AlertInput|undefined,now:string,reason:string){
    const currentRef=this.collection('operationalAlertKeys').doc(slaKey(`REVIEW_CURRENT:${id}`)),stageKey=input?slaKey(input.dedupKey):undefined
    await this.db.runTransaction(async tx=>{
      const reviewDoc=await tx.get(this.collection('humanReviews').doc(pathId(id)))
      if(!isDeepStrictEqual(reviewDoc.exists?canonicalValue(reviewDoc.data()):undefined,expected))throw new StoreConflict()
      const current=await tx.get(currentRef),oldId=current.data()?.alertId as string|undefined
      const stageRef=stageKey?this.collection('operationalAlertKeys').doc(stageKey):undefined,stage=stageRef?await tx.get(stageRef):undefined
      const oldRef=oldId?this.collection('operationalAlerts').doc(pathId(oldId)):undefined,oldDoc=oldRef?await tx.get(oldRef):undefined
      const old=oldDoc?.exists?canonicalValue(oldDoc.data()) as OperationalAlert:undefined
      const seenRef=stage?.data()?.alertId?this.collection('operationalAlerts').doc(pathId(stage.data()!.alertId)):undefined,seenDoc=seenRef?await tx.get(seenRef):undefined
      const seen=seenDoc?.exists?canonicalValue(seenDoc.data()) as OperationalAlert:undefined
      const resolvedRef=old?this.collection('notificationEvents').doc(`${old.id}_RESOLVED`):undefined,resolvedDoc=resolvedRef?await tx.get(resolvedRef):undefined
      if(old&&oldRef&&old.status!=='RESOLVED'&&old.dedupKey!==input?.dedupKey){const next={...transitionAlert(old,'RESOLVED',now),resolutionReason:reason};next.events[next.events.length-1].reason=reason;tx.set(oldRef,stored(next));const event=alertNotificationEvent(next,'RESOLVED',now);if(!resolvedDoc?.exists)tx.create(this.collection('notificationEvents').doc(event.id),stored(event))}
      if(input&&stageRef&&stageKey&&!stage?.exists){const next={...openAlert(undefined,input,now),id:`review_${stageKey}`};tx.create(this.collection('operationalAlerts').doc(next.id),stored(next));tx.set(stageRef,{alertId:next.id});const event=alertNotificationEvent(next,'OPEN',now);tx.create(this.collection('notificationEvents').doc(event.id),stored(event))}
      if(input&&seenRef&&seen?.status==='RESOLVED'&&seen.events.at(-1)?.automatic)tx.set(seenRef,stored(reactivateSla(seen,now)))
      // Stage tombstones survive resolved-alert retention, preserving notification idempotence.
      if(current.exists||input)tx.set(currentRef,input?{alertId:stage?.data()?.alertId??`review_${stageKey}`}:{})
    })
  }
  alert(id:string){return this.one<OperationalAlert>('operationalAlerts',id)}
  async alerts(activeOnly=false){if(!activeOnly)return this.all<OperationalAlert>('operationalAlerts');const docs=await this.collection('operationalAlerts').where('status','in',['OPEN','ACKNOWLEDGED']).get();return docs.docs.map(doc=>canonicalValue(doc.data()) as OperationalAlert)}
  async upsertAlert(input:AlertInput,now:string){
    const key=createHash('sha256').update(input.dedupKey).digest('hex'),pointer=this.collection('operationalAlertKeys').doc(key)
    return this.db.runTransaction(async tx=>{
      const ptr=await tx.get(pointer),priorId=ptr.data()?.alertId as string|undefined
      const doc=priorId?await tx.get(this.collection('operationalAlerts').doc(pathId(priorId))):undefined
      const next=openAlert(doc?.exists?canonicalValue(doc.data()) as OperationalAlert:undefined,input,now)
      tx.set(this.collection('operationalAlerts').doc(pathId(next.id)),stored(next));tx.set(pointer,{alertId:next.id});if(!doc?.exists||(doc.data()?.status==='RESOLVED')){const e=alertNotificationEvent(next,'OPEN',now);tx.create(this.collection('notificationEvents').doc(e.id),stored(e))}return next
    })
  }
  async transitionAlert(id:string,action:'ACKNOWLEDGED'|'RESOLVED',now:string,actor?:AlertActor){
    const ref=this.collection('operationalAlerts').doc(pathId(id))
    return this.db.runTransaction(async tx=>{const doc=await tx.get(ref);if(!doc.exists)return;const next=transitionAlert(canonicalValue(doc.data()) as OperationalAlert,action,now,actor);const eventRef=this.collection('notificationEvents').doc(`${next.id}_RESOLVED`),eventDoc=next.status==='RESOLVED'?await tx.get(eventRef):undefined;if(doc.data()?.status!=='RESOLVED'&&next.status==='RESOLVED'&&!eventDoc?.exists){const e=alertNotificationEvent(next,'RESOLVED',now);tx.create(eventRef,stored(e))}tx.set(ref,stored(next));this.audit(tx,'operationalAlerts',id,next,canonicalValue(doc.data()));return next})
  }
  schedulerHealth(){return this.one<SchedulerHealth>('operationalHealth','scheduler')}
  async recordSchedulerHealth(now:string,successful:boolean){const ref=this.collection('operationalHealth').doc('scheduler');return this.db.runTransaction(async tx=>{const doc=await tx.get(ref),state=doc.data() as SchedulerHealth|undefined;const next={initializedAt:state?.initializedAt??now,lastSuccessfulTickAt:successful?now:state?.lastSuccessfulTickAt};tx.set(ref,stored(next));return next})}

  async groupAsset(id:string){return this.one<QuestionGroupAsset>('questionGroupAssets',id)}
  async putGroupAsset(asset:QuestionGroupAsset){const ref=this.collection('questionGroupAssets').doc(pathId(asset.id));await this.db.runTransaction(async tx=>{const old=await tx.get(ref),versions=await tx.get(this.collection('questionGroupAssets').where('familyId','==',asset.familyId).where('version','==',asset.version).limit(2));if(versions.docs.some(doc=>doc.id!==asset.id))throw Error('This reusable family version already exists. Refresh the library.');assertAssetWrite(old.exists?canonicalValue(old.data()) as QuestionGroupAsset:undefined,asset);tx.set(ref,stored(asset));this.audit(tx,'questionGroupAssets',asset.id,asset,old.exists?canonicalValue(old.data()):undefined)})}
  async recordProviderRequest(id:string,count:number){await this.collection('evaluationSlots').doc(pathId(id)).update({providerRequestCount:count})}
  constructor(private readonly db: Firestore) {}
  private collection(name:string) { return this.db.collection(name) }
  private async all<T>(name:string):Promise<T[]> { const docs=await this.collection(name).get(); return docs.docs.map(d=>canonicalValue(d.data()) as T) }
  private async one<T>(name:string,id:string):Promise<T|undefined> { const doc=await this.collection(name).doc(pathId(id)).get(); return doc.exists?canonicalValue(doc.data()) as T:undefined }
  private async put<T>(name:string,id:string,value:T) {const ref=this.collection(name).doc(pathId(id));await this.db.runTransaction(async tx=>{const doc=await tx.get(ref);tx.set(ref,stored(value));this.audit(tx,name,id,value,doc.exists?canonicalValue(doc.data()):undefined)})}
  async findProductionEvaluation(source:string,conversationId:string,formId:string,version:number) { const docs=await this.collection('evaluationRecords').where('conversationId','==',conversationId).get();return docs.docs.map(doc=>canonicalValue(doc.data()) as EvaluationRecord).find(record=>record.purpose!=='FORM_TEST'&&record.source==='jev'&&record.conversationSource===source&&record.form.id===formId&&record.form.version===version) }
  review(id:string){return this.one<HumanReview>('humanReviews',id)}
  async reviewsByIds(ids:string[]){if(!ids.length)return [];const docs=await this.db.getAll(...ids.map(id=>this.collection('humanReviews').doc(pathId(id))));return docs.filter(doc=>doc.exists).map(doc=>canonicalValue(doc.data()) as HumanReview)}
  async writeReviews(writes:ReviewWrite[]){
    if(new Set(writes.map(w=>w.review.id)).size!==writes.length)throw Error('Duplicate review write.')
    await this.db.runTransaction(async tx=>{
      const refs=writes.map(w=>this.collection('humanReviews').doc(pathId(w.review.id)))
      const docs=await Promise.all(refs.map(ref=>tx.get(ref)))
      if(auditContext.getStore()){const evaluations=await Promise.all(writes.map(w=>tx.get(this.collection('evaluationRecords').doc(pathId(w.review.evaluationId)))));if(evaluations.some(d=>!d.exists))throw new StoreConflict()}
      for(const [index,write] of writes.entries())if((docs[index].data()?.revision??0)!==write.expectedRevision||write.review.revision!==write.expectedRevision+1)throw new ReviewConflict()
      writes.forEach((write,index)=>{tx.set(refs[index],stored(write.review));this.audit(tx,'humanReviews',write.review.id,write.review,docs[index].exists?canonicalValue(docs[index].data()):undefined)})
    })
  }
  forms(){return this.all<EvaluationForm>('evaluationForms')} policies(){return this.all<InteractionPolicy>('policies')} schedules(){return this.all<Schedule>('schedules')}
  runs(){return this.all<PolicyRun>('policyRuns')} evaluations(){return this.all<EvaluationRecord>('evaluationRecords')}
  form(id:string){return this.one<EvaluationForm>('evaluationForms',id)} policy(id:string){return this.one<InteractionPolicy>('policies',id)} schedule(id:string){return this.one<Schedule>('schedules',id)} run(id:string){return this.one<PolicyRun>('policyRuns',id)} evaluation(id:string){return this.one<EvaluationRecord>('evaluationRecords',id)}
  putForm(v:EvaluationForm){return this.put('evaluationForms',v.id,v)} putPolicy(v:InteractionPolicy){return this.put('policies',v.id,v)} putSchedule(v:Schedule){return this.put('schedules',v.id,v)}
  putRun(v:PolicyRun){return this.put('policyRuns',v.id,v)} putEvaluation(v:EvaluationRecord){return this.put('evaluationRecords',v.id,v)}
  async claim(id:string,owner:string,now:string,leaseUntil:string) { const ref=this.collection('scheduleExecutionClaims').doc(pathId(id)); return this.db.runTransaction(async tx=>{const doc=await tx.get(ref);const old=doc.data() as Claim|undefined;if(old&&(old.status==='completed'||old.leaseUntil>now))return false;tx.set(ref,{id,owner,claimedAt:now,leaseUntil,status:'running'} satisfies Claim);return true}) }
  async completeClaim(id:string,owner:string) { const ref=this.collection('scheduleExecutionClaims').doc(pathId(id));await this.db.runTransaction(async tx=>{const doc=await tx.get(ref);if(doc.data()?.owner===owner)tx.update(ref,{status:'completed'})}) }
  async releaseClaim(id:string,owner:string) { const ref=this.collection('scheduleExecutionClaims').doc(pathId(id));await this.db.runTransaction(async tx=>{const doc=await tx.get(ref);if(doc.data()?.owner===owner&&doc.data()?.status==='running')tx.update(ref,{leaseUntil:'1970-01-01T00:00:00.000Z'})}) }
  async reserveEvaluation(id:string,now:string) { const ref=this.collection('evaluationSlots').doc(pathId(id));return this.db.runTransaction(async tx=>{const doc=await tx.get(ref);if(doc.exists)return false;tx.create(ref,{id,status:'started',startedAt:now} satisfies EvaluationSlot);return true}) }
  evaluationSlot(id:string){return this.one<EvaluationSlot>('evaluationSlots',id)}
  async completeEvaluation(id:string,record:EvaluationRecord) { const slot=this.collection('evaluationSlots').doc(pathId(id));const result=this.collection('evaluationRecords').doc(pathId(record.id));await this.db.runTransaction(async tx=>{const doc=await tx.get(slot);if(!doc.exists)throw new Error('Evaluation was not reserved.');tx.set(result,stored(record));tx.update(slot,{status:'completed',recordId:record.id})}) }
  async query<T>(collection:CollectionName,limit:number,cursor?:string):Promise<QueryPage<T>> {
    let query=this.collection(collection).orderBy('__name__').limit(limit+1)
    if(cursor)query=query.startAfter(this.collection(collection).doc(pathId(cursor)))
    const docs=(await query.get()).docs
    const page=docs.slice(0,limit)
    return {items:page.map(doc=>canonicalValue(doc.data()) as T),nextCursor:docs.length>limit?page.at(-1)?.id:undefined,scanned:page.length}
  }
  async healthSnapshot():Promise<HealthSnapshot>{const runs=this.collection('policyRuns');const [recent,completed,partial,failed]=await Promise.all([runs.orderBy('startedAt','desc').limit(20).get(),runs.where('status','==','completed').count().get(),runs.where('status','==','partial-failure').count().get(),runs.where('status','==','failed').count().get()]);return {recentRuns:recent.docs.map(doc=>canonicalValue(doc.data()) as PolicyRun),runCounts:{completed:completed.data().count,partial:partial.data().count,failed:failed.data().count}}}
  async evaluationsByIds(ids:string[]) { if(!ids.length)return [];const docs=await this.db.getAll(...ids.map(id=>this.collection('evaluationRecords').doc(pathId(id))));return docs.filter(doc=>doc.exists).map(doc=>canonicalValue(doc.data()) as EvaluationRecord) }
  formTestRun(id:string){return this.one<FormTestRun>('formTestRuns',id)}
  async createFormTestRun(run:FormTestRun){try{await this.collection('formTestRuns').doc(pathId(run.id)).create(stored(run));return true}catch(error){if((error as {code?:number}).code===6)return false;throw error}}
  putFormTestRun(run:FormTestRun){return this.put('formTestRuns',run.id,run)}
  async deleteFormTestRun(id:string){await this.collection('formTestRuns').doc(pathId(id)).delete()}
  async recentFormTestRuns(limit:number){const docs=(await this.collection('formTestRuns').orderBy('createdAt','desc').limit(limit).get()).docs;return docs.map(doc=>canonicalValue(doc.data()) as FormTestRun)}
}
