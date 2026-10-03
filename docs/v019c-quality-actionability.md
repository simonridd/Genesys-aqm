# V0.19C — Quality insight, coverage and Overview actionability

## Scope and canonical base

Base: `446539b18be301fd3d530aa816342dd88eaf0a6a` (`origin/main`, fetched and verified). Review: `c8f58f1930c94afba0884f675c3faeedcceb8a1c` on `codex/aqm-v019-whole-product-review`. Implementation branch: `codex/aqm-v019c-quality-actionability`; dedicated worktree `/private/tmp/aqm-v019c-quality-actionability`.

The review found that Analytics led with architecture and identifiers (P1), coverage labels and counting units varied (P2), infrastructure preceded quality/review workload (P2), and mechanics preceded quality decisions (P2). This tranche changes frontend presentation only. No domain aggregation, server/API schema, provider behavior, record, policy execution or coverage calculation changes. `environment-builder-v2` was not touched. No PR, merge or release tag.

## Quality-leader mental model

- **Quality:** how evaluated conversations performed.
- **Coverage:** how broadly eligible work was evaluated.
- **Review work:** work requiring human attention.
- **System health:** whether automation supports those outcomes normally.

Quality and review work are outcomes. System health supports them. The quality/coverage distinction appears alongside coverage; confidence is explained separately from accuracy or human agreement.

## Analytics before and after

Before: “SERVER ANALYTICS”, Cloud Run/durable/endpoint prose, a large filter wall, complete-scan metadata before results, raw form references and policy-ID entry. Questions/groups required a form-ID selection before showing results; queue/agent actions only changed filters.

After: “QUALITY ANALYTICS — Understand quality, coverage and where to investigate.” The first view presents a compact cohort summary and evaluation/conversation counts, Change filters, the existing views, quality/critical outcome/review metrics, What stands out, then readable daily quality and distribution. Technical scope is last and closed by default. Cohort dates use human month/year labels while URL/API dates stay exact UTC boundaries.

Primary filters are From/To, Source, Form, Queue and Agent. Policy, Channel and Trigger are advanced. Form names/version labels come from returned byForm evidence or saved published definitions. Stored values remain `<form-id>@<version>`. Policy names come from the bounded existing saved-policy loader; unavailable configuration exposes an explicitly labeled advanced identifier fallback. Names are never invented. Queue/agent inputs offer datalists of observed values while retaining exact existing query semantics and allowing URL-selected values. Options are retained during narrowing within the session; there is no server autocomplete.

Saved AQM analytics and Sample / browser data are separate choices with separate authorities. Source labels use Genesys Cloud, Synthetic and Uploaded. Browser coverage shares the same funnel and ordinary coverage vocabulary. Browser-local storage scope remains explicit.

## What stands out rules

`src/analyticsPresentation.ts` selects observations without aggregating records or changing analytics math. Lowest-average question/group rankings require an exact form reference, a finite non-null score and a positive applicable count. Queue rankings require positive evaluation count and a finite non-null score. Real zero scores remain eligible; null is never treated as zero. Ties resolve by form reference, question/group identity, then name. Versions are never merged.

Observations use “Lowest average … in this cohort” and provide average, form version and applicable-answer/evaluation sample size. Critical failure occurrences are distinct from the proportion of evaluations containing one or more critical question/group failures. No score threshold, causal attribution, population-accuracy or significance claim is introduced. The ordinary view explains that sample sizes vary. Confidence is provider/model confidence for the prepared decision, not human agreement or empirical accuracy. Group human averages/differences show reviewed count and explicitly describe a completed-review sample.

Question investigation preserves exact question/form and cohort. Queue/agent rows and insights open the corresponding exact evaluation cohort directly. Form rows open version-specific questions. A group comparison opens the exact form version; “Inspect form evaluations” explicitly reflects the existing API's lack of a group-only evaluation filter.

## Coverage vocabulary, units and denominators

| Term | Existing meaning |
|---|---|
| Candidates | Interactions considered by the run; secondary context |
| Eligible | Interactions matching policy criteria |
| Sampled | Eligible interactions selected for evaluation |
| Content available | Sampled interactions with usable conversation content/transcript |
| Evaluated | Interactions reaching a completed evaluation |
| Failed evaluations | Failed evaluation attempts, separately displayed |

