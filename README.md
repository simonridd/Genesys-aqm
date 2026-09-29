# Genesys AQM · V0.3 prototype

A provider-neutral quality management prototype. The built-in 19 conversations and optional demo history are fictional. Genesys Cloud mode handles real organizational data only after its Worker connection is configured.

## Local development

```sh
npm ci
npm test
npm run build
npm run dev
```

Set `VITE_JEV_PROXY_URL` in ignored `.env.local` to the existing public Worker URL ending in `/v1/systemone`. The current public URL is `https://genesys-aqm-jev-proxy.periwinkle-monitor.workers.dev/v1/systemone`. The frontend derives the Genesys route base from it. This URL is public, not a credential. The Jev key remains in tab session storage and is sent through the existing fixed-purpose Worker route.

## Architecture

`ConversationSource` in `src/domain/types.ts` has `status`, paged `list`, `load`, and capabilities. `SyntheticConversationSource` serves the original 19 samples. `GenesysCloudConversationSource` calls the Worker and immediately normalizes provider responses through `src/domain/genesys.ts`. Both feed the same `Conversation`, policy matcher, form assignment, Jev provider, `EvaluationRecord`, and analytics. There is no Genesys-specific evaluation path.

The Genesys adapter maps conversation and participant IDs, start/end, media type, direction, user and external contact identity, queue ID/name when the API permits, wrap-up code, duration, transcript phrases, speaker role, and message time. A missing transcript remains an empty message list and is shown as unavailable. The UI never substitutes invented content. Raw Genesys responses are not persisted in browser history.

## Genesys connection and supported APIs

The static GitHub Pages frontend never receives a Genesys client secret or OAuth token. The existing Cloudflare Worker now isolates Genesys routes under `/v1/genesys/`; `/v1/systemone` retains the Jev relay. The Worker uses an OAuth client credentials integration with a read-only role, limited division access, and these Worker secrets:

```sh
npx wrangler secret put GENESYS_REGION --config proxy/wrangler.jsonc
npx wrangler secret put GENESYS_CLIENT_ID --config proxy/wrangler.jsonc
npx wrangler secret put GENESYS_CLIENT_SECRET --config proxy/wrangler.jsonc
npx wrangler secret put AQM_ACCESS_KEY --config proxy/wrangler.jsonc
npm run proxy:deploy
```

The region value is a supported environment host such as `mypurecloud.ie`, without `https://`. The client ID and secret are managed in Genesys Cloud, not in Settings or browser storage. Settings displays the configured region/client ID after a successful test. The separate `AQM_ACCESS_KEY` is entered in Settings and stored only in tab session storage. It is a prototype access gate for Worker routes; do not treat browser-local data or this single shared key as production authorization. Provision secrets only after the operator supplies them through the Cloudflare secret flow. Origin checks alone are not access control.

The Worker calls:

- `POST https://login.{region}/oauth/token` with Basic client credentials and `grant_type=client_credentials`.
- `POST /api/v2/analytics/conversations/details/query` for bounded paged discovery; `GET /api/v2/analytics/conversations/{conversationId}/details` for a selected interaction.
- `GET /api/v2/routing/queues/{queueId}` to enrich queue names when permitted.
- `GET /api/v2/speechandtextanalytics/conversations/{conversationId}/communications/{communicationId}/transcripturl`, then the HTTPS signed transcript URL from an allowed AWS host. Missing, unprocessed, or inaccessible transcripts remain unavailable.

The Worker caps a query at seven days, page size 25, and page number 20. The browser defaults to 24 hours and page size 10. The policy preview deliberately inspects at most the first 25 candidates and warns when more pages exist; narrow the scope for complete coverage. Integration roles and division access must permit analytics detail, queue lookup for names, and Speech and Text Analytics transcript access. Transcript availability also depends on organizational recording/transcription setup and the media type.

Official references: [Genesys Cloud JavaScript SDK authentication](https://github.com/MyPureCloud/platform-client-sdk-javascript#authentication), [Analytics API SDK reference](https://github.com/MyPureCloud/platform-client-sdk-javascript/blob/master/build/docs/AnalyticsApi.md), [Speech and Text Analytics SDK reference](https://github.com/MyPureCloud/platform-client-sdk-javascript/blob/master/build/docs/SpeechTextAnalyticsApi.md), [Routing API SDK reference](https://github.com/MyPureCloud/platform-client-sdk-javascript/blob/master/build/docs/RoutingApi.md).

## Policy execution

A policy run starts on the Policies page: select policy and source, set time and optional queue/agent/channel/direction scope, find candidates, preview matches, unavailable transcripts, duplicate conversation/form versions and expected Jev requests, then explicitly confirm `Evaluate N`. There is a hard maximum of 25 matched conversations and two concurrent Jev requests. A double-click lock prevents accidental duplicate submission. Existing records for the same source, conversation, form ID and form version are skipped unless the user explicitly checks re-evaluate. There are no automatic paid retries.

`PolicyRun` stores its ID, policy snapshot, source, start/completion time, candidate and match counts, form IDs, requested/succeeded/failed counts, status, and item failures. Each successful `EvaluationRecord` references the run ID and source. Successful records are persisted as they arrive even if another item fails. Manual single-conversation evaluations remain valid. Analytics defaults to **Real only** and can show Synthetic only or All; run metrics and source breakdowns follow that filter.

## Data and proof boundary

Genesys interactions are real customer data. Search and transcript data remain in browser memory while the page is open. Evaluation history stores derived results, form snapshots, IDs, agent/queue/topic metadata and run provenance in browser `localStorage`; policy runs are also browser-local. The Jev request sends the selected normalized transcript and form to TypeSafe only on explicit evaluation. The Worker does not log transcripts or store provider responses. Browser-local persistence, a shared Worker access key and manual secret provisioning make this a prototype, not a production retention or access-control design.

- **A. Provider-free:** fixtures cover normalization, missing transcripts, source paging, policy preview, partial failures and provenance; `npm test` exercises these without credentials.
- **B. Genesys connection:** requires the four Worker secrets and an authorized Genesys Cloud integration. Not proven by fixtures.
- **C. End-to-end:** requires a real completed interaction with an available transcript plus a real Jev key and an explicitly confirmed policy run. Not proven by fixtures.

## Deployment

The Vite base path is `/Genesys-aqm/`. GitHub Pages uses the `gh-pages` branch root. With the public Worker URL set in `.env.local`, `npm run deploy:pages` builds and publishes the frontend. Deploy the Worker with `npm run proxy:deploy` only after verifying Jev route regression tests. No Genesys secret belongs in Git, Vite environment variables, browser source, browser storage, or logs.
