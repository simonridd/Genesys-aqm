# Genesys AQM — V0.19E reviewer focus and mobile actions

4 October 2026. Canonical base: `c20604c3b33b81a0038388851d07d6f500792bdb`. Dedicated branch/worktree: `codex/aqm-v019e-reviewer-focus`, `/private/tmp/aqm-v019e-reviewer-focus`. The final whole-product review at `a9805e6f034f8c7283eb6385e8b6e40c2991a7d3` supplies the two P1 findings and the unchanged scoring rubric; that branch is read-only and is not merged.

This pass addresses F1/F2 only. General terminology, Analytics browser Back, scale discovery, Calibration form selection, Overview compression, coverage wording, calculator rounding, policy UX and public handoff remain backlog. No environment-builder-v2, backend route/schema/state/API, SLA domain, scoring semantics, provider integration or role navigation change is included.

## F1 — mobile review action

**FIXED.** Canonical 390×844 My Reviews exposed the highest-priority Start review at **x=1025.375, width=78.5**, outside the 390px viewport. It required discovering the table's internal horizontal scroll. The canonical controlled run reproduces the exact coordinate in the whole-product review.

The same fictional authenticated fixture now exposes **Start review at x=43, y=799.90625, width=304, height=42**, with **scrollX=0, scrollY=0**. Its right edge is 347 and bottom is 841.90625, inside the initial visible main content and 390×844 viewport. SLA state, named form/version, agent and queue are visible above it. The document is 390px wide. [Bounds and comparison](v019e-evidence/geometry-comparison.json); [initial viewport](v019e-evidence/queue-390x844-viewport.png).

At the existing 650px mobile breakpoint, My Reviews has real task buttons in cards. Desktop retains OperationalTable, with the review action next to priority and meaningful context replacing raw conversation identity in this work surface. The table and cards render the **same `pageRows`**, produced by the existing filter/search/rank/pagination path; there is no new collection, backend query, authority check or parallel data model. Search and presentation page persist through resize. Ordinary All Evaluations remains a table/explorer. Available unassigned review work also exposes Claim and start review through the responsive work presentation.

Workload remains concise above the queue. All secondary filter values stay mounted under the existing More filters control. No queue filter semantics change. The presentation page is a URL-only `evaluations.page` value, never an API filter or draft field.

## F2 — active review focus

**FIXED.** Previously, the human answers followed the queue, evaluation metrics/context, score summary, group comparison, metadata and comparison filters. Canonical first-answer distance from evaluation-detail top was **2,259.609375px**. The focused workspace now requires **661.984375px**: **1,597.625px / 70.70% less** with the same record/questions and real local API fixture. These are controlled presentation distances, not a recruited-human time study. No arbitrary pixel acceptance threshold was introduced. [Before/after geometry](v019e-evidence/geometry-comparison.json).

A small explicit `reviewFocusId` is set by Start/Claim/Continue task selection, successful explicit Start/Claim inside explorer detail, and an evidence return with `returnFocus=review`. It clears on leaving the workspace. The queue and its mounted table/filter state are hidden while focused; workload cards and queue actions are absent from the visible/accessibility work path. Exploration opens ordinary evaluation analysis until the user explicitly begins review work.

The active surface follows this hierarchy:

1. Back to My Reviews (or the original review queue), named form/version, agent/queue/channel, review status and due/SLA.
2. Open conversation evidence.
3. Human-review heading, assignment-to-you context, unsaved/conflict state, compact applicable progress and top Start or Save/Complete controls.
4. Question, instructions, **human answer and question note**, then compact AI reference. Desktop uses balanced columns; mobile follows the same human-first DOM order.
5. Overall note and the end Save/Complete action bar.
6. Closed Review comparison; Assignment details for assignment managers; closed Review history and Evaluation details/Provenance.

The top and end action bars share one handler, busy state, answers and revision authority. They are intentional placements, not a resize duplication, and no sticky overlay is used. A successful Start/Claim focuses the first reviewable answer; opening Continue focuses contextual identity and exposes the current draft/authoritative answers immediately. Evidence return focuses the task heading without showing the queue above it. [Mobile start](v019e-evidence/focused-start-390x844-viewport.png), [first question](v019e-evidence/active-question-390x844-viewport.png), [desktop](v019e-evidence/active-question-1440x900-viewport.png).

Progress counts actual enabled, non-skipped review questions; the fixture with a skipped question shows 0/2 then 2/2. No stored progress field was added. Comparison, scoring and AI evidence remain available. After completion the compact result/comparison becomes prominent, with optional question comparison and closed history.

## Continuity and completion

The draft controller, baseRevision/expectedRevision, beforeunload guard, reassignment/conflict authority, exact evidence return URL and completion reconciliation are preserved. Original AI records remain immutable. Focus changes do not remount the active ReviewPanel during a successful explicit Start, so its success/busy state survives the presentation transition.

The qualified paths cover two answers, a question note and an overall note → evidence → exact return, with no review PUT during navigation and no localStorage/sessionStorage/IndexedDB draft write. Unsaved review changes remains attached to the active task; session-only drafts are not described as cached or locally saved.

