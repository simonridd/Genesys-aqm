import {test,expect,type Page} from '@playwright/test'
import {defaultGovernance,rolePermissions,type Role} from '../src/domain/governance'
import {seedForms} from '../src/domain/forms'
import {seedPolicies} from '../src/domain/policies'
import {overviewBrowserFixture} from './overviewFixture'
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/',origin='https://aqm-api-bd54ukouga-nw.a.run.app'
async function fixture(page:Page,role:Role='ADMIN',stage=0){
 const state={settings:structuredClone(defaultGovernance),requests:[] as {path:string,method:string,body:any}[],errors:[] as string[]}
 page.on('pageerror',e=>state.errors.push(e.message))
 await page.addInitScript(()=>{if(!sessionStorage.getItem('genesys-aqm-pkce-transaction'))sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'public-client-id',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'settings',settingsSection:'connection'}))})
 const overview=await overviewBrowserFixture(),forms=stage>=1?[seedForms[0]]:[],policies=stage>=2?[{...seedPolicies[0],evaluationFormIds:[seedForms[0].id]}]:[],schedules=stage>=3?[{id:'s',policyId:policies[0].id,enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'08:00',version:1}]:[]
 if(stage>=4)overview.lastAutomatedRun={complete:true,data:{id:'run',policyId:policies[0].id,policyName:policies[0].name,status:'completed',trigger:'scheduled',startedAt:'2026-10-02T12:00:00Z',evaluationsSucceeded:1,evaluationsFailed:0}}
 await page.route('**/*',async r=>{
  const url=new URL(r.request().url()),path=url.pathname,method=r.request().method()
  if(url.origin===new URL(app).origin)return r.continue()
  if(url.origin==='https://login.mypurecloud.ie'&&path==='/oauth/token')return r.fulfill({json:{access_token:'fictional',token_type:'Bearer',expires_in:3600}})
  if(url.origin==='https://api.mypurecloud.ie'&&path==='/api/v2/users/me')return r.fulfill({json:{id:'fixture',organization:{id:'fixture'}}})
  if(url.origin!==origin)return r.abort()
  state.requests.push({path,method,body:r.request().postData()?r.request().postDataJSON():undefined})
  if(path==='/api/session')return r.fulfill({json:{actor:{userId:'fixture'},role,permissions:rolePermissions[role]}})
  if(path==='/api/governance'){if(method==='PUT')state.settings=r.request().postDataJSON();return r.fulfill({json:state.settings})}
  if(path==='/api/forms')return r.fulfill({json:{items:forms}})
  if(path==='/api/policies')return r.fulfill({json:{items:policies}})
  if(path==='/api/schedules')return r.fulfill({json:{items:schedules}})
  if(path==='/api/overview')return r.fulfill({json:overview})
  if(path==='/api/retention/preview')return r.fulfill({json:{id:'plan',counts:{evaluations:0},scanned:0,complete:true,continuation:{}}})
  if(path==='/api/review-sla/refresh')return r.fulfill({json:{complete:true,open:0}})
  if(method!=='GET')throw Error(`Unexpected write ${method} ${path}`)
  return r.fulfill({json:{items:[]}})
 })
 await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role);return state
}
const section=(page:Page,name:string)=>page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name,exact:true})
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
 test(`first use and connection routes at ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),external:string[]=[]
  await page.route('**/*',r=>{if(new URL(r.request().url()).origin===new URL(app).origin)return r.continue();if(!new URL(r.request().url()).hostname.endsWith('googleapis.com'))external.push(r.request().url());return r.abort()})
  await page.goto(app);const intro=page.getByRole('region',{name:'Welcome to Genesys AQM'});await expect(intro).toContainText('quality and coverage');await expect(intro).toContainText('Fictional');await expect(intro).toContainText('can issue AI requests')
  await page.screenshot({path:`docs/v018d-evidence/first-use-${viewport.width}.png`,fullPage:true})
  await intro.getByRole('button',{name:'Explore sample conversations'}).click();await expect(page.getByRole('row').nth(1)).toBeVisible();expect(external).toEqual([])
  await intro.getByRole('button',{name:'Connect Genesys Cloud',exact:true}).click();await expect(page).toHaveURL(/page=settings&settingsSection=connection/);await expect(page.getByLabel('OAuth Client ID')).toBeVisible();expect(external).toEqual([])
  await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Conversations',exact:true}).click();await page.getByRole('button',{name:'Genesys Cloud',exact:true}).click();await page.getByRole('button',{name:'Connection settings →',exact:true}).click();await expect(page).toHaveURL(/settingsSection=connection/)
  await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Conversation review',exact:true}).click();await page.getByRole('button',{name:'Connect to Genesys Cloud →'}).click();await expect(page).toHaveURL(/settingsSection=connection/)
  await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Evaluation Forms',exact:true}).click();await page.getByRole('button',{name:'＋ New form',exact:true}).click();await page.locator('#form-test').getByRole('button',{name:'Test form',exact:true}).click();await expect(page).toHaveURL(/settingsSection=connection/)
  expect(external).toEqual([]);await context.close()
 })
 test(`shared governance settings survive sections at ${viewport.width}`,async({browser})=>{
  const context=await browser.newContext({viewport}),page=await context.newPage(),state=await fixture(page)
  await expect(page.getByRole('heading',{level:1})).toHaveText('Settings');await expect(page.getByLabel('OAuth Client ID')).toBeVisible();await page.screenshot({path:`docs/v018d-evidence/connection-${viewport.width}.png`,fullPage:true})
  await section(page,'Reviews').click();await expect(page.locator('#settings-section-heading')).toBeFocused();await page.getByLabel('Due soon hours',{exact:true}).fill('12')
  await section(page,'Privacy & retention').click();await page.getByLabel('Evaluation retention days',{exact:true}).fill('2');await expect(page.getByRole('status').filter({hasText:'Unsaved settings:'})).toHaveText('Unsaved settings: Reviews, Privacy & retention');await expect(page.getByRole('button',{name:'Preview retention',exact:true})).toBeDisabled()
  await page.screenshot({path:`docs/v018d-evidence/privacy-${viewport.width}.png`,fullPage:true});await section(page,'Reviews').click();await expect(page.getByLabel('Due soon hours',{exact:true})).toHaveValue('12');await expect(page.getByRole('button',{name:'Refresh review SLA state'})).toBeDisabled()
  await section(page,'Connection').click();await expect(page.getByRole('status').filter({hasText:'Unsaved settings:'})).toBeVisible();let dialogs=0;page.on('dialog',d=>{dialogs++;void d.dismiss()});await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Overview',exact:true}).click();expect(dialogs).toBe(1);await expect(page.getByRole('heading',{level:1})).toHaveText('Settings');page.removeAllListeners('dialog')
  await page.getByRole('button',{name:'Save all settings',exact:true}).click();await expect(page.getByText('All governance settings saved. No data deleted.')).toBeVisible();expect(state.settings.reviewSla.dueSoonHours).toBe(12);expect(state.settings.evaluationRetentionDays).toBe(2)
  await section(page,'Reviews').click();await page.getByLabel('Due soon hours',{exact:true}).fill('15');await section(page,'Privacy & retention').click();await page.getByLabel('Evaluation retention days',{exact:true}).fill('5');await page.getByRole('button',{name:'Discard changes'}).click();await expect(page.getByLabel('Evaluation retention days',{exact:true})).toHaveValue('2');await section(page,'Reviews').click();await expect(page.getByLabel('Due soon hours',{exact:true})).toHaveValue('12')
  for(const name of ['Notifications','Audit']){await section(page,name).click();await page.screenshot({path:`docs/v018d-evidence/${name.toLowerCase()}-${viewport.width}.png`,fullPage:true});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
  expect(state.errors).toEqual([]);await context.close()
 })
}
for(const role of ['ADMIN','AUTHOR','REVIEWER','VIEWER'] as Role[])test(`coherent Settings for ${role}`,async({page})=>{
 const state=await fixture(page,role);await expect(page.getByRole('heading',{level:1})).toHaveCount(1);await expect(section(page,'Connection')).toHaveAttribute('aria-current','location')
 await section(page,'Access').click();await expect(page.getByRole('button',{name:'Assign role',exact:true})).toHaveCount(role==='ADMIN'?1:0)
 await section(page,'Reviews').click();await expect(page.getByLabel('Due soon hours',{exact:true})).toHaveCount(role==='ADMIN'?1:0)
 await section(page,'Privacy & retention').click();await expect(page.getByRole('button',{name:'Preview retention',exact:true})).toHaveCount(role==='ADMIN'?1:0)
 await expect(section(page,'Notifications')).toHaveCount(['ADMIN','AUTHOR'].includes(role)?1:0);await expect(section(page,'Audit')).toHaveCount(role==='ADMIN'?1:0);expect(state.errors).toEqual([])
})
for(let stage=0;stage<=4;stage++)test(`saved setup stage ${stage}`,async({page})=>{
 await fixture(page,'ADMIN',stage);await page.getByRole('button',{name:'Open Overview',exact:true}).click();const list=page.getByRole('region',{name:'Set up automated quality monitoring'})
 if(stage===4){await expect(list).toHaveCount(0);return}await expect(list).toBeVisible();await expect(list.getByLabel('Complete',{exact:true})).toHaveCount(stage)
 if(stage===0){await list.getByRole('button',{name:'Publish an evaluation form →'}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Evaluation Forms')}
 if(stage===2){await list.getByRole('button',{name:'Configure and enable a daily or weekly schedule →'}).click();await expect(page).toHaveURL(/policyId=service_messaging/)}
})
test('OAuth error returns to Connection with visible error',async({page})=>{await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(app).origin?r.continue():r.abort());await page.goto(`${app}?page=settings&settingsSection=audit&error=access_denied`);await expect(page).toHaveURL(/settingsSection=connection/);await expect(page.getByRole('alert')).toContainText('Genesys login could not be completed')})
for(const [value,label] of [['','Connection'],['invalid','Connection'],['connection','Connection'],['access','Access'],['reviews','Reviews'],['privacy','Privacy & retention'],['notifications','Notifications'],['audit','Audit']])test(`Settings deep link ${value||'default'}`,async({page})=>{
 await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(app).origin?r.continue():r.abort());await page.goto(`${app}?page=settings&settingsSection=${value}`);await expect(page.locator('#settings-section-heading')).toHaveText(label);await expect(page.locator('#settings-section-heading')).toBeFocused();await expect(page.getByRole('heading',{level:1})).toHaveText('Settings');await expect(section(page,label)).toHaveAttribute('aria-current','location')
})
for(const failure of [false,true])test(`explicit fixture Connect → callback ${failure?'failure':'success'}`,async({page})=>{
 await fixture(page);await page.getByRole('button',{name:'Disconnect',exact:true}).click()
 await page.route('https://login.mypurecloud.ie/oauth/authorize**',r=>{const url=new URL(r.request().url());return r.fulfill({contentType:'text/html',body:`<script>location.href=${JSON.stringify(`${app}?${failure?'error=access_denied':'code=fixture'}&state=${url.searchParams.get('state')}`)}</script>`})})
 await page.getByRole('button',{name:'Connect to Genesys Cloud',exact:true}).click();await expect(page).toHaveURL(/page=settings&settingsSection=connection/)
 if(failure)await expect(page.getByRole('alert')).toContainText('Genesys login could not be completed');else {await expect(page.getByText('Connected',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Open Overview',exact:true})).toBeVisible()}
})
