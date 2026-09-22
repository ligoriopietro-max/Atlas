/* Atlas — Interpretation Engine v0.2.6
 * Official release. Deterministic semantic interpretation layer.
 * Corpus contract: P01–P135 unchanged.
 */
(function () {
  "use strict";

  const DATA = window.ATLAS_DATA;
  const DOMAIN_KEYS = Object.keys(DATA.DOMAINS);
  const INTENT_KEYS = Object.keys(DATA.INTENTS);
  const BARRIER_KEYS = Object.keys(DATA.BARRIERS);

  function normalize(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "'")
      .trim();
  }
  function asArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value == null || value === "") return [];
    return [value];
  }
  function contains(value, phrase) { return normalize(value).includes(normalize(phrase)); }
  function aliasMatch(value, aliases) {
    const text = normalize(value);
    return (aliases || []).some(a => text === normalize(a) || text.includes(normalize(a)));
  }
  function emptyScores(keys) { return Object.fromEntries(keys.map(k => [k, 0])); }
  function add(scores, key, points) { if (scores[key] != null) scores[key] += points; }
  function rank(scores) {
    return Object.entries(scores).filter(([,v]) => v > 0).sort((a,b) => b[1] - a[1]);
  }

  function classifyNetwork(input) {
    const resources = asArray(input.resources);
    const rt = normalize(resources.join(" ") + " " + (input.resourcesOther || ""));
    const gaps = normalize(asArray(input.gaps).join(" "));
    const barriers = normalize(asArray(input.barriers).join(" "));
    const none = resources.some(r => normalize(r) === "none") || aliasMatch(rt, DATA.RESOURCE_ALIASES.none);
    const coordinationGap = aliasMatch(gaps, DATA.GAP_ALIASES.D09) || aliasMatch(barriers, DATA.BARRIER_ALIASES.B10) || contains(rt,"non collaborano") || contains(rt,"non comunicano");
    const ineffective = aliasMatch(barriers, DATA.BARRIER_ALIASES.B13) || aliasMatch(barriers, DATA.BARRIER_ALIASES.B14) || contains(input.need,"percorso non funziona");
    const newDifficulty = DATA.PHASE_ALIASES.nuove_difficolta.some(a => normalize(input.phase) === normalize(a)) || aliasMatch(input.need, DATA.NEED_ALIASES.D14);
    if (none || resources.length === 0) return "N0";
    if (ineffective) return "N4";
    if (coordinationGap && resources.length >= 2) return "N3";
    if (newDifficulty && resources.length >= 1 && !coordinationGap && !ineffective) return "N5";
    if (resources.length === 1) return "N1";
    return "N2";
  }

  function scorePhase(input, scores) {
    const p = normalize(input.phase);
    if (DATA.PHASE_ALIASES.dubbi.some(a => p === normalize(a))) { add(scores,"D01",1); add(scores,"D06",1); }
    else if (DATA.PHASE_ALIASES.diagnosi.some(a => p === normalize(a))) { add(scores,"D01",1); add(scores,"D06",1); }
    else if (DATA.PHASE_ALIASES.post_diagnosi.some(a => p === normalize(a))) add(scores,"D01",1);
    else if (DATA.PHASE_ALIASES.percorso_avviato.some(a => p === normalize(a))) { add(scores,"D09",1); add(scores,"D10",1); }
    else if (DATA.PHASE_ALIASES.nuove_difficolta.some(a => p === normalize(a))) add(scores,"D14",1);
  }

  function scoreNeedBase(input, scores) {
    const text = normalize(input.need);
    for (const d of DOMAIN_KEYS) if (aliasMatch(text, DATA.NEED_ALIASES[d])) add(scores,d,2);
    if (contains(text,"professionisti") && contains(text,"terapie")) { add(scores,"D02",1); add(scores,"D07",1); }
    if (contains(text,"organizzare terapie")) { add(scores,"D10",2); add(scores,"D07",1); }
    // v0.2.2: explicit second-opinion wording is contextual, not an unconditional D04 assignment.
  }

  function scoreGaps(input, scores) {
    for (const gap of asArray(input.gaps)) for (const d of DOMAIN_KEYS) if (DATA.GAP_ALIASES[d] && aliasMatch(gap, DATA.GAP_ALIASES[d])) add(scores,d,3);
  }
  function scoreBarriers(input, scores) {
    for (const barrier of asArray(input.barriers)) for (const b of BARRIER_KEYS) if (aliasMatch(barrier, DATA.BARRIER_ALIASES[b])) {
      switch(b){
        case "B01": add(scores,"D01",2); break; case "B02": add(scores,"D03",2); break; case "B03": add(scores,"D06",2); break;
        case "B04": case "B05": add(scores,"D05",3); break; case "B06": add(scores,"D13",3); break; case "B07": break;
        case "B08": add(scores,"D10",3); break; case "B09": add(scores,"D10",2); break; case "B10": add(scores,"D09",3); break;
        case "B11": add(scores,"D12",2); break; case "B12": add(scores,"D15",3); break; case "B13": case "B14": add(scores,"D14",3); break;
      }
    }
  }
  function scoreIntent(input, intentScores) {
    const text = normalize(input.intent || input.goal || "");
    for (const i of INTENT_KEYS) if (aliasMatch(text, DATA.INTENT_ALIASES[i])) add(intentScores,i,3);
    if (aliasMatch(text, DATA.INTENT_ALIASES.I02_COST)) add(intentScores,"I10",1);
  }

  function context(input) {
    return {
      phase: normalize(input.phase),
      need: normalize(input.need),
      resources: normalize(asArray(input.resources).join(" ") + " " + (input.resourcesOther || "")),
      gaps: normalize(asArray(input.gaps).join(" ")),
      barriers: normalize(asArray(input.barriers).join(" ")),
      goal: normalize(input.intent || input.goal || "")
    };
  }
  function any(text, phrases) { return phrases.some(p => contains(text,p)); }

  // Semantic resource cues are intentionally curated. They are evidence patterns, not case IDs.
  const RESOURCE_CUES = {
    D02: ["npi", "neuropsicomotric", "educatore", "psicologa", "analista", "specialista", "centro con", "terapia/valutazione gratuita", "disponibile per nuovi utenti", "professionista", "npi competente", "npi con testimonianze reali", "npi senza lunga attesa", "educatore domiciliare serale", "neuropsicomotricita", "tecnico aba"],
    D07: ["valutare terapia", "intervento per", "terapie", "protocollo", "training", "centro/terapie", "valutare terapia dopo pianto persistente", "intervento per selettivita alimentare"],
    D08: ["gestione rifiuto", "selettivita alimentare", "problema sonno", "toilet training", "isolamento, cellulare", "lavaggio mani", "cambiamenti improvvisi", "dipendenza dal telefono", "attivita estive", "aggressivita", "interpretare cambiamenti improvvisi: tic vs comportamento; gestione crisi e sicurezza"],
    D09: ["presenza/supervisione npi nel centro", "collaborazione terapista-docente", "provider che non collaborano", "effetti tv a scuola", "passaggio ospedale-asl"],
    D11: ["sostegno", "lettura/scrittura", "funzionamento didattico", "scuole inclusive", "iter sostegno", "trovare scuola superiore"],
    D12: ["aiuti economici", "indennita", "invalidita", "b1/", "caregiver", "voucher"],
    D06: ["significato ecolalia", "compatibilita", "capire compatibilita risperidone + metilfenidato"],
    D15: ["stanchezza familiare"]
  };

  const DIAG_D01 = [
    "diagnosi e sviluppo", "interpretazione ados", "cut-off", "capire nuovi tic e possibili comorbilita", "secondo parere/diagnosi",
    "non confermata", "non confermato", "come interpretarlo", "come interpretare", "cosa significa", "da chiarire", "approfondire la diagnosi", "diagnosi da confermare"
  ];
  const DIAG_D04 = [
    "seconda opinione", "secondo parere", "altro parere", "second opinion", "diagnosi contrastante", "diagnosi contrastanti", "diagnosi diverse",
    "non ha riconosciuto la diagnosi", "non riconosce la diagnosi", "non riconoscimento della diagnosi", "secondo parere sul livello", "secondo parere/riconoscimento",
    "non sono convinta del livello", "non sono convinto del livello", "il livello non mi convince", "dubbio sul livello"
  ];
  const DECISION_D03 = [
    "scegliere tra", "quale scegliere", "come scegliere", "quale e meglio", "secondo voi e meglio", "confronto su progressi", "valutare protocollo",
    "frequenza/modalita supervisione", "due specialisti danno indicazioni opposte", "visioni totalmente opposte", "conflitto tra professionisti"
  ];

  function scoreSemanticContext(input, scores, network) {
    const c = context(input);
    const all = [c.need,c.resources,c.gaps,c.barriers].join(" ");
    const phaseTherapy = any(c.phase,["terapia","percorso avviato","percorso_avviato","percorso/intervento","terapia/intervento"]);
    const diagnosticPhase = any(c.phase,["diagnosi","post-diagnosi","post diagnosi","dubbi"]);

    // 1) Resource semantics: high-value structured evidence, but phase-aware for therapy.
    for (const [d,cues] of Object.entries(RESOURCE_CUES)) {
      const hits = cues.filter(x => contains(c.resources,x)).length;
      if (!hits) continue;
      let points = Math.min(6, hits * 3);
      if (d === "D07" && !phaseTherapy) points = Math.min(points,3);
      if (d === "D02" && any(c.resources,["npi","educatore","psicologa","analista","specialista","professionista","tecnico aba"]) ) points += 3;
      if (d === "D07" && phaseTherapy && any(c.resources,["centro/terapie","valutare terapia","intervento per","terapie","training"])) points += 4;
      if (d === "D08" && any(c.resources,["interpretare cambiamenti improvvisi: tic vs comportamento; gestione crisi e sicurezza"])) points += 5;
      if (d === "D06" && any(c.resources,["significato ecolalia","compatibilita","capire compatibilita risperidone + metilfenidato"])) points += 5;
      add(scores,d,points);
    }

    // 2) Diagnostic orientation: diagnostic phase or diagnostic evidence wins over generic therapy/access noise.
    const d1hits = DIAG_D01.filter(x => any(all,[x])).length;
    if (d1hits) add(scores,"D01", diagnosticPhase ? 6 + Math.min(3,d1hits-1)*2 : 5 + Math.min(2,d1hits-1)*2);
    if (any(c.phase,["diagnosi adulta"])) add(scores,"D01",8);
    if (any(c.need,["non confermata","non confermato","da chiarire","diagnosi da confermare"])) add(scores,"D01",3);

    // 3) Diagnostic second opinion / discordance.
    const d4hits = DIAG_D04.filter(x => any(all,[x])).length;
    const diagnosticConflict = any(all,["diagnosi contrastante","diagnosi contrastanti","diagnosi diverse","non riconoscimento della diagnosi","non riconosce la diagnosi","non ha riconosciuto la diagnosi","secondo parere/diagnosi","secondo parere sul livello","dubbio sul livello","non sono convinta del livello"]);
    const explicitSecondOpinion = any(all,["seconda opinione","secondo parere","altro parere","second opinion"]);
    if (d4hits) add(scores,"D04", 4 + Math.min(3,d4hits-1)*2);
    if (diagnosticConflict) add(scores,"D04",4);

    // 4) Decision support: explicit alternatives and professional disagreement.
    const d3hits = DECISION_D03.filter(x => any(all,[x])).length;
    if (d3hits) add(scores,"D03",6 + Math.min(2,d3hits-1)*2);
    const therapeuticDecision = phaseTherapy && (any(all,["quale scegliere","scegliere tra","come scegliere","secondo voi e meglio","due specialisti danno indicazioni opposte","visioni totalmente opposte","conflitto tra professionisti"]) || (explicitSecondOpinion && any(all,["terapia","terapie","protocollo","day hospital","specialista","npi"])));
    if (therapeuticDecision) add(scores,"D03",7);

    // 5) Explicit diagnostic context takes precedence over a generic second-opinion phrase.
    if (any(c.phase,["diagnosi adulta"]) && explicitSecondOpinion) add(scores,"D01",5);

    // 6) Coordination is semantic when resources/gaps explicitly describe collaboration.
    if (any(all,["coordinamento","collaborazione terapista-docente","provider che non collaborano","non collaborano","non comunicano","passaggio ospedale-asl"])) add(scores,"D09",5);

    // 7) School and rights semantics.
    if (any(all,["scuola","sostegno","pei","glo","insegnante di sostegno","scuole inclusive","iter sostegno","trovare scuola superiore"])) add(scores,"D11",4);
    if (any(all,["104","invalidita","indennita","b1","caregiver","voucher","aiuti economici","servizi pubblici"])) add(scores,"D12",4);

    // Functional precedence: explicit coordination evidence outranks provider-finder evidence.
    if (any(c.resources,["presenza/supervisione npi nel centro","collaborazione terapista-docente","provider che non collaborano","effetti tv a scuola","passaggio ospedale-asl"])) {
      add(scores,"D09",6);
      add(scores,"D02",-6);
      add(scores,"D11",-2);
    }

    // Therapy function outranks secondary school/family/access signals when the resource is explicitly a therapy pathway.
    if (phaseTherapy && any(c.resources,["centro/terapie","valutare terapia dopo pianto persistente","intervento per selettivita alimentare"])) {
      add(scores,"D07",7);
      add(scores,"D11",-4);
      add(scores,"D15",-3);
      add(scores,"D08",-4);
    }

    // Provider-finder evidence should clear the primary threshold even when waiting/distance is also present.
    if (any(c.resources,["npi competente","npi con testimonianze reali","npi senza lunga attesa","educatore domiciliare serale","neuropsicomotricita","terapia/valutazione gratuita"])) {
      add(scores,"D02",5);
      add(scores,"D05",-2);
      add(scores,"D11",-3);
    }

    // v0.2.3 candidate: explicit provider-search intent should not depend on plural aliases or curated resource labels.
    if (any(c.goal,["trovare","cercare","conoscere"]) && any(c.need,["professionista","professionisti","terapista","terapisti","struttura","logopedista","tecnico aba","neuropsicomotricista","psicologo","psicologa","educatore","educatrice"])) {
      add(scores,"D02",4);
      add(scores,"D05",-1);
    }

    // Candidate A: explicit waiting/access cues represent D05 even inside diagnostic phase.
    if (any(all,["attesa troppo lunga","restituzione relazione","restituzione referto","referto in attesa","lista d'attesa"])) { add(scores,"D05",3); add(scores,"D01",-4); }
    // Candidate I: explicit calendar/organization requests need enough evidence to clear D10 threshold.
    if (any(c.goal,["organizzare","organizzazione"]) && any([c.need,c.gaps].join(" "),["calendario","giornaliero","organizzare le attivita"])) add(scores,"D10",5);
    // Candidate J: explicit school learning support needs a modest generalized D11 threshold boost.
    if (any(c.phase,["scuola"]) && any([c.need,c.gaps].join(" "),["lettura/scrittura","lettura","scrittura","attivita scolastiche"])) add(scores,"D11",2);

    // Candidate B: explicit provider search in a mixed diagnostic request gets a modest generalized boost.
    if (any(c.goal,["trovare","cercare","cerco"]) && any(c.resources,["npi","centro specializzato","professionista","psicologo","neuropsichiatra","logopedista"])) add(scores,"D02",1);

    // Candidate C: explicit comparison of alternatives is a direct D03 signal.
    if (any(c.goal,["confrontare"]) && any(c.need,["opzioni","modalita","alternative","confronto"])) add(scores,"D03",4);

    // Candidate D: explicit explanatory therapy-information requests belong to D06, not D07.
    if (any(c.goal,["capire","comprendere"]) && any(c.gaps,["informazioni sulle terapie","informazioni terapia","cosa sono"])) { add(scores,"D06",5); add(scores,"D07",-4); }

    // Candidate E: explicit private financial/cost-object cues strengthen D13 without overriding family-sustainability function.
    if (any(all,["costi","costo","spesa","spese","prezzo","tariffa","economico","economica","sostenere economicamente","bilancio familiare"])) add(scores,"D13",3);

    // Candidate L: distinguish cost as the primary object from cost as a secondary constraint.
    const costPrimary = any(all,["quanto costa","quanto costano","costo delle terapie","costi delle terapie","prezzo delle terapie","prezzi delle terapie","spesa mensile per le terapie","spesa mensile delle terapie","quanto si paga per la terapia","quanto si paga per le terapie","costo mensile delle terapie","costo mensile della terapia"]);
    const providerAffordability = any(c.goal,["trovare","cercare","cerco"]) && any(all,["professionista","professionisti","logopedista","psicologo","psicologa","centro","struttura","terapista","economico","economica","prezzo accessibile","costi bassi","spesa contenuta","conveniente","a buon prezzo"]);
    const choiceWithCost = any(c.goal,["scegliere","confrontare"]) && any(all,["costo","costi","prezzo","prezzi","spesa","spese","tariffa","economico","economica"]);
    const therapyEvalWithCost = any([c.need,c.gaps].join(" "),["efficacia terapia","valutazione efficacia terapia","trattamento adeguato","terapia non sta dando risultati","terapia procede lentamente"]) && any(all,["costo","costi","prezzo","spesa","tariffa"]);
    const familySustainabilityWithCost = any([all,c.goal].join(" "),["sostenibilita familiare","lavoro da casa","mancanza di reddito","stanchezza familiare","sostenere la famiglia","sostenibilita economica della famiglia","non riusciamo a sostenere","non possiamo permetterci"]) && any(all,["costo","costi","spesa","spese","prezzo","tariffa","economico","economica"]);
    if (costPrimary) { add(scores,"D13",8); add(scores,"D07",-6); add(scores,"D02",-3); add(scores,"D03",-3); }
    if (providerAffordability) { add(scores,"D02",7); add(scores,"D13",-6); }
    if (choiceWithCost && !costPrimary) { add(scores,"D03",4); add(scores,"D13",2); }
    if (therapyEvalWithCost && !costPrimary) { add(scores,"D07",4); add(scores,"D13",2); }
    if (familySustainabilityWithCost && !costPrimary) { add(scores,"D15",5); add(scores,"D13",2); }

    // Candidate F: explanatory therapy-information requests belong to D06.
    if (any(c.goal,["capire","comprendere"]) && any(c.need,["differenza","cosa sono","che cosa sono","informazioni","cos'e","cos e"])) { add(scores,"D06",5); add(scores,"D07",-4); }

    // Candidate G: explicit therapy-effectiveness/adequacy evaluation is D07, even with comparison wording.
    if (any([c.need,c.gaps].join(" "),["valutazione efficacia terapia","efficacia terapia","terapia procede lentamente","trattamento adeguato","terapia non sta dando risultati"])) { add(scores,"D07",7); add(scores,"D03",-4); add(scores,"D14",-2); }

    // Candidate H: explicit new-difficulty wording clears the D14 primary threshold.
    if (any(c.need,["nuova difficolta","nuove difficolta","problema emergente","comportamenti pericolosi che prima non c'erano"])) add(scores,"D14",5);

    // Candidate K: explicit diagnostic-information goals outrank incidental provider/resource mentions.
    if (any(c.goal,["capire","comprendere"]) && any([c.need,c.gaps].join(" "),["chiarezza diagnostica","informazioni diagnostiche","capire se","riconoscere se"]) && !any(c.goal,["trovare","cercare","cerco"])) { add(scores,"D06",5); add(scores,"D02",-7); }

    // 8) Family support is distinct from generic daily-life or school content.
    if (any(all,["stanchezza familiare","supporto famiglia","sostegno famiglia","aiuto ai genitori"])) add(scores,"D15",6);

    // 9) Daily-life semantic cues.
    if (any(all,["selettivita alimentare","gestione rifiuto","problema sonno","toilet training","isolamento, cellulare","aggressivita","lavaggio mani","dipendenza dal telefono","attivita estive"])) add(scores,"D08",4);

    // v0.2.3 candidate: explicit management requests for concrete daily-life functions.
    if (any(c.goal,["gestire","gestione"]) && any(c.need,["bagno","toilet","evacuazione","attesa","alimentazione","idratazione","selettivita","quotidiana","dipendenza dal telefono","telefono"])) add(scores,"D08",6);

    // 10) Important suppressions/precedence: avoid generic provider/access evidence overtaking the actual function.
    if (diagnosticPhase && (d1hits || diagnosticConflict)) {
      if (explicitSecondOpinion && !diagnosticConflict && any(c.phase,["diagnosi adulta"])) add(scores,"D01",2);
      add(scores,"D02",-2);
    }
    if (therapeuticDecision) {
      // A second opinion is an option inside a decision, not necessarily the function itself.
      if (!diagnosticConflict) add(scores,"D04",-Math.min(scores.D04, 8));
      add(scores,"D03",3);
    }
    if (diagnosticConflict) add(scores,"D04",3);

    // v0.2.3 candidate: when the user explicitly asks to clarify a conflicting diagnosis,
    // diagnostic second-opinion function outranks generic provider evidence.
    if (diagnosticConflict && any(c.goal,["chiarire diagnosi","capire diagnosi"])) { add(scores,"D04",2); add(scores,"D02",-2); }

    // v0.2.3 candidate: explicit therapeutic choice language.
    if (any(c.goal,["scegliere","confrontare"]) && any(c.need,["terapia","terapeutica","opzioni terapeutiche"])) { add(scores,"D03",7); add(scores,"D07",-3); }

    // v0.2.3 candidate: diagnostic/post-diagnostic next-step orientation.
    if (any(c.goal,["capire"]) && any(c.phase,["diagnosi","post_diagnosi","post-diagnosi","dubbi"]) && any(c.need,["prossimo passo","come andare avanti","incertezza sul percorso","progressi"])) add(scores,"D01",5);

    // v0.2.3 candidate: rights/bureaucracy signals independent of exact benefit wording.
    if (any(all,["inps","patronato","burocrazia","diritti","benefici","comma 2","comma 3"])) add(scores,"D12",4);

    // v0.2.3 candidate: family sustainability as a functional support request.
    if (any(c.goal,["trovare soluzione","sostenere la famiglia"]) && any(all,["sostenibilita familiare","lavoro da casa","mancanza di reddito","costi","distanza"])) add(scores,"D15",6);

    // Specific functional precedence for family-support cases.
    if (any(all,["stanchezza familiare"])) {
      add(scores,"D15",4);
      add(scores,"D11",-3);
      add(scores,"D02",-3);
    }
  }

  function applyInteractions(input, domainScores, intentScores, network) {
    const need=normalize(input.need), gaps=normalize(asArray(input.gaps).join(" ")), barriers=normalize(asArray(input.barriers).join(" ")), goal=normalize(input.intent||input.goal||""), phase=normalize(input.phase);
    if (network === "N0" && contains(barriers,"non so chi contattare")) add(domainScores,"D01",3);
    if (contains(need,"professionisti") && contains(gaps,"professionisti") && contains(goal,"trovare")) add(domainScores,"D02",4);
    if (network === "N3" && contains(gaps,"coordinamento") && (contains(barriers,"coordinamento") || contains(barriers,"non collaborano"))) { add(domainScores,"D09",5); add(domainScores,"D02",-3); add(domainScores,"D10",-2); }
    if (network === "N2" && (contains(barriers,"disponibilita")||contains(barriers,"attesa")) && (contains(goal,"ridurre")||contains(goal,"attesa"))) add(domainScores,"D05",6);
    if (contains(gaps,"professionisti") && contains(barriers,"scegliere") && contains(goal,"confrontare")) add(domainScores,"D03",6);
    if ((contains(phase,"percorso_avviato")||contains(phase,"percorso avviato")) && (contains(barriers,"non adatta")||contains(barriers,"inefficace"))) { add(domainScores,"D14",4); if(contains(goal,"trovare")) add(domainScores,"D02",2); }
    if (contains(need,"informazioni") && (contains(goal,"capire")||contains(goal,"comprendere"))) add(domainScores,"D06",5);
    if (contains(need,"prossimo passo") && contains(goal,"iniziare")) add(domainScores,"D01",6);
    if (DATA.PHASE_ALIASES.nuove_difficolta.some(a=>phase===normalize(a)) && contains(gaps,"quotidiana") && (contains(goal,"gestire")||contains(goal,"supporto"))) { add(domainScores,"D14",3); add(domainScores,"D08",3); }
    if (contains(barriers,"coordinamento") && !contains(gaps,"coordinamento")) add(domainScores,"D10",-2);
    if (contains(goal,"scuola")||contains(goal,"servizi")||contains(goal,"istituzioni")) { add(domainScores,"D11",3); add(domainScores,"D12",3); }
  }

  function classifyIntent(intentScores){
    const r=rank(intentScores); if(!r.length)return{primary:null,secondary:[]}; const p=r[0]; return {primary:p[0],secondary:r.slice(1).filter(([,v])=>v>=3&&p[1]-v<=3).map(([k])=>k)};
  }
  function classifyConfidence(ranked,network){
    if(!ranked.length)return"LOW"; const first=ranked[0][1],second=ranked[1]?ranked[1][1]:0,conv=ranked.filter(([,v])=>v>=Math.max(3,first-3)).length;
    if(first>=6&&first-second>=3&&conv>=2)return"HIGH"; if(first>=4&&conv>=2)return"MEDIUM"; if(network==="N3"||network==="N4")return"MEDIUM"; return"LOW";
  }
  function classifyPriority(input,domainScores,network){
    const barriers=normalize(asArray(input.barriers).join(" ")),r=rank(domainScores),top=r[0]?r[0][0]:null;
    if(network==="N4"||contains(barriers,"attesa troppo lunga")||contains(barriers,"nessuna disponibilita")||top==="D09"||top==="D14")return"P2";
    if(top==="D06"||top==="D01")return"P4"; if(top)return"P3"; return"P4";
  }
  function buildConstraints(input){return{comune:input.comune||"",provincia:input.provincia||"",distanza:input.distance||input.distanza||"",online:input.online||"",feasibility_only:true};}

  function buildProfile(input){
    input=input||{}; const domainScores=emptyScores(DOMAIN_KEYS), intentScores=emptyScores(INTENT_KEYS);
    scorePhase(input,domainScores); scoreNeedBase(input,domainScores); scoreGaps(input,domainScores); scoreBarriers(input,domainScores); scoreIntent(input,intentScores);
    const network=classifyNetwork(input); scoreSemanticContext(input,domainScores,network); applyInteractions(input,domainScores,intentScores,network);
    const rankedDomains=rank(domainScores); const primary=rankedDomains[0]&&rankedDomains[0][1]>=6?rankedDomains[0][0]:null;
    const secondary=primary?rankedDomains.slice(1).filter(([,v])=>v>=4&&domainScores[primary]-v<=3).map(([k])=>k):rankedDomains.filter(([,v])=>v>=4).slice(0,3).map(([k])=>k);
    const intent=classifyIntent(intentScores);
    return {version:"0.2.6",phase:input.phase||null,need:input.need||null,network,gaps:asArray(input.gaps),barriers:asArray(input.barriers),intent:intent.primary,secondary_intents:intent.secondary,domains:rankedDomains.map(([key,score])=>({key,label:DATA.DOMAINS[key],score})),primary_domain:primary,secondary_domains:secondary,priority:classifyPriority(input,domainScores,network),constraints:buildConstraints(input),confidence:classifyConfidence(rankedDomains,network),scores:{domain:domainScores,intent:intentScores},safety_gate:{status:"NOT_IMPLEMENTED",note:"P1 richiede una domanda di sicurezza dedicata prima di poter essere assegnata."}};
  }
  window.AtlasEngine={buildProfile,classifyNetwork,domainLabel:key=>DATA.DOMAINS[key]||key,intentLabel:key=>DATA.INTENTS[key]||key};
})();
