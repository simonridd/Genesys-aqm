# Genesys AQM V0.18 whole-product usability and coherence review

Review date: **2 October 2026 (Europe/London)**. Reviewed base: `dd449b6e8eef5a8d39bf2cedd5951ad01999dc9a`, the accepted V0.17 final state. Deployed application source recorded by V0.17: `7d4b401ee1508e25db47723c24acb2d806ab754e`. Branch: `codex/aqm-v0-18-product-review`.

## Product judgment

Genesys AQM has a coherent core: **publish a form → attach an exact version to a policy → schedule evaluations → inspect quality and coverage → request/complete human review → compare judgments**. Overview is a useful connected home. The separation of original AI results, human review, and calibration is sound. Form version immutability, plan/preview/confirm execution, isolated tests, review reassignment confirmation and retention preview are worth preserving.

The product still exposes its construction history at the boundaries. Connected libraries and routing context can mix browser definitions with server definitions; saved/unsaved behavior differs by editor; Settings begins with governance rather than connection; operational users encounter authoring and storage vocabulary. Some links promise a specific cohort but open a broader one. These are more valuable to address than adding features or reducing the page count.

**No P0 was established.** The review found reproducible P1 problems in draft preservation, save scope, cohort continuity, data authority and keyboard access. There is no evidence here of an authorization bypass, provider mis-execution, production deletion, or an actual paid request. Neither successful fixtures nor public inspection establish authenticated live health.

## Release and boundaries

- Fetched `origin/main` and verified it was exactly the required base. Verified `v0.17.0` was absent locally and remotely before creating it.
- Created and pushed the annotated tag **`v0.17.0`**, annotation “Genesys AQM V0.17.0 — Operational overview dashboard”. Remote tag object: `581cabab77946f48079f4e945a15489d0a403372`; peeled target: `dd449b6e8eef5a8d39bf2cedd5951ad01999dc9a`.
- Used the dedicated worktree `.worktrees/aqm-v0-18`, branched from verified `origin/main`. No product implementation or removal is included. No PR is created or merged. `environment-builder-v2` is untouched.
- No credentials were sought. Authenticated review uses existing role permissions, in-memory stores and fixture OAuth responses. No live Genesys or Jev API calls, notification sends or authenticated production API calls are used.

## Evidence and method

**Eight primary journeys (A–H), ten primary pages, four roles, three viewport sizes.** Primary pages were inspected at **1440×900, 1920×1080 and 390×844**. Nine detail surfaces were compared: form, reusable group, policy, evaluation, human review, run, alert, and notification destination/rule editors (evaluation and human review share a capture, giving eight detail-capture categories).

The [capture harness](v018-evidence/capture.spec.ts) uses the existing `overviewFixture`, `reviewFixture`, server aggregators and `rolePermissions`; it adds a completed fixture review and a configured fixture notification destination. Its context interceptor blocks every unmatched external request except public Google font assets. OAuth, identity and AQM routes are fulfilled in memory. Unknown mutations fail instead of reaching a provider. Screenshots wait for `document.fonts.ready`; loaded DM Sans/Manrope faces are recorded in each inventory. Public contexts allow only `https://simonridd.github.io` static resources and the app's public Google font assets; all other origins are blocked. Fixture settings payloads and identifiers are fictional.

Final local screenshots use the **production build at port 4175**, not Vite development rendering. Initial development inspection replayed effects under React StrictMode; that duplicate pattern is **not** reported as production duplication. All observations below cite source plus browser evidence when practical. Request lists in capture JSON are cumulative within each journey; compare successive captures to identify page-entry additions. They are not latency benchmarks.

Screenshots were visually inspected in page/viewport contact sheets and focused detail crops. Text/geometry inventories support the visual review; generating screenshots alone was not treated as inspection. [Evidence index and inspection notes](v018-evidence/README.md), [machine-readable manifest](v018-evidence/manifest.json).

## Information architecture

| Surface | Present role | Recommendation and rationale |
|---|---|---|
| Overview | Connected operational home, summaries, manual execution, detailed alerts/runs | **Keep** as home. Attention first is appropriate; keep manual execution in a disclosure. Fix cohort links (R04), contextualize health and avoid eagerly loading hidden operations (R13). |
| Evaluations | Result explorer, team workload, personal queue, sampling, bulk assignment, detail/review | **Keep**; introduce queue/explorer modes within it. It currently does too many jobs before the first result, especially for reviewers (R09). |
| Analytics | Quality/coverage aggregate; browser/server mode switch | **Keep** for quality and coverage. Make saved evaluation data the connected default without exposing storage architecture as the main choice (R10). Preserve cohorts across drill-through (R03). |
| Calibration | Completed human-versus-AI judgments; unresolved summary | **Keep** as a distinct diagnostic workflow. Add explicit links to Reviews/Evaluations; do not make its backlog summary a competing work queue. |
| Policies | Routing criteria, exact published forms, sampling, separate schedule | **Keep** under configuration. Its readiness summary and separate policy/schedule save states are useful. Explain the two saves in setup guidance. |
| Evaluation Forms | Versioned forms, grouped questions, isolated testing, reuse | **Keep** under configuration. Separate connected records, local drafts and starter examples (R05); make testing a subordinate form task. |
| Question Groups | Independent versioned reusable templates, snapshotted into forms | **Keep** in author configuration; do not merge merely to reduce pages. Rename “asset” actions and preserve unsaved drafts (R01, R10). |
| Settings / Governance / Notifications | Connection, privacy/cache, reminders, retention/purge, roles, audit, notification configuration | **Keep one Settings destination** with local section navigation. Connection first, governance and notification groups thereafter; one page title (R08). |
| Conversations | Synthetic library or completed Genesys interactions | **Keep** for browsing. “Conversation” can be the general product noun; “completed interaction” is useful as a Genesys eligibility qualifier. Human-friendly filters should progressively replace bare identifiers. |
| Conversation review | Selected transcript, local policy matches, manual AI evaluation | **Demote to a contextual detail action**, or label “Conversation detail”. It is different from human review of a saved evaluation. Keep a prominent demo exploration entry on first use (R07); fix connected routing authority before relabeling (R05). |

Navigation already has useful Monitor / Quality / Configuration / Interactions groups. Every role currently sees all ten destinations because the sidebar is not role-aware (`src/App.tsx:147`). Reading a configuration object can be useful to reviewers/viewers; do not remove all configuration navigation merely because write controls are unavailable. Prioritize role-appropriate destinations, subordinate author tooling, and explain read-only access.

## Primary journeys

Counts below are **minimum navigation/action steps**, excluding field entry, scroll distance, question-by-question editing and external OAuth screens. They are path counts from observed fixtures/source, not task-time measurements. Optional transitions are identified; a real empty organization requires additional content authoring.

