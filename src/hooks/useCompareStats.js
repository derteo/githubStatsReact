import { useGithubUser } from './useGithubUser.js'
import { useGithubRepos } from './useGithubRepos.js'
import { useAggregatedLanguages } from './useAggregatedLanguages.js'

export function useCompareStats(username) {
  const { data: profile, loading: profileLoading, error: profileError } = useGithubUser(username)
  const { data: repos, loading: reposLoading, error: reposError } = useGithubRepos(username)
  const { data: languages } = useAggregatedLanguages(username, repos)

  const totalStars = repos ? repos.reduce((sum, r) => sum + r.stargazers_count, 0) : null
  const totalForks = repos ? repos.reduce((sum, r) => sum + r.forks_count, 0) : null
  const topLanguage = languages && languages.length > 0 ? languages[0].name : null

  return {
    profile,
    totalStars,
    totalForks,
    topLanguage,
    loading: Boolean(username) && (profileLoading || reposLoading),
    error: profileError || reposError,
  }
}
