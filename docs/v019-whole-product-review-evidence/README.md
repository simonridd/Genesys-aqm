# V0.19 review evidence

Read the [full review](../v019-whole-product-review.md) first. Reviewed source is `4416ee416259c3c756374b14e26521d0b902b80b`, on `codex/aqm-v019-whole-product-review`. New artifacts only; product source and existing tests are unchanged. Date: 3 October 2026.

Mode A is the deployed public site. Mode B is the unchanged production frontend with fictional authenticated responses and the application's actual local HTTP API/in-memory store. Fictional provider-shaped requests were intercepted; external DNS was blocked in fixture browser launches. No live providers, production writes, notification sends, PR, merge or tag.

## Start with the findings

- [Draft loss: before](review-unsaved-before-evidence.png), [after reopening](review-unsaved-after-reopen.png), [machine observation](reviewer-draft-navigation.json). Passing characterization means the loss was reproduced, not fixed.
- [Completed review still in My Reviews: desktop](reviewer-completed-stale-queue-1440.png), [mobile](reviewer-completed-stale-queue-390.png).
- [Dense one-question form: desktop](form-editor-1440.png), [mobile](form-editor-390.png), [contradictory save copy](form-editor-1440.txt).
- [Blocked update](regression-blocked-update-1440.png), [mobile](regression-blocked-update-390.png): failure is safe; explanation is not a repair workflow.
- [Analytics introduction](connected-analytics-1440.txt), [affected queue](analytics-affected-queue.png), [weak question](analytics-worst-question.png), [exact supporting evaluations](analytics-supporting-evaluations.png).
- [Independent author observations](first-author-observations.md), [goal-one picker](first-author-06-answer-picker.png), [extra starter after reuse](first-author-11-group-added.png), [completed three-question form](first-author-13-second-form-saved.png).

## Validation records

| Layer | Result | Record |
|---|---|---|
| Production build | Pass, no source changes | [Build](frontend-build.txt), [8 byte-identical deployed files](public-assets-proof.json) |
| Deterministic tests | 597 pass / 61 files | [Final](deterministic-tests.txt), [initial sandbox socket failure](deterministic-sandbox-failure.txt) |
| Existing browser regressions | 165 pass / 6 fail / 171 | [Original output](browser-regressions.txt), [structured results](browser-results.json), [classification](baseline-classification.md) |
| Fixture matrix | 9 pass | [Final matrix](review-fixture-final.txt) |
| Supplemental task/defect/semantics | 9 pass | [Final task output](review-tasks-final.txt) |
| Goal-only author replay | 1 pass | [Author check](first-author-checks.txt) |
| Deployed public | 24 captures, 48 journey/bounds checks, 24 calculator observations | [Public data](public-review.json), [output](public-review.txt), [blind first record](blind-public.json) |
| Paced public journey | 272.137s / 260s dwell / 12.137s overhead | [Data](extra-data.json), [output](paced-public.txt) |

There are 19 unique review-specific fixture Playwright checks (9 + 9 + 1). Authenticated-fixture checks are the same checks, not an extra count. The earlier separate [semantics run](review-semantics.txt) is repeated inside the final task run. Deployed observations are not independent browser-test counts. Existing regressions overlap these workflows. No combined inflated total is presented.

Earlier harness attempts are retained: [first attempt](review-harness-first-attempt.txt), [fixture retry](review-fixture-checks.txt), [role retry](review-role-checks.txt), [task exploration](review-task-checks.txt), [group locator debug](group-composition-debug.txt). They include obsolete locator assumptions, initial fixture role/revision errors and unsettled asynchronous capture. Final metrics are deduplicated by capture name using the latest settled capture; early screenshots/duplicate images were pruned. This is evidence curation, not suppression of failures. No existing test assertion was changed.

## Public screenshots

| Page | 1440×900 | 1920×1080 | 390×844 |
|---|---|---|---|
| Welcome | [1440](public-welcome-1440.png) | [1920](public-welcome-1920.png) | [390](public-welcome-390.png) |
| Calculator scenarios | [1440](public-calculator-1440.png) | [1920](public-calculator-1920.png) | [390](public-calculator-390.png) |
| 1 Customer case | [1440](public-chapter-1-1440.png) | [1920](public-chapter-1-1920.png) | [390](public-chapter-1-390.png) |
| 2 Define quality | [1440](public-chapter-2-1440.png) | [1920](public-chapter-2-1920.png) | [390](public-chapter-2-390.png) |
| 3 Evaluate at scale | [1440](public-chapter-3-1440.png) | [1920](public-chapter-3-1920.png) | [390](public-chapter-3-390.png) |
| 4 Human challenge | [1440](public-chapter-4-1440.png) | [1920](public-chapter-4-1920.png) | [390](public-chapter-4-390.png) |
| 5 Manage & pilot | [1440](public-chapter-5-1440.png) | [1920](public-chapter-5-1920.png) | [390](public-chapter-5-390.png) |
| Explicit sample handoff | [1440](public-sample-handoff-1440.png) | [1920](public-sample-handoff-1920.png) | [390](public-sample-handoff-390.png) |
| Sample conversation review | [1440](public-conversation-review-1440.png) | [1920](public-conversation-review-1920.png) | [390](public-conversation-review-390.png) |

