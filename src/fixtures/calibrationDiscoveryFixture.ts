import { reviewFixture, reviewInput } from './reviewFixture'
import { buildReview, type ReviewEvaluation } from '../domain/reviews'
export const calibrationNow='2026-10-03T10:00:00.000Z'
/** Fictional historic versions intentionally differ from current saved form v18. */
export function calibrationDiscoveryRecords():ReviewEvaluation[] {
  const records:ReviewEvaluation[]=[]
  for(const [ref,version,name,count,disagree,date,agent,queue,source] of [
    ['general_service',18,'Customer Service',6,2,'2026-09-20','fixture-agent','Customer care','genesys-cloud'],
    ['retired_complaints',3,'Complaints Handling',4,1,'2026-10-01','retired-agent','Complaints','genesys-cloud'],
    ['general_service',17,'Customer Service',8,5,'2026-09-10','fixture-agent','Customer care','genesys-cloud'],
    ['synthetic_form',2,'Practice Service',3,1,'2026-09-25','synthetic-agent','Practice','synthetic'],
  ] as const){
    for(let index=0;index<count;index++){
      const record=reviewFixture(`${ref}-v${version}-${index}`,source)
      record.form={...record.form,id:ref,version,name}
      record.form.questions=record.form.questions.map(q=>q.id==='understanding'?{...q,title:'Clear next step'}:q)
      record.questions=record.questions.map(q=>q.id==='understanding'?{...q,title:'Clear next step'}:q)
      record.evaluatedAt=`${date}T10:00:00.000Z`;record.agent={id:agent,name:agent==='fixture-agent'?'Fixture Agent':'Historical reviewer cohort'};record.queue=queue
      // Existing synthetic conversation evidence supports a provider-free round trip.
      record.conversationId='conv-billing-001'
      const input=reviewInput(record)
      input.answers=[{questionId:'greeting',value:index===0?'No':'Yes'},{questionId:'understanding',value:index<disagree?2:1},{questionId:'resolution',value:'fully_resolved'}]
      records.push({...record,humanReview:buildReview(record,undefined,input,{userId:'owner'},calibrationNow)})
    }
  }
  return records
}
