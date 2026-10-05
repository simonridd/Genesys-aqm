import {test,expect,type Page} from '@playwright/test'
import {mkdirSync,writeFileSync} from 'node:fs'
import {usabilityFixture,keyboardTo} from './usability-fixture'
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4178/Genesys-aqm/'
const out=process.env.AQM_RETURNING_EVIDENCE??'docs/v0211-evidence/local'
const key='genesys-aqm-welcome-seen-v1'
mkdirSync(out,{recursive:true})
const welcome=(p:Page)=>p.getByRole('heading',{name:'More conversations understood. Less manual scoring.'})
const conversations=(p:Page)=>p.getByRole('heading',{name:'Conversations',exact:true})
async function isolated(p:Page){
 const denied:string[]=[],errors:string[]=[]
 p.on('pageerror',e=>errors.push(e.message))
 await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(app).origin&&r.request().method()==='GET'&&!u.pathname.includes('/api/'))return r.continue();denied.push(r.request().method()+' '+u.origin+u.pathname);return r.abort()})
 return {denied,errors}
}
async function capture(p:Page,name:string){
 await p.screenshot({animations:'disabled',path:`${out}/${name}.png`})
 const storage=await p.evaluate(async()=>({localKeys:Object.keys(localStorage).sort(),welcomeSeen:localStorage.getItem('genesys-aqm-welcome-seen-v1'),sessionKeys:Object.keys(sessionStorage).sort(),indexedDB:await indexedDB.databases()}))
 writeFileSync(`${out}/${name}.json`,JSON.stringify({url:p.url(),viewport:p.viewportSize(),aria:await p.locator('main').ariaSnapshot(),storage,historyLength:await p.evaluate(()=>history.length),overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)},null,2))
 expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 return storage
}
for(const size of [{width:1440,height:900},{width:390,height:844},{width:1920,height:1080},{width:1440,height:720}])test(`first, returning, explicit, About and history ${size.width}x${size.height}`,async({page})=>{
 await page.setViewportSize(size);const proof=await isolated(page)
 await page.addInitScript(()=>{(window as any).welcomeMounts=0;new MutationObserver(()=>{if(document.querySelector('.welcome'))(window as any).welcomeMounts++}).observe(document,{childList:true,subtree:true})})
 await page.goto(app);await expect(welcome(page)).toBeVisible()
 expect(await capture(page,`first-${size.width}x${size.height}`)).toEqual({localKeys:[key],welcomeSeen:'1',sessionKeys:[],indexedDB:[]})
 const length=await page.evaluate(()=>history.length)
 await page.getByRole('button',{name:'Take the guided demo →',exact:true}).click();await expect(page.getByText('Chapter 1 of 5',{exact:true})).toBeVisible()
 await page.goBack();await expect(conversations(page)).toBeVisible();await expect(page.locator('.showcase-handoff')).toHaveCount(0)
 await page.goForward();await expect(page.getByText('Chapter 1 of 5',{exact:true})).toBeVisible()
 expect(await page.evaluate(()=>history.length)).toBe(length+1)
 await page.goto(app);await expect(conversations(page)).toBeVisible()
 expect(await page.evaluate(()=>(window as any).welcomeMounts)).toBe(0)
 await expect(welcome(page)).toHaveCount(0);await expect(page.locator('.showcase-handoff')).toHaveCount(0);await expect(page).not.toHaveURL(/entry=showcase/)
 await expect(page.locator('.source-selector')).toContainText('Synthetic')
 await expect(page.locator('thead th').first()).toContainText('Scenario');await expect(page.locator('tbody')).toContainText('Incomplete resolution');await expect(page.locator('tbody')).not.toContainText('syn-')
 await capture(page,`returning-${size.width}x${size.height}`)
 await page.reload();await expect(conversations(page)).toBeVisible();expect(await page.evaluate(()=>(window as any).welcomeMounts)).toBe(0)
 const about=page.getByRole('button',{name:'About / product tour',exact:true})
 await keyboardTo(page,about);await page.keyboard.press('Enter');await expect(welcome(page)).toBeVisible();await expect(page).toHaveURL(/page=welcome/)
 await expect(page.getByRole('button',{name:'Take the guided demo →',exact:true})).toBeVisible();await expect(page.getByText('$16.80/month',{exact:true})).toBeVisible()
 await capture(page,`about-${size.width}x${size.height}`)
 await page.goBack();await expect(conversations(page)).toBeVisible();await page.goForward();await expect(welcome(page)).toBeVisible()
 await page.goto(app+'?page=welcome');await expect(welcome(page)).toBeVisible();expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe('1')
 await capture(page,`explicit-${size.width}x${size.height}`)
 await page.getByRole('link',{name:'IPI AQM home',exact:true}).click();await expect(welcome(page)).toBeVisible();await expect(page).toHaveURL(/page=welcome/)
 expect(proof.denied).toEqual([]);expect(proof.errors).toEqual([])
 writeFileSync(`${out}/network-${size.width}x${size.height}.json`,JSON.stringify(proof,null,2))
})
test('clearing preference restores Welcome; unavailable read/write stays safe',async({page})=>{
 const proof=await isolated(page);await page.goto(app);await expect(welcome(page)).toBeVisible()
 await page.evaluate(()=>localStorage.clear());await page.goto(app);await expect(welcome(page)).toBeVisible()
 await page.addInitScript(()=>{Storage.prototype.getItem=function(){throw Error('read blocked')};Storage.prototype.setItem=function(){throw Error('write blocked')}})
 await page.goto(app);await expect(welcome(page)).toBeVisible();await page.reload();await expect(welcome(page)).toBeVisible()
 expect(proof.denied).toEqual([]);expect(proof.errors).toEqual([])
})
for(const width of [1440,390])test(`connected bare SPA destination and OAuth destination ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:900})
 const f=await usabilityFixture(page,'ADMIN','page=evaluations');await expect(page.getByRole('heading',{name:'Evaluations',exact:true})).toBeVisible()
 await page.getByRole('button',{name:'About / product tour',exact:true}).click();await expect(welcome(page)).toBeVisible()
 await page.evaluate(()=>{history.pushState(null,'',location.pathname);dispatchEvent(new PopStateEvent('popstate'))})
 await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();await expect(page).not.toHaveURL(/page=/);await expect(page.locator('.showcase-handoff')).toHaveCount(0)
 await capture(page,`connected-bare-${width}`)
 await page.getByRole('button',{name:'About / product tour',exact:true}).click();await expect(welcome(page)).toBeVisible()
 await page.getByRole('button',{name:'Open AQM',exact:true}).first().click();await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();await expect(page).toHaveURL(/page=automation/)
 expect(f.errors).toEqual([])
 writeFileSync(`${out}/connected-network-${width}.json`,JSON.stringify({fixture:'fictional OAuth and GET-only APIs',requests:f.requests.map(u=>u.origin+u.pathname),errors:f.errors},null,2))
})
