import { defineConfig } from '@playwright/test'
import { resolve } from 'node:path'
const external=process.env.AQM_BROWSER_URL
process.env.AQM_BROWSER_URL=external??'http://127.0.0.1:4174/Genesys-aqm/'
export default defineConfig({
  testDir:'.',testMatch:'canonical-reproduction.spec.ts',workers:1,outputDir:'../../test-results',
  reporter:[['line'],['json',{outputFile:resolve(process.cwd(),process.env.AQM_BROWSER_REPORT??'docs/v020c-evidence/baseline-results.json')}]],
  use:{headless:true,serviceWorkers:'block',launchOptions:{args:[`--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost, EXCLUDE ${new URL(process.env.AQM_BROWSER_URL).hostname}`]}},
  webServer:external?undefined:{command:'npm run preview -- --host 127.0.0.1 --port 4174',url:'http://127.0.0.1:4174/Genesys-aqm/',reuseExistingServer:false},
})
