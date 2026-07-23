import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { PieChart } from '@mui/x-charts/PieChart'
import { useAggregatedLanguages } from '../hooks/useAggregatedLanguages.js'
import { getSeriesColor, OTHER_COLOR } from '../utils/palette.js'
import ErrorState from './ErrorState.jsx'

export default function LanguagesChart({ username, repos }) {
  const theme = useTheme()
  const mode = theme.palette.mode
  const { data, error, loading, sampledCount } = useAggregatedLanguages(username, repos)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Linguaggi
        </Typography>

        {error ? (
          <ErrorState error={error} fallbackTitle="Impossibile caricare i linguaggi" />
        ) : loading || !data ? (
          <Skeleton variant="circular" width={220} height={220} sx={{ mx: 'auto' }} />
        ) : data.length === 0 ? (
          <Typography color="text.secondary">Nessun dato sui linguaggi disponibile.</Typography>
        ) : (
          <>
            <PieChart
              height={280}
              series={[
                {
                  data: data.map((entry, i) => ({
                    id: entry.name,
                    value: Math.round(entry.percent * 10) / 10,
                    label: entry.name,
                    color: entry.name === 'Other' ? OTHER_COLOR[mode] : getSeriesColor(i, mode),
                  })),
                  innerRadius: 60,
                  outerRadius: 110,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  valueFormatter: (item) => `${item.value}%`,
                },
              ]}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center' }}
            >
              Pesato per byte di codice · basato sui {sampledCount} repository non-fork più popolari
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  )
}
