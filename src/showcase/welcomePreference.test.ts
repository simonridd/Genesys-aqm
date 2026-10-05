import { afterEach, describe, expect, it, vi } from 'vitest'
import { entryRoute } from './routing'
import { hasSeenWelcome, markWelcomeSeen, welcomeSeenKey } from './welcomePreference'

afterEach(() => vi.unstubAllGlobals())
describe('remembered Welcome entry', () => {
  it.each([
    [false, false, 'welcome'], [false, true, 'live'],
    [true, false, 'live'], [true, true, 'live'],
  ] as const)('bare entry connected=%s seen=%s resolves to %s', (connected, seen, entry) => {
    expect(entryRoute(new URLSearchParams(), connected, seen)).toBe(entry)
  })
  it('preserves explicit Welcome and Demo with either preference', () => {
    for (const seen of [false, true]) for (const connected of [false, true]) {
      expect(entryRoute(new URLSearchParams('page=welcome'), connected, seen)).toBe('welcome')
      expect(entryRoute(new URLSearchParams('page=demo'), connected, seen)).toBe('demo')
    }
  })
  it('preserves explicit workspace, callback and deep-link precedence', () => {
    for (const seen of [false, true]) for (const query of ['page=evaluate', 'page=conversations', 'page=automation', 'page=settings', 'evaluationId=e', 'policyId=p', 'runId=r', 'settingsSection=connection', 'code=c&state=s', 'state=s', 'error=denied', 'page=welcome&evaluationId=e']) {
      expect(entryRoute(new URLSearchParams(query), false, seen)).toBe('live')
    }
  })
  it('reads only the stable boolean and writes only the versioned preference', () => {
    const storage = { getItem: vi.fn(() => '1'), setItem: vi.fn() }
    vi.stubGlobal('localStorage', storage)
    expect(hasSeenWelcome()).toBe(true)
    expect(storage.getItem).toHaveBeenCalledWith(welcomeSeenKey)
    storage.getItem.mockReturnValue('unexpected')
    expect(hasSeenWelcome()).toBe(false)
    markWelcomeSeen()
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(welcomeSeenKey, '1')
  })
  it('treats failed reads as unseen and tolerates failed writes/access', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw Error('blocked') }, setItem: () => { throw Error('blocked') } })
    expect(hasSeenWelcome()).toBe(false)
    expect(markWelcomeSeen).not.toThrow()
    vi.stubGlobal('localStorage', undefined)
    expect(hasSeenWelcome()).toBe(false)
    expect(markWelcomeSeen).not.toThrow()
  })
})
