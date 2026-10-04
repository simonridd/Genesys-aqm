# V0.20H — Calculator whole-conversation assumption

Canonical base: `c40bd3e09672995bc2d126e5b6b7433926599ad8`, fetched and verified as `origin/main`. Dedicated branch `codex/aqm-v020h-calculator-rounding`, worktree `/private/tmp/aqm-v020h-calculator-rounding`. Frontend calculator explanation only; backend remains `aqm-api-v019-e92f2d6`.

## F10 baseline

Before product source edits, the exact canonical build reproduced **1 conversation/month, 1% selection, 1 form, 1 request, 1 token**: **0 selected, 0 evaluations, 0 requests, 0 input tokens, $0.00/month**. The result described fractional average forms/requests and pricing but never explained the whole-conversation floor. That omission could make the mathematically non-zero selection appear to be an arithmetic error. Four baseline browser checks passed. [Desktop](v020h-evidence/before/tiny-1440x900.png), [mobile](v020h-evidence/before/tiny-390x844.png), [visible text](v020h-evidence/before/tiny-390x844.txt), [ARIA](v020h-evidence/before/tiny-390x844.aria.yml), [input/result values](v020h-evidence/before/tiny-390x844.json).

## Whole-conversation model and copy

Selection percentage applies to monthly conversation volume. `estimateCost()` remains the calculation authority:

```
selected = Math.floor(volume * percentage / 100)
evaluations = selected * forms
requests = evaluations * requests
cost = requests * tokens / 1_000_000 * Jev input price
```

The existing estimator, preset and bounds are byte-identical to canonical. The configured price is still $0.042/M input tokens, checked 2026-10-03. No fresh vendor pricing research or new pricing claim is introduced.

The ordinary result assumptions now visibly say **“Selected conversations are rounded down to whole conversations each month. Cost uses that count.”** This is present with Advanced assumptions closed. The retained separate input explanation says **“Average forms and requests may be fractional planning equivalents.”** Only selected conversations are floored; average forms and AI requests remain fractional.

For positive selection below one whole conversation, the result adds **“Before whole-conversation rounding: 0.01 conversations/month. Less than one conversation in this monthly planning period, so this scenario selects 0 and has no model input cost.”** The fraction is explanatory planning context, not a processed interaction. The pure `selectionPlanningContext()` supplies context only; the display also checks the authoritative estimator's `selected === 0`. Extremely tiny values display `<0.01`; six significant digits avoid floating-point artefacts, with `<1` guarding values whose display rounding would falsely imply a whole conversation.

No tiny-positive note appears for zero volume, zero percentage, exact whole selection, or a fractional selection above one. The ordinary assumption explains **3 × 50% = 1.5 before rounding → 1 selected** without adding another normal-result note. No minimum-one rule, expected-value mode, fractional selected conversation or pre-floor cost calculation is introduced.

## Scenario matrix and numerical equality

| Scenario | Selected | Evaluations | AI requests | Cost display |
|---|---:|---:|---:|---|
| Default: 100,000 × 50%; 1 form, 1 request, 8,000 tokens | 50,000 | 50,000 | 50,000 | $16.80/month; 400M input tokens |
| Tiny: 1 × 1%; 1 form, 1 request, 1 token | 0 | 0 | 0 | $0.00/month; explicit whole-conversation explanation |
| 3 × 50%; 1 form, 1 request, 1 token | 1 | 1 | 1 | Less than $0.01/month |
| Exact whole: 100 × 10%; default averages/tokens | 10 | 10 | 10 | Less than $0.01/month |
| Zero percentage: 100 × 0% | 0 | 0 | 0 | $0.00/month; no tiny note |
| Zero volume: 0 × 50% | 0 | 0 | 0 | $0.00/month; no tiny note |
| Positive sub-cent: 1 × 100%; 1 form, 1 request, 1 token | 1 | 1 | 1 | Less than $0.01/month; positive $4.20e-8 before display rounding |
| Fractional averages: 1 × 100%; 1.5 forms, 2.5 requests, 8,000 tokens | 1 | 1.5 | 3.75 | Less than $0.01/month; positive $0.00126 |

Focused deterministic tests also lock **199 × 1% → 1** and **200 × 1% → 2**. True post-floor zero remains exactly $0.00; existing positive sub-cent copy and unrounded positive-cost explanation remain unchanged. These states are tested separately.

