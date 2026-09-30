# Genesys AQM · V0.6.1 prototype

A provider-neutral quality management prototype. The built-in 19 conversations and optional demo history are fictional. Genesys Cloud mode uses browser Authorization Code + PKCE and direct Platform API requests after a user signs in. Production evaluation uses Cloud Run with its server-managed Jev credential and durable Firestore records. Browser conversation searches/transcripts share an identity-scoped IndexedDB cache. Real validation of this correction is pending Simon on the Genesys-connected machine.

## Local development

```sh
npm ci
npm test
npm run build
npm run dev
```

Production builds use the public Cloud Run origin in `.env.production` and the public Genesys PKCE defaults in `src/domain/publicConfig.ts`. For local development, put `VITE_AQM_API_ORIGIN` in ignored `.env.local`. `VITE_JEV_PROXY_URL` and a tab Jev key are optional only for the explicit legacy development sandboxes. Normal Conversation Review and durable Form Test do not require Cloudflare or a browser Jev key.

See [V0.6.1 architecture, cache semantics and acceptance checklist](docs/v061-control-plane-cache.md) for the current contract. The older policy-run sections below describe the retained legacy browser implementation.

## Architecture

`ConversationSource` in `src/domain/types.ts` has `status`, paged `list`, `load`, and capabilities. `SyntheticConversationSource` serves the original 19 samples. `GenesysCloudConversationSource` calls the selected Genesys Cloud API host with the browser token and immediately normalizes provider responses through `src/domain/genesys.ts`. Both feed the same `Conversation`, policy matcher, form assignment, Jev provider, `EvaluationRecord`, and analytics. There is no Genesys-specific evaluation path.

The Genesys adapter maps conversation and participant IDs, start/end, media type, direction, user and external contact identity, queue ID/name when the API permits, wrap-up code, duration, transcript phrases, speaker role, and message time. A missing transcript remains an empty message list and is shown as unavailable. The UI never substitutes invented content. Raw Genesys responses are not persisted in browser history.

## Genesys browser connection

See [V0.3A PKCE contract, exact client setup, CORS evidence, and proof ledger](docs/v03a-pkce.md), [V0.3B media contracts](docs/v03b-media-contracts.md), and the [review-required Genesys form recreation](docs/v03b-genesys-form.md). Register `https://simonridd.github.io/Genesys-aqm/` as the authorized redirect URI for a **Code Authorization / PKCE** OAuth client. Settings starts with the public production PKCE client ID and Ireland region; browser-local overrides are available. Connect through Genesys Cloud. The browser sends no Genesys client secret. A temporary access token is held in memory and is lost on reload or disconnect. The Jev Worker remains unchanged; its old Genesys routes may remain temporarily for compatibility but are no longer called by this frontend.

## Policy execution

A policy run starts on the Policies page: select policy and source, set time and optional queue/agent/channel/direction scope, find candidates, preview matches, unavailable transcripts, duplicate conversation/form versions and expected Jev requests, then explicitly confirm `Evaluate N`. There is a hard maximum of 25 matched conversations and two concurrent Jev requests. A double-click lock prevents accidental duplicate submission. Existing records for the same source, conversation, form ID and form version are skipped unless the user explicitly checks re-evaluate. There are no automatic paid retries.

`PolicyRun` stores its ID, policy snapshot, source, start/completion time, candidate and match counts, form IDs, requested/succeeded/failed counts, status, and item failures. Each successful `EvaluationRecord` references the run ID and source. Successful records are persisted as they arrive even if another item fails. Manual single-conversation evaluations remain valid. Analytics defaults to **Real only** and can show Synthetic only or All; run metrics and source breakdowns follow that filter.

## Data and proof boundary

