import { expect, type Page } from '@playwright/test'
import { qualityFixture } from './qualityActionabilityFixture'
import { fixtureRun } from '../src/fixtures/overviewFixture'
import { summarizeCoverage } from '../src/domain/analytics'
import type { CoverageCounts } from '../src/analyticsPresentation'
export const coverageScenarios:Record<string,CoverageCounts>={
 mixed:{candidate:1000,eligible:1000,sampled:500,evaluable:400,evaluated:350,failed:75},
 intentional:{candidate:100,eligible:100,sampled:10,evaluable:10,evaluated:10,failed:0},
 fullSelection:{candidate:100,eligible:100,sampled:100,evaluable:90,evaluated:85,failed:0},
 fullCoverage:{candidate:100,eligible:100,sampled:100,evaluable:100,evaluated:100,failed:0},
 zeroEligible:{candidate:100,eligible:0,sampled:0,evaluable:0,evaluated:0,failed:0},
}
export async function coverageFixture(page:Page,scenario='mixed'){
 const f=await qualityFixture(page)
 for(const run of await f.store.runs())await f.store.atomic([{collection:'policyRuns',id:run.id,expected:run}])
 const c=coverageScenarios[scenario]
 if(c)await f.store.putRun({...fixtureRun('coverage-interpretation','2026-10-01T02:00:00.000Z',c.failed?'partial-failure':'completed'),candidateConversationCount:c.candidate,matchedConversationCount:c.eligible,evaluationsSucceeded:c.evaluated,evaluationsFailed:c.failed,coverage:{candidateCount:c.candidate,eligibleCount:c.eligible,sampledCount:c.sampled,evaluableCount:c.evaluable,evaluatedConversationCount:c.evaluated,evaluationCount:c.evaluated+c.failed,successfulEvaluationCount:c.evaluated,failedEvaluationCount:c.failed,transcriptUnavailableCount:c.sampled-c.evaluable},queueCoverage:[],agentCoverage:[]})
 await page.getByRole('button',{name:'Refresh',exact:true}).click()
 await expect(page.getByRole('button',{name:'Refresh',exact:true})).toBeEnabled()
 await expect(page.getByRole('region',{name:'Coverage summary'})).toContainText(`Eligible${c?.eligible??0}`)
 return {...f,counts:c,totals:summarizeCoverage(await f.store.runs())}
}
