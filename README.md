# GitHub Stats

Dashboard React per esplorare le statistiche pubbliche di un utente o di un'organizzazione GitHub: profilo, repository, linguaggi usati, attività recente e confronto diretto tra due account. Funziona interamente lato client, chiamando le API pubbliche di GitHub direttamente dal browser.

**Demo:** [stats.matteeoderosa.it](https://stats.matteeoderosa.it/)

## Funzionalità

- **Ricerca utenti/organizzazioni** con autocomplete che interroga `search/users` mentre digiti.
- **Profilo**: avatar, bio, azienda, località, sito, data di iscrizione, repository pubblici, follower/following.
- **Elenco repository** con card riassuntive, ordinate per ultimo aggiornamento.
- **Dettaglio repository** in una modale a tab: README renderizzato (Markdown + GFM), contributori, issue aperte, ultimi commit, distribuzione linguaggi.
- **Grafico linguaggi** aggregato su tutti i repository dell'account.
- **Grafico attività** basato sugli eventi pubblici recenti.
- **Confronto tra due account** (`/compare?a=...&b=...`): repository pubblici, stelle totali, fork totali, follower e linguaggio più usato messi a confronto.
- **Tema chiaro/scuro** con rilevamento della preferenza di sistema e persistenza in `localStorage`.
- **Cache client-side** delle risposte API in `localStorage`, con TTL diversi per endpoint, per ridurre le chiamate ripetute.
- **Indicatore di rate limit** in header e banner di avviso quando le richieste rimaste scendono sotto soglia.
- **Personal Access Token opzionale** per alzare il limite di richieste (vedi sotto).

## Stack tecnico

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [React Router 8](https://reactrouter.com) (routing client-side, `BrowserRouter`)
- [MUI 9](https://mui.com) (componenti UI, tema, icone) + [MUI X Charts](https://mui.com/x/react-charts/)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) per il rendering dei README
- Nessun backend: tutte le chiamate vanno direttamente a `api.github.com` dal browser

## Avvio in locale

Richiede Node.js 20+.

```bash
npm install
npm run dev
```

L'app parte su `http://localhost:5173`.

Altri script disponibili:

```bash
npm run build     # build di produzione in dist/
npm run preview   # serve la build di produzione in locale
npm run lint      # esegue ESLint
```

## Limiti di richieste API e Personal Access Token

GitHub concede **60 richieste/ora** senza autenticazione (per IP) e **5000 richieste/ora** con un token. Cliccando l'icona della chiave in alto puoi incollare un tuo [Personal Access Token](https://github.com/settings/tokens) (anche "classic" senza alcuno scope, sufficiente per i soli endpoint pubblici usati qui) per alzare il limite.

Il token:
- viene salvato in `localStorage` del browser e resta finché non lo rimuovi dall'app (non scade chiudendo la scheda o il browser);
- viene inviato **esclusivamente** a `api.github.com`, mai ad altri host o servizi terzi;
- non è mai scritto nel codice, nel bundle o nel repository.

> Non inserire un tuo token direttamente nel codice sorgente o come variabile d'ambiente di build: finirebbe in chiaro nel bundle JavaScript pubblicato, leggibile da chiunque ispezioni il sito. Un eventuale innalzamento del limite condiviso tra tutti i visitatori richiederebbe un piccolo backend/proxy che tenga il token lato server — non ancora implementato in questo progetto.

## Deploy su GitHub Pages

Il progetto è pubblicato su GitHub Pages dietro il dominio custom `stats.matteeoderosa.it`, servito alla radice (non sotto `/githubStatsReact/`).

1. Sul repository GitHub, in **Settings → Pages**, imposta come sorgente il branch `gh-pages` (verrà creato al primo deploy).
2. Pubblica con:

   ```bash
   npm run deploy
   ```

   Lo script esegue prima la build (`predeploy`) e poi carica il contenuto di `dist/` sul branch `gh-pages` tramite [`gh-pages`](https://www.npmjs.com/package/gh-pages).
3. **DNS**: presso il tuo provider DNS, aggiungi un record `CNAME` per il sottodominio che punta all'host di GitHub Pages:

   ```
   stats   CNAME   derteo.github.io.
   ```

4. Su GitHub, in **Settings → Pages → Custom domain**, imposta `stats.matteeoderosa.it` (GitHub legge/scrive anche il file [`public/CNAME`](public/CNAME) incluso nel repo) e, una volta propagato il DNS e emesso il certificato, spunta **Enforce HTTPS**.

Note tecniche sulla configurazione Pages già presenti nel progetto:
- `base: '/'` in [`vite.config.js`](vite.config.js): sul dominio custom l'app vive alla radice, non sotto il nome del repository.
- `basename={import.meta.env.BASE_URL}` su `BrowserRouter` in [`src/main.jsx`](src/main.jsx), coerente con lo stesso base path.
- [`public/404.html`](public/404.html) + uno script inline in [`index.html`](index.html) implementano il [trick "SPA per GitHub Pages"](https://github.com/rafgraph/spa-github-pages): senza questo, ricaricare la pagina su un URL profondo (es. `/derteo`) darebbe un 404, perché GitHub Pages serve solo file statici e non conosce le route di React Router.
- [`public/CNAME`](public/CNAME): contiene il dominio custom, così ogni `npm run deploy` lo ripubblica insieme al resto di `dist/` invece di doverlo re-impostare a mano dopo ogni deploy.

> Se in futuro il progetto tornasse a essere servito sotto `derteo.github.io/githubStatsReact/` invece che sul dominio custom, vanno invertite le prime due modifiche sopra (`base: '/githubStatsReact/'` e rimozione di `public/CNAME`), altrimenti gli asset punterebbero al path sbagliato.

## Struttura del progetto

```
src/
├── api/github.js          # client fetch verso api.github.com, parsing errori e rate limit
├── components/            # componenti UI (card, grafici, modali, layout)
├── context/                # contesto React per token e rate limit
├── hooks/                  # hook di data-fetching per utenti, repo, eventi, confronto
├── pages/                  # pagine Home (ricerca/dettaglio) e Compare
├── utils/                  # cache, formattazione, palette colori, aggregazione linguaggi
├── theme.js                # tema MUI chiaro/scuro
└── main.jsx                # bootstrap, BrowserRouter, provider
```

## Licenza

Nessuna licenza specificata al momento.
