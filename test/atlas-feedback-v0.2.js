/* Atlas Public Feedback v0.2 — local-only */
(function(){'use strict';
 const KEY='atlas_public_test_feedback_v02',MAX=100;
 function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.slice(-MAX):[]}catch(e){return[]}}
 function save(item){const all=load();all.push(item);localStorage.setItem(KEY,JSON.stringify(all.slice(-MAX)));return all.length}
 function make(p){return {version:'atlas_public_test_feedback_v02',helpful:['si','in_parte','no'].includes(p.helpful)?p.helpful:'',expected_goal:String(p.expected_goal||'altro'),comment:String(p.comment||'').trim().slice(0,1000)}}
 function exportJson(){const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='atlas_feedback_anonimo_v0.2.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
 window.AtlasFeedbackV02={load,save,make,exportJson};
})();
