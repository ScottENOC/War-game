import { unitCost } from "./units.js?v=20261020-thaurgath-v2";

const STORAGE_KEY = "warGameWarbandExpeditionV1";
const MAX_FIGHTERS = 8;
const START_FIGHTERS = 5;
const CHARACTER_TYPES = new Set(["captain","mageHero","necromancer","vampireHero","dwarfCaptain","goblinHero","orcHero","captainWeiss","rifleman"]);
const FORBIDDEN = new Set(["lord","mageLord","starwardenLord","masterNecromancer","vampireLord","legendaryLord","shadowElf","pegasusChampion","dwarfLord","dwarfKingHaldric","goblinLord","orcLord","goblinGreatShaman","orcGreatShaman","humanChariot","elfChariot","goblinChariot","orcChariot","skeletonChariot","youngDragon","dragon","ancientDragon","deepflameDragon","skeletonDragon","giant","skeletonGiant","wyvern","cannon","boltThrower","catapult"]);
const RANGED = new Set(["bow","crossbow","firearm","longRifle","magicBow"]);
const NEW_RUN = () => ({ version: 1, state: "setup", round: 1, bank: 0, faction: "empire", fighters: [], nextFighterId: 1, lastResult: "", fights: 0 });

function fighterFromModel(m, id) {
  const weapon = m.weapon || "handWeapon";
  const rangedWeapon = RANGED.has(weapon) ? weapon : (m.backWeapons || []).find(w => RANGED.has(w)) || null;
  const meleeWeapons = [...new Set([weapon, ...(m.offhandWeapon ? ["offhandWeapon"] : []), ...(m.backWeapons || []).filter(w => !RANGED.has(w))].filter(w => !RANGED.has(w)))];
  return {
    id, collectionId: m.id, name: m.name || (m.faction + " " + m.type), faction: m.faction, type: m.type,
    weapon: RANGED.has(weapon) ? "handWeapon" : weapon, meleeWeapons: meleeWeapons.length ? meleeWeapons : ["handWeapon"],
    rangedWeapon, mounted: !!m.mounted, mountType: m.mountType || "none", shield: !!m.shield,
    lightArmour: !!m.lightArmour, heavyArmour: !!m.heavyArmour, offhandWeapon: !!m.offhandWeapon,
    backWeapons: [...(m.backWeapons || [])], models: 1, xp: 0, upgrades: {}, skills: {},
    injuries: { leg: false, leftArm: false }, benchFights: 0, alive: true
  };
}
const costOf = (f, faction) => Math.max(1, Math.round(Number(unitCost({ ...f, models: 1 }, faction || f.faction)) || (CHARACTER_TYPES.has(f.type) ? 45 : 8)));
const clone = x => JSON.parse(JSON.stringify(x));

