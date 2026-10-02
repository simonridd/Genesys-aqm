import { test,expect } from '@playwright/test'
import { app,keyboardTo } from './usability-fixture'
test('real identity controls, nested event counts, pointer opening and header sort semantics',async({page})=>{
 await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(app).origin?r.continue():r.abort())
 await page.goto(app)
 await page.evaluate(async()=>{
  const reactModule=await import('/Genesys-aqm/node_modules/.vite/deps/react.js' as string),rootModule=await import('/Genesys-aqm/node_modules/.vite/deps/react-dom_client.js' as string),{OperationalTable}=await import('/Genesys-aqm/src/OperationalTable.tsx' as string)
  const React=reactModule.default??reactModule,createRoot=rootModule.createRoot??rootModule.default.createRoot
  const el=React.createElement,host=document.createElement('div');document.body.replaceChildren(host)
  const counts={open:0,check:0,edit:0,link:0};(window as any).counts=counts
  createRoot(host).render(el(OperationalTable,{rows:[{id:'a',name:'Alpha',score:1},{id:'b',name:'Beta',score:2}],keyOf:(r:any)=>r.id,onSelect:()=>counts.open++,tableLabel:'Fixture forms table',selectionControl:{columnKey:'name',label:(r:any)=>`Open form ${r.name}`},columns:[{key:'name',label:'Form',value:(r:any)=>r.name},{key:'score',label:'Score',value:(r:any)=>r.score},{key:'check',label:'Selection',value:()=>'',render:(r:any)=>el('input',{type:'checkbox','aria-label':`Select ${r.name}`,onChange:()=>counts.check++})},{key:'edit',label:'Action',value:()=>'',render:(r:any)=>el('button',{onClick:()=>counts.edit++},`Edit ${r.name}`)},{key:'link',label:'Link',value:()=>'',render:(r:any)=>el('a',{href:'#fixture',onClick:()=>counts.link++},`Link ${r.name}`)}]}))
 })
 const identity=page.getByRole('button',{name:'Open form Alpha',exact:true}),counts=()=>page.evaluate(()=>(window as any).counts)
 await keyboardTo(page,identity);await expect(identity).toBeFocused();expect(await identity.evaluate(e=>getComputedStyle(e).outlineStyle)).not.toBe('none')
 await page.keyboard.press('Enter');expect(await counts()).toEqual({open:1,check:0,edit:0,link:0})
 await page.keyboard.press('Space');expect((await counts()).open).toBe(2)
 await page.getByRole('cell',{name:'1',exact:true}).click();expect((await counts()).open).toBe(3)
 await page.getByLabel('Select Alpha',{exact:true}).check();await page.getByRole('button',{name:'Edit Alpha',exact:true}).click();expect(await counts()).toEqual({open:3,check:1,edit:1,link:0})
 await page.getByRole('link',{name:'Link Alpha',exact:true}).click();expect(await counts()).toEqual({open:3,check:1,edit:1,link:1})
 await identity.click();expect((await counts()).open).toBe(4)
 const header=page.getByRole('columnheader',{name:/^Form/});await expect(header).toHaveAttribute('aria-sort','descending')
 await keyboardTo(page,header.getByRole('button'));await page.keyboard.press('Enter');await expect(header).toHaveAttribute('aria-sort','ascending')
 await page.keyboard.press('Space');await expect(header).toHaveAttribute('aria-sort','descending')
 const score=page.getByRole('columnheader',{name:/^Score/});await keyboardTo(page,score.getByRole('button'));await page.keyboard.press('Enter');await expect(score).toHaveAttribute('aria-sort','ascending');await expect(header).not.toHaveAttribute('aria-sort',/ascending|descending/)
 expect((await counts()).open).toBe(4)
 await expect(page.locator('button[aria-sort]')).toHaveCount(0)
 const region=page.getByRole('region',{name:'Fixture forms table'});await keyboardTo(page,region);await expect(region).toBeFocused()
})
