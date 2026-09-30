import type { EvaluationRecord, PolicyRun } from './types'
export type AnalyticsSourceFilter = 'real' | 'synthetic' | 'all'
export function filterRecordsBySource(records: EvaluationRecord[], filter: AnalyticsSourceFilter): EvaluationRecord[] {
  return records.filter(record => record.purpose !== 'FORM_TEST' && (filter === 'all' || (filter === 'real' ? record.conversationSource === 'genesys-cloud' : record.conversationSource !== 'genesys-cloud')))
}
export function filterRunsBySource(runs: PolicyRun[], filter: AnalyticsSourceFilter): PolicyRun[] {
  return runs.filter(run => filter === 'all' || (filter === 'real' ? run.source === 'genesys-cloud' : run.source === 'synthetic'))
}
export function coverageRate(numerator: number, denominator: number): number | null { return denominator > 0 ? numerator / denominator : null }
/** Totals are run observations: a conversation in two runs appears twice. */
export function summarizeCoverage(runs: PolicyRun[]) {
  const candidate = runs.reduce((n,r) => n + (r.coverage?.candidateCount ?? r.candidateConversationCount), 0)
  const eligible = runs.reduce((n,r) => n + (r.coverage?.eligibleCount ?? r.matchedConversationCount), 0)
  const sampled = runs.reduce((n,r) => n + (r.coverage?.sampledCount ?? r.matchedConversationCount), 0)
  const evaluable = runs.reduce((n,r) => n + (r.coverage?.evaluableCount ?? 0), 0)
  const evaluated = runs.reduce((n,r) => n + (r.coverage?.evaluatedConversationCount ?? 0), 0)
  const successful = runs.reduce((n,r) => n + r.evaluationsSucceeded, 0)
  const failed = runs.reduce((n,r) => n + r.evaluationsFailed, 0)
  return { candidate, eligible, sampled, evaluable, evaluated, successful, failed,
    samplingCoverage: coverageRate(sampled,eligible), evaluationCoverage: coverageRate(evaluated,eligible), sampleCompletion: coverageRate(evaluated,evaluable), transcriptAvailability: coverageRate(evaluable,sampled) }
}
export interface Breakdown { key: string; count: number; averageScore: number | null; passRate: number | null; criticalFailures: number; formRef?:string; questionId?:string; uncertaintyRate?:number|null; averageConfidence?:number|null }
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
  const groups = new Map<string, { score: number; pass: boolean; critical: boolean; uncertain:boolean; confidence?:number }[]>()
  for (const r of records) for (const q of r.questions) if (q.credit !== null) {
    const key = `${r.form.id}@${r.form.version}|${q.id}|${r.form.name} v${r.form.version} · ${q.title}`
    groups.set(key, [...(groups.get(key) ?? []), { score: q.credit, pass: q.credit >= .67, critical: r.criticalFailures.includes(q.id), uncertain:q.type==='noul'?q.probability!==undefined&&q.probability>=.4&&q.probability<=.6:q.confidence!==undefined&&q.confidence<.6,confidence:q.confidence }])
  }
  return [...groups].map(([compound, values]) => {const [formRef,questionId,key]=compound.split('|');const confidence=values.flatMap(value=>value.confidence===undefined?[]:[value.confidence]);return {key,formRef,questionId,count: values.length, averageScore: values.reduce((n,v) => n+v.score,0)/values.length, passRate: values.filter(v => v.pass).length/values.length, criticalFailures: values.filter(v => v.critical).length,uncertaintyRate:values.filter(value=>value.uncertain).length/values.length,averageConfidence:confidence.length?confidence.reduce((sum,value)=>sum+value,0)/confidence.length:null }}).sort((a,b) => (a.averageScore ?? 0)-(b.averageScore ?? 0))
}
