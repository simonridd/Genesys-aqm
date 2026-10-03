import { defineConfig } from '@playwright/test'
export default defineConfig({
 testDir:'../../tests',testMatch:'showcase.spec.ts',workers:1,
 use:{headless:true,launchOptions:process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}},
 outputDir:'/private/tmp/aqm-showcase-test-results',reporter:[['list']],
})
