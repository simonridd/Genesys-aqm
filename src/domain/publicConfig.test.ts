import { afterEach,describe,it,expect,vi } from 'vitest'
import { getConfig, saveConfig } from './genesysAuth'
import { publicGenesysConfig } from './publicConfig'
afterEach(()=>vi.unstubAllGlobals())
describe('safe deployed public Genesys configuration',()=>{
  it('pre-populates a fresh browser with production PKCE client and Ireland',()=>{vi.stubGlobal('localStorage',{getItem:()=>null});expect(getConfig()).toEqual({region:'eu-west-1',clientId:'e05784c9-2421-4c2b-a3af-79fafb25aea8'});expect(Object.keys(publicGenesysConfig).sort()).toEqual(['clientId','region'])})
  it('allows local multi-org overrides and ignores invalid previous configuration',()=>{let value:string|null=null;vi.stubGlobal('localStorage',{getItem:()=>value,setItem:(_key:string,next:string)=>{value=next}});saveConfig({region:'us-east-1',clientId:'different-client'});expect(getConfig()).toEqual({region:'us-east-1',clientId:'different-client'});value='{}';expect(getConfig()).toEqual(publicGenesysConfig);value=JSON.stringify({...publicGenesysConfig,clientSecret:'never-expose'});expect(JSON.stringify(getConfig())).not.toContain('never-expose')})
})
