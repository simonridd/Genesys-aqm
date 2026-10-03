# V0.19B authoring simplification

This is V0.19 UX hardening, based on canonical `main` commit `c48fefc7d9ce1933799bd37543823c4c2ed94424`. Dedicated branch: `codex/aqm-v019b-authoring-simplification`. It addresses the authoring cluster from whole-product review `c8f58f1930c94afba0884f675c3faeedcceb8a1c`: contradictory connected save copy, the 6,128px mobile editor, technical reusable-answer terminology, key-heavy comparisons, validator-only repair advice, and the unrelated starter question after group reuse. It does not declare V0.19 UX complete or add a roadmap feature.

## Mental model

| Definition | Ordinary heading copy | Relationship |
|---|---|---|
| Evaluation Forms | Build the complete quality evaluation: questions, scoring and pass rules. | Reuse Question Groups for related questions and Answer Sets for common answers. |
| Question Groups | Reuse a set of related questions across multiple evaluation forms. | Forms using a published version keep their own copy. |
| Answer Sets | Reuse the same choices or rating scale across multiple questions. | Published forms keep their own versioned copy. |
| Policies | Choose which conversations are evaluated and which published forms apply. | Pins remain exact published form versions. |

These are short page-heading sentences, without four explainer cards. The sidebar identifies this build as V0.19B; the five-chapter pitch is unchanged.

## Form density and empty start

A collapsed question shows its number, title, human answer format, two-line instruction preview, weight, enabled state, compact answer summary, reusable name/version and a conditional indicator. Its only direct action is Edit, or View details for read-only definitions. It renders no full answer descriptions, stable question ID, keys, external values, movement controls, provenance or ConditionBuilder controls.

Edit opens Question → Answer format → Answers / reusable Answer Set → Scoring → Applicability. Edit answers/View answers expands the option rows on demand. Advanced details and Organize question remain closed. Group settings, overall scoring, critical questions, test tools and secondary form actions use native disclosures. Desktop retains the existing compact two-column field layout. Published questions expand as readable information, without disabled editing controls. Lifecycle and role explanations remain distinct.

New form drafts have General and **zero questions**. The empty state offers Add question and Add reusable group. Inserting the published three-question Resolution & Next Steps group produces exactly three questions, copied provenance, working dirty state and a successful explicit save. No existing form is migrated or automatically cleaned up.

Measured at 390×844 using the same authenticated AUTHOR fixture on both builds:

| State | Canonical before | V0.19B after | Reduction |
|---|---:|---:|---:|
| One question, collapsed, whole page | 4,265px | 2,663px | 37.6% |
| Question editor open; answer rows disclosed on demand, whole page | 6,002px | 3,590px | 40.2% |
| Collapsed question card | 499.19px | 127.78px | 74.4% |

The earlier review measured 6,128px on its expanded fixture. Our own canonical baseline is 6,002px; the reduction uses our matched fixture, not the earlier number. The expanded answer rows still require natural vertical scrolling on mobile. They are reachable, with Label → Description → Credit → ordering/removal → Advanced details and no clipped controls. [Before/after measurements](v019b-evidence/mobile-after.json), [expanded measurements](v019b-evidence/mobile-expanded-after.json), [before](v019b-evidence/form-expanded-before-390.png), [after](v019b-evidence/form-expanded-after-full-390.png).

**Existing API boundary:** a zero-question draft may exist in the editor, but the current API applies production-readiness validation to every form save and rejects saving it while empty. We retain that backend behavior. Add questions directly or by group reuse before saving. Publication, production evaluation and form testing still require readiness; nothing injects a placeholder to satisfy validation. Allowing incomplete drafts to be persisted would require a separately approved backend tranche. No backend/schema change was made here.

## Answer Set UX

Normal creation has Name, Description, Answer format (Multiple choice / Ordered scale) and options. Libraries/pickers/details use the same human names; the table has Name, Answer format, Version, Status, Answers, Used by forms and Last modified. Family/base-type language is removed. Format-lock copy says “Answer format cannot change after the first version is saved.”

Option editing emphasizes Label, Description and percentage Credit. Stored credit remains 0–1; blank Multiple choice credit remains Not scored. Reordering preserves complete option objects. New options get an unused `option_N` key once; label editing never regenerates existing keys.

