import { reviewMutationSla, activeReviewScan, reviewSlaSummary } from './reviewSla'
import { reviewDueAt, reviewDueState } from '../domain/reviewSla'
import { governanceSettings } from './governance'
import { buildAssignment, buildReview, validateDueAt, type AssignmentInput, type HumanReview, type Reviewer, type ReviewerDirectoryItem, type ReviewInput, type ReviewWorkload, type ReviewWorkloadRow } from '../domain/reviews'
import { hasPermission, type RoleAssignment } from '../domain/governance'
import type { EvaluationRecord } from '../domain/types'
import { Forbidden } from './governance'
import { ReviewConflict, type AtomicWrite, type Store } from './store'
import { collectReviewData, ReviewNotFound } from './reviews'
import { bulkReviewAudit } from './audit'
export interface ReviewAuthority { bootstrapId?: string; allowedUserIds: Set<string> }
const identity=(userId:string,displayName?:string):Reviewer=>({userId,...(displayName?{displayName:displayName.slice(0,200)}:{})})
/** Role and evaluation guards join the review revision in one transaction. */
async function roleGuard(store:Store,userId:string,authority:ReviewAuthority,permission:'reviews.write'|'reviews.assign') {
  if(!authority.allowedUserIds.has(userId))throw new Forbidden('User no longer has application access.')
  const role=await store.governanceRead<RoleAssignment>('roleAssignments',userId)
  if(!hasPermission(userId===authority.bootstrapId?'ADMIN':role?.role??'VIEWER',permission))throw new Forbidden('User no longer has reviewer access.')
  return {role,guard:{collection:'roleAssignments',id:userId,expected:role,checkOnly:true} satisfies AtomicWrite}
}
async function assigneeIdentity(store:Store,id:unknown,authority:ReviewAuthority,actor:Reviewer) {
  if(typeof id!=='string'||!id||id.length>100)throw Error('Select a valid reviewer.')
  const {role,guard}=await roleGuard(store,id,authority,'reviews.write')
  return {assignee:identity(id,role?.displayName??(id===actor.userId?actor.displayName:undefined)),guard}
}
const reviewWrite=(record:EvaluationRecord,prior:HumanReview|undefined,review:HumanReview):AtomicWrite[]=>[
  {collection:'evaluationRecords',id:record.id,expected:record,checkOnly:true},
  {collection:'humanReviews',id:record.id,expected:prior,value:review},
]
export async function assignReview(store:Store,id:string,input:AssignmentInput,actor:Reviewer,now:string,authority:ReviewAuthority) {
  if(!Number.isInteger(input.expectedRevision)||input.expectedRevision<0)throw Error('Expected revision is required.')
  const {guard}=await roleGuard(store,actor.userId,authority,'reviews.assign')
  const record=await store.evaluation(id);if(!record)throw new ReviewNotFound('Evaluation not found.')
  const prior=await store.review(id)
  if((prior?.revision??0)!==input.expectedRevision)throw new ReviewConflict()
  const target=input.action==='unassign'?undefined:await assigneeIdentity(store,input.assigneeId,authority,actor)
  const review=buildAssignment(record,prior,input,target?.assignee,actor,now)
  await store.atomic([guard,...(target?[target.guard]:[]),...reviewWrite(record,prior,review)])
  await reviewMutationSla(store,review.id,now)
  return review
}
export async function scoreAssignedReview(store:Store,id:string,input:ReviewInput,actor:Reviewer,now:string,authority:ReviewAuthority) {
  if(!Number.isInteger(input.expectedRevision)||input.expectedRevision<0)throw Error('Expected revision is required.')
  const {guard}=await roleGuard(store,actor.userId,authority,'reviews.write')
  const record=await store.evaluation(id);if(!record)throw new ReviewNotFound('Evaluation not found.')
  const prior=await store.review(id)
  if((prior?.revision??0)!==input.expectedRevision)throw new ReviewConflict()
  if(prior?.assignment&&prior.assignment.assignee.userId!==actor.userId)throw new Forbidden('Review is assigned to another reviewer. Use an explicit reassignment or takeover.')
  if(input.action==='claim'&&(!prior||prior.status!=='REVIEW_REQUESTED'||prior.assignment))throw new ReviewConflict()
  if(prior?.status==='IN_REVIEW'&&!prior.assignment&&prior.reviewer?.userId!==actor.userId)throw new Forbidden('Review is already in progress. Request an explicit assignment.')
  const claim=!!prior&&prior.status==='REVIEW_REQUESTED'&&!prior.assignment&&['claim','start','save','complete'].includes(input.action)
  const review=buildReview(record,prior,{...input,action:input.action==='claim'?'start':input.action},actor,now)
  if(claim){
    review.assignment={...(reviewDueAt(prior)?{dueAt:reviewDueAt(prior)}:{}),assignee:identity(actor.userId,actor.displayName),assignedAt:now,assignedBy:identity(actor.userId,actor.displayName)}
    review.dueAt=undefined
    review.events.splice(prior!.events.length,0,{kind:'review_claimed',at:now,actor,assignee:actor,revision:review.revision})
    if(review.events.length>200)throw Error('Review audit limit reached; contact the operator.')
  }
  await store.atomic([guard,...reviewWrite(record,prior,review)])
  await reviewMutationSla(store,review.id,now)
  return review
}
export interface BulkAssignmentInput { items: Array<{evaluationId:string;expectedRevision:number}>; assigneeId:string; dueAt?:string }
export async function bulkAssignReviews(store:Store,input:BulkAssignmentInput,actor:Reviewer,now:string,authority:ReviewAuthority) {
  const {guard}=await roleGuard(store,actor.userId,authority,'reviews.assign')
  if(!Array.isArray(input.items)||input.items.length<1||input.items.length>20||input.items.some(v=>!v||typeof v.evaluationId!=='string'||!/^[A-Za-z0-9_-]{1,180}$/.test(v.evaluationId)||!Number.isInteger(v.expectedRevision)||v.expectedRevision<0)||new Set(input.items.map(v=>v.evaluationId)).size!==input.items.length)throw Error('Select 1 to 20 unique evaluations with current revisions.')
  const target=await assigneeIdentity(store,input.assigneeId,authority,actor),dueAt=validateDueAt(input.dueAt)
  const writes:AtomicWrite[]=[guard,target.guard],items:HumanReview[]=[]
  // Validate every selected record before the single all-or-none transaction.
  for(const selected of input.items){
    const record=await store.evaluation(selected.evaluationId);if(!record)throw new ReviewNotFound('Evaluation not found.')
    const prior=await store.review(record.id)
    if((prior?.revision??0)!==selected.expectedRevision)throw new ReviewConflict()
    if(prior&&prior.status!=='REVIEW_REQUESTED'||!prior&&record.reviewState==='REVIEWED')throw Error('Bulk assignment accepts only NOT REVIEWED or REVIEW REQUESTED evaluations.')
    const review=buildAssignment(record,prior,{action:prior?.assignment?'reassign':'assign',expectedRevision:selected.expectedRevision,dueAt},target.assignee,actor,now)
    items.push(review);writes.push(...reviewWrite(record,prior,review))
  }
  const audit=bulkReviewAudit(items.length,target.assignee.userId,dueAt)
  await store.atomic(writes,audit?[audit]:[])
  for(const review of items)await reviewMutationSla(store,review.id,now)
  return {items,count:items.length}
}
export async function reviewerDirectory(store:Store,q:URLSearchParams,authority:ReviewAuthority,actor:Reviewer) {
  const limit=Number(q.get('limit')??50),cursor=q.get('cursor')??undefined
  if(!Number.isInteger(limit)||limit<1||limit>100||cursor&&cursor!=='bootstrap:done'&&!/^[A-Za-z0-9_-]{1,180}$/.test(cursor))throw Error('Invalid reviewer pagination.')
  const items:ReviewerDirectoryItem[]=[]
  if(!cursor&&authority.bootstrapId){const role=await store.governanceRead<RoleAssignment>('roleAssignments',authority.bootstrapId);items.push({...identity(authority.bootstrapId,role?.displayName??(actor.userId===authority.bootstrapId?actor.displayName:undefined)),role:'ADMIN'})}
  if(items.length===limit)return {items,nextCursor:'bootstrap:done',scanned:0,scanLimited:false}
  let next=cursor==='bootstrap:done'?undefined:cursor,more=true,scanned=0
  while(items.length<limit&&more&&scanned<500){
    const page=await store.query<RoleAssignment>('roleAssignments',Math.min(100,500-scanned),next);scanned+=page.scanned;more=false
    for(const [i,row] of page.items.entries()){
      next=row.id
      if(row.userId!==authority.bootstrapId&&authority.allowedUserIds.has(row.userId)&&hasPermission(row.role,'reviews.write'))items.push({...identity(row.userId,row.displayName),role:row.role})
      if(items.length===limit){more=i<page.items.length-1;break}
    }
    more=more||!!page.nextCursor
  }
  return {items,nextCursor:more?next:undefined,scanned,scanLimited:more&&scanned>=500}
}
export async function reviewWorkload(store:Store,now:string,authority:ReviewAuthority):Promise<ReviewWorkload> {
  let reviews:HumanReview[],roles:RoleAssignment[]
  try {
    // Keep both existing evaluation/review completeness ceilings, including missing-review evaluations.
    await collectReviewData<EvaluationRecord>(store,'evaluationRecords')
    const scan=await activeReviewScan(store);if(!scan.complete)throw Error('Review SLA scan incomplete: limit of 2000 active reviews reached.');reviews=scan.items
    roles=await collectReviewData<RoleAssignment>(store,'roleAssignments')
  }catch(e){if(e instanceof Error&&e.message.includes('limit of 2000'))return {complete:false,needsIndexing:true,message:e.message,asOf:now,items:[]};throw e}
  const settings=await governanceSettings(store),summary=await reviewSlaSummary(store,now)
  const roleMap=new Map(roles.map(r=>[r.userId,r])),rows=new Map<string,ReviewWorkloadRow>()
  const rowFor=(who:Reviewer)=>{
    let row=rows.get(who.userId);if(row){if(!row.displayName&&who.displayName)row.displayName=who.displayName;return row}
    const role=roleMap.get(who.userId),access=authority.allowedUserIds.has(who.userId)&&hasPermission(who.userId===authority.bootstrapId?'ADMIN':role?.role??'VIEWER','reviews.write')
    row={...identity(who.userId,role?.displayName??who.displayName),reviewerAccess:access,assignedOpen:0,requested:0,inReview:0,dueSoon:0,overdue:0,escalated:0};rows.set(who.userId,row);return row
  }
  for(const role of roles)if(authority.allowedUserIds.has(role.userId)&&hasPermission(role.role,'reviews.write'))rowFor(role)
  if(authority.bootstrapId)rowFor({userId:authority.bootstrapId})
  let unassignedRequested=0
  for(const review of reviews){
    if(review.status==='REVIEWED')continue
    if(!review.assignment&&review.status==='REVIEW_REQUESTED')unassignedRequested++
    const row=rowFor(review.assignment?.assignee??{userId:'unassigned',displayName:'Unassigned'});row.assignedOpen++;if(review.status==='REVIEW_REQUESTED')row.requested++;else row.inReview++;const state=reviewDueState(review,now,settings.reviewSla);if(state==='DUE_SOON')row.dueSoon++;if(state==='OVERDUE')row.overdue++;if(state==='ESCALATED')row.escalated++
  }
  return {complete:true,needsIndexing:false,asOf:now,unassignedRequested,summary,items:[...rows.values()].sort((a,b)=>(a.displayName??a.userId).localeCompare(b.displayName??b.userId))}
}
export async function assertSampleAssignment(store:Store,actor:Reviewer,authority:ReviewAuthority,assigneeId:string,dueAt?:string) { await roleGuard(store,actor.userId,authority,'reviews.assign');await assigneeIdentity(store,assigneeId,authority,actor);validateDueAt(dueAt) }