`CoverageFunnel` is shared by connected Analytics, Overview, connected run detail and browser coverage. It presents Eligible → Sampled → Content available → Evaluated, counts and rates, then failed attempts separately. Existing `coverageRate` and `summarizeCoverage` remain the authority; presentation helpers do not reaggregate records.

| Rate | Denominator | Fictional example |
|---|---|---|
| Sampling coverage | Sampled / eligible | 500 / 1,000 = 50% |
| Evaluation coverage | Evaluated / eligible | 450 / 1,000 = 45% |
| Content availability | Content available / sampled | 460 / 500 = 92% |
| Sample completion | Evaluated / content available | 450 / 460 = 97.8% |

Coverage totals count observations across monitoring runs. The same conversation may appear in more than one run. They are not unique-conversation totals. This is explained once beside the funnel, not on every card. Failed attempts can involve multiple forms per interaction, so they are not asserted to equal funnel gaps.

Where coverage was lost: 500 eligible interactions were intentionally not selected by sampling; 40 sampled interactions had unavailable content; 10 had content but no completed evaluation. These are factual gaps, not blanket errors or “missed conversations.” Candidates (1,250) are secondary context.

Coverage scope is visually separate from quality filters. Date, source and policy affect monitoring runs; form/agent/queue/channel/trigger quality filters do not change the overall run denominators. Coverage queue/agent rows use Eligible, Sampled and Evaluated only; the missing Content available breakdown is stated once. Older runs may lack breakdown evidence. “View evaluated quality” narrows quality without suggesting historical denominator changes. Run detail shows one run (half the fixture totals) with identical rates; that scope difference is recorded in evidence.

## Overview ordering and attention

Before: Attention → Operational health → Quality & coverage → Review workload → Automation → Recent runs.

After: Attention → Quality & coverage → Review workload → Operational health → Automation → Recent runs. Setup guidance and explicit manual/detailed operations follow these primary outcome panels.

Quality attention identifies critical failure occurrences in the selected Overview period and offers Inspect critical evaluations with exact Genesys Cloud/date/critical=yes scope. It is labeled Quality attention, separately from review/system issues, and does not represent a system outage or invented score threshold. Existing errors/warnings/overdue/escalated/failed-notification evidence and working actions remain.

Quality begins with average, evaluated conversations/evaluations, pass rate and critical failure occurrences, then coverage. Review workload retains Open, Due soon, Overdue, Escalated, Unassigned, My review queue for reviewers and All review work. Health retains Automation, Genesys, Jev, Scheduler, Notifications and Review SLA; API/Firestore/durable evidence and scheduler diagnostics are under closed System details. Automated-run and upcoming-work controls remain. Overview-to-Analytics explicitly replaces stale quality filters with the displayed source/period.

## Technical disclosure audit

| Ordinary flow | Preserved disclosure |
|---|---|
| Quality purpose, named form/version, selected policy name | Complete API aggregation, records/runs scanned, size limits |
| Question/group title and exact human form/version | formRef, questionId, groupId and raw filter references |
| Quality analytics could not be loaded; Retry | Exact technical error |
| Overview could not be loaded; retained last snapshot | Exact technical error and incomplete-section reasons |
| Outcome-oriented operational health summary | API, Firestore, scheduler tick and durable evidence |
| Canonical run coverage funnel | Run IDs, timestamps, selected interaction IDs and failure diagnostics |

Technical evidence was retained, not deleted. Existing explicit operational/manual-run disclosures retain provider request ceilings and execution proof. Public Welcome/demo and the five-chapter pitch source remain unchanged.

## Task and drill-through evidence

The authenticated fictional dataset contains 12 evaluations, two queues, two agents, published v17/v18 snapshots, multiple questions, critical failures, reviewed/requested evaluations, schedules and two runs with sampling/content gaps/failed attempts. OAuth/identity responses are intercepted; provider-shaped traffic is blocked. All AQM fixture requests are fulfilled locally. No production mutations or real providers are needed.

