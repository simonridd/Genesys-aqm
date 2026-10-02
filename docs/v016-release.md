# V0.16 release evidence — 2 October 2026

## RELEASE

Remote origin/main was verified exactly **60ccfadb6ee15a8fb91299635b94e31f592c5e6f**, the accepted V0.15 state. Local and remote v0.15.0 were absent. Created and pushed annotated **v0.15.0**, annotation “Genesys AQM V0.15.0 — Review assignment and workload operations”. Remote tag object **fbda20639f0389e852049f6bc9ae9c1e232ba06b** peels to the exact canonical main commit.

Dedicated worktree `.worktrees/aqm-v0-16`; branch **codex/aqm-v0-16-review-sla**, created from origin/main. Implementation source **ce4f3e8d68f9e47b64a09f7af49ef0cae4fba565** was committed and pushed. Release evidence is a subsequent documentation-only commit. Main remains unchanged. No PR was created or merged. environment-builder-v2 was not modified.

## SLA

Durable GovernanceSettings.reviewSla extends the existing governance contract: default dueSoonHours=24, overdueEscalationHours=48, validated integer ranges 1–168 and null/1–720 respectively. Defaults are read without a migration or persisted setting write. Settings never invent due dates. Only explicit dates are monitored.

The deterministic shared helper derives NO_DUE_DATE, ON_TRACK, DUE_SOON, OVERDUE and ESCALATED from review, settings and a supplied ISO clock; REVIEWED always returns COMPLETED. Due-soon begins exactly at its threshold, overdue begins exactly at dueAt, and escalation begins exactly at its enabled threshold. ISO offsets represent the same instant; no timezone-dependent deadline arithmetic or derived flags are persisted.

Existing trusted schedulerTick now follows schedule work/scheduler health with a provider-free SLA sweep, then the existing API tick routes notifications. Active reviews alone are queried in pages of 100 with a 2,000 ceiling. A separate active-alert scan, also bounded at 2,000, catches deleted/inactive reviews. Ceiling or concurrent-change incompleteness is surfaced explicitly. No per-review scheduler job, historical-review scan, Genesys query or Jev call is introduced. The two exact active queries were verified read-only against production Firestore without new indexes: [query proof](v016-evidence/queries.json).

Overview & Runs shows live server-derived workload counts and the last sweep's completeness independently from provider/scheduler health. ADMIN can run “Refresh review SLA state” using the same evaluator; it has no provider dispatch. Quiet hours remain deferred.

[Detailed API and lifecycle contract](v016-review-sla.md).

## ALERTS

New types/severities are **REVIEW_DUE_SOON/INFO**, **REVIEW_OVERDUE/WARNING**, **REVIEW_ESCALATED/ERROR**. Safe linkage includes evaluationId, reviewId, formId, dueAt and optional assigneeUserId. Content, answers and notes are excluded.

Transactional current/stage pointers reuse operationalAlertKeys. Deterministic IDs include review, assignment/due epoch and stage. Concurrent/repeated sweeps preserve one alert and one OPEN event per unchanged stage. Stage progression resolves the old alert with automatic reason/provenance before opening the next. Acknowledgement leaves due dates/review lifecycle intact and permits escalation.

Completion resolves immediately through the shared evaluator; due-date removal or moving forward resolves on the next sweep. Reassignment, unassignment, claim and bulk assignment run the same post-write evaluator. Reassignment resolves the old assignment alert and creates a distinct new alert when still late. Unassignment retains the explicit due date and produces appropriate unassigned messages. Historic deliveries are unchanged. A transient post-write alert failure cannot turn a saved review into an apparent failed save: health reports the deferred check and the next sweep retries it.

Disabling escalation after a review already escalated reactivates its automatically resolved overdue stage with the same alert ID and appended provenance. Re-enabling escalation similarly reuses its stage. Routing events/deliveries remain once per stage. Manual resolution does not reopen an unchanged stage; later escalation remains possible. Durable stage keys preserve idempotence after resolved-alert retention.

