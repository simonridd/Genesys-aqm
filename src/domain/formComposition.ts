import type { Conversation, EvaluationForm, EvaluationRequest, EvaluationResult, FormCondition, FormQuestionGroup, GroupResult, QuestionResult, ScorecardItem } from './types'

/** Legacy snapshots are interpreted without modifying their stored definitions. */
export function formGroups(form: EvaluationForm): FormQuestionGroup[] {
  if (form.groups) {
    const groups = structuredClone(form.groups)
    if (form.questions.some(q => !q.groupId) && !groups.some(g=>g.id==='ungrouped_general')) groups.push({ id: 'ungrouped_general', name: 'General' })
    return groups
  }
  return [...new Set(form.questions.map(q => q.section?.trim() || 'General'))].map((name, index) => ({ id: `legacy_${index}`, name }))
}
export function questionsInGroup(form: EvaluationForm, group: FormQuestionGroup): ScorecardItem[] {
  return form.questions.filter(q => form.groups ? (q.groupId ?? 'ungrouped_general') === group.id : (q.section?.trim() || 'General') === group.name)
}
export function effectiveQuestions(form: EvaluationForm): ScorecardItem[] { return formGroups(form).flatMap(g => questionsInGroup(form, g)) }
export function materializeGroups(form: EvaluationForm): EvaluationForm {
  if (form.groups) return {...structuredClone(form),groups:formGroups(form),questions:form.questions.map(q=>({...structuredClone(q),groupId:q.groupId??'ungrouped_general'}))}
  const groups = formGroups(form)
  return { ...structuredClone(form), groups, questions: form.questions.map(q => ({ ...structuredClone(q), groupId: groups.find(g => g.name === (q.section?.trim() || 'General'))!.id })) }
}
export function conditionReference(condition?: FormCondition): string | undefined { return condition && condition.kind !== 'interaction_metadata' ? condition.questionId : undefined }
export function validateComposition(form: EvaluationForm): string[] {
  const errors: string[] = [], groups = formGroups(form), questions = effectiveQuestions(form)
  if (new Set(form.questions.map(q => q.id)).size !== form.questions.length) errors.push('Question IDs must be unique within the form.')
  if (form.groups) {
    if (new Set(form.groups.map(g => g.id)).size !== form.groups.length) errors.push('Group IDs must be unique.')
    for (const group of form.groups) if (!/^[a-z][a-z0-9_]*$/.test(group.id) || !group.name?.trim()) errors.push('Each group needs a valid ID and name.')
    for (const q of form.questions) if (q.groupId && !form.groups.some(g => g.id === q.groupId)) errors.push(`${q.title}: group ${q.groupId} does not exist.`)
  }
  const check = (condition: FormCondition | undefined, earlier: ScorecardItem[], where: string) => {
    if (!condition) return
    if (condition.kind === 'interaction_metadata') {
      if (!['channel','queue','direction','topic'].includes(condition.field) || !(['equals','in'].includes(condition.operator ?? 'equals')) || (condition.equals === undefined ? !Array.isArray(condition.values) || !condition.values.length || condition.values.some(v => typeof v !== 'string' || !v.trim()) || condition.operator === 'equals' && condition.values.length !== 1 : typeof condition.equals !== 'string' || !condition.equals.trim())) errors.push(`${where}: select a supported interaction field, operator and value.`)
      return
    }
    if (!['question_outcome','question_credit'].includes(condition.kind)) { errors.push(`${where}: unsupported condition.`); return }
    const ref = form.questions.find(q => q.id === condition.questionId)
    if (!ref) { errors.push(`${where}: referenced question ${condition.questionId} does not exist.`); return }
    if (!earlier.some(q => q.id === ref.id)) errors.push(`${where}: ${ref.title} must occur earlier; self, forward and cyclic references are not allowed.`)
    if (!ref.enabled) errors.push(`${where}: referenced question ${ref.title} is disabled.`)
    if (condition.kind === 'question_outcome') {
      const valid = ref.type === 'noul' ? ['yes','no'] : ref.type === 'choice' ? ref.options.map(o => o.key) : []
      if (!Array.isArray(condition.outcomes) || !condition.outcomes.length || condition.outcomes.some(o => typeof o !== 'string' || !valid.includes(ref.type === 'noul' ? o.toLowerCase() : o)) || !['equals','in'].includes(condition.operator ?? 'in') || condition.operator === 'equals' && condition.outcomes.length !== 1) errors.push(`${where}: choose Yes/No for Noul or valid Choice option keys; Score requires a credit threshold.`)
    } else if (!['greater_than_or_equal','less_than'].includes(condition.operator) || !Number.isFinite(condition.value) || condition.value < 0 || condition.value > 1 || ref.type === 'choice' && ref.options.every(o => o.credit === undefined)) errors.push(`${where}: credit conditions need a scored question, a supported comparison and a threshold between 0 and 1.`)
  }
  for (const [index, group] of groups.entries()) check(group.condition, groups.slice(0,index).flatMap(g => questionsInGroup(form,g)), `Group ${group.name}`)
  for (const [index,q] of questions.entries()) if (q.enabled) check(q.condition,questions.slice(0,index),`Question ${q.title}`)
  return errors
}
/** null means the referenced question has not been resolved; skipped/unscored references are false. */
export function conditionApplies(condition: FormCondition | undefined, conversation: Conversation, results: Map<string,QuestionResult>): boolean | null {
  if (!condition) return true
  if (condition.kind === 'interaction_metadata') {
    const value = condition.field === 'channel' ? conversation.channel : conversation.metadata[condition.field]
    return (condition.equals === undefined ? condition.values : [condition.equals]).includes(value)
  }
  const result = results.get(condition.questionId)
  if (!result) return null
  if (result.status === 'SKIPPED') return false
  if (condition.kind === 'question_credit') return result.credit !== null && (condition.operator === 'less_than' ? result.credit < condition.value : result.credit >= condition.value)
  const value = result.type === 'noul' ? result.outcome.toLowerCase() : result.rawValue
  return condition.outcomes.some(o => (result.type === 'noul' ? o.toLowerCase() : o) === value)
}
export function maximumEvaluationWaves(form: EvaluationForm): number {
  if (validateComposition(form).length) return 0
  const depth = new Map<string,number>()
  for (const group of formGroups(form)) {
    const groupRef = conditionReference(group.condition)
    for (const q of questionsInGroup(form,group)) {
      const ref = conditionReference(q.condition)
      depth.set(q.id,q.enabled ? 1 + Math.max(groupRef ? depth.get(groupRef) ?? 0 : 0, ref ? depth.get(ref) ?? 0 : 0) : 0)
    }
  }
  return Math.max(0,...depth.values())
}
export function scoreResults(questions: QuestionResult[]) {
  const answered = questions.filter(q => q.status !== 'SKIPPED' && q.credit !== null)
  const countedWeight = answered.reduce((sum,q) => sum + q.weight,0)
  return { countedWeight, overallScore: countedWeight ? answered.reduce((sum,q) => sum + q.credit! * q.weight,0) / countedWeight : null }
}
export class FormEvaluationFailure extends Error {
  constructor(message: string, readonly providerRequestCount: number) { super(message) }
}
export async function evaluateForm(input: {
  conversation: Conversation; form: EvaluationForm; evaluatedAt: string
  evaluateQuestions: (request: EvaluationRequest) => Promise<EvaluationResult>
  /** Persist an attempted request BEFORE invoking the provider, including ambiguous failures. */
  onProviderRequest?: (count: number) => Promise<void>
}): Promise<EvaluationResult> {
  const { form,conversation,evaluatedAt } = input, errors = validateComposition(form)
  if (errors.length) throw new FormEvaluationFailure(errors.join(' '),0)
  const results = new Map<string,QuestionResult>(), groups = formGroups(form), ordered = effectiveQuestions(form)
  let providerRequestCount = 0, model = 'not-requested', provider: EvaluationResult['provider'] = 'not-requested'
  const rawResponses: unknown[] = []
  const skip = (q:ScorecardItem,skipReason:QuestionResult['skipReason']) => results.set(q.id,{id:q.id,title:q.title,type:q.type,status:'SKIPPED',skipReason,outcome:'Not applicable',credit:null,weight:q.weight,weightedContribution:null})
  try {
    while (results.size < ordered.length) {
      const ready: ScorecardItem[] = []
      for (const group of groups) {
        const groupState = conditionApplies(group.condition,conversation,results)
        for (const q of questionsInGroup(form,group)) {
          if (results.has(q.id)) continue
          if (!q.enabled) { skip(q,'disabled'); continue }
          if (groupState === false) { skip(q,'group_condition_false'); continue }
          const state = conditionApplies(q.condition,conversation,results)
          if (state === false) { skip(q,'question_condition_false'); continue }
          if (groupState === true && state === true) ready.push(q)
        }
      }
      if (!ready.length) {
        if (results.size === ordered.length) break
        // Skips may have resolved a dependency in a group already visited this pass.
        const resolvable = groups.some(g => questionsInGroup(form,g).some(q => !results.has(q.id) && (conditionApplies(g.condition,conversation,results) === false || conditionApplies(q.condition,conversation,results) === false)))
        if (resolvable) continue
        throw Error('Unresolved conditional dependencies; no provider request was made for the remaining questions.')
      }
      await input.onProviderRequest?.(providerRequestCount + 1)
      providerRequestCount++
      const output = await input.evaluateQuestions({ conversation,evaluatedAt,version:'v0',scorecard:{id:form.id,version:form.version,title:form.name,threshold:form.scoring.yesThreshold,items:ready.map(q => ({...q,condition:undefined}))} })
      if (output.questions.length !== ready.length || ready.some(q => !output.questions.some(r => r.id === q.id && r.type === q.type && r.status !== 'SKIPPED')) || new Set(output.questions.map(r=>r.id)).size !== ready.length) throw Error('Provider wave returned an incomplete or inconsistent question result.')
      for (const q of ready) {
        const answer = output.questions.find(r=>r.id===q.id)!
        if (answer.credit !== null && (!Number.isFinite(answer.credit) || answer.credit < 0 || answer.credit > 1)) throw Error('Provider returned invalid credit.')
        results.set(q.id,{...answer,status:'ANSWERED',weight:q.weight,weightedContribution:answer.credit===null?null:answer.credit*q.weight})
      }
      model = output.model; provider = output.provider; rawResponses.push(output.rawResponse)
    }
  } catch (error) { throw new FormEvaluationFailure(error instanceof Error ? error.message : 'Form evaluation failed.',providerRequestCount) }
  const questions = ordered.map(q=>results.get(q.id)!)
  const groupResults: GroupResult[] = groups.map(g => {
    const items = questionsInGroup(form,g).map(q=>results.get(q.id)!)
    return {groupId:g.id,name:g.name,status:conditionApplies(g.condition,conversation,results)===false?'SKIPPED':'APPLICABLE',...scoreResults(items),answered:items.filter(q=>q.status!=='SKIPPED').length,skipped:items.filter(q=>q.status==='SKIPPED').length}
  })
  return {conversationId:conversation.conversationId,scorecardId:form.id,scorecardVersion:form.version,evaluatedAt,provider,model,questions,...scoreResults(questions),providerRequestCount,groups:groupResults,rawResponse:rawResponses}
}
