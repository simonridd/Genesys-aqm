import { createHash, randomUUID } from 'node:crypto'
import { defaultGovernance, hasPermission, rolePermissions, roles, type GovernanceSettings, type RoleAssignment, type SessionAccess, type Permission } from '../domain/governance'
import type { Reviewer } from '../domain/reviews'
import type { AuditEvent } from '../domain/governance'
import { retentionAudit } from './audit'
import { StoreConflict, type AtomicWrite, type CollectionName, type Store } from './store'
export class Forbidden extends Error {constructor(message='Forbidden: your role does not permit this action.'){super(message)}}
export function requirePermission(access:SessionAccess,p:Permission){if(!hasPermission(access.role,p))throw new Forbidden()}
export async function sessionAccess(store:Store,actor:Reviewer,bootstrapId?:string):Promise<SessionAccess>{
 const assignment=await store.governanceRead<RoleAssignment>('roleAssignments',actor.userId)
 const bootstrap=actor.userId===bootstrapId,role=bootstrap?'ADMIN':assignment?.role??'VIEWER'
 if(!roles.includes(role))throw new Forbidden('Invalid role assignment.')
 return {actor,role,permissions:rolePermissions[role],bootstrap}
}
export async function governanceSettings(store:Store){return await store.governanceRead<GovernanceSettings>('governanceSettings','governance')??{...defaultGovernance}}
export interface PurgePlan {id:string;actorId:string;cutoff:string;expiresAt:string;settings:GovernanceSettings;cursors:Partial<Record<CollectionName,string>>;fingerprint:string;counts:Record<string,number>;scanned:number;continuation:Partial<Record<CollectionName,string>>;complete:boolean;executed?:boolean}
const retentionCollections=['evaluationRecords','humanReviews','policyRuns','operationalAlerts','auditEvents'] as const
const old=(timestamp:unknown,days:number|null,cutoff:string)=>days!==null&&typeof timestamp==='string'&&Number.isFinite(Date.parse(timestamp))&&Date.parse(timestamp)<Date.parse(cutoff)-days*86400000
/** Preview one bounded scan window. Counts apply to this window, never claim full-dataset totals. */
export async function scanPurge(store:Store,settings:GovernanceSettings,cutoff:string,cursors:PurgePlan['cursors']={}){
 const writes:AtomicWrite[]=[],counts:Record<string,number>={evaluations:0,reviews:0,policyRuns:0,alerts:0,audit:0},continuation:PurgePlan['continuation']={};let scanned=0
 const seen=new Set<string>()
 const add=(collection:CollectionName,v:{id:string},kind:string)=>{const key=collection+v.id;if(seen.has(key))return;seen.add(key);writes.push({collection,id:v.id,expected:v});counts[kind]++}
 for(const collection of retentionCollections){
  if(cursors[collection]==='DONE'){continuation[collection]='DONE';continue}
  const page=await store.query<Record<string,unknown>&{id:string}>(collection,50,cursors[collection]);scanned+=page.scanned;continuation[collection]=page.nextCursor??'DONE'
  for(const row of page.items){
   if(collection==='evaluationRecords'&&old(row.evaluatedAt,settings.evaluationRetentionDays,cutoff)){
    add(collection,row,'evaluations');const review=await store.review(row.id);if(review)add('humanReviews',review,'reviews');else writes.push({collection:'humanReviews',id:row.id,expected:undefined,checkOnly:true})
   }
   if(collection==='humanReviews'&&old(row.updatedAt,settings.reviewRetentionDays,cutoff))add(collection,row,'reviews')
   if(collection==='policyRuns'&&row.status!=='running'&&old(row.completedAt,settings.policyRunRetentionDays,cutoff))add(collection,row,'policyRuns')
   if(collection==='operationalAlerts'&&row.status==='RESOLVED'&&old(row.resolvedAt??row.updatedAt,settings.alertRetentionDays,cutoff))add(collection,row,'alerts')
   if(collection==='auditEvents'&&old(row.occurredAt,settings.auditRetentionDays,cutoff))add(collection,row,'audit')
  }
 }
 return {writes,counts,scanned,continuation,complete:Object.values(continuation).every(v=>v==='DONE'),fingerprint:createHash('sha256').update(JSON.stringify({settings,writes},(_key,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))):value)).digest('hex')}
}
export async function planPurge(store:Store,actor:Reviewer,now:string,cursors:PurgePlan['cursors']={}){
 if(Object.keys(cursors).some(k=>!retentionCollections.includes(k as typeof retentionCollections[number]))||Object.values(cursors).some(v=>typeof v!=='string'||!/^[A-Za-z0-9_-]{1,180}$/.test(v)))throw Error('Invalid purge continuation.')
 const settings=await governanceSettings(store),scan=await scanPurge(store,settings,now,cursors),id=randomUUID()
 const plan:PurgePlan={id,actorId:actor.userId,cutoff:now,expiresAt:new Date(Date.parse(now)+15*60000).toISOString(),settings,cursors,fingerprint:scan.fingerprint,counts:scan.counts,scanned:scan.scanned,continuation:scan.continuation,complete:scan.complete}
 await store.atomic([{collection:'purgePlans',id,value:plan,expected:undefined}],[retentionAudit('planned',id,{...scan.counts,scanned:scan.scanned})]);return plan
}
export async function executePurge(store:Store,actor:Reviewer,now:string,id:string,confirmation:unknown){
 if(confirmation!=='PURGE')throw Error('Explicit PURGE confirmation is required.')
 const plan=await store.governanceRead<PurgePlan>('purgePlans',id);if(!plan||plan.actorId!==actor.userId)throw new Forbidden('Preview this purge with your current identity first.')
 if(plan.executed)return {plan,alreadyExecuted:true}
 if(plan.expiresAt<now)throw new StoreConflict()
 const rawSettings=await store.governanceRead<GovernanceSettings>('governanceSettings','governance'),settings=rawSettings??{...defaultGovernance},scan=await scanPurge(store,settings,plan.cutoff,plan.cursors)
 if(scan.fingerprint!==plan.fingerprint)throw new StoreConflict()
 // Protect against settings changes between recalculation and commit. Review writers read the evaluation in their transaction.
 const done={...plan,executed:true}
 await store.atomic([...scan.writes,{collection:'governanceSettings',id:'governance',expected:rawSettings,checkOnly:true},{collection:'purgePlans',id,value:done,expected:plan}],[retentionAudit('executed',id,{...scan.counts,scanned:scan.scanned})])
 return {plan:done,alreadyExecuted:false}
}
export async function auditPage(store:Store,q:URLSearchParams,historyOnly=false){
 const limit=Number(q.get('limit')??50),cursor=q.get('cursor')??undefined
 if(!Number.isInteger(limit)||limit<1||limit>100||cursor&&!/^[A-Za-z0-9_-]{1,180}$/.test(cursor))throw Error('Invalid audit pagination.')
 for(const key of ['from','to'])if(q.get(key)&&!Number.isFinite(Date.parse(q.get(key)!)))throw Error('Invalid audit date.')
 if(historyOnly&&(!['form','group','policy'].includes(q.get('resourceType')??'')||!q.get('resourceId')))throw new Forbidden('Product history requires a form, group, or policy ID.')
 const items:AuditEvent[]=[];let next=cursor,more=true,scanned=0
 while(items.length<limit&&more&&scanned<500){const page=await store.query<AuditEvent>('auditEvents',Math.min(100,500-scanned),next);scanned+=page.scanned;more=false
 for(const [i,e] of page.items.entries()){next=e.id;if((!historyOnly||['form','group','policy'].includes(e.resourceType))&&['actor','resourceType','resourceId','action'].every(k=>!q.get(k)||(k==='actor'?e.actor.userId:e[k as 'resourceType'|'resourceId'|'action'])===q.get(k))&&(!q.get('from')||Date.parse(e.occurredAt)>=Date.parse(q.get('from')!))&&(!q.get('to')||Date.parse(e.occurredAt)<=Date.parse(q.get('to')!)+(/^\d{4}-\d{2}-\d{2}$/.test(q.get('to')!)?86400000-1:0)))items.push(e);if(items.length===limit){more=i<page.items.length-1;break}}more=more||!!page.nextCursor}
 return {items,nextCursor:more?next:undefined,scanned,scanLimited:scanned>=500&&more}
}
