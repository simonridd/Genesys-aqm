import {test,expect,type Page,type Locator} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'
import {usabilityFixture} from './usability-fixture'
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4176/Genesys-aqm/'
const baseline=process.env.AQM_CONTINUITY_BASELINE==='1'
const out=process.env.AQM_CONTINUITY_EVIDENCE??`docs/v021a-evidence/${baseline?'before':'after'}`
mkdirSync(out,{recursive:true})
async function isolate(page:Page){
 const denied:string[]=[],errors:string[]=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(app).origin&&!u.pathname.includes('/api/')&&r.request().method()==='GET')return r.continue();denied.push(`${r.request().method()} ${u.origin}${u.pathname}`);return r.abort()})
 return {denied,errors}
}
async function capture(page:Page,name:string){
 await page.screenshot({path:`${out}/${name}.png`})
 writeFileSync(`${out}/${name}.json`,JSON.stringify({url:page.url(),viewport:page.viewportSize(),text:await page.locator('body').innerText(),aria:await page.locator('main').ariaSnapshot(),columns:await page.locator('thead th').allTextContents(),firstRows:await page.locator('tbody tr').allTextContents(),footer:await page.locator('.version').textContent(),documentWidth:await page.evaluate(()=>document.documentElement.scrollWidth)},null,2))
}
async function keyboard(page:Page,target:Locator){for(let i=0;i<100;i++){if(await target.evaluate(e=>e===document.activeElement))return;await page.keyboard.press('Tab')}throw Error('Keyboard target unreachable')}
const sizes=baseline?[{width:1440,height:900},{width:390,height:844}]:[{width:1440,height:900},{width:1920,height:1080},{width:390,height:844},{width:1440,height:720}]
for(const size of sizes)for(const entry of ['welcome','demo'])test(`${entry} handoff ${size.width}x${size.height}`,async({page})=>{
 await page.setViewportSize(size);const proof=await isolate(page)
 await page.goto(app+`?page=${entry}`+(entry==='demo'?'&tour=quality&step=5':''))
 if(entry==='demo')await page.getByText('More options',{exact:true}).click()
 await page.getByRole('button',{name:/^Explore the prototype/}).click()
 await expect(page.getByRole('heading',{name:'Conversations',exact:true})).toBeVisible()
 await capture(page,`${entry}-library-${size.width}x${size.height}`)
 if(!baseline){await page.locator('.showcase-handoff').scrollIntoViewIfNeeded();await capture(page,`${entry}-handoff-visible-${size.width}x${size.height}`);writeFileSync(`${out}/${entry}-geometry-${size.width}x${size.height}.json`,JSON.stringify(await page.locator('.showcase-handoff').boundingBox(),null,2))}
 if(baseline){await expect(page).not.toHaveURL(/entry=showcase/);await expect(page.locator('main')).not.toContainText('Jamie');await expect(page.locator('thead')).toContainText('Conversation ID');await expect(page.locator('.version')).toContainText('V0.19D SHOWCASE')}
 else{
  await expect(page).toHaveURL(/entry=showcase/)
  const bridge=page.getByRole('region',{name:'Continue in the prototype'})
  await expect(bridge).toContainText("Jamie's fictional conversation");await expect(bridge).toContainText('separate fictional examples');await expect(bridge).toContainText('no concrete next step');await expect(bridge).toContainText('No Genesys connection required');await expect(bridge).toContainText('No live AI request')
  const cta=bridge.getByRole('button',{name:'Open Incomplete resolution →',exact:true});await expect(cta).toBeVisible()
  const box=await cta.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(size.width)
  await expect(page.locator('thead th').first()).toContainText('Scenario');await expect(page.locator('thead')).not.toContainText('Conversation ID');await expect(page.locator('thead')).not.toContainText('Source');expect(await page.locator('tbody').innerText()).not.toMatch(/syn-/)
  await expect(page.locator('.version')).toContainText('INTERNAL PILOT');await expect(page.locator('.version')).not.toContainText('V0.19D')
  await page.goBack();await expect(page).toHaveURL(new RegExp(`page=${entry}`));if(entry==='demo')await expect(page.getByText('Chapter 5 of 5',{exact:true})).toBeVisible();await page.goForward();await expect(bridge).toBeVisible()
  await cta.click();await expect(page.getByRole('heading',{name:'Conversation detail',exact:true})).toBeVisible();await expect(page).not.toHaveURL(/entry=showcase/)
  const transcript=page.getByRole('region',{name:'Conversation transcript'});await expect(transcript).toContainText('Theo Martin');await expect(transcript).toContainText('Jordan Lee');await expect(transcript).toContainText('Technical Support');await expect(transcript).toContainText('Technical');await expect(transcript).toContainText('messaging');await expect(transcript.locator('details')).not.toHaveAttribute('open','')
  expect(await transcript.innerText()).not.toContain('syn-incomplete-resolution');await expect(page.getByText('Connect Genesys Cloud to evaluate this conversation.',{exact:true})).toBeVisible()
  await capture(page,`${entry}-recommended-${size.width}x${size.height}`)
  await transcript.locator('summary').click();await expect(transcript.locator('details')).toContainText('syn-incomplete-resolution');await transcript.locator('summary').click()
  await page.getByRole('button',{name:'← Back to conversations',exact:true}).click();await expect(bridge).toHaveCount(0);await expect(page).not.toHaveURL(/entry=showcase/)
  await page.goBack();await expect(page).toHaveURL(new RegExp(`page=${entry}`));await page.goForward();await expect(bridge).toHaveCount(0)
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(proof.denied).toEqual([]);expect(proof.errors).toEqual([])
})
if(!baseline){
 for(const width of [1440,390])test(`direct library, alternate sample, cards and preference ${width}`,async({page})=>{
  await page.setViewportSize({width,height:width===390?844:900});const proof=await isolate(page)
  await page.goto(app+'?page=conversations');await expect(page.getByRole('heading',{name:'Conversations',exact:true})).toBeVisible();await expect(page.locator('.showcase-handoff')).toHaveCount(0)
  await page.getByRole('button',{name:'Cards',exact:true}).click();await expect(page.locator('.library-card')).toHaveCount(19)
  const card=page.locator('.library-card').filter({has:page.getByRole('heading',{name:'Incomplete resolution',exact:true})});await expect(card).toContainText('Good investigation, but no concrete next step.');await expect(card).toContainText('Technical Support · messaging');await expect(card).toContainText('Mixed');await expect(card).toContainText('Jordan Lee');await capture(page,`cards-${width}`)
  await page.goto(app+'?page=welcome');await page.getByRole('button',{name:'Explore the prototype',exact:true}).click();await expect(page.locator('.library-card')).toHaveCount(19);await expect(page.locator('.showcase-handoff')).toBeVisible()
  const alternate=page.locator('.library-card').filter({has:page.getByRole('heading',{name:'Duplicate payment',exact:true})});await alternate.click();await expect(page.getByRole('heading',{name:'Conversation detail',exact:true})).toBeVisible();await expect(page).not.toHaveURL(/entry=showcase/);await capture(page,`alternate-${width}`)
  await page.getByRole('button',{name:'← Back to conversations',exact:true}).click();await expect(page.locator('.showcase-handoff')).toHaveCount(0)
  await page.getByRole('button',{name:'Table',exact:true}).click();await page.goto(app+'?page=demo&step=5');await page.getByText('More options',{exact:true}).click();await page.getByRole('button',{name:'Explore the prototype →',exact:true}).click();await expect(page.getByRole('table')).toBeVisible()
  await page.getByLabel('Search table',{exact:true}).fill('next step');await expect(page.locator('tbody')).toContainText('Incomplete resolution');expect(await page.locator('tbody').innerText()).not.toMatch(/syn-|conv-/)
  await page.getByLabel('Search table',{exact:true}).fill('Theo Martin');await expect(page.locator('tbody tr')).toHaveCount(1);await expect(page.getByRole('button',{name:'Open Incomplete resolution for Theo Martin',exact:true})).toBeVisible();await capture(page,`table-goal-${width}`)
  await page.getByRole('combobox',{name:/^Queue/}).selectOption('Technical Support');await page.getByRole('combobox',{name:/^Channel/}).selectOption('messaging');await expect(page.locator('tbody tr')).toHaveCount(1)
  const original=new URL(page.url()).searchParams.toString();await page.setViewportSize({width:1440,height:900});await page.setViewportSize({width:390,height:844});await page.setViewportSize({width:1440,height:900});expect(new URL(page.url()).searchParams.toString()).toBe(original);await expect(page.locator('tbody tr')).toHaveCount(1);await expect(page.getByRole('table')).toBeVisible()
  await page.getByRole('button',{name:'Open Incomplete resolution for Theo Martin',exact:true}).click();await expect(page).not.toHaveURL(/entry=showcase/);await page.getByRole('button',{name:'← Back to conversations',exact:true}).click();await expect(page.locator('.showcase-handoff')).toHaveCount(0)
  await page.getByRole('button',{name:'About / product tour',exact:true}).click();await expect(page).toHaveURL(/page=welcome/);await page.goBack();await expect(page.getByRole('heading',{name:'Conversations',exact:true})).toBeVisible();await expect(page.locator('.showcase-handoff')).toHaveCount(0)
  expect(proof.denied).toEqual([]);expect(proof.errors).toEqual([])
 })
 for(const entry of ['welcome','demo'])test(`keyboard ${entry} to sample and back`,async({page})=>{
  const proof=await isolate(page);await page.goto(app+`?page=${entry}`+(entry==='demo'?'&step=5':''))
  if(entry==='demo'){await keyboard(page,page.getByText('More options',{exact:true}));await page.keyboard.press('Enter')}
  await keyboard(page,page.getByRole('button',{name:/^Explore the prototype/}));await page.keyboard.press('Enter')
  const cta=page.getByRole('button',{name:'Open Incomplete resolution →',exact:true});await keyboard(page,cta);await expect(cta).toBeFocused();expect(await cta.evaluate(e=>getComputedStyle(e).outlineStyle)).not.toBe('none');await page.keyboard.press('Enter')
  await expect(page.getByRole('heading',{name:'Conversation detail',exact:true})).toBeVisible();const back=page.getByRole('button',{name:'← Back to conversations',exact:true});await keyboard(page,back);await expect(back).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('.showcase-handoff')).toHaveCount(0);await page.goBack();await expect(page).toHaveURL(new RegExp(`page=${entry}`));expect(proof.denied).toEqual([]);expect(proof.errors).toEqual([])
 })
 for(const width of [1440,390])for(const entry of ['welcome','demo'])test(`authenticated-shaped ${entry} Open AQM ${width}`,async({page})=>{
  await page.setViewportSize({width,height:width===390?844:900});const f=await usabilityFixture(page)
  await page.getByRole('button',{name:'About / product tour',exact:true}).click()
  if(entry==='demo'){await page.getByRole('button',{name:'Take the guided demo →',exact:true}).click();await page.getByText('More options',{exact:true}).click()}
  await page.getByRole('button',{name:entry==='demo'?'Open AQM →':'Open AQM',exact:true}).first().click()
  await expect(page).toHaveURL(/page=automation/);await expect(page).not.toHaveURL(/entry=showcase/);await expect(page.locator('.showcase-handoff')).toHaveCount(0);await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();await expect(page.locator('.version')).toContainText('INTERNAL PILOT');expect(f.errors).toEqual([]);await capture(page,`authenticated-${entry}-${width}`)
 })
 test('context consumed when leaving for another workspace page',async({page})=>{
  await isolate(page);await page.goto(app+'?page=welcome');await page.getByRole('button',{name:'Explore the prototype',exact:true}).click();await page.getByRole('button',{name:/^Settings$/}).click();await expect(page).not.toHaveURL(/entry=showcase/);await page.getByRole('button',{name:/^Conversations$/}).click();await expect(page.locator('.showcase-handoff')).toHaveCount(0)
 })
}
