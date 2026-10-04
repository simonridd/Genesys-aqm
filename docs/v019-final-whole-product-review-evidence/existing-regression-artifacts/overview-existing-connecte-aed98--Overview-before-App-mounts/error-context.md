# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: overview.spec.ts >> existing connected session defaults to Overview before App mounts
- Location: tests/overview.spec.ts:90:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByLabel('Current role')
Expected: "ADMIN"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByLabel('Current role') with timeout 5000ms
  - waiting for getByLabel('Current role')

```

```yaml
- complementary:
  - img "IPI"
  - strong: IPI AQM
  - text: Automated Quality Management
  - navigation "Primary navigation":
    - group:
      - text: Interactions
      - button "Conversations"
    - group: Monitor / Quality
    - group: Configuration
    - button "Settings"
    - button "About / product tour"
  - text: ✦
  - strong: Decision intelligence powered by Jev
  - paragraph: Typed AI decisions, shaped into clear quality signals.
  - text: V0.19D SHOWCASE • 2026
- main:
  - navigation "Breadcrumb":
    - text: Workspace
    - strong: Conversation review
  - text: Connect Genesys Cloud
  - strong: Conversation source
  - text: Fictional sample data · no credentials
  - button "Synthetic"
  - button "Genesys Cloud"
  - text: AUTOMATED QUALITY MANAGEMENT
  - heading "Conversation review" [level=1]
  - paragraph: Inspect the selected conversation, policy matches, and applicable forms.
  - button "← Back to conversations"
  - button "Browse 19 samples →"
  - text: CURRENT CONVERSATION
  - heading "Duplicate payment" [level=2]
  - text: SYNTHETIC SAMPLE
  - button "Change conversation"
  - button "↑ Upload JSON"
  - button "Upload conversation JSON"
  - region "Conversation transcript":
    - text: MP CONVERSATION TRANSCRIPT
    - heading "Maya Patel with Alex Morgan" [level=2]
    - text: 29 Sept 2026 · messaging · conv-billing-001 Closed queue
    - strong: Customer Service
    - text: topic
    - strong: Billing
    - text: direction
    - strong: inbound
    - text: Messages
    - strong: "11"
    - text: 29 Sept 2026 M
    - strong: Maya Patel
    - time: 09:00
    - text: Hi, I think I've been charged twice for my September plan. Could you take a look? A
    - strong: Alex Morgan
    - time: 09:00
    - text: Hi Maya, you're through to Alex. I'm sorry to hear about the duplicate charge. I'll help you check it. A
    - strong: Alex Morgan
    - time: 09:00
    - text: Before we discuss your account, could you confirm the last four digits of the phone number on it? M
    - strong: Maya Patel
    - time: 09:00
    - text: Sure, 4821. A
    - strong: Alex Morgan
    - time: 09:01
    - text: Thank you, that's verified. I can see two payments of £29 on 27 September. One was a duplicate and has not yet been refunded. M
    - strong: Maya Patel
    - time: 09:01
    - text: That's a relief. I was worried I'd have to dispute it with my bank. A
    - strong: Alex Morgan
    - time: 09:01
    - text: I understand the concern. I've submitted a refund for the extra £29 payment. It should return to the same card within five working days. M
    - strong: Maya Patel
    - time: 09:01
    - text: Great, will I receive a confirmation? A
    - strong: Alex Morgan
    - time: 09:02
    - text: Yes. A confirmation email will be sent today. If the refund hasn't appeared after five working days, reply to that email and quote reference REF-2048. Is there anything else I can help with? M
    - strong: Maya Patel
    - time: 09:02
    - text: No, that's everything. Thanks for sorting it out. A
    - strong: Alex Morgan
    - time: 09:02
    - text: You're welcome, Maya. Thanks for getting in touch, and have a good day. End of conversation · 11 messages
  - text: POLICY ROUTING 2 matches
  - heading "Applicable evaluations" [level=2]
  - strong: Customer Service Messaging
  - text: channel equals messaging AND queue equals Customer Service
  - strong: Cross-channel monitoring sample
  - text: channel equals messaging
  - button "General Customer Service 9 questions · v1 · up to 1 Jev requests Evaluate →":
    - strong: General Customer Service
    - text: 9 questions · v1 · up to 1 Jev requests Evaluate →
  - button "Compliance & Identity Verification 5 questions · v1 · up to 1 Jev requests Evaluate →":
    - strong: Compliance & Identity Verification
    - text: 5 questions · v1 · up to 1 Jev requests Evaluate →
  - text: Manual form selection
  - combobox "Manual form selection":
    - option "General Customer Service" [selected]
    - option "Compliance & Identity Verification"
    - option "Complaints Handling"
    - option "Retention / Cancellation"
    - option "Sales / Service Quality"
    - option "Customer Service - AI Scoring"
  - paragraph: 1 form evaluation · up to 1 Jev requests
  - button "✦ Evaluate selected form →"
  - paragraph: Production selection includes only published, valid forms . Draft and testing forms can be tested in the isolated sandbox.
  - button "Test a draft/testing form"
  - paragraph: Connect Genesys Cloud to evaluate this conversation.
  - text: ◎
  - strong: One result per form
  - paragraph: Each production evaluation is saved to the automation service with its exact published form and routing provenance.
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
> 53 |  await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
     |                                                                                                               ^ Error: expect(locator).toHaveText(expected) failed
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
  93 |  const page=await browser.newPage();await page.route(`${origin}/**`,r=>r.fulfill({json:{items:[]}}));await page.goto(`${app}?evaluationId=linked&page=automation`);await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();await page.goto(`${app}?page=policies`);await expect(page.getByRole('heading',{name:'Policies',exact:true})).toBeVisible();await page.goto(app);await expect(page.getByRole('heading',{name:'Conversation review',exact:true})).toBeVisible();await page.goto(`${app}?page=automation`);await expect(page.getByText('Connect to Genesys Cloud to view operational AQM health.')).toBeVisible();await page.close()
  94 | })
  95 | 
```