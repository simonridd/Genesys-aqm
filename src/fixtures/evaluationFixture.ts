import { fromJevResponse } from '../provider/jev'
import type { EvaluationRequest } from '../domain/types'
/** Deterministic provider response, with complete typed answers for the actual requested subset. */
export function fixtureEvaluation(request:EvaluationRequest){
  return fromJevResponse(request,{model:'fixture',answers:Object.fromEntries(request.scorecard.items.filter(q=>q.enabled).map(q=>{
    if(q.type==='noul')return [q.id,{type:q.type,noul:.9}]
    if(q.type==='choice')return [q.id,{type:q.type,choice:q.options[0].key,confidence:.9,probabilities:Object.fromEntries(q.options.map((o,i)=>[o.key,i===0?1:0]))}]
    return [q.id,{type:q.type,score:q.options.length-1,confidence:.9,probabilities:Object.fromEntries(q.options.map((_,i)=>[String(i),i===q.options.length-1?1:0]))}]
  }))})
}
