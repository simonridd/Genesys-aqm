import { test, expect } from '@playwright/test'
for(const viewport of [{width:1440,height:900},{width:1920,height:1080},{width:390,height:844}]){
  test(`automation degrades safely without backend at ${viewport.width}`,async({browser})=>{
    const page=await browser.newPage({viewport})
    await page.goto('http://127.0.0.1:4173/Genesys-aqm/')
    await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:/Automation/}).click()
    await expect(page.getByRole('heading',{name:'Automation service'})).toBeVisible()
    await expect(page.getByText('Server Jev key managed in Secret Manager')).toBeVisible()
    await expect(page.getByText('Not configured',{exact:true})).toBeVisible()
    const panel=page.getByRole('heading',{name:'Automation service'}).locator('xpath=../..')
    const box=await panel.boundingBox()
    await page.screenshot({path:`/private/tmp/aqm-automation-${viewport.width}.png`,fullPage:true})
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x+box!.width).toBeLessThanOrEqual(viewport.width+1)
    await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:/Evaluate/}).click()
    await expect(page.getByRole('button',{name:'Synthetic',exact:true})).toBeVisible()
    await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('button',{name:/Settings/}).click()
    await expect(page.getByRole('heading',{name:'Genesys Cloud'})).toBeVisible()
    await expect(page.getByRole('heading',{name:'Browser Jev evaluation key'})).toBeVisible()
    await page.close()
  })
}
