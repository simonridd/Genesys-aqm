import { activeReview, reviewDueAt, reviewDueState, type ReviewSlaHealth } from '../domain/reviewSla'
import type { HumanReview } from '../domain/reviews'
import type { AlertInput } from '../domain/operationalAlerts'
import { governanceSettings } from './governance'
import { StoreConflict, type Store } from './store'
export const reviewScanLimit = 2000
export async function reconcileReviewSla(store:Store,reviewId:string,now:string) {
  const [review,settings] = await Promise.all([store.review(reviewId),governanceSettings(store)])
  const state = reviewDueState(review,now,settings.reviewSla)
  let input:AlertInput|undefined
  if(review && ['DUE_SOON','OVERDUE','ESCALATED'].includes(state)) {
    const epoch = review.events.filter(e=>['review_assigned','review_reassigned','review_unassigned','review_claimed','review_due_changed'].includes(e.kind)).at(-1)?.revision ?? 0
    const dedupKey = `REVIEW:${review.id}:${review.assignment?.assignee.userId??'unassigned'}:${review.assignment?.assignedAt??''}:${epoch}:${reviewDueAt(review)}:${state}`
    input = {dedupKey,type:state==='DUE_SOON'?'REVIEW_DUE_SOON':state==='OVERDUE'?'REVIEW_OVERDUE':'REVIEW_ESCALATED',severity:state==='DUE_SOON'?'INFO':state==='OVERDUE'?'WARNING':'ERROR',title:state==='DUE_SOON'?'Review due soon':state==='OVERDUE'?'Review overdue':'Review escalated',message:state==='DUE_SOON'?'Review is approaching its due time.':review.assignment?state==='ESCALATED'?'Review has exceeded the escalation threshold.':'Review is overdue.':state==='ESCALATED'?'Review has exceeded the escalation threshold and has no assigned reviewer.':'Review is overdue and has no assigned reviewer.',source:'review-sla',metadata:{},context:{evaluationId:review.evaluationId,reviewId:review.id,formId:review.formId,dueAt:reviewDueAt(review)!,...(review.assignment?{assigneeUserId:review.assignment.assignee.userId}:{})}}
  }
  // Both opening and resolving verify the same HumanReview inside the alert transaction.
  await store.syncReviewSla(reviewId,review,input,now,`Review SLA re-evaluated: ${state}`)
}
export async function activeReviewScan(store:Store,max=reviewScanLimit) {
  const items:HumanReview[]=[];let cursor:string|undefined
  do { const page=await store.activeReviewPage(Math.min(100,max-items.length),cursor);items.push(...page.items);cursor=page.nextCursor } while(cursor && items.length<max)
  return {items,complete:!cursor,scanned:items.length}
}
export async function reviewSlaSummary(store:Store,now:string,max=reviewScanLimit):Promise<ReviewSlaHealth> {
  const [scan,settings]=await Promise.all([activeReviewScan(store,max),governanceSettings(store)])
  const result:ReviewSlaHealth={asOf:now,complete:scan.complete,scanned:scan.scanned,open:scan.items.length,dueSoon:0,overdue:0,escalated:0}
  for(const review of scan.items){const state=reviewDueState(review,now,settings.reviewSla);if(state==='DUE_SOON')result.dueSoon++;if(state==='OVERDUE')result.overdue++;if(state==='ESCALATED')result.escalated++}
  if(!result.complete)result.message='Review SLA scan incomplete — active review limit reached; indexed continuation is required.'
  return result
}
export async function sweepReviewSla(store:Store,now:string,max=reviewScanLimit) {
  const scan=await activeReviewScan(store,max)
  let complete=scan.complete
  for(const review of scan.items)try{await reconcileReviewSla(store,review.id,now)}catch(e){if(!(e instanceof StoreConflict))throw e;complete=false}
  // Active-alert paging also catches deleted or otherwise inactive reviews without scanning history.
  let cursor:string|undefined,scanned=0
  do {
    const page=await store.activeAlertPage(Math.min(100,max-scanned),cursor);scanned+=page.scanned;cursor=page.nextCursor
    for(const alert of page.items)if(alert.source==='review-sla'&&alert.context){const review=await store.review(alert.context.reviewId);if(!activeReview(review))try{await reconcileReviewSla(store,alert.context.reviewId,now)}catch(e){if(!(e instanceof StoreConflict))throw e;complete=false}}
  }while(cursor&&scanned<max)
  const summary=await reviewSlaSummary(store,now,max)
  summary.complete=summary.complete&&complete&&!cursor
  if(!summary.complete)summary.message='Review SLA scan incomplete — scan ceiling or concurrent review change; refresh or run the next tick.'
  const prior=await store.governanceRead('operationalHealth','reviewSla')
  try{await store.atomic([{collection:'operationalHealth',id:'reviewSla',expected:prior,value:summary}])}catch(e){if(!(e instanceof StoreConflict))throw e}
  return summary
}

export async function reviewMutationSla(store:Store,id:string,now:string) {
  for(let attempt=0;attempt<3;attempt++)try{await reconcileReviewSla(store,id,now);return}catch(e){
    if(e instanceof StoreConflict&&attempt<2)continue
    console.error('Review SLA post-write check deferred.',{reviewId:id})
    // Expose the deferred check separately from scheduler/provider health; the next sweep retries it.
    try{const prior=await store.governanceRead('operationalHealth','reviewSla');await store.atomic([{collection:'operationalHealth',id:'reviewSla',expected:prior,value:{asOf:now,complete:false,message:'Review SLA scan incomplete — post-write check deferred to the next sweep.'}}])}catch{/* A subsequent authenticated sweep records durable health. */}
  }
}
