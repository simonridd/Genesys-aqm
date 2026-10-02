# V0.13 authoring productivity and portability

Built on accepted V0.12 `5439832d7c2cea2c666b8deb332dc3fbe8bb3ece`, in the dedicated `codex/aqm-v0-13-authoring-productivity` worktree. No PR or merge; environment-builder-v2 and notification delivery code are untouched.

## Draft workflow

Editable DRAFT/TESTING forms expose Save changes. Connected saves use the existing authenticated PUT API without a lifecycle transition. Server snapshots and `sameDefinition` determine Unsaved changes; success clears it and shows Saved with a time, failure leaves the edited local definition dirty. Local storage remains the browser working copy. Offline UI says Saved in this browser. Connected unsaved navigation prompts before leaving the forms page, and beforeunload protects browser exit. Cancelling navigation retains the editor. Published/retired definitions stay locked.

## Cloning and dependency safety

Duplicate as new form is distinct from Edit as new version. The server reads the source and creates fresh ID/family, version 1, disabled DRAFT, fresh timestamps. Definitions include question/group order, scoring, critical IDs, conditions, and informational source/snapshot provenance. Form-local question/group IDs can be retained because evaluation and composition contracts scope them to a form. Deep copies keep snapshots independent. No policy, evaluation, review, audit, run history, publication time or enabled state is copied.

Duplicate group inserts immediately after the source, uses deterministic collision-free group/question IDs, remaps internal conditions and critical IDs, and preserves earlier external references. Duplicate question inserts adjacent to its source, keeps its condition and critical designation, and does not rewrite later references to the original. Both validate before applying. Published/retired in-place mutation is prohibited.

Deletion reports referencing questions, groups and critical designations, including disabled question definitions. Dependencies must be removed explicitly. Deleting contained group questions ignores only dependencies that disappear with that same deletion. Keep questions in General preserves their order and validates composition; when an existing General would create an invalid ordering, it blocks. A conditional group cannot silently merge into an existing General; remove its condition first.

## Bulk actions and libraries

Editable questions have selection checkboxes and Select all in group. The toolbar appears only with a selection and provides Clear selection, Enable selected, Disable selected, Move selected to group and confirmed Delete selected. Moves append in existing effective relative order and reject forward references without reordering other questions. Enable validates; disable retains definitions/conditions under existing disabled semantics. Existing validation messages remain visible for drafts that need further edits before save/publication.

Both libraries add status, latest-family and usage filters with conservative All defaults. Forms include Draft/Testing/Published/Retired and policy assignment. Assets include Draft/Published/Retired and form snapshot usage. Existing OperationalTable search, sorting and pagination remain authoritative and combine with the domain filters.

## JSON contracts

Form schema: `genesys-aqm/evaluation-form`; reusable asset schema: `genesys-aqm/question-group`. Both use `schemaVersion: 1`, `exportedAt`, and `definition`. Export projects only defined authoring fields, including nested questions/options/conditions/scoring and snapshot/source provenance; lifecycle metadata is informational. Exports are available for readable versions, including published and retired versions.

Imports reject other schemas/versions, malformed shapes, duplicate IDs, missing/forward/self dependencies, invalid scoring, invalid string lengths and excessive counts using existing form/composition/scorecard/asset validators after structural checks. Limits: 100 KB, matching the existing authenticated API limit (smaller than the proposed 1 MB default); 500 questions, 100 groups, 255 options maximum with existing Score/Choice limits, 10,000 characters per string, question IDs 180 characters and titles 2,000 characters. Imported condition definitions are checked even when a dependent question is disabled. Unknown operational fields are excluded recursively.

Import creates an independent server-generated ID/family, version 1 DRAFT, fresh timestamps, and disabled form. It cannot restore owner/publication state or overwrite an object. Referenced reusable assets need not exist: executable snapshots remain complete and provenance stays informational. No importedFrom extension was added to the domain.

## Governance and preservation

Forms clone/import/save require forms.write, clone source requires forms.read; reusable import requires groups.write. Export follows the page's read permission. Server-authoritative mutations receive atomic safe audit events: form.cloned, form.imported, group.imported and form.draft_saved. Imported status/owner fields are ignored. Isolated Test Form stays available to new drafts; no tests or Jev calls are initiated automatically.

No scoring/evaluation/runtime, notification delivery, production policy/schedule/data, roles or retention changes are part of this release. Tests use provider fixtures only. Deployment evidence and pre/post read-only preservation results are recorded in v013-release.md.
