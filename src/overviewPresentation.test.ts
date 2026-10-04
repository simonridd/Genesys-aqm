import {describe,it,expect} from 'vitest'
import type {OverviewSnapshot} from './domain/overview'
import {automationHealthLabel,healthLabel,reviewStateLabel} from './overviewPresentation'
const snapshot=():OverviewSnapshot=>({health:{complete:true,data:{api:'healthy',firestore:'available',genesysAutomation:{status:'unverified'},jev:{status:'unverified'},scheduler:{status:'configured_unverified',lastSuccessfulTickAt:null}}},alerts:{complete:true,data:{errors:0,warnings:0,openAlerts:0,items:[]}},recentRuns:{complete:true,data:{lastRun:null,items:[]}}} as unknown as OverviewSnapshot)
describe('existing automation presentation meaning',()=>{
 it('retains Healthy even with unverified provider evidence when no existing attention trigger applies',()=>expect(automationHealthLabel(snapshot())).toBe('Healthy'))
 for(const trigger of ['scheduler','genesys','jev','errors','warnings','failed','partial-failure'])it(`retains Attention from ${trigger}`,()=>{
  const s=snapshot();if(!s.health.complete||!s.alerts.complete||!s.recentRuns.complete)throw Error('Fixture')
  if(trigger==='scheduler')s.health.data.scheduler.status='stale'
  else if(trigger==='genesys')s.health.data.genesysAutomation.status='error'
  else if(trigger==='jev')s.health.data.jev.status='error'
  else if(trigger==='errors'||trigger==='warnings')s.alerts.data[trigger]=1
  else s.recentRuns.data.lastRun={status:trigger} as NonNullable<typeof s.recentRuns.data.lastRun>
  expect(automationHealthLabel(s)).toBe('Attention')
 })
 it('keeps section availability and existing attention precedence',()=>{
  const s=snapshot();s.alerts={complete:false,status:'unavailable',reason:'Fixture'};expect(automationHealthLabel(s)).toBe('Unverified')
  if(s.health.complete)s.health.data.scheduler.status='stale';expect(automationHealthLabel(s)).toBe('Attention')
  s.health={complete:false,status:'incomplete',reason:'Fixture'};expect(automationHealthLabel(s)).toBe('Unavailable')
 })
 it('retains provider and scheduler labels',()=>expect(['verified','error','healthy','stale','unverified','not_configured'].map(healthLabel)).toEqual(['Verified','Error','Healthy','Stale','Unverified','Unverified']))
 it('retains review SLA precedence and partial states',()=>{
  const r:OverviewSnapshot['reviews']={complete:true,data:{open:7,dueSoon:1,overdue:1,escalated:1,unassigned:1}}
  expect(reviewStateLabel(r)).toBe('Escalated');r.data.escalated=0;expect(reviewStateLabel(r)).toBe('Overdue');r.data.overdue=0;expect(reviewStateLabel(r)).toBe('Due soon');r.data.dueSoon=0;expect(reviewStateLabel(r)).toBe('Healthy')
  expect(reviewStateLabel({complete:false,status:'incomplete',reason:'Fixture'})).toBe('Data incomplete');expect(reviewStateLabel({complete:false,status:'unavailable',reason:'Fixture'})).toBe('Unavailable')
 })
})
