import { ProviderFailure, failureCode } from '../domain/providerFailure'
import { GenesysCloudConversationSource } from '../domain/sources'
import { REGIONS, type Region } from '../domain/genesysAuth'
import { fromJevResponse, toJevRequest } from '../provider/jev'
import type { Conversation, ConversationPage, ConversationQuery, EvaluationRequest, EvaluationResult } from '../domain/types'

export interface GenesysReader { list(query:ConversationQuery):Promise<ConversationPage>; load(id:string):Promise<Conversation>; withQueueNames(items:Conversation[]):Promise<Conversation[]> }
export interface JevEvaluator { evaluate(request:EvaluationRequest):Promise<EvaluationResult> }
export class ClientCredentialsGenesys implements GenesysReader {
  private token?: { value:string; until:number }
  constructor(private readonly region:Region,private readonly clientId:string,private readonly clientSecret:string,private readonly fetcher:typeof fetch=fetch) {
    if (!REGIONS[region] || !clientId || !clientSecret) throw new Error('Genesys automation credentials are not configured.')
  }
  private async source() {
    try {
    if (!this.token || this.token.until <= Date.now()+60_000) {
      const basic=Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
      const response=await this.fetcher(`${REGIONS[this.region].login}/oauth/token`,{method:'POST',headers:{Authorization:`Basic ${basic}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'})
      if (!response.ok) throw new ProviderFailure('GENESYS_AUTH_FAILURE',`Genesys automation authentication failed (HTTP ${response.status}).`,response.status)
      const payload=await response.json() as {access_token?:string;expires_in?:number}
      if (!payload.access_token || !Number.isFinite(payload.expires_in) || payload.expires_in!<=0) throw new ProviderFailure('GENESYS_AUTH_FAILURE','Genesys automation returned an invalid token.')
      this.token={value:payload.access_token,until:Date.now()+payload.expires_in!*1000}
    }
    return new GenesysCloudConversationSource(()=>({region:this.region,clientId:this.clientId,accessToken:this.token!.value,expiresAt:this.token!.until}),async (url,init)=>{const response=await this.fetcher(url,init);if(response.status===401)throw new ProviderFailure('GENESYS_AUTH_FAILURE','Genesys authorization was rejected.',401);return response})
    } catch(error){throw new ProviderFailure(failureCode(error,'GENESYS_AUTH_FAILURE'),error instanceof Error?error.message:'Genesys authentication failed.')}
  }
  private async query<T>(fn:(source:GenesysCloudConversationSource)=>Promise<T>):Promise<T>{try{return await fn(await this.source())}catch(error){throw new ProviderFailure(failureCode(error,'GENESYS_QUERY_FAILURE'),error instanceof Error?error.message:'Genesys query failed.')}}
  async list(query:ConversationQuery){return this.query(source=>source.list(query))}
  async load(id:string){return this.query(source=>source.load(id))}
  async withQueueNames(items:Conversation[]){return this.query(source=>source.withQueueNames(items))}
}
export class DirectJev implements JevEvaluator {
  constructor(private readonly key:string,private readonly fetcher:typeof fetch=fetch){if(!key)throw new Error('Jev automation key is not configured.')}
  async evaluate(request:EvaluationRequest):Promise<EvaluationResult>{
    const response=await this.fetcher('https://api.typesafe.ai/v1/systemone',{method:'POST',headers:{Authorization:`Bearer ${this.key}`,'Content-Type':'application/json'},body:JSON.stringify(toJevRequest(request))})
    if(!response.ok)throw new Error(`Jev evaluation failed (HTTP ${response.status}).`)
    return fromJevResponse(request,await response.json() as unknown)
  }
}
