export const analyticsViews=[{value:'overview',label:'Overview'},{value:'agents',label:'Agents'},{value:'queues',label:'Queues'},{value:'forms',label:'Forms'},{value:'groups',label:'Groups'},{value:'questions',label:'Questions'},{value:'coverage',label:'Coverage'}] as const
export const calibrationViews=[{value:'forms',label:'Form / version'},{value:'groups',label:'Groups'},{value:'questions',label:'Questions'},{value:'types',label:'Question types'},{value:'confidence',label:'Confidence vs disagreement'}] as const
export function ResponsiveViewSwitcher<T extends string>({label,options,value,onChange}:{label:string;options:readonly {value:T;label:string}[];value:T;onChange:(value:T)=>void}) {
 return <div className="responsive-view-switcher">
  <div className="analytics-tabs desktop-view-switcher" role="group" aria-label={label}>{options.map(option=><button key={option.value} className={value===option.value?'active':''} aria-pressed={value===option.value} onClick={()=>onChange(option.value)}>{option.label}</button>)}</div>
  <label className="mobile-view-switcher">View<select value={value} onChange={event=>onChange(event.target.value as T)}>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
 </div>
}
