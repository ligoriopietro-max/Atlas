const fs=require('fs'),vm=require('vm'),assert=require('assert');const c={console};c.window=c;vm.createContext(c);
const files=['data.js','engine.js','v018.js','v019.js','v027.js','v028.js','adapter.js','reconciler.js','atlas-safety-gate-v0.1.js','atlas-orientation-flow-v0.3.js','atlas-free-text-profile-v0.3.js','atlas-free-text-public-v0.3.js'];for(const f of files)vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c,{filename:f});
const cases=[];const add=(domain,text,filled=[],remaining=null)=>cases.push({domain,text,filled,remaining});
// D01
add('D01','Non so da dove partire dopo la diagnosi',['oggetto'],['fase','fatto','blocco']);
add('D01','Abbiamo già una diagnosi ma non sappiamo quale sia il prossimo passo',['oggetto'],['fase','fatto','blocco']);
add('D01','Abbiamo parlato con il neuropsichiatra e ora non capiamo come proseguire',['fatto'],['fase','blocco']);
add('D01','Abbiamo già iniziato un percorso ma non sappiamo come andare avanti',['fatto'],['fase','blocco']);
add('D01','Non capisco le informazioni che ci hanno dato sulla valutazione',['oggetto'],['fase','fatto','blocco']);
add('D01','La diagnosi c’è, il problema è capire quale strada seguire',['oggetto'],['fase','fatto','blocco']);
// D02
add('D02','Cerco logopedista',['tipo'],['zona','priorita']);add('D02','Cerco un logopedista a Napoli',['tipo','zona'],['priorita']);
add('D02','Mi serve un NPI a Lecce perché non voglio aspettare sei mesi',['tipo','zona','priorita'],[]);
add('D02','Vorrei un centro privato a Bari, anche online',['tipo','zona','online','setting'],['priorita']);
add('D02','Abbiamo bisogno di un neuropsicomotricista a Milano presto',['tipo','zona','priorita'],['setting']);
add('D02','Cerco un terapista a Milano, anche online',['tipo','zona','online'],['priorita']);
add('D02','Sto cercando un educatore nella provincia di Bari disponibile rapidamente',['tipo','zona','priorita'],['setting']);
add('D02','Ci serve uno psicologo privato a distanza',['tipo','online','setting'],['zona','priorita']);
// D03
add('D03','Non so quale dei due centri scegliere',['oggetto','criterio','obiettivo'],[]);
add('D03','Confrontiamo due logopedisti e vogliamo capire quale scegliere',['oggetto','criterio','obiettivo'],['oggetto']);
add('D03','Siamo indecisi tra due terapie per il linguaggio',['oggetto','criterio','obiettivo'],[]);
add('D03','Quale centro è meglio? Uno costa meno',['oggetto','criterio','obiettivo'],[]);
add('D03','Devo scegliere tra due professionisti e mi interessa soprattutto la disponibilità',['oggetto','criterio','obiettivo'],[]);
add('D03','Vorrei confrontare due percorsi perché ho ricevuto informazioni diverse',['oggetto','criterio','obiettivo'],[]);
add('D03','Non so quale terapia scegliere e vorrei capire pro e contro',['oggetto','criterio','obiettivo'],[]);
// D04
add('D04','Voglio un secondo parere sulla diagnosi',['oggetto','motivo'],['obiettivo']);
add('D04','Abbiamo ricevuto due valutazioni diverse e vogliamo capire quale sia corretta',['oggetto','motivo','obiettivo'],[]);
add('D04','Non condividiamo la diagnosi e vogliamo un altro parere',['oggetto','motivo'],['obiettivo']);
add('D04','Vorrei una seconda opinione sul percorso proposto',['oggetto','motivo'],['obiettivo']);
add('D04','Abbiamo dubbi sulla valutazione e vogliamo maggiore chiarezza',['oggetto','motivo'],['obiettivo']);
add('D04','Voglio verificare se la valutazione è corretta',['oggetto','motivo','obiettivo'],[]);
// D05
add('D05','Non riesco ad accedere al servizio e sono in lista di attesa',['ostacolo'],['urgenza']);
add('D05','Siamo in lista d’attesa da sei mesi',['ostacolo'],['urgenza']);
add('D05','Non c’è disponibilità e ci serve una soluzione presto',['ostacolo','urgenza'],[]);
add('D05','Come posso accedere al servizio ASL?',['ostacolo'],['urgenza']);
add('D05','Il percorso pubblico è bloccato e vorrei capire come sbloccarlo',['ostacolo'],['urgenza']);
add('D05','Aspettiamo da mesi, è urgente',['ostacolo','urgenza'],[]);
// D06
add('D06','Cerco informazioni affidabili sulle terapie',['uso'],['tema','problema']);
add('D06','Non so quali fonti siano affidabili sulla diagnosi',['uso','problema'],['tema']);
add('D06','Le informazioni che trovo sono contraddittorie',['uso','problema'],['tema']);
add('D06','Vorrei capire cosa significa questa valutazione',['uso'],['tema','problema']);
add('D06','Mi servono spiegazioni per prendere una decisione',['uso'],['tema','problema']);
add('D06','Voglio informazioni sui diritti e sui servizi',['uso','tema'],['problema']);
// D07
add('D07','Voglio capire quali interventi esistono per il linguaggio',['bisogno','area'],['percorso']);
add('D07','Stiamo già facendo logopedia ma non so se il percorso funziona',['bisogno','area','percorso'],[]);
add('D07','Confrontiamo due terapie per la comunicazione',['bisogno','area'],['percorso']);
add('D07','Cerco un professionista per un intervento sul comportamento',['bisogno','area'],['percorso']);
add('D07','Abbiamo iniziato una terapia per il sonno',['bisogno','area','percorso'],[]);
add('D07','Vorrei valutare un intervento per l’alimentazione',['bisogno','area'],['percorso']);
// D08
add('D08','Mio figlio ha problemi di sonno ogni giorno',['area','frequenza'],['aiuto']);
add('D08','La selettività alimentare succede ogni tanto',['area','frequenza'],['aiuto']);
add('D08','La difficoltà è appena iniziata e riguarda il comportamento',['area'],['frequenza','aiuto']);
add('D08','Ci servono strategie pratiche per il bagno',['area','aiuto'],['frequenza']);
add('D08','Il problema è la comunicazione quotidiana',['area'],['frequenza','aiuto']);
add('D08','Succede tutti i giorni e vorrei consigli pratici sul sonno',['area','frequenza','aiuto'],[]);
// D09
add('D09','I terapisti e la scuola non collaborano e dobbiamo ripetere tutto',['problema','obiettivo','attori'],[]);
add('D09','Famiglia e terapisti non hanno un piano condiviso',['problema','obiettivo','attori'],[]);
add('D09','Ogni professionista segue un piano diverso',['problema','obiettivo','attori'],[]);
add('D09','La scuola e i terapisti non si parlano',['problema','obiettivo','attori'],[]);
add('D09','Dobbiamo coordinare più professionisti',['problema','obiettivo','attori'],[]);
add('D09','Mancano informazioni condivise tra famiglia e terapisti',['problema','obiettivo','attori'],[]);
// D10
add('D10','Abbiamo troppi appuntamenti e non riusciamo a organizzarli',['problema'],['carico','obiettivo']);
add('D10','Il calendario delle terapie è impossibile da gestire',['problema'],['carico','obiettivo']);
add('D10','Siamo esausti per gli spostamenti e gli impegni',['carico'],['problema','obiettivo']);
add('D10','Scuola, terapie e attività si sovrappongono',['problema'],['carico','obiettivo']);
add('D10','Vorrei condividere meglio le informazioni sugli appuntamenti',['problema','obiettivo'],['carico']);
add('D10','Non riesco a ricordare scadenze e visite',['problema'],['carico','obiettivo']);
// D11
add('D11','Abbiamo problemi di inclusione a scuola',['fase','problema'],['aiuto']);
add('D11','Stiamo cambiando scuola e non so quali passi fare',['fase','aiuto'],['problema']);
add('D11','Mio figlio sta iniziando la scuola e vorrei informazioni',['fase','aiuto'],['problema']);
add('D11','Il problema è la comunicazione con gli insegnanti',['fase','problema'],['aiuto']);
add('D11','Stiamo affrontando un passaggio di ciclo',['fase'],['problema','aiuto']);
add('D11','Il PEI e il sostegno scolastico ci preoccupano',['fase','problema'],['aiuto']);
// D12
add('D12','Devo capire quali documenti servono per la 104',['tema','obiettivo'],['stato']);
add('D12','A chi devo rivolgermi per l’indennità?',['tema','obiettivo'],['stato']);
add('D12','La pratica INPS è bloccata',['tema'],['stato','obiettivo']);
add('D12','Vorrei capire la procedura per l’invalidità',['tema'],['stato','obiettivo']);
add('D12','Ho ricevuto un esito che non capisco sulla 104',['tema'],['stato','obiettivo']);
add('D12','Quali documenti servono per il contributo?',['tema','obiettivo'],['stato']);
// D13
add('D13','Le terapie costano troppo e non riusciamo più a sostenerle',['spesa','impatto'],['obiettivo']);
add('D13','Vorrei ridurre i costi delle visite private',['spesa'],['impatto','obiettivo']);
add('D13','La spesa per i professionisti pesa molto',['spesa'],['impatto','obiettivo']);
add('D13','Cerco contributi perché le terapie sono diventate insostenibili',['spesa','impatto'],['obiettivo']);
add('D13','Abbiamo troppe spese e non sappiamo come renderle sostenibili',['impatto'],['spesa','obiettivo']);
add('D13','Vorrei capire quali agevolazioni possono ridurre i costi',['obiettivo'],['spesa','impatto']);
// D14
add('D14','Da pochi giorni mio figlio ha nuove crisi',['cambiamento','inizio'],[]);
add('D14','Da alcune settimane dorme molto peggio',['cambiamento','inizio'],[]);
add('D14','Ultimamente è cambiato il comportamento',['cambiamento'],['inizio','azione']);
add('D14','È comparsa una nuova difficoltà con l’alimentazione',['cambiamento'],['inizio','azione']);
add('D14','Il cambiamento è iniziato da qualche settimana e riguarda il linguaggio',['cambiamento','inizio'],['azione']);
add('D14','Da poco è cambiata l’autonomia e non sappiamo cosa fare',['cambiamento'],['inizio','azione']);
// D15
add('D15','Sono completamente sfinita e ho bisogno di supporto',['carico','supporto'],['obiettivo']);
add('D15','Ci sentiamo soli e vorremmo un aiuto concreto',['carico','supporto'],['obiettivo']);
add('D15','La gestione quotidiana ci sta distruggendo',['carico'],['supporto','obiettivo']);
add('D15','Ho bisogno di supporto psicologico come genitore',['supporto'],['carico','obiettivo']);
add('D15','Siamo stanchi e vorremmo riorganizzare il percorso',['carico','obiettivo'],['supporto']);
add('D15','Mi sento sola e non so come sostenere la famiglia',['carico','obiettivo'],['supporto']);
// cross-domain adversarial / redundancy
add('D02','Abbiamo già una psicologa, ma cerchiamo un logopedista a Lecce perché il centro attuale è troppo lontano',['tipo','zona'],['priorita']);
add('D02','Non mi serve un medico, voglio informazioni affidabili',[],['tipo','zona','priorita']); // expected: no provider should be filled; corrected below
add('D02','Cerco un logopedista, ma non so se sia davvero il professionista giusto',[],['zona','priorita']); // should be conservative? This currently likely uncertain => fail intentionally
add('D02','Mi serve un medico a Roma, pubblico o privato, possibilmente subito',['tipo','zona','setting','priorita'],[]);
add('D02','Cerco un professionista online, senza spostarmi, e anche a Napoli se disponibile',['tipo','online','zona'],['priorita']);
add('D03','Abbiamo già scelto il centro, ma vogliamo confrontare i costi delle terapie',['criterio','obiettivo'],['oggetto']);
add('D04','Non voglio cambiare terapia: voglio un secondo parere sulla diagnosi',['oggetto','motivo'],['obiettivo']);
add('D08','Abbiamo già un terapista ma il problema quotidiano è il sonno',['area'],['frequenza','aiuto']);
add('D09','Abbiamo una psicologa e un logopedista, ma non si parlano tra loro',['problema','obiettivo'],['attori']);
add('D12','Ho già parlato con il patronato ma non so quali documenti servono per la 104',['tema','obiettivo'],['stato']);
add('D13','Abbiamo già trovato il centro, il problema sono i 700 euro al mese di terapia',['spesa','impatto'],['obiettivo']);
add('D15','Abbiamo già tutti i professionisti, ma io sono esausta e ho bisogno di aiuto',['carico','supporto'],['obiettivo']);

let pass=0,fail=0,details=[];
for(const x of cases){const p=c.AtlasFreeTextProfileV01.extract(x.text,x.domain);let ok=true;const missing=[];for(const slot of x.filled){if(!p.filled[slot]){ok=false;missing.push(slot)}}const qs=c.AtlasFreeTextProfileV01.filterFlow(c.AtlasOrientationFlowV03.get(x.domain),p).qs.map(q=>q[0]);for(const slot of x.filled){if(qs.includes(slot)){ok=false;missing.push('REDUNDANT:'+slot)}}if(ok)pass++;else{fail++;if(details.length<30)details.push({text:x.text,domain:x.domain,expectedFilled:x.filled,actualFilled:Object.keys(p.filled),values:p.values,remaining:qs,missing})}}
console.log(JSON.stringify({total:cases.length,passed:pass,failed:fail,pass_rate:pass/cases.length,details},null,2));
