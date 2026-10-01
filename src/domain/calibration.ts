import type { HumanReview, QuestionReview, ReviewEvaluation } from './reviews'
import { matchesReviewQueue, reviewStatus } from './reviews'
const mean=(values:number[]):number|null=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null
export interface CalibrationGroup {
  key: string; label: string; reviewed: number; questions: number; agreements: number; disagreements: number; agreementRate: number | null
  aiAverageCredit: number | null; humanAverageCredit: number | null; averageAbsoluteCreditDifference: number | null; meanScoreDifference: number | null
  confidenceOnAgreements: number | null; confidenceOnDisagreements: number | null
  formRef?: string; questionId?: string; evaluationIds: string[]
}
function group(key:string,label:string,reviews:HumanReview[],questions:QuestionReview[]):CalibrationGroup {
  questions=questions.filter(q=>q.ai.status!=='SKIPPED')
  const comparable=questions.filter(q=>q.comparison),agreements=comparable.filter(q=>q.comparison!.exact)
  const confidence=(items:QuestionReview[])=>mean(items.flatMap(q=>q.selectedOutcomeConfidence===null?[]:[q.selectedOutcomeConfidence]))
  return {key,label,reviewed:reviews.length,questions:questions.length,agreements:agreements.length,disagreements:comparable.length-agreements.length,agreementRate:comparable.length?agreements.length/comparable.length:null,aiAverageCredit:mean(questions.flatMap(q=>q.ai.credit===null?[]:[q.ai.credit])),humanAverageCredit:mean(questions.flatMap(q=>q.human?.credit==null?[]:[q.human.credit])),averageAbsoluteCreditDifference:mean(comparable.flatMap(q=>q.comparison!.creditDifference===null?[]:[Math.abs(q.comparison!.creditDifference)])),meanScoreDifference:mean(reviews.flatMap(r=>r.comparison.absoluteScoreDifference===null?[]:[r.comparison.absoluteScoreDifference])),confidenceOnAgreements:confidence(agreements),confidenceOnDisagreements:confidence(comparable.filter(q=>!q.comparison!.exact)),evaluationIds:reviews.map(r=>r.evaluationId)}
}
export function aggregateCalibration(records:ReviewEvaluation[],query:URLSearchParams=new URLSearchParams()){
  const scope=new URLSearchParams(query);if(!scope.get('source'))scope.set('source','genesys-cloud')
  const scoped=records.filter(record=>matchesReviewQueue(record,scope))
  const reviews=scoped.flatMap(record=>record.humanReview?.status==='REVIEWED'?[record.humanReview]:[])
  const allQuestions=reviews.flatMap(review=>review.questions.filter(q=>q.ai.status!=='SKIPPED'))
  const summary=group('all','All completed reviews',reviews,allQuestions)
  const forms=[...new Set(reviews.map(r=>`${r.formId}@${r.formVersion}`))].map(ref=>{const items=reviews.filter(r=>`${r.formId}@${r.formVersion}`===ref);return {...group(ref,`${items[0].formSnapshot.name} v${items[0].formVersion}`,items,items.flatMap(r=>r.questions)),formRef:ref}})
  const questions=forms.flatMap(form=>{
    const items=reviews.filter(r=>`${r.formId}@${r.formVersion}`===form.key)
    return [...new Set(items.flatMap(r=>r.questions.filter(q=>q.ai.status!=='SKIPPED').map(q=>q.questionId)))].map(id=>{const matching=items.filter(r=>r.questions.some(q=>q.questionId===id&&q.ai.status!=='SKIPPED')),qs=matching.flatMap(r=>r.questions.filter(q=>q.questionId===id));return {...group(`${form.key}:${id}`,qs[0].title,matching,qs),formRef:form.key,questionId:id}})
  })
  const byType=(['noul','choice','score'] as const).map(type=>group(type,type==='noul'?'Noul / Yes-No':type==='choice'?'Choice':'Score',reviews.filter(r=>r.questions.some(q=>q.type===type&&q.ai.status!=='SKIPPED')),allQuestions.filter(q=>q.type===type)))
  const bands=[{key:'low',label:'< 60%',min:0,max:.6},{key:'medium',label:'60–79%',min:.6,max:.8},{key:'high',label:'80–89%',min:.8,max:.9},{key:'very-high',label:'90%+',min:.9,max:1.01}]
  const confidenceBands=bands.map(b=>group(b.key,b.label,[],allQuestions.filter(q=>q.selectedOutcomeConfidence!==null&&q.selectedOutcomeConfidence>=b.min&&q.selectedOutcomeConfidence<b.max)))
  confidenceBands.push(group('unknown','Unavailable',[],allQuestions.filter(q=>q.selectedOutcomeConfidence===null)))
  return {scope:'complete' as const,source:scope.get('source')!,metrics:{evaluationsReviewed:reviews.length,questionsReviewed:summary.questions,exactAgreementRate:summary.agreementRate,averageAbsoluteScoreDifference:summary.meanScoreDifference,unresolved:scoped.filter(r=>['REVIEW_REQUESTED','IN_REVIEW'].includes(reviewStatus(r,r.humanReview))).length,inReview:scoped.filter(r=>reviewStatus(r,r.humanReview)==='IN_REVIEW').length},byForm:forms,byQuestion:questions,byType,confidenceBands}
}
export type CalibrationAnalytics=ReturnType<typeof aggregateCalibration>
