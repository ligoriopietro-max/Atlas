/* Atlas Input Interpreter v0.2.8 — provider-target refinement candidate
 * Extends v0.2.7 without modifying the frozen engine.
 * General rule: an explicit need for a named medical/professional provider is
 * treated as provider-finding when it is framed as the requested next action.
 */
(function(){'use strict';
 if(!window.AtlasInputInterpreterV027Candidate) throw new Error('v0.2.7 candidate required');
 const base=window.AtlasInputInterpreterV027Candidate.interpret;
 const n=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
 function resolve(text){
   const out=base(text), t=n(text), m=out._meta||{};
   let d=m.topDomain||m.primaryDomain||'D01';
   const reasons=(m.conflictResolution&&m.conflictResolution.reasons)||[];
   const providerNeed=/(?:\b(?:mi|ci|gli|le|vi)\s+)?(?:serve|servirebbe|servono|servirebbero|vorrei|vorremmo|vogliamo|voglio|ho bisogno di|abbiamo bisogno di|avrei bisogno di|avremmo bisogno di)\s+(?:un|uno|una|dei|delle)\s+(?:dottore|medico|neuropsichiatra|npi|logopedista|terapista|professionista|specialista|psicologo|neuropsicologo|pedagogista|educatore|centro|struttura)\b/i.test(t);
   const providerSearch=(m.conflictResolution&&m.conflictResolution.reasons||[]).some(x=>/provider search/i.test(x));
   const providerContext=/(?:dottore|medico|neuropsichiatra|npi|logopedista|terapista|professionista|specialista|psicologo|neuropsicologo|pedagogista|educatore|centro|struttura)/i.test(t);
   const explicitUnderstanding=/(?:devo|dobbiamo|vorrei|vorremmo|voglio|vogliamo)\s+(?:capire|sapere|comprendere)\b/i.test(t);
   const negatedProvider=/(?:non|nn)\s+(?:mi\s+)?(?:serve|servirebbe|voglio|vorrei|cerco|cerchiamo)\b/i.test(t);
   if(providerNeed && providerContext && !explicitUnderstanding && !negatedProvider && d!=='D09'){
     d='D02';
     reasons.push('explicit need for a named professional/provider is the requested next action');
     m.topDomain=d; m.primaryDomain=d;
     m.conflictResolution={...(m.conflictResolution||{}),candidate:d,action:'override',strength:'HIGH',reasons};
     if(m.semanticEvidence) { m.semanticEvidence.primary_domain=d; m.semanticEvidence.requested_action='find'; m.semanticEvidence.functional_goal='find'; m.semanticEvidence.confidence='HIGH'; }
   }
   m.interpreter='v0.2.8-candidate';
   return out;
 }
 window.AtlasInputInterpreterV028Candidate={interpret:resolve};
})();
