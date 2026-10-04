# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: definition-authority.spec.ts >> exact voice criteria, missing saved pin, two saved forms and persistent working copies
- Location: tests/definition-authority.spec.ts:127:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Conversation review', exact: true })

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - generic [ref=f1e5]:
      - img "IPI" [ref=f1e6]
      - generic [ref=f1e7]:
        - strong [ref=f1e8]: IPI AQM
        - text: Automated Quality Management
    - navigation "Primary navigation" [ref=f1e9]:
      - group [ref=f1e10]:
        - generic "Monitor / Quality" [ref=f1e11] [cursor=pointer]
        - generic [ref=f1e12]:
          - button "Overview" [ref=f1e13] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e14]: ◌
          - button "Evaluations" [ref=f1e16] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e17]: ◷
          - button "Analytics" [ref=f1e19] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e20]: ▥
          - button "Calibration" [ref=f1e22] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e23]: ◎
      - group [ref=f1e25]:
        - generic "Configuration" [ref=f1e26] [cursor=pointer]
        - generic [ref=f1e27]:
          - button "Policies" [ref=f1e28] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e29]: ◇
          - button "Evaluation Forms" [ref=f1e31] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e32]: ▤
          - button "Question Groups" [ref=f1e34] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e35]: ▦
          - button "Answer Sets" [ref=f1e37] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e38]: ☷
      - group [ref=f1e40]:
        - generic "Interactions" [ref=f1e41] [cursor=pointer]
      - generic [ref=f1e42]:
        - button "Settings" [ref=f1e43] [cursor=pointer]:
          - generic [aria-hidden] [ref=f1e44]: ⚙
        - button "About / product tour" [ref=f1e46] [cursor=pointer]
    - generic [ref=f1e47]:
      - generic [ref=f1e48]:
        - generic [ref=f1e49]: ✦
        - strong [ref=f1e50]: Decision intelligence powered by Jev
        - paragraph [ref=f1e51]: Typed AI decisions, shaped into clear quality signals.
      - generic [ref=f1e52]: V0.19D SHOWCASE • 2026
  - main [ref=f1e53]:
    - generic [ref=f1e54]:
      - navigation "Breadcrumb" [ref=f1e55]:
        - text: Workspace /
        - strong [ref=f1e56]: Evaluation Forms
      - generic [ref=f1e57]:
        - generic "Current role" [ref=f1e58]: ADMIN
        - text: Jev managed securely by automation service
    - generic [ref=f1e60]:
      - generic [ref=f1e61]:
        - generic [ref=f1e62]:
          - generic [ref=f1e63]: CONFIGURATION
          - heading "Evaluation Forms" [level=1] [ref=f1e64]
          - paragraph [ref=f1e65]: "Build the complete quality evaluation: questions, scoring and pass rules."
          - paragraph [ref=f1e66]: Reuse Question Groups for related questions and Answer Sets for common answers.
        - generic [ref=f1e67]:
          - group "View" [ref=f1e68]:
            - button "Table" [ref=f1e69] [cursor=pointer]
            - button "Cards" [ref=f1e70] [cursor=pointer]
          - generic [ref=f1e71]:
            - text: Import form
            - button "Import form" [ref=f1e72]
          - button "＋ New form" [ref=f1e73] [cursor=pointer]
      - region "Saved Forms" [ref=f1e74]:
        - heading "Saved in AQM · 2 saved forms" [level=2] [ref=f1e75]
        - paragraph [ref=f1e76]: Production usage counts use saved policies only.
        - button "Refresh saved forms" [ref=f1e77] [cursor=pointer]
      - generic [ref=f1e78]:
        - generic [ref=f1e79]:
          - text: Status
          - combobox "Library status" [ref=f1e80]:
            - option "All statuses" [selected]
            - option "Draft"
            - option "Testing"
            - option "Published"
            - option "Retired"
        - generic [ref=f1e81]:
          - text: Version
          - combobox "Library version" [ref=f1e82]:
            - option "All versions" [selected]
            - option "Latest version per family"
        - generic [ref=f1e83]:
          - text: Usage
          - combobox "Library usage" [ref=f1e84]:
            - option "All usage" [selected]
            - option "Assigned to policy"
            - option "Unassigned"
      - generic [ref=f1e85]:
        - generic [ref=f1e86]:
          - generic [ref=f1e87]:
            - text: Search
            - textbox "Search table" [ref=f1e88]:
              - /placeholder: Search visible fields
          - generic [ref=f1e89]: 2 results
        - region "Evaluation forms table" [ref=f1e90]:
          - table [ref=f1e91]:
            - rowgroup [ref=f1e92]:
              - row [ref=f1e93]:
                - columnheader [ref=f1e94]:
                  - button "Form name ↓" [ref=f1e95] [cursor=pointer]
                - columnheader [ref=f1e96]:
                  - button "Status" [ref=f1e97] [cursor=pointer]
                - columnheader [ref=f1e98]:
                  - button "Version" [ref=f1e99] [cursor=pointer]
                - columnheader [ref=f1e100]:
                  - button "Questions" [ref=f1e101] [cursor=pointer]
                - columnheader [ref=f1e102]:
                  - button "Assigned policies" [ref=f1e103] [cursor=pointer]
                - columnheader [ref=f1e104]:
                  - button "Evaluations" [ref=f1e105] [cursor=pointer]
                - columnheader [ref=f1e106]:
                  - button "Average score" [ref=f1e107] [cursor=pointer]
                - columnheader [ref=f1e108]:
                  - button "Last modified" [ref=f1e109] [cursor=pointer]
            - rowgroup [ref=f1e110]:
              - row [ref=f1e111] [cursor=pointer]:
                - cell [ref=f1e112]:
                  - button "Open form Saved production form v1" [ref=f1e113]: Saved production form
                - cell "PUBLISHED" [ref=f1e114]
                - cell "v1" [ref=f1e115]
                - cell "9" [ref=f1e116]
                - cell "1" [ref=f1e117]
                - cell "0" [ref=f1e118]
                - cell "—" [ref=f1e119]
                - cell "—" [ref=f1e120]
              - row [ref=f1e121] [cursor=pointer]:
                - cell [ref=f1e122]:
                  - button "Open form Recovered working draft v1" [ref=f1e123]: Recovered working draft
                - cell "DRAFT" [ref=f1e124]
                - cell "v1" [ref=f1e125]
                - cell "9" [ref=f1e126]
                - cell "0" [ref=f1e127]
                - cell "0" [ref=f1e128]
                - cell "—" [ref=f1e129]
                - cell "4 Oct 2026" [ref=f1e130]
      - group [ref=f1e131]:
        - generic "Local drafts & starter examples · 4 forms" [ref=f1e132] [cursor=pointer]
      - generic [ref=f1e133]:
        - group [ref=f1e134]:
          - generic [ref=f1e135]:
            - generic [ref=f1e136]:
              - generic [ref=f1e137]:
                - generic [ref=f1e138]:
                  - text: Saved form ·
                  - generic [ref=f1e139]: DRAFT · VERSION 1
                - heading "Recovered working draft" [level=2] [ref=f1e140]
              - generic [ref=f1e141]:
                - button "Close details" [ref=f1e142] [cursor=pointer]
                - button "Save changes" [ref=f1e143] [cursor=pointer]
                - button "Publish version" [ref=f1e144] [cursor=pointer]
                - group [ref=f1e145]:
                  - generic "More actions" [ref=f1e146] [cursor=pointer]
            - status [ref=f1e147]: Saved in AQM · 8:29:18 AM
            - generic [ref=f1e148]:
              - generic [ref=f1e149]:
                - text: Form name
                - textbox "Form name" [ref=f1e150]: Recovered working draft
              - generic [ref=f1e151]:
                - text: Description
                - textbox "Description" [ref=f1e152]: Opening, understanding, ownership, resolution and close.
              - generic [ref=f1e153]:
                - text: Pass score
                - generic [ref=f1e154]: 70%
                - slider "Pass score 70%" [ref=f1e155]: "0.7"
            - group [ref=f1e156]:
              - generic "Critical questions" [ref=f1e157] [cursor=pointer]
          - generic [ref=f1e158]:
            - generic [ref=f1e159]:
              - generic [ref=f1e160]:
                - heading "Question groups" [level=2] [ref=f1e161]
                - paragraph [ref=f1e162]: Question weights determine the overall score.
              - generic [ref=f1e163]:
                - button "Add group" [ref=f1e164] [cursor=pointer]
                - button "Add reusable group" [ref=f1e165] [cursor=pointer]
            - group [ref=f1e166]:
              - generic "Scoring rules · Question weighted · Yes threshold 65%" [ref=f1e167] [cursor=pointer]
            - 'region "Group: General" [ref=f1e168]':
              - generic [ref=f1e169]:
                - generic [ref=f1e170]:
                  - heading "General" [level=3] [ref=f1e171]
                  - generic [ref=f1e172]: 9 questions
                - paragraph [ref=f1e173]: Using Saved group A v1
                - group [ref=f1e174]:
                  - generic "Group settings" [ref=f1e175] [cursor=pointer]
              - generic [ref=f1e176]:
                - article [ref=f1e177]:
                  - generic [ref=f1e178]:
                    - generic [ref=f1e179]: "01"
                    - generic [ref=f1e180]:
                      - strong [ref=f1e181]: Warm opening
                      - paragraph [ref=f1e182]: Yes / No · Weight 1 · Enabled
                      - paragraph [ref=f1e183]: Did the agent greet the customer and offer help at the start of the conversation?
                      - paragraph [ref=f1e184]: Yes / No
                    - button "Edit" [ref=f1e185] [cursor=pointer]
                - article [ref=f1e186]:
                  - generic [ref=f1e187]:
                    - generic [ref=f1e188]: "02"
                    - generic [ref=f1e189]:
                      - strong [ref=f1e190]: Understanding the issue
                      - paragraph [ref=f1e191]: Ordered scale · Weight 1.2 · Enabled
                      - paragraph [ref=f1e192]: How effectively did the agent establish and acknowledge the customer’s actual issue?
                      - paragraph [ref=f1e193]: 4 levels · Poor → Excellent
                    - button "Edit" [ref=f1e194] [cursor=pointer]
                - article [ref=f1e195]:
                  - generic [ref=f1e196]:
                    - generic [ref=f1e197]: "03"
                    - generic [ref=f1e198]:
                      - strong [ref=f1e199]: Accurate information
                      - paragraph [ref=f1e200]: Yes / No · Weight 1.5 · Enabled
                      - paragraph [ref=f1e201]: Were the agent’s statements consistent with the facts available in the conversation, without an apparent factual error?
                      - paragraph [ref=f1e202]: Yes / No
                    - button "Edit" [ref=f1e203] [cursor=pointer]
                - article [ref=f1e204]:
                  - generic [ref=f1e205]:
                    - generic [ref=f1e206]: "04"
                    - generic [ref=f1e207]:
                      - strong [ref=f1e208]: Empathy
                      - paragraph [ref=f1e209]: Ordered scale · Weight 1 · Enabled
                      - paragraph [ref=f1e210]: How well did the agent recognize the customer’s situation and respond with appropriate empathy?
                      - paragraph [ref=f1e211]: 4 levels · Poor → Excellent
                    - button "Edit" [ref=f1e212] [cursor=pointer]
                - article [ref=f1e213]:
                  - generic [ref=f1e214]:
                    - generic [ref=f1e215]: "05"
                    - generic [ref=f1e216]:
                      - strong [ref=f1e217]: Ownership
                      - paragraph [ref=f1e218]: Yes / No · Weight 1 · Enabled
                      - paragraph [ref=f1e219]: Did the agent take responsibility for progressing the customer’s issue rather than simply deflecting it?
                      - paragraph [ref=f1e220]: Yes / No
                    - button "Edit" [ref=f1e221] [cursor=pointer]
                - article [ref=f1e222]:
                  - generic [ref=f1e223]:
                    - generic [ref=f1e224]: "06"
                    - generic [ref=f1e225]:
                      - strong [ref=f1e226]: Resolution
                      - paragraph [ref=f1e227]: Multiple choice · Weight 1.5 · Enabled
                      - paragraph [ref=f1e228]: What is the best description of the issue outcome by the end of the conversation?
                      - paragraph [ref=f1e229]: Fully resolved · Partially resolved · Unresolved · Not applicable
                    - button "Edit" [ref=f1e230] [cursor=pointer]
                - article [ref=f1e231]:
                  - generic [ref=f1e232]:
                    - generic [ref=f1e233]: "07"
                    - generic [ref=f1e234]:
                      - strong [ref=f1e235]: Clear next steps
                      - paragraph [ref=f1e236]: Yes / No · Weight 1 · Enabled
                      - paragraph [ref=f1e237]: Where further action was needed, did the agent state clear next steps? If no further action was needed, answer yes.
                      - paragraph [ref=f1e238]: Yes / No
                    - button "Edit" [ref=f1e239] [cursor=pointer]
                - article [ref=f1e240]:
                  - generic [ref=f1e241]:
                    - generic [ref=f1e242]: "08"
                    - generic [ref=f1e243]:
                      - strong [ref=f1e244]: Professionalism
                      - paragraph [ref=f1e245]: Ordered scale · Weight 1 · Enabled
                      - paragraph [ref=f1e246]: How consistently professional, clear and courteous was the agent’s communication?
                      - paragraph [ref=f1e247]: 4 levels · Poor → Excellent
                    - button "Edit" [ref=f1e248] [cursor=pointer]
                - article [ref=f1e249]:
                  - generic [ref=f1e250]:
                    - generic [ref=f1e251]: "09"
                    - generic [ref=f1e252]:
                      - strong [ref=f1e253]: Appropriate close
                      - paragraph [ref=f1e254]: Yes / No · Weight 1 · Enabled
                      - paragraph [ref=f1e255]: Did the agent close the conversation politely and make clear that the exchange was ending?
                      - paragraph [ref=f1e256]: Yes / No
                    - button "Edit" [ref=f1e257] [cursor=pointer]
              - button "Add question" [ref=f1e259] [cursor=pointer]
        - button "View history" [ref=f1e261] [cursor=pointer]
        - group [ref=f1e262]:
          - generic "Test this form" [ref=f1e263] [cursor=pointer]
          - option "Legacy browser sandbox (development)"
          - option "Durable server sandbox (recommended)" [selected]
          - option "Synthetic" [selected]
          - option "Genesys Cloud"
          - option "Most recent" [selected]
          - option "Deterministic random"
          - option "Manual selection"
