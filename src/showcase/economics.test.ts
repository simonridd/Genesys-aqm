import { describe, expect, it } from 'vitest'
import { costPreset, estimateCost, selectionPlanningContext, formatPlanningSelection } from './economics'

describe('Whole-conversation calculation authority', () => {
  it.each([[100000,50,50000],[3,50,1],[1,1,0],[199,1,1],[200,1,2],[100,10,10],[100,0,0],[0,50,0]])('floors %s conversations at %s%% to %s selected', (volume,percentage,selected) => {
    expect(estimateCost({...costPreset,volume,percentage})?.selected).toBe(selected)
  })
  it('keeps tiny positive selection at zero requests and exactly zero cost', () => {
    expect(estimateCost({volume:1,percentage:1,forms:1,requests:1,tokens:1})).toEqual({selected:0,evaluations:0,requests:0,cost:0})
  })
  it('keeps the default numerical contract', () => {
    expect(estimateCost(costPreset)).toEqual({selected:50000,evaluations:50000,requests:50000,cost:16.8})
    expect(estimateCost(costPreset)!.requests * costPreset.tokens).toBe(400000000)
  })
  it('keeps fractional forms and requests as planning averages', () => {
    expect(estimateCost({...costPreset,volume:1,percentage:100,forms:1.5,requests:2.5})).toEqual({selected:1,evaluations:1.5,requests:3.75,cost:.00126})
  })
  it('keeps positive sub-cent cost distinct from rounded-to-zero selection', () => {
    const result=estimateCost({volume:1,percentage:100,forms:1,requests:1,tokens:1})!
    expect(result).toMatchObject({selected:1,evaluations:1,requests:1})
    expect(result.cost).toBe(.000000042)
    expect(result.cost).toBeGreaterThan(0); expect(result.cost).toBeLessThan(.01)
  })
})

describe('Selection explanation only', () => {
  it.each([[1,1,.01,0,true,true],[3,50,1.5,1,true,false],[15,10,1.5,1,true,false],[100,10,10,10,false,false],[100,0,0,0,false,false],[0,50,0,0,false,false]])('describes %s at %s%% without changing cost', (volume,percentage,rawSelected,selectedWhole,roundingApplied,belowOneWholeConversation) => {
    expect(selectionPlanningContext({volume,percentage})).toEqual({rawSelected,selectedWhole,roundingApplied,belowOneWholeConversation})
    expect(estimateCost({...costPreset,volume,percentage})?.selected).toBe(selectedWhole)
  })
  it.each([[.01,'0.01'],[.00001,'<0.01'],[1.5,'1.5'],[.99999999,'<1'],[.30000000000000004,'0.3']])('formats %s readably as %s', (value,expected) => {
    expect(formatPlanningSelection(value as number)).toBe(expected)
  })
})
