# Genesys AQM — fresh V0.20 whole-product release-candidate review

**REVIEW ONLY — NEVER MERGE.** No PR, product changes, deployment or tag. Reviewed 4 October 2026.

## EXECUTIVE VERDICT

**A. TAG V0.20.** The current product is coherent, trustworthy and usable enough for a supervised internal pilot and credible colleague demonstration. The answer is based on fresh rendered tasks, not closure of the implementation programme. There are **no P0/P1 findings and no release blockers**. Remaining friction is suitable for non-blocking backlog.

The independent score is **4.00/5**. It was locked before any old conclusions, tranche reports or source explanations were read. The earlier mean, read afterwards, is 3.50. The mean does not override a release-blocking finding, and this ordinal comparison is not a statistical claim.

Canonical main: `fadb73dac800cede26389fe883602967cf5b8784`. Pages: `84caf3b8a2d363ae651c1cf91d7d4e9c7983aa6e`; deployed source `cf860d9bf008950446e12291489708b419b84ee5`. Clean main build and actual public deployment match byte-for-byte across **12/12 public files**. Source-to-main differences are qualification/documentation only. Backend metadata: `aqm-api-v019-e92f2d6`, 100% traffic.

**Independent lock:** `003f4d79a0909c4eaf8b5809e24c3d15468b81b6`, committed and pushed before Phase D. [Locked assessment](v020-whole-product-review-evidence/fresh-assessment.json), [digest](v020-whole-product-review-evidence/fresh-assessment.sha256). Its timestamp is 2026-10-04T18:00:12.960685+00:00. Later fixture corrections are explicit and do not rewrite scores or findings.

## PITCH

**READY.** Jev answers focused quality questions; AQM applies published scoring rules; humans challenge an independent AI judgment. Wider coverage has a clear purpose without an unlimited-capacity claim. Fictional/prepared evidence and proof limits are prominent. Chapters 1 and 4 are unusually strong. Closing chapter density merits optional tightening.

## PRODUCT USABILITY

**READY WITH MINOR POLISH.** Quality, coverage, review, form reuse, policy inspection, Calibration and Settings tasks complete. Names, exact versions, cohorts and evidence returns make the result inspectable. Keyboard filter traversal and the generic disconnected sample landing remain less effortless.

## INTERNAL PILOT READINESS

**READY WITH MINOR POLISH**, for a supervised internal pilot. Role-shaped fixtures enforce current authority rather than inventing permissions. Temporary review drafts are retained in-app and document exit is warned. The pilot still needs real organisational setup and operational/provider validation; this review supplies no live outcome proof.

## V0.20 RELEASE DECISION

**A. TAG V0.20.** Minimum blocking set: **none**. No focused tranche is required before tag. N1, N3 and N4 are optional backlog; N2 is transparently reclassified below. A score of 4 or mobile scrolling alone is not a reason to delay this internal release.

## FRESH SCORECARD

Unchanged scale: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished / intuitive. Every below-5 explanation is the original blind explanation, including the subsequently corrected fixture premise in Information quality/Trust/Operational usefulness.

| Category | Fresh | What prevents 5 |
|---|---:|---|
| Human effectiveness | 4 | The public sample handoff drops the customer case; evaluation evidence needs a long filter traversal by keyboard. |
| Value proposition | 5 | — |
| Information quality | 4 | Policy detail shows one schedule while the fictional Overview exposes two for that same policy; contract boundary remains unverified. |
| Ease of use | 4 | Evaluation lists put many filters before the result actions; form editing shares the page with the full library. |
| Visual quality | 4 | Strong hierarchy and readable cards; dense form/library and policy tables remain less effortless than the guided story. |
| Trust / credibility | 4 | Visible evidence limits are strong, but duplicate-schedule representation is unclear and the shell still says V0.19D SHOWCASE. |
| User-facing cleanliness | 4 | Most names and exact versions are human-readable; disconnected conversation tables still lead with IDs and stale release branding. |
| Navigation / IA | 4 | Core investigation history and explicit evidence returns work; reviewer evidence uses a temporary session and browser Back can exit the document behind a warning. |
| Workflow coherence | 4 | Quality, calibration, review and authoring chains complete; disconnected story-to-library continuity is weaker. |
| First-time learnability | 4 | Guided pitch and reusable-answer teaching are clear; disconnected prototype offers many samples without a recommended next task. |
| Authoring usability | 4 | Empty forms, answer discovery, format adoption, group reuse and version comparison work; library/editor density adds focus and scrolling burden. |
| Reviewer usability | 4 | Urgency, active workspace, draft retention, independent AI result and completion work; the queue Start action first opens a workspace requiring another Start, and browser-history behavior differs from investigation history. |
| Operational usefulness | 4 | Attention, quality, coverage and review work are useful; multi-schedule policy-detail boundary needs explanation and live operational effectiveness is unproven. |
| Responsive/mobile quality | 4 | All priority tasks can be completed in emulated mobile Chromium; navigation and library content precede work, and some tables require Cards or contained horizontal movement. |
| Accessibility pragmatics | 4 | Visible focus, native answer controls, current navigation, meaningful actions and status messages work; 48–49 Tab stops to the first evaluation from a drill create material effort. |
| Showcase → product continuity | 3 | Disconnected Explore reaches a different sample library, loses Jamie/customer-case context, and offers no direct continuation recommendation. |

