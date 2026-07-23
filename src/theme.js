import { createTheme } from '@mui/material/styles'

// Categorical/status hues mirrored from the validated dataviz palette so MUI
// components (chips, alerts) stay consistent with the chart colors.
export function createAppTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#3987e5' : '#2a78d6' },
      secondary: { main: mode === 'dark' ? '#9085e9' : '#4a3aa7' },
      success: { main: '#0ca30c' },
      warning: { main: '#fab219' },
      error: { main: '#d03b3b' },
      background: {
        default: mode === 'dark' ? '#0d0d0d' : '#f9f9f7',
        paper: mode === 'dark' ? '#1a1a19' : '#fcfcfb',
      },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      MuiAppBar: {
        defaultProps: { elevation: 0 },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
    },
  })
}
