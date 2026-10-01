import { evaluateForm } from './formComposition'
import { matchPolicies } from './policies'
import { recordEvaluation } from './evaluations'
import { buildReview } from './reviews'
import { aggregateCalibration } from './calibration'
import { fixtureEvaluation } from '../fixtures/evaluationFixture'
import type { EvaluationForm } from './types'
import { expect, it, vi } from 'vitest'
import { GenesysCloudConversationSource } from './sources'
import { ClientCredentialsGenesys } from '../server/providers'
import { boundedJson, MAX_DIGITAL_BODY, MAX_DIGITAL_RESPONSE, messageInventory, normalizeMessaging, type MessageData, type MessageConversation } from './genesysDigital'
import { normalizeGenesys, type GenesysDetail } from './genesys'
import { validateConversation } from './validation'
import { toJevRequest } from '../provider/jev'
import { starterScorecard } from './scorecard'
const id='22222222-2222-4222-8222-222222222222'
const timestamp='2026-09-30T12:00:01Z'
const detail=(channel='message'):GenesysDetail=>({conversationId:id,conversationStart:'2026-09-30T12:00:00Z',conversationEnd:'2026-09-30T12:10:00Z',participants:[{participantId:'customer',purpose:'external',participantName:'Customer',sessions:[{mediaType:channel,addressSelf:'customer@example.com',direction:'inbound'}]},{participantId:'agent',purpose:'agent',userId:'user',sessions:[{mediaType:channel,addressSelf:'agent@example.com'}]}]})
const provider:MessageConversation={id,participants:['customer','agent','bot','workflow'].map((purpose,i)=>({id:`p${i}`,name:`Name ${i}`,purpose,user:purpose==='agent'?{id:'user'}:undefined,messages:[{messageId:`m${i}`}]}))}
const content=(n=4):MessageData[]=>Array.from({length:n},(_,i)=>({id:`m${i}`,conversationId:id,timestamp,direction:i===0?'inbound':'outbound',...(i===1?{createdBy:{id:'user'}}:{}),normalizedMessage:{type:'Text',text:`Text ${i}`}}))
const ok=(value:unknown)=>new Response(JSON.stringify(value))
function fixture(options:{channel?:string;provider?:MessageConversation;content?:MessageData[];bulkStatus?:number;directStatus?:number;emailBody?:boolean;recording?:boolean;recordingStatus?:number}={}){
 return vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{
  const url=String(input)
  if(url.endsWith('/oauth/token'))return ok({access_token:'server',expires_in:3600})
  if(url.endsWith('/details'))return ok(detail(options.channel))
  if(url.includes('/recordings?'))return options.recordingStatus?new Response('{}',{status:options.recordingStatus}):ok(options.recording?[{media:'message',id:'r'}]:[])
  if(url.includes('/conversations/emails/')){
   if(options.directStatus)return new Response('{}',{status:options.directStatus})
   if(url.endsWith('/messages'))return ok({entities:[{id:'e2'},{id:'e1'}],total:2})
   const outgoing=url.endsWith('/e2');return ok({id:outgoing?'e2':'e1',time:outgoing?'2026-09-30T12:00:02Z':timestamp,from:{email:outgoing?'agent@example.com':'customer@example.com',name:outgoing?'Agent':'Customer'},subject:'Help',...(options.emailBody===false?{}:outgoing?{htmlBody:'<p>Answer</p><script>danger()</script><img src="https://media.example/tracker">'}:{textBody:'Question\n> retained quote'}),attachments:[{url:'https://media.example/secret'}]})
  }
  if(url.endsWith(`/conversations/messages/${id}`))return options.directStatus?new Response('{}',{status:options.directStatus}):ok(options.provider??provider)
  if(url.endsWith('/bulk'))return options.bulkStatus?new Response('{}',{status:options.bulkStatus}):ok({entities:(options.content??content()).filter(m=>(JSON.parse(String(init?.body)) as string[]).includes(m.id!))})
  if(url.includes(`/conversations/messages/${id}/messages/`))return ok((options.content??content()).find(m=>url.endsWith(`/${m.id}`)))
  throw Error('Unexpected fixture request')
 })
}
const source=(fetcher:typeof fetch)=>new GenesysCloudConversationSource(()=>({region:'eu-west-1',clientId:'id',accessToken:'pkce',expiresAt:Date.now()+3600000}),fetcher)
it('prefers complete direct email, preserves chronological individual bodies and ignores a recording 404',async()=>{
 const fetcher=fixture({channel:'email',recordingStatus:404}),conversation=await source(fetcher).load(id)
 expect(conversation.messages.map(m=>m.speaker)).toEqual(['customer','agent']);expect(conversation.messages[0].text).toContain('retained quote');expect(conversation.messages[1].text).toBe('Answer')
 expect(conversation.metadata.contentSource).toBe('conversation-email');expect(fetcher.mock.calls.some(c=>String(c[0]).includes('/recordings'))).toBe(false);expect(fetcher.mock.calls.filter(c=>String(c[0]).includes('/conversations/emails/'))).toHaveLength(3)
 expect(JSON.stringify(conversation)).not.toMatch(/attachments|media.example|danger|htmlBody|textBody/)
 expect(await new ClientCredentialsGenesys('eu-west-1','id','secret',fixture({channel:'email'})).load(id)).toEqual(conversation)
})
it('falls back for unavailable direct email body and records a recording 404 without claiming no email exists',async()=>{
 const value=await source(fixture({channel:'email',emailBody:false,recordingStatus:404})).load(id)
 expect(value.messages).toEqual([]);expect(value.metadata.transcriptDetail).toContain('Direct email content unavailable');expect(value.metadata.transcriptStatus).toBe('Unavailable')
})
it('discovers documented IDs, uses actual bounded bulk IDs and normalizes four authoritative speaker purposes',async()=>{
 const fetcher=fixture(),conversation=await source(fetcher).load(id)
 expect(conversation.channel).toBe('messaging');expect(conversation.messages.map(m=>m.speaker)).toEqual(['customer','agent','bot','system']);expect(conversation.messages[1].senderId).toBe('user');expect(validateConversation(conversation).errors).toEqual([])
 const bulk=fetcher.mock.calls.find(c=>String(c[0]).endsWith('/bulk'))!;expect(JSON.parse(String(bulk[1]?.body))).toEqual(['m0','m1','m2','m3']);expect(conversation.metadata.providerMessageCount).toBe('4')
 expect(await new ClientCredentialsGenesys('eu-west-1','id','secret',fixture()).load(id)).toEqual(conversation)
 expect(toJevRequest({conversation,scorecard:starterScorecard,evaluatedAt:timestamp,version:'v0'}).state.conversation.messages[2].speaker).toBe('bot')
 expect(fetcher.mock.calls.some(c=>/recordings|speechandtextanalytics|media.example/.test(String(c[0])))).toBe(false)
})
it('uses individual fallback for unsupported bulk and retrieves only omitted IDs for partial bulk',async()=>{
 const unavailable=fixture({bulkStatus:404});expect((await source(unavailable).load(id)).messages).toHaveLength(4);expect(unavailable.mock.calls.filter(c=>/\/messages\/m\d$/.test(String(c[0])))).toHaveLength(4)
 const base=fixture(),partial=vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>String(input).endsWith('/bulk')?ok({entities:content().slice(0,3)}):base(input,init));expect((await source(partial).load(id)).messages).toHaveLength(4);expect(partial.mock.calls.filter(c=>/\/messages\/m\d$/.test(String(c[0]))).map(c=>String(c[0]).split('/').at(-1))).toEqual(['m3'])
})
it('caps bulk batches at 100 actual IDs and rejects conversations above 500 without retrieving content',async()=>{
 const large:MessageConversation={id,participants:[{id:'customer',purpose:'external',messages:Array.from({length:201},(_,i)=>({messageId:`m${i}`}))}]}
 const fetcher=fixture({provider:large,content:content(201).map(m=>({...m,direction:'inbound',createdBy:undefined}))});expect((await source(fetcher).load(id)).messages).toHaveLength(201)
 expect(fetcher.mock.calls.filter(c=>String(c[0]).endsWith('/bulk')).map(c=>JSON.parse(String(c[1]?.body)).length)).toEqual([100,100,1])
 large.participants![0].messages=Array.from({length:501},(_,i)=>({messageId:`m${i}`}));const exceeded=fixture({provider:large});const value=await source(exceeded).load(id);expect(value.messages).toEqual([]);expect(value.metadata.transcriptDetail).toContain('500 message limit');expect(exceeded.mock.calls).toHaveLength(2)
})
it('normalizes unambiguous structured labels and omits media, receipt and event data without downloading',()=>{
 const data=content();data[0].normalizedMessage={type:'Structured',content:[{contentType:'Card',card:{title:'Choose',description:'Service',actions:[{text:'Billing'}]}},{contentType:'Text',text:{body:'Hello'}},{contentType:'Attachment'}]};data[1].normalizedMessage={type:'Receipt',text:'not visible'};data[2].normalizedMessage={type:'Text',content:[{contentType:'Attachment'}]}
 const result=normalizeMessaging(id,messageInventory(provider,id),data);expect(result.messages[0].text).toBe('Choose\nService\nBilling\nHello');expect(result.nonText).toBe(2)
})
it('reports media-only conversations unavailable and keeps diagnostics outside evaluated message text',async()=>{
 const data=content().map(m=>({...m,normalizedMessage:{type:'Text',content:[{contentType:'Attachment'}]}}));const value=await source(fixture({content:data})).load(id)
 expect(value.messages).toEqual([]);expect(value.metadata.transcriptStatus).toBe('Unavailable');expect(value.metadata.nonTextMessageCount).toBe('4')
})
it('rejects missing content, conflicting identity and ambiguous sender instead of guessing',()=>{
 const inventory=messageInventory(provider,id)
 expect(()=>normalizeMessaging(id,inventory,content().slice(1))).toThrow('incomplete')
 expect(()=>normalizeMessaging(id,inventory,[...content(),content()[0]])).toThrow('Duplicate')
 const ambiguous=structuredClone(provider);ambiguous.participants![1].messages=[{messageId:'m0'}, {messageId:'m1'}];const data=content();data[0].direction='outbound';expect(()=>normalizeMessaging(id,messageInventory(ambiguous,id),data)).toThrow('unambiguously')
})
it('rejects excessive per-message, aggregate normalized content and streaming response without silent truncation',async()=>{
 const data=content();data[0].normalizedMessage!.text='x'.repeat(MAX_DIGITAL_BODY+1);const value=await source(fixture({content:data})).load(id);expect(value.messages).toEqual([]);expect(value.metadata.transcriptDetail).toContain('100 KB limit')
 const large:MessageConversation={id,participants:[{purpose:'customer',messages:Array.from({length:11},(_,i)=>({messageId:`m${i}`}))}]};expect(()=>normalizeMessaging(id,messageInventory(large,id),content(11).map(m=>({...m,direction:'inbound',createdBy:undefined,normalizedMessage:{type:'Text',text:'x'.repeat(MAX_DIGITAL_BODY)}})))).toThrow('1 MB limit')
 await expect(boundedJson(new Response(new Uint8Array(MAX_DIGITAL_RESPONSE+1)))).rejects.toThrow('5 MB limit')
})
it('reports exact documented permission alternatives and avoids recording retry on denial',async()=>{
 const fetcher=fixture({bulkStatus:403}),value=await source(fetcher).load(id);expect(value.messages).toEqual([]);expect(value.metadata.transcriptDetail).toContain('conversation:message:view OR conversation:webmessaging:view');expect(fetcher.mock.calls).toHaveLength(3)
})
it.each([false,true])('discovers historical recording fallback availability %s but never invents or downloads ZIP',async recording=>{
 const fetcher=fixture({directStatus:404,recording}),value=await source(fetcher).load(id);expect(value.messages).toEqual([]);expect(value.metadata.transcriptStatus).toBe('Unavailable');expect(value.metadata.transcriptDetail).toContain(recording?'archive contract':'no message recording');expect(fetcher.mock.calls).toHaveLength(3)
})
it('maps product messaging search to provider message media type',async()=>{
 const fetcher=vi.fn(async(_input:RequestInfo|URL,init?:RequestInit)=>{expect(JSON.parse(String(init?.body)).segmentFilters[0].predicates).toContainEqual({dimension:'mediaType',value:'message'});return ok({conversations:[detail()],totalHits:1})})
 const value=await source(fetcher).list({from:'2026-09-29T00:00:00Z',to:'2026-09-30T00:00:00Z',page:1,pageSize:5,channel:'messaging'});expect(value.conversations[0].channel).toBe('messaging');expect(normalizeGenesys(detail()).metadata.transcriptStatus).toBe('Not loaded')
})

