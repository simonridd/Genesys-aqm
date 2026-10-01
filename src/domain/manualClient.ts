import type { AuthSession } from './genesysAuth'
import type { EvaluationForm, EvaluationRecord, EvaluationResult } from './types'
export const apiOrigin=(import.meta.env.VITE_AQM_API_ORIGIN??'').trim().replace(/\/$/,'')
export async function manualEvaluation(session:AuthSession|null,source:'synthetic'|'genesys-cloud',conversationId:string,form:Pick<EvaluationForm,'id'|'version'>,fetcher:typeof fetch=fetch,origin=apiOrigin):Promise<{record:EvaluationRecord;duplicate:boolean}> {
  if(!session||session.expiresAt<=Date.now()+30_000||!origin)throw Error('Connect to the automation service to evaluate this conversation.')
  const response=await fetcher(`${origin}/api/evaluations/manual`,{method:'POST',headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({source,conversationId,formId:form.id,formVersion:form.version})})
  const body=await response.json() as {record?:EvaluationRecord;status?:string;message?:string;error?:string}
  if(!response.ok||!body.record)throw Error(body.message??body.error??'Manual evaluation could not complete.')
  return {record:body.record,duplicate:body.status==='duplicate'}
}
export function recordResult(record:EvaluationRecord):EvaluationResult {return {conversationId:record.conversationId,scorecardId:record.form.id,scorecardVersion:record.form.version,evaluatedAt:record.evaluatedAt,provider:record.provider,model:record.model,questions:record.questions,providerRequestCount:record.providerRequestCount,groups:record.groupResults,overallScore:record.overallScore,countedWeight:record.questions.reduce((sum,question)=>sum+(question.status==='SKIPPED'||question.credit===null?0:question.weight),0),rawResponse:null}}
