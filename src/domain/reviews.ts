import { scoreFormResults, effectiveQuestions } from './formComposition'
import type { EvaluationForm, EvaluationRecord, QuestionResult, ScorecardItem } from './types'

export type ReviewStatus = 'NOT_REVIEWED' | 'REVIEW_REQUESTED' | 'IN_REVIEW' | 'REVIEWED'
export interface Reviewer { userId: string; displayName?: string }
export interface ReviewEvent { kind: 'review_requested' | 'review_started' | 'review_saved' | 'review_completed'; at: string; actor: Reviewer; revision: number }
export interface HumanAnswer { questionId: string; value: string | number; note?: string }
export interface QuestionReview {
  questionId: string; title: string; type: ScorecardItem['type']; section?: string
  ai: QuestionResult; human: { value: string | number; outcome: string; credit: number | null; note?: string } | null
  comparison: { exact: boolean; valueDistance: number | null; creditDifference: number | null; band: 'exact' | 'one-band' | 'multi-band' | 'different' } | null
  /** Probability of the selected binary outcome, or provider confidence for choice/score. */
  selectedOutcomeConfidence: number | null
}
export interface HumanReview {
  scoringMode?: EvaluationRecord['scoringMode']; humanGroupResults?: EvaluationRecord['groupResults']; humanPassed?: boolean | null; humanCriticalGroupFailures?: string[]; groupComparison?: Array<{groupId:string; name:string; aiScore:number|null; humanScore:number|null; difference:number|null}>
  id: string; evaluationId: string; conversationId: string; formId: string; formVersion: number; formSnapshot: EvaluationForm
  source: 'genesys-cloud' | 'synthetic' | 'uploaded' | 'unknown'; createdAt: string; updatedAt: string; completedAt?: string
  status: Exclude<ReviewStatus, 'NOT_REVIEWED'>; revision: number; reviewer?: Reviewer; notes: string
  questions: QuestionReview[]; humanOverallScore: number | null
  comparison: { aiOverallScore: number | null; humanOverallScore: number | null; absoluteScoreDifference: number | null; answered: number; agreements: number; disagreements: number; total: number }
  events: ReviewEvent[]
}
export interface ReviewInput { expectedRevision: number; action: 'request' | 'start' | 'save' | 'complete'; formId: string; formVersion: number; answers?: HumanAnswer[]; notes?: string }
export type ReviewEvaluation = EvaluationRecord & { humanReview?: HumanReview }
export const reviewSource = (record: EvaluationRecord): HumanReview['source'] => record.source === 'synthetic-demo' ? 'synthetic' : record.conversationSource ?? 'unknown'
export const reviewStatus = (record: EvaluationRecord, review?: HumanReview): ReviewStatus => review?.status ?? record.reviewState ?? 'NOT_REVIEWED'
const boundedNote = (note: unknown, max: number): string => {
  if (note === undefined) return ''
  if (typeof note !== 'string' || note.length > max) throw Error(`Review note must be text of at most ${max} characters.`)
  return note.trim()
}
export function answerCredit(question: ScorecardItem, value: unknown): { value: string | number; outcome: string; credit: number | null } {
  if (question.type === 'noul') {
    if (value !== 'Yes' && value !== 'No') throw Error('Select Yes or No.')
    return { value, outcome: value, credit: value === 'Yes' ? 1 : 0 }
  }
  const option = question.type === 'choice' ? question.options.find(item => item.key === value) : typeof value === 'number' && Number.isInteger(value) ? question.options[value] : undefined
  if (!option) throw Error(`Invalid answer for ${question.title}.`)
  return { value: value as string | number, outcome: option.label, credit: option.credit ?? (question.type === 'score' ? Number(value) / (question.options.length - 1) : null) }
}
export function compareAnswer(question: ScorecardItem, ai: QuestionResult, human: ReturnType<typeof answerCredit>): NonNullable<QuestionReview['comparison']> {
  // Noul outcomes were normalized with the evaluated form's threshold; never reinterpret its probability.
  const exact = question.type === 'noul' ? ai.outcome.trim().toLowerCase() === human.outcome.toLowerCase() : ai.rawValue === human.value
  const distance = question.type === 'score' && typeof ai.rawValue === 'number' ? Math.abs(ai.rawValue - Number(human.value)) : null
  return { exact, valueDistance: distance, creditDifference: ai.credit === null || human.credit === null ? null : human.credit - ai.credit, band: exact ? 'exact' : distance === null ? 'different' : distance <= 1 ? 'one-band' : 'multi-band' }
}
export function selectedConfidence(ai: QuestionResult): number | null {
  const value = ai.type === 'noul' && ai.probability !== undefined ? ai.outcome.toLowerCase() === 'yes' ? ai.probability : 1 - ai.probability : ai.confidence ?? ai.probability
  return value !== undefined && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null
}
const stableSnapshot=(value:unknown):string=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item)
export function buildReview(record: EvaluationRecord, prior: HumanReview | undefined, input: ReviewInput, actor: Reviewer, now: string): HumanReview {
  if (record.purpose === 'FORM_TEST') throw Error('Form tests are not production evaluations.')
  if (input.formId !== record.form.id || input.formVersion !== record.form.version) throw Error('Evaluation form snapshot does not match.')
  if (prior && (prior.evaluationId !== record.id || stableSnapshot(prior.formSnapshot) !== stableSnapshot(record.form) || prior.questions.some(q=>stableSnapshot(q.ai)!==stableSnapshot(record.questions.find(ai=>ai.id===q.questionId))))) throw Error('Evaluation snapshot changed; review cannot be updated.')
  if (!Number.isInteger(input.expectedRevision) || input.expectedRevision < 0) throw Error('Expected revision is required.')
  if (!['request', 'start', 'save', 'complete'].includes(input.action)) throw Error('Invalid review action.')
  if (prior?.status === 'REVIEWED') throw Error('Completed reviews are immutable.')
  if (input.action === 'request' && prior) throw Error('Review has already been requested or started.')
  if (input.action === 'start' && prior?.status === 'IN_REVIEW') throw Error('Review is already in progress.')
  if ((prior?.events.length ?? 0) >= 200) throw Error('Review audit limit reached; contact the operator.')
  if (!actor.userId) throw Error('Verified reviewer identity is required.')
  const snapshotQuestions = effectiveQuestions(record.form).filter(q => q.enabled)
  if (!snapshotQuestions.length || new Set(snapshotQuestions.map(q=>q.id)).size !== snapshotQuestions.length || record.questions.filter(q=>q.skipReason!=='disabled').length !== snapshotQuestions.length || snapshotQuestions.some(q=>!record.questions.some(ai=>ai.id===q.id&&ai.type===q.type))) throw Error('Evaluation question snapshot is incomplete or inconsistent.')
  if (input.answers !== undefined && !Array.isArray(input.answers)) throw Error('Answers must be an array.')
  if ((input.action === 'request' || input.action === 'start') && (input.answers?.length || input.notes !== undefined)) throw Error('Use Save review to submit answers or notes.')
  const answers = input.answers ?? prior?.questions.flatMap(q => q.human ? [{questionId:q.questionId,value:q.human.value,note:q.human.note}] : []) ?? []
  if (new Set(answers.map(answer=>answer?.questionId)).size !== answers.length || answers.some(answer=>!answer||!snapshotQuestions.some(q=>q.id===answer.questionId)||record.questions.find(q=>q.id===answer.questionId)?.status==='SKIPPED')) throw Error('Invalid or duplicate question reference.')
  const questions: QuestionReview[] = snapshotQuestions.map(question => {
    const ai = structuredClone(record.questions.find(item=>item.id===question.id)!)
    const answer = answers.find(item=>item.questionId===question.id)
    const human = answer ? {...answerCredit(question,answer.value), note:boundedNote(answer.note,2000)} : null
    return {questionId:question.id,title:question.title,type:question.type,section:record.form.groups?.find(g=>g.id===question.groupId)?.name??question.section,ai,human,comparison:human?compareAnswer(question,ai,human):null,selectedOutcomeConfidence:selectedConfidence(ai)}
  })
  const answered = questions.filter(q=>q.human).length
  if (input.action === 'complete' && answered !== questions.filter(q=>q.ai.status!=='SKIPPED').length) throw Error('Answer every evaluated question before completing the review.')
  const humanQuestions: QuestionResult[] = questions.map(q=>({...q.ai,credit:q.human?.credit??null,weightedContribution:q.human?.credit==null?null:q.human.credit*q.ai.weight}))
  const humanScore=scoreFormResults(record.form,humanQuestions,new Map((record.groupResults??[]).map(g=>[g.groupId,g.status!=='SKIPPED'])))
  const humanOverallScore=humanScore.overallScore
  const aiGroups=record.groupResults??scoreFormResults(record.form,record.questions).groups
  const groupComparison=humanScore.groups.map(g=>{const aiScore=aiGroups.find(a=>a.groupId===g.groupId)?.overallScore??null;return {groupId:g.groupId,name:g.name,aiScore,humanScore:g.overallScore,difference:aiScore===null||g.overallScore===null?null:g.overallScore-aiScore}})
  const revision = (prior?.revision ?? 0)+1
  const status = input.action === 'request' ? 'REVIEW_REQUESTED' : input.action === 'complete' ? 'REVIEWED' : 'IN_REVIEW'
  const events: ReviewEvent[] = [...(prior?.events ?? [])]
  if (!prior && input.action !== 'request') events.push({kind:'review_requested',at:now,actor,revision})
  if (input.action !== 'start' && status !== 'REVIEW_REQUESTED' && prior?.status !== 'IN_REVIEW') events.push({kind:'review_started',at:now,actor,revision})
  events.push({kind:input.action==='request'?'review_requested':input.action==='complete'?'review_completed':input.action==='start'?'review_started':'review_saved',at:now,actor,revision})
  if(events.length>200)throw Error('Review audit limit reached; contact the operator.')
  // Only complete scores enter calibration. A partial score is explicitly a progress preview.
  return {id:record.id,evaluationId:record.id,conversationId:record.conversationId,formId:record.form.id,formVersion:record.form.version,formSnapshot:structuredClone(record.form),source:reviewSource(record),createdAt:prior?.createdAt??now,updatedAt:now,completedAt:status==='REVIEWED'?now:undefined,status,revision,reviewer:status==='REVIEW_REQUESTED'?prior?.reviewer:structuredClone(actor),notes:boundedNote(input.notes??prior?.notes,4000),questions,humanOverallScore,scoringMode:humanScore.scoringMode,humanGroupResults:humanScore.groups,humanPassed:humanScore.passed,humanCriticalGroupFailures:humanScore.criticalGroupFailures,groupComparison,comparison:{aiOverallScore:record.overallScore,humanOverallScore,absoluteScoreDifference:record.overallScore===null||humanOverallScore===null?null:Math.abs(record.overallScore-humanOverallScore),answered,agreements:questions.filter(q=>q.comparison?.exact).length,disagreements:questions.filter(q=>q.comparison&&!q.comparison.exact).length,total:questions.filter(q=>q.ai.status!=='SKIPPED').length},events}
}
export function matchesReviewQueue(record: ReviewEvaluation, query: URLSearchParams): boolean {
  const form=query.get('form'),status=query.get('reviewStatus'),question=query.get('reviewQuestion')
  return record.purpose!=='FORM_TEST' && (!form||record.form.id===form||`${record.form.id}@${record.form.version}`===form)
    && (!status||reviewStatus(record,record.humanReview)===status)
    && (!query.get('source')||query.get('source')==='all'||reviewSource(record)===query.get('source'))
    && (!query.get('agent')||record.agent.name.toLowerCase().includes(query.get('agent')!.toLowerCase())||record.agent.id===query.get('agent'))
    && (!query.get('queue')||record.queue.toLowerCase().includes(query.get('queue')!.toLowerCase()))
    && (!query.get('from')||record.evaluatedAt>=query.get('from')!) && (!query.get('to')||record.evaluatedAt<=query.get('to')!)
    && (!question||!!record.humanReview?.questions.some(q=>q.questionId===question&&q.human&&(query.get('comparison')!=='disagreements'||!q.comparison?.exact)))
}
export function calibrationSample(records: ReviewEvaluation[], query: URLSearchParams, count: number, strategy: 'recent' | 'deterministic', seed: string): ReviewEvaluation[] {
  if (!Number.isInteger(count)||count<1||count>20) throw Error('Select between 1 and 20 evaluations.')
  if (!['recent','deterministic'].includes(strategy)) throw Error('Invalid sampling strategy.')
  if (seed.length>200) throw Error('Sample seed is too long.')
  const hash=(value:string)=>{let result=2166136261;for(const char of value){result^=char.charCodeAt(0);result=Math.imul(result,16777619)}return result>>>0}
  return records.filter(record=>matchesReviewQueue(record,query)&&reviewStatus(record,record.humanReview)==='NOT_REVIEWED')
    .sort((a,b)=> strategy==='recent' ? b.evaluatedAt.localeCompare(a.evaluatedAt)||a.id.localeCompare(b.id) : hash(`${seed}|${a.id}`)-hash(`${seed}|${b.id}`)||a.id.localeCompare(b.id)).slice(0,count)
}
