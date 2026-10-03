# V0.19 whole-product review

## 1. Executive summary

**Pitch readiness: B — READY WITH MINOR POLISH. Product usability: C — SUBSTANTIAL UX PASS STILL NEEDED. Answer Sets: FOCUSED UX PASS.**

The public link communicates a credible proposition: Jev makes focused, structured judgments economical; AQM supplies agreed scoring, inspectable evidence, independent human review and operational ownership. The five-chapter story works through the obvious forward action. The working product has strong underlying safeguards and useful investigation links, but basic authoring exposes too much machinery, reviewer continuity has two reproducible defects, and analytics speaks more readily to an implementer than a quality leader. Feature count earns no credit here.

Review date: 3 October 2026. Canonical source: `4416ee416259c3c756374b14e26521d0b902b80b`, fetched and verified against `origin/main`. Review branch: `codex/aqm-v019-whole-product-review`. No product source changed. Eight deployed static files, including the HTML, main application, Welcome, demo, stylesheet and logo, are byte-identical to the unchanged local production build; see [asset proof](v019-whole-product-review-evidence/public-assets-proof.json).

Mode A used the actual [public site](https://simonridd.github.io/Genesys-aqm/) without mocking its core pages. The first clean-context forward journey preceded source inspection. Mode B used the production frontend, intercepted fictional OAuth/provider responses, and the application's actual HTTP API backed by a local in-memory store. External DNS was blocked for fixture browser runs. No live Genesys, Jev, production domain writes or notification deliveries occurred. ADMIN, AUTHOR, REVIEWER and VIEWER were covered; pitch visitor and quality leader were task perspectives.

The highest-value next work is **reviewer continuity and completion safety**, because opening evidence currently loses unfinished answers/notes without warning, and completing a review leaves it in My Reviews until manual Refresh. Neither problem is resolved by passing the existing browser suite.

Evidence is indexed in the [evidence README](v019-whole-product-review-evidence/README.md). Screenshots show fictional data. Test successes below mean the checks executed; a passing characterization of a defect is not a claim that the defect is fixed.

## 2. Pitch verdict

**B — READY WITH MINOR POLISH.** Send the URL to an internal colleague for a proposition discussion. It is sufficiently self-guided to support an initial conversation, with three explanatory gaps: scoring arithmetic in chapter 2, the difference between model confidence and empirical agreement, and the operating work excluded from the model bill. None requires a slide deck to understand the overall proposition. Do not position it as a finished pilot operating experience.

Welcome independently scores **4/5**. Evidence: [desktop](v019-whole-product-review-evidence/public-welcome-1440.png), [wide desktop](v019-whole-product-review-evidence/public-welcome-1920.png), [mobile](v019-whole-product-review-evidence/public-welcome-390.png), [rendered text](v019-whole-product-review-evidence/public-welcome-1440.txt).

| Observation window | What the visitor can understand | What prevents a 5 / improvement |
|---|---|---|
| First 5 seconds | AQM is quality management for Genesys Cloud; “More conversations understood. Less manual scoring.” gives the benefit. Jev judges; AQM scores and lets people challenge. | Brand/product acronym still depends on the nearby expanded name. Keep that expansion with every first entry. |
| First 30 seconds | The paired prepared AI/human judgments establish human control. Guided demo is the obvious primary action, with fictional-data status beside it. | “Clear next step” versus “Timeline not agreed” needs the conversation to be meaningful. Keep this preview short and lead into that case. |
| Full page | Broader controlled coverage, batching, scoring rules, model economics, limitations and a narrow pilot are explicit. | Repeated status/boundary text and several secondary entrances compete. Preserve one clear boundary near the primary action and one detailed evidence disclosure. |
| Mobile first screen | Identity and promise remain legible, with ordinary vertical progression and reachable actions. | The large headline takes more of the first screen; supporting example and economics need scrolling. Reduce vertical padding before adding anything. |

Jev is explained through predefined answer formats and related questions in one request. Conditional requests are introduced only when needed. AQM adds weights, critical criteria, pinned published forms, transparent scoring and immutable AI/human comparison. The story does not require knowing Noul or a provider schema. The explanation is neither magical nor excessively technical; the small model bill is appropriately framed as one component. Batching/waves are conveyed as grouping related questions and requesting conditional questions when applicable, rather than infrastructure terminology.

**Calculator:** monthly framing, selected percentage, average forms, requests/form, tokens and dynamic workload summary all work. Arithmetic is `monthly conversations × selected fraction × forms × requests × tokens ÷ 1,000,000 × $0.042`. Repeated transcript input across requests is counted again. Fractional planning equivalents are disclosed. Current price and output-free wording were checked against the [official models documentation](https://docs.typesafe.ai/models); this is model input cost, not total cost of ownership. Confidence is correctly distinguished from measured correctness, consistent with the [official confidence documentation](https://docs.typesafe.ai/confidence).

| Scenario | Expected and observed monthly result |
|---|---|
| 100,000 conversations, 50%, 1 form, 1 request, 8,000 tokens | 50,000 requests, 400M input tokens, **$16.80** |
| 100,000, 100%, 2 forms, 2 requests, 8,000 tokens | 400,000 requests, 3.2B input tokens, **$134.40** |
| 100,000 conversations, 100%, 1 form, 1 request, 64,000 tokens | **$268.80** |
| 3 conversations, 50%, 1 × 1 × 8,000 | **Less than $0.01/month**, rather than misleading rounded zero |
| Zero conversations | **$0.00/month** |
| Negative volume, selection 101%, blank required field | **Check inputs**; invalid estimate withheld |

These eight cases were repeated at all three viewports: [24 calculator observations](v019-whole-product-review-evidence/public-review.json). Exclusions explicitly include transcription, Genesys licensing/retrieval, hosting, storage, network, retries, taxes and human review. The nontechnical visitor can change volume and percentage immediately; explaining requests/form still benefits from the conditional-question example.

## 3. Product-usability verdict

**C — SUBSTANTIAL UX PASS STILL NEEDED.** This is a capable prototype with several coherent paths, rather than an incoherent collection throughout. The exact-cohort investigations, role enforcement, independent review record and versioned reusable definitions support a real quality-management model. However, users pay a high reading/scrolling cost for ordinary work, must interpret unnecessary internal terms, and cannot safely assume that switching from review to evidence preserves their work.

A supervised evaluation of the product is reasonable. Fix the reviewer loss and stale completion state before expecting reviewers to operate independently in an internal pilot. Also correct contradictory persistence copy before training authors. There is no observed P0; fictional tests cannot establish production readiness, population accuracy or operational capacity.

## 4. Scorecard

Scale: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. Scores are independent judgments of this build. Links refer to observed surfaces, not feature existence.

| Category | /5 | Evidence | What works | What prevents 5 | Specific improvement |
|---|---:|---|---|---|---|
| Human effectiveness | 3 | [Review detail](v019-whole-product-review-evidence/reviewer-detail-1440.png), [Overview](v019-whole-product-review-evidence/connected-overview-1440.png) | Evidence can lead to owned review or investigation. | Context switching loses unfinished judgment; several pages explain mechanics before decisions. | Preserve review state through evidence and put the next decision beside each signal. |
| Value proposition | 4 | [Welcome](v019-whole-product-review-evidence/public-welcome-1440.png) | Economic coverage plus inspectable human challenge is distinctive. | Pilot effort and operating costs still need discussion. | Pair the model estimate with a compact pilot effort checklist. |
| Information quality | 3 | [Coverage](v019-whole-product-review-evidence/mobile-tab-activated-analytics.png), [comparison](v019-whole-product-review-evidence/answer-set-comparison-1440.png) | Exact versions, denominators and original results are retained. | Raw keys, varied funnel names and technical prefaces obscure interpretation. | Use human names and consistent denominator explanations; disclose identifiers on demand. |
| Ease of use | 3 | [Task actions](v019-whole-product-review-evidence/task-actions.json) | Ordinary controls, table/card alternatives and actionable rows. | Extra return/refresh actions and long editors interrupt simple tasks. | Keep task context and collapse advanced authoring controls. |
| Visual quality | 4 | [Human challenge](v019-whole-product-review-evidence/public-chapter-4-1440.png) | IPI slate/green/plum palette, spacing and warning hierarchy are consistent. | Editors and broad tables lose the strong showcase hierarchy. | Apply the comparison screen's limited visual priorities to editors and analytics. |
| Trust / credibility | 3 | [Blocked update](v019-whole-product-review-evidence/regression-blocked-update-1440.png), [draft loss](v019-whole-product-review-evidence/reviewer-draft-navigation.json) | Honest fictional boundaries, immutable AI and fail-closed changes. | Lost drafts and contradictory save wording weaken practical trust. | Protect human drafts and state precisely where the current edit is saved. |
| User-facing cleanliness | 2 | [Analytics text](v019-whole-product-review-evidence/connected-analytics-1440.txt) | Some expert details are correctly confined to audit/development. | Cloud Run, endpoint, durable, raw enums, keys and family terminology enter ordinary work. | Rewrite ordinary copy around quality outcomes and move provenance into disclosure. |
| Navigation / IA | 3 | [Reviewer shell](v019-whole-product-review-evidence/reviewer-queue-390.png) | Monitor / Quality / Configuration / Interactions grouping is useful. | Eleven destinations persist across roles; conversation list and detail appear as peers. | Give each role a focused starting group; make conversation review contextual. |
| Workflow coherence | 2 | [Draft loss sequence](v019-whole-product-review-evidence/review-unsaved-after-reopen.png) | Analytics → exact evaluations and explicit snapshot reuse are coherent. | Review → original conversation → return breaks detail context and unsaved state. | Keep the same review selected, with draft preservation and a reliable return path. |
| First-time learnability | 3 | [Independent author observations](v019-whole-product-review-evidence/first-author-observations.md) | Goal-only tester found both reusable scales and groups. | Starter scaffolding helped; credit, type and snapshot language need interpretation. | Explain answers/questions/forms in one sentence at the point of reuse. |
| Authoring usability | 2 | [One-question editor](v019-whole-product-review-evidence/form-editor-390.png) | Real reusable answers/groups, draft tests and explicit publishing work. | 6,128px for one-question editing; duplicated option summaries and advanced scoring precede completion. | Provide a focused question editor with advanced scoring/conditions/test tools collapsed. |
| Reviewer usability | 2 | [Completed stale queue](v019-whole-product-review-evidence/reviewer-completed-stale-queue-390.png) | My Reviews defaults correctly and priority is legible. | Unwarned loss, stale completion and long AI/human surfaces. | Preserve draft/context, refresh queue membership on completion, shorten comparison. |
| Operational usefulness | 3 | [Attention Overview](v019-whole-product-review-evidence/connected-overview-1440.png) | Escalations, overdue work and failed runs have working drills. | Quality and workload fall below infrastructure health; not every number explains its consequence. | Place current quality/work next to attention and add explicit interpretation. |
| Responsive/mobile quality | 2 | [Mobile diff](v019-whole-product-review-evidence/answer-set-comparison-390.png) | Controls wrap; tables scroll within regions; evidence leads on conversation review. | Long editor/review pages and offscreen tabs make completion tiring. | Reduce vertical density and make overflow navigation discoverable. |
| Accessibility pragmatics | 3 | [Semantics](v019-whole-product-review-evidence/heading-semantics.json), [probes](v019-whole-product-review-evidence/accessibility-probes.ndjson) | Focus moves/restores; buttons and sort semantics work; no tested keyboard trap. | Primary current-page state is visual only; horizontally overflowing tab groups are unclear. | Add current-page/selected-state semantics and accessible overflow cues. |
| Showcase → product continuity | 4 | [Sample handoff](v019-whole-product-review-evidence/public-sample-handoff-390.png) | Same branding and honest sample experience; connected entry goes to Overview. | Product density and vocabulary are a sharp step up from the guided story. | Carry the plain-language quality/human-control framing into workspace introductions. |

**Unweighted average: 46 / 16 = 2.875, reported as 2.88/5.** The five 2/5 categories remain visible: cleanliness, workflow coherence, authoring, reviewer usability and responsive/mobile quality. The average does not dilute those weaknesses.

## 5. First-time public observations

The [blind record](v019-whole-product-review-evidence/blind-public.json) starts with an empty context and records Welcome plus each obvious Next step before inspecting source. It is an agent first-use observation, not a recruited human study. The route was Welcome → Take the guided demo → four Next actions → Manage & pilot. No secret secondary control supplied an essential concept.

At first exposure, the division of responsibility was understandable: Jev answers focused questions, AQM turns them into transparent scores, and a person can challenge the answer. The story then made “later” the decisive evidence. Chapter 2 required the most reading: weights, applicable questions, critical criteria and conditional follow-up arrived together. Chapter 3's AI result looked overconfident until the deliberate ambiguity was pointed out in visible copy. Chapter 4 then resolved the story clearly: AI 100%, independent human 56%, a 44 percentage-point difference, original AI unchanged. Chapter 5 linked that disagreement to missing timelines, coaching, an accountable lead and a narrow pilot.

| Self-guided explanation still useful | Severity | Why / change |
|---|---|---|
| How the same weights turn the disputed next-step answer into 56% and a critical fail | NOTICEABLE | Show a short arithmetic explanation beside the difference; keep detailed rubric below. |
| Why a 56% AI confidence is not a 56% accuracy estimate | NOTICEABLE | Current caveat is correct; a one-sentence example would help. |
| How conditional questions can add requests and repeated transcript tokens | NOTICEABLE | Advanced calculator exposes assumptions; link the conditional example directly. |
| What integrations, permissions and representative data an actual pilot needs | NOTICEABLE | Pilot outline names measurement/ownership, but the operating setup needs a working session. |
| What “prepared” and fictional counts prove | MINOR | Visible boundaries already say these are illustrative; avoid making the reader reconcile repeated labels. |
| Why Explore prototype opens samples, while Connect/Open AQM opens organizational operations | MINOR | Boundary is explicit, but the workspace's denser vocabulary raises the learning curve. |

**No blocking external explanation was found for the proposition itself.** That does not mean every visitor will absorb the page in five minutes.

## 6. Five-minute pitch

| Chapter | Clarity | Narrative value | Information quality | Interaction burden* | Visual effectiveness | Decision |
|---|---:|---:|---:|---:|---:|---|
| 1 Customer case | 5 | 5 | 4 | 5 | 4 | KEEP |
| 2 Define quality | 3 | 4 | 4 | 3 | 3 | TIGHTEN |
| 3 Evaluate at scale | 4 | 4 | 4 | 4 | 4 | KEEP |
| 4 Human challenge | 5 | 5 | 5 | 5 | 5 | KEEP |
| 5 Manage & pilot | 4 | 5 | 4 | 4 | 4 | TIGHTEN |

*Higher burden score means easier interaction. Evidence: [chapter 1](v019-whole-product-review-evidence/public-chapter-1-1440.png), [2](v019-whole-product-review-evidence/public-chapter-2-1440.png), [3](v019-whole-product-review-evidence/public-chapter-3-1440.png), [4](v019-whole-product-review-evidence/public-chapter-4-1440.png), [5](v019-whole-product-review-evidence/public-chapter-5-1440.png), with 1920 and 390 equivalents in the index.

Chapter 1 earns clarity through a concrete need and transcript, but this is one short synthetic case. Chapter 2's rules are accurate and narratively necessary; its burden is reading and mobile scrolling rather than excessive clicks. Show three essential rules first, disclose the remaining settings. Chapter 3 connects typed judgments to scale without implying unlimited throughput; model efficiency is useful but no performance benchmark is demonstrated. Chapter 4 is the strongest pitch moment because it makes correction tangible while protecting original history. Chapter 5 contains a sensible owned action and pilot sequence; combine overlapping ownership cards to strengthen the decision.

**Next-only verification:** customer evidence, quality criteria, prepared AI result, human disagreement, management implication and pilot next step were encountered in that order at every requested viewport. “Inspect audit”, “Inspect examples” and “More options” are supporting, not required. Pitch → pilot requires **6 primary clicks**: demo entry, four Next actions and Plan a pilot. Reading/scrolling is additional.

**Paced presenter simulation: 272.137 seconds = 4:32.137.** Explicit dwell remains **260 seconds**, matching the prior methodology: Welcome 30; economics 35; customer case 40; define quality 35; AI 45; human challenge 35; management 30; pilot 10. Four scroll positions per chapter were included during dwell. Navigation/render overhead was **12.137 seconds**. Prior comparable result was 271.977 seconds; the 0.160-second difference is browser noise, not a product improvement. [Timing/keyboard/contrast record](v019-whole-product-review-evidence/extra-data.json), [script](v019-whole-product-review-evidence/paced-public.cjs).

It meets the <5:00 simulation target. It does **not** measure human comprehension, speech timing or unaided completion. Explanation still concentrates on chapter 2's scoring, chapter 3's request assumptions, and chapter 5's practical setup.

## 7. Navigation / IA

The shell has eleven destinations: Overview, Evaluations, Analytics, Calibration, Policies, Evaluation Forms, Question Groups, Answer Sets, Settings, Conversations and Conversation review, plus About/product tour. Section labels establish a useful hierarchy. Answer Sets has not made Configuration unworkably crowded, but four related authoring destinations are presented without a compact relational model. All eleven remain visible for AUTHOR, REVIEWER and VIEWER, even when mutation controls are appropriately absent.

| Surface | Human purpose | Does the current introduction make it clear? |
|---|---|---|
| Evaluation Forms | Define the complete quality evaluation and its scoring rules. | Partly; introduction emphasizes version pins and test isolation before the benefit. |
| Question Groups | Reuse a related set of questions in several forms. | Partly; “versioned reusable templates” and “independent snapshots” require interpretation. |
| Answer Sets | Reuse the same answer scale in several questions. | Mostly; “Define common answers once” is good. Raw type labels undermine it. |
| Policies | Choose which interactions get evaluated, with which published forms and how often. | Partly; connected introduction starts with durable/server mechanics. |

A question group does not equal an answer set: the first reuses questions, the second reuses answers. Retain both models, explain them together, and emphasize the in-editor reuse action. Treat Conversation review as the detail of a selected conversation rather than a second collection destination. Focus REVIEWER on My Reviews and evidence; put AUTHOR's configuration first; give VIEWER deliberate reading paths. Keep expert access available rather than removing authorization boundaries.

Primary navigation uses buttons with a visible active treatment, but lacks `aria-current`; Settings subsections correctly use `aria-current="location"`. [Heading/current-state evidence](v019-whole-product-review-evidence/heading-semantics.json).

## 8. Overview

The non-empty fictional organization has real API-derived evaluations, two exact form versions, named agents/queues, review assignments, completed/in-progress work, sampled runs and failures. Healthy and empty fixtures were separate: [attention](v019-whole-product-review-evidence/connected-overview-1440.png), [healthy](v019-whole-product-review-evidence/overview-healthy.png), [empty](v019-whole-product-review-evidence/overview-empty.png). It is not merely the public showcase state.

Within 30 seconds, the attention state communicates escalated/overdue work and failed automation clearly. The first screen answers “what needs attention?” better than “how good is current quality?” Operational health precedes quality and coverage, then review workload. Mobile magnifies that ordering. The healthy state avoids an alarming empty attention panel; the empty state provides configuration/evaluation steps rather than inventing quality.

| Major number / signal | “So what?” and exact action | Assessment |
|---|---|---|
| Escalated / overdue review | Open the corresponding review cohort/detail. | Strong urgency and actionable path. |
| Scheduled run failed / scheduler warning | Open run or alert evidence. | Useful; failure and stale activity have different meanings. |
| Evaluations / average quality / critical failures | Drill into the selected range/cohort. | Exactness works; average needs an interpretation and adequate sample warning. |
| Pass rate | Read with the same period and form definitions. | Useful summary; a number alone does not identify what to coach. |
| Eligible, sampled, content available, evaluated, failed | Explore coverage. | Explicit denominators help; failed assignments are not a simple funnel remainder. |
| Open, due soon, overdue, escalated, unassigned | Open exact corresponding review work. | One of the strongest operational patterns. |
| Automation completion and next due | Open policy/run history, check schedule. | Useful operating status, too much priority over current quality when everything is healthy. |

V0.18B exact-count, exact-cohort, range and review links pass in the existing investigation suite at all three sizes. Do not infer a metric mismatch from the fixture's all-time Analytics total versus Overview's seven-day range. A “limited history” warning is present. Improvement: make current quality, coverage and work the first shared summary, with infrastructure health as a compact exception indicator.

## 9. Evaluations / Review

REVIEWER with no explicit cohort opens **My Reviews**, with five assigned active items, meaningful escalation priority and no initial filter work. The highest-priority escalated item is identifiable. ADMIN can switch to All Evaluations; team workload and bulk assignment are secondary disclosures. Exact form/version, cohort chips and return to Analytics work, but the 17-column exploration table and filter block remain cognitively heavy. Conversation GUIDs dominate the table more than human interaction context.

Measured representative task included inspecting original conversation evidence, then completing three independent answers plus a note:

| Viewport | Clicks | Inputs/selects | Total actions | Sampled automatic scroll movement | Unnecessary actions |
|---|---:|---:|---:|---:|---:|
| 1440×900 | 8 | 4 | 12 | 7,299px | Reopen selected evaluation after evidence; Refresh completed queue |
| 1920×1080 | 8 | 4 | 12 | 6,986px | Same two |
| 390×844 | 8 | 4 | 12 | 11,771px | Same two |

[Task records](v019-whole-product-review-evidence/task-actions.json). Scroll is the sum of absolute `scrollY` changes immediately around scripted actions; Playwright auto-scroll and focus movement are included. It omits movement between those samples and is not measured human scrolling. No action quota is used to score usability.

**PRODUCT BUG, P1: unfinished human answers and note disappear without warning.** Start independent review, select No for Warm opening and enter a note; Open conversation; Back to evaluations; reopen the same record. No confirmation dialog appears; note and human answer reset. [Before](v019-whole-product-review-evidence/review-unsaved-before-evidence.png), [after reopen](v019-whole-product-review-evidence/review-unsaved-after-reopen.png), [asserted observation](v019-whole-product-review-evidence/reviewer-draft-navigation.json). The review characterization deliberately asserts this loss so the review remains reproducible; its pass is evidence of a defect. This differs from the well-tested author draft protection.

**PRODUCT BUG, P1: completion leaves stale queue membership.** Complete the escalated review, close detail: the completed row remains in My Reviews until Refresh. The human completion is saved and workload updates; list membership does not update with it. Reproduced at all three sizes. [Mobile stale queue](v019-whole-product-review-evidence/reviewer-completed-stale-queue-390.png), [desktop](v019-whole-product-review-evidence/reviewer-completed-stale-queue-1440.png). This is frontend list-state continuity, not evidence of lost saved review data.

The AI/human distinction itself is strong: separate inputs, separate human score, comparison filters, question/group disagreements, notes and provenance. The review test also verifies the stored original evaluation array remains byte-for-byte unchanged after human completion. Confidence caveats avoid treating confidence as accuracy. Completion, assignee and deadlines are visible. Terminology such as NOT_REVIEWED, REVIEW_REQUESTED and source/provider provenance should be translated on routine surfaces. Human judgment remains independent; the bad part is preserving its unfinished state while inspecting evidence.

## 10. Analytics / Coverage / Calibration

Analytics can answer a quality leader's investigation, but its opening sentence is “Aggregated in Cloud Run from durable production evaluations. The endpoint returns complete totals or an explicit size error.” This explains architecture before purpose. Policy ID and Form ID @ version are ordinary filter inputs. A quality leader should begin with names and a question such as “Which criteria are weakest in this queue?”

The measured UI route is Analytics → Queues → Customer care → Forms → General Customer Service v17 → sort Average score ascending → supporting evaluations for Understanding the issue: **7 clicks**, no manually typed IDs or avoidable detours. Exact form `general_service@17`, question, queue and analytics cohort persist into evaluations. The fixture identifies Understanding the issue as the weakest question; the supporting rows remain in the chosen queue. [Affected queue](v019-whole-product-review-evidence/analytics-affected-queue.png), [weak question](v019-whole-product-review-evidence/analytics-worst-question.png), [supporting records](v019-whole-product-review-evidence/analytics-supporting-evaluations.png). This demonstrates a learnable route; it does not prove the starting page makes that route obvious.

Visual priority still favors many equal cards and a filter bar over an actionable conclusion. Labels in grouping rows sometimes expose `form_id@version` instead of a name. Tables are sortable and drillable; experts can investigate precisely. The next improvement is to surface a ranked weak-criterion list with queue, sample size and evidence action, while retaining advanced cohort controls.

**Coverage:** Overview uses Eligible → Sampled → Content available → Evaluated, with Failed beside them. Analytics uses candidate/eligible/sampled/evaluable/evaluated/successful/failed. Sampling coverage is sampled/eligible; evaluation coverage is evaluated/eligible. Counts describe run observations, so a conversation can appear in multiple runs. Failed evaluation assignments are not necessarily mutually exclusive conversation losses. Existing caveats correctly distinguish run-level denominators from evaluation filters; agent/queue/form/channel filters do not magically recalculate run denominators. The issue is comprehension and consistency, not a demonstrated arithmetic bug. Use the same human labels, denominator and observation unit on both pages; explain failures separately from the conversation funnel.

**Calibration:** the form → question → supporting review path works, with agreement/disagreement, score differences and question/type/confidence breakdowns. Existing tests revalidate exact evaluation navigation. It answers where judgments differ; a small reviewed sample cannot establish overall model correctness. Always retain reviewed N and form/version beside agreement measures. Confidence vs disagreement is useful expert context but should follow “Which questions disagree most?” At 390, breakdown tabs overflow horizontally, including the far-right confidence view; keyboard focus scrolls to them, but the visual affordance is weak.

“So what?”: Analytics identifies coaching opportunities; Coverage reveals what did not reach evaluation; Calibration identifies criteria needing human alignment. Those benefits are present in the model, but only Calibration's introduction consistently starts with the human decision. Rename the Analytics opening and make the coverage unit prominent.

## 11. Forms

A form is a complete evaluation definition. Published versions are read-only; new versions are explicit; policies pin exact published definitions. Draft tests are kept out of production analytics. Existing authoring, form-composition, definition-authority and save-protection checks cover add/edit questions, Yes/No, multiple choice, ordered score, weights, conditions, reusable groups, saving, readiness, testing and publishing against fictional contracts. The review directly exercises reusable answer application, read-only attachment, update, detach, inline edit and save, and the independent tester creates two new forms.

The basic goal is possible but disproportionately dense: library, local starters, form actions, pass/critical settings, overall/group scoring, duplicated question summary/options, question editor, version history and sandbox occupy one page. The one-question editor is 527 visible-main words and 13 visible `.panel` containers: **4,139px at 1440; 6,128px at 390**. These are observations, not arbitrary failure thresholds. [Editor](v019-whole-product-review-evidence/form-editor-1440.png).

An author faces Question ID, keys, 0–1 credit and Yes/No · Noul / Multiple choice · Choice / Ordered rubric · Score before finishing a basic question. Some identifiers are necessary for durable conditions but should be generated and disclosed in advanced settings. “Ordered score” in libraries versus “Ordered rubric” in question type adds avoidable inconsistency. Explain credit as contribution to the agreed score, preferably percent plus an excluded/not-applicable option. Keep weight and criticalness visible when relevant; collapse group scoring and test execution detail until requested.

**Misleading copy:** the connected form detail says Saved to server while the question footer says “Changes save locally in this browser.” The shared editor also appears in Question Groups. This is not merely an expert term: it misstates the user's persistence model. Explain the current unsaved edit and explicit Save changes action according to the active mode. Do not suggest automatic durable saving.

Publish/readiness controls are available, but several peer actions compete with Save. Separate author completion (Save / review readiness / Publish) from testing/export/duplication. New forms begin with a starter group/question; adding a reusable group retains that unrelated starter, requiring deletion and confirmation. Offer an empty start or replacement choice when the first meaningful action is reuse.

## 12. Question Groups

The three-question Resolution & Next Steps group communicates its contents and gives a practical reusable unit. “Forms retain independent snapshots” is technically accurate but less direct than “Adding this group copies its questions; later library changes do not change your form.” Existing composition/version tests verify new group versions do not silently alter forms. The independent goal-only tester correctly found Groups for reusing three questions and did not confuse it with Answer Sets.

The friction is completing the route: group detail has no “Use in a form” action, so the tester returned to Forms, created a form, reopened the reusable-group picker, added the group and deleted the default starter. **12 actions**, including the removal confirmation. [Group detail](v019-whole-product-review-evidence/first-author-09-group-details.png), [extra starter](v019-whole-product-review-evidence/first-author-11-group-added.png).

The review also creates/publishes a fictional group whose question uses Resolution clarity v1, then copies it into a form and saves. [Group with Answer Set](v019-whole-product-review-evidence/group-with-answer-set.png), [composed form](v019-whole-product-review-evidence/form-group-answer-set-composition.png). The model is sound: reusable answers inside reusable questions inside a full form. UI should state that relationship once, give a direct destination action, and disclose source/version provenance rather than making it headline content.

## 13. Answer Sets

**Verdict: FOCUSED UX PASS. Retain the model.** Reuse and version safety are valuable; the feature's language and surrounding author workflow make it feel more technical than its purpose requires.

| Dimension | /5 | Evidence | What works | Prevents 5 / specific improvement |
|---|---:|---|---|---|
| Concept clarity | 3 | [Library](v019-whole-product-review-evidence/connected-answer-sets-1440.png) | “Define common answers once” states purpose. | Explain answers → questions → forms with one concrete example; rename raw choice/score display. |
| Discoverability | 3 | [Goal-only picker](v019-whole-product-review-evidence/first-author-06-answer-picker.png) | In-question Use reusable answer set is found without a route hint. | Existing expanded form helped; make available scales visible at type selection. |
| Creation UX | 3 | [Draft](v019-whole-product-review-evidence/answer-set-draft-1440.png) | Name, description, stable type and editable options are organized. | Key, credit and source value lead the author into model details; generate keys and disclose expert fields. |
| Reuse UX | 4 | [Attachment](v019-whole-product-review-evidence/answer-set-attached-1440.png) | Compatible published picker, copied options and explicit Detach protect the copy. | “Attached snapshot” still needs reading; say “Copied from Resolution clarity v1 — changes here are independent.” |
| Versioning UX | 3 | [Diff](v019-whole-product-review-evidence/answer-set-comparison-1440.png) | No silent update; named newer version and category comparison precede Apply. | Keys and long ordered sentence hinder prediction; show old/new rows with labels and percentages. |
| Safety/error clarity | 2 | [Blocked update](v019-whole-product-review-evidence/regression-blocked-update-1440.png) | Invalid conditional replacement is blocked; save conflicts preserve inputs. | Duplicate validator jargon does not tell the author how to repair the named condition; link directly to it. |
| Forms integration | 3 | [Form picker](v019-whole-product-review-evidence/answer-set-picker-390.png) | Attach, update, detach, inline edit and save function. | Full editor surrounds a small reuse task; offer a focused answers area and plain provenance. |
| Groups integration | 3 | [Composition](v019-whole-product-review-evidence/group-with-answer-set.png) | Copied question retains reusable-answer provenance inside a group/form. | Multiple snapshot/source layers need interpretation; show the three-layer human model and independent-copy consequence. |
| Mobile | 2 | [Diff at 390](v019-whole-product-review-evidence/answer-set-comparison-390.png) | Buttons/options wrap and stay reachable. | 6,801px surrounding comparison; condense old/new scale into a dedicated panel. |
| Terminology cleanliness | 2 | [Save as](v019-whole-product-review-evidence/answer-set-save-as-1440.txt) | Published version and explicit copy boundaries are useful. | DRAFT family, Choice/Score, source value and raw keys are normal-workflow language; replace or disclose. |

**Mini-score average: 28/10 = 2.8/5.** These are UX scores, not a technical correctness assessment.

Creation uses name, description, Choice/Ordered score, ordered option rows, labels/descriptions, credit, keys and—in ordered scales—Source value. New draft, save, publish, retirement and immutable published details are covered by the passing existing Answer Set suite. Read-only score detail and edit-as-new-version are captured in this review. Source value is spaced human text, not literal `sourceValue`, but its explanation (“level order determines the score answer index”) still describes representation rather than author intent. An author should not need Jev internals to define a four-level scale.

Use in a form is comparatively strong. Picker lists only compatible published scales, includes version and option count, and moves focus into the named dialog. Selecting v1 copies options and disables direct editing. Explicit Detach enables independent inline changes. Older published forms do not change when library v2 is created. “Used by forms” counts saved form references for that version; it is not a count of evaluated conversations or a live binding. State that near the column.

The review's v2 changes label Clear → Completely clear, credit 1 → 0.9, reverses ordering and adds Not applicable. Existing browser checks additionally cover removed options and blocked updates. The diff identifies added/removed/label-credit-source-order changes, then requires explicit Apply. Technically an author can predict the categories; visually the old/new answer scale is still a paragraph of keys. Use aligned labeled rows, show 100% → 90%, flag condition implications beside the removed label, and keep provider details optional.

The blocked v3 evidence names **Question Follow-up**, so it is not wholly anonymous. It repeats: “choose Yes/No for Noul or valid Choice option keys; Score requires a credit threshold.” That does not explain that removing Partly clear breaks Follow-up's condition, nor lead to the condition to repair it. Suggested message: **“Cannot replace these answers: Follow-up depends on ‘Partly clear’, which v3 removes. Change that condition or keep v1.”** Add an Open condition action. Existing fail-closed tests confirm the original answer snapshot stays intact.

Save as reusable is discovered next to Use reusable. The dialog calls itself “Save current answers as a new family” and says “A new DRAFT family will be saved. Publish it separately from Answer Sets.” Replace with “Save as a reusable answer set” / “Saved as a draft. Publish it in Answer Sets before other questions can use it.” State whether the current question is attached or remains inline after saving; do not make the user infer the next step from family mechanics.

Evidence includes library, connected empty state, draft, published, ordered-score detail, picker, attached/detached question, comparison, blocked update and Save as at the requested sizes. [Connected empty](v019-whole-product-review-evidence/answer-sets-empty-connected.png) does not substitute local starters for a failed shared library. Version update's primary application sequence is **6 clicks** from the workspace: Forms → open attached form → Edit → newer version → Apply → Save. No publication or detach is required for that task. This count is derived from the observed UI controls and passing Answer Set flow; the main review capture additionally detaches/customizes as a separate task.

## 14. Policies

Policies choose interactions, exact published forms, a sample and optional automation. [Connected policy](v019-whole-product-review-evidence/policy-detail-1440.png), [mobile](v019-whole-product-review-evidence/policy-detail-390.png). Name and form version are visible, criteria read as ALL within each OR group, percentage explains 0 and 100, and readiness distinguishes policy/form/sampling state. Existing authoring tests create/update/publish where appropriate and verify schedules/pins against fictional contracts.

Policy and schedule save separately. This is honest but creates two completion moments inside one detail page. State both pending/saved statuses beside their actions; avoid treating one Save as completion of the whole setup. Exact version pins are essential and should remain. Generated IDs and “durable server” do not need to dominate the heading. “Run a policy now” has a useful operating purpose; schedule timezone and previous-day/previous-week semantics are necessary expert information.

AUTHOR can configure; REVIEWER/VIEWER can inspect readable values without mutating. A failed saved-policy load keeps the authority boundary closed rather than presenting local drafts as production policies. Simplify ordinary language to “Saved policies” and “Evaluate selected interactions using these forms.”

## 15. Settings / Governance

Connection-first entry works, as do subsection URLs, focus on the subsection heading, one accessible H1 and dirty-setting protection. Sections covered: Connection, Access, Reviews, Privacy & retention, Notifications, Audit, with Advanced / Development separated. ADMIN sees all six; AUTHOR can configure notifications but not Audit; REVIEWER/VIEWER have read-only operational settings and no Notifications/Audit subsection. Hidden unauthorized destinations were recorded, not mistaken for empty editors. Existing first-use/settings and usability suites verify these role boundaries and deep links.

The connected header explains Genesys sign-in, temporary token and lack of stored client secret. OAuth client ID/redirect URI are legitimate setup fields, not ordinary quality-workflow vocabulary. Access explains roles; Reviews explains deadlines/escalation; retention exposes finite periods; notification destinations/configuration and Audit support accountable operation. These benefits are reasonably understandable, though storage/runtime terminology still intrudes in advanced descriptions and global “Jev managed securely by automation service” copy.

Admin review-SLA task: Settings → Reviews → change Due soon hours to 12 → Save all settings: **3 clicks + 1 input**, with no detour. A fictional 503 retains `12` and unsaved state; retry succeeds with one additional click. [Failure preserved input](v019-whole-product-review-evidence/failure-settings-save.png), [saved](v019-whole-product-review-evidence/settings-reviews-saved.png). No notifications were sent; no live connection was verified. The right mental model is organization configuration plus clear separate sign-in, not “understand the server to manage quality.”

## 16. Conversations

Disconnected Explore prototype opens the synthetic collection with fictional scenarios, Table default, Cards alternative, filters and selectable interactions. It is useful sample exploration with no OAuth/provider traffic. The [connected handoff check](v019-whole-product-review-evidence/connected-handoff.json) verifies About / product tour → Open AQM → Overview; connected Conversations says Real organizational data / Completed interactions and loads transcripts on demand. Fixture-provider labels demonstrate frontend boundary language, not a connection to real organizational records.

Conversation review gives customer/agent labels, ordered transcript, selected interaction context, policy matches, applicable published forms and manual selection. Desktop keeps evidence beside configuration; mobile places evidence before selection and evaluation actions. The transcript has a contained scroll region, preventing a long transcript from burying all actions. [Connected review](v019-whole-product-review-evidence/connected-conversation-review-1440.png), [390](v019-whole-product-review-evidence/connected-conversation-review-390.png), [original evidence opened from review](v019-whole-product-review-evidence/connected-original-conversation-390.png).

This is the strongest responsive pattern. Keep explicit sample/organizational labels, human participants and evidence-first ordering. Reduce peer navigation duplication: Conversations is the collection; Conversation review should inherit the selected interaction and a reliable return path. Manual evaluation/provider execution was not performed against live services.

## 17. Role findings

| Role | Observed experience | Main issue | Recommendation |
|---|---|---|---|
| ADMIN | Monitoring, All Evaluations, authoring and all settings are available; workload/bulk controls are secondary. | Broad shell and filters can make every task look like administration. | Start at quality/work summary, retain advanced explorer behind intent. |
| AUTHOR | Forms/Groups/Answer Sets/Policies are writable; audit unavailable; notification permission deliberate. | All operational destinations remain peer navigation; save copy is confusing. | Put configuration first and make publishing/reuse the primary sequence. |
| REVIEWER | My Reviews defaults; assigned urgent record and human comparison are reachable; settings readable. | Configuration noise, lost unfinished work, stale completed row. | Focus sidebar on My Reviews/evidence; preserve draft and selected context. |
| VIEWER | Read-only values remain inspectable; mutation actions/empty admin editors are absent. | Unchanged broad navigation looks like the full editing product. | Deliberate reading introduction and contextual links; explain permissions near affected surfaces. |

Readonly inputs are intentionally focusable for inspection/copy rather than disabled. Two older policy tests incorrectly demand disabled inputs; that is a baseline expectation, not authorization leakage. Actual server-role tests and authority checks pass. Role clarity scores reflect the experience, not only correct permission enforcement.

## 18. First-time author test

A separate goal-only agent was given exactly: “Create a quality form that asks whether the resolution was clear, using the reusable four-level Resolution clarity scale.” Then: “Reuse three related questions across another form.” It received no route instructions and did not read source, old review documents or fixture helpers. This is a fictional agent simulation, not a human participant study.

Goal 1 route: Overview → Evaluation Forms → New form → edit starter question → Multiple choice → Use reusable answer set → Resolution clarity v1 (four options rather than v2's five) → Done → Save changes. **11 actions: 5 navigation/open-close, 5 configuration, 1 save.** It discovered the picker inside the question editor rather than opening the library first. No Question Group/Answer Set conceptual wrong turn was observed. The initially expanded fixture form supplied helpful scaffolding, so this is not proof of wholly unsupported learnability.

Goal 2 route: Question Groups → open Resolution & Next Steps v1 → inspect its three questions → Forms → New → Add reusable group → add that group → delete the default General group and its contained question → Save → close/reopen. **12 actions: 8 navigation/open-close, 3 configuration, 1 save.** Backtracking from library to form was required because group detail lacked Use in a form. The starter question was an unnecessary extra, not confusion about reuse semantics.

Exploration began 14:21:31 UTC; first saved form was reached at approximately 14:24:31; final verification was at 14:27:44: approximately **3 minutes for first save, 6m13s total exploration**. That includes automation/inspection and is not human completion time. Successful replay took **1.425s to first save, 2.652s across both tasks**; those speeds are automation artifacts. The final test took 6.6s including setup/cleanup. [Independent observations](v019-whole-product-review-evidence/first-author-observations.md), [replay](v019-whole-product-review-evidence/first-author-checks.txt).

Hesitation terms: snapshot, Detach, asset version, autogenerated ID and scoring names. The agent independently noticed the local-browser footer versus explicit Save. Three locator/expectation mistakes in the exploratory harness were documented and corrected; they are not user wrong turns or product defects.

## 19. Internal-mechanics audit

This audit uses rendered ordinary/advanced UI plus subsequent source confirmation. Absence means not seen in the reviewed surfaces, not a repository-wide absence claim.

| Current visible text | Location | Classification | Why it matters | Suggested replacement / treatment | Priority |
|---|---|---|---|---|---|
| “Aggregated in Cloud Run from durable production evaluations. The endpoint returns complete totals or an explicit size error.” | Analytics intro | INTERNAL LEAKAGE | Architecture precedes the quality decision. | “Find weak quality criteria and inspect the evaluations behind them.” Put completeness/limits beside result status. | P1 |
| “SERVER ANALYTICS” / “Complete scan” | Analytics | INTERNAL LEAKAGE in ordinary intro; USER-RELEVANT completeness | Scan mechanics confuse source authority with the task. | “Quality analytics”; “Results cover all records matching these filters.” Keep limit/error detail. | P2 |
| “Changes save locally in this browser.” | Connected form/group question editor | INTERNAL LEAKAGE / misleading mode copy | Contradicts durable save status and explicit saving. | Contextual unsaved/saved copy tied to the active mode. | P1 |
| “Saved to server”, “Refresh durable policies”, “Durable server policies” | Configuration | INTERNAL LEAKAGE | Destination mechanics crowd routine authoring. | “Saved in AQM”, “Refresh saved policies”, “Choose interactions and published forms.” | P2 |
| “A new DRAFT family will be saved” | Save as reusable answers | INTERNAL LEAKAGE | Family is the version grouping model, not the goal. | “Saved as a draft answer set; publish it before reuse.” | P2 |
| “Base type is stable after the family is saved.” | Answer Set type | INTERNAL LEAKAGE with useful constraint | Author needs immutability, not family internals. | “You cannot change the answer type after the first save.” | P2 |
| `choice`, `score`; “Yes / No · Noul”, “Multiple choice · Choice”, “Ordered rubric · Score” | Answer library/types | INTERNAL LEAKAGE | Machine categories duplicate familiar labels. | Yes/No, Multiple choice, Ordered scale; expert type in advanced details. | P2 |
| “Source value”; “Level order determines the score answer index.” | Ordered option editor | INTERNAL LEAKAGE in basic editing | Does not explain what a quality author should enter. | Generate provider representation; optional Advanced source mapping with an example. | P2 |
| “Reusable snapshot v1 · resolution_next_steps” | Group copied into form | USER-RELEVANT version; INTERNAL LEAKAGE identifier prominence | Copy independence matters; source key does not need equal weight. | “Questions copied from Resolution & Next Steps v1”; ID in provenance. | P2 |
| `general_service@17`, “Form ID @ version”, “Policy ID” | Analytics/evaluation filters | INTERNAL LEAKAGE in ordinary filtering | Requires learning IDs to choose a named configuration. | Named selectors with exact version; advanced ID search retained. | P1 |
| NOT_REVIEWED, REVIEW_REQUESTED, IN_REVIEW, REVIEWED; genesys-cloud | Evaluation table | INTERNAL LEAKAGE | Raw states/source slug make the queue feel unfinished. | Not reviewed, Review requested, In progress, Completed; Genesys Cloud. | P2 |
| GUID conversation / Question ID / option Key | Results / authoring | USER-RELEVANT advanced provenance, INTERNAL LEAKAGE as dominant identity | Useful traceability; poor primary task identity. | Human interaction/question label first, copyable technical ID in details. | P2 |
| “API healthy · Firestore available”; “durable run evidence” | Overview health detail | INTERNAL LEAKAGE outside troubleshooting | Lead wants automation/evidence health, not storage engine. | “Automation service available; last run checked…”; infrastructure detail in diagnostics. | P2 |
| “Jev managed securely by automation service” | Workspace header | USER-RELEVANT boundary, overly technical repetition | Managed credentials are reassuring but repeated on every page. | Compact “Jev connected/managed”; setup explanation in Connection. | P3 |
| “Local drafts & starter examples”; “This browser” | Disconnected/local authority disclosure | USER-RELEVANT | Essential to prevent treating a sample/local copy as organization authority. | Keep boundary, use plain browser-only draft wording once per relevant surface. | P2 |
| “Isolated sandbox” / form tests excluded from quality | Form testing | USER-RELEVANT | Test results must not be confused with operational quality. | “Test form — results do not affect production analytics.” Disclose execution details. | P2 |
| Genesys Cloud, Jev, AI requests, published version, audit, exact form pin | Relevant task/setup/audit | USER-RELEVANT | These convey real controls and scope. | Preserve, explain once in context. | — |
| Provider / schema / source asset identifiers | Advanced provenance/import/debug | USER-RELEVANT there | Useful for diagnosis, not a primary user task. | Keep in advanced disclosure; translate raw import errors. | P2 |

Literal `sourceValue`, localStorage, migration and legacy were not found in normal rendered captures; fixture is not a normal visible product label. Do not invent a leakage finding merely from source variable names. Browser-local records and durable/server mechanics are visible in sample/advanced contexts; classify by context. Raw IDs remain appropriate in Audit/provenance/troubleshooting. Source storage detail need not be globally prohibited.

## 20. Visual/mobile/accessibility

**Three strongest visual screens:** Welcome hero (promise and primary action); chapter 4 Human challenge (two judgments plus visible unchanged AI and difference); Conversation review (evidence/readability beside actions). **Three weakest:** full form editor (layers and duplicate option summaries), Answer Set comparison inside that editor (keys and paragraph order), All Evaluations explorer (dense filters and many table columns). Overview's attention block is strong operationally even though its healthy-page hierarchy is less effective.

IPI identity and slate/green/plum use are consistent. Warning severity is differentiated. Read-only published detail looks recognizably related to drafts. Whitespace is good at card level but too many equal panels accumulate into a long task. Dense tables have legitimate expert value; the default should select the few columns needed for the current persona.

All eleven major workspace destinations were captured at 1440×900, 1920×1080 and 390×844, plus public Welcome and five chapters, My Reviews/detail, form/group/policy detail and Answer Set states. Dynamic 1440→390→1440 was measured for Welcome, Human challenge, sample Conversations, Overview, Answer Sets and Analytics. Document width stayed within the viewport, but that alone is not a usability pass. Primary forward/exit, detail actions and Answer Set controls were also measured with bounding boxes. Tables/analytics tabs intentionally exceed their local container width; they do not create uncontrolled document overflow.

| Supporting cognitive-load measurement | Words in visible main | Visible heading count | Visible panel count | Height 1440 / 390 |
|---|---:|---:|---:|---:|
| Attention Overview | 360 | 12 | 9 | 2,835 / 4,134px |
| One-question form editor | 527 | 8 | 13 | 4,139 / 6,128px |
| Answer Set comparison in form | 639 | 9 | 14 | 4,563 / 6,801px |
| Answer Set draft detail | 184 | 3 | 5 | See metrics / 2,769px |
| Highest-priority review detail before completion | 539 | 12 | 5 | See metrics / 5,167px |
| Analytics initial view | 214 | 3 | 9 | See metrics / 2,607px |

[Screen metrics](v019-whole-product-review-evidence/screen-metrics.json) contain control counts, labels/bounds, headings and viewport measurements. Counts use rendered main text and visible `.panel` elements; closed native disclosure content and different selected states can change them. They are supporting evidence, not cognitive-performance measurements or a threshold-based score.

Mobile evidence is first in Conversation review, library/detail actions wrap rather than clip, and My Reviews shows urgency before detailed results. The main remaining friction is depth: author editor, diff and human review need repeated vertical movement. Analytics tabs at 390 have a 360px region with approximately 824px content; Calibration also overflows locally. Focus can reach hidden-right buttons and scroll them into view, but touch discoverability would benefit from a fade/arrow, wrapped alternatives or a labeled selector. Some secondary buttons are under 44px tall; that is a usability improvement, not a formal standards conclusion from this review.

Keyboard evidence combines the existing passing usability/Answer Set suites with deployed Welcome/demo probes and review-specific picker/tab checks. Welcome, Demo, Forms, Groups, Answer Sets, Policies, Evaluations, Alerts and Audit were exercised through keyboard activation/focus. Detail headings receive focus, Close/Cancel restores the opener, identity actions are buttons rather than click-only containers, table sort exposes `aria-sort`, error/status roles announce relevant changes, and no tested keyboard trap occurred. Sampled public text/button contrast was about 5.36:1 to 12.91:1; reduced motion removes the demo animation. This is not a full contrast inventory.

One **accessible visible H1** was verified on every major workspace page, including Settings. Raw DOM metrics often count two because an inactive Completed interactions surface remains hidden; [semantic inspection](v019-whole-product-review-evidence/heading-semantics.json) shows it has a hidden ancestor and is not a second exposed H1. Do not classify that raw count as a heading defect. Primary navigation lacks current-page semantics; selected analytics tabs use visual classes without an equivalent selected state. The inline Answer Set picker has a named dialog, moves/restores focus and no `aria-modal`; Tab can leave into the underlying editor. Treat it explicitly as nonmodal or implement genuinely modal behavior, including predictable Escape dismissal. A missing trap in a nonmodal inline dialog is not itself a safety defect. No formal WCAG certification, screen-reader study or touch-device test was performed.

## 21. Error/failure UX

All failures were fictional/intercepted over actual frontend/API contracts. HTTP error detail is retained; source/prod state was not mutated.

| Failure | Observed safety and message | Human-effectiveness judgment / improvement |
|---|---|---|
| Saved forms read 503 | Previous saved definitions remain visible; explicit unavailable warning; refresh offered. | Best boundary explanation: preserve it, distinguish retained last-good data from fresh authority. |
| Saved groups read 503 | “Saved reusable question groups unavailable: Temporarily unavailable”; existing rows retained. | What failed is named, but freshness and safe next step need plain explanation. |
| Saved Answer Sets read 503 | Shared library failure is reported; no local starter substitution in compatible picker. | Safe authority behavior; unavailable versus “publish a compatible set” must not become ambiguous recovery advice. |
| Saved policies read 503 | Durable authoring fails closed and refresh is available. | Correct safety; replace durable/server language and state what can still be inspected. |
| Answer Set save 409 | “Changed in another session. Refresh before saving”; draft name/input remain. | Preserve conflict handling, explain how to keep/copy unsaved work before refresh. |
| Removed-option update | Apply disabled and original snapshot preserved. | Named Follow-up but duplicate Noul/Choice/Score validator message; show removed label, dependent condition and repair action. |
| Invalid form import | JSON parser exception surfaced. | Raw syntax exception is not enough. “Could not import this form: invalid JSON. Existing forms are unchanged. Choose a valid exported form.” |
| Settings save 503 | Alert visible; Due soon 12 remains unsaved; retry succeeds. | Good preservation, explicit next action; no false saved state. |
| Evaluation list 503 | “Temporarily unavailable” displayed. | Too little context about retained records/freshness and recovery. State list could not refresh, prior data may be stale, offer Retry. |

[Failure screenshots/text index](v019-whole-product-review-evidence/README.md#failure-evidence). The same failure appearing in a global and local alert can duplicate copy; keep one contextual statement with useful scope. Accuracy of a raw exception does not make it good UX.

## 22. Top 15

Ranked by impact on a person's task, not implementation convenience. No observed P0. “Before pilot” refers to an internal working pilot, not sending the public pitch link. Scope estimates are qualitative.

| Rank | Finding / evidence | Persona and impact | Recommended fix / likely scope | Priority | Before pilot? |
|---:|---|---|---|---|---|
| 1 | [Unfinished review lost on evidence detour](v019-whole-product-review-evidence/reviewer-draft-navigation.json) | REVIEWER: independent answers/note vanish without warning. | Preserve draft across route/detail; guard destructive exits. Frontend review/navigation state + focused regressions, medium. | P1 | Yes |
| 2 | [Completed item remains in My Reviews](v019-whole-product-review-evidence/reviewer-completed-stale-queue-390.png) | REVIEWER/lead: queue contradicts completion and invites repeated work. | Reconcile list membership/workload after save; coherent return, small–medium frontend. | P1 | Yes |
| 3 | [Contradictory browser-save footer](v019-whole-product-review-evidence/form-editor-1440.txt) | AUTHOR: cannot reliably predict whether edits are saved/shared. | Contextual status from active persistence mode, shared question editor, small frontend. | P1 | Yes |
| 4 | [One-question editor spans 6,128px](v019-whole-product-review-evidence/form-editor-390.png) | AUTHOR: simple work requires interpreting scoring/groups/testing layers. | Focused question editing; collapse advanced controls and duplicate summaries, medium frontend. | P1 | Yes |
| 5 | [Analytics leads with architecture and IDs](v019-whole-product-review-evidence/connected-analytics-1440.txt) | Quality leader: implementation knowledge precedes finding coaching evidence. | Outcome introduction, named version/queue/policy selectors and weak-criterion priority, medium frontend. | P1 | Yes |
| 6 | [Blocked Answer Set update has validator recovery copy](v019-whole-product-review-evidence/regression-blocked-update-1440.png) | AUTHOR: safe block but unclear repair despite named Follow-up. | Removed label → dependent question/condition → direct repair action; small–medium frontend/domain error presentation. | P2 | Yes |
| 7 | [Human review → evidence returns to queue](v019-whole-product-review-evidence/reviewer-return-390.txt) | REVIEWER: selected comparison/context lost; extra reopen compounds #1. | Return to same evaluation/position. Include in #1 tranche, medium frontend. | P2 | Yes |
| 8 | [Answer types/keys/source/family terms burden scale creation](v019-whole-product-review-evidence/answer-set-score-1440.txt) | AUTHOR: reusable answers feel like a provider data model. | Human types, generated keys, percent credits, advanced mapping; small–medium frontend. | P2 | Yes |
| 9 | [Version diff is keys plus long order paragraph](v019-whole-product-review-evidence/answer-set-comparison-1440.png) | AUTHOR: prediction of changed scale is difficult before Apply. | Aligned old/new labeled options and scoring implications; medium frontend. | P2 | Yes |
| 10 | [New form keeps unrelated starter after group reuse](v019-whole-product-review-evidence/first-author-11-group-added.png) | First-time AUTHOR: extra removal/confirmation, accidental extra question risk. | Empty start or explicit replace-starter action; small frontend. | P2 | Yes |
| 11 | [Eleven-role-neutral destinations](v019-whole-product-review-evidence/reviewer-queue-390.png) | REVIEWER/VIEWER/AUTHOR: irrelevant paths dilute primary work. | Role-focused first group and contextual Conversation review; medium frontend. | P2 | No |
| 12 | [Coverage labels/units vary](v019-whole-product-review-evidence/mobile-tab-activated-analytics.png) | Quality leader: run observations and failed assignments can be mistaken for unique-conversation funnel losses. | Common labels, denominator/unit always adjacent, failures separate; small–medium frontend. | P2 | Yes |
| 13 | [Quality/workload follow infrastructure health](v019-whole-product-review-evidence/connected-overview-390.png) | Quality leader: first-screen operational attention is strong, current quality arrives late. | Compact infrastructure exceptions; quality/coverage/work first, small–medium frontend. | P2 | No |
| 14 | [Mobile tabs conceal right-hand choices](v019-whole-product-review-evidence/mobile-tabs-analytics.png) | Mobile leader/reviewer: useful breakdowns require discovering horizontal scrolling. | Overflow affordance or labeled selector/wrap with selected semantics; small frontend. | P2 | No |
| 15 | [Primary current navigation is visual only](v019-whole-product-review-evidence/heading-semantics.json) | Keyboard/screen-reader user: current workspace destination not announced. | `aria-current`, explicit selected state where appropriate; small frontend plus semantics checks. | P2 | Yes |

Other meaningful but lower-ranked work: raw import/list errors, direct Use in a form from group detail, duplicate severity messages, routine enum/ID presentation, and subsection status copy. They are recorded above rather than treated as proof of additional headline defects.

## 23. Remove/simplify

Highest-value subtraction is in authoring: collapse group/overall scoring, conditions, history and test execution detail unless relevant; stop showing the same options in both the question summary and editor; move keys/source mapping into advanced disclosure; reduce Save/Publish/Test/Export/Duplicate to a clear completion hierarchy. Keep expert capability available.

Remove “family” from ordinary reuse messages and provider/storage terms from page openings. Use named form versions and plain review states. Put copyable IDs in provenance. Merge or contextualize the Conversation review navigation destination. Focus role navigation rather than reproducing the full menu for every user. Reduce repeated public boundary labels to one prominent status plus evidence detail; preserve the explicit fictional/live boundary. Replace equal-priority Overview infrastructure cards with a compact status/exception treatment. Avoid adding a tour to explain complexity that can be removed.

## 24. Strongest elements

| Strongest element | Why it works exceptionally well |
|---|---|
| Pitch moment: chapter 4 Human challenge | “Later” becomes a concrete disagreement; AI 100%, human 56%, 44 points apart; original AI remains unchanged. It demonstrates the value of human judgment instead of merely claiming human control. |
| Operational screen: Overview attention/review workload | Escalated, overdue and failed-run signals connect to exact work/evidence. There is an owned next action instead of a decorative metric. |
| Authoring workflow: compatible published Answer Set → copied answers → explicit Detach/update | Reuse is discoverable inside the question and avoids silent mutation of published definitions. It is the best part of the V0.19 authoring model despite wording/density. |
| Trust mechanism: independent human review and pinned published snapshots | AI history stays intact, human judgment is separately scored/auditable, later library changes cannot silently rewrite existing forms. |
| Responsive pattern: evidence-first Conversation review | Transcript remains readable and bounded; mobile puts customer/agent evidence ahead of form configuration. |

## 25. Recommended next tranche

**One tranche: reviewer continuity and completion safety.** Scope it to keeping an unfinished review and the selected evaluation intact while inspecting original conversation evidence, and reconciling My Reviews after successful completion. Do not broaden it into navigation redesign, Answer Set polish or all authoring simplification.

Expected impact: removes a direct loss of user effort, makes evidence inspection safe, removes the reopen/manual-refresh detours, and restores confidence that Complete review means the assignment is done. Retain independent human/AI scoring and exact investigation scope.

Likely files: `src/ReviewPanel.tsx` (draft lifecycle/dirty state); `src/EvaluationsPage.tsx` (selected review, completion/list reconciliation); `src/App.tsx` (conversation return context); relevant navigation/detail-focus helper only if required. Use existing API operations; **backend required: no** for the observed defects. If implementation chooses durable cross-session drafts, that is additional scope and should be separately justified.

Acceptance tests: (1) enter answers/note → open conversation → return → same evaluation and unchanged draft; (2) genuinely destructive navigation prompts/preserves according to the chosen behavior, Cancel returns focus; (3) completed review leaves My Reviews immediately and workload agrees without Refresh; (4) completion failure retains all inputs and allows retry; (5) explicit analytics/overview cohort return remains exact; (6) original AI record remains immutable; (7) keyboard/mobile paths at all requested sizes. Convert the current loss characterization into a preservation regression when implemented. This review does not implement the tranche.

## 26. Limitations

Validation is deliberately separated to prevent overlapping numbers from becoming a misleading total:

| Layer | Result | Evidence / interpretation |
|---|---|---|
| Unchanged production frontend build | Passed | [Build log](v019-whole-product-review-evidence/frontend-build.txt); deployed asset byte comparison passed for 8 static files. |
| Deterministic/unit/API tests | **597 passed, 61 files** | [Unit log](v019-whole-product-review-evidence/deterministic-tests.txt). An initial restricted-sandbox run failed socket-binding tests; retained as harness evidence and rerun with local socket permission. |
| Existing high-value browser regressions | **165 passed, 6 failed, 171 total; 0 skipped/flaky** | [Browser log](v019-whole-product-review-evidence/browser-regressions.txt), [JSON](v019-whole-product-review-evidence/browser-results.json). Five baseline expectations and one harness failure; none suppressed or edited. |
| Authenticated review matrix | **9 passed** | [Matrix log](v019-whole-product-review-evidence/review-fixture-final.txt): major pages/state/roles/failures, actual API-backed fictional data. |
| Additional review task/defect/semantics checks | **9 passed** | [Task log](v019-whole-product-review-evidence/review-tasks-final.txt). Includes 3 reviewer sizes, analytics task, SLA failure, group composition, mobile dialog/tabs, draft-loss characterization and heading semantics. Pass does not negate observed defects. |
| Independent first-time author replay | **1 passed** | [Author log](v019-whole-product-review-evidence/first-author-checks.txt); goal-only exploration separate from fast replay. |
| Deployed public matrix | **24 page captures, 48 journey/bounds checks, 24 calculator observations** | [Public JSON](v019-whole-product-review-evidence/public-review.json). These are observations/assertions, not 96 independent Playwright tests. |
| Deployed paced/keyboard/contrast probe | Passed; **272.137s** paced journey | [Extra record](v019-whole-product-review-evidence/extra-data.json); overlaps public routes. |

Review-specific Playwright consists of **19 unique fixture checks (9 + 9 + 1)**; these are also the authenticated-fixture layer, so do not add them again as another independent total. The separate semantics run is repeated inside the final nine-check task run and is not counted twice. Existing browser suites overlap some domains and are reported separately.

Baseline failure classification, retained in the original log:

| Failed existing test | Classification | Evidence-based reason |
|---|---|---|
| `authoring.spec.ts`: offline draft stays browser-local | BASELINE TEST EXPECTATION | Navigates bare root expecting workspace controls; root now intentionally opens Welcome. |
| `policy-authoring.spec.ts`: offline sandbox saves locally | BASELINE TEST EXPECTATION | Same obsolete bare-root workspace assumption. |
| `policy-authoring.spec.ts`: VIEWER cannot mutate | BASELINE TEST EXPECTATION | Expects disabled Policy name; current readable control is intentionally readonly. Mutation guards remain. |
| `policy-authoring.spec.ts`: REVIEWER cannot mutate | BASELINE TEST EXPECTATION | Same disabled-versus-readonly assumption. |
| `overview.spec.ts`: OAuth intent/deep link/query page win | BASELINE TEST EXPECTATION | Prior intent/deep-link assertions work; final bare-root assertion expects Conversation review instead of Welcome. |
| `overview.spec.ts`: existing connected session before App mounts | HARNESS FAILURE | Injects session through intercepted `/src/main.tsx`; production build loads hashed bundles, so the setup hook never runs. |

The six failures were not rewritten to green. Product bugs found in review are independently classified in sections 9/22. Earlier review-harness retries retained locator/default-role mistakes separately: nonexistent header naming; asynchronous screenshots captured too early; review assignment revision required matching API concurrency; group type selected by wrong label API; evidence return initially assumed detail instead of queue. Corrected harness results do not erase the raw logs or change source.

Public network/storage boundary: Welcome and all demo chapters issued **only same-site static/document GETs**, zero production API/Genesys/Jev/notification requests, zero recorded storage operations in fresh contexts. Public matrix recorded 40 static requests and zero page errors/forbidden attempts. After explicit Explore prototype to `?page=conversations`, product storage initialized seven keys: `genesys-aqm-v03-source`, `genesys-aqm-v03-policy-runs`, `genesys-aqm-v02-forms`, `genesys-aqm-v08-group-assets`, `genesys-aqm-v02-policies`, `genesys-aqm-v02-history`, `genesys-aqm-v03b-form-seeded`; session storage remained empty. [Exact boundary](v019-whole-product-review-evidence/public-review.json). Fixture OAuth/provider calls were fulfilled locally; AQM-shaped requests were forwarded only to the ephemeral local API, never production. Notification configuration was read/edited fictionally without delivery. No actual provider evaluation, production mutation, PR, merge or release tag was performed.

This is Chromium on a desktop host with emulated viewport sizes. It is not cross-browser certification, native mobile/touch testing, a screen-reader study, performance/load testing, actual integration validation, empirical AI accuracy measurement or recruited human research. Fixture agents/queues/evaluation snapshots/runs were made coherent enough for tasks but remain synthetic and small; quality claims cannot be extrapolated. Timing is a paced automation simulation, author discovery is an agent simulation, and word/control/height counts support judgment rather than establishing human effectiveness alone.
