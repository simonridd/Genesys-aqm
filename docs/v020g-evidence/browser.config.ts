import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'../../tests',testMatch:'coverage-interpretation.spec.ts',workers:1,use:{headless:true},timeout:60000,reporter:[['line'],['json',{outputFile:process.env.AQM_COVERAGE_REPORT??'browser.json'}]]})
