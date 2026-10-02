import { describe,it,expect } from 'vitest'
import { groupAssetDefinition,groupAssetDirty,nextAssetVersion } from './groupAssets'
import { seedGroupAssets } from './seedGroupAssets'
import { defaultGovernance,pendingGovernanceSections,retentionSettingKeys } from './governance'

describe('authored reusable group dirty semantics',()=>{
 const saved={...structuredClone(seedGroupAssets[0]),status:'DRAFT' as const}
 it('unsaved new/new-version drafts are dirty; saved imports are clean',()=>{
  expect(groupAssetDirty(saved,undefined)).toBe(true)
  expect(groupAssetDirty(nextAssetVersion(seedGroupAssets[0],seedGroupAssets,'now'),undefined)).toBe(true)
  expect(groupAssetDirty(saved,structuredClone(saved))).toBe(false)
  expect(groupAssetDirty(undefined,undefined)).toBe(false)
 })
 it('ignores timestamps and key order; published/retired inspection is clean',()=>{
  const reordered=JSON.parse(JSON.stringify(saved,(_key,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.entries(value).reverse()):value))
  expect(groupAssetDefinition(reordered)).toBe(groupAssetDefinition(saved))
  expect(groupAssetDirty({...saved,updatedAt:'later',publishedAt:'later',createdAt:'later'},saved)).toBe(false)
  for(const status of ['PUBLISHED','RETIRED'] as const)expect(groupAssetDirty({...saved,status},undefined)).toBe(false)
 })
 it('compares names, descriptions, question configuration/order, conditions and scoring',()=>{
  const edits=[{...saved,name:'Changed'},{...saved,description:'Changed'},{...saved,questions:[...saved.questions].reverse()},{...saved,questions:saved.questions.map((q,i)=>i===0?{...q,instructions:'Changed',weight:2}:q)},{...saved,condition:{kind:'interaction_metadata' as const,field:'channel' as const,equals:'email'}},{...saved,scoring:{passScore:.9}}]
  for(const working of edits)expect(groupAssetDirty(working,saved)).toBe(true)
  const working=structuredClone(saved);working.questions[0].condition={kind:'interaction_metadata',field:'channel',equals:'email'}
  expect(groupAssetDirty(working,saved)).toBe(true)
 })
})
describe('explicit complete Governance save scope',()=>{
 it('lists only changed human-readable sections, with no identity dependence',()=>{
  expect(pendingGovernanceSections(defaultGovernance,structuredClone(defaultGovernance))).toEqual([])
  expect(pendingGovernanceSections(defaultGovernance,{...defaultGovernance,evaluationRetentionDays:2,reviewSla:{...defaultGovernance.reviewSla,dueSoonHours:12}})).toEqual(['Review reminders','Retention'])
  expect(pendingGovernanceSections(defaultGovernance,{...defaultGovernance,browserContentCacheHours:0})).toEqual(['Privacy / browser cache'])
  for(const key of retentionSettingKeys)expect(pendingGovernanceSections(defaultGovernance,{...defaultGovernance,[key]:2})).toEqual(['Retention'])
 })
})
