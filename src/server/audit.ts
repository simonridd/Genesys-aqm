import { AsyncLocalStorage } from 'node:async_hooks'
import { isDeepStrictEqual } from 'node:util'
import { randomUUID } from 'node:crypto'
import type { AuditEvent } from '../domain/governance'
import type { Reviewer } from '../domain/reviews'
const eventId=(now:string)=>`${String(Date.parse(now)).padStart(13,'0')}_${randomUUID()}`
export const auditContext=new AsyncLocalStorage<{actor:Reviewer; now:string; correlationId:string;operation?:'cloned'|'imported'|'draft_saved'}>()
/** Metadata is constructed here from schema fields, never copied from a request or resource body. */
export function mutationAudit(collection:string,id:string,next:unknown,prior?:unknown):AuditEvent|undefined {
 const c=auditContext.getStore();if(!c)return
 const types:Record<string,string>={notificationDestinations:'notification_destination',notificationRules:'notification_rule',notificationDeliveries:'notification_test',evaluationForms:'form',questionGroupAssets:'group',policies:'policy',schedules:'schedule',humanReviews:'review',operationalAlerts:'alert',roleAssignments:'role',governanceSettings:'retention'}
 const type=types[collection];if(!type)return
 const n=(next??{}) as Record<string,unknown>,p=(prior??{}) as Record<string,unknown>
 if(type==='notification_test'&&(prior||n.event!=='TEST'))return
 let action=prior?'update':'create'
 if(type==='notification_test')action='requested'
 if(type==='notification_destination'||type==='notification_rule')action=prior&&n.enabled!==p.enabled?(n.enabled?'enable':'disable'):prior?'update':'create'
 if(type==='form'||type==='group'){action=!prior?(n.status==='PUBLISHED'?'publish':Number(n.version)>1?'new_version':'create'):n.status!==p.status?({PUBLISHED:'publish',RETIRED:'retire',TESTING:'move_testing',DRAFT:'move_draft'}[String(n.status)]??'update_draft'):'update_draft'}
 if(type==='policy'||type==='schedule')action=prior&&n.enabled!==p.enabled?(n.enabled?'enable':'disable'):prior?'update':'create'
 if(type==='review'){const events=n.events as {kind:string}[]|undefined;action=events?.at(-1)?.kind.replace('review_','')??'saved'}
 if(type==='alert')action=n.status==='RESOLVED'?'resolve':'acknowledge'
 if(type==='role')action=prior?'change':'assign'
 if(type==='retention')action='settings_changed'
 if((type==='form'||type==='group'||type==='policy')&&c.operation)action=c.operation
 const metadata:AuditEvent['metadata']={}
 if(typeof n.enabled==='boolean')metadata.enabled=n.enabled
 if(typeof n.version==='number'&&Number.isFinite(n.version))metadata.version=n.version
 if(['DRAFT','TESTING','PUBLISHED','RETIRED','REVIEW_REQUESTED','IN_REVIEW','REVIEWED','OPEN','ACKNOWLEDGED','RESOLVED'].includes(String(n.status)))metadata.status=String(n.status)
 if(['ADMIN','AUTHOR','REVIEWER','VIEWER'].includes(String(n.role)))metadata.role=String(n.role)
 return {id:eventId(c.now),occurredAt:c.now,actor:c.actor,action:`${type}.${action}`,resourceType:type,resourceId:id,...(typeof n.version==='number'?{resourceVersion:n.version}:{}),summary:`${type} ${action.replaceAll('_',' ')}`,metadata,correlationId:c.correlationId,source:'browser-api'}
}
export function retentionAudit(action:'planned'|'executed',id:string,metadata:AuditEvent['metadata']):AuditEvent {
 const c=auditContext.getStore();if(!c)throw Error('Audit identity required.')
 return {id:eventId(c.now),occurredAt:c.now,actor:c.actor,action:`retention.purge_${action}`,resourceType:'retention',resourceId:id,summary:`Retention purge ${action}`,metadata,correlationId:c.correlationId,source:'browser-api'}
}

export function mutationAudits(collection:string,id:string,next:unknown,prior?:unknown):AuditEvent[]{
 if(isDeepStrictEqual(next,prior))return []
 const event=mutationAudit(collection,id,next,prior);if(!event)return []
 if(collection==='notificationDestinations'&&prior){const n=next as {configuration?:unknown},p=prior as {configuration?:unknown};const refs=(v:unknown)=>Object.entries((v??{}) as Record<string,unknown>).filter(([k])=>k.endsWith('SecretRef'));if(!isDeepStrictEqual(refs(n.configuration),refs(p.configuration)))return [event,{...event,id:eventId(event.occurredAt),action:'notification_destination.secret_reference_changed',summary:'notification destination secret reference changed'}]}
 if(collection!=='humanReviews')return [event]
 const n=next as {events?:{kind:string}[]},p=prior as {events?:unknown[]}|undefined
 return (n.events??[]).slice(p?.events?.length??0).map(e=>({...event,id:eventId(event.occurredAt),action:`review.${e.kind.replace('review_','')}`,summary:e.kind.replaceAll('_',' ')}))
}
