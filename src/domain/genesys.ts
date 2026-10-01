import { resolveMediaContract } from './genesysMedia'
import type { Conversation, Message } from './types'

export type GenesysSession = { sessionId?: string; addressSelf?: string; mediaType?: string; direction?: string; segments?: Array<{ segmentEnd?: string; wrapUpCode?: string; queueId?: string }> }
export type GenesysParticipant = { participantId?: string; purpose?: string; userId?: string; externalContactId?: string; participantName?: string; sessions?: GenesysSession[] }
export type GenesysDetail = { conversationId?: string; conversationStart?: string; conversationEnd?: string; participants?: GenesysParticipant[]; originatingDirection?: string; queueNames?: Record<string,string> }
type Phrase = { text?: string; decoratedText?: string; participantPurpose?: string; startTimeMs?: number; phraseIndex?: number }
export type GenesysTranscript = { transcripts?: Array<{ phrases?: Phrase[] }>; participants?: Array<{ participantPurpose?: string; participantName?: string }> }
const fallback = 'Unspecified'
const purpose = (p: GenesysParticipant) => (p.purpose ?? '').toLowerCase()
const first = <T>(items: T[] | undefined, predicate: (item: T) => boolean) => items?.find(predicate)
export function normalizeGenesys(detail: GenesysDetail, transcript?: GenesysTranscript | null): Conversation {
  if (!detail.conversationId || !detail.conversationStart) throw new Error('Genesys returned an interaction without an ID or start time.')
  const participants = detail.participants ?? []
  const agent = first(participants, p => purpose(p) === 'agent' || purpose(p) === 'user')
  const customer = first(participants, p => purpose(p) === 'customer' || purpose(p) === 'external')
  const sessions = participants.flatMap(p => p.sessions ?? [])
  const media = resolveMediaContract(detail)
  const session = first(sessions, s => s.mediaType?.toLowerCase() === media.type)
  const agentSession = agent?.sessions?.[0]
  const queueId = first(sessions.flatMap(s => s.segments ?? []), s => !!s.queueId)?.queueId ?? ''
  const wrapUpCode = first(sessions.flatMap(s => s.segments ?? []), s => !!s.wrapUpCode)?.wrapUpCode ?? ''
  const startMs = Date.parse(detail.conversationStart)
  const phrases = media.type === 'voice' ? transcript?.transcripts?.flatMap(t => t.phrases ?? []) ?? [] : []
  const messages: Message[] = phrases.filter(p => !!(p.decoratedText ?? p.text)?.trim()).map((p, i) => ({
    id: `${detail.conversationId}-${i}`,
    speaker: (['internal', 'agent', 'user'].includes((p.participantPurpose ?? '').toLowerCase()) ? 'agent' : 'customer') as Message['speaker'],
    timestamp: Number.isFinite(p.startTimeMs) ? new Date((p.startTimeMs ?? 0) > 1e11 ? p.startTimeMs! : startMs + (p.startTimeMs ?? 0)).toISOString() : detail.conversationStart!,
    text: (p.decoratedText ?? p.text)!.trim(),
  })).sort((a,b) => a.timestamp.localeCompare(b.timestamp))
  const duration = detail.conversationEnd ? Math.max(0, Math.round((Date.parse(detail.conversationEnd) - startMs) / 1000)) : 0
  return {
    conversationId: detail.conversationId, startedAt: detail.conversationStart,
    channel: media.type === 'message' ? 'messaging' : media.type === 'unknown' ? fallback.toLowerCase() : media.type,
    agent: { id: agent?.userId ?? agent?.participantId ?? '', name: agent?.participantName ?? 'Unknown agent' },
    customer: { id: customer?.externalContactId ?? customer?.participantId ?? '', name: customer?.participantName ?? 'Customer' },
    metadata: { source: 'genesys-cloud', status: detail.conversationEnd ? 'Completed' : 'In progress', conversationEnd: detail.conversationEnd ?? '', direction: session?.direction ?? detail.originatingDirection ?? '', agent: agent?.userId ?? '', queue: detail.queueNames?.[queueId] ?? queueId, queueId, topic: wrapUpCode, wrapUpCode, durationSeconds: String(duration), sessionId: media.type === 'voice' ? (media.communicationIds[0] ?? '') : (session?.sessionId ?? agentSession?.sessionId ?? ''), transcriptStatus: messages.length ? 'Available' : ['email','message'].includes(media.type) ? 'Not loaded' : media.type==='voice' ? 'Unavailable' : 'Unsupported', transcriptDetail: ['voice','email','message'].includes(media.type) ? '' : `${media.type} transcript retrieval is not implemented yet.` },
    messages,
  }
}
