# V0.18B — Trustworthy investigation links and cohort continuity

This tranche closes **R03 and R04** from the V0.18 product review. The dedicated `codex/aqm-v0-18b-investigation-links` worktree starts from `origin/main` at **337006833293115add9dccb531358aa4cac36116**. R05+, V0.18C/D/E, environment-builder-v2, PR creation/merging and a v0.18.0 release are outside this work.

## R03 — Analytics cohort continuity

Server Analytics now reads and writes all nine cohort dimensions in the URL: `from`, `to`, `source`, `policy`, `form`, `agent`, `queue`, `channel`, and `mode`. The selected Analytics tab is also restored. After authentication completes, Analytics selects its server dataset so a bookmarked server cohort can be restored even when the component mounted before the in-memory session was established.

Form selection retains `id@version`; question exploration passes the row's exact `formRef`, never stripping its version. A Greeting/Warm opening result in `general_service@17` cannot include the same-ID question from v18.

Before (September, Customer care, v17 Analytics result):

```text
?page=evaluations&form=general_service&question=greeting
```

After (URL order shown for readability):

```text
?page=evaluations&evaluationSource=server
&form=general_service%4017&question=greeting
&from=2026-09-01&to=2026-09-30
&source=genesys-cloud&policy=daily_voice
&agent=Fixture+Agent&queue=Customer+care&channel=voice&mode=scheduled
&cohort=analytics&origin=analytics
&analytics.from=2026-09-01&analytics.to=2026-09-30
&analytics.source=genesys-cloud&analytics.policy=daily_voice
&analytics.form=general_service%4017&analytics.agent=Fixture+Agent
&analytics.queue=Customer+care&analytics.channel=voice&analytics.mode=scheduled
&analytics.tab=questions
```

`cohort=analytics` explicitly reproduces existing Analytics predicates: Jev production records, exact agent-name and queue equality, and answered/non-skipped question membership. This is necessary because the existing Explorer question filter means **question failures**, and its normal agent/queue controls use text matching. Passing answers are counted by Analytics and must appear in its investigation. Ordinary Explorer failure searches and Calibration's text-match/disagreement semantics remain available. No Analytics aggregate or taxonomy was added.

**Back to Analytics** restores the original nine filters and tab from named `analytics.*` parameters, including the original form selection if the question supplied a narrower exact version. Removing/changing investigation filters does not overwrite return context. `origin`, Analytics tab/search state and return parameters never enter `/api/evaluations` requests.

Channel is additive throughout Explorer state, URL, request dependencies, server and browser matching, and scope display. It compares the stored channel string directly; voice, email, messaging, future stored channels and arbitrary unmatched values are covered without an allowlist.

Date inputs remain date-only URL/UI state. API requests use inclusive UTC boundaries `2026-09-01T00:00:00.000Z` and `2026-09-30T23:59:59.999Z`. Tests include both exact endpoints and records one millisecond outside them.

## R04 — Overview review workload

| Link | Replacement filters | Fixture source count = destination count |
|---|---|---:|
| Open / All review work | `reviewQueue=active` | 7 |
| Unassigned | `reviewStatus=REVIEW_REQUESTED&assignment=unassigned` | 1 |
| Due soon | `dueState=DUE_SOON` | 1 |
| Overdue | `due=overdue&dueState=OVERDUE` | 1 |
| Escalated | `dueState=ESCALATED` | 1 |
| My review queue | `reviewQueue=mine&assignment=mine` | 5 |

Active means **HumanReview REVIEW_REQUESTED or IN_REVIEW**, regardless of assignment. NOT_REVIEWED and REVIEWED are excluded. Overview Unassigned now uses the already-calculated workload `unassignedRequested` value; its former unassigned `assignedOpen` bucket included unassigned IN_REVIEW work. The fixture deliberately includes that case, as well as assigned requested reviews, two completed reviews with historical due dates, unreviewed records, all three due stages and on-track work.

Before Open/All review work: `?page=evaluations&evaluationSource=server` (all production evaluations). After: `?page=evaluations&evaluationSource=server&reviewQueue=active`.

Before Unassigned: `?page=evaluations&evaluationSource=server&assignment=unassigned` (included other statuses). After: `?page=evaluations&evaluationSource=server&reviewStatus=REVIEW_REQUESTED&assignment=unassigned`.

The existing overdue pair is retained. A resulting-record test proves `dueState=OVERDUE` and the pair are equivalent for the fixture. Due and SLA calculations were not redesigned. Mine still uses the authenticated server actor, excludes other assignments and completed/unreviewed records, and cannot be redirected using a supplied `assigneeId`.

## Shared navigation and visible scope

