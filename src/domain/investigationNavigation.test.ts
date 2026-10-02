import { describe,it,expect } from 'vitest'
import { evaluationExploreUrl,analyticsQuestionFilters,analyticsReturnUrl,evaluationFilterKeys } from './navigation'
import { investigationCohort } from '../fixtures/investigationFixture'
describe('replacement investigation URL contract',()=>{
 it('retains exact cohort, replaces every stale evaluation selector, rejects arbitrary supplied state',()=>{
  const old=new URL('https://app.test/Genesys-aqm/?page=evaluations&runId=stale&policyId=old&alertId=old&analyticsTab=questions&settings.q=safe')
  for(const key of evaluationFilterKeys)old.searchParams.set(key,'stale')
  const filters=analyticsQuestionFilters(investigationCohort,'general_service@17','greeting')
  const next=evaluationExploreUrl(old,{...filters,untrusted:'not-copied'})
  expect(next.search).toBe('?page=evaluations&analyticsTab=questions&settings.q=safe&evaluationSource=server&form=general_service%4017&question=greeting&source=genesys-cloud&agent=Fixture+Agent&queue=Customer+care&channel=voice&cohort=analytics&from=2026-09-01&to=2026-09-30&policy=daily_voice&mode=scheduled')
  for(const key of evaluationFilterKeys)expect(next.searchParams.get(key)).toBe(key==='evaluationSource'?'server':filters[key]||null)
 })
 it('returns the original Analytics cohort and selected tab, even after investigation scope edits',()=>{
  const original=new URL('https://app.test/?page=analytics&analyticsTab=questions')
  for(const [key,value] of Object.entries({...investigationCohort,form:''}))if(value)original.searchParams.set(key,value)
  const drill=evaluationExploreUrl(original,analyticsQuestionFilters(investigationCohort,'general_service@17','greeting'),{analyticsReturn:true})
  drill.searchParams.delete('queue');drill.searchParams.set('form','general_service@18')
  const back=analyticsReturnUrl(drill)
  expect(Object.fromEntries(back.searchParams)).toEqual(Object.fromEntries(original.searchParams))
 })
 it('preserves Calibration disagreements while clearing Analytics, SLA, assignment and detail state',()=>{
  const filters={form:'general_service@17',reviewQuestion:'greeting',comparison:'disagreements',reviewStatus:'REVIEWED',source:'genesys-cloud',agent:'Fixture Agent',queue:'Customer care',from:'2026-09-01',to:'2026-10-02'}
  const next=evaluationExploreUrl(new URL('https://app.test/?assignment=mine&critical=yes&reviewQueue=active&channel=email&question=old&evaluationId=old&origin=analytics&analytics.from=old'),filters)
  expect(Object.fromEntries(next.searchParams)).toEqual({page:'evaluations',evaluationSource:'server',...filters})
  expect(Object.fromEntries(evaluationExploreUrl(next,{evaluationId:'direct'}).searchParams)).toEqual({page:'evaluations',evaluationSource:'server',evaluationId:'direct'})
 })
})
