# V0.19 evidence

The implementation is described in [../v019-reusable-answer-sets.md](../v019-reusable-answer-sets.md). No paid Jev, live Genesys, production Answer Set creation/import, protected policy/schedule change or production authoring mutation was used.

## Reproduce provider-free checks

```sh
npm ci
npm test
npm run build
npm run typecheck:server
npm run build:server
npm run test:answer-sets-browser
npx vitest run src/domain/answerSets.test.ts src/server/answerSets.test.ts src/server/store.test.ts src/domain/groupAssets.test.ts
npx playwright test tests/save-protection.spec.ts tests/investigation-links.spec.ts tests/definition-authority.spec.ts tests/first-use-settings.spec.ts tests/usability.spec.ts tests/form-composition.spec.ts tests/form-publication.spec.ts tests/operational-table.spec.ts tests/control-plane-cache.spec.ts tests/calibration.spec.ts tests/governance.spec.ts tests/review-operations.spec.ts tests/review-sla.spec.ts tests/notifications.spec.ts
npx playwright test -c docs/v019-evidence/playwright.config.ts tests/answer-sets.spec.ts tests/showcase.spec.ts tests/form-composition.spec.ts
```

The built preview config starts port 4176 and gives the fixtures its URL. Supplying `AQM_BROWSER_URL` instead runs against that external origin with all provider/production API requests still replaced by fixtures. Answer Set journeys bundle the existing API/store implementation for the Node test runner, use MemoryStore with four fictional role identities, and fail on any provider evaluation/list/load. The generated fixture bundle is ignored and regenerated automatically.

## Results and limits

- `deterministic-tests.txt`: 597 tests / 61 files pass.
- `focused-tests.txt`: 48 domain/store/API/group tests pass.
- `frontend-build.txt`, `server-typecheck.txt`, `server-build.txt`: typechecks/builds pass.
- `browser-development.txt`: 19 Answer Set journeys pass. `browser-build.txt`: the same 19 plus all 11 showcase tests and three group-composition journeys pass against the deployable build, 33 total.
- `browser-regressions.txt`: initial broad run passed 127 journeys. Two tour checks exposed short-desktop navigation overflow, fixed by a scrollable desktop sidebar. `browser-navigation-fixes.txt` reruns navigation/usability/showcase checks, 27 passing. The third initial failure deliberately blocks a built lazy chunk and therefore requires the production preview; it passes in `browser-build.txt`. No unresolved regression remains. Counts overlap; do not add them as unique tests.

Screenshots/bounds cover library detail, choice picker, update comparison, blocked condition and ordered score options at 1440×900, 1920×1080 and 390×844. Options and detail padding use the IPI system. The native identity button is tested with Enter, detail headings receive focus, close restores the opener, and applying a picker choice focuses Answers. Mobile action bounds are checked against main-content; option controls are labelled and wrapping is visually inspected. Desktop sidebar scrolling also protects shorter 720px viewports.

## Release discipline

`tag.json` records the absent-before-create V0.18 annotated tag and exact canonical peeled commit. `before-collections.json` and `before-runtime.json` capture read-only hashes/counts and runtime/IAM/secret/Scheduler metadata. `collections-snapshot.py` discovers all top-level collections and includes the empty new authoring asset and family metadata collections. It never saves document contents, identities, credentials or tokens.

Only a committed source archive is deployed. Deployment metadata, byte comparisons and after-state comparison are recorded below. Source, image/revision and Pages HEAD may differ from the final evidence-only branch HEAD; the actual source SHA is recorded explicitly.

## Completed release

Application source: `e92f2d69c1d4cbe691f7e0ee82ea764ffb8e80af`. Cloud Run: `aqm-api-v019-e92f2d6`, ready and serving 100% of traffic. The committed backend/frontend archives match source bytes; the archive frontend build matches the validated build exactly. Health returns 200 and anonymous Answer Set/form requests return 401. No authenticated production authoring mutation was used.

Pages HEAD: `7ebfd7b5a8d6b2673b7f89305197e734491493eb`. [Public AQM](https://simonridd.github.io/Genesys-aqm/). `pages.json` verifies all 12 public files byte-for-byte and verifies the exact Pages Git tree has the same paths/content. `browser-public.txt` records 33 passing journeys: all 19 Answer Set journeys, all 11 showcase regressions and three Question Group journeys at the requested viewports. APIs/providers remain fictional/in-memory. The 33 public journeys overlap the 33 build journeys.

`preservation.json` records **25/25 matching collection counts and hashes**, including `answerSetAssets` **0 → 0** and `answerSetFamilies` **0 → 0**. All existing policy/schedule/form/group/evaluation/review/audit/notification/operational collections match. Runtime configuration, service IAM, secret metadata/versions/IAM and Scheduler configuration match. Scheduler runtime also matches: last attempt `2026-10-03T13:00:04.991663Z`, next scheduled time `2026-10-03T14:00:04.028877Z` in both captures. No natural Scheduler difference occurred in the captured release window. Only the intended revision/image changed.

Remote main remains canonical `efc02d0986c75c938831d1633e98c3420ca7d72e`; the annotated V0.18 tag and peeled commit remain unchanged. No PR, main merge, or V0.19 tag was created. Final branch commits after the application source record release evidence only; application files are compared against the deployed source before the final push.