`evaluationExploreUrl` uses the one canonical `evaluationFilterKeys` clearing list, including channel and the explicit Analytics cohort predicate. Overview, Analytics, Calibration, Overview alert/detail links and Explorer workload shortcuts all use it. Each new investigation replaces stale status, assignment, SLA, critical/outcome, question/comparison, table search and evaluation-detail selectors. Only supported supplied filter keys are applied. Operational detail selectors (`runId`, `policyId`, `alertId`) are removed; unrelated existing page UI state is retained intentionally. The old Overview helper name is only an alias, not another implementation.

An **Investigating** panel displays readable labels where records supply them, with safely escaped raw values otherwise. Each scope chip can be removed; **Clear investigation filters** resets cohort/search/detail state and refreshes the normal Explorer. Active reviews is a visible removable scope. Workload shortcuts replace previous scopes rather than intersecting with them. Accessible chip names identify the removal action without overriding the labels of existing form controls.

Calibration retains its own exact form, reviewQuestion, comparison, REVIEWED, source, agent, queue and dates while clearing unrelated Analytics/review operations state. Direct evaluation details remain fetched by ID regardless of list filters; Overview alert links clear stale cohorts before opening the detail.

`matchesEvaluationFilters` centralizes Explorer server/browser predicates on top of the existing review predicates. The normal server scan remains bounded to **500 records per request window** with cursor continuation and explicit `scanLimited` warning. Mine retains its existing complete active-review queue scan and 2,000 ceiling. A regression puts matches beyond the first 500 records and verifies the warning and subsequent-page result. Complete Overview totals must not be interpreted as proof that a scan-limited Explorer page is complete.

## Validation and deployment

Deterministic suite: **56 files, 547 tests passed**, including 13 new navigation/real-HTTP tests. Frontend TypeScript/build, server typecheck and all four backend bundles pass. The existing Vite large-chunk advisory remains.

Nine new fixture-only browser journeys cover Analytics version/cohort/URL/date requests, chips/removal/clear, return and authenticated URL reload, browser channel filtering, all Overview review count links, All review work, both workload shortcuts, My queue, direct review detail and Calibration disagreements at **1440×900, 1920×1080 and 390×844**. They pass against development and the production preview. **29 existing browser regressions** for Overview (all roles), review operations, review SLA and Calibration also pass. External requests are blocked except explicit fictional OAuth and API responses; unexpected writes fail the new journeys. Screenshots are inspected at each width. No R09 layout restructuring was performed.

## Deployment and preservation

Tested/deployed application source: **11e8e36ebcc00a079a0e5dc3663d261def5c400f**. Cloud Run revision: **aqm-api-v018b-11e8e36**, ready and serving 100% of traffic. Image: **europe-west2-docker.pkg.dev/genesys-aqm-2026/cloud-run-source-deploy/aqm-api@sha256:1e7c2eadb653da699479b09314a546138d8cbe65bd20da95ee2b3fdb5e34a9e5**. Deployment used a Git archive of that commit; every archived source/package/Dockerfile byte matches the commit. Existing runtime/IAM/environment/secret references and Scheduler settings were preserved, rather than reapplied by the bootstrap deployment script. Read-only checks return `/health` 200 and anonymous filtered evaluation requests 401. [Deployment proof](v018b-evidence/deployment.json).

GitHub Pages HEAD: **699eeff6714d7bc23180d9e0087fcbd0b0851139**. All **seven published files** match the exact production-preview build byte-for-byte. [Public site](https://simonridd.github.io/Genesys-aqm/), [Pages proof](v018b-evidence/pages.json).

[Preservation comparison](v018b-evidence/preservation.json): **23/23 production collection counts and hashes match**, including evaluations, HumanReviews, policies, schedules/claims, forms, reusable groups, alerts, notifications, roles, Governance, runs, Form Tests, audit, operational state and scheduler state. Cloud Run runtime configuration (excluding the expected image/revision change), service IAM, Secret Manager metadata/immutable version lists/IAM, Scheduler configuration and runtime state all match. **No natural scheduler differences occurred in the comparison window.** No production data mutation, provider request, paid Jev call or production review change was initiated.

Only the dedicated source branch and the explicitly requested existing `gh-pages` publication branch were pushed. Main remains **337006833293115add9dccb531358aa4cac36116**. No PR, merge or v0.18.0 tag was created. The initial Cloud Run automatic approval rejection was resolved by verifying the deployed target against the repository configuration and the user's explicit deployment instruction before retrying.

[Evidence and reproduction instructions](v018b-evidence/README.md). R03/R04 are closed by this tranche. **R05+ and V0.18C/D/E remain untouched.**
