# V0.12 external alert notifications

OperationalAlert remains the authoritative operational problem. Detection never sends externally: its Firestore transaction writes a small `notificationEvents` outbox record for a newly opened alert or its first resolution. Existing alerts are not backfilled. Updates to an active alert and acknowledgement do not notify. Resolving and later reopening the same problem creates a new alert ID.

The existing authenticated hourly Scheduler tick runs its normal work and then bounded notification routing/dispatch. Notification failures do not fail successful AQM work or produce another OperationalAlert. `/internal/notifications/tick` uses the same exact Google OIDC audience, verified email and Scheduler identity; it can dispatch independently without invoking Genesys/Jev. No new Scheduler jobs or changes to the daily policy/schedule are needed.

## Durable contracts

- `NotificationDestination`: id, name, WEBHOOK/EMAIL, enabled, channel configuration, createdAt/updatedAt. WEBHOOK configuration holds only `urlSecretRef` and optional `signingSecretRef`. EMAIL uses adapter `RESEND`, sender address, 1–10 recipient addresses and `apiKeySecretRef`. Destinations can be disabled and re-enabled; channel changes require a new destination. Deletion is not offered.
- `NotificationRule`: id, name, enabled, non-empty selected severities, alertTypes (empty means all), 1–10 destinationIds, optional exact policyId, notifyOnResolution (false by default), createdAt/updatedAt. Selected criteria AND together; arrays mean membership. No expression language.
- `NotificationEvent`: deterministic alertId/event identity, safe immutable payload snapshot, createdAt, routed flag. Stored atomically with the alert transition and kept indefinitely so processed events are not rerouted after terminal delivery retention.
- `NotificationDelivery`: deterministic id, alertId/ruleId (absent for TEST), destinationId, channel, event OPEN/RESOLVED/TEST, state PENDING/DELIVERED/RETRYING/FAILED/SUPPRESSED, attemptCount, first/lastAttemptAt, deliveredAt, nextAttemptAt, safe lastErrorCode, createdAt/updatedAt, private leaseOwner and safe payload. Operational attempts are represented by the durable cumulative attempt record; provider bodies and raw exceptions are never stored.
- `notificationDestinationHealth`: small durable projection of the last delivery state/time/attempt count. Destination tables do not infer last delivery from a partial history page.

Configuration is capped at 100 destinations and 50 rules. A transactional catalog revision guards concurrent configuration mutations and caps. Each tick routes at most five events (at most 500 rule/destination combinations each) and dispatches at most 20 due deliveries. Queries use Firestore single-field indexes; no new composite-index deployment is needed. History is bounded/paginated (1–100 records), with separate alert/destination filters.

## Identity, retries and resolution

Identity is SHA-256 of UTF-8 JSON `[alertId, ruleId, destinationId, event]`. Transactional compare-and-set creates deterministic deliveries; duplicate routing does not overwrite their progress. Dispatch takes a 60-second lease in the delivery record. Attempts are charged durably before provider invocation. A concurrent dispatcher cannot acquire the same record; restart recovery can reclaim expired leases. Four maximum attempts, including crash-charged attempts; a crash after the fourth terminates without a fifth send.

Successful records never have a due time and are never resent. Timeout, connection/DNS failure, HTTP 429 and HTTP 5xx retry after 5 minutes, 30 minutes and 2 hours. Invalid configuration, unsafe destination, redirect, oversized response and ordinary HTTP 4xx terminate. Unexpected exceptions become static `PROVIDER_FAILURE`, never their raw message. Disabled rules/destinations suppress queued deliveries. Exhausted deliveries are FAILED and remain visible; they do not create recursively routed alerts.

The hourly Scheduler cadence is unchanged: these intervals are minimum retry eligibility times, not promises of delivery exactly five minutes later. A queued ADMIN test likewise runs on the next periodic tick. There is no manual public dispatcher API.

Resolution is distinct from OPEN and can be enabled per rule. It is only routed when that alert/rule/destination has an OPEN delivery, and waits for OPEN success without spending delivery attempts. Failed/suppressed OPEN deliveries do not produce a resolution send. A rule created after an event never backfills it. Routing uses the configuration available when its outbox event is processed; subsequent disablement is respected before external send. There is no repeat/nagging or acknowledgement notification. Quiet hours and on-call schedules are deferred to V0.13.

External delivery and a Firestore commit cannot form one transaction. A provider acceptance followed by a process crash can be ambiguous. All sends carry the deterministic idempotency key; webhook receivers must persistently deduplicate it. Resend supports idempotency keys with a 24-hour window. Thus DELIVERED records are never resent, but exactly-once delivery across an ambiguous crash requires receiver/provider cooperation. Very prolonged downtime beyond the provider window can defeat provider-level deduplication; do not claim absolute exactly-once semantics.

## Webhook payload and signing

POST JSON, `Content-Type: application/json`. Schema version 1:

```json
{
  "schemaVersion": 1,
  "event": "OPEN",
  "test": false,
  "alert": {
    "id": "alert-id",
    "type": "SCHEDULED_RUN_FAILED",
    "severity": "ERROR",
    "title": "Scheduled run failed",
    "message": "Inspect the related operational alert and run in Genesys AQM.",
    "status": "OPEN",
    "createdAt": "2026-10-02T12:00:00.000Z"
  },
  "context": { "policyId": "policy-id", "scheduleId": "schedule-id", "runId": "run-id" },
  "application": { "name": "Genesys AQM" },
  "occurredAt": "2026-10-02T12:00:00.000Z"
}
```

