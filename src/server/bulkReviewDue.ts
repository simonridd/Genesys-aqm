import { activeReview, reviewDueAt } from '../domain/reviewSla'
import { validateDueAt, type HumanReview, type Reviewer } from '../domain/reviews'
import { hasPermission, type RoleAssignment } from '../domain/governance'
import { ReviewConflict, type AtomicWrite, type Store } from './store'
import { Forbidden } from './governance'
import { ReviewNotFound } from './reviews'
import type { ReviewAuthority } from './reviewOperations'
import { bulkDueAudit } from './audit'
export interface BulkDueInput { items:Array<{evaluationId:string;expectedRevision:number}>; dueAt:string|null }
export async function bulkReviewDue(store:Store,input:BulkDueInput,actor:Reviewer,now:string,authority:ReviewAuthority) {
  const role=await store.governanceRead<RoleAssignment>('roleAssignments',actor.userId)
  if(!authority.allowedUserIds.has(actor.userId)||!hasPermission(actor.userId===authority.bootstrapId?'ADMIN':role?.role??'VIEWER','reviews.assign'))throw new Forbidden()
  if(!Array.isArray(input.items)||input.items.length<1||input.items.length>20||input.items.some(v=>!v||typeof v.evaluationId!=='string'||!/^[A-Za-z0-9_-]{1,180}$/.test(v.evaluationId)||!Number.isInteger(v.expectedRevision)||v.expectedRevision<0)||new Set(input.items.map(v=>v.evaluationId)).size!==input.items.length)throw Error('Select 1 to 20 unique reviews with current revisions.')
  if(input.dueAt===undefined||input.dueAt==='')throw Error('Provide a due timestamp or null to clear it.')
  const dueAt=input.dueAt===null?undefined:validateDueAt(input.dueAt),writes:AtomicWrite[]=[{collection:'roleAssignments',id:actor.userId,expected:role,checkOnly:true}],items:HumanReview[]=[],audits:import('../domain/governance').AuditEvent[]=[]
  for(const selected of input.items){
    const record=await store.evaluation(selected.evaluationId);if(!record)throw new ReviewNotFound('Evaluation not found.')
    const prior=await store.review(record.id);if((prior?.revision??0)!==selected.expectedRevision)throw new ReviewConflict()
    if(!activeReview(prior)||!prior)throw Error('Due dates can only change on requested or in-progress reviews.')
    if(prior.events.length>=200)throw Error('Review audit limit reached; contact the operator.')
    if(reviewDueAt(prior)===dueAt){items.push(prior);writes.push({collection:'evaluationRecords',id:record.id,expected:record,checkOnly:true},{collection:'humanReviews',id:record.id,expected:prior,checkOnly:true});continue}
    const revision=prior.revision+1
    const review:HumanReview={...structuredClone(prior),dueAt:prior.assignment?undefined:dueAt,assignment:prior.assignment?{...structuredClone(prior.assignment),dueAt}:undefined,revision,updatedAt:now,events:[...prior.events,{kind:'review_due_changed',at:now,actor,revision,...(dueAt?{dueAt}:{dueCleared:true})}]}
    // Read the old due date to keep changes auditable; no assignment epoch is changed.
    const audit=bulkDueAudit(1,dueAt,reviewDueAt(prior),review.id)
    items.push(review);writes.push({collection:'evaluationRecords',id:record.id,expected:record,checkOnly:true},{collection:'humanReviews',id:record.id,expected:prior,value:review})
    if(audit)audits.push(audit)
  }
  await store.atomic(writes,audits)
  return {items,count:items.length}
}
