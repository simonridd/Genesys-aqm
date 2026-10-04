# Final whole-product review evidence

Read the [full report](../v019-final-whole-product-review.md) first. This index separates the fresh independent judgment, later corroboration and historical comparison. All identities, API writes and authenticated data are fictional/local.

## Judgment and provenance

- [Evidence SHA-256 manifest](manifest.json).
- [Locked fresh assessment](fresh-assessment.json), [checksum](fresh-assessment.sha256), [lock/history provenance](comparison-provenance.json).
- [Blind public first impressions](public/blind-public.json), [pre-lock task observations](prelock-observations.json), [reviewer task](reviewer-task.json).
- [Historical report](https://github.com/simonridd/Genesys-aqm/blob/c8f58f1930c94afba0884f675c3faeedcceb8a1c/docs/v019-whole-product-review.md) was retrieved only after the lock.
- [Post-lock repair/run corroboration](postlock-confirmation.json), [queue/calibration evidence](supplemental-investigations.json). These do not change the fresh scores.

## Representative screenshots

| Product experience | Evidence |
|---|---|
| Welcome | [1440](public/welcome-desktop.png), [390](public/welcome-mobile.png), [1920](public/welcome-1920x1080.png), [short desktop](public/welcome-1440x720.png) |
| Guided story | [case](public/demo-1-desktop.png), [definition](public/demo-2-desktop.png), [AI](public/demo-3-desktop.png), [human challenge](public/demo-4-desktop.png), [manage/pilot](public/demo-5-desktop.png); matching `demo-N-mobile.png` for every chapter |
| Handoff | [public fictional workspace](public/handoff-disconnected.png), [authenticated Open AQM](authenticated/authenticated-open-aqm.png) |
| Role navigation | [Admin](authenticated/mobile-admin-overview.png), [Author](authenticated/mobile-author-evaluation-forms.png), [Reviewer](authenticated/reviewer-my-reviews-mobile.png), [Viewer](authenticated/mobile-viewer-analytics-overview.png); all roles `short-desktop-ROLE.png` |
| Overview | [desktop](authenticated/admin-overview-desktop.png), [30-day attention](authenticated/overview-30-days-attention.png), [1920](authenticated/overview-large-desktop.png) |
| Analytics | [What stands out](authenticated/analytics-overview-desktop.png), [questions](authenticated/analytics-questions.png), [lowest exact-version cohort](authenticated/analytics-lowest-question-cohort.png), [queue cohort](authenticated/queue-supporting-evaluations.png), [return](authenticated/analytics-history-return.png) |
| Coverage | [1,000 eligible observations](authenticated/coverage-1000-observations.png), [run](authenticated/coverage-run-detail.png), [mobile](authenticated/mobile-admin-analytics-coverage.png) |
| Reviewer | [active density](authenticated/review-detail-start.png), [unsaved desktop](authenticated/review-unsaved-desktop.png), [unsaved mobile](authenticated/review-unsaved-mobile.png), [evidence desktop](authenticated/review-evidence-desktop.png), [evidence mobile](authenticated/review-evidence-mobile.png), [completion desktop](authenticated/review-completion-desktop.png), [completion mobile](authenticated/review-completion-mobile.png) |
| Author | [empty form](authenticated/author-new-empty-form.png), [expanded question](authenticated/author-first-question-expanded.png), [compact saved form](authenticated/author-saved-compact-form.png), [three-question reuse](authenticated/author-reused-question-group.png), [mobile](authenticated/mobile-author-evaluation-forms.png) |
| Answer Sets | [new draft](authenticated/answer-set-new-editor.png), [version comparison](authenticated/answer-set-version-comparison.png), [blocked update](authenticated/answer-set-blocked-update.png), [condition repair](authenticated/blocked-condition-repair.png), [repaired v2](authenticated/blocked-update-repaired.png), [mobile](authenticated/mobile-author-answer-sets.png) |
| Policy | [daily 08:00 saved](authenticated/policy-daily-0800-confirmed.png), [mobile](authenticated/mobile-author-policies.png) |
| Calibration | [desktop](authenticated/calibration-desktop.png), [mobile View](authenticated/mobile-admin-calibration.png), [question disagreement](authenticated/calibration-question-evidence.png), [supporting reviewed evaluations](authenticated/calibration-supporting-evaluations.png) |
| Viewer | [published definition](authenticated/viewer-defining-form.png) |
| Admin | [attention to policy](authenticated/admin-attention-policy.png) |
| Settings | [Connection](authenticated/settings-admin-connection.png), [Access](authenticated/settings-admin-access.png), [Reviews](authenticated/settings-admin-reviews.png), [Privacy](authenticated/settings-admin-privacy-retention.png), [Notifications](authenticated/settings-admin-notifications.png), [Audit](authenticated/settings-admin-audit.png), [Advanced](authenticated/settings-admin-advanced-development.png) |
| Conversation | [evidence](authenticated/analytics-conversation-evidence.png), [mobile](authenticated/review-evidence-mobile.png) |
| Failure/recovery | [partial Overview](authenticated/failure-overview-injected.png), [Analytics](authenticated/failure-analytics.png), [Forms](authenticated/failure-forms.png), [Policies](authenticated/failure-policies.png), [Groups](authenticated/failure-groups.png), [Answer Sets](authenticated/failure-answer-sets.png), [Evaluations](authenticated/failure-evaluations.png), [revision conflict](authenticated/failure-review-revision.png), [reassignment](authenticated/failure-review-reassignment.png), [Settings](authenticated/failure-settings-save.png) |

Screenshots have matching `.txt` rendered content. [screens.ndjson](authenticated/screens.ndjson) retains page heights, actual control geometry, headings, current-page state and sort semantics. Not every screenshot is a distinct assertion. Duplicate task states are retained where they establish before/after continuity; this is not a count of successful tests.

## Measurements and boundaries

- [Task action sequences](action-burden.json).
- [Mobile controls/pages](mobile-measurements.json), [short desktop / resize](responsive-observations.json), [keyboard task replay](keyboard-observations.json), [semantics](semantics.json), [role navigation](role-navigation.json).
- [Failure observations](failure-observations.json), [review conflicts](conflict-observations.json), [Settings by role](settings-observations.json).
- [Public calculator/network/storage exercises](public/public-exercises.json), [public handoff request/storage record](public/public-final-network.json), [paced pitch + clean network/storage](public/paced-public.json), [deployed assets SHA-256 comparison](public/assets-proof.json).
- [Pre-lock isolated boundary](fresh-boundary.json), [final authenticated boundary](authenticated-final-boundary.json), [fixture close logs](authenticated/fixture-network.ndjson).
- [Backend read-only revision metadata](backend-revision.json): expected ready revision, 100% traffic. No API evaluation or configuration was performed against production.

## Validation results

- [Validation summary](validation-summary.json): separate suite/probe categories, no overlapping grand total.
- [Deterministic log](deterministic-tests.log): 65 files / 621 passed.
- [Existing 290-case result](existing-regressions.json), [log](existing-regressions.log), [failure classifications](existing-failure-classification.md), [full classified errors](existing-failure-classification.json): 225 passed / 63 failed / 2 skipped; 62 stale baseline expectations, 1 harness defect. Original failures/traces retained in `existing-regression-artifacts/`.
- [Vite-dependent rerun](legacy-module-rerun.json), [log](legacy-module-rerun.log): 1 passed / 1 stale bootstrap expectation remains; overlaps original 290.
- [Fresh initial 11-case result](fresh-checks-initial.json), [log](fresh-checks-initial.log): 8 passed / 3 new-harness selector failures; [corrected affected 3-case rerun](fresh-checks-corrected.json), [log](fresh-checks-corrected.log): 3 passed. Eleven unique final checks, not fourteen. Initial traces remain in `fresh-check-artifacts/`.
- [Manual harness diagnostics](harness-diagnostics.json). Product findings are not erased by corrected selectors or passing defect-characterization tests.
- Four full keyboard persona tasks, three additional native selector/subnav probes; production/public safety and geometry records above. These are descriptive coverage, not extra assertion counts.

## Reproduction

Use canonical main `c20604c3b33b81a0038388851d07d6f500792bdb`, Node/dependencies from the lockfile and installed Chrome. The fresh adapter copies the established local API fixture workflow; it does not replace product components. Provider implementations throw and browser unknown external URLs abort. The browser configs additionally deny external DNS. Review harnesses use the real built frontend on localhost:4174.

```sh
npm ci
VITE_AQM_API_ORIGIN=https://aqm-api-bd54ukouga-nw.a.run.app npm run build
npm run preview -- --host 127.0.0.1 --port 4174
# In another terminal:
npm test
npx playwright test --config=playwright.final-review.config.ts
npx playwright test --config=playwright.fresh-checks.config.ts
# Stop preview before the separate legacy source-module rerun:
npx playwright test --config=playwright.final-legacy-modules.config.ts
node tests/final-public-review.cjs
```

The public script fetches only the actual deployed static journey/files, records attempts, intercepts persistent writes and replays the historical 260-second dwell. It should take about 4:32; this is presenter simulation, not human-comprehension evidence. Tests write old evidence paths as a side effect; restore those outputs after a review run and commit only this review's artifacts. The historical regressions are intentionally not repaired in a review-only task.

The fresh suite characterizes some known friction as well as verifying successful flows. A passing characterization of Browser Back returning to Welcome is evidence of F7, not proof that history UX is good. Initial failed results are retained; only new harness selectors were corrected. No assertion counts are added across overlapping categories.
