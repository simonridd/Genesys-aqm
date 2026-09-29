import { describe, expect, it, vi } from 'vitest'
import { sampleLibrary } from './conversations'
import { seedForms } from './forms'
import { seedPolicies } from './policies'
import { GenesysCloudConversationSource } from './sources'
import detail from '../fixtures/genesys-detail.json'
import { normalizeGenesys } from './genesys'
import { coverageRate, filterRunsBySource, summarizeCoverage } from './analytics'
import { deterministicSeed, executePolicyRun, planPolicyRun, resolveMonitoringPeriod, selectSample } from './policyRuns'
import type { EvaluationRecord, EvaluationResult, InteractionPolicy, MonitoringPeriod, PolicyRun } from './types'

const candidates = sampleLibrary.map(s => s.conversation)
const period: MonitoringPeriod = { periodStart:'2026-09-01T00:00:00.000Z',periodEnd:'2026-10-01T00:00:00.000Z' }
const all: InteractionPolicy = { id:'test-monitor',name:'Test',description:'',enabled:true,criteria:{anyOf:[[{field:'channel',operator:'equals',value:'messaging'}],[{field:'channel',operator:'equals',value:'voice'}],[{field:'channel',operator:'equals',value:'chat'}],[{field:'channel',operator:'equals',value:'email'}]]},evaluationFormIds:['general_service','compliance_identity'],sampling:{strategy:'all'} }
const plan=(policy=all, list=candidates, records:EvaluationRecord[]=[])=>planPolicyRun(policy,list,seedForms,records,'synthetic',period)
function existing(conversationId:string, formId='general_service'): EvaluationRecord {
  return {source:'jev',conversationSource:'synthetic',conversationId,form:{id:formId,version:seedForms.find(f=>f.id===formId)!.version}} as EvaluationRecord
}
const result:EvaluationResult={conversationId:'',scorecardId:'general_service',scorecardVersion:1,evaluatedAt:'2026-09-29T00:00:00Z',provider:'typesafe',model:'test',questions:[],overallScore:.8,countedWeight:1,rawResponse:{}}
describe('V0.4 deterministic monitoring',()=>{
  it('selects all eligible interactions after criteria and counts two forms',()=>{
    const p=plan();expect(p.candidateCount).toBe(19);expect(p.eligibleCount).toBe(19);expect(p.sampledCount).toBe(19);expect(p.expectedEvaluations).toBe(38)
  })
  it('rounds percentage sampling down and reproduces the same IDs regardless of candidate order',()=>{
    const policy={...all,sampling:{strategy:'percentage' as const,percentage:10}}
    const one=plan(policy),two=planPolicyRun(policy,[...candidates].reverse(),seedForms,[],'synthetic',period)
    expect(one.sampledCount).toBe(1);expect(one.selected.map(s=>s.conversation.conversationId)).toEqual(two.selected.map(s=>s.conversation.conversationId))
    expect(plan({...policy,sampling:{strategy:'percentage',percentage:0}}).sampledCount).toBe(0)
    expect(plan({...policy,sampling:{strategy:'percentage',percentage:100}}).sampledCount).toBe(19)
  })
  it('caps fixed count and handles zero eligible',()=>{
    expect(plan({...all,sampling:{strategy:'fixed_count',count:4}}).sampledCount).toBe(4)
    expect(plan({...all,sampling:{strategy:'fixed_count',count:99}}).sampledCount).toBe(19)
    expect(plan(all,[]).coverage).toMatchObject({candidateCount:0,eligibleCount:0,sampledCount:0})
  })
  it('changes the seed and sample across periods',()=>{
    const policy={...all,sampling:{strategy:'fixed_count' as const,count:5}}
    const later={periodStart:'2026-09-02T00:00:00.000Z',periodEnd:'2026-10-02T00:00:00.000Z'}
    expect(deterministicSeed(policy,period)).not.toBe(deterministicSeed(policy,later))
    expect(selectSample(policy,candidates,period).map(c=>c.conversationId)).not.toEqual(selectSample(policy,candidates,later).map(c=>c.conversationId))
    expect(selectSample({...policy,sampling:{...policy.sampling,seed:'alternate'}},candidates,period).map(c=>c.conversationId)).not.toEqual(selectSample(policy,candidates,period).map(c=>c.conversationId))
  })
  it('resolves local calendar windows and validates custom bounds',()=>{
    const now=new Date(2026,8,29,14)
    expect(resolveMonitoringPeriod('today',now).periodEnd).toBe(now.toISOString())
    expect(Date.parse(resolveMonitoringPeriod('last7',now).periodStart)).toBe(now.getTime()-7*86400_000)
    expect(()=>resolveMonitoringPeriod('custom',now,{periodStart:period.periodEnd,periodEnd:period.periodStart})).toThrow()
  })
  it('keeps transcript gaps in sampled coverage and skips completed form versions',()=>{
    const missing={...candidates[0],messages:[]}
    const p=plan(all,[missing,candidates[1]],[existing(candidates[1].conversationId)])
    expect(p.coverage).toMatchObject({candidateCount:2,eligibleCount:2,sampledCount:2,evaluableCount:1,transcriptUnavailableCount:1,evaluatedConversationCount:1})
    expect(p.previouslyEvaluatedCount).toBe(0)
    expect(p.expectedEvaluations).toBe(1)
    expect(p.selected.find(c=>c.conversation.conversationId===missing.conversationId)?.pendingFormIds).toEqual([])
  })
  it('persists a complete run snapshot with partial failure and no transcript content',async()=>{
    const policy={...all,sampling:{strategy:'fixed_count' as const,count:2}}
    const p=plan(policy)
    const evaluate=vi.fn(async(_c:typeof candidates[number],form:typeof seedForms[number])=>{if(form.id==='compliance_identity')throw new Error('fixture failure');return {...result,scorecardId:form.id}})
    const preview={candidateCount:p.candidateCount,matched:p.selected.map(s=>s.conversation),formIds:p.formIds,expectedEvaluations:p.expectedEvaluations,duplicates:[],unavailable:[],limitExceeded:false,plan:p}
    const {run}=await executePolicyRun({policy,source:'synthetic',preview,forms:seedForms,records:[],evaluate})
    expect(evaluate).toHaveBeenCalledTimes(4);expect(run.status).toBe('partial-failure');expect(run.evaluationsSucceeded).toBe(2);expect(run.evaluationsFailed).toBe(2)
    expect(run).toMatchObject({period,sampling:policy.sampling,sampledConversationIds:p.selected.map(s=>s.conversation.conversationId),candidateConversationCount:19,matchedConversationCount:19,evaluableCount:2})
    expect(run.coverage).toMatchObject({sampledCount:2,evaluatedConversationCount:2,failedEvaluationCount:2})
    expect(JSON.stringify(run)).not.toContain(candidates[0].messages[0].text)
  })
  it('defines denominators and separates real from synthetic run analytics',()=>{
    const base={id:'one',policyId:'p',policySnapshot:all,source:'synthetic',startedAt:'2026-09-29',candidateConversationCount:19,matchedConversationCount:10,formsAssigned:[],evaluationsRequested:3,evaluationsSucceeded:2,evaluationsFailed:1,status:'partial-failure',failures:[],coverage:{candidateCount:19,eligibleCount:10,sampledCount:4,evaluableCount:3,evaluatedConversationCount:2,evaluationCount:2,successfulEvaluationCount:2,failedEvaluationCount:1,transcriptUnavailableCount:1}} as PolicyRun
    const real={...base,id:'two',source:'genesys-cloud' as const}
    expect(filterRunsBySource([base,real],'real')).toEqual([real]);expect(filterRunsBySource([base,real],'synthetic')).toEqual([base])
    expect(summarizeCoverage([base])).toMatchObject({samplingCoverage:.4,evaluationCoverage:.2,sampleCompletion:2/3,transcriptAvailability:.75})
    expect(coverageRate(0,0)).toBeNull()
  })
  it('seeds a demonstrable percentage policy while retaining 19 synthetic candidates',()=>{
    const demo=seedPolicies.find(p=>p.id==='sample_monitoring')!
    const p=plan(demo)
    expect([p.candidateCount,p.eligibleCount,p.sampledCount,p.formIds.length,p.expectedEvaluations]).toEqual([19,19,9,1,9])
  })
  it('resolves real queue names before eligibility without loading transcripts',async()=>{
    const fetchMock=vi.fn(async()=>new Response(JSON.stringify({name:'Customer Service'}),{status:200}))
    vi.stubGlobal('fetch',fetchMock)
    try {
      const source=new GenesysCloudConversationSource(()=>({region:'eu-west-1',clientId:'public-client',accessToken:'access',expiresAt:Date.now()+60_000}))
      const [named]=await source.withQueueNames([normalizeGenesys(detail)])
      expect(named.metadata.queue).toBe('Customer Service')
      expect(named.messages).toEqual([])
      expect(fetchMock).toHaveBeenCalledTimes(1)
    } finally {vi.unstubAllGlobals()}
  })
})
