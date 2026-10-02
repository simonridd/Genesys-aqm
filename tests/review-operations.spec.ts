import { test, expect } from '@playwright/test'
import { MemoryStore } from '../src/server/store'
import { assignReview, bulkAssignReviews, scoreAssignedReview, reviewerDirectory, reviewWorkload } from '../src/server/reviewOperations'
import { requestSample } from '../src/server/reviews'
import { buildReview, matchesReviewQueue } from '../src/domain/reviews'
import { rolePermissions, defaultGovernance, type Role } from '../src/domain/governance'
import { fixtureAnswers, reviewFixture, reviewInput } from '../src/fixtures/reviewFixture'
const origin='https://aqm-api-bd54ukouga-nw.a.run.app',app='http://127.0.0.1:4174/Genesys-aqm/',now='2026-10-02T12:00:00.000Z'
const admin={userId:'admin',displayName:'Owner'},a={userId:'a',displayName:'Alice'},b={userId:'b',displayName:'Bob'}
const authority={bootstrapId:'admin',allowedUserIds:new Set(['admin','a','b'])}
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])for(const role of ['ADMIN','REVIEWER'] as Role[])test(`${role} review operations at ${viewport.width}`,async({browser})=>{
 const context=await browser.newContext({viewport}),page=await context.newPage(),store=new MemoryStore(),actor=role==='ADMIN'?admin:a,errors:string[]=[]
 page.on('pageerror',e=>errors.push(e.message));let forbiddenRequests=0
 for(const who of [a,b])await store.atomic([{collection:'roleAssignments',id:who.userId,expected:undefined,value:{id:who.userId,...who,role:'REVIEWER',createdAt:now,updatedAt:now,assignedBy:admin}}])
 const records=['unassigned','other','progress','mine','fresh','sample','completed'].map(id=>({...reviewFixture(id),conversationId:`conversation-${id}`}))
 for(const r of records)await store.putEvaluation(r)
 const rec=(id:string)=>records.find(r=>r.id===id)!
 await store.writeReviews([{review:buildReview(rec('unassigned'),undefined,reviewInput(rec('unassigned'),'request'),admin,now),expectedRevision:0}])
 for(const id of ['other','progress','completed'])await assignReview(store,id,{action:'assign',expectedRevision:0,assigneeId:'b',dueAt:'2026-10-01T09:00:00.000Z'},admin,now,authority)
 await assignReview(store,'mine',{action:'assign',expectedRevision:0,assigneeId:'a',dueAt:'2026-10-03T16:00:00.000Z'},admin,now,authority)
 await scoreAssignedReview(store,'progress',{...reviewInput(rec('progress'),'save',1),answers:fixtureAnswers.slice(0,1),notes:'Preserved partial work'},b,now,authority)
 await scoreAssignedReview(store,'completed',reviewInput(rec('completed'),'complete',1),b,now,authority)
 const before=JSON.stringify(await store.evaluations())
 const joined=async()=>await Promise.all(records.map(async r=>({...r,humanReview:await store.review(r.id)})))
 await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'evaluations'})))
 await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}))
 await page.route('https://api.mypurecloud.ie/**',async r=>{expect(r.request().url()).toContain('/users/me');await r.fulfill({json:{id:actor.userId,name:actor.displayName,organization:{id:'fixture-org'}}})})
 await page.route('https://api.typesafe.ai/**',()=>{throw Error('NO PAID CALLS')})
 await page.route(`${origin}/**`,async route=>{
  const u=new URL(route.request().url()),path=u.pathname,method=route.request().method()
  try {
   if(path==='/api/session')return route.fulfill({json:{actor,role,permissions:rolePermissions[role],bootstrap:role==='ADMIN'}})
   if(path==='/api/governance')return route.fulfill({json:defaultGovernance})
   if(path==='/api/forms')return route.fulfill({json:{items:[records[0].form]}})
   if(path==='/api/reviewers')return route.fulfill({json:await reviewerDirectory(store,u.searchParams,authority,actor)})
   if(path==='/api/review-workload')return route.fulfill({json:await reviewWorkload(store,now,authority)})
   if(path==='/api/evaluations')return route.fulfill({json:{items:(await joined()).filter(r=>matchesReviewQueue(r,u.searchParams,actor.userId,now))}})
   if(path.startsWith('/api/evaluations/'))return route.fulfill({json:(await joined()).find(r=>r.id===path.split('/').at(-1))})
   if(path==='/api/reviews/bulk-assign')return route.fulfill({json:await bulkAssignReviews(store,route.request().postDataJSON(),actor,now,authority)})
   if(path==='/api/calibration/sample')return route.fulfill({json:await requestSample(store,route.request().postDataJSON(),actor,now,authority)})
   const id=path.split('/')[3]
   if(path.endsWith('/assignment'))return route.fulfill({json:{item:await assignReview(store,id,route.request().postDataJSON(),actor,now,authority)}})
   if(path.startsWith('/api/reviews/')&&method==='PUT')return route.fulfill({json:{item:await scoreAssignedReview(store,id,route.request().postDataJSON(),actor,now,authority)}})
   if(path.startsWith('/api/reviews/')&&method==='GET')return route.fulfill({json:await store.review(id)})
   if(method!=='GET'){forbiddenRequests++;throw Error('Unexpected provider or mutation request')}
   return route.fulfill({json:{items:[]}})
  }catch(e){return route.fulfill({status:400,json:{error:e instanceof Error?e.message:'Failed'}})}
 })
 await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`)
 await expect(page.getByLabel('Current role')).toHaveText(role)
 const workload=page.getByRole('region',{name:'Review workload'}),panel=page.getByRole('region',{name:'Human review',exact:true})
 await expect(workload).toContainText('Alice');await expect(workload).toContainText('Bob');await expect(workload).toContainText('Unassigned requested reviews (1)')
 await page.getByLabel('Due',{exact:true}).selectOption('overdue');await expect(page.getByRole('button',{name:'Open evaluation other',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Open evaluation completed',exact:true})).toHaveCount(0)
 await page.getByLabel('Assignment',{exact:true}).selectOption('b');await expect(page.getByRole('button',{name:'Open evaluation progress',exact:true})).toBeVisible()
 await page.getByLabel('Due',{exact:true}).selectOption('');await page.getByLabel('Assignment',{exact:true}).selectOption('')
 if(role==='ADMIN'){
  await page.getByLabel('Select evaluation fresh',{exact:true}).check();await page.getByLabel('Select evaluation unassigned',{exact:true}).check();await expect(page.getByLabel('Select evaluation progress',{exact:true})).toBeEnabled();await expect(page.getByLabel('Select evaluation completed',{exact:true})).toBeDisabled()
  const bulk=page.getByRole('region',{name:'Bulk review assignment'});await bulk.getByLabel('Bulk assign to',{exact:true}).selectOption('a');await bulk.getByLabel('Bulk due date',{exact:true}).fill('2026-10-06T17:00');await bulk.getByRole('button',{name:'Assign 2 reviews',exact:true}).click();await expect(bulk.getByRole('status')).toHaveText('Assigned 2 reviews.');expect((await store.review('fresh'))?.assignment?.dueAt).toBeTruthy()
  await page.getByRole('button',{name:'Open evaluation progress',exact:true}).click();await expect(panel).toContainText('Assigned to: Bob');await expect(panel.getByLabel('Human answer: Warm opening',{exact:true})).toHaveCount(0)
  await panel.getByRole('button',{name:'Take over review',exact:true}).click();const confirmation=panel.getByRole('group',{name:'Confirm in-progress reassignment'});await expect(confirmation).toContainText('Partial answers will be preserved.');expect((await store.review('progress'))?.assignment?.assignee.userId).toBe('b')
  await confirmation.getByRole('button',{name:'Cancel',exact:true}).click();await panel.getByRole('button',{name:'Take over review',exact:true}).click();await confirmation.getByRole('button',{name:'Confirm reassignment',exact:true}).click();await expect(panel.getByLabel('Human answer: Warm opening',{exact:true})).toHaveValue('No');await expect(panel.getByLabel('Overall review note',{exact:true})).toHaveValue('Preserved partial work')
  await panel.getByRole('button',{name:'Save progress',exact:true}).click();await expect(panel).toContainText('Reviewer: Owner');await panel.screenshot({path:`/private/tmp/aqm-v015-assignment-${viewport.width}.png`})
  await page.locator('.evaluation-detail').getByRole('button',{name:'Close',exact:true}).click()
  await workload.getByRole('button',{name:'My review queue',exact:true}).click();await expect(page.getByRole('button',{name:'Open evaluation progress',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Open evaluation other',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'All evaluations',exact:true}).click()
  const sample=page.getByRole('region',{name:'Calibration sample'});await sample.getByLabel('Sample size',{exact:true}).fill('1');await sample.getByLabel('Assign sample to',{exact:true}).selectOption('b');await sample.getByLabel('Sample due date',{exact:true}).fill('2026-10-07T15:00');await sample.getByRole('button',{name:'Request sample',exact:true}).click();await expect(sample.getByRole('status')).toContainText('1 existing evaluations');expect((await store.review('sample'))?.assignment?.assignee.userId).toBe('b')
 }else{
  await expect(page.getByRole('region',{name:'Bulk review assignment'})).toHaveCount(0);await expect(page.getByLabel('Select evaluation fresh',{exact:true})).toHaveCount(0)
  await page.getByRole('button',{name:'Open evaluation other',exact:true}).click();await expect(panel.getByRole('button',{name:'Start review',exact:true})).toHaveCount(0);await expect(panel.getByRole('button',{name:'Take over review',exact:true})).toHaveCount(0);await expect(panel.getByLabel('Human answer: Warm opening',{exact:true})).toHaveCount(0)
  await page.locator('.evaluation-detail').getByRole('button',{name:'Close',exact:true}).click();await workload.getByRole('button',{name:'Unassigned requested reviews (1)',exact:true}).click();await page.getByRole('button',{name:'Open evaluation unassigned',exact:true}).click();await expect(panel).toContainText('Assigned to: Unassigned');await panel.getByRole('button',{name:'Claim and start review',exact:true}).click();await expect(panel).toContainText('Assigned to: Alice');await expect(panel.getByLabel('Human answer: Warm opening',{exact:true})).toBeVisible()
  for(const answer of fixtureAnswers){const labels:Record<string,string>={greeting:'Warm opening',understanding:'Understanding the issue',resolution:'Resolution'};await panel.getByLabel(`Human answer: ${labels[answer.questionId]}`,{exact:true}).selectOption(String(answer.value))}
  await panel.getByRole('button',{name:'Complete review',exact:true}).click();await expect(panel.getByRole('heading',{name:'Completed calibration',exact:true})).toBeVisible();await expect(panel.getByRole('button',{name:'Save progress',exact:true})).toHaveCount(0);await panel.screenshot({path:`/private/tmp/aqm-v015-completed-${viewport.width}.png`})
  await page.locator('.evaluation-detail').getByRole('button',{name:'Close',exact:true}).click();await workload.getByRole('button',{name:'My review queue',exact:true}).click();await expect(page.getByRole('button',{name:'Open evaluation mine',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Open evaluation unassigned',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Open evaluation mine',exact:true}).click();await panel.getByRole('button',{name:'Start review',exact:true}).click();await expect(panel.getByRole('button',{name:'Save progress',exact:true})).toBeVisible()
 }
 await page.screenshot({path:`/private/tmp/aqm-v015-${role}-queue-${viewport.width}.png`,fullPage:true});expect(errors).toEqual([]);expect(forbiddenRequests).toBe(0);expect(JSON.stringify(await store.evaluations())).toBe(before);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
})
