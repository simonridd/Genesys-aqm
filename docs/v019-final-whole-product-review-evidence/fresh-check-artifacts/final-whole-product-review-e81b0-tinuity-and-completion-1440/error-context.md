# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: final-whole-product-review.spec.ts >> fresh review continuity and completion 1440
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
    - generic [ref=e34]:
      - generic [ref=e35]:
        - generic [ref=e36]: ✦
        - strong [ref=e37]: Decision intelligence powered by Jev
        - paragraph [ref=e38]: Typed AI decisions, shaped into clear quality signals.
      - generic [ref=e39]: V0.19D SHOWCASE • 2026
  - main [ref=e40]:
    - generic [ref=e41]:
      - navigation "Breadcrumb" [ref=e42]:
        - text: Workspace /
        - strong [ref=e43]: Evaluations
      - generic [ref=e44]:
        - generic "Current role" [ref=e45]: REVIEWER
        - text: Jev managed securely by automation service
    - generic [ref=e47]:
      - generic [ref=e49]:
        - generic [ref=e50]: QUALITY
        - heading "Evaluations" [level=1] [ref=e51]
        - paragraph [ref=e52]: Production results with form snapshots and provider provenance.
      - group "Evaluation mode" [ref=e53]:
        - button "My reviews" [pressed] [ref=e54] [cursor=pointer]
        - button "All evaluations" [ref=e55] [cursor=pointer]
      - region "My review summary" [ref=e56]:
        - heading "My reviews" [level=2] [ref=e57]
        - generic [ref=e58]:
          - generic [ref=e59]:
            - generic [ref=e60]: Assigned open
            - strong [ref=e61]: "4"
          - generic [ref=e62]:
            - generic [ref=e63]: Due soon
            - strong [ref=e64]: "1"
          - generic [ref=e65]:
            - generic [ref=e66]: Overdue
            - strong [ref=e67]: "1"
          - generic [ref=e68]:
            - generic [ref=e69]: Escalated
            - strong [ref=e70]: "0"
        - button "Available unassigned reviews (1) →" [ref=e71] [cursor=pointer]
      - generic [ref=e72]:
        - generic [ref=e73]:
          - text: Review status
          - combobox "Review status" [ref=e74]:
            - option "All" [selected]
            - option "NOT REVIEWED"
            - option "REVIEW REQUESTED"
            - option "IN REVIEW"
            - option "REVIEWED"
        - generic [ref=e75]:
          - text: SLA state
          - combobox "SLA state" [ref=e76]:
            - option "All states" [selected]
            - option "Due soon"
            - option "Overdue"
            - option "Escalated"
        - generic [ref=e77]:
          - text: Due
          - combobox "Due" [ref=e78]:
            - option "All" [selected]
            - option "Overdue"
            - option "Due today"
            - option "Due next 7 days"
            - option "No due date"
        - button "Refresh" [ref=e79] [cursor=pointer]
      - button "More filters" [ref=e80] [cursor=pointer]
      - paragraph [ref=e81]: My queue is prioritized across the server active review set (maximum 2,000).
      - generic [ref=e82]:
        - generic [ref=e83]:
          - generic [ref=e84]:
            - text: Search
            - textbox "Search table" [ref=e85]:
              - /placeholder: Search visible fields
          - generic [ref=e86]: 4 results on this page
        - region "My reviews table" [ref=e87]:
          - table [ref=e88]:
            - rowgroup [ref=e89]:
              - row [ref=e90]:
                - columnheader "Queue priority" [ref=e91]
                - columnheader "Conversation" [ref=e92]
                - columnheader "Agent" [ref=e93]
                - columnheader "Queue" [ref=e94]
                - columnheader "Form" [ref=e95]
                - columnheader "AI score" [ref=e96]
                - columnheader "Review" [ref=e97]
                - columnheader "Due" [ref=e98]
                - columnheader "Action" [ref=e99]
            - rowgroup [ref=e100]:
              - row [ref=e101] [cursor=pointer]:
                - cell "OVERDUE Overdue by 6 hours" [ref=e102]:
                  - generic [ref=e103]:
                    - generic [ref=e104]: OVERDUE
                    - generic [ref=e105]: Overdue by 6 hours
                - cell [ref=e106]:
                  - button "Open evaluation overdue" [ref=e107]: 22222222-2222-4222-8222-000000000005
                - cell "Alex Morgan" [ref=e108]
                - cell "Customer care" [ref=e109]
                - cell "General Customer Service v17" [ref=e110]
                - cell "78%" [ref=e111]
                - cell "REVIEW_REQUESTED" [ref=e112]
                - cell "10/2/2026, 7:00:00 AM OVERDUE Overdue by 6 hours" [ref=e113]:
                  - text: 10/2/2026, 7:00:00 AM
                  - generic [ref=e114]:
                    - generic [ref=e115]: OVERDUE
                    - generic [ref=e116]: Overdue by 6 hours
                - cell [ref=e117]:
                  - button "Start review" [ref=e118]
              - row [ref=e119] [cursor=pointer]:
                - cell "DUE SOON Due in 6 hours" [ref=e120]:
                  - generic [ref=e121]:
                    - generic [ref=e122]: DUE SOON
                    - generic [ref=e123]: Due in 6 hours
                - cell [ref=e124]:
                  - button "Open evaluation soon" [ref=e125]: 22222222-2222-4222-8222-000000000006
                - cell "Alex Morgan" [ref=e126]
                - cell "Customer care" [ref=e127]
                - cell "General Customer Service v17" [ref=e128]
                - cell "78%" [ref=e129]
                - cell "REVIEW_REQUESTED" [ref=e130]
                - cell "10/2/2026, 7:00:00 PM DUE SOON Due in 6 hours" [ref=e131]:
                  - text: 10/2/2026, 7:00:00 PM
                  - generic [ref=e132]:
                    - generic [ref=e133]: DUE SOON
                    - generic [ref=e134]: Due in 6 hours
                - cell [ref=e135]:
                  - button "Start review" [ref=e136]
              - row [ref=e137] [cursor=pointer]:
                - cell "Due in 3 days" [ref=e138]
                - cell [ref=e141]:
                  - button "Open evaluation progress" [ref=e142]: 22222222-2222-4222-8222-000000000023
                - cell "Alex Morgan" [ref=e143]
                - cell "Customer care" [ref=e144]
                - cell "General Customer Service v17" [ref=e145]
                - cell "78%" [ref=e146]
                - cell "IN_REVIEW" [ref=e147]
                - cell "10/5/2026, 1:00:00 PM Due in 3 days" [ref=e148]:
                  - text: 10/5/2026, 1:00:00 PM
                  - generic [ref=e149]: Due in 3 days
                - cell [ref=e151]:
                  - button "Continue review" [ref=e152]
              - row [ref=e153] [cursor=pointer]:
                - cell "Due in 3 days" [ref=e154]
                - cell [ref=e157]:
                  - button "Open evaluation requested_extra" [ref=e158]: 22222222-2222-4222-8222-000000000025
                - cell "Alex Morgan" [ref=e159]
                - cell "Customer care" [ref=e160]
                - cell "General Customer Service v17" [ref=e161]
                - cell "78%" [ref=e162]
                - cell "REVIEW_REQUESTED" [ref=e163]
                - cell "10/5/2026, 1:00:00 PM Due in 3 days" [ref=e164]:
                  - text: 10/5/2026, 1:00:00 PM
                  - generic [ref=e165]: Due in 3 days
                - cell [ref=e167]:
                  - button "Start review" [ref=e168]
      - generic [ref=e169]:
        - button "First page" [disabled] [ref=e170]
        - button "Next server page →" [disabled] [ref=e171]
      - generic [ref=e172]:
        - generic [ref=e173]:
          - generic [ref=e174]:
            - text: EVALUATION DETAIL
            - heading "General Customer Service v17" [level=2] [ref=e175]
          - button "Close details" [ref=e176] [cursor=pointer]
        - generic [ref=e177]:
          - generic [ref=e178]:
            - generic [ref=e179]: Score
            - strong [ref=e180]: 78%
          - generic [ref=e181]:
            - generic [ref=e182]: Result
            - strong [ref=e183]: Pass
          - generic [ref=e184]:
            - generic [ref=e185]: Critical failures
            - strong [ref=e186]: "0"
          - generic [ref=e187]:
            - generic [ref=e188]: Review
            - strong [ref=e189]: REVIEWED
        - heading "Context" [level=3] [ref=e190]
        - paragraph [ref=e191]: Conversation 22222222-2222-4222-8222-000000000004 · Alex Morgan · Customer care · voice · Unspecified
        - paragraph [ref=e192]: Policy Manual · Run — · genesys-cloud
        - button "Open conversation" [ref=e193] [cursor=pointer]
        - region "Group results" [ref=e194]:
          - heading "Groups · Question weighted" [level=3] [ref=e195]
          - article [ref=e196]:
            - heading "Customer care · 78%" [level=3] [ref=e197]
            - paragraph [ref=e198]: No group threshold
            - paragraph [ref=e199]:
              - strong [ref=e200]: Warm opening
              - text: · Yes · 100%
            - paragraph [ref=e201]:
              - strong [ref=e202]: Understanding the issue
              - text: · 1.00 / 3 · 33%
            - paragraph [ref=e203]:
              - strong [ref=e204]: Resolution
              - text: · Fully resolved · 100%
        - region "Human review" [ref=e205]:
          - generic [ref=e206]:
            - generic [ref=e207]:
              - text: HUMAN REVIEW
              - heading "Completed calibration" [level=2] [ref=e208]
              - paragraph [ref=e209]: General Customer Service v17 · REVIEWED
            - generic [ref=e210]: REAL GENESYS DATA
          - paragraph [ref=e211]: "Assigned to: Alex Reviewer"
          - paragraph [ref=e212]:
            - text: "Due: 9/28/2026, 1:00:00 PM"
            - generic [ref=e213]: Completed
          - generic [ref=e215]:
            - generic [ref=e216]:
              - generic [ref=e217]: AI SCORE
              - strong [ref=e218]: 78%
            - generic [ref=e219]:
              - generic [ref=e220]: HUMAN SCORE
              - strong [ref=e221]: 69%
            - generic [ref=e222]:
              - generic [ref=e223]: EXACT AGREEMENT
              - strong [ref=e224]: 1 / 3
            - generic [ref=e225]:
              - generic [ref=e226]: ABSOLUTE SCORE GAP
              - strong [ref=e227]: 9.3 pp
          - region "Group comparison" [ref=e228]:
            - heading "Group comparison" [level=3] [ref=e229]
            - generic [ref=e231]:
              - strong [ref=e232]: Customer care
              - paragraph [ref=e233]: "AI group score: 78%"
              - paragraph [ref=e234]: "Human group score: 69%"
              - paragraph [ref=e235]: "Difference: -9.3 pp"
          - paragraph [ref=e236]: Use the evaluated form snapshot. Partial scores are previews; completed reviews contribute to Calibration. AI scores stay in Quality.
          - paragraph [ref=e237]: "Reviewer: Alex Reviewer · 10/2/2026, 1:00:00 PM · revision 4"
          - status [active] [ref=e238]: Review completed. It has been removed from My Reviews. The original AI result is preserved.
          - button "Close and continue My Reviews" [ref=e239] [cursor=pointer]
          - group "Comparison filter" [ref=e240]:
            - button "All" [ref=e241] [cursor=pointer]
            - button "Agreements" [ref=e242] [cursor=pointer]
            - button "Disagreements" [ref=e243] [cursor=pointer]
          - article [ref=e244]:
            - generic [ref=e245]:
              - generic [ref=e246]:
                - generic [ref=e247]: Customer care · YES / NO
                - heading "Warm opening" [level=3] [ref=e248]
              - generic [ref=e249]: Agreement
            - paragraph [ref=e250]: Did the agent greet the customer and offer help at the start of the conversation?
            - generic [ref=e251]:
              - generic [ref=e252]:
                - text: AI RESULT
                - strong [ref=e253]: "Yes"
                - paragraph [ref=e254]: Credit 100% · Yes probability 95%
                - generic [ref=e255]: Selected-answer confidence 95%
              - generic [ref=e256]:
                - generic [ref=e257]:
                  - text: HUMAN REVIEW
                  - strong [ref=e258]: "Yes"
                - paragraph [ref=e259]: Human credit 100%
                - paragraph [ref=e260]: Fresh question note
          - article [ref=e261]:
            - generic [ref=e262]:
              - generic [ref=e263]:
                - generic [ref=e264]: Customer care · SCORE
                - heading "Understanding the issue" [level=3] [ref=e265]
              - generic [ref=e266]: One-band difference
            - paragraph [ref=e267]: How effectively did the agent establish and acknowledge the customer’s actual issue?
            - generic [ref=e268]:
              - generic [ref=e269]:
                - text: AI RESULT
                - strong [ref=e270]: 1.00 / 3
                - paragraph [ref=e271]: Credit 33% · Confidence 75%
                - generic [ref=e272]: "Exact value distance: 1.00 bands"
              - generic [ref=e273]:
                - generic [ref=e274]:
                  - text: HUMAN REVIEW
                  - strong [ref=e275]: Good
                - paragraph [ref=e276]: Human credit 67%
          - article [ref=e277]:
            - generic [ref=e278]:
              - generic [ref=e279]:
                - generic [ref=e280]: Customer care · CHOICE
                - heading "Resolution" [level=3] [ref=e281]
              - generic [ref=e282]: Disagreement
            - paragraph [ref=e283]: What is the best description of the issue outcome by the end of the conversation?
            - generic [ref=e284]:
              - generic [ref=e285]:
                - text: AI RESULT
                - strong [ref=e286]: Fully resolved
                - paragraph [ref=e287]: Credit 100% · Confidence 85%
              - generic [ref=e288]:
                - generic [ref=e289]:
                  - text: HUMAN REVIEW
                  - strong [ref=e290]: Partially resolved
                - paragraph [ref=e291]: Human credit 50%
          - generic [ref=e292]:
            - heading "Reviewer note" [level=3] [ref=e293]
            - paragraph [ref=e294]: Fresh overall note
          - group [ref=e295]:
            - generic "Review history (3 events)" [ref=e296] [cursor=pointer]
        - paragraph [ref=e297]: "Actual Jev requests: Not recorded (legacy)"
        - heading "Provenance" [level=3] [ref=e298]
        - paragraph [ref=e299]: ID escalated · typesafe fixture-jev · 8/1/2026, 1:00:00 PM · manual · form v17 · run —
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