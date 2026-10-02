import { overviewFixture, overviewNow, overviewPolicy } from './overviewFixture'
import { reviewFixture, reviewInput } from './reviewFixture'
import { buildReview } from '../domain/reviews'
import type { EvaluationRecord } from '../domain/types'
export const investigationCohort={from:'2026-09-01',to:'2026-09-30',source:'genesys-cloud',policy:'daily_voice',form:'general_service@17',agent:'Fixture Agent',queue:'Customer care',channel:'voice',mode:'scheduled'}
export const investigationNow=overviewNow
export async function investigationFixture(){
 const store=await overviewFixture(true),actor={userId:'admin',displayName:'Owner'}
 const base:EvaluationRecord={...reviewFixture('first'),evaluatedAt:'2026-09-01T00:00:00.000Z',executionMode:'scheduled',policyMatches:[{policyId:overviewPolicy.id,policyName:overviewPolicy.name,matchedGroup:[]}]}
 await store.putEvaluation(base)
 await store.putEvaluation({...base,id:'last',evaluatedAt:'2026-09-30T23:59:59.999Z'})
 const variations:Record<string,Partial<EvaluationRecord>>={v18:{form:{...base.form,version:18}},before:{evaluatedAt:'2026-08-31T23:59:59.999Z'},after:{evaluatedAt:'2026-10-01T00:00:00.000Z'},source:{conversationSource:'synthetic'},policy:{policyMatches:[]},agent:{agent:{id:'other',name:'Fixture Agent extra'}},queue:{queue:'Customer care extra'},email:{channel:'email'},messaging:{channel:'messaging'},future_channel:{channel:'future-channel'},manual:{executionMode:'manual'},demo:{source:'synthetic-demo'},skipped:{questions:base.questions.map(q=>q.id==='greeting'?{...q,status:'SKIPPED'}:q)}}
 for(const [id,variation] of Object.entries(variations))await store.putEvaluation({...base,id,...variation})
 for(const [id,action,assigned] of [['progress','start',true],['progress_unassigned','start',false],['requested_extra','request',true],['completed_one','complete',true],['completed_two','complete',false]] as const){
  const record=reviewFixture(id);await store.putEvaluation(record)
  const review=buildReview(record,undefined,reviewInput(record,action),actor,overviewNow)
  review.dueAt=action==='complete'?'2026-09-28T12:00:00.000Z':'2026-10-05T12:00:00.000Z'
  if(assigned){review.assignment={assignee:actor,assignedAt:overviewNow,assignedBy:actor,dueAt:review.dueAt};delete review.dueAt}
  await store.writeReviews([{review,expectedRevision:0}])
 }
 return store
}
