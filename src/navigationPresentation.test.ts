import { describe,it,expect } from 'vitest'
import { navigationForRole,groupForPage,pageLabel,contextualPages,utilityPages } from './navigationPresentation'
import { roles,rolePermissions,permissions } from './domain/governance'
describe('role prominence preserves shared capability',()=>{
 const primary={ADMIN:['automation','evaluations','analytics','calibration'],AUTHOR:['forms','groups','answerSets','policies'],REVIEWER:['evaluations','calibration','analytics','automation'],VIEWER:['automation','analytics','evaluations','calibration']}
 for(const role of roles)it(`${role}: focused defaults and complete destination inventory`,()=>{
  const groups=navigationForRole(role)
  expect(groups.filter(g=>g.primary).flatMap(g=>g.pages)).toEqual(primary[role])
  const pages=groups.flatMap(g=>g.pages)
  expect(new Set(pages).size).toBe(9)
  expect([...pages,...utilityPages,...contextualPages].sort()).toEqual(['automation','evaluations','analytics','calibration','forms','groups','answerSets','policies','conversations','settings','evaluate','history'].sort())
  for(const page of pages)expect(groupForPage(page,role)).toBeDefined()
  expect(groupForPage('evaluate',role)).toBeUndefined()
 })
 it('neutral access exposes useful disconnected exploration without inventing a role',()=>{
  expect(navigationForRole(null)[0]).toMatchObject({id:'interactions',primary:true,pages:['conversations']})
  expect(navigationForRole(null).filter(g=>g.primary)).toHaveLength(1)
 })
 it('human labels cover every route',()=>{
  expect(pageLabel('answerSets')).toBe('Answer Sets');expect(pageLabel('groups')).toBe('Question Groups');expect(pageLabel('evaluate')).toBe('Conversation review');expect(pageLabel('automation')).toBe('Overview')
 })
 it('permission contract is invariant, including existing reference reads',()=>{
  const reads=['forms.read','groups.read','policies.read','evaluations.read','reviews.read','alerts.read','settings.read']
  expect(rolePermissions.ADMIN).toEqual(permissions)
  expect(rolePermissions.AUTHOR).toEqual([...reads,'notifications.read','forms.write','forms.publish','groups.write','groups.publish','policies.write','schedules.write','evaluations.write','alerts.acknowledge','history.read'])
  expect(rolePermissions.REVIEWER).toEqual([...reads,'reviews.write']);expect(rolePermissions.VIEWER).toEqual(reads)
  const before=JSON.stringify(rolePermissions);for(const role of roles)navigationForRole(role);expect(JSON.stringify(rolePermissions)).toBe(before)
 })
})
