# V0.14 release evidence — 2 October 2026

## RELEASE

Verified origin/main and remote main exactly `618646c844d08a5ebcf017f306b3347544d21722`, the accepted V0.13 state. No v0.13.0 tag existed. Created and pushed annotated `v0.13.0`, annotation “Genesys AQM V0.13.0 — Authoring productivity and portability”. Remote tag object `52caac281822b4c4f1ea81371612b2cb8d5d08da` peels to the expected V0.13 commit.

Worktree: `.worktrees/aqm-v0-14`; branch `codex/aqm-v0-14-policy-authoring`, created from origin/main. No PR was created or merged; main remains unchanged. environment-builder-v2 was not modified.

## POLICY AUTHORING

Connected Policies uses authoritative server policies and published operational forms through bounded pagination. Browser-local/demo rows are separate and clearly labelled; service failures never substitute local data. OperationalTable provides table/search/sort/pagination, combined with status, frequency and form-assignment filters.

Explicit Save changes uses `expectedVersion`: null for create, the loaded current version for updates. The server increments once per successful semantic change; no-op saves retain the exact document. Stable definition comparison reports unsaved edits; failed saves preserve them. Store.atomic guards stale/concurrent policy saves and pinned forms. HTTP 409 carries the required refresh message. Validation checks identity, criteria structure/fields/operators/values, sampling and operational form pins. Fixed count is 1–25; percentage 0 and 100 explicitly mean none/all.

Duplicate policy creates an independent version-1 disabled policy with copied criteria/sampling/exact form pins and no schedule or operational children. Exact assigned v17 remains v17 when v18 exists. No destructive production deletion or immutable policy-version store was introduced. Readiness shows policy, operational forms, sample, saved schedule/next due and actionable warnings.

## SCHEDULING

Policies contains the single production schedule editor: Manual, Daily, Weekly, Europe/London, weekday/local time and optional paused state. Save schedule is a separate durable boundary with its own dirty/error feedback. Server response supplies nextDueAt and preserves stored lastAttemptedAt/lastSuccessfulAt. Manual disables the existing schedule without deleting identity/history. Existing schedule IDs remain editable; deterministic IDs for new schedules prevent duplicate creation. Policy enable/disable never rewrites schedules. Existing scheduler behavior prevents disabled-policy attempts from making Genesys/Jev requests; deterministic testing proves this.

## OVERVIEW

Overview & Runs retains manual server plan/preview/confirmation/execution, health, alerts and durable results. The production publish-local bridge and duplicate full schedule editor are removed. Operational schedule metadata and Edit policy & schedule links remain. View runs from Policies selects that policy and filters loaded runs, using existing app state.

## GOVERNANCE

Existing policies.read, policies.write and schedules.write permissions remain enforced server-side and reflected in the UI. Viewer/Reviewer can inspect/navigate without mutation. Author/Admin retain existing writes. Transactional concise audit covers policy create/update/enable/disable/clone and schedule create/update/enable/disable; unsaved keystrokes are never audited. Notification delivery code and behavior were not changed.

## VALIDATION

- Complete deterministic suite: **47 files, 433 tests passed**.
- Frontend TypeScript/build, server typecheck and server bundle: passed.
- Focused Playwright: **20 journeys passed**, covering policy-authoring, existing form authoring/publication, offline digital plans and operational degradation.
- Requested viewports: **1440×900, 1920×1080, 390×844**. Screenshots visually inspected; policy journeys assert no page overflow or page errors.
- Save failure/stale 409, semantic versioning, exact form pins, inert cloning, daily/weekly/manual transitions, separate schedule failure, navigation, Viewer/Reviewer, load failure/local separation and pagination are covered.
- No live Genesys/Jev evaluation calls or paid requests. Browser OAuth/provider traffic and server providers are fixtures. Production checks are read-only Firestore/configuration reads, public API health and unauthenticated access rejection.