| Journey | Observed path and minimum steps | Friction, duplication or dead end | Is the next action apparent? |
|---|---|---|---|
| **A. New administrator** | Settings → Connect (fixture callback) → Overview → health/attention drill → Settings: **5 actions**, plus OAuth. | Settings initially presents Governance; connection appears late. OAuth intentionally returns to Settings, so Overview needs another action. No end-to-end initial-policy checklist. | Connection is discoverable through Settings but poorly prioritized; post-connect next steps are weak (R07/R08). |
| **B. Form author** | Forms → New form → define questions/groups → Save changes → header Test form → execute isolated test → Publish version: **6 explicit actions**, plus editor operations; adding a reusable group adds at least **2**. | Header “TEST FORM” scrolls to another “Test form” execution button; execution-mode choices expose legacy architecture. A group can be edited in its library without the form/policy dirty-state protection. Published fields mix read-only controls and disabled editor actions. | Save/test/publish are available; an empty form needs clearer ordered guidance. Existing publication fixture confirms exact version reload and exclusion of testing forms from production. |
| **C. Policy author** | Policies → New policy → assign published form + criteria + sampling → Save changes → choose frequency → Save schedule: **4 actions**, plus fields. Optional View runs adds **1**. | Policy and schedule save separately; new users can miss the second save. Duplicate starts disabled with no schedule, correctly; guidance must explain enabling the policy and schedule independently. | Readiness makes missing configuration visible. Preserve disabled-policy/enabled-schedule warning and separate save state. |
| **D. Automated operation** | Overview → scheduled/recent run → Explore policy evaluations → Analytics: **3 actions**. Scheduling itself is set in C. | The run detail links to policy evaluations, not the exact run; its label accurately says so. Analytics entry can revert to broader filters, while technical metadata dominates some descriptions. | Run and policy links are obvious. A real scheduled execution is a proof gap; no scheduler or provider was invoked. |
| **E. Reviewer** | Overview My review queue → Open evaluation → Claim and start / Start review → enter answers → Complete review: **4 actions**, plus answers. Alternative Evaluations → My queue adds **1**. | Personal work competes with team cards, extensive filters and calibration sample controls. Opening a row reveals detail below the table without a consistent focus/scroll transition. Viewer/author can also see an enabled My queue entry in Evaluations. | Claim/start/complete wording is good and ownership is preserved; reaching the review is too laborious, especially on mobile (R09/R12). |
| **F. Quality manager** | Overview quality → Analytics Forms → form row → question row → evaluation row → human review; Calibration → form → question → disagreements → evaluation is an additional **5-step** diagnostic branch. Main path **5 actions** before review. | Analytics question drill loses form version and selected cohort (R03). Calibration is clearer about completed review evidence but lacks a direct relationship explanation from Analytics. Raw form identifiers slow investigation. | Useful routes exist, but the wrong cohort undermines confidence in the next screen. |
| **G. Operational failure** | Overview alert → linked run/review or alert detail → acknowledge/resolve/act: **2–3 actions**. Unlinked alert → related detail is one more action. | Linked alerts go directly to run/review, while unlinked alerts open lower disclosure detail. Notification failures are shown as text; reaching delivery history means navigating the long Settings page. | Alert CTA labels distinguish Open run / Open review / Open alert well. Recovery guidance should distinguish scheduler/admin action from review completion. |
| **H. Reuse** | Form: library → source → Duplicate as new form → Save: **4 actions**; export/import: source → Export JSON → Import form → file selection: **4**, plus navigation. Group export/import similarly **4**; Edit as new version: source → action → Save draft asset: **3**. | Group duplication is represented by import or a new version, unlike the explicit new-form duplicate. “Group”, “reusable group” and “asset” are mixed. Snapshots are correctly independent; dependencies prevent invalid deletion. | Form duplication/import is clear and creates a draft. Group reuse needs equivalent language and draft protection, not a new generic import subsystem. |

These paths were exercised through 29 existing browser tests covering authoring/portability, form publication/testing, policy schedules, reviews, conflict handling, calibration, roles, notifications and Overview. The evidence harness supplements those behavior tests with all-page visual inspection and targeted probes.

## First use and the connected home

The public landing page visibly identifies **Fictional sample data · no credentials** and synthetic provenance. The transcript and nineteen varied examples make it a useful evaluator experience; keep this capability. “No credentials” describes browsing, however, while the selected-form area describes production evaluation through the service. A visitor has to infer the product proposition, what is safe/free to explore and what requires an authorized connection.

Do not replace the public sample with an empty operational dashboard. Use a short first-use introduction with two clear routes: **Explore sample conversations** and **Connect Genesys Cloud**. Explain that browsing, draft editing and prepared demo analytics do not request AI; executing a form evaluation/test can use the displayed Jev request allowance. The disconnected Overview appropriately contains no fabricated health/quality metrics. Its connection CTA should land directly on the connection section.

After connection, Overview is a better home than an arbitrary selected transcript. Add an empty-system checklist based on actual saved state: **publish a form → create/enable a policy → save/enable its schedule → inspect first run**. Reuse existing forms/policies/readiness data; do not create an independent setup-state contract without need. The stale instruction “Publish eligible forms through Overview” in Conversation Review must instead point to **Evaluation Forms** (`src/App.tsx:151`; local publishing from Overview has already been removed).

Overview's alert-first hierarchy, quality/coverage definitions, current review state, upcoming schedules, recent runs and separate manual-run disclosure work well. The 7/30-day distinction is clear, and partial sections remain independent. At 390px, three attention cards plus health fill the first screen; quality and personal workload require scrolling. That is justified when there are incidents, but reviewers should have a compact My queue affordance near the top. Avoid adding more KPI cards. “Genesys: Unverified” and “Jev: Error” describe saved run evidence, not a real-time connectivity probe; make the evidence time/meaning more accessible without suggesting a live check.

## Findings by priority

Every finding states its scope, evidence and live-proof requirement. “No live proof needed” means the specific UI defect is reproducible locally; it does not certify provider operation.

### P0 — correctness / dangerous UX

**None established.** Preserve server authorization, immutable published definitions, evaluation idempotency/fingerprints, review revisions and retention confirmation. R02 can unintentionally save a retention configuration; it does not itself delete records. Retention execution still requires a saved preview and typed confirmation.

### P1 — major workflow friction and reproducible correctness defects

**R01 — Question Group drafts disappear without warning**

- **Page/journey:** Question Groups; B/H.
- **Observed:** New group → change Asset name → Settings → Question Groups discards the draft. The probe observed **zero dialogs and zero remaining draft text**. Selecting another row also replaces `draft` directly. Forms/policies already warn about unsaved changes.
- **Why it matters:** Authors can lose substantial reusable-question work through routine navigation and cannot rely on a shared save convention.
- **Proposed change:** Track group dirty state; preserve the working draft across row/page transitions or warn before discarding. Show “Unsaved changes”, explicit Save changes/Discard actions and a before-unload guard consistent with other editors.
- **Scope/risk:** Small editor/navigation change; medium risk around selection, imported drafts and published immutability. No storage/API contract change required for a guard and in-memory preservation.
- **Evidence:** [dirty probe](v018-evidence/group-dirty-probe.json), [after-navigation screenshot](v018-evidence/group-after-unsaved-navigation.png); `src/QuestionGroupsPage.tsx:24–36`, `src/App.tsx:123`.
- **Provider/live proof:** **No**; test local new/edited/imported draft and save failure paths.

**R02 — A section save commits unrelated governance edits**

