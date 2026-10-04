# V0.21A — Showcase-to-product continuity

Canonical base: `fadb73dac800cede26389fe883602967cf5b8784`, fetched and verified as `origin/main` before editing. Dedicated managed worktree and branch `codex/aqm-v021a-showcase-product-continuity`; `git merge-base HEAD origin/main` was exactly that SHA. The fresh whole-product review branch was never used as an implementation base. V0.20.0 remains immutable. Frontend only; backend remains `aqm-api-v019-e92f2d6`.

## N1 baseline on the exact released source

Four clean-storage browser captures cover Welcome → Explore and Demo chapter 5 → More options → Explore, at 1440×900 and 390×844. Each enters **Conversations**, with 19 fictional samples and no Jamie context, explanation of the separate library, or recommended first sample. Table is the clean default. Columns are **Timestamp, Conversation ID, Source, Channel, Agent, Queue, Direction, Topic, Transcript, Evaluations**. Desktop's first visible samples are Delayed delivery (`conv-delivery-002`) and Duplicate payment (`conv-billing-001`), followed by Needs-led sales (`syn-sales-service`). Their scenario titles/summaries are absent from the table. Raw IDs are the row-opening buttons. A visitor must scan, scroll, search or switch to Cards and invent a useful first task. Mobile initially shows navigation, source selection, heading, view controls and filters; sample rows require vertical scrolling and table discovery. No quantitative human-study wrong-turn count is claimed for baseline.

The workspace footer reads **V0.19D SHOWCASE • 2026** on desktop. The same stale text is in the mobile DOM; the inherited mobile sidebar layout hides the footer. [Baseline log](v021a-evidence/baseline-browser.txt), [desktop Welcome](v021a-evidence/before/welcome-library-1440x900.png), [desktop demo](v021a-evidence/before/demo-library-1440x900.png), [mobile](v021a-evidence/before/demo-library-390x844.png). JSON companions record heading, visible text, ARIA, columns, first rows, URL and footer.

## Contextual handoff and existing sample

Both disconnected **Explore the prototype** actions push `?page=conversations&entry=showcase`. Root still unmounts the showcase and deliberately mounts the real workspace. No new storage key or persistent onboarding state exists. A disconnected showcase-origin workspace starts on the fictional source even if a previous source selection pointed at unconnected Genesys. Connected **Open AQM** continues directly to Overview (`page=automation`), without this panel.

The ordinary DOM panel follows the Conversations h1 and view controls, before filters/library. It uses a semantic h2, h3 and named section, with no modal, acknowledgment, focus trap or walkthrough. Copy:

> The guided demo used Jamie's fictional conversation. This workspace contains separate fictional examples you can explore safely without connecting Genesys.

It recommends the existing **Incomplete resolution** sample: **Theo Martin with Jordan Lee**, Technical Support, Technical, messaging. The unchanged transcript demonstrates investigation of invoice-download crashes, reproduction on a test account, then no fix date or workaround: “Please keep checking the app.” The recommendation explicitly connects that missing next step to the guided quality theme. A single CTA, **Open Incomplete resolution →**, opens the existing Conversation detail. The boundary reads **Fictional sample · No Genesys connection required · No live AI request**. One sentence suggests reading and deciding whether the customer received a clear next step. No Jamie/sample identity conflation or live evaluation promise.

Ordinary workspace navigation keeps its existing replace-history behavior. Selecting **any** sample navigates to Conversation detail and removes `entry`; leaving Conversations for another workspace page also removes it. Back to Conversations then shows the ordinary reusable library. Browser Back returns to the previous Welcome or chapter-5 demo entry; Forward is predictable and does not resurrect consumed introduction state. About → Welcome → Back is covered. No new workspace history stack is introduced.

## Human-first synthetic library and direct-entry boundary

Synthetic Table columns are now **Scenario, Customer, Quality, Agent, Queue, Channel, Topic, Evaluations**. Scenario contains the title-opening button and a short visible summary. The meaningful accessible identity is **Open Incomplete resolution for Theo Martin**. Search includes title, summary, customer and other displayed fields; searching “next step” reveals the relevant case without ID interpretation. Repeated Synthetic source, raw ID, timestamp, direction and constant Transcript columns no longer displace scenario context. IDs remain intact in the conversation objects and behind the existing closed **Conversation details** disclosure after messages.

The real Genesys table and its columns are unchanged. The existing Cards rendering is preserved, including queue/channel, quality, scenario, summary, agent, message count and topic. Table/Cards continues to use the single existing preference key. Saved preferences survive showcase entry. The clean default remains Table: rendered desktop proof shows readable titles/summaries/customer/quality without horizontal discovery, and the contextual CTA supplies a clear first action independently of view. No second preference key or special Cards default was needed.

A clean direct `?page=conversations` remains the ordinary synthetic library with **no handoff panel**. Search, filters, sorting, view changes and alternate-sample selection are available during handoff. Choosing Duplicate payment demonstrates the alternative path and consumption. [Table goal](v021a-evidence/after/table-goal-1440.png), [Cards](v021a-evidence/after/cards-1440.png), [alternate](v021a-evidence/after/alternate-1440.png).

## N4 release-neutral shell identity

