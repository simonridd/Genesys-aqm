# V0.20 independent review evidence

**REVIEW ONLY / NEVER MERGE.** Canonical base `fadb73dac800cede26389fe883602967cf5b8784`. Lock `003f4d79a0909c4eaf8b5809e24c3d15468b81b6` was pushed before source/history/tests. The locked fresh-assessment.json and fresh-assessment.sha256 remain byte-identical to that commit.

## Reading order and chronology

1. build-equality.json proves 12/12 clean-build / Pages-tree / live public byte equality. source-input-verification.json independently checks 267 canonical inputs.
2. public-blind-observations.md, blind-actions.json, persona-traces.md, text/ARIA captures and representative PNGs describe rendered Phase A/B work. The action log is chronological and includes successful harness retries, not just curated conclusions. Failed tool calls are absent from that log; correction notes identify material failures.
3. fresh-assessment.json and its SHA256 are the immutable Phase C judgment. Do not replace them with final classifications.
4. post-lock-corrections.md, F1-F10-comparison.md and score-comparison.json explain later source/history interpretation. N2 is a fixture/conditional legacy boundary, not ordinary policy authoring defect.
5. validation-summary.json, browser JSON reports, build/typecheck/deterministic logs and failure-classifications.json record Phase D qualification. Initial failures are retained even when unchanged reruns pass.
6. remote-final.txt and backend-final.json are read-only identity checks; no deployment/data snapshot or production mutation.

The standalone report is ../v020-whole-product-review.md. Screenshots are representative viewport captures; corresponding text/ARIA snapshots are retained more broadly to support statements without duplicate binaries. Responsive-overview-corrected.json supersedes transient initial loading captures. Browser-generated historical evidence paths are restored before commit.

## Review harnesses and reproduction

Requires locked repository dependencies, supported Node 22 and installed Playwright Chromium. No product dependencies/config/tests are modified. Build canonical main via immutable git archive, run normal npm test/build/typecheck:server from that archive; server tests require permitted local loopback.

Serve its built dist using Vite preview at 127.0.0.1:4174 with /Genesys-aqm/ base. Set AQM_BROWSER_URL=http://127.0.0.1:4174/Genesys-aqm/ for fictional authenticated journeys. From the review worktree, run:

```sh
npx playwright test --config=docs/v020-whole-product-review-evidence/review.config.ts
npx playwright test --config=docs/v020-whole-product-review-evidence/current-regression.config.ts
npx playwright test --config=docs/v020-whole-product-review-evidence/failure-reproduction.config.ts reviewer-continuity.spec.ts:212 role-navigation.spec.ts:65 role-navigation.spec.ts:76
```

The latter configs point to the immutable archive /private/tmp/aqm-v020-clean/tests. If relocating, adjust only these isolated review configs. Existing suites can emit captures to their legacy docs paths; run from an expendable evidence directory/archive or restore those generated outputs afterwards. Public fresh test deliberately accesses the actual Pages site. Public contexts allow only static site traffic; fixture routes fulfill provider identity/token and AQM API requests locally, abort unknown external origins. Do not remove those network boundaries.

fictional-fixture.ts is the fixture-only portion of the existing reviewer-recheck infrastructure, with relative imports and generated-output location adjusted for this evidence directory. It bundles existing API/MemoryStore fixture support into generated/api.mjs at runtime (ignored). All form/review saves are in-memory fictional authority. blind-browser.mjs is local manual browser instrumentation, listening only on 127.0.0.1:4188; its command log is blind-actions.json. Run it only for this review in a local task and stop after use. No runtime bundle is committed.

## Boundaries

No real provider calls, production API writes, Jev inference, notification transport, deployments or tags. No physical-device, recruited-human, screen-reader or WCAG proof. All scores are agent observations. Browser status semantics are not actual spoken announcements. Locked counts remain four findings; final active product backlog excludes the corrected N2 fixture premise. Unweighted mean cannot override blockers.
