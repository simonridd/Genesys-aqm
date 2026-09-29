import { describe, it, expect, vi } from 'vitest'
import { handleRequest } from './index'
const endpoint = 'https://genesys-aqm-jev-proxy.example.workers.dev'
const origin = 'https://simonridd.github.io'
const env = { GENESYS_REGION:'mypurecloud.ie', GENESYS_CLIENT_ID:'test-client', GENESYS_CLIENT_SECRET:'test-secret', AQM_ACCESS_KEY:'test-access' }
const request = (path:string,method='GET',body?:unknown,key='test-access') => new Request(`${endpoint}${path}`, {method,headers:{Origin:origin,'X-AQM-Access-Key':key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
const ok = (value:unknown) => new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}})
describe('isolated Genesys Worker routes',()=>{
  it('requires the separate access key even with a valid browser origin',async()=>{
    const fetchMock=vi.fn()
    const res=await handleRequest(request('/v1/genesys/status','GET',undefined,'wrong'),fetchMock,env)
    expect(res.status).toBe(401);expect(fetchMock).not.toHaveBeenCalled()
  })
  it('reports connection state without returning tokens or secrets',async()=>{
    const fetchMock=vi.fn(async()=>ok({access_token:'private-token'}))
    const res=await handleRequest(request('/v1/genesys/status'),fetchMock,env)
    const payload=await res.text()
    expect(JSON.parse(payload).state).toBe('connected')
    expect(payload).not.toContain('private-token')
    expect(payload).not.toContain('test-secret')
  })
  it('rejects unbounded queries before authentication',async()=>{
    const fetchMock=vi.fn()
    const res=await handleRequest(request('/v1/genesys/conversations/search','POST',{from:'2026-01-01T00:00:00Z',to:'2026-02-01T00:00:00Z',page:1,pageSize:100}),fetchMock,env)
    expect(res.status).toBe(400);expect(fetchMock).not.toHaveBeenCalled()
  })
  it('queries bounded pages and returns completed interactions only',async()=>{
    const calls:string[]=[]
    const fetchMock=vi.fn(async(input:RequestInfo|URL)=>{calls.push(String(input));return calls.length===1?ok({access_token:'token'}):ok({conversations:[{conversationId:'complete',conversationEnd:'2026-09-28T12:00:00Z'},{conversationId:'open'}],totalHits:2})})
    const res=await handleRequest(request('/v1/genesys/conversations/search','POST',{from:'2026-09-28T00:00:00Z',to:'2026-09-29T00:00:00Z',page:2,pageSize:10}),fetchMock,env)
    const payload=await res.json() as {conversations:unknown[];total:number;hasMore:boolean}
    expect(payload.conversations).toHaveLength(1)
    expect(payload.total).toBe(2)
    expect(calls[1]).toContain('/api/v2/analytics/conversations/details/query')
  })
  it('retrieves a transcript through the documented communication URL without exposing the signed URL',async()=>{
    const id='22222222-2222-4222-8222-222222222222'
    const sessionId='33333333-3333-4333-8333-333333333333'
    const calls:string[]=[]
    const fetchMock=vi.fn(async(input:RequestInfo|URL)=>{
      const url=String(input);calls.push(url)
      if(url.includes('/oauth/token'))return ok({access_token:'private-token'})
      if(url.endsWith('/details'))return ok({conversationId:id,conversationStart:'2026-09-28T12:00:00Z',conversationEnd:'2026-09-28T12:05:00Z',participants:[{sessions:[{sessionId,mediaType:'message'}]}]})
      if(url.endsWith('/transcripturl'))return ok({url:'https://example.s3.amazonaws.com/signed-transcript?secret=hidden'})
      return ok({transcripts:[{phrases:[{text:'Fixture text',participantPurpose:'external',startTimeMs:0}]}]})
    })
    const res=await handleRequest(request(`/v1/genesys/conversations/${id}`),fetchMock,env)
    const payload=await res.text()
    expect(res.status).toBe(200)
    expect(payload).toContain('Fixture text')
    expect(payload).not.toContain('secret=hidden')
    expect(calls.some(c=>c.includes('/speechandtextanalytics/conversations/'))).toBe(true)
  })
})
