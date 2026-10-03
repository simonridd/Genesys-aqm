import type { AuthSession } from './genesysAuth'
export async function policyCall<T>(origin:string,session:AuthSession,path:string,method='GET',value?:unknown,fetcher:typeof fetch=fetch):Promise<T> {
 const response=await fetcher(`${origin}${path}`,{method,headers:{Authorization:`Bearer ${session.accessToken}`,'Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)})
 const payload=await response.json()
 if(!response.ok)throw Error(response.status===409&&path.startsWith('/api/policies/')?'This policy changed elsewhere. Refresh before saving.':payload.error??`Service returned HTTP ${response.status}.`)
 return payload as T
}
/** Complete bounded pages; fail visibly rather than present a silently truncated library. */
export async function loadPolicyCollection<T>(call:<R>(path:string)=>Promise<R>,path:string):Promise<T[]> {
 const items:T[]=[],seen=new Set<string>();let cursor:string|undefined,pages=0
 do {
  if(++pages>(path==='/api/answer-sets'?10:20))throw Error('Library exceeds the bounded load limit. Narrow the collection before retrying.')
  const page=await call<{items:T[];nextCursor?:string}>(`${path}?limit=100${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`)
  if(!Array.isArray(page.items)||path==='/api/answer-sets'&&page.items.length>100)throw Error('Invalid library response.')
  items.push(...page.items);cursor=page.nextCursor
  if(items.length>(path==='/api/answer-sets'?1000:2000)||cursor&&seen.has(cursor))throw Error('Library exceeds the bounded load limit. Narrow the collection before retrying.')
  if(cursor)seen.add(cursor)
 }while(cursor)
 return items
}
