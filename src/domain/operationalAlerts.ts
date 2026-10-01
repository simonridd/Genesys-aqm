export const alertTypes = ['SCHEDULED_RUN_FAILED','SCHEDULED_RUN_PARTIAL','GENESYS_AUTH_FAILURE','GENESYS_QUERY_FAILURE','JEV_FAILURE','LOW_TRANSCRIPT_AVAILABILITY','LOW_DIGITAL_CONTENT_AVAILABILITY','SCHEDULER_STALE'] as const
export type AlertType = typeof alertTypes[number]
export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR'
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
export interface AlertActor { userId: string; displayName?: string }
export interface OperationalAlert {
  id: string; dedupKey: string; type: AlertType; severity: AlertSeverity; status: AlertStatus
  title: string; message: string; createdAt: string; updatedAt: string; lastOccurredAt: string; occurrences: number
  source: 'scheduled-run' | 'scheduler'; policyId?: string; scheduleId?: string; runId?: string
  metadata: Record<string, number | boolean>; acknowledgedAt?: string; acknowledgedBy?: AlertActor; resolvedAt?: string; resolvedBy?: AlertActor
  events: Array<{action:'OPENED'|'ACKNOWLEDGED'|'RESOLVED'; at:string; actor?:AlertActor; automatic?:boolean}>
}
export type AlertInput = Pick<OperationalAlert,'dedupKey'|'type'|'severity'|'title'|'message'|'source'|'policyId'|'scheduleId'|'runId'|'metadata'>
export interface SchedulerHealth { initializedAt: string; lastSuccessfulTickAt?: string }
export function openAlert(prior:OperationalAlert|undefined,input:AlertInput,now:string):OperationalAlert {
  if(prior&&prior.status!=='RESOLVED')return {...prior,...input,updatedAt:now,lastOccurredAt:now,occurrences:prior.occurrences+1}
  return {...input,id:crypto.randomUUID(),status:'OPEN',createdAt:now,updatedAt:now,lastOccurredAt:now,occurrences:1,events:[{action:'OPENED',at:now}]}
}
export function transitionAlert(alert:OperationalAlert,action:'ACKNOWLEDGED'|'RESOLVED',now:string,actor?:AlertActor):OperationalAlert {
  if(alert.status==='RESOLVED'||alert.status===action)return alert
  if(!actor&&action==='ACKNOWLEDGED')throw Error('Verified actor is required.')
  return {...alert,status:action,updatedAt:now,...(action==='ACKNOWLEDGED'?{acknowledgedAt:now,acknowledgedBy:actor}:{resolvedAt:now,resolvedBy:actor}),events:[...alert.events,{action,at:now,...(actor?{actor}:{automatic:true})}]}
}
export function alertSummary(alerts:OperationalAlert[]){const active=alerts.filter(a=>a.status!=='RESOLVED');return {openAlertCount:active.length,errorAlertCount:active.filter(a=>a.severity==='ERROR').length,warningAlertCount:active.filter(a=>a.severity==='WARNING').length}}