```

# Test source

```ts
  38  |    return r.fulfill({json:{items:path==='/api/forms'?state.forms:path==='/api/policies'?state.policies:state.groups}})
  39  |   }
  40  |   if(path.startsWith('/api/forms/')&&method==='PUT'){
  41  |    if(state.failSave)return r.fulfill({status:503,json:{error:'Fixture save failed'}})
  42  |    const item={...r.request().postDataJSON(),name:r.request().postDataJSON().name};state.forms=[...state.forms.filter(f=>f.id!==item.id),item];return r.fulfill({json:{item}})
  43  |   }
  44  |   if(path.startsWith('/api/policies/')&&method==='PUT'){
  45  |    if(state.failSave)return r.fulfill({status:409,json:{error:'Conflict'}})
  46  |    const item={...r.request().postDataJSON(),version:2};delete item.expectedVersion;state.policies=[...state.policies.filter(p=>p.id!==item.id),item];return r.fulfill({json:{item}})
  47  |   }
  48  |   if(path.startsWith('/api/question-groups/')&&method==='PUT'){
  49  |    const item={...r.request().postDataJSON(),updatedAt:'2026-10-02T12:01:00Z'};state.groups=[...state.groups.filter(g=>g.id!==item.id),item];return r.fulfill({json:{item}})
  50  |   }
  51  |   if(method!=='GET')throw Error(`Unexpected write: ${method} ${path}`)
  52  |   return r.fulfill({json:{items:[],byForm:[]}})
  53  |  })
  54  |  await page.goto(connected?`${app}?code=fixture&state=${'A'.repeat(43)}`:`${app}?page=${start}`)
  55  |  if(connected)await expect(page.getByLabel('Current role')).toHaveText('ADMIN')
  56  |  return state
  57  | }
  58  | const localData=(page:Page)=>page.evaluate(()=>Object.fromEntries(['genesys-aqm-v02-forms','genesys-aqm-v02-policies','genesys-aqm-v08-group-assets'].map(key=>[key,localStorage.getItem(key)])))
  59  | for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
  60  |  test(`R05 exact review, saved/local libraries, routing and transitions ${viewport.width}`,async({browser})=>{
  61  |   const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page),before=await localData(page)
  62  |   await expect(page.getByRole('heading',{name:'Saved in AQM · 1 saved form'})).toBeVisible()
  63  |   const primary=page.getByRole('table').first();await expect(primary.getByRole('row').filter({hasText:savedForm.name})).toHaveCount(1)
  64  |   await expect(primary.getByText('General Customer Service',{exact:true})).toHaveCount(0)
  65  |   await expect(page.getByText('Production usage counts use saved policies only.')).toBeVisible()
  66  |   await expect(primary.getByRole('row').filter({hasText:savedForm.name}).locator('td').nth(4)).toHaveText('1')
  67  |   await page.locator('.local-library > summary').click();await expect(page.locator('.local-library').getByText('Local unsaved custom draft',{exact:true})).toBeVisible()
  68  |   await page.getByText('Preserved local copies with saved IDs',{exact:true}).click();await expect(page.getByText('Stale same-ID browser history · local copy')).toBeVisible()
  69  |   await page.screenshot({path:`${evidence}/forms-${viewport.width}.png`,fullPage:true});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`${evidence}/forms-viewport-${viewport.width}.png`})
  70  |   await nav(page,'Question Groups').click();await expect(page.getByRole('heading',{name:'Saved in AQM · 1 saved group'})).toBeVisible()
  71  |   await page.locator('.local-library > summary').click();await expect(page.locator('.local-library').getByText(/Not saved in AQM · local copy/).first()).toBeVisible()
  72  |   await expect(page.getByRole('table').getByText(seedGroupAssets[0].name,{exact:true})).toHaveCount(0)
  73  |   await expect(page.getByRole('row').filter({hasText:savedGroup.name}).locator('td').nth(4)).toHaveText('1');await page.screenshot({path:`${evidence}/groups-${viewport.width}.png`,fullPage:true});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`${evidence}/groups-viewport-${viewport.width}.png`})
  74  |   await nav(page,'Conversation review').click();const routing=page.locator('.evaluation-card')
  75  |   await expect(routing.getByText(savedPolicy.name,{exact:true})).toBeVisible();await expect(routing.getByText('Customer Service Messaging',{exact:true})).toHaveCount(0);await expect(routing.getByText('Cross-channel monitoring sample',{exact:true})).toHaveCount(0)
  76  |   await expect(routing.locator('.assignment')).toHaveCount(1);await expect(routing.getByLabel('Manual form selection').locator('option')).toHaveText([savedForm.name])
  77  |   await page.screenshot({path:`${evidence}/routing-${viewport.width}.png`,fullPage:true});await page.screenshot({path:`${evidence}/routing-viewport-${viewport.width}.png`})
  78  |   expect(await localData(page)).toEqual(before);expect(state.writes).toEqual([])
  79  |   expect(state.reads.filter(p=>p==='/api/policies')).toHaveLength(1);expect(state.reads.filter(p=>p==='/api/forms')).toHaveLength(1);expect(state.reads.filter(p=>p==='/api/question-groups')).toHaveLength(1)
  80  |   await nav(page,'Settings').click();await page.getByRole('button',{name:'Disconnect',exact:true}).click();await nav(page,'Conversation review').click()
  81  |   await expect(routing.getByText('Cross-channel monitoring sample',{exact:true})).toBeVisible();await expect(routing.getByText(savedPolicy.name,{exact:true})).toHaveCount(0)
  82  |   expect(await localData(page)).toEqual(before)
  83  |   await nav(page,'Settings').click();await page.getByRole('button',{name:'Connect to Genesys Cloud',exact:true}).click();await expect(page.getByLabel('Current role')).toHaveText('ADMIN');await nav(page,'Conversation review').click()
  84  |   await expect(routing.getByText(savedPolicy.name,{exact:true})).toBeVisible();await expect(routing.getByText('Cross-channel monitoring sample',{exact:true})).toHaveCount(0)
  85  |   expect(await localData(page)).toEqual(before);expect(state.errors).toEqual([]);await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
  86  |  })
  87  |  test(`shared saves, saved picker, dirty refresh and promotion ${viewport.width}`,async({browser})=>{
  88  |   const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page,'policies')
  89  |   await page.getByRole('button',{name:savedPolicy.name,exact:true}).click();await page.getByLabel('Policy name',{exact:true}).fill('Updated saved routing')
  90  |   state.failSave=true;await page.locator('.policy-detail').getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('alert')).toContainText('changed elsewhere');await expect(page.getByText('Unsaved changes',{exact:true})).toBeVisible()
  91  |   state.failSave=false;await page.locator('.policy-detail').getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByText('Unsaved changes',{exact:true})).toHaveCount(0)
  92  |   await nav(page,'Conversation review').click();await expect(page.locator('.match-list')).toContainText('Updated saved routing')
  93  |   state.forms.push(structuredClone(draftForm));await nav(page,'Evaluation Forms').click();await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('heading',{name:'Saved in AQM · 2 saved forms'})).toBeVisible()
  94  |   await page.getByRole('row').filter({hasText:draftForm.name}).click();const detail=page.locator('.form-detail')
  95  |   await detail.getByLabel('Form name',{exact:true}).fill('Unsaved saved form');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
  96  |   await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(detail.getByLabel('Form name',{exact:true})).toHaveValue('Unsaved saved form')
  97  |   state.fail='/api/forms';await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('alert')).toContainText('Saved forms unavailable');await expect(detail.getByLabel('Form name',{exact:true})).toHaveValue('Unsaved saved form')
  98  |   state.fail='';await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('alert')).toHaveCount(0)
  99  |   await detail.getByRole('button',{name:'Add reusable group',exact:true}).click();const picker=detail.getByRole('generic',{name:'Published reusable groups'})
  100 |   await expect(page.locator('.reusable-picker')).toContainText(savedGroup.name);await expect(page.locator('.reusable-picker').getByText(seedGroupAssets[0].name,{exact:true})).toHaveCount(0)
  101 |   state.failSave=true;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByRole('alert')).toContainText('Fixture save failed');await expect(detail.getByLabel('Form name',{exact:true})).toHaveValue('Unsaved saved form')
  102 |   state.failSave=false;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText('Unsaved changes',{exact:true})).toHaveCount(0)
  103 |   await detail.getByRole('button',{name:'Publish version',exact:true}).click();await expect(detail.getByLabel('Form name',{exact:true})).toHaveCount(0)
  104 |   await nav(page,'Policies').click();await page.getByRole('button',{name:'Updated saved routing',exact:true}).click();await expect(page.getByRole('checkbox',{name:/Unsaved saved form/})).toBeVisible()
  105 |   await nav(page,'Conversation review').click();await expect(page.getByLabel('Manual form selection').locator('option')).toHaveText([savedForm.name,'Unsaved saved form'])
  106 |   await nav(page,'Question Groups').click();await page.locator('.local-library > summary').click();await page.locator('.local-library').getByRole('button',{name:'Save as AQM draft',exact:true}).first().click()
  107 |   const group=page.locator('.asset-detail');await expect(group).toBeVisible();await expect(page.getByRole('heading',{name:'Saved in AQM · 2 saved groups'})).toBeVisible();await group.getByLabel('Reusable question group name',{exact:true}).fill('Imported group B');state.fail='/api/question-groups';await page.getByRole('button',{name:'Refresh saved groups'}).click();await expect(group.getByLabel('Reusable question group name',{exact:true})).toHaveValue('Imported group B');await expect(group.getByText('Unsaved changes',{exact:true})).toBeVisible();state.fail='';await page.getByRole('button',{name:'Refresh saved groups'}).click();await expect(page.getByRole('alert')).toHaveCount(0);await group.getByRole('button',{name:'Publish reusable question group',exact:true}).click();await expect(group.getByLabel('Reusable question group name',{exact:true})).not.toBeEditable()
  108 |   await nav(page,'Evaluation Forms').click();await page.getByRole('row').filter({hasText:'Unsaved saved form'}).click();await openActions(detail);await detail.getByRole('button',{name:'Edit as new version',exact:true}).click();await detail.getByRole('button',{name:'Add reusable group',exact:true}).click();await expect(page.locator('.reusable-picker')).toContainText('Imported group B')
  109 |   await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText('Unsaved changes',{exact:true})).toHaveCount(0)
  110 |   await page.screenshot({path:`${evidence}/picker-${viewport.width}.png`,fullPage:true})
  111 |   await page.getByRole('button',{name:'＋ New form',exact:true}).click();await detail.getByLabel('Form name',{exact:true}).fill('New explicitly saved draft')
  112 |   await detail.getByRole('button',{name:'Add question',exact:true}).click();await detail.getByLabel('Title',{exact:true}).fill('Valid question');await detail.getByLabel('Instructions / question').fill('Was it resolved?')
  113 |   const prior=state.forms.length;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('heading',{name:`Saved in AQM · ${prior+1} saved forms`})).toBeVisible();await expect(page.locator('.local-library').getByRole('button',{name:'New explicitly saved draft',exact:true})).toHaveCount(0)
  114 |   expect(state.errors).toEqual([]);await context.close()
  115 |  })
  116 |  test(`saved endpoint failures and routing loading never show local matches ${viewport.width}`,async({browser})=>{
  117 |   const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page,'evaluate',true,'/api/policies')
  118 |   const routing=page.locator('.evaluation-card');await expect(routing.getByText('Saved routing unavailable',{exact:true})).toBeVisible();await expect(routing.getByRole('alert')).toContainText('Saved policy routing could not be loaded');await expect(routing.locator('.match-list')).toHaveCount(0);await expect(routing.getByLabel('Manual form selection').locator('option')).toHaveText([savedForm.name])
  119 |   await page.screenshot({path:`${evidence}/routing-failure-${viewport.width}.png`,fullPage:true})
  120 |   state.fail='/api/forms';await nav(page,'Evaluation Forms').click();await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('alert').filter({hasText:'Saved forms unavailable'})).toBeVisible();await nav(page,'Conversation review').click();await expect(routing.getByLabel('Manual form selection').locator('option')).toHaveCount(0)
  121 |   state.fail='/api/question-groups';await nav(page,'Question Groups').click();await page.getByRole('button',{name:'Refresh saved groups'}).click();await expect(page.getByRole('alert').filter({hasText:'Saved reusable question groups unavailable'})).toBeVisible()
  122 |   state.fail='';state.delay=true;await nav(page,'Policies').click();await page.getByRole('button',{name:'Refresh durable policies'}).click();await nav(page,'Conversation review').click();await expect(routing.getByRole('status').filter({hasText:'Loading saved routing'})).toBeVisible();await expect(routing.locator('.match-list')).toHaveCount(0)
  123 |   state.release();await expect(routing.getByText(savedPolicy.name,{exact:true})).toBeVisible();expect(state.writes).toEqual([]);expect(state.errors).toEqual([]);await context.close()
  124 |  })
  125 | }
  126 | 
  127 | test('exact voice criteria, missing saved pin, two saved forms and persistent working copies',async({page})=>{
  128 |  await page.setViewportSize({width:1440,height:900})
  129 |  const state=await fixture(page,'forms',true,'',true),before=await localData(page)
  130 |  state.forms.push(structuredClone(draftForm));state.policies[0].criteria.anyOf[0][0].value='voice'
  131 |  await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('heading',{name:'Saved in AQM · 2 saved forms'})).toBeVisible()
  132 |  await expect(page.locator('.local-library > summary')).toHaveText('Local drafts & starter examples · 4 forms')
  133 |  await page.locator('.local-library > summary').click();await expect(page.locator('.local-library').getByText('Not saved in AQM',{exact:false})).not.toHaveCount(0)
  134 |  await page.getByRole('row').filter({hasText:draftForm.name}).click();await page.locator('.form-detail').getByLabel('Form name',{exact:true}).fill('Recovered working draft')
  135 |  page.once('dialog',d=>d.accept());await page.evaluate(()=>{sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fixture-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'forms'}))});await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`)
  136 |  await page.getByRole('row').filter({hasText:'Recovered working draft'}).click();await expect(page.locator('.form-detail').getByLabel('Form name',{exact:true})).toHaveValue('Recovered working draft');await expect(page.locator('.form-detail').getByText('Unsaved changes',{exact:true})).toBeVisible()
  137 |  await page.locator('.form-detail').getByRole('button',{name:'Save changes',exact:true}).click()
> 138 |  await nav(page,'Conversation review').click();await expect(page.getByText('No saved policy matched.',{exact:false})).toBeVisible();await expect(page.locator('.match-list')).toHaveCount(0)
      |                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  139 |  await expect(page.getByLabel('Manual form selection').locator('option')).toHaveText([savedForm.name])
  140 |  await nav(page,'Conversations').click();await page.getByRole('combobox',{name:'Channel',exact:true}).selectOption('voice');await page.getByRole('row').filter({hasText:'syn-billing-dispute'}).click()
  141 |  await expect(page.locator('.match-list')).toContainText('Daily Voice Customer Service AQM');await expect(page.locator('.match-list')).not.toContainText('Customer Service Messaging');await expect(page.locator('.match-list')).not.toContainText('Cross-channel monitoring sample');await page.screenshot({path:`${evidence}/exact-voice-routing.png`,fullPage:true})
  142 |  state.policies[0].evaluationFormIds=['general_service'];await nav(page,'Policies').click();await page.getByRole('button',{name:'Refresh durable policies'}).click();await expect(page.getByRole('button',{name:'Refresh durable policies'})).toBeEnabled();await nav(page,'Conversation review').click()
  143 |  await expect(page.getByRole('alert')).toContainText('missing or non-operational saved forms: general_service');await expect(page.locator('.assignment')).toHaveCount(0)
  144 |  expect(await localData(page)).toEqual(before);expect(state.errors).toEqual([])
  145 | })
  146 | 
  147 | test('failed shared policy refresh retains dirty policy and separate schedule drafts',async({page})=>{
  148 |  const state=await fixture(page,'policies')
  149 |  await page.getByRole('button',{name:savedPolicy.name,exact:true}).click();const detail=page.locator('.policy-detail')
  150 |  await detail.getByLabel('Policy name',{exact:true}).fill('Keep this policy edit');await detail.getByLabel('Automation',{exact:true}).selectOption('DAILY')
  151 |  state.fail='/api/policies';page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Refresh durable policies'}).click()
  152 |  await expect(page.getByRole('alert')).toContainText('Saved policies unavailable');await expect(detail.getByLabel('Policy name',{exact:true})).toHaveValue('Keep this policy edit');await expect(detail.getByLabel('Automation',{exact:true})).toHaveValue('DAILY')
  153 |  await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible();await expect(detail.getByText('Unsaved schedule changes',{exact:true})).toBeVisible();await expect(detail.getByRole('button',{name:'Save changes',exact:true})).toBeDisabled()
  154 |  expect(state.writes).toEqual([]);expect(state.errors).toEqual([])
  155 | })
  156 | 
```