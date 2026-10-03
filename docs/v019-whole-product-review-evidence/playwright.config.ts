import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'
export default defineConfig({
 testDir:'../../tests',workers:1,timeout:30000,
 outputDir:'./test-artifacts',
 reporter:[['line'],['json',{outputFile:fileURLToPath(new URL('./browser-results.json',import.meta.url))}]],
 use:{headless:true,serviceWorkers:'block',launchOptions:{
  executablePath:process.env.CHROMIUM_PATH || '/Users/simonridd/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost'],
 }},
})
