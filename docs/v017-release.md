# V0.17 release evidence — 2 October 2026

## RELEASE

Verified `origin/main` exactly **44816f9985ab5ce37fb69a1116181af67666d5d0**, the accepted V0.16 release state. Both local and remote `v0.16.0` were absent. Created and pushed annotated **v0.16.0**, annotation “Genesys AQM V0.16.0 — Review SLA, reminders and escalation”. Remote tag object **ffa2d9117c54e21a7a138a61095df50672c3cbb0** peels to that exact canonical commit.

Dedicated worktree `.worktrees/aqm-v0-17`, branch **codex/aqm-v0-17-operational-overview**, created from origin/main after tagging. Tested application source **7d4b401ee1508e25db47723c24acb2d806ab754e** was committed and pushed. This release report and machine-readable deployment proofs are a subsequent documentation-only commit. Main remains at the canonical V0.16 SHA. No PR was created or merged. environment-builder-v2 was not modified.

## OVERVIEW

The existing automation surface is now the operational home, **Overview**. `GET /api/overview?range=7|30` returns a bounded, safe server snapshot with generatedAt and independent section completeness/error states. Quality, coverage, trend and run outcomes use one rolling 7-day window by default, or 30 days. Current health, alerts, reviews, schedules, notifications and recent history are independent of that window.

Existing analytics and review protections remain: 2,000 evaluations/reviews/roles and 500 runs. Guard breaches remove aggregate values and render **Data incomplete**, with indexed aggregation required. Unavailable sections render **Unavailable**, without silently substituting zero. Complete empty sections deliberately show zero-state messaging. Matching request-local reads are shared, and independent work runs in parallel. No new aggregate collection, migration or index was created.

Freshness shows Updated time in Europe/London and explicit Refresh. No dashboard refresh timer is installed. A failed refresh retains the last successful snapshot with a visible stale message. Range changes suppress superseded responses. Detailed operations can fail without blocking Overview. Manual policy/period/preview and run selection/details survive refresh.

[Detailed contract and navigation semantics](v017-overview.md).

## HEALTH

- Automation uses active errors/warnings, durable run outcome and dependency/scheduler evidence to show Healthy, Attention or Unverified.
- Genesys and Jev show Verified, Error or Unverified from the existing durable run evidence; no live provider verification is performed by the snapshot.
- Scheduler uses authenticated successful tick freshness, including ticks with no due work, and shows Healthy, Stale or Unverified.
- Notifications show Healthy, Failed deliveries or Pending, with pending count, failures over 24h and last successful delivery. No configuration or secret references are returned.
- Review SLA shows Healthy, Due soon, Overdue or Escalated using current server governance thresholds and open workload.
- API and Firestore evidence remain explainable. There is no combined health score.

Standard browser authentication still performs the existing Genesys `/users/me` identity check. Snapshot aggregation and range selection invoke no Genesys conversation/evaluation providers, Jev or notification transports. The snapshot service has no provider dependency. Monitoring and alert GET routes now read state without opening alerts or initializing scheduler health; the existing authenticated scheduler owns that lifecycle.

## QUALITY & COVERAGE

Authoritative quality includes evaluation and distinct-conversation counts, average score, pass rate, critical failures and by-day trend. Limited history is labelled; empty history is explicit. Critical failures drill into real server evaluations. Coverage retains established eligible, sampled, content-available, evaluated and failed definitions and sampled/eligible and evaluated/eligible percentages. Coverage remains run observations, not distinct interactions across runs. No loaded-page headline numbers remain, and no production Overview metrics come from browser-local demo history.

A provider-free read-only projection of the captured production baseline returned complete 7- and 30-day sections: **8 evaluations, 6 conversations, average quality 30.1%, pass rate 0%, 5 critical failures** in the seven-day window. These are the existing stored results, not new evaluations. [Baseline snapshot proof](v017-evidence/baseline-overview.json) is explicitly labelled as a projection of captured production data, not an authenticated live API response.

