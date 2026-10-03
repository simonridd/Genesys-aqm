# Existing browser baseline classification

Unchanged suites against production build: 171 tests, 165 passed, 6 failed, no skipped/flaky. Original output: [log](browser-regressions.txt), [structured results](browser-results.json). Assertions were not changed.

| Failed test | Classification | Why |
|---|---|---|
| authoring: offline draft stays browser-local | BASELINE TEST EXPECTATION | Bare-root workspace assumption predates Welcome default. |
| policy-authoring: offline sandbox saves locally | BASELINE TEST EXPECTATION | Same bare-root assumption. |
| policy-authoring: VIEWER cannot mutate | BASELINE TEST EXPECTATION | Expects disabled input; control intentionally readonly/copyable. |
| policy-authoring: REVIEWER cannot mutate | BASELINE TEST EXPECTATION | Same disabled-versus-readonly assumption. |
| overview: OAuth intent/deep-link/explicit page wins | BASELINE TEST EXPECTATION | Earlier intent assertions pass; final bare-root Conversation review expectation is obsolete. |
| overview: connected session before App mounts | HARNESS FAILURE | Session injection intercepts development `/src/main.tsx`, absent in hashed production build. |

Review-specific PRODUCT BUGS are separate: unfinished human review lost through original-conversation navigation; completed item stays in My Reviews until Refresh. Existing tests do not cover these round trips. Characterization checks reproduce them and pass by asserting current behavior; these are not green protection regressions.

Initial deterministic socket binding failures and review-specific locator/fixture revision assumptions are HARNESS FAILURE, retained in their logs. They were corrected within allowed review harnesses, with no product changes. No observed production regression is inferred from the six baseline failures.
