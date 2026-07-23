import { Outlet } from 'react-router'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Header from './Header.jsx'
import RateLimitBanner from '../RateLimitBanner.jsx'

export default function Layout({ mode, onToggleMode }) {
  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <Header mode={mode} onToggleMode={onToggleMode} />
      <RateLimitBanner />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
