import type { AuthSession } from './genesysAuth'
import type { Conversation, ConversationPage, ConversationQuery } from './types'
export const SEARCH_TTL=15*60_000, TRANSCRIPT_TTL=24*60*60_000
export const MAX_SEARCHES=30, MAX_TRANSCRIPTS=100, MAX_ENTRY_BYTES=5_000_000, MAX_CACHE_BYTES=30_000_000
export function identityScope(session:AuthSession|null):string|null {
  if(!session||session.expiresAt<=Date.now()+30_000||!session.userId)return null
  return JSON.stringify([session.region,session.clientId,session.organizationId??'',session.userId])
}
export function queryKey(query:ConversationQuery):string {return JSON.stringify([new Date(query.from).toISOString(),new Date(query.to).toISOString(),query.queue??'',query.agent??'',query.channel??'',query.direction??'',query.page,query.pageSize])}
const metadataKeys=['source','status','conversationEnd','direction','agent','queue','queueId','topic','wrapUpCode','durationSeconds','sessionId','transcriptStatus','transcriptDetail']
/** Copy only the normalized application schema; no provider payloads, tokens or URL fields. */
export function normalizedConversation(value:Conversation,transcript=true):Conversation {
  return {conversationId:value.conversationId,startedAt:value.startedAt,channel:value.channel,agent:{id:value.agent.id,name:value.agent.name},customer:{id:value.customer.id,name:value.customer.name},metadata:Object.fromEntries(metadataKeys.filter(key=>typeof value.metadata[key]==='string').map(key=>[key,value.metadata[key]])),messages:transcript?value.messages.map(message=>({id:message.id,timestamp:message.timestamp,speaker:message.speaker,text:message.text,...(message.subject?{subject:message.subject}:{}),...(message.senderName?{senderName:message.senderName}:{})})):[]}
}
export interface CacheEntry {key:string;scope:string;kind:'search'|'transcript';fetchedAt:number;query?:ConversationQuery;value:ConversationPage|Conversation}
export interface CacheBackend {all():Promise<CacheEntry[]>; put(entry:CacheEntry):Promise<void>; remove(keys:string[]):Promise<void>}
export class MemoryCacheBackend implements CacheBackend {
  readonly entries=new Map<string,CacheEntry>()
  async all(){return structuredClone([...this.entries.values()])}
  async put(entry:CacheEntry){this.entries.set(entry.key,structuredClone(entry))}
  async remove(keys:string[]){for(const key of keys)this.entries.delete(key)}
}
export class IndexedDbCacheBackend implements CacheBackend {
  private db:Promise<IDBDatabase>|undefined
  private open(){return this.db??=new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('genesys-aqm-conversations-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('entries',{keyPath:'key'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Cache unavailable.'))})}
  private async transaction<T>(mode:IDBTransactionMode,action:(store:IDBObjectStore)=>IDBRequest<T>|void):Promise<T>{const db=await this.open();return new Promise<T>((resolve,reject)=>{const tx=db.transaction('entries',mode);const request=action(tx.objectStore('entries'));let value:T; if(request)request.onsuccess=()=>{value=request.result};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
  all(){return this.transaction('readonly',store=>store.getAll()) as Promise<CacheEntry[]>}
  async put(entry:CacheEntry){await this.transaction('readwrite',store=>store.put(entry))}
  async remove(keys:string[]){await this.transaction('readwrite',store=>{for(const key of keys)store.delete(key)})}
}
/** IndexedDB failure falls back to memory without affecting browsing. Serialize cleanup with writes. */
export class ConversationCache {
  private memory=new MemoryCacheBackend();private persistent=true;private tail:Promise<unknown>=Promise.resolve()
  constructor(private backend:CacheBackend=new IndexedDbCacheBackend(),private now=()=>Date.now()){}
  private serial<T>(operation:()=>Promise<T>):Promise<T>{const result=this.tail.then(operation,operation);this.tail=result.catch(()=>{});return result}
  private async all(){if(this.persistent)try{const entries=await this.backend.all();this.memory.entries.clear();for(const entry of entries)await this.memory.put(entry);return entries}catch{this.persistent=false}return this.memory.all()}
  private async remove(keys:string[]){await this.memory.remove(keys);if(this.persistent)try{await this.backend.remove(keys)}catch{this.persistent=false}}
  private async save(entry:CacheEntry){if(new TextEncoder().encode(JSON.stringify(entry)).length>MAX_ENTRY_BYTES)return;await this.memory.put(entry);if(this.persistent)try{await this.backend.put(entry)}catch{this.persistent=false}
    const entries=await this.all();const evicted=['search','transcript'].flatMap(kind=>entries.filter(item=>item.kind===kind).sort((a,b)=>b.fetchedAt-a.fetchedAt).slice(kind==='search'?MAX_SEARCHES:MAX_TRANSCRIPTS).map(item=>item.key));let bytes=0;for(const item of entries.filter(item=>!evicted.includes(item.key)).sort((a,b)=>b.fetchedAt-a.fetchedAt)){bytes+=new TextEncoder().encode(JSON.stringify(item)).length;if(bytes>MAX_CACHE_BYTES)evicted.push(item.key)}await this.remove(evicted)
  }
  search(scope:string,query:ConversationQuery){return this.serial(async()=>{const item=(await this.all()).find(entry=>entry.scope===scope&&entry.kind==='search'&&entry.key===JSON.stringify([scope,'search',queryKey(query)]));return item?{value:structuredClone(item.value) as ConversationPage,fetchedAt:item.fetchedAt,stale:this.now()-item.fetchedAt>=SEARCH_TTL}:null})}
  saveSearch(scope:string,query:ConversationQuery,value:ConversationPage){return this.serial(()=>this.save({key:JSON.stringify([scope,'search',queryKey(query)]),scope,kind:'search',query:{from:query.from,to:query.to,page:query.page,pageSize:query.pageSize,queue:query.queue,agent:query.agent,channel:query.channel,direction:query.direction},value:{conversations:value.conversations.map(item=>normalizedConversation(item,false)),page:value.page,pageSize:value.pageSize,total:value.total,hasMore:value.hasMore},fetchedAt:this.now()}))}
  transcript(scope:string,id:string){return this.serial(async()=>{const item=(await this.all()).find(entry=>entry.key===JSON.stringify([scope,'transcript',id])&&entry.scope===scope);return item?{value:normalizedConversation(item.value as Conversation),fetchedAt:item.fetchedAt,stale:this.now()-item.fetchedAt>=TRANSCRIPT_TTL}:null})}
  saveTranscript(scope:string,value:Conversation){return this.serial(()=>value.metadata.status==='Completed'&&value.messages.length?this.save({key:JSON.stringify([scope,'transcript',value.conversationId]),scope,kind:'transcript',value:normalizedConversation(value),fetchedAt:this.now()}):Promise.resolve())}
  clear(scope?:string){return this.serial(async()=>{await this.remove((await this.all()).filter(entry=>!scope||entry.scope===scope).map(entry=>entry.key))})}
  stats(scope?:string){return this.serial(async()=>{const entries=(await this.all()).filter(entry=>!scope||entry.scope===scope);return {searches:entries.filter(entry=>entry.kind==='search').length,transcripts:entries.filter(entry=>entry.kind==='transcript').length,oldest:entries.length?Math.min(...entries.map(entry=>entry.fetchedAt)):null,newest:entries.length?Math.max(...entries.map(entry=>entry.fetchedAt)):null}})}
  recent(scope:string){return this.serial(async()=>{const entry=(await this.all()).filter(entry=>entry.scope===scope&&entry.kind==='search'&&this.now()-entry.fetchedAt<SEARCH_TTL).sort((a,b)=>b.fetchedAt-a.fetchedAt)[0];return entry?{query:entry.query!,value:entry.value as ConversationPage,fetchedAt:entry.fetchedAt}:null})}
}
export const conversationCache=new ConversationCache()
