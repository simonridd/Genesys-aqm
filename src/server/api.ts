import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'
import { OAuth2Client } from 'google-auth-library'
import { REGIONS, type Region } from '../domain/genesysAuth'
import { validateForm } from '../domain/forms'
import type { EvaluationForm, InteractionPolicy, MonitoringPeriod } from '../domain/types'
import { FirestoreStore, type Store } from './store'
import { ClientCredentialsGenesys, DirectJev } from './providers'
import { executeServerRun, manualRunId, planFingerprint, planServerRun, schedulerTick, type RunnerDeps } from './runner'
import { nextDueAfter, validateSchedule, type Schedule } from './schedules'

export interface ApiConfig { origin:string; region:Region; allowedUserIds:Set<string>; schedulerEmail:string; schedulerAudience:string }
const oidc=new OAuth2Client()
const json=(response:ServerResponse,status:number,value:unknown)=>{response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});response.end(JSON.stringify(value))}
const bearer=(request:IncomingMessage)=>/^Bearer (.+)$/.exec(request.headers.authorization??'')?.[1]
async function body(request:IncomingMessage):Promise<unknown>{let text='';for await(const chunk of request){text+=String(chunk);if(text.length>100_000)throw new Error('Request body is too large.')}return JSON.parse(text||'{}') as unknown}
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const id=(v:string)=>/^[A-Za-z0-9_-]{1,100}$/.test(v)
async function browserAuthorized(request:IncomingMessage,config:ApiConfig,fetcher:typeof fetch){
  const token=bearer(request);if(!token||!config.allowedUserIds.size)return false
  const reply=await fetcher(`${REGIONS[config.region].api}/api/v2/users/me`,{headers:{Authorization:`Bearer ${token}`}})
  if(!reply.ok)return false
  const user=await reply.json() as {id?:string}
  return !!user.id&&config.allowedUserIds.has(user.id)
}
async function schedulerAuthorized(request:IncomingMessage,config:ApiConfig){
  const token=bearer(request);if(!token||!config.schedulerAudience||!config.schedulerEmail)return false
  try{const ticket=await oidc.verifyIdToken({idToken:token,audience:config.schedulerAudience});const p=ticket.getPayload();return p?.email===config.schedulerEmail&&p.email_verified===true}catch{return false}
}
export function createApi(deps:RunnerDeps,config:ApiConfig,fetcher:typeof fetch=fetch){
  return createServer(async(request,response)=>{
    const origin=request.headers.origin
    if(origin===config.origin){response.setHeader('Access-Control-Allow-Origin',config.origin);response.setHeader('Vary','Origin');response.setHeader('Access-Control-Allow-Methods','GET,PUT,POST,OPTIONS');response.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type')}
    if(request.method==='OPTIONS'){json(response,origin===config.origin?204:403,{});return}
    const url=new URL(request.url??'/',`http://${request.headers.host??'localhost'}`)
    if(url.pathname==='/health'&&request.method==='GET'){json(response,200,{status:'ok',schemaVersion:1});return}
    if(url.pathname==='/internal/scheduler/tick'){
      if(request.method!=='POST'||!await schedulerAuthorized(request,config)){json(response,403,{error:'Forbidden'});return}
      try{json(response,200,{outcomes:await schedulerTick(deps)})}catch{json(response,500,{error:'Scheduler tick failed.'})}return
    }
    if(!url.pathname.startsWith('/api/')||!await browserAuthorized(request,config,fetcher)){json(response,401,{error:'Unauthorized'});return}
    try{
      const path=url.pathname
      if(request.method==='GET'){
        if(path==='/api/forms'){json(response,200,{items:await deps.store.forms()});return}
        if(path==='/api/policies'){json(response,200,{items:await deps.store.policies()});return}
        if(path==='/api/schedules'){json(response,200,{items:await deps.store.schedules()});return}
        if(path==='/api/runs'){json(response,200,{items:await deps.store.runs()});return}
        if(path==='/api/evaluations'){json(response,200,{items:await deps.store.evaluations()});return}
      }
      if(request.method==='PUT'){
        const match=/^\/api\/(forms|policies|schedules)\/([A-Za-z0-9_-]+)$/.exec(path)
        if(match){const value=await body(request);if(!obj(value)||value.id!==match[2]||!id(match[2]))throw new Error('Invalid resource identity.')
          if(match[1]==='forms'){const form=value as unknown as EvaluationForm;if(validateForm(form).length)throw new Error('Invalid evaluation form.');await deps.store.putForm(form)}
          if(match[1]==='policies'){const policy=value as unknown as InteractionPolicy;if(!policy.name||!Array.isArray(policy.evaluationFormIds)||!Array.isArray(policy.criteria?.anyOf))throw new Error('Invalid policy.');await deps.store.putPolicy(policy)}
          if(match[1]==='schedules'){const schedule=value as unknown as Schedule;validateSchedule(schedule);const prior=await deps.store.schedule(schedule.id);if(prior?.policyId!==undefined&&prior.policyId!==schedule.policyId)throw new Error('Schedule policy cannot change.');schedule.nextDueAt=nextDueAfter(schedule,deps.now().toISOString());schedule.lastAttemptedAt=prior?.lastAttemptedAt;schedule.lastSuccessfulAt=prior?.lastSuccessfulAt;await deps.store.putSchedule(schedule)}
          json(response,200,{ok:true});return}
      }
      const match=/^\/api\/policies\/([A-Za-z0-9_-]+)\/(plan|run)$/.exec(path)
      if(request.method==='POST'&&match){const policy=await deps.store.policy(match[1]);if(!policy){json(response,404,{error:'Policy not found.'});return}
        const input=await body(request);if(!obj(input)||!obj(input.period)||typeof input.period.periodStart!=='string'||typeof input.period.periodEnd!=='string')throw new Error('Invalid period.')
        const period=input.period as unknown as MonitoringPeriod
        const prepared=await planServerRun(deps,policy,period)
        const fingerprint=planFingerprint(policy,period,prepared.plan.selected)
        if(match[2]==='plan'){const p=prepared.plan;json(response,200,{fingerprint,period,policyId:policy.id,policyVersion:policy.version??1,candidateCount:p.candidateCount,eligibleCount:p.eligibleCount,sampledCount:p.sampledCount,evaluableCount:p.evaluableCount,expectedEvaluations:p.expectedEvaluations,transcriptUnavailableCount:p.transcriptUnavailableCount,selected:p.selected.map(x=>({conversationId:x.conversation.conversationId,pendingFormIds:x.pendingFormIds,transcriptAvailable:x.transcriptAvailable}))});return}
        if(input.fingerprint!==fingerprint){json(response,409,{error:'Plan changed. Preview again before execution.'});return}
        const runId=manualRunId(policy,period)
        const run=await executeServerRun(deps,policy,period,runId,'manual',prepared)
        json(response,200,{run});return
      }
      json(response,404,{error:'Not found.'})
    }catch(error){json(response,400,{error:error instanceof Error?error.message:'Request failed.'})}
  })
}
export function startApi(){
  const required=['AQM_ALLOWED_ORIGIN','AQM_SCHEDULER_EMAIL','AQM_SCHEDULER_AUDIENCE','GENESYS_CLIENT_ID','GENESYS_CLIENT_SECRET','JEV_API_KEY','GENESYS_REGION'] as const
  for(const name of required)if(!process.env[name])throw new Error(`Missing server configuration: ${name}`)
  const region=process.env.GENESYS_REGION as Region;if(!REGIONS[region])throw new Error('Invalid Genesys region.')
  initializeApp()
  const store:Store=new FirestoreStore(getFirestore())
  const deps:RunnerDeps={store,genesys:new ClientCredentialsGenesys(region,process.env.GENESYS_CLIENT_ID!,process.env.GENESYS_CLIENT_SECRET!),jev:new DirectJev(process.env.JEV_API_KEY!),now:()=>new Date()}
  const server=createApi(deps,{origin:process.env.AQM_ALLOWED_ORIGIN!,region,allowedUserIds:new Set((process.env.AQM_ALLOWED_GENESYS_USER_IDS??'').split(',').map(s=>s.trim()).filter(Boolean)),schedulerEmail:process.env.AQM_SCHEDULER_EMAIL!,schedulerAudience:process.env.AQM_SCHEDULER_AUDIENCE!})
  server.listen(Number(process.env.PORT??8080),'0.0.0.0')
}
