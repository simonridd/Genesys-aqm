import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveMediaContract } from './genesysMedia'
import { normalizeGenesys, type GenesysDetail } from './genesys'
import { GenesysCloudConversationSource } from './sources'
import transcript from '../fixtures/genesys-transcript.json'

const conversationId = '22222222-2222-4222-8222-222222222222'
const agentCommunication = '11111111-1111-4111-8111-111111111111'
const customerCommunication = '33333333-3333-4333-8333-333333333333'
const detail: GenesysDetail = {
  conversationId, conversationStart: '2026-09-28T12:00:00Z', conversationEnd: '2026-09-28T12:05:00Z',
  participants: [
    { purpose: 'agent', participantName: 'Test Agent', userId: '44444444-4444-4444-8444-444444444444', sessions: [{ sessionId: agentCommunication, mediaType: 'voice', segments: [] }] },
    { purpose: 'customer', participantName: 'Test Customer', sessions: [{ sessionId: customerCommunication, mediaType: 'voice', segments: [] }] },
  ],
}
const source = () => new GenesysCloudConversationSource(() => ({ region:'eu-west-1', clientId:'public-client', accessToken:'fixture-token', expiresAt:Date.now()+60_000 }))
const ok = (body: unknown) => new Response(JSON.stringify(body), { status:200, headers:{'Content-Type':'application/json'} })
afterEach(() => vi.unstubAllGlobals())

describe('Genesys media contracts', () => {
  it('selects customer voice communications even when the agent is first', () => {
    expect(resolveMediaContract(detail)).toEqual({ type:'voice', transport:'speech-and-text-analytics', communicationIds:[customerCommunication] })
  })
  it.each(['message','chat','email'] as const)('defines %s separately and never parses it as a voice transcript', mediaType => {
    const digital: GenesysDetail = { ...detail, participants: detail.participants?.map(p => ({...p, sessions:p.sessions?.map(s=>({...s,mediaType}))})) }
    expect(resolveMediaContract(digital)).toEqual({ type:mediaType, transport:mediaType==='message'?'digital-message':mediaType, communicationIds:[customerCommunication] })
    const normalized=normalizeGenesys(digital, transcript)
    expect(normalized.messages).toEqual([])
    expect(normalized.metadata.transcriptStatus).toBe(mediaType==='email'?'Not loaded':'Unsupported')
  })
  it('loads an Ireland voice transcript from the Genesys download host with no bearer header', async () => {
    const calls: Array<{url:string;init?:RequestInit}> = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo|URL, init?:RequestInit) => {
      const url=String(input);calls.push({url,init})
      if (url.endsWith('/details')) return ok(detail)
      if (url.endsWith('/transcripturl')) return ok({url:'https://api-downloads.mypurecloud.ie/transcriptsCache/fixture/signed-transcript?signature=private'})
      if (url.startsWith('https://api-downloads.mypurecloud.ie/')) return ok(transcript)
      throw new Error('Unexpected request')
    }))
    const loaded=await source().load(conversationId)
    expect(calls[1].url).toContain(`/communications/${customerCommunication}/transcripturl`)
    expect(calls.some(c=>c.url.includes(agentCommunication))).toBe(false)
    expect(calls[2].init?.headers).toBeUndefined()
    expect(calls[2].init?.credentials).toBe('omit')
    expect(loaded.messages.map(m=>m.speaker)).toEqual(['customer','agent'])
    expect(loaded.metadata.transcriptStatus).toBe('Available')
    expect(JSON.stringify(loaded)).not.toContain('signature=private')
  })
  it('does not call the voice transcript endpoint for digital media', async () => {
    const digital: GenesysDetail={...detail,participants:detail.participants?.map(p=>({...p,sessions:p.sessions?.map(s=>({...s,mediaType:'message'}))}))}
    const fetcher=vi.fn(async()=>ok(digital));vi.stubGlobal('fetch',fetcher)
    const loaded=await source().load(conversationId)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(loaded.channel).toBe('messaging')
    expect(loaded.metadata.transcriptStatus).toBe('Unsupported')
  })
  it('reports a rejected download host without fetching or exposing its URL', async () => {
    const fetcher=vi.fn(async(input:RequestInfo|URL) => String(input).endsWith('/details')?ok(detail):ok({url:'https://untrusted.example/transcript?token=private'}));vi.stubGlobal('fetch',fetcher)
    const loaded=await source().load(conversationId)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(loaded.metadata.transcriptStatus).toBe('Error')
    expect(loaded.metadata.transcriptDetail).toContain('unrecognized')
    expect(JSON.stringify(loaded)).not.toContain('token=private')
  })
  it('reports browser download failure separately from no transcript', async () => {
    const fetcher=vi.fn(async(input:RequestInfo|URL) => {const url=String(input);if(url.endsWith('/details'))return ok(detail);if(url.endsWith('/transcripturl'))return ok({url:'https://api-downloads.mypurecloud.ie/transcriptsCache/fixture/signed'});throw new TypeError('Failed to fetch')});vi.stubGlobal('fetch',fetcher)
    const loaded=await source().load(conversationId)
    expect(loaded.metadata.transcriptStatus).toBe('Error')
    expect(loaded.metadata.transcriptDetail).toContain('browser could not retrieve')
  })
})
