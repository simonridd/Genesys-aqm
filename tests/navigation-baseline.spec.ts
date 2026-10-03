import {test} from '@playwright/test'
import {fixture,draft} from './authoringSimplificationFixture'
import {navigateWorkspace} from './workspace-navigation'
import {roles} from '../src/domain/governance'
import {writeFileSync,mkdirSync} from 'node:fs'
test('canonical mobile navigation before',async({page})=>{
 test.skip(!process.env.AQM_NAV_BASELINE,'Baseline capture runs against canonical build only')
 mkdirSync('docs/v019d-evidence',{recursive:true});await page.setViewportSize({width:390,height:844});const observations=[]
 for(const role of roles){const state=await fixture(page,role,[],[draft()],[],role==='AUTHOR'?'forms':'automation');try{
 observations.push(await page.evaluate(role=>{const n=document.querySelector('[aria-label="Primary navigation"]')!,s=document.querySelector('.sidebar')!;return {role,viewport:{width:innerWidth,height:innerHeight},visibleDestinationCount:n.querySelectorAll('button').length,navHeight:n.getBoundingClientRect().height,sidebarHeight:s.getBoundingClientRect().height,collapsedSecondaryGroups:0,documentWidth:document.documentElement.scrollWidth,bodyWidth:innerWidth,navScrollWidth:n.scrollWidth,navClientWidth:n.clientWidth,fullyVisibleStripDestinations:[...n.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect(),nr=n.getBoundingClientRect();return r.x>=nr.x&&r.right<=nr.right}).map(e=>e.textContent?.trim())}},role));await page.screenshot({path:`docs/v019d-evidence/before-${role.toLowerCase()}-390.png`})
 }finally{await state.close()}}
 writeFileSync('docs/v019d-evidence/mobile-before.json',JSON.stringify(observations,null,2));const state=await fixture(page,'ADMIN',[],[draft()],[],'analytics');try{const metrics=[];for(const name of ['Analytics','Calibration']){await navigateWorkspace(page,name);await page.locator('.analytics-tabs').waitFor();metrics.push(await page.locator('.analytics-tabs').evaluate((el,name)=>({page:name,width:el.getBoundingClientRect().width,scrollWidth:el.scrollWidth,documentWidth:document.documentElement.scrollWidth,buttons:[...el.querySelectorAll('button')].map(e=>({label:e.textContent,bounds:{x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right}}))}),name));await page.screenshot({path:`docs/v019d-evidence/before-${name.toLowerCase()}-390.png`})}writeFileSync('docs/v019d-evidence/views-before.json',JSON.stringify(metrics,null,2))}finally{await state.close()}
})
