import type { AlertSeverity, AlertType, OperationalAlert } from './operationalAlerts'
export type NotificationChannel = 'WEBHOOK' | 'EMAIL'
export type NotificationEventType = 'OPEN' | 'RESOLVED' | 'TEST'
export interface NotificationDestination {
 id:string; name:string; type:NotificationChannel; enabled:boolean
 configuration:{urlSecretRef?:string; signingSecretRef?:string; apiKeySecretRef?:string; provider?:'RESEND'; from?:string; to?:string[]}
 createdAt:string; updatedAt:string
}
export interface NotificationRule {
 id:string; name:string; enabled:boolean; severities:AlertSeverity[]; alertTypes:AlertType[]; destinationIds:string[]
 policyId?:string; notifyOnResolution:boolean; createdAt:string; updatedAt:string
}
export interface NotificationPayload {
 schemaVersion:1; event:NotificationEventType; test:boolean
 alert?:Pick<OperationalAlert,'id'|'type'|'severity'|'title'|'message'|'status'|'createdAt'>
 context:{policyId?:string;scheduleId?:string;runId?:string;evaluationId?:string;reviewId?:string;dueAt?:string;assigneeUserId?:string}
 application:{name:'Genesys AQM';url?:string}
 occurredAt:string
}
export interface NotificationEvent {id:string; alertId:string; event:'OPEN'|'RESOLVED'; payload:NotificationPayload; createdAt:string; routed:boolean}
export interface NotificationDelivery {
 id:string; alertId?:string; ruleId?:string; destinationId:string; channel:NotificationChannel; event:NotificationEventType
 state:'PENDING'|'DELIVERED'|'RETRYING'|'FAILED'|'SUPPRESSED'; payload:NotificationPayload
 firstAttemptAt?:string; lastAttemptAt?:string; deliveredAt?:string; attemptCount:number; nextAttemptAt?:string
 lastErrorCode?:string; leaseOwner?:string; createdAt:string; updatedAt:string
}
// Explicit projection: arbitrary alert metadata, transcripts and provider diagnostics never leave the server.
// The existing operational producer uses these fixed safe messages. Do not forward arbitrary alert text.
const titles:Record<AlertType,string>={SCHEDULED_RUN_FAILED:'Scheduled run failed',SCHEDULED_RUN_PARTIAL:'Scheduled run partially completed',GENESYS_AUTH_FAILURE:'Genesys authentication failed',GENESYS_QUERY_FAILURE:'Genesys query failed',JEV_FAILURE:'Jev evaluation failed',LOW_TRANSCRIPT_AVAILABILITY:'Low transcript availability',LOW_DIGITAL_CONTENT_AVAILABILITY:'Low digital content availability',SCHEDULER_STALE:'Scheduler activity is stale',REVIEW_DUE_SOON:'Review due soon',REVIEW_OVERDUE:'Review overdue',REVIEW_ESCALATED:'Review escalated'}
export function alertNotificationEvent(alert:OperationalAlert,event:'OPEN'|'RESOLVED',now:string):NotificationEvent {
 const payload:NotificationPayload={schemaVersion:1,event,test:false,alert:{id:alert.id,type:alert.type,severity:alert.severity,title:titles[alert.type],message:event==='RESOLVED'?'The operational alert has been resolved.':'Inspect the related operational alert and run in Genesys AQM.',status:event==='OPEN'?'OPEN':'RESOLVED',createdAt:alert.createdAt},context:{policyId:alert.policyId,scheduleId:alert.scheduleId,runId:alert.runId,...(alert.source==='review-sla'&&alert.context?{evaluationId:alert.context.evaluationId,reviewId:alert.context.reviewId,dueAt:alert.context.dueAt,assigneeUserId:alert.context.assigneeUserId}:{})},application:{name:'Genesys AQM',...(alert.context?.evaluationId?{url:`https://simonridd.github.io/Genesys-aqm/?page=evaluations&evaluationSource=server&evaluationId=${encodeURIComponent(alert.context.evaluationId)}`}:{})},occurredAt:now}
 return {id:`${alert.id}_${event}`,alertId:alert.id,event,payload,createdAt:now,routed:false}
}
export function ruleMatches(rule:NotificationRule,event:NotificationEvent){
 const alert=event.payload.alert!
 return rule.enabled&&rule.createdAt<=event.createdAt&&rule.severities.includes(alert.severity)&&(!rule.alertTypes.length||rule.alertTypes.includes(alert.type))&&(!rule.policyId||rule.policyId===event.payload.context.policyId)&&(event.event!=='RESOLVED'||rule.notifyOnResolution)
}
export interface NotificationHealth {pending:number;failed24h:number;lastSuccessfulAt:string|null}
