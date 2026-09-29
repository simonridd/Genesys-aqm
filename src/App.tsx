import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import type { Conversation, EvaluationResult, Option, Scorecard, ScorecardItem } from './domain/types'
import { newItem, starterScorecard } from './domain/scorecard'
import { parseConversationJson, validateScorecard } from './domain/validation'
import { JevProxyProvider } from './provider/jev'

type Page = 'evaluate' | 'scorecard' | 'settings'
const proxyUrl = import.meta.env.VITE_JEV_PROXY_URL?.trim() ?? ''
const provider = new JevProxyProvider(proxyUrl)
const keyStorage = 'genesys-aqm-jev-key'
const scorecardStorage = 'genesys-aqm-scorecard'
const time = (value: string) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const date = (value: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
const pct = (value: number) => `${Math.round(value * 100)}%`
const icon: Record<Page, string> = { evaluate: '◈', scorecard: '▤', settings: '⚙' }

function readCard(): Scorecard {
  try {
    const raw = localStorage.getItem(scorecardStorage)
    if (raw) {
      const value = JSON.parse(raw) as Scorecard
      if (Array.isArray(value.items) && validateScorecard(value).length === 0) return value
    }
  } catch { /* use starter scorecard */ }
  return starterScorecard
}
function useKey() {
  const [key, setKey] = useState(() => sessionStorage.getItem(keyStorage) ?? '')
  const save = (value: string) => { sessionStorage.setItem(keyStorage, value.trim()); setKey(value.trim()) }
  const clear = () => { sessionStorage.removeItem(keyStorage); setKey('') }
  return { key, save, clear }
}
export function App() {
  const [page, setPage] = useState<Page>('evaluate')
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [sampleName, setSampleName] = useState('')
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [scorecard, setScorecard] = useState<Scorecard>(readCard)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluationError, setEvaluationError] = useState('')
  const { key, save, clear } = useKey()
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => { localStorage.setItem(scorecardStorage, JSON.stringify(scorecard)) }, [scorecard])
  const updateCard = (next: Scorecard) => { setScorecard({ ...next, version: scorecard.version + 1 }); setResult(null); setEvaluationError('') }
  const loadSample = async (name: string) => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}samples/${name}.json`)
      if (!response.ok) throw new Error('Sample unavailable.')
      const parsed = parseConversationJson(await response.text())
      if (!parsed.value) throw new Error(parsed.errors.join(' '))
      setConversation(parsed.value); setSampleName(name); setUploadErrors([]); setResult(null); setEvaluationError('')
    } catch { setUploadErrors(['Could not load the sample conversation. Please try again.']) }
  }
  useEffect(() => { void loadSample('billing-conversation') }, [])
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1_000_000) { setUploadErrors(['Choose a JSON file smaller than 1 MB.']); event.target.value = ''; return }
    const parsed = parseConversationJson(await file.text())
    if (parsed.value) { setConversation(parsed.value); setSampleName(''); setUploadErrors([]); setResult(null); setEvaluationError('') }
    else setUploadErrors(parsed.errors)
    event.target.value = ''
  }
  const evaluate = async () => {
    if (!conversation) return
    const issues = validateScorecard(scorecard)
    if (issues.length) { setEvaluationError(issues.join(' ')); return }
    if (!key) { setPage('settings'); return }
    setEvaluating(true); setEvaluationError(''); setResult(null)
    try { setResult(await provider.evaluate({ conversation, scorecard, evaluatedAt: new Date().toISOString(), version: 'v0' }, key)) }
    catch (error) { setEvaluationError(error instanceof Error ? error.message : 'Evaluation failed. Please try again.') }
    finally { setEvaluating(false) }
  }
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">G<span>·</span></div><div><strong>Genesys AQM</strong><small>QUALITY INTELLIGENCE</small></div></div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav aria-label="Primary navigation">{(['evaluate','scorecard','settings'] as Page[]).map(item => <button key={item} className={`nav-item ${page === item ? 'active' : ''}`} onClick={() => setPage(item)}><span className="nav-icon">{icon[item]}</span><span>{item[0].toUpperCase() + item.slice(1)}</span>{item === 'scorecard' && <em>{scorecard.items.filter(q => q.enabled).length}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-callout"><span className="sparkle">✦</span><strong>Powered by Jev</strong><p>Typed AI decisions, shaped into clear quality signals.</p></div><div className="version">V0 PROTOTYPE <span>•</span> 2026</div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>{page === 'evaluate' ? 'Evaluate conversation' : page === 'scorecard' ? 'Quality scorecard' : 'Settings'}</strong></div><div className="top-status"><span className={`status-dot ${key ? 'ready' : ''}`}/>{key ? 'Jev key configured' : 'Jev key needed'}</div></header>
      {page === 'evaluate' && <div className="page-content"><div className="page-heading"><div><div className="eyebrow">AUTOMATED QUALITY MANAGEMENT</div><h1>Conversation review</h1><p>Turn a customer conversation into a clear, structured quality assessment.</p></div><div className="page-heading-aside"><span>01</span><div><strong>Load a conversation</strong><small>Choose a sample or upload JSON</small></div></div></div>
        <div className="workspace-grid"><div className="left-column"><div className="source-card panel"><div className="panel-heading"><div><span className="mini-label">CONVERSATION SOURCE</span><h2>Choose a transcript</h2></div><span className="panel-glyph">↗</span></div><div className="source-controls"><button className={`sample-button ${sampleName === 'billing-conversation' ? 'selected' : ''}`} onClick={() => void loadSample('billing-conversation')}><span className="sample-emoji">◉</span><span><strong>Billing enquiry</strong><small>Resolved duplicate payment</small></span></button><button className={`sample-button ${sampleName === 'delivery-conversation' ? 'selected' : ''}`} onClick={() => void loadSample('delivery-conversation')}><span className="sample-emoji amber">◇</span><span><strong>Delayed delivery</strong><small>Follow-up required</small></span></button></div><div className="upload-row"><span>OR USE YOUR OWN DATA</span><button className="outline-button" onClick={() => fileInput.current?.click()}>↑ &nbsp;Upload JSON</button><input ref={fileInput} type="file" accept=".json,application/json" className="sr-only" onChange={upload} aria-label="Upload conversation JSON"/></div>{uploadErrors.length > 0 && <div className="inline-error" role="alert"><strong>Could not load conversation</strong><ul>{uploadErrors.map((e,i) => <li key={i}>{e}</li>)}</ul></div>}</div>
          {conversation && <Transcript conversation={conversation}/>}</div>
          <div className="right-column"><div className="evaluation-card panel"><div className="evaluation-card-top"><span className="mini-label">QUALITY ASSESSMENT</span><span className="pill subdued">{scorecard.items.filter(q => q.enabled).length} criteria</span></div><div className="evaluation-icon">✦</div><h2>Ready to evaluate</h2><p>Jev will assess the conversation against your quality scorecard. You’ll see typed results, probabilities and a weighted score.</p><div className="scorecard-summary"><span>ACTIVE SCORECARD</span><strong>{scorecard.title}</strong><small>{scorecard.items.filter(q => q.enabled).length} questions · Yes threshold {pct(scorecard.threshold)}</small><button onClick={() => setPage('scorecard')}>Edit scorecard <span>↗</span></button></div><button className="primary-button evaluate-button" onClick={() => void evaluate()} disabled={!conversation || evaluating}>{evaluating ? <><span className="spinner"/> Evaluating conversation…</> : <>✦ &nbsp;Evaluate conversation <span>→</span></>}</button>{!key && <p className="helper-text">Add your TypeSafe API key in Settings to evaluate.</p>}{!proxyUrl && <p className="helper-text">A Jev proxy deployment is required for this release.</p>}{evaluationError && <div className="inline-error" role="alert">{evaluationError}</div>}</div>
          {result ? <Results result={result} scorecard={scorecard}/> : <div className="insight-card"><div className="insight-icon">◎</div><div><strong>Decisions you can inspect</strong><p>Each result preserves Jev’s typed answer and uncertainty. The overall score is calculated locally from your weights.</p></div></div>}</div></div>
      </div>}
      {page === 'scorecard' && <ScorecardPage card={scorecard} onChange={updateCard}/>}
      {page === 'settings' && <SettingsPage apiKey={key} onSave={save} onClear={clear} onBack={() => setPage('evaluate')}/>}
    </main>
  </div>
}
function Transcript({ conversation }: { conversation: Conversation }) {
  return <section className="transcript panel" aria-label="Conversation transcript"><div className="transcript-header"><div className="conversation-avatar">{conversation.customer.name.split(' ').map(p => p[0]).join('').slice(0,2)}</div><div className="conversation-identity"><span className="mini-label">CONVERSATION TRANSCRIPT</span><h2>{conversation.customer.name} <span>with {conversation.agent.name}</span></h2><div className="meta-line">{date(conversation.startedAt)} <span>·</span> {conversation.channel} <span>·</span> {conversation.conversationId}</div></div><span className="pill">{conversation.metadata.status || 'Conversation'}</span></div><div className="metadata-bar">{Object.entries(conversation.metadata).filter(([key]) => key !== 'status').map(([key,value]) => <span key={key}><small>{key}</small><strong>{value}</strong></span>)}<span><small>Messages</small><strong>{conversation.messages.length}</strong></span></div><div className="messages"><div className="date-divider"><span>{date(conversation.startedAt)}</span></div>{conversation.messages.map(message => <div key={message.id} className={`message-row ${message.speaker}`}><div className="message-avatar">{message.speaker === 'agent' ? conversation.agent.name[0] : conversation.customer.name[0]}</div><div className="message-body"><div className="message-byline"><strong>{message.speaker === 'agent' ? conversation.agent.name : conversation.customer.name}</strong><time dateTime={message.timestamp}>{time(message.timestamp)}</time></div><div className="bubble">{message.text}</div></div></div>)}</div><div className="transcript-footer"><span className="status-dot ready"/> End of conversation <span>·</span> {conversation.messages.length} messages</div></section>
}
function Results({ result, scorecard }: { result: EvaluationResult; scorecard: Scorecard }) {
  return <section className="results panel" aria-label="Evaluation results"><div className="results-heading"><div><span className="mini-label">EVALUATION COMPLETE</span><h2>Quality results</h2><p>{result.model} · {time(result.evaluatedAt)}</p></div><span className="complete-mark">✓</span></div><div className="score-hero"><div className="score-ring" style={{ '--score': `${Math.round((result.overallScore ?? 0) * 100)}%` } as React.CSSProperties}><div><strong>{result.overallScore === null ? '—' : pct(result.overallScore)}</strong><small>OVERALL</small></div></div><div><strong>Weighted quality score</strong><p>{result.overallScore === null ? 'No questions had scorable credit.' : `Across ${result.questions.filter(q => q.credit !== null && q.weight > 0).length} scorable questions`}</p></div></div><div className="results-list"><h3>Criterion breakdown <span>{result.questions.length}</span></h3>{result.questions.map(q => <div key={q.id} className="result-item"><div className="result-item-top"><span className={`result-type ${q.type}`}>{q.type === 'noul' ? 'YES / NO' : q.type === 'choice' ? 'CHOICE' : 'SCORE'}</span><span className="result-weight">{q.weight}× weight</span></div><strong>{q.title}</strong><div className="result-outcome"><span className={`outcome ${q.type === 'noul' && q.outcome === 'No' ? 'negative' : ''}`}>{q.outcome}</span>{q.probability !== undefined && <small>{q.type === 'noul' ? `${pct(q.probability)} yes probability` : `${pct(q.probability)} selected probability`}</small>}{q.confidence !== undefined && <small>{pct(q.confidence)} confidence</small>}</div>{q.type === 'noul' && q.probability !== undefined && <div className="prob-track"><span style={{ width: pct(q.probability) }}/><i style={{ left: pct(scorecard.threshold) }}/></div>}{q.probabilities && <details className="distribution"><summary>Probability distribution</summary>{Object.entries(q.probabilities).map(([key,value]) => <div key={key}><span>{q.type === 'score' ? scorecard.items.find(i => i.id === q.id)?.options[Number(key)]?.label ?? key : scorecard.items.find(i => i.id === q.id)?.options.find(o => o.key === key)?.label ?? key}</span><b>{pct(value)}</b></div>)}</details>}<div className="result-contribution">{q.credit === null ? 'Excluded from overall score' : `Credit ${pct(q.credit)} · Contribution ${(q.weightedContribution ?? 0).toFixed(2)} / ${q.weight.toFixed(2)}`}</div></div>)}</div><details className="raw-response"><summary>Developer view · raw Jev response</summary><pre>{JSON.stringify(result.rawResponse, null, 2)}</pre></details></section>
}
function ScorecardPage({ card, onChange }: { card: Scorecard; onChange: (card: Scorecard) => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const updateByIndex = (index: number, item: ScorecardItem) => onChange({ ...card, items: card.items.map((q,i) => i === index ? item : q) })
  const move = (index: number, by: number) => { const items = [...card.items]; [items[index], items[index + by]] = [items[index + by], items[index]]; onChange({ ...card, items }) }
  const add = () => { const item = newItem(); onChange({ ...card, items: [...card.items, item] }); setOpen(card.items.length) }
  const issues = validateScorecard(card)
  return <div className="page-content narrow"><div className="page-heading"><div><div className="eyebrow">THE QUALITY FRAMEWORK</div><h1>Quality scorecard</h1><p>Define what good looks like. Jev answers each enabled criterion; your weights shape the final score.</p></div><button className="primary-button" onClick={add}>＋ &nbsp;Add question</button></div><div className="scorecard-configuration panel"><div><span className="mini-label">SCORECARD SETTINGS</span><h2>Your evaluation framework</h2></div><div className="settings-fields"><label>Scorecard name<input value={card.title} onChange={e => onChange({ ...card, title: e.target.value })}/></label><label>Yes threshold <span className="input-hint">{pct(card.threshold)}</span><input type="range" min="0" max="1" step="0.01" value={card.threshold} onChange={e => onChange({ ...card, threshold: Number(e.target.value) })}/></label></div><p className="field-note">A Noul at or above this yes probability becomes a “Yes” pass. The raw probability remains visible.</p></div>{issues.length > 0 && <div className="inline-error" role="alert"><strong>Review your scorecard</strong><ul>{issues.map((e,i) => <li key={i}>{e}</li>)}</ul></div>}<div className="question-list-header"><div><span className="mini-label">QUESTIONS</span><h2>{card.items.length} quality criteria</h2></div><span>Drag-free ordering with arrows</span></div><div className="question-list">{card.items.map((item,index) => <article key={`${index}-${item.id}`} className={`question-card panel ${!item.enabled ? 'disabled' : ''}`}><div className="question-summary"><span className="question-number">{String(index + 1).padStart(2,'0')}</span><div className="question-main"><div className="question-titles"><strong>{item.title || 'Untitled question'}</strong><span className={`type-chip ${item.type}`}>{item.type === 'noul' ? 'Yes / No' : item.type === 'choice' ? 'Multiple choice' : 'Ordered score'}</span></div><p>{item.instructions || 'Add a question to evaluate the conversation.'}</p></div><div className="question-actions"><label className="toggle" title="Enable question"><input type="checkbox" checked={item.enabled} onChange={e => updateByIndex(index, { ...item, enabled: e.target.checked })}/><span/></label><button className="icon-button" aria-label={`Move ${item.title} up`} disabled={index === 0} onClick={() => move(index,-1)}>↑</button><button className="icon-button" aria-label={`Move ${item.title} down`} disabled={index === card.items.length - 1} onClick={() => move(index,1)}>↓</button><button className="edit-button" onClick={() => setOpen(open === index ? null : index)}>{open === index ? 'Done' : 'Edit'}</button></div></div>{open === index && <QuestionEditor item={item} onUpdate={updated => updateByIndex(index, updated)} onDelete={() => { onChange({ ...card, items: card.items.filter((_,i) => i !== index) }); setOpen(null) }}/>}</article>)}</div><button className="add-row" onClick={add}>＋ &nbsp;Add another question</button></div>
}
function QuestionEditor({ item, onUpdate, onDelete }: { item: ScorecardItem; onUpdate: (item: ScorecardItem) => void; onDelete: () => void }) {
  const change = (patch: Partial<ScorecardItem>) => onUpdate({ ...item, ...patch })
  const updateOption = (index: number, patch: Partial<Option>) => change({ options: item.options.map((o,i) => i === index ? { ...o, ...patch } : o) })
  const setType = (type: ScorecardItem['type']) => change({ type, options: type === 'noul' ? [] : type === 'choice' ? [
    { key: 'option_a', label: 'Option A', description: 'Describe when this fits.', credit: 1 },
    { key: 'option_b', label: 'Option B', description: 'Describe when this fits.', credit: 0 },
  ] : [
    { key: 'poor', label: 'Poor', description: 'Below expected standard.', credit: 0 },
    { key: 'good', label: 'Good', description: 'Meets expected standard.', credit: 1 },
  ] })
  return <div className="question-editor"><div className="editor-grid"><label>Question ID<input value={item.id} onChange={e => change({ id: e.target.value })}/><small>Stable key: lowercase letters, numbers, underscores</small></label><label>Question type<select value={item.type} onChange={e => setType(e.target.value as ScorecardItem['type'])}><option value="noul">Yes / No · Noul</option><option value="choice">Multiple choice · Choice</option><option value="score">Ordered rubric · Score</option></select></label><label className="full">Title<input value={item.title} onChange={e => change({ title: e.target.value })}/></label><label className="full">Instructions / question<textarea rows={3} value={item.instructions} onChange={e => change({ instructions: e.target.value })}/></label><label>Weight<input type="number" min="0" step="0.1" value={item.weight} onChange={e => change({ weight: Number(e.target.value) })}/></label></div>{item.type !== 'noul' && <div className="options-editor"><div className="options-heading"><strong>{item.type === 'score' ? 'Ordered levels' : 'Choices'}</strong><small>Credit 0–1 affects the weighted score. Leave choice credit blank to exclude it.</small></div>{item.options.map((option,i) => <div className="option-row" key={i}><span>{String(i + 1).padStart(2,'0')}</span><input aria-label={`Option ${i+1} key`} placeholder="Key" value={option.key} onChange={e => updateOption(i, { key: e.target.value })}/><input aria-label={`Option ${i+1} label`} placeholder="Label" value={option.label} onChange={e => updateOption(i, { label: e.target.value })}/><input aria-label={`Option ${i+1} description`} placeholder="Description" value={option.description} onChange={e => updateOption(i, { description: e.target.value })}/><input aria-label={`Option ${i+1} credit`} type="number" min="0" max="1" step="0.01" placeholder="—" value={option.credit ?? ''} onChange={e => updateOption(i, { credit: e.target.value === '' ? undefined : Number(e.target.value) })}/><button className="icon-button" aria-label={`Remove option ${i+1}`} onClick={() => change({ options: item.options.filter((_,j) => j !== i) })}>×</button></div>)}<button className="outline-button" onClick={() => change({ options: [...item.options, { key: `option_${item.options.length + 1}`, label: '', description: '' }] })}>＋ Add {item.type === 'score' ? 'level' : 'choice'}</button></div>}<div className="editor-footer"><button className="danger-button" onClick={onDelete}>Delete question</button><span>Changes save locally in this browser.</span></div></div>
}
function SettingsPage({ apiKey, onSave, onClear, onBack }: { apiKey: string; onSave: (key: string) => void; onClear: () => void; onBack: () => void }) {
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')
  return <div className="page-content narrow"><div className="page-heading"><div><div className="eyebrow">CONNECTION & PRIVACY</div><h1>Settings</h1><p>Connect this prototype to TypeSafe Jev for live quality evaluations.</p></div></div><div className="settings-card panel"><div className="settings-header"><div className="settings-symbol">✦</div><div><span className="mini-label">TYPESAFE AI</span><h2>Jev API connection</h2></div><span className={`pill ${apiKey ? 'connected' : 'subdued'}`}>{apiKey ? 'Key configured' : 'Not configured'}</span></div><div className="settings-body"><div className="info-strip"><strong>Prototype credential handling</strong><p>Your key is stored only in this browser tab’s session storage and sent through the AQM proxy to TypeSafe when you evaluate. It is cleared when the tab session ends. The proxy does not store it. Browser developer tools and the proxy operator can access it; use a restricted demo key.</p></div><label className="api-key-label">TypeSafe Jev API key<div className="key-field"><input type="password" autoComplete="off" placeholder={apiKey ? '••••••••••••••••  Key saved for this session' : 'Paste your API key'} value={draft} onChange={e => { setDraft(e.target.value); setMessage('') }}/></div></label><div className="settings-actions"><button className="primary-button" disabled={!draft.trim()} onClick={() => { onSave(draft); setDraft(''); setMessage('Key saved for this tab session.') }}>Save key</button><button className="outline-button" disabled={!apiKey} onClick={() => { onClear(); setDraft(''); setMessage('Key cleared.') }}>Clear key</button></div>{message && <p className="success-message" role="status">✓ {message}</p>}</div></div><div className="settings-detail-grid"><InfoCard icon="◎" title="Jev proxy">The static site sends evaluations through a fixed-purpose proxy, which forwards them to TypeSafe. {proxyUrl ? 'Proxy configured for this release.' : 'The proxy is not configured for this release yet.'}</InfoCard><InfoCard icon="▤" title="Your scorecard">Edits are saved locally in this browser. They are not sent anywhere except as Jev questions when you evaluate.</InfoCard></div><button className="text-link" onClick={onBack}>← Back to conversation review</button></div>
}
function InfoCard({ icon: symbol, title, children }: { icon: string; title: string; children: ReactNode }) { return <div className="info-card"><span>{symbol}</span><strong>{title}</strong><p>{children}</p></div> }
