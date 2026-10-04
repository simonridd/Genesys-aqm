import {resolve} from 'node:path'
import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'../../tests',testMatch:['investigation-result-focus.spec.ts'],workers:1,timeout:60000,use:{headless:true},reporter:[['line'],['json',{outputFile:resolve(process.cwd(),process.env.AQM_FOCUS_REPORT??'docs/v021b-evidence/browser.json')}]]})