Save as Answer Set creates a draft reusable copy with Name/Description and a human, read-only answer format. The dialog explains that this question keeps its current answers until explicitly attaching the new set. Confirmation instructs the author to publish from Answer Sets before reuse.

Attached questions say “Using Resolution clarity v1” and explain that the question keeps its own published answers. Option/type protections are retained. Detach and customize keeps the answers, removes the reusable link and states that future versions will no longer be offered automatically. No confirmation is added to this reversible action.

## Human version comparison and repair

The comparison aligns CURRENT and NEW label/credit pairs, marks ADDED, REMOVED, RENAMED, CREDIT CHANGED, DESCRIPTION CHANGED and ORDER CHANGED, shows old/new positions, and lists the resulting order in labels. Stable keys and external mapping changes are available only in Advanced details. Nothing changes before “Update this question to v2”.

`authoringPresentation.ts` computes typed changes and blocking dependencies from question/group semantics. It uses stable keys internally and returns source question title, dependent title/kind, affected answer label and a human reason. Disabled dependent questions are included. It also explains credit conditions when all choice answers become unscored. It does not regex-parse validator exceptions.

The blocked fixture removes Partly clear. The preview names both Escalation required and Follow-up questions and says to change or remove those conditions first, then retry. Apply is disabled, the serialized form snapshot is unchanged, and no mutation request is issued by opening/canceling the preview. If production validation finds another problem, the preview gives a repair instruction and puts the authoritative diagnostics in Advanced details.

The existing `updateAnswerSet()` is invoked during preview and again at Apply; it still runs `productionReadinessErrors()` and `validateComposition()` including disabled dependent questions. Existing domain/server code is unchanged. This presentation helper adds guidance without replacing fail-closed validators.

## Advanced boundary and authority audit

| Usage | Classification / treatment |
|---|---|
| Question IDs, option keys, original group question IDs/weights, Answer Set/group identifiers | Technical metadata: closed Advanced details. |
| External/source value | Imported/external mapping: closed per-answer Advanced details, with the requested explanation. |
| `familyId`, `assetId`, `sourceAnswerSet`, `sourceAsset`, `sourceValue` in source code | Internal contract/reference use: retained; not ordinary rendered copy. |
| Browser/local copy and local starters/drafts | Genuine disconnected/reconnect boundary: page/library level only; explicit upload remains required. |
| Connected author status | Unsaved changes / Saved in AQM / failure at the enclosing definition. No question-footer persistence claim. |
| Forms library Server/Browser evaluation column names | Human labels now Evaluations / Average score; calculations are unchanged. |
| Server/development/provider detail in form-test tools | Optional testing/troubleshooting context inside Test this form; runtime behavior unchanged. |
| Import/export JSON, history, provenance and validation diagnostics | Technical/historical/troubleshooting context, intentionally retained. |

Stable question IDs are still generated by the existing mechanism; changing the title does not change them. An advanced ID edit commits on blur, avoiding remounting the text field on every keystroke. Conditions show answer labels while retaining keys. Editing a referenced advanced key does not migrate conditions: the existing save validation rejects the broken reference.

Browser tests import forms, groups and Answer Sets containing custom keys/source values, change unrelated names, save and export, and compare the option objects exactly. Other checks edit labels/credit, reorder, detach and reuse while checking key, label, description, credit, sourceValue and order. Reconnection does not upload the browser library.

## Validation and evidence

The [evidence index](v019b-evidence/README.md) records final commands, counts, screenshots and boundaries. Tests use the real frontend and local actual HTTP API backed by MemoryStore, fictional OAuth identities and throwing provider stubs. External browser DNS is blocked; only the local preview and intercepted fixture contracts are permitted. No live Genesys, paid Jev or production authoring is used for proof.

Coverage includes creation/publishing/versioning, human comparison, blocking question/group dependencies, explicit attach/detach/save-as, imported option preservation, advanced-key failure, disconnected/reconnect authority, empty-form reuse, published/role read-only views, native disclosure focus, keyboard task replay, group snapshots and version/detach, exact form pins and published immutability. Reviewer draft/evidence/queue/beforeunload/My Reviews regressions and the five-chapter showcase are included.

Visual inspection covers 1440×900, 1920×1080 and 390×844: empty form, collapsed question, expanded question, attached answers, picker, version diff, blocked update, Answer Sets library/editor, Question Groups library and a reused group. These are Chromium emulated viewports, not physical-device or screen-reader certification.

