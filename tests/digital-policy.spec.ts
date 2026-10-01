import {test,expect} from '@playwright/test'
import {seedForms} from '../src/domain/forms'
const appUrl=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/'
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}])test(`email and messaging policy channel plans at ${viewport.width}`,async({browser})=>{
 const page=await browser.newPage({viewport})
 await page.addInitScript(forms=>{localStorage.setItem('genesys-aqm-v02-forms',JSON.stringify(forms));localStorage.setItem('genesys-aqm-v02-policies',JSON.stringify(['email','messaging'].map(channel=>({id:channel,name:`${channel} policy`,description:'Provider-free digital filtering',enabled:true,criteria:{anyOf:[[{field:'channel',operator:'equals',value:channel}]]},evaluationFormIds:[forms[0].id],sampling:{strategy:'all'},schedule:'manual'}))))},seedForms)
 await page.route('https://api.typesafe.ai/**',()=>{throw Error('No live Jev request authorized')})
 await page.goto(appUrl)
 const nav=page.getByRole('navigation',{name:'Primary navigation'})
 await nav.getByRole('button',{name:'Policies',exact:true}).click()
 await page.getByText('Legacy browser policy sandbox (local development)',{exact:true}).click()
 for(const channel of ['email','messaging']){
  await page.getByRole('combobox',{name:'Policy',exact:true}).selectOption(channel)
  await page.getByRole('combobox',{name:'Channel',exact:true}).selectOption(channel)
  await page.getByRole('button',{name:'Build monitoring plan',exact:true}).click()
  if(channel==='email')await expect(page.getByText('Inspect sampled interactions (0)',{exact:true})).toBeVisible()
  else await expect(page.locator('.sampled-list > div').first()).toBeVisible()
  for(const row of await page.locator('.sampled-list > div').all())await expect(row).toContainText(`· ${channel}`)
  await expect(page.locator('.run-preview')).toContainText('PLAN ONLY')
 }
 await page.screenshot({path:`/private/tmp/aqm-v09-policy-${viewport.width}.png`,fullPage:true})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
 await page.close()
})
