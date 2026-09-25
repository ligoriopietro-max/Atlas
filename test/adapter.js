/* Atlas — Free Text -> AtlasInput Contract Adapter v0.4
 * Interface layer only. Does NOT modify Atlas Engine v0.2.6.
 */
(function(){'use strict';
  function clean(v){return String(v==null?'':v).trim();}
  function adapt(interpreted){
    const x=interpreted||{};
    return {
      phase:clean(x.phase), need:clean(x.need), resources:Array.isArray(x.resources)?x.resources:[], resourcesOther:clean(x.resourcesOther),
      gaps:Array.isArray(x.gaps)?x.gaps:[], barriers:Array.isArray(x.barriers)?x.barriers:[], intent:clean(x.intent),
      comune:clean(x.comune), provincia:clean(x.provincia), distance:clean(x.distance||x.distanza), online:clean(x.online)
    };
  }
  window.AtlasInputContractAdapterV04={adapt};
})();
