import {resolve} from 'node:path'
import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'../../tests',testMatch:process.env.AQM_CONTINUITY_SMOKE==='1'?['showcase.spec.ts','investigation-history.spec.ts']:['showcase-continuity.spec.ts'],workers:1,use:{headless:true},timeout:60000,reporter:[['line'],['json',{outputFile:resolve(process.cwd(),process.env.AQM_CONTINUITY_REPORT??'docs/v021a-evidence/browser.json')}]]})
