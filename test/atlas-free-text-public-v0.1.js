/* Atlas Free Text Public Flow v0.1 — public-safe presentation wrapper */
(function(){'use strict';
 const M={
  D01:'capire da dove partire',D02:'trovare professionisti o servizi',D03:'confrontare e scegliere tra le opzioni',D04:'valutare un secondo parere',D05:'capire come accedere e affrontare i tempi di attesa',D06:'trovare informazioni affidabili',D07:'orientarsi tra terapie e interventi',D08:'gestire una difficoltà della vita quotidiana',D09:'coordinare le persone coinvolte nel percorso',D10:'organizzare meglio la vita familiare e gli appuntamenti',D11:'affrontare scuola o una transizione',D12:'orientarsi tra diritti, pratiche e servizi pubblici',D13:'affrontare costi e sostenibilità economica',D14:'gestire una nuova difficoltà o un cambiamento',D15:'trovare supporto per la famiglia'
 };
 function run(text){
  const clean=String(text||'').trim();
  if(!clean) return {status:'INPUT_REQUIRED',message:'Scrivi qualche riga sulla situazione che state vivendo.'};
  const gate=window.AtlasSafetyGateV01.check(clean);
  if(gate.status!=='PASS') return {status:'BLOCKED',safety:gate};
  const interpreted=window.AtlasInputInterpreterV027Candidate.interpret(clean);
  const adapted=window.AtlasInputContractAdapterV04.adapt(interpreted);
  const engine=window.AtlasEngine.buildProfile(adapted);
  const final=window.AtlasFreeTextReconcilerV02.reconcile(interpreted,engine);
  return {status:'OK',result:final,public:{domain:final.primary_domain,label:M[final.primary_domain]||'da approfondire'}};
 }
 window.AtlasFreeTextPublicV01={run};
})();
