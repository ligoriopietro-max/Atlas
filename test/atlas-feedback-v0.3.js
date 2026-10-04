/* Atlas Public Feedback v0.3 — local-only, session-linked. */
(function(){'use strict';
 const KEY='atlas_public_test_feedback_v03',MAX=100;
 function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.slice(-MAX):[]}catch(e){return[]}}
 function save(item){const all=load();all.push(item);localStorage.setItem(KEY,JSON.stringify(all.slice(-MAX)));return all.length}
 function make(p){return {version:'atlas_public_test_feedback_v03',session_id:String(p.session_id||''),helpful:['si','in_parte','no'].includes(p.helpful)?p.helpful:'',expected_goal:String(p.expected_goal||'altro'),error_area:String(p.error_area||''),comment:String(p.comment||'').trim().slice(0,1000),created_at:new Date().toISOString()}}
 function exportJson(){const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='atlas_feedback_anonimo_v0.3.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
 window.AtlasFeedbackV02={load,save,make,exportJson};
})();
