# V0.18E — reviewer experience, keyboard access, detail focus and mobile actions

Base: main `ae486a9c169167f92f1739dc3b20251c159d0040`. Dedicated branch: `codex/aqm-v0-18e-usability`. This tranche addresses R06, R09, R11 and R12. No PR, merge, v0.18.0 release, backend runtime change, schema migration or Cloud Run deployment is included. environment-builder-v2 is untouched.

## R06 — keyboard tables

`OperationalTable` accepts `selectionControl: { columnKey, label }` for a plain identity column, plus `tableLabel`, `bounded` and `preserveOrder`. The identity is a native button with an identifiable accessible name and visible focus outline. Custom rendered cells are never automatically wrapped; Evaluations and Policies retain their existing explicit buttons. Rows retain pointer convenience without tabIndex or button roles. The shared row handler ignores nested buttons, links, inputs, labels, selects, textareas and disclosures; identity buttons also stop propagation.

Every selectable OperationalTable was audited: forms, reusable groups, Calibration forms/questions, monitoring runs, alerts, audit events, sample conversations, completed interactions, browser Analytics and server Analytics now have keyboard identity controls. Evaluations and Policies already had controls. Notification destination/rule tables retain explicit Edit buttons; notification history and role assignments have no row selection. Reviewer workload is a summary/card grid with explicit queue buttons, not a selectable table.

`aria-sort` is on TH, with Enter/Space sort buttons; changing column removes the old sort state. Named, focusable scroll regions preserve horizontal table scrolling. Bounded server pages say “results on this page”; whole local libraries retain ordinary result wording. My reviews disables client column sorting so server/domain queue priority remains authoritative.

Evidence: `tests/operational-table.spec.ts` checks Tab reachability, Enter/Space, pointer opening, identity invocation once, nested checkbox/button/link counts, visible focus, named scroll-region focus and ascending/descending/moved-column sort semantics. `tests/usability.spec.ts` performs keyboard-only core journeys with Tab and Enter/Space, including conversation opening. No mouse is required for Forms, Groups, Evaluations, runs, alerts, policies, Calibration and audit journeys.

## R09 — My reviews

Evaluations exposes My reviews and All evaluations to roles with `reviews.write`. Normal REVIEWER navigation (`reviews.write && !reviews.assign`) defaults to My reviews after permissions load. ADMIN defaults to All evaluations. AUTHOR and VIEWER have All evaluations and no misleading personal-review mode or CTA. Existing URL investigation filters, Analytics return state, Overview `reviewQueue=active` and evaluationId deep links take precedence over the default. Clicking the already selected All evaluations mode preserves an active investigation.

My reviews uses `reviewQueue=mine&assignment=mine`. No browser-supplied user ID determines the secure predicate. Existing server assignment matching and queue priority are preserved, including escalated, overdue, due-soon, in-progress, requested and dated/undated ordering. The existing review-workload response supplies a compact personal display: Assigned open, Due soon, Overdue and Escalated. Incomplete summaries are explained, not presented as zero authoritative totals.

The default filters are Status, SLA state and Due; More filters reveals the existing explorer. Compact columns are Queue priority, Conversation, Agent, Queue, Form, AI score, Review, Due and Action. Assigned requested/in-progress rows offer Start review or Continue review, focusing Human review without duplicating scoring or mutating a review. ReviewPanel remains authoritative for ownership, claiming, revisions and scoring.

Available unassigned reviews appears only when the complete existing workload summary reports requested unassigned work. It switches to exactly `reviewStatus=REVIEW_REQUESTED&assignment=unassigned`, excluding NOT_REVIEWED records. Existing Claim and start review remains in ReviewPanel and is covered by assignment regressions. All evaluations retains the full explorer; team workload, calibration sample and bulk assignment are disclosures. Permissions remain unchanged. Browser history remains available; selecting it from My reviews switches to the All evaluations browser explorer.

