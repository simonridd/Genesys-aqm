# V0.20F — User-facing language & technical detail hierarchy

Canonical base: `c128bca90b68df3cbf4f64462587e51b7a59b681`, verified against remote `main`. Dedicated branch: `codex/aqm-v020f-user-language`. Changes are frontend presentation and focused test/evidence maintenance. No backend, API, persisted types/fields, status enums, routes, query values, storage keys or collections changed.

## Baseline

Before source edits, the exact base was captured at 1440×900 and 390×844 with realistic fictional Genesys metadata and authenticated fictional APIs. The ten routine captures cover Conversation detail, assigned Policy detail, All Evaluations, Evaluation detail and focused Human review. Hidden disclosures were excluded from leakage observations. See [baseline captures](v020f-evidence/before/) and [baseline browser log](v020f-evidence/baseline-browser.txt).

- Conversation review navigation/H1 conflicted with Human review. The transcript header showed a conversation UUID; its metadata bar put `source`, `conversationEnd`, agent ID, queue UUID, `wrapUpCode`, `durationSeconds`, session UUID and `transcriptStatus` before messages. On mobile, evaluation controls also preceded the transcript.
- Policies showed Refresh durable policies, DURABLE POLICY, Saved — to server, the raw `general_service` assignment ID and Schedule matches server.
- All Evaluations showed raw review enums, conversation UUID identity, raw source values and three ordinary exact-reference filters.
- Evaluation detail exposed Conversation UUID, Run ID, raw source, provider/model and evaluation ID in normal context/provenance text. Human review also showed raw enum text outside focused mode.
- Focused review already kept answers/evidence/completion first and technical evidence closed. Its principal routine architecture leakage was the shared top status.

## Language and task boundaries

EvaluationRecord → Evaluation / saved evaluation; durable or server-saved → Saved in AQM; browser-local → Saved in this browser / local draft; durable/server policy → Policy; automation frequency → Schedule; monitoring run → Policy run; Conversation review → Conversation detail. Stored/API names and values remain exact.

A shared pure `userLanguage.ts` maps NOT_REVIEWED → Not reviewed, REVIEW_REQUESTED → Review requested (Ready to review in task queues), IN_REVIEW → In progress, REVIEWED → Completed. Filters, list cells, scope chips and detail use this authority. Source labels are human, with an honest unavailable fallback; the exact source remains in provenance.

Conversation detail means inspecting transcript/context and optionally running an AI evaluation. Human review independently answers the evaluation form. The internal `evaluate` route stays unchanged. Navigation presentation, breadcrumb, H1 and evidence return copy use Conversation detail / Back to human review. Top status retains its original condition and now says Jev available through AQM; disconnected copy remains Connect Genesys Cloud. No health check was added.

First local request estimates say AI requests (Jev); subsequent copy says AI requests. Counts remain visible. Manual evaluation selection continues to require published, valid forms and the authoritative exact form/version. Successful evaluation copy says saved in AQM. Its model/form/conversation evidence remains in closed Evaluation provenance.

The existing answer-format authority supplies **Yes / No**, **Multiple choice**, **Ordered scale**, including human-review and manual-result labels. No new vocabulary or answer-domain change.

## Conversation evidence

The transcript header shows customer, agent, date/time and channel. Ordinary metadata uses an explicit allow-list: Queue, Direction, Topic, Tags, Transcript status when it is not simply Available. Unknown keys are never promoted. A queue fallback equal to its queue ID, or a UUID value, is omitted from normal metadata. IDs do not become invented names.

Messages precede the compact native **Conversation details** disclosure. The disclosure retains exact conversation/customer/agent IDs and safe raw metadata, including queue/session/source/provider identifiers. It excludes keys associated with credentials/secrets/tokens and recognizable bearer/JWT/private-key values. No transcript duplication or new fetching is introduced. The transcript now precedes source controls; on mobile it also precedes the AI evaluation panel. Names wrap instead of being ellipsized. [Conversation captures](v020f-evidence/after/conversation-390x844.png) show the hierarchy; [technical capture](v020f-evidence/after/conversation-technical-390x844.png) demonstrates retained evidence.

## Policies

Connected authority reads Saved AQM policies / SAVED POLICY / Saved in AQM; disconnected authority reads LOCAL POLICY / Saved in this browser; dirty copy stays Unsaved changes. Refresh/load wording uses policies. Schedule replaces frequency-authoring Automation language and retains independent Save schedule / Save changes actions.

Ordinary assignments show form name, exact version, question count and Weighted / Group weighted. Copy explains: “Each assignment uses this exact published version. Publishing a newer version does not change this policy automatically.” Advanced details retains Policy ID/version, exact assigned form references, Schedule ID/version. Missing or non-operational assignments remain visible as “Assigned form is no longer available. Remove assignment”; exact references remain in the disclosure. The same raw-ID validation messages are humanized only at the policy presentation boundary; domain validation is unchanged.

Criteria and deterministic sample seed are unchanged. Saved/local separation, immutable definitions/version semantics, dirty guards, separate policy/schedule saves, read-only roles and fail-closed loading remain. Current browser checks explicitly exercise existing-policy separate saves, rejected dirty navigation, unchanged exact assignments/version increments, missing assignment recovery, local wording and read-only roles.

## Evaluations and Human review

Ordinary filters retain History, Review status, Assignment, SLA state/Due, Agent, Queue, Channel, Result, From/To, Source, Trigger and Critical failure. History options say Saved in AQM / Saved in this browser but still store `server` / `browser`. A closed native **Advanced filters** disclosure holds Exact form reference, Exact question reference and Exact policy reference with “For troubleshooting or exact historical links.” Their input handlers, API parameters and query values are unchanged.

