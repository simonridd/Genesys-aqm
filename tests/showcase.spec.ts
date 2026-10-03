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
      const original = Storage.prototype.getItem
      Storage.prototype.getItem = function(key) { if (key.startsWith('genesys-aqm') || key.startsWith('fictional-existing')) throw Error(`Protected storage read: ${key}`); return original.call(this, key) }
      Storage.prototype.setItem = function(key) { throw Error(`Forbidden storage write: ${key}`) }
      Storage.prototype.removeItem = function(key) { throw Error(`Forbidden storage removal: ${key}`) }
      Storage.prototype.clear = function() { throw Error('Forbidden storage clear') }
      indexedDB.open = function() { throw Error('Forbidden IndexedDB access') }
      indexedDB.deleteDatabase = function() { throw Error('Forbidden IndexedDB removal') }
    })
    await page.goto(app)
    await expect(page.getByRole('heading', { name: 'More conversations understood. Less manual scoring.' })).toBeVisible()
    await expect(page.locator('.welcome-hero')).toHaveCSS('opacity', '1')
    const before = await snapshot(page)
    await page.screenshot({ path: `docs/ipi-evidence/welcome-${viewport.width}.png`, fullPage: true })
    await page.locator('#economics').scrollIntoViewIfNeeded()
    await expect(page.getByText('$33.60', { exact: true })).toBeVisible()
    await page.getByText('Advanced assumptions', { exact: true }).click()
    await page.getByLabel('Average requests / waves per form').fill('2')
    await expect(page.getByText('$67.20', { exact: true })).toBeVisible()
    await page.getByLabel('Conversation volume').fill('')
    await expect(page.getByRole('alert')).toContainText('finite')
    await page.getByLabel('Conversation volume').fill('100000')
    await page.screenshot({ path: `docs/ipi-evidence/estimator-${viewport.width}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Take the guided demo' }).click()
    const bounds: unknown[] = []
    for (let step = 1; step <= 7; step++) {
      await expect(page.getByRole('navigation', { name: 'Tour controls' })).toBeVisible()
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
      await expect(page.getByText(`Chapter ${step} of 7`, { exact: true })).toBeVisible()
      if (step === 4) {
        await page.getByRole('button', { name: 'Show example evaluation' }).click()
        await expect(page.getByRole('region', { name: 'Prepared evaluation' })).toContainText('actual AI requests: 0')
      }
      if (step === 5) {
        await page.getByRole('button', { name: 'Investigate Clear next step', exact: true }).click()
        await expect(page.getByRole('heading', { name: 'Exact cohort · 24 evaluations' })).toBeVisible()
        await page.getByRole('button', { name: 'Inspect fictional-evaluation-1', exact: true }).click()
        await expect(page).toHaveURL(/step=4/)
        await page.getByRole('button', { name: 'Next', exact: true }).click()
      }
      if (step === 6) {
        await page.getByRole('button', { name: 'Save scripted disagreement' }).click()
        await expect(page.getByRole('status')).toContainText('DEMO memory')
        await page.getByRole('button', { name: 'Complete review', exact: true }).click()
        await expect(page.getByText(/Calibration: 2 agreements/)).toBeVisible()
      }
      await expect(page.locator('.demo-content')).toHaveCSS('opacity', '1')
      await page.screenshot({ path: `docs/ipi-evidence/chapter-${step}-${viewport.width}.png`, fullPage: true })
      bounds.push(await page.evaluate(() => ({ chapter: new URLSearchParams(location.search).get('step'), viewport: innerWidth, document: document.documentElement.scrollWidth, controls: [...document.querySelectorAll('.tour-rail button,.showcase-header button')].map(button => { const box = button.getBoundingClientRect(); return { text: button.textContent, x: box.x, right: box.right, width: box.width } }) })))
      expect(await snapshot(page)).toEqual(before)
      if (step < 7) await page.getByRole('button', { name: 'Next', exact: true }).click()
    }
    await page.getByRole('button', { name: 'Restart', exact: true }).click()
    await expect(page.getByText('Chapter 1 of 7', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Skip chapter', exact: true }).click()
    await expect(page.getByText('Chapter 2 of 7', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await expect(page.getByText('Chapter 1 of 7', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Exit demo', exact: true }).click()
    await expect(page).toHaveURL(/page=welcome/)
    expect(await snapshot(page)).toEqual(before)
    expect(denied.requests).toEqual([]); expect(denied.errors).toEqual([])
    writeFileSync(`docs/ipi-evidence/bounds-${viewport.width}.json`, JSON.stringify(bounds, null, 2))
    await context.close()
  })
}
test('keyboard controls, reduced motion, browser back and refresh at every chapter', async ({ page }) => {
  const denied = await isolate(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (let step = 1; step <= 7; step++) {
    await page.goto(`${app}?page=demo&tour=quality&step=${step}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await page.reload()
    await expect(page.getByText(`Chapter ${step} of 7`, { exact: true })).toBeVisible()
    expect(await page.locator('.demo-content').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  }
  await page.getByRole('button', { name: 'Restart', exact: true }).focus(); await page.keyboard.press('Enter')
  for (let step = 1; step < 7; step++) {
    const next = page.getByRole('button', { name: 'Next', exact: true }); await next.focus(); await page.keyboard.press('Enter')
    await expect(page.getByText(`Chapter ${step + 1} of 7`, { exact: true })).toBeVisible()
  }
  await page.goBack(); await expect(page.getByText('Chapter 6 of 7', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Back', exact: true }).focus(); await page.keyboard.press('Enter')
  await expect(page.getByText('Chapter 5 of 7', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Skip chapter', exact: true }).focus(); await page.keyboard.press('Enter')
  await expect(page.getByText('Chapter 6 of 7', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Exit demo', exact: true }).focus(); await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/page=welcome/)
  expect(denied.requests).toEqual([]); expect(denied.errors).toEqual([])
})
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
  for (let step = 1; step < 7; step++) await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Exit demo', exact: true }).click()
  expect(await snapshot(page)).toEqual(before)
  expect(denied.requests).toEqual([]); expect(denied.errors).toEqual([])
  writeFileSync('docs/ipi-evidence/isolation.json', JSON.stringify({ forbiddenRequests: denied.requests, unchangedStorage: true, indexedDBUnchanged: true, sessionFixture: 'OAuth fixture established before demo; not live-provider authentication proof', pageErrors: denied.errors }, null, 2))
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
  writeFileSync('docs/ipi-evidence/contrast.json', JSON.stringify(ratios, null, 2))
})
