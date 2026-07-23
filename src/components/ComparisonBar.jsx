import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatCompactNumber } from '../utils/format.js'

export default function ComparisonBar({ label, valueA, valueB, colorA, colorB }) {
  const total = (valueA || 0) + (valueB || 0)
  const widthA = total > 0 ? (valueA / total) * 100 : 50
  const widthB = total > 0 ? (valueB / total) * 100 : 50

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: colorA }}>
          {formatCompactNumber(valueA)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: colorB }}>
          {formatCompactNumber(valueB)}
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ height: 8, borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover' }}>
        <Box sx={{ width: `${widthA}%`, bgcolor: colorA }} />
        <Box sx={{ width: `${widthB}%`, bgcolor: colorB }} />
      </Stack>
    </Stack>
  )
}
