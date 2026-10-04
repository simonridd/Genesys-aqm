# V0.19D — Role-focused navigation, mobile views and accessibility

Canonical base: `64ee31fe68ea8a7609fbaf556a1e91019c9d3758` (`origin/main`, fetched and verified). Review reference: `c8f58f1930c94afba0884f675c3faeedcceb8a1c`. Dedicated branch: `codex/aqm-v019d-role-navigation-accessibility`. Frontend presentation changes only; no server, domain, provider, dependency, API or schema changes. No PR, merge or release tag.

## Role navigation matrix

All roles share the same pages and URLs. Each focused group opens by default; secondary groups start closed. The active page always reveals its group, including deep links, internal actions and history. An author entering the unchanged Overview landing sees Configuration plus the active Monitor / Quality group; no role landing redirect was added.

| Role | Primary, in display order | Secondary quality/configuration | Secondary interactions | Utility | Contextual only |
|---|---|---|---|---|---|
| ADMIN | Overview, Evaluations, Analytics, Calibration — Monitor / Quality | Policies, Evaluation Forms, Question Groups, Answer Sets — Configuration | Conversations — Interactions | Settings; About / product tour | Conversation review; Browser history |
| AUTHOR | Evaluation Forms, Question Groups, Answer Sets, Policies — Configuration | Overview, Evaluations, Analytics, Calibration — Monitor / Quality | Conversations — Interactions | Settings; About / product tour | Conversation review; Browser history |
| REVIEWER | Evaluations, Calibration, Analytics, Overview — Quality / Review | Evaluation Forms, Question Groups, Answer Sets, Policies — Reference configuration | Conversations — Interactions | Settings; About / product tour | Conversation review; Browser history |
| VIEWER | Overview, Analytics, Evaluations, Calibration — Monitor / Quality | Evaluation Forms, Question Groups, Answer Sets, Policies — Reference configuration | Conversations — Interactions | Settings; About / product tour | Conversation review; Browser history |

Reviewer/Viewers retain configuration reads and existing page-level read-only explanations. Forms/Groups permissions continue to govern Answer Sets; navigation adds no permission authority. Browser history was already contextual to browser Evaluations, rather than a permanent sidebar peer; it is included here so every `Page` destination is accounted for.

Unresolved/disconnected access uses a neutral structure: Interactions opens first with Conversations; Monitor / Quality puts browser Analytics first, with Overview, Evaluations and Calibration also discoverable; Configuration is secondary. Settings and About remain visible. No role is inferred from permissions. Sample exploration and connection remain optional existing paths.

## Presentation, disclosure and current-page semantics

`navigationPresentation.ts` defines role prominence, the exhaustive shared human page-label map and group lookup. `WorkspaceNavigation.tsx` renders native `<details>/<summary>` groups. Its small toggle handler remembers preferences in memory for the SPA lifetime, including an About/product-tour detour. There is no browser persistence or custom accordion keyboard implementation. Preferences are scoped by resolved role/neutral access. Automatic revelation of the active destination takes precedence over a closed preference. An automatically revealed section stays open in session memory; once its page is no longer active, the user can collapse it normally.

Settings and About are separated from task groups by a utility divider. The visible role pill is preserved. Navigation remains named **Primary navigation**. Exactly one sidebar item exposes `aria-current="page"` for a sidebar destination, and the visual `.active` treatment remains. Conversation review and Browser history have no permanent sidebar item, so those contextual pages intentionally have zero sidebar current items.

The breadcrumb is `<nav aria-label="Breadcrumb">` containing Workspace, an aria-hidden separator, and the shared human current-page label with `aria-current="page"`. It creates no fake links. Proof covers Overview, Answer Sets, Question Groups, Conversation review, Analytics and Settings; capitalization of route identifiers is removed.

Role resolution preserves the route and active section; a held session response proves that unresolved author access stays read-only before the AUTHOR result arrives. Shared-route proof deep-links all 12 `Page` values for each of the four roles (48 cases), with actual fictional API permission replies equal to the existing role contracts.

## Responsive Analytics and Calibration views

