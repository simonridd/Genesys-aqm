const { chromium } = require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs/promises');
const dir=__dirname;
(async()=>{
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const ctx=await browser.newContext({viewport:{width:1440,height:900}});await ctx.route('**/*',r=>{const u=new URL(r.request().url());return u.origin==='https://simonridd.github.io'&&u.pathname.startsWith('/Genesys-aqm/')&&r.request().method()==='GET'?r.continue():r.abort()});const page=await ctx.newPage();const requests=[];const observations=[];
await ctx.addInitScript(()=>{window.__writes=[];const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){window.__writes.push({kind:this===localStorage?'local':'session',key:k});return set.call(this,k,v)}});
page.on('request',r=>requests.push({url:r.url(),method:r.method(),type:r.resourceType()}));
await page.goto('https://simonridd.github.io/Genesys-aqm/');await page.getByRole('heading',{level:1}).waitFor();
async function capture(name){await page.getByRole('heading',{level:1}).waitFor();const text=await page.locator('body').innerText();const o={name,at:new Date().toISOString(),url:page.url(),text,storage:await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),writes:window.__writes}))};observations.push(o);await page.screenshot({path:dir+'/'+name+'.png',fullPage:true});console.log(JSON.stringify(o));await fs.writeFile(dir+'/blind-public.json',JSON.stringify({observations,requests},null,2));}
await capture('blind-welcome-1440');await page.getByRole('button',{name:'Take the guided demo →'}).click();await capture('blind-chapter-1-1440');
for(let i=2;i<=5;i++){const buttons=await page.getByRole('button').allTextContents();console.log('FORWARD_CHOICES',buttons);const next=page.getByRole('button',{name:/^(Next|Continue)/i});if(await next.count()!==1)break;await next.click();await capture('blind-chapter-'+i+'-1440');}
await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
