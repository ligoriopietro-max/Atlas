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
   const rights=/(?:sostegn[io]|agevolazioni|benefici|diritti|indennita|indennità|inps|104|legge 104|comma 2|comma 3|patronato|invalidita|invalidità|assegno|contributi).{0,120}(?:richiedere|ottenere|spettano|possiamo|capire|sapere|domanda|richiesta)|(?:capire|sapere|vorrei sapere|vorremmo sapere).{0,80}(?:quali|che).{0,50}(?:diritti|sostegni|agevolazioni|benefici)/i.test(t);
   if(rights) set('D12','rights/benefits function is explicitly requested');

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
   m.interpreter='v0.3.0-candidate';
   return out;
 }
 window.AtlasInputInterpreterV030Candidate={interpret:resolve};
})();
