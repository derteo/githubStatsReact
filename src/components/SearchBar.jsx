import { useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import SearchIcon from '@mui/icons-material/Search'
import InputAdornment from '@mui/material/InputAdornment'
import { useDebounce } from '../hooks/useDebounce.js'
import { useGithubData } from '../hooks/useGithubData.js'
import { searchUsers } from '../api/github.js'
import ErrorState from './ErrorState.jsx'

export default function SearchBar({ initialValue = '', onSearch, autoFocus }) {
  const [inputValue, setInputValue] = useState(initialValue)
  const debouncedInput = useDebounce(inputValue.trim(), 350)
  const shouldSearch = debouncedInput.length >= 2

  const { data, loading, error } = useGithubData(
    shouldSearch ? `search-users:${debouncedInput}` : null,
    ({ token, signal }) => searchUsers(debouncedInput, { token, signal }),
    { enabled: shouldSearch, staleMs: 60_000, deps: [debouncedInput], trackRateLimit: false },
  )

  const options = useMemo(() => data?.items ?? [], [data])

  function handleSubmit(value) {
    const username = typeof value === 'string' ? value.trim() : value?.login
    if (username) onSearch(username)
  }

  return (
    <Stack spacing={1}>
      <Autocomplete
        freeSolo
        autoFocus={autoFocus}
        filterOptions={(opts) => opts}
        options={options}
        loading={loading}
        inputValue={inputValue}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.login)}
        isOptionEqualToValue={(option, value) => option.login === value.login}
        onInputChange={(_event, value) => setInputValue(value)}
        onChange={(_event, value) => handleSubmit(value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !options.some((o) => o.login === inputValue)) {
            handleSubmit(inputValue)
          }
        }}
        renderOption={(props, option) => {
          const { key, ...rest } = props
          return (
            <li key={key} {...rest}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%', py: 0.5 }}>
                <Avatar src={option.avatar_url} alt={option.login} sx={{ width: 32, height: 32 }} />
                <Typography sx={{ flexGrow: 1 }}>{option.login}</Typography>
                <Chip
                  size="small"
                  label={option.type === 'Organization' ? 'Org' : 'User'}
                  variant="outlined"
                />
              </Stack>
            </li>
          )
        }}
        renderInput={({ slotProps, ...params }) => (
          <TextField
            {...params}
            placeholder="Cerca uno username o organizzazione GitHub…"
            slotProps={{
              ...slotProps,
              input: {
                ...slotProps?.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={18} /> : null}
                    {slotProps?.input?.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
      {error && <ErrorState error={error} fallbackTitle="Impossibile completare la ricerca" />}
    </Stack>
  )
}