Blind first-pass screenshots duplicated these public frames and were pruned; contemporaneous rendered text, storage, timestamps and request log remain in `blind-public.json`. [Connected handoff](connected-handoff.json) verifies Open AQM returns a signed-in fictional user to Overview. Public JSON contains each snapshot's text, heading/control bounds, calculator cases, dynamic-resize data and exact storage boundary. Welcome/demo had no storage operations or external requests. Explicit handoff initialized seven local product keys; session storage remained empty.

## Major workspace screenshots

| Page | 1440×900 | 1920×1080 | 390×844 |
|---|---|---|---|
| Overview | [1440](connected-overview-1440.png) | [1920](connected-overview-1920.png) | [390](connected-overview-390.png) |
| Evaluations, admin | [1440](connected-evaluations-1440.png) | [1920](connected-evaluations-1920.png) | [390](connected-evaluations-390.png) |
| My Reviews | [1440](reviewer-queue-1440.png) | [1920](reviewer-queue-1920.png) | [390](reviewer-queue-390.png) |
| Reviewer detail | [1440](reviewer-detail-1440.png) | [1920](reviewer-detail-1920.png) | [390](reviewer-detail-390.png) |
| Analytics | [1440](connected-analytics-1440.png) | [1920](connected-analytics-1920.png) | [390](connected-analytics-390.png) |
| Calibration | [1440](connected-calibration-1440.png) | [1920](connected-calibration-1920.png) | [390](connected-calibration-390.png) |
| Evaluation Forms | [1440](connected-evaluation-forms-1440.png) | [1920](connected-evaluation-forms-1920.png) | [390](connected-evaluation-forms-390.png) |
| One-question editor | [1440](form-editor-1440.png) | [1920](form-editor-1920.png) | [390](form-editor-390.png) |
| Question Groups | [1440](connected-question-groups-1440.png) | [1920](connected-question-groups-1920.png) | [390](connected-question-groups-390.png) |
| Group detail | [1440](question-group-detail-1440.png) | [1920](question-group-detail-1920.png) | [390](question-group-detail-390.png) |
| Answer Sets | [1440](connected-answer-sets-1440.png) | [1920](connected-answer-sets-1920.png) | [390](connected-answer-sets-390.png) |
| Policies | [1440](connected-policies-1440.png) | [1920](connected-policies-1920.png) | [390](connected-policies-390.png) |
| Policy detail | [1440](policy-detail-1440.png) | [1920](policy-detail-1920.png) | [390](policy-detail-390.png) |
| Settings / Connection | [1440](connected-settings-1440.png) | [1920](connected-settings-1920.png) | [390](connected-settings-390.png) |
| Conversations | [1440](connected-conversations-1440.png) | [1920](connected-conversations-1920.png) | [390](connected-conversations-390.png) |
| Conversation review | [1440](connected-conversation-review-1440.png) | [1920](connected-conversation-review-1920.png) | [390](connected-conversation-review-390.png) |

Additional Settings evidence: [Access](settings-access-1440.png), [Reviews desktop](settings-reviews-1440.png) / [mobile](settings-reviews-390.png), [Privacy & retention](settings-privacy-retention-1440.png), [Notifications desktop](settings-notifications-1440.png) / [mobile](settings-notifications-390.png), [Audit desktop](settings-audit-1440.png) / [mobile](settings-audit-390.png). All role/subsection rendered text and metrics remain under `role-*-settings-*`; redundant screenshots were removed. [Hidden subsection records](role-hidden-sections.ndjson) distinguish unauthorized destinations from empty editors.

Overview variants: [empty](overview-empty.png), [healthy](overview-healthy.png). Authoring composition: [group with reusable answer](group-with-answer-set.png), [group picker](group-picker-composition.png), [saved composed form](form-group-answer-set-composition.png).

## Answer Set evidence

| State | 1440×900 | 1920×1080 | 390×844 |
|---|---|---|---|
| Published detail | [1440](answer-set-published-1440.png) | [1920](answer-set-published-1920.png) | [390](answer-set-published-390.png) |
| Draft new version | [1440](answer-set-draft-1440.png) | [1920](answer-set-draft-1920.png) | [390](answer-set-draft-390.png) |
| Ordered-score detail | [1440](answer-set-score-1440.png) | [1920](answer-set-score-1920.png) | [390](answer-set-score-390.png) |
| Compatible picker | [1440](answer-set-picker-1440.png) | [1920](answer-set-picker-1920.png) | [390](answer-set-picker-390.png) |
| Attached question | [1440](answer-set-attached-1440.png) | [1920](answer-set-attached-1920.png) | [390](answer-set-attached-390.png) |
| Explicit diff | [1440](answer-set-comparison-1440.png) | [1920](answer-set-comparison-1920.png) | [390](answer-set-comparison-390.png) |
| Detached/customizable | [1440](answer-set-detached-1440.png) | [1920](answer-set-detached-1920.png) | [390](answer-set-detached-390.png) |
| Save as reusable | [1440](answer-set-save-as-1440.png) | [1920](answer-set-save-as-1920.png) | [390](answer-set-save-as-390.png) |
| Blocked removal update | [1440](regression-blocked-update-1440.png) | [1920](regression-blocked-update-1920.png) | [390](regression-blocked-update-390.png) |

