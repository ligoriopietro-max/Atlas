/* Atlas Assembler v0.1 — end-to-end laboratory orchestration. */
(function(root){'use strict';
function assertApi(name,obj){if(!obj) throw new Error(name+' missing');}
function toBool(v){return v===true||v==='Sì'||v==='Si'||v==='online';}
function profileToFlat(p){
  var f=p&&p.filled||{}, v=p&&p.values||{};
  return {
    provider_type:f.tipo?v.tipo:null,
    service_type:null,
    object:f.oggetto?v.oggetto:null,
    location:f.zona?v.zona:null,
    online:f.online?true:null,
    setting:f.setting?v.setting:null,
    priority:f.priorita?v.priorita:null,
    phase:f.fase?v.fase:null,
    family_goal:f.obiettivo?v.obiettivo:null,
    barriers:f.ostacolo?[v.ostacolo]:[],
    resources:f.risorsa_esistente?[v.risorsa_esistente]:[]
  };
}
function normalizeRequest(p,domain){
  var x=profileToFlat(p); x.primary_domain=domain;
  return root.AtlasMatchingRequest.build(x);
}
function run(text,opts){
  opts=opts||{};
  assertApi('AtlasInputInterpreterV029Candidate',root.AtlasInputInterpreterV029Candidate);
  assertApi('AtlasFreeTextProfileV01',root.AtlasFreeTextProfileV01);
  assertApi('AtlasNextStepEngineV02',root.AtlasNextStepEngineV02);
  var interpreted=root.AtlasInputInterpreterV029Candidate.interpret(text);
  var meta=interpreted._meta||{};
  var domain=meta.primaryDomain||meta.topDomain||'D01';
  var profile=root.AtlasFreeTextProfileV01.extract(text,domain);
  var action=root.AtlasNextStepEngineV02.actionCard(domain,profile);
  // Matching is a downstream capability, not a generic container for every domain.
  // It must never appear for orientation, information, support, coordination, etc.
  var matching_request=null;
  var matching=null;
  if(action.action==='MATCH'){
    matching_request=normalizeRequest(profile,domain);
    if(opts.records && root.AtlasMatchingEngine && matching_request.status==='ready' && root.AtlasMatchingRequest.canMatch(matching_request)){
      matching=root.AtlasMatchingEngine.rank(matching_request,opts.records);
    }
  }
  return {version:'0.2.1',input:text,domain:domain,interpreter:{confidence:meta.confidence||null},profile:profile,next_step:action,matching_request:matching_request,matching:matching};
}
function audit(records){
  if(!root.AtlasMatchingDataModel) throw new Error('AtlasMatchingDataModel missing');
  return (records||[]).map(function(r){return {id:r.id,validation:root.AtlasMatchingDataModel.validate(r)};});
}
root.AtlasAssemblerV01={run:run,audit:audit,profileToFlat:profileToFlat};
})(typeof window!=='undefined'?window:globalThis);
