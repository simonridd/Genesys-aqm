# IPI AQM showcase

## Base and scope

The dedicated `codex/aqm-ipi-showcase` branch starts at accepted V0.18E main
`15fd08aa7ed07ff4d88e918dd0b1ce80b43da974`, following implementation
`66138b7621cb016c07f245cfae9d8cc9113bcd3c` and its completed Pages publication.
Worktree: `/private/tmp/aqm-ipi-showcase`. The primary checkout and Environment
Builder product files are untouched. This tranche is a frontend working prototype,
not production certification or a scale benchmark. No PR, main promotion or tag.

## Brand provenance

The read-only reference is `simonridd/environment-builder-v2` at accepted BRAND1
`f8ff537c85cbad890f2c88a0ff8961aaf3cd24d7`:

- `src/ui/brandTokens.css`
- `src/ui/hosted-agent-experience/IPIlogo.svg`
- `docs/reports/ipi-brand-system-v1/README.md`

AQM owns `src/brandTokens.css`; there is no Environment Builder runtime dependency.
Existing style declarations were migrated by semantic purpose: navigation, primary
actions, secondary/focus, neutral text/borders, informational/selection surfaces,
chart series, warning and danger. Production transcript roles, forms, tables,
review comparison, Settings and responsive controls use those tokens. Chart SVG
strokes use the same semantic layer. Green is not a small-white-label action fill.

`public/IPIlogo.svg` is a byte-for-byte copy. SHA-256:
`abaaa77faa7b27add57acf58f1723f1011481c7107ade6b5e326d7e59edfb865`.
The full-colour artwork appears on neutral clear-space tiles; no transformation or
white/compact substitute. Typography is the approved Inter/system stack; the old
Google font imports are removed. No font download, remote image or tour dependency.

## Entry and onboarding

- `?page=welcome`: product story, economics, status and suggested pilot outline.
- Unqualified disconnected visits choose Welcome before importing the live App.
- Connected in-app navigation retains session context and defaults to Overview.
- Explicit product routes, evaluation/policy/run links and OAuth returns take
  precedence over the default welcome experience. Explicit demo takes precedence
  over every live selector, including stray OAuth parameters; it sanitizes its URL.
- `About / product tour` is persistent in the product and honours dirty guards.
- The old disconnected introduction is consolidated into Welcome. Connection
  section links and the real saved-state setup checklist remain separate from demo.
- `Open AQM` is the only demo transition that mounts real application services.
  Exit returns to Welcome. Tour completion leads to the pilot outline.

Session handling retains the existing memory-only authentication contract. A page
reload does not manufacture or persist a session. The demo never reads credentials.

## Claims and illustrative economics

`src/showcase/claims.ts` records text/value, evidence category, source and checkedAt.
Official sources were checked on 3 October 2026:

