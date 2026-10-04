# V0.20C — Evaluation availability & recovery

Canonical base: `94b8f19330b2795cca9b092d61844c74269be4c2`. Dedicated branch: `codex/aqm-v020c-evaluation-availability`. Frontend only. No backend route, schema, pagination/filter/review-workload contract, HumanReview, EvaluationRecord, storage, provider or environment-builder-v2 change. Cloud Run remains `aqm-api-v019-e92f2d6`. No PR, merge or release tag.

## Canonical false-empty reproduction

Before editing source, built the canonical checkout and used fictional authenticated APIs with GET `/api/evaluations` returning 503. The real browser rendered the technical failure alongside **0 results on this page** and **No production evaluations on this page.** This was observed, not inferred from source. [Screenshot](v020c-evidence/canonical-false-empty.png), [accessibility tree](v020c-evidence/canonical-false-empty.aria.yml), [observations](v020c-evidence/canonical-false-empty.json), [passing reproduction](v020c-evidence/baseline.txt). The reproduction spec is archived in the evidence directory so it does not become an intentionally failing test of the new implementation.

## Authoritative state and request identity

`EvaluationsPage` retains a successful page object containing records, cursor, next cursor, scanLimited, the exact request URL/context and a presentation-only `loadedAt`. These commit together only after success. Pending request and list failure each carry their own exact request and kind. Idle/disconnected, loading, ready with rows, successful empty, unavailable and retained-page recovery are derived explicitly from those objects, rather than from `records.length`.

`src/evaluationAvailability.ts` constructs the existing query once for both the server URL and browser filtering. Request identity is the deterministic URL including limit=50, cursor, form, agent, queue, channel, cohort, outcome, question, policy, source, mode, critical, reviewStatus, assignment, due, dueState, reviewQueue, reviewQuestion, comparison, from and to. Empty values remain omitted; dates retain `T00:00:00.000Z` and `T23:59:59.999Z` UTC boundaries. Presentation search/page state never enters the API query. In-memory context additionally isolates session and history source.

Only a successful page for the selected scope/session may mount OperationalTable. Initial or new-scope failure has no table, result count, client search or successful-empty language. Loading/updating is announced with role=status. An initial service failure says **Evaluations could not be loaded.**; a scoped failure says **Evaluations could not be loaded for this scope.**; My Reviews says **Your review queue could not be loaded.**. Current scope failures use role=alert and a real Retry button. Raw diagnostics are in native Technical details, closed by default. Safely observed 401/403 supply access copy and the existing Settings/reconnect path. Network, non-JSON and malformed successful list responses fail closed rather than becoming empty arrays.

A successful zero-row request mounts the ordinary table and says **No evaluations match this scope.** or **No reviews need your attention in this scope.**, respectively. Browser history has its own actual local result/empty state. Disconnected server history clearly requires connection in Settings and has no server result count.

## Scope, refresh, page navigation and races

Scope changes suspend old-scope results immediately through identity comparison, including the debounce interval. The old page object is retained in memory but cannot appear under different selected filters. Retry replays the captured exact failed URL/page, including all investigation values.

Same-scope Refresh keeps the successful page and search usable. Failure says **Couldn’t refresh evaluations. Showing results loaded at …** with Retry refresh. The load timestamp is presentation-only, in memory, not persisted, not backend evidence time and not a query parameter. Retry success replaces the page and timestamp and removes the notice.

Next/First requests do not mutate the displayed cursor while pending or on failure. Failure names the page operation and says **Current page is unchanged.**. Retry next page / Retry first page replays its captured destination; only success replaces the whole page. Existing successful calibration/bulk actions still reconcile from the first page; review completion reconciles the current cursor and exact filters as before.

Monotonic request IDs, render-current context and effect cleanup reject superseded success/failure/finally updates. Tests deliberately resolve A/B in both orders, including B success followed by late A failure. Successful review mutations still invalidate older list requests and reconcile authoritative completion before background refresh; a failed refresh preserves the review confirmation and reconciled queue.

## Separate errors and detail authority

`listError` belongs solely to GET `/api/evaluations`. `detailError` belongs to the selected detail GET. `operationError` distinguishes calibration sample and bulk actions, with action-specific normal copy and subordinate technical details beside the relevant operation. All three action failure fixtures leave a healthy list usable. ReviewWorkloadPanel is unchanged; its success/failure remains independent.

Contract inspection: the list endpoint joins complete stored EvaluationRecord snapshots with HumanReview (`src/server/api.ts`, list branch); detail GET separately reads the evaluation and its current HumanReview. List rows are complete snapshots, but their review state can change after listing. The frontend now requires successful detail GET before presenting the authoritative detail or mounting ReviewPanel/focused writable review. It does not use a list-row fallback after failed authority confirmation. Failure has **Evaluation details could not be loaded.**, Retry details and Close details. Healthy list rows remain usable. Draft continuity, expectedRevision, conflict/assignment protection and completion behavior remain in the existing ReviewPanel/useReviewDrafts paths.

## Investigations and reviewer protection

Analytics, Calibration and Overview failure/retry retain exact filters and Investigation scope. Back to Analytics / Calibration stays available. Tiny frontend navigation additions carry known form/question labels from the originating evidence in `evaluation.scopeLabels`, paired with exact filter values; mismatched labels cannot describe a changed scope. They never enter the API URL and are removed on new exploration/return/Settings/clear. This lets an unavailable initial investigation still say **Customer Service v17 / Clear next step**, without guessing a name from an ID or needing failed rows to supply it.

REVIEWER default My Reviews, priority order, review filters, server cursor and responsive cards remain. The independent workload summary may show existing assigned work while the queue states it is unavailable. Retry restores the priority cards/actions at 390×844. Failed detail GET cannot enter a writable focused task. Existing revision and assignment conflict, evidence detour, multiple-draft, later-cursor, completion and keyboard flows are qualified.

## Mobile, focus and accessibility

Recovery is placed after investigation scope and before workload/expanded filters, so it is prominent and reachable at 390×844. No empty card area replaces a failed queue. 390×844, 1440×900 and 1920×900 failure/retry captures have no page overflow; regression smoke additionally covers 1920×1080 and 1440×720. Native disclosures, real buttons, headings and alert/status roles provide keyboard recovery. Successful Retry focuses the existing Evaluations heading; detail Retry focuses the detail/workspace heading. Failed Retry remains announced. No global focus manager was introduced. An added results heading was removed during qualification to preserve the V0.19E first-viewport mobile priority action.

## Qualification and focused scores

105 focused deterministic tests, 23 V0.20C recovery browser tests, 38 current-contract regression tests and the existing reviewer-card component check pass, with no skipped/flaky/failing tests in the final reports. The giant historical suite was not run or repaired. The directly affected completion test now checks the recovery status and closed technical disclosure rather than a generic technical-error alert. The focused suites use fictional authenticated APIs only; no production records are mutated for proof. See [evidence index](v020c-evidence/README.md) and [failure classification](v020c-evidence/failure-classification.md).

Unchanged rubric: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. Scoped assessments are Trust / credibility **4**, Failure recovery **4**, Evaluation-task clarity **4**, Mobile recovery **4**. Evidence distinguishes empty/unavailable, exact retries and retained-page notices, isolates detail/actions, and protects mobile review continuity. Long inherited filter/navigation stacks and scripted Chromium qualification rather than independent participants prevent a 5 claim. No new whole-product average.

## Deployment and preservation

Deployment and read-only before/after preservation results are appended after public verification. No PR, merge, tag, backend deployment, Genesys, Jev, notification or production domain write is part of this work. Next: ChatGPT review/merge.
