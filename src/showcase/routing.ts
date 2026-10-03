export type Entry = 'welcome' | 'demo' | 'live'
export function entryRoute(query: URLSearchParams, connected = false): Entry {
  if (query.get('page') === 'demo') return 'demo'
  if (['code', 'state', 'error', 'evaluationId', 'policyId', 'runId'].some(key => query.has(key))) return 'live'
  if (query.get('page') === 'welcome') return 'welcome'
  if (query.has('page') || query.has('settingsSection')) return 'live'
  return connected ? 'live' : 'welcome'
}
export function demoStep(query: URLSearchParams): number {
  const value = Number(query.get('step') ?? 1)
  return Number.isInteger(value) && value >= 1 && value <= 7 ? value : 1
}
