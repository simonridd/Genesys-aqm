/** Fixed-purpose Jev relay for the static Genesys AQM prototype. No credentials are stored here. */
import { handleGenesys, type GenesysEnv } from './genesys'
const TYPESAFE_URL = 'https://api.typesafe.ai/v1/systemone'
const ALLOWED_ORIGINS = new Set([
  'https://simonridd.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])
const MAX_BODY_BYTES = 1_500_000

type UpstreamFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
const json = (status: number, error: string, headers: Headers) =>
  new Response(JSON.stringify({ error }), { status, headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' } })

export async function handleRequest(request: Request, upstreamFetch: UpstreamFetch = fetch, env: GenesysEnv = {}): Promise<Response> {
  const origin = request.headers.get('Origin')
  const cors = new Headers({ Vary: 'Origin', 'Cache-Control': 'no-store' })
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return json(403, 'Origin is not allowed.', cors)
  cors.set('Access-Control-Allow-Origin', origin)
  cors.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  cors.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-AQM-Access-Key')
  cors.set('Access-Control-Max-Age', '86400')

  const url = new URL(request.url)
  if (url.pathname.startsWith('/v1/genesys/')) return handleGenesys(request, env, cors, upstreamFetch)
  if (url.pathname !== '/v1/systemone') return json(404, 'Endpoint not found.', cors)
  if (request.method === 'OPTIONS') {
    if (request.headers.get('Access-Control-Request-Method') !== 'POST') return json(405, 'Only POST is supported.', cors)
    return new Response(null, { status: 204, headers: cors })
  }
  if (request.method !== 'POST') return json(405, 'Only POST is supported.', cors)
  const authorization = request.headers.get('Authorization')
  if (!authorization || !/^Bearer \S+$/.test(authorization)) return json(401, 'A TypeSafe bearer key is required.', cors)
  if (!(request.headers.get('Content-Type') ?? '').toLowerCase().startsWith('application/json')) return json(415, 'Expected application/json.', cors)
  const statedLength = Number(request.headers.get('Content-Length'))
  if (Number.isFinite(statedLength) && statedLength > MAX_BODY_BYTES) return json(413, 'Evaluation request is too large.', cors)
  let bytes: ArrayBuffer
  try { bytes = await request.arrayBuffer() } catch { return json(400, 'Could not read request.', cors) }
  if (bytes.byteLength > MAX_BODY_BYTES) return json(413, 'Evaluation request is too large.', cors)
  let payload: unknown
  try { payload = JSON.parse(new TextDecoder().decode(bytes)) as unknown } catch { return json(400, 'Invalid JSON.', cors) }
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return json(400, 'Expected a Jev request object.', cors)
  const body = payload as Record<string, unknown>
  if (body.model !== 'jev-latest' || !('state' in body) || typeof body.questions !== 'object' || body.questions === null || Array.isArray(body.questions) || Object.keys(body.questions).length === 0 || Object.keys(body.questions).length > 100) return json(400, 'Invalid Jev request shape.', cors)

  try {
    const upstream = await upstreamFetch(TYPESAFE_URL, {
      method: 'POST', redirect: 'manual',
      headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body: bytes,
    })
    if (upstream.status >= 300 && upstream.status < 400) return json(502, 'TypeSafe redirected the request unexpectedly.', cors)
    const resultHeaders = new Headers(cors)
    resultHeaders.set('Content-Type', upstream.headers.get('Content-Type') ?? 'application/json')
    return new Response(upstream.body, { status: upstream.status, headers: resultHeaders })
  } catch {
    return json(502, 'The proxy could not reach TypeSafe.', cors)
  }
}

// Cloudflare passes (request, env, context) to this entrypoint. Keep the
// injected fetch argument above for tests without treating env as a function.
export default { fetch(request: Request, env?: GenesysEnv, _context?: unknown) { return handleRequest(request, fetch, env) } }
