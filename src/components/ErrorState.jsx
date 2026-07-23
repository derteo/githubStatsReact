import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

export default function ErrorState({ error, fallbackTitle = 'Errore' }) {
  if (!error) return null

  if (error.isRateLimited) {
    return (
      <Alert severity="error">
        <AlertTitle>Rate limit GitHub esaurito</AlertTitle>
        Riprova più tardi oppure imposta un Personal Access Token dall&apos;icona nella barra in
        alto per salire a 5000 richieste/ora.
      </Alert>
    )
  }

  if (error.isNotFound) {
    return (
      <Alert severity="warning">
        <AlertTitle>Non trovato</AlertTitle>
        Nessun utente o organizzazione con questo nome su GitHub.
      </Alert>
    )
  }

  return (
    <Alert severity="error">
      <AlertTitle>{fallbackTitle}</AlertTitle>
      {error.message}
    </Alert>
  )
}
