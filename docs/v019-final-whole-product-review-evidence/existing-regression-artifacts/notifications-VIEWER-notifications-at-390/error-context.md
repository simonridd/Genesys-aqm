# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications.spec.ts >> VIEWER notifications at 390
- Location: tests/notifications.spec.ts:6:164

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('Notifications: 2 pending · 1 failed (24h)')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" getByText('Notifications: 2 pending · 1 failed (24h)') with timeout 5000ms
  - waiting for getByText('Notifications: 2 pending · 1 failed (24h)')
    14 × locator resolved to <p class="field-note">…</p>
       - unexpected value "hidden"

```

```yaml
- complementary:
  - img "IPI"
  - strong: IPI AQM
  - text: Automated Quality Management
  - navigation "Primary navigation":
    - group:
      - text: Monitor / Quality
      - button "Overview"
      - button "Analytics"
      - button "Evaluations"
      - button "Calibration"
    - group: Reference configuration
    - group: Interactions
    - button "Settings"
    - button "About / product tour"
- main:
  - navigation "Breadcrumb":
    - text: Workspace
    - strong: Overview
  - text: VIEWER Jev managed securely by automation service OPERATIONAL HOME
  - heading "Overview" [level=1]
  - paragraph: Quality, coverage and work requiring attention.
  - text: Updated 13:00:00 · Europe/London Dashboard range
  - combobox "Dashboard range":
    - option "7 days" [selected]
    - option "30 days"
  - button "Refresh"
  - region "Attention required":
    - heading "Attention required" [level=2]
    - text: Action needed REVIEW & SYSTEM ATTENTION
    - button "1 error"
    - button "0 escalated reviews"
    - button "0 overdue reviews"
    - button "0 warnings"
    - text: 1 failed notification delivery (24h)
    - button "Error Scheduled run failed Open alert →":
      - text: Error
      - strong: Scheduled run failed
      - text: Open alert →
  - region "Quality and coverage":
    - heading "Quality & coverage" [level=2]
    - text: Last 7 days Average quality
    - button "— →"
    - text: Evaluated conversations
    - strong: "0"
    - text: Evaluations
    - button "0 →"
    - text: Pass rate
    - strong: —
    - text: Critical failure occurrences
    - button "0 →"
    - paragraph: No quality history in this period.
    - heading "Coverage" [level=3]
    - paragraph: Genesys Cloud · Last 7 days · All policies. Quality describes the conversations that were evaluated. Coverage describes how broadly the policy evaluated eligible work.
    - paragraph: 0 interactions considered (Candidates) · 0 met policy criteria
    - list "Coverage funnel":
      - listitem:
        - strong: Eligible
        - text: 0 Met policy criteria
      - listitem:
        - strong: Sampled
        - text: 0 Sampling coverage · of eligible
      - listitem:
        - strong: Content available
        - text: 0 Content availability · of sampled
      - listitem:
        - strong: Evaluated
        - text: 0 Sample completion · of available
    - paragraph:
      - strong: "Evaluation coverage: —"
      - text: · Evaluated / eligible
    - paragraph:
      - text: "Failed evaluation attempts:"
      - strong: "0"
    - paragraph: Coverage totals count observations across monitoring runs. The same conversation may appear in more than one run.
    - button "Explore coverage →"
  - region "Review workload health":
    - heading "Review workload" [level=2]
    - text: Current state Open
    - button "0 →"
    - text: Due soon
    - button "0 →"
    - text: Overdue
    - button "0 →"
    - text: Escalated
    - button "0 →"
    - text: Unassigned
    - button "0 →"
    - button "All review work →"
  - region "Health summary":
    - heading "Operational health" [level=2]
    - text: Automation
    - strong: Attention
    - text: Genesys
    - strong: Unverified
    - text: Jev
    - strong: Unverified
    - text: Scheduler
    - strong: Unverified
    - text: Notifications
    - strong: Failed deliveries
    - text: Review SLA
    - strong: Healthy
    - group: System details
  - region "Upcoming automation":
    - heading "Automation" [level=2]
    - paragraph: 0 completed · 0 partial · 0 failed · 0 running in the last 7 days
    - heading "Last automated run" [level=3]
    - paragraph: No successful automated run recorded yet.
    - heading "Upcoming scheduled work" [level=3]
    - paragraph: "No enabled schedules. Next scheduled run: —"
  - region "Recent runs":
    - heading "Recent runs" [level=2]
    - paragraph: No runs recorded yet.
  - region "Set up automated quality monitoring":
    - heading "Set up automated quality monitoring" [level=2]
    - paragraph: Progress from your saved configuration. An author or administrator can complete configuration.
    - list:
      - listitem: ○ Publish an evaluation form
      - listitem: ○ Create an enabled policy assigning that form
      - listitem: ○ Configure and enable a daily or weekly schedule
      - listitem:
        - text: ○
        - button "Wait for / inspect the first automated run →"
  - group: Run a policy now
  - group: Detailed alerts & run operations
