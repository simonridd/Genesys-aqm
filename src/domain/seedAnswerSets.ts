import type { AnswerSetAsset } from './types'
const now='2026-10-03T00:00:00.000Z'
function starter(id:string,name:string,type:AnswerSetAsset['type'],levels:[string,number][]):AnswerSetAsset {
 return {id,familyId:id,name,description:`Common ${name.toLowerCase()} answers for browser exploration.`,type,version:1,status:'PUBLISHED',createdAt:now,updatedAt:now,publishedAt:now,options:levels.map(([label,credit],i)=>({key:label.toLowerCase().replaceAll(' ','_'),label,description:`${label} ${name.toLowerCase()}.`,credit,...(type==='score'?{sourceValue:i}:{} )}))}
}
/** Browser-only starters. Never seeded into durable storage. */
export const seedAnswerSets=[starter('service_quality','Service quality','score',[['Excellent',1],['Good',.67],['Adequate',.33],['Poor',0]]),starter('resolution_clarity','Resolution clarity','choice',[['Clear',1],['Mostly clear',.75],['Partly clear',.5],['Unclear',0]]),starter('customer_effort','Customer effort','score',[['Very low',1],['Low',.75],['Moderate',.5],['High',.25],['Very high',0]])]
