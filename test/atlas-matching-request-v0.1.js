(function(){'use strict';
function clean(v){return typeof v==='string'?v.trim():v;}
function build(p){p=p||{};var d=p.primary_domain;var mode=d==='D02'?'provider':d==='D03'?'compare':d==='D05'?'access':d==='D06'?'information':'general';var r={version:'0.1',status:'draft',mode:mode,target:{},geography:{},access:{},preferences:{},constraints:{},context:{},missing:[],exclusions:[],evidence:[]};
if(p.provider_type)r.target.provider_type=clean(p.provider_type); if(p.service_type)r.target.service_type=clean(p.service_type); if(p.object)r.target.object=clean(p.object);
if(p.location)r.geography.location=clean(p.location); if(p.province)r.geography.province=clean(p.province); if(p.online!==undefined)r.access.online=!!p.online; if(p.setting)r.preferences.setting=clean(p.setting); if(p.priority)r.preferences.priority=clean(p.priority);
if(p.barriers)r.constraints.barriers=Array.isArray(p.barriers)?p.barriers.slice():[p.barriers]; if(p.resources)r.context.resources=Array.isArray(p.resources)?p.resources.slice():[p.resources];
if(p.age)r.context.age=p.age; if(p.phase)r.context.phase=clean(p.phase); if(p.family_goal)r.context.family_goal=clean(p.family_goal);
if(mode==='provider'&&!r.target.provider_type&&!r.target.service_type)r.missing.push('provider_type');
if(mode==='provider'&&!r.geography.location&&r.access.online!==true)r.missing.push('location_or_online');
r.status=r.missing.length?'needs_input':'ready'; return r;}
function canMatch(r){return !!r&&r.status==='ready'&&['provider','center','service'].includes(r.mode);}
window.AtlasMatchingRequest={build:build,canMatch:canMatch};
})();
