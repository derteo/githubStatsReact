import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Link from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import BusinessIcon from '@mui/icons-material/BusinessOutlined'
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined'
import LinkIcon from '@mui/icons-material/LinkOutlined'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined'
import { useGithubUser } from '../hooks/useGithubUser.js'
import { formatCompactNumber, formatDate } from '../utils/format.js'
import ErrorState from './ErrorState.jsx'

function Stat({ label, value }) {
  return (
    <Stack sx={{ alignItems: 'center', minWidth: 72 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {formatCompactNumber(value)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  )
}

export default function ProfileCard({ username }) {
  const { data: profile, error, loading } = useGithubUser(username)

  if (error) return <ErrorState error={error} fallbackTitle="Impossibile caricare il profilo" />

  if (loading || !profile) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
            <Skeleton variant="circular" width={88} height={88} />
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Skeleton width="40%" height={32} />
              <Skeleton width="60%" />
              <Skeleton width="30%" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  const isOrg = profile.type === 'Organization'

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <Avatar src={profile.avatar_url} alt={profile.login} sx={{ width: 88, height: 88 }} />
          <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {profile.name || profile.login}
              </Typography>
              <Chip size="small" label={isOrg ? 'Organizzazione' : 'Utente'} color="primary" variant="outlined" />
            </Stack>
            <Link href={profile.html_url} target="_blank" rel="noreferrer" color="text.secondary" underline="hover">
              @{profile.login}
            </Link>
            {profile.bio && <Typography sx={{ mt: 0.5 }}>{profile.bio}</Typography>}

            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mt: 1 }}>
              {profile.company && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="body2">{profile.company}</Typography>
                </Stack>
              )}
              {profile.location && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2">{profile.location}</Typography>
                </Stack>
              )}
              {profile.blog && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <LinkIcon fontSize="small" color="action" />
                  <Link
                    href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                    target="_blank"
                    rel="noreferrer"
                    variant="body2"
                  >
                    {profile.blog}
                  </Link>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <CalendarMonthIcon fontSize="small" color="action" />
                <Typography variant="body2">dal {formatDate(profile.created_at)}</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

          <Stack direction="row" spacing={3}>
            <Stat label="repo pubblici" value={profile.public_repos} />
            <Stat label="follower" value={profile.followers} />
            <Stat label="following" value={profile.following} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
