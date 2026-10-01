import { scoreFormResults } from './formComposition'
import type { Conversation, EvaluationForm, EvaluationRecord, EvaluationResult, PolicyMatch } from './types'
export const historyStorageKey = 'genesys-aqm-v02-history'
export function recordEvaluation(conversation: Conversation, form: EvaluationForm, result: EvaluationResult, matches: PolicyMatch[], id: string = crypto.randomUUID(), provenance?: Pick<EvaluationRecord, 'conversationSource' | 'policyRunId' | 'executionMode'>): EvaluationRecord {
  const relevant = matches.filter(match => match.policyId)
  const scored = scoreFormResults(form,result.questions,new Map((result.groups??[]).map(g=>[g.groupId,g.status!=='SKIPPED'])))
  if(scored.scoringMode==='QUESTION_WEIGHTED'){scored.overallScore=result.overallScore;scored.passed=scored.criticalFailures.length||scored.criticalGroupFailures.length||scored.scoringAnomalies.length?false:result.overallScore===null?null:result.overallScore>=form.scoring.passScore}
  const {criticalFailures}=scored
  return { id, source: 'jev', purpose: 'PRODUCTION', reviewState: 'NOT_REVIEWED', createdAt: result.evaluatedAt, updatedAt: result.evaluatedAt, conversationId: conversation.conversationId, conversationSource: provenance?.conversationSource ?? (conversation.metadata.source === 'genesys-cloud' ? 'genesys-cloud' : conversation.metadata.synthetic === 'true' ? 'synthetic' : 'uploaded'), policyRunId: provenance?.policyRunId, executionMode: provenance?.executionMode, agent: structuredClone(conversation.agent), queue: conversation.metadata.queue ?? 'Unspecified', channel: conversation.channel, topic: conversation.metadata.topic ?? 'Unspecified', policyMatches: structuredClone(relevant), form: structuredClone(form), evaluatedAt: result.evaluatedAt, scoringMode:scored.scoringMode, criticalGroupFailures:scored.criticalGroupFailures, scoringAnomalies:scored.scoringAnomalies, overallScore: scored.overallScore, passed: scored.passed, criticalFailures, questions: structuredClone(result.questions), providerRequestCount: result.providerRequestCount, groupResults: structuredClone(scored.groups), provider: result.provider, model: result.model }
}
export function serializeHistory(records: EvaluationRecord[]): string { return JSON.stringify(records) }
export function parseHistory(raw: string | null): EvaluationRecord[] {
  if (!raw) return []
  try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter((v): v is EvaluationRecord => !!v && typeof v === 'object' && typeof v.id === 'string' && typeof v.conversationId === 'string' && typeof v.form?.version === 'number' && Array.isArray(v.questions) && (v.source === 'jev' || v.source === 'synthetic-demo')) : [] } catch { return [] }
}
