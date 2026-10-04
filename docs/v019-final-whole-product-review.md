# Genesys AQM — fresh post-V0.19A–D whole-product review

Review date: 4 October 2026. Canonical product: `c20604c3b33b81a0038388851d07d6f500792bdb`. Review branch: `codex/aqm-v019-final-whole-product-review`. Review only; product source and environment-builder-v2 were not changed.

## 1. Executive summary

The current product communicates its purpose and connects quality investigation, independent review and reusable definitions. It feels like a strong internal prototype. Two reviewer presentation problems still prevent a comfortable first pilot: the primary mobile queue action is initially offscreen, and the active review remains buried beneath the queue and repeated comparisons. Neither is a data-loss defect. Both affect the main human task.

**Pitch: B READY WITH MINOR POLISH. Product: B STRONG PROTOTYPE WITH MINOR FRICTION. Pilot: ONE FOCUSED PASS REQUIRED. Release: ONE MORE FOCUSED PASS BEFORE TAG.** The fresh whole-product mean is **3.50/5**, with ease, learnability, authoring, reviewing, navigation, mobile and continuity still at 3. No observed P0. Ten meaningful findings, two blocking.

The blind public pass and independent persona review preceded cause analysis and historical reading. The judgments were locked at `2026-10-04T07:19:09.570615+00:00` in [fresh-assessment.json](v019-final-whole-product-review-evidence/fresh-assessment.json), with a [SHA-256 record](v019-final-whole-product-review-evidence/fresh-assessment.sha256), and committed before the old review was retrieved. Later source inspection, timing and corroborating investigations did not change these scores or verdicts.

## 2. Fresh pitch verdict

**B READY WITH MINOR POLISH.** Welcome earns **4/5 independently**: the first screen names automated quality management for Genesys, separates Jev's typed answers from AQM's scoring/rules and gives the human a credible challenge role. The prepared disagreement is an effective internal pitch moment. A 5 would need a simpler explanation of weights/critical rules and a more concrete description of what the first pilot operator actually does. Tighten chapter 2 and the pilot setup handoff.

**Send-the-link test: yes for an internal colleague considering the proposition.** BLOCKING explanation needs: none. NOTICEABLE: how weighting/critical scoring works; why confidence is not accuracy; which setup, review and operating costs remain outside the model-input estimate. MINOR: the difference between a prepared fictional example and proof from a real operational population. The page states its illustrative boundary; it does not prove live provider operation.

## 3. Fresh product-usability verdict

**B STRONG PROTOTYPE WITH MINOR FRICTION.** Persona tasks completed using real components and API contracts. “Minor” describes overall coherence, not every remaining issue: the two reviewer issues are P1 for that task. Strong mechanisms include exact form versions in quality investigations, safe independent review completion, immutable reusable standards and intentional read-only definitions. Friction concentrates in task presentation, long pages, technical filters and horizontally scrolling actions.

## 4. Pilot readiness

**ONE FOCUSED PASS REQUIRED.** A supervised internal pilot means controlled data, named internal users and known limitations. It is not external certification. Address F1/F2 in one reviewer task focus pass, then replay the same queue → answers/notes → evidence → return → complete sequence. Keep the current draft retention, conflict protection and unchanged AI result. This review supplies no live Genesys/Jev performance or real-user comprehension proof.

## 5. Release/tag recommendation

**ONE MORE FOCUSED PASS BEFORE TAG.** Do not create a tag from this review. The minimum blocking set is a visible mobile Start/Continue review action and a focused active review surface with evidence, answers and completion leading. The remaining eight findings are non-blocking backlog; they do not justify a broad new roadmap or combined cleanup tranche.

## 6. Whole-product scorecard

Scale: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. Equal weights. Evidence and improvements below are the locked independent judgments.

| Category | Fresh | Evidence / what works | Prevents a 5 | Specific improvement |
|---|---:|---|---|---|
| Human effectiveness | 4 | Independent review completed and quality evidence reached exact cohort. | Dense review surface and mobile action search slow the main task. | Give review its own focused work surface. |
| Value proposition | 4 | Welcome and five chapters distinguish Jev answers, AQM scoring and human calibration. | Weights/critical rules and wider operational cost still need explanation. | Tighten Define quality; preserve honest exclusions. |
| Information quality | 4 | Analytics shows exact versions, applicable counts and descriptive caveats; coverage names denominators. | Coverage and quality scopes differ; raw statuses make some information harder to interpret. | Keep scope attached to every drill; use human labels. |
| Ease of use | 3 | Core persona tasks completed through real controls. | Review density, horizontal tables and scale-format mismatch add detours. | Make primary task actions persistently visible. |
| Visual quality | 4 | Consistent restrained palette, readable typography, clear comparison cards. | Long stacked surfaces and broad tables reduce hierarchy. | Collapse supplementary panels and shorten queues. |
| Trust / credibility | 4 | AI result preserved; unsaved copy, revision conflict, retention and fictional boundaries visible. | This review proves no live provider capability; ordinary technical copy distracts. | Keep evidence/provenance behind deliberate disclosure. |
| User-facing cleanliness | 3 | Form question summaries avoid raw IDs and types until Advanced details. | Conversation metadata, policy/server terminology, review enums and failure strings remain visible. | Remove raw mechanics from routine work. |
| Navigation / IA | 3 | Roles surface appropriate primary tasks; active secondary groups and breadcrumbs work. | Browser Back returned to Welcome from the tested analytics drill; explicit return works. | Make meaningful task transitions restore browser history. |
| Workflow coherence | 4 | Analytics-to-evidence explicit return, group reuse, pinned forms and review completion connect. | Queue remains above the detail; dual policy/schedule saves need care. | Separate the active review from list and analysis context. |
| First-time learnability | 3 | Forms, Groups, Answer Sets and Policies have useful one-sentence introductions. | Four-level scale can lead to an incompatible format; calibration expects a typed form reference. | Teach compatibility in the picker; offer named form/version choices. |
| Authoring usability | 3 | Fresh form and another form reusing three questions were saved locally. | Format detour, list-plus-editor height and local/saved libraries add cognitive load. | Let users find the intended reusable standard before choosing its technical format. |
| Reviewer usability | 3 | Answers and both note types survived evidence; completion reduced 5 to 4 without Refresh. | My Reviews action is offscreen at 390px; comparison/queue repeat before inputs. | A focused review page with visible evidence and completion actions. |
| Operational usefulness | 4 | Overview identifies attention, quality, coverage, open work and health; drills exist. | Workload/health fall below coverage; pass rate and some health metrics lack direct action. | Compress coverage and bring workload/health into the initial scan. |
| Responsive/mobile quality | 3 | Required pages fit 390px; mobile View selectors and resize state worked. | Table investigation/review actions require horizontal scrolling; long filter and metadata stacks. | Use task cards or frozen primary actions for reviewer mobile queues. |
| Accessibility pragmatics | 4 | Four persona keyboard tasks completed; labelled controls, aria-current, sorting and status exist. | Long tab sequences; native select replay needed type-to-select; no certification or physical-device proof. | Reduce focus stops and make primary actions easier to reach. |
| Showcase → product continuity | 3 | Visual identity stays consistent; public fictional library and authenticated Overview are distinct. | Public handoff changes from a clear customer story to raw IDs and a technical table. | Offer a short role/task start with a meaningful sample interaction label. |

**56 / 16 = 3.50/5.** The average does not override the eight weak 3/5 categories or the release blockers. The source lock retains the complete findings as well as this scorecard.

## 7. Blind first impressions

