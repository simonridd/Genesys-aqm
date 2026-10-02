import { test,expect } from '@playwright/test'
import { defaultGovernance,rolePermissions,type Role } from '../src/domain/governance'
import { seedForms } from '../src/domain/forms'
import { reviewFixture } from '../src/fixtures/reviewFixture'
import { buildReview,type HumanReview } from '../src/domain/reviews'
const origin='https://aqm-api-bd54ukouga-nw.a.run.app',app='http://127.0.0.1:4174/Genesys-aqm/'
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])for(const role of ['ADMIN','AUTHOR','REVIEWER','VIEWER'] as Role[])test(`${role} governance at ${viewport.width}`,async({browser})=>{
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 let settings={...defaultGovernance},form={...structuredClone(seedForms[0]),id:'draft_fixture',name:'Governance draft fixture',status:'DRAFT',enabled:false},review:HumanReview|undefined,forbid=false,executed=false
 const record=reviewFixture('fixture_evaluation'),actor={userId:'fixture-user',displayName:'Fixture operator'}
 await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'settings'})))
 await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}))
 await page.route('https://api.mypurecloud.ie/**',r=>r.fulfill({json:{id:actor.userId,name:actor.displayName,organization:{id:'fixture-org'}}}))
 await page.route('https://api.typesafe.ai/**',()=>{throw Error('Live Jev calls prohibited')})
 await page.route(`${origin}/**`,async r=>{
  const u=new URL(r.request().url()),p=u.pathname,m=r.request().method()
  if(p==='/api/session')return r.fulfill({json:{actor,role,permissions:rolePermissions[role],bootstrap:role==='ADMIN'}})
  if(p==='/api/governance'){if(m==='PUT'){settings=r.request().postDataJSON()}return r.fulfill({json:settings})}
  if(p==='/api/roles')return r.fulfill({json:{items:[{id:actor.userId,userId:actor.userId,role:'ADMIN',updatedAt:'2026-10-01T12:00:00Z'}]}})
  if(p.startsWith('/api/roles/')&&m==='PUT')return r.fulfill({json:{item:{id:p.split('/').at(-1),role:r.request().postDataJSON().role}}})
  if(p==='/api/audit'||p==='/api/history')return r.fulfill({json:{items:[{id:'audit_fixture',occurredAt:'2026-10-01T12:00:00Z',actor,action:'form.publish',resourceType:'form',resourceId:form.id,summary:'form publish',metadata:{version:1},correlationId:'fixture'}]}})
  if(p==='/api/retention/preview')return r.fulfill({json:{id:'plan_fixture',counts:{evaluations:2,reviews:1,policyRuns:0,alerts:0,audit:0},scanned:3,complete:true,continuation:{}}})
  if(p==='/api/retention/execute'){expect(r.request().postDataJSON()).toEqual({planId:'plan_fixture',confirmation:'PURGE'});executed=true;return r.fulfill({json:{plan:{id:'plan_fixture',counts:{evaluations:2,reviews:1},scanned:3,complete:true,continuation:{},executed:true}}})}
  if(p==='/api/forms')return r.fulfill({json:{items:[form]}})
  if(p===`/api/forms/${form.id}`&&m==='PUT'){if(forbid)return r.fulfill({status:403,json:{error:'Forbidden: your role does not permit this action.'}});form=r.request().postDataJSON();return r.fulfill({json:{item:form}})}
  if(p==='/api/analytics')return r.fulfill({json:{byForm:[],quality:{},coverage:{},groups:[]}})
  if(p==='/api/evaluations')return r.fulfill({json:{items:[{...record,humanReview:review}]}})
  if(p===`/api/evaluations/${record.id}`)return r.fulfill({json:{...record,humanReview:review}})
  if(p===`/api/reviews/${record.id}`&&m==='PUT'){review=buildReview(record,review,r.request().postDataJSON(),actor,'2026-10-01T12:00:00Z');return r.fulfill({json:{item:review}})}
  return r.fulfill({json:{items:[]}})
 })
 await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`)
 await expect(page.getByLabel('Current role')).toHaveText(role)
 const gov=page.getByRole('region',{name:'Governance'}),nav=page.getByRole('navigation',{name:'Primary navigation'})
 const section=async(name:string)=>page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name,exact:true}).click()
 await section('Privacy & retention')
 await expect(gov.getByRole('heading',{name:'Privacy & data inventory'})).toBeVisible()
 await expect(gov.getByText(/Not stored server-side: raw voice transcripts/)).toBeVisible()
 if(role==='ADMIN'){
  await section('Access');await expect(gov.getByRole('heading',{name:'Role administration'})).toBeVisible()
  await gov.getByLabel('Genesys user ID',{exact:true}).fill('new-user');await gov.getByLabel('Assigned role').selectOption('REVIEWER');await gov.getByRole('button',{name:'Assign role',exact:true}).click();await expect(gov.getByText('Role assignment saved.')).toBeVisible()
  await section('Privacy & retention');await gov.getByLabel('Browser conversation cache hours').fill('0');await gov.getByLabel('Evaluation retention days',{exact:true}).fill('365');await gov.getByRole('button',{name:'Save all settings'}).click();await expect(gov.getByText('All governance settings saved. No data deleted.')).toBeVisible();expect(settings.browserContentCacheHours).toBe(0);expect(executed).toBe(false)
  await page.getByRole('button',{name:'Clear cached Genesys searches and content'}).click();await expect(page.getByText('Cached Genesys data cleared.')).toBeVisible()
  await gov.getByRole('button',{name:'Preview retention',exact:true}).click();await expect(gov.getByText('evaluations: 2 eligible for deletion')).toBeVisible();await expect(gov.getByRole('button',{name:'Confirm purge window'})).toBeDisabled();expect(executed).toBe(false)
  await gov.getByLabel('Type PURGE to confirm this window').fill('PURGE');await gov.screenshot({path:`/private/tmp/aqm-v011-ADMIN-preview-${viewport.width}.png`});await gov.getByRole('button',{name:'Confirm purge window'}).click();await expect(gov.getByText('Purge window completed and audited.')).toBeVisible();expect(executed).toBe(true)
  await section('Audit');await gov.getByRole('button',{name:'Load audit history'}).click();await gov.getByRole('row').filter({hasText:'form.publish'}).click();await expect(gov.getByRole('heading',{name:'Audit event detail'})).toBeVisible()
 }else{
  await section('Access');await expect(gov.getByRole('heading',{name:'Role administration'})).toHaveCount(0);await expect(gov.getByRole('heading',{name:'Retention preview & purge'})).toHaveCount(0);await expect(gov.getByRole('heading',{name:'Audit history'})).toHaveCount(0);await expect(gov.getByLabel('Browser conversation cache hours')).toHaveCount(0)
 }
 await page.screenshot({path:`/private/tmp/aqm-v011-${role}-settings-${viewport.width}.png`,fullPage:true})
 await nav.getByRole('button',{name:'Evaluation Forms',exact:true}).click();await page.getByRole('row').filter({hasText:form.name}).click()
 const detail=page.locator('.form-detail')
 if(role==='ADMIN'||role==='AUTHOR'){
  await expect(detail.getByLabel('Form name',{exact:true})).toBeEditable();await expect(page.getByRole('button',{name:'＋ New form',exact:true})).toBeVisible();await detail.getByRole('button',{name:'View history'}).click();await expect(detail.getByText('Recorded changes for this version')).toBeVisible()
  if(role==='AUTHOR'){forbid=true;await detail.getByRole('button',{name:'Publish version'}).click();await expect(detail.getByRole('alert')).toContainText('Forbidden')}
 }else{
  await expect(detail.getByLabel('Form name',{exact:true})).not.toBeEditable();await expect(detail.getByRole('button',{name:'Publish version'})).toHaveCount(0);await expect(page.getByRole('button',{name:'＋ New form',exact:true})).toHaveCount(0)
 }
 await detail.screenshot({path:`/private/tmp/aqm-v011-${role}-form-${viewport.width}.png`})
 await nav.getByRole('button',{name:'Evaluations',exact:true}).click();await page.getByRole('button',{name:`Open evaluation ${record.id}`}).click()
 const reviewPanel=page.getByRole('region',{name:'Human review',exact:true})
 if(role==='ADMIN'||role==='REVIEWER'){
  await reviewPanel.getByRole('button',{name:'Review evaluation',exact:true}).click();await expect(reviewPanel.getByRole('button',{name:'Save progress'})).toBeVisible();await reviewPanel.getByRole('button',{name:'Save progress'}).click();await expect(reviewPanel.getByText('Review progress saved.')).toBeVisible();expect(review?.status).toBe('IN_REVIEW')
 }else{await expect(reviewPanel.getByRole('button',{name:'Review evaluation',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Request sample'})).toHaveCount(0)}
 await reviewPanel.screenshot({path:`/private/tmp/aqm-v011-${role}-review-${viewport.width}.png`});expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);await context.close()
})
