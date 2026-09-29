import { describe, expect, it } from 'vitest'
import sample from '../../public/samples/billing-conversation.json'
import { starterScorecard } from './scorecard'
import { parseConversationJson, validateConversation, validateScorecard } from './validation'
import { fromJevResponse, toJevRequest } from '../provider/jev'
import type { EvaluationRequest, Scorecard } from './types'

const request: EvaluationRequest = { conversation: sample as EvaluationRequest['conversation'], scorecard: starterScorecard, evaluatedAt: '2026-09-29T10:00:00Z', version: 'v0' }
const response = {
  model: 'jev-1.13.0', answers: Object.fromEntries(starterScorecard.items.map(item => {
    if (item.type === 'noul') return [item.id, { type: 'noul', noul: item.id === 'verification' ? 0.64 : 0.95 }]
    if (item.type === 'choice') return [item.id, { type: 'choice', choice: 'partially_resolved', confidence: 0.7, probabilities: { fully_resolved: 0.2, partially_resolved: 0.7, unresolved: 0.1, not_applicable: 0 } }]
    return [item.id, { type: 'score', score: 2.5, confidence: 0.8, probabilities: { '0': 0, '1': 0, '2': 0.5, '3': 0.5 }, legend: { '0': 'Poor', '1': 'Needs improvement', '2': 'Good', '3': 'Excellent' } }]
  })), usage: { input_tokens: 500, output_tokens: 100 }
}

describe('conversation validation', () => {
  it('accepts the synthetic contract', () => expect(validateConversation(sample).errors).toEqual([]))
  it('gives a friendly error for malformed JSON', () => expect(parseConversationJson('{oops').errors[0]).toMatch(/not valid JSON/))
  it('rejects duplicate message IDs and invalid speakers', () => {
    const invalid = structuredClone(sample) as any
    invalid.messages[1].id = invalid.messages[0].id
    invalid.messages[1].speaker = 'system'
    expect(validateConversation(invalid).errors).toEqual(expect.arrayContaining([expect.stringMatching(/duplicate id/), expect.stringMatching(/speaker must be/)]))
  })
})
describe('scorecard and Jev adapter', () => {
  it('rejects duplicate question IDs and bad weights', () => {
    const card = structuredClone(starterScorecard)
    card.items[1].id = card.items[0].id
    card.items[1].weight = -1
    expect(validateScorecard(card)).toEqual(expect.arrayContaining([expect.stringMatching(/duplicate ID/), expect.stringMatching(/weight/)]))
  })
  it('maps all enabled primitives into the documented wire shape', () => {
    const wire = toJevRequest(request)
    expect(wire.model).toBe('jev-latest')
    expect(wire.questions.verification).toEqual({ type: 'noul', instructions: starterScorecard.items[1].instructions })
    expect(wire.questions.resolution).toMatchObject({ type: 'choice', criteria: { fully_resolved: expect.stringContaining('Fully resolved') } })
    expect(wire.questions.empathy).toMatchObject({ type: 'score', criteria: expect.arrayContaining([expect.stringContaining('Excellent')]) })
  })
  it('thresholds Noul while preserving raw probability and calculates weighted score', () => {
    const result = fromJevResponse(request, response)
    const verification = result.questions.find(q => q.id === 'verification')!
    expect(verification.rawValue).toBe(0.64)
    expect(verification.outcome).toBe('No')
    expect(verification.credit).toBe(0)
    const empathy = result.questions.find(q => q.id === 'empathy')!
    expect(empathy.credit).toBeCloseTo(0.835)
    expect(result.overallScore).toBeCloseTo(result.questions.reduce((sum, q) => sum + (q.weightedContribution ?? 0), 0) / result.countedWeight)
  })
  it('uses the configured Noul threshold, and excludes unscored choices', () => {
    const card: Scorecard = { ...starterScorecard, threshold: 0.6 }
    const modified = structuredClone(response)
    modified.answers.resolution = { type: 'choice', choice: 'not_applicable', confidence: 0.9, probabilities: { fully_resolved: 0, partially_resolved: 0.05, unresolved: 0.05, not_applicable: 0.9 } }
    const result = fromJevResponse({ ...request, scorecard: card }, modified)
    expect(result.questions.find(q => q.id === 'verification')?.outcome).toBe('Yes')
    expect(result.questions.find(q => q.id === 'resolution')?.credit).toBeNull()
    expect(result.countedWeight).toBe(starterScorecard.items.reduce((sum, q) => sum + q.weight, 0) - 1.5)
  })
  it('rejects missing or malformed provider answers', () => {
    const modified = structuredClone(response)
    delete modified.answers.verification
    expect(() => fromJevResponse(request, modified)).toThrow(/no valid answer/)
  })
})