[Contemporaneous blind record](v019-final-whole-product-review-evidence/public/blind-public.json). Clean Chromium context, empty storage, actual public deployment; no product source, old assessment or tranche report read.

| Moment | Belief formed from the visible product |
|---|---|
| First 5 seconds | AQM is a quality-management layer for Genesys conversations: Jev interprets answers, AQM applies explicit evaluation rules, people review independently. |
| First 30 seconds | Broader evaluation can find weak customer outcomes that limited manual sampling misses. “Clear next step” versus “timeline not agreed” makes the reason to care concrete. |
| After five chapters | Jev answers questions; AQM scores, organizes coverage and operational work; humans challenge evidence and calibrate rather than overwrite the original AI result. |
| Pilot expectation | Agree criteria, select controlled completed interactions, run a bounded daily policy, allocate human review and discuss disagreements/coaching. Setup and live-operation proof still need an owner. |

Confusion recorded without source rescue: chapter 2 has several simultaneous scoring concepts; scale/percentage metrics need care; the calculator's small input estimate cannot be read as the total cost of a pilot. On 390px the proposition remains readable, but the first screen contains less explanatory material and the full story requires scrolling.

## 8. Public pitch

Welcome, the calculator, all five chapters and the public handoff were exercised on the actual URL without replacing core content. [Welcome desktop](v019-final-whole-product-review-evidence/public/welcome-desktop.png), [390px](v019-final-whole-product-review-evidence/public/welcome-mobile.png), [Human challenge](v019-final-whole-product-review-evidence/public/demo-4-desktop.png).

The full page explains why wider evaluation is interesting and why independent human review matters. Fictional/prepared claims remain visibly bounded. What is demonstrated is a coherent illustration and deployed interface, not reliable real-world AI accuracy, customer outcomes or total savings.

### Economics

| Scenario | Expected / observed |
|---|---|
| 100,000/month; 50%; 1 form; 1 request; 8,000 input tokens | 50,000 selected; 50,000 evaluations/requests; 400 million tokens; $16.80 model input. |
| 1,000/month; 25%; 2 forms; 3 requests/form; 10,000 tokens/request | 250 selected; 500 form evaluations; 1,500 requests; 15 million tokens; $0.63. |
| 1/month; 1%; 1 form/request/token | 0 selected, 0 requests and $0.00. The fresh finding F10 records undisclosed whole-interaction rounding. |
| Zero | Zero work and $0.00, without a bogus positive cost. |
| Negative / percentage 101 / blank required field | “Check inputs” and range/required guidance; no misleading positive estimate. |

Increasing selected share, forms, requests or repeated input tokens increases model cost. The description of repeated transcript input is useful. Exclusions include transcription, Genesys licensing/retrieval, hosting, storage, network, retries, tax and human review. A quality leader can understand the principal drivers without treating this as total operating cost. [Exercise record](v019-final-whole-product-review-evidence/public/public-exercises.json).

