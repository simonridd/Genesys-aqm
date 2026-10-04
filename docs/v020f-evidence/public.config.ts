import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'../../tests',testMatch:'user-language.spec.ts',workers:1,use:{headless:true},timeout:90000,reporter:[['line'],['json',{outputFile:'docs/v020f-evidence/public-browser.json'}]]})
