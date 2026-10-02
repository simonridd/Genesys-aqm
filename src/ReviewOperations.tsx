import { defaultReviewSla, reviewDueAt, reviewDueState, reviewDueText, type ReviewSlaSettings } from './domain/reviewSla'
import { useEffect, useState } from 'react'
import type { AuthSession } from './domain/genesysAuth'
import type { AssignmentInput, HumanReview, ReviewerDirectoryItem, ReviewWorkload } from './domain/reviews'
import { governanceCall, usePermission } from './GovernancePanel'
export function localDueToIso(value:string):string|undefined {
  if(!value)return undefined
  const date=new Date(value)
  if(!Number.isFinite(date.getTime()))throw Error('Enter a valid due date and time.')
  return date.toISOString()
}
export function isoToLocalDue(value?:string):string {
  if(!value)return ''
  const d=new Date(value),pad=(v:number)=>String(v).padStart(2,'0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export function useReviewers(session:AuthSession|null) {
  const [items,setItems]=useState<ReviewerDirectoryItem[]>([]),[next,setNext]=useState<string|undefined>(),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  const load=async(cursor?:string)=>{
    if(!session)return
    setBusy(true);setError('')
    try{const data=await governanceCall(session,`/api/reviewers?limit=50${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`);setItems(old=>cursor?[...old,...data.items]:data.items);setNext(data.nextCursor)}catch(e){setError(e instanceof Error?e.message:'Reviewer directory unavailable.')}finally{setBusy(false)}
  }
  useEffect(()=>{setItems([]);setNext(undefined);void load()},[session?.accessToken])
  return {items,next,error,busy,more:()=>load(next)}
}
export function ReviewerPicker({directory,value,onChange,label='Assigned reviewer',optional=false,disabled=false}:{directory:ReturnType<typeof useReviewers>;value:string;onChange:(value:string)=>void;label?:string;optional?:boolean;disabled?:boolean}) {
  return <div className="reviewer-picker"><label>{label}<select aria-label={label} value={value} onChange={e=>onChange(e.target.value)} disabled={disabled||directory.busy}><option value="">{optional?'Leave unassigned':'Select reviewer'}</option>{value&&!directory.items.some(r=>r.userId===value)&&<option value={value}>{value} (current assignment)</option>}{directory.items.map(r=><option key={r.userId} value={r.userId}>{r.displayName??r.userId} · {r.role}</option>)}</select></label>{directory.next&&<button type="button" className="text-link" disabled={directory.busy} onClick={()=>void directory.more()}>Load more reviewers</button>}{directory.error&&<p role="alert">{directory.error}</p>}</div>
}
export function ReviewWorkloadPanel({session,refresh,onMine,onUnassigned}:{session:AuthSession|null;refresh:number;onMine:()=>void;onUnassigned:()=>void}) {
  const [data,setData]=useState<ReviewWorkload|null>(null),[error,setError]=useState('')
  useEffect(()=>{let active=true;setError('');if(!session){setData(null);return}void governanceCall(session,'/api/review-workload').then(v=>{if(active)setData(v)}).catch(e=>{if(active){setData(null);setError(e.message)}});return()=>{active=false}},[session?.accessToken,refresh])
  return <section className="panel review-workload" aria-label="Review workload"><div className="panel-heading"><div><h2>Review workload</h2><p>Open reviews across the server, including unassigned work.</p></div><div className="review-actions"><button className="primary-button" disabled={!session} onClick={onMine}>My review queue</button><button className="outline-button" disabled={!session} onClick={onUnassigned}>Unassigned requested reviews{data?.complete?` (${data.unassignedRequested})`:''}</button></div></div>{error&&<p role="alert" className="inline-error">{error}</p>}{data&&!data.complete&&<p role="status">Review SLA scan incomplete — workload needs indexing. {data.message}</p>}{data?.complete&&<><p className="field-note">Complete server summary · {new Date(data.asOf).toLocaleString()}</p><div className="review-workload-grid">{data.items.map(r=><article className="review-workload-card" key={r.userId}><strong>{r.displayName??r.userId}</strong>{r.userId!=='unassigned'&&!r.reviewerAccess&&<p className="inline-error">Assignee no longer has reviewer access</p>}<dl><div><dt>Assigned open</dt><dd>{r.assignedOpen}</dd></div><div><dt>Requested</dt><dd>{r.requested}</dd></div><div><dt>In review</dt><dd>{r.inReview}</dd></div><div><dt>Due soon</dt><dd>{r.dueSoon}</dd></div><div><dt>Overdue</dt><dd>{r.overdue}</dd></div><div><dt>Escalated</dt><dd>{r.escalated}</dd></div></dl></article>)}</div></>}</section>
}
export function AssignmentEditor({session,review,evaluationId,onSaved}:{session:AuthSession|null;review?:HumanReview;evaluationId:string;onSaved:(review:HumanReview)=>void}) {
  const canAssign=usePermission('reviews.assign'),directory=useReviewers(canAssign?session:null)
  const [assignee,setAssignee]=useState(review?.assignment?.assignee.userId??''),[due,setDue]=useState(isoToLocalDue(reviewDueAt(review))),[pending,setPending]=useState<AssignmentInput['action']|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
  useEffect(()=>{setAssignee(review?.assignment?.assignee.userId??'');setDue(isoToLocalDue(reviewDueAt(review)));setPending(null)},[review?.revision])
  if(!canAssign||!session||review?.status==='REVIEWED')return null
  const mutate=async(action:AssignmentInput['action'],confirmed=false,target=assignee)=>{
    if(review?.status==='IN_REVIEW'&&!confirmed){setPending(action);if(target!==assignee)setAssignee(target);return}
    setBusy(true);setError('')
    try{const body=await governanceCall(session,`/api/reviews/${encodeURIComponent(evaluationId)}/assignment`,'PUT',{action,expectedRevision:review?.revision??0,assigneeId:action==='unassign'?undefined:target,dueAt:action==='unassign'?undefined:localDueToIso(due),confirmInReview:confirmed});onSaved(body.item);setPending(null)}catch(e){setError(e instanceof Error?e.message:'Assignment failed.')}finally{setBusy(false)}
  }
  return <section className="assignment-editor" aria-label="Review assignment"><h3>Review assignment</h3><div className="browser-filters"><ReviewerPicker directory={directory} value={assignee} onChange={setAssignee} disabled={busy||!!pending}/><label>Due date<input aria-label="Due date" type="datetime-local" value={due} disabled={busy||!!pending} onChange={e=>setDue(e.target.value)}/><small>Optional · your local time</small></label></div><div className="review-actions"><button className="outline-button" disabled={busy||!assignee||!!pending} onClick={()=>void mutate(review?.assignment?'reassign':'assign')}>{review?.assignment?'Reassign':'Assign'}</button>{review?.assignment&&<button className="outline-button" disabled={busy||!!pending} onClick={()=>void mutate('unassign')}>Unassign</button>}{session.userId&&review?.assignment?.assignee.userId!==session.userId&&<button className="outline-button" disabled={busy||!!pending} onClick={()=>void mutate(review?.assignment?'reassign':'assign',false,session.userId)}>Take over review</button>}</div>{pending&&<div className="panel" role="group" aria-label="Confirm in-progress reassignment"><p>Change assignment of this in-progress review? Partial answers will be preserved.</p><button className="primary-button" disabled={busy} onClick={()=>void mutate(pending,true)}>Confirm {pending==='unassign'?'unassignment':'reassignment'}</button><button className="outline-button" disabled={busy} onClick={()=>setPending(null)}>Cancel</button></div>}{error&&<p role="alert" className="inline-error">{error}</p>}</section>
}

export function useReviewSla(session:AuthSession|null) {
  const [settings,setSettings]=useState<ReviewSlaSettings>(defaultReviewSla),[now,setNow]=useState(()=>new Date().toISOString()),[error,setError]=useState('')
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date().toISOString()),60000);return()=>clearInterval(timer)},[])
  useEffect(()=>{let active=true;if(session)void governanceCall(session,'/api/governance').then(v=>{if(active){setSettings(v.reviewSla??defaultReviewSla);setError('')}}).catch(()=>{if(active)setError('Review SLA settings unavailable. Showing default thresholds.')});return()=>{active=false}},[session?.accessToken])
  return {settings,now,error}
}
export function ReviewDueBadge({review,now,settings}:{review?:HumanReview;now:string;settings:ReviewSlaSettings}) {
  const state=reviewDueState(review,now,settings)
  return <span className="review-due-state">{['DUE_SOON','OVERDUE','ESCALATED'].includes(state)&&<span className={`pill review-${state.toLowerCase().replace('_','-')}`}>{state.replaceAll('_',' ')}</span>}<small>{state==='COMPLETED'?'Completed':reviewDueText(review,now)||'No due date'}</small></span>
}
