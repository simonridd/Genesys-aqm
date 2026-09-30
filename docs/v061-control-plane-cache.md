# V0.6.1 trusted manual evaluation and browser conversation cache

Starting source: `79f7dfaa6ec8be1d1bde5425d6095dc60640cfa0` on `codex/aqm-v0-6-operational-product`. Correction branch: `codex/aqm-v0-6-1-control-plane-cache` in a separate checkout. No PR; no Environment Builder changes.

## Confirmed root cause and correction

`App.tsx` constructed `JevProxyProvider` from `VITE_JEV_PROXY_URL`, required a tab Jev key, and used that provider for manual Conversation Review. `FormTestPanel.tsx` used the same provider in browser mode. An empty endpoint raised the missing-proxy warning. Meanwhile `server/providers.ts` already implemented `DirectJev`, with `JEV_API_KEY` supplied to Cloud Run through its existing Secret Manager reference. Adding a proxy URL would preserve the wrong production dependency.

Conversation Review now calls authorized `POST /api/evaluations/manual`. The request accepts exactly `source`, `conversationId`, `formId`, and integer `formVersion`. Browser-supplied forms, transcripts, context overrides, and re-evaluation flags are rejected. Request bodies are bounded to 100,000 bytes. Existing Genesys user-token validation and the allowlist protect the route. Server credentials load the Genesys conversation and normalize its transcript; built-in synthetic conversations load from the trusted sample library. Uploaded JSON remains review-only.

The server resolves the exact stored published, enabled and valid form. Recreated Genesys forms remain review-only. The browser loads server forms for production selection. A deterministic Firestore reservation protects concurrent manual calls and interrupted paid requests. An equivalent prior PRODUCTION record (including a prior policy/scheduled result) returns `duplicate` without another transcript retrieval or Jev call. A started/uncertain reservation returns HTTP 409 and requires operator reconciliation. Retrieval failure before reservation is safe to retry. No manual server re-evaluation contract existed, so this endpoint intentionally has none; existing explicit legacy policy sandbox re-evaluation stays local.

Cloud Run calls its existing `DirectJev`, persists `EvaluationRecord` with `purpose=PRODUCTION` and `executionMode=manual`, then returns that normalized record. Records contain the exact form snapshot, metadata, typed question results and provenance, with no conversation messages or raw Jev response. The result is durable before the UI shows success; Evaluation Explorer and server analytics read it directly, without browser history. Provider/persistence failures after reservation return a generic uncertain result, not raw provider errors.

The normal path is Browser → Cloud Run → Jev → Firestore. Cloudflare, a browser Jev key, and `VITE_JEV_PROXY_URL` are unnecessary for this path. The existing proxy remains only for the explicit legacy Form Test and policy development sandboxes. Settings hides tab-key controls under an explicit legacy development disclosure. The obsolete production prerequisite warning was removed from both the main UI and the provider error. Durable server Form Test is the deployed default and retains its separate `formTestRuns` storage and FORM_TEST isolation. No production metrics, coverage, operational agent score, monitoring completion, or duplicate suppression uses FORM_TEST results.

TypeSafe's current API and question contract were checked at https://docs.typesafe.ai/api. Existing Jev request questions and scoring were preserved.

## Public Genesys configuration

`src/domain/publicConfig.ts` contains only Ireland (`eu-west-1`) and the public PKCE client ID `e05784c9-2421-4c2b-a3af-79fafb25aea8`, read from Simon's earlier connected AQM Settings screenshot. It is distinct from the server client-credentials client. A fresh browser receives these defaults, while valid local region/client overrides still work. `getConfig` copies only these two fields. No Secret Manager value was retrieved to create this configuration.

`.env.production` contains only the public Cloud Run origin, `https://aqm-api-bd54ukouga-nw.a.run.app`. No browser Jev proxy is set for production. No client secret, server access token or Jev key is present in static configuration.

## Shared browser cache and navigation

`ConversationCache` owns normalized application objects in IndexedDB (`genesys-aqm-conversations-v1`), with in-memory fallback when IndexedDB is unavailable. `CachedGenesysSource` wraps browser browsing, Conversation Review, Explorer links, legacy browser policy planning and Form Test candidates/transcript retrieval. The server source is not wrapped and remains authoritative.

