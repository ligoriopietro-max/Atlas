# Atlas CAA — prototipo 0.1.8

## Stato
Questa è una copia separata dal sito pubblico Atlas. La versione 0.1.8 integra localmente il catalogo Mulberry Symbols 3.6.1 oltre ai simboli dimostrativi Atlas. Non sostituisce né modifica il sito pubblico.

**Importante:** è un prototipo tecnico, non un vocabolario CAA italiano validato. Le etichette `[EN]` sono in inglese; significati e simboli vanno verificati con la persona e con professionisti CAA.

## Funzioni
- Catalogo locale con simboli dimostrativi Atlas e simboli Mulberry Symbols 3.6.1
- Griglia rapida toccabile
- Creazione di tabelle con ricerca e categorie
- Rimozione e riordino tramite selezione delle caselle
- Salvataggio locale nel browser
- Esportazione delle tabelle salvate in un file JSON di backup
- Importazione del backup su un altro browser/dispositivo, per le tabelle basate sul catalogo incluso
- Sintesi vocale italiana se supportata dal dispositivo
- Stampa / salvataggio PDF con regole di stampa migliorate per preservare colori e layout
- Manifest e icona per installazione PWA
- Service worker aggiornato per la cache offline dopo il primo caricamento
- Interfaccia adattiva per smartphone e desktop

## Provenienza e limiti dei pittogrammi
I simboli dimostrativi Atlas sono accompagnati dal catalogo Mulberry Symbols 3.6.1, distribuito secondo CC BY-SA 4.0. I file sono inclusi localmente; dopo l’apertura iniziale tramite un server locale o HTTPS, il service worker può rendere disponibile la versione offline.

**Limite importante:** sono una base grafica per test tecnici, non un vocabolario CAA standardizzato né simboli clinicamente validati. La corrispondenza fra immagine, parola e significato va verificata con le persone che useranno le tabelle e con professionisti CAA. Per un set standardizzato futuro, Mulberry Symbols dichiara la licenza CC BY-SA 4.0 e richiede attribuzione e condivisione allo stesso modo delle eventuali modifiche: https://mulberrysymbols.org/ e https://github.com/mulberrysymbols/mulberry-symbols. La raccolta ufficiale non è inclusa in questa versione.

## Come provare
1. Estrai lo ZIP in una cartella.
2. Per provare le funzioni di base, apri `index.html` in un browser moderno.
3. Per provare installazione e modalità offline, pubblicalo su HTTPS o avvialo con un server locale; il service worker non funziona pienamente aprendo direttamente il file dal disco.
4. In stampa, se il browser offre l'opzione, abilita **Grafica di sfondo / Stampa sfondi** e verifica che la modalità colore non sia impostata su scala di grigi. La pagina chiede al browser di preservare i colori e stampa immagini SVG locali; non può sovrascrivere le impostazioni manuali della stampante o del browser. La resa finale va verificata sul dispositivo usato.

## Verifiche ancora necessarie prima dell'integrazione pubblica
- Validare i pittogrammi con famiglie e professionisti CAA e valutare l’integrazione di un set standardizzato con licenza documentata.
- Provare il PDF sui browser e dispositivi target, inclusi Android e iOS.
- Verificare installazione e offline su HTTPS.
- Fare test d'uso con famiglie e professionisti CAA.

Questa versione è un prototipo tecnico e non un dispositivo medico né un sostituto della valutazione e del supporto di professionisti CAA.

## Attribuzione dei pittogrammi originali
Illustrazioni vettoriali originali create per il prototipo Atlas CAA, versione 0.1.3. Nessuna immagine di terze parti è inclusa nel catalogo di questa versione.


## Versione 0.1.4 — catalogo fotografico di prova

Questa versione sostituisce i pittogrammi stilizzati con immagini realistiche su fondo chiaro, ritagliate dal foglio dimostrativo generato per il prototipo. Il catalogo contiene 48 voci in 6 categorie. Le immagini sono un test visivo iniziale, non un set CAA clinicamente validato né simboli standardizzati; prima di un rilascio pubblico occorre verificare leggibilità, rappresentatività e adeguatezza delle immagini.


## Versione 0.1.8 — catalogo esteso

- Integrati 3.436 simboli SVG Mulberry Symbols 3.6.1 in locale.
- Ricerca per etichetta, nome inglese originale e tag; filtro per categoria.
- Le etichette non tradotte sono contrassegnate `[EN]`; le traduzioni italiane inserite sono ausiliarie e richiedono verifica.
- Attribuzione e licenza CC BY-SA 4.0 riportate in `LICENZA-PITTOGRAMMI.txt`.
- Per contenere i tempi di caricamento, la schermata mostra fino a 180 risultati alla volta; restringere la ricerca per vedere il simbolo desiderato.

## Aggiornamento 0.1.8 (ricostruzione)
- Corrette/controllate le immagini e le etichette del catalogo.
- Traduzioni italiane aggiuntive: 11 voci (indicative, da verificare).
- Archivio ricostruito dalla versione precedente fornita dall’utente; non è una copia verificata del precedente rilascio con questo numero.
