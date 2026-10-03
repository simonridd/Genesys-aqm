import { expect,type Page } from '@playwright/test'
import { MemoryStore,ReviewConflict } from '../src/server/store'
import { assignReview,scoreAssignedReview,reviewWorkload,reviewerDirectory } from '../src/server/reviewOperations'
import { operationalAnalytics } from '../src/server/analytics'
import { operationalOverview } from '../src/server/overview'
import { rolePermissions,defaultGovernance } from '../src/domain/governance'
import { matchesEvaluationFilters } from '../src/domain/reviews'
import { reviewFixture,reviewInput } from '../src/fixtures/reviewFixture'
import detail from '../src/fixtures/genesys-detail.json' with {type:'json'}
import transcript from '../src/fixtures/genesys-transcript.json' with {type:'json'}
export const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4174/Genesys-aqm/'
const origin='https://aqm-api-bd54ukouga-nw.a.run.app'
export const now='2026-10-03T12:00:00.000Z',actor={userId:'reviewer',displayName:'Fictional Reviewer'},admin={userId:'admin'},other={userId:'other',displayName:'Other Reviewer'}
const authority={bootstrapId:'admin',allowedUserIds:new Set(['admin','reviewer','other'])}
export async function continuityFixture(page:Page,query='page=evaluations&reviewQueue=mine&assignment=mine',options:{pagination?:boolean;start?:boolean}={}) {
  const store=new MemoryStore(),requests:{url:URL;method:string;body?:any}[]=[],errors:string[]=[],forbidden:string[]=[]
  for(const who of [actor,other])await store.atomic([{collection:'roleAssignments',id:who.userId,expected:undefined,value:{id:who.userId,...who,role:'REVIEWER',createdAt:now,updatedAt:now,assignedBy:admin}}])
  for(const id of ['review-a','review-b']){
    const record={...reviewFixture(id),conversationId:detail.conversationId,agent:{id:'44444444-4444-4444-8444-444444444444',name:'Test Agent'},queue:'Fixture Queue',evaluatedAt:detail.conversationStart,executionMode:'scheduled' as const,policyMatches:[{policyId:'fictional-policy',policyName:'Fictional policy',matchedGroup:[]}]}
    await store.putEvaluation(record)
    await assignReview(store,id,{action:'assign',expectedRevision:0,assigneeId:actor.userId,dueAt:'2026-10-03T18:00:00.000Z'},admin,now,authority)
    if(options.start!==false)await scoreAssignedReview(store,id,reviewInput(record,'start',1),actor,now,authority)
  }
  await page.clock.install({time:new Date(now)})
  page.on('pageerror',e=>errors.push(e.message))
  await page.addInitScript(()=>{
    const trace={writes:[] as {store:string;value:string}[],guards:0}
    ;(window as any).__reviewTrace=trace
    const set=Storage.prototype.setItem
    Storage.prototype.setItem=function(key,value){trace.writes.push({store:this===localStorage?'localStorage':'sessionStorage',value:JSON.stringify([key,value])});return set.call(this,key,value)}
    for(const method of ['put','add'] as const){const write=IDBObjectStore.prototype[method];IDBObjectStore.prototype[method]=function(value:any,key?:IDBValidKey){trace.writes.push({store:'IndexedDB',value:JSON.stringify(value)});return write.call(this,value,key)}}
    const add=window.addEventListener,remove=window.removeEventListener
    window.addEventListener=function(type:any,listener:any,options:any){if(type==='beforeunload'&&String(listener).includes('preventDefault'))trace.guards++;return add.call(this,type,listener,options)} as typeof add
    window.removeEventListener=function(type:any,listener:any,options:any){if(type==='beforeunload'&&String(listener).includes('preventDefault'))trace.guards--;return remove.call(this,type,listener,options)} as typeof remove
    sessionStorage.setItem('genesys-aqm-pkce-transaction',JSON.stringify({region:'eu-west-1',clientId:'fixture-client',verifier:'a'.repeat(43),state:'A'.repeat(43),createdAt:Date.now(),page:new URL(location.href).searchParams.get('page')??'evaluations'}))
  })
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url()),path=url.pathname,method=route.request().method()
    if(url.origin===new URL(app).origin)return route.continue()
    const json=(value:unknown)=>route.fulfill({json:value})
    if(url.origin==='https://login.mypurecloud.ie'&&path==='/oauth/token')return json({access_token:'fixture-token',token_type:'Bearer',expires_in:3600})
    if(url.origin==='https://api.mypurecloud.ie'&&method==='GET'){
      if(path.endsWith('/users/me'))return json({id:actor.userId,name:actor.displayName,organization:{id:'fictional-org'}})
      if(path.endsWith('/details'))return json(detail)
      if(path.endsWith('/transcripturl'))return json({url:'https://api-downloads.mypurecloud.ie/transcriptsCache/fixture'})
      if(path.includes('/routing/queues/'))return json({name:'Fixture Queue'})
    }
    if(url.origin==='https://api-downloads.mypurecloud.ie'&&method==='GET')return json(transcript)
    if(url.origin!==origin){forbidden.push(url.href);return route.abort()}
    const body=method==='PUT'?route.request().postDataJSON():undefined
    requests.push({url,method,body})
    try{
      if(path.startsWith('/api/reviews/')&&method==='PUT')return json({item:await scoreAssignedReview(store,path.split('/')[3],body,actor,now,authority)})
      if(method!=='GET'){forbidden.push(url.href);return route.abort()}
      if(path==='/api/session')return json({actor,role:'REVIEWER',permissions:rolePermissions.REVIEWER})
      if(path==='/api/governance')return json(defaultGovernance)
      if(path==='/api/overview')return json(await operationalOverview(store,now,30,authority,true))
      if(path==='/api/forms')return json({items:[(await store.evaluation('review-a'))!.form]})
      if(path==='/api/reviewers')return json(await reviewerDirectory(store,url.searchParams,authority,actor))
      if(path==='/api/review-workload')return json(await reviewWorkload(store,now,authority))
      if(path==='/api/analytics')return json(await operationalAnalytics(store,url.searchParams))
      if(path==='/api/evaluations'){
        const rows=await Promise.all((await store.evaluations()).map(async item=>({...item,humanReview:await store.review(item.id)})))
        const filtered=rows.filter(item=>matchesEvaluationFilters(item,url.searchParams,actor.userId,now,defaultGovernance.reviewSla))
        return json({items:options.pagination?filtered.filter(item=>item.id===(url.searchParams.get('cursor')?'review-b':'review-a')):filtered,nextCursor:options.pagination&&!url.searchParams.get('cursor')?'page-two':undefined})
      }
      if(path.startsWith('/api/evaluations/')){const id=path.split('/')[3];return json({...await store.evaluation(id),humanReview:await store.review(id)})}
      if(path.startsWith('/api/reviews/'))return json(await store.review(path.split('/')[3]))
      return json({items:[]})
    }catch(error){return route.fulfill({status:error instanceof ReviewConflict?409:400,json:{error:error instanceof Error?error.message:'Fixture error'}})}
  })
  await page.goto(`${app}?${query}&code=fixture&state=${'A'.repeat(43)}`)
  await expect(page.getByLabel('Current role')).toHaveText('REVIEWER')
  const before=JSON.stringify(await store.evaluations())
  return {store,requests,errors,forbidden,before,async completeElsewhere(id='review-a'){
    const prior=(await store.review(id))!,record=(await store.evaluation(id))!
    return scoreAssignedReview(store,id,{...reviewInput(record,'complete',prior.revision),notes:'Completed in another session'},actor,now,authority)
  },async advance(id='review-a',reassign=false){
    const prior=(await store.review(id))!,record=(await store.evaluation(id))!
    if(reassign)return assignReview(store,id,{action:'reassign',expectedRevision:prior.revision,assigneeId:other.userId,confirmInReview:true},admin,now,authority)
    return scoreAssignedReview(store,id,{...reviewInput(record,'save',prior.revision),answers:[],notes:'New authoritative note'},actor,now,authority)
  }}
}
