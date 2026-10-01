import { afterEach, expect, it } from 'vitest'
import { createApi } from './api'
import { MemoryStore } from './store'
import { seedGroupAssets } from '../domain/seedGroupAssets'
import { nextAssetVersion } from '../domain/groupAssets'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
const servers:Server[]=[]
afterEach(async()=>{await Promise.all(servers.splice(0).map(server=>new Promise<void>(resolve=>server.close(()=>resolve()))))})
it('authorizes durable bounded library routes, protects published versions and returns useful dependency errors',async()=>{
 const store=new MemoryStore(),server=createApi({store,now:()=>new Date(),genesys:{list:async()=>{throw Error('No provider allowed')},load:async()=>{throw Error('No provider allowed')},withQueueNames:async c=>c},jev:{evaluate:async()=>{throw Error('No provider allowed')}}},{origin:'https://simonridd.github.io',region:'eu-west-1',allowedUserIds:new Set(['allowed']),schedulerEmail:'scheduler@example.com',schedulerAudience:'https://api.example'},async()=>new Response(JSON.stringify({id:'allowed'})))
 servers.push(server);await new Promise<void>(resolve=>server.listen(0,resolve));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`,headers={Authorization:'Bearer fixture','Content-Type':'application/json'}
 const asset=seedGroupAssets[0],put=(value:typeof asset)=>fetch(`${base}/api/question-groups/${value.id}`,{method:'PUT',headers,body:JSON.stringify(value)})
 expect((await fetch(`${base}/api/question-groups`)).status).toBe(401);expect((await put(asset)).status).toBe(200)
 const locked=await put({...asset,name:'Cannot mutate published'});expect(locked.status).toBe(400);expect((await locked.json()).error).toContain('immutable')
 const v2=nextAssetVersion(asset,[asset],new Date().toISOString());expect((await put(v2)).status).toBe(200)
 const page=await (await fetch(`${base}/api/question-groups?limit=1`,{headers})).json();expect(page.items).toHaveLength(1);expect(page.nextCursor).toBe(asset.id)
 const second=await (await fetch(`${base}/api/question-groups?limit=1&cursor=${page.nextCursor}`,{headers})).json();expect(second.items[0].id).toBe(v2.id)
 const invalid={...v2,questions:v2.questions.map((q,i)=>i===0?{...q,condition:{kind:'question_outcome' as const,questionId:q.id,outcomes:['Yes']}}:q)}
 const bad=await put(invalid);expect(bad.status).toBe(400);expect((await bad.json()).error).toContain('earlier')
 expect((await fetch(`${base}/api/question-groups?limit=999`,{headers})).status).toBe(400)
 expect((await fetch(`${base}/api/question-groups/${asset.id}`,{headers})).status).toBe(200)
})
