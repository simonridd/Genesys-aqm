# IPI AQM — deployed human-effectiveness review

Review date: **3 October 2026, Europe/London**. Reviewed deployment: https://simonridd.github.io/Genesys-aqm/. Canonical baseline: `31893cafd79068b652895767aa9a7219b47cfc23`. Review branch: `codex/aqm-human-effectiveness-review`.

This is a demanding pitch-readiness assessment for presales, CX/quality leaders, engineering/product stakeholders and internal decision-makers. It is not a software-release verdict. No product changes are included.

## 1. Executive summary

**The welcome page sells a credible idea; the tour makes the visitor work too hard to understand it.** The best demonstration is a six-message conversation in which the AI accepts “later” as a clear next step and a human challenges that judgment. It gives the proposition a concrete customer consequence and makes independent review believable. That should be the spine of the pitch.

Instead, the default tour begins with service-health tiles marked “Unavailable,” proceeds to a long disabled form editor, and only then reaches the conversation. Its Next button can bypass the evaluation, evidence investigation and review completion. On mobile the rail consumes roughly half the initial viewport before the substantive content begins. A colleague can finish the tour without experiencing the argument it is supposed to make.

The implementation is substantial, the brand treatment is coherent, the calculator arithmetic is correct, and fictional/live boundaries are unusually explicit. Those strengths support a pilot discussion. They do not offset the weak tour pacing, exposed internal language or abrupt transition into an empty connection-dependent product dashboard.

**No P0 finding is supported.** The major issues are P1 communication and interaction friction, rather than actively misleading claims. The review identifies five P1 improvements and five P2 improvements in section 14.

Evidence: [index](human-effectiveness-evidence/README.md), [opening dashboard](human-effectiveness-evidence/chapter-1-1440.png), [disabled editor](human-effectiveness-evidence/chapter-3-1440.png), [completed human review](human-effectiveness-evidence/chapter-6-completed-1440.png), [mobile opening](human-effectiveness-evidence/chapter-1-390.png), [product handoff](human-effectiveness-evidence/product-transition-390.png).

## 2. Pitch-readiness classification

**C. NEEDS ONE FOCUSED IMPROVEMENT PASS.**

A prepared presenter can already use the application to support a discussion. I would not yet send the link without explanation and expect the application to carry most of a five-minute pitch. This is more than minor polish: the story order, primary actions and mobile chapter layout need a coordinated change. There is no evidence here that backend capability needs rebuilding.

Audience implications:

| Audience | Likely response | What needs explanation |
|---|---|---|
| Presales / solution consultant | Attractive opening; credible challenge example | How to route around the disabled editor and reveal the meaningful results |
| CX / quality leader | Human independence is persuasive | How the scoring rules create the 56% human result, and what management action follows |
| Engineering / product stakeholder | Recognises breadth and explicit boundaries | Which capability is evidenced versus merely simulated, without interpreting repository checkpoints |
| Internal decision-maker | Cheap model estimate attracts interest | Why Jev matters, full pilot costs, and the decision the pilot should support |

## 3. Scorecard

Scale: 1 seriously ineffective; 2 weak/substantial friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/compelling. Scores include desktop and mobile. They assess communication, not feature completeness.

| Category | /5 | What works / evidence | What holds it back | Concrete improvement |
|---|---:|---|---|---|
| Human effectiveness | **3** | Welcome has a recognisable problem; chapters 4/6 make disagreement concrete | Value arrives late; a Next-only journey misses its demonstration; mobile hides the evidence below narration | Make the conversation, result and challenge the tour’s central sequence |
| Value proposition | **3** | Less manual scoring, controlled coverage, transparent rules and human independence appear | “Typed AI decisions” is unexplained at first encounter; low input cost is not explicitly connected to wider review coverage | Explain predefined answers and batched questions using this case, then connect affordable evaluation to reviewer capacity |
| Information quality | **3** | Specific sampling, criteria, confidence caveat, costs and pilot outline | Repeated qualifiers, internal terms, raw question types and IDs; some copy assumes architecture knowledge | Replace technical labels; consolidate boundaries; remove fields with no pitch purpose |
| Ease of use | **2** | Back/Next/Exit/Restart and deep links work; controls use standard semantics | Two competing routes per chapter; essential actions optional; mobile evidence is below controls; core menu clips horizontally | Make one obvious chapter action; move compact navigation below/alongside evidence on mobile |
| Visual quality | **4** | Shared IPI artwork, dark navigation, muted surfaces, restrained plum/mint accents; legible typography | Strong welcome rhythm becomes an editor-heavy card stack; several chapters have excessive empty desktop space | Preserve tokens and simplify composition around one meaningful visual per chapter |
| Trust / credibility | **4** | Fictional/prepared labels, no request claims, unchanged original AI, cost exclusions and confidence caveat | Defensive unavailable states dominate opening; live evidence disclosure cites a person instead of an inspectable proof summary | Keep one clear simulation boundary; replace anecdotal status wording with dated evidence and remaining validation |
| User-facing cleanliness | **2** | Many business terms are legitimate: Jev, Genesys Cloud, published versions, audit | “mounts real application services,” “reseeds,” `noul`, `DUE_SOON`, storage/server distinctions, raw identifiers | Introduce human labels and hide implementation information in an optional technical view |
| Welcome page | **4** | Strong headline, obvious demo CTA, honest prototype badge, concrete preview; mobile CTA remains visible | Differentiation requires interpretation; full page is long; preview’s two judgments are below the mobile first screen | One plain-language Jev sentence; shorter supporting copy; preserve the hero |
| Cost calculator | **3** | Correct inputs-to-cost arithmetic; model input cost clearly separated from total operating cost | No period for volume; unexplained token default; static preset prose remains beside changed results; generic invalid-input message | Label period, explain illustrative transcript size, show current assumption summary and field-specific limits |
| Guided demo | **2** | Seven connected domains; prepared case, cohort and human completion work | Starts with unavailable health; authoring controls burden chapter 3; chapter 5 feels like database inspection; core action can be skipped | Reorder and shorten the story; remove disabled editing and make essential outcomes apparent |
| Showcase/product fit | **2** | Same logo, colours, components and domain vocabulary | “Open AQM” lands disconnected users on an empty dashboard; different sample and technical terminology; mobile review prioritises routing before transcript | Explain the handoff and direct disconnected visitors to a useful public exploration path |

