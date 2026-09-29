import { resolveMediaContract } from './genesysMedia'
import { getSession, disconnect, REGIONS, type AuthSession } from './genesysAuth'
import { sampleLibrary } from './conversations'
import { normalizeGenesys, type GenesysDetail, type GenesysTranscript } from './genesys'
import type { Conversation, ConversationPage, ConversationQuery, ConversationSource } from './types'

const transcriptDownloadOrigins: Partial<Record<keyof typeof REGIONS, string>> = {
  // Observed from a real Ireland-region transcript URL returned by Genesys API Explorer.
  'eu-west-1': 'https://api-downloads.mypurecloud.ie',
}
function allowedTranscriptUrl(value: string, region: keyof typeof REGIONS): URL {
  const url = new URL(value)
  const aws = url.hostname === 's3.amazonaws.com' || url.hostname.endsWith('.amazonaws.com') || url.hostname.endsWith('.cloudfront.net')
  const regional = url.origin === transcriptDownloadOrigins[region] && url.pathname.startsWith('/transcriptsCache/')
  if (url.protocol !== 'https:' || (!aws && !regional) || url.username || url.password) throw new Error('Genesys returned an unrecognized transcript download host.')
  return url
}
function parseVoiceTranscript(value: unknown): GenesysTranscript {
  if (!value || typeof value !== 'object' || !Array.isArray((value as GenesysTranscript).transcripts)) throw new Error('Genesys returned an unexpected voice transcript format.')
  const parsed = value as GenesysTranscript
  if (!parsed.transcripts!.every(t => Array.isArray(t.phrases))) throw new Error('Genesys returned an unexpected voice transcript format.')
  return parsed
}

export class SyntheticConversationSource implements ConversationSource {
  readonly id = 'synthetic'; readonly name = 'Synthetic'; readonly realData = false
  readonly capabilities = { pagination: true, filters: ['queue','agent','channel','direction'] as Array<'queue'|'agent'|'channel'|'direction'> }
  async status() { return { state: 'connected' as const, detail: '19 fictional conversations. No credentials required.' } }
  async list(query: ConversationQuery): Promise<ConversationPage> {
    const from = Date.parse(query.from), to = Date.parse(query.to)
    const all = sampleLibrary.map(s => s.conversation).filter(c => (!Number.isFinite(from) || Date.parse(c.startedAt) >= from) && (!Number.isFinite(to) || Date.parse(c.startedAt) < to) && (!query.queue || c.metadata.queue === query.queue) && (!query.agent || c.agent.id === query.agent) && (!query.channel || c.channel === query.channel) && (!query.direction || c.metadata.direction === query.direction))
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
  /** Resolve queue names only when a monitoring policy uses queue-name eligibility. */
  async withQueueNames(conversations: Conversation[]): Promise<Conversation[]> {
    const ids = [...new Set(conversations.map(c => c.metadata.queueId).filter((id): id is string => !!id && /^[a-f0-9-]{20,64}$/i.test(id)))]
    const names = new Map<string,string>()
    for (let offset = 0; offset < ids.length; offset += 4) {
      await Promise.all(ids.slice(offset, offset + 4).map(async id => {
        const queue = await this.request(`/api/v2/routing/queues/${encodeURIComponent(id)}`) as { name?: string }
        if (!queue.name) throw new Error(`Genesys did not return a name for queue ${id}.`)
        names.set(id, queue.name)
      }))
    }
    return conversations.map(c => ({ ...c, metadata: { ...c.metadata, queue: names.get(c.metadata.queueId) ?? c.metadata.queue } }))
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
    const region = this.currentSession()?.region
    if (!region) throw new Error('Connect to Genesys Cloud in Settings. Your session may have expired.')
    const detail = await this.request(`/api/v2/analytics/conversations/${encodeURIComponent(id)}/details`) as GenesysDetail
    const queueIds = [...new Set((detail.participants ?? []).flatMap(p => p.sessions?.flatMap(s => s.segments?.map(g => g.queueId).filter((v): v is string => !!v) ?? []) ?? []))].slice(0, 25)
    detail.queueNames = {}
    await Promise.all(queueIds.map(async queueId => { if (!/^[a-f0-9-]{20,64}$/i.test(queueId)) return; try { const queue = await this.request(`/api/v2/routing/queues/${queueId}`) as { name?: string }; if (queue.name) detail.queueNames![queueId] = queue.name } catch { /* name is optional */ } }))
    const media = resolveMediaContract(detail)
    const transcriptParts: GenesysTranscript[] = []
    let transcriptIssue = ''
    if (media.type === 'voice') {
      if (!media.communicationIds.length) transcriptIssue = 'No customer voice communication ID was found.'
      for (const communicationId of media.communicationIds) {
        try {
          const location = await this.request(`/api/v2/speechandtextanalytics/conversations/${encodeURIComponent(id)}/communications/${encodeURIComponent(communicationId)}/transcripturl`) as { url?: string }
          if (!location.url) continue
          const signed = allowedTranscriptUrl(location.url, region)
          const response = await fetch(signed.toString(), { credentials: 'omit' })
          if (!response.ok) throw new Error(`Transcript download returned HTTP ${response.status}.`)
          if (Number(response.headers.get('Content-Length') ?? 0) >= 5_000_000) throw new Error('Transcript download is too large.')
          const bytes = await response.arrayBuffer()
          if (bytes.byteLength >= 5_000_000) throw new Error('Transcript download is too large.')
          transcriptParts.push(parseVoiceTranscript(JSON.parse(new TextDecoder().decode(bytes)) as unknown))
        } catch (error) {
          const message = error instanceof Error ? error.message : ''
          transcriptIssue = message.includes('HTTP 403') ? 'Transcript access was denied; check recording and Speech and Text Analytics permissions.'
            : message.includes('HTTP 404') ? 'No transcript is available for this voice communication.'
            : message.includes('unrecognized transcript') ? 'Genesys returned an unrecognized transcript download host.'
            : message.includes('unexpected voice transcript') ? 'Genesys returned an unexpected voice transcript format.'
            : message.includes('too large') ? 'Transcript download is too large.'
            : 'The browser could not retrieve the voice transcript. Check the download request and CORS policy.'
        }
      }
    }
    const transcript: GenesysTranscript | null = transcriptParts.length ? { transcripts: transcriptParts.flatMap(part => part.transcripts ?? []) } : null
    const conversation = normalizeGenesys(detail, transcript)
    if (media.type === 'voice' && !conversation.messages.length && transcriptIssue) { conversation.metadata.transcriptStatus = 'Error'; conversation.metadata.transcriptDetail = transcriptIssue }
    return conversation
  }
}
