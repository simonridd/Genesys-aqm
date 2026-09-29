import type { EvaluationForm, ScorecardItem } from './types'

/** Screenshot/OCR-derived AQM adaptation. Source IDs and conditional logic require verification. */
const binary = (section: string, groupWeight: number, id: string, title: string, instructions: string, sourceMax: 1|5, enabled: boolean, na = false): ScorecardItem => ({
  id, title, instructions, section, sourceGroupWeight: groupWeight, type: 'choice', weight: 1, enabled,
  options: [
    { key: 'yes', label: 'Yes', description: 'The described behaviour is present.', credit: 1, sourceValue: sourceMax },
    { key: 'no', label: 'No', description: 'The described behaviour is absent.', credit: 0, sourceValue: 0 },
    ...(na ? [{ key: 'not_applicable', label: 'Not applicable', description: 'The condition did not arise in this conversation.' }] : []),
  ],
})
const fivePoint = (section: string, groupWeight: number, id: string, title: string, instructions: string): ScorecardItem => ({
  id, title, instructions, section, sourceGroupWeight: groupWeight, type: 'score', weight: 1, enabled: false,
  options: Array.from({ length: 5 }, (_, i) => ({ key: `level_${i+1}`, label: String(i+1), description: i === 0 ? 'Needs development.' : i === 4 ? 'Excellent.' : `Level ${i+1} of 5.`, credit: (i+1)/5, sourceValue: i+1 })),
})

export const genesysCustomerServiceForm: EvaluationForm = {
  id: 'genesys_customer_service_ai_scoring',
  sourceFormId: 'e28b6669-c596-4ef0-babd-8d449caea7e6',
  origin: 'genesys-recreated',
  name: 'Customer Service - AI Scoring',
  description: 'Recreated from a Genesys form photo and approximate OCR. Review wording, scoring, conditions and group weights before enabling.',
  version: 1,
  enabled: false,
  scoring: { yesThreshold: .65, passScore: .7, criticalQuestionIds: ['dpa_validation', 'appropriate_solution'] },
  questions: [
    binary('Opening', 100, 'appropriate_greeting', 'Did the agent give the appropriate greeting to the customer?', 'Use a warm and polite opening, such as good morning/afternoon/evening, thanks for calling, and an offer to help.', 5, true),
    binary('Opening', 100, 'agent_name', 'Agent gives their name to the customer', 'The agent provides their name.', 1, true),
    binary('Opening', 100, 'dpa_validation', 'Did the agent inform the customer DPA validation is required?', 'The agent explains that data protection checks must be completed before discussing account details.', 5, true, true),
    binary('Opening', 100, 'address_first_line', 'Agent asks for the first line of the customer’s address', 'Verify against account details only when this check is required.', 1, false),
    binary('Opening', 100, 'mothers_maiden_name', 'Agent asks for the mother’s maiden name on the account', 'Verify against account details only when this check is required.', 1, false),
    binary('Opening', 100, 'account_last_four', 'Agent asks for the last four digits of the account number', 'Verify against account details only when this check is required.', 1, false),

    binary('Assisting The Customer', 100, 'apology', 'Did the agent apologise for the issue, inconvenience or cost associated with the problem?', 'The agent offers an apology and shows understanding of the customer’s issue or cost.', 5, true, true),
    fivePoint('Assisting The Customer', 100, 'ownership', 'The agent took ownership of the problem', 'Five is excellent; one needs development.'),
    binary('Assisting The Customer', 100, 'appropriate_solution', 'The agent provided the most appropriate solution', 'The customer is satisfied that this was the most appropriate solution.', 5, true, true),

    binary('Call Handling Skills', 100, 'hold_procedure', 'Agent followed the correct procedure for placing a customer on hold', 'When a hold is needed, the agent informs the customer and thanks them on return.', 5, true, true),
    fivePoint('Call Handling Skills', 100, 'knowledge', 'The agent displayed the correct level of knowledge to assist the customer', 'Five is excellent; one needs development. Add comments when reviewed manually.'),
    binary('Call Handling Skills', 100, 'plain_language', 'The agent simplified processes and policies for the customer', 'The agent avoids jargon and explains clearly.', 1, true),

    binary('Compliance & Closure', 1000, 'follow_up', 'The agent set up a follow-up appointment if necessary', 'The agent organises a follow-up where required.', 1, true, true),
    fivePoint('Compliance & Closure', 1000, 'closure_script', 'The agent followed the call closure script', 'The source form uses a 1–5 scale; exact script criteria need confirmation.'),
    binary('Compliance & Closure', 1000, 'anything_else', 'The agent asked whether the customer needed anything else', 'Ask if further assistance is needed before finishing the call.', 5, true, true),
    binary('Compliance & Closure', 1000, 'recommend_products', 'Did the agent recommend our products and services?', 'The source question has a visibility condition that AQM does not yet enforce. Review that condition before enabling.', 1, false, true),
    { id: 'call_reason', title: 'What was the call about? (Select all that apply)', instructions: 'Reference only. The source is a multi-select question; AQM does not yet reproduce its multi-select behaviour or scoring.', section: 'Compliance & Closure', sourceGroupWeight: 1000, type: 'choice', weight: 0, enabled: false, options: [
      { key: 'billing_query', label: 'Billing Query', description: 'The call concerned billing.' },
      { key: 'new_sale', label: 'New sale', description: 'The call concerned a new sale.' },
      { key: 'cancellation', label: 'Cancellation', description: 'The call concerned a cancellation.' },
      { key: 'complaint', label: 'Complaint', description: 'The call concerned a complaint.' },
    ] },
  ],
}