Dirty revision 3 → server revision 4 retains text, shows the conflict alert, disables submission and offers Refresh/Discard. Dirty reassignment retains text, explains read-only authority and removes submission. Two review drafts survive queue/SPA switches without cross-review leakage. Save adopts the returned revision; a full reload begins a new session without unsubmitted text.

Completion sends exactly one completion PUT, immediately removes the item from My Reviews/active cohorts, refreshes workload and keeps the confirmation **“The original AI result is preserved.”** visible. All Evaluations retains matching results. Failed background refresh does not undo reconciliation; failed completion retains work and explicit retry succeeds once. Completed focus remains until Close and continue returns to the same queue. Both the later **server cursor** and later **presentation page** are checked through open → evidence → return → complete → queue return.

## Mobile task replay and accessibility

Goal: “Complete the review that needs my attention.” Same fictional highest-priority escalated review as the fresh review; actual local HTTP API contracts, not a mock rendered component. The replay uses **11 logical actions**: choose, Start, answer Q1, question note, answer Q2, overall note, evidence, Back, answer Q3, Complete, Close/continue. **0 horizontal discovery gestures; 0 wrong turns; 0 irrelevant vertical analysis detours.** Ordinary question/transcript scrolling remains. [Action record](v019e-evidence/task-390x844.json).

Keyboard-only replay covers queue CTA → workspace heading → Start → first answer → note → evidence → Back to task heading → remaining answers → completion confirmation → queue. Real buttons, labelled answer controls, one visible H1, H2 task/H3 question hierarchy, status/live progress, conflict alerts and native details/summary semantics remain. Hidden table/cards and the hidden queue are not competing focus paths. Resize 1440 → 390 → 1440 retains draft and review focus, with the same two deliberate action placements and no page overflow.

Required geometry and visual states are checked at **390×844, 1440×900, 1920×1080, 1440×720**. Queue, focus, evidence return and completion have no new document-level horizontal overflow. [Visual index](v019e-evidence/README.md). This is Chromium emulation and pragmatic keyboard inspection, not a physical-device or screen-reader certification.

## Same-rubric focused score recheck

The unchanged scale is 1 seriously ineffective, 2 major friction, 3 acceptable prototype, 4 strong internal product, 5 unusually polished/intuitive.

| Category | Fresh whole-product | Focused recheck | Interpretation |
|---|---:|---:|---|
| Reviewer usability | 3 | **4** | Main task is visible and coherent; safe continuity is supported by task hierarchy. |
| Ease of use | 3 | **4 for reviewer task** | No horizontal/action discovery or analysis detour. Whole-product score remains 3 because unrelated friction is untouched. |
| Responsive/mobile quality | 3 | **4 for reviewer task** | Initial mobile CTA, human-first controls, geometry and resize pass. Whole-product score remains 3 because other explorer tables retain their behavior. |
| Workflow coherence | 4 | **4** | Choose → evidence → judge → complete → same queue is now focused; a whole-product 5 is not claimed. |
| Focused mobile reviewer task | — | **4** | Target met without weakening the rubric. |

A 5 would require stronger human-study/physical-device evidence and further reduction in long question/note/tab flows. This is a scoped automated/editorial recheck, not another independent whole-product review or a new overall mean. [Scores and limits](v019e-evidence/score-recheck.json).

Release question: **yes**, a reviewer can see, start, carry out and complete the main mobile task without horizontal discovery or irrelevant analysis preceding the inputs in this qualified fictional replay. **F1 FIXED; F2 FIXED.** Once final committed-source/public/preservation qualification is recorded below, V0.19.0 can proceed to ChatGPT review/merge and release/tag decision; this tranche creates no PR, merge or tag.

## Validation, deployment and preservation

The production TypeScript/Vite build passes. **65 deterministic files / 621 tests pass**. **116 current-contract browser checks pass**, comprising 24 V0.19A continuity cases, 15 focused V0.19E cases, 19 V0.19B authoring cases, 12 V0.19C quality cases, 22 V0.19D navigation/mobile cases, 9 investigation/Calibration-link cases and 15 ordinary Overview cases. The Vite-only OperationalTable core/shared-card harness adds **2 passed checks**. Canonical controlled baseline is a separate 1-case measurement, not another qualification count. [Final browser report](v019e-evidence/final-browser-qualification.json), [validation summary](v019e-evidence/validation-summary.json).

Two legacy Overview entry expectations remain **EXPECTED CONTRACT CHANGE / STALE TEST** (artificial pre-mounted session and unauthenticated root). They failed in the raw 79-case diagnostic run and are excluded from the current-contract run. They are unchanged, documented debt; no current test assertion is weakened. Sandbox listener/credential access, mismatched port, adaptive-opener race, component source-import requirements and a new fixture revision-seed defect are **HARNESS DEFECT** issues, resolved in qualification. Intermediate mobile layout failures were **PRODUCT REGRESSION**, corrected before final qualification. No unresolved product regression or harness failure remains in the scoped checks. This pass does not clean up the wider 62 stale / 1 harness failures in the canonical whole-product broad run.

Committed-source deployment and preservation records will be appended after completion. Interim diagnostic runs are retained and every encountered failure is classified in [failure-classification.md](v019e-evidence/failure-classification.md). The two pre-existing Overview entry expectations remain untouched; they are separate from current-contract reviewer qualification and the wider stale-suite debt recorded by the canonical review.