- **Page/journey:** Settings / Review reminders / Retention; A/G.
- **Observed:** Change Evaluation retention days to `2`, then choose **Save review reminders**. The PUT body contains `evaluationRetentionDays: 2` along with all governance fields. Both reminder and retention buttons submit the same mutable `settings` object; there is no section-specific dirty/save disclosure.
- **Why it matters:** An administrator believes they saved reminder thresholds but has also changed future retention eligibility. Another section's unsaved state can become saved unexpectedly; navigating away can silently lose it as well.
- **Proposed change:** Use one explicit **Save settings** scope with a list of pending changes, or isolate section drafts and submit only intended changes merged against saved settings. Add a leave-warning for unsaved governance edits. Preserve preview invalidation and typed purge confirmation.
- **Scope/risk:** Medium; governance persistence semantics need careful regression coverage. A UI-only solution can use the existing complete-object PUT contract; a partial-update/version contract would be a separate decision.
- **Evidence:** [exact mocked payload](v018-evidence/governance-save-payload.json), [saved state](v018-evidence/governance-save-scope.png); `src/GovernancePanel.tsx:28–43`.
- **Provider/live proof:** **No** for defect/fix; Simon should verify intended section save behavior on a safe setting, without purging production data.

**R03 — Analytics drill-through drops the cohort and exact form version**

- **Page/journey:** Analytics → Evaluations; F/D.
- **Observed:** Analytics filtered to From `2026-09-01`, Queue `Customer care`; select form v17, then a question. Destination URL is `?page=evaluations&form=general_service&question=greeting`: no date, queue, source, trigger, policy or `@17` version. `ServerAnalytics.drill` passes only a version-stripped form ID and question. The destination can also retain unrelated old query filters because the callback does not replace the cohort consistently.
- **Why it matters:** The colleague investigating a bad aggregate may see a different population or version and draw the wrong conclusion.
- **Proposed change:** Pass the complete current cohort and exact form reference in every question drill; explicitly replace stale evaluation/review selection/filter keys. Show applied scope with clear removable chips and preserve it on return. Reuse the existing navigation helper pattern; do not merge Analytics and Calibration.
- **Scope/risk:** Small navigation/filter change, medium regression risk across URL round trips and date interpretation. Existing API filters suffice.
- **Evidence:** [destination URL/fields](v018-evidence/analytics-drill-scope.json), [destination screenshot](v018-evidence/analytics-drill-scope.png); `src/ServerAnalytics.tsx:10–16`, `src/App.tsx:163`, `src/domain/navigation.ts`.
- **Provider/live proof:** **No**; compare fixtures with multiple versions, sources, dates, policies and queues.

**R04 — Overview review-count links do not open the counted cohort**

- **Page/journey:** Overview → review workload → Evaluations; E/A.
- **Observed:** Fixture Overview shows **4 Open** and **1 Unassigned** active review. Open links to all evaluations and returns **8** records, including NOT_REVIEWED and REVIEWED. Unassigned applies only `assignment=unassigned` and returns **5** records, rather than the one requested review. The workload panel's separate “Unassigned requested reviews” entry correctly adds `reviewStatus=REVIEW_REQUESTED`.
- **Why it matters:** Counts cannot be reconciled with the destination; users waste time and may confuse never-requested evaluations with assigned review work.
- **Proposed change:** Give Open an active-review predicate (requested or in progress) and Unassigned the requested-review predicate, using existing active-queue logic or a narrowly defined filter. Clear unrelated filters consistently. Label links with their exact scope.
- **Scope/risk:** Small navigation change; medium if an active-status OR filter needs extending the API. Do not weaken role checks or use a browser-only incomplete cohort for a server total.
- **Evidence:** [Open destination](v018-evidence/overview-open-drill.json), [Unassigned destination](v018-evidence/overview-unassigned-drill.json), [Overview](v018-evidence/overview-1440.png); `src/OverviewSummary.tsx:35`, `src/domain/reviews.ts:123–129`, `src/EvaluationsPage.tsx` (`unassignedFilter`).
- **Provider/live proof:** **No**; completed/unrequested fixture exclusions are sufficient. A live populated queue is useful acceptance evidence later.

**R05 — Connected configuration and routing still use browser definitions**

- **Page/journey:** Forms/Groups, Conversation Review, policy usage; B/C/H.
- **Observed:** With exactly **one saved server form and one server policy**, the connected form library shows **six forms** and usage counts derived from local seeded policies. Conversation Review displays **Customer Service Messaging** and **Cross-channel monitoring sample**, although the server policy fixture is **Daily Voice Customer Service AQM**. The parent `policies` state stays browser-local; connected PoliciesPage holds its own remote collection. Form and group fetches merge remote records with local examples/drafts rather than visibly separating their authority.
- **Why it matters:** “Applicable evaluations”, usage counts and configuration lists can look authoritative while describing a different policy set. A production user cannot tell what is saved, illustrative or merely retained locally.
- **Proposed change:** Make connected policy context and library usage derive from the same saved server collections. Put local working drafts/starter definitions in clearly labeled sections with explicit save/import actions. Show unavailable saved routing as unavailable, instead of silently falling back to local matches. Preserve local drafts and offline samples during the change.
- **Scope/risk:** Medium; shared collection ownership, draft reconciliation and starter migration require care. Existing contracts can remain; do not casually delete local storage or change IDs/version pins.
- **Evidence:** [connected forms](v018-evidence/forms-1440.json), [connected routing](v018-evidence/conversation-review-1440.json), [server policy library](v018-evidence/policies-1440.json); `src/App.tsx:53–75, 88–126, 156`, `src/PoliciesPage.tsx:17–35`, `src/QuestionGroupsPage.tsx:15–19`.
- **Provider/live proof:** **No** for authority mismatch; Simon should compare saved policy/form usage against an authenticated organization after a fix. No evaluation is needed for that proof.

**R06 — Several table details are unreachable by keyboard**

- **Page/journey:** Forms, Question Groups, Calibration, runs, audit/alerts; B/F/G/H.
- **Observed:** `OperationalTable` opens details via `tr.onClick`; rows have `tabIndex=-1`, no interactive name link and no key handler. Group-table keyboard traversal reaches search/sort/toolbar controls and never a group. Evaluations and Policies already have explicit row buttons, proving a workable convention. `aria-sort` is placed on the sort button rather than the column header.
- **Why it matters:** Keyboard and assistive-technology users cannot complete core authoring and investigation paths. Mouse-only consistency is insufficient.
- **Proposed change:** Add an actual named button/link in the identity cell for every selectable table, retaining whole-row pointer convenience. Put `aria-sort` on `th`; make horizontally scrollable table regions keyboard reachable/labeled where needed. Do not give arbitrary table rows a conflicting interactive role.
- **Scope/risk:** Small shared component/call-site improvements; medium regression risk for nested actions and selection propagation. No API changes or table rebuild.
- **Evidence:** [keyboard focus sequence](v018-evidence/keyboard-group-focus.json), [row semantics](v018-evidence/keyboard-group-table.json); `src/OperationalTable.tsx:18`, `src/QuestionGroupsPage.tsx:33`, `src/CalibrationPage.tsx:24`, existing evaluation/policy identity buttons.
- **Provider/live proof:** **No**; keyboard-only smoke paths and a pragmatic screen-reader check suffice.

**R07 — First use lacks a path from samples to a first automated policy**

