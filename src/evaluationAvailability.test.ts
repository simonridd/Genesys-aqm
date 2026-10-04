import {describe,it,expect} from 'vitest'
import {withEvaluationScopeLabels,evaluationScopeLabel,evaluationScopeLabelsKey,evaluationQueryKeys,evaluationQueryParams,evaluationRequestUrl,evaluationFailureCopy,evaluationEmptyCopy,type EvaluationQuery} from './evaluationAvailability'
const empty=Object.fromEntries(evaluationQueryKeys.map(k=>[k,''])) as EvaluationQuery
describe('evaluation request identity and presentation',()=>{
 it('preserves the exact existing authoritative query and UTC boundaries',()=>{
  const query={...empty,form:'general_service@17',agent:'Alex',queue:'Claims',channel:'voice',cohort:'analytics',outcome:'fail',question:'greeting',policy:'policy-a',source:'genesys-cloud',mode:'scheduled',critical:'yes',reviewStatus:'REVIEWED',assignment:'mine',due:'today',dueState:'DUE_SOON',reviewQueue:'mine',reviewQuestion:'understanding',comparison:'disagreements',from:'2026-09-01',to:'2026-09-30'}
  const url=new URL(evaluationRequestUrl('https://fixture.test',query,'page-two'))
  expect(Object.fromEntries(url.searchParams)).toEqual({...query,from:'2026-09-01T00:00:00.000Z',to:'2026-09-30T23:59:59.999Z',limit:'50',cursor:'page-two'})
  expect(evaluationRequestUrl('https://fixture.test',{...query},'page-two')).toBe(url.href)
 })
 it.each(evaluationQueryKeys)('identity changes for %s',key=>{
  expect(evaluationRequestUrl('https://fixture.test',{...empty,[key]:'different'})).not.toBe(evaluationRequestUrl('https://fixture.test',empty))
 })
 it('cursor changes identity; absent filters are omitted and local presentation state is absent',()=>{
  expect(evaluationQueryParams(empty).toString()).toBe('')
  expect(evaluationRequestUrl('https://fixture.test',empty)).toBe('https://fixture.test/api/evaluations?limit=50')
  expect(evaluationRequestUrl('https://fixture.test',empty,'next')).not.toBe(evaluationRequestUrl('https://fixture.test',empty))
 })
 it('failure copy never asserts an empty result and preserves meaningful permission copy',()=>{
  for(const kind of ['scope','refresh','next','first'] as const)for(const mine of [true,false])for(const scoped of [true,false]){
   expect(evaluationFailureCopy({technical:'HTTP 503'},kind,mine,scoped)).not.toMatch(/HTTP|0 results|No evaluations|No reviews/)
   expect(evaluationFailureCopy({technical:'denied',status:403},kind,mine,scoped)).toContain('access')
  }
  expect(evaluationFailureCopy({technical:'network'},'scope',true,false)).toBe('Your review queue could not be loaded.')
  expect(evaluationEmptyCopy(true)).toBe('No reviews need your attention in this scope.')
  expect(evaluationEmptyCopy(false)).toBe('No evaluations match this scope.')
 })
})

it('human investigation labels are tied to exact values and never enter the API query',()=>{
 const labelled=withEvaluationScopeLabels({...empty,form:'general_service@17',question:'understanding'},{form:'Customer Service v17',question:'Clear next step'})
 const params=new URLSearchParams(labelled)
 expect(evaluationScopeLabel(params,'form','general_service@17')).toBe('Customer Service v17')
 expect(evaluationScopeLabel(params,'form','claims@17')).toBeUndefined()
 expect(evaluationScopeLabel(params,'question','understanding')).toBe('Clear next step')
 expect(evaluationRequestUrl('https://fixture.test',labelled)).not.toContain('scopeLabels')
 expect(evaluationRequestUrl('https://fixture.test',labelled)).not.toContain('Customer')
 params.set(evaluationScopeLabelsKey,'malformed');expect(evaluationScopeLabel(params,'form','general_service@17')).toBeUndefined()
})
