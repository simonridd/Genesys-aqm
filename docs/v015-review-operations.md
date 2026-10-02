# V0.15 review operations

Evaluations remains the review work surface. HumanReview remains the authoritative record, with optional `assignment: { assignee, assignedAt, assignedBy, dueAt? }`. Assignment identifies the intended reviewer; `reviewer` identifies the actor who actually saves/scores. There is no task collection or persisted overdue flag.

## Server contract

- `GET /api/reviewers?limit=50&cursor=…` returns only userId, displayName and effective role. Limit 1–100; bounded 500-role scan with continuation. Bootstrap ADMIN is included without a role document. Only allowlisted users with reviews.write are eligible. Read permission suffices; roles.manage is not required.
- `PUT /api/reviews/:id/assignment`: `{ action: 'assign'|'reassign'|'unassign', expectedRevision, assigneeId?, dueAt?, confirmInReview? }`. Requires reviews.assign. Assigning NOT_REVIEWED creates the request and assignment together. Completed records are frozen. IN_REVIEW assignment changes require explicit confirmation and preserve every answer, note, comparison and actual reviewer.
- `PUT /api/reviews/:id`: existing scoring contract plus `action: 'claim'`. Claim and start requires unassigned REVIEW_REQUESTED, reviews.write and the current revision. It atomically assigns the authenticated actor, starts review, and derives reviewer identity. Starting/saving an unassigned requested review also claims it for compatibility. Another assignee blocks scoring for ADMIN as well as REVIEWER; takeover must explicitly reassign first. Unassigned in-progress legacy reviews remain writable by their recorded reviewer.
- `POST /api/reviews/bulk-assign`: `{items:[{evaluationId,expectedRevision}],assigneeId,dueAt?}`. Select 1–20 unique NOT_REVIEWED/REVIEW_REQUESTED evaluations. Every record is validated before one all-or-none transaction. Shared dueAt is normalized once. No bulk IN_REVIEW or REVIEWED changes.
- `POST /api/calibration/sample` optionally accepts assigneeId/dueAt, using the same bulk contract. Assignment permission is checked even for an empty sample.
- `GET /api/review-workload`: complete server summary of assigned open, requested, in-review and overdue per reviewer, plus unassigned requested. Evaluations/reviews/roles each have a 2,000 complete-scan ceiling. Beyond it, `{complete:false,needsIndexing:true,items:[],message}` explicitly omits totals. Removed reviewer access is surfaced without deleting assignment.

Review/evaluation filters combine existing filters with `assignment=unassigned|assigned|mine|USER_ID`, `due=overdue|today|week|none`, and `reviewQueue=mine`. Mine always uses the authenticated actor, ignoring browser assignee IDs. Evaluation pagination retains its 500-scan ceiling and scanLimited continuation. My review queue includes only assigned requested/in-progress reviews and orders the loaded page by overdue, nearest dueAt, then oldest request/evaluation using a derived priority column; global OperationalTable behavior is unchanged.

Due dates accept ISO timestamps with explicit timezone. Browser datetime-local input is converted to ISO using the browser's local timezone. No SLA default is added. Overdue means unfinished and dueAt strictly before now. Due today uses Europe/London calendar boundaries; next seven days is the inclusive upcoming rolling seven-day window. Completed records are never overdue.

## Permissions, concurrency and audit

Only ADMIN gains reviews.assign by default. REVIEWER retains reviews.write/self-claim. AUTHOR and VIEWER gain no review mutations. Actor and assignee roles are checked and guarded in the same transaction as the evaluation snapshot and HumanReview revision. A role removal or stale assignment/scoring write cannot commit over the checked state. Concurrent claims have one winner and one HTTP 409; stale edits refresh before retrying.

Review history adds review_assigned, review_reassigned, review_unassigned and review_claimed, retaining time, verified actor, revision, safe assignee and dueAt. The existing 200-event limit remains. Generic append-only audit records each event plus review.bulk_assigned count, assigneeId and dueAt in the same transaction; no answers or notes enter audit metadata.

Retention still purges HumanReview with dependent evaluations; no new retention collection is needed. Calibration still counts only completed human answers. Assignment, due dates and overdue do not alter calibration metrics. No new overdue alerts, notifications, scheduler changes or Jev calls are introduced.