No score is adjusted because tests pass or source explains an observation.

## FRESH FINDINGS

### RELEASE BLOCKERS

**None.** No observed unsafe/data-loss path, major task blocker, untruthful core empty state or serious role confusion.

### NON-BLOCKING BACKLOG

Locked counts: **P0 0 / P1 0 / P2 2 / P3 2**. After source corroboration, active product backlog is **P2 1 / P3 2**, with N2 retained as a fixture/conditional legacy boundary. This is a classification correction, not silent deletion or rescore.

### N1 — P2 — Public visitor: Explore the prototype

**Observation:** The Jamie/Alex case changes to a generic 19-sample library. The desktop table foregrounds conversation IDs; no recommended continuation points back to the quality question just demonstrated.

**Impact:** A colleague understands the pitch but has to invent a new task and discover a different customer story before learning the prototype.

**Reproduce:** Clean public Welcome → Complete the five guided chapters → Exit demo → Explore the prototype → Inspect the first screen and open the billing sample.

**Specific improvement:** Add a short landing cue that suggests opening one named sample and explains how that sample relates to the guided quality workflow; prioritize human topic/context over conversation ID in the disconnected list.

**Scope/risk:** Small public/sample navigation and presentation change; no scoring or provider behavior. Non-blocking for a supervised pilot.

**Evidence:** [public-disconnected-handoff.txt](v020-whole-product-review-evidence/public-disconnected-handoff.txt), [public-sample-detail.txt](v020-whole-product-review-evidence/public-sample-detail.txt), [public-library-cards-mobile.png](v020-whole-product-review-evidence/public-library-cards-mobile.png).

### N2 — P2 — Policy author: when will the daily voice policy run?

**Observation:** The fictional Overview shows daily and weekly scheduled work for the same named policy. Policy collection/detail shows only the weekly schedule and next run.

**Impact:** A user can give an incomplete answer about active scheduled work if more than one schedule per policy is a valid authority state.

**Reproduce:** Fictional attention scope → Overview: inspect upcoming daily and weekly entries for Daily Voice Customer Service AQM → Open Policies and that policy → Compare Schedule (saved) and Next run with Overview.

**Specific improvement:** If multiple schedules are supported, expose all active schedules in policy detail or warn that other schedules exist. If the contract permits only one, enforce/normalize that authority boundary rather than presenting an ambiguous fixture as a normal state.

**Scope/risk:** Conditional authority/navigation edge; investigate contract after lock. No production schedule was changed. Not a blocker on the single-schedule authoring path.

**Evidence:** [viewer-overview-desktop.txt](v020-whole-product-review-evidence/viewer-overview-desktop.txt), [policy-detail-mobile.txt](v020-whole-product-review-evidence/policy-detail-mobile.txt), [policy-detail-desktop.txt](v020-whole-product-review-evidence/policy-detail-desktop.txt).

**Post-lock correction:** FIXTURE DEFECT / conditional legacy-data boundary. The fixture inserts two schedules directly; normal API creation permits one schedule per policy. This is not an ordinary authoring defect. Existing noncanonical schedules can still be updated, so legacy duplicate data would retain the first-schedule presentation limitation. No production records were inspected to establish whether such legacy data exists. The lock and scores remain unchanged.

### N3 — P3 — Keyboard quality/Calibration investigation: evaluation result discovery

**Observation:** After a drill, keyboard traversal to the first evaluation passes 48–49 Tab stops through filters and list controls. The primary row action is reachable with visible focus.

**Impact:** A keyboard user pays disproportionate effort to inspect evidence already narrowed by the investigation.

**Reproduce:** Use keyboard to activate Inspect evaluations or Open disagreements → Tab to the first Open evaluation action.

**Specific improvement:** Offer an in-page jump to results, or move focus to the result heading/action when entering an exact investigation, preserving access to filters.

**Scope/risk:** Bounded focus/navigation polish; verify native focus and row return. Non-blocking.

**Evidence:** [quality-keyboard.json](v020-whole-product-review-evidence/quality-keyboard.json), [calibration-keyboard.json](v020-whole-product-review-evidence/calibration-keyboard.json), [quality-cohort-mobile.aria.yml](v020-whole-product-review-evidence/quality-cohort-mobile.aria.yml).

### N4 — P3 — Product shell / release credibility

**Observation:** The product shell footer displays V0.19D SHOWCASE • 2026 even in the current authenticated product.

**Impact:** A colleague can reasonably wonder whether the reviewed product is an older showcase build.

