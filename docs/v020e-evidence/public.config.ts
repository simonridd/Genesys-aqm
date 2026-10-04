import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'.',testMatch:'public-overview.spec.ts',workers:1,retries:0,outputDir:'/private/tmp/aqm-v020e-public-results',reporter:[['list'],['json',{outputFile:'public-browser.json'}]],use:{headless:true,serviceWorkers:'block'}})
