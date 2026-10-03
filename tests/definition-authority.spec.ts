import type { Locator } from '@playwright/test'
async function openActions(detail:Locator){const disclosure=detail.locator('.more-actions');if(await disclosure.getAttribute('open')===null)await disclosure.locator('summary').click()}
import {test,expect,type Page} from '@playwright/test'
import {mkdirSync,readFileSync} from 'node:fs'
import {seedForms} from '../src/domain/forms'
import {seedPolicies} from '../src/domain/policies'
import {seedGroupAssets} from '../src/domain/seedGroupAssets'
import {rolePermissions,defaultGovernance} from '../src/domain/governance'
import type {EvaluationForm,InteractionPolicy,QuestionGroupAsset} from '../src/domain/types'
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/',origin='https://aqm-api-bd54ukouga-nw.a.run.app',evidence='docs/v018c-evidence'
mkdirSync(evidence,{recursive:true})
const savedForm:EvaluationForm={...structuredClone(seedForms[0]),id:'saved-form',name:'Saved production form',status:'PUBLISHED',enabled:true,groups:[{id:'general',name:'General',sourceAsset:{assetId:'saved-group',familyId:'saved-group',assetVersion:1}}],questions:seedForms[0].questions.map(q=>({...q,groupId:'general'}))}
const draftForm:EvaluationForm={...structuredClone(savedForm),id:'saved-draft',name:'Saved working form',status:'DRAFT',enabled:false}
const savedPolicy:InteractionPolicy={...structuredClone(seedPolicies[0]),id:'daily_voice',name:'Daily Voice Customer Service AQM',enabled:true,criteria:{anyOf:[[{field:'channel',operator:'equals',value:JSON.parse(readFileSync('src/samples/billing-conversation.json','utf8')).channel}]]},evaluationFormIds:[savedForm.id],version:1}
const savedGroup:QuestionGroupAsset={...structuredClone(seedGroupAssets[0]),id:'saved-group',familyId:'saved-group',name:'Saved group A'}
const nav=(page:Page,name:string)=>page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name,exact:true})
async function fixture(page:Page,start='forms',connected=true,fail='',compact=false){
 const state={forms:[structuredClone(savedForm)],policies:[structuredClone(savedPolicy)],groups:[structuredClone(savedGroup)],fail,failSave:false,delay:false,release:()=>{},writes:[] as string[],reads:[] as string[],errors:[] as string[]}
 page.on('pageerror',e=>state.errors.push(e.message))
 const localDraft={...structuredClone(draftForm),id:'local-draft',name:'Local unsaved custom draft'}
 await page.addInitScript(({localForms,localPolicies,localGroups,start,connected})=>{
  if(!localStorage.getItem('authority-fixture')){localStorage.setItem('authority-fixture','1');localStorage.setItem('genesys-aqm-v03b-form-seeded','1');localStorage.setItem('genesys-aqm-v02-forms',JSON.stringify(localForms));localStorage.setItem('genesys-aqm-v02-policies',JSON.stringify(localPolicies));localStorage.setItem('genesys-aqm-v08-group-assets',JSON.stringify(localGroups));localStorage.setItem('genesys-aqm-v06-forms-view','table')}
  if(connected&&!sessionStorage.getItem('authority-oauth')){sessionStorage.setItem('authority-oauth','1');sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fixture-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:start}))}
 },{localForms:compact?[...seedForms.slice(0,3),localDraft]:[...seedForms,localDraft,{...savedForm,name:'Stale same-ID browser history'}],localPolicies:seedPolicies,localGroups:seedGroupAssets,start,connected})
 await page.route('**/*',async r=>{
  const url=new URL(r.request().url()),path=url.pathname,method=r.request().method()
  if(url.origin===new URL(app).origin)return r.continue()
  if(url.origin==='https://login.mypurecloud.ie'&&path==='/oauth/authorize')return r.fulfill({status:302,headers:{location:`${app}?code=fixture&state=${url.searchParams.get('state')}`}})
  if(url.origin==='https://login.mypurecloud.ie'&&path==='/oauth/token')return r.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}})
  if(url.origin==='https://api.mypurecloud.ie'&&path==='/api/v2/users/me')return r.fulfill({json:{id:'fixture-user',organization:{id:'fixture-org'}}})
  if(url.origin!==origin)return r.abort()
  if(method==='GET')state.reads.push(path);else state.writes.push(`${method} ${path}`)
  if(path==='/api/session')return r.fulfill({json:{actor:{userId:'fixture-user'},role:'ADMIN',permissions:rolePermissions.ADMIN}})
  if(path==='/api/governance')return r.fulfill({json:defaultGovernance})
  if(['/api/forms','/api/policies','/api/question-groups'].includes(path)){
   if(path===state.fail)return r.fulfill({status:503,json:{error:'Fixture configuration unavailable'}})
   if(path==='/api/policies'&&state.delay)await new Promise<void>(resolve=>state.release=resolve)
   return r.fulfill({json:{items:path==='/api/forms'?state.forms:path==='/api/policies'?state.policies:state.groups}})
  }
  if(path.startsWith('/api/forms/')&&method==='PUT'){
   if(state.failSave)return r.fulfill({status:503,json:{error:'Fixture save failed'}})
   const item={...r.request().postDataJSON(),name:r.request().postDataJSON().name};state.forms=[...state.forms.filter(f=>f.id!==item.id),item];return r.fulfill({json:{item}})
  }
  if(path.startsWith('/api/policies/')&&method==='PUT'){
   if(state.failSave)return r.fulfill({status:409,json:{error:'Conflict'}})
   const item={...r.request().postDataJSON(),version:2};delete item.expectedVersion;state.policies=[...state.policies.filter(p=>p.id!==item.id),item];return r.fulfill({json:{item}})
  }
  if(path.startsWith('/api/question-groups/')&&method==='PUT'){
   const item={...r.request().postDataJSON(),updatedAt:'2026-10-02T12:01:00Z'};state.groups=[...state.groups.filter(g=>g.id!==item.id),item];return r.fulfill({json:{item}})
  }
  if(method!=='GET')throw Error(`Unexpected write: ${method} ${path}`)
  return r.fulfill({json:{items:[],byForm:[]}})
 })
 await page.goto(connected?`${app}?code=fixture&state=${'A'.repeat(43)}`:`${app}?page=${start}`)
 if(connected)await expect(page.getByLabel('Current role')).toHaveText('ADMIN')
 return state
}
const localData=(page:Page)=>page.evaluate(()=>Object.fromEntries(['genesys-aqm-v02-forms','genesys-aqm-v02-policies','genesys-aqm-v08-group-assets'].map(key=>[key,localStorage.getItem(key)])))
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
 test(`R05 exact review, saved/local libraries, routing and transitions ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page),before=await localData(page)
  await expect(page.getByRole('heading',{name:'Saved in AQM · 1 saved form'})).toBeVisible()
  const primary=page.getByRole('table').first();await expect(primary.getByRole('row').filter({hasText:savedForm.name})).toHaveCount(1)
  await expect(primary.getByText('General Customer Service',{exact:true})).toHaveCount(0)
  await expect(page.getByText('Production usage counts use saved policies only.')).toBeVisible()
  await expect(primary.getByRole('row').filter({hasText:savedForm.name}).locator('td').nth(4)).toHaveText('1')
  await page.locator('.local-library > summary').click();await expect(page.locator('.local-library').getByText('Local unsaved custom draft',{exact:true})).toBeVisible()
  await page.getByText('Preserved local copies with saved IDs',{exact:true}).click();await expect(page.getByText('Stale same-ID browser history · local copy')).toBeVisible()
  await page.screenshot({path:`${evidence}/forms-${viewport.width}.png`,fullPage:true});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`${evidence}/forms-viewport-${viewport.width}.png`})
  await nav(page,'Question Groups').click();await expect(page.getByRole('heading',{name:'Saved in AQM · 1 saved group'})).toBeVisible()
  await page.locator('.local-library > summary').click();await expect(page.locator('.local-library').getByText(/Not saved in AQM · local copy/).first()).toBeVisible()
  await expect(page.getByRole('table').getByText(seedGroupAssets[0].name,{exact:true})).toHaveCount(0)
  await expect(page.getByRole('row').filter({hasText:savedGroup.name}).locator('td').nth(4)).toHaveText('1');await page.screenshot({path:`${evidence}/groups-${viewport.width}.png`,fullPage:true});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`${evidence}/groups-viewport-${viewport.width}.png`})
  await nav(page,'Conversation review').click();const routing=page.locator('.evaluation-card')
  await expect(routing.getByText(savedPolicy.name,{exact:true})).toBeVisible();await expect(routing.getByText('Customer Service Messaging',{exact:true})).toHaveCount(0);await expect(routing.getByText('Cross-channel monitoring sample',{exact:true})).toHaveCount(0)
  await expect(routing.locator('.assignment')).toHaveCount(1);await expect(routing.getByLabel('Manual form selection').locator('option')).toHaveText([savedForm.name])
  await page.screenshot({path:`${evidence}/routing-${viewport.width}.png`,fullPage:true});await page.screenshot({path:`${evidence}/routing-viewport-${viewport.width}.png`})
  expect(await localData(page)).toEqual(before);expect(state.writes).toEqual([])
  expect(state.reads.filter(p=>p==='/api/policies')).toHaveLength(1);expect(state.reads.filter(p=>p==='/api/forms')).toHaveLength(1);expect(state.reads.filter(p=>p==='/api/question-groups')).toHaveLength(1)
  await nav(page,'Settings').click();await page.getByRole('button',{name:'Disconnect',exact:true}).click();await nav(page,'Conversation review').click()
  await expect(routing.getByText('Cross-channel monitoring sample',{exact:true})).toBeVisible();await expect(routing.getByText(savedPolicy.name,{exact:true})).toHaveCount(0)
  expect(await localData(page)).toEqual(before)
  await nav(page,'Settings').click();await page.getByRole('button',{name:'Connect to Genesys Cloud',exact:true}).click();await expect(page.getByLabel('Current role')).toHaveText('ADMIN');await nav(page,'Conversation review').click()
  await expect(routing.getByText(savedPolicy.name,{exact:true})).toBeVisible();await expect(routing.getByText('Cross-channel monitoring sample',{exact:true})).toHaveCount(0)
  expect(await localData(page)).toEqual(before);expect(state.errors).toEqual([]);await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close()
 })
 test(`shared saves, saved picker, dirty refresh and promotion ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page,'policies')
  await page.getByRole('button',{name:savedPolicy.name,exact:true}).click();await page.getByLabel('Policy name',{exact:true}).fill('Updated saved routing')
  state.failSave=true;await page.locator('.policy-detail').getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('alert')).toContainText('changed elsewhere');await expect(page.getByText('Unsaved changes',{exact:true})).toBeVisible()
  state.failSave=false;await page.locator('.policy-detail').getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByText('Unsaved changes',{exact:true})).toHaveCount(0)
  await nav(page,'Conversation review').click();await expect(page.locator('.match-list')).toContainText('Updated saved routing')
  state.forms.push(structuredClone(draftForm));await nav(page,'Evaluation Forms').click();await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('heading',{name:'Saved in AQM · 2 saved forms'})).toBeVisible()
  await page.getByRole('row').filter({hasText:draftForm.name}).click();const detail=page.locator('.form-detail')
  await detail.getByLabel('Form name',{exact:true}).fill('Unsaved saved form');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(detail.getByLabel('Form name',{exact:true})).toHaveValue('Unsaved saved form')
  state.fail='/api/forms';await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('alert')).toContainText('Saved forms unavailable');await expect(detail.getByLabel('Form name',{exact:true})).toHaveValue('Unsaved saved form')
  state.fail='';await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('alert')).toHaveCount(0)
  await detail.getByRole('button',{name:'Add reusable group',exact:true}).click();const picker=detail.getByRole('generic',{name:'Published reusable groups'})
  await expect(page.locator('.reusable-picker')).toContainText(savedGroup.name);await expect(page.locator('.reusable-picker').getByText(seedGroupAssets[0].name,{exact:true})).toHaveCount(0)
  state.failSave=true;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByRole('alert')).toContainText('Fixture save failed');await expect(detail.getByLabel('Form name',{exact:true})).toHaveValue('Unsaved saved form')
  state.failSave=false;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText('Unsaved changes',{exact:true})).toHaveCount(0)
  await detail.getByRole('button',{name:'Publish version',exact:true}).click();await expect(detail.getByLabel('Form name',{exact:true})).toHaveCount(0)
  await nav(page,'Policies').click();await page.getByRole('button',{name:'Updated saved routing',exact:true}).click();await expect(page.getByRole('checkbox',{name:/Unsaved saved form/})).toBeVisible()
  await nav(page,'Conversation review').click();await expect(page.getByLabel('Manual form selection').locator('option')).toHaveText([savedForm.name,'Unsaved saved form'])
  await nav(page,'Question Groups').click();await page.locator('.local-library > summary').click();await page.locator('.local-library').getByRole('button',{name:'Save as AQM draft',exact:true}).first().click()
  const group=page.locator('.asset-detail');await expect(group).toBeVisible();await expect(page.getByRole('heading',{name:'Saved in AQM · 2 saved groups'})).toBeVisible();await group.getByLabel('Reusable question group name',{exact:true}).fill('Imported group B');state.fail='/api/question-groups';await page.getByRole('button',{name:'Refresh saved groups'}).click();await expect(group.getByLabel('Reusable question group name',{exact:true})).toHaveValue('Imported group B');await expect(group.getByText('Unsaved changes',{exact:true})).toBeVisible();state.fail='';await page.getByRole('button',{name:'Refresh saved groups'}).click();await expect(page.getByRole('alert')).toHaveCount(0);await group.getByRole('button',{name:'Publish reusable question group',exact:true}).click();await expect(group.getByLabel('Reusable question group name',{exact:true})).not.toBeEditable()
  await nav(page,'Evaluation Forms').click();await page.getByRole('row').filter({hasText:'Unsaved saved form'}).click();await openActions(detail);await detail.getByRole('button',{name:'Edit as new version',exact:true}).click();await detail.getByRole('button',{name:'Add reusable group',exact:true}).click();await expect(page.locator('.reusable-picker')).toContainText('Imported group B')
  await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText('Unsaved changes',{exact:true})).toHaveCount(0)
  await page.screenshot({path:`${evidence}/picker-${viewport.width}.png`,fullPage:true})
  await page.getByRole('button',{name:'＋ New form',exact:true}).click();await detail.getByLabel('Form name',{exact:true}).fill('New explicitly saved draft')
  await detail.getByRole('button',{name:'Add question',exact:true}).click();await detail.getByLabel('Title',{exact:true}).fill('Valid question');await detail.getByLabel('Instructions / question').fill('Was it resolved?')
  const prior=state.forms.length;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(page.getByRole('heading',{name:`Saved in AQM · ${prior+1} saved forms`})).toBeVisible();await expect(page.locator('.local-library').getByRole('button',{name:'New explicitly saved draft',exact:true})).toHaveCount(0)
  expect(state.errors).toEqual([]);await context.close()
 })
 test(`saved endpoint failures and routing loading never show local matches ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page,'evaluate',true,'/api/policies')
  const routing=page.locator('.evaluation-card');await expect(routing.getByText('Saved routing unavailable',{exact:true})).toBeVisible();await expect(routing.getByRole('alert')).toContainText('Saved policy routing could not be loaded');await expect(routing.locator('.match-list')).toHaveCount(0);await expect(routing.getByLabel('Manual form selection').locator('option')).toHaveText([savedForm.name])
  await page.screenshot({path:`${evidence}/routing-failure-${viewport.width}.png`,fullPage:true})
  state.fail='/api/forms';await nav(page,'Evaluation Forms').click();await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('alert').filter({hasText:'Saved forms unavailable'})).toBeVisible();await nav(page,'Conversation review').click();await expect(routing.getByLabel('Manual form selection').locator('option')).toHaveCount(0)
  state.fail='/api/question-groups';await nav(page,'Question Groups').click();await page.getByRole('button',{name:'Refresh saved groups'}).click();await expect(page.getByRole('alert').filter({hasText:'Saved reusable question groups unavailable'})).toBeVisible()
  state.fail='';state.delay=true;await nav(page,'Policies').click();await page.getByRole('button',{name:'Refresh durable policies'}).click();await nav(page,'Conversation review').click();await expect(routing.getByRole('status').filter({hasText:'Loading saved routing'})).toBeVisible();await expect(routing.locator('.match-list')).toHaveCount(0)
  state.release();await expect(routing.getByText(savedPolicy.name,{exact:true})).toBeVisible();expect(state.writes).toEqual([]);expect(state.errors).toEqual([]);await context.close()
 })
}

test('exact voice criteria, missing saved pin, two saved forms and persistent working copies',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 const state=await fixture(page,'forms',true,'',true),before=await localData(page)
 state.forms.push(structuredClone(draftForm));state.policies[0].criteria.anyOf[0][0].value='voice'
 await page.getByRole('button',{name:'Refresh saved forms'}).click();await expect(page.getByRole('heading',{name:'Saved in AQM · 2 saved forms'})).toBeVisible()
 await expect(page.locator('.local-library > summary')).toHaveText('Local drafts & starter examples · 4 forms')
 await page.locator('.local-library > summary').click();await expect(page.locator('.local-library').getByText('Not saved in AQM',{exact:false})).not.toHaveCount(0)
 await page.getByRole('row').filter({hasText:draftForm.name}).click();await page.locator('.form-detail').getByLabel('Form name',{exact:true}).fill('Recovered working draft')
 page.once('dialog',d=>d.accept());await page.evaluate(()=>{sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fixture-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'forms'}))});await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`)
 await page.getByRole('row').filter({hasText:'Recovered working draft'}).click();await expect(page.locator('.form-detail').getByLabel('Form name',{exact:true})).toHaveValue('Recovered working draft');await expect(page.locator('.form-detail').getByText('Unsaved changes',{exact:true})).toBeVisible()
 await page.locator('.form-detail').getByRole('button',{name:'Save changes',exact:true}).click()
 await nav(page,'Conversation review').click();await expect(page.getByText('No saved policy matched.',{exact:false})).toBeVisible();await expect(page.locator('.match-list')).toHaveCount(0)
 await expect(page.getByLabel('Manual form selection').locator('option')).toHaveText([savedForm.name])
 await nav(page,'Conversations').click();await page.getByRole('combobox',{name:'Channel',exact:true}).selectOption('voice');await page.getByRole('row').filter({hasText:'syn-billing-dispute'}).click()
 await expect(page.locator('.match-list')).toContainText('Daily Voice Customer Service AQM');await expect(page.locator('.match-list')).not.toContainText('Customer Service Messaging');await expect(page.locator('.match-list')).not.toContainText('Cross-channel monitoring sample');await page.screenshot({path:`${evidence}/exact-voice-routing.png`,fullPage:true})
 state.policies[0].evaluationFormIds=['general_service'];await nav(page,'Policies').click();await page.getByRole('button',{name:'Refresh durable policies'}).click();await expect(page.getByRole('button',{name:'Refresh durable policies'})).toBeEnabled();await nav(page,'Conversation review').click()
 await expect(page.getByRole('alert')).toContainText('missing or non-operational saved forms: general_service');await expect(page.locator('.assignment')).toHaveCount(0)
 expect(await localData(page)).toEqual(before);expect(state.errors).toEqual([])
})

test('failed shared policy refresh retains dirty policy and separate schedule drafts',async({page})=>{
 const state=await fixture(page,'policies')
 await page.getByRole('button',{name:savedPolicy.name,exact:true}).click();const detail=page.locator('.policy-detail')
 await detail.getByLabel('Policy name',{exact:true}).fill('Keep this policy edit');await detail.getByLabel('Automation',{exact:true}).selectOption('DAILY')
 state.fail='/api/policies';page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Refresh durable policies'}).click()
 await expect(page.getByRole('alert')).toContainText('Saved policies unavailable');await expect(detail.getByLabel('Policy name',{exact:true})).toHaveValue('Keep this policy edit');await expect(detail.getByLabel('Automation',{exact:true})).toHaveValue('DAILY')
 await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible();await expect(detail.getByText('Unsaved schedule changes',{exact:true})).toBeVisible();await expect(detail.getByRole('button',{name:'Save changes',exact:true})).toBeDisabled()
 expect(state.writes).toEqual([]);expect(state.errors).toEqual([])
})
