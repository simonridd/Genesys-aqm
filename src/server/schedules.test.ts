import { describe,it,expect } from 'vitest'
import { localInstant,nextDueAfter,monitoringPeriod,dueSchedules,type Schedule } from './schedules'
const daily:Schedule={id:'s',policyId:'p',enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',version:1}
const weekly:Schedule={...daily,frequency:'WEEKLY',weekday:1,localTime:'03:00'}
describe('Europe/London schedules',()=>{
  it('keeps daily 02:00 local across spring DST and resolves 23-hour previous day',()=>{
    expect(nextDueAfter(daily,'2026-03-28T12:00:00.000Z')).toBe('2026-03-29T01:00:00.000Z')
    expect(monitoringPeriod(daily,'2026-03-30T01:00:00.000Z')).toEqual({periodStart:'2026-03-29T00:00:00.000Z',periodEnd:'2026-03-29T23:00:00.000Z'})
  })
  it('resolves 25-hour autumn day',()=>{
    expect(nextDueAfter(daily,'2026-10-24T12:00:00.000Z')).toBe('2026-10-25T02:00:00.000Z')
    expect(monitoringPeriod(daily,'2026-10-26T02:00:00.000Z')).toEqual({periodStart:'2026-10-24T23:00:00.000Z',periodEnd:'2026-10-26T00:00:00.000Z'})
  })
  it('resolves previous Monday to Monday for weekly runs',()=>{
    expect(nextDueAfter(weekly,'2026-03-27T12:00:00.000Z')).toBe('2026-03-30T02:00:00.000Z')
    expect(monitoringPeriod(weekly,'2026-03-30T02:00:00.000Z')).toEqual({periodStart:'2026-03-23T00:00:00.000Z',periodEnd:'2026-03-29T23:00:00.000Z'})
  })
  it('does not mark disabled, manual, or future schedules due',()=>{
    expect(dueSchedules([{...daily,nextDueAt:'2026-10-01T01:00:00.000Z'},{...daily,id:'off',enabled:false,nextDueAt:'2026-09-29T01:00:00.000Z'},{...daily,id:'manual',frequency:'MANUAL',nextDueAt:'2026-09-29T01:00:00.000Z'}],'2026-09-30T00:00:00.000Z')).toEqual([])
    expect(nextDueAfter({...daily,enabled:false},'2026-09-30T00:00:00.000Z')).toBeUndefined()
    expect(localInstant('2026-10-25','01:30')).toBe('2026-10-25T00:30:00.000Z')
  })
})
