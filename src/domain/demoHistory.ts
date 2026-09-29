import { sampleLibrary } from './conversations'
import { seedForms } from './forms'
import { assignedFormIds, matchPolicies, seedPolicies } from './policies'
import type { EvaluationRecord, QuestionResult } from './types'
/** Fixtures only. These are authored examples, never provider responses. */
export function makeDemoHistory(): EvaluationRecord[] {
  const records: EvaluationRecord[] = []
  for (const [index, sample] of sampleLibrary.entries()) {
    const conversation = sample.conversation
    const matches = matchPolicies(conversation, seedPolicies)
    const ids = assignedFormIds(matches, seedPolicies)
    if (!ids.length) ids.push('general_service')
    for (const formId of ids) {
      const form = seedForms.find(f => f.id === formId)!
      const level = sample.quality === 'Excellent' ? .94 : sample.quality === 'Good' ? .81 : sample.quality === 'Poor' ? .18 : .58
      const questions: QuestionResult[] = form.questions.map((q, qi) => {
        const variation = ((index * 3 + qi * 7) % 5 - 2) * .055
        let credit = Math.max(0, Math.min(1, level + variation))
        if (q.type === 'noul') credit = credit >= .68 ? 1 : 0
        if (conversation.conversationId.includes('verification-failure') && (q.id === 'failed_check_safe' || q.id === 'identity_before_disclosure')) credit = 0
        if (conversation.conversationId.includes('empathy-process-gap') && q.id === 'identity_before_disclosure') credit = 0
        if (conversation.conversationId.includes('compliant-unresolved') && q.id === 'identity_before_disclosure') credit = 1
        if (conversation.conversationId.includes('compliant-unresolved') && (q.id === 'resolution' || q.id === 'ownership')) credit = 0
        if (conversation.conversationId.includes('empathy-process-gap') && q.id === 'empathy') credit = 1
        const option = q.type === 'choice' ? [...q.options].filter(o => o.credit !== undefined).sort((a,b) => Math.abs((a.credit ?? 0)-credit)-Math.abs((b.credit ?? 0)-credit))[0] : undefined
        if (option) credit = option.credit!
        return { id:q.id,title:q.title,type:q.type,rawValue:q.type === 'noul' ? credit : option ? option.key : credit*(q.options.length-1),outcome:q.type === 'noul' ? credit ? 'Yes':'No' : option ? option.label : `${Math.round(credit*100)}% fixture credit`,credit,weight:q.weight,weightedContribution:credit*q.weight }
      })
      const countedWeight = questions.reduce((n,q) => n+q.weight,0)
      const overallScore = countedWeight ? questions.reduce((n,q) => n+(q.weightedContribution ?? 0),0)/countedWeight : null
      const criticalFailures = form.scoring.criticalQuestionIds.filter(id => questions.some(q => q.id === id && (q.credit ?? 0) < 1))
      records.push({ id:`demo-${conversation.conversationId}-${form.id}`,source:'synthetic-demo',conversationId:conversation.conversationId,agent:{...conversation.agent},queue:conversation.metadata.queue,channel:conversation.channel,topic:conversation.metadata.topic,policyMatches:matches.filter(m => seedPolicies.find(p => p.id === m.policyId)?.evaluationFormIds.includes(form.id)),form:structuredClone(form),evaluatedAt:new Date(Date.parse(conversation.startedAt)+10*60_000).toISOString(),overallScore,passed:overallScore === null ? null : overallScore >= form.scoring.passScore && criticalFailures.length === 0,criticalFailures,questions,provider:'synthetic fixture',model:'none' })
    }
  }
  return records
}
