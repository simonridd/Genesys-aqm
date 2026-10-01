import { evaluateForm, FormEvaluationFailure } from '../domain/formComposition'
import { createHash } from 'node:crypto'
import { SyntheticConversationSource } from '../domain/sources'
import { isOperationalForm } from '../domain/formLifecycle'
import { recordEvaluation } from '../domain/evaluations'
import { matchPolicies } from '../domain/policies'
import type { EvaluationRecord } from '../domain/types'
import type { RunnerDeps } from './runner'

export interface ManualEvaluationInput { source:'genesys-cloud'|'synthetic'; conversationId:string; formId:string; formVersion:number }
export interface ManualEvaluationReply { status:'created'|'duplicate'|'uncertain'; record?:EvaluationRecord; message?:string; providerRequestCount?:number }
export function parseManualInput(value:unknown):ManualEvaluationInput {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid manual evaluation request.')
  const input=value as Record<string,unknown>
  if(Object.keys(input).some(key=>!['source','conversationId','formId','formVersion'].includes(key)))throw Error('Supply source, conversation ID and exact form version only.')
  if(input.source!=='genesys-cloud'&&input.source!=='synthetic'||typeof input.conversationId!=='string'||typeof input.formId!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(input.formId)||!Number.isInteger(input.formVersion)||Number(input.formVersion)<1)throw Error('Invalid manual evaluation identity.')
  if(input.source==='genesys-cloud'?!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(input.conversationId):!/^[A-Za-z0-9_-]{1,100}$/.test(input.conversationId))throw Error('Invalid conversation ID.')
  return input as unknown as ManualEvaluationInput
}
export async function evaluateManual(deps:RunnerDeps,raw:unknown):Promise<ManualEvaluationReply> {
  const input=parseManualInput(raw)
  const form=await deps.store.form(input.formId)
  if(!form||form.version!==input.formVersion)throw Error('Exact published form version not found. Publish this version to the automation service first.')
  if(!isOperationalForm(form))throw Error('Form must be published, enabled and operationally eligible.')
  const existing=await deps.store.findProductionEvaluation(input.source,input.conversationId,form.id,form.version)
  if(existing)return {status:'duplicate',record:existing,message:'This conversation already has a production evaluation for this exact form version. No Jev request was made.'}
  const id=`manual_${createHash('sha256').update(JSON.stringify([input.source,input.conversationId,form.id,form.version])).digest('hex').slice(0,40)}`
  const slot=await deps.store.evaluationSlot(id)
  if(slot?.status==='completed'){const record=await deps.store.evaluation(slot.recordId!);if(record)return {status:'duplicate',record}}
  if(slot)return {status:'uncertain',providerRequestCount:slot.providerRequestCount,message:'An evaluation is running or a prior request may have been charged. Reconcile it before retrying; no additional Jev request was made.'}
  // Retrieval is safe to retry. Reserve only after a supported transcript is ready.
  const conversation=await (input.source==='genesys-cloud'?deps.genesys:new SyntheticConversationSource()).load(input.conversationId)
  if(conversation.conversationId!==input.conversationId||!conversation.messages.length||input.source==='genesys-cloud'&&conversation.metadata.status!=='Completed')throw Error('A supported transcript is unavailable for this conversation.')
  if(!await deps.store.reserveEvaluation(id,deps.now().toISOString()))return {status:'uncertain',message:'Another request reserved this evaluation. Refresh Evaluation Explorer before retrying.'}
  let providerRequestCount=0
  try {
    const prior=await deps.store.findProductionEvaluation(input.source,input.conversationId,form.id,form.version)
    if(prior){await deps.store.completeEvaluation(id,prior);return {status:'duplicate',record:prior}}
    const output=await evaluateForm({conversation,form,evaluatedAt:deps.now().toISOString(),evaluateQuestions:request=>deps.jev.evaluate(request),onProviderRequest:async count=>{await deps.store.recordProviderRequest(id,count);providerRequestCount=count}})
    const policies=(await deps.store.policies()).filter(policy=>policy.evaluationFormIds.includes(form.id))
    const record=recordEvaluation(conversation,form,output,matchPolicies(conversation,policies),id,{conversationSource:input.source,executionMode:'manual'})
    await deps.store.completeEvaluation(id,record)
    return {status:'created',record}
  }catch(error){return {status:'uncertain',providerRequestCount:error instanceof FormEvaluationFailure?error.providerRequestCount:providerRequestCount,message:'Evaluation or persistence did not complete. One or more Jev requests may have been charged; operator reconciliation is required before another attempt.'}}
}
