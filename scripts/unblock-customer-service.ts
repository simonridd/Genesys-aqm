/** Bounded, idempotent in-place lifecycle correction. Bundle with esbuild;
 * run without arguments to inspect, or --apply after deploying the correction.
 * Only status/enabled are patched, with a Firestore updateTime precondition.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'
import { productionReadinessErrors } from '../src/domain/formLifecycle'
import type { EvaluationForm } from '../src/domain/types'

const documentId='genesys_customer_service_ai_scoring'
const url=`https://firestore.googleapis.com/v1/projects/genesys-aqm-2026/databases/(default)/documents/evaluationForms/${documentId}`
type Value={stringValue?:string;integerValue?:string;doubleValue?:number;booleanValue?:boolean;nullValue?:null;timestampValue?:string;arrayValue?:{values?:Value[]};mapValue?:{fields?:Record<string,Value>}}
type Document={name:string;createTime:string;updateTime:string;fields:Record<string,Value>}
function decode(v:Value):unknown {
  if('stringValue' in v)return v.stringValue
  if('integerValue' in v)return Number(v.integerValue)
  if('doubleValue' in v)return v.doubleValue
  if('booleanValue' in v)return v.booleanValue
  if('timestampValue' in v)return v.timestampValue
  if('nullValue' in v)return null
  if('arrayValue' in v)return (v.arrayValue?.values??[]).map(decode)
  if('mapValue' in v)return Object.fromEntries(Object.entries(v.mapValue?.fields??{}).map(([k,x])=>[k,decode(x)]))
  throw Error('Unsupported Firestore field encoding; refusing mutation.')
}
const token=execFileSync('gcloud',['auth','print-access-token','--project=genesys-aqm-2026'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()
const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'}
async function read():Promise<Document>{const response=await fetch(url,{headers});if(!response.ok)throw Error(`Firestore read HTTP ${response.status}`);return response.json() as Promise<Document>}
const before=await read()
const form=Object.fromEntries(Object.entries(before.fields).map(([k,v])=>[k,decode(v)])) as unknown as EvaluationForm
if(form.id!==documentId||form.origin!=='genesys-recreated'||form.sourceFormId!=='e28b6669-c596-4ef0-babd-8d449caea7e6'||form.questions.length!==17)throw Error('Existing form identity/provenance/question count mismatch; refusing mutation.')
const errors=productionReadinessErrors(form)
if(errors.length)throw Error(`Ordinary form validation failed: ${errors.join(' ')}`)
const alreadyPublished=form.status==='PUBLISHED'&&form.enabled===true
if(process.argv.includes('--apply')&&!alreadyPublished){
  const target=new URL(url)
  target.searchParams.append('updateMask.fieldPaths','status');target.searchParams.append('updateMask.fieldPaths','enabled')
  target.searchParams.set('currentDocument.updateTime',before.updateTime)
  const response=await fetch(target,{method:'PATCH',headers,body:JSON.stringify({fields:{status:{stringValue:'PUBLISHED'},enabled:{booleanValue:true}}})})
  if(!response.ok)throw Error(`Firestore conditional patch HTTP ${response.status}`)
}
const after=await read()
const unchanged=(fields:Document['fields'])=>Object.fromEntries(Object.entries(fields).filter(([key])=>key!=='status'&&key!=='enabled'))
if(before.name!==after.name||before.createTime!==after.createTime||!isDeepStrictEqual(unchanged(before.fields),unchanged(after.fields)))throw Error('Post-update preservation verification failed.')
if(process.argv.includes('--apply')&&(after.fields.status?.stringValue!=='PUBLISHED'||after.fields.enabled?.booleanValue!==true))throw Error('Post-update lifecycle verification failed.')
writeFileSync('/private/tmp/aqm-v063-form-before.json',JSON.stringify(before,null,2))
writeFileSync('/private/tmp/aqm-v063-form-after.json',JSON.stringify(after,null,2))
writeFileSync('/private/tmp/aqm-v063-live-form.json',JSON.stringify(Object.fromEntries(Object.entries(after.fields).map(([k,v])=>[k,decode(v)])),null,2))
console.log(JSON.stringify({document:before.name,mode:process.argv.includes('--apply')?'apply':'inspect',noOp:alreadyPublished,version:form.version,name:form.name,questions:form.questions.length,ordinaryValidationErrors:errors,before:{status:form.status??null,enabled:form.enabled,updateTime:before.updateTime},after:{status:after.fields.status?.stringValue??null,enabled:after.fields.enabled?.booleanValue,updateTime:after.updateTime},allOtherFieldsPreserved:true,createTimePreserved:true},null,2))