Goal-only scripted replay: Overview → visible Average quality action → What stands out → lowest-average question → Inspect evaluations → evaluation detail → Back to Analytics. Two actions reach supporting evaluations; three reach detail; zero wrong turns. Conclusion: Customer Service v17 · Clear next step, 33.3% average, eight applicable answers. Exact cohort: Genesys Cloud, 2 September–2 October 2026, `general_service@17`, question `understanding`; eight evaluations. The explicit selected-period task uses 1–30 September, also eight evaluations. Claims is the lowest-average queue at 50%, six evaluations; its drill preserves dates/source and applies exact queue.

This is an automated agent replay based on visible labels, not recruited-human research or an independent human study. No statistical inference is drawn from fixture scores. See [goal-only task](v019c-evidence/goal-only-task.json), [quality task](v019c-evidence/quality-task-1440.json) and [coverage interpretation](v019c-evidence/coverage-interpretation-1440.json).

V0.18B regression asserts every original date/source/policy/form/agent/queue/channel/trigger filter, exact question, URL reload, stale-selector clearing and Back to Analytics context. V0.19A covers draft continuity/evidence return, My Reviews completion and queue reconciliation. V0.19B covers compact editing, human Answer Set terms, group insertion, save authority and advanced-details round trips. Backend/shared-domain/pitch sources are unchanged.

## Responsive and accessibility proof

Captures at 1440×900, 1920×1080 and 390×844 cover attention, quality/coverage, review workload, health, Analytics overview, observations, questions/groups/forms/queues, coverage/breakdowns, run detail and exact evaluation drills. Page overflow assertions pass. Tables keep their existing bounded horizontal scrolling; the mobile tab strip is unchanged and deferred.

The purpose/cohort precede technical scope. Desktop shows quality metrics and the actionable question observation above the fold; mobile shows purpose/cohort/headlines before observations during ordinary scrolling. Daily bars expose date, average and exact evaluation count; fewer than three scored days show Limited history in this period. No chart dependency was added. Visual inspection caught and corrected an existing CSS classname collision in the new review-state card before final proof.

Real buttons, meaningful names, status/error announcements, selected-view aria-pressed, keyboard Enter drills and exact return assertions are retained/improved. Dedicated final keyboard checks traverse controls using Tab and Enter at all three sizes. This is Chromium viewport emulation, not native-device, screen-reader or cross-browser certification.

## Validation, scoped score recheck, deployment and preservation

Final run details and immutable source/Pages SHAs are recorded below after committed-build and production preservation verification.

The whole-product review's scale is unchanged: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. Scores apply only to this tranche's surfaces, not the whole product.

| Measure | Before | Scoped after | Evidence / reason below 5 |
|---|---:|---:|---|
| Information quality | 3 | 4 | Explicit units, rates, version/sample evidence. Missing old-run breakdowns remain. |
| User-facing cleanliness | 2 | 4 | Outcome heading, named filters, closed provenance. Wider product header/navigation copy remains. |
| Operational usefulness | 3 | 4 | Quality/review first, exact investigation actions. Existing bounded API capacity remains. |
| Ease of use | 3 | 4 | Two-action Overview-to-evidence task; return context. Mobile tab overflow remains. |
| Analytics actionability | — | 4 | Deterministic observations and direct exact drills; no population-significance inference. |
| Coverage comprehension | — | 4 | Shared funnel, four denominators, failed attempts separate, run-observation boundary. Scope limitations explicit. |
| Overview prioritization | — | 4 | Attention → quality/coverage → review → health, proven DOM/visual order. Exception-heavy periods can still make attention taller. |

No whole-product 4/5 claim. Scores are evidence-based agent judgments on fictional tasks, not user-research measurements.

## Deferred to V0.19D

Role-focused primary navigation; mobile analytics-tab overflow treatment; primary-nav aria-current; broader navigation/accessibility consolidation. Next: ChatGPT review/merge, then V0.19D, then a fresh thorough whole-product Playwright review. No PR was created/opened here.

## Final validation record

