import { useEffect, useState } from 'react'
import { useGithub } from '../context/GithubContext.jsx'
import { getRepoLanguages } from '../api/github.js'
import { getCached, setCached } from '../utils/cache.js'
import { aggregateLanguages } from '../utils/languages.js'

const MAX_REPOS = 30 // caps the extra per-repo calls this fan-out costs against the rate limit

/**
 * Aggregates languages (weighted by bytes) across a user's most-starred,
 * non-fork repos. Each /languages call is cached for an hour since language
 * mix rarely changes between visits.
 */
export function useAggregatedLanguages(username, repos) {
  const { token, recordRateLimit } = useGithub()
  const [state, setState] = useState({ data: null, error: null, loading: false })

  const targets = repos
    ? [...repos]
        .filter((r) => !r.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, MAX_REPOS)
    : null

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function run() {
      if (!targets) {
        setState({ data: null, error: null, loading: false })
        return
      }
      if (targets.length === 0) {
        setState({ data: [], error: null, loading: false })
        return
      }

      setState((prev) => ({ ...prev, loading: true, error: null }))
      const outcomes = await Promise.allSettled(
        targets.map(async (repo) => {
          const cacheKey = `languages:${repo.full_name}`
          const cached = getCached(cacheKey, 60 * 60 * 1000)
          if (cached) return cached
          const { data, rateLimit } = await getRepoLanguages(repo.owner.login, repo.name, {
            token,
            signal: controller.signal,
          })
          if (rateLimit) recordRateLimit(rateLimit)
          setCached(cacheKey, data)
          return data
        }),
      )
      if (cancelled) return

      const fulfilled = outcomes.filter((o) => o.status === 'fulfilled').map((o) => o.value)
      if (fulfilled.length === 0 && outcomes.length > 0) {
        const firstError = outcomes.find((o) => o.status === 'rejected')?.reason
        setState({ data: null, error: firstError, loading: false })
        return
      }
      setState({ data: aggregateLanguages(fulfilled), error: null, loading: false })
    }

    run()
    return () => {
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, targets?.map((r) => r.id).join(','), token])

  return { ...state, sampledCount: targets?.length ?? 0 }
}
