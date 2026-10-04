# Product roadmap

## Implemented in V0.19 — Reusable Answer Sets

Status: **IMPLEMENTED IN V0.19**. Reusable Answer Sets now support versioned choice/score authoring reuse, explicit snapshot updates and independent historical evaluations. Implementation and proof: [V0.19 documentation](v019-reusable-answer-sets.md).

### Problem and user value

Authors repeat the same choices and rating scales across questions. Maintaining those copies by hand creates inconsistent labels, descriptions and credit. Define a reusable set once, insert it into multiple questions, and deliberately adopt newer versions without changing historical evaluations.

Examples:

- Service quality: Excellent / Good / Adequate / Poor.
- Compliance: Fully compliant / Minor issue / Material issue.
- Customer effort: Very low / Low / Moderate / High / Very high.

Supported bases: Multiple choice (`choice`) and ordered score (`score`). This is an authoring object, not a new runtime question type.

### Implemented model

```ts
AnswerSetAsset {
  id
  familyId
  name
  description
  version
  type: 'choice' | 'score'
  options
  status: 'DRAFT' | 'PUBLISHED' | 'RETIRED'
  createdAt
  updatedAt
  publishedAt?
}

// Optional question provenance:
sourceAnswerSet?: {
  familyId
  answerSetId
  answerSetVersion
}

// Always retained on the question:
options: [...] // authoritative copied snapshot
```

For `choice`, each option retains `key`, `label`, `description` and `credit`. For `score`, preserve ordered options and existing `sourceValue`/credit semantics. The scoring contract stays on the copied question options. There is no separate scoring lookup at runtime, and runtime evaluation never fetches an Answer Set.

### Snapshot and versioning semantics

Mirror Reusable Question Groups. Inserting Published v1 copies options into a question and records provenance. Publishing v2 does not change existing forms. A DRAFT/TESTING form can explicitly update to v2 after previewing the differences. Published forms remain immutable; EvaluationRecords continue to contain the exact form snapshot.

A published version cannot change to an incompatible base type. Updating provenance must verify the question base type, preserve stable option keys/source values where compatible, and flag any broken conditional references before publication. Detaching removes provenance but preserves options and scoring. Retiring prevents new insertion while leaving existing snapshots valid.

### Author experience

Question type: Multiple choice. Answers: **Use reusable answer set**. Selected: **Resolution clarity v2**.

| Preview | Credit |
|---|---:|
| Clear | 100% |
| Mostly clear | 75% |
| Partly clear | 50% |
| Unclear | 0% |

Actions: Detach; Update to newer version; Save as reusable answer set. No automatic propagation into forms and no runtime dependence on the library.

### Implementation and dependencies

Implemented in V0.19: model/validation and library lifecycle; durable definition storage and existing form-authoring permissions; authoring selection/preview/update/detach/save-as; full composition compatibility checks; JSON portability; safe audit/history; deterministic runtime-equivalence proof and authenticated provider-free browser journeys.

Depend on existing Reusable Question Group lifecycle patterns, V0.18 definition authority and save protection, immutable form publication, option validation, conditional-question references, audit and exact evaluation snapshots. SourceValue and credit compatibility are proven against existing choice/score evaluation and human-review paths.

### Compatibility and non-goals

Old forms without provenance keep working. Existing choice/score scoring, provider mapping, condition evaluation, human review and analytics consume the embedded options unchanged. No new runtime question type, provider/schema changes, live library lookup, auto-update of published forms, historical re-scoring, separate runtime scoring table, or implementation in the showcase tranche.

## V0.20A — Answer Set discovery

Implemented: authors can discover a published reusable standard before knowing its stored answer format, including from a new Yes / No question. The picker searches all published sets in the current authority and visibly labels Multiple choice or Ordered scale. Cross-format adoption requires an explicit preview/action, preserves ordinary question fields, copies the authoritative answer snapshot and fails closed on invalid dependent conditions. Same-format attach, version update/detach, saved/local authority and historical snapshots are preserved. See [implementation and evidence](v020a-answer-set-discovery.md).

## V0.20B — Calibration discovery and disagreement investigation

Implemented and qualified: historical human form/version selection from completed-review evidence, an independently scoped catalogue, highest observed question-level disagreement with a comparable sample denominator, exact reviewed-evaluation investigation, durable URL/return state, mobile question cards and keyboard focus. Existing calibration math, review contracts and backend remain unchanged. 47 focused deterministic, 12 Calibration browser, 27 current-contract regression and 12 public fixture checks pass; all 12 Pages files/tree match the tested commit and preservation hashes match. See [implementation and evidence](v020b-calibration-discovery.md).

## V0.20C — Evaluation availability & recovery

Implemented and qualified: authoritative server list state distinguishes loading, successful empty, unavailable and retained-page recovery. Exact scope retries, refresh timestamps, atomic pagination, race guards and isolated detail/action errors protect investigation and reviewer trust. 105 deterministic, 23 recovery browser, 38 focused regression and one reviewer-card check pass. Frontend only; backend and review contracts unchanged. All 12 Pages files/tree match the tested commit; 23 public recovery checks and production preservation pass. See [implementation and evidence](v020c-evaluation-availability.md).

## V0.20D — Investigation browser history

Implemented and qualified: Analytics investigation drills push one guarded Evaluation destination, preserving the final source URL for exact Back/Forward restoration of Questions, queue/group views, critical cohorts and form versions. Filter edits remain replace-only; Calibration push behavior, explicit safe return URLs, authoring guards, reviewer drafts and Evaluation recovery remain intact. Overview's non-durable dashboard context remains outside this tranche. Frontend only. See [implementation and evidence](v020d-investigation-history.md).

## V0.20E — Overview first-scan hierarchy

Implemented: Attention remains first; Quality, Coverage, Review Work and Automation Health are surfaced in one first-scan region. Trend and full coverage details move below. Backend metrics/contracts are unchanged. See [implementation and evidence](v020e-overview-first-scan.md).

## V0.20F — User-facing language & technical detail hierarchy

Implemented and qualified: Conversation detail leads with messages and human metadata; Policies use saved/local product language and readable exact-version assignments; Evaluations/Human review use human status labels and ordinary filters. Closed native disclosures retain exact references, IDs and evaluation provenance. Frontend only; contracts, review safety and definition authority remain unchanged. Local/public fixture checks, complete Pages byte/tree equality and read-only production preservation pass. See [implementation and evidence](v020f-user-language.md).

## V0.20G — Coverage interpretation

Implemented shared Policy selection and Coverage after sampling headings, with deliberate sampling explained independently of content/completion gaps and failed attempt units. Funnel metrics/denominators remain unchanged; Overview's compact first scan and closed details, Analytics drills/history, and run detail are preserved. Qualified with 691 deterministic tests, 28 Coverage browser checks and 17 focused regressions across desktop/mobile. Frontend-only Pages publication; backend remains aqm-api-v019-e92f2d6. See [qualification and evidence](v020g-coverage-interpretation.md).

## V0.20H — Calculator whole-conversation assumption

Resolved F10's scoped calculator ambiguity: visible monthly whole-conversation floor/cost assumption and a contextual explanation for positive selection below one conversation. Estimator, defaults, fractional form/request averages, positive sub-cent cost copy, bounds, pricing and exclusions remain unchanged. Focused deterministic, browser, mobile, keyboard, resize and showcase smoke proof; frontend-only Pages publication with read-only production preservation. No whole-product perfection or release claim. See [V0.20H evidence](v020h-calculator-rounding.md). Next: ChatGPT review/merge and F1–F10 closure decision; fresh review or V0.20 tag/release remains a separate decision.
