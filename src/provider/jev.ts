import type { EvaluationRequest, EvaluationResult, QuestionResult, ScorecardItem } from '../domain/types'
import { validateScorecard } from '../domain/validation'

export interface EvaluationProvider { evaluate(request: EvaluationRequest, apiKey: string): Promise<EvaluationResult> }
type WireQuestion = { type: 'noul' | 'choice' | 'score'; instructions: string; criteria?: Record<string, string> | string[] }
type WireResponse = { model: string; answers: Record<string, unknown>; usage?: unknown }
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const unit = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1
function distribution(v: unknown, keys: string[]): Record<string, number> {
  if (!record(v) || keys.some(k => !unit(v[k]))) throw new Error('Jev returned an invalid probability distribution.')
  return Object.fromEntries(keys.map(k => [k, v[k] as number]))
}
function mapQuestion(item: ScorecardItem): WireQuestion {
  if (item.type === 'noul') return { type: 'noul', instructions: item.instructions }
  if (item.type === 'choice') return { type: 'choice', instructions: item.instructions, criteria: Object.fromEntries(item.options.map(o => [o.key, `${o.label}: ${o.description}`])) }
  return { type: 'score', instructions: item.instructions, criteria: item.options.map(o => `${o.label}: ${o.description}`) }
}
export function toJevRequest(request: EvaluationRequest) {
  const issues = validateScorecard(request.scorecard)
  if (issues.length) throw new Error(issues.join(' '))
  return {
    model: 'jev-latest',
    state: { conversation: request.conversation },
    questions: Object.fromEntries(request.scorecard.items.filter(i => i.enabled).map(i => [i.id, mapQuestion(i)])),
  }
}
function normalizedQuestion(item: ScorecardItem, answer: unknown, threshold: number): QuestionResult {
  if (!record(answer) || answer.type !== item.type) throw new Error(`Jev returned no valid answer for ${item.title}.`)
  let rawValue: number | string, outcome: string, probability: number | undefined, confidence: number | undefined, probabilities: Record<string, number> | undefined, credit: number | null
  if (item.type === 'noul') {
    if (!unit(answer.noul)) throw new Error(`Jev returned an invalid yes probability for ${item.title}.`)
    rawValue = answer.noul; probability = answer.noul; outcome = answer.noul >= threshold ? 'Yes' : 'No'; credit = outcome === 'Yes' ? 1 : 0
  } else if (item.type === 'choice') {
    if (typeof answer.choice !== 'string' || !unit(answer.confidence)) throw new Error(`Jev returned an invalid choice for ${item.title}.`)
    const option = item.options.find(o => o.key === answer.choice)
    if (!option) throw new Error(`Jev selected an unknown option for ${item.title}.`)
    probabilities = distribution(answer.probabilities, item.options.map(o => o.key))
    rawValue = answer.choice; outcome = option.label; probability = probabilities[answer.choice]; confidence = answer.confidence; credit = option.credit ?? null
  } else {
    if (typeof answer.score !== 'number' || !Number.isFinite(answer.score) || answer.score < 0 || answer.score > item.options.length - 1 || !unit(answer.confidence)) throw new Error(`Jev returned an invalid score for ${item.title}.`)
    probabilities = distribution(answer.probabilities, item.options.map((_, i) => String(i)))
    rawValue = answer.score; outcome = `${answer.score.toFixed(2)} / ${item.options.length - 1}`; confidence = answer.confidence
    // Use Jev's probability-weighted position, mapped to the scorecard's explicit credit scale.
    credit = item.options.reduce((sum, option, i) => sum + probabilities![String(i)] * (option.credit ?? i / (item.options.length - 1)), 0)
  }
  return { id: item.id, title: item.title, type: item.type, rawValue, outcome, probability, confidence, probabilities, credit, weight: item.weight, weightedContribution: credit === null ? null : credit * item.weight }
}
export function fromJevResponse(request: EvaluationRequest, payload: unknown): EvaluationResult {
  if (!record(payload) || typeof payload.model !== 'string' || !record(payload.answers)) throw new Error('Jev returned an unexpected response.')
  const response = payload as WireResponse
  const questions = request.scorecard.items.filter(i => i.enabled).map(i => normalizedQuestion(i, response.answers[i.id], request.scorecard.threshold))
  const countedWeight = questions.reduce((sum, q) => sum + (q.credit === null ? 0 : q.weight), 0)
  const overallScore = countedWeight > 0 ? questions.reduce((sum, q) => sum + (q.weightedContribution ?? 0), 0) / countedWeight : null
  return { conversationId: request.conversation.conversationId, scorecardId: request.scorecard.id, scorecardVersion: request.scorecard.version, evaluatedAt: request.evaluatedAt, provider: 'typesafe', model: response.model, questions, overallScore, countedWeight, rawResponse: payload }
}
export class JevProxyProvider implements EvaluationProvider {
  constructor(private readonly endpoint: string) {}
  async evaluate(request: EvaluationRequest, apiKey: string): Promise<EvaluationResult> {
    if (!apiKey.trim()) throw new Error('Add a TypeSafe Jev API key in Settings first.')
    if (!this.endpoint) throw new Error('The legacy sandbox Jev proxy is not configured. Choose the durable server sandbox for normal form testing.')
    let response: Response
    try {
      response = await fetch(this.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(toJevRequest(request)) })
    } catch {
      throw new Error('The browser could not reach the Jev proxy. Check the proxy deployment and try again.')
    }
    if (!response.ok) {
      if (response.status === 401) throw new Error('TypeSafe rejected the API key. Check the key in Settings.')
      if (response.status === 429 || response.status === 529) throw new Error('TypeSafe is busy or rate limited. Please try again shortly.')
      throw new Error(`TypeSafe returned HTTP ${response.status}. The evaluation was not completed.`)
    }
    let payload: unknown
    try { payload = await response.json() as unknown } catch { throw new Error('TypeSafe returned a response that was not valid JSON.') }
    return fromJevResponse(request, payload)
  }
}
