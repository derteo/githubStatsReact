export function formatCompactNumber(value) {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(dateString),
  )
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '—'
  const diffMs = Date.now() - new Date(dateString).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return 'oggi'
  if (diffDays === 1) return 'ieri'
  if (diffDays < 30) return `${diffDays} giorni fa`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} mes${diffMonths === 1 ? 'e' : 'i'} fa`
  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears} ann${diffYears === 1 ? 'o' : 'i'} fa`
}

export function formatCountdown(secondsRemaining) {
  const clamped = Math.max(0, Math.floor(secondsRemaining))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
