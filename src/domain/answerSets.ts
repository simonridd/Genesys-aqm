import type { AnswerSetAsset, EvaluationForm, ScorecardItem, Option } from './types'
import { validateOptions } from './validation'
import { validateComposition } from './formComposition'
import { productionReadinessErrors, formStatus } from './formLifecycle'
const id=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(v)
const stable=(v:unknown):string=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x)
/** Same portability bounds on every write, including direct API/local authoring. */
export function assertAnswerSetBounds(value:unknown,depth=0):void {
 if(depth>15)throw Error('Answer Set nesting exceeds the supported limit.')
 if(typeof value==='string'&&value.length>10000)throw Error('Answer Set strings must be at most 10,000 characters.')
 if(Array.isArray(value)&&value.length>255)throw Error('Answer Set arrays exceed the supported limit.')
 if(value&&typeof value==='object') {if(Object.keys(value).length>500)throw Error('Answer Set object exceeds the supported limit.');for(const [key,v] of Object.entries(value)){if(key.length>180)throw Error('Answer Set key exceeds the supported limit.');assertAnswerSetBounds(v,depth+1)}}
 if(depth===0&&new TextEncoder().encode(JSON.stringify(value)).length>100000)throw Error('Answer Set exceeds the 100 KB limit.')
}
export function validateAnswerSetAsset(asset:AnswerSetAsset):string[] {
 const errors:string[]=[]
 if(!asset||typeof asset!=='object')return ['Answer Set must be an object.']
 try{assertAnswerSetBounds(asset)}catch(e){errors.push((e as Error).message)}
 if(!id(asset.id)||!id(asset.familyId))errors.push('Answer Set needs a valid ID and family ID.')
 if(typeof asset.name!=='string'||!asset.name.trim())errors.push('Answer Set needs a non-empty name.')
 if(typeof asset.description!=='string')errors.push('Answer Set description must be a string.')
 if(!Number.isInteger(asset.version)||asset.version<1)errors.push('Answer Set version must be a positive integer.')
 if(!['DRAFT','PUBLISHED','RETIRED'].includes(asset.status))errors.push('Answer Set lifecycle status is invalid.')
 if(!['choice','score'].includes(asset.type))errors.push('Answer Set base type must be choice or score.')
 else errors.push(...validateOptions(asset.type,asset.options,'Answer set',true))
 return errors
}
export const answerSetDefinition=(a:AnswerSetAsset)=>stable({name:a.name,description:a.description,type:a.type,options:a.options})
export const answerSetDirty=(working:AnswerSetAsset|undefined,saved:AnswerSetAsset|undefined)=>!!working&&working.status==='DRAFT'&&(!saved||answerSetDefinition(working)!==answerSetDefinition(saved))
export function assertAnswerSetWrite(prior:AnswerSetAsset|undefined,next:AnswerSetAsset,family:AnswerSetAsset[]=[]):void {
 const errors=validateAnswerSetAsset(next);if(errors.length)throw Error(errors.join(' '))
 if(family.some(a=>a.id!==next.id&&a.familyId===next.familyId&&a.version===next.version))throw Error('This Answer Set family version already exists. Refresh the library.')
 if(family.some(a=>a.familyId===next.familyId&&a.type!==next.type))throw Error('Answer Set family base type is stable. Create a new family for a different type.')
 if(!prior){if(next.status!=='DRAFT')throw Error('Create a DRAFT Answer Set before publishing.');return}
 if(prior.id!==next.id||prior.familyId!==next.familyId||prior.version!==next.version||prior.type!==next.type)throw Error('Answer Set identity, family, version and base type are immutable.')
 if(prior.status!=='DRAFT'&&answerSetDefinition(prior)!==answerSetDefinition(next))throw Error('Published/retired Answer Set definition is immutable. Create a new version.')
 if(!(next.status===prior.status||prior.status==='DRAFT'&&next.status==='PUBLISHED'||prior.status==='PUBLISHED'&&next.status==='RETIRED'))throw Error('Invalid Answer Set lifecycle transition.')
}
export function nextAnswerSetVersion(a:AnswerSetAsset,existing:AnswerSetAsset[],now:string):AnswerSetAsset {
 if(existing.some(v=>v.familyId===a.familyId&&v.type!==a.type))throw Error('Answer Set family base type is stable.')
 const version=Math.max(a.version,...existing.filter(v=>v.familyId===a.familyId).map(v=>v.version))+1
 return {...structuredClone(a),id:`${a.familyId}_v${version}`,version,status:'DRAFT',createdAt:now,updatedAt:now,publishedAt:undefined}
}
export function transitionAnswerSet(a:AnswerSetAsset,status:AnswerSetAsset['status'],now:string):AnswerSetAsset {
 if(!(a.status==='DRAFT'&&status==='PUBLISHED'||a.status==='PUBLISHED'&&status==='RETIRED'))throw Error(`Answer Set cannot transition from ${a.status} to ${status}.`)
 const errors=validateAnswerSetAsset(a);if(errors.length)throw Error(errors.join(' '))
 return {...structuredClone(a),status,updatedAt:now,publishedAt:status==='PUBLISHED'?now:a.publishedAt}
}
function question(form:EvaluationForm,questionId:string):ScorecardItem {
 if(!['DRAFT','TESTING'].includes(formStatus(form)))throw Error('Only draft/testing forms can change Answer Set snapshots.')
 const q=form.questions.find(q=>q.id===questionId);if(!q)throw Error('Question not found.');return q
}
export function applyAnswerSet(form:EvaluationForm,questionId:string,asset:AnswerSetAsset):EvaluationForm {
 const q=question(form,questionId)
 if(q.sourceAnswerSet)throw Error('Detach the current Answer Set first, or explicitly update its version.')
 const next=snapshot(form,q,asset)
 const errors=validateComposition({...next,questions:next.questions.map(q=>q.condition?{...q,enabled:true}:q)})
 if(errors.length)throw Error(`Answer Set application blocked: ${errors.join(' ')}`)
 return next
}
function snapshot(form:EvaluationForm,q:ScorecardItem,asset:AnswerSetAsset):EvaluationForm {
 if(asset.status!=='PUBLISHED')throw Error('Select a published Answer Set.')
 const errors=validateAnswerSetAsset(asset);if(errors.length)throw Error(errors.join(' '))
 if(q.type!==asset.type)throw Error('Answer Set type must match the question type; Noul cannot use an Answer Set.')
 const next=structuredClone(form),target=next.questions.find(v=>v.id===q.id)!
 target.options=structuredClone(asset.options);target.sourceAnswerSet={familyId:asset.familyId,answerSetId:asset.id,answerSetVersion:asset.version}
 return next
}
export function detachAnswerSet(form:EvaluationForm,questionId:string):EvaluationForm {
 question(form,questionId);const next=structuredClone(form);delete next.questions.find(q=>q.id===questionId)!.sourceAnswerSet;return next
}
export function updateAnswerSet(form:EvaluationForm,questionId:string,asset:AnswerSetAsset):EvaluationForm {
 const q=question(form,questionId)
 if(!q.sourceAnswerSet||q.sourceAnswerSet.familyId!==asset.familyId||asset.version<=q.sourceAnswerSet.answerSetVersion)throw Error('Select a newer published version from the same Answer Set family.')
 const next=snapshot(form,q,asset)
 // Validate all conditions, including currently disabled questions, using the existing composition validator.
 const errors=[...productionReadinessErrors(next),...validateComposition({...next,questions:next.questions.map(q=>q.condition?{...q,enabled:true}:q)})]
 if(errors.length)throw Error(`Answer Set update blocked: ${errors.join(' ')}`)
 return next
}
export function saveAnswerSet(form:EvaluationForm,questionId:string,id:string,name:string,description:string,now:string):AnswerSetAsset {
 const q=question(form,questionId);if(q.type==='noul')throw Error('Noul cannot use an Answer Set.')
 const asset:AnswerSetAsset={id,familyId:id,name,description,type:q.type,version:1,status:'DRAFT',options:structuredClone(q.options),createdAt:now,updatedAt:now}
 const errors=validateAnswerSetAsset(asset);if(errors.length)throw Error(errors.join(' '));return asset
}
/** Guard ordinary question editing. Removing provenance is the explicit detach operation. */
export function assertAttachedAnswers(prior:ScorecardItem,next:ScorecardItem):void {
 if(prior.sourceAnswerSet&&next.sourceAnswerSet&&stable(prior.sourceAnswerSet)===stable(next.sourceAnswerSet)&&(prior.type!==next.type||stable(prior.options)!==stable(next.options)))throw Error('Detach the Answer Set before changing its type or options.')
 if(prior.sourceAnswerSet&&next.sourceAnswerSet&&prior.type!==next.type)throw Error('Detach the Answer Set before changing question type.')
}
export function answerSetComparison(before:Option[],after:Option[]):{label:string;details:string[]}[] {
 const added=after.filter(o=>!before.some(p=>p.key===o.key)),removed=before.filter(o=>!after.some(p=>p.key===o.key)),common=after.filter(o=>before.some(p=>p.key===o.key))
 const changed=(fields:(keyof Option)[])=>common.filter(o=>{const p=before.find(p=>p.key===o.key)!;return fields.some(k=>p[k]!==o[k])}).map(o=>{const p=before.find(p=>p.key===o.key)!;return `${o.key}: ${fields.filter(k=>p[k]!==o[k]).map(k=>`${k} ${p[k]??'not supplied'} → ${o[k]??'not supplied'}`).join('; ')}`})
 return [{label:'Added options',details:added.map(o=>o.key)},{label:'Removed options',details:removed.map(o=>o.key)},{label:'Changed label/description',details:changed(['label','description'])},{label:'Changed credit',details:changed(['credit'])},{label:'Changed source value',details:changed(['sourceValue'])},{label:'Changed ordering',details:stable(before.filter(o=>common.some(p=>p.key===o.key)).map(o=>o.key))===stable(common.map(o=>o.key))?[]:[`${before.filter(o=>common.some(p=>p.key===o.key)).map(o=>o.key).join(' → ')} becomes ${common.map(o=>o.key).join(' → ')}`]}]
}
