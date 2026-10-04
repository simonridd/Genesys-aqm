import {describe,it,expect} from 'vitest'
import {applyAnswerSet,applyAnswerSetWithFormatChange,detachAnswerSet} from './answerSets'
import {seedAnswerSets} from './seedAnswerSets'
import {seedForms} from './forms'
import {exportDefinition,importDefinition} from './portability'
import {discoverAnswerSets,answerSetFormatChangeDependencies} from '../authoringPresentation'
import {MemoryStore} from '../server/store'
import type {EvaluationForm,QuestionType} from './types'
const choice=seedAnswerSets[1],score=seedAnswerSets[0],now='2026-10-04T10:00:00.000Z'
function form(type:QuestionType):EvaluationForm{return {...structuredClone(seedForms[0]),status:'DRAFT',enabled:false,groups:[{id:'general',name:'General'}],questions:[{id:'q',title:'Resolution clear?',instructions:'Assess resolution.',type,options:type==='noul'?[]:structuredClone((type==='score'?score:choice).options),weight:2.5,enabled:true,groupId:'general',section:'Resolution',sourceAssetQuestionId:'original_question'}]}}
describe('explicit Answer Set discovery boundary',()=>{
 it('keeps same-format application strict and unchanged',()=>{for(const a of [choice,score]){const f=form(a.type),before=structuredClone(f);const result=applyAnswerSet(f,'q',a);expect(result.questions[0]).toEqual({...f.questions[0],options:a.options,sourceAnswerSet:{familyId:a.familyId,answerSetId:a.id,answerSetVersion:a.version}});expect(f).toEqual(before);expect(()=>applyAnswerSetWithFormatChange(f,'q',a)).toThrow('same answer format')}expect(()=>applyAnswerSet(form('noul'),'q',choice)).toThrow('type')})
 it.each([['noul',choice],['noul',score],['score',choice],['choice',score]] as const)('%s -> %s copies the exact snapshot, preserves ordinary fields and round trips',async(type,a)=>{
  const f=form(type);f.status='TESTING';const disabled=structuredClone(f);disabled.questions[0].enabled=false;expect(applyAnswerSetWithFormatChange(disabled,'q',a).questions[0].enabled).toBe(false);const before=structuredClone(f),result=applyAnswerSetWithFormatChange(f,'q',a)
  expect(result).toEqual({...f,questions:[{...f.questions[0],type:a.type,options:a.options,sourceAnswerSet:{familyId:a.familyId,answerSetId:a.id,answerSetVersion:a.version}}]});expect(f).toEqual(before)
  expect(result.questions[0].options).not.toBe(a.options);result.questions[0].options[0].label='Local clone';expect(a.options[0].label).not.toBe('Local clone');result.questions[0].options[0].label=a.options[0].label
  const store=new MemoryStore();await store.putForm(result);expect((await store.form(result.id))!.questions).toEqual(result.questions)
  const imported=importDefinition('form',exportDefinition('form',result),'copy',now);expect(imported.questions).toEqual(result.questions)
  const detached=detachAnswerSet(result,'q');expect(detached.questions[0]).toEqual({...result.questions[0],sourceAnswerSet:undefined});expect(detached.questions[0].type).toBe(a.type)
 })
 it('requires draft/testing, unattached questions and a valid published set; every rejection is atomic',()=>{
  const f=form('noul');for(const bad of [{...choice,status:'DRAFT' as const},{...choice,status:'RETIRED' as const},{...choice,options:[]}]){const before=structuredClone(f);expect(()=>applyAnswerSetWithFormatChange(f,'q',bad)).toThrow();expect(f).toEqual(before)}
  expect(()=>applyAnswerSetWithFormatChange(f,'missing',choice)).toThrow('not found')
  for(const status of ['PUBLISHED','RETIRED'] as const){const frozen={...f,status},before=structuredClone(frozen);expect(()=>applyAnswerSetWithFormatChange(frozen,'q',choice)).toThrow('draft/testing');expect(frozen).toEqual(before)}
  const attached=applyAnswerSetWithFormatChange(f,'q',choice),before=structuredClone(attached);expect(()=>applyAnswerSetWithFormatChange(attached,'q',score)).toThrow('Detach');expect(attached).toEqual(before)
 })
 it.each(['question','disabled question','group'] as const)('blocks current Yes dependency on a %s without guessing or mutating',kind=>{
  const f=form('noul'),condition={kind:'question_outcome' as const,questionId:'q',outcomes:['Yes']}
  if(kind==='group')f.groups!.push({id:'followup',name:'Escalation group',condition})
  else f.questions.push({...f.questions[0],id:'later',title:'Escalation required',enabled:kind!=='disabled question',condition})
  const before=structuredClone(f),dependency=answerSetFormatChangeDependencies(f,f.questions[0],choice)[0]
  expect(dependency).toMatchObject({affectedAnswerLabel:'Yes',dependentKind:kind==='group'?'group':'question'});expect(()=>applyAnswerSetWithFormatChange(f,'q',choice)).toThrow('condition');expect(f).toEqual(before)
  const coincidental={...choice,options:choice.options.map((o,i)=>({...o,key:i===0?'yes':o.key}))};expect(()=>applyAnswerSetWithFormatChange(f,'q',coincidental)).toThrow('condition')
 })
 it('blocks manual answer-key references and missing credits using composition validation',()=>{
  const f=form('choice');f.questions.push({...form('noul').questions[0],id:'later',title:'Escalation',enabled:false,condition:{kind:'question_outcome',questionId:'q',outcomes:['clear']}});const before=structuredClone(f);expect(()=>applyAnswerSetWithFormatChange(f,'q',score)).toThrow('valid Choice');expect(f).toEqual(before)
  const s=form('score');s.questions.push({...form('noul').questions[0],id:'later',condition:{kind:'question_credit',questionId:'q',operator:'less_than',value:.5}});const unscored={...choice,options:choice.options.map(o=>({...o,credit:undefined}))};expect(()=>applyAnswerSetWithFormatChange(s,'q',unscored)).toThrow('credit');expect(applyAnswerSetWithFormatChange(s,'q',choice).questions[1].condition).toEqual(s.questions[1].condition)
 })
 it('discovers all published formats, searches name/description/labels and orders by name relevance then format',()=>{
  const other={...score,id:'other',name:'Resolution clarity helper'},hidden={...choice,id:'draft',status:'DRAFT' as const},all=[score,other,choice,hidden]
  expect(discoverAnswerSets(all,'score','Resolution clarity').map(a=>a.id)).toEqual([choice.id,other.id]);expect(discoverAnswerSets(all,'score','')).toHaveLength(3);expect(discoverAnswerSets(all,'noul','MOSTLY CLEAR')).toEqual([choice]);expect(discoverAnswerSets(all,'noul','browser exploration')).toHaveLength(3);expect(discoverAnswerSets(all,'choice','no match')).toEqual([])
  const v2={...choice,id:'v2',version:2};expect(discoverAnswerSets([choice,v2],'noul','').map(a=>a.version)).toEqual([2,1])
 })
})
