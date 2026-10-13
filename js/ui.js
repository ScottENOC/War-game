export function createUI({ S, $, units, alive, draw, BOW_RANGE, selectedTarget, dist, passCharges, finishActivation, resolveCombat, endTurn, resolveBreak, reset, validDeployment, canPlace, rallyUnit, fleeFromCharge, startBattle }) {
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
    if (S.phase === "movement" && u && u.isCharacter && u.attachedTo) { const attachedHost=S.units[u.attachedTo]; if(u.hasRangedWeapon)btn("Shoot","◎",()=>{S.mode=S.mode==="shoot"?null:"shoot";render();},!u.hasRangedWeapon||u.shot||u.activated||!attachedHost||attachedHost.engaged||!target||target.side===u.side,S.mode==="shoot"); btn("Detach character","↗",()=>{const host=S.units[u.attachedTo];if(host){u.x=host.x+0.025;u.y=host.y+0.025;u.deployed=true;host.attachedCharacters=(host.attachedCharacters||[]).filter(id=>id!==u.id);host.stats.M=host.baseMove??host.stats.M;(host.attachedCharacters||[]).forEach(id=>{const h=S.units[id];if(h)host.stats.M=Math.min(host.stats.M,h.stats.M);});u.attachedTo=null;S.mode=null;say(u.name+" leaves "+host.name+".");render();}},!attachedHost||attachedHost.engaged); btn("End activation","✓",finishActivation,u.activated||u.fled); return; }
    if (S.phase === "movement" && u && u.fled) { btn("Rally", "⚑", () => rallyUnit(u), u.side!=="player"); return; }
    if (S.phase === "movement" && u && u.isCharacter && !u.attachedTo) { btn("Attach character to a unit","♟",()=>{S.mode=S.mode==="attachHero"?null:"attachHero";render();},u.activated||u.engaged,S.mode==="attachHero"); if(u.hasRangedWeapon)btn("Shoot","◎",()=>{S.mode=S.mode==="shoot"?null:"shoot";render();},u.activated||u.shot||u.engaged||u.charged||!target||target.side===u.side,S.mode==="shoot"); btn("End activation","✓",finishActivation,u.activated||u.fled); return; }
    if (S.phase === "movement") {
      btn("Move", "↔", () => { S.mode = S.mode === "move" ? null : "move"; render(); },
        !u || u.side !== "player" || u.activated || u.engaged || u.fled || u.charged || u.shot || u.moveUsed >= u.stats.M, S.mode === "move");
      btn("Widen formation", "＋", () => {if(u&&u.formationWidth<Math.max(1,u.models)&&u.moveUsed+u.stats.M/2<=u.stats.M){u.formationWidth++;if(canPlace(u,u.x,u.y,u.facing)){u.moveUsed+=u.stats.M/2;u.moved=true;}else{u.formationWidth--;}render();}},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.shot||u.formationWidth>=u.models||u.moveUsed+u.stats.M/2>u.stats.M);
      btn("Narrow formation", "－", () => {if(u&&u.formationWidth>1&&u.moveUsed+u.stats.M/2<=u.stats.M){u.formationWidth--;if(canPlace(u,u.x,u.y,u.facing)){u.moveUsed+=u.stats.M/2;u.moved=true;}else{u.formationWidth++;}render();}},!u||u.side!=="player"||u.activated||u.engaged||u.fled||u.shot||u.formationWidth<=1||u.moveUsed+u.stats.M/2>u.stats.M);
      btn("Shoot", "◎", () => { S.mode = S.mode === "shoot" ? null : "shoot"; render(); },
        !u || u.side !== "player" || u.activated || !u.hasRangedWeapon || u.shot || u.engaged || u.charged, S.mode === "shoot");
      btn("End activation", "✓", finishActivation, !u || u.side !== "player" || u.activated || u.engaged || u.fled); return;
    }
    if (S.phase === "combat") {
      const activeMelee=units().some(v=>v.engaged&&alive(v));
      btn("Resolve melee", "⚔", resolveCombat, S.combatResolved||!units().some(v => v.side === "player" && v.engaged && alive(v)));
      if(u&&u.isCharacter&&u.side==="player"){const weaponOrder=u.mounted?["handWeapon","halberd","greatWeapon","spear","lance"]:["handWeapon","halberd","greatWeapon"],weaponLabels={handWeapon:"hand weapon",halberd:"halberd (+1 Strength)",greatWeapon:"great weapon (+2 Strength, −10 Initiative)",spear:"spear (+1 Strength on charge)",lance:"lance (+2 Strength on charge)"};const nextWeapon=weaponOrder[(weaponOrder.indexOf(u.weapon)+1)%weaponOrder.length];btn("Switch to "+weaponLabels[nextWeapon],"⚒",()=>{u.weapon=nextWeapon;u.greatWeapon=nextWeapon==="greatWeapon";say(u.name+" switches to a "+weaponLabels[u.weapon]+" for the next combat.");render();},!S.combatResolved||u.fled);}
      btn("End turn", "▶", endTurn, !S.combatResolved); return;
    }
    if (S.phase === "break") btn("Break test", "🎲", resolveBreak);
  }
  $("logtoggle").onclick = () => $("logpanel").classList.add("open");
  $("logclose").onclick = () => $("logpanel").classList.remove("open");
  $("rollclose").onclick = () => $("rollview").classList.remove("show");
  return { render };
}
