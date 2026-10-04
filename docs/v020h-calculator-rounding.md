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
