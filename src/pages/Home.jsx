import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import SearchBar from '../components/SearchBar.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import RepoList from '../components/RepoList.jsx'
import LanguagesChart from '../components/LanguagesChart.jsx'
import ActivityChart from '../components/ActivityChart.jsx'
import RepoDetailModal from '../components/RepoDetailModal.jsx'
import { useGithubRepos } from '../hooks/useGithubRepos.js'

export default function Home() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [selectedRepo, setSelectedRepo] = useState(null)

  const { data: repos, error: reposError, loading: reposLoading } = useGithubRepos(username)

  return (
    <Stack spacing={3}>
      <SearchBar initialValue={username || ''} onSearch={(value) => navigate(`/${value}`)} autoFocus={!username} />

      {!username ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 6 }}>
          Cerca uno username o un&apos;organizzazione GitHub per vedere le statistiche.
        </Typography>
      ) : (
        <>
          <ProfileCard username={username} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <LanguagesChart username={username} repos={repos} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ActivityChart username={username} />
            </Grid>
          </Grid>

          <RepoList repos={repos} error={reposError} loading={reposLoading} onOpenRepo={setSelectedRepo} />

          <RepoDetailModal repo={selectedRepo} onClose={() => setSelectedRepo(null)} />
        </>
      )}
    </Stack>
  )
}
