/* Atlas Next Step Engine v0.2 — missing-information loop. */
(function(){'use strict';
const RULES={
 D01:{action:'ORIENT',required:['fase','blocco'],optional:['risorsa','priorita'],questionMap:{fase:'fase',blocco:'blocco',risorsa:'risorsa',priorita:'priorita',direzione:'direzione'}},
 D02:{action:'MATCH',required:['tipo','zona_or_online'],optional:['setting','priorita'],questionMap:{tipo:'tipo',zona_or_online:'zona_or_online',setting:'setting',priorita:'priorita'}},
 D03:{action:'COMPARE',required:['oggetto','criterio'],optional:['zona_or_online'],questionMap:{oggetto:'oggetto',criterio:'criterio',zona_or_online:'zona_or_online'}},
 D04:{action:'COMPARE',required:['oggetto','motivo'],optional:['zona_or_online'],questionMap:{oggetto:'oggetto',motivo:'motivo',zona_or_online:'zona_or_online'}},
 D05:{action:'ACCESS',required:['servizio','ostacolo'],optional:['urgenza'],questionMap:{servizio:'servizio',ostacolo:'ostacolo',urgenza:'urgenza'}},
 D06:{action:'INFO',required:['tema','uso'],optional:['problema'],questionMap:{tema:'tema',uso:'uso',problema:'problema'}},
 D07:{action:'ORIENT',required:['bisogno','area'],optional:['percorso'],questionMap:{bisogno:'bisogno',area:'area',percorso:'percorso'}},
 D08:{action:'ORIENT',required:['area','aiuto'],optional:['frequenza'],questionMap:{area:'area',aiuto:'aiuto',frequenza:'frequenza'}},
 D09:{action:'COORDINATE',required:['attori','problema'],optional:['obiettivo'],questionMap:{attori:'attori',problema:'problema',obiettivo:'obiettivo'}},
 D10:{action:'ORGANIZE',required:['problema','obiettivo'],optional:['carico'],questionMap:{problema:'problema',obiettivo:'obiettivo',carico:'carico'}},
 D11:{action:'ORIENT',required:['fase','problema'],optional:['aiuto'],questionMap:{fase:'fase',problema:'problema',aiuto:'aiuto'}},
 D12:{action:'PREPARE',required:['tema','stato'],optional:['obiettivo'],questionMap:{tema:'tema',stato:'stato',obiettivo:'obiettivo'}},
 D13:{action:'SUPPORT',required:['spesa','impatto'],optional:['obiettivo'],questionMap:{spesa:'spesa',impatto:'impatto',obiettivo:'obiettivo'}},
 D14:{action:'ORIENT',required:['cambiamento','inizio'],optional:['azione'],questionMap:{cambiamento:'cambiamento',inizio:'inizio',azione:'azione'}},
 D15:{action:'SUPPORT',required:['supporto','carico'],optional:['obiettivo'],questionMap:{supporto:'supporto',carico:'carico',obiettivo:'obiettivo'}}
};
const Q={
 zona:{label:'In quale zona vi serve aiuto?',options:['Nella nostra zona','Possiamo usare anche l’online','Solo online','Non abbiamo preferenze']},
 tipo:{label:'Che tipo di professionista o servizio cercate?',options:['Logopedista','Neuropsichiatra infantile','Psicologo','Educatore','Neuropsicomotricista','Centro/struttura','Altro']},
 zona_or_online:{label:'Dove dovrebbe essere il servizio?',options:['Nella nostra zona','Possiamo usare anche l’online','Solo online','Non abbiamo preferenze']},
 setting:{label:'Preferite un servizio pubblico o privato?',options:['Pubblico','Privato','Entrambi','Non abbiamo preferenze']},
 priorita:{label:'Quanto contano i tempi di attesa?',options:['Molto','Abbastanza','Poco','Non è una priorità']},
 fase:{label:'In quale punto del percorso vi trovate?',options:['Diagnosi/valutazione recente','Percorso già iniziato','Scuola/transizione','Non lo so ancora']},
 risorsa:{label:'Avete già un professionista o servizio che vi segue?',options:['Sì','No','Non lo so']},
 blocco:{label:'Che cosa vi manca soprattutto in questo momento?',options:['Capire da dove partire','Capire quali servizi possono servire','Capire cosa fare dopo la diagnosi','Non lo sappiamo ancora']},
 direzione:{label:'Su cosa volete aiuto adesso?',options:['Capire quali passi fare dopo la diagnosi','Trovare un professionista o un servizio','Capire scuola e servizi','Capire diritti e sostegni','Non lo sappiamo ancora']},
 oggetto:{label:'Che cosa volete confrontare o verificare?',options:['Diagnosi/valutazione','Professionisti','Centri/strutture','Terapie/interventi','Percorsi','Altro']},
 criterio:{label:'Qual è il criterio più importante per voi?',options:['Qualità/esperienza','Distanza','Disponibilità','Costi','Approccio','Altro']},
 motivo:{label:'Perché state valutando un altro parere?',options:['Opinioni diverse','Dubbi sulla valutazione','Vogliamo maggiore chiarezza','Prima di decidere','Altro']},
 servizio:{label:'A quale servizio state cercando di accedere?',options:['Valutazione/diagnosi','Terapia/intervento','Professionista','Servizio pubblico','Altro']},
 ostacolo:{label:'Qual è il principale ostacolo?',options:['Lista d’attesa','Nessuna disponibilità','Non sappiamo come accedere','Percorso pubblico bloccato','Altro']},
 urgenza:{label:'Quanto è importante trovare una soluzione rapidamente?',options:['Molto','Abbastanza','Non è urgente','Non lo so']},
 tema:{label:'Su quale argomento vi serve aiuto?',options:['Autismo/neurodivergenze','Diagnosi/valutazioni','Terapie/interventi','Vita quotidiana','Diritti/servizi','Altro']},
 uso:{label:'A cosa vi serve soprattutto questa informazione?',options:['Capire una situazione','Prendere una decisione','Parlare con un professionista','Confrontare informazioni']},
 problema:{label:'Qual è il problema principale?',options:['Informazioni contraddittorie','Mancanza di informazioni','Difficoltà di comunicazione','Organizzazione','Altro']},
 bisogno:{label:'Cosa vi serve soprattutto?',options:['Capire quali interventi esistono','Valutare un intervento','Confrontare interventi','Capire se funziona','Trovare un professionista']},
 area:{label:'Su quale area riguarda soprattutto?',options:['Comunicazione/linguaggio','Comportamento','Autonomia','Alimentazione','Sonno','Altro']},
 percorso:{label:'Avete già un percorso attivo?',options:['Sì','No','Non lo so']},
 aiuto:{label:'Che tipo di aiuto vi servirebbe adesso?',options:['Strategie pratiche','Informazioni','Un professionista','Capire da dove partire','Altro']},
 frequenza:{label:'Quanto spesso succede?',options:['Ogni giorno','Diverse volte a settimana','Ogni tanto','È appena iniziato']},
 attori:{label:'Chi dovrebbe collaborare?',options:['Famiglia e terapisti','Terapisti e scuola','Più professionisti','Famiglia, scuola e servizi','Altro']},
 obiettivo:{label:'Cosa vorreste ottenere adesso?',options:['Un piano condiviso','Una scelta più sicura','Ridurre il carico','Capire cosa fare','Altro']},
 carico:{label:'Quanto pesa questa situazione sulla famiglia?',options:['Poco','Abbastanza','Molto','È difficile da sostenere']},
 stato:{label:'A che punto siete con la pratica?',options:['Devo ancora iniziare','Ho iniziato','È bloccata','Ho ricevuto un esito da chiarire']},
 spesa:{label:'Quale spesa pesa soprattutto?',options:['Terapie/interventi','Professionisti/visite','Trasporti','Scuola/servizi','Più spese insieme','Altro']},
 impatto:{label:'Quanto pesa economicamente?',options:['Gestibile','Comincia a pesare','Difficile da sostenere','Non riusciamo più a sostenerla']},
 cambiamento:{label:'Che cosa è cambiato?',options:['Comportamento','Sonno','Alimentazione','Scuola','Autonomia','Altro']},
 inizio:{label:'Da quanto tempo lo notate?',options:['Da pochi giorni','Da alcune settimane','Da alcuni mesi','Non lo so']},
 azione:{label:'Cosa avete già fatto?',options:['Nulla','Ne abbiamo parlato con qualcuno','Abbiamo fatto una valutazione','Abbiamo provato a gestirlo a casa']},
 supporto:{label:'Che tipo di supporto vi servirebbe?',options:['Confronto/ascolto','Aiuto pratico','Supporto psicologico','Aiuto nell’organizzazione','Orientamento sul percorso','Altro']}
};
function filled(profile,slot){if(slot==='zona_or_online'){const local=profile?.values?.zona;return !!profile?.filled?.online || (!!profile?.filled?.zona && local!=='Nella nostra zona');}return !!profile?.filled?.[slot];}
function missing(domain,profile){const r=RULES[domain]||RULES.D01; return r.required.filter(s=>!filled(profile,s));}
function nextQuestion(domain,profile){const r=RULES[domain]||RULES.D01; if(domain==='D02' && profile?.values?.zona==='Nella nostra zona' && !profile?.filled?.localita) return {slot:'localita',label:'In quale città o provincia vi serve il servizio?',placeholder:'Es. Lecce, provincia di Bari',input:true}; for(const s of r.required){if(!filled(profile,s)){const key=r.questionMap[s]||s; if(Q[key])return {slot:s,...Q[key]};}} return null;}
function decide(domain,profile){const m=missing(domain,profile); const q=nextQuestion(domain,profile); const ready=m.length===0; const action=(RULES[domain]||RULES.D01).action; return {version:'0.2',domain,action,ready,missing:m,next_question:q,primary_action:ready?action:null,reason:ready?'Profilo sufficiente per il passo operativo':'Manca almeno un’informazione necessaria'};}
function advance(domain,profile,answer){const p=JSON.parse(JSON.stringify(profile||{filled:{},values:{}})); p.filled=p.filled||{};p.values=p.values||{}; if(answer&&answer.slot){const slot=answer.slot==='zona_or_online'?(answer.value==='Solo online'?'online':'zona'):answer.slot; p.filled[slot]=true;p.values[slot]=answer.value;} return decide(domain,p);}
function actionCard(domain,profile){const d=decide(domain,profile); if(domain==='D01' && d.ready && !d.next_question){d.next_question=Q.direzione; d.ready=false; d.primary_action=null; d.missing=['direzione']; d.reason='Per l’orientamento serve ancora capire quale direzione è più utile alla famiglia.';} const titles={MATCH:'Possiamo cercare ciò che vi serve',COMPARE:'Possiamo aiutarvi a confrontare le opzioni',ACCESS:'Possiamo aiutarvi a capire come accedere',ORIENT:'Possiamo definire il prossimo passo',INFO:'Possiamo cercare informazioni affidabili',COORDINATE:'Possiamo aiutarvi a coordinare il percorso',ORGANIZE:'Possiamo aiutarvi a organizzare il percorso',SUPPORT:'Possiamo individuare un supporto utile',PREPARE:'Possiamo prepararvi al prossimo passaggio'}; return {action:d.action,title:titles[d.action],ready:d.ready,missing:d.missing,next_question:d.next_question};}
window.AtlasNextStepEngineV02={RULES,Q,missing,nextQuestion,decide,advance,actionCard};
})();
