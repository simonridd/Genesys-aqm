import type { Scorecard, ScorecardItem } from './types'
const binary = (id: string, title: string, instructions: string, weight = 1): ScorecardItem => ({ id, title, instructions, type: 'noul', options: [], weight, enabled: true })
const rubric = (id: string, title: string, instructions: string, weight = 1): ScorecardItem => ({
  id, title, instructions, type: 'score', weight, enabled: true,
  options: [
    { key: 'poor', label: 'Poor', description: 'Absent or counterproductive behaviour.', credit: 0 },
    { key: 'needs_improvement', label: 'Needs improvement', description: 'Some appropriate behaviour, with clear gaps.', credit: 0.33 },
    { key: 'good', label: 'Good', description: 'Appropriate and effective behaviour with minor gaps.', credit: 0.67 },
    { key: 'excellent', label: 'Excellent', description: 'Consistently clear, effective and considerate behaviour.', credit: 1 },
  ],
})
export const starterScorecard: Scorecard = {
  id: 'starter_qm', version: 1, title: 'Customer care essentials', threshold: 0.65,
  items: [
    binary('greeting', 'Warm opening', 'Did the agent greet the customer and offer help at the start of the conversation?'),
    binary('verification', 'Identity verification', 'Before discussing account-specific details, did the agent verify the customer’s identity? If no account-specific details were discussed, answer yes.', 1.5),
    rubric('understanding', 'Understanding the issue', 'How effectively did the agent establish and acknowledge the customer’s actual issue?', 1.2),
    binary('accuracy', 'Accurate information', 'Were the agent’s statements consistent with the facts available in the conversation, without an apparent factual error?', 1.5),
    rubric('empathy', 'Empathy', 'How well did the agent recognize the customer’s situation and respond with appropriate empathy?'),
    binary('ownership', 'Ownership', 'Did the agent take responsibility for progressing the customer’s issue rather than simply deflecting it?'),
    { id: 'resolution', title: 'Resolution', instructions: 'What is the best description of the issue outcome by the end of the conversation?', type: 'choice', weight: 1.5, enabled: true, options: [
      { key: 'fully_resolved', label: 'Fully resolved', description: 'The customer’s issue was resolved in the conversation.', credit: 1 },
      { key: 'partially_resolved', label: 'Partially resolved', description: 'Meaningful progress, but further action remains.', credit: 0.5 },
      { key: 'unresolved', label: 'Unresolved', description: 'The issue remained unresolved with no meaningful progress.', credit: 0 },
      { key: 'not_applicable', label: 'Not applicable', description: 'The conversation does not present a resolvable issue.', credit: undefined },
    ] },
    binary('next_steps', 'Clear next steps', 'Where further action was needed, did the agent state clear next steps? If no further action was needed, answer yes.'),
    rubric('professionalism', 'Professionalism', 'How consistently professional, clear and courteous was the agent’s communication?'),
    binary('closing', 'Appropriate close', 'Did the agent close the conversation politely and make clear that the exchange was ending?'),
  ],
}
export const newItem = (): ScorecardItem => ({ id: `question_${Date.now()}`, title: '', instructions: '', type: 'noul', options: [], weight: 1, enabled: true })
