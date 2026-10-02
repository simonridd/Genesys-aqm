import { normalizeGenesys } from '../../src/domain/genesys'
import { MemoryStore } from '../../src/server/store'
import { writeFileSync } from 'node:fs'
import { aggregateCalibration } from '../../src/domain/calibration'
import { seedGroupAssets } from '../../src/domain/seedGroupAssets'
import { buildReview } from '../../src/domain/reviews'
import { reviewInput } from '../../src/fixtures/reviewFixture'
import { test,expect,type Page } from '@playwright/test'
import { overviewFixture,overviewNow,overviewAuthority,overviewPolicy } from '../../src/fixtures/overviewFixture'
import { operationalOverview } from '../../src/server/overview'
import { operationalAnalytics } from '../../src/server/analytics'
import { reviewWorkload } from '../../src/server/reviewOperations'
import { governanceSettings } from '../../src/server/governance'
import { rolePermissions,type Role } from '../../src/domain/governance'
import { alertSummary } from '../../src/domain/operationalAlerts'
import { matchesReviewQueue } from '../../src/domain/reviews'
import { reviewFixture } from '../../src/fixtures/reviewFixture'
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4175/Genesys-aqm/',origin='https://aqm-api-bd54ukouga-nw.a.run.app'
const sizes=[{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]
async function setup(page:Page,role:Role='ADMIN',attention=true,returnPage='automation',existing=false){
 const store=await overviewFixture(attention);const completed=reviewFixture('completed');await store.putEvaluation(completed);await store.writeReviews([{review:buildReview(completed,undefined,reviewInput(completed,'complete'),{userId:'admin'},overviewNow),expectedRevision:0}]);const errors:string[]=[],requests:string[]=[],writes:string[]=[];let unavailable=false,incomplete=false,identityCalls=0
 page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date(overviewNow)})
 await page.addInitScript(({returnPage})=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:returnPage})),{returnPage})
 await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture',token_type:'Bearer',expires_in:3600}}))
 await page.route('https://api.mypurecloud.ie/**',r=>{identityCalls++;expect(r.request().url()).toContain('/users/me');return r.fulfill({json:{id:'admin',name:'Owner',organization:{id:'fixtures'}}})})
 await page.route('https://api.typesafe.ai/**',()=>{throw Error('NO PAID CALLS')})
 if(existing)await page.route('**/src/main.tsx',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('ReactDOM.createRoot',`await (await import('/Genesys-aqm/src/domain/genesysAuth.ts')).completeCallback();\nReactDOM.createRoot`)})})
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
  if(p==='/api/calibration')return json(aggregateCalibration(await Promise.all((await store.evaluations()).map(async r=>({...r,humanReview:await store.review(r.id)}))),u.searchParams))
  if(p==='/api/notifications/destinations')return json({items:[{id:'fixture-webhook',name:'Operations webhook',type:'WEBHOOK',enabled:true,configuration:{},configured:true}]})
  if(p==='/api/question-groups')return json({items:seedGroupAssets})
  if(p==='/api/reviewers')return json({items:[{userId:'admin',displayName:'Owner',role:'ADMIN'}]})
  if(p==='/api/policies')return json({items:await store.policies()})
  if(p==='/api/forms')return json({items:await store.forms()})
  if(p==='/api/schedules')return json({items:await store.schedules()})
  if(p.startsWith('/api/schedules/'))return json({schedule:(await store.schedules())[0]})
  if(p==='/api/runs')return json({items:(await store.healthSnapshot()).recentRuns})
  if(p.startsWith('/api/runs/'))return json(await store.run(p.split('/').at(-1)!))
  if(p==='/api/alerts')return json({items:await store.alerts(true)})
  if(p.startsWith('/api/alerts/')&&!p.endsWith('/notifications'))return json({item:await store.alert(p.split('/')[3])})
  if(p==='/api/evaluations')return json({items:(await Promise.all((await store.evaluations()).map(async r=>({...r,humanReview:await store.review(r.id)})))).filter(r=>matchesReviewQueue(r,u.searchParams,'admin',overviewNow)&&(!u.searchParams.get('critical')||r.criticalFailures.length>0))})
  if(p.startsWith('/api/evaluations/')){const id=p.split('/')[3];return json({...await store.evaluation(id),humanReview:await store.review(id)})}
  if(p.endsWith('/plan')&&m==='POST')return json({fingerprint:'fixture-plan',expectedEvaluations:2,maximumProviderRequests:2,candidateCount:20,eligibleCount:10,sampledCount:2,selected:[{conversationId:'fixture',pendingFormIds:['form']}]})
  if(p.endsWith('/run')&&m==='POST'){expect(route.request().postDataJSON().fingerprint).toBe('fixture-plan');return json({run:{status:'completed'}})}
  if(m!=='GET')throw Error(`Unexpected write ${p}`)
  return json({items:[]})
 })
 await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
 return {store,errors,requests,writes,setIncomplete:()=>{incomplete=true},setUnavailable:()=>{unavailable=true},identityCalls:()=>identityCalls}
}

