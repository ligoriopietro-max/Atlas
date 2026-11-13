const $=id=>document.getElementById(id);const STORE='atlas-agenda-visiva-v01';

const CATALOG_BASE = [
 {id:"mela",word:"mela",symbol:"mela.webp",cat:"Cibo"},
 {id:"panino",word:"panino",symbol:"panino.webp",cat:"Cibo"},
 {id:"pasta",word:"pasta",symbol:"pasta.webp",cat:"Cibo"},
 {id:"acqua",word:"acqua",symbol:"acqua.webp",cat:"Cibo e bevande"},
 {id:"latte",word:"latte",symbol:"latte.webp",cat:"Cibo e bevande"},
 {id:"zuppa",word:"zuppa",symbol:"zuppa.webp",cat:"Cibo"},
 {id:"banana",word:"banana",symbol:"banana.webp",cat:"Cibo"},
 {id:"yogurt",word:"yogurt",symbol:"yogurt.webp",cat:"Cibo"},
 {id:"casa",word:"casa",symbol:"casa.webp",cat:"Luoghi"},
 {id:"scuola",word:"scuola",symbol:"scuola.webp",cat:"Luoghi"},
 {id:"parco",word:"parco",symbol:"parco.webp",cat:"Luoghi"},
 {id:"ospedale",word:"ospedale",symbol:"ospedale.webp",cat:"Luoghi"},
 {id:"mare",word:"mare",symbol:"mare.webp",cat:"Luoghi"},
 {id:"supermercato",word:"supermercato",symbol:"supermercato.webp",cat:"Luoghi"},
 {id:"parco-giochi",word:"parco giochi",symbol:"parco-giochi.webp",cat:"Luoghi"},
 {id:"bagno",word:"bagno",symbol:"bagno.webp",cat:"Bisogni"},
 {id:"mamma",word:"mamma",symbol:"mamma.webp",cat:"Persone"},
 {id:"papa",word:"papà",symbol:"papa.webp",cat:"Persone"},
 {id:"bambino",word:"bambino",symbol:"bambino.webp",cat:"Persone"},
 {id:"bambina",word:"bambina",symbol:"bambina.webp",cat:"Persone"},
 {id:"nonna",word:"nonna",symbol:"nonna.webp",cat:"Persone"},
 {id:"nonno",word:"nonno",symbol:"nonno.webp",cat:"Persone"},
 {id:"dottore",word:"dottore",symbol:"dottore.webp",cat:"Persone"},
 {id:"insegnante",word:"insegnante",symbol:"insegnante.webp",cat:"Persone"},
 {id:"mangiare",word:"mangiare",symbol:"mangiare.webp",cat:"Azioni"},
 {id:"bere",word:"bere",symbol:"bere.webp",cat:"Azioni"},
 {id:"dormire",word:"dormire",symbol:"dormire.webp",cat:"Azioni"},
 {id:"sedere",word:"sedere",symbol:"sedere.webp",cat:"Azioni"},
 {id:"in-piedi",word:"stare in piedi",symbol:"in-piedi.webp",cat:"Azioni"},
 {id:"fermare",word:"fermare",symbol:"fermare.webp",cat:"Azioni"},
 {id:"aprire",word:"aprire",symbol:"aprire.webp",cat:"Azioni"},
 {id:"chiudere",word:"chiudere",symbol:"chiudere.webp",cat:"Azioni"},
 {id:"felice",word:"felice",symbol:"felice.webp",cat:"Emozioni"},
 {id:"triste",word:"triste",symbol:"triste.webp",cat:"Emozioni"},
 {id:"arrabbiato",word:"arrabbiato",symbol:"arrabbiato.webp",cat:"Emozioni"},
 {id:"sorpreso",word:"sorpreso",symbol:"sorpreso.webp",cat:"Emozioni"},
 {id:"spaventato",word:"spaventato",symbol:"spaventato.webp",cat:"Emozioni"},
 {id:"stanco",word:"stanco",symbol:"stanco.webp",cat:"Emozioni"},
 {id:"malato",word:"malato",symbol:"malato.webp",cat:"Salute"},
 {id:"calmo",word:"calmo",symbol:"calmo.webp",cat:"Emozioni"},
 {id:"si",word:"sì",symbol:"si.webp",cat:"Richieste"},
 {id:"no",word:"no",symbol:"no.webp",cat:"Richieste"},
 {id:"aiuto",word:"aiuto",symbol:"aiuto.webp",cat:"Richieste"},
 {id:"vuoto",word:"vuoto",symbol:"vuoto.webp",cat:"Richieste"},
 {id:"ancora",word:"ancora",symbol:"ancora.webp",cat:"Richieste"},
 {id:"basta",word:"basta",symbol:"basta.webp",cat:"Richieste"},
 {id:"carta-igienica",word:"carta igienica",symbol:"carta-igienica.webp",cat:"Bisogni"},
 {id:"cerotto",word:"medicinale",symbol:"cerotto.webp",cat:"Salute"}
];
const CATALOG = [...CATALOG_BASE, ...MULBERRY_CATALOG];
let agenda=[];let saved=[];let nextId=1;
function safeText(s){return String(s??'').trim()}
function makeItem(raw){return {id:nextId++,word:raw.word||'Attività',symbol:raw.symbol||'',time:raw.time||'',cat:raw.cat||'Personalizzata'}}
function imgPath(item){if(!item?.symbol)return '';const s=String(item.symbol);const raw=s.startsWith('mulberry/')?'assets/'+s:'assets/symbols/'+s;return raw.split('/').map((part,index)=>index===0?part:encodeURIComponent(part)).join('/')}
function addItem(item){if(!item||!item.symbol){alert('Ogni attività deve avere un’immagine: scegli un simbolo dal catalogo.');return}agenda.push(makeItem(item));renderAgenda()}
function renderCatalog(){const q=$('search').value.trim().toLocaleLowerCase('it');const cat=$('category').value;const matches=CATALOG.filter(x=>(cat==='Tutte'||x.cat===cat)&&(!q||(x.word+' '+x.cat+' '+x.id+' '+(x.searchText||'')).toLocaleLowerCase('it').includes(q)));const box=$('catalog');box.replaceChildren();matches.slice(0,120).forEach(it=>{const b=document.createElement('button');b.className='symbol';b.type='button';const im=document.createElement('img');im.src=imgPath(it);im.alt='';im.loading='eager';im.decoding='async';im.onerror=()=>{im.classList.add('image-load-error');im.alt='Immagine non disponibile';};const word=document.createElement('span');word.textContent=it.word;b.append(im,word);b.onclick=()=>{const custom=safeText($('customWord').value);addItem({word:custom||it.word,symbol:it.symbol,cat:it.cat,time:$('activityTime').value});$('customWord').value='';};box.append(b)});$('catalogInfo').textContent=`${matches.length} risultati${matches.length>120?' · mostra i primi 120: affina la ricerca':''} · catalogo ${CATALOG.length} simboli`}
function renderAgenda(){const box=$('items');box.replaceChildren();if(!agenda.length){const e=document.createElement('div');e.className='empty';e.textContent='L’agenda è vuota. Scegli un simbolo illustrato dal catalogo: ogni attività avrà la propria immagine.';box.append(e);return}agenda.filter(it=>it.symbol).forEach((it,i)=>{const row=document.createElement('div');row.className='activity';const n=document.createElement('div');n.className='num';n.textContent=String(i+1);let im=document.createElement('img');im.alt='';im.src=imgPath(it);im.loading='eager';im.onerror=()=>{im.classList.add('image-load-error');im.alt='Immagine non disponibile';};const words=document.createElement('div');words.className='words';const strong=document.createElement('strong');strong.textContent=it.word;const small=document.createElement('small');small.textContent=[it.time,it.cat].filter(Boolean).join(' · ');words.append(strong,small);const actions=document.createElement('div');actions.className='item-actions';for(const [label,fn,title] of [['↑',()=>move(i,-1),'Sposta su'],['↓',()=>move(i,1),'Sposta giù'],['×',()=>{agenda.splice(i,1);renderAgenda()},'Rimuovi']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.title=title;if(label==='×')b.className='remove';b.disabled=(label==='↑'&&i===0)||(label==='↓'&&i===agenda.length-1);b.onclick=fn;actions.append(b)}row.append(n,im,words,actions);box.append(row)})}
function move(i,delta){const j=i+delta;if(j<0||j>=agenda.length)return;[agenda[i],agenda[j]]=[agenda[j],agenda[i]];renderAgenda()}
function current(){return {name:safeText($('planName').value)||'La mia giornata',date:$('planDate').value,items:agenda.map(({word,symbol,time,cat})=>({word,symbol,time,cat}))}}
function persist(){try{localStorage.setItem(STORE,JSON.stringify(saved))}catch(e){alert('Il browser non permette il salvataggio locale. Esporta un backup.')}}
function renderSaved(){const box=$('saved');box.replaceChildren();if(!saved.length){const p=document.createElement('p');p.className='muted';p.textContent='Nessuna agenda salvata su questo dispositivo.';box.append(p);return}saved.forEach((s,i)=>{const row=document.createElement('div');row.className='saved-row';const info=document.createElement('div');const strong=document.createElement('strong');strong.textContent=s.name;const small=document.createElement('small');small.textContent=`${s.items.length} attività${s.date?' · '+s.date:''}`;info.append(strong,small);const actions=document.createElement('div');const open=document.createElement('button');open.textContent='Apri';open.onclick=()=>loadPlan(s);const del=document.createElement('button');del.textContent='×';del.className='secondary';del.title='Elimina';del.onclick=()=>{if(confirm('Eliminare questa agenda salvata?')){saved.splice(i,1);persist();renderSaved()}};actions.append(open,del);row.append(info,actions);box.append(row)})}
function loadPlan(s){$('planName').value=s.name||'La mia giornata';$('planDate').value=s.date||'';agenda=(s.items||[]).filter(x=>x&&x.symbol).map(makeItem);renderAgenda()}
$('search').addEventListener('input',renderCatalog);$('category').addEventListener('change',renderCatalog);$('clearBtn').onclick=()=>{if(agenda.length&&!confirm('Svuotare l’agenda corrente?'))return;agenda=[];renderAgenda()};$('saveBtn').onclick=()=>{const plan=current();if(plan.items.some(x=>!x.symbol)){alert('Ogni attività deve avere un’immagine. Seleziona un simbolo dal catalogo.');return}if(!plan.items.length){alert('Aggiungi almeno un’attività prima di salvare.');return}const idx=saved.findIndex(s=>s.name.toLocaleLowerCase('it')===plan.name.toLocaleLowerCase('it'));if(idx>=0){if(!confirm('Esiste già un’agenda con questo nome. Sostituirla?'))return;saved[idx]=plan}else saved.push(plan);persist();renderSaved();alert('Agenda salvata su questo dispositivo.')};$('printBtn').onclick=()=>{if(!agenda.length){alert('Aggiungi almeno un’attività prima di stampare.');return}window.print()};$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({format:'atlas-agenda-backup',version:1,saved},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='atlas-agenda-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};$('importBtn').onclick=()=>$('backupFile').click();$('backupFile').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(d.format!=='atlas-agenda-backup'||!Array.isArray(d.saved))throw Error();const valid=d.saved.filter(s=>s&&typeof s.name==='string'&&Array.isArray(s.items)).map(s=>({name:s.name,date:s.date||'',items:s.items.filter(x=>x&&typeof x.word==='string'&&typeof x.symbol==='string'&&x.symbol).map(x=>({word:x.word,symbol:x.symbol,time:x.time||'',cat:x.cat||''}))}));saved=[...saved,...valid];persist();renderSaved();alert(`Importate ${valid.length} agende.`)}catch{alert('File di backup non valido.')}};r.readAsText(f);e.target.value=''};
const cats=['Tutte',...new Set(CATALOG.map(x=>x.cat)).values()].sort((a,b)=>a==='Tutte'?-1:b==='Tutte'?1:a.localeCompare(b,'it'));$('category').replaceChildren(...cats.map(c=>{const o=document.createElement('option');o.value=c;o.textContent=c==='Tutte'?'Tutte le categorie':c;return o}));try{saved=JSON.parse(localStorage.getItem(STORE)||'[]')}catch{saved=[]}$('planDate').value=new Date().toLocaleDateString('en-CA');renderCatalog();renderAgenda();renderSaved();
