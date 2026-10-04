# V0.20A — Answer Set discovery

## Release boundary and scope

V0.19.0 was created as an annotated Git tag before implementation began. Its tag object is `ae5ce19328faa69463178c0c4ed1a4262f3c29e8`, peeled commit is `1363f4eda490c0751e06c5dd0b07fe913a74cee1`, and annotation is **Genesys AQM V0.19.0 — Reusable answer sets and workflow UX**. Both remote tag references were checked with Git. Main was fetched again and still matched that commit before the dedicated `codex/aqm-v020a-answer-set-discovery` worktree/branch was created. [Release proof](v020a-evidence/v0190-release.json).

This tranche changes frontend question authoring and adds an explicit pure shared-domain operation. AnswerSetAsset remains `choice | score`; question type remains `noul | choice | score`. No schema migration, backend API change, existing-form migration, runtime lookup, or backend deployment is required. The five-chapter showcase is unchanged. No PR, merge, GitHub Release, or V0.20 tag is created.

## Original problem and picker model

The fresh whole-product review scored Answer Set discovery 3.80/5 and found: “Choosing Ordered scale hides the requested reusable Resolution clarity set.” New questions default to Yes / No. The old tools returned nothing for that type, and the picker filtered published assets by the question's current type. An author therefore needed prior knowledge that Resolution clarity was stored as Multiple choice before discovering it.

Every editable unattached question now offers **Use reusable Answer Set**, including Yes / No. **Save as Answer Set** remains available only for Multiple choice or Ordered scale; Yes / No is not an Answer Set type.

The picker searches all published assets supplied by the active authority. It matches case-insensitive trimmed text against name, description and option labels. Name relevance precedes same-format preference, then stable name/version/ID order. Empty search immediately lists published sets; existing 100-result page bounds remain. Every result shows name/version, **Multiple choice** or **Ordered scale**, answer count and visible answer labels. A failed search says **No published Answer Sets match this search.** No stored-format mismatch hides a result.

## Explicit cross-format boundary and condition safety

Same-format **Use Resolution clarity v1** continues to call the unchanged `applyAnswerSet()` directly. A mismatched result explains both formats and offers **Preview Resolution clarity v1 format change**. Opening, searching, focusing and previewing never mutate the form.

The inline preview shows current format/answers, proposed format, new answer order/descriptions/credit, and explains replacement before Apply. Only **Change to Multiple choice and use Resolution clarity v1** (or the equivalent Ordered scale action) calls `applyAnswerSetWithFormatChange()`. There is no native confirm dialog.

The new pure operation requires a DRAFT or TESTING form and an unattached question. It clones the form, changes only the target's type, and delegates published snapshot application and resulting composition validation to the ordinary helper. Identity, title, instructions, weight, enabled state, group, section, conditions and unrelated provenance are retained; only type/options/sourceAnswerSet are replaced. Copied option order, credits, sourceValue and exact family/asset/version provenance are authoritative. No Answer Set runtime lookup is introduced.

All dependent conditions, including disabled questions and groups, are validated. No answer reference is migrated or guessed. A Yes / No outcome condition blocks a format change even if a new choice key happens to be `yes`; that would reinterpret an existing semantic dependency. Invalid choice keys and unscored credit dependencies fail through the existing composition validator. Compatible credit-threshold references remain unchanged.

The preview disables Apply when blocked and names dependent questions/groups and current answer labels in **CAN’T CHANGE ANSWER FORMAT YET** guidance. It asks the author to change/remove the condition first. Raw diagnostics remain under closed Advanced details. Any rejected operation leaves the original form unchanged.

Attached-set behavior remains explicit detach/customize and newer same-family version update. Arbitrary switching requires the existing detach boundary. Detach retains the adopted type and copied answers and removes provenance. Published assets/forms and historical EvaluationRecord snapshots receive no automatic change.

## Authority

Connected authoring uses saved AQM published sets only. Browser starters are excluded from the connected picker. Disconnected/sample authoring continues to use the local library. Reconnect itself preserves local definitions byte-for-byte, makes no write requests and uploads nothing. A deliberately created new unsaved connected draft remains a local draft as in the existing product; it does not mutate the saved library.

## First-time author replay, mobile and keyboard

Exact goal: **“Create a quality form that asks whether the resolution was clear, using the reusable four-level Resolution clarity scale.”**

