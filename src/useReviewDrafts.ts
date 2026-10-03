import { useCallback, useState } from 'react'
import type { HumanAnswer, HumanReview } from './domain/reviews'

/** Unsubmitted human text lives only in the running App, never in a browser cache. */
export interface ReviewDraft {
  evaluationId: string
  baseRevision: number
  answers: HumanAnswer[]
  notes: string
  dirty: boolean
  editing: boolean
}
export interface EvidenceReturnContext {
  returnUrl: string
  evaluationId: string
  returnFocus: 'review' | 'detail'
  cursor?: string
}
export function reviewDraft(evaluationId: string, review?: HumanReview): ReviewDraft {
  return {
    evaluationId, baseRevision: review?.revision ?? 0,
    answers: review?.questions.flatMap(q => q.human ? [{questionId:q.questionId,value:q.human.value,note:q.human.note}] : []) ?? [],
    notes: review?.notes ?? '', dirty:false, editing:review?.status === 'IN_REVIEW',
  }
}
export function observeReview(draft: ReviewDraft | undefined, evaluationId: string, review?: HumanReview): ReviewDraft {
  // Refreshing authority must never replace unfinished work, even after reassignment.
  if (draft?.dirty || draft?.baseRevision === (review?.revision ?? 0)) return draft
  return reviewDraft(evaluationId, review)
}
export function reviewDraftConflict(draft: ReviewDraft | undefined, review?: HumanReview): boolean {
  return !!draft?.dirty && draft.baseRevision !== (review?.revision ?? 0)
}
export function useReviewDrafts() {
  const [drafts,setDrafts] = useState<Record<string,ReviewDraft>>({})
  const observe = useCallback((id:string, review?:HumanReview) => setDrafts(items => {
    const next=observeReview(items[id],id,review)
    return next===items[id] ? items : {...items,[id]:next}
  }),[])
  const replace = useCallback((id:string,review?:HumanReview) => setDrafts(items => ({...items,[id]:reviewDraft(id,review)})),[])
  const clear = useCallback((id:string) => setDrafts(items => {
    const next={...items};delete next[id];return next
  }),[])
  const change = useCallback((id:string,update:(draft:ReviewDraft)=>ReviewDraft) => setDrafts(items => {
    const draft=items[id]
    return draft ? {...items,[id]:{...update(draft),dirty:true}} : items
  }),[])
  return {drafts,observe,replace,clear,change,dirty:Object.values(drafts).some(d=>d.dirty)}
}
export type ReviewDraftController = ReturnType<typeof useReviewDrafts>
