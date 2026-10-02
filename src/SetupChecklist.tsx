import { setupGuidance } from './domain/setupGuidance'
import type { EvaluationForm,InteractionPolicy } from './domain/types'
import type { Schedule } from './server/schedules'
import type { OverviewRun } from './domain/overview'
import { usePermission } from './GovernancePanel'
export function SetupChecklist({forms,policies,schedules,runs,onForms,onPolicies,onRuns}:{forms:EvaluationForm[];policies:InteractionPolicy[];schedules:Schedule[];runs:OverviewRun[];onForms:()=>void;onPolicies:(id?:string)=>void;onRuns:()=>void}){
 const state=setupGuidance(forms,policies,schedules,runs),author=usePermission('forms.write'),policyWrite=usePermission('policies.write')
 if(state.established)return null
 const steps=[{complete:state.form,label:'Publish an evaluation form',action:onForms,allowed:author},{complete:state.policy,label:'Create an enabled policy assigning that form',action:()=>onPolicies(),allowed:policyWrite},{complete:state.schedule,label:'Configure and enable a daily or weekly schedule',action:()=>onPolicies(state.policyId),allowed:policyWrite},{complete:state.firstRun,label:'Wait for / inspect the first automated run',action:onRuns,allowed:true}]
 return <section className="panel setup-checklist" aria-label="Set up automated quality monitoring"><h2>Set up automated quality monitoring</h2><p>Progress from your saved configuration. {(!author||!policyWrite)&&'An author or administrator can complete configuration.'}</p><ul>{steps.map(step=><li key={step.label}><span aria-label={step.complete?'Complete':'Incomplete'}>{step.complete?'✓':'○'}</span> {step.complete||!step.allowed?step.label:<button className="text-link" onClick={step.action}>{step.label} →</button>}</li>)}</ul></section>
}