- **Page/journey:** Public/disconnected landing, empty Overview, setup; A/B/C.
- **Observed:** Public visitors land in a transcript with applicable evaluation controls and technical connection copy. Synthetic data is labeled, but there is no product introduction or ordered setup path. Empty Overview has scattered empty messages and forms/policies actions at the bottom. Conversation Review incorrectly directs form publishing to Overview.
- **Why it matters:** A colleague can explore an example but cannot easily explain the system or determine the next setup task and cost boundary.
- **Proposed change:** Keep sample exploration; add concise purpose, exploration/connection choices, a direct connection-section link, explicit browse-versus-AI-request guidance, and a connected checklist based on saved prerequisites. Correct the stale publishing hint.
- **Scope/risk:** Small onboarding/copy/derived-state work; low to medium. No provider integration or persistence contract needed.
- **Evidence:** [public landing](v018-evidence/public-landing-390.png), [disconnected landing](v018-evidence/disconnected-landing-1440.json), [empty Overview](v018-evidence/empty-overview.png); `src/domain/navigation.ts:3–11`, `src/App.tsx:151`, `src/OverviewSummary.tsx`.
- **Provider/live proof:** **No** for copy/navigation; Simon's empty/near-empty authenticated setup is useful acceptance proof, using saved configuration only.

**R08 — Settings buries connection inside a long governance page**

- **Page/journey:** Settings; A/G.
- **Observed:** Two visible H1s, **Governance** then **Settings**. Privacy, reminders, retention/purge, role administration, audit and notifications precede Genesys connection. The fixture page is roughly **7,279px tall at 390px**; callers named “Connection settings” open its top. Cache clearing appears both under Governance and Cached Genesys data.
- **Why it matters:** The visitor has to understand administrative storage topics before finding sign-in. Administrators repeatedly scroll between unrelated jobs, with weak save boundaries.
- **Proposed change:** One Settings H1; local section navigation for **Connection**, **Access**, **Reviews**, **Privacy & retention**, **Notifications**, **Audit**. Connection first; direct callers select/anchor the requested section. Keep technical secret references and purge explanations in appropriate admin sections. Consolidate cache actions with distinct search/content/all labels.
- **Scope/risk:** Medium UI restructuring; preserve permissions, secret handling and purge semantics. Depends on R02's explicit save scope. No new public routes/contracts required.
- **Evidence:** [Settings 390](v018-evidence/settings-390.png), [section inventory](v018-evidence/settings-390.json), [disconnected Settings](v018-evidence/disconnected-settings-390.png); `src/App.tsx:164, 251–278`, `src/GovernancePanel.tsx`, `src/NotificationsPanel.tsx`.
- **Provider/live proof:** **No** for layout. Real connection verification and real email/webhook delivery remain separate live proofs; the review did neither.

**R09 — Personal review work is submerged in an administrative explorer**

- **Page/journey:** Evaluations/My queue; E; REVIEWER/VIEWER/AUTHOR.
- **Observed:** Team workload cards, approximately seventeen explorer filters, a calibration-sample panel and (for ADMIN) bulk assignment precede the result table. The table contains fifteen-plus columns and two pagination layers. REVIEWER sees sampling; AUTHOR/VIEWER see an enabled My review queue button despite having no review-write permission. All roles receive the same configuration navigation.
- **Why it matters:** Reviewers need due work and claim/start actions, not an explorer setup exercise. Quality leaders get a personal-work affordance that often has no practical next action. On mobile, vertical travel is substantial before any evaluation row.
- **Proposed change:** Within Evaluations, make **My reviews / All evaluations** explicit modes. My reviews gets compact due/assignee/status controls, relevant columns and inline/open actions; team management and sampling become secondary for administrators. Only present personal review CTAs to appropriate roles, while retaining authorized read-only exploration.
- **Scope/risk:** Medium UI work; preserve full filters, server queue priority, revisions, ownership and authorization. No persistence change; existing queue contracts should suffice.
- **Evidence:** [Reviewer Evaluations](v018-evidence/REVIEWER-evaluations.png), [Viewer controls](v018-evidence/VIEWER-evaluations.json), [mobile explorer](v018-evidence/evaluations-390.png); `src/EvaluationsPage.tsx:40–52`, `src/ReviewOperations.tsx:30–33`, `src/domain/governance.ts`.
- **Provider/live proof:** **No** for structure; an authenticated assigned queue with real users is later acceptance proof, without new AI evaluation.

### P2 — meaningful polish and consistency

**R10 — Storage/provider terminology and overlapping “review” labels leak into routine work**

- **Page/journey:** Global status, authoring, Analytics, Conversation Review.
- **Observed:** “Connect to the automation service”, “durable server policies”, “DURABLE POLICY”, “Cloud Run”, “complete scan”, “New group asset”, Noul/Choice/Score, browser/server sandbox modes and V0.17 footer are all ordinary UI copy. Conversation review means transcript inspection/AI execution; Human review means reviewer scoring; Calibration is completed comparison.
- **Why it matters:** Users must learn implementation terms and can confuse inspecting a conversation with completing assigned human work.
- **Proposed change:** Apply the terminology table below; keep request counts, provenance, secret references and diagnostic bounds in the places where they inform a decision. Use **Conversation detail**, **Human review**, **Calibration**, and **Form test** consistently. Move release/runtime implementation detail to About/diagnostics.
- **Scope/risk:** Small copy/navigation change; low, but update accessible names and selector-based tests deliberately. No route/storage key renames are required.
- **Evidence:** [public copy](v018-evidence/public-landing-1440.json), [analytics copy](v018-evidence/analytics-1440.json), [group actions](v018-evidence/groups-1440.json); `src/App.tsx:147, 249, 278, 346–347`, `src/ServerAnalytics.tsx:17`, `src/PoliciesPage.tsx:66–70`, `src/FormTestPanel.tsx:51`.
- **Provider/live proof:** **No**; cost-related copy should be reviewed against existing request-wave logic rather than sending real requests.

**R11 — Mobile actions can be clipped even when page-width checks pass**

- **Page/journey:** Conversations and Conversation Review at 390×844.
- **Observed:** The Conversations heading clips the Cards side of its view toggle; Conversation Review's Browse samples action extends beyond the right edge. `.main-content` clips horizontal overflow, so `scrollWidth <= innerWidth` still passes. Operational tables intentionally scroll horizontally; their clipping is a different, acceptable pattern when accessible.
- **Why it matters:** A user can miss a valid navigation/view action. The existing numeric overflow check gives false reassurance about control visibility.
- **Proposed change:** Stack/wrap these headings and action groups at small widths; make controls fit within the visible main region. Add control bounding-box assertions for these specific cases. Keep horizontally scrollable tables and tab/nav strips.
- **Scope/risk:** Small CSS change; low. No generic table rebuild.
- **Evidence:** [Conversations 390](v018-evidence/conversations-390.png), [Conversation detail 390](v018-evidence/conversation-review-390.png), geometry arrays in corresponding JSON; `src/styles.css:9`, `src/App.tsx:151, 170`.
- **Provider/live proof:** **No**; visual/keyboard inspection at 390px suffices.

**R12 — Detail opening, closing and read-only presentation lack a shared pattern**

- **Page/journey:** Form/group/policy/evaluation/run/alert/notification details.
- **Observed:** Evaluation/group/form details render below lists; there is no consistent focus transition or close/back affordance. Run/alert entry deliberately scrolls; form Test form scrolls. Policy fields are disabled for read-only roles, while form/group metadata is read-only. Notification destination/rule editors are inline forms, not dialogs; permission and immutability explanations differ.
- **Why it matters:** The same “open” gesture can appear to do nothing until the user scrolls. Disabled fields cannot be focused/copied consistently, and users do not know whether a version is immutable or their role forbids edits.
- **Proposed change:** Standardize **summary/status/actions → details/configuration → history**. On open, bring the detail title into view and focus it; on close, restore the originating control. Explain “Published version is read-only” separately from role restrictions. Add a consistent close/back action; use display values or read-only inputs for inspectable configuration.
- **Scope/risk:** Small-to-medium shared interaction work; no need for a universal modal or new route. Preserve history, exact snapshots and nested controls.
- **Evidence:** Focused `*-panel.png` screenshots in [evidence index](v018-evidence/README.md); `src/App.tsx:323–325`, `src/QuestionGroupsPage.tsx:36`, `src/EvaluationsPage.tsx:52`, `src/AutomationPanel.tsx:38–45`, `src/PoliciesPage.tsx:71`, `src/NotificationsPanel.tsx:27–30`.
- **Provider/live proof:** **No**; keyboard/viewport checks and role fixtures suffice.

