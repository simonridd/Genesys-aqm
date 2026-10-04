import type { HumanReview } from './domain/reviews'
import type { Conversation } from './domain/types'

const reviewLabels = { NOT_REVIEWED: 'Not reviewed', REVIEW_REQUESTED: 'Review requested', IN_REVIEW: 'In progress', REVIEWED: 'Completed' } as const
export function humanReviewStatus(status: keyof typeof reviewLabels, ready = false): string {
 return ready && status === 'REVIEW_REQUESTED' ? 'Ready to review' : reviewLabels[status]
}
export function evaluationSourceLabel(source?: string): string {
 return ({ 'genesys-cloud': 'Genesys Cloud', synthetic: 'Synthetic sample', uploaded: 'Uploaded conversation' } as Record<string,string>)[source ?? ''] ?? 'Source unavailable'
}
export function reviewerName(person?: HumanReview['reviewer'], empty = 'Unassigned'): string {
 return person ? person.displayName || 'Reviewer name unavailable' : empty
}
const metadataLabels: Record<string,string> = { queue: 'Queue', direction: 'Direction', topic: 'Topic', tags: 'Tags', transcriptStatus: 'Transcript' }
const identifier = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const sensitiveKey = /secret|token|password|authorization|credential|api.?key|cookie|private.?key/i
const sensitiveValue = /^(?:Bearer\s|eyJ[\w-]+\.eyJ)|-----BEGIN .*PRIVATE KEY-----/i
export function queueName(value: string): string { return identifier.test(value) ? 'Queue name unavailable' : value }
export function safeConversationMetadata(metadata: Conversation['metadata']): [string,string][] {
 return Object.entries(metadata).filter(([key,value]) => value.trim() && !sensitiveKey.test(key) && !sensitiveValue.test(value))
}
/** Explicit task metadata only. A queue name may fall back to its provider ID. */
export function routineConversationMetadata(metadata: Conversation['metadata']): [string,string][] {
 return safeConversationMetadata(metadata).filter(([key,value]) => metadataLabels[key] && !identifier.test(value) && !(key === 'queue' && value === metadata.queueId) && !(key === 'transcriptStatus' && value === 'Available')).map(([key,value]) => [metadataLabels[key], value])
}

export function aiRequestEstimate(count: number, provider = false): string {
 return `up to ${count} AI request${count===1?'':'s'}${provider?' (Jev)':''}`
}
