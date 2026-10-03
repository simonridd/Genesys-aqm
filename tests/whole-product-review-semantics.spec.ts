import {test,expect} from '@playwright/test'
import {fixture} from './whole-product-review-fixture'
import {writeFileSync} from 'node:fs'
test('visible heading and navigation semantics across all major pages',async({page})=>{
 test.setTimeout(60000);const f=await fixture(page);const rows=[];try{
 for(const name of ['Overview','Evaluations','Analytics','Calibration','Evaluation Forms','Question Groups','Answer Sets','Policies','Settings','Conversations','Conversation review']){
 await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name,exact:true}).click();await page.clock.runFor(600);await page.waitForLoadState('networkidle');await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
 rows.push({page:name,h1:await page.locator('h1').evaluateAll(es=>es.map(e=>({text:e.textContent,visible:!!e.getClientRects().length,hiddenAncestor:!!e.closest('[hidden],[aria-hidden="true"]'),parent:e.parentElement?.outerHTML.slice(0,180)}))),primaryCurrent:await page.getByRole('navigation',{name:'Primary navigation'}).locator('[aria-current]').count()})
 }
 writeFileSync('docs/v019-whole-product-review-evidence/heading-semantics.json',JSON.stringify(rows,null,2));
 await page.getByRole('button',{name:'About / product tour',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toContainText('More conversations understood.');await expect(page.getByRole('button',{name:'Open AQM',exact:true})).toHaveCount(2);await page.getByRole('button',{name:'Open AQM',exact:true}).first().click();await expect(page.getByRole('heading',{level:1})).toHaveText('Overview');
 writeFileSync('docs/v019-whole-product-review-evidence/connected-handoff.json',JSON.stringify({route:'Connected workspace → About / product tour → Open AQM → Overview',url:page.url(),role:await page.getByLabel('Current role').innerText(),productionRequestsSent:false},null,2));expect(f.errors).toEqual([]);expect(f.blocked).toEqual([])
 }finally{await f.close()}
})
