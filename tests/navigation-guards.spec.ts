import {test,expect} from '@playwright/test'
import {fixture,draft} from './authoringSimplificationFixture'
import {navigateWorkspace} from './workspace-navigation'
import {writeFileSync} from 'node:fs'
for(const route of ['forms','groups','answerSets','policies','settings'])test(`dirty ${route}: primary, secondary, utility and About keep guard`,async({page})=>{
 const state=await fixture(page,'ADMIN',[],[draft()],[],route)
 try{
  if(route==='forms'){await page.getByRole('button',{name:'Open form Fixture choice form v1'}).click();await page.locator('.form-detail').getByLabel('Form name',{exact:true}).fill('Unsaved form')}
  if(route==='groups'){await page.getByRole('button',{name:'New reusable question group',exact:true}).click();await page.getByLabel('Reusable question group name',{exact:true}).fill('Unsaved group')}
  if(route==='answerSets'){await page.getByRole('button',{name:'New Answer Set',exact:true}).click();await page.getByLabel('Answer Set name',{exact:true}).fill('Unsaved answers')}
  if(route==='policies'){await page.getByRole('button',{name:'＋ New policy',exact:true}).click();await page.getByLabel('Policy name',{exact:true}).fill('Unsaved policy')}
  if(route==='settings'){await page.getByRole('navigation',{name:'Settings sections'}).getByRole('button',{name:'Reviews',exact:true}).click();await page.getByLabel('Due soon hours',{exact:true}).fill('12')}
  const original=page.url(),dialogs:string[]=[];page.on('dialog',d=>{dialogs.push(d.message());void d.dismiss()})
  for(const label of ['Overview','Conversations',route==='settings'?'Evaluation Forms':'Settings','About / product tour']){
   await navigateWorkspace(page,label);await expect(page).toHaveURL(original)
  }
  expect(dialogs).toHaveLength(4);await page.evaluate(()=>{history.pushState(null,'','?page=analytics&analyticsTab=coverage');dispatchEvent(new PopStateEvent('popstate'))});await expect(page).toHaveURL(original);expect(dialogs).toHaveLength(5);expect(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});dispatchEvent(e);return e.defaultPrevented})).toBe(true)
  expect(state.requests.filter(r=>r.method!=='GET')).toEqual([]);expect(state.errors).toEqual([])
  writeFileSync(`docs/v019d-evidence/guards-${route}.json`,JSON.stringify({route,dialogs,protectedTargets:['primary Overview','secondary Conversations',route==='settings'?'secondary Evaluation Forms':'utility Settings','About / product tour','history navigation'],beforeUnloadPrevented:true,fictionalWrites:0},null,2))
 }finally{await state.close()}
})
