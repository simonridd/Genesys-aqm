import {test,expect,type Page,type Locator} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'
import {summarize,summarizeCoverage} from '../src/domain/analytics'
import {firstScanFixture} from './overviewFirstScanFixture'
import {navigateWorkspace} from './workspace-navigation'
const out='docs/v020e-evidence';mkdirSync(out,{recursive:true})
const region=(page:Page,name:string)=>page.getByRole('region',{name,exact:true})
const metric=(p:Locator,label:string)=>p.locator('.overview-metric').filter({has:p.page().getByText(label,{exact:true})})
async function refresh(page:Page){await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(page.getByRole('button',{name:'Refresh',exact:true})).toBeEnabled()}
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844},{width:1440,height:720}])test(`goal-only first scan ${viewport.width}x${viewport.height}`,async({page})=>{
 await page.setViewportSize(viewport);const f=await firstScanFixture(page),trace:unknown[]=[]
 const goal='Tell me what needs attention, how quality and coverage look, how much review work is open, and whether the automation is healthy.'
 await page.evaluate(()=>scrollTo(0,0))
 for(const [name,answers] of [['Attention required',['2 critical failure occurrences','2 errors','3 warnings','1 overdue review','1 escalated review','1 failed notification delivery']],['Quality summary',['79%','Evaluations8','Pass rate75%']],['Coverage summary',['Eligible20','Sampled10','Content available6','Evaluated4','Failed evaluation attempts2','20%']],['Review work summary',['Open7','Due soon1','Overdue1','Escalated1','Unassigned1']],['Automation health summary',['Attention','Healthy','Error','Escalated']]] as const){
  const r=region(page,name);for(const answer of answers)await expect(r).toContainText(answer)
  // Read visible headings/signals, scrolling only when the evidence extends past the viewport.
  const box=await r.boundingBox();if(box&&box.y+box.height>viewport.height)await r.scrollIntoViewIfNeeded()
  trace.push({region:name,scrollY:await page.evaluate(()=>scrollY),answers:await r.innerText()})
 }
 expect(await page.locator('.overview-first-scan details[open],.overview-coverage-detail[open]').count()).toBe(0)
 writeFileSync(`${out}/goal-${viewport.width}x${viewport.height}.json`,JSON.stringify({goal,trace,clicks:0,wrongTurns:0,disclosuresOpened:0,method:'Scripted goal replay from visible headings and evidence; no independent human participant or timed usability claim'},null,2))
 const regions=await page.locator('.overview-summary-card').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')))
 expect(regions).toEqual(['Quality summary','Coverage summary','Review work summary','Automation health summary'])
 const health=await region(page,'Automation health summary').boundingBox(),trend=await region(page,'Quality detail').boundingBox();expect(health!.y+health!.height).toBeLessThan(trend!.y)
 expect(f.writes).toEqual([]);expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
})
test('independent unavailable analytics, unavailable reviews, zero data, healthy state and stale refresh',async({page})=>{
 const f=await firstScanFixture(page),quality=region(page,'Quality summary'),coverage=region(page,'Coverage summary'),reviews=region(page,'Review work summary'),health=region(page,'Automation health summary')
 f.setSnapshot(s=>{s.analytics={complete:false,status:'unavailable',reason:'Fixture'};return s});await refresh(page)
 await expect(quality).toContainText('Unavailable');await expect(coverage).toContainText('Unavailable');await expect(reviews).toContainText('Open7');await expect(health).toContainText('Healthy')
 f.setSnapshot(s=>{s.reviews={complete:false,status:'unavailable',reason:'Fixture'};return s});await refresh(page)
 await expect(quality).toContainText('79%');await expect(coverage).toContainText('Eligible20');await expect(reviews).toContainText('Unavailable');await expect(reviews.locator('.overview-metric')).toHaveCount(0)
 await expect(health).toContainText('Review SLAUnavailable')
 f.setSnapshot(s=>{if(s.analytics.complete){s.analytics.data.quality=summarize([]);s.analytics.data.qualityTrend=[];s.analytics.data.coverage=summarizeCoverage([])}return s});await refresh(page)
 await expect(quality).toContainText('Evaluations0');await expect(quality).not.toContainText('Unavailable');await expect(coverage).toContainText('Eligible0');await expect(coverage).not.toContainText('Unavailable');await expect(region(page,'Quality detail')).toContainText('No quality history in this period.')
 f.setSnapshot(s=>{if(s.analytics.complete)s.analytics.data.quality.criticalFailures=0;s.reviews={complete:true,data:{open:0,dueSoon:0,overdue:0,escalated:0,unassigned:0}};s.alerts={complete:true,data:{openAlerts:0,errors:0,warnings:0,items:[]}};s.notifications={complete:true,data:{pending:0,failed24h:0,lastSuccessfulAt:s.generatedAt}};if(s.health.complete){s.health.data.genesysAutomation.status='verified';s.health.data.jev.status='verified';s.health.data.scheduler.status='healthy'};if(s.recentRuns.complete&&s.recentRuns.data.lastRun)s.recentRuns.data.lastRun.status='completed';return s});await refresh(page)
 await expect(region(page,'Attention required')).toContainText('All clear');await expect(health).toContainText('AutomationHealthy');await expect(health).toContainText('Verified');await expect(reviews).toContainText('Open0');await expect(region(page,'Attention required')).not.toHaveClass(/has-attention/)
 f.failOverview();await refresh(page);await expect(page.getByRole('alert')).toContainText('Showing the last successful snapshot.');await expect(health).toContainText('AutomationHealthy');expect(f.errors).toEqual([])
})
test('coverage/system detail retains evidence, trend and range with no new snapshot calls',async({page})=>{
 const f=await firstScanFixture(page);const initialHealth=f.requests.filter(u=>u.pathname==='/api/monitoring-health').length,before=f.requests.length,count=()=>f.requests.filter(u=>u.pathname==='/api/overview').length,n=count()
 const details=page.locator('.overview-coverage-detail');await expect(details).not.toHaveAttribute('open');await details.locator('summary').click()
 const funnel=details.locator('.coverage-funnel');for(const text of ['40 interactions considered (Candidates)','Eligible','Sampled','Content available','Evaluated','Evaluation coverage: 20%','Failed evaluation attempts:','same conversation may appear in more than one run'])await expect(funnel).toContainText(text)
 await expect(details).toContainText('Quality describes the conversations that were evaluated.');await expect(region(page,'Quality detail')).toContainText('Limited history in this period.')
 const system=region(page,'Automation health summary').locator('details');await expect(system).not.toHaveAttribute('open');await system.locator('summary').click();for(const text of ['API healthy','Firestore available','Last scheduler tick','durable run evidence','2 pending','1 failed','Last success'])await expect(system).toContainText(text)
 expect(count()).toBe(n);expect(f.requests.length).toBe(before)
 await page.getByLabel('Dashboard range').selectOption('30');await expect(region(page,'Quality summary')).toContainText('Last 30 days');expect(count()).toBe(n+1)
 await expect(region(page,'Coverage summary')).toContainText('Last 30 days');await expect(region(page,'Review work summary')).toContainText('Current state');await expect(region(page,'Automation health summary')).toContainText('Current state')
 expect(f.requests.filter(u=>u.pathname==='/api/review-workload')).toEqual([]);expect(f.requests.filter(u=>u.pathname==='/api/monitoring-health').length).toBe(initialHealth)
})
test('1440 → 390 → 1440 preserves four summaries and range',async({page})=>{
 const f=await firstScanFixture(page);await page.getByLabel('Dashboard range').selectOption('30');await expect(region(page,'Quality summary')).toContainText('Last 30 days');const count=f.requests.filter(u=>u.pathname==='/api/overview').length
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:1440,height:900}]){await page.setViewportSize(viewport);await expect(page.locator('.overview-summary-card')).toHaveCount(4);await expect(region(page,'Quality summary')).toContainText('Last 30 days');await expect(page.getByLabel('Dashboard range')).toHaveValue('30');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
 expect(f.requests.filter(u=>u.pathname==='/api/overview').length).toBe(count)
})
test('all review metrics and quality investigation retain exact query semantics',async({page})=>{
 await firstScanFixture(page)
 for(const [label,query] of [['Open',{reviewQueue:'active'}],['Due soon',{dueState:'DUE_SOON'}],['Overdue',{due:'overdue',dueState:'OVERDUE'}],['Escalated',{dueState:'ESCALATED'}],['Unassigned',{reviewStatus:'REVIEW_REQUESTED',assignment:'unassigned'}]] as const){await metric(region(page,'Review work summary'),label).getByRole('button').click();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject(query);await navigateWorkspace(page,'Overview')}
 await region(page,'Review work summary').getByRole('button',{name:'My review queue →'}).click();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({reviewQueue:'mine',assignment:'mine'});await navigateWorkspace(page,'Overview')
 await metric(region(page,'Quality summary'),'Evaluations').getByRole('button').click();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({source:'genesys-cloud',from:'2026-09-25',to:'2026-10-02'});await navigateWorkspace(page,'Overview')
 await metric(region(page,'Quality summary'),'Critical failure occurrences').getByRole('button').click();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({critical:'yes',source:'genesys-cloud',from:'2026-09-25',to:'2026-10-02'})
})
for(const role of ['ADMIN','REVIEWER','VIEWER','AUTHOR'] as const)test(`shared summary evidence and permitted actions ${role}`,async({page})=>{
 const f=await firstScanFixture(page,role);await expect(page.locator('.overview-summary-card')).toHaveCount(4);await expect(region(page,'Review work summary')).toContainText('Open7');await expect(region(page,'Quality summary')).toContainText('79%');await expect(region(page,'Automation health summary')).toContainText('Attention')
 await expect(region(page,'Review work summary').getByRole('button',{name:'My review queue →'})).toHaveCount(role==='ADMIN'||role==='REVIEWER'?1:0);await expect(region(page,'Review work summary').getByRole('button',{name:'All review work →'})).toHaveCount(1);expect(f.writes).toEqual([])
})
for(const width of [1440,390])test(`keyboard Overview actions and disclosures ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:900});await firstScanFixture(page);const trace:string[]=[]
 async function reach(target:Locator,label:string){for(let i=0;i<120;i++){if(await target.evaluate(el=>el===document.activeElement)){trace.push(label);return};await page.keyboard.press('Tab')}throw Error(`Unreachable: ${label}`)}
 const home=async()=>{await reach(page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Overview',exact:true}),'Overview');await page.keyboard.press('Enter');await expect(region(page,'At a glance')).toBeVisible()}
 await reach(region(page,'Attention required').getByRole('button',{name:'Inspect critical evaluations →'}),'Attention action');await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();await home()
 await reach(region(page,'Quality summary').getByRole('button',{name:'Explore quality →'}),'Quality action');await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Quality analytics',exact:true})).toBeVisible();await home()
 await reach(region(page,'Review work summary').getByRole('button',{name:'All review work →'}),'Review action');await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();await home()
 const coverage=page.locator('.overview-coverage-detail>summary');await reach(coverage,'Coverage details');await page.keyboard.press('Enter');await expect(page.locator('.overview-coverage-detail')).toHaveAttribute('open','')
 await reach(region(page,'Upcoming automation').getByRole('button',{name:'Run a policy now'}),'Automation action');await page.keyboard.press('Enter');await expect(page.locator('.overview-manual')).toHaveAttribute('open','')
 writeFileSync(`${out}/keyboard-${width}.json`,JSON.stringify({trace,method:'Tab traversal and Enter; native disclosure and manual operations; no pointer'},null,2))
})
