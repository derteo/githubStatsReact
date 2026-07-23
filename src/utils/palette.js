// Validated categorical palette (see dataviz skill / references/palette.md).
// Fixed hue order — never cycled, never reassigned by rank changes.
export const CATEGORICAL_PALETTE = [
  { slot: 1, name: 'blue', light: '#2a78d6', dark: '#3987e5' },
  { slot: 2, name: 'orange', light: '#eb6834', dark: '#d95926' },
  { slot: 3, name: 'aqua', light: '#1baf7a', dark: '#199e70' },
  { slot: 4, name: 'yellow', light: '#eda100', dark: '#c98500' },
  { slot: 5, name: 'magenta', light: '#e87ba4', dark: '#d55181' },
  { slot: 6, name: 'green', light: '#008300', dark: '#008300' },
  { slot: 7, name: 'violet', light: '#4a3aa7', dark: '#9085e9' },
  { slot: 8, name: 'red', light: '#e34948', dark: '#e66767' },
]

export const STATUS_COLORS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
}

export function getSeriesColor(index, mode = 'light') {
  const entry = CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]
  return mode === 'dark' ? entry.dark : entry.light
}

export const OTHER_COLOR = { light: '#898781', dark: '#898781' }

// Sequential single-hue (blue) ramp for magnitude encodings (heatmap cells,
// trend bars). Level 0 reuses the hairline/gridline ink so "no activity"
// recedes into the surface instead of reading as a colored data point.
export const HEATMAP_STEPS = {
  light: ['#e1e0d9', '#cde2fb', '#86b6ef', '#3987e5', '#184f95'],
  dark: ['#2c2c2a', '#184f95', '#256abf', '#3987e5', '#86b6ef'],
}

export function getHeatmapColor(level, mode = 'light') {
  const steps = HEATMAP_STEPS[mode] || HEATMAP_STEPS.light
  return steps[Math.min(level, steps.length - 1)]
}
