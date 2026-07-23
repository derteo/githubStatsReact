import { useSearchParams } from 'react-router'
import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Divider from '@mui/material/Divider'
import SearchBar from '../components/SearchBar.jsx'
import ComparisonBar from '../components/ComparisonBar.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { useCompareStats } from '../hooks/useCompareStats.js'
import { getSeriesColor } from '../utils/palette.js'

function UserSummary({ username, onSearch, color, stats }) {
  const { profile, loading, error } = stats

  return (
    <Stack spacing={2}>
      <SearchBar initialValue={username || ''} onSearch={onSearch} />
      {error && <ErrorState error={error} fallbackTitle="Impossibile caricare il profilo" />}
      {username && !error && (
        <Card>
          <CardContent>
            {loading || !profile ? (
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Skeleton variant="circular" width={56} height={56} />
                <Skeleton width="60%" />
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Avatar src={profile.avatar_url} sx={{ width: 56, height: 56, border: 2, borderColor: color }} />
                <Stack>
                  <Typography sx={{ fontWeight: 700 }}>{profile.name || profile.login}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{profile.login}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const theme = useTheme()
  const userA = params.get('a') || ''
  const userB = params.get('b') || ''
  const colorA = getSeriesColor(0, theme.palette.mode)
  const colorB = getSeriesColor(1, theme.palette.mode)

  const statsA = useCompareStats(userA)
  const statsB = useCompareStats(userB)

  function setUser(slot, value) {
    const next = new URLSearchParams(params)
    next.set(slot, value)
    setParams(next)
  }

  const bothReady =
    userA &&
    userB &&
    !statsA.loading &&
    !statsB.loading &&
    !statsA.error &&
    !statsB.error &&
    statsA.profile &&
    statsB.profile

  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Confronta due utenti o organizzazioni
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <UserSummary username={userA} onSearch={(v) => setUser('a', v)} color={colorA} stats={statsA} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <UserSummary username={userB} onSearch={(v) => setUser('b', v)} color={colorB} stats={statsB} />
        </Grid>
      </Grid>

      {bothReady && (
        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <ComparisonBar
                label="Repository pubblici"
                valueA={statsA.profile.public_repos}
                valueB={statsB.profile.public_repos}
                colorA={colorA}
                colorB={colorB}
              />
              <ComparisonBar
                label="Stelle totali"
                valueA={statsA.totalStars}
                valueB={statsB.totalStars}
                colorA={colorA}
                colorB={colorB}
              />
              <ComparisonBar
                label="Fork totali"
                valueA={statsA.totalForks}
                valueB={statsB.totalForks}
                colorA={colorA}
                colorB={colorB}
              />
              <ComparisonBar
                label="Follower"
                valueA={statsA.profile.followers}
                valueB={statsB.profile.followers}
                colorA={colorA}
                colorB={colorB}
              />

              <Divider />

              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Stack sx={{ alignItems: 'flex-start' }}>
                  <Typography variant="caption" color="text.secondary">
                    Linguaggio più usato
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: colorA }}>
                    {statsA.topLanguage || '—'}
                  </Typography>
                </Stack>
                <Stack sx={{ alignItems: 'flex-end' }}>
                  <Typography variant="caption" color="text.secondary">
                    Linguaggio più usato
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: colorB }}>
                    {statsB.topLanguage || '—'}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
