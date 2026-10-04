import type { Role } from './domain/governance'
import type { Page } from './domain/navigation'

export const pageLabels:Record<Page,string> = {
 automation:'Overview', evaluations:'Evaluations', analytics:'Analytics', calibration:'Calibration',
 policies:'Policies', forms:'Evaluation Forms', groups:'Question Groups', answerSets:'Answer Sets',
 conversations:'Conversations', evaluate:'Conversation detail', settings:'Settings', history:'Browser history',
}
export const pageLabel=(page:Page)=>pageLabels[page]
export type NavigationGroupId='quality'|'configuration'|'interactions'
export interface NavigationGroup {id:NavigationGroupId;label:string;pages:Page[];primary:boolean}
const configuration:Page[]=['forms','groups','answerSets','policies']
/** Prominence only: shared routes and permission authority are unchanged. */
export function navigationForRole(role:Role|null):NavigationGroup[] {
 const quality:NavigationGroup={id:'quality',label:role==='REVIEWER'?'Quality / Review':'Monitor / Quality',primary:role!==null&&role!=='AUTHOR',pages:role==='REVIEWER'?['evaluations','calibration','analytics','automation']:role==='VIEWER'?['automation','analytics','evaluations','calibration']:['automation','evaluations','analytics','calibration']}
 const config:NavigationGroup={id:'configuration',label:role==='REVIEWER'||role==='VIEWER'?'Reference configuration':'Configuration',primary:role==='AUTHOR',pages:role==='ADMIN'?['policies','forms','groups','answerSets']:[...configuration]}
 const interactions:NavigationGroup={id:'interactions',label:'Interactions',primary:role===null,pages:['conversations']}
 // Disconnected/unresolved access has no invented role. Browser Analytics works
 // disconnected; saved evaluations/calibration/overview remain discoverable.
 if(role===null){quality.pages=['analytics','automation','evaluations','calibration'];return [interactions,quality,config]}
 return role==='AUTHOR'?[config,quality,interactions]:[quality,config,interactions]
}
export function groupForPage(page:Page,role:Role|null):NavigationGroupId|undefined {
 return navigationForRole(role).find(group=>group.pages.includes(page))?.id
}
export const utilityPages:Page[]=['settings']
// Browser history was already contextual to browser Evaluations, never a sidebar peer.
export const contextualPages:Page[]=['evaluate','history']
