import {resolve} from 'node:path'
import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'../../tests',testMatch:['evaluation-availability.spec.ts','investigation-history.spec.ts','calibration-discovery.spec.ts','user-language.spec.ts','reviewer-focus.spec.ts','showcase-continuity.spec.ts'],workers:1,timeout:60000,use:{headless:true},reporter:[['line'],['json',{outputFile:resolve(process.cwd(),'docs/v021b-evidence/regressions.json')}]]})
