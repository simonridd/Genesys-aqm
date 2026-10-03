import { navigateWorkspace,chooseView,selectedView } from './workspace-navigation'
import { test,expect,type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { investigationFixture,investigationCohort,investigationNow } from '../src/fixtures/investigationFixture'
import { overviewAuthority } from '../src/fixtures/overviewFixture'
import { operationalOverview } from '../src/server/overview'
import { operationalAnalytics } from '../src/server/analytics'
import { calibrationAnalytics } from '../src/server/reviews'
import { reviewWorkload } from '../src/server/reviewOperations'
import { governanceSettings } from '../src/server/governance'
import { matchesEvaluationFilters } from '../src/domain/reviews'
import { rolePermissions } from '../src/domain/governance'
import { historyStorageKey } from '../src/domain/evaluations'
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/',origin='https://aqm-api-bd54ukouga-nw.a.run.app'
const evidence=process.env.AQM_INVESTIGATION_EVIDENCE??'docs/v018b-evidence';mkdirSync(evidence,{recursive:true})
const sizes=[{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]
async function setup(page:Page,start='analytics'){
 const store=await investigationFixture(),errors:string[]=[],requests:URL[]=[],writes:string[]=[]
 const local=await store.evaluations()
 page.on('pageerror',e=>errors.push(e.message))
 await page.clock.install({time:new Date(investigationNow)})
 await page.addInitScript(({start,local,key})=>{localStorage.setItem(key,JSON.stringify(local));sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:start}))},{start,local,key:historyStorageKey})
 await page.route('**/*',async r=>{
  const u=new URL(r.request().url()),p=u.pathname,m=r.request().method()
  if(u.origin===new URL(app).origin)return r.continue()
  if(u.origin==='https://login.mypurecloud.ie'&&p==='/oauth/token')return r.fulfill({json:{access_token:'fixture',token_type:'Bearer',expires_in:3600}})
  if(u.origin==='https://api.mypurecloud.ie'&&p==='/api/v2/users/me')return r.fulfill({json:{id:'admin',name:'Owner',organization:{id:'fixtures'}}})
  if(u.origin!==origin)return r.abort()
  requests.push(u);if(m!=='GET'){writes.push(p);throw Error(`Unexpected write ${m} ${p}`)}
  const json=(v:unknown)=>r.fulfill({json:v})
  if(p==='/api/session')return json({actor:{userId:'admin',displayName:'Owner'},role:'ADMIN',permissions:rolePermissions.ADMIN})
  if(p==='/api/governance')return json(await governanceSettings(store))
  if(p==='/api/overview')return json(await operationalOverview(store,investigationNow,30,overviewAuthority,true))
  if(p==='/api/analytics')return json(await operationalAnalytics(store,u.searchParams))
  if(p==='/api/calibration')return json(await calibrationAnalytics(store,u.searchParams))
  if(p==='/api/review-workload')return json(await reviewWorkload(store,investigationNow,overviewAuthority))
  if(p==='/api/evaluations'){const rows=await Promise.all((await store.evaluations()).map(async e=>({...e,humanReview:await store.review(e.id)})));return json({items:rows.filter(e=>matchesEvaluationFilters(e,u.searchParams,'admin',investigationNow,reviewSlaSettings)).slice(0,50),scanLimited:false})}
  if(p.startsWith('/api/evaluations/')){const id=p.split('/')[3];return json({...await store.evaluation(id),humanReview:await store.review(id)})}
  if(p==='/api/forms')return json({items:await store.forms()})
  if(p==='/api/policies')return json({items:await store.policies()})
  if(p==='/api/schedules')return json({items:await store.schedules()})
  if(p==='/api/runs')return json({items:await store.runs()})
  if(p==='/api/alerts')return json({items:await store.alerts(true)})
  if(p.startsWith('/api/alerts/'))return json({item:await store.alert(p.split('/')[3])})
  return json({items:[]})
 })
 const reviewSlaSettings=(await governanceSettings(store)).reviewSla
 await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText('ADMIN')
 return {store,errors,requests,writes}
}
const nav=navigateWorkspace
const rows=(page:Page)=>page.getByRole('button',{name:/^Open evaluation /})
async function cohort(page:Page){await page.getByRole('button',{name:'Change filters',exact:true}).click();await page.getByText('Advanced filters',{exact:true}).click();for(const [label,value] of Object.entries({'From':investigationCohort.from,'To':investigationCohort.to,'Agent':investigationCohort.agent,'Queue':investigationCohort.queue,'Channel':investigationCohort.channel}))await page.locator('.analytics-filter-bar').getByLabel(label,{exact:true}).fill(value);await page.locator('.analytics-filter-bar').getByLabel('Policy',{exact:true}).selectOption(investigationCohort.policy);await page.locator('.analytics-filter-bar').getByLabel('Form',{exact:true}).selectOption(investigationCohort.form);await page.locator('.analytics-filter-bar').getByRole('combobox',{name:'Source',exact:true}).selectOption('genesys-cloud');await page.locator('.analytics-filter-bar').getByRole('combobox',{name:'Trigger',exact:true}).selectOption('scheduled');await chooseView(page,'Questions');await expect(page.locator('.operational-table tbody tr').filter({hasText:'Warm opening'})).toHaveCount(1)}
async function drill(page:Page){await page.locator('.operational-table tbody tr').filter({hasText:'Warm opening'}).click();await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();await expect(rows(page)).toHaveCount(2)}
for(const viewport of sizes){
 test(`Analytics investigation, scope edits, clear, return and URL reload at ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await setup(page)
  await cohort(page)
  const original=new URL(page.url());expect(Object.fromEntries(original.searchParams)).toMatchObject({...investigationCohort,analyticsTab:'questions'})
  // Simulate stale selectors remaining after a prior investigation without changing this source cohort.
  await page.evaluate(()=>{const u=new URL(location.href);for(const [k,v] of Object.entries({reviewStatus:'REVIEWED',assignment:'mine',critical:'yes',question:'old_question',evaluationId:'old_record'}))u.searchParams.set(k,v);history.replaceState(null,'',u)})
  await drill(page)
  const url=new URL(page.url());expect(Object.fromEntries(url.searchParams)).toMatchObject({...investigationCohort,question:'greeting',cohort:'analytics',origin:'analytics'})
  for(const key of ['reviewStatus','assignment','critical','evaluationId'])expect(url.searchParams.has(key)).toBe(false)
  const request=state.requests.filter(u=>u.pathname==='/api/evaluations').at(-1)!
  expect(request.searchParams.get('from')).toBe('2026-09-01T00:00:00.000Z');expect(request.searchParams.get('to')).toBe('2026-09-30T23:59:59.999Z');expect(request.searchParams.has('origin')).toBe(false);expect([...request.searchParams.keys()].some(k=>k.startsWith('analytics.'))).toBe(false)
  const scope=page.getByRole('region',{name:'Investigation scope'});await expect(scope).toContainText('General Customer Service');await expect(scope).toContainText('v17');await expect(scope).toContainText('Question:');await expect(scope).toContainText('Queue: Customer care');await expect(scope).toContainText('Source: Genesys Cloud');await expect(scope).toContainText('Channel: voice')
  await page.screenshot({path:`${evidence}/analytics-investigation-${viewport.width}.png`,fullPage:true});await scope.screenshot({path:`${evidence}/scope-${viewport.width}.png`})
  await scope.getByRole('button',{name:'Remove Channel: voice',exact:true}).click();await expect(rows(page)).toHaveCount(5);expect(new URL(page.url()).searchParams.has('channel')).toBe(false)
  await page.getByRole('button',{name:'Back to Analytics',exact:true}).click();await expect(page.getByRole('heading',{name:'Quality analytics',exact:true})).toBeVisible();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({...investigationCohort,analyticsTab:'questions'})
  await page.getByRole('button',{name:'Change filters',exact:true}).click();await page.getByText('Advanced filters',{exact:true}).click();for(const [label,value] of Object.entries({'From':investigationCohort.from,'To':investigationCohort.to,'Agent':investigationCohort.agent,'Queue':investigationCohort.queue,'Channel':investigationCohort.channel}))await expect(page.locator('.analytics-filter-bar').getByLabel(label,{exact:true})).toHaveValue(value)
  await expect(page.locator('.analytics-filter-bar').getByLabel('Policy',{exact:true})).toHaveValue(investigationCohort.policy);await expect(page.locator('.analytics-filter-bar').getByLabel('Form',{exact:true})).toHaveValue(investigationCohort.form);
  await page.evaluate(()=>{const url=new URL(location.href);url.searchParams.set('code','fixture');url.searchParams.set('state','A'.repeat(43));history.replaceState(null,'',url)});await page.reload();await expect(page.locator('.analytics-filter-bar').getByLabel('Queue',{exact:true})).toHaveValue('Customer care');expect(await selectedView(page)).toBe('Questions')
  await drill(page);await page.getByRole('button',{name:'Clear investigation filters',exact:true}).click();await expect(page.getByRole('region',{name:'Investigation scope'})).toHaveCount(0);await expect(page.locator('.table-toolbar:visible span')).toHaveText(`${(await state.store.evaluations()).length} results on this page`);expect(new URL(page.url()).searchParams.get('evaluationSource')).toBe('server');await page.getByRole('combobox',{name:'History',exact:true}).selectOption('browser');await page.getByLabel('Channel',{exact:true}).fill('messaging');await expect(rows(page)).toHaveCount(1);await page.getByLabel('Channel',{exact:true}).fill('no-such-channel');await expect(rows(page)).toHaveCount(0)
  expect(state.writes).toEqual([]);expect(state.errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
 })
 test(`Overview review counts, workload shortcuts and detail at ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await setup(page,'automation')
  const work=()=>page.getByRole('region',{name:'Review workload health'}),home=()=>nav(page,'Overview')
  for(const [label,count,scope] of [['Open',7,'Active reviews'],['Unassigned',1,'Review requested'],['Due soon',1,'Due soon'],['Overdue',1,'Overdue'],['Escalated',1,'Escalated']] as const){
   await work().locator('.overview-metric').filter({has:page.getByText(label,{exact:true})}).getByRole('button').click();await expect(rows(page)).toHaveCount(count);await expect(page.getByRole('region',{name:'Investigation scope'})).toContainText(scope)
   await page.screenshot({path:`${evidence}/overview-${label.toLowerCase().replace(' ','-')}-${viewport.width}.png`,fullPage:true});await home()
  }
  await work().getByRole('button',{name:'All review work →',exact:true}).click();await expect(rows(page)).toHaveCount(7);await page.getByRole('region',{name:'Investigation scope'}).getByRole('button',{name:'Remove Active reviews',exact:true}).click();await expect(page.locator('.table-toolbar:visible span')).toHaveText(`${(await state.store.evaluations()).length} results on this page`)
  await page.getByLabel('Channel',{exact:true}).fill('email');await expect(rows(page)).toHaveCount(1)
  await page.getByRole('button',{name:'My reviews',exact:true}).click();await expect(rows(page)).toHaveCount(5);await page.getByRole('button',{name:'More filters',exact:true}).click();await expect(page.getByLabel('Channel',{exact:true})).toHaveValue('');expect(new URL(page.url()).searchParams.get('assignment')).toBe('mine')
  await page.getByRole('button',{name:/^Available unassigned reviews/}).click();await expect(rows(page)).toHaveCount(1);expect(new URL(page.url()).searchParams.has('reviewQueue')).toBe(false)
  await home();await page.getByRole('region',{name:'Attention required'}).getByRole('button',{name:/Review escalated.*Open review/}).click();await expect(page.getByRole('region',{name:'Human review',exact:true})).toBeVisible();expect(new URL(page.url()).searchParams.get('evaluationId')).toBe('escalated');expect(new URL(page.url()).searchParams.has('assignment')).toBe(false)
  expect(state.writes).toEqual([]);expect(state.errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
 })
 test(`Calibration disagreement drill clears stale cohort at ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await setup(page,'calibration')
  await page.getByLabel('Calibration form @ version').fill('general_service@17');await page.getByLabel('Calibration agent').fill('Fixture');await page.getByLabel('Calibration queue').fill('Customer');await page.getByLabel('Calibration from').fill('2026-10-01');await page.getByLabel('Calibration to').fill('2026-10-02')
  await chooseView(page,'Questions');await page.locator('.operational-table tbody tr').filter({hasText:'Warm opening'}).click();await expect(page.getByRole('region',{name:'Question calibration drill-down'})).toBeVisible()
  await page.evaluate(()=>{const u=new URL(location.href);for(const [k,v] of Object.entries({assignment:'mine',critical:'yes',channel:'email',cohort:'analytics',question:'old',evaluationId:'old',reviewQueue:'active'}))u.searchParams.set(k,v);history.replaceState(null,'',u)})
  await page.getByRole('button',{name:'Open disagreements',exact:true}).click();await expect(rows(page)).toHaveCount(2)
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({form:'general_service@17',reviewQuestion:'greeting',comparison:'disagreements',reviewStatus:'REVIEWED',source:'genesys-cloud',agent:'Fixture',queue:'Customer',from:'2026-10-01',to:'2026-10-02'})
  for(const key of ['assignment','critical','channel','cohort','question','evaluationId','reviewQueue'])expect(new URL(page.url()).searchParams.has(key)).toBe(false)
  await page.screenshot({path:`${evidence}/calibration-${viewport.width}.png`,fullPage:true});expect(state.writes).toEqual([]);expect(state.errors).toEqual([]);await context.close()
 })
}
