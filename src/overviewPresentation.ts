import type { OverviewSnapshot } from './domain/overview'
// Presentation labels extracted from Overview; evidence and precedence are unchanged.
export const healthLabel=(status:string)=>status==='verified'?'Verified':status==='error'?'Error':status==='healthy'?'Healthy':status==='stale'?'Stale':'Unverified'
export function reviewStateLabel(r:OverviewSnapshot['reviews']){
 return r.complete?r.data.escalated?'Escalated':r.data.overdue?'Overdue':r.data.dueSoon?'Due soon':'Healthy':r.status==='incomplete'?'Data incomplete':'Unavailable'
}
export function automationHealthLabel(data:OverviewSnapshot){
 const h=data.health,a=data.alerts
 return h.complete?(h.data.scheduler.status==='stale'||h.data.jev.status==='error'||h.data.genesysAutomation.status==='error'||(a.complete&&(a.data.errors||a.data.warnings))||(data.recentRuns.complete&&['failed','partial-failure'].includes(data.recentRuns.data.lastRun?.status??''))?'Attention':a.complete?'Healthy':'Unverified'):'Unavailable'
}
