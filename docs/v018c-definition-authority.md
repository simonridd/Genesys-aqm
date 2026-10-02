# V0.18C — Connected definition authority

This tranche closes **R05** from the V0.18 review. The dedicated `codex/aqm-v0-18c-definition-authority` worktree starts from `origin/main` at **17d8d06032db3fb6996552c26e298fc5369d4692**. R06+, V0.18D/E, environment-builder-v2, PR creation/merging and v0.18.0 are outside this work.

## Authority before and after

Previously App matched Conversation Detail against browser policies while Policies owned its own server collection. Forms loaded server definitions into the browser collection and wrote that mixture back to localStorage. Question Groups similarly merged server assets into the starter/local collection. The result could display local policy matches, inflated configuration usage and uninstalled reusable groups in a connected production workflow.

`useSavedConfiguration` now owns three independent saved collections in App: `/api/forms`, `/api/policies` and `/api/question-groups`. Forms, Policies, Question Groups and Conversation Detail consume those same collections. Each has bounded pagination, loading/error/loaded state, explicit refresh and server-response acceptance. Identity changes hide previous saved collections immediately. Late reads from an old identity are discarded; a server save completing during a GET is overlaid onto that GET result. There is no aggregation endpoint or backend schema change.

| Scope | Forms | Policies | Reusable groups |
|---|---|---|---|
| Connected production | Saved `/api/forms` | Saved `/api/policies` | Saved `/api/question-groups` |
| Disconnected exploration | Browser forms | Browser policies | Browser groups and starters |
| Connected secondary content | Local drafts, examples and preserved copies | Existing local sandbox restored on disconnect | Local drafts and starter examples |

No connected production path falls back to browser definitions when saved configuration is loading or unavailable. A failed refresh retains the last saved baseline solely for authoring recovery, with explicit unavailability. Routing, manual selection and the saved reusable-group picker require a successfully loaded collection.

## Forms and working copies

The primary **Saved in AQM** library contains server definitions only. Assigned policy counts use saved policies, never browser examples. Unavailable policy usage is displayed as unavailable. Manual production selection and automatically applicable evaluations contain only saved, published, enabled, valid forms. Saved DRAFT/TESTING definitions remain testable through Form Test.

**Local drafts & starter examples** is a separate disclosure. Six starter forms, existing custom drafts and imported local definitions remain in the existing browser collection. A same-ID historical copy never becomes a working override by inference: the saved row remains authoritative and the preserved browser copy offers export or **Use as new draft** separately.

Intentional edits to a saved DRAFT/TESTING form are a working override of one saved row. The browser persists these separately under `genesys-aqm-v018c-form-working:<verified identity scope>`; existing local form/policy/group schemas and storage keys are unchanged. Scope includes region, client, organization and user, without access tokens. Server collections are never serialized into the local-definition library. Refresh success/failure retains edits, failed saves retain edits, and existing leave/beforeunload protection remains. Only an explicit successful save accepts the server response and removes that working override. A new unsaved form remains local until its first save; it then appears once in the saved library. Its former local copy is preserved in the historical same-ID disclosure instead of being deleted.

If another author publishes a form during refresh, that saved definition stays immutable. The previous working copy remains available for export/recovery as a new draft and cannot make the published saved row editable. Existing reusable-group snapshots remain self-contained and unchanged even when source assets cannot be resolved.

## Policies and routing

Policies no longer loads its own policies or forms on mount. It consumes shared collections and retains its independent schedule editor/collection. Existing dirty drafts, HTTP 409 handling, server-owned versions, filters, clone, exact form pins, daily/weekly editing, refresh confirmation and separate policy/schedule saves remain. A save or clone immediately updates shared saved policies. Failed collection refresh does not discard policy/schedule drafts, and policy creation is unavailable after a failed saved-policy load.

Connected Conversation Detail matches **saved policies**, resolves their exact `evaluationFormIds` against operational saved forms, and displays saved policy names. Missing/non-operational assignments produce a configuration-inconsistency alert; a same-ID local form is never substituted. Loading shows **Loading saved routing…**; failure shows **Saved routing unavailable** and **Saved policy routing could not be loaded**. A successfully loaded empty match set says **No saved policy matched**. Saved form manual selection remains independently available after policy failure if forms loaded successfully. Disconnected routing uses the existing local policies again.

## Reusable groups

`useGroupAssets` now keeps local groups separate and delegates saved groups to shared configuration. The primary library contains saved groups only. **Used by forms** counts saved forms only; failed form loading makes usage unavailable. Connected saved-form authoring offers only published saved groups, with explicit loading/error messaging. Saving or publishing a group updates the shared collection immediately.

The former **Save starter library to server** bulk button is replaced by per-item **Save as AQM draft** in the explicitly local starter disclosure. It creates a fresh draft through existing portability semantics and accepts the server's response. The user must explicitly publish that saved draft before it appears in the saved reusable-group picker. Page loads and connection transitions never import or publish starter groups.

## R05 closure and validation

The deterministic suite passes **57 files / 554 tests**, including seven authority tests. Frontend typecheck/build, server typecheck and all existing backend bundles pass. The existing Vite large-chunk advisory remains.

The focused fictional browser harness blocks every non-fixture external request and rejects unexpected API writes. Nine journeys cover saved/local libraries, same-ID preservation, counts, routing, selectors, policy/form/group save propagation, explicit group import/publish, new-form promotion, dirty refresh, save failure, independent endpoint failures, loading, disconnect/reconnect and local-storage equality at **1440×900, 1920×1080 and 390×844**. An additional journey covers exactly two saved forms versus three starters and one local draft, persisted working-copy recovery after authenticated reload, actual voice matching versus a nonmatching messaging conversation, and a missing saved pin despite a same-ID browser form. An eleventh journey verifies that a failed policy refresh retains both policy and separate schedule drafts. Group refresh failures also preserve working edits. These journeys never invoke evaluation providers.

The exact review policy name **Daily Voice Customer Service AQM** is asserted; **Customer Service Messaging** and **Cross-channel monitoring sample** cannot appear in connected matches unless saved. Saved form usage is one saved policy; saved group usage is one saved form despite local copies with the same snapshot reference. Navigating among configuration and Conversation Detail fetches each shared definition collection once, without independent Policies fetches.

**33 existing browser regressions** for authoring/portability, policy authoring/RBAC/schedules, save protection, reusable composition/snapshots, publication, control-plane cache and production evaluation operations pass alongside the nine focused journeys. The older composition regression was updated to inspect intentional saved-form edits in the new working-copy storage rather than require server definitions to contaminate the local library. Its snapshot independence, identity stability, publication and provider-free evaluation assertions remain.

Screenshots from production preview are inspected at all three widths. The new local disclosures have bounded padding and wrapping actions; existing wide tables retain their horizontal scroll. No R06 keyboard-table or R11 mobile-action redesign is included. The existing cache regression emits its pre-existing duplicate-option React key warning; no page errors occur in the new journeys.

Reproduction and logs: [V0.18C evidence](v018c-evidence/README.md).

## Deployment and preservation

Publication and final before/after preservation comparison are pending. No backend runtime source changed, so **no Cloud Run revision will be deployed**. Only the requested source branch and existing GitHub Pages publication branch will be pushed. Production proof uses read-only collection counts/hashes and runtime/IAM/secret-metadata/Scheduler hashes; it does not read secret values or mutate production configuration.

R06+, V0.18D/E, browser evaluation history, demo analytics storage, provider execution/idempotency and release tagging remain outside this tranche.
