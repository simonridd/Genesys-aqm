import { assertAttachedAnswers } from './answerSets'
import { conditionReference, materializeGroups, questionsInGroup, validateComposition } from './formComposition'
import { validateScorecard } from './validation'
import type { EvaluationForm, FormCondition, FormQuestionGroup, QuestionGroupAsset } from './types'

const editable = (form: EvaluationForm) => {
  const status = form.status ?? (form.enabled ? 'PUBLISHED' : 'DRAFT')
  if (status !== 'DRAFT' && status !== 'TESTING') throw Error('Only draft/testing forms can change reusable group instances.')
}
export function validateGroupAsset(asset: QuestionGroupAsset): string[] {
  const errors: string[] = []
  if (!/^[A-Za-z0-9_-]{1,180}$/.test(asset.id) || !/^[A-Za-z0-9_-]{1,180}$/.test(asset.familyId) || !asset.name?.trim() || typeof asset.description !== 'string' || !Number.isInteger(asset.version) || asset.version < 1 || !['DRAFT','PUBLISHED','RETIRED'].includes(asset.status)) errors.push('Asset needs an ID, family, name, description, positive version and valid status.')
  if (!Array.isArray(asset.questions)) return [...errors,'Asset questions must be an array.']
  const form: EvaluationForm = {id:asset.id,name:asset.name,description:asset.description,version:asset.version,enabled:false,groups:[{id:'asset_group',name:asset.name,condition:asset.condition,scoring:asset.scoring}],questions:asset.questions.map(q=>({...q,groupId:'asset_group'})),scoring:{yesThreshold:.65,passScore:.7,criticalQuestionIds:[]}}
  errors.push(...validateScorecard({id:asset.id,version:asset.version,title:asset.name,threshold:.65,items:asset.questions}),...validateComposition(form))
  if (asset.questions.some(q=>q.groupId || q.sourceAssetQuestionId)) errors.push('Reusable questions must use asset-local IDs without form instance metadata.')
  return errors
}
export function nextAssetVersion(asset: QuestionGroupAsset, existing: QuestionGroupAsset[], now: string): QuestionGroupAsset {
  const version = Math.max(asset.version,...existing.filter(a=>a.familyId===asset.familyId).map(a=>a.version))+1
  return {...structuredClone(asset),id:`${asset.familyId}_v${version}`,version,status:'DRAFT',createdAt:now,updatedAt:now,publishedAt:undefined}
}
export function transitionAsset(asset:QuestionGroupAsset,status:QuestionGroupAsset['status'],now:string):QuestionGroupAsset {
  if (!(asset.status==='DRAFT'&&status==='PUBLISHED'||asset.status==='PUBLISHED'&&status==='RETIRED')) throw Error(`Asset cannot transition from ${asset.status} to ${status}.`)
  const errors=validateGroupAsset(asset);if(errors.length)throw Error(errors.join(' '))
  return {...structuredClone(asset),status,updatedAt:now,publishedAt:status==='PUBLISHED'?now:asset.publishedAt}
}
const stable = (value:unknown):string => JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item)
export const groupAssetDefinition = (asset:QuestionGroupAsset):string => stable({name:asset.name,description:asset.description,questions:asset.questions,condition:asset.condition,scoring:asset.scoring})
export const groupAssetDirty = (working:QuestionGroupAsset|undefined,saved:QuestionGroupAsset|undefined):boolean => !!working && working.status==='DRAFT' && (!saved || groupAssetDefinition(working)!==groupAssetDefinition(saved))
export function assertAssetWrite(prior:QuestionGroupAsset|undefined,next:QuestionGroupAsset) {
  const errors = validateGroupAsset(next);if(errors.length)throw Error(errors.join(' '))
  if (!prior) return
  for(const q of next.questions){const old=prior.questions.find(p=>p.id===q.id);if(old)assertAttachedAnswers(old,q)}
  if (prior.familyId!==next.familyId||prior.version!==next.version) throw Error('Asset family and version are immutable.')
  if (prior.status!=='DRAFT') {
    if (stable({name:prior.name,description:prior.description,questions:prior.questions,condition:prior.condition,scoring:prior.scoring})!==stable({name:next.name,description:next.description,questions:next.questions,condition:next.condition,scoring:next.scoring})) throw Error('Published asset definition is immutable. Create a new version.')
    if (!(next.status===prior.status||prior.status==='PUBLISHED'&&next.status==='RETIRED')) throw Error('Published/retired assets cannot return to editing.')
  }
}
function remap(condition:FormCondition|undefined,ids:Map<string,string>):FormCondition|undefined {
  if (!condition || condition.kind==='interaction_metadata') return structuredClone(condition)
  const questionId=ids.get(condition.questionId);if(!questionId)throw Error('Reusable assets cannot reference questions outside the group.')
  return {...structuredClone(condition),questionId}
}
function snapshot(form:EvaluationForm,groupId:string,asset:QuestionGroupAsset,prior?:FormQuestionGroup):EvaluationForm {
  if (asset.status!=='PUBLISHED') throw Error('Select a published reusable group version.')
  const errors=validateGroupAsset(asset);if(errors.length)throw Error(errors.join(' '))
  const priorQuestions=prior?questionsInGroup(form,prior):[]
  const reserved=new Set(form.questions.filter(q=>!priorQuestions.some(p=>p.id===q.id)).map(q=>q.id))
  const ids=new Map<string,string>()
  for (const q of asset.questions) {
    const previous=priorQuestions.find(p=>p.sourceAssetQuestionId===q.id)
    const id=previous?.id??`${groupId}__${q.id}`
    if(reserved.has(id))throw Error(`Question ID collision: ${id}. Choose a different group instance ID.`)
    reserved.add(id);ids.set(q.id,id)
  }
  const group:FormQuestionGroup={id:groupId,name:asset.name,description:asset.description,scoring:structuredClone(asset.scoring),condition:prior?prior.condition:asset.condition,sourceAsset:{familyId:asset.familyId,assetId:asset.id,assetVersion:asset.version}}
  const questions=asset.questions.map(q=>({...structuredClone(q),id:ids.get(q.id)!,groupId,sourceAssetQuestionId:q.id,condition:remap(q.condition,ids)}))
  const next={...form,groups:prior?form.groups!.map(g=>g.id===groupId?group:g):[...form.groups!,group],questions:[...form.questions.filter(q=>!priorQuestions.some(p=>p.id===q.id)),...questions]}
  const removed=new Set(priorQuestions.filter(q=>!questions.some(p=>p.id===q.id)).map(q=>q.id))
  const dependencies=[...next.groups.map(g=>g.condition),...next.questions.map(q=>q.condition)]
  if(dependencies.some(c=>{const ref=conditionReference(c);return !!ref&&removed.has(ref)}))throw Error('Asset update blocked: another form condition references a question that would disappear.')
  if(next.scoring.criticalQuestionIds.some(id=>removed.has(id)))throw Error('Asset update blocked: a removed question is marked critical. Remove its critical designation explicitly first.')
  const previousIds=new Set(priorQuestions.map(q=>q.id))
  const dependencyCheck={...next,questions:next.questions.map(q=>q.groupId!==groupId&&previousIds.has(conditionReference(q.condition)??'')?{...q,enabled:true}:q)}
  const issues=validateComposition(dependencyCheck);if(issues.length)throw Error(`Asset update blocked: ${issues.join(' ')}`)
  return next
}
export function insertGroupAsset(form:EvaluationForm,asset:QuestionGroupAsset,groupId:string):EvaluationForm {
  editable(form);const next=materializeGroups(form)
  if(!/^[a-z][a-z0-9_]*$/.test(groupId)||next.groups!.some(g=>g.id===groupId))throw Error('Use a unique group instance ID.')
  return snapshot(next,groupId,asset)
}
export function updateGroupAsset(form:EvaluationForm,groupId:string,asset:QuestionGroupAsset):EvaluationForm {
  editable(form);const next=materializeGroups(form),group=next.groups!.find(g=>g.id===groupId)
  if(!group?.sourceAsset||group.sourceAsset.familyId!==asset.familyId)throw Error('Select a published version from the same reusable group family.')
  return snapshot(next,groupId,asset,group)
}
export function detachGroupAsset(form:EvaluationForm,groupId:string):EvaluationForm {
  editable(form);const next=structuredClone(form),group=next.groups?.find(g=>g.id===groupId)
  if(!group)throw Error('Group not found.')
  delete group.sourceAsset
  for(const q of next.questions.filter(q=>q.groupId===groupId))delete q.sourceAssetQuestionId
  return next
}
export function saveGroupAsset(form:EvaluationForm,groupId:string,id:string,now:string,existing:QuestionGroupAsset[]=[]):QuestionGroupAsset {
  editable(form);const group=materializeGroups(form).groups!.find(g=>g.id===groupId)
  if(!group)throw Error('Group not found.')
  if(group.condition&&conditionReference(group.condition))throw Error('Remove the group dependency on another group before saving a self-contained reusable asset.')
  const items=questionsInGroup(materializeGroups(form),group),ids=new Map(items.map(q=>[q.id,q.sourceAssetQuestionId??q.id]))
  const questions=items.map(q=>{const result={...structuredClone(q),id:ids.get(q.id)!,condition:remap(q.condition,ids)};delete result.groupId;delete result.sourceAssetQuestionId;return result})
  const familyId=group.sourceAsset?.familyId??id,version=group.sourceAsset?Math.max(group.sourceAsset.assetVersion,...existing.filter(a=>a.familyId===familyId).map(a=>a.version))+1:1
  const asset:QuestionGroupAsset={id:group.sourceAsset?`${familyId}_v${version}`:id,familyId,name:group.name,description:group.description??'',version,status:'DRAFT',questions,condition:group.condition,scoring:structuredClone(group.scoring),createdAt:now,updatedAt:now}
  const errors=validateGroupAsset(asset);if(errors.length)throw Error(errors.join(' '))
  return asset
}
