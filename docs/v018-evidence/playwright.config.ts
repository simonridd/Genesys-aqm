import {defineConfig} from '@playwright/test';export default defineConfig({testDir:'.',testMatch:'capture.spec.ts',workers:1,use:{headless:true},reporter:'list'})
