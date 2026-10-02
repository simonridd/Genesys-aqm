# V0.18D — first use and Settings navigation

R07 and R08 are closed by this frontend tranche, based on main `078ed8d04e2ea4e4c1b8c61a066bef63cc4454fe`. Branch: `codex/aqm-v0-18d-first-use-settings`. No PR, merge or v0.18.0 release is created. R06/R09/R11/R12/R13, V0.18E and broad R10 terminology remain outside scope; environment-builder-v2 is untouched.

## R07: first use and setup

Disconnected Conversation review and Conversations show a compact product introduction before the existing sample experience. It explains completed-conversation evaluation, policy/schedule selection, quality and coverage reporting, human review and AI/human calibration.

- **Explore sample conversations** selects the fictional library without authentication or provider traffic. Local forms/policies and demo analytics remain available.
- **Connect Genesys Cloud** opens `?page=settings&settingsSection=connection`. Navigation does not start OAuth; only the existing explicit sign-in control does.
- Copy distinguishes browsing from Evaluate, Test form and Confirm and execute policy run, which can issue AI requests. Existing maximum/actual Jev request information remains at execution. Fictional data is never described as universally free.
- Conversation review now directs users with no published saved forms to Evaluation Forms rather than Overview.

Overview derives its checklist only after authoritative saved forms and detailed policy/schedule/run configuration have loaded successfully and Overview run sections are complete. No checklist collection, completion flag, wizard or local completion persistence exists.

`setupGuidance` considers an operational PUBLISHED form complete; an enabled, validated saved policy with non-empty valid exact published form IDs complete; and an enabled DAILY/WEEKLY schedule referencing such a policy complete. Published form IDs identify immutable versions in the existing contract. Completed or partial-failure scheduled runs complete the first-run step; manual runs do not. Overview's last successful scheduled run covers successful evidence outside the bounded recent run list. A valid enabled scheduled policy plus any recorded scheduled run hides the checklist. Unavailable configuration is not presented as an empty organization.

Incomplete steps open Evaluation Forms, Policies, the known policy's schedule editor, or scroll to Overview recent runs. Authors/admins can configure; other roles get readable progress and guidance to contact an author/admin. Connection success remains visible, with Open Overview and a permission-aware Create evaluation form action when no operational saved form exists.

## R08: Settings

One H1 is **Settings**. Its local navigation has Connection first, then Access, Reviews, Privacy & retention, Notifications and Audit. Existing browser sandbox/key/reset controls are in Advanced / Development. Section headings are H2; Governance remains the internal contract/domain.

`settingsSection` accepts stable values `connection`, `access`, `reviews`, `privacy`, `notifications`, `audit`, and `advanced`. Missing/invalid values default to Connection. `settingsUrl` sets `page=settings` and the section, clears evaluation/analytics/operational selectors and hash, and preserves unrelated query keys intentionally. Every connection callback/CTA uses the helper, including Conversation review, Conversations, first use and Form Test's disconnected execution/recent-candidate paths. Generic Settings entry also defaults to Connection.

Section buttons are keyboard reachable, expose `aria-current=location`, wrap on mobile, update URL state, and focus/scroll the section H2. No routing framework is added.

- **Connection:** region/client configuration, explicit connect/disconnect, connected user/status, existing verification and relevant next actions.
- **Access:** ADMIN role editor; other roles receive a readable current-role explanation.
- **Reviews:** shared reminder/SLA working settings and guarded refresh for ADMIN; other roles read saved reminder information without disabled admin forms.
- **Privacy & retention:** inventory, cache lifetime, cached Genesys statistics/clear action, retention controls and guarded preview/purge. A single clear action uses the existing identity-scoped `clearGenesysCache`; the underlying content-only clear function and disconnect cleanup remain intact. Cache storage identity and TTL implementations are unchanged.
- **Notifications:** existing destinations, rules, test delivery and history; ADMIN edits/tests, AUTHOR reads. REVIEWER/VIEWER have no notification tab; unauthorized deep links provide explanatory text.
- **Audit:** existing ADMIN explorer/filters/detail. Other roles have no Audit tab; direct unauthorized links provide explanation. Per-resource history stays in place.

Governance stays mounted across subsections with its original saved/working settings model and one Save all settings/Discard changes control. Pending sections remain visible in every subsection. Subsection navigation does not call a page-leave confirmation or discard edits. Leaving Settings dirty still prompts; save sends the entire working state; discard restores the entire saved state. Retention preview and SLA refresh remain unavailable while settings are dirty. Role/audit editor state is retained independently.

OAuth stores a validated section in the existing PKCE transaction and restores it after success, with OAuth callback parameters removed. Existing state/PKCE validation, review-link return handling and requested-page behavior remain unchanged. Error callbacks open Connection with the existing error visible. Browser tests perform actual explicit Connect → mocked authorization → mocked callback journeys; no live OAuth occurs.

## Validation and preservation

- 558 deterministic tests across 58 files pass, including Settings defaults/deep links, immutable policy pins, setup stages and OAuth subsection return.
- Frontend typecheck/build, server typecheck and server build pass.
- 75 development browser journeys pass: first use/Settings, V0.18A save protection, V0.18C definition authority, cache/disconnect, governance roles, review SLA and notifications.
- 26 focused journeys pass against the deployable build, including all Settings deep links, invalid/default sections, four roles, setup fixtures, and explicit mocked OAuth success/error.
- Viewports inspected: 1440×900, 1920×1080, 390×844. Screenshots show first use, Connection, pending Privacy & retention, Notifications and Audit. Mobile section controls wrap and relevant journeys assert no document overflow; Conversation review heading actions wrap rather than clip.
- All fixture mutations/deliveries are mocked or in-memory. New journeys block external provider traffic; browsing assertions exclude the blocked static font request. No paid Jev call, live Genesys provider call, real delivery or production retention action is performed.
- Backend runtime source and contracts are unchanged. Publish GitHub Pages only; no Cloud Run revision is deployed.

Evidence and reproduction instructions: [v018d-evidence/README.md](v018d-evidence/README.md). Publication source SHA, Pages HEAD and exact public byte verification are recorded in `v018d-evidence/pages.json`. Production counts/hashes and runtime configuration comparison are recorded in `v018d-evidence/preservation.json`; only natural Scheduler operational changes, if any, are expected and must be reported explicitly.

## Publication proof

Published application source: `6835300d47b13718e8a4caf211428b425c8b6ae6`. GitHub Pages HEAD: `9b1ddef25f93d9b64c579d52b512f862e50f0b7b`. All seven public assets match the local validated build byte-for-byte. Public application: https://simonridd.github.io/Genesys-aqm/. Subsequent branch commits record proof only, with no application-source changes.

All 23/23 production collection counts and SHA-256 hashes match. Cloud Run remains `aqm-api-v018b-11e8e36`; image, runtime configuration, IAM, secret metadata and Scheduler configuration match. Scheduler runtime and operationalHealth hashes also match: no natural Scheduler difference occurred during this publication window. No production product data or configuration was mutated.
