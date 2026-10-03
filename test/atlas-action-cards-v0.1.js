/* Atlas Action Cards v0.1 — user-facing rendering layer. */
(function(){'use strict';
const COPY={
 MATCH:{title:'Possiamo cercare ciò che vi serve',button:'Trova professionisti o servizi',body:'Abbiamo raccolto abbastanza informazioni per impostare una ricerca compatibile con quello che avete indicato.'},
 COMPARE:{title:'Possiamo aiutarvi a confrontare le opzioni',button:'Confronta le opzioni',body:'Il punto principale è scegliere tra possibilità diverse. Possiamo organizzare il confronto usando i criteri che contano per voi.'},
 ACCESS:{title:'Possiamo aiutarvi a capire come accedere',button:'Capisci il percorso di accesso',body:'Il problema principale riguarda l’accesso, la disponibilità o i tempi. Possiamo ricostruire il percorso e individuare dove si trova il blocco.'},
 ORIENT:{title:'Possiamo definire il prossimo passo',button:'Continua l’orientamento',body:'Avete già chiarito il punto principale. Ora possiamo trasformarlo in un prossimo passo concreto, senza saltare direttamente a una soluzione.'},
 INFO:{title:'Possiamo cercare informazioni affidabili',button:'Trova informazioni',body:'Prima di scegliere o agire serve chiarire un’informazione. Possiamo circoscrivere ciò che manca e cercare risorse pertinenti.'},
 COORDINATE:{title:'Possiamo aiutarvi a coordinare il percorso',button:'Organizza il coordinamento',body:'Il problema riguarda il collegamento tra le persone coinvolte. Possiamo chiarire chi deve comunicare con chi e quali informazioni condividere.'},
 ORGANIZE:{title:'Possiamo aiutarvi a organizzare il percorso',button:'Organizza il percorso',body:'Il carico organizzativo è diventato un problema. Possiamo individuare cosa pesa di più e costruire un modo più semplice per gestirlo.'},
 SUPPORT:{title:'Possiamo individuare un supporto utile',button:'Trova supporto',body:'Il bisogno riguarda anche la sostenibilità della famiglia. Possiamo concentrarci su un aiuto concreto e compatibile con la situazione descritta.'},
 PREPARE:{title:'Possiamo prepararvi al prossimo passaggio',button:'Prepara il prossimo passo',body:'Abbiamo individuato una pratica o un percorso da chiarire. Possiamo organizzare le informazioni necessarie prima di procedere.'}
};
function build(result,summary){const c=COPY[result.action]||COPY.ORIENT;return {action:result.action,title:c.title,body:c.body,button:c.button,summary:summary||'',ready:!!result.ready,missing:result.missing||[],next_question:result.next_question||null};}
window.AtlasActionCardsV01={COPY,build};
})();