Before/after default and tiny input values, visible metrics and cost displays match at all four viewports, including input-token totals. Default authority values remain **50,000 / 50,000 / 50,000 / 400,000,000 / $16.80**; tiny values remain **0 / 0 / 0 / 0 / $0.00**. [Machine comparison](v020h-evidence/numerical-equality.json), [comparison script](v020h-evidence/numerical-equality.py).

## Accessibility, mobile and validation

The contextual note sits inside the existing `aria-live="polite"` result region. No extra live region, alert, focus move or tooltip is introduced. ARIA snapshots include the explanation. Keyboard Tab reaches volume and percentage; changing the percentage preserves focus; Tab/Enter opens Advanced assumptions; forms/requests/tokens are edited by keyboard; Tab then reaches the pricing link in the result. This is browser/ARIA qualification, not a physical screen-reader user study.

The matrix covers **1440×900, 1920×1080, 390×844**, plus **1440×720**. At 390×844 the result, ordinary assumption, tiny note and advanced inputs remain readable without horizontal overflow. **1440 → 390 → 1440** retains all inputs, results and the tiny note. The ordinary sentence is appended to the existing assumptions paragraph: normal result growth is about **24px desktop / 71px mobile**, with no input-panel or first-screen hero redesign. [Tiny mobile viewport](v020h-evidence/after/tiny-closed-390x844-viewport.png), [result](v020h-evidence/after/tiny-closed-390x844-result.png), [keyboard/resize](v020h-evidence/after/keyboard-resize.json).

Build passes. **714/714 deterministic tests** pass, including **23 focused estimator/helper cases**. **5/5 browser checks** cover 32 scenario/viewport combinations plus keyboard/resize. **11/11 showcase smoke checks** protect Welcome, all five guided chapters, Plan a pilot, disconnected public handoff, authenticated Open AQM handoff with fictional APIs, lazy-load failure, and network/storage isolation. No expensive whole-product review or A–G suite replay. [Deterministic log](v020h-evidence/deterministic-tests.txt), [browser log](v020h-evidence/browser.txt), [smoke log](v020h-evidence/showcase-smoke.txt).

The initial browser run failed because the assertion expected a period where the first copy draft used a semicolon; the sentence was corrected and the matrix rerun successfully. The initial log is retained. Local execution required sandbox-approved loopback access; no product behavior was changed for infrastructure.

## Scoped score recheck

Unchanged 1–5 rubric: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. **Calculator clarity 4; Information quality 4; Trust / credibility 4; Mobile comprehension 4.** Explicit floor/cost semantics, exact 0.01 context, distinct sub-cent copy, unchanged exclusions, numerical equality and mobile/keyboard evidence support 4. Scripted evidence and the inherited long mobile page limit a 5 claim. No new whole-product mean. [Score record](v020h-evidence/score-recheck.json).

## Publication and preservation

The tested source is committed before publication, rebuilt from an immutable Git archive, and compared to the accepted build. Pages is published from that archive dist with dotfiles, and qualified against the complete gh-pages tree and all **12/12 public file bytes**. Public default, tiny and positive sub-cent scenarios are then tested at **1440×900 and 390×844**, with all provider/API requests blocked. Final source/Pages SHAs and preservation evidence are recorded in the completion entry below.

Read-only before/after snapshots cover **25 expected collection counts/hashes**, actual collection inventory, Cloud Run revision/image/config/traffic and IAM, all three provider secrets' metadata/version/IAM, and Scheduler config. Only hashes/counts and operational timestamp context are saved, never secret payloads or production document contents. Natural hourly timestamp movement is reported separately.

No backend/API or authenticated product source change, environment-builder-v2 change, Cloud Run deployment, production domain mutation, live Genesys call, Jev call, notification, PR, merge or tag. Volume integer steps, validation/bounds, pricing, tokens and all exclusions (transcription, Genesys licensing/retrieval, hosting, storage, network, retries, taxes, human review) are retained. The calculator remains an illustrative model-input estimate, not total pilot cost.

Only **F10's scoped ambiguity is resolved** by this qualification. This does not declare the whole product perfect or create a V0.20 release. ChatGPT decides review/merge, F1–F10 closure, and whether to run a fresh whole-product review or tag/release V0.20.

