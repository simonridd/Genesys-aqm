import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'../../tests',testMatch:['overview-first-scan.spec.ts','overview-geometry.spec.ts','quality-actionability.spec.ts','investigation-history.spec.ts'],workers:1,use:{headless:true},timeout:60000,reporter:[['line'],['json',{outputFile:'regression-browser.json'}]]})
