// Prove locali del proxy (senza token: usa il limite anonimo di GitHub). Esegui: node worker/test.mjs
import assert from 'node:assert/strict'
import worker from './src/index.js'

const env = { ALLOWED_ORIGINS: 'https://stats.matteeoderosa.it,http://localhost:5173' }
const ctx = { waitUntil() {} }
const ORIGIN = 'https://stats.matteeoderosa.it'
const call = (path, init = {}) => worker.fetch(new Request(`https://proxy.test${path}`, init), env, ctx)

// 1. un utente reale passa, con CORS e intestazioni del limite
let res = await call('/users/octocat', { headers: { Origin: ORIGIN, Accept: 'application/vnd.github+json' } })
assert.equal(res.status, 200)
assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN)
assert.match(res.headers.get('access-control-expose-headers'), /x-ratelimit-remaining/)
assert.ok(res.headers.get('x-ratelimit-limit'))
assert.equal((await res.json()).login, 'octocat')

// 2. la ricerca con parametri passa
res = await call('/search/users?q=octo&per_page=2', { headers: { Origin: ORIGIN } })
assert.equal(res.status, 200)
assert.ok(Array.isArray((await res.json()).items))

// 3. README grezzo
res = await call('/repos/octocat/Hello-World/readme', { headers: { Origin: ORIGIN, Accept: 'application/vnd.github.raw' } })
assert.equal(res.status, 200)
assert.match(await res.text(), /Hello/)

// 4. un sito non autorizzato è rifiutato
res = await call('/users/octocat', { headers: { Origin: 'https://evil.example' } })
assert.equal(res.status, 403)

// 5. endpoint non in elenco, e metodi diversi da GET
assert.equal((await call('/user', { headers: { Origin: ORIGIN } })).status, 404)
assert.equal((await call('/repos/octocat/Hello-World/issues/1/comments', { headers: { Origin: ORIGIN } })).status, 404)
assert.equal((await call('/users/octocat', { method: 'POST', headers: { Origin: ORIGIN } })).status, 405)

// 6. preflight
res = await call('/users/octocat', {
  method: 'OPTIONS',
  headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'accept,x-github-api-version' },
})
assert.equal(res.status, 204)
assert.match(res.headers.get('access-control-allow-headers'), /X-GitHub-Api-Version/)

// 7. 404 di GitHub arriva com'è (l'app lo usa per "utente non trovato")
res = await call('/users/this-user-does-not-exist-zzzz-9', { headers: { Origin: ORIGIN } })
assert.equal(res.status, 404)

// 8. Accept strano rifiutato
assert.equal((await call('/users/octocat', { headers: { Origin: ORIGIN, Accept: 'text/html' } })).status, 400)

console.log('proxy: tutte le prove passate')
