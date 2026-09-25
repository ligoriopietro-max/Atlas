/* Atlas — Free Text Reconciler v0.2
 * Keeps Engine v0.2.6 as the scoring layer; interpreter may provide the functional primary.
 */
(function(){'use strict';
 function reconcile(interpreted, engine){
   const i=interpreted||{}, e=engine||{}, m=i._meta||{}, ev=m.semanticEvidence||{};
   const interp=m.topDomain||null, legacy=(m.conflictResolution&&m.conflictResolution.legacy)||null;
   const explicit=!!interp;
   let primary=e.primary_domain||null, source='engine_v0.2.6';
   if(interp){
     primary=interp; source=(e.primary_domain===interp)?'agreement':'interpreter_primary_engine_secondary';
     // If the interpreter falls back to generic orientation but the frozen engine has a
     // high-confidence explicit choice/comparison result, preserve that stronger evidence.
     if(interp==='D01' && e.primary_domain==='D03' && (e.confidence==='HIGH' || ((ev.requested_action==='choose') && (e.domains&&e.domains[0]&&e.domains[0].score>=8)))){ primary='D03'; source='engine_strong_choice_evidence'; }
   }

   return {version:'0.2-reconciler',primary_domain:primary,engine_primary:e.primary_domain||null,interpreter_primary:interp,source,confidence:e.confidence||'LOW',engine:e,interpreter_meta:{legacy,explicit,semanticEvidence:ev}};
 }
 window.AtlasFreeTextReconcilerV02={reconcile};
})();
