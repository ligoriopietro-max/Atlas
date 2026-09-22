/* Atlas — Questionnaire → Engine Normalizer v0.1.5
 * Interface layer only. Engine v0.2.6 unchanged.
 */
(function(){
  'use strict';
  function trim(v){return String(v==null?'':v).trim();}
  function arr(v){return Array.isArray(v)?v.filter(Boolean):(v==null||v===''?[]:[v]);}
  function mapPhase(v){
    const x=trim(v).toLowerCase();
    const m={
      'sto ancora cercando di capire cosa sta succedendo':'dubbi',
      'abbiamo appena ricevuto una diagnosi/valutazione':'post_diagnosi',
      'abbiamo appena ricevuto una diagnosi':'post_diagnosi',
      'abbiamo già iniziato un percorso':'percorso_avviato',
      'abbiamo gia iniziato un percorso':'percorso_avviato',
      'è comparso un problema nuovo o qualcosa è cambiato':'nuove_difficolta',
      'e comparso un problema nuovo o qualcosa e cambiato':'nuove_difficolta'
    };
    return m[x]||trim(v);
  }
  function mapNeed(v){
    const x=trim(v).toLowerCase();
    const m={
      'capire situazione':'non so il prossimo passo',
      'capire da dove partire / prossimo passo':'non so il prossimo passo',
      'capire meglio informazioni e situazione':'informazioni',
      'capire la situazione':'non so il prossimo passo',
      'capire meglio la situazione':'non so il prossimo passo',
      'trovare professionista/centro':'professionisti',
      'trovare un professionista/centro':'professionisti',
      'trovare professionisti/centri/servizi':'professionisti',
      'scegliere tra due possibilità':'quale scegliere',
      'scegliere tra possibilità':'quale scegliere',
      'capire diagnosi/altro parere':'seconda opinione',
      'accedere a un servizio/ridurre attesa':'lista d\'attesa',
      'accesso ai servizi/ridurre attesa':'lista d\'attesa',
      'capire informazioni':'informazioni',
      'capire una terapia/intervento':'informazioni',
      'capire terapia/intervento':'informazioni',
      'valutare se una terapia/intervento sta funzionando':'valutazione efficacia terapia',
      'valutare se una terapia/intervento sta funzionando':'valutazione efficacia terapia',
      'capire terapia/intervento':'informazioni',
      'valutare se una terapia/intervento sta funzionando':'valutazione efficacia terapia',
      'valutare se una terapia/intervento sta funzionando':'valutazione efficacia terapia',
      'valutare terapia/intervento':'valutazione efficacia terapia',
      'gestire difficoltà quotidiane':'quotidianità',
      'gestire difficoltà quotidiana':'quotidianità',
      'gestire la vita quotidiana':'quotidianità',
      'organizzare appuntamenti/percorso':'calendario',
      'coordinare le persone coinvolte':'coordinamento',
      'scuola/servizi scolastici':'scuola',
      'scuola/servizi':'scuola',
      'diritti/benefici/pratiche':'diritti',
      'costi/spese':'costi',
      'nuova difficoltà/cambiamento':'nuova difficoltà',
      'sostenere la famiglia':'supporto famiglia'
    };
    return m[x]||trim(v);
  }
  function mapResources(v){
    const m={
      'NPI/medico/specialista':'NPI', 'NPI/medico':'NPI', 'professionista':'professionista',
      'psicologo/speech therapist/therapist':'terapista', 'psicologa/logopedista/terapista':'terapista',
      'centro/struttura':'centro', 'scuola':'scuola', 'pubblici servizi/ASL':'ASL', 'servizi pubblici/ASL':'ASL', 'pubblici servizi':'ASL',
      'altre risorse':'altre risorse', 'nulla al momento':'none', 'nessuna risorsa':'none'
    };
    return arr(v).map(x=>m[trim(x)]||trim(x));
  }
  function mapGap(v){
    const m={
      'info/chiarezza':'informazione', 'informazioni/chierezza':'informazione', 'informazione/chiarezza':'informazione',
      'professionista/struttura':'professionisti', 'terapia/intervento':'terapie',
      'accesso al servizio':'servizi', 'scuola/supporto scolastico':'scuola',
      'diritti/benefici/pratiche':'diritti', 'organizzazione quotidiana':'quotidiana',
      'coordinamento':'coordinamento', 'supporto familiare':'supporto familiare'
    };
    return arr(v).map(x=>m[trim(x)]||trim(x));
  }
  function mapBarrier(v){
    const m={
      'non so chi contattare':'non so chi contattare', 'non so quale scegliere':'non so come scegliere',
      'informazioni confuse':'informazioni confuse', 'tempi di attesa':'attesa', 'attesa troppo lunga':'attesa troppo lunga', "lista d'attesa":'attesa troppo lunga',
      'nessuna disponibilità':'nessuna disponibilità', 'costi/spese':'costi', 'costi troppo alti':'costi troppo alti',
      'difficoltà organizzative':'orari incompatibili', 'orari incompatibili':'orari incompatibili',
      'professionisti che non comunicano':'non comunicano', 'professionisti non comunicano':'non comunicano', 'coordinamento insufficiente':'coordinamento',
      'percorso che non sta funzionando':'percorso non funziona', 'percorso non funziona':'percorso non funziona',
      'sovraccarico/stanchezza familiare':'mancanza di energia', 'sovraccarico famiglia':'mancanza di energia', 'mancanza di energia/supporto':'mancanza di energia'
    };
    return arr(v).map(x=>m[trim(x)]||trim(x));
  }
  function mapGoal(v){
    const x=trim(v).toLowerCase();
    const m={
      'voglio capire meglio la situazione':'capire',
      'voglio sapere quale potrebbe essere il prossimo passo':'iniziare',
      'voglio trovare professionisti/centri/servizi':'trovare professionista',
      'cerco un centro':'trovare professionista',
      'voglio confrontare o scegliere tra possibilità':'confrontare',
      'devo decidere quale opzione scegliere':'scegliere',
      'voglio capire se serve un altro parere':'secondo parere',
      'vorrei una seconda valutazione':'seconda opinione',
      'voglio trovare una soluzione a un problema di accesso/attesa':'ridurre attesa',
      'voglio ridurre i tempi di attesa':'ridurre attesa',
      'voglio capire meglio una terapia/intervento':'capire',
      'voglio capire se una terapia funziona':'efficacia terapia',
      'voglio valutare se l’intervento è adatto':'trattamento adeguato',
      'voglio gestire concretamente la situazione':'gestire',
      'voglio affrontare meglio la vita di tutti i giorni':'gestire',
      'voglio organizzare meglio il percorso':'organizzare percorso',
      'voglio gestire calendario e appuntamenti':'organizzare',
      'voglio far comunicare meglio i professionisti':'coordinare persone',
      'voglio risolvere un problema con scuola/servizi scolastici':'scuola',
      'voglio capire come aiutare a scuola':'scuola',
      'voglio capire diritti/benefici/procedure':'capire diritti',
      'voglio capire come funziona la 104':'capire diritti',
      'voglio capire costi e sostenibilità economica':'capire costi',
      'quanto devo spendere per le terapie?':'quanto costa',
      'voglio affrontare un problema nuovo/cambiamento':'nuova difficoltà',
      'è comparsa una nuova difficoltà':'nuova difficoltà',
      'voglio trovare un modo per sostenere meglio la famiglia':'supporto per la famiglia',
      'voglio rendere sostenibile il percorso per la famiglia':'supporto per la famiglia',
      'capire situazione':'capire',
      'capire da dove partire / prossimo passo':'iniziare',
      'capire meglio la situazione':'capire',
      'prossimo passo':'iniziare',
      'trovare professionisti/centri/servizi':'trovare professionista',
      'confrontare/ scegliere':'confrontare',
      'capire se serve un secondo parere':'secondo parere',
      'risolvere problema di accesso/attesa':'ridurre attesa',
      'capire terapia/intervento':'capire',
      'valutare se una terapia funziona':'efficacia terapia',
      'valutare se una terapia/intervento sta funzionando':'efficacia terapia',
      'gestire concretamente':'gestire',
      'organizzare percorso':'organizzare percorso',
      'questione scolastica':'scuola',
      'problema scuola/servizi':'scuola',
      'diritti/benefici/procedure':'capire diritti',
      'costi/sostenibilità economica':'capire costi',
      'nuovo problema/cambiamento':'nuova difficoltà',
      'supportare la famiglia':'sostenere la famiglia'
    };
    return m[x]||trim(v);
  }
  function normalizeQuestionnaire(form){
    form=form||{};
    let need=mapNeed(form.need);
    const rawGoal = form.goal || (form.intent && typeof form.intent==='object' ? form.intent.goal : form.intent);
    const goal=mapGoal(rawGoal);
    if (Array.isArray(form.gaps) && form.gaps.some(x=>/info\/chiarezza|informazione\/chiarezza|informazioni\/chierezza/i.test(String(x))) && /non so il prossimo passo|terapie/i.test(need) && /capire$/i.test(goal)) need='informazioni';
    if (need==='terapie' && /efficacia|funziona|adatto|adeguat/i.test(goal)) need='efficacia terapia';
    if (need==='quotidianità') need='vita quotidiana';
    if (need==='calendario') need='calendario organizzare le attivita';
    if (need==='costi') need='costo delle terapie';
    let normalizedGaps=mapGap(form.gaps);
    let normalizedBarriers=mapBarrier(form.barriers);
    if(need==="lista d'attesa" && !normalizedBarriers.some(x=>/attesa/i.test(x))) normalizedBarriers.push('attesa troppo lunga');
    if(need==='informazioni' && !normalizedGaps.some(x=>/informazion/i.test(x))) normalizedGaps.push('informazione');
    const resources=mapResources(form.resources);
    let normalizedResources=resources;
    let resourcesOther=trim(form.resourcesOther);
    // Existing diagnostic professionals are context, not a provider-search request.
    if(need==='seconda opinione') normalizedResources=resources.map(r=>/^(NPI|professionista)$/i.test(r)?'risorsa diagnostica già coinvolta':r);
    // Existing resources are context for family-support requests.
    if(need==='supporto famiglia') normalizedResources=resources.map(r=>/^(NPI|professionista|centro|ASL|scuola)$/i.test(r)?'risorsa già presente':r);
    return {
      phase:mapPhase(form.phase), need, resources:normalizedResources, resourcesOther,
      gaps:normalizedGaps, barriers:normalizedBarriers, intent:goal,
      comune:trim(form.comune), provincia:trim(form.provincia),
      distance:trim(form.distance||form.distanza), online:trim(form.online)
    };
  }
  window.AtlasInputNormalizer={normalizeQuestionnaire};
})();
