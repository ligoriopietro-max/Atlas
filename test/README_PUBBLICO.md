# Atlas — Test pubblico v0.8.2

Build candidata al primo test umano controllato.

## Cosa verifica

Atlas prova a capire il bisogno funzionale espresso dalla famiglia e propone il prossimo passo. Quando la richiesta è una ricerca sufficientemente specifica, il test può mostrare risultati **solo sintetici di laboratorio**.

Le schede mostrate non rappresentano professionisti reali, non sono prenotabili e non costituiscono raccomandazioni cliniche.

## Build

**Public build:** 0.8.2

**Interpreter:** 0.3.2

**Safety Gate:** 0.2

**Assembler:** 0.2

Il motore Atlas v0.2.6 resta congelato.

## Verifiche interne prima della pubblicazione

- Stress funzionale nuovo: **56/56** sui casi aggiunti in questa iterazione
- Human Test Pack: **15/15** classificazioni + safety gate verificato separatamente
- Safety: self-harm / suicidality: **BLOCK**
- Matching terapista comportamentale + Lecce: **1 risultato compatibile, 100%**
- Accesso/lista d'attesa: **D05**
- Coordinamento: **D09** anche nelle formulazioni colloquiali come “facciamo fatica a coordinarli”
- Scuola/transizione: **D11**

Le suite storiche del progetto rimangono riferimento di regressione; questa build non modifica il motore congelato.

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
