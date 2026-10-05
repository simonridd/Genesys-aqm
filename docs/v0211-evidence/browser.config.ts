import { defineConfig } from '@playwright/test'
export default defineConfig({
 testDir: '../../tests', workers: 1, timeout: 90000,
 use: { headless: true },
 reporter: [['list'], ['json', { outputFile: process.env.AQM_BROWSER_REPORT ?? 'local-browser.json' }]],
})
