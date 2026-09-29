/** Genesys routes are isolated from the existing Jev relay. Never return OAuth tokens or transcript URLs. */
export interface GenesysEnv { GENESYS_REGION?: string; GENESYS_CLIENT_ID?: string; GENESYS_CLIENT_SECRET?: string; AQM_ACCESS_KEY?: string }
type UpstreamFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
const hosts = new Set(['mypurecloud.com','mypurecloud.ie','mypurecloud.de','mypurecloud.jp','mypurecloud.com.au','usw2.pure.cloud','cac1.pure.cloud','euw2.pure.cloud','aps1.pure.cloud','apne2.pure.cloud','sae1.pure.cloud'])
const response = (status: number, value: unknown, headers: Headers) => new Response(JSON.stringify(value), { status, headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' } })
const fail = (status: number, error: string, headers: Headers) => response(status, { error }, headers)
const configured = (env: GenesysEnv) => !!(env.GENESYS_REGION && hosts.has(env.GENESYS_REGION) && env.GENESYS_CLIENT_ID && env.GENESYS_CLIENT_SECRET && env.AQM_ACCESS_KEY)
const validId = (id: string) => /^[a-f0-9-]{20,64}$/i.test(id)
async function token(env: GenesysEnv, upstreamFetch: UpstreamFetch): Promise<string> {
  const login = await upstreamFetch(`https://login.${env.GENESYS_REGION}/oauth/token`, { method: 'POST', redirect: 'manual', headers: { Authorization: `Basic ${btoa(`${env.GENESYS_CLIENT_ID}:${env.GENESYS_CLIENT_SECRET}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' })
  if (!login.ok) throw new Error(`Genesys authentication failed (HTTP ${login.status}).`)
  const payload = await login.json() as { access_token?: string }
  if (!payload.access_token) throw new Error('Genesys returned no access token.')
  return payload.access_token
}
async function api(env: GenesysEnv, path: string, accessToken: string, upstreamFetch: UpstreamFetch, body?: unknown): Promise<unknown> {
  const result = await upstreamFetch(`https://api.${env.GENESYS_REGION}${path}`, { method: body ? 'POST' : 'GET', redirect: 'manual', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
  if (!result.ok) throw new Error(`Genesys API returned HTTP ${result.status}. Check integration roles and division access.`)
  return result.json()
}
async function enrichQueues(details: Array<{ participants?: Array<{ sessions?: Array<{ segments?: Array<{ queueId?: string }> }> }> }>, env: GenesysEnv, accessToken: string, upstreamFetch: UpstreamFetch) {
  const ids = [...new Set(details.flatMap(d => d.participants?.flatMap(p => p.sessions?.flatMap(s => s.segments?.map(g => g.queueId).filter((id): id is string => !!id) ?? []) ?? []) ?? []))].slice(0,25)
  const queueNames: Record<string,string> = {}
  for (const id of ids) {
    if (!validId(id)) continue
    try { const queue = await api(env, `/api/v2/routing/queues/${id}`, accessToken, upstreamFetch) as { name?: string }; if (queue.name) queueNames[id] = queue.name } catch { /* Queue name is optional; retain the ID. */ }
  }
  return details.map(d => ({...d, queueNames}))
}
export async function handleGenesys(request: Request, env: GenesysEnv, cors: Headers, upstreamFetch: UpstreamFetch = fetch): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (!env.AQM_ACCESS_KEY || request.headers.get('X-AQM-Access-Key') !== env.AQM_ACCESS_KEY) return fail(401, 'AQM access key is missing or invalid.', cors)
  if (!configured(env)) return response(200, { state: 'not-configured', detail: 'Genesys Worker secrets are not provisioned.' }, cors)
  const url = new URL(request.url)
  if (url.pathname === '/v1/genesys/status') {
    if (request.method !== 'GET') return fail(405, 'Use GET.', cors)
    try { await token(env, upstreamFetch); return response(200, { state: 'connected', region: env.GENESYS_REGION, clientId: env.GENESYS_CLIENT_ID }, cors) }
    catch (e) { return response(200, { state: 'error', detail: e instanceof Error ? e.message : 'Connection error' }, cors) }
  }
  if (url.pathname === '/v1/genesys/conversations/search') {
    if (request.method !== 'POST') return fail(405, 'Use POST.', cors)
    let query: { from?: string; to?: string; page?: number; pageSize?: number; queue?: string; agent?: string; channel?: string; direction?: string }
    try { query = await request.json() as typeof query } catch { return fail(400, 'Invalid search request.', cors) }
    const from = Date.parse(query.from ?? ''), to = Date.parse(query.to ?? '')
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from || to > Date.now() + 60_000 || to - from > 7 * 86400_000) return fail(400, 'Select a past range of at most seven days.', cors)
    const page = query.page ?? 1, pageSize = query.pageSize ?? 10
    if (!Number.isInteger(page) || page < 1 || page > 20 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 25) return fail(400, 'Invalid page or page size.', cors)
    const predicates = [query.queue && { dimension: 'queueId', value: query.queue }, query.agent && { dimension: 'userId', value: query.agent }, query.channel && { dimension: 'mediaType', value: query.channel === 'messaging' ? 'message' : query.channel }, query.direction && { dimension: 'direction', value: query.direction }].filter(Boolean)
    try {
      const accessToken = await token(env, upstreamFetch)
      const result = await api(env, '/api/v2/analytics/conversations/details/query', accessToken, upstreamFetch, { interval: `${new Date(from).toISOString()}/${new Date(to).toISOString()}`, order: 'desc', orderBy: 'conversationStart', paging: { pageSize, pageNumber: page }, ...(predicates.length ? { segmentFilters: [{ type: 'and', predicates }] } : {}) }) as { conversations?: unknown[]; totalHits?: number }
      const completed = (result.conversations ?? []).filter((c): c is { conversationEnd: string } => !!c && typeof c === 'object' && !!(c as { conversationEnd?: string }).conversationEnd)
      const conversations = await enrichQueues(completed, env, accessToken, upstreamFetch)
      return response(200, { conversations, total: result.totalHits ?? conversations.length, hasMore: (result.conversations?.length ?? 0) === pageSize }, cors)
    } catch (e) { return fail(502, e instanceof Error ? e.message : 'Genesys search failed.', cors) }
  }
  const match = /^\/v1\/genesys\/conversations\/([^/]+)$/.exec(url.pathname)
  if (match) {
    if (request.method !== 'GET') return fail(405, 'Use GET.', cors)
    const id = decodeURIComponent(match[1])
    if (!validId(id)) return fail(400, 'Invalid conversation ID.', cors)
    try {
      const accessToken = await token(env, upstreamFetch)
      const rawDetail = await api(env, `/api/v2/analytics/conversations/${id}/details`, accessToken, upstreamFetch) as { participants?: Array<{ sessions?: Array<{ sessionId?: string; mediaType?: string; segments?: Array<{ queueId?: string }> }> }> }
      const detail = (await enrichQueues([rawDetail], env, accessToken, upstreamFetch))[0]
      const session = detail.participants?.flatMap(p => p.sessions ?? []).find(s => s.sessionId && ['message','chat','email','voice'].includes((s.mediaType ?? '').toLowerCase()))
      let transcript: unknown = null
      if (session?.sessionId) {
        try {
          const location = await api(env, `/api/v2/speechandtextanalytics/conversations/${id}/communications/${encodeURIComponent(session.sessionId)}/transcripturl`, accessToken, upstreamFetch) as { url?: string }
          if (location.url) {
            const signed = new URL(location.url)
            if (signed.protocol !== 'https:' || !(signed.hostname === 's3.amazonaws.com' || signed.hostname.endsWith('.amazonaws.com') || signed.hostname.endsWith('.cloudfront.net'))) throw new Error('Unexpected transcript host.')
            const download = await upstreamFetch(signed.toString(), { redirect: 'manual' })
            if (download.ok && Number(download.headers.get('Content-Length') ?? 0) < 5_000_000) {
              const bytes = await download.arrayBuffer()
              if (bytes.byteLength < 5_000_000) transcript = JSON.parse(new TextDecoder().decode(bytes)) as unknown
            }
          }
        } catch { /* Transcript can be absent; never fabricate it. */ }
      }
      return response(200, { detail, transcript }, cors)
    } catch (e) { return fail(502, e instanceof Error ? e.message : 'Genesys retrieval failed.', cors) }
  }
  return fail(404, 'Endpoint not found.', cors)
}
