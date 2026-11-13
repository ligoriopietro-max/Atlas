# Atlas — sito pubblico v1.1 (logo e installazione)

Questa versione sostituisce la A provvisoria con il simbolo del logo Progetto Atlas in header e footer, aggiunge manifest e icone PWA e un pulsante in homepage per aggiungere Atlas alla schermata Home.

## Pubblicazione
Caricare il contenuto della cartella `atlas-site-v1` nella root del repository GitHub Pages, sovrascrivendo i file omonimi. Non cancellare né sovrascrivere la cartella `test/` già presente nel repository.

## Installazione su smartphone
Il sito usa `manifest.webmanifest`, icone PNG e `sw.js`. Il pulsante in homepage invoca la finestra di installazione quando il browser la supporta; su iPhone/iPad mostra le istruzioni per Safari. La disponibilità effettiva dipende da browser, sistema operativo e condizioni PWA.

## Nota
Il service worker offre una cache di base per la shell del sito; non trasforma i moduli dimostrativi in servizi funzionanti e non aggiunge backend, login o archivio editoriale. Il motore di orientamento non è incluso né modificato.
