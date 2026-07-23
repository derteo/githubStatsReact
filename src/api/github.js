const API_BASE = 'https://api.github.com'

export class GithubApiError extends Error {
  constructor(message, { status, rateLimit } = {}) {
    super(message)
    this.name = 'GithubApiError'
    this.status = status
    this.rateLimit = rateLimit
    this.isRateLimited = status === 403 && rateLimit?.remaining === 0
    this.isNotFound = status === 404
  }
}

function parseRateLimit(headers) {
  const limit = headers.get('x-ratelimit-limit')
  if (limit === null) return null
  return {
    limit: Number(limit),
    remaining: Number(headers.get('x-ratelimit-remaining')),
    reset: Number(headers.get('x-ratelimit-reset')),
    used: Number(headers.get('x-ratelimit-used')),
  }
}

async function request(path, { token, signal, params, accept } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  const headers = {
    Accept: accept || 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, { headers, signal })
  const rateLimit = parseRateLimit(res.headers)

  if (!res.ok) {
    let message = `GitHub API error (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      /* response had no JSON body */
    }
    throw new GithubApiError(message, { status: res.status, rateLimit })
  }

  const data = accept?.includes('raw') ? await res.text() : await res.json()
  return { data, rateLimit }
}

export const searchUsers = (q, opts) =>
  request('/search/users', { ...opts, params: { q, per_page: 6, ...opts?.params } })

export const getUser = (username, opts) => request(`/users/${username}`, opts)

export const getUserRepos = (username, opts) =>
  request(`/users/${username}/repos`, {
    ...opts,
    params: { per_page: 100, sort: 'updated', ...opts?.params },
  })

export const getRepoLanguages = (owner, repo, opts) =>
  request(`/repos/${owner}/${repo}/languages`, opts)

export const getUserEvents = (username, opts) =>
  request(`/users/${username}/events/public`, { ...opts, params: { per_page: 100, ...opts?.params } })

export const getRepoContributors = (owner, repo, opts) =>
  request(`/repos/${owner}/${repo}/contributors`, { ...opts, params: { per_page: 20, ...opts?.params } })

export const getRepoIssues = (owner, repo, opts) =>
  request(`/repos/${owner}/${repo}/issues`, {
    ...opts,
    params: { state: 'open', per_page: 10, ...opts?.params },
  })

export const getRepoCommits = (owner, repo, opts) =>
  request(`/repos/${owner}/${repo}/commits`, { ...opts, params: { per_page: 10, ...opts?.params } })

export const getRepoReadme = (owner, repo, opts) =>
  request(`/repos/${owner}/${repo}/readme`, { ...opts, accept: 'application/vnd.github.raw' })
