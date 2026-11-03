import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useGithub } from '../context/GithubContext.jsx'
import { USES_SHARED_TOKEN } from '../api/github.js'

export default function TokenDialog({ open, onClose }) {
  const { token, setToken } = useGithub()
  const [value, setValue] = useState(token)
  const [prevOpen, setPrevOpen] = useState(open)

  // Resync the field with the saved token whenever the dialog transitions to
  // open, so an unsaved edit from a cancelled previous visit doesn't linger.
  // Adjusted during render (not an effect) per React's "resetting state" guidance.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setValue(token)
  }

  function handleSave() {
    setToken(value.trim())
    onClose()
  }

  function handleClear() {
    setValue('')
    setToken('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Personal Access Token</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {USES_SHARED_TOKEN
            ? 'Il sito usa già un token condiviso: non serve impostarne uno. Se vuoi un limite tutto tuo (5000 richieste/ora), puoi inserirne uno qui sotto (anche "classic" senza scope). '
            : 'Senza token GitHub concede 60 richieste/ora. Con un token (anche senza permessi, basta uno "classic" senza scope) il limite sale a 5000/ora. '}
          Il token viene salvato in questo browser (<code>localStorage</code>) e resta finché non lo
          rimuovi da qui; viene inviato solo a <code>api.github.com</code>.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          label="GitHub Personal Access Token"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ghp_..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} color="error">
          Rimuovi
        </Button>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSave} variant="contained">
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  )
}
