import type { EmailRecording, RecordingEmail } from './genesysEmail'
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
  constructor(private readonly currentSession: () => AuthSession | null = getSession, private readonly fetcher:typeof fetch = fetch, private readonly emailRelay?: (id:string)=>Promise<Conversation>) {}
  private async request(path: string, init?: RequestInit): Promise<unknown> {
    const session = this.currentSession()
    if (!session) throw new Error('Connect to Genesys Cloud in Settings. Your session may have expired.')
    const response = await (0,this.fetcher)(`${REGIONS[session.region].api}${path}`, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${session.accessToken}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}) } })
    if (response.status === 401) { if (typeof window !== 'undefined') disconnect(); throw new Error('Genesys session expired or was rejected. Check the active authorization.') }
    if (!response.ok) throw new Error(`Genesys API returned HTTP ${response.status}. Check your role and division access.`)
    return response.json()
  }
  async status() {
    const session = this.currentSession()
    if (!session) return { state: 'not-configured' as const, detail: 'Connect to Genesys Cloud in Settings.' }
    try {
      const user = await this.request('/api/v2/users/me') as { id?: string; name?: string; organization?: { name?: string } }
      return { state: 'connected' as const, detail: `Authenticated as ${user.name ?? 'Genesys user'}${user.organization?.name ? ` · ${user.organization.name}` : ''}`, region: session.region, clientId: session.clientId, userId: user.id }
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
  private async loadEmail(detail:GenesysDetail):Promise<Conversation> {
    const conversation=normalizeGenesys(detail)
    const {downloadEmail,emailMediaUrl,MAX_EMAIL_BYTES,normalizeEmails,parseEmail}=await import('./genesysEmail')
    try {
      const base=`/api/v2/conversations/${encodeURIComponent(detail.conversationId!)}/recordings`
      const recordings=await this.request(`${base}?maxWaitMs=5000&formatId=NONE`) as EmailRecording[]
      if(!Array.isArray(recordings))throw Error('Unexpected email recording response.')
      const emails=recordings.filter(r=>r.media?.toLowerCase()==='email')
      if(emails.length>25)throw Error('Too many email recordings (limit 25).')
      const items:Array<{recording:EmailRecording;email:RecordingEmail}>=[]
      let total=0
      for(const summary of emails){
        if(!summary.id||!/^[a-f0-9-]{20,64}$/i.test(summary.id))throw Error('Invalid email recording identity.')
        const recording=await this.request(`${base}/${encodeURIComponent(summary.id)}?emailFormatId=EML&download=true&formatId=NONE`) as EmailRecording
        if(recording.emailTranscript?.length){
          if(recording.emailTranscript.length>100)throw Error('Too many logical emails.')
          total+=new TextEncoder().encode(JSON.stringify(recording.emailTranscript)).byteLength
          if(total>5_000_000)throw Error('Email conversation exceeds the 5 MB limit.')
          for(const email of recording.emailTranscript){if(new TextEncoder().encode(JSON.stringify(email)).length>MAX_EMAIL_BYTES)throw Error('Email content exceeds the 2 MB limit.');items.push({recording,email})}
        }else{
          const urls=[...new Set(Object.values(recording.mediaUris??{}).map(m=>m.mediaUri).filter((v):v is string=>!!v))]
          if(urls.length>1)throw Error('Ambiguous email media response.')
          if(!urls.length)continue
          const bytes=await downloadEmail(emailMediaUrl(urls[0]),this.fetcher);total+=bytes.byteLength
          if(total>5_000_000)throw Error('Email conversation exceeds the 5 MB limit.')
          items.push({recording,email:await parseEmail(bytes)})
        }
      }
      conversation.messages=normalizeEmails(detail,items)
      conversation.metadata.transcriptStatus=conversation.messages.length?'Available':'Unavailable'
      conversation.metadata.transcriptDetail=conversation.messages.length?'':'No email recording content is available.'
    }catch(error){
      conversation.messages=[];conversation.metadata.transcriptStatus='Error'
      // Never return signed media URLs, raw MIME, or provider errors to storage.
      const reason=error instanceof Error?error.message:''
      conversation.metadata.transcriptDetail=/limit|Malformed|mapped|timestamp|identity|Ambiguous|Unrecognized|Unexpected|Too many/.test(reason)?reason:'Email content could not be retrieved. Check recording permissions, retention and media availability.'
    }
    return conversation
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
    if(media.type==='email')return this.emailRelay?this.emailRelay(id):this.loadEmail(detail)
    const transcriptParts: GenesysTranscript[] = []
    let transcriptIssue = ''
    if (media.type === 'voice') {
      if (!media.communicationIds.length) transcriptIssue = 'No customer voice communication ID was found.'
      for (const communicationId of media.communicationIds) {
        try {
          const location = await this.request(`/api/v2/speechandtextanalytics/conversations/${encodeURIComponent(id)}/communications/${encodeURIComponent(communicationId)}/transcripturl`) as { url?: string }
          if (!location.url) continue
          const signed = allowedTranscriptUrl(location.url, region)
          const response = await (0,this.fetcher)(signed.toString(), { credentials: 'omit' })
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
