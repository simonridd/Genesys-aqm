import { CoverageFunnel } from './CoverageFunnel'
import { sourceLabel } from './analyticsPresentation'
import { summarizeCoverage } from './domain/analytics'
import { useDetailFocus } from './useDetailFocus'
import { SetupChecklist } from './SetupChecklist'
import type { SavedCollection } from './useSavedConfiguration'
import type { EvaluationForm } from './domain/types'
import { loadPolicyCollection } from './domain/policyClient'
import { usePermission } from './GovernancePanel'
import { AlertsPanel } from './AlertsPanel'
import { useEffect, useRef, useState } from 'react'
import type { AuthSession } from './domain/genesysAuth'
import type { InteractionPolicy, PolicyRun } from './domain/types'
import type { OverviewSnapshot } from './domain/overview'
import { OverviewSummary, type OverviewActions } from './OverviewSummary'
import { type Schedule } from './server/schedules'
import { OperationalTable, type Column } from './OperationalTable'

const origin=(import.meta.env.VITE_AQM_API_ORIGIN??'').trim().replace(/\/$/,'')
interface Snapshot {policies:InteractionPolicy[];schedules:Schedule[];runs:PolicyRun[]}
const empty:Snapshot={policies:[],schedules:[],runs:[]}
function localInput(date:Date){return new Date(date.getTime()-date.getTimezoneOffset()*60_000).toISOString().slice(0,16)}
export function AutomationPanel({savedForms,session,selectedPolicyId,onEditPolicy,onReview,onExplore,onAnalytics,onPage}:{savedForms:SavedCollection<EvaluationForm>;session:AuthSession|null;selectedPolicyId:string|null;onEditPolicy:(id:string)=>void;onReview:(id:string)=>void;onExplore:OverviewActions['onExplore'];onAnalytics:OverviewActions['onAnalytics'];onPage:OverviewActions['onPage']}){
  const canWrite=usePermission('policies.write')
  const refreshSequence=useRef(0)
  const [configurationReady,setConfigurationReady]=useState(false)
  const [data,setData]=useState<Snapshot>(empty),[state,setState]=useState<'not-configured'|'disconnected'|'connected'|'error'>(origin?'disconnected':'not-configured')
  const [overview,setOverview]=useState<OverviewSnapshot|null>(null),[range,setRange]=useState<7|30>(7),[refreshing,setRefreshing]=useState(false),[overviewError,setOverviewError]=useState(''),[selectedAlert,setSelectedAlert]=useState<string|null>(null),[alertRequest,setAlertRequest]=useState(0)
  const manualRef=useRef<HTMLDetailsElement>(null),operationsRef=useRef<HTMLDetailsElement>(null)
  const [message,setMessage]=useState(''),[selected,setSelected]=useState(selectedPolicyId??'')
  const [from,setFrom]=useState(()=>localInput(new Date(Date.now()-86400_000))),[to,setTo]=useState(()=>localInput(new Date()))
  const [preview,setPreview]=useState<{fingerprint:string;expectedEvaluations:number;maximumProviderRequests?:number;candidateCount:number;eligibleCount:number;sampledCount:number;selected:Array<{conversationId:string;pendingFormIds:string[]}>}|null>(null)
  const [busy,setBusy]=useState(false),[selectedRun,setSelectedRun]=useState<string|null>(new URLSearchParams(location.search).get('runId'))
  const call=async(path:string,method='GET',payload?:unknown)=>{
    if(!session)throw new Error('Connect to Genesys Cloud in Settings first.')
    const response=await fetch(`${origin}${path}`,{method,headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)})
    const result=await response.json() as Record<string,unknown>
    if(!response.ok)throw new Error(typeof result.error==='string'?result.error:`Automation service returned HTTP ${response.status}.`)
    return result
  }
  const [runDetail,setRunDetail]=useState<PolicyRun|null>(null),runRequest=useRef(0)
  const refresh=async()=>{
    if(!origin||!session)return
    const request=++refreshSequence.current
    setRefreshing(true);setOverviewError('');setConfigurationReady(false)
    const overviewRequest=call(`/api/overview?range=${range}`).then(snapshot=>{if(request!==refreshSequence.current)return;setOverview(snapshot as unknown as OverviewSnapshot);setState('connected')}).catch(error=>{if(request!==refreshSequence.current)return;setOverviewError(error instanceof Error?error.message:'Overview unavailable.');if(!overview)setState('error')}).finally(()=>{if(request===refreshSequence.current)setRefreshing(false)})
    const configCall=<T,>(path:string)=>call(path) as Promise<T>
    const operationsRequest=Promise.all([loadPolicyCollection<InteractionPolicy>(configCall,'/api/policies'),loadPolicyCollection<Schedule>(configCall,'/api/schedules'),call('/api/runs?limit=100')]).then(([policies,schedules,runs])=>{if(request===refreshSequence.current){setData({policies,schedules,runs:runs.items as PolicyRun[]});setConfigurationReady(true)}}).catch(()=>{if(request===refreshSequence.current)setMessage('Detailed operations temporarily unavailable.')})
    await Promise.all([overviewRequest,operationsRequest])
  }
  useEffect(()=>{setOverview(null);void refresh();return()=>{refreshSequence.current++}},[session?.accessToken,range])
  const runFocus=useDetailFocus(runDetail?.id===selectedRun?selectedRun:null)
  const openRun=(id:string)=>{runFocus.capture();setSelectedRun(id);operationsRef.current?.setAttribute('open','');const url=new URL(location.href);url.searchParams.set('runId',id);history.replaceState(null,'',url);const request=++runRequest.current;void call(`/api/runs/${id}`).then(run=>{if(request!==runRequest.current)return;setRunDetail(run as unknown as PolicyRun);setData(data=>({...data,runs:[...data.runs.filter(r=>r.id!==id),run as unknown as PolicyRun]}))}).catch(e=>setMessage(String(e)))}
  useEffect(()=>{if(selectedRun&&session)openRun(selectedRun);return()=>{runRequest.current++}},[session?.accessToken])
  const openAlert=(id:string)=>{setAlertRequest(value=>value+1);setSelectedAlert(id||null);operationsRef.current?.setAttribute('open','');setTimeout(()=>document.getElementById('overview-alert-management')?.scrollIntoView({block:'start'}),0)}
  const action=async(work:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await work();await refresh()}catch(error){setMessage(error instanceof Error?error.message:'Action failed.')}finally{setBusy(false)}}
  const period=()=>({periodStart:new Date(from).toISOString(),periodEnd:new Date(to).toISOString()})
  const plan=()=>action(async()=>{if(!selected)throw new Error('Select a server policy.');const result=await call(`/api/policies/${selected}/plan`,'POST',{period:period()});setPreview(result as unknown as typeof preview)})
  const run=()=>action(async()=>{if(!selected||!preview)throw new Error('Preview a plan first.');const result=await call(`/api/policies/${selected}/run`,'POST',{period:period(),fingerprint:preview.fingerprint});setPreview(null);setMessage(`Run ${(result.run as PolicyRun).status}.`)})
  const schedule=data.schedules.find(s=>s.policyId===selected)
  const visibleRun=runDetail?.id===selectedRun?runDetail:data.runs.find(item=>item.id===selectedRun)
  return <div className="page-content overview-page"><div className="page-heading"><div><div className="eyebrow">OPERATIONAL HOME</div><h1>Overview</h1><p>Quality, coverage and work requiring attention.</p><small>{overview?`Updated ${new Date(overview.generatedAt).toLocaleTimeString('en-GB',{timeZone:'Europe/London'})} · Europe/London`:'Saved AQM overview'}</small></div><div className="heading-actions"><label>Dashboard range<select value={range} onChange={e=>setRange(Number(e.target.value) as 7|30)}><option value={7}>7 days</option><option value={30}>30 days</option></select></label><button className="outline-button" disabled={refreshing||!session||!origin} onClick={()=>void refresh()}>{refreshing?'Refreshing…':'Refresh'}</button></div></div>
    {overviewError&&<p className="inline-error" role="alert">Overview could not be loaded.{overview?' · Showing the last successful snapshot.':''}</p>}{overviewError&&<details><summary>Technical details</summary><p>{overviewError}</p></details>}
    {overview&&<OverviewSummary data={overview} actions={{onEditPolicy,onReview,onExplore,onAnalytics,onPage,onRun:openRun,onAlert:openAlert}} onManual={()=>{manualRef.current?.setAttribute('open','');manualRef.current?.scrollIntoView({block:'start'})}}/>}
    {session&&configurationReady&&savedForms.loaded&&!savedForms.loading&&overview?.recentRuns.complete&&overview.lastAutomatedRun.complete&&<SetupChecklist forms={savedForms.items} policies={data.policies} schedules={data.schedules} runs={[...data.runs.map(run=>({id:run.id,policyId:run.policyId,policyName:run.policySnapshot.name,status:run.status,startedAt:run.startedAt,trigger:run.executionMode??'manual',evaluationsSucceeded:run.evaluationsSucceeded,evaluationsFailed:run.evaluationsFailed})),...(overview.lastAutomatedRun.data?[overview.lastAutomatedRun.data]:[])]} onForms={()=>onPage('forms')} onPolicies={id=>id?onEditPolicy(id):onPage('policies')} onRuns={()=>{document.querySelector('[aria-label="Recent runs"]')?.scrollIntoView({block:'start'})}}/>}
    {state==='connected'&&session&&origin&&<><details className="panel overview-manual" ref={manualRef} open={!!selectedPolicyId}><summary>Run a policy now</summary><p>Plan → preview → confirm → execute. Select a policy and inspect the plan before confirming a real evaluation.</p>
      <div className="browser-filters"><label>Server policy<select value={selected} onChange={e=>{setSelected(e.target.value);setPreview(null)}}><option value="">Select policy</option>{data.policies.map(p=><option key={p.id} value={p.id}>{p.name} · v{p.version??1}</option>)}</select></label></div>
      {selected&&<><h3>Automation</h3><p>Frequency: {schedule&&schedule.frequency!=='MANUAL'?`${schedule.frequency}${schedule.enabled?'':' (paused)'}`:'Manual'} · Next due: {schedule?.nextDueAt??'—'} · Last attempted: {schedule?.lastAttemptedAt??'—'} · Last successful: {schedule?.lastSuccessfulAt??'—'}</p><button className="outline-button" onClick={()=>onEditPolicy(selected)}>Edit policy &amp; schedule</button>{!data.policies.find(p=>p.id===selected)?.enabled&&<p className="field-note">Policy disabled. Scheduled attempts will not evaluate this policy.</p>}
        <h3>Manual server run</h3><p>Plan → preview → confirm → execute. A fresh plan is required if the selected population changes.</p><div className="browser-filters"><label>From<input type="datetime-local" value={from} onChange={e=>{setFrom(e.target.value);setPreview(null)}}/></label><label>To<input type="datetime-local" value={to} onChange={e=>{setTo(e.target.value);setPreview(null)}}/></label></div><button className="primary-button" disabled={busy||!canWrite} onClick={plan}>Build server plan</button>
        {preview&&<div className="confirmation panel"><strong>Confirm real Genesys evaluation</strong><p>{preview.candidateCount} candidates · {preview.eligibleCount} eligible · {preview.sampledCount} sampled · {preview.expectedEvaluations} evaluation assignments · Maximum Jev requests: {preview.maximumProviderRequests??preview.expectedEvaluations}</p><ul>{preview.selected.map(item=><li key={item.conversationId}>{item.conversationId}: {item.pendingFormIds.join(', ')||'No pending forms'}</li>)}</ul><button className="primary-button" disabled={busy||!canWrite||!preview.expectedEvaluations} onClick={run}>Confirm and execute on server</button><button className="outline-button" onClick={()=>setPreview(null)}>Cancel</button></div>}</>}
      </details><details className="panel overview-operations" ref={operationsRef}><summary>Detailed alerts &amp; run operations</summary><div id="overview-alert-management"><AlertsPanel selectedAlertRequest={alertRequest} selectedAlertId={selectedAlert} session={session} onReview={onReview} onRun={openRun}/></div>
      <h3 ref={runFocus.fallbackRef} tabIndex={-1}>Monitoring runs</h3><OperationalTable tableLabel="Monitoring runs table" bounded selectionControl={{columnKey:'policy',label:item=>`Open run ${item.policySnapshot.name} started ${new Date(item.startedAt).toLocaleString()}`}} rows={selected?data.runs.filter(r=>r.policyId===selected):data.runs} stateKey="runs" columns={[{key:'started',label:'Started',value:(item:PolicyRun)=>item.startedAt},{key:'policy',label:'Policy',value:(item:PolicyRun)=>item.policySnapshot.name},{key:'source',label:'Source',value:(item:PolicyRun)=>sourceLabel(item.source)},{key:'period',label:'Period',value:(item:PolicyRun)=>item.period?`${item.period.periodStart} – ${item.period.periodEnd}`:'—'},{key:'trigger',label:'Trigger',value:(item:PolicyRun)=>item.executionMode??'manual'},{key:'eligible',label:'Eligible',value:(item:PolicyRun)=>item.coverage?.eligibleCount??item.matchedConversationCount},{key:'sampled',label:'Sampled',value:(item:PolicyRun)=>item.coverage?.sampledCount??0},{key:'success',label:'Completed evaluations',value:(item:PolicyRun)=>item.evaluationsSucceeded},{key:'failed',label:'Failed evaluation attempts',value:(item:PolicyRun)=>item.evaluationsFailed},{key:'status',label:'Status',value:(item:PolicyRun)=>item.status}] satisfies Column<PolicyRun>[]} keyOf={item=>item.id} onSelect={item=>openRun(item.id)}/>{(visibleRun?[visibleRun]:[]).map(item=><div id="overview-run-detail" className="panel run-detail" key={item.id}><div className="panel-heading"><h3 ref={runFocus.headingRef} tabIndex={-1}>{item.policySnapshot.name} · Run detail</h3><button className="outline-button" onClick={()=>{runRequest.current++;setSelectedRun(null);setRunDetail(null);const url=new URL(location.href);url.searchParams.delete('runId');history.replaceState(null,'',url);runFocus.restore()}}>Close details</button></div><p>Policy v{item.policySnapshot.version??1} · {item.executionMode==='scheduled'?'Scheduled':'Manual'} · {new Date(item.startedAt).toLocaleString('en-GB')}</p><CoverageFunnel counts={summarizeCoverage([item])} showGaps/><details><summary>Advanced run details</summary><p>Run {item.id} · {item.startedAt} to {item.completedAt??'in progress'}</p><p>Selected interactions: {item.sampledConversationIds?.join(', ')||'Not recorded'}</p>{item.failures.map((failure,index)=><p key={index}>{failure.conversationId} {failure.formId}: {failure.reason}</p>)}</details><button className="text-link" onClick={()=>onExplore({policy:item.policyId})}>Explore policy evaluations →</button></div>)}</details></>}
    {message&&<p role="status">{message}</p>}{!session||!origin?<div className="panel empty-state"><h2>Connect to Genesys Cloud</h2><p>Connect to Genesys Cloud to view operational AQM health.</p><button className="primary-button" onClick={()=>onPage('settings')}>Connection settings →</button></div>:!overview&&<p role="status">{refreshing?'Loading operational overview…':'Overview unavailable. Refresh to try again.'}</p>}
  </div>
}
