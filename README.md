# Genesys AQM · V0 prototype

A small Automated Quality Management web app. Load a synthetic or uploaded contact-centre conversation, edit a QM scorecard, and evaluate it with TypeSafe Jev. Jev supplies typed judgments; the app displays uncertainty and calculates the weighted quality score.

This is an independent demonstration. It does not connect to Genesys Cloud. The bundled transcripts and scorecard are synthetic examples, not official Genesys data or policy.

## Run locally

Use Node 22 or 24.

```sh
npm ci
npm run proxy:dev  # separate terminal; serves http://localhost:8787
```

Set `VITE_JEV_PROXY_URL=http://localhost:8787/v1/systemone` in an ignored `.env.local` file, then run `npm run dev`. Open the Vite URL, go to **Settings**, and enter a TypeSafe API key. Choose a sample or upload a JSON conversation, then select **Evaluate conversation**. Run `npm test` and `npm run build` to verify logic and production output.

## Conversation JSON

Upload one JSON object with `conversationId`, `startedAt` (date/time), `channel`, `agent` and `customer` objects containing `id` and `name`, string-valued `metadata`, and a non-empty `messages` array. Each message needs a unique `id`, valid `timestamp`, `speaker` (`agent` or `customer`), and non-empty `text`. See [`public/samples/billing-conversation.json`](public/samples/billing-conversation.json). Uploads are validated and capped at 1 MB.

## Evaluation architecture

`src/domain` defines provider-neutral conversation, scorecard, request, and result types plus validation. `src/provider/jev.ts` maps enabled scorecard questions to Jev's `noul`, `choice`, and `score` HTTP contract and normalizes its typed answers. The UI calls an `EvaluationProvider` interface. `proxy/src/index.ts` is a small Cloudflare Worker that accepts requests from the Pages origin, forwards only bounded Jev requests to the fixed TypeSafe endpoint, and returns the response with browser CORS headers. All enabled questions go in one Jev request.

Noul is a calibrated yes probability; the scorecard's configurable threshold (default 0.65) converts it to a displayed Yes/No and binary credit. Choice uses option keys and descriptions; options with no credit are excluded from aggregation. Score sends ordered descriptive levels and uses Jev's returned level probabilities against the scorecard's credit values. The app computes a weighted mean over scorable questions with positive weights. No rationale text is requested or fabricated. Raw provider data is available in a developer disclosure.

## Credentials and proxy

The key is entered by the user, held in browser `sessionStorage`, masked after saving, and cleared on request or at session end. The browser sends it to the AQM proxy, which forwards it to TypeSafe without storing or logging it. The proxy has a fixed upstream URL and an origin allowlist, but an origin allowlist is **not authentication**. Browser scripts, developer tools, and the proxy operator can access the key. Use a restricted demo key and synthetic transcripts. No API key belongs in source, `.env.local`, Wrangler configuration, or the Pages build.

The TypeSafe API does not permit this Pages app's direct browser call under its current CORS policy; the proxy is required for live evaluation. The Worker stores no TypeSafe secret. If a later version needs a shared server key, it will also need authentication and rate limits so a public site cannot spend against that key.

## Deploy without GitHub Actions

The frontend remains on GitHub Pages with Vite base path `/Genesys-aqm/`. Pages should use **Deploy from a branch**, `gh-pages`, `/ (root)`. `npm run deploy:pages` builds locally and pushes `dist` to that branch.

Deploy the proxy from a Cloudflare account with `npx wrangler login` and `npm run proxy:deploy`. Its `workers.dev` URL is public. Set `VITE_JEV_PROXY_URL` to the resulting HTTPS URL plus `/v1/systemone` in `.env.local` before running `npm run deploy:pages`. This URL is not a secret; it is compiled into the frontend. Verify the public Pages site and a live Jev request with a user-supplied demo key after deployment. GitHub Pages alone cannot run the proxy.

API integration follows the [TypeSafe HTTP reference](https://docs.typesafe.ai/api). The Worker follows Cloudflare's [fetch handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/) and [CORS proxy](https://developers.cloudflare.com/workers/examples/cors-header-proxy/) guidance.
