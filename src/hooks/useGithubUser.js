import { useGithubData } from './useGithubData.js'
import { getUser } from '../api/github.js'

export function useGithubUser(username) {
  const enabled = Boolean(username)
  return useGithubData(
    enabled ? `user:${username.toLowerCase()}` : null,
    ({ token, signal }) => getUser(username, { token, signal }),
    { enabled, staleMs: 10 * 60 * 1000, deps: [username] },
  )
}
