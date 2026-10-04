import {fileURLToPath} from 'node:url'
import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'.',testMatch:'fresh-journeys.spec.ts',workers:1,retries:0,timeout:45000,use:{headless:true},outputDir:'/private/tmp/aqm-v020-fresh-test-results',reporter:[['line'],['json',{outputFile:fileURLToPath(new URL('./fresh-browser-report.json',import.meta.url))}]]})
