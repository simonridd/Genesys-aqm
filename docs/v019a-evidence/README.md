# V0.19A evidence

- [Validation summary](validation.json), [deterministic tests](deterministic-tests.txt), [26 focused browser checks](focused-build.txt), [81 existing browser regressions](browser-regressions.txt).
- Full JSON browser reports: [focused](browser-results.json), [existing](regression-results.json).
- Each viewport has My Reviews, unsaved, transcript, restored viewport and completed captures, plus `bounds-{width}.json` for reachable evidence/completion controls. Widths: 1440, 1920, 390.
- `recheck/` contains the original priority reviewer task replay against an actual local HTTP API using fictional data: screenshots/text/metrics, three action records and three network records. Those three tests are included in the 26 focused checks, not counted again.
- `before-collections.json` / `before-runtime.json` are read-only production snapshots. Only hashes/counts and permitted health/runtime timestamps are saved; no credentials or production document contents.
- Initial harness/contract failures remain in `*-harness.txt`, `focused-development.txt`, `browser-before-contract-update.txt` and `regression-before-contract-update.json`. The final logs/reports above supersede their results; classifications are in the validation summary and parent report.
- Deployment/after-snapshot proof will be added after publication from the tested commit. Source/runtime scripts are read-only except for saving evidence locally.

All screenshots and task data are fictional. Browser external DNS is blocked except for the configured static frontend host and localhost. OAuth, Genesys and AQM-shaped requests in fixture runs are intercepted; the task replay forwards AQM-shaped requests only to its local in-memory HTTP API. No paid Jev, live Genesys or notification delivery is used.
