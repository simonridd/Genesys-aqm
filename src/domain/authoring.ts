import { conditionReference, effectiveQuestions, materializeGroups, questionsInGroup, validateComposition } from './formComposition'
import { formStatus, productionReadinessErrors } from './formLifecycle'
import type { EvaluationForm, FormCondition } from './types'

const editable=(form:EvaluationForm)=>{if(!['DRAFT','TESTING'].includes(formStatus(form)))throw Error('Published and retired definitions are immutable.')}
const checked=(form:EvaluationForm,full=false)=>{const errors=full?productionReadinessErrors(form):validateComposition(form);if(errors.length)throw Error(errors.join(' '));return form}
const unique=(prefix:string,ids:string[])=>{let i=1;while(ids.includes(`${prefix}_copy_${i}`))i++;return `${prefix}_copy_${i}`}
const remap=(condition:FormCondition|undefined,ids:Map<string,string>)=>condition&&condition.kind!=='interaction_metadata'?{...structuredClone(condition),questionId:ids.get(condition.questionId)??condition.questionId}:structuredClone(condition)
export function duplicateQuestion(form:EvaluationForm,id:string):EvaluationForm {
 editable(form);const next=structuredClone(form),index=next.questions.findIndex(q=>q.id===id);if(index<0)throw Error('Question not found.')
 const copy={...structuredClone(next.questions[index]),id:unique(id,next.questions.map(q=>q.id))};next.questions.splice(index+1,0,copy)
 if(next.scoring.criticalQuestionIds.includes(id))next.scoring.criticalQuestionIds.push(copy.id)
 return checked(next,true)
}
export function duplicateGroup(form:EvaluationForm,id:string):EvaluationForm {
 editable(form);const next=materializeGroups(form),index=next.groups!.findIndex(g=>g.id===id);if(index<0)throw Error('Group not found.')
 const source=next.groups![index],groupId=unique(id,next.groups!.map(g=>g.id)),items=questionsInGroup(next,source),reserved=next.questions.map(q=>q.id),ids=new Map<string,string>()
 for(const q of items){const newId=unique(q.id,reserved);reserved.push(newId);ids.set(q.id,newId)}
 next.groups!.splice(index+1,0,{...structuredClone(source),id:groupId,name:`${source.name} Copy`,condition:remap(source.condition,ids)})
 next.questions.push(...items.map(q=>({...structuredClone(q),id:ids.get(q.id)!,groupId,condition:remap(q.condition,ids)})))
 next.scoring.criticalQuestionIds.push(...items.filter(q=>next.scoring.criticalQuestionIds.includes(q.id)).map(q=>ids.get(q.id)!))
 return checked(next,true)
}
export function questionDependencies(form:EvaluationForm,ids:Set<string>,removedGroup?:string):string[] {
 const uses:string[]=[]
 for(const q of form.questions)if(!ids.has(q.id)&&ids.has(conditionReference(q.condition)??''))uses.push(`Question “${q.title}” uses “${form.questions.find(p=>p.id===conditionReference(q.condition))?.title}”`)
 for(const g of materializeGroups(form).groups!)if(g.id!==removedGroup&&ids.has(conditionReference(g.condition)??''))uses.push(`Group “${g.name}” uses “${form.questions.find(p=>p.id===conditionReference(g.condition))?.title}”`)
 for(const id of form.scoring.criticalQuestionIds)if(ids.has(id))uses.push(`“${form.questions.find(q=>q.id===id)?.title}” is a critical question`)
 return uses
}
export function deleteQuestions(form:EvaluationForm,ids:string[],removedGroup?:string):EvaluationForm {
 editable(form);const selected=new Set(ids),dependencies=questionDependencies(form,selected,removedGroup)
 if(dependencies.length)throw Error(`Remove these dependencies before deleting: ${dependencies.join('; ')}.`)
 const next=structuredClone(form);next.questions=next.questions.filter(q=>!selected.has(q.id));if(removedGroup)next.groups=materializeGroups(form).groups!.filter(g=>g.id!==removedGroup)
 return checked(next)
}
export function deleteFormGroup(form:EvaluationForm,id:string,keep:boolean):EvaluationForm {
 editable(form);const next=materializeGroups(form),group=next.groups!.find(g=>g.id===id);if(!group)throw Error('Group not found.')
 if(!keep)return deleteQuestions(next,questionsInGroup(next,group).map(q=>q.id),id)
 // General occupies the source position so dependencies are never silently reordered.
 const general=next.groups!.find(g=>g.id==='ungrouped_general')
 if(general&&general.id!==id){if(group.condition)throw Error('Remove the group condition before merging its questions into General.');next.questions=effectiveQuestions(next);next.groups=next.groups!.filter(g=>g.id!==id);next.questions=next.questions.map(q=>q.groupId===id?{...q,groupId:general.id}:q)}
 else {next.groups=next.groups!.map(g=>g.id===id?{id:'ungrouped_general',name:'General',scoring:g.scoring,condition:g.condition}:g);next.questions=next.questions.map(q=>q.groupId===id?{...q,groupId:'ungrouped_general'}:q)}
 return checked(next)
}
export function bulkQuestions(form:EvaluationForm,ids:string[],action:'enable'|'disable'|'move'|'delete',target?:string):EvaluationForm {
 editable(form);if(action==='delete')return deleteQuestions(form,ids)
 const selected=new Set(ids),next=materializeGroups(form)
 if(action==='move'){
  if(!next.groups!.some(g=>g.id===target))throw Error('Choose a target group.')
  const ordered=effectiveQuestions(next);next.questions=[...ordered.filter(q=>!selected.has(q.id)),...ordered.filter(q=>selected.has(q.id)).map(q=>({...q,groupId:target}))]
 }else next.questions=next.questions.map(q=>selected.has(q.id)?{...q,enabled:action==='enable'}:q)
 // Disable preserves definitions; enable/move must validate dependency ordering.
 if(action==='disable')return next
 const errors=action==='enable'?productionReadinessErrors(next):validateComposition({...next,questions:next.questions.map(q=>({...q,enabled:true}))})
 if(errors.length)throw Error(errors.join(' '));return next
}
export function filterLibrary<T extends {id:string;familyId?:string;version:number}>(items:T[],status:string,latest:boolean,usage:string,statusOf:(item:T)=>string,used:(item:T)=>boolean):T[]{
 return items.filter(item=>(status==='All'||statusOf(item)===status)&&(!latest||!items.some(other=>(other.familyId??other.id)===(item.familyId??item.id)&&other.version>item.version))&&(usage==='All'||used(item)===(usage==='Used')))
}