The existing mobile breakpoint is **650px**, not an invented 600px breakpoint. `ResponsiveViewSwitcher` renders a desktop button group (`role="group"`, exactly one `aria-pressed="true"`) and a labelled native mobile View select. CSS `display:none` removes the inactive alternative from rendering, keyboard navigation and the accessibility tree. The two presentations use the same existing state/setter. No tablist semantics, viewport polling or custom select keyboard behavior is introduced.

Saved Analytics has Overview, Agents, Queues, Forms, Groups, Questions and Coverage. `analyticsTab` continues to identify the selected view. Coverage deep links select Coverage on both presentations; the Questions investigation returns to Questions with its exact question/form/version/cohort. Sample/browser Analytics uses the same view presentation and selected-view URL while preserving its separate dataset and filters. Its existing internal `quality` value is presented as Overview.

Calibration offers Form / version, Groups, Questions, Question types and Confidence vs disagreement through the same responsive presentation. Its existing filters, selected breakdown, drill and data behavior remain. ReviewPanel's All/Agreements/Disagreements controls are untouched.

App listens for workspace `popstate` to synchronize its page, Settings section, policy/run selector and Analytics instance with the URL. History uses the same dirty-leave guard; cancellation restores the prior workspace URL. Existing navigation replacement semantics and query names are preserved; no role-state query parameter is added. Back/Forward proof restores a reference page and Coverage selection.

## Conversation review, focus and dirty work

Conversation review is removed from the permanent sidebar and retained at `?page=evaluate`. Conversations → select sample → review → Back to conversations remains available, as does Evaluations → Open conversation → Back to review. The breadcrumb and H1 identify the contextual destination. V0.19A draft ownership, exact return URL, selected evaluation, completion reconciliation and evidence-return focus are unchanged.

No universal H1 focus manager is added: existing detail, evidence-return and Settings focus behavior already serves these workflows, and a new universal manager could override it. Keyboard proof verifies that a sidebar action leaves a meaningful control/heading focused rather than body. The navigation controls remain mounted across ordinary page changes, and destination headings are reachable. Existing evidence and detail restoration tests are rerun.

Forms, Question Groups, Answer Sets, Policies and Settings still call App's existing dirty navigation checks for primary destinations, secondary destinations, Settings and About. Five explicit guard tests attempt four sidebar/utility navigation paths plus history each, dismiss all confirmations, retain the URL/edits, verify beforeunload and make zero fictional writes. Human review drafts retain their separate V0.19A in-memory lifecycle and beforeunload protection through navigation and About; they do not acquire an extra destructive-leave flow.

## Mobile before/after and viewport inspection

Canonical before captures use the existing canonical build and fictional authenticated sessions. No live service is contacted for browser proof.

| 390×844 initial focus | Offered sidebar task destinations | Visible utilities | Navigation height | Sidebar height | Collapsed secondary groups |
|---|---:|---:|---:|---:|---:|
| Before, all roles | 11 in a horizontal strip | About separately (Settings inside the eleven) | 35px | 144.52px | 0 |
| ADMIN | 4 | 2 | 260px | 340.52px | 2 |
| AUTHOR, on Forms | 4 | 2 | 261px | 341.52px | 2 |
| REVIEWER | 4 | 2 | 260px | 340.52px | 2 |
| VIEWER | 4 | 2 | 260px | 340.52px | 2 |

Before, eleven destinations were rendered/offered equally, but only Overview, Evaluations and Analytics were fully inside the 360px strip: its scroll width was **1220px**. This distinction matters: the old visible-destination count of eleven in the raw baseline is the rendered count, not eleven simultaneously readable labels. After, all four role tasks plus Settings/About are directly visible in two-column rows. The shell is taller because it exposes labelled discovery instead of concealing destinations horizontally. No mandatory pixel target is asserted.

The old saved Analytics strip measured **824px** scroll width inside a 360px control region; Questions started at x=583.58 and Coverage at x=718.03. Calibration measured **858px**, with Confidence vs disagreement starting at x=600.86. After, the mobile control is 360px wide with scroll width 360px; its desktop alternative has display:none and width/scroll width zero. Document width remains **390px**. Changing views needs no horizontal scroll; wide data tables retain their existing internal scrolling.

