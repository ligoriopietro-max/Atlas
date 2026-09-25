/*
 * Atlas Input Interpreter v0.1 — EXPERIMENTAL
 *
 * Purpose:
 *   Convert family free text into the existing Atlas input contract.
 *
 * Governance:
 *   - Does NOT modify atlas-engine-v0.2.6.js
 *   - Does NOT modify the questionnaire or released normalizer
 *   - Experimental only; not for public deployment
 *   - Deterministic/rule-based prototype. No LLM calls.
 */
(function(){
  'use strict';

  const DOMAIN_RULES = [
    {domain:'D04', patterns:[/second[ao] opinione/i,/secondo parere/i,/altro parere/i,/nuovo parere/i,/parere diverso/i,/non.*convint[oa].*(diagnos|livello)/i,/diagnosi.*(diversa|contrastante|non riconosciuta)/i,/non.*riconosc.*diagnos/i,/diagnosi diverse/i,/hanno dato diagnosi diverse/i], weight:6},
    {domain:'D15', patterns:[/sono esaust/i,/sono stanc[oa]/i,/sono devastat/i,/disperat[oa]/i,/non ce la faccio/i,/come arrivare sana di mente/i,/aiuto.*genitor/i,/sostegno.*famiglia/i,/carico.*famiglia/i], weight:6},
    {domain:'D12', patterns:[/\b104\b/i,/\binps\b/i,/patronato/i,/burocraz/i,/diritti/i,/benefici/i,/invalidit/i,/indennit/i,/misura b1/i,/accompagnamento/i,/caregiver.*comun/i,/prestazioni.*pubblic/i], weight:7},
    {domain:'D11', patterns:[/scuola/i,/insegnante di sostegno/i,/sostegno scolast/i,/\bpei\b/i,/\bglo\b/i,/docente/i,/maestra/i,/professore/i,/esame di stato/i,/didattica personalizzata/i,/scuola.*inclusiv/i], weight:6},
    {domain:'D09', patterns:[/coordinare/i,/coordinamento/i,/comunicazione tra/i,/non comunicano/i,/non collaborano/i,/obblighi.*non collaborare/i,/mettere.*d'accordo/i,/ospedale.*asl/i,/centro.*collabor/i,/rete.*profession/i], weight:7},
    {domain:'D08', patterns:[/selettivit[aà] alimentare/i,/problemi.*dormire/i,/non riesce.*dormire/i,/spannolinamento/i,/tagliarsi i capelli/i,/lavaggio mani/i,/paura dello sporco/i,/comportamenti problema/i,/intrattenerli/i,/routine/i,/telefono.*togliere/i,/tv.*crisi/i,/sonno/i,/alimentazione/i,/autonomia/i], weight:6},
    {domain:'D07', patterns:[/terapi[ae]/i,/psicomotric/i,/logopedia/i,/aba/i,/fisioterapia/i,/supervisore.*terapia/i,/percorso.*terapeut/i,/funziona.*terapia/i,/terapia.*funziona/i,/selettivit[aà] alimentare.*terapia/i], weight:5},
    {domain:'D03', patterns:[/come scegliere/i,/quale scegliere/i,/confrontare/i,/confronto/i,/testimonianze/i,/quale.*meglio/i,/opzioni/i,/protocollo.*biomed/i,/come mai.*dottor/i,/due dottori/i,/parere.*(terapia|intervento)/i], weight:5},
    {domain:'D02', patterns:[/\bcerco\b/i,/cercavo/i,/cercando/i,/conoscete.*qualcuno/i,/avete da consigliare/i,/indicatemi/i,/si rende disponibile/i,/bravo neuropsichiatra/i,/neuropsichiatra.*napoli/i,/neuropsichiatra.*roma/i,/logopedia.*palermo/i,/educatrice.*domicilio/i,/specialista esperto/i,/dove.*portarlo.*terapia/i], weight:7},
    {domain:'D05', patterns:[/lista d'attesa/i,/lista.*lunga/i,/tempi di attesa/i,/attesa/i,/disponibil/i,/posto garantito/i,/appuntamento/i,/entro fine/i,/entro.*mese/i,/accesso/i], weight:4},
    {domain:'D06', patterns:[/cosa sarebbe/i,/cosa significa/i,/come funziona/i,/spiegare/i,/spiegazione/i,/interpretar/i,/interpretazione/i,/informazioni certe/i,/informazione.*farmac/i,/si possono dare entrambi/i,/che cosa.*(significa|vuol dire)/i,/cut.?off/i], weight:5},
    {domain:'D01', patterns:[/non so da dove iniziare/i,/non so cosa fare/i,/non so.*prossimo passo/i,/da dove partire/i,/come muovermi/i,/come muoversi/i,/cosa fare adesso/i,/tutto.*nuovo/i,/diagnosi.*non.*confermat/i,/non.*convin[tc].*diagnos/i,/valutazione.*non.*capire/i,/cosa avete fatto voi/i,/nuova difficolt[aà]/i,/mio figlio sta cambiando/i], weight:5}
  ];

  const INTENT_RULES = [
    ['I06', [/accelerare/i,/fare prima/i,/ridurre.*attesa/i,/attesa.*lunga/i,/prima possibile/i,/urgente/i]],
    ['I05', [/cambiare/i,/cambio.*centro/i,/cambiare.*terapia/i,/non funziona.*più/i,/nuovo professionista/i]],
    ['I07', [/coordinare/i,/coordinamento/i,/mettere.*d'accordo/i,/comunicazione tra/i,/non comunicano/i,/non collaborano/i]],
    ['I08', [/organizzare/i,/gestire appuntamenti/i,/orari/i,/organizzazione/i,/come gestire/i]],
    ['I04', [/confrontare/i,/confronto/i,/quale.*meglio/i,/opzioni/i]],
    ['I03', [/scegliere/i,/quale scegliere/i,/come scegliere/i]],
    ['I02', [/cerco/i,/cercando/i,/trovare/i,/indicatemi/i,/consigli.*(profession|centro|struttura|servizio)/i]],
    ['I09', [/capire/i,/cosa significa/i,/spiegare/i,/spiegazione/i,/interpretar/i,/interpretazione/i,/informazion/i]],
    ['I01', [/orientarmi/i,/orientarsi/i,/da dove iniziare/i,/da dove partire/i,/prossimo passo/i,/come muovermi/i,/come muoversi/i]],
    ['I10', [/gestire/i,/gestione/i,/affrontare/i]],
  ];

  function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim(); }
  function hasAny(t, patterns){ return patterns.some(p=>p.test(t)); }
  function matches(rule,t){ return rule.patterns.reduce((n,p)=>n+(p.test(t)?rule.weight:0),0); }

  function inferPhase(t){
    if(/\b53 anni\b|diagnosi.*adulta|adult[oa].*diagnos|a \d+ anni.*diagnos/i.test(t)) return 'diagnosi';
    if(/appena.*diagnos|dopo.*diagnos|post.?diagnos|diagnos.*(ricevut|arrivat|confermat)/i.test(t)) return 'post-diagnosi';
    if(/in valutazione|valutazione|ADOS|cut.?off|restituzione|test.*diagnos/i.test(t)) return 'valutazione';
    if(/nuov[oa].*(difficolt|problema|comportamento|tic|peggior)/i.test(t)) return 'nuova difficoltà';
    if(/scuola|PEI|GLO|insegnante di sostegno/i.test(t)) return 'percorso avviato';
    return '';
  }

  function inferResources(t){
    const out=[];
    // Mentioning a professional/service is NOT enough to call it a resource.
    // We require evidence that the family already has access to it.
    const active=/(abbiamo|ha|hanno|ci segue|seguit[oi]|siamo seguit|siamo in carico|frequentiamo|frequenta|ci ha prescritto|ci segue da|gia\s+seguit)/i;
    if(active.test(t) && /neuropsichiatr|npi|psichiatra|neurolog|medico|specialista/i.test(t)) out.push('NPI/medico/specialista');
    if(active.test(t) && /psicolog|logoped|terapist|psicomotric|fisioterap|aba/i.test(t)) out.push('psicologo/logopedista/terapista');
    if(active.test(t) && /centro|struttura/i.test(t)) out.push('centro/struttura');
    if(active.test(t) && /scuola|insegnante|maestra|docente|PEI|GLO/i.test(t)) out.push('scuola');
    if(active.test(t) && /ASL|servizi pubblici|comune|INPS|patronato/i.test(t)) out.push('servizi pubblici/ASL');
    return [...new Set(out)];
  }

  function inferGaps(t){
    const out=[];
    // Generic uncertainty is an orientation gap, but only when it is actually
    // expressed as a missing next step rather than merely occurring in context.
    if(/non so da dove|non so cosa fare|non sappiamo da dove|non sappiamo cosa fare|non so come muover|non so chi contattare|non riesco a capire da dove/i.test(t)) out.push('informazione/orientamento');
    if(/non.*(riconosci|convint|fiduc|accordo).*diagnos|diagnos.*(divers|contrast)|diagnosi diverse/i.test(t)) out.push('informazione/orientamento');
    // A provider gap requires explicit search/absence language. A provider merely
    // mentioned as background is not a gap.
    if(/cerco|cercavo|cercando|non trovo|non troviamo|non abbiamo.*(profession|specialist|centro)|manca.*(profession|specialist|centro)|nessun.*(profession|specialist|centro)|non so chi.*(contatt|rivolg)/i.test(t) && /profession|specialist|neuropsichiatr|centro|struttura/i.test(t)) out.push('professionisti/strutture');
    if(/lista d'attesa|attesa.*lunga|tempi.*lunghi|non c'erano piu posti|nessun posto/i.test(t)) out.push('servizi locali');
    if(/pubblico.*privato|privato.*pubblico|asl/i.test(t) && /access|serviz|percorso|richiest/i.test(t)) out.push('servizi');
    if(/costo|cost[ai]|spes[ae]|econom/i.test(t)) out.push('diritti/benefici/burocrazia');
    if(/non comunicano|non collaborano|coordinare|coordinamento/i.test(t)) out.push('coordinamento');
    if(/scuola|pei|glo|sostegno/i.test(t) && /manca|non abbiamo|non sappiamo|problema|difficolt|serve|cerco/i.test(t)) out.push('scuola');
    if(/selettivit[aà] alimentare|sonno|dormire|spannolinamento|routine|autonomia/i.test(t)) out.push('organizzazione quotidiana');
    if(/sono esaust|sono stanc|devastat|disperat|non ce la faccio|energia|supporto/i.test(t)) out.push('supporto familiare');
    return [...new Set(out)];
  }

  function inferBarriers(t){
    const out=[];
    if(/attesa|lista.*lunga|tempi.*lunghi|mesi|anno.*attesa/i.test(t)) out.push('attesa troppo lunga');
    if(/costo|cost[ai]|spes[ae]|econom/i.test(t)) out.push('costi troppo alti');
    if(/distanza|lontan|km|viaggiare/i.test(t)) out.push('servizi troppo lontani');
    if(/non so|non sappiamo|non riesco|non riusciamo|confus|disorient/i.test(t)) out.push('non so chi contattare');
    if(/scegliere|quale.*meglio|confronto/i.test(t)) out.push('non so come scegliere');
    if(/non comunicano|non collaborano|coordinare|coordinamento/i.test(t)) out.push('coordinamento');
    if(/burocraz|inps|patronato|104|diritt/i.test(t)) out.push('burocrazia');
    if(/privato.*lucro|lucro|non mi fido|diffiden/i.test(t)) out.push('informazioni inaffidabili');
    if(/non funziona|inefficace|nessun miglioramento/i.test(t)) out.push('percorso non funziona');
    if(/sono esaust|sono stanc|devastat|disperat|non ce la faccio/i.test(t)) out.push('mancanza di energia');
    return [...new Set(out)];
  }

  function inferIntent(t){
    const ordered=[
      ['I07',[/coordinare/i,/coordinamento/i,/mettere.*d'accordo/i,/comunicazione tra/i,/non comunicano/i,/non collaborano/i]],
      ['I06',[/accelerare/i,/fare prima/i,/ridurre.*attesa/i,/attesa.*lunga/i,/prima possibile/i,/urgente/i]],
      ['I05',[/cambiare/i,/cambio.*centro/i,/cambiare.*terapia/i,/non funziona.*piu/i,/nuovo professionista/i]],
      ['I04',[/confrontare/i,/confronto/i,/quale.*meglio/i,/opzioni/i]],
      ['I03',[/scegliere/i,/quale scegliere/i,/come scegliere/i]],
      ['I02',[/cerco/i,/cercavo/i,/trovare/i,/conoscete.*qualcuno/i,/avete da consigliare/i,/indicatemi/i,/si rende disponibile/i,/specialista esperto/i]],
      ['I09',[/cosa sarebbe/i,/cosa significa/i,/spiegare/i,/spiegazione/i,/interpretar/i,/interpretazione/i,/informazion/i,/capire/i]],
      ['I08',[/organizzare/i,/gestire appuntamenti/i,/orari/i,/organizzazione/i]],
      ['I01',[/orientarmi/i,/orientarsi/i,/da dove iniziare/i,/da dove partire/i,/prossimo passo/i,/come muovermi/i,/come muoversi/i]],
      ['I10',[/gestire/i,/gestione/i,/affrontare/i,/supporto/i]],
    ];
    for(const [intent,patterns] of ordered) if(hasAny(t,patterns)) return intent;
    return '';
  }

  function inferNeed(t, domain){
    const needs={D01:'non so il prossimo passo',D02:'professionisti/strutture',D03:'confrontare',D04:'seconda opinione',D05:'disponibilità',D06:'informazione',D07:'terapie/interventi',D08:'organizzazione quotidiana',D09:'coordinamento',D11:'scuola',D12:'diritti/benefici/burocrazia',D15:'supporto familiare'};
    return needs[domain] || 'non so cosa fare';
  }

  function inferLocation(t){
    // Conservative extraction: only accept common Italian place markers followed
    // by a short token sequence ending at punctuation/conjunction. Never guess.
    let comune='';
    const patterns=[
      /\b(?:abito|viviamo|vivo|risiedo|siamo)\s+(?:a|ad|in)\s+([A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,30})(?=\s+(?:e|ma|mentre|dove|perché|che|con|da)\b|[,.!?]|$)/,
      /\b(?:zona|vicino a|nei pressi di)\s+([A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,30})(?=\s+(?:e|ma|mentre|dove|perché|che|con|da)\b|[,.!?]|$)/
    ];
    for(const re of patterns){ const m=String(t||'').match(re); if(m){ comune=m[1].trim(); break; } }
    return {comune,provincia:'',distance:'',online:/\bonline\b|da remoto|a distanza/i.test(t)?'Sì':''};
  }

  function interpret(text){
    const t=norm(text);

    // v0.1.5 principle: identify the family's actual problem before isolated nouns.
    // Contextual rules are deliberately explicit and auditable.
    const score={D01:0,D02:0,D03:0,D04:0,D05:0,D06:0,D07:0,D08:0,D09:0,D10:0,D11:0,D12:0,D13:0,D14:0,D15:0};
    const hit=(d,w,patterns)=>{ if(hasAny(t,patterns)) score[d]+=w; };

    // D01: diagnostic/orientation uncertainty has priority over a topic mentioned inside it.
    hit('D01',10,[
      /non.*(confermat|scritto).*diagnos/i,
      /diagnos.*(non|ancora).*confermat/i,
      /tutto.*nuovo.*(imparando|per me)/i,
      /non ho avuto.*restituzione/i,
      /come.*interpretar/i,
      /cut.?off.*interpretar/i,
      /cosa significa.*(tic|atteggiamento ticoso|cambiando)/i,
      /mio figlio sta cambiando.*cosa avete fatto/i,
      /da dove iniziare|da dove partire|prossimo passo|cosa fare adesso/i
    ]);

    // D04: genuine conflicting/second-opinion request.
    hit('D04',9,[
      /diagnosi.*(diversa|contrastante|non riconosciuta)/i,
      /second[ao] opinione/i,/secondo parere/i,/altro parere/i,
      /non.*convint[oa].*(diagnos|livello)/i,
      /centro privato.*centro pubblico.*(non|negato|riconosc)/i,
      /diagnosi.*dato.*privato.*pubblic/i,/centro privato.*centro pubblico.*non.*riconosc/i
    ]);

    // D12: rights/economic/public-service access, even when school or therapy is mentioned.
    hit('D12',10,[
      /\b104\b|\binps\b|patronato|burocraz|diritti|benefici|invalidit|indennit|accompagnamento/i,
      /aiuti.*econom|aiuto.*econom|rinuncia.*lavoro.*bambino.*autistic/i,
      /voucher|bando.*comun|caregiver.*comun|cosa.*spetta|a chi.*rivolgermi.*econom/i,
      /asl.*pua|comune.*(spetta|voucher|rimborso)|rimborsat.*conto/i
    ]);

    // D15: family support/overload is the problem, not merely a family mention.
    hit('D15',10,[
      /sono esaust|sono stanc|devastat|disperat|non ce la faccio|arrivare sana di mente/i,
      /ci ha veramente distrutti|stare.*dietro.*(stancante|difficile)/i,
      /supporto.*famiglia|aiuto.*genitor|come posso fare.*(noi|famiglia)/i
    ]);

    // D09: coordination/friction between people/services. School is secondary when
    // the actual issue is collaboration or hand-off between actors.
    hit('D09',11,[
      /non comunicano|non collaborano|coordinare|coordinamento|mettere.*d'accordo/i,
      /terapist.*scuola.*docente.*non vuole|docente.*non vuole.*programma/i,
      /ospedale.*asl.*(passaggio|richiesta|chiama|riferimento|territoriale)/i,
      /piu professionist.*(insieme|rete|equipe|équipe)/i,
      /struttura.*equipe|équipe.*struttura.*(requisit|supervision)/i
    ]);

    // D11: actual school problem, unless a stronger coordination rule applies.
    hit('D11',7,[
      /insegnante di sostegno|sostegno scolast|\bpei\b|\bglo\b|docente|maestra|professore/i,
      /scuol.*(inclus|funziona|paritari|insegnante|sostegno|assistenza)/i,
      /scuola.*(iter|chi.*sceglie|chi.*paga)/i
    ]);

    // D08: daily-life/behavior/sensory problem. "non so" alone is not D01.
    hit('D08',9,[
      /selettivit[aà] alimentare|problemi.*dormire|non riesce.*dormire|spannolinamento/i,
      /tagliarsi i capelli|lavaggio mani|paura dello sporco|routine|autonomia/i,
      /telefono.*togliere|togliere.*telefono|tv.*crisi|crisi.*tv/i,
      /aggressiv|si dimena|urla|scatti|porta.*oggetti.*bocca|sputa|salivazione/i,
      /comportamento.*(peggior|cambiato|gestire)|gestire.*comportamento/i
    ]);

    // D03: decision/comparison is an action. It outranks therapy/provider/topic mentions.
    hit('D03',10,[
      /come scegliere|quale scegliere|confrontare|confronti e testimonianze/i,
      /quale.*meglio|meglio.*(aspettare|secondo parere|specialista|terapia)/i,
      /opzioni|quale.*dei.*(due|tre)|due.*opzioni/i,
      /supervisore.*(tenuto|deve).*terapia/i,
      /protocollo biomed/i
    ]);

    // D07: therapy/intervention is the primary issue when there is no stronger decision cue.
    hit('D07',6,[
      /terapi[ae]|psicomotric|logopedia|aba|fisioterapia|supervisore.*terapia/i,
      /training.*(selettivit|alimentare)|percorso.*terapeut|funziona.*terapia/i
    ]);

    // D02: explicit provider/service search. Explicit search beats incidental behavior words.
    hit('D02',10,[
      /\bcerco\b|cercavo|cercando.*(profession|centro|npi)|conoscete.*qualcuno/i,
      /avete da consigliare|indicatemi|si rende disponibile|specialista esperto/i,
      /nomi di neuropsichiatri|trovare.*npi|trovare.*professionista|trovare.*centro/i,
      /dove.*portarlo.*terapia/i
    ]);

    // D05: access/waiting as the primary operational problem.
    hit('D05',5,[/lista d'attesa|tempi di attesa|attesa.*lunga|tempi.*lunghi|disponibil/i]);

    // D06: informational/explanatory questions only when not diagnostic orientation.
    hit('D06',5,[/cosa sarebbe|cosa significa|come funziona|spiegare|spiegazione|informazioni certe|interpretazione/i]);

    // D10/D13/D14 are retained conservatively for future expansion.
    hit('D10',4,[/organizzare.*appuntamenti|orari|organizzazione familiare/i]);
    hit('D13',5,[/costo|cost[ai]|spes[ae]|econom/i]);
    hit('D14',5,[/nuova difficolt[aà]|nuovo problema|peggioramento/i]);

    // Specific contextual precedence: the question's function beats background topic.
    if(/\bcerco\b.*(neuropsichiat|professionist)|nomi di neuropsichiatri|conoscete.*qualcuno/i.test(t)) score.D02+=8;
    if(/confronti e testimonianze|come scegliere|quale.*meglio|protocollo biomed|supervisore.*(tenuto|deve)/i.test(t)) score.D03+=8;
    if(/ospedale.*asl.*(passaggio|richiesta|chiama)|non comunicano|non collaborano|docente.*non vuole.*programma/i.test(t)) score.D09+=8;
    if(/sono esaust|ci ha veramente distrutti|arrivare sana di mente/i.test(t)) score.D15+=8;
    if(/aiuti.*econom|cosa.*spetta|voucher|caregiver.*comun|rinuncia.*lavoro/i.test(t)) score.D12+=8;
    if(/non.*confermat.*diagnos|non ho avuto.*restituzione|cut.?off.*interpretar|cosa significa.*(tic|atteggiamento ticoso)|tutto.*nuovo.*imparando/i.test(t)) score.D01+=8;
    if(/second[ao] opinione|secondo parere|diagnosi.*contrastante|non.*convint[oa].*(diagnos|livello)/i.test(t)) score.D04+=8;
    if(/diagnosi.*dato.*centro privato.*centro pubblico.*non.*riconosc|diagnosi diverse.*continuo a chiedermi|diagnosi.*diverse.*centrato il problema/i.test(t)) score.D04+=12;
    if(/meglio.*aspettare.*day hospital.*secondo parere|meglio.*secondo parere.*tornare.*stesso/i.test(t)) score.D03+=15;
    if(/supervisore.*(tenuto|deve)|protocollo biomed/i.test(t)) score.D03+=10;
    if(/problemi.*per dormire|non riesco a dormire|si sveglia.*piangendo|selettivit[aà] alimentare|intrattenerli|comportamenti problema|togliere.*telefono|tv.*crisi/i.test(t)){ score.D08+=12; score.D15-=3; }
    if(/lista d'attesa.*terapia|non c'erano piu posti.*lista d'attesa|percorso ABA.*pianto|training.*selettivit[aà] alimentare|tanta terapia ABA/i.test(t)) score.D07+=12;
    if(/scuola|didattica|PEI|GLO|esame di stato/i.test(t) && /cerco.*specialista|cerco.*professionista|conoscete.*professionista/i.test(t)) score.D11+=12;
    if(/si possono dare entrambi|possono essere dati entrambi|risperidone.*metilfenidato|farmac.*entrambi/i.test(t)) score.D06+=15;

    // v0.1.6 adversarial precedence: explicit functional clauses override topic words.
    if(/non.*(trovar|cercar).*terapist|a casa.*(gestire|non riusciamo).*\b(sonno|alimentazione|comportamento)\b|non e.*trovare.*terapist|togliere.*(tablet|telefono).*crisi|tablet.*crisi/i.test(t)) { score.D08+=22; score.D02-=8; score.D01-=6; }
    if(/\b104\b|\binps\b|patronato|indennita.*frequenza|beneficio.*inps/i.test(t)) { score.D12+=22; score.D01-=8; }
    if(/informazioni affidabili|informazioni certe|non.*cercare.*centro|vorrei.*informazioni.*(aba|terapia)/i.test(t)) { score.D06+=20; score.D02-=10; score.D07-=5; }
    if(/soprattutto.*(posto|disponibil)|posto subito|non possiamo aspettare/i.test(t) && /cerco.*(centro|professionista|specialista)/i.test(t)) { score.D05+=24; score.D02-=6; }
    if(/cerchiamo.*(logopedista|terapista|professionista|specialista)/i.test(t) && /quella attuale non e.*disponibil|attuale.*non.*disponibil/i.test(t)) { score.D02+=28; score.D05-=10; }
    if(/quale.*(terapista|terapia).*scegliere|scegliere.*(terapista|terapia)|tra.*due.*terapi/i.test(t)) { score.D03+=24; score.D07-=6; score.D02-=6; }
    if(/due specialisti.*pareri diversi.*diagnos|pareri diversi.*diagnos|quale valutazione considerare/i.test(t)) { score.D04+=26; score.D03-=6; score.D06-=4; }
    if(/nessuno si confronta|nessuno.*parla con gli altri|spiegare tutto da capo|non si parlano/i.test(t)) { score.D09+=26; score.D06-=8; score.D07-=4; }
    if(/incastrare.*(visite|terapia|scuola)|incastrare.*settimana|troppi appuntamenti.*orari/i.test(t)) { score.D10+=24; score.D07-=6; score.D11-=4; }
    if(/perdere ore di lavoro|perdere.*lavoro|al limite.*(terapie|famiglia)|non riesco piu a sostenerle/i.test(t) && /terapi|lavoro|famiglia/i.test(t)) { score.D15+=18; score.D13+=10; score.D07-=8; }
    if(/costa.*\d+|costano.*\d+|700 euro|costi.*terapi|spese.*terapi/i.test(t) && /sostenere|sostener|sostenibil|costo|spese/i.test(t)) { score.D13+=40; score.D07-=14; }
    if(/nuov[oa].*(comportamento|difficolta|problema)|comportamento nuovo|prima non c era/i.test(t)) { score.D14+=24; score.D01-=8; }
    if(/non comunicano|non collaborano|lavorano separatamente|coordinare/i.test(t)) { score.D09+=18; score.D01-=8; }
    if(/diagnos.*(non.*confermat|tratti.*autismo)|tutto.*nuovo.*imparando|mi piacerebbe.*sapere.*diagnos/i.test(t)) { score.D01+=32; score.D12-=6; score.D06-=4; }
    if(/dove.*portarlo.*(terapia|valutazione)|dove.*portarlo.*gratuit|terapia.*gratuit/i.test(t)) { score.D02+=28; score.D06-=8; score.D07-=4; }
    if(/requisiti.*struttura|equipe.*(npi|neuropsichiatra)|supervisione neuropsichiatrica|a chi.*rivolger.*requisiti.*struttura/i.test(t)) { score.D09+=28; score.D06-=8; score.D07-=4; }

    // When D08 describes a concrete daily-life/behavior problem, generic "non so/capire"
    // must not demote it to D01/D06.
    if(score.D08>0 && /telefono.*togliere|tv.*crisi|aggressiv|porta.*oggetti.*bocca|selettivit[aà] alimentare|comportamento/i.test(t)){
      score.D01-=5; score.D06-=4;
    }

    // v0.1.5: stronger contextual evidence for known ambiguous patterns.
    // These rules describe the FUNCTION of the request, not merely its topic.
    // Explicit provider search + waiting constraint: D02 remains the primary task.
    if(/(bravo|brava|buon|buona)\s+(neuropsichiatra|specialista|professionista)|cerco.*(neuropsichiatra|specialista|professionista)/i.test(t) && /attesa|tempi.*lunghi|disponibil/i.test(t)){
      score.D02+=14; score.D05-=2;
    }

    // Therapy/intervention remains primary when a concrete therapeutic training
    // is described as the intervention producing change, even if the target
    // problem is a daily-life issue such as feeding selectivity.
    if(/training.*(selettivit[aà] alimentare|alimentare)|terapia.*(selettivit[aà] alimentare|alimentazione)|percorso.*(selettivit[aà] alimentare|alimentazione)|due settimane.*training/i.test(t)){
      score.D07+=20; score.D08-=6;
    }

    // Concrete behavior/family-management narratives should not become D02 merely
    // because the author asks for "consiglio" or "qualcuno che ha affrontato".
    if(/sta sempre nervos|sfoga.*contro|schiaffo|punizioni|toglio.*cellulare|passasse meno tempo.*cellulare|cosa.*consigliare|qualcuno.*affrontato.*cosa/i.test(t)){
      score.D08+=14; score.D02-=8;
    }

    // School is primary when the requested answer concerns support allocation,
    // teacher responsibility, school procedure, or learning/teaching.
    if(/sostegno.*scuol|scuol.*paritari|chi sceglie.*insegnante|chi.*paga.*insegnante|iter.*insegnante|come.*presa.*scuola/i.test(t)){
      score.D11+=18; score.D06-=3;
    }
    if(/scuola.*(lettura|scrittura|apprendimento|allenamento percettivo|acquisizione delle lettere)|apprendimento.*(lettura|scrittura)/i.test(t)){
      score.D11+=14; score.D06-=3;
    }

    // Conflicting professional opinions are a decision/comparison problem when
    // the family asks which view to follow, even without the word "confronto".
    if(/due.*(dottori|medici|professionisti).*visioni.*oppost|uno.*ha detto.*altro.*ha detto|due.*pareri.*divers|pareri.*oppost|opinioni.*divers/i.test(t)){
      score.D03+=16; score.D06-=3;
    }

    // In this corpus, a contemplated school change in a fragmented situation
    // is annotated as coordination: preserve the family's operational dilemma.
    if(/cambiare scuola|cambio scuola/i.test(t) && /non so come|padre.*vorrebbe|ultimo anno|grosso cambiamento/i.test(t)){
      score.D09+=24; score.D08-=5;
    }

    // Explicit second-opinion language is decisive even when the family is also
    // searching for a private specialist and asking about waiting times.
    if(/vorrei avere un altro parere|vorrei.*second[ao] opinione|chiedere.*altro parere|second[ao] opinione/i.test(t)){
      score.D04+=22; score.D02-=4; score.D05-=2;
    }

    // A specialist search can still be a school/educational request when the
    // requested competence is explicitly didactic, curricular or school-facing.
    if(/didattica personalizzata|profilo di funzionamento didattico|consiglio di classe|esame di stato|progettazione del pei|indicazioni didattiche|modalit[aà] di insegnamento|verifiche.*competenze/i.test(t)){
      score.D11+=24; score.D02-=8;
    }

    // Coordination outranks school/therapy/provider when the central friction is between actors.
    if(score.D09>0){ score.D11-=5; score.D07-=3; score.D02-=3; }
    if(score.D03>0){ score.D07-=3; score.D02-=3; score.D04-=2; }
    if(score.D12>0){ score.D11-=3; score.D07-=2; }
    if(score.D15>0){ score.D11-=3; score.D07-=2; }

    const ranked=Object.entries(score).sort((a,b)=>b[1]-a[1]);
    const domain=ranked[0][1]>0?ranked[0][0]:'D01';

    const location=inferLocation(text);
    const resources=inferResources(text);
    const gaps=inferGaps(t);
    const barriers=inferBarriers(t);
    const intentId=inferIntent(t);
    const intentMap={I01:'orientarsi',I02:'trovare',I03:'scegliere',I04:'confrontare',I05:'cambiare',I06:'accelerare',I07:'coordinare',I08:'organizzare',I09:'capire',I10:'gestire'};
    const intent=intentMap[intentId]||'';
    const explicitPrimary = {
      D01:/da dove iniziare|da dove partire|prossimo passo|cosa fare adesso|non so cosa fare/i.test(t),
      D02:/cerco.*(profession|specialist|neuropsichiatr|centro)|conoscete.*qualcuno|indicatemi/i.test(t),
      D03:/come scegliere|quale scegliere|confrontare|quale.*meglio|due.*visioni.*oppost|quale.*terapist.*scegliere|scegliere.*terapia/i.test(t),
      D04:/second[ao] opinione|altro parere|secondo parere|vorrei.*altro parere/i.test(t),
      D08:/selettivit[aà] alimentare|sonno|togliere.*telefono|sfoga.*contro|comportamento/i.test(t),
      D09:/non comunicano|non collaborano|coordinare|lavorano separatamente|nessuno si confronta|cambiare scuola.*grosso cambiamento/i.test(t),
      D11:/sostegno.*scuol|didattica personalizzata|profilo di funzionamento didattico|consiglio di classe|PEI|GLO/i.test(t),
      D12:/104|INPS|patronato|diritti|benefici|voucher|rimborso/i.test(t),
      D15:/sono esaust|sono stanc|devastat|non ce la faccio|perdere ore di lavoro|al limite/i.test(t),
      D06:/informazioni affidabili|informazioni certe|non.*cercare.*centro/i.test(t),
      D10:/incastrare.*(visite|terapia|scuola)|troppi appuntamenti.*orari/i.test(t),
      D13:/700 euro|costa.*\d+|costano.*\d+|costi.*terapi|spese.*terapi/i.test(t),
      D14:/nuov[oa].*(comportamento|difficolta|problema)|comportamento nuovo|prima non c era/i.test(t),
      D05:/soprattutto.*(posto|disponibil)|posto subito|non possiamo aspettare/i.test(t),
      D07:/terapi|logopedia|aba/i.test(t)
    };
    return {
      phase:inferPhase(t),
      need:inferNeed(t,domain),
      resources,
      resourcesOther:'',
      gaps,
      barriers,
      intent,
      comune:location.comune,
      provincia:location.provincia,
      distance:location.distance,
      online:location.online,
      _meta:{interpreter:'v0.1.5',topDomain:domain,explicitPrimary,domainScores:ranked.slice(0,8).map(([d,s])=>({domain:d,score:s}))}
    };
  }

  const _atlasInterpretV017Base=interpret;
  function interpretV017(text){
    const out=_atlasInterpretV017Base(text);
    const t=norm(text);
    const evidence={functional_goal:null,requested_action:null,problem:[],object:[],barriers:[],resources:[],context:[],primary_domain:out._meta.topDomain,confidence:'MEDIUM'};
    // Functional goal: strongest directly requested action first.
    if(/quale.*scegliere|come scegliere|confront|quale.*meglio|due.*visioni.*oppost|scegliere.*terapia/i.test(t)) evidence.functional_goal='choose';
    else if(/non comunicano|non collaborano|coordinare|lavorano separatamente|nessuno si confronta|spiegare tutto da capo|fare da centralino|raccontare ogni volta tutto/i.test(t)) evidence.functional_goal='coordinate';
    else if(/incastrare|troppi appuntamenti|calendario impossibile|mettere ordine/i.test(t)) evidence.functional_goal='organize';
    else if(!/\b(?:non|nn)\s+(?:cerco|cerchiamo|cercherei)\b|(?:non|nn).*serve.*(?:centro|elenco|professionista)|(?:non|nn).*centro da cercare/i.test(t) && /cerco|cercavo|cercando|conoscete.*qualcuno|indicatemi|trovare.*(npi|professionista|centro)/i.test(t)) evidence.functional_goal='find';
    else if(/seconda opinione|secondo parere|altro parere|quale valutazione.*corrett|centro.*dice.*autismo.*altro.*no/i.test(t)) evidence.functional_goal='second_opinion';
    else if(/cosa significa|cosa vuol dire|mi spieg|come funziona|informazioni affidabili|info affidabili|informazioni certe/i.test(t)) evidence.functional_goal='understand';
    else if(/da dove partire|da dove iniziare|prossimo passo|cosa fare adesso/i.test(t)) evidence.functional_goal='orient';
    else if(/104|inps|patronato|diritti|benefici|voucher|rimborso/i.test(t)) evidence.functional_goal='rights';
    else if(/sono esaust|sono stanc|devastat|non ce la faccio|arrivare sana di mente|perdere ore di lavoro/i.test(t)) evidence.functional_goal='family_support';
    else if(/come gestire|gestione|consigli pratici|sfoga|aggressiv|selettivit[aà] alimentare|problemi.*dormire|tv.*crisi/i.test(t)) evidence.functional_goal='manage';
    else if(/lista d['’]?attesa|tempi di attesa|attesa.*lunga|non posso aspettare|non riusciamo ad accedere|non riesco ad accedere/i.test(t)) evidence.functional_goal='access';
    // Requested action is narrower than the goal.
    if(/cerco|cercavo|cercando|conoscete|indicatemi|trovare/i.test(t)) evidence.requested_action='find';
    else if(/scegliere|quale.*meglio|confront/i.test(t)) evidence.requested_action='choose';
    else if(/spieg|cosa significa|cosa vuol dire|come funziona/i.test(t)) evidence.requested_action='explain';
    else if(/come gestire|come fare|consigli/i.test(t)) evidence.requested_action='manage';
    // Objects/topics.
    if(/terapia|terapie|aba|logopedia|psicomotric|terapista/i.test(t)) evidence.object.push('therapy');
    if(/npi|neuropsichiatra|specialista|professionista|centro/i.test(t)) evidence.object.push('provider');
    if(/scuola|pei|glo|insegnante|maestra|docente|apprendimento|lettura|scrittura/i.test(t)) evidence.object.push('school');
    if(/diagnosi|ados|valutazione|livello/i.test(t)) evidence.object.push('diagnosis');
    if(/sonno|dormire|mangia|selettivit[aà]|comportamento|aggressiv|tv|telefono/i.test(t)) evidence.object.push('daily_life');
    if(/104|inps|patronato|diritti|benefici|voucher|rimborso/i.test(t)) evidence.object.push('rights');
    // Barriers are explicitly separated from goals.
    if(/attesa|lista d'attesa|disponibil|mesi|posti/i.test(t)) evidence.barriers.push('access_waiting');
    if(/costi|costo|spese|euro|€|econom/i.test(t)) evidence.barriers.push('cost');
    if(/km|distanza|lontan/i.test(t)) evidence.barriers.push('distance');
    if(/non comunicano|non collaborano|ognuno per conto suo/i.test(t)) evidence.barriers.push('fragmentation');
    if(/stanca|esaust|devastat|non ce la faccio|lavoro perso/i.test(t)) evidence.barriers.push('caregiver_load');
    // Resources/context: existing care is context, not automatically the need.
    if(/siamo seguit|ci segue|abbiamo gia|gia seguit|frequentiamo/i.test(t)) evidence.resources.push('existing_service');
    if(/diagnosi|ADOS|valutazione/i.test(t)) evidence.context.push('diagnostic_context');
    if(/scuola|PEI|GLO/i.test(t)) evidence.context.push('school_context');
    if(/terapia|ABA|logopedia/i.test(t)) evidence.context.push('therapy_context');
    if(/professionista|NPI|centro/i.test(t)) evidence.context.push('provider_context');
    evidence.confidence=evidence.functional_goal?'HIGH':'MEDIUM';
    // v0.1.8 decision layer: functional intent outranks topic/barrier/resource only when explicit and sufficiently specific.
    const GOAL_DOMAIN = {find:'D02',choose:'D03',coordinate:'D09',organize:'D10',second_opinion:'D04',understand:'D06',orient:'D01',rights:'D12',family_support:'D15',manage:'D08',access:'D05'};
    const previousDomain=out._meta.topDomain;
    let decisionDomain = null;
    const strongAction = !!evidence.requested_action || !!evidence.functional_goal && /^(access|second_opinion|understand|coordinate|organize|family_support|manage)$/i.test(evidence.functional_goal) || /non comunicano|non collaborano|coordinare|fare da centralino|raccontare ogni volta tutto|incastrare|calendario impossibile|mettere ordine|non ce la facciamo|insostenibil|economicamente/i.test(t);
    // Functional intent can override legacy classification only when the request is explicit enough.
    if(strongAction) decisionDomain = GOAL_DOMAIN[evidence.functional_goal] || null;
    // Therapy efficacy/evaluation is a distinct functional class and outranks generic choose wording.
    if(/funziona|efficacia|continuare|cambiare.*terapia|percorso.*terapeutico/i.test(t) && /terapi|aba|logopedia|intervento/i.test(t)) decisionDomain='D07';
    // Cost is primary only when the text frames sustainability as the problem itself.
    if(!decisionDomain && /(?:ha iniziato da poco|prima non aveva|nuovo comportamento|nuova difficoltà|nuovo problema|peggioramento|regressione)/i.test(t)) decisionDomain='D14';
    if(!decisionDomain && /(?:non ce la facciamo|insostenibil|economicamente|troppo.*costo|costi.*insostenibili)/i.test(t) && /costo|spese|euro|€|econom|terapi/i.test(t)) decisionDomain='D13';
    if(decisionDomain){
      evidence.primary_domain=decisionDomain;
      evidence.decision_source='functional_goal';
      out._meta.topDomain=decisionDomain;
      out._meta.primaryDomain=decisionDomain;
      out._meta.semanticDecision={domain:decisionDomain,source:'functional_goal',previous:previousDomain===decisionDomain?null:previousDomain};
    } else {
      evidence.decision_source='legacy_v0.1.7';
    }
    out._meta.semanticEvidence=evidence;
    out._meta.interpreter='v0.1.8-candidate';
    return out;
  }
  window.AtlasInputInterpreterV018Candidate={interpret:interpretV017};
  window.AtlasInputInterpreterV017Candidate={interpret:interpretV017};
})();
