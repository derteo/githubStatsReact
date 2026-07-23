import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useGithub } from '../context/GithubContext.jsx'

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
          Senza token GitHub concede 60 richieste/ora. Con un token (anche senza permessi, basta
          uno "classic" senza scope) il limite sale a 5000/ora. Il token resta solo in questa
          scheda: viene salvato in <code>sessionStorage</code> e mai inviato altrove.
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
