# V0.3A: browser Genesys Cloud PKCE contract and proof

Checked 29 September 2026. This is a browser prototype. No live Genesys organization login or customer transcript was available during implementation.

## Official contract

Genesys Cloud [OAuth client setup](https://help.genesys.cloud/articles/create-an-oauth-client/) lists Code Authorization / PKCE, recommends it for new clients after implicit grant creation ended on 25 May 2026, and requires an authorized redirect URI. The [official JavaScript SDK](https://github.com/MyPureCloud/platform-client-sdk-javascript#authentication) explicitly supports `loginPKCEGrant` in a browser, stores its generated verifier in `sessionStorage`, and calls `oauth/token` after return. Its browser SDK examples show API requests using the resulting bearer token. The [PKCE guide](https://developer.genesys.cloud/authorization/platform-auth/use-pkce) is the provider's flow reference. This implementation uses `response_type=code`, `client_id`, exact `redirect_uri`, random `state`, random `code_verifier`, SHA-256 base64url `code_challenge`, and `code_challenge_method=S256`. The code exchange sends `grant_type=authorization_code`, code, client ID, redirect URI, and verifier as form fields. No client secret is sent. Ordinary Code Authorization without PKCE can use a secret; the public PKCE path documented by the SDK does not.

The exact **production redirect URI** to register is `https://simonridd.github.io/Genesys-aqm/`. The callback is handled at this static Pages root, avoiding a deep-link 404. The transaction records the prior AQM page and restores it after success. OAuth query parameters are removed with `history.replaceState` before token exchange, including on malformed responses. The verifier, state, region, client ID and page are temporarily kept in tab `sessionStorage`, then deleted after callback. The access token and expiry are kept in JavaScript memory only. A reload therefore requires connecting again; expiry and HTTP 401 require reconnecting. The public client ID and selected region are stored in `localStorage`. There is no refresh-token request or `offline_access` scope; no refresh token is retained. The official browser PKCE SDK documents initial login, while its documented refresh helper is for secret-bearing Code Authorization. The app does not assume a browser-safe refresh grant is available and instead requires a new login at expiry. Genesys lets administrators set the OAuth token duration from 300 to 172,800 seconds; the app uses the returned `expires_in`, not a hard-coded lifetime. Disconnect drops the local token and pending transaction. It does **not** revoke a Genesys token or sign the user out of Genesys Cloud. An administrator can [revoke an authorized application](https://help.genesys.cloud/articles/view-authorized-oauth-clients/); Genesys [universal logout](https://help.genesys.cloud/articles/log-out-universally-from-all-clients/) depends on organization settings.

## Region mapping

The region selector is an allowlist in `src/domain/genesysAuth.ts`. It pairs `https://login.<region>` for `/oauth/authorize` and `/oauth/token` with `https://api.<region>` for Platform APIs. Ireland (`mypurecloud.ie`) is the default; Frankfurt (`mypurecloud.de`), US East (`mypurecloud.com`), US West (`usw2.pure.cloud`), Australia (`mypurecloud.com.au`), and Japan (`mypurecloud.jp`) are included. These are Genesys environment hosts reflected in the [official JavaScript SDK region examples](https://github.com/MyPureCloud/platform-client-sdk-javascript#setting-the-environment) and the preexisting Worker allowlist. An arbitrary user-provided hostname cannot be used.

## Client setup for Simon

1. In the appropriate Genesys Cloud organization, go to **Menu → IT and Integrations → OAuth → Add client**. Create a **Code Authorization / PKCE** client. Copy its **Client ID** into AQM Settings; do not enter or distribute its client secret.
2. Register the exact authorized redirect URI `https://simonridd.github.io/Genesys-aqm/`. Set a suitably short token duration and minimum scopes for the API families below.
3. Give the signing-in **user** roles and division access for `analytics:conversationDetail:view` (or the narrower `analytics:agentConversationDetail:view` where sufficient), `routing:queue:view` for optional queue names, and **both** `recording:recording:view` and `speechAndTextAnalytics:data:view` for transcript URL retrieval. The official [Analytics](https://github.com/MyPureCloud/platform-client-sdk-javascript/blob/master/build/docs/AnalyticsApi.md), [Routing](https://github.com/MyPureCloud/platform-client-sdk-javascript/blob/master/build/docs/RoutingApi.md), [Speech and Text Analytics](https://github.com/MyPureCloud/platform-client-sdk-javascript/blob/master/build/docs/SpeechTextAnalyticsApi.md), and [Users](https://github.com/MyPureCloud/platform-client-sdk-javascript/blob/master/build/docs/UsersApi.md) SDK API references state these permissions. `/api/v2/users/me` requires no additional permission. Genesys' client setup calls for minimum OAuth scopes; choose scopes that allow these APIs in this organization. The role and division grants still govern what the user can see.
4. Connect in AQM Settings and run **Verify connection**. It reports identity, Analytics/query access, number of recent completed interactions, and sampled transcript availability separately.

## Direct browser CORS findings

Credential-free HTTP OPTIONS requests from `Origin: https://simonridd.github.io` on 29 September 2026 returned these results in the Ireland region:

| Endpoint | Preflight result | Proof level |
| --- | --- | --- |
| `POST https://login.mypurecloud.ie/oauth/token` (`content-type`) | HTTP 204; allowed origin, method and header | Provider-free technically plausible |
| `GET /api/v2/users/me` (`authorization`) | HTTP 200; allowed origin and header | Provider-free technically plausible |
| `POST /api/v2/analytics/conversations/details/query` (`authorization,content-type`) | HTTP 200; allowed origin, method and headers | Provider-free technically plausible |
| `GET /api/v2/analytics/conversations/{id}/details` (`authorization`) | HTTP 200; allowed origin and header | Provider-free technically plausible |
| `GET /api/v2/routing/queues/{id}` (`authorization`) | HTTP 200; allowed origin and header | Provider-free technically plausible |
| `GET /api/v2/speechandtextanalytics/conversations/{id}/communications/{id}/transcripturl` (`authorization`) | HTTP 200; allowed origin and header | Provider-free technically plausible |

The official browser SDK is evidence of **documented supported browser API calls** in general. The OPTIONS results prove only preflight behavior at these specific endpoints without credentials. They do not prove a successful authenticated response. The transcript endpoint returns a **pre-signed S3 URL** according to the official SDK reference. No real signed URL was available, so the storage host's CORS policy and resulting transcript download remain **unproven**. The browser source only fetches HTTPS URLs on the preexisting AWS/CloudFront allowlist and treats a failed or unavailable transcript as unavailable; it never fabricates one. If that signed URL lacks browser CORS permission, the smallest safe server-side component is a narrow authenticated transcript fetch endpoint (with appropriate access control and bounded response), while other Genesys calls can remain browser-direct. Do not proxy or expose client secrets in the SPA.

The existing Worker Genesys routes remain for compatibility, but V0.3A frontend calls Genesys directly. The `/v1/systemone` Jev route and Jev key flow are unchanged. No Worker deployment is required for this tranche.

## Proof ledger

- **A. PKCE CONTRACT — achieved:** current official Genesys OAuth client docs and browser JavaScript SDK support Code Authorization + PKCE.
- **B. PROVIDER-FREE — achieved:** deterministic PKCE/callback/source tests; production build; credential-free CORS preflights listed above.
- **C. BROWSER AUTH — not achieved:** no real user completed consent and callback.
- **D. DIRECT API — not achieved:** no browser-issued token used against a real Analytics query.
- **E. TRANSCRIPT — not achieved:** no eligible signed transcript URL or browser download was available.
- **F. END-TO-END AQM — not achieved:** requires a real transcript, policy run confirmation, and Jev evaluation.

Synthetic mode remains available without Genesys authentication. The existing policy preview, 25-interaction cap, explicit paid confirmation, concurrency two, duplicate logic, partial-success persistence, and provenance are unchanged.
