import type { Conversation, EvaluationForm, InteractionPolicy } from './types'
import { formStatus, isOperationalForm } from './formLifecycle'
import { assignedFormIds, matchPolicies } from './policies'
/** Local same-ID history never becomes a working override by inference. */
export function authoringForms(connected:boolean,localForms:EvaluationForm[],savedForms:EvaluationForm[],workingForms:EvaluationForm[]) {
 if(!connected)return localForms
 return [...savedForms.map(saved=>(['DRAFT','TESTING'].includes(formStatus(saved))?workingForms.find(working=>working.id===saved.id&&working.version===saved.version):undefined)??saved),...localForms.filter(local=>!savedForms.some(saved=>saved.id===local.id))]
}
export function configurationRouting(conversation:Conversation,connected:boolean,localPolicies:InteractionPolicy[],savedPolicies:InteractionPolicy[],localForms:EvaluationForm[],savedForms:EvaluationForm[],policiesReady=true,formsReady=true){
 const policies=connected?(policiesReady?savedPolicies:[]):localPolicies
 const forms=(connected?(formsReady?savedForms:[]):localForms).filter(isOperationalForm)
 const matches=matchPolicies(conversation,policies),ids=assignedFormIds(matches,policies)
 return {matches,manualForms:forms,applicableForms:forms.filter(form=>ids.includes(form.id)),inconsistentIds:connected&&policiesReady&&formsReady?ids.filter(id=>!forms.some(form=>form.id===id)):[]}
}
