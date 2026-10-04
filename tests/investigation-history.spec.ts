import {test,expect,type Page,type Locator} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'
import {qualityFixture,app,api} from './qualityActionabilityFixture'
import {calibrationFixture} from './calibrationDiscoveryFixture'
import {continuityFixture} from './reviewer-continuity-fixture'
import {navigateWorkspace,chooseView,selectedView} from './workspace-navigation'
const evidence=process.env.AQM_HISTORY_EVIDENCE??'docs/v020d-evidence'
mkdirSync(evidence,{recursive:true})
const rows=(page:Page)=>page.getByRole('button',{name:/^Open evaluation /})
const question=(page:Page)=>page.locator('.quality-analytics .operational-table tbody tr').filter({hasText:'Clear next step'})
const sourceKeys=['from','to','source','policy','form','agent','queue','channel','mode']
const transient=['comparison','reviewStatus','reviewQuestion','evaluationId','evaluationSource','evaluation.scopeLabels','origin']
const query=(url:string)=>Object.fromEntries(new URL(url).searchParams)
const length=(page:Page)=>page.evaluate(()=>history.length)
async function tabTo(page:Page,target:Locator){for(let i=0;i<180;i++){if(await target.evaluate(node=>node===document.activeElement))return;await page.keyboard.press('Tab')}throw Error('Keyboard target unreachable')}
async function source(page:Page,version=17,view='Questions',keyboard=false){
 await navigateWorkspace(page,'About / product tour')
 await page.getByRole('button',{name:'Open AQM',exact:true}).first().click()
 await navigateWorkspace(page,'Analytics')
 await expect(page.getByRole('region',{name:'What stands out'})).toBeVisible()
 const before=await length(page)
 const change=page.getByRole('button',{name:'Change filters',exact:true})
 if(keyboard){await tabTo(page,change);await page.keyboard.press('Enter')}else await change.click()
 const bar=page.locator('.analytics-filter-bar')
 for(const [label,value] of [['From','2026-09-01'],['To','2026-09-30'],['Queue',version===18?'Service':'Claims'],['Agent','Sam']]){
  if(keyboard&&['From','To'].includes(label))continue
  const input=bar.getByLabel(label,{exact:true});if(keyboard){await tabTo(page,input);await page.keyboard.type(value)}else await input.fill(value)
 }
 // Verify typing itself replaces the same history entry.
 expect(await length(page)).toBe(before)
 const select=async(label:string,value:string)=>{const input=bar.getByLabel(label,{exact:true});if(keyboard){await tabTo(page,input);await page.keyboard.type(label==='Source'?'Genesys Cloud':`Customer Service v${version}`);await page.keyboard.press('Enter')}else await input.selectOption(value)}
 await select('Source','genesys-cloud');await select('Form',`general_service@${version}`)
 if(!keyboard){await bar.getByText('Advanced filters',{exact:true}).click();await bar.getByLabel('Policy',{exact:true}).selectOption('daily_voice');await bar.getByLabel('Channel',{exact:true}).fill('voice');await bar.getByLabel('Trigger',{exact:true}).selectOption('scheduled')}
 await expect.poll(()=>query(page.url()).form).toBe(`general_service@${version}`)
 await expect(page.getByRole('region',{name:'Selected quality cohort'})).toContainText(`Customer Service v${version}`)
 if(keyboard){await tabTo(page,change);await page.keyboard.press('Enter');await page.locator('.responsive-view-switcher').waitFor({state:'visible'});const mobile=page.getByRole('combobox',{name:'View',exact:true});const target=await mobile.isVisible()?mobile:page.locator('.analytics-tabs').getByRole('button',{name:view,exact:true});await tabTo(page,target);if(await mobile.isVisible())await page.keyboard.type(view);await page.keyboard.press('Enter')}else {await change.click();await chooseView(page,view)}
 await expect.poll(()=>selectedView(page)).toBe(view)
 expect(await length(page)).toBe(before)
 return {url:page.url(),before}
}
async function capture(page:Page,name:string){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`${evidence}/${name}.png`,fullPage:true});writeFileSync(`${evidence}/${name}.aria.yml`,await page.locator('main').ariaSnapshot())}
async function assertSource(page:Page,url:string,view:string,version=17,exactUrl=true){
 await expect(page.getByRole('heading',{name:'Quality analytics',exact:true})).toBeVisible()
 await expect.poll(()=>selectedView(page)).toBe(view)
 if(exactUrl)await expect(page).toHaveURL(url);else expect(query(page.url())).toEqual(query(url))
 await expect(page.getByRole('region',{name:'Selected quality cohort'})).toContainText(`Customer Service v${version}`)
 for(const key of transient)expect(query(page.url())[key]).toBeUndefined()
 await page.getByRole('button',{name:'Change filters',exact:true}).click()
 for(const [label,key] of [['From','from'],['To','to'],['Source','source'],['Form','form'],['Queue','queue'],['Agent','agent']])await expect(page.locator('.analytics-filter-bar').getByLabel(label,{exact:true})).toHaveValue(query(url)[key]??'')
 await page.getByRole('button',{name:'Change filters',exact:true}).click()
}
async function drill(page:Page,button:Locator,before:number){await button.click();await expect(rows(page).first()).toBeVisible();expect(await length(page)).toBe(before+1);return page.url()}
async function roundTrip(page:Page,sourceUrl:string,drillUrl:string,view:string,version=17,repeats=1){
 const size=await length(page)
 for(let i=0;i<repeats;i++){
  await page.goBack();await assertSource(page,sourceUrl,view,version)
  await page.goForward();await expect(rows(page).first()).toBeVisible();await expect(page).toHaveURL(drillUrl)
  expect(await length(page)).toBe(size)
 }
}
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844},{width:1440,height:720}])test(`Questions exact filters, one push, Back/Forward and repeat ${viewport.width}x${viewport.height}`,async({page})=>{
 await page.setViewportSize(viewport);const f=await qualityFixture(page),s=await source(page)
 await expect(question(page)).toHaveCount(1);await capture(page,`source-${viewport.width}x${viewport.height}`)
 const d=await drill(page,question(page).getByRole('button',{name:'Inspect evaluations →'}),s.before)
 await expect(rows(page)).toHaveCount(3)
 expect(query(d)).toMatchObject({...Object.fromEntries(sourceKeys.map(k=>[k,query(s.url)[k]])),page:'evaluations',evaluationSource:'server',question:'understanding',cohort:'analytics'})
 const request=f.requests.filter(u=>u.pathname==='/api/evaluations').at(-1)!.href
 await capture(page,`drill-${viewport.width}x${viewport.height}`)
 await roundTrip(page,s.url,d,'Questions',17,4)
 expect(f.requests.filter(u=>u.pathname==='/api/evaluations').at(-1)!.href).toBe(request)
 for(const key of ['assignment','reviewQuestion','comparison','critical','evaluationId'])expect(new URL(request).searchParams.has(key)).toBe(false)
 await page.goBack();await assertSource(page,s.url,'Questions');await capture(page,`back-${viewport.width}x${viewport.height}`)
 // Normal document focus remains usable after remount; Tab can reach a view control.
 await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement!==null&&document.activeElement!==document.body)).toBe(true)
 writeFileSync(`${evidence}/questions-${viewport.width}x${viewport.height}.json`,JSON.stringify({source:s.url,drill:d,back:page.url(),forward:d,historyBefore:s.before,historyAfter:s.before+1,repeatCycles:4,exactForwardRequest:request,errors:f.errors,writes:f.writes,blocked:f.blocked},null,2))
 expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])
})
test('v18 stays v18 rather than v17 or All published forms',async({page})=>{
 const f=await qualityFixture(page),s=await source(page,18)
 const d=await drill(page,question(page).getByRole('button',{name:'Inspect evaluations →'}),s.before)
 await roundTrip(page,s.url,d,'Questions',18);expect(query(page.url()).form).toBe('general_service@18');expect(f.writes).toEqual([])
})
test('rapid Back/Forward while Analytics refetches never grows history or reuses stale Evaluation scope',async({page})=>{
 const f=await qualityFixture(page),s=await source(page),d=await drill(page,question(page).getByRole('button',{name:'Inspect evaluations →'}),s.before)
 const size=await length(page),trace:string[]=[]
 for(let i=0;i<6;i++){
  await page.evaluate(()=>history.back());await expect(page).toHaveURL(s.url);trace.push(page.url())
  await page.evaluate(()=>history.forward());await expect(page).toHaveURL(d);trace.push(page.url())
 }
 await expect(rows(page)).toHaveCount(3);expect(await length(page)).toBe(size)
 const request=f.requests.filter(u=>u.pathname==='/api/evaluations').at(-1)!
 expect(Object.fromEntries(request.searchParams)).toMatchObject({form:'general_service@17',question:'understanding',queue:'Claims',agent:'Sam',cohort:'analytics'})
 expect(f.errors).toEqual([]);expect(f.writes).toEqual([])
 writeFileSync(`${evidence}/rapid.json`,JSON.stringify({trace,final:page.url(),historyBefore:size,historyAfter:await length(page),cycles:6,errors:f.errors},null,2))
})
for(const view of ['Queues','Groups','Overview'])test(`${view} investigation uses the same history path`,async({page})=>{
 const f=await qualityFixture(page),s=await source(page,17,view)
 const button=view==='Overview'?page.getByRole('button',{name:'Inspect critical evaluations →'}):view==='Queues'?page.locator('.quality-analytics tbody tr').filter({hasText:'Claims'}).getByRole('button',{name:'Inspect evaluations →'}):page.getByRole('button',{name:'Inspect form evaluations →'}).first()
 const d=await drill(page,button,s.before)
 if(view==='Overview')expect(query(d).critical).toBe('yes')
 if(view==='Queues')expect(query(d).queue).toBe('Claims')
 await roundTrip(page,s.url,d,view);writeFileSync(`${evidence}/analytics-${view.toLowerCase()}.json`,JSON.stringify({source:s.url,drill:d,back:s.url,forward:page.url(),historyAdded:1},null,2));expect(f.writes).toEqual([]);expect(f.errors).toEqual([])
})
test('reload preserves browser stack; fictional reconnect does not fabricate a source',async({page})=>{
 await qualityFixture(page);const s=await source(page),d=await drill(page,question(page).getByRole('button',{name:'Inspect evaluations →'}),s.before)
 // Production tokens are memory-only. Supply fictional OAuth on reload, replacing
 // the current entry exactly as existing callback cleanup does; no app storage change.
 await page.addInitScript(()=>{const u=new URL(location.href);if(u.searchParams.get('page')!=='evaluations')return;sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'evaluations'}));u.searchParams.set('code','fictional');u.searchParams.set('state','A'.repeat(43));history.replaceState(null,'',u)})
 const size=await length(page);await page.reload();await expect(rows(page).first()).toBeVisible();await expect(page).toHaveURL(d);expect(await length(page)).toBe(size)
 await roundTrip(page,s.url,d,'Questions');writeFileSync(`${evidence}/reload.json`,JSON.stringify({source:s.url,reloaded:d,back:s.url,forward:page.url(),historyBefore:size,historyAfter:await length(page),authentication:'Memory-only session recreated by intercepted fictional OAuth; no history stack storage'},null,2))
})
test('Analytics and Evaluations failure retain restored scope and exact retry',async({page})=>{
 const f=await qualityFixture(page),s=await source(page);let failed=true;const calls:string[]=[]
 await page.route(`${api}/api/evaluations?*`,r=>{calls.push(r.request().url());return failed?r.fulfill({status:503,json:{error:'Fictional unavailable'}}):r.fallback()})
 await question(page).getByRole('button',{name:'Inspect evaluations →'}).click()
 const availability=page.getByLabel('Evaluation availability',{exact:true});await expect(availability).toContainText('Evaluations could not be loaded for this scope.');const d=page.url(),first=calls.at(-1)
 await expect(page.getByRole('region',{name:'Investigation scope'})).toContainText('Customer Service v17');await expect(page.getByRole('region',{name:'Investigation scope'})).toContainText('Clear next step')
 await expect(page.locator('.evaluation-queue')).not.toContainText('No evaluations match this scope.')
 f.failAnalytics();await page.goBack();await expect(page.getByRole('alert')).toContainText('Quality analytics could not be loaded.');await expect(page).toHaveURL(s.url)
 await page.getByRole('button',{name:'Change filters',exact:true}).click();await expect(page.getByLabel('Form',{exact:true})).toHaveValue('general_service@17')
 await page.goForward();await expect(availability).toBeVisible();await expect(page).toHaveURL(d);expect(calls.at(-1)).toBe(first)
 failed=false;await availability.getByRole('button',{name:'Retry',exact:true}).click();await expect(rows(page)).toHaveCount(3);expect(calls.at(-1)).toBe(first)
 f.failAnalytics(false);await page.goBack();await assertSource(page,s.url,'Questions')
 writeFileSync(`${evidence}/errors.json`,JSON.stringify({source:s.url,drill:d,back:page.url(),failedRequest:first,forwardRequest:calls[1],retryRequest:calls.at(-1),noFalseEmpty:true},null,2));expect(f.writes).toEqual([]);expect(f.errors).toEqual([])
})
test('explicit Back to Analytics reconstructs clean safe context from a deep link',async({page})=>{
 await qualityFixture(page);const s=await source(page),d=await drill(page,question(page).getByRole('button',{name:'Inspect evaluations →'}),s.before)
 await page.getByRole('button',{name:'Back to Analytics',exact:true}).click();await assertSource(page,s.url,'Questions',17,false)
 // Deep entry has no fabricated Analytics predecessor.
 await page.evaluate(url=>{history.pushState(null,'',url);dispatchEvent(new PopStateEvent('popstate'))},d)
 const size=await length(page);await expect(rows(page).first()).toBeVisible();expect(await length(page)).toBe(size)
 await page.getByRole('button',{name:'Back to Analytics',exact:true}).click();await assertSource(page,s.url,'Questions',17,false);expect(await length(page)).toBe(size)
})
test('direct external Evaluation entry has no fabricated Analytics history',async({page})=>{
 await qualityFixture(page);await navigateWorkspace(page,'About / product tour');const welcome=page.url()
 const u=new URL(app);u.search='page=evaluations&evaluationSource=server&form=general_service%4017&question=understanding'
 await page.evaluate(url=>{history.pushState(null,'',url);dispatchEvent(new PopStateEvent('popstate'))},u.href)
 await expect(rows(page).first()).toBeVisible();const size=await length(page)
 await page.goBack();await expect(page.getByRole('region',{name:'Welcome to IPI AQM'})).toBeVisible();await expect(page).toHaveURL(welcome);expect(await length(page)).toBe(size)
})
test('Calibration disagreement Back/Forward restores exact version, question, view and cohort',async({page})=>{
 const f=await calibrationFixture(page,'&form=general_service@17&source=genesys-cloud&from=2026-09-01&to=2026-09-30&agent=Fixture%20Agent&queue=Customer%20care&calibrationTab=questions')
 try{
  await page.getByRole('region',{name:'Where humans and AI differ'}).getByRole('button',{name:'Inspect question →'}).click()
  const region=page.getByRole('region',{name:'Question calibration drill-down'});await expect(region).toContainText('Customer Service v17');const s=page.url(),size=await length(page)
  await region.getByRole('button',{name:'Open disagreements',exact:true}).click();await expect(rows(page)).toHaveCount(5);const d=page.url();expect(await length(page)).toBe(size+1)
  for(let i=0;i<3;i++){await page.goBack();await expect(region).toContainText('Customer Service v17');await expect(region).toContainText('Clear next step');await expect(page).toHaveURL(s);expect(await selectedView(page)).toBe('Questions');await page.goForward();await expect(rows(page)).toHaveCount(5);await expect(page).toHaveURL(d);expect(query(d)).toMatchObject({comparison:'disagreements',reviewStatus:'REVIEWED',reviewQuestion:'understanding',form:'general_service@17'});expect(await length(page)).toBe(size+1)}
  writeFileSync(`${evidence}/calibration.json`,JSON.stringify({source:s,drill:d,back:s,forward:page.url(),historyAdded:1,cohorts:f.cohorts},null,2));expect(f.blocked).toEqual([]);expect(f.errors).toEqual([])
 }finally{await f.close()}
})
for(const width of [1440,390])test(`keyboard-only Questions history and usable restored view ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:900});await qualityFixture(page,'analytics')
 // Workspace setup uses visible navigation; all cohort/view/drill actions below use keyboard.
 const s=await source(page,17,'Questions',true),button=question(page).getByRole('button',{name:'Inspect evaluations →'})
 await tabTo(page,button);await page.keyboard.press('Enter');await expect(rows(page).first()).toBeVisible();const d=page.url()
 await page.goBack();await expect.poll(()=>selectedView(page)).toBe('Questions');await expect(page).toHaveURL(s.url)
 const change=page.getByRole('button',{name:'Change filters',exact:true});await tabTo(page,change);await page.keyboard.press('Enter');await expect(page.getByLabel('Form',{exact:true})).toHaveValue('general_service@17')
 writeFileSync(`${evidence}/keyboard-${width}.json`,JSON.stringify({source:s.url,drill:d,back:page.url(),method:'Tab traversal, native select type-ahead, Enter, browser goBack; continued keyboard use after remount'},null,2))
})
test('session-only reviewer draft survives pushed Analytics investigation Back/Forward and evidence return',async({page})=>{
 const f=await continuityFixture(page,'page=analytics&analyticsTab=questions&form=general_service%4017&source=genesys-cloud')
 const sourceUrl=page.url();await page.locator('.quality-analytics tbody tr').filter({hasText:'Warm opening'}).getByRole('button',{name:'Inspect evaluations →'}).click()
 await rows(page).first().click();const review=page.getByRole('region',{name:'Human review',exact:true}),note=review.getByLabel('Overall review note',{exact:true})
 await note.fill('V020D session-only draft');const d=page.url(),writes=f.requests.filter(r=>r.method==='PUT').length
 await page.goBack();await expect(page.getByRole('heading',{name:'Quality analytics',exact:true})).toBeVisible();await expect(page).toHaveURL(sourceUrl)
 await page.goForward();await expect(note).toHaveValue('V020D session-only draft');await expect(page).toHaveURL(d)
 await page.getByRole('button',{name:/^Open conversation(?: evidence)?$/}).click();await expect(page.getByRole('heading',{name:'Conversation detail',exact:true})).toBeVisible();await page.getByRole('button',{name:'← Back to human review',exact:true}).click();await expect(note).toHaveValue('V020D session-only draft')
 expect(f.requests.filter(r=>r.method==='PUT')).toHaveLength(writes);expect(f.errors).toEqual([]);expect(f.forbidden).toEqual([])
 writeFileSync(`${evidence}/review-draft.json`,JSON.stringify({source:sourceUrl,investigation:d,draftPreserved:true,evidenceReturnPreserved:true,extraWrites:0},null,2))
})
test('Overview characterization: range is not URL durable and its drill still replaces',async({page})=>{
 await qualityFixture(page);await navigateWorkspace(page,'About / product tour');await page.getByRole('button',{name:'Open AQM',exact:true}).first().click()
 await page.getByLabel('Dashboard range').selectOption('30');const s=page.url(),before=await length(page)
 await page.getByRole('region',{name:'Attention required'}).getByRole('button',{name:'Inspect critical evaluations →'}).click();await expect(rows(page)).toHaveCount(2);const d=page.url();expect(await length(page)).toBe(before)
 await page.goBack();await expect(page.getByRole('region',{name:'Welcome to IPI AQM'})).toBeVisible()
 writeFileSync(`${evidence}/overview.json`,JSON.stringify({source:s,range:30,rangeUrlDurable:false,drill:d,back:page.url(),historyBefore:before,historyAfter:before,changed:false,boundary:'Dashboard range, selected alerts and operational state are component state; truthful restoration requires a separate Overview model.'},null,2))
})
