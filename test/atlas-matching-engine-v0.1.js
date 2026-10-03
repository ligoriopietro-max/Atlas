(function(root){'use strict';
function norm(v){return typeof v==='string'?v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim():'';}
function arr(v){return Array.isArray(v)?v:[];}
function textIncludes(list, value){var q=norm(value);return arr(list).some(function(x){return norm(x).includes(q)||q.includes(norm(x));});}
function same(a,b){return norm(a)!==''&&norm(a)===norm(b);}
function ageFit(pop, age){if(!pop||age===undefined||age===null)return {state:'unknown'}; var n=Number(age);if(!Number.isFinite(n))return {state:'unknown'};var min=pop.age_min,max=pop.age_max;if(min!==undefined&&n<Number(min))return {state:'no'};if(max!==undefined&&n>Number(max))return {state:'no'};return {state:'yes'};}
function match(req, record){
 var reasons=[], warnings=[], hard=[]; var score=0,total=0;
 if(!req||!record)return {compatible:false,score:0,reasons:[],warnings:['missing request or record']};
 // Target/service fit: highest weight.
 if(req.target&&(req.target.provider_type||req.target.service_type||req.target.object)){
   total+=40; var target=req.target.provider_type||req.target.service_type||req.target.object;
   var serviceFit=textIncludes(record.services,target)||same(record.professional_role,target)||textIncludes(record.specializations,target);
   if(serviceFit){score+=40;reasons.push('servizio/profilo compatibile con la richiesta');} else {hard.push('servizio/profilo non compatibile con la richiesta');}
 }
 // Geography / online.
 if(req.geography&&(req.geography.location||req.geography.province)||req.access&&req.access.online!==undefined){
   total+=20; var loc=req.geography&&req.geography.location, prov=req.geography&&req.geography.province, online=req.access&&req.access.online===true;
   var a=record.access||{};
   if(online && a.online===true){score+=20;reasons.push('servizio online compatibile');}
   else if(loc && same(loc,a.city)){score+=20;reasons.push('localita compatibile');}
   else if(loc){hard.push('localita non compatibile con la richiesta');}
   else if(prov && same(prov,a.province)){score+=12;reasons.push('provincia compatibile');}
   else if(prov){hard.push('provincia non compatibile con la richiesta');}
 }
 // Age.
 if(req.context&&req.context.age!==undefined){total+=15;var af=ageFit(record.population,req.context.age);if(af.state==='yes'){score+=15;reasons.push('fascia di eta compatibile');}else if(af.state==='no'){hard.push('fascia di eta non compatibile');}else warnings.push('fascia di eta non verificabile');}
 // Setting.
 if(req.preferences&&req.preferences.setting){total+=10;var rs=record.access&&record.access.setting;if(rs===req.preferences.setting||rs==='mixed'){score+=10;reasons.push('modalita di erogazione compatibile');}else warnings.push('setting richiesto diverso da quello dichiarato');}
 // Availability: preference/constraint, never invent current status.
 if(req.preferences&&req.preferences.priority){var p=norm(req.preferences.priority), av=record.availability||{};if(p.includes('rap')||p.includes('attesa')){total+=10;if(av.status==='accepting'){score+=10;reasons.push('disponibilita dichiarata: accettazione');}else if(av.status==='waitlist'){warnings.push('struttura/professionista in lista d’attesa');}else warnings.push('disponibilita non confermata');}}
 // Verification freshness as transparency factor, not quality score.
 var vs=record.verification&&record.verification.status;if(vs==='stale'){warnings.push('dati di verifica non recenti');}else if(vs==='atlas_verified'||vs==='document_checked'){reasons.push('dati con stato di verifica documentato');}else if(vs==='self_declared'||vs==='unverified'){warnings.push('alcuni dati sono autodichiarati/non verificati');}
 // Normalize score only on applicable criteria.
 var pct=total?Math.round(score/total*100):0;
 var compatible=hard.length===0 && pct>0;
 return {compatible:compatible,score:pct,reasons:reasons,warnings:warnings,hard_mismatches:hard,explanation:{criteria_score:score,criteria_total:total}};
}
function rank(req,records){return arr(records).map(function(r){var m=match(req,r);return {id:r&&r.id,record:r,match:m};}).filter(function(x){return x.match.compatible;}).sort(function(a,b){return b.match.score-a.match.score;});}
root.AtlasMatchingEngine={version:'0.1',match:match,rank:rank};
})(typeof window!=='undefined'?window:globalThis);
