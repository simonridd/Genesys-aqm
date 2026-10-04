import {test,expect,type Page} from '@playwright/test'
import {writeFileSync,mkdirSync} from 'node:fs'
import {firstScanFixture} from '../../tests/overviewFirstScanFixture'
import {fixture as reviewFixture} from '../../tests/reviewer-recheck-fixture'
import {navigateWorkspace} from '../../tests/workspace-navigation'
import {summarize,summarizeCoverage} from '../../src/domain/analytics'
const out='docs/v020e-evidence/public';mkdirSync(out,{recursive:true})
const region=(p:Page,name:string)=>p.getByRole('region',{name,exact:true})
async function refresh(p:Page){await p.getByRole('button',{name:'Refresh',exact:true}).click();await expect(p.getByRole('button',{name:'Refresh',exact:true})).toBeEnabled()}
function clean(f:{errors:string[],writes:string[],blocked:string[]}){expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])}
for(const size of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])test(`public first scan ${size.width}x${size.height}`,async({page})=>{
 await page.setViewportSize(size);const f=await firstScanFixture(page);await page.evaluate(()=>scrollTo(0,0))
 const geometry=await page.evaluate(()=>{
  const bounds=(n:Element)=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}}
  return {viewport:{width:innerWidth,height:innerHeight},overflow:document.documentElement.scrollWidth>innerWidth,panels:[...document.querySelectorAll('.overview-page section[aria-label],.overview-page section[aria-labelledby],.overview-first-scan article')].map(n=>({name:n.getAttribute('aria-label')??document.getElementById(n.getAttribute('aria-labelledby')??'')?.textContent,...bounds(n)})),headings:[...document.querySelectorAll('.overview-summary-card h3')].map(n=>({text:n.textContent,...bounds(n)})),signals:[...document.querySelectorAll('.overview-summary-card')].map(n=>{const s=n.querySelector('.overview-metric strong,.overview-metric button')!;return {name:n.getAttribute('aria-label'),text:s.textContent,...bounds(s)}})}
 })
 expect(geometry.panels.slice(0,7).map(n=>n.name)).toEqual(['Attention required','At a glance','Quality summary','Coverage summary','Review work summary','Automation health summary','Quality detail'])
 const glance=geometry.panels.find(n=>n.name==='At a glance')!,trend=geometry.panels.find(n=>n.name==='Quality detail')!
 expect(glance.bottom).toBeLessThan(trend.y);expect(geometry.overflow).toBe(false)
 expect(geometry.headings.map(n=>n.text)).toEqual(['Quality','Coverage','Review work','Automation health'])
 expect(geometry.signals.map(n=>n.text)).toEqual(['79% →','20%','7 →','Attention'])
 if(size.width===1440){for(const n of [...geometry.headings,...geometry.signals]){expect(n.y).toBeGreaterThanOrEqual(0);expect(n.bottom).toBeLessThanOrEqual(900)}}
 if(size.width===1920){expect(glance.y).toBeGreaterThanOrEqual(0);expect(glance.bottom).toBeLessThanOrEqual(1080)}
 await expect(page.locator('.overview-coverage-detail')).not.toHaveAttribute('open')
 writeFileSync(`${out}/${size.width}x${size.height}.json`,JSON.stringify(geometry,null,2));await page.screenshot({path:`${out}/${size.width}x${size.height}-initial.png`});await page.screenshot({path:`${out}/${size.width}x${size.height}-full.png`,fullPage:true});clean(f)
})
test('public Review work exact drills',async({page})=>{
 const f=await firstScanFixture(page),trace:unknown[]=[]
 for(const [name,q] of [['Open: 7',{reviewQueue:'active'}],['Due soon: 1',{dueState:'DUE_SOON'}],['Overdue: 1',{due:'overdue',dueState:'OVERDUE'}],['Escalated: 1',{dueState:'ESCALATED'}],['Unassigned: 1',{reviewStatus:'REVIEW_REQUESTED',assignment:'unassigned'}],['My review queue →',{reviewQueue:'mine',assignment:'mine'}]] as const){await region(page,'Review work summary').getByRole('button',{name,exact:true}).click();await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject(q);trace.push({name,url:page.url()});await navigateWorkspace(page,'Overview')}
 writeFileSync(`${out}/review-drills.json`,JSON.stringify(trace,null,2));clean(f)
})
test('public Quality exact drill',async({page})=>{
 const f=await firstScanFixture(page);await region(page,'Quality summary').getByRole('button',{name:'Explore quality →'}).click();await expect(page.getByRole('heading',{name:'Quality analytics',exact:true})).toBeVisible();await navigateWorkspace(page,'Overview')
 await region(page,'Quality summary').getByRole('button',{name:'Evaluations: 8',exact:true}).click();await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({source:'genesys-cloud',from:'2026-09-25',to:'2026-10-02'});clean(f)
})
test('public critical exact drills',async({page})=>{
 const f=await firstScanFixture(page)
 for(const [r,name] of [['Attention required','Inspect critical evaluations →'],['Quality summary','Critical failure occurrences: 2']]){await region(page,r).getByRole('button',{name,exact:true}).click();await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({critical:'yes',source:'genesys-cloud',from:'2026-09-25',to:'2026-10-02'});await navigateWorkspace(page,'Overview')};clean(f)
})
test('public Coverage details preserve evidence and request count',async({page})=>{
 const f=await firstScanFixture(page),before=f.requests.length,d=page.locator('.overview-coverage-detail');await expect(d).not.toHaveAttribute('open');await d.locator('summary').click();await expect(d).toHaveAttribute('open','')
 for(const t of ['40 interactions considered (Candidates)','Eligible','Sampled','Content available','Evaluated','Evaluation coverage: 20%','Failed evaluation attempts:','same conversation may appear in more than one run','Quality describes the conversations that were evaluated.'])await expect(d).toContainText(t)
 expect(f.requests.length).toBe(before);await d.getByRole('button',{name:'Explore coverage →'}).click();await expect(page.getByRole('heading',{name:'Quality analytics',exact:true})).toBeVisible();clean(f)
})
test('public partial analytics unavailable preserves Review work and Health',async({page})=>{
 const f=await firstScanFixture(page);f.setSnapshot(s=>{s.analytics={complete:false,status:'unavailable',reason:'Fictional unavailable analytics'};return s});await refresh(page)
 for(const r of ['Quality summary','Coverage summary'])await expect(region(page,r)).toContainText('Unavailable');await expect(region(page,'Review work summary')).toContainText('Open7');await expect(region(page,'Automation health summary')).toContainText('Healthy');clean(f)
})
test('public reviews unavailable preserves Quality and Coverage without false counts',async({page})=>{
 const f=await firstScanFixture(page);f.setSnapshot(s=>{s.reviews={complete:false,status:'unavailable',reason:'Fictional unavailable reviews'};return s});await refresh(page)
 await expect(region(page,'Review work summary')).toContainText('Unavailable');await expect(region(page,'Review work summary').locator('.overview-metric')).toHaveCount(0);await expect(region(page,'Quality summary')).toContainText('79%');await expect(region(page,'Coverage summary')).toContainText('Eligible20');await expect(region(page,'Automation health summary')).toContainText('Review SLAUnavailable');clean(f)
})
test('public successful zero state and healthy state',async({page})=>{
 const f=await firstScanFixture(page);f.setSnapshot(s=>{if(s.analytics.complete){s.analytics.data.quality=summarize([]);s.analytics.data.qualityTrend=[];s.analytics.data.coverage=summarizeCoverage([])};s.reviews={complete:true,data:{open:0,dueSoon:0,overdue:0,escalated:0,unassigned:0}};s.alerts={complete:true,data:{openAlerts:0,errors:0,warnings:0,items:[]}};s.notifications={complete:true,data:{pending:0,failed24h:0,lastSuccessfulAt:s.generatedAt}};if(s.health.complete){s.health.data.genesysAutomation.status='verified';s.health.data.jev.status='verified';s.health.data.scheduler.status='healthy'};if(s.recentRuns.complete&&s.recentRuns.data.lastRun)s.recentRuns.data.lastRun.status='completed';return s});await refresh(page)
 await expect(region(page,'Quality summary')).toContainText('Evaluations0');await expect(region(page,'Coverage summary')).toContainText('Eligible0');for(const r of ['Quality summary','Coverage summary','Review work summary'])await expect(region(page,r)).not.toContainText('Unavailable');await expect(region(page,'Quality detail')).toContainText('No quality history in this period.');await expect(region(page,'Review work summary')).toContainText('Open0');await expect(region(page,'Attention required')).toContainText('All clear');await expect(region(page,'Automation health summary')).toContainText('AutomationHealthy');clean(f)
})
test('public current mobile priority cards and focused review',async({page})=>{
 await page.setViewportSize({width:390,height:844});const f=await reviewFixture(page,'REVIEWER','attention','automation')
 try{await region(page,'Review work summary').getByRole('button',{name:'My review queue →'}).click();expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({reviewQueue:'mine',assignment:'mine'});await expect(page.getByRole('list',{name:'My review tasks'})).toBeVisible();await page.getByRole('button',{name:'Start review',exact:true}).filter({visible:true}).first().click();await expect(region(page,'Review workspace')).toBeVisible();await expect(page.locator('.evaluation-queue')).toBeHidden();await expect(page.getByRole('button',{name:'Open conversation evidence',exact:true})).toBeVisible();expect(f.requests.filter(r=>r.method!=='GET')).toEqual([]);expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])}finally{await f.close()}
})
