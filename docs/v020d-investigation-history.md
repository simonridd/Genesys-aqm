# V0.20D — Investigation browser history

Canonical base: `8f4137d35591d355185e25a3e89888e0de6d8d80`. Dedicated branch/worktree: `codex/aqm-v020d-investigation-history` / `/private/tmp/aqm-v020d-investigation-history`. Frontend only; Cloud Run remains `aqm-api-v019-e92f2d6`. No PR, merge, tag or backend deployment.

## Canonical F7 reproduction

Built the exact canonical source before implementation. A real Chromium journey used fictional authenticated APIs: existing workspace → About / Welcome → Open AQM → Analytics → select Customer Service v17 → Questions → Clear next step → Inspect evaluations. Browser Back rendered Welcome; Forward restored the Evaluation cohort. History length stayed **4 → 4**, proving the investigation replaced the Analytics entry. [Observed URLs and counts](v020d-evidence/canonical-f7.json), [Welcome screenshot](v020d-evidence/canonical-back-welcome.png), [passing baseline](v020d-evidence/baseline.txt). The archived reproduction spec is excluded from fixed-code tests.

Source URL: `http://127.0.0.1:4174/Genesys-aqm/?page=analytics&analyticsTab=questions&form=general_service%4017`.

Drill URL (full exact encoding in the observation JSON): `?page=evaluations&analyticsTab=questions&evaluationSource=server&form=general_service%4017&question=understanding&cohort=analytics&evaluation.scopeLabels=…&origin=analytics&analytics.form=general_service%4017&analytics.tab=questions`.

Old Back destination: `?page=welcome`.

## Deliberate history model

A small `navigateWorkspaceUrl({url,page,history})` function in App checks existing `canLeavePage` before any browser URL write, commits the supplied URL once using explicit push/replace, and updates React page state. It never calls `setPage` afterward. Pure URL construction stays in `src/domain/navigation.ts`; there are no domain history side effects or new routing framework.

**Push:** Analytics Questions/Queues/Groups/critical and equivalent investigation callbacks now push the exact `evaluationExploreUrl`. Calibration → Evaluations retains its V0.20B push semantics using the same helper. Existing explicit Evaluations → Calibration also retains push.

**Replace:** sidebar navigation, Analytics cohort/view edits, table search and presentation pagination, Evaluation detail selection, explicit Back to Analytics, OAuth cleanup/default My Reviews and technical normalization keep their existing behavior. Explicit Back to Calibration retains its existing push behavior. Settings and demo-tour routing remain on their existing models. Only affected investigation/return callbacks adopt the helper.

App's existing popstate listener recalculates `landingPage`, checks authoring guards, synchronizes page state and increments `historyRevision`. Analytics and Evaluations already use that revision as their React key. Restored Analytics therefore remounts ServerAnalytics directly from URL tab/cohort; Forward remounts Evaluations from the investigation URL. No hidden duplicate cohort state, new event system, history stack persistence or scroll-state mechanism is introduced. Popstate never pushes an investigation entry.

## Exact Analytics restoration and Forward

The primary fixed reproduction selects September 1–30, Genesys Cloud, Daily Voice Customer Service policy, Customer Service v17, Claims, Sam, voice, Scheduled and Questions. Filter edits keep the existing history length, then a single Clear next step drill adds **exactly one** entry. Browser Back restores the source URL byte-for-byte and renders Questions / Customer Service v17 with every final source value. Forward restores the exact Evaluation URL and exact UTC-bounded API request. Four normal Back/Forward cycles per viewport and a separate six-cycle rapid traversal test assert no history growth, stale page/tab/cohort, crash or URL ping-pong. [Primary state/request trace](v020d-evidence/questions-1440x900.json), [rapid traversal](v020d-evidence/rapid.json).

Queues → Claims restores Queues and original cohort. Groups → Inspect form evaluations uses the same callback and restores Groups/exact form. Overview inside Quality analytics → Inspect critical evaluations restores Analytics Overview and Forward retains `critical=yes`. A separate v18 fixture selects Service (the matching v18 queue), proving return does not switch to v17 or All published forms. [Queues](v020d-evidence/analytics-queues.json), [Groups](v020d-evidence/analytics-groups.json), [critical](v020d-evidence/analytics-overview.json).

Evaluation detail continues to replace `evaluationId` within the current entry. Pure URL checks remove stale assignment, question, critical, comparison and detail selectors when constructing new scopes. Evaluation-only filters and `evaluation.scopeLabels` are absent on restored Analytics. Labels remain presentation-only and never enter API queries.

The explicit Back to Analytics remains a safe URL reconstruction using `analyticsReturnUrl`, preserving parameter values even when their order changes. It does not depend on previous browser provenance. Deep entries mount directly and do not fabricate Analytics history. Reload keeps the browser stack. Because production authentication is memory-only, the reload fixture supplies intercepted fictional OAuth and uses existing callback replacement to reconnect; this proves stack/context retention without introducing session or token persistence. [Reload](v020d-evidence/reload.json).

## Calibration, errors and guards

Calibration disagreement → Evaluations → Back → Forward passes with exact Customer Service v17, Questions, Clear next step, source/date/agent/queue, completed-review and disagreement filters. Three cycles preserve one investigation entry. Existing Calibration state/read/popstate behavior remains. [Calibration trace](v020d-evidence/calibration.json).