Inspection covers 1440×900, 1920×1080, 390×844 and 1440×720. Brand, active destination, Settings, About, disclosure summaries and control bounds are checked. Desktop sidebar vertical scrolling is preserved. Mobile Calibration evidence scrolls to the selected control so its selector is actually visible in the capture.

## Keyboard, accessibility and regression proof

Native summary Enter/Space opens/closes secondary navigation; current reference items are visible and marked. Summary and sidebar-button focus retain the existing light-on-dark focus token, verified through computed outline colour after keyboard traversal. Desktop view buttons are reached with Tab and activated with Enter. At mobile, Tab reaches the labelled select; native type-ahead and Enter choose Questions and Confidence. On this macOS headless Chromium runner, arrow-key events did not change native select values, while type-ahead generated native input/change events; the diagnostic event trace is retained. Product controls use ordinary browser behavior and no custom keyboard handlers.

DOM/accessibility snapshots pragmatically inspect the primary navigation name, group summaries/expanded state, current sidebar item, breadcrumb, role indicator, selected view and Settings current section. Hidden desktop/mobile alternatives do not appear in role queries or keyboard traversal. OperationalTable's real button identities, nested actions, sorting and detail focus remain covered. This is pragmatic browser/semantics proof rather than formal screen-reader/WCAG certification.

Deliberate test-contract updates:

- Sidebar test helpers discover and activate a closed section's real summary before selecting its item; keyboard helpers do this through Tab and Enter.
- Mobile view tests select the visible native control and assert its checked option; desktop tests retain pressed-state assertions. Helpers wait for data/control availability through filter reloads.
- First-use Conversation review is opened by selecting a synthetic conversation, then choosing Genesys Cloud to exercise the existing connect prompt. The V0.19B Test this form disclosure is explicitly opened.
- The unchanged V0.19B 65% authoring-density threshold compares authoring content after subtracting measured workspace chrome from before/after. The raw overall page heights remain recorded. This separates the intentionally larger V0.19D navigation from the unchanged editor; the threshold itself is not relaxed.
- Overview AUTHOR returns expand its secondary Monitor / Quality section when needed. Its data, role, attention and drill assertions stay unchanged.

The deployed regression run reproduces two known legacy Overview failures: the connected-session test injects a development `/src/main.tsx` script into a hashed preview build, and the bare-root test expects Conversation review where the public contract renders Welcome. Neither is rewritten or skipped to manufacture a green result. The focused suite separately proves authenticated/default intent and contextual review behavior.

Validation: **621/621 deterministic tests passed**; build/typecheck passed. **30/30 focused navigation/task/keyboard checks**, **5/5 dirty-navigation checks**, and the existing **1/1 OperationalTable check** passed. The 171-case existing matrix resolves to **169 passed / 2 retained legacy Overview failures**, zero skipped or flaky. Twelve affected scenarios passed corrected reruns; the initial failures and superseding reports remain auditable in [validation-summary.json](v019d-evidence/validation-summary.json). The two unresolved baseline tests are precisely named there. On deployed Pages, the full 206-case matrix at `5a0dc0687d1b8be0725ea03bd1b54d076febd8ed` passed **204**, retaining exactly those two failures with zero skips/flakes. The final source `9f5ce133fda64d2de458002b67f9002552bbe25b` changes only one frontend CSS focus-colour token and its keyboard assertion; build/typecheck, all 621 deterministic tests, and all **35 focused checks locally and on Pages** pass again. [public-results.json](v019d-evidence/public-results.json), [final-focus-results.json](v019d-evidence/final-focus-results.json) and [final-public-results.json](v019d-evidence/final-public-results.json) record these distinct runs.

V0.19A proof re-runs unfinished drafts, evidence detours/Back to review, completion/removal from My Reviews, reconciliation and beforeunload. V0.19B proof re-runs empty forms, group reuse, Answer Set picker, diffs/blocked updates, advanced disclosures, connected/disconnected save authority. V0.19C proof re-runs quality attention/What stands out, exact question and queue cohorts, Coverage funnel, quality-leader task and Back to Analytics. Settings permissions/sections, local detail focus, 48 role-route cases and unchanged showcase chapters/handoff/About return are included. See the original and corrected regression reports, focused reports and representative captures in [v019d-evidence](v019d-evidence/). [evidence-index.json](v019d-evidence/evidence-index.json) lists retained representative screenshots; redundant state/viewport captures are omitted while full reports, task traces and geometry remain.

