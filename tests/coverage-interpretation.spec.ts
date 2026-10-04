import { test,expect,type Page,type Locator } from '@playwright/test'
import { mkdirSync,writeFileSync } from 'node:fs'
import { coverageFixture,coverageScenarios } from './coverageInterpretationFixture'
import { coverageSteps } from '../src/analyticsPresentation'
import { navigateWorkspace } from './workspace-navigation'
const baseline=process.env.AQM_COVERAGE_BASELINE==='1',out=process.env.AQM_COVERAGE_EVIDENCE??'docs/v020g-evidence/after'
mkdirSync(out,{recursive:true})
const sizes=[{width:1440,height:900},{width:1920,height:1080},{width:390,height:844},{width:1440,height:720}]
async function capture(page:Page,name:string,funnel:Locator){
 await funnel.scrollIntoViewIfNeeded()
 await page.screenshot({path:`${out}/${name}.png`,fullPage:true})
 writeFileSync(`${out}/${name}.txt`,await funnel.innerText())
 writeFileSync(`${out}/${name}.aria.yml`,await funnel.ariaSnapshot())
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
}
async function interpretation(f:Locator,scenario:string){
 await expect(f.getByRole('heading',{name:'Policy selection',exact:true})).toBeVisible()
 await expect(f.getByRole('heading',{name:'Coverage after sampling',exact:true})).toBeVisible()
 await expect(f).not.toContainText('Where coverage was lost')
 await expect(f).not.toContainText('server');await expect(f).not.toContainText('durable')
 await expect(f).toContainText('Failed evaluation attempts are attempts, not interaction counts. One interaction can have more than one form evaluation attempt.')
 await expect(f).toContainText('Coverage totals count observations across monitoring runs. The same conversation may appear in more than one run.')
 const headings=await f.getByRole('heading').allTextContents();expect(headings).toEqual(['Policy selection','Coverage after sampling'])
 const c=coverageScenarios[scenario]
 await expect(f.locator('li b')).toHaveText([c.eligible,c.sampled,c.evaluable,c.evaluated].map(String))
 await expect(f).toContainText(`Failed evaluation attempts: ${c.failed}`)
 if(scenario==='zeroEligible'){
  await expect(f).toContainText('No eligible interactions in this scope.');await expect(f).toContainText('Evaluation coverage: —')
  await expect(f).not.toContainText('%');await expect(f).not.toContainText('All eligible');await expect(f).not.toContainText('Sampling can deliberately')
 }else{
  await expect(f).toContainText(c.eligible===c.sampled?'All eligible interactions were selected.':`${c.eligible-c.sampled} eligible interactions were not selected by the sampling policy.`)
  if(c.eligible!==c.sampled)await expect(f).toContainText('Sampling can deliberately select only part of the eligible population.')
  await expect(f).toContainText(c.sampled===c.evaluable?'All sampled interactions had usable content.':`${c.sampled-c.evaluable} sampled interactions had no usable conversation content.`)
  await expect(f).toContainText(c.evaluable===c.evaluated?'All interactions with usable content reached a completed evaluation.':`${c.evaluable-c.evaluated} interactions had content available but did not reach a completed evaluation.`)
 }
}
if(baseline){
 for(const viewport of [sizes[0],sizes[2]])test(`F9 canonical mixed hierarchy ${viewport.width}`,async({page})=>{
  await page.setViewportSize(viewport);const f=await coverageFixture(page)
  await page.getByRole('region',{name:'Coverage summary'}).getByRole('button',{name:'Explore coverage →'}).click()
  const funnel=page.locator('.coverage-funnel');await expect(funnel.getByRole('heading',{name:'Where coverage was lost'})).toBeVisible()
  await expect(funnel).toContainText('500 eligible interactions were not selected by the sampling policy.')
  await capture(page,`mixed-${viewport.width}x${viewport.height}`,funnel)
  writeFileSync(`${out}/numbers-${viewport.width}.json`,JSON.stringify({counts:f.counts,totals:f.totals,steps:coverageSteps(f.counts),apiRequests:f.requests.map(u=>u.pathname)},null,2))
  expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])
 })
}else{
 for(const viewport of sizes){
  for(const scenario of Object.keys(coverageScenarios))test(`Analytics ${scenario} ${viewport.width}x${viewport.height}`,async({page})=>{
   await page.setViewportSize(viewport);const f=await coverageFixture(page,scenario)
   await page.getByRole('region',{name:'Coverage summary'}).getByRole('button',{name:'Explore coverage →'}).click()
   const funnel=page.locator('.coverage-funnel');await interpretation(funnel,scenario);await capture(page,`${scenario}-${viewport.width}x${viewport.height}`,funnel)
   writeFileSync(`${out}/${scenario}-numbers-${viewport.width}x${viewport.height}.json`,JSON.stringify({counts:f.counts,totals:f.totals,steps:coverageSteps(f.counts),apiRequests:f.requests.map(u=>u.pathname),errors:f.errors,writes:f.writes,blocked:f.blocked},null,2))
   expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])
  })
  test(`shared Overview and run details ${viewport.width}x${viewport.height}`,async({page})=>{
   await page.setViewportSize(viewport);const f=await coverageFixture(page),details=page.locator('.overview-coverage-detail')
   await expect(details).not.toHaveAttribute('open')
   expect(await page.locator('.overview-summary-card').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')))).toEqual(['Quality summary','Coverage summary','Review work summary','Automation health summary'])
   const requests=f.requests.length;await details.locator('summary').click();await interpretation(details.locator('.coverage-funnel'),'mixed');expect(f.requests.length).toBe(requests)
   const expected=await details.locator('.coverage-funnel').innerText();await capture(page,`overview-${viewport.width}x${viewport.height}`,details.locator('.coverage-funnel'))
   await details.getByRole('button',{name:'Explore coverage →'}).click();await expect(page.locator('.coverage-funnel')).toHaveText(expected,{useInnerText:true})
   expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({analyticsTab:'coverage',source:'genesys-cloud',from:'2026-09-25',to:'2026-10-02'})
   await navigateWorkspace(page,'Overview');await page.getByRole('region',{name:'Recent runs'}).getByRole('button').first().click()
   const run=page.locator('#overview-run-detail .coverage-funnel');await interpretation(run,'mixed');await expect(run).toHaveText(expected,{useInnerText:true});await capture(page,`run-${viewport.width}x${viewport.height}`,run)
   writeFileSync(`${out}/shared-${viewport.width}x${viewport.height}.json`,JSON.stringify({openingDetailsAddsRequests:false,detailRequestsBefore:requests,detailsAddedRequests:0,overviewAnalyticsRunTextIdentical:true,errors:f.errors,writes:f.writes,blocked:f.blocked},null,2))
   expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])
  })
 }
 test('goal-only quality leader explains eligible work without a loss conclusion',async({page})=>{
  const goal="Why weren't all eligible conversations evaluated?"
  const f=await coverageFixture(page)
  const details=page.locator('.overview-coverage-detail');await details.locator('summary').click()
  const funnel=details.locator('.coverage-funnel'),selection=await funnel.locator('.coverage-selection').innerText(),downstream=await funnel.locator('.coverage-after-selection').innerText(),attempts=await funnel.locator('.coverage-attempts').innerText()
  expect(selection).toContain('500 eligible interactions were not selected by the sampling policy.')
  expect(selection).toContain('Sampling can deliberately select only part of the eligible population.')
  expect(downstream).toContain('100 sampled interactions had no usable conversation content.')
  expect(downstream).toContain('50 interactions had content available but did not reach a completed evaluation.')
  expect(attempts).toContain('Failed evaluation attempts: 75');expect(attempts).toContain('attempts, not interaction counts')
  expect(selection+downstream+attempts).not.toMatch(/650|lost|sampling policy failed/i)
  writeFileSync(`${out}/goal-task.json`,JSON.stringify({goal,route:['Overview','Coverage details'],visibleEvidence:{selection,downstream,attempts},answer:['500 were not selected by the sampling policy','100 selected interactions lacked usable content','50 interactions with content did not reach a completed evaluation','75 failed evaluation attempts are separate attempt-level evidence'],wrongTurns:0,method:'Scripted agent replay from visible content; no recruited human participant or timed usability claim'},null,2))
  expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])
 })
 test('no run evidence preserves empty-state explanation',async({page})=>{
  const f=await coverageFixture(page,'noRuns'),details=page.locator('.overview-coverage-detail')
  await details.locator('summary').click();await expect(details).toContainText('Coverage will appear after a monitoring policy run.');await expect(details.getByRole('heading',{name:'Policy selection'})).toHaveCount(0)
  await details.getByRole('button',{name:'Explore coverage →'}).click();await expect(page.getByRole('region',{name:'Coverage scope'})).toContainText('Coverage will appear after a monitoring policy run.');await expect(page.locator('.coverage-funnel')).toHaveCount(0)
  expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])
 })
 for(const viewport of [sizes[0],sizes[2]])test(`Tab-only Overview disclosure to Analytics ${viewport.width}`,async({page})=>{
  await page.setViewportSize(viewport);const f=await coverageFixture(page),trace:string[]=[]
  async function reach(target:Locator,label:string){for(let i=0;i<160;i++){if(await target.evaluate(node=>node===document.activeElement)){trace.push(label);return}await page.keyboard.press('Tab')}throw Error(`Tab cannot reach ${label}`)}
  const details=page.locator('.overview-coverage-detail');await reach(details.locator('summary'),'Coverage details');const n=f.requests.length;await page.keyboard.press('Enter');await interpretation(details.locator('.coverage-funnel'),'mixed');expect(f.requests.length).toBe(n)
  await reach(details.getByRole('button',{name:'Explore coverage →'}),'Explore coverage');await page.keyboard.press('Enter');await expect(page.getByRole('region',{name:'Coverage scope'})).toBeVisible();await interpretation(page.locator('.coverage-funnel'),'mixed');trace.push('Analytics Coverage')
  await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement!==document.body)).toBe(true)
  writeFileSync(`${out}/keyboard-${viewport.width}.json`,JSON.stringify({trace,method:'Tab and Enter; no pointer or programmatic focus',detailRequests:0,errors:f.errors,writes:f.writes,blocked:f.blocked},null,2))
  expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])
 })
}
