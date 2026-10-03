# Human pass evidence

All new captures live here; original review evidence is unchanged.

- `original-review.md`: exact reference copy from review HEAD `0a2a0701f33591e519ae0bd0384d3ab064d8e0e4`; its relative evidence links refer to the original review branch, not this folder.
- `review.cjs`, `review-data.json`, `human-review.txt`: repeated 1440×900, 1920×1080, 390×844 public journeys, states, network/storage operations, deep links, history, calculator and product inspection.
- `extra.cjs`, `extra-data.json`, `extra.txt`: keyboard, sampled contrast, reduced motion, resize and sequential paced pitch with the original 260 seconds of explicit explanation dwell.
- `browser-regressions.txt`: important V0.18 preservation and showcase checks with mocked services; tests run against the built preview.
- `deterministic-tests.txt`, `frontend-build.txt`, `server-typecheck.txt`, `server-build.txt`: full deterministic checks and builds.
- `publication.json`: exact source SHA, Pages HEAD and byte comparisons for every built public asset.

No real authentication, Genesys/Jev inference, production API or notification request is part of these checks. The core screenshots inspect disconnected public destinations; product tests use mocked identities/services. Timed dwell measures harness pacing, not actual human comprehension or runtime capacity.

`browser-final-showcase.txt` records 35 final local showcase/first-use checks. `deployed-showcase.txt` records all nine showcase checks against verified Pages. `deployed-review/` and `deployed-extra/` repeat review/keyboard/pacing on that deployment. `browser-regressions-final.txt` consolidates the corrected 109 important tests; it excludes only the two public-root assertions separately reproduced on canonical main in `baseline-overview.txt`. Their failures are retained in the initial `browser-regressions.txt`.

The long deployed review repeated a static App-module timeout at the mobile handoff. Its 52-state partial record retains all 87 passing showcase checks plus the transport errors. This is disclosed, not counted as a clean full deployed run. `deployed-handoff.txt` verifies the handoff in fresh contexts at all three sizes; `mobile-core.cjs`, `deployed-mobile-core.txt` and `deployed-mobile-core/` record the remaining eleven public mobile states with zero errors/forbidden requests. `local-handoff.txt` validates the strengthened viewport regression locally.
