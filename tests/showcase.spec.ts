import { test, expect, type Page } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { usabilityFixture } from './usability-fixture'
const app = process.env.AQM_BROWSER_URL ?? 'http://127.0.0.1:4174/Genesys-aqm/'
async function snapshot(page: Page) {
  return page.evaluate(async () => ({ local: Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage[key]])), session: Object.fromEntries(Object.keys(sessionStorage).sort().map(key => [key, sessionStorage[key]])), databases: await indexedDB.databases() }))
}
async function isolate(page: Page) {
  const requests: string[] = [], errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin === new URL(app).origin && !url.pathname.includes('/api/') && route.request().method() === 'GET') return route.continue()
    requests.push(`${route.request().method()} ${url.origin}${url.pathname}`)
    return route.abort()
  })
  return { requests, errors }
}
for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }, { width: 390, height: 844 }]) {
  test(`welcome and complete isolated story at ${viewport.width}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport }), page = await context.newPage(), denied = await isolate(page)
    await page.addInitScript(() => {
      localStorage.setItem('fictional-existing-draft', 'unchanged')
      sessionStorage.setItem('fictional-existing-credential', 'do-not-read')
      Storage.prototype.getItem = function(key) { throw Error(`Protected storage read: ${key}`) }
      Storage.prototype.setItem = function(key) { throw Error(`Forbidden storage write: ${key}`) }
      Storage.prototype.removeItem = function(key) { throw Error(`Forbidden storage removal: ${key}`) }
      Storage.prototype.clear = function() { throw Error('Forbidden storage clear') }
      indexedDB.open = function() { throw Error('Forbidden IndexedDB access') }
      indexedDB.deleteDatabase = function() { throw Error('Forbidden IndexedDB removal') }
    })
    await page.goto(app)
    await expect(page.getByRole('heading', { name: 'More conversations understood. Less manual scoring.' })).toBeVisible()
    const before = await snapshot(page)
    await expect(page.getByText('$16.80/month', { exact: true })).toBeVisible()
    await page.getByText('Advanced assumptions', { exact: true }).click()
    await page.getByLabel('Average AI requests per form', { exact: true }).fill('2')
    await expect(page.getByText('$33.60/month', { exact: true })).toBeVisible()
    await page.getByLabel('Conversations per month', { exact: true }).fill('')
    await expect(page.getByRole('alert')).toContainText('Conversations per month must be between 0 and 1,000,000,000')
    await page.getByLabel('Conversations per month', { exact: true }).fill('3')
    await expect(page.getByText('Less than $0.01/month', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Take the guided demo' }).click()
    for (let step = 1; step <= 5; step++) {
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
      await expect(page.getByText(`Chapter ${step} of 5`, { exact: true })).toBeVisible()
      if (step === 1) {
        await expect(page.getByRole('region', { name: 'Conversation transcript' })).toContainText('They should return later')
        await expect(page.getByText('Unavailable', { exact: true })).toHaveCount(0)
      }
      if (step === 2) await expect(page.locator('.demo-content input,.demo-content select')).toHaveCount(0)
      if (step === 3) await expect(page.getByRole('region', { name: 'Prepared evaluation' })).toContainText('100%')
      if (step === 4) {
        await expect(page.getByRole('region', { name: 'Independent human review' })).toContainText('56%')
        await expect(page.getByRole('region', { name: 'Independent human review' })).toContainText('44')
      }
      if (step === 5) await expect(page.getByRole('heading', { name: 'Resolution guidance needs attention' })).toBeVisible()
      const positions = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth, nav: document.querySelector('.tour-controls')!.getBoundingClientRect().top, contentEnd: document.querySelector('.tour-controls')!.previousElementSibling!.getBoundingClientRect().bottom }))
      expect(positions.document).toBeLessThanOrEqual(positions.width)
      expect(positions.nav).toBeGreaterThanOrEqual(positions.contentEnd)
      await expect(page.getByRole('button', { name: 'Skip chapter', exact: true })).toHaveCount(0)
      expect(await snapshot(page)).toEqual(before)
      if (step < 5) await page.getByRole('button', { name: 'Next', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Plan a pilot', exact: true }).click()
    await expect(page.locator('#pilot')).toBeFocused()
    await expect(page).toHaveURL(/#pilot$/)
    expect(await snapshot(page)).toEqual(before)
    expect(denied.requests).toEqual([]); expect(denied.errors).toEqual([])
    await context.close()
  })
}
test('keyboard, self-guided links, reduced motion, history, restart and refresh', async ({ page }) => {
  const denied = await isolate(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (let step = 1; step <= 5; step++) {
    await page.goto(`${app}?page=demo&tour=quality&step=${step}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await page.reload()
    await expect(page.getByText(`Chapter ${step} of 5`, { exact: true })).toBeVisible()
    expect(await page.locator('.demo-content').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  }
  await page.getByText('More options', { exact: true }).click()
  await page.getByRole('button', { name: 'Restart', exact: true }).focus(); await page.keyboard.press('Enter')
  for (let step = 1; step < 5; step++) {
    await page.getByRole('button', { name: 'Next', exact: true }).focus(); await page.keyboard.press('Enter')
    await expect(page.getByText(`Chapter ${step + 1} of 5`, { exact: true })).toBeVisible()
  }
  await page.goBack(); await expect(page.getByText('Chapter 4 of 5', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Back', exact: true }).focus(); await page.keyboard.press('Enter')
  await expect(page.getByText('Chapter 3 of 5', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Manage & pilot', exact: true }).click()
  await page.getByText('Inspect examples', { exact: true }).click()
  await page.getByRole('button', { name: 'Inspect Jamie’s review', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Independent human review' })).toContainText('56%')
  await page.getByRole('button', { name: 'Exit demo', exact: true }).focus(); await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/page=welcome/)
  expect(denied.requests).toEqual([]); expect(denied.errors).toEqual([])
})
for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }, { width: 390, height: 844 }]) {
  test(`disconnected prototype handoff leads to sample conversations at ${viewport.width}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport }), page = await context.newPage(), denied = await isolate(page)
    await page.goto(`${app}?page=demo&step=5`)
    await page.getByText('More options', { exact: true }).click()
    await page.getByRole('button', { name: 'Explore the prototype →', exact: true }).click()
    await expect(page).toHaveURL(/page=conversations/)
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
    await expect(page.locator('.demo-indicator')).toHaveCount(0)
    await expect(page.locator('.source-selector')).toContainText('Fictional sample data · no credentials')
    await expect(page.getByRole('region', { name: 'Continue in the prototype' })).toContainText('separate fictional examples')
    expect(denied.requests).toEqual([]); expect(denied.errors).toEqual([])
    await context.close()
  })
}
test('demo entered with an established real-session-shaped OAuth fixture never touches protected services or storage', async ({ page }) => {
  await usabilityFixture(page)
  await page.getByRole('button', { name: 'About / product tour', exact: true }).click()
  await expect(page).toHaveURL(/page=welcome/)
  await expect(page.getByRole('button', { name: 'Open AQM', exact: true }).first()).toBeVisible()
  const before = await snapshot(page), denied = await isolate(page)
  await page.evaluate(() => {
    Storage.prototype.setItem = function(key) { throw Error(`Forbidden storage write: ${key}`) }
    Storage.prototype.removeItem = function(key) { throw Error(`Forbidden storage removal: ${key}`) }
    Storage.prototype.clear = function() { throw Error('Forbidden storage clear') }
    indexedDB.open = function() { throw Error('Forbidden IndexedDB access') }
    indexedDB.deleteDatabase = function() { throw Error('Forbidden IndexedDB removal') }
  })
  await page.getByRole('button', { name: 'Take the guided demo' }).click()
  for (let step = 1; step < 5; step++) await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Exit demo', exact: true }).click()
  expect(await snapshot(page)).toEqual(before)
  expect(denied.requests).toEqual([]); expect(denied.errors).toEqual([])
  writeFileSync('docs/showcase-human-pass-evidence/isolation.json', JSON.stringify({ forbiddenRequests: denied.requests, unchangedStorage: true, indexedDBUnchanged: true, sessionFixture: 'OAuth fixture established before demo; not live-provider authentication proof', pageErrors: denied.errors }, null, 2))
})
test('failed lazy demo load stays closed instead of mounting live services', async ({ page }) => {
  const forbidden: string[] = []
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.pathname.match(/\/Demo-[^/]+\.js$/)) return route.abort()
    if (url.origin === new URL(app).origin && route.request().method() === 'GET' && !url.pathname.includes('/api/')) return route.continue()
    forbidden.push(`${route.request().method()} ${url.origin}${url.pathname}`)
    return route.abort()
  })
  await page.goto(`${app}?page=demo`)
  await expect(page.getByRole('heading', { name: 'Demo unavailable' })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('No live fallback')
  expect(forbidden).toEqual([])
})
test('explicit Open AQM tears down demo and retains the authenticated product path', async ({ page }) => {
  const fixture = await usabilityFixture(page)
  await page.getByRole('button', { name: 'About / product tour', exact: true }).click()
  await page.getByRole('button', { name: 'Take the guided demo' }).click()
  await page.getByText('More options', { exact: true }).click()
  await page.getByRole('button', { name: 'Open AQM →', exact: true }).click()
  await expect(page.getByLabel('Current role')).toHaveText('ADMIN')
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
  await expect(page.locator('.demo-indicator')).toHaveCount(0)
  await expect(page).toHaveURL(/page=automation/)
  expect(fixture.errors).toEqual([])
})
test('semantic theme contrast, focus and no obscured tour controls', async ({ page }) => {
  await isolate(page)
  await page.goto(`${app}?page=welcome`)
  const ratios = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const luminance = (hex: string) => {
      const channels = [1, 3, 5].map(offset => parseInt(hex.trim().slice(offset, offset + 2), 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
    }
    return [['ink', 'background'], ['muted', 'surface'], ['on-dark', 'primary'], ['on-dark-muted', 'navigation'], ['secondary', 'surface'], ['warning', 'warning-surface'], ['danger', 'danger-surface']].map(([foreground, background]) => {
      const first = luminance(root.getPropertyValue(`--aqm-${foreground}`)), second = luminance(root.getPropertyValue(`--aqm-${background}`))
      return { foreground, background, ratio: (Math.max(first, second) + .05) / (Math.min(first, second) + .05) }
    })
  })
  for (const pair of ratios) expect(pair.ratio).toBeGreaterThanOrEqual(4.5)
  const action = page.getByRole('button', { name: 'Take the guided demo' })
  await action.focus(); await expect(action).toHaveCSS('outline-style', 'solid'); await expect(action).toHaveCSS('outline-color', 'rgb(79, 54, 69)')
  await page.keyboard.press('Enter')
  const rail = await page.locator('.tour-rail').boundingBox(), controls = await page.locator('.demo-content button').all()
  expect(rail).not.toBeNull()
  for (const control of controls) {
    const box = await control.boundingBox()
    if (box && rail) expect(box.x >= rail.x + rail.width - 1 || box.y >= rail.y + rail.height - 1).toBe(true)
  }
  writeFileSync('docs/showcase-human-pass-evidence/contrast.json', JSON.stringify(ratios, null, 2))
})
