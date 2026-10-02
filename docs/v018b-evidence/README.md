# V0.18B evidence

All browser/API test records are fictional. No paid Jev or production review/evaluation calls are made. The new browser harness aborts every external origin except explicit fictional OAuth and API responses; all unexpected API writes fail.

Reproduce:

```sh
npm ci
npm test
npm run build
npm run typecheck:server
npm run build:server
npx playwright test tests/investigation-links.spec.ts
AQM_BROWSER_URL=http://127.0.0.1:4176/Genesys-aqm/ npx playwright test --config docs/v018b-evidence/playwright.config.ts
npx playwright test tests/overview.spec.ts tests/review-operations.spec.ts tests/review-sla.spec.ts tests/calibration.spec.ts
```

Tests use the public API origin from `.env.production`, with every response intercepted. URL reload includes a fictional OAuth callback because actual access tokens intentionally live only in memory. No session-token persistence was added.

The final production-preview screenshots are named `analytics-investigation-WIDTH.png`, `scope-WIDTH.png`, `overview-open-WIDTH.png`, `overview-unassigned-WIDTH.png`, `overview-due-soon-WIDTH.png`, `overview-overdue-WIDTH.png`, `overview-escalated-WIDTH.png`, and `calibration-WIDTH.png` for WIDTH 1440, 1920, 390. The app retains its existing wide evaluation table and vertically long mobile filter/review controls. Scope chips wrap and stay within the viewport. No page overflow is observed.

Build/typecheck/test logs are saved alongside screenshots. Initial browser harness corrections concerned hidden duplicate controls, accessible select names, table pagination and fixture authentication on reload. Existing regression tests also detected chip aria-label collisions with control labels; removal names now come from button contents, and the existing controls keep their original labels.

`before-collections.json` and `after-collections.json` contain only production collection counts and SHA-256 hashes from the existing read-only V0.18A snapshot utility. `runtime-snapshot.py` reads Cloud Run, IAM, Secret Manager metadata/version lists and Scheduler configuration, storing only hashes, public deployment identifiers and Scheduler runtime timestamps. It never reads secret values or writes production state. `preservation.json` compares both snapshots.
