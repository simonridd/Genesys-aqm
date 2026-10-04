# V0.21B — Investigation result focus

Base exactly `77f4f0870378e342b633cfd4821476941ec1bd70` (`origin/main`, verified before editing). Dedicated branch/worktree: `codex/aqm-v021b-investigation-result-focus`, `/private/tmp/aqm-v021b-investigation-result-focus`. Frontend-only implementation in `src/EvaluationsPage.tsx`. Backend remains `aqm-api-v019-e92f2d6`.

## N3 baseline, measured on exact main

Four fictional authenticated browser captures cover Analytics Questions → weakest question → Inspect evaluations and Calibration → top disagreement → Inspect question → Open disagreements, at 1440×900 and 390×844. The source action is focused and activated with Enter. After successful destination loading, actual ordinary entry focus is the browser body because the source opener unmounts. Count every Tab until the existing first evaluation-opening button receives focus: **Analytics 58; Calibration 56**, at both sizes. These actual current-main measurements supersede the earlier approximate 48–49 review estimate; no artificial destination focus is supplied to shorten the baseline. The surrounding navigation/interaction browser remains part of the real rendered product.

Analytics: **Customer Service v17 / Clear next step**, `form=general_service@17`, `question=understanding`, `cohort=analytics`, Genesys Cloud, 2026-09-01 through 2026-09-30, Agent Sam, Queue Claims, voice, scheduled, policy `daily_voice`. Same three visible IDs/order: `quality-0`, `quality-2`, `quality-4`.

Calibration: **Customer Service v17 / Clear next step**, `form=general_service@17`, `reviewQuestion=understanding`, `comparison=disagreements`, `reviewStatus=REVIEWED`, Genesys Cloud, same date range, Fixture Agent / Customer care. Same five visible IDs/order: `general_service-v17-0` through `general_service-v17-4`. Request dates retain UTC day bounds. Each investigation pushes one entry; Back restores the exact source URL/view/question, Forward restores exact destination and records without growing history.

[Baseline log](v021b-evidence/baseline-browser.txt), [Analytics desktop query/requests/count](v021b-evidence/before/analytics-1440x900.json), [Calibration](v021b-evidence/before/calibration-1440x900.json), [mobile Analytics](v021b-evidence/before/analytics-destination-390x844.png), [mobile Calibration](v021b-evidence/before/calibration-destination-390x844.png). Screenshot and ARIA companions are retained for both source/destination at both sizes.

## Heading, local jump and one-shot boundary

A named semantic results section encloses the existing OperationalTable and existing server pagination. An investigation h2 **Matching evaluations**, `tabIndex={-1}`, precedes human form/question context, an accurate loaded-page count and **Jump to first evaluation**. This is not another card. The result sentence explicitly says “on this loaded page”; it does not claim an organization-wide total. Direct and My Reviews entries gain no investigation heading/jump or automatic result focus.

The deliberate entry condition is origin Analytics/Calibration plus a nonempty actual evaluation query, server source and an ordinary investigation list. My Reviews/task queues, selected `evaluationId`, evidenceReturn and focused Human review are excluded. After a successful initial authoritative page loads, including `[]`, the heading scrolls into view and receives focus once. A mount-scoped ref captures this intent; scope changes, initial errors, detail/evidence entry, review focus or switching out of investigation consume/cancel it. It never re-arms during filter editing, Refresh, server/client pagination, review reconciliation, directory/SLA loading or ordinary rerenders. Browser Forward remounts the destination and may focus it again.

Heading first supplies destination context without opening any record. One **Tab** reaches Jump; **Enter** focuses the existing first rendered `button[data-evaluation-id]` found only inside the results section. No ID dependency, global document query, duplicate opening action, request, query change, selection, sorting or re-ranking. The scoped DOM lookup respects the table's current visible order after search, client sorting and pagination. The next Enter opens the evaluation through its existing handler. `useDetailFocus()` and Close details retain opener restoration; no routing/focus framework is introduced.

## Empty, unavailable and retry

Initial 503: the V0.20C availability alert remains authoritative with exact scope, human labels, Retry and closed technical disclosure. No result section, misleading result focus or jump. Successful zero: focus Matching evaluations, say **0 evaluations on this loaded page match this investigation**, retain **No evaluations match this scope**, no jump/action. Failure consumes the new one-shot intent. Successful Retry retains existing focus to the **Evaluations h1**; it does not compete with the result heading. Refresh failure retains current records; pagination failure retains cursor/page, stale requests cannot replace the current scope, and detail failures remain separate.

## Goal paths, history and equality

“Show me the evaluations behind this quality issue”: Inspect evaluations → focused Matching evaluations with readable Customer Service v17 / Clear next step → Tab → Jump → Enter → existing first opener → Enter → detail. Repeat for “the evaluations behind this disagreement” using Open disagreements. **Two deliberate keyboard actions after heading focus**, then a separate Enter to open the record. No traversal through unrelated filters and no automatic record opening. Browser/ARIA/task-path evidence only; no actual screen-reader certification or recruited user-study claim.

