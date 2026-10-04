import { EvaluationProvenance } from './EvaluationProvenance'
import { humanReviewStatus, evaluationSourceLabel, reviewerName, queueName } from './userLanguage'
import { type ReviewDraftController, type EvidenceReturnContext } from './useReviewDrafts'
import { useDetailFocus } from './useDetailFocus'
import { localDueToIso, useReviewSla, ReviewDueBadge, useReviewers, ReviewerPicker, ReviewWorkloadPanel } from './ReviewOperations'
import { reviewDueAt, reviewQueuePriority } from './domain/reviewSla'
import { usePermission } from './GovernancePanel'
import { GroupResultsPanel } from './GroupResultsPanel'
import { useEffect, useRef, useState } from 'react'
import type { AuthSession } from './domain/genesysAuth'
import type { EvaluationRecord } from './domain/types'
import { ReviewPanel, reviewPercent } from './ReviewPanel'
import { evaluationFilterKeys, evaluationExploreUrl } from './domain/navigation'
import { reviewStatus, matchesEvaluationFilters, type HumanReview, type ReviewEvaluation } from './domain/reviews'
import { evaluationScopeLabel, evaluationScopeLabelsKey, evaluationQueryParams, evaluationRequestUrl, evaluationFailureCopy, evaluationEmptyCopy, type EvaluationRequestKind, type EvaluationFailure } from './evaluationAvailability'
import { OperationalTable, type Column } from './OperationalTable'
const origin=(import.meta.env.VITE_AQM_API_ORIGIN??'').trim().replace(/\/$/,'')
const percent=(value:number|null)=>value===null?'—':`${Math.round(value*100)}%`
export function EvaluationsPage({local,session,onConversation,onAnalytics,onCalibration,drafts,evidenceReturn,onReturned}:{drafts:ReviewDraftController;evidenceReturn:EvidenceReturnContext|null;onReturned:()=>void;local:EvaluationRecord[];session:AuthSession|null;onConversation:(id:string,context:EvidenceReturnContext)=>void;onAnalytics:()=>void;onCalibration:()=>void}){
  const canReview=usePermission('reviews.write'),canAssign=usePermission('reviews.assign')
  const directory=useReviewers(session),sla=useReviewSla(session)
  const params=new URLSearchParams(location.search)
  const [source,setSource]=useState<'server'|'browser'>(params.get('evaluationSource')==='browser'?'browser':'server')
  const requestId=useRef(0)
  type ListRequest={url:string;scope:string;context:string;cursor?:string;kind:EvaluationRequestKind}
  type LoadedPage={records:ReviewEvaluation[];cursor?:string;next?:string;scanLimited:boolean;request:ListRequest;loadedAt:number}
  const [page,setPage]=useState<LoadedPage|null>(null)
  const [pending,setPending]=useState<ListRequest|null>(null)
  const [listError,setListError]=useState<{request:ListRequest;failure:EvaluationFailure}|null>(null)
  const [detailError,setDetailError]=useState<EvaluationFailure|null>(null),[detailLoading,setDetailLoading]=useState(false),[detailRetry,setDetailRetry]=useState(0)
  const [operationError,setOperationError]=useState<{kind:'sample'|'bulk';message:string;technical:string}|null>(null)
  const [selected,setSelected]=useState<string|null>(params.get('evaluationId'))
  const records=page?.records??[],cursor=page?.cursor,next=page?.next,scanLimited=page?.scanLimited??false
  const retryFocus=useRef(false)
  const [form,setForm]=useState(params.get('form')??''),[agent,setAgent]=useState(params.get('agent')??''),[queue,setQueue]=useState(params.get('queue')??''),[channel,setChannel]=useState(params.get('channel')??''),[outcome,setOutcome]=useState(params.get('outcome')??''),[from,setFrom]=useState(params.get('from')??''),[to,setTo]=useState(params.get('to')??''),[policy,setPolicy]=useState(params.get('policy')??''),[recordSource,setRecordSource]=useState(params.get('source')??''),[mode,setMode]=useState(params.get('mode')??''),[critical,setCritical]=useState(params.get('critical')??''),[question,setQuestion]=useState(params.get('question')??'')
  const [status,setStatus]=useState(params.get('reviewStatus')??''),[sampleCount,setSampleCount]=useState(5),[sampleStrategy,setSampleStrategy]=useState('recent'),[sampleSeed,setSampleSeed]=useState('calibration-v07'),[sampling,setSampling]=useState(false),[sampleNotice,setSampleNotice]=useState('')
  const [assignment,setAssignment]=useState(params.get('assignment')??''),[dueFilter,setDueFilter]=useState(params.get('due')??''),[dueState,setDueState]=useState(params.get('dueState')??''),[reviewQueue,setReviewQueue]=useState(params.get('reviewQueue')??''),[workloadRefresh,setWorkloadRefresh]=useState(0)
  const modeChosen=useRef(false)
  const explicitScope=useRef(evaluationFilterKeys.some(key=>params.has(key))||params.has('origin'))
  const [moreFilters,setMoreFilters]=useState(false)
  const myQueue=reviewQueue==='mine',taskQueue=myQueue||canReview&&assignment==='unassigned'&&status==='REVIEW_REQUESTED',setMyQueue=(value:boolean)=>setReviewQueue(value?'mine':'')
  useEffect(()=>{if(canReview&&!canAssign&&!explicitScope.current&&!modeChosen.current){setReviewQueue('mine');setAssignment('mine');const url=new URL(location.href);url.searchParams.set('reviewQueue','mine');url.searchParams.set('assignment','mine');history.replaceState(null,'',url)}},[canReview,canAssign])
  const [scopeRevision,setScopeRevision]=useState(0)
  const [selection,setSelection]=useState<Record<string,number>>({}),[bulkAssignee,setBulkAssignee]=useState(''),[bulkDue,setBulkDue]=useState(''),[bulkBusy,setBulkBusy]=useState(false),[bulkNotice,setBulkNotice]=useState('')
  const [sampleAssignee,setSampleAssignee]=useState(''),[sampleDue,setSampleDue]=useState('')
  const [detail,setDetail]=useState<ReviewEvaluation|null>(null),[localReviews,setLocalReviews]=useState<Record<string,HumanReview>>({})
  const updateUrl=(values:Record<string,string>)=>{const url=new URL(location.href);for(const [key,value] of Object.entries(values))value?url.searchParams.set(key,value):url.searchParams.delete(key);history.replaceState(null,'',url)}
  const query={form,agent,queue,channel,cohort:params.get('cohort')??'',outcome,question,policy,source:recordSource,mode,critical,reviewStatus:status,assignment,due:dueFilter,dueState,reviewQueue,reviewQuestion:params.get('reviewQuestion')??'',comparison:params.get('comparison')??'',from,to}
  const scope=evaluationQueryParams(query).toString()
  // Context also guards session/source changes; it is never sent or persisted.
  const context=JSON.stringify([scope,source,session?.accessToken??''])
  const currentContext=useRef(context);currentContext.current=context
  const currentPage=source==='server'&&!!session&&!!origin&&page?.request.context===context
  const loading=pending?.context===context
  const currentError=listError?.request.context===context?listError:null
  const execute=async(request:ListRequest,focusAfter=false)=>{
    if(!origin||!session||source!=='server')return
    const id=++requestId.current
    retryFocus.current=focusAfter;setPending(request);setListError(null)
    try{
      const response=await fetch(request.url,{headers:{Authorization:`Bearer ${session.accessToken}`}})
      const body=await response.json().catch(()=>{throw {technical:`HTTP ${response.status}: response could not be read.`,status:response.status}}) as {items?:ReviewEvaluation[];nextCursor?:string;scanLimited?:boolean;error?:string}
      if(!response.ok)throw {technical:body.error??`HTTP ${response.status}`,status:response.status}
      if(!Array.isArray(body.items))throw {technical:'Evaluation response did not contain an items list.'}
      if(id===requestId.current&&request.context===currentContext.current){
        setPage({records:body.items??[],cursor:request.cursor,next:body.nextCursor,scanLimited:!!body.scanLimited,request,loadedAt:Date.now()})
        setSelection({})
      }
    }catch(reason){
      if(id===requestId.current&&request.context===currentContext.current)setListError({request,failure:reason&&typeof reason==='object'&&'technical' in reason?reason as EvaluationFailure:{technical:reason instanceof Error?reason.message:'Could not load evaluations.'}})
    }finally{if(id===requestId.current&&request.context===currentContext.current)setPending(null)}
  }
  const load=(nextCursor?:string,kind:EvaluationRequestKind='scope')=>execute({url:evaluationRequestUrl(origin,query,nextCursor),scope,context,cursor:nextCursor,kind})
  const retryList=()=>{if(currentError)void execute(currentError.request,true)}
  useEffect(()=>{if(!pending&&currentPage&&retryFocus.current&&!currentError){retryFocus.current=false;focus.fallbackRef.current?.focus()}},[pending,page,currentPage,currentError])
  const initialCursor=useRef(evidenceReturn?.cursor),initialScope=useRef(scope)
  useEffect(()=>{
    requestId.current++;setPending(null);setListError(null);setSelection({})
    if(source!=='server'||!session||!origin)return
    const nextCursor=initialScope.current===scope?initialCursor.current:undefined
    const timer=setTimeout(()=>{initialCursor.current=undefined;void load(nextCursor)},250)
    return ()=>{clearTimeout(timer);requestId.current++}
  },[context,scopeRevision])
  useEffect(()=>()=>{requestId.current++},[])
  const filterQuery=evaluationQueryParams(query)
  const filtered=source==='server'?(currentPage?records:[]):local.map(item=>({...item,humanReview:localReviews[item.id]})).filter(item=>matchesEvaluationFilters(item,filterQuery,session?.userId,sla.now,sla.settings))
  const setters:Record<string,(value:string)=>void>={form:setForm,agent:setAgent,queue:setQueue,channel:setChannel,outcome:setOutcome,question:setQuestion,policy:setPolicy,source:setRecordSource,mode:setMode,critical:setCritical,reviewStatus:setStatus,assignment:setAssignment,due:setDueFilter,dueState:setDueState,reviewQueue:setReviewQueue,from:setFrom,to:setTo}
  const removeScope=(key?:string)=>{
    const keys=key?[key]:evaluationFilterKeys.filter(k=>k!=='evaluationSource')
    updateUrl({...Object.fromEntries(keys.map(k=>[k,''])),...(!key?{[evaluationScopeLabelsKey]:''}:{})})
    for(const k of keys)setters[k]?.('')
    if(keys.includes('evaluationId')){setSelected(null);setDetail(null)}
    setSelection({});setScopeRevision(value=>value+1)
  }
  const scopeLabel=(key:string,value:string)=>{
    if(key==='reviewStatus')return `Human review: ${humanReviewStatus(value as Parameters<typeof humanReviewStatus>[0])}`
    if(key==='reviewQueue')return value==='active'?'Active reviews':'My active reviews'
    if(key==='cohort')return 'Analytics cohort'
    const humanLabel=evaluationScopeLabel(params,key,value)
    if(key==='form'){const item=[...records,...local].find(r=>`${r.form.id}@${r.form.version}`===value);return `Form: ${item?`${item.form.name} v${item.form.version}`:humanLabel??'Exact form reference'}`}
    if(key==='policy')return `Policy: ${records.flatMap(r=>r.policyMatches).find(p=>p.policyId===value)?.policyName??humanLabel??'Exact policy reference'}`
    if(key==='question'||key==='reviewQuestion'){const item=[...records,...local].flatMap(r=>r.questions).find(q=>q.id===value);return `${key==='reviewQuestion'?'Reviewed question':'Question'}: ${item?.title??humanLabel??'Exact question reference'}`}
    const labels:Record<string,string>={source:'Source',mode:'Trigger',reviewStatus:'Review status',reviewQuestion:'Reviewed question',dueState:'SLA state',from:'From',to:'To'}
    const values:Record<string,string>={'genesys-cloud':'Genesys Cloud',scheduled:'Scheduled',manual:'Manual',unassigned:'Unassigned',mine:'Assigned to me',assigned:'Assigned',DUE_SOON:'Due soon',OVERDUE:'Overdue',ESCALATED:'Escalated'}
    return `${labels[key]??key[0].toUpperCase()+key.slice(1)}: ${values[value]??value}`
  }
  const scopeKeys=evaluationFilterKeys.filter(key=>!['evaluationId','evaluationSource','evaluations.q',...(myQueue?['reviewQueue','assignment']:[])].includes(key)&&params.get(key))
  const workloadExplore=(filters:Record<string,string>)=>{
    modeChosen.current=true
    const url=evaluationExploreUrl(new URL(location.href),filters)
    history.replaceState(null,'',url)
    for(const [key,setter] of Object.entries(setters))setter(filters[key]??'')
    setReviewFocusId(null);setSelected(null);setDetail(null);setSelection({});setScopeRevision(value=>value+1)
  }
  useEffect(()=>{
    setDetailError(null)
    if(!selected||!session||source!=='server'){setDetail(null);setDetailLoading(false);return}
    let cancelled=false;setDetailLoading(true);setDetail(null)
    void fetch(`${origin}/api/evaluations/${encodeURIComponent(selected)}`,{headers:{Authorization:`Bearer ${session.accessToken}`}}).then(async reply=>{
      const body=await reply.json().catch(()=>{throw {technical:`HTTP ${reply.status}: response could not be read.`,status:reply.status}})
      if(!reply.ok)throw {technical:body.error??`HTTP ${reply.status}`,status:reply.status}
      if(body.id!==selected)throw {technical:'Evaluation detail response did not match the selected evaluation.'}
      return body as ReviewEvaluation
    }).then(item=>{if(!cancelled)setDetail(item)}).catch(reason=>{if(!cancelled)setDetailError(reason&&typeof reason==='object'&&'technical' in reason?reason:{technical:reason instanceof Error?reason.message:'Evaluation detail unavailable.'})}).finally(()=>{if(!cancelled)setDetailLoading(false)})
    return()=>{cancelled=true}
  },[selected,session?.accessToken,source,detailRetry])
  // Complete list snapshots are useful for discovery; detail GET confirms current review authority.
  const active=source==='server'?(detail?.id===selected&&!detailLoading&&!detailError?detail:null):local.map(item=>({...item,humanReview:localReviews[item.id]})).find(item=>item.id===selected)??null
  const focus=useDetailFocus(active?.id??(selected?`${selected}-pending`:null))
  const [reviewFocusId,setReviewFocusId]=useState<string|null>(evidenceReturn?.returnFocus==='review'?evidenceReturn.evaluationId:null)
  const focused=!!active&&reviewFocusId===active.id
  const queuePosition=useRef(0)
  const openEvaluation=(item:ReviewEvaluation,review=false)=>{queuePosition.current=window.scrollY;focus.capture();setReviewFocusId(review?item.id:null);setDetail(null);setDetailError(null);setDetailLoading(source==='server');setSelected(item.id);setDetailRetry(n=>n+1);updateUrl({evaluationId:item.id});if(review)setReviewTarget(null)}
  const [reviewTarget,setReviewTarget]=useState<string|null>(evidenceReturn?.returnFocus==='review'?evidenceReturn.evaluationId:null)
  useEffect(()=>{if(evidenceReturn&&active?.id===evidenceReturn.evaluationId)onReturned()},[active?.id,evidenceReturn,onReturned])
  useEffect(()=>{if(reviewTarget&&active?.id===reviewTarget){const heading=document.querySelector<HTMLHeadingElement>('[aria-label="Human review"] h2');if(heading){heading.tabIndex=-1;heading.scrollIntoView({block:'nearest'});heading.focus({preventScroll:true});setReviewTarget(null)}}},[reviewTarget,active?.id])
  const closeDetail=()=>{setReviewFocusId(null);setSelected(null);setDetail(null);setReviewTarget(null);setDetailError(null);setDetailLoading(false);updateUrl({evaluationId:''});requestAnimationFrame(()=>{focus.restore();if(!document.activeElement?.closest('.evaluation-queue'))focus.fallbackRef.current?.focus();window.scrollTo({top:queuePosition.current})})}
  const saved=(review:HumanReview)=>{
    // Invalidate an older list request before applying the authoritative response.
    requestId.current++
    setWorkloadRefresh(n=>n+1)
    setDetail(item=>item?.id===review.evaluationId?{...item,humanReview:review}:active?.id===review.evaluationId?{...active,humanReview:review}:item)
    setPage(current=>current&&current.request.context===context?{...current,records:current.records.flatMap(item=>{
      if(item.id!==review.evaluationId)return [item]
      const updated={...item,humanReview:review}
      return matchesEvaluationFilters(updated,filterQuery,session?.userId,sla.now,sla.settings)?[updated]:[]
    })}:current)
    setLocalReviews(items=>({...items,[review.evaluationId]:review}))
    setSelection(items=>{const next={...items};delete next[review.evaluationId];return next})
    // Keep detail/confirmation mounted, and reconcile the same server page.
    if(source==='server')void load(cursor,'refresh')
  }
  const sample=async()=>{if(!session)return;setSampling(true);setOperationError(null);setSampleNotice('');try{const reply=await fetch(`${origin}/api/calibration/sample`,{method:'POST',headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({count:sampleCount,...(canAssign&&sampleAssignee?{assigneeId:sampleAssignee,dueAt:localDueToIso(sampleDue)}:{}),strategy:sampleStrategy,seed:sampleSeed,filters:{source:recordSource||'genesys-cloud',form,agent,queue,from:from?`${from}T00:00:00.000Z`:'',to:to?`${to}T23:59:59.999Z`:''}})});const body=await reply.json() as {selected:number;error?:string};if(!reply.ok)throw Error(body.error??'Sample request failed.');setSampleNotice(`${body.selected} existing evaluations marked for review. No new AI evaluations requested.`);setWorkloadRefresh(n=>n+1);await load(undefined,cursor?'first':'refresh')}catch(reason){setOperationError({kind:'sample',message:'Calibration sample could not be requested.',technical:reason instanceof Error?reason.message:'Sample failed.'})}finally{setSampling(false)}}
  const bulkAssign=async()=>{
    if(!session)return;setBulkBusy(true);setOperationError(null);setBulkNotice('')
    try{const reply=await fetch(`${origin}/api/reviews/bulk-assign`,{method:'POST',headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({items:Object.entries(selection).map(([evaluationId,expectedRevision])=>({evaluationId,expectedRevision})),assigneeId:bulkAssignee,dueAt:localDueToIso(bulkDue)})});const body=await reply.json();if(!reply.ok)throw Error(body.error??'Bulk assignment failed.');setSelection({});setBulkNotice(`Assigned ${body.count} reviews.`);setWorkloadRefresh(n=>n+1);setDetail(null);setSelected(null);await load(undefined,cursor?'first':'refresh')}catch(e){setOperationError({kind:'bulk',message:'Reviews could not be assigned.',technical:e instanceof Error?e.message:'Bulk assignment failed.'})}finally{setBulkBusy(false)}
  }
  const selectionCount=Object.keys(selection).length
  const myFilter=()=>{setSource('server');workloadExplore({reviewQueue:'mine',assignment:'mine',evaluationSource:'server'})}
  const unassignedFilter=()=>workloadExplore({assignment:'unassigned',reviewStatus:'REVIEW_REQUESTED'})
  const bulkDueDate=async(clear=false)=>{
    if(!session)return;setBulkBusy(true);setOperationError(null);setBulkNotice('')
    try{const dueAt=clear?null:localDueToIso(bulkDue);if(dueAt===undefined)throw Error('Enter a due date or choose Clear due date.');const response=await fetch(`${origin}/api/reviews/bulk-due`,{method:'POST',headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({items:Object.entries(selection).map(([evaluationId,expectedRevision])=>({evaluationId,expectedRevision})),dueAt})});const body=await response.json();if(!response.ok)throw Error(body.error??'Due date update failed.');setSelection({});setBulkNotice(`${clear?'Cleared':'Set'} due date for ${body.count} reviews.`);setWorkloadRefresh(n=>n+1);setDetail(null);setSelected(null);await load(undefined,cursor?'first':'refresh')}catch(e){setOperationError({kind:'bulk',message:'Review due dates could not be updated.',technical:e instanceof Error?e.message:'Due date update failed.'})}finally{setBulkBusy(false)}
  }
  const assignmentEligible=Object.keys(selection).every(id=>{const record=records.find(r=>r.id===id);return !!record&&['NOT_REVIEWED','REVIEW_REQUESTED'].includes(reviewStatus(record,record.humanReview))})
  const dueEligible=Object.keys(selection).every(id=>['REVIEW_REQUESTED','IN_REVIEW'].includes(records.find(r=>r.id===id)?.humanReview?.status??''))
  const ranked=new Map([...filtered].sort((a,b)=>reviewQueuePriority(a,sla.now,sla.settings).localeCompare(reviewQueuePriority(b,sla.now,sla.settings))).map((r,i)=>[r.id,filtered.length-i]))
  const baseColumns:Column<ReviewEvaluation>[]=[...(source==='server'&&myQueue?[{key:'priority',label:'Queue priority',value:(item:ReviewEvaluation)=>ranked.get(item.id)??0,render:(item:ReviewEvaluation)=><ReviewDueBadge review={item.humanReview} now={sla.now} settings={sla.settings}/>}]:[]),...(source==='server'&&canAssign?[{key:'selection',label:'Select',value:()=>'',render:(item:ReviewEvaluation)=>{const eligible=['NOT_REVIEWED','REVIEW_REQUESTED','IN_REVIEW'].includes(reviewStatus(item,item.humanReview));return <input type="checkbox" aria-label={`Select evaluation: ${item.agent.name} · ${item.channel} · ${item.form.name} v${item.form.version} · ${new Date(item.evaluatedAt).toLocaleString()}`} checked={selection[item.id]!==undefined} disabled={!eligible||bulkBusy||selectionCount>=20&&selection[item.id]===undefined} onClick={e=>e.stopPropagation()} onChange={e=>setSelection(old=>{const next={...old};if(e.target.checked)next[item.id]=item.humanReview?.revision??0;else delete next[item.id];return next})}/>}}]:[]),{key:'time',label:'Evaluated',value:item=>item.evaluatedAt,render:item=>new Date(item.evaluatedAt).toLocaleString()},{key:'conversation',label:'Evaluation',value:item=>`${item.id} ${item.conversationId} ${item.agent.name} ${item.channel} ${item.form.name}`,width:'180px',render:item=><button className="text-link" data-evaluation-id={item.id} aria-label={`Open evaluation for ${item.agent.name} · ${item.channel} · ${item.form.name} v${item.form.version} · ${item.queue}`} onClick={()=>openEvaluation(item)}>{item.agent.name} · {item.channel}</button>},{key:'agent',label:'Agent',value:item=>item.agent.name},{key:'queue',label:'Queue',value:item=>queueName(item.queue)},{key:'form',label:'Form',value:item=>`${item.form.name} v${item.form.version}`,width:'180px'},{key:'source',label:'Source',value:item=>evaluationSourceLabel(item.conversationSource)},{key:'score',label:'AI score',value:item=>item.overallScore??-1,render:item=>percent(item.overallScore)},{key:'review',label:'Human review',value:item=>humanReviewStatus(reviewStatus(item,item.humanReview))},{key:'human',label:'Human score',value:item=>item.humanReview?.humanOverallScore??-1,render:item=>item.humanReview?.status==='REVIEWED'?reviewPercent(item.humanReview.humanOverallScore):'—'},{key:'agreement',label:'Agreement',value:item=>item.humanReview?`${item.humanReview.comparison.agreements}/${item.humanReview.comparison.total}`:'—'},{key:'assignee',label:'Assigned to',value:item=>reviewerName(item.humanReview?.assignment?.assignee)},{key:'due',label:'Due',value:item=>reviewDueAt(item.humanReview)??'',render:item=><>{reviewDueAt(item.humanReview)&&<span>{new Date(reviewDueAt(item.humanReview)!).toLocaleString()}</span>}<ReviewDueBadge review={item.humanReview} now={sla.now} settings={sla.settings}/></>},{key:'reviewer',label:'Reviewer',value:item=>reviewerName(item.humanReview?.reviewer,'—')},{key:'reviewed',label:'Reviewed at',value:item=>item.humanReview?.completedAt??'—',render:item=>item.humanReview?.completedAt?new Date(item.humanReview.completedAt).toLocaleString():'—'}]
  const reviewAction=(item:ReviewEvaluation)=>{
    if(!canReview)return null
    const status=reviewStatus(item,item.humanReview),assigned=item.humanReview?.assignment?.assignee.userId
    if(status==='REVIEW_REQUESTED'&&(!assigned||assigned===session?.userId))return assigned?'Start review':'Claim and start review'
    if(status==='IN_REVIEW'&&(assigned===session?.userId||!assigned&&item.humanReview?.reviewer?.userId===session?.userId))return 'Continue review'
    return null
  }
  const statusText=(item:ReviewEvaluation)=>humanReviewStatus(reviewStatus(item,item.humanReview),true)
  const reviewColumns=baseColumns.filter(c=>['priority','conversation','form','agent','queue','score','review','due'].includes(c.key)).map(c=>c.key==='conversation'?{...c,label:'Evaluation',render:(item:ReviewEvaluation)=><button className="text-link" data-evaluation-id={item.id} aria-label={`Open evaluation for ${item.agent.name} · ${item.channel} · ${item.form.name} v${item.form.version} · ${item.queue}`} onClick={()=>openEvaluation(item)}>{item.agent.name} · {item.channel}</button>}:c.key==='review'?{...c,render:statusText}:c)
  reviewColumns.splice(1,0,{key:'action',label:'Review action',value:item=>reviewStatus(item,item.humanReview),render:item=>reviewAction(item)?<button className="primary-button" onClick={()=>openEvaluation(item,true)}>{reviewAction(item)}</button>:null})
  const reviewCard=(item:ReviewEvaluation)=><article className="review-task-card" aria-label={`${item.form.name} v${item.form.version} · ${item.agent.name} · ${item.queue}`}><ReviewDueBadge review={item.humanReview} now={sla.now} settings={sla.settings}/><h2>{item.form.name} <small>v{item.form.version}</small></h2><p>{item.agent.name} · {item.queue}</p><p className="field-note">{item.channel} · {statusText(item)} · AI {percent(item.overallScore)}{item.passed===null?'':item.passed?' · Pass':' · Fail'}</p>{reviewAction(item)?<button className="primary-button" onClick={()=>openEvaluation(item,true)}>{reviewAction(item)}</button>:<button className="outline-button" onClick={()=>openEvaluation(item)}>View evaluation</button>}</article>

  const columns=taskQueue?reviewColumns:[...baseColumns.filter(c=>c.key==='time'),...baseColumns.filter(c=>c.key!=='time')]
  const technical=(text:string)=><details className="availability-technical"><summary>Technical details</summary><pre>{text}</pre></details>
  const operationFailure=(kind:'sample'|'bulk')=>operationError?.kind===kind?<div role="alert"><p>{operationError.message}</p>{technical(operationError.technical)}</div>:null
  const loadedTime=page?new Date(page.loadedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}):''
  const showResults=source==='browser'||currentPage
  return <div className="page-content">{params.get('origin')==='calibration'&&<button className="outline-button" onClick={onCalibration}>Back to Calibration</button>}<div hidden={focused} className={`evaluation-queue ${myQueue?'personal-review-queue':''}`}><div className="page-heading"><div><div className="eyebrow">QUALITY</div><h1 ref={focus.fallbackRef} tabIndex={-1}>Evaluations</h1><p>{myQueue?'Choose a review, inspect the evidence and record your judgment.':'Find saved evaluations, inspect the AI result and follow human review progress.'}</p></div></div>{canReview&&<div className="heading-actions evaluation-modes" role="group" aria-label="Evaluation mode"><button className={myQueue?'primary-button':'outline-button'} aria-pressed={myQueue} onClick={myFilter}>My reviews</button><button className={!myQueue?'primary-button':'outline-button'} aria-pressed={!myQueue} onClick={()=>{if(!myQueue)return;modeChosen.current=true;setMyQueue(false);if(assignment==='mine')setAssignment('');updateUrl({reviewQueue:'',...(assignment==='mine'?{assignment:''}:{})});setSelection({})}}>All evaluations</button>{myQueue&&<button className="outline-button more-filters" aria-expanded={moreFilters} onClick={()=>setMoreFilters(v=>!v)}>{moreFilters?'Fewer filters':'More filters'}</button>}</div>}{params.get('origin')==='analytics'&&<button className="outline-button" onClick={onAnalytics}>Back to Analytics</button>}{scopeKeys.length>0&&<section className="panel investigation-scope" aria-label="Investigation scope"><strong>Investigating:</strong><div className="heading-actions">{scopeKeys.map(key=><button className="outline-button" key={key} onClick={()=>removeScope(key)}><span className="investigation-remove-label">Remove </span>{scopeLabel(key,params.get(key)!)}<span aria-hidden="true"> ×</span></button>)}<button className="text-link" onClick={()=>removeScope()}>Clear investigation filters</button></div></section>}{source==='server'&&(!session||!origin)&&<p role="status" className="panel">Connect to Genesys Cloud in Settings to view saved evaluations.</p>}{sla.error&&<p role="status">{sla.error}</p>}
      {source==='server'&&session&&origin&&!currentPage&&!currentError&&<p role="status">{page?'Updating evaluations…':'Loading evaluations…'}</p>}
      {loading&&currentPage&&<p role="status">{pending?.kind==='refresh'?'Refreshing evaluations…':'Loading requested page…'}</p>}
      {currentError&&<section className="panel evaluation-availability" role={currentPage?'status':'alert'} aria-label="Evaluation availability">
        <h2>{evaluationFailureCopy(currentError.failure,currentError.request.kind,myQueue,!!scope)}</h2>
        {currentPage&&<p>{currentError.request.kind==='next'||currentError.request.kind==='first'?'Current page is unchanged.':`Showing results loaded at ${loadedTime}.`}</p>}
        {!currentPage&&<p>Your filters are unchanged.</p>}
        <button className="primary-button" onClick={retryList}>{currentError.request.kind==='refresh'?'Retry refresh':currentError.request.kind==='next'?'Retry next page':currentError.request.kind==='first'?'Retry first page':'Retry'}</button>
        {(currentError.failure.status===401||currentError.failure.status===403)&&<a className="text-link" href="?page=settings">Settings / reconnect</a>}
        {technical(currentError.failure.technical)}
      </section>}
      {currentPage&&scanLimited&&<p className="field-note">Scan limit reached; continue to the next page for more matches.</p>}
      {currentPage&&<p className="field-note">{myQueue?'Reviews needing attention appear first.':'Search checks up to 500 evaluations at a time. Use Next to continue.'}</p>}
{source==='server'&&(myQueue?<ReviewWorkloadPanel personal session={session} refresh={workloadRefresh} onMine={myFilter} onUnassigned={unassignedFilter}/>:<details className="panel"><summary>Team review workload</summary><ReviewWorkloadPanel session={session} refresh={workloadRefresh} onMine={myFilter} onUnassigned={unassignedFilter}/></details>)}<div hidden={myQueue&&!moreFilters} className={`panel browser-filters ${myQueue&&!moreFilters?'personal-filters':''}`}><label>History<select value={source} onChange={event=>{const value=event.target.value as typeof source;setSource(value);if(value==='browser'&&myQueue){modeChosen.current=true;setReviewQueue('');setAssignment('');updateUrl({evaluationSource:value,reviewQueue:'',assignment:''})}else updateUrl({evaluationSource:value})}}><option value="server">Saved in AQM</option><option value="browser">Saved in this browser</option></select></label><label className="personal-filter">Review status<select value={status} onChange={event=>{setStatus(event.target.value);updateUrl({reviewStatus:event.target.value})}}><option value="">All</option>{['NOT_REVIEWED','REVIEW_REQUESTED','IN_REVIEW','REVIEWED'].map(value=><option key={value} value={value}>{humanReviewStatus(value as Parameters<typeof humanReviewStatus>[0])}</option>)}</select></label>{source==='server'&&<><label>Assignment<select aria-label="Assignment" value={assignment} onChange={e=>{setAssignment(e.target.value);setMyQueue(false);updateUrl({assignment:e.target.value,reviewQueue:''})}}><option value="">All</option><option value="unassigned">Unassigned</option><option value="assigned">Assigned</option><option value="mine">Assigned to me</option>{directory.items.map(r=><option key={r.userId} value={r.userId}>{r.displayName??r.userId}</option>)}</select></label>{directory.next&&<button className="text-link" onClick={()=>void directory.more()}>Load more reviewers</button>}<label className="personal-filter">SLA state<select aria-label="SLA state" value={dueState} onChange={e=>{setDueState(e.target.value);updateUrl({dueState:e.target.value})}}><option value="">All states</option><option value="DUE_SOON">Due soon</option><option value="OVERDUE">Overdue</option><option value="ESCALATED">Escalated</option></select></label><label className="personal-filter">Due<select aria-label="Due" value={dueFilter} onChange={e=>{setDueFilter(e.target.value);updateUrl({due:e.target.value})}}><option value="">All</option><option value="overdue">Overdue</option><option value="today">Due today</option><option value="week">Due next 7 days</option><option value="none">No due date</option></select></label></>}<label>Agent<input value={agent} onChange={event=>{setAgent(event.target.value);updateUrl({agent:event.target.value})}}/></label><label>Queue<input value={queue} onChange={event=>{setQueue(event.target.value);updateUrl({queue:event.target.value})}}/></label><label>Channel<input value={channel} onChange={event=>{setChannel(event.target.value);updateUrl({channel:event.target.value})}}/></label><label>Result<select value={outcome} onChange={event=>{setOutcome(event.target.value);updateUrl({outcome:event.target.value})}}><option value="">All</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label><label>From<input type="date" value={from} onChange={event=>{setFrom(event.target.value);updateUrl({from:event.target.value})}}/></label><label>To<input type="date" value={to} onChange={event=>{setTo(event.target.value);updateUrl({to:event.target.value})}}/></label><label>Source<select value={recordSource} onChange={event=>{setRecordSource(event.target.value);updateUrl({source:event.target.value})}}><option value="">All</option><option value="genesys-cloud">Genesys Cloud</option><option value="synthetic">Synthetic</option><option value="uploaded">Uploaded</option></select></label><label>Trigger<select value={mode} onChange={event=>{setMode(event.target.value);updateUrl({mode:event.target.value})}}><option value="">All</option><option value="manual">Manual</option><option value="scheduled">Scheduled</option></select></label><label>Critical failure<select value={critical} onChange={event=>{setCritical(event.target.value);updateUrl({critical:event.target.value})}}><option value="">All</option><option value="yes">Yes</option><option value="no">No</option></select></label>{currentPage&&<button className="outline-button" onClick={()=>void load(cursor,'refresh')} disabled={loading||!session||!origin}>Refresh</button>}<details className="advanced-details exact-reference-filters"><summary>Advanced filters</summary><p>For troubleshooting or exact historical links.</p><div className="browser-filters"><label>Exact form reference<input value={form} onChange={event=>{setForm(event.target.value);updateUrl({form:event.target.value})}}/></label><label>Exact question reference<input value={question} onChange={event=>{setQuestion(event.target.value);updateUrl({question:event.target.value})}}/></label><label>Exact policy reference<input value={policy} onChange={event=>{setPolicy(event.target.value);updateUrl({policy:event.target.value})}}/></label></div></details></div>      {canReview&&source==='server'&&!myQueue&&<details><summary>Calibration sample</summary><section className="panel calibration-sample" aria-label="Calibration sample"><div><h2>Select a calibration sample</h2><p>Mark existing, unreviewed evaluations. Source: {evaluationSourceLabel(recordSource||'genesys-cloud')}; uses form, agent, queue and date filters above.</p></div><label>Sample size<input type="number" min={1} max={20} value={sampleCount} onChange={event=>setSampleCount(Number(event.target.value))}/></label><label>Selection<select value={sampleStrategy} onChange={event=>setSampleStrategy(event.target.value)}><option value="recent">Most recent</option><option value="deterministic">Deterministic sample</option></select></label>{sampleStrategy==='deterministic'&&<label>Sample seed<input maxLength={200} value={sampleSeed} onChange={event=>setSampleSeed(event.target.value)}/></label>}{canAssign&&<><ReviewerPicker directory={directory} value={sampleAssignee} onChange={setSampleAssignee} label="Assign sample to" optional/><label>Sample due date<input type="datetime-local" value={sampleDue} disabled={!sampleAssignee} onChange={e=>setSampleDue(e.target.value)}/></label></>}<button className="outline-button" disabled={!currentPage||!session||sampling||sampleCount<1||sampleCount>20} onClick={()=>void sample()}>Request sample</button>{operationFailure('sample')}{sampleNotice&&<p role="status">{sampleNotice}</p>}</section></details>}{canAssign&&source==='server'&&!myQueue&&<details><summary>Bulk assignment</summary><section className="panel bulk-review-assignment" aria-label="Bulk review assignment"><h2>Bulk assignment</h2><p>{selectionCount} selected · maximum 20 · requested, in-progress or unreviewed evaluations; due dates require an active review</p><div className="browser-filters"><ReviewerPicker directory={directory} value={bulkAssignee} onChange={setBulkAssignee} label="Bulk assign to" disabled={bulkBusy}/><label>Bulk due date<input type="datetime-local" value={bulkDue} disabled={bulkBusy} onChange={e=>setBulkDue(e.target.value)}/></label><button className="primary-button" disabled={!currentPage||!session||bulkBusy||!bulkAssignee||!selectionCount||!assignmentEligible} onClick={()=>void bulkAssign()}>Assign {selectionCount} reviews</button><button className="outline-button" disabled={!currentPage||bulkBusy||!selectionCount||!dueEligible||!bulkDue} onClick={()=>void bulkDueDate()}>Set due date</button><button className="outline-button" disabled={!currentPage||bulkBusy||!selectionCount||!dueEligible} onClick={()=>void bulkDueDate(true)}>Clear due date</button><button className="outline-button" disabled={!currentPage||bulkBusy||!selectionCount} onClick={()=>setSelection({})}>Clear selection</button></div>{operationFailure('bulk')}{bulkNotice&&<p role="status">{bulkNotice}</p>}</section></details>}{showResults&&<>{currentPage&&<p className="field-note">Loaded {loadedTime}</p>}<OperationalTable tableLabel={myQueue?'My reviews table':'All evaluations table'} renderCard={taskQueue?reviewCard:undefined} bounded preserveOrder={myQueue} key={`${source}-${myQueue}-${scopeRevision}`} rows={filtered} stateKey="evaluations" columns={columns} keyOf={item=>item.id} onSelect={item=>openEvaluation(item)} empty={source==='browser'?'No evaluations match this browser scope.':evaluationEmptyCopy(myQueue)}/></>}{currentPage&&<div className="pager"><button className="outline-button" disabled={!cursor||loading} onClick={()=>void load(undefined,'first')}>First page</button><button className="outline-button" disabled={!next||loading} onClick={()=>void load(next,'next')}>Next page →</button></div>}
    </div>
    {selected&&source==='server'&&session&&origin&&!active&&<section className="panel evaluation-availability" aria-label="Evaluation details" role={detailError?'alert':'status'}>
      <h2 ref={focus.headingRef} tabIndex={-1}>{detailError?'Evaluation details could not be loaded.':'Loading evaluation details…'}</h2>
      {detailError?<div><p>{detailError.status===401||detailError.status===403?'Your session no longer has access to these evaluation details.':'The evaluation list remains available.'}</p><button className="primary-button" onClick={()=>{focus.capture();setDetailRetry(n=>n+1)}}>Retry details</button>{technical(detailError.technical)}</div>:<p role="status">Loading evaluation details…</p>}
      <button className="outline-button" onClick={closeDetail}>Close details</button>
    </section>}
    {active&&<section className={`panel ${focused?'review-workspace':'evaluation-detail'}`} aria-label={focused?'Review workspace':undefined}>
      {focused?<>
        <button className="text-link" onClick={closeDetail}>{myQueue?'Back to My Reviews':'Back to review queue'}</button>
        <header><span className="mini-label">MY REVIEW</span><h1 ref={focus.headingRef} tabIndex={-1}>{active.form.name} v{active.form.version}</h1>
          <p>{active.agent.name} · {queueName(active.queue)} · {active.channel}{active.topic&&active.topic!=='Unspecified'?` · ${active.topic}`:''}</p>
          <div className="review-workspace-state"><span className="pill">{statusText(active)}</span><ReviewDueBadge review={active.humanReview} now={sla.now} settings={sla.settings}/></div>
        </header>
        <button className="outline-button review-evidence" onClick={()=>onConversation(active.conversationId,{returnUrl:location.href,evaluationId:active.id,returnFocus:'review',cursor})}>Open conversation evidence</button>
      </>:<>
        <div className="panel-heading"><div><span className="mini-label">EVALUATION DETAIL</span><h2 ref={focus.headingRef} tabIndex={-1}>{active.form.name} v{active.form.version}</h2></div><button className="outline-button" onClick={closeDetail}>Close details</button></div>
        <div className="metrics-grid"><div><small>Score</small><strong>{percent(active.overallScore)}</strong></div><div><small>Result</small><strong>{active.passed===null?'Unscored':active.passed?'Pass':'Fail'}</strong></div><div><small>Critical failures</small><strong>{active.criticalFailures.length+(active.criticalGroupFailures?.length??0)}</strong></div><div><small>Human review</small><strong>{humanReviewStatus(reviewStatus(active,active.humanReview))}</strong></div></div>
        <h3>Context</h3><p>Agent: {active.agent.name} · Queue: {queueName(active.queue)} · Channel: {active.channel}{active.topic&&active.topic!=='Unspecified'?` · Topic: ${active.topic}`:''}</p>
        <p>Policy: {active.policyMatches.map(item=>item.policyName).join(', ')||'Manual evaluation'} · {evaluationSourceLabel(active.conversationSource)} · Evaluated: {new Date(active.evaluatedAt).toLocaleString()}</p>
        <button className="outline-button" onClick={()=>onConversation(active.conversationId,{returnUrl:location.href,evaluationId:active.id,returnFocus:drafts.drafts[active.id]?.dirty||active.humanReview?.status==='IN_REVIEW'?'review':'detail',cursor})}>Open conversation</button>
        <h3>AI evaluation result</h3><GroupResultsPanel record={active}/>
      </>}
      <ReviewPanel key={active.id} focused={focused} onStarted={()=>setReviewFocusId(active.id)} record={active} review={active.humanReview} session={session} onSaved={saved} drafts={drafts} myQueue={myQueue} onContinue={closeDetail}/>
      {focused&&<details className="review-evaluation-details"><summary>AI evaluation result</summary><GroupResultsPanel record={active}/></details>}
      <EvaluationProvenance key={`provenance-${active.id}`} record={active}/>

    </section>}

  </div>
}
