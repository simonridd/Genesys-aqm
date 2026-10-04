# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: final-whole-product-review.spec.ts >> fresh lowest-question cohort and explicit return retain exact version and tab
- Location: tests/final-whole-product-review.spec.ts:11:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('tbody')
Expected substring: "v18"
Error: strict mode violation: locator('tbody') resolved to 2 elements:
    1) <tbody></tbody> aka getByLabel('Completed interactions table').locator('tbody')
    2) <tbody></tbody> aka getByRole('region', { name: 'All evaluations table' }).locator('tbody')

Call log:
  - Expect "toContainText" locator('tbody') with timeout 5000ms
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
        - generic "Monitor / Quality" [ref=e11] [cursor=pointer]
        - generic [ref=e12]:
          - button "Overview" [ref=e13] [cursor=pointer]:
            - generic [aria-hidden] [ref=e14]: ◌
          - button "Analytics" [ref=e16] [cursor=pointer]:
            - generic [aria-hidden] [ref=e17]: ▥
          - button "Evaluations" [ref=e19] [cursor=pointer]:
            - generic [aria-hidden] [ref=e20]: ◷
          - button "Calibration" [ref=e22] [cursor=pointer]:
            - generic [aria-hidden] [ref=e23]: ◎
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
        - generic "Current role" [ref=e45]: VIEWER
        - text: Jev managed securely by automation service
    - generic [ref=e47]:
      - generic [ref=e49]:
        - generic [ref=e50]: QUALITY
        - heading "Evaluations" [level=1] [ref=e51]
        - paragraph [ref=e52]: Production results with form snapshots and provider provenance.
      - button "Back to Analytics" [ref=e53] [cursor=pointer]
      - region "Investigation scope" [ref=e54]:
        - strong [ref=e55]: "Investigating:"
        - generic [ref=e56]:
          - 'button "Remove Form: general_service@18" [ref=e57] [cursor=pointer]':
            - generic [ref=e58]: Remove
            - text: "Form: general_service@18 ×"
          - 'button "Remove Question: understanding" [ref=e59] [cursor=pointer]':
            - generic [ref=e60]: Remove
            - text: "Question: understanding ×"
          - button "Remove Analytics cohort" [ref=e61] [cursor=pointer]:
            - generic [ref=e62]: Remove
            - text: Analytics cohort ×
          - button "Clear investigation filters" [ref=e63] [cursor=pointer]
      - group [ref=e64]:
        - generic "Team review workload" [ref=e65] [cursor=pointer]
      - generic [ref=e66]:
        - generic [ref=e67]:
          - text: History
          - combobox "History" [ref=e68]:
            - option "Server" [selected]
            - option "This browser"
        - generic [ref=e69]:
          - text: Review status
          - combobox "Review status" [ref=e70]:
            - option "All" [selected]
            - option "NOT REVIEWED"
            - option "REVIEW REQUESTED"
            - option "IN REVIEW"
            - option "REVIEWED"
        - generic [ref=e71]:
          - text: Assignment
          - combobox "Assignment" [ref=e72]:
            - option "All" [selected]
            - option "Unassigned"
            - option "Assigned"
            - option "Assigned to me"
            - option "admin"
            - option "Alex Reviewer"
        - generic [ref=e73]:
          - text: SLA state
          - combobox "SLA state" [ref=e74]:
            - option "All states" [selected]
            - option "Due soon"
            - option "Overdue"
            - option "Escalated"
        - generic [ref=e75]:
          - text: Due
          - combobox "Due" [ref=e76]:
            - option "All" [selected]
            - option "Overdue"
            - option "Due today"
            - option "Due next 7 days"
            - option "No due date"
        - generic [ref=e77]:
          - text: Form ID @ version
          - textbox "Form ID @ version" [ref=e78]: general_service@18
        - generic [ref=e79]:
          - text: Agent
          - textbox "Agent" [ref=e80]
        - generic [ref=e81]:
          - text: Queue
          - textbox "Queue" [ref=e82]
        - generic [ref=e83]:
          - text: Channel
          - textbox "Channel" [ref=e84]
        - generic [ref=e85]:
          - text: Result
          - combobox "Result" [ref=e86]:
            - option "All" [selected]
            - option "Pass"
            - option "Fail"
        - generic [ref=e87]:
          - text: Answered question
          - textbox "Answered question" [ref=e88]:
            - /placeholder: Question ID
            - text: understanding
        - generic [ref=e89]:
          - text: From
          - textbox "From" [ref=e90]
        - generic [ref=e91]:
          - text: To
          - textbox "To" [ref=e92]
        - generic [ref=e93]:
          - text: Policy ID
          - textbox "Policy ID" [ref=e94]
        - generic [ref=e95]:
          - text: Source
          - combobox "Source" [ref=e96]:
            - option "All" [selected]
            - option "Genesys Cloud"
            - option "Synthetic"
            - option "Uploaded"
        - generic [ref=e97]:
          - text: Trigger
          - combobox "Trigger" [ref=e98]:
            - option "All" [selected]
            - option "Manual"
            - option "Scheduled"
        - generic [ref=e99]:
          - text: Critical failure
          - combobox "Critical failure" [ref=e100]:
            - option "All" [selected]
            - option "Yes"
            - option "No"
        - button "Refresh" [ref=e101] [cursor=pointer]
      - paragraph [ref=e102]: Server filters scan a bounded window of up to 500 records per request. Use Next to continue the search.
      - generic [ref=e103]:
        - generic [ref=e104]:
          - generic [ref=e105]:
            - text: Search
            - textbox "Search table" [ref=e106]:
              - /placeholder: Search visible fields
          - generic [ref=e107]: 0 results on this page
        - region "All evaluations table" [ref=e108]:
          - table [ref=e109]:
            - rowgroup [ref=e110]:
              - row [ref=e111]:
                - columnheader [ref=e112]:
                  - button "Evaluated ↓" [ref=e113] [cursor=pointer]
                - columnheader [ref=e114]:
                  - button "Conversation" [ref=e115] [cursor=pointer]
                - columnheader [ref=e116]:
                  - button "Agent" [ref=e117] [cursor=pointer]
                - columnheader [ref=e118]:
                  - button "Queue" [ref=e119] [cursor=pointer]
                - columnheader [ref=e120]:
                  - button "Form" [ref=e121] [cursor=pointer]
                - columnheader [ref=e122]:
                  - button "Source" [ref=e123] [cursor=pointer]
                - columnheader [ref=e124]:
                  - button "AI score" [ref=e125] [cursor=pointer]
                - columnheader [ref=e126]:
                  - button "Review" [ref=e127] [cursor=pointer]
                - columnheader [ref=e128]:
                  - button "Human score" [ref=e129] [cursor=pointer]
                - columnheader [ref=e130]:
                  - button "Agreement" [ref=e131] [cursor=pointer]
                - columnheader [ref=e132]:
                  - button "Assigned to" [ref=e133] [cursor=pointer]
                - columnheader [ref=e134]:
                  - button "Due" [ref=e135] [cursor=pointer]
                - columnheader [ref=e136]:
                  - button "Reviewer" [ref=e137] [cursor=pointer]
                - columnheader [ref=e138]:
                  - button "Reviewed at" [ref=e139] [cursor=pointer]
            - rowgroup
        - paragraph [ref=e140]: No production evaluations on this page.
      - generic [ref=e141]:
        - button "First page" [disabled] [ref=e142]
        - button "Next server page →" [disabled] [ref=e143]
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
  8  | for(const width of [1440,390])test(`fresh review continuity and completion ${width}`,async({page})=>{await page.setViewportSize({width,height:width===390?844:900});const f=await fixture(page,'REVIEWER','attention','evaluations');try{const before=JSON.stringify(await f.store.evaluation('escalated'));await page.getByRole('button',{name:'Start review',exact:true}).first().click();await expect(page.getByRole('button',{name:'Start review',exact:true}).last()).toBeVisible();await page.getByRole('button',{name:'Start review',exact:true}).last().click();await expect(page.getByLabel('Human answer: Warm opening')).toBeVisible();await page.getByLabel('Human answer: Warm opening').selectOption('Yes');await page.getByLabel('Human answer: Understanding the issue').selectOption('2');await page.getByLabel('Question note: Warm opening').fill('Fresh question note');await page.getByLabel('Overall review note').fill('Fresh overall note');await page.getByRole('button',{name:'Open conversation',exact:true}).click();await page.getByRole('button',{name:'← Back to review',exact:true}).click();await expect(page.getByLabel('Human answer: Warm opening')).toHaveValue('Yes');await expect(page.getByLabel('Human answer: Understanding the issue')).toHaveValue('2');await expect(page.getByLabel('Question note: Warm opening')).toHaveValue('Fresh question note');await expect(page.getByLabel('Overall review note')).toHaveValue('Fresh overall note');await page.getByLabel('Human answer: Resolution').selectOption('partially_resolved');await page.getByRole('button',{name:'Complete review',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Review completed.'})).toBeVisible();await expect(page.locator('tbody')).not.toContainText('000000000004');await expect(page.locator('main')).toContainText('HUMAN SCORE');expect(JSON.stringify(await f.store.evaluation('escalated'))).toBe(before);expect((await f.store.review('escalated'))?.status).toBe('REVIEWED');expect(f.blocked).toEqual([]);expect(f.errors).toEqual([])}finally{await f.close()}})
  9  | test('fresh blind scale-format detour is retained',async({page})=>{const f=await fixture(page,'AUTHOR','attention','forms');try{await page.getByRole('button',{name:'＋ New form',exact:true}).click();await page.getByLabel('Form name',{exact:true}).fill('Review fictional resolution');await page.getByRole('button',{name:'Add question',exact:true}).click();await page.getByLabel('Title',{exact:true}).fill('Was the resolution clear?');await page.getByLabel('Instructions / question',{exact:true}).fill('Assess clarity of the resolution.');await page.getByLabel('Answer format').selectOption('score');await page.getByRole('button',{name:'Use reusable Answer Set',exact:true}).click();await expect(page.getByRole('dialog')).not.toContainText('Resolution clarity');await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.getByLabel('Answer format').selectOption('choice');await page.getByRole('button',{name:'Use reusable Answer Set',exact:true}).click();await page.getByRole('button',{name:'Use Resolution clarity v1',exact:true}).click();await page.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Saved in AQM'})).toBeVisible();expect(f.blocked).toEqual([])}finally{await f.close()}})
  10 | test('fresh removed-answer comparison explains dependent question repair before update',async({page})=>{const f=await fixture(page,'AUTHOR','attention','forms');try{const sets=(f.store as any).answerSetMap as Map<string,any>,v2=[...sets.values()].find(s=>s.name==='Resolution clarity'&&s.version===2);sets.set(v2.id,{...v2,options:v2.options.filter((o:any)=>o.key!=='partly_clear')});await nav(page,'Answer Sets');await page.getByRole('button',{name:'Refresh saved Answer Sets',exact:true}).click();await settle(page);await nav(page,'Evaluation Forms');await page.getByText('Conditional resolution form',{exact:true}).first().click();await page.getByRole('button',{name:'Edit',exact:true}).first().click();await page.getByRole('button',{name:'Newer version available: v2',exact:true}).click();const d=page.getByRole('dialog');await expect(d).toContainText('REMOVED');await expect(d).toContainText('Clarify partial resolution');await expect(d).toContainText('Partly clear');await expect(d.getByRole('button',{name:'Update this question to v2'})).toBeDisabled();writeFileSync(out+'/blocked-comparison.txt',await d.innerText());expect(f.blocked).toEqual([])}finally{await f.close()}})
> 11 | test('fresh lowest-question cohort and explicit return retain exact version and tab',async({page})=>{const f=await fixture(page,'VIEWER','attention','analytics');try{await page.getByRole('button',{name:'Questions',exact:true}).click();const row=page.getByRole('row').filter({hasText:'Understanding the issue'}).filter({hasText:'v18'});await row.getByRole('button',{name:'Inspect evaluations →',exact:true}).click();await expect(page).toHaveURL(/form=general_service%4018/);await expect(page).toHaveURL(/question=understanding/);await expect(page.locator('tbody')).toContainText('v18');await page.getByRole('button',{name:'Back to Analytics',exact:true}).click();await expect(page).toHaveURL(/analyticsTab=questions/);expect(f.blocked).toEqual([])}finally{await f.close()}})
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ^ Error: expect(locator).toContainText(expected) failed
  12 | for(const role of ['ADMIN','AUTHOR','REVIEWER','VIEWER'])test(`fresh 390px role primary task and utilities ${role}`,async({page})=>{await page.setViewportSize({width:390,height:844});const f=await fixture(page,role,'attention',role==='AUTHOR'?'forms':role==='REVIEWER'?'evaluations':'automation');try{const n=page.getByRole('navigation',{name:'Primary navigation'});const primary=n.locator('details[open] button').first();for(const control of [primary,n.getByRole('button',{name:'Settings',exact:true}),n.getByRole('button',{name:'About / product tour',exact:true})]){await control.scrollIntoViewIfNeeded();const b=await control.boundingBox();expect(b).not.toBeNull();expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual(390);expect(b!.height).toBeGreaterThanOrEqual(24)}expect(f.blocked).toEqual([])}finally{await f.close()}})
  13 | test('fresh partial overview preserves available sections',async({page})=>{const f=await fixture(page,'ADMIN','attention','forms');try{(f.store as any).healthSnapshot=async()=>{throw Error('Fictional partial operational-health failure')};await nav(page,'Overview');await expect(page.locator('main')).toContainText('Unavailable');await expect(page.locator('main')).toContainText('Average quality');await expect(page.locator('main')).toContainText('Review workload');expect(f.blocked).toEqual([])}finally{await f.close()}})
  14 | test('fresh browser Back mismatch is retained as characterization',async({page})=>{const f=await fixture(page,'VIEWER','attention','automation');try{await nav(page,'About / product tour');await page.getByRole('button',{name:'Open AQM',exact:true}).first().click();await nav(page,'Analytics');await page.getByRole('button',{name:'Questions',exact:true}).click();await page.getByRole('row').filter({hasText:'Understanding the issue'}).filter({hasText:'v18'}).getByRole('button',{name:'Inspect evaluations →',exact:true}).click();await page.goBack();await settle(page);writeFileSync(out+'/browser-back.json',JSON.stringify({url:page.url(),expectedTask:'Analytics Questions',classification:'PRODUCT DEFECT: task transitions replace current history'}));expect(page.url()).not.toContain('analyticsTab=questions');expect(f.blocked).toEqual([])}finally{await f.close()}})
  15 | 
```