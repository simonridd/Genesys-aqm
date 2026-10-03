# Fictional first-time author review

This is an agent simulation, not recruited-user comprehension evidence. I used rendered DOM, accessible names, visible text and screenshots to decide the next step. I did not read product source, repository history, prior product documentation, test scenarios, or the fixture implementation. The fixture supplied the fictional AUTHOR account; provider traffic was intercepted. No live provider calls, notifications, publishing, commits or product edits were performed.

## Result

Both assigned goals completed.

1. Created and saved **First author resolution review**, a draft with one question, **Was the resolution clear?**, using **Resolution clarity v1**: Clear (1), Mostly clear (0.75), Partly clear (0.5), Unclear (0). The picker explicitly showed **v1 / 4 options** alongside **v2 / 5 options**. I chose v1 because the goal specifies four levels. The extra fifth v2 option is purposeful version evolution, not treated as a defect.
2. Created and saved **First author next steps review**, containing exactly three questions from **Resolution & Next Steps v1**: Ownership, Resolution, Clear next steps. Closed and reopened the saved form, then verified the three-question group and count.

## Route and actions

Start: `http://127.0.0.1:4174/Genesys-aqm/?page=automation`, rendered as Overview.

Goal one route: Overview → Evaluation Forms → New form → Edit starter question → Multiple choice → Use reusable answer set → Use Resolution clarity v1 → Done → Save changes.

Goal one had **11 intentional UI actions**: 5 navigation/open/close actions (Evaluation Forms, New form, Edit, open answer picker, Done), 5 configuration actions (form name, question title, instructions, type, select reusable v1), 1 save. Reading and evidence capture are excluded.

Goal two route: Question Groups → Resolution & Next Steps details → Evaluation Forms → New form → Add reusable group → Add Resolution & Next Steps → Delete General group → Delete contained questions → Save changes → Close details → reopen saved form.

Goal two had **12 intentional UI actions**: 8 navigation/open/close actions (Question Groups, open group details, Evaluation Forms, New form, open reusable-group picker, open delete confirmation, Close details, reopen saved form), 3 configuration actions (form name, add reusable group, delete starter group/questions), 1 save. Reading and evidence capture are excluded. Total: **23 UI actions**.

## Exploration time versus replay time

Exploration began when the review-only spec was created at **14:21:31 UTC** on 3 October 2026. The first saved form was confirmed in the rendered failure snapshot by approximately **14:24:31 UTC**, about **3 minutes** into exploration. The second goal completed before the final screenshot review at **14:27:44 UTC**, so goal-directed exploration and visual QA took about **6 minutes 13 seconds** in total. These wall times include tool orchestration, thinking, test edits, reruns and harness mistakes; they are not human completion times.

Final deterministic replay: goal one **1,425 ms**, both goals **2,652 ms**, measured after fixture setup and including scripted evidence captures. Playwright reported **1 passed (6.6s)** including setup/teardown. Replay speed is not a measure of discovery or comprehension.

## Observed hesitation and wrong turns

- **No Answer Sets / Question Groups navigation confusion occurred in this simulation.** The four-option scale appeared inside the question's **ANSWERS** region with a **Use reusable answer set** action. The three-question task naturally led to **Question Groups**, whose table showed question counts. This supports the task routes for this agent; it does not establish that first-time human authors distinguish the terms.
- Evaluation Forms initially expanded a pre-existing **Attached resolution form**. I read its four-level example, then chose New form to satisfy the creation goal. That visible example helped me choose Multiple choice. This is an important advantage of the fixture and limits claims about unaided type selection.
- **Four-level scale** could plausibly suggest **Ordered rubric**. The starter defaults to Yes / No, which has no reusable-answer action; the action appeared after I changed to Multiple choice. I did not try Ordered rubric and do not report it as a failed route. The type labels **Noul**, **Choice**, and **Score** added technical wording that was unnecessary for the goal.
- Opening Question Groups was a useful inspection detour: it showed three relevant questions, but there was no **Use in form** action on the published group details. I returned to Evaluation Forms because I remembered **Add reusable group**. This introduces backtracking between inspecting and using a reusable group.
- Adding a reusable group retained the new form's **Untitled question**, producing four questions. To achieve exactly three I had to remove the General starter group. The confirmation clearly offered **Keep questions in General** or **Delete contained questions**, so the consequence was understandable once discovered.
- The answer picker clearly distinguished versions using counts and option labels. After attachment, **Resolution clarity · v1 · copied snapshot**, **Options and type are read-only while attached**, and **Detach to customize** explained the disabled controls. The newer-version action did not silently change the requested scale.
- The saved group identified itself as **Reusable snapshot v1 · resolution_next_steps**. The library sentence **Forms retain independent snapshots** explains the relationship, though **snapshot**, **Detach**, **asset version**, autogenerated IDs, and scoring terminology increase reading effort for a basic author goal.
- Save status changed from **Unsaved changes** to **Saved [time]**, while the heading changed to **Saved form** and a new library row appeared. This supplied visible completion evidence. The editor also says changes save locally in the browser, so a first-time author must distinguish local draft persistence from the Save changes action.
- Full-page screenshot heights were about **4,280 px** with the answer picker and **3,795 px** for the saved three-question form at 1,280 px width. The form library, scoring settings, critical flags and sandbox controls make the simple author task span a long page. Playwright automatically scrolled to controls; this simulation does not measure a human's scrolling burden.

## Harness issues, not user wrong turns

Three exploratory test failures were caused by my automation assumptions and were corrected using rendered UI only:

1. Tried an accessible button name containing the visible decorative icon (`▤ Evaluation Forms`); actual accessible name is Evaluation Forms.
2. Expected status text **Saved to server**, copied from the initially opened fixture form; a new save actually reports **Saved [time]**. The form had saved successfully.
3. Assumed the reusable-group picker had a dialog role; it is an inline **Published reusable groups** section. The action had opened successfully.

No product defect is inferred from these failed assertions. Earlier wrong assumptions are retained here; the final check log records the successful replay.

## Evidence

Review-only script: `tests/whole-product-first-time-author.spec.ts`.

Final check log: `docs/v019-whole-product-review-evidence/first-author-checks.txt`.

Each `first-author-*` PNG has a matching rendered-text TXT. Most useful captures:

- `first-author-02-forms`: initial existing expanded form.
- `first-author-04-question-editor`: Yes / No starter editor and type options.
- `first-author-06-answer-picker`: four-option v1 versus five-option v2.
- `first-author-07-form-saved`: first goal saved.
- `first-author-09-group-details`: three-question reusable definition.
- `first-author-10-group-picker`: inline published-group picker.
- `first-author-11-group-added`: extra starter question remains after reuse.
- `first-author-12-delete-starter-confirmation`: keep/delete consequences.
- `first-author-13-second-form-saved`: reopened second form with exactly three reused questions.
