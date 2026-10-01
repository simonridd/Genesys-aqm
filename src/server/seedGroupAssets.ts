/** Explicit, provider-free V0.8 seed operation. Only questionGroupAssets may be written. */
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { seedGroupAssets } from '../domain/seedGroupAssets'
import { FirestoreStore, type Store } from './store'

export async function seedReusableGroups(store:Pick<Store,'groupAsset'|'putGroupAsset'>,apply=false){
  const outcomes:Array<{id:string;status:'exists'|'created'|'would-create'}>=[]
  for(const seed of seedGroupAssets){
    const prior=await store.groupAsset(seed.id)
    if(prior){outcomes.push({id:seed.id,status:'exists'});continue}
    if(apply)await store.putGroupAsset(seed)
    outcomes.push({id:seed.id,status:apply?'created':'would-create'})
  }
  return outcomes
}
async function main(){
  if(process.argv.some(arg=>arg.startsWith('--')&&arg!=='--apply'))throw Error('Use --apply only; the existing application-default/runtime identity supplies credentials.')
  initializeApp({projectId:'genesys-aqm-2026'})
  console.log(JSON.stringify({groupAssets:await seedReusableGroups(new FirestoreStore(getFirestore()),process.argv.includes('--apply')),providerRequests:0}))
}
if(process.argv[1]?.endsWith('/seedGroupAssets.mjs'))void main().catch(error=>{console.error(error instanceof Error?error.message:'Asset seed failed.');process.exitCode=1})