TEST has `event: TEST`, `test: true`, no alert, and empty context. It creates no OperationalAlert. Resolution uses the same schema with RESOLVED event/status. Fixed application-owned titles/summaries deliberately exclude arbitrary alert text, metadata, raw provider diagnostics, customer content, transcripts and credentials.

Headers:

- `Idempotency-Key`: deterministic delivery ID (unique request ID for a deliberate TEST).
- `X-AQM-Timestamp`: decimal Unix seconds at this send.
- Optional `X-AQM-Signature`: `sha256=` followed by lowercase hex HMAC-SHA256 using the Secret Manager signing key. Signed bytes are **timestamp + period + exact raw JSON body bytes**, UTF-8. Do not reserialize before checking. Verify in constant time, reject timestamps more than five minutes away, and deduplicate the idempotency key. Timestamp is included in the MAC to prevent its modification.

HTTPS only (including development). Port 443 only. URL credentials and fragments rejected; credential-bearing path/query URLs stay wholly in Secret Manager. Localhost, private/local/metadata hostnames, IPv4 loopback/RFC1918/link-local/CGN/reserved/multicast/documentation space, and IPv6 non-global/documentation/transition/private space are denied. Every resolved A/AAAA answer must be public. DNS is bounded to 3 seconds. One validated IP is pinned for the connection, with original-host TLS certificate verification; a second uncontrolled lookup cannot rebind it. Secret Manager access tokens and secret fetches each have a 5-second bound. Dispatch verifies that at least 45 seconds remain on its lease before beginning provider work. Connection pools/proxies are not used. Redirects are never followed, including redirects to another public host. Connect timeout 5 seconds, total HTTPS timeout 15 seconds, response maximum 16 KiB; bodies are discarded.

## Email and secrets

`EmailProvider` owns safe rendering and calls an `EmailAdapter`; the first adapter is Resend's fixed HTTPS `/emails` endpoint. Credentials and API-specific semantics stay in the adapter. Subjects include severity/event and a fixed safe alert title. Plain-text body contains severity, alert ID/title, event, policy, run, time, safe summary and the application link. No raw stack traces or customer content. Tests inject the adapter/transport and secret resolver; real email credentials are not required.

There was no existing email/webhook secret or runtime provider configuration at release preparation. EMAIL LIVE DELIVERY PENDING CONFIGURATION. WEBHOOK LIVE DELIVERY PENDING CONFIGURATION. No destination/recipient or credential is fabricated and no real external notification is sent during development.

All credential references use:

`projects/genesys-aqm-2026/secrets/aqm-notification-NAME/versions/latest`

A numeric version is also accepted. The runtime rejects other projects and non-notification secret names. In Secret Manager, create URL/signature/email key secrets with the `aqm-notification-` prefix and grant the existing `aqm-runtime` service account `roles/secretmanager.secretAccessor` **on each chosen secret**. No new project-wide IAM grant is needed. A URL secret contains the complete HTTPS webhook URL; a signing secret contains the shared key; an email API key secret contains the Resend API key. Configure a verified sender with Resend and enter sender/recipients plus the reference in Settings. No credentials should be entered into the notification form.

API responses omit all secret references and secret values. They expose `configured` (a reference is configured, not a live delivery proof), `signed`, and safe email metadata. Existing references are preserved when omitted in an edit. ADMIN may replace a reference; the audit records only that it changed. Server logs, audit and delivery records never include resolved secrets, URL values or provider response bodies. Existing Jev/Genesys Secret Manager bindings remain unchanged.

Primary adapter/signing transport references: [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [Resend send email](https://resend.com/docs/api-reference/emails/send-email), [Node HTTPS](https://nodejs.org/download/release/latest-jod/docs/api/https.html).

## Governance, retention and UI

ADMIN: notifications.read/write/test. AUTHOR: notifications.read only. REVIEWER/VIEWER: no notification configuration permissions. Server validates the verified Genesys identity and durable V0.11 role on every request. UI uses the same permission contract. Ordinary alerts.read users can inspect safe per-alert delivery status, and operational-health aggregates remain visible.

Atomic audit covers destination/rule create/update/enable/disable, changed secret references, and a TEST request. Each attempt is recorded in the delivery, not duplicated into generic audit. No delete/retire action exists. Saving governance settings is non-destructive. `notificationDeliveryRetentionDays` defaults to null (indefinite), with backward-compatible V0.11 settings reads. Existing preview/PURGE confirmation can remove only old DELIVERED/FAILED/SUPPRESSED records; never PENDING/RETRYING. Purge audit stays preserved. Each preview scans at most 300 product records now.

Configuration → Settings: destinations table (name/channel/status/last delivery/actions), rule table (severity/type/destinations/status), simple forms, enable toggles, optional resolution, test and delivery history. No JSON editor. Overview & Runs: compact pending/failed-24h/last-success health. Alert detail: destination/event/state/attempt count and paginated continuation. Mobile keeps tables in their own horizontal scroll containers and stacks the forms.
