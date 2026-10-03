import { installOwnerGovernanceFixture } from './governanceFixture'
import { test,expect } from '@playwright/test'
import { aggregateCalibration } from '../src/domain/calibration'
import { buildReview, matchesReviewQueue, calibrationSample, type HumanReview, type ReviewInput } from '../src/domain/reviews'
import { fixtureAnswers,reviewFixture,reviewInput } from '../src/fixtures/reviewFixture'
const origin='https://aqm-api-bd54ukouga-nw.a.run.app',appUrl=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/'
const actor={userId:'fixture-user',displayName:'Fixture Reviewer'},now='2026-10-01T10:00:00.000Z'
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
  test(`provider-free human review, conflict, calibration and drill-down at ${viewport.width}`,async({browser})=>{
    const context=await browser.newContext({viewport}),page=await context.newPage(),records=[reviewFixture(),reviewFixture('evaluation_2'),reviewFixture('demo','synthetic')]
    const original=JSON.stringify(records),reviews=new Map<string,HumanReview>([['demo',buildReview(records[2],undefined,reviewInput(records[2]),actor,now)]])
    let conflictNext=false,paidRequests=0,providerRequests=0
    const joined=()=>records.map(record=>({...record,humanReview:reviews.get(record.id)}))
    await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'evaluations'})))
    await page.route('https://login.mypurecloud.ie/oauth/token',route=>route.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}))
    await page.route('https://api.mypurecloud.ie/**',async route=>{if(!route.request().url().endsWith('/users/me'))providerRequests++;await route.fulfill({json:{id:actor.userId,name:actor.displayName,organization:{id:'fixture-org'}}})})
    await page.route(`${origin}/**`,async route=>{
      const url=new URL(route.request().url()),path=url.pathname,method=route.request().method()
      if(path==='/api/forms'){await route.fulfill({json:{items:[records[0].form]}});return}
      if(path==='/api/evaluations'){await route.fulfill({json:{items:joined().filter(record=>matchesReviewQueue(record,url.searchParams))}});return}
      if(path.startsWith('/api/evaluations/')){await route.fulfill({json:joined().find(record=>record.id===path.split('/').at(-1))});return}
      if(path.startsWith('/api/reviews/')){
        const id=path.split('/').at(-1)!,record=records.find(record=>record.id===id)!,prior=reviews.get(id)
        if(method==='GET'){await route.fulfill(prior?{json:prior}:{status:404,json:{error:'Review not found.'}});return}
        const input=route.request().postDataJSON() as ReviewInput
        if(conflictNext){conflictNext=false;reviews.set(id,buildReview(record,prior,{...reviewInput(record,'save',prior!.revision),answers:fixtureAnswers.slice(0,1),notes:'Saved by another reviewer'},actor,now));await route.fulfill({status:409,json:{error:'Review changed in another tab or by another reviewer. Refresh before saving.'}});return}
        expect(input.expectedRevision).toBe(prior?.revision??0)
        const item=buildReview(record,prior,{...input,action:input.action==='claim'?'start':input.action},actor,now);reviews.set(id,item);await route.fulfill({json:{item}});return
      }
      if(path==='/api/calibration'){await route.fulfill({json:aggregateCalibration(joined(),url.searchParams)});return}
      if(path==='/api/calibration/sample'){
        const input=route.request().postDataJSON(),selected=calibrationSample(joined(),new URLSearchParams(input.filters),input.count,input.strategy,input.seed)
        for(const record of selected)reviews.set(record.id,buildReview(record,undefined,reviewInput(record,'request'),actor,now))
        await route.fulfill({json:{selected:selected.length}});return
      }
      if(method==='POST'){paidRequests++;await route.fulfill({status:500,json:{error:'Unexpected paid/provider operation'}});return}
      await route.fulfill({json:{items:[]}})
    })
    await installOwnerGovernanceFixture(page);await page.goto(`${appUrl}?code=fixture-code&state=${'A'.repeat(43)}`)
    const nav=page.getByRole('navigation',{name:'Primary navigation'}),panel=page.getByRole('region',{name:'Human review'})
    await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible()
    await page.getByRole('button',{name:'Open evaluation evaluation_1',exact:true}).click()
    await expect(page.locator('.evaluation-detail').getByText('Actual Jev requests: Not recorded (legacy)',{exact:true})).toBeVisible()
    await panel.getByRole('button',{name:'Mark for review',exact:true}).click()
    await expect(panel.getByText('General Customer Service v17 · REVIEW REQUESTED')).toBeVisible()
    await panel.getByRole('button',{name:'Claim and start review'}).click()
    await panel.getByLabel('Human answer: Warm opening',{exact:true}).selectOption('No')
    await panel.getByLabel('Question note: Warm opening',{exact:true}).fill('The opening was abrupt.')
    await panel.getByRole('button',{name:'Save progress'}).click()
    await expect(panel.getByText(/Reviewer:.*revision 3/)).toBeVisible()
    await expect(panel.getByLabel('Human answer: Warm opening',{exact:true})).toHaveValue('No')
    await expect(panel.getByRole('button',{name:'Complete review'})).toBeDisabled()
    const card=panel.locator('.review-question').first(),bounds=await card.boundingBox();expect(bounds!.width).toBeLessThanOrEqual(viewport.width)
    const boxes=await card.locator('.review-ai,.review-human').evaluateAll(elements=>elements.map(element=>{const rect=element.getBoundingClientRect();return {x:rect.x,y:rect.y,right:rect.right,bottom:rect.bottom}}))
    if(viewport.width>600)expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].x);else expect(boxes[0].bottom).toBeLessThanOrEqual(boxes[1].y)
    await card.screenshot({path:`/private/tmp/aqm-v07-review-question-${viewport.width}.png`})
    await panel.getByLabel('Human answer: Understanding the issue',{exact:true}).selectOption('2')
    await panel.getByLabel('Human answer: Resolution',{exact:true}).selectOption('fully_resolved')
    conflictNext=true
    await panel.getByRole('button',{name:'Save progress'}).click();await expect(panel.getByRole('alert')).toContainText('Refresh before saving')
    await panel.getByRole('button',{name:'Refresh review'}).click()
    // Refresh must preserve unsubmitted values until an explicit reconciliation.
    await expect(panel.getByLabel('Overall review note')).toHaveValue('')
    await expect(panel.getByLabel('Human answer: Understanding the issue',{exact:true})).toHaveValue('2')
    await expect(panel.getByRole('alert')).toContainText('Your unsaved answers are still held in this session.')
    await expect(panel.getByRole('button',{name:'Complete review'})).toBeDisabled()
    await panel.getByRole('button',{name:'Discard my unsaved answers',exact:true}).click()
    await expect(panel.getByLabel('Overall review note')).toHaveValue('Saved by another reviewer')
    await panel.getByLabel('Human answer: Understanding the issue',{exact:true}).selectOption('2')
    await panel.getByLabel('Human answer: Resolution',{exact:true}).selectOption('fully_resolved')
    await panel.getByLabel('Overall review note').fill('Reviewed against the immutable snapshot.')
    await panel.getByRole('button',{name:'Complete review'}).click();await expect(panel.getByRole('heading',{name:'Completed calibration'})).toBeVisible()
    await panel.getByRole('button',{name:'Disagreements',exact:true}).click();await expect(panel.locator('.review-question')).toHaveCount(2)
    await expect(panel.getByText('One-band difference',{exact:true})).toBeVisible();await expect(panel.getByText('Disagreement',{exact:true})).toBeVisible()
    await panel.screenshot({path:`/private/tmp/aqm-v07-review-${viewport.width}.png`})
    await nav.getByRole('button',{name:'Calibration',exact:true}).click()
    await expect(page.locator('.calibration-metrics')).toContainText('Evaluations reviewed1');await expect(page.getByLabel('Calibration source')).toHaveValue('genesys-cloud')
    await page.getByRole('button',{name:'Confidence vs disagreement',exact:true}).click();await expect(page.getByRole('table')).toContainText('90%+')
    await page.screenshot({path:`/private/tmp/aqm-v07-confidence-${viewport.width}.png`,fullPage:true})
    await page.getByLabel('Calibration source').selectOption('synthetic');await expect(page.locator('.calibration-metrics')).toContainText('Evaluations reviewed1')
    await page.getByLabel('Calibration source').selectOption('all');await expect(page.locator('.calibration-metrics')).toContainText('Evaluations reviewed2')
    await page.getByLabel('Calibration source').selectOption('genesys-cloud')
    await page.getByRole('button',{name:'Form / version'}).click()
    await page.getByRole('row').filter({hasText:'General Customer Service v17'}).click();await expect(page.getByLabel('Calibration form @ version')).toHaveValue('general_service@17')
    await page.getByRole('row').filter({hasText:'Warm opening'}).click()
    await expect(page.getByRole('region',{name:'Question calibration drill-down'})).toContainText('1 reviewed · 0 agree / 1 disagree')
    await page.getByRole('button',{name:'Open disagreements',exact:true}).click()
    await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();await expect(page.getByLabel('Review status')).toHaveValue('REVIEWED')
    await expect(page.getByRole('button',{name:'Open evaluation evaluation_1',exact:true})).toHaveCount(1);await expect(page.getByRole('button',{name:'Open evaluation evaluation_2',exact:true})).toHaveCount(0)
    await page.locator('details>summary').filter({hasText:/^Calibration sample$/}).click();await page.getByLabel('Sample size').fill('2');await page.getByRole('button',{name:'Request sample'}).click();await expect(page.getByRole('region',{name:'Calibration sample'}).getByRole('status')).toContainText('1 existing evaluations marked for review')
    expect(reviews.get('evaluation_2')?.status).toBe('REVIEW_REQUESTED')
    expect(JSON.stringify(records)).toBe(original);expect(paidRequests).toBe(0);expect(providerRequests).toBe(0)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await context.close()
  })
}