Genesys interactions are real customer data. Normalized searches/transcripts are cached locally in IndexedDB with safe identity scope, active-session guards, bounded retention and explicit clear/Disconnect cleanup. They are never synchronized to Firestore. Evaluation history stores derived results, form snapshots, IDs, metadata and run provenance in browser `localStorage`; policy runs are also browser-local. The Jev request sends a selected normalized transcript and form to TypeSafe only on explicit evaluation. The [proof ledger](docs/v03a-pkce.md#proof-ledger) distinguishes official contract evidence, provider-free tests, Simon's reported live auth and Analytics result, and the still-unproven AQM transcript/evaluation levels.

## Deployment

The Vite base path is `/Genesys-aqm/`. GitHub Pages uses the `gh-pages` branch root. `npm run deploy:pages` builds with the public Cloud Run origin and publishes the frontend. The Worker is optional legacy development infrastructure. Deploy the trusted API from the exact tested source commit and preserve the AQM runtime configuration. No Genesys client secret belongs in Git, Vite environment variables, browser source, browser storage, or logs.

## V0.4 automated monitoring (manual runs)

A monitoring policy combines eligibility criteria, assigned evaluation forms, and a sample of the eligible population. The run flow is: source conversations → criteria → eligible population → deterministic sample → transcript availability and duplicate checks → explicit confirmation → Jev form evaluations → local EvaluationRecords and PolicyRun coverage. Opening a policy and building a plan never call Jev.

The Policies editor offers all eligible, percentage, and fixed-count sampling. Percentage samples use `floor(eligible × percentage / 100)`, so small populations can select zero. Fixed counts are capped at the eligible population. Selection happens after eligibility; transcript-unavailable conversations remain in the sample and coverage denominator. To reproduce a selection, AQM creates a seed from the policy ID, resolved UTC period bounds, strategy, amount, and optional explicit seed. It sorts eligible conversation IDs by unsigned 32-bit FNV-1a hash of `seed|conversationId` (ID breaks hash ties), then takes the first N. The same inputs produce the same IDs independent of API return order. A different period or explicit seed may change them. `all` orders IDs lexically.

The run period is chosen when planning: Today, Yesterday, Last 7 days, or Custom. Local calendar selections resolve to concrete UTC instants with an exclusive end. Genesys Analytics receives these bounds in its server query. Synthetic mode applies the same interval to fixture timestamps; the initial synthetic custom window includes the 19 September 2026 samples. Genesys queries must stay within the existing seven-day API guard. The plan reads at most 500 candidates and loads transcripts only for sampled interactions, with a maximum of 25 sampled interactions per manual run. A truncated population is rejected rather than reported as full coverage.

The plan shows candidate, eligible, sampled, evaluable, and pending counts, the selected IDs and match reasons, transcript gaps, completed form assignments, and estimated Jev requests. A successful existing EvaluationRecord for the same source, conversation ID, form ID, and form version is covered and skipped. Re-evaluation requires an explicit override. Execution retains concurrency two, per-assignment failures, incremental record persistence, and progress. The final confirmation states both the number of interactions and form requests.

Coverage metrics are **run observations**: an interaction in two runs contributes to each run's population. `candidateCount` is source results within the bounded query; `eligibleCount` matches criteria; `sampledCount` is selected after eligibility; `evaluableCount` is sampled with a usable transcript. `evaluatedConversationCount` is sampled interactions with at least one successful assignment (including prior completed assignments). `evaluationCount` counts previously successful assignments plus this run’s successes and failures; `successfulEvaluationCount` counts prior and new successes; `failedEvaluationCount` counts failures in this run. Sampling coverage = sampled / eligible. Evaluation coverage = evaluated sampled / eligible. Sample completion = evaluated sampled / evaluable sampled. Transcript availability = evaluable / sampled. Zero denominators display as unavailable, not 0%. Analytics defaults to real Genesys runs and records and offers a separate Synthetic filter; quality and coverage have separate views.

PolicyRun history snapshots policy configuration, source, resolved period, sampling, deterministic seed, counts, sampled IDs, forms, status, timestamps, and failures. It stores no raw transcript. Run history is browser-local and is intended as an audit of what happened in that browser, not a central enterprise ledger. V0.4 has **manual** run frequency only. Future daily or weekly scheduling must run in a server-side service that calls the same planning and execution domain functions; GitHub Pages does not perform unattended background work.
