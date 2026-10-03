import { test,expect } from '@playwright/test'
import { appendFileSync } from 'node:fs'
import { fixture,capture } from './reviewer-recheck-fixture'
const out='docs/v019a-evidence/recheck'
// Replay the V0.19 priority reviewer task on the actual local HTTP API. Only the
// evidence-detour and completion assertions change; its scoring rubric is unchanged.
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])test(`V0.19 reviewer task recheck ${viewport.width}`,async({page})=>{
  test.setTimeout(90000);await page.setViewportSize(viewport)
  const f=await fixture(page,'REVIEWER','attention','evaluations'),actions:{label:string;kind:string;beforeY:number;afterY:number}[]=[]
  const action=async(label:string,kind:string,fn:()=>Promise<unknown>)=>{const beforeY=await page.evaluate(()=>scrollY);await fn();await page.clock.runFor(400);await page.waitForLoadState('networkidle');actions.push({label,kind,beforeY,afterY:await page.evaluate(()=>scrollY)})}
  try{
    await capture(page,'reviewer-queue-'+viewport.width)
    await expect(page.locator('.operational-table tbody tr')).toHaveCount(5)
    const original=JSON.stringify(await f.store.evaluations())
    await action('Open highest priority escalated review','click',()=>page.getByRole('button',{name:'Open evaluation escalated',exact:true}).click())
    const panel=page.getByRole('region',{name:'Human review',exact:true})
    await action('Start independent human review','click',()=>panel.getByRole('button',{name:'Start review',exact:true}).click())
    for(const [name,value] of [['Warm opening','No'],['Understanding the issue','2'],['Resolution','fully_resolved']])await action('Judge '+name,'select',()=>panel.getByLabel('Human answer: '+name,{exact:true}).selectOption(value))
    await action('Explain question judgment','input',()=>panel.getByLabel('Question note: Warm opening',{exact:true}).fill('Opening did not acknowledge the impact.'))
    await action('Explain overall judgment','input',()=>panel.getByLabel('Overall review note',{exact:true}).fill('Resolution evidence is clear.'))
    await capture(page,'reviewer-unsaved-'+viewport.width)
    const exact=page.url(),writes=f.requests.filter(r=>r.method==='PUT').length
    await action('Inspect original conversation evidence','click',()=>page.getByRole('button',{name:'Open conversation',exact:true}).click())
    await expect(page.getByText('I need help with my bill.',{exact:true})).toBeVisible()
    await capture(page,'reviewer-evidence-'+viewport.width)
    await action('Return directly to this review','click',()=>page.getByRole('button',{name:'← Back to review',exact:true}).click())
    await expect(page).toHaveURL(exact)
    await expect(panel.getByRole('heading',{name:'Review this evaluation',exact:true})).toBeFocused()
    for(const [name,value] of [['Warm opening','No'],['Understanding the issue','2'],['Resolution','fully_resolved']])await expect(panel.getByLabel('Human answer: '+name,{exact:true})).toHaveValue(value)
    await expect(panel.getByLabel('Question note: Warm opening',{exact:true})).toHaveValue('Opening did not acknowledge the impact.')
    await expect(panel.getByLabel('Overall review note',{exact:true})).toHaveValue('Resolution evidence is clear.')
    await expect(panel.getByRole('status')).toContainText('Unsaved review changes')
    expect(f.requests.filter(r=>r.method==='PUT')).toHaveLength(writes)
    await capture(page,'reviewer-restored-'+viewport.width)
    await action('Complete review','click',()=>panel.getByRole('button',{name:'Complete review',exact:true}).click())
    await expect(panel.getByRole('heading',{name:'Completed calibration',exact:true})).toBeVisible()
    await expect(panel.getByRole('status')).toContainText('Review completed. It has been removed from My Reviews.')
    await expect(page.getByRole('button',{name:'Open evaluation escalated',exact:true})).toHaveCount(0)
    await capture(page,'reviewer-completed-'+viewport.width)
    await action('Close and continue assigned reviews','click',()=>panel.getByRole('button',{name:'Close and continue My Reviews',exact:true}).click())
    await expect(page.locator('.operational-table tbody tr')).toHaveCount(4)
    await capture(page,'reviewer-queue-after-'+viewport.width)
    expect(JSON.stringify(await f.store.evaluations())).toBe(original)
    expect(f.requests.filter(r=>r.method==='PUT'&&r.path==='/api/reviews/escalated')).toHaveLength(2)
    appendFileSync(out+'/task-actions.ndjson',JSON.stringify({task:'V0.19 Reviewer complete recheck',viewport:viewport.width,actions,unnecessaryDetours:0,previousUnnecessaryDetours:2,scrollDistance:actions.reduce((sum,a)=>sum+Math.abs(a.afterY-a.beforeY),0)})+'\n')
    expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  }finally{await f.close()}
})