[Empty connected library](answer-sets-empty-connected.png), [existing Answer Set control bounds](regression-answer-set-bounds-390.json). Blocked-update images were copied from this run's existing regression suite before restoring pre-existing evidence files. Other images are review harness captures.

## Failure evidence

[Forms load](failure-evaluation-forms.png), [Groups load](failure-question-groups.png), [Answer Sets load](failure-answer-sets.png), [Policies load](failure-policies.png), [Answer Set save conflict](failure-answer-set-conflict.png), [invalid import](failure-invalid-import.png), [Settings save](failure-settings-save.png), [evaluation list](failure-evaluation-list.png). Each has matching `.txt` rendered text. Text files normalize trailing whitespace for version control; JSON retains raw captured text. Blocked update is indexed above.

## Measurements and audit trail

- [Screen metrics](screen-metrics.json): latest 165 captures, visible-main word/heading/control/panel counts, document height, control bounds, H1/dialog/sort/nav data. Raw DOM H1 count is distinguished from visible/accessibility count; inactive hidden conversation surface is explained in the review.
- [Deduplicated captured text/metrics](screens.ndjson); matching `.txt` preserves each rendered surface.
- [Task actions](task-actions.json): reviewer clicks/inputs and sampled auto-scroll, quality-leader queue/form/question cohort, SLA, independently counted pitch/author/version actions. Measurements use explicit denominators/methods.
- [Fixture network log](fixture-network.ndjson): all 81 explorations/replays, zero page errors and zero unexpected blocked origins. OAuth/Genesys-shaped requests are intercepted, not sent live; AQM requests reach only local HTTP API.
- [Dynamic resize](resize.ndjson), plus deployed public resize in `public-review.json`.
- [Accessible headings/current state](heading-semantics.json), [tab/dialog probes](accessibility-probes.ndjson), public keyboard/contrast/reduced motion in `extra-data.json`.
- [Reference check](reference-checks.md): official pricing/confidence sources checked read-only.
- [Screenshot manifest](screenshot-manifest.json): 158 retained, representative images. It omits redundant role/subsection/first-pass frames while retaining text/measurements. No screenshots were fabricated or altered.

## Reproduce

Use the repository dependencies and a Playwright Chromium installation. On this host `CHROMIUM_PATH` points to the cached Chromium 1243 executable; use your own executable or update the review config's fallback. Fixtures require permission to bind a local socket. Do not enable live provider credentials.

From repository root:

```sh
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

In a second terminal, set the local frontend URL and browser path as appropriate, then run:

```sh
AQM_BROWSER_URL=http://127.0.0.1:4174/Genesys-aqm/ npx playwright test --config docs/v019-whole-product-review-evidence/playwright.config.ts tests/whole-product-review.spec.ts tests/whole-product-review-tasks.spec.ts tests/whole-product-review-draft.spec.ts tests/whole-product-review-semantics.spec.ts tests/whole-product-first-time-author.spec.ts --reporter=line
```

Existing baseline command (retain the original assertions):

```sh
AQM_BROWSER_URL=http://127.0.0.1:4174/Genesys-aqm/ npx playwright test --config docs/v019-whole-product-review-evidence/playwright.config.ts tests/save-protection.spec.ts tests/investigation-links.spec.ts tests/definition-authority.spec.ts tests/first-use-settings.spec.ts tests/usability.spec.ts tests/showcase.spec.ts tests/answer-sets.spec.ts tests/form-composition.spec.ts tests/calibration.spec.ts tests/review-operations.spec.ts tests/review-sla.spec.ts tests/policy-authoring.spec.ts tests/overview.spec.ts tests/authoring.spec.ts tests/governance.spec.ts tests/notifications.spec.ts
```

Review fixture runners intercept provider traffic and block external DNS. Public scripts continue only same-site static GETs (core pages are not mocked):

```sh
node docs/v019-whole-product-review-evidence/blind-public.cjs
node docs/v019-whole-product-review-evidence/public-review.cjs
node docs/v019-whole-product-review-evidence/paced-public.cjs
node docs/v019-whole-product-review-evidence/public-assets-proof.cjs
```

Set `CHROMIUM_PATH` when needed. The paced script takes approximately 4½ minutes. Reruns overwrite review evidence and existing suites overwrite their older evidence directories; restore only those pre-existing artifacts afterward. Do not interpret a baseline root/readonly expectation failure as an implemented fix. Screenshot files are full-page captures at the stated viewport, so image height can exceed viewport height.
