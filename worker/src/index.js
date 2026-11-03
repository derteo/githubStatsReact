// Proxy per le API pubbliche di GitHub: tiene il token lato server (come segreto di Cloudflare)
// così i visitatori usano il limite da 5000 richieste/ora senza dover creare un loro token.
//
// Solo richieste GET verso un elenco di endpoint di sola lettura, solo dai siti elencati in
// ALLOWED_ORIGINS. Le risposte buone sono messe in cache per CACHE_SECONDS per risparmiare quota.

const API = 'https://api.github.com'
const CACHE_SECONDS = 300

const NAME = String.raw`[\w.-]+`
const ALLOWED_PATHS = [
  /^\/search\/users$/,
  new RegExp(`^/users/${NAME}$`),
  new RegExp(`^/users/${NAME}/repos$`),
  new RegExp(`^/users/${NAME}/events/public$`),
  new RegExp(`^/repos/${NAME}/${NAME}/(languages|contributors|issues|commits|readme)$`),
]

const ACCEPT_OK = ['application/vnd.github+json', 'application/vnd.github.raw']
const EXPOSED = 'x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset, x-ratelimit-used'

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Expose-Headers': EXPOSED,
    Vary: 'Origin',
  }
}

function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...(origin ? corsHeaders(origin) : {}) },
  })
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin')
    const allowed = allowedOrigins(env)

    // I browser mandano sempre Origin nelle richieste tra siti diversi: se non è un sito nostro, no.
    if (origin && !allowed.includes(origin)) return json(403, { message: 'Origin not allowed' })

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...(origin ? corsHeaders(origin) : {}),
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Accept, X-GitHub-Api-Version',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
    if (request.method !== 'GET') return json(405, { message: 'Only GET is supported' }, origin)

    const url = new URL(request.url)
    if (!ALLOWED_PATHS.some((re) => re.test(url.pathname))) {
      return json(404, { message: 'Endpoint not available through this proxy' }, origin)
    }

    const accept = request.headers.get('Accept') || ACCEPT_OK[0]
    if (!ACCEPT_OK.includes(accept)) return json(400, { message: 'Unsupported Accept header' }, origin)

    const upstreamUrl = `${API}${url.pathname}${url.search}`
    // la stessa URL con Accept diversi (README grezzo o JSON) è un contenuto diverso
    const cacheKey = new Request(`${upstreamUrl}${url.search ? '&' : '?'}__accept=${encodeURIComponent(accept)}`)
    const cache = typeof caches !== 'undefined' ? caches.default : null

    let upstream = cache ? await cache.match(cacheKey) : null
    if (!upstream) {
      const headers = {
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'githubStatsReact-proxy',
      }
      if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`
      const fresh = await fetch(upstreamUrl, { headers })
      upstream = new Response(fresh.body, fresh)
      if (fresh.ok && cache) {
        const toCache = new Response(upstream.clone().body, upstream)
        toCache.headers.set('Cache-Control', `public, max-age=${CACHE_SECONDS}`)
        ctx.waitUntil(cache.put(cacheKey, toCache))
      }
    }

    const out = new Response(upstream.body, upstream)
    for (const h of ['Set-Cookie', 'Set-Cookie2']) out.headers.delete(h)
    out.headers.set('Cache-Control', 'no-store')
    if (origin) for (const [k, v] of Object.entries(corsHeaders(origin))) out.headers.set(k, v)
    return out
  },
}
