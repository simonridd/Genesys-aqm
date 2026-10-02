# V0.12 release evidence — 2 October 2026

V0.12 external operational-alert notifications are deployed. Implementation source: `65fd3957325132281e0d216fde33b9cc1f26b3b1`, branch `codex/aqm-v0-12-notifications`, dedicated worktree `.worktrees/aqm-v0-12`. This evidence document is a subsequent documentation-only commit. No PR was created or merged. Remote `main` remains the canonical accepted V0.11 commit `1d1f6f60f6cf32cfb42e74cebb432fdce544471a`. environment-builder-v2 was not touched.

## RELEASE

Before source changes, fetched and verified exact `origin/main` above; verified `v0.11.0` absent locally and remotely. Created and pushed the annotated tag with annotation “Genesys AQM V0.11.0 — Governance, RBAC, audit and retention”. Remote tag object: `e0363b1892784cccf46053a519ca3abbc41cce8e`; peeled target: `1d1f6f60f6cf32cfb42e74cebb432fdce544471a`. The V0.12 branch was then created from `origin/main`. Source and evidence are pushed only on the dedicated feature branch; GitHub Pages and the requested release tag are the explicit publication exceptions.

## NOTIFICATION DOMAIN

OperationalAlert is authoritative. Atomic outbox records capture OPEN and first RESOLVED transitions; repeated alert metadata updates and acknowledgement do not notify. Rules select severity AND alert-type membership AND optional policy restriction; empty alertTypes means all. Enabled rules route to enabled destination IDs. Resolution defaults off and follows a successful OPEN to that same destination. TEST uses an independent delivery, never a fabricated alert.

Durable destination, rule, event and delivery contracts, configuration/dispatch bounds and exact operational semantics are documented in [V0.12 notifications](v012-notifications.md).

## WEBHOOK

Provider-neutral schema version 1 includes OPEN/RESOLVED/TEST, an explicit test marker, safe fixed alert title/summary, status/time, policy/schedule/run IDs and application name. Arbitrary alert text, transcripts, customer bodies, credentials and provider diagnostics are excluded.

POST HTTPS/443 only. All DNS answers must be public; private/loopback/link-local/metadata/reserved/IPv6 transition destinations are denied. The approved IP is pinned while TLS verifies the original hostname. No redirects or shared connection pool. DNS 3 seconds, connect 5 seconds, total HTTPS 15 seconds, response 16 KiB maximum. Secret access has bounded token/fetch waits. Sends require sufficient remaining lease time.

Optional signature: `sha256=<hex HMAC-SHA256(timestamp + "." + exact raw JSON body)>`, with `X-AQM-Timestamp` and deterministic `Idempotency-Key`. Receiver verification/deduplication is documented.

WEBHOOK LIVE DELIVERY PENDING CONFIGURATION. No actual webhook URL or destination was configured or fabricated. Provider-free transport, signature, failure, security and durable dispatcher tests passed.

## EMAIL

EmailProvider renders concise plain text and calls EmailAdapter. The initial Resend adapter owns its fixed endpoint, authentication and provider idempotency header. Sender/recipient metadata is durable; API credentials are resolved only server-side from Secret Manager. No existing email/webhook secret was available: the project's secret-name inventory contained only the existing Genesys client ID/secret and Jev key.

EMAIL LIVE DELIVERY PENDING CONFIGURATION. Rendering, addressing, subject/body sanitization, provider success/transient/permanent failure and dispatcher idempotency passed without real credentials. Configuration and per-secret runtime accessor instructions are documented; no notification secret or IAM binding was created during this release.

## DELIVERY

SHA-256 of JSON `[alertId, ruleId, destinationId, event]` supplies deterministic identity. Atomic creation, CAS leases and durable attempt counts handle duplicate dispatch, restarts and crash recovery. DELIVERED is never resent. Four maximum attempts; retry eligibility intervals 5 minutes, 30 minutes and 2 hours. Existing hourly cadence is preserved, so actual sends wait for the next tick. Disabled configuration yields SUPPRESSED; exhausted/permanent failure yields FAILED. No recursive alert creation.

Resolution waits for OPEN delivery without spending external attempts. Last delivery status is a durable destination projection. Delivery retention defaults to indefinite; only old DELIVERED/FAILED/SUPPRESSED records can enter the existing audited purge workflow. PENDING/RETRYING are protected. Processed outbox events remain durable and are not backfilled/rerouted.

As documented, a crash between provider acceptance and durable completion is ambiguous: receiver/provider idempotency is necessary for exactly-once external semantics. Resend's deduplication window is 24 hours. Quiet hours/on-call/repeated nagging are deferred to V0.13.

## GOVERNANCE

ADMIN receives notifications.read/write/test; AUTHOR read only; REVIEWER/VIEWER have no notification configuration access. All mutations/tests are server-authorized against verified identity and the V0.11 role contract. Ordinary alert readers can inspect safe per-alert delivery status.

