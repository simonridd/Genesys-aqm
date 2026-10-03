# V0.19C evidence

All authenticated tasks use fictional intercepted data. No production evaluation/configuration writes, live Genesys/Jev requests or notification delivery.

- `frontend-build.txt`: production frontend build.
- `deterministic-tests.txt`: final deterministic suite (614 / 64).
- `deterministic-sandbox.txt`, `focused-sandbox.txt`: local socket restrictions, not product failures.
- `focused-playwright.txt`, `browser-results.json`: final 12 focused browser checks.
- `focused-first.txt`, `focused-second.txt`, `focused-third.txt`, `focused-keyboard-first.txt`: development harness runs. First: extra invalid setup checklist plus full-versus-expanded funnel comparison and ambiguous From locator. Second: select-label locator mismatch. Third: 9 pass before Tab-only additions. Keyboard first: table locator needed exact v17 because v17/v18 remain distinct. Product review-card CSS overlap was found by visual inspection and corrected before final captures.
- `browser-regressions.txt`, `regression-results.json`: 111 pass / 2 unchanged legacy Overview harness/expectation failures. No skipped/flaky tests.
- `goal-only-task.json`: visible-evidence scripted agent route, two actions to supporting evaluations, three to detail; not human research.
- `quality-task-{1440,1920,390}.json`: exact September question/queue conclusions and cohort filters.
- `coverage-interpretation-{1440,1920,390}.json`: 1,000 → 500 → 460 → 450 funnel, four rates, gaps and one-run versus two-run boundary.
- `keyboard-{1440,1920,390}.json`: Tab/native select/Enter traversal; no mouse clicks.
- Root `*-{width}.png` and `*-viewport-{width}.png`: full-page and viewport captures. Corresponding text files exclude closed technical details.
- `reviewer-regression/`, `authoring-regression/`, `answer-regression/`, `save-regression/`, `investigation-regression/`: retained regression captures. The save harness's old default evidence destination was restored after the new files were copied here.
- `committed-build.py/json/txt`: immutable archive build and equality with the tested frontend; source/frontend authority.
- `pages-proof.py`, `pages.json`, `pages-deployment.txt`: Pages tree and public byte equality with committed source.
- `before/after-collections.json`, `before/after-runtime.json`, `preservation.json`: read-only production counts/hashes and runtime comparison. Document contents and secret values are not saved.
- `preservation-snapshot.py`, `runtime-snapshot.py`, `compare-preservation.py`: read-only proof scripts reused from earlier tranches.

See [tranche report](../v019c-quality-actionability.md) for mental model, before/after, technical audit, counting units, unchanged rubric and deferred navigation work.

Final public recheck: `public-playwright.txt`, `public-results.json` — 108/108 passed on the exact deployed committed frontend with intercepted APIs. `public-quality/`, `public-reviewer/`, `public-authoring/`, `public-answers/`, `public-save/`, `public-investigation/` contain deployed captures. `frontend-invariance.json` confirms documentation-only changes after the tested source. These tests overlap earlier runs and must not be summed as independent scenarios.
