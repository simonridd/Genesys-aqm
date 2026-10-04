import { expect,type Page } from '@playwright/test'
import type { OverviewSnapshot } from '../src/domain/overview'
import type { Role } from '../src/domain/governance'
import { overviewFixture,overviewNow,overviewAuthority } from '../src/fixtures/overviewFixture'
import { operationalOverview } from '../src/server/overview'
import { qualityFixture,api } from './qualityActionabilityFixture'
export async function firstScanFixture(page:Page,role:Role='ADMIN'){
 const f=await qualityFixture(page,'automation',role)
 const snapshot=await operationalOverview(await overviewFixture(),overviewNow,7,overviewAuthority,true)
 if(!snapshot.analytics.complete)throw Error('Expected complete fixture')
 Object.assign(snapshot.analytics.data.quality,{averageScore:.79,evaluations:8,conversations:4,passRate:.75,criticalFailures:2})
 Object.assign(snapshot.analytics.data.coverage,{candidate:40,eligible:20,sampled:10,evaluable:6,evaluated:4,failed:2})
 snapshot.analytics.data.qualityTrend=[{key:'2026-09-30',count:4,averageScore:.78,passRate:.75,criticalFailures:1},{key:'2026-10-01',count:4,averageScore:.8,passRate:.75,criticalFailures:1}]
 snapshot.reviews={complete:true,data:{open:7,dueSoon:1,overdue:1,escalated:1,unassigned:1}}
 snapshot.notifications={complete:true,data:{pending:2,failed24h:1,lastSuccessfulAt:overviewNow}}
 if(snapshot.alerts.complete){snapshot.alerts.data.items.push({id:'other-1',severity:'WARNING',title:'Another active warning',createdAt:overviewNow},{id:'other-2',severity:'WARNING',title:'Additional active warning',createdAt:overviewNow});snapshot.alerts.data.errors=2;snapshot.alerts.data.warnings=3;snapshot.alerts.data.openAlerts=5}
 let unavailable=false,mutate=(s:OverviewSnapshot)=>s
 await page.route(`${api}/api/overview?*`,route=>{
  if(unavailable)return route.fulfill({status:503,json:{error:'Fixture refresh unavailable'}})
  const s=structuredClone(snapshot),days=new URL(route.request().url()).searchParams.get('range')==='30'?30:7
  s.range.days=days;s.range.from=days===30?'2026-09-02T12:00:00.000Z':'2026-09-25T12:00:00.000Z'
  f.requests.push(new URL(route.request().url()))
  return route.fulfill({json:mutate(s)})
 })
 await page.getByRole('button',{name:'Refresh',exact:true}).click()
 await expect(page.getByRole('region',{name:'Attention required'})).toContainText('3 warnings')
 return {...f,snapshot,setSnapshot:(fn:typeof mutate)=>{mutate=fn},failOverview:()=>{unavailable=true}}
}