**Unweighted average: 32 / 11 = 2.91 / 5.** Ease of use, guided demo, cleanliness and continuity remain 2/5; the average must not conceal those weaknesses.

## 4. First-time-user observations

A clean Chromium context opened the default root with no storage. The initial welcome and seven-chapter Next-only pass were completed **before product-source inspection**. This is an agent first-impression exercise, not a recruited-user usability study.

- **First five seconds:** the oversized benefit headline and IPI identity are the strongest signals. The prototype badge qualifies the promise; no authentication is needed to explore. At 390px the primary CTA is still inside the first screen.
- **First thirty seconds:** likely comprehension is “quality management for Genesys Cloud, with less manual scoring and independent human checking.” “Typed” and “pinned form” require interpretation. The mobile visitor has not yet seen both sides of the disagreement.
- **First CTA chosen:** Take the guided demo. It is clearly primary; Connect Genesys Cloud is a potentially distracting commitment for a colleague who is only evaluating the idea.
- **First hesitation:** the tour opens with a warning and five Unavailable health tiles. A viewer has to distinguish deliberate simulation from something broken.
- **First concept requiring interpretation:** “typed AI decisions” in the hero. The application uses the term before providing examples of the answer shapes.
- **First developer wording:** “Read-only authored examples; … changes in memory. Reload reseeds this story,” followed by “mounts real application services.” This is explanatory detail for a developer, not the colleague.
- **First convincing value:** the welcome preview hints at independent challenge; chapter 4’s transcript and chapter 6’s resulting disagreement make it concrete. The initial Next-only pass did not reveal the prepared evaluation or complete the review. Their lesson remained largely asserted in prose.

Full-scroll observation: the narrative is coherent in broad outline, but its 453 rendered words are surrounded by repetition and qualification. Mobile extends to 5,497px. The issue is the distance between the pitch’s concrete example, economics and next step, rather than a universal word-count limit.

## 5. Five-minute pitch result

A **paced presenter simulation** used the deployed app at 1440×900. The harness allowed 260 seconds of explicit reading/explanation dwell, then included real navigation and interaction time. It used direct public chapter links, not authenticated data. These are simulated dwell times, not measurements of a human presenter or realistic product-latency benchmarks. Direct reloads and disabled browser cache from request interception increase this route’s overhead.

**Elapsed total: 341.459 seconds — 5 minutes 41.5 seconds.** At 4:59.5 the route had reached the manager’s quality/coverage view; governance and the pilot outline still remained. This specific route misses five minutes. It does not prove that every practiced presenter will miss the limit.

| Elapsed | Page / chapter | Lesson / verbal rescue |
|---|---|---|
| 0:31 | Welcome | Problem clear; presenter must translate “typed decisions” |
| 1:18 | Welcome economics | Low input cost visible; presenter must connect batching and transcript assumptions to coverage |
| 1:54 | Chapter 2 | Explain sample as a policy choice; ignore seed and runtime wording |
| 2:35 | Chapter 3 | Explain weighting while bypassing disabled authoring UI |
| 3:32 | Chapter 4, reveal evaluation | Customer consequence becomes concrete; scroll to results |
| 4:18 | Chapter 6, complete review | Demonstrate preserved AI score and human 56%; explain resulting calibration use |
| 4:59 | Chapter 1, scroll to quality/coverage | Show management outcome; bypass opening health panels |
| 5:31 | Chapter 7 | Translate SLA/governance controls and simulation disclaimers |
| 5:41 | Welcome pilot outline | Scope, calibration and measurement become the next step |

Detours: leave Welcome for economics before the tour; bypass chapter 1 initially; jump over chapter 5; revisit chapter 1 for useful metrics; return to Welcome for the pilot. Chapter 5 was separately tested, but omitted from this pitch route to control length. This is a presenter-authored story, not the advertised sequential story.

Can the app explain the seven required points? Problem **yes**; Jev economics **partly**; selection **yes after jargon translation**; evaluation **yes after reveal**; independent challenge **yes after completion**; manager quality **yes after scrolling**; pilot **yes at the end**. The presenter supplies too much connective reasoning. Aim for a coherent sequence that fits five minutes without this route knowledge.

Proof: [timed route and keyboard data](human-effectiveness-evidence/extra-data.json), [pitch harness](human-effectiveness-evidence/extra.cjs).

## 6. Self-guided result

**I would send this link with a short route instruction today. I would not rely on an unexplained link to carry the pitch.**

| Severity | Where external explanation is needed | Why |
|---|---|---|
| BLOCKING | Chapter 4 → Next without reveal; chapter 6 → Next without completion | Visitor can bypass the evidence and the independent-review outcome that justify the product |
| BLOCKING | Disconnected Open AQM handoff | Empty Overview invites a connection/configuration task rather than continuing meaningful exploration |
| NOTICEABLE | Opening operational health | Deliberately unavailable services look unhealthy before the benefit is established |
| NOTICEABLE | Jev differentiation | Visitor must infer what a typed decision is, why batches matter and what the app contributes |
| NOTICEABLE | Chapter 3 | Weighting, criticality, Yes threshold, reuse and conditional groups compete with the one lesson |
| NOTICEABLE | Chapter 5 cohort | Raw IDs and a mostly inaccessible example list replace a business conclusion |
| NOTICEABLE | Mobile chapters | Next is visible before the content; substantive actions require scrolling and then returning |
| NOTICEABLE | Model estimate | Period and token assumption need a presenter; a small model component can become an overly strong price anchor |
| MINOR | Review terms | SLA, absolute score gap and “pp” require translation for some stakeholders |
| MINOR | Finish / Explore a pilot | Returns to a useful outline, but neither identifies a responsible next actor or concrete pilot decision artifact |

