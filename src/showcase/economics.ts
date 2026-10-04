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

// Explanatory context only; estimateCost().selected remains the cost authority.
export function selectionPlanningContext(input: Pick<CostInputs, 'volume' | 'percentage'>) {
  const rawSelected = input.volume * input.percentage / 100
  const selectedWhole = Math.floor(rawSelected)
  return {
    rawSelected,
    selectedWhole,
    roundingApplied: rawSelected > selectedWhole,
    belowOneWholeConversation: input.volume > 0 && input.percentage > 0 && rawSelected > 0 && selectedWhole === 0,
  }
}

export function formatPlanningSelection(rawSelected: number) {
  if (rawSelected > 0 && rawSelected < .01) return '<0.01'
  const readable = rawSelected.toLocaleString('en-US', { maximumSignificantDigits: 6 })
  // Do not let display rounding turn a fraction below one into a whole conversation.
  return rawSelected < 1 && Number(readable) >= 1 ? '<1' : readable
}
