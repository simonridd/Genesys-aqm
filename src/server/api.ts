import { savePolicy, duplicatePolicy } from './policyAuthoring'
import { cloneForm, importDefinition } from '../domain/portability'
import { destinationInput, ruleInput, safeDestination, requestTest, notificationTick, type Providers } from './notifications'
import { EmailProvider, WebhookProvider, secretManagerResolver } from './notificationProviders'
import type { NotificationDestination, NotificationRule } from '../domain/notifications'
import { randomUUID } from 'node:crypto'
import { auditContext } from './audit'
import { Forbidden, sessionAccess, requirePermission, governanceSettings, planPurge, executePurge, auditPage } from './governance'
import { roles, validateGovernance, type RoleAssignment, type Permission } from '../domain/governance'
import { StoreConflict } from './store'
import { monitoringAlerts, defaultAlertConfig } from './alerts'
import { alertTypes, type OperationalAlert } from '../domain/operationalAlerts'
import { assertAssetWrite } from '../domain/groupAssets'
import type { QuestionGroupAsset } from '../domain/types'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'
import { OAuth2Client } from 'google-auth-library'
import { GenesysCloudConversationSource } from '../domain/sources'
import { REGIONS, type Region } from '../domain/genesysAuth'
import { formStatus, productionReadinessErrors, sameDefinition } from '../domain/formLifecycle'
import type { EvaluationForm, InteractionPolicy, MonitoringPeriod } from '../domain/types'
import { FirestoreStore, ReviewConflict, type Store } from './store'
import { ClientCredentialsGenesys, DirectJev } from './providers'
import { executeServerRun, manualRunId, planFingerprint, planServerRun, schedulerTick, type RunnerDeps } from './runner'
import { nextDueAfter, validateSchedule, type Schedule } from './schedules'
import { operationalAnalytics } from './analytics'
import { evaluateManual } from './manualEvaluations'
import { executeFormTest, type FormTestInput } from './formTests'
import { bulkReviewDue, type BulkDueInput } from './bulkReviewDue'
import { sweepReviewSla, reviewSlaSummary, activeReviewScan } from './reviewSla'
import { assignReview, scoreAssignedReview, bulkAssignReviews, reviewerDirectory, reviewWorkload, type BulkAssignmentInput } from './reviewOperations'
import { calibrationAnalytics, requestSample, reviewQueue, updateReview, ReviewNotFound } from './reviews'
import { reviewQueuePriority } from '../domain/reviewSla'
import { matchesReviewQueue, type AssignmentInput, type Reviewer, type ReviewInput, type ReviewEvaluation } from '../domain/reviews'

