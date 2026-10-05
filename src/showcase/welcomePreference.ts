// Browser-local introduction preference; never account or workspace state.
export const welcomeSeenKey = 'genesys-aqm-welcome-seen-v1'

export function hasSeenWelcome(): boolean {
  try { return localStorage.getItem(welcomeSeenKey) === '1' } catch { return false }
}

export function markWelcomeSeen(): void {
  try { localStorage.setItem(welcomeSeenKey, '1') } catch { /* Unavailable storage may show Welcome again next visit. */ }
}
