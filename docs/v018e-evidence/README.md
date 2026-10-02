# V0.18E evidence

All browser journeys use fictional OAuth/API fixtures or in-memory stores. No paid Jev or live Genesys execution is used. Production snapshots are read-only counts/hashes and runtime metadata; no document contents, tokens or secrets are recorded.

```sh
npm ci
npm test
npm run build
npm run typecheck:server
npm run build:server
npx playwright test tests/usability.spec.ts tests/operational-table.spec.ts tests/investigation-links.spec.ts tests/save-protection.spec.ts tests/definition-authority.spec.ts tests/first-use-settings.spec.ts tests/review-operations.spec.ts tests/review-sla.spec.ts tests/control-plane-cache.spec.ts tests/governance.spec.ts tests/notifications.spec.ts tests/calibration.spec.ts
AQM_BROWSER_URL=http://127.0.0.1:4176/Genesys-aqm/ npx playwright test -c docs/v018e-evidence/playwright.config.ts
```

`browser-validation.txt`: 109 passing development journeys. `browser-calibration.txt`: three additional existing calibration journeys. `browser-final.txt`: 46 passing focused/conversation/cache/first-use journeys after the complete table audit. `browser-final-additions.txt`: notification focus and active-scope preservation. `browser-build.txt`: 17 passing deployable-build journeys. `browser-table.txt`: final shared-table event-count/keyboard contract. These runs overlap; counts must not be added as unique tests.

`bounding-boxes.json` records button bounds against main-content and viewport (one CSS pixel subpixel tolerance). PNGs and `inspection-*.jpg` cover 390×844, 1440×900 and 1920×1080. Screenshot review confirmed visible mobile toggle/action/close controls and clear immutable explanations.

`deterministic-tests.txt`, `frontend-build.txt`, `server-typecheck.txt`, `server-build.txt` record build/test checks. `before-*`/`after-*` record production counts/hashes and runtime/configuration metadata. `preservation.json` compares them. `pages.json` verifies exact public bytes against the validated dist and records application source SHA and Pages HEAD. Only GitHub Pages is published because server runtime source is unchanged.
