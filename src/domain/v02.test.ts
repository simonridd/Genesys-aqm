import { describe, expect, it } from 'vitest'
import { sampleLibrary } from './conversations'
import { seedForms } from './forms'
import { assignedFormIds, matchPolicies, seedPolicies } from './policies'
import { parseHistory, recordEvaluation, serializeHistory } from './evaluations'
import { makeDemoHistory } from './demoHistory'
import { breakdown, questionBreakdown, summarize } from './analytics'
import type { EvaluationResult, InteractionPolicy } from './types'
const billing = sampleLibrary[0].conversation
const matching = matchPolicies(billing, seedPolicies)
describe('policy routing', () => {
  it('ANDs conditions inside a group and ORs groups', () => {
    const policy: InteractionPolicy = {id:'test',name:'Test',description:'',enabled:true,criteria:{anyOf:[[{field:'queue',operator:'equals',value:'Wrong'},{field:'channel',operator:'equals',value:'messaging'}],[{field:'topic',operator:'equals',value:'Billing'}]]},evaluationFormIds:['general_service']}
    expect(matchPolicies(billing,[policy])).toHaveLength(1)
    expect(matchPolicies({...billing,metadata:{...billing.metadata,topic:'Other'}},[policy])).toHaveLength(0)
  })
  it('assigns multiple forms, deduplicates overlap and ignores disabled policies', () => {
    expect(assignedFormIds(matching,seedPolicies)).toEqual(['general_service','compliance_identity'])
    const duplicate={...seedPolicies[0],id:'another',evaluationFormIds:['general_service']}
    expect(assignedFormIds(matchPolicies(billing,[...seedPolicies,duplicate]),[...seedPolicies,duplicate])).toEqual(['general_service','compliance_identity'])
    expect(matchPolicies(billing,[{...seedPolicies[0],enabled:false}])).toEqual([])
  })
  it('matches tags by token, not substring', () => {
    const security=sampleLibrary.find(s=>s.title==='Verification success')!.conversation
    expect(matchPolicies(security,seedPolicies).some(m=>m.policyId==='secure_access')).toBe(true)
  })
})
describe('history and analytics', () => {
  const form=seedForms[0]
  const result:EvaluationResult={conversationId:billing.conversationId,scorecardId:form.id,scorecardVersion:form.version,evaluatedAt:'2026-09-29T12:00:00Z',provider:'typesafe',model:'jev-test',questions:[{id:'greeting',title:'Warm opening',type:'noul',rawValue:.9,outcome:'Yes',credit:1,weight:1,weightedContribution:1}],overallScore:.8,countedWeight:1,rawResponse:{}}
  it('serializes history and preserves the historical form version and wording', () => {
    const record=recordEvaluation(billing,form,result,matching,'eval-1')
    const parsed=parseHistory(serializeHistory([record]))
    form.name='General Customer Service'
    expect(parsed).toHaveLength(1)
    expect(parsed[0].id).toBe('eval-1')
    expect(parsed[0].form.version).toBe(1)
    expect(parsed[0].form.questions[0].title).toBe('Warm opening')
    expect(parsed[0].policyMatches[0].policyId).toBe('service_messaging')
    expect(parseHistory('{bad')).toEqual([])
  })
  it('aggregates averages, pass rates, critical failures and groups', () => {
    const records=makeDemoHistory()
    const total=summarize(records)
    expect(total.evaluations).toBeGreaterThan(sampleLibrary.length)
    expect(total.conversations).toBe(sampleLibrary.length)
    expect(total.averageScore).toBeGreaterThan(0)
    expect(total.averageScore).toBeLessThan(1)
    expect(total.passRate).toBeGreaterThan(0)
    expect(total.passRate).toBeLessThan(1)
    expect(total.criticalFailures).toBeGreaterThan(0)
    expect(breakdown(records,r=>r.agent.name).reduce((n,r)=>n+r.count,0)).toBe(records.length)
    expect(breakdown(records,r=>r.form.id).reduce((n,r)=>n+r.count,0)).toBe(records.length)
    expect(questionBreakdown(records).some(q=>q.key.includes('Identity Verification'))).toBe(true)
  })
  it('never invents figures for empty history', () => expect(summarize([])).toMatchObject({evaluations:0,conversations:0,averageScore:null,passRate:null,criticalFailures:0,criticalFailureRate:null}))
  it('marks fixture records distinctly from Jev records', () => expect(makeDemoHistory().every(r=>r.source==='synthetic-demo'&&r.provider==='synthetic fixture')).toBe(true))
})