**V0.19D SHOWCASE • 2026 → INTERNAL PILOT • 2026**. Disconnected and authenticated-shaped shells are checked. No runtime discovery or new tranche/version label. Showcase header **Interactive demo · fictional data · no live requests** is unchanged.

## Goal-only task, mobile and keyboard

Task: “I've finished the guided demo. Show me something useful I can try in the prototype without connecting Genesys.” Scripted goal proof uses either Explore entry, reads the panel and clicks the recommended CTA, then reads Theo/Jordan's transcript. **One primary action after entry; wrong turns 0; technical disclosures 0; credentials/provider actions 0.** The separate technical-hierarchy qualification deliberately opens/closes Conversation details to verify retention of the exact ID; that disclosure is not required by the goal task. This is browser/ARIA/task-path qualification, not a recruited user study.

Viewports: **1440×900, 1920×1080, 390×844**, plus **1440×720** smoke. **1440 → 390 → 1440** preserves active Table view, search query, filtered result and URL; saved Cards/Table preferences also persist. At mobile the ordinary navigation/source shell precedes the panel, so vertical scrolling remains necessary. The panel itself is **360px wide and about 393px tall**, with readable copy, a full reachable CTA and boundary text, no horizontal discovery or document overflow. [Mobile panel](v021a-evidence/after/demo-handoff-visible-390x844.png), [mobile transcript](v021a-evidence/after/demo-recommended-390x844.png). Cards and Table controls remain reachable.

Keyboard-only Tab/Enter goes through Welcome → Explore → recommended sample → Conversation detail → Back to Conversations, and Demo More options → Explore → recommended sample. Focus is visible; names are meaningful; no trap or custom focus system. Ordinary browser Back/Forward and chapter history are checked. Native reading order is h1 → panel h2 → sample h3 → CTA → filters/library. Transcript remains primary and technical detail closed. Disconnected evaluation continues to say **Connect Genesys Cloud to evaluate this conversation**.

## Validation and focused regressions

Build passes. **714/714 deterministic tests**, **17/17 focused continuity browser checks**, **11/11 showcase regression/isolation checks**, **2/2 V0.20D investigation-history smoke checks**. [Deterministic](v021a-evidence/deterministic-tests.txt), [continuity](v021a-evidence/browser.txt), [showcase](v021a-evidence/showcase-smoke.txt), [investigation smoke](v021a-evidence/investigation-smoke.txt).

Focused coverage protects both entry points, direct-library absence, recommendation and existing transcript, alternate selection, query consumption, Back/Forward, human table identity/summary/search, no ID/Source column, retained Cards, saved preferences, resize, disconnected first-use, authenticated-shaped Welcome/demo Open AQM → Overview, About → Welcome → return, neutral footer and V0.20F transcript/technical hierarchy. The existing showcase suite covers all five chapters, Welcome calculator, Plan a pilot, public network/storage isolation, established-session-shaped showcase isolation and failed lazy demo load. Root navigation was touched, so Analytics rapid Back/Forward and Calibration exact-cohort history receive smoke checks; no investigation focus behavior is changed.

Initial test-only failures are retained: an inherited smoke asserted per-row “Synthetic” after Source-column removal, and the new filter test used an exact implicit label selector. The smoke now checks the existing library-level fictional-data statement plus contextual panel; the filter test uses its existing combobox accessible name. Final runs pass without retries/skips. Product filters were not altered to satisfy tests. [Initial continuity](v021a-evidence/browser-initial.txt), [initial smoke](v021a-evidence/showcase-smoke-initial.txt).

Before explicit handoff, browser isolation protects **0 AQM API calls, 0 Genesys, 0 Jev, 0 notifications, 0 product-storage writes**; guarded Storage and IndexedDB tests pass. After Explore, ordinary workspace initialization is intentional and distinct. Authenticated public/local proofs use fictional OAuth/API fixtures; they are not live-provider authentication claims.

## Scoped scores

Unchanged 1–5 rubric: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. **Showcase → product continuity 4; First-use learnability 4; User-facing cleanliness 4; Mobile handoff 4.** Named relevant recommendation, explicit separate-fictional-library copy, a single safe action, consumed context, human table summaries, preserved preferences and mobile/keyboard evidence support 4. Scripted qualification and inherited mobile shell/vertical scrolling limit a 5 claim. No whole-product mean.

## Publication and preservation

Publication is from an immutable Git archive of the tested committed source. The archive's build inputs and 12-file dist are compared byte-for-byte with the locally qualified build. Pages complete tree, all 12 paths and actual public response bytes are checked; compact public desktop/mobile browser proof then exercises both entry paths, recommended/alternate sample, direct library, authenticated-shaped Overview and footer.

Read-only before/after production proof covers 25 expected collection counts/hashes, actual collection inventory, Cloud Run revision/image/config/traffic and service IAM, three provider secrets' metadata/version/IAM, and Scheduler configuration. Only hashes/counts and operational timestamp context are saved; no secret payload or production document content is saved. Natural hourly health/Scheduler timestamp movement is separated from work-caused changes.

No backend concept, saved AQM data change, provider execution, notification, Cloud Run deployment, merge, PR or tag. No N2 schedule change, N3 keyboard investigation/focus work, Evaluation filter/focus/skip-link changes, or guided chapter/calculator/coverage/reviewer/authoring edits. V0.20 release history is retained. Public deployment SHAs, equality, final preservation and tag verification are recorded below after publication.