The scripted fictional authenticated replay starts with an empty new form and a new default Yes / No question. Actions: New form → Add question → enter wording → Use reusable Answer Set → search Resolution clarity → preview → explicitly change to Multiple choice and use Resolution clarity v1 → Save. No prior manual answer-format selection is needed. The replay records zero wrong turns. Save, full reload with fresh fictional sign-in, export and detach retain the exact snapshot.

The intentional old wrong turn starts from Ordered scale. Resolution clarity remains visible, labelled Multiple choice, with an explicit format-change action. Current answers remain unchanged until that action. Same-format attach requires no unnecessary format confirmation. Service quality explicitly adopts Ordered scale and retains all four levels, order, credit/source values and provenance.

At 1440×900, 1920×1080 and 390×844 the picker/preview shows the name, version, format, answers and primary action without horizontal clipping. The narrow layout uses prose and a vertical ordered list. Ordinary vertical scrolling remains. Keyboard replay uses Tab/Enter and typing from new form through search, preview, cancel, Apply and return. Focus moves to the picker heading, preview heading, preview opener on cancel, Answers heading on apply, then the question edit action on Done. There is no keyboard trap. Meaningful action names and visible format text convey mismatch without reliance on color.

This is automated Chromium emulation and implementing-agent inspection, not an independent blind author study, physical-device test or screen-reader certification. [Evidence index](v020a-evidence/README.md).

## Qualification and deployment

The production TypeScript/Vite build passes. **66 deterministic files / 632 tests pass**, including 11 new discovery/domain cases. **20 focused discovery browser checks pass** at all three required viewports, including keyboard-only journeys at each. **92 current V0.19A–E regression checks pass**: 24 continuity, 19 authoring, 12 quality/Analytics, 22 navigation/mobile and 15 focused reviewer checks. Total local browser qualification is 112 distinct cases; public replays are counted separately as repeats. No enormous historical browser suite was run. [Validation summary](v020a-evidence/validation-summary.json). Final committed-source/public deployment and preservation proof follows. [Diagnostic classifications](v020a-evidence/failure-classification.md) retain initial harness defects without hiding failures or weakening product contracts.


## Final public qualification and preservation

**Tested source: `1cedb8d36c678e80ad56403662c52fdd16e950df`. Pages HEAD: `95750f8c239e4d393b2191840e81079a76e881ef`.** A fresh immutable Git archive rebuilt all **12 files identically** to the locally qualified frontend. The entire gh-pages Git tree and **12/12 public files** match that build byte-for-byte. All **20 discovery cases** passed against the actual [public frontend](https://simonridd.github.io/Genesys-aqm/) using fictional authenticated APIs and intercepted providers. These repeat the local cases; they are not added to the unique total. [Archive proof](v020a-evidence/committed-build.json), [public bytes/tree](v020a-evidence/pages.json), [public browser replay](v020a-evidence/public-browser.json).

**Cloud Run remains `aqm-api-v019-e92f2d6`, with 100% traffic.** No backend deployment occurred. All production domain counts/hashes match, including forms, reusable groups, Answer Sets/families, policies, evaluations, Human Reviews and schedules. **24/25 collection hashes match**; only operationalHealth changed, alongside its ordinary hourly tick timestamps advancing from 09:00 UTC to 10:00 UTC. Scheduler last-attempt/next-run timestamps also advanced naturally. Revision/image, runtime configuration, service IAM, secret metadata/versions/IAM and Scheduler configuration hashes all match. [Preservation](v020a-evidence/preservation.json), [traffic](v020a-evidence/cloud-run-traffic.json).

Production authoring/domain mutations by this task: **0**. Live task provider calls: **Genesys 0, Jev 0, notification sends 0**. Fixtures use real local API contracts with MemoryStore, fictional sign-in/user data and provider endpoints intercepted; no production authoring mutation was required. Preservation evidence retains counts/hashes and non-secret operational metadata only.

The final evidence commit changes documentation only; all frontend build inputs remain identical to the tested/published source. The dedicated branch is pushed, with final HEAD supplied in the delivery response and its worktree clean. The release tag stays immutable. No PR, merge, GitHub Release, V0.20 tag or environment-builder-v2 change occurred. Next: ChatGPT review/merge decision.
