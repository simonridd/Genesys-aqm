import { describe,it,expect } from 'vitest'
import { humanReviewStatus,routineConversationMetadata,safeConversationMetadata,evaluationSourceLabel,aiRequestEstimate } from './userLanguage'
describe('presentation boundaries',()=>{
 it('maps every persisted review status without changing values',()=>{
  expect(['NOT_REVIEWED','REVIEW_REQUESTED','IN_REVIEW','REVIEWED'].map(s=>humanReviewStatus(s as Parameters<typeof humanReviewStatus>[0]))).toEqual(['Not reviewed','Review requested','In progress','Completed'])
  expect(humanReviewStatus('REVIEW_REQUESTED',true)).toBe('Ready to review')
 })
 it('allows human context and preserves safe unknown metadata only for deliberate detail',()=>{
  const raw={queue:'Customer care',direction:'inbound',topic:'Billing',tags:'billing, resolved',queueId:'55555555-5555-4555-8555-555555555555',sessionId:'session-exact',agent:'agent-id',source:'genesys-cloud',custom_key:'support evidence',accessToken:'private',authorization:'Bearer private',custom_value:'Bearer secret'}
  expect(routineConversationMetadata(raw)).toEqual([['Queue','Customer care'],['Direction','inbound'],['Topic','Billing'],['Tags','billing, resolved']])
  expect(safeConversationMetadata(raw)).toContainEqual(['custom_key','support evidence'])
  for(const key of ['accessToken','authorization','custom_value'])expect(safeConversationMetadata(raw).map(([k])=>k)).not.toContain(key)
  expect(routineConversationMetadata({queue:raw.queueId,queueId:raw.queueId,transcriptStatus:'Unavailable'})).toEqual([['Transcript','Unavailable']])
 })
 it('keeps request counts and provider context clear',()=>{expect(aiRequestEstimate(1,true)).toBe('up to 1 AI request (Jev)');expect(aiRequestEstimate(3)).toBe('up to 3 AI requests')})
 it('does not invent source authority',()=>{expect(evaluationSourceLabel('genesys-cloud')).toBe('Genesys Cloud');expect(evaluationSourceLabel('unknown')).toBe('Source unavailable')})
})
