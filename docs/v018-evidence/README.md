# V0.18 review evidence

All connected records and mutations are fixture-only. The public site was inspected without authentication. The capture harness permits only the local/static app, public Google font assets, and explicitly fulfilled fixture routes; unmatched network requests are blocked. No live Genesys/Jev/AQM calls or real notification sends are made.

## Reproduce

Install the locked dependencies, run `npm run build`, then run `npm run preview -- --host 127.0.0.1 --port 4175` in this worktree. In another terminal run:

```sh
npx playwright test --config docs/v018-evidence/playwright.config.ts
```

`AQM_BROWSER_URL` can override the local production preview URL. Existing behavior tests use the repository Playwright config and its separate Vite fixture server on port 4174. Do not substitute a production API transport for the fixture route handler. Font-ready inventories record loaded font faces; unused Unicode faces can correctly remain unloaded.

## Primary pages — visually inspected

| Page | 1440×900 | 1920×1080 | 390×844 | Inspection notes |
|---|---|---|---|---|
| overview | [1440](overview-1440.png) | [1920](overview-1920.png) | [390](overview-390.png) | Attention hierarchy sound; long on mobile; review count cohort mismatch. |
| evaluations | [1440](evaluations-1440.png) | [1920](evaluations-1920.png) | [390](evaluations-390.png) | Filters and admin panels precede rows; wide contained table; needs compact My reviews. |
| analytics | [1440](analytics-1440.png) | [1920](analytics-1920.png) | [390](analytics-390.png) | Advanced filter density and technical storage-mode copy; preserve drill scope. |
| calibration | [1440](calibration-1440.png) | [1920](calibration-1920.png) | [390](calibration-390.png) | Distinct comparison evidence, clear sample warning; keyboard row-opening gap. |
| policies | [1440](policies-1440.png) | [1920](policies-1920.png) | [390](policies-390.png) | Readiness and separate save states useful; identifiers/raw dates secondary. |
| forms | [1440](forms-1440.png) | [1920](forms-1920.png) | [390](forms-390.png) | Connected local/server mix; published controls/read-only explanation; long editor. |
| groups | [1440](groups-1440.png) | [1920](groups-1920.png) | [390](groups-390.png) | Focused library; mouse-only rows; unsaved draft disappears on navigation. |
| settings | [1440](settings-1440.png) | [1920](settings-1920.png) | [390](settings-390.png) | Governance before connection, two H1s, long mobile flow and shared save scope. |
| conversations | [1440](conversations-1440.png) | [1920](conversations-1920.png) | [390](conversations-390.png) | Synthetic library useful; Cards heading action clipped at 390. |
| conversation-review | [1440](conversation-review-1440.png) | [1920](conversation-review-1920.png) | [390](conversation-review-390.png) | Useful transcript/evaluation pairing; local policy matches in connected mode; Browse clipped. |

Each full-page image has a matching JSON inventory with visible copy, headings, field/button states, selectable-row semantics, geometry, fonts and cumulative fixture API request paths. No page-level horizontal overflow was found; clipped controls are separately identified through bounding boxes.

## Detail surfaces — visually inspected

| Detail | 1440 | 1920 | 390 |
|---|---|---|---|
| form-detail | [1440](form-detail-1440-panel.png) | [1920](form-detail-1920-panel.png) | [390](form-detail-390-panel.png) |
| group-detail | [1440](group-detail-1440-panel.png) | [1920](group-detail-1920-panel.png) | [390](group-detail-390-panel.png) |
| evaluation-review-detail | [1440](evaluation-review-detail-1440-panel.png) | [1920](evaluation-review-detail-1920-panel.png) | [390](evaluation-review-detail-390-panel.png) |
| run-detail | [1440](run-detail-1440-panel.png) | [1920](run-detail-1920-panel.png) | [390](run-detail-390-panel.png) |
| alert-detail | [1440](alert-detail-1440-panel.png) | [1920](alert-detail-1920-panel.png) | [390](alert-detail-390-panel.png) |
| notification-destination | [1440](notification-destination-1440-panel.png) | [1920](notification-destination-1920-panel.png) | [390](notification-destination-390-panel.png) |
| notification-rule | [1440](notification-rule-1440-panel.png) | [1920](notification-rule-1920-panel.png) | [390](notification-rule-390-panel.png) |
| policy-detail | [1440](policy-detail-1440.png) | [1920](policy-detail-1920.png) | [390](policy-detail-390.png) |

Form/group definitions retain full question instructions/rubrics when published. Policy readiness/actions and schedule status are coherent. Completed review compares AI/human scores and highlights disagreement. Run/alert metadata is dense but wraps; alert related actions/history are useful. Notification editors are inline forms with labels and save/cancel; their Secret Manager fields are appropriate to administrators. Detail focus/close behavior is inconsistent.

Additional current-main mobile behavior evidence: [active reassignment/review controls](active-review-assignment-390.png) and [completed review](completed-review-390.png), from the existing 390px review-operations tests.

## Roles

