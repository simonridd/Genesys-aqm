# Genesys AQM · V0 prototype

A small Automated Quality Management web app. Load a synthetic or uploaded contact-centre conversation, edit a QM scorecard, and evaluate it with TypeSafe Jev. Jev supplies typed judgments; the app displays uncertainty and calculates the weighted quality score.

This is an independent demonstration. It does not connect to Genesys Cloud. The bundled transcripts and scorecard are synthetic examples, not official Genesys data or policy.

## Run locally

```sh
npm ci
npm run dev
```

Open the Vite URL, go to **Settings**, and enter a TypeSafe API key. Choose a sample or upload a JSON conversation, then select **Evaluate conversation**. Run `npm test` and `npm run build` to verify logic and production output.

## Conversation JSON

Upload one JSON object with `conversationId`, `startedAt` (date/time), `channel`, `agent` and `customer` objects containing `id` and `name`, string-valued `metadata`, and a non-empty `messages` array. Each message needs a unique `id`, valid `timestamp`, `speaker` (`agent` or `customer`), and non-empty `text`. See [`public/samples/billing-conversation.json`](public/samples/billing-conversation.json). Uploads are validated and capped at 1 MB.

## Evaluation architecture

`src/domain` defines provider-neutral conversation, scorecard, request, and result types plus validation. `src/provider/jev.ts` alone maps enabled scorecard questions to Jev's `noul`, `choice`, and `score` HTTP contract and normalizes its typed answers. The UI calls an `EvaluationProvider` interface, so a later server-side proxy can replace the browser transport without changing the scorecard or results views. All enabled questions go in one request to `POST https://api.typesafe.ai/v1/systemone` with model `jev-latest`.

Noul is a calibrated yes probability; the scorecard's configurable threshold (default 0.65) converts it to a displayed Yes/No and binary credit. Choice uses option keys and descriptions; options with no credit are excluded from aggregation. Score sends ordered descriptive levels and uses Jev's returned level probabilities against the scorecard's credit values. The app computes a weighted mean over scorable questions with positive weights. No rationale text is requested or fabricated. Raw provider data is available in a developer disclosure.

## Credentials and static hosting

The key is entered by the user, held in browser `sessionStorage`, masked after saving, and cleared on request or at session end. It is never committed or logged by the app. This is **prototype credential handling**: browser scripts and developer tools can access the key. Use a restricted demo key. Browser CORS policy may prevent calls to TypeSafe; the app reports that failure. V1 should put the key and Jev transport behind a small server-side proxy.

The Vite base path is `/Genesys-aqm/`. Publishing is done locally with `npm run deploy:pages`: this runs the production build and pushes `dist` to a dedicated `gh-pages` branch. In repository **Settings → Pages**, choose **Deploy from a branch**, branch `gh-pages`, folder `/ (root)`. This does not need a GitHub Actions workflow. A feature branch push alone does not deploy the site. Verify the live URL after publishing.

API integration follows the current [TypeSafe HTTP reference](https://docs.typesafe.ai/api), [Noul](https://docs.typesafe.ai/primitives/noul), [Choice](https://docs.typesafe.ai/primitives/choice), and [Score](https://docs.typesafe.ai/primitives/score) documentation.
