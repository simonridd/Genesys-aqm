import { createHmac } from 'node:crypto'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { request } from 'node:https'
import { GoogleAuth } from 'google-auth-library'
import type { NotificationDelivery, NotificationDestination } from '../domain/notifications'
export class DeliveryError extends Error {constructor(public readonly code:string,public readonly transient=false){super(code)}}
export type SecretResolver=(reference:string)=>Promise<string>
export const secretReference=(value:unknown):value is string=>typeof value==='string'&&/^projects\/[a-z][a-z0-9-]{4,62}\/secrets\/aqm-notification-[a-zA-Z0-9_-]{1,100}\/versions\/(latest|[1-9][0-9]*)$/.test(value)
async function boundedToken(auth:GoogleAuth){let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([auth.getAccessToken(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new DeliveryError('SECRET_UNAVAILABLE',true)),5000)})])}finally{if(timer)clearTimeout(timer)}}
export function secretManagerResolver(project:string):SecretResolver {
 const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']})
 return async ref=>{
  if(!secretReference(ref)||!ref.startsWith(`projects/${project}/`))throw new DeliveryError('INVALID_SECRET_REFERENCE')
  try{const token=await boundedToken(auth);const r=await fetch(`https://secretmanager.googleapis.com/v1/${ref}:access`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(5000),redirect:'error'});if(!r.ok)throw new DeliveryError(r.status===429||r.status>=500?'SECRET_UNAVAILABLE':'SECRET_NOT_CONFIGURED',r.status===429||r.status>=500);const v=await r.json() as {payload?:{data?:string}};if(!v.payload?.data)throw new DeliveryError('SECRET_NOT_CONFIGURED');const secret=Buffer.from(v.payload.data,'base64').toString('utf8');if(!secret||secret.length>8192)throw new DeliveryError('INVALID_CONFIGURATION');return secret}catch(e){if(e instanceof DeliveryError)throw e;throw new DeliveryError('SECRET_UNAVAILABLE',true)}
 }
}
// Reject special IPv4 space as well as RFC1918. IPv6 allows only ordinary global unicast,
// excluding mapped/compatible addresses and transition mechanisms which can embed private IPv4.
export function publicAddress(address:string){
 if(isIP(address)===4){const [a,b,c]=address.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===2||b===88&&c===99)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113)}
 if(isIP(address)===6){const normalized=new URL(`https://[${address}]`).hostname.slice(1,-1),parts=normalized.split(':'),first=parseInt(parts[0],16),second=parseInt(parts[1]||'0',16);return first>=0x2000&&first<0x3fff&&first!==0x2002&&!(first===0x2001&&(second<0x200||second===0xdb8))}
 return false
}
export type Resolver=(hostname:string)=>Promise<Array<{address:string;family:number}>>
async function boundedDns(resolve:Resolver,host:string){let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([resolve(host),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new DeliveryError('DNS_TIMEOUT',true)),3000)})])}finally{if(timer)clearTimeout(timer)}}
export async function validateWebhookUrl(raw:string,resolve:Resolver=host=>lookup(host,{all:true})):Promise<{url:URL;address:string;family:number}>{
 let url:URL;try{url=new URL(raw)}catch{throw new DeliveryError('INVALID_URL')}
 const host=url.hostname.replace(/^\[|\]$/g,'').toLowerCase()
 if(url.protocol!=='https:'||url.username||url.password||url.hash||url.port&&url.port!=='443'||host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal')||host==='metadata.google.internal'||!host.includes('.')&&!isIP(host))throw new DeliveryError('UNSAFE_DESTINATION')
 let addresses:Array<{address:string;family:number}>
 try{addresses=isIP(host)?[{address:host,family:isIP(host)}]:await boundedDns(resolve,host)}catch(e){if(e instanceof DeliveryError)throw e;throw new DeliveryError('DNS_FAILURE',true)}
 if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new DeliveryError('UNSAFE_DESTINATION')
 return {url,address:addresses[0].address,family:addresses[0].family}
}
export interface SecureRequest {url:URL;address:string;family:number;body:string;headers:Record<string,string>}
export type Transport=(input:SecureRequest)=>Promise<number>
// The validated IP is pinned for this connection; TLS still verifies the original hostname.
// No redirects, no proxy, no connection pool reuse, bounded DNS/connect/total time and response bytes.
export const securePost:Transport=input=>new Promise((resolve,reject)=>{
 const req=request(input.url,{method:'POST',agent:false,family:input.family,lookup:(_hostname,_options,cb)=>cb(null,input.address,input.family),headers:{...input.headers,'Content-Type':'application/json','Content-Length':Buffer.byteLength(input.body)}},res=>{
  let bytes=0;res.on('data',chunk=>{bytes+=chunk.length;if(bytes>16384)req.destroy(new DeliveryError('RESPONSE_TOO_LARGE'))});res.on('end',()=>resolve(res.statusCode??500));res.on('error',()=>reject(new DeliveryError('CONNECTION_FAILURE',true)))
 })
 const total=setTimeout(()=>req.destroy(new DeliveryError('TIMEOUT',true)),15000)
 const connect=setTimeout(()=>req.destroy(new DeliveryError('CONNECT_TIMEOUT',true)),5000)
 req.on('socket',socket=>socket.once('secureConnect',()=>clearTimeout(connect)))
 req.on('close',()=>{clearTimeout(total);clearTimeout(connect)})
 req.on('error',e=>reject(e instanceof DeliveryError?e:new DeliveryError('CONNECTION_FAILURE',true)))
 req.end(input.body)
})
export function statusResult(status:number){if(status>=200&&status<300)return;if(status>=300&&status<400)throw new DeliveryError('REDIRECT_REJECTED');throw new DeliveryError(`HTTP_${status}`,status===429||status>=500)}
export interface NotificationProvider {send(destination:NotificationDestination,delivery:NotificationDelivery):Promise<void>}
export function webhookSignature(body:string,secret:string,timestamp:string){return `sha256=${createHmac('sha256',secret).update(`${timestamp}.${body}`).digest('hex')}`}
export class WebhookProvider implements NotificationProvider {
 constructor(private secrets:SecretResolver,private transport:Transport=securePost,private resolve?:Resolver,private now:()=>Date=()=>new Date()){}
 async send(d:NotificationDestination,delivery:NotificationDelivery){
  if(!d.configuration.urlSecretRef)throw new DeliveryError('INVALID_CONFIGURATION')
  const target=await validateWebhookUrl(await this.secrets(d.configuration.urlSecretRef),this.resolve),body=JSON.stringify(delivery.payload),timestamp=String(Math.floor(this.now().getTime()/1000))
  const headers:Record<string,string>={'X-AQM-Timestamp':timestamp,'Idempotency-Key':delivery.id}
  if(d.configuration.signingSecretRef)headers['X-AQM-Signature']=webhookSignature(body,await this.secrets(d.configuration.signingSecretRef),timestamp)
  statusResult(await this.transport({...target,body,headers}))
 }
}
export function renderEmail(delivery:NotificationDelivery){const p=delivery.payload,a=p.alert;return {subject:`[Genesys AQM] ${p.test?'TEST':p.event==='RESOLVED'?'RESOLVED':a?.severity} — ${p.test?'Test notification':a?.title}`,text:[p.test?'TEST NOTIFICATION — no OperationalAlert was created.':`Severity: ${a?.severity}`,`Alert: ${a?.title??'Test notification'} (${a?.id??delivery.id})`,`Event: ${p.event}`,`Policy: ${p.context.policyId??'—'}`,`Run: ${p.context.runId??'—'}`,`Occurred: ${p.occurredAt}`,`Summary: ${a?.message??'Genesys AQM notification destination test.'}`,'Open Settings or Overview & Runs: https://simonridd.github.io/Genesys-aqm/'].join('\n')}}
export interface EmailAdapter {send(input:{from:string;to:string[];subject:string;text:string;idempotencyKey:string;apiKey:string}):Promise<void>}
export class ResendAdapter implements EmailAdapter {
 constructor(private transport:Transport=securePost,private resolve?:Resolver){}
 async send(input:Parameters<EmailAdapter['send']>[0]){const target=await validateWebhookUrl('https://api.resend.com/emails',this.resolve);statusResult(await this.transport({...target,body:JSON.stringify({from:input.from,to:input.to,subject:input.subject,text:input.text}),headers:{Authorization:`Bearer ${input.apiKey}`,'Idempotency-Key':input.idempotencyKey}}))}
}
export class EmailProvider implements NotificationProvider {
 constructor(private secrets:SecretResolver,private adapter:EmailAdapter=new ResendAdapter()){}
 async send(d:NotificationDestination,delivery:NotificationDelivery){const c=d.configuration;if(c.provider!=='RESEND'||!c.from||!c.to?.length||!c.apiKeySecretRef)throw new DeliveryError('INVALID_CONFIGURATION');await this.adapter.send({from:c.from,to:c.to,...renderEmail(delivery),idempotencyKey:delivery.id,apiKey:await this.secrets(c.apiKeySecretRef)})}
}
