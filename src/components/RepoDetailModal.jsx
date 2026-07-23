import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useGithubData } from '../hooks/useGithubData.js'
import { getRepoReadme, getRepoContributors, getRepoIssues, getRepoCommits, getRepoLanguages } from '../api/github.js'
import { aggregateLanguages } from '../utils/languages.js'
import { getSeriesColor } from '../utils/palette.js'
import { formatRelativeTime } from '../utils/format.js'
import { useTheme } from '@mui/material/styles'
import ErrorState from './ErrorState.jsx'

function TabPanel({ value, index, children }) {
  if (value !== index) return null
  return <Box sx={{ py: 2 }}>{children}</Box>
}

export default function RepoDetailModal({ repo, onClose }) {
  const [tab, setTab] = useState(0)
  const theme = useTheme()
  const open = Boolean(repo)
  const owner = repo?.owner?.login
  const name = repo?.name
  const key = repo ? `${owner}/${name}` : null

  const readme = useGithubData(
    key ? `readme:${key}` : null,
    ({ token, signal }) => getRepoReadme(owner, name, { token, signal }),
    { enabled: open, deps: [key], staleMs: 30 * 60 * 1000 },
  )
  const contributors = useGithubData(
    key ? `contributors:${key}` : null,
    ({ token, signal }) => getRepoContributors(owner, name, { token, signal }),
    { enabled: open, deps: [key], staleMs: 30 * 60 * 1000 },
  )
  const issues = useGithubData(
    key ? `issues:${key}` : null,
    ({ token, signal }) => getRepoIssues(owner, name, { token, signal }),
    { enabled: open, deps: [key], staleMs: 5 * 60 * 1000 },
  )
  const commits = useGithubData(
    key ? `commits:${key}` : null,
    ({ token, signal }) => getRepoCommits(owner, name, { token, signal }),
    { enabled: open, deps: [key], staleMs: 5 * 60 * 1000 },
  )
  const languages = useGithubData(
    key ? `languages:${key}` : null,
    ({ token, signal }) => getRepoLanguages(owner, name, { token, signal }),
    { enabled: open, deps: [key], staleMs: 60 * 60 * 1000 },
  )

  function handleClose() {
    setTab(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          {repo?.full_name}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="README" />
        <Tab label={`Contributori${contributors.data ? ` (${contributors.data.length})` : ''}`} />
        <Tab label={`Issue aperte${issues.data ? ` (${issues.data.length})` : ''}`} />
        <Tab label="Ultimi commit" />
        <Tab label="Linguaggi" />
      </Tabs>

      <DialogContent dividers>
        <TabPanel value={tab} index={0}>
          {readme.loading ? (
            <Stack spacing={1}>
              <Skeleton /> <Skeleton /> <Skeleton width="70%" />
            </Stack>
          ) : readme.error ? (
            readme.error.isNotFound ? (
              <Typography color="text.secondary">Nessun README in questo repository.</Typography>
            ) : (
              <ErrorState error={readme.error} fallbackTitle="Impossibile caricare il README" />
            )
          ) : (
            <Box
              sx={{
                '& img': { maxWidth: '100%' },
                '& pre': { overflowX: 'auto', p: 1.5, bgcolor: 'action.hover', borderRadius: 1 },
                '& table': { borderCollapse: 'collapse' },
                '& th, & td': { border: '1px solid', borderColor: 'divider', px: 1, py: 0.5 },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme.data}</ReactMarkdown>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1}>
          {contributors.loading || (!contributors.error && !contributors.data) ? (
            <Skeleton variant="rounded" height={80} />
          ) : contributors.error ? (
            <ErrorState error={contributors.error} fallbackTitle="Impossibile caricare i contributori" />
          ) : contributors.data.length === 0 ? (
            <Typography color="text.secondary">Nessun contributore disponibile.</Typography>
          ) : (
            <Stack spacing={1.5}>
              <AvatarGroup max={12} sx={{ justifyContent: 'flex-end' }}>
                {contributors.data.map((c) => (
                  <Avatar key={c.id} src={c.avatar_url} alt={c.login} />
                ))}
              </AvatarGroup>
              {contributors.data.slice(0, 12).map((c) => (
                <Stack key={c.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar src={c.avatar_url} alt={c.login} sx={{ width: 28, height: 28 }} />
                  <Link href={c.html_url} target="_blank" rel="noreferrer" sx={{ flexGrow: 1 }}>
                    {c.login}
                  </Link>
                  <Chip size="small" variant="outlined" label={`${c.contributions} commit`} />
                </Stack>
              ))}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={tab} index={2}>
          {issues.loading || (!issues.error && !issues.data) ? (
            <Skeleton variant="rounded" height={80} />
          ) : issues.error ? (
            <ErrorState error={issues.error} fallbackTitle="Impossibile caricare le issue" />
          ) : issues.data.length === 0 ? (
            <Typography color="text.secondary">Nessuna issue aperta 🎉</Typography>
          ) : (
            <Stack divider={<Divider />} spacing={1.25}>
              {issues.data
                .filter((i) => !i.pull_request)
                .map((issue) => (
                  <Stack key={issue.id} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                    <Link href={issue.html_url} target="_blank" rel="noreferrer" sx={{ flexGrow: 1 }}>
                      #{issue.number} {issue.title}
                    </Link>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      {formatRelativeTime(issue.created_at)}
                    </Typography>
                  </Stack>
                ))}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={tab} index={3}>
          {commits.loading || (!commits.error && !commits.data) ? (
            <Skeleton variant="rounded" height={80} />
          ) : commits.error ? (
            <ErrorState error={commits.error} fallbackTitle="Impossibile caricare i commit" />
          ) : commits.data.length === 0 ? (
            <Typography color="text.secondary">Nessun commit disponibile.</Typography>
          ) : (
            <Stack divider={<Divider />} spacing={1.25}>
              {commits.data.map((c) => (
                <Stack key={c.sha} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar src={c.author?.avatar_url} sx={{ width: 28, height: 28 }} />
                  <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography noWrap>{c.commit.message.split('\n')[0]}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.commit.author?.name} · {formatRelativeTime(c.commit.author?.date)}
                    </Typography>
                  </Stack>
                  <Link href={c.html_url} target="_blank" rel="noreferrer" variant="caption">
                    {c.sha.slice(0, 7)}
                  </Link>
                </Stack>
              ))}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={tab} index={4}>
          {languages.loading ? (
            <Skeleton variant="rounded" height={40} />
          ) : languages.error ? (
            <ErrorState error={languages.error} fallbackTitle="Impossibile caricare i linguaggi" />
          ) : (
            (() => {
              const dist = aggregateLanguages([languages.data])
              return (
                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ height: 10, borderRadius: 1, overflow: 'hidden' }}>
                    {dist.map((entry, i) => (
                      <Box
                        key={entry.name}
                        sx={{ width: `${entry.percent}%`, bgcolor: getSeriesColor(i, theme.palette.mode) }}
                      />
                    ))}
                  </Stack>
                  {dist.map((entry, i) => (
                    <Stack key={entry.name} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: getSeriesColor(i, theme.palette.mode),
                        }}
                      />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {entry.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.percent.toFixed(1)}%
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )
            })()
          )}
        </TabPanel>
      </DialogContent>
    </Dialog>
  )
}
