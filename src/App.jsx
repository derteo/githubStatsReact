import { useMemo, useState } from 'react'
import { Routes, Route } from 'react-router'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useMediaQuery from '@mui/material/useMediaQuery'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Compare from './pages/Compare.jsx'
import { createAppTheme } from './theme.js'

const MODE_KEY = 'ghstats:theme-mode'

function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || (prefersDark ? 'dark' : 'light'))

  const theme = useMemo(() => createAppTheme(mode), [mode])

  function toggleMode() {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(MODE_KEY, next)
      return next
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route element={<Layout mode={mode} onToggleMode={toggleMode} />}>
          <Route index element={<Home />} />
          <Route path=":username" element={<Home />} />
          <Route path="compare" element={<Compare />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App
