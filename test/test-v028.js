const fs=require('fs'),vm=require('vm');const ctx={window:{}};vm.createContext(ctx);
for(const f of ['data.js','engine.js','v018.js','v019.js','v027.js','adapter.js','reconciler.js','dataset.js']) vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const ds=ctx.window.ATLAS_TEST_DATASET_V01;
const goldenIds=['P68','P110','P39','P124','P43','P49','P46','P57','P15','P29','P48','P77','P20','P61','P115','P125','P75','P109','P16','P128','P129'];
function run(c){const text=c.input.need;const i=ctx.window.AtlasInputInterpreterV027Candidate.interpret(text);const a=ctx.window.AtlasInputContractAdapterV04.adapt(i);const e=ctx.window.AtlasEngine.buildProfile(a);const r=ctx.window.AtlasFreeTextReconcilerV02.reconcile(i,e);return{id:c.id,expected:c.expected.primary_domain,interp:i._meta.topDomain,engine:e.primary_domain,final:r.primary_domain,source:r.source,pass:r.primary_domain===c.expected.primary_domain,nonnull:!!r.primary_domain};}
const natural=ds.slice(0,50).map(run),golden=goldenIds.map(id=>run(ds.find(c=>c.id===id)));
console.log(JSON.stringify({natural,golden,stats:{natural_exact:natural.filter(x=>x.pass).length,natural_nonnull:natural.filter(x=>x.nonnull).length,golden_exact:golden.filter(x=>x.pass).length,golden_nonnull:golden.filter(x=>x.nonnull).length,errors:0}},null,2));
