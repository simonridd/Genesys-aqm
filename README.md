# Genesys AQM · V0.2 prototype

A provider-neutral automated quality management demonstration. All built-in conversations and optional demo evaluation history are **synthetic**. The evaluation forms are examples, not official Genesys forms. There is no live Genesys integration.

## Local development

```sh
npm ci
npm test
npm run dev
```

Set `VITE_JEV_PROXY_URL` in ignored `.env.local` to the existing public proxy URL before building or running the app. The current proxy is `https://genesys-aqm-jev-proxy.periwinkle-monitor.workers.dev/v1/systemone`. This is a public endpoint, not a credential. Enter a restricted TypeSafe Jev key in the app Settings page to perform a real evaluation. The key stays in tab session storage and is forwarded by the fixed-purpose Cloudflare Worker. Do not put an API key in source or build configuration.

## Model and workflow

- `src/domain/conversations.ts` supplies 19 substantial synthetic conversations using the existing Conversation contract, with queue, topic, channel, direction, agent and tag metadata.
- `src/domain/forms.ts` defines five editable Evaluation Forms with versioned questions, weights, pass scores and critical questions. A prior locally edited V0.1 scorecard is imported as a separate form on first V0.2 load.
- `src/domain/policies.ts` defines provider-neutral Interaction Policies. Conditions within each group use AND; groups use OR. Matching enabled policies assign one or more form IDs; duplicates are removed. The app shows the matching conditions and allows a manual form choice.
- `src/provider/jev.ts` retains the existing `noul`, `choice` and `score` mapping. Each form is sent in its own request. Jev supplies typed judgements; the app owns routing, normalization, weighting and persistence.
- `src/domain/evaluations.ts` creates browser-local EvaluationRecord history with a full form snapshot, version, question results, policy provenance and source. Editing a form later does not rewrite past records.
- `src/domain/analytics.ts` derives all KPIs and breakdowns from EvaluationRecords. `src/domain/demoHistory.ts` generates separately labelled synthetic fixtures. Loading the fixture data replaces prior fixtures while retaining real Jev records; Clear history removes both.

## Deploy

The Vite base path is `/Genesys-aqm/`. GitHub Pages uses the `gh-pages` branch root. With the public proxy URL set in `.env.local`, run `npm run deploy:pages` to build and publish locally. GitHub Actions are not required. Verify the live URL after deployment. The Cloudflare Worker is unchanged in V0.2.
