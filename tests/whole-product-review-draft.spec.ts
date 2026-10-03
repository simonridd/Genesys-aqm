import {test,expect} from '@playwright/test'
import {fixture,capture} from './whole-product-review-fixture'
import {writeFileSync} from 'node:fs'
test('review draft when visiting original conversation evidence',async({page})=>{
 const f=await fixture(page,'REVIEWER','attention','evaluations');const dialogs:string[]=[];page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss()});try{
  await capture(page,'review-draft-queue');await page.getByRole('button',{name:'Open evaluation escalated',exact:true}).click();const panel=page.getByRole('region',{name:'Human review',exact:true});await panel.getByRole('button',{name:'Start review',exact:true}).click();await panel.getByLabel('Human answer: Warm opening',{exact:true}).selectOption('No');await panel.getByLabel('Overall review note',{exact:true}).fill('Unsaved independent review note');await capture(page,'review-unsaved-before-evidence');
  await page.locator('.evaluation-detail').getByRole('button',{name:'Open conversation',exact:true}).click();await expect(page.getByText('I need help with my bill.',{exact:true})).toBeVisible();await page.getByRole('button',{name:'← Back to evaluations',exact:true}).click();await capture(page,'review-unsaved-after-evidence-queue');await page.getByRole('button',{name:'Open evaluation escalated',exact:true}).click();await capture(page,'review-unsaved-after-reopen');const note=await panel.getByLabel('Overall review note',{exact:true}).inputValue(),answer=await panel.getByLabel('Human answer: Warm opening',{exact:true}).inputValue();
  const result={dialogs,noteAfter:note,answerAfter:answer,expectedNote:'Unsaved independent review note',expectedAnswer:'No',lost:note!== 'Unsaved independent review note'||answer!=='No'};writeFileSync('docs/v019-whole-product-review-evidence/reviewer-draft-navigation.json',JSON.stringify(result,null,2));
  // This review characterizes the current behavior; it must not disguise loss as a passed protection regression.
  expect(dialogs).toEqual([]);expect(result.lost).toBe(true)
 }finally{await f.close()}
})
