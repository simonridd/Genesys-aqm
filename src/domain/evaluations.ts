import type { Conversation, EvaluationForm, EvaluationRecord, EvaluationResult, PolicyMatch } from './types'
export const historyStorageKey = 'genesys-aqm-v02-history'
export function recordEvaluation(conversation: Conversation, form: EvaluationForm, result: EvaluationResult, matches: PolicyMatch[], id: string = crypto.randomUUID(), provenance?: Pick<EvaluationRecord, 'conversationSource' | 'policyRunId'>): EvaluationRecord {
  const relevant = matches.filter(match => match.policyId)
  const criticalFailures = form.scoring.criticalQuestionIds.filter(questionId => result.questions.some(q => q.id === questionId && q.credit !== null && q.credit < 1))
  return { id, source: 'jev', conversationId: conversation.conversationId, conversationSource: provenance?.conversationSource ?? (conversation.metadata.source === 'genesys-cloud' ? 'genesys-cloud' : conversation.metadata.synthetic === 'true' ? 'synthetic' : 'uploaded'), policyRunId: provenance?.policyRunId, agent: structuredClone(conversation.agent), queue: conversation.metadata.queue ?? 'Unspecified', channel: conversation.channel, topic: conversation.metadata.topic ?? 'Unspecified', policyMatches: structuredClone(relevant), form: structuredClone(form), evaluatedAt: result.evaluatedAt, overallScore: result.overallScore, passed: result.overallScore === null ? null : result.overallScore >= form.scoring.passScore && criticalFailures.length === 0, criticalFailures, questions: structuredClone(result.questions), provider: result.provider, model: result.model }
}
export function serializeHistory(records: EvaluationRecord[]): string { return JSON.stringify(records) }
export function parseHistory(raw: string | null): EvaluationRecord[] {
  if (!raw) return []
  try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter((v): v is EvaluationRecord => !!v && typeof v === 'object' && typeof v.id === 'string' && typeof v.conversationId === 'string' && typeof v.form?.version === 'number' && Array.isArray(v.questions) && (v.source === 'jev' || v.source === 'synthetic-demo')) : [] } catch { return [] }
}
