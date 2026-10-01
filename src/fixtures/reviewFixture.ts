import { seedForms, toScorecard } from '../domain/forms'
import { fromJevResponse } from '../provider/jev'
import { recordEvaluation } from '../domain/evaluations'
import type { EvaluationRecord } from '../domain/types'
import type { HumanAnswer, ReviewInput } from '../domain/reviews'
export function reviewFixture(id='evaluation_1',source:EvaluationRecord['conversationSource']='genesys-cloud'):EvaluationRecord {
  const form=structuredClone(seedForms[0]);form.version=17;form.questions=form.questions.filter(q=>['greeting','understanding','resolution'].includes(q.id));form.questions.forEach(q=>q.section='Customer care')
  const request={conversation:{conversationId:'fixture-conversation',startedAt:'2026-10-01T08:00:00.000Z',channel:'voice',agent:{id:'fixture-agent',name:'Fixture Agent'},customer:{id:'fixture-customer',name:'Fixture Customer'},metadata:{source:'genesys-cloud',queue:'Customer care'},messages:[]},scorecard:toScorecard(form),evaluatedAt:'2026-10-01T08:00:00.000Z',version:'v0' as const}
  const result=fromJevResponse(request,{model:'fixture-jev',answers:{greeting:{type:'noul',noul:.95},understanding:{type:'score',score:1,confidence:.75,probabilities:{'0':.1,'1':.8,'2':.1,'3':0}},resolution:{type:'choice',choice:'fully_resolved',confidence:.85,probabilities:{fully_resolved:.85,partially_resolved:.1,unresolved:.04,not_applicable:.01}}}})
  return recordEvaluation(request.conversation,form,result,[],id,{conversationSource:source})
}
export const fixtureAnswers:HumanAnswer[]=[{questionId:'greeting',value:'No',note:'The opening was abrupt.'},{questionId:'understanding',value:2},{questionId:'resolution',value:'fully_resolved'}]
export const reviewInput=(record:EvaluationRecord,action:ReviewInput['action']='complete',expectedRevision=0):ReviewInput=>({formId:record.form.id,formVersion:record.form.version,expectedRevision,action,...(action==='complete'||action==='save'?{answers:structuredClone(fixtureAnswers),notes:'Calibration fixture note'}:{})})
