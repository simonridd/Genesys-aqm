import type { Page } from '@playwright/test'
import { defaultGovernance, rolePermissions } from '../src/domain/governance'
/** Existing pre-RBAC browser journeys exercise the authorized owner. */
export async function installOwnerGovernanceFixture(page:Page){
 await page.route('**/api/session',r=>r.fulfill({json:{actor:{userId:'fixture-owner'},role:'ADMIN',permissions:rolePermissions.ADMIN,bootstrap:true}}))
 await page.route('**/api/governance',r=>r.fulfill({json:defaultGovernance}))
}
