import {test,expect,type Page,type Locator} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'
import {calibrationFixture,app} from './calibrationDiscoveryFixture'
import {navigateWorkspace,chooseView} from './workspace-navigation'
const evidence=process.env.AQM_CALIBRATION_EVIDENCE??'docs/v020b-evidence';mkdirSync(evidence,{recursive:true})
const insight=(page:Page)=>page.getByRole('region',{name:'Where humans and AI differ'})
const forms=(page:Page)=>page.getByLabel('Form / version',{exact:true})
const drill=(page:Page)=>page.getByRole('region',{name:'Question calibration drill-down'})
const evals=(page:Page)=>page.getByRole('button',{name:/^Open evaluation /})
async function openFilters(page:Page){await page.getByRole('button',{name:'Change filters',exact:true}).first().click();await expect(forms(page)).toBeVisible()}
async function tabTo(page:Page,target:Locator){for(let i=0;i<150;i++){if(await target.evaluate(e=>e===document.activeElement))return;await page.keyboard.press('Tab')}throw Error('Keyboard could not reach target')}
async function capture(page:Page,name:string){await page.evaluate(()=>scrollTo(0,0));const width=page.viewportSize()!.width;expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await page.screenshot({path:`${evidence}/${name}-${width}.png`,fullPage:true});writeFileSync(`${evidence}/${name}-${width}.aria.yml`,await page.locator('.calibration-page').ariaSnapshot());writeFileSync(`${evidence}/${name}-${width}-bounds.json`,JSON.stringify(await page.locator('.calibration-scope,.calibration-insight,.responsive-view-switcher').evaluateAll(els=>els.map(e=>({text:e.textContent,top:e.getBoundingClientRect().top,right:e.getBoundingClientRect().right}))),null,2))}
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
 test(`goal-only disagreement task exact cohort, question and return ${viewport.width}`,async({page})=>{
  await page.setViewportSize(viewport);const state=await calibrationFixture(page)
  try{
   await navigateWorkspace(page,'Overview');await navigateWorkspace(page,'Calibration')
   await expect(insight(page)).toContainText('Clear next step');await expect(insight(page)).toContainText('Customer Service v17');await expect(insight(page)).toContainText('5 of 8 comparable reviewed answers disagreed');await expect(insight(page)).toContainText('62.5% disagreement');await capture(page,'disagreement')
   await insight(page).getByRole('button',{name:'Inspect question →'}).click();await expect(drill(page).getByRole('heading',{name:'Clear next step',exact:true})).toBeFocused();await expect(drill(page)).toContainText('Customer Service v17');await expect(drill(page)).toContainText('8 completed reviews · 8 comparable answers');await expect(drill(page).getByRole('button',{name:'Open reviewed evaluation 1 →'})).toBeVisible();await expect(drill(page).getByText('general_service@17',{exact:true})).not.toBeVisible()
   expect(new URL(page.url()).searchParams.get('form')).toBe('general_service@17');await capture(page,'question-drill')
   await drill(page).getByRole('button',{name:'Open disagreements',exact:true}).click();await expect(evals(page)).toHaveCount(5)
   const ids=await evals(page).evaluateAll(els=>els.map(e=>e.getAttribute('data-evaluation-id')??e.textContent))
   for(let i=0;i<5;i++)expect(ids.join(' ')).toContain(`general_service-v17-${i}`)
   expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({page:'evaluations',source:'genesys-cloud',form:'general_service@17',reviewQuestion:'understanding',reviewStatus:'REVIEWED',comparison:'disagreements',evaluationSource:'server',origin:'calibration'})
   await evals(page).first().click();await expect(page.locator('.evaluation-detail')).toBeVisible();await page.getByRole('button',{name:/^Open conversation(?: evidence)?$/}).click();await expect(page.getByRole('heading',{name:'Conversation detail',exact:true})).toBeFocused();await page.getByRole('button',{name:'← Back to evaluation',exact:true}).click();await expect(page.locator('.evaluation-detail')).toBeVisible();await page.getByRole('button',{name:'Back to Calibration',exact:true}).click();await expect(drill(page).getByRole('heading',{name:'Clear next step',exact:true})).toBeFocused();expect(new URL(page.url()).searchParams.get('calibrationTab')).toBe('questions');await page.reload();await expect(drill(page)).toContainText('Customer Service v17');await capture(page,'return')
   expect(state.errors).toEqual([]);expect(state.blocked).toEqual([]);expect(state.requests.every(r=>r.method==='GET')).toBe(true)
   writeFileSync(`${evidence}/goal-task-${viewport.width}.json`,JSON.stringify({goal:'Find where human reviewers and AI disagree most and show me the supporting evaluations.',route:['Overview','Calibration','Question detail','Evaluations','Evaluation detail','Conversation evidence','Evaluation detail','Calibration'],actions:['Read highest disagreement signal','Inspect question','Open disagreements','Open first reviewed evaluation','Open conversation evidence','Back to evaluation','Back to Calibration','Reload'],wrongTurns:[],result:'Customer Service v17 · Clear next step · 5 of 8 (62.5%)',exactCohort:ids,limitation:'Scripted fictional-user replay; no independent recruited participant.'},null,2))
  }finally{await state.close()}
 })
 test(`human historical form discovery, catalogue stability and responsive resize ${viewport.width}`,async({page})=>{
  await page.setViewportSize(viewport);const state=await calibrationFixture(page)
  try{
   await openFilters(page);await expect(forms(page).locator('option')).toHaveText(['All form versions','Complaints Handling v3','Customer Service v17','Customer Service v18'])
   expect((await state.store.forms()).map(f=>f.version)).toEqual([18]);const before=state.calls.length
   await forms(page).selectOption({label:'Customer Service v17'});await expect(insight(page)).toContainText('5 of 8');await expect(forms(page)).toHaveValue('general_service@17');await expect(forms(page).locator('option')).toHaveText(['All form versions','Complaints Handling v3','Customer Service v17','Customer Service v18']);expect(state.calls.length).toBe(before+1);await capture(page,'form-selector')
   await forms(page).selectOption({label:'Customer Service v18'});await expect(insight(page)).toContainText('2 of 6');expect(state.calls.length).toBe(before+2)
   await forms(page).selectOption({label:'Complaints Handling v3'});await expect(insight(page)).toContainText('1 of 4');await expect(insight(page)).toContainText('Complaints Handling v3')
   await forms(page).selectOption({label:'All form versions'});await expect(insight(page)).toContainText('5 of 8');await page.getByRole('button',{name:'Apply filters'}).click();await chooseView(page,'Questions');await expect(page.locator('.calibration-page .operational-table-wrap')).toContainText('Customer Service v17');await expect(page.locator('.calibration-page .operational-table-wrap')).toContainText('Customer Service v18');await capture(page,'all-forms-questions');const calls=state.calls.length
   await page.getByRole('button',{name:'Open calibration Clear next step · Customer Service v18',exact:true}).click();await expect(drill(page)).toContainText('Customer Service v18');expect(state.calls.length).toBe(calls)
   for(const width of [1440,390,1440]){await page.setViewportSize({width,height:width===390?844:900});await expect(drill(page)).toContainText('Customer Service v18');await expect(page.getByRole('combobox',{name:'View',exact:true})).toHaveCount(width===390?1:0);await expect(page.getByRole('group',{name:'Calibration breakdown'})).toHaveCount(width===390?0:1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
   writeFileSync(`${evidence}/form-task-${viewport.width}.json`,JSON.stringify({goal:'Show me calibration for Customer Service v17.',actions:['Change filters','Select Customer Service v17'],typedTechnicalReference:false,value:'general_service@17',historicalOnlyVersions:[17,3],currentLibraryVersions:[18],catalogueRetained:true,resizePreservesState:true},null,2));expect(state.errors).toEqual([])
  }finally{await state.close()}
 })
}
test('catalogue cohort request, source/date/agent/queue refresh and unavailable selection reset',async({page})=>{
 const state=await calibrationFixture(page,'&form=general_service@17&source=genesys-cloud&from=2026-09-01&to=2026-09-30&agent=Fixture%20Agent&queue=Customer%20care&calibrationTab=questions')
 try{
  await openFilters(page);await expect(forms(page).locator('option')).toHaveText(['All form versions','Customer Service v17','Customer Service v18'])
  const catalogue=state.calls.find(u=>!u.searchParams.has('form'))!;expect(Object.fromEntries(catalogue.searchParams)).toEqual({source:'genesys-cloud',from:'2026-09-01T00:00:00.000Z',to:'2026-09-30T23:59:59.999Z',agent:'Fixture Agent',queue:'Customer care'})
  const start=state.calls.length;await chooseView(page,'Groups');await chooseView(page,'Questions');expect(state.calls.length).toBe(start)
  await insight(page).getByRole('button',{name:'Open disagreements →'}).click();await expect(evals(page)).toHaveCount(5);await expect.poll(()=>state.cohorts.length).toBeGreaterThan(0);expect(state.cohorts.at(-1)!.query).toMatchObject({form:'general_service@17',source:'genesys-cloud',agent:'Fixture Agent',queue:'Customer care',from:'2026-09-01T00:00:00.000Z',to:'2026-09-30T23:59:59.999Z',comparison:'disagreements',reviewQuestion:'understanding',reviewStatus:'REVIEWED'})
  await page.getByRole('button',{name:'Back to Calibration'}).click();await openFilters(page);await page.getByLabel('Source',{exact:true}).selectOption('synthetic');await expect(forms(page)).toHaveValue('');await expect(page.getByRole('status').filter({hasText:'Showing All form versions'})).toBeVisible();await page.getByLabel('Agent',{exact:true}).fill('');await page.getByLabel('Queue',{exact:true}).fill('');await expect(forms(page).locator('option')).toHaveText(['All form versions','Practice Service v2'])
  await page.getByLabel('Source',{exact:true}).selectOption('genesys-cloud');await expect(forms(page).locator('option')).toHaveText(['All form versions','Customer Service v17','Customer Service v18'])
  await page.locator('.calibration-page').getByLabel('From',{exact:true}).fill('2026-09-15');await expect(forms(page).locator('option')).toHaveText(['All form versions','Customer Service v18'])
  await forms(page).selectOption('general_service@18');await expect(insight(page)).toContainText('2 of 6');await page.getByLabel('Queue',{exact:true}).fill('Complaints');await expect(forms(page)).toHaveValue('');await expect(forms(page).locator('option')).toHaveText(['All form versions'])
  await page.locator('.calibration-page').getByLabel('From',{exact:true}).fill('');await page.locator('.calibration-page').getByLabel('To',{exact:true}).fill('');await expect(forms(page).locator('option')).toHaveText(['All form versions','Complaints Handling v3']);await page.getByLabel('Agent',{exact:true}).fill('fixture-agent');await expect(forms(page).locator('option')).toHaveText(['All form versions']);expect(state.errors).toEqual([])
 }finally{await state.close()}
})
test('catalogue failure leaves filtered data usable, retry is isolated, main failure and no comparisons are safe',async({page})=>{
 const state=await calibrationFixture(page,'&form=general_service@17')
 try{
  state.failCatalogue();await page.reload();await expect(insight(page)).toContainText('5 of 8');await expect(page.getByText('Form choices unavailable — retry')).toBeVisible();await openFilters(page);await expect(forms(page)).toHaveValue('general_service@17');await expect(forms(page).locator('option:checked')).toHaveText('Customer Service v17');const count=state.calls.length;state.failCatalogue(false);await page.getByRole('button',{name:'Retry form choices'}).click();await expect(forms(page).locator('option')).toHaveCount(4);expect(state.calls.length).toBe(count+1)
  state.failMain();await page.reload();await expect(page.getByRole('alert')).toContainText('Calibration could not be loaded.');state.failMain(false);await page.getByRole('button',{name:'Retry calibration'}).click();await expect(insight(page)).toContainText('5 of 8')
  await page.goto(`${app}?page=calibration&form=unlisted@2&calibrationTab=questions`);await expect(insight(page)).toContainText('No completed human/AI comparisons match this scope.');await openFilters(page);await expect(forms(page)).toHaveValue('unlisted@2');await expect(forms(page).locator('option:checked')).toHaveText('Selected form version');expect(new URL(page.url()).searchParams.get('form')).toBe('unlisted@2');expect(state.errors).toEqual([])
 }finally{await state.close()}
})
test('Back/Forward preserve form, view and exact question; deep link reload',async({page})=>{
 const state=await calibrationFixture(page,'&form=general_service@17&calibrationTab=questions')
 try{
  await openFilters(page);await forms(page).selectOption('general_service@18');await expect(insight(page)).toContainText('2 of 6');await page.getByRole('button',{name:'Apply filters'}).click();await chooseView(page,'Groups');await page.goBack();await expect(page.getByRole('group',{name:'Calibration breakdown'}).getByRole('button',{name:'Questions',exact:true})).toHaveAttribute('aria-pressed','true');await page.goBack();await expect(insight(page)).toContainText('5 of 8');await page.goForward();await expect(insight(page)).toContainText('2 of 6');await insight(page).getByRole('button',{name:'Inspect question →'}).click();await expect(drill(page)).toContainText('Customer Service v18');await page.goBack();await expect(drill(page)).toHaveCount(0);await page.goForward();await expect(drill(page)).toContainText('Customer Service v18');await drill(page).getByRole('button',{name:'Open disagreements',exact:true}).click();await expect(evals(page)).toHaveCount(2);await page.goBack();await expect(drill(page)).toContainText('Customer Service v18');await page.goForward();await expect(evals(page)).toHaveCount(2);await page.getByRole('button',{name:'Back to Calibration'}).click();await page.reload();await expect(drill(page)).toContainText('Customer Service v18');expect(state.errors).toEqual([])
 }finally{await state.close()}
})
for(const width of [1440,390])test(`keyboard scope, mobile View, question, evaluation and return ${width}`,async({page})=>{
 await page.setViewportSize({width,height:844});const state=await calibrationFixture(page)
 const act=async(l:Locator)=>{await tabTo(page,l);await page.keyboard.press('Enter')}
 try{
  await act(page.getByRole('button',{name:'Change filters',exact:true}).first());await tabTo(page,forms(page));await page.keyboard.type('Customer Service v17');await page.keyboard.press('Enter');await expect(forms(page)).toHaveValue('general_service@17');await expect(insight(page)).toContainText('5 of 8');await act(page.getByRole('button',{name:'Apply filters'}));await expect(page.getByRole('button',{name:'Change filters',exact:true}).first()).toBeFocused()
  if(width===390){const view=page.getByRole('combobox',{name:'View',exact:true});await tabTo(page,view);await page.keyboard.type('Questions');await page.keyboard.press('Enter');await expect(view).toHaveValue('questions')}
  await act(insight(page).getByRole('button',{name:'Inspect question →'}));await expect(drill(page).getByRole('heading')).toBeFocused();await act(drill(page).getByRole('button',{name:'Open disagreements',exact:true}));await expect(evals(page)).toHaveCount(5);await act(evals(page).first());await expect(page.locator('.evaluation-detail')).toBeVisible();await act(page.getByRole('button',{name:'Back to Calibration'}));await expect(drill(page).getByRole('heading')).toBeFocused();expect(state.errors).toEqual([]);writeFileSync(`${evidence}/keyboard-${width}.json`,JSON.stringify({keyboardOnly:true,filters:true,nativeView:width===390,questionFocus:true,returnFocus:true,noTrap:true},null,2))
 }finally{await state.close()}
})

test('valid deep-linked version absent from fresh catalogue retains returned human authority',async({page})=>{
 const state=await calibrationFixture(page,'&form=general_service@17&calibrationTab=questions');try{
  state.omitSelected();await page.reload();await expect(insight(page)).toContainText('5 of 8');await openFilters(page);await expect(forms(page)).toHaveValue('general_service@17');await expect(forms(page).locator('option:checked')).toHaveText('Customer Service v17');await expect(forms(page).locator('option')).toHaveCount(4);expect(new URL(page.url()).searchParams.get('form')).toBe('general_service@17');expect(state.errors).toEqual([]);expect(state.blocked).toEqual([])
 }finally{await state.close()}
})
