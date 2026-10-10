# Atlas — sito pubblico v0.1 (struttura senza motore)

## Scopo
Questa è una prima struttura multipagina del sito Atlas, separata dal test sperimentale del motore. Include homepage, area famiglie, marketplace/categorie, area professionisti, Fondo Atlas, anteprima area famiglia, **diario condiviso dimostrativo interattivo**, risorse, missione, contatti e trasparenza.

## Caricamento su GitHub
1. Apri il repository `ligoriopietro-max/Atlas`.
2. Entra nella **cartella principale** del repository, non in `test/`.
3. Usa **Add file → Upload files**.
4. Carica tutti i file e le cartelle contenuti in questa cartella: i file HTML nella root e la cartella `assets/`.
5. Se GitHub segnala che `index.html` esiste già, conferma la sostituzione solo se vuoi che la homepage del sito diventi questa nuova homepage. Non cancellare né sostituire nulla dentro `test/`.
6. Completa il commit. Il sito principale dovrebbe essere pubblicato all’indirizzo GitHub Pages già configurato (`/Atlas/`), se la pubblicazione è attiva.

## Cosa è operativo e cosa no
- Le pagine e i collegamenti tra pagine sono statici e navigabili.
- Il pulsante del test rimanda alla cartella separata `./test/`; il motore non è incluso in questo pacchetto e non è stato modificato.
- I moduli sono dimostrativi: non inviano e non salvano dati.
- L’area famiglia è un mockup, senza login, archivio o dati reali.
- `diario-condiviso.html` è una simulazione interattiva con esempi inventati, filtri, aggiunta temporanea di voci e messaggi e anteprima dei permessi. Le modifiche restano solo in memoria nella pagina corrente e non vengono inviate o salvate online.
- Il marketplace contiene categorie progettuali, non schede di professionisti reali.
- Il Fondo Atlas è descritto come iniziativa in progettazione; non sono richieste né raccolte donazioni.
- La pagina privacy è provvisoria e non è un’informativa legale definitiva.

## Struttura
- `index.html` — homepage
- `famiglie.html` — area famiglie
- `marketplace.html` — categorie di professionisti e servizi, inclusa assistenza familiare separata dalla terapia
- `professionisti.html` — proposta di valore e modulo dimostrativo
- `fondo-atlas.html` — visione del Fondo Atlas
- `area-famiglia.html` — mockup dell’area personale
- `diario-condiviso.html` — diario condiviso dimostrativo per famiglia e professionisti
- `assets/diary-demo.js` — interazioni temporanee del prototipo del diario
- `risorse.html` — biblioteca progettuale
- `chi-siamo.html` — missione e principi
- `contatti.html` — modulo dimostrativo
- `privacy.html` — trasparenza sul prototipo
- `assets/site.css`, `assets/site.js` — stile e comportamento del menu/moduli

## Limiti intenzionali
Nessun database, autenticazione, diario persistente, sistema di messaggistica reale, gestione reale dei permessi, sistema di prenotazione, pagamento, raccolta fondi o invio di moduli. Queste funzioni vanno progettate e implementate separatamente prima di essere presentate come attive.
