# V0.19 — Reusable Answer Sets

Canonical base: `efc02d0986c75c938831d1633e98c3420ca7d72e`. Branch: `codex/aqm-v0-19-reusable-answer-sets`. V0.18 was closed first: annotated remote tag `v0.18.0`, object `ea9c2977e0c34b3d5d556443a3ea08c20815f189`, peeled commit equal to canonical main. No PR, main merge, V0.19 tag, environment-builder-v2 change, paid Jev request or live Genesys request is part of this tranche.

## Problem and user value

Authors repeat the same answers and rating scales across questions. Answer Sets let an author define a scale once, publish it, and deliberately copy it into questions. Reuse reduces repetitive authoring while preserving the exact standards used by each form and historical evaluation.

The Configuration navigation now places Answer Sets beside Evaluation Forms and Question Groups. The library uses OperationalTable identity controls, search/sort/pagination, exact saved-form usage counts, lifecycle status, type, version, option count and last-modified date. Usage counts require matching asset ID, family and version. A shorter desktop sidebar scrolls to keep Settings and the product tour reachable after adding the destination.

## Model and option contract

`AnswerSetAsset` has ID, family ID, name, description, positive integer version, `choice | score` base, the existing `Option[]`, DRAFT/PUBLISHED/RETIRED lifecycle and authoring timestamps. Every `ScorecardItem` still requires embedded `options`; optional `sourceAnswerSet` records family ID, Answer Set document ID and version.

Choice uses 2–255 options. Score uses 2–10 ordered options. Both retain key, label, description and optional credit. Score also retains sourceValue when supplied. Credit must be finite and within 0–1; sourceValue must be finite. Keys remain valid and unique, and labels/descriptions are required. Historical score definitions are not constrained to monotone credit/source-value sequences or a new numeric range.

The extracted `OptionEditor` and shared `validateOptions` serve both inline question options and the reusable library. Fields are labelled, score source values remain editable, and explicit up/down controls preserve order without a drag/drop framework. Choice source values already present are preserved and visible. Array order remains semantic.

## Lifecycle and durable writes

DRAFT definitions are editable. Publishing validates the definition. PUBLISHED definitions are immutable and can be retired; RETIRED definitions remain immutable. Editing either requires a new DRAFT version with the same family/base type and a new document ID, following `family_v2`, `family_v3` conventions. Initial durable creation must be DRAFT. Family base type cannot change, including while editing an already saved draft. No deletion is implemented.

`assertAnswerSetWrite` enforces valid definitions, immutable identity/family/version/type, unique family/version pairs and lifecycle transitions below the UI. MemoryStore copies values and enforces writes synchronously. FirestoreStore performs validation, asset save and safe audit writes in a transaction. A small `answerSetFamilies` document records base type and version-to-ID keys, so concurrent first-version writes share a document and cannot bypass uniqueness through an empty family query. It is private authoring metadata, not an evaluation dependency. Family scans are bounded at 1,000 versions.

## Snapshots, attach and detach

`applyAnswerSet` requires a DRAFT/TESTING form, an existing question, a valid PUBLISHED asset, and matching choice/score types. It deep-copies options into the question and adds provenance without mutating either input. Composition checks also prevent overwriting answers that would break current/dormant conditions. Noul offers no Answer Set actions.

While attached, the option rows and type control are disabled with an explicit snapshot/read-only explanation. Ordinary domain, form API and group-asset writes reject option/type divergence under unchanged provenance. Detach removes only provenance, preserving option order, descriptions, credit, sourceValue, question type and form scoring. The author can then edit inline options normally. The normal form definition comparison recognizes attach, detach and update as dirty changes.

Save as reusable answer set asks for name and description, inherits the base type read-only, and explicitly saves a **new DRAFT family**. This is also the supported safe path for detached/customized answers. It never overwrites or automatically versions/publishes the originating asset.

## Explicit version updates

The question shows a newer published version from the same family. Opening the comparison does not change the question. Preview covers added/removed keys, actual before/after label/description, credit and source-value changes, and relative ordering, followed by the proposed option order. Apply is a separate action.

`updateAnswerSet` checks family, increasing version, publication and question type. It applies the candidate snapshot purely, then reuses production readiness and full composition validation, including conditions on disabled questions. An update removing `partly_clear` when a later condition references it is blocked with the existing validator's reason and the current snapshot is preserved. An incompatible choice/score update also fails closed. Score credit-threshold conditions retain existing behavior.

## Question Groups and existing forms

Group save, insertion, versioning and portability retain each question's complete options and Answer Set provenance. Updating/detaching a question's Answer Set in a form group instance changes that form snapshot only. It never writes to the source Question Group Asset. Missing external Answer Sets do not invalidate a group or form snapshot.

Existing forms without provenance need no migration or rewrite. Existing runtime question types are still Noul, choice and score. Published form definitions remain immutable; any Answer Set changes require an editable form/new form version and explicit author action.

## Runtime, provider, Human Review and history

There is no Answer Set evaluation endpoint, fetch, scoring service, provider ID or schema. DirectJev and browser provider mapping source are unchanged. They consume `question.type` and embedded `question.options` as before.

EvaluationRecords continue to contain the full form snapshot. Human Review reads its embedded options: choice answers use keys and score answers use the existing ordered indices. Analytics and Calibration keep their existing aggregation semantics. Publishing another asset version, retiring v1, editing a draft or removing the local library cannot alter an existing form or record. Deterministic proof compares manual and sourced forms' typed provider requests, normalized results, Human Review credits/comparisons, Analytics and Calibration, without a source-library lookup. It also saves a historical EvaluationRecord and proves byte stability after publication and retirement in a separate asset store.

