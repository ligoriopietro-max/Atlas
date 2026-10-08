# Atlas — Test pubblico v0.8.4 — Assistenza familiare

Build candidata al primo test umano controllato.

## Cosa verifica

Atlas prova a capire il bisogno funzionale espresso dalla famiglia e propone il prossimo passo. Quando la richiesta è una ricerca sufficientemente specifica, il test può mostrare risultati **solo sintetici di laboratorio**.

Le schede mostrate non rappresentano professionisti reali, non sono prenotabili e non costituiscono raccomandazioni cliniche.

## Build

**Public build:** 0.8.4

**Interpreter:** 0.3.3

**Safety Gate:** 0.2

**Assembler:** 0.2

Il motore Atlas v0.2.6 resta congelato.

## Verifiche interne prima della pubblicazione

- Nuove casistiche assistenza familiare: **4/4** riconosciute come D02; le richieste incomplete restano in `needs_input` finché manca la località o la modalità online.
- Negazione della ricerca di una babysitter/assistente con richiesta informativa: **2/2** riconosciute come D06.
- Regressione sui casi già coperti: **3/3** (terapista comportamentale + Lecce → D02; coordinamento → D09; scuola/transizione → D11).
- Safety gate: self-harm / suicidality **BLOCK**; richiesta ordinaria di babysitter **PASS**.
- Script referenziati da `index.html`: **24/24 presenti**.
- Sintassi JS dei tre file modificati: **OK**.
- Integrità ZIP: **OK**.

Il motore Atlas v0.2.6 resta congelato. Questa build estende il livello di interpretazione/profilazione e non modifica il motore di classificazione congelato.

## Pubblicazione GitHub Pages

Caricare nel repository `/test/` il contenuto di questo pacchetto, sostituendo i file omonimi della build precedente. Non mantenere due versioni dell'interprete o dell'assembler richiamate contemporaneamente da `index.html`.

Dopo il caricamento usare `Ctrl+F5` o una finestra anonima per il primo controllo, poi verificare almeno:

1. `Cerco un logopedista a Lecce.`
2. `Cerco un terapista comportamentale a Lecce.`
3. `Ho già trovato il centro, ma mi hanno dato sei mesi di attesa. Come posso accedere prima?`
4. `Abbiamo diversi terapisti e facciamo fatica a coordinarli.`
5. `Mio figlio inizierà la scuola dell’infanzia e non sappiamo come prepararci.`

## Privacy del test

Feedback e sessioni vengono esportati localmente dal browser. Il pacchetto non invia automaticamente le sessioni a un server.
