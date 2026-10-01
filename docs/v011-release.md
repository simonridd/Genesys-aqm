# V0.11 release evidence — 1 October 2026

V0.11 governance is deployed. Implementation source: `114ae6dee5480047c595d0231da59c0e5d3b8adc` on `codex/aqm-v0-11-governance`. This evidence document is a subsequent documentation-only commit. The implementation, builds and deployed artifacts use the implementation source above. No PR was created or merged; `main` remains `77681cd7ac84da0a25888951507bb243036a28cf`.

## Release

Annotated `v0.10.0` was pushed and remotely verified. Tag object `64b61125b981a5b750a2f1feadb8a4c033cfc835` dereferences to `77681cd7ac84da0a25888951507bb243036a28cf`, the exact accepted V0.10 source. The V0.11 worktree starts from that verified `origin/main`; no historical feature branch was used.

## RBAC

ADMIN, AUTHOR, REVIEWER and VIEWER use the central permission contract. The server verifies Genesys `users/me`, retains the existing allowlist, and reads durable role assignments per request. Missing/invalid authentication returns 401; insufficient permissions return 403. Every mutating route has permission enforcement, including form testing, reviews, alert transitions, manual evaluation and governance operations.

The verified existing owner `1b2a0696-348b-4d8d-879e-13d4b4f43ba5` is explicitly pinned by `AQM_BOOTSTRAP_ADMIN_USER_ID`. It remains ADMIN and cannot be demoted through the API. Non-owner unassigned users default to VIEWER. Multiple allowed users require an explicitly configured bootstrap owner. AUTHOR can author/test/publish forms and groups, manage policies/schedules, execute evaluations and acknowledge alerts; REVIEWER can perform human review operations; VIEWER has ordinary operational reads. ADMIN alone manages roles, global settings, detailed audit, alert resolution and purge.

The browser shows the verified role, restricts actions by permission and exposes server 403 errors. Server checks protect stale browsers independently of UI state.

## Audit

`auditEvents` contains verified actor, timestamp, action, resource identity/version, generic summary, safe metadata, source and correlation ID. Atomic Firestore transactions couple critical mutations with audit creation; failure prevents the mutation. Actions cover form/group lifecycle and versions, policy/schedule changes, full human-review lifecycle, alert acknowledgement/resolution, roles, settings and purge planning/execution.

No arbitrary audit-write/edit/delete API exists. Metadata excludes transcript content, form/customer text, review notes, credentials and tokens. Queries are bounded/paginated. Configuration → Settings contains filters, event table and detail. ADMIN and AUTHOR have resource-history links for forms, groups and policies. Object snapshots remain authoritative. Audit starts with V0.11 and does not backfill older changes.

## Retention

Server retention defaults to indefinite; browser content defaults to 24 hours with 0–168 hours configurable by ADMIN. Zero removes existing content and prevents future content persistence. Expired content is removed on read. Every role can clear its browser conversation content; search snapshots remain independent.

Saving settings never deletes server data. ADMIN previews a bounded window (up to 250 scanned records), explicitly types PURGE, and executes a server-recalculated plan. Counts describe that window. Durable actor-bound plans expire after 15 minutes; atomic checks reject changed settings/candidates. Evaluation and dependent review deletion is atomic, including guards against concurrently created reviews. Active alerts, forms/groups, policies, schedules and role assignments are protected. Current purge evidence survives that purge; audit defaults to indefinite. Continuation requires another preview and confirmation. Replay returns the executed plan without deleting twice. Query-derived analytics reflect remaining records. No production purge or retention-settings change was performed during release verification.

See [the complete governance contract](v011-governance.md) for exact permissions, bounds, bootstrap recovery, cache and concurrency semantics.

## Validation

- 314 deterministic tests passed across 39 files.
- All 41 Playwright journeys passed, including existing operational, publication, review/calibration, composition/scoring, alerts, voice/cache and digital-ingestion journeys.
- All 12 role-specific governance journeys passed again after layout refinement.
- ADMIN, AUTHOR, REVIEWER and VIEWER were tested at 1440×900, 1920×1080 and 390×844. Screenshots were visually inspected; overflow assertions passed.
- Frontend TypeScript/build, server TypeScript and server build passed.
- Public API `/health` returned 200 with healthy status; unauthenticated `/api/session` returned 401.
- The live Pages JavaScript and CSS bytes match the tested local build exactly.
- No test used live Genesys or Jev. No development-initiated paid Jev calls occurred. Interactive production sign-in remains untested on this Mac, as expected.
- The existing frontend chunk-size advisory remains non-blocking.

## Deployment

Cloud Run project/service: `genesys-aqm-2026` / `aqm-api`, region `europe-west2`.

Ready revision: `aqm-api-v011-114ae6d`, serving 100% of traffic.

Image digest:

`europe-west2-docker.pkg.dev/genesys-aqm-2026/cloud-run-source-deploy/aqm-api@sha256:cf0dcbb9aef2520a738bac91e249166030f206d90cae6e08b10de181afe68b20`

All prior runtime environment values and Secret Manager bindings are preserved. Service account `aqm-runtime@genesys-aqm-2026.iam.gserviceaccount.com`, concurrency 10, timeout 3600 seconds and max scale 2 are unchanged. The only added environment key is the explicit bootstrap owner. No deploy script that changes Scheduler or enables/resets the policy was invoked.

GitHub Pages HEAD: `3114fc297025d11770afc9f2597a7d1255c98eec`.

Published JavaScript: `index-C_anUPy7.js`, SHA-256 `97c400387a6918e84e0a420150c8df79e3357dc636771557ae9ce2ccd0914bc0`.

Published CSS: `index-BuN7XkU-.css`, SHA-256 `507dd8d11a12029e8969a2504f2b12ad913b83b6cbadb82072195e5c085db8bc`.

Site: https://simonridd.github.io/Genesys-aqm/

## Schedule preservation

Before/after Firestore document comparisons prove that `Daily Voice Customer Service AQM` and `daily_voice_customer_service_aqm_daily` are unchanged, including document update timestamps. Existing run history is unchanged; no new natural daily scheduled run was observed.

The schedule remains enabled, DAILY at 02:00 Europe/London. `nextDueAt` remains `2026-10-02T01:00:00.000Z` (2 October 2026, 02:00 BST). Existing `lastAttemptedAt` and `lastSuccessfulAt` fields remain exactly as before (absent in the stored baseline). Policy definition, sample of three, form pin and history are preserved.

The enabled `aqm-hourly` Cloud Scheduler job retains its `0 * * * *` UTC schedule, HTTP target, OIDC identity, retry configuration and attempt deadline. No Scheduler state was reset. Firestore, Secret Manager and all existing product collections were preserved.
