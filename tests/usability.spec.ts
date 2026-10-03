import { test,expect } from '@playwright/test'
import { usabilityFixture,keyboardTo,insideMain,app } from './usability-fixture'
import { matchesEvaluationFilters } from '../src/domain/reviews'
import { investigationNow } from '../src/fixtures/investigationFixture'
import { reviewQueuePriority } from '../src/domain/reviewSla'
import type { Role } from '../src/domain/governance'
const nav=(page:any,name:string)=>page.getByRole('navigation',{name:'Primary navigation'}).locator('button').filter({has:page.getByText(name,{exact:true})})
for(const role of ['ADMIN','REVIEWER','AUTHOR','VIEWER'] as Role[])test(`evaluation mode default and permissions ${role}`,async({page})=>{
 const state=await usabilityFixture(page,role)
 const mode=page.getByRole('group',{name:'Evaluation mode'})
 if(role==='AUTHOR'||role==='VIEWER'){await expect(mode).toHaveCount(0);await expect(page.getByLabel('My review summary')).toHaveCount(0);return}
 await expect(mode.getByRole('button',{name:'My reviews',exact:true})).toHaveAttribute('aria-pressed',String(role==='REVIEWER'))
 await expect(page.getByLabel('Bulk review assignment')).toHaveCount(role==='ADMIN'?1:0)
 if(role==='REVIEWER') {
  await expect(page.getByLabel('My review summary')).toContainText('Available unassigned reviews (1)')
  const rows=page.locator('.operational-table tbody tr'),joined=await Promise.all((await state.store.evaluations()).map(async e=>({...e,humanReview:await state.store.review(e.id)})))
  const mine=joined.filter(e=>matchesEvaluationFilters(e,new URLSearchParams({reviewQueue:'mine',assignment:'mine'}),'admin',investigationNow)).sort((a,b)=>reviewQueuePriority(a,investigationNow).localeCompare(reviewQueuePriority(b,investigationNow)))
  await expect(rows).toHaveCount(mine.length)
  expect(await rows.evaluateAll(rs=>rs.map(r=>r.querySelector('button[aria-label^="Open evaluation"]')!.getAttribute('aria-label')!.replace('Open evaluation ','')))).toEqual(mine.map(e=>e.id))
  await expect(page.getByRole('columnheader',{name:'Human score',exact:true})).toHaveCount(0)
  await expect(page.getByLabel('Assignment',{exact:true})).toBeHidden()
  await expect(page.getByRole('columnheader',{name:'Queue priority',exact:true})).not.toHaveAttribute('aria-sort',/ascending|descending/)
  await page.getByRole('button',{name:/Available unassigned reviews/}).click()
  await expect(page).toHaveURL(/reviewStatus=REVIEW_REQUESTED/);await expect(page).toHaveURL(/assignment=unassigned/)
  await expect(page.locator('.operational-table tbody tr')).toHaveCount(1)
  await mode.getByRole('button',{name:'My reviews',exact:true}).click()
  await expect(page).toHaveURL(/reviewQueue=mine/);await expect(rows).toHaveCount(mine.length)
  await expect(page.getByLabel('My review summary')).toContainText('Escalated')
  const request=state.requests.filter(u=>u.pathname==='/api/evaluations').at(-1)!
  expect(request.searchParams.get('assignment')).toBe('mine');expect([...request.searchParams.values()]).not.toContain('admin')
 }
 await mode.getByRole('button',{name:'All evaluations',exact:true}).click()
 await expect(page.getByLabel('Assignment',{exact:true})).toBeVisible()
 expect(state.errors).toEqual([])
})
for(const query of ['reviewQueue=active','evaluationId=escalated','cohort=analytics&form=general_service%4017&question=greeting&origin=analytics','reviewStatus=REVIEW_REQUESTED&assignment=unassigned'])test(`reviewer respects explicit scope ${query}`,async({page})=>{
 await usabilityFixture(page,'REVIEWER',`page=evaluations&${query}`)
 await expect(page.getByRole('group',{name:'Evaluation mode'}).getByRole('button',{name:'All evaluations',exact:true})).toHaveAttribute('aria-pressed','true')
 expect(new URL(page.url()).searchParams.get('reviewQueue')).not.toBe('mine')
 if(query==='reviewQueue=active'){await page.getByRole('button',{name:'All evaluations',exact:true}).click();expect(new URL(page.url()).searchParams.get('reviewQueue')).toBe('active')}
 if(query.startsWith('evaluationId')) {const detail=page.locator('.evaluation-detail');await expect(detail.locator('h2').first()).toBeFocused();await keyboardTo(page,detail.getByRole('button',{name:'Close details',exact:true}));await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeFocused()}
})
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
 test(`keyboard details, reviewer actions and viewport bounds ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await usabilityFixture(page,'REVIEWER')
  const mode=page.getByRole('group',{name:'Evaluation mode'})
  for(const button of await mode.getByRole('button').all())await insideMain(page,button)
  const open=page.getByRole('button',{name:'Open evaluation escalated',exact:true})
  await expect(open).toBeVisible();await page.screenshot({path:`docs/v018e-evidence/my-reviews-${viewport.width}.png`,fullPage:true})
  await keyboardTo(page,open);await page.keyboard.press('Enter')
  const detail=page.locator('.evaluation-detail'),heading=detail.locator('h2').first(),close=detail.getByRole('button',{name:'Close details',exact:true})
  await expect(heading).toBeFocused();expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(0)
  await insideMain(page,close);await page.screenshot({path:`docs/v018e-evidence/reviewer-detail-${viewport.width}.png`,fullPage:false})
  await keyboardTo(page,close);await page.keyboard.press('Enter');await expect(open).toBeFocused()
  const start=page.locator('tr').filter({has:open}).getByRole('button',{name:'Start review',exact:true});await keyboardTo(page,start);await page.keyboard.press('Space')
  await expect(page.getByRole('region',{name:'Human review',exact:true}).getByRole('heading',{name:'Review this evaluation'})).toBeFocused()
  await page.screenshot({path:`docs/v018e-evidence/review-action-${viewport.width}.png`,fullPage:false})
  expect(state.errors).toEqual([]);await context.close()
 })
 test(`mobile heading actions and local form/group keyboard journeys ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage()
  await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(app).origin?r.continue():r.abort())
  await page.goto(`${app}?page=conversations`)
  for(const name of ['Table','Cards'])await insideMain(page,page.getByRole('group',{name:'View',exact:true}).getByRole('button',{name,exact:true}))
  await page.screenshot({path:`docs/v018e-evidence/conversations-${viewport.width}.png`,fullPage:true})
  const conversation=page.getByRole('button',{name:/^Open conversation /}).first();await keyboardTo(page,conversation);await page.keyboard.press('Enter')
  for(const name of [/Back to conversations/,/^Browse .*samples/])await insideMain(page,page.getByRole('button',{name}))
  await page.screenshot({path:`docs/v018e-evidence/conversation-review-${viewport.width}.png`,fullPage:true})
  for(const [name,prefix,detailClass] of [['Evaluation Forms','Open form ','.form-detail'],['Question Groups','Open reusable question group ','.asset-detail']]){
   await keyboardTo(page,nav(page,name));await page.keyboard.press('Enter')
   const open=page.getByRole('button',{name:new RegExp(`^${prefix}`)}).first();await keyboardTo(page,open);await page.keyboard.press('Enter')
   const detail=page.locator(detailClass);await expect(detail.locator('h2').first()).toBeFocused();await expect(detail).toContainText('Published version is locked.')
   const close=detail.getByRole('button',{name:'Close details',exact:true});await insideMain(page,close);await detail.locator('.form-meta').screenshot({path:`docs/v018e-evidence/${name==='Evaluation Forms'?'form':'group'}-${viewport.width}.png`})
   await keyboardTo(page,close);await page.keyboard.press('Space');await expect(open).toBeFocused()
  }
  await context.close()
 })
}
test('keyboard run, alert, audit, policy and calibration drill',async({page})=>{
 const state=await usabilityFixture(page)
 await keyboardTo(page,nav(page,'Overview'));await page.keyboard.press('Enter')
 const operations=page.locator('.overview-operations>summary');await keyboardTo(page,operations);await page.keyboard.press('Enter')
 const run=page.getByRole('button',{name:/^Open run /}).first();await keyboardTo(page,run);await page.keyboard.press('Enter')
 await expect(page.locator('.run-detail').getByRole('heading',{name:/· Run detail$/})).toBeFocused();await keyboardTo(page,page.locator('.run-detail').getByRole('button',{name:'Close details'}));await page.keyboard.press('Enter');await expect(run).toBeFocused()
 const alert=page.getByRole('button',{name:'Open alert Scheduled run failed',exact:true});await keyboardTo(page,alert);await page.keyboard.press('Enter')
 await expect(page.locator('.alert-detail h3')).toBeFocused();await keyboardTo(page,page.getByRole('button',{name:'Close alert',exact:true}));await page.keyboard.press('Enter');await expect(alert).toBeFocused()
 await keyboardTo(page,nav(page,'Policies'));await page.keyboard.press('Enter');const policy=page.locator('.operational-table .text-link').first();await keyboardTo(page,policy);await page.keyboard.press('Enter');await expect(page.locator('.policy-detail h2').first()).toBeFocused();await keyboardTo(page,page.locator('.policy-detail').getByRole('button',{name:'Close details'}));await page.keyboard.press('Enter');await expect(policy).toBeFocused()
 await keyboardTo(page,nav(page,'Calibration'));await page.keyboard.press('Enter');const form=page.getByRole('button',{name:/^Open calibration /}).first();await keyboardTo(page,form);await page.keyboard.press('Enter');const question=page.getByRole('button',{name:/^Open calibration /}).first();await keyboardTo(page,question);await page.keyboard.press('Enter');await expect(page.locator('.calibration-drill h2')).toBeFocused()
 await keyboardTo(page,nav(page,'Settings'));await page.keyboard.press('Enter');const auditNav=page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Audit',exact:true});await keyboardTo(page,auditNav);await page.keyboard.press('Enter');await keyboardTo(page,page.getByRole('button',{name:'Load audit history'}));await page.keyboard.press('Enter');const event=page.getByRole('button',{name:/^Open audit event/});await keyboardTo(page,event);await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Audit event detail'})).toBeFocused()
 expect(state.errors).toEqual([])
})
test('policy read-only reason is permission based',async({page})=>{
 await usabilityFixture(page,'VIEWER');await keyboardTo(page,nav(page,'Policies'));await page.keyboard.press('Enter')
 const open=page.locator('.operational-table .text-link').first();await keyboardTo(page,open);await page.keyboard.press('Enter')
 await expect(page.locator('.policy-detail')).toContainText('You have read-only access. Your role cannot edit this configuration.')
 const name=page.getByLabel('Policy name',{exact:true});await expect(name).toBeEnabled();await expect(name).toHaveAttribute('readonly','')
})

test('notification editor focus and cancel return to explicit controls',async({page})=>{
 await usabilityFixture(page);await keyboardTo(page,nav(page,'Settings'));await page.keyboard.press('Enter')
 const notifications=page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Notifications',exact:true});await keyboardTo(page,notifications);await page.keyboard.press('Enter')
 for(const [opener,heading,cancel] of [['Edit Fixture email','Edit destination','Cancel destination'],['Edit rule Fixture alerts','Edit rule','Cancel rule']]){
  const open=page.getByRole('button',{name:opener,exact:true});await keyboardTo(page,open);await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:heading,exact:true})).toBeFocused();await keyboardTo(page,page.getByRole('button',{name:cancel,exact:true}));await page.keyboard.press('Enter');await expect(open).toBeFocused()
 }
})
