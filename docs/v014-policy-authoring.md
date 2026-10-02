# V0.14 durable policy authoring and scheduling

## Production workflow

Policies is the table-first authoring library and selected policy detail. When an authenticated automation service is configured, GET `/api/policies`, `/api/forms` and `/api/schedules` supply authoritative collections in bounded 100-item pages (maximum 20 pages / 2,000 records per collection). A load failure is visible and never exposes local definitions as production records. Server policies and local/demo policies are never merged. Disconnected authoring remains labelled browser-local; the legacy browser run sandbox is available only while disconnected.

The existing OperationalTable supplies search, sorting and pagination. Status, schedule and form-assignment filters combine with search. The detail has an explicit Match ALL / OR criterion builder, sampling, exact published operational form pins and a compact readiness summary. Enabled state is an ordinary edit requiring Save changes. Disable is the supported production retirement action; there is no policy deletion action.

## Save and concurrency contract (rule A)

PUT `/api/policies/{id}` sends the policy configuration plus `expectedVersion`. Creation requires `expectedVersion: null` and creates version 1. Existing saves require the version loaded by the editor (legacy documents without an explicit version are treated as version 1). A stale or missing precondition returns HTTP 409 with “This policy changed elsewhere. Refresh before saving.”

The server owns version and timestamps. A successful semantic change advances the durable version once, including enabling/disabling. Keystrokes never advance it. A semantic no-op returns the existing document without writing, timestamp changes, version changes or audit events. Equality compares sorted object keys and policy ID, name, description, enabled, criteria, exact form IDs and effective sampling; metadata/version and inert legacy scheduling text are excluded. Array order remains significant. Saving uses Store.atomic with the loaded policy as its expected value and checks pinned form documents in the same transaction, so concurrent saves or retiring a pinned form cannot silently succeed. `{item: policy}` is the durable response authority. Failed saves retain editor state and dirty state. Refresh explicitly confirms discarding pending edits; navigation and unload warn about unsaved edits.

The validator checks identity/name, positive version, enabled/description types, non-empty criterion groups and values, supported fields/operators, tag-only includes, supported sampling, finite percentage 0–100, integer fixed counts 1–25, unique valid form IDs and published/enabled/operational pins. Percentage 0 intentionally selects none, 100 selects all; normal runtime population bounds still apply. No forms is a valid inert configuration, with a readiness warning. Existing stored policies are never rewritten or migrated on reads.

POST `/api/policies/{id}/clone` copies saved criteria, sampling and exact pins into a new independent version-1 disabled policy. It creates no schedule, runs, evaluations, alerts or historical audit records. It records its own `policy.cloned` event. The editor requires saving pending changes before duplication.

## Schedule boundaries

Automation is edited in Policies, with a separate Save schedule button and independent dirty/failure feedback. PUT `/api/schedules/{id}` returns `{item: schedule}`. Daily/weekly schedules use the existing Europe/London contract, weekday/local time, calendar/DST calculations and runtime. Manual sets frequency MANUAL and enabled false, preserving schedule identity and prior attempt/success history. Paused daily/weekly configuration remains visible.

Only the server computes nextDueAt. The browser sends no nextDueAt, lastAttemptedAt or lastSuccessfulAt; the server preserves the stored attempt/success fields. Identical configuration returns the prior schedule unchanged. Policy saves never touch a schedule. An enabled schedule on a disabled policy produces a readiness warning and retains existing runtime behavior: attempts cannot evaluate a disabled policy.

New schedule identity is `schedule_<policy ID>`; the API rejects a second schedule for that policy. Store.atomic prevents concurrent creates of that deterministic identity. Existing arbitrary schedule IDs are preserved and remain editable. No schedule deletion, new scheduler model or immutable policy-version collection was added. Runs retain their original policySnapshot/version.

## Overview and governance

Overview & Runs retains operational health, alerts, durable run history and manual server plan/confirmation/execution. It shows saved schedule frequency, next due and attempt/success history and links to Edit policy & schedule. Policies links to View runs, selecting that policy and filtering loaded runs. App state handles navigation; no router was introduced. The production publish-local bridge and duplicate schedule editor are removed.

Existing policies.read, policies.write and schedules.write permissions remain authoritative on the server and are reflected in the UI. Viewer/Reviewer can inspect and navigate without mutation controls. Author/Admin can mutate under the existing role mapping. Audit is transactional and concise: policy create/update/enable/disable/clone and schedule create/update/enable/disable. It includes safe actor, version and enabled metadata, never arbitrary criteria or unsaved keystrokes.

## Validation and release

Deterministic coverage includes bounded loads/no local merge, semantic comparison, invalid policies, optimistic concurrency/races, transactional form pins, safe clones, schedule metadata/identity, permissions, audit and preservation. Playwright covers create/edit/pins/sampling/save failures/conflicts/clone/daily/weekly/manual/navigation/read-only/offline/error and layout at 1440×900, 1920×1080 and 390×844. Provider requests are fixtures; no live Genesys or Jev evaluations are needed.

Deployment preserves existing Cloud Run configuration with a source-only deploy; the old deploy-gcp script's environment/secret/scheduler rewrite is not used. Read-only Firestore snapshots before and after deployment verify the protected Daily Voice policy/schedule and existing operational documents. Release evidence is recorded separately after deployment.
