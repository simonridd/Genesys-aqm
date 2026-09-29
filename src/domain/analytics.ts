import type { EvaluationRecord } from './types'
export type AnalyticsSourceFilter = 'real' | 'synthetic' | 'all'
export function filterRecordsBySource(records: EvaluationRecord[], filter: AnalyticsSourceFilter): EvaluationRecord[] {
  return records.filter(record => filter === 'all' || (filter === 'real' ? record.conversationSource === 'genesys-cloud' : record.conversationSource !== 'genesys-cloud'))
}
export interface Breakdown { key: string; count: number; averageScore: number | null; passRate: number | null; criticalFailures: number }
export function summarize(records: EvaluationRecord[]) {
  const scored = records.filter(r => r.overallScore !== null)
  const decided = records.filter(r => r.passed !== null)
  return { evaluations: records.length, conversations: new Set(records.map(r => r.conversationId)).size,
    averageScore: scored.length ? scored.reduce((n,r) => n + r.overallScore!,0)/scored.length : null,
    passRate: decided.length ? decided.filter(r => r.passed).length/decided.length : null,
    criticalFailures: records.reduce((n,r) => n + r.criticalFailures.length,0),
    criticalFailureRate: records.length ? records.filter(r => r.criticalFailures.length > 0).length/records.length : null }
}
export function breakdown(records: EvaluationRecord[], key: (record: EvaluationRecord) => string): Breakdown[] {
  const groups = new Map<string, EvaluationRecord[]>()
  for (const record of records) groups.set(key(record), [...(groups.get(key(record)) ?? []), record])
  return [...groups].map(([name, group]) => ({ key: name, count: group.length, averageScore: summarize(group).averageScore, passRate: summarize(group).passRate, criticalFailures: summarize(group).criticalFailures })).sort((a,b) => b.count-a.count || a.key.localeCompare(b.key))
}
export function questionBreakdown(records: EvaluationRecord[]): Breakdown[] {
  const groups = new Map<string, { score: number; pass: boolean; critical: boolean }[]>()
  for (const r of records) for (const q of r.questions) if (q.credit !== null) {
    const key = `${r.form.name} · ${q.title}`
    groups.set(key, [...(groups.get(key) ?? []), { score: q.credit, pass: q.credit >= .67, critical: r.criticalFailures.includes(q.id) }])
  }
  return [...groups].map(([key, values]) => ({key, count: values.length, averageScore: values.reduce((n,v) => n+v.score,0)/values.length, passRate: values.filter(v => v.pass).length/values.length, criticalFailures: values.filter(v => v.critical).length })).sort((a,b) => (a.averageScore ?? 0)-(b.averageScore ?? 0))
}
