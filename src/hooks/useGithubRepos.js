import { useGithubData } from './useGithubData.js'
import { getUserRepos } from '../api/github.js'

export function useGithubRepos(username) {
  const enabled = Boolean(username)
  return useGithubData(
    enabled ? `repos:${username.toLowerCase()}` : null,
    ({ token, signal }) => getUserRepos(username, { token, signal }),
    { enabled, staleMs: 10 * 60 * 1000, deps: [username] },
  )
}
