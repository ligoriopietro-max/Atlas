/*
 * Atlas Input Interpreter v0.1.9 — EXPERIMENTAL CANDIDATE
 * Conflict-aware functional resolver layered over v0.1.8.
 * Does NOT modify atlas-engine-v0.2.6.js, questionnaire, or released normalizer.
 */
(function(){
  'use strict';
  // Load the frozen v0.1.8 candidate logic in the same browser namespace.
  // This file is intended to be concatenated/evaluated after v0.1.8 candidate.
  if(!window.AtlasInputInterpreterV018Candidate) throw new Error('v0.1.8 candidate required');
  const base=window.AtlasInputInterpreterV018Candidate.interpret;
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();

  const SPEC={
    D01:[/da dove (iniziare|partire)/i,/prossimo passo/i,/cosa fare adesso/i,/non so cosa fare.*(dopo|adesso)/i,/come muovermi/i],
    D02:[/\bcerco\b.*(?:profession|specialist|neuropsichiat|centro|struttura)/i,/\bcercando\b.*(?:profession|specialist|centro)/i,/conoscete.*(?:profession|specialist|centro)/i,/indicatemi.*(?:profession|specialist|centro)/i,/trovare.*(?:profession|specialist|npi|centro)/i,/nomi di (?:neuropsichiatri|professionisti|centri)/i],
    D03:[/quale valutazione.*considerare/i,/quale.*scegliere/i,/come scegliere/i,/confrontare|confronto/i,/quale.*meglio/i,/tra.*due.*(?:terapi|centri|profession|opzion)/i,/quale terapista scegliere/i,/quale terapia scegliere/i],
    D04:[/(?:centro|specialista).*dice.*(?:altro|no)/i,/diagnosi.*discordant/i,/second[ao] opinione/i,/secondo parere/i,/altro parere/i,/diagnosi.*(?:diversa|contrastante|discordant)/i,/pareri? diversi.*diagnos/i,/quale valutazione.*(?:corrett|considerare)/i],
    D05:[/(?:abbiamo trovato|abbiamo gia|gia trovato).*(?:centro|struttura|servizio).*(?:attesa|posto|disponibil)/i,/lista d['’]?attesa/i,/tempi di attesa/i,/non.*(?:acced|posto).*(?:attesa|disponibil)/i,/non possiamo aspettare/i,/posto subito/i],
    D06:[/informazioni? affidabili/i,/info affidabili/i,/informazioni? certe/i,/vorrei (?:informazioni|sapere|capire).*\b(?:aba|terapia|farmac|risultato)/i,/cosa significa.*(?:risultato|ados|cut.?off)/i,/come funziona.*(?:aba|terapia|farmac)/i],
    D07:[/training.*terapeutic/i,/(?:terapia|aba|logopedia|intervento).*non.*funzion/i,/non.*funzion.*(?:terapia|aba|logopedia|intervento)/i,/valutare.*(?:terapia|intervento)/i,/continuare.*(?:terapia|aba|intervento)/i,/percorso terapeutico/i],
    D08:[/gestire.*(?:sonno|alimentazione|selettivit|comportamento|telefono|tablet)/i,/come gestire.*(?:sonno|alimentazione|selettivit|comportamento|telefono|tablet)/i,/non.*riusciamo.*gestire.*(?:sonno|alimentazione|comportamento)/i,/selettivit[aà] alimentare/i,/problemi.*(?:dormire|sonno)/i,/togliere.*(?:telefono|tablet).*crisi/i,/comportamento.*(?:nuovo|problema)/i],
    D09:[/non comunicano/i,/non collaborano/i,/coordinare/i,/fare da centralino/i,/raccontare ogni volta tutto/i,/lavorano separatamente/i,/nessuno si confronta/i,/ognuno per conto suo/i],
    D10:[/incastrare.*(?:visite|terapia|scuola|settimana)/i,/troppi appuntamenti.*orari/i,/calendario.*(?:impossibile|caotico)/i,/organizzare.*(?:settimana|appuntamenti|orari)/i],
    D11:[/non applica.*pei/i,/sostegno.*scuol/i,/didattica personalizzata/i,/chi.*(?:sceglie|paga).*insegnante/i,/progettazione del pei/i,/indicazioni didattiche/i],
    D12:[/(?:come ottenere|come chiedere|come fare per|quali.*documenti).*\b(?:104|inps|indennita|beneficio|voucher|rimborso)/i,/\b(?:104|inps|patronato|diritti|benefici)\b/i],
    D13:[/(?:costo|costi|spese).*problema principale/i,/700 euro.*(?:insosten|sostenere)/i,/costi?.*(?:insosten|sostenere)/i,/spese?.*(?:insosten|sostenere)/i,/non.*(?:sostenere|permetterci).*(?:econom|terapi|costi|spese)/i,/economicamente.*(?:terapi|difficile|insosten)/i],
    D14:[/(?:nuovo|nuova).*(?:comportamento|difficolt[aà]|problema)/i,/comportamento nuovo/i,/prima non c['’]?era/i,/comparso.*(?:comportamento|problema)/i],
    D15:[/carico familiare/i,/perso.*lavoro.*(?:sostenere|reggere|tutto)/i,/sono (?:esaust|stanc|devastat|disperat)/i,/non ce la faccio/i,/non riesco pi[uù].*(?:sostenere|reggere|gestire).*(?:tutto|famiglia|terapi)/i,/perdere.*lavoro.*(?:terapi|famiglia)/i,/al limite/i]
  };
  const DOMAIN_FOR_GOAL={find:'D02',choose:'D03',coordinate:'D09',organize:'D10',second_opinion:'D04',understand:'D06',orient:'D01',rights:'D12',family_support:'D15',manage:'D08',access:'D05'};
  function hits(domain,t){return (SPEC[domain]||[]).filter(r=>r.test(t)).length;}
  function resolve(text){
    const out=base(text); const t=norm(text); const m=out._meta||{}; const e=m.semanticEvidence||{};
    const candidate=e.primary_domain||m.topDomain||'D01';
    let legacy=(m.semanticDecision&&m.semanticDecision.previous)||candidate;
    const explicit=Object.keys(SPEC).map(d=>({d,n:hits(d,t)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
    const best=explicit[0];
    let decision={candidate,legacy,action:'preserve_legacy',strength:'none',reasons:[]};
    // High-strength functional evidence is required to override the legacy classifier.
    if(best){
      const goalDomain=DOMAIN_FOR_GOAL[e.functional_goal]||null;
      const sameAsGoal=goalDomain===best.d || candidate===best.d;
      const strong=best.n>=1;
      const incompatible=best.d!==legacy;
      if(strong && incompatible && (sameAsGoal || best.n>=2 || best.d==='D14' || best.d==='D13')){
        decision={candidate:best.d,legacy,action:'override',strength:best.n>=2?'HIGH':'MEDIUM',reasons:[`explicit functional evidence for ${best.d}`]};
      } else if(incompatible){
        decision={candidate,legacy,action:'preserve_legacy',strength:best.n?'MEDIUM':'LOW',reasons:[`functional signal conflicts with legacy ${legacy}; evidence not strong enough`]};
      } else {
        decision={candidate:best.d,legacy,action:'preserve_legacy',strength:best.n>=2?'HIGH':'MEDIUM',reasons:[`legacy domain already agrees with explicit evidence`]};
      }
    }
    // Safety/anti-overrides: resources and barriers never become primary by themselves.
    if(!best || (e.functional_goal==null && !best)) decision.action='preserve_legacy';
    if(/\b(?:non|nn)\s+(?:cerco|cerchiamo|cercherei)\b/i.test(t)){ 
      if(best && best.d==='D08') decision={candidate:'D08',legacy,action:'override',strength:'HIGH',reasons:['provider search negated; concrete daily-life goal explicit']};
      else decision={candidate:legacy,legacy,action:'preserve_legacy',strength:'LOW',reasons:['provider search explicitly negated']};
    }
    if(/(?:non|nn).*gestire.*(?:sonno|alimentazione|comportamento|selettivit|telefono|tablet)|come gestirl[oaie]/i.test(t) && legacy!=='D08'){ decision={candidate:'D08',legacy,action:'override',strength:'HIGH',reasons:['explicit daily-life management signal']}; }
    if(/non riesco pi[uù].*reggere.*carico familiare|carico familiare.*non riesco/i.test(t) && legacy!=='D15'){ decision={candidate:'D15',legacy,action:'override',strength:'HIGH',reasons:['explicit caregiver-load signal']}; }
    if(/(?:nuovo|nuova).*comportamento|comportamento nuovo|prima non c['’]?era|comportamento.*prima non|comparso.*comportamento/i.test(t) && legacy!=='D14'){ decision={candidate:'D14',legacy,action:'override',strength:'HIGH',reasons:['explicit new-difficulty signal']}; }
    if(/sono (?:esaust|stanc|devastat)|non ce la faccio|perso.*lavoro.*(?:sostenere|reggere|tutto)|al limite/i.test(t) && legacy!=='D15'){ decision={candidate:'D15',legacy,action:'override',strength:'HIGH',reasons:['explicit caregiver-load signal']}; }
    if(/(?:costo|costi|spese).*problema principale|700 euro.*(?:insosten|sostenere)|non.*(?:sostenere|permetterci).*terapi/i.test(t) && legacy!=='D13'){ decision={candidate:'D13',legacy,action:'override',strength:'HIGH',reasons:['explicit economic-sustainability signal']}; }
    if(/quale.*(?:terapia|terapista).*scegliere|scegliere.*(?:terapia|terapista)/i.test(t) && !/(?:centro|specialista).*dice.*(?:altro|no)|diagnosi.*discordant/i.test(t) && legacy!=='D03'){ decision={candidate:'D03',legacy,action:'override',strength:'HIGH',reasons:['explicit choice signal']}; }
    if(/training.*terapeutic/i.test(t) && legacy!=='D07'){ decision={candidate:'D07',legacy,action:'override',strength:'HIGH',reasons:['explicit therapeutic intervention signal']}; }
    if(/(?:centro|specialista).*dice.*(?:altro|no)|diagnosi.*discordant|second[ao] opinione|secondo parere|altro parere/i.test(t) && legacy!=='D04'){ decision={candidate:'D04',legacy,action:'override',strength:'HIGH',reasons:['explicit diagnostic-conflict/second-opinion signal']}; }
    if(/quale valutazione.*considerare/i.test(t) && e.functional_goal!=='second_opinion' && !/diagnosi.*discordant|second[ao] opinione|secondo parere|altro parere/i.test(t) && legacy!=='D03'){ decision={candidate:'D03',legacy,action:'override',strength:'HIGH',reasons:['explicit comparison/selection signal']}; }
    // Final hard safeguards: explicit diagnostic conflict and rights cues cannot be
    // displaced by generic choose/orient wording later in the legacy layer.
    if(/(?:diagnosi|valutazione).*pareri? diversi|pareri? diversi.*diagnosi|(?:centro|specialista).*dice.*(?:altro|no)/i.test(t)){
      if(legacy!=='D04') decision={candidate:'D04',legacy,action:'override',strength:'HIGH',reasons:['final diagnostic-conflict safeguard']};
      else decision={candidate:'D04',legacy,action:'preserve_legacy',strength:'HIGH',reasons:['legacy agrees with diagnostic-conflict evidence']};
    } else if(/\b104\b|\binps\b|patronato|indennita.*frequenza|beneficio.*inps/i.test(t)){
      if(legacy!=='D12') decision={candidate:'D12',legacy,action:'override',strength:'HIGH',reasons:['final rights/benefit safeguard']};
      else decision={candidate:'D12',legacy,action:'preserve_legacy',strength:'HIGH',reasons:['legacy agrees with rights evidence']};
    }
    const finalDomain=decision.action==='override'?decision.candidate:legacy;
    m.topDomain=finalDomain; m.primaryDomain=finalDomain;
    m.conflictResolution=decision;
    if(e) e.primary_domain=finalDomain;
    m.interpreter='v0.1.9-candidate';
    return out;
  }
  window.AtlasInputInterpreterV019Candidate={interpret:resolve};
})();
