import type { HumanReview, ReviewEvaluation } from './reviews'
export interface ReviewSlaSettings { dueSoonHours: number; overdueEscalationHours: number | null }
export const defaultReviewSla: ReviewSlaSettings = { dueSoonHours: 24, overdueEscalationHours: 48 }
export type ReviewDueState = 'COMPLETED' | 'NO_DUE_DATE' | 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'ESCALATED'
export function validateReviewSla(value: unknown): ReviewSlaSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid review SLA settings.')
  const v = value as ReviewSlaSettings
  if (!Number.isInteger(v.dueSoonHours) || v.dueSoonHours < 1 || v.dueSoonHours > 168) throw Error('Due soon hours must be an integer from 1 to 168.')
  if (v.overdueEscalationHours !== null && (!Number.isInteger(v.overdueEscalationHours) || v.overdueEscalationHours < 1 || v.overdueEscalationHours > 720)) throw Error('Escalation hours must be null or an integer from 1 to 720.')
  return { dueSoonHours: v.dueSoonHours, overdueEscalationHours: v.overdueEscalationHours }
}
/** Legacy assigned dates remain readable; unassigned dates also belong to HumanReview. */
export const reviewDueAt = (review?: HumanReview) => review?.assignment?.dueAt ?? review?.dueAt
export const activeReview = (review?: HumanReview) => !!review && ['REVIEW_REQUESTED', 'IN_REVIEW'].includes(review.status)
export function reviewDueState(review: HumanReview | undefined, now: string, settings = defaultReviewSla): ReviewDueState {
  if (review?.status === 'REVIEWED') return 'COMPLETED'
  const due = reviewDueAt(review)
  if (!activeReview(review) || !due) return 'NO_DUE_DATE'
  const time = Date.parse(now), deadline = Date.parse(due)
  if (!Number.isFinite(time) || !Number.isFinite(deadline)) throw Error('Review SLA requires valid timestamps.')
  if (settings.overdueEscalationHours !== null && time >= deadline + settings.overdueEscalationHours * 3600000) return 'ESCALATED'
  if (time >= deadline) return 'OVERDUE'
  return time >= deadline - settings.dueSoonHours * 3600000 ? 'DUE_SOON' : 'ON_TRACK'
}
export function reviewDueText(review: HumanReview | undefined, now: string): string {
  if (!activeReview(review) || !reviewDueAt(review)) return ''
  const delta = Date.parse(reviewDueAt(review)!) - Date.parse(now), hours = delta < 0 ? Math.floor(Math.abs(delta) / 3600000) : Math.ceil(delta / 3600000)
  if(delta<0&&hours===0)return 'Overdue by less than 1 hour'
  const count = hours >= 48 ? delta < 0 ? Math.floor(hours / 24) : Math.ceil(hours / 24) : hours, unit = hours >= 48 ? 'day' : 'hour'
  return delta === 0 ? 'Due now' : `${delta < 0 ? 'Overdue by' : 'Due in'} ${count} ${unit}${count === 1 ? '' : 's'}`
}
export function reviewQueuePriority(record: ReviewEvaluation, now: string, settings = defaultReviewSla): string {
  const review = record.humanReview, state = reviewDueState(review, now, settings)
  const rank = state === 'ESCALATED' ? 0 : state === 'OVERDUE' ? 1 : state === 'DUE_SOON' ? 2 : review?.status === 'IN_REVIEW' ? 3 : 4
  return `${rank}|${reviewDueAt(review) ?? '9999'}|${review?.createdAt ?? record.evaluatedAt}|${record.id}`
}
export interface ReviewSlaHealth { asOf: string; complete: boolean; scanned: number; open: number; dueSoon: number; overdue: number; escalated: number; message?: string }
