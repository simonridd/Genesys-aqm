import { coverageRate } from './domain/analytics'
import { coverageSteps,coverageInterpretation,coverageObservationCopy,failedEvaluationAttemptsCopy,qualityPercent,type CoverageCounts } from './analyticsPresentation'
export function CoverageFunnel({counts,showGaps=false,observations=true}:{counts:CoverageCounts;showGaps?:boolean;observations?:boolean}){
 const interpretation=showGaps?coverageInterpretation(counts):null
 return <div className="coverage-funnel">
  <p className="field-note">{counts.candidate} interactions considered (Candidates) · {counts.eligible} met policy criteria</p>
  <ol aria-label="Coverage funnel">{coverageSteps(counts).map(step=><li key={step.label}><strong>{step.label}</strong><b>{step.count}</b><span>{step.rate===null?'':`${qualityPercent(step.rate)} · `}{step.detail}</span></li>)}</ol>
  <p><strong>Evaluation coverage: {qualityPercent(coverageRate(counts.evaluated,counts.eligible))}</strong> · Evaluated / eligible</p>
  <div className="coverage-attempts"><p>Failed evaluation attempts: <strong>{counts.failed}</strong></p><p className="field-note">{failedEvaluationAttemptsCopy}</p></div>
  {observations&&<p className="field-note">{coverageObservationCopy}</p>}
  {interpretation&&<div className="coverage-interpretation">
   <div className="coverage-selection"><h3>Policy selection</h3><p>{interpretation.selection.description}</p>{interpretation.selection.summary&&<p>{interpretation.selection.summary}</p>}{interpretation.selection.note&&<p className="field-note">{interpretation.selection.note}</p>}</div>
   <div className="coverage-after-selection"><h3>Coverage after sampling</h3>{interpretation.afterSelection.map(text=><p key={text}>{text}</p>)}</div>
  </div>}
 </div>
}
