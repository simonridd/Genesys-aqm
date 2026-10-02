import type { Breakdown, summarize, summarizeCoverage } from './analytics'
import type { NotificationHealth } from './notifications'
export type OverviewSection<T> = {complete:true;data:T} | {complete:false;status:'incomplete'|'unavailable';reason:string}
export interface OverviewRun {id:string;policyId:string;policyName:string;status:string;startedAt:string;completedAt?:string;trigger:string;evaluationsSucceeded:number;evaluationsFailed:number}
export interface OverviewAlert {id:string;severity:'ERROR'|'WARNING'|'INFO';title:string;policyId?:string;runId?:string;evaluationId?:string;createdAt:string}
export interface OverviewSnapshot {
 generatedAt:string;range:{days:7|30;from:string;to:string}
 health:OverviewSection<{api:'healthy';firestore:'available';genesysAutomation:{status:'verified'|'error'|'unverified'};jev:{status:'verified'|'error'|'unverified'};scheduler:{status:'healthy'|'stale'|'configured_unverified'|'not_configured';lastSuccessfulTickAt:string|null}}>
 analytics:OverviewSection<{quality:ReturnType<typeof summarize>;coverage:ReturnType<typeof summarizeCoverage>;qualityTrend:Breakdown[];runCounts:{completed:number;partial:number;failed:number;running:number}}>
 reviews:OverviewSection<{open:number;dueSoon:number;overdue:number;escalated:number;unassigned:number}>
 alerts:OverviewSection<{openAlerts:number;errors:number;warnings:number;items:OverviewAlert[]}>
 notifications:OverviewSection<NotificationHealth>
 schedules:OverviewSection<{nextRunAt:string|null;items:Array<{id:string;policyId:string;policyName:string;frequency:string;nextDueAt:string;lastSuccessfulAt:string|null}>}>
 recentRuns:OverviewSection<{lastRun:OverviewRun|null;items:OverviewRun[]}>
 lastAutomatedRun:OverviewSection<OverviewRun|null>
}
