import { describe,expect,it } from 'vitest'
import { reviewDraft,observeReview,reviewDraftConflict } from './useReviewDrafts'
import { buildReview } from './domain/reviews'
import { reviewFixture,reviewInput } from './fixtures/reviewFixture'
const record=reviewFixture(),actor={userId:'fixture'},now='2026-10-03T12:00:00.000Z'
describe('review draft authority boundary',()=>{
  it('initializes only editable review content from authority, without copying the form or AI',()=>{
    const review=buildReview(record,undefined,reviewInput(record,'save'),actor,now)
    const draft=reviewDraft(record.id,review)
    expect(draft).toMatchObject({baseRevision:1,dirty:false,editing:true,notes:review.notes})
    expect(draft.answers).toHaveLength(3)
    expect(Object.keys(draft).sort()).toEqual(['answers','baseRevision','dirty','editing','evaluationId','notes'])
    draft.answers[0].note='Unsubmitted change'
    expect(review.questions[0].human?.note).not.toBe('Unsubmitted change')
  })
  it('restores same revision and preserves dirty values across changed revision or missing authority',()=>{
    const review=buildReview(record,undefined,reviewInput(record,'start'),actor,now)
    const draft={...reviewDraft(record.id,review),dirty:true,notes:'Unsubmitted'}
    expect(observeReview(draft,record.id,review)).toBe(draft)
    expect(reviewDraftConflict(draft,review)).toBe(false)
    const next={...review,revision:2}
    expect(observeReview(draft,record.id,next)).toBe(draft)
    expect(reviewDraftConflict(draft,next)).toBe(true)
    expect(observeReview(draft,record.id,undefined)).toBe(draft)
    expect(reviewDraftConflict(draft,undefined)).toBe(true)
  })
  it('accepts new authority when clean and starts without unsaved changes',()=>{
    const review=buildReview(record,undefined,reviewInput(record,'start'),actor,now)
    const initial=reviewDraft(record.id)
    expect(observeReview(initial,record.id,review)).toMatchObject({baseRevision:1,dirty:false,editing:true})
    const saved=buildReview(record,review,reviewInput(record,'save',1),actor,now)
    expect(observeReview(reviewDraft(record.id,review),record.id,saved)).toMatchObject({baseRevision:2,dirty:false,notes:saved.notes})
  })
})
