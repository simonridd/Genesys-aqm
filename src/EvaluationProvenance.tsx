import type { ReviewEvaluation } from './domain/reviews'
export function EvaluationProvenance({record:r}:{record:ReviewEvaluation}) {
 return <details className="advanced-details evaluation-provenance"><summary>Evaluation provenance</summary><dl className="technical-values">
  <dt>Evaluation ID</dt><dd>{r.id}</dd><dt>Conversation ID</dt><dd>{r.conversationId}</dd><dt>Policy run ID</dt><dd>{r.policyRunId??'Not recorded'}</dd>
  <dt>Agent ID</dt><dd>{r.agent.id}</dd><dt>Queue</dt><dd>{r.queue}</dd><dt>Evaluated at</dt><dd>{r.evaluatedAt}</dd><dt>Policy references</dt><dd>{r.policyMatches.map(p=><div key={p.policyId}>{p.policyName}: {p.policyId}</div>)}</dd>
  <dt>AI provider</dt><dd>{r.provider}</dd><dt>AI model</dt><dd>{r.model}</dd><dt>Execution mode</dt><dd>{r.executionMode??'manual'}</dd>
  <dt>Source</dt><dd>{r.source} · {r.conversationSource??'Not recorded'}</dd><dt>Form reference</dt><dd>{r.form.id}@{r.form.version}</dd><dt>Provider request count</dt><dd>{r.source==='synthetic-demo'?0:r.providerRequestCount??'Not recorded (legacy)'}</dd>
  <dt>Reviewer ID</dt><dd>{r.humanReview?.reviewer?.userId??'Not recorded'}</dd><dt>Assignee ID</dt><dd>{r.humanReview?.assignment?.assignee.userId??'Unassigned'}</dd>
 </dl></details>
}
