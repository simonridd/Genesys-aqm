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
  constructor(private readonly proxyBase: string, private readonly accessKey: () => string) {}
  private async request(path: string, init?: RequestInit): Promise<unknown> {
    if (!this.proxyBase) throw new Error('The Genesys proxy is not configured in this release.')
    if (!this.accessKey()) throw new Error('Enter the AQM access key in Settings.')
    const response = await fetch(`${this.proxyBase}${path}`, { ...init, headers: { ...init?.headers, 'X-AQM-Access-Key': this.accessKey(), 'Content-Type': 'application/json' } })
    const data = await response.json() as { error?: string }
    if (!response.ok) throw new Error(data.error ?? `Genesys connection returned HTTP ${response.status}.`)
    return data
  }
  async status() { if (!this.proxyBase || !this.accessKey()) return { state: 'not-configured' as const, detail: 'Configure the Worker URL and enter the AQM access key.' }; try { return await this.request('/v1/genesys/status') as { state: 'connected'|'not-configured'|'error'; detail?: string; region?: string; clientId?: string } } catch (e) { return { state: 'error' as const, detail: e instanceof Error ? e.message : 'Connection error' } } }
  async list(query: ConversationQuery): Promise<ConversationPage> {
    const data = await this.request('/v1/genesys/conversations/search', { method: 'POST', body: JSON.stringify(query) }) as { conversations: GenesysDetail[]; total: number; hasMore: boolean }
    return { conversations: data.conversations.map(c => normalizeGenesys(c)), page: query.page, pageSize: query.pageSize, total: data.total, hasMore: data.hasMore }
  }
  async load(id: string): Promise<Conversation> {
    const data = await this.request(`/v1/genesys/conversations/${encodeURIComponent(id)}`) as { detail: GenesysDetail; transcript?: GenesysTranscript }
    return normalizeGenesys(data.detail, data.transcript)
  }
}