const out='docs/v018-evidence'
async function capture(page:Page,name:string,fixture?:Awaited<ReturnType<typeof setup>>){
 await page.waitForTimeout(650);await page.evaluate(()=>document.fonts.ready)
 await page.screenshot({path:`${out}/${name}.png`,fullPage:true})
 const audit=await page.evaluate(()=>({url:location.href,fontStatus:document.fonts.status,fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),width:innerWidth,pageWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>(e as HTMLElement).offsetParent!==null).map(e=>({level:e.tagName,text:e.textContent})),text:document.body.innerText,geometry:[...document.querySelectorAll('main button,.table-scroll,.genesys-settings,.form-detail,.asset-detail,.evaluation-detail,.run-detail,.alert-detail,.notifications form')].filter(e=>(e as HTMLElement).offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,class:e.className,text:e.tagName==='BUTTON'?e.textContent:'',top:r.top+scrollY,left:r.left,right:r.right,width:r.width,height:r.height,inTable:!!e.closest('table')}}),selectableRows:[...document.querySelectorAll('tr.selectable')].filter(e=>(e as HTMLElement).offsetParent!==null).map(e=>({text:e.textContent,tabIndex:(e as HTMLElement).tabIndex,buttons:e.querySelectorAll('button,a,input').length})),tables:[...document.querySelectorAll('.table-scroll')].filter(e=>(e as HTMLElement).offsetParent!==null).map(e=>({width:e.clientWidth,scrollWidth:e.scrollWidth})),buttons:[...document.querySelectorAll('main button')].filter(e=>(e as HTMLElement).offsetParent!==null).map(e=>({text:e.textContent,disabled:(e as HTMLButtonElement).disabled})),fields:[...document.querySelectorAll('main input,main select,main textarea')].filter(e=>(e as HTMLElement).offsetParent!==null).map(e=>({label:e.getAttribute('aria-label')||e.closest('label')?.textContent,type:e.getAttribute('type'),disabled:(e as HTMLInputElement).disabled,readOnly:(e as HTMLInputElement).readOnly}))}))
 const panels:Record<string,string>={'form-detail':'.form-detail','group-detail':'.asset-detail','evaluation-review-detail':'.evaluation-detail','run-detail':'#overview-run-detail','alert-detail':'.alert-detail','notification-destination':'[aria-label="Destination form"]','notification-rule':'[aria-label="Rule form"]'};const panel=Object.entries(panels).find(([prefix])=>name.startsWith(prefix+'-'));if(panel)await page.locator(panel[1]).screenshot({path:`${out}/${name}-panel.png`});
 writeFileSync(`${out}/${name}.json`,JSON.stringify({...audit,requests:fixture?.requests,errors:fixture?.errors},null,2))
}
async function blockExternal(context:any){await context.route('**/*',async(r:any)=>{const url=r.request().url();if(url.startsWith(app)||['https://fonts.googleapis.com','https://fonts.gstatic.com'].includes(new URL(url).origin))return r.continue();await r.abort('blockedbyclient')})}
for(const viewport of sizes)test(`primary pages ${viewport.width}`,async({browser})=>{
 test.setTimeout(120000)
 const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(10000);await blockExternal(context)
 const f=await setup(page);const nav=page.getByRole('navigation',{name:'Primary navigation'})
 for(const [key,label] of [['overview','Overview'],['evaluations','Evaluations'],['analytics','Analytics'],['calibration','Calibration'],['policies','Policies'],['forms','Evaluation Forms'],['groups','Question Groups'],['settings','Settings'],['conversations','Conversations'],['conversation-review','Conversation review']]){
  await nav.getByRole('button',{name:label,exact:true}).click();await capture(page,`${key}-${viewport.width}`,f)
  if(key==='policies'){await page.getByRole('button',{name:overviewPolicy.name,exact:true}).click();await capture(page,`policy-detail-${viewport.width}`,f)}
  if(key==='forms'){await page.locator('tr.selectable:visible').first().click();await capture(page,`form-detail-${viewport.width}`,f)}
  if(key==='groups'){await page.locator('tr.selectable:visible').first().click();await capture(page,`group-detail-${viewport.width}`,f)}
  if(key==='evaluations'){await page.getByRole('button',{name:'Open evaluation completed',exact:true}).click();await capture(page,`evaluation-review-detail-${viewport.width}`,f);await page.locator('.evaluation-detail').getByRole('button',{name:'Close',exact:true}).click()}
 }
 await nav.getByRole('button',{name:'Overview',exact:true}).click();await page.getByRole('region',{name:'Attention required'}).getByRole('button',{name:/Scheduler activity is stale/}).click();await capture(page,`alert-detail-${viewport.width}`,f)
 await nav.getByRole('button',{name:'Overview',exact:true}).click();await page.getByRole('region',{name:'Attention required'}).getByRole('button',{name:/Scheduled run failed/}).click();await capture(page,`run-detail-${viewport.width}`,f)
 await nav.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'New destination',exact:true}).click();await capture(page,`notification-destination-${viewport.width}`,f);await page.getByRole('button',{name:'Cancel destination'}).click();await page.getByRole('button',{name:'New rule',exact:true}).click();await capture(page,`notification-rule-${viewport.width}`,f)
 expect(f.errors).toEqual([]);await context.close()
})
for(const role of ['AUTHOR','REVIEWER','VIEWER'] as Role[])test(`role experience ${role}`,async({browser})=>{
 const context=await browser.newContext({viewport:sizes[0]}),page=await context.newPage();await blockExternal(context);const f=await setup(page,role)
 for(const [key,label] of [['overview','Overview'],['evaluations','Evaluations'],['policies','Policies'],['settings','Settings'],['forms','Evaluation Forms'],['groups','Question Groups']]){await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:label,exact:true}).click();await capture(page,`${role}-${key}`,f)}
 expect(f.errors).toEqual([]);await context.close()
})
test('error states and specific coherence probes',async({browser})=>{
 const context=await browser.newContext({viewport:sizes[0]}),page=await context.newPage();await blockExternal(context);const f=await setup(page);const nav=page.getByRole('navigation',{name:'Primary navigation'})
 f.setIncomplete();await page.getByRole('button',{name:'Refresh',exact:true}).click();await capture(page,'incomplete-overview',f)
 f.setUnavailable();await page.getByRole('button',{name:'Refresh',exact:true}).click();await capture(page,'unavailable-overview',f)
 await page.route(`${origin}/api/evaluations**`,r=>r.fulfill({status:403,json:{error:'Forbidden: your role does not permit this action.'}}));await nav.getByRole('button',{name:'Evaluations',exact:true}).click();await capture(page,'permission-denied',f)
 await page.unroute(`${origin}/api/evaluations**`);await page.route(`${origin}/api/evaluations**`,r=>r.fulfill({json:{items:[]}}));await page.getByRole('button',{name:'Refresh',exact:true}).click();await capture(page,'empty-evaluations',f)
 await nav.getByRole('button',{name:'Question Groups',exact:true}).click();await page.getByRole('button',{name:'New group asset',exact:true}).click();await page.getByLabel('Asset name', {exact:true}).fill('UNSAVED GROUP PROBE');let dialogs=0;page.on('dialog',async d=>{dialogs++;await d.dismiss()});await nav.getByRole('button',{name:'Settings',exact:true}).click();await nav.getByRole('button',{name:'Question Groups',exact:true}).click();writeFileSync(`${out}/group-dirty-probe.json`,JSON.stringify({dialogs,draftStillVisible:await page.getByText('UNSAVED GROUP PROBE').count()}));await capture(page,'group-after-unsaved-navigation',f)
 await nav.getByRole('button',{name:'Analytics',exact:true}).click();await page.locator('.analytics-filter-bar').getByLabel('From',{exact:true}).fill('2026-09-01');await page.locator('.analytics-filter-bar').getByLabel('Queue',{exact:true}).fill('Customer care');await page.waitForTimeout(650);await page.evaluate(()=>document.fonts.ready);await page.locator('.analytics-tabs').getByRole('button',{name:'Forms',exact:true}).click();await page.locator('tr.selectable:visible').first().click();await page.locator('tr.selectable:visible').first().click();await capture(page,'analytics-drill-scope',f)
 await context.close()
})
for(const viewport of sizes)test(`disconnected and public ${viewport.width}`,async({browser})=>{
 const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(10000);await blockExternal(context);await page.goto(app);await capture(page,`disconnected-landing-${viewport.width}`)
 await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Settings',exact:true}).click();await capture(page,`disconnected-settings-${viewport.width}`)
 await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Analytics',exact:true}).click();await page.getByRole('button',{name:/Load demo/}).click();await capture(page,`demo-analytics-${viewport.width}`);await context.close()
 const publicContext=await browser.newContext({viewport}),publicPage=await publicContext.newPage();const blocked:string[]=[]
 await publicContext.route('**/*',async r=>{const u=new URL(r.request().url());if(['https://simonridd.github.io','https://fonts.googleapis.com','https://fonts.gstatic.com'].includes(u.origin))return r.continue();blocked.push(u.origin+u.pathname);await r.abort('blockedbyclient')})
 await publicPage.goto('https://simonridd.github.io/Genesys-aqm/');await capture(publicPage,`public-landing-${viewport.width}`);await publicPage.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Overview',exact:true}).click();await capture(publicPage,`public-overview-${viewport.width}`);writeFileSync(`${out}/public-blocked-${viewport.width}.json`,JSON.stringify(blocked));await publicContext.close()
})