**Reproduce:** Explore the prototype or open authenticated Overview → Inspect desktop navigation footer.

**Specific improvement:** Use product-neutral prototype wording or current release identity in the shell.

**Scope/risk:** Text-only polish, no product-state behavior; non-blocking.

**Evidence:** [public-disconnected-handoff.txt](v020-whole-product-review-evidence/public-disconnected-handoff.txt), [viewer-overview-desktop.png](v020-whole-product-review-evidence/viewer-overview-desktop.png), [admin-settings-connection.txt](v020-whole-product-review-evidence/admin-settings-connection.txt).


## BLIND FIRST IMPRESSIONS

**After five seconds:** “This evaluates Genesys conversations against quality questions and turns answers into inspectable scores.” Jev appears to supply predefined-format answers; AQM scores them transparently and permits a human challenge. I expect to take the guided demo. I do not yet know the connection/import path, and record that uncertainty without looking at source.

**After thirty seconds:** wider evaluation complements selective manual review. Focused AI questions, exact published versions, weights and critical criteria govern the score. The disagreement preview makes human review purposeful. “Fictional”, “prepared” and “no live requests” are visible; confidence is distinguished from correctness. Controlled coverage is a policy choice. This is a working prototype, not proof of contact-centre outcomes.

**After all chapters:** the Jamie/Alex access conversation exposes vague timeline versus apparently clear resolution. The same Resolution & ownership v3 produces AI 100% and human 56%, a 44-point gap. The management example leads to an owned quality action and pilot plan. One prepared disagreement does not demonstrate population accuracy.

**After calculator:** model-input cost appears low under the chosen volume assumptions, with explicit exclusions. I would not treat it as total AQM operating cost.

**After public handoff:** the product shell is recognisable, but Jamie's case is replaced by another sample library. I must choose a new story; this is N1.

Evidence: [public blind observations](v020-whole-product-review-evidence/public-blind-observations.md), [first screen](v020-whole-product-review-evidence/public-5-seconds.png).

## PUBLIC SHOWCASE

Actual public Pages deployment, clean contexts with no prior local/session/IndexedDB/auth state. Chapter ratings are independent, not forced to find problems. Interaction burden 5 means progression is especially effortless; lower scores explain actual reading/travel rather than treating scrolling as automatically wrong.

| Chapter | Clarity | Narrative | Information | Visual | Interaction burden | Decision | Prevents 5 |
|---|---:|---:|---:|---:|---:|---|---|
| 1 The customer case | 5 | 5 | 5 | 5 | 5 | KEEP |  |
| 2 Define quality | 4 | 5 | 5 | 4 | 4 | KEEP | Several weighting/critical/conditional concepts arrive in one read; careful attention is needed.; Scoring consequences are mostly prose rather than a compact worked score.; Mobile reader scrolls beyond question cards and scoring paragraphs to progress. |
| 3 Evaluate at scale | 5 | 5 | 5 | 4 | 4 | KEEP | Model-economics and coverage explanation adds a dense second section.; Mobile reader scrolls through three answer cards and economics before Next. |
| 4 Human challenge | 5 | 5 | 5 | 5 | 5 | KEEP |  |
| 5 Manage & pilot | 4 | 4 | 5 | 4 | 4 | TIGHTEN | Management insight, ownership facts and six pilot steps compete in the closing read.; Generic pilot checklist partially moves away from the concrete Jamie action.; More prose/list density than preceding score comparison.; Longer mobile closing read before the pilot action; useful content, not a blocker. |

All chapters preserve customer case, exact form and fictional boundary. Mobile Next/Exit actions remain reachable. A clean chapter/calculator traversal records **zero AQM, Genesys, Jev and notification calls, zero storage writes and empty stores**. Seven static public requests only. [Isolation record](v020-whole-product-review-evidence/public-isolation.json). Product bootstrap after explicit Explore is a separate context and writes normal local sample state; it is not counted as showcase leakage.

## CALCULATOR

Actual public calculator exercised through native inputs at desktop/mobile and by keyboard.

| Case: conversations / % / forms / requests / tokens | Observed result | User meaning |
|---|---|---|
| 100,000 / 50 / 1 / 1 / 8,000 | $16.80/month | Default illustrative model-input estimate. |
| 1,000 / 25 / 2 / 3 / 10,000 | $0.63/month | Two forms and three requests multiply model input. |
| 1 / 1 / 1 / 1 / 1 | $0.00/month | Before rounding 0.01 conversations; whole-month floor selects zero. |
| 1 / 100 / 1 / 1 / 1 | Less than $0.01/month | Positive unrounded $4.20e-8 visibly differs from zero. |
| Zero conversations | $0.00/month | Zero selected volume. |
| Blank, negative, percentage 101 | Check inputs; bounds shown | No misleading numeric estimate. |

