import type { Conversation, Option, Scorecard } from './types'

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const iso = (value: unknown): value is string => nonempty(value) && !Number.isNaN(Date.parse(value))
const key = (value: unknown): value is string => nonempty(value) && /^[a-z][a-z0-9_]*$/.test(value)

export function validateConversation(value: unknown): { value?: Conversation; errors: string[] } {
  const errors: string[] = []
  if (!object(value)) return { errors: ['The file must contain one JSON conversation object.'] }
  for (const field of ['conversationId', 'channel'] as const) if (!nonempty(value[field])) errors.push(`${field} must be a non-empty string.`)
  if (!iso(value.startedAt)) errors.push('startedAt must be a valid date/time.')
  for (const role of ['agent', 'customer'] as const) {
    const participant = value[role]
    if (!object(participant) || !nonempty(participant.id) || !nonempty(participant.name)) errors.push(`${role} needs a non-empty id and name.`)
  }
  if (!object(value.metadata) || Object.values(value.metadata).some(v => typeof v !== 'string')) errors.push('metadata must be an object of string values.')
  if (!Array.isArray(value.messages) || value.messages.length === 0) errors.push('messages must contain at least one message.')
  else {
    const ids = new Set<string>()
    value.messages.forEach((message, i) => {
      if (!object(message)) { errors.push(`Message ${i + 1} must be an object.`); return }
      if (!nonempty(message.id)) errors.push(`Message ${i + 1} needs an id.`)
      else if (ids.has(message.id)) errors.push(`Message ${i + 1} has a duplicate id.`)
      else ids.add(message.id)
      if (!iso(message.timestamp)) errors.push(`Message ${i + 1} needs a valid timestamp.`)
      if (!['agent','customer','bot','system'].includes(String(message.speaker))) errors.push(`Message ${i + 1} speaker must be agent, customer, bot or system.`)
      if (!nonempty(message.text)) errors.push(`Message ${i + 1} needs text.`)
    })
  }
  return errors.length ? { errors } : { errors, value: value as unknown as Conversation }
}

export function parseConversationJson(text: string) {
  try { return validateConversation(JSON.parse(text) as unknown) }
  catch { return { errors: ['This file is not valid JSON. Check its syntax and try again.'] } }
}

export function validateScorecard(card: Scorecard): string[] {
  const errors: string[] = []
  if (!nonempty(card.title)) errors.push('Give the scorecard a title.')
  if (!Number.isFinite(card.threshold) || card.threshold < 0 || card.threshold > 1) errors.push('Yes threshold must be between 0 and 1.')
  if (!card.items.some(item => item.enabled)) errors.push('Enable at least one question.')
  const ids = new Set<string>()
  card.items.forEach((item, i) => {
    const where = `Question ${i + 1}`
    if(item.sourceAnswerSet){const p=item.sourceAnswerSet;if(!['choice','score'].includes(item.type)||![p.familyId,p.answerSetId].every(v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(v))||!Number.isInteger(p.answerSetVersion)||p.answerSetVersion<1)errors.push(`${where} has invalid Answer Set provenance.`)}
    if (item.enabled && !['noul', 'choice', 'score'].includes(item.type)) errors.push(`${where} has unsupported question semantics.`)
    if (!key(item.id)) errors.push(`${where} ID must use lowercase letters, numbers and underscores, starting with a letter.`)
    if (ids.has(item.id)) errors.push(`${where} has a duplicate ID.`)
    ids.add(item.id)
    if (!nonempty(item.title) || !nonempty(item.instructions)) errors.push(`${where} needs a title and instructions.`)
    if (!Number.isFinite(item.weight) || item.weight < 0) errors.push(`${where} weight must be zero or greater.`)
    if (item.type === 'choice' || item.type === 'score') {
      errors.push(...validateOptions(item.type,item.options,where))
    }
  })
  return errors
}

/** Shared authoring contract for inline questions and reusable answers. Array order is semantic. */
export function validateOptions(type:'choice'|'score',options:Option[],where='Answer set',sourceValues=false):string[] {
 const errors:string[]=[]
 if(!Array.isArray(options))return [`${where} options must be an array.`]
 if(options.length<2||options.length>(type==='score'?10:255))errors.push(`${where} needs 2–${type==='score'?'10':'255'} options.`)
 const keys=new Set<string>()
 options.forEach((option,j)=>{
  if(!object(option)){errors.push(`${where} option ${j+1} must be an object.`);return}
  if(!key(option.key)||!nonempty(option.label)||!nonempty(option.description))errors.push(`${where} option ${j+1} needs a valid key, label and description.`)
  if(keys.has(option.key))errors.push(`${where} has duplicate option keys.`)
  keys.add(option.key)
  if(option.credit!==undefined&&(!Number.isFinite(option.credit)||option.credit<0||option.credit>1))errors.push(`${where} option ${j+1} credit must be between 0 and 1.`)
  if(sourceValues&&option.sourceValue!==undefined&&!Number.isFinite(option.sourceValue))errors.push(`${where} option ${j+1} source value must be finite.`)
 })
 return errors
}
