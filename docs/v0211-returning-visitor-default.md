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
