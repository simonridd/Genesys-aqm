import { test,expect,type Page,type Locator } from '@playwright/test'
import { mkdirSync,writeFileSync } from 'node:fs'
import { fixture } from './reviewer-recheck-fixture'
import { continuityFixture } from './reviewer-continuity-fixture'
import { assignReview,scoreAssignedReview } from '../src/server/reviewOperations'
import { reviewInput } from '../src/fixtures/reviewFixture'
import { keyboardTo } from './usability-fixture'
const out=process.env.AQM_REVIEW_FOCUS_EVIDENCE??'docs/v019e-evidence';mkdirSync(out,{recursive:true})
const panel=(page:Page)=>page.getByRole('region',{name:'Human review',exact:true})
const task=(page:Page)=>page.getByRole('region',{name:'Review workspace',exact:true})
const cta=(page:Page,label='Continue review')=>page.getByRole('button',{name:label,exact:true}).filter({visible:true}).first()
async function geometry(page:Page,name:string,locator:Locator){
 const box=(await locator.boundingBox())!,v=page.viewportSize()!,main=(await page.locator('main').boundingBox())!
 expect(box.x).toBeGreaterThanOrEqual(main.x);expect(box.x+box.width).toBeLessThanOrEqual(Math.min(main.x+main.width,v.width)+1)
 expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(v.height+1)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 return {name,box,main,viewport:v,scroll:await page.evaluate(()=>({x:scrollX,y:scrollY}))}
}
async function capture(page:Page,name:string){await page.screenshot({path:`${out}/${name}.png`,fullPage:true});await page.screenshot({path:`${out}/${name}-viewport.png`})}
async function edit(page:Page,all=false){
 await page.getByLabel('Human answer: Warm opening',{exact:true}).selectOption('No')
 await page.getByLabel('Question note: Warm opening',{exact:true}).fill('UNSAVED focused question note')
 await page.getByLabel('Human answer: Understanding the issue',{exact:true}).selectOption('2')
 await page.getByLabel('Overall review note',{exact:true}).fill('UNSAVED focused overall note')
 if(all)await page.getByLabel('Human answer: Resolution',{exact:true}).selectOption('fully_resolved')
}
async function restored(page:Page){
 await expect(page.getByLabel('Human answer: Warm opening',{exact:true})).toHaveValue('No')
 await expect(page.getByLabel('Question note: Warm opening',{exact:true})).toHaveValue('UNSAVED focused question note')
 await expect(page.getByLabel('Human answer: Understanding the issue',{exact:true})).toHaveValue('2')
 await expect(page.getByLabel('Overall review note',{exact:true})).toHaveValue('UNSAVED focused overall note')
}
async function evidence(page:Page,mutate?:()=>Promise<unknown>){
 const exact=page.url()
 await page.getByRole('button',{name:'Open conversation evidence',exact:true}).click()
 await expect(page.getByRole('heading',{name:'Conversation detail',exact:true})).toBeFocused()
 await expect(page.getByText('I need help with my bill.',{exact:true})).toBeVisible()
 if(mutate)await mutate()
 await page.getByRole('button',{name:'← Back to human review',exact:true}).click()
 await expect(page).toHaveURL(exact)
 await expect(task(page)).toBeVisible()
 await expect(panel(page).getByRole('heading',{name:'Review this evaluation',exact:true})).toBeFocused()
 await expect(page.locator('.evaluation-queue')).toBeHidden()
}
for(const viewport of [{width:390,height:844},{width:1440,height:900},{width:1920,height:1080},{width:1440,height:720}])test(`focused reviewer task replay ${viewport.width}x${viewport.height}`,async({page})=>{
 test.setTimeout(90000);await page.setViewportSize(viewport)
 const f=await fixture(page,'REVIEWER','attention','evaluations'),actions:string[]=[],bounds:any[]=[]
 const action=async(label:string,fn:()=>Promise<unknown>)=>{await fn();actions.push(label)}
 const suffix=`${viewport.width}x${viewport.height}`
 try{
  const button=cta(page,'Start review');await expect(button).toBeVisible()
  const list=viewport.width===390?page.getByRole('list',{name:'My review tasks'}):page.getByRole('region',{name:'My reviews table',exact:true})
  await expect(list).toBeVisible()
  if(viewport.width!==390)await button.scrollIntoViewIfNeeded()
  await capture(page,`queue-${suffix}`)
  bounds.push(await geometry(page,'highest-priority Start review',button))
  const original=JSON.stringify(await f.store.evaluations())
  await action('Choose highest-priority review',()=>button.click())
  await expect(task(page)).toBeVisible();await expect(page.locator('.evaluation-queue')).toBeHidden()
  await expect(task(page).getByRole('heading',{level:1})).toBeFocused()
  await expect(panel(page).getByRole('button',{name:'Start review',exact:true})).toBeVisible()
  await expect(page.locator('.review-comparison')).not.toHaveAttribute('open','')
  bounds.push(await geometry(page,'Open conversation evidence',page.getByRole('button',{name:'Open conversation evidence',exact:true})))
  await capture(page,`focused-start-${suffix}`)
  await action('Start independent review',()=>panel(page).getByRole('button',{name:'Start review',exact:true}).click())
  const first=page.getByLabel('Human answer: Warm opening',{exact:true});await expect(first).toBeFocused()
  await expect(panel(page).getByRole('button',{name:'Start review',exact:true})).toHaveCount(0)
  const distance=await page.evaluate(()=>{
   const top=(e:Element)=>e.getBoundingClientRect().top+scrollY
   const workspace=document.querySelector('.review-workspace')!,first=document.querySelector('[aria-label="Human answer: Warm opening"]')!
   return {workspaceTop:top(workspace),firstAnswerTop:top(first),distance:top(first)-top(workspace)}
  })
  const hierarchy=await page.evaluate(()=>{
   const root=document.querySelector('.review-workspace')!,human=root.querySelector('.review-human')!,ai=root.querySelector('.review-ai')!,question=root.querySelector('.review-question')!,comparison=root.querySelector('.review-comparison')!,history=root.querySelector('.review-audit')!
   const before=(a:Element,b:Element)=>!!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)
   return {humanBeforeAi:before(human,ai),questionBeforeComparison:before(question,comparison),questionBeforeHistory:before(question,history),queueHidden:(document.querySelector('.evaluation-queue') as HTMLElement).hidden,comparisonClosed:!comparison.hasAttribute('open'),historyClosed:!history.hasAttribute('open')}
  });expect(Object.values(hierarchy).every(Boolean)).toBe(true)
  await capture(page,`active-question-${suffix}`)
  await action('Answer first question',()=>first.selectOption('No'))
  await action('Add question note',()=>page.getByLabel('Question note: Warm opening',{exact:true}).fill('Opening did not acknowledge the impact.'))
  await action('Answer second question',()=>page.getByLabel('Human answer: Understanding the issue',{exact:true}).selectOption('2'))
  await action('Add overall note',()=>page.getByLabel('Overall review note',{exact:true}).fill('Resolution evidence is clear.'))
  await expect(page.locator('.review-progress')).toHaveText('2 of 3 questions answered')
  const exact=page.url(),writes=f.requests.filter(r=>r.method==='PUT').length
  await action('Inspect conversation evidence',()=>page.getByRole('button',{name:'Open conversation evidence',exact:true}).click())
  await expect(page.getByText('I need help with my bill.',{exact:true})).toBeVisible()
  await action('Back to review',()=>page.getByRole('button',{name:'← Back to human review',exact:true}).click())
  await expect(page).toHaveURL(exact);await expect(task(page)).toBeVisible();await expect(page.locator('.evaluation-queue')).toBeHidden()
  await expect(first).toHaveValue('No');await expect(page.getByLabel('Question note: Warm opening',{exact:true})).toHaveValue('Opening did not acknowledge the impact.')
  await expect(page.getByLabel('Human answer: Understanding the issue',{exact:true})).toHaveValue('2');await expect(page.getByLabel('Overall review note',{exact:true})).toHaveValue('Resolution evidence is clear.')
  expect(f.requests.filter(r=>r.method==='PUT')).toHaveLength(writes)
  await expect(panel(page).getByRole('heading',{name:'Review this evaluation',exact:true})).toBeFocused()
  await capture(page,`evidence-return-${suffix}`)
  await action('Answer final question',()=>page.getByLabel('Human answer: Resolution',{exact:true}).selectOption('fully_resolved'))
  const complete=page.getByRole('group',{name:'Finish review',exact:true}).getByRole('button',{name:'Complete review',exact:true})
  await complete.scrollIntoViewIfNeeded();bounds.push(await geometry(page,'Complete review after final note',complete))
  const work=f.requests.filter(r=>r.path==='/api/review-workload').length
  await action('Complete review',()=>complete.click())
  await expect(panel(page).getByRole('status')).toContainText('Review completed. It has been removed from My Reviews. The original AI result is preserved.')
  await expect(panel(page).getByRole('status')).toBeFocused()
  await expect(page.locator('.review-comparison')).toHaveCount(0)
  await expect(task(page).locator('.review-summary')).toBeVisible()
  await expect.poll(()=>f.requests.filter(r=>r.path==='/api/review-workload').length).toBeGreaterThan(work)
  expect(JSON.stringify(await f.store.evaluations())).toBe(original)
  expect(f.requests.filter(r=>r.method==='PUT'&&r.path==='/api/reviews/escalated')).toHaveLength(2)
  await capture(page,`completed-${suffix}`)
  await action('Close and continue My Reviews',()=>page.getByRole('button',{name:'Close and continue My Reviews',exact:true}).click())
  await expect(task(page)).toHaveCount(0);await expect(page.locator('.evaluation-queue')).toBeVisible()
  await expect(page.getByLabel('My review summary')).toContainText('4')
  await expect(cta(page,'Start review')).toBeVisible()
  expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
  writeFileSync(`${out}/task-${suffix}.json`,JSON.stringify({viewport,actions,horizontalDiscoveryGestures:0,wrongTurns:0,verticalAnalysisDetours:0,distance,hierarchy,bounds,requestBoundary:{pageErrors:f.errors,blocked:f.blocked,reviewPuts:2,completionPuts:1}},null,2)+'\n')
 }finally{await f.close()}
})