Evaluation identity now uses agent/channel alongside form, queue and evaluated time; accessible open/select names use human context. Exact IDs remain in the deep-link contract and provenance. Test identity assertions now use non-visible `data-evaluation-id` attributes; visible-state assertions use rendered text and accessible roles, never global DOM/source bans.

Normal detail distinguishes **AI evaluation result** from **Human review**, and shows score/result, human status, form/version, agent, queue, channel/topic, policy name, evaluation date and human source. Closed **Evaluation provenance** supplies evaluation/conversation/policy-run IDs, policy references, agent ID/raw queue, evaluation timestamp, provider/model, execution mode, source, exact form/version, request count and reviewer/assignee IDs. One disclosure answers the technical evidence goal.

Focused review retains the V0.19E ordering and closed AI-result/provenance/history disclosures. Answers, notes, evidence return, expectedRevision, session-only drafts, assignment authority, conflicts, reconciliation and immutable AI results are unchanged. Revision/identity audit evidence stays deliberate. Missing reviewer names say Reviewer name unavailable in routine detail/list. Directory/assignment controls retain ID fallbacks where distinct unnamed reviewers otherwise become ambiguous; their contracts are unchanged.

`evaluation.scopeLabels` remains intact. Human originating labels such as Customer Service v17 / Clear next step still travel through Analytics/Calibration investigations; exact URL/API values remain `general_service@17` / `understanding`. Unknown exact references use human placeholders until a name is available and remain inspectable in Advanced filters. API failure Technical details remains separate from successful-data Evaluation provenance.

## Goal tasks, responsive behavior and accessibility

These are scripted agent-visible replays, not recruited/timed human studies. Routine goals require **zero technical disclosure openings** and no raw-identifier or enum interpretation:

| Goal | Evidence/answer | Deliberate technical openings needed |
|---|---|---:|
| Read this conversation and tell me what happened | Maya Patel asks about her bill; Alex Morgan offers to check. Customer/agent/date/channel/Customer care/Billing and messages are ordinary evidence. | 0 |
| Check which evaluation form this policy uses and when it runs | Daily Voice Customer Service AQM; General Customer Service v17; weekly Monday 02:00 Europe/London. | 0 |
| Find a review that is ready, inspect evidence and continue | Ready to review → Start review → Open conversation evidence → Back to human review; an entered answer survives. Full focused regressions also complete reviews. | 0 |
| What was evaluated, result, form and human status | Alex Morgan voice conversation in Customer care; 80%/Pass; General Customer Service v17; Not reviewed, visible to Viewer. | 0 |
| Find exact evaluation/conversation/run/model | Evaluation provenance supplies all four and the exact form/provider/count. | 1 |
| Find exact policy/form identity | Advanced details supplies Policy ID and assigned references. | 1 |

No wrong turns were required in final scripted routine paths. Baseline leakage was recorded, rather than inventing a timed first-user wrong-turn count. All four main sizes (1440×900, 1920×1080, 390×844, 1440×720) and 1440 → 390 → 1440 preserve entered review state. No document-level horizontal overflow; mobile tables retain their existing contained scrolling. Advanced filters/provenance start closed; transcript messages precede technical metadata and evaluation controls.

Keyboard Tab/Enter reaches and toggles meaningful native summaries, then continues or returns from evidence without traps. Existing reviewer/Analytics/Calibration keyboard regressions check focus restoration and completion. The human review remains the focused task; IDs and model data are not re-promoted.

## Qualification, deployment and preservation

Local build and **681 deterministic tests** pass. The broad targeted run passed **121/122** browser checks; its sole failure was the pre-existing Answer Set keyboard fixture inspecting the in-memory form before asynchronous save completion. A focused wait for save completion was added to that test. The final recheck passes **13/13**, covering all nine new language/role/manual-result checks, all three Answer Set keyboard sizes and connected policy-load fail-closed behavior. Combined coverage qualifies **123 distinct browser cases** (122 broad cases plus the separate fail-closed policy case), with the race explicitly recorded rather than concealed. No automatic retries or skipped cases were counted as passes. The initial 120-case run also exposed outdated UI selectors; these were updated without altering query/API assertions. Immutable committed-source/Pages proof and read-only preservation comparison follow after publication. See the [evidence directory](v020f-evidence/).

Known legacy mobile SLA debt is untouched: the exact canonical base and current source both fail the old assertion expecting `conversation-escalated` in the former review table. Current mobile priority-card/focused-review contracts pass. Base/current logs are saved. Legacy policy-authoring tests also reproduce assumptions on the exact base: newly selected policy detail, disabled versus read-only fields, and pre-navigation Welcome/old offline copy. These are documented rather than repaired as product work; new tests exercise current saved/local and role contracts.

The unchanged 1–5 rubric is 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. Scoped agent assessments: **User-facing cleanliness 4; First-time learnability 4; Reviewer/viewer comprehension 4; Technical traceability 4**. Explicit normal/technical separation, task replays, role checks and retained exact evidence support 4. Inherited mobile navigation/table length, directory fallback boundary and scripted qualification rather than independent first-time participants prevent a 5 claim. No whole-product mean.

No PR, merge, tag, Cloud Run deployment, environment-builder-v2 change or Settings/Analytics/Overview redesign. F9 coverage and F10 calculator remain separate. Next: ChatGPT review/merge.