“Blocking” here means blocking an unaided pitch lesson, not a broken browser operation.

## 7. Welcome review

**4/5. Keep the headline, prototype badge and visible primary CTA.** At 1440 and 1920 the paired AI/human preview establishes the product’s distinctive trust mechanism. The large-desktop max width is sensible; it does not stretch text across the screen. At 390 the same proposition and CTA survive, while the paired judgment moves below the initial viewport.

The headline is benefit-oriented but could describe many automated QA tools. The differentiator below it uses four concepts at once: Jev, typed decisions, policies and transparent scoring. A sentence such as “Jev answers specific quality questions in predefined formats; AQM turns those answers into scores that people can inspect and challenge” would provide the missing bridge. Do not add another explanatory card.

The economics section is placed naturally after the approach, but the low number attracts more attention than the explanation linking economical evaluation to wider coverage. Keep the exclusion and confidence caveats. Replace “Browser-only” and infrastructure service names with ordinary planning/operating language. The five connected workflow links are useful chapter entry points; shorten their technical subtitles.

Prototype positioning lands mostly in the right place: a substantial working prototype worth piloting. The badge and pilot outline avoid claiming enterprise readiness. The expanded status panel distinguishes implemented capability, prior reported proof and pending validation, but “Simon previously confirmed” and “accepted product checkpoints” sound like a repository conversation. Present a dated, inspectable validation summary instead. This review does not independently verify the reported live proof.

### “So what?” test and Jev differentiation

| Feature area | Does the benefit land? | Needed change |
|---|---|---|
| Policy automation | Partly: sample and schedule are clear | State that repeatable selection reduces ad hoc manual review |
| Evaluation forms | Partly: rules are inspectable | Show how agreed criteria make scoring defensible, rather than displaying an editor |
| Analytics | Weakly: 79% credit and cohort are shown | State what a quality leader should investigate or change |
| Coverage | Partly: 24 of 48 is understandable | Explain visibility across a selected population and the distinction between selection and completed evaluation |
| Human review | Strongly after completion | Keep the “later” disagreement and preserved AI answer |
| Calibration | Partly: 2 agreements/1 disagreement is concrete | Explain that reviewed examples identify criteria to refine; do not imply population accuracy from one review |
| Alerts | Partly: directs attention to resolution guidance | Show the reviewer’s actionable work, rather than delivery configuration |
| Governance | Mostly a capability checklist | Connect schedules, deadlines and audit to ownership and follow-through |
| Calculator | Model component clear | Connect economics to a pilot coverage decision and list other cost components in business terms |

Jev is **under-explained at first encounter**, not presented as infallible magic. Chapter 4’s revealed result explains batched and conditional waves, but it is buried behind a reveal and technical prose. Transparent scoring and human independence are stronger than the explanation of structured outputs. Affordable broad evaluation is plausible and qualified; no measured AQM throughput is proved. Explain predefined Yes/No and named choices, batching, code-controlled weighting and independent review using the same case. Avoid an architecture diagram.

## 8. Calculator review

**3/5. A sound model-input estimate with an incomplete decision-support frame.**

