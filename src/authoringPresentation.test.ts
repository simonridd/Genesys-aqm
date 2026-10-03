import { describe,it,expect } from 'vitest'
import { answerFormat,answerSetUpdateImpact,creditLabel } from './authoringPresentation'
import { seedAnswerSets } from './domain/seedAnswerSets'
import { seedForms } from './domain/forms'
import { applyAnswerSet,updateAnswerSet,nextAnswerSetVersion,detachAnswerSet } from './domain/answerSets'
import { productionReadinessErrors,transitionForm,isOperationalForm } from './domain/formLifecycle'
import { validateComposition } from './domain/formComposition'
import { exportDefinition,importDefinition } from './domain/portability'
import type { EvaluationForm,ScorecardItem } from './domain/types'
const a=seedAnswerSets[1],now='2026-10-03T10:00:00Z'
function form():EvaluationForm{return {...structuredClone(seedForms[0]),id:'proof',status:'DRAFT',enabled:false,groups:[{id:'general',name:'General'}],questions:[{id:'resolution',groupId:'general',type:'choice',title:'Resolution quality',instructions:'Was it clear?',options:structuredClone(a.options),weight:1,enabled:true}]}}
describe('authoring presentation and existing contracts',()=>{
 it('names formats and percentages without changing domain values',()=>{expect(['noul','choice','score'].map(t=>answerFormat(t as ScorecardItem['type']))).toEqual(['Yes / No','Multiple choice','Ordered scale']);expect(creditLabel(.75)).toBe('75%');expect(creditLabel(undefined)).toBe('Not scored')})
 it('matches stable keys while explaining every visible change and relative order',()=>{
 const f=applyAnswerSet(form(),'resolution',a),next=nextAnswerSetVersion(a,[a],now);next.status='PUBLISHED';next.options=[{...a.options[1],label:'Mostly resolved',credit:.8},{...a.options[0]},{...a.options[3]},{key:'new_answer',label:'Not stated',description:'No statement.',credit:0}]
 const before=JSON.stringify(f),impact=answerSetUpdateImpact(f,f.questions[0],next)
 expect(impact.changes.find(c=>c.key===a.options[1].key)?.marks).toEqual(['RENAMED','CREDIT CHANGED','ORDER CHANGED']);expect(impact.changes.find(c=>c.key===a.options[2].key)?.marks).toContain('REMOVED');expect(impact.changes.at(-2)?.marks).toContain('ADDED');expect(impact.orderChanged).toBe(true);expect(JSON.stringify(f)).toBe(before)
 const updated=updateAnswerSet(f,'resolution',next);expect(updated.questions[0].options).toEqual(next.options);expect(validateComposition(updated)).toEqual([]);expect(productionReadinessErrors(updated)).toEqual([]);expect(JSON.stringify(f)).toBe(before)
 })
 it('explains question and group dependencies including disabled questions; validators still block',()=>{
 const f=applyAnswerSet(form(),'resolution',a);f.questions.push({...f.questions[0],id:'escalation',title:'Escalation required',enabled:false,type:'noul',options:[],sourceAnswerSet:undefined,condition:{kind:'question_outcome',questionId:'resolution',outcomes:[a.options[2].key]}});f.groups!.push({id:'followup',name:'Follow-up questions',condition:{kind:'question_outcome',questionId:'resolution',outcomes:[a.options[2].key]}})
 const next={...nextAnswerSetVersion(a,[a],now),status:'PUBLISHED' as const,options:a.options.filter(o=>o.key!==a.options[2].key)},before=JSON.stringify(f),impact=answerSetUpdateImpact(f,f.questions[0],next)
 expect(impact.blockingDependencies.map(d=>[d.dependentTitle,d.affectedAnswerLabel])).toEqual([['Escalation required','Partly clear'],['Follow-up questions','Partly clear']]);expect(()=>updateAnswerSet(f,'resolution',next)).toThrow('blocked');expect(JSON.stringify(f)).toBe(before)
 })
 it('credit-only conditions block when all multiple-choice answers lose credit',()=>{const f=form();f.questions.push({...f.questions[0],id:'later',title:'Later',condition:{kind:'question_credit',questionId:'resolution',operator:'less_than',value:.5}});const next={...a,options:a.options.map(o=>({...o,credit:undefined}))};expect(answerSetUpdateImpact(f,f.questions[0],next).blockingDependencies[0].reason).toContain('needs credit')})
 it('adding/removing alone does not claim retained levels were reordered',()=>{const f=form(),next={...a,options:[{key:'new',label:'New',description:'New.',credit:1},...a.options.slice(1)]};expect(answerSetUpdateImpact(f,f.questions[0],next).orderChanged).toBe(false)})
 it('round-trips imported mappings and provenance while unrelated text changes; detach keeps answers',()=>{const f=applyAnswerSet(form(),'resolution',a);f.questions[0].options[0].sourceValue=17.125;const value=exportDefinition('form',f),imported=importDefinition('form',value,'imported',now);imported.name='Unrelated edit';const again=importDefinition('form',exportDefinition('form',imported),'again',now);expect(again.questions).toEqual(f.questions);expect(detachAnswerSet(f,'resolution').questions[0].options).toEqual(f.questions[0].options);expect(detachAnswerSet(f,'resolution').questions[0].sourceAnswerSet).toBeUndefined()})
 it('zero-question draft is an editor state, never production-ready or publishable',()=>{const f={...form(),questions:[]};expect(productionReadinessErrors(f)).toContain('Enable at least one question.');expect(()=>transitionForm(f,'PUBLISHED',now)).toThrow('Enable at least one');expect(isOperationalForm({...f,status:'PUBLISHED',enabled:true})).toBe(false)})
})
