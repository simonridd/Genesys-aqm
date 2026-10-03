import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { entryRoute, demoStep } from './routing'
import { estimateCost, costPreset, costBounds } from './economics'
import { DemoRepository, demoClock, demoForm } from './fixtures'
import { scoreFormResults } from '../domain/formComposition'
import { validateForm } from '../domain/forms'
import { questionBreakdown } from '../domain/analytics'
import { reviewDueState } from '../domain/reviewSla'
import { claims } from './claims'
describe('Showcase entry boundary', () => {
  it('routes explicit demo before live selectors without touching a session', () => {
    expect(entryRoute(new URLSearchParams('page=demo&code=ignored&evaluationId=ignored'), true)).toBe('demo')
    expect(entryRoute(new URLSearchParams())).toBe('welcome')
    expect(entryRoute(new URLSearchParams(), true)).toBe('live')
    for (const query of ['page=evaluate', 'page=settings&settingsSection=reviews', 'evaluationId=e', 'policyId=p', 'runId=r', 'code=c&state=s', 'error=denied', 'settingsSection=connection']) expect(entryRoute(new URLSearchParams(query))).toBe('live')
    expect(entryRoute(new URLSearchParams('page=welcome'), true)).toBe('welcome')
  })
  it('bounds chapters deterministically', () => {
    for (const value of ['NaN', 'Infinity', '0', '-1', '8', '1.5']) expect(demoStep(new URLSearchParams({ step: value }))).toBe(1)
    expect(demoStep(new URLSearchParams('step=5'))).toBe(5)
    expect(demoStep(new URLSearchParams('step=6'))).toBe(4)
    expect(demoStep(new URLSearchParams('step=7'))).toBe(5)
  })
})
describe('Illustrative economics', () => {
  it('does not charge questions twice and counts repeated waves', () => {
    expect(estimateCost(costPreset)?.cost).toBeCloseTo(16.80)
    expect(estimateCost({ ...costPreset, requests: 2 })?.cost).toBeCloseTo(33.60)
    expect(estimateCost({ ...costPreset, volume: 11, percentage: 50, forms: 1.5, requests: 1.2 })).toMatchObject({ selected: 5, evaluations: 7.5, requests: 9 })
    expect(estimateCost({ ...costPreset, percentage: 0 })?.cost).toBe(0)
    expect(claims.price).toMatchObject({ value: .042, category: 'vendor-reported', checkedAt: '2026-10-03', source: 'https://docs.typesafe.ai/models' })
  })
  it('rejects non-finite and out-of-range values without NaN results', () => {
    for (const key of Object.keys(costBounds) as Array<keyof typeof costPreset>) {
      for (const value of [NaN, Infinity, -Infinity, -1, costBounds[key][1] + 1]) expect(estimateCost({ ...costPreset, [key]: value })).toBeNull()
      expect(Number.isFinite(estimateCost({ ...costPreset, [key]: costBounds[key][1] })!.cost)).toBe(true)
    }
  })
})
describe('Isolated deterministic story', () => {
  it('reconciles snapshots, cohorts, group scores, coverage and due states', () => {
    const repository = new DemoRepository(), overview = repository.overview()
    expect(validateForm(demoForm)).toEqual([])
    expect(repository.list()).toHaveLength(24)
    expect(repository.cohort()).toHaveLength(24)
    expect(questionBreakdown(repository.list()).find(item => item.questionId === 'next-step')?.count).toBe(24)
    expect(reviewDueState(repository.humanReview(), demoClock)).toBe('DUE_SOON')
    for (const record of repository.list()) {
      const scored = scoreFormResults(record.form, record.questions)
      expect(record.overallScore).toBe(scored.overallScore)
      expect(record.passed).toBe(scored.passed)
      expect(record.form.version).toBe(3)
      expect(record.providerRequestCount).toBe(0)
    }
    expect(overview.analytics.complete && overview.analytics.data.coverage).toMatchObject({ eligible: 48, sampled: 24, evaluated: 24, samplingCoverage: .5, evaluationCoverage: .5 })
    expect(repository.case().questions.find(question => question.id === 'escalated')?.status).toBe('SKIPPED')
  })
  it('preserves AI results, stores a human disagreement only in memory, and reseeds', () => {
    const repository = new DemoRepository(), before = repository.case()
    expect(repository.saveReview(false).status).toBe('IN_REVIEW')
    const completed = repository.saveReview(true)
    expect(completed.status).toBe('REVIEWED')
    expect(completed.comparison.disagreements).toBe(1)
    expect(completed.comparison.absoluteScoreDifference).toBeGreaterThan(0)
    expect(repository.case()).toEqual(before)
    expect(repository.saveReview(true)).toEqual(completed)
    expect(repository.list()).toHaveLength(24)
    expect(new DemoRepository().humanReview().status).toBe('REVIEW_REQUESTED')
    const copy = repository.list(); copy[0].form.name = 'changed'
    expect(repository.case().form.name).toBe(demoForm.name)
  })
  it('has no implicit live fallback when a required repository method is absent', () => {
    const fetcher = vi.fn(() => { throw Error('Forbidden request') })
    vi.stubGlobal('fetch', fetcher)
    const repository = new DemoRepository()
    Object.defineProperty(repository, 'case', { value: undefined })
    expect(() => repository.case()).toThrow()
    expect(fetcher).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
it('uses byte-identical accepted artwork without remote fonts', () => {
  expect(createHash('sha256').update(readFileSync('public/IPIlogo.svg')).digest('hex')).toBe('abaaa77faa7b27add57acf58f1723f1011481c7107ade6b5e326d7e59edfb865')
  expect(readFileSync('index.html', 'utf8')).not.toMatch(/fonts\.google|fonts\.gstatic/)
  expect(readFileSync('src/styles.css', 'utf8')).not.toMatch(/DM Sans|Manrope/)
})
