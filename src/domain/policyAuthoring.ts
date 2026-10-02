import { isOperationalForm } from './formLifecycle'
import type { EvaluationForm, InteractionPolicy } from './types'

export const POLICY_FIELDS = ['channel','queue','agent','direction','topic','tag'] as const
export const MAX_FIXED_SAMPLE = 25
const identifier = (v:unknown):v is string => typeof v==='string' && /^[A-Za-z0-9_-]{1,180}$/.test(v)
const object = (v:unknown):v is Record<string,unknown> => !!v && typeof v==='object' && !Array.isArray(v)
export function validatePolicy(value:unknown,forms:EvaluationForm[]):string[] {
 const errors:string[]=[]
 if(!object(value))return ['Policy must be an object.']
 if(!identifier(value.id))errors.push('Policy ID must contain 1–180 letters, numbers, underscores or hyphens.')
 if(typeof value.name!=='string'||!value.name.trim())errors.push('Policy name is required.')
 if(typeof value.description!=='string')errors.push('Policy description must be text.')
 if(typeof value.enabled!=='boolean')errors.push('Policy enabled state must be a boolean.')
 if(value.version!==undefined&&(!Number.isSafeInteger(value.version)||Number(value.version)<1))errors.push('Policy version must be a positive integer.')
 const groups=object(value.criteria)?value.criteria.anyOf:undefined
 if(!Array.isArray(groups)||!groups.length)errors.push('Add at least one Match ALL group.')
 else groups.forEach((group,gi)=>{
  if(!Array.isArray(group)||!group.length){errors.push(`Match ALL ${gi+1} needs at least one condition.`);return}
  group.forEach((condition,ci)=>{
   const label=`Match ALL ${gi+1}, condition ${ci+1}`
   if(!object(condition)){errors.push(`${label} must be a condition.`);return}
   if(!POLICY_FIELDS.includes(condition.field as typeof POLICY_FIELDS[number]))errors.push(`${label}: unsupported field.`)
   if(!['equals','includes'].includes(String(condition.operator)))errors.push(`${label}: unsupported operator.`)
   else if(condition.operator==='includes'&&condition.field!=='tag')errors.push(`${label}: includes is supported only for tags; use equals.`)
   if(typeof condition.value!=='string'||!condition.value.trim())errors.push(`${label}: enter a value.`)
  })
 })
 const sample=value.sampling
 if(sample!==undefined){
  if(!object(sample)||!['all','percentage','fixed_count'].includes(String(sample.strategy)))errors.push('Choose All, Percentage or Fixed count sampling.')
  else {
   if(sample.strategy==='percentage'&&(typeof sample.percentage!=='number'||!Number.isFinite(sample.percentage)||sample.percentage<0||sample.percentage>100))errors.push('Sampling percentage must be between 0 and 100 (0 selects none; 100 selects all).')
   if(sample.strategy==='fixed_count'&&(!Number.isInteger(sample.count)||Number(sample.count)<1||Number(sample.count)>MAX_FIXED_SAMPLE))errors.push(`Fixed count must be an integer from 1 to ${MAX_FIXED_SAMPLE}.`)
   if(sample.seed!==undefined&&typeof sample.seed!=='string')errors.push('Sampling seed must be text.')
  }
 }
 if(!Array.isArray(value.evaluationFormIds))errors.push('Assigned forms must be a list of exact form IDs.')
 else {
  if(new Set(value.evaluationFormIds).size!==value.evaluationFormIds.length)errors.push('Assigned form IDs must be unique.')
  for(const id of value.evaluationFormIds){
   if(!identifier(id)){errors.push('Assigned form ID is invalid.');continue}
   const form=forms.find(f=>f.id===id)
   if(!form)errors.push(`Assigned form ${id} does not exist.`)
   else if(!isOperationalForm(form))errors.push(`Assigned form ${id} must be published, enabled and operational.`)
  }
 }
 return errors
}
function ordered(value:unknown):unknown {
 if(Array.isArray(value))return value.map(ordered)
 if(object(value))return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,ordered(v)]))
 return value
}
/** Metadata and version are server-owned; omitted sampling has always meant all. */
export function policyDefinition(policy:InteractionPolicy):string {
 return JSON.stringify(ordered({id:policy.id,name:policy.name,description:policy.description,enabled:policy.enabled,criteria:policy.criteria,evaluationFormIds:policy.evaluationFormIds,sampling:policy.sampling??{strategy:'all'}}))
}
export const samePolicyDefinition=(a:InteractionPolicy,b:InteractionPolicy)=>policyDefinition(a)===policyDefinition(b)
export function newPolicy(id:string):InteractionPolicy {
 return {id,name:'New policy',description:'',version:1,enabled:false,criteria:{anyOf:[[{field:'topic',operator:'equals',value:''}]]},evaluationFormIds:[],sampling:{strategy:'all'}}
}
export function clonePolicy(source:InteractionPolicy,id:string):InteractionPolicy {
 return {...newPolicy(id),name:`Copy of ${source.name}`,description:source.description,criteria:structuredClone(source.criteria),sampling:structuredClone(source.sampling??{strategy:'all'}),evaluationFormIds:[...source.evaluationFormIds]}
}
export function filterPolicies(policies:InteractionPolicy[],status:string,frequency:string,forms:string,scheduleFor:(id:string)=>string):InteractionPolicy[] {
 return policies.filter(p=>(status==='All'||p.enabled===(status==='Enabled'))&&(frequency==='All'||scheduleFor(p.id)===frequency)&&(forms==='All'||(forms==='Assigned')===!!p.evaluationFormIds.length))
}
