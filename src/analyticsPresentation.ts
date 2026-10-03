import { coverageRate, type Breakdown } from './domain/analytics'
export const qualityCoverageCopy='Quality describes the conversations that were evaluated. Coverage describes how broadly the policy evaluated eligible work.'
export const coverageObservationCopy='Coverage totals count observations across monitoring runs. The same conversation may appear in more than one run.'
export const qualityPercent=(value:number|null|undefined)=>value==null?'—':`${Number((value*100).toFixed(1))}%`
export const sourceLabel=(value:string)=>({'genesys-cloud':'Genesys Cloud',synthetic:'Synthetic',uploaded:'Uploaded'}[value]??(value?'Unknown source':'All sources'))
export const formReference=(item:Breakdown)=>item.formRef??item.key.split(' · ')[0]
export function formLabels(rows:Breakdown[]){return Object.fromEntries(rows.map(item=>[formReference(item),item.key.split(' · ').slice(1).join(' · ')]).filter(([,label])=>!!label))}
export function formLabel(ref:string,names:Record<string,string>){return names[ref]??`Unavailable form name${/@\d+$/.test(ref)?` · v${ref.split('@').at(-1)}`:''}`}
export function questionTitle(item:Breakdown){return item.key.includes(' · ')?item.key.split(' · ').slice(1).join(' · '):item.key}
export function rankedApplicable(rows:Breakdown[],exact=false):Breakdown[] {
 return rows.filter(row=>row.averageScore!==null&&Number.isFinite(row.averageScore)&&(row.applicableCount??row.count)>0&&(!exact||!!row.formRef)).sort((a,b)=>a.averageScore!-b.averageScore!||(a.formRef??'').localeCompare(b.formRef??'')||(a.questionId??a.groupId??a.key).localeCompare(b.questionId??b.groupId??b.key)||a.key.localeCompare(b.key))
}
export function lowestApplicable(rows:Breakdown[],exact=false):Breakdown|undefined{return rankedApplicable(rows,exact)[0]}
export function sampleLabel(row:Breakdown,kind:'question'|'group'|'queue'){const n=kind==='queue'?row.count:row.applicableCount??row.count;return `${n} ${kind==='question'?'applicable answers':kind==='group'?'applicable evaluations':'evaluations'}`}
export interface CoverageCounts {candidate:number;eligible:number;sampled:number;evaluable:number;evaluated:number;failed:number}
// Rates use the existing domain definition; no aggregation or changed denominator.
export function coverageSteps(c:CoverageCounts){return [
 {label:'Eligible',count:c.eligible,rate:null,detail:'Met policy criteria'},
 {label:'Sampled',count:c.sampled,rate:coverageRate(c.sampled,c.eligible),detail:'Sampling coverage · of eligible'},
 {label:'Content available',count:c.evaluable,rate:coverageRate(c.evaluable,c.sampled),detail:'Content availability · of sampled'},
 {label:'Evaluated',count:c.evaluated,rate:coverageRate(c.evaluated,c.evaluable),detail:'Sample completion · of available'},
]}
export function coverageGaps(c:CoverageCounts){return [
 `${c.eligible-c.sampled} eligible interactions were not selected by the sampling policy.`,
 `${c.sampled-c.evaluable} sampled interactions had no usable conversation content.`,
 `${c.evaluable-c.evaluated} interactions had content available but did not reach a completed evaluation.`,
]}

export function cohortDateLabel(from:string,to:string){
 if(!from&&!to)return 'All available dates'
 const a=from?new Date(`${from}T00:00:00Z`):null,b=to?new Date(`${to}T00:00:00Z`):null
 if(a&&Number.isNaN(a.getTime())||b&&Number.isNaN(b.getTime()))return 'Selected dates'
 const format=(date:Date)=>date.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})
 if(a&&b&&a.getUTCMonth()===b.getUTCMonth()&&a.getUTCFullYear()===b.getUTCFullYear())return `${a.getUTCDate()===b.getUTCDate()?a.getUTCDate():`${a.getUTCDate()}–${b.getUTCDate()}`} ${b.toLocaleDateString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'})}`
 return a&&b?`${format(a)} – ${format(b)}`:a?`From ${format(a)}`:`Through ${format(b!)}`
}
