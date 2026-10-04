import {test,expect} from '@playwright/test'
import {qualityFixture,api} from '../../tests/qualityActionabilityFixture'
import {navigateWorkspace} from '../../tests/workspace-navigation'
import {writeFileSync} from 'node:fs'
test('canonical 503 also presents false empty results',async({page})=>{
 await qualityFixture(page)
 await page.route(`${api}/api/evaluations?*`,route=>route.fulfill({status:503,json:{error:'Fictional 503: evaluation service unavailable'}}))
 await navigateWorkspace(page,'Evaluations')
 await expect(page.getByRole('alert')).toContainText('Fictional 503')
 await expect(page.getByText('No production evaluations on this page.',{exact:true})).toBeVisible()
 await expect(page.locator(".evaluation-queue .table-toolbar").getByText(/0 results/)).toBeVisible()
 await page.screenshot({path:'docs/v020c-evidence/canonical-false-empty.png',fullPage:true})
 writeFileSync('docs/v020c-evidence/canonical-false-empty.aria.yml',await page.locator('main').ariaSnapshot())
 writeFileSync('docs/v020c-evidence/canonical-false-empty.json',JSON.stringify({base:'94b8f19330b2795cca9b092d61844c74269be4c2',status:503,error:true,empty:true,zeroResults:true,fixture:'fictional authenticated APIs'},null,2))
})
