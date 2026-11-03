# Proxy con token condiviso

Un piccolo [Cloudflare Worker](https://developers.cloudflare.com/workers/) (gratuito) che tiene un token GitHub **come segreto lato server** e inoltra le richieste dell'app a `api.github.com`. Così chi usa il sito ha subito il limite da 5000 richieste/ora condiviso, senza creare un proprio token.

- Accetta solo `GET` verso gli endpoint che l'app usa (utenti, ricerca, repository, README, linguaggi, contributori, issue, commit, eventi).
- Accetta solo richieste dai siti in `ALLOWED_ORIGINS` (`wrangler.toml`).
- Mette in cache le risposte buone 5 minuti, per consumare meno quota.
- Un visitatore che ha un proprio token continua a usarlo: va direttamente a GitHub, mai al proxy.

## Messa online (una volta sola)

1. **Crea un token dedicato, senza permessi.** GitHub, Settings, Developer settings, Personal access tokens, *Tokens (classic)*, Generate new token. Nome `githubstats-proxy`, scadenza a tua scelta, **nessuno scope spuntato**. Non riusare un tuo token con permessi: questo legge solo dati pubblici, e se mai finisse nelle mani sbagliate non può fare danni.
2. Dalla cartella `worker/`, accedi a Cloudflare (account gratuito, si apre il browser):
   ```bash
   npx wrangler login
   ```
3. Salva il token come segreto (incollalo quando lo chiede):
   ```bash
   npx wrangler secret put GITHUB_TOKEN
   ```
4. Pubblica il Worker:
   ```bash
   npx wrangler deploy
   ```
   Alla fine stampa l'indirizzo, tipo `https://githubstats-proxy.TUO-SOTTODOMINIO.workers.dev`.
5. Nella cartella principale del progetto copia `.env.production.example` in `.env.production`, metti quell'indirizzo in `VITE_API_BASE` e pubblica l'app:
   ```bash
   npm run deploy
   ```

Se `VITE_API_BASE` non è impostato l'app funziona come prima: chiama GitHub direttamente e chiede un token a chi vuole più di 60 richieste/ora.

## Provare in locale

```bash
node worker/test.mjs          # prove del proxy contro GitHub (senza token)
```

## Cose da sapere

- Il limite di 5000 richieste/ora è **di tutti** i visitatori insieme. La cache di 5 minuti aiuta, ma con molto traffico il limite può finire: l'app mostra già un avviso con il conto alla rovescia.
- Chi conosce l'indirizzo del Worker potrebbe chiamarlo anche fuori dal sito (il controllo dell'origine ferma i browser, non gli script). L'elenco degli endpoint limita cosa può leggere. Se vedi consumi strani, rigenera il token con `wrangler secret put GITHUB_TOKEN`.
- Cloudflare gratuito concede 100.000 richieste al giorno.