A pushed Analytics investigation whose Evaluation request returns 503 shows V0.20C unavailable copy and exact scope labels, without a false empty state. Back returns to the original Analytics scope even when its own API fails; URL/form/context remain correct. Forward returns to the same failed Evaluation query; Retry replays it exactly and loads truthful results. Analytics recovery restores the same Questions cohort. [Failure trace](v020d-evidence/errors.json).

All five existing authoring guards remain: Forms, Question Groups, Answer Sets, Policies and Settings. Their regression checks dismiss primary/secondary/utility/About navigation and popstate attempts and retain beforeunload protection without writes. The helper checks the guard before committing a destination. No new review-navigation blocking prompt is added.

Session-only human review drafts remain owned above the workspace. A draft edited after a pushed Analytics investigation survives browser Back/Forward with the selected Evaluation and original value intact. Conversation evidence → Back to review also preserves it without extra review writes. Existing focused reviewer/mobile cards, evidence-return behavior, completion/revision protection and Answer Set discovery are smoke-tested. [Draft trace](v020d-evidence/review-draft.json).

## Overview boundary

Workspace Overview → Evaluations remains unchanged: a 30-day dashboard drill replaces its entry and Back can return to Welcome. The selected Dashboard range is React state (default 7), with no durable URL representation; selected alerts and other operational state likewise lack a complete source state model. Adopting push alone would imply restoration that the source cannot truthfully provide. A separate Overview state tranche is needed. This is explicitly outside the required Analytics fix. [Observed characterization](v020d-evidence/overview.json). Sidebar history is likewise unchanged; this is not a global routing rewrite.

## Responsive, keyboard and accessibility

History journeys and source/drill/Back captures cover **1440×900, 1920×1080, 390×844**, plus **1440×720** smoke. Desktop `aria-pressed` View buttons and the mobile native View selector reflect Questions after Back; exact form/cohort and no document overflow are asserted. Captures were visually inspected at desktop and 390px. Existing internally scrollable tables remain.

Keyboard tasks use Tab, native select type-ahead and Enter for source selection/view/drill, browser history automation for Back, then continue into Analytics filters by keyboard. Date-filter correctness is covered by the separate exact-cohort suite; the keyboard task uses all dates. No focus trap or new focus stealing is introduced. Existing headings, Investigation scope and Back to Analytics retain their roles/semantics. [Desktop keyboard](v020d-evidence/keyboard-1440.json), [mobile keyboard](v020d-evidence/keyboard-390.json), [mobile Back capture](v020d-evidence/back-390x844.png).

## Qualification, scores, deployment and preservation

Local qualification passes **70/70 focused deterministic tests** and **56/56 browser checks**: 18 V0.20D history, 23 V0.20C recovery, five authoring guards and ten reviewer/discovery/Calibration smoke checks. No final failed, flaky or skipped tests. Build passes. The initial four test-fixture/assertion problems and their resolution are retained in [failure classification](v020d-evidence/failure-classification.md); no application defect was hidden by skipping a test. The giant historical suite was not run. [Qualification summary](v020d-evidence/validation-summary.json).

Unchanged rubric: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. Scoped agent assessments are **Investigation navigation 4**, **Browser-history predictability 4**, **Workflow coherence 4**, **Mobile investigation continuity 4**. Exact investigation restoration, drafts/recovery and native responsive/keyboard continuity support 4. Inherited mobile navigation/table layouts, unchanged Overview/sidebar boundaries and scripted Chromium evidence rather than recruited participants prevent a 5 claim. No whole-product mean is calculated. [Scoped score evidence](v020d-evidence/score-recheck.json).

Tested committed source: `62fc855402cd5962f3e4208b7b2cfe38b64ec3d1`. Immutable Git archive rebuild equals the locally qualified build byte-for-byte. Pages HEAD: `c73724d49851948b95224caecef5e723a8dd4de1`. All **12/12 public files** and the **complete gh-pages tree** match that committed build. [Committed build](v020d-evidence/committed-build.json), [Pages equality](v020d-evidence/pages.json). The public frontend passes **18/18 history checks**, with zero failed/flaky/skipped checks. Only static files come from Pages; every authenticated identity/API request is fulfilled by fictional fixtures. [Public qualification](v020d-evidence/public-browser.json), [public source/drill/Back/Forward trace](v020d-evidence/public/questions-390x844.json).

Read-only before/after proof matches **25/25 production collections**, including Forms, Groups, Answer Sets, Policies, Evaluations, Human Reviews and Schedules. Runtime revision/image/configuration, service IAM, secret metadata/versions/IAM and Scheduler configuration match. Cloud Run remains **100%** on **aqm-api-v019-e92f2d6**. Operational-health timestamps did not move between snapshots; Scheduler lastAttemptTime remains `2026-10-04T12:00:04.940915Z` and scheduleTime remains `2026-10-04T13:00:04.028877Z`. There are **no runtime differences**. Production domain mutations **0**; live Genesys **0**; Jev **0**; notifications **0**. No environment-builder-v2 changes. [Preservation](v020d-evidence/preservation.json), [traffic](v020d-evidence/cloud-run-traffic.json).

Final delivery adds documentation/evidence only after the tested-source commit; frontend inputs remain identical to that source. No PR, merge, tag or backend deployment. Next: ChatGPT review/merge.