## NOTIFICATIONS

Existing OperationalAlert → NotificationEvent/Rule → Destination → Delivery routing is reused. Rules can select every new type; no configuration means alerts remain in product without external delivery. Existing notifyOnResolution behavior and delivery idempotence are retained.

Provider-free fixtures prove all stages match rules, repeated sweeps do not resend, reassignment generates distinct delivery identities, and resolution follows existing rule semantics. Safe payloads include review linkage and the fixed application URL; the existing email adapter renders Open review. Review selection survives a required PKCE login. There are no reviewer email/profile fields, Genesys user email lookups, direct review email logic or hidden destinations. Simon's separate V0.12 live delivery proof was not required or run.

## QUEUE

My review queue is sorted across the bounded server active set before paging: ESCALATED, OVERDUE, DUE_SOON, other IN_REVIEW, other REVIEW_REQUESTED. Each group orders earliest due dates first, then undated work. Normal Explorer ordering remains unchanged. Queue/detail use text-plus-color badges and deterministic relative times that refresh each minute.

Workload includes due-soon/overdue/escalated per reviewer and Unassigned, excludes completed work and surfaces revoked reviewer access. Stage counts are mutually exclusive. It retains the existing 2,000 evaluation/role completeness checks and adds active-review completeness; loaded page totals are never presented as server totals.

Bulk set/clear due date supports 1–20 requested/in-progress reviews, validates all selections before a guarded all-or-none transaction and preserves assignment, partial answers and scoring reviewer. Explicit null clears the date. Shared revisions protect stale selections. Unchanged dates preserve their alert epoch. Queue classifications update immediately; alert generation uses the next sweep. Selection guards prevent filter changes from leaving actionable invisible selections.

## GOVERNANCE

Existing permissions apply: settings.write for SLA configuration/manual refresh, reviews.assign for bulk dates and assignment, reviews.write for assigned completion, alerts.read and existing acknowledgement/resolution permissions for alerts. No roles are broadened.

SLA setting saves use existing generic audit, including safe threshold metadata. Bulk due changes record old/new dates or clearing in review history and generic audit. Automatic alert lifecycle transactions append OperationalAlert events without generic audit spam. Active OPEN/ACKNOWLEDGED alerts remain protected by existing retention; resolved alerts and notification deliveries retain their established retention categories. No new retention category or collection.

## VALIDATION

- Full deterministic suite: **51 files, 512 tests passed** (55 more than V0.15).
- Frontend TypeScript/build, server typecheck and server bundles: **passed**. Existing Vite large-chunk advisory remains.
- Focused Playwright: **24 distinct journeys passed**, covering all four governance roles plus review operations, calibration and the new SLA journeys. Nine review/SLA journeys were repeated after final backend changes; the three SLA journeys were repeated after the final queue selection guard.
- Viewports **1440×900, 1920×1080, 390×844**. Screenshots inspected; no page errors or horizontal page overflow.
- Fixed-clock boundary/timezone tests; alert dedup/stage transitions/completion/reassignment/acknowledgement/settings transitions; actual Firestore transactional adapter proof; retained stage keys; safe notification payloads; provider-free OPEN/RESOLVED delivery idempotence; workload/revoked access/completeness; global My queue ordering across server pages; bulk set/clear/bounds/validation rollback/stale revision/audit/permissions; immutable evaluations and completed review behavior.
- Browser checks cover priority ordering and all three badges, workload, admin thresholds/no escalation/manual refresh, mixed requested/in-progress bulk dates and clearing, filter/selection safety, review SLA OperationalAlert, Open review navigation, completion removing active late status, and mobile usability.

Screenshots: [1440 queue](v016-evidence/queue-1440.png), [1920 queue](v016-evidence/queue-1920.png), [390 queue](v016-evidence/queue-390.png), [390 settings](v016-evidence/settings-390.png), [390 alert](v016-evidence/alert-390.png), [390 completed review](v016-evidence/completed-390.png).

