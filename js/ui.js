export function createUI({ S, $, units, draw, BOW_RANGE, selectedTarget, dist, passCharges, finishActivation, resolveCombat, endTurn, resolveBreak, reset }) {
  function renderRoster(){for(const side of ["ai","player"]){const el=$(side==="ai"?"enemycards":"playercards");el.innerHTML="";units().filter(u=>u.side===side).forEach(u=>{const b=document.createElement("button");b.className="unit-card"+(u.id===S.selected?" selected":"")+(side==="player"&&!u.moved&&!u.shot&&!u.fled?" unmoved":"");b.setAttribute("aria-label",u.name+" "+u.models+" models");b.title=u.name;b.innerHTML='<span class="sigil">'+(u.kind==="archer"?"🏹":"⚔")+'</span><span class="count">'+u.models+'</span><span class="bar '+(side==="ai"?"ai":"")+'"></span>';b.onclick=()=>{S.selected=u.id;S.mode=null;render();};el.append(b);});}}
function render(){const u=S.units[S.selected];renderRoster();draw();controls();}
function hint(){return "";}
function btn(label,icon,fn,disabled,active){const b=document.createElement("button");b.textContent=icon;b.title=label;b.setAttribute("aria-label",label);b.disabled=!!disabled;if(active)b.classList.add("active");b.onclick=fn;$("actions").append(b);}
function controls(){const el=$("actions");el.replaceChildren();if(S.finished){btn("New battle","↻",reset,false);return;}const u=S.units[S.selected],target=selectedTarget(u);
 if(S.phase==="charges"){if(S.chargeSide!=="player"){btn("Opponent declaring charges","…",()=>{},true);return;}btn("Declare charge","➜",()=>{S.mode=S.mode==="charge"?null:"charge";render();},!u||u.side!=="player"||u.engaged||u.fled||u.charged||!target||target.engaged||dist(u,target)>u.stats.M*2,S.mode==="charge");btn("Pass charges","Ⅱ",passCharges);return;}
 if(S.phase==="movement"){btn("Move","↔",()=>{S.mode=S.mode==="move"?null:"move";render();},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.shot||u.moveUsed>=u.stats.M,S.mode==="move");btn("Shoot","◎",()=>{S.mode=S.mode==="shoot"?null:"shoot";render();},!u||u.side!=="player"||u.activated||u.kind!=="archer"||u.shot||u.engaged,S.mode==="shoot");btn("End activation","✓",finishActivation,!u||u.side!=="player"||u.activated||u.engaged||u.fled);return;}
 if(S.phase==="combat"){btn("Resolve melee","⚔",resolveCombat,!units().some(v=>v.side==="player"&&v.engaged&&alive(v)));btn("End turn","▶",endTurn,!units().some(v=>v.engaged&&alive(v)));return;}
 if(S.phase==="break")btn("Break test","🎲",resolveBreak);
}
  $("logtoggle").onclick = () => $("logpanel").classList.add("open");
  $("logclose").onclick = () => $("logpanel").classList.remove("open");
  $("rollclose").onclick = () => $("rollview").classList.remove("show");
  return { render };
}
