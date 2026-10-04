import { withEvaluationScopeLabels } from './evaluationAvailability'
import { ResponsiveViewSwitcher, calibrationViews } from './ResponsiveViewSwitcher'
import { useDetailFocus } from './useDetailFocus'
import { useEffect, useRef, useState } from 'react'
import type { AuthSession } from './domain/genesysAuth'
import type { CalibrationAnalytics, CalibrationGroup } from './domain/calibration'
import { apiOrigin } from './domain/manualClient'
import { OperationalTable, type Column } from './OperationalTable'
import { reviewPercent } from './ReviewPanel'
import { calibrationFormCatalogue, calibrationFormLabel, calibrationDisagreementEvidence, comparableAnswers, rankCalibrationDisagreement, readCalibrationState, calibrationRequestUrl, calibrationSourceLabels, type CalibrationState } from './calibrationPresentation'
const gap=(value:number|null)=>value===null?'—':`${(value*100).toFixed(1)} pp`
export function CalibrationPage({session,onExplore}:{session:AuthSession|null;onExplore:(filters:Record<string,string>)=>void}){
  const [scope,setScope]=useState(()=>readCalibrationState(new URLSearchParams(location.search)))
  const {source,form,from,to,agent,queue,calibrationTab:tab,calibrationQuestion}=scope
  const [data,setData]=useState<CalibrationAnalytics|null>(null),[loadedScope,setLoadedScope]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0)
  const [catalogue,setCatalogue]=useState<CalibrationAnalytics['byForm']>([]),[catalogueScope,setCatalogueScope]=useState(''),[catalogueLoading,setCatalogueLoading]=useState(false),[catalogueError,setCatalogueError]=useState(''),[catalogueRetry,setCatalogueRetry]=useState(0)
  const [filtersOpen,setFiltersOpen]=useState(false),[notice,setNotice]=useState('')
  const disclosureRef=useRef<HTMLButtonElement>(null),latest=useRef(scope),resetForScope=useRef('')
  latest.current=scope
  const requestKey=calibrationRequestUrl(apiOrigin||location.origin,scope).search
  const catalogueKey=calibrationRequestUrl(apiOrigin||location.origin,scope,true).search
  const writeScope=(next:CalibrationState,replace=false)=>{
    const url=new URL(location.href);url.searchParams.set('page','calibration')
    for(const [key,value] of Object.entries(next))value?url.searchParams.set(key,value):url.searchParams.delete(key)
    window.history[replace?'replaceState':'pushState'](null,'',url);latest.current=next;setScope(next)
  }
  const update=(values:Partial<CalibrationState>,replace=false)=>{
    const next={...latest.current,...values}
    if(['source','from','to','agent','queue'].some(key=>key in values&&values[key as keyof CalibrationState]!==latest.current[key as keyof CalibrationState]))resetForScope.current=calibrationRequestUrl(apiOrigin||location.origin,next,true).search
    setNotice('');writeScope(next,replace)
  }
  useEffect(()=>{const sync=()=>{latest.current=readCalibrationState(new URLSearchParams(location.search));setScope(latest.current)};window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[])
  useEffect(()=>{
    if(!session||!apiOrigin)return
    let cancelled=false;const controller=new AbortController();setLoading(true);setError('')
    const timer=setTimeout(async()=>{try{
      const reply=await fetch(calibrationRequestUrl(apiOrigin,scope),{headers:{Authorization:`Bearer ${session.accessToken}`},signal:controller.signal})
      const body=await reply.json() as CalibrationAnalytics&{error?:string};if(!reply.ok)throw Error(body.error??`HTTP ${reply.status}`)
      if(!cancelled){setData(body);setLoadedScope(requestKey)}
    }catch(reason){if(!cancelled)setError(reason instanceof Error?reason.message:'Calibration unavailable.')}finally{if(!cancelled)setLoading(false)}},200)
    return()=>{cancelled=true;clearTimeout(timer);controller.abort()}
  },[session?.accessToken,requestKey,retry])
  useEffect(()=>{
    if(!session||!apiOrigin)return
    let cancelled=false;const controller=new AbortController();setCatalogueLoading(true);setCatalogueError('')
    const timer=setTimeout(async()=>{try{
      const reply=await fetch(calibrationRequestUrl(apiOrigin,latest.current,true),{headers:{Authorization:`Bearer ${session.accessToken}`},signal:controller.signal})
      const body=await reply.json() as CalibrationAnalytics&{error?:string};if(!reply.ok)throw Error(body.error??`HTTP ${reply.status}`)
      if(!cancelled){
        setCatalogue(body.byForm);setCatalogueScope(catalogueKey)
        if(resetForScope.current===catalogueKey){resetForScope.current=''
          if(latest.current.form&&!body.byForm.some(row=>row.formRef===latest.current.form)){
            writeScope({...latest.current,form:'',calibrationQuestion:''},true);setNotice('The selected form version has no completed reviews in this scope. Showing All form versions.')
          }
        }
      }
    }catch(reason){if(!cancelled)setCatalogueError(reason instanceof Error?reason.message:'Form choices unavailable.')}finally{if(!cancelled)setCatalogueLoading(false)}},200)
    return()=>{cancelled=true;clearTimeout(timer);controller.abort()}
  },[session?.accessToken,catalogueKey,catalogueRetry])
  const current=data&&loadedScope===requestKey&&!error
  const selected=current?data.byQuestion.find(row=>row.key===calibrationQuestion)??null:null
  const focus=useDetailFocus(selected?.key)
  const available=catalogueScope===catalogueKey?catalogue:[]
  const options=calibrationFormCatalogue(available)
  const evidenceForms=[...(current?data.byForm:[]),...available,...catalogue]
  const formLabel=(ref:string)=>calibrationFormLabel(ref,evidenceForms)
  const top=current?rankCalibrationDisagreement(data.byQuestion)[0]:undefined
  const rows=data?.[tab==='forms'?'byForm':tab==='groups'?'byGroup':tab==='questions'?'byQuestion':tab==='types'?'byType':'confidenceBands']??[]
  const columns:Column<CalibrationGroup>[]=[
    {key:'name',label:tab==='confidence'?'Confidence band':tab==='questions'?'Question':'Dimension',value:item=>item.label,width:'240px'},
    ...(tab==='questions'?[{key:'form',label:'Form / version',value:(item:CalibrationGroup)=>formLabel(item.formRef??'')}]:[]),
    ...(tab==='groups'?[{key:'aiScore',label:'AI group score',value:(item:CalibrationGroup)=>item.aiAverageCredit??-1,render:(item:CalibrationGroup)=>reviewPercent(item.aiAverageCredit)},{key:'humanScore',label:'Human group score',value:(item:CalibrationGroup)=>item.humanAverageCredit??-1,render:(item:CalibrationGroup)=>reviewPercent(item.humanAverageCredit)}]:[]),
    ...(tab==='confidence'?[]:[{key:'reviewed',label:'Reviews',value:(item:CalibrationGroup)=>item.reviewed}]),
    {key:'questions',label:tab==='questions'?'Comparable answers':'Questions',value:item=>tab==='questions'?comparableAnswers(item):item.questions},
    {key:'rate',label:'Exact agreement',value:item=>item.agreementRate??-1,render:item=>reviewPercent(item.agreementRate)},
    {key:'disagreed',label:'Disagreements',value:item=>item.disagreements},
    ...((tab==='forms'||tab==='groups')?[{key:'gap',label:'Mean score gap',value:(item:CalibrationGroup)=>item.meanScoreDifference??-1,render:(item:CalibrationGroup)=>gap(item.meanScoreDifference)}]:tab==='questions'?[
      {key:'ai',label:'AI credit',value:(item:CalibrationGroup)=>item.aiAverageCredit??-1,render:(item:CalibrationGroup)=>reviewPercent(item.aiAverageCredit)},
      {key:'human',label:'Human credit',value:(item:CalibrationGroup)=>item.humanAverageCredit??-1,render:(item:CalibrationGroup)=>reviewPercent(item.humanAverageCredit)},
      {key:'difference',label:'Mean credit gap',value:(item:CalibrationGroup)=>item.averageAbsoluteCreditDifference??-1,render:(item:CalibrationGroup)=>gap(item.averageAbsoluteCreditDifference)},
      {key:'agreeConfidence',label:'Confidence: agree',value:(item:CalibrationGroup)=>item.confidenceOnAgreements??-1,render:(item:CalibrationGroup)=>reviewPercent(item.confidenceOnAgreements)},
      {key:'disagreeConfidence',label:'Confidence: disagree',value:(item:CalibrationGroup)=>item.confidenceOnDisagreements??-1,render:(item:CalibrationGroup)=>reviewPercent(item.confidenceOnDisagreements)}]:[])
  ]
  const inspect=(item:CalibrationGroup)=>{focus.capture();update({form:item.formRef!,calibrationTab:'questions',calibrationQuestion:item.key})}
  const explore=(item:CalibrationGroup,comparison='',evaluationId='')=>onExplore(withEvaluationScopeLabels({source:source==='all'?'':source,form:item.formRef??form,reviewQuestion:item.questionId??'',reviewStatus:'REVIEWED',comparison,evaluationId,agent,queue,from,to,evaluationSource:'server'},{form:formLabel(item.formRef??form),reviewQuestion:item.label}))
  const questionCard=(item:CalibrationGroup)=><article className="calibration-question-card"><h3><button className="text-link" disabled={!current} onClick={()=>{focus.capture();update({calibrationQuestion:item.key})}} aria-label={`Open calibration ${item.label} · ${formLabel(item.formRef!)}`}>{item.label}</button></h3><p>{formLabel(item.formRef!)}</p><dl>{columns.filter(column=>!['name','form'].includes(column.key)).map(column=><div key={column.key}><dt>{column.label}</dt><dd>{column.render?.(item)??column.value(item)}</dd></div>)}</dl></article>
  const changeFilters=()=>{setFiltersOpen(true);requestAnimationFrame(()=>document.getElementById('calibration-source')?.focus())}
  return <div className="page-content calibration-page">
    <div className="page-heading"><div><div className="eyebrow">HUMAN + AI</div><h1 ref={focus.fallbackRef} tabIndex={-1}>Calibration</h1><p>Find human / AI disagreements and their supporting evaluations.</p></div></div>
    <section className="panel calibration-scope" aria-label="Calibration scope">
      <div><strong>{calibrationSourceLabels[source]??'Selected source'} · {from||to?`${from||'Any start date'} – ${to||'Any end date'}`:'All dates'}</strong><p>{formLabel(form)}</p><small>{agent||'All agents'} · {queue||'All queues'}</small></div>
      <button ref={disclosureRef} className="outline-button" aria-expanded={filtersOpen} aria-controls="calibration-filters" onClick={()=>setFiltersOpen(v=>!v)}>{filtersOpen?'Close filters':'Change filters'}</button>
    </section>
    <div id="calibration-filters" hidden={!filtersOpen} className="panel browser-filters">
      <label>Source<select aria-label="Source" id="calibration-source" value={source} onChange={e=>update({source:e.target.value,calibrationQuestion:''})}>{Object.entries(calibrationSourceLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label>Form / version<select aria-label="Form / version" value={form} onChange={e=>update({form:e.target.value,calibrationQuestion:''})}><option value="">All form versions</option>{form&&!options.some(o=>o.value===form)&&<option value={form}>{formLabel(form)}</option>}{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
      <label>Agent<input value={agent} onChange={e=>update({agent:e.target.value,calibrationQuestion:''},true)}/></label>
      <label>Queue<input value={queue} onChange={e=>update({queue:e.target.value,calibrationQuestion:''},true)}/></label>
      <label>From<input type="date" value={from} onChange={e=>update({from:e.target.value,calibrationQuestion:''})}/></label>
      <label>To<input type="date" value={to} onChange={e=>update({to:e.target.value,calibrationQuestion:''})}/></label>
      <button className="outline-button" onClick={()=>{setFiltersOpen(false);disclosureRef.current?.focus()}}>Apply filters</button>
    </div>
    {catalogueLoading&&<p role="status">Loading form choices…</p>}
    {catalogueError&&<div role="status"><p>Form choices unavailable — retry</p><button className="outline-button" onClick={()=>setCatalogueRetry(n=>n+1)}>Retry form choices</button><details><summary>Technical details</summary><p>{catalogueError}</p></details></div>}
    {notice&&<p role="status">{notice}</p>}
    {!session&&<div className="panel empty-state"><h2>Connect to view calibration</h2><p>Use Settings to sign in with your authorized Genesys identity.</p></div>}
    {loading&&<p role="status">Loading calibration…</p>}
    {error&&<div className="panel inline-error" role="alert"><p>Calibration could not be loaded.</p><button className="outline-button" onClick={()=>setRetry(n=>n+1)}>Retry calibration</button><details><summary>Technical details</summary><p>{error}</p></details></div>}
    {data&&!error&&<div aria-busy={!current}>
      <section className="panel calibration-insight" aria-labelledby="calibration-insight-title">
        <h2 id="calibration-insight-title">Where humans and AI differ</h2>
        {!current?<p>Updating comparisons for this scope…</p>:top?<>
          <p className="mini-label">{top.disagreements?'Highest disagreement rate in this scope':'No disagreements in comparable reviewed answers'}</p>
          <h3>{top.label}</h3><p>{formLabel(top.formRef!)}</p><p><strong>{calibrationDisagreementEvidence(top).label}</strong><br/>{calibrationDisagreementEvidence(top).rate}</p>
          <div className="review-actions"><button className="outline-button" onClick={()=>inspect(top)}>Inspect question →</button><button className="primary-button" disabled={!top.disagreements} onClick={()=>explore(top,'disagreements')}>Open disagreements →</button></div>
        </>:<><p>No completed human/AI comparisons match this scope.</p><button className="outline-button" onClick={changeFilters}>Change filters</button></>}
      </section>
      <div className="metrics-grid calibration-metrics"><div className="metric panel"><small>Evaluations reviewed</small><strong>{data.metrics.evaluationsReviewed}</strong></div><div className="metric panel"><small>Questions reviewed</small><strong>{data.metrics.questionsReviewed}</strong></div><div className="metric panel"><small>Exact agreement</small><strong>{reviewPercent(data.metrics.exactAgreementRate)}</strong></div><div className="metric panel"><small>Mean absolute score gap</small><strong>{gap(data.metrics.averageAbsoluteScoreDifference)}</strong></div><div className="metric panel"><small>Unresolved reviews</small><strong>{data.metrics.unresolved}</strong><small>{data.metrics.inReview} in progress · outside completed comparisons</small></div></div>
      <ResponsiveViewSwitcher label="Calibration breakdown" options={calibrationViews} value={tab} onChange={value=>update({calibrationTab:value,calibrationQuestion:''})}/>
      {tab==='confidence'&&<div className="panel calibration-explanation"><h2>Confidence vs disagreement</h2><p>Noul uses the probability of the AI’s selected Yes/No answer. Choice and Score use provider confidence when supplied. Missing confidence has its own band. These counts describe this reviewed sample.</p></div>}
      <OperationalTable cardsLabel="Calibration question comparisons" renderCard={tab==='questions'?questionCard:undefined} tableLabel={`Calibration ${tab} table`} selectionControl={{columnKey:'name',label:item=>`Open calibration ${item.label}${tab==='questions'?` · ${formLabel(item.formRef!)}`:''}`}} rows={rows} columns={columns} keyOf={item=>item.key} stateKey={`calibration.${tab}`} onSelect={current?(tab==='forms'?item=>update({form:item.formRef!,calibrationTab:'questions',calibrationQuestion:''}):tab==='questions'?item=>{focus.capture();update({calibrationQuestion:item.key})}:undefined):undefined} empty="No completed reviews match these filters."/>
      {selected&&<section className="panel calibration-drill" aria-label="Question calibration drill-down"><div className="panel-heading"><div><span className="mini-label">{formLabel(selected.formRef!)}</span><h2 ref={focus.headingRef} tabIndex={-1}>{selected.label}</h2><p>{selected.reviewed} completed reviews · {comparableAnswers(selected)} comparable answers · {selected.agreements} agree / {selected.disagreements} disagree</p></div><button className="outline-button" onClick={()=>{update({calibrationQuestion:''});focus.restore()}}>Close question</button></div>
        <p>AI credit: {reviewPercent(selected.aiAverageCredit)} · Human credit: {reviewPercent(selected.humanAverageCredit)} · Mean credit gap: {gap(selected.averageAbsoluteCreditDifference)}</p>
        <div className="review-actions"><button className="outline-button" onClick={()=>explore(selected)}>Open reviewed evaluations</button><button className="outline-button" disabled={!selected.disagreements} onClick={()=>explore(selected,'disagreements')}>Open disagreements</button></div>
        <div className="reviewed-evaluation-links">{selected.evaluationIds.map((id,index)=><button className="coverage-drill" key={id} onClick={()=>explore(selected,'',id)}>Open reviewed evaluation {index+1} →</button>)}</div>
        <details><summary>Advanced details</summary><p>Form reference: {selected.formRef}</p><ol>{selected.evaluationIds.map(id=><li key={id}>{id}</li>)}</ol></details>
      </section>}
    </div>}
    <p className="field-note">Diagnostic evidence from completed reviews. Exact agreement is descriptive; sample size does not establish statistical confidence or causality. Human scores do not replace Quality KPIs. Confidence is not accuracy or human agreement.</p>
  </div>
}