This estimates **Jev model input only**. It excludes transcription, Genesys retrieval/licence, hosting, storage, network, retries, tax and human review. The whole-conversation assumption is visible alongside the fractional pre-rounding count. The rounded 0M-token summary for one token is coarse but the detailed token assumption remains readable. No billing/rate verification or total-cost claim is made. [Default](v020-whole-product-review-evidence/calculator-default.txt), [tiny](v020-whole-product-review-evidence/calculator-tiny.txt), [sub-cent](v020-whole-product-review-evidence/calculator-positive.txt), [invalid](v020-whole-product-review-evidence/calculator-invalid.txt).

## SHOWCASE → PRODUCT

Disconnected Explore first shows Conversations, 19 fictional samples and a visible disconnected/fictional boundary. First useful action opens a named billing sample with Maya/Alex transcript; evaluation requires connection. Desktop IDs take over early; mobile Cards preserve context/actions. The sample is useful but the Jamie quality goal does not survive and no next task is recommended (N1).

Authenticated-shaped **Open AQM on the actual public site** leads to Overview with named attention, quality, coverage, review work and health. That is a useful operational handoff. Prepared customer context is not confused with saved organisation evidence.

First-use safe exploration is clear: guided demo/sample conversations without connecting; real use requires Settings connection with Genesys region, OAuth client ID and redirect URI. Temporary token/session boundary is visible; no client secret is requested. A breadcrumb “Connect Genesys Cloud” status was initially mistaken for an action; Settings supplies the actual controls. [Disconnected handoff](v020-whole-product-review-evidence/public-disconnected-handoff.txt), [authenticated handoff](v020-whole-product-review-evidence/public-authenticated-open-aqm.txt), [setup](v020-whole-product-review-evidence/public-first-use-settings.txt).

## QUALITY-LEADER TASK

VIEWER goal: tell me what needs attention, identify weakest quality issue, show supporting evidence. Starting at the fictional connection landing, Open Overview provides attention (two errors and an escalated/overdue review), quality 79% across eight evaluations, coverage and workload/health. Explore quality naturally reaches Analytics. Weakest question is **Understanding the issue**, **General Customer Service v17**, 33.1% from eight applicable answers.

Eight deliberate actions cover Overview → quality → exact question cohort → evaluation → conversation → evaluation return → Analytics return → browser history check. No product wrong turns or technical disclosures. Exact form/question/source/date cohort survives. Human versus AI results stay separate. Browser Back/Forward works on the investigation path. Confidence: high for this fictional scope, not for a real centre. Mobile scrolls past attention and quality panels to evidence; keyboard result access costs 48 Tab stops (N3). [Trace](v020-whole-product-review-evidence/persona-traces.md), [cohort](v020-whole-product-review-evidence/viewer-exact-cohort.txt), [history](v020-whole-product-review-evidence/quality-history.json).

## COVERAGE TASK

Without pre-teaching, the visible sequence answers why not every eligible conversation was evaluated: **20 eligible, 10 selected, six content-available, four evaluated**. Ten are intentionally not selected; four selected observations have no usable content; two available observations lack completion. Three failed **attempts** are separately labelled, not three missing conversations. Sampling coverage is 50%; evaluation coverage 20% of eligible observations. Repeated runs and scope/filter distinctions are explicit.

Quality is not coverage; failed attempt count is not interaction count; intentional sampling is not failure. No technical disclosure was required. [Coverage evidence](v020-whole-product-review-evidence/viewer-coverage.txt).

## REVIEWER TASK

REVIEWER goal: complete the most urgent review carefully. My Reviews puts the escalated item first. Queue Start opens the selected workspace; another Start begins the task, a small two-step burden. The active task separates queue/comparison/history from questions, evidence and finish. Mobile cards expose the review action without horizontal hunting.

Approximately 11 actions from queue to completion; the locked count of 12 also counts offered continue-queue availability. Tab keystrokes/typing are separate. Two answers, question note and overall note survive conversation evidence, explicit **Back to human review**, and 1440→390→1440. Full mobile completion succeeds. Completion states removal from My Reviews and preservation of original AI. Fictional authority confirms original AI unchanged; human result 38% is visibly independent of AI 78%.

Browser-history testing initially exited an about:blank fixture document; that harness boundary was corrected before lock. A realistic prior-Welcome Back produces an unsaved-work document-exit warning; declining keeps all inputs. Drafts are temporary in-app memory until saved; leaving/reloading is not persisted. No observed unguarded loss. Native select type-ahead works; an automation ArrowDown/Enter sequence that did not commit was corrected and is not a user failure. Confidence high for supported return and guarded exit. [Retention](v020-whole-product-review-evidence/reviewer-retention.json), [realistic Back](v020-whole-product-review-evidence/reviewer-public-browser-back.json), [mobile completion](v020-whole-product-review-evidence/reviewer-full-mobile-completed.txt).

## AUTHORING TASKS

