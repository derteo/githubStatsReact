const MAX_SLOTS = 7 // 7 named languages + "Other" fills the 8-slot categorical palette

/**
 * Aggregates a list of { languages: { [name]: bytes } } responses (one per repo)
 * into a single sorted-by-bytes distribution, folding the long tail into "Other" —
 * a 9th+ series is never a generated hue, per the categorical color rule.
 */
export function aggregateLanguages(languagesByRepo) {
  const totals = new Map()

  for (const languages of languagesByRepo) {
    if (!languages) continue
    for (const [name, bytes] of Object.entries(languages)) {
      totals.set(name, (totals.get(name) || 0) + bytes)
    }
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, MAX_SLOTS)
  const rest = sorted.slice(MAX_SLOTS)
  const otherBytes = rest.reduce((sum, [, bytes]) => sum + bytes, 0)

  const grandTotal = sorted.reduce((sum, [, bytes]) => sum + bytes, 0) || 1

  const result = top.map(([name, bytes]) => ({
    name,
    bytes,
    percent: (bytes / grandTotal) * 100,
  }))

  if (otherBytes > 0) {
    result.push({ name: 'Other', bytes: otherBytes, percent: (otherBytes / grandTotal) * 100 })
  }

  return result
}
