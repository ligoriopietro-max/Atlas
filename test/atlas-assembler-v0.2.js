/* Atlas Assembler v0.1 — end-to-end laboratory orchestration. */
(function(root){'use strict';
function assertApi(name,obj){if(!obj) throw new Error(name+' missing');}
function toBool(v){return v===true||v==='Sì'||v==='Si'||v==='online';}
function profileToFlat(p){
  var f=p&&p.filled||{}, v=p&&p.values||{};
  return {
    provider_type:f.tipo?v.tipo:null,
    provider_qualifier:f.qualificatore?v.qualificatore:null,
    service_type:f.servizio?v.servizio:null,
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
  assertApi('AtlasInputInterpreterV032Candidate',root.AtlasInputInterpreterV032Candidate);
  assertApi('AtlasFreeTextProfileV01',root.AtlasFreeTextProfileV01);
  assertApi('AtlasNextStepEngineV02',root.AtlasNextStepEngineV02);
  var interpreted=root.AtlasInputInterpreterV032Candidate.interpret(text);
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
  return {version:'0.3.0',input:text,domain:domain,interpreter:{confidence:meta.confidence||null},profile:profile,next_step:action,matching_request:matching_request,matching:matching};
}
function audit(records){
  if(!root.AtlasMatchingDataModel) throw new Error('AtlasMatchingDataModel missing');
  return (records||[]).map(function(r){return {id:r.id,validation:root.AtlasMatchingDataModel.validate(r)};});
}
root.AtlasAssemblerV01={run:run,audit:audit,profileToFlat:profileToFlat};

/* v0.8.4.2 hotfix: ask for a concrete city/province directly when D02 has no location.
   This replaces the vague location-mode question, which could leave families without a usable locality. */
var nextStep=root.AtlasNextStepEngineV02;
if(nextStep && typeof nextStep.actionCard==='function' && !nextStep.__atlasLocationFollowupFix){
  var originalActionCard=nextStep.actionCard;
  nextStep.actionCard=function(domain,profile){
    var card=originalActionCard(domain,profile);
    if(domain==='D02'){
      var f=(profile&&profile.filled)||{};
      var v=(profile&&profile.values)||{};
      var loc=String(v.zona||'').trim();
      var hasConcreteLocation=!!f.zona && !!loc && loc.toLowerCase()!=='nella nostra zona' && loc.toLowerCase()!=='nessuna preferenza';
      if(!hasConcreteLocation){
        card.ready=false;
        card.primary_action=null;
        card.next_question={slot:'localita',label:'In quale città o provincia vi serve il servizio?',placeholder:'Es. Lecce, provincia di Bari',input:true};
        card.missing=Array.from(new Set([...(card.missing||[]),'localita']));
        card.reason='Per cercare un servizio serve una città o provincia, salvo che la famiglia scelga esplicitamente una ricerca solo online.';
      }
    }
    return card;
  };
  nextStep.__atlasLocationFollowupFix=true;
}
})(typeof window!=='undefined'?window:globalThis);
