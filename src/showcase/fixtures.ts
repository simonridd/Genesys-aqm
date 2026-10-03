import { scoreFormResults, conditionApplies } from '../domain/formComposition'
import { summarize, summarizeCoverage, breakdown } from '../domain/analytics'
import { buildReview, type HumanReview, type HumanAnswer } from '../domain/reviews'
import { reviewDueState } from '../domain/reviewSla'
import type { OverviewSnapshot } from '../domain/overview'
import type { Conversation, EvaluationForm, EvaluationRecord, InteractionPolicy, PolicyRun, QuestionResult } from '../domain/types'
export const demoClock = '2026-10-03T12:00:00Z'
export const demoCapabilities = { reviewer: true, author: true, admin: true, canRun: false, scriptedReview: true } as const
export const demoForm: EvaluationForm = {
  id: 'fictional-resolution', familyId: 'fictional-resolution', name: 'Resolution & ownership', description: 'A fictional customer-service quality standard.', version: 3, enabled: true, status: 'PUBLISHED',
  groups: [{ id: 'care', name: 'Customer care', sourceAsset: { familyId: 'fictional-care', assetId: 'fictional-care-v2', assetVersion: 2 }, scoring: { weight: 1, passScore: .75 } }, { id: 'resolution', name: 'Resolution', scoring: { weight: 2, passScore: .75, critical: true } }, { id: 'escalation', name: 'Escalation', condition: { kind: 'question_outcome', questionId: 'resolved', outcomes: ['No'] }, scoring: { weight: 1 } }],
  questions: [
    { id: 'empathy', title: 'Acknowledged the impact', instructions: 'Did the agent acknowledge the customer’s difficulty?', type: 'noul', options: [], weight: 1, enabled: true, groupId: 'care', sourceAssetQuestionId: 'care-empathy' },
    { id: 'resolved', title: 'Issue resolved', instructions: 'Was the customer’s stated issue resolved?', type: 'noul', options: [], weight: 1, enabled: true, groupId: 'resolution' },
    { id: 'next-step', title: 'Clear next step', instructions: 'Was a specific next step and realistic timeline agreed?', type: 'choice', options: [{ key: 'clear', label: 'Clear next step', description: 'Action and timeline agreed.', credit: 1 }, { key: 'unclear', label: 'Timeline not agreed', description: 'Action given without a clear timeline.', credit: 0 }], weight: 2, enabled: true, groupId: 'resolution' },
    { id: 'escalated', title: 'Escalation owner identified', instructions: 'For unresolved cases, was a named owner or team identified?', type: 'noul', options: [], weight: 1, enabled: true, groupId: 'escalation' },
  ], scoring: { mode: 'GROUP_WEIGHTED', yesThreshold: .7, passScore: .75, criticalQuestionIds: ['next-step'] },
}
export const demoPolicy: InteractionPolicy = { id: 'fictional-support', name: 'Support resolution monitoring', description: 'Controlled fictional voice sampling.', version: 2, enabled: true, criteria: { anyOf: [[{ field: 'queue', operator: 'equals', value: 'Fictional customer service' }]] }, evaluationFormIds: [demoForm.id], sampling: { strategy: 'percentage', percentage: 50, seed: 'fictional-quality' }, schedule: 'daily' }
export const caseConversation: Conversation = { conversationId: 'fictional-case-01', startedAt: '2026-10-02T10:00:00Z', channel: 'voice', agent: { id: 'fictional-agent-1', name: 'Alex Morgan' }, customer: { id: 'fictional-customer-1', name: 'Jamie Taylor' }, metadata: { queue: 'Fictional customer service', topic: 'Resolution guidance', synthetic: 'true', status: 'Completed' }, messages: [
  { id: 'fictional-m1', timestamp: '2026-10-02T10:00:00Z', speaker: 'system', text: 'Fictional transcript prepared for the guided demo.' },
  { id: 'fictional-m2', timestamp: '2026-10-02T10:00:10Z', speaker: 'customer', text: 'The reset link will not work. I need access before my next shift.' },
  { id: 'fictional-m3', timestamp: '2026-10-02T10:00:30Z', speaker: 'agent', text: 'I understand how frustrating that is. Let us try a fresh reset link.' },
  { id: 'fictional-m4', timestamp: '2026-10-02T10:01:00Z', speaker: 'customer', text: 'That worked. How long until my team settings return?' },
  { id: 'fictional-m5', timestamp: '2026-10-02T10:01:30Z', speaker: 'agent', text: 'They should return later. Try signing in again.' },
  { id: 'fictional-m6', timestamp: '2026-10-02T10:02:00Z', speaker: 'customer', text: 'All right, I will try. Thanks.' },
] }
function preparedRecord(index: number): EvaluationRecord {
  const resolved = index % 4 !== 1
  const clear = index % 5 !== 2
  const answers: QuestionResult[] = []
  const applicability = new Map<string, boolean>()
  for (const question of demoForm.questions) {
    const group = demoForm.groups!.find(item => item.id === question.groupId)!
    const applicable = conditionApplies(group.condition, caseConversation, new Map(answers.map(item => [item.id, item]))) === true
    applicability.set(group.id, applicable)
    const yes = question.id === 'resolved' ? resolved : question.id === 'empathy' ? index % 6 !== 3 : true
    const credit = question.type === 'choice' ? Number(clear) : Number(yes)
    answers.push({ id: question.id, title: question.title, type: question.type, status: applicable ? 'ANSWERED' : 'SKIPPED', ...(applicable ? { rawValue: question.type === 'choice' ? clear ? 'clear' : 'unclear' : Number(yes), probability: question.type === 'noul' ? yes ? .9 : .1 : undefined, confidence: question.type === 'choice' ? .56 : undefined } : { skipReason: 'group_condition_false' }), outcome: applicable ? question.type === 'choice' ? clear ? 'Clear next step' : 'Timeline not agreed' : yes ? 'Yes' : 'No' : 'Skipped', credit: applicable ? credit : null, weight: question.weight, weightedContribution: applicable ? credit * question.weight : null })
  }
  const scored = scoreFormResults(demoForm, answers, applicability)
  return { id: `fictional-evaluation-${index + 1}`, source: 'synthetic-demo', conversationSource: 'synthetic', conversationId: index === 0 ? caseConversation.conversationId : `fictional-case-${index + 1}`, agent: caseConversation.agent, queue: caseConversation.metadata.queue, channel: 'voice', topic: 'Resolution guidance', policyMatches: [{ policyId: demoPolicy.id, policyName: demoPolicy.name, matchedGroup: demoPolicy.criteria.anyOf[0] }], form: structuredClone(demoForm), evaluatedAt: `2026-10-02T${String(10 + Math.floor(index / 10)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00Z`, overallScore: scored.overallScore, passed: scored.passed, criticalFailures: scored.criticalFailures, criticalGroupFailures: scored.criticalGroupFailures, scoringMode: scored.scoringMode, groupResults: scored.groups, questions: answers, provider: 'Prepared example — no AI request made', model: 'none', providerRequestCount: 0, reviewState: index === 0 ? 'REVIEW_REQUESTED' : 'NOT_REVIEWED' }
}
export class DemoRepository {
  private records = Array.from({ length: 24 }, (_, index) => preparedRecord(index))
  private review: HumanReview
  constructor() {
    this.review = { ...buildReview(this.records[0], undefined, { action: 'request', expectedRevision: 0, formId: demoForm.id, formVersion: demoForm.version }, { userId: 'fictional-reviewer', displayName: 'Fictional quality lead' }, demoClock), dueAt: '2026-10-03T16:00:00Z' }
  }
  list() { return structuredClone(this.records) }
  case() { return structuredClone(this.records[0]) }
  cohort() { return this.list().filter(record => record.form.id === demoForm.id && record.form.version === demoForm.version && record.questions.some(question => question.id === 'next-step')) }
  humanReview() { return structuredClone(this.review) }
  saveReview(complete: boolean) {
    if (this.review.status === 'REVIEWED') return this.humanReview()
    const record = this.records[0]
    const actor = { userId: 'fictional-reviewer', displayName: 'Fictional quality lead' }
    if (this.review.status === 'REVIEW_REQUESTED') this.review = buildReview(record, this.review, { action: 'start', expectedRevision: this.review.revision, formId: demoForm.id, formVersion: demoForm.version }, actor, demoClock)
    const answers: HumanAnswer[] = record.questions.filter(question => question.status !== 'SKIPPED').map(question => ({ questionId: question.id, value: question.id === 'next-step' ? 'unclear' : question.outcome, note: question.id === 'next-step' ? '“Later” is not an agreed timeline.' : '' }))
    this.review = buildReview(record, this.review, { action: complete ? 'complete' : 'save', expectedRevision: this.review.revision, formId: demoForm.id, formVersion: demoForm.version, answers, notes: 'Scripted disagreement for human calibration.' }, actor, demoClock)
    return this.humanReview()
  }
  overview(): OverviewSnapshot {
    const records = this.list(), due = reviewDueState(this.review, demoClock)
    const run: PolicyRun = { id: 'fictional-run', policyId: demoPolicy.id, policySnapshot: demoPolicy, source: 'synthetic', executionMode: 'scheduled', startedAt: '2026-10-02T12:00:00Z', status: 'completed', failures: [], candidateConversationCount: records.length * 2, matchedConversationCount: records.length * 2, formsAssigned: [demoForm.id], evaluationsRequested: records.length, evaluationsSucceeded: records.length, evaluationsFailed: 0, sampledConversationIds: records.map(record => record.conversationId), coverage: { candidateCount: records.length * 2, eligibleCount: records.length * 2, sampledCount: records.length, evaluableCount: records.length, evaluatedConversationCount: records.length, evaluationCount: records.length, successfulEvaluationCount: records.length, failedEvaluationCount: 0, transcriptUnavailableCount: 0 } }
    const runSummary = { id: run.id, policyId: run.policyId, policyName: demoPolicy.name, status: run.status, startedAt: run.startedAt, trigger: 'simulated scheduled', evaluationsSucceeded: run.evaluationsSucceeded, evaluationsFailed: 0 }
    return { generatedAt: demoClock, range: { days: 7, from: '2026-09-27T00:00:00Z', to: demoClock }, health: { complete: false, status: 'unavailable', reason: 'Demo: no live health check performed.' }, analytics: { complete: true, data: { quality: summarize(records), coverage: summarizeCoverage([run]), qualityTrend: breakdown(records, record => record.evaluatedAt.slice(0, 10)), runCounts: { completed: 1, partial: 0, failed: 0, running: 0 } } }, reviews: { complete: true, data: { open: Number(this.review.status !== 'REVIEWED'), dueSoon: Number(due === 'DUE_SOON'), overdue: Number(due === 'OVERDUE'), escalated: Number(due === 'ESCALATED'), unassigned: Number(this.review.status === 'REVIEW_REQUESTED') } }, alerts: { complete: true, data: { openAlerts: 1, errors: 0, warnings: 1, items: [{ id: 'fictional-alert', severity: 'WARNING', title: 'Resolution guidance needs calibration', evaluationId: records[0].id, createdAt: demoClock }] } }, notifications: { complete: false, status: 'unavailable', reason: 'Delivery is simulated; nothing was sent.' }, schedules: { complete: true, data: { nextRunAt: '2026-10-04T07:00:00Z', items: [{ id: 'fictional-schedule', policyId: demoPolicy.id, policyName: demoPolicy.name, frequency: 'Simulated DAILY · 08:00 Europe/London', nextDueAt: '2026-10-04T07:00:00Z', lastSuccessfulAt: null }] } }, recentRuns: { complete: true, data: { lastRun: runSummary, items: [runSummary] } }, lastAutomatedRun: { complete: true, data: runSummary } }
  }
}
