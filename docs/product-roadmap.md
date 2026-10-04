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
