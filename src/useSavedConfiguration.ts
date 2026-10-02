import { useCallback, useEffect, useRef, useState } from 'react'
import type { AuthSession } from './domain/genesysAuth'
import type { EvaluationForm, InteractionPolicy, QuestionGroupAsset } from './domain/types'
import { apiOrigin } from './domain/manualClient'
import { loadPolicyCollection, policyCall } from './domain/policyClient'
export type SavedCollection<T> = { items:T[]; loading:boolean; loaded:boolean; error:string; refresh:()=>Promise<boolean>; accept:(item:T)=>void }
/** Identity-scoped, fail-closed collections. A refresh never owns authoring drafts. */
function useSavedCollection<T extends {id:string}>(session:AuthSession|null,path:string):SavedCollection<T> {
 const identity=session&&apiOrigin?`${session.organizationId??''}:${session.userId??''}:${session.accessToken}`:''
 const [state,setState]=useState({identity:'',items:[] as T[],loading:false,loaded:false,error:''})
 const accepted=useRef<Record<string,T>>({})
 const generation=useRef(0),activeIdentity=useRef(identity)
 activeIdentity.current=identity
 const refresh=useCallback(async()=>{
  if(!session||!identity)return false
  const n=++generation.current;accepted.current={}
  setState(current=>({...current,identity,loading:true,loaded:false,error:''}))
  try{
   const items=await loadPolicyCollection<T>(path=>policyCall(apiOrigin,session,path),path)
   if(n!==generation.current||activeIdentity.current!==identity)return false
   setState({identity,items:[...items.map(item=>accepted.current[item.id]??item),...Object.values(accepted.current).filter(item=>!items.some(saved=>saved.id===item.id))],loading:false,loaded:true,error:''});return true
  }catch(reason){
   if(n===generation.current&&activeIdentity.current===identity)setState(current=>({...current,identity,loading:false,loaded:false,error:reason instanceof Error?reason.message:'Saved configuration unavailable.'}))
   return false
  }
 },[identity,path])
 useEffect(()=>{setState({identity,items:[],loading:!!identity,loaded:false,error:''});void refresh();return()=>{generation.current++}},[refresh])
 const accept=(item:T)=>{
  // Overlay a save that completes during an earlier GET.
  if(activeIdentity.current!==identity)return
  accepted.current[item.id]=item
  setState(current=>({...current,identity,items:[...current.items.filter(v=>v.id!==item.id),item]}))
 }
 const current=state.identity===identity?state:{items:[] as T[],loading:!!identity,loaded:false,error:''}
 return {...current,refresh,accept}
}
export function useSavedConfiguration(session:AuthSession|null){
 return {forms:useSavedCollection<EvaluationForm>(session,'/api/forms'),policies:useSavedCollection<InteractionPolicy>(session,'/api/policies'),groups:useSavedCollection<QuestionGroupAsset>(session,'/api/question-groups')}
}
