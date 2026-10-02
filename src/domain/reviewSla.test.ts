import { describe, it, expect } from 'vitest'
import { buildReview } from './reviews'
import { defaultGovernance, validateGovernance } from './governance'
import { defaultReviewSla, reviewDueState, reviewDueText, reviewQueuePriority, validateReviewSla } from './reviewSla'
import { reviewFixture, reviewInput } from '../fixtures/reviewFixture'
const due='2026-10-02T12:00:00.000Z',record=reviewFixture(),base=buildReview(record,undefined,reviewInput(record,'request'),{userId:'owner'},due)
const review={...base,dueAt:due}
describe('fixed-clock review due state',()=>{
 it('requires an explicit due date',()=>expect(reviewDueState(base,due)).toBe('NO_DUE_DATE'))
 it.each([['2026-10-01T11:59:59.999Z','ON_TRACK'],['2026-10-01T12:00:00.000Z','DUE_SOON'],['2026-10-02T11:59:59.999Z','DUE_SOON'],[due,'OVERDUE'],['2026-10-04T11:59:59.999Z','OVERDUE'],['2026-10-04T12:00:00.000Z','ESCALATED']])('classifies %s as %s', (now,state)=>expect(reviewDueState(review,now)).toBe(state))
 it('never marks completed work overdue',()=>expect(reviewDueState({...review,status:'REVIEWED'},'2027-01-01T00:00:00Z')).toBe('COMPLETED'))
 it('allows escalation to be disabled',()=>expect(reviewDueState(review,'2027-01-01T00:00:00Z',{...defaultReviewSla,overdueEscalationHours:null})).toBe('OVERDUE'))
 it('uses timestamp instants across timezones and DST',()=>{expect(reviewDueState({...review,dueAt:'2026-10-02T13:00:00+01:00'},due)).toBe('OVERDUE');expect(reviewDueState({...review,dueAt:'2026-10-25T01:00:00Z'},'2026-10-24T02:00:00+01:00')).toBe('DUE_SOON')})
 it('formats relative time deterministically',()=>{expect(reviewDueText(review,'2026-10-02T06:00:00Z')).toBe('Due in 6 hours');expect(reviewDueText(review,'2026-10-04T12:00:00Z')).toBe('Overdue by 2 days');expect(reviewDueText(review,due)).toBe('Due now');expect(reviewDueText(review,'2026-10-05T12:00:00.001Z')).toBe('Overdue by 3 days');expect(reviewDueText(review,'2026-10-02T12:00:00.001Z')).toBe('Overdue by less than 1 hour');expect(reviewDueText({...review,status:'REVIEWED'},due)).toBe('')})
 it.each([{dueSoonHours:0,overdueEscalationHours:48},{dueSoonHours:169,overdueEscalationHours:48},{dueSoonHours:1.5,overdueEscalationHours:48},{dueSoonHours:24,overdueEscalationHours:0},{dueSoonHours:24,overdueEscalationHours:721},{dueSoonHours:24,overdueEscalationHours:1.5},null,[]])('rejects invalid bounds %j',value=>expect(()=>validateReviewSla(value)).toThrow())
 it.each([{dueSoonHours:1,overdueEscalationHours:1},{dueSoonHours:168,overdueEscalationHours:720},{dueSoonHours:24,overdueEscalationHours:null}])('accepts boundary %j',value=>expect(validateReviewSla(value)).toEqual(value))
 it('loads legacy governance without writing defaults',()=>{const {reviewSla,...legacy}=defaultGovernance;expect(validateGovernance(legacy).reviewSla).toEqual(reviewSla);expect(()=>validateGovernance({...legacy,reviewSla:null})).toThrow()})
 it('orders stages then lifecycle then dated work before undated work',()=>{const row=(id:string,hours:number|undefined,status:'REVIEW_REQUESTED'|'IN_REVIEW'='REVIEW_REQUESTED')=>({...record,id,humanReview:{...base,status,dueAt:hours===undefined?undefined:new Date(Date.parse(due)+hours*3600000).toISOString()}});const rows=[row('requested',120),row('progress-none',undefined,'IN_REVIEW'),row('soon',6),row('overdue',-12),row('escalated',-48),row('progress',96,'IN_REVIEW'),row('requested-none',undefined)];expect(rows.sort((a,b)=>reviewQueuePriority(a,due).localeCompare(reviewQueuePriority(b,due))).map(r=>r.id)).toEqual(['escalated','overdue','soon','progress','progress-none','requested','requested-none'])})
})