**R13 — Page entry fetches hidden operational/authoring detail eagerly**

- **Page/journey:** Overview, Forms, Evaluations, Settings; performance.
- **Observed:** Production Overview entry issues nine captured API reads: summary, full policies/schedules/runs, session/governance, group library, alerts and monitoring-health. Detailed operations are collapsed but AlertsPanel still mounts/fetches. Every form-page entry requests complete analytics to populate usage metrics, and selected-form test history mounts even before opening the test task. Review detail loads reviewer/SLA data again; Settings loads governance independently of the access hook and starts three notification reads for authorized roles.
- **Why it matters:** Extra page-entry work and collection pagination can scale poorly and make unavailable secondary services look like main-page failures. These are bounded requests, not proof of excessive provider cost.
- **Proposed change:** Lazy-load detailed operations/manual setup, test history and optional audit/delivery lists when needed; share already-loaded governance/directory data where safe. Consider a bounded form-usage projection only if actual production timings justify it. Keep explicit refresh, sequence guards, complete/incomplete semantics and server authorization.
- **Scope/risk:** Small-to-medium request-lifecycle improvements; medium due to refresh races and stale state. Begin with client lazy loading; a new usage endpoint is optional and should be independently scoped.
- **Evidence:** [production entry request list](v018-evidence/overview-1440.json), successive forms/settings JSON; `src/AutomationPanel.tsx:28–36, 56–66`, `src/App.tsx:115–120, 286–288`, `src/ReviewOperations.tsx:22–24, 50–51`, `src/GovernancePanel.tsx:18, 35`, `src/NotificationsPanel.tsx:14–15`.
- **Provider/live proof:** **No** to prove eager requests; **yes, optional** authenticated network timing with realistic library sizes to justify new endpoints/cache policy. Do not equate local fixture timing with production latency.

**R14 — Browser reset and test-history clearing need clearer destructive scope**

- **Page/journey:** Settings reset, browser Analytics/history, Form Test.
- **Observed:** Reset demo data/history immediately restores browser forms/policies and clears history/runs; local edited definitions are included despite the “demo” label. Browser Clear history clears local run observations too. Per-form completed test history deletion is a one-action operation. These are distinct from the carefully confirmed server retention purge.
- **Why it matters:** Authors can erase useful local drafts or diagnostic history while intending only to remove prepared examples.
- **Proposed change:** Separate **Remove prepared demo data** from **Reset local drafts and history**. Confirm the latter with an exact scope description; provide export guidance if local work exists. Say which run/test records will be cleared; preserve running-test reconciliation and server records.
- **Scope/risk:** Small labels/confirmation flow; low to medium. Keep storage keys and migrations intact.
- **Evidence:** `src/App.tsx:143–146, 164, 329, 347`, `src/FormTestPanel.tsx:52`; [disconnected Settings](v018-evidence/disconnected-settings-1440.json), [demo Analytics](v018-evidence/demo-analytics-1440.json).
- **Provider/live proof:** **No**; local reset and mocked test-history deletion cover it. No production purge is needed.

### P3 — low-value polish

No separate P3 backlog is proposed. Breadcrumb shorthand (“Forms”, “Groups”, “Evaluate”), release footer and minor pluralization can be corrected within R10 when those files are already touched. They do not justify a dedicated tranche or inflated severity.

## Ten highest-value changes, ranked

1. **R01:** Protect reusable-group drafts from silent loss.
2. **R02:** Make governance save scope match the button and pending changes.
3. **R03:** Preserve exact version and cohort from Analytics into evaluations.
4. **R04:** Make Overview review-count links reconcile with their destination.
5. **R05:** Use saved connected definitions consistently for libraries, routing and usage.
6. **R06:** Make every detail-opening table usable by keyboard.
7. **R07:** Explain first use and guide the first automated policy.
8. **R09:** Give reviewers a compact personal-work mode with due work first.
9. **R08:** Make connection and Settings sections directly reachable.
10. **R11:** Restore clipped mobile action controls.

R10 terminology is a useful early companion to these changes, but correct data scope and preserving work rank above a broad copy pass. R13 optimization should follow measurement; a table rewrite and a new dashboard are not recommended.

## Terminology audit and concrete replacements

| Current wording/concept | Proposed convention | Context/constraint |
|---|---|---|
| Evaluation / EvaluationRecord | **Evaluation** / **saved evaluation** | One AI result for one exact form/version; technical record names belong in diagnostics. |
| Evaluation Form / form / Scorecard | **Evaluation form** in prose; **Forms** only where context is clear | Keep scorecard conversion/types/storage migration internal. Do not rename persisted contracts casually. |
| Question Group / reusable group / asset | **Question group** inside a form; **Reusable question group** in library | “New question group”, “Save changes”, “Publish version”, “Retire version”. Explain independent snapshot reuse. |
| Policy / monitoring policy | **Policy** | Describe as criteria + forms + sampling + optional schedule. Avoid implying monitoring is a second policy type. |
| Monitoring runs / Run / Manual server run | **Policy runs**, **Run now** | “Scheduled” or “Manual” is the trigger, not a separate product. |
| Automation / server policy / durable policy | **Schedule**, **Policy**, **Saved policy** | Use Schedule where frequency is configured; use Automation only for the broader operation. |
| Coverage | **Sampling coverage** / **Evaluation coverage** with denominator | Preserve existing definitions and run-observation warning; do not suggest unique conversation counts. |
| Conversation review | **Conversation detail** | Inspect transcript or run a manual AI evaluation; distinct from reviewer scoring. |
| Review / HumanReviews / REVIEW_REQUESTED | **Human review**, **Review requested**, **In progress**, **Completed** | Keep raw state enums/API values unchanged. My reviews is the personal queue, not an analytics mode. |
| Calibration | **Calibration** + “Compare AI and completed human reviews” | Original AI quality metrics remain unchanged by human scoring. |
| Alert / Notification | **Alert** = operational issue; **Notification** = delivery of its message | Distinguish acknowledge/resolve from delivery state. |
| Conversation / interaction | **Conversation** as general noun | “Completed Genesys interaction” is an eligibility/source qualifier, not a new entity. |
| Transcript / Content | **Transcript**, **Email content** where relevant | Retain “conversation content cache” in privacy controls because it includes all media. |
| Connect to automation service | **Connect Genesys Cloud** | Add explanation that the signed-in identity authorizes AQM; users do not separately connect to Cloud Run. |
| Browser-local / durable / server / Cloud Run | **Local draft**, **Saved evaluation**, **AQM** | Keep explicit local scope warnings; move runtime/deployment detail to diagnostics. |
| Server analytics / This browser | **Saved evaluations / Demo & local history** | Connected view should feel like one analytics product; explain provenance near data, not as architecture. |
| Isolated sandbox / durable server sandbox | **Form test** / **Saved test history** | Keep the guarantee that test results do not enter production quality/coverage; isolated does not mean free. |
| Legacy browser sandbox | **Advanced development tools** | Gate/demote rather than asking ordinary authors to choose an execution architecture. |
| Noul / Choice / Score | **Yes/No / Multiple choice / Ordered rubric** | Provider type can be shown in advanced provenance if needed. |
| Jev request | **AI requests (Jev)** on first mention; then **AI requests** | Keep exact maximum/actual counts and dependency-wave explanation in author cost context. One evaluation can need multiple requests. |
| Provider / model / legacy | **AI model / evaluation provenance** in expanded details | Appropriate to diagnostics and interpreting old missing data; avoid ordinary page subtitles. |
| V0.17 OPERATIONAL OVERVIEW / V0.1 migration description | Version in **About**; “Imported from an earlier form” | Existing version keys/migration compatibility remain until a separately reviewed retirement. |

