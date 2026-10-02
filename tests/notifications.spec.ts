import { overviewBrowserFixture } from './overviewFixture'
import {test,expect}from'@playwright/test'
import{defaultGovernance,rolePermissions,type Role}from'../src/domain/governance'
import{openAlert}from'../src/domain/operationalAlerts'
const origin='https://aqm-api-bd54ukouga-nw.a.run.app',app='http://127.0.0.1:4174/Genesys-aqm/',now='2026-10-02T12:00:00.000Z'
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])for(const role of ['ADMIN','AUTHOR','REVIEWER','VIEWER'] as Role[])test(`${role} notifications at ${viewport.width}`,async({browser})=>{
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));let destinations:Array<any>=[],rules:Array<any>=[],deliveries:Array<any>=[],sent=0
 const alert=openAlert(undefined,{dedupKey:'failure',type:'SCHEDULED_RUN_FAILED',severity:'ERROR',source:'scheduled-run',title:'Scheduled run failed',message:'Inspect related run.',metadata:{}},now)
 await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fixture-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'settings'})))
 await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}));await page.route('https://api.mypurecloud.ie/**',r=>r.fulfill({json:{id:'fixture',name:'Operator',organization:{id:'fixture-org'}}}));await page.route('https://api.typesafe.ai/**',()=>{throw Error('Paid Jev prohibited')})
 await page.route(`${origin}/**`,async r=>{const u=new URL(r.request().url()),p=u.pathname,m=r.request().method()
  if(p==='/api/overview')return r.fulfill({json:await overviewBrowserFixture({now,notifications:{pending:2,failed24h:1,lastSuccessfulAt:now},alerts:[alert]})})
  if(p==='/api/session')return r.fulfill({json:{actor:{userId:'fixture'},role,permissions:rolePermissions[role],bootstrap:role==='ADMIN'}})
  if(p==='/api/governance')return r.fulfill({json:defaultGovernance})
  if(p==='/api/notifications/destinations')return r.fulfill({json:{items:destinations}})
  if(p==='/api/notifications/rules')return r.fulfill({json:{items:rules}})
  if(p==='/api/notifications/deliveries')return r.fulfill({json:{items:deliveries}})
  if(p.startsWith('/api/notifications/')&&m!=='GET'){
   if(role!=='ADMIN')return r.fulfill({status:403,json:{error:'Forbidden'}})
   if(p.endsWith('/test')){sent++;deliveries=[{id:'test',destinationId:destinations[0].id,event:'TEST',state:'DELIVERED',attemptCount:1,updatedAt:now}];return r.fulfill({status:202,json:{item:deliveries[0]}})}
   const value=r.request().postDataJSON();if(p.includes('/destinations/')){expect(value.configuration.urlSecretRef).toMatch(/^projects\//);destinations=[{...value,configuration:{},configured:true}]}else rules=[value];return r.fulfill({json:{item:value}})
  }
  if(p==='/api/alerts')return r.fulfill({json:{items:[alert]}})
  if(p===`/api/alerts/${alert.id}/notifications`)return r.fulfill({json:{items:[{id:'delivery',destinationName:'Operations webhook',state:'DELIVERED',event:'OPEN',attemptCount:1},{id:'failed',destinationName:'AQM email',state:'FAILED',event:'OPEN',attemptCount:4}]}})
  if(p==='/api/monitoring-health')return r.fulfill({json:{api:'healthy',firestore:'available',genesysAutomation:{status:'verified'},jev:{status:'verified'},scheduler:{status:'healthy'},lastRun:null,nextRunAt:null,runCounts:{completed:1,partial:0,failed:0},openAlertCount:1,errorAlertCount:1,warningAlertCount:0,notifications:{pending:2,failed24h:1,lastSuccessfulAt:now}}})
  return r.fulfill({json:{items:[]}})
 })
 await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
 if(role==='ADMIN'||role==='AUTHOR')await page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Notifications',exact:true}).click()
 const panel=page.getByRole('region',{name:'Notifications',exact:true}),nav=page.getByRole('navigation',{name:'Primary navigation'})
 if(role==='ADMIN'){
  await panel.getByRole('button',{name:'New destination',exact:true}).click();const form=panel.getByRole('form',{name:'Destination form'});await form.getByLabel('Destination name').fill('Operations webhook');await form.getByLabel('Webhook URL secret reference').fill('projects/genesys-aqm-2026/secrets/aqm-notification-test/versions/latest');await form.screenshot({path:`/private/tmp/aqm-v012-destination-${viewport.width}.png`});await form.getByRole('button',{name:'Save destination',exact:true}).click();await expect(panel.getByText('Notification destination saved.')).toBeVisible()
  await panel.getByRole('button',{name:'New rule',exact:true}).click();const ruleForm=panel.getByRole('form',{name:'Rule form'});await ruleForm.getByLabel('Rule name').fill('Critical Operations');await ruleForm.getByLabel('Operations webhook',{exact:true}).check();await ruleForm.getByLabel('Notify on resolution').check();await ruleForm.screenshot({path:`/private/tmp/aqm-v012-rule-${viewport.width}.png`});await ruleForm.getByRole('button',{name:'Save rule',exact:true}).click();await expect(panel.getByText('Notification rule saved.')).toBeVisible();expect(rules[0].notifyOnResolution).toBe(true)
  await panel.getByRole('button',{name:'Send test to Operations webhook'}).click();await expect(panel.getByRole('cell',{name:'DELIVERED',exact:true}).first()).toBeVisible();expect(sent).toBe(1);await panel.screenshot({path:`/private/tmp/aqm-v012-config-${viewport.width}.png`})
 }else if(role==='AUTHOR'){await expect(panel).toBeVisible();await expect(panel.getByRole('button',{name:'New destination'})).toHaveCount(0);await expect(panel.getByRole('button',{name:/Send test/})).toHaveCount(0)}else await expect(panel).toHaveCount(0)
 await page.screenshot({path:`/private/tmp/aqm-v012-${role}-settings-${viewport.width}.png`,fullPage:true});await nav.getByRole('button',{name:'Overview',exact:true}).click();await expect(page.getByText('Notifications: 2 pending · 1 failed (24h)',{exact:false})).toBeVisible();await page.locator('.overview-operations>summary').click();const alerts=page.getByRole('region',{name:'Operational alerts',exact:true});await alerts.getByRole('row').filter({hasText:'Scheduled run failed'}).click();const detail=page.getByRole('region',{name:'Alert detail'});await expect(detail.getByText('Operations webhook — DELIVERED',{exact:false})).toBeVisible();await expect(detail.getByText('AQM email — FAILED · OPEN · 4 attempts')).toBeVisible();await detail.screenshot({path:`/private/tmp/aqm-v012-${role}-alert-${viewport.width}.png`});expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);await context.close()
})
