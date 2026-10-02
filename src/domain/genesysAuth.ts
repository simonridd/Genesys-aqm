import { settingsSection, settingsUrl, type SettingsSection } from './navigation'
import { publicGenesysConfig } from './publicConfig'
/** Browser-only Genesys Cloud code authorization with PKCE. */
export const REDIRECT_URI = 'https://simonridd.github.io/Genesys-aqm/'
export const REGIONS = {
  'eu-west-1': { label: 'EU (Ireland)', api: 'https://api.mypurecloud.ie', login: 'https://login.mypurecloud.ie' },
  'eu-central-1': { label: 'EU (Frankfurt)', api: 'https://api.mypurecloud.de', login: 'https://login.mypurecloud.de' },
  'us-east-1': { label: 'US East', api: 'https://api.mypurecloud.com', login: 'https://login.mypurecloud.com' },
  'us-west-2': { label: 'US West', api: 'https://api.usw2.pure.cloud', login: 'https://login.usw2.pure.cloud' },
  'ap-southeast-2': { label: 'Australia', api: 'https://api.mypurecloud.com.au', login: 'https://login.mypurecloud.com.au' },
  'ap-northeast-1': { label: 'Japan', api: 'https://api.mypurecloud.jp', login: 'https://login.mypurecloud.jp' },
} as const
export type Region = keyof typeof REGIONS
export type AuthConfig = { region: Region; clientId: string }
export type AuthSession = AuthConfig & { accessToken: string; expiresAt: number; userId?:string; organizationId?:string }
type Transaction = AuthConfig & { verifier: string; state: string; createdAt: number; page: string; settingsSection?:SettingsSection; evaluationId?: string }
const configKey = 'genesys-aqm-pkce-config'
const transactionKey = 'genesys-aqm-pkce-transaction'
let session: AuthSession | null = null
export const validRegion = (value: string): value is Region => Object.hasOwn(REGIONS, value)
export function getConfig(): AuthConfig { try { const value = JSON.parse(localStorage.getItem(configKey) ?? '{}') as AuthConfig; if (validRegion(value.region) && /^[\w-]{8,128}$/.test(value.clientId)) return {region:value.region,clientId:value.clientId} } catch { /* default */ } return { ...publicGenesysConfig } }
export function saveConfig(config: AuthConfig) { if (!validRegion(config.region) || !/^[\w-]{8,128}$/.test(config.clientId)) throw new Error('Enter a valid Genesys OAuth client ID and region.'); localStorage.setItem(configKey, JSON.stringify(config)) }
export function getSession(): AuthSession | null { if (session && session.expiresAt <= Date.now() + 30_000) session = null; return session }
const disconnectHandlers=new Set<(session:AuthSession|null)=>void>()
export function onDisconnect(handler:(session:AuthSession|null)=>void){disconnectHandlers.add(handler);return ()=>{disconnectHandlers.delete(handler)}}
export function disconnect() { const previous=session;session = null; if(typeof sessionStorage!=='undefined')sessionStorage.removeItem(transactionKey);for(const handler of disconnectHandlers)handler(previous) }
export function randomUrlSafe(bytes: number): string { const data = new Uint8Array(bytes); crypto.getRandomValues(data); return btoa(String.fromCharCode(...data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
export function generateVerifier() { return randomUrlSafe(64) }
export function generateState() { return randomUrlSafe(32) }
export async function challenge(verifier: string): Promise<string> { if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) throw new Error('Invalid PKCE verifier.'); const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)); return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
export function authorizationUrl(config: AuthConfig, codeChallenge: string, state: string, redirectUri = REDIRECT_URI) { if (!validRegion(config.region) || !/^[\w-]{8,128}$/.test(config.clientId) || !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge) || !/^[A-Za-z0-9_-]{43}$/.test(state)) throw new Error('Invalid OAuth request.'); const url = new URL('/oauth/authorize', REGIONS[config.region].login); url.search = new URLSearchParams({ response_type: 'code', client_id: config.clientId, redirect_uri: redirectUri, code_challenge: codeChallenge, code_challenge_method: 'S256', state }).toString(); return url.toString() }
export async function beginLogin(config: AuthConfig, page: string, redirectUri = REDIRECT_URI) { saveConfig(config); const verifier = generateVerifier(), state = generateState(); const url = authorizationUrl(config, await challenge(verifier), state, redirectUri); const evaluationId=new URL(window.location.href).searchParams.get('evaluationId');const transaction: Transaction = { ...config, verifier, state, createdAt: Date.now(), page,...(page==='settings'?{settingsSection:settingsSection(new URL(window.location.href).searchParams)}:{}),...(evaluationId&&/^[A-Za-z0-9_-]{1,180}$/.test(evaluationId)?{evaluationId}:{}) }; sessionStorage.setItem(transactionKey, JSON.stringify(transaction)); window.location.assign(url) }
export function parseCallback(url: URL): { code: string; state: string } | null { const params = url.searchParams; if (!params.has('code') && !params.has('error') && !params.has('state')) return null; if (params.has('error')) throw new Error('Genesys authorization was declined or failed.'); if (params.getAll('code').length !== 1 || params.getAll('state').length !== 1 || !params.get('code') || !params.get('state')) throw new Error('Invalid Genesys authorization response.'); return { code: params.get('code')!, state: params.get('state')! } }
export function cleanCallbackUrl(url: URL) { const clean = new URL(url); for (const key of ['code','state','error','error_description','session_state']) clean.searchParams.delete(key); return clean.pathname + clean.search + clean.hash }
export async function completeCallback(url = new URL(window.location.href), redirectUri = REDIRECT_URI): Promise<string | null> {
  let callback: ReturnType<typeof parseCallback>
  try { callback = parseCallback(url) } catch { sessionStorage.removeItem(transactionKey); throw new Error('Invalid Genesys authorization response. Connect again.') } finally { if (url.searchParams.has('code') || url.searchParams.has('error') || url.searchParams.has('state')) history.replaceState(null, '', cleanCallbackUrl(url)) }
  if (!callback) return null
  const raw = sessionStorage.getItem(transactionKey); sessionStorage.removeItem(transactionKey)
  let transaction: Transaction
  try { transaction = JSON.parse(raw ?? '') as Transaction } catch { throw new Error('Genesys login session is missing. Connect again.') }
  if (!validRegion(transaction.region) || !/^[\w-]{8,128}$/.test(transaction.clientId) || !/^[A-Za-z0-9._~-]{43,128}$/.test(transaction.verifier) || !/^[A-Za-z0-9_-]{43}$/.test(transaction.state) || transaction.state !== callback.state || Date.now() - transaction.createdAt > 600_000 || transaction.createdAt > Date.now()) throw new Error('Genesys login state is invalid or expired. Connect again.')
  const response = await fetch(new URL('/oauth/token', REGIONS[transaction.region].login), { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: transaction.clientId, code: callback.code, redirect_uri: redirectUri, code_verifier: transaction.verifier }) })
  if (!response.ok) throw new Error(`Genesys token exchange failed (HTTP ${response.status}).`)
  const data = await response.json() as { access_token?: string; expires_in?: number; token_type?: string }
  if (!data.access_token || data.token_type?.toLowerCase() !== 'bearer' || !Number.isFinite(data.expires_in) || data.expires_in! <= 0) throw new Error('Genesys returned an invalid token response.')
  session = { region: transaction.region, clientId: transaction.clientId, accessToken: data.access_token, expiresAt: Date.now() + data.expires_in! * 1000 }
  try { const reply=await fetch(`${REGIONS[session.region].api}/api/v2/users/me`,{headers:{Authorization:`Bearer ${session.accessToken}`}});if(reply.ok){const user=await reply.json() as {id?:string;organization?:{id?:string}};session.userId=user.id;session.organizationId=user.organization?.id} }catch{ /* Browsing remains available; cache requires a verified identity. */ }
  if(transaction.evaluationId&&/^[A-Za-z0-9_-]{1,180}$/.test(transaction.evaluationId)){const link=new URL(cleanCallbackUrl(url),url);link.searchParams.set('page','evaluations');link.searchParams.set('evaluationSource','server');link.searchParams.set('evaluationId',transaction.evaluationId);history.replaceState(null,'',link.pathname+link.search);return 'evaluations'}
  if(transaction.page==='settings'){const query=new URLSearchParams({settingsSection:transaction.settingsSection??'connection'});history.replaceState(null,'',settingsUrl(new URL(cleanCallbackUrl(url),url),settingsSection(query)))}
  return transaction.page
}
