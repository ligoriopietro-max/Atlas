/* Atlas Free-Text Profile v0.3 — semantic slot filling layer.
 * Reads the whole free-text input and marks only explicitly supported slots.
 * It does not classify or modify the Atlas engine.
 */
(function(){'use strict';
const RX={
 logopedista:/\blogoped(?:ista|ia|ico|ica)\b/i,npi:/\b(?:npi|neuropsichiatra(?: infantile)?|neuropsichiatria infantile)\b/i,
 psicologo:/\bpsicolog\w*\b/i,educatore:/\beducator\w*\b/i,neuropsicomotricista:/\bneuropsicomotric\w*\b/i,
 terapista:/\bterapist\w*\b/i,medico:/\b(?:medico|dottore|specialista)\b/i,centro:/\b(?:centro|struttura|clinica)\b/i,
 professionista:/\bprofessionist\w*\b/i, online:/\b(?:online|a distanza|da remoto|teleconsulto)\b/i,
 wait:/\b(?:lista d['’]?attesa|mesi? di attesa|settimane? di attesa|aspettare|attendere|tempi lunghi|non voglio aspettare|non posso aspettare|disponibil\w*)\b/i,
 rapid:/\b(?:presto|urgente|in tempi brevi|subito|rapidamente|prima possibile|il prima possibile|quanto prima)\b/i,
 public:/\b(?:pubblico|pubblica|asl|ssn|servizio pubblico)\b/i, private:/\b(?:privato|privata|a pagamento)\b/i,
 cost:/\b(?:costo|costi|costano|spesa|spese|prezzo|economico|economica|convenzione|voucher|contributo|sostenibile|sostenibilit)\b/i,
 diagnosis:/\b(?:diagnosi|valutazione|assessment|certificazione|profilo diagnostico)\b/i,
 therapy:/\b(?:terapia|terapie|intervento|interventi|aba|logopedia|psicomotricit|riabilitaz)\b/i,
 sleep:/\b(?:sonno|dorme|dormire|insonnia|risvegli)\b/i, food:/\b(?:alimentazione|mangiare|cibo|selettivit|pasti|svezzamento)\b/i,
 communication:/\b(?:parla|parlare|linguaggio|comunicazione|echolalia|non parla)\b/i,
 hygiene:/\b(?:igiene|bagno|toilette|autonomia|vestirsi)\b/i, behavior:/\b(?:comportamento|crisi|aggressiv|meltdown|capricci)\b/i,
 school:/\b(?:scuola|insegnant\w*|maestr\w*|professor\w*|classe|inclusione|PEI|sostegno scolastico)\b/i,
 rights:/\b(?:inps|104|invalidit|indennit|diritti|patronato|burocrazia|benefici|voucher|contributi)\b/i,
 family:/\b(?:famiglia|genitore|genitori|mamma|papà|papa|stanchezza|sfinito|sfinita|esausto|esausta|solo|sola|soli|sole|carico familiare)\b/i,
 coordinate:/\b(?:coordinare|coordinamento|collaborazione|collaborare|non si parlano|piano condiviso|ripetere tutto|ognuno fa|ognuno segue)\b/i,
 choose:/\b(?:scegliere|scelta|confrontare|confronto|quale dei due|pro e contro|meglio|quale .*? scegliere|non so quale|indecis[oi])\b/i,
 info:/\b(?:informazioni affidabili|informazioni|fonti affidabili|capire cosa|cosa significa|cosa vuol dire|spiegazioni)\b/i,
 second:/\b(?:secondo parere|seconda opinione|altro parere|altra valutazione|opinione diversa|due valutazioni diverse|non condividiamo la diagnosi)\b/i,
 access:/\b(?:non riesco ad accedere|come accedere|accesso|lista d['’]?attesa|non mi prendono|non c['’]è posto|nessuna disponibilit)\b/i,
 newchange:/\b(?:da poco|ultimamente|improvvisamente|all['’]improvviso|è cambiato|cambiamento|nuova difficolt|ha iniziato a)\b/i,
 schoolTransition:/\b(?:cambio scuola|cambiare scuola|passaggio di ciclo|nuova scuola|transizione|inizio scuola|ingresso a scuola)\b/i
};
const CITIES=/\b(?:Napoli|Roma|Milano|Lecce|Bari|Torino|Palermo|Genova|Bologna|Firenze|Venezia|Pisa|Messina|Bergamo|Monza|Udine|Trieste|Foggia|Brindisi|Taranto|Caserta|Salerno|Padova|Parma|Modena|Ravenna|Cagliari|Perugia|Ancona|Pescara|Como|Lecco|Pavia|Sassari|Matera|Potenza|Catania|Rimini|Vicenza|Treviso|Prato|Livorno|Arezzo|Lucca|Alessandria|Novara|Varese|Ferrara|Forlì|Cesena|Piacenza|Trento|Bolzano)\b/i;
function has(re,t){return re.test(t)}
function spanNegated(t,re){const m=t.match(re);if(!m)return false;const before=t.slice(Math.max(0,m.index-55),m.index).toLowerCase();return /\b(?:non|nessun|nessuna|senza|mai)\b[^.!?]{0,35}$/.test(before)}
function uncertainAround(t,re){const m=t.match(re);if(!m)return false;const a=Math.max(0,m.index-55),b=Math.min(t.length,m.index+m[0].length+55);const w=t.slice(a,b).toLowerCase();return /\b(?:non so se|non sappiamo se|chiss[aà]|forse|devo capire se|mi chiedo se|potrebbe servire|sembra che serva)\b/.test(w)}
function explicitRequest(t,re){const m=t.match(re);if(!m)return false;const a=Math.max(0,m.index-70),b=Math.min(t.length,m.index+m[0].length+30);const w=t.slice(a,b).toLowerCase();return /\b(?:cerco|cerca|cerchiamo|cercavo|sto cercando|mi serve|ci serve|serve|vorrei|abbiamo bisogno di|ho bisogno di|ci occorre|necessito|voglio trovare)\b/.test(w)}
function provider(t){
 const list=[['logopedista',RX.logopedista],['neuropsichiatra infantile',RX.npi],['psicologo',RX.psicologo],['educatore',RX.educatore],['neuropsicomotricista',RX.neuropsicomotricista],['terapista',RX.terapista],['medico/specialista',RX.medico],['centro/struttura',RX.centro],['professionista',RX.professionista]];
 for(const [label,re] of list){if(has(re,t)&&!spanNegated(t,re)&&!uncertainAround(t,re)&&explicitRequest(t,re))return label}
 return null;
}
function location(t){
 // Explicit city names first. Never treat "online" as a location.
 const c=t.match(CITIES); if(c&&!/\b(?:non|senza)\s+(?:andare|spostarmi|muovermi)\b/i.test(t.slice(Math.max(0,c.index-35),c.index)))return c[0];
 const m=t.match(/\b(?:a|ad|in|zona|provincia di|comune di)\s+([A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,}(?:\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,})?)/);
 if(!m)return null; const v=m[1].trim(); if(/^(online|distanza|remoto|casa)$/i.test(v))return null; if(v.length>30)return null; return v;
}
function extract(text,domain){
 const t=String(text||'').replace(/\s+/g,' ').trim(); const p={version:'0.3',domain,filled:{},values:{},evidence:[],uncertain:[],context:[]};
 const set=(slot,val,why)=>{if(val!==null&&val!==undefined&&val!==''){p.filled[slot]=true;p.values[slot]=val;p.evidence.push({slot,value:val,evidence:why})}};
 const uncertain=(slot,val,why)=>p.uncertain.push({slot,value:val,evidence:why});
 const context=(slot,val,why)=>p.context.push({slot,value:val,evidence:why});
 const prov=provider(t); if(prov)set('tipo',prov,'tipo di professionista/servizio richiesto esplicitamente');
 // Preserve explicit professional qualifiers instead of collapsing them into a generic role.
 const qualifiers=[
   ['comportamentale',/\bterapist[ao]?\s+comportamentale\b/i],
   ['occupazionale',/\bterapist[ao]?\s+occupazionale\b/i],
   ['della riabilitazione',/\bterapist[ao]?\s+della\s+riabilitazione\b/i],
   ['dell\'eta evolutiva',/\b(?:psicolog[oa]|terapist[ao])\s+dell['’]et[aà]\s+evolutiva\b/i],
   ['CAA',/\b(?:logopedista|terapist[ao])\s+(?:con\s+)?CAA\b/i],
   ['infantile',/\b(?:neuropsichiatra|psicolog[oa]|terapist[ao])\s+infantile\b/i]
 ];
 for(const q of qualifiers){if(q[1].test(t)){set('qualificatore',q[0],'qualificatore professionale esplicitamente indicato');break;}}
 const loc=location(t); if(loc)set('zona',loc,'località esplicitamente indicata');
 if(has(RX.online,t))set('online','Sì','modalità online esplicitamente indicata');
 if(has(RX.wait,t)||has(RX.rapid,t))set('priorita','Disponibilità/tempi','attesa o rapidità esplicitamente citata');
 if(has(RX.public,t)&&has(RX.private,t))set('setting','Pubblico e privato','pubblico e privato esplicitati'); else if(has(RX.public,t))set('setting','Pubblico','pubblico esplicitato'); else if(has(RX.private,t))set('setting','Privato','privato esplicitato');
 if(domain==='D01'){if(/\b(?:abbiamo parlato|abbiamo sentito|ci siamo rivolti|abbiamo fatto una valutazione|abbiamo iniziato un percorso|abbiamo già iniziato|abbiamo già fatto|abbiamo già parlato)\b/i.test(t))set('fatto','Abbiamo già parlato/fatto una valutazione','azioni già svolte esplicitate'); if(/\b(?:diagnosi|valutazione)\b/i.test(t))set('fase','Diagnosi/valutazione','fase del percorso esplicitata'); if(/\b(?:non so|non sappiamo|non capisco|non so come|non sappiamo come)\b/i.test(t))set('blocco','Incertezza sul prossimo passo','blocco esplicitato')}
if(has(RX.choose,t)){ if(has(RX.cost,t))set('criterio','Costi','costo indicato come criterio di scelta'); else if(has(RX.wait,t)||has(RX.rapid,t))set('criterio','Distanza/disponibilità','disponibilità indicata come criterio'); else set('criterio','Differenze tra le opzioni','confronto/scelta espliciti'); set('obiettivo','Una scelta più sicura','obiettivo di scelta esplicitato') }
 if(domain==='D03' && /\b(?:centro|centri|struttura|strutture|professionista|professionisti|logopedista|logopedisti|terapia|terapie|intervento|interventi|percorso|percorsi)\b/i.test(t)){ const m=t.match(/\b(?:centro|centri|struttura|strutture|professionista|professionisti|logopedista|logopedisti|terapia|terapie|intervento|interventi|percorso|percorsi)\b/i); if(m&&!p.filled.oggetto)set('oggetto',m[0].toLowerCase(),'oggetto del confronto esplicitato')}
 if(domain==='D04'||has(RX.second,t)){if(has(RX.diagnosis,t)||/\b(?:due valutazioni|opinioni? diverse|valutazioni? diverse)\b/i.test(t))set('oggetto','Diagnosi/valutazione','oggetto del secondo parere esplicitato');else if(/\b(?:terapia|intervento|percorso)\w*\b/i.test(t))set('oggetto','Percorso/intervento','percorso già proposto esplicitato'); if(/\b(?:opinioni? diverse|due valutazioni|non condividiamo)\b/i.test(t))set('motivo','Opinioni diverse','motivo del secondo parere esplicitato'); else if(has(RX.second,t)||/\b(?:dubbi?|maggiore chiarezza|verificare)\b/i.test(t))set('motivo','Vogliamo maggiore chiarezza','secondo parere esplicitato'); if(/\b(?:corrett[oa]|giusta?|giusto?)\b/i.test(t))set('obiettivo','Verificare la valutazione','obiettivo di verifica esplicitato')}
 if(has(RX.diagnosis,t))set('oggetto',p.filled.oggetto?p.values.oggetto:'Diagnosi/valutazione','diagnosi/valutazione esplicitata');
 if(has(RX.therapy,t))set('bisogno','Intervento/terapia','intervento/terapia esplicitati');
 if(has(RX.sleep,t))set('area','Sonno','sonno esplicitato'); else if(has(RX.food,t))set('area','Alimentazione','alimentazione esplicitata'); else if(has(RX.communication,t))set('area','Comunicazione','comunicazione/linguaggio esplicitati'); else if(has(RX.hygiene,t))set('area','Igiene/autonomia','autonomia esplicitata'); else if(has(RX.behavior,t))set('area','Comportamento/crisi','comportamento esplicitato');
 if(has(RX.school,t))set('fase',has(RX.schoolTransition,t)?'Transizione/cambio scuola':'Scuola attuale','scuola esplicitata');
 if(has(RX.rights,t))set('tema',/\b104\b/i.test(t)?'Invalidità/104':'Diritti/pratiche','diritto o pratica esplicitati');
 if(has(RX.coordinate,t)){set('problema','Coordinamento frammentato','problema di coordinamento esplicitato');set('obiettivo','Un piano condiviso','obiettivo di coordinamento esplicitato')}
 if(domain==='D05'){if(/\b(?:come posso accedere|come accedere|accesso al servizio|percorso pubblico.*bloccato|aspett(iamo|iamo) da .*mesi)\b/i.test(t))set('ostacolo','Accesso/disponibilità','accesso o blocco esplicitato');}
 if(domain==='D06'&&/\b(?:fonti\w*\s+(?:siano\s+)?affidabili|informazioni affidabili|informazioni.*diagnosi|capire cosa|cosa significa|spiegazioni)\b/i.test(t))set('uso',/\b(?:decidere|decisione|scegliere|scelta)\b/i.test(t)?'Prendere una decisione':'Capire una situazione','uso informativo esplicitato');
 if(domain==='D07'&&/\b(?:stiamo già facendo|facciamo già|abbiamo iniziato|seguiamo già|siamo già in)\b/i.test(t)&&has(RX.therapy,t))set('percorso','Sì','percorso attivo esplicitato');
 if(domain==='D09'){if(/\b(?:ogni professionista segue|piano diverso|informazioni condivise|non si parlano|collaborano)\b/i.test(t))set('problema','Coordinamento frammentato','frammentazione/coordinamento esplicitati'); if(/\b(?:famiglia|terapisti?|professionisti?|scuola|professionista)\b/i.test(t))set('attori','Più persone coinvolte','rete di attori esplicitata'); if(/\b(?:piano condiviso|collaborare|coordinare|informazioni condivise|piano diverso|ognuno segue)\b/i.test(t))set('obiettivo','Un piano condiviso','obiettivo di coordinamento esplicitato');}
 if(domain==='D10'){if(/\b(?:appuntament\w*|agenda|calendario|orari)\b/i.test(t))set('problema','Appuntamenti','appuntamenti/agenda esplicitati'); else if(has(RX.school,t)&&/\b(?:attivit|impegni|organizz)\b/i.test(t))set('problema','Scuola e attività','organizzazione esplicitata'); if(has(RX.family,t))set('carico','Molto','carico familiare esplicitato')}
 if(domain==='D10'){if(/\b(?:appuntament|calendario|scadenze?|visite?|impegni|spostamenti|organizzar|organizzare)\w*\b/i.test(t))set('problema','Appuntamenti/organizzazione','problema organizzativo esplicitato'); if(/\b(?:esaust|sfin|stanch|sopraff|troppo carico)\w*\b/i.test(t))set('carico','Molto','carico familiare esplicitato');}
 if(domain==='D15'&&(/\b(?:supporto|aiuto|sostegno|soli|sole|stanch\w*|sfin\w*|esaust\w*|famiglia|genitori|gestione quotidiana)\b/i.test(t))){if(/\b(?:sfin|esaust|stanch|solo|sola|soli|sole|sopraff|gestione quotidiana)\w*\b/i.test(t))set('carico','Stanchezza/solitudine','carico familiare esplicitato'); if(/\b(?:supporto|aiuto|sostegno)\b/i.test(t))set('supporto','Supporto alla famiglia','supporto esplicitamente richiesto'); if(/\b(?:aiuto concreto|riorganizzare|sostenere la famiglia|meno solo|meno sola)\b/i.test(t))set('obiettivo','Alleggerire il carico familiare','obiettivo familiare esplicitato')}
 if(domain==='D05'){if(has(RX.wait,t))set('ostacolo','Lista d’attesa','attesa esplicitata'); else if(/\b(?:nessuna disponibilit|non c['’]è posto|non riesco ad accedere)\b/i.test(t))set('ostacolo','Accesso/disponibilità','problema di accesso esplicitato'); if(has(RX.rapid,t))set('urgenza','Molto','rapidità esplicitata')}
 if(domain==='D06'){if(has(RX.info,t))set('uso',/\b(?:decidere|scelta|scegliere)\b/i.test(t)?'Prendere una decisione':'Capire una situazione','uso dell’informazione esplicitato'); if(/\b(?:contradditt|non so quali fonti|fonti affidabili)\w*\b/i.test(t))set('problema','Affidabilità/contraddizioni','problema informativo esplicitato')}
 if(domain==='D07'){if(/\b(?:logopedia|logoped)\w*\b/i.test(t)||has(RX.communication,t))set('area','Comunicazione/linguaggio','area terapeutica esplicitata'); if(has(RX.sleep,t))set('area','Sonno','area terapeutica esplicitata'); if(has(RX.food,t))set('area','Alimentazione','area terapeutica esplicitata'); if(has(RX.behavior,t))set('area','Comportamento','area terapeutica esplicitata'); if(/\b(?:già|attualmente|seguit[oa]|facciamo|abbiamo iniziato)\b/i.test(t)&&has(RX.therapy,t))set('percorso','Sì','percorso attivo esplicitato')}
 if(domain==='D08'){if(/\b(?:ogni giorno|tutti i giorni|quotidianamente)\b/i.test(t))set('frequenza','Ogni giorno','frequenza esplicitata'); else if(/\b(?:ogni tanto|raramente|a volte)\b/i.test(t))set('frequenza','Ogni tanto','frequenza esplicitata'); if(/\b(?:strategie|consigli|aiuto pratico)\b/i.test(t))set('aiuto','Strategie pratiche','tipo di aiuto richiesto')}
 if(domain==='D09'&&has(RX.coordinate,t)){if(/\b(?:scuola|insegnant|maestr)\w*\b/i.test(t)&&has(RX.therapy,t))set('attori','Terapisti e scuola','attori esplicitati'); else if(/\b(?:famiglia|genitori)\b/i.test(t)&&has(RX.therapy,t))set('attori','Famiglia e terapisti','attori esplicitati'); else set('attori','Più professionisti','rete multiprofessionale esplicitata')}
 if(domain==='D11'){if(/\b(?:inclusione|sostegno|PEI|insegnant)\w*\b/i.test(t))set('problema','Inclusione/supporto','problema scolastico esplicitato'); if(/\b(?:informazioni|cosa fare|passi)\b/i.test(t))set('aiuto','Informazioni','aiuto richiesto')}
 if(domain==='D11'&&/\b(?:scuola|passaggio di ciclo|cambio scuola|cambiamo scuola|nuova scuola|inizio scuola|transizione)\b/i.test(t))set('fase','Transizione/cambio scuola','transizione scolastica esplicitata');
 if(domain==='D12'){if(/\b(?:104|invalidit|indennit|contributo|voucher|inps|patronato)\b/i.test(t))set('tema',/\b104\b/i.test(t)?'Invalidità/104':'Diritti/pratiche','diritto o pratica esplicitati'); if(/\b(?:documenti?|cosa serve|quali documenti)\b/i.test(t))set('obiettivo','Capire quali documenti servono','documenti esplicitati'); else if(/\b(?:a chi|chi devo|chi dobbiamo)\b/i.test(t))set('obiettivo','Capire a chi rivolgermi','interlocutore richiesto')}
 if(domain==='D13'){if(/(?:troppe spese|spese.*sostenibili|insostenibil|non riusciamo.*sostenere|non possiamo permetterci|\d+\s*(?:euro|€)\s*(?:al mese|al mese)?)/i.test(t))set('impatto','Difficile da sostenere','sostenibilità economica esplicitata'); if(/\b(?:agevolazioni|contributi|ridurre i costi|ridurre i costi)\b/i.test(t))set('obiettivo','Ridurre i costi/cercare sostegni','obiettivo economico esplicitato'); if(has(RX.therapy,t))set('spesa','Terapie/interventi','spesa terapeutica esplicitata'); else if(/\b(?:visite?|professionist|medic)\w*\b/i.test(t))set('spesa','Professionisti/visite','spesa sanitaria esplicitata'); if(/\b(?:non riusciamo|non posso|non possiamo|troppo|difficile da sostenere)\b/i.test(t))set('impatto','Difficile da sostenere','sostenibilità economica esplicitata')}
 if(domain==='D14'){if(/\b(?:nuova difficolt|cambiata|cambiamento|da poco)\b/i.test(t)&&has(RX.hygiene,t))set('cambiamento','Autonomia','nuova difficoltà esplicitata'); if(has(RX.sleep,t))set('cambiamento','Sonno','nuova difficoltà esplicitata'); else if(has(RX.food,t))set('cambiamento','Alimentazione','nuova difficoltà esplicitata'); else if(has(RX.behavior,t))set('cambiamento','Comportamento','nuova difficoltà esplicitata'); else if(has(RX.communication,t))set('cambiamento','Comunicazione','nuova difficoltà esplicitata'); if(/\b(?:pochi giorni|qualche giorno)\b/i.test(t))set('inizio','Da pochi giorni','tempo esplicitato'); else if(/\b(?:settimane|qualche settimana)\b/i.test(t))set('inizio','Da alcune settimane','tempo esplicitato')}
 // Explicitly mentioned existing resources are context, not requested slots.
 if(/\b(?:abbiamo già|ci segue|siamo seguit|frequentiamo|abbiamo una|abbiamo un)\b/i.test(t)&&prov)context('risorsa_esistente',prov,'professionista/servizio già presente nel contesto');
 if(/\b(?:non so se|forse|chiss[aà]|devo capire se|potrebbe servire)\b/i.test(t)&&/(?:logoped|npi|psicolog|terapist|medico|professionist|centro)/i.test(t))uncertain('tipo','professionista non ancora scelto','linguaggio di incertezza');
 if(p.filled.tipo && p.filled.qualificatore){set('tipo_richiesto',p.values.tipo+' '+p.values.qualificatore,'tipo professionale completo con qualificatore');}
 return p;
}
function filterFlow(flow,p){return Object.assign({},flow,{qs:flow.qs.filter(q=>!p.filled[q[0]])});}
window.AtlasFreeTextProfileV01={extract,filterFlow};
})();
