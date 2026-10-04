import {expect,type Page} from '@playwright/test'
import {fixture,app} from './authoringSimplificationFixture'
import {aggregateCalibration} from '../src/domain/calibration'
import {calibrationDiscoveryRecords} from '../src/fixtures/calibrationDiscoveryFixture'
const api='https://aqm-api-bd54ukouga-nw.a.run.app'
export {app}
export async function calibrationFixture(page:Page,query=''){
 const records=calibrationDiscoveryRecords(),current=records.find(r=>r.form.version===18)!.form
 const state=await fixture(page,'ADMIN',[],[current],[],'automation',{reauthenticateOnLoad:true})
 for(const record of records){const {humanReview,...evaluation}=record;await state.store.putEvaluation(evaluation);await state.store.writeReviews([{review:humanReview!,expectedRevision:0}])}
 let failCatalogue=false,failMain=false,omitSelected=false
 const calls:URL[]=[],cohorts:{query:Record<string,string>;ids:string[]}[]=[],blocked:string[]=[]
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===new URL(app).origin||u.origin===api||u.origin==='https://login.mypurecloud.ie'&&u.pathname==='/oauth/token'||u.origin==='https://api.mypurecloud.ie'&&u.pathname==='/api/v2/users/me')return route.fallback();blocked.push(u.origin+u.pathname);return route.abort()})
 await page.route(`${api}/**`,async route=>{
   const url=new URL(route.request().url())
   if(route.request().method()!=='GET'){blocked.push(route.request().method()+' '+url.pathname);return route.abort()}
   if(url.pathname==='/api/calibration'){
     calls.push(url)
     if(omitSelected&&!url.searchParams.has('form'))return route.fulfill({json:aggregateCalibration(records.filter(r=>r.form.version!==17),url.searchParams)})
     if(failMain||failCatalogue&&!url.searchParams.has('form'))return route.fulfill({status:503,json:{error:'Fictional calibration failure'}})
   }
   return route.fallback()
 })
 page.on('response',async response=>{if(new URL(response.url()).pathname==='/api/evaluations'){const body=await response.json();cohorts.push({query:Object.fromEntries(new URL(response.url()).searchParams),ids:body.items?.map((r:{id:string})=>r.id)??[]})}})
 await page.goto(`${app}?page=calibration${query}`);await expect(page.locator('.calibration-insight')).toContainText('Where humans and AI differ')
 return {...state,calls,cohorts,blocked,records,failCatalogue:(v=true)=>failCatalogue=v,failMain:(v=true)=>failMain=v,omitSelected:(v=true)=>omitSelected=v}
}
