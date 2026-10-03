import { defineConfig } from '@playwright/test'
const external=process.env.AQM_BROWSER_URL
process.env.AQM_BROWSER_URL=external??'http://127.0.0.1:4176/Genesys-aqm/'
export default defineConfig({testDir:'../../tests',workers:1,use:{headless:true},webServer:external?undefined:{command:'npm run preview -- --host 127.0.0.1 --port 4176',url:'http://127.0.0.1:4176/Genesys-aqm/',reuseExistingServer:true}})
