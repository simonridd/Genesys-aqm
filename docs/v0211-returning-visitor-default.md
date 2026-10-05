# V0.21.1 — Returning visitor default

Welcome writes the browser-local preference `genesys-aqm-welcome-seen-v1=1` in a post-render effect. A clean disconnected bare visit shows Welcome; later bare visits enter the ordinary synthetic Conversations library without `entry=showcase`. A currently connected session enters Overview (`automation`). No last-page, identity, timestamp, account or server preference is stored.

The preference is read before choosing the initial surface. Read failure means unseen; write failure is harmless and may present Welcome next visit. Explicit `?page=welcome`, the Welcome/home link and keyboard-accessible **About / product tour** still show the complete product introduction, guided-demo entry and calculator without clearing the preference. Explicit Demo, workspace pages, settings, evaluation/policy/run deep links and OAuth callback precedence are unchanged. Welcome/Demo Explore retains the V0.21A `entry=showcase` continuation.

Showcase isolation now permits exactly one preference key/value in localStorage: `genesys-aqm-welcome-seen-v1=1`. Every other product storage write remains forbidden before handoff; sessionStorage and IndexedDB product state remain empty. No AQM API, Genesys, Jev or notification request occurs during the isolated introduction.

## Local qualification

- **723/723 deterministic tests**; frontend build/typecheck and server typecheck pass.
- **35/35 browser tests** cover first/returning entry at 1440×900, 390×844, 1920×1080 and 1440×720; explicit Welcome/home, About by keyboard, no initial Welcome flash, history without extra entries/loops, clearing/failed storage, fictional connected bare SPA entry and authoritative OAuth return destination.
- Existing V0.21A handoff, recommended Incomplete resolution, direct library, human-first table/cards, all five showcase chapters, calculator, Plan a pilot, explicit Welcome, authenticated Open AQM and failed lazy Demo pass.
- **4/4 V0.21B compact smoke tests** cover Analytics/Calibration result focus, Tab/Enter jump without added requests, scope/record order and Back/Forward at 1440×900 and 390×844.
- No overflow at tested sizes. Authentication and APIs are fictional browser fixtures; no live provider traffic.

An inherited cache test crossed its seven-day cutoff on October 5 because it used a September 28 query with the wall clock. Only that test's clock is fixed to September 30; cache/auth/backend behavior is unchanged. Initial sandbox server-listener failures and the compact Analytics harness's missing September cohort were resolved before final qualification. Initial diagnostics are retained as such.

Evidence: [deterministic](v0211-evidence/deterministic-green.txt), [build](v0211-evidence/build.txt), [server typecheck](v0211-evidence/server-typecheck.txt), [browser](v0211-evidence/local-browser.txt), [focused](v0211-evidence/local-focused.txt), [screenshots/ARIA/URL/storage](v0211-evidence/local/).

## Publication and release

Exact source/archive, Pages byte equality, actual public browser proof, final production preservation and release refs are recorded in `v0211-evidence/` after qualification. The authorized release uses a normal main fast-forward and annotated v0.21.1 tag; no PR, merge commit, force push or GitHub Release page.

## Exact committed publication and actual public proof

`TESTED_SOURCE_SHA`: **43bc67f459508f8b319b093774bdd816ab6592a2**. The immutable Git archive rebuild verifies **210/210 tracked build inputs**, including the lockfile and public production environment, and **12/12 output files** equal the locally qualified build. Pages HEAD: **c97950c335ef53dbd94faee43ad4f5a285f07743**; complete tree **701bc67612e658c96150af2b6101bfc6f816a2d5**. **12/12 actual public files** match the complete tree and tested build byte-for-byte, without extra/missing paths. Later evidence changes alter no tracked build input. [Archive proof](v0211-evidence/committed-build.json), [Pages proof](v0211-evidence/pages.json).

Actual [Pages product](https://simonridd.github.io/Genesys-aqm/) passes **39/39 browser checks**, zero failures/retries/skips: clean bare root → Welcome with exactly `genesys-aqm-welcome-seen-v1=1`; the same browser's next bare visit → ordinary synthetic Conversations without showcase handoff; explicit Welcome/home and keyboard About → complete Welcome; Welcome/Demo Explore → V0.21A continuation; fictional connected Open AQM and no-page SPA entry → Overview; Analytics/Calibration compact focus smoke. All five chapters, calculator, Plan a pilot, lazy-load failure, human-first library/cards and mobile behavior remain covered. [Public log](v0211-evidence/public-browser.txt), [report](v0211-evidence/public-browser.json), [first mobile proof](v0211-evidence/public/first-390x844.json), [returning mobile proof](v0211-evidence/public/returning-390x844.json).

Public clean Welcome storage is exactly one local preference key; sessionStorage keys and IndexedDB databases are empty. Isolated introduction tests retain existing fictional sentinel state and permit only the new preference key/value, forbidding all other storage access/writes. AQM API, real Genesys, Jev and notification calls before handoff are **0**. Connected tests intercept OAuth/API traffic with fictional fixtures and only read AQM fixture routes.

## Final production preservation

**25/25 counts and 25/25 raw hashes match** the pre-task snapshot; the actual **10-collection inventory** is identical. Cloud Run revision/image/configuration/100% traffic remain **aqm-api-v019-e92f2d6**. Service IAM, all three secret metadata/version/IAM digests and Scheduler configuration match. Health and Scheduler timestamps did not move during this measurement: health successful tick **2026-10-05 07:00:08.836 UTC**, Scheduler last attempt **07:00:04.837411 UTC**, next schedule **08:00:04.028877 UTC**. [Preservation](v0211-evidence/preservation.json), [readable proof](v0211-evidence/preservation.txt).

The pre-task snapshot already differed from the previous release's historical evidence in schedule/run/claim/health state (including one additional policy run and execution claim); none changed during this task. Saved evidence contains only counts/digests and operational timestamps, never production documents, secret payloads, credentials or IAM principals. Work-caused **production mutations 0; live Genesys 0; Jev 0; notifications 0**. No backend deployment, API changes or environment-builder-v2 changes.

## Authorized one-handoff patch release

Implementation branch: `codex/aqm-v0211-returning-visitor-default`. Release targets its final qualification evidence commit, which preserves all tested build inputs. The fresh gate requires unchanged main **bb3f0830a521dbc97ce57bd94d55c87873228fc1**, ahead > 0/behind 0, absent v0.21.1 and unchanged annotated v0.21.0 object **b12fd5f7fec100b5a834aed760743a2935f12b31** peeling to that base. Normal non-force main fast-forward; no PR, merge commit or GitHub Release page.

Annotated patch title: **Genesys AQM V0.21.1 — Returning visitor default**.

Annotation body: Genesys AQM V0.21.1 remembers when the browser has already seen the product welcome experience. First-time visitors still receive the guided introduction; returning connected users enter Overview and returning disconnected users enter the fictional Conversations workspace, while Welcome and the product tour remain explicitly available at any time. Existing deep links, showcase handoff, investigation focus and provider boundaries are unchanged.

The final handoff records exact final main/branch and annotated tag object/peeled SHAs after the remote release transaction.