AUTHOR goal: create a draft resolution-quality form using existing standards. New form starts with **zero questions**, no unrelated starter content. Add question reveals reusable Answer Sets before requiring knowledge of format. Picker previews published versions and all available formats. Resolution clarity adoption changes to Multiple choice while retaining authored wording/weight; fictional save confirms “Saved in AQM.” Complete desktop/mobile and keyboard tasks succeed without IDs, JSON or Advanced.

Reuse goal: another form with existing questions. **Add reusable group** teaches the discovered concept. Resolution & Next Steps inserts exactly Ownership, Resolution, Clear next steps. Empty General group remains harmlessly; unrelated questions do not appear. Result is predictable and saves fictionally.

Version goal: understand newer standard before adoption. Resolution clarity v1→v2 comparison names label changes, credit 100→90, order changes and new Not applicable, plus resulting order and dependency checks. Detach/customise is distinct from adopting a linked version. Adoption was not saved; no production historical migration. Published form/policy pinning is explained. Library/editor density requires vertical travel, especially mobile, but controls remain usable. Confidence high for these observed tasks. [Discovery](v020-whole-product-review-evidence/author-answer-set-discovery.txt), [reuse](v020-whole-product-review-evidence/author-reuse-result.txt), [comparison](v020-whole-product-review-evidence/author-standard-version-comparison-mobile.txt).

## POLICY TASK

AUTHOR goal: find the daily voice policy's form, selection and next run. Human policy name leads to **General Customer Service v17**, voice condition, 50% sampling and fixed published version. Schedule shows timezone, local run window and next run; policy/schedule saves are visibly separate with readiness/errors. Technical identifiers need not be opened.

An unsaved description edit followed by navigation prompts “Unsaved policy or schedule changes. Leave without saving?” Declining retains it; no save sent. The two-schedule fixture caused N2: Overview lists daily and weekly but detail selects weekly Monday 02:00 Europe/London. After lock the one-new-schedule contract disproves the normal-authoring premise. Retain conditional legacy-data boundary; no blocking policy defect. [Policy](v020-whole-product-review-evidence/policy-detail-desktop.txt), [guard](v020-whole-product-review-evidence/policy-guard.json), [correction](v020-whole-product-review-evidence/post-lock-corrections.md).

## CALIBRATION TASK

Goal: find strongest human/AI disagreement and supporting evaluations. Landing independently reveals Understanding the issue, General Customer Service v17. **Two of two comparable answers disagree, 100%**; completed-review sample is explicit. Open disagreements reaches exactly two supporting evaluations without a form ID. Evaluation/conversation returns and browser Back/Forward preserve question/form/source/date cohort. Desktop/mobile and keyboard complete; no technical disclosure or wrong turn. Keyboard takes 49 Tab stops to first evaluation (N3). Confidence high for sample evidence, not population inference. [Landing](v020-whole-product-review-evidence/calibration-mobile.txt), [exact cohort](v020-whole-product-review-evidence/calibration-exact-disagreements.txt).

## ADMIN / SETTINGS TASK

ADMIN finds connection and organisation controls in Settings. Sections separate connection, governance/privacy, notifications and advanced/development. Storage inventory explains what is retained; saving retention alone does not delete data. Purge preview identifies dependent review removal and active-alert boundary. Notification configuration affects new operational alerts after scheduled processing, with no historical backfill. No purge, save, notification transport or production mutation performed.

Keyboard section navigation shows visible focus and `aria-current=location`. Mobile section navigation is reachable; content is readable without developer disclosures. Confidence high for communicated scope, not destructive execution. [Privacy](v020-whole-product-review-evidence/admin-privacy-desktop.txt), [notifications](v020-whole-product-review-evidence/admin-notifications-desktop.txt), [keyboard](v020-whole-product-review-evidence/settings-keyboard.json).

## FAILURE & EMPTY STATES

| Fictional scenario | Rendered communication / recovery |
|---|---|
| Successful zero evaluations | No evaluations match this scope; no false outage. |
| Failed initial evaluations | Evaluations could not be loaded; same filters; Retry; no fake empty table. |
| Same-scope refresh failure | Prior rows and loaded-at time retained; Retry refresh. |
| Failed next page | Current page retained; Retry next page. |
| Overview partial section unavailable | Quality/coverage unavailable with refresh; other task areas work. |
| Calibration main-data failure only | Retry calibration; available catalogue retained. |
| Calibration catalogue failure only | Retry form choices; existing disagreement evidence remains usable. |
| Policy collection failure | Saved policies unavailable; no editable fake-zero collection; diagnostic wording remains. |

Catalogue and main Calibration requests share endpoint and differ by form filter; isolation was verified through separate recovery before lock. Old/transient rows are not asserted to be current. Evidence files begin `failure-`; [zero](v020-whole-product-review-evidence/evaluations-successful-zero.txt), [refresh](v020-whole-product-review-evidence/failure-evaluations-refresh.txt), [catalogue-only](v020-whole-product-review-evidence/failure-calibration-catalogue-only.txt).

## RESPONSIVE / MOBILE

