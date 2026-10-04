import {test,expect} from '@playwright/test'
import {fixture} from './reviewer-recheck-fixture'
test('Overview My review queue still opens mobile priority cards and focused review',async({page})=>{
 await page.setViewportSize({width:390,height:844});const f=await fixture(page,'REVIEWER','attention','automation')
 try{
  await page.getByRole('region',{name:'Review work summary'}).getByRole('button',{name:'My review queue →'}).click()
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({reviewQueue:'mine',assignment:'mine'})
  await expect(page.getByRole('list',{name:'My review tasks'})).toBeVisible()
  const start=page.getByRole('button',{name:'Start review',exact:true}).filter({visible:true}).first();await expect(start).toBeVisible();await start.click()
  await expect(page.getByRole('region',{name:'Review workspace',exact:true})).toBeVisible();await expect(page.locator('.evaluation-queue')).toBeHidden()
  await expect(page.getByRole('button',{name:'Open conversation evidence',exact:true})).toBeVisible()
  expect(f.requests.filter(r=>r.method!=='GET')).toEqual([]);expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
 }finally{await f.close()}
})