The audit found no ordinary UI “scorecard” destination and no remaining local publish-to-server control in Overview. Historical `V0.x` storage keys/tests/docs are compatibility/history, not grounds for removal. Technical Secret Manager references, UUIDs, purge-window limits and provider evidence are legitimate admin details; improve placement instead of suppressing useful constraints.

## Action, table and detail conventions

| Operation | Current comparison | Targeted convention |
|---|---|---|
| New / Save | New form, New policy, New group asset; Save changes vs Save draft asset | New + product noun; Save changes with explicit draft/saved/dirty state. R01/R02 before relabeling. |
| Publish / Retire | Publish version / Publish group asset / Retire / Retire group asset | Publish version / Retire version; show consequence for exact pinned policies and existing snapshots. Preserve server lifecycle checks. |
| Duplicate / new version | Duplicate as new form vs Duplicate policy vs group import/new version | Distinguish a new family from a new immutable version. Keep disabled duplicate conditions explained and independent schedule behavior explicit. |
| Import / Export | Form/group JSON portability already creates new drafts | Keep schema validation and preview/context. Do not create a second import pipeline; consistent noun/action placement is enough. |
| Enable / Disable | Policy checkbox and schedule checkbox save separately; published forms use lifecycle | Explain scope beside controls. Do not unify these into one toggle if that would hide separate policy/schedule state. |
| Assign / Claim / Complete | Admin bulk assignment, reviewer claim/start, in-progress takeover confirmation | Existing ownership and partial-work confirmation are good. Preserve expected revisions and completed read-only state. |
| Test / Run | Form Test executes after visible request estimate; manual policy has plan/confirm | Distinguish test from production evaluation; retain maximum AI request counts and recovery ID semantics. Never imply synthetic input guarantees zero cost. |
| Refresh | Overview snapshot retained on failure; policy refresh can discard drafts only with confirm | Preserve stale data with an explicit timestamp/error where reliable. Do not erase unsaved editing state or preview accidentally. |
| Clear / Reset | Browser controls lack confirmation; retention has preview + typed PURGE | Exact scope and confirmation according to consequence, not generic warnings everywhere (R14). |

`OperationalTable` is a useful common base: search above the table, sort buttons, a twenty-row client page, contained horizontal scrolling and result count. Keep it. Important differences are at call sites: first-column descending defaults mean time tables are recent-first but form/group names reverse alphabetically; alerts default to severity text sorting rather than an explicit severity rank. Evaluations adds server pagination to client pagination, so “8 results” describes the loaded window, not the whole organization. Group/role/destination tables omit a search state key; URL filter persistence is not universal. Selection uses named checkboxes and avoids row propagation; retain that.

Targeted improvements: explicit sort defaults/ranks, identity buttons, accurate “results on this page” wording for bounded server lists, reset/clear-filter affordances, searchable current filter chips, and a compact personal-review column set. Cards remain valuable for conversations/forms. Do not attempt to show all evaluation columns on a 390px screen.

| Detail | Emerging pattern and gap |
|---|---|
| Form | Status/version/actions and metadata → grouped content → history → test. Good snapshot/read-only concept; action density and below-list placement need R12. |
| Reusable group | Title embeds name/version/status → actions → content/history. No dirty guard and no consistent close affordance; R01 first. |
| Policy | Summary/actions → criteria/sampling/forms → readiness → separate schedule/status/history. Strongest authoring pattern; read-only explanation can improve. |
| Evaluation / review | AI score/result/context → group results → assignment/human answers → provenance. Keep AI and human scores distinct; put provenance behind a disclosure and focus the detail. |
| Run | Status/policy/version → coverage funnel → selected IDs/failures → policy-evaluation link. Raw timestamps/IDs can be subordinate to a clear recovery action. |
| Alert | Severity/status/context → related run/review → notifications/history. Good related links; show issue meaning before type enums/metadata. |
| Notification destination/rule | Inline forms within Settings, save/cancel; technical channel credentials are admin configuration. Add concise summary/configured state and coherent dirty/close handling; no need to force these into modals. |

## Role experience and Analytics/Calibration boundary

| Role | Useful present experience | Main adjustment |
|---|---|---|
| ADMIN | All operations, authoring, roles, governance, purge preview, alerts, notification settings | Settings section navigation and save scope; surface review management without making every queue visit an administration task. |
| AUTHOR | Forms/groups/policies/schedules/test; read-only notifications; no retention/role mutation | Remove “durable/asset” terminology and inherited read-only review actions; ensure usage/routing reflects connected policies. |
| REVIEWER | Overview My queue, claim/start/save/complete, due priorities; server prevents reviewing another assignee's work | Compact personal queue; subordinate team summary/sample creation; contextual read-only policy/form inspection. |
| VIEWER / quality leader | Overview quality/coverage, Analytics and Calibration, saved evaluation detail; no provider/run mutation | Prefer investigation paths; remove misleading personal-work CTA and disabled manual-run configuration. Read-only values should explain access. |

Overview correctly hides the summary Run now CTA for REVIEWER/VIEWER, but the lower manual-run disclosure remains and exposes a disabled Build server plan after selecting a policy. Evaluations’ My queue button has no equivalent permission gate. These are UI-priority differences; server authorization must remain unchanged.

The product boundary should stay: **Analytics discovers quality/coverage issues; Evaluations supplies individual records and review work; Calibration compares completed human judgments with original AI answers.** Discover low-performing questions via Analytics → Forms → Questions. Investigate disagreement via Calibration → form/version → question → disagreements. Find assigned/due work through My reviews in Evaluations, linked from Overview. Avoid a new Review product page merely to reduce ambiguity. Add contextual cross-links and apply the same cohort/version language; Calibration's unresolved metric can link to the queue instead of becoming another queue implementation.

## Responsive and accessibility observations

All ten primary pages were visually inspected at every requested size; details were also captured at all three sizes. No primary page had document-level horizontal overflow. **This does not mean all controls fit:** R11 records clipped headings/actions masked by overflow clipping.