test('save scope, count drill-through and keyboard probes',async({browser})=>{
 const context=await browser.newContext({viewport:sizes[0]}),page=await context.newPage();page.setDefaultTimeout(10000);await blockExternal(context);const f=await setup(page);const nav=page.getByRole('navigation',{name:'Primary navigation'})
 await page.getByRole('region',{name:'Review workload health'}).locator('.overview-metric').filter({hasText:'Open'}).getByRole('button').click();await capture(page,'overview-open-drill',f)
 await nav.getByRole('button',{name:'Overview',exact:true}).click();await page.getByRole('region',{name:'Review workload health'}).locator('.overview-metric').filter({hasText:'Unassigned'}).getByRole('button').click();await capture(page,'overview-unassigned-drill',f)
 await nav.getByRole('button',{name:'Settings',exact:true}).click();let writes:any[]=[];await page.route(`${origin}/api/governance`,async r=>{if(r.request().method()==='PUT'){writes.push(r.request().postDataJSON());return r.fulfill({json:r.request().postDataJSON()})}return r.fulfill({json:await governanceSettings(f.store)})});await page.getByLabel('Evaluation retention days',{exact:true}).fill('2');await page.getByRole('button',{name:'Save review reminders',exact:true}).click();writeFileSync(`${out}/governance-save-payload.json`,JSON.stringify(writes,null,2));await capture(page,'governance-save-scope',f)
 await nav.getByRole('button',{name:'Question Groups',exact:true}).click();await page.locator('.table-toolbar input:visible').first().focus();const focus=[];for(let i=0;i<12;i++){await page.keyboard.press('Tab');focus.push(await page.evaluate(()=>({tag:document.activeElement?.tagName,text:document.activeElement?.textContent,aria:document.activeElement?.getAttribute('aria-label')})))}writeFileSync(`${out}/keyboard-group-focus.json`,JSON.stringify(focus,null,2));await capture(page,'keyboard-group-table',f)
 await page.locator('.table-toolbar input:visible').first().fill('NO SUCH GROUP');await capture(page,'no-matching-groups',f)
 await nav.getByRole('button',{name:'Overview',exact:true}).click();await page.route(`${origin}/api/overview**`,async r=>r.fulfill({json:await operationalOverview(new MemoryStore(),overviewNow,7,overviewAuthority,true)}));await page.getByRole('button',{name:'Refresh',exact:true}).click();await capture(page,'empty-overview',f)
 await context.close()
})

