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
export const evaluationFilterKeys=['form','question','reviewQuestion','comparison','reviewStatus','evaluationId','evaluationSource','source','agent','queue','from','to','assignment','due','dueState','reviewQueue','policy','mode','critical','outcome','evaluations.q']
export function overviewEvaluationLink(url:URL,filters:Record<string,string>):URL {
 const next=new URL(url);for(const key of evaluationFilterKeys)next.searchParams.delete(key)
 next.searchParams.delete('runId');next.searchParams.set('page','evaluations');next.searchParams.set('evaluationSource','server')
 for(const [key,value] of Object.entries(filters))if(value)next.searchParams.set(key,value)
 return next
}
