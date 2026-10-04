# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: policy-authoring.spec.ts >> VIEWER can inspect policies and schedule but cannot mutate
- Location: tests/policy-authoring.spec.ts:81:50

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator:  locator('.policy-detail').getByLabel('Policy name')
Expected: disabled
Received: enabled
Timeout:  5000ms

Call log:
  - Expect "toBeDisabled" locator('.policy-detail').getByLabel('Policy name') with timeout 5000ms
  - waiting for locator('.policy-detail').getByLabel('Policy name')
    14 × locator resolved to <input readonly value="Daily Voice fixture"/>
       - unexpected value "enabled"

```

```yaml
- textbox "Policy name": Daily Voice fixture
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
> 83 |  await expect(detail.getByLabel('Policy name')).toBeDisabled();await expect(detail.getByLabel('Automation',{exact:true})).toBeDisabled();await expect(detail.getByRole('button',{name:'View runs'})).toBeEnabled();for(const name of ['Save changes','Duplicate policy','Save schedule','＋ New policy'])await expect(page.getByRole('button',{name,exact:true})).toHaveCount(0);expect(state.mutations).toBe(0)
     |                                                 ^ Error: expect(locator).toBeDisabled() failed
  84 | })
  85 | test('offline sandbox saves locally and never intermingles with connected records',async({page})=>{
  86 |  await page.goto(app);await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Policies',exact:true}).click();await expect(page.getByText(/Local\/demo policy sandbox · saved in this browser only/)).toBeVisible();await page.getByRole('button',{name:'＋ New policy'}).click();const detail=page.locator('.policy-detail');await detail.getByLabel('Policy name').fill('Offline only');await detail.getByLabel('Criteria value').fill('Complaint');await detail.getByRole('button',{name:'Save changes',exact:true}).click();await page.reload();await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Policies',exact:true}).click();await expect(page.getByRole('button',{name:'Offline only',exact:true})).toBeVisible()
  87 | })
  88 | test('connected load failure does not expose local definitions or production mutation controls',async({page})=>{
  89 |  await fixture(page);await page.route(`${origin}/api/policies**`,r=>r.fulfill({status:503,json:{error:'Durable library unavailable'}}));await page.getByRole('button',{name:'Refresh durable policies'}).click();await expect(page.getByRole('alert')).toContainText('Durable library unavailable');await expect(page.getByText('STALE LOCAL MUST NOT MERGE')).toHaveCount(0);await expect(page.getByRole('button',{name:'＋ New policy'})).toHaveCount(0);await expect(page.locator('.policy-detail')).toHaveCount(0)
  90 | })
  91 | 
```