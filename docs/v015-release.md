# V0.15 release evidence — 2 October 2026

## RELEASE

Verified `origin/main` and remote main exactly `b1af64e37fb7f1ab93238c7954c7d36a1f303d55`, the accepted V0.14 state. Neither local nor remote v0.14.0 existed. Created and pushed annotated `v0.14.0`, annotation “Genesys AQM V0.14.0 — Durable policy authoring and scheduling”. Remote tag object `551a7a637b5e10e165c506bba778a9ae56907262` peels to that exact commit.

Dedicated worktree `.worktrees/aqm-v0-15`, branch `codex/aqm-v0-15-review-operations`, from origin/main. Main remains unchanged. No PR was created or merged. environment-builder-v2 was not modified.

## ASSIGNMENT

HumanReview now owns optional assignee/assignedAt/assignedBy/dueAt metadata, separately from the actual scoring reviewer. No task collection was created. ADMIN gains reviews.assign; AUTHOR, REVIEWER and VIEWER gain no central assignment permission. Reviewers self-claim through reviews.write.

Assigning NOT_REVIEWED atomically creates REVIEW_REQUESTED with assignment. Requested reviews can be assigned/reassigned/unassigned. IN_REVIEW changes require explicit confirmation and preserve partial answers, notes, comparison and actual reviewer. Completed reviews remain immutable. Claim and start atomically verifies unassigned requested state, actor permission and current revision, assigns self and starts review. Two claimers yield one success and one HTTP 409.

Scoring and assignment share HumanReview revision. Each assignment increments once. Actor/assignee role documents, original evaluation and prior review are transaction guards; stale scoring cannot overwrite reassignment or a role removal. Assigned-to-other users, including ADMIN, cannot implicitly start/edit; an explicit takeover or reassignment is required. Server still derives actual scorer identity.

[API and behavior contract](v015-review-operations.md).

## QUEUE

Evaluations contains the review workload panel, My review queue, unassigned requested count, assignment/due filters and detail assignment editor. Existing Explorer remains available. Filters combine with status/form/source/agent/queue/date and other existing filters. Mine resolves the authenticated actor server-side. My queue includes assigned requested/in-progress reviews, ordered within the loaded page by overdue, nearest due, then oldest request/evaluation. OperationalTable global behavior is unchanged.

DueAt is optional ISO with timezone; datetime-local converts using browser local time. No default SLA. Overdue is derived only for unfinished reviews. Due today uses Europe/London; next seven days is an upcoming rolling window. Completed reviews never remain overdue.

Workload is server-derived across complete bounded history, with assigned open/requested/in-progress/overdue per reviewer, plus unassigned requested. Removed reviewer access is explicitly surfaced and never silently clears an assignment. The 2,000 evaluation/review/role guard returns incomplete/needsIndexing with no misleading totals. Explorer retains its 500-scan window and scanLimited continuation. Safe reviewer directory uses bounded pagination, includes bootstrap ADMIN without a role document, and exposes only userId/displayName/role.

## BULK

ADMIN selection appears only in server Explorer. Maximum 20 unique evaluations per operation. NOT_REVIEWED and REVIEW_REQUESTED are supported; IN_REVIEW and REVIEWED are rejected. Every selection is validated before a single transaction that includes evaluation, role and review guards, review history and generic audit. A stale/invalid record rolls back all selected writes. Bulk request + assignment uses one revision per review and applies the same optional due date consistently.

## CALIBRATION

Calibration sample optionally assigns a selected reviewer and due date through the same bulk contract. Reviewers can still request unassigned samples. Completed human answers remain the only calibration inputs. Assignment/due/overdue do not alter quality or calibration metrics. AI evaluation records remain byte-identical. No Jev calls were made.

## GOVERNANCE

Server RBAC enforces central assignment versus self-claim and assigned scoring. Bootstrap owner is assignable; non-reviewing roles are excluded from the directory. Role revocation prevents scoring while preserving assignment for manager action. HumanReview history records review_assigned/review_reassigned/review_unassigned/review_claimed with time, actor, revision and safe assignee/due information. Existing event limit remains 200.

Generic append-only audit records the lifecycle events and bulk count/assignee/due metadata in the transaction. Question answers/notes do not enter generic audit metadata. Retention still treats assignment as part of HumanReview. No overdue OperationalAlerts, notification changes, new scheduler behavior or extra retention collection.

