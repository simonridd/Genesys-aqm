import { afterEach, expect, it, vi } from 'vitest'
import { downloadEmail, emailMediaUrl, emailText, MAX_EMAIL_BYTES, normalizeEmails, parseEmail } from './genesysEmail'
import { GenesysCloudConversationSource } from './sources'
import { ClientCredentialsGenesys } from '../server/providers'
import { ConversationCache, MemoryCacheBackend, TRANSCRIPT_TTL } from './conversationCache'
import type { GenesysDetail } from './genesys'
const id='22222222-2222-4222-8222-222222222222',sessionId='33333333-3333-4333-8333-333333333333',recordingId='44444444-4444-4444-8444-444444444444'
const detail:GenesysDetail={conversationId:id,conversationStart:'2026-09-30T12:00:00Z',conversationEnd:'2026-09-30T12:10:00Z',participants:[{participantId:'customer',purpose:'external',participantName:'Customer',sessions:[{sessionId,mediaType:'email',direction:'inbound',addressSelf:'customer@example.com'}]},{participantId:'agent',purpose:'agent',userId:'user',participantName:'Agent',sessions:[{sessionId:'55555555-5555-4555-8555-555555555555',mediaType:'email',addressSelf:'agent@example.com'}]}]}
const eml=(body:string,headers='Content-Type: text/plain; charset=utf-8')=>new TextEncoder().encode(`From: =?UTF-8?B?Q3VzdG9tZXI=?= <customer@example.com>\r\nSubject: =?UTF-8?B?SGVscA==?=\r\nMessage-ID: <stable@example.com>\r\nDate: Wed, 30 Sep 2026 12:01:00 +0000\r\nMIME-Version: 1.0\r\n${headers}\r\n\r\n${body}`)
const ok=(value:unknown)=>new Response(JSON.stringify(value),{headers:{'content-type':'application/json'}})
afterEach(()=>vi.unstubAllGlobals())
it('parses encoded metadata and plain text without returning attachments or MIME',async()=>{
 const email=await parseEmail(eml('Please help.'));expect(email).toMatchObject({subject:'Help',from:{name:'Customer',email:'customer@example.com'},textBody:expect.stringContaining('Please help.')});expect(email).not.toHaveProperty('attachments')
 const messages=normalizeEmails(detail,[{recording:{id:recordingId,sessionId},email}]);expect(messages[0]).toMatchObject({speaker:'customer',subject:'Help',timestamp:'2026-09-30T12:01:00.000Z',text:'Please help.'})
})
it('supports multipart alternative, HTML fallback and excludes attached content',async()=>{
 const body='--x\r\nContent-Type: multipart/alternative; boundary=y\r\n\r\n--y\r\nContent-Type: text/plain\r\n\r\nPlain body\r\n--y\r\nContent-Type: text/html\r\n\r\n<p>HTML body</p>\r\n--y--\r\n--x\r\nContent-Type: text/plain\r\nContent-Disposition: attachment; filename="secret.txt"\r\n\r\nATTACHMENT SECRET\r\n--x--'
 const email=await parseEmail(eml(body,'Content-Type: multipart/mixed; boundary=x'));expect(emailText(email.textBody,email.htmlBody)).toBe('Plain body');expect(JSON.stringify(email)).not.toContain('ATTACHMENT SECRET')
 const html=await parseEmail(eml('<p>Hello &amp; welcome</p><script>alert(1)</script><img src="https://remote.example/track">','Content-Type: text/html'));expect(emailText(html.textBody,html.htmlBody)).toBe('Hello & welcome')
})
it('rejects malformed, oversized and deeply nested MIME',async()=>{
 await expect(parseEmail(new TextEncoder().encode('not an email'))).rejects.toThrow('Malformed')
 await expect(parseEmail(new Uint8Array(MAX_EMAIL_BYTES+1))).rejects.toThrow('limit')
 const nested=Array.from({length:35},(_,i)=>`--b${i}\r\nContent-Type: multipart/mixed; boundary=b${i+1}\r\n\r\n`).join('');await expect(parseEmail(eml(nested,'Content-Type: multipart/mixed; boundary=b0'))).rejects.toThrow()
})
it('maps multiple senders by provider purpose, deduplicates IDs and rejects unknown/conflicting identity',()=>{
 const customer={id:'one',time:'2026-09-30T12:01:00Z',from:{email:'customer@example.com'},textBody:'Question'},agent={id:'two',time:'2026-09-30T12:02:00Z',from:{email:'agent@example.com'},textBody:'Answer'}
 const recording={id:recordingId,sessionId,emailTranscript:[customer,agent]}
 expect(normalizeEmails(detail,[{recording,email:customer},{recording,email:agent},{recording,email:customer}]).map(m=>m.speaker)).toEqual(['customer','agent'])
 expect(()=>normalizeEmails(detail,[{recording,email:{...agent,from:{email:'unknown@example.com'}}}])).toThrow('mapped')
 expect(()=>normalizeEmails(detail,[{recording,email:customer},{recording,email:{...customer,textBody:'Changed'}}])).toThrow('Conflicting')
})
it('bounds streaming downloads and refuses redirects or arbitrary media hosts',async()=>{
 expect(()=>emailMediaUrl('https://localhost/media')).toThrow();expect(()=>emailMediaUrl('https://bucket.amazonaws.com.evil.example/media')).toThrow()
 const fetcher=vi.fn(async(_input:RequestInfo|URL,_init?:RequestInit)=>new Response(new Uint8Array(MAX_EMAIL_BYTES+1)));await expect(downloadEmail(emailMediaUrl('https://bucket.s3.amazonaws.com/mail'),fetcher)).rejects.toThrow('limit')
 expect(fetcher.mock.calls[0][1]).toMatchObject({credentials:'omit',redirect:'error'});expect(fetcher.mock.calls[0][1]).not.toHaveProperty('headers')
})
function providerFetch(mode:'eml'|'structured'|'unavailable'|'bad'='eml'){
 return vi.fn(async(input:RequestInfo|URL)=>{
  const url=String(input)
  if(url.endsWith('/oauth/token'))return ok({access_token:'server-token',expires_in:3600})
  if(url.endsWith('/details'))return ok(detail)
  if(url.includes('/recordings?'))return ok(mode==='unavailable'?[]:[{id:recordingId,media:'email'}])
  if(url.includes(`/recordings/${recordingId}?`))return ok({id:recordingId,sessionId,...(mode==='structured'?{emailTranscript:[{id:'c',time:'2026-09-30T12:01:00Z',from:{email:'customer@example.com'},textBody:'Question'},{id:'a',time:'2026-09-30T12:02:00Z',from:{email:'agent@example.com'},htmlBody:'<p>Answer</p>'}]}:{mediaUris:{EML:{mediaUri:mode==='bad'?'https://evil.example/private':'https://bucket.s3.amazonaws.com/mail?signature=private'}}})})
  if(url.startsWith('https://bucket.s3.amazonaws.com/'))return new Response(eml('Please help.'))
  throw Error('Unexpected request')
 })
}
it('uses official recordings sequence with EML and never calls voice analytics or leaks media data',async()=>{
 const fetcher=providerFetch(),source=new GenesysCloudConversationSource(()=>({region:'eu-west-1',clientId:'public',accessToken:'pkce',expiresAt:Date.now()+3600000}),fetcher)
 const conversation=await source.load(id);expect(conversation.messages).toHaveLength(1);expect(conversation.channel).toBe('email');expect(conversation.metadata.transcriptStatus).toBe('Available')
 expect(fetcher.mock.calls.map(c=>String(c[0])).join(' ')).toContain('emailFormatId=EML&download=true');expect(fetcher.mock.calls.some(c=>String(c[0]).includes('speechandtextanalytics'))).toBe(false)
 expect(JSON.stringify(conversation)).not.toMatch(/signature|MIME-Version|mediaUri|attachments|pkce/)
})
it('server client credentials reuse the exact source and parser for multiple logical emails',async()=>{
 const fetcher=providerFetch('structured'),source=new ClientCredentialsGenesys('eu-west-1','id','secret',fetcher)
 const conversation=await source.load(id);expect(conversation.messages.map(m=>m.speaker)).toEqual(['customer','agent']);expect(conversation.messages[1].text).toBe('Answer');expect(fetcher.mock.calls.some(c=>String(c[0]).includes('amazonaws'))).toBe(false)
})
it.each(['unavailable','bad'] as const)('reports %s email content without inventing messages',async mode=>{
 const source=new GenesysCloudConversationSource(()=>({region:'eu-west-1',clientId:'public',accessToken:'pkce',expiresAt:Date.now()+3600000}),providerFetch(mode));const conversation=await source.load(id)
 expect(conversation.messages).toEqual([]);expect(conversation.metadata.transcriptStatus).toBe(mode==='bad'?'Error':'Unavailable');expect(JSON.stringify(conversation)).not.toContain('evil.example')
})
it('interactive relay returns normalized email through the shared identity cache with 24-hour TTL',async()=>{
 const fetcher=providerFetch(),direct=new GenesysCloudConversationSource(()=>({region:'eu-west-1',clientId:'public',accessToken:'pkce',expiresAt:Date.now()+3600000}),fetcher)
 const value=await direct.load(id);const relay=vi.fn(async()=>value)
 const source=new GenesysCloudConversationSource(()=>({region:'eu-west-1',clientId:'public',accessToken:'pkce',expiresAt:Date.now()+3600000}),providerFetch(),relay)
 expect(await source.load(id)).toEqual(value);expect(relay).toHaveBeenCalledWith(id)
 let now=1;const backend=new MemoryCacheBackend(),cache=new ConversationCache(backend,()=>now)
 await cache.saveTranscript('identity',value);expect((await cache.transcript('identity',id))?.value.messages[0].subject).toBe('Help');expect(await cache.transcript('other',id)).toBeNull();now+=TRANSCRIPT_TTL;expect((await cache.transcript('identity',id))?.stale).toBe(true);await cache.clear('identity');expect(await cache.transcript('identity',id)).toBeNull()
})
