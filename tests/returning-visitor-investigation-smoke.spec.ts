import {test,expect} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'
import {qualityFixture,api} from './qualityActionabilityFixture'
import {calibrationFixture} from './calibrationDiscoveryFixture'
import {navigateWorkspace,chooseView} from './workspace-navigation'
const out=process.env.AQM_RETURNING_EVIDENCE??'docs/v0211-evidence/local'
mkdirSync(out,{recursive:true})
for(const origin of ['analytics','calibration'])for(const width of [1440,390])test(`V0.21B ${origin} result focus smoke ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:900})
 const requests:string[]=[]
 page.on('request',r=>{if(new URL(r.url()).origin===api)requests.push(r.method()+' '+r.url())})
 const f=origin==='analytics'?await qualityFixture(page):await calibrationFixture(page,'&form=general_service@17&source=genesys-cloud&from=2026-09-01&to=2026-09-30&agent=Fixture%20Agent&queue=Customer%20care&calibrationTab=questions')
 try{
  if(origin==='analytics'){
   await navigateWorkspace(page,'Analytics');await page.getByRole('button',{name:'Change filters',exact:true}).click()
   const bar=page.locator('.analytics-filter-bar')
   await bar.getByLabel('From',{exact:true}).fill('2026-09-01');await bar.getByLabel('To',{exact:true}).fill('2026-09-30')
   await bar.getByLabel('Agent',{exact:true}).fill('Sam');await bar.getByLabel('Queue',{exact:true}).fill('Claims');await bar.getByLabel('Source',{exact:true}).selectOption('genesys-cloud');await bar.getByLabel('Form',{exact:true}).selectOption('general_service@17')
   await bar.getByText('Advanced filters',{exact:true}).click();await bar.getByLabel('Policy',{exact:true}).selectOption('daily_voice');await bar.getByLabel('Channel',{exact:true}).fill('voice');await bar.getByLabel('Trigger',{exact:true}).selectOption('scheduled')
   await page.getByRole('button',{name:'Change filters',exact:true}).click();await chooseView(page,'Questions')
  }
  else await page.getByRole('region',{name:'Where humans and AI differ'}).getByRole('button',{name:'Inspect question →'}).click()
  const action=origin==='analytics'?page.locator('.quality-analytics tbody tr').filter({hasText:'Clear next step'}).getByRole('button',{name:'Inspect evaluations →'}):page.getByRole('region',{name:'Question calibration drill-down'}).getByRole('button',{name:'Open disagreements',exact:true})
  const source=page.url(),historyLength=await page.evaluate(()=>history.length)
  await action.focus();await page.keyboard.press('Enter')
  const heading=page.getByRole('heading',{name:'Matching evaluations',exact:true}),jump=page.getByRole('button',{name:'Jump to first evaluation',exact:true}),rows=page.locator('.evaluation-queue button[data-evaluation-id]')
  await expect(heading).toBeFocused();await expect(rows.first()).toBeVisible();await expect(jump).toBeInViewport()
  const url=page.url(),ids=await rows.evaluateAll(ns=>ns.map(n=>n.getAttribute('data-evaluation-id'))),requestCount=requests.length
  await page.keyboard.press('Tab');await expect(jump).toBeFocused();await page.keyboard.press('Enter');await expect(rows.first()).toBeFocused();expect(requests.length).toBe(requestCount);await expect(page).toHaveURL(url)
  await page.screenshot({animations:'disabled',path:`${out}/${origin}-focus-${width}.png`})
  const aria=await page.locator('main').ariaSnapshot()
  await page.goBack();await expect(page).toHaveURL(source);await expect(action).toBeVisible()
  await page.goForward();await expect(page).toHaveURL(url);await expect(heading).toBeFocused()
  expect(await rows.evaluateAll(ns=>ns.map(n=>n.getAttribute('data-evaluation-id')))).toEqual(ids)
  expect(await page.evaluate(()=>history.length)).toBe(historyLength+1)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  expect(f.errors).toEqual([]);expect(f.blocked).toEqual([]);if('writes' in f)expect(f.writes).toEqual([])
  expect(requests.every(r=>r.startsWith('GET '))).toBe(true)
  writeFileSync(`${out}/${origin}-focus-${width}.json`,JSON.stringify({source,url,ids,aria,requests,addedJumpRequests:0,errors:f.errors,blocked:f.blocked,fixture:'fictional APIs'},null,2))
 }finally{if('close' in f)await f.close()}
})
