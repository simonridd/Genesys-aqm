import { type Page } from '@playwright/test'
export async function navigateWorkspace(page:Page,name:string){
 const item=page.getByRole('navigation',{name:'Primary navigation'}).locator('button').filter({has:page.getByText(name,{exact:true})})
 const group=item.locator('xpath=ancestor::details')
 if(await group.count()&&await group.getAttribute('open')===null)await group.locator('summary').click()
 await item.click()
}
export async function chooseView(page:Page,label:string){
 await page.locator('.responsive-view-switcher').waitFor({state:'visible'})
 const mobile=page.getByRole('combobox',{name:'View',exact:true})
 if((page.viewportSize()?.width??1280)<=650)await mobile.selectOption({label})
 else await page.locator('.analytics-tabs').getByRole('button',{name:label,exact:true}).click()
}
export async function selectedView(page:Page){
 const mobile=page.getByRole('combobox',{name:'View',exact:true})
 return (page.viewportSize()?.width??1280)<=650?mobile.locator('option:checked').innerText():page.locator('.analytics-tabs button[aria-pressed=true]').innerText()
}
