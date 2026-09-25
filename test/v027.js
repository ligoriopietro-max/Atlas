/* Atlas Input Interpreter v0.2.7 — EXPERIMENTAL CANDIDATE
 * Refinement over v0.1.9 conflict resolver. No engine changes.
 */
(function(){'use strict';
if(!window.AtlasInputInterpreterV019Candidate) throw new Error('v0.1.9 candidate required');
const base=window.AtlasInputInterpreterV019Candidate.interpret;
const n=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
function resolve(text){
 const out=base(text), t=n(text), m=out._meta||{}, e=m.semanticEvidence||{};
 let legacy=(m.conflictResolution&&m.conflictResolution.legacy)||m.semanticDecision?.previous||m.topDomain||'D01';
 let d=legacy;
 const reasons=[];
 // High-confidence functional cues: explicit framing can create a candidate even when
 // the legacy extractor found only a topic. These are intentionally narrow.
 const explicitInfo=/info(?:rmazioni)?\s+affidabili|informazioni affidabili|informazioni?\s+su\s+(?:l['’]?|la |il )?aba/i.test(t);
 const explicitOrganize=/(?:calendario|appuntamenti|orari).*(?:impossibile|organizzare|gestire)|come mi organizzo|organizzare gli appuntamenti/i.test(t);
 const explicitNewProblem=/(?:ha iniziato|e iniziato|è iniziato|comparso|comparsa|nuovo comportamento|comportamento nuovo).*(?:prima non aveva|prima non c['’]era|mai avuto)/i.test(t);
 const explicitEconomic=/(?:sostenere economicamente|insostenibil.*econom|economicamente insostenibil|costo delle terapie.*problema|non riusciamo pi[uù] a sostenere.*terapi)/i.test(t);
 const explicitFamily=/(?:ho perso il lavoro|non riesco pi[uù] a reggere il carico|non riesco pi[uù] a sostenere tutto|carico familiare|sono esaust[ao]).*(?:famiglia|tutto|carico|sostenere|reggere)|non riesco pi[uù] a reggere il carico familiare/i.test(t);
 const explicitDaily=/(?:come gestirlo|gestire.*a casa|gestire.*(?:sonno|alimentazione|comportamento)).*/i.test(t);
 const explicitWaiting=/(?:lista d['’]?attesa|tempi di attesa|sei mesi di attesa|un anno di attesa)/i.test(t);
 const foundService=/(?:abbiamo trovato|abbiamo gia il centro|abbiamo già il centro|il centro.*trovato|siamo gia seguiti|siamo già seguiti)/i.test(t);

 // Explicit functional signals outrank generic topic detection.
 if(explicitInfo){ d='D06'; reasons.push('reliable information is the explicit requested function'); }
 else if(explicitOrganize){ d='D10'; reasons.push('organization/calendar management is the explicit requested function'); }
 else if(explicitNewProblem){ d='D14'; reasons.push('a genuinely new problem/behavior is explicitly reported'); }
 else if(explicitEconomic){ d='D13'; reasons.push('economic sustainability is explicitly the primary problem'); }
 else if(explicitFamily){ d='D15'; reasons.push('family/caregiver sustainability is explicitly the primary problem'); }
 else if(explicitDaily){ d='D08'; reasons.push('daily-life management is explicitly requested'); }
 // Waiting is handled after providerRequest is known: an explicit provider search beats a wait constraint.
 // R1 Provider target beats access/waiting when the text is actually asking for a provider.
 // Elliptical Italian noun requests are accepted only with a provider noun + quality/location
 // or recommendation/search framing, avoiding incidental provider mentions.
 const negatedProvider=/(?:non|nn)\s+(?:cerco|cerchiamo|cercherei)\b/i.test(t);
 const providerRequest=/(?:un bravo|una brava|un buon|una buona)\s+(?:neuropsichiatra|npi|logopedista|terapista|professionista|specialista|centro|struttura)/i.test(t)
   ||/(?:cerco|cercavo|cercando|conoscete|indicatemi|consigliatemi|trovare|nomi di)\b(?!\s+di\s+(?:capire|sapere|comprendere))[^.?!]{0,90}(?:neuropsichiatra|npi|logopedista|terapista|professionista|specialista|centro|struttura)/i.test(t);
 const explicitAccessProblem=/(?:non riesco|non riusciamo|non possiamo|non posso)\s+(?:ad )?accedere|non abbiamo accesso|non c['’]?e posto/i.test(t);
 const explicitAccessPriority=/(?:soprattutto|prima di tutto|la cosa principale|il problema e|il problema è).*?(?:posto|disponibil|attesa)|non possiamo aspettare|posto subito/i.test(t);
 const explicitChoicePriority=/(?:due (?:visioni|opinioni|pareri).*(?:oppost|divers)|(?:visioni|opinioni)\s+(?:molto )?oppost|quale.*scegliere|come scegliere|confrontare|quale.*meglio|tra.*due.*(?:terapi|centri|profession|opzion)|scegliere.*(?:terapia|terapista)|quale valutazione.*considerare)/i.test(t);
 if((explicitAccessProblem || (explicitWaiting && foundService)) && !providerRequest && !negatedProvider && d!=='D09'){ d='D05'; reasons.push('waiting/access is explicitly the immediate problem'); }
 if(providerRequest && !explicitAccessProblem && !explicitAccessPriority && !negatedProvider && !explicitAccessProblem && !explicitAccessPriority && !explicitChoicePriority && d!=='D09') { d='D02'; reasons.push('provider search is the requested outcome; waiting is a constraint'); }
 // R2 Daily-life problem beats caregiver emotion unless the family explicitly asks for support for itself.
 const actualConflict=/(?:un centro|uno specialista|un medico|un NPI|un neuropsichiatra)\s+(?:dice|ha dato|sostiene).*\b(?:altro|no|diverso)|diagnosi\s+(?:discordanti|contrastanti|diverse)|pareri? diversi.*diagnos|diagnosi.*(?:non concordano|non riconosciuta)|(?:vorrei|voglio|chiedo|cerco|cerchiamo|mi serve|avrei bisogno).{0,35}(?:second[ao] opinione|secondo parere|altro parere)/i.test(t);
 const therapeuticFraming=/(?:trattat[ao]|viene trattat[ao]|training terapeutic|intervento terapeutic|percorso terapeutico)/i.test(t);
 const dailyActive=/(?:problemi?.*per dormire|non riesco a dormire|si sveglia.*piangendo|selettivit[aà] alimentare|come gestire.*(?:sonno|alimentazione|comportamento)|gestire.*(?:sonno|alimentazione|comportamento)|non so pi[uù] cosa fare.*(?:sonno|dormire|comportamento))/i.test(t) && /(?:come|gestire|problema|difficolt[aà]|non so|aiuto|cosa fare|bisogno|vorrei|cerco|chiedo)/i.test(t);
 const daily=dailyActive;/problemi?.*per dormire|non riesco a dormire|si sveglia.*piangendo|selettivit[aà] alimentare|come gestire.*(?:sonno|alimentazione|comportamento)|gestire.*(?:sonno|alimentazione|comportamento)|non so pi[uù] cosa fare.*(?:sonno|dormire|comportamento)/i.test(t);
 const directFamily=/(?:ho bisogno|abbiamo bisogno|cerco|cerchiamo|vorrei|chiedo).*(?:aiuto|sostegno).*(?:io|me|noi|genitore|famiglia|carico)|(?:aiuto|sostegno)\s+(?:ai )?(?:genitori|famiglia)|carico familiare.*(?:non ce la faccio|non riesco|insostenibile)|perso il lavoro.*(?:sostenere|reggere|gestire)/i.test(t);
 if(daily && !therapeuticFraming && !directFamily && d!=='D09'){ d='D08'; reasons.push('daily-life problem is primary; caregiver exhaustion is contextual'); }
 if(therapeuticFraming && d!=='D09' && !actualConflict){ d='D07'; reasons.push('therapeutic framing makes intervention the primary function'); }
 if(explicitChoicePriority && !actualConflict && d!=='D09'){ d='D03'; reasons.push('explicit choice outranks therapeutic topic'); }
 // R3 Mentioning "second opinion" as one option does not equal a diagnostic conflict.
 // D04 requires an actual disagreement/contradictory diagnosis, otherwise explicit choice remains D03.

 const choiceWithSecond=/(?:meglio|scegliere|quale|tra|oppure|o tornare|aspettare).*second[ao] opinione|second[ao] opinione.*(?:oppure|o |tra|meglio)|secondo parere.*(?:oppure|o |tra|meglio)/i.test(t);
 if(actualConflict && !choiceWithSecond && d!=='D09'){ d='D04'; reasons.push('explicit second-opinion/diagnostic-conflict request is primary'); }
 if(choiceWithSecond && !actualConflict && d!=='D09'){ d='D03'; reasons.push('second-opinion is presented as an option within a choice decision'); }
 // School-specific professional search: when the requested professional is explicitly for a
 // school/didactic function, the school domain remains primary; access is only a constraint.
 const schoolProviderRequest=/(?:cerco|cerchiamo|cercavo|trovare|indicatemi|consigliatemi)[^.!?]{0,500}(?:professionista|specialista|pedagogista|neuropsicologo|terapista|logopedista|educatore)[^.!?]{0,500}(?:scuola|scolastic|didattic|classe|consiglio di classe|pei|glo|esame di stato|insegnamento|apprendimento)/i.test(t) && !/(?:scegliere|scegli|quale).{0,40}scuola/i.test(t);
 if(schoolProviderRequest && d!=='D09'){ d='D11'; reasons.push('provider search is explicitly school/didactic; school function is primary'); }
 // Explicit access priority outranks provider-finding when availability/waiting is the stated immediate constraint.
 if((explicitAccessPriority || explicitAccessProblem) && !choiceWithSecond && d!=='D09'){ d='D05'; reasons.push('access/availability is explicitly framed as the immediate problem'); }
 // Re-assert school-specific function after generic access handling.
 if(schoolProviderRequest && d!=='D09'){ d='D11'; reasons.push('school/didactic request outranks generic availability constraint'); }
 // Explicit selection priority outranks the mere act of finding a professional.
 if(explicitChoicePriority && !actualConflict && d!=='D09'){ d='D03'; reasons.push('choice is explicit; provider search is only the object'); }
 // R4 Diagnostic conflict outranks provider search when the family explicitly questions the diagnosis/assessment.
 if(actualConflict && !choiceWithSecond && d!=='D09'){ d='D04'; reasons.push('diagnostic conflict outranks provider search'); }
 // R5 Coordination friction outranks generic comparison/confronto.
 const coordination=/non comunicano|non collaborano|lavorano separatamente|nessuno si confronta|fare da centralino|raccontare ogni volta tutto|ognuno per conto suo|docente.*non vuole.*(?:programma|procedure)|docente.*non.*(?:segue|collabora)|maestr[io].*(?:non seguono|non vogliono)/i.test(t);
 if(coordination){ d='D09'; reasons.push('actual coordination friction outranks generic comparison language'); }
 m.topDomain=d; m.primaryDomain=d;
 m.conflictResolution={candidate:d,legacy,action:d===legacy?'preserve_legacy':'override',strength:reasons.length?'HIGH':'NONE',reasons};
 if(e)e.primary_domain=d;
 m.interpreter='v0.2.7-candidate';
 return out;
}
window.AtlasInputInterpreterV027Candidate={interpret:resolve};
})();
