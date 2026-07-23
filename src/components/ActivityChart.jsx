import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Skeleton from '@mui/material/Skeleton'
import { BarChart } from '@mui/x-charts/BarChart'
import { useGithubEvents } from '../hooks/useGithubEvents.js'
import { buildDailyActivity, bucketLevel, groupIntoWeeks, buildWeeklyTrend } from '../utils/activity.js'
import { getHeatmapColor, getSeriesColor } from '../utils/palette.js'
import { formatDate } from '../utils/format.js'
import ErrorState from './ErrorState.jsx'

const CELL_SIZE = 11

export default function ActivityChart({ username }) {
  const theme = useTheme()
  const mode = theme.palette.mode
  const { data: events, error, loading } = useGithubEvents(username)

  const daily = useMemo(() => (events ? buildDailyActivity(events, 90) : []), [events])
  const weeks = useMemo(() => groupIntoWeeks(daily), [daily])
  const weeklyTrend = useMemo(() => buildWeeklyTrend(daily), [daily])
  const max = useMemo(() => Math.max(1, ...daily.map((d) => d.count)), [daily])

  if (error) return <ErrorState error={error} fallbackTitle="Impossibile caricare l'attività" />

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Attività recente
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Stimata dagli eventi pubblici (push, PR, issue…) degli ultimi 90 giorni.
        </Typography>

        {loading || !events ? (
          <Skeleton variant="rounded" height={140} />
        ) : (
          <>
            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <Box sx={{ display: 'grid', gridAutoFlow: 'column', gap: '3px', width: 'fit-content' }}>
                {weeks.map((week, wi) => (
                  <Box
                    key={wi}
                    sx={{ display: 'grid', gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`, gap: '3px' }}
                  >
                    {week.map((day, di) => {
                      if (!day) {
                        return <Box key={di} sx={{ width: CELL_SIZE, height: CELL_SIZE }} />
                      }
                      const level = bucketLevel(day.count, max)
                      return (
                        <Tooltip
                          key={day.date}
                          title={`${day.count} eventi il ${formatDate(day.date)}`}
                          arrow
                        >
                          <Box
                            sx={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              borderRadius: '2px',
                              bgcolor: getHeatmapColor(level, mode),
                              outline: '1px solid',
                              outlineColor: 'divider',
                              outlineOffset: '-1px',
                            }}
                          />
                        </Tooltip>
                      )
                    })}
                  </Box>
                ))}
              </Box>
            </Box>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                meno
              </Typography>
              {[0, 1, 2, 3, 4].map((level) => (
                <Box
                  key={level}
                  sx={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: '2px', bgcolor: getHeatmapColor(level, mode) }}
                />
              ))}
              <Typography variant="caption" color="text.secondary">
                più
              </Typography>
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
              Trend settimanale
            </Typography>
            <BarChart
              height={200}
              dataset={weeklyTrend}
              xAxis={[{ scaleType: 'band', dataKey: 'weekStart', valueFormatter: (d) => formatDate(d) }]}
              series={[{ dataKey: 'total', label: 'Eventi', color: getSeriesColor(0, mode) }]}
              slotProps={{ legend: { hidden: true } }}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
