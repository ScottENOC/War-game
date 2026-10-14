export function createUI({ S, $, units, alive, draw, W, H, BOW_RANGE, selectedTarget, dist, passCharges, finishActivation, resolveCombat, endTurn, resolveBreak, reset, validDeployment, canPlace, rallyUnit, fleeFromCharge, startBattle, say, equipMeleeWeapon, setRangedMode, shape, PX_PER_IN }) {
  function renderRoster() {
    for (const side of ["ai", "player"]) {
      const el = $(side === "ai" ? "enemycards" : "playercards");
      el.innerHTML = "";
      if(side==="ai"&&S.phase==="deployment"){el.innerHTML='<div class="roster-note">Opponent deployment hidden</div>';continue;}
      units().filter(u => u.side === side).forEach(u => {
        const b = document.createElement("button");
        b.className = "unit-card" + (u.id === S.selected ? " selected" : "") +
          (side === "player" && !u.moved && !u.shot && !u.fled ? " unmoved" : "");
        b.setAttribute("aria-label", u.name + " " + u.models + " models, " + u.points + " points" + (u.champion.enabled ? ", champion" : "") + (u.lightArmour ? ", light armour" : "") + (u.alwaysStrikesFirst ? ", Always Strikes First" : ""));
        b.title = u.name + " — " + u.points + " pts" + (u.champion.enabled ? ", champion included" : "") + (u.lightArmour ? ", light armour" : "");
        b.innerHTML = '<span class="sigil">' + (u.rangedWeapon==="firearm" ? "🔫" : u.hasRangedWeapon ? "🏹" : u.kind === "cavalry" ? "🐎" : "⚔") + '</span>' +
          (u.champion.enabled ? '<span class="champion-mark">♛</span>' : "") +
          '<span class="count">' + u.models + '</span><span class="points-mark">' + u.points + '</span><span class="bar ' + (side === "ai" ? "ai" : "") + '"></span>';
        b.onclick = () => { if(S.phase==="deployment"&&side==="ai")return; S.selected = u.id; S.mode = null; render(); };
        el.append(b);
      });
    }
  }
  function render() { renderRoster(); const total=units().filter(v=>v.side==="player").reduce((sum,v)=>sum+v.points,0); $("battle-points").textContent="Your army · "+total+" pts"; draw(); controls(); }
  function btn(label, icon, fn, disabled, active) {
    const b = document.createElement("button");
    b.textContent = icon; b.title = label; b.setAttribute("aria-label", label);
    b.disabled = !!disabled; if (active) b.classList.add("active"); b.onclick = fn; $("actions").append(b);
  }
  function controls() {
    const el = $("actions"); el.replaceChildren();
    if (S.finished) { btn("New battle", "↻", reset, false); return; }
    const u = S.units[S.selected], target = selectedTarget(u);
    if(S.phase==="movement"&&S.mode==="shoot"&&u?.hasRangedWeapon){
      const preview=document.createElement("div");preview.className="shoot-preview";
      if(u.ownsShield&&u.rangedMode!=="bow"){preview.textContent="Shield ready — switch to bow before shooting.";el.append(preview);}else
      if(!target){preview.textContent="Select an enemy target.";el.append(preview);}
      else{
        const d=dist(u,target),range=u.range||BOW_RANGE,wx=W(),hy=H(),dx=(target.x-u.x)*wx,dy=(target.y-u.y)*hy,len2=dx*dx+dy*dy||1;
        const blockers=units().filter(v=>v!==u&&v!==target&&!v.attachedTo&&alive(v)).filter(v=>{const vx=(v.x-u.x)*wx,vy=(v.y-u.y)*hy,t=(vx*dx+vy*dy)/len2;if(t<=.04||t>=.96)return false;const px=u.x*wx+t*dx,py=u.y*hy+t*dy;return Math.hypot(v.x*wx-px,v.y*hy-py)<Math.max(wx,hy)/48*.8;});
        let arc=true;if(!u.skirmishing){let a=Math.atan2(dy,dx)-(u.facing||0);while(a>Math.PI)a-=Math.PI*2;while(a< -Math.PI)a+=Math.PI*2;arc=Math.abs(a)<=Math.PI/4;}
        const friendlyBlockers=blockers.filter(v=>v.side===u.side),blocked=friendlyBlockers.length>0&&u.rangedWeapon==="firearm";
        const over=blockers.length?(u.rangedWeapon==="bow"?1:2):0;
        const long=d>range/2?(u.rangedWeapon==="firearm"?2:1):0,moved=u.moved?1:0,single=(target.isCharacter||target.models===1||target.skirmishing)?1:0,charge=target.charged?1:0,cover=target.cover==="hard"?2:target.cover==="soft"?1:0;
        const reducible=long+moved+over,elfReduce=u.elvenArchery?Math.min(2,reducible):0;
        const meleePenalty=target.engaged&&!over?1:0,bs=Math.min(u.stats.BS,u.bsCap||99),need=7-bs+long+moved+over+single+charge+cover+meleePenalty-elfReduce-(target.largeTarget?1:0);
        let status=d>range?"OUT OF RANGE":!arc?"OUTSIDE FIRING ARC":blocked?"BLOCKED BY FRIENDLY UNIT": "Hit roll: "+(need>=10?"impossible (10+)":need>=7?"6, then "+(need-3)+"+":need+"+");
        preview.textContent=target.name+" · "+d.toFixed(1)+"″ / "+range+"″ · "+status+(friendlyBlockers.length&&u.rangedWeapon!=="firearm"?" · ! FRIENDLY FIRE POSSIBLE":"");
        if(friendlyBlockers.length&&u.rangedWeapon!=="firearm")preview.classList.add("friendly-fire");
        el.append(preview);
      }
    }
    if(S.phase==="deployment"){
      const placed=units().filter(v=>v.side==="player"&&v.deployed&&alive(v)).length, total=units().filter(v=>v.side==="player"&&alive(v)).length;
      btn("Rotate selected unit left 15 degrees","↶",()=>{if(u&&u.side==="player"){const f=u.facing-Math.PI/12;if(!u.deployed||validDeployment(u,u.x,u.y,f))u.facing=f;render();}},!u||u.side!=="player");
      btn("Rotate selected unit right 15 degrees","↷",()=>{if(u&&u.side==="player"){const f=u.facing+Math.PI/12;if(!u.deployed||validDeployment(u,u.x,u.y,f))u.facing=f;render();}},!u||u.side!=="player");
      if (u && u.side === "player" && u.isCharacter && !u.attachedTo) btn("Attach character to a unit","♟",()=>{S.mode=S.mode==="attachHero"?null:"attachHero";render();},false,S.mode==="attachHero");
      if (u && u.side === "player" && u.isCharacter && u.attachedTo) btn("Detach character","↗",()=>{const host=S.units[u.attachedTo];if(host){u.x=host.x+0.025;u.y=host.y+0.025;u.deployed=true;host.attachedCharacters=(host.attachedCharacters||[]).filter(id=>id!==u.id);host.stats.M=host.baseMove??host.stats.M;(host.attachedCharacters||[]).forEach(id=>{const h=S.units[id];if(h)host.stats.M=Math.min(host.stats.M,h.stats.M);});u.attachedTo=null;S.mode=null;say(u.name+" leaves "+host.name+".");render();}},false);
      btn("Start battle","▶",startBattle,placed!==total);
      return;
    }
    if (S.phase === "charges") {
      if (S.chargeSide !== "player") { btn("Opponent declaring charges", "…", () => {}, true); return; }
      btn("Flee from charge", "↗", () => fleeFromCharge(u), !u||u.side!=="player"||u.engaged||u.fled||!S.declaredCharges.some(c=>c.targetId===u.id&&!c.counterCharge&&!c.flee));
      btn(u&&u.canCounterCharge&&target&&target.charged?"Counter-charge":"Declare charge", "➜", () => { S.mode = S.mode === "charge" ? null : "charge"; render(); },
        !u || u.side !== "player" || u.engaged || u.fled || u.charged || !target || target.engaged || dist(u, target) > u.stats.M * 2, S.mode === "charge");
      btn("Pass charges", "Ⅱ", passCharges); return;
    }
    if (S.phase === "movement" && u && u.isCharacter && u.attachedTo) { const attachedHost=S.units[u.attachedTo]; if(u.hasRangedWeapon&&u.ownsShield)btn(u.rangedMode==="bow"?"Ready shield":"Ready bow",u.rangedMode==="bow"?"🛡":"🏹",()=>{if(setRangedMode(u,u.rangedMode==="bow"?"shield":"bow")){S.mode=null;render();}},u.shot||u.activated||!attachedHost||attachedHost.engaged); if(u.hasRangedWeapon)btn("Shoot","◎",()=>{S.mode=S.mode==="shoot"?null:"shoot";if(S.mode==="shoot")S.targetId=null;render();},!u.hasRangedWeapon||(u.ownsShield&&u.rangedMode!=="bow")||u.shot||u.activated||!attachedHost||attachedHost.engaged||!target||target.side===u.side,S.mode==="shoot"); btn("Detach character","↗",()=>{const host=S.units[u.attachedTo];if(host){u.x=host.x+0.025;u.y=host.y+0.025;u.deployed=true;host.attachedCharacters=(host.attachedCharacters||[]).filter(id=>id!==u.id);host.stats.M=host.baseMove??host.stats.M;(host.attachedCharacters||[]).forEach(id=>{const h=S.units[id];if(h)host.stats.M=Math.min(host.stats.M,h.stats.M);});u.attachedTo=null;S.mode=null;say(u.name+" leaves "+host.name+".");render();}},!attachedHost||attachedHost.engaged); btn("End activation","✓",finishActivation,u.activated||u.fled); return; }
    if (S.phase === "movement" && u && u.fled) { btn("Rally", "⚑", () => rallyUnit(u), u.side!=="player"); return; }
    if (S.phase === "movement" && u && u.isCharacter && !u.attachedTo) { if(u.skirmishCapable)btn(u.skirmishing?"Form ranks (½ Move)":"Skirmish formation (½ Move)","✣",()=>{const next=!u.skirmishing;if(next&&u.side==="player"&&u.faction==="empire"&&u.heavyArmour){say(u.name+" cannot adopt skirmish formation while wearing heavy armour.");return;}if(next&&u.side==="player"&&u.faction==="empire"&&u.barding){say(u.name+" cannot adopt skirmish formation while barded.");return;}if(u.moveUsed+u.stats.M/2>u.stats.M){say("Not enough movement remaining to change formation.");return;}const old=u.skirmishing;u.skirmishing=next;if(canPlace(u,u.x,u.y,u.facing)){u.moveUsed+=u.stats.M/2;u.moved=true;say(u.name+(next?" adopts skirmish stance.":" returns to normal stance.")+" (½ Move).");}else{u.skirmishing=old;say("There is not enough room to change stance here.");}render();},u.activated||u.engaged||u.fled||u.shot||u.moveUsed+u.stats.M/2>u.stats.M); btn("Attach character to a unit","♟",()=>{S.mode=S.mode==="attachHero"?null:"attachHero";render();},u.activated||u.engaged,S.mode==="attachHero"); if(u.hasRangedWeapon&&u.ownsShield)btn(u.rangedMode==="bow"?"Ready shield":"Ready bow",u.rangedMode==="bow"?"🛡":"🏹",()=>{if(setRangedMode(u,u.rangedMode==="bow"?"shield":"bow")){S.mode=null;render();}},u.activated||u.shot||u.engaged||u.charged); if(u.hasRangedWeapon)btn("Shoot","◎",()=>{S.mode=S.mode==="shoot"?null:"shoot";if(S.mode==="shoot")S.targetId=null;render();},u.activated||(u.ownsShield&&u.rangedMode!=="bow")||u.shot||u.engaged||u.charged||!target||target.side===u.side,S.mode==="shoot"); btn("End activation","✓",finishActivation,u.activated||u.fled); return; }
    if (S.phase === "movement") {
      if(u?.skirmishCapable)btn(u.skirmishing?"Form ranks (½ Move)":"Skirmish formation (½ Move)","✣",()=>{const next=!u.skirmishing;if(next&&u.side==="player"&&u.faction==="empire"&&u.heavyArmour){say(u.name+" cannot adopt skirmish formation while wearing heavy armour.");return;}if(next&&u.side==="player"&&u.faction==="empire"&&u.barding){say(u.name+" cannot adopt skirmish formation while barded.");return;}if(u.moveUsed+u.stats.M/2>u.stats.M){say("Not enough movement remaining to change formation.");return;}const old=u.skirmishing;u.skirmishing=next;if(canPlace(u,u.x,u.y,u.facing)){u.moveUsed+=u.stats.M/2;u.moved=true;say(u.name+(next?" spreads into skirmish formation.":" reforms into ranks.")+" (½ Move).");}else{u.skirmishing=old;say("There is not enough room to change formation here.");}render();},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.shot||u.moveUsed+u.stats.M/2>u.stats.M);
      btn("Move", "↔", () => { S.mode = S.mode === "move" ? null : "move"; render(); },
        !u || u.side !== "player" || u.activated || u.engaged || u.fled || u.charged || u.shot || u.moveUsed >= u.stats.M, S.mode === "move");
      const turnCost=u&&shape&&PX_PER_IN?shape(u).front/PX_PER_IN()*Math.PI/4:1;
      btn("Turn left 45° (cost "+turnCost.toFixed(1)+" Move)", "↶", () => {if(!u)return;const f=u.facing-Math.PI/4,cost=u.skirmishing?0:turnCost;if(u.moveUsed+cost>u.stats.M){say("Not enough movement remaining to turn.");return;}if(canPlace(u,u.x,u.y,f)){u.facing=f;u.moveUsed+=cost;u.moved=true;say(u.name+" turns left 45°"+(cost?" (−"+cost.toFixed(1)+" Move).":"."));render();}else say("There is not enough room to turn here.");},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.charged||u.shot||u.moveUsed+turnCost>u.stats.M);
      btn("Turn right 45° (cost "+turnCost.toFixed(1)+" Move)", "↷", () => {if(!u)return;const f=u.facing+Math.PI/4,cost=u.skirmishing?0:turnCost;if(u.moveUsed+cost>u.stats.M){say("Not enough movement remaining to turn.");return;}if(canPlace(u,u.x,u.y,f)){u.facing=f;u.moveUsed+=cost;u.moved=true;say(u.name+" turns right 45°"+(cost?" (−"+cost.toFixed(1)+" Move).":"."));render();}else say("There is not enough room to turn here.");},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.charged||u.shot||u.moveUsed+turnCost>u.stats.M);
      btn("Widen formation", "＋", () => {if(u&&u.formationWidth<Math.max(1,u.models)&&u.moveUsed+u.stats.M/2<=u.stats.M){u.formationWidth++;if(canPlace(u,u.x,u.y,u.facing)){u.moveUsed+=u.stats.M/2;u.moved=true;}else{u.formationWidth--;}render();}},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.shot||u.formationWidth>=u.models||u.moveUsed+u.stats.M/2>u.stats.M);
      btn("Narrow formation", "－", () => {if(u&&u.formationWidth>1&&u.moveUsed+u.stats.M/2<=u.stats.M){u.formationWidth--;if(canPlace(u,u.x,u.y,u.facing)){u.moveUsed+=u.stats.M/2;u.moved=true;}else{u.formationWidth++;}render();}},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.shot||u.formationWidth<=1||u.moveUsed+u.stats.M/2>u.stats.M);
      if(u?.hasRangedWeapon&&u.ownsShield)btn(u.rangedMode==="bow"?"Ready shield":"Ready bow",u.rangedMode==="bow"?"🛡":"🏹",()=>{if(setRangedMode(u,u.rangedMode==="bow"?"shield":"bow")){S.mode=null;say(u.name+(u.rangedMode==="bow"?" readies its bow; shield stowed.":" readies its shield."));render();}},!u||u.side!=="player"||u.activated||u.shot||u.engaged||u.charged);
      btn("Shoot", "◎", () => { S.mode = S.mode === "shoot" ? null : "shoot";if(S.mode==="shoot")S.targetId=null;render(); },
        !u || u.side !== "player" || u.activated || !u.hasRangedWeapon || (u.ownsShield&&u.rangedMode!=="bow") || u.shot || u.engaged || u.charged, S.mode === "shoot");
      btn("End activation", "✓", finishActivation, !u || u.side !== "player" || u.activated || u.engaged || u.fled); return;
    }
    if (S.phase === "combat") {
      const activeMelee=units().some(v=>v.engaged&&alive(v));
      btn("Resolve melee", "⚔", resolveCombat, S.combatResolved||!units().some(v => v.side === "player" && v.engaged && alive(v)));
      if(u&&u.side==="player"&&(u.engaged||(u.attachedTo&&S.units[u.attachedTo]?.engaged))){const labels={handWeapon:"hand weapon",spear:"spear (+1 Strength on charge; shield auto-equipped)",halberd:"halberd (+1 Strength)",greatWeapon:"great weapon (+2 Strength, −10 Initiative)",lance:"lance (+2 Strength on charge)"};(u.meleeWeapons||["handWeapon"]).filter(w=>["handWeapon","spear","halberd","greatWeapon","lance"].includes(w)).forEach(w=>btn("Use "+(labels[w]||w),"⚒",()=>{if(equipMeleeWeapon(u,w)){say(u.name+" equips "+(labels[w]||w)+(u.shield?" with shield":"")+".");render();}},S.combatResolved||u.fled,u.weapon===w));}
      btn("End turn", "▶", endTurn, !S.combatResolved); return;
    }
    if (S.phase === "break") btn("Break test", "🎲", resolveBreak);
  }
  $("logtoggle").onclick = () => $("logpanel").classList.add("open");
  $("logclose").onclick = () => $("logpanel").classList.remove("open");
  $("rollclose").onclick = () => $("rollview").classList.remove("show");
  return { render };
}
