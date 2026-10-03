import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: '../../tests', workers: 1, use: { headless: true }, webServer: process.env.AQM_BROWSER_URL ? undefined : { command: 'npm run preview -- --host 127.0.0.1 --port 4174', url: 'http://127.0.0.1:4174/Genesys-aqm/', reuseExistingServer: true } })
