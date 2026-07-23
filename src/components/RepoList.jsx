import { useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import RepoCard from './RepoCard.jsx'
import ErrorState from './ErrorState.jsx'

const SORTERS = {
  stars: (a, b) => b.stargazers_count - a.stargazers_count,
  forks: (a, b) => b.forks_count - a.forks_count,
  updated: (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
  name: (a, b) => a.name.localeCompare(b.name),
}

export default function RepoList({ repos, error, loading, onOpenRepo }) {
  const [sortBy, setSortBy] = useState('stars')
  const [language, setLanguage] = useState('all')

  const languages = useMemo(() => {
    if (!repos) return []
    const set = new Set(repos.map((r) => r.language).filter(Boolean))
    return [...set].sort()
  }, [repos])

  const visibleRepos = useMemo(() => {
    if (!repos) return []
    const filtered = language === 'all' ? repos : repos.filter((r) => r.language === language)
    return [...filtered].sort(SORTERS[sortBy])
  }, [repos, sortBy, language])

  if (error) return <ErrorState error={error} fallbackTitle="Impossibile caricare i repository" />

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
      >
        <Typography variant="h6">
          Repository {repos ? `(${visibleRepos.length})` : ''}
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Linguaggio</InputLabel>
            <Select value={language} label="Linguaggio" onChange={(e) => setLanguage(e.target.value)}>
              <MenuItem value="all">Tutti</MenuItem>
              {languages.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Ordina per</InputLabel>
            <Select value={sortBy} label="Ordina per" onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="stars">Stelle</MenuItem>
              <MenuItem value="updated">Ultimo aggiornamento</MenuItem>
              <MenuItem value="name">Nome</MenuItem>
              <MenuItem value="forks">Fork</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {loading || !repos
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={150} />
              </Grid>
            ))
          : visibleRepos.map((repo) => (
              <Grid key={repo.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <RepoCard repo={repo} onOpen={onOpenRepo} />
              </Grid>
            ))}
      </Grid>

      {!loading && repos && visibleRepos.length === 0 && (
        <Typography color="text.secondary">Nessun repository trovato con questo filtro.</Typography>
      )}
    </Stack>
  )
}
