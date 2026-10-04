import { test,expect,type Page } from '@playwright/test'
import { mkdirSync,writeFileSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { buildSync } from 'esbuild'
import { fileURLToPath } from 'node:url'
const generated=new URL('./.generated/answerSetsApi.mjs',import.meta.url)
buildSync({entryPoints:[fileURLToPath(new URL('./answerSetsApi.ts',import.meta.url))],outfile:fileURLToPath(generated),bundle:true,platform:'node',format:'esm',packages:'external'})
const { createApi, MemoryStore }=await import(generated.href) as typeof import('./answerSetsApi')
import { seedForms } from '../src/domain/forms'
import { seedAnswerSets } from '../src/domain/seedAnswerSets'
import { nextAnswerSetVersion,transitionAnswerSet,applyAnswerSet } from '../src/domain/answerSets'
import { type Role } from '../src/domain/governance'
import type { AnswerSetAsset,EvaluationForm,QuestionGroupAsset } from '../src/domain/types'
export const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/',api='https://aqm-api-bd54ukouga-nw.a.run.app',now='2026-10-03T10:00:00.000Z',evidence='docs/v019b-evidence'
mkdirSync(evidence,{recursive:true})
const nav=(page:Page,name:string)=>page.getByRole('navigation').getByRole('button',{name,exact:true})
export function draft(type:'choice'|'score'='choice'):EvaluationForm{return {...structuredClone(seedForms[0]),id:`fixture_${type}`,familyId:`fixture_${type}`,name:`Fixture ${type} form`,status:'DRAFT',enabled:false,groups:[{id:'general',name:'General'}],questions:[{id:'q',title:'Quality',instructions:'Assess the quality.',groupId:'general',type,options:structuredClone(seedAnswerSets[type==='choice'?1:0].options),weight:1,enabled:true}]}}
export async function fixture(page:Page,role:Role='ADMIN',sets:AnswerSetAsset[]=[],forms:EvaluationForm[]=[draft(),draft('score')],groups:QuestionGroupAsset[]=[],start='answerSets',options:{sessionGate?:Promise<void>;reauthenticateOnLoad?:boolean}={}){
 const store=new MemoryStore(),errors:string[]=[],requests:{path:string;method:string}[]=[],user=role==='ADMIN'?'owner':role.toLowerCase()
 for(const f of forms)await store.putForm(f)
 for(const group of groups)await store.putGroupAsset(group)
 for(const a of sets){const d={...a,status:'DRAFT' as const};await store.putAnswerSet(d);if(a.status!=='DRAFT')await store.putAnswerSet(transitionAnswerSet(d,'PUBLISHED',now))}
 for(const r of ['AUTHOR','REVIEWER','VIEWER'] as const)await store.atomic([{collection:'roleAssignments',id:r.toLowerCase(),expected:undefined,value:{id:r.toLowerCase(),role:r}}])
 const server=createApi({store,now:()=>new Date(now),genesys:{list:async()=>{throw Error('Provider forbidden')},load:async()=>{throw Error('Provider forbidden')},withQueueNames:async c=>c},jev:{evaluate:async()=>{throw Error('Provider forbidden')}}},{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set(['owner','author','reviewer','viewer']),bootstrapAdminId:'owner',schedulerEmail:'fixture',schedulerAudience:'https://fixture'},async()=>new Response(JSON.stringify({id:user,name:user})))
 await new Promise<void>(r=>server.listen(0,r));const local=`http://127.0.0.1:${(server.address() as AddressInfo).port}`
 page.on('pageerror',e=>errors.push(e.message))
 await page.addInitScript(({start,reauthenticateOnLoad})=>{if(reauthenticateOnLoad){const url=new URL(location.href);start=url.searchParams.get('page')??start;url.searchParams.set('code','fixture');url.searchParams.set('state','A'.repeat(43));history.replaceState(null,'',url)}sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fixture-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:start}));localStorage.setItem('genesys-aqm-auth-config',JSON.stringify({region:'eu-west-1',clientId:'fixture-client'}))},{start,reauthenticateOnLoad:options.reauthenticateOnLoad})
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url())
  if(u.origin===new URL(app).origin)return route.continue()
  if(u.origin==='https://login.mypurecloud.ie'&&u.pathname==='/oauth/token')return route.fulfill({json:{access_token:'fixture',token_type:'Bearer',expires_in:3600}})
  if(u.origin==='https://api.mypurecloud.ie'&&u.pathname==='/api/v2/users/me')return route.fulfill({json:{id:user,name:user,organization:{id:'fixture'}}})
  if(u.origin!==api)return route.abort()
  requests.push({path:u.pathname,method:route.request().method()})
  if(u.pathname==='/api/session'&&options.sessionGate)await options.sessionGate
  const response=await fetch(local+u.pathname+u.search,{method:route.request().method(),headers:{Authorization:'Bearer fixture','Content-Type':'application/json'},body:route.request().postData()??undefined})
  return route.fulfill({status:response.status,body:await response.text(),contentType:'application/json'})
 })
 await page.goto(`${app}?page=${start}&code=fixture&state=${'A'.repeat(43)}`);await expect(page.getByLabel('Current role')).toHaveText(role)
 return {store,errors,requests,close:()=>new Promise<void>(r=>{server.closeAllConnections();server.close(()=>r())})}
}