Before/after assertions compare source URL, destination URL, all request methods/URLs/counts through entry, human scope text and record IDs/order byte-for-byte for both cohorts at baseline sizes. Added API requests: **0**. Form/version, question, source/date bounds, policy/mode, comparison/review filters remain exact. Pagination separately checks `cursor=page-two` and return to the same first-page query. Jump also asserts no request/URL change after client sort. Existing labels and closed Advanced exact references remain intact. All History, Review status, Assignment, SLA, Agent, Queue, Channel, Result, Dates, Source, Trigger and Critical controls remain reachable above results; keyboard Shift+Tab leaves the result destination normally.

Analytics/Calibration Back and Forward retain exact source/destination URLs and history length. Explicit return actions retain their established semantics. Detail close restores its actual opener. Conversation evidence returns to evaluation detail; active dirty Human review retains draft, evaluationId and existing review-heading focus authority. No interaction with `entry=showcase` or Overview automatic focus.

## Mobile and short desktop

Required sizes: **1440×900, 1920×1080, 390×844, 1440×720**. Exact cohort/order/URL survive **1440 → 390 → 1440**. The focused heading and jump are within the viewport, form/question/count context is readable, the existing first evaluation button is usable, and document scrollWidth never exceeds viewport width. Table horizontal scrolling stays contained. Text sizes/padding and filters are preserved. [Mobile heading](v021b-evidence/after/calibration-heading-390x844-viewport.png), [mobile first opener](v021b-evidence/after/analytics-destination-390x844-viewport.png), [short desktop](v021b-evidence/after/analytics-heading-1440x720-viewport.png).

## Validation and scoped scores

Full deterministic suite: **714/714**. No pure predicate/helper was introduced merely for test count. Focused browser suite covers both successful exact drills at every size, source/destination equality, Back/Forward, resizing, filters and Advanced disclosure, two-action keyboard shortcut, opener restoration, conversation return, filter/refresh/pagination non-refocus, sort-order jump, retained refresh failure, successful empty, initial failure/retry and direct/Overview/showcase controls. A dedicated dirty Human review case checks Forward with evaluationId and authoritative evidence return focus.

Existing regression suites cover V0.20B calibration discovery; V0.20C initial/loading/empty/refresh/pagination/races/detail availability; V0.20D history/explicit returns/reviewer drafts; V0.20F human labels/technical hierarchy; V0.19E focused reviewer tasks; and V0.21A Welcome/demo Explore, Incomplete resolution, direct Conversations and authenticated Open AQM. Final counts/logs are appended after qualification.

Initial local setup failures are retained: sandbox Chromium/socket restrictions and missing dev API origin. Test-only assertion corrections account for inherited Refresh temporarily disabling (native browser focus can drop), Overview form-filtered eight-record count, and existing Human review h2 return authority. Product refresh/reviewer focus behavior is preserved.

Unchanged 1–5 rubric: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. **Keyboard investigation efficiency 4; Focus predictability 4; Investigation comprehension 4; Mobile evidence access 4.** Two-action deliberate shortcut, semantic context, one-shot boundaries and viewport proof support 4; scripted pragmatic browser evidence limits a 5 claim. No whole-product mean.

## Publication and preservation

Publish only after local qualification, from an immutable Git archive of the exact tested committed source. Compare all frontend build inputs/output bytes, the complete Pages tree and **12/12 actual public files**. Compact actual Pages proof repeats Analytics/Calibration at 1440×900 and 390×844 with intercepted fictional authentication/APIs, including heading/jump/detail/evidence and Back/Forward. No live providers.

Read-only before/after proof covers 25 expected collection counts/hashes, actual collection inventory, Cloud Run revision/image/config/traffic and service IAM, provider secret metadata/versions/IAM and Scheduler config. Counts/hashes only; no secret payload or production record contents saved. Natural hourly health/Scheduler runtime movement is reported separately if it occurs. No environment-builder-v2 changes, backend/API changes, Cloud Run deploy, production mutations, Genesys/Jev calls, notifications, PR, merge or tag. V0.20.0 remains the original annotated tag object `eac819eec24bbfa53295568638fbdfe46bbc3d66`, peeled commit `fadb73dac800cede26389fe883602967cf5b8784`.

## Final local qualification

Build passes; **714/714 deterministic tests, 17/17 focused browser tests, 94/94 existing regression checks**, with zero retries/skips/final failures. [Focused log](v021b-evidence/browser.txt), [focused JSON](v021b-evidence/browser.json), [regression log](v021b-evidence/regressions.txt), [regression JSON](v021b-evidence/regressions.json), [deterministic log](v021b-evidence/deterministic-tests.txt), [exact equality and request counts](v021b-evidence/equality.json).

Initial regression identified a real inherited mobile hierarchy requirement: the loaded-time field note must remain a direct child of the personal queue for the existing mobile hide rule. Its original placement is restored; final highest-priority Start review remains inside the mobile viewport and all focused reviewer checks pass. Initial failure logs are retained separately. Additional test selector corrections use existing implicit-label combobox accessible names and account for the focused review hiding the list. Existing historical evidence files generated by regression helpers are copied into this tranche's evidence and restored to their canonical committed bytes; historical documentation is unchanged.

Through exact entry: **Analytics 31 → 31 AQM API requests; Calibration 29 → 29** at both baseline sizes. Jump itself adds **0**. Source/destination URLs, scope labels, exact query and record IDs/order all match. Both Back/Forward paths retain one added history entry, source context and exact destination. Mobile and short-desktop heading/jump geometry and document overflow assertions pass.
