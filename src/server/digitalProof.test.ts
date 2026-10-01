import { expect,it,vi } from 'vitest'
import { digitalProof } from './digitalProof'
it('bounds discovery to five and content loads to two per channel and reports no raw bodies or Jev calls',async()=>{
 const ids=Array.from({length:5},(_,i)=>`22222222-2222-4222-8222-22222222222${i}`),loads:string[]=[]
 const fetcher=vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{
  const url=String(input);let value:unknown
  if(url.endsWith('/oauth/token'))value={access_token:'server-private',expires_in:3600}
  else if(url.endsWith('/details/query')){const query=JSON.parse(String(init?.body));expect(query.paging.pageSize).toBe(5);value={conversations:ids.map(conversationId=>({conversationId,conversationStart:'2026-09-30T12:00:00Z',conversationEnd:'2026-09-30T12:01:00Z',participants:[{purpose:'external',sessions:[{mediaType:query.segmentFilters[0].predicates[0].value}]}]}))}}
  else if(url.endsWith('/details')){loads.push(url);value={conversationId:url.split('/').at(-2),conversationStart:'2026-09-30T12:00:00Z',conversationEnd:'2026-09-30T12:01:00Z',participants:[{purpose:'external',sessions:[{mediaType:loads.length<=2?'email':'message'}]}]}}
  else if(url.includes('/recordings?'))value=[]
  else return new Response('{}',{status:403})
  return new Response(JSON.stringify(value))
 })
 const report=await digitalProof(fetcher,{GENESYS_REGION:'eu-west-1',GENESYS_CLIENT_ID:'id',GENESYS_CLIENT_SECRET:'secret',AQM_DIGITAL_PROOF_FROM:'2026-09-29T00:00:00Z',AQM_DIGITAL_PROOF_TO:'2026-09-30T00:00:00Z'})
 expect(loads).toHaveLength(4);expect(report.jevRequests).toBe(0);expect(report.results.every(x=>x.pendingSimon)).toBe(true);expect(JSON.stringify(report)).not.toMatch(/server-private|secret|"normalizedMessage"|textBody/);expect(fetcher.mock.calls.every(c=>!String(c[0]).includes('typesafe'))).toBe(true)
})
