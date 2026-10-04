import { describe,it,expect } from 'vitest'
import { coverageInterpretation,coverageSteps,failedEvaluationAttemptsCopy,type CoverageCounts } from './analyticsPresentation'
import { coverageRate } from './domain/analytics'
const mixed:CoverageCounts={candidate:1000,eligible:1000,sampled:500,evaluable:400,evaluated:350,failed:75}
describe('coverage interpretation without metric changes',()=>{
 it('distinguishes intentional policy selection from downstream gaps',()=>{
  expect(coverageInterpretation({...mixed,candidate:100,eligible:100,sampled:10,evaluable:10,evaluated:10,failed:0})).toEqual({selection:{description:'90 eligible interactions were not selected by the sampling policy.',summary:'The sampling policy selected 10 of 100 eligible interactions (10%).',note:'Sampling can deliberately select only part of the eligible population.'},afterSelection:['All sampled interactions had usable content.','All interactions with usable content reached a completed evaluation.']})
 })
 it('describes content unavailable after sampling without a provider cause',()=>{expect(coverageInterpretation(mixed).afterSelection[0]).toBe('100 sampled interactions had no usable conversation content.')})
 it('describes incomplete interaction evaluations without equating them to failed attempts',()=>{expect(coverageInterpretation(mixed).afterSelection[1]).toBe('50 interactions had content available but did not reach a completed evaluation.')})
 it('keeps failed attempt units separate and independent of interaction arithmetic',()=>{
  expect(failedEvaluationAttemptsCopy).toBe('Failed evaluation attempts are attempts, not interaction counts. One interaction can have more than one form evaluation attempt.')
  expect(coverageInterpretation({...mixed,failed:300})).toEqual(coverageInterpretation(mixed))
  expect(coverageSteps({...mixed,failed:300})).toEqual(coverageSteps(mixed))
 })
 it('says all selected when the policy selected the whole eligible population',()=>{
  expect(coverageInterpretation({...mixed,candidate:100,eligible:100,sampled:100,evaluable:90,evaluated:85})).toEqual({selection:{description:'All eligible interactions were selected.'},afterSelection:['10 sampled interactions had no usable conversation content.','5 interactions had content available but did not reach a completed evaluation.']})
 })
 it('keeps healthy full coverage concise and avoids zero differences',()=>{
  expect(coverageInterpretation({...mixed,eligible:100,sampled:100,evaluable:100,evaluated:100,failed:0})).toEqual({selection:{description:'All eligible interactions were selected.'},afterSelection:['All sampled interactions had usable content.','All interactions with usable content reached a completed evaluation.']})
 })
 it('makes no selection quality claim when there are no eligible interactions',()=>{
  const c={...mixed,eligible:0,sampled:0,evaluable:0,evaluated:0,failed:0}
  expect(coverageInterpretation(c)).toEqual({selection:{description:'No eligible interactions in this scope.'},afterSelection:[]})
  expect(coverageSteps(c).map(s=>s.rate)).toEqual([null,null,null,null]);expect(coverageRate(c.evaluated,c.eligible)).toBeNull()
 })
 it('does not claim content or completion for an empty selected population',()=>{
  expect(coverageInterpretation({...mixed,sampled:0,evaluable:0,evaluated:0}).afterSelection).toEqual(['No sampled interactions in this scope.'])
  expect(coverageInterpretation({...mixed,evaluable:0,evaluated:0}).afterSelection).toEqual(['500 sampled interactions had no usable conversation content.'])
 })
 it('fails safely for inconsistent stages without negative differences or modifying counts',()=>{
  for(const changes of [{eligible:1001},{sampled:1001},{evaluable:501},{evaluated:401},{sampled:-10},{evaluable:NaN},{evaluated:Infinity}]){
   const c={...mixed,...changes},original={...c};expect(coverageInterpretation(c)).toEqual({selection:{description:'Coverage counts are inconsistent in this scope.'},afterSelection:[]});expect(c).toEqual(original)
  }
 })
 it('preserves all six counts and four denominator values exactly',()=>{
  const before={...mixed};coverageInterpretation(mixed)
  expect(mixed).toEqual(before);expect(coverageSteps(mixed).map(s=>s.rate)).toEqual([null,.5,.8,.875]);expect(coverageRate(mixed.evaluated,mixed.eligible)).toBe(.35)
 })
})
