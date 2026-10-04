import {test,expect} from '@playwright/test'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {firstScanFixture} from './overviewFirstScanFixture'
const phase=process.env.AQM_SCAN_PHASE??'after',out=process.env.AQM_SCAN_EVIDENCE??`docs/v020e-evidence/${phase}`
mkdirSync(out,{recursive:true})
for(const size of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844},{width:1440,height:720}])test(`geometry ${size.width}x${size.height}`,async({page})=>{
 await page.setViewportSize(size);const f=await firstScanFixture(page)
 await page.evaluate(()=>scrollTo(0,0))
 const geometry=await page.evaluate(()=>{
 const h1=document.querySelector('.overview-page h1')!.getBoundingClientRect()
 const headings=[...document.querySelectorAll('.overview-page h2,.overview-page h3')].map(el=>({text:el.textContent,...Object.fromEntries(['x','y','width','height','bottom'].map(k=>[k,el.getBoundingClientRect()[k as keyof DOMRect]]))}))
 const panels=[...document.querySelectorAll('.overview-page section[aria-label],.overview-page section[aria-labelledby],.overview-first-scan article')].map(el=>({name:el.getAttribute('aria-label')??document.getElementById(el.getAttribute('aria-labelledby')??'')?.textContent,...Object.fromEntries(['x','y','width','height','bottom'].map(k=>[k,el.getBoundingClientRect()[k as keyof DOMRect]]))}))
 const signals=[...document.querySelectorAll('.overview-summary-card')].map(card=>{const el=card.querySelector('.overview-metric strong,.overview-metric button')!;return {name:card.getAttribute('aria-label'),text:el.textContent,...Object.fromEntries(['x','y','width','height','bottom'].map(k=>[k,el.getBoundingClientRect()[k as keyof DOMRect]]))}})
 return {signals,h1Top:h1.y,headings,panels,documentHeight:document.documentElement.scrollHeight,scrollY,viewport:{width:innerWidth,height:innerHeight},overflow:document.documentElement.scrollWidth>innerWidth}
 })
 writeFileSync(`${out}/${size.width}x${size.height}.json`,JSON.stringify({...geometry,requests:f.requests.reduce<Record<string,number>>((counts,u)=>({...counts,[u.pathname]:(counts[u.pathname]??0)+1}),{})},null,2))
 await page.screenshot({path:`${out}/${size.width}x${size.height}-initial.png`})
 await page.screenshot({path:`${out}/${size.width}x${size.height}-full.png`,fullPage:true})
 if(phase==='after'){
  const baseline=JSON.parse(readFileSync(`${process.env.AQM_SCAN_BASELINE??'docs/v020e-evidence/before'}/${size.width}x${size.height}.json`,'utf8'))
  const counts=f.requests.reduce<Record<string,number>>((counts,u)=>({...counts,[u.pathname]:(counts[u.pathname]??0)+1}),{})
  expect(counts).toEqual(baseline.requests)
  expect(geometry.panels.slice(0,7).map(p=>p.name)).toEqual(['Attention required','At a glance','Quality summary','Coverage summary','Review work summary','Automation health summary','Quality detail'])
  if(size.width===1440&&size.height===900)for(const signal of geometry.signals)expect(signal.bottom).toBeLessThan(900)
  if(size.width===1920)expect(geometry.panels.find(p=>p.name==='At a glance')!.bottom).toBeLessThanOrEqual(1080)
 }
 expect(geometry.overflow).toBe(false);expect(f.errors).toEqual([]);expect(f.writes).toEqual([]);expect(f.blocked).toEqual([])
})