it('respects explicit provider bot origin even on an agent-purpose communication',()=>{
 const data=content();data[1].normalizedMessage!.originatingEntity='Bot'
 expect(normalizeMessaging(id,messageInventory(provider,id),data).messages[1].speaker).toBe('bot')
})
it.each(['email','messaging'])('runs %s through ordinary channel policies, conditional waves, review and calibration',async channel=>{
 const conversation=await source(fixture({channel:channel==='messaging'?'message':'email'})).load(id)
 expect(matchPolicies(conversation,[{id:'digital',name:'Digital',description:'',enabled:true,criteria:{anyOf:[[{field:'channel',operator:'equals',value:channel}]]},evaluationFormIds:['form']}])).toHaveLength(1)
 const form:EvaluationForm={id:'digital',name:'Digital',description:'',version:1,status:'PUBLISHED',enabled:true,groups:[{id:'digital',name:'Digital',condition:{kind:'interaction_metadata',field:'channel',equals:channel}}],questions:[{id:'a',groupId:'digital',title:'A',type:'noul',instructions:'A',options:[],enabled:true,weight:1},{id:'b',groupId:'digital',title:'B',type:'noul',instructions:'B',options:[],enabled:true,weight:1,condition:{kind:'question_outcome',questionId:'a',outcomes:['Yes']}},{id:'c',title:'Voice only',type:'noul',instructions:'Voice',options:[],enabled:true,weight:1,condition:{kind:'interaction_metadata',field:'channel',equals:'voice'}}],scoring:{yesThreshold:.65,passScore:.7,criticalQuestionIds:[]}}
 const provider=vi.fn(async(request)=>fixtureEvaluation(request)),result=await evaluateForm({form,conversation,evaluatedAt:timestamp,evaluateQuestions:provider})
 expect(provider).toHaveBeenCalledTimes(2);expect(result.providerRequestCount).toBe(2);expect(result.questions[2].status).toBe('SKIPPED')
 const record={...recordEvaluation(conversation,form,result,[]),conversationSource:'genesys-cloud' as const}
 const review=buildReview(record,undefined,{action:'complete',expectedRevision:0,formId:form.id,formVersion:1,answers:[{questionId:'a',value:'Yes'},{questionId:'b',value:'Yes'}]},{userId:'reviewer'},timestamp)
 expect(review.comparison.total).toBe(2);expect(aggregateCalibration([{...record,humanReview:review}]).metrics.questionsReviewed).toBe(2)
})
