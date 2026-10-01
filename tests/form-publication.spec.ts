import { test, expect } from '@playwright/test'
import { seedForms } from '../src/domain/forms'
import type { EvaluationForm } from '../src/domain/types'

const origin='https://aqm-api-bd54ukouga-nw.a.run.app'
const appUrl=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/'
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
  test(`provider-free recreated form publication and authoritative reload at ${viewport.width}`,async({browser})=>{
    const context=await browser.newContext({viewport}),page=await context.newPage()
    const legacy={...structuredClone(seedForms.at(-1)!),name:'Customer Service - AI Scoring v1',version:1,status:'DRAFT' as const,enabled:false,sourceReview:{status:'REVIEW_REQUIRED' as const},description:'Persisted legacy form configuration',questions:seedForms.at(-1)!.questions.map((question,index)=>index===0?{...question,instructions:'Persisted wording from the existing form record.'}:question)}
    let stored=structuredClone(seedForms).map(form=>form.origin==='genesys-recreated'?legacy:form),reviews=0,tests=0
    await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'forms'})))
    await page.route('https://login.mypurecloud.ie/oauth/token',route=>route.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}))
    await page.route('https://api.mypurecloud.ie/**',route=>route.fulfill({json:{id:'fixture-user',name:'Fixture User',organization:{id:'fixture-org'}}}))
    await page.route(`${origin}/**`,async route=>{
      const url=new URL(route.request().url()),method=route.request().method()
      if(url.pathname.endsWith('/source-review')){reviews++;await route.fulfill({status:404,json:{error:'Removed'}})}else if(url.pathname.startsWith('/api/forms/')&&method==='PUT'){
        const item=route.request().postDataJSON() as EvaluationForm;stored=stored.some(form=>form.id===item.id)?stored.map(form=>form.id===item.id?item:form):[...stored,item];await route.fulfill({json:{ok:true,item}})
      }else if(url.pathname==='/api/forms')await route.fulfill({json:{items:stored}})
      else if(url.pathname.startsWith('/api/form-tests/')&&method==='POST'){
        const input=route.request().postDataJSON();tests++;expect(input.form.status).toBe('TESTING');expect(input.form.enabled).toBe(false);expect(input.form.version).toBe(1)
        await route.fulfill({json:{run:{id:input.id,formId:input.form.id,formSnapshot:input.form,createdAt:'2026-10-01T00:00:00Z',sampleSource:input.source,selectedConversationIds:input.selectedConversationIds,sampleConfiguration:input.sampleConfiguration,expectedRequests:input.selectedConversationIds.length,results:[],failures:[],status:'completed'}}})
      }else if(url.pathname==='/api/analytics')await route.fulfill({json:{byForm:[],metrics:{evaluations:0}}})
      else await route.fulfill({json:{items:[]}})
    })
    await page.goto(`${appUrl}?code=fixture-code&state=${'A'.repeat(43)}`)
    const nav=page.getByRole('navigation',{name:'Primary navigation'}),detail=page.locator('.form-detail')
    const selectRecreated=()=>page.getByRole('row').filter({hasText:'Customer Service - AI Scoring'}).click()
    await expect(page.getByRole('heading',{name:'Evaluation Forms',exact:true})).toBeVisible()
    await selectRecreated();await expect(detail.getByLabel('Description',{exact:true})).toHaveValue(legacy.description)
    await expect(page.getByText(/Review required before production use|Reviewed for AQM use|MARK REVIEWED FOR AQM USE|Confirm review/)).toHaveCount(0)
    await detail.getByRole('button',{name:'Move to testing'}).click();await expect(detail.getByText('TESTING · VERSION 1')).toBeVisible()
    await detail.getByRole('button',{name:'TEST FORM',exact:true}).click();await expect(page.locator('#form-test')).toBeInViewport();await page.getByLabel('Conversations',{exact:true}).fill('1');await page.locator('#form-test').getByRole('button',{name:'Test form',exact:true}).click();await expect(page.getByText('0 completed · 0 failed',{exact:true})).toBeVisible();expect(tests).toBe(1)
    await nav.getByRole('button',{name:'Conversation review',exact:true}).click();await expect(page.getByLabel('Manual form selection').locator('option').filter({hasText:'Customer Service - AI Scoring'})).toHaveCount(0);await expect(page.getByRole('button',{name:'Test a draft/testing form'})).toBeVisible()
    await nav.getByRole('button',{name:'Policies',exact:true}).click();await page.getByRole('button',{name:'Edit',exact:true}).first().click();await expect(page.getByRole('checkbox',{name:/Customer Service - AI Scoring/})).toHaveCount(0)
    await nav.getByRole('button',{name:'Evaluation Forms',exact:true}).click();await selectRecreated()
    await detail.getByRole('button',{name:'Publish version'}).click();await expect(detail.getByText('PUBLISHED · VERSION 1')).toBeVisible()
    await detail.locator('.form-meta').screenshot({path:`/private/tmp/aqm-v063-published-${viewport.width}.png`})
    const metadata=await detail.locator('.form-meta').boundingBox();expect(metadata!.width).toBeLessThanOrEqual(viewport.width)
    expect(reviews).toBe(0)
    expect(stored.find(form=>form.id==='genesys_customer_service_ai_scoring')).toMatchObject({origin:'genesys-recreated',version:1,name:legacy.name,questions:legacy.questions,scoring:legacy.scoring,sourceReview:{status:'REVIEW_REQUIRED'},enabled:true,status:'PUBLISHED'})
    await nav.getByRole('button',{name:'Conversation review',exact:true}).click();await expect(page.getByLabel('Manual form selection').locator('option').filter({hasText:'Customer Service - AI Scoring'})).toHaveCount(1)
    await nav.getByRole('button',{name:'Policies',exact:true}).click();await page.getByRole('button',{name:'Edit',exact:true}).first().click();await expect(page.getByRole('checkbox',{name:/Customer Service - AI Scoring/})).toBeVisible()
    // Erase browser form storage and reload: readiness comes from the server record.
    await page.evaluate(()=>localStorage.removeItem('genesys-aqm-v02-forms'))
    await page.goto(`${appUrl}?code=fixture-code&state=${'A'.repeat(43)}`);await nav.getByRole('button',{name:'Evaluation Forms',exact:true}).click();await selectRecreated();await expect(detail.getByText('PUBLISHED · VERSION 1')).toBeVisible()
    await detail.getByRole('button',{name:'Edit as new version'}).click();await expect(detail.getByText('DRAFT · VERSION 2')).toBeVisible();await expect(detail.locator('.form-meta').getByRole('alert')).toHaveCount(0);await expect(detail.getByText('Review required before production use',{exact:true})).toHaveCount(0)
    await expect(page.getByText(/needs authoritative configuration|review authoritative configuration/i)).toHaveCount(0)
    await page.getByRole('button',{name:'＋ New form'}).click();await expect(detail.getByText('DRAFT · VERSION 1')).toBeVisible()
    const native=await page.evaluate(()=>JSON.parse(localStorage.getItem('genesys-aqm-v02-forms')!).find((form:{name:string})=>form.name==='New evaluation form'))
    expect(native.status).toBe('DRAFT');expect(native.enabled).toBe(false);expect(native.origin).toBeUndefined();expect(native.sourceReview).toBeUndefined()
    await context.close()
  })
}