for(const viewport of sizes)test(`completed Genesys fixture browser ${viewport.width}`,async({browser})=>{
 const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(10000);await blockExternal(context);const f=await setup(page)
 const id='22222222-2222-4222-8222-222222222222',detail={conversationId:id,conversationStart:'2026-09-30T12:00:00Z',conversationEnd:'2026-09-30T12:10:00Z',participants:[{purpose:'customer',participantName:'Messaging Customer',sessions:[{sessionId:'33333333-3333-4333-8333-333333333333',mediaType:'message',direction:'inbound',segments:[{queueId:'55555555-5555-4555-8555-555555555555'}]}]},{purpose:'agent',participantName:'Messaging Agent',userId:'agent'}]}
 const normalized={...normalizeGenesys(detail),metadata:{...normalizeGenesys(detail).metadata,queue:'Messaging Queue',transcriptStatus:'Available'},messages:[{id:'c',speaker:'customer',timestamp:'2026-09-30T12:01:00Z',senderName:'Messaging Customer',text:'Please help with my bill.'},{id:'b',speaker:'bot',timestamp:'2026-09-30T12:01:10Z',senderName:'Service Assistant',text:'I will connect you.'},{id:'s',speaker:'system',timestamp:'2026-09-30T12:01:20Z',text:'Connected to service team.'},{id:'a',speaker:'agent',timestamp:'2026-09-30T12:02:00Z',senderName:'Messaging Agent',text:'I can help.'}]}
 await page.route('https://api.mypurecloud.ie/**',async r=>{const u=r.request().url();if(u.includes('/users/me'))return r.fulfill({json:{id:'admin',name:'Owner'}});if(u.includes('/details/query'))return r.fulfill({json:{conversations:[detail],totalHits:1}});if(u.includes('/routing/queues'))return r.fulfill({json:{name:'Messaging Queue'}});return r.fulfill({json:detail})})
 await page.route(`${origin}/api/conversations/**`,r=>r.fulfill({json:normalized}))
 await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Conversations',exact:true}).click();await page.locator('.source-options').getByRole('button',{name:'Genesys Cloud',exact:true}).click();await capture(page,`connected-conversations-empty-${viewport.width}`,f)
 await page.getByLabel('From',{exact:true}).fill('2026-09-30T00:00');await page.getByLabel('To',{exact:true}).fill('2026-10-01T00:00');await page.getByRole('combobox',{name:'Channel',exact:true}).selectOption('messaging');await page.getByRole('button',{name:'Search completed interactions',exact:true}).click();await capture(page,`connected-conversations-${viewport.width}`,f)
 await page.getByRole('row').filter({hasText:id}).click({position:{x:50,y:20}});await expect(page.locator('.message-row.customer .bubble')).toContainText('Please help with my bill.');await capture(page,`connected-conversation-review-${viewport.width}`,f);expect(f.errors).toEqual([]);await context.close()
})
