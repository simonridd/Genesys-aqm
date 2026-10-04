import { overviewBrowserFixture } from './overviewFixture'
import { test,expect } from '@playwright/test'
import { MemoryStore } from '../src/server/store'
import { buildReview,matchesReviewQueue } from '../src/domain/reviews'
import { reviewQueuePriority } from '../src/domain/reviewSla'
import { rolePermissions,defaultGovernance,validateGovernance } from '../src/domain/governance'
import { governanceSettings } from '../src/server/governance'
import { reviewFixture,reviewInput,fixtureAnswers } from '../src/fixtures/reviewFixture'
import { assignReview,scoreAssignedReview,reviewWorkload,reviewerDirectory } from '../src/server/reviewOperations'
import { bulkReviewDue } from '../src/server/bulkReviewDue'
import { sweepReviewSla,reviewSlaSummary } from '../src/server/reviewSla'
const now='2026-10-02T12:00:00.000Z',origin='https://aqm-api-bd54ukouga-nw.a.run.app',app='http://127.0.0.1:4174/Genesys-aqm/',admin={userId:'admin',displayName:'Owner'},authority={bootstrapId:'admin',allowedUserIds:new Set(['admin'])}
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])test(`review SLA settings, queue, bulk due, alerts and completion at ${viewport.width}`,async({browser})=>{
 const context=await browser.newContext({viewport}),page=await context.newPage(),store=new MemoryStore(),errors:string[]=[]
 await page.clock.install({time:new Date(now)});page.on('pageerror',e=>errors.push(e.message));let forbidden=0
 const records=['escalated','overdue','soon','progress','requested','unassigned'].map(id=>({...reviewFixture(id),conversationId:`conversation-${id}`}))
 const dueById:Record<string,string>={escalated:'2026-09-29T12:00:00Z',overdue:'2026-10-02T06:00:00Z',soon:'2026-10-02T18:00:00Z',progress:'2026-10-07T12:00:00Z',requested:'2026-10-07T12:00:00Z'}
 for(const r of records){await store.putEvaluation(r);if(r.id==='unassigned')await store.writeReviews([{review:buildReview(r,undefined,reviewInput(r,'request'),admin,now),expectedRevision:0}]);else await assignReview(store,r.id,{action:'assign',expectedRevision:0,assigneeId:'admin',dueAt:dueById[r.id]},admin,now,authority)}
 await scoreAssignedReview(store,'progress',reviewInput(records.find(r=>r.id==='progress')!,'start',1),admin,now,authority)
 await sweepReviewSla(store,now);const evaluationsBefore=JSON.stringify(await store.evaluations())
 const joined=async()=>Promise.all(records.map(async r=>({...r,humanReview:await store.review(r.id)})))
 await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'evaluations'})))
 await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture',token_type:'Bearer',expires_in:3600}}))
 await page.route('https://api.mypurecloud.ie/**',r=>{expect(r.request().url()).toContain('/users/me');return r.fulfill({json:{id:'admin',name:'Owner',organization:{id:'fixtures'}}})})
 await page.route('https://api.typesafe.ai/**',()=>{throw Error('NO PAID CALLS')})
 await page.route(`${origin}/**`,async route=>{
  const u=new URL(route.request().url()),p=u.pathname,m=route.request().method(),payload=()=>route.request().postDataJSON()
  try{
   if(p==='/api/overview')return route.fulfill({json:await overviewBrowserFixture({store,now})})
   if(p==='/api/session')return route.fulfill({json:{actor:admin,role:'ADMIN',permissions:rolePermissions.ADMIN,bootstrap:true}})
   if(p==='/api/governance'){if(m==='PUT'){const prior=await store.governanceRead('governanceSettings','governance');await store.atomic([{collection:'governanceSettings',id:'governance',expected:prior,value:validateGovernance(payload())}])}return route.fulfill({json:await governanceSettings(store)})}
   if(p==='/api/review-sla/refresh')return route.fulfill({json:await sweepReviewSla(store,now)})
   if(p==='/api/reviewers')return route.fulfill({json:await reviewerDirectory(store,u.searchParams,authority,admin)})
   if(p==='/api/review-workload')return route.fulfill({json:await reviewWorkload(store,now,authority)})
   if(p==='/api/monitoring-health')return route.fulfill({json:{api:'healthy',firestore:'available',genesysAutomation:{status:'unverified'},jev:{status:'unverified'},scheduler:{status:'healthy'},lastRun:null,nextRunAt:null,runCounts:{completed:0,partial:0,failed:0},reviewWorkload:await reviewSlaSummary(store,now),reviewSlaSweep:await store.governanceRead('operationalHealth','reviewSla')}})
   if(p==='/api/alerts')return route.fulfill({json:{items:await store.alerts(u.searchParams.get('status')==='ACTIVE')}})
   if(p.startsWith('/api/alerts/'))return route.fulfill({json:{items:[]}})
   if(p==='/api/reviews/bulk-due')return route.fulfill({json:await bulkReviewDue(store,payload(),admin,now,authority)})
   if(p.startsWith('/api/reviews/')&&m==='PUT')return route.fulfill({json:{item:await scoreAssignedReview(store,p.split('/')[3],payload(),admin,now,authority)}})
   if(p==='/api/evaluations'){const items=(await joined()).filter(r=>matchesReviewQueue(r,u.searchParams,'admin',now));if(u.searchParams.get('reviewQueue')==='mine')items.sort((a,b)=>reviewQueuePriority(a,now).localeCompare(reviewQueuePriority(b,now)));return route.fulfill({json:{items}})}
   if(p.startsWith('/api/evaluations/'))return route.fulfill({json:(await joined()).find(r=>r.id===p.split('/').at(-1))})
   if(p==='/api/forms')return route.fulfill({json:{items:[records[0].form]}})
   if(m!=='GET'){forbidden++;throw Error('Unexpected mutation or provider call')}
   return route.fulfill({json:{items:[]}})
  }catch(e){return route.fulfill({status:400,json:{error:e instanceof Error?e.message:'failed'}})}
 })
 await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText('ADMIN')
 await page.getByText('Team review workload',{exact:true}).click()
 const workload=page.getByRole('region',{name:'Review workload'})
 await expect(workload).toContainText('Due soon');await expect(workload).toContainText('Escalated');await expect(workload).toContainText('Unassigned')
 await workload.getByRole('button',{name:'My review queue',exact:true}).click()
 const table=page.locator('.operational-table').last()
 await expect(table.locator('tbody tr')).toHaveCount(5);await expect(table.locator('tbody tr').first()).toContainText('conversation-escalated');expect(await table.locator('tbody tr').evaluateAll(rows=>rows.map(r=>r.querySelector('button[aria-label^="Open evaluation"]')?.getAttribute('aria-label')?.replace('Open evaluation ','')))).toEqual(['escalated','overdue','soon','progress','requested'])
 await expect(table.getByText('DUE SOON',{exact:true}).first()).toBeVisible();await expect(table.getByText('OVERDUE',{exact:true}).first()).toBeVisible();await expect(table.getByText('ESCALATED',{exact:true}).first()).toBeVisible();await expect(table.getByText('Due in 6 hours').first()).toBeVisible()
 await page.screenshot({path:`/private/tmp/aqm-v016-queue-${viewport.width}.png`,fullPage:true})
 await page.getByRole('button',{name:'All evaluations',exact:true}).click()
 await page.locator('details>summary').filter({hasText:/^Bulk assignment$/}).click();await page.getByLabel('Select evaluation overdue',{exact:true}).check();await page.getByLabel('Assignment',{exact:true}).selectOption('unassigned');await expect(page.getByRole('button',{name:'Open evaluation overdue',exact:true})).toHaveCount(0);await page.getByRole('region',{name:'Bulk review assignment'}).getByRole('button',{name:'Clear selection',exact:true}).click();await page.getByLabel('Assignment',{exact:true}).selectOption('');await page.getByLabel('Select evaluation overdue',{exact:true}).check();await page.getByLabel('Select evaluation progress',{exact:true}).check()
 const bulk=page.getByRole('region',{name:'Bulk review assignment'});await bulk.getByLabel('Bulk due date',{exact:true}).fill('2026-10-10T12:00');await bulk.getByRole('button',{name:'Set due date',exact:true}).click();await expect(bulk.getByRole('status')).toHaveText('Set due date for 2 reviews.');expect((await store.review('progress'))?.assignment?.assignee.userId).toBe('admin')
 await page.getByLabel('Select evaluation overdue',{exact:true}).check();await page.getByLabel('Select evaluation progress',{exact:true}).check();await bulk.getByRole('button',{name:'Clear due date',exact:true}).click();await expect(bulk.getByRole('status')).toHaveText('Cleared due date for 2 reviews.');expect((await store.review('overdue'))?.assignment?.dueAt).toBeUndefined()
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Reviews',exact:true}).click();const settings=page.getByRole('region',{name:'Review reminders'});await expect(settings).toContainText('Only reviews with an explicit due date are monitored.');await settings.getByLabel('Due soon hours',{exact:true}).fill('12');await settings.getByLabel('Escalation hours',{exact:true}).fill('24');await page.getByRole('button',{name:'Save all settings',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'All governance settings saved. No data deleted.'})).toBeVisible();await settings.getByLabel('No escalation',{exact:true}).check();await page.getByRole('button',{name:'Save all settings',exact:true}).click();expect((await governanceSettings(store)).reviewSla.overdueEscalationHours).toBeNull();await settings.getByLabel('No escalation',{exact:true}).uncheck();await page.getByRole('button',{name:'Save all settings',exact:true}).click();await settings.getByRole('button',{name:'Refresh review SLA state',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Review SLA refreshed:'})).toBeVisible();await settings.screenshot({path:`/private/tmp/aqm-v016-settings-${viewport.width}.png`})
 await page.getByRole('button',{name:'Overview',exact:true}).click();await expect(page.getByRole('region',{name:'Review work summary'})).toContainText('Escalated');await expect(page.getByRole('region',{name:'Review work summary'}).locator('.overview-metric').filter({hasText:'Open'})).toContainText('6');await page.locator('.overview-operations>summary').click()
 const alerts=page.getByRole('region',{name:'Operational alerts'});await alerts.getByRole('cell',{name:/Review escalated/}).click();const alertDetail=page.getByRole('region',{name:'Alert detail'});await expect(alertDetail).toContainText('REVIEW_ESCALATED');await alertDetail.screenshot({path:`/private/tmp/aqm-v016-alert-${viewport.width}.png`});await alertDetail.getByRole('button',{name:'Open review',exact:true}).click();await expect(page).toHaveURL(/evaluationId=escalated/)
 const panel=page.getByRole('region',{name:'Human review',exact:true});await expect(panel).toContainText('ESCALATED');await panel.getByRole('button',{name:'Start review',exact:true}).click();for(const a of fixtureAnswers){const labels:Record<string,string>={greeting:'Warm opening',understanding:'Understanding the issue',resolution:'Resolution'};await panel.getByLabel(`Human answer: ${labels[a.questionId]}`,{exact:true}).selectOption(String(a.value))}await panel.getByRole('button',{name:'Complete review',exact:true}).click();await expect(panel).toContainText('Completed calibration');await expect(panel.getByText('ESCALATED',{exact:true})).toHaveCount(0);expect((await store.alerts(true)).some(a=>a.context?.evaluationId==='escalated')).toBe(false)
 await page.screenshot({path:`/private/tmp/aqm-v016-completed-${viewport.width}.png`,fullPage:true});expect(JSON.stringify(await store.evaluations())).toBe(evaluationsBefore);expect(forbidden).toBe(0);expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
})
