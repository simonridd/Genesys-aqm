import { validateComposition } from './formComposition'
import { productionReadinessErrors } from './formLifecycle'
import { assertAnswerSetBounds, validateAnswerSetAsset } from './answerSets'
import { validateGroupAsset } from './groupAssets'
import type { AnswerSetAsset, EvaluationForm, QuestionGroupAsset } from './types'
export const portableLimit=100_000 // Existing authenticated API body convention.
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const pick=(v:unknown,keys:string[])=>{if(!object(v))throw Error('Malformed definition object.');return Object.fromEntries(keys.filter(k=>v[k]!==undefined).map(k=>[k,structuredClone(v[k])]))}
const condition=(v:unknown)=>v===undefined?undefined:pick(v,['kind','field','equals','operator','values','questionId','outcomes','value'])
const scoring=(v:unknown)=>v===undefined?undefined:pick(v,['weight','passScore','critical'])
function questions(v:unknown){
 if(!Array.isArray(v)||v.length>500)throw Error('Definition supports at most 500 questions.')
 return v.map(q=>{if(!object(q)||['id','title','instructions'].some(k=>typeof q[k]!=='string'))throw Error('Each question needs string ID, title and instructions.');if(String(q.id).length>180||String(q.title).length>2000)throw Error('Question ID/title exceeds the supported length.');const clean=pick(q,['id','title','instructions','type','weight','enabled','section','sourceGroupWeight','groupId','sourceAssetQuestionId']);if(q.sourceAnswerSet!==undefined){const source=q.sourceAnswerSet;if(!object(source)||![source.familyId,source.answerSetId].every(v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(v))||!Number.isInteger(source.answerSetVersion)||Number(source.answerSetVersion)<1)throw Error('Malformed Answer Set provenance.');clean.sourceAnswerSet=pick(source,['familyId','answerSetId','answerSetVersion'])}if(!object(q)||!Array.isArray(q.options)||q.options.length>255||typeof q.enabled!=='boolean'||!['noul','choice','score'].includes(String(q.type)))throw Error('Malformed question definition.');return {...clean,condition:condition(q.condition),options:q.options.map(o=>{if(!object(o)||['key','label','description'].some(k=>typeof o[k]!=='string'))throw Error('Each option needs string key, label and description.');return pick(o,['key','label','description','credit','sourceValue'])})}})
}
function bounded(v:unknown,depth=0){
 if(depth>15)throw Error('Definition nesting exceeds the supported limit.')
 if(typeof v==='string'&&v.length>10000)throw Error('Definition strings must be at most 10,000 characters.')
 if(Array.isArray(v)&&v.length>500)throw Error('Definition array exceeds the supported limit.')
 if(v&&typeof v==='object')for(const value of Object.values(v))bounded(value,depth+1)
}
function formDefinition(v:unknown,validate=true):EvaluationForm {
 bounded(v);const clean=pick(v,['id','familyId','name','description','version','origin','sourceFormId'])
 if(!object(v)||typeof v.id!=='string'||typeof v.name!=='string'||typeof v.description!=='string'||!object(v.scoring)||!Array.isArray(v.scoring.criticalQuestionIds)||v.scoring.criticalQuestionIds.some(id=>typeof id!=='string'))throw Error('Malformed form definition.')
 if(v.groups!==undefined&&(!Array.isArray(v.groups)||v.groups.length>100))throw Error('Definition supports at most 100 groups.')
 const groups=Array.isArray(v.groups)?v.groups.map(g=>{const base=pick(g,['id','name','description']);if(!object(g)||typeof g.id!=='string'||typeof g.name!=='string'||g.description!==undefined&&typeof g.description!=='string')throw Error('Each group needs string ID, name and description.');if(g.sourceAsset!==undefined&&(!object(g.sourceAsset)||typeof g.sourceAsset.familyId!=='string'||typeof g.sourceAsset.assetId!=='string'||!Number.isInteger(g.sourceAsset.assetVersion)||Number(g.sourceAsset.assetVersion)<1))throw Error('Malformed reusable snapshot provenance.');return {...base,condition:condition(g.condition),scoring:scoring(g.scoring),...(g.sourceAsset===undefined?{}:{sourceAsset:pick(g.sourceAsset,['familyId','assetId','assetVersion'])})}}):undefined
 const result={...clean,enabled:false,status:'DRAFT',questions:questions(v.questions),groups,scoring:pick(v.scoring,['mode','yesThreshold','passScore','criticalQuestionIds'])} as unknown as EvaluationForm
 if(validate){const errors=[...productionReadinessErrors(result),...validateComposition({...result,questions:result.questions.map(q=>q.condition?{...q,enabled:true}:q)})];if(errors.length)throw Error(errors.join(' '))}return result
}
function assetDefinition(v:unknown,validate=true):QuestionGroupAsset {
 bounded(v);const clean=pick(v,['id','familyId','name','description','version'])
 if(!object(v))throw Error('Malformed reusable group.')
 const result={...clean,status:'DRAFT',questions:questions(v.questions),condition:condition(v.condition),scoring:scoring(v.scoring),createdAt:'',updatedAt:''} as unknown as QuestionGroupAsset
 if(validate){const errors=validateGroupAsset({...result,questions:result.questions.map(q=>q.condition?{...q,enabled:true}:q)});if(errors.length)throw Error(errors.join(' '))}return result
}
export function cloneForm(source:EvaluationForm,id:string,now:string):EvaluationForm {
 const definition=formDefinition(source,false)
 return {...definition,id,familyId:id,name:`Copy of ${source.name}`,version:1,status:'DRAFT',enabled:false,createdAt:now,updatedAt:now}
}
export function exportDefinition<K extends 'form'|'group'|'answer-set'>(kind:K,value:EvaluationForm|QuestionGroupAsset|AnswerSetAsset,now=new Date().toISOString()):{schema:string;schemaVersion:number;exportedAt:string;definition:K extends 'answer-set'?AnswerSetAsset:EvaluationForm|QuestionGroupAsset}{
 // Explicit projections prevent operational data or unknown fields leaking into exports.
 const definition=kind==='form'?formDefinition(value,false):kind==='group'?assetDefinition(value,false):answerDefinition(value,false)
 if(kind==='form'){const source=value as EvaluationForm;definition.status=source.status;Object.assign(definition,{enabled:source.enabled,createdAt:source.createdAt,updatedAt:source.updatedAt,publishedAt:source.publishedAt})}else{const source=value as QuestionGroupAsset;Object.assign(definition,{status:source.status,createdAt:source.createdAt,updatedAt:source.updatedAt,publishedAt:source.publishedAt})}
 return {schema:`genesys-aqm/${kind==='form'?'evaluation-form':kind==='group'?'question-group':'answer-set'}`,schemaVersion:1,exportedAt:now,definition:definition as K extends 'answer-set'?AnswerSetAsset:EvaluationForm|QuestionGroupAsset}
}
export function importDefinition(kind:'form',value:unknown,id:string,now:string):EvaluationForm
export function importDefinition(kind:'group',value:unknown,id:string,now:string):QuestionGroupAsset
export function importDefinition(kind:'answer-set',value:unknown,id:string,now:string):AnswerSetAsset
export function importDefinition(kind:'form'|'group'|'answer-set',value:unknown,id:string,now:string):EvaluationForm|QuestionGroupAsset|AnswerSetAsset {
 if(!object(value)||value.schema!==`genesys-aqm/${kind==='form'?'evaluation-form':kind==='group'?'question-group':'answer-set'}`)throw Error('Unsupported export schema.')
 if(value.schemaVersion!==1)throw Error('Unsupported schemaVersion; expected 1.')
 if(new TextEncoder().encode(JSON.stringify(value)).length>portableLimit)throw Error('Import exceeds the 100 KB authenticated API limit.')
 const definition=kind==='form'?formDefinition(value.definition):kind==='group'?assetDefinition(value.definition):answerDefinition(value.definition)
 return {...definition,id,familyId:id,version:1,status:'DRAFT',...(kind==='form'?{enabled:false}:{}),createdAt:now,updatedAt:now}
}
export async function readImport(file:File):Promise<unknown>{if(file.size>portableLimit)throw Error('Import exceeds the 100 KB authenticated API limit.');try{return JSON.parse(await file.text())}catch{throw Error('The file is not valid JSON.')}}
export function downloadDefinition(kind:'form'|'group'|'answer-set',value:EvaluationForm|QuestionGroupAsset|AnswerSetAsset){const blob=new Blob([JSON.stringify(exportDefinition(kind,value),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${value.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

function answerDefinition(v:unknown,validate=true):AnswerSetAsset {
 assertAnswerSetBounds(v)
 const result={...pick(v,['id','familyId','name','description','version','type']),options:[] as unknown[],status:'DRAFT',createdAt:'',updatedAt:''} as unknown as AnswerSetAsset
 if(!object(v)||!Array.isArray(v.options))throw Error('Answer Set options must be an array.')
 result.options=v.options.map(o=>pick(o,['key','label','description','credit','sourceValue'])) as unknown as AnswerSetAsset['options']
 if(validate){const errors=validateAnswerSetAsset(result);if(errors.length)throw Error(errors.join(' '))}return result
}
