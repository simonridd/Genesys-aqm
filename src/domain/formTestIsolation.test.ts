import { describe,expect,it } from 'vitest'
import { sampleLibrary } from './conversations'
import { seedForms } from './forms'
import { recordEvaluation } from './evaluations'
import { filterRecordsBySource, summarize } from './analytics'
import type { EvaluationResult } from './types'
describe('form test isolation',()=>{
  it('keeps a sandbox result out of production quality and retains its tested form snapshot',()=>{const conversation=sampleLibrary[0].conversation,form=structuredClone(seedForms[0]);const result:EvaluationResult={conversationId:conversation.conversationId,scorecardId:form.id,scorecardVersion:form.version,evaluatedAt:'2026-09-30T12:00:00Z',provider:'typesafe',model:'jev-test',questions:[],overallScore:.8,countedWeight:1,rawResponse:{}};const production=recordEvaluation(conversation,form,result,[]);const sandbox=recordEvaluation(conversation,form,result,[]);sandbox.purpose='FORM_TEST';form.name='Later edit';expect(sandbox.form.name).not.toBe(form.name);expect(summarize(filterRecordsBySource([production,sandbox],'all')).evaluations).toBe(1)})
})
