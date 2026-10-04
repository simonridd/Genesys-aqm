# V0.20D evidence

All browser authentication and application API data are fictional. Intercepted identity routes and in-memory/loopback fixtures handle authenticated requests; provider traffic is blocked. Static Pages files are real in public qualification. Production snapshots are read-only counts/hashes and runtime metadata; no tokens, secret values or domain contents are saved.

- `canonical-f7.json`, `canonical-back-welcome.png`, `baseline.txt`: observed F7 on exact canonical base. Archived `canonical-reproduction.spec.ts` runs against the canonical build only and is excluded from the normal fixed-code suite.
- `questions-*`, `source-*`, `drill-*`, `back-*`: exact source/drill/Back/Forward URL, API request, history length, rendered view/cohort and responsive screenshots/accessibility trees.
- `analytics-queues.json`, `analytics-groups.json`, `analytics-overview.json` (critical Analytics drill), `overview.json` (workspace Overview boundary). `calibration.json`, `errors.json`, `reload.json`, `review-draft.json`, `keyboard-*`: focused history contracts.
- `deterministic.*`, `final-browser.*`, `regression-smoke.*`, `public-browser.*`: machine-readable and text qualification reports. Browser config blocks service workers and resolves only the static frontend and loopback hosts.
- `committed-build.*`, `pages.json`, `pages-deployment.txt`: immutable source archive rebuild, complete gh-pages tree and public file equality.
- `before-*`, `after-*`, `preservation.json`, `cloud-run-traffic.json`: production preservation and traffic proof.

Run `npm run build`, then `npx playwright test tests/investigation-history.spec.ts --config docs/v020d-evidence/playwright.config.ts`. Set `AQM_BROWSER_URL=https://simonridd.github.io/Genesys-aqm/` for public static replay; authenticated API traffic remains intercepted. Set `AQM_HISTORY_EVIDENCE` to keep local and public captures separate.

Chromium viewport emulation and scripted keyboard tasks are not physical-device, screen-reader or independent participant certification.