export interface ApiConfig { origin:string; region:Region; allowedUserIds:Set<string>; schedulerEmail:string; schedulerAudience:string; bootstrapAdminId?:string }
const oidc=new OAuth2Client()
const json=(response:ServerResponse,status:number,value:unknown)=>{response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});response.end(JSON.stringify(value))}
const bearer=(request:IncomingMessage)=>/^Bearer (.+)$/.exec(request.headers.authorization??'')?.[1]
async function body(request:IncomingMessage):Promise<unknown>{let text='',size=0;for await(const chunk of request){size+=Buffer.byteLength(chunk);text+=String(chunk);if(size>100_000)throw new Error('Request body is too large.')}return JSON.parse(text||'{}') as unknown}
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const id=(v:string)=>/^[A-Za-z0-9_-]{1,100}$/.test(v)
async function browserAuthorized(request:IncomingMessage,config:ApiConfig,fetcher:typeof fetch){
  const token=bearer(request);if(!token||!config.allowedUserIds.size)return null
  const reply=await fetcher(`${REGIONS[config.region].api}/api/v2/users/me`,{headers:{Authorization:`Bearer ${token}`}})
  if(!reply.ok)return null
  const user=await reply.json() as {id?:string;name?:string}
  return user.id&&config.allowedUserIds.has(user.id)?{userId:user.id,...(typeof user.name==='string'?{displayName:user.name.slice(0,200)}:{})} satisfies Reviewer:null
}
async function schedulerAuthorized(request:IncomingMessage,config:ApiConfig){
  const token=bearer(request);if(!token||!config.schedulerAudience||!config.schedulerEmail)return false
  if(token.split('.').length!==3)return false
  try{const ticket=await oidc.verifyIdToken({idToken:token,audience:config.schedulerAudience});const p=ticket.getPayload();return p?.email===config.schedulerEmail&&p.email_verified===true}catch{return false}
}
export function createApi(deps:RunnerDeps,config:ApiConfig,fetcher:typeof fetch=fetch,notificationProviders?:Providers){
  const bootstrapId=config.bootstrapAdminId??(config.allowedUserIds.size===1?[...config.allowedUserIds][0]:undefined)
  if(config.allowedUserIds.size&&(!bootstrapId||!config.allowedUserIds.has(bootstrapId)))throw Error('Configure AQM_BOOTSTRAP_ADMIN_USER_ID as an allowlisted owner before enabling multiple users.')
  return createServer(async(request,response)=>{
    const origin=request.headers.origin
    if(origin===config.origin){response.setHeader('Access-Control-Allow-Origin',config.origin);response.setHeader('Vary','Origin');response.setHeader('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,OPTIONS');response.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type')}
    if(request.method==='OPTIONS'){json(response,origin===config.origin?204:403,{});return}
    const url=new URL(request.url??'/',`http://${request.headers.host??'localhost'}`)
    if(url.pathname==='/health'&&request.method==='GET'){json(response,200,{status:'ok',schemaVersion:1});return}
    if(url.pathname==='/internal/scheduler/tick'||url.pathname==='/internal/notifications/tick'){
      if(request.method!=='POST'||!await schedulerAuthorized(request,config)){json(response,403,{error:'Forbidden'});return}
      try{const outcomes=url.pathname==='/internal/scheduler/tick'?await schedulerTick(deps):undefined;let notifications:unknown={status:'not_configured'};if(notificationProviders){try{notifications=await notificationTick(deps.store,notificationProviders,deps.now)}catch{notifications={status:'dispatch_failed'}}}json(response,200,{outcomes,notifications})}catch{json(response,500,{error:'Scheduler tick failed.'})}return
    }
    const actor=url.pathname.startsWith('/api/')?await browserAuthorized(request,config,fetcher).catch(()=>null):null
    if(!actor){json(response,401,{error:'Unauthorized'});return}
    await auditContext.run({actor,now:deps.now().toISOString(),correlationId:randomUUID()},async()=>{try{
      const path=url.pathname
      const access=await sessionAccess(deps.store,actor,bootstrapId)
      const authority={bootstrapId,allowedUserIds:config.allowedUserIds}
      if(url.searchParams.get('assignment')==='mine'||url.searchParams.get('reviewQueue')==='mine'){url.searchParams.delete('assigneeId')}
      if(url.searchParams.get('due')&&!['all','overdue','today','week','none'].includes(url.searchParams.get('due')!))throw Error('Invalid due filter.')
      if(request.method==='GET'&&path==='/api/session'){json(response,200,access);return}
      const rolePath=/^\/api\/roles\/([A-Za-z0-9_-]{1,100})$/.exec(path)
      let permission:Permission|undefined
      if(path.startsWith('/api/notifications'))permission=request.method==='GET'?'notifications.read':path.endsWith('/test')?'notifications.test':'notifications.write'
      else if(path.startsWith('/api/roles'))permission='roles.manage'
      else if(path.startsWith('/api/retention'))permission='retention.execute'
      else if(path==='/api/audit')permission='audit.read'
      else if(path==='/api/history')permission='history.read'
      else if(path==='/api/review-sla/refresh')permission='settings.write'
      else if(path==='/api/governance')permission=request.method==='GET'?'settings.read':'settings.write'
      else if(request.method!=='GET'){
       if(path.startsWith('/api/forms/')||path.startsWith('/api/form-tests/'))permission='forms.write'
       else if(path.startsWith('/api/question-groups/'))permission='groups.write'
       else if(path.startsWith('/api/policies/'))permission='policies.write'
       else if(path.startsWith('/api/schedules/'))permission='schedules.write'
       else if(path==='/api/reviews/bulk-assign'||path==='/api/reviews/bulk-due'||path.endsWith('/assignment'))permission='reviews.assign'
       else if(path.startsWith('/api/reviews/')||path==='/api/calibration/sample'||/\/review$/.test(path))permission='reviews.write'
       else if(path.startsWith('/api/alerts/'))permission=path.endsWith('/resolve')?'alerts.resolve':'alerts.acknowledge'
       else if(path==='/api/evaluations/manual')permission='evaluations.write'
       else throw new Forbidden()
      }else{
       permission=path.startsWith('/api/forms')||path.startsWith('/api/form-tests')?'forms.read':path.startsWith('/api/question-groups')?'groups.read':path.startsWith('/api/policies')||path.startsWith('/api/schedules')?'policies.read':path.startsWith('/api/alerts')?'alerts.read':path.startsWith('/api/reviews')||path.startsWith('/api/calibration')?'reviews.read':'evaluations.read'
      }
      if(permission)requirePermission(access,permission)
      if(path==='/api/notifications/health'&&request.method==='GET'){json(response,200,await deps.store.notificationHealth(deps.now().toISOString()));return}
      if(path==='/api/notifications/deliveries'&&request.method==='GET'){
       const q=url.searchParams,limit=Number(q.get('limit')??50),cursor=q.get('cursor')??undefined
       if(!Number.isInteger(limit)||limit<1||limit>100||['alertId','destinationId','cursor'].some(k=>q.get(k)&&!id(q.get(k)!)))throw Error('Invalid notification pagination.')
       const page=await deps.store.notificationHistory(q.get('alertId')??undefined,q.get('destinationId')??undefined,limit,cursor)
       json(response,200,{...page,items:page.items.map(({payload,leaseOwner,...d})=>d)});return
      }
      if(path==='/api/notifications/destinations'&&request.method==='GET'){const page=await deps.store.query<NotificationDestination>('notificationDestinations',100);json(response,200,{...page,items:await Promise.all(page.items.map(async d=>({...safeDestination(d),lastDelivery:await deps.store.governanceRead('notificationDestinationHealth',d.id)})))});return}
      if(path==='/api/notifications/rules'&&request.method==='GET'){json(response,200,await deps.store.query('notificationRules',50));return}
      const notificationPath=/^\/api\/notifications\/(destinations|rules)\/([A-Za-z0-9_-]{1,100})(?:\/(test))?$/.exec(path)
      if(notificationPath&&request.method==='POST'&&notificationPath[1]==='destinations'&&notificationPath[3]==='test'){const delivery=await requestTest(deps.store,notificationPath[2],deps.now().toISOString());json(response,202,{item:delivery});return}
      if(notificationPath&&request.method==='PUT'&&!notificationPath[3]){
       const collection=notificationPath[1]==='destinations'?'notificationDestinations':'notificationRules',prior=await deps.store.governanceRead<NotificationDestination|NotificationRule>(collection,notificationPath[2]),input=await body(request)
       if(!obj(input)||input.id!==notificationPath[2])throw Error('Invalid notification identity.')
       // Safe GET projection omits secret references. Omitted refs preserve existing ones on edit.
       if(collection==='notificationDestinations'&&prior&&obj(input.configuration))input.configuration={...(prior as NotificationDestination).configuration,...input.configuration}
       const item=collection==='notificationDestinations'?destinationInput(input,deps.now().toISOString(),prior as NotificationDestination|undefined):ruleInput(input,deps.now().toISOString(),prior as NotificationRule|undefined)
       const catalogControl=await deps.store.governanceRead<{revision:number}>('notificationControl','catalog')
       const catalog=await deps.store.query(collection,collection==='notificationRules'?51:101),limit=collection==='notificationRules'?50:100
       if(!prior&&catalog.items.length>=limit)throw Error('Notification configuration limit reached.')
       const guards:import('./store').AtomicWrite[]=[]
       if(collection==='notificationRules')for(const destId of (item as NotificationRule).destinationIds){const d=await deps.store.governanceRead<NotificationDestination>('notificationDestinations',destId);if(!d)throw Error('Unknown notification destination.');guards.push({collection:'notificationDestinations',id:destId,expected:d,checkOnly:true})}
       await deps.store.atomic([{collection:'notificationControl',id:'catalog',expected:catalogControl,value:{revision:(catalogControl?.revision??0)+1}},...guards,{collection,id:item.id,value:item,expected:prior}]);json(response,200,{item:collection==='notificationDestinations'?safeDestination(item as NotificationDestination):item});return
      }
      if(request.method==='GET'&&path==='/api/roles'){json(response,200,await deps.store.query('roleAssignments',100,url.searchParams.get('cursor')??undefined));return}
      if(request.method==='PUT'&&rolePath){
       const v=await body(request);if(!obj(v)||!roles.includes(v.role as typeof roles[number]))throw Error('Invalid role.')
       if(!config.allowedUserIds.has(rolePath[1]))throw Error('User must be in the server Genesys allowlist.')
       if(rolePath[1]===bootstrapId&&v.role!=='ADMIN')throw new Forbidden('The configured bootstrap owner must remain ADMIN.')
       const prior=await deps.store.governanceRead<RoleAssignment>('roleAssignments',rolePath[1]),now=deps.now().toISOString()
       const item:RoleAssignment={id:rolePath[1],userId:rolePath[1],...(prior?.displayName?{displayName:prior.displayName}:{}),...(actor.userId===rolePath[1]&&actor.displayName?{displayName:actor.displayName}:{}),role:v.role as typeof roles[number],createdAt:prior?.createdAt??now,updatedAt:now,assignedBy:actor}
       await deps.store.atomic([{collection:'roleAssignments',id:item.id,value:item,expected:prior}]);json(response,200,{item});return
      }
      if(path==='/api/governance'&&request.method==='GET'){json(response,200,await governanceSettings(deps.store));return}
      if(path==='/api/governance'&&request.method==='PUT'){const settings=validateGovernance(await body(request)),prior=await deps.store.governanceRead('governanceSettings','governance');await deps.store.atomic([{collection:'governanceSettings',id:'governance',value:settings,expected:prior}]);json(response,200,settings);return}
      if((path==='/api/audit'||path==='/api/history')&&request.method==='GET'){json(response,200,await auditPage(deps.store,url.searchParams,path==='/api/history'));return}
      if(path==='/api/retention/preview'&&request.method==='POST'){const v=await body(request);if(!obj(v))throw Error('Invalid preview.');json(response,200,await planPurge(deps.store,actor,deps.now().toISOString(),(v.cursors??{}) as import('./governance').PurgePlan['cursors']));return}
      if(path==='/api/retention/execute'&&request.method==='POST'){const v=await body(request);if(!obj(v)||typeof v.planId!=='string'||!id(v.planId))throw Error('Invalid purge.');json(response,200,await executePurge(deps.store,actor,deps.now().toISOString(),v.planId,v.confirmation));return}
      if(request.method==='GET'&&path==='/api/alerts'){
        const q=url.searchParams,limit=Number(q.get('limit')??50),cursor=q.get('cursor')??undefined
        if(!Number.isInteger(limit)||limit<1||limit>100||cursor&&!id(cursor))throw Error('Invalid alert pagination.')
        if(q.get('status')&&!['OPEN','ACKNOWLEDGED','RESOLVED','ACTIVE'].includes(q.get('status')!))throw Error('Invalid alert status.')
        if(q.get('severity')&&!['INFO','WARNING','ERROR'].includes(q.get('severity')!))throw Error('Invalid alert severity.')
        if(q.get('type')&&!alertTypes.includes(q.get('type') as OperationalAlert['type']))throw Error('Invalid alert type.')
        await monitoringAlerts(deps.store,deps.now().toISOString(),!!config.schedulerEmail&&!!config.schedulerAudience,deps.alertConfig)
        const items:OperationalAlert[]=[];let nextCursor=cursor,more=true,scanned=0
        while(items.length<limit&&more&&scanned<1000){
          const page=await deps.store.query<OperationalAlert>('operationalAlerts',Math.min(100,1000-scanned),nextCursor);scanned+=page.scanned
          more=false
          for(const [index,a] of page.items.entries()){
            nextCursor=a.id
            if((!q.get('status')||(q.get('status')==='ACTIVE'?a.status!=='RESOLVED':a.status===q.get('status')))&&(!q.get('severity')||a.severity===q.get('severity'))&&(!q.get('type')||a.type===q.get('type'))&&(!q.get('policy')||a.policyId===q.get('policy'))&&(!q.get('run')||a.runId===q.get('run')))items.push(a)
            if(items.length===limit){more=index<page.items.length-1;break}
          }
          more=more||!!page.nextCursor
        }
        json(response,200,{items,nextCursor:more?nextCursor:undefined,scanned,scanLimited:scanned>=1000&&more});return
      }
      const alertNotifications=/^\/api\/alerts\/([A-Za-z0-9_-]{1,100})\/notifications$/.exec(path)
      if(alertNotifications&&request.method==='GET'){
       const limit=Number(url.searchParams.get('limit')??50),cursor=url.searchParams.get('cursor')??undefined
       if(!Number.isInteger(limit)||limit<1||limit>100||cursor&&!id(cursor))throw Error('Invalid notification pagination.')
       const page=await deps.store.notificationHistory(alertNotifications[1],undefined,limit,cursor)
       const items=await Promise.all(page.items.map(async d=>({id:d.id,destinationName:(await deps.store.governanceRead<NotificationDestination>('notificationDestinations',d.destinationId))?.name??'Retired destination',state:d.state,event:d.event,attemptCount:d.attemptCount,lastErrorCode:d.lastErrorCode})))
       json(response,200,{...page,items});return
      }
      const alertPath=/^\/api\/alerts\/([A-Za-z0-9_-]{1,100})(?:\/(acknowledge|resolve))?$/.exec(path)
      if(alertPath&&request.method==='GET'&&!alertPath[2]){const item=await deps.store.alert(alertPath[1]);json(response,item?200:404,item??{error:'Alert not found.'});return}
      if(alertPath&&request.method==='POST'&&alertPath[2]){const item=await deps.store.transitionAlert(alertPath[1],alertPath[2]==='acknowledge'?'ACKNOWLEDGED':'RESOLVED',deps.now().toISOString(),actor);json(response,item?200:404,item?{item}:{error:'Alert not found.'});return}
      if(request.method==='POST'&&path==='/api/review-sla/refresh'){json(response,200,await sweepReviewSla(deps.store,deps.now().toISOString()));return}
      if(request.method==='POST'&&path==='/api/reviews/bulk-due'){const input=await body(request);if(!obj(input))throw Error('Invalid bulk due date.');json(response,200,await bulkReviewDue(deps.store,input as unknown as BulkDueInput,actor,deps.now().toISOString(),authority));return}
      if(request.method==='GET'&&path==='/api/reviewers'){json(response,200,await reviewerDirectory(deps.store,url.searchParams,authority,actor));return}
      if(request.method==='GET'&&path==='/api/review-workload'){json(response,200,await reviewWorkload(deps.store,deps.now().toISOString(),authority));return}
      if(request.method==='POST'&&path==='/api/reviews/bulk-assign'){const input=await body(request);if(!obj(input))throw Error('Invalid bulk assignment.');json(response,200,await bulkAssignReviews(deps.store,input as unknown as BulkAssignmentInput,actor,deps.now().toISOString(),authority));return}
      const assignmentPath=/^\/api\/reviews\/([A-Za-z0-9_-]{1,180})\/assignment$/.exec(path)
      if(request.method==='PUT'&&assignmentPath){const input=await body(request);if(!obj(input))throw Error('Invalid assignment.');json(response,200,{item:await assignReview(deps.store,assignmentPath[1],input as unknown as AssignmentInput,actor,deps.now().toISOString(),authority)});return}
      if(request.method==='GET'&&path==='/api/calibration'){json(response,200,await calibrationAnalytics(deps.store,url.searchParams));return}
      if(request.method==='POST'&&path==='/api/calibration/sample'){json(response,200,await requestSample(deps.store,await body(request),actor,deps.now().toISOString(),authority));return}
      if(request.method==='GET'&&(path==='/api/reviews'||path==='/api/review-queue')){
        const queue=await reviewQueue(deps.store,url.searchParams,actor.userId,deps.now().toISOString())
        json(response,200,{scope:'complete',items:path==='/api/reviews'?queue.flatMap(record=>record.humanReview?[record.humanReview]:[]):queue});return
      }
      const reviewDetail=/^\/api\/reviews\/([A-Za-z0-9_-]{1,180})$/.exec(path)
      if(reviewDetail&&request.method==='GET'){const item=await deps.store.review(reviewDetail[1]);json(response,item?200:404,item??{error:'Review not found.'});return}
      if(reviewDetail&&request.method==='PUT'){
        const input=await body(request);if(!obj(input))throw Error('Invalid review request.')
        json(response,200,{item:await scoreAssignedReview(deps.store,reviewDetail[1],input as unknown as ReviewInput,actor,deps.now().toISOString(),authority)});return
      }
      if(request.method==='GET'){
        const email=/^\/api\/conversations\/([a-f0-9-]{20,64})\/(email|digital)$/i.exec(path)
        if(email){
          const source=new GenesysCloudConversationSource(()=>({region:config.region,clientId:'interactive',accessToken:bearer(request)!,expiresAt:Date.now()+60_000}),fetcher)
          const conversation=await source.load(email[1])
          if(!['email','messaging'].includes(conversation.channel)||email[2]==='email'&&conversation.channel!=='email')throw Error('This endpoint supports digital conversations only.')
          json(response,200,conversation);return
        }

        if(path==='/api/monitoring-health'){
          const base:Record<string,unknown>={api:'healthy',genesysAutomation:{status:'unverified'},jev:{status:'unverified'},scheduler:{status:config.schedulerEmail&&config.schedulerAudience?'configured_unverified':'not_configured',lastRunAt:null},firestore:'unavailable',lastRun:null,nextRunAt:null,runCounts:{completed:0,partial:0,failed:0}}
          try{
            const [snapshot,schedules,alerts,schedulerHealth]=await Promise.all([deps.store.healthSnapshot(),deps.store.schedules(),monitoringAlerts(deps.store,deps.now().toISOString(),!!config.schedulerEmail&&!!config.schedulerAudience,deps.alertConfig),deps.store.schedulerHealth()])
            Object.assign(base,alerts)
            const ordered=snapshot.recentRuns,latest=ordered[0]
            const recent=ordered.slice(0,20),latestScheduled=recent.find(run=>run.executionMode==='scheduled')
            const nextRun=schedules.filter(schedule=>schedule.enabled&&schedule.nextDueAt).sort((a,b)=>a.nextDueAt!.localeCompare(b.nextDueAt!))[0]
            try{base.reviewWorkload=await reviewSlaSummary(deps.store,deps.now().toISOString());base.reviewSlaSweep=await deps.store.governanceRead('operationalHealth','reviewSla')}catch{base.reviewWorkload={complete:false,message:'Review SLA scan incomplete'}}
            base.notifications=await deps.store.notificationHealth(deps.now().toISOString())
            base.firestore='available'
            base.runCounts=snapshot.runCounts
            base.lastRun=latest?{id:latest.id,policyName:latest.policySnapshot.name,status:latest.status,startedAt:latest.startedAt,completedAt:latest.completedAt,evaluationsSucceeded:latest.evaluationsSucceeded,evaluationsFailed:latest.evaluationsFailed}:null
            base.nextRunAt=nextRun?.nextDueAt??null
            const genesysError=latest?.failures.some(failure=>/^genesys_(auth|query_or_plan):/.test(failure.reason))??false
            base.genesysAutomation={status:!latest?'unverified':genesysError?'error':latest.status==='completed'||latest.status==='partial-failure'?'verified':'unverified'}
            const jevAttempted=!!latest&&(latest.evaluationsSucceeded+latest.evaluationsFailed>0)
            base.jev={status:!jevAttempted?'unverified':latest!.evaluationsFailed?'error':'verified'}
            base.scheduler={status:schedulerHealth?.lastSuccessfulTickAt?(Date.parse(deps.now().toISOString())-Date.parse(schedulerHealth.lastSuccessfulTickAt)>(deps.alertConfig??defaultAlertConfig).schedulerToleranceMs?'stale':'healthy'):config.schedulerEmail&&config.schedulerAudience?'configured_unverified':'not_configured',lastRunAt:latestScheduled?.startedAt??null,lastSuccessfulTickAt:schedulerHealth?.lastSuccessfulTickAt??null}
            json(response,200,base);return
          }catch{
            json(response,200,base);return
          }
        }
        if(path==='/api/analytics'){json(response,200,await operationalAnalytics(deps.store,url.searchParams));return}
        if(path==='/api/form-tests'){const limit=Number(url.searchParams.get('limit')??20);if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('Limit must be between 1 and 100.');json(response,200,{items:await deps.store.recentFormTestRuns(limit)});return}
        const collections={'/api/question-groups':'questionGroupAssets','/api/forms':'evaluationForms','/api/policies':'policies','/api/schedules':'schedules','/api/runs':'policyRuns','/api/evaluations':'evaluationRecords'} as const
        if(path in collections){
          const rawLimit=Number(url.searchParams.get('limit')??50)
          if(!Number.isInteger(rawLimit)||rawLimit<1||rawLimit>100)throw new Error('Limit must be between 1 and 100.')
          const cursor=url.searchParams.get('cursor')??undefined
          if(cursor&&!id(cursor))throw new Error('Invalid cursor.')
          const collection=(collections as Record<string,typeof collections[keyof typeof collections]>)[path]
          if(collection==='evaluationRecords'){
            const matches=(item:ReviewEvaluation)=>{
              const q=url.searchParams
              return matchesReviewQueue(item,q,actor.userId,deps.now().toISOString())&&(!q.get('question')||item.questions.some(question=>question.id===q.get('question')&&question.credit!==null&&question.credit<.67))&&(!q.get('policy')||item.policyMatches.some(match=>match.policyId===q.get('policy')))&&(!q.get('mode')||(item.executionMode??'manual')===q.get('mode'))&&(!q.get('critical')||(q.get('critical')==='yes'?item.criticalFailures.length+(item.criticalGroupFailures?.length??0)>0:item.criticalFailures.length+(item.criticalGroupFailures?.length??0)===0))&&(!q.get('outcome')||(q.get('outcome')==='pass'?item.passed===true:item.passed===false))
            }
            if(url.searchParams.get('reviewQueue')==='mine'){
              const scan=await activeReviewScan(deps.store);if(!scan.complete)throw Error('Review SLA scan incomplete: narrow or index the active review queue.')
              const reviews=scan.items.filter(r=>r.assignment?.assignee.userId===actor.userId),joined:ReviewEvaluation[]=[]
              for(let offset=0;offset<reviews.length;offset+=100){const part=reviews.slice(offset,offset+100),map=new Map(part.map(r=>[r.evaluationId,r]));joined.push(...(await deps.store.evaluationsByIds(part.map(r=>r.evaluationId))).map(r=>({...r,humanReview:map.get(r.id)})))}
              const settings=await governanceSettings(deps.store),now=deps.now().toISOString(),ordered=joined.filter(matches).sort((a,b)=>reviewQueuePriority(a,now,settings.reviewSla).localeCompare(reviewQueuePriority(b,now,settings.reviewSla)))
              const offset=cursor?ordered.findIndex(r=>r.id===cursor)+1:0,items=ordered.slice(offset,offset+rawLimit)
              json(response,200,{items,scanned:scan.scanned,scanLimited:false,nextCursor:offset+rawLimit<ordered.length?items.at(-1)?.id:undefined});return
            }
            const items:ReviewEvaluation[]=[];let nextCursor=cursor,scanned=0,more=true
            while(items.length<rawLimit&&scanned<500&&more){const page=await deps.store.query<import('../domain/types').EvaluationRecord>(collection,Math.min(100,500-scanned),nextCursor);scanned+=page.scanned;const reviews=new Map((await deps.store.reviewsByIds(page.items.map(item=>item.id))).map(review=>[review.evaluationId,review]));const joined=page.items.map(item=>({...item,humanReview:reviews.get(item.id)}));let remaining=false;for(const [index,item] of joined.entries()){nextCursor=item.id;if(matches(item))items.push(item);if(items.length>=rawLimit){remaining=index<page.items.length-1;break}}more=remaining||!!page.nextCursor}
            json(response,200,{items,nextCursor:more?nextCursor:undefined,scanned,scanLimited:scanned>=500&&more});return
          }
          const page=await deps.store.query(collection,rawLimit,cursor)
          json(response,200,page);return
        }
        const detail=/^\/api\/evaluations\/([A-Za-z0-9_-]+)$/.exec(path)
        if(detail){const item=await deps.store.evaluation(detail[1]);json(response,item?200:404,item?{...item,humanReview:await deps.store.review(item.id)}:{error:'Evaluation not found.'});return}
        const runDetail=/^\/api\/runs\/([A-Za-z0-9_-]+)$/.exec(path)
        if(runDetail){const item=await deps.store.run(runDetail[1]);json(response,item?200:404,item??{error:'Run not found.'});return}
        const testDetail=/^\/api\/form-tests\/([A-Za-z0-9_-]+)$/.exec(path)
        if(testDetail){const item=await deps.store.formTestRun(testDetail[1]);json(response,item?200:404,item??{error:'Form test not found.'});return}
      }
      if(request.method==='POST'&&path==='/api/evaluations/manual'){const outcome=await evaluateManual(deps,await body(request));json(response,outcome.status==='uncertain'?409:200,outcome);return}
      const testRun=/^\/api\/form-tests\/([A-Za-z0-9_-]+)$/.exec(path)
      if(request.method==='POST'&&testRun){const input=await body(request);if(!obj(input)||!id(testRun[1])||!obj(input.form)||input.id!==testRun[1])throw new Error('Invalid form test request.');const run=await executeFormTest(deps,input as unknown as FormTestInput);json(response,200,{run});return}
      if(request.method==='DELETE'&&testRun){const run=await deps.store.formTestRun(testRun[1]);if(!run){json(response,404,{error:'Form test not found.'});return}if(run.status==='running'){json(response,409,{error:'A running or uncertain test cannot be deleted until reconciled.'});return}await deps.store.deleteFormTestRun(run.id);json(response,200,{ok:true});return}
      const policyClone=/^\/api\/policies\/([A-Za-z0-9_-]+)\/clone$/.exec(path)
      if(request.method==='POST'&&policyClone){const item=await duplicatePolicy(deps.store,policyClone[1],`policy_${randomUUID().replaceAll('-','')}`,deps.now().toISOString());json(response,item?201:404,item?{item}:{error:'Source policy not found.'});return}
      const clonePath=/^\/api\/forms\/([A-Za-z0-9_-]+)\/clone$/.exec(path)
      if(request.method==='POST'&&(clonePath||path==='/api/forms/import'||path==='/api/question-groups/import')){
        const now=deps.now().toISOString(),newId=`${path.startsWith('/api/forms/')?'form':'asset'}_${randomUUID().replaceAll('-','')}`
        const operation=clonePath?'cloned':'imported'
        auditContext.getStore()!.operation=operation
        if(clonePath){requirePermission(access,'forms.read');const source=await deps.store.form(clonePath[1]);if(!source){json(response,404,{error:'Source form not found.'});return}const item=cloneForm(source,newId,now);await deps.store.atomic([{collection:'evaluationForms',id:item.id,value:item,expected:undefined}]);json(response,201,{item});return}
        const value=await body(request)
        if(path==='/api/forms/import'){const item=importDefinition('form',value,newId,now);await deps.store.atomic([{collection:'evaluationForms',id:item.id,value:item,expected:undefined}]);json(response,201,{item});return}
        const item=importDefinition('group',value,newId,now);await deps.store.atomic([{collection:'questionGroupAssets',id:item.id,value:item,expected:undefined}]);json(response,201,{item});return
      }
      const assetPath=/^\/api\/question-groups\/([A-Za-z0-9_-]+)$/.exec(path)
      if(assetPath&&request.method==='GET'){const item=await deps.store.groupAsset(assetPath[1]);json(response,item?200:404,item??{error:'Reusable group not found.'});return}
      if(assetPath&&request.method==='PUT'){const value=await body(request);if(!obj(value)||value.id!==assetPath[1])throw Error('Invalid asset identity.');const asset=value as unknown as QuestionGroupAsset;if(asset.status==='PUBLISHED'||asset.status==='RETIRED')requirePermission(access,'groups.publish');assertAssetWrite(await deps.store.groupAsset(asset.id),asset);await deps.store.putGroupAsset(asset);json(response,200,{ok:true,item:asset});return}
      if(request.method==='PUT'){
        const match=/^\/api\/(forms|policies|schedules)\/([A-Za-z0-9_-]+)$/.exec(path)
        if(match){const value=await body(request);if(!obj(value)||value.id!==match[2]||!id(match[2]))throw new Error('Invalid resource identity.')
          if(match[1]==='forms'){
            const form=value as unknown as EvaluationForm
            if(!['DRAFT','TESTING','PUBLISHED','RETIRED'].includes(formStatus(form)))throw Error('Invalid form lifecycle status.')
            if(['PUBLISHED','RETIRED'].includes(formStatus(form)))requirePermission(access,'forms.publish')
            const prior=await deps.store.form(form.id)
            if(productionReadinessErrors(form).length)throw new Error(productionReadinessErrors(form).join(' '))
            if(prior){
              if(form.origin!==prior.origin||form.sourceFormId!==prior.sourceFormId)throw new Error('Source provenance cannot change.')
              if(form.version!==prior.version)throw new Error('Form version cannot change under the same ID.')
              if((formStatus(prior)==='PUBLISHED'||formStatus(prior)==='RETIRED')&&!sameDefinition(prior,form))throw new Error('Published form definition is immutable. Create a new version.')
              if(formStatus(prior)==='PUBLISHED'&&!['PUBLISHED','RETIRED'].includes(formStatus(form)))throw new Error('Published forms cannot return to editing.')
              if(formStatus(prior)==='RETIRED'&&formStatus(form)!=='RETIRED')throw new Error('Retired forms cannot be restored.')
            }
            if(formStatus(form)==='PUBLISHED'){
              if(!form.enabled)throw new Error('Published form must be enabled.')
              const errors=productionReadinessErrors(form);if(errors.length)throw new Error(errors.join(' '))
            }
            if(formStatus(form)==='RETIRED'&&form.enabled)throw new Error('Retired form must be disabled.')
            if(prior&&['DRAFT','TESTING'].includes(formStatus(prior))&&formStatus(prior)===formStatus(form))auditContext.getStore()!.operation='draft_saved'
            await deps.store.atomic([{collection:'evaluationForms',id:form.id,value:form,expected:prior}])
            json(response,200,{ok:true,item:form});return
          }
          if(match[1]==='policies'){
            const policy=value as unknown as InteractionPolicy
            const item=await savePolicy(deps.store,policy,value.expectedVersion,deps.now().toISOString())
            json(response,200,{item});return
          }
          if(match[1]==='schedules'){
            const schedule=value as unknown as Schedule;validateSchedule(schedule)
            const prior=await deps.store.schedule(schedule.id)
            const policy=await deps.store.policy(schedule.policyId);if(!policy)throw Error('Schedule policy does not exist. Save the policy first.')
            if(prior&&prior.policyId!==schedule.policyId)throw Error('Schedule policy cannot change.')
            // New schedules use one deterministic ID per policy; existing identities are preserved.
            if(!prior&&(await deps.store.schedules()).some(s=>s.policyId===schedule.policyId))throw new StoreConflict()
            const item:Schedule={id:schedule.id,policyId:schedule.policyId,enabled:schedule.frequency==='MANUAL'?false:schedule.enabled,frequency:schedule.frequency,timezone:schedule.timezone,localTime:schedule.localTime,version:1,...(schedule.weekday!==undefined?{weekday:schedule.weekday}:{})}
            const unchanged=prior&&prior.enabled===item.enabled&&prior.frequency===item.frequency&&prior.localTime===item.localTime&&prior.weekday===item.weekday&&prior.timezone===item.timezone
            if(unchanged){json(response,200,{item:prior});return}
            item.nextDueAt=nextDueAfter(item,deps.now().toISOString());item.lastAttemptedAt=prior?.lastAttemptedAt;item.lastSuccessfulAt=prior?.lastSuccessfulAt
            // Schedule identity is deterministic for new schedules; legacy identities are preserved.
            if(!prior&&item.id!==`schedule_${item.policyId}`)throw Error('New schedules must use schedule_<policy ID>.')
            await deps.store.atomic([{collection:'schedules',id:item.id,value:item,expected:prior}])
            json(response,200,{item});return
          }
          json(response,200,{ok:true});return}
      }
      const review=/^\/api\/evaluations\/([A-Za-z0-9_-]+)\/review$/.exec(path)
      if(request.method==='POST'&&review){
        const input=await body(request);if(!obj(input)||input.state!=='REVIEW_REQUESTED')throw Error('Use the Human Review API to complete a scored review.')
        const record=await deps.store.evaluation(review[1]);if(!record)throw new ReviewNotFound('Evaluation not found.')
        const item=await updateReview(deps.store,record.id,{action:'request',expectedRevision:input.expectedRevision as number,formId:record.form.id,formVersion:record.form.version},actor,deps.now().toISOString())
        json(response,200,{item});return
      }
      const match=/^\/api\/policies\/([A-Za-z0-9_-]+)\/(plan|run)$/.exec(path)
      if(request.method==='POST'&&match){const policy=await deps.store.policy(match[1]);if(!policy){json(response,404,{error:'Policy not found.'});return}
        const input=await body(request);if(!obj(input)||!obj(input.period)||typeof input.period.periodStart!=='string'||typeof input.period.periodEnd!=='string')throw new Error('Invalid period.')
        const period=input.period as unknown as MonitoringPeriod
        const prepared=await planServerRun(deps,policy,period)
        const fingerprint=planFingerprint(policy,period,prepared.plan.selected)
        if(match[2]==='plan'){const p=prepared.plan;json(response,200,{fingerprint,period,policyId:policy.id,policyVersion:policy.version??1,candidateCount:p.candidateCount,eligibleCount:p.eligibleCount,sampledCount:p.sampledCount,evaluableCount:p.evaluableCount,expectedEvaluations:p.expectedEvaluations,maximumProviderRequests:p.maximumProviderRequests,transcriptUnavailableCount:p.transcriptUnavailableCount,selected:p.selected.map(x=>({conversationId:x.conversation.conversationId,pendingFormIds:x.pendingFormIds,transcriptAvailable:x.transcriptAvailable}))});return}
        if(input.fingerprint!==fingerprint){json(response,409,{error:'Plan changed. Preview again before execution.'});return}
        const runId=manualRunId(policy,period)
        const run=await executeServerRun(deps,policy,period,runId,'manual',prepared)
        json(response,200,{run});return
      }
      json(response,404,{error:'Not found.'})
    }catch(error){json(response,error instanceof Forbidden?403:error instanceof StoreConflict||error instanceof ReviewConflict?409:error instanceof ReviewNotFound?404:400,{error:error instanceof Error?error.message:'Request failed.'})}})
  })
}
export function startApi(){
  const required=['AQM_ALLOWED_ORIGIN','AQM_SCHEDULER_EMAIL','AQM_SCHEDULER_AUDIENCE','GENESYS_CLIENT_ID','GENESYS_CLIENT_SECRET','JEV_API_KEY','GENESYS_REGION'] as const
  for(const name of required)if(!process.env[name])throw new Error(`Missing server configuration: ${name}`)
  const region=process.env.GENESYS_REGION as Region;if(!REGIONS[region])throw new Error('Invalid Genesys region.')
  initializeApp()
  const store:Store=new FirestoreStore(getFirestore())
  const alertConfig={minimumSample:Number(process.env.AQM_ALERT_MINIMUM_SAMPLE??defaultAlertConfig.minimumSample),minimumAvailability:Number(process.env.AQM_ALERT_MINIMUM_AVAILABILITY??defaultAlertConfig.minimumAvailability),schedulerToleranceMs:Number(process.env.AQM_SCHEDULER_TOLERANCE_MS??defaultAlertConfig.schedulerToleranceMs)}
  if(!Number.isInteger(alertConfig.minimumSample)||alertConfig.minimumSample<5||!Number.isFinite(alertConfig.minimumAvailability)||alertConfig.minimumAvailability<0||alertConfig.minimumAvailability>1||!Number.isFinite(alertConfig.schedulerToleranceMs)||alertConfig.schedulerToleranceMs<=0)throw Error('Invalid operational alert configuration.')
  const deps:RunnerDeps={store,alertConfig,genesys:new ClientCredentialsGenesys(region,process.env.GENESYS_CLIENT_ID!,process.env.GENESYS_CLIENT_SECRET!),jev:new DirectJev(process.env.JEV_API_KEY!),now:()=>new Date()}
  const secrets=secretManagerResolver(process.env.GOOGLE_CLOUD_PROJECT??'genesys-aqm-2026')
  const notificationProviders:Providers={WEBHOOK:new WebhookProvider(secrets),EMAIL:new EmailProvider(secrets)}
  const server=createApi(deps,{origin:process.env.AQM_ALLOWED_ORIGIN!,region,allowedUserIds:new Set((process.env.AQM_ALLOWED_GENESYS_USER_IDS??'').split(',').map(s=>s.trim()).filter(Boolean)),schedulerEmail:process.env.AQM_SCHEDULER_EMAIL!,schedulerAudience:process.env.AQM_SCHEDULER_AUDIENCE!,bootstrapAdminId:process.env.AQM_BOOTSTRAP_ADMIN_USER_ID},fetch,notificationProviders)
  server.listen(Number(process.env.PORT??8080),'0.0.0.0')
}
