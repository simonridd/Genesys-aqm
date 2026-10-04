# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: policy-authoring.spec.ts >> offline sandbox saves locally and never intermingles with connected records
- Location: tests/policy-authoring.spec.ts:85:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Policies', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "IPI AQM home" [ref=e5] [cursor=pointer]:
      - /url: "?page=welcome"
      - img "IPI" [ref=e6]
    - strong [ref=e7]: IPI AQM
    - button "Connect Genesys Cloud" [ref=e8] [cursor=pointer]
  - main [ref=e9]:
    - region "Welcome to IPI AQM" [ref=e10]:
      - generic [ref=e11]:
        - text: Working prototype
        - paragraph [ref=e12]: AUTOMATED QUALITY MANAGEMENT FOR GENESYS CLOUD
        - heading "More conversations understood. Less manual scoring." [level=1] [ref=e13]: More conversations understood.Less manual scoring.
        - paragraph [ref=e14]: Jev answers specific quality questions in predefined formats. AQM turns those answers into transparent scores that people can inspect and challenge.
        - generic [ref=e15]:
          - button "Take the guided demo →" [ref=e16] [cursor=pointer]
          - button "Explore the prototype" [ref=e17] [cursor=pointer]
        - paragraph [ref=e18]: Five minutes · fictional data · no live requests
      - generic [ref=e19]:
        - generic [ref=e20]:
          - heading "From signal to understanding" [level=2] [ref=e21]
          - generic [ref=e22]: Fictional preview
        - paragraph [ref=e23]: Resolution guidance needs a closer look.
        - generic [ref=e24]:
          - generic [ref=e25]:
            - generic [ref=e26]: PREPARED AI ANSWER
            - strong [ref=e27]: Clear next step
          - generic [ref=e28]:
            - text: HUMAN JUDGMENT
            - strong [ref=e29]: Timeline not agreed
        - paragraph [ref=e30]: One conversation. The same published form. A useful disagreement.
        - button "See how calibration works →" [ref=e31] [cursor=pointer]
    - generic [ref=e32]:
      - text: THE OPPORTUNITY
      - heading "Manual review should inform quality. Not be the only way to see it." [level=2] [ref=e33]: Manual review should inform quality.Not be the only way to see it.
      - paragraph [ref=e34]: Increase visibility across selected conversations, investigate the evidence, and use human judgment where it matters. Controlled coverage is a policy decision, not a claim of unlimited capacity.
    - generic [ref=e35]:
      - text: WHY THIS APPROACH
      - heading "Focused decisions. Transparent scoring. Human control." [level=2] [ref=e36]
      - generic [ref=e37]:
        - article [ref=e38]:
          - heading "Ask focused questions" [level=3] [ref=e39]
          - paragraph [ref=e40]: Predefined answer formats evaluate specific criteria, with related questions batched in one request.
        - article [ref=e41]:
          - heading "Apply agreed scoring rules" [level=3] [ref=e42]
          - paragraph [ref=e43]: Weights, critical criteria and exact form versions make the score explainable.
        - article [ref=e44]:
          - heading "Learn from disagreement" [level=3] [ref=e45]
          - paragraph [ref=e46]: Human reviews preserve the original AI result and support calibration.
      - paragraph [ref=e47]:
        - text: Typed answers can still be wrong. Confidence is not measured correctness; calibrate against human judgments.
        - link "Confidence reference" [ref=e48] [cursor=pointer]:
          - /url: https://docs.typesafe.ai/confidence
        - text: · checked 2026-10-03.
    - region "Illustrative cost calculator" [ref=e49]:
      - text: EXPLORE THE ECONOMICS
      - heading "A small model bill. An honest starting point." [level=2] [ref=e50]
      - paragraph [ref=e51]: Structured, batched questions and very low model input cost make broader evaluation economically attractive. This is an illustrative planning estimate — model input cost only.
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]:
            - text: Conversations per month
            - spinbutton "Conversations per month" [ref=e55]: "100000"
            - generic [ref=e56]: 0–1,000,000,000
          - generic [ref=e57]:
            - text: Selected percentage
            - spinbutton "Selected percentage" [ref=e58]: "50"
            - generic [ref=e59]: 0–100%
          - group [ref=e60]:
            - generic "Advanced assumptions" [ref=e61] [cursor=pointer]
        - generic [ref=e62]:
          - text: ESTIMATED JEV MODEL INPUT COST · USD
          - strong [ref=e63]: $16.80/month
          - paragraph [ref=e64]: 50,000 conversations/month selected · 50,000 form evaluations · 50,000 AI requests · 400M input tokens/month.
          - paragraph [ref=e65]: "Current assumptions: 100,000 conversations/month · 50% selected · 1 form(s) per conversation · 1 AI request(s) per form · 8,000 input tokens per request."
          - paragraph [ref=e66]: Input includes transcript and quality questions. Repeated transcript input across conditional requests counts again. Average forms and requests may be fractional planning equivalents.
          - paragraph [ref=e67]:
            - link "Official Jev 1.13 pricing" [ref=e68] [cursor=pointer]:
              - /url: https://docs.typesafe.ai/models
            - text: ": $0.042/M input tokens; output free. Checked 2026-10-03; rates may change."
          - paragraph [ref=e69]:
            - strong [ref=e70]: "Excluded:"
            - text: transcription, Genesys licensing/retrieval, hosting, storage and network costs, retries, taxes and human review. Validate capacity during the pilot.
    - generic [ref=e71]:
      - text: MORE THAN A MODEL DEMONSTRATION
      - heading "A connected quality workflow." [level=2] [ref=e72]
      - generic [ref=e73]:
        - button "The customer case Was Jamie given a clear next step?" [ref=e74] [cursor=pointer]:
          - strong [ref=e75]: The customer case
          - generic [ref=e76]: Was Jamie given a clear next step?
          - generic [aria-hidden] [ref=e77]: →
        - button "Define quality See the agreed questions and scoring rules" [ref=e78] [cursor=pointer]:
          - strong [ref=e79]: Define quality
          - generic [ref=e80]: See the agreed questions and scoring rules
          - generic [aria-hidden] [ref=e81]: →
        - button "Evaluate at scale See Jev’s answers and AQM’s explainable score" [ref=e82] [cursor=pointer]:
          - strong [ref=e83]: Evaluate at scale
          - generic [ref=e84]: See Jev’s answers and AQM’s explainable score
          - generic [aria-hidden] [ref=e85]: →
        - button "Human challenge Compare independent judgments" [ref=e86] [cursor=pointer]:
          - strong [ref=e87]: Human challenge
          - generic [ref=e88]: Compare independent judgments
          - generic [aria-hidden] [ref=e89]: →
        - button "Manage & pilot Turn quality insight into an owned action" [ref=e90] [cursor=pointer]:
          - strong [ref=e91]: Manage & pilot
          - generic [ref=e92]: Turn quality insight into an owned action
          - generic [aria-hidden] [ref=e93]: →
    - generic [ref=e94]:
      - group [ref=e95]:
        - generic "Prototype status & evidence" [ref=e96] [cursor=pointer]
      - link "Plan a pilot →" [ref=e97] [cursor=pointer]:
        - /url: "#pilot"
    - generic [ref=e98]:
      - text: PLAN A PILOT
      - heading "Start narrow. Calibrate. Decide with evidence." [level=2] [ref=e99]
      - list [ref=e100]:
        - listitem [ref=e101]: Agree one queue or use case and an accountable quality lead.
        - listitem [ref=e102]: Choose representative conversations.
        - listitem [ref=e103]: Define the evaluation form.
        - listitem [ref=e104]: Run AI and human comparison.
        - listitem [ref=e105]: Measure quality insight, agreement/calibration, coverage, model cost and reviewer effort.
        - listitem [ref=e106]: Decide whether broader rollout is justified.
      - paragraph [ref=e107]: No booking or contact details are collected.
  - contentinfo [ref=e108]:
    - text: IPI AQM · Decision intelligence powered by Jev
    - button "Connection settings →" [ref=e109] [cursor=pointer]
