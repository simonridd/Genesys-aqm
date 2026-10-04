# V0.20B — Calibration discovery and disagreement investigation

Canonical base: `4d65c6f76f1ae2b82b01d9f7cdff718c8d8d55a3`. Branch: `codex/aqm-v020b-calibration-discovery`. Frontend-only; no API route, schema, review storage/lifecycle, aggregation or provider implementation change. The backend remains `aqm-api-v019-e92f2d6`. No PR, merge or tag is part of this tranche.

## Form/version discovery

Before, Calibration required “Calibration form @ version” and typed `form_id@17`. Now the compact scope has **Change filters**, ordinary Source/Form / version/Agent/Queue/From/To labels, and a human selector. **Customer Service v17** stores and queries exactly `general_service@17`; **Customer Service v18** is a separate `general_service@18` choice. Default **All form versions** is `''`.

`CalibrationAnalytics.byForm` supplies both `formRef` and human `label`. It is historical completed-review authority, independent of the current Forms library. The fixture library contains only current Customer Service v18; v17 and retired Complaints Handling v3 are still discoverable from review snapshots. Names are never inferred from technical IDs. Initial/deep-linked references are retained even if absent from a fresh catalogue: returned human evidence supplies a label, otherwise “Selected form version”.

## Catalogue contract and failure behavior

The existing bounded `GET /api/calibration` is called twice on entry: main data includes the selected exact form; catalogue discovery omits only `form`. Both use the same source/date/agent/queue cohort and UTC day boundaries. The existing server completeness limit/failure remains authoritative (up to 2,000 records per collected collection); no new route or unbounded client scan was added.

The catalogue effect depends on authentication, source, from, to, agent and queue, plus explicit Retry. It does not refetch merely for form choice, breakdown or question selection. Selecting v17 keeps v18 available. User cohort changes that remove the selected version reset it to All form versions with an announced status. Initial deep links are deliberately treated differently from explicit cohort edits.

Catalogue failure leaves successful main results visible, with “Form choices unavailable — retry”, an isolated retry and subordinate technical detail. Main failure has safe “Calibration could not be loaded”, Retry, and technical details. Requests debounce, abort and ignore cancelled responses; chosen values stay stable during loading. Prior metrics/table content is marked busy and stale investigation actions are disabled; the signal explicitly says it is updating.

## Observed disagreement and sample size

The top section answers **Where humans and AI differ** before the breakdown. `src/calibrationPresentation.ts` ranks only exact question/form-version rows with a positive comparable sample and a non-null agreement rate. Priority is disagreement rate descending, disagreement count descending, comparable sample descending, then exact formRef, question label and ID ascending. Ties are deterministic and independent of fixture order. This is a presentation ordering rule, not a new statistical calculation or claim.

The comparable denominator is the aggregation's agreements + disagreements, never all unresolved reviews or an assumed count of answered questions. The example is **Clear next step · Customer Service v17 · 5 of 8 comparable reviewed answers disagreed · 62.5% disagreement**. v18 has 2 of 6; retired v3 has 1 of 4. Missing human answers, null comparisons and SKIPPED are excluded by existing aggregation semantics. No comparable sample shows “No completed human/AI comparisons match this scope”; comparable samples with zero disagreements say so, and disagreement actions are disabled.

Evaluations reviewed, Questions reviewed, Exact agreement, Mean absolute score gap and Unresolved reviews remain. Unresolved is explicitly outside completed comparisons. The warning “Confidence is not accuracy or human agreement” remains; disagreement is not proof that the human is correct, model error, accuracy, significance or causality.

## Investigation and durable state

**Inspect question** selects its exact form/version, switches to Questions and focuses that question's detail. Questions can also run across all forms: each row/card remains keyed by formRef + questionId and visibly identifies its form/version. Question detail retains completed reviews, comparable answers, agreements/disagreements, AI/Human credit/gap and supporting evaluations. Ordinary raw form references become human labels; ordinal **Open reviewed evaluation 1** actions retain exact IDs under Advanced details. No per-row naming request was added. Forms/groups retain historical human labels and existing comparison semantics.

**Open disagreements** uses the existing exact Evaluations path: source, exact form, reviewQuestion (existing questionId query convention), REVIEWED, comparison=disagreements, agent, queue, dates, and evaluationSource=server. Fixture qualification asserts that exactly the intended five records are returned, and asserts all cohort query values sent to the API.

Source/form/from/to/agent/queue/calibrationTab/calibrationQuestion live in the URL. Discrete choices, views and question drill push history; ordinary agent/queue typing replaces the current entry to avoid one history entry per character. The existing navigation/return-context helper gains `calibration.*` context alongside its Analytics pattern. Back to Calibration restores the original scope and breakdown plus selected question where present. Direct top-card disagreement links retain the originating all-forms scope; Inspect first creates an exact selected-form/question context. Conversation evidence uses the existing evaluation return context. App's existing history revision also restores Evaluations state on popstate; there is no separate navigation framework or role URL state.

