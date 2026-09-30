import { it,expect,vi } from 'vitest'
import { GenesysCloudConversationSource } from './sources'
it('returns the authenticated Genesys user ID for allowlist verification',async()=>{
  const mock=vi.fn(async()=>new Response(JSON.stringify({id:'1b2a0696-348b-4d8d-879e-13d4b4f43ba5',name:'AQM user'}),{status:200}))
  vi.stubGlobal('fetch',mock)
  try{const source=new GenesysCloudConversationSource(()=>({region:'eu-west-1',clientId:'public-client',accessToken:'short-lived-user-token',expiresAt:Date.now()+60_000}));const status=await source.status();expect(status.userId).toBe('1b2a0696-348b-4d8d-879e-13d4b4f43ba5');expect(status.detail).toContain('AQM user');expect(JSON.stringify(status)).not.toContain('short-lived-user-token')}finally{vi.unstubAllGlobals()}
})
