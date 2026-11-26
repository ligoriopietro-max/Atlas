/* Atlas A16 local bridge. Not authentication or a clinical system. */
(function(root){'use strict';
 const titles={'prima-poi':'Rendere prevedibile il passaggio fra due attività',sequenze:'Organizzare un’attività in passaggi',timer:'Rendere visibile il tempo di un’attività',passaporto:'Comunicare preferenze e modalità di supporto',preparazione:'Prepararsi a una nuova esperienza',caa:'Personalizzare una tabella di comunicazione',agenda:'Organizzare una routine visiva',diario:'Organizzare le osservazioni e gli aggiornamenti'};
 const key='atlas-a16-draft-v1', ttl=30*60*1000;
 const str=(x,n)=>typeof x==='string'?x.trim().slice(0,n):'';
 function clean(x,now=Date.now()){
  if(!x||x.v!==1||!['next','goal','note'].includes(x.kind)||!Number.isFinite(x.at)||x.at>now||now-x.at>ttl)return null;
  if(x.kind==='next')return Object.hasOwn(titles,x.tool)?{v:1,kind:x.kind,at:x.at,tool:x.tool}:null;
  const sourceId=str(x.sourceId,50),name=str(x.name,160),details=str(x.details,500),note=str(x.note,1200);
  if(!sourceId||!name||!Object.hasOwn(titles,x.tool)||(x.kind==='note'&&!note))return null;
  return {v:1,kind:x.kind,at:x.at,sourceId,name,details,tool:x.tool,note};
 }
 function put(storage,data){const x=clean({...data,v:1,at:Date.now()});if(!x)throw Error('Bozza non valida');storage.setItem(key,JSON.stringify(x));return x;}
 function take(storage,kind){const raw=storage.getItem(key);if(!raw)return null;let x;try{x=clean(JSON.parse(raw))}catch{}if(!x){storage.removeItem(key);return null;}if(x.kind!==kind)return null;storage.removeItem(key);return x;}
 function upsert(goals,draft,name,details,id,date){if(!draft||draft.kind!=='goal'||!draft.sourceId)throw Error('Bozza non valida');const matches=goals.filter(g=>g.sourceId===draft.sourceId);if(matches.length>1)throw Error('Collegamento ambiguo: controlla gli obiettivi nel Diario.');const found=matches[0];if(!found&&goals.length>=500)throw Error('Limite di obiettivi raggiunto.');const next={...(found||{id,created:date,done:false}),sourceId:draft.sourceId,name:str(name,160),details:str(details,500)};if(!next.name)throw Error('Inserisci il nome dell’obiettivo.');return {goals:found?goals.map(g=>g===found?next:g):[...goals,next],updated:!!found};}
 function readStatus(storage,id){const raw=storage.getItem('atlas_diario_demo_v010');if(!raw)return null;const data=JSON.parse(raw);if(!Array.isArray(data.goals))return null;const matches=data.goals.filter(g=>g&&g.sourceId===id);if(matches.length!==1)return null;return matches[0].done===true?'Raggiunto':'Non raggiunto';}
 root.AtlasA16={titles,clean,put,take,upsert,readStatus};
})(typeof window!=='undefined'?window:globalThis);
