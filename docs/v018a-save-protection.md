# V0.18A — Preserve edits and make saves honest

This tranche addresses only **R01, R02 and R14** from the [V0.18 product review](v018-product-review.md). The dedicated `codex/aqm-v0-18a-save-protection` branch starts from `origin/main` at `b4a7212cc3480013e7a04d38f7b2120c51c600a2`. No PR, merge, release tag or environment-builder-v2 change is part of this work. V0.18B/C/D/E and all other review findings remain open.

## R01 — Reusable question group drafts

`groupAssetDirty` compares deterministic authored definitions using the stable serialization already used by the domain's immutability checks. It includes name, description, questions in order and their configuration/conditions, group condition and scoring. It ignores lifecycle timestamps and object/key identity. Unsaved new and new-version drafts are dirty immediately; accepted saved imports are clean. Published and retired versions remain read-only and clean on inspection. Existing server authorization, validation and immutability are unchanged.

The editor shows textual **Unsaved changes** or **Saved <time>**, and the action is **Save changes**. Browser saves explicitly say **Saved in this browser**. Offline saves write browser storage before accepting success; storage errors preserve the working draft. Connected saves continue through the existing authorized `onSave` path. Failed validation or persistence retains the exact working definition and shows an alert. Publication validates and persists the visible working definition, including unsaved edits, before changing the editor to read-only.

Switching rows, creating another group or importing over a dirty group requires confirmation. Cancel keeps the selection and exact edits; confirm deliberately replaces them. Dirty state is reported to App's central page guard. Page navigation uses the same scoped confirmation, with cancellation staying on Groups. App has one combined beforeunload handler for dirty Forms, Policies, Groups and Governance; the former separate Policies listener was consolidated. Editors are read-only while saves/imports are pending so late responses cannot silently replace subsequent edits. No autosave or new persistence model was introduced.

## R02 — Governance save scope

Governance maintains separate saved and working settings. Authoritative load and successful PUT responses update both; only working settings change during editing. Permission/role refreshes do not reload and overwrite working settings. Dirty state is derived from the authored settings fields, with pending sections named **Privacy / browser cache**, **Review reminders** and **Retention**.

The misleading section save buttons were removed. **Save all settings** explicitly saves every pending change through the existing complete-object `PUT /api/governance`; no PATCH semantics were introduced. Failed saves keep all edits and dirty state. **Discard changes** restores saved settings without resetting roles, notifications, audit filters or other Settings controls. Success has textual time/status feedback and applies the returned cache TTL to conversationCache. Working cache-hour changes do not apply the TTL before saving. Clearing cached conversation content is immediate and never saves settings.

Unsaved Governance settings participate in App page navigation and beforeunload protection. The confirmation is: “You have unsaved Settings changes. Leave without saving them?” Confirming navigation unmounts and discards the working component state; cancellation preserves it.

**Refresh review SLA state** and **Preview retention** are disabled while settings are dirty and use saved configuration after save/discard. Any settings change or restore clears preview and typed confirmation state. Preview guidance explains the prerequisite. Bounded retention scans, typed PURGE, server revalidation, auditing and active-alert protection remain unchanged. No production settings save or purge was performed for validation.

## R14 — Explicit destructive scope

- **Remove prepared demo evaluations** removes only `synthetic-demo` evaluations and can be reversed with **Load demo analytics data**. It leaves forms, policies, non-demo evaluations and run history intact. It is available separately in Settings and browser History/Analytics.
- **Reset local forms, policies and history** confirms resetting browser forms/policies to starters and clearing browser evaluations and policy-run history. Copy says saved server data is unaffected and advises saving/copying local work. Cancellation makes no mutation. Question groups are not claimed to be removed and remain untouched.
- **Clear local evaluation and run history** confirms removal of browser evaluations/runs, explicitly preserving forms/policies and saved server evaluations/runs.
- Server Form Test cleanup confirms deleting completed saved runs for this form family, retaining running/uncertain runs, leaving production evaluations/analytics unaffected and being irreversible. No DELETE is sent on cancellation. Only explicit terminal statuses (`completed`, `partial-failure`, `failed`) are deleted; missing/unknown statuses are conservatively retained.
- Browser Form Test cleanup confirms its local scope and leaves other form families and production/server data untouched.
- **Clear pending request** confirms losing the recovery reference and the possibility that the next new test ID may issue AI requests again. Cancellation retains the exact in-memory reference and sessionStorage ID. Confirming clears it and leaves the subsequent cost warning in text. Tests do not issue a provider request.

