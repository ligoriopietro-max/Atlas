# Atlas — Test pubblico v0.8.1

## Candidato pubblicabile

Questa è la build destinata al primo test umano pubblico controllato.

### Cosa fa

Atlas riceve una descrizione libera della situazione familiare e prova a identificare il bisogno principale, proporre il prossimo passo e, quando appropriato, simulare una ricerca su dati dimostrativi.

### Importante

- È un prototipo sperimentale.
- Non fornisce diagnosi né indicazioni cliniche.
- Non effettua prenotazioni.
- I risultati di matching sono dati sintetici di laboratorio.
- Non inserire nomi, indirizzi, numeri di telefono o altri dati identificativi.
- Il feedback e la sessione vengono esportati solo quando l'utente sceglie esplicitamente di farlo.

### Test eseguiti prima della pubblicazione

- Corpus naturale: 50/50
- Golden congelati: 21/21
- Human Test: 16/16
- Boundary: 30/30
- Stress funzionale nuovo: 140/140
- Matching: PASS
- Multi-turn e correzione: PASS
- Safety gate: PASS
- Sintassi JavaScript: PASS
- Riferimenti degli asset: PASS

Il motore Atlas v0.2.6 resta congelato; questa build aggiorna esclusivamente il livello interprete/assembler sopra il motore.
