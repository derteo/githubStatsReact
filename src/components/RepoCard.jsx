import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import StarBorderIcon from '@mui/icons-material/StarBorderRounded'
import ForkRightIcon from '@mui/icons-material/ForkRightRounded'
import { getLanguageDotColor } from '../utils/languageDotColors.js'
import { formatCompactNumber, formatRelativeTime } from '../utils/format.js'

export default function RepoCard({ repo, onOpen }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={() => onOpen(repo)} sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
            {repo.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
            }}
          >
            {repo.description || 'Nessuna descrizione'}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            {repo.language && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: getLanguageDotColor(repo.language),
                  }}
                />
                <Typography variant="caption">{repo.language}</Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <StarBorderIcon fontSize="inherit" />
              <Typography variant="caption">{formatCompactNumber(repo.stargazers_count)}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <ForkRightIcon fontSize="inherit" />
              <Typography variant="caption">{formatCompactNumber(repo.forks_count)}</Typography>
            </Stack>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            aggiornato {formatRelativeTime(repo.pushed_at)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