Scope is `[region, public OAuth client ID, organization ID when returned, authenticated user ID]`. PKCE obtains safe identity data from `/users/me`; if identity lookup is unavailable, browsing can proceed but cache reads/writes stay disabled. Tokens are only in memory and never form cache keys. Every wrapper operation requires an active session and re-checks identity/session generation after async operations. In-flight retrieval cannot repopulate the cache after explicit Disconnect or Clear.

Search keys include the scope, canonical date window, queue, agent, channel, direction, page and page size. Search snapshots store normalized metadata only, reported total, hasMore and retrieval timestamp. TTL is **15 minutes**. Cached search snapshots, including stale snapshots, are returned without automatic provider refresh. The UI shows retrieval time, marks stale data, and provides Refresh search.

Opened completed transcripts have a **24-hour** TTL. Only normalized completed conversations with transcript messages are saved. Fresh hits avoid provider retrieval; expired hits retrieve normally. Conversation Review shows cache/retrieval age and provides Refresh from Genesys. This prototype treats completed interactions as effectively immutable but retains explicit refresh.

Bounds are **30 search snapshots**, **100 completed transcripts**, **5 MB per entry**, and **30 MB total**, evicted oldest first. Metadata and message fields are copied through explicit allowlists; raw provider payloads, extra auth fields and signed download URLs are omitted. No transcript is logged or synchronized to Firestore. Intentional server evaluation fetches its own transcript and sends it only to Jev; browser cache is never submitted to the server evaluation API.

The authenticated Conversations component remains mounted inside the SPA while other pages are active, so from/to, queue, agent, channel, direction, page, results, total, hasMore, retrieval timestamp, view choice and practical scroll position survive navigation. Navigation back never calls Genesys. The component is removed on session loss and reset after explicit clear. Conversation Review has a direct Back to conversations/Back to evaluations action. Search/transcript caches are shared across all entry points. Form Test can reuse a fresh cached page from the last seven days, clearly labeling its period and filters; it does not claim that one page is an entire period.

Settings shows cached search/transcript counts and oldest/newest timestamps, with Clear cached Genesys data. Explicit Disconnect drops the session and clears its identity's cache; when a safe identity is unavailable it clears all cached Genesys entries. No data can be viewed from cache without an active session. Expired Form Test candidates are also cleared from view.

## Validation and deployment policy

Provider-free tests cover manual API authorization, authoritative versions, blocked forms, input injection, invalid IDs, persistence/non-retention, equivalent production duplicates, concurrency, uncertain requests, synthetic loading and FORM_TEST isolation. Cache tests cover normalized snapshots/transcripts, stable keys, identity separation, TTL, provider-call avoidance, explicit refresh, bounded eviction, fallback, clear and Disconnect cleanup. Public-config tests cover defaults, override and field allowlisting.

Playwright exercises existing operational pages plus a mocked Genesys/Cloud Run workflow at desktop and mobile sizes. It verifies second-page restoration without a new search, transcript reuse/refresh, manual server request shape, durable Explorer links, server-default Form Test sampling reuse, IndexedDB content safety and Disconnect deletion. All fixtures are clearly provider-free; no real Genesys login, transcript download or paid Jev call is performed by these tests.

Deployment must use a committed source SHA, preserve existing AQM service account, env configuration, Secret Manager references, traffic and Scheduler settings, and record its Cloud Run revision/image digest. Pages uses the existing gh-pages publication process. Public health, authorization boundary and asset smoke checks prove deployment only.

## Pending Simon live validation

1. Hard-refresh Pages.
2. Confirm Settings already knows Ireland and the OAuth client ID.
3. Connect Genesys.
4. Search completed conversations.
5. Open one with a transcript.
6. Back to Conversations: confirm filters, page and results remain without another search.
7. Reopen the same conversation: confirm the cached transcript loads.
8. Refresh from Genesys explicitly: confirm retrieval works.
9. Evaluate a safe published form: confirm no Jev proxy warning.
10. Confirm the result appears in server Evaluation Explorer and production analytics.
11. Run a small durable Form Test: confirm server Jev works and production analytics are unchanged.

No key or transcript text needs to be reported back. Real Genesys/Jev proof is **PENDING SIMON LIVE VALIDATION**, not a failed release check on this Mac.
