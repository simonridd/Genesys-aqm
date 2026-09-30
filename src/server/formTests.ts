import { sampleLibrary } from '../domain/conversations'
import { recordEvaluation } from '../domain/evaluations'
import { toScorecard, validateForm } from '../domain/forms'
import type { ConversationSourceId, EvaluationForm, FormTestRun } from '../domain/types'
import { validateScorecard } from '../domain/validation'
import type { RunnerDeps } from './runner'

export interface FormTestInput { id:string; form:EvaluationForm; source:ConversationSourceId; selectedConversationIds:string[]; sampleConfiguration:FormTestRun['sampleConfiguration'] }
export async function executeFormTest(deps:RunnerDeps,input:FormTestInput):Promise<FormTestRun>{
  if(input.source!=='synthetic'&&input.source!=='genesys-cloud')throw new Error('Unsupported test source.')
  if(!Array.isArray(input.selectedConversationIds)||input.selectedConversationIds.length<1||input.selectedConversationIds.length>20||new Set(input.selectedConversationIds).size!==input.selectedConversationIds.length||input.selectedConversationIds.some(id=>typeof id!=='string'||id.length>180))throw new Error('Select 1–20 distinct conversations.')
  if(!input.sampleConfiguration||!['manual','recent','deterministic-random'].includes(input.sampleConfiguration.strategy)||input.sampleConfiguration.count!==input.selectedConversationIds.length)throw new Error('Invalid sample configuration.')
  const issues=[...validateForm(input.form),...validateScorecard(toScorecard(input.form))]
  if(issues.length)throw new Error(issues.join(' '))
  if(JSON.stringify(input.form).length>25_000||input.form.questions.filter(item=>item.enabled).length>50)throw new Error('Form test is limited to 50 enabled questions and a 25 KB form definition.')
  const prior=await deps.store.formTestRun(input.id)
  if(prior){if(prior.formId!==input.form.id||JSON.stringify(prior.selectedConversationIds)!==JSON.stringify(input.selectedConversationIds)||JSON.stringify(prior.formSnapshot)!==JSON.stringify(input.form))throw new Error('Test ID is already bound to a different snapshot or sample.');return prior}
  const run:FormTestRun={id:input.id,formId:input.form.id,formSnapshot:structuredClone(input.form),createdAt:deps.now().toISOString(),status:'running',sampleSource:input.source,selectedConversationIds:[...input.selectedConversationIds],sampleConfiguration:structuredClone(input.sampleConfiguration),expectedRequests:input.selectedConversationIds.length,results:[],failures:[]}
  if(!await deps.store.createFormTestRun(run))return (await deps.store.formTestRun(input.id))!
  // Test records are embedded only in formTestRuns. They never enter evaluation
  // slots, policy runs, production evaluationRecords, or analytics.
  for(const [index,conversationId] of input.selectedConversationIds.entries()){
    try{
      const conversation=input.source==='synthetic'?sampleLibrary.find(item=>item.conversation.conversationId===conversationId)?.conversation:await deps.genesys.load(conversationId)
      if(!conversation)throw new Error('Sample conversation not found.')
      if(!conversation.messages.length)throw new Error('Transcript unavailable.')
      const result=await deps.jev.evaluate({conversation,scorecard:toScorecard(run.formSnapshot),evaluatedAt:deps.now().toISOString(),version:'v0'})
      const record=recordEvaluation(conversation,run.formSnapshot,result,[],`ft_${run.id.replace(/-/g,'_')}_${index}`,{conversationSource:input.source})
      record.purpose='FORM_TEST'
      run.results.push(record);run.provider=result.provider;run.model=result.model
    }catch(error){run.failures.push({conversationId,reason:error instanceof Error?error.message:'Test evaluation failed.'})}
    await deps.store.putFormTestRun(run)
  }
  run.status=run.failures.length?(run.results.length?'partial-failure':'failed'):'completed'
  await deps.store.putFormTestRun(run)
  return run
}
