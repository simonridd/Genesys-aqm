import { describe,expect,it } from 'vitest'
import { aggregateCalibration } from './calibration'
import { answerCredit, buildReview, calibrationSample, compareAnswer, matchesReviewQueue, reviewStatus, selectedConfidence } from './reviews'
import { fixtureAnswers, reviewFixture, reviewInput } from '../fixtures/reviewFixture'
const actor={userId:'verified-user',displayName:'Verified Reviewer'},now='2026-10-01T09:00:00.000Z'
describe('human review semantics',()=>{
  it('requests, starts, partially saves and completes beside an immutable AI snapshot',()=>{
    const record=reviewFixture(),before=structuredClone(record)
    const requested=buildReview(record,undefined,reviewInput(record,'request'),actor,now)
    expect(requested.status).toBe('REVIEW_REQUESTED');expect(requested.reviewer).toBeUndefined()
    const started=buildReview(record,requested,reviewInput(record,'start',1),actor,now)
    const partial=buildReview(record,started,{...reviewInput(record,'save',2),answers:fixtureAnswers.slice(0,1)},actor,now)
    expect(partial.status).toBe('IN_REVIEW');expect(partial.comparison.answered).toBe(1);expect(partial.humanOverallScore).toBe(0)
    expect(()=>buildReview(record,partial,{...reviewInput(record,'complete',3),answers:fixtureAnswers.slice(0,1)},actor,now)).toThrow('every')
    const complete=buildReview(record,partial,reviewInput(record,'complete',3),actor,now)
    expect(complete.status).toBe('REVIEWED');expect(complete.completedAt).toBe(now);expect(complete.reviewer).toEqual(actor)
    expect(complete.events.map(event=>event.kind)).toEqual(['review_requested','review_started','review_saved','review_completed'])
    expect(complete.humanOverallScore).toBeCloseTo((.67*1.2+1.5)/3.7)
    expect(complete.comparison).toMatchObject({agreements:1,disagreements:2,total:3,answered:3,aiOverallScore:record.overallScore})
    expect(record).toEqual(before);expect(()=>buildReview(record,complete,reviewInput(record,'save',4),actor,now)).toThrow('immutable')
    expect(JSON.stringify(complete)).not.toMatch(/messages|accessToken|rawResponse|transcript/)
  })
  it('compares binary and Choice normalized outcomes exactly',()=>{
    const record=reviewFixture(),binary=record.form.questions[0],choice=record.form.questions[2]
    expect(compareAnswer(binary,record.questions[0],answerCredit(binary,'Yes')).exact).toBe(true)
    expect(compareAnswer(binary,record.questions[0],answerCredit(binary,'No')).exact).toBe(false)
    expect(compareAnswer(choice,record.questions[2],answerCredit(choice,'fully_resolved')).exact).toBe(true)
    expect(compareAnswer(choice,record.questions[2],answerCredit(choice,'unresolved')).exact).toBe(false)
    expect(answerCredit(choice,'not_applicable').credit).toBeNull()
  })
  it('preserves exact score values and fractional band distance',()=>{
    const record=reviewFixture(),question=record.form.questions[1],ai=record.questions[1]
    expect(compareAnswer(question,ai,answerCredit(question,1))).toMatchObject({exact:true,valueDistance:0,band:'exact'})
    expect(compareAnswer(question,ai,answerCredit(question,2))).toMatchObject({exact:false,valueDistance:1,band:'one-band'})
    expect(compareAnswer(question,ai,answerCredit(question,3))).toMatchObject({exact:false,valueDistance:2,band:'multi-band'})
    expect(compareAnswer(question,{...ai,rawValue:1.4},answerCredit(question,2))).toMatchObject({exact:false,band:'one-band'})
    expect(()=>answerCredit(question,1.4)).toThrow('Invalid answer')
  })
  it('excludes not-applicable credit from weighted human denominator',()=>{
    const record=reviewFixture(),input=reviewInput(record);input.answers![2].value='not_applicable'
    const review=buildReview(record,undefined,input,actor,now)
    expect(review.humanOverallScore).toBeCloseTo(.67*1.2/2.2)
  })
  it('rejects snapshot mismatch, invalid/duplicate IDs, oversized notes and form tests',()=>{
    const record=reviewFixture()
    expect(()=>buildReview(record,undefined,{...reviewInput(record),formVersion:18},actor,now)).toThrow('snapshot')
    for(const answers of [[{questionId:'invented',value:'Yes'}],[fixtureAnswers[0],fixtureAnswers[0]]])expect(()=>buildReview(record,undefined,{...reviewInput(record,'save'),answers},actor,now)).toThrow('reference')
    expect(()=>buildReview(record,undefined,{...reviewInput(record),notes:'x'.repeat(4001)},actor,now)).toThrow('4000')
    expect(()=>buildReview({...record,purpose:'FORM_TEST'},undefined,reviewInput(record),actor,now)).toThrow('production')
    expect(()=>buildReview({...record,questions:[]},undefined,reviewInput(record),actor,now)).toThrow('snapshot')
    expect(()=>buildReview(record,undefined,{...reviewInput(record),expectedRevision:NaN},actor,now)).toThrow('revision')
    const prior=buildReview(record,undefined,reviewInput(record,'request'),actor,now);prior.events=Array.from({length:199},()=>prior.events[0])
    expect(()=>buildReview(record,prior,reviewInput(record,'complete',1),actor,now)).toThrow('audit limit')
  })
  it('uses selected No probability for confidence bands without changing AI probability',()=>{
    const ai={...reviewFixture().questions[0],outcome:'No',probability:.05};expect(selectedConfidence(ai)).toBeCloseTo(.95);expect(ai.probability).toBe(.05)
    expect(selectedConfidence({...ai,probability:undefined})).toBeNull()
  })
  it('accepts Firestore map ordering but refuses changed AI or form snapshots',()=>{
    const record=reviewFixture(),review=buildReview(record,undefined,reviewInput(record,'save'),actor,now)
    const reordered={...record,form:Object.fromEntries(Object.entries(record.form).reverse()) as typeof record.form,questions:record.questions.map(q=>Object.fromEntries(Object.entries(q).reverse()) as typeof q)}
    expect(buildReview(reordered,review,reviewInput(record,'save',1),actor,now).revision).toBe(2)
    expect(()=>buildReview({...record,questions:record.questions.map((q,i)=>i===0?{...q,credit:0}:q)},review,reviewInput(record,'save',1),actor,now)).toThrow('snapshot changed')
    expect(()=>buildReview({...record,form:{...record.form,name:'Altered'}},review,reviewInput(record,'save',1),actor,now)).toThrow('snapshot changed')
  })
  it('supports legacy states without fabricating completed human evidence',()=>{
    const record=reviewFixture();expect(reviewStatus(record)).toBe('NOT_REVIEWED');expect(reviewStatus({...record,reviewState:'REVIEWED'})).toBe('REVIEWED')
    expect(aggregateCalibration([{...record,reviewState:'REVIEWED'}]).metrics.evaluationsReviewed).toBe(0)
  })
})
describe('calibration aggregation and queue',()=>{
  const record=reviewFixture(),review=buildReview(record,undefined,reviewInput(record),actor,now),joined={...record,humanReview:review}
  it('separates real/synthetic, excludes partial/form tests and aggregates forms/types/questions/confidence',()=>{
    const synthetic=reviewFixture('synthetic','synthetic'),syntheticReview=buildReview(synthetic,undefined,reviewInput(synthetic),actor,now)
    const draft=reviewFixture('partial'),partial=buildReview(draft,undefined,{...reviewInput(draft,'save'),answers:fixtureAnswers.slice(0,1)},actor,now)
    const records=[joined,{...synthetic,humanReview:syntheticReview},{...draft,humanReview:partial},{...joined,id:'test',purpose:'FORM_TEST' as const}]
    const result=aggregateCalibration(records)
    expect(result.metrics).toMatchObject({evaluationsReviewed:1,questionsReviewed:3,exactAgreementRate:1/3,unresolved:1,inReview:1})
    expect(result.byForm[0]).toMatchObject({formRef:`${record.form.id}@17`,reviewed:1,disagreements:2})
    expect(result.byQuestion.find(q=>q.questionId==='greeting')).toMatchObject({disagreements:1,aiAverageCredit:1,humanAverageCredit:0,averageAbsoluteCreditDifference:1,confidenceOnDisagreements:.95,confidenceOnAgreements:null,evaluationIds:[record.id]})
    expect(result.byType.map(item=>item.questions)).toEqual([1,1,1])
    expect(result.confidenceBands.map(item=>[item.key,item.questions,item.disagreements])).toEqual([['low',0,0],['medium',1,1],['high',1,0],['very-high',1,1],['unknown',0,0]])
    expect(aggregateCalibration(records,new URLSearchParams({source:'synthetic'})).metrics.evaluationsReviewed).toBe(1)
    expect(aggregateCalibration(records,new URLSearchParams({source:'all'})).metrics.evaluationsReviewed).toBe(2)
    expect(aggregateCalibration([{...record,source:'synthetic-demo',conversationSource:undefined,humanReview:{...review,source:'synthetic'}}]).metrics.evaluationsReviewed).toBe(0)
  })
  it('keeps distinct form versions and confidence boundary bands separate',()=>{
    const records=[.59,.6,.8,.9].map((confidence,index)=>{
      const record=reviewFixture(`band_${index}`);record.form.version=index%2?18:17;record.questions[0].probability=confidence
      return {...record,humanReview:buildReview(record,undefined,reviewInput(record),actor,now)}
    })
    const result=aggregateCalibration(records)
    expect(result.byForm.map(form=>[form.formRef,form.reviewed])).toEqual([['general_service@17',2],['general_service@18',2]])
    expect(result.confidenceBands.slice(0,4).map(band=>band.questions)).toEqual([1,5,5,1])
    expect(aggregateCalibration(records,new URLSearchParams({form:'general_service@18'})).metrics.evaluationsReviewed).toBe(2)
  })
  it('returns null rates for empty data and accounts for missing confidence',()=>{
    expect(aggregateCalibration([]).metrics.exactAgreementRate).toBeNull()
    const unknown=structuredClone(joined);unknown.humanReview.questions[0].selectedOutcomeConfidence=null
    expect(aggregateCalibration([unknown]).confidenceBands.at(-1)?.questions).toBe(1)
  })
  it('filters queue by status, form/version, agent, queue, date and question disagreements',()=>{
    expect(matchesReviewQueue(joined,new URLSearchParams({reviewStatus:'REVIEWED',form:`${record.form.id}@17`,agent:record.agent.id,queue:record.queue,source:'genesys-cloud',from:record.evaluatedAt,to:record.evaluatedAt,reviewQuestion:'greeting',comparison:'disagreements'}))).toBe(true)
    for(const filters of [{reviewStatus:'IN_REVIEW'},{form:`${record.form.id}@18`},{agent:'absent'},{queue:'absent'},{from:'2027'},{to:'2025'},{reviewQuestion:'resolution',comparison:'disagreements'}])expect(matchesReviewQueue(joined,new URLSearchParams(Object.entries(filters).filter((entry):entry is [string,string]=>typeof entry[1]==='string')))).toBe(false)
  })
  it('samples only existing unreviewed records deterministically, capped at 20',()=>{
    const records=Array.from({length:25},(_,i)=>({...record,id:`evaluation_${i}`,evaluatedAt:`2026-10-01T${String(i%24).padStart(2,'0')}:00:00Z`}))
    records.push(joined)
    const sample=calibrationSample(records,new URLSearchParams(),20,'deterministic','fixed')
    expect(sample).toHaveLength(20);expect(sample.map(r=>r.id)).toEqual(calibrationSample([...records].reverse(),new URLSearchParams(),20,'deterministic','fixed').map(r=>r.id))
    expect(calibrationSample(records,new URLSearchParams(),1,'recent','')[0].evaluatedAt).toContain('T23:')
    expect(()=>calibrationSample(records,new URLSearchParams(),21,'recent','')).toThrow('20')
  })
})
