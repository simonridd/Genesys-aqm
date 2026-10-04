import { selectedView,navigateWorkspace } from './workspace-navigation'
import { test,expect,type Page } from '@playwright/test'
import { overviewFixture,overviewNow,overviewAuthority,overviewPolicy } from '../src/fixtures/overviewFixture'
import { operationalOverview } from '../src/server/overview'
import { operationalAnalytics } from '../src/server/analytics'
import { reviewWorkload } from '../src/server/reviewOperations'
import { governanceSettings } from '../src/server/governance'
import { rolePermissions,type Role } from '../src/domain/governance'
import { alertSummary } from '../src/domain/operationalAlerts'
import { matchesReviewQueue } from '../src/domain/reviews'
import { reviewFixture } from '../src/fixtures/reviewFixture'
const app='http://127.0.0.1:4174/Genesys-aqm/',origin='https://aqm-api-bd54ukouga-nw.a.run.app'
const sizes=[{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]
async function setup(page:Page,role:Role='ADMIN',attention=true,returnPage='automation',existing=false){
 const store=await overviewFixture(attention),errors:string[]=[],requests:string[]=[],writes:string[]=[];let unavailable=false,incomplete=false,identityCalls=0
 page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date(overviewNow)})
 await page.addInitScript(({returnPage})=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:returnPage})),{returnPage})
 await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture',token_type:'Bearer',expires_in:3600}}))
 await page.route('https://api.mypurecloud.ie/**',r=>{identityCalls++;expect(r.request().url()).toContain('/users/me');return r.fulfill({json:{id:'admin',name:'Owner',organization:{id:'fixtures'}}})})
 await page.route('https://api.typesafe.ai/**',()=>{throw Error('NO PAID CALLS')})
 if(existing)await page.route('**/src/main.tsx',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('ReactDOM.createRoot',`await (await import('/Genesys-aqm/src/domain/genesysAuth.ts')).completeCallback();\n// Enter the workspace without prescribing an App page; the welcome wrapper owns bare-root entry.\nconst workspaceEntry = new URL(location.href); workspaceEntry.searchParams.set('page',''); history.replaceState(null,'',workspaceEntry);\nReactDOM.createRoot`)})})
 await page.route(`${origin}/**`,async route=>{
  const u=new URL(route.request().url()),p=u.pathname,m=route.request().method();requests.push(p+u.search)
  if(m!=='GET')writes.push(p)
  const json=(v:unknown,status=200)=>route.fulfill({status,json:v})
  if(p==='/api/session')return json({actor:{userId:'admin',displayName:'Owner'},role,permissions:rolePermissions[role],bootstrap:role==='ADMIN'})
  if(p==='/api/governance')return json(await governanceSettings(store))
  if(p==='/api/overview'){
   if(unavailable)return json({error:'Overview temporarily unavailable.'},503)
   const snapshot=await operationalOverview(store,overviewNow,u.searchParams.get('range')==='30'?30:7,overviewAuthority,true)
   snapshot.notifications={complete:true,data:{pending:attention?2:0,failed24h:attention?1:0,lastSuccessfulAt:null}}
   if(incomplete){snapshot.analytics={complete:false,status:'incomplete',reason:'Indexed aggregation required.'};snapshot.reviews={complete:false,status:'unavailable',reason:'Section temporarily unavailable.'}}
   return json(snapshot)
  }
  if(p==='/api/monitoring-health')return json({api:'healthy',firestore:'available',...alertSummary(await store.alerts(true))})
  if(p==='/api/analytics')return json(await operationalAnalytics(store,u.searchParams))
  if(p==='/api/review-workload')return json(await reviewWorkload(store,overviewNow,overviewAuthority))
  if(p==='/api/policies')return json({items:await store.policies()})
  if(p==='/api/forms')return json({items:await store.forms()})
  if(p==='/api/schedules')return json({items:await store.schedules()})
  if(p.startsWith('/api/schedules/'))return json({schedule:(await store.schedules())[0]})
  if(p==='/api/runs')return json({items:(await store.healthSnapshot()).recentRuns})
  if(p.startsWith('/api/runs/'))return json(await store.run(p.split('/').at(-1)!))
  if(p==='/api/alerts')return json({items:await store.alerts(true)})
  if(p.startsWith('/api/alerts/')&&!p.endsWith('/notifications'))return json({item:await store.alert(p.split('/')[3])})
  if(p==='/api/evaluations')return json({items:(await store.evaluations()).filter(r=>matchesReviewQueue(r,u.searchParams,'admin',overviewNow)&&(!u.searchParams.get('critical')||r.criticalFailures.length>0))})
  if(p.startsWith('/api/evaluations/')){const id=p.split('/')[3];return json({...await store.evaluation(id),humanReview:await store.review(id)})}
  if(p.endsWith('/plan')&&m==='POST')return json({fingerprint:'fixture-plan',expectedEvaluations:2,maximumProviderRequests:2,candidateCount:20,eligibleCount:10,sampledCount:2,selected:[{conversationId:'fixture',pendingFormIds:['form']}]})
  if(p.endsWith('/run')&&m==='POST'){expect(route.request().postDataJSON().fingerprint).toBe('fixture-plan');return json({run:{status:'completed'}})}
  if(m!=='GET')throw Error(`Unexpected write ${p}`)
  return json({items:[]})
 })
 await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
 return {store,errors,requests,writes,setIncomplete:()=>{incomplete=true},setUnavailable:()=>{unavailable=true},identityCalls:()=>identityCalls}
}
for(const viewport of sizes)test(`Overview healthy, range, freshness, partial failure at ${viewport.width}`,async({browser})=>{
 const context=await browser.newContext({viewport}),page=await context.newPage(),fixture=await setup(page,'ADMIN',false)
 await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();await expect(page.getByText('No issues requiring attention. No overdue reviews or failed notifications.')).toBeVisible()
 const quality=page.getByRole('region',{name:'Quality summary'}),reviews=page.getByRole('region',{name:'Review work summary'})
 await expect(quality).toContainText('Average quality');await expect(quality).toContainText('80%');await expect(page.getByRole('region',{name:'Coverage summary'})).toContainText('Sampling coverage50%');await expect(page.getByRole('region',{name:'Coverage summary'})).toContainText('Evaluation coverage20%')
 await expect(reviews).toContainText('Unassigned');await expect(page.getByRole('region',{name:'Automation health summary'})).toContainText('Verified')
 const identity=fixture.identityCalls();await page.getByLabel('Dashboard range').selectOption('30');await expect(quality).toContainText('60%');await expect(quality).toContainText('Last 30 days');expect(fixture.identityCalls()).toBe(identity);expect(fixture.writes).toEqual([])
 await page.screenshot({path:`/private/tmp/aqm-v017-healthy-${viewport.width}.png`,fullPage:true})
 await page.getByRole('region',{name:'Upcoming automation'}).getByRole('button',{name:'Run a policy now',exact:true}).click();await page.getByLabel('Server policy').selectOption(overviewPolicy.id)
 await page.getByRole('button',{name:'Build server plan'}).click();await expect(page.getByText('Confirm real Genesys evaluation',{exact:true})).toBeVisible();expect(fixture.writes).toEqual([`/api/policies/${overviewPolicy.id}/plan`])
 await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(page.getByText('Confirm real Genesys evaluation',{exact:true})).toBeVisible();await expect(page.getByLabel('Server policy')).toHaveValue(overviewPolicy.id)
 await page.getByRole('button',{name:'Confirm and execute on server'}).click();await expect(page.getByText('Run completed.',{exact:true})).toBeVisible();expect(fixture.writes).toEqual([`/api/policies/${overviewPolicy.id}/plan`,`/api/policies/${overviewPolicy.id}/run`])
 fixture.setIncomplete();await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(quality).toContainText('Data incomplete');await expect(reviews).toContainText('Unavailable');await expect(page.getByRole('region',{name:'Automation health summary'})).toContainText('Verified');await page.screenshot({path:`/private/tmp/aqm-v017-incomplete-${viewport.width}.png`,fullPage:true})
 fixture.setUnavailable();await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'Showing the last successful snapshot.'})).toBeVisible();expect(fixture.errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
})
for(const viewport of sizes)for(const role of ['ADMIN','AUTHOR','REVIEWER','VIEWER'] as Role[])test(`Overview ${role} attention and drill-through at ${viewport.width}`,async({browser})=>{
 const context=await browser.newContext({viewport}),page=await context.newPage(),fixture=await setup(page,role,true)
 const nav=page.getByRole('navigation',{name:'Primary navigation'}),home=()=>navigateWorkspace(page,'Overview'),attention=page.getByRole('region',{name:'Attention required'}),work=page.getByRole('region',{name:'Review work summary'}),automation=page.getByRole('region',{name:'Upcoming automation'})
 await expect(attention).toContainText('2 errors');await expect(attention).toContainText('1 overdue review');await expect(attention).toContainText('1 failed notification delivery')
 await expect(automation).toContainText('Latest successful scheduled execution.');await expect(automation).toContainText('Next due 3 Oct');await expect(page.getByRole('region',{name:'Recent runs'}).locator('.overview-run')).toHaveCount(3)
 await expect(work.getByRole('button',{name:'My review queue →',exact:true})).toHaveCount(role==='ADMIN'||role==='REVIEWER'?1:0)
 if(role==='VIEWER'||role==='REVIEWER'){await expect(automation.getByRole('button',{name:'Run a policy now',exact:true})).toHaveCount(0);await page.locator('.overview-manual>summary').click();await page.getByLabel('Server policy').selectOption(overviewPolicy.id);await expect(page.getByRole('button',{name:'Build server plan'})).toBeDisabled()}
 await page.screenshot({path:`/private/tmp/aqm-v017-${role}-${viewport.width}.png`,fullPage:true});await page.screenshot({path:`/private/tmp/aqm-v017-${role}-viewport-${viewport.width}.png`})
 await attention.getByRole('button',{name:/Scheduled run failed/}).click();await expect(page.locator('#overview-run-detail')).toContainText('Run manual_recent');await expect(page).toHaveURL(/runId=manual_recent/)
 await attention.getByRole('button',{name:'View all active alerts →'}).click();await page.getByRole('region',{name:'Operational alerts',exact:true}).getByRole('button',{name:/Scheduler activity is stale/}).click();await expect(page.getByRole('region',{name:'Alert detail'})).toContainText('Inspect scheduler')
 await attention.getByRole('button',{name:/Review escalated.*Open review/}).click();await expect(page).toHaveURL(/evaluationId=escalated/);await expect(page.getByRole('region',{name:'Human review',exact:true})).toBeVisible();await home()
 await attention.getByRole('button',{name:'1 overdue review',exact:true}).click();await expect(page).toHaveURL(/due=overdue/);await expect(page.getByLabel('SLA state')).toHaveValue('OVERDUE');await home()
 await page.getByRole('region',{name:'Review work summary'}).locator('.overview-metric').filter({hasText:'Escalated'}).getByRole('button').click();await expect(page.getByLabel('SLA state')).toHaveValue('ESCALATED');await home()
 await page.getByRole('region',{name:'Quality summary'}).locator('.overview-metric').filter({hasText:'Critical failure occurrences'}).getByRole('button').click();await expect(page).toHaveURL(/critical=yes/);await home()
 if(role==='REVIEWER'){await work.getByRole('button',{name:'My review queue →',exact:true}).click();await expect(page).toHaveURL(/reviewQueue=mine/);await home()}
 await page.getByRole('region',{name:'Upcoming automation'}).getByRole('button',{name:/View.*policy/}).first().click();await expect(page.getByRole('heading',{name:'Policies',exact:true})).toBeVisible();await expect(page).toHaveURL(/policyId=daily_voice/);await home()
 await page.getByRole('region',{name:'Coverage summary'}).getByRole('button',{name:'Explore coverage →',exact:true}).click();await expect(page.getByRole('heading',{name:'Quality analytics',exact:true})).toBeVisible();expect(await selectedView(page)).toBe('Coverage');await home()
 expect(fixture.errors).toEqual([]);expect(fixture.writes).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
})
test('existing connected session defaults to Overview before App mounts',async({page})=>{await setup(page,'ADMIN',false,'',true);await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible()})
test('OAuth return-page intent, evaluation deep link and explicit query page win',async({browser})=>{
 for(const returned of ['settings','policies','evaluations']){const page=await browser.newPage();await setup(page,'ADMIN',false,returned);await expect(page.getByRole('heading',{name:returned[0].toUpperCase()+returned.slice(1),exact:true})).toBeVisible();await page.close()}
 const page=await browser.newPage();await page.route(`${origin}/**`,r=>r.fulfill({json:{items:[]}}));await page.goto(`${app}?evaluationId=linked&page=automation`);await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();await page.goto(`${app}?page=policies`);await expect(page.getByRole('heading',{name:'Policies',exact:true})).toBeVisible();await page.goto(app);await expect(page.getByRole('region',{name:'Welcome to IPI AQM'})).toBeVisible();await page.goto(`${app}?page=evaluate`);await expect(page.getByRole('heading',{name:'Conversation review',exact:true})).toBeVisible();await page.goto(`${app}?page=automation`);await expect(page.getByText('Connect to Genesys Cloud to view operational AQM health.')).toBeVisible();await page.close()
})
