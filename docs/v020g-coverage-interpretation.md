# V0.20G — Coverage interpretation

Canonical base: `5caf352be93f8a8f9477828b63ca85e09be30066` (remote `main`, V0.20A–F). Dedicated worktree `/private/tmp/aqm-v020g-coverage-interpretation`, branch `codex/aqm-v020g-coverage-interpretation`. Frontend presentation only.

## F9 baseline

Before source edits, the canonical frontend was built and captured with the same fictional mixed fixture at 1440×900 and 390×844. **Where coverage was lost** grouped “500 eligible interactions were not selected by the sampling policy.” with 100 lacking content and 50 without a completed evaluation. The final paragraph said sampling was often intentional, but the preceding heading still framed it as lost coverage. [Desktop screenshot](v020g-evidence/before/mixed-1440x900.png), [mobile screenshot](v020g-evidence/before/mixed-390x844.png), [ARIA](v020g-evidence/before/mixed-390x844.aria.yml), [visible text](v020g-evidence/before/mixed-390x844.txt), [2/2 baseline checks](v020g-evidence/baseline-browser.txt). An independent immutable canonical archive rebuild also reproduces the exact base for geometry comparison.

## Policy choice and downstream gaps

`coverageInterpretation()` replaces the flattened `coverageGaps()` in the pure shared presentation authority. Real H3 headings explain **Policy selection** before **Coverage after sampling**. Sampling's difference has its own description, selected/eligible summary and “Sampling can deliberately select only part of the eligible population.” Lower sampling coverage is not labelled failure or loss.

After sampling, unavailable content and incomplete evaluations are described independently, without inventing causes or attributing them to a provider. **Failed evaluation attempts** stays outside the ordered interaction stages with adjacent copy: “Failed evaluation attempts are attempts, not interaction counts. One interaction can have more than one form evaluation attempt.” It is not added to interaction arithmetic.

The four stages remain Eligible → Sampled → Content available → Evaluated. Evaluation coverage and candidate context remain. The observation caveat is unchanged: “Coverage totals count observations across monitoring runs. The same conversation may appear in more than one run.” [Corrected desktop](v020g-evidence/after/mixed-1440x900.png), [mobile](v020g-evidence/after/mixed-390x844.png), [ARIA hierarchy](v020g-evidence/after/mixed-390x844.aria.yml).

## Unchanged numbers

| Measure | Canonical | V0.20G |
|---|---:|---:|
| Candidate | 1,000 | 1,000 |
| Eligible | 1,000 | 1,000 |
| Sampled | 500 | 500 |
| Evaluable | 400 | 400 |
| Evaluated | 350 | 350 |
| Failed evaluation attempts | 75 | 75 |
| Sampling coverage: sampled / eligible | 50% | 50% |
| Content availability: evaluable / sampled | 80% | 80% |
| Sample completion: evaluated / evaluable | 87.5% | 87.5% |
| Evaluation coverage: evaluated / eligible | 35% | 35% |

Captured values, funnel steps and API request counts compare exactly before/after at both baseline sizes ([machine comparison](v020g-evidence/numerical-equality.json), [comparison script](v020g-evidence/numerical-equality.py)). `coverageRate()`, `summarizeCoverage()`, aggregation, run-observation semantics, OverviewSnapshot, Analytics API and backend source are unchanged. Only presentation-specific expectations were adjusted; domain tests remain unchanged.

## Scenarios and goal task

| Scenario | Visible interpretation |
|---|---|
| Intentional 10%: 100 eligible; 10 sampled/content/evaluated | Policy selected 10 of 100 (10%); 90 not selected; sampling may deliberately select a subset; all selected had content and reached evaluation. No alarming “90 lost”. |
| Mixed: 1,000 / 500 / 400 / 350; 75 failed attempts | 500 not selected; 100 selected without usable content; 50 with content without completed evaluation; 75 separate attempts. |
| Full selection: 100 / 100 / 90 / 85 | All eligible selected; 10 without content; 5 without completed evaluation. |
| Full coverage: 100 / 100 / 100 / 100; 0 failed | All eligible selected; all sampled had content; all with content reached evaluation. No zero-difference or negative prose. |
| Zero eligible: 100 candidates; eligible/sample/content/evaluated zero | “No eligible interactions in this scope.” Rates retain null/— semantics, with no percentages or selection-quality conclusion. |
| No monitoring runs | “Coverage will appear after a monitoring policy run.” No invented selection analysis. |
| Inconsistent source stages | Interpretation reports inconsistent counts and suppresses differences; raw metrics remain untouched. Non-finite, negative and non-monotonic stages are covered. Defensive differences use Math.max(0, …). |

The quality leader receives only **“Why weren't all eligible conversations evaluated?”** and opens Overview Coverage details. Visible selection, downstream and attempt evidence support the four mixed-fixture answers above, without a “650 conversations lost” or “sampling policy failed” conclusion. [Goal replay](v020g-evidence/after/goal-task.json). These are scripted agent comprehension checks, not recruited/timed human studies.

## Shared surfaces and preservation of navigation

Analytics Coverage, expanded Overview Coverage details, and Automation/run detail render the same shared funnel and identical interpretation. Overview now enables showGaps inside its existing closed native disclosure; its compact summary and counts remain unchanged. No-run Overview/local Coverage suppresses analysis until run evidence exists. [Overview capture](v020g-evidence/after/overview-390x844.png), [run capture](v020g-evidence/after/run-390x844.png).

Overview first scan remains Attention → At a glance → Quality / Coverage / Review work / Automation health → Quality trend / closed Coverage details. First-scan heading, panel, signal and document geometry and API request counts match the exact canonical base at all four sizes ([comparison](v020g-evidence/first-scan-equality.json)). Opening Coverage details adds zero requests. **Explore coverage →** retains its exact source/date filters and route/query behavior. Existing Analytics exact-filter Back/Forward checks exercise four repeat cycles at each size; no routing changes were made. Ordinary Coverage copy contains neither server nor durable.

