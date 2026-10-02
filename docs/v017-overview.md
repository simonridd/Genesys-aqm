# V0.17 operational Overview contract

The existing `automation` surface is now **Overview**. A valid existing Genesys session plus the configured AQM API selects it on initial mount. An explicit supported `page`, evaluation/review link, policy link, run link, or OAuth transaction return page takes precedence. Disconnected initial navigation retains Conversation review and its synthetic experience. Overview itself never consumes browser-local evaluation history.

## Snapshot

`GET /api/overview?range=7` accepts only `7` or `30`, defaults to `7`, and returns `Cache-Control: no-store`. Existing allowlist, Genesys bearer identity validation, role lookup and `evaluations.read` permission apply. All four roles can read the safe snapshot. Standard browser authentication retains its existing Genesys `/users/me` identity verification; the snapshot service takes only a Store, clock, range, review authority and scheduler configuration, and cannot invoke Genesys conversation providers, Jev or notification transports.

`generatedAt` and the inclusive `range.from` / `range.to` use one supplied clock. Quality, coverage, by-day quality trend and run outcomes use that same rolling window and `genesys-cloud` source. Form tests and non-Jev evaluation fixtures are excluded through existing operationalAnalytics. Active alerts, review SLA/workload, dependency evidence, notifications, recent runs and enabled upcoming schedules describe current durable state independent of range.

Each section is a discriminated union:

```ts
type OverviewSection<T> =
  | { complete: true; data: T }
  | { complete: false; status: 'incomplete' | 'unavailable'; reason: string }
```

A failed or incomplete section contains **no aggregate values**. A guard breach reports `Indexed aggregation required.` and the UI renders **Data incomplete**. Transient failures report a safe generic reason and **Unavailable**. A complete empty dataset legitimately contains zeros, null rates and empty lists. One failed section does not discard healthy sections. Raw error messages are never included.

| Section | Evidence and boundaries |
|---|---|
| health | Existing healthSnapshot and successful authenticated scheduler tick; shared providerEvidence also serves monitoring-health. API/Firestore health is verified by successful store work. Provider statuses describe latest durable run evidence, never a live test. |
| analytics | Existing operationalAnalytics: complete scans capped at 2,000 evaluations, 500 runs, 2,000 reviews. Quality uses established summarize; coverage uses summarizeCoverage. Counts are observations, not distinct conversations across runs. |
| reviews | Existing reviewWorkload and reviewSlaSummary: 2,000 evaluation, active-review and role guards remain. Only open, dueSoon, overdue, escalated and unassigned totals are projected. SLA stages are mutually exclusive and honor governance thresholds. |
| alerts | Existing activeAlertPage with 2,000 guard; OPEN and ACKNOWLEDGED count as active. Five highest severity alerts, newest first within severity, with safe run/review/policy linkage. No event history, messages, provider metadata or payloads. |
| notifications | Existing notificationHealth: indexed pending count, last successful delivery, failed deliveries over 24h. The existing 24h scan now stops at 2,001 and rejects totals above 2,000 instead of scanning unboundedly. No destinations, rules or secret references. |
| schedules | Bounded complete schedule/policy reads, at most 2,000 each. Enabled non-manual schedules whose policies are enabled, ordered by nextDueAt; first five and authoritative nextRunAt. Policy names resolved in one map. |
| recentRuns | Existing indexed healthSnapshot returns latest twenty; response projects first five safe run summaries and latest run. This bounded list is not used for analytics totals. |
| lastAutomatedRun | Latest completed scheduled run from the complete bounded 500-run scan, including successful proof outside the recent twenty. Guard breaches display Data incomplete rather than a misleading recent-page match. |

Independent sections run in parallel. A request-local promise cache shares matching collection pages, active-review pages, governance reads and healthSnapshot across helpers. There is no browser transfer of evaluation records for headline aggregation, per-review form lookup, per-policy query or new aggregation collection. The endpoint never writes. Monitoring/alert GET routes also no longer initialize health or open scheduler alerts; the existing authenticated scheduler remains responsible for this lifecycle.

## UX and drill-through

Attention presents errors, escalated reviews, overdue reviews, warnings and failed notification deliveries, using existing alerts and workload. Errors open their run, review SLA alerts open their evaluation, and unlinked alerts open the existing alert detail. Notification health remains high-level for all roles; privileged configuration stays in Settings. Six independent health tiles describe Automation, Genesys, Jev, Scheduler, Notifications and Review SLA. No combined score is introduced.

Quality shows evaluations, average score, pass rate, critical failures and existing by-day bars; low/empty history is explicit. Coverage shows eligible, sampled, content available, evaluated and failed plus sampled/eligible and evaluated/eligible percentages. Review summaries link to current workload and role-aware My review queue. Five enabled upcoming schedules and five recent runs keep the top-level page concise. Latest successful scheduled execution provides unattended proof.

Critical failures open server Evaluations with `critical=yes`. SLA links use existing `due=overdue` plus new exact `dueState=DUE_SOON|OVERDUE|ESCALATED`; shared matching uses current server governance thresholds. Evaluation Explorer exposes this SLA filter. Overview navigation clears stale evaluation filters before applying its target. Policy selection uses `policyId`, runs retain `runId`, and Analytics receives `analyticsTab`, source and date range through the existing query/state patterns. No new router is introduced.

Manual **Run a policy now** is a lower collapsible section. Existing Plan → Preview → Confirm → Execute and fingerprint guards remain; policy write permission is required. Detailed alert management and the full loaded run table remain in another lower disclosure. Range/refresh work does not execute a plan, evaluation or notification.

Freshness shows Updated time in Europe/London. Refresh is explicit; no dashboard timer is installed. Latest-request guards ignore superseded range responses. Overview renders independently of detailed operations loading. A failed manual refresh retains the last successful snapshot with a visible stale message. Run details and manual policy/period/preview state survive refresh; selected run proof is retained even when outside the next loaded run page. Reopening an unlinked alert restores its existing detail.

Screenshots and browser fixtures are synthetic test evidence only; no fixtures were inserted into production.
