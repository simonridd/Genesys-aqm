import { materializeGroups } from './formComposition'
import type { EvaluationForm, InteractionPolicy } from './types'
import { toScorecard, validateForm } from './forms'
import { validateScorecard } from './validation'

export function formStatus(form: EvaluationForm): NonNullable<EvaluationForm['status']> {
  return form.status ?? (form.enabled ? 'PUBLISHED' : 'DRAFT')
}

export function productionReadinessErrors(form: EvaluationForm): string[] {
  return [...validateForm(form), ...validateScorecard(toScorecard(form))]
}

export function isOperationalForm(form: EvaluationForm): boolean {
  return formStatus(form) === 'PUBLISHED' && form.enabled && productionReadinessErrors(form).length === 0
}

// Firestore map key order is not definition content. Array order still matters.
function ordered(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(ordered)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, ordered(item)]))
  return value
}

export function sameDefinition(a: EvaluationForm, b: EvaluationForm): boolean {
  const definition = (form: EvaluationForm) => JSON.stringify(ordered({
    name: form.name, description: form.description, version: form.version,
    groups: form.groups, questions: form.questions, scoring: form.scoring, origin: form.origin,
    sourceFormId: form.sourceFormId,
  }))
  return definition(a) === definition(b)
}

export function nextFormVersion(form: EvaluationForm, existing: EvaluationForm[], now: string): EvaluationForm {
  const familyId = form.familyId ?? form.id
  const version = Math.max(...existing.filter(item => (item.familyId ?? item.id) === familyId).map(item => item.version), form.version) + 1
  return { ...materializeGroups(form), id: `${familyId}_v${version}`, familyId,
    version, status: 'DRAFT', enabled: false, createdAt: now, updatedAt: now, publishedAt: undefined }
}

export function transitionForm(form: EvaluationForm, to: NonNullable<EvaluationForm['status']>, now: string): EvaluationForm {
  const from = formStatus(form)
  if (!(from === 'DRAFT' && to === 'TESTING' || from === 'TESTING' && to === 'DRAFT' ||
    (from === 'DRAFT' || from === 'TESTING') && to === 'PUBLISHED' || from === 'PUBLISHED' && to === 'RETIRED')) {
    throw new Error(`Form cannot transition from ${from} to ${to}.`)
  }
  if (to === 'PUBLISHED') {
    const errors = productionReadinessErrors(form)
    if (errors.length) throw new Error(errors.join(' '))
  }
  return { ...structuredClone(form), status: to, enabled: to === 'PUBLISHED',
    updatedAt: now, publishedAt: to === 'PUBLISHED' ? now : form.publishedAt }
}

export function validatePolicyFormPins(policy: InteractionPolicy, forms: EvaluationForm[]): string[] {
  return policy.evaluationFormIds.flatMap(id => {
    const form = forms.find(item => item.id === id)
    if (!form) return [`Assigned form ${id} does not exist.`]
    const errors = productionReadinessErrors(form)
    if (errors.length) return errors.map(error => `Assigned form ${id}: ${error}`)
    if (formStatus(form) !== 'PUBLISHED' || !form.enabled) return [`Assigned form ${id} must be published and enabled.`]
    return []
  })
}