## Saved/local authority and authoring protection

`useSavedConfiguration` owns forms, policies, groups and answerSets. Connected `/api/answer-sets` results are authoritative, including the empty state and error/loading state. Connected pickers offer saved PUBLISHED assets only, filtered by question type. They show at most 100 results per picker page; the complete editor collection is bounded at 1,000 versions. A failed library read cannot silently substitute local starters.

Disconnected authoring uses the browser-local library. Service quality, Resolution clarity and Customer effort starters are provided only for exploration. Local custom definitions are explicitly saved to browser storage. Connected local starters/drafts appear in a separate disclosure, with export and an explicit **Save as AQM draft** action. Reconnecting never uploads them automatically. No production seed operation was added.

The Answer Set editor has its own definition dirty tracking. Switching assets, creating another draft, closing details, leaving the page, entering the tour and browser unload protect unsaved edits. Failed saves and refreshes retain the working draft. Detail/picker headings receive focus when opened, and close/cancel restores the opener, following V0.18E patterns. Permission-based read-only and published/retired immutability use different explanations.

## API, RBAC, audit and portability

- `GET /api/answer-sets`: authenticated bounded/cursor pages, limit 1–100; `forms.read`.
- `GET /api/answer-sets/:id`: authenticated authoring detail; `forms.read`.
- `PUT /api/answer-sets/:id`: explicit save/publish/retire; `forms.write`.
- `POST /api/answer-sets/import`: explicit new-DRAFT import; `forms.write`.

No new role or unrelated privilege is introduced. ADMIN/AUTHOR can author; REVIEWER/VIEWER cannot mutate. ResourceHistory is available under the existing product-history permission. Audit resource type is `answer_set`; create, save, publish, new-version, retire and import events include safe actor/version/status metadata. Names, option contents, credentials and conversation data are excluded from metadata.

Answer Set JSON uses `genesys-aqm/answer-set`, schemaVersion 1, with explicit definition projections. Import generates a fresh ID/family, version 1 and DRAFT status. Request/file bytes are bounded at 100 KB, nesting at 15 levels, strings at 10,000 characters, object keys at 180 characters, and option arrays/counts by type. Malformed/unsupported envelopes and definitions are rejected. Form and Group envelopes deliberately preserve Answer Set provenance and complete embedded options. Import succeeds without the referenced asset, provided the embedded definition is valid.

## Validation and evidence

Evidence is in [v019-evidence](v019-evidence/README.md). Full deterministic suite: **597 tests in 61 files** pass; focused domain/store/API/group suite: **48 tests** pass. Frontend typecheck/build, server typecheck and server build pass.

The **19 Answer Set browser journeys** exercise the real API implementation through fictional authenticated identities and MemoryStore. Coverage includes empty connected authority, separate starters, draft/edit/save/publish/version/retire/history, choice attach/detach/save-as/update, blocked conditions and incompatible versions, score ordering/credits/source values, import, failed saved reads, dirty/failed-save guards, reconnect isolation, four roles and independent group snapshots. Provider methods throw if invoked; all external traffic is aborted or explicitly fulfilled by fictional OAuth/API fixtures.

The broader regression run passed **127 journeys** covering V0.18A–E, review assignment/SLA, notifications, calibration, cache, form publication and Question Groups. Two tour failures exposed a short-desktop navigation overflow, now fixed; the third lazy-chunk failure check requires a built asset. **27 focused navigation/usability/showcase reruns pass**, and **33 production-build journeys pass**, including all 11 showcase tests and the complete Answer Set suite. Counts overlap and must not be added as unique tests. The initial missing-preview-server attempt is a corrected harness setup issue, not product evidence.

Screenshots and measured action bounds cover **1440×900, 1920×1080 and 390×844** for the library/detail, picker, update comparison, blocked update, ordered options and form question editor. Visual inspection confirmed shared IPI fields, readable wrapping and reachable controls. Initial plain fields/panel padding were corrected before the final captures. Keyboard identity activation, heading focus, close return, labelled option controls, and normal publish/new-version buttons are covered.

The five-chapter pitch remains intact. Define quality now truthfully says: “Reusable question groups and answer sets keep common standards consistent across forms.” The roadmap is marked implemented only after this proof.

## Deployment and preservation

Deploy only from an archived implementation commit. Backend release uses `aqm-api-v019-<shortsha>` with existing runtime configuration, IAM, secrets and Scheduler settings preserved. Pages is built from that committed source and every public file must match the validated build byte-for-byte. Actual SHAs/revision and final read-only proofs are recorded in `v019-evidence/deployment.json` and `pages.json` after deployment; no uncommitted application source is deployed.

Read-only before/after counts and SHA-256 hashes include all discovered top-level collections, the new empty `answerSetAssets` and `answerSetFamilies`, and known operational collections. The expectation is **0 → 0** in both new collections. Deployment proof uses health/anonymous authorization reads and authenticated in-memory fixtures, not production authoring writes. Existing policies, schedules, forms, groups, reviews and evaluation data are preserved. Runtime/IAM/secret/Scheduler configuration is compared separately. Natural Scheduler changes, if any, must be identified by their exact before/after operational timestamps/hashes in preservation evidence.

The final feature branch is pushed for ChatGPT review/merge. This task creates no PR and does not merge main or create `v0.19.0`.
