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
  condition?: { kind:'question_outcome'; questionId:string; outcomes:string[] } | { kind:'interaction_metadata'; field:'channel'|'queue'|'direction'|'topic'; equals:string }
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
  familyId?: string; status?: 'DRAFT' | 'TESTING' | 'PUBLISHED' | 'RETIRED'; createdAt?: string; updatedAt?: string; publishedAt?: string
  questions: ScorecardItem[]
  scoring: { yesThreshold: number; passScore: number; criticalQuestionIds: string[] }; origin?: 'genesys-recreated'; sourceFormId?: string
}
export type PolicyField = 'channel' | 'queue' | 'agent' | 'direction' | 'topic' | 'tag'
export interface PolicyCondition { field: PolicyField; operator: 'equals' | 'includes'; value: string }
/** All groups are ORed; all conditions within a group are ANDed. */
export interface InteractionPolicy {
  id: string; name: string; description: string; enabled: boolean; version?: number
  createdAt?: string; updatedAt?: string
  criteria: { anyOf: PolicyCondition[][] }; evaluationFormIds: string[]
  sampling?: MonitoringSampling
  schedule?: 'manual' | 'daily' | 'weekly'
}
export type MonitoringSampling = { strategy: 'all'; seed?: string } | { strategy: 'percentage'; percentage: number; seed?: string } | { strategy: 'fixed_count'; count: number; seed?: string }
export interface MonitoringPeriod { periodStart: string; periodEnd: string }
export interface CoverageCounts {
  candidateCount: number; eligibleCount: number; sampledCount: number; evaluableCount: number
  evaluatedConversationCount: number; evaluationCount: number; successfulEvaluationCount: number; failedEvaluationCount: number
  transcriptUnavailableCount: number
}
export interface PolicyMatch { policyId: string; policyName: string; matchedGroup: PolicyCondition[] }
export interface EvaluationRecord {
  id: string; source: 'jev' | 'synthetic-demo'; conversationId: string
  createdAt?: string; updatedAt?: string
  purpose?: 'PRODUCTION' | 'FORM_TEST'; reviewState?: 'NOT_REVIEWED' | 'REVIEW_REQUESTED' | 'REVIEWED'; reviewedAt?: string
  conversationSource?: 'synthetic' | 'genesys-cloud' | 'uploaded'; policyRunId?: string; executionMode?: 'manual' | 'scheduled'
  agent: { id: string; name: string }; queue: string; channel: string; topic: string
  policyMatches: PolicyMatch[]; form: EvaluationForm; evaluatedAt: string
  overallScore: number | null; passed: boolean | null; criticalFailures: string[]
  questions: QuestionResult[]; provider: string; model: string
}
export interface FormTestRun {
  id: string; formId: string; formSnapshot: EvaluationForm; createdAt: string
  status?: 'running' | 'completed' | 'partial-failure' | 'failed'
  sampleSource: ConversationSourceId; selectedConversationIds: string[]
  sampleConfiguration: { strategy: 'manual' | 'recent' | 'deterministic-random'; count: number; seed?: string; filters?: Record<string,string> }
  expectedRequests: number; provider?: string; model?: string
  results: EvaluationRecord[]; failures: Array<{ conversationId: string; reason: string }>
}
export type ConversationSourceId = 'synthetic' | 'genesys-cloud'
export interface ConversationQuery { from: string; to: string; page: number; pageSize: number; queue?: string; agent?: string; channel?: string; direction?: string }
export interface ConversationPage { conversations: Conversation[]; page: number; pageSize: number; total: number; hasMore: boolean }
export interface ConversationSource {
  id: ConversationSourceId; name: string; realData: boolean
  capabilities: { pagination: boolean; filters: Array<'queue' | 'agent' | 'channel' | 'direction'> }
  status(): Promise<{ state: 'connected' | 'not-configured' | 'error'; detail?: string; region?: string; clientId?: string; userId?: string }>
  list(query: ConversationQuery, refresh?:boolean): Promise<ConversationPage>
  load(id: string, refresh?:boolean): Promise<Conversation>
}
export interface PolicyRunFailure { conversationId: string; formId?: string; reason: string }
export interface PolicyRun {
  id: string; policyId: string; policySnapshot: InteractionPolicy; source: ConversationSourceId
  updatedAt?: string
  executionMode?: 'manual' | 'scheduled'; scheduleId?: string
  startedAt: string; completedAt?: string; candidateConversationCount: number; matchedConversationCount: number
  formsAssigned: string[]; evaluationsRequested: number; evaluationsSucceeded: number; evaluationsFailed: number
  status: 'running' | 'completed' | 'partial-failure' | 'failed'; failures: PolicyRunFailure[]
  period?: MonitoringPeriod; sampling?: MonitoringSampling; deterministicSeed?: string
  sampledConversationIds?: string[]; evaluableCount?: number; previouslyEvaluatedCount?: number
  coverage?: CoverageCounts; agentCoverage?: Array<{ agentId: string; agentName: string; eligible: number; sampled: number; evaluated: number }>
  queueCoverage?: Array<{ queue: string; eligible: number; sampled: number; evaluated: number }>
}
