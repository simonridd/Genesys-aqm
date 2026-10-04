# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: overview.spec.ts >> OAuth return-page intent, evaluation deep link and explicit query page win
- Location: tests/overview.spec.ts:91:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Conversation review', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Conversation review', exact: true }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Conversation review', exact: true })

```

```yaml
- banner:
  - link "IPI AQM home":
    - /url: "?page=welcome"
    - img "IPI"
  - strong: IPI AQM
  - button "Connect Genesys Cloud"
- main:
  - region "Welcome to IPI AQM":
    - text: Working prototype
    - paragraph: AUTOMATED QUALITY MANAGEMENT FOR GENESYS CLOUD
    - heading "More conversations understood. Less manual scoring." [level=1]
    - paragraph: Jev answers specific quality questions in predefined formats. AQM turns those answers into transparent scores that people can inspect and challenge.
    - button "Take the guided demo →"
    - button "Explore the prototype"
    - paragraph: Five minutes · fictional data · no live requests
    - heading "From signal to understanding" [level=2]
    - text: Fictional preview
    - paragraph: Resolution guidance needs a closer look.
    - text: PREPARED AI ANSWER
    - strong: Clear next step
    - text: HUMAN JUDGMENT
    - strong: Timeline not agreed
    - paragraph: One conversation. The same published form. A useful disagreement.
    - button "See how calibration works →"
  - text: THE OPPORTUNITY
  - heading "Manual review should inform quality. Not be the only way to see it." [level=2]
  - paragraph: Increase visibility across selected conversations, investigate the evidence, and use human judgment where it matters. Controlled coverage is a policy decision, not a claim of unlimited capacity.
  - text: WHY THIS APPROACH
  - heading "Focused decisions. Transparent scoring. Human control." [level=2]
  - article:
    - heading "Ask focused questions" [level=3]
    - paragraph: Predefined answer formats evaluate specific criteria, with related questions batched in one request.
  - article:
    - heading "Apply agreed scoring rules" [level=3]
    - paragraph: Weights, critical criteria and exact form versions make the score explainable.
  - article:
    - heading "Learn from disagreement" [level=3]
    - paragraph: Human reviews preserve the original AI result and support calibration.
  - paragraph:
    - text: Typed answers can still be wrong. Confidence is not measured correctness; calibrate against human judgments.
    - link "Confidence reference":
      - /url: https://docs.typesafe.ai/confidence
    - text: · checked 2026-10-03.
  - region "Illustrative cost calculator":
    - text: EXPLORE THE ECONOMICS
    - heading "A small model bill. An honest starting point." [level=2]
    - paragraph: Structured, batched questions and very low model input cost make broader evaluation economically attractive. This is an illustrative planning estimate — model input cost only.
    - text: Conversations per month
    - spinbutton "Conversations per month": "100000"
    - text: 0–1,000,000,000 Selected percentage
    - spinbutton "Selected percentage": "50"
    - text: 0–100%
    - group: Advanced assumptions
    - text: ESTIMATED JEV MODEL INPUT COST · USD
    - strong: $16.80/month
    - paragraph: 50,000 conversations/month selected · 50,000 form evaluations · 50,000 AI requests · 400M input tokens/month.
    - paragraph: "Current assumptions: 100,000 conversations/month · 50% selected · 1 form(s) per conversation · 1 AI request(s) per form · 8,000 input tokens per request."
    - paragraph: Input includes transcript and quality questions. Repeated transcript input across conditional requests counts again. Average forms and requests may be fractional planning equivalents.
    - paragraph:
      - link "Official Jev 1.13 pricing":
        - /url: https://docs.typesafe.ai/models
      - text: ": $0.042/M input tokens; output free. Checked 2026-10-03; rates may change."
    - paragraph:
      - strong: "Excluded:"
      - text: transcription, Genesys licensing/retrieval, hosting, storage and network costs, retries, taxes and human review. Validate capacity during the pilot.
  - text: MORE THAN A MODEL DEMONSTRATION
  - heading "A connected quality workflow." [level=2]
  - button "The customer case Was Jamie given a clear next step?":
    - strong: The customer case
    - text: Was Jamie given a clear next step?
  - button "Define quality See the agreed questions and scoring rules":
    - strong: Define quality
    - text: See the agreed questions and scoring rules
  - button "Evaluate at scale See Jev’s answers and AQM’s explainable score":
    - strong: Evaluate at scale
    - text: See Jev’s answers and AQM’s explainable score
  - button "Human challenge Compare independent judgments":
    - strong: Human challenge
    - text: Compare independent judgments
  - button "Manage & pilot Turn quality insight into an owned action":
    - strong: Manage & pilot
    - text: Turn quality insight into an owned action
  - group: Prototype status & evidence
  - link "Plan a pilot →":
    - /url: "#pilot"
  - text: PLAN A PILOT
  - heading "Start narrow. Calibrate. Decide with evidence." [level=2]
  - list:
    - listitem: Agree one queue or use case and an accountable quality lead.
    - listitem: Choose representative conversations.
    - listitem: Define the evaluation form.
    - listitem: Run AI and human comparison.
    - listitem: Measure quality insight, agreement/calibration, coverage, model cost and reviewer effort.
    - listitem: Decide whether broader rollout is justified.
  - paragraph: No booking or contact details are collected.