test('Continue, multiple drafts, resize and save retain focus and values',async({page})=>{
 const f=await continuityFixture(page);await cta(page).click();await expect(task(page)).toBeVisible()
 await edit(page);const initial=await page.getByRole('button',{name:'Save progress',exact:true}).count()
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});await restored(page);await expect(task(page)).toBeVisible();expect(await page.getByRole('button',{name:'Save progress',exact:true}).count()).toBe(initial);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
 await page.getByRole('button',{name:'Back to My Reviews',exact:true}).click()
 await cta(page).nth(0).click();await restored(page)
 await page.getByRole('button',{name:'Back to My Reviews',exact:true}).click()
 await page.getByRole('region',{name:'My reviews table',exact:true}).getByRole('button',{name:'Continue review',exact:true}).nth(1).click()
 await expect(page.getByLabel('Overall review note',{exact:true})).toHaveValue('')
 await page.getByLabel('Overall review note',{exact:true}).fill('Review B only')
 await page.getByRole('button',{name:'Back to My Reviews',exact:true}).click();await cta(page).click();await restored(page)
 await panel(page).getByRole('button',{name:'Save progress',exact:true}).first().click()
 await expect(panel(page).getByRole('status')).toHaveText('Review progress saved.')
 expect(f.requests.filter(r=>r.method==='PUT')).toHaveLength(1);expect(f.requests.find(r=>r.method==='PUT')?.body.expectedRevision).toBe(2)
})
for(const change of ['revision','assignment'] as const)test(`dirty focused review handles ${change} safely`,async({page})=>{
 await page.setViewportSize({width:390,height:844});const f=await continuityFixture(page)
 if(change==='revision')await f.advance()
 await cta(page).click();await edit(page,true)
 await evidence(page,()=>f.advance('review-a',change==='assignment'))
 await expect(panel(page).getByRole('alert')).toContainText('This review changed')
 if(change==='revision'){
  await restored(page);await expect(panel(page).getByRole('button',{name:'Save progress',exact:true}).first()).toBeDisabled();await expect(panel(page).getByRole('button',{name:'Complete review',exact:true}).first()).toBeDisabled()
  await panel(page).getByRole('button',{name:'Refresh current review',exact:true}).click();await restored(page)
  await panel(page).getByRole('button',{name:'Discard my unsaved answers',exact:true}).click();await expect(page.getByLabel('Overall review note',{exact:true})).toHaveValue('New authoritative note')
 }else{
  await expect(panel(page)).toContainText('Assigned to another reviewer');await expect(panel(page)).toContainText('UNSAVED focused overall note');await expect(page.getByLabel('Human answer: Warm opening',{exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Complete review',exact:true})).toHaveCount(0)
 }
 expect(f.requests.filter(r=>r.method==='PUT')).toHaveLength(0)
})
test('focused evidence, completion and queue return preserve later server cursor and exact filters',async({page})=>{
 const query='page=evaluations&reviewQueue=mine&assignment=mine&due=today&dueState=DUE_SOON&queue=Fixture+Queue&form=general_service%4017'
 const f=await continuityFixture(page,query,{pagination:true})
 await page.getByRole('button',{name:'Next page →',exact:true}).click();await cta(page).click();await edit(page,true)
 await evidence(page);await restored(page)
 const writes=await page.evaluate(()=>(window as any).__reviewTrace.writes)
 expect(writes.filter((w:any)=>/UNSAVED|baseRevision|reviewDraft|"questionId"/.test(w.value))).toEqual([])
 await page.getByRole('group',{name:'Finish review',exact:true}).getByRole('button',{name:'Complete review',exact:true}).click()
 await expect(panel(page).getByRole('status')).toContainText('Review completed.')
 await expect.poll(()=>f.requests.filter(r=>r.url.pathname==='/api/evaluations').at(-1)?.url.searchParams.get('cursor')).toBe('page-two')
 await page.getByRole('button',{name:'Close and continue My Reviews',exact:true}).click()
 const params=new URL(page.url()).searchParams
 for(const [k,v] of new URLSearchParams(query))expect(params.get(k)).toBe(v)
 await expect(page.locator('button[data-evaluation-id="review-a"]:visible')).toHaveCount(0)
 await expect(page.locator('button[data-evaluation-id="review-b"]:visible')).toHaveCount(0)
 expect(f.requests.filter(r=>r.method==='PUT'&&r.body.action==='complete')).toHaveLength(1)
})
test('keyboard-only focused task uses meaningful focus transitions',async({page})=>{
 await page.setViewportSize({width:390,height:844});await continuityFixture(page,undefined,{start:false})
 await keyboardTo(page,cta(page,'Start review'));await page.keyboard.press('Enter')
 await expect(task(page).getByRole('heading',{level:1})).toBeFocused()
 await keyboardTo(page,panel(page).getByRole('button',{name:'Start review',exact:true}));await page.keyboard.press('Enter')
 await expect(page.getByLabel('Human answer: Warm opening',{exact:true})).toBeFocused();await page.keyboard.press('n');await page.keyboard.press('Tab')
 await keyboardTo(page,page.getByLabel('Question note: Warm opening',{exact:true}));await page.keyboard.type('UNSAVED keyboard note')
 await keyboardTo(page,page.getByRole('button',{name:'Open conversation evidence',exact:true}));await page.keyboard.press('Enter')
 await keyboardTo(page,page.getByRole('button',{name:'← Back to human review',exact:true}));await page.keyboard.press('Enter')
 await expect(panel(page).getByRole('heading',{name:'Review this evaluation',exact:true})).toBeFocused()
 for(const [label,key] of [['Understanding the issue','g'],['Resolution','f']]){await keyboardTo(page,page.getByLabel('Human answer: '+label,{exact:true}));await page.keyboard.press(key);await page.keyboard.press('Tab')}
 await keyboardTo(page,page.getByRole('group',{name:'Finish review',exact:true}).getByRole('button',{name:'Complete review',exact:true}));await page.keyboard.press('Enter')
 await expect(panel(page).getByRole('status')).toContainText('Review completed.')
 await keyboardTo(page,page.getByRole('button',{name:'Close and continue My Reviews',exact:true}));await page.keyboard.press('Enter')
 await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeFocused()
})

test('mobile available work claims into the same focused workspace',async({page})=>{
 await page.setViewportSize({width:390,height:844});const f=await fixture(page,'REVIEWER','attention','evaluations')
 try{
  await page.getByRole('button',{name:/^Available unassigned reviews/}).click()
  const claim=cta(page,'Claim and start review');await expect(claim).toBeVisible();await claim.scrollIntoViewIfNeeded();await geometry(page,'claim action',claim)
  await claim.click();await expect(task(page)).toBeVisible();await expect(page.locator('.evaluation-queue')).toBeHidden()
  await panel(page).getByRole('button',{name:'Claim and start review',exact:true}).click()
  await expect(page.getByLabel('Human answer: Warm opening',{exact:true})).toBeFocused()
  await expect(panel(page).getByRole('button',{name:'Start review',exact:true})).toHaveCount(0)
  expect(f.requests.filter(r=>r.method==='PUT'&&r.path.startsWith('/api/reviews/'))).toHaveLength(1)
  const id=new URL(page.url()).searchParams.get('evaluationId')!;expect((await f.store.review(id))?.assignment?.assignee.userId).toBe('reviewer')
  await evidence(page)
  await page.getByRole('button',{name:'Back to review queue',exact:true}).click()
  expect(new URL(page.url()).searchParams.get('assignment')).toBe('unassigned')
  expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
 }finally{await f.close()}
})
test('applicable progress excludes skipped questions',async({page})=>{
 const f=await continuityFixture(page),record=(await f.store.evaluation('review-a'))!
 record.questions=record.questions.map(q=>q.id==='resolution'?{...q,status:'SKIPPED',outcome:'Not applicable',credit:null}:q)
 await f.store.putEvaluation(record)
 await page.getByRole('button',{name:'More filters',exact:true}).click();await page.getByRole('button',{name:'Refresh',exact:true}).click()
 await cta(page).click();await expect(page.locator('.review-progress')).toHaveText('0 of 2 questions answered')
 await edit(page);await expect(page.locator('.review-progress')).toHaveText('2 of 2 questions answered')
 await expect(page.getByRole('button',{name:'Complete review',exact:true}).first()).toBeEnabled()
})
test('focused ADMIN retains assignment management under disclosure',async({page})=>{
 const f=await fixture(page,'ADMIN','attention','evaluations')
 try{
  await page.getByRole('button',{name:'My reviews',exact:true}).click();await cta(page,'Start review').click()
  await expect(page.getByRole('region',{name:'Review assignment',exact:true})).toBeHidden()
  await page.getByText('Assignment details',{exact:true}).click();await expect(page.getByRole('region',{name:'Review assignment',exact:true})).toBeVisible()
  expect(f.requests.filter(r=>r.method==='PUT')).toHaveLength(0)
 }finally{await f.close()}
})
for(const [name,query,remains] of [['active','page=evaluations&reviewQueue=active',false],['explorer','page=evaluations&evaluationSource=server',true]] as const)test(`explicit Start from ${name} enters focused work and reconciles completion`,async({page})=>{
 const f=await continuityFixture(page,query,{start:false})
 await page.locator('button[data-evaluation-id="review-a"]:visible').click();await expect(task(page)).toHaveCount(0)
 await panel(page).getByRole('button',{name:'Start review',exact:true}).click()
 await expect(task(page)).toBeVisible();await expect(page.getByLabel('Human answer: Warm opening',{exact:true})).toBeFocused()
 await expect(panel(page).getByRole('status')).toHaveText('Review started.')
 await edit(page,true)
 await page.getByRole('group',{name:'Finish review',exact:true}).getByRole('button',{name:'Complete review',exact:true}).click()
 await expect(panel(page).getByRole('status')).toContainText('Review completed. The original AI result is preserved.')
 await page.getByRole('button',{name:/^Close and continue/}).click()
 await expect(page.locator('button[data-evaluation-id="review-a"]:visible')).toHaveCount(remains?1:0)
 expect(new URL(page.url()).searchParams.get('reviewQueue')).toBe(name==='active'?'active':null)
 expect(f.requests.filter(r=>r.method==='PUT'&&r.body.action==='complete')).toHaveLength(1)
 expect(JSON.stringify(await f.store.evaluations())).toBe(f.before)
})
test('later presentation page survives evidence, completion and queue return',async({page})=>{
 const f=await continuityFixture(page),base=(await f.store.evaluation('review-a'))!,review=(await f.store.review('review-a'))!
 for(let i=0;i<25;i++){
  const id=`page-review-${i}`;await f.store.putEvaluation({...base,id})
  const record={...base,id},authority={bootstrapId:'admin',allowedUserIds:new Set(['admin','reviewer','other'])},now='2026-10-03T12:00:00.000Z'
  await assignReview(f.store,id,{action:'assign',expectedRevision:0,assigneeId:'reviewer',dueAt:review.assignment?.dueAt},{userId:'admin'},now,authority)
  await scoreAssignedReview(f.store,id,reviewInput(record,'start',1),{userId:'reviewer',displayName:'Fictional Reviewer'},now,authority)
 }
 await page.getByRole('button',{name:'More filters',exact:true}).click();await page.getByRole('button',{name:'Refresh',exact:true}).click()
 await page.getByRole('button',{name:'Next →',exact:true}).click();expect(new URL(page.url()).searchParams.get('evaluations.page')).toBe('2')
 const button=cta(page);await button.click();const id=new URL(page.url()).searchParams.get('evaluationId')!
 await edit(page,true);await evidence(page);await restored(page)
 expect(new URL(page.url()).searchParams.get('evaluations.page')).toBe('2')
 await page.getByRole('group',{name:'Finish review',exact:true}).getByRole('button',{name:'Complete review',exact:true}).click();await expect(panel(page).getByRole('status')).toContainText('Review completed.')
 await page.getByRole('button',{name:'Close and continue My Reviews',exact:true}).click()
 await expect(page.getByText('Page 2 of 2',{exact:true})).toBeVisible();expect(new URL(page.url()).searchParams.get('evaluations.page')).toBe('2')
 await expect(page.locator(`button[data-evaluation-id="${id}"]:visible`)).toHaveCount(0)
 expect(f.requests.filter(r=>r.url.pathname==='/api/evaluations').every(r=>!r.url.searchParams.has('evaluations.page'))).toBe(true)
})
