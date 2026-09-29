export type Speaker = 'agent' | 'customer'
export interface Message { id: string; timestamp: string; speaker: Speaker; text: string }
export interface Conversation {
  conversationId: string; startedAt: string; channel: string
  agent: { id: string; name: string }; customer: { id: string; name: string }
  metadata: Record<string, string>; messages: Message[]
}
export type QuestionType = 'noul' | 'choice' | 'score'
export interface Option { key: string; label: string; description: string; credit?: number }
export interface ScorecardItem {
  id: string; title: string; instructions: string; type: QuestionType
  options: Option[]; weight: number; enabled: boolean
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