| Role | Overview | Evaluations | Policies | Settings | Forms | Groups |
|---|---|---|---|---|---|---|
| AUTHOR | [overview](AUTHOR-overview.png) | [evaluations](AUTHOR-evaluations.png) | [policies](AUTHOR-policies.png) | [settings](AUTHOR-settings.png) | [forms](AUTHOR-forms.png) | [groups](AUTHOR-groups.png) |
| REVIEWER | [overview](REVIEWER-overview.png) | [evaluations](REVIEWER-evaluations.png) | [policies](REVIEWER-policies.png) | [settings](REVIEWER-settings.png) | [forms](REVIEWER-forms.png) | [groups](REVIEWER-groups.png) |
| VIEWER | [overview](VIEWER-overview.png) | [evaluations](VIEWER-evaluations.png) | [policies](VIEWER-policies.png) | [settings](VIEWER-settings.png) | [forms](VIEWER-forms.png) | [groups](VIEWER-groups.png) |

ADMIN is represented by the full primary-page matrix. All-role existing governance/notifications/Overview tests independently exercise permission-gated controls. Role screenshots confirm all ten sidebar destinations remain, author/viewer My queue is exposed in Evaluations, and read-only duties still see configuration fields.

## Public, disconnected and completed-interaction fixtures

| State | 1440 | 1920 | 390 |
|---|---|---|---|
| public-landing | [1440](public-landing-1440.png) | [1920](public-landing-1920.png) | [390](public-landing-390.png) |
| public-overview | [1440](public-overview-1440.png) | [1920](public-overview-1920.png) | [390](public-overview-390.png) |
| disconnected-landing | [1440](disconnected-landing-1440.png) | [1920](disconnected-landing-1920.png) | [390](disconnected-landing-390.png) |
| disconnected-settings | [1440](disconnected-settings-1440.png) | [1920](disconnected-settings-1920.png) | [390](disconnected-settings-390.png) |
| demo-analytics | [1440](demo-analytics-1440.png) | [1920](demo-analytics-1920.png) | [390](demo-analytics-390.png) |
| connected-conversations-empty | [1440](connected-conversations-empty-1440.png) | [1920](connected-conversations-empty-1920.png) | [390](connected-conversations-empty-390.png) |
| connected-conversations | [1440](connected-conversations-1440.png) | [1920](connected-conversations-1920.png) | [390](connected-conversations-390.png) |
| connected-conversation-review | [1440](connected-conversation-review-1440.png) | [1920](connected-conversation-review-1920.png) | [390](connected-conversation-review-390.png) |

The public sample identifies synthetic provenance; disconnected Overview has no fictional operational metrics. Completed messaging search/transcript fixtures show customer/bot/system/agent labels and retained explicit refresh/cache behavior. Real-interaction Browse action is also clipped on mobile. Prepared demo analytics remains useful without credentials.

## Targeted probes and states

- [incomplete-overview](incomplete-overview.png): Independent incomplete analytics/unavailable workload; healthy sections retained.
- [unavailable-overview](unavailable-overview.png): Overview preserves last successful snapshot and explicitly says so.
- [empty-overview](empty-overview.png): Zero/unknown values distinguished, but first-policy setup guidance is scattered.
- [permission-denied](permission-denied.png): Explicit 403 message; no data returned.
- [empty-evaluations](empty-evaluations.png): No-data state; next action/clear filters can improve.
- [no-matching-groups](no-matching-groups.png): No matches, native focus ring visible, no clear-filter action.
- [overview-open-drill](overview-open-drill.png): 4 open reviews links to 8 evaluations; completed/unrequested included.
- [overview-unassigned-drill](overview-unassigned-drill.png): 1 unassigned requested review links to 5 evaluations without assignees.
- [analytics-drill-scope](analytics-drill-scope.png): Exact @17 version, From and Queue omitted from destination URL.
- [group-after-unsaved-navigation](group-after-unsaved-navigation.png): Unsaved group lost without a dialog.
- [governance-save-scope](governance-save-scope.png): Saving reminders commits the edited retention field as well.
- [keyboard-group-table](keyboard-group-table.png): Tab sequence passes sort controls, never the group identity.

Direct structured probes: [group dirty result](group-dirty-probe.json), [governance save payload](governance-save-payload.json), [group table focus traversal](keyboard-group-focus.json). They contain fictional settings/IDs only.

## Validation and limitations

- Frontend production build and server typecheck passed.
- [Deterministic test log](unit-tests.log): 53 files / 530 tests passed.
- [Existing browser journey log](existing-journeys.log): 25 selected baseline journeys plus 4 mobile journeys = 29 passed.
- [Final evidence log](capture.log): 14 passed on production preview/public static site.
- [Manifest](manifest.json): release/base, hashes, page dimensions and checks.
- [Preservation check](preservation.json): only docs/evidence additions; product trees unchanged.

Early sandboxed API tests failed because loopback listen was denied; their authorized retry passed. Early harness attempts were corrected for fixture prerequisites/hidden controls. Development StrictMode effect duplication is excluded from production request findings. No production provider latency, authenticated live health, real notification transport, full screen-reader or formal WCAG proof is claimed.
