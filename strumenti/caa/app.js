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
// Catalogo integrato: simboli Atlas originali + Mulberry Symbols con attribuzione.
const CATALOG = [...CATALOG_BASE, ...MULBERRY_CATALOG];
function symbolPath(item){const s=String(item?.symbol||"");const raw=s.startsWith("mulberry/") ? `assets/${s}` : `assets/symbols/${s}`;return raw.split("/").map(encodeURIComponent).join("/");}
const $ = id => document.getElementById(id);
const KEY = "atlas-caa-prototype-v01";
let selected = [];
let currentBoard = {name:"Tabella rapida",items:["acqua","bagno","mangiare","bere","aiuto","pausa","si","no","basta","ancora","dolore","giocare"]};
let saved = [];
let lastSpoken = "";
let deferredInstall = null;

function card(item, opts={}) {
  const b = document.createElement("button");
  b.type="button"; b.className="symbol-card";
  b.innerHTML = `<span class="pic"><img alt="" loading="lazy" decoding="async"></span>${$("showLabels")?.checked === false && opts.live ? "" : `<span class="word"></span>`}`;
  b.querySelector("img").src=symbolPath(item);
  const w=b.querySelector(".word"); if(w) w.textContent=item.word;
  b.setAttribute("aria-label",item.word);
  b.addEventListener("click",()=>opts.click?.(item));
  return b;
}
function itemById(id){return CATALOG.find(x=>x.id===id)}
function say(word){
  lastSpoken=word; $("spokenOutput").textContent=word;
  if($("voiceOn") && !$("voiceOn").checked) return;
  if("speechSynthesis" in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(word);u.lang="it-IT";u.rate=.9;speechSynthesis.speak(u)}
}
function renderLive(){
  $("liveGrid").replaceChildren();
  currentBoard.items.map(itemById).filter(Boolean).forEach(it=>$("liveGrid").append(card(it,{live:true,click:x=>say(x.word)})));
  $("activeBoardTitle").textContent=currentBoard.name || "Tabella rapida";
}
function renderCatalog(){
  const q=$("search").value.trim().toLocaleLowerCase("it");
  const cat=$("category").value;
  $("catalogGrid").replaceChildren();
  const matches=CATALOG.filter(it=>(cat==="Tutte"||it.cat===cat) && (!q || (it.word+" "+it.cat+" "+it.id+" "+(it.searchText||"")).toLocaleLowerCase("it").includes(q)));
  matches.slice(0,180).forEach(it=>$("catalogGrid").append(card(it,{click:x=>{if(!selected.some(s=>s.id===x.id)){selected.push({...x});renderSelected()}}})));
  const info=$("catalogInfo"); if(info) info.textContent=`${matches.length} risultati${matches.length>180?" · mostra i primi 180: affina la ricerca":""} · catalogo totale ${CATALOG.length} simboli`;
}
function renderSelected(){
  $("selectedGrid").replaceChildren(); $("selectedCount").textContent=selected.length;
  selected.forEach((it,index)=>{
    const b=card(it,{click:()=>{selected.splice(index,1);renderSelected()}});
    b.title="Tocca per rimuovere";$("selectedGrid").append(b);
  });
}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){alert("Non è stato possibile salvare in questo browser.")}}

