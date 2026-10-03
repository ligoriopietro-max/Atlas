/* Atlas Input Interpreter v0.2.9 — multi-domain refinement candidate.
 * Extends v0.2.8 with narrow, general semantic cues found during human testing.
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

   m.interpreter='v0.2.9-candidate';
   return out;
 }
 window.AtlasInputInterpreterV029Candidate={interpret:resolve};
})();
