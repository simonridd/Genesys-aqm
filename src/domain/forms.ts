import { genesysCustomerServiceForm } from './genesysForm'
import type { EvaluationForm, Scorecard, ScorecardItem } from './types'
import { starterScorecard } from './scorecard'
const yes = (id: string, title: string, instructions: string, weight = 1): ScorecardItem => ({ id, title, instructions, type: 'noul', options: [], weight, enabled: true })
const scale = (id: string, title: string, instructions: string, weight = 1): ScorecardItem => ({ id, title, instructions, weight, enabled: true, type: 'score', options: [
  { key: 'poor', label: 'Poor', description: 'Absent or counterproductive.', credit: 0 },
  { key: 'limited', label: 'Limited', description: 'Partial with material gaps.', credit: 0.33 },
  { key: 'good', label: 'Good', description: 'Effective with minor gaps.', credit: 0.67 },
  { key: 'excellent', label: 'Excellent', description: 'Consistently effective.', credit: 1 },
] })
const choice = (id: string, title: string, instructions: string, options: ScorecardItem['options'], weight = 1): ScorecardItem => ({ id, title, instructions, type: 'choice', options, weight, enabled: true })
export const seedForms: EvaluationForm[] = [
  { id: 'general_service', name: 'General Customer Service', description: 'Opening, understanding, ownership, resolution and close.', version: 1, enabled: true, questions: starterScorecard.items.filter(q => q.id !== 'verification'), scoring: { yesThreshold: .65, passScore: .7, criticalQuestionIds: [] } },
  { id: 'compliance_identity', name: 'Compliance & Identity Verification', description: 'Account access and disclosure safeguards.', version: 1, enabled: true, questions: [
    yes('identity_before_disclosure', 'Verify before disclosure', 'Before disclosing account-specific information, did the agent complete identity verification? If no disclosure occurred, answer yes.', 2),
    yes('verification_appropriate', 'Appropriate checks', 'Did the agent request and check appropriate identity details without asking for a full password or payment card number?', 1.5),
    yes('failed_check_safe', 'Failed check handled safely', 'If verification failed, did the agent withhold protected information and explain the safe next step? If it did not fail, answer yes.', 2),
    scale('privacy_language', 'Privacy explanation', 'How clearly did the agent explain why identity checks were necessary?'),
    yes('record_accuracy', 'Accurate account statements', 'Were account-specific statements limited to verified and supported facts?')
  ], scoring: { yesThreshold: .7, passScore: .8, criticalQuestionIds: ['identity_before_disclosure', 'failed_check_safe'] } },
  { id: 'complaints', name: 'Complaints Handling', description: 'Acknowledgement, fair investigation and transparent next steps.', version: 1, enabled: true, questions: [
    scale('complaint_acknowledgement', 'Acknowledgement', 'How well did the agent recognise the complaint and its impact?'),
    yes('complaint_ownership', 'Complaint ownership', 'Did the agent take ownership or clearly identify who would handle the complaint?', 1.5),
    scale('investigation', 'Investigation', 'How thoroughly did the agent gather relevant facts before deciding what to do?', 1.5),
    choice('complaint_outcome', 'Complaint outcome', 'What was achieved by the end?', [{key:'resolved',label:'Resolved',description:'A clear remedy was agreed.',credit:1},{key:'progress',label:'Progress',description:'A concrete investigation and next step was agreed.',credit:.5},{key:'none',label:'No progress',description:'No meaningful remedy or next step.',credit:0}], 1.5),
    yes('complaint_timeline', 'Clear timeline', 'Did the agent provide a realistic timeline and reference or follow-up route?')
  ], scoring: { yesThreshold: .65, passScore: .7, criticalQuestionIds: [] } },
  { id: 'retention', name: 'Retention / Cancellation', description: 'Respectful discovery and clear cancellation choices.', version: 1, enabled: true, questions: [
    yes('respect_choice', 'Respect customer choice', 'Did the agent respect the stated cancellation preference without pressure?', 2),
    scale('retention_discovery', 'Reason discovery', 'How effectively did the agent understand the reason for leaving?'),
    yes('offer_accuracy', 'Accurate offer', 'Were any retention offer terms stated clearly and without unsupported promises?', 1.5),
    choice('cancellation_outcome', 'Cancellation outcome', 'What happened?', [{key:'completed',label:'Completed',description:'Requested action completed or accepted alternative confirmed.',credit:1},{key:'pending',label:'Pending',description:'Action awaiting a specific next step.',credit:.5},{key:'blocked',label:'Blocked',description:'No clear progress on the request.',credit:0}], 1.5),
    yes('confirmation', 'Confirmation', 'Did the agent confirm the decision and any effective date or next step?')
  ], scoring: { yesThreshold: .65, passScore: .7, criticalQuestionIds: ['respect_choice'] } },
  { id: 'sales_service', name: 'Sales / Service Quality', description: 'Needs-led recommendation and transparent terms.', version: 1, enabled: true, questions: [
    scale('needs_discovery', 'Needs discovery', 'How well did the agent understand the customer’s needs before recommending a product?', 1.5),
    yes('relevant_recommendation', 'Relevant recommendation', 'Was the recommendation linked to the needs the customer expressed?'),
    yes('terms_clear', 'Clear terms', 'Were price, limitations and important terms clearly disclosed?', 2),
    scale('customer_agency', 'Customer agency', 'How well did the agent give the customer space to decide without pressure?'),
    yes('sales_next_steps', 'Next steps', 'Were purchase or follow-up steps made clear?')
  ], scoring: { yesThreshold: .7, passScore: .75, criticalQuestionIds: ['terms_clear'] } },
  genesysCustomerServiceForm,
]
export function toScorecard(form: EvaluationForm): Scorecard { return { id: form.id, version: form.version, title: form.name, threshold: form.scoring.yesThreshold, items: form.questions } }
export function validateForm(form: EvaluationForm): string[] {
  const errors: string[] = []
  if (!form.id.trim() || !form.name.trim()) errors.push('Form needs an ID and name.')
  if (!Number.isInteger(form.version) || form.version < 1) errors.push('Form version must be a positive integer.')
  if (!Number.isFinite(form.scoring.passScore) || form.scoring.passScore < 0 || form.scoring.passScore > 1) errors.push('Pass score must be between 0 and 1.')
  for (const id of form.scoring.criticalQuestionIds) if (!form.questions.some(q => q.id === id)) errors.push(`Critical question ${id} does not exist.`)
  if (form.questions.some(question=>question.enabled && question.condition)) errors.push('Conditional questions are specified but cannot be published or evaluated until conditional execution is implemented.')
  return errors
}