The exact two author goals were replayed from Conversations through keyboard navigation. Task one uses Forms → New form → Add question → Multiple choice → Use reusable Answer Set → Resolution clarity → Done → Save. Resolution clarity is a four-level Multiple choice definition in the canonical starter library. Task two inspects Question Groups and then creates another form and inserts its three questions. The record has 17 high-level actions plus three field edits, both tasks completed and zero scripted wrong turns. Extra Advanced navigation checks keyboard access; it is not required for ordinary authoring.

**Blind-test limitation:** this is an implementing-agent scripted replay, not a fresh independent blind tester. Real hesitation, unprompted page selection and concept confusion are unmeasured. No independent learnability result is claimed. The next ChatGPT review should repeat these goals without route instructions. [Task record](v019b-evidence/author-task-replay.json).

Intermediate logs retain fixture mistakes (a rename identical to the existing label and a wrong portable schema) and changed-contract expectations (hidden disclosures versus previously always-visible controls). Those failures are not product fixes or independent validation totals; final runs are reported separately.

## Score recheck

Same anchors as the whole-product review: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. These are implementing-agent judgments, not recruited user research.

| Category | Before | V0.19B authoring scope | Basis / remaining limitation |
|---|---:|---:|---|
| Authoring usability | 2 | 4 | Human formats, focused editing, empty start, explicit reuse/update, repair names; empty drafts still cannot be saved through the API. |
| First-time learnability | 3 | 4 provisional | Distinct heading purposes and task completion; fresh blind discovery still needs independent review. |
| User-facing cleanliness | 2 | 4 | Ordinary authoring hides identifiers and uses consistent terminology; unrelated analytics/settings architecture copy is unchanged. |
| Responsive/mobile quality | 2 | 4 | Matched editor reductions above 35%, reachable vertical fields and readable two-column diff; long deliberate answer editing still scrolls. |

Whole-product cleanliness and responsive quality remain **3/5**, below 4, because Analytics architecture/IDs and mobile tabs remain outside this tranche. This is not a whole-product 4/5 claim.

| Answer Set dimension | Before | After | Reason |
|---|---:|---:|---|
| Concept clarity | 3 | 4 | Reusable choices/rating scale named directly. |
| Discoverability | 3 | 4 provisional | Explicit in-question reuse action; blind result outstanding. |
| Creation UX | 3 | 4 | Name/description/human format and percent credit, no keys needed. |
| Reuse UX | 4 | 4 | Named versions, own answers explained, safe detach. |
| Versioning UX | 3 | 4 | Aligned labels/credit/order and explicit update. |
| Safety/error clarity | 2 | 4 | Named removed answer/dependent questions and groups, repair action, preserved validators. |
| Forms integration | 3 | 4 | Compact cards, focused controls, coherent save authority. |
| Groups integration | 3 | 4 | Shared editor, source copies protected. |
| Mobile | 2 | 4 | No clipped fields; readable diff; reduced ordinary form height. |
| Terminology cleanliness | 2 | 4 | Human formats, closed keys/mappings/provenance, no family/base-type flow. |

Before Answer Set mean: 2.8/5. Authoring-scoped after mean: 4.0/5, with provisional discoverability/learnability awaiting independent review. No dimension is scored 5.

## Deployment and preservation

Deployment records will be added after committing and publishing the exact tested frontend. Cloud Run must remain `aqm-api-v019-e92f2d6`. The archive rebuild verifies frontend inputs and all built bytes against the tested build; Pages verification compares the Git tree and every public asset byte. Production preservation compares count/hash-only snapshots across 25 collections, runtime configuration, image/revision, IAM, secrets and Scheduler configuration. Naturally occurring Scheduler runtime timestamps are reported separately.

No PR, merge or release tag. No production forms, groups, Answer Sets, policies, evaluations or reviews are changed for proof. No provider or notification calls are made by this task. No environment-builder-v2 files are changed.

## Deferred and next

Analytics architecture/IDs, role-focused navigation, coverage terminology, Overview ordering, mobile Analytics tabs and primary-nav aria-current remain deferred. Policies receive only contextual heading copy. No evaluation runtime, providers, coverage calculations, storage schema, Firestore collections or published snapshot semantics change.

Next: independent ChatGPT review of the branch, including blind author goals and the documented empty-draft persistence restriction, followed by the user's merge decision. V0.19's remaining whole-product tranches and review are still outstanding.
