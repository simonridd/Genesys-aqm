import { describe, it, expect, vi } from 'vitest'
import detail from '../fixtures/genesys-detail.json'
import transcript from '../fixtures/genesys-transcript.json'
import { normalizeGenesys } from './genesys'
import { SyntheticConversationSource, GenesysCloudConversationSource } from './sources'
import { seedPolicies, matchPolicies } from './policies'
import { seedForms } from './forms'
import { executePolicyRun, parsePolicyRuns, previewPolicyRun } from './policyRuns'
import { filterRecordsBySource } from './analytics'
import type { EvaluationResult } from './types'

const normalized = normalizeGenesys(detail, transcript)
const result: EvaluationResult = { conversationId: normalized.conversationId, scorecardId: 'general_service', scorecardVersion: 1, evaluatedAt: '2026-09-29T00:00:00Z', provider: 'typesafe', model: 'fixture', questions: [], overallScore: .8, countedWeight: 1, rawResponse: {} }
describe('Genesys normalization and source contract', () => {
  it('maps IDs, participant roles, metadata, timestamps and text', () => {
    expect(normalized.channel).toBe('messaging')
    expect(normalized.agent.name).toBe('Test Agent')
    expect(normalized.customer.name).toBe('Test Customer')
    expect(normalized.metadata.queueId).toBe('55555555-5555-4555-8555-555555555555')
    expect(normalized.metadata.direction).toBe('inbound')
    expect(normalized.messages.map(m => m.speaker)).toEqual(['customer','agent'])
    expect(normalized.messages[1].timestamp).toBe('2026-09-28T12:00:05.000Z')
    expect(normalized.metadata.durationSeconds).toBe('300')
  })
  it('does not fabricate missing transcripts, agent or queue', () => {
    const c = normalizeGenesys({ ...detail, participants: detail.participants.slice(0,1) })
    expect(c.messages).toEqual([])
    expect(c.agent.name).toBe('Unknown agent')
    expect(c.metadata.queue).toBe('')
    expect(c.metadata.transcriptStatus).toBe('Unavailable')
  })
  it('matches normalized Genesys metadata with the existing policy matcher', () => {
    const policy = { ...seedPolicies[0], criteria: { anyOf: [[{field:'channel' as const,operator:'equals' as const,value:'messaging'},{field:'agent' as const,operator:'equals' as const,value:normalized.agent.id}]] } }
    expect(matchPolicies(normalized,[policy])).toHaveLength(1)
  })
  it('paginates synthetic source and switches to Genesys source without changing the contract', async () => {
    const synthetic = new SyntheticConversationSource()
    const one = await synthetic.list({from:'',to:'',page:1,pageSize:10})
    const two = await synthetic.list({from:'',to:'',page:2,pageSize:10})
    expect([one.conversations.length,two.conversations.length,one.hasMore,two.hasMore]).toEqual([10,9,true,false])
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ conversations:[detail], total:1,hasMore:false }),{status:200}))
    vi.stubGlobal('fetch',fetchMock)
    const genesys = new GenesysCloudConversationSource('https://proxy.example',()=> 'access')
    const page = await genesys.list({from:'2026-09-28T00:00:00Z',to:'2026-09-29T00:00:00Z',page:1,pageSize:10})
    expect(page.conversations[0].metadata.source).toBe('genesys-cloud')
    expect(fetchMock.mock.calls).toHaveLength(1)
    vi.unstubAllGlobals()
  })
})
describe('policy runs', () => {
  const policy = { ...seedPolicies[0], criteria: { anyOf: [[{field:'channel' as const,operator:'equals' as const,value:'messaging'}]] } }
  it('previews multi-form requests, duplicates and unavailable transcripts', () => {
    const preview = previewPolicyRun(policy,[normalized,normalizeGenesys(detail)],seedForms,[],'genesys-cloud')
    expect(preview.matched).toHaveLength(2)
    expect(preview.expectedEvaluations).toBe(2)
    expect(preview.unavailable).toHaveLength(1)
    const dup = previewPolicyRun(policy,[normalized],seedForms,[{ source:'jev',conversationSource:'genesys-cloud',conversationId:normalized.conversationId,form:{id:'general_service',version:seedForms.find(f=>f.id==='general_service')!.version} } as never],'genesys-cloud')
    expect(dup.duplicates).toHaveLength(1)
    expect(dup.expectedEvaluations).toBe(1)
  })
  it('enforces the run limit', () => {
    const conversations = Array.from({length:26},(_,i)=>({...normalized,conversationId:`id-${i}`}))
    expect(previewPolicyRun(policy,conversations,seedForms,[],'genesys-cloud').limitExceeded).toBe(true)
  })
  it('persists partial success and run provenance without retrying', async () => {
    const preview = previewPolicyRun(policy,[normalized],seedForms,[],'genesys-cloud')
    const evaluate = vi.fn(async (_c: typeof normalized, form: typeof seedForms[number]) => { if(form.id==='compliance_identity') throw new Error('Fixture failure'); return result })
    const persisted: string[] = []
    const run = await executePolicyRun({policy,source:'genesys-cloud',preview,forms:seedForms,records:[],evaluate,onRecord:r=>persisted.push(r.id)})
    expect(evaluate).toHaveBeenCalledTimes(2)
    expect(run.run.status).toBe('partial-failure')
    expect(run.run.evaluationsSucceeded).toBe(1)
    expect(run.run.evaluationsFailed).toBe(1)
    expect(run.run.failures[0].formId).toBe('compliance_identity')
    expect(run.records[0].policyRunId).toBe(run.run.id)
    expect(run.records[0].conversationSource).toBe('genesys-cloud')
    expect(persisted).toHaveLength(1)
    expect(parsePolicyRuns(JSON.stringify([run.run]))).toHaveLength(1)
    expect(filterRecordsBySource(run.records,'real')).toHaveLength(1)
    expect(filterRecordsBySource(run.records,'synthetic')).toHaveLength(0)
  })
})
