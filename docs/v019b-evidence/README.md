# V0.19B evidence

Canonical base: `c48fefc7d9ce1933799bd37543823c4c2ed94424`. Branch: `codex/aqm-v019b-authoring-simplification`.

The frontend is exercised with fictional authenticated identities and the actual local HTTP API/MemoryStore. Browser external DNS is blocked. Expected OAuth/Genesys identity responses are intercepted; provider stubs throw. Fixture mutations never reach production.

## Measurements and visual inspection

- `mobile-before.json`, `mobile-expanded-before.json`: measured canonical frontend before edits; 4,265px collapsed / 6,002px expanded at 390×844.
- `mobile-after.json`, `mobile-expanded-after.json`: matched V0.19B states; 2,663px / 3,590px, 37.6% / 40.2% shorter.
- `form-before-390.png`, `form-expanded-before-390.png`, `form-after-full-390.png`, `form-expanded-after-full-390.png`: full-page baseline and after screenshots.
- Contact sheets `visual-inspection-1440.jpg`, `visual-inspection-1920.jpg` and `visual-inspection-390.jpg` accompany the full screenshots.
- Three viewport matrices: 1440×900, 1920×1080, 390×844. Each filename ends with viewport width.

| Requested view | Screenshot prefix |
|---|---|
| Empty form | `form-empty` |
| Collapsed question | `form-collapsed` |
| Expanded question | `form-expanded` |
| Option editing | `inline-option-editor` |
| Attached Answer Set | `answer-attached` |
| Answer Set picker | `answer-picker` |
| Version comparison | `answer-diff` |
| Blocked update | `blocked-update` |
| Answer Sets library | `answers-library` |
| Answer Set editor | `answers-editor` |
| Question Groups library | `groups-library` |
| Reused group | `group-reused` |

The implementing agent visually inspected the layouts, including mobile vertical option ordering, compact collapsed cards, readable old/new diff columns, named repair guidance and desktop two-column fields. Bounds assertions cover visible fields/actions. No physical-device or screen-reader certification is claimed.

## Validation

`deterministic-tests.txt`: 607 tests / 63 files passed, including reviewer draft state, evidence return, completion/queue reconciliation, conditions, lifecycle, Answer Set snapshots, policy pins, portability, saved/local authority and provider isolation. `frontend-build.txt` and `server-typecheck.txt`: successful frontend build and unchanged-backend typecheck.

Final browser command:

```sh
AQM_ANSWER_EVIDENCE=docs/v019b-evidence/answer-regression \
AQM_SAVE_EVIDENCE=docs/v019b-evidence/save-regression \
npx playwright test -c docs/v019b-evidence/playwright.config.ts \
  tests/authoring-simplification.spec.ts tests/answer-sets.spec.ts \
  tests/reviewer-continuity.spec.ts tests/definition-authority.spec.ts \
  tests/save-protection.spec.ts tests/usability.spec.ts tests/showcase.spec.ts \
  tests/authoring.spec.ts tests/form-publication.spec.ts tests/form-composition.spec.ts \
  --timeout=25000
```

`browser-final.txt` / `browser-results.json` are the final matrix: **122/122 passed**. `focus-race.txt` / `focus-results.json` repeat the three density/keyboard cases twice after fixing an asynchronous focus fallback that could steal a newly focused disclosure. Repeated runs are not additional independent UX observations.

`author-task-replay.json` records the exact two task goals, routes and keyboard actions. This is a scripted implementing-agent replay. It does not establish fresh blind discovery, real hesitation or human learnability.

Intermediate raw logs are retained. They include fixture schema/rename mistakes, native-disclosure expectation updates and the focus race discovered during the larger matrix. Publication/group regression changes preserve domain assertions while opening the newly closed controls. Historical V0.18/V0.19 evidence is restored before committing; current outputs are kept here.

Published command (62/62 passed):

```sh
AQM_BROWSER_URL=https://simonridd.github.io/Genesys-aqm/ \
AQM_BROWSER_REPORT=docs/v019b-evidence/public-browser-results.json \
AQM_AUTHORING_EVIDENCE=docs/v019b-evidence/public-authoring \
AQM_ANSWER_EVIDENCE=docs/v019b-evidence/public-answer-regression \
AQM_REVIEW_EVIDENCE=docs/v019b-evidence/public-review-regression \
npx playwright test -c docs/v019b-evidence/playwright.config.ts \
  tests/authoring-simplification.spec.ts tests/answer-sets.spec.ts \
  tests/reviewer-continuity.spec.ts --timeout=25000
```

The public frontend run still uses intercepted fictional local API fixtures; it does not write to the production API. `public-browser.txt` and `public-browser-results.json` record the final results.

## Deployment / preservation

- `committed-build.json`: immutable Git archive inputs and all build bytes match the tested frontend; no backend/domain/provider source changes.
- `pages.json`: Pages HEAD `ab8e1328edd149fda9daf8f741b851976f23ffd0`; all 12 public files and Git tree match source `8077c6997ef847cfd535cc275f51b5e6d0ead5b4` byte-for-byte.
- `before-collections.json` / `after-collections.json`: count/hash-only snapshots of 25 production collections.
- `before-runtime.json` / `after-runtime.json`: revision/image/config/IAM/Scheduler/secrets hashes; no secret values or tokens saved.
- `preservation.json`: 24/25 collection hashes match; only the two existing operational-health records reflect the natural 18:00 UTC tick. All authoring/evaluation/review/policy data and runtime configuration match. Scheduler timestamps are separate.

No PR, merge or tag. No live Genesys, paid Jev, notification delivery, production authoring/review/evaluation mutation, Cloud Run deployment, runtime-config change or environment-builder-v2 change by this task.
