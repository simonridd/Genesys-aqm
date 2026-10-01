# V0.11 governance, RBAC, audit and retention

V0.11 extends the authenticated Genesys API without changing evaluation, review, form, reusable group, policy, schedule, alert, calibration or ingestion definitions. No external notifications are introduced. The browser remains a single application.

## Identity and permissions

Every browser API request verifies its bearer token with Genesys `users/me` and checks the existing server allowlist. Actor IDs/names come only from that response. Browser identity/role claims are ignored. Invalid/missing authentication returns 401; insufficient permissions return 403. Scheduler OIDC remains separate and unchanged.

`src/domain/governance.ts` defines the stable permission contract and four roles. Normal forms, groups, policies, evaluations, reviews, alerts and operational analytics remain readable by every role.

| Capability | ADMIN | AUTHOR | REVIEWER | VIEWER |
|---|---|---|---|---|
| Ordinary operational reads | Yes | Yes | Yes | Yes |
| Form/group authoring, testing, publication, retirement | Yes | Yes | No | No |
| Policies, schedules, manual production evaluations | Yes | Yes | No | No |
| Request/start/save/complete reviews; calibration sampling | Yes | No | Yes | No |
| Acknowledge alerts | Yes | Yes | No | No |
| Resolve alerts | Yes | No | No | No |
| Form/group/policy history | Yes | Yes | No | No |
| Governance settings, roles, detailed audit, purge | Yes | No | No | No |
| Clear one's browser content cache | Yes | Yes | Yes | Yes |

Explicit permission checks cover every mutating route, including isolated Form Test creation/deletion and production evaluation execution. The same mapping drives browser affordances; browser restrictions confer no server authorization. Permissions refresh in the UI every 30 seconds; server role assignments are reread on every request. A stale browser receives the server's 403.

### Durable assignments and protected bootstrap

Firestore `roleAssignments/{Genesys user ID}` stores the role, optional previously verified display name, creation/update timestamps and verified assigner. Role administration is restricted to `roles.manage`; target users must also be in the server allowlist. Assignments do not grant Genesys permissions or bypass that allowlist.

`AQM_BOOTSTRAP_ADMIN_USER_ID` identifies a protected, allowlisted owner. That identity always resolves to ADMIN, including when assignments exist, and cannot be demoted through the API. For compatibility, when this setting is absent and the existing allowlist contains exactly one identity, that explicitly configured identity is the protected owner. It is never inferred from the first login or collection state. Multiple allowed users require an explicit allowlisted bootstrap owner at startup. Configure that owner **before** expanding the allowlist.

The existing production owner is `1b2a0696-348b-4d8d-879e-13d4b4f43ba5`. Unassigned non-owner users default to VIEWER. This is intentionally narrow and keeps an administrative recovery path.

## Audit

`auditEvents` is server-owned and append-only. Events contain ID, occurrence time, verified actor, action, resource type/ID, optional version, generic summary, allowlisted metadata, request correlation ID and `browser-api` source. Metadata consists only of known statuses, roles, numeric versions, booleans and purge counts. Form text, customer content, review notes, provider payloads, OAuth tokens and Jev credentials are never copied into audit events.

Atomic transactions write both mutation and audit events for forms, groups, policies, schedules, human review writes, alert acknowledgement/resolution, roles and governance settings. Review audits include implicit requested/started events as well as saved/completed events. New versions and lifecycle transitions have explicit actions. Identical writes do not generate audit noise. Audit failures prevent successful mutations; transaction failure is tested against the actual Firestore adapter with a deterministic transactional fixture.

There is no HTTP endpoint for creating, editing or individually deleting audit events. Administrative audit retention is the only supported deletion path. Scheduled execution continues using its existing run/alert histories. Governance does not generate audit events for ordinary reads.

Settings under Configuration contains the audit table, date/actor/type/action filters and event detail. Queries return at most 100 matches and scan at most 500 events per request, with cursors for continuation. Timestamp-prefixed audit IDs provide chronological, stable pagination and keep newly appended purge events after older scan windows; table sorting handles the loaded page. AUTHOR product-history queries require an explicit form, group or policy resource ID and cannot expose role/retention/review audit records. Version snapshots remain authoritative; audit is not a historical object reconstruction mechanism. Audit begins at V0.11; earlier mutations are not backfilled.

## Retention and privacy

`governanceSettings/governance` is durable. Defaults preserve current behavior: browser content cache 24 hours; evaluations, reviews, policy runs, resolved alerts and audit retained indefinitely (`null`). Server day thresholds accept 1–36500; browser lifetime accepts 0–168 hours. Saving settings never purges server data.

