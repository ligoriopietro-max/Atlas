/* Atlas — Data Layer v0.2.1
 * Deterministic, explainable rules. No AI/API dependency.
 */
window.ATLAS_DATA = {
  VERSION: "0.2.1",

  WEIGHTS: { D1: 1, D2: 2, D3: 2, D4: 3, D5: 2, D6: 1, D7: 3 },

  DOMAINS: {
    D01: "ORIENTAMENTO",
    D02: "MATCHING / RICERCA",
    D03: "SCELTA / CONFRONTO",
    D04: "SECONDA OPINIONE",
    D05: "ACCESSO",
    D06: "INFORMAZIONE / AFFIDABILITÀ",
    D07: "TERAPIE / INTERVENTI",
    D08: "QUOTIDIANITÀ / AUTONOMIA",
    D09: "COORDINAMENTO",
    D10: "ORGANIZZAZIONE FAMILIARE",
    D11: "SCUOLA / TRANSIZIONI",
    D12: "DIRITTI / BUROCRAZIA / SERVIZI PUBBLICI",
    D13: "COSTO / SOSTENIBILITÀ ECONOMICA",
    D14: "NUOVA DIFFICOLTÀ",
    D15: "SUPPORTO ALLA FAMIGLIA"
  },

  INTENTS: {
    I01: "ORIENTARSI",
    I02: "CERCARE",
    I03: "SCEGLIERE",
    I04: "CONFRONTARE",
    I05: "CAMBIARE",
    I06: "ACCELERARE",
    I07: "COORDINARE",
    I08: "ORGANIZZARE",
    I09: "CAPIRE",
    I10: "GESTIRE"
  },

  BARRIERS: {
    B01: "NON SO CHI CONTATTARE",
    B02: "NON SO COME SCEGLIERE",
    B03: "INFORMAZIONI CONFUSE / INAFFIDABILI",
    B04: "NESSUNA DISPONIBILITÀ",
    B05: "ATTESA TROPPO LUNGA",
    B06: "COSTO TROPPO ALTO",
    B07: "DISTANZA / TERRITORIO",
    B08: "ORARI INCOMPATIBILI",
    B09: "TROPPE PERSONE / SERVIZI DA GESTIRE",
    B10: "MANCANZA DI COORDINAMENTO",
    B11: "BUROCRAZIA",
    B12: "MANCANZA DI ENERGIA / SUPPORTO",
    B13: "SOLUZIONE NON ADATTA",
    B14: "PERCORSO GIÀ AVVIATO MA INEFFICACE"
  },

  NETWORK: {
    N0: "NESSUNA RETE",
    N1: "RETE MINIMA",
    N2: "RETE PRESENTE",
    N3: "RETE FRAMMENTATA",
    N4: "RETE INEFFICACE",
    N5: "RETE ADEGUATA + NUOVO PROBLEMA"
  },

  PHASE_ALIASES: {
    dubbi: ["dubbi", "dubbio", "sospetto"],
    diagnosi: ["diagnosi", "valutazione"],
    post_diagnosi: ["post_diagnosi", "post-diagnosi", "post diagnosi"],
    percorso_avviato: ["percorso_avviato", "percorso avviato", "terapia", "percorso"],
    nuove_difficolta: ["nuove_difficolta", "nuove difficoltà", "nuova difficoltà"]
  },

  NEED_ALIASES: {
    D01: ["non so chi contattare", "non so il prossimo passo", "non so cosa fare", "non so da dove iniziare", "disorientato", "disorientata"],
    D02: ["professionista", "professionisti", "struttura", "strutture", "centro", "centri", "trovare un professionista", "trovare servizio", "terapie"],
    D03: ["scegliere", "confrontare", "confronto", "quale scegliere", "come scegliere", "opzioni"],
    D04: ["seconda opinione", "second opinion", "secondo parere", "altro parere", "riconoscimento", "diagnosi contrastante"],
    D05: ["disponibilità", "attesa", "lista d'attesa", "tempi", "accesso"],
    D06: ["informazioni affidabili", "informazione", "informazioni", "capire", "spiegazione"],
    D07: ["terapie", "terapia", "interventi", "organizzare terapie", "percorso terapeutico"],
    D08: ["quotidianità", "vita quotidiana", "alimentazione", "sonno", "comportamento", "autonomia", "attività quotidiane"],
    D09: ["coordinare persone", "coordinamento", "comunicazione tra", "non collaborano", "non comunicano"],
    D10: ["organizzare terapie", "organizzazione", "orari", "gestire appuntamenti", "famiglia", "vita familiare"],
    D11: ["scuola", "insegnante di sostegno", "supporto scolastico", "transizione", "peI", "glo"],
    D12: ["benefici", "diritti", "burocrazia", "servizi pubblici", "asl", "comune", "104", "prestazioni"],
    D13: ["costi", "costo", "economico", "sostenibile", "spese"],
    D14: ["percorso non funziona", "nuova difficoltà", "nuovo problema", "peggioramento", "cambiamento"],
    D15: ["supporto famiglia", "sostegno famiglia", "famiglia", "aiuto ai genitori"]
  },

  GAP_ALIASES: {
    D01: ["informazione/orientamento", "informazione", "orientamento", "dove iniziare", "prossimo passo"],
    D02: ["professionisti/strutture", "professionisti", "strutture", "professionista", "servizi"],
    D07: ["terapie/interventi", "terapie", "interventi"],
    D05: ["servizi locali", "locali", "servizi"],
    D11: ["scuola"],
    D12: ["diritti/benefici/burocrazia", "diritti", "benefici", "burocrazia"],
    D08: ["organizzazione quotidiana", "quotidiana", "vita quotidiana"],
    D09: ["coordinamento"],
    D15: ["supporto familiare", "famiglia"]
  },

  BARRIER_ALIASES: {
    B01: ["non so chi contattare"],
    B02: ["non so come scegliere"],
    B03: ["informazioni troppo confuse", "informazioni confuse", "informazioni inaffidabili", "troppa informazione"],
    B04: ["nessuna disponibilità", "non c'è disponibilità", "disponibilità"],
    B05: ["attesa troppo lunga", "attesa", "lista d'attesa", "tempi troppo lunghi"],
    B06: ["costi troppo alti", "costo troppo alto", "costi", "costo"],
    B07: ["servizi troppo lontani", "troppo lontano", "distanza", "territorio"],
    B08: ["orari incompatibili", "orari", "schedules"],
    B09: ["troppe persone", "troppi servizi", "da gestire"],
    B10: ["coordinazione", "coordinamento", "non collaborano", "non comunicano"],
    B11: ["burocrazia", "difficoltà burocratiche", "istituzionali"],
    B12: ["non abbastanza energia", "mancanza di energia", "mancanza di supporto"],
    B13: ["soluzione non adatta", "non adatto", "non adatta"],
    B14: ["percorso già avviato ma inefficace", "percorso non funziona", "inefficace"]
  },

  INTENT_ALIASES: {
    I01: ["capire dove iniziare", "dove iniziare", "orientarsi", "prossimo passo"],
    I02: ["trovare il professionista giusto", "trovare professionista", "trovare servizio", "trovare professionista/servizio", "servizi in area"],
    I03: ["scegliere", "scegliere tra opzioni"],
    I04: ["confrontare opzioni", "confrontare", "confronto"],
    I05: ["cambiare", "cambiare professionista", "cambiare servizio"],
    I06: ["ridurre attesa", "ridurre il tempo di attesa", "ridurre waiting", "accelerare"],
    I07: ["coordinare", "coordinare persone", "coordinamento"],
    I08: ["organizzare percorso", "organizzare", "organizzare il percorso"],
    I09: ["capire", "comprendere", "capire cosa succede", "informazioni"],
    I10: ["gestire", "gestire la difficoltà", "supporto", "supporto per la famiglia"],
    I02_COST: ["soluzione compatibile con i costi", "soluzione cost-compatible", "trovare soluzione economica", "soluzione sostenibile"]
  },

  RESOURCE_ALIASES: {
    pediatrician: ["pediatra", "pediatrician"],
    specialist: ["specialista", "professionista", "npi", "neuropsichiatra"],
    center: ["centro", "struttura"],
    therapies: ["terapie", "terapia", "terapisti"],
    school: ["scuola", "insegnante", "sostegno"],
    asl: ["asl", "servizi sanitari locali"],
    municipality: ["comune", "servizi sociali"],
    association: ["associazione", "gruppo di supporto"],
    none: ["nessuno", "none"]
  }
};
