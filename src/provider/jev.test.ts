import { afterEach, describe, expect, it, vi } from 'vitest'
import { JevProxyProvider } from './jev'
import sample from '../../public/samples/billing-conversation.json'
import type { EvaluationRequest } from '../domain/types'

const request: EvaluationRequest = {
  conversation: sample as EvaluationRequest['conversation'],
  scorecard: { id: 'test', title: 'Test', version: 1, threshold: 0.65, items: [{ id: 'greeting', title: 'Greeting', instructions: 'Did the agent greet the customer?', type: 'noul', options: [], weight: 1, enabled: true }] },
  evaluatedAt: '2026-09-29T10:00:00Z', version: 'v0',
}
afterEach(() => vi.unstubAllGlobals())
describe('browser proxy transport', () => {
  it('requires a configured proxy before sending a key', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(new JevProxyProvider('').evaluate(request, 'test-only-key')).rejects.toThrow(/proxy is not configured/)
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('sends the typed request to the configured proxy and normalizes its response', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ model: 'jev-test', answers: { greeting: { type: 'noul', noul: 0.8 } } }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await new JevProxyProvider('https://proxy.example/v1/systemone').evaluate(request, 'test-only-key')
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://proxy.example/v1/systemone')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST', headers: { Authorization: 'Bearer test-only-key' } })
    expect(result.questions[0].outcome).toBe('Yes')
  })
})
