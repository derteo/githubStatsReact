import { useGithubData } from './useGithubData.js'
import { getUserEvents } from '../api/github.js'

export function useGithubEvents(username) {
  const enabled = Boolean(username)
  return useGithubData(
    enabled ? `events:${username.toLowerCase()}` : null,
    ({ token, signal }) => getUserEvents(username, { token, signal }),
    { enabled, staleMs: 5 * 60 * 1000, deps: [username] },
  )
}
