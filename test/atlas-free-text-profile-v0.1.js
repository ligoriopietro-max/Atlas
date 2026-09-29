/* Atlas Free-Text Profile v0.1 — extract explicit slots before follow-up questions.
 * Conservative: only fills a slot when the text contains reasonably explicit evidence.
 * It never changes the classifier/engine.
 */
(function(){'use strict';
 const RX={
  logopedista:/\blogoped\w*/i,npi:/\b(?:npi|neuropsichiatra(?: infantile)?|neuropsichiatria infantile)\b/i,
  psicologo:/\bpsicolog\w*/i,educatore:/\beducator\w*/i,neuropsicomotricista:/\bneuropsicomotric\w*/i,
  terapista:/\bterapist\w*/i,medico:/\b(?:medico|dottore|specialista)\b/i,centro:/\b(?:centro|struttura|clinica)\b/i,
  online:/\bonline\b|\ba distanza\b/i,wait:/\b(?:lista d['’]?attesa|sei mesi|mesi di attesa|aspettare|attendere|tempi lunghi|disponibil\w*)\b/i,
  rapid:/\b(?:presto|urgente|in tempi brevi|subito|rapidamente|prima possibile)\b/i,
  public:/\b(?:pubblico|asl|ssn|servizio pubblico)\b/i,private:/\b(?:privato|privata|a pagamento)\b/i,
  cost:/\b(?:costo|costi|costano|spesa|spese|prezzo|economico|convenzione|voucher|contributo)\b/i,
  diagnosis:/\b(?:diagnosi|valutazione|assessment|certificazione)\b/i,
  therapy:/\b(?:terapia|terapie|intervento|interventi|aba|logopedia|psicomotricit)\b/i,
  sleep:/\b(?:sonno|dorme|dormire|insonnia)\b/i,food:/\b(?:alimentazione|mangiare|cibo|selettivit)\b/i,
  communication:/\b(?:parla|parlare|linguaggio|comunicazione|echolalia)\b/i,
  hygiene:/\b(?:igiene|bagno|toilette|autonomia)\b/i,behavior:/\b(?:comportamento|crisi|aggressiv|capricci)\b/i,
  school:/\b(?:scuola|insegnante|maestra|professore|classe|inclusione|PEI)\b/i,
  rights:/\b(?:inps|104|invalidit|indennit|diritti|patronato|burocrazia|benefici|voucher)\b/i,
  family:/\b(?:famiglia|genitore|genitori|mamma|pap|stanchezza|sfinito|sfinita|solo|sola|carico)\b/i,
  coordinate:/\b(?:coordinare|collaborazione|collaborare|non si parlano|piano condiviso|ripetere tutto)\b/i,
  choose:/\b(?:scegliere|scelta|confrontare|confronto|quale dei due|pro e contro)\b/i,
  info:/\b(?:informazioni affidabili|informazioni|fonti affidabili|capire cosa|cosa significa)\b/i
 };
 function negated(text, re){ const m=String(text).match(re); if(!m)return false; const s=String(text).slice(Math.max(0,m.index-35),m.index).toLowerCase(); return /\b(?:non|no|nessun|nessuna|senza|non so se|chiss)\b[^.!?]{0,25}$/.test(s); }
 function location(text){
  const t=String(text);
  const m=t.match(/\b(?:a|ad|in|zona|provincia di|comune di)\s+([A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,}(?:\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,})?)/);
  if(m && !/^(Napoli|Roma|Milano|Lecce|Bari|Torino|Palermo|Genova|Bologna|Firenze|Venezia|Pisa|Messina|Bergamo|Monza|Udine|Trieste|Foggia|Brindisi|Taranto|Caserta|Salerno|Padova|Parma|Modena|Ravenna|Cagliari|Perugia|Ancona|Pescara|Como|Lecco|Pavia|Sassari|Matera|Potenza)$/i.test(m[1]) && m[1].length>22) return null;
  return m?m[1].trim():null;
 }
 function provider(text){
  const t=String(text);
  const candidates=[['logopedista',RX.logopedista],['neuropsichiatra infantile',RX.npi],['psicologo',RX.psicologo],['educatore',RX.educatore],['neuropsicomotricista',RX.neuropsicomotricista],['terapista',RX.terapista],['medico/specialista',RX.medico],['centro/struttura',RX.centro],['professionista',/\bprofessionista\b/i]];
  for(const [label,re] of candidates){ if(re.test(t) && !negated(t,re) && !/\b(?:non so|chiss|se serve|forse serve)\b/i.test(t.slice(Math.max(0,t.search(re)-25),t.search(re)+35))) return label; }
  return null;
 }
 function extract(text,domain){
  const t=String(text||'').trim(), p={domain,filled:{},values:{},evidence:[]};
  const set=(slot,val,why)=>{if(val!==null&&val!==undefined&&val!==''){p.filled[slot]=true;p.values[slot]=val;p.evidence.push({slot,value:val,evidence:why});}};
  const prov=provider(t); if(prov) set('tipo',prov,'professionista esplicitamente richiesto');
  const loc=location(t); if(loc) set('zona',loc,'località esplicitamente indicata');
  if(RX.online.test(t)) set('zona','Online','richiesta online esplicita');
  if(RX.wait.test(t) || RX.rapid.test(t)) set('priorita','Disponibilità/tempi','attesa o rapidità esplicitamente citata');
  if(RX.public.test(t) && RX.private.test(t)) set('setting','Pubblico e privato','entrambi esplicitati'); else if(RX.public.test(t)) set('setting','Pubblico','pubblico esplicitato'); else if(RX.private.test(t)) set('setting','Privato','privato esplicitato');

  if(RX.choose.test(t)) { set('criterio', RX.cost.test(t)?'Costi':(RX.wait.test(t)?'Distanza/disponibilità':null),'criterio esplicito'); set('obiettivo','Una scelta più sicura','scelta/confronto esplicito'); }
  if(RX.diagnosis.test(t)) set('oggetto','Diagnosi','diagnosi/valutazione esplicitata');
  if(RX.therapy.test(t)) set('bisogno','Intervento/terapia','intervento esplicitato');
  if(RX.sleep.test(t)) set('area','Sonno','sonno esplicitato');
  else if(RX.food.test(t)) set('area','Alimentazione','alimentazione esplicitata');
  else if(RX.communication.test(t)) set('area','Comunicazione','comunicazione/linguaggio esplicitati');
  else if(RX.hygiene.test(t)) set('area','Igiene/autonomia','autonomia esplicitata');
  else if(RX.behavior.test(t)) set('area','Comportamento/crisi','comportamento esplicitato');
  if(RX.school.test(t)) set('fase','Scuola attuale','scuola esplicitata');
  if(RX.rights.test(t)) set('tema','Invalidità/104','diritti/pratiche esplicitati');
  if(RX.coordinate.test(t)) {set('problema','Non si parlano','problema di coordinamento esplicitato');set('obiettivo','Un piano condiviso','coordinamento richiesto');}
  if(RX.family.test(t) && domain==='D15') set('carico','Stanchezza','carico familiare esplicitato');
  if(domain==='D05' && (RX.wait.test(t)||RX.rapid.test(t))) {set('ostacolo','Lista d’attesa','attesa esplicitata');set('urgenza',RX.rapid.test(t)?'Molto':'Abbastanza','priorità temporale esplicitata');}
  if(domain==='D13' && RX.cost.test(t)) set('spesa',RX.therapy.test(t)?'Terapie/interventi':'Più spese insieme','costi/spese esplicitati');
  if(domain==='D14' && (RX.sleep.test(t)||RX.food.test(t)||RX.behavior.test(t)||RX.communication.test(t))) set('cambiamento',RX.sleep.test(t)?'Sonno':RX.food.test(t)?'Alimentazione':RX.communication.test(t)?'Comunicazione':'Comportamento','nuova difficoltà esplicitata');
  if(domain==='D12' && RX.rights.test(t)) set('tema','Invalidità/104','pratica/diritto esplicitato');
  if(domain==='D06' && RX.info.test(t)) set('uso','Capire una situazione','richiesta informativa esplicita');
  if(domain==='D09' && RX.coordinate.test(t)) set('obiettivo','Un piano condiviso','obiettivo di coordinamento esplicito');
  return p;
 }
 function filterFlow(flow,profile){
  const qs=flow.qs.filter(q=>!profile.filled[q[0]]);
  return Object.assign({},flow,{qs});
 }
 window.AtlasFreeTextProfileV01={extract,filterFlow};
})();
