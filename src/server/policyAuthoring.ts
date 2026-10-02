import { clonePolicy, samePolicyDefinition, validatePolicy } from '../domain/policyAuthoring'
import type { InteractionPolicy, EvaluationForm } from '../domain/types'
import { auditContext } from './audit'
import { StoreConflict, type Store, type AtomicWrite } from './store'
export class PolicyConflict extends StoreConflict {constructor(){super();this.message='This policy changed elsewhere. Refresh before saving.'}}
export async function savePolicy(store:Store,input:InteractionPolicy,expectedVersion:unknown,now:string):Promise<InteractionPolicy> {
 const prior=await store.policy(input.id)
 if(prior ? expectedVersion!==(prior.version??1) : expectedVersion!==null)throw new PolicyConflict()
 const forms=await Promise.all((Array.isArray(input.evaluationFormIds)?input.evaluationFormIds:[]).filter((id):id is string=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(id)).map(id=>store.form(id)))
 const errors=validatePolicy(input,forms.filter((f):f is EvaluationForm=>!!f));if(errors.length)throw Error(errors.join(' '))
 if(prior&&samePolicyDefinition(prior,input))return prior
 const item:InteractionPolicy={id:input.id,name:input.name,description:input.description,enabled:input.enabled,criteria:structuredClone(input.criteria),evaluationFormIds:[...input.evaluationFormIds],...(input.sampling?{sampling:structuredClone(input.sampling)}:{}),version:prior?(prior.version??1)+1:1,createdAt:prior?.createdAt??now,updatedAt:now}
 // Preserve inert legacy metadata without making it a competing schedule resource.
 if(prior?.schedule)item.schedule=prior.schedule
 const writes:AtomicWrite[]=[...forms.filter((f):f is EvaluationForm=>!!f).map(f=>({collection:'evaluationForms' as const,id:f.id,expected:f,checkOnly:true})),{collection:'policies',id:item.id,value:item,expected:prior}]
 try{await store.atomic(writes)}catch(error){if(error instanceof StoreConflict)throw new PolicyConflict();throw error}
 return item
}
export async function duplicatePolicy(store:Store,sourceId:string,newId:string,now:string):Promise<InteractionPolicy|undefined> {
 const source=await store.policy(sourceId);if(!source)return
 const item=clonePolicy(source,newId)
 if(auditContext.getStore())auditContext.getStore()!.operation='cloned'
 return savePolicy(store,item,null,now)
}
