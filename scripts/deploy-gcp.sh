#!/usr/bin/env bash
set -euo pipefail
PROJECT=genesys-aqm-2026
REGION=europe-west2
SERVICE=aqm-api
RUNTIME=aqm-runtime@genesys-aqm-2026.iam.gserviceaccount.com
SCHEDULER=aqm-scheduler@genesys-aqm-2026.iam.gserviceaccount.com
: "${AQM_ALLOWED_GENESYS_USER_IDS:=}"
: "${GENESYS_REGION:=eu-west-1}"
for name in aqm-genesys-client-id aqm-genesys-client-secret aqm-jev-api-key; do
  count=$(gcloud secrets versions list "$name" --project="$PROJECT" --filter='state=ENABLED' --format='value(name)' | wc -l | tr -d ' ')
  if [[ "$count" == 0 ]]; then echo "Secret $name has no enabled version; add it in Secret Manager before deployment." >&2; exit 1; fi
done
# Browser requests use short-lived Genesys PKCE tokens validated against an explicit user allowlist.
# Scheduler requests use Google OIDC and are checked against its exact service account email.
AUDIENCE=$(gcloud run services describe "$SERVICE" --region="$REGION" --project="$PROJECT" --format='value(status.url)' 2>/dev/null || true)
AUDIENCE=${AUDIENCE:-https://invalid.example}
gcloud run deploy "$SERVICE" --source=. --region="$REGION" --project="$PROJECT" \
  --service-account="$RUNTIME" --allow-unauthenticated --max-instances=2 --concurrency=10 --timeout=3600 \
  --set-env-vars="AQM_ALLOWED_ORIGIN=https://simonridd.github.io,AQM_ALLOWED_GENESYS_USER_IDS=$AQM_ALLOWED_GENESYS_USER_IDS,AQM_SCHEDULER_EMAIL=$SCHEDULER,AQM_SCHEDULER_AUDIENCE=$AUDIENCE,GENESYS_REGION=$GENESYS_REGION" \
  --set-secrets='GENESYS_CLIENT_ID=aqm-genesys-client-id:1,GENESYS_CLIENT_SECRET=aqm-genesys-client-secret:1,JEV_API_KEY=aqm-jev-api-key:1'
URL=$(gcloud run services describe "$SERVICE" --region="$REGION" --project="$PROJECT" --format='value(status.url)')
if [[ "$AUDIENCE" != "$URL" ]]; then gcloud run services update "$SERVICE" --region="$REGION" --project="$PROJECT" --update-env-vars="AQM_SCHEDULER_AUDIENCE=$URL"; fi
if gcloud scheduler jobs describe aqm-hourly --location="$REGION" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud scheduler jobs update http aqm-hourly --location="$REGION" --project="$PROJECT" --schedule='0 * * * *' --time-zone=Etc/UTC --uri="$URL/internal/scheduler/tick" --http-method=POST --oidc-service-account-email="$SCHEDULER" --oidc-token-audience="$URL"
else
  gcloud scheduler jobs create http aqm-hourly --location="$REGION" --project="$PROJECT" --schedule='0 * * * *' --time-zone=Etc/UTC --uri="$URL/internal/scheduler/tick" --http-method=POST --oidc-service-account-email="$SCHEDULER" --oidc-token-audience="$URL"
fi
printf 'AQM API deployed: %s\nSet VITE_AQM_API_ORIGIN=%s in the Pages build environment.\n' "$URL" "$URL"
