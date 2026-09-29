# Genesys AQM · V0.3B prototype

A provider-neutral quality management prototype. The built-in 19 conversations and optional demo history are fictional. Genesys Cloud mode uses browser Authorization Code + PKCE and direct Platform API requests after a user signs in. Simon reported a successful live connection and three real Analytics conversations; a real transcript in AQM remains to be proven.

## Local development

```sh
npm ci
npm test
npm run build
npm run dev
```

Set `VITE_JEV_PROXY_URL` in ignored `.env.local` to the existing public Worker URL ending in `/v1/systemone`. The current public URL is `https://genesys-aqm-jev-proxy.periwinkle-monitor.workers.dev/v1/systemone`. Genesys authentication and API calls no longer use that Worker URL. This URL is public, not a credential. The Jev key remains in tab session storage and is sent through the existing fixed-purpose Worker route.

## Architecture

`ConversationSource` in `src/domain/types.ts` has `status`, paged `list`, `load`, and capabilities. `SyntheticConversationSource` serves the original 19 samples. `GenesysCloudConversationSource` calls the selected Genesys Cloud API host with the browser token and immediately normalizes provider responses through `src/domain/genesys.ts`. Both feed the same `Conversation`, policy matcher, form assignment, Jev provider, `EvaluationRecord`, and analytics. There is no Genesys-specific evaluation path.

The Genesys adapter maps conversation and participant IDs, start/end, media type, direction, user and external contact identity, queue ID/name when the API permits, wrap-up code, duration, transcript phrases, speaker role, and message time. A missing transcript remains an empty message list and is shown as unavailable. The UI never substitutes invented content. Raw Genesys responses are not persisted in browser history.

## Genesys browser connection

See [V0.3A PKCE contract, exact client setup, CORS evidence, and proof ledger](docs/v03a-pkce.md), [V0.3B media contracts](docs/v03b-media-contracts.md), and the [review-required Genesys form recreation](docs/v03b-genesys-form.md). Register `https://simonridd.github.io/Genesys-aqm/` as the authorized redirect URI for a **Code Authorization / PKCE** OAuth client. Enter the public Client ID and select the region in Settings, then connect through Genesys Cloud. The browser sends no Genesys client secret. A temporary access token is held in memory and is lost on reload or disconnect. The Jev Worker remains unchanged; its old Genesys routes may remain temporarily for compatibility but are no longer called by this frontend.

## Policy execution

A policy run starts on the Policies page: select policy and source, set time and optional queue/agent/channel/direction scope, find candidates, preview matches, unavailable transcripts, duplicate conversation/form versions and expected Jev requests, then explicitly confirm `Evaluate N`. There is a hard maximum of 25 matched conversations and two concurrent Jev requests. A double-click lock prevents accidental duplicate submission. Existing records for the same source, conversation, form ID and form version are skipped unless the user explicitly checks re-evaluate. There are no automatic paid retries.

`PolicyRun` stores its ID, policy snapshot, source, start/completion time, candidate and match counts, form IDs, requested/succeeded/failed counts, status, and item failures. Each successful `EvaluationRecord` references the run ID and source. Successful records are persisted as they arrive even if another item fails. Manual single-conversation evaluations remain valid. Analytics defaults to **Real only** and can show Synthetic only or All; run metrics and source breakdowns follow that filter.

## Data and proof boundary

Genesys interactions are real customer data. Search and transcript data remain in browser memory while the page is open. Evaluation history stores derived results, form snapshots, IDs, metadata and run provenance in browser `localStorage`; policy runs are also browser-local. The Jev request sends a selected normalized transcript and form to TypeSafe only on explicit evaluation. The [proof ledger](docs/v03a-pkce.md#proof-ledger) distinguishes official contract evidence, provider-free tests, Simon's reported live auth and Analytics result, and the still-unproven AQM transcript/evaluation levels.

## Deployment

The Vite base path is `/Genesys-aqm/`. GitHub Pages uses the `gh-pages` branch root. With the public Jev Worker URL set in ignored `.env.local`, `npm run deploy:pages` builds and publishes the frontend. The Worker does not need redeployment for V0.3A. No Genesys client secret belongs in Git, Vite environment variables, browser source, browser storage, or logs.
