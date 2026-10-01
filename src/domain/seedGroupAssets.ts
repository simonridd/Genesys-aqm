import { seedForms } from './forms'
import type { QuestionGroupAsset } from './types'
/** Separate starter templates; these never modify their source published forms. */
export const seedGroupAssets: QuestionGroupAsset[] = [
  {id:'identity_security',name:'Identity & Security Verification',form:'compliance_identity',ids:['identity_before_disclosure','verification_appropriate','failed_check_safe']},
  {id:'customer_empathy',name:'Customer Experience / Empathy',form:'general_service',ids:['understanding','empathy','professionalism']},
  {id:'resolution_next_steps',name:'Resolution & Next Steps',form:'general_service',ids:['resolution','next_steps','ownership']},
  {id:'call_closing',name:'Call Closing',form:'general_service',ids:['closing','greeting']},
].map(seed=>({id:seed.id,familyId:seed.id,name:seed.name,description:'Starter template derived from existing AQM form questions.',version:1,status:'PUBLISHED',createdAt:'2026-10-01T00:00:00.000Z',updatedAt:'2026-10-01T00:00:00.000Z',publishedAt:'2026-10-01T00:00:00.000Z',questions:structuredClone(seedForms.find(f=>f.id===seed.form)!.questions.filter(q=>seed.ids.includes(q.id)))}))
