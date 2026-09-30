import { defineConfig } from '@playwright/test'
export default defineConfig({testDir:'./tests',workers:1,use:{headless:true},webServer:{command:'npm run dev -- --host 127.0.0.1 --port 4174',url:'http://127.0.0.1:4174/Genesys-aqm/',reuseExistingServer:true,env:{VITE_AQM_API_ORIGIN:'https://aqm-api-bd54ukouga-nw.a.run.app'}}})
