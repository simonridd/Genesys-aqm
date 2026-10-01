import type { Message, Speaker } from './types'

export const MAX_DIGITAL_MESSAGES = 500
export const DIGITAL_BATCH_SIZE = 100
export const MAX_DIGITAL_BODY = 100_000
export const MAX_DIGITAL_TEXT = 1_000_000
export const MAX_DIGITAL_RESPONSE = 5_000_000
export class DigitalContentError extends Error {}
export class DigitalLimitError extends DigitalContentError {}
export function boundMessages(count:number) { if(count>MAX_DIGITAL_MESSAGES)throw new DigitalLimitError('Digital message count exceeds the 500 message limit; content was not evaluated.') }
export function boundText(messages:Message[]) {
  boundMessages(messages.length)
  let size=0
  for(const message of messages){const length=new TextEncoder().encode(message.text).length; if(length>MAX_DIGITAL_BODY)throw new DigitalLimitError('Digital message body exceeds the 100 KB limit; content was not evaluated.');size+=length; if((message.subject?.length??0)>1000||(message.senderName?.length??0)>256||(message.senderId?.length??0)>128)throw new DigitalLimitError('Digital message identity metadata exceeds the limit.')}
  if(size>MAX_DIGITAL_TEXT)throw new DigitalLimitError('Digital transcript exceeds the 1 MB limit; content was not evaluated.')
  return messages
}
export async function boundedJson(response:Response):Promise<unknown> {
  if(Number(response.headers.get('content-length')??0)>MAX_DIGITAL_RESPONSE)throw new DigitalLimitError('Provider response exceeds the 5 MB limit.')
  if(!response.body)throw new DigitalContentError('Empty provider content response.')
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>MAX_DIGITAL_RESPONSE)throw new DigitalLimitError('Provider response exceeds the 5 MB limit.');chunks.push(part.value)}}finally{await reader.cancel()}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown
}
export function speakerForPurpose(purpose?:string):Speaker|undefined {
  switch(purpose?.toLowerCase()){case 'customer':case 'external':return 'customer';case 'agent':case 'user':return 'agent';case 'bot':return 'bot';case 'workflow':case 'system':case 'ivr':return 'system';default:return undefined}
}
export interface DigitalParticipant {id?:string;name?:string;purpose?:string;user?:{id?:string};messages?:Array<{messageId?:string;messageTime?:string}>}
export interface MessageConversation {id?:string;participants?:DigitalParticipant[]}
interface VisibleCard {title?:string;description?:string;actions?:Array<{text?:string}>}
interface DigitalContent {contentType?:string;text?:{body?:string};quickReply?:{text?:string};buttonResponse?:{text?:string};card?:VisibleCard;carousel?:{cards?:VisibleCard[]}}
export interface MessageData {id?:string;conversationId?:string;timestamp?:string;direction?:string;createdBy?:{id?:string};normalizedMessage?:{type?:string;text?:string;content?:DigitalContent[];originatingEntity?:string}}
export function messageInventory(conversation:MessageConversation,id:string) {
  if(conversation.id!==id||!Array.isArray(conversation.participants))throw new DigitalContentError('Unexpected message conversation identity or participant structure.')
  const inventory=new Map<string,DigitalParticipant[]>()
  for(const participant of conversation.participants)for(const item of participant.messages??[]){
    if(!item.messageId||! /^[a-zA-Z0-9_-]{1,128}$/.test(item.messageId))throw new DigitalContentError('Invalid provider message identity.')
    inventory.set(item.messageId,[...(inventory.get(item.messageId)??[]),participant]);boundMessages(inventory.size)
  }
  if(!inventory.size)throw new DigitalContentError('Direct conversation API returned no historical message IDs.')
  return inventory
}
const cardText=(card:VisibleCard)=>[card.title,card.description,...(card.actions??[]).map(a=>a.text)].filter((x):x is string=>typeof x==='string'&&!!x.trim())
export function visibleMessageText(message:MessageData):string {
  const normalized=message.normalizedMessage
  // Receipts and events are not human-visible messages.
  if(!normalized||!['text','structured'].includes((normalized.type??'').toLowerCase()))return ''
  const parts=normalized.text?.trim()?[normalized.text]:[]
  for(const content of normalized.content??[]){switch(content.contentType?.toLowerCase()){
    case 'text':if(content.text?.body)parts.push(content.text.body);break
    case 'quickreply':if(content.quickReply?.text)parts.push(content.quickReply.text);break
    case 'buttonresponse':if(content.buttonResponse?.text)parts.push(content.buttonResponse.text);break
    case 'card':if(content.card)parts.push(...cardText(content.card));break
    case 'carousel':for(const card of content.carousel?.cards??[])parts.push(...cardText(card));break
  }}
  return [...new Set(parts.map(p=>p.replace(/\r\n/g,'\n').trim()).filter(Boolean))].join('\n')
}
export function normalizeMessaging(id:string,inventory:Map<string,DigitalParticipant[]>,data:MessageData[]) {
  const byId=new Map<string,MessageData>()
  for(const item of data){if(!item.id||!inventory.has(item.id)||item.conversationId&&item.conversationId!==id)throw new DigitalContentError('Unexpected provider message identity.');if(byId.has(item.id))throw new DigitalContentError('Duplicate provider message identity.');byId.set(item.id,item)}
  if(byId.size!==inventory.size)throw new DigitalContentError('Direct message content is incomplete.')
  const messages:Message[]=[];let nonText=0
  for(const [messageId,participants] of inventory){
    const item=byId.get(messageId)!,text=visibleMessageText(item)
    if(!text){nonText++;continue}
    const creator=item.createdBy?.id
    const origin=item.normalizedMessage?.originatingEntity?.toLowerCase()
    let candidates=creator?participants.filter(p=>p.user?.id===creator||p.id===creator):participants
    if(origin==='bot'){const bots=candidates.filter(p=>speakerForPurpose(p.purpose)==='bot');if(bots.length)candidates=bots}
    // Received IDs can appear on more than one participant. Inbound direction and
    // createdBy narrow those authoritative participants; names never imply roles.
    if(!creator&&item.direction?.toLowerCase()==='inbound')candidates=candidates.filter(p=>speakerForPurpose(p.purpose)==='customer')
    const roles=new Set(candidates.map(p=>speakerForPurpose(p.purpose)))
    if(!candidates.length||roles.size!==1||roles.has(undefined))throw new DigitalContentError('Message sender could not be mapped unambiguously to a Genesys participant.')
    const participant=candidates[0],timestamp=item.timestamp
    if(!timestamp||!Number.isFinite(Date.parse(timestamp)))throw new DigitalContentError('Message has no valid provider timestamp.')
    messages.push({id:`${id}:message:${messageId}`,timestamp:new Date(timestamp).toISOString(),speaker:origin==='bot'?'bot':speakerForPurpose(participant.purpose)!,text,...(participant.name?{senderName:participant.name}:{}),...(participant.user?.id||participant.id?{senderId:participant.user?.id??participant.id}: {})})
  }
  return {messages:boundText(messages.sort((a,b)=>a.timestamp.localeCompare(b.timestamp)||a.id.localeCompare(b.id))),nonText}
}
