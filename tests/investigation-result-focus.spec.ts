import {test,expect,type Page} from '@playwright/test'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {qualityFixture,api} from './qualityActionabilityFixture'
import {continuityFixture} from './reviewer-continuity-fixture'
import {calibrationFixture} from './calibrationDiscoveryFixture'
import {navigateWorkspace,chooseView} from './workspace-navigation'
const baseline=process.env.AQM_FOCUS_BASELINE==='1'
const output=process.env.AQM_FOCUS_EVIDENCE??`docs/v021b-evidence/${baseline?'before':'after'}`
mkdirSync(output,{recursive:true})
const rows=(p:Page)=>p.locator('.evaluation-queue button[data-evaluation-id]')
const heading=(p:Page)=>p.getByRole('heading',{name:'Matching evaluations',exact:true})
const jump=(p:Page)=>p.getByRole('button',{name:'Jump to first evaluation',exact:true})
async function source(p:Page,origin:string){
 const requests:string[]=[]
 p.on('request',r=>{if(new URL(r.url()).origin===api)requests.push(r.method()+' '+r.url())})
 const f=origin==='analytics'?await qualityFixture(p):await calibrationFixture(p,'&form=general_service@17&source=genesys-cloud&from=2026-09-01&to=2026-09-30&agent=Fixture%20Agent&queue=Customer%20care&calibrationTab=questions')
 if(origin==='analytics'){
  await navigateWorkspace(p,'Analytics');await p.getByRole('button',{name:'Change filters',exact:true}).click()
  const bar=p.locator('.analytics-filter-bar')
  await bar.getByLabel('From',{exact:true}).fill('2026-09-01');await bar.getByLabel('To',{exact:true}).fill('2026-09-30')
  await bar.getByLabel('Agent',{exact:true}).fill('Sam');await bar.getByLabel('Queue',{exact:true}).fill('Claims');await bar.getByLabel('Source',{exact:true}).selectOption('genesys-cloud');await bar.getByLabel('Form',{exact:true}).selectOption('general_service@17')
  await bar.getByText('Advanced filters',{exact:true}).click();await bar.getByLabel('Policy',{exact:true}).selectOption('daily_voice');await bar.getByLabel('Channel',{exact:true}).fill('voice');await bar.getByLabel('Trigger',{exact:true}).selectOption('scheduled')
  await p.getByRole('button',{name:'Change filters',exact:true}).click();await chooseView(p,'Questions')
 }else await p.getByRole('region',{name:'Where humans and AI differ'}).getByRole('button',{name:'Inspect question →'}).click()
 const action=origin==='analytics'?p.locator('.quality-analytics tbody tr').filter({hasText:'Clear next step'}).getByRole('button',{name:'Inspect evaluations →'}):p.getByRole('region',{name:'Question calibration drill-down'}).getByRole('button',{name:'Open disagreements',exact:true})
 return {f,requests,action,close:async()=>{if('close' in f)await f.close()}}
}
async function capture(p:Page,name:string){
 expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await p.screenshot({path:`${output}/${name}.png`,fullPage:true});await p.screenshot({path:`${output}/${name}-viewport.png`})
 writeFileSync(`${output}/${name}.aria.yml`,await p.locator('main').ariaSnapshot())
}
for(const origin of ['analytics','calibration'])for(const size of [{width:1440,height:900},{width:390,height:844},...baseline?[]:[{width:1920,height:1080},{width:1440,height:720}]])test(`${origin} exact keyboard/history ${size.width}x${size.height}`,async({page})=>{
 await page.setViewportSize(size);const s=await source(page,origin)
 try{
  await capture(page,`${origin}-source-${size.width}x${size.height}`)
  const sourceUrl=page.url(),historyBefore=await page.evaluate(()=>history.length)
  // The source action is keyboard activated, so entry measurements have a real opener.
  await s.action.focus();await page.keyboard.press('Enter');await expect(rows(page)).toHaveCount(origin==='analytics'?3:5)
  const url=page.url(),ids=await rows(page).evaluateAll(ns=>ns.map(n=>n.getAttribute('data-evaluation-id')))
  const scope=await page.getByRole('region',{name:'Investigation scope'}).innerText()
  const requests=s.requests.slice(),entryFocus=await page.evaluate(()=>({tag:document.activeElement?.tagName,text:document.activeElement?.textContent}))
  let tabs=0
  if(baseline){while(!(await rows(page).first().evaluate(n=>n===document.activeElement))&&tabs<100){await page.keyboard.press('Tab');tabs++}expect(tabs).toBeLessThan(100)}
  else {
   await expect(heading(page)).toBeFocused()
   for(const name of ['History','Review status','Assignment','SLA state','Result','Source','Trigger','Critical failure'])await expect(page.locator('.evaluation-queue').getByRole('combobox',{name,exact:true})).toBeVisible()
   for(const label of ['Agent','Queue','Channel','From','To'])await expect(page.locator('.evaluation-queue').getByLabel(label,{exact:true})).toBeVisible()
   await expect(page.locator('.evaluation-queue .exact-reference-filters')).not.toHaveAttribute('open','')
   const box=await heading(page).boundingBox();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y).toBeLessThan(size.height)
   await expect(jump(page)).toBeInViewport();await capture(page,`${origin}-heading-${size.width}x${size.height}`);await page.keyboard.press('Tab');await expect(jump(page)).toBeFocused();tabs++
   const before=s.requests.length;await page.keyboard.press('Enter');await expect(rows(page).first()).toBeFocused();expect(s.requests.length).toBe(before);await expect(page).toHaveURL(url)
  }
  await capture(page,`${origin}-destination-${size.width}x${size.height}`)
  const data={base:'77f4f0870378e342b633cfd4821476941ec1bd70',sourceUrl,url,scope,ids,requests,entryFocus,tabs,keyboardActions:baseline?tabs:2}
  if(!baseline&&[1440,390].includes(size.width)&&size.height!==720){const before=JSON.parse(readFileSync(`${process.env.AQM_FOCUS_COMPARISON??'docs/v021b-evidence/before'}/${origin}-${size.width}x${size.height}.json`,'utf8'));for(const key of ['sourceUrl','url','scope','ids','requests']){const value=data[key as keyof typeof data];if(process.env.AQM_BROWSER_URL&&['sourceUrl','url'].includes(key))expect(new URL(value as string).search).toBe(new URL(before[key]).search);else expect(value).toEqual(before[key])}}
  writeFileSync(`${output}/${origin}-${size.width}x${size.height}.json`,JSON.stringify(data,null,2))
  if(!baseline){
   await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'Close details',exact:true})).toBeVisible()
   await page.getByRole('button',{name:'Close details',exact:true}).click();await expect(rows(page).first()).toBeFocused()
   await page.route(`${api}/api/evaluations/*`,async r=>{const id=new URL(r.request().url()).pathname.split('/').at(-1)!;return r.fulfill({json:{...await s.f.store.evaluation(id),humanReview:await s.f.store.review(id),conversationId:'syn-incomplete-resolution'}})})
   await rows(page).first().click();await page.getByRole('button',{name:'Open conversation',exact:true}).click()
   await expect(page.getByRole('button',{name:'← Back to evaluation',exact:true})).toBeVisible();await page.getByRole('button',{name:'← Back to evaluation',exact:true}).click()
   await expect(page.getByRole('button',{name:'Close details',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.activeElement?.id)).not.toBe('evaluation-results-heading')
   await page.getByRole('button',{name:'Close details',exact:true}).click()
   
  }
  await page.goBack();await expect(page).toHaveURL(sourceUrl);await expect(s.action).toBeVisible()
  await page.goForward();await expect(page).toHaveURL(url);await expect(rows(page)).toHaveCount(ids.length)
  if(!baseline)await expect(heading(page)).toBeFocused()
  expect(await page.evaluate(()=>history.length)).toBe(historyBefore+1)
  expect(await rows(page).evaluateAll(ns=>ns.map(n=>n.getAttribute('data-evaluation-id')))).toEqual(ids)
  if(!baseline){for(const width of [1440,390,1440]){await page.setViewportSize({width,height:width===390?844:900});await expect(page).toHaveURL(url);expect(await rows(page).evaluateAll(ns=>ns.map(n=>n.getAttribute('data-evaluation-id')))).toEqual(ids);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}}
  expect(s.f.errors).toEqual([]);expect(s.f.blocked).toEqual([]);if('writes' in s.f)expect(s.f.writes).toEqual([])
  writeFileSync(`${output}/${origin}-network-${size.width}x${size.height}.json`,JSON.stringify({errors:s.f.errors,blocked:s.f.blocked,writes:'writes' in s.f?s.f.writes:[],methods:s.requests.map(r=>r.split(' ')[0])},null,2))
 }finally{await s.close()}
})
if(!baseline){
for(const origin of ['analytics','calibration'])test(`${origin} filter, refresh, pagination and rendered order never re-focus`,async({page})=>{
 const s=await source(page,origin)
 try{
  let cursor=false,fail=false;const queries:string[]=[]
  await page.route(`${api}/api/evaluations?*`,async r=>{queries.push(r.request().url());if(fail)return r.fulfill({status:503,json:{error:'Fictional retained-page failure'}});const u=new URL(r.request().url());cursor=u.searchParams.has('cursor');return r.fulfill({json:{items:(await s.f.store.evaluations()).slice(cursor?1:0,cursor?4:3),nextCursor:cursor?undefined:'page-two'}})})
  await s.action.click();await expect(heading(page)).toBeFocused();await expect(rows(page)).toHaveCount(3)
  await page.evaluate(()=>{(window as any).resultFocuses=0;document.addEventListener('focusin',e=>{if((e.target as HTMLElement).id==='evaluation-results-heading')(window as any).resultFocuses++})})
  await page.keyboard.press('Shift+Tab');expect(await heading(page).evaluate(n=>n===document.activeElement)).toBe(false)
  const queue=page.getByLabel('Queue',{exact:true});await queue.fill('Changed fictional queue');await expect.poll(()=>queries.at(-1)?.includes('Changed+fictional+queue')).toBe(true);await expect(rows(page)).toHaveCount(3);await expect(queue).toBeFocused()
  const refresh=page.getByRole('button',{name:'Refresh',exact:true});await refresh.focus();await page.keyboard.press('Enter');await expect(refresh).toBeEnabled();expect(await page.evaluate(()=>document.activeElement?.id)).not.toBe('evaluation-results-heading')
  await page.getByRole('button',{name:'Next page →'}).click();await expect(page.getByRole('button',{name:'First page',exact:true})).toBeEnabled();expect(cursor).toBe(true);expect(await page.evaluate(()=>document.activeElement?.id)).not.toBe('evaluation-results-heading')
  await page.getByRole('button',{name:'First page',exact:true}).click();await expect(page.getByRole('button',{name:'First page',exact:true})).toBeDisabled();expect(cursor).toBe(false)
  // Jump follows the actual rendered order after client sort/search, without selection/request/URL changes.
  await page.locator('.evaluation-queue th').getByRole('button',{name:/Agent/}).click();await page.getByLabel('Search table').last().fill('')
  const first=await rows(page).first().getAttribute('data-evaluation-id'),url=page.url(),requests=queries.length
  await jump(page).click();await expect(rows(page).first()).toBeFocused();expect(await rows(page).first().getAttribute('data-evaluation-id')).toBe(first);expect(queries.length).toBe(requests);await expect(page).toHaveURL(url)
  fail=true;await refresh.click();await expect(page.getByLabel('Evaluation availability')).toContainText('Couldn’t refresh evaluations.');await expect(rows(page)).toHaveCount(3)
  expect(await page.evaluate(()=>(window as any).resultFocuses)).toBe(0)
  writeFileSync(`${output}/${origin}-no-refocus.json`,JSON.stringify({resultFocusEvents:0,queries,retainedRowsOnRefreshFailure:3,firstRendered:first},null,2))
 }finally{await s.close()}
})
for(const state of ['empty','failure'])test(`investigation initial ${state} and retry authority`,async({page})=>{
 const s=await source(page,'analytics');let fail=state==='failure'
 await page.route(`${api}/api/evaluations?*`,r=>fail?r.fulfill({status:503,json:{error:'Fictional diagnostic'}}):r.fulfill({json:{items:[]}}))
 await s.action.click()
 if(fail){
  const availability=page.getByLabel('Evaluation availability');await expect(availability).toContainText('Evaluations could not be loaded for this scope.');await expect(heading(page)).toHaveCount(0);await expect(jump(page)).toHaveCount(0)
  await capture(page,'initial-failure');fail=false;await availability.getByRole('button',{name:'Retry',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeFocused();expect(await page.evaluate(()=>document.activeElement?.id)).not.toBe('evaluation-results-heading')
 }else await expect(heading(page)).toBeFocused()
 await expect(page.getByRole('region',{name:'Matching evaluations'})).toContainText('0 evaluations on this loaded page match this investigation.')
 await expect(page.getByText('No evaluations match this scope.',{exact:true})).toBeVisible();await expect(jump(page)).toHaveCount(0);await expect(rows(page)).toHaveCount(0);await capture(page,`initial-${state}-success`)
})
for(const urlQuery of ['page=evaluations','page=evaluations&origin=analytics','page=evaluations&origin=overview&form=general_service%4017','page=evaluations&entry=showcase'])test(`ordinary entry control ${urlQuery}`,async({page})=>{
 await qualityFixture(page);await page.evaluate(q=>{history.pushState(null,'','?'+q);dispatchEvent(new PopStateEvent('popstate'))},urlQuery)
 await expect(rows(page)).toHaveCount(urlQuery.includes('form=')?8:12);await expect(heading(page)).toHaveCount(0);await expect(jump(page)).toHaveCount(0)
})
}

if(!baseline)test('dirty Human review evidence return owns focus, including Forward with evaluationId',async({page})=>{
 const f=await continuityFixture(page,'page=analytics&analyticsTab=questions&form=general_service%4017&source=genesys-cloud')
 const sourceUrl=page.url();await page.locator('.quality-analytics tbody tr').filter({hasText:'Warm opening'}).getByRole('button',{name:'Inspect evaluations →'}).click()
 await expect(heading(page)).toBeFocused();await page.keyboard.press('Tab');await page.keyboard.press('Enter');await page.keyboard.press('Enter')
 const note=page.getByRole('region',{name:'Human review',exact:true}).getByLabel('Overall review note',{exact:true})
 await note.fill('Fictional pending review');const detailUrl=page.url()
 await page.goBack();await expect(page).toHaveURL(sourceUrl);await page.goForward();await expect(page).toHaveURL(detailUrl);await expect(note).toHaveValue('Fictional pending review');expect(await page.evaluate(()=>document.activeElement?.id)).not.toBe('evaluation-results-heading')
 await page.getByRole('button',{name:/^Open conversation(?: evidence)?$/}).click();await page.getByRole('button',{name:'← Back to human review',exact:true}).click()
 await expect(page.getByRole('region',{name:'Human review',exact:true}).getByRole('heading',{level:2})).toBeFocused();await expect(note).toHaveValue('Fictional pending review');expect(await page.evaluate(()=>document.activeElement?.id)).not.toBe('evaluation-results-heading')
 expect(f.forbidden).toEqual([]);expect(f.errors).toEqual([])
})
