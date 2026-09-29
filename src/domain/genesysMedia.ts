import type { GenesysDetail, GenesysParticipant, GenesysSession } from './genesys'

/** Each Genesys media type has its own transcript transport and payload contract. */
export type GenesysMediaContract =
  | { type: 'voice'; transport: 'speech-and-text-analytics'; communicationIds: string[] }
  | { type: 'message'; transport: 'digital-message'; communicationIds: string[] }
  | { type: 'chat'; transport: 'chat'; communicationIds: string[] }
  | { type: 'email'; transport: 'email'; communicationIds: string[] }
  | { type: 'unknown'; transport: 'unsupported'; communicationIds: [] }

export const CUSTOMER_PURPOSES = new Set(['customer', 'external'])
export const MEDIA_TYPES = ['voice', 'message', 'chat', 'email'] as const
export type GenesysMediaType = typeof MEDIA_TYPES[number]
const isMediaType = (value: string): value is GenesysMediaType => MEDIA_TYPES.some(type => type === value)
const sessionsFor = (participant: GenesysParticipant) => participant.sessions ?? []
const validId = (value: string): boolean => /^[a-f0-9-]{20,64}$/i.test(value)

export function resolveMediaContract(detail: GenesysDetail): GenesysMediaContract {
  const participants = detail.participants ?? []
  const customers = participants.filter(p => CUSTOMER_PURPOSES.has((p.purpose ?? '').toLowerCase()))
  const allSessions = participants.flatMap(sessionsFor)
  const customerSessions = customers.flatMap(sessionsFor)
  // Voice wins for mixed-media conversations; the transcript URL belongs to a
  // customer's voice communication, never the agent's session by default.
  const observed = (['voice', 'message', 'chat', 'email'] as const).find(type => allSessions.some(s => s.mediaType?.toLowerCase() === type))
  if (!observed || !isMediaType(observed)) return { type: 'unknown', transport: 'unsupported', communicationIds: [] }
  const communicationIds = [...new Set(customerSessions.filter((s: GenesysSession) => s.mediaType?.toLowerCase() === observed).map(s => s.sessionId).filter((id): id is string => !!id && validId(id)))].slice(0, 10)
  switch (observed) {
    case 'voice': return { type: 'voice', transport: 'speech-and-text-analytics', communicationIds }
    case 'message': return { type: 'message', transport: 'digital-message', communicationIds }
    case 'chat': return { type: 'chat', transport: 'chat', communicationIds }
    case 'email': return { type: 'email', transport: 'email', communicationIds }
  }
}