## REVIEWS

Overview shows only open, dueSoon, overdue, escalated and unassigned totals. Full reviewer workload management remains in Evaluations. My review queue is prominent for users with reviews.write; other roles receive the workload drill-through. Exact SLA-stage links use `dueState=DUE_SOON|OVERDUE|ESCALATED`; the overdue link also uses `due=overdue`. Matching honors server governance thresholds, and completed reviews are excluded. Critical, SLA and My queue links clear stale evaluation selection/filter state. Review SLA alerts open the associated evaluation/review.

## AUTOMATION

Five enabled upcoming schedules are ordered by nextDueAt, with policy, frequency, next due and last success. Disabled policies/schedules and manual schedules do not appear. Five recent runs show start, policy, trigger, successful/failed evaluations and status; selection opens existing run detail. Latest successful scheduled execution is visible even if outside the recent twenty, using the complete bounded run scan.

Manual **Run a policy now** is below the summaries in a disclosure. Existing Plan → Preview → Confirm → Execute and plan fingerprint semantics remain. Write permission is required, and refresh does not discard a preview. Full alert management and the detailed run table are in another lower disclosure. Alerts without a run or review open their existing alert detail and can be reopened after closing.

## UX

An existing valid connected session plus API configuration defaults to Overview. Disconnected initial navigation retains Conversation review/synthetic behavior. Evaluation/review deep links, supported query-selected pages, policy/run links and OAuth return-page intent win. Policy View runs writes the Overview page and selected policy into the URL so reload preserves its destination. Sidebar and breadcrumb use **Overview**; no second Home item was added. Footer displays **V0.17 OPERATIONAL OVERVIEW**. Historical V0.4 implementation copy was removed from the production page.

Role-aware actions retain existing permissions: reviewer My queue; author Evaluation Forms/Policies; administrator alerts/Settings; policies.write manual runs; viewer read-only drill-through. Disconnected Overview invites connection and contains no synthetic dashboard metrics.

Screenshots inspected at **1440×900**, **1920×1080**, **390×844**, with no page errors or horizontal page overflow: [1440 Overview](v017-evidence/overview-1440.png), [1920 Overview](v017-evidence/overview-1920.png), [390 Overview](v017-evidence/overview-390.png), [390 viewport](v017-evidence/viewport-390.png), [healthy state](v017-evidence/healthy-1440.png), [incomplete/unavailable state](v017-evidence/incomplete-390.png). These are clearly fixture browser states; production was not seeded.

## VALIDATION

- Full deterministic suite: **53 files, 530 tests passed**, including 18 new overview/navigation tests. Fixed-clock 7/30-day quality, coverage/trend/outcomes, health, workload/SLA, notifications, schedule/run ordering, active alert counts, zero state, incomplete guards, independent failures, safe projection and provider/write non-invocation are covered.
- All four roles exercised through the real API server with mocked identity verification and Genesys/Jev execution-provider spies. Overview is authorized, invalid ranges reject, anonymous calls reject, and cache-control is no-store.
- Deterministic drill-through/landing tests include source/critical filters, overdue/escalated/My queue, explicit page/evaluation/policy/run links and configured SLA thresholds. Existing OAuth tests remain passing.
- **45 distinct fixture browser journeys passed**: 17 new Overview journeys, 3 disconnected automation, 7 policy authoring, 3 review SLA, 12 notification and 3 group/alert lifecycle. Overview and policy journeys were repeated after final source/filter assertions and the policy run URL correction. Healthy/attention states, range switch, summary/trend/coverage, upcoming/latest scheduled run, run/review/unlinked-alert/policy/Analytics navigation, manual plan/confirm, refresh preservation, partial failure, reviewer and viewer actions, existing session and OAuth landing, and all three viewport sizes are covered.
- Frontend TypeScript/production build, server TypeScript and all server bundles **passed**. Existing Vite large-chunk advisory remains.
- Three additional fresh public-browser checks passed at the requested sizes, with Genesys/Jev URL calls blocked, proving the published Overview connection state: [live browser proof](v017-evidence/live-browser.json), [live 390 screenshot](v017-evidence/live-390.png).

