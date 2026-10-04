# V0.20C evidence

Authenticated browser data is fictional. Locally fulfilled identity/API routes or existing loopback MemoryStore fixtures handle all authenticated operations; external providers are blocked. Production proof is read-only Firestore collection counts/hashes and runtime/IAM/Scheduler/secret metadata hashes. No credentials or domain contents are saved here.

- `canonical-false-empty.*`, `baseline.txt`: observed canonical 503 plus error/empty/zero results. `canonical-reproduction.spec.ts` and `canonical-playwright.config.ts` replay against the canonical build; excluded from the normal new-code test directory.
- `deterministic.json` / `.txt`: exact query/UTC/identity/copy/label and existing focused domain/presentation contracts.
- `browser-results.json` / `browser.txt`: focused V0.20C recovery qualification. Run `npx playwright test tests/evaluation-availability.spec.ts --config docs/v020c-evidence/playwright.config.ts` after building.
- `initial-failure-*`, `my-reviews-failure-390.*`, `analytics-failure-390.*`, `calibration-failure-390.*`, `overview-failure-390.*`: real page captures and accessibility trees, with explicit width assertions in the test.
- `regression-browser.*` and `continuity/`, `reviewer-focus/`, `investigations/`, `navigation/`, `answer-sets/`, `calibration/`: focused current-contract reviewer, investigation, role/navigation and V0.20A/B smoke. Provider-free fixture traces are in `recheck/`.
- `reviewer-cards.*`, `dev-playwright.config.ts`: the existing component test run using its required Vite development modules.
- `qualification-development.txt`, `regression-development.*`, `regression-contract-update.txt`, `retry-focus-development.txt`: retained intermediate failures; see `failure-classification.md` for disposition. Final reports supersede these.
- `score-recheck.json`: four scoped assessments on the unchanged 1–5 rubric; no product mean.
- `committed-build.*`, `pages.json`, `public-browser.*`: immutable tested-source rebuild, complete Pages tree/public equality and public frontend with fictional API qualification.
- `before-*`, `after-*`, `preservation.json`, `cloud-run-traffic.json`: production preservation and traffic proof.

Viewports are Chromium emulations, not a physical-device or screen-reader certification. Goal/keyboard tasks are scripted replays, not recruited-user studies.
