import type { OverviewSnapshot } from './domain/overview'
import { usePermission } from './GovernancePanel'
import { OverviewView, type OverviewActions } from './OverviewView'
export { overviewTime } from './OverviewView'
export type { OverviewActions } from './OverviewView'
export function OverviewSummary({data,actions,onManual}:{data:OverviewSnapshot;actions:OverviewActions;onManual:()=>void}){
 const reviewer=usePermission('reviews.write'),author=usePermission('forms.write'),admin=usePermission('settings.write'),canRun=usePermission('policies.write')
 return <OverviewView data={data} actions={actions} onManual={onManual} capabilities={{reviewer,author,admin,canRun}}/>
}
