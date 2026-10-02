# V0.16 review SLA contract

HumanReview remains the review authority. No task, reminder, contact-directory or notification system is added. Completed reviews and AI evaluation records are unchanged.

## Settings and classification

GovernanceSettings.reviewSla defaults on read to dueSoonHours=24 and overdueEscalationHours=48. ADMIN/settings.write saves settings through the existing governance transaction and audit. Due-soon is an integer 1–168 hours; escalation is null or an integer 1–720 hours. Null disables escalation. Defaults create no due dates and require no migration. Quiet hours remain deferred.

The single reviewDueState helper uses ISO timestamp instants and explicit clocks:

| State | Condition |
|---|---|
| COMPLETED | REVIEWED, regardless of due date |
| NO_DUE_DATE | No explicit date or outside the active lifecycle |
| ON_TRACK | Before dueAt minus dueSoonHours |
| DUE_SOON | Inclusive window start, strictly before dueAt |
| OVERDUE | At or after dueAt, before enabled escalation threshold |
| ESCALATED | At or after dueAt plus overdueEscalationHours |

V0.15 assigned dates remain in assignment.dueAt. Unassigned dates use HumanReview.dueAt. The reviewDueAt accessor reads the assignment date first, then the unassigned date. Assignment/unassignment moves the date between these locations; due-date mutation clears both locations as needed. No derived state flags are persisted. Completed HumanReviews are never migrated or rewritten.

## Alert lifecycle and notification routing

REVIEW_DUE_SOON is INFO, REVIEW_OVERDUE is WARNING, REVIEW_ESCALATED is ERROR. Review alerts use source=review-sla and an explicitly projected context: evaluationId, reviewId, formId, dueAt and optional assigneeUserId. No transcript, review notes, question answers, form snapshots or interaction content enters alert or notification payloads.

The alert identity hashes review ID, assignee ID, assignment time, latest assignment/due-change revision, due timestamp and stage. Existing operationalAlertKeys holds both a per-review current pointer and durable per-stage keys. Firestore transactions verify the authoritative review before resolving/opening alerts and atomically create the existing NotificationEvent records. MemoryStore has equivalent behavior. Concurrent sweeps create one alert and one OPEN notification event. Repeated sweeps preserve occurrences=1 and acknowledgement. Stage keys survive resolved-alert retention, so purging history cannot resend the same stage.

Progression resolves the current stage with automatic provenance and opens the next stage. Completion, deletion, removal of a due date and moving a date outside the monitored window resolve the active alert. Acknowledgement does not change dueAt, complete the review or prevent escalation. Manual resolution does not reopen the same unchanged stage; a later escalation stage can still open. If a settings change returns a review to an automatically resolved prior stage, that same alert reactivates with an appended event, without creating another OPEN/RESOLVED routing event or altering delivery history.

Assignment/reassignment/unassignment and assigned review completion run the same evaluator after the protected review write. Reassignment resolves the old assignment's alert and opens a distinct alert if the new assignment is still due soon, overdue or escalated. Unassigning retains an explicit due date and produces an unassigned alert when applicable. Saved review writes remain successful if their post-write check is unavailable; a separate incomplete health record exposes the deferred check, and the next periodic sweep retries it.

Existing NotificationRule → NotificationDestination → NotificationDelivery routing and idempotence are reused. All three review alert types are selectable. Existing notifyOnResolution behavior applies. Configuring no destination or rule leaves alerts visible in product. No direct reviewer email, role email fields, Genesys contact lookup or hidden destinations. Payloads include safe review identifiers and a fixed application URL; the existing email adapter renders Open review. The link preserves review selection through a required PKCE login.

## Bounded sweep and health

The trusted schedulerTick runs normal schedule work, scheduler health, then review SLA sweep. Its existing API tick then routes/dispatches notifications. The evaluator uses only Firestore/MemoryStore; it makes no Genesys or Jev calls and creates no per-review jobs. ADMIN may invoke POST /api/review-sla/refresh; it runs only the same evaluator and does not dispatch external providers.

Store.activeReviewPage queries only REVIEW_REQUESTED/IN_REVIEW, ordered by document ID, in pages of 100. Each sweep stops at 2,000 active reviews. A separate bounded active-alert query (OPEN/ACKNOWLEDGED, maximum 2,000) catches deleted or inactive reviews without reading resolved alert history. Concurrent review changes and ceiling exhaustion explicitly mark the sweep incomplete. This seam can later support indexed partitioning/continuation; work beyond the ceiling is not claimed as processed.

Overview & Runs shows live server-derived open/due-soon/overdue/escalated totals plus the last sweep's completeness. Due-state totals are mutually exclusive. Incomplete results display Review SLA scan incomplete, independently of scheduler, Genesys and Jev health. OperationalHealth/reviewSla stores only safe summary/completeness information. There are no new collections: the new health document, alert-key pointers, alerts and notification events use existing collections. Governance stores a reviewSla setting only when explicitly saved.

Workload adds stage counts for each reviewer and an Unassigned row; revoked reviewer access remains visible. The existing 2,000 evaluation/role completeness checks are retained, and active review scanning has its own ceiling. UI summaries are server-derived, never totals of a loaded page.

## Queue and bulk dates

My review queue orders the server active set before paging: escalated, overdue, due soon, other in-review, other requested; within each, earliest due date first and undated work last. The ordinary Evaluation Explorer retains its ordering and bounded scan behavior. Badges use text plus color, and relative times update each minute using the shared deterministic helper and saved thresholds.

POST /api/reviews/bulk-due requires reviews.assign. It accepts 1–20 unique {evaluationId, expectedRevision} selections and dueAt as an ISO timestamp or explicit null to clear. Only requested/in-progress reviews qualify. All records, actor access, evaluation snapshots and revisions are validated before one guarded all-or-none transaction. Assignment, partial answers and scorer are preserved. No-op dates keep the same revision and alert epoch. Review history and existing generic audit capture old/new dates or clearing. Queue state changes immediately; alerts use the next sweep.

Existing reviews.write, alerts.read, alerts.acknowledge/resolve and settings.write permissions are unchanged. Active alerts remain protected by existing retention; resolved alerts and deliveries use their existing categories.

## Proof

Fixed-clock tests cover thresholds/timezones, lifecycle/deduplication/concurrency, assignment epochs, completion/resolution, notification payload safety and provider-free delivery, workload and incomplete scans, bulk bounds/revisions/rollback/audit, permission enforcement and global queue paging. Playwright uses fixture OAuth/API/providers, captures all three requested viewports, verifies badges/order/settings/bulk dates/health/alert links/completion/mobile overflow, and asserts evaluation records are unchanged. Production checks are read-only.