A pre-existing broad run-detail H3 focus selector also needed to name the actual Run detail heading: V0.19C added a second “Where coverage was lost” H3. The focused heading assertion is retained, along with opener restoration. This changes neither production focus behavior nor the expected focus target.

## Goal-only fictional tasks

The same stated goals are replayed at 1440 and 390. These are scripted agent replays, not independent human research. No group is prescribed in the goal. Action traces include the actual UI steps; zero wrong turns means no observed detour in those scripts, not a prediction about new users.

| Role | Goal/result | Actions | Group expansions | Wrong turns |
|---|---|---:|---|---:|
| REVIEWER | Complete attention review; start, answer, inspect evidence, return, answer remainder, complete; draft/selection retained | 7 | 0 | 0 |
| AUTHOR | Edit form question, reuse Resolution clarity v1, save exact answer snapshot | 6 | 0 | 0 |
| VIEWER | Identify Clear next step, Customer Service v17, 33.3% average / 8 applicable answers; inspect exact evaluations and return to Questions | 3 | 0 | 0 |
| ADMIN | Inspect 30-day attention: two critical failure occurrences; open Policies | 3 | Configuration once | 0 |

Replay routes: REVIEWER `evaluations → evaluate → evaluations`; AUTHOR `forms` with editor/picker/save; VIEWER `analytics → evaluations → analytics` returning to Questions; ADMIN `automation → policies`. See the per-role/viewport `task-*.json` records for final action lists and URLs. Reviewer default My Reviews remains; explicit Analytics investigations continue to take precedence over that default.

## Scoped scores on the unchanged whole-product rubric

Scale retained: 1 seriously ineffective; 2 major friction; 3 acceptable prototype; 4 strong internal product; 5 unusually polished/intuitive. These scores apply to this tranche's observed navigation/view-switching scope; no combined whole-product verdict is written.

| Scope | /5 | Evidence and strength | Prevents 5 |
|---|---:|---|---|
| Navigation / IA | 4 | Four focused tasks, discoverable references, contextual review, utilities and current group revelation | Users still learn the group model; no human role-preference research |
| Role focus | 4 | Distinct role order/emphasis; Reviewer/Viewer reference reads preserved; safe asynchronous resolution | Unchanged Overview landing can open a second group for authors; intentionally no personalized landing |
| Mobile view discoverability | 4 | All seven Analytics and five Calibration views offered in native selects; zero control overflow | Calibration control follows its existing long filter area |
| Responsive/mobile quality | 4 | Two-column role tasks, reachable utilities, unchanged 390px document width, short-desktop scrolling | Taller mobile workspace shell and existing wide tables/long content |
| Accessibility pragmatics | 4 | Native disclosures/select, current page, breadcrumb, selected state, tested keyboard and preserved focus | No formal screen-reader certification; native behavior differs across platforms |
| Workflow coherence | 4 | Exact question return, role references and evidence continuity pass scoped proof | Broader workflow verdict remains for the later independent review |
| Ease of use | 4 | Eight completed role/mobile scripts with visible discovery and no recorded wrong turns | Scripted agents do not establish human learnability |

## Deployment and preservation