| Page | 1440 / 1920 observations | 390 observations |
|---|---|---|
| Overview | Clear attention → health → quality → work → schedules/runs; 1920 reduces wrapping. Manual operations appropriately secondary. | Readable cards; multiple attention alerts dominate first screen; My queue and quality lower. No need for more cards. |
| Evaluations | Administrative controls delay the table even at 1440; 1920 exposes more columns. | Long workload/filter/sample/bulk stack; table scroll is contained but cannot substitute for a compact queue. |
| Analytics | Filter bar and dimensions consistent with tables; review metric wraps awkwardly in a single card. | Long filter stack before metrics; tabs scroll. Move advanced filters behind a disclosure. |
| Calibration | Compact comparison KPIs and table; exact form reference field is technical. | Readable cards, still six filters before evidence. Preserve warning about sample limitations but make it readable. |
| Policies | Focused list; detail readiness and separate saves understandable. | Detail actions stack sensibly; raw schedule dates/criteria controls remain dense but usable. |
| Forms | Shared filters and full definition; many actions and a long below-list editor. | Header wraps, table scrolls; published disabled controls add noise; test area is far below definition. |
| Groups | Library focused; details align with form content. | Good row density, scrolling table; protect drafts and make row opening keyboard reachable. |
| Settings | Connection low even at 1920; two page titles. | Approximately 7,279px in the populated ADMIN fixture; section navigation strongly justified. |
| Conversations | Table/cards useful; rich fixture list exposes breadth. | View toggle partly clipped; columns require scrolling. Cards offer the better exploratory view. |
| Conversation Review | Transcript and routing/evaluation panes useful side by side. | Browse action clipped; routing/actions appear ahead of transcript, making inspection feel secondary. |

Pragmatic accessibility review: native buttons and many wrapped field labels are good; statuses such as ERROR/Overdue/Unverified have text, not colour alone. Named evaluation/selection buttons are good examples. Keyboard group-table traversal confirms the row-opening gap. Sort semantics need R06; focus/return handling needs R12. Native form/policy leave-confirm dialogs are browser managed; notification editors are inline and do not require a modal focus trap. No custom modal focus trap was found to certify. Settings needs one page H1, and table scroll regions/action bars need explicit keyboard checks. Read-only published fields and role-disabled fields should explain different reasons. No formal WCAG certification or screen-reader coverage is claimed.

## Error, empty and request behavior

| Condition | Evidence/observed behavior | Assessment / next-action improvement |
|---|---|---|
| Disconnected | All public/first-use captures; Overview/Calibration/evaluations give connection instructions | Correctly avoids synthetic operational health. Link straight to connection and explain safe exploration. |
| No saved data | [empty Overview](v018-evidence/empty-overview.png), [empty evaluations](v018-evidence/empty-evaluations.png) | No false quality score; setup prerequisites should replace scattered empty fragments. |
| API unavailable | [Overview unavailable](v018-evidence/unavailable-overview.png); existing policy load-failure test | Overview explicitly retains last successful snapshot; connected policy failure hides mutations instead of showing local fallback. Keep both patterns. |
| Permission denied | [403 evaluation error](v018-evidence/permission-denied.png); AUTHOR publication 403 in existing role fixture | Explicit forbidden message rather than silent failure. Explain who can grant access; do not reveal forbidden data or enable controls. |
| Incomplete aggregation | [incomplete Overview](v018-evidence/incomplete-overview.png); existing aggregate/overview tests | Independent incomplete/unavailable sections; healthy sections survive. Do not render missing totals as zero. |
| Stale revision conflict | Existing calibration/review and policy browser tests | Policy says changed elsewhere/refresh; partial draft preserved. Give safe reload/copy guidance; group dirty behavior remains an exception. |
| Validation error | Existing authoring dependency-deletion prevention; form/policy/governance validators | Specific errors are better than generic failure. Put summary near save and link/focus invalid fields; a malformed form test should identify issues instead of only “Fix form validation”. |
| No matching filters | [no matching groups](v018-evidence/no-matching-groups.png); existing library filters | Shared empty text is readable but lacks Clear filters. Evaluation empty copy says no production evaluations “on this page” even for search mismatch; differentiate no data from no match. |
| Uncertain form test | Source and existing deterministic form-test isolation/idempotency tests | Recovery reuses the exact test ID; running history retained. Preserve this and distinguish recover from a fresh billable request. |

Request observations use mocked HTTP and real React/browser navigation. Production page entry—not development effect replays—is the basis of R13. Analytics/Calibration use debounce and sequence guards; Overview refresh also rejects stale responses and retains a manual preview. ConversationBrowser remains mounted while hidden, remembers search/scroll and only searches on explicit action; this deliberately avoids repeated Genesys search on navigation. These are positive patterns, not retirement targets. Real organizational data volume, provider latency and live refresh races remain unmeasured.

## Possible retirements

These are decisions for later work, **not deletions in this review**. “Production workflow” below means the connected code path; actual usage telemetry was not queried.

| Candidate / classification | Current purpose and production caller evidence | Migration risk | Recommendation |
|---|---|---|---|
| Browser policy sandbox — **RETIRE candidate** | `PolicyRunner` is rendered only when `!authSession` under a Legacy disclosure (`src/App.tsx:159,188–230`). Calls browser `provider.evaluate`, local histories/runs. Connected policies use PoliciesPage + server plan/run. | Local policies/history/run records may still matter to evaluators; shared domain policy/scoring functions are used by tests/server and cannot be deleted wholesale. | First gate/demote, inventory local export requirements, then retire only the browser runner in a separate tranche. No automatic migration into production. |
| Browser Jev key/proxy path — **RETIRE candidate** | `useKey`/Settings key UI, `PolicyRunner` and FormTestPanel's explicit browser mode use `JevProxyProvider`; connected manual evaluation and saved Form Test use server credentials (`src/App.tsx:38,74,278`; `src/FormTestPanel.tsx:13,21,46`). | Browser Form Test remains an active optional caller. Proxy tests/config and tab-key compatibility would be orphaned by premature removal. | Retire together with browser execution after caller closure; demote now if retained. Do not remove the server Jev provider or historical provenance. |
| Browser evaluation history route — **RETIRE candidate** | `history` remains an accepted page query and renderer (`navigation.ts`, `App.tsx:161,328`), although not in sidebar. local history feeds Evaluations, Analytics and synthetic conversation counts. | Removing route/storage blindly loses historical observations and demo evidence. Existing `parseHistory` handles old records. | Replace direct route with a labeled Demo/local history area/export; remove route only after compatibility/redirect decision. Keep parser until export/migration settled. |
| Browser/server Analytics implementations — **REPLACE candidate** | `AnalyticsPage` switches `dataset` and renders separate local/server filters/tabs (`App.tsx:333–347`). Local mode intentionally supports prepared synthetic fixtures. | Historical local results differ from saved production aggregates; raw merging corrupts counts/coverage. | One terminology/interaction shell; preserve explicit demo scope. Retire duplicate local production analytics only with a local-history preservation decision. |
| Local policy/form/group examples in connected libraries — **REPLACE candidate** | `readForms/readPolicies` seed/restore; form/group fetch merge retains local items; connected policies have a separate remote source. | Unsaved drafts, imported definitions and seed IDs/immutable versions must survive. | Separate starter examples/working drafts from saved library; explicit import/save flow. R05 first; no bulk publish or silent deletion. |
| Old scorecard/form-seed migration — **KEEP internal for now** | `readForms` reads `genesys-aqm-scorecard`; `migrateForms` uses a one-time marker and preserved recreated form (`App.tsx:47–66`). No standalone migration control is exposed. | Historical users may still have pre-form data; removing compatibility without evidence is unsafe. | Hide development wording in migrated description. Retire only with a migration sunset/export plan; no urgency. |
| Save starter library to server — **HIDE / DEMOTE** | Connected groups expose a sequential seed-save action (`QuestionGroupsPage.tsx:34`); starter groups also used by authoring fixtures and offline examples. | Existing immutable published seed versions and user retirements must be honored; hidden local seeds currently affect provenance. | Put in initial setup/import-starter workflow with precise scope, rather than general library maintenance. |
| Synthetic conversations/demo metrics — **KEEP** | Sample library powers public exploration, isolated sample tests and prepared analytics. Clearly fictional provenance; `makeDemoHistory` only loads on explicit action. | Losing it weakens evaluation without credentials and test isolation. | Keep first-use/demo capability and improve purpose/cost labels; do not retire solely because Overview is connected home. |
| Conversation cache / cached source — **KEEP** | Live ConversationBrowser persists hidden and uses bounded cache TTL; forms tests can reuse recent candidates. Governance and CachedDataSettings both offer controls. | Content privacy/identity cleanup, cached search and disconnect semantics are important. | Consolidate UI entry points, preserve implementation behavior and identity isolation. |
| Old local publish / source-review controls — **already absent** | Existing browser tests assert no “Publish local forms and policies to server”, no removed source-review confirmation, and no Overview schedule save. | Reintroducing them would recreate competing production authoring paths. | Do not resurrect. Fix stale Overview-publishing hint rather than adding a button to satisfy it. |

