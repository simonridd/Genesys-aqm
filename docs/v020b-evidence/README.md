# V0.20B evidence

All authenticated browser data is fictional. The actual frontend talks to the existing API via a local MemoryStore fixture. Genesys/Jev providers throw if invoked; external browser traffic is denied, apart from locally fulfilled fictional sign-in/user identity. Production proof consists only of read-only collection/configuration hashes. No production domain data, provider, or notification operation is used.

- `deterministic.json` / `.txt`: pure presentation, calibration/review semantics, navigation and adjacent presentation contracts.
- `browser-results.json` / `browser.txt`: 12 focused Calibration tests.
- `regression-browser.json` / `.txt`: 27 current-contract reviewer continuity/focus, exact investigations, responsive navigation and V0.20A discovery tests.
- `visual-browser.json` / `.txt`: six overlapping goal/discovery journeys with explicit filter/question-card visual geometry.
- `goal-task-*`, `form-task-*`, `keyboard-*`: goals, actual scripted route/actions, cohort and keyboard observations. These are scripted fictional-user replays, not independent human usability studies.
- `disagreement-*`, `form-selector-*`, `all-forms-questions-*`, `question-drill-*`, `return-*`: viewport captures, accessibility snapshots and geometry at 1440, 1920 and 390px.
- `score-recheck.json`: four focused 1–5 assessments, no whole-product mean.
- `committed-build.*`, `pages.json`, `public-browser.*`: immutable committed-source build and Pages verification (written after qualification/publication).
- `before-*`, `after-*`, `preservation.json`: counts/hashes, runtime/IAM/Scheduler/secret metadata comparison; no document contents, personal data or token values retained.

Reproduce browser qualification with `npx playwright test tests/calibration-discovery.spec.ts --config docs/v020b-evidence/playwright.config.ts`; build first. The optional `AQM_BROWSER_URL` runs the same fixtures against the public frontend, with API traffic still diverted locally.