export function createWarbandExpedition({ $, getInventory, getBypass, startBattle }) {
  let run = read();
  const el = id => $(id);
  function read() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); return saved && saved.version === 1 ? { ...NEW_RUN(), ...saved } : NEW_RUN(); } catch { return NEW_RUN(); } }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(run)); } catch {} }
  function hide() { el("warband-expedition-screen").hidden = true; }
  function show() {
    for (const id of ["mainmenu","mode-screen","campaign-screen","roguelike-screen","mordheim-screen","collection-screen","armybuilder","game"]) if (el(id)) el(id).hidden = true;
    el("warband-expedition-screen").hidden = false;
  }
  const inventory = () => (getInventory() || []).filter(m => m && m.faction === run.faction && !m.namedCharacter && !m.isNamedCharacter && !m.legendary && !FORBIDDEN.has(m.type) && !["eagle","greatEagle","wyvern","youngDragon","dragon","ancientDragon","deepflameDragon","skeletonDragon"].includes(m.mountType) && !m.siegeMachine && !m.type.toLowerCase().includes("chariot"));
  function configFor(f) {
    const cfg = { ...clone(f), models: 1, name: f.name, isWarbandExpeditionFighter: true };
    if (f.injuries?.leg) cfg.campaignStats = { ...(cfg.campaignStats || {}), M: (cfg.campaignStats?.M || 0) };
    return cfg;
  }
  function open() { run = read(); if(run.state==="battle"){run.state="ready";run.lastResult="The unfinished battle was abandoned. No casualties or rewards were recorded.";save();} show(); render(); el("warband-expedition-menu").onclick=()=>{hide();el("mainmenu").hidden=false;}; }
  function render() {
    const title = el("warband-expedition-title"), desc = el("warband-expedition-description"), content = el("warband-expedition-content"), shop = el("warband-expedition-shop"), actions = el("warband-expedition-actions");
    content.replaceChildren(); shop.replaceChildren(); actions.replaceChildren();
    title.textContent = run.state === "setup" ? "Warband Expedition" : "Warband Expedition · Fight " + run.round;
    desc.textContent = run.state === "setup" ? "Choose five individual fighters from your collection to begin. Keep survivors, earn experience, and manage permanent injuries." : "Fight " + run.round + " · " + run.bank + " points saved · " + run.fighters.filter(f => f.alive).length + " living fighters. Victories earn 50 points; save them or recruit and equip fighters.";
    if (run.lastResult) { const p = document.createElement("p"); p.className = "campaign-mission"; p.textContent = run.lastResult; content.append(p); }
    const roster = document.createElement("div"); roster.className = "campaign-roster";
    run.fighters.forEach(f => {
      const row = document.createElement("div"); row.className = "warband-fighter-row";
      const info = document.createElement("div"); const name = document.createElement("b"); name.textContent = f.name + (f.alive ? "" : " · Dead"); const detail = document.createElement("span");
      const injuries = [f.injuries?.leg ? "lost leg (−1 Move)" : "", f.injuries?.leftArm ? "left arm lost" : "", f.benchFights > 0 ? "unavailable for " + f.benchFights + " fight(s)" : ""].filter(Boolean);
      detail.textContent = "XP " + (f.xp || 0) + "/4 · " + (f.alive ? costOf(f, run.faction) + " pts" : "dead") + (injuries.length ? " · " + injuries.join(" · ") : "");
      info.append(name, detail); row.append(info);
      if (run.state !== "setup" && f.alive) {
        if ((Number(f.xp)||0) >= 4) {
          const upgrades = document.createElement("div"); upgrades.className = "warband-gear";
          [["M","+1 Movement"],["WS","+1 Weapon Skill"],["BS","+1 Ballistic Skill"],["S","+1 Strength"],["T","+1 Toughness"],["I","+1 Initiative"],["Ld","+1 Leadership"]].forEach(([stat,label]) => {
            const btn=document.createElement("button");btn.className="secondary-button";btn.textContent="XP upgrade: "+label;btn.addEventListener("click",()=>applyExperienceUpgrade(f.id,stat));upgrades.append(btn);
          });
          row.append(upgrades);
        }
        const gear = document.createElement("div"); gear.className = "warband-gear";
        const choices = [
          ["lightArmour", "Light armour", 3, !f.lightArmour && !f.heavyArmour],
          ["heavyArmour", "Heavy armour", 7, !f.heavyArmour],
          ["shield", "Shield", 3, !f.shield && !f.injuries?.leftArm && !["greatWeapon","halberd","bow","crossbow","firearm"].includes(f.weapon)],
          ["greatWeapon", "Great weapon", 6, !f.injuries?.leftArm && !f.shield && !f.offhandWeapon && f.weapon !== "greatWeapon"],
          ["offhandWeapon", "Second sword", 5, !f.injuries?.leftArm && !f.shield && !["greatWeapon","halberd","bow","crossbow","firearm"].includes(f.weapon) && !f.offhandWeapon]
        ];
        choices.forEach(([key,label,cost,allowed]) => { if (!allowed) return; const btn = document.createElement("button"); btn.className = "secondary-button"; btn.textContent = label + " · " + cost; btn.disabled = run.bank < cost; btn.addEventListener("click", () => buyEquipment(f.id,key,cost)); gear.append(btn); });
        row.append(gear);
      }
      roster.append(row);
    });
    content.append(roster);
    if (run.state === "setup") {
      const factionLabel = document.createElement("label"); factionLabel.className = "faction-choice"; factionLabel.textContent = "Faction ";
      const select = document.createElement("select"); select.id = "warband-expedition-faction";
      [["empire","Humans"],["highElves","High Elves"],["dwarfs","Dwarfs"],["greenskins","Greenskins"],["undead","Undead"]].forEach(([value,label]) => { const o=document.createElement("option");o.value=value;o.textContent=label;select.append(o); });
      select.value = run.faction; select.addEventListener("change",()=>{run.faction=select.value;run.fighters=[];save();render();}); content.prepend(factionLabel); factionLabel.append(select);
      const models = inventory(); const picked = new Set(run.fighters.map(f=>f.collectionId));
      const list = document.createElement("div"); list.className = "mordheim-model-list";
      models.forEach(m => { const label=document.createElement("label");label.className="mordheim-model-row";const check=document.createElement("input");check.type="checkbox";check.checked=picked.has(m.id);check.addEventListener("change",()=>{if(check.checked){if(run.fighters.length>=START_FIGHTERS){check.checked=false;return;}run.fighters.push(fighterFromModel(m,"fighter-"+run.nextFighterId++));}else run.fighters=run.fighters.filter(f=>f.collectionId!==m.id);save();render();});const span=document.createElement("span");span.textContent=m.name||m.type;const cost=document.createElement("strong");cost.textContent=costOf(fighterFromModel(m,"preview"),run.faction)+" pts";label.append(check,span,cost);list.append(label); });
      content.append(list);
      const start=document.createElement("button");start.className="primary-button";start.textContent="Begin expedition";start.disabled=run.fighters.length!==START_FIGHTERS;start.addEventListener("click",()=>{if(run.fighters.length!==START_FIGHTERS)return;run.state="ready";run.round=1;run.bank=0;run.lastResult="Your expedition begins with five fighters.";save();startNextBattle();});actions.append(start);
      const note=document.createElement("p");note.className="subtle";note.textContent="Choose exactly five fighters. Models must be in your collection; this mode does not consume the physical collection models.";content.append(note);
      return;
    }
    const available = inventory().filter(m => !run.fighters.some(f => f.collectionId === m.id && f.alive));
    const shopTitle=document.createElement("h2");shopTitle.textContent="Recruit from your collection";shop.append(shopTitle);
    const shopIntro=document.createElement("p");shopIntro.className="subtle";shopIntro.textContent="Recruit an available miniature for its point cost. The model stays in your collection, but this fighter's injuries and experience persist in this expedition.";shop.append(shopIntro);
    const recruitList=document.createElement("div");recruitList.className="mordheim-model-list";
    available.slice(0,100).forEach(m=>{const row=document.createElement("div");row.className="mordheim-model-row";const span=document.createElement("span");span.textContent=m.name||m.type;const price=costOf(fighterFromModel(m,"preview"),run.faction);const btn=document.createElement("button");btn.className="secondary-button";btn.textContent="Recruit · "+price;btn.disabled=run.bank<price||run.fighters.filter(f=>f.alive).length>=MAX_FIGHTERS;btn.addEventListener("click",()=>{if(run.bank<price||run.fighters.filter(f=>f.alive).length>=MAX_FIGHTERS)return;run.bank-=price;run.fighters.push(fighterFromModel(m,"fighter-"+run.nextFighterId++));run.lastResult="Recruited "+(m.name||m.type)+" for "+price+" points.";save();render();});row.append(span,btn);recruitList.append(row);});
    if(!available.length){const p=document.createElement("p");p.className="subtle";p.textContent="No unassigned eligible miniatures are available to recruit.";recruitList.append(p);}shop.append(recruitList);
    const next=document.createElement("button");next.className="primary-button";next.textContent="Fight next battle";next.disabled=!run.fighters.some(f=>f.alive&&f.benchFights===0);next.addEventListener("click",startNextBattle);actions.append(next);
    const menu=document.createElement("button");menu.className="secondary-button";menu.textContent="Main Menu";menu.addEventListener("click",()=>{hide();el("mainmenu").hidden=false;});actions.append(menu);
    const abandon=document.createElement("button");abandon.className="danger-button";abandon.textContent="Abandon expedition";abandon.addEventListener("click",()=>{if(!window.confirm("Abandon this expedition and lose its roster, points and experience?"))return;run=NEW_RUN();save();render();});actions.append(abandon);
  }
  function applyExperienceUpgrade(id, stat) {
    const f=run.fighters.find(x=>x.id===id);if(!f||!f.alive||(Number(f.xp)||0)<4)return;
    f.xp-=4;f.campaignStats=f.campaignStats||{};f.campaignStats[stat]=(Number(f.campaignStats[stat])||0)+1;
    run.lastResult=f.name+" earned "+({M:"+1 Movement",WS:"+1 Weapon Skill",BS:"+1 Ballistic Skill",S:"+1 Strength",T:"+1 Toughness",I:"+1 Initiative",Ld:"+1 Leadership"}[stat])+" for 4 XP.";
    save();render();
  }
  function buyEquipment(id,key,cost) {
    const f=run.fighters.find(x=>x.id===id);if(!f||!f.alive||run.bank<cost)return;
    if(f.injuries?.leftArm && ["shield","greatWeapon","offhandWeapon"].includes(key))return;
    run.bank-=cost;
    if(key==="greatWeapon"){f.weapon="greatWeapon";f.meleeWeapons=["greatWeapon"];f.shield=false;f.offhandWeapon=false;}
    else if(key==="offhandWeapon"){f.offhandWeapon=true;f.meleeWeapons=[...new Set([...(f.meleeWeapons||[]),"offhandWeapon"])];}
    else f[key]=true;
    run.lastResult=f.name+" bought "+(key==="offhandWeapon"?"a second sword":key==="greatWeapon"?"a great weapon":key==="lightArmour"?"light armour":key==="heavyArmour"?"heavy armour":"a shield")+" for "+cost+" points.";
    save();render();
  }
  function startNextBattle() {
    const active=run.fighters.filter(f=>f.alive&&f.benchFights===0);
    if(!active.length){
      const living=run.fighters.filter(f=>f.alive);
      if(living.length&&living.some(f=>f.benchFights>0)){living.forEach(f=>{f.benchFights=Math.max(0,(Number(f.benchFights)||0)-1);});run.round++;run.fights++;run.lastResult="Your available fighters are recovering. The expedition loses a round while the injured warband waits.";save();render();return;}
      run.lastResult="No available fighters. Recruit reinforcements before the next battle.";save();render();return;
    }
    run.state="battle";save();hide();
    startBattle(active.map(configFor),run.faction,run.round);
  }
  function onBattleFinished(won, units, kills=0) {
    const battleById=new Map((units||[]).filter(u=>u.side==="player").map(u=>[u.warbandFighterId||u.id,u]));
    let casualtyReports=[];
    run.fighters.forEach(f=>{
      if(!f.alive)return;
      const u=battleById.get(f.id);
      if(!u){if(f.benchFights>0)f.benchFights=Math.max(0,f.benchFights-1);return;}
      if(u.warbandXpEarned)f.xp=(Number(f.xp)||0)+(Number(u.warbandXpEarned)||0);
      if(u.mordheimStatus==="outOfAction"||u.models<=0){
        const roll=()=>1+Math.floor(Math.random()*6);
        let result=roll(),tries=0;
        while((result===3&&f.injuries?.leg)||(result===4&&f.injuries?.leftArm))result=roll();
        if(result===1){f.benchFights=Math.max(Number(f.benchFights)||0,1);casualtyReports.push(f.name+": misses the next fight (roll 1).");}
        else if(result===2){f.benchFights=Math.max(Number(f.benchFights)||0,2);casualtyReports.push(f.name+": misses the next two fights (roll 2).");}
        else if(result===3){f.injuries=f.injuries||{};f.injuries.leg=true;casualtyReports.push(f.name+": loses a leg; Move −1 (roll 3).");}
        else if(result===4){f.injuries=f.injuries||{};f.injuries.leftArm=true;f.shield=false;f.offhandWeapon=false;if(["greatWeapon","halberd","bow","crossbow","firearm"].includes(f.weapon)){f.weapon="handWeapon";f.meleeWeapons=["handWeapon"];}f.rangedWeapon=null;casualtyReports.push(f.name+": loses the left arm and can no longer use two-handed weapons, shields or dual wield (roll 4).");}
        else {f.alive=false;casualtyReports.push(f.name+": dies permanently (roll "+result+").");}
      } else if(u.mordheimStatus==="stunned"||u.mordheimStatus==="unconscious") {
        f.woundsCurrent=1;
      } else if(u.models>0) {
        f.woundsCurrent=Math.max(1,Number(u.characterWounds)||Number(u.stats?.W)||1);
      }
    });
    const gained=won?50:0;run.bank+=gained;run.fights=(Number(run.fights)||0)+1;run.round++;
    const survivors=run.fighters.filter(f=>f.alive);
    if(!survivors.length){run.state="defeat";run.lastResult="The warband has been wiped out. This expedition is over. "+casualtyReports.join(" ");save();show();render();return;}
    run.state="ready";
    run.lastResult=(won?"Victory":"Defeat")+" in fight "+(run.round-1)+". "+(kills||0)+" opposing fighter(s) removed; experience is awarded to the closest active fighter when a foe is taken out. "+(gained?"Earned 50 points. ":"No points awarded for defeat. ")+casualtyReports.join(" ");
    save();show();render();
  }
  function awardExperience(unit, count=1) { if(unit) unit.warbandXpEarned=(Number(unit.warbandXpEarned)||0)+Math.max(0,count); }
  function startNewRun() { run=NEW_RUN();save();show();render(); }
  return { open, onBattleFinished, awardExperience, getRun:()=>clone(run), startNewRun };
}
