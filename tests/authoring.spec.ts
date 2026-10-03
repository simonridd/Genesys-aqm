import type { Locator } from '@playwright/test'
async function openActions(detail:Locator){const disclosure=detail.locator('.more-actions');if(await disclosure.getAttribute('open')===null)await disclosure.locator('summary').click()}
import {test,expect} from '@playwright/test'
import {installOwnerGovernanceFixture} from './governanceFixture'
import {seedForms} from '../src/domain/forms'
import {seedGroupAssets} from '../src/domain/seedGroupAssets'
import {cloneForm,importDefinition} from '../src/domain/portability'
import type {EvaluationForm,QuestionGroupAsset} from '../src/domain/types'
import {readFileSync} from 'node:fs'
const origin='https://aqm-api-bd54ukouga-nw.a.run.app',app='http://127.0.0.1:4174/Genesys-aqm/'
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])test(`authoring productivity and portability at ${viewport.width}`,async({browser})=>{
 test.setTimeout(30000)
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 const source:EvaluationForm={...structuredClone(seedForms[0]),id:'published',familyId:'family',name:'Published fixture',status:'PUBLISHED',enabled:true,groups:[{id:'general',name:'General'}],questions:seedForms[0].questions.slice(0,3).map(q=>({...structuredClone(q),groupId:'general'}))};source.questions[1].condition={kind:'question_outcome',questionId:source.questions[0].id,outcomes:['yes']}
 let forms=[source],assets:QuestionGroupAsset[]=[structuredClone(seedGroupAssets[0])],counter=0,failSave=false,saves=0
 await page.addInitScript(()=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:'forms'})))
 await page.route('https://login.mypurecloud.ie/oauth/token',r=>r.fulfill({json:{access_token:'fixture-token',token_type:'Bearer',expires_in:3600}}))
 await page.route('https://api.mypurecloud.ie/**',r=>r.fulfill({json:{id:'fixture-user',name:'Fixture'}}))
 await page.route('https://api.typesafe.ai/**',()=>{throw Error('No Jev calls')})
 await page.route(`${origin}/**`,async r=>{const url=new URL(r.request().url()),method=r.request().method(),path=url.pathname
  if(path==='/api/forms'&&method==='GET')return r.fulfill({json:{items:forms}})
  if(path==='/api/question-groups'&&method==='GET')return r.fulfill({json:{items:assets}})
  if(method==='POST'&&(path.endsWith('/clone')||path.endsWith('/import'))){const id=`import_${++counter}`,now=new Date().toISOString();if(path.startsWith('/api/forms/')){const item=path.endsWith('/clone')?cloneForm(forms.find(f=>f.id===path.split('/')[3])!,id,now):importDefinition('form',r.request().postDataJSON(),id,now);forms.push(item);return r.fulfill({json:{item}})}const item=importDefinition('group',r.request().postDataJSON(),id,now);assets.push(item);return r.fulfill({json:{item}})}
  if(path.startsWith('/api/forms/')&&method==='PUT'){saves++;if(failSave)return r.fulfill({status:503,json:{error:'Fixture save unavailable'}});const item=r.request().postDataJSON();forms=[...forms.filter(f=>f.id!==item.id),item];return r.fulfill({json:{item}})}
  if(path==='/api/analytics')return r.fulfill({json:{byForm:[]}})
  return r.fulfill({json:{items:[]}})
 })
 await installOwnerGovernanceFixture(page);await page.goto(`${app}?code=fixture&state=${'A'.repeat(43)}`)
 await expect(page.getByRole('heading',{name:'Evaluation Forms',exact:true})).toBeVisible()
 await page.getByRole('row').filter({hasText:'Published fixture'}).click()
 const detail=page.locator('.form-detail')
 await expect(detail.getByRole('button',{name:'Enable selected'})).toHaveCount(0)
 await openActions(detail);await detail.getByRole('button',{name:'Duplicate as new form'}).click()
 await expect(detail.getByLabel('Form name',{exact:true})).toHaveValue('Copy of Published fixture')
 await detail.getByLabel('Form name',{exact:true}).fill('Edited clone')
 await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
 page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Settings',exact:true}).click();await expect(page.getByRole('heading',{name:'Evaluation Forms',exact:true})).toBeVisible()
 failSave=true;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByRole('alert')).toContainText('Fixture save unavailable');await expect(detail.getByText('Unsaved changes',{exact:true})).toBeVisible()
 failSave=false;await detail.getByRole('button',{name:'Save changes',exact:true}).click();await expect(detail.getByText(/^Saved /)).toBeVisible();expect(saves).toBe(2)
 await detail.locator('.group-details>summary').first().click();await detail.getByRole('button',{name:'Duplicate group',exact:true}).click();await expect(detail.getByRole('region',{name:'Group: General Copy',exact:true})).toBeVisible()
 const copy=detail.getByRole('region',{name:'Group: General Copy',exact:true})
 await copy.locator('.question-card').last().getByRole('button',{name:'Edit',exact:true}).click();await copy.locator('.question-card').last().locator('.authoring-disclosure>summary').click();await copy.getByRole('button',{name:'Duplicate',exact:true}).last().click();await expect(copy.locator('.question-card')).toHaveCount(4)
 await copy.locator('.group-details>summary').click();await copy.getByRole('button',{name:'Select all in group'}).click();await detail.getByRole('button',{name:'Disable selected'}).click();await expect(copy.locator('.question-card.disabled')).toHaveCount(4)
 await detail.getByRole('button',{name:'Enable selected'}).click();await expect(copy.locator('.question-card.disabled')).toHaveCount(0)
 await detail.getByLabel('Bulk target group').selectOption('general');await detail.getByRole('button',{name:'Move selected to group'}).click();await expect(copy.locator('.question-card')).toHaveCount(0)
 const first=detail.locator('.question-card').first();await first.getByRole('button',{name:'Edit',exact:true}).click();await first.getByRole('button',{name:'Delete question',exact:true}).click();await expect(detail.getByRole('alert')).toContainText('dependencies')
 await detail.getByRole('button',{name:'Save changes',exact:true}).click()
 await page.getByLabel('Library status').selectOption('PUBLISHED');await expect(page.getByRole('row').filter({hasText:'Edited clone'})).toHaveCount(0);await page.getByLabel('Library status').selectOption('All')
 await page.getByLabel('Library version').selectOption('latest');await page.getByLabel('Library usage').selectOption('Unused');await page.locator('.operational-table-wrap:visible').first().getByLabel('Search table').fill('Edited clone');await expect(page.getByRole('row').filter({hasText:'Published fixture'})).toHaveCount(0);await page.locator('.operational-table-wrap:visible').first().getByLabel('Search table').fill('')
 await detail.locator('.form-meta').screenshot({path:`/private/tmp/aqm-v013-meta-${viewport.width}.png`})
 await detail.screenshot({path:`/private/tmp/aqm-v013-form-${viewport.width}.png`})
 const downloadPromise=page.waitForEvent('download');await openActions(detail);await detail.getByRole('button',{name:'Export JSON',exact:true}).click();const download=await downloadPromise,path=await download.path();const data=readFileSync(path!);expect(JSON.parse(data.toString()).schemaVersion).toBe(1)
 await page.getByLabel('Import form',{exact:true}).setInputFiles({name:'form.json',mimeType:'application/json',buffer:data});await expect(detail.getByText('DRAFT · VERSION 1')).toBeVisible();expect(forms.at(-1)?.enabled).toBe(false)
 const nav=page.getByRole('navigation',{name:'Primary navigation'});await nav.getByRole('button',{name:'Question Groups',exact:true}).click();await expect(page.getByRole('heading',{name:'Question Groups',exact:true})).toBeVisible();await page.getByLabel('Library status').selectOption('PUBLISHED');await page.getByLabel('Library version').selectOption('latest');await page.getByLabel('Library usage').selectOption('Unused');await page.getByRole('row').filter({hasText:assets[0].name}).click()
 const groupDownload=page.waitForEvent('download');await page.locator('.asset-detail').getByRole('button',{name:'Export JSON'}).click();const groupData=readFileSync((await(await groupDownload).path())!);await page.getByLabel('Import reusable group',{exact:true}).setInputFiles({name:'group.json',mimeType:'application/json',buffer:groupData});await expect(page.locator('.asset-detail h2').first()).toContainText('DRAFT');expect(assets.at(-1)?.status).toBe('DRAFT')
 await page.screenshot({path:`/private/tmp/aqm-v013-${viewport.width}.png`,fullPage:true});expect(errors).toEqual([]);await context.close()
})
test('offline draft stays browser-local',async({page})=>{await page.goto(`${app}?page=forms`);await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Evaluation Forms',exact:true}).click();await page.getByRole('button',{name:'＋ New form',exact:true}).click();await page.locator('.form-detail').getByLabel('Form name',{exact:true}).fill('Browser draft');await expect(page.getByText('Saved in this browser',{exact:true})).toBeVisible();await page.reload();await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:'Evaluation Forms',exact:true}).click();await expect(page.getByRole('row').filter({hasText:'Browser draft'})).toBeVisible()})
