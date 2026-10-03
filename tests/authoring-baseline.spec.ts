import { test } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { fixture } from './authoringSimplificationFixture'
test.skip(!process.env.AQM_CAPTURE_BASELINE,'Run only against canonical source before edits.');
test('canonical one-question mobile baseline', async({page})=>{
 await page.setViewportSize({width:390,height:844});const state=await fixture(page,'AUTHOR');try{
 await page.getByRole('navigation').getByRole('button',{name:'Evaluation Forms',exact:true}).click();await page.getByRole('button',{name:'Open form Fixture choice form v1'}).click();
 writeFileSync('docs/v019b-evidence/mobile-before.json', JSON.stringify(await page.evaluate(()=>({pageHeight:document.documentElement.scrollHeight,questionHeight:document.querySelector('.question-card')!.getBoundingClientRect().height,viewport:{width:innerWidth,height:innerHeight}})),null,2));
 await page.screenshot({path:'docs/v019b-evidence/form-before-390.png',fullPage:true});
 await page.locator('.question-card').getByRole('button',{name:'Edit',exact:true}).click();writeFileSync('docs/v019b-evidence/mobile-expanded-before.json',JSON.stringify(await page.evaluate(()=>({pageHeight:document.documentElement.scrollHeight,questionHeight:document.querySelector('.question-card')!.getBoundingClientRect().height})),null,2));await page.screenshot({path:'docs/v019b-evidence/form-expanded-before-390.png',fullPage:true});
 }finally{await state.close()}
})