## DEPLOYMENT

Backend/frontend source: **ce4f3e8d68f9e47b64a09f7af49ef0cae4fba565**. Cloud Run used a Git archive of that exact tested commit; no uncommitted or workspace files entered the deployment.

Project genesys-aqm-2026, region europe-west2, service aqm-api; ready revision **aqm-api-v016-ce4f3e8**, **100% traffic**.

Image: **europe-west2-docker.pkg.dev/genesys-aqm-2026/cloud-run-source-deploy/aqm-api@sha256:32bfce18661bae2528c5acc0a4acb5bbe7aeccc474b7797567ee761a006d5ab4**.

GitHub Pages HEAD: **7801e8a32e252ee6b16c0194d56b02bc948b0d4b**. Public assets match tested build bytes:

- index-BEYSCsm_.js: `6af4a5da6daa2a5cb5d668c8a8c38175077eb427581f1eabd436eb4b522af82a`.
- index-CEjsHs-N.css: `208c485040dc2990bf7ac2d1713bd25ebe5ac3ec36620276f37c5a30c55f5505`.

[Pages byte proof](v016-evidence/pages.json). The existing browser API alias returns HTTP 200 on /health. Anonymous workload, SLA refresh and bulk due routes reject requests with HTTP 401: [read-only API proof](v016-evidence/api.json). No authenticated production mutation was used for verification.

[Live site](https://simonridd.github.io/Genesys-aqm/).

## PRESERVATION

Before/after Firestore snapshots are **exactly equal across all 23 inspected collections**, including document fields and create/update timestamps. [Machine-readable preservation proof](v016-evidence/preservation.json). Protected Daily Voice policy and its schedule match exactly, including scheduler operational timestamps. Policy hash `69a2ef89c181e76f3eaa3b04c5beb63970136e1c09c58d84807eeab85aeec680`; schedule hash `33eeaf1c097a3a5a1d20378da0b9eab778b3008010830ffd4f6c60a81ef1271e`.

Cloud Run runtime spec except image is equal; runtime annotations and IAM are equal. Existing secret references/versions and runtime identity are preserved. Scheduler configuration is equal, excluding naturally advancing service attempt/status fields. No scheduler setup script, IAM update, Secret Manager update or migration was run.

There were zero production HumanReviews before/after; no fixture review or alert was seeded in production. Existing evaluations/slots, forms/groups/policies/runs, roles/governance, notifications and delivery history are preserved. **No paid Jev calls were initiated.**

Expected future state from authorized feature use: governanceSettings/governance gains reviewSla only when saved; an authenticated periodic/manual sweep creates operationalHealth/reviewSla; explicit dated active reviews create stage/current keys in operationalAlertKeys, OperationalAlerts and existing NotificationEvents/Deliveries according to configured rules. All use existing collections. None was created by deployment/read-only verification.

| Collection | Documents before/after | Exact equality |
|---|---:|---|
| auditEvents | 0 | Yes |
| evaluationForms | 7 | Yes |
| evaluationRecords | 8 | Yes |
| evaluationSlots | 8 | Yes |
| formTestRuns | 1 | Yes |
| governanceSettings | 0 | Yes |
| humanReviews | 0 | Yes |
| notificationControl | 0 | Yes |
| notificationDeliveries | 0 | Yes |
| notificationDestinationHealth | 0 | Yes |
| notificationDestinations | 0 | Yes |
| notificationEvents | 0 | Yes |
| notificationRules | 0 | Yes |
| operationalAlertKeys | 0 | Yes |
| operationalAlerts | 0 | Yes |
| operationalHealth | 1 | Yes |
| policies | 7 | Yes |
| policyRuns | 3 | Yes |
| purgePlans | 0 | Yes |
| questionGroupAssets | 4 | Yes |
| roleAssignments | 0 | Yes |
| scheduleExecutionClaims | 3 | Yes |
| schedules | 1 | Yes |
