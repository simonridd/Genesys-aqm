import { test,expect } from '@playwright/test'
const app=process.env.AQM_BROWSER_URL??'http://127.0.0.1:4178/Genesys-aqm/'
test('review cards and table share search, rank, pagination and resize state',async({page})=>{
 await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(app).origin?route.continue():route.abort())
 await page.setViewportSize({width:1440,height:900});await page.goto(app)
 await page.evaluate(async()=>{
  const react=await import('/Genesys-aqm/node_modules/.vite/deps/react.js' as string),rootModule=await import('/Genesys-aqm/node_modules/.vite/deps/react-dom_client.js' as string),{OperationalTable}=await import('/Genesys-aqm/src/OperationalTable.tsx' as string)
  const React=react.default??react,createRoot=rootModule.createRoot??rootModule.default.createRoot,el=React.createElement,host=document.createElement('div');document.body.replaceChildren(host)
  const rows=[{id:'escalated',name:'Priority'},{id:'overdue',name:'Overdue'},{id:'soon',name:'Soon'},{id:'later',name:'Later'},{id:'last',name:'Last'}]
  createRoot(host).render(el(OperationalTable,{rows,pageSize:2,stateKey:'evaluations',preserveOrder:true,keyOf:(r:any)=>r.id,columns:[{key:'name',label:'Task',value:(r:any)=>r.name}],renderCard:(r:any)=>el('article',{'data-id':r.id},el('h2',{},r.name),el('button',{},'Continue review'))}))
 })
 const rows=()=>page.locator('tbody tr').allTextContents(),cards=()=>page.locator('.review-task-cards article h2').allTextContents()
 await expect.poll(rows).toEqual(['Priority','Overdue']);expect(await cards()).toEqual(await rows())
 await page.getByRole('button',{name:'Next →',exact:true}).click();await expect.poll(rows).toEqual(['Soon','Later']);expect(await cards()).toEqual(await rows())
 expect(new URL(page.url()).searchParams.get('evaluations.page')).toBe('2')
 await page.setViewportSize({width:390,height:844});await expect(page.getByRole('list',{name:'My review tasks'})).toBeVisible();await expect(page.locator('.table-scroll')).toBeHidden()
 expect(await cards()).toEqual(['Soon','Later']);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.getByLabel('Search table',{exact:true}).fill('last');await expect.poll(cards).toEqual(['Last']);expect(await rows()).toEqual(['Last'])
 expect(new URL(page.url()).searchParams.has('evaluations.page')).toBe(false)
 await page.setViewportSize({width:1440,height:900});await expect(page.locator('.table-scroll')).toBeVisible();await expect(page.getByRole('list',{name:'My review tasks'})).toBeHidden();expect(await rows()).toEqual(['Last'])
})