## VALIDATION

- Full deterministic suite: **48 files, 457 tests passed** (24 new review operations tests).
- Frontend TypeScript/build, server typecheck and server bundle: passed. Existing Vite large-chunk advisory remains.
- Focused Playwright: **21 distinct journeys passed**, including six new ADMIN/REVIEWER operations journeys, existing calibration/conflict/drill-down and all four governance roles. Six operations journeys rerun successfully after panel spacing adjustment.
- Viewports **1440×900, 1920×1080, 390×844**. Screenshots visually inspected; no page errors or horizontal page overflow.
- Covers request+assign, reassignment/unassignment, partial preservation and explicit takeover, frozen completed reviews, stale revision/scoring, claim race, revoked role at commit, due/overdue, workload counts/completeness, safe directory pagination, mine identity, bulk bounds/state rejection/rollback/audit, sample reuse and RBAC.
- Browser journeys cover combined filters, My queue, unassigned claim, own start/complete, assigned-to-other read-only, overdue/detail due, takeover confirmation/cancel, bulk selection/assignment, workload and sample due/assignment. Providers and OAuth are fixtures; production verification is read-only.

Screenshots: [1440 queue](v015-evidence/queue-1440.png), [1920 queue](v015-evidence/queue-1920.png), [390 queue](v015-evidence/queue-390.png), [390 takeover/progress](v015-evidence/assignment-390.png), [390 reviewer queue](v015-evidence/reviewer-390.png).

## DEPLOYMENT

Backend and frontend source: **`394b3b0016de0163d673810a3d0d3eee5e0581f1`**. Cloud Run deployment source was a Git archive of that exact tested commit. Final release evidence is a subsequent documentation-only commit.

Cloud Run project `genesys-aqm-2026`, region `europe-west2`, service `aqm-api`; ready revision **`aqm-api-v015-394b3b0`**, **100% traffic**.

Image: **`europe-west2-docker.pkg.dev/genesys-aqm-2026/cloud-run-source-deploy/aqm-api@sha256:8b459af703f74aeb0d6370790b414726bc58b0873f7e9edff47b6d05f94744c6`**.

GitHub Pages HEAD: **`9749e09c472407f3d6b7b2ba7dd4a0721980b96f`**. Public JavaScript/CSS match the tested build bytes:

- `index-CstctmN_.js`: `77d7ebf8742a72ead5cbfde74f28fd4cc99b19570e483070db0814dde6bb3148`.
- `index-CReN8SJ5.css`: `21b0e96f5fbf6dfa5bfc0d444f548ac36e54a9d0fffc2373dd0c43521f3bbacb`.

[Machine-readable Pages proof](v015-evidence/pages.json). Live API health returns HTTP 200 `{status:"ok",schemaVersion:1}`. Anonymous GET /api/review-workload returns HTTP 401; verification did not authenticate or mutate production data.

[Live site](https://simonridd.github.io/Genesys-aqm/).

## PRESERVATION

Read-only pre/post Firestore REST snapshots compare exactly equal for **all 23 inspected collections**, including document fields and creation/update timestamps. [Machine-readable preservation proof](v015-evidence/preservation.json). Raw data/config snapshots remain outside Git; committed proof contains only counts/hashes and safe deployment metadata.

Daily Voice Customer Service AQM (`daily_voice_customer_service_aqm`) is exactly equal, including enabled/version/criteria/sampling/exact form pins. Its schedule configuration and nextDueAt/lastAttemptedAt/lastSuccessfulAt are exactly equal. Policy hash `69a2ef89c181e76f3eaa3b04c5beb63970136e1c09c58d84807eeab85aeec680`; schedule hash `33eeaf1c097a3a5a1d20378da0b9eab778b3008010830ffd4f6c60a81ef1271e`.

Scheduler operationalHealth and execution claims, evaluations and evaluation slots, completed-review collection, forms/groups/policies/runs, role/governance settings, form tests, purge plans, alerts/audit, notification configuration/deliveries/events/health/control are preserved. No production review, evaluation, role or other application-data mutation was used for testing.

Cloud Run runtime spec except image, runtime/scaling annotations and IAM are equal. Scheduler job configuration is equal after excluding naturally advancing attempt/status fields; its stored scheduler data is also exactly equal. Deployment did not run the scheduler setup script or any data migration.

| Collection | Documents | Equal |
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