Screenshots: [1440 library/detail](v014-evidence/library-1440.png), [1920 library/detail](v014-evidence/library-1920.png), [390 library/detail](v014-evidence/library-390.png), [390 policy detail](v014-evidence/detail-390.png).

## DEPLOYMENT

Backend and frontend source: **`4388de4ff1fa03f2b4cf87de895c0f2951663b59`**. Cloud Run source came from a Git archive of that exact tested commit. This release evidence is a subsequent documentation-only commit.

Cloud Run: project `genesys-aqm-2026`, region `europe-west2`, service `aqm-api`; ready revision **`aqm-api-v014-4388de4`**, **100% traffic**.

Image: **`europe-west2-docker.pkg.dev/genesys-aqm-2026/cloud-run-source-deploy/aqm-api@sha256:1a362ac0c06348896a07a09877c4d076fe8c27f56dff23ab4fa61458dd872a7e`**.

GitHub Pages HEAD: **`719cfa2dec182e848ad92199513cb155b63c3c0a`**. Public frontend JavaScript/CSS match the local tested build bytes:

- `index-BQg9HlGt.js`: `32fc4bcf15dd9a85ced7becea85232bf7742d422201e702c24412de2b5002df4`.
- `index-D6Pz1xBv.css`: `4183f3eb81081ac4ce0137ecfb79c97a9e8bec4e73e1dcfb834c070b016e8344`.

[Live site](https://simonridd.github.io/Genesys-aqm/). API health at the existing configured origin returns HTTP 200 `{status: "ok", schemaVersion: 1}`; anonymous GET /api/policies returns HTTP 401. No production policy or schedule mutation was made for verification.

## PRESERVATION

Read-only pre/post Firestore REST snapshots compare exactly equal for **all 12 inspected collections**, including stored fields and document creation/update timestamps. Operational runs/evaluations, forms/groups, roles/retention, alerts and notification configuration remain unchanged. Proof contains hashes/counts only; raw snapshots stay outside Git.

Daily Voice Customer Service AQM (`daily_voice_customer_service_aqm`) is exactly equal before/after, including policy ID/version, enabled, criteria, sampling and exact pins. Its schedule is exactly equal, including identity/configuration and nextDueAt/lastAttemptedAt/lastSuccessfulAt. Protected policy document SHA-256: `69a2ef89c181e76f3eaa3b04c5beb63970136e1c09c58d84807eeab85aeec680`. Protected schedule SHA-256: `33eeaf1c097a3a5a1d20378da0b9eab778b3008010830ffd4f6c60a81ef1271e`.

Cloud Run runtime spec apart from image is identical: environment values, Secret Manager bindings, service account, concurrency, timeout, resources and ports. Runtime/scaling annotations and IAM are equal. Scheduler configuration is equal after excluding naturally advancing lastAttemptTime/scheduleTime/status. No Scheduler deployment script or data migration was used. [Machine-readable preservation proof](v014-evidence/preservation.json), [Pages proof](v014-evidence/pages.json).

| Collection | Documents | Canonical SHA-256 (equal before/after) |
|---|---:|---|
| evaluationForms | 7 | `83541663d2fdb611f52658abbd442799ed7c11a19385d6546271c9492b876a82` |
| evaluationRecords | 8 | `83f09afd55c106cc33c6098ba92d616e892c3e4eb5f00c8684b2ce33f2846438` |
| governanceSettings | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| humanReviews | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| notificationDestinations | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| notificationRules | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| operationalAlerts | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| policies | 7 | `25c834d2b02213719e761705632843cc028292c90bf530fdc12825809def12c8` |
| policyRuns | 3 | `ab7d96f05458c43c18b9efa0ea880c4f48dcc3449773f146ff68448990a7cf4d` |
| questionGroupAssets | 4 | `3096111299cd49744a485c2bd2757b8f11b34120ad3e0fe954fe532e748b1b97` |
| roleAssignments | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| schedules | 1 | `33eeaf1c097a3a5a1d20378da0b9eab778b3008010830ffd4f6c60a81ef1271e` |
