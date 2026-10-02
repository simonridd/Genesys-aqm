import { MemoryStore,type Store } from '../src/server/store'
import { operationalOverview } from '../src/server/overview'
import { alertSummary,type OperationalAlert } from '../src/domain/operationalAlerts'
import type { NotificationHealth } from '../src/domain/notifications'
export async function overviewBrowserFixture({store=new MemoryStore(),now='2026-10-02T12:00:00.000Z',notifications,alerts}:{store?:Store;now?:string;notifications?:NotificationHealth;alerts?:OperationalAlert[]}={}){
 const s=await operationalOverview(store,now,7,{bootstrapId:'admin',allowedUserIds:new Set(['admin'])},true)
 if(notifications)s.notifications={complete:true,data:notifications}
 if(alerts){const summary=alertSummary(alerts);s.alerts={complete:true,data:{openAlerts:summary.openAlertCount,errors:summary.errorAlertCount,warnings:summary.warningAlertCount,items:alerts.filter(a=>a.status!=='RESOLVED').map(a=>({id:a.id,title:a.title,severity:a.severity,createdAt:a.createdAt,runId:a.runId,evaluationId:a.context?.evaluationId}))}}}
 return s
}