```

# Test source

```ts
  1  | import { overviewBrowserFixture } from './overviewFixture'
  2  | import {test,expect}from'@playwright/test'
  3  | import{defaultGovernance,rolePermissions,type Role}from'../src/domain/governance'
  4  | import{openAlert}from'../src/domain/operationalAlerts'
  5  | const origin='https://aqm-api-bd54ukouga-nw.a.run.app',app='http://127.0.0.1:4174/Genesys-aqm/',now='2026-10-02T12:00:00.000Z'
  6  | for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])for(const role of ['ADMIN','AUTHOR','REVIEWER','VIEWER'] as Role[])test(`${role} notifications at ${viewport.width}`,async({browser})=>{
  7  |  const context=await browser.newContext({viewport}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));let destinations:Array<any>=[],rules:Array<any>=[],deliveries:Array<any>=[],sent=0
  8  |  const alert=openAlert(undefined,{dedupKey:'failure',type:'SCHEDULED_RUN_FAILED',severity:'ERROR',source:'scheduled-run',title:'Scheduled run failed',message:'Inspect related run.',metadata:{}},now)
  9  |  await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fixture-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'settings'})))
  10 |  await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}));await page.route('https://api.mypurecloud.ie/**',r=>r.fulfill({json:{id:'fixture',name:'Operator',organization:{id:'fixture-org'}}}));await page.route('https://api.typesafe.ai/**',()=>{throw Error('Paid Jev prohibited')})
  11 |  await page.route(`${origin}/**`,async r=>{const u=new URL(r.request().url()),p=u.pathname,m=r.request().method()
  12 |   if(p==='/api/overview')return r.fulfill({json:await overviewBrowserFixture({now,notifications:{pending:2,failed24h:1,lastSuccessfulAt:now},alerts:[alert]})})
  13 |   if(p==='/api/session')return r.fulfill({json:{actor:{userId:'fixture'},role,permissions:rolePermissions[role],bootstrap:role==='ADMIN'}})
  14 |   if(p==='/api/governance')return r.fulfill({json:defaultGovernance})
  15 |   if(p==='/api/notifications/destinations')return r.fulfill({json:{items:destinations}})
  16 |   if(p==='/api/notifications/rules')return r.fulfill({json:{items:rules}})
  17 |   if(p==='/api/notifications/deliveries')return r.fulfill({json:{items:deliveries}})
  18 |   if(p.startsWith('/api/notifications/')&&m!=='GET'){
  19 |    if(role!=='ADMIN')return r.fulfill({status:403,json:{error:'Forbidden'}})
  20 |    if(p.endsWith('/test')){sent++;deliveries=[{id:'test',destinationId:destinations[0].id,event:'TEST',state:'DELIVERED',attemptCount:1,updatedAt:now}];return r.fulfill({status:202,json:{item:deliveries[0]}})}
  21 |    const value=r.request().postDataJSON();if(p.includes('/destinations/')){expect(value.configuration.urlSecretRef).toMatch(/^projects\//);destinations=[{...value,configuration:{},configured:true}]}else rules=[value];return r.fulfill({json:{item:value}})
  22 |   }
  23 |   if(p==='/api/alerts')return r.fulfill({json:{items:[alert]}})
  24 |   if(p===`/api/alerts/${alert.id}/notifications`)return r.fulfill({json:{items:[{id:'delivery',destinationName:'Operations webhook',state:'DELIVERED',event:'OPEN',attemptCount:1},{id:'failed',destinationName:'AQM email',state:'FAILED',event:'OPEN',attemptCount:4}]}})
  25 |   if(p==='/api/monitoring-health')return r.fulfill({json:{api:'healthy',firestore:'available',genesysAutomation:{status:'verified'},jev:{status:'verified'},scheduler:{status:'healthy'},lastRun:null,nextRunAt:null,runCounts:{completed:1,partial:0,failed:0},openAlertCount:1,errorAlertCount:1,warningAlertCount:0,notifications:{pending:2,failed24h:1,lastSuccessfulAt:now}}})
  26 |   return r.fulfill({json:{items:[]}})
  27 |  })
  28 |  await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
  29 |  if(role==='ADMIN'||role==='AUTHOR')await page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Notifications',exact:true}).click()
  30 |  const panel=page.getByRole('region',{name:'Notifications',exact:true}),nav=page.getByRole('navigation',{name:'Primary navigation'})
  31 |  if(role==='ADMIN'){
  32 |   await panel.getByRole('button',{name:'New destination',exact:true}).click();const form=panel.getByRole('form',{name:'Destination form'});await form.getByLabel('Destination name').fill('Operations webhook');await form.getByLabel('Webhook URL secret reference').fill('projects/genesys-aqm-2026/secrets/aqm-notification-test/versions/latest');await form.screenshot({path:`/private/tmp/aqm-v012-destination-${viewport.width}.png`});await form.getByRole('button',{name:'Save destination',exact:true}).click();await expect(panel.getByText('Notification destination saved.')).toBeVisible()
  33 |   await panel.getByRole('button',{name:'New rule',exact:true}).click();const ruleForm=panel.getByRole('form',{name:'Rule form'});await ruleForm.getByLabel('Rule name').fill('Critical Operations');await ruleForm.getByLabel('Operations webhook',{exact:true}).check();await ruleForm.getByLabel('Notify on resolution').check();await ruleForm.screenshot({path:`/private/tmp/aqm-v012-rule-${viewport.width}.png`});await ruleForm.getByRole('button',{name:'Save rule',exact:true}).click();await expect(panel.getByText('Notification rule saved.')).toBeVisible();expect(rules[0].notifyOnResolution).toBe(true)
  34 |   await panel.getByRole('button',{name:'Send test to Operations webhook'}).click();await expect(panel.getByRole('cell',{name:'DELIVERED',exact:true}).first()).toBeVisible();expect(sent).toBe(1);await panel.screenshot({path:`/private/tmp/aqm-v012-config-${viewport.width}.png`})
  35 |  }else if(role==='AUTHOR'){await expect(panel).toBeVisible();await expect(panel.getByRole('button',{name:'New destination'})).toHaveCount(0);await expect(panel.getByRole('button',{name:/Send test/})).toHaveCount(0)}else await expect(panel).toHaveCount(0)
> 36 |  await page.screenshot({path:`/private/tmp/aqm-v012-${role}-settings-${viewport.width}.png`,fullPage:true});await nav.getByRole('button',{name:'Overview',exact:true}).click();await expect(page.getByText('Notifications: 2 pending · 1 failed (24h)',{exact:false})).toBeVisible();await page.locator('.overview-operations>summary').click();const alerts=page.getByRole('region',{name:'Operational alerts',exact:true});await alerts.getByRole('row').filter({hasText:'Scheduled run failed'}).click();const detail=page.getByRole('region',{name:'Alert detail'});await expect(detail.getByText('Operations webhook — DELIVERED',{exact:false})).toBeVisible();await expect(detail.getByText('AQM email — FAILED · OPEN · 4 attempts')).toBeVisible();await detail.screenshot({path:`/private/tmp/aqm-v012-${role}-alert-${viewport.width}.png`});expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);await context.close()
     |                                                                                                                                                                                                                                                                        ^ Error: expect(locator).toBeVisible() failed
  37 | })
  38 | 
```