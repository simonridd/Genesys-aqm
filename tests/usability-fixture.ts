import { writeFileSync } from 'node:fs'
import { expect, type Page } from '@playwright/test'
import { investigationFixture, investigationNow } from '../src/fixtures/investigationFixture'
import { overviewAuthority } from '../src/fixtures/overviewFixture'
import { operationalOverview } from '../src/server/overview'
import { operationalAnalytics } from '../src/server/analytics'
import { matchesEvaluationFilters } from '../src/domain/reviews'
import { calibrationAnalytics } from '../src/server/reviews'
import { reviewWorkload } from '../src/server/reviewOperations'
import { governanceSettings } from '../src/server/governance'
import { rolePermissions, type Role } from '../src/domain/governance'
import { seedGroupAssets } from '../src/domain/seedGroupAssets'
import { reviewQueuePriority } from '../src/domain/reviewSla'
export const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/'
export async function usabilityFixture(page:Page,role:Role='ADMIN',query='page=evaluations') {
 const store=await investigationFixture(),requests:URL[]=[],errors:string[]=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.clock.install({time:new Date(investigationNow)})
 await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fixture-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'evaluations'})))
 await page.route('**/*',async r=>{
  const u=new URL(r.request().url()),p=u.pathname
  if(u.origin===new URL(app).origin)return r.continue()
  if(u.origin==='https://login.mypurecloud.ie'&&p==='/oauth/token')return r.fulfill({json:{access_token:'fixture',token_type:'Bearer',expires_in:3600}})
  if(u.origin==='https://api.mypurecloud.ie'&&p==='/api/v2/users/me')return r.fulfill({json:{id:'admin',name:'Fixture reviewer',organization:{id:'fixture'}}})
  if(u.origin!=='https://aqm-api-bd54ukouga-nw.a.run.app')return r.abort()
  requests.push(u);expect(r.request().method()).toBe('GET')
  const json=(v:unknown)=>r.fulfill({json:v})
  if(p==='/api/session')return json({actor:{userId:'admin'},role,permissions:rolePermissions[role]})
  if(p==='/api/governance')return json(await governanceSettings(store))
  if(p==='/api/overview')return json(await operationalOverview(store,investigationNow,30,overviewAuthority,true))
  if(p==='/api/analytics')return json(await operationalAnalytics(store,u.searchParams))
  if(p==='/api/calibration')return json(await calibrationAnalytics(store,u.searchParams))
  if(p==='/api/review-workload')return json(await reviewWorkload(store,investigationNow,overviewAuthority))
  if(p==='/api/evaluations'){
   const rows=await Promise.all((await store.evaluations()).map(async e=>({...e,humanReview:await store.review(e.id)})))
   const items=rows.filter(e=>matchesEvaluationFilters(e,u.searchParams,'admin',investigationNow,(awaitedSettings).reviewSla))
   if(u.searchParams.get('reviewQueue')==='mine')items.sort((a,b)=>reviewQueuePriority(a,investigationNow).localeCompare(reviewQueuePriority(b,investigationNow)))
   return json({items:items.slice(0,50)})
  }
  if(p.startsWith('/api/evaluations/')){const id=p.split('/')[3];return json({...await store.evaluation(id),humanReview:await store.review(id)})}
  if(p==='/api/forms')return json({items:await store.forms()})
  if(p==='/api/question-groups')return json({items:seedGroupAssets})
  if(p==='/api/policies')return json({items:await store.policies()})
  if(p==='/api/schedules')return json({items:await store.schedules()})
  if(p==='/api/runs')return json({items:await store.runs()})
  if(p.startsWith('/api/runs/'))return json(await store.run(p.split('/')[3]))
  if(p==='/api/alerts')return json({items:await store.alerts(true)})
  if(p.startsWith('/api/alerts/')&&!p.endsWith('/notifications'))return json({item:await store.alert(p.split('/')[3])})
  if(p==='/api/notifications/destinations')return json({items:[{id:'fixture-destination',name:'Fixture email',type:'EMAIL',enabled:true,configuration:{from:'fixture@example.test',to:['recipient@example.test']}}]})
  if(p==='/api/notifications/rules')return json({items:[{id:'fixture-rule',name:'Fixture alerts',enabled:true,severities:['ERROR'],alertTypes:[],destinationIds:['fixture-destination'],notifyOnResolution:false}]})
  if(p==='/api/audit')return json({items:[{id:'audit-fixture',occurredAt:investigationNow,actor:{userId:'admin'},action:'Policy updated',resourceType:'policy',resourceId:'policy',summary:'Fixture policy',metadata:{safe:true}}]})
  return json({items:[]})
 })
 const awaitedSettings=await governanceSettings(store)
 await page.goto(`${app}?${query}&code=fixture&state=${'A'.repeat(43)}`)
 await expect(page.getByLabel('Current role')).toHaveText(role)
 return {store,requests,errors}
}
export async function keyboardTo(page:Page, locator:ReturnType<Page['getByRole']>) {
 const group=locator.locator('xpath=ancestor::details')
 if(await group.count()&&await locator.evaluate(e=>e.tagName!=='SUMMARY')&&await group.getAttribute('open')===null){await keyboardTo(page,group.locator('summary'));await page.keyboard.press('Enter')}

 for(let i=0;i<120;i++) {if(await locator.evaluate(e=>e===document.activeElement))return;await page.keyboard.press('Tab')}
 throw Error('Control is not reachable by Tab')
}
const bounds:unknown[]=[]
export async function insideMain(page:Page,locator:ReturnType<Page['getByRole']>) {
 await locator.scrollIntoViewIfNeeded()
 const box=await locator.boundingBox(),main=await page.locator('main').boundingBox()
 expect(box).not.toBeNull();expect(main).not.toBeNull()
 bounds.push({viewport:page.viewportSize(),control:await locator.innerText(),box,main});writeFileSync('docs/v018e-evidence/bounding-boxes.json',JSON.stringify(bounds,null,2))
 expect(box!.y).toBeGreaterThanOrEqual(-1);expect(box!.y+box!.height).toBeLessThanOrEqual(page.viewportSize()!.height+1)
 expect(box!.x).toBeGreaterThanOrEqual(Math.max(0,main!.x));expect(box!.x+box!.width).toBeLessThanOrEqual(Math.min(page.viewportSize()!.width,main!.x+main!.width)+1)
}
