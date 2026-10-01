import { apiOrigin } from './manualClient'
import { getSession, onDisconnect, type AuthSession } from './genesysAuth'
import { GenesysCloudConversationSource } from './sources'
import { conversationCache, identityScope, type ConversationCache } from './conversationCache'
import type { Conversation, ConversationPage, ConversationQuery, ConversationSource } from './types'
let generation=0
export async function clearGenesysCache(scope?:string){generation++;await conversationCache.clear(scope)}
onDisconnect(previous=>{void clearGenesysCache(identityScope(previous)??undefined)})
const identities=new WeakMap<AuthSession,Promise<void>>()
export class CachedGenesysSource implements ConversationSource {
  readonly id='genesys-cloud';readonly name='Genesys Cloud';readonly realData=true
  readonly capabilities={pagination:true,filters:['queue','agent','channel','direction'] as Array<'queue'|'agent'|'channel'|'direction'>}
  lastSearch:{fetchedAt:number;stale:boolean}|null=null
  lastTranscript:{fetchedAt:number;cached:boolean}|null=null
  constructor(private source:ConversationSource=new GenesysCloudConversationSource(),private current= getSession,private cache:ConversationCache=conversationCache){}
  status(){return this.source.status()}
  private async context(){const session=this.current();if(!session||session.expiresAt<=Date.now()+30_000)throw Error('Connect to Genesys Cloud before viewing cached data.')
    if(!session.userId){let pending=identities.get(session);if(!pending){pending=this.source.status().then(status=>{if(status.state==='connected')session.userId=status.userId});identities.set(session,pending)}await pending}
    if(this.current()!==session||session.expiresAt<=Date.now()+30_000)throw Error('Genesys session changed. Connect again.')
    return {session,scope:identityScope(session),generation}
  }
  private active(context:{session:AuthSession;generation:number}){if(this.current()!==context.session||context.session.expiresAt<=Date.now()+30_000||generation!==context.generation)throw Error('Genesys session or cache changed. Search again.')}
  async list(query:ConversationQuery,refresh=false):Promise<ConversationPage>{const context=await this.context()
    if(context.scope&&!refresh){const hit=await this.cache.search(context.scope,query);this.active(context);if(hit){this.lastSearch={fetchedAt:hit.fetchedAt,stale:hit.stale};return hit.value}}
    const value=await this.source.list(query);this.active(context)
    if(context.scope)await this.cache.saveSearch(context.scope,query,value)
    this.active(context);this.lastSearch={fetchedAt:Date.now(),stale:false};return value
  }
  async load(id:string,refresh=false):Promise<Conversation>{const context=await this.context()
    if(context.scope&&!refresh){const hit=await this.cache.transcript(context.scope,id);this.active(context);if(hit&&!hit.stale){this.lastTranscript={fetchedAt:hit.fetchedAt,cached:true};return hit.value}}
    const value=await this.source.load(id);this.active(context)
    if(context.scope)await this.cache.saveTranscript(context.scope,value)
    this.active(context);this.lastTranscript={fetchedAt:Date.now(),cached:false};return value
  }
  async recentCandidates(){const context=await this.context();const hit=context.scope?await this.cache.recent(context.scope):null;this.active(context);return hit&&Date.parse(hit.query.from)>=Date.now()-7*86400_000&&Date.parse(hit.query.to)<=Date.now()+60_000?hit:null}
  async withQueueNames(items:Conversation[]){const context=await this.context();const value='withQueueNames' in this.source?await (this.source as GenesysCloudConversationSource).withQueueNames(items):items;this.active(context);return value}
}
export const browserGenesysSource=new CachedGenesysSource(new GenesysCloudConversationSource(getSession,fetch,apiOrigin?async id=>{
  const session=getSession();if(!session)throw Error('Connect to Genesys Cloud.')
  const response=await fetch(`${apiOrigin}/api/conversations/${encodeURIComponent(id)}/email`,{headers:{Authorization:`Bearer ${session.accessToken}`}})
  if(!response.ok)throw Error('Email content could not be retrieved through the automation service.')
  return response.json() as Promise<Conversation>
}:undefined))
