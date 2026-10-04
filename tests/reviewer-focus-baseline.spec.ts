import { test,expect } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { fixture } from './reviewer-recheck-fixture'
test('canonical reviewer geometry (read-only characterization)',async({page})=>{
  test.skip(process.env.AQM_BASELINE!=='1','Canonical-only measurement')
  await page.setViewportSize({width:390,height:844})
  const f=await fixture(page,'REVIEWER','attention','evaluations')
  try {
    await expect(page.locator('.operational-table tbody tr')).toHaveCount(5)
    const row=page.locator('tr').filter({has:page.getByRole('button',{name:'Open evaluation escalated',exact:true})})
    const cta=row.getByRole('button',{name:'Start review',exact:true})
    const ctaBounds=await cta.boundingBox(),mainBounds=await page.locator('main').boundingBox()
    await page.screenshot({path:'docs/v019e-evidence/before-mobile-queue.png',fullPage:true})
    await page.getByRole('button',{name:'Open evaluation escalated',exact:true}).click()
    await page.getByRole('region',{name:'Human review',exact:true}).getByRole('button',{name:'Start review',exact:true}).click()
    const answer=page.getByLabel('Human answer: Warm opening',{exact:true})
    await expect(answer).toBeVisible()
    const distance=await page.evaluate(()=>{
      const top=(e:Element)=>e.getBoundingClientRect().top+scrollY
      return {queuePageTop:top(document.querySelector('.evaluation-detail')!.parentElement!),detailTop:top(document.querySelector('.evaluation-detail')!),firstAnswerTop:top(document.querySelector('[aria-label="Human answer: Warm opening"]')!),documentWidth:document.documentElement.scrollWidth,viewport:innerWidth}
    })
    await page.screenshot({path:'docs/v019e-evidence/before-mobile-active.png',fullPage:true})
    writeFileSync('docs/v019e-evidence/baseline-geometry.json',JSON.stringify({source:'c20604c3b33b81a0038388851d07d6f500792bdb',ctaBounds,mainBounds,...distance},null,2)+'\n')
    expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
  } finally {await f.close()}
})