Post-lock source clarification: selected conversations are intentionally floored to whole interactions. Positive tiny costs use a less-than label; F10 is not a defect in nonzero cost formatting. The locked observation/score is unchanged. A short whole-interaction assumption would resolve the ambiguity. The displayed Jev rate was checked against the [official model documentation](https://docs.typesafe.ai/models); confidence interpretation against [official confidence documentation](https://docs.typesafe.ai/confidence).

### Five chapters

Scores below are a fresh editorial breakdown of the observed pitch, not acceptance-criteria scores. C = clarity, N = narrative value, I = information quality, V = visual effectiveness, B = interaction burden (higher is easier).

| Chapter | C | N | I | V | B | Classification | Evidence, strengths, limit and improvement |
|---|---:|---:|---:|---:|---:|---|---|
| Customer case | 5 | 5 | 4 | 4 | 5 | KEEP | Jamie needs access before the next shift; Alex restores it but leaves timing as “later.” Clear evidence and low burden. Information/visual 4: lengthy transcript/context could emphasize the decisive exchange more; a 5 would make that evidence easier to scan. |
| Define quality | 3 | 4 | 4 | 3 | 3 | TIGHTEN | Shared criteria make judgments accountable. Yes/No, weights, critical rules, group ratios and a 75% threshold compete. Simplify the first visible definition; disclose arithmetic after the rule. Narrative/info 4: good premise, still needs presenter explanation. |
| Evaluate at scale | 4 | 4 | 4 | 4 | 4 | KEEP | AI 100%, confidence 56%, 24 of 48 selected; confidence caveat and scale are explicit. All 4s: useful but several metrics compete. Lead with answer → rule → score and keep confidence subordinate. |
| Human challenge | 5 | 5 | 5 | 5 | 5 | KEEP | Prepared human 56% versus AI 100%, 44pp difference, unchanged original AI and decisive timing evidence. The narrow illustrative task is unusually intuitive; no essential extra interaction. It remains an example, not a population finding. |
| Manage & pilot | 4 | 5 | 4 | 4 | 4 | TIGHTEN | 24 evaluations / 5 weak cases lead to owned coaching and a daily 08:00 pilot. Strong consequence/next step. One completed human example is honestly bounded. Tighten parallel management cards and make setup ownership concrete for the 4-scored dimensions. |

The most obvious forward path encounters customer evidence → criteria → AI result → human challenge → management implication → pilot next step. Six meaningful primary actions (enter demo, four Next actions, Plan pilot); no essential story element depended on a secondary button.

After the judgment lock, the historical dwell methodology was retrieved and replayed: Welcome 30s; economics 35s; case 40s; definition 35s; AI 45s; human 35s; management 30s; pilot 10s. Four scroll positions per chapter. **Elapsed 271.998s (4:31.998); explicit dwell 260s; overhead 11.998s.** Below 5:00, essentially the same as the previous 272.137s. Presenter explanation remains useful for chapter 2 arithmetic, confidence, operating costs and setup ownership. Automated timing is not human-comprehension proof. [Timing and request record](v019-final-whole-product-review-evidence/public/paced-public.json).

## 9. Showcase → product

Explore the prototype enters the fictional sample Conversations library without credentials. The identity, palette and customer-evidence vocabulary remain recognizable; the first useful action is inspect an interaction. The abrupt switch to raw IDs and a broad table weakens the story-to-task handoff. The public boundary is visible, but the destination feels more technical than the pitch. Authenticated Open AQM enters Overview and immediately shows the fictional organization's attention/quality/work.

The locked continuity score is 3. A meaningful sample label and a short role/task start would make this feel like one product. [Public entry](v019-final-whole-product-review-evidence/public/handoff-disconnected.png), [authenticated entry](v019-final-whole-product-review-evidence/authenticated/authenticated-open-aqm.png). The seven standard workspace bootstrap storage writes after public handoff are distinguished from the zero-write Welcome/demo journey.

## 10. Navigation / IA

| Role | Immediately visible tasks | Secondary / utilities | Independent judgment |
|---|---|---|---|
| ADMIN | Overview, Evaluations, Analytics, Calibration | Configuration: Policies, Forms, Groups, Answer Sets; Interactions: Conversations; Settings/About utilities | Attention is an appropriate start. Configuration requires a deliberate expansion but is discoverable; Settings remains reachable. |
| AUTHOR | Forms, Question Groups, Answer Sets, Policies | Quality/evidence investigation secondary; Settings/About | The four related concepts lead. No operational destination displaced authoring. A scale-format wrong turn remains inside the task. |
| REVIEWER | Evaluations (My Reviews), Calibration, Analytics, Overview | Reference configuration secondary; Settings/About | Assigned work is prominent; configuration no longer a peer block of irrelevant edit destinations. The queue's offscreen action still causes a mobile wrong turn. |
| VIEWER | Overview, Analytics, Evaluations, Calibration | Reference configuration and Conversations secondary; Settings/About | Investigation leads; definitions are intentional references. Finding the defining form requires navigation rather than a direct evaluation link. |

Exact role labels/current expansion are in [role navigation](v019-final-whole-product-review-evidence/role-navigation.json); initial/task geometry is preserved in [responsive observations](v019-final-whole-product-review-evidence/responsive-observations.json) and the role screenshots. Group labels are generally intelligible. “Reference configuration” is accurate, though a colleague may think “Definitions” more readily. Active secondary groups remain expanded and show the current destination; collapsed groups are secondary, not inaccessible.

Human breadcrumb labels and `aria-current="page"` worked. Native details/summary conveys expanded state; selected views use `aria-pressed` or a native selected value. Explicit contextual return preserves the cohort/tab. **Browser Back is weaker:** Analytics Questions → evaluations → Back reached Welcome; Forward restored the evaluation cohort. This is F7, retained by a characterization test rather than rewritten green. Post-lock source inspection identifies widespread `replaceState` as the cause.

Conversations → selected interaction → Conversation review → back and Evaluation → Open conversation → Back to review/evaluation worked. Conversation review feels contextual rather than a permanent navigation peer. A disconnected direct `?page=evaluate` shows the connection guard instead of an editable review; authenticated contextual paths were the fully exercised evidence routes. Direct guard H1 coverage is a limitation, not an invented pass.

## 11. Overview

The independent 30-second scan encountered attention first, then quality/coverage, then review workload and health. The first two questions are easy; all five require scrolling. Desktop height ~3,080px, mobile ~4,756px. [Desktop](v019-final-whole-product-review-evidence/authenticated/admin-overview-desktop.png), [mobile](v019-final-whole-product-review-evidence/authenticated/mobile-admin-overview.png).

In the 7-day fictional organization: average quality 79% across 8 evaluations; pass rate 100%; no critical failures. Coverage: 20 eligible, 10 sampled, 6 content available, 4 evaluated; 3 failed evaluation attempts. Current review work: 7 open, 1 due soon, 1 overdue, 1 escalated, 1 unassigned. Health: automation Attention, Genesys Unverified, Jev Error, scheduler/notifications Healthy, review SLA Escalated. At 30 days: 74% quality, 9 evaluations, 89% pass and 1 critical failure. The dates and current-work scope are visibly distinguished.

QUALITY ATTENTION, REVIEW ATTENTION and SYSTEM ATTENTION have distinct meanings. Critical failures drill into quality evidence without masquerading as an infrastructure outage. Escalated review and failed run cards link to the relevant work; upcoming work links to its policy. The generic attention strip can still make an escalated review look like an “error,” but named cards provide interpretation.

| Headline | “So what?” / action / scope |
|---|---|
| Average quality / evaluations | Selected-range cohort drill, sample/history caveat; useful investigation. |
| Critical failures | Exact failing cohort; actionable quality attention. |
| Pass rate | Describes outcomes, but no direct distinct drill: partly orphaned. |
| Evaluated conversations + evaluations | Different units, useful when multiple forms apply; little extra insight in this small one-form cohort. |
| Coverage rates | Denominators and Coverage drill; explains breadth independently of quality. |
| Open/late/unassigned reviews | Current work, cohort drills and My Reviews; actionable. |
| Health | Named state and System details/operations; no live verification performed here. |
| Scheduled/recent work | Relevant policy/run drills; useful admin context below the initial scan. |

F8 calls for compact first-screen workload/health, not removing the now-useful coverage explanation.

## 12. Analytics

The first screen now reads as a quality product: cohort → quality metrics → What stands out → investigation → technical scope disclosure. All dates/sources/policies/published forms yielded 26 evaluations/conversations, average 74.7%, pass 92.3%, critical 7.7% (2 occurrences). [Overview](v019-final-whole-product-review-evidence/authenticated/analytics-overview-desktop.png).

Goal-only route: Analytics → lowest average question → Inspect evaluations → evaluation → Open conversation → Back to evaluation → Back to Analytics. Conclusion: General Customer Service **v18**, Understanding the issue, **33.1%**, **1 applicable answer**, one supporting evaluation. A single answer is worth inspecting but is not a statistically established coaching priority. The card explicitly shows its small sample. v17 has 25 applicable answers and a rounded 33.1%; those displayed averages must not be assumed an exact numeric tie.

Queue goal: Customer care, **74.5%**, **25 evaluations**. Inspect evaluations opened the Queue: Customer care / Analytics cohort, 25 total results with local pagination. Question goal: exact form/version and applicable counts are shown; critical greeting evidence has 2 occurrences in v17. The weakest question is not itself critical. No causal explanation is inferred from these descriptive comparisons. [Question cohort](v019-final-whole-product-review-evidence/authenticated/analytics-lowest-question-cohort.png), [queue evidence](v019-final-whole-product-review-evidence/authenticated/queue-supporting-evaluations.png).

Technical corroboration after lock: ranking excludes non-finite/null averages, retains actual zero, requires positive applicable samples, separates exact `formRef` versions and uses deterministic tie breakers. Existing deterministic presentation tests cover these boundaries; they are part of the 621-test count. The visible caveat rules out significance and causality claims. Explicit Back to Analytics restores full cohort and selected Questions tab; Browser Back does not (F7). [Return](v019-final-whole-product-review-evidence/authenticated/analytics-history-return.png).

## 13. Coverage

The 1,000 case is a coverage-only fictional run fixture, without 200 associated result records; its quality header remains zero. That setup is not a claimed production inconsistency. Goal-only explanation of **1,000 eligible observations**: policy intentionally samples 500; content is available for 300; 200 reach evaluation; 10 evaluation attempts fail. Sampling coverage 50% (sampled/eligible), content availability 60% (available/sampled), sample completion 66.7% (evaluated/available), evaluation coverage 20% (evaluated/eligible). Failed attempts are a separate unit, not the missing-interaction count. No need to read docs to explain these denominators. [1,000-observation fixture](v019-final-whole-product-review-evidence/authenticated/coverage-1000-observations.png).

Totals are explicitly **observations across runs**; an interaction can appear again. The explanation is sufficient without excessive repetition. Eligible → sampled is explained as intentional policy sampling, but “Where coverage was lost” still puts the 500 unselected observations under a loss heading (F9).

Overview's 7-day 20/10/6/4 differs from all-date Analytics 30/15/9/6 because the date cohort differs. Same-scope Overview → Explore coverage retains dates/source/policies and the same rates. A single run shows 10/5/3/2 and 50/60/66.7/20; labels/denominators match. Run failed-attempt count uses the run's completed/failed evaluation-attempt fields, not another differently scoped snapshot count. No contradictory same-scope user-visible value was established. [Run detail](v019-final-whole-product-review-evidence/authenticated/coverage-run-detail.png), [post-lock corroboration](v019-final-whole-product-review-evidence/postlock-confirmation.json).

## 14. Reviewer experience

Goal: “Complete the review that needs my attention.” The role opens My Reviews, prioritized escalated → overdue → due soon. Starting the highest-priority row opens the selected evaluation; a second Start review begins the human draft. The route is sensible but the distinction between open/start adds one action. On mobile the row action begins at **x=1,025.375, width=78.5** in a 390px viewport; internal horizontal scrolling moves it to x=281.375. The document itself fits; this is an actual important-control discovery defect, not a scrollWidth claim (F1).

Two answers, a question note and an overall note were entered before inspecting conversation evidence. Returning retained all four, the selected evaluation and draft state. “Unsaved review changes · Kept temporarily while you inspect this session” and “Discard my unsaved answers” make continuity feel safer, not merely technically retained. [Unsaved](v019-final-whole-product-review-evidence/authenticated/review-unsaved-desktop.png), [evidence](v019-final-whole-product-review-evidence/authenticated/review-evidence-desktop.png), [mobile draft](v019-final-whole-product-review-evidence/authenticated/review-unsaved-mobile.png).

Completion without Refresh removed the item from My Reviews (5 → 4), reconciled escalation (1 → 0), showed completion confirmation, retained understandable detail and displayed human 69% versus AI 78% (~9.3pp). The AI evaluation record was unchanged in the formal continuity assertions. A second mobile completion also retained evidence-detour notes. [Completed](v019-final-whole-product-review-evidence/authenticated/review-completion-desktop.png).

The page still begins with queue, evaluation summary, assignment/SLA, four comparison metrics and group comparison before answer work. Confidence, group comparison, notes, history and assignment each have legitimate uses; their combined hierarchy is excessive. Starting desktop height 3,773px, completed 3,826px for a three-question review. The locked reviewer score is 3 independently of the continuity fix (F2).

## 15. Authoring

Blind goal 1: “Create a quality form that asks whether the resolution was clear, using the reusable four-level Resolution clarity scale.” First destination Forms; new form starts empty, not with an unrelated question. Added title/instructions, chose Ordered scale from the natural language goal, then found only Customer effort and Service quality in the compatible picker. Cancelled, switched to Multiple choice, found Resolution clarity v1 and attached its four options. Saved fictional “Fresh resolution quality.” This was a real goal-driven detour, not a prior scripted acceptance replay (F5).

Blind goal 2: “Reuse three related questions across another evaluation form.” Add reusable group naturally exposes Resolution & Next Steps, three questions. Added it to another new form and saved exactly three questions; no unwanted starter removal. Answer Sets was understood as reusable answers, Question Groups as reusable questions. No conceptual confusion between them in this replay.

The UI now teaches the expected one-sentence model: Answer Set = choices/scale; Question Group = related reusable questions; Evaluation Form = complete quality definition/questions/scoring/pass rules; Policy = selects conversations and published forms. A form/question format compatibility rule still requires extra learning.

Empty form, collapsed/expanded question, multi-question form and published read-only form were inspected desktop/mobile. Normal collapsed question has title, instructions, named answers, weight/enabled and Edit; expanded editing groups Question/Answers/Scoring/Applicability with Advanced closed. Technical IDs/keys/provider values are available deliberately. Published Viewer definitions use View details rather than disabled edit fields. Mobile form height remains ~3,155px including library/editor; this is much better focused but not unusually compact. [Empty](v019-final-whole-product-review-evidence/authenticated/author-new-empty-form.png), [compact](v019-final-whole-product-review-evidence/authenticated/author-saved-compact-form.png), [group reuse](v019-final-whole-product-review-evidence/authenticated/author-reused-question-group.png).

## 16. Answer Sets

**3.80/5: strong reusable primitive with format-discovery and mobile-table friction.**

| Dimension | Fresh | Evidence / works | Prevents a 5 / improvement |
|---|---:|---|---|
| Concept clarity | 4 | Reuse choices/scale and versioned form copy explained. | Compatibility distinction is not taught in the natural goal; show it once. |
| Discoverability | 4 | Primary Author destination and in-question reuse action. | Picker hides incompatible named sets; offer explicit format switch. |
| Creation UX | 4 | Name, labels, percent credit, blank Not scored; fictional draft saved. | Long option editor/library stack; focus the active definition. |
| Reuse UX | 3 | Compatible v1 attaches safely. | Ordered-scale detour excludes intended standard; improve discovery. |
| Versioning UX | 4 | Aligned current/new labels, credit and resulting order. | No direct repair link for dependent conditions; offer one. |
| Safety/error clarity | 4 | Removed label and dependent question named, Apply disabled. | Repair still manual; link to exact condition and return to comparison. |
| Forms integration | 4 | Attached options, version and explicit update/detach. | Format chosen before standard can frustrate; standard-first action. |
| Groups integration | 4 | Shared question editor attaches v1 and saves reusable group. | Relationship could be taught more compactly; one diagram/sentence in context. |
| Mobile | 3 | Editor fits; labels/credits readable. | Wide library table and stacked option rows; task cards/focused details. |
| Terminology cleanliness | 4 | Human answer formats, percent credit; mappings behind Advanced. | Remaining library/version status jargon; use human state labels. |

v1 → v2 scenarios included added Not applicable (Not scored), renamed Clear → Completely clear, changed 100% → 90%, reordered options, and a separate removed Partly clear scenario. Before Update the aligned rows and resulting order predict what changes; the original question remains unchanged until Apply. [Comparison](v019-final-whole-product-review-evidence/authenticated/answer-set-version-comparison.png).

Blocked update names removed Partly clear and dependent “Clarify partial resolution,” explains changing/removing that condition and disables Update. This is useful repair guidance rather than credit solely for blocking. Post-lock corroboration edited the named condition, removed it, retried Update and saved v2 successfully; there is no direct Repair button. Published immutable versions correctly rejected an attempted fixture overwrite; the removed-answer fixture was then seeded directly in fictional memory, never production. [Blocked](v019-final-whole-product-review-evidence/authenticated/answer-set-blocked-update.png), [repaired](v019-final-whole-product-review-evidence/authenticated/blocked-update-repaired.png).

## 17. Policies

Goal: apply the published customer-service form to the right conversations and schedule daily. Opened Daily Voice Customer Service AQM, confirmed voice criteria, General Customer Service v17, intentional 50% selection, and saved the daily 08:00 Europe/London schedule locally. Criteria, exact published form selection and readiness are intelligible. Separate policy and schedule saves add care; do not mistake a saved definition for an active schedule.

Ordinary DURABLE POLICY, “saved server” wording and raw form ID detract from author intent. Named criteria/versions are useful; internal ownership/storage terminology belongs behind details. No Run policy, real scheduling dispatch or notification was executed. [Daily confirmation](v019-final-whole-product-review-evidence/authenticated/policy-daily-0800-confirmed.png).

## 18. Calibration

Goal: find where humans and AI disagree most. Initial form table gives General Customer Service v17, **2 completed reviews / 6 questions**, exact agreement **33%**, mean absolute score gap **16pp**, **4 disagreements**; 7 unresolved (2 in progress) are separate work. The Questions view first asks for a form/version using `form_id@17`; this is a real discoverability barrier (F6).

Post-lock corroboration typed the known fictional `general_service@17`: Warm opening has **0% agreement, 2/2 disagreements, AI credit 100%, human 0%, 100pp credit gap**; Understanding the issue 2 disagreements and 33.9pp; Resolution 100% agreement. Warm opening opens the exact reviewed-question evaluations. The sample of two is shown and cannot establish a population accuracy claim. Confidence 95% on disagreements here is clearly diagnostic, not measured accuracy; the caution against significance/causality and human replacement of Quality KPIs is visible. [Questions](v019-final-whole-product-review-evidence/authenticated/calibration-question-evidence.png), [support](v019-final-whole-product-review-evidence/authenticated/calibration-supporting-evaluations.png).

At 390px the labelled native **View** select successfully changes breakdown without knowing implementation. This solves the hidden right-hand tab problem, although the select sits beneath a long filter stack. [Mobile](v019-final-whole-product-review-evidence/authenticated/mobile-admin-calibration.png).

## 19. Viewer experience

Goal route: Analytics → Questions → supporting evaluation → evaluation detail → Reference configuration → Forms → General Customer Service v17. The supporting exact-version definition is reachable; the manual form navigation is an unnecessary detour compared with an Open defining form action. Read-only published Forms are intentionally presented as inspection, with View details and role explanation, not a disabled editor. Quality investigations remain useful; raw IDs/enums in evaluations/evidence and technical Calibration filters remain friction. [Defining form](v019-final-whole-product-review-evidence/authenticated/viewer-defining-form.png).

## 20. Admin experience

Goal: check attention and inspect the relevant policy. Overview establishes escalated review, failed run and stale scheduler as different attention types. Upcoming work's View/Edit policy opens the corresponding daily policy; expanding Configuration → Policies is also keyboard accessible. Settings and About remain utilities. The primary four quality destinations avoid a large wall of configuration. F8 is the remaining first-scan issue, not a failure to discover Settings or Policies. [Attention-to-policy](v019-final-whole-product-review-evidence/authenticated/admin-attention-policy.png).

## 21. Settings / governance

| Section | Applicable inspection / assessment |
|---|---|
| Connection | OAuth region/client identity and verification states; necessary setup technical detail is appropriate here. No production Verify/Connect mutation. |
| Access | Role assignments and allowlist/bootstrap explanation. Users can see who has roles; user-ID/architecture copy is less teachable than a compact role-capabilities summary. |
| Reviews | Due-soon/escalation hours and review rules are understandable. Non-admin views are read-only, with explicit permission copy. |
| Privacy & retention | Record types, indefinite/period limits, purge meaning and cached evidence boundaries. Saving limits does not claim immediate deletion. “Server/browser” inventory is partly technical. |
| Notifications | Destinations, rules and deliveries; empty controlled fixture is clear. No send/rule/destination production write. Duplicate Notifications labels are low-value repetition. |
| Audit | Inspectable governance history/filtering; fixture has no production audit events. Raw resource/user filters assume implementation knowledge. |
| Advanced / Development | Sandbox/reset/debug controls are deliberate technical disclosure; no reset executed. |

One exposed H1 on tested Settings pages; a hidden mounted Conversations H1 is not a second accessible heading. Native subnav selected state and keyboard operation work. Dirty review settings retained edited 12h and unsaved state after a fictional save failure; Save all/Discard remained understandable, but the raw error was prominent. [Connection](v019-final-whole-product-review-evidence/authenticated/settings-admin-connection.png), [Privacy](v019-final-whole-product-review-evidence/authenticated/settings-admin-privacy-retention.png), [role observations](v019-final-whole-product-review-evidence/settings-observations.json).

A colleague can explain role-controlled authoring/review/administration, review deadlines, configured retention, notification rules and an audit trail. Exact access setup, audit resource filters and retention architecture still benefit from explanation; this is functional governance visibility, not proof of organizational compliance or actual notification delivery.

## 22. Conversations

Public sample versus authenticated Genesys source is distinguishable. Table/cards and filters were inspected; fictional authenticated search returns Maya Patel / Alex Morgan / Customer care. Selected interaction → evidence → back worked. The public sample table of 19 interactions and evaluation list still let raw IDs dominate meaningful customer labels.

Conversation review places evidence in the leading desktop column and the back action is contextual. At 390px Policy routing and even disabled evaluation controls precede the current conversation and transcript. Evidence does not lead on mobile; a metadata block (QUEUEID, SESSIONID, agent identifier, SOURCE) then adds another barrier before messages. This compounds the reviewer task hierarchy in F2 and the disclosure issue in F3. The transcript leads in desktop column order, but that does not establish mobile evidence priority. [Evidence](v019-final-whole-product-review-evidence/authenticated/analytics-conversation-evidence.png), [mobile review evidence](v019-final-whole-product-review-evidence/authenticated/review-evidence-mobile.png).

## 23. Failure states

All failures are fictional. [Failure observation record](v019-final-whole-product-review-evidence/failure-observations.json), [conflict record](v019-final-whole-product-review-evidence/conflict-observations.json).

| Injected failure | Observed safety / recovery | Product judgment |
|---|---|---|
| Overview partial section | Available quality/work remains; failed section identified with retry. | Good partial-service model. |
| Analytics load | “Quality analytics could not be loaded,” Retry, subordinate Technical details. | Best reusable failure pattern. |
| Forms load | Previously loaded definitions retained, production selection unavailable stated; Refresh. | Safe authority boundary; raw error too prominent. |
| Policies load | Saved policies unavailable; Refresh durable policies. | Does not invent local successful data; technical recovery vocabulary. |
| Groups load | Saved definitions retained; raw failure appears twice. | Safe but duplicate/technical noise. |
| Answer Sets load | Shared failure explicit; starters separate, not substituted silently. | Safe authority boundary, weaker recovery guidance. |
| Evaluation load | Error and “0 results / No production evaluations” coexist. | Unavailable can be mistaken for empty; F4. |
| Review revision conflict | Refresh required, draft inputs remain, no overwrite. | Safe; generic explanation could describe preserving/copying work more clearly. |
| Review reassignment conflict | Changed elsewhere/Refresh guidance, draft inputs remain. | Safe conflict; same generic copy obscures ownership change. |
| Removed-answer update | Names label and dependent question, Update blocked until repair. | Useful repair, manual navigation remains. |
| Settings save | Dirty values and save/discard state remain. | Safe retention; internal-fixture error should be Technical details. |

Known failures are retained and classified in validation evidence; a safe block is not automatically a usability success.

## 24. Mobile / responsive

390×844 covered Welcome, five chapters, all four role navigation sets, Overview, My Reviews, active review, evidence/completion, Analytics Overview/Questions/Coverage, Calibration, Forms, Groups, Answer Sets, Policies, Settings and Conversations. 1440×900 was the primary desktop; 1920×1080 tested representative large screens; 1440×720 checked all role sidebars plus public/content. Representative Forms and Analytics state survived 1440 → 390 → 1440.

| Important measurement | Result / implication |
|---|---|
| Mobile reviewer Start review | x1,025.375 → x281.375 after internal table scroll; 78.5×46px. F1 despite no document overflow. |
| Mobile navigation | Primary tasks wrap into reachable rows; initial role nav ~340px high. Utilities remain reachable, but content begins after a sizeable shell. |
| Short-desktop expanded Admin sidebar | Settings initially y702, bottom746 at720px; sidebar scroll brings it to y676, height44. About also reachable. Important utilities are not unreachable. |
| Mobile Overview / Analytics Overview | ~4,756 / 2,859px; long operational scan. |
| Mobile Analytics Questions / Coverage | ~1,856 / 2,302px; native View selection succeeds, table investigation still horizontally scrolls. |
| Mobile Form / Policy | ~3,155 / 3,516px; normal form editing improves, list/editor and schedule stacks remain long. |
| Mobile Groups / Answer Sets / Settings / Conversations | ~1,584 / 1,350 / 1,773 / 1,777px; local table overflow needs deliberate scrolling. |

Actual button boxes and local scrolling were measured, not just document width. Filters, table actions and utilities were inspected for clipping/reachability. No uncontrolled whole-page horizontal clipping was established; broad internal tables remain a usability cost. [Mobile measurements](v019-final-whole-product-review-evidence/mobile-measurements.json), [resize/short desktop](v019-final-whole-product-review-evidence/responsive-observations.json).

## 25. Accessibility pragmatics

Four keyboard-only persona tasks completed: Reviewer queue → draft → evidence → return → complete; Author Forms → question → picker → attach → save; Viewer Analytics → Questions → evaluations → back; Admin Overview → Configuration → Policies. Additional keyboard probes operated mobile Analytics/Calibration View and Settings subnav (seven task/probe sequences, not seven test suites). Native select replay first failed using ArrowDown/Enter; type-to-select worked. This harness attempt is retained, not called a product failure.

Labels, current-page semantics/breadcrumbs, pressed view buttons, native details expansion, sort `aria-sort`, named Answer Set dialog, visible heading hierarchy and relevant status/error announcements were inspected. No tested keyboard trap. The inline picker is nonmodal; not every focus/escape path or screen-reader behavior was certified. Focus restoration/selection worked in the tested picker/evidence-return paths. Dirty Settings navigation invoked its native leave guard; an initial automation timeout while the dialog was dismissed by default was a harness issue.

Long keyboard paths are a real burden: authoring reached 45 Tab stops before opening the form and later 47 before Save in the full stacked page. Completion proves reachability, not ease. Reduce focus stops by focusing the active task (F2). [Keyboard record](v019-final-whole-product-review-evidence/keyboard-observations.json), [semantics](v019-final-whole-product-review-evidence/semantics.json).

## 26. Internal-mechanics audit

Normal visible UI was inspected before source search; post-lock source/copy inspection explained causes. Classification depends on where the term appears, not a blanket keyword ban.

| Copy / location | Classification | Judgment |
|---|---|---|
| Cloud Run / endpoint / Firestore in setup or deliberate technical disclosures | APPROPRIATE or ADVANCED ONLY | Operational setup/debug context can name infrastructure. None required understanding to follow Welcome/demo. |
| “Jev managed securely by automation service” shell | APPROPRIATE | Gives credential boundary, though repeated globally. |
| “DURABLE POLICY,” saved server / Refresh durable policies in ordinary policy task | LEAKAGE | Save/schedule intent should lead; architecture adds no decision value. |
| Server / This browser and provider provenance in ordinary evaluation filters | LEAKAGE | A real authority distinction, presented in implementation vocabulary. |
| QUEUEID / SESSIONID / raw agent identifier / SOURCE before conversation messages | LEAKAGE | Evidence first, metadata disclosure later. |
| Form ID @ version, Policy ID, `form_id@17` Calibration filter | LEAKAGE | Named exact-version selectors are preferable. |
| family / asset / keys / source values / formRef / questionId in Advanced mapping/detail | ADVANCED ONLY | Useful diagnostic mapping, not ordinary question authoring burden now. |
| “Local drafts & starter examples” | APPROPRIATE | Distinguishes private examples from saved authority; could be visually quieter. |
| Noul / choice / score / raw types inside deliberate technical mapping | ADVANCED ONLY | Human format names lead routine authoring. |
| SCORE/CHOICE and NOT_REVIEWED/REVIEW_REQUESTED/IN_REVIEW, genesys-cloud in ordinary results | LEAKAGE | Human labels should replace storage enums; legitimate score terminology itself is appropriate. |
| Internal-fixture-503 and raw load errors | LEAKAGE | Failures need subordinate Technical details. |
| Retention's browser/server inventory and audit IDs | APPROPRIATE for technical governance, partly LEAKAGE in routine explanation | Keep a plain explanation and details toggle. |

The technical terms not encountered ordinarily are not counted as leakage merely because source contains them. F3 is a bounded copy/disclosure finding, not an instruction to hide genuine fictional/live or persistence boundaries.

## 27. Action burden

Counts describe observed meaningful actions: opening/navigation/selection, each filled field and saving count once; repeated keystrokes, screenshot/viewport operations and waiting do not. These are reconstructed agent replay counts, not recruited-human effort or statistically comparable averages. [Action sequences](v019-final-whole-product-review-evidence/action-burden.json). Entry positions are stated to avoid false precision.

| Task / entry | Actions | Unnecessary detour |
|---|---:|---|
| Pitch → pilot, Welcome | 6 | None essential; scrolling/presenter explanation still needed. |
| Reviewer → complete with evidence, My Reviews | 10 | Open/start split; queue/comparison scrolling not represented in count. |
| Author new form + Answer Set, already in Forms | 13 (14 including Forms navigation) | Ordered scale picker → cancel → format switch → reopen. Includes title/instructions. |
| Reuse group across existing and another form | 8 | Three actions attach/save first, five new form/name/attach/save second. No starter removal. |
| Quality leader lowest question → evidence, Overview | 4 (7 with explicit returns) | Cohort route is direct; browser-history return is unreliable. |
| Viewer analytics → defining form, Overview | 7 | Reference configuration → Forms → find exact definition instead of a direct link. |
| Admin attention → relevant policy, Overview | 2 | Change range then direct View/Edit; alternate Configuration route adds expansion/list choice. |

Horizontal action search and page scrolling are material costs beyond the action totals. Keyboard Tab counts are reported separately.

## 28. Top findings

No P0 observed. P1 = major workflow/comprehension issue; P2 = meaningful usability/polish; P3 = minor polish. Only the first two block v0.19.0 under this review's internal-pilot judgment.

| ID / priority | Finding / evidence | Persona / impact | Recommended fix / likely scope | Block v0.19.0? |
|---|---|---|---|---|
| F1 P1 | The primary mobile reviewer action starts outside the visible table. reviewer-my-reviews-mobile.png; Start review before scroll x=1025.375, width=78.5; after internal scroll x=281.375. | REVIEWER: A user looking for work must discover horizontal scrolling before the obvious action. | Use review cards or freeze/repeat Start/Continue review beside meaningful interaction labels. Reviewer queue rendering only. | Yes |
| F2 P1 | Active review is buried beneath the queue and repeated comparison material. review-detail-start.png: 3773px page; active controls follow queue, evaluation summary, assignment, four comparison metrics and group comparison. Completed desktop page 3826px. | REVIEWER: Excessive scrolling and attention switching during the primary human task; safe continuity does not make the surface efficient. | Open a focused review work surface; put evidence/answers/save/complete first and comparisons/history behind disclosure. Reviewer detail composition and task navigation. | Yes |
| F3 P2 | Routine screens still leak technical mechanics and identifiers. Conversation evidence shows QUEUEID, SESSIONID, raw agent ID and SOURCE before messages; policy editor shows DURABLE POLICY, form ID; evaluations show raw review enums. | REVIEWER / VIEWER / AUTHOR: Colleagues need to translate implementation vocabulary while investigating quality. | Move raw IDs, provider provenance and architecture terminology into Advanced details. Copy and disclosure hierarchy. | No |
| F4 P2 | Most failure surfaces expose raw errors instead of consistent recovery guidance. failure-groups has the raw message twice; failure-evaluations looks like an empty results table; settings-save ends with internal-fixture-503. Analytics and partial Overview are better. | All authenticated roles: Users cannot consistently distinguish unavailable data from no results or decide their next safe step. | Reuse the Analytics failure pattern: what failed, retained state, Retry, subordinate Technical details. Failure presentation components. | No |
| F5 P2 | The reusable clarity scale is absent after the natural Ordered scale choice. Blind author task picked Ordered scale; picker offered only Customer effort and Service quality. Switching to Multiple choice exposed Resolution clarity v1/v2. | AUTHOR: A reasonable mental model appears to lose the requested reusable standard. | Show named sets with compatibility explanation and an explicit format-switch action. Answer Set picker discovery. | No |
| F6 P2 | Calibration question investigation still asks for a technical form reference. calibration-mobile.png: selecting Questions says Select a form/version; filter placeholder form_id@17. | QUALITY LEADER / VIEWER: Knowing the human form name/version is insufficient for an easy question breakdown. | Use a named published form/version picker and an obvious drill from the form comparison. Calibration filters and drill. | No |
| F7 P2 | Browser Back does not follow the meaningful analytics investigation transition. Original analyticsTab=questions; drill to evaluations; browser Back reached page=welcome; Forward restored evaluation cohort; explicit Back to Analytics restored Questions. | QUALITY LEADER / VIEWER: Ordinary browser navigation unexpectedly leaves the investigation. | Push task transitions to history and restore cohort/tab on popstate. Workspace URL/history routing. | No |
| F8 P2 | Overview hides workload and automation health below a lengthy coverage section. admin-overview-desktop.png / mobile-admin-overview.png: attention and quality precede coverage, then workload and health; desktop total 3080px, mobile 4756px. | QUALITY LEADER / ADMIN: The 30-second scan needs scrolling to answer all five primary questions. | Use a compact first-screen workload/health summary with coverage details below. Overview hierarchy. | No |
| F9 P2 | Coverage still groups intentional sampling under Where coverage was lost. coverage-1000-observations.txt: 500 policy-excluded interactions appear beneath loss heading; subsequent text correctly says intentional. | QUALITY LEADER: The heading briefly frames a policy decision as failure. | Split Not selected by policy from Content or evaluation gaps. Coverage subsection heading/copy. | No |
| F10 P3 | Tiny calculator scenarios round fractional selected work to zero. public-exercises.json: 1 conversation × 1% × 1 form × 1 request × 1 token displays 0 selected and $0.00. | PITCH VISITOR: Harmless at ordinary volumes but the displayed estimate obscures small nonzero quantities. | Use less-than labels or fractional planning counts at tiny volumes. Calculator formatting. | No |

F10's post-lock arithmetic clarification is recorded in section 8 without retroactively editing the locked judgment. The comparison/evidence index gives direct links to the screenshot names used above.

## 29. Remove / simplify

Highest-value subtraction: remove the queue and repeated high-level comparisons from the active answer-work surface; disclose group comparison/confidence/history on demand. Repeat/freeze only the mobile primary review action. Then move conversation identifiers before the transcript into details; reduce the Overview coverage stack; remove duplicated raw failure messages; shorten routine policy persistence terminology and duplicate notification headings. Keep the explicit independent-AI, fictional/live, version and unsaved boundaries—they earn trust.

## 30. Strongest elements

| Area | Strongest current experience |
|---|---|
| Pitch | Human challenge: decisive transcript, prepared disagreement, original AI visibly unchanged. |
| Quality leader | Analytics What stands out with named version, applicable sample and exact evidence drill. |
| Reviewer | Unsaved answers and both note types survive evidence; completion reconciles workload immediately. |
| Author | Empty form → three-question reusable group, with compact question summaries and no unwanted starter. |
| Trust | Independent human result plus preserved AI, explicit conflicts and immutable version comparison. |
| Mobile | Labelled native Analytics/Calibration View selectors reveal every breakdown. |
| Accessibility | Current-page navigation/breadcrumb semantics plus keyboard-operable role groups and view selection. |

## 31. Change since previous review

This comparison was made **after** the fresh lock. The old report was not present on canonical main; it was retrieved from `origin/codex/aqm-v019-whole-product-review:docs/v019-whole-product-review.md`. The A–D reports were then consulted for context/boundaries, not to decide scores. [Comparison provenance](v019-final-whole-product-review-evidence/comparison-provenance.json).

Previous mean **2.875 (2.88)**; fresh **3.50**; delta **+0.625**. Previous product C → current B; pitch remains B. Answer Sets **2.8 → 3.8**. Continuity is independently scored lower (4 → 3) because the current public handoff was judged against the clear story-to-task transition, not because a code regression was proved. Scores were not forced upward.

| Category | Previous | Fresh current | Delta | Explanation |
|---|---:|---:|---:|---|
| Human effectiveness | 3 | 4 | +1 | Safe completion and exact evidence routes now connect human work. |
| Value proposition | 4 | 4 | +0 | Same strong proposition; definition still dense. |
| Information quality | 3 | 4 | +1 | Named cohorts, descriptive samples and coverage denominators. |
| Ease of use | 3 | 3 | +0 | Residual detours/density keep the same score. |
| Visual quality | 4 | 4 | +0 | Consistent visual language; long stacks remain. |
| Trust / credibility | 3 | 4 | +1 | Draft retention, unchanged AI and conflict/version boundaries. |
| User-facing cleanliness | 2 | 3 | +1 | Author technical detail moved behind disclosure; other leaks remain. |
| Navigation / IA | 3 | 3 | +0 | Role focus improves, browser history still weak. |
| Workflow coherence | 2 | 4 | +2 | Evidence return and queue completion now coherent. |
| First-time learnability | 3 | 3 | +0 | Concept introductions help; format/calibration learning burden remains. |
| Authoring usability | 2 | 3 | +1 | Compact questions and empty/group starts; format detour remains. |
| Reviewer usability | 2 | 3 | +1 | Safety fixed; presentation/mobile action discovery still 3. |
| Operational usefulness | 3 | 4 | +1 | Quality-first attention and exact drills now useful. |
| Responsive/mobile quality | 2 | 3 | +1 | View selectors/nav improve; wide action tables and long pages remain. |
| Accessibility pragmatics | 3 | 4 | +1 | Current-page/selected semantics and keyboard tasks. |
| Showcase → product continuity | 4 | 3 | -1 | Fresh public handoff loses narrative clarity in an ID-heavy library; stricter independent judgment, no asserted regression. |

Every prior Top Finding is classified below. “Fixed” is the scoped old issue, not a claim that the entire screen is perfect.

| Old # / finding | Classification | Current evidence |
|---|---|---|
| 1 Unfinished review lost on evidence detour | FIXED | Two answers, question/overall notes retained desktop/mobile; continuity checks. |
| 2 Completed item remains in My Reviews | FIXED | 5→4 and escalation1→0 without Refresh; completion assertions. |
| 3 Contradictory browser-save footer | FIXED | Active connected editor says Saved in AQM; no contradictory footer in task. |
| 4 One-question editor 6,128px | SUBSTANTIALLY IMPROVED | Compact summary and focused expanded question; mobile still ~3,155px including library/editor. Different fixtures limit numeric comparison. |
| 5 Analytics architecture/IDs lead | SUBSTANTIALLY IMPROVED | Cohort/quality/What stands out lead; technical scope closed. Other investigative filters still technical. |
| 6 Blocked update validator recovery | SUBSTANTIALLY IMPROVED | Removed label/dependent question and repair explained; successful manual repair, no direct link. |
| 7 Evidence returns to queue | FIXED | Returns selected evaluation/review with draft intact. |
| 8 Answer type/key/source/family burden | FIXED | Human formats, percent credits, mappings behind Advanced in ordinary creation. |
| 9 Version diff keys/long paragraph | FIXED | Aligned labelled current/new options, changed credit and resulting order. |
| 10 New form retains unrelated starter | FIXED | Starts empty; copied group gives exactly three questions. |
| 11 Eleven role-neutral destinations | FIXED | Role primary tasks, secondary groups, contextual Conversation review. |
| 12 Inconsistent coverage units | FIXED | Common stages/rates/denominators, run observations and failed attempts separate. F9 is residual framing. |
| 13 Quality/workload after infrastructure | SUBSTANTIALLY IMPROVED | Quality now precedes health; workload still follows long coverage section. |
| 14 Mobile hidden right-hand tabs | FIXED | Native View selects tested in Analytics/Calibration. |
| 15 Current navigation visual-only | FIXED | aria-current breadcrumb/nav and selected view semantics. |

**11 FIXED, 4 SUBSTANTIALLY IMPROVED; no prior Top Finding classified unchanged or regressed.** This does not erase newly emphasized F1/F2 or turn the scoped A–D work into a perfect whole-product verdict.

## 32. V0.19A–D effectiveness

| Intervention | Human-problem classification | Observed basis / remaining boundary |
|---|---|---|
| V0.19A — Reviewer continuity | SOLVED | Evidence detours retain independent work, return selected detail, complete/reconcile workload and preserve AI. Excessive task density is a separate remaining problem. |
| V0.19B — Authoring simplification | MOSTLY SOLVED | Empty forms, compact questions, Advanced mapping and readable version comparison reduce implementation burden. Compatibility discovery/mobile stacked pages remain. |
| V0.19C — Quality actionability | MOSTLY SOLVED | Named lowest-question/queue with counts opens exact evidence; coverage units/rates teach scope. Workload/health first-scan placement and loss heading remain. |
| V0.19D — Navigation/mobile/accessibility | MOSTLY SOLVED | Role tasks, contextual evidence, View selectors, reachable short-desktop utilities and current-page semantics. Offscreen reviewer action and browser history remain. |

These are observed human interventions, not copied acceptance scores.

## 33. Recommended next step

**One tranche only: Reviewer task focus.** Scope to (1) mobile queue cards or a visible frozen/repeated Start/Continue action, and (2) an active review surface that leads with evidence, answers, notes and Save/Complete, disclosing comparison/history instead of stacking them first. In the same evidence detour, put the transcript before routing/evaluation controls on mobile. Preserve existing review continuity, conflicts, exact evaluation identity and AI immutability. Recheck desktop/mobile and keyboard task burden. Do not bundle unrelated Analytics, Settings, policy or authoring cleanup into this release decision.

## 34. Limitations

This is automated agent task replay and an independent editorial assessment, not recruited-human usability research. No independent human tester was available. “Blind” means no prior conclusions or product-source rescue before observation; it does not imply an inexperienced human or statistically representative cohort. Chromium emulation is not a physical-device study. Keyboard/accessibility pragmatics are not WCAG certification or a screen-reader audit. Fictional APIs validate contracts, states and safe tasks, not production load or service reliability. No live Genesys retrieval, Jev evaluation, notification delivery, production evaluation/review, configuration write, deployment, tag, merge or PR occurred. The backend revision check was read-only metadata.

The review has representative screenshots rather than a full visual census at every viewport/state combination. 1920×1080 was representative, not every-page coverage. A disconnected direct Conversation review guard was observed; the authenticated contextual paths were exercised more fully. A few immediate snapshots required settled replay; selector, native-select and dirty-dialog harness failures are retained/classified instead of labelled product defects. Historical and fresh fixture page heights are not controlled human-effort comparisons. Rankings are descriptive; no causality/significance or real-world AI accuracy claim is made.

### Validation and safety record

The production build passed TypeScript/Vite validation; all 12 deployed files matched its bytes. The production backend ready revision is `aqm-api-v019-e92f2d6`, serving 100% of traffic (read-only service metadata). Viewports: 1440×900, representative 1920×1080, 390×844 whole-product pass, 1440×720 role/content checks; representative 1440→390→1440 state retention.

| Category | Result | Evidence / interpretation |
|---|---|---|
| Deterministic tests | 65 files, 621 passed, 0 failed | [Log](v019-final-whole-product-review-evidence/deterministic-tests.log). Includes ranking, versioning, scoring/API/domain boundaries; no overlap added. |
| Existing browser regressions, production build | 225 passed, 63 failed, 2 deliberately skipped, 290 cases | [Raw JSON](v019-final-whole-product-review-evidence/existing-regressions.json), [log](v019-final-whole-product-review-evidence/existing-regressions.log), [each failure classified](v019-final-whole-product-review-evidence/existing-failure-classification.md): 62 STALE BASELINE EXPECTATION, 1 HARNESS DEFECT. No expectations edited. |
| Vite-dependent historical rerun | 1 passed, 1 failed (same two cases already counted above) | [JSON](v019-final-whole-product-review-evidence/legacy-module-rerun.json). Component-import test passes with its required source modules; artificial pre-mounted memory-session bootstrap still expects the old entry behavior (STALE BASELINE EXPECTATION). Ordinary fictional OAuth and Open AQM paths worked. |
| Fresh review-specific Playwright | Initial 8 passed / 3 HARNESS DEFECT failures; corrected affected rerun 3/3; 11 unique final checks passed | [Initial](v019-final-whole-product-review-evidence/fresh-checks-initial.json), [affected rerun](v019-final-whole-product-review-evidence/fresh-checks-corrected.json). Ambiguous table selectors only corrected in the new harness. F5/F7 are passing defect characterizations, not UX approvals. |
| Public deployment checks | Actual Welcome/demo, calculator/next-only/handoff/responsive; 12/12 asset matches; 4:31.998 paced pitch | [Public evidence](v019-final-whole-product-review-evidence/public/paced-public.json). Welcome/demo: zero AQM API, Genesys, Jev or notification calls, zero persistent writes. Handoff's seven normal workspace bootstrap writes are separate. |
| Authenticated fixture checks | Four roles plus coverage/failure/keyboard contexts; 12 manual contexts, zero unknown external attempts/page errors | [Final boundary](v019-final-whole-product-review-evidence/authenticated-final-boundary.json). Production frontend + actual local API contracts; provider-shaped routes fulfilled fictionally; unknown traffic aborted and server live providers throw. Existing/fresh suites also deny external DNS. |
| Keyboard/accessibility checks | Four complete persona tasks + three native-select/subnav probes | [Record](v019-final-whole-product-review-evidence/keyboard-observations.json), [semantics](v019-final-whole-product-review-evidence/semantics.json). Pragmatic inspection, not certification; manual sequences are not an additional test-suite total. |

[Validation summary](v019-final-whole-product-review-evidence/validation-summary.json) preserves category counts. No grand total combines overlapping suites, reruns, screenshots or manual tasks. Failed historical tests stop before later assertions; the fresh coverage does not restore every downstream legacy assertion. The two skipped old baseline captures have no assertion coverage. [Harness diagnostic attempts](v019-final-whole-product-review-evidence/harness-diagnostics.json) retain the manual snapshot/selector/select/dialog limitations. Product defects are the locked F1–F10; raw regression failures are independently classified rather than assumed to be those defects.

No actual notification delivery occurred. Some existing regression cases exercise mocked notification buttons/rules, fulfilling them locally; those fictional actions are not production sends. No AQM production evaluations/reviews or configuration writes occurred.

### Git delivery

Review/evidence/harness files only, dedicated branch pushed; final SHA is provided in the delivery response. The lock commit precedes comparison. No PR, merge or release tag was created. Original checkout retained its pre-existing branch/state. [Evidence index](v019-final-whole-product-review-evidence/README.md) includes raw results, representative screenshots, reproduction and provenance.
