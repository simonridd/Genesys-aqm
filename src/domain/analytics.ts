import { formGroups, questionsInGroup, scoreResults } from './formComposition'
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
export interface Breakdown { key: string; count: number; averageScore: number | null; passRate: number | null; criticalFailures: number; formRef?:string; questionId?:string; uncertaintyRate?:number|null; averageConfidence?:number|null; applicableCount?:number; skippedCount?:number; groupId?:string }
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
  const buckets = new Map<string, EvaluationRecord['questions']>()
  for (const r of records.filter(r=>r.purpose!=='FORM_TEST')) for (const q of r.questions) {
    const key = `${r.form.id}@${r.form.version}|${q.id}|${r.form.name} v${r.form.version} · ${q.title}`
    buckets.set(key,[...(buckets.get(key)??[]),q])
  }
  return [...buckets].map(([compound,values])=>{
    const [formRef,questionId,key]=compound.split('|'),answered=values.filter(q=>q.status!=='SKIPPED'),scored=answered.filter(q=>q.credit!==null),confidence=answered.flatMap(q=>q.confidence===undefined?[]:[q.confidence])
    const criticalFailures=records.filter(r=>`${r.form.id}@${r.form.version}`===formRef&&r.criticalFailures.includes(questionId)&&r.questions.some(q=>q.id===questionId&&q.status!=='SKIPPED')).length
    return {key,formRef,questionId,count:answered.length,applicableCount:answered.length,skippedCount:values.length-answered.length,averageScore:scored.length?scored.reduce((n,q)=>n+q.credit!,0)/scored.length:null,passRate:scored.length?scored.filter(q=>q.credit!>=.67).length/scored.length:null,criticalFailures,uncertaintyRate:answered.length?answered.filter(q=>q.type==='noul'?q.probability!==undefined&&q.probability>=.4&&q.probability<=.6:q.confidence!==undefined&&q.confidence<.6).length/answered.length:null,averageConfidence:confidence.length?confidence.reduce((a,b)=>a+b,0)/confidence.length:null}
  }).sort((a,b)=>(a.averageScore??0)-(b.averageScore??0))
}
export function groupBreakdown(records:EvaluationRecord[]):Breakdown[]{
  const buckets=new Map<string,Array<{applicable:boolean;score:number|null;critical:number}>>()
  for(const record of records.filter(r=>r.purpose!=='FORM_TEST'))for(const group of formGroups(record.form)){
    const ids=new Set(questionsInGroup(record.form,group).map(q=>q.id)),results=record.questions.filter(q=>ids.has(q.id)),proven=record.groupResults?.find(g=>g.groupId===group.id)
    const key=`${record.form.id}@${record.form.version}|${group.id}|${group.name}`
    buckets.set(key,[...(buckets.get(key)??[]),{applicable:proven?proven.status==='APPLICABLE':results.some(q=>q.status!=='SKIPPED'),score:scoreResults(results).overallScore,critical:record.criticalFailures.filter(id=>ids.has(id)&&results.some(q=>q.id===id&&q.status!=='SKIPPED')).length}])
  }
  return [...buckets].map(([compound,values])=>{const [formRef,groupId,key]=compound.split('|'),scored=values.filter(v=>v.applicable&&v.score!==null);return {key,formRef,groupId,count:values.length,applicableCount:values.filter(v=>v.applicable).length,skippedCount:values.filter(v=>!v.applicable).length,averageScore:scored.length?scored.reduce((n,v)=>n+v.score!,0)/scored.length:null,passRate:null,criticalFailures:values.reduce((n,v)=>n+v.critical,0)}})
}
