import type { EvaluationForm, InteractionPolicy } from './types'
import { validateForm } from './forms'

export function formStatus(form: EvaluationForm): NonNullable<EvaluationForm['status']> {
  // Forms created before V0.6 were assignable and published in place. Treat
  // those as published snapshots until an explicit new version is created.
  return form.status ?? (form.enabled ? 'PUBLISHED' : 'DRAFT')
}

export function sameDefinition(a: EvaluationForm, b: EvaluationForm): boolean {
  const definition = (form: EvaluationForm) => JSON.stringify({
    name: form.name, description: form.description, version: form.version,
    questions: form.questions, scoring: form.scoring, origin: form.origin,
    sourceFormId: form.sourceFormId,
  })
  return definition(a) === definition(b)
}

export function nextFormVersion(form: EvaluationForm, existing: EvaluationForm[], now: string): EvaluationForm {
  const familyId = form.familyId ?? form.id
  const version = Math.max(...existing.filter(item => (item.familyId ?? item.id) === familyId).map(item => item.version), form.version) + 1
  return { ...structuredClone(form), id: `${familyId}_v${version}`, familyId,
    version, status: 'DRAFT', enabled: false, createdAt: now, updatedAt: now, publishedAt: undefined }
}

export function transitionForm(form: EvaluationForm, to: NonNullable<EvaluationForm['status']>, now: string): EvaluationForm {
  const from = formStatus(form)
  if (!(from === 'DRAFT' && to === 'TESTING' || from === 'TESTING' && to === 'DRAFT' ||
    (from === 'DRAFT' || from === 'TESTING') && to === 'PUBLISHED' || from === 'PUBLISHED' && to === 'RETIRED')) {
    throw new Error(`Form cannot transition from ${from} to ${to}.`)
  }
  if (to === 'PUBLISHED' && validateForm(form).length) throw new Error('Fix form validation before publishing.')
  if (to === 'PUBLISHED' && form.origin === 'genesys-recreated') throw new Error('The recreated Genesys form needs authoritative configuration before publication.')
  return { ...structuredClone(form), status: to, enabled: to === 'PUBLISHED',
    updatedAt: now, publishedAt: to === 'PUBLISHED' ? now : form.publishedAt }
}

export function validatePolicyFormPins(policy: InteractionPolicy, forms: EvaluationForm[]): string[] {
  return policy.evaluationFormIds.flatMap(id => {
    const form = forms.find(item => item.id === id)
    if (!form) return [`Assigned form ${id} does not exist.`]
    if (form.origin === 'genesys-recreated') return [`Assigned form ${id} is a recreated Genesys form and needs authoritative configuration before use.`]
    if (formStatus(form) !== 'PUBLISHED' || !form.enabled) return [`Assigned form ${id} must be published and enabled.`]
    return []
  })
}
