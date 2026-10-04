/* Atlas Free Text Public Flow v0.3.2 — progressive profile backend */
(function(){'use strict';
 function run(text){
  const clean=String(text||'').trim();
  if(!clean) return {status:'INPUT_REQUIRED',message:'Scrivi qualche riga sulla situazione che state vivendo.'};
  const gate=window.AtlasSafetyGateV01.check(clean);
  if(gate.status!=='PASS') return {status:'BLOCKED',safety:gate};
  const result=window.AtlasAssemblerV01.run(clean,{records:window.ATLAS_DEMO_RECORDS||[]});
  const labels={D01:'Orientamento',D02:'Ricerca di un professionista o servizio',D03:'Scelta e confronto',D04:'Secondo parere',D05:'Accesso a un servizio',D06:'Informazioni affidabili',D07:'Terapie e interventi',D08:'Quotidianità e autonomia',D09:'Coordinamento del percorso',D10:'Organizzazione familiare',D11:'Scuola e transizioni',D12:'Diritti e pratiche',D13:'Sostenibilità economica',D14:'Nuova difficoltà',D15:'Supporto alla famiglia'};
  return {status:'OK',domain:result.domain,profile:result.profile,label:labels[result.domain]||'Orientamento',result,flow:result.next_step};
 }
 window.AtlasFreeTextPublicV03={run};
})();
