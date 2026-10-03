# Showcase qualification

Base: accepted V0.18E `15fd08aa7ed07ff4d88e918dd0b1ce80b43da974`.
Branch: `codex/aqm-ipi-showcase`. Dedicated worktree: `/private/tmp/aqm-ipi-showcase`.

```sh
npm ci
npm test
npm run typecheck:server
npm run build:server
VITE_AQM_API_ORIGIN=https://aqm-api-bd54ukouga-nw.a.run.app npm run build
AQM_BROWSER_URL=http://127.0.0.1:4189/Genesys-aqm/ npx playwright test -c docs/ipi-evidence/playwright.config.ts
```

The API origin matches existing production build configuration. All browser APIs
and OAuth/provider endpoints are either fictional fixtures or denied, never live.
HTTP unit tests and preview browsers require permission to bind localhost ports.
The initial sandbox-denied test attempt is not a product regression; the permitted
rerun passes. Node 25 emits the existing Vitest engine warning; tests pass anyway.

- `deterministic-tests.txt`: 566 tests, 59 files.
- `frontend-build.txt`, `server-typecheck.txt`, `server-build.txt`: compiler/bundles.
- `browser-final.txt`: 82 passing final built-preview A–E/showcase journeys.
- `isolation.json`: zero protected requests and identical browser stores.
- `contrast.json`: semantic text/action/status foreground/background ratios ≥4.5.
- `bounds-*.json`: seven chapters at each width, no page overflow or offscreen rail/header controls.
- `welcome-*`, `estimator-*`, `chapter-*`: fictional showcase captures.
- `product-*`: representative authenticated-product fixtures, never live data.

Screenshots are visually inspected as well as measured. The rail is adjacent on
desktop and inline before content on mobile; it does not obscure actions. Normal
and reduced-motion behavior is tested. New evidence lives here; previous accepted
checkpoint captures are not replaced by the regression run's temporary outputs.

Publication uses the exact qualified dist; `publication.json` records byte hashes,
tested source and Pages identity. Branch evidence updates do not alter product code.
No PR, main promotion, tag or backend deployment is performed.

Fictional tests are not provider/scale/live-authentication proof. No production
snapshots are asserted here; preservation means this task makes no live protected
requests/writes or operational changes. Prior reported live proof remains separate.
