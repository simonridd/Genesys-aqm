import { describe, expect, it } from 'vitest'
import { seedForms } from './forms'
import { formStatus, nextFormVersion, transitionForm, validatePolicyFormPins } from './formLifecycle'
import type { InteractionPolicy } from './types'
const now='2026-09-30T12:00:00.000Z'
describe('form lifecycle',()=>{
  it('locks legacy published definitions behind new version IDs',()=>{const published=seedForms[0];expect(formStatus(published)).toBe('PUBLISHED');const draft=nextFormVersion(published,[published],now);expect(draft.id).toBe(`${published.id}_v2`);expect(draft.version).toBe(2);expect(draft.status).toBe('DRAFT');expect(draft.enabled).toBe(false);const testing=transitionForm(draft,'TESTING',now);const version=transitionForm(testing,'PUBLISHED',now);expect(version.enabled).toBe(true);expect(()=>transitionForm(version,'DRAFT',now)).toThrow();expect(transitionForm(version,'RETIRED',now).enabled).toBe(false)})
  it('requires an explicit published version in policies',()=>{const draft=nextFormVersion(seedForms[0],[seedForms[0]],now);const policy:InteractionPolicy={id:'p',name:'P',description:'',enabled:true,criteria:{anyOf:[]},evaluationFormIds:[draft.id]};expect(validatePolicyFormPins(policy,[seedForms[0],draft])).toContain(`Assigned form ${draft.id} must be published and enabled.`)})
  it('keeps a photographed recreation in review',()=>{const recreated={...seedForms[0],origin:'genesys-recreated' as const,status:'DRAFT' as const};expect(()=>transitionForm(recreated,'PUBLISHED',now)).toThrow('authoritative')})
})
