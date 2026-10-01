# V0.10 advanced group scoring and operational alerts

Built from accepted `origin/main` at `650d5c96addd4fc2cc5ba5bb51adae00150aa8ab`, which is remotely tagged with annotated release `v0.9.0`. Development branch: `codex/aqm-v0-10-group-scoring-alerts`. No PR or merge is part of this release.

## Group scoring contract

`EvaluationForm.scoring.mode` explicitly selects `QUESTION_WEIGHTED` (the default when absent) or `GROUP_WEIGHTED`. Group `scoring` is optional and contains `weight`, `passScore` (0..1), and `critical`. Inert `sourceGroupWeight` is never used. Existing snapshots and stored evaluations are not migrated or rewritten.

Question weighted score remains `sum(question credit × question weight) / sum(applicable scored question weight)`. Group score uses the same calculation within a group. Skipped/null-credit results are excluded. A group without counted question weight has a null score, never zero. Group weighted overall score is `sum(applicable group score × group weight) / sum(applicable group weight)`. Applicable scored groups need explicit positive finite weights; weights need not total 100. Persisted normalized weights use the runtime applicable group denominator.

A minimum group threshold produces `passed: true | false | null`. An ordinary failed group does not itself fail the form. Critical groups require a threshold, and a scored critical group below that threshold fails the evaluation independently of numeric overall score. A skipped conditional critical group is excluded. An applicable critical group without scored questions carries `NO_SCORED_QUESTIONS`, is retained in `scoringAnomalies`, and fails closed. Existing critical question IDs and failure behavior remain intact.

Results persist scoring mode, independent critical group failure IDs, group applicability, score, threshold, weights, criticality, question IDs and the exact form snapshot. Historical records without these optional fields remain readable. Publishing rejects invalid configurations. AI and human results use `scoreFormResults`; human answers retain the evaluated applicability and snapshot. AI results are immutable. Group comparisons and version-separated Quality/Calibration aggregates expose AI scores, completed human scores, differences, applicable counts, pass rates and critical group failures.

Reusable group assets carry scoring as versioned definition content. Published definitions are immutable. A new asset version or a form's explicit update transfers scoring with questions, without changing existing consumers.

## Operational alerts

Stable types: `SCHEDULED_RUN_FAILED`, `SCHEDULED_RUN_PARTIAL`, `GENESYS_AUTH_FAILURE`, `GENESYS_QUERY_FAILURE`, `JEV_FAILURE`, `LOW_TRANSCRIPT_AVAILABILITY`, `LOW_DIGITAL_CONTENT_AVAILABILITY`, `SCHEDULER_STALE`.

The Store abstraction persists alerts in `operationalAlerts`. Firestore transactions maintain `operationalAlertKeys` pointers for deduplication by type and policy (scheduler health is global). Repeated problems update their active alert; acknowledgement survives recurrence. Resolving an alert preserves its audit; a recurrence creates a new ID. Separate provider failure codes classify errors at the provider boundary, without matching arbitrary exception text. Run-level aggregation avoids individual-evaluation alert spam. Alert bodies contain static text, related operational IDs, and numeric metadata; provider errors, transcript content and credentials are not copied into alerts.

Authenticated endpoints: `GET /api/alerts`, `GET /api/alerts/:id`, `POST /api/alerts/:id/acknowledge`, and `POST /api/alerts/:id/resolve`. Listing supports status (including ACTIVE), severity, type, policy and run filters, bounded pagination, and explicit scan-limit continuation. The server's verified Genesys actor supplies lifecycle identity. The UI places the list, active counts and inspection panel in Overview & Runs, with related-run navigation and lifecycle actions.

A later completed authenticated scheduled run resolves Genesys auth/query failures for that policy. Jev failures resolve only after a later completed scheduled run with successful evaluations. Run failure and availability alerts remain operator-resolved, because a small/empty subsequent population does not prove recovery. Scheduler stale alerts resolve after a successful authenticated tick, including no-work ticks. A scheduler health document stores installation grace and last successful tick independently of schedules. Stale detection occurs on authenticated monitoring health/alert reads; it cannot execute inside a scheduler that has stopped delivering requests. No external notification dispatch is implemented.

Conservative global defaults: at least 5 sampled interactions; warning below 70% usable content; scheduler tolerance 3 hours. Configurable through `AQM_ALERT_MINIMUM_SAMPLE` (minimum 5), `AQM_ALERT_MINIMUM_AVAILABILITY` (0..1) and `AQM_SCHEDULER_TOLERANCE_MS` (positive finite). Voice and digital availability populations are counted separately on new runs. Authenticated monitoring health exposes active/error/warning counts and tick health. Public `/health` remains anonymous and contains no alert information.

If alert persistence fails after a run completes, a sanitized server log identifies the run; the run's stored result and schedule advancement are preserved. Operational recovery can be performed without repeating paid evaluations.

## Verification and rollout

Preflight: 293 tests across 38 Vitest files passed; 21 focused Playwright journeys passed across all three viewports. Frontend/server typechecks and builds passed. Twelve new authoring/result/review/alert screenshots were inspected; mobile alert rows expose lifecycle actions as stacked cards.

Provider-free unit/API tests include the shared formulas, conditional critical behavior, invalid definitions, asset immutability, serialization, human review and version-specific calibration. Alert coverage includes scheduled failure/partial/success, structured provider typing, minimum populations, transactional deduplication, lifecycle/recurrence/audit actors, automatic recovery, stale/no-work ticks, API filters/authentication and payload privacy. Browser journeys cover authoring, thresholds, critical/read-only publication, grouped evaluation results, review comparison, calibration and alert acknowledgement/resolution at 1440×900, 1920×1080 and 390×844. Screenshots are visually inspected; focused browser checks include the existing composition, calibration, operations and digital workflows.

Cloud Run deployment uses the existing service configuration and secret references, rather than the setup script which would reconfigure Scheduler. Pages is rebuilt with the existing automation API origin. Read-only before/after Firestore snapshots verify the Daily Voice policy, schedule and history; no schedule, policy or historical records are edited by development or deployment. The V0.9 email and messaging retrieval implementations remain unchanged. The email empty-body proof and lack of completed messaging candidates remain pending live proof; no speculative retrieval fixes or paid Jev calls are introduced.