- [Models and input pricing](https://docs.typesafe.ai/models)
- [Typed decisions](https://docs.typesafe.ai/introduction)
- [Confidence](https://docs.typesafe.ai/confidence)
- [Jev 1.13 limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13)
- [Vendor launch context](https://typesafe.ai/blog/introducing-system-one-models-and-jev)

The vendor reports USD $0.042/M input tokens for Jev 1.13, output free. This is not
an AQM measured bill or operating-cost guarantee; pricing may change. No vendor
latency number is used as an AQM throughput claim. Typed answers can be wrong;
confidence is not measured correctness. Human calibration is part of the workflow.

Calculator, browser-only:

```
selected = floor(volume × percentage / 100)
form evaluations = selected × average forms
estimated requests = form evaluations × average requests per form
model input cost USD = estimated requests × total tokens per request / 1,000,000 × 0.042
```

The preset is 100,000 selected conversations, one form, one request and 8,000 total
input tokens/request: $33.60. Two average waves: $67.20. Fractional averages are
planning equivalents. Total input includes the transcript and all questions;
question count is not multiplied again. Repeated transcript input in another wave
is counted again. Finite bounded inputs cannot produce NaN or Infinity.

Exclusions are adjacent to results: transcription, Genesys licensing/retrieval,
Cloud Run/Firestore/network, retries, taxes and human review. This is not total
operating cost or a capacity commitment. No request, benchmark or load test is made.

## Seven-chapter prepared story

`?page=demo&tour=quality&step=1` opens one deterministic story:

1. Overview: derived quality, controlled coverage and one calibration warning.
2. Policies: fictional customer-service queue, 50% sample and pinned v3 form.
3. Forms: the actual read-only grouped editor, reusable v2 care provenance,
   conditional escalation, group weights and critical resolution criteria.
4. Conversation: shared product transcript and group-result presentation, with
   explicitly prepared typed answers; Jamie regains access but no timeline is agreed.
5. Analytics: production question aggregation and cohort URL calculations link
   the exact form-version/question cohort back to `fictional-evaluation-1`.
6. My reviews: shared score-comparison presentation, scripted human disagreement,
   in-memory save/complete and immutable original AI answers.
7. Governance: simulated schedule, SLA, warning/delivery and scripted audit,
   followed by the suggested pilot outline.

One explicit clock, `2026-10-03T12:00:00Z` (13:00 Europe/London), governs 24 linked
prepared evaluations and due states. Quality and coverage are computed by existing
domain functions: 48 eligible, 24 sampled/evaluated. Request count is zero. Prepared
execution-wave explanation is not actual provider execution. Other cohort rows
expose their prepared snapshots but do not impersonate the scripted transcript.
Unsupported actions explain their unavailability rather than navigating live.

## Isolation and reuse

`Root` selects the lazy welcome/demo entry before mounting authenticated hooks,
polling, saved clients or browser caches. The demo uses `DemoRepository`, a small
memory-only story repository, and a separate local capability object: no bearer
token, fake ADMIN session, global fetch patch or mock backend. Only the production
Overview wrapper reads authorization; the extracted Overview view is pure.

Reused product presentation includes Overview, operational tables, transcript,
read-only grouped editor, group results and review-score comparison. Pure scoring,
analytics, conditions, review comparison/audit and SLA calculations are shared.
No demo records or preferences are persisted. Reload/restart recreates the same
fixtures. Missing methods fail instead of falling back to production; a failed
lazy-load is caught by a demo-only error boundary. Production authorization and
provider/security paths are not disabled or altered.

## Qualification and preservation

Evidence and reproduction commands are in `docs/ipi-evidence/README.md`.
Deterministic tests: 566 passing across 59 files. Frontend build, server typecheck
and server bundle checks pass. Built-preview browser qualification includes the
relevant A–E regressions and the showcase journeys: 82 passing tests on the final
candidate. Fictional OAuth/API fixtures are used in every authenticated journey.

Network-deny tests reject all protected, external and non-GET attempts. Complete
tours, direct entry, refresh and an established OAuth/session-shaped fixture make
zero forbidden requests. Protected storage reads and writes, clear/remove and
IndexedDB open/delete are denied during isolated journeys. Local/session bytes and
IndexedDB inventory are identical before/after. No production keys are modified.
Missing-repository tests and failed-chunk browser tests prove fail-closed behavior.
Explicit Open AQM separately proves the normal authenticated path still mounts.

Keyboard/pointer Next, Back, Skip, Restart and Exit; browser history; chapter
refresh; reduced motion; primary text/semantic contrast; visible focus and control
bounds are checked. Captures cover 1440×900, 1920×1080 and 390×844: Welcome,
calculator, all seven chapters and representative actual-product fixtures.

No backend/domain/provider runtime changes, Cloud Run redeployment, production
retrieval/evaluation, configuration/data writes, notification sends, retention
purges, IAM/secret/Scheduler edits or runtime-limit increases. Preservation is
supported by source scope and denied/mocked requests, not a new production-state
snapshot comparison; natural Scheduler activity is neither paused nor reverted.

## Publication and limitations

Only the qualified Pages candidate is published, retaining `/Genesys-aqm/`. Exact
tested source, pushed branch HEAD, gh-pages SHA and byte comparisons are recorded
in `docs/ipi-evidence/publication.json` after successful publication. Source-only
documentation/evidence is not included in the dist assets.

Prior Simon-confirmed voice/manual/unattended proof is user-reported, not retested
here. Digital-content and external dispatcher/notification proof remain pending.
Fictional demo and browser tests are not provider, production-scale or actual
live-authentication proof. No customer content, endorsements, certifications,
business savings or commercial commitments are invented. Existing dependency
audit reports seven vulnerabilities; no unrelated dependency upgrade is included.
