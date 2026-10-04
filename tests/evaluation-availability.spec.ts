import {test,expect,type Page,type Route} from '@playwright/test'
import {qualityFixture,app,api,now} from './qualityActionabilityFixture'
import {continuityFixture} from './reviewer-continuity-fixture'
import {calibrationFixture} from './calibrationDiscoveryFixture'
import {navigateWorkspace} from './workspace-navigation'
import {matchesEvaluationFilters} from '../src/domain/reviews'
import {defaultGovernance} from '../src/domain/governance'
import {reviewFixture} from '../src/fixtures/reviewFixture'
import {historyStorageKey} from '../src/domain/evaluations'
import {writeFileSync} from 'node:fs'
const queue=(page:Page)=>page.locator('.evaluation-queue')
const rows=(page:Page)=>queue(page).getByRole('button',{name:/^Open evaluation /})
const availability=(page:Page)=>page.locator('[aria-label="Evaluation availability"]')
const table=(page:Page)=>queue(page).locator('.operational-table-wrap')
async function capture(page:Page,name:string){
 await availability(page).scrollIntoViewIfNeeded()
 await page.screenshot({path:`docs/v020c-evidence/${name}.png`,fullPage:true})
 writeFileSync(`docs/v020c-evidence/${name}.aria.yml`,await page.locator('main').ariaSnapshot())
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 const bounds=await availability(page).boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
}
async function control(page:Page,store:any){
 const state={fail:0,detailFail:false,workloadFail:false,empty:false,count:3,paginate:false,held:new Map<string,Route>(),hold:new Set<string>(),requests:[] as URL[],operations:[] as string[]}
 await page.route(`${api}/**`,async route=>{
  const u=new URL(route.request().url()),p=u.pathname
  if(p==='/api/evaluations'){
   state.requests.push(u)
   if(state.hold.has(u.searchParams.get('queue')??'')){state.held.set(u.searchParams.get('queue')??'',route);return}
   if(state.fail)return route.fulfill({status:state.fail,json:{error:'Fictional service diagnostic: '+state.fail}})
   const all=await Promise.all((await store.evaluations()).map(async(r:any)=>({...r,humanReview:await store.review(r.id)})))
   const matching=all.filter((r:any)=>matchesEvaluationFilters(r,u.searchParams,'admin',now,defaultGovernance.reviewSla))
   const offset=u.searchParams.has('cursor')?state.count:0
   return route.fulfill({json:{items:state.empty?[]:matching.slice(offset,offset+state.count),nextCursor:state.paginate&&!offset?'page-two':undefined,scanLimited:!offset&&state.paginate}})
  }
  if(p.startsWith('/api/evaluations/')&&state.detailFail)return route.fulfill({status:503,json:{error:'Fictional detail diagnostic'}})
  if(p==='/api/review-workload'&&state.workloadFail)return route.fulfill({status:503,json:{error:'Fictional workload diagnostic'}})
  if(['/api/calibration/sample','/api/reviews/bulk-assign','/api/reviews/bulk-due'].includes(p)){
   state.operations.push(p);return route.fulfill({status:503,json:{error:'Fictional operation diagnostic'}})
  }
  if(p==='/api/reviewers')return route.fulfill({json:{items:[{userId:'admin',displayName:'Fictional Admin',role:'ADMIN'}]}})
  return route.fallback()
 })
 return state
}
async function fixture(page:Page){const f=await qualityFixture(page);const c=await control(page,f.store);return {...f,c}}
async function enter(page:Page){await navigateWorkspace(page,'Evaluations')}
async function healthy(page:Page){await expect(rows(page)).toHaveCount(3)}
async function noFalseEmpty(page:Page){await expect(table(page)).toHaveCount(0);await expect(queue(page).getByText(/0 results|No evaluations match|No reviews need|No production evaluations/)).toHaveCount(0);await expect(queue(page).getByLabel('Search table')).toHaveCount(0)}
for(const width of [390,1440,1920])test(`initial 503 and keyboard retry ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:900});const f=await fixture(page);f.c.fail=503;await enter(page)
 await expect(availability(page)).toContainText('Evaluations could not be loaded.')
 await expect(availability(page)).toHaveAttribute('role','alert');await noFalseEmpty(page)
 const disclosure=availability(page).locator('details');await expect(disclosure).not.toHaveAttribute('open','');await expect(disclosure.locator('pre')).toBeHidden()
 await capture(page,`initial-failure-${width}`)
 const request=f.c.requests.at(-1)!.href
 // Failed retry keeps an announced failure; success moves focus to the list heading.
 await availability(page).getByRole('button',{name:'Retry',exact:true}).focus();await page.keyboard.press('Enter')
 await expect(availability(page)).toBeVisible();await noFalseEmpty(page)
 f.c.fail=0;await availability(page).getByRole('button',{name:'Retry',exact:true}).focus();await page.keyboard.press('Enter');await healthy(page)
 await expect(availability(page)).toHaveCount(0);await expect(queue(page).getByText('3 results on this page',{exact:true})).toBeVisible()
 await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeFocused();expect(f.c.requests.at(-1)!.href).toBe(request)
 expect(f.writes).toEqual([]);expect(f.blocked).toEqual([]);expect(f.errors).toEqual([])
})
test('successful empty is a data result',async({page})=>{const f=await fixture(page);f.c.empty=true;await enter(page);await expect(queue(page).getByText('No evaluations match this scope.',{exact:true})).toBeVisible();await expect(availability(page)).toHaveCount(0);await expect(table(page)).toBeVisible()})
test('refresh failure preserves search, rows and loaded time; retry replaces atomically',async({page})=>{
 const f=await fixture(page);await enter(page);await healthy(page)
 const loaded=await queue(page).getByText(/^Loaded /).innerText();f.c.fail=503
 await page.getByRole('button',{name:'Refresh',exact:true}).click()
 await expect(availability(page)).toContainText('Couldn’t refresh evaluations.');await expect(availability(page)).toContainText(loaded.replace('Loaded ','Showing results loaded at '));await healthy(page)
 await queue(page).getByLabel('Search table').fill('Sam');await expect(rows(page)).toHaveCount(2);await queue(page).getByLabel('Search table').fill('')
 await page.clock.fastForward(61000);f.c.fail=0;f.c.count=4
 await availability(page).getByRole('button',{name:'Retry refresh'}).click();await expect(rows(page)).toHaveCount(4);await expect(availability(page)).toHaveCount(0);expect(await queue(page).getByText(/^Loaded /).innerText()).not.toBe(loaded)
})
test('scope change suspends old rows while loading and failed; retry keeps the exact new scope',async({page})=>{
 const f=await fixture(page);await enter(page);await page.getByLabel('Queue',{exact:true}).fill('Claims');await healthy(page)
 const oldIds=await rows(page).evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')))
 f.c.hold.add('Service');await page.getByLabel('Queue',{exact:true}).fill('Service');await expect(queue(page).getByText('Updating evaluations…',{exact:true})).toBeVisible();await noFalseEmpty(page)
 await expect.poll(()=>f.c.held.has('Service')).toBe(true);await f.c.held.get('Service')!.fulfill({status:503,json:{error:'Scope B diagnostic'}});f.c.hold.clear()
 await expect(availability(page)).toContainText('Evaluations could not be loaded for this scope.');await noFalseEmpty(page)
 const requested=f.c.requests.at(-1)!.href;await availability(page).getByRole('button',{name:'Retry',exact:true}).click();await healthy(page)
 expect(f.c.requests.at(-1)!.href).toBe(requested);expect(f.c.requests.at(-1)!.searchParams.get('queue')).toBe('Service');expect(await rows(page).evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')))).not.toEqual(oldIds)
})
test('next and first page failures preserve cursor, current rows and page controls until retry success',async({page})=>{
 const f=await fixture(page);f.c.paginate=true;await enter(page);await healthy(page)
 const first=await rows(page).evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')))
 f.c.fail=503;await page.getByRole('button',{name:'Next server page →'}).click()
 await expect(availability(page)).toContainText('Couldn’t load the next page.');await expect(availability(page)).toContainText('Current page is unchanged.')
 expect(await rows(page).evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')))).toEqual(first);await expect(page.getByRole('button',{name:'First page',exact:true})).toBeDisabled()
 f.c.fail=0;await availability(page).getByRole('button',{name:'Retry next page'}).click();await expect(page.getByRole('button',{name:'First page',exact:true})).toBeEnabled();await healthy(page)
 const second=await rows(page).evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')));expect(second).not.toEqual(first);expect(f.c.requests.at(-1)!.searchParams.get('cursor')).toBe('page-two')
 f.c.fail=503;await page.getByRole('button',{name:'First page',exact:true}).click();await expect(availability(page)).toContainText('Couldn’t load the first page.');await expect(availability(page)).toContainText('Current page is unchanged.')
 expect(await rows(page).evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')))).toEqual(second);await expect(page.getByRole('button',{name:'First page',exact:true})).toBeEnabled()
 f.c.fail=0;await availability(page).getByRole('button',{name:'Retry first page'}).click();await expect(page.getByRole('button',{name:'First page',exact:true})).toBeDisabled();expect(f.c.requests.at(-1)!.searchParams.has('cursor')).toBe(false)
 await expect.poll(()=>rows(page).evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')))).toEqual(first)
})
for(const order of ['B then A','A then B'])test(`request race ${order}`,async({page})=>{
 const f=await fixture(page);await enter(page);await healthy(page)
 f.c.hold.add('Claims');f.c.hold.add('Service');await page.getByLabel('Queue',{exact:true}).fill('Claims');await expect.poll(()=>f.c.held.has('Claims')).toBe(true)
 await page.getByLabel('Queue',{exact:true}).fill('Service');await expect.poll(()=>f.c.held.has('Service')).toBe(true)
 const good=(await f.store.evaluations()).filter(r=>r.queue==='Service').slice(0,3)
 const a=()=>f.c.held.get('Claims')!.fulfill({status:503,json:{error:'Late A failure'}}),b=()=>f.c.held.get('Service')!.fulfill({json:{items:good}})
 if(order==='B then A'){await b();await healthy(page);await a()}else{await a();await noFalseEmpty(page);await b()}
 await healthy(page);await expect(availability(page)).toHaveCount(0);expect(await queue(page).innerText()).not.toContain('Late A failure');expect(f.c.requests.at(-1)!.searchParams.get('queue')).toBe('Service')
})
test('detail failure isolates list and prevents writable review until details retry succeeds',async({page})=>{
 const f=await fixture(page);await enter(page);await healthy(page);f.c.detailFail=true;await rows(page).first().click()
 const detail=page.locator('[aria-label="Evaluation details"]');await expect(detail).toContainText('Evaluation details could not be loaded.');await healthy(page);await expect(availability(page)).toHaveCount(0)
 await expect(page.getByRole('region',{name:'Human review',exact:true})).toHaveCount(0);await expect(detail.locator('details')).not.toHaveAttribute('open','')
 f.c.detailFail=false;await detail.getByRole('button',{name:'Retry details'}).click();await expect(page.getByRole('region',{name:'Human review',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Close details',exact:true}).click();await healthy(page)
})
test('sample, bulk assignment and bulk due failures remain operation-specific',async({page})=>{
 const f=await fixture(page);await enter(page);await healthy(page)
 await page.getByText('Calibration sample',{exact:true}).click();await page.getByRole('button',{name:'Request sample',exact:true}).click()
 await expect(page.getByRole('region',{name:'Calibration sample',exact:true})).toContainText('Calibration sample could not be requested.');await healthy(page);await expect(availability(page)).toHaveCount(0)
 // A requested review is eligible for assignment and due-date operations.
 await page.getByRole('checkbox',{name:'Select evaluation quality-1',exact:true}).check();await page.getByText('Bulk assignment',{exact:true}).first().click()
 const bulk=page.getByRole('region',{name:'Bulk review assignment',exact:true});await bulk.getByLabel('Bulk assign to',{exact:true}).selectOption('admin');await bulk.getByRole('button',{name:'Assign 1 reviews'}).click()
 await expect(bulk).toContainText('Reviews could not be assigned.');await healthy(page);await expect(availability(page)).toHaveCount(0)
 await bulk.getByRole('button',{name:'Clear due date',exact:true}).click();await expect(bulk).toContainText('Review due dates could not be updated.');await healthy(page);await expect(availability(page)).toHaveCount(0)
 expect(f.c.operations).toEqual(['/api/calibration/sample','/api/reviews/bulk-assign','/api/reviews/bulk-due'])
})
test('workload unavailable leaves the list usable',async({page})=>{const f=await fixture(page);f.c.workloadFail=true;await enter(page);await page.getByText('Team review workload',{exact:true}).click();await healthy(page);await expect(availability(page)).toHaveCount(0);await expect(page.getByRole('region',{name:'Review workload'})).toContainText('Fictional workload diagnostic')})
for(const status of [401,403])test(`permission failure ${status}`,async({page})=>{const f=await fixture(page);f.c.fail=status;await enter(page);await expect(availability(page)).toContainText('Your session no longer has access');await expect(availability(page).getByRole('link',{name:'Settings / reconnect'})).toBeVisible();await noFalseEmpty(page)})
test('network failure is unavailable; malformed successful response is not an empty cohort',async({page})=>{
 await fixture(page);await page.route(`${api}/api/evaluations?*`,r=>r.abort());await enter(page);await expect(availability(page)).toContainText('Evaluations could not be loaded.');await noFalseEmpty(page)
 await page.route(`${api}/api/evaluations?*`,r=>r.fulfill({json:{wrong:[]}}));await availability(page).getByRole('button',{name:'Retry',exact:true}).click();await expect(availability(page)).toBeVisible();await noFalseEmpty(page)
})
test('disconnected server does not render false empty; browser local history works and server stays truthful',async({page})=>{
 await page.goto(`${app}?page=evaluations`);await expect(queue(page)).toContainText('Connect to Genesys Cloud');await noFalseEmpty(page)
 await page.getByRole('combobox',{name:'History',exact:true}).selectOption('browser');await expect(queue(page).getByText('No evaluations match this browser scope.',{exact:true})).toBeVisible()
 await page.getByRole('combobox',{name:'History',exact:true}).selectOption('server');await noFalseEmpty(page)
 const f=await fixture(page);f.c.fail=503;await enter(page);await expect(availability(page)).toBeVisible()
 await page.getByRole('combobox',{name:'History',exact:true}).selectOption('browser');await expect(queue(page).getByText('No evaluations match this browser scope.',{exact:true})).toBeVisible();await expect(availability(page)).toHaveCount(0)
 await page.getByRole('combobox',{name:'History',exact:true}).selectOption('server');await expect(availability(page)).toBeVisible();await noFalseEmpty(page)
})
test('reviewer default My Reviews unavailable, independent workload, retry restores mobile priority cards',async({page})=>{
 await page.setViewportSize({width:390,height:844});const f=await continuityFixture(page,'page=evaluations',{start:false});await navigateWorkspace(page,'Overview')
 let fail=true;const queries:URL[]=[]
 await page.route(`${api}/api/evaluations?*`,r=>{queries.push(new URL(r.request().url()));return fail?r.fulfill({status:503,json:{error:'Fictional queue unavailable'}}):r.fallback()})
 await enter(page);await expect(availability(page)).toContainText('Your review queue could not be loaded.');await noFalseEmpty(page);await expect(page.getByRole('button',{name:'My reviews',exact:true})).toHaveAttribute('aria-pressed','true')
 await expect(page.getByRole('region',{name:'My review summary'})).toBeVisible();await expect(page.locator('.review-task-cards')).toHaveCount(0);await capture(page,'my-reviews-failure-390')
 fail=false;await availability(page).getByRole('button',{name:'Retry',exact:true}).click();await expect(page.getByRole('list',{name:'My review tasks'}).getByRole('button',{name:'Start review',exact:true})).toHaveCount(2)
 expect(queries.at(-1)!.searchParams.get('reviewQueue')).toBe('mine');expect(queries.at(-1)!.searchParams.get('assignment')).toBe('mine')
 await page.getByRole('list',{name:'My review tasks'}).getByRole('button',{name:'Start review',exact:true}).first().click();await expect(page.getByRole('region',{name:'Review workspace'})).toBeVisible()
 expect(f.forbidden).toEqual([])
})
test('successful My Reviews empty has its own copy',async({page})=>{
 await continuityFixture(page);await navigateWorkspace(page,'Overview');await page.route(`${api}/api/evaluations?*`,r=>r.fulfill({json:{items:[]}}));await enter(page)
 await expect(queue(page).getByText('No reviews need your attention in this scope.',{exact:true})).toBeVisible();await expect(queue(page).getByText('No evaluations match this scope.',{exact:true})).toHaveCount(0)
})
for(const origin of ['Overview','Analytics','Calibration'])test(`${origin} investigation failure and exact retry 390`,async({page})=>{
 await page.setViewportSize({width:390,height:844})
 const f=origin==='Calibration'?await calibrationFixture(page):await qualityFixture(page)
 const c=await control(page,f.store);c.fail=503
 if(origin==='Overview'){await page.getByLabel('Dashboard range').selectOption('30');await page.getByRole('button',{name:'Inspect critical evaluations →'}).click()}
 if(origin==='Analytics'){
  await navigateWorkspace(page,'Analytics');await page.getByRole('button',{name:'Change filters',exact:true}).click();await page.locator('.analytics-filter-bar').getByLabel('From',{exact:true}).fill('2026-09-01');await page.locator('.analytics-filter-bar').getByLabel('To',{exact:true}).fill('2026-09-30')
  await expect(page.getByRole('region',{name:'Selected quality cohort'})).toContainText('12 evaluations')
  await page.getByRole('region',{name:'What stands out'}).locator('article').filter({hasText:'Lowest average question'}).getByRole('button',{name:'Inspect evaluations →'}).click()
 }
 if(origin==='Calibration')await page.locator('.calibration-insight').getByRole('button',{name:'Open disagreements →',exact:true}).click()
 await expect(availability(page)).toContainText('Evaluations could not be loaded for this scope.');await noFalseEmpty(page);await expect(page.getByRole('region',{name:'Investigation scope'})).toBeVisible()
 if(origin!=='Overview')await expect(page.getByRole('button',{name:`Back to ${origin}`,exact:true})).toBeVisible()
 if(origin!=='Overview'){await expect(page.getByRole('region',{name:'Investigation scope'})).toContainText('Customer Service v17');await expect(page.getByRole('region',{name:'Investigation scope'})).toContainText('Clear next step')}
 await capture(page,`${origin.toLowerCase()}-failure-390`)
 const url=page.url(),requested=c.requests.at(-1)!.href;c.fail=0;await availability(page).getByRole('button',{name:'Retry',exact:true}).click();await expect(rows(page)).not.toHaveCount(0)
 expect(c.requests.at(-1)!.href).toBe(requested);expect(page.url()).toBe(url)
 if(origin==='Calibration'){await expect(page.getByRole('region',{name:'Investigation scope'})).toContainText('Customer Service v17');await expect(page.getByRole('region',{name:'Investigation scope'})).toContainText('Clear next step')}
 if(origin==='Calibration')expect(Object.fromEntries(c.requests.at(-1)!.searchParams)).toMatchObject({form:'general_service@17',reviewQuestion:'understanding',reviewStatus:'REVIEWED',comparison:'disagreements'})
 if(origin==='Analytics')expect(Object.fromEntries(c.requests.at(-1)!.searchParams)).toMatchObject({form:'general_service@17',question:'understanding',cohort:'analytics',from:'2026-09-01T00:00:00.000Z',to:'2026-09-30T23:59:59.999Z'})
 if(origin==='Overview')expect(c.requests.at(-1)!.searchParams.get('critical')).toBe('yes')
})

test('server failure cannot poison actual browser-local records',async({page})=>{
 const record=reviewFixture('local-only')
 await page.addInitScript(({key,record})=>localStorage.setItem(key,JSON.stringify([record])),{key:historyStorageKey,record})
 const f=await fixture(page);f.c.fail=503;await enter(page);await expect(availability(page)).toBeVisible()
 await page.getByRole('combobox',{name:'History',exact:true}).selectOption('browser');await expect(rows(page)).toHaveCount(1);await expect(rows(page).first()).toHaveAttribute('aria-label','Open evaluation local-only');await expect(availability(page)).toHaveCount(0)
 await page.getByRole('combobox',{name:'History',exact:true}).selectOption('server');await expect(availability(page)).toBeVisible();await noFalseEmpty(page)
})
test('failed authoritative detail cannot enter writable focused reviewer task',async({page})=>{
 await page.setViewportSize({width:390,height:844});await continuityFixture(page,undefined,{start:false})
 let fail=true;await page.route(`${api}/api/evaluations/*`,r=>fail?r.fulfill({status:503,json:{error:'Detail authority unavailable'}}):r.fallback())
 await page.getByRole('list',{name:'My review tasks'}).getByRole('button',{name:'Start review',exact:true}).first().click()
 await expect(page.locator('[aria-label="Evaluation details"]')).toContainText('Evaluation details could not be loaded.')
 await expect(page.getByRole('region',{name:'Review workspace'})).toHaveCount(0);await expect(page.getByRole('region',{name:'Human review'})).toHaveCount(0)
 await expect(page.getByRole('list',{name:'My review tasks'})).toBeVisible()
 fail=false;await page.getByRole('button',{name:'Retry details',exact:true}).click();await expect(page.getByRole('region',{name:'Review workspace'})).toBeVisible();await expect(page.getByRole('region',{name:'Review workspace'}).getByRole('heading',{level:1})).toBeFocused()
})
