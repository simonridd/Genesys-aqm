import { MemoryStore } from '../server/store'
import { reviewFixture, reviewInput } from './reviewFixture'
import { buildReview } from '../domain/reviews'
import type { PolicyRun, InteractionPolicy } from '../domain/types'
export const overviewNow='2026-10-02T12:00:00.000Z'
export const overviewAuthority={bootstrapId:'admin',allowedUserIds:new Set(['admin','reviewer','viewer','author'])}
export const overviewPolicy:InteractionPolicy={id:'daily_voice',name:'Daily Voice Customer Service AQM',description:'',enabled:true,version:1,criteria:{anyOf:[]},evaluationFormIds:[reviewFixture().form.id]}
export const fixtureRun=(id:string,startedAt=overviewNow,status:PolicyRun['status']='completed',mode:PolicyRun['executionMode']='scheduled'):PolicyRun=>({id,policyId:overviewPolicy.id,policySnapshot:overviewPolicy,source:'genesys-cloud',executionMode:mode,startedAt,completedAt:startedAt,status,formsAssigned:overviewPolicy.evaluationFormIds,candidateConversationCount:20,matchedConversationCount:10,evaluationsRequested:3,evaluationsSucceeded:status==='failed'?0:2,evaluationsFailed:status==='failed'?3:status==='partial-failure'?1:0,failures:[],coverage:{candidateCount:20,eligibleCount:10,sampledCount:5,evaluableCount:3,evaluatedConversationCount:2,evaluationCount:3,successfulEvaluationCount:2,failedEvaluationCount:1,transcriptUnavailableCount:2}})
export async function overviewFixture(attention=true){
 const store=new MemoryStore(),actor={userId:'admin',displayName:'Owner'}
 await store.putPolicy(overviewPolicy);await store.putForm(reviewFixture().form)
 const scores=[['recent','2026-10-01T10:00:00.000Z',.8,true],['older','2026-09-15T10:00:00.000Z',.4,false],['ancient','2026-08-01T10:00:00.000Z',.2,false]] as const
 for(const [id,evaluatedAt,overallScore,passed] of scores)await store.putEvaluation({...reviewFixture(id),conversationId:`conversation-${id}`,evaluatedAt,overallScore,passed,criticalFailures:passed?[]:['greeting'],policyMatches:[{policyId:overviewPolicy.id,policyName:overviewPolicy.name,matchedGroup:[]}]})
 await store.putRun({...fixtureRun('scheduled_recent','2026-10-01T02:00:00.000Z'),evaluationsFailed:0})
 await store.putRun(fixtureRun('manual_recent','2026-10-02T08:00:00.000Z',attention?'failed':'completed','manual'))
 await store.putRun(fixtureRun('scheduled_older','2026-09-15T02:00:00.000Z'))
 await store.putSchedule({id:'later',policyId:overviewPolicy.id,enabled:true,frequency:'WEEKLY',timezone:'Europe/London',localTime:'02:00',weekday:1,nextDueAt:'2026-10-05T01:00:00.000Z',version:1})
 await store.putSchedule({id:'next',policyId:overviewPolicy.id,enabled:true,frequency:'DAILY',timezone:'Europe/London',localTime:'02:00',nextDueAt:'2026-10-03T01:00:00.000Z',lastSuccessfulAt:'2026-10-01T02:00:00.000Z',version:1})
 await store.recordSchedulerHealth('2026-10-02T11:00:00.000Z',true)
 if(attention){
  for(const [id,dueAt] of [['escalated','2026-09-28T12:00:00Z'],['overdue','2026-10-02T06:00:00Z'],['soon','2026-10-02T18:00:00Z'],['unassigned','2026-10-05T12:00:00Z']]){
   const record=reviewFixture(id);await store.putEvaluation({...record,evaluatedAt:'2026-08-01T12:00:00.000Z'});const review=buildReview(record,undefined,reviewInput(record,'request'),actor,overviewNow)
   review.dueAt=dueAt
   if(id!=='unassigned'){review.assignment={assignee:{userId:'admin'},assignedAt:overviewNow,assignedBy:actor,dueAt};delete review.dueAt}
   await store.writeReviews([{review,expectedRevision:0}])
  }
  await store.upsertAlert({dedupKey:'run-fail',type:'SCHEDULED_RUN_FAILED',severity:'ERROR',title:'Scheduled run failed',message:'Private provider diagnostics',source:'scheduled-run',policyId:overviewPolicy.id,runId:'manual_recent',metadata:{}},overviewNow)
  await store.upsertAlert({dedupKey:'review-escalated',type:'REVIEW_ESCALATED',severity:'ERROR',title:'Review escalated',message:'Review needs attention',source:'review-sla',context:{evaluationId:'escalated',reviewId:'escalated',formId:reviewFixture().form.id,dueAt:'2026-09-28T12:00:00Z'},metadata:{}},overviewNow)
  await store.upsertAlert({dedupKey:'stale',type:'SCHEDULER_STALE',severity:'WARNING',title:'Scheduler activity is stale',message:'Inspect scheduler',source:'scheduler',metadata:{}},overviewNow)
 }
 return store
}
