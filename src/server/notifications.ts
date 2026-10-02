import { createHash, randomUUID } from 'node:crypto'
import { alertTypes } from '../domain/operationalAlerts'
import { ruleMatches, type NotificationDelivery, type NotificationDestination, type NotificationRule } from '../domain/notifications'
import { DeliveryError, secretReference, type NotificationProvider } from './notificationProviders'
import { StoreConflict, type Store } from './store'
export type Providers=Record<'WEBHOOK'|'EMAIL',NotificationProvider>
const validId=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(v)
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const email=(v:unknown):v is string=>typeof v==='string'&&v.length<=254&&/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v)&&!/[\r\n]/.test(v)
function base(input:unknown){if(!object(input)||!validId(input.id)||typeof input.name!=='string'||input.name.length<1||input.name.length>100||typeof input.enabled!=='boolean')throw Error('Invalid notification configuration.');return input}
export function destinationInput(input:unknown,now:string,prior?:NotificationDestination):NotificationDestination {
 const v=base(input);if(!['WEBHOOK','EMAIL'].includes(String(v.type))||!object(v.configuration))throw Error('Invalid destination.')
 if(prior&&prior.type!==v.type)throw Error('Destination channel cannot change. Create a new destination.')
 const c=v.configuration,configuration:NotificationDestination['configuration']={}
 if(v.type==='WEBHOOK'){
  if(Object.keys(c).some(k=>!['urlSecretRef','signingSecretRef'].includes(k))||!secretReference(c.urlSecretRef)||c.signingSecretRef&&!secretReference(c.signingSecretRef))throw Error('Use notification Secret Manager references; URLs and secrets are never accepted here.')
  configuration.urlSecretRef=c.urlSecretRef;if(c.signingSecretRef)configuration.signingSecretRef=c.signingSecretRef as string
 }else{
  if(Object.keys(c).some(k=>!['provider','from','to','apiKeySecretRef'].includes(k))||c.provider!=='RESEND'||!email(c.from)||!Array.isArray(c.to)||!c.to.length||c.to.length>10||!c.to.every(email)||!secretReference(c.apiKeySecretRef))throw Error('Provide Resend, sender, 1–10 recipient addresses and an API key Secret Manager reference.')
  Object.assign(configuration,{provider:'RESEND',from:c.from,to:[...new Set(c.to)],apiKeySecretRef:c.apiKeySecretRef})
 }
 return {id:v.id as string,name:v.name as string,enabled:v.enabled as boolean,type:v.type as NotificationDestination['type'],configuration,createdAt:prior?.createdAt??now,updatedAt:now}
}
export function ruleInput(input:unknown,now:string,prior?:NotificationRule):NotificationRule {
 const v=base(input)
 if(!Array.isArray(v.severities)||!v.severities.length||!v.severities.every(s=>['INFO','WARNING','ERROR'].includes(s))||!Array.isArray(v.alertTypes)||!v.alertTypes.every(t=>alertTypes.includes(t))||!Array.isArray(v.destinationIds)||!v.destinationIds.length||v.destinationIds.length>10||!v.destinationIds.every(validId)||v.policyId&&!validId(v.policyId)||v.notifyOnResolution!==undefined&&typeof v.notifyOnResolution!=='boolean')throw Error('Invalid notification rule criteria.')
 return {id:v.id as string,name:v.name as string,enabled:v.enabled as boolean,severities:[...new Set(v.severities)] as NotificationRule['severities'],alertTypes:[...new Set(v.alertTypes)] as NotificationRule['alertTypes'],destinationIds:[...new Set(v.destinationIds)] as string[],...(v.policyId?{policyId:v.policyId as string}:{}),notifyOnResolution:v.notifyOnResolution===true,createdAt:prior?.createdAt??now,updatedAt:now}
}
export function safeDestination(d:NotificationDestination){return {id:d.id,name:d.name,type:d.type,enabled:d.enabled,configuration:{...(d.type==='EMAIL'?{provider:d.configuration.provider,from:d.configuration.from,to:d.configuration.to}:{})},configured:!!(d.configuration.urlSecretRef||d.configuration.apiKeySecretRef),signed:!!d.configuration.signingSecretRef,createdAt:d.createdAt,updatedAt:d.updatedAt}}
export const deliveryId=(alertId:string,ruleId:string,destinationId:string,event:string)=>createHash('sha256').update(JSON.stringify([alertId,ruleId,destinationId,event])).digest('hex')
const retryMinutes=[5,30,120]
export async function routeNotifications(store:Store,now:string){
 const [rules,destinations,events]=await Promise.all([store.query<NotificationRule>('notificationRules',51),store.query<NotificationDestination>('notificationDestinations',101),store.notificationWork('events',now,5)])
 if(rules.nextCursor||rules.items.length>50||destinations.nextCursor||destinations.items.length>100)throw Error('Notification configuration limit exceeded.')
 const byId=new Map(destinations.items.map(d=>[d.id,d]));let routed=0
 for(const e of events){
  if(e.event==='RESOLVED'){const openedEvent=await store.governanceRead<import('../domain/notifications').NotificationEvent>('notificationEvents',`${e.alertId}_OPEN`);if(openedEvent&&!openedEvent.routed)continue}
  const deliveries:NotificationDelivery[]=[]
  for(const rule of rules.items.filter(r=>ruleMatches(r,e)))for(const destId of rule.destinationIds){const dest=byId.get(destId);if(!dest?.enabled)continue
   // Resolution only follows an OPEN delivered for the same alert/rule/destination.
   if(e.event==='RESOLVED'){const opened=await store.governanceRead<NotificationDelivery>('notificationDeliveries',deliveryId(e.alertId,rule.id,destId,'OPEN'));if(!opened||opened.state==='FAILED'||opened.state==='SUPPRESSED')continue}
   deliveries.push({id:deliveryId(e.alertId,rule.id,destId,e.event),alertId:e.alertId,ruleId:rule.id,destinationId:destId,channel:dest.type,event:e.event,state:'PENDING',payload:e.payload,attemptCount:0,nextAttemptAt:now,createdAt:now,updatedAt:now})
  }
  // Deterministic creates commit in small chunks before marking the event routed.
  // A crash or conflict can replay unfinished chunks without resetting any delivery.
  let complete=true
  for(let offset=0;offset<deliveries.length;offset+=80){
   const chunk=deliveries.slice(offset,offset+80)
   for(let retry=0;retry<3;retry++){
    const prior=await Promise.all(chunk.map(d=>store.governanceRead<NotificationDelivery>('notificationDeliveries',d.id)))
    const writes=chunk.flatMap((d,i)=>prior[i]?[]:[{collection:'notificationDeliveries' as const,id:d.id,value:d,expected:undefined}])
    if(!writes.length)break
    try{await store.atomic(writes);break}catch(err){if(!(err instanceof StoreConflict))throw err;if(retry===2)complete=false}
   }
   if(!complete)break
  }
  if(!complete)continue
  try{await store.atomic([{collection:'notificationEvents',id:e.id,value:{...e,routed:true},expected:e}]);routed++}catch(err){if(!(err instanceof StoreConflict))throw err}
 }
 return routed
}
export async function dispatchNotifications(store:Store,providers:Providers,clock:()=>Date=()=>new Date()){
 const now=clock().toISOString();let attempted=0
 for(const original of await store.notificationWork('deliveries',now,20)){
  if(!['PENDING','RETRYING'].includes(original.state))continue
  if(original.event==='RESOLVED'&&original.ruleId&&original.alertId){const open=await store.governanceRead<NotificationDelivery>('notificationDeliveries',deliveryId(original.alertId,original.ruleId,original.destinationId,'OPEN'));if(open?.state==='PENDING'||open?.state==='RETRYING'){try{await store.atomic([{collection:'notificationDeliveries',id:original.id,value:{...original,updatedAt:clock().toISOString(),nextAttemptAt:new Date(clock().getTime()+5*60000).toISOString()},expected:original}])}catch(e){if(!(e instanceof StoreConflict))throw e}continue}}
  const claimNow=clock().toISOString()
  const owner=randomUUID(),claimed:NotificationDelivery={...original,leaseOwner:owner,state:'RETRYING',attemptCount:Math.min(original.attemptCount+1,4),firstAttemptAt:original.firstAttemptAt??claimNow,lastAttemptAt:claimNow,updatedAt:claimNow,nextAttemptAt:new Date(Date.parse(claimNow)+60000).toISOString()}
  try{await store.atomic([{collection:'notificationDeliveries',id:original.id,value:claimed,expected:original}])}catch(e){if(e instanceof StoreConflict)continue;throw e}
  let state:NotificationDelivery['state']='DELIVERED',code:string|undefined,transient=false
  try{
   if(original.attemptCount>=4)throw new DeliveryError('ATTEMPTS_EXHAUSTED')
   const d=await store.governanceRead<NotificationDestination>('notificationDestinations',claimed.destinationId)
   const rule=claimed.ruleId?await store.governanceRead<NotificationRule>('notificationRules',claimed.ruleId):undefined
   const send=async()=>{if(Date.parse(claimed.nextAttemptAt!)-clock().getTime()<45000)throw new DeliveryError('LEASE_EXPIRED',true);await providers[d!.type].send(d!,claimed)}
   if(!d?.enabled||claimed.ruleId&&!rule?.enabled){state='SUPPRESSED';code='DISABLED_CONFIGURATION'}
   else if(claimed.event==='RESOLVED'&&claimed.ruleId&&claimed.alertId){const open=await store.governanceRead<NotificationDelivery>('notificationDeliveries',deliveryId(claimed.alertId,claimed.ruleId,claimed.destinationId,'OPEN'));if(open?.state!=='DELIVERED'){state=open?.state==='PENDING'||open?.state==='RETRYING'?'RETRYING':'SUPPRESSED';code='OPEN_NOT_DELIVERED';transient=state==='RETRYING'}else await send()}
   else await send()
  }catch(e){const safe=e instanceof DeliveryError?e:new DeliveryError('PROVIDER_FAILURE',true);state='FAILED';code=/^[A-Z0-9_]{1,60}$/.test(safe.code)?safe.code:'PROVIDER_FAILURE';transient=safe.transient}
  if(state!=='DELIVERED'&&state!=='SUPPRESSED'&&transient&&claimed.attemptCount<4)state='RETRYING';else if(state==='RETRYING')state='FAILED'
  const at=clock().toISOString(),done:NotificationDelivery={...claimed,state,updatedAt:at,leaseOwner:undefined,nextAttemptAt:state==='RETRYING'?new Date(Date.parse(at)+retryMinutes[claimed.attemptCount-1]*60000).toISOString():undefined,lastErrorCode:code,deliveredAt:state==='DELIVERED'?at:undefined}
  for(let commit=0;commit<3;commit++){const prior=await store.governanceRead<{updatedAt:string}>('notificationDestinationHealth',done.destinationId);const writes:import('./store').AtomicWrite[]=[{collection:'notificationDeliveries',id:done.id,value:done,expected:claimed}];if(!prior||prior.updatedAt<=at)writes.push({collection:'notificationDestinationHealth',id:done.destinationId,expected:prior,value:{deliveryId:done.id,state:done.state,updatedAt:at,attemptCount:done.attemptCount}});try{await store.atomic(writes);break}catch(e){if(!(e instanceof StoreConflict)||commit===2)throw e}}attempted++
 }
 return {attempted}
}
export async function notificationTick(store:Store,providers:Providers,clock:()=>Date){const routed=await routeNotifications(store,clock().toISOString());return {routed,...await dispatchNotifications(store,providers,clock)}}
export async function requestTest(store:Store,destinationId:string,now:string):Promise<NotificationDelivery>{
 const d=await store.governanceRead<NotificationDestination>('notificationDestinations',destinationId);if(!d?.enabled)throw Error('Select an enabled notification destination.')
 const delivery:NotificationDelivery={id:randomUUID(),destinationId,channel:d.type,event:'TEST',state:'PENDING',attemptCount:0,nextAttemptAt:now,createdAt:now,updatedAt:now,payload:{schemaVersion:1,event:'TEST',test:true,context:{},application:{name:'Genesys AQM'},occurredAt:now}}
 await store.atomic([{collection:'notificationDeliveries',id:delivery.id,value:delivery,expected:undefined}]);return delivery
}
