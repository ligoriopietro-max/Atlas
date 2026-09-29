/* Atlas Free Text Public Flow v0.3.2 — progressive profile backend */
(function(){'use strict';
 function run(text){
  const clean=String(text||'').trim();
  if(!clean) return {status:'INPUT_REQUIRED',message:'Scrivi qualche riga sulla situazione che state vivendo.'};
  const gate=window.AtlasSafetyGateV01.check(clean);
  if(gate.status!=='PASS') return {status:'BLOCKED',safety:gate};
  const interpreted=window.AtlasInputInterpreterV028Candidate.interpret(clean);
  const adapted=window.AtlasInputContractAdapterV04.adapt(interpreted);
  const engine=window.AtlasEngine.buildProfile(adapted);
  const final=window.AtlasFreeTextReconcilerV02.reconcile(interpreted,engine);
  const d=final.primary_domain||'D01';
  const baseFlow=window.AtlasOrientationFlowV03.get(d);
  const profile=window.AtlasFreeTextProfileV01.extract(clean,d);
  const flow=window.AtlasFreeTextProfileV01.filterFlow(baseFlow,profile);
  return {status:'OK',domain:d,profile,label:window.AtlasOrientationFlowV03.labels[d]||flow.title,result:final,flow};
 }
 window.AtlasFreeTextPublicV03={run};
})();