function exportBackup(){
  const payload={format:"atlas-caa-backup",version:1,exportedAt:new Date().toISOString(),boards:saved};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");
  a.href=url;a.download=`atlas-caa-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function importBackup(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(String(reader.result||""));
      if(data?.format!=="atlas-caa-backup"||!Array.isArray(data.boards))throw new Error("Formato non riconosciuto");
      const valid=data.boards.filter(b=>b&&typeof b.name==="string"&&Array.isArray(b.items))
        .map(b=>({id:typeof b.id==="string"?b.id:String(Date.now()+Math.random()),name:b.name.slice(0,60)||"Tabella importata",items:b.items.filter(id=>typeof id==="string"&&CATALOG.some(it=>it.id===id)),showLabels:b.showLabels!==false}))
        .filter(b=>b.items.length>0);
      if(!valid.length)throw new Error("Il file non contiene tabelle compatibili.");
      if(!confirm(`Trovate ${valid.length} tabelle. Vuoi aggiungerle alle tabelle già salvate? Quelle con lo stesso nome verranno sostituite.`))return;
      for(const board of valid){const idx=saved.findIndex(x=>x.name.toLocaleLowerCase("it")===board.name.toLocaleLowerCase("it"));if(idx>=0)saved[idx]=board;else saved.push(board)}
      persist();renderSaved();alert(`Importazione completata: ${valid.length} tabelle.`);
    }catch(err){alert(`Impossibile importare il backup. ${err.message||"Controlla che il file sia valido."}`)}
  };
  reader.onerror=()=>alert("Errore durante la lettura del file.");reader.readAsText(file);
}

function renderSaved(){
  $("savedBoards").replaceChildren();
  if(!saved.length){const p=document.createElement("p");p.className="muted";p.textContent="Non hai ancora salvato tabelle."; $("savedBoards").append(p);return}
  saved.forEach((board,i)=>{
    const row=document.createElement("div");row.className="saved-item";
    const meta=document.createElement("div");meta.className="meta";
    const strong=document.createElement("strong");strong.textContent=board.name;
    const small=document.createElement("small");small.textContent=`${board.items.length} caselle`;
    meta.append(strong,small);
    const use=document.createElement("button");use.textContent="Apri";use.onclick=()=>{currentBoard=board;renderLive();showView("use")};
    const edit=document.createElement("button");edit.textContent="Modifica";edit.onclick=()=>{selected=board.items.map(itemById).filter(Boolean).map(x=>({...x}));$("boardName").value=board.name;renderSelected();showView("build")};
    const del=document.createElement("button");del.textContent="Elimina";del.className="secondary";del.onclick=()=>{if(confirm(`Eliminare "${board.name}"?`)){saved.splice(i,1);persist();renderSaved()}};
    row.append(meta,use,edit,del);$("savedBoards").append(row);
  });
}
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  $("view-"+name).classList.remove("hidden");
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===name));
  if(name==="saved")renderSaved();
}
function printCurrent(){
  const name=$("boardName").value.trim()||"Tabella di comunicazione";
  const show=$("showLabels").checked;
  const cols=window.innerWidth<600?3:4;
  const printView=document.createElement("section");printView.id="print-only";
  const title=document.createElement("h1");title.textContent=name;
  const subtitle=document.createElement("p");subtitle.className="print-subtitle";subtitle.textContent="Atlas CAA · Tabella di comunicazione";
  const grid=document.createElement("div");grid.className="print-grid";grid.style.setProperty("--cols",cols);
  selected.forEach(it=>{
    const cell=document.createElement("div");cell.className="print-cell";
    const pic=document.createElement("div");pic.className="pic";const img=document.createElement("img");img.src=symbolPath(it);img.alt="";img.loading="eager";pic.append(img);cell.append(pic);
    if(show){const word=document.createElement("div");word.className="word";word.textContent=it.word;cell.append(word)}
    grid.append(cell);
  });
  printView.append(title,subtitle,grid);
  document.getElementById("print-only")?.remove();document.getElementById("print-style")?.remove();
  document.body.append(printView);
  const style=document.createElement("style");style.id="print-style";
  style.textContent=`
    @page{size:A4;margin:10mm}
    @media print{
      html,body{background:#fff!important;color:#18324d!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      body>*:not(#print-only){display:none!important}
      #print-only{display:block!important;padding:0!important;font-family:Arial,sans-serif;color:#18324d!important}
      #print-only h1{font-size:22pt;margin:0 0 2mm;font-weight:750}
      #print-only .print-subtitle{font-size:9pt;color:#61758a;margin:0 0 7mm}
      #print-only .print-grid{display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:4mm;align-items:stretch}
      #print-only .print-cell{border:1px solid #b8c9dc;border-radius:3mm;min-height:34mm;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2mm;padding:3mm;text-align:center;background:#fff!important;break-inside:avoid;overflow-wrap:anywhere;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      #print-only .pic{font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif;font-size:29pt;line-height:1.2}
      #print-only .word{font-size:12pt;font-weight:700;color:#18324d!important}
    }
    @media screen{#print-only{display:none}}
  `;
  document.head.append(style);
  const cleanup=()=>{printView.remove();style.remove();window.removeEventListener("afterprint",cleanup)};
  window.addEventListener("afterprint",cleanup,{once:true});
  window.print();
  // La vista viene rimossa dopo afterprint; evitare timeout brevi che possono cancellarla durante dialoghi di stampa lenti.
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>showView(t.dataset.view)));
$("search").addEventListener("input",renderCatalog);$("category").addEventListener("change",renderCatalog);
$("clearSelected").onclick=()=>{selected=[];renderSelected()};
$("saveBoard").onclick=()=>{
  if(!selected.length){alert("Aggiungi almeno una casella prima di salvare.");return}
  const name=$("boardName").value.trim()||"La mia tabella";
  const board={id:crypto.randomUUID?.()||String(Date.now()),name,items:selected.map(x=>x.id),showLabels:$("showLabels").checked};
  const idx=saved.findIndex(x=>x.name.toLocaleLowerCase("it")===name.toLocaleLowerCase("it"));
  if(idx>=0){if(!confirm("Esiste già una tabella con questo nome. Sostituirla?"))return;saved[idx]=board}else saved.push(board);
  persist();currentBoard=board;renderLive();alert("Tabella salvata su questo dispositivo.");showView("saved");
};
$("printBoard").onclick=()=>{if(!selected.length){alert("Aggiungi almeno una casella prima di stampare.");return}printCurrent()};
$("exportBackup").onclick=exportBackup;
$("importBackup").onclick=()=>$("backupFile").click();
$("backupFile").addEventListener("change",e=>{const file=e.target.files?.[0];if(file)importBackup(file);e.target.value=""});
$("speakAgain").onclick=()=>{if(lastSpoken)say(lastSpoken)};
$("stopSpeech").onclick=()=>{"speechSynthesis" in window&&speechSynthesis.cancel()};
$("showLabels").onchange=()=>{renderCatalog();renderSelected();renderLive()};
$("voiceOn").onchange=()=>{};
const categories=["Tutte",...new Set(CATALOG.map(x=>x.cat).sort((a,b)=>a.localeCompare(b,"it")))];
categories.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;$("category").append(o)});
try{saved=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){saved=[]}
renderLive();renderCatalog();renderSelected();
if("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("installBtn").classList.add("hidden")};
