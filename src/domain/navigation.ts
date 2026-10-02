export const pages=['evaluate','conversations','forms','groups','policies','automation','evaluations','history','analytics','calibration','settings'] as const
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
const analyticsReturnKeys=[...analyticsCohortKeys.map(key=>`analytics.${key}`),'analytics.tab']
/** Replace the entire evaluation scope. Return context is explicit URL state, never API filters. */
export function evaluationExploreUrl(url:URL,filters:Record<string,string>,options:{analyticsReturn?:boolean}={}):URL {
 const next=new URL(url)
 for(const key of [...evaluationFilterKeys,...analyticsReturnKeys,'origin'])next.searchParams.delete(key)
 // Operational detail selectors cannot remain authoritative on another destination.
 for(const key of ['runId','policyId','alertId'])next.searchParams.delete(key)
 next.searchParams.set('page','evaluations');next.searchParams.set('evaluationSource','server')
 for(const key of evaluationFilterKeys){const value=filters[key];if(value)next.searchParams.set(key,value)}
 if(options.analyticsReturn){
  next.searchParams.set('origin','analytics')
  for(const key of analyticsCohortKeys){const value=url.searchParams.get(key);if(value)next.searchParams.set(`analytics.${key}`,value)}
  next.searchParams.set('analytics.tab',url.searchParams.get('analyticsTab')??'overview')
 }
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