Source verification: `src/showcase/economics.ts` computes selected = floor(volume × percentage / 100), evaluations = selected × forms, requests = evaluations × requests-per-form, and cost = requests × tokens / 1,000,000 × $0.042. The price and free output-token claim matched the [official Jev models documentation](https://docs.typesafe.ai/models), inspected on the review date. That documentation fetch was separate from application-network monitoring and made no inference/provider API request.

| Inputs / change | Expected | Deployed result |
|---|---:|---:|
| 100,000; 100%; 1 form; 1 request; 8,000 tokens | $33.60 | $33.60 |
| Same; 2 requests | $67.20 | $67.20 |
| 100,000; 50%; 2 forms; 2 requests; 8,000 tokens | $67.20 | $67.20 |
| 100,000; 100%; 1 form; 1 request; 64,000 tokens | $268.80 | $268.80 |
| Zero volume | $0.00 | $0.00 |
| 3 conversations; 50%; 1 form/request; 8,000 tokens | 1 selected; $0.000336 before rounding | $0.00 |
| Negative or blank volume | Invalid | Check inputs |

These cases ran at all three viewports. The default was also visually checked before changes. Source bounds reject non-finite/out-of-range values; the review did not browser-test every upper bound. Integer flooring explains fractional selections, but dollar rounding can make tiny positive estimates appear free.

Purpose and cost boundary are clear: the large label says **ESTIMATED MODEL INPUT COST · USD**, and exclusions expressly include transcription, Genesys, infrastructure, retries, taxes and human review. There is no supported P0 total-cost misrepresentation.

The 100,000 / 100% / one-form / one-wave / 8,000-token default is a transparent illustration, not a measured or generally representative workload. Volume lacks a period. “8,000 tokens” does not tell a quality leader what sort of conversation it represents. Fractional planning equivalents are defensible, but not explained through a practical operating scenario. The static $67.20 two-request preset remains after inputs change; it is labelled as a preset, so it is not wrong, but it makes the result panel harder to interpret. “Displayed limits” are not visibly explained next to the fields.

Specific fix: add “conversations in the period you are estimating,” identify the default as a transcript-and-question assumption to replace with pilot measurements, dynamically describe current inputs, and show per-field validation. Keep total operating cost separate. At 390 the result follows controls correctly, but the dense exclusion/assumption paragraphs require a long scroll; shorten and progressively disclose secondary detail.

## 9. Chapter-by-chapter demo review

Interaction-burden scores use **5 = low burden / well chosen interaction** and **1 = excessive or confusing burden**. “KEEP AS IS” is reserved for a chapter that needs no substantive change; none earns that recommendation across desktop and mobile.

| # / title | Key message / primary action | What a human learns; obviousness and story contribution | Unnecessary UI | Clarity | Usefulness | Interaction burden | Narrative value | Decision |
|---|---|---|---|---:|---:|---:|---:|---|
| 1 Understand the operation | Quality, coverage and workload identify investigation; Next or dashboard links | Useful management outcome, but obscured by service status and warnings before a case is established | Five Unavailable health tiles, repeated delivery messages, multiple routes | 2 | 3 | 2 | 2 | **REWORK** — show the management outcome later, after the case |
| 2 Decide what to evaluate | One queue, 50% sample, published form; inspect pinned form / Next | Selection is intelligible; version traceability helps trust, but the seed/runtime wording needs translation | Seed, implementation-limit caveat, “Why is running unavailable?” | 3 | 4 | 4 | 3 | **TIGHTEN** — retain queue, sample, form and cadence |
| 3 Define what good looks like | Weighted criteria and conditional escalation; essentially Next | Agreed quality rules are useful, but disabled editing dominates the lesson | Add/delete/duplicate/move controls, name fields, scoring-mode selector, Yes threshold, raw IDs | 2 | 3 | 1 | 2 | **REWORK** — replace the editor with a short read-only rubric |
| 4 Inspect a conversation | “Later” is not a timeline; Show example evaluation | Clear customer problem and questionable answer; strongest case evidence, but reveal is optional | System fixture message, raw conversation ID, result search for four questions, `noul`/`choice` | 4 | 5 | 3 | 5 | **TIGHTEN** — retain transcript and reveal; make continuation go through the result |
| 5 Follow the evidence | Trace quality issue to exact form/question examples; Investigate Clear next step | Traceability is valuable, but 79% credit is not translated into an operational conclusion | Search over one result, second search, 24-row cohort with raw IDs; most rows lead only to a scripted limitation notice | 2 | 3 | 2 | 2 | **REWORK** — reduce to an actionable quality signal and named evidence example |
| 6 Keep people in control | Human disagrees and original AI stays intact; Complete review | Independent judgment is compelling; 100% AI versus 56% human and 2/3 agreement make it visible | Separate scripted-save action, raw review ID/status, repeated memory wording | 4 | 5 | 3 | 5 | **TIGHTEN** — preserve comparison and completion, explain score consequence briefly |
| 7 Operate and govern | Accountable schedules/review deadlines/audit; Explore a pilot or Finish | Operational completeness is present, but reads as a configuration checklist before the useful next step | Live-action-unavailable button, server mention, enum state, duplicate finish/pilot paths | 3 | 3 | 3 | 3 | **TIGHTEN** — one ownership/deadline summary and one pilot CTA |

### Whole-tour judgment

There is a beginning, middle and end in feature coverage, but weak narrative causality. The story would work better as customer case → agreed criteria → prepared result → independent challenge → wider quality signal/selection → operating ownership → pilot. Next changes chapters reliably; it does not guarantee a meaningful lesson. Back, Skip, Restart and Exit work. Next and Skip perform the same progression; their coexistence adds little. Restart resets the example, while reload reseeds it; that consequence should be explained without discussing memory.

The final pilot outline is sensible and navigation lands on it. Finish tour and Explore a pilot both return there. One final CTA would be clearer. The tour has no visible chapter menu or compact preview of the seven destinations, so a visitor cannot judge scope or return directly to the strongest lesson without knowing the URL or using earlier capability links.

### Information-density measurement

Counts use rendered `innerText` across the complete page, visible DOM paragraphs/headings and controls with layout boxes (not just elements above the fold). “Controls” includes buttons, links, inputs, selects and summaries; “enabled” includes read-only inputs that are not disabled, so it is **not** a count of useful actions. Panels count `.panel` containers, including nested ones. Metrics expose composition, not an arbitrary readability standard.

| Screen before special interaction | Words | Paragraphs | Headings | Controls / enabled | Panel containers | Page height 1440 / 390 |
|---|---:|---:|---:|---:|---:|---:|
| Welcome, details collapsed | 453 | 22 | 10 | 24 / 24 | 3 | 3,623 / 5,497px |
| Chapter 1 | 334 | 14 | 11 | 29 / 28 | 6 | 2,234 / 3,753px |
| Chapter 2 | 148 | 8 | 3 | 8 / 8 | 1 | 900 / 1,487px |
| Chapter 3 | 437 | 23 | 8 | 60 / 24 | 11 | 3,042 / 4,736px |
| Chapter 4, before reveal | 209 | 6 | 3 | 7 / 7 | 1 | 1,086 / 1,802px |
| Chapter 5, before cohort | 120 | 7 | 3 | 11 / 11 | 1 | 900 / 1,246px |
| Chapter 6, before completion | 165 | 10 | 3 | 9 / 9 | 1 | 900 / 1,693px |
| Chapter 7 | 190 | 11 | 4 | 9 / 8 | 2 | 900 / 1,910px |

Chapter 3 is the clear density failure: 60 controls and 11 containers serve a read-only lesson. Chapter 1 has too many parallel destinations before the case. Chapter 5 demonstrates that low word count alone does not ensure clarity. Chapter 4’s transcript deserves reading time; do not shorten the customer evidence merely to lower counts. Large-desktop measurements and revealed/cohort/completed states are in [review-data.json](human-effectiveness-evidence/review-data.json).

## 10. Core-product continuity

**2/5 overall; visual continuity is substantially better than experiential continuity.**

The same IPI identity and colour system persist. The layout changes reasonably from showcase header/rail to a working application sidebar. The surprise is the visitor’s task and vocabulary: a guided fictional story becomes an empty operational workspace, with connection requirements and implementation distinctions. “Open AQM” promises productive exploration but disconnected Overview supplies only “Connect to Genesys Cloud.” Returning to About/product tour works, but restarting orientation should not be necessary.

| Public product area | Desktop finding | Mobile finding |
|---|---|---|
| Overview | Clear connection empty state; “Durable operational data” leaks architecture | Connection CTA visible, but no continuation of the demo’s case |
| Evaluations | Production records and filters are present; server/history and bounded-scan wording require interpretation | A long filter stack precedes meaningful results or empty-state guidance |
| Analytics | Browser/server toggle and demo-loader controls expose storage architecture | Even more distance between heading and quality insight; several competing utilities |
| Calibration | Human-vs-AI purpose is clear; disconnected message appears after filters | Long input stack includes `form_id@17` before connection guidance |
| Forms | Substantial library/editor; deep link automatically opens an existing form and focuses inside details | Lands inside a long disabled editor, hiding page heading/library context above |
| Policies | Six plausible examples; local/demo/legacy/durable terms dominate boundary explanation | Horizontally scrolling table; fields and controls consume the first view |
| Question Groups | Reuse and independent versions make sense for authors | Raw published status/technical storage explanation; long filter stack |
| Settings | Honest connection explanation; region/client identifier are relevant to configured sign-in | Horizontal core navigation lacks an obvious menu cue; setup extends below fold |
| Conversations | Nineteen fictional samples are useful; source is explicitly labelled | Default wide table hides context to the right; Cards is available but not the initial mobile view |
| Conversation Review | Recognisable transcript/routing workspace; current case differs from tour | Routing and evaluation actions precede the transcript, reversing the pitch’s human evidence order |

No actual evaluation, policy execution, sign-in or notification action was initiated. Public read-only inspection cannot establish authenticated workflow quality.

## 11. Internal-mechanics leakage audit

**2/5. Boundary transparency is good; the language used to express it is frequently wrong for the audience.**

The [occurrence audit](human-effectiveness-evidence/leakage-audit.md) classifies each matching rendered line and links every observed context. Repeated occurrences are consolidated by exact text with all context names retained. It includes benign matches so a technical-word search is not treated as an automatic defect.

| Example | Classification | Reason |
|---|---|---|
| Jev, Genesys Cloud, AI requests, published form v3, audit history | USER-RELEVANT | Identifies the product dependency, cost unit, governed rubric or accountability |
| Human review saved only for this demo; refreshing restarts it | USER-RELEVANT | Explains practical persistence and reset behaviour |
| “Reload reseeds this story”; “mounts real application services” | INTERNAL LEAKAGE | React/runtime implementation adds no decision value |
| `noul`, `choice`, question ID `next-step`, `fictional-resolution@3` | INTERNAL LEAKAGE | Human answer/question labels are available; raw model/schema identifiers add friction |
| `DUE_SOON`, REVIEWED / COMPLETED duplications | INTERNAL LEAKAGE | Translate into one readable state |
| “fictional-quality seed” | INTERNAL LEAKAGE | Deterministic sample mechanism is unnecessary for this pitch |
| “Cloud Run/Firestore/network” in exclusions | INTERNAL LEAKAGE | Infrastructure is a relevant excluded cost, but service names are not necessary |
| Browser-local / Server analytics / durable server sandbox / legacy browser policy sandbox | INTERNAL LEAKAGE | Storage/implementation topology becomes the primary navigation model |
| “Published”, “Completed”, multiple choice | USER-RELEVANT | Ordinary governance, work-state and question-format language; uppercase alone is mostly polish |
| OAuth Client ID and sign-in privacy explanation in Settings | USER-RELEVANT | Needed by the person configuring sign-in; unsuitable as the default pitch next step |

No visible `undefined`, `null`, stack trace or raw exception was found in successful public journeys. Source vocabulary was not counted unless it appeared in rendered UI. Technical route/query names visible only in the address bar were not automatically classified as page-copy leakage.

## 12. Copy findings

Targeted replacements, not a blanket rewrite:

| Current text | Problem | Audience impact | Suggested replacement | Priority |
|---|---|---|---|---|
| “Jev’s typed AI decisions” | Assumes the differentiator is understood | Visitor cannot explain why Jev matters | “Jev answers specific quality questions in predefined formats” | P1 |
| “Keep scoring in code” | Implementation describes the benefit | CX leader has to translate it | “Make every score explainable” | P2 |
| “Controlled coverage is a policy decision, not a claim of unlimited capacity.” | Defensive construction in value copy | Slows the promise before anyone has asked about limits | “Choose the conversations to evaluate; validate capacity during the pilot.” | P2 |
| “Reload reseeds this story.” | Developer verb | Breaks professional product voice | “Refreshing restarts this example.” | P1 |
| “Explicitly leaves demo and mounts real application services.” | Runtime explanation | Sounds unfinished and technical | “Leave the demo and open the workspace. A Genesys connection is needed for live data.” | P1 |
| “50% · fictional-quality seed · 24 of 48 eligible conversations” | Exposes sample seed | Distracts from selection decision | “24 of 48 eligible conversations selected — 50% sampling.” | P2 |
| “Coverage is controlled; runtime limits remain unchanged.” | Internal constraint statement | Visitor does not know the limits | “This example selects half the eligible conversations.” | P2 |
| “Run this group when Issue resolved in No” | Grammar error | Weakens quality-rule credibility | “Use this group when ‘Issue resolved’ is ‘No’.” | P2 |
| `noul` / `choice` | Raw model types | Unexplained jargon in strongest demonstration | “Yes / No” / “Multiple choice” | P1 |
| “Quality → exact question cohort” | Database-centric title | No managerial conclusion | “Where resolution guidance needs attention” | P2 |
| “fictional-resolution@3 · next-step · no unrelated records.” | Raw join keys and defensive statement | Makes evidence inspection feel like debugging | “Resolution & ownership v3 · Clear next step · 24 matching evaluations” | P1 |
| “My reviews → fictional-evaluation-1” | Raw ID instead of case identity | Human story loses continuity | “Review Jamie’s conversation” | P2 |
| `DUE_SOON` | Raw enum | Requires interpretation | “Due today at 17:00” for this case | P1 |
| “Review completed in DEMO memory.” | Persistence implementation | Repeats a technical boundary | “Example review completed. The original AI result is unchanged.” | P2 |
| “Browser-only planning estimates” | Architecture before purpose | Adds an unnecessary term | “Illustrative planning estimate — model input cost only.” | P2 |
| “Cloud Run/Firestore/network” | Service plumbing | Distracts from actual excluded cost | “Hosting, storage and network costs” | P2 |
| “Enter finite values within the displayed limits.” | Limits are not visibly described; “finite” is technical | User has no specific recovery instruction | “Conversation volume must be between 0 and 1 billion” when that field is invalid | P2 |
| “Durable operational data” | Internal persistence adjective | Core looks like a developer tool | “Quality, coverage and review workload” | P2 |
| “Browser-local production records … separate complete aggregation” | Architecture explanation | Visitor has to choose implementation mode | “Data from this workspace” / “Organisation-wide analytics,” with a plain availability explanation | P1 |
| “Simon previously confirmed …” | Anecdotal proof label | Evidence depends on personal familiarity | “Previously reported voice and scheduled evaluations; independently verify during the pilot.” Link dated evidence if available | P2 |
| “V0.19 SHOWCASE” | Implementation tranche | Reinforces demo identity after product entry | “Working prototype” in About/status only | P3 |

## 13. Accessibility, responsive and public-page findings

Pragmatic checks, not WCAG certification:

- **Keyboard:** Welcome buttons, calculator inputs/disclosure, demo navigation, result reveal, cohort investigation, review completion and product transition were keyboard operable. Focus outlines were visible. Heading focus moves on chapter navigation. Standard buttons, anchors and summaries are used for the reviewed actions.
- **Contrast:** sampled rendered showcase text/control pairs had a minimum ratio of **5.06:1**. Existing semantic-token contrast assertions also passed at ≥4.5:1. This does not certify every nested surface, disabled control or state. Initial capture frames during animation were replaced with settled screenshots; faded animation frames are not reported as a product contrast defect.
- **Tap targets:** Next is about 37px tall; Skip and Restart about 15px; Open AQM about 13px; the welcome calibration link about 13px. Smaller secondary controls are too cramped for comfortable touch use. Increase hit areas without inflating copy.
- **Headings and labels:** showcase heading hierarchy is broadly understandable and calculator fields have associated labels. Core Forms can focus a detail heading far below the page introduction. The Yes threshold slider and scoring modes need a simpler conceptual frame for a pitch visitor. This was not a full accessible-name audit of every editor control.
- **Responsive:** no document-level horizontal overflow was measured at 390px. That does not make the UI fully mobile-friendly: navigation and tables have internal horizontal scrolling, while filters and form groups produce long vertical stacks. The core menu truncates later destinations without an explicit menu affordance.
- **Core mobile review:** routing/evaluation controls precede the transcript; a user sees actions before evidence. Prefer transcript first for this public review path.
- **Reduced motion / resize:** reduced-motion animation was `none`; changing a chapter from desktop to 390px retained the route and measured document width 390px.
- **Metadata:** Welcome, Demo and Product all use “IPI AQM · Automated Quality Management for Genesys Cloud.” No stale Vite title was found. No declared favicon, description or Open Graph metadata was found. Product/Welcome/Demo do not get distinct browser-tab titles. Add an IPI/AQM favicon and concise sharing metadata as P3 polish.
- **Edges:** invalid steps `0`, `-1`, `99`, `abc`, `3.5` normalize to chapter 1; every chapter deep link and refresh works at each viewport; browser Back/Forward, Skip, Back, Restart, Exit and Finish work. Refresh on chapter 6 intentionally resets its scripted review. Existing lazy-load failure regression confirms a human-readable demo-unavailable state and no live fallback. No undefined/null/stack-trace UI was observed.

Evidence: [keyboard focus](human-effectiveness-evidence/keyboard-demo-1440.png), [responsive resize](human-effectiveness-evidence/resize-chapter-4-390.png), [check results](human-effectiveness-evidence/review-data.json), [contrast/keyboard data](human-effectiveness-evidence/extra-data.json).

## 14. Top 10 improvements for human effectiveness

Ranked by likely pitch impact, not implementation convenience. Scope estimates are relative frontend/content scope, not delivery commitments.

| Rank | Finding / priority | Impact | Specific fix | Likely scope | Before pitching? |
|---|---|---|---|---|---|
| 1 | Central lesson can be bypassed — P1 | Visitors leave without seeing why independent review matters | Make chapter continuation reveal the evaluation and carry a completed example through human comparison; retain an explicit skip option | Medium, tour state/actions | **Yes** |
| 2 | Tour opens with unavailable operations — P1 | Creates doubt before value | Start with the customer case; show quality/coverage after its result; remove demo service health | Medium, order/composition | **Yes** |
| 3 | Mobile narration obscures evidence — P1 | Next invites progression before the user sees the lesson | Compact rail, remove repeated boilerplate, put chapter action beside/below relevant evidence and keep navigation reachable | Medium, responsive layout | **Yes** |
| 4 | Disabled form editor burdens the pitch — P1 | Long setup explanation drains attention | Short rubric showing three applicable criteria, relative weights, criticality and one conditional example | Small–medium, demo presentation | **Yes** |
| 5 | Jev’s differentiation requires translation — P1 | Stakeholders cannot repeat the economic/quality case | One plain-language definition plus this case’s structured answers and batch-to-cost explanation; replace raw types | Small, copy/result display | **Yes** |
| 6 | Handoff ends useful unauthenticated exploration — P2 | Good tour ends in a configuration dead end | Plain exit explanation and a useful public sample exploration destination; label live connection separately | Small–medium, routing/empty state | Preferably; can use a presenter workaround |
| 7 | Analytics proves joins, not a managerial decision — P2 | Traceability lacks a business “so what” | Show issue prevalence or credit with a named case and a concrete investigation message; remove full cohort dump | Medium, demo analytics composition | Preferably |
| 8 | Repeated developer boundaries and identifiers — P2 | Weakens clarity and professional voice throughout | One readable demo boundary; translate states; replace raw IDs; hide version tranche/plumbing | Small–medium, copy/presenters | Preferably |
| 9 | Calculator needs a workload frame — P2 | Small model number risks becoming the whole pilot-cost story | Clarify period, assumed transcript size, current scenario and cost exclusions in business terms | Small, estimator copy/validation | Preferably for economic pitches |
| 10 | Final step lacks an explicit decision artifact — P2 | Interest may not lead to action | One CTA to a concise pilot outline covering scope owner, success criteria and the evidence required for expansion | Small, final chapter/pilot copy | Useful; not a blocker for a facilitated discussion |

None warrants P0. “Before pitching” refers to a link expected to carry the story unaided. A knowledgeable presenter can route around several defects today, but should not mistake that rescue for product effectiveness.

## 15. What should be removed or simplified?

1. **Remove demo operational-health tiles and repeated delivery-unavailable banners.** Keep a single fictional/no-live boundary and the actual quality/workload signal.
2. **Remove the grouped form editor from the guided story.** Keep agreed criteria and scoring explanation; leave editing in the product.
3. **Remove seed names, question IDs, model type enums, raw cohort IDs, storage terminology and the runtime-mount sentence.** Human names and published form versions suffice.
4. **Remove search over one analytics row and the 24-row scripted cohort from the primary story.** A named matching example is more effective. Keep traceability available on demand.
5. **Combine scripted save and completion for the pitch case.** The distinction matters in production, not as two competing tour tasks.
6. **Combine Next and Skip hierarchy.** Essential next action should teach; optional skip should be visibly secondary.
7. **Shorten chapter 7 to ownership, deadline, audit and pilot.** Remove the button that explains unavailable live governance actions.
8. **Reduce calculator paragraphs and move secondary assumptions behind one disclosure.** Keep a visible total-cost boundary and current assumptions.
9. **Replace anecdotal/checkpoint proof copy.** No developer history should be needed to assess pilot credibility.
10. **Do not add another onboarding overlay, explainer grid or architecture slide.** The current problem is an excess of parallel explanation and controls.

Chapter disposition: substantially rework 1, 3 and 5; tighten 2, 4, 6 and 7. Chapter 3 need not survive as a full standalone editor chapter. Chapter 5 need not survive as a standalone cohort table. Their useful lessons can be compact moments inside the case story.

## 16. What is already working very well?

- **Strongest screen:** Welcome on desktop. The headline, prototype badge, primary action and paired judgment preview provide a professional opening; the mobile headline/CTA remain effective.
- **Strongest chapter:** chapter 6 after completion. Original AI 100%, human 56%, 2/3 agreement and the explicit timeline disagreement make human independence observable.
- **Best explanatory element:** the six-message transcript. “They should return later” makes the disputed criterion understandable without specialist knowledge.
- **Best trust mechanism:** the original AI result remains unchanged when the scripted human review completes; confidence is explicitly not accuracy, and the prepared result makes zero live requests clear.
- **Best economic element:** model input cost has a separate label, a reproducible formula and explicit exclusions. Keep this separation.
- **Best visual pattern:** shared full-colour IPI artwork on a neutral tile, dark navigation, clear type hierarchy and restrained informational surfaces. Do not discard this system because the tour composition needs work.
- **Best operational signal:** quality, selected coverage and review workload form a useful management frame once placed after the case.
- **Best next-step foundation:** a narrow, permissioned, human-calibrated pilot with accuracy, cost and capacity measurement. It sets an appropriate prototype expectation.

The deployed logo bytes match the repository asset and the accepted brand-provenance hash (`abaaa77…fb865`); the displayed artwork is not visibly recoloured or stretched. This is a provenance/treatment check, not independent certification against an official corporate brand manual. [Asset comparison](human-effectiveness-evidence/deployment-assets.json) records the full hash.

## 17. Recommended next implementation tranche

**One tranche: “Make the case-led pitch work unaided.”**

Exact scope:

- Recompose the guided story around Jamie’s conversation, agreed criteria, prepared answers, independent challenge, wider quality/selection signal, ownership and pilot.
- Replace disabled authoring and cohort dumps with concise read-only evidence views.
- Make the primary continuation expose the meaningful result; carry the case/review state through the story while retaining explicit skip/back/reset.
- Compact the mobile rail and give chapter actions comfortable touch targets; keep evidence before progression.
- Translate visible types/states/IDs and consolidate simulation/reset wording into one understandable boundary.
- Add one plain-language Jev-to-batching-to-input-cost bridge; clarify the calculator period/current assumptions without claiming total platform cost.
- Clarify disconnected product entry and give it a useful public continuation; finish with one pilot CTA.

Expected impact: earlier concrete value, fewer presenter explanations, fewer opportunities to miss the lesson, and a shareable mobile experience. Preserve the verified no-provider/no-storage showcase boundary, source separation, confidence caveat, original AI result and transparent scoring.

Likely files: `src/showcase/Demo.tsx`, `src/showcase/Welcome.tsx`, `src/showcase/CostCalculator.tsx`, `src/showcase/showcase.css`, `src/showcase/Root.tsx`, potentially `src/showcase/fixtures.ts` for display identity; a small app-entry/empty-state change in `src/App.tsx` or `src/AutomationPanel.tsx` if the handoff requires it. Keep shared authoring components for actual authors; avoid altering scoring or backend semantics to improve a pitch view.

**Backend changes required: no.** Do not combine this with scale, digital-ingestion, provider, scheduling or notification work. Metadata-only P3 polish can wait outside this focused tranche.

Test plan: existing build and showcase regressions; all seven story destinations at 1440×900, 1920×1080, 390×844; clean Next-only journey must expose the case result and independent-review consequence; keyboard chapter actions and Back/Exit/Restart; refresh/deep-link/invalid-step/history; unchanged protected storage and zero forbidden network attempts; matching score/review invariants; a presenter simulation using ordinary UI progression within five minutes; then short unaided sessions with actual colleagues from the four audiences. Confirm that they can explain Jev’s role, the model-cost boundary, review independence and the pilot next step in their own words.

**Recommendation only: no implementation in this branch.**

## 18. Evidence and proof limitations

### Completed validation

- Existing build: **passed** (`tsc -b && vite build`).
- Offline showcase/navigation units: **13 passed**, two files.
- Existing deployed showcase Playwright suite: **8 passed**. Covers all viewports, keyboard/reduced motion, refresh/history, protected-storage isolation, deliberately failed demo loading, simulated authenticated handoff and semantic contrast. Session-shaped credentials were mocked by the existing fixture; no real authentication occurred.
- Review-specific deployed harness: **78 page/state records, 84 checks passed**, all requested public core destinations and all seven chapters at all three sizes.
- Separate keyboard/contrast/resize/paced-pitch checks completed; settled first-screen recapture prevents animation frames being mistaken for defects.
- Four JS entry/showcase/product bundles and the main CSS were compared byte-for-byte with the canonical build; all matched. Logo also matched. This anchors the source/calculator analysis to the actual deployment rather than assuming branch parity.

Logs: [build](human-effectiveness-evidence/build.txt), [unit regressions](human-effectiveness-evidence/unit-tests.txt), [browser regressions](human-effectiveness-evidence/browser-regressions.txt), [review validation summary](human-effectiveness-evidence/validation.json).

### Network and storage isolation

The primary harness intercepted **564 requests**, all allowed static GETs under the public site path. **Zero forbidden attempts, zero page errors and zero console errors** were observed in that completed run. Welcome, calculator and all demo chapters made **zero calls to Genesys, Jev/provider, production AQM or notification endpoints**. Static links to external documentation were not clicked in application journeys. Official documentation was inspected separately through read-only web tools; no provider model/API request was made.

Showcase storage snapshots and instrumented writes remained empty: **zero localStorage/sessionStorage mutation, zero IndexedDB opens/writes/databases** through all chapters, calculator and review completion. Review changes are intentionally in React/in-memory demo state and disappear on refresh/restart.

The explicit **Open AQM** boundary mounts the actual public workspace and deliberately seeds **seven localStorage keys**: `genesys-aqm-v03b-form-seeded`, `genesys-aqm-v08-group-assets`, `genesys-aqm-v02-forms`, `genesys-aqm-v02-policies`, `genesys-aqm-v02-history`, `genesys-aqm-v03-policy-runs`, `genesys-aqm-v03-source`. These store a starter marker, reusable groups, local forms/policies, empty histories and synthetic source selection. They occurred only after leaving showcase. This is intended disconnected-product state, not a hidden showcase write. Subsequent core visits also initialise table/view preferences; exact key operations are recorded per page. No real credentials or production records were created.

### Limits and excluded conclusions

- This is an agent visual/interaction review, not an actual colleague study; first-five/30-second judgments and self-guided severity are assessments, not measured comprehension rates.
- The timed pitch contains imposed dwell and full navigations with request interception. Its 5:41 result is route evidence, not a product latency SLO or proof that a practiced presenter cannot pitch in five minutes. Mobile pitch timing was not separately measured; its additional scrolling burden was inspected visually.
- Authenticated workflows, real inference accuracy, digital retrieval, notification delivery, scheduling, production cost and throughput were not exercised or proven.
- Price confirmation reflects the official page on this date and may change. The calculator is a model-input component estimate.
- Not every core editor action, settings subsection, error state, label or contrast combination was tested. No formal accessibility certification is claimed.
- A transient Pages navigation timeout and capture timing issue occurred during harness development. They were retried; failed partial captures are excluded from the final evidence. An early browser-Forward check ran before state settled; the correctly synchronised check and existing regression both passed. Neither is reported as a product defect.
- Core pages were inspected publicly, without fixture injection; the existing regression suite separately uses mocked data for its authenticated-shaped safety checks. Do not confuse those fixture tests with deployed production proof.

### Review-only delivery boundary

Only this report, the Playwright review/evidence harness/config, screenshots, text captures and proof files are committed. Product source is unchanged. No PR, merge, release tag, authentication, live Genesys call, Jev inference, paid provider request or production write was made. The branch alone is committed and pushed; final delivery records its Git SHA.
