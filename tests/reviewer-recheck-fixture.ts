import {expect,type Page} from '@playwright/test'
import {buildSync} from 'esbuild'
import {fileURLToPath} from 'node:url'
import {mkdirSync,appendFileSync,writeFileSync} from 'node:fs'
import type {AddressInfo} from 'node:net'
import genesysDetail from '../src/fixtures/genesys-detail.json' with {type:'json'}
import genesysTranscript from '../src/fixtures/genesys-transcript.json' with {type:'json'}
const generated=new URL('./.generated/reviewer-recheck-api.mjs',import.meta.url)
buildSync({entryPoints:[fileURLToPath(new URL('./reviewer-recheck-api.ts',import.meta.url))],outfile:fileURLToPath(generated),bundle:true,platform:'node',format:'esm',packages:'external'})
const apiModule=await import(generated.href) as typeof import('./reviewer-recheck-api')
const {createApi,investigationFixture,investigationNow,overviewFixture,MemoryStore,seedForms,seedGroupAssets,seedAnswerSets,nextAnswerSetVersion,transitionAnswerSet,applyAnswerSet,sampleLibrary}=apiModule
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/',api='https://aqm-api-bd54ukouga-nw.a.run.app',out='docs/v019a-evidence/recheck'
mkdirSync(out,{recursive:true})
const nav=(page:Page,name:string)=>page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name,exact:true})
export async function fixture(page:Page,role='ADMIN',state='attention',start='automation'){
 const store=state==='empty'?new MemoryStore():state==='healthy'?await overviewFixture(false):await investigationFixture()
 if(state!=='empty'){
  for(const policy of await store.policies())await store.putPolicy({...policy,description:'Evaluate a controlled selection of completed customer-care calls.',criteria:{anyOf:[[{field:'channel',operator:'equals',value:'voice'}]]},sampling:{strategy:'percentage',percentage:50}})
  let index=0;for(const record of await store.evaluations())await store.putEvaluation({...record,conversationId:`22222222-2222-4222-8222-${String(++index).padStart(12,'0')}`,agent:{...record.agent,name:record.agent.name.endsWith('extra')?'Jordan Ellis':'Alex Morgan'}})
  for(const a of seedAnswerSets){await store.putAnswerSet({...a,status:'DRAFT'});await store.putAnswerSet(a)}
  const a=seedAnswerSets[1],v2=nextAnswerSetVersion(a,[a],investigationNow)
  v2.options[0].label='Completely clear';v2.options[0].credit=.9;v2.options=v2.options.slice().reverse();v2.options.push({key:'na',label:'Not applicable',description:'Outside this question',credit:undefined})
  await store.putAnswerSet(v2);await store.putAnswerSet(transitionAnswerSet(v2,'PUBLISHED',investigationNow))
  const base={...structuredClone(seedForms[0]),id:'clarity_draft',familyId:'clarity_draft',name:'Resolution clarity form',status:'DRAFT' as const,enabled:false,groups:[{id:'resolution',name:'Resolution'}],questions:[{id:'clarity',title:'Was the resolution clear?',instructions:'Assess whether the customer understood the resolution.',groupId:'resolution',type:'choice' as const,options:structuredClone(a.options),weight:1,enabled:true}]}
  await store.putForm(base)
  const attached=applyAnswerSet({...base,id:'attached',familyId:'attached',name:'Attached resolution form'},'clarity',a);await store.putForm(attached)
  const blocked=applyAnswerSet({...base,id:'blocked',familyId:'blocked',name:'Conditional resolution form'},'clarity',a)
  blocked.questions.push({...base.questions[0],id:'followup',title:'Clarify partial resolution',type:'noul',options:[],condition:{kind:'question_outcome',questionId:'clarity',outcomes:['partly_clear']}})
  await store.putForm(blocked)
  for(const g of seedGroupAssets)await store.putGroupAsset(g)
 }
 const roleAssignments=['AUTHOR','REVIEWER','VIEWER']
 for(const r of roleAssignments)await store.atomic([{collection:'roleAssignments',id:r.toLowerCase(),expected:undefined,value:{id:r.toLowerCase(),userId:r.toLowerCase(),displayName:r==='REVIEWER'?'Alex Reviewer':r.toLowerCase(),role:r}}])
 page.setDefaultTimeout(10000);const user=role==='ADMIN'?'admin':role.toLowerCase(),requests:any[]=[],errors:string[]=[],blocked:string[]=[],failures=new Map<string,{status:number,error:string}>()
 // Attention reviews belong to admin in the base fixture. Give this fictional reviewer the same workload.
 if(role==='REVIEWER')for(const e of await store.evaluations()){const review=await store.review(e.id);if(review?.assignment?.assignee.userId==='admin')await store.writeReviews([{review:{...review,revision:review.revision+1,assignment:{...review.assignment,assignee:{userId:'reviewer',displayName:'Alex Reviewer'}}},expectedRevision:review.revision}])}
 const server=createApi({store,now:()=>new Date(investigationNow),genesys:{list:async()=>{throw Error('Live provider forbidden')},load:async()=>{throw Error('Live provider forbidden')},withQueueNames:async c=>c},jev:{evaluate:async()=>{throw Error('Live Jev forbidden')}}},{origin:new URL(app).origin,region:'eu-west-1',allowedUserIds:new Set(['admin','author','reviewer','viewer']),bootstrapAdminId:'admin',schedulerEmail:'fictional',schedulerAudience:'https://fictional.invalid'},async()=>new Response(JSON.stringify({id:user,name:role==='ADMIN'?'Morgan Quality Lead':role==='REVIEWER'?'Alex Reviewer':'Sam Author'})))
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const local=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
 page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date(investigationNow)})
 await page.addInitScript(({start})=>sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fictional-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:start})),{start})
 await page.route('**/*',async route=>{
  const r=route.request(),u=new URL(r.url()),key=r.method()+' '+u.pathname
  if(u.origin===new URL(app).origin)return route.continue()
  if(u.origin==='https://login.mypurecloud.ie'&&u.pathname==='/oauth/token')return route.fulfill({json:{access_token:'fictional-token',token_type:'Bearer',expires_in:3600}})
  if(u.origin==='https://api.mypurecloud.ie'&&u.pathname==='/api/v2/users/me')return route.fulfill({json:{id:user,name:'Fictional '+role,organization:{id:'fictional-org'}}})
  if(u.origin==='https://api.mypurecloud.ie'){
   const detail=structuredClone(genesysDetail);detail.participants[0].participantName='Maya Patel';detail.participants[1].participantName='Alex Morgan';
   if(u.pathname.includes('/details/query'))return route.fulfill({json:{conversations:[detail],totalHits:1}})
   if(u.pathname.endsWith('/details')){detail.conversationId=u.pathname.split('/')[5];return route.fulfill({json:detail})}
   if(u.pathname.endsWith('/transcripturl'))return route.fulfill({json:{url:'https://api-downloads.mypurecloud.ie/transcriptsCache/fictional'}})
   if(u.pathname.startsWith('/api/v2/routing/queues/'))return route.fulfill({json:{name:'Customer care'}})
  }
  if(u.origin==='https://api-downloads.mypurecloud.ie'&&u.pathname==='/transcriptsCache/fictional')return route.fulfill({json:genesysTranscript})
  if(u.origin!==api){blocked.push(r.url());return route.abort()}
  requests.push({path:u.pathname,query:u.search,method:r.method()})
  if(failures.has(key))return route.fulfill({status:failures.get(key)!.status,json:{error:failures.get(key)!.error}})
  const response=await fetch(local+u.pathname+u.search,{method:r.method(),headers:{Authorization:'Bearer fictional-token','Content-Type':'application/json'},body:r.postData()??undefined})
  return route.fulfill({status:response.status,body:await response.text(),contentType:'application/json'})
 })
 await page.goto(`${app}?page=${start}&code=fictional&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
 return {store,requests,errors,blocked,failures,close:async()=>{appendFileSync(out+'/fixture-network.ndjson',JSON.stringify({role,state,requests,errors,blocked})+'\n');server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()))}}
}
export async function capture(page:Page,name:string){
 await page.clock.runFor(600);await page.waitForLoadState('networkidle');await page.clock.runFor(600);await page.waitForLoadState('networkidle');await page.getByRole('heading',{level:1}).waitFor({timeout:5000});await page.locator('[role="status"]').filter({hasText:/^Loading/}).waitFor({state:'hidden',timeout:5000}).catch(()=>{});
 const metrics=await page.evaluate(()=>{
  const visible=(e:Element)=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';const main=document.querySelector('main')??document.body,text=(main as HTMLElement).innerText;
  const controls=[...main.querySelectorAll('button,a,input,select,summary,textarea')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return {name:((e as HTMLElement).innerText||e.getAttribute('aria-label')||e.closest('label')?.textContent||'').trim().slice(0,130),tag:e.tagName,x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,disabled:!!(e as HTMLButtonElement).disabled}});
  return {url:location.href,text,words:text.split(/\s+/).length,headings:[...main.querySelectorAll('h1,h2,h3,h4')].filter(visible).map(e=>({level:e.tagName,text:e.textContent})),controls,panels:[...main.querySelectorAll('.panel')].filter(visible).length,pageHeight:document.documentElement.scrollHeight,scrollY,viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,dialogs:[...document.querySelectorAll('[role="dialog"]')].map(e=>({name:e.getAttribute('aria-label'),modal:e.getAttribute('aria-modal')})),sort:[...document.querySelectorAll('[aria-sort]')].map(e=>({text:e.textContent,sort:e.getAttribute('aria-sort')})),nav:[...document.querySelectorAll('nav [aria-current]')].map(e=>({text:e.textContent,current:e.getAttribute('aria-current')}))}
 });appendFileSync(out+'/screens.ndjson',JSON.stringify({name,...metrics})+'\n');writeFileSync(out+'/'+name+'.txt',metrics.text.replace(/[ \t]+$/gm,''));await page.screenshot({path:out+'/'+name+'.png',fullPage:true});return metrics
}
