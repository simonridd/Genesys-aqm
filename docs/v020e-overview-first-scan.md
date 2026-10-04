# V0.20E — Overview first-scan hierarchy

Implemented and locally accepted source: `03a8afb1e792ac8c1ac1b05773639b30f0fb6ab9`, on `codex/aqm-v020e-overview-first-scan`. Canonical base: `b295506795114eca85b9d7eb3a6e7c3aa969bbd5`. This completion adds documentation and final public evidence only; frontend source inputs remain identical to the accepted implementation.

## Problem and hierarchy

Canonical F8: a quality leader could not quickly answer what needs attention, how quality and coverage look, how much review work is open, and whether automation is healthy. The old order was Attention required → Quality & coverage (including trend and full coverage funnel) → Review workload → Operational health → Automation → Recent runs. Trend and funnel depth pushed current review and health signals below the first desktop viewport.

Attention remains first. **At a glance** follows, with four summaries in DOM and visual order:

- **Quality:** average quality, evaluated conversations, evaluations, pass rate and critical failure occurrences, with existing investigations and Explore quality. Scope: Dashboard range.
- **Coverage:** evaluation coverage, eligible, sampled, content available, evaluated, failed evaluation attempts and sampling coverage, plus Explore coverage. Scope: Dashboard range. Quality describes evaluated conversations; coverage exposes the denominator and evaluation reach.
- **Review work:** open, due soon, overdue, escalated and unassigned counts; My review queue when permitted and All review work. Scope: Current state.
- **Automation health:** Automation, Genesys, Jev, Scheduler, Notifications and Review SLA labels preserve their separate meanings. Scope: Current state. Closed System details retains API/Firestore health, last Scheduler tick, durable provider evidence and notification delivery evidence.

**Quality trend** follows the summaries, retaining limited-history and empty-history copy. **Coverage details** is initially closed, with actual stage counts in its summary; expansion preserves the full funnel, Candidates evidence, failed attempts, observational caveat and Explore coverage. Automation, recent runs, setup and lower operational disclosures remain available. No duplicate top-level Review workload or Operational health panels remain.

The baseline five-alert Attention block was 530px tall at 1440×900 and put the Quality heading at y=818.59. Compaction keeps the first two ranked alerts and View all active alerts; error/warning totals, critical investigation, overdue/escalated actions and failed notification counts remain. Attention is now 346px tall on desktop. Alert semantics and destinations are unchanged.

## Partial data and exact drills

Analytics unavailable displays Unavailable in Quality and Coverage while Review work and Health remain usable. Reviews unavailable preserves Quality/Coverage and shows no fabricated review counts; Review SLA also reports Unavailable. Successful empty analytics displays zero evaluations and coverage stage counts, and No quality history, without claiming Unavailable. A complete healthy snapshot displays All clear. Failed refresh retains the last successful snapshot and its stale message.

Existing destinations and query semantics are preserved: Open/All review work use the active queue; Due soon, Overdue and Escalated retain their SLA stages; Unassigned retains requested/unassigned filters; My review queue retains mine/mine. Evaluation and critical drills retain `source=genesys-cloud` and exact Dashboard from/to dates, with `critical=yes` for critical investigations. Quality/Coverage exploration retains its tab and range. Linked review/run alerts, unlinked alert management and run actions retain their existing destinations. Overview's existing non-durable dashboard context remains outside V0.20D history scope.

`GET /api/overview`, OverviewSnapshot, aggregation, backend metrics/contracts, permissions, schedules, notifications, health interpretation and range state are unchanged. Request counts match the exact base at all four locally qualified sizes; disclosure expansion adds no requests and changing range makes one Overview request. No per-card polling or new combined health score was introduced.

## Geometry, goal task and accessibility

Measurements use the same explicit fictional fixture on the exact canonical base and accepted implementation. Distances below are from the Overview H1 to the summary heading.

| Viewport / measure | Baseline px | V0.20E px | Reduction |
|---|---:|---:|---:|
| 1440×900: Review work distance | 1487.50 | 560.59 | 62.3% |
| 1440×900: Automation health distance | 1727.69 | 560.59 | 67.6% |
| 390×844: Review work distance | 2164.20 | 1453.27 | 32.8% |
| 390×844: Automation health distance | 2564.20 | 1790.02 | 30.2% |
| 1440×900: document height | 3288 | 2517 | 23.4% |
| 390×844: document height | 4998 | 4558 | 8.8% |

At 1440×900 all four summary headings are at y=690.59 and all four primary signals finish within the first viewport; trend begins at y=1112.12. At 1920×1080 the whole At-a-glance region is visible (bottom=1063.13). At 1440×720 the headings are visible and supporting signals need a short scroll. At 390×844 the readable single-column summaries precede trend/full funnel, with no horizontal page overflow and Coverage details closed initially. Existing mobile navigation/header account for 434.52px before H1.

