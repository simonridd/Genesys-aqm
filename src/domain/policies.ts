import type { Conversation, InteractionPolicy, PolicyCondition, PolicyField, PolicyMatch } from './types'
export const seedPolicies: InteractionPolicy[] = [
  { id: 'service_messaging', name: 'Customer Service Messaging', description: 'General quality and identity checks for messaging.', enabled: true, criteria: { anyOf: [[{field:'channel',operator:'equals',value:'messaging'},{field:'queue',operator:'equals',value:'Customer Service'}]] }, evaluationFormIds: ['general_service','compliance_identity'], sampling: {strategy:'all'}, schedule:'manual' },
  { id: 'complaint_route', name: 'Complaints', description: 'Complaints across channels.', enabled: true, criteria: { anyOf: [[{field:'topic',operator:'equals',value:'Complaint'}],[{field:'queue',operator:'equals',value:'Complaints'}]] }, evaluationFormIds: ['complaints','general_service'] },
  { id: 'cancellation_route', name: 'Cancellation & Retention', description: 'Cancellation and retention journeys.', enabled: true, criteria: { anyOf: [[{field:'topic',operator:'equals',value:'Cancellation'}],[{field:'queue',operator:'equals',value:'Retention'}]] }, evaluationFormIds: ['retention','general_service'] },
  { id: 'secure_access', name: 'Security Reviews', description: 'Identity and access interactions.', enabled: true, criteria: { anyOf: [[{field:'topic',operator:'equals',value:'Security'}],[{field:'tag',operator:'includes',value:'verification'}]] }, evaluationFormIds: ['compliance_identity'] },
  { id: 'sales_quality', name: 'Sales & Service', description: 'Needs-led sales quality.', enabled: true, criteria: { anyOf: [[{field:'queue',operator:'equals',value:'Sales'}],[{field:'topic',operator:'equals',value:'Sales'}]] }, evaluationFormIds: ['sales_service','general_service'] },
  { id: 'sample_monitoring', name: 'Cross-channel monitoring sample', description: 'Demonstrates reproducible sampling across service conversations.', enabled: true, criteria: { anyOf: [[{field:'channel',operator:'equals',value:'messaging'}],[{field:'channel',operator:'equals',value:'voice'}],[{field:'channel',operator:'equals',value:'chat'}],[{field:'channel',operator:'equals',value:'email'}]] }, evaluationFormIds: ['general_service'], sampling: {strategy:'percentage',percentage:50}, schedule:'manual' },
]
export function policyValue(conversation: Conversation, field: PolicyField): string {
  return field === 'channel' ? conversation.channel : field === 'agent' ? conversation.agent.id : conversation.metadata[field] ?? ''
}
export function conditionMatches(conversation: Conversation, condition: PolicyCondition): boolean {
  const actual = policyValue(conversation, condition.field).toLowerCase()
  const expected = condition.value.trim().toLowerCase()
  if (!expected) return false
  return condition.operator === 'equals' ? actual === expected : actual.split(/[,;|]/).some(part => part.trim() === expected)
}
export function matchPolicies(conversation: Conversation, policies: InteractionPolicy[]): PolicyMatch[] {
  return policies.flatMap(policy => {
    if (!policy.enabled) return []
    const matchedGroup = policy.criteria.anyOf.find(group => group.length > 0 && group.every(condition => conditionMatches(conversation, condition)))
    return matchedGroup ? [{ policyId: policy.id, policyName: policy.name, matchedGroup }] : []
  })
}
export function assignedFormIds(matches: PolicyMatch[], policies: InteractionPolicy[]): string[] {
  return [...new Set(matches.flatMap(match => policies.find(policy => policy.id === match.policyId)?.evaluationFormIds ?? []))]
}
