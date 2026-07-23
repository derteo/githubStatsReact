/**
 * Public events (/users/{user}/events/public) only cover roughly the last
 * ~90 days / 300 events — GitHub does not expose full commit history without
 * auth, so this is a best-effort approximation of a contribution graph, not
 * an exact one.
 */
export function buildDailyActivity(events, days = 90) {
  const counts = new Map()
  // GitHub timestamps are UTC — build day keys from UTC components too, or a
  // viewer west/east of UTC silently drops "today"'s events off the map.
  const [y, m, d] = new Date().toISOString().slice(0, 10).split('-').map(Number)

  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10)
    counts.set(key, 0)
  }

  for (const event of events || []) {
    const day = event.created_at?.slice(0, 10)
    if (!day || !counts.has(day)) continue
    const weight = event.type === 'PushEvent' ? event.payload?.commits?.length || event.payload?.size || 1 : 1
    counts.set(day, counts.get(day) + weight)
  }

  return [...counts.entries()].map(([date, count]) => ({ date, count }))
}

export function bucketLevel(count, max) {
  if (count === 0 || max === 0) return 0
  const ratio = count / max
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.25) return 2
  return 1
}

// Pads the front of the range so columns align to real Sun–Sat weeks.
export function groupIntoWeeks(daily) {
  if (daily.length === 0) return []
  const weeks = []
  let current = []
  const firstDow = new Date(daily[0].date).getUTCDay()
  for (let i = 0; i < firstDow; i++) current.push(null)

  for (const day of daily) {
    current.push(day)
    if (current.length === 7) {
      weeks.push(current)
      current = []
    }
  }
  if (current.length) {
    while (current.length < 7) current.push(null)
    weeks.push(current)
  }
  return weeks
}

export function buildWeeklyTrend(daily) {
  const weeks = []
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7)
    const total = chunk.reduce((sum, d) => sum + d.count, 0)
    weeks.push({ weekStart: chunk[0].date, total })
  }
  return weeks
}
