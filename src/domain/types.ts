export type Speaker = 'agent' | 'customer'
export interface Message { id: string; timestamp: string; speaker: Speaker; text: string }
export interface Conversation {
  conversationId: string; startedAt: string; channel: string
  agent: { id: string; name: string }; customer: { id: string; name: string }
  metadata: Record<string, string>; messages: Message[]
}
export type QuestionType = 'noul' | 'choice' | 'score'
export interface Option { key: string; label: string; description: string; credit?: number; sourceValue?: number }
export interface ScorecardItem {
  id: string; title: string; instructions: string; type: QuestionType
  options: Option[]; weight: number; enabled: boolean; section?: string; sourceGroupWeight?: number
}
export interface Scorecard { id: string; version: number; title: string; threshold: number; items: ScorecardItem[] }
export interface EvaluationRequest { conversation: Conversation; scorecard: Scorecard; evaluatedAt: string; version: 'v0' }
export interface QuestionResult {
  id: string; title: string; type: QuestionType; rawValue: number | string; outcome: string
  probability?: number; confidence?: number; probabilities?: Record<string, number>
  credit: number | null; weight: number; weightedContribution: number | null
}
export interface EvaluationResult {
  conversationId: string; scorecardId: string; scorecardVersion: number; evaluatedAt: string
  provider: 'typesafe'; model: string; questions: QuestionResult[]; overallScore: number | null
  countedWeight: number; rawResponse: unknown
}
export interface EvaluationForm {
  id: string; name: string; description: string; version: number; enabled: boolean
  questions: ScorecardItem[]
  scoring: { yesThreshold: number; passScore: number; criticalQuestionIds: string[] }; origin?: 'genesys-recreated'; sourceFormId?: string
}
export type PolicyField = 'channel' | 'queue' | 'agent' | 'direction' | 'topic' | 'tag'
export interface PolicyCondition { field: PolicyField; operator: 'equals' | 'includes'; value: string }
/** All groups are ORed; all conditions within a group are ANDed. */
export interface InteractionPolicy {
  id: string; name: string; description: string; enabled: boolean
  criteria: { anyOf: PolicyCondition[][] }; evaluationFormIds: string[]
}
export interface PolicyMatch { policyId: string; policyName: string; matchedGroup: PolicyCondition[] }
export interface EvaluationRecord {
  id: string; source: 'jev' | 'synthetic-demo'; conversationId: string
  conversationSource?: 'synthetic' | 'genesys-cloud' | 'uploaded'; policyRunId?: string
  agent: { id: string; name: string }; queue: string; channel: string; topic: string
  policyMatches: PolicyMatch[]; form: EvaluationForm; evaluatedAt: string
  overallScore: number | null; passed: boolean | null; criticalFailures: string[]
  questions: QuestionResult[]; provider: string; model: string
}
export type ConversationSourceId = 'synthetic' | 'genesys-cloud'
export interface ConversationQuery { from: string; to: string; page: number; pageSize: number; queue?: string; agent?: string; channel?: string; direction?: string }
export interface ConversationPage { conversations: Conversation[]; page: number; pageSize: number; total: number; hasMore: boolean }
export interface ConversationSource {
  id: ConversationSourceId; name: string; realData: boolean
  capabilities: { pagination: boolean; filters: Array<'queue' | 'agent' | 'channel' | 'direction'> }
  status(): Promise<{ state: 'connected' | 'not-configured' | 'error'; detail?: string; region?: string; clientId?: string }>
  list(query: ConversationQuery): Promise<ConversationPage>
  load(id: string): Promise<Conversation>
}
export interface PolicyRunFailure { conversationId: string; formId?: string; reason: string }
export interface PolicyRun {
  id: string; policyId: string; policySnapshot: InteractionPolicy; source: ConversationSourceId
  startedAt: string; completedAt?: string; candidateConversationCount: number; matchedConversationCount: number
  formsAssigned: string[]; evaluationsRequested: number; evaluationsSucceeded: number; evaluationsFailed: number
  status: 'running' | 'completed' | 'partial-failure' | 'failed'; failures: PolicyRunFailure[]
}
