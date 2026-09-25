/* Atlas Safety Gate v0.1 — deterministic pre-classification gate
 * Experimental: blocks free-text routing for acute/high-risk requests.
 * It does not diagnose, assess severity, or replace emergency services.
 */
(function(){'use strict';
 const RULES=[
  {id:'S01',level:'EMERGENCY',rx:/\b(112|118)\b|pronto soccorso|ambulanza|non respira|difficolta a respirare|sta soffocando|soffocamento|perdita di coscienza|incosciente|convulsione(?!\s+di\s+.*passato)/i},
  {id:'S02',level:'URGENT',rx:/\b(mi voglio suicid|voglio morire|suicid|farla finita|farmi del male|farsi del male|uccidermi|uccidersi)\b/i},
  {id:'S03',level:'URGENT',rx:/\b(mi sta picchiando|ci sta picchiando|picchia mio figlio|violenza domestica|violenza sessuale|abuso sessuale|abusa di mio figlio|maltrattamento)\b/i},
  {id:'S04',level:'URGENT',rx:/\b(ha ingerito|ha bevuto|ha preso per errore|overdose|intossicazione|avvelenamento)\b/i},
  {id:'S05',level:'MEDICAL',rx:/\b(dose|dosaggio|quanti mg|quante gocce|posso dare|devo dare)\b.*\b(farmaco|medicina|medicinale|mg|gocce|sciroppo)\b|\b(farmaco|medicina|medicinale)\b.*\b(dose|dosaggio|quanti mg|quante gocce)\b/i}
 ];
 function check(text){
  const t=String(text||'').trim();
  for(const r of RULES){ if(r.rx.test(t)) return {status:'BLOCK',level:r.level,rule:r.id,reason:reason(r.level)}; }
  return {status:'PASS',level:'NONE',rule:null,reason:null};
 }
 function reason(level){
  if(level==='EMERGENCY') return 'Questa richiesta può riguardare un\'emergenza immediata. Atlas non gestisce emergenze: contatta i servizi di emergenza o un professionista sanitario.';
  if(level==='URGENT') return 'Questa richiesta può riguardare una situazione di pericolo o crisi. Atlas non è uno strumento di emergenza: cerca subito aiuto da servizi competenti e da una persona sicura.';
  return 'Atlas non fornisce indicazioni su dosaggi o uso di farmaci. Per questo tipo di domanda serve un professionista sanitario o il foglietto illustrativo ufficiale.';
 }
 window.AtlasSafetyGateV01={check,RULES};
})();
