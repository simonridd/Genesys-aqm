import type { MonitoringPeriod } from '../domain/types'

export type Frequency = 'MANUAL' | 'DAILY' | 'WEEKLY'
export interface Schedule {
  id: string; policyId: string; enabled: boolean; frequency: Frequency
  timezone: 'Europe/London'; localTime: string; weekday?: number
  nextDueAt?: string; lastAttemptedAt?: string; lastSuccessfulAt?: string
  version: 1
}
const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
function parts(date: Date) {
  const p = Object.fromEntries(formatter.formatToParts(date).map(x => [x.type, Number(x.value)]))
  return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute }
}
function dateKey(y: number, m: number, d: number) { return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}` }
function addDays(key: string, days: number) { const date = new Date(`${key}T12:00:00.000Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0,10) }
/** Finds the earliest matching instant, including the repeated hour when clocks go back. */
export function localInstant(day: string, time = '00:00'): string {
  const [hour, minute] = time.split(':').map(Number)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Invalid local date or time.')
  const start = Date.parse(`${day}T00:00:00.000Z`) - 12 * 3600_000
  for (let t = start; t <= start + 48 * 3600_000; t += 60_000) {
    const p = parts(new Date(t))
    if (dateKey(p.year,p.month,p.day) === day && p.hour === hour && p.minute === minute) return new Date(t).toISOString()
  }
  throw new Error('The configured local time does not occur on this date.')
}
export function validateSchedule(s: Schedule) {
  if (typeof s.enabled !== 'boolean' || !s.id || !s.policyId || s.version !== 1 || s.timezone !== 'Europe/London' || !['MANUAL','DAILY','WEEKLY'].includes(s.frequency) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.localTime) || (s.frequency === 'WEEKLY' && (!Number.isInteger(s.weekday) || s.weekday! < 1 || s.weekday! > 7))) throw new Error('Invalid schedule.')
}
export function nextDueAfter(schedule: Schedule, after: string): string | undefined {
  validateSchedule(schedule)
  if (!schedule.enabled || schedule.frequency === 'MANUAL') return undefined
  const p = parts(new Date(after)); const today = dateKey(p.year,p.month,p.day)
  for (let i = 0; i <= 8; i++) {
    const day = addDays(today,i)
    if (schedule.frequency === 'WEEKLY') { const dow = new Date(`${day}T12:00:00Z`).getUTCDay() || 7; if (dow !== schedule.weekday) continue }
    try { const instant = localInstant(day,schedule.localTime); if (instant > after) return instant } catch { /* skipped local clock hour */ }
  }
  throw new Error('Could not calculate the next due time.')
}
export function monitoringPeriod(schedule: Schedule, dueAt: string): MonitoringPeriod {
  validateSchedule(schedule)
  if (schedule.frequency === 'MANUAL') throw new Error('Manual schedules have no automatic period.')
  const p = parts(new Date(dueAt)); const dueDay = dateKey(p.year,p.month,p.day)
  if (schedule.frequency === 'DAILY') return { periodStart: localInstant(addDays(dueDay,-1)), periodEnd: localInstant(dueDay) }
  const dayOfWeek = new Date(`${dueDay}T12:00:00Z`).getUTCDay() || 7
  const completedMonday = addDays(dueDay, -(dayOfWeek - 1))
  const periodEndDay = completedMonday === dueDay ? dueDay : completedMonday
  return { periodStart: localInstant(addDays(periodEndDay,-7)), periodEnd: localInstant(periodEndDay) }
}
export function dueSchedules(schedules: Schedule[], now: string) { return schedules.filter(s => s.enabled && s.frequency !== 'MANUAL' && !!s.nextDueAt && s.nextDueAt <= now) }
