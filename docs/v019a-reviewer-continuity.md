# V0.19A — Reviewer continuity & completion safety

Canonical base: `4416ee416259c3c756374b14e26521d0b902b80b` (`main`). Branch/worktree: `codex/aqm-v019a-reviewer-continuity`, `/private/tmp/aqm-v019a-reviewer-continuity`.

The [whole-product review](https://github.com/simonridd/Genesys-aqm/blob/c8f58f1930c94afba0884f675c3faeedcceb8a1c/docs/v019-whole-product-review.md) remains unmerged on `codex/aqm-v019-whole-product-review` at `c8f58f1930c94afba0884f675c3faeedcceb8a1c`. This tranche fixes findings P1 #1, P1 #2 and the related evidence-return P2 #7 only.

## Original defects and resulting behavior

| Defect | Previous behavior | Result |
|---|---|---|
| Unsubmitted answers disappear | Opening conversation evidence unmounted ReviewPanel; returning initialized from the last saved HumanReview. | Answers, question notes and the overall note remain in memory through evidence and other SPA navigation. |
| Evidence return loses selection | App remembered only the destination page, returning to the evaluation list. | Exact evaluation URL/query, selected evaluation, open detail, queue mode, Analytics return context and server cursor are restored. |
| Completed assignments remain visible | Save replaced the record in place, requiring Refresh to remove completed work. | The updated record is checked against current filters immediately; authoritative list/workload reloads follow without closing the completed detail. |

## Draft lifetime and privacy

`useReviewDrafts` holds a map keyed by evaluation ID. Each entry contains only `evaluationId`, `baseRevision`, unfinished `answers`, overall `notes`, `dirty` and `editing`. AI results and form snapshots are not copied into drafts. Root owns the controller and passes it through App to EvaluationsPage/ReviewPanel. Root is the SPA session owner: About / product tour unmounts App, so App-only ownership would still lose work during that internal detour. Keeping the controller above App also keeps unload protection active there, without keeping workspace network effects mounted behind Welcome or Demo.

Drafts are never written to localStorage, sessionStorage, IndexedDB, a URL, or a new backend collection. They survive navigation in the currently running SPA only. Reload, close or another tab starts with no unsubmitted values. Save progress remains the explicit durable mechanism.

Any dirty review installs a beforeunload guard with the message semantics “You have unsaved human review changes.” The browser controls its displayed wording. Merely starting a review does not install protection. Multiple dirty reviews keep protection active until all are saved, completed or explicitly discarded. Existing forms, groups, Answer Sets, policies and Settings guards remain independent and unchanged.

The review shows **Unsaved review changes** and **Kept temporarily while you inspect this session.** Evidence inspection and other workspace navigation do not request a discard confirmation. Reopening another review does not destroy the first review's draft. No cross-review global banner or queue auto-advance was introduced.

## Evidence return and keyboard behavior

Before leaving evaluation detail, the application captures the exact `location.href`, evaluation ID, `returnFocus` and current server cursor. Query state carries all existing filters, assignment/due/queue mode, evaluation source and Analytics cohort/tab return information. The return URL is restored directly, rather than rebuilt from selected filter fields. The context is held in memory and adds no URL contract.

Review evidence has a real **← Back to review** button, or **← Back to evaluation** when review editing was not active. Ordinary Conversations navigation keeps **← Back to conversations**. Evidence entry focuses the Conversation review heading; return focuses/scrolls to Human Review when editing or unsaved work was active, otherwise to evaluation detail. Completion focuses the confirmation. Close restores the original opener where it still exists, or the Evaluations heading after the queue row is removed.

## Authority, revisions and assignment

- An absent/clean draft initializes from authoritative HumanReview. A compatible draft survives remounts.
- Successful Start / Claim uses the returned HumanReview and its revision, with `dirty=false`.
- Every input change updates the session map immediately.
- Successful Save progress adopts the returned review, replaces draft values, advances `baseRevision` and clears dirty state.
- Successful Complete adopts the returned review and clears that evaluation's draft.
- A dirty draft is never replaced by observation, background detail refresh or **Refresh review**. A differing authoritative revision produces a conflict alert, retains all values, and disables submission. Refresh reads current authority; **Discard my unsaved answers** explicitly adopts it. There is no automatic rebasing.
- `expectedRevision` and the existing HTTP 409 behavior remain intact. A callback ref makes pending saves reconcile the latest filters rather than the scope captured at click time.
- Reassignment retains the draft but removes editing/submission when current ownership does not permit them. Existing assignment-manager operations remain authoritative.
- If another session completes the review, the unfinished comparison remains visibly a progress preview, not a completed score. Explicit discard reveals the authoritative completed answers. A clean saved draft yields immediately to newer authority and is removed from the session map when the review is complete.

## Queue reconciliation and completion

Every authoritative HumanReview update constructs the updated ReviewEvaluation and uses existing `matchesEvaluationFilters(...)` with the current query, actor, current time and SLA settings. A record that no longer matches is removed immediately. This handles My Reviews, active reviews, status, assignment and due filters without a special-case completion predicate. Existing server review/SLA semantics are unchanged.

In My Reviews, the completed record disappears immediately. `reviewQueue=active` and active status/due cohorts also remove it. All Evaluations retains it when it still matches, immediately showing Reviewed, human score and reviewer/completion data.

The existing workload endpoint refreshes after state-changing actions. Older list requests are invalidated. The background server page reload uses the current cursor; no page backfill or forced page-one jump was added. Detail and its confirmation stay mounted even when the row disappears or a subsequent list refresh fails.

My Reviews confirms **Review completed. It has been removed from My Reviews. The original AI result is preserved.** Other scopes confirm completion without the My Reviews claim. **Close and continue My Reviews** gives the reviewer control over progression.

## Validation

| Layer | Final result | Evidence |
|---|---|---|
| Frontend TypeScript / production build | Passed | [Build log](v019a-evidence/frontend-build.txt) |
| Deterministic / unit / API | 600 passed, 62 files | [Deterministic log](v019a-evidence/deterministic-tests.txt) |
| Focused reviewer Playwright | 27 passed; zero failed, skipped or flaky | [Focused log](v019a-evidence/focused-build.txt), [JSON report](v019a-evidence/browser-results.json) |
| Existing regressions | 81 passed; zero failed, skipped or flaky | [Regression log](v019a-evidence/browser-regressions.txt), [JSON report](v019a-evidence/regression-results.json) |
| Responsive and keyboard | Passed at 1440×900, 1920×1080, 390×844 | [Control bounds](v019a-evidence/bounds-390.json), [mobile restored state](v019a-evidence/restored-viewport-390.png), [desktop evidence](v019a-evidence/evidence-viewport-1440.png), [wide completion](v019a-evidence/completed-viewport-1920.png) |
| Original V0.19 reviewer goal replay | Passed with the real local HTTP API and fictional authenticated data at all three sizes | [Task actions](v019a-evidence/recheck/task-actions.ndjson), [fixture network boundary](v019a-evidence/recheck/fixture-network.ndjson) |

Focused coverage includes the unsaved loss reproduction, all answer/note fields, zero review PUTs on the evidence detour, zero review-draft writes to each browser store, exact My Reviews filters, exact Analytics question/cohort/tab return, clean start, save/base-revision adoption, My Reviews/All Evaluations/active/status/due completion, authoritative workload refresh, later-page cursor, dirty revision 3 → 4, reassignment, 409 refresh, multiple drafts, failed completion and retry, failed background list refresh, reload, About handoff, pending-save filter changes, dirty and clean saved states after completion in another session, and keyboard focus. Status/confirmation uses `role=status`; conflict uses `role=alert`.

Existing suites: V0.18B investigation links, V0.18E usability/detail focus, review operations, review SLA, calibration, conversation browser/cache, showcase/handoff/isolation, V0.19 Answer Sets and save protection.

Initial failures are retained and classified in [validation](v019a-evidence/validation.json). Restricted-sandbox socket failures were rerun with local socket permission. New harness corrections concerned Vite's non-blocking unload listener, native select keyboard behavior, an omitted Overview fixture and an exact-label locator. Three old calibration assertions specifically required Refresh to overwrite unsaved values. That directly related assertion was converted to retention, blocked submit and explicit discard; unrelated baseline assertions were not edited. A final authority-edge fixture initially edited a stale row before its detail fetch reached revision 3; the fixture now waits for revision 3 before testing the intentional change to revision 4. This preserves the product’s existing conflict protection. Historical evidence overwritten by legacy suites was restored rather than included as unrelated changes.

### Human-effectiveness recheck

The original rubric is unchanged: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive.

**Reviewer usability: 4/5, previously 2/5.** At all three sizes, the reviewer enters independent answers, inspects original evidence, returns to the same review with those answers and notes intact, and completes once. Completion removes the assignment and refreshes workload, while preserving the comparison for inspection. The former reopen and manual-refresh detours both disappear: 2 → 0. The remaining long comparison and mobile vertical movement prevent 5.

**Workflow coherence: 3/5, previously 2/5.** The review/evidence/completion path is now continuous and trustworthy, and exact Analytics investigation return remains intact. Broader authoring, Analytics language and role-navigation problems remain, so this targeted repair does not warrant declaring whole-product coherence polished.

The answer to “Can a reviewer safely inspect the evidence, return, and complete the work without worrying about losing progress?” is yes for the tested journeys, including explicit protection at revision/assignment conflicts. This is an agent task replay on fictional data in Chromium with emulated viewports, not recruited human research, native mobile-device testing or a full screen-reader audit.

## Deployment and preservation

Frontend-only. No server route, schema, shared domain implementation or Cloud Run source changed. Pages publication and its exact source/archive/public-byte proof will be recorded here after the committed-source deployment. Initial production snapshots contain only counts/hashes, configuration hashes and health timestamps: [collections](v019a-evidence/before-collections.json), [runtime](v019a-evidence/before-runtime.json). No production review write is required or used for proof.

The requested model switch could not be applied by the executing turn's tools; the user was asked to select GPT-5.6 Sol / Medium in the app. No claim is made that a runtime model switch occurred.

## Deferred findings

Connected authoring footer contradiction; mobile form-editor length; Analytics architecture/IDs; Answer Set repair guidance and terminology; navigation role focus; coverage terminology; Overview ordering; mobile tabs; `aria-current` on primary navigation. No authoring simplification, Analytics redesign, navigation consolidation, mobile form-editor redesign or broader terminology cleanup was implemented. `environment-builder-v2` was not modified.

## Handoff

Commit implementation and evidence on the dedicated branch; publish only the tested frontend; push without creating/opening a PR, merging or tagging. Next: ChatGPT review/merge decision.
