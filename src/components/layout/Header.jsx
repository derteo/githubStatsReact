import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import VpnKeyIcon from '@mui/icons-material/VpnKeyOutlined'
import Brightness4Icon from '@mui/icons-material/Brightness4Outlined'
import Brightness7Icon from '@mui/icons-material/Brightness7Outlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useGithub } from '../../context/GithubContext.jsx'
import TokenDialog from '../TokenDialog.jsx'

const navLinkStyle = ({ isActive }) => ({
  color: 'inherit',
  fontWeight: isActive ? 700 : 400,
  opacity: isActive ? 1 : 0.75,
  textDecoration: 'none',
})

export default function Header({ mode, onToggleMode }) {
  const { hasToken, rateLimit } = useGithub()
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false)

  return (
    <AppBar position="sticky" color="default" enableColorOnDark>
      <Toolbar sx={{ gap: 3 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <GitHubIcon />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              GitHub Stats
            </Typography>
          </Stack>
        </Link>

        <Stack direction="row" spacing={2.5} sx={{ flexGrow: 1 }}>
          <NavLink to="/" end style={navLinkStyle}>
            Ricerca
          </NavLink>
          <NavLink to="/compare" style={navLinkStyle}>
            Confronta
          </NavLink>
        </Stack>

        {rateLimit && (
          <Chip
            size="small"
            label={`${rateLimit.remaining}/${rateLimit.limit} richieste`}
            color={rateLimit.remaining <= 5 ? 'warning' : 'default'}
            variant="outlined"
          />
        )}

        <Tooltip title={hasToken ? 'Token impostato' : 'Imposta Personal Access Token'}>
          <IconButton onClick={() => setTokenDialogOpen(true)} color={hasToken ? 'success' : 'default'}>
            <VpnKeyIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={mode === 'dark' ? 'Tema chiaro' : 'Tema scuro'}>
          <IconButton onClick={onToggleMode}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      <TokenDialog open={tokenDialogOpen} onClose={() => setTokenDialogOpen(false)} />
    </AppBar>
  )
}
