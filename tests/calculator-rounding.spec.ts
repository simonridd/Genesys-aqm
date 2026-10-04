import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
const app = process.env.AQM_BROWSER_URL ?? 'http://127.0.0.1:4188/Genesys-aqm/'
const baseline = process.env.AQM_ROUNDING_BASELINE === '1'
const publicProof = process.env.AQM_ROUNDING_PUBLIC === '1'
const root = `docs/v020h-evidence/${baseline ? 'before' : publicProof ? 'public' : 'after'}`
const cases = [
  { name: 'default', volume: 100000, percentage: 50, forms: 1, requests: 1, tokens: 8000, selected: 50000, evaluations: 50000, ai: 50000, millions: 400, cost: '$16.80/month' },
  { name: 'tiny', volume: 1, percentage: 1, forms: 1, requests: 1, tokens: 1, selected: 0, evaluations: 0, ai: 0, millions: 0, cost: '$0.00/month' },
  { name: 'three', volume: 3, percentage: 50, forms: 1, requests: 1, tokens: 1, selected: 1, evaluations: 1, ai: 1, millions: .000001, cost: 'Less than $0.01/month' },
  { name: 'whole', volume: 100, percentage: 10, forms: 1, requests: 1, tokens: 8000, selected: 10, evaluations: 10, ai: 10, millions: .08, cost: 'Less than $0.01/month' },
  { name: 'zero-percentage', volume: 100, percentage: 0, forms: 1, requests: 1, tokens: 8000, selected: 0, evaluations: 0, ai: 0, millions: 0, cost: '$0.00/month' },
  { name: 'zero-volume', volume: 0, percentage: 50, forms: 1, requests: 1, tokens: 8000, selected: 0, evaluations: 0, ai: 0, millions: 0, cost: '$0.00/month' },
  { name: 'subcent', volume: 1, percentage: 100, forms: 1, requests: 1, tokens: 1, selected: 1, evaluations: 1, ai: 1, millions: .000001, cost: 'Less than $0.01/month' },
  { name: 'fractional', volume: 1, percentage: 100, forms: 1.5, requests: 2.5, tokens: 8000, selected: 1, evaluations: 1.5, ai: 3.75, millions: .03, cost: 'Less than $0.01/month' },
]
const labels = ['Conversations per month', 'Selected percentage', 'Average forms per selected conversation', 'Average AI requests per form', 'Average input tokens per AI request']
async function isolate(page: Page) {
  const denied: string[] = [], errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin === new URL(app).origin && route.request().method() === 'GET' && !url.pathname.includes('/api/')) return route.continue()
    denied.push(`${route.request().method()} ${url.origin}${url.pathname}`); return route.abort()
  })
  return { denied, errors }
}
async function capture(page: Page, name: string) {
  mkdirSync(root, { recursive: true })
  const section = page.locator('#economics'), result = page.locator('.cost-result')
  await section.screenshot({ path: `${root}/${name}.png` })
  await result.screenshot({ path: `${root}/${name}-result.png` })
  await result.evaluate(n => window.scrollTo(0, window.scrollY + n.getBoundingClientRect().top - 20))
  await page.screenshot({ path: `${root}/${name}-viewport.png` })
  writeFileSync(`${root}/${name}.txt`, await section.innerText())
  writeFileSync(`${root}/${name}.aria.yml`, await section.ariaSnapshot())
  const data = { inputs: await section.locator('input').evaluateAll(nodes => nodes.map(n => ({ label: n.getAttribute('aria-label'), value: (n as HTMLInputElement).value }))), cost: await result.locator(':scope > strong').innerText(), metrics: await result.locator('p').first().innerText(), explanation: await result.innerText(), geometry: await result.boundingBox(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) }
  writeFileSync(`${root}/${name}.json`, JSON.stringify(data, null, 2))
  return data
}
const sizes = publicProof ? [{ width:1440,height:900 },{ width:390,height:844 }] : [{ width:1440,height:900 },{ width:1920,height:1080 },{ width:390,height:844 },{ width:1440,height:720 }]
for (const viewport of sizes) test(`calculator scenario matrix ${viewport.width}x${viewport.height}`, async ({ browser }) => {
  const context = await browser.newContext({ viewport }), page = await context.newPage(), traffic = await isolate(page)
  await page.goto(`${app}?page=welcome`)
  const result = page.locator('.cost-result')
  await expect(result.locator(':scope > strong')).toHaveText('$16.80/month')
  if (!baseline) await expect(result).toContainText('Selected conversations are rounded down to whole conversations each month.')
  await expect(page.locator('#economics details')).not.toHaveAttribute('open')
  await capture(page, `default-closed-${viewport.width}x${viewport.height}`)
  await page.getByText('Advanced assumptions', { exact: true }).click()
  for (const scenario of cases.filter(c => baseline ? ['default','tiny'].includes(c.name) : publicProof ? ['default','tiny','subcent'].includes(c.name) : true)) {
    for (const [index, key] of ['volume','percentage','forms','requests','tokens'].entries()) await page.getByLabel(labels[index], { exact:true }).fill(String(scenario[key as 'volume']))
    await expect(result.locator(':scope > strong')).toHaveText(scenario.cost)
    const format = (n:number) => n.toLocaleString('en-US',{ maximumFractionDigits:2 })
    await expect(result.locator('p').first()).toHaveText(`${format(scenario.selected)} conversations/month selected · ${format(scenario.evaluations)} form evaluations · ${format(scenario.ai)} AI requests · ${format(scenario.millions)}M input tokens/month.`)
    if (!baseline) {
      await expect(result).toContainText('Selected conversations are rounded down to whole conversations each month.')
      await expect(result).toContainText('Average forms and requests may be fractional planning equivalents.')
      if (scenario.name === 'tiny') {
        await expect(result).toContainText('Before whole-conversation rounding: 0.01 conversations/month.')
        await expect(result).toContainText('Less than one conversation in this monthly planning period, so this scenario selects 0 and has no model input cost.')
        await expect(result).not.toContainText('The estimate is positive')
      } else await expect(result).not.toContainText('Less than one conversation in this monthly planning period')
      if (scenario.cost.startsWith('Less')) await expect(result).toContainText('The estimate is positive:')
    } else await expect(result).not.toContainText('whole conversations')
    expect((await capture(page, `${scenario.name}-${viewport.width}x${viewport.height}`)).overflow).toBe(false)
    if (!baseline && scenario.name === 'tiny') {
      await page.locator('#economics summary').click()
      await expect(result).toContainText('Before whole-conversation rounding: 0.01 conversations/month.')
      await capture(page, `tiny-closed-${viewport.width}x${viewport.height}`)
      await page.locator('#economics summary').click()
    }
  }
  expect(traffic).toEqual({ denied:[], errors:[] })
  await context.close()
})
if (!baseline && !publicProof) test('keyboard and resize preserve tiny scenario and focus', async ({ page }) => {
  const traffic = await isolate(page)
  await page.setViewportSize({ width:1440,height:900 }); await page.goto(`${app}?page=welcome`)
  // Reach the first calculator field solely by Tab from the document.
  for (let i=0;i<40 && !(await page.getByLabel(labels[0],{exact:true}).evaluate(n=>n===document.activeElement));i++) await page.keyboard.press('Tab')
  await expect(page.getByLabel(labels[0],{exact:true})).toBeFocused()
  await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('1')
  await page.keyboard.press('Tab'); await expect(page.getByLabel(labels[1],{exact:true})).toBeFocused()
  await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('1')
  await expect(page.getByLabel(labels[1],{exact:true})).toBeFocused()
  await page.keyboard.press('Tab'); await expect(page.locator('#economics summary')).toBeFocused(); await page.keyboard.press('Enter')
  for (const value of ['1.5','2.5','1']) { await page.keyboard.press('Tab'); await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type(value) }
  await expect(page.getByLabel(labels[4],{exact:true})).toBeFocused()
  const original = await page.locator('#economics input').evaluateAll(nodes=>nodes.map(n=>(n as HTMLInputElement).value))
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:width===390?844:900})
    expect(await page.locator('#economics input').evaluateAll(nodes=>nodes.map(n=>(n as HTMLInputElement).value))).toEqual(original)
    await expect(page.locator('.cost-result')).toContainText('Before whole-conversation rounding: 0.01 conversations/month.')
    await expect(page.locator('.cost-result > strong')).toHaveText('$0.00/month')
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
  }
  await page.keyboard.press('Tab'); await expect(page.getByRole('link',{name:'Official Jev 1.13 pricing'})).toBeFocused()
  await expect(page.locator('.cost-result')).toHaveAttribute('aria-live','polite')
  await capture(page,'keyboard-resize')
  expect(traffic).toEqual({denied:[],errors:[]})
})
