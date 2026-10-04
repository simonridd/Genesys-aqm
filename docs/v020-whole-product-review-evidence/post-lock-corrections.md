# Post-lock explanations and corrections

The independent assessment was committed/pushed at `003f4d79a0909c4eaf8b5809e24c3d15468b81b6` before source/history inspection. Neither locked JSON nor its digest was revised.

## N2 — fixture authority, conditional legacy boundary

`src/fixtures/overviewFixture.ts` directly inserts weekly and daily schedules for one policy. `src/server/api.ts:325` rejects a new second schedule for a policy and `:331` requires the canonical new schedule identity. Existing schedules can still be updated. `src/PoliciesPage.tsx:41,65` uses the first matching schedule. The observed mismatch is real in the fictional rendering but its normal-authoring premise is false. Classify FIXTURE DEFECT for this task; retain a conditional presentation concern if pre-existing duplicate schedules are supplied. Do not infer that production contains them. No source correction or score revision.

## Reviewer Back experiment — corrected before lock

A direct fixture loaded from about:blank had only the initial document history; browser Back left AQM and Forward bootstrapped disconnected state. That is not evidence that the supported in-app evidence return loses work. A realistic prior-Welcome repetition emitted beforeunload; declining exit preserved two answers and question/overall notes. Explicit Back to human review preserved them at desktop/mobile and during resize. Drafts are temporary memory until saved; they are not persistent across leaving/reloading the document. `src/showcase/Root.tsx:19–23` owns the document-exit guard; `src/useReviewDrafts.ts` owns temporary review input. See reviewer-public-browser-back.json and reviewer-retention.json. The lock already records this boundary.

## Timing and input corrections — before lock

Early Calibration injection failed both requests because catalogue/main share the endpoint and differ only by form filtering; isolated retry established each failure state separately. Early Overview responsive captures occurred during unavailable/loading state; responsive-overview-corrected.json supplies the settled healthy evidence. Native-select ArrowDown/Enter did not commit one answer; native type-ahead/Tab did. Strict selector and stale-page-object retries were harness corrections, not human errors. These were resolved before lock and are not added findings.

## Other fresh finding causes — after lock

N1: `src/showcase/Welcome.tsx:6` sends disconnected Explore to Conversations; there is no story selection or continuation instruction. `src/App.tsx` renders the generic sample library with an early Conversation ID column. Presentation/navigation boundary, not data authority.

N3: `src/EvaluationsPage.tsx` renders filter/list controls before the result actions. Keyboard focus follows that order without a direct jump on exact investigation. Presentation/focus effort, not an unreachable action.

N4: `src/App.tsx:198` has literal V0.19D SHOWCASE footer. Presentation text only.

Only source explanation and classification changed after the lock. The original 4.00 score, four observations and release decision remain intact.
