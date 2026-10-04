# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: final-whole-product-review.spec.ts >> fresh review continuity and completion 390
- Location: tests/final-whole-product-review.spec.ts:8:31

# Error details

```
Error: expect(locator).not.toContainText(expected) failed

Locator: locator('tbody')
Expected substring: not "000000000004"
Error: strict mode violation: locator('tbody') resolved to 2 elements:
    1) <tbody></tbody> aka getByLabel('Completed interactions table').locator('tbody')
    2) <tbody>…</tbody> aka getByRole('region', { name: 'My reviews table' }).locator('tbody')

Call log:
  - Expect "not toContainText" locator('tbody') with timeout 5000ms
  - waiting for locator('tbody')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - img "IPI" [ref=e6]
      - generic [ref=e7]:
        - strong [ref=e8]: IPI AQM
        - text: Automated Quality Management
    - navigation "Primary navigation" [ref=e9]:
      - group [ref=e10]:
        - generic "Quality / Review" [ref=e11] [cursor=pointer]
        - generic [ref=e12]:
          - button "Evaluations" [ref=e13] [cursor=pointer]:
            - generic [aria-hidden] [ref=e14]: ◷
          - button "Calibration" [ref=e16] [cursor=pointer]:
            - generic [aria-hidden] [ref=e17]: ◎
          - button "Analytics" [ref=e19] [cursor=pointer]:
            - generic [aria-hidden] [ref=e20]: ▥
          - button "Overview" [ref=e22] [cursor=pointer]:
            - generic [aria-hidden] [ref=e23]: ◌
      - group [ref=e25]:
        - generic "Reference configuration" [ref=e26] [cursor=pointer]
      - group [ref=e27]:
        - generic "Interactions" [ref=e28] [cursor=pointer]
      - generic [ref=e29]:
        - button "Settings" [ref=e30] [cursor=pointer]:
          - generic [aria-hidden] [ref=e31]: ⚙
        - button "About / product tour" [ref=e33] [cursor=pointer]
  - main [ref=e34]:
    - generic [ref=e35]:
      - navigation "Breadcrumb" [ref=e36]:
        - text: Workspace /
        - strong [ref=e37]: Evaluations
      - generic [ref=e38]:
        - generic "Current role" [ref=e39]: REVIEWER
        - text: Jev managed securely by automation service
    - generic [ref=e41]:
      - generic [ref=e43]:
        - generic [ref=e44]: QUALITY
        - heading "Evaluations" [level=1] [ref=e45]
        - paragraph [ref=e46]: Production results with form snapshots and provider provenance.
      - group "Evaluation mode" [ref=e47]:
        - button "My reviews" [pressed] [ref=e48] [cursor=pointer]
        - button "All evaluations" [ref=e49] [cursor=pointer]
      - region "My review summary" [ref=e50]:
        - heading "My reviews" [level=2] [ref=e51]
        - generic [ref=e52]:
          - generic [ref=e53]:
            - generic [ref=e54]: Assigned open
            - strong [ref=e55]: "4"
          - generic [ref=e56]:
            - generic [ref=e57]: Due soon
            - strong [ref=e58]: "1"
          - generic [ref=e59]:
            - generic [ref=e60]: Overdue
            - strong [ref=e61]: "1"
          - generic [ref=e62]:
            - generic [ref=e63]: Escalated
            - strong [ref=e64]: "0"
        - button "Available unassigned reviews (1) →" [ref=e65] [cursor=pointer]
      - generic [ref=e66]:
        - generic [ref=e67]:
          - text: Review status
          - combobox "Review status" [ref=e68]:
            - option "All" [selected]
            - option "NOT REVIEWED"
            - option "REVIEW REQUESTED"
            - option "IN REVIEW"
            - option "REVIEWED"
        - generic [ref=e69]:
          - text: SLA state
          - combobox "SLA state" [ref=e70]:
            - option "All states" [selected]
            - option "Due soon"
            - option "Overdue"
            - option "Escalated"
        - generic [ref=e71]:
          - text: Due
          - combobox "Due" [ref=e72]:
            - option "All" [selected]
            - option "Overdue"
            - option "Due today"
            - option "Due next 7 days"
            - option "No due date"
        - button "Refresh" [ref=e73] [cursor=pointer]
      - button "More filters" [ref=e74] [cursor=pointer]
      - paragraph [ref=e75]: My queue is prioritized across the server active review set (maximum 2,000).
      - generic [ref=e76]:
        - generic [ref=e77]:
          - generic [ref=e78]:
            - text: Search
            - textbox "Search table" [ref=e79]:
              - /placeholder: Search visible fields
          - generic [ref=e80]: 4 results on this page
        - region "My reviews table" [ref=e81]:
          - table [ref=e82]:
            - rowgroup [ref=e83]:
              - row [ref=e84]:
                - columnheader "Queue priority" [ref=e85]
                - columnheader "Conversation" [ref=e86]
                - columnheader "Agent" [ref=e87]
                - columnheader "Queue" [ref=e88]
                - columnheader "Form" [ref=e89]
                - columnheader "AI score" [ref=e90]
                - columnheader "Review" [ref=e91]
                - columnheader "Due" [ref=e92]
                - columnheader "Action" [ref=e93]
            - rowgroup [ref=e94]:
              - row [ref=e95] [cursor=pointer]:
                - cell "OVERDUE Overdue by 6 hours" [ref=e96]:
                  - generic [ref=e97]:
                    - generic [ref=e98]: OVERDUE
                    - generic [ref=e99]: Overdue by 6 hours
                - cell [ref=e100]:
                  - button "Open evaluation overdue" [ref=e101]: 22222222-2222-4222-8222-000000000005
                - cell "Alex Morgan" [ref=e102]
                - cell "Customer care" [ref=e103]
                - cell "General Customer Service v17" [ref=e104]
                - cell "78%" [ref=e105]
                - cell "REVIEW_REQUESTED" [ref=e106]
                - cell "10/2/2026, 7:00:00 AM OVERDUE Overdue by 6 hours" [ref=e107]:
                  - text: 10/2/2026, 7:00:00 AM
                  - generic [ref=e108]:
                    - generic [ref=e109]: OVERDUE
                    - generic [ref=e110]: Overdue by 6 hours
                - cell [ref=e111]:
                  - button "Start review" [ref=e112]
              - row [ref=e113] [cursor=pointer]:
                - cell "DUE SOON Due in 6 hours" [ref=e114]:
                  - generic [ref=e115]:
                    - generic [ref=e116]: DUE SOON
                    - generic [ref=e117]: Due in 6 hours
                - cell [ref=e118]:
                  - button "Open evaluation soon" [ref=e119]: 22222222-2222-4222-8222-000000000006
                - cell "Alex Morgan" [ref=e120]
                - cell "Customer care" [ref=e121]
                - cell "General Customer Service v17" [ref=e122]
                - cell "78%" [ref=e123]
                - cell "REVIEW_REQUESTED" [ref=e124]
                - cell "10/2/2026, 7:00:00 PM DUE SOON Due in 6 hours" [ref=e125]:
                  - text: 10/2/2026, 7:00:00 PM
                  - generic [ref=e126]:
                    - generic [ref=e127]: DUE SOON
                    - generic [ref=e128]: Due in 6 hours
                - cell [ref=e129]:
                  - button "Start review" [ref=e130]
              - row [ref=e131] [cursor=pointer]:
                - cell "Due in 3 days" [ref=e132]
                - cell [ref=e135]:
                  - button "Open evaluation progress" [ref=e136]: 22222222-2222-4222-8222-000000000023
                - cell "Alex Morgan" [ref=e137]
                - cell "Customer care" [ref=e138]
                - cell "General Customer Service v17" [ref=e139]
                - cell "78%" [ref=e140]
                - cell "IN_REVIEW" [ref=e141]
                - cell "10/5/2026, 1:00:00 PM Due in 3 days" [ref=e142]:
                  - text: 10/5/2026, 1:00:00 PM
                  - generic [ref=e143]: Due in 3 days
                - cell [ref=e145]:
                  - button "Continue review" [ref=e146]
              - row [ref=e147] [cursor=pointer]:
                - cell "Due in 3 days" [ref=e148]
                - cell [ref=e151]:
                  - button "Open evaluation requested_extra" [ref=e152]: 22222222-2222-4222-8222-000000000025
                - cell "Alex Morgan" [ref=e153]
                - cell "Customer care" [ref=e154]
                - cell "General Customer Service v17" [ref=e155]
                - cell "78%" [ref=e156]
                - cell "REVIEW_REQUESTED" [ref=e157]
                - cell "10/5/2026, 1:00:00 PM Due in 3 days" [ref=e158]:
                  - text: 10/5/2026, 1:00:00 PM
                  - generic [ref=e159]: Due in 3 days
                - cell [ref=e161]:
                  - button "Start review" [ref=e162]
      - generic [ref=e163]:
        - button "First page" [disabled] [ref=e164]
        - button "Next server page →" [disabled] [ref=e165]
      - generic [ref=e166]:
        - generic [ref=e167]:
          - generic [ref=e168]:
            - text: EVALUATION DETAIL
            - heading "General Customer Service v17" [level=2] [ref=e169]
          - button "Close details" [ref=e170] [cursor=pointer]
        - generic [ref=e171]:
          - generic [ref=e172]:
            - generic [ref=e173]: Score
            - strong [ref=e174]: 78%
          - generic [ref=e175]:
            - generic [ref=e176]: Result
            - strong [ref=e177]: Pass
          - generic [ref=e178]:
            - generic [ref=e179]: Critical failures
            - strong [ref=e180]: "0"
          - generic [ref=e181]:
            - generic [ref=e182]: Review
            - strong [ref=e183]: REVIEWED
        - heading "Context" [level=3] [ref=e184]
        - paragraph [ref=e185]: Conversation 22222222-2222-4222-8222-000000000004 · Alex Morgan · Customer care · voice · Unspecified
        - paragraph [ref=e186]: Policy Manual · Run — · genesys-cloud
        - button "Open conversation" [ref=e187] [cursor=pointer]
        - region "Group results" [ref=e188]:
          - heading "Groups · Question weighted" [level=3] [ref=e189]
          - article [ref=e190]:
            - heading "Customer care · 78%" [level=3] [ref=e191]
            - paragraph [ref=e192]: No group threshold
            - paragraph [ref=e193]:
              - strong [ref=e194]: Warm opening
              - text: · Yes · 100%
            - paragraph [ref=e195]:
              - strong [ref=e196]: Understanding the issue
              - text: · 1.00 / 3 · 33%
            - paragraph [ref=e197]:
              - strong [ref=e198]: Resolution
              - text: · Fully resolved · 100%
        - region "Human review" [ref=e199]:
          - generic [ref=e200]:
            - generic [ref=e201]:
              - text: HUMAN REVIEW
              - heading "Completed calibration" [level=2] [ref=e202]
              - paragraph [ref=e203]: General Customer Service v17 · REVIEWED
            - generic [ref=e204]: REAL GENESYS DATA
          - paragraph [ref=e205]: "Assigned to: Alex Reviewer"
          - paragraph [ref=e206]:
            - text: "Due: 9/28/2026, 1:00:00 PM"
            - generic [ref=e207]: Completed
          - generic [ref=e209]:
            - generic [ref=e210]:
              - generic [ref=e211]: AI SCORE
              - strong [ref=e212]: 78%
            - generic [ref=e213]:
              - generic [ref=e214]: HUMAN SCORE
              - strong [ref=e215]: 69%
            - generic [ref=e216]:
              - generic [ref=e217]: EXACT AGREEMENT
              - strong [ref=e218]: 1 / 3
            - generic [ref=e219]:
              - generic [ref=e220]: ABSOLUTE SCORE GAP
              - strong [ref=e221]: 9.3 pp
          - region "Group comparison" [ref=e222]:
            - heading "Group comparison" [level=3] [ref=e223]
            - generic [ref=e225]:
              - strong [ref=e226]: Customer care
              - paragraph [ref=e227]: "AI group score: 78%"
              - paragraph [ref=e228]: "Human group score: 69%"
              - paragraph [ref=e229]: "Difference: -9.3 pp"
          - paragraph [ref=e230]: Use the evaluated form snapshot. Partial scores are previews; completed reviews contribute to Calibration. AI scores stay in Quality.
          - paragraph [ref=e231]: "Reviewer: Alex Reviewer · 10/2/2026, 1:00:00 PM · revision 4"
          - status [active] [ref=e232]: Review completed. It has been removed from My Reviews. The original AI result is preserved.
          - button "Close and continue My Reviews" [ref=e233] [cursor=pointer]
          - group "Comparison filter" [ref=e234]:
            - button "All" [ref=e235] [cursor=pointer]
            - button "Agreements" [ref=e236] [cursor=pointer]
            - button "Disagreements" [ref=e237] [cursor=pointer]
          - article [ref=e238]:
            - generic [ref=e239]:
              - generic [ref=e240]:
                - generic [ref=e241]: Customer care · YES / NO
                - heading "Warm opening" [level=3] [ref=e242]
              - generic [ref=e243]: Agreement
            - paragraph [ref=e244]: Did the agent greet the customer and offer help at the start of the conversation?
            - generic [ref=e245]:
              - generic [ref=e246]:
                - text: AI RESULT
                - strong [ref=e247]: "Yes"
                - paragraph [ref=e248]: Credit 100% · Yes probability 95%
                - generic [ref=e249]: Selected-answer confidence 95%
              - generic [ref=e250]:
                - generic [ref=e251]:
                  - text: HUMAN REVIEW
                  - strong [ref=e252]: "Yes"
                - paragraph [ref=e253]: Human credit 100%
                - paragraph [ref=e254]: Fresh question note
          - article [ref=e255]:
            - generic [ref=e256]:
              - generic [ref=e257]:
                - generic [ref=e258]: Customer care · SCORE
                - heading "Understanding the issue" [level=3] [ref=e259]
              - generic [ref=e260]: One-band difference
            - paragraph [ref=e261]: How effectively did the agent establish and acknowledge the customer’s actual issue?
            - generic [ref=e262]:
              - generic [ref=e263]:
                - text: AI RESULT
                - strong [ref=e264]: 1.00 / 3
                - paragraph [ref=e265]: Credit 33% · Confidence 75%
                - generic [ref=e266]: "Exact value distance: 1.00 bands"
              - generic [ref=e267]:
                - generic [ref=e268]:
                  - text: HUMAN REVIEW
                  - strong [ref=e269]: Good
                - paragraph [ref=e270]: Human credit 67%
          - article [ref=e271]:
            - generic [ref=e272]:
              - generic [ref=e273]:
                - generic [ref=e274]: Customer care · CHOICE
                - heading "Resolution" [level=3] [ref=e275]
              - generic [ref=e276]: Disagreement
            - paragraph [ref=e277]: What is the best description of the issue outcome by the end of the conversation?
            - generic [ref=e278]:
              - generic [ref=e279]:
                - text: AI RESULT
                - strong [ref=e280]: Fully resolved
                - paragraph [ref=e281]: Credit 100% · Confidence 85%
              - generic [ref=e282]:
                - generic [ref=e283]:
                  - text: HUMAN REVIEW
                  - strong [ref=e284]: Partially resolved
                - paragraph [ref=e285]: Human credit 50%
          - generic [ref=e286]:
            - heading "Reviewer note" [level=3] [ref=e287]
            - paragraph [ref=e288]: Fresh overall note
          - group [ref=e289]:
            - generic "Review history (3 events)" [ref=e290] [cursor=pointer]
        - paragraph [ref=e291]: "Actual Jev requests: Not recorded (legacy)"
        - heading "Provenance" [level=3] [ref=e292]
        - paragraph [ref=e293]: ID escalated · typesafe fixture-jev · 8/1/2026, 1:00:00 PM · manual · form v17 · run —
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test'
  2  | import {fixture} from './final-review-fixture'
  3  | const out='docs/v019-final-whole-product-review-evidence/fresh-checks'
  4  | import {mkdirSync,writeFileSync} from 'node:fs'
  5  | mkdirSync(out,{recursive:true})
  6  | async function settle(p:Page){await p.waitForLoadState('networkidle');await p.clock.runFor(700);await p.waitForLoadState('networkidle')}
  7  | async function nav(p:Page,name:string){const b=p.getByRole('navigation',{name:'Primary navigation'}).locator('button').filter({hasText:new RegExp(name+'$')}),d=b.locator('xpath=ancestor::details');if(await d.count()&&await d.getAttribute('open')===null)await d.locator('summary').click();await b.click();await settle(p)}
> 8  | for(const width of [1440,390])test(`fresh review continuity and completion ${width}`,async({page})=>{await page.setViewportSize({width,height:width===390?844:900});const f=await fixture(page,'REVIEWER','attention','evaluations');try{const before=JSON.stringify(await f.store.evaluation('escalated'));await page.getByRole('button',{name:'Start review',exact:true}).first().click();await expect(page.getByRole('button',{name:'Start review',exact:true}).last()).toBeVisible();await page.getByRole('button',{name:'Start review',exact:true}).last().click();await expect(page.getByLabel('Human answer: Warm opening')).toBeVisible();await page.getByLabel('Human answer: Warm opening').selectOption('Yes');await page.getByLabel('Human answer: Understanding the issue').selectOption('2');await page.getByLabel('Question note: Warm opening').fill('Fresh question note');await page.getByLabel('Overall review note').fill('Fresh overall note');await page.getByRole('button',{name:'Open conversation',exact:true}).click();await page.getByRole('button',{name:'← Back to review',exact:true}).click();await expect(page.getByLabel('Human answer: Warm opening')).toHaveValue('Yes');await expect(page.getByLabel('Human answer: Understanding the issue')).toHaveValue('2');await expect(page.getByLabel('Question note: Warm opening')).toHaveValue('Fresh question note');await expect(page.getByLabel('Overall review note')).toHaveValue('Fresh overall note');await page.getByLabel('Human answer: Resolution').selectOption('partially_resolved');await page.getByRole('button',{name:'Complete review',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Review completed.'})).toBeVisible();await expect(page.locator('tbody')).not.toContainText('000000000004');await expect(page.locator('main')).toContainText('HUMAN SCORE');expect(JSON.stringify(await f.store.evaluation('escalated'))).toBe(before);expect((await f.store.review('escalated'))?.status).toBe('REVIEWED');expect(f.blocked).toEqual([]);expect(f.errors).toEqual([])}finally{await f.close()}})
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ^ Error: expect(locator).not.toContainText(expected) failed
  9  | test('fresh blind scale-format detour is retained',async({page})=>{const f=await fixture(page,'AUTHOR','attention','forms');try{await page.getByRole('button',{name:'＋ New form',exact:true}).click();await page.getByLabel('Form name',{exact:true}).fill('Review fictional resolution');await page.getByRole('button',{name:'Add question',exact:true}).click();await page.getByLabel('Title',{exact:true}).fill('Was the resolution clear?');await page.getByLabel('Instructions / question',{exact:true}).fill('Assess clarity of the resolution.');await page.getByLabel('Answer format').selectOption('score');await page.getByRole('button',{name:'Use reusable Answer Set',exact:true}).click();await expect(page.getByRole('dialog')).not.toContainText('Resolution clarity');await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByLabel('Answer format').selectOption('choice');await page.getByRole('button',{name:'Use reusable Answer Set',exact:true}).click();await page.getByRole('button',{name:'Use Resolution clarity v1',exact:true}).click();await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Saved in AQM'})).toBeVisible();expect(f.blocked).toEqual([])}finally{await f.close()}})
  10 | test('fresh removed-answer comparison explains dependent question repair before update',async({page})=>{const f=await fixture(page,'AUTHOR','attention','forms');try{const sets=(f.store as any).answerSetMap as Map<string,any>,v2=[...sets.values()].find(s=>s.name==='Resolution clarity'&&s.version===2);sets.set(v2.id,{...v2,options:v2.options.filter((o:any)=>o.key!=='partly_clear')});await nav(page,'Answer Sets');await page.getByRole('button',{name:'Refresh saved Answer Sets',exact:true}).click();await settle(page);await nav(page,'Evaluation Forms');await page.getByText('Conditional resolution form',{exact:true}).first().click();await page.getByRole('button',{name:'Edit',exact:true}).first().click();await page.getByRole('button',{name:'Newer version available: v2',exact:true}).click();const d=page.getByRole('dialog');await expect(d).toContainText('REMOVED');await expect(d).toContainText('Clarify partial resolution');await expect(d).toContainText('Partly clear');await expect(d.getByRole('button',{name:'Update this question to v2'})).toBeDisabled();writeFileSync(out+'/blocked-comparison.txt',await d.innerText());expect(f.blocked).toEqual([])}finally{await f.close()}})
  11 | test('fresh lowest-question cohort and explicit return retain exact version and tab',async({page})=>{const f=await fixture(page,'VIEWER','attention','analytics');try{await page.getByRole('button',{name:'Questions',exact:true}).click();const row=page.getByRole('row').filter({hasText:'Understanding the issue'}).filter({hasText:'v18'});await row.getByRole('button',{name:'Inspect evaluations →',exact:true}).click();await expect(page).toHaveURL(/form=general_service%4018/);await expect(page).toHaveURL(/question=understanding/);await expect(page.locator('tbody')).toContainText('v18');await page.getByRole('button',{name:'Back to Analytics',exact:true}).click();await expect(page).toHaveURL(/analyticsTab=questions/);expect(f.blocked).toEqual([])}finally{await f.close()}})
  12 | for(const role of ['ADMIN','AUTHOR','REVIEWER','VIEWER'])test(`fresh 390px role primary task and utilities ${role}`,async({page})=>{await page.setViewportSize({width:390,height:844});const f=await fixture(page,role,'attention',role==='AUTHOR'?'forms':role==='REVIEWER'?'evaluations':'automation');try{const n=page.getByRole('navigation',{name:'Primary navigation'});const primary=n.locator('details[open] button').first();for(const control of [primary,n.getByRole('button',{name:'Settings',exact:true}),n.getByRole('button',{name:'About / product tour',exact:true})]){await control.scrollIntoViewIfNeeded();const b=await control.boundingBox();expect(b).not.toBeNull();expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual(390);expect(b!.height).toBeGreaterThanOrEqual(24)}expect(f.blocked).toEqual([])}finally{await f.close()}})
  13 | test('fresh partial overview preserves available sections',async({page})=>{const f=await fixture(page,'ADMIN','attention','forms');try{(f.store as any).healthSnapshot=async()=>{throw Error('Fictional partial operational-health failure')};await nav(page,'Overview');await expect(page.locator('main')).toContainText('Unavailable');await expect(page.locator('main')).toContainText('Average quality');await expect(page.locator('main')).toContainText('Review workload');expect(f.blocked).toEqual([])}finally{await f.close()}})
  14 | test('fresh browser Back mismatch is retained as characterization',async({page})=>{const f=await fixture(page,'VIEWER','attention','automation');try{await nav(page,'About / product tour');await page.getByRole('button',{name:'Open AQM',exact:true}).first().click();await nav(page,'Analytics');await page.getByRole('button',{name:'Questions',exact:true}).click();await page.getByRole('row').filter({hasText:'Understanding the issue'}).filter({hasText:'v18'}).getByRole('button',{name:'Inspect evaluations →',exact:true}).click();await page.goBack();await settle(page);writeFileSync(out+'/browser-back.json',JSON.stringify({url:page.url(),expectedTask:'Analytics Questions',classification:'PRODUCT DEFECT: task transitions replace current history'}));expect(page.url()).not.toContain('analyticsTab=questions');expect(f.blocked).toEqual([])}finally{await f.close()}})
  15 | 
```