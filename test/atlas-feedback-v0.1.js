/* Atlas Public Feedback v0.1 — local-only, no network, no personal data */
(function(){'use strict';
 const KEY='atlas_public_test_feedback_v01';
 const MAX=100;
 function load(){ try { const x=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(x)?x.slice(-MAX):[]; } catch(e){ return []; } }
 function save(item){ const all=load(); all.push(item); localStorage.setItem(KEY,JSON.stringify(all.slice(-MAX))); return all.length; }
 function make(payload){
   const helpful=['si','in_parte','no'].includes(payload.helpful)?payload.helpful:'';
   const expected=['professionista','scegliere','informazioni','accesso','supporto_famiglia','quotidianita','scuola','diritti','costi','altro'].includes(payload.expected_goal)?payload.expected_goal:'altro';
   const comment=String(payload.comment||'').trim().slice(0,1000);
   return {version:'atlas_public_test_feedback_v01',helpful,expected_goal:expected,comment};
 }
 function exportJson(){
   const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='atlas_feedback_anonimo_v0.1.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function clear(){ localStorage.removeItem(KEY); }
 window.AtlasFeedbackV01={make,save,load,exportJson,clear,storageKey:KEY};
})();