The configured browser lifetime is applied to existing content reads and future writes. Expired content is removed on read; lowering the lifetime removes now-ineligible cached content. Zero clears content and prevents persistent content writes. Identity isolation, session guards, size bounds and independent 15-minute search snapshots remain intact. Clear conversation content affects browser content only and invalidates in-flight loads so they cannot repopulate it. Disconnect retains its existing identity-cache cleanup.

Settings lists stored server data (derived EvaluationRecords and form snapshots, PolicyRuns, HumanReviews, alerts, role assignments, audit and configuration) and excluded raw content (voice transcripts, email/message bodies, Genesys OAuth tokens, signed media URLs and raw EML/ZIP). Normalized conversation content is browser-only. Existing browser sandbox history is separate and has its own clear/reset controls.

### Explicit bounded purge windows

Only `retention.execute` (ADMIN) can preview or execute a purge. Preview creates an audited, durable `purgePlans` record, binds it to the verified actor, records a 15-minute expiration, saved settings, cutoff, fingerprint, window counts and cursors. It changes no product records. Counts are **for the scanned window**, not purported global totals. No customer content or record bodies appear in a preview or plan.

Each window scans at most 50 documents from each of five collections (250 records total), plus dependent-review reads. It can delete at most 300 product/audit records; transaction references are bounded below Firestore's write limit. Continuation requires another explicit preview and confirmation. There is no unbounded deletion loop or automatic background purge.

Execution requires the plan ID and literal `PURGE` confirmation. It recalculates from saved server data, checks the fingerprint and settings, and rejects changes or expired plans with 409. Transaction reads recheck each candidate, the plan and configuration before committing. The client supplies no trusted deletion IDs or counts. A newly created dependent review or a settings change between scan and commit aborts deletion.

An evaluation and its dependent review are removed together. Independent review expiration leaves its evaluation intact. HumanReview writes transactionally check that the evaluation still exists, preventing reviews from reappearing after a concurrent purge. Form definitions/group assets, policies, schedules, role assignments and configuration are never age-purged. Running policy runs are retained. OPEN and ACKNOWLEDGED alerts are retained regardless of age; only old resolved alerts qualify. Audit is indefinite by default; configured audit expiration removes only old events, and current purge events remain outside that purge's cutoff.

The executed flag, deletions and purge audit event commit together. A repeat request returns the completed plan without deleting or auditing twice. After an interrupted response, resend the same plan ID; continue using the returned cursors. Starting a fresh preview from the beginning is always safe. Plans are retained as operation bookkeeping; the scan is not a snapshot of the entire dataset, and a fresh sweep handles later insertions before an earlier cursor.

Existing spend/deduplication guards (`evaluationSlots` and execution claims) are retained intentionally. Purging an evaluation does not authorize another paid Jev attempt for its original manual identity. Query-derived quality/calibration analytics naturally reflect remaining records; no materialized aggregate is created.

## Verification and release boundary

The annotated `v0.10.0` tag was created and pushed after verifying `origin/main` at `77681cd7ac84da0a25888951507bb243036a28cf`. Remote tag object: `64b61125b981a5b750a2f1feadb8a4c033cfc835`; dereferenced tag equals the accepted source commit. V0.11 uses a dedicated worktree and `codex/aqm-v0-11-governance`, branched from that verified main. No PR or merge is authorized.

Deterministic tests exercise roles/401/403, bootstrap protection, next-request role changes, every mutation family, actor attribution, publication and lifecycle audits, bounded queries, append-only behavior, audit-failure rollback, indefinite defaults, preview safety, confirmed/revalidated purge, evaluation-review units, active-alert protection, audit preservation, bounded continuation, replay idempotence, analytics and concurrent review/settings changes. Cache tests cover TTL, zero persistence and explicit clearing. These tests use no live Genesys or Jev requests.

Browser journeys exercise all four roles at 1440×900, 1920×1080 and 390×844, including role administration, audit detail, retention confirmation, read-only forms, review permissions, stale-action 403, cache settings and inventory. Existing owner fixtures explicitly provide the new session contract. Screenshots are inspected for layout and horizontal overflow. Release checks passed: 314 deterministic tests across 39 files; all 41 browser journeys; the 12 governance journeys repeated after layout refinement; frontend typecheck/build and server typecheck/build. Screenshots were inspected at the requested sizes. The existing frontend chunk-size advisory remains non-blocking.

Deployment changes only the Cloud Run application source and GitHub Pages frontend. Preserve runtime environment, Secret Manager bindings, service account, Firestore and Cloud Scheduler job/state. The existing Daily Voice Customer Service AQM policy and daily schedule are read and compared before/after; no proof script that enables or resets scheduling is invoked. There are no development-initiated paid Jev calls or live interactive Genesys journeys on this Mac.
