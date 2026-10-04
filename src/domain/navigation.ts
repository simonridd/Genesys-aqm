import { calibrationScopeKeys } from '../calibrationPresentation'
export const pages=['evaluate','conversations','forms','groups','answerSets','policies','automation','evaluations','history','analytics','calibration','settings'] as const
export type Page=typeof pages[number]
export function landingPage(query:URLSearchParams,connected:boolean):Page {
 if(query.has('evaluationId'))return 'evaluations'
 const requested=query.get('page')
 if(pages.includes(requested as Page))return requested as Page
 if(query.has('policyId'))return 'policies'
 if(query.has('runId'))return 'automation'
 return connected?'automation':'evaluate'
}
export const evaluationFilterKeys=['form','question','reviewQuestion','comparison','reviewStatus','evaluationId','evaluationSource','source','agent','queue','channel','cohort','from','to','assignment','due','dueState','reviewQueue','policy','mode','critical','outcome','evaluations.q']
export const analyticsCohortKeys=['from','to','source','policy','form','agent','queue','channel','mode'] as const
const calibrationReturnKeys=[...calibrationScopeKeys.map(key=>`calibration.${key}`),'calibration.tab','calibration.question']
const analyticsReturnKeys=[...analyticsCohortKeys.map(key=>`analytics.${key}`),'analytics.tab']
/** Replace the entire evaluation scope. Return context is explicit URL state, never API filters. */
export function evaluationExploreUrl(url:URL,filters:Record<string,string>,options:{analyticsReturn?:boolean;calibrationReturn?:boolean}={}):URL {
 const next=new URL(url)
 for(const key of [...evaluationFilterKeys,...analyticsReturnKeys,...calibrationReturnKeys,'origin'])next.searchParams.delete(key)
 // Operational detail selectors cannot remain authoritative on another destination.
 for(const key of ['runId','policyId','alertId'])next.searchParams.delete(key)
 next.searchParams.set('page','evaluations');next.searchParams.set('evaluationSource','server')
 for(const key of evaluationFilterKeys){const value=filters[key];if(value)next.searchParams.set(key,value)}
 if(options.analyticsReturn){
  next.searchParams.set('origin','analytics')
  for(const key of analyticsCohortKeys){const value=url.searchParams.get(key);if(value)next.searchParams.set(`analytics.${key}`,value)}
  next.searchParams.set('analytics.tab',url.searchParams.get('analyticsTab')??'overview')
 }
 if(options.calibrationReturn){
  next.searchParams.set('origin','calibration')
  for(const key of calibrationScopeKeys){const value=url.searchParams.get(key);if(value)next.searchParams.set(`calibration.${key}`,value)}
  next.searchParams.set('calibration.tab',url.searchParams.get('calibrationTab')??'forms')
  const question=url.searchParams.get('calibrationQuestion');if(question)next.searchParams.set('calibration.question',question)
 }
 return next
}
export function calibrationReturnUrl(url:URL):URL {
 const next=evaluationExploreUrl(url,{})
 next.searchParams.delete('evaluationSource');next.searchParams.set('page','calibration')
 for(const key of calibrationScopeKeys){const value=url.searchParams.get(`calibration.${key}`);if(value)next.searchParams.set(key,value)}
 next.searchParams.set('calibrationTab',url.searchParams.get('calibration.tab')??'forms')
 const question=url.searchParams.get('calibration.question');if(question)next.searchParams.set('calibrationQuestion',question);else next.searchParams.delete('calibrationQuestion')
 return next
}
export const overviewEvaluationLink=evaluationExploreUrl
export function analyticsReturnUrl(url:URL):URL {
 const next=evaluationExploreUrl(url,{})
 next.searchParams.delete('evaluationSource');next.searchParams.set('page','analytics')
 for(const key of analyticsCohortKeys){const value=url.searchParams.get(`analytics.${key}`);if(value)next.searchParams.set(key,value)}
 next.searchParams.set('analyticsTab',url.searchParams.get('analytics.tab')??'overview')
 return next
}
export function analyticsQuestionFilters(cohort:Record<string,string>,formRef:string,questionId:string):Record<string,string>{
 return {...Object.fromEntries(analyticsCohortKeys.map(key=>[key,cohort[key]??''])),form:formRef,question:questionId,cohort:'analytics'}
}

export const settingsSections = ['connection','access','reviews','privacy','notifications','audit','advanced'] as const
export type SettingsSection = typeof settingsSections[number]
export const settingsLabels:Record<SettingsSection,string> = {connection:'Connection',access:'Access',reviews:'Reviews',privacy:'Privacy & retention',notifications:'Notifications',audit:'Audit',advanced:'Advanced / Development'}
export function settingsSection(query:URLSearchParams):SettingsSection {
 const value=query.get('settingsSection')
 return settingsSections.includes(value as SettingsSection)?value as SettingsSection:'connection'
}
/** Settings carries no conversation, evaluation, policy, run or analytics scope. */
export function settingsUrl(url:URL,section:SettingsSection='connection'):URL {
 const next=new URL(url)
 for(const key of [...evaluationFilterKeys,...analyticsReturnKeys,...calibrationReturnKeys,'origin','runId','policyId','alertId','analyticsTab','calibrationTab','calibrationQuestion'])next.searchParams.delete(key)
 next.hash='';next.searchParams.set('page','settings');next.searchParams.set('settingsSection',section)
 return next
}
