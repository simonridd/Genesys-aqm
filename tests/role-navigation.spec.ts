import { test,expect,type Page } from '@playwright/test'
import { mkdirSync,writeFileSync } from 'node:fs'
import { fixture,draft,app } from './authoringSimplificationFixture'
import { usabilityFixture,keyboardTo } from './usability-fixture'
import { continuityFixture } from './reviewer-continuity-fixture'
import { qualityFixture } from './qualityActionabilityFixture'
import { navigationForRole,pageLabel } from '../src/navigationPresentation'
import { roles,rolePermissions } from '../src/domain/governance'
import { pages } from '../src/domain/navigation'
import { seedAnswerSets } from '../src/domain/seedAnswerSets'
import { seedGroupAssets } from '../src/domain/seedGroupAssets'
import { navigateWorkspace,chooseView } from './workspace-navigation'
const evidence=process.env.AQM_NAV_EVIDENCE??'docs/v019d-evidence';mkdirSync(evidence,{recursive:true})
const nav=(p:Page)=>p.getByRole('navigation',{name:'Primary navigation'})
async function geometry(p:Page){return p.evaluate(()=>{const sidebar=document.querySelector('.sidebar')!,n=document.querySelector('.workspace-navigation')??document.querySelector('[aria-label="Primary navigation"]')!;const visible=(e:Element)=>!e.closest('details:not([open])')&&!!(e as HTMLElement).offsetWidth&&!!(e as HTMLElement).offsetHeight;return {viewport:{width:innerWidth,height:innerHeight},sidebarHeight:sidebar.getBoundingClientRect().height,navHeight:n.getBoundingClientRect().height,visibleDestinations:[...n.querySelectorAll('button')].filter(visible).map(e=>e.textContent?.trim()),visibleDestinationCount:[...n.querySelectorAll('button')].filter(visible).length,collapsedSecondaryGroups:n.querySelectorAll('details:not([open])').length,documentWidth:document.documentElement.scrollWidth,bodyWidth:innerWidth,viewControls:[...document.querySelectorAll('.desktop-view-switcher,.mobile-view-switcher')].map(e=>({display:getComputedStyle(e).display,width:e.getBoundingClientRect().width,scrollWidth:e.scrollWidth,selected:(e.querySelector('[aria-pressed=true]')?.textContent??e.querySelector('option:checked')?.textContent)}))}})}
async function capture(p:Page,name:string){await p.evaluate(()=>scrollTo(0,0));if(p.viewportSize()!.width===390&&name==='calibration-confidence')await p.locator('.responsive-view-switcher').scrollIntoViewIfNeeded();writeFileSync(`${evidence}/${name}-${p.viewportSize()!.width}x${p.viewportSize()!.height}.aria.yml`,await nav(p).ariaSnapshot()+'\n'+await p.getByRole('navigation',{name:'Breadcrumb'}).ariaSnapshot());await p.screenshot({path:`${evidence}/${name}-${p.viewportSize()!.width}x${p.viewportSize()!.height}.png`});writeFileSync(`${evidence}/${name}-${p.viewportSize()!.width}x${p.viewportSize()!.height}.json`,JSON.stringify(await geometry(p),null,2));expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
for(const role of roles)for(const viewport of [{width:1440,height:900},{width:390,height:844}])test(`${role} role focus and reference capability ${viewport.width}`,async({page})=>{
 await page.setViewportSize(viewport);const groups=navigationForRole(role),primary=groups[0],state=await fixture(page,role,[],[draft()],[],role==='AUTHOR'?'forms':'automation')
 try{
 await expect(nav(page).locator('details[open]')).toHaveCount(1)
 for(const destination of primary.pages)await expect(nav(page).getByRole('button',{name:pageLabel(destination),exact:true})).toBeVisible()
 await expect(nav(page).getByRole('button',{name:'Settings',exact:true})).toBeVisible();await expect(nav(page).getByRole('button',{name:'About / product tour',exact:true})).toBeVisible();await expect(nav(page).getByRole('button',{name:'Conversation review',exact:true})).toHaveCount(0)
 await expect(nav(page).locator('[aria-current="page"]')).toHaveCount(1);await capture(page,`role-${role.toLowerCase()}`)
 if(role!=='AUTHOR'){
  await navigateWorkspace(page,role==='ADMIN'?'Policies':'Evaluation Forms');await expect(nav(page).locator('details[open]').filter({hasText:role==='ADMIN'?'Configuration':'Reference configuration'})).toBeVisible();await expect(nav(page).locator('[aria-current="page"]')).toHaveText(role==='ADMIN'?'◇Policies':'▤Evaluation Forms')
  if(role==='REVIEWER'||role==='VIEWER'){await page.getByRole('button',{name:'Open form Fixture choice form v1'}).click();await expect(page.locator('.form-detail')).toContainText('read-only');await expect(page.getByRole('button',{name:'Save changes',exact:true})).toHaveCount(0)}
  await capture(page,`${role.toLowerCase()}-configuration-open`)
 }
 else{await navigateWorkspace(page,'Analytics');await expect(page.getByRole('heading',{level:1})).toHaveText('Quality analytics');await expect(nav(page).locator('[aria-current="page"]')).toContainText('Analytics')}
 await navigateWorkspace(page,'Settings');await expect(page.getByRole('navigation',{name:'Settings sections'}).locator('[aria-current="location"]')).toHaveText('Connection');await capture(page,`settings-${role.toLowerCase()}`)
 await navigateWorkspace(page,'Conversations');await expect(page.getByRole('heading',{level:1})).toHaveText('Conversations')
 expect(state.errors).toEqual([])
 }finally{await state.close()}
})
for(const role of roles)test(`${role} shared routes deep-link; labels and access stay authoritative`,async({page})=>{
 test.setTimeout(90000);{const state=await fixture(page,role,[],[draft()],[], 'forms');try{
  for(const destination of pages){await page.goto(`${app}?page=${destination}`);await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();await expect(page.getByRole('navigation',{name:'Breadcrumb'})).toContainText(pageLabel(destination));await expect(nav(page).locator('[aria-current="page"]')).toHaveCount(destination==='evaluate'||destination==='history'?0:1);if(destination!=='evaluate'&&destination!=='history')await expect(nav(page).locator('[aria-current="page"]')).toBeVisible();if(role==='ADMIN'&&['automation','answerSets','groups','evaluate','analytics','settings'].includes(destination))await page.getByRole('navigation',{name:'Breadcrumb'}).screenshot({path:`${evidence}/breadcrumb-${destination}.png`})}
  const actual=await page.evaluate(async origin=>(await (await fetch(origin+'/api/session',{headers:{Authorization:'Bearer fixture'}})).json()).permissions,'https://aqm-api-bd54ukouga-nw.a.run.app');expect(actual).toEqual(rolePermissions[role]);expect(state.errors).toEqual([])
 }finally{await state.close()}}
})
test('keyboard disclosures remember session choices, active page wins, product tour preserves them',async({page})=>{
 const state=await fixture(page,'ADMIN',[],[draft()],[],'automation');try{
 const configuration=nav(page).locator('details').filter({has:page.locator('summary').filter({hasText:/^Configuration$/})}),summary=configuration.locator('summary')
 await keyboardTo(page,summary);expect(await summary.evaluate(e=>getComputedStyle(e).outlineColor)).toBe('rgb(215, 245, 255)');await page.keyboard.press('Enter');await expect(configuration).toHaveAttribute('open','')
 const forms=nav(page).getByRole('button',{name:'Evaluation Forms',exact:true});await keyboardTo(page,forms);expect(await forms.evaluate(e=>getComputedStyle(e).outlineColor)).toBe('rgb(215, 245, 255)');await page.keyboard.press('Enter');expect(await page.evaluate(()=>document.activeElement!==document.body)).toBe(true);await expect(forms).toHaveAttribute('aria-current','page')
 await navigateWorkspace(page,'Overview');await summary.focus();await page.keyboard.press('Space');await expect(configuration).not.toHaveAttribute('open','')
 await navigateWorkspace(page,'Settings');await expect(configuration).not.toHaveAttribute('open','')
 await nav(page).getByRole('button',{name:'About / product tour',exact:true}).click();await page.getByRole('button',{name:'Open AQM',exact:true}).first().click();await expect(configuration).not.toHaveAttribute('open','')
 await page.goto(`${app}?page=policies&policyId=missing`);await expect(configuration).toHaveAttribute('open','');await expect(nav(page).getByRole('button',{name:'Policies',exact:true})).toHaveAttribute('aria-current','page')
 expect(state.errors).toEqual([])
 }finally{await state.close()}
})
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844},{width:1440,height:720}])test(`view keyboard, hidden controls and reachability ${viewport.width}x${viewport.height}`,async({page})=>{
 await page.setViewportSize(viewport);const state=await usabilityFixture(page,'ADMIN','page=analytics&analyticsTab=coverage');await navigateWorkspace(page,'Analytics')
 await expect(page.getByRole('heading',{level:1})).toHaveText('Quality analytics')
 const mobile=viewport.width<=650,select=page.getByRole('combobox',{name:'View',exact:true})
 if(mobile){await expect(select).toBeVisible();await expect(page.getByRole('group',{name:'Analytics views'})).toHaveCount(0);await keyboardTo(page,select);await page.keyboard.type('Questions');await page.keyboard.press('Enter');await expect(select).toHaveValue('questions')}
 else{await expect(select).toHaveCount(0);const questions=page.getByRole('group',{name:'Analytics views'}).getByRole('button',{name:'Questions',exact:true});await keyboardTo(page,questions);await page.keyboard.press('Enter');await expect(questions).toHaveAttribute('aria-pressed','true');await expect(page.locator('.analytics-tabs button[aria-pressed=true]')).toHaveCount(1)}
 expect(new URL(page.url()).searchParams.get('analyticsTab')).toBe('questions');await capture(page,'analytics-questions');await chooseView(page,'Coverage');await expect(page.locator('.coverage-funnel')).toBeVisible();expect(new URL(page.url()).searchParams.get('analyticsTab')).toBe('coverage');await capture(page,'analytics-coverage')
 await navigateWorkspace(page,'Calibration');await expect(page.getByRole('table')).toBeVisible();if(mobile){await keyboardTo(page,select);await page.keyboard.type('Confidence');await page.keyboard.press('Enter');await expect(select).toHaveValue('confidence');await expect(page.getByRole('group',{name:'Calibration breakdown'})).toHaveCount(0)}else{const confidence=page.getByRole('group',{name:'Calibration breakdown'}).getByRole('button',{name:'Confidence vs disagreement',exact:true});await keyboardTo(page,confidence);await page.keyboard.press('Enter');await expect(confidence).toHaveAttribute('aria-pressed','true')}
 await expect(page.getByRole('region',{name:'Calibration confidence table',exact:true})).toBeVisible();await capture(page,'calibration-confidence')
 for(const name of ['Settings','About / product tour']){await nav(page).getByRole('button',{name,exact:true}).scrollIntoViewIfNeeded();const box=await nav(page).getByRole('button',{name,exact:true}).boundingBox();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height)}
 await capture(page,'sidebar-reachability');expect(state.errors).toEqual([])
})
test('mobile Questions exact drill returns to same view and cohort; Coverage deep link',async({page})=>{
 await page.setViewportSize({width:390,height:844});const state=await qualityFixture(page,'analytics');await chooseView(page,'Questions');const row=page.locator('.operational-table tbody tr').filter({hasText:'Clear next step'}).filter({hasText:'Customer Service v17'});await row.getByRole('button',{name:'Inspect evaluations →'}).click();await expect(page.getByRole('button',{name:/^Open evaluation /})).toHaveCount(8);const q=Object.fromEntries(new URL(page.url()).searchParams);expect(q).toMatchObject({form:'general_service@17',question:'understanding',origin:'analytics','analytics.tab':'questions'});await page.getByRole('button',{name:'Back to Analytics',exact:true}).click();await expect(page.getByRole('combobox',{name:'View',exact:true})).toHaveValue('questions');await capture(page,'mobile-question-return');await page.goto(`${app}?page=analytics&analyticsTab=coverage`);await expect(page.getByRole('combobox',{name:'View',exact:true})).toHaveValue('coverage');await expect(page.locator('.coverage-funnel')).toBeVisible();expect(state.errors).toEqual([]);expect(state.writes).toEqual([]);expect(state.blocked).toEqual([])
})
test('browser sample Analytics has seven discoverable views and selected URL',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(app).origin?r.continue():r.abort());await page.goto(`${app}?page=analytics&analyticsTab=coverage`);const select=page.getByRole('combobox',{name:'View',exact:true});await expect(select).toHaveValue('coverage');await expect(select.locator('option')).toHaveCount(7);await chooseView(page,'Questions');expect(new URL(page.url()).searchParams.get('analyticsTab')).toBe('questions');await capture(page,'sample-analytics-mobile')
})
test('browser history restores page, active reference group and Analytics view',async({page})=>{
 const state=await fixture(page,'VIEWER',[],[draft()],[],'forms');try{
 await page.evaluate(()=>history.pushState(null,'','?page=analytics&analyticsTab=coverage'));await page.evaluate(()=>dispatchEvent(new PopStateEvent('popstate')));await expect(page.getByRole('heading',{level:1})).toHaveText('Quality analytics');await expect(page.locator('.analytics-tabs button[aria-pressed=true]')).toHaveText('Coverage');await page.goBack();await expect(page.getByRole('heading',{level:1})).toHaveText('Evaluation Forms');await expect(nav(page).locator('[aria-current="page"]')).toContainText('Evaluation Forms');await page.goForward();await expect(page.locator('.analytics-tabs button[aria-pressed=true]')).toHaveText('Coverage');expect(state.errors).toEqual([])
 }finally{await state.close()}
})
test('review contextual evidence and default My Reviews remain coherent on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});const state=await continuityFixture(page,'page=evaluations');await expect(page.getByRole('button',{name:'My reviews',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Continue review',exact:true}).first().click();await page.getByRole('button',{name:'Open conversation evidence',exact:true}).click();await expect(page.getByRole('navigation',{name:'Breadcrumb'})).toContainText('Conversation review');await expect(nav(page).locator('[aria-current="page"]')).toHaveCount(0);await capture(page,'contextual-conversation-review');await page.getByRole('button',{name:'← Back to review',exact:true}).click();await expect(nav(page).locator('[aria-current="page"]')).toContainText('Evaluations');expect(state.errors).toEqual([]);expect(state.forbidden).toEqual([])
})

test('unresolved access stays neutral and read-only; role arrival preserves route',async({page})=>{
 let release!:()=>void;const sessionGate=new Promise<void>(resolve=>{release=resolve})
 const loading=fixture(page,'AUTHOR',[],[draft()],[],'forms',{sessionGate})
 await expect(page.getByLabel('Current role')).toHaveText('Verifying role…')
 await expect(nav(page).locator('details[open]').filter({hasText:'Evaluation Forms'})).toBeVisible()
 await page.getByRole('button',{name:'Open form Fixture choice form v1'}).click()
 await expect(page.getByRole('button',{name:'Save changes',exact:true})).toHaveCount(0)
 const before=page.url();release();const state=await loading
 try{expect(page.url()).toBe(before);await expect(nav(page).locator('[aria-current="page"]')).toContainText('Evaluation Forms');await expect(nav(page).locator('details[open]').filter({hasText:'Evaluation Forms'})).toBeVisible();expect(state.errors).toEqual([])}finally{await state.close()}
})