```

# Test source

```ts
  1  | import { overviewBrowserFixture } from './overviewFixture'
  2  | import { test, expect, type Page } from '@playwright/test'
  3  | import { seedForms } from '../src/domain/forms'
  4  | import { clonePolicy, newPolicy, samePolicyDefinition } from '../src/domain/policyAuthoring'
  5  | import { defaultGovernance, rolePermissions, type Role } from '../src/domain/governance'
  6  | import type { EvaluationForm, InteractionPolicy } from '../src/domain/types'
  7  | import type { Schedule } from '../src/server/schedules'
  8  | const origin='https://aqm-api-bd54ukouga-nw.a.run.app',app='http://127.0.0.1:4174/Genesys-aqm/'
  9  | async function fixture(page:Page,role:Role='AUTHOR'){
  10 |  const forms:EvaluationForm[]=[{...structuredClone(seedForms[0]),id:'exact_v17',familyId:'family',version:17,name:'Service exact',status:'PUBLISHED',enabled:true},{...structuredClone(seedForms[0]),id:'exact_v18',familyId:'family',version:18,name:'Service later',status:'PUBLISHED',enabled:true},{...structuredClone(seedForms[0]),id:'draft',name:'Unpublished fixture',status:'DRAFT',enabled:false}]
  11 |  let policies:InteractionPolicy[]=Array.from({length:22},(_,i)=>({...newPolicy(`p_${String(i).padStart(2,'0')}`),name:i===0?'Daily Voice fixture':`Archive fixture ${i}`,enabled:i%2===1,criteria:{anyOf:[[{field:'channel',operator:'equals',value:'voice'}]]},evaluationFormIds:i===0?['exact_v17']:[],updatedAt:'2026-10-01T09:00:00Z'}))
  12 |  let schedules:Schedule[]=[{id:'original_schedule',policyId:'p_00',enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',version:1,nextDueAt:'2026-10-03T01:00:00Z',lastAttemptedAt:'2026-10-01T01:00:00Z',lastSuccessfulAt:'2026-10-01T01:01:00Z'}]
  13 |  let failure=0,scheduleFailure=false,mutations=0,clones=0,policyPages=0
  14 |  await page.addInitScript(()=>{localStorage.setItem('genesys-aqm-v02-policies',JSON.stringify([{id:'stale_local',name:'STALE LOCAL MUST NOT MERGE',description:'',enabled:true,criteria:{anyOf:[]},evaluationFormIds:[]} ]));sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'policies'}))})
  15 |  await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}))
  16 |  await page.route('https://api.mypurecloud.ie/**',r=>r.fulfill({json:{id:'fixture-user',name:'Fixture'}}))
  17 |  await page.route('https://api.typesafe.ai/**',()=>{throw Error('No Jev calls')})
  18 |  await page.route(`${origin}/**`,async r=>{
  19 |   const request=r.request(),url=new URL(request.url()),path=url.pathname,method=request.method()
  20 |   if(path==='/api/overview')return r.fulfill({json:await overviewBrowserFixture()})
  21 |   if(path==='/api/session')return r.fulfill({json:{actor:{userId:'fixture-user'},role,permissions:rolePermissions[role],bootstrap:false}})
  22 |   if(path==='/api/governance')return r.fulfill({json:defaultGovernance})
  23 |   if(path==='/api/policies'&&method==='GET'){policyPages++;return r.fulfill({json:url.searchParams.get('cursor')?{items:policies.slice(12)}:{items:policies.slice(0,12),nextCursor:'page2'}})}
  24 |   if(path==='/api/forms'&&method==='GET')return r.fulfill({json:{items:forms}})
  25 |   if(path==='/api/schedules'&&method==='GET')return r.fulfill({json:{items:schedules}})
  26 |   if(path.endsWith('/clone')){mutations++;const source=policies.find(p=>p.id===path.split('/')[3])!,item={...clonePolicy(source,`clone_${++clones}`),updatedAt:new Date().toISOString()};policies.push(item);return r.fulfill({json:{item}})}
  27 |   if(path.startsWith('/api/policies/')&&method==='PUT'){
  28 |    mutations++;if(failure)return r.fulfill({status:failure,json:{error:failure===409?'Conflict':'Fixture save unavailable'}})
  29 |    const input=request.postDataJSON(),prior=policies.find(p=>p.id===input.id);expect(input.expectedVersion).toBe(prior?.version??null)
  30 |    const item={...input,version:prior?(prior.version??1)+(samePolicyDefinition(prior,input)?0:1):1,updatedAt:new Date().toISOString()};delete item.expectedVersion;policies=[...policies.filter(p=>p.id!==item.id),item];return r.fulfill({json:{item}})
  31 |   }
  32 |   if(path.startsWith('/api/schedules/')&&method==='PUT'){
  33 |    mutations++;if(scheduleFailure)return r.fulfill({status:503,json:{error:'Fixture schedule unavailable'}})
  34 |    const input=request.postDataJSON(),prior=schedules.find(s=>s.policyId===input.policyId);expect(input.nextDueAt).toBeUndefined();expect(input.lastAttemptedAt).toBeUndefined();expect(input.lastSuccessfulAt).toBeUndefined()
  35 |    const item={...input,nextDueAt:input.frequency==='MANUAL'?undefined:'2026-10-05T01:00:00Z',lastAttemptedAt:prior?.lastAttemptedAt,lastSuccessfulAt:prior?.lastSuccessfulAt};schedules=[...schedules.filter(s=>s.id!==item.id),item];return r.fulfill({json:{item}})
  36 |   }
  37 |   if(path==='/api/monitoring-health')return r.fulfill({json:{api:'healthy',firestore:'available',genesysAutomation:{status:'unverified'},jev:{status:'unverified'},scheduler:{status:'healthy'},lastRun:null,nextRunAt:null,runCounts:{completed:0,partial:0,failed:0}}})
  38 |   return r.fulfill({json:{items:[]}})
  39 |  })
  40 |  await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`)
  41 |  await expect(page.getByRole('heading',{name:'Policies',exact:true})).toBeVisible()
  42 |  await expect(page.getByRole('button',{name:'Daily Voice fixture',exact:true})).toBeVisible()
  43 |  return {get policies(){return policies},get schedules(){return schedules},get mutations(){return mutations},get policyPages(){return policyPages},fail:(status:number)=>{failure=status},failSchedule:(v:boolean)=>{scheduleFailure=v}}
  44 | }
  45 | for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])test(`durable policy authoring and schedules at ${viewport.width}`,async({browser})=>{
  46 |  test.setTimeout(120000)
  47 |  const context=await browser.newContext({viewport}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  48 |  const state=await fixture(page);expect(state.policyPages).toBeGreaterThanOrEqual(2)
  49 |  await expect(page.getByText('STALE LOCAL MUST NOT MERGE')).toHaveCount(0)
  50 |  await expect(page.getByText('Page 1 of 2',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Next →',exact:true}).click();await expect(page.getByText('Page 2 of 2',{exact:true})).toBeVisible()
  51 |  await page.getByLabel('Policy status').selectOption('Enabled');await expect(page.getByText('11 results',{exact:true})).toBeVisible();await page.getByLabel('Policy status').selectOption('All')
  52 |  await page.getByLabel('Policy schedule filter').selectOption('DAILY');await expect(page.getByText('1 results',{exact:true})).toBeVisible();await page.getByLabel('Policy forms filter').selectOption('Assigned');await page.locator('.policies-page').getByLabel('Search table').fill('Daily Voice');await expect(page.getByRole('button',{name:'Daily Voice fixture',exact:true})).toBeVisible();await page.locator('.policies-page').getByLabel('Search table').fill('')
  53 |  await page.getByRole('button',{name:'Daily Voice fixture',exact:true}).click();const detail=page.locator('.policy-detail')
  54 |  await expect(detail.getByText(/Disabled policy with enabled schedule/)).toBeVisible();await expect(detail.getByRole('checkbox',{name:/Service exact · v17/})).toBeChecked();await expect(detail.getByRole('checkbox',{name:/Service later · v18/})).not.toBeChecked();await expect(detail.getByText('Unpublished fixture')).toHaveCount(0)
  55 |  await page.screenshot({path:`/private/tmp/aqm-v014-library-${viewport.width}.png`,fullPage:true})
  56 |  await page.getByLabel('Policy schedule filter').selectOption('All');await page.getByLabel('Policy forms filter').selectOption('All');await page.getByRole('button',{name:'＋ New policy'}).click()
  57 |  await expect(detail.getByText('DURABLE POLICY · v1')).toBeVisible();await expect(detail.getByLabel('Criteria value')).toHaveValue('');await expect(detail.getByLabel('Enabled (requires Save changes)')).not.toBeChecked()
  58 |  await detail.getByLabel('Policy name').fill('Authored voice policy');await detail.getByLabel('Condition field').selectOption('channel');await detail.getByLabel('Criteria value').fill('voice')
  59 |  await detail.getByRole('button',{name:'Add condition',exact:true}).click();await detail.getByLabel('Condition field').nth(1).selectOption('direction');await detail.getByLabel('Criteria value').nth(1).fill('inbound')
  60 |  await detail.getByRole('button',{name:'Add OR group'}).click();await detail.getByLabel('Condition field').nth(2).selectOption('queue');await detail.getByLabel('Criteria value').nth(2).fill('Customer Service');await expect(detail.getByText('Match ALL',{exact:true})).toHaveCount(2)
  61 |  await detail.getByRole('button',{name:'Remove OR group'}).last().click();await detail.getByRole('button',{name:'Remove condition'}).last().click()
  62 |  await detail.getByRole('checkbox',{name:/Service exact · v17/}).check();await detail.getByLabel('Sampling strategy').selectOption('fixed_count');await detail.getByLabel('Fixed count',{exact:true}).fill('3')
  63 |  await expect(detail.getByText('DURABLE POLICY · v1')).toBeVisible();await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
  64 |  state.fail(503);await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Fixture save unavailable');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
  65 |  state.fail(0);await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText(/^Saved .*to server|^Saved \d/)).toBeVisible();const authored=state.policies.find(p=>p.name==='Authored voice policy')!;expect(authored.version).toBe(1);expect(authored.evaluationFormIds).toEqual(['exact_v17'])
  66 |  await detail.getByLabel('Description',{exact:true}).fill('Semantic change');await detail.getByLabel('Enabled (requires Save changes)').check();await expect(detail.getByText('DURABLE POLICY · v1')).toBeVisible()
  67 |  state.fail(409);await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('alert')).toHaveText('This policy changed elsewhere. Refresh before saving.');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
  68 |  state.fail(0);await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText('DURABLE POLICY · v2')).toBeVisible()
  69 |  await detail.getByRole('button',{name:'Duplicate policy'}).click();await expect(detail.getByLabel('Policy name')).toHaveValue('Copy of Authored voice policy');const clone=state.policies.find(p=>p.id.startsWith('clone_'))!;expect(clone.version).toBe(1);expect(clone.enabled).toBe(false);expect(state.schedules.some(s=>s.policyId===clone.id)).toBe(false)
  70 |  await detail.getByLabel('Automation',{exact:true}).selectOption('DAILY');await detail.getByLabel('Local time',{exact:true}).fill('03:15');state.failSchedule(true);await detail.getByRole('button',{name:'Save schedule',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Fixture schedule unavailable');await expect(detail.getByText('Unsaved schedule changes',{exact:true})).toBeVisible();await expect(detail.getByText('Unsaved changes',{exact:true})).toHaveCount(0)
  71 |  state.failSchedule(false);await detail.getByRole('button',{name:'Save schedule',exact:true}).click();await expect(detail.getByText('Schedule matches server',{exact:true})).toBeVisible();expect(state.schedules.find(s=>s.policyId===clone.id)?.frequency).toBe('DAILY');await expect(detail.getByText(/Disabled policy with enabled schedule/)).toBeVisible()
  72 |  await detail.getByLabel('Automation',{exact:true}).selectOption('WEEKLY');await detail.getByLabel('Weekday').selectOption('5');await detail.getByRole('button',{name:'Save schedule',exact:true}).click();expect(state.schedules.find(s=>s.policyId===clone.id)?.weekday).toBe(5)
  73 |  await detail.screenshot({path:`/private/tmp/aqm-v014-detail-${viewport.width}.png`})
  74 |  await detail.getByLabel('Automation',{exact:true}).selectOption('MANUAL');await detail.getByRole('button',{name:'Save schedule',exact:true}).click();expect(state.schedules.find(s=>s.policyId===clone.id)?.enabled).toBe(false);expect(state.schedules.filter(s=>s.policyId===clone.id)).toHaveLength(1)
  75 |  await detail.getByRole('button',{name:'View runs',exact:true}).click();await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();await expect(page).toHaveURL(/page=automation/);expect(new URL(page.url()).searchParams.get('policyId')).toBe(clone.id);await expect(page.getByLabel('Server policy')).toHaveValue(clone.id);await expect(page.getByRole('button',{name:'Publish local forms and policies to server'})).toHaveCount(0);await expect(page.getByRole('button',{name:'Save server schedule'})).toHaveCount(0)
  76 |  await page.getByRole('button',{name:'Edit policy & schedule',exact:true}).click();await expect(detail.getByLabel('Policy name')).toHaveValue(clone.name)
  77 |  await expect(page.getByText(/Daily and weekly scheduling are planned/)).toHaveCount(0)
  78 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
  79 |  expect(errors).toEqual([]);await context.close()
  80 | })
  81 | for(const role of ['VIEWER','REVIEWER'] as const)test(`${role} can inspect policies and schedule but cannot mutate`,async({page})=>{
  82 |  const state=await fixture(page,role);await page.getByRole('button',{name:'Daily Voice fixture',exact:true}).click();const detail=page.locator('.policy-detail')
  83 |  await expect(detail.getByLabel('Policy name')).toBeDisabled();await expect(detail.getByLabel('Automation',{exact:true})).toBeDisabled();await expect(detail.getByRole('button',{name:'View runs'})).toBeEnabled();for(const name of ['Save changes','Duplicate policy','Save schedule','＋ New policy'])await expect(page.getByRole('button',{name,exact:true})).toHaveCount(0);expect(state.mutations).toBe(0)
  84 | })
  85 | test('offline sandbox saves locally and never intermingles with connected records',async({page})=>{
> 86 |  await page.goto(app);await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Policies',exact:true}).click();await expect(page.getByText(/Local\/demo policy sandbox · saved in this browser only/)).toBeVisible();await page.getByRole('button',{name:'＋ New policy'}).click();const detail=page.locator('.policy-detail');await detail.getByLabel('Policy name').fill('Offline only');await detail.getByLabel('Criteria value').fill('Complaint');await detail.getByRole('button',{name:'Save changes',exact:true}).click();await page.reload();await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Policies',exact:true}).click();await expect(page.getByRole('button',{name:'Offline only',exact:true})).toBeVisible()
     |                                                                                                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  87 | })
  88 | test('connected load failure does not expose local definitions or production mutation controls',async({page})=>{
  89 |  await fixture(page);await page.route(`${origin}/api/policies**`,r=>r.fulfill({status:503,json:{error:'Durable library unavailable'}}));await page.getByRole('button',{name:'Refresh durable policies'}).click();await expect(page.getByRole('alert')).toContainText('Durable library unavailable');await expect(page.getByText('STALE LOCAL MUST NOT MERGE')).toHaveCount(0);await expect(page.getByRole('button',{name:'＋ New policy'})).toHaveCount(0);await expect(page.locator('.policy-detail')).toHaveCount(0)
  90 | })
  91 | 
```