Full task viewports **1440×900 and 390×844**. Representative whole-product checks **1920×1080**, short desktop **1440×720**. Meaningful investigation/review state retained through **1440→390→1440**. This is Chromium viewport emulation, not physical-device testing.

| 390×844 surface | Task result / meaningful friction |
|---|---|
| Overview | Attention/quality give first evidence; stacked panels need vertical travel. |
| My Reviews | First urgent card exposes action. |
| Active review | Focused questions/evidence/finish reachable; drafts survive detour. |
| Analytics | Weakest question/exact cohort available; filter-heavy keyboard path. |
| Calibration | Top disagreement and supporting cohort discoverable. |
| New Form | Full standard adoption/save succeeds; library/editor density adds travel. |
| Policy | Name/form/selection/schedule and leave guard readable. |
| Conversation | Evidence readable, explicit task return works. |
| Settings | Section navigation and scope wording usable. |
| Showcase | All chapters progress; dense chapters 2/3/5 require reading/scrolling. |
| Calculator | Inputs, result, rounding explanation and exclusions reachable. |

No document-level horizontal overflow on representative checked surfaces. Contained tables can scroll; Cards preserve library actions. Search/result counts describe current page; exact investigation scope is separately labelled. IDs are disclosed on demand except the disconnected desktop sample list (N1). Row/detail return is predictable on the tested exact cohorts. [Responsive record](v020-whole-product-review-evidence/responsive-whole-product.json), [settled Overview correction](v020-whole-product-review-evidence/responsive-overview-corrected.json). Heights are evidence of layout, not findings by themselves.

## KEYBOARD / ACCESSIBILITY

Keyboard-only guided Next/Exit, calculator edit, quality investigation/evidence return, human review/evidence return/completion, new-form/reusable standard/save, Calibration disagreement investigation and Settings sections all complete. Visible 3px focus outline, meaningful native button/input names, native selects, pressed/current state and status/alert semantics were checked. No hidden keyboard-only critical path observed. Long result traversal is N3.

This is pragmatic accessibility review. No WCAG, screen-reader or assistive-technology certification; status semantics do not prove audible announcements. [Keyboard records](v020-whole-product-review-evidence/quality-keyboard.json), [review](v020-whole-product-review-evidence/reviewer-keyboard.json), [author](v020-whole-product-review-evidence/author-keyboard.json), [public](v020-whole-product-review-evidence/public-keyboard.json).

## INFORMATION QUALITY / TRUST

AI quality and independent human review remain distinct; Calibration describes disagreement in a comparable reviewed sample, not correctness. Sampling/evaluation coverage use explicit denominators; operational health/error attempts are separate from quality. Alerts represent saved operational conditions; notifications are transport/configuration for new alerts, not alerts themselves.

Fictional/prepared samples versus saved AQM evidence, immutable historical form snapshots, published-version pinning, unavailable/stale data, calculator flooring/exclusions and on-demand provenance are visible. Confidence is not presented as accuracy. The stale footer weakens release identity (N4). None of this visible trust is inferred merely from backend tests.

## F1–F10 CURRENT CLASSIFICATION

Historical conclusions were retrieved **only after lock** from `codex/aqm-v019-final-whole-product-review`. They did not set fresh tasks/scores/findings. **Eight SOLVED, two MOSTLY SOLVED; zero STILL PRESENT/REGRESSED.** These are current experience classifications with explicit boundaries, not acceptance-criteria closure accounting.

