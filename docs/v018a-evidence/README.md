# V0.18A evidence

All browser data and mutations are fictional fixtures. New browser journeys abort external requests except explicitly fulfilled fixture routes; there are no provider requests or production writes.

Reproduce deterministic/build checks with `npm test`, `npm run build`, `npm run typecheck:server`, and `npm run build:server`. Run new journeys against Vite with `npx playwright test tests/save-protection.spec.ts`, or against the tested production build:

```sh
npm run build
AQM_BROWSER_URL=http://127.0.0.1:4176/Genesys-aqm/ npx playwright test --config docs/v018a-evidence/playwright.config.ts
```

`backend-proof.py` compiles all backend entry points from the canonical base and working source, using identical relative entry points and locked esbuild. `backend.json` records exact bundle equality. `preservation-snapshot.py` is an authorized, read-only production check: output contains only aggregate counts/hashes and operational tick timestamps, never record contents or credentials. It requires existing gcloud read access and an explicit output path. No source/deployment script invokes it automatically.

Screenshots from the final production preview were inspected at all three viewports. Panel screenshots retain the viewport's actual layout width; full viewport dimensions are recorded in test parameters and confirmation evidence.

| Surface | 1440×900 | 1920×1080 | 390×844 |
|---|---|---|---|
| Groups dirty state | [1440](group-dirty-1440.png) | [1920](group-dirty-1920.png) | [390](group-dirty-390.png) |
| Pending Governance save/discard | [1440](settings-pending-1440.png) | [1920](settings-pending-1920.png) | [390](settings-pending-390.png) |
| Saved Governance | [1440](settings-saved-1440.png) | [1920](settings-saved-1920.png) | [390](settings-saved-390.png) |
| Local reset scope | [1440](local-reset-1440.png) | [1920](local-reset-1920.png) | [390](local-reset-390.png) |
| Form Test history | [1440](form-test-initial-1440.png) | [1920](form-test-initial-1920.png) | [390](form-test-initial-390.png) |
| Pending recovery reference | [1440](form-test-recovery-1440.png) | [1920](form-test-recovery-1920.png) | [390](form-test-recovery-390.png) |

Native dialog text and exact cancellation/acceptance decisions are in [confirmations.txt](confirmations.txt). Native browser confirmations are not rendered into Playwright page screenshots. Successful test/build logs are retained as `.txt` files. Existing regression output documents the initial two cache harness failures, with their passing rerun in `cache-regression.txt`; the form protection itself was preserved.

Deployment: [Pages byte comparison](pages.json), [production preservation comparison](preservation.json). Source fd26f4dad3a8ee666feaadf9cb7ba277f8c9cb9a; Pages 7d4c936110f74ddfdb910d6d254b8f923b34ee12. All 23 production collection counts/hashes and Cloud Run/Scheduler configuration/state are unchanged; no natural scheduler differences were observed.
