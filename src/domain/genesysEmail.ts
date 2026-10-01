import PostalMime from 'postal-mime'
import { convert } from 'html-to-text'
import type { GenesysDetail, GenesysParticipant } from './genesys'
import type { Message } from './types'

export const MAX_EMAIL_BYTES = 2_000_000
export interface RecordingEmail { id?:string; time?:string; from?:{email?:string;name?:string}; subject?:string; textBody?:string; htmlBody?:string }
export interface EmailRecording { id?:string; media?:string; sessionId?:string; startTime?:string; emailTranscript?:RecordingEmail[]; mediaUris?:Record<string,{mediaUri?:string}> }
const address = (value:string|undefined) => (value??'').replace(/^mailto:/i,'').trim().toLowerCase()
export function emailText(plain?:string,html?:string) {
  return (plain?.trim() ? plain : html ? convert(html,{wordwrap:false,selectors:[{selector:'img',format:'skip'},{selector:'script',format:'skip'},{selector:'style',format:'skip'},{selector:'a',options:{ignoreHref:true}}]}) : '').replace(/\r\n/g,'\n').trim()
}
export async function parseEmail(bytes:Uint8Array):Promise<RecordingEmail> {
  if(bytes.byteLength>MAX_EMAIL_BYTES)throw Error('Email content exceeds the 2 MB limit.')
  if(!/^[\w-]+:/m.test(new TextDecoder().decode(bytes.slice(0,8192))))throw Error('Malformed email headers.')
  const email=await PostalMime.parse(bytes,{maxNestingDepth:32,maxHeadersSize:64_000,maxRfc822NestingDepth:0,forceRfc822Attachments:true})
  const from=email.from&&'address' in email.from?email.from:undefined
  return {id:email.messageId,time:email.date,from:from?{email:from.address,name:from.name}:undefined,subject:email.subject,textBody:email.text,htmlBody:email.html}
}
/** Match sender to a provider participant's own address, then use that participant's purpose. */
export function emailParticipant(detail:GenesysDetail,recording:EmailRecording,email:RecordingEmail):GenesysParticipant {
  const sender=address(email.from?.email)
  const participants=(detail.participants??[]).filter(p=>['agent','user','customer','external'].includes((p.purpose??'').toLowerCase()))
  const matches=sender?participants.filter(p=>p.sessions?.some(s=>s.mediaType==='email'&&address(s.addressSelf)===sender)):[]
  if(matches.length&&new Set(matches.map(p=>['agent','user'].includes(p.purpose??'')?'agent':'customer')).size===1)return matches[0]
  // The recording session is authoritative only for a single logical email.
  const session=recording.emailTranscript&&recording.emailTranscript.length>1?undefined:participants.find(p=>p.sessions?.some(s=>s.sessionId===recording.sessionId))
  if(session&&!sender)return session
  throw Error('Email sender could not be mapped to a Genesys participant.')
}
export function normalizeEmails(detail:GenesysDetail,items:Array<{recording:EmailRecording;email:RecordingEmail}>):Message[] {
  const seen=new Map<string,string>(),messages:Message[]=[]
  for(const {recording,email} of items){
    const participant=emailParticipant(detail,recording,email),text=emailText(email.textBody,email.htmlBody)
    if(!text)continue
    const timestamp=email.time??recording.startTime
    if(!timestamp||!Number.isFinite(Date.parse(timestamp)))throw Error('Email has no valid provider timestamp.')
    const id=email.id??`${recording.id}:${timestamp}`
    const signature=JSON.stringify([timestamp,participant.participantId,participant.purpose,email.subject??'',text])
    if(seen.has(id)){if(seen.get(id)!==signature)throw Error('Conflicting email message identity.');continue}
    seen.set(id,signature)
    messages.push({id:`${detail.conversationId}:email:${id}`,timestamp:new Date(timestamp).toISOString(),speaker:['agent','user'].includes(participant.purpose??'')?'agent':'customer',text,...(email.subject?{subject:email.subject}:{}),...(email.from?.name?{senderName:email.from.name}:{}),...(participant.userId||participant.participantId?{senderId:participant.userId??participant.participantId}:{})})
  }
  return messages.sort((a,b)=>a.timestamp.localeCompare(b.timestamp)||a.id.localeCompare(b.id))
}
export function emailMediaUrl(value:string):URL {
  const url=new URL(value)
  const aws=/^[a-z0-9.-]+\.(amazonaws\.com|cloudfront\.net)$/i.test(url.hostname)
  const genesys=/^api-downloads\.(mypurecloud\.(com|ie|de|com\.au|jp)|us[ew]2\.pure\.cloud|[a-z0-9-]+\.pure\.cloud)$/i.test(url.hostname)
  if(url.protocol!=='https:'||url.port&&url.port!=='443'||url.username||url.password||(!aws&&!genesys))throw Error('Unrecognized email media host.')
  return url
}
export async function downloadEmail(url:URL,fetcher:typeof fetch):Promise<Uint8Array> {
  const reply=await fetcher(url,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(20_000)})
  if(!reply.ok)throw Error('Email media download failed.')
  if(Number(reply.headers.get('content-length')??0)>MAX_EMAIL_BYTES)throw Error('Email content exceeds the 2 MB limit.')
  if(!reply.body)throw Error('Email media is empty.')
  const reader=reply.body.getReader(),chunks:Uint8Array[]=[];let size=0
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>MAX_EMAIL_BYTES)throw Error('Email content exceeds the 2 MB limit.');chunks.push(part.value)}}finally{await reader.cancel()}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}return bytes
}
