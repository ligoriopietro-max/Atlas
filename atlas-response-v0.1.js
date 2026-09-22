/* Atlas — Family-facing Response Layer v0.1
 * Converts engine output into plain-language guidance.
 * Does not expose domain codes, scores, or engine internals.
 */
(function(){
  'use strict';
  const COPY={
    D01:{summary:'capire da dove partire e individuare il prossimo passo',next:'mettere a fuoco la situazione e definire il prossimo passo utile'},
    D02:{summary:'trovare professionisti, centri o servizi pertinenti',next:'cercare le opzioni compatibili con le vostre esigenze e con i vincoli indicati'},
    D03:{summary:'confrontare possibilità e scegliere tra opzioni',next:'mettere a confronto le alternative prima di scegliere'},
    D04:{summary:'chiarire un dubbio diagnostico o valutare un secondo parere',next:'raccogliere gli elementi utili per chiarire il dubbio e capire se serve un altro parere'},
    D05:{summary:'affrontare accesso, disponibilità o tempi di attesa',next:'verificare accesso, disponibilità e possibili alternative ai tempi di attesa'},
    D06:{summary:'ottenere informazioni chiare e comprensibili',next:'chiarire le informazioni mancanti con una spiegazione semplice e mirata'},
    D07:{summary:'valutare o organizzare un intervento o un percorso terapeutico',next:'capire quale parte del percorso terapeutico va valutata o organizzata'},
    D08:{summary:'gestire una difficoltà concreta della vita quotidiana',next:'partire dalla difficoltà concreta e individuare soluzioni pratiche'},
    D09:{summary:'migliorare il coordinamento tra le persone coinvolte',next:'mettere in ordine chi fa cosa e quali informazioni devono essere condivise'},
    D10:{summary:'rendere più sostenibile l’organizzazione del percorso',next:'semplificare appuntamenti, orari e gestione del percorso'},
    D11:{summary:'affrontare una questione legata alla scuola',next:'mettere a fuoco il problema scolastico e i supporti disponibili'},
    D12:{summary:'orientarsi tra diritti, prestazioni e procedure',next:'identificare il servizio, beneficio o procedimento da attivare'},
    D13:{summary:'capire e gestire i costi del percorso',next:'mettere a fuoco costi, spese e sostenibilità economica'},
    D14:{summary:'affrontare una nuova difficoltà o un cambiamento nel percorso',next:'capire cosa è cambiato e quale parte del percorso va rivalutata'},
    D15:{summary:'sostenere la famiglia nel mantenere il percorso nel tempo',next:'ridurre il carico sulla famiglia e individuare quali forme di supporto possono essere attivate'}
  };
  function constraints(c){
    const out=[]; if(c&&c.comune) out.push('zona '+c.comune); if(c&&c.provincia) out.push(c.provincia); if(c&&c.distance) out.push('entro '+c.distance+' km'); if(c&&c.online) out.push('anche online'); return out;
  }
  function buildResponse(profile){
    const p=profile||{}; const c=p.constraints||{}; const copy=COPY[p.primary_domain]||{summary:'capire meglio la situazione e individuare il prossimo passo',next:'raccogliere le informazioni essenziali e definire il prossimo passo'};
    const low=p.confidence==='LOW';
    return {summary:copy.summary,nextStep:copy.next,help:'Possiamo trasformare questa esigenza in un percorso più chiaro, usando le informazioni già disponibili e concentrandoci sul passo più utile adesso.',constraints:constraints(c),note:low?'Per essere più precisi, potrebbe essere utile raccogliere qualche informazione in più.':'',disclaimer:'Informazioni di orientamento: non sostituiscono valutazioni cliniche, diagnostiche o professionali.'};
  }
  window.AtlasResponse={buildResponse};
})();
