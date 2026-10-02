import {defineConfig} from '@playwright/test'
export default defineConfig({testDir:'../../tests',testMatch:'usability.spec.ts',workers:1,use:{headless:true}})
