import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import { useGithub } from '../context/GithubContext.jsx'
import { formatCountdown } from '../utils/format.js'

const LOW_THRESHOLD = 5

export default function RateLimitBanner() {
  const { rateLimit, hasToken } = useGithub()
  const [now, setNow] = useState(() => Date.now())

  const isLow = rateLimit && rateLimit.remaining <= LOW_THRESHOLD
  const isExhausted = rateLimit && rateLimit.remaining === 0

  useEffect(() => {
    if (!isLow) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [isLow])

  if (!isLow) return null

  const secondsRemaining = Math.round(rateLimit.reset * 1000 - now) / 1000

  return (
    <Collapse in={isLow}>
      <Alert severity={isExhausted ? 'error' : 'warning'} sx={{ borderRadius: 0 }}>
        {isExhausted
          ? `Rate limit GitHub esaurito (${rateLimit.limit}/h). Si sblocca tra ${formatCountdown(secondsRemaining)}.`
          : `Rate limit GitHub quasi esaurito: ${rateLimit.remaining}/${rateLimit.limit} richieste rimaste.`}
        {!hasToken && ' Aggiungi un Personal Access Token per salire a 5000 richieste/ora.'}
      </Alert>
    </Collapse>
  )
}
