# V0.13 release evidence — 2 October 2026

V0.13 authoring productivity and portability is implemented and deployed. Dedicated branch: `codex/aqm-v0-13-authoring-productivity`. No PR was created or merged. Main remains `5439832d7c2cea2c666b8deb332dc3fbe8bb3ece`. environment-builder-v2 was not accessed or changed.

## RELEASE

Fetched and verified origin/main exactly at the requested accepted V0.12 SHA. Verified v0.12.0 absent locally/remotely, created the annotated tag “Genesys AQM V0.12.0 — External alert notifications”, pushed and remotely verified it. Tag object: `6ffd97ae4a0b28c81a9e80bd6557f07cd96c1ef2`; peeled target: `5439832d7c2cea2c666b8deb332dc3fbe8bb3ece`. Then created the dedicated worktree/branch from origin/main.

## DRAFT UX

Save changes persists connected DRAFT/TESTING definitions through the authenticated form PUT API without changing lifecycle status. Canonical server-definition comparison supplies dirty state. Success shows Saved with a time and clears dirty; a failed save retains the browser working copy and Unsaved changes. Offline editing shows Saved in this browser. Unsaved navigation can be cancelled, and browser exit gets a native warning. Published/retired definitions remain immutable.

## CLONING

Form cloning uses a server-read source and fresh independent family/ID, version 1, disabled DRAFT and fresh timestamps. It preserves groups/questions/order, conditions, rubrics, scoring, critical IDs and informational snapshot/source provenance; no operational records/publication state are copied. Form-scoped internal IDs are retained and tested. Group duplicates get unique group/question IDs, adjacent group order, internal reference/critical remaps and valid earlier external references; asset snapshots stay independent. Question duplicates are adjacent, preserve safe conditions and critical designation, and leave later references to the original unchanged. Empty authoring drafts can clone/export; import still requires a valid scorecard.

## BULK

Editable-only selection, Select all in group, Clear selection, enable/disable, append-to-target move and confirmed deletion. Moves retain effective relative order and block unsafe forward dependencies. Enable validates; disable preserves definitions and existing disabled semantics. Question/group deletion lists referencing questions, groups and critical designations instead of silently breaking dependencies. General merges validate ordering and do not silently discard a group condition. Details: [authoring contracts](v013-authoring.md).

## LIBRARIES

Both libraries add status, latest per family, and usage filters. Forms distinguish policy-assigned/unassigned; reusable assets distinguish used/unused snapshots. All/All/All remain defaults. Existing OperationalTable free-text search, sorting and pagination are preserved. Browser checks exercise filters combined with existing search.

## PORTABILITY

Envelopes use `genesys-aqm/evaluation-form` or `genesys-aqm/question-group`, schemaVersion 1, exportedAt and an explicit definition projection. Lifecycle metadata in exports is informational. Imports use server-generated identity/family, version 1 DRAFT, fresh timestamps and disabled forms; no owner/publication state, assignments, evaluations, reviews, history, secrets or notification configuration are restored. Existing snapshots remain executable when their source assets are missing.

The existing authenticated API has a 100 KB request limit, so import retains that smaller convention instead of expanding to 1 MB. Structural bounds plus existing validateForm/validateComposition/validateScorecard/validateGroupAsset reject malformed definitions, unsupported schema/version, duplicate IDs, missing/self/forward references, invalid scoring and excessive counts/string lengths. Unknown fields are stripped recursively. Full limits and semantics are recorded in [authoring contracts](v013-authoring.md).

## GOVERNANCE

forms.write authorizes save/clone/import; clone also checks forms.read. groups.write authorizes reusable import. Export follows page read permission. Mutations remain server authoritative and atomically audited with safe metadata: form.cloned, form.imported, group.imported and form.draft_saved. Published objects cannot be changed by in-place authoring operations. New drafts remain eligible for isolated Test Form; no automatic tests/evaluations are started.

## VALIDATION