| Item / old issue | Current classification | Fresh experience / evidence | Residual boundary |
|---|---|---|---|
| F1: Mobile reviewer action required horizontal discovery | **SOLVED** | Mobile queue cards expose Start/Continue; complete review at 390×844. [reviewer-queue-mobile.txt](v020-whole-product-review-evidence/reviewer-queue-mobile.txt) | Contained desktop tables remain; primary mobile task is preserved. |
| F2: Active review buried beneath queue and comparison | **SOLVED** | Focused workspace separates active answers/evidence/finish from queue; comparison/history are closed. [reviewer-active-mobile.txt](v020-whole-product-review-evidence/reviewer-active-mobile.txt) | Answers and end-of-form actions still require ordinary vertical reading. |
| F3: IDs, enums and architecture dominate normal work | **MOSTLY SOLVED** | Named forms/versions, queues, agents and descriptive review actions dominate authenticated tasks; provenance stays on demand. [viewer-exact-cohort.txt](v020-whole-product-review-evidence/viewer-exact-cohort.txt) | Disconnected IDs (N1), old footer (N4), and fallback names when directory metadata is absent remain. |
| F4: Raw failures and misleading empty states | **MOSTLY SOLVED** | Initial/refresh/next-page evaluation failures have distinct honest states and recovery; partial sections remain useful. [failure-evaluations-refresh.txt](v020-whole-product-review-evidence/failure-evaluations-refresh.txt) | Policy failure still includes a raw diagnostic; every ancillary error surface was not certified. |
| F5: Ordered-scale default hides useful reusable Answer Sets | **SOLVED** | Author discovers all published formats before choosing a type; preview adopts resolution standard safely. [author-answer-set-discovery.txt](v020-whole-product-review-evidence/author-answer-set-discovery.txt) | Dense library/editor layout is ordinary residual authoring effort. |
| F6: Calibration requires a technical form reference | **SOLVED** | Highest disagreement and readable published form are immediately selectable; exact supporting cohort opens. [calibration-mobile.txt](v020-whole-product-review-evidence/calibration-mobile.txt) | Only completed comparable human reviews support this signal; sample caveat remains necessary. |
| F7: Investigation drill replaces browser history | **SOLVED** | Analytics and Calibration exact drill Back/Forward and evidence return preserve scope. [quality-history.json](v020-whole-product-review-evidence/quality-history.json) | Scoped investigation fix; sidebar/Overview/reviewer routes still replace history and document exit has a draft guard. |
| F8: Overview full coverage funnel displaces attention/workload/health | **SOLVED** | First scan gives attention, compact quality/coverage, review work and health before the full funnel. [viewer-overview-desktop.txt](v020-whole-product-review-evidence/viewer-overview-desktop.txt) | Mobile stacks useful panels; scrolling is not itself a defect. |
| F9: Intentional sampling described as coverage loss | **SOLVED** | Not selected by policy, no usable content, not completed, and failed attempts are distinct with denominators. [viewer-coverage.txt](v020-whole-product-review-evidence/viewer-coverage.txt) | Run observations are not distinct lifetime conversations; visible caveat needed and present. |
| F10: Tiny calculator floors to zero without explanation | **SOLVED** | Pre-rounding fractional count and whole-month selection explain zero; positive sub-cent differs from zero. [calculator-tiny.txt](v020-whole-product-review-evidence/calculator-tiny.txt) | This is illustrative model-input economics, not validated billing or total operating cost. |

## V0.20A–H EFFECTIVENESS

Reports read after lock. Seven interventions SOLVED; F MOSTLY SOLVED. This describes human/product effectiveness in observed tasks, not universal correctness.

| Intervention | Effectiveness | Fresh human/product evidence | Boundary |
|---|---|---|---|
| A — Answer Set discovery | SOLVED | New question exposes reusable standards across formats; readable preview adopts the required format. | Editor density remains; reuse is no longer hidden by the starter type. |
| B — Calibration discovery | SOLVED | Weakest disagreement visible without a form ID; exact v17 question cohort and denominator open directly. | Descriptive completed-review sample, not population accuracy. |
| C — Evaluation availability/recovery | SOLVED | Zero, unavailable, stale refresh and next-page failures distinguish authority and preserve useful scope. | Ancillary errors retain some diagnostic wording. |
| D — Investigation history | SOLVED | Analytics/Calibration Back/Forward, exact drill, detail and conversation return work. | Intentionally scoped; not a global sidebar/reviewer routing rewrite. |
| E — Overview first scan | SOLVED | Attention, quality, coverage, review work and health are intelligible before detailed funnel. | Mobile still stacks sections. |
| F — User-facing language | MOSTLY SOLVED | Routine authenticated work uses human names and published versions with provenance on demand. | Disconnected sample IDs and stale footer remain. |
| G — Coverage interpretation | SOLVED | Intentional selection and downstream gaps are separate; attempts use different units. | Repeated run observations need the caveat, which is visible. |
| H — Whole-conversation calculator | SOLVED | Tiny fractional volume explains zero; positive sub-cent estimate is distinct. | Estimate excludes non-model costs and is not billing proof. |

## PREVIOUS → CURRENT SCORE COMPARISON

| Category | Previous | Fresh | Delta |
|---|---:|---:|---:|
| Human effectiveness | 4 | 4 | +0 |
| Value proposition | 4 | 5 | +1 |
| Information quality | 4 | 4 | +0 |
| Ease of use | 3 | 4 | +1 |
| Visual quality | 4 | 4 | +0 |
| Trust / credibility | 4 | 4 | +0 |
| User-facing cleanliness | 3 | 4 | +1 |
| Navigation / IA | 3 | 4 | +1 |
| Workflow coherence | 4 | 4 | +0 |
| First-time learnability | 3 | 4 | +1 |
| Authoring usability | 3 | 4 | +1 |
| Reviewer usability | 3 | 4 | +1 |
| Operational usefulness | 4 | 4 | +0 |
| Responsive/mobile quality | 3 | 4 | +1 |
| Accessibility pragmatics | 4 | 4 | +0 |
| Showcase → product continuity | 3 | 3 | +0 |

Mean **3.50 → 4.00 (+0.50)**. Most meaningful changes are discoverable reusable standards/Calibration, truthful recovery, scoped browser history, mobile review action and first-scan hierarchy. The value-proposition 5 reflects the direct first-screen explanation and coherent customer example. Continuity remains 3 because the generic sample handoff still drops the story. One-point ordinal changes should not be over-interpreted; no real-user/statistical comparison. N2 correction leaves the fresh 4.00 unchanged.

