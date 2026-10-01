import { usePermission } from './GovernancePanel'
import { scoreFormResults, effectiveQuestions } from './domain/formComposition'
import { useEffect, useState } from 'react'
import type { EvaluationRecord } from './domain/types'
import type { AuthSession } from './domain/genesysAuth'
import { answerCredit, compareAnswer, selectedConfidence, type HumanAnswer, type HumanReview, type ReviewInput } from './domain/reviews'
import { apiOrigin } from './domain/manualClient'
export const reviewPercent=(value:number|null|undefined)=>value==null?'—':`${Math.round(value*100)}%`
export async function writeHumanReview(session:AuthSession,record:EvaluationRecord,prior:HumanReview|undefined,action:ReviewInput['action'],answers?:HumanAnswer[],notes?:string):Promise<HumanReview>{
  const reply=await fetch(`${apiOrigin}/api/reviews/${encodeURIComponent(record.id)}`,{method:'PUT',headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({expectedRevision:prior?.revision??0,formId:record.form.id,formVersion:record.form.version,action,answers,notes})})
  const body=await reply.json() as {item:HumanReview;error?:string}
  if(!reply.ok)throw Error(body.error??`Review failed (HTTP ${reply.status}).`)
  return body.item
}
export function ReviewPanel({record,review,session,onSaved}:{record:EvaluationRecord;review?:HumanReview;session:AuthSession|null;onSaved:(review:HumanReview)=>void}){
  const [editing,setEditing]=useState(review?.status==='IN_REVIEW'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
  const [answers,setAnswers]=useState<HumanAnswer[]>(()=>review?.questions.flatMap(q=>q.human?[{questionId:q.questionId,value:q.human.value,note:q.human.note}]:[])??[])
  const [notes,setNotes]=useState(review?.notes??''),[filter,setFilter]=useState('all')
  useEffect(()=>{setEditing(review?.status==='IN_REVIEW');setAnswers(review?.questions.flatMap(q=>q.human?[{questionId:q.questionId,value:q.human.value,note:q.human.note}]:[])??[]);setNotes(review?.notes??'')},[review?.revision])
  const canWrite=usePermission('reviews.write')
  const completed=review?.status==='REVIEWED'
  const editable=canWrite&&editing&&!completed&&!!session
  const save=async(action:ReviewInput['action'])=>{
    if(!session)return;setBusy(true);setError('');setNotice('')
    try{const item=await writeHumanReview(session,record,review,action,action==='save'||action==='complete'?answers:undefined,action==='save'||action==='complete'?notes:undefined);onSaved(item);setEditing(item.status==='IN_REVIEW');setNotice(action==='complete'?'Review completed. The original AI result is preserved.':action==='save'?'Review progress saved.':action==='request'?'Review requested.':'Review started.')}
    catch(reason){setError(reason instanceof Error?reason.message:'Review failed.')}
    finally{setBusy(false)}
  }
  const update=(questionId:string,change:Partial<HumanAnswer>)=>setAnswers(items=>{const old=items.find(item=>item.questionId===questionId);if(change.value==='')return items.filter(item=>item.questionId!==questionId);return old?items.map(item=>item.questionId===questionId?{...item,...change}:item):change.value!==undefined?[...items,{questionId,value:change.value,note:change.note}]:items})
  const questions=effectiveQuestions(record.form).filter(q=>q.enabled).map(q=>{
    const ai=record.questions.find(item=>item.id===q.id),answer=answers.find(item=>item.questionId===q.id)
    const human=answer?answerCredit(q,answer.value):null,comparison=human&&ai?compareAnswer(q,ai,human):null
    return {q,ai,answer,human,comparison}
  })
  const preview=scoreFormResults(record.form,questions.filter(item=>item.ai).map(({ai,human})=>({...ai!,credit:human?.credit??null,weightedContribution:human?.credit==null?null:human.credit*ai!.weight})),new Map((record.groupResults??[]).map(g=>[g.groupId,g.status!=='SKIPPED'])))
  const aiGroups=record.groupResults??scoreFormResults(record.form,record.questions).groups
  const visible=questions.filter(item=>filter==='all'||filter==='agreements'&&item.comparison?.exact||filter==='disagreements'&&item.comparison&&!item.comparison.exact)
  const agreements=questions.filter(item=>item.comparison?.exact).length
  return <section className="human-review" aria-label="Human review"><div className="panel-heading"><div><span className="mini-label">HUMAN REVIEW</span><h2>{completed?'Completed calibration':'Review this evaluation'}</h2><p>{record.form.name} v{record.form.version} · {review?.status.replaceAll('_',' ')??'NOT REVIEWED'}</p></div><span className="pill">{record.source==='synthetic-demo'?'SYNTHETIC DEMO':record.conversationSource==='synthetic'?'SYNTHETIC':record.conversationSource==='genesys-cloud'?'REAL GENESYS DATA':'SOURCE UNVERIFIED'}</span></div>
    <div className="review-summary"><div><small>AI SCORE</small><strong>{reviewPercent(record.overallScore)}</strong></div><div><small>{completed?'HUMAN SCORE':'HUMAN PROGRESS PREVIEW'}</small><strong>{reviewPercent(preview.overallScore)}</strong></div><div><small>EXACT AGREEMENT</small><strong>{agreements} / {questions.filter(item=>item.ai?.status!=='SKIPPED').length}</strong></div><div><small>ABSOLUTE SCORE GAP</small><strong>{review?.comparison.absoluteScoreDifference==null?'—':`${(review.comparison.absoluteScoreDifference*100).toFixed(1)} pp`}</strong></div></div>
    <section aria-label="Group comparison"><h3>Group comparison{completed?'':' · human progress preview'}</h3><div className="group-comparison">{preview.groups.map(g=>{const ai=aiGroups.find(a=>a.groupId===g.groupId)?.overallScore??null;return <div className="panel" key={g.groupId}><strong>{g.name}</strong><p>AI group score: {reviewPercent(ai)}</p><p>Human group score: {reviewPercent(g.overallScore)}</p><p>Difference: {ai===null||g.overallScore===null?'—':`${((g.overallScore-ai)*100).toFixed(1)} pp`}</p>{g.critical&&<p>Critical group · {g.passed===false?'FAIL':g.passed===true?'Pass':'Not scored'}</p>}</div>})}</div></section>
    <p className="field-note">Use the evaluated form snapshot. Partial scores are previews; completed reviews contribute to Calibration. AI scores stay in Quality.</p>
    {review?.reviewer&&<p className="field-note">Reviewer: {review.reviewer.displayName??review.reviewer.userId} · {new Date(review.updatedAt).toLocaleString()} · revision {review.revision}</p>}
    <div className="review-actions">{canWrite&&!completed&&!editing&&<><button className="primary-button" disabled={!session||busy} onClick={()=>void save('start')}>{review?'Continue review':'Review evaluation'}</button>{!review&&<button className="outline-button" disabled={!session||busy} onClick={()=>void save('request')}>Mark for review</button>}</>}{editable&&<><button className="outline-button" disabled={busy} onClick={()=>void save('save')}>Save progress</button><button className="primary-button" disabled={busy||answers.length!==questions.filter(item=>item.ai?.status!=='SKIPPED').length} onClick={()=>void save('complete')}>Complete review</button></>}</div>
    {!review&&record.reviewState==='REVIEWED'&&<p className="field-note">This evaluation has a legacy review marker, without saved human answers. Complete a human review to include it in Calibration.</p>}
    {!session&&<p className="field-note">Connect to Genesys Cloud to review a durable server evaluation. Browser-only history must already exist on the server.</p>}
    {error&&<p className="inline-error" role="alert">{error} <button className="outline-button" disabled={busy||!session} onClick={async()=>{if(!session)return;setBusy(true);try{const reply=await fetch(`${apiOrigin}/api/reviews/${encodeURIComponent(record.id)}`,{headers:{Authorization:`Bearer ${session.accessToken}`}});if(!reply.ok)throw Error('Could not refresh review.');onSaved(await reply.json() as HumanReview)}catch(reason){setError(reason instanceof Error?reason.message:'Refresh failed.')}finally{setBusy(false)}}}>Refresh review</button></p>}
    {notice&&<p role="status">{notice}</p>}
    <div className="analytics-tabs" role="group" aria-label="Comparison filter">{['all','agreements','disagreements'].map(value=><button key={value} className={filter===value?'active':''} onClick={()=>setFilter(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div>
    {!visible.length&&<p>No {filter==='all'?'questions':filter} in the current answers.</p>}
    {visible.map(({q,ai,answer,human,comparison})=><article className={`review-question ${comparison&&!comparison.exact?'disagreement':''}`} key={q.id}>
      <div className="review-question-heading"><div><span className="mini-label">{record.form.groups?.find(g=>g.id===q.groupId)?.name??q.section??'Evaluation'} · {q.type==='noul'?'YES / NO':q.type.toUpperCase()}</span><h3>{q.title}</h3></div><span className={`pill ${comparison&&!comparison.exact?'review-difference':''}`}>{ai?.status==='SKIPPED'?'Not applicable / Skipped':!comparison?'Unanswered':comparison.exact?'Agreement':comparison.band==='different'?'Disagreement':`${comparison.band==='one-band'?'One-band':'Larger-band'} difference`}</span></div>
      <p className="review-instructions">{q.instructions}</p><div className="review-answer-grid"><div className="review-ai"><span className="mini-label">AI RESULT</span><strong>{ai?.outcome??'Unavailable'}</strong><p>Credit {reviewPercent(ai?.credit)} · {q.type==='noul'?'Yes probability':'Confidence'} {reviewPercent(q.type==='noul'?ai?.probability:ai?.confidence??ai?.probability)}</p>{q.type==='noul'&&ai&&<small>Selected-answer confidence {reviewPercent(selectedConfidence(ai))}</small>}{comparison?.valueDistance!=null&&<small>Exact value distance: {comparison.valueDistance.toFixed(2)} bands</small>}</div>
      <div className="review-human"><label>{editable?'Human answer':'HUMAN REVIEW'}{editable&&ai?.status!=='SKIPPED'?<select aria-label={`Human answer: ${q.title}`} value={answer?.value??''} disabled={busy} onChange={event=>update(q.id,{value:event.target.value===''?'':q.type==='score'?Number(event.target.value):event.target.value})}><option value="">Select an answer</option>{q.type==='noul'?['Yes','No'].map(value=><option key={value}>{value}</option>):q.options.map((option,index)=><option key={option.key} value={q.type==='score'?index:option.key}>{option.label}</option>)}</select>:<strong>{ai?.status==='SKIPPED'?'Not applicable / Skipped':human?.outcome??'Not answered'}</strong>}</label><p>Human credit {reviewPercent(human?.credit)}</p>{editable&&ai?.status!=='SKIPPED'?<label>Question note<textarea aria-label={`Question note: ${q.title}`} maxLength={2000} rows={2} value={answer?.note??''} disabled={busy||!answer} onChange={event=>update(q.id,{note:event.target.value})}/></label>:answer?.note&&<p className="review-note">{answer.note}</p>}</div></div>
    </article>)}
    {editable?<label className="review-overall-note">Overall review note<textarea maxLength={4000} rows={3} value={notes} disabled={busy} onChange={event=>setNotes(event.target.value)}/></label>:notes&&<div className="review-overall-note"><h3>Reviewer note</h3><p>{notes}</p></div>}
    {review&&<details className="review-audit"><summary>Review history ({review.events.length} events)</summary>{review.events.map((event,index)=><p key={index}>{event.kind.replaceAll('_',' ')} · {event.actor.displayName??event.actor.userId} · {new Date(event.at).toLocaleString()} · revision {event.revision}</p>)}</details>}
  </section>
}
