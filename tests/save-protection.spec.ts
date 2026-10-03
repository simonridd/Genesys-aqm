import { test,expect,type Page } from '@playwright/test'
import { mkdirSync,appendFileSync } from 'node:fs'
import { defaultGovernance,rolePermissions } from '../src/domain/governance'
import { seedGroupAssets } from '../src/domain/seedGroupAssets'
import { seedPolicies } from '../src/domain/policies'
import { reviewFixture } from '../src/fixtures/reviewFixture'
import { historyStorageKey } from '../src/domain/evaluations'
import { policyRunsStorageKey } from '../src/domain/policyRuns'
import { seedForms } from '../src/domain/forms'
import { exportDefinition,importDefinition } from '../src/domain/portability'
import type { QuestionGroupAsset,FormTestRun } from '../src/domain/types'
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/',origin='https://aqm-api-bd54ukouga-nw.a.run.app'
const evidence=process.env.AQM_SAVE_EVIDENCE??'docs/v018a-evidence'
mkdirSync(evidence,{recursive:true})
const form={...structuredClone(seedForms[0]),id:'test-draft',familyId:'test-family',name:'Save protection test form',status:'DRAFT' as const,enabled:false}
const testRun=(id:string,status:FormTestRun['status'],familyId=form.familyId):FormTestRun=>({id,formId:form.id,formSnapshot:{...form,familyId},status,createdAt:'2026-10-02T12:00:00Z',sampleSource:'synthetic',selectedConversationIds:[],sampleConfiguration:{strategy:'recent',count:0},evaluationAssignments:0,expectedRequests:0,results:[],failures:[]})
async function fixture(page:Page,start:string,connected=true){
 const state={pageErrors:[] as string[],assets:[{...structuredClone(seedGroupAssets[0]),id:'saved-draft',name:'Saved draft',status:'DRAFT' as const}, {...structuredClone(seedGroupAssets[1]),id:'published-group',name:'Published group'}] as QuestionGroupAsset[],settings:structuredClone(defaultGovernance),failSave:false,failImport:false,requests:[] as {path:string;method:string;body:any}[],runs:[testRun('finished','completed'),testRun('running','running'),testRun('unknown',undefined),testRun('other','completed','other-family')]}
 page.on('pageerror',error=>state.pageErrors.push(error.message))
 await page.addInitScript(({start,connected})=>{
  const listeners=new Set<EventListenerOrEventListenerObject>();const add=window.addEventListener.bind(window),remove=window.removeEventListener.bind(window)
  window.addEventListener=((type:string,listener:EventListenerOrEventListenerObject,options:any)=>{if(type==='beforeunload')listeners.add(listener);add(type,listener,options)}) as typeof window.addEventListener
  window.removeEventListener=((type:string,listener:EventListenerOrEventListenerObject,options:any)=>{if(type==='beforeunload')listeners.delete(listener);remove(type,listener,options)}) as typeof window.removeEventListener
  ;(window as any).unloadListenerCount=()=>[...listeners].filter(listener=>!listener.toString().includes('willUnload')).length
  if(connected)sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:start}))
 },{start,connected})
 // Block every external request except explicit fictional responses below.
 await page.route('**/*',async r=>{
  const url=new URL(r.request().url()),path=url.pathname,method=r.request().method()
  if(url.origin===new URL(app).origin)return r.continue()
  if(url.origin==='https://login.mypurecloud.ie'&&path==='/oauth/token')return r.fulfill({json:{access_token:'fictional-token',token_type:'Bearer',expires_in:3600}})
  if(url.origin==='https://api.mypurecloud.ie'&&path==='/api/v2/users/me')return r.fulfill({json:{id:'fictional-owner',organization:{id:'fictional-org'}}})
  if(url.origin!==origin)return r.abort()
  const body=r.request().postData()?r.request().postDataJSON():undefined;state.requests.push({path,method,body})
  if(path==='/api/session')return r.fulfill({json:{actor:{userId:'fictional-owner'},role:'ADMIN',permissions:rolePermissions.ADMIN}})
  if(path==='/api/governance'){
   if(method==='PUT'){if(state.failSave)return r.fulfill({status:503,json:{error:'Save unavailable fixture'}});state.settings=body}
   return r.fulfill({json:state.settings})
  }
  if(path==='/api/question-groups')return r.fulfill({json:{items:state.assets}})
  if(path==='/api/question-groups/import'){
   if(state.failImport)return r.fulfill({status:503,json:{error:'Import unavailable fixture'}})
   const item=importDefinition('group',body,'imported-group','2026-10-02T12:00:00Z');state.assets.push(item);return r.fulfill({json:{item}})
  }
  if(path.startsWith('/api/question-groups/')&&method==='PUT'){
   if(state.failSave)return r.fulfill({status:503,json:{error:'Save unavailable fixture'}})
   state.assets=[...state.assets.filter(a=>a.id!==body.id),body];return r.fulfill({json:{item:body}})
  }
  if(path==='/api/forms')return r.fulfill({json:{items:[form]}})
  if(path==='/api/form-tests')return r.fulfill({json:{items:state.runs}})
  if(path.startsWith('/api/form-tests/')&&method==='DELETE'){state.runs=state.runs.filter(run=>run.id!==path.split('/').at(-1));return r.fulfill({json:{ok:true}})}
  if(path==='/api/retention/preview')return r.fulfill({json:{id:'fictional-plan',counts:{evaluations:0},scanned:0,complete:true,continuation:{}}})
  if(path==='/api/review-sla/refresh')return r.fulfill({json:{complete:true,open:0}})
  if(method!=='GET')throw Error(`Unexpected mutation ${method} ${path}`)
  return r.fulfill({json:{items:[]}})
 })
 await page.goto(connected?`${app}?code=fixture&state=${'A'.repeat(43)}`:`${app}?page=${start}`)
 if(connected)await expect(page.getByLabel('Current role')).toHaveText('ADMIN')
 return state
}
const nav=(page:Page,name:string)=>page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name,exact:true})
async function dialogAction(page:Page,accept:boolean,action:()=>Promise<unknown>,copy:string){
 const dialogPromise=page.waitForEvent('dialog');const actionPromise=action();const dialog=await dialogPromise
 expect(dialog.type()).toBe('confirm');expect(dialog.message()).toContain(copy);appendFileSync(`${evidence}/confirmations.txt`,JSON.stringify({viewport:page.viewportSize(),message:dialog.message(),accepted:accept})+'\n');await (accept?dialog.accept():dialog.dismiss());await actionPromise
}
async function unloadCount(page:Page,count:number){
 await expect.poll(()=>page.evaluate(()=>(window as any).unloadListenerCount())).toBe(count)
 // Exercise the handler without actually closing the browser or losing fixture state.
 expect(await page.evaluate(()=>{const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented})).toBe(count>0)
}
async function contentEntry(page:Page,write=false){return page.evaluate(async write=>{
 const request=indexedDB.open('genesys-aqm-conversations-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('entries',{keyPath:'key'})
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})
 return new Promise<number>((resolve,reject)=>{const tx=db.transaction('entries',write?'readwrite':'readonly'),store=tx.objectStore('entries');if(write)store.put({key:'fixture-transcript',scope:'fictional',kind:'transcript',fetchedAt:Date.now(),value:{}});const count=store.count();let value=0;count.onsuccess=()=>value=count.result;tx.oncomplete=()=>{db.close();resolve(value)};tx.onerror=()=>reject(tx.error)})
},write)}
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
 test(`Groups save, replacement and leave protection at ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page,'groups'),detail=page.locator('.asset-detail')
  await page.getByRole('row').filter({hasText:'Published group'}).click();await unloadCount(page,0);await expect(detail.getByLabel('Reusable question group name',{exact:true})).not.toBeEditable()
  await detail.getByRole('button',{name:'Edit as new version'}).click();await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible();await unloadCount(page,1)
  await dialogAction(page,false,()=>page.getByRole('row').filter({hasText:'Saved draft'}).click(),'Leave this group and discard them?');await expect(detail.locator('h2').first()).toContainText('v2')
  await dialogAction(page,true,()=>page.getByRole('row').filter({hasText:'Saved draft'}).click(),'unsaved changes');await unloadCount(page,0)
  await detail.getByLabel('Reusable question group description').fill('Exact working content');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible();await unloadCount(page,1)
  await dialogAction(page,false,()=>page.getByRole('row').filter({hasText:'Published group'}).click(),'Saved draft');await expect(detail.getByLabel('Reusable question group description')).toHaveValue('Exact working content')
  await dialogAction(page,false,()=>nav(page,'Settings').click(),'Saved draft');await expect(page.getByRole('heading',{name:'Question Groups',exact:true})).toBeVisible();await expect(detail.getByLabel('Reusable question group description')).toHaveValue('Exact working content')
  state.failSave=true;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Save unavailable fixture');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible();await unloadCount(page,1)
  state.failSave=false;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByRole('status').filter({hasText:/^Saved /})).toBeVisible();await unloadCount(page,0)
  await detail.getByLabel('Reusable question group description').fill('Discard exactly this edit');await dialogAction(page,true,()=>page.getByRole('row').filter({hasText:'Published group'}).click(),'Leave this group');await page.getByRole('row').filter({hasText:'Saved draft'}).click();await expect(detail.getByLabel('Reusable question group description')).toHaveValue('Exact working content');await unloadCount(page,0)
  await detail.getByLabel('Reusable question group name',{exact:true}).fill('Visible published definition');await detail.getByRole('button',{name:'Publish reusable question group',exact:true}).click()
  expect(state.requests.filter(r=>r.method==='PUT'&&r.path==='/api/question-groups/saved-draft').at(-1)?.body).toMatchObject({name:'Visible published definition',description:'Exact working content',status:'PUBLISHED'});await expect(detail.getByLabel('Reusable question group name',{exact:true})).not.toBeEditable();await unloadCount(page,0)
  await page.getByRole('button',{name:'New reusable question group',exact:true}).click();await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible();await unloadCount(page,1)
  await detail.getByLabel('Reusable question group name',{exact:true}).fill('Unsaved new group');expect(state.assets.some(a=>a.name==='Unsaved new group')).toBe(false)
  await detail.screenshot({path:`${evidence}/group-dirty-${viewport.width}.png`})
  await dialogAction(page,true,()=>nav(page,'Settings').click(),'Unsaved new group');await unloadCount(page,0);await nav(page,'Question Groups').click();await expect(detail).toHaveCount(0);await expect(page.getByRole('row').filter({hasText:'Unsaved new group'})).toHaveCount(0)
  const imported=Buffer.from(JSON.stringify(exportDefinition('group',seedGroupAssets[0])))
  state.failImport=true;await page.getByLabel('Import reusable group',{exact:true}).setInputFiles({name:'group.json',mimeType:'application/json',buffer:imported});await expect(page.getByRole('alert')).toContainText('Import unavailable fixture');expect(state.assets.some(a=>a.id==='imported-group')).toBe(false)
  state.failImport=false;await page.getByLabel('Import reusable group',{exact:true}).setInputFiles({name:'group.json',mimeType:'application/json',buffer:imported});await expect(detail.locator('h2').first()).toContainText('DRAFT');await expect(detail.getByText('Unsaved changes',{exact:true})).toHaveCount(0);await unloadCount(page,0)
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(state.pageErrors).toEqual([]);await context.close()
 })
 test(`Governance exact global scope, discard, failures and guards at ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page,'settings'),gov=page.getByRole('region',{name:'Governance'})
  const section=async(name:string)=>page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name,exact:true}).click()
  await section('Privacy & retention')
  await expect(gov.getByRole('button',{name:'Save all settings',exact:true})).toBeDisabled();await gov.getByRole('button',{name:'Preview retention',exact:true}).click();await expect(gov.getByText('evaluations: 0 eligible for deletion')).toBeVisible()
  await gov.getByLabel('Evaluation retention days',{exact:true}).fill('2');await expect(gov.getByText('evaluations: 0 eligible for deletion')).toHaveCount(0)
  await section('Reviews');await gov.getByLabel('Due soon hours',{exact:true}).fill('12');await section('Privacy & retention');await gov.getByLabel('Browser conversation cache hours').fill('0')
  await expect(gov.getByRole('status').filter({hasText:'Unsaved settings:'})).toHaveText('Unsaved settings: Privacy & retention, Reviews');await unloadCount(page,1)
  await section('Reviews');await expect(gov.getByRole('button',{name:'Refresh review SLA state'})).toBeDisabled();await section('Privacy & retention');await expect(gov.getByRole('button',{name:'Preview retention',exact:true})).toBeDisabled();expect(state.requests.some(r=>r.path==='/api/review-sla/refresh')).toBe(false)
  await page.getByRole('button',{name:'Clear cached Genesys searches and content'}).click();expect(state.requests.filter(r=>r.method==='PUT'&&r.path==='/api/governance')).toHaveLength(0);await expect(gov.getByLabel('Evaluation retention days',{exact:true})).toHaveValue('2')
  await dialogAction(page,false,()=>nav(page,'Question Groups').click(),'You have unsaved Settings changes. Leave without saving them?');await expect(gov).toBeVisible();await section('Reviews');await expect(gov.getByLabel('Due soon hours',{exact:true})).toHaveValue('12')
  await section('Privacy & retention');expect(await contentEntry(page,true)).toBe(1);expect(await contentEntry(page)).toBe(1)
  state.failSave=true;await gov.getByRole('button',{name:'Save all settings',exact:true}).click();await expect(gov.getByRole('alert')).toContainText('Save unavailable fixture');await expect(gov.getByRole('status').filter({hasText:'Unsaved settings:'})).toBeVisible();await expect(gov.getByLabel('Evaluation retention days',{exact:true})).toHaveValue('2')
  expect(await contentEntry(page)).toBe(1)
  await gov.locator('[aria-label="Save all settings"]').screenshot({path:`${evidence}/settings-pending-${viewport.width}.png`})
  state.failSave=false;await gov.getByRole('button',{name:'Save all settings',exact:true}).click();await expect(gov.getByRole('status').filter({hasText:/^Saved /})).toBeVisible();await unloadCount(page,0)
  expect(state.requests.filter(r=>r.method==='PUT'&&r.path==='/api/governance').at(-1)?.body).toEqual({...defaultGovernance,browserContentCacheHours:0,evaluationRetentionDays:2,reviewSla:{...defaultGovernance.reviewSla,dueSoonHours:12}})
  await expect.poll(()=>contentEntry(page)).toBe(0);await gov.locator('[aria-label="Save all settings"]').screenshot({path:`${evidence}/settings-saved-${viewport.width}.png`})
  await expect(gov.getByRole('button',{name:'Discard changes'})).toHaveCount(0)
  await section('Access');await gov.getByLabel('Genesys user ID',{exact:true}).fill('Unrelated role text');await section('Privacy & retention');await gov.getByLabel('Evaluation retention days',{exact:true}).fill('3');await gov.getByRole('button',{name:'Discard changes'}).click();await expect(gov.getByLabel('Evaluation retention days',{exact:true})).toHaveValue('2');await section('Access');await expect(gov.getByLabel('Genesys user ID',{exact:true})).toHaveValue('Unrelated role text');await unloadCount(page,0)
  await section('Reviews');await gov.getByRole('button',{name:'Refresh review SLA state'}).click();await expect(gov.getByRole('status').filter({hasText:'Review SLA refreshed:'})).toBeVisible()
  await section('Privacy & retention');await gov.getByLabel('Evaluation retention days',{exact:true}).fill('4');await dialogAction(page,true,()=>nav(page,'Question Groups').click(),'unsaved Settings changes');await nav(page,'Settings').click();await section('Privacy & retention');await expect(gov.getByLabel('Evaluation retention days',{exact:true})).toHaveValue('2');await unloadCount(page,0)
  await section('Advanced / Development');await dialogAction(page,false,()=>page.getByRole('button',{name:'Reset local forms, policies and history'}).click(),'Saved AQM server data is not affected');await page.locator('.reset-panel').screenshot({path:`${evidence}/local-reset-${viewport.width}.png`})
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(state.pageErrors).toEqual([]);await context.close()
 })
 test(`Form Test destructive confirmations preserve recovery at ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage()
  const recovery={id:'exact-recovery-id',form,source:'synthetic',selectedConversationIds:[],sampleConfiguration:{strategy:'recent',count:0}}
  await page.addInitScript(value=>{sessionStorage.setItem('genesys-aqm-v06-pending-test-test-draft',JSON.stringify(value))},recovery)
  const state=await fixture(page,'forms');await page.getByRole('row').filter({hasText:form.name}).click();await page.locator('#form-test-tools>summary').click();const panel=page.locator('#form-test');await expect(panel).toBeVisible();await panel.screenshot({path:`${evidence}/form-test-initial-${viewport.width}.png`})
  const clear=panel.getByRole('button',{name:"Clear this form's test history",exact:true})
  await dialogAction(page,false,()=>clear.click(),'Completed saved test runs');expect(state.requests.filter(r=>r.method==='DELETE')).toHaveLength(0)
  await dialogAction(page,true,()=>clear.click(),'Running or uncertain tests are retained');await expect(panel.getByRole('status')).toContainText('Completed test history cleared');expect(state.requests.filter(r=>r.method==='DELETE').map(r=>r.path)).toEqual(['/api/form-tests/finished']);expect(state.runs.map(r=>r.id)).toEqual(['running','unknown','other']);expect(state.requests.some(r=>r.path.startsWith('/api/evaluations')&&r.method!=='GET')).toBe(false)
  const pending=panel.getByRole('button',{name:'Clear pending request'});await dialogAction(page,false,()=>pending.click(),'next test will use a new test ID');expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('genesys-aqm-v06-pending-test-test-draft')!))).toEqual(recovery);await expect(panel.getByRole('button',{name:'Recover test run'})).toBeVisible()
  await panel.screenshot({path:`${evidence}/form-test-recovery-${viewport.width}.png`})
  await dialogAction(page,true,()=>pending.click(),'may issue AI requests again');expect(await page.evaluate(()=>sessionStorage.getItem('genesys-aqm-v06-pending-test-test-draft'))).toBeNull();await expect(panel.getByRole('status')).toContainText('A new test may use Jev again');expect(state.requests.some(r=>r.path.startsWith('/api/form-tests/')&&r.method==='POST')).toBe(false)
  const local=[testRun('local-family',undefined),testRun('local-other',undefined,'other-family')];await page.evaluate(value=>localStorage.setItem('genesys-aqm-v06-form-tests',JSON.stringify(value)),local);await panel.getByLabel('Execution').selectOption('browser');await expect(panel.getByText('Recent test runs')).toBeVisible()
  await dialogAction(page,false,()=>clear.click(),'Clear browser-local test history for this form?');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('genesys-aqm-v06-form-tests')!))).toEqual(local)
  await dialogAction(page,true,()=>clear.click(),'Production and server data are unaffected');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('genesys-aqm-v06-form-tests')!))).toEqual([local[1]])
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(state.pageErrors).toEqual([]);await context.close()
 })
}
test('offline group is explicitly saved in this browser, and import is clean',async({page})=>{
 const state=await fixture(page,'groups',false);await page.getByRole('button',{name:'New reusable question group'}).click();const detail=page.locator('.asset-detail');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible();await unloadCount(page,1)
 await detail.getByLabel('Reusable question group name',{exact:true}).fill('Browser saved group');await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('alert')).toContainText('title');await unloadCount(page,1)
 await detail.getByRole('button',{name:'Edit',exact:true}).click();await detail.getByLabel('Title',{exact:true}).fill('Browser question');await detail.getByLabel('Instructions / question').fill('Was the question answered?')
 await page.evaluate(()=>{const original=Storage.prototype.setItem;(window as any).restoreStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(key,value){if(key==='genesys-aqm-v08-group-assets')throw new DOMException('Fixture quota exceeded','QuotaExceededError');original.call(this,key,value)}})
 await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Fixture quota exceeded');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible();await unloadCount(page,1)
 await page.evaluate(()=>(window as any).restoreStorage());await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText(/Saved in this browser/)).toBeVisible();await unloadCount(page,0)
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('genesys-aqm-v08-group-assets')!).some((a:any)=>a.name==='Browser saved group'))).toBe(true)
 await page.getByLabel('Import reusable group',{exact:true}).setInputFiles({name:'group.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exportDefinition('group',seedGroupAssets[0])))});await expect(detail.getByText('Unsaved changes',{exact:true})).toHaveCount(0);await unloadCount(page,0);expect(state.pageErrors).toEqual([])
})
test('demo removal, broad local reset and local history clear have exact scope',async({page})=>{
 const localForm={...seedForms[0],name:'Authored local form'},localPolicy={...seedPolicies[0],id:'authored-local-policy',name:'Authored local policy'}
 const real=reviewFixture('retained-real'),demo={...real,id:'prepared-demo',source:'synthetic-demo'}
 const run={id:'retained-run',policyId:localPolicy.id,policySnapshot:localPolicy,source:'synthetic',startedAt:'2026-10-02T12:00:00Z',candidateConversationCount:0,matchedConversationCount:0,formsAssigned:[],evaluationsRequested:0,evaluationsSucceeded:0,evaluationsFailed:0,status:'completed',failures:[]}
 await page.addInitScript(({localForm,localPolicy,real,demo,run,historyStorageKey,policyRunsStorageKey})=>{localStorage.setItem('genesys-aqm-v02-forms',JSON.stringify([localForm]));localStorage.setItem('genesys-aqm-v02-policies',JSON.stringify([localPolicy]));localStorage.setItem(historyStorageKey,JSON.stringify([real,demo]));localStorage.setItem(policyRunsStorageKey,JSON.stringify([run]))},{localForm,localPolicy,real,demo,run,historyStorageKey,policyRunsStorageKey})
 const state=await fixture(page,'settings',false)
 await page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Advanced / Development',exact:true}).click()
 const before=await page.evaluate(()=>({...localStorage}))
 await dialogAction(page,false,()=>page.getByRole('button',{name:'Reset local forms, policies and history'}).click(),'Save or copy any local work');expect(await page.evaluate(()=>({...localStorage}))).toEqual(before)
 await page.getByRole('button',{name:'Remove prepared demo evaluations',exact:true}).click();await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),historyStorageKey)).toEqual([real])
 const removed=await page.evaluate(()=>({...localStorage}));expect(removed['genesys-aqm-v02-forms']).toEqual(before['genesys-aqm-v02-forms']);expect(removed['genesys-aqm-v02-policies']).toEqual(before['genesys-aqm-v02-policies']);expect(removed[policyRunsStorageKey]).toEqual(before[policyRunsStorageKey])
 await page.locator('.reset-panel').screenshot({path:`${evidence}/local-reset.png`})
 await nav(page,'Analytics').click();await page.getByRole('button',{name:'Load demo analytics data',exact:true}).first().click();const historyBefore=await page.evaluate(()=>({...localStorage}))
 await dialogAction(page,false,()=>page.getByRole('button',{name:'Clear local evaluation and run history'}).click(),'Forms and policies are unaffected');expect(await page.evaluate(()=>({...localStorage}))).toEqual(historyBefore)
 await dialogAction(page,true,()=>page.getByRole('button',{name:'Clear local evaluation and run history'}).click(),'Saved server evaluations and runs are unaffected');await expect.poll(()=>page.evaluate(key=>localStorage.getItem(key),historyStorageKey)).toBe('[]');await expect.poll(()=>page.evaluate(key=>localStorage.getItem(key),policyRunsStorageKey)).toBe('[]')
 const cleared=await page.evaluate(()=>({...localStorage}));expect(cleared['genesys-aqm-v02-forms']).toBe(historyBefore['genesys-aqm-v02-forms']);expect(cleared['genesys-aqm-v02-policies']).toBe(historyBefore['genesys-aqm-v02-policies']);expect(state.requests.filter(r=>r.method!=='GET')).toHaveLength(0)
 await nav(page,'Settings').click();await page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Advanced / Development',exact:true}).click();await dialogAction(page,true,()=>page.getByRole('button',{name:'Reset local forms, policies and history'}).click(),'Saved AQM server data is not affected')
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('genesys-aqm-v02-forms')!))).toEqual(seedForms)
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('genesys-aqm-v02-policies')!))).toEqual(seedPolicies)
 expect(state.requests.filter(r=>r.method!=='GET')).toHaveLength(0);expect(state.pageErrors).toEqual([])
})
