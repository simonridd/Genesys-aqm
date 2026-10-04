import { test, expect, type Page, type Locator } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fixture } from './reviewer-recheck-fixture'
import { navigateWorkspace } from './workspace-navigation'
const baseline=process.env.AQM_LANGUAGE_BASELINE==='1'
const out=process.env.AQM_LANGUAGE_EVIDENCE??'docs/v020f-evidence/'+(baseline?'before':'after')
mkdirSync(out,{recursive:true})
async function capture(page:Page,name:string){
 await page.screenshot({path:`${out}/${name}.png`,fullPage:true})
 await page.screenshot({path:`${out}/${name}-viewport.png`})
 const text=await page.locator('main').innerText()
 writeFileSync(`${out}/${name}.json`,JSON.stringify({url:page.url(),text,width:await page.evaluate(()=>document.documentElement.scrollWidth),viewport:page.viewportSize()},null,2))
}
async function keyboard(page:Page,control:Locator){
 for(let i=0;i<150;i++){if(await control.evaluate(e=>e===document.activeElement))return;await page.keyboard.press('Tab')}
 throw Error('Keyboard target not reached')
}
const sizes=baseline?[{width:1440,height:900},{width:390,height:844}]:[{width:1440,height:900},{width:1920,height:1080},{width:390,height:844},{width:1440,height:720}]
for(const size of sizes)test(`routine language and technical evidence ${size.width}x${size.height}`,async({page})=>{
 test.setTimeout(90000);await page.setViewportSize(size)
 const f=await fixture(page,'ADMIN','attention','evaluations')
 try{
  const record=(await f.store.evaluation('recent'))!
  await f.store.putEvaluation({...record,policyRunId:'fixture-policy-run-17',providerRequestCount:3,executionMode:'scheduled'})
  await expect(page.locator('.evaluation-queue tbody tr')).not.toHaveCount(0)
  await capture(page,`evaluations-${size.width}x${size.height}`)
  if(!baseline){
   const filters=page
   await expect(filters.getByRole('combobox',{name:'Review status',exact:true}).locator('option')).toHaveText(['All','Not reviewed','Review requested','In progress','Completed'])
   await expect(page.locator('.exact-reference-filters')).not.toHaveAttribute('open','')
   const normal=await page.locator('main').innerText();expect(normal).not.toMatch(/NOT_REVIEWED|REVIEW_REQUESTED|IN_REVIEW|general_service@17|22222222-2222/)
   await filters.getByRole('combobox',{name:'Review status',exact:true}).selectOption('REVIEW_REQUESTED')
   await expect.poll(()=>new URL(page.url()).searchParams.get('reviewStatus')).toBe('REVIEW_REQUESTED')
   await expect(page.locator('.evaluation-queue tbody tr')).not.toHaveCount(0)
   await page.locator('.exact-reference-filters > summary').click()
   await page.getByLabel('Exact form reference',{exact:true}).fill('general_service@17')
   await expect.poll(()=>f.requests.some(r=>r.path==='/api/evaluations'&&new URLSearchParams(r.query).get('form')==='general_service@17')).toBe(true)
   await page.getByLabel('Exact form reference',{exact:true}).fill('');await page.locator('.exact-reference-filters > summary').click()
   await filters.getByRole('combobox',{name:'Review status',exact:true}).selectOption('')
  }
  if(baseline)await page.getByRole('button',{name:'Open evaluation recent',exact:true}).click();else await page.locator('button[data-evaluation-id="recent"]').first().click()
  const detail=page.locator('.evaluation-detail');await expect(detail).toBeVisible()
  await capture(page,`detail-${size.width}x${size.height}`)
  if(!baseline){
   expect(await detail.innerText()).not.toMatch(/fixture-policy-run-17|22222222-2222|fixture-jev|REVIEW_REQUESTED/)
   await expect(detail).toContainText('Human review');await expect(detail).toContainText('Not reviewed');await expect(detail).toContainText('AI evaluation result')
   const summary=detail.locator('.evaluation-provenance > summary');await keyboard(page,summary);await page.keyboard.press('Enter')
   const provenance=detail.locator('.evaluation-provenance');await expect(provenance).toHaveAttribute('open','')
   for(const exact of ['recent',record.conversationId,'fixture-policy-run-17',record.model,'general_service@17'])await expect(provenance).toContainText(exact)
   await capture(page,`provenance-${size.width}x${size.height}`);await page.keyboard.press('Enter');await expect(provenance).not.toHaveAttribute('open','')
  }
  await detail.getByRole('button',{name:'Open conversation',exact:true}).click()
  await expect(page.getByRole('heading',{name:baseline?'Conversation review':'Conversation detail',exact:true})).toBeVisible()
  await expect(page.getByText('I need help with my bill.',{exact:true})).toBeVisible()
  await capture(page,`conversation-${size.width}x${size.height}`)
  if(!baseline){
   const transcript=page.getByRole('region',{name:'Conversation transcript'});expect(await transcript.innerText()).not.toMatch(/33333333-3333|55555555-5555|22222222-2222|sessionId|queueId|genesys-cloud/)
   await expect(transcript.locator('.metadata-bar')).toContainText('Queue');await expect(transcript.locator('.metadata-bar')).toContainText('Customer care')
   const summary=transcript.locator('summary');await keyboard(page,summary);await page.keyboard.press('Enter')
   for(const exact of [record.conversationId,'33333333-3333-4333-8333-333333333333','55555555-5555-4555-8555-555555555555','genesys-cloud'])await expect(transcript.locator('details')).toContainText(exact)
   await capture(page,`conversation-technical-${size.width}x${size.height}`);await page.keyboard.press('Enter')
   const hierarchy=await transcript.evaluate(e=>!!(e.querySelector('.messages')!.compareDocumentPosition(e.querySelector('details')!)&Node.DOCUMENT_POSITION_FOLLOWING));expect(hierarchy).toBe(true)
  }
  await page.getByRole('button',{name:'← Back to evaluation',exact:true}).click();await expect(page.locator('.evaluation-detail')).toBeVisible()
  await navigateWorkspace(page,'Policies');await page.getByRole('button',{name:'Daily Voice Customer Service AQM',exact:true}).click()
  const policy=page.locator('.policy-detail');await expect(policy).toBeVisible();await capture(page,`policy-${size.width}x${size.height}`)
  if(!baseline){
   expect(await policy.innerText()).not.toMatch(/DURABLE POLICY|to server|general_service|Schedule matches server/)
   await expect(policy.getByRole('checkbox',{name:/Customer Service · v17/})).toBeVisible();await expect(policy).toContainText('Weekly on Monday at 02:00 Europe/London');await expect(policy).toContainText('Saved in AQM')
   const summary=policy.locator('.policy-technical > summary');await keyboard(page,summary);await page.keyboard.press('Enter');await expect(policy.locator('.policy-technical')).toContainText('daily_voice');await expect(policy.locator('.policy-technical')).toContainText('general_service@17');await capture(page,`policy-technical-${size.width}x${size.height}`);await page.keyboard.press('Enter')
  }
  await navigateWorkspace(page,'Evaluations');await page.getByRole('button',{name:'My reviews',exact:true}).click();await expect(page.getByRole('button',{name:'Start review',exact:true}).filter({visible:true}).first()).toBeVisible()
  await page.getByRole('button',{name:'Start review',exact:true}).filter({visible:true}).first().click();await expect(page.getByRole('region',{name:'Review workspace'})).toBeVisible()
  await capture(page,`focused-${size.width}x${size.height}`)
  if(!baseline){
   const review=page.getByRole('region',{name:'Human review',exact:true});await review.getByRole('button',{name:'Start review',exact:true}).click()
   await page.getByLabel('Human answer: Warm opening',{exact:true}).selectOption('No')
   const exact=page.url();await page.getByRole('button',{name:'Open conversation evidence',exact:true}).click();await expect(page.getByText('I need help with my bill.',{exact:true})).toBeVisible()
   await keyboard(page,page.getByRole('button',{name:'← Back to human review',exact:true}));await page.keyboard.press('Enter');await expect(page).toHaveURL(exact);await expect(page.getByLabel('Human answer: Warm opening',{exact:true})).toHaveValue('No')
   await page.setViewportSize({width:1440,height:900});await page.setViewportSize({width:390,height:844});await page.setViewportSize(size);await expect(page.getByLabel('Human answer: Warm opening',{exact:true})).toHaveValue('No')
   await expect(page.locator('.evaluation-provenance')).not.toHaveAttribute('open','')
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
 }finally{await f.close()}
})

for(const width of [1440,390])test(`viewer comprehension and author missing assignment ${width}`,async({browser})=>{
 const context=await browser.newContext({viewport:{width,height:width===390?844:900}}),page=await context.newPage()
 const f=await fixture(page,'VIEWER','attention','evaluations')
 try{
  await expect(page.locator('button[data-evaluation-id="recent"]')).toBeVisible();await page.locator('button[data-evaluation-id="recent"]').click()
  const detail=page.locator('.evaluation-detail');await expect(detail).toBeVisible();await expect(detail).toContainText('General Customer Service v17');await expect(detail).toContainText('80%');await expect(detail).toContainText('Not reviewed')
  await expect(detail.getByRole('button',{name:'Review evaluation',exact:true})).toHaveCount(0)
  expect(await detail.innerText()).not.toMatch(/fixture-jev|22222222-2222|NOT_REVIEWED/)
  await expect(detail.locator('.evaluation-provenance')).not.toHaveAttribute('open','')
  await capture(page,`viewer-${width}`);expect(f.requests.filter(r=>r.method!=='GET')).toEqual([])
 }finally{await f.close();await context.close()}
 const authorContext=await browser.newContext({viewport:{width,height:width===390?844:900}}),author=await authorContext.newPage()
 const a=await fixture(author,'AUTHOR','attention','policies')
 try{
  const policy=(await a.store.policies())[0];await a.store.putPolicy({...policy,evaluationFormIds:['missing_form_reference']})
  await author.getByRole('button',{name:'Refresh policies',exact:true}).click();await author.getByRole('button',{name:policy.name,exact:true}).click()
  const detail=author.locator('.policy-detail');await expect(detail).toContainText('Assigned form is no longer available');expect(await detail.innerText()).not.toContain('missing_form_reference')
  await detail.locator('.policy-technical > summary').click();await expect(detail.locator('.policy-technical')).toContainText('missing_form_reference');await detail.locator('.policy-technical > summary').click()
  await detail.getByRole('checkbox',{name:'Assigned form is no longer available. Remove assignment',exact:true}).click();await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
  await detail.getByRole('button',{name:'Save changes',exact:true}).click();expect((await a.store.policies())[0].evaluationFormIds).toEqual([])
  await capture(author,`missing-assignment-${width}`);expect(a.errors).toEqual([]);expect(a.blocked).toEqual([])
 }finally{await a.close();await authorContext.close()}
})

test('local policy authority uses browser language',async({page})=>{
 await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/').origin?r.continue():r.abort())
 await page.goto((process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/')+'?page=policies')
 await navigateWorkspace(page,'Policies');await expect(page.getByText('Saved in this browser. Connect in Settings to use saved AQM policies.',{exact:true})).toBeVisible()
 await page.getByRole('button',{name:'Cross-channel monitoring sample',exact:true}).click();const detail=page.locator('.policy-detail')
 await expect(detail).toContainText('LOCAL POLICY');await expect(detail).toContainText('Saved in this browser')
 expect(await detail.innerText()).not.toMatch(/DURABLE POLICY|to server|general_service@/)
 await expect(detail.locator('.policy-technical')).not.toHaveAttribute('open','')
})

test('saved policy and schedule remain separate with dirty guards and read-only roles',async({browser})=>{
 for(const role of ['AUTHOR','VIEWER','REVIEWER']){
  const context=await browser.newContext(),page=await context.newPage(),f=await fixture(page,role,'attention','policies')
  try{
   const original=(await f.store.policies())[0];await page.getByRole('button',{name:original.name,exact:true}).click();const detail=page.locator('.policy-detail')
   if(role==='AUTHOR'){
    await detail.getByLabel('Description',{exact:true}).fill('Fictional revised description')
    await detail.getByRole('combobox',{name:'Schedule',exact:true}).selectOption('DAILY');await detail.getByRole('button',{name:'Save schedule',exact:true}).click()
    await expect(detail.getByText('Unsaved schedule changes',{exact:true})).toHaveCount(0);await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
    expect((await f.store.policies())[0].description).toBe(original.description)
    page.once('dialog',d=>d.dismiss());await navigateWorkspace(page,'Evaluations');await expect(detail).toBeVisible()
    await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText('Unsaved changes',{exact:true})).toHaveCount(0)
    const saved=(await f.store.policies())[0];expect(saved.version).toBe((original.version??1)+1);expect(saved.evaluationFormIds).toEqual(original.evaluationFormIds)
   }else{
    await expect(detail.getByLabel('Policy name',{exact:true})).not.toBeEditable();await expect(detail.getByRole('combobox',{name:'Schedule',exact:true})).toBeDisabled();await expect(detail.getByRole('button',{name:'Save changes',exact:true})).toHaveCount(0);expect(f.requests.filter(r=>r.method!=='GET')).toEqual([])
   }
   expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
  }finally{await f.close();await context.close()}
 }
})

test('manual AI evaluation uses product copy and retains result provenance',async({page})=>{
 const f=await fixture(page,'ADMIN','attention','evaluate')
 try{
  const record=(await f.store.evaluation('recent'))!
  let calls=0
  await page.route('**/api/evaluations/manual',async route=>{calls++;expect(route.request().postDataJSON().formId).toBe(record.form.id);expect(route.request().postDataJSON().formVersion).toBe(17);await route.fulfill({json:{record,status:'completed'}})})
  await expect(page.getByRole('heading',{name:'Conversation detail',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'✦ Evaluate selected form →',exact:true}).click()
  await expect(page.getByRole('status').filter({hasText:'Evaluation saved in AQM.'})).toBeVisible()
  const result=page.getByRole('region',{name:'Evaluation results'});await expect(result).toBeVisible();expect(await result.innerText()).not.toContain(record.model)
  await expect(result).toContainText('Actual AI requests');await result.getByText('Evaluation provenance',{exact:true}).click();await expect(result).toContainText(record.model);await expect(result).toContainText(record.conversationId);await expect(result).toContainText('general_service@17')
  expect(calls).toBe(1);expect(f.blocked).toEqual([]);expect(f.errors).toEqual([])
 }finally{await f.close()}
})
