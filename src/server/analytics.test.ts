import { describe,expect,it } from 'vitest'
import { MemoryStore } from './store'
import { operationalAnalytics } from './analytics'
import { sampleLibrary } from '../domain/conversations'
import { seedForms } from '../domain/forms'
import { recordEvaluation } from '../domain/evaluations'
import type { EvaluationResult } from '../domain/types'
describe('server analytics',()=>{
  it('aggregates complete production records and excludes sandbox records',async()=>{const store=new MemoryStore(),conversation=sampleLibrary[0].conversation,form=seedForms[0];const result:EvaluationResult={conversationId:conversation.conversationId,scorecardId:form.id,scorecardVersion:1,evaluatedAt:'2026-09-30T12:00:00Z',provider:'typesafe',model:'test',questions:[],overallScore:.75,countedWeight:1,rawResponse:{}};const production=recordEvaluation(conversation,form,result,[],'prod');const sandbox={...recordEvaluation(conversation,form,result,[],'test'),purpose:'FORM_TEST' as const};await store.putEvaluation(production);await store.putEvaluation(sandbox);const analytics=await operationalAnalytics(store,new URLSearchParams());expect(analytics.scope).toBe('complete');expect(analytics.metrics.evaluations).toBe(1);expect(analytics.scoreDistribution.reduce((sum,band)=>sum+band.count,0)).toBe(1);expect(analytics.byForm[0].key).toContain('@1')})
  it('refuses incomplete totals when the scan ceiling is reached',async()=>{const store=new MemoryStore();const conversation=sampleLibrary[0].conversation,form=seedForms[0];const result:EvaluationResult={conversationId:conversation.conversationId,scorecardId:form.id,scorecardVersion:1,evaluatedAt:'2026-09-30T12:00:00Z',provider:'typesafe',model:'test',questions:[],overallScore:.75,countedWeight:1,rawResponse:{}};for(let index=0;index<2001;index++)await store.putEvaluation(recordEvaluation(conversation,form,result,[],`e_${String(index).padStart(4,'0')}`));await expect(operationalAnalytics(store,new URLSearchParams())).rejects.toThrow('limit of 2000')})
})
