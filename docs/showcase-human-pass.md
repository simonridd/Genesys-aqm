# Showcase human-effectiveness pass

Date: 3 October 2026, Europe/London. Dedicated branch: `codex/aqm-showcase-human-pass`, based on `origin/main`. Scope: public showcase presentation, public handoff, calculator, offline tests and documentation. No backend, production domain, authenticated application or environment-builder-v2 changes. No PR or merge.

## Pitch and case

Five chapters replace the seven-section product tour:

1. **The customer case** — Jamie regains account access, but Alex says the team settings will return “later”. Was a clear next step agreed?
2. **Define quality** — three applicable questions, answer formats, credit, weighting and criticality replace the disabled form editor. One conditional escalation example and a short explanation of Reusable Question Groups retain the useful authoring concepts.
3. **Evaluate at scale** — prepared Jev answers, evidence/confidence and credit are visible immediately. AQM’s agreed rules produce the original 100% pass. Controlled selection covers 24 of 48 eligible conversations; batching connects structured questions to economical broader coverage.
4. **Human challenge** — the prepared human reviewer rejects the timeline. The original AI remains 100%; the independent human result is 56%, a rounded 44 percentage-point difference and critical failure. Two questions agree and one differs. These results cannot be missed through ordinary Next-only progression.
5. **Manage & pilot** — the same 24 example evaluations include five weak next-step answers; the one completed review challenges one AI judgment. The quality lead investigates commitments, owns the review deadline and coaching, and plans a narrow pilot.

The final primary action is **Plan a pilot**, leading to the focused pilot outline on Welcome. Next/Back/Exit follow evidence. Restart and public exploration are under More options. Old step 6/7 links normalize to Human challenge/Manage & pilot; invalid values normalize to the customer case. The desktop chapter list supports self-guided navigation. The mobile rail is hidden at ≤600px in favour of “Chapter N of 5” and the chapter title.

## Jev and calculator

The hero explains predefined quality answers and inspectable/challengeable AQM scores. The economics copy explicitly connects structured/batched questions and low model input cost to economically attractive broader evaluation. It makes no throughput promise.

