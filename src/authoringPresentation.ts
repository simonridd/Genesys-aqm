import type { AnswerSetAsset, EvaluationForm, FormCondition, Option, QuestionType, ScorecardItem } from './domain/types'

export const answerFormat = (type: QuestionType): string => ({noul:'Yes / No',choice:'Multiple choice',score:'Ordered scale'})[type]
export const creditLabel = (credit?:number):string => credit===undefined?'Not scored':`${Number((credit*100).toFixed(6))}%`
export const answerSummary = (item:ScorecardItem):string => item.type==='noul'?'Yes / No':item.type==='score'?`${item.options.length} levels · ${item.options[0]?.label??'No answers'} → ${item.options.at(-1)?.label??'No answers'}`:item.options.length>4?`${item.options.length} answers · ${item.options.slice(0,3).map(o=>o.label).join(' · ')} …`:item.options.map(o=>o.label).join(' · ')||'No answers yet'

/** All published sets in the supplied authority; deterministic search without format exclusion. */
export function discoverAnswerSets(assets:AnswerSetAsset[],type:QuestionType,search:string):AnswerSetAsset[] {
 const term=search.trim().toLowerCase()
 const relevance=(a:AnswerSetAsset)=>!term?0:a.name.toLowerCase()===term?0:a.name.toLowerCase().startsWith(term)?1:a.name.toLowerCase().includes(term)?2:3
 return assets.filter(a=>a.status==='PUBLISHED'&&(!term||[a.name,a.description,...a.options.map(o=>o.label)].some(v=>v.toLowerCase().includes(term))))
  .sort((a,b)=>relevance(a)-relevance(b)||Number(b.type===type)-Number(a.type===type)||a.name.localeCompare(b.name)||b.version-a.version||a.id.localeCompare(b.id))
}

/** Human guidance only; the domain operation still validates the whole resulting composition. */
export function answerSetFormatChangeDependencies(form:EvaluationForm,item:ScorecardItem,next:AnswerSetAsset):BlockingDependency[] {
 const dependencies:BlockingDependency[]=[]
 const inspect=(condition:FormCondition|undefined,title:string,kind:'question'|'group')=>{
  if(!condition||condition.kind==='interaction_metadata'||condition.questionId!==item.id)return
  if(condition.kind==='question_outcome')for(const key of condition.outcomes){
   if(item.type==='noul'||next.type!=='choice'||!next.options.some(o=>o.key===key))dependencies.push({sourceQuestionTitle:item.title,dependentTitle:title,dependentKind:kind,affectedAnswerLabel:item.type==='noul'?key.toLowerCase()==='yes'?'Yes':'No':item.options.find(o=>o.key===key)?.label??'an unavailable answer',reason:'uses an answer that the new format cannot keep'})
  }
  else if(next.type==='choice'&&next.options.every(o=>o.credit===undefined))dependencies.push({sourceQuestionTitle:item.title,dependentTitle:title,dependentKind:kind,affectedAnswerLabel:'scored answers',reason:'needs credit, but the new answers are all not scored'})
 }
 form.questions.forEach(q=>inspect(q.condition,q.title||'Untitled question','question'))
 form.groups?.forEach(g=>inspect(g.condition,g.name,'group'))
 return dependencies
}

export interface AnswerChange { key:string; before?:Option; after?:Option; marks:string[] }
export interface BlockingDependency { sourceQuestionTitle:string; dependentTitle:string; dependentKind:'question'|'group'; affectedAnswerLabel:string; reason:string }
/** Presentation only. Matching uses stable keys; production validation remains the authority. */
export function answerSetUpdateImpact(form:EvaluationForm,item:ScorecardItem,next:AnswerSetAsset):{changes:AnswerChange[];blockingDependencies:BlockingDependency[];orderChanged:boolean} {
 const commonBefore=item.options.filter(o=>next.options.some(n=>n.key===o.key)).map(o=>o.key)
 const commonAfter=next.options.filter(o=>item.options.some(n=>n.key===o.key)).map(o=>o.key)
 const orderChanged=JSON.stringify(commonBefore)!==JSON.stringify(commonAfter)
 const changes:AnswerChange[]=[...next.options.map(after=>{
  const before=item.options.find(o=>o.key===after.key),marks:string[]=[]
  if(!before)marks.push('ADDED')
  else {if(before.label!==after.label)marks.push('RENAMED');if(before.description!==after.description)marks.push('DESCRIPTION CHANGED');if(before.credit!==after.credit)marks.push('CREDIT CHANGED');if(orderChanged&&commonBefore.indexOf(after.key)!==commonAfter.indexOf(after.key))marks.push('ORDER CHANGED')}
  return {key:after.key,before,after,marks}
 }),...item.options.filter(o=>!next.options.some(n=>n.key===o.key)).map(before=>({key:before.key,before,marks:['REMOVED']}))]
 const blockingDependencies:BlockingDependency[]=[]
 const inspect=(condition:FormCondition|undefined,title:string,kind:'question'|'group')=>{
  if(!condition||condition.kind==='interaction_metadata'||condition.questionId!==item.id)return
  if(condition.kind==='question_outcome')for(const key of condition.outcomes){
   if(next.type!=='choice'||!next.options.some(o=>o.key===key))blockingDependencies.push({sourceQuestionTitle:item.title,dependentTitle:title,dependentKind:kind,affectedAnswerLabel:item.options.find(o=>o.key===key)?.label??'an unavailable answer',reason:'uses an answer that will no longer be available'})
  }
  else if(next.type==='choice'&&next.options.every(o=>o.credit===undefined))blockingDependencies.push({sourceQuestionTitle:item.title,dependentTitle:title,dependentKind:kind,affectedAnswerLabel:'scored answers',reason:'needs credit, but the new answers are all not scored'})
 }
 form.questions.forEach(q=>inspect(q.condition,q.title||'Untitled question','question'))
 form.groups?.forEach(g=>inspect(g.condition,g.name,'group'))
 return {changes,blockingDependencies,orderChanged}
}
