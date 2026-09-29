/* Atlas Orientation Flow v0.3 — progressive disclosure, local-only
 * Does not modify the classifier/engine. Converts the primary domain into a
 * short set of follow-up questions and a provisional next-step profile.
 */
(function(){'use strict';
const FLOWS={
 D01:{title:'Capire da dove partire',intro:'Prima di indicarti un percorso, aiutaci a capire in che punto siete.',qs:[
  ['fase','In che punto siete?',['Stiamo cercando di capire cosa sta succedendo','Abbiamo già una diagnosi/valutazione','Abbiamo già iniziato un percorso','Non so quale sia il prossimo passo']],
  ['fatto','Cosa avete già fatto?',['Nulla o quasi','Abbiamo parlato con un medico/professionista','Abbiamo fatto una valutazione','Abbiamo già provato un percorso']],
  ['blocco','Cosa vi blocca soprattutto adesso?',['Non so a chi rivolgermi','Non so quale percorso scegliere','Non capisco le informazioni ricevute','Non so come proseguire']]
 ]},
 D02:{title:'Trovare professionisti o servizi',intro:'Per passare dalla ricerca generica a una ricerca utile, ci servono solo alcune informazioni.',qs:[
  ['tipo','Che tipo di aiuto state cercando?',['Medico/specialista','Logopedista','Terapista','Psicologo/educatore','Centro/struttura','Non lo so']],
  ['zona','Dove vi serve?',['Nel mio comune','Nella mia provincia','Anche fuori provincia','Online','Non lo so']],
  ['priorita','Cosa conta di più?',['Trovare qualcuno disponibile','Esperienza specifica','Vicino a casa','Costi/convenzioni','Confrontare più possibilità','Non lo so']]
 ]},
 D03:{title:'Confrontare e scegliere tra le opzioni',intro:'Qui il problema non è soltanto trovare un servizio: è capire quale opzione scegliere.',qs:[
  ['oggetto','Cosa dovete scegliere?',['Tra professionisti','Tra centri/strutture','Tra terapie/interventi','Tra percorsi diversi','Altro']],
  ['criterio','Cosa vi rende più difficile scegliere?',['Non so quali differenze contano','Informazioni contrastanti','Costi','Distanza/disponibilità','Esperienze diverse','Altro']],
  ['obiettivo','Cosa vorreste ottenere dal confronto?',['Una scelta più sicura','Capire pro e contro','Capire quale opzione è più adatta','Ridurre i dubbi']]
 ]},
 D04:{title:'Valutare un secondo parere',intro:'Per capire come orientare la richiesta di un secondo parere, distinguiamo cosa volete verificare.',qs:[
  ['oggetto','Su cosa volete un secondo parere?',['Diagnosi','Valutazione/assessment','Livello o profilo','Percorso già proposto','Altro']],
  ['motivo','Perché state valutando un altro parere?',['Non condividiamo la valutazione','Abbiamo ricevuto opinioni diverse','Vogliamo maggiore chiarezza','Vogliamo verificare prima di decidere','Altro']],
  ['obiettivo','Cosa vorreste chiarire?',['Se la valutazione è corretta','Quale percorso seguire','Cosa significa la valutazione','Quali possibilità abbiamo']]
 ]},
 D05:{title:'Capire accesso, tempi o disponibilità',intro:'Qui il problema principale è riuscire ad accedere a ciò che serve.',qs:[
  ['servizio','A cosa state cercando di accedere?',['Valutazione/diagnosi','Terapia/intervento','Professionista','Servizio pubblico','Altro']],
  ['ostacolo','Qual è l’ostacolo principale?',['Lista d’attesa','Nessuna disponibilità','Non sappiamo come accedere','Percorso pubblico bloccato','Altro']],
  ['urgenza','Quanto è importante trovare una soluzione in tempi brevi?',['Molto','Abbastanza','Non è urgente','Non lo so']]
 ]},
 D06:{title:'Trovare informazioni affidabili',intro:'Prima identifichiamo esattamente quale informazione vi manca.',qs:[
  ['tema','Su cosa vi servono informazioni?',['Autismo/neurodivergenze','Valutazioni o diagnosi','Terapie/interventi','Comportamento o vita quotidiana','Diritti/servizi','Altro']],
  ['uso','A cosa vi serve quell’informazione?',['Capire una situazione','Prendere una decisione','Parlare con un professionista','Confrontare informazioni che avete già']],
  ['problema','Cosa vi preoccupa delle informazioni che avete trovato?',['Sono contraddittorie','Non so quali fonti siano affidabili','Sono troppo tecniche','Non trovo quello che cerco','Altro']]
 ]},
 D07:{title:'Orientarsi tra terapie e interventi',intro:'Prima di parlare di un intervento specifico, capiamo qual è la decisione da prendere.',qs:[
  ['bisogno','Cosa vi serve soprattutto?',['Capire quali interventi esistono','Valutare un intervento già proposto','Confrontare due interventi','Capire se il percorso sta funzionando','Trovare un professionista per l’intervento']],
  ['area','Su quale area riguarda soprattutto?',['Comunicazione/linguaggio','Comportamento','Autonomia','Alimentazione','Sonno','Altro']],
  ['percorso','Avete già un percorso attivo?',['Sì','No','Non lo so']]
 ]},
 D08:{title:'Gestire una difficoltà della vita quotidiana',intro:'Concentriamoci sulla difficoltà concreta che sta creando problemi nella vita di tutti i giorni.',qs:[
  ['area','Quale difficoltà pesa di più?',['Sonno','Alimentazione','Comunicazione','Igiene/autonomia','Comportamento/crisi','Altro']],
  ['frequenza','Quanto spesso succede?',['Ogni giorno','Diverse volte a settimana','Ogni tanto','È appena iniziato']],
  ['aiuto','Cosa vi servirebbe adesso?',['Strategie pratiche','Capire la causa','Un professionista','Capire da dove partire']]
 ]},
 D09:{title:'Coordinare le persone coinvolte nel percorso',intro:'Cerchiamo di capire dove si rompe il collegamento tra le persone che seguono il percorso.',qs:[
  ['attori','Chi dovrebbe collaborare?',['Famiglia e terapisti','Terapisti e scuola','Più professionisti','Famiglia, scuola e servizi','Altro']],
  ['problema','Cosa non funziona?',['Non si parlano','Ognuno segue un piano diverso','Dobbiamo ripetere tutto ogni volta','Mancano informazioni condivise','Altro']],
  ['obiettivo','Cosa vorreste ottenere?',['Un piano condiviso','Migliore comunicazione','Meno frammentazione','Chiarire chi deve fare cosa']]
 ]},
 D10:{title:'Organizzare meglio la vita familiare e gli appuntamenti',intro:'Qui il problema principale è organizzativo. Individuiamo cosa sta creando più carico.',qs:[
  ['problema','Cosa è più difficile da organizzare?',['Appuntamenti','Terapie','Scuola e attività','Trasporti/spostamenti','Routine familiare','Altro']],
  ['carico','Quanto incide sulla famiglia?',['Poco','Abbastanza','Molto','Ci sta diventando difficile da sostenere']],
  ['obiettivo','Cosa vi aiuterebbe di più?',['Avere tutto organizzato','Ridurre sovrapposizioni','Condividere le informazioni','Ricordare scadenze e appuntamenti']]
 ]},
 D11:{title:'Affrontare scuola o una transizione',intro:'Definiamo quale passaggio scolastico o educativo richiede orientamento.',qs:[
  ['fase','Di quale situazione si tratta?',['Scuola attuale','Cambio di scuola','Passaggio di ciclo','Scuola superiore','Esame/transizione','Altro']],
  ['problema','Qual è la difficoltà principale?',['Inclusione/supporto','Apprendimento','Comunicazione con la scuola','Scelta della scuola','Passaggio/transizione','Altro']],
  ['aiuto','Cosa vi serve?',['Informazioni','Confrontare possibilità','Trovare un professionista','Capire quali passi fare']]
 ]},
 D12:{title:'Orientarsi tra diritti, pratiche e servizi pubblici',intro:'Identifichiamo la pratica o il servizio pubblico che vi sta creando difficoltà.',qs:[
  ['tema','Di cosa vi state occupando?',['Invalidità/104','Indennità o benefici','ASL/servizi sanitari','Scuola/servizi educativi','Contributi/voucher','Altro']],
  ['stato','A che punto siete?',['Devo ancora capire la procedura','Ho iniziato la procedura','La procedura è bloccata','Ho ricevuto un rifiuto/esito che non capisco','Altro']],
  ['obiettivo','Cosa vi serve soprattutto?',['Capire cosa fare','Capire quali documenti servono','Capire a chi rivolgermi','Capire come contestare/chiarire un esito']]
 ]},
 D13:{title:'Affrontare costi e sostenibilità economica',intro:'Qui il problema principale è la sostenibilità economica del percorso.',qs:[
  ['spesa','Quale spesa pesa soprattutto?',['Terapie/interventi','Professionisti/visite','Trasporti','Scuola/servizi','Più spese insieme','Altro']],
  ['impatto','Quanto pesa sulla famiglia?',['Gestibile','Comincia a pesare','Difficile da sostenere','Non riusciamo più a sostenerla']],
  ['obiettivo','Cosa cercate?',['Ridurre i costi','Capire agevolazioni/contributi','Trovare alternative sostenibili','Capire da dove partire']]
 ]},
 D14:{title:'Gestire una nuova difficoltà o un cambiamento',intro:'Prima capiamo cosa è cambiato e quanto è recente.',qs:[
  ['cambiamento','Che cosa è cambiato?',['Comportamento','Sonno','Alimentazione','Scuola','Autonomia','Altro']],
  ['inizio','Da quanto tempo lo notate?',['Da pochi giorni','Da alcune settimane','Da alcuni mesi','Non lo so']],
  ['azione','Cosa avete già fatto?',['Nulla','Ne abbiamo parlato con qualcuno','Abbiamo già fatto una valutazione','Abbiamo provato a gestirlo a casa']]
 ]},
 D15:{title:'Trovare supporto per la famiglia',intro:'Qui partiamo dal carico della famiglia, non soltanto da quello del bambino.',qs:[
  ['supporto','Che tipo di supporto vi servirebbe?',['Confronto/ascolto','Aiuto pratico','Supporto psicologico','Aiuto nell’organizzazione','Orientamento sul percorso','Altro']],
  ['carico','Cosa pesa maggiormente?',['Stanchezza','Gestione quotidiana','Lavoro e famiglia','Senso di essere soli','Coordinamento del percorso','Altro']],
  ['obiettivo','Cosa vorreste ottenere adesso?',['Sentirmi meno solo/a','Trovare un aiuto concreto','Capire come sostenere la famiglia','Riorganizzare il percorso']]
 ]}
};
const LABEL={D01:'capire da dove partire',D02:'trovare professionisti o servizi',D03:'confrontare e scegliere tra le opzioni',D04:'valutare un secondo parere',D05:'capire come accedere e affrontare i tempi di attesa',D06:'trovare informazioni affidabili',D07:'orientarsi tra terapie e interventi',D08:'gestire una difficoltà della vita quotidiana',D09:'coordinare le persone coinvolte nel percorso',D10:'organizzare meglio la vita familiare e gli appuntamenti',D11:'affrontare scuola o una transizione',D12:'orientarsi tra diritti, pratiche e servizi pubblici',D13:'affrontare costi e sostenibilità economica',D14:'gestire una nuova difficoltà o un cambiamento',D15:'trovare supporto per la famiglia'};
function get(domain){return FLOWS[domain]||FLOWS.D01;}
function build(domain,answers){
 const f=get(domain), a=answers||{};
 let next='';
 switch(domain){
  case 'D02': next=a.tipo==='Non lo so'?'chiarire quale tipo di professionista serve':`definire una ricerca di ${a.tipo.toLowerCase()}`; break;
  case 'D03': next='mettere a confronto le opzioni secondo il criterio che per voi conta di più'; break;
  case 'D04': next='chiarire cosa volete verificare con un secondo parere e quali aspetti confrontare'; break;
  case 'D05': next='ricostruire il percorso di accesso e individuare dove si trova il blocco'; break;
  case 'D06': next='circoscrivere l’informazione mancante e distinguere fonti affidabili da informazioni contrastanti'; break;
  case 'D07': next='chiarire quale decisione terapeutica dovete prendere prima di cercare una soluzione'; break;
  case 'D08': next='definire la difficoltà quotidiana e il tipo di aiuto pratico necessario'; break;
  case 'D09': next='mappare chi deve comunicare con chi e quale informazione manca'; break;
  case 'D10': next='individuare il principale punto di carico organizzativo e come alleggerirlo'; break;
  case 'D11': next='definire il passaggio scolastico e il tipo di supporto necessario'; break;
  case 'D12': next='ricostruire la pratica, lo stato della procedura e il prossimo interlocutore utile'; break;
  case 'D13': next='capire quale spesa pesa di più e quali alternative o sostegni cercare'; break;
  case 'D14': next='definire il cambiamento, da quanto dura e quale valutazione può essere necessaria'; break;
  case 'D15': next='individuare il tipo di sostegno che può alleggerire concretamente il carico familiare'; break;
  default: next='chiarire il punto in cui siete e ciò che vi manca per proseguire';
 }
 return {domain,title:f.title,answers:a,next_step:next};
}
window.AtlasOrientationFlowV03={get,build,labels:LABEL};
})();
