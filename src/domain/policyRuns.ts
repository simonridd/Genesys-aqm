import { matchPolicies } from './policies'
import { recordEvaluation } from './evaluations'
import { validateForm } from './forms'
import type { Conversation, ConversationSourceId, EvaluationForm, EvaluationRecord, EvaluationResult, InteractionPolicy, PolicyRun, PolicyRunFailure } from './types'

export const MAX_POLICY_CONVERSATIONS = 25
export const policyRunsStorageKey = 'genesys-aqm-v03-policy-runs'
export interface PolicyRunPreview { candidateCount: number; matched: Conversation[]; formIds: string[]; expectedEvaluations: number; duplicates: Array<{ conversationId: string; formId: string }>; unavailable: string[]; limitExceeded: boolean }
export function previewPolicyRun(policy: InteractionPolicy, candidates: Conversation[], forms: EvaluationForm[], records: EvaluationRecord[], source: ConversationSourceId): PolicyRunPreview {
  const matched = candidates.filter(c => matchPolicies(c, [policy]).length > 0)
  const formIds = [...new Set(policy.evaluationFormIds)].filter(id => forms.some(f => f.id === id && f.enabled && validateForm(f).length === 0))
  const unavailable = matched.filter(c => c.messages.length === 0).map(c => c.conversationId)
  const duplicates = matched.filter(c=>c.messages.length>0).flatMap(c => formIds.filter(id => records.some(r => r.source === 'jev' && r.conversationSource === source && r.conversationId === c.conversationId && r.form.id === id && r.form.version === forms.find(f => f.id === id)?.version)).map(formId => ({ conversationId: c.conversationId, formId })))
  return { candidateCount: candidates.length, matched, formIds, expectedEvaluations: (matched.length - unavailable.length) * formIds.length - duplicates.length, duplicates, unavailable, limitExceeded: matched.length > MAX_POLICY_CONVERSATIONS }
}
export type EvaluateForm = (conversation: Conversation, form: EvaluationForm) => Promise<EvaluationResult>
export async function executePolicyRun(args: { policy: InteractionPolicy; source: ConversationSourceId; preview: PolicyRunPreview; forms: EvaluationForm[]; records: EvaluationRecord[]; evaluate: EvaluateForm; onProgress?: (done: number, total: number) => void; onRecord?: (record: EvaluationRecord) => void; onRun?: (run: PolicyRun) => void; reEvaluate?: boolean }): Promise<{ run: PolicyRun; records: EvaluationRecord[] }> {
  const { policy, source, preview, forms, records, evaluate: evaluateOne, onProgress, onRecord, onRun, reEvaluate = false } = args
  if (preview.limitExceeded) throw new Error(`A policy run is limited to ${MAX_POLICY_CONVERSATIONS} matched conversations.`)
  const duplicateKeys = new Set(preview.duplicates.map(d => `${d.conversationId}|${d.formId}`))
  const tasks = preview.matched.filter(c => c.messages.length).flatMap(c => preview.formIds.filter(id => reEvaluate || !duplicateKeys.has(`${c.conversationId}|${id}`)).map(id => ({ conversation: c, form: forms.find(f => f.id === id)! })))
  const run: PolicyRun = { id: crypto.randomUUID(), policyId: policy.id, policySnapshot: structuredClone(policy), source, startedAt: new Date().toISOString(), candidateConversationCount: preview.candidateCount, matchedConversationCount: preview.matched.length, formsAssigned: preview.formIds, evaluationsRequested: tasks.length, evaluationsSucceeded: 0, evaluationsFailed: 0, status: 'running', failures: [] }
  onRun?.(structuredClone(run))
  const created: EvaluationRecord[] = []
  // Explicit concurrency of two; each success is persisted immediately by the caller.
  let next = 0, done = 0
  const worker = async () => { while (next < tasks.length) { const task = tasks[next++]; try {
    const result = await evaluateOne(task.conversation, task.form)
    const record = recordEvaluation(task.conversation, task.form, result, matchPolicies(task.conversation, [policy]), undefined, { conversationSource: source, policyRunId: run.id })
    created.push(record); onRecord?.(record); run.evaluationsSucceeded++
  } catch (error) { const failure: PolicyRunFailure = { conversationId: task.conversation.conversationId, formId: task.form.id, reason: error instanceof Error ? error.message : 'Evaluation failed.' }; run.failures.push(failure); run.evaluationsFailed++ }
  done++; onProgress?.(done, tasks.length); onRun?.(structuredClone(run)) } }
  await Promise.all(Array.from({ length: Math.min(2, tasks.length) }, worker))
  run.completedAt = new Date().toISOString(); run.status = run.evaluationsFailed ? (run.evaluationsSucceeded ? 'partial-failure' : 'failed') : 'completed'; onRun?.(structuredClone(run))
  return { run, records: [...created, ...records] }
}
export function parsePolicyRuns(raw: string | null): PolicyRun[] { try { const value: unknown = JSON.parse(raw ?? '[]'); return Array.isArray(value) ? value.filter((r): r is PolicyRun => !!r && typeof r === 'object' && typeof r.id === 'string' && typeof r.policyId === 'string') : [] } catch { return [] } }