The calculator uses conversations **per month**, explains the illustrative 8,000-token transcript-plus-questions assumption, and displays the current volume, selection, forms, requests and tokens. The default 100,000 conversations/month at 50% selection yields 50,000 evaluations, 50,000 requests, 400M tokens and **$16.80/month** model input cost. It uses the unchanged configured $0.042/M input constant, verified against [official Jev pricing](https://docs.typesafe.ai/models) on this date. Output is free under the published price. Hosting, storage/network, transcription, Genesys licensing/retrieval, retries, taxes and reviewer effort are explicitly excluded.

Blank, non-finite and out-of-range values identify the field and recovery limits, including closed Advanced assumptions. Small positive costs display “Less than $0.01/month” and the unrounded positive estimate. Changing inputs cannot leave contradictory preset prose.

## Cleanup and preservation

Removed opening health/unavailable tiles, disabled form editor controls, policy setup, raw cohort tables/search, separate reveal/save/complete actions, Skip, duplicate pilot/finish actions and repeated simulation boilerplate. The single demo boundary remains on every chapter: Interactive demo · fictional data · no live requests.

Showcase copy no longer exposes raw question types/IDs, schema identifiers, sample seed names, due-state enums, persistence implementation or infrastructure brand names. Refresh behaviour reads “Refreshing restarts this example”. Prototype status lists implemented capabilities, prior scheduled voice validation and still-pending scale/digital/notification validation without attributing proof to a repository conversation.

The official IPI logo and slate/green/plum tokens are preserved. No scoring, provider, authoring, scheduling, notification or production domain semantics changed. Demo answers and human review continue through the existing deterministic scoring/review functions. The completed human review is a prepared example automatically available to the pitch; no visitor is claimed to have submitted a real review.

Disconnected **Explore the prototype** opens sample Conversations. Connect Genesys Cloud remains secondary. Established authenticated users retain Open AQM → Overview. The core application and its storage remain behind this explicit handoff; showcase itself never mounts them.

## Roadmap

[Product roadmap](product-roadmap.md) captures **proposed V0.19 — Reusable Answer Sets**, with choice/score bases, versioned lifecycle/provenance, copied authoritative options, explicit DRAFT/TESTING updates, immutable published forms and exact EvaluationRecord snapshots. Runtime never fetches an Answer Set or adds a scoring lookup. Choice key/label/description/credit and ordered score sourceValue/credit semantics are retained. UX, dependencies, compatibility and non-goals are documented. This capability remains unimplemented and is labelled future in the showcase.

## Repeated human-effectiveness evaluation

Verdict: **B — pitch-ready with minor polish and actual colleague validation still recommended.** Same original 1–5 rubric: 1 seriously ineffective; 2 weak/substantial friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/compelling. No category earns 5 merely because its regression checks pass.

| Category | Original | Re-score | Evidence / remaining limitation |
|---|---:|---:|---|
| Human effectiveness | 3 | 4 | One customer consequence connects criteria, results, challenge and management action. Prepared judgments remain illustrative. |
| Value proposition | 3 | 4 | Jev’s role, batching and coverage economics are explicit; real pilot economics still need measurement. |
| Information quality | 3 | 4 | Agreed rubric and transparent scores replace technical controls/IDs. Some scoring explanation still needs attentive reading. |
| Ease of use | 2 | 4 | One forward action, visible essential outcomes, evidence-first mobile flow and useful public handoff. Longer chapters still require scrolling. |
| Visual quality | 4 | 4 | Existing IPI system preserved; short rubric and score comparisons replace editor/table stacks. Mobile results stack vertically. |
| Trust / credibility | 4 | 4 | Fictional/no-live boundary, original AI immutability, confidence caveat, exact example counts and cost exclusions. No production revalidation claimed. |
| User-facing cleanliness | 2 | 4 | Raw IDs/types/statuses and architecture copy removed from pitch surfaces. Optional prototype evidence includes vendor references. |
| Welcome page | 4 | 4 | Strong hero preserved, plain Jev sentence added, guided CTA visible at 390px. Full Welcome remains a long page. |
| Cost calculator | 3 | 4 | Monthly frame, token explanation, dynamic summary, specific limits and small-positive handling. Model component remains only part of pilot cost. |
| Guided demo | 2 | 4 | Five sequential chapters; Next-only route visibly includes both results. No separate result reveal can be bypassed. |
| Showcase/product fit | 2 | 4 | Disconnected sample Conversations handoff; authenticated Overview retained. Actual product authoring remains more detailed than the pitch. |

Unweighted average: **44 / 11 = 4.00 / 5**. All requested minimum categories reach 4 under the unchanged scale.

First five seconds: the headline and working-prototype label establish the problem. First thirty seconds: predefined answers, inspectable scores and human challenge give Jev and AQM separate roles. First guided action reaches Jamie’s conversation without operational health. The first concrete uncertainty is “later”, not a service status. This is a repeated agent assessment after implementation, not a new blind first-impression study or recruited-user comprehension measurement.

Self-guided route: chapter links, direct links/refresh, history, example investigation and pilot navigation are exercised. Ordinary progression carries all essential evidence. Optional future-answer-scale/audit/options disclosures do not carry prerequisites. Remaining noticeable friction is mobile scrolling in scoring/comparison chapters; no remaining blocking unaided story lesson was observed.

Keyboard, reduced motion and resizing are tested. The heading receives focus after chapter changes. Navigation controls have ≥44px height and appear after chapter evidence; the mobile rail does not consume the first screen. Sampled contrast checks and settled screenshots supplement semantic-token assertions. This is pragmatic accessibility inspection, not certification.

## Validation and evidence

Evidence is saved separately in [showcase-human-pass-evidence](showcase-human-pass-evidence/README.md). The original review is preserved byte-for-byte as a reference copy and remains unchanged on its original branch. Adapted review/extra harnesses retain the original viewports, public core inspections, calculator scenarios, keyboard/contrast/resize checks and 260 seconds of imposed explanation dwell; obsolete chapter selectors reflect the five-chapter route.

The clean sequential route, five-minute presenter simulation, self-guided links, keyboard journey and strict network/storage isolation are distinct checks. Public core exploration intentionally happens only after the explicit handoff and may initialize product storage. No showcase storage writes or provider/API/notification requests are permitted.

Validation totals, timed result and publication identity are recorded below after completed checks. Failures during harness development (sandbox loopback restrictions, stale old chapter expectations and replacement of assets during an early timed run) are excluded from final passing evidence; they were repaired and rerun. Legacy tests assuming the root immediately opens the product are not treated as evidence of a new product regression.

### Completed local results

- Full deterministic suite: **566 tests, 59 files passed**.
- Frontend typecheck/build, server typecheck and server build: **passed**. Server build is validation only; nothing is deployed there.
- Important browser regression run: 106 passed initially; three stale first-use expectations were updated and rerun successfully. **109 of 111 now pass; two pre-existing Overview/root assertions reproduce on unchanged canonical main.** See `browser-regressions.txt`, `browser-first-use.txt` and `baseline-overview.txt`. All nine showcase checks pass, including authenticated-shaped isolation, useful disconnected handoff, lazy-load failure, keyboard/reduced motion and contrast.
- Human-effectiveness harness: **87 checks, 63 captured states, 495 allowed static requests; zero forbidden attempts, page/console errors**. All 30 captured showcase states retain empty local/session/IndexedDB storage and no recorded writes. Product storage initialization happens only after leaving showcase.
- Sampled rendered contrast: minimum **5.36:1**; semantic token checks also pass ≥4.5:1. Mobile width stays 390px after resize; reduced-motion animation is `none`.
- Sequential paced pitch: **261.918 seconds (4:21.9)** with the original 260 seconds of explicit explanation dwell. Welcome/economics 65s; case/rubric/AI/human/management 185s; final pilot 10s. Uses UI Next, not chapter reloads. This is a harness pacing result, not an actual presenter/user measurement. The deployed rerun additionally scrolls through each chapter during dwell, and its final time is saved in `deployed-extra/extra-data.json`.

### Remaining limits

The two reproduced baseline assertions predate this pass: public-root existing-session entry expects Overview, and disconnected-root entry expects Conversation review. Canonical main deliberately routes the untouched public root to Welcome without reading protected product credentials. Explicit live routes and the authenticated About → Open AQM path still pass. No authenticated-core behaviour was changed to resolve these incompatible old assertions.

No production scale, selected digital retrieval, live notification delivery, inference correctness or total operating cost is proven by this review. Actual colleague sessions remain the next human validation step. Reusable Answer Sets remains roadmap only.