Authenticated live Overview was not exercised with a real user OAuth token. Fixture API/browser journeys and the read-only baseline projection provide non-destructive connected-state coverage; deployed anonymous authorization, health, CORS, revision and public build bytes were independently verified.

## DEPLOYMENT

Application source: **7d4b401ee1508e25db47723c24acb2d806ab754e**. Cloud Run deployment used a Git archive of that exact tested commit, excluding uncommitted/workspace files.

Project **genesys-aqm-2026**, region **europe-west2**, service **aqm-api**, ready revision **aqm-api-v017-7d4b401**, **100% traffic**. Ready at **2 October 2026 13:26:22 Europe/London**.

Image: **europe-west2-docker.pkg.dev/genesys-aqm-2026/cloud-run-source-deploy/aqm-api@sha256:ffc65cd2ecbd05f458a628eb9b1e42f8d5afb36e22d4242522166352a41b804a**.

GitHub Pages HEAD: **1ee5574d1ada28e8e71cff05e3babf5bdca00082**. Public assets exactly match the tested local build:

- `index-Dun1p5-r.js`: `c0e54a6cdcd358317483df3ff249e68d0bbeca148fb0cf38f561cf73199ef90c`.
- `index-Qj14Anwb.css`: `36ecc1b471993ee707d3d9dd7ba53e4ae33b8cda3821f809f12cf89a5187e77b`.

[Pages byte proof](v017-evidence/pages.json). The existing API alias `/health` returns 200. Anonymous 7/30 overview, monitoring-health and SLA-filtered evaluation requests return 401; allowed Pages origin and no-store headers are preserved. [Live API proof](v017-evidence/api.json).

[Live application](https://simonridd.github.io/Genesys-aqm/).

## PRESERVATION

**22 of 23 inspected collections are exactly equal**, including document fields and create/update timestamps. Policies (7), schedules (1), runs (3), evaluations/slots (8 each), HumanReviews (0), forms (7), QuestionGroupAssets (4), OperationalAlerts/keys, roles, governance, notification configuration/events/deliveries and remaining collections are unchanged. Protected Daily Voice policy and schedule match exactly. Policy hash `69a2ef89c181e76f3eaa3b04c5beb63970136e1c09c58d84807eeab85aeec680`; schedule hash `33eeaf1c097a3a5a1d20378da0b9eab778b3008010830ffd4f6c60a81ef1271e`.

The sole difference is **natural existing Scheduler activity before the V0.17 deployment**: at **13:00 Europe/London**, scheduler.lastSuccessfulTickAt advanced from `11:00:05.676Z` to `12:00:08.484Z`, and the V0.16 review SLA sweep created `operationalHealth/reviewSla` at `12:00:08.918900Z`. That sweep was complete with zero active reviews/scanned/dueSoon/overdue/escalated. operationalHealth therefore increased from 1 to 2 documents. Its creation precedes V0.17 readiness at `2026-10-02T12:26:22.285320Z`. Scheduler service attempt/next-attempt timestamps naturally advanced; configuration did not. No run, evaluation, review, alert, notification or schedule/claim was created or changed by that tick. Natural health state was retained.

Cloud Run runtime spec except image, runtime annotations, IAM and Scheduler configuration are equal. Runtime identity, environment and Secret Manager references/versions are preserved. No Scheduler setup script, IAM mutation, secret write, migration, production fixture insertion or production domain mutation was performed. **No paid Jev calls were initiated.**

[Machine-readable preservation comparison](v017-evidence/preservation.json), including per-collection before/after counts and hashes, protected records, configuration comparisons and exact natural health timestamps.
