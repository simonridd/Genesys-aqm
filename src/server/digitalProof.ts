/** Read-only, explicitly bounded proof. No Firestore, Jev, credential writes or raw content logs. */
import { ClientCredentialsGenesys } from './providers'
import type { Region } from '../domain/genesysAuth'
export async function digitalProof(fetcher:typeof fetch=fetch,env:NodeJS.ProcessEnv=process.env){
  const to=env.AQM_DIGITAL_PROOF_TO??new Date().toISOString(),from=env.AQM_DIGITAL_PROOF_FROM??new Date(Date.parse(to)-7*86400_000).toISOString()
  const calls:Array<{endpoint:string;status:number}>=[]
  const boundedFetch:typeof fetch=async(input,init)=>{const response=await fetcher(input,init),path=new URL(String(input)).pathname;calls.push({endpoint:path.replace(/[a-f0-9-]{20,64}/gi,':id'),status:response.status});return response}
  const reader=new ClientCredentialsGenesys(env.GENESYS_REGION as Region,env.GENESYS_CLIENT_ID!,env.GENESYS_CLIENT_SECRET!,boundedFetch)
  const maxLoads=env.AQM_DIGITAL_PROOF_MAX_LOADS==='1'?1:2
  const results=[]
  for(const channel of ['email','messaging']){
    const start=calls.length
    try{
      const page=await reader.list({from,to,channel,page:1,pageSize:5}),loaded=[]
      for(const candidate of page.conversations.slice(0,maxLoads)){
        const conversation=await reader.load(candidate.conversationId)
        loaded.push({conversationId:conversation.conversationId,status:conversation.metadata.transcriptStatus,detail:conversation.metadata.transcriptDetail,contentSource:conversation.metadata.contentSource,providerMessageCount:conversation.metadata.providerMessageCount,normalizedMessageCount:conversation.messages.length,speakerCounts:Object.fromEntries(['customer','agent','bot','system'].map(s=>[s,conversation.messages.filter(m=>m.speaker===s).length])),textAvailable:conversation.messages.length>0})
      }
      results.push({channel,candidatesObserved:page.conversations.length,loaded,endpoints:calls.slice(start),pendingSimon:!loaded.some(c=>c.textAvailable)})
    }catch{results.push({channel,pendingSimon:true,endpoints:calls.slice(start),blocker:'Read-only provider discovery/retrieval failed; inspect endpoint statuses.'})}
  }
  return {from,to,results,jevRequests:0}
}
if(process.argv[1]?.endsWith('digitalProof.mjs'))digitalProof().then(result=>console.log(JSON.stringify({aqmDigitalProof:result}))).catch(()=>{console.error('Digital proof failed; no content was logged.');process.exitCode=1})