Published [GitHub Pages](https://simonridd.github.io/Genesys-aqm/) from tested committed source **`9f5ce133fda64d2de458002b67f9002552bbe25b`**. A fresh immutable Git archive build matched the tested local build byte-for-byte. Pages HEAD is **`0615b57ed4fb3acfa3fce57807dc7b6f0195993e`**; all **12 public files** and the complete gh-pages Git tree match that committed build. See [committed-build.json](v019d-evidence/committed-build.json) and [pages.json](v019d-evidence/pages.json). The final evidence/documentation commit leaves all frontend build inputs identical to this tested source. Cloud Run remains **`aqm-api-v019-e92f2d6`**; no API deployment occurred.

Read-only snapshots store counts/hashes only for 25 production collections, including Forms, Groups, Answer Sets, Policies, Evaluations, Reviews and Schedules. Runtime proof hashes configuration, service IAM, secret metadata/versions/IAM and Scheduler configuration. No secret values or document contents are saved. Final comparison: **25/25 collection counts and hashes unchanged**, including 7 forms, 4 groups, 0 Answer Set assets/families, 7 policies, 8 evaluations, 0 reviews and 1 schedule. Runtime/image, IAM, secret metadata/versions/IAM and Scheduler configuration hashes are unchanged. No natural Scheduler runtime or operational-health timestamp movement was observed between these snapshots: lastAttemptTime remains `2026-10-03T20:00:04.938490Z`, scheduleTime remains `2026-10-03T21:00:04.028877Z`. See [preservation.json](v019d-evidence/preservation.json).

Production mutations: **0**. Provider calls: **Genesys 0; Jev 0**. Notification sends: **0**. No Cloud Run deployment, production domain, runtime configuration, IAM, secret or Scheduler mutation occurred. Browser proof uses intercepted fictional APIs and blocks external provider traffic; production proof uses read-only counts/hashes and configuration metadata. The unrelated environment-builder-v2 project is untouched.

## Verification resumed on 4 October 2026

The requested worktree/branch was already clean and pushed at `c20604c3b33b81a0038388851d07d6f500792bdb` when this verification started. A read-only GitHub check found remote `main` also at that SHA, rather than the supplied original canonical base. No merge, PR, tag or deployment was performed in this resumed run. This addendum and its evidence are the only new branch changes.

A fresh Git archive of that committed HEAD passed **621/621 deterministic tests**, build/typecheck and **35/35 focused Playwright checks**. Those checks include eight role/mobile task replays, all role-route cases, keyboard/disclosure/current-page semantics, mobile view selection and exact question return, asynchronous access resolution, history and dirty-navigation guards. Proof again covers 1440×900, 1920×1080, 390×844 and 1440×720. The initial sandbox attempts could not bind local fixture/preview servers; the successful runs used localhost access with intercepted fictional services. Existing regression results and the two explicitly documented legacy Overview failures above remain unchanged; no fresh whole-product review was run.

All frontend build inputs still match deployed tested source `9f5ce133fda64d2de458002b67f9002552bbe25b`. The fresh HEAD build matched its recorded 12-file manifest byte-for-byte, and a read-only public comparison again verified all 12 files and the Pages Git tree at `0615b57ed4fb3acfa3fce57807dc7b6f0195993e`. Republishing the identical build was unnecessary.

Fresh before/after production snapshots for this recheck matched **25/25 collections**, including schedules. Runtime, revision/image, IAM, secret metadata/versions/IAM and Scheduler configuration/runtime also matched across this recheck. Cloud Run remains `aqm-api-v019-e92f2d6`. Agent-initiated production mutations and Genesys/Jev provider calls are **0**.

The historical 3 October snapshots are distinct from this fresh comparison: since then, schedules, policyRuns, operationalHealth and scheduleExecutionClaims changed. The safe run counters show an unattended scheduled Genesys-source run at `2026-10-04T01:00:07.222Z`, completed at `01:00:07.815Z`, with zero candidates, zero requested/succeeded/failed evaluations and zero actual Jev provider requests. The daily schedule now has nextDueAt `2026-10-05T01:00:00.000Z`. Scheduler lastAttemptTime advanced from `2026-10-03T20:00:04.938490Z` to `2026-10-04T06:00:04.861275Z`; its scheduleTime advanced to `2026-10-04T07:00:04.028877Z`, and operational-health lastSuccessfulTickAt to `2026-10-04T06:00:08.269Z`. Forms, Groups, Answer Sets, Policies, Evaluations and Reviews also match the historical snapshot. These observations are consistent with existing unattended scheduling between the two dates; they are not agent-triggered proof mutations. Historical schedule document hashes differ, so this addendum does not claim that the schedule document stayed byte-identical overnight.

Fresh reports, count/hash snapshots, safe Scheduler counters and public byte verification are retained in [recheck-20261004](v019d-evidence/recheck-20261004/summary.json). The dedicated worktree is left clean after pushing this documentation/evidence update.

## Next

ChatGPT reviews/merges this branch. After that, a separate fresh thorough whole-product Playwright review should start from the new canonical main and evaluate V0.19A–D together. This tranche does not run or prewrite that review.