- 399 deterministic tests passed in 44 files, including 16 new authoring/portability/API cases.
- 22 focused Playwright journeys passed: authoring, composition, publication and RBAC across 1440×900, 1920×1080 and 390×844. The four authoring/offline journeys also passed again after the final portability/layout changes.
- Browser journeys cover save failure/success, dirty clearing, cancelled unsaved navigation, published cloning, group/question duplication, multi-select, disable/enable/move, dependency deletion warnings, filters/search, form/group download/upload and imported DRAFT state, plus offline persistence across reload.
- Frontend typecheck/build, server typecheck and server build passed. Existing Vite chunk-size advisory remains.
- Screenshots of form headers, full form editors and imported group editors at all three sizes were inspected. The mobile form header now stacks the title/actions; selection controls appear only with a selection.
- Live public health returned 200. Anonymous forms/import endpoints returned 401; anonymous Scheduler tick returned 403, without executing a tick.
- Isolated live public browsers at 1440×900 and 390×844 loaded V0.13 authoring without page errors or organizational sign-in.
- Public Pages HTML points at the tested assets; fetched JS/CSS exactly match local build bytes.
- Authenticated saves/imports/clones were exercised with deterministic local API and mocked browser fixtures, not a live organizational sign-in. No development-initiated Genesys retrieval, paid Jev request, production evaluation/run, or notification test send was made.

## DEPLOYMENT

Final backend source: `c474376a62dc2ac10c06677e8f891580ae014aeb`, deployed from a Git archive of that exact tested commit. Final frontend source: `9da922159329a8fbef8483b10e5b3e05a6498c32`; its subsequent change is CSS and screenshot assertions only, with no backend/domain code difference from the backend source. This release evidence is a subsequent documentation commit.

Cloud Run: project genesys-aqm-2026, region europe-west2, service aqm-api. Ready revision `aqm-api-v013-c474376`, 100% traffic.

Image: `europe-west2-docker.pkg.dev/genesys-aqm-2026/cloud-run-source-deploy/aqm-api@sha256:a17a532cd7dc3af55611736dd1e06398e12f802dfd9ebf2e2b8a7ac8e7257953`.

GitHub Pages HEAD: `fefe9e1c4f0713d56ffb5483a46185002f562eec`.

- `index-DvF_vv97.js`: `35e8f2f3da4c4f06d97c83a2b01ff9efca01f3bfb23feaeefe3a2185051b95ca` (HTTP 200, exact local build bytes).
- `index-DneW55sJ.css`: `46249958e9b0549fb1bcce7100ea432bb44638d0c68a1ff5e6f29467d1410a69` (HTTP 200, exact local build bytes).

Site: [Genesys AQM](https://simonridd.github.io/Genesys-aqm/). API: https://aqm-api-bd54ukouga-nw.a.run.app

## PRESERVATION

Read-only pre/post snapshots compare equal for all 12 inspected Firestore collections, including document creation/update timestamps. Runtime configuration apart from image is identical, including environment values, Secret Manager bindings, service account, concurrency, timeout, resources and scaling annotations. Scheduler configuration is identical after excluding naturally advancing lastAttemptTime/scheduleTime. No Scheduler deployment script was used.

| Collection | Documents | Canonical SHA-256, equal before/after |
|---|---:|---|
| evaluationForms | 7 | `ba29ee9e2b6bedfcf6857d0d9b76180b95c01a91781c8ffc6559146fba73b60b` |
| policies | 7 | `25c834d2b02213719e761705632843cc028292c90bf530fdc12825809def12c8` |
| schedules | 1 | `33eeaf1c097a3a5a1d20378da0b9eab778b3008010830ffd4f6c60a81ef1271e` |
| policyRuns | 3 | `ab7d96f05458c43c18b9efa0ea880c4f48dcc3449773f146ff68448990a7cf4d` |
| evaluationRecords | 8 | `414c7bf6ccf6dfd91f29dcd8c2d05957e15696ae5544fa0ff07c21ad6088cd57` |
| humanReviews | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| operationalAlerts | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| questionGroupAssets | 4 | `222a5d070337ad9d130755383e1e148eb72937012dae9037737ccfccabd4b618` |
| notificationDestinations | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| notificationRules | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| roleAssignments | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |
| governanceSettings | 0 | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |

Daily Voice Customer Service AQM, its daily schedule/state, evaluations, HumanReviews, alerts, reusable assets, role assignments, retention and notification destinations/rules remain unchanged. Source diffs confirm scoring/evaluation composition, runner and notification provider/delivery files are unchanged. Simon's separate live notification proof remains outside this release.

Sanitized local comparison evidence: `/private/tmp/aqm-v013-preservation-proof.json`; public asset/boundary proof: `/private/tmp/aqm-v013-public-proof.json`. Raw snapshots remain local and were not committed.