- Production frontend build passes; no new dependency.
- Deterministic suite: **614 passed, 64 files**. Initial sandbox run hit local socket EPERM; retained separately and rerun with local socket permission.
- Focused V0.19C Playwright: **12 passed**, including three viewport task/coverage replays, error/retry/empty/name fallback, goal-only replay, stale Overview scope replacement and three Tab-only journeys. Earlier harness mistakes and the discovered visual collision are retained in development logs; final captures replace them.
- Existing regression matrix: **111 passed, 2 baseline failures, 113 total**, zero skipped/flaky. All V0.19A/V0.19B/V0.18B, Answer Set, save-protection, form-composition and pitch checks pass. Fifteen Overview range/role/attention/drill tests pass. The two legacy Overview failures are the same ones documented in the original whole-product review: development-only `/src/main.tsx` session injection cannot initialize an already-connected session in hashed production bundles; a bare-root expectation still asks for Conversation review where Welcome intentionally renders. Neither test is suppressed or rewritten to green. Presentation-specific selectors/labels were updated while preserving exact data/filter assertions.
- Regression matrix ran before the final date-summary/style isolation and safe browser-question-ranking refinement; the final focused and deterministic runs verify those changes. Deployed fixture regression checks below verify the committed frontend again.
- Scope scores are **4/5** for information quality, cleanliness, operational usefulness, ease of use, Analytics actionability, coverage comprehension and Overview prioritization, on the unchanged rubric. These are scoped agent judgments only.

## Deployment and preservation result

Tested committed source: `c7bc77b40be5ab2b44a2139c1d2196fe7067e850`. An immutable `git archive` rebuilt successfully and produced exactly the same 12 files/bytes as the tested frontend. Every frontend input matches that commit. Server, shared domain/provider, package/dependency, public/pitch source and production environment configuration are unchanged from the canonical base.

Pages HEAD: `13d3a49ba48c6bb38f3d8a38553e10e7f963c9a6`, commit message pins the tested source. All 12 public files and the complete Pages Git tree match the tested committed build byte-for-byte. Published at <https://simonridd.github.io/Genesys-aqm/>. Cloud Run remains **`aqm-api-v019-e92f2d6`**; it was not redeployed. No server source changed.

Read-only preservation: 24/25 collection hashes match. All required domain collections match: seven production forms, four Question Groups, zero Answer Set assets/families, seven policies, eight evaluation records, zero Human Reviews and one schedule. These counts describe the existing production dataset, not the fictional proof fixture. Configuration/image/revision/IAM/secret metadata, versions and IAM/Scheduler configuration hashes match. No production configuration/evaluation/review writes, real Genesys/Jev requests or notifications were performed.

The only observed collection change is `operationalHealth`, with two documents retaining their count and moving during the natural hourly Scheduler tick. Exact UTC movement:

| Runtime observation | Before | After |
|---|---|---|
| Scheduler lastAttemptTime | 2026-10-03T18:00:04.825057Z | 2026-10-03T19:00:04.827214Z |
| Scheduler scheduleTime | 2026-10-03T19:00:04.028877Z | 2026-10-03T20:00:04.028877Z |
| Health lastSuccessfulTickAt | 2026-10-03T18:00:08.336Z | 2026-10-03T19:00:07.506Z |
| Health document updateTime (first sorted document) | 2026-10-03T18:00:08.807204Z | 2026-10-03T19:00:07.934302Z |
| Health document updateTime (scheduler document) | 2026-10-03T18:00:08.455164Z | 2026-10-03T19:00:07.643934Z |

Scheduler status remains `{}`; scheduleExecutionClaims and all domain records are unchanged. The timing is consistent with the existing hourly runtime; the agent made only read calls for this proof. See [preservation comparison](v019c-evidence/preservation.json) and [public byte proof](v019c-evidence/pages.json).

The final branch evidence commit may follow the tested source commit with documentation/captures only. It does not alter frontend inputs or deployed bytes. No PR, merge or release tag is created by this tranche.

## Deployed committed-build recheck

**108/108 passed, zero skipped/flaky**, against the public Pages build using intercepted fictional APIs: all 12 quality/coverage/keyboard checks, V0.18B investigation return, V0.19A continuity/completion/reconciliation, V0.19B compact authoring/Answer Set/group/save authority, save protection, composition and unchanged pitch. This suite intentionally covers the connected and public journeys on the deployed artifact; the separate local Overview matrix retains its two documented legacy failures. These are overlapping verification runs, not additive counts of independent scenarios. See [public result](v019c-evidence/public-results.json) and [log](v019c-evidence/public-playwright.txt).

Final source invariance confirms the branch changes after the tested source are documentation/evidence only. The dedicated worktree is committed and pushed with no PR, merge or release tag.
