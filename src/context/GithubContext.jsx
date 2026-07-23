import { createContext, useCallback, useContext, useState } from 'react'

const TOKEN_KEY = 'gh_pat_token'
const GithubContext = createContext(null)

export function GithubProvider({ children }) {
  const [token, setTokenState] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '')
  const [rateLimit, setRateLimit] = useState(null)

  const setToken = useCallback((value) => {
    setTokenState(value)
    if (value) {
      sessionStorage.setItem(TOKEN_KEY, value)
    } else {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  }, [])

  const recordRateLimit = useCallback((info) => {
    if (info) setRateLimit(info)
  }, [])

  const value = {
    token,
    setToken,
    hasToken: Boolean(token),
    rateLimit,
    recordRateLimit,
  }

  return <GithubContext.Provider value={value}>{children}</GithubContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGithub() {
  const ctx = useContext(GithubContext)
  if (!ctx) throw new Error('useGithub must be used within a GithubProvider')
  return ctx
}
