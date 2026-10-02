import { installOwnerGovernanceFixture } from './governanceFixture'
import { test,expect } from '@playwright/test'
import { seedForms } from '../src/domain/forms'
import { scoreFormResults } from '../src/domain/formComposition'
import { recordEvaluation } from '../src/domain/evaluations'
import { buildReview,type HumanReview,type ReviewInput } from '../src/domain/reviews'
import { aggregateCalibration } from '../src/domain/calibration'
import { openAlert,transitionAlert,alertSummary } from '../src/domain/operationalAlerts'
import { readFileSync } from 'node:fs'
const sampleLibrary=[{conversation:JSON.parse(readFileSync(new URL('../src/samples/billing-conversation.json',import.meta.url),'utf8'))}]
import type { EvaluationForm,QuestionResult } from '../src/domain/types'
const origin='https://aqm-api-bd54ukouga-nw.a.run.app',app='http://127.0.0.1:4174/Genesys-aqm/',now='2026-10-01T12:00:00Z',actor={userId:'fixture-user',displayName:'Operator'}
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])test(`group authoring, review and alert lifecycle at ${viewport.width}`,async({browser})=>{
 test.setTimeout(90_000)
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 let form:EvaluationForm={...structuredClone(seedForms[0]),id:'weighted',familyId:'weighted',name:'Weighted care',version:1,status:'DRAFT',enabled:false,groups:[{id:'opening',name:'Opening'},{id:'compliance',name:'Compliance'}],questions:seedForms[0].questions.filter(q=>['greeting','ownership'].includes(q.id)).map(q=>({...q,groupId:q.id==='greeting'?'opening':'compliance'}))}
 let review:HumanReview|undefined,aiRecord:ReturnType<typeof recordEvaluation>|undefined
 let alert=openAlert(undefined,{dedupKey:'SCHEDULED_RUN_PARTIAL:p',type:'SCHEDULED_RUN_PARTIAL',severity:'WARNING',source:'scheduled-run',title:'Scheduled run partially completed',message:'Inspect the related run for structured failure diagnostics.',policyId:'p',runId:'fixture_run',metadata:{sampled:5,available:3}},now)
 const evaluation=()=>{
  if(aiRecord)return aiRecord
  const qs:QuestionResult[]=form.questions.map(q=>({id:q.id,title:q.title,type:q.type,credit:q.id==='greeting'?1:0,weight:q.weight,weightedContribution:q.id==='greeting'?q.weight:0,outcome:q.id==='greeting'?'Yes':'No',status:'ANSWERED'})),s=scoreFormResults(form,qs)
  aiRecord=recordEvaluation(sampleLibrary[0].conversation,form,{...s,questions:qs,conversationId:'fixture',scorecardId:form.id,scorecardVersion:1,evaluatedAt:now,provider:'fixture',model:'fixture',rawResponse:{}},[],'weighted_record',{conversationSource:'genesys-cloud'});return aiRecord
 }
 await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'forms'})))
 await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}))
 await page.route('https://api.mypurecloud.ie/**',r=>r.fulfill({json:{id:actor.userId,name:actor.displayName,organization:{id:'fixture-org'}}}))
 await page.route('https://api.typesafe.ai/**',()=>{throw Error('Live Jev calls prohibited')})
 await page.route(`${origin}/**`,async r=>{
  const u=new URL(r.request().url()),p=u.pathname,m=r.request().method()
  if(p==='/api/forms')return r.fulfill({json:{items:[form]}})
  if(p===`/api/forms/${form.id}`&&m==='PUT'){form=r.request().postDataJSON();return r.fulfill({json:{item:form}})}
  if(p==='/api/evaluations')return r.fulfill({json:{items:[{...evaluation(),humanReview:review}]}})
  if(p==='/api/evaluations/weighted_record')return r.fulfill({json:{...evaluation(),humanReview:review}})
  if(p==='/api/reviews/weighted_record'&&m==='PUT'){review=buildReview(evaluation(),review,r.request().postDataJSON() as ReviewInput,actor,now);return r.fulfill({json:{item:review}})}
  if(p==='/api/calibration')return r.fulfill({json:aggregateCalibration([{...evaluation(),humanReview:review}])})
  if(p==='/api/alerts')return r.fulfill({json:{items:u.searchParams.get('status')==='ACTIVE'&&alert.status==='RESOLVED'?[]:[alert]}})
  if(p.endsWith('/notifications'))return r.fulfill({json:{items:[]}})
  if(p.startsWith(`/api/alerts/${alert.id}/`)){alert=transitionAlert(alert,p.endsWith('/acknowledge')?'ACKNOWLEDGED':'RESOLVED',now,actor);return r.fulfill({json:{item:alert}})}
  if(p==='/api/monitoring-health')return r.fulfill({json:{...alertSummary([alert]),api:'healthy',firestore:'available',genesysAutomation:{status:'verified'},jev:{status:'verified'},scheduler:{status:'healthy',lastSuccessfulTickAt:now},lastRun:null,nextRunAt:null,runCounts:{completed:0,partial:1,failed:0}}})
  if(p==='/api/runs')return r.fulfill({json:{items:[]}})
  return r.fulfill({json:{items:[]}})
 })
 await installOwnerGovernanceFixture(page);await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`)
 const nav=page.getByRole('navigation',{name:'Primary navigation'}),detail=page.locator('.form-detail')
 await expect(page.getByRole('heading',{name:'Evaluation Forms',exact:true})).toBeVisible();await page.getByRole('row').filter({hasText:'Weighted care'}).click()
 await detail.getByRole('radio',{name:'Group weighted',exact:true}).check()
 const opening=page.getByRole('region',{name:'Group: Opening',exact:true}),compliance=page.getByRole('region',{name:'Group: Compliance',exact:true})
 for(const [g,weight] of [[opening,'40'],[compliance,'10']] as const){await g.getByLabel('Use group scoring settings').check();await g.getByLabel('Group weight',{exact:true}).fill(weight)}
 await compliance.getByLabel('Minimum group score (%)',{exact:true}).fill('90');await compliance.getByLabel('Critical group',{exact:true}).check()
 await compliance.screenshot({path:`/private/tmp/aqm-v010-author-${viewport.width}.png`})
 await detail.getByRole('button',{name:'Publish version',exact:true}).click();await expect(detail.getByText('PUBLISHED · VERSION 1')).toBeVisible()
 await expect(detail.getByRole('radio',{name:'Group weighted',exact:true})).toBeDisabled();await expect(compliance.getByLabel('Group weight',{exact:true})).toBeDisabled();expect(form.groups![1].scoring).toEqual({weight:10,passScore:.9,critical:true})
 await nav.getByRole('button',{name:'Evaluations',exact:true}).click();await page.getByRole('button',{name:'Open evaluation weighted_record',exact:true}).click()
 const groups=page.getByRole('region',{name:'Group results',exact:true});await expect(groups.getByText(/Compliance · 0%/)).toBeVisible();await expect(groups.getByText(/FAIL · Critical group/)).toBeVisible();expect(evaluation().overallScore).toBe(.8);expect(evaluation().passed).toBe(false)
 await groups.screenshot({path:`/private/tmp/aqm-v010-result-${viewport.width}.png`})
 const panel=page.getByRole('region',{name:'Human review',exact:true});await panel.getByRole('button',{name:'Review evaluation',exact:true}).click()
 await panel.getByLabel('Human answer: Warm opening',{exact:true}).selectOption('Yes');await panel.getByLabel('Human answer: Ownership',{exact:true}).selectOption('Yes');await panel.getByRole('button',{name:'Complete review',exact:true}).click()
 await expect(panel.getByRole('heading',{name:'Completed calibration',exact:true})).toBeVisible()
 const comparison=page.getByRole('region',{name:'Group comparison',exact:true});await expect(comparison.getByText('Human group score: 100%').first()).toBeVisible();await expect(comparison.getByText('Difference: 100.0 pp')).toBeVisible();await comparison.screenshot({path:`/private/tmp/aqm-v010-review-${viewport.width}.png`});expect(evaluation().groupResults![1].overallScore).toBe(0)
 await nav.getByRole('button',{name:'Calibration',exact:true}).click();await page.getByRole('button',{name:'Groups',exact:true}).click();await expect(page.getByText('Weighted care v1 · Compliance',{exact:true})).toBeVisible()
 await nav.getByRole('button',{name:'Overview & Runs',exact:true}).click();const alerts=page.getByRole('region',{name:'Operational alerts',exact:true});await expect(alerts.getByText('Scheduled run partially completed',{exact:true})).toBeVisible()
 await alerts.screenshot({path:`/private/tmp/aqm-v010-alerts-${viewport.width}.png`})
 await alerts.getByRole('button',{name:'Acknowledge',exact:true}).click();await expect(alerts.getByText('ACKNOWLEDGED',{exact:true}).first()).toBeVisible();expect(alert.acknowledgedBy?.userId).toBe(actor.userId)
 await alerts.getByRole('button',{name:'Resolve',exact:true}).click();await expect(alerts.getByText('No alerts match these filters.',{exact:true})).toBeVisible();await alerts.getByLabel('Alert status').selectOption('RESOLVED');await expect(alerts.getByText('RESOLVED',{exact:true}).first()).toBeVisible()
 expect(alert.events.map(e=>e.action)).toEqual(['OPENED','ACKNOWLEDGED','RESOLVED']);expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);await context.close()
})
