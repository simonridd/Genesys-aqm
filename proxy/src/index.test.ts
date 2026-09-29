import { describe, expect, it, vi } from 'vitest'
import worker, { handleRequest } from './index'

const endpoint = 'https://genesys-aqm-jev-proxy.example.workers.dev/v1/systemone'
const origin = 'https://simonridd.github.io'
const wire = JSON.stringify({ model: 'jev-latest', state: { conversation: 'synthetic test' }, questions: { greeting: { type: 'noul', instructions: 'Was there a greeting?' } } })
const request = (method: string, body?: string, headers: Record<string, string> = {}) => new Request(endpoint, { method, headers: { Origin: origin, Authorization: 'Bearer test-only-key', 'Content-Type': 'application/json', ...headers }, body })

describe('Jev proxy', () => {
  it('answers valid preflight with a specific origin', async () => {
    const response = await handleRequest(request('OPTIONS', undefined, { 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' }))
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin)
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization')
  })
  it('rejects other origins without forwarding', async () => {
    const upstream = vi.fn()
    const response = await handleRequest(request('POST', wire, { Origin: 'https://other.example' }), upstream)
    expect(response.status).toBe(403)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(upstream).not.toHaveBeenCalled()
  })
  it('forwards a bounded request to the fixed TypeSafe endpoint', async () => {
    const upstream = vi.fn(async () => new Response('{"model":"jev-test","answers":{}}', { status: 200, headers: { 'Content-Type': 'application/json' } }))
    const response = await handleRequest(request('POST', wire), upstream)
    expect(upstream).toHaveBeenCalledOnce()
    expect(upstream.mock.calls[0]?.[0]).toBe('https://api.typesafe.ai/v1/systemone')
    expect(upstream.mock.calls[0]?.[1]).toMatchObject({ method: 'POST', redirect: 'manual', headers: { Authorization: 'Bearer test-only-key', 'Content-Type': 'application/json' } })
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin)
    expect(response.status).toBe(200)
  })
  it('does not follow an upstream redirect with the key', async () => {
    const response = await handleRequest(request('POST', wire), async () => new Response(null, { status: 302, headers: { Location: 'https://elsewhere.example' } }))
    expect(response.status).toBe(502)
  })
  it('blocks malformed and oversized input', async () => {
    expect((await handleRequest(request('POST', 'not json'))).status).toBe(400)
    expect((await handleRequest(request('POST', wire, { 'Content-Length': '1500001' }))).status).toBe(413)
  })
  it('uses the global fetch when Cloudflare supplies env and context', async () => {
    const upstream = vi.fn(async () => new Response('{"error":"unauthorized"}', { status: 401 }))
    vi.stubGlobal('fetch', upstream)
    try {
      const response = await worker.fetch(request('POST', wire), {}, {})
      expect(response.status).toBe(401)
      expect(upstream).toHaveBeenCalledOnce()
    } finally { vi.unstubAllGlobals() }
  })
  it('passes through a TypeSafe 401 without disclosing the key', async () => {
    const response = await handleRequest(request('POST', wire), async () => new Response('{"error":"unauthorized"}', { status: 401 }))
    expect(response.status).toBe(401)
    expect(await response.text()).not.toContain('test-only-key')
  })
})
