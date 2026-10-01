import { aggregateCalibration } from '../domain/calibration'
import { buildReview, calibrationSample, matchesReviewQueue, type HumanReview, type Reviewer, type ReviewInput, type ReviewEvaluation } from '../domain/reviews'
import type { EvaluationRecord } from '../domain/types'
import { ReviewConflict, type CollectionName, type Store } from './store'
export class ReviewNotFound extends Error {}
export async function collectReviewData<T>(store:Store,collection:CollectionName,max=2000):Promise<T[]>{
  const items:T[]=[];let cursor:string|undefined
  do{const page=await store.query<T>(collection,100,cursor);items.push(...page.items);cursor=page.nextCursor;if(items.length>max||(cursor&&items.length===max))throw Error(`Calibration limit of ${max} ${collection} reached; indexed filtering is required before reporting complete results.`)}while(cursor)
  return items
}
export async function joinedReviewRecords(store:Store):Promise<ReviewEvaluation[]>{
  const [records,reviews]=await Promise.all([collectReviewData<EvaluationRecord>(store,'evaluationRecords'),collectReviewData<HumanReview>(store,'humanReviews')])
  const byId=new Map(reviews.map(review=>[review.evaluationId,review]))
  return records.map(record=>({...record,humanReview:byId.get(record.id)}))
}
export async function updateReview(store:Store,evaluationId:string,input:ReviewInput,actor:Reviewer,now:string){
  if(!Number.isInteger(input.expectedRevision)||input.expectedRevision<0)throw Error('Expected revision is required.')
  const record=await store.evaluation(evaluationId);if(!record)throw new ReviewNotFound('Evaluation not found.')
  const prior=await store.review(evaluationId)
  if((prior?.revision??0)!==input.expectedRevision)throw new ReviewConflict()
  const review=buildReview(record,prior,input,actor,now)
  await store.writeReviews([{review,expectedRevision:input.expectedRevision}]);return review
}
export async function reviewQueue(store:Store,query:URLSearchParams){return (await joinedReviewRecords(store)).filter(record=>matchesReviewQueue(record,query))}
export async function calibrationAnalytics(store:Store,query:URLSearchParams){return aggregateCalibration(await joinedReviewRecords(store),query)}
export async function requestSample(store:Store,input:unknown,actor:Reviewer,now:string){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid calibration sample.')
  const value=input as {count:number;strategy:'recent'|'deterministic';seed?:string;filters?:Record<string,string>}
  if(value.filters&&(!Object.entries(value.filters).every(([key,v])=>['source','form','agent','queue','from','to'].includes(key)&&typeof v==='string')))throw Error('Invalid sample filters.')
  if(value.seed!==undefined&&typeof value.seed!=='string')throw Error('Invalid sample seed.')
  const filters=new URLSearchParams(value.filters);if(!filters.get('source'))filters.set('source','genesys-cloud')
  const selected=calibrationSample(await joinedReviewRecords(store),filters,value.count,value.strategy,value.seed??'calibration-v07')
  const reviews=selected.map(record=>buildReview(record,undefined,{action:'request',expectedRevision:0,formId:record.form.id,formVersion:record.form.version},actor,now))
  if(reviews.length)await store.writeReviews(reviews.map(review=>({review,expectedRevision:0})))
  return {items:reviews,selected:reviews.length,requested:value.count,strategy:value.strategy,seed:value.seed??'calibration-v07'}
}
