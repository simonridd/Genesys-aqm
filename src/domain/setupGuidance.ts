import type { EvaluationForm, InteractionPolicy } from './types'
import type { Schedule } from '../server/schedules'
import type { OverviewRun } from './overview'
import { isOperationalForm } from './formLifecycle'
import { validatePolicy } from './policyAuthoring'
/** Exact saved IDs are immutable published version pins, never local working forms. */
export function setupGuidance(forms:EvaluationForm[],policies:InteractionPolicy[],schedules:Schedule[],runs:OverviewRun[]){
 const published=forms.filter(isOperationalForm)
 const valid=policies.filter(policy=>policy.enabled&&policy.evaluationFormIds.length>0&&validatePolicy(policy,forms).length===0)
 const scheduled=schedules.filter(schedule=>schedule.enabled&&['DAILY','WEEKLY'].includes(schedule.frequency)&&valid.some(policy=>policy.id===schedule.policyId))
 const recorded=runs.filter(run=>run.trigger==='scheduled')
 return {form:published.length>0,policy:valid.length>0,schedule:scheduled.length>0,firstRun:recorded.some(run=>['completed','partial-failure'].includes(run.status)),established:scheduled.length>0&&recorded.length>0,policyId:scheduled[0]?.policyId??valid[0]?.id}
}
