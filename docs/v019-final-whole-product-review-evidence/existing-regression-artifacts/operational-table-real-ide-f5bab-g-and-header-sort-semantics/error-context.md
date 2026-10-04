# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: operational-table.spec.ts >> real identity controls, nested event counts, pointer opening and header sort semantics
- Location: tests/operational-table.spec.ts:3:1

# Error details

```
Error: page.evaluate: TypeError: Failed to fetch dynamically imported module: http://127.0.0.1:4174/Genesys-aqm/node_modules/.vite/deps/react.js
```

# Page snapshot

```yaml
- status [ref=e3]: Loading IPI AQM…
```

# Test source

```ts
  1  | import { test,expect } from '@playwright/test'
  2  | import { app,keyboardTo } from './usability-fixture'
  3  | test('real identity controls, nested event counts, pointer opening and header sort semantics',async({page})=>{
  4  |  await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(app).origin?r.continue():r.abort())
  5  |  await page.goto(app)
> 6  |  await page.evaluate(async()=>{
     |             ^ Error: page.evaluate: TypeError: Failed to fetch dynamically imported module: http://127.0.0.1:4174/Genesys-aqm/node_modules/.vite/deps/react.js
  7  |   const reactModule=await import('/Genesys-aqm/node_modules/.vite/deps/react.js' as string),rootModule=await import('/Genesys-aqm/node_modules/.vite/deps/react-dom_client.js' as string),{OperationalTable}=await import('/Genesys-aqm/src/OperationalTable.tsx' as string)
  8  |   const React=reactModule.default??reactModule,createRoot=rootModule.createRoot??rootModule.default.createRoot
  9  |   const el=React.createElement,host=document.createElement('div');document.body.replaceChildren(host)
  10 |   const counts={open:0,check:0,edit:0,link:0};(window as any).counts=counts
  11 |   createRoot(host).render(el(OperationalTable,{rows:[{id:'a',name:'Alpha',score:1},{id:'b',name:'Beta',score:2}],keyOf:(r:any)=>r.id,onSelect:()=>counts.open++,tableLabel:'Fixture forms table',selectionControl:{columnKey:'name',label:(r:any)=>`Open form ${r.name}`},columns:[{key:'name',label:'Form',value:(r:any)=>r.name},{key:'score',label:'Score',value:(r:any)=>r.score},{key:'check',label:'Selection',value:()=>'',render:(r:any)=>el('input',{type:'checkbox','aria-label':`Select ${r.name}`,onChange:()=>counts.check++})},{key:'edit',label:'Action',value:()=>'',render:(r:any)=>el('button',{onClick:()=>counts.edit++},`Edit ${r.name}`)},{key:'link',label:'Link',value:()=>'',render:(r:any)=>el('a',{href:'#fixture',onClick:()=>counts.link++},`Link ${r.name}`)}]}))
  12 |  })
  13 |  const identity=page.getByRole('button',{name:'Open form Alpha',exact:true}),counts=()=>page.evaluate(()=>(window as any).counts)
  14 |  await keyboardTo(page,identity);await expect(identity).toBeFocused();expect(await identity.evaluate(e=>getComputedStyle(e).outlineStyle)).not.toBe('none')
  15 |  await page.keyboard.press('Enter');expect(await counts()).toEqual({open:1,check:0,edit:0,link:0})
  16 |  await page.keyboard.press('Space');expect((await counts()).open).toBe(2)
  17 |  await page.getByRole('cell',{name:'1',exact:true}).click();expect((await counts()).open).toBe(3)
  18 |  await page.getByLabel('Select Alpha',{exact:true}).check();await page.getByRole('button',{name:'Edit Alpha',exact:true}).click();expect(await counts()).toEqual({open:3,check:1,edit:1,link:0})
  19 |  await page.getByRole('link',{name:'Link Alpha',exact:true}).click();expect(await counts()).toEqual({open:3,check:1,edit:1,link:1})
  20 |  await identity.click();expect((await counts()).open).toBe(4)
  21 |  const header=page.getByRole('columnheader',{name:/^Form/});await expect(header).toHaveAttribute('aria-sort','descending')
  22 |  await keyboardTo(page,header.getByRole('button'));await page.keyboard.press('Enter');await expect(header).toHaveAttribute('aria-sort','ascending')
  23 |  await page.keyboard.press('Space');await expect(header).toHaveAttribute('aria-sort','descending')
  24 |  const score=page.getByRole('columnheader',{name:/^Score/});await keyboardTo(page,score.getByRole('button'));await page.keyboard.press('Enter');await expect(score).toHaveAttribute('aria-sort','ascending');await expect(header).not.toHaveAttribute('aria-sort',/ascending|descending/)
  25 |  expect((await counts()).open).toBe(4)
  26 |  await expect(page.locator('button[aria-sort]')).toHaveCount(0)
  27 |  const region=page.getByRole('region',{name:'Fixture forms table'});await keyboardTo(page,region);await expect(region).toBeFocused()
  28 | })
  29 | 
```