import type { Reviewer } from './reviews'
export const permissions = ['notifications.read','notifications.write','notifications.test','forms.read','forms.write','forms.publish','groups.read','groups.write','groups.publish','policies.read','policies.write','schedules.write','evaluations.read','evaluations.write','reviews.read','reviews.write','reviews.assign','alerts.read','alerts.acknowledge','alerts.resolve','settings.read','settings.write','roles.manage','retention.execute','audit.read','history.read'] as const
export type Permission = typeof permissions[number]
export const roles = ['ADMIN','AUTHOR','REVIEWER','VIEWER'] as const
export type Role = typeof roles[number]
const read:Permission[]=['forms.read','groups.read','policies.read','evaluations.read','reviews.read','alerts.read','settings.read']
export const rolePermissions:Record<Role,readonly Permission[]>={ADMIN:permissions,AUTHOR:[...read,'notifications.read','forms.write','forms.publish','groups.write','groups.publish','policies.write','schedules.write','evaluations.write','alerts.acknowledge','history.read'],REVIEWER:[...read,'reviews.write'],VIEWER:read}
export const hasPermission=(role:Role,permission:Permission)=>rolePermissions[role].includes(permission)
export interface RoleAssignment {id:string; userId:string; displayName?:string; role:Role; createdAt:string; updatedAt:string; assignedBy:Reviewer}
export interface SessionAccess {actor:Reviewer; role:Role; permissions:readonly Permission[]; bootstrap:boolean}
export interface AuditEvent {id:string; occurredAt:string; actor:Reviewer; action:string; resourceType:string; resourceId:string; resourceVersion?:number; summary:string; metadata:Record<string,string|number|boolean>; correlationId:string; source:'browser-api'}
export interface GovernanceSettings {id:'governance'; browserContentCacheHours:number; evaluationRetentionDays:number|null; reviewRetentionDays:number|null; policyRunRetentionDays:number|null; alertRetentionDays:number|null; auditRetentionDays:number|null;notificationDeliveryRetentionDays:number|null}
export const defaultGovernance:GovernanceSettings={id:'governance',browserContentCacheHours:24,evaluationRetentionDays:null,reviewRetentionDays:null,policyRunRetentionDays:null,alertRetentionDays:null,auditRetentionDays:null,notificationDeliveryRetentionDays:null}
export function validateGovernance(input:unknown):GovernanceSettings {
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid governance settings.')
 const v=input as Record<string,unknown>,out={...defaultGovernance}
 for(const key of Object.keys(defaultGovernance) as (keyof GovernanceSettings)[]){if(key==='id')continue;const n=v[key]??(key==='notificationDeliveryRetentionDays'?null:v[key]);if(key==='browserContentCacheHours'){if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>168)throw Error('Browser cache hours must be 0 to 168.');out[key]=n}else{if(n!==null&&(typeof n!=='number'||!Number.isInteger(n)||n<1||n>36500))throw Error('Retention days must be null or an integer from 1 to 36500.');out[key]=n as number|null}}
 return out
}
