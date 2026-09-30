import { useEffect, useState } from 'react'
import type { AuthSession } from './domain/genesysAuth'
import type { EvaluationForm, EvaluationRecord, InteractionPolicy, PolicyRun } from './domain/types'
import { summarize, summarizeCoverage } from './domain/analytics'
import { nextDueAfter, type Schedule } from './server/schedules'

const origin=(import.meta.env.VITE_AQM_API_ORIGIN??'').trim().replace(/\/$/,'')
interface Snapshot {policies:InteractionPolicy[];forms:EvaluationForm[];schedules:Schedule[];runs:PolicyRun[];evaluations:EvaluationRecord[]}
const empty:Snapshot={policies:[],forms:[],schedules:[],runs:[],evaluations:[]}
function localInput(date:Date){return new Date(date.getTime()-date.getTimezoneOffset()*60_000).toISOString().slice(0,16)}
export function AutomationPanel({session,localPolicies,localForms}:{session:AuthSession|null;localPolicies:InteractionPolicy[];localForms:EvaluationForm[]}){
  const [data,setData]=useState<Snapshot>(empty),[state,setState]=useState<'not-configured'|'disconnected'|'connected'|'error'>(origin?'disconnected':'not-configured')
  const [message,setMessage]=useState(''),[selected,setSelected]=useState(''),[frequency,setFrequency]=useState<Schedule['frequency']>('MANUAL'),[localTime,setLocalTime]=useState('02:00'),[weekday,setWeekday]=useState(1)
  const [from,setFrom]=useState(()=>localInput(new Date(Date.now()-86400_000))),[to,setTo]=useState(()=>localInput(new Date()))
  const [preview,setPreview]=useState<{fingerprint:string;expectedEvaluations:number;candidateCount:number;eligibleCount:number;sampledCount:number;selected:Array<{conversationId:string;pendingFormIds:string[]}>}|null>(null)
  const [busy,setBusy]=useState(false)
  const call=async(path:string,method='GET',payload?:unknown)=>{
    if(!session)throw new Error('Connect to Genesys Cloud in Settings first.')
    const response=await fetch(`${origin}${path}`,{method,headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)})
    const result=await response.json() as Record<string,unknown>
    if(!response.ok)throw new Error(typeof result.error==='string'?result.error:`Automation service returned HTTP ${response.status}.`)
    return result
  }
  const refresh=async()=>{
    if(!origin||!session)return
    try{const [policies,forms,schedules,runs,evaluations]=await Promise.all(['/api/policies','/api/forms','/api/schedules','/api/runs','/api/evaluations'].map(path=>call(path)))
      setData({policies:policies.items as InteractionPolicy[],forms:forms.items as EvaluationForm[],schedules:schedules.items as Schedule[],runs:runs.items as PolicyRun[],evaluations:evaluations.items as EvaluationRecord[]});setState('connected')
    }catch(error){setState('error');setMessage(error instanceof Error?error.message:'Automation service could not be reached.')}
  }
  useEffect(()=>{void refresh()},[session?.accessToken])
  const action=async(work:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await work();await refresh()}catch(error){setMessage(error instanceof Error?error.message:'Action failed.')}finally{setBusy(false)}}
  const publish=()=>action(async()=>{for(const form of localForms.filter(f=>f.enabled))await call(`/api/forms/${encodeURIComponent(form.id)}`,'PUT',form)
    for(const policy of localPolicies)await call(`/api/policies/${encodeURIComponent(policy.id)}`,'PUT',policy)
    setMessage('Local forms and policies published to the automation service. Browser history remains local.')})
  const saveSchedule=()=>action(async()=>{if(!selected)throw new Error('Select a server policy.')
    const schedule:Schedule={id:`schedule_${selected}`,policyId:selected,enabled:frequency!=='MANUAL',frequency,timezone:'Europe/London',localTime,weekday,version:1}
    schedule.nextDueAt=nextDueAfter(schedule,new Date().toISOString())
    await call(`/api/schedules/${schedule.id}`,'PUT',schedule)
    setMessage('Schedule saved.')})
  const period=()=>({periodStart:new Date(from).toISOString(),periodEnd:new Date(to).toISOString()})
  const plan=()=>action(async()=>{if(!selected)throw new Error('Select a server policy.');const result=await call(`/api/policies/${selected}/plan`,'POST',{period:period()});setPreview(result as unknown as typeof preview)})
  const run=()=>action(async()=>{if(!selected||!preview)throw new Error('Preview a plan first.');const result=await call(`/api/policies/${selected}/run`,'POST',{period:period(),fingerprint:preview.fingerprint});setPreview(null);setMessage(`Run ${(result.run as PolicyRun).status}.`)})
  const schedule=data.schedules.find(s=>s.policyId===selected)
  const quality=summarize(data.evaluations.filter(r=>r.conversationSource==='genesys-cloud'))
  const coverage=summarizeCoverage(data.runs.filter(r=>r.source==='genesys-cloud'))
  return <div className="page-content"><div className="panel run-panel"><div className="panel-heading"><div><span className="mini-label">V0.5 DURABLE AUTOMATION</span><h2>Automation service</h2></div><span className="pill">{state==='connected'?'Connected':state==='not-configured'?'Not configured':state==='disconnected'?'Connect to Genesys':'Unavailable'}</span></div>
    <p>Server policies, schedules, runs, and evaluations are stored separately from this browser's V0.4 local data. Only real Genesys conversations are processed by automation.</p>
    {state==='connected'&&<><p>{data.policies.length} server policies · {data.schedules.length} schedules · {data.runs.length} runs · {data.evaluations.length} evaluations</p><button className="outline-button" disabled={busy} onClick={publish}>Publish local forms and policies to server</button><button className="outline-button" disabled={busy} onClick={()=>void refresh()}>Refresh durable data</button>
      <div className="browser-filters"><label>Server policy<select value={selected} onChange={e=>{setSelected(e.target.value);setPreview(null);const s=data.schedules.find(x=>x.policyId===e.target.value);setFrequency(s?.frequency??'MANUAL');setLocalTime(s?.localTime??'02:00');setWeekday(s?.weekday??1)}}><option value="">Select policy</option>{data.policies.map(p=><option key={p.id} value={p.id}>{p.name} · v{p.version??1}</option>)}</select></label></div>
      {selected&&<><h3>Run frequency</h3><div className="monitoring-options">{(['MANUAL','DAILY','WEEKLY'] as const).map(f=><label key={f}><input type="radio" name="server-frequency" checked={frequency===f} onChange={()=>setFrequency(f)}/>{f==='MANUAL'?'Manual':f==='DAILY'?'Daily · previous day':'Weekly · previous Monday–Sunday'}</label>)}</div>
        {frequency!=='MANUAL'&&<div className="browser-filters">{frequency==='WEEKLY'&&<label>Run on<select value={weekday} onChange={e=>setWeekday(Number(e.target.value))}>{['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day,i)=><option key={day} value={i+1}>{day}</option>)}</select></label>}<label>Local time<input type="time" value={localTime} onChange={e=>setLocalTime(e.target.value)}/></label><label>Timezone<input value="Europe/London" readOnly/></label></div>}
        <p>Next run: {schedule?.nextDueAt?new Date(schedule.nextDueAt).toLocaleString('en-GB',{timeZone:'Europe/London'}):'—'} · Last attempted: {schedule?.lastAttemptedAt??'—'} · Last successful: {schedule?.lastSuccessfulAt??'—'}</p><button className="outline-button" disabled={busy} onClick={saveSchedule}>Save server schedule</button>
        <h3>Manual server run</h3><p>Plan → preview → confirm → execute. A fresh plan is required if the selected population changes.</p><div className="browser-filters"><label>From<input type="datetime-local" value={from} onChange={e=>{setFrom(e.target.value);setPreview(null)}}/></label><label>To<input type="datetime-local" value={to} onChange={e=>{setTo(e.target.value);setPreview(null)}}/></label></div><button className="primary-button" disabled={busy} onClick={plan}>Build server plan</button>
        {preview&&<div className="confirmation panel"><strong>Confirm real Genesys evaluation</strong><p>{preview.candidateCount} candidates · {preview.eligibleCount} eligible · {preview.sampledCount} sampled · {preview.expectedEvaluations} Jev evaluations</p><ul>{preview.selected.map(item=><li key={item.conversationId}>{item.conversationId}: {item.pendingFormIds.join(', ')||'No pending forms'}</li>)}</ul><button className="primary-button" disabled={busy||!preview.expectedEvaluations} onClick={run}>Confirm and execute on server</button><button className="outline-button" onClick={()=>setPreview(null)}>Cancel</button></div>}</>}
      <h3>Durable operational results</h3><p>Quality: {quality.evaluations} real evaluations · average {quality.averageScore===null?'—':`${Math.round(quality.averageScore*100)}%`} · pass rate {quality.passRate===null?'—':`${Math.round(quality.passRate*100)}%`}</p><p>Coverage: {coverage.eligible} eligible / {coverage.sampled} sampled / {coverage.evaluated} evaluated · {coverage.failed} failed evaluations</p><p>{data.runs.filter(r=>r.executionMode==='scheduled').length} scheduled runs · {data.runs.filter(r=>r.executionMode==='manual').length} manual server runs · {data.evaluations.filter(r=>r.executionMode==='scheduled').length} automatic evaluations</p><p>{data.runs.filter(r=>r.status==='completed').length} completed · {data.runs.filter(r=>r.status==='partial-failure').length} partial · {data.runs.filter(r=>r.status==='failed').length} failed</p>
      <div className="panel analytics-panel"><h3>Automation by policy</h3><div className="coverage-table"><div className="coverage-row heading"><span>Policy</span><span>Frequency</span><span>Next due</span><span>Last run</span><span>Last success</span></div>{data.policies.map(policy=>{const s=data.schedules.find(item=>item.policyId===policy.id);const last=[...data.runs].filter(r=>r.policyId===policy.id).sort((a,b)=>b.startedAt.localeCompare(a.startedAt))[0];return <div className="coverage-row" key={policy.id}><strong>{policy.name}</strong><span>{s?.enabled?s.frequency:'Manual'}</span><span>{s?.nextDueAt?new Date(s.nextDueAt).toLocaleString('en-GB',{timeZone:'Europe/London'}):'—'}</span><span>{last?`${last.status} · ${new Date(last.startedAt).toLocaleDateString('en-GB')}`:'—'}</span><span>{s?.lastSuccessfulAt?new Date(s.lastSuccessfulAt).toLocaleDateString('en-GB'):'—'}</span></div>})}</div></div>
      <div className="history-list">{[...data.runs].sort((a,b)=>b.startedAt.localeCompare(a.startedAt)).slice(0,20).map(r=><details key={r.id} className="panel history-item automation-run"><summary>{r.policySnapshot.name} · {r.executionMode??'legacy'} · {r.status} · {r.startedAt} · {r.evaluationsSucceeded}/{r.evaluationsRequested} succeeded</summary><p>Run {r.id} · {r.period?.periodStart} to {r.period?.periodEnd}</p>{r.failures.map((f,i)=><p key={i}>{f.conversationId} {f.formId}: {f.reason}</p>)}</details>)}</div></>}
    {message&&<p role="status">{message}</p>}{state==='not-configured'&&<p>Set VITE_AQM_API_ORIGIN when the trusted API is deployed. Synthetic and browser local features remain available.</p>}{state==='disconnected'&&<p>Connect with Genesys PKCE in Settings to access the server.</p>}
  </div></div>
}
