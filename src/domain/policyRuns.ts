import { matchPolicies } from './policies'
import { recordEvaluation } from './evaluations'
import { validateForm } from './forms'
import type { Conversation, ConversationSourceId, CoverageCounts, EvaluationForm, EvaluationRecord, EvaluationResult, InteractionPolicy, MonitoringPeriod, MonitoringSampling, PolicyRun, PolicyRunFailure } from './types'

export const MAX_POLICY_CONVERSATIONS = 25
export const SAMPLING_ALGORITHM = 'fnv1a32-v1'
export const policyRunsStorageKey = 'genesys-aqm-v03-policy-runs'
export type PeriodChoice = 'today' | 'yesterday' | 'last7' | 'custom'
/** Local calendar boundaries are converted once to UTC instants. The end is exclusive. */
export function resolveMonitoringPeriod(choice: PeriodChoice, now = new Date(), custom?: MonitoringPeriod): MonitoringPeriod {
  if (choice === 'custom') {
    if (!custom || !Number.isFinite(Date.parse(custom.periodStart)) || !Number.isFinite(Date.parse(custom.periodEnd)) || Date.parse(custom.periodEnd) <= Date.parse(custom.periodStart)) throw new Error('Choose a valid start and end time.')
    return { periodStart: new Date(custom.periodStart).toISOString(), periodEnd: new Date(custom.periodEnd).toISOString() }
  }
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = new Date(day)
  if (choice === 'yesterday') start.setDate(start.getDate() - 1)
  if (choice === 'last7') start.setTime(now.getTime() - 7 * 86400_000)
  const end = choice === 'today' ? now : choice === 'yesterday' ? day : now
  return { periodStart: start.toISOString(), periodEnd: end.toISOString() }
}
function hash(value: string): number {
  // FNV-1a, 32-bit; Math.imul makes the result identical across JS runtimes.
  let n = 2166136261
  for (let i = 0; i < value.length; i++) n = Math.imul(n ^ value.charCodeAt(i), 16777619)
  return n >>> 0
}
export function effectiveSampling(policy: InteractionPolicy): MonitoringSampling { return policy.sampling ?? { strategy: 'all' } }
export function deterministicSeed(policy: InteractionPolicy, period: MonitoringPeriod): string {
  const sampling = effectiveSampling(policy)
  return `${SAMPLING_ALGORITHM}|${policy.id}|${period.periodStart}|${period.periodEnd}|${sampling.strategy}|${sampling.strategy === 'percentage' ? sampling.percentage : sampling.strategy === 'fixed_count' ? sampling.count : ''}|${sampling.seed ?? ''}`
}
export function selectSample(policy: InteractionPolicy, eligible: Conversation[], period: MonitoringPeriod): Conversation[] {
  const sampling = effectiveSampling(policy)
  if (sampling.strategy === 'all') return [...eligible].sort((a,b) => a.conversationId.localeCompare(b.conversationId))
  const size = sampling.strategy === 'percentage' ? Math.floor(eligible.length * Math.max(0, Math.min(100, Number.isFinite(sampling.percentage) ? sampling.percentage : 0)) / 100) : Math.min(eligible.length, Math.max(0, Math.floor(Number.isFinite(sampling.count) ? sampling.count : 0)))
  const seed = deterministicSeed(policy, period)
  return [...eligible].sort((a,b) => hash(`${seed}|${a.conversationId}`) - hash(`${seed}|${b.conversationId}`) || a.conversationId.localeCompare(b.conversationId)).slice(0, size)
}
export interface PlannedConversation { conversation: Conversation; matchedCriteria: string; transcriptAvailable: boolean; alreadyEvaluatedFormIds: string[]; pendingFormIds: string[] }
export interface PolicyRunPlan {
  policySnapshot: InteractionPolicy; source: ConversationSourceId; period: MonitoringPeriod; sampling: MonitoringSampling; seed: string
  candidateCount: number; eligibleCount: number; selected: PlannedConversation[]; formIds: string[]
  sampledCount: number; evaluableCount: number; transcriptUnavailableCount: number; previouslyEvaluatedCount: number
  alreadyEvaluatedAssignmentCount: number; expectedEvaluations: number; coverage: CoverageCounts
  agentCoverage: PolicyRun['agentCoverage']; limitExceeded: boolean
  queueCoverage: PolicyRun['queueCoverage']
}
export function planPolicyRun(policy: InteractionPolicy, candidates: Conversation[], forms: EvaluationForm[], records: EvaluationRecord[], source: ConversationSourceId, period: MonitoringPeriod, reEvaluate = false): PolicyRunPlan {
  const formIds = [...new Set(policy.evaluationFormIds)].filter(id => forms.some(f => f.id === id && f.enabled && validateForm(f).length === 0))
  const eligible = candidates.filter(c => matchPolicies(c, [policy]).length > 0)
  const sampled = selectSample(policy, eligible, period)
  const selected = sampled.map(conversation => {
    const matchedCriteria = matchPolicies(conversation, [policy])[0]?.matchedGroup.map(c => `${c.field} ${c.operator} ${c.value}`).join(' AND ') ?? ''
    const transcriptAvailable = conversation.messages.length > 0
    const alreadyEvaluatedFormIds = transcriptAvailable ? formIds.filter(id => records.some(r => r.source === 'jev' && r.conversationSource === source && r.conversationId === conversation.conversationId && r.form.id === id && r.form.version === forms.find(f => f.id === id)?.version)) : []
    return { conversation, matchedCriteria, transcriptAvailable, alreadyEvaluatedFormIds, pendingFormIds: transcriptAvailable ? formIds.filter(id => reEvaluate || !alreadyEvaluatedFormIds.includes(id)) : [] }
  })
  const evaluableCount = selected.filter(c => c.transcriptAvailable).length
  const previouslyEvaluatedCount = selected.filter(c => c.transcriptAvailable && c.alreadyEvaluatedFormIds.length === formIds.length && formIds.length > 0).length
  const alreadyEvaluatedAssignmentCount = selected.reduce((n,c) => n + c.alreadyEvaluatedFormIds.length, 0)
  const expectedEvaluations = selected.reduce((n,c) => n + c.pendingFormIds.length, 0)
  const coverage: CoverageCounts = { candidateCount: candidates.length, eligibleCount: eligible.length, sampledCount: selected.length, evaluableCount, evaluatedConversationCount: selected.filter(c => c.alreadyEvaluatedFormIds.length > 0).length, evaluationCount: alreadyEvaluatedAssignmentCount, successfulEvaluationCount: alreadyEvaluatedAssignmentCount, failedEvaluationCount: 0, transcriptUnavailableCount: selected.length - evaluableCount }
  const agentIds = [...new Set(eligible.map(c => c.agent.id))]
  const agentCoverage = agentIds.map(agentId => ({ agentId, agentName: eligible.find(c => c.agent.id === agentId)!.agent.name, eligible: eligible.filter(c => c.agent.id === agentId).length, sampled: selected.filter(c => c.conversation.agent.id === agentId).length, evaluated: selected.filter(c => c.conversation.agent.id === agentId && c.alreadyEvaluatedFormIds.length > 0).length }))
  const queueCoverage=[...new Set(eligible.map(c=>c.metadata.queue??'Unspecified'))].map(queue=>({queue,eligible:eligible.filter(c=>(c.metadata.queue??'Unspecified')===queue).length,sampled:selected.filter(c=>(c.conversation.metadata.queue??'Unspecified')===queue).length,evaluated:selected.filter(c=>(c.conversation.metadata.queue??'Unspecified')===queue&&c.alreadyEvaluatedFormIds.length>0).length}))
  return { policySnapshot: structuredClone({...policy,version:policy.version??1}), source, period, sampling: structuredClone(effectiveSampling(policy)), seed: deterministicSeed(policy, period), candidateCount: candidates.length, eligibleCount: eligible.length, selected, formIds, sampledCount: selected.length, evaluableCount, transcriptUnavailableCount: selected.length - evaluableCount, previouslyEvaluatedCount, alreadyEvaluatedAssignmentCount, expectedEvaluations, coverage, agentCoverage, queueCoverage, limitExceeded: selected.length > MAX_POLICY_CONVERSATIONS }
}
// Compatibility with V0.3 callers. New monitoring UI uses planPolicyRun directly.
export interface PolicyRunPreview { candidateCount: number; matched: Conversation[]; formIds: string[]; expectedEvaluations: number; duplicates: Array<{ conversationId: string; formId: string }>; unavailable: string[]; limitExceeded: boolean; plan: PolicyRunPlan }
export function previewPolicyRun(policy: InteractionPolicy, candidates: Conversation[], forms: EvaluationForm[], records: EvaluationRecord[], source: ConversationSourceId, period: MonitoringPeriod = { periodStart: '1970-01-01T00:00:00.000Z', periodEnd: '9999-12-31T00:00:00.000Z' }): PolicyRunPreview {
  const plan = planPolicyRun(policy, candidates, forms, records, source, period)
  return { candidateCount: plan.candidateCount, matched: plan.selected.map(c => c.conversation), formIds: plan.formIds, expectedEvaluations: plan.expectedEvaluations, duplicates: plan.selected.flatMap(c => c.alreadyEvaluatedFormIds.map(formId => ({ conversationId: c.conversation.conversationId, formId }))), unavailable: plan.selected.filter(c => !c.transcriptAvailable).map(c => c.conversation.conversationId), limitExceeded: plan.limitExceeded, plan }
}
export type EvaluateForm = (conversation: Conversation, form: EvaluationForm) => Promise<EvaluationResult>
export async function executePolicyRun(args: { policy: InteractionPolicy; source: ConversationSourceId; preview: PolicyRunPreview; forms: EvaluationForm[]; records: EvaluationRecord[]; evaluate: EvaluateForm; onProgress?: (done: number, total: number) => void; onRecord?: (record: EvaluationRecord) => void; onRun?: (run: PolicyRun) => void; reEvaluate?: boolean }): Promise<{ run: PolicyRun; records: EvaluationRecord[] }> {
  const { policy, source, preview, forms, records, evaluate: evaluateOne, onProgress, onRecord, onRun, reEvaluate = false } = args
  if (preview.limitExceeded) throw new Error(`A policy run is limited to ${MAX_POLICY_CONVERSATIONS} sampled conversations.`)
  const plan = preview.plan
  const tasks = plan.selected.flatMap(c => (reEvaluate ? (c.transcriptAvailable ? plan.formIds : []) : c.pendingFormIds).map(id => ({ conversation: c.conversation, form: forms.find(f => f.id === id)! })))
  const run: PolicyRun = { id: crypto.randomUUID(), policyId: policy.id, policySnapshot: structuredClone(plan.policySnapshot), source, startedAt: new Date().toISOString(), candidateConversationCount: plan.candidateCount, matchedConversationCount: plan.eligibleCount, formsAssigned: [...plan.formIds], evaluationsRequested: tasks.length, evaluationsSucceeded: 0, evaluationsFailed: 0, status: 'running', failures: [], period: structuredClone(plan.period), sampling: structuredClone(plan.sampling), deterministicSeed: plan.seed, sampledConversationIds: plan.selected.map(c => c.conversation.conversationId), evaluableCount: plan.evaluableCount, previouslyEvaluatedCount: plan.previouslyEvaluatedCount, coverage: structuredClone(plan.coverage), agentCoverage: structuredClone(plan.agentCoverage), queueCoverage:structuredClone(plan.queueCoverage) }
  onRun?.(structuredClone(run))
  const created: EvaluationRecord[] = []
  let next = 0, done = 0
  const worker = async () => { while (next < tasks.length) { const task = tasks[next++]; try {
    const result = await evaluateOne(task.conversation, task.form)
    const record = recordEvaluation(task.conversation, task.form, result, matchPolicies(task.conversation, [policy]), undefined, { conversationSource: source, policyRunId: run.id })
    created.push(record); onRecord?.(record); run.evaluationsSucceeded++
  } catch (error) { const failure: PolicyRunFailure = { conversationId: task.conversation.conversationId, formId: task.form.id, reason: error instanceof Error ? error.message : 'Evaluation failed.' }; run.failures.push(failure); run.evaluationsFailed++ }
  done++; onProgress?.(done, tasks.length); onRun?.(structuredClone(run)) } }
  await Promise.all(Array.from({ length: Math.min(2, tasks.length) }, worker))
  const coveredIds = new Set([...plan.selected.filter(c => c.alreadyEvaluatedFormIds.length > 0).map(c => c.conversation.conversationId), ...created.map(r => r.conversationId)])
  run.coverage = { ...plan.coverage, evaluatedConversationCount: coveredIds.size, evaluationCount: plan.alreadyEvaluatedAssignmentCount + run.evaluationsSucceeded + run.evaluationsFailed, successfulEvaluationCount: plan.alreadyEvaluatedAssignmentCount + run.evaluationsSucceeded, failedEvaluationCount: run.evaluationsFailed }
  run.agentCoverage = run.agentCoverage?.map(a => ({ ...a, evaluated: plan.selected.filter(c => c.conversation.agent.id === a.agentId && coveredIds.has(c.conversation.conversationId)).length }))
  run.queueCoverage = run.queueCoverage?.map(q => ({ ...q, evaluated: plan.selected.filter(c => (c.conversation.metadata.queue??'Unspecified') === q.queue && coveredIds.has(c.conversation.conversationId)).length }))
  run.completedAt = new Date().toISOString(); run.status = run.evaluationsFailed ? (run.evaluationsSucceeded ? 'partial-failure' : 'failed') : 'completed'; onRun?.(structuredClone(run))
  return { run, records: [...created, ...records] }
}
export function parsePolicyRuns(raw: string | null): PolicyRun[] { try { const value: unknown = JSON.parse(raw ?? '[]'); return Array.isArray(value) ? value.filter((r): r is PolicyRun => !!r && typeof r === 'object' && typeof r.id === 'string' && typeof r.policyId === 'string') : [] } catch { return [] } }
