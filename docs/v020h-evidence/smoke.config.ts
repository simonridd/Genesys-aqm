import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'../../tests',testMatch:'showcase.spec.ts',workers:1,use:{headless:true},timeout:60000,reporter:[['line'],['json',{outputFile:'showcase-smoke.json'}]]})