Destination/rule creation, update, enable/disable, changed secret references and TEST request are atomically audited. Audit excludes references/values, destination URLs and response bodies. Per-attempt operational history stays in delivery records. The server/browser API never returns credential material or secret references. Existing governance settings remain backward compatible and notification retention is null by default. No production retention setting or purge was performed.

## UI

Settings contains simple destination/rule forms, enabled toggles, optional resolution, ADMIN Send test, safe configuration tables and paginated delivery history. No JSON editing. Overview & Runs shows compact pending, failed-24h and last-success health. Alert details show destination, OPEN/RESOLVED event, delivery state and attempt count with pagination.

ADMIN configuration/test/history and all four roles' visibility and alert status were exercised at 1440×900, 1920×1080 and 390×844. Screenshots were visually inspected; mobile forms stack cleanly and tables stay within their scrolling containers.

## VALIDATION

- 383 deterministic tests passed in 42 files, including 69 new routing/delivery/security/email/API/transport tests.
- All 53 Playwright journeys passed in the final complete regression run: the 41 existing journeys plus 12 new notification journeys across four roles and three viewports.
- Frontend TypeScript/build, server TypeScript and server build passed. Existing frontend chunk-size advisory remains non-blocking.
- Deployed `/health`: 200, `status: ok`, schemaVersion 1.
- Unauthenticated `/api/session` and `/api/notifications/destinations`: 401.
- Unauthenticated `/internal/notifications/tick`: 403.
- Authenticated production notification-only tick was not exercised: the current operator could not obtain an impersonated Scheduler identity token under the existing IAM policy. IAM was not changed. Local API tests prove its existing OIDC protection, and real external delivery remains pending configured targets/credentials.
- Public Pages HTML refers to the tested JS/CSS, and fetched bytes match the local build exactly.
- No development-initiated paid Jev calls, manual production evaluations, policy runs or production test sends occurred. Browser tests used mocked providers only. Digital ingestion code was not changed; existing email direct/EML and messaging direct/bounded bulk regressions passed.

## DEPLOYMENT

Implementation source HEAD: `65fd3957325132281e0d216fde33b9cc1f26b3b1`.

Cloud Run: project `genesys-aqm-2026`, region `europe-west2`, service `aqm-api`, ready revision `aqm-api-v012-65fd395`, 100% traffic.

Image digest:

`europe-west2-docker.pkg.dev/genesys-aqm-2026/cloud-run-source-deploy/aqm-api@sha256:e67a2257db187b38170986ffe3cc20f3bd53526b44fea145c62ccd7b85126d15`

The pre/post container configuration is identical except for the image. All environment values and Secret Manager bindings are identical. Runtime service account, concurrency, timeout, resource configuration and maximum scale are preserved. No deploy script that rewrites Scheduler was used.

API: https://aqm-api-bd54ukouga-nw.a.run.app

GitHub Pages HEAD: `0ea48a3302823f18dacfb1f536193f52838295ca`.

Published JavaScript: `index-DIDybGCP.js`, SHA-256 `c001c4cc628a5564cafbd35df73b0631a2cb7cb0c47f6fa438913356c5dc66e9`.

Published CSS: `index-fvo_qkhB.css`, SHA-256 `b2636d03d9d34b547bda8b14befdcaec2c65bd92a9d3cd3566a630f39c01723c`.

Site: https://simonridd.github.io/Genesys-aqm/

## AUTOMATION

Read-only Firestore pre/post snapshots compare equal, including document create/update timestamps: all seven policies, the existing daily schedule, three runs and eight evaluations. Canonical collection SHA-256 values (sorted-key compact JSON) are equal:

| Collection | SHA-256 |
|---|---|
| policies | `25c834d2b02213719e761705632843cc028292c90bf530fdc12825809def12c8` |
| schedules | `33eeaf1c097a3a5a1d20378da0b9eab778b3008010830ffd4f6c60a81ef1271e` |
| policyRuns | `ab7d96f05458c43c18b9efa0ea880c4f48dcc3449773f146ff68448990a7cf4d` |
| evaluationRecords | `83f09afd55c106cc33c6098ba92d616e892c3e4eb5f00c8684b2ce33f2846438` |

Daily Voice Customer Service AQM remains enabled and unchanged. Schedule `daily_voice_customer_service_aqm_daily` retains `nextDueAt: 2026-10-03T01:00:00.000Z` (3 October, 02:00 BST), `lastAttemptedAt: 2026-10-02T01:00:07.331Z`, and `lastSuccessfulAt: 2026-10-02T01:00:08.428Z`.

Successful unattended scheduled run `r_3ada5020677e14fddb182c27ae6ed70ccaa3d145` remains COMPLETED and exactly preserved, including its start/completion timestamps and original counters. The user's accepted unattended-run proof remains authoritative; no fresh paid run was intentionally triggered for notification development.

The enabled `aqm-hourly` Cloud Scheduler configuration is unchanged: schedule, timezone, target URL/method, OIDC identity/audience, retry configuration, attempt deadline and other configuration fields compare equal. Only naturally advancing `lastAttemptTime` and `scheduleTime` changed while work was in progress. No job, policy or schedule was paused/reset/reconfigured.
