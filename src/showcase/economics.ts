import { claims } from './claims'
export interface CostInputs { volume: number; percentage: number; forms: number; requests: number; tokens: number }
export const costPreset: CostInputs = { volume: 100_000, percentage: 50, forms: 1, requests: 1, tokens: 8_000 }
export const costBounds: Record<keyof CostInputs, [number, number]> = { volume: [0, 1e9], percentage: [0, 100], forms: [0, 100], requests: [0, 100], tokens: [0, 64_000] }
export function estimateCost(input: CostInputs) {
  for (const key of Object.keys(costBounds) as Array<keyof CostInputs>) {
    const [minimum, maximum] = costBounds[key]
    if (!Number.isFinite(input[key]) || input[key] < minimum || input[key] > maximum) return null
  }
  const selected = Math.floor(input.volume * input.percentage / 100)
  const evaluations = selected * input.forms
  const requests = evaluations * input.requests
  return { selected, evaluations, requests, cost: requests * input.tokens / 1_000_000 * claims.price.value }
}