URLs such as `?page=calibration&form=general_service%4017&calibrationTab=questions&source=genesys-cloud&from=2026-09-01&to=2026-09-30&agent=Fixture%20Agent&queue=Customer%20care` restore the investigation after sign-in/reload. Authentication itself remains the existing in-memory session behavior.

## Goal-only scripted fictional tasks

Prompt: **“Find where human reviewers and AI disagree most and show me the supporting evaluations.”** Route: Overview → Calibration → highest observed signal → Inspect question → Open disagreements → one reviewed evaluation → conversation evidence → evaluation → Back to Calibration → reload. Wrong turns: none in the scripted replay. Conclusion: Customer Service v17 / Clear next step; five exact reviewed disagreement evaluations (`general_service-v17-0` through `-4`), not v18 or retired versions. The cohort-filtered variant additionally checks source, UTC date boundaries, agent and queue.

Prompt: **“Show me calibration for Customer Service v17.”** Actions: Change filters → choose Customer Service v17 by human label. No technical reference is typed. v17/v18 and the retired v3 are separate; v18 remains available after v17 selection. The browser tasks are controlled, scripted fictional-user replays; they do not claim independent recruited-user performance.

## Mobile and accessibility

At 390×844, purpose → named compact scope → disagreement signal/actions → compact metrics → native View → breakdown. Six filters sit behind an expanded-state disclosure. Question comparisons use cards at mobile width, showing both question/form and comparison evidence without horizontal discovery. The shared OperationalTable gains only an optional accessible card-list label; existing reviewer card behavior is unchanged. Existing ResponsiveViewSwitcher retains desktop buttons/mobile native View with only one visible control set.

390/1440/1920 captures and width checks cover the selector disclosure, signal, all-form questions, drill and return. 1440 → 390 → 1440 preserves cohort, form, view and selected question. Keyboard-only flows operate filters, native selection/View, Inspect, disagreements, evaluation and return. Detail headings receive focus; Apply filters returns focus to the disclosure. Labels, named scope/insight regions, real headings/buttons, text counts and announced loading/errors/status avoid color-only distinctions. This is pragmatic automated verification, not screen-reader certification or a physical-device study.

## Validation and focused scores

47 deterministic tests pass across six focused files, including catalogue authority/exact versions, ranking/ties/sample/no comparisons/SKIPPED, request semantics and URL return. 12 focused Calibration browser tests pass. 27 current-contract regression tests pass: V0.19A/E reviewer continuity/focus, V0.19C exact Analytics/Calibration investigations, V0.19D responsive view/navigation, V0.20A discovery/save/reload/export/detach and keyboard. Six overlapping layout/goal replays add visual geometry proof. Viewports: 1440×900, 1920×1080, 390×844, plus 1440×720 navigation/reviewer smoke. The giant stale historical suite was not run/repaired. See [failure classification](v020b-evidence/failure-classification.md).

The unchanged rubric is 1 seriously ineffective, 2 major friction, 3 acceptable prototype, 4 strong internal product, 5 unusually polished/intuitive. Focused assessments: Calibration task usability **4**, first-time learnability for this task **4**, user-facing cleanliness for this task **4**, mobile discoverability for this task **4**. Long navigation/page stacks and the lack of an independent first-time participant prevent a 5 claim. No new whole-product average is claimed. [Score evidence](v020b-evidence/score-recheck.json).

## Deployment and preservation

The qualified frontend is archived/rebuilt from an immutable committed source and compared byte-for-byte to the tested build before Pages publication. `committed-build.json` records the tested source SHA; `pages.json` records Pages HEAD, public file hashes and complete tree equality. Public browser qualification uses the deployed frontend with the same local fictional API fixture and blocked external providers. Published tested source: `e8ac8aee0d3296a60b93745099f4cb02a63864f3`. Pages HEAD: `d413ffa7dad2f771cb305b248ce5a0ad7f4fd478`. All **12/12 public files** and the **complete gh-pages tree** match the immutable tested build. The public fixture replay also passed **12/12**, with no flaky/skipped/failed tests. The final delivery commit adds documentation/evidence only; its frontend inputs match this tested source.

Read-only before/after production snapshots cover Forms, Question Groups, Answer Sets, Policies, Evaluations, Human Reviews, Schedules and 18 additional collections. Runtime image/revision/configuration, IAM, secret metadata/versions/IAM and Scheduler configuration are hashed. Production domain mutations **0**, live Genesys **0**, Jev **0**, notifications **0**. All **25/25 collection counts/hashes match**, including operationalHealth. There was **no operational-health or Scheduler timestamp movement** across the snapshots. Scheduler lastAttemptTime remained `2026-10-04T10:00:04.849307Z`; scheduleTime remained `2026-10-04T11:00:04.028877Z`. Image/revision/configuration, IAM, secret metadata/versions/IAM and Scheduler configuration match. Cloud Run traffic remains **100%** on `aqm-api-v019-e92f2d6`. No production evidence mutation was used. Exact snapshot/health timestamp evidence is in `preservation.json` and the before/after collection files.

[Evidence index](v020b-evidence/README.md). Next: ChatGPT review/merge; this work does not create a PR, merge or release tag.
