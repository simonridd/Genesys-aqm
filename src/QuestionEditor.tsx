import type { ReactNode } from 'react'
import { OptionEditor } from './OptionEditor'
import { answerFormat, answerSummary } from './authoringPresentation'
import type { ScorecardItem } from './domain/types'
export interface QuestionEditorContext { answers?:ReactNode; applicability?:ReactNode; organization?:ReactNode; readOnly?:boolean }
export function QuestionEditor({item,onUpdate,onDelete,answers,applicability,organization,readOnly=false}:{item:ScorecardItem;onUpdate:(item:ScorecardItem)=>void;onDelete:()=>void}&QuestionEditorContext) {
 const change=(patch:Partial<ScorecardItem>)=>onUpdate({...item,...patch})
 const setType=(type:ScorecardItem['type'])=>{if(item.sourceAnswerSet)return;change({type,options:type==='noul'?[]:type==='choice'?[
 {key:'option_a',label:'Option A',description:'Describe when this fits.',credit:1},{key:'option_b',label:'Option B',description:'Describe when this fits.',credit:0}
 ]:[{key:'poor',label:'Poor',description:'Below expected standard.',credit:0},{key:'good',label:'Good',description:'Meets expected standard.',credit:1}]})}
 return <div className="question-editor">{readOnly?<><h3>Question</h3><p>{item.instructions}</p><p>{answerFormat(item.type)} · Weight {item.weight} · {item.enabled?'Enabled':'Disabled'}</p></>:<><h3>Question</h3><div className="editor-grid"><label className="full">Title<input value={item.title} onChange={e=>change({title:e.target.value})}/></label><label className="full">Instructions / question<textarea rows={3} value={item.instructions} onChange={e=>change({instructions:e.target.value})}/></label><label>Answer format<select disabled={!!item.sourceAnswerSet} value={item.type} onChange={e=>setType(e.target.value as ScorecardItem['type'])}><option value="noul">Yes / No</option><option value="choice">Multiple choice</option><option value="score">Ordered scale</option></select></label></div></>}
 {answers}{item.type!=='noul'&&<details className="inline-answers"><summary>{readOnly||item.sourceAnswerSet?'View answers':'Edit answers'} · {answerSummary(item)}</summary><OptionEditor type={item.type} options={item.options} readOnly={readOnly||!!item.sourceAnswerSet} onChange={options=>change({options})}/></details>}
 {!readOnly&&<><h3>Scoring</h3><div className="editor-grid"><label>Weight<input type="number" min="0" step="0.1" value={item.weight} onChange={e=>change({weight:Number(e.target.value)})}/></label><label><input type="checkbox" checked={item.enabled} onChange={e=>change({enabled:e.target.checked})}/> Enabled</label></div></>}
 <h3>Applicability</h3>{applicability}
 <details className="advanced-details"><summary>Advanced details</summary><div className="editor-grid"><label>Stable question ID<input readOnly={readOnly} defaultValue={item.id} key={item.id} onBlur={e=>{if(e.target.value!==item.id)change({id:e.target.value})}}/><small>Conditions use this ID. Changing the title keeps it unchanged.</small></label></div>{item.sourceAnswerSet&&<p>Answer Set provenance: {JSON.stringify(item.sourceAnswerSet)}</p>}{item.sourceAssetQuestionId&&<p>Original group question ID: {item.sourceAssetQuestionId}</p>}{item.sourceGroupWeight!==undefined&&<p>Original group weight: {item.sourceGroupWeight}</p>}</details>
 {organization}{!readOnly&&<div className="editor-footer"><button className="danger-button" onClick={onDelete}>Delete question</button></div>}
 </div>
}
