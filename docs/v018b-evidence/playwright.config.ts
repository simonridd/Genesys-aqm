import { defineConfig } from '@playwright/test'
export default defineConfig({
 testDir:'../../tests',testMatch:'investigation-links.spec.ts',workers:1,use:{headless:true},
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4176',url:'http://127.0.0.1:4176/Genesys-aqm/',reuseExistingServer:true},
})
