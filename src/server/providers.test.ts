import { describe,it,expect,vi } from 'vitest'
import { ClientCredentialsGenesys, DirectJev } from './providers'
import type { EvaluationRequest } from '../domain/types'
const request:EvaluationRequest={conversation:{conversationId:'c',startedAt:'2026-09-30T00:00:00Z',channel:'voice',agent:{id:'a',name:'A'},customer:{id:'b',name:'B'},metadata:{},messages:[{id:'m',speaker:'agent',timestamp:'2026-09-30T00:00:00Z',text:'hello'}]},scorecard:{id:'score',version:1,title:'Test',threshold:.5,items:[{id:'question',title:'Question',instructions:'Answer yes or no',type:'noul',options:[],weight:1,enabled:true}]},evaluatedAt:'2026-09-30T00:00:00Z',version:'v0'}
describe('server provider adapters',()=>{
  it('uses client credentials for a server token and never returns it in results',async()=>{
    const fetcher=vi.fn(async(url:string,init?:RequestInit)=>{if(url.endsWith('/oauth/token')){expect(init?.headers).toMatchObject({Authorization:expect.stringMatching(/^Basic /)});return new Response(JSON.stringify({access_token:'server-only-token',expires_in:3600}),{status:200})}expect(init?.headers).toMatchObject({Authorization:'Bearer server-only-token'});return new Response(JSON.stringify({conversations:[],totalHits:0}),{status:200})})
    vi.stubGlobal('fetch',fetcher);try{const source=new ClientCredentialsGenesys('eu-west-1','client','secret',fetcher as unknown as typeof fetch);const result=await source.list({from:'2026-09-29T00:00:00Z',to:'2026-09-30T00:00:00Z',page:1,pageSize:25});expect(result.conversations).toEqual([]);expect(JSON.stringify(result)).not.toContain('server-only-token')}finally{vi.unstubAllGlobals()}
  })
  it('calls Jev directly with server key and normalizes the result',async()=>{
    const fetcher=vi.fn(async(_url:string,init?:RequestInit)=>{expect(init?.headers).toMatchObject({Authorization:'Bearer server-jev-key'});return new Response(JSON.stringify({model:'jev-test',answers:{question:{type:'noul',noul:.9}}}),{status:200})})
    const result=await new DirectJev('server-jev-key',fetcher as unknown as typeof fetch).evaluate(request)
    expect(result.overallScore).toBe(1);expect(JSON.stringify(result)).not.toContain('server-jev-key')
  })
})
