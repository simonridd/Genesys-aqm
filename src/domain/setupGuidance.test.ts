import { expect,it } from 'vitest'
import { setupGuidance } from './setupGuidance'
import { seedForms } from './forms'
import { seedPolicies } from './policies'
import type { Schedule } from '../server/schedules'
const form=seedForms[0],policy={...seedPolicies[0],evaluationFormIds:[form.id]},schedule:Schedule={id:'s',policyId:policy.id,enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'08:00',version:1}
const run={id:'r',policyId:policy.id,policyName:policy.name,status:'completed',startedAt:'2026-10-02',trigger:'scheduled',evaluationsSucceeded:1,evaluationsFailed:0}
it('derives empty, form, exact policy, schedule and first-run stages from saved data',()=>{
 expect(setupGuidance([],[],[],[])).toMatchObject({form:false,policy:false,schedule:false,firstRun:false,established:false})
 expect(setupGuidance([form],[],[],[])).toMatchObject({form:true,policy:false})
 expect(setupGuidance([form],[policy],[],[])).toMatchObject({form:true,policy:true,schedule:false})
 expect(setupGuidance([form],[policy],[schedule],[])).toMatchObject({schedule:true,firstRun:false})
 expect(setupGuidance([form],[policy],[schedule],[run])).toMatchObject({firstRun:true,established:true})
})
it('rejects invalid/disabled exact pins and manual/disabled schedules; recognises partial scheduled work',()=>{
 expect(setupGuidance([form],[{...policy,evaluationFormIds:['missing']}],[schedule],[]).policy).toBe(false)
 expect(setupGuidance([form],[{...policy,enabled:false}],[schedule],[]).schedule).toBe(false)
 expect(setupGuidance([{...form,status:'DRAFT'}],[policy],[schedule],[]).form).toBe(false)
 for(const change of [{frequency:'MANUAL' as const},{enabled:false}])expect(setupGuidance([form],[policy],[{...schedule,...change}],[]).schedule).toBe(false)
 expect(setupGuidance([form],[policy],[schedule],[{...run,trigger:'manual'}]).firstRun).toBe(false)
 expect(setupGuidance([form],[policy],[schedule],[{...run,status:'partial-failure'}]).firstRun).toBe(true)
})
