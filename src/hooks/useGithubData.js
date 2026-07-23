import { useEffect, useState } from 'react'
import { useGithub } from '../context/GithubContext.jsx'
import { getCached, setCached } from '../utils/cache.js'

/**
 * Generic fetch/useEffect/useState data hook shared by all GitHub API calls.
 * Reads a fresh localStorage cache entry before hitting the network, and
 * reports rate-limit headers back to GithubContext so the UI can warn early.
 */
export function useGithubData(
  cacheKey,
  fetcher,
  { enabled = true, staleMs = 5 * 60 * 1000, deps = [], trackRateLimit = true } = {},
) {
  const { token, recordRateLimit } = useGithub()
  const [state, setState] = useState({ data: null, error: null, loading: enabled })

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function run() {
      if (!enabled) {
        setState({ data: null, error: null, loading: false })
        return
      }

      const cached = cacheKey ? getCached(cacheKey, staleMs) : null
      if (cached) {
        setState({ data: cached, error: null, loading: false })
        return
      }

      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const { data, rateLimit } = await fetcher({ token, signal: controller.signal })
        if (cancelled) return
        if (rateLimit && trackRateLimit) recordRateLimit(rateLimit)
        if (cacheKey) setCached(cacheKey, data)
        setState({ data, error: null, loading: false })
      } catch (err) {
        if (cancelled || err.name === 'AbortError') return
        if (err.rateLimit && trackRateLimit) recordRateLimit(err.rateLimit)
        setState({ data: null, error: err, loading: false })
      }
    }

    run()
    return () => {
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, enabled, token, ...deps])

  return state
}