## TEST / VALIDATION RECORD

| Validation | Result | Evidence |
|---|---|---|
| Full deterministic suite, exact archive, Node 22 | 72 files; 714 passed; 0 failed/skipped; 2.29s | deterministic-permitted.log |
| Initial restricted deterministic attempt | 656 passed / 58 failed; 15 files failed; EPERM loopback, not product failure | deterministic.log; failure-classifications.json |
| Normal frontend build / typecheck | PASS: tsc -b and Vite; no build warning | build.log |
| Server typecheck | PASS | typecheck-server.log |
| Lint | No current normal lint script; not claimed | package scripts |
| Fresh task journeys | 14/14, desktop/mobile; 0 skipped; 23.6s | fresh-browser-report.json |
| Targeted current regression | 234 passed / 3 failed / 0 skipped, 15 specs, 9.2 minutes | current-browser-report.json; current-browser.log |
| Unmodified failure reproduction on canonical archive | 1 passed / 2 failed, 16.8s | failure-reproduction-report.json |
| Public/local identity | 12/12 byte equality, actual live static responses included | build-equality.json |
| Source input qualification | 267 product/config/existing-test inputs match canonical blobs | source-input-verification.json |
| Final remote/backend identity | Main and Pages unchanged; expected backend 100% | remote-final.txt; backend-final.json |

The three initial browser failures are explicitly classified: reviewer-continuity pagination selector timing **HARNESS DEFECT** (passes unchanged rerun); role-navigation full Coverage reload **HARNESS DEFECT** (fictional temporary identity is gone, browser-local empty coverage is truthful); role-navigation contextual evidence labels **STALE EXPECTATION** (Conversation detail and Back to human review replace old wording). No current product defect is inferred from these red tests. Failure snapshots and unmodified rerun are retained.

Targeted selection covers A–H, reviewer focus/continuity, quality actionability, authoring simplification, role/navigation/unsaved guards and showcase isolation/accessibility. Giant known-stale historical suites were not run just to inflate failure counts. Known older policy/review-SLA/navigation expectations remain unmodified debt, not certified green by this review.

Locked npm install on the default Node 25 emitted the Vitest supported-engine warning; qualification used supported Node v22.13.0. Installation also reported deprecated dependencies and seven audit advisories (two moderate/five high). No dependency remediation or security certification was attempted. Normal qualification build emitted no warning.

See [validation summary](v020-whole-product-review-evidence/validation-summary.json) and [failure classifications](v020-whole-product-review-evidence/failure-classifications.json).

Tests corroborate the fresh observations after lock; they do not determine the scores. Existing test expectations were not edited. Some browser suites write old evidence paths; those generated files are restored/removed before commit so only this review's docs/harness/evidence remain.

## LIMITATIONS

Agent-directed tasks and browser emulation are not real colleague comprehension, reviewer behaviour or contact-centre outcomes. No actual Genesys OAuth grant/conversation retrieval, production-scale latency, Jev inference correctness/billing, notification delivery or provider reliability is proven. Fictional API authority can misrepresent a production contract, as N2 demonstrates. No production-data snapshot was taken because no deployment/product mutation occurred. No physical device, screen reader, exhaustive pixel audit or WCAG certification. Total scroll events were not instrumented; traces describe qualitative travel and deliberate actions.

Production mutations **0**; real provider calls **0**; Jev calls **0**; notifications **0**; deployments **0**. Public static traffic was allowed; authenticated AQM/provider-shaped requests were locally fulfilled; unknown external traffic aborted.

## RELEASE RECOMMENDATION

**A. TAG V0.20.** No required tranche. Keep disconnected story continuation, keyboard result focus and neutral/current footer identity as optional backlog. N2 merits only conditional fixture/legacy follow-up, not a release delay.

Recommended tag: `v0.20.0`. Recommended target: **`fadb73dac800cede26389fe883602967cf5b8784`**. Do not tag the review branch.

Recommended annotation:

> Genesys AQM V0.20 — coherent internal-pilot release with discoverable reusable standards and Calibration, truthful evaluation recovery, scoped investigation history, clearer operational coverage and whole-conversation cost assumptions. Fresh independent whole-product review found no release blockers. Provider reliability and real contact-centre outcomes remain outside fixture/browser proof.

Suggested release summary: wider inspectable quality evaluation; independent human review; reusable published standards; exact version/cohort investigations with browser history; honest availability/coverage; clear illustrative model-input cost. Suitable for supervised internal pilot and colleague demonstration, with documented non-blocking polish and browser-test debt.

Review branch: `codex/aqm-v020-fresh-whole-product-review`. **REVIEW ONLY / NEVER MERGE.** Final HEAD is reported in the handoff; lock remains unchanged. Product source, dependencies, existing tests/config, roadmap and production assets must match the canonical base.
