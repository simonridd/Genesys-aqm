import { answerFormat } from './authoringPresentation'
import { observeReview, reviewDraftConflict, type ReviewDraftController } from './useReviewDrafts'
import { ReviewScoreSummary } from './ReviewScoreSummary'
import { AssignmentEditor, ReviewDueBadge, useReviewSla } from './ReviewOperations'
import { reviewDueAt } from './domain/reviewSla'
import { usePermission } from './GovernancePanel'
import { scoreFormResults, effectiveQuestions } from './domain/formComposition'
import { useEffect, useRef, useState } from 'react'
import type { EvaluationRecord } from './domain/types'
import type { AuthSession } from './domain/genesysAuth'
import { answerCredit, compareAnswer, selectedConfidence, type HumanAnswer, type HumanReview, type ReviewInput } from './domain/reviews'
import { humanReviewStatus, reviewerName } from './userLanguage'
import { reviewStatus } from './domain/reviews'
import { apiOrigin } from './domain/manualClient'
export const reviewPercent=(value:number|null|undefined)=>value==null?'—':`${Math.round(value*100)}%`
export async function writeHumanReview(session:AuthSession,record:EvaluationRecord,prior:HumanReview|undefined,action:ReviewInput['action'],answers?:HumanAnswer[],notes?:string):Promise<HumanReview>{
  const reply=await fetch(`${apiOrigin}/api/reviews/${encodeURIComponent(record.id)}`,{method:'PUT',headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({expectedRevision:prior?.revision??0,formId:record.form.id,formVersion:record.form.version,action,answers,notes})})
  const body=await reply.json() as {item:HumanReview;error?:string}
  if(!reply.ok)throw Error(body.error??`Review failed (HTTP ${reply.status}).`)
  return body.item
}
export function ReviewPanel({record,review,session,onSaved,drafts,myQueue,onContinue,focused=false,onStarted}:{drafts:ReviewDraftController;focused?:boolean;onStarted?:()=>void;myQueue:boolean;onContinue:()=>void;record:EvaluationRecord;review?:HumanReview;session:AuthSession|null;onSaved:(review:HumanReview)=>void}){
  const sla=useReviewSla(session)
  const savedCallback=useRef(onSaved);savedCallback.current=onSaved
  const taskHeading=useRef<HTMLHeadingElement>(null)
  const questionsRef=useRef<HTMLDivElement>(null)
  const startFocus=useRef(false)
  const confirmation=useRef<HTMLParagraphElement>(null)
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[filter,setFilter]=useState('all')
  const draft=observeReview(drafts.drafts[record.id],record.id,review)
  const {answers,notes,editing}=draft
  const conflict=reviewDraftConflict(draft,review)
  useEffect(()=>{
    if(review?.status==='REVIEWED'&&!draft.dirty){
      if(drafts.drafts[record.id])drafts.clear(record.id)
    }else drafts.observe(record.id,review)
  },[record.id,review,drafts.observe,drafts.clear,draft.dirty])
  const canAssign=usePermission('reviews.assign')
  const canWrite=usePermission('reviews.write')
  const completed=review?.status==='REVIEWED'
  const showingCompleted=completed&&!draft.dirty
  useEffect(()=>{
    if(completed&&notice.startsWith('Review completed.')){
      confirmation.current?.scrollIntoView({block:'nearest'})
      confirmation.current?.focus({preventScroll:true})
    }
  },[completed,notice])
  const assignedOther=!!review?.assignment&&review.assignment.assignee.userId!==session?.userId||review?.status==='IN_REVIEW'&&!review.assignment&&!!review.reviewer&&review.reviewer.userId!==session?.userId
  const unassignedRequested=review?.status==='REVIEW_REQUESTED'&&!review.assignment
  const editable=canWrite&&editing&&!completed&&!!session&&!assignedOther
  const taskFirst=focused||editing&&!showingCompleted
  useEffect(()=>{if(startFocus.current&&editable){startFocus.current=false;const target=questionsRef.current?.querySelector<HTMLSelectElement>('select:not(:disabled)')??taskHeading.current;target?.focus();target?.scrollIntoView({block:'nearest'})}},[editable,busy])
  const writable=canWrite&&!assignedOther&&!conflict
  const save=async(action:ReviewInput['action'])=>{
    if(!session||busy||!writable||completed)return;setBusy(true);setError('');setNotice('')
    try{const item=await writeHumanReview(session,record,review,action,action==='save'||action==='complete'?answers:undefined,action==='save'||action==='complete'?notes:undefined);if(action==='start'||action==='claim'){startFocus.current=true;onStarted?.()}if(action==='complete')drafts.clear(record.id);else drafts.replace(record.id,item);savedCallback.current(item);setNotice(action==='complete'?`Review completed.${myQueue?' It has been removed from My Reviews.':''} The original AI result is preserved.`:action==='save'?'Review progress saved.':action==='request'?'Review requested.':'Review started.')}
    catch(reason){setError(reason instanceof Error?reason.message:'Review failed.')}
    finally{setBusy(false)}
  }
  const update=(questionId:string,change:Partial<HumanAnswer>)=>drafts.change(record.id,draft=>{
    const old=draft.answers.find(item=>item.questionId===questionId)
    const answers=change.value===''?draft.answers.filter(item=>item.questionId!==questionId):old?draft.answers.map(item=>item.questionId===questionId?{...item,...change}:item):change.value!==undefined?[...draft.answers,{questionId,value:change.value,note:change.note}]:draft.answers
    return {...draft,answers}
  })
  const refresh=async()=>{
    if(!session||busy)return;setBusy(true);setError('')
    try{const reply=await fetch(`${apiOrigin}/api/reviews/${encodeURIComponent(record.id)}`,{headers:{Authorization:`Bearer ${session.accessToken}`}});if(!reply.ok)throw Error('Could not refresh review.');const item=await reply.json() as HumanReview;savedCallback.current(item);setNotice('Review refreshed. Any unsaved answers are still held in this session.')}
    catch(reason){setError(reason instanceof Error?reason.message:'Refresh failed.')}
    finally{setBusy(false)}
  }
  const questions=effectiveQuestions(record.form).filter(q=>q.enabled).map(q=>{
    const ai=record.questions.find(item=>item.id===q.id),answer=answers.find(item=>item.questionId===q.id)
    const human=answer?answerCredit(q,answer.value):null,comparison=human&&ai?compareAnswer(q,ai,human):null
    return {q,ai,answer,human,comparison}
  })
  const preview=scoreFormResults(record.form,questions.filter(item=>item.ai).map(({ai,human})=>({...ai!,credit:human?.credit??null,weightedContribution:human?.credit==null?null:human.credit*ai!.weight})),new Map((record.groupResults??[]).map(g=>[g.groupId,g.status!=='SKIPPED'])))
  const aiGroups=record.groupResults??scoreFormResults(record.form,record.questions).groups
  const visible=questions.filter(item=>filter==='all'||filter==='agreements'&&item.comparison?.exact||filter==='disagreements'&&item.comparison&&!item.comparison.exact)
  const agreements=questions.filter(item=>item.comparison?.exact).length
  const applicable=questions.filter(item=>item.ai?.status!=='SKIPPED')
  const answered=applicable.filter(item=>item.answer).length
  const controls=<div className="review-actions">{writable&&!completed&&(!editing||unassignedRequested)&&<><button className="primary-button" disabled={!session||busy} onClick={()=>void save(unassignedRequested?'claim':'start')}>{unassignedRequested?'Claim and start review':review?'Start review':'Review evaluation'}</button>{!review&&<button className="outline-button" disabled={!session||busy} onClick={()=>void save('request')}>Mark for review</button>}</>}{editable&&<><button className="outline-button" disabled={busy||conflict} onClick={()=>void save('save')}>Save progress</button><button className="primary-button" disabled={busy||conflict||answers.length!==applicable.length} onClick={()=>void save('complete')}>Complete review</button></>}</div>
  const comparison=<><ReviewScoreSummary aiScore={record.overallScore} humanScore={preview.overallScore} agreements={agreements} answered={applicable.length} gap={draft.dirty?null:review?.comparison.absoluteScoreDifference} completed={showingCompleted}/>
    <section aria-label="Group comparison"><h3>Group comparison{showingCompleted?'':' · human progress preview'}</h3><div className="group-comparison">{preview.groups.map(g=>{const ai=aiGroups.find(a=>a.groupId===g.groupId)?.overallScore??null;return <div className="panel" key={g.groupId}><strong>{g.name}</strong><p>AI group score: {reviewPercent(ai)}</p><p>Human group score: {reviewPercent(g.overallScore)}</p><p>Difference: {ai===null||g.overallScore===null?'—':`${((g.overallScore-ai)*100).toFixed(1)} pp`}</p>{g.critical&&<p>Critical group · {g.passed===false?'FAIL':g.passed===true?'Pass':'Not scored'}</p>}</div>})}</div></section></>
  return <section className={`human-review ${taskFirst?'review-task-first':''}`} aria-label="Human review"><div className="panel-heading"><div><span className="mini-label">HUMAN REVIEW</span><h2 ref={taskHeading} tabIndex={-1}>{showingCompleted?'Completed calibration':'Review this evaluation'}</h2><p>{!focused&&`${record.form.name} v${record.form.version} · `}{taskFirst?(showingCompleted?'Completed':editing?'In progress':'Ready to review'):humanReviewStatus(reviewStatus(record,review))}{focused&&review?.assignment?.assignee.userId===session?.userId?' · Assigned to you':''}</p></div><span className="pill">{record.source==='synthetic-demo'?'SYNTHETIC DEMO':record.conversationSource==='synthetic'?'SYNTHETIC':record.conversationSource==='genesys-cloud'?'REAL GENESYS DATA':'SOURCE UNVERIFIED'}</span></div>
    {!focused&&<div className="review-identity"><p>Assigned to: {reviewerName(review?.assignment?.assignee)}</p><p>Due: {reviewDueAt(review)?new Date(reviewDueAt(review)!).toLocaleString():'No due date'} <ReviewDueBadge review={review} now={sla.now} settings={sla.settings}/></p></div>}
    {assignedOther&&!completed&&<p className="field-note">Assigned to another reviewer. Review answers are read-only. {draft.dirty&&'Your unsaved answers are still held in this session. '}An assignment manager can explicitly reassign or take over.</p>}
    {draft.dirty&&<p role="status">Unsaved review changes · Kept temporarily while you inspect this session.</p>}
    {conflict&&<div className="inline-error" role="alert"><p>This review changed while you were inspecting evidence. Your unsaved answers are still held in this session. {completed?'This review has already been completed. Discard your unsaved answers to inspect the completed review.':'Check the current review before continuing.'}</p><button className="outline-button" disabled={busy} onClick={()=>void refresh()}>Refresh current review</button> <button className="outline-button" disabled={busy} onClick={()=>{drafts.replace(record.id,review);setError('');setNotice('Unsaved answers discarded. The current review is shown.')}}>Discard my unsaved answers</button></div>}
    {draft.dirty&&!conflict&&<button className="text-link" disabled={busy} onClick={()=>{drafts.replace(record.id,review);setNotice('Unsaved answers discarded.')}}>Discard my unsaved answers</button>}
    {!taskFirst&&<AssignmentEditor session={session} review={review} evaluationId={record.id} onSaved={onSaved}/>}
    {showingCompleted?comparison:!taskFirst&&comparison}
    {taskFirst&&!showingCompleted&&<p className="review-progress" aria-live="polite">{answered} of {applicable.length} questions answered</p>}
    {!taskFirst&&<p className="field-note">Use the evaluated form snapshot. Partial scores are previews; completed reviews contribute to Calibration. AI scores stay in Quality.</p>}
    {!taskFirst&&review?.reviewer&&<p className="field-note">Reviewer: {reviewerName(review.reviewer)} · {new Date(review.updatedAt).toLocaleString()}</p>}
    {controls}

    {!review&&record.reviewState==='REVIEWED'&&<p className="field-note">This evaluation has a legacy review marker, without saved human answers. Complete a human review to include it in Calibration.</p>}
    {!session&&<p className="field-note">Connect to Genesys Cloud to complete a human review of an evaluation saved in AQM. Evaluations saved only in this browser must first be saved in AQM.</p>}
    {error&&<p className="inline-error" role="alert">{error} <button className="outline-button" disabled={busy||!session} onClick={()=>void refresh()}>Refresh review</button></p>}
    {notice&&<p ref={confirmation} tabIndex={-1} role="status">{notice}</p>}{completed&&(myQueue||focused)&&<button className="outline-button" onClick={onContinue}>{myQueue?'Close and continue My Reviews':'Close and continue review queue'}</button>}
    {(!taskFirst||showingCompleted)&&<div className="analytics-tabs" role="group" aria-label="Comparison filter">{['all','agreements','disagreements'].map(value=><button key={value} className={filter===value?'active':''} onClick={()=>setFilter(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div>}
    {!(taskFirst&&!showingCompleted?questions:visible).length&&<p>No {filter==='all'?'questions':filter} in the current answers.</p>}
    <div ref={questionsRef} className="review-questions">{(taskFirst&&!showingCompleted?questions:visible).map(({q,ai,answer,human,comparison})=><article className={`review-question ${comparison&&!comparison.exact?'disagreement':''}`} key={q.id}>
      <div className="review-question-heading"><div><span className="mini-label">{record.form.groups?.find(g=>g.id===q.groupId)?.name??q.section??'Evaluation'}{!taskFirst&&` · ${answerFormat(q.type)}`}</span><h3>{q.title}</h3></div><span className={`pill ${comparison&&!comparison.exact?'review-difference':''}`}>{ai?.status==='SKIPPED'?'Not applicable / Skipped':!comparison?'Unanswered':comparison.exact?'Agreement':comparison.band==='different'?'Disagreement':`${comparison.band==='one-band'?'One-band':'Larger-band'} difference`}</span></div>
      <p className="review-instructions">{q.instructions}</p><div className="review-answer-grid"><div className="review-human"><label>{editable?'Human answer':'HUMAN REVIEW'}{editable&&ai?.status!=='SKIPPED'?<select aria-label={`Human answer: ${q.title}`} value={answer?.value??''} disabled={busy||conflict} onChange={event=>update(q.id,{value:event.target.value===''?'':q.type==='score'?Number(event.target.value):event.target.value})}><option value="">Select an answer</option>{q.type==='noul'?['Yes','No'].map(value=><option key={value}>{value}</option>):q.options.map((option,index)=><option key={option.key} value={q.type==='score'?index:option.key}>{option.label}</option>)}</select>:<strong>{ai?.status==='SKIPPED'?'Not applicable / Skipped':human?.outcome??'Not answered'}</strong>}</label><p>Human credit {reviewPercent(human?.credit)}</p>{editable&&ai?.status!=='SKIPPED'?<label>Question note<textarea aria-label={`Question note: ${q.title}`} maxLength={2000} rows={2} value={answer?.note??''} disabled={busy||conflict||!answer} onChange={event=>update(q.id,{note:event.target.value})}/></label>:answer?.note&&<p className="review-note">{answer.note}</p>}</div><div className="review-ai"><span className="mini-label">AI RESULT</span><strong>{ai?.outcome??'Unavailable'}</strong><p>Credit {reviewPercent(ai?.credit)} · {q.type==='noul'?'Yes probability':'Confidence'} {reviewPercent(q.type==='noul'?ai?.probability:ai?.confidence??ai?.probability)}</p>{q.type==='noul'&&ai&&<small>Selected-answer confidence {reviewPercent(selectedConfidence(ai))}</small>}{comparison?.valueDistance!=null&&<small>Exact value distance: {comparison.valueDistance.toFixed(2)} bands</small>}</div>
      </div>
    </article>)}</div>
    {editable?<label className="review-overall-note">Overall review note<textarea aria-label="Overall review note" maxLength={4000} rows={3} value={notes} disabled={busy||conflict} onChange={event=>{const notes=event.target.value;drafts.change(record.id,draft=>({...draft,notes}))}}/></label>:notes&&<div className="review-overall-note"><h3>Reviewer note</h3><p>{notes}</p></div>}
    {taskFirst&&editable&&<div className="review-finish" role="group" aria-label="Finish review">{controls}</div>}
    {taskFirst&&!showingCompleted&&<details className="review-comparison"><summary>Review comparison</summary>{comparison}<p className="field-note">Partial scores are previews. The original AI result is preserved.</p></details>}
    {taskFirst&&canAssign&&!showingCompleted&&<details className="review-assignment"><summary>Assignment details</summary><AssignmentEditor session={session} review={review} evaluationId={record.id} onSaved={onSaved}/><p>Assigned to {reviewerName(review?.assignment?.assignee)}</p></details>}
    {review&&<details className="review-audit"><summary>Review history ({review.events.length} events)</summary><p>Revision {review.revision} · Reviewer ID: {review.reviewer?.userId??'Not recorded'} · Assignee ID: {review.assignment?.assignee.userId??'Unassigned'}</p>{taskFirst&&review.reviewer&&<p>Reviewer: {reviewerName(review.reviewer)} · {new Date(review.updatedAt).toLocaleString()}</p>}{review.events.map((event,index)=><p key={index}>{event.kind.replaceAll('_',' ')} · {event.actor.displayName??event.actor.userId}{event.assignee?` → ${event.assignee.displayName??event.assignee.userId}`:''}{event.dueAt?` · due ${new Date(event.dueAt).toLocaleString()}`:''} · {new Date(event.at).toLocaleString()} · revision {event.revision}</p>)}</details>}
  </section>
}