The existing native browser confirmation convention is retained. Dirty/save state is available in text; notices and errors preserve role=status/role=alert. A narrow Form Test layout fix keeps its history action reachable at 390px, without broad Settings IA changes.

## Validation

- Full deterministic suite: **54 files, 534 tests passed**.
- Frontend TypeScript and production build passed; server typecheck and all four bundles passed. The existing Vite large-chunk advisory remains.
- **11 new fixture-only journeys passed** in development and against the exact production preview. They exercise Groups new/version/existing drafts, exact cancellation/discard, connected/offline imports, failed save/validation/browser-storage quota, publication payload, page guards and listener lifecycle; Governance full PUT payload, failure/discard, saved cache TTL, preview invalidation, refresh guards and cache-clear isolation; demo/local reset scope; both Form Test cleanup modes and recovery-ID safety.
- **34 existing distinct browser regressions** cover authoring/composition/publication, all roles' Governance, review SLA, Policies/schedules and conversation cache. Two cache journeys required explicitly accepting the already-existing unsaved-form confirmation; they then passed without changing the form guard. The final Governance/SLA journeys were repeated after the load-effect safeguard.
- Viewports: **1440×900, 1920×1080, 390×844**. Group dirty state, pending/save-all/discard UI, local reset and Form Test/recovery screenshots were inspected. Affected controls wrap and remain reachable. No page overflow or browser errors were observed in the final focused journeys.

[Evidence and reproduction instructions](v018a-evidence/README.md). Browser state and requests are fictional fixtures. External requests in the new journeys are aborted unless explicitly fulfilled; no paid Jev calls, production evaluations or production mutations occur. Native confirm text and accept/cancel decisions are recorded in `confirmations.txt`; screenshots show the surrounding application because Playwright's screenshots exclude native browser dialogs.

## Deployment and preservation

Tested application source: **fd26f4dad3a8ee666feaadf9cb7ba277f8c9cb9a**. GitHub Pages HEAD: **7d4c936110f74ddfdb910d6d254b8f923b34ee12**. [Public site](https://simonridd.github.io/Genesys-aqm/) bytes match the exact tested build ([Pages proof](v018a-evidence/pages.json)). The implementation and this final evidence are pushed only to the requested source branch, plus the existing gh-pages publication branch. Main remains at the canonical base. No PR or tag was created.

Backend source under `src/server` is unchanged, and all four compiled backend bundles match the baseline exactly when compiled from the same relative entry points ([proof](v018a-evidence/backend.json)). **No Cloud Run deployment was performed**; the unchanged revision is **aqm-api-v017-7d4b401**.

[Production preservation proof](v018a-evidence/preservation.json): **23/23 collection counts and hashes match before/after**, covering forms, reusable groups, policies, schedules/claims, evaluations, reviews, runs, alerts, notification configuration/history, roles, Governance, audit, test history and operational state. Cloud Run's entire service description/spec, revision and Scheduler configuration/runtime state also match. **No natural scheduler differences occurred in this comparison window.** No production settings save, reset, test-history deletion, retention purge or paid Jev request was initiated.

Production verification uses read-only aggregate counts and hashes. No production document contents, identifiers, tokens or personal information are saved in the evidence. Runtime configuration checks are recorded as hashes/equality results, without exposing environment or secret values.