## Small implementation packages

Packages are proposed decisions, not an authorization or completed implementation. Do not combine every finding into one large V0.18 PR.

| Tranche | Exact scope and dependencies | Risk / likely file areas | Live proof / persistence and contracts |
|---|---|---|---|
| **V0.18A — preserve edits and make saves honest** | R01 group dirty/leave protection; R02 one explicit governance save scope; R14 precise local reset/test-history confirmation. Start here. Keep immutable lifecycle and retention preview behavior. | Medium; App navigation, QuestionGroupsPage, GovernancePanel, FormTestPanel. | Fixture proof sufficient for defects. Simon can inspect one safe saved setting; no purge/provider. Existing contracts can stay; partial-update/versioning API would be separate scope. |
| **V0.18B — trustworthy investigation links** | R03 full Analytics cohort + exact version; R04 active/unassigned review predicates; URL round-trip/clear-old-filter tests; clear destination scope labels. Depends only on agreed filter semantics. | Medium; ServerAnalytics, OverviewSummary, navigation, EvaluationsPage, reviews filters/API if needed. | Multi-version/cohort fixtures first; live populated queue optional acceptance. No persistence change; an active-status query contract may need a narrow additive extension. |
| **V0.18C — connected definition authority** | R05 shared saved policies/forms/groups and accurate usage/routing; explicitly labeled local drafts/starter import. Inventory local preservation before touching stores. | Medium-to-high; App state, PoliciesPage, QuestionGroupsPage, authoring/library clients. Keep this separate from copy cleanup. | Simon verifies saved policy/form usage read-only. No paid request needed. Preserve IDs/version pins and local drafts; no automatic migration or schema change proposed. |
| **V0.18D — first-use and Settings navigation** | R07 introduction/explore/connect/checklist and stale hint; R08 one Settings title + section navigation/direct links; relevant R10 terminology. Depends on A save-scope decisions and C's clear data authority for checklist/usage. | Medium; App, GovernancePanel, NotificationsPanel, OverviewSummary, navigation, styles. | Public and role fixtures; real OAuth/connection remains Simon proof. UI-only; no new persistence contract. |
| **V0.18E — reviewer and keyboard usability** | R06 identity controls/aria-sort; R09 compact My reviews mode; R11 action wrapping; R12 detail focus/close/read-only convention. Can split keyboard/mobile fixes from queue layout if review scope is too large. Depends on B cohort predicates. | Medium; OperationalTable/call sites, EvaluationsPage, ReviewOperations/Panel, styles. | Keyboard and role/viewports; optional real assigned-queue acceptance. Keep review revisions, server priority and ownership; no persistence change. |
| **V0.18F — optional request lifecycle tuning** | R13 lazy hidden operations/test history; share governance/directory reads; measure before proposing form-usage endpoint. Depends on stable navigation/detail behavior. | Medium; AutomationPanel, FormTestPanel, access/reviewer hooks, App form metrics. | Fixture request budgets and race tests; authenticated timings required only to justify endpoint/cache additions. Begin UI-only; contract additions explicitly optional. |
| **Later retirement decision — browser execution** | Close browser PolicyRunner and FormTestPanel execution callers together; export/compatibility plan for local history and keys; decide whether demo-only analytics shell replaces local production analytics. Depends on C/D and confirmed preservation requirements. | Medium-to-high; App, FormTestPanel, provider/jev, local history/analytics and proxy configuration. | No provider call required to validate removal. Requires explicit migration/storage/route decisions; **not included in any immediate tranche**. |

## Validation, public inspection and proof gaps

Validation on the unchanged base:

- Frontend TypeScript/production build **passed**. Server TypeScript **passed**. Built JS/CSS filenames match V0.17's recorded production asset names; existing main-chunk size advisory remains.
- Full deterministic suite **53 files / 530 tests passed**. The first sandboxed invocation had local HTTP listener `EPERM` errors; rerunning with loopback listener access passed. This was an execution-environment restriction, not a product finding.
- **29 existing Playwright journeys passed** (authoring, offline drafts, publication/testing, policies/schedules/load errors, ADMIN/REVIEWER review operation, calibration conflict/drill-down, all-role governance/notifications/Overview). Selected 1440px journeys plus all three Overview healthy/incomplete viewports and four mobile authoring/policy/review journeys were run; an expensive all-suite replay was not required for this documentation tranche.
- **14 final evidence journeys passed** on the production build/public site, covering every primary page at all three sizes, additional roles, all detail comparisons, disconnected/demo/public states, incomplete/unavailable/403/empty states and targeted save/keyboard/cohort probes, plus completed Genesys messaging search/content fixtures at all three sizes. Earlier capture failures were harness issues (missing configured notification destination and a hidden-field selector), corrected before final evidence.
- Git comparison contains only this review and `docs/v018-evidence/`. Product-code/lockfile/test/config/asset source trees match the verified `origin/main` base; comparison and validation results are recorded in the manifest. Evidence scripts live under docs and do not alter the application's test suite/configuration.

Public site inspected: **https://simonridd.github.io/Genesys-aqm/** at all three sizes. The actual public build presents the synthetic Conversation Review landing and disconnected Overview connection state. No OAuth sign-in was attempted. Browser inspection succeeded even though the web text-fetch tool could not access the page. Blocked-origin records are retained; no authenticated API request was allowed from those contexts.

Remaining proof gaps:

1. **Authenticated live Overview is Simon's separate proof**: real operational health freshness, actual schedules/alerts and review totals are not certified by fixtures or a public page.
2. Real first-time authorization/Genesys identity and allowed roles; no credentials were requested, and mock OAuth cannot prove a real organization's grants.
3. Actual scheduled/manual provider execution, transcript/email availability, Jev request accounting and provider failure recovery. No paid requests or live Genesys calls were made.
4. Real notification transport/secret configuration and delivery retries. Mock configuration/queued delivery is not an email/webhook transport proof.
5. Production-size library/aggregate latency, pagination distribution and multi-tab update races; local request counts do not quantify live cost or speed.
6. Full screen-reader use and formal accessibility conformance were outside this pragmatic review. Keyboard defects have direct local evidence.

No product behavior has been changed, and no surface has been removed. Review findings should be approved/scoped before implementation work begins.