## Qualification and scoped scores

Build passes; **691/691 deterministic tests** pass, including ten focused interpretation tests. **28/28 Coverage browser checks** pass, and **17/17 focused regression checks** pass. Zero skips, retries or flaky passes. Viewports: **1440×900, 1920×1080, 390×844, 1440×720**. Semantic headings, stacked mobile layout, no document horizontal overflow, preserved exact metrics/queries, and Tab/Enter Overview → Coverage details → Explore coverage → Analytics Coverage are asserted. Keyboard traces and per-scenario screenshots/text/ARIA are in [evidence](v020g-evidence/).

The initial Coverage suite had four test-harness failures comparing innerText with DOM text; the assertion now compares rendered text. The initial geometry regression compared network counts with the older V0.20E capture; it observed fewer requests, not additional requests. A configurable baseline path and evidence destination now compare the exact V0.20F canonical archive. Both initial logs are retained. Sandbox loopback restrictions required permitted local test execution; no product change was made to address infrastructure.

Unchanged 1–5 rubric: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. Scoped assessments: **Coverage interpretability 4; Information quality 4; Operational usefulness 4; Mobile comprehension 4**. Shared explicit headings, unit distinction, scenario/goal proof and exact metrics support 4; inherited mobile navigation length and scripted qualification limit a 5 claim. No whole-product mean. [Score evidence](v020g-evidence/score-recheck.json).

## Publication and production preservation

Publication uses an immutable archive of the tested source commit. The committed-build, complete gh-pages tree, 12 public files, public browser qualification and read-only production comparison are recorded after publication below. Expected backend remains `aqm-api-v019-e92f2d6`.

No PR, merge, tag, environment-builder-v2 change, backend/API change or Cloud Run deployment. Production domain mutations, live Genesys calls, Jev calls and notifications caused by this work: **0**. The read-only comparison covers all 25 expected collection hashes/counts, actual existing collection inventory, Cloud Run revision/image/config/traffic, service IAM, three provider secrets' metadata/version/IAM, and Scheduler config. No secret payloads or production document contents are saved. Natural Scheduler/health timestamp movement is reported independently.

Next: ChatGPT review/merge.

## Committed publication proof

Tested source: `4a777b7fc2024af598d388f66238eb246c4eb365`. The immutable Git archive rebuild matches the accepted local build byte-for-byte. All **207 build inputs** match the archive; domain/server source has no changes from the canonical base. Pages HEAD: `3c159247b29b6cc34f9668e1b48ed798c442ea18`; complete tree: `82722705ac8fc4fcafabbb84b06c3f8d40497ebb`. Exactly **12/12 files**, with no missing/extra paths, match both the complete gh-pages tree and every public response byte-for-byte. Publication used archive dist with dotfiles included. Subsequent changes add only documentation/evidence. [Committed build](v020g-evidence/committed-build.json), [source verification](v020g-evidence/source-verification.json), [Pages proof](v020g-evidence/pages.json).

The [public frontend](https://simonridd.github.io/Genesys-aqm/) passes **8/8 compact checks**, with no failures, retries, flaky cases or skips. At 1440×900 and 390×844, mixed gaps and intentional 10% sampling show the corrected interpretation; Overview/Analytics/run details match; the goal-only replay and mobile Tab/Enter path pass. Authenticated APIs, identity and provider responses are fictional browser fixtures backed by an in-memory store; only static files come from Pages. [Public case log](v020g-evidence/public-browser.txt), [JSON report](v020g-evidence/public-browser.json), [public captures](v020g-evidence/public/).

## Final read-only preservation

Collection snapshot files completed at **2026-10-04T16:07:01.136045+00:00** and **2026-10-04T16:21:42.382596+00:00**, bracketing implementation, publication and public proof. Runtime snapshots completed at **16:07:09.035947+00:00** and **16:21:49.965825+00:00**. All **25/25 expected collection counts/hashes** match, including Forms, Question Groups, Answer Sets/Families, Policies, Evaluations, Human Reviews and Schedules. Empty collections remain empty. The actual existing **10-collection inventory** also matches exactly. [Read-only comparison](v020g-evidence/preservation.json) and snapshot scripts/files preserve hashes and counts only.

Cloud Run revision/image/config/traffic, service IAM, all three provider secrets' metadata/version/IAM hashes, and Scheduler configuration remain unchanged. **100% traffic still serves `aqm-api-v019-e92f2d6`**. No backend deployment occurred. [Traffic](v020g-evidence/cloud-run-traffic.json), [before runtime](v020g-evidence/before-runtime.json), [after runtime](v020g-evidence/after-runtime.json).

No natural timestamp movement occurred in these snapshots. Scheduler lastAttemptTime remains `2026-10-04T16:00:04.876286Z`, scheduleTime remains `2026-10-04T17:00:04.028877Z`, and status remains empty. Operational-health updateTimes remain `2026-10-04T16:00:08.636565Z` and `2026-10-04T16:00:08.335012Z`; Scheduler health lastSuccessfulTickAt remains `2026-10-04T16:00:08.199Z`. Natural hourly activity outside the window is not classified as a product mutation. **Production domain mutations 0; live Genesys 0; Jev 0; notifications 0.** [Final verification](v020g-evidence/verification.json).

The dedicated branch is pushed for **ChatGPT review/merge**. No PR is opened, no merge or tag is performed, and the dedicated worktree is clean. The final pushed SHA is reported in the handoff; the deployed build remains the exact tested source above.