Goal-only replay: “Tell me what needs attention, how quality and coverage look, how much review work is open, and whether the automation is healthy.” The fixture exposed 79% quality, 8 evaluations, 20/10/6/4 coverage stages, 20% evaluation coverage, 7 open reviews and Automation Attention with mixed underlying states. All five answers required zero clicks, wrong turns or disclosure openings; 1920 needed no scroll, 1440 used one short scroll for supporting contents, and mobile used ordinary vertical scrolling. This is a scripted visible-label replay, not an independent or timed human study. Keyboard-only Tab/Enter reaches investigation, quality, review, Coverage details and manual Automation without a trap. Numeric drill accessible names include metric labels. Responsive resizing retains four summaries and range.

See [measurements](v020e-evidence/measurements.json), before/after captures, goal traces and keyboard traces in [the evidence directory](v020e-evidence/). [Accepted qualification](v020e-evidence/verification.txt) describes the fixture and retained contracts without duplicating its full logs here.

## Qualification and known test debt

Reuse the accepted local evidence: build pass, **677 deterministic tests**, **62 focused browser checks**, geometry, unavailable/zero/healthy states, keyboard/accessibility and V0.20B/C/D regression smokes. The completion does not rerun that full local qualification because source is unchanged. The immutable archive rebuild is solely for deployment/byte proof.

One legacy `review-sla.spec.ts` mobile assertion fails identically on the exact canonical base: it expects conversation-ID text from the old review table. It remains documented and is neither fixed nor counted as a passing check. The **current mobile priority-card/focused-review smoke passes**, locally and in the focused public completion suite. See [exact-base characterization](v020e-evidence/base-review-sla-characterization.txt) and [accepted smoke evidence](v020e-evidence/regression-smokes-initial-run.txt).

## Public deployment and preservation

Tested committed source: `03a8afb1e792ac8c1ac1b05773639b30f0fb6ab9`. An immutable Git archive rebuild matches the accepted local build byte-for-byte. Pages HEAD: `5e455ecf61f992c95a66f8b4da3c156907b106dd`; tree: `2e1bbd50ce763a23a4c423e30df3b4d5b299fd10`. All **12/12 public files** and the **complete gh-pages tree** match that build, with no extra/missing tree entries or unexpected build-input differences. Deployment used the immutable archive dist, with dotfiles included; no uncommitted working tree was deployed. See [source verification](v020e-evidence/source-verification.json), [committed build](v020e-evidence/committed-build.json) and [public byte/tree proof](v020e-evidence/pages.json).

The real [public frontend](https://simonridd.github.io/Genesys-aqm/) passes **11/11 focused checks**, with zero failures, flaky cases or skips: first-scan geometry at **1440×900**, **1920×1080** and **390×844**; exact Review work, Quality and critical drills; Coverage details and unchanged disclosure request count; independent analytics/reviews unavailable; successful zero/healthy state; current mobile priority cards and focused review. All authenticated identity/API responses are fictional browser fixtures or the local in-memory fixture server; only static assets come from Pages. The compact suite reuses accepted fixtures and does not repeat full local regressions. See [public results](v020e-evidence/public-browser.json), [case log](v020e-evidence/public-browser.txt), [suite](v020e-evidence/public-overview.spec.ts) and [viewport captures/geometry](v020e-evidence/public/). The initial sandbox invocation could not launch Chromium; the permitted launch completed these checks without a product change ([infrastructure note](v020e-evidence/public-browser-infrastructure.txt)).

Read-only before/after snapshots bracket publication and public qualification. **25/25 production collection hashes and counts match**, including Forms, Question Groups, Answer Sets/Families, Policies, Evaluations, Human Reviews, Schedules, runs, governance, audit, operational alerts/health, execution claims/slots and notification collections. Runtime image/revision/configuration/traffic, service IAM, all three provider secret metadata/version/IAM hashes and Scheduler configuration are unchanged. **Cloud Run still serves 100% traffic on `aqm-api-v019-e92f2d6`**, with no backend deployment. Secret payloads and production document contents were not saved.

No natural timestamp movement occurred within these snapshots. The two operational-health document updateTimes remain `2026-10-04T13:00:08.530117Z` and `2026-10-04T13:00:08.220482Z`; the Scheduler health lastSuccessfulTickAt remains `2026-10-04T13:00:08.097Z`. Scheduler lastAttemptTime remains `2026-10-04T13:00:04.828982Z`, scheduleTime remains `2026-10-04T14:00:04.028877Z`, and status remains empty. Natural hourly movement outside this window is not classified as a product mutation. **Production domain mutations 0; live Genesys 0; Jev 0; notifications 0.** See [preservation comparison](v020e-evidence/preservation.json), before/after snapshot files and [Cloud Run traffic](v020e-evidence/cloud-run-traffic.json).

Final delivery changes are documentation, roadmap and evidence only. No PR, merge, tag, Cloud Run deployment or environment-builder-v2 modification. Next: ChatGPT final review/merge.
