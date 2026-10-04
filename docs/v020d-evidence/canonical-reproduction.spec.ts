import {test,expect} from '@playwright/test'
import {writeFileSync} from 'node:fs'
import {qualityFixture,app} from '../../tests/qualityActionabilityFixture'
import {navigateWorkspace,chooseView} from '../../tests/workspace-navigation'
test('canonical F7: Questions drill replaces source and Back lands on Welcome',async({page})=>{
 const state=await qualityFixture(page)
 await navigateWorkspace(page,'About / product tour')
 await page.getByRole('button',{name:'Open AQM',exact:true}).first().click()
 await navigateWorkspace(page,'Analytics')
 await page.getByRole('button',{name:'Change filters',exact:true}).click()
 await page.getByLabel('Form',{exact:true}).selectOption('general_service@17')
 await chooseView(page,'Questions')
 const row=page.locator('.operational-table tbody tr').filter({hasText:'Clear next step'}).filter({hasText:'Customer Service v17'})
 await expect(row).toBeVisible()
 const source=page.url(),before=await page.evaluate(()=>history.length)
 await row.getByRole('button',{name:'Inspect evaluations →'}).click()
 await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible()
 const drill=page.url(),after=await page.evaluate(()=>history.length)
 await page.goBack();await expect(page.getByRole('region',{name:'Welcome to IPI AQM'})).toBeVisible()
 const back=page.url();await page.screenshot({path:'docs/v020d-evidence/canonical-back-welcome.png',fullPage:true})
 await page.goForward();await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible()
 expect(after).toBe(before)
 writeFileSync('docs/v020d-evidence/canonical-f7.json',JSON.stringify({base:'8f4137d35591d355185e25a3e89888e0de6d8d80',source,drill,back,forward:page.url(),historyBefore:before,historyAfter:after,oldBackDestination:'Welcome',writes:state.writes,blocked:state.blocked,errors:state.errors},null,2))
 expect(state.writes).toEqual([]);expect(state.blocked).toEqual([]);expect(state.errors).toEqual([])
})
