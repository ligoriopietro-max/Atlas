/* Atlas Input Interpreter v0.3.0 — functional-goal refinement candidate.
 * Extends v0.2.9 with general functional-goal rules for therapy choice, coordination friction and school transitions.
 * No keyword-only override: each rule requires a functional framing and object/problem evidence.
 * Frozen engine remains untouched.
 */
(function(){'use strict';
 if(!window.AtlasInputInterpreterV028Candidate) throw new Error('v0.2.8 candidate required');
 const base=window.AtlasInputInterpreterV028Candidate.interpret;
 const n=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
 function resolve(text){
   const out=base(text), t=n(text), m=out._meta||{};
   let d=m.topDomain||m.primaryDomain||'D01';
   const reasons=(m.conflictResolution&&m.conflictResolution.reasons)||[];
   const set=(domain,reason)=>{d=domain; reasons.push(reason); m.topDomain=d; m.primaryDomain=d; m.conflictResolution={...(m.conflictResolution||{}),candidate:d,action:'override',strength:'HIGH',reasons}; if(m.semanticEvidence)m.semanticEvidence.primary_domain=d;};

   // D04: explicit doubt about the diagnosis/assessment + request for another opinion.
   const diagnosticConflict=/(?:non siamo|non sono|non e|non è)\s+(?:convint[io]|sicuri?)\s+(?:della|del)\s+(?:diagnosi|valutazione)|(?:dubbi?|dubbio)\s+(?:sulla|sul|riguardo alla)\s+(?:diagnosi|valutazione)|(?:vorremmo|vorrei|vogliamo|voglio|chiediamo|chiedo)\s+(?:un )?(?:altro|secondo)\s+(?:parere|specialista|opinione)|sentire\s+(?:un altro|un secondo)\s+(?:specialista|parere)|second[ao] opinione/i.test(t);
   if(diagnosticConflict && d!=='D09') set('D04','explicit diagnostic doubt/second-opinion function');

   // D05: access/waiting is primary when a service is already identified and the obstacle is access.
   const serviceIdentified=/(?:ci hanno indicato|ci hanno consigliato|ci hanno dato il riferimento|abbiamo gia|abbiamo già|abbiamo trovato|il centro e|il centro è)\s+(?:un )?(?:centro|servizio|struttura|professionista)/i.test(t);
   const waiting=/(?:sei mesi|un anno|diversi mesi|molti mesi|lista d['’]?attesa|tempi di attesa|lunghe? attese?|non c['’]?e posto|non c'è posto|nessuna disponibilita|nessuna disponibilità)/i.test(t);
   const accessProblem=/(?:non riusciamo|non riesco|non possiamo|non posso)\s+(?:ad )?accedere|non sappiamo come accedere|accesso.*blocc|servizio.*blocc/i.test(t);
   if((serviceIdentified&&waiting)||accessProblem){ set('D05','access/waiting is the immediate problem for an identified service'); }

   // D12: rights/benefits/practices explicitly requested.
   const rightsLoose2=/(?:sostegn[io]|agevolazioni|benefici|diritti|indennita|indennità|inps|104|legge 104|comma 2|comma 3|patronato|invalidita|invalidità|assegno|contributi).{0,120}(?:richiedere|ottenere|spettano|possiamo|capire|sapere|domanda|richiesta)|(?:capire|sapere|vorrei sapere|vorremmo sapere).{0,80}(?:quali|che).{0,50}(?:diritti|sostegni|agevolazioni|benefici)/i.test(t);
   if(rightsLoose2) set('D12','rights/benefits function is explicitly requested');

   // D11: school-specific function outranks a secondary rights/procedure component.
   // Narrow by explicit school-support/procedure framing to avoid reclassifying posts that merely mention school.
   const schoolFunction=/(?:chi (?:paga|sceglie).*insegnante)|(?:iter.*(?:sostegno|insegnante|scuola|paritaria))|(?:come funziona.*(?:sostegno|insegnante|scuola|paritaria))/i.test(t);
   if(schoolFunction) set('D11','school function is primary; rights/procedure content is secondary');
   const coordinationFriction=/(?:non comunicano|non collaborano|fare da centralino|raccontare ogni volta tutto|ognuno per conto suo|mi lasciano da solo col bambino|non si parlano|non si confrontano)/i.test(t);
   if(coordinationFriction) set('D09','coordination friction is primary even when school is the setting');

   // D15: direct caregiver exhaustion is primary when the family itself cannot sustain the load.
   const familyLoad=/(?:siamo|sono)\s+(?:completamente\s+|molto\s+|davvero\s+|veramente\s+)?esaust[io]|non ce la facciamo piu|non ce la faccio piu|non riusciamo piu a gestire tutto|non riesco piu a gestire tutto|non riusciamo piu a sostenere tutto|carico familiare.*(?:insostenibile|troppo|non ce la)/i.test(t);
   if(familyLoad) set('D15','caregiver/family sustainability is explicitly the primary problem');

   // v0.3.0 functional-goal refinement. These rules operate on the requested function, not topic words alone.
   // Local guards for the refinement rules: explicit provider search and diagnostic conflict must win.
   const providerSearchIntent=/(?:cerco|cerchiamo|cercavo|sto cercando|conoscete|indicatemi|consigliatemi|trovare|mi serve|ci serve|abbiamo bisogno di)\b[^.!?]{0,90}\b(?:neuropsichiatra|npi|logopedista|terapista|professionista|specialista|psicologo|educatore|medico|dottore|centro|struttura)\b/i.test(t) || /(?:dove)\s+(?:posso|puo|può|possiamo|potrei|potremmo)\s+(?:portare|trovare|cercare)\b[^.!?]{0,80}\b(?:terapia|terapie|intervento|interventi|centro|servizio|professionista|specialista)\b/i.test(t);
   const diagnosticConflictGuard=diagnosticConflict;
   const therapyDecision=/(?:\bquale|\bquali|\bche tipo di)\b[^.!?]{0,55}\b(?:intervento|interventi|terapia|terapie|trattamento|percorso terapeutico)\b[^.!?]{0,55}\b(?:adatt[oa]|indicat[oa]|appropriat[oa]|serve|servirebbe|potrebbe|consigliat[oa])\b/i.test(t)
     ||/(?:\b(?:intervento|interventi|terapia|terapie|trattamento)\b)[^.!?]{0,55}\b(?:adatt[oa]|indicat[oa]|appropriat[oa]|serve|servirebbe|potrebbe|consigliat[oa])\b/i.test(t);
   const therapyChoice=(therapyDecision && /\b(?:capire|comprendere|sapere|valutare|decidere|adatto|indicato|appropriato|serve|servirebbe)\b/i.test(t));
   const explicitInfoRequest=/(?:vorrei|vorremmo|voglio|vogliamo|mi servono|ci servono|cerco|cerchiamo|abbiamo bisogno di)\b[^.!?]{0,45}\b(?:informazioni affidabili|fonti affidabili|spiegazioni)\b/i.test(t);
   const negatedProviderInfo=/(?:non|nn)\s+(?:(?:mi\s+)?serve|servirebbe|voglio|vorrei|cerco|cerchiamo)\b[^.?!]{0,45}\b(?:neuropsichiatra|npi|logopedista|terapista|professionista|specialista|psicologo|educatore|medico|dottore|centro|struttura)\b[^.?!]{0,45}\b(?:informazioni|spiegazioni|fonti)\b/i.test(t);
   const directFamilySupport=/(?:vorrei|vorremmo|voglio|vogliamo|cerco|cerchiamo|mi serve|ci serve|abbiamo bisogno di)\b[^.!?]{0,60}\b(?:supporto|sostegno|aiuto)\b[^.!?]{0,50}\b(?:io|me|noi|genitore|genitori|famiglia|mamma|papà|papa)\b/i.test(t)
     ||/(?:supporto|sostegno|aiuto)\b[^.!?]{0,45}\b(?:per me|per noi|alla famiglia|ai genitori|a noi)\b/i.test(t);
   const choiceWithSecondV2=/(?:meglio|scegliere|quale|tra|oppure|o )[^.!?]{0,80}\b(?:second[ao] parere|second[ao] opinione|altro parere)\b/i.test(t)
     ||/\b(?:second[ao] parere|second[ao] opinione|altro parere)\b[^.!?]{0,80}\b(?:oppure|o |meglio|scegliere|tra)\b/i.test(t);
   if(therapyChoice && !providerSearchIntent && !diagnosticConflictGuard && d!=='D09'){
     d='D07'; reasons.push('the requested function is choosing/understanding an intervention, not finding a provider');
   }
   if(directFamilySupport && d!=='D09'){ d='D15'; reasons.push('support is explicitly requested for the caregiver/family itself'); }
   if(explicitInfoRequest && !providerSearchIntent && !directFamilySupport && d!=='D09'){ d='D06'; reasons.push('information is the explicitly requested function'); }
   if(negatedProviderInfo && !directFamilySupport && d!=='D09'){ d='D06'; reasons.push('the provider is explicitly negated; information is the requested function'); }
   if(choiceWithSecondV2 && !diagnosticConflictGuard && d!=='D09'){ d='D03'; reasons.push('second opinion is presented as one option within a choice decision'); }

   const coordinationFrictionV2=/(?:comunicazione|comunicare|confrontarsi|confronto|coordinamento|collaborazione|collaborare)\b[^.!?]{0,100}\b(?:tra|fra|con)\b[^.!?]{0,100}\b(?:terapist|professionist|medic|specialist|scuola|insegnant|serviz)\w*\b[^.!?]{0,80}\b(?:difficile|difficolta|non riesc|manc|problema|complicat|diventat)\w*\b/i.test(t)
     ||/(?:terapist|professionist|medic|specialist)\w*\b[^.!?]{0,80}\b(?:non si parlano|non comunicano|non collaborano|non si confrontano|lavorano separatamente|ognuno|ognuna)\b/i.test(t)
     ||/(?:piu|più)\s+(?:terapist|professionist|specialist)\w*[^.!?]{0,100}\b(?:comunicazione|coordinamento|collaborazione)\b[^.!?]{0,80}\b(?:difficile|problema|manc|non)\w*\b/i.test(t);
   if(coordinationFrictionV2 && !providerSearchIntent && d!=='D09'){
     d='D09'; reasons.push('multi-actor coordination friction is the primary problem');
   }

   const schoolTransitionV2=/(?:passaggio|ingresso|cambio|transizione)\b[^.!?]{0,80}\b(?:scuola|asilo|infanzia|classe|ciclo)\b/i.test(t)
     ||/\b(?:scuola dell['’]infanzia|scuola primaria|scuola media|nuova scuola)\b[^.!?]{0,100}\b(?:preparare|preparazione|passaggio|ingresso|inizio|cambio|transizione|accompagnare)\b/i.test(t);
   if(schoolTransitionV2 && d!=='D09'){
     d='D11'; reasons.push('school transition is the primary functional object, even when the family asks where to start');
   }
   // If the family explicitly asks to find a provider, that requested action beats a contextual coordination problem.
   if(providerSearchIntent && d==='D09'){
     d='D02'; reasons.push('provider search is the requested outcome; coordination difficulty is contextual');
   }

   m.topDomain=d; m.primaryDomain=d;
   if(m.semanticEvidence){
     m.semanticEvidence.primary_domain=d;
     if(d==='D07' && therapyChoice){m.semanticEvidence.functional_goal='choose';m.semanticEvidence.requested_action='choose';m.semanticEvidence.object=['therapy/intervention'];m.semanticEvidence.confidence='HIGH';}
     if(d==='D09' && coordinationFrictionV2){m.semanticEvidence.functional_goal='coordinate';m.semanticEvidence.requested_action='coordinate';m.semanticEvidence.problem=['coordination_friction'];m.semanticEvidence.confidence='HIGH';}
     if(d==='D11' && schoolTransitionV2){m.semanticEvidence.functional_goal='prepare';m.semanticEvidence.requested_action='prepare';m.semanticEvidence.object=['school_transition'];m.semanticEvidence.confidence='HIGH';}
   }
   // v0.3.1 — paraphrase hardening.
   const shortPrompt=t.split(/\s+/).filter(Boolean).length<=45;// These are functional patterns, not topic-only overrides.
   const providerSearch=/\b(?:cerco|cerchiamo|sto cercando|conoscete|trovare|mi serve|ci serve|abbiamo bisogno di)\b[^.!?]{0,90}\b(?:logopedista|terapista|professionista|specialista|psicologo|educatore|medico|dottore|neuropsichiatra|npi|centro|struttura)\b/i.test(t) || /\b(?:un|una|il|la)\s+(?:bravo|brava|buon|buona)\s+(?:logopedista|terapista|professionista|specialista|psicologo|educatore|medico|dottore|neuropsichiatra|npi)\b/i.test(t);
   const providerNegated=/(?:non|nn)\s+(?:(?:mi|ci)\s+)?(?:serve|servirebbe|voglio|vorrei|cerco|cerchiamo)\b[^.!?]{0,70}\b(?:logopedista|terapista|professionista|specialista|psicologo|educatore|medico|dottore|neuropsichiatra|npi|centro|struttura)\b/i.test(t);
   const compare=/\b(?:due|entrambi|alternative|opzioni)\b[^.!?]{0,100}\b(?:confront|scegl|valut|meglio|decid)\w*/i.test(t)
     ||/\b(?:meglio|confrontare|confronto|pro e contro|scegliere|decidere|valutare)\b[^.!?]{0,80}\b(?:centro|centri|terapist|professionist|terapie|trattamenti|percorsi|opzioni|alternative)\b/i.test(t)
     ||/\b(?:centro|centri|terapist|professionist|terapie|trattamenti)\b[^.!?]{0,80}\b(?:a o b|b o a|due|alternativ|opzion)\b/i.test(t)
     ||/\b(?:terapia|terapie|trattamento|trattamenti)\b[^.!?]{0,80}\b(?:tra|oppure|o)\b/i.test(t);
   const accessLoose2=/(?:lista d['’]?attesa|lista di attesa|non c['’]?e posto|non c'è posto|tempi lunghi|tempi troppo lunghi|mesi|un anno|attesa|accedere|accesso|disponibilita|disponibilità)\b/i.test(t) && /(?:centro|servizio|struttura|percorso|riferimento|indicato|consigliato|trovato|scelto|lista|attesa|accedere|accesso)\b/i.test(t);
   const diagnosticLoose=/(?:far verificare|verificare|controllare)\b[^.!?]{0,50}\b(?:la |la propria |questa )?(?:diagnosi|valutazione)\b[^.!?]{0,60}\b(?:altro|altra|secondo|seconda|specialista|medico|neuropsichiatra)\b/i.test(t) || /(?:non sono|non siamo|non è|non e|dubbi|dubbio)\b[^.!?]{0,80}\b(?:diagnosi|valutazione)\b[^.!?]{0,80}\b(?:altro|secondo|seconda|verificare|controllare|specialista|medico|neuropsichiatra)/i.test(t) || /(?:vorrei|vorremmo|voglio|vogliamo|chiedo|chiediamo)\b[^.!?]{0,80}\b(?:sentire|far verificare|verificare)\b[^.!?]{0,80}\b(?:specialista|medico|neuropsichiatra)\b[^.!?]{0,80}\b(?:diagnosi|valutazione)\b/i.test(t);
   const choiceSecond=/(?:second[ao] parere|second[ao] opinione|altro parere)[^.!?]{0,80}\b(?:oppure|o |meglio|scegliere|continuare)\b/i.test(t)
     ||/\b(?:meglio|scegliere|valutare)\b[^.!?]{0,80}(?:second[ao] parere|second[ao] opinione)/i.test(t);
   const therapyDecisionLoose=/(?:quale|quali|che|come|se|decidere|scegliere|valutare)\b[^.!?]{0,90}\b(?:terapia|terapie|trattamento|trattamenti|intervento|interventi|percorso terapeutico)\b[^.!?]{0,90}\b(?:adatt|indicat|appropriat|funzion|serve|scegli|decid|prosegu|intraprender|meglio)/i.test(t)
     ||/\b(?:decidere|scegliere|valutare)\b[^.!?]{0,60}\b(?:terapia|trattamento|intervento|percorso)/i.test(t);
   const infoRequest=/(?:informazioni|informazione|fonti|spiegazioni|spiegazione|come funziona|cosa significa|cosa sia|sapere)\b/i.test(t);
   const dailyLoose2=/(?:routine|vestirsi|lavarsi|bagno|pasti|mangiare|sonno|uscite|attivita quotidiane|attività quotidiane|autonomia|gestire la giornata|gestione della giornata)\b/i.test(t)
     && /(?:difficile|difficolta|difficoltà|problema|non riesco|non riusciamo|gestire|gestione|autonom)/i.test(t);
   const coordinationLoose2=/(?:coordinare|coordinamento|comunicazione|comunicare|collaborazione|collaborare|confronto|confrontarsi|si parlano|non si parlano|lavorano separatamente)\b/i.test(t)
     && /(?:terapist|professionist|specialist|medic|scuola|insegnant|serviz|vari|diversi|tra|fra)\b/i.test(t);
   const schoolLoose2=/(?:scuola dell['’]infanzia|scuola primaria|scuola media|nuova scuola|inizio della scuola|ingresso alla scuola|cambio di scuola|cambiare scuola|passaggio|transizione|inserimento)\b/i.test(t)
     && /(?:prepar|organizz|ingresso|inizio|passaggio|transizione|cambio|accompagnare|inserimento)\b/i.test(t);
   const rightsLoose3=/(?:agevolazioni|benefici|diritti|indennita|indennità|104|inps|contributi|sostegni pubblici|invalidita|invalidità)\b/i.test(t)
     && /(?:ottenere|richiedere|spett|come|quali|sapere|domanda|richiesta|previste|previsti)\b/i.test(t);
   const familyLoose3=/(?:esaust|sfin|al limite|la famiglia non ce la fa|non ce la facciamo|non ce la faccio|carico familiare|reggere questo periodo|supporto per me|supporto per noi|aiuto per me|aiuto per noi|sostegno alla famiglia|sostegno ai genitori)\b/i.test(t);
   const newDifficulty=/(?:nuov[oa]|recentemente|ultimamente|da qualche tempo|da poco|negli ultimi giorni|improvvisamente|prima non c['’]?era|cambiato)\b/i.test(t)
     && /(?:difficolta|difficoltà|problema|comportamento|cambiato|cambiamento)\b/i.test(t);

   // Explicit action has precedence over contextual information.
   if(shortPrompt && providerNegated && infoRequest){ d='D06'; reasons.push('provider explicitly rejected in favor of information'); }
   else if(shortPrompt && providerSearch){ d='D02'; reasons.push('explicit provider search'); }
   else if(shortPrompt && choiceSecond){ d='D03'; reasons.push('second opinion presented as one choice among alternatives'); }
   else if(shortPrompt && diagnosticLoose){ d='D04'; reasons.push('diagnostic reassessment/second opinion'); }
   else if(shortPrompt && compare && !diagnosticConflict){ d='D03'; reasons.push('explicit comparison/choice among alternatives'); }
   else if(diagnosticConflict){ d='D04'; reasons.push('diagnostic doubt/second opinion'); }
   else if(shortPrompt && accessLoose2 && !providerSearch){ d='D05'; reasons.push('identified service access/availability problem'); }
   else if(shortPrompt && therapyDecisionLoose && !compare){ d='D07'; reasons.push('therapy/intervention decision'); }
   else if(shortPrompt && rightsLoose3){ d='D12'; reasons.push('rights/benefits request'); }
   else if(shortPrompt && infoRequest && !therapyDecisionLoose){ d='D06'; reasons.push('information/explanation request'); }
   else if(shortPrompt && coordinationLoose2){ d='D09'; reasons.push('coordination/collaboration problem'); }
   else if(shortPrompt && schoolLoose2){ d='D11'; reasons.push('school transition/preparation'); }
   else if(shortPrompt && familyLoose3){ d='D15'; reasons.push('caregiver/family support'); }
   else if(shortPrompt && dailyLoose2){ d='D08'; reasons.push('daily-life/autonomy difficulty'); }
   else if(shortPrompt && newDifficulty && !dailyLoose2){ d='D14'; reasons.push('new/recent difficulty'); }
   m.topDomain=d; m.primaryDomain=d; if(m.semanticEvidence)m.semanticEvidence.primary_domain=d; m.interpreter='v0.3.1-candidate';
   return out;
 }
 window.AtlasInputInterpreterV031Candidate={interpret:resolve};
})();
