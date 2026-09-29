import { getSession, disconnect, REGIONS, type AuthSession } from './genesysAuth'
import { sampleLibrary } from './conversations'
import { normalizeGenesys, type GenesysDetail, type GenesysTranscript } from './genesys'
import type { Conversation, ConversationPage, ConversationQuery, ConversationSource } from './types'

export class SyntheticConversationSource implements ConversationSource {
  readonly id = 'synthetic'; readonly name = 'Synthetic'; readonly realData = false
  readonly capabilities = { pagination: true, filters: ['queue','agent','channel','direction'] as Array<'queue'|'agent'|'channel'|'direction'> }
  async status() { return { state: 'connected' as const, detail: '19 fictional conversations. No credentials required.' } }
  async list(query: ConversationQuery): Promise<ConversationPage> {
    const all = sampleLibrary.map(s => s.conversation).filter(c => (!query.queue || c.metadata.queue === query.queue) && (!query.agent || c.agent.id === query.agent) && (!query.channel || c.channel === query.channel) && (!query.direction || c.metadata.direction === query.direction))
    const start = (query.page - 1) * query.pageSize
    return { conversations: all.slice(start, start + query.pageSize), page: query.page, pageSize: query.pageSize, total: all.length, hasMore: start + query.pageSize < all.length }
  }
  async load(id: string): Promise<Conversation> { const found = sampleLibrary.find(s => s.conversation.conversationId === id); if (!found) throw new Error('Conversation not found.'); return found.conversation }
}
export class GenesysCloudConversationSource implements ConversationSource {
  readonly id = 'genesys-cloud'; readonly name = 'Genesys Cloud'; readonly realData = true
  readonly capabilities = { pagination: true, filters: ['queue','agent','channel','direction'] as Array<'queue'|'agent'|'channel'|'direction'> }
  constructor(private readonly currentSession: () => AuthSession | null = getSession) {}
  private async request(path: string, init?: RequestInit): Promise<unknown> {
    const session = this.currentSession()
    if (!session) throw new Error('Connect to Genesys Cloud in Settings. Your session may have expired.')
    const response = await fetch(`${REGIONS[session.region].api}${path}`, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${session.accessToken}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}) } })
    if (response.status === 401) { disconnect(); throw new Error('Genesys session expired or was rejected. Disconnect and connect again.') }
    if (!response.ok) throw new Error(`Genesys API returned HTTP ${response.status}. Check your role and division access.`)
    return response.json()
  }
  async status() {
    const session = this.currentSession()
    if (!session) return { state: 'not-configured' as const, detail: 'Connect to Genesys Cloud in Settings.' }
    try {
      const user = await this.request('/api/v2/users/me') as { name?: string; organization?: { name?: string } }
      return { state: 'connected' as const, detail: `Authenticated as ${user.name ?? 'Genesys user'}${user.organization?.name ? ` · ${user.organization.name}` : ''}`, region: session.region, clientId: session.clientId }
    } catch (e) { return { state: 'error' as const, detail: e instanceof Error ? e.message : 'Connection error' } }
  }
  async list(query: ConversationQuery): Promise<ConversationPage> {
    const from = Date.parse(query.from), to = Date.parse(query.to)
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from || to > Date.now() + 60_000 || to - from > 7 * 86400_000) throw new Error('Select a past range of at most seven days.')
    if (!Number.isInteger(query.page) || query.page < 1 || query.page > 20 || !Number.isInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 25) throw new Error('Invalid Genesys page or page size.')
    const predicates = [query.queue && { dimension: 'queueId', value: query.queue }, query.agent && { dimension: 'userId', value: query.agent }, query.channel && { dimension: 'mediaType', value: query.channel === 'messaging' ? 'message' : query.channel }, query.direction && { dimension: 'direction', value: query.direction }].filter(Boolean)
    const data = await this.request('/api/v2/analytics/conversations/details/query', { method: 'POST', body: JSON.stringify({ interval: `${new Date(from).toISOString()}/${new Date(to).toISOString()}`, order: 'desc', orderBy: 'conversationStart', paging: { pageSize: query.pageSize, pageNumber: query.page }, ...(predicates.length ? { segmentFilters: [{ type: 'and', predicates }] } : {}) }) }) as { conversations?: GenesysDetail[]; totalHits?: number }
    const all = data.conversations ?? []
    const completed = all.filter(c => !!c.conversationEnd)
    return { conversations: completed.map(c => normalizeGenesys(c)), page: query.page, pageSize: query.pageSize, total: data.totalHits ?? completed.length, hasMore: all.length === query.pageSize }
  }
  async load(id: string): Promise<Conversation> {
    if (!/^[a-f0-9-]{20,64}$/i.test(id)) throw new Error('Invalid conversation ID.')
    const detail = await this.request(`/api/v2/analytics/conversations/${encodeURIComponent(id)}/details`) as GenesysDetail
    const queueIds = [...new Set((detail.participants ?? []).flatMap(p => p.sessions?.flatMap(s => s.segments?.map(g => g.queueId).filter((v): v is string => !!v) ?? []) ?? []))].slice(0, 25)
    detail.queueNames = {}
    await Promise.all(queueIds.map(async queueId => { if (!/^[a-f0-9-]{20,64}$/i.test(queueId)) return; try { const queue = await this.request(`/api/v2/routing/queues/${queueId}`) as { name?: string }; if (queue.name) detail.queueNames![queueId] = queue.name } catch { /* name is optional */ } }))
    const session = detail.participants?.flatMap(p => p.sessions ?? []).find(s => s.sessionId && ['message','chat','email','voice'].includes((s.mediaType ?? '').toLowerCase()))
    let transcript: GenesysTranscript | null = null
    if (session?.sessionId) {
      try {
        const location = await this.request(`/api/v2/speechandtextanalytics/conversations/${encodeURIComponent(id)}/communications/${encodeURIComponent(session.sessionId)}/transcripturl`) as { url?: string }
        if (location.url) {
          const signed = new URL(location.url)
          if (signed.protocol !== 'https:' || !(signed.hostname === 's3.amazonaws.com' || signed.hostname.endsWith('.amazonaws.com') || signed.hostname.endsWith('.cloudfront.net'))) throw new Error('Unexpected transcript host.')
          const response = await fetch(signed.toString())
          if (response.ok && Number(response.headers.get('Content-Length') ?? 0) < 5_000_000) { const bytes = await response.arrayBuffer(); if (bytes.byteLength < 5_000_000) transcript = JSON.parse(new TextDecoder().decode(bytes)) as GenesysTranscript }
        }
      } catch { /* Missing transcript or signed URL CORS failure remains unavailable. */ }
    }
    return normalizeGenesys(detail, transcript)
  }
}
