import { useState } from 'react'
import type { Role } from './domain/governance'
import type { Page } from './domain/navigation'
import { navigationForRole, pageLabel, type NavigationGroupId } from './navigationPresentation'

type OpenState=Partial<Record<NavigationGroupId,boolean>>
// Memory only, scoped to this SPA lifetime, including a product-tour detour.
const sessionOpen:Partial<Record<Role|'neutral',OpenState>>={}
const icons:Partial<Record<Page,string>>={automation:'◌',evaluations:'◷',analytics:'▥',calibration:'◎',policies:'◇',forms:'▤',groups:'▦',answerSets:'☷',conversations:'☷',settings:'⚙'}
export function WorkspaceNavigation({role,page,onNavigate,onAbout}:{role:Role|null;page:Page;onNavigate:(page:Page)=>unknown;onAbout:()=>void}) {
 const [,refresh]=useState(0),scope=role??'neutral',groups=navigationForRole(role)
 const item=(destination:Page)=><button key={destination} className={`nav-item ${page===destination?'active':''}`} aria-current={page===destination?'page':undefined} onClick={()=>onNavigate(destination)}><span className="nav-icon" aria-hidden="true">{icons[destination]}</span><span>{pageLabel(destination)}</span></button>
 return <nav className="workspace-navigation" aria-label="Primary navigation">
  {groups.map(group=><details key={group.id} className="workspace-nav-group" open={group.pages.includes(page)||(sessionOpen[scope]?.[group.id]??group.primary)} onToggle={event=>{
   const open=event.currentTarget.open
   if(group.pages.includes(page)&&!open){event.currentTarget.open=true;return}
   if(sessionOpen[scope]?.[group.id]===open)return
   sessionOpen[scope]={...sessionOpen[scope],[group.id]:open};refresh(value=>value+1)
  }}><summary>{group.label}</summary><div className="workspace-nav-items">{group.pages.map(item)}</div></details>)}
  <div className="workspace-nav-utilities">{item('settings')}<button className="nav-item" onClick={onAbout}>About / product tour</button></div>
 </nav>
}