Evidence: four-role defaults, explicit investigation precedence, actor-mine request values, queue order, compact columns, unassigned count/predicate, mode switching, active-cohort preservation and review-action focus are in `tests/usability.spec.ts`. Existing V0.18B investigations and V0.15/V0.16 assignment/SLA journeys pass with disclosures opened explicitly.

## R11 — clipped mobile actions

Small-width page headings stack title/context and actions. The Conversations Table/Cards toggle remains intact. Conversation review Back/Browse actions share a wrapping responsive container; labels remain readable and controls remain touchable. Ordinary heading/detail buttons wrap within their available width. Tables retain horizontal scroll regions.

At 390×844, assertions inspect each important control's bounding box against the main-content bounds and visible viewport, with one CSS pixel tolerance for browser subpixel rounding. They cover Table, Cards, Back, Browse, both evaluation modes and detail Close controls. These checks detect clipped controls even when main-content hides document overflow. Exact measured rectangles are saved in `v018e-evidence/bounding-boxes.json`.

Screenshots for Conversations, Conversation review, the loaded My reviews queue, focused evaluation detail, Human review action focus, published form and published group were inspected at 390×844, 1440×900 and 1920×1080. Inspection sheets retain the reviewed screenshots together.

## R12 — inline details and readable restrictions

`useDetailFocus` captures the opener, focuses and scrolls the mounted detail heading (tabIndex -1), and restores focus to a connected visible opener on close. Deep links fall back to a list heading. It tolerates asynchronous detail loading and repeated selection, and does not steal focus on ordinary edits/refreshes to the same selection. No modal or smooth-scroll framework is introduced.

Applied surfaces: Form, Question Group, Policy, Evaluation, Run, Alert, Calibration question drill, Audit, Notification destination editor and Notification rule editor. Each has a consistent heading-area close/back action or the existing editor Cancel action. Monitoring run close leaves its containing operations list open. Group close retains unsaved-change confirmation. Form close retains the working form without discarding edits. Policy close retains drafts and the existing page-level dirty guard, with an explicit warning when necessary. Notification save/cancel returns to its editor opener.

Forms and reusable groups explain “Published version is read-only. Create a new version to edit.” Role restrictions explain “You have read-only access. Your role cannot edit this configuration.” Retired versions have their own immutable explanation. Policy name/description remain enabled readOnly text fields for copying; unavailable choice controls stay disabled. Existing Forms/Groups text fields remain readOnly. No RBAC or lifecycle authority changes.

Evidence includes heading focus/in-view, close/opener return for Forms, Groups, Evaluation and Run; Alert/Policy smoke; Calibration/Audit keyboard opening; deep-linked Evaluation fallback; published immutable explanations; permission-based policy explanation/copyable fields; and notification editor return focus.

## Validation

- Full deterministic suite: 558 tests in 58 files pass.
- Frontend typecheck/build, server typecheck and server build pass.
- Development browser validation: 109 journeys pass, covering the focused usability suite and V0.18A save protection, V0.18B investigations, V0.18C saved-definition authority, V0.18D first-use/Settings, review assignment/SLA, cache, governance and notifications. Three additional existing calibration/scoring/conflict journeys pass. Final additions verify notification focus and active-cohort preservation; 46 focused/conversation/cache/first-use journeys were rerun after the final conversation table audit.
- Seventeen journeys pass against the deployable production build at all requested viewports. The shared table harness also passes against Vite with event-count assertions.
- Provider requests and mutations in browser validation are mocked or in-memory. New focused journeys abort external traffic except explicitly fictional OAuth/API responses. No paid Jev, live Genesys provider call, real notification or production review mutation occurs.

Reproduction and logs: [v018e-evidence/README.md](v018e-evidence/README.md). Publication/preservation proof is recorded after deployment in `pages.json` and `preservation.json` in that directory.

## Deferred

R13 performance/request tuning remains open and measurement-led. Broad R10 terminology cleanup remains deferred. Browser execution retirement remains deferred. No usage endpoint, caching redesign, Overview fetch consolidation, speculative lazy loading, persisted domain field or backend/schema change was added.
