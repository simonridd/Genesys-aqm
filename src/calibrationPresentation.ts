import type { CalibrationAnalytics, CalibrationGroup } from './domain/calibration'

export type CalibrationView = 'forms' | 'groups' | 'questions' | 'types' | 'confidence'
export const calibrationScopeKeys = ['source', 'form', 'from', 'to', 'agent', 'queue'] as const
export interface CalibrationState { source:string; form:string; from:string; to:string; agent:string; queue:string; calibrationTab:CalibrationView; calibrationQuestion:string }
export function readCalibrationState(query:URLSearchParams):CalibrationState {
  const view=query.get('calibrationTab')
  return {source:query.get('source')||'genesys-cloud',form:query.get('form')??'',from:query.get('from')??'',to:query.get('to')??'',agent:query.get('agent')??'',queue:query.get('queue')??'',calibrationTab:['forms','groups','questions','types','confidence'].includes(view??'')?view as CalibrationView:'forms',calibrationQuestion:query.get('calibrationQuestion')??''}
}
/** Historical completed-review evidence is authoritative; no current-library lookup. */
export function calibrationFormCatalogue(rows:CalibrationAnalytics['byForm']) {
  const options=new Map<string,string>()
  for(const row of [...rows].sort((a,b)=>compare(a.label,b.label)))if(row.formRef&&!options.has(row.formRef))options.set(row.formRef,row.label)
  return [...options].map(([value,label])=>({value,label})).sort((a,b)=>compare(a.label,b.label)||compare(a.value,b.value))
}
const compare=(a:string,b:string)=>a<b?-1:a>b?1:0
export function calibrationFormLabel(formRef:string,rows:CalibrationAnalytics['byForm']) {
  return !formRef?'All form versions':rows.find(row=>row.formRef===formRef)?.label??'Selected form version'
}
export const comparableAnswers=(row:CalibrationGroup)=>row.agreements+row.disagreements
/** Descriptive priority: disagreement rate, count, comparable sample size (descending),
 * then exact formRef, question label and ID (ascending). No significance/accuracy claim.
 * Aggregation already excludes skipped and missing comparisons; use its comparable counts.
 */
export function rankCalibrationDisagreement(rows:CalibrationGroup[]) {
  return rows.filter(row=>row.formRef&&row.questionId&&row.agreementRate!==null&&comparableAnswers(row)>0).slice().sort((a,b)=>
    b.disagreements/comparableAnswers(b)-a.disagreements/comparableAnswers(a)||b.disagreements-a.disagreements||comparableAnswers(b)-comparableAnswers(a)||compare(a.formRef!,b.formRef!)||compare(a.label,b.label)||compare(a.questionId!,b.questionId!))
}
export function calibrationDisagreementEvidence(row:CalibrationGroup) {
  const sample=comparableAnswers(row)
  return {sample,label:`${row.disagreements} of ${sample} comparable reviewed answers disagreed`,rate:sample?`${(100*row.disagreements/sample).toFixed(1)}% disagreement`:'No comparable answers'}
}
/** Same bounded API and date semantics for data/catalogue. Catalogue deliberately omits form. */
export function calibrationRequestUrl(origin:string,state:CalibrationState,catalogue=false) {
  const url=new URL(`${origin}/api/calibration`)
  for(const key of calibrationScopeKeys){const value=state[key];if(!value||catalogue&&key==='form')continue
    url.searchParams.set(key,key==='from'?`${value}T00:00:00.000Z`:key==='to'?`${value}T23:59:59.999Z`:value)
  }
  return url
}
export const calibrationSourceLabels:Record<string,string>={'genesys-cloud':'Genesys Cloud',synthetic:'Synthetic',uploaded:'Uploaded',all:'All sources',unknown:'Unknown provenance'}