- contentinfo:
  - text: IPI AQM · Decision intelligence powered by Jev
  - button "Connection settings →"
```

# Test source

```ts
  1  | import { selectedView,navigateWorkspace } from './workspace-navigation'
  2  | import { test,expect,type Page } from '@playwright/test'
  3  | import { overviewFixture,overviewNow,overviewAuthority,overviewPolicy } from '../src/fixtures/overviewFixture'
  4  | import { operationalOverview } from '../src/server/overview'
  5  | import { operationalAnalytics } from '../src/server/analytics'
  6  | import { reviewWorkload } from '../src/server/reviewOperations'
  7  | import { governanceSettings } from '../src/server/governance'
  8  | import { rolePermissions,type Role } from '../src/domain/governance'
  9  | import { alertSummary } from '../src/domain/operationalAlerts'
  10 | import { matchesReviewQueue } from '../src/domain/reviews'
  11 | import { reviewFixture } from '../src/fixtures/reviewFixture'
  12 | const app='http://127.0.0.1:4174/Genesys-aqm/',origin='https://aqm-api-bd54ukouga-nw.a.run.app'
  13 | const sizes=[{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]
  14 | async function setup(page:Page,role:Role='ADMIN',attention=true,returnPage='automation',existing=false){
  15 |  const store=await overviewFixture(attention),errors:string[]=[],requests:string[]=[],writes:string[]=[];let unavailable=false,incomplete=false,identityCalls=0
  16 |  page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date(overviewNow)})
  17 |  await page.addInitScript(({returnPage})=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:returnPage})),{returnPage})
  18 |  await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture',token_type:'Bearer',expires_in:3600}}))
  19 |  await page.route('https://api.mypurecloud.ie/**',r=>{identityCalls++;expect(r.request().url()).toContain('/users/me');return r.fulfill({json:{id:'admin',name:'Owner',organization:{id:'fixtures'}}})})
  20 |  await page.route('https://api.typesafe.ai/**',()=>{throw Error('NO PAID CALLS')})
  21 |  if(existing)await page.route('**/src/main.tsx',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('ReactDOM.createRoot',`await (await import('/Genesys-aqm/src/domain/genesysAuth.ts')).completeCallback();\nReactDOM.createRoot`)})})
  22 |  await page.route(`${origin}/**`,async route=>{
  23 |   const u=new URL(route.request().url()),p=u.pathname,m=route.request().method();requests.push(p+u.search)
  24 |   if(m!=='GET')writes.push(p)
  25 |   const json=(v:unknown,status=200)=>route.fulfill({status,json:v})
  26 |   if(p==='/api/session')return json({actor:{userId:'admin',displayName:'Owner'},role,permissions:rolePermissions[role],bootstrap:role==='ADMIN'})
  27 |   if(p==='/api/governance')return json(await governanceSettings(store))
  28 |   if(p==='/api/overview'){
  29 |    if(unavailable)return json({error:'Overview temporarily unavailable.'},503)
  30 |    const snapshot=await operationalOverview(store,overviewNow,u.searchParams.get('range')==='30'?30:7,overviewAuthority,true)
  31 |    snapshot.notifications={complete:true,data:{pending:attention?2:0,failed24h:attention?1:0,lastSuccessfulAt:null}}
  32 |    if(incomplete){snapshot.analytics={complete:false,status:'incomplete',reason:'Indexed aggregation required.'};snapshot.reviews={complete:false,status:'unavailable',reason:'Section temporarily unavailable.'}}
  33 |    return json(snapshot)
  34 |   }
  35 |   if(p==='/api/monitoring-health')return json({api:'healthy',firestore:'available',...alertSummary(await store.alerts(true))})
  36 |   if(p==='/api/analytics')return json(await operationalAnalytics(store,u.searchParams))
  37 |   if(p==='/api/review-workload')return json(await reviewWorkload(store,overviewNow,overviewAuthority))
  38 |   if(p==='/api/policies')return json({items:await store.policies()})
  39 |   if(p==='/api/forms')return json({items:await store.forms()})
  40 |   if(p==='/api/schedules')return json({items:await store.schedules()})
  41 |   if(p.startsWith('/api/schedules/'))return json({schedule:(await store.schedules())[0]})
  42 |   if(p==='/api/runs')return json({items:(await store.healthSnapshot()).recentRuns})
  43 |   if(p.startsWith('/api/runs/'))return json(await store.run(p.split('/').at(-1)!))
  44 |   if(p==='/api/alerts')return json({items:await store.alerts(true)})
  45 |   if(p.startsWith('/api/alerts/')&&!p.endsWith('/notifications'))return json({item:await store.alert(p.split('/')[3])})
  46 |   if(p==='/api/evaluations')return json({items:(await store.evaluations()).filter(r=>matchesReviewQueue(r,u.searchParams,'admin',overviewNow)&&(!u.searchParams.get('critical')||r.criticalFailures.length>0))})
  47 |   if(p.startsWith('/api/evaluations/')){const id=p.split('/')[3];return json({...await store.evaluation(id),humanReview:await store.review(id)})}
  48 |   if(p.endsWith('/plan')&&m==='POST')return json({fingerprint:'fixture-plan',expectedEvaluations:2,maximumProviderRequests:2,candidateCount:20,eligibleCount:10,sampledCount:2,selected:[{conversationId:'fixture',pendingFormIds:['form']}]})
  49 |   if(p.endsWith('/run')&&m==='POST'){expect(route.request().postDataJSON().fingerprint).toBe('fixture-plan');return json({run:{status:'completed'}})}
  50 |   if(m!=='GET')throw Error(`Unexpected write ${p}`)
  51 |   return json({items:[]})
  52 |  })
  53 |  await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
  54 |  return {store,errors,requests,writes,setIncomplete:()=>{incomplete=true},setUnavailable:()=>{unavailable=true},identityCalls:()=>identityCalls}
  55 | }
  56 | for(const viewport of sizes)test(`Overview healthy, range, freshness, partial failure at ${viewport.width}`,async({browser})=>{
  57 |  const context=await browser.newContext({viewport}),page=await context.newPage(),fixture=await setup(page,'ADMIN',false)
  58 |  await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();await expect(page.getByText('No issues requiring attention. No overdue reviews or failed notifications.')).toBeVisible()
  59 |  const quality=page.getByRole('region',{name:'Quality and coverage'}),reviews=page.getByRole('region',{name:'Review workload health'})
  60 |  await expect(quality).toContainText('Average quality');await expect(quality).toContainText('80%');await expect(quality).toContainText('50% · Sampling coverage · of eligible');await expect(quality).toContainText('Evaluation coverage: 20%')
  61 |  await expect(reviews).toContainText('Unassigned');await expect(page.getByRole('region',{name:'Health summary'})).toContainText('Verified')
  62 |  const identity=fixture.identityCalls();await page.getByLabel('Dashboard range').selectOption('30');await expect(quality).toContainText('60%');await expect(quality).toContainText('Last 30 days');expect(fixture.identityCalls()).toBe(identity);expect(fixture.writes).toEqual([])
  63 |  await page.screenshot({path:`/private/tmp/aqm-v017-healthy-${viewport.width}.png`,fullPage:true})
  64 |  await page.getByRole('region',{name:'Upcoming automation'}).getByRole('button',{name:'Run a policy now',exact:true}).click();await page.getByLabel('Server policy').selectOption(overviewPolicy.id)
  65 |  await page.getByRole('button',{name:'Build server plan'}).click();await expect(page.getByText('Confirm real Genesys evaluation',{exact:true})).toBeVisible();expect(fixture.writes).toEqual([`/api/policies/${overviewPolicy.id}/plan`])
  66 |  await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(page.getByText('Confirm real Genesys evaluation',{exact:true})).toBeVisible();await expect(page.getByLabel('Server policy')).toHaveValue(overviewPolicy.id)
  67 |  await page.getByRole('button',{name:'Confirm and execute on server'}).click();await expect(page.getByText('Run completed.',{exact:true})).toBeVisible();expect(fixture.writes).toEqual([`/api/policies/${overviewPolicy.id}/plan`,`/api/policies/${overviewPolicy.id}/run`])
  68 |  fixture.setIncomplete();await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(quality).toContainText('Data incomplete');await expect(reviews).toContainText('Unavailable');await expect(page.getByRole('region',{name:'Health summary'})).toContainText('Verified');await page.screenshot({path:`/private/tmp/aqm-v017-incomplete-${viewport.width}.png`,fullPage:true})
  69 |  fixture.setUnavailable();await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'Showing the last successful snapshot.'})).toBeVisible();expect(fixture.errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
  70 | })
  71 | for(const viewport of sizes)for(const role of ['ADMIN','AUTHOR','REVIEWER','VIEWER'] as Role[])test(`Overview ${role} attention and drill-through at ${viewport.width}`,async({browser})=>{
  72 |  const context=await browser.newContext({viewport}),page=await context.newPage(),fixture=await setup(page,role,true)
  73 |  const nav=page.getByRole('navigation',{name:'Primary navigation'}),home=()=>navigateWorkspace(page,'Overview'),attention=page.getByRole('region',{name:'Attention required'}),work=page.getByRole('region',{name:'Review workload health'}),automation=page.getByRole('region',{name:'Upcoming automation'})
  74 |  await expect(attention).toContainText('2 errors');await expect(attention).toContainText('1 overdue review');await expect(attention).toContainText('1 failed notification delivery')
  75 |  await expect(automation).toContainText('Latest successful scheduled execution.');await expect(automation).toContainText('Next due 3 Oct');await expect(page.getByRole('region',{name:'Recent runs'}).locator('.overview-run')).toHaveCount(3)
  76 |  await expect(work.getByRole('button',{name:'My review queue →',exact:true})).toHaveCount(role==='ADMIN'||role==='REVIEWER'?1:0)
  77 |  if(role==='VIEWER'||role==='REVIEWER'){await expect(automation.getByRole('button',{name:'Run a policy now',exact:true})).toHaveCount(0);await page.locator('.overview-manual>summary').click();await page.getByLabel('Server policy').selectOption(overviewPolicy.id);await expect(page.getByRole('button',{name:'Build server plan'})).toBeDisabled()}
  78 |  await page.screenshot({path:`/private/tmp/aqm-v017-${role}-${viewport.width}.png`,fullPage:true});await page.screenshot({path:`/private/tmp/aqm-v017-${role}-viewport-${viewport.width}.png`})
  79 |  await attention.getByRole('button',{name:/Scheduled run failed/}).click();await expect(page.locator('#overview-run-detail')).toContainText('Run manual_recent');await expect(page).toHaveURL(/runId=manual_recent/)
  80 |  await attention.getByRole('button',{name:/Scheduler activity is stale/}).click();await expect(page.getByRole('region',{name:'Alert detail'})).toContainText('Inspect scheduler')
  81 |  await attention.getByRole('button',{name:/Review escalated.*Open review/}).click();await expect(page).toHaveURL(/evaluationId=escalated/);await expect(page.getByRole('region',{name:'Human review',exact:true})).toBeVisible();await home()
  82 |  await attention.getByRole('button',{name:'1 overdue review',exact:true}).click();await expect(page).toHaveURL(/due=overdue/);await expect(page.getByLabel('SLA state')).toHaveValue('OVERDUE');await home()
  83 |  await page.getByRole('region',{name:'Review workload health'}).locator('.overview-metric').filter({hasText:'Escalated'}).getByRole('button').click();await expect(page.getByLabel('SLA state')).toHaveValue('ESCALATED');await home()
  84 |  await page.getByRole('region',{name:'Quality and coverage'}).locator('.overview-metric').filter({hasText:'Critical failure occurrences'}).getByRole('button').click();await expect(page).toHaveURL(/critical=yes/);await home()
  85 |  if(role==='REVIEWER'){await work.getByRole('button',{name:'My review queue →',exact:true}).click();await expect(page).toHaveURL(/reviewQueue=mine/);await home()}
  86 |  await page.getByRole('region',{name:'Upcoming automation'}).getByRole('button',{name:/View.*policy/}).first().click();await expect(page.getByRole('heading',{name:'Policies',exact:true})).toBeVisible();await expect(page).toHaveURL(/policyId=daily_voice/);await home()
  87 |  await page.getByRole('region',{name:'Quality and coverage'}).getByRole('button',{name:'Explore coverage →',exact:true}).click();await expect(page.getByRole('heading',{name:'Quality analytics',exact:true})).toBeVisible();expect(await selectedView(page)).toBe('Coverage');await home()
  88 |  expect(fixture.errors).toEqual([]);expect(fixture.writes).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
  89 | })
  90 | test('existing connected session defaults to Overview before App mounts',async({page})=>{await setup(page,'ADMIN',false,'',true);await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible()})
  91 | test('OAuth return-page intent, evaluation deep link and explicit query page win',async({browser})=>{
  92 |  for(const returned of ['settings','policies','evaluations']){const page=await browser.newPage();await setup(page,'ADMIN',false,returned);await expect(page.getByRole('heading',{name:returned[0].toUpperCase()+returned.slice(1),exact:true})).toBeVisible();await page.close()}
> 93 |  const page=await browser.newPage();await page.route(`${origin}/**`,r=>r.fulfill({json:{items:[]}}));await page.goto(`${app}?evaluationId=linked&page=automation`);await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();await page.goto(`${app}?page=policies`);await expect(page.getByRole('heading',{name:'Policies',exact:true})).toBeVisible();await page.goto(app);await expect(page.getByRole('heading',{name:'Conversation review',exact:true})).toBeVisible();await page.goto(`${app}?page=automation`);await expect(page.getByText('Connect to Genesys Cloud to view operational AQM health.')).toBeVisible();await page.close()
     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ^ Error: expect(locator).toBeVisible() failed
  94 | })
  95 | 
```