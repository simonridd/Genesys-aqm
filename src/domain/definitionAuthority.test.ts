import { describe, expect, it } from 'vitest'
import { authoringForms, configurationRouting } from './definitionAuthority'
import { seedForms } from './forms'
import { seedPolicies } from './policies'
import { sampleLibrary } from './conversations'
import { insertGroupAsset } from './groupAssets'
import { seedGroupAssets } from './seedGroupAssets'
const conversation=sampleLibrary[0].conversation
const localForms=structuredClone(seedForms)
const savedForm={...structuredClone(seedForms[0]),id:'saved_form',name:'Saved production form',status:'PUBLISHED' as const,enabled:true}
const savedPolicy={...structuredClone(seedPolicies[0]),id:'daily_voice',name:'Daily Voice Customer Service AQM',enabled:true,criteria:{anyOf:[[{field:'channel' as const,operator:'equals' as const,value:conversation.channel}]]},evaluationFormIds:[savedForm.id]}
describe('R05 connected definition authority',()=>{
 it('reproduces saved daily policy instead of Customer Service Messaging and Cross-channel monitoring sample',()=>{
  const routing=configurationRouting(conversation,true,seedPolicies,[savedPolicy],localForms,[savedForm])
  expect(routing.matches.map(match=>match.policyName)).toEqual(['Daily Voice Customer Service AQM'])
  expect(routing.applicableForms).toEqual([savedForm]);expect(routing.manualForms).toEqual([savedForm])
 })
 it('never falls back to local policies or forms during loading and failures',()=>{
  for(const ready of [false,true]){
   expect(configurationRouting(conversation,true,seedPolicies,[],localForms,[],ready,ready)).toEqual({matches:[],applicableForms:[],manualForms:[],inconsistentIds:[]})
  }
  const routing=configurationRouting(conversation,true,seedPolicies,[savedPolicy],localForms,[savedForm],false,true)
  expect(routing.matches).toEqual([]);expect(routing.manualForms).toEqual([savedForm])
 })
 it('missing or nonoperational exact IDs surface inconsistency without same-ID browser substitution',()=>{
  const draft={...savedForm,status:'DRAFT' as const,enabled:false}
  const routing=configurationRouting(conversation,true,seedPolicies,[savedPolicy],[savedForm],[draft])
  expect(routing.applicableForms).toEqual([]);expect(routing.inconsistentIds).toEqual([savedForm.id])
 })
 it('connect/disconnect changes authority without mutating local content',()=>{
  const before=JSON.stringify([localForms,seedPolicies])
  expect(configurationRouting(conversation,false,seedPolicies,[savedPolicy],localForms,[savedForm]).manualForms.every(f=>localForms.includes(f))).toBe(true)
  configurationRouting(conversation,true,seedPolicies,[savedPolicy],localForms,[savedForm])
  expect(JSON.stringify([localForms,seedPolicies])).toBe(before)
 })
 it('same-ID stale local copies cannot override saved definitions; only explicit working copies can',()=>{
  const saved={...savedForm,status:'DRAFT' as const},local={...saved,name:'Stale browser history'},working={...saved,name:'Unsaved intentional edit'}
  expect(authoringForms(true,[local],[saved],[])).toEqual([saved])
  expect(authoringForms(true,[local],[saved],[working])).toEqual([working])
  expect(authoringForms(true,[local],[savedForm],[working])).toEqual([savedForm])
  expect(authoringForms(false,[local],[savedForm],[working])).toEqual([local])
  expect(local.name).toBe('Stale browser history')
 })
 it('new local drafts remain local until explicitly saved, then have one authoring row',()=>{
  const draft={...savedForm,status:'DRAFT' as const,enabled:false}
  expect(authoringForms(true,[draft],[],[])).toEqual([draft])
  expect(authoringForms(true,[draft],[draft],[])).toEqual([draft])
 })
 it('existing reusable snapshots remain valid without source resolution',()=>{
  const snapshot=insertGroupAsset({...savedForm,status:'DRAFT',enabled:false},seedGroupAssets[0],'reused')
  const saved={...snapshot,status:'PUBLISHED' as const,enabled:true}
  expect(configurationRouting(conversation,true,[],[savedPolicy],[],[saved]).applicableForms).toEqual([saved])
  expect(saved.groups?.at(-1)?.sourceAsset?.assetId).toBe(seedGroupAssets[0].id)
 })
})
