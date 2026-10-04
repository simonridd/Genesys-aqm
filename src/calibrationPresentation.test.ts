import { describe,it,expect } from 'vitest'
import { aggregateCalibration, type CalibrationGroup } from './domain/calibration'
import { calibrationDiscoveryRecords } from './fixtures/calibrationDiscoveryFixture'
import { calibrationFormCatalogue, calibrationFormLabel, rankCalibrationDisagreement, calibrationDisagreementEvidence, readCalibrationState, calibrationRequestUrl } from './calibrationPresentation'
import { evaluationExploreUrl, calibrationReturnUrl } from './domain/navigation'
const data=()=>aggregateCalibration(calibrationDiscoveryRecords())
describe('historical calibration presentation',()=>{
 it('discovers human labels and exact values from byForm, including retired/current versions separately',()=>{
   const catalogue=calibrationFormCatalogue(data().byForm)
   expect(catalogue).toEqual([{value:'retired_complaints@3',label:'Complaints Handling v3'},{value:'general_service@17',label:'Customer Service v17'},{value:'general_service@18',label:'Customer Service v18'}])
   expect(calibrationFormLabel('missing@1',[])).toBe('Selected form version')
   expect(calibrationFormLabel('',[])).toBe('All form versions')
 })
 it('ranks exact questions by observed comparable disagreement, retaining sample size and version',()=>{
   const ranked=rankCalibrationDisagreement(data().byQuestion),top=ranked[0]
   expect(top).toMatchObject({questionId:'understanding',formRef:'general_service@17',agreements:3,disagreements:5})
   expect(calibrationDisagreementEvidence(top)).toEqual({sample:8,label:'5 of 8 comparable reviewed answers disagreed',rate:'62.5% disagreement'})
   expect(ranked.find(q=>q.formRef==='general_service@18'&&q.questionId==='understanding')).toMatchObject({disagreements:2,reviewed:6})
   expect(data().byQuestion.filter(q=>q.questionId==='understanding')).toHaveLength(3)
 })
 it('aggregation excludes SKIPPED, missing human answers and null comparisons without presentation recalculation',()=>{
   const [record]=calibrationDiscoveryRecords(),review=record.humanReview!
   record.questions=record.questions.map(q=>({...q,status:'SKIPPED'}));review.questions=review.questions.map(q=>({...q,ai:{...q.ai,status:'SKIPPED'}}))
   expect(rankCalibrationDisagreement(aggregateCalibration([record]).byQuestion)).toEqual([])
   review.questions=review.questions.map(q=>({...q,human:null,comparison:null}))
   record.questions=record.questions.map(q=>({...q,status:'ANSWERED'}));review.questions=review.questions.map(q=>({...q,ai:{...q.ai,status:'ANSWERED'}}))
   const rows=aggregateCalibration([record]).byQuestion;expect(rows.length).toBeGreaterThan(0);expect(rows.every(q=>q.agreementRate===null&&q.disagreements===0)).toBe(true)
   expect(rankCalibrationDisagreement(rows)).toEqual([])
   expect(rankCalibrationDisagreement(aggregateCalibration([]).byQuestion)).toEqual([])
 })
 it('does not equate review count or questions with comparable denominator',()=>{
   const row={...data().byQuestion[0],reviewed:20,questions:15,agreements:3,disagreements:5}
   expect(calibrationDisagreementEvidence(row).sample).toBe(8)
 })
 it('ties resolve by count, sample, exact ref, label and ID independent of fixture order',()=>{
   const base=data().byQuestion[0]
   const make=(formRef:string,label:string,questionId:string,agreements=1,disagreements=1):CalibrationGroup=>({...base,formRef,label,questionId,key:`${formRef}:${questionId}`,agreements,disagreements,agreementRate:agreements/(agreements+disagreements)})
   const rows=[make('b@1','A','a'),make('a@2','A','a'),make('a@1','B','a'),make('a@1','A','b'),make('a@1','A','a'),make('z@1','Z','z',2,2)]
   const keys=['z@1:z','a@1:a','a@1:b','a@1:a','a@2:a','b@1:a']
   expect(rankCalibrationDisagreement(rows).map(q=>q.key)).toEqual(keys)
   expect(rankCalibrationDisagreement(rows.reverse()).map(q=>q.label+q.key)).toEqual(['Zz@1:z','Aa@1:a','Aa@1:b','Ba@1:a','Aa@2:a','Ab@1:a'])
   expect(rankCalibrationDisagreement([make('a@1','No disagreement','small',2,0),make('b@1','No disagreement','large',4,0)]).map(q=>q.questionId)).toEqual(['large','small'])
 })
 it('catalogue omits form but retains every cohort filter; main request keeps exact version',()=>{
   const state=readCalibrationState(new URLSearchParams('source=synthetic&form=general_service@17&from=2026-09-01&to=2026-09-30&agent=Alex&queue=Claims&calibrationTab=questions'))
   expect(Object.fromEntries(calibrationRequestUrl('https://fixture',state,true).searchParams)).toEqual({source:'synthetic',from:'2026-09-01T00:00:00.000Z',to:'2026-09-30T23:59:59.999Z',agent:'Alex',queue:'Claims'})
   expect(calibrationRequestUrl('https://fixture',state).searchParams.get('form')).toBe('general_service@17')
 })
 it('round-trips scope, view and question through existing exact investigation return pattern',()=>{
   const url=new URL('https://fixture/?page=calibration&source=genesys-cloud&form=general_service@17&from=2026-09-01&to=2026-09-30&agent=Alex&queue=Claims&calibrationTab=questions&calibrationQuestion=general_service@17:understanding')
   const explore=evaluationExploreUrl(url,{form:'general_service@17',reviewQuestion:'understanding',comparison:'disagreements',reviewStatus:'REVIEWED'},{calibrationReturn:true})
   expect(explore.searchParams.get('evaluationSource')).toBe('server')
   expect(readCalibrationState(calibrationReturnUrl(explore).searchParams)).toEqual(readCalibrationState(url.searchParams))
   expect(calibrationReturnUrl(explore).searchParams.has('comparison')).toBe(false)
 })
})
