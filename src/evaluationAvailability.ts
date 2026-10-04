/** The existing list query, in one place. Dates are UI calendar days in UTC. */
export const evaluationQueryKeys = ['form','agent','queue','channel','cohort','outcome','question','policy','source','mode','critical','reviewStatus','assignment','due','dueState','reviewQueue','reviewQuestion','comparison','from','to'] as const
export type EvaluationQuery = Record<typeof evaluationQueryKeys[number], string>
export function evaluationQueryParams(query: EvaluationQuery) {
  const params = new URLSearchParams()
  for (const key of evaluationQueryKeys) {
    const value = query[key]
    if (value) params.set(key, key === 'from' ? `${value}T00:00:00.000Z` : key === 'to' ? `${value}T23:59:59.999Z` : value)
  }
  return params
}
export function evaluationRequestUrl(origin: string, query: EvaluationQuery, cursor?: string) {
  const url = new URL(`${origin}/api/evaluations`)
  url.searchParams.set('limit', '50')
  if (cursor) url.searchParams.set('cursor', cursor)
  for (const [key,value] of evaluationQueryParams(query)) url.searchParams.set(key,value)
  return url.href
}
// The URL is the deterministic request identity: every authoritative filter and cursor.
export type EvaluationRequestKind = 'scope' | 'refresh' | 'next' | 'first'
export interface EvaluationFailure { technical: string; status?: number }
export function evaluationFailureCopy(failure: EvaluationFailure, kind: EvaluationRequestKind, mine: boolean, scoped: boolean) {
  if (failure.status === 401 || failure.status === 403) return 'Your session no longer has access to these evaluations.'
  if (kind === 'refresh') return 'Couldn’t refresh evaluations.'
  if (kind === 'next') return 'Couldn’t load the next page.'
  if (kind === 'first') return 'Couldn’t load the first page.'
  if (mine) return 'Your review queue could not be loaded.'
  return scoped ? 'Evaluations could not be loaded for this scope.' : 'Evaluations could not be loaded.'
}
export function evaluationEmptyCopy(mine: boolean) {
  return mine ? 'No reviews need your attention in this scope.' : 'No evaluations match this scope.'
}

/** Originating evidence supplies human labels even when the destination list is unavailable.
 * Labels are presentation context only and can never redefine a query value. */
export const evaluationScopeLabelsKey = 'evaluation.scopeLabels'
export function withEvaluationScopeLabels<T extends Record<string,string>>(filters: T, labels: Record<string,string>) {
  const context = Object.fromEntries(Object.entries(labels).filter(([key,label])=>filters[key]&&label).map(([key,label])=>[key,{value:filters[key],label}]))
  return {...filters,[evaluationScopeLabelsKey]:JSON.stringify(context)}
}
export function evaluationScopeLabel(params: URLSearchParams, key: string, value: string): string | undefined {
  try {
    const item = JSON.parse(params.get(evaluationScopeLabelsKey)??'{}')[key]
    return item?.value===value&&typeof item.label==='string' ? item.label : undefined
  } catch { return undefined }
}