## Committed publication proof

Tested source: **`cf860d9bf008950446e12291489708b419b84ee5`**. All **208 build inputs** match its immutable Git archive; rebuilt dist matches the accepted build byte-for-byte. Pages HEAD: **`84caf3b8a2d363ae651c1cf91d7d4e9c7983aa6e`**, complete tree **`2c30d50d25c9922572d4c1afc605ebe4b50f0be4`**. Exactly **12/12 files**, including `.nojekyll`, match the complete Pages tree and all public response bytes, with no missing/extra paths. [Committed build](v020h-evidence/committed-build.json), [source verification](v020h-evidence/source-verification.json), [Pages equality](v020h-evidence/pages.json).

The [public calculator](https://simonridd.github.io/Genesys-aqm/) passes **2/2 matrix checks / six scenario-viewport combinations**: default, tiny and positive sub-cent at 1440×900 and 390×844. Inputs, numbers, cost and explanatory text equal the local proof. General and tiny explanations are present with Advanced assumptions closed. All non-static/provider/API traffic is blocked and no forbidden requests or page errors occur. No failures, retries, flaky cases or skips. [Public log](v020h-evidence/public-browser.txt), [JSON report](v020h-evidence/public-browser.json), [mobile tiny result](v020h-evidence/public/tiny-closed-390x844-result.png). Subsequent commits only finalize documentation/evidence and normalize evidence-report destinations; the deployed product source remains the tested commit.

## Final read-only preservation

Before collection/runtime snapshots completed at **2026-10-04 16:54:17.889849 / 16:54:28.445914 UTC**; after snapshots completed at **17:05:06.647509 / 17:05:14.407359 UTC**. All **25/25 counts** match and the actual **10-collection inventory** is unchanged. **24/25 raw collection hashes** match exactly. The sole hash change is `operationalHealth`, with its count still 2, from the natural 17:00 UTC hourly tick. Domain collection hashes, including Forms, Question Groups, Answer Sets/Families, Policies, Evaluations, Reviews and Schedules, are unchanged.

The inherited timestamp normalization excluded `updateTime` and `lastSuccessfulTickAt` but omitted review SLA `asOf`, so its initial strict comparison failed. The supplemental read-only proof restored recorded before `updateTime`/`lastSuccessfulTickAt` and found the old `asOf` millisecond inside the recorded tick/update window. **This reproduced the exact original full collection SHA-256**, proving no other field changed. No original hash was replaced and no production documents were saved. [Timestamp-only proof](v020h-evidence/health-timestamp-proof.json), [script](v020h-evidence/health-timestamp-proof.py), [initial comparison note](v020h-evidence/preservation-initial.txt).

Precisely, the two health updateTimes moved **16:00:08.636565Z → 17:00:07.748398Z** and **16:00:08.335012Z → 17:00:07.417318Z**. Scheduler health `lastSuccessfulTickAt` moved **16:00:08.199Z → 17:00:07.282Z**; review SLA `asOf` moved **16:00:08.394Z → 17:00:07.488Z**, all on 2026-10-04. Scheduler `lastAttemptTime` moved **16:00:04.876286Z → 17:00:04.767259Z**; `scheduleTime` moved **17:00:04.028877Z → 18:00:04.028877Z**; status remains empty. These natural timestamps are distinct from changes caused by this work.

Cloud Run revision/image/config/traffic, service IAM, all three provider secrets' metadata/version/IAM hashes and Scheduler configuration match exactly. **100% traffic remains on `aqm-api-v019-e92f2d6`**. [Preservation comparison](v020h-evidence/preservation.json), [traffic](v020h-evidence/cloud-run-traffic.json), [final qualification](v020h-evidence/verification.json). Work-caused **production domain mutations 0; live Genesys 0; Jev 0; notifications 0**. No Cloud Run deployment, backend/API/authenticated-product/environment-builder-v2 change, PR, merge or tag.

The dedicated branch is pushed for ChatGPT review/merge and F1–F10 closure decision. Final pushed HEAD is reported in the handoff; worktree clean. Only F10's scoped ambiguity is resolved; fresh whole-product review and V0.20 tag/release remain separate decisions.
