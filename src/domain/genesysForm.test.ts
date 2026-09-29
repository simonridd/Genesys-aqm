import { describe, expect, it } from 'vitest'
import { genesysCustomerServiceForm } from './genesysForm'
import { seedForms, toScorecard, validateForm } from './forms'
import { validateScorecard } from './validation'
import { sampleLibrary } from './conversations'

describe('recreated Genesys Customer Service form', () => {
  it('preserves the source sections and all 17 visible prompts without altering synthetic conversations', () => {
    const form=genesysCustomerServiceForm
    expect(form.questions).toHaveLength(17)
    expect([...new Set(form.questions.map(q=>q.section))]).toEqual(['Opening','Assisting The Customer','Call Handling Skills','Compliance & Closure'])
    expect(form.questions.find(q=>q.id==='dpa_validation')?.options.find(o=>o.key==='yes')?.sourceValue).toBe(5)
    expect(form.questions.find(q=>q.id==='ownership')?.options.map(o=>o.sourceValue)).toEqual([1,2,3,4,5])
    expect(sampleLibrary).toHaveLength(19)
    expect(seedForms.at(-1)?.id).toBe(form.id)
  })
  it('requires review before evaluation and keeps unsupported source logic disabled', () => {
    const form=genesysCustomerServiceForm
    expect(form.enabled).toBe(false)
    expect(form.questions.find(q=>q.id==='call_reason')?.enabled).toBe(false)
    expect(form.questions.find(q=>q.id==='recommend_products')?.enabled).toBe(false)
    expect(form.scoring.criticalQuestionIds).toEqual(['dpa_validation','appropriate_solution'])
    expect(validateForm(form)).toEqual([])
    expect(validateScorecard(toScorecard(form))).toEqual([])
  })
})
