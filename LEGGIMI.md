# Atlas — sito pubblico v1.0 (motore escluso)

## Obiettivo
Pacchetto coordinato del sito pubblico Atlas. Mantiene le pagine esistenti, integra la guida interattiva **Il prossimo passo**, uniforma la navigazione e rende più facile raggiungere la guida da Home, Famiglie e Risorse. Il motore di orientamento non è incluso né modificato.

## Contenuto
- `index.html` — homepage e accessi principali
- `primo-passo.html` — guida interattiva per individuare un punto di partenza
- `famiglie.html` — proposta per le famiglie
- `marketplace.html` — categorie di servizi e professionisti
- `professionisti.html` — proposta per professionisti e centri
- `fondo-atlas.html` — progetto Fondo Atlas
- `area-famiglia.html` — anteprima area famiglia
- `diario-condiviso.html` — demo interattiva del diario
- `risorse.html` — aree della futura biblioteca e accesso alla guida
- `chi-siamo.html`, `contatti.html`, `privacy.html` — missione, contatti e trasparenza
- `assets/site.css`, `assets/site.js`, `assets/diary-demo.js` — stile e interazioni dimostrative
- `robots.txt`, `sitemap.xml`, `404.html` — supporto di base per pubblicazione statica

## Pubblicazione su GitHub Pages
1. Apri il repository `ligoriopietro-max/Atlas` e vai nella root.
2. Seleziona **Add file → Upload files**.
3. Estrai questo archivio e carica i file e la cartella `assets/` contenuti nella cartella `atlas-site-v1/`.
4. Conferma la sostituzione dei file omonimi nella root. **Non cancellare né sovrascrivere la cartella `test/`**: il motore/test resta separato e i pulsanti `./test/` continuano a puntare lì.
5. Esegui il commit e controlla la homepage e la guida pubblicata.

## Cosa funziona e cosa resta dimostrativo
- Le pagine informative sono statiche e navigabili.
- La guida `primo-passo.html` reagisce alle scelte nel browser; non salva le risposte e non formula diagnosi.
- Il diario condiviso è una simulazione: le voci non sono persistenti e non vengono inviate.
- Area famiglia, moduli e marketplace non hanno autenticazione, backend o dati reali; i moduli mostrano un messaggio dimostrativo e non inviano informazioni.
- Le categorie del marketplace non sono annunci di operatori reali e non consentono prenotazioni.
- Il Fondo Atlas è in progettazione: questo sito non raccoglie donazioni.
- La pagina privacy è una descrizione provvisoria del prototipo, non un’informativa legale definitiva.
- Il test sperimentale è separato in `test/` e non viene modificato da questo pacchetto.

## Importante
Non inserire dati personali, documenti, dati sanitari o informazioni identificative di minori nelle demo. Prima di attivare account, messaggistica, prenotazioni o archiviazione sarà necessario sviluppare e verificare le relative funzioni, la sicurezza e la documentazione privacy.
