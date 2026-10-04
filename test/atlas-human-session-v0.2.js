/* Atlas Human Session v0.2 — multi-turn session controller with local transcript. */
(function(root){'use strict';
function clone(x){return JSON.parse(JSON.stringify(x));}
function sessionId(){return 'ATLAS-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8).toUpperCase();}
function applyAnswer(profile, answer){
  var p=clone(profile||{version:'0.3',filled:{},values:{},evidence:[],uncertain:[],context:[]});
  p.filled=p.filled||{}; p.values=p.values||{};
  if(!answer || !answer.slot) return p;
  var slot=answer.slot, value=answer.value;
  if(slot==='zona_or_online'){
    if(value==='Solo online'){p.filled.online=true;p.values.online='Sì';}
    else if(value==='Nella nostra zona'){p.filled.zona=true;p.values.zona='Nella nostra zona';}
    else if(value==='Possiamo usare anche l’online'){p.filled.zona=true;p.values.zona='Nella nostra zona';p.filled.online=true;p.values.online='Sì';}
    else if(value==='Non abbiamo preferenze'){p.filled.zona=true;p.values.zona='Nessuna preferenza';p.filled.online=true;p.values.online='Sì';}
  } else if(slot==='zona'){
    if(value==='Nella nostra zona'){p.filled.zona=true;p.values.zona='Nella nostra zona';}
    else if(value==='Possiamo usare anche l’online'){p.filled.zona=true;p.values.zona='Nella nostra zona';p.filled.online=true;p.values.online='Sì';}
    else if(value==='Solo online'){p.filled.online=true;p.values.online='Sì';}
    else {p.filled.zona=true;p.values.zona='Nessuna preferenza';p.filled.online=true;p.values.online='Sì';}
  } else { p.filled[slot]=true; p.values[slot]=value; }
  return p;
}
function start(state,input){
  state=clone(state||{}); state.session=state.session||{id:sessionId(),version:'0.2',turns:[]};
  state.session.turns=Array.isArray(state.session.turns)?state.session.turns:[];
  if(input) state.session.turns.push({type:'input',text:String(input).trim()});
  return state;
}
function advance(state, answer, opts){
  state=clone(state||{});
  state.history=Array.isArray(state.history)?state.history:[];
  state.session=state.session||{id:sessionId(),version:'0.2',turns:[]};
  state.session.turns=Array.isArray(state.session.turns)?state.session.turns:[];
  state.history.push(clone({profile:state.profile,next_step:state.next_step,matching_request:state.matching_request,matching:state.matching,session:state.session}));
  state.session.turns.push({type:'answer',slot:String(answer&&answer.slot||''),value:String(answer&&answer.value||'')});
  var profile=applyAnswer(state.profile,answer);
  var domain=state.domain||'D01';
  var next=root.AtlasNextStepEngineV02.actionCard(domain,profile);
  var flat=root.AtlasAssemblerV01.profileToFlat(profile); flat.primary_domain=domain;
  var request=null, matching=null;
  if(next.action==='MATCH'){
    request=root.AtlasMatchingRequest.build(flat);
    if(opts&&opts.records&&request.status==='ready'&&root.AtlasMatchingRequest.canMatch(request)) matching=root.AtlasMatchingEngine.rank(request,opts.records);
  }
  state.profile=profile; state.next_step=next; state.matching_request=request; state.matching=matching;
  return state;
}
function back(state){
  state=clone(state||{});
  if(!Array.isArray(state.history)||!state.history.length) return state;
  var prev=state.history.pop();
  state.profile=prev.profile||state.profile; state.next_step=prev.next_step||null; state.matching_request=prev.matching_request||null; state.matching=prev.matching||null; state.session=prev.session||state.session;
  return state;
}
function snapshot(state){return clone({session:state&&state.session||null,profile:state&&state.profile||null,next_step:state&&state.next_step||null,domain:state&&state.domain||null,matching_request:state&&state.matching_request||null,matching:state&&state.matching||null});}
function exportJson(state){
  var blob=new Blob([JSON.stringify(snapshot(state),null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=u;a.download='atlas_sessione_anonima_v0.2.json';a.click();setTimeout(function(){URL.revokeObjectURL(u)},1000);
}
root.AtlasHumanSessionV01={applyAnswer,advance,back,start,snapshot,exportJson};
})(typeof window!=='undefined'?window:globalThis);
