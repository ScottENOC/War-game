const STORAGE_KEY="warGameRoguelikeV1";
const skillChoices=[
 {key:"rerollOnesMelee",label:"Melee Mastery",description:"Reroll natural 1s to hit in melee."},
 {key:"rerollOnesShooting",label:"Marksman",description:"Reroll natural 1s to hit when shooting."},
 {key:"steadfast",label:"Steadfast",description:"Ignore combat-result penalties on break tests."},
 {key:"skirmish",label:"Skirmish",description:"Gain skirmisher movement and 360° shooting."}
];
const blankRun=()=>({round:1,bank:0,army:null,faction:"empire",state:"setup",pendingSkills:[],lastResult:null,lostModels:[],completedFights:0});
const freshProgress=()=>({unlockedRounds:[]});
const veteranStats=[{key:"M",label:"+1 Movement"},{key:"WS",label:"+1 Weapon Skill"},{key:"BS",label:"+1 Ballistic Skill"},{key:"S",label:"+1 Strength"},{key:"T",label:"+1 Toughness"},{key:"I",label:"+1 Initiative"},{key:"Ld",label:"+1 Leadership"}];
export function createRoguelike({$,onBuildArmy,onStartBattle,onReturnMenu,grantModel,grantLootbox,calculatePoints,resetProgress}){
 let progress=readProgress(),run=readRun()||blankRun();
 const el=id=>$(id);
 function readRun(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return x&&typeof x==="object"?x:null;}catch{return null;}}
 function readProgress(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY+"Progress")||"null");return x&&Array.isArray(x.unlockedRounds)?x:freshProgress();}catch{return freshProgress();}}
 const save=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(run));localStorage.setItem(STORAGE_KEY+"Progress",JSON.stringify(progress));};
 const hide=()=>{el("roguelike-screen").hidden=true;};
 function show(){el("mainmenu").hidden=true;el("mode-screen").hidden=true;el("campaign-screen").hidden=true;el("collection-screen").hidden=true;el("armybuilder").hidden=true;el("game").hidden=true;el("roguelike-screen").hidden=false;}
 function open(){run=readRun()||blankRun();progress=readProgress();if(run.state==="battle"){run.state="ready";run.lastResult="The unfinished battle was abandoned. No casualties or rewards were recorded.";save();}show();render();}
 function stageForRound(round){if(round%5!==0)return {battleType:"skirmish",siegeRole:"attacker",baseAllowance:500+(round-1)*100,enemyAllowance:500+(round-1)*100};const siegeIndex=Math.floor(round/5);const siegeRole=siegeIndex%2===1?"attacker":"defender";const baseAllowance=500+(round-1)*100;return {battleType:"siege",siegeRole,baseAllowance,enemyAllowance:Math.round(baseAllowance*(siegeRole==="defender"?1.5:1/1.5))};}
 function render(){
  el("roguelike-title").textContent=run.state==="defeat"?"Expedition Lost":"Roguelike Expedition";
  const stage=stageForRound(run.round);
  el("roguelike-description").textContent=run.state==="setup"?"Choose a 1,000-point army from models you own. Enemy skirmish armies grow by 100 points per round, with sieges every fifth round.":run.state==="defeat"?"Your army has no surviving units. This run is over. Start a new expedition to try again.":"Round "+run.round+" · "+(stage.battleType==="siege"?"Siege — you are the "+stage.siegeRole+". ":"Skirmish. ")+"Reinforcement points: "+run.bank+" · Enemy allowance: "+stage.enemyAllowance+" points"+(stage.battleType==="siege"?" (base "+stage.baseAllowance+", adjusted for siege balance).":"")+".";

  const host=el("roguelike-content");host.replaceChildren();el("roguelike-skills").replaceChildren();
  if(run.state==="setup"){
   host.innerHTML='<p class="campaign-mission">Start with 1,000 points. Survivors retain their casualties, wounds and earned skills. You gain 50 reinforcement points after each victory.</p>';
   el("roguelike-start").hidden=false;el("roguelike-start").textContent=run.army?"Resume army selection":"Choose Starting Army";el("roguelike-continue").hidden=true;return;
  }
  const army=Array.isArray(run.army)?run.army:[];
  const roster=document.createElement("div");roster.className="campaign-roster";
  army.forEach(u=>{const row=document.createElement("div");const name=document.createElement("b");name.textContent=u.name||u.type;const detail=document.createElement("span");const learned=Object.keys(u.skills||{}).filter(k=>u.skills[k]);const stats=Object.entries(u.campaignStats||{}).filter(([,v])=>v).map(([k,v])=>"+"+v+" "+k);detail.textContent=(u.models||0)+" models"+(learned.length?" · "+learned.join(", "):"")+(stats.length?" · "+stats.join(", "):"");row.append(name,detail);roster.append(row);});
  host.append(roster);
  if(run.lastResult){const p=document.createElement("p");p.className="campaign-mission";p.textContent=run.lastResult;host.prepend(p);}
  if(run.state==="skills"){
   const skillsHost=el("roguelike-skills");
   run.pendingSkills.forEach((unit,i)=>{
    const card=document.createElement("section");card.className="campaign-upgrade-card";
    const h=document.createElement("h2");h.textContent=unit.name||unit.type;card.append(h);
    const group=document.createElement("div");group.className="campaign-choice-list";
    const hasRanged=!!unit.rangedWeapon||unit.type==="archers"||unit.type==="shadowElf"||unit.type==="rifleman"||(unit.type==="cavalry"&&(unit.bow||unit.freeCavalryOption==="bow"));
    const available=skillChoices.filter(s=>!unit.skills?.[s.key]&&(s.key!=="rerollOnesShooting"||hasRanged));
    const earnedStats=veteranStats.filter(s=>!(Number(unit.campaignStats?.[s.key])>0)).map(s=>({key:"veteran_"+s.key,label:s.label,description:"Earn a permanent +1 characteristic bonus through victory."}));
    const choices=[...available,...earnedStats];
    choices.forEach((s,j)=>{const label=document.createElement("label");label.className="campaign-choice";const radio=document.createElement("input");radio.type="radio";radio.name="rogue-skill-"+i;radio.value=s.key;const copy=document.createElement("span");copy.innerHTML="<b>"+s.label+"</b><small>"+(s.description||"")+"</small>";label.append(radio,copy);group.append(label);});
    card.append(group);skillsHost.append(card);
   });
   el("roguelike-start").hidden=true;el("roguelike-continue").hidden=false;el("roguelike-continue").textContent="Apply skills and prepare next round";return;
  }
  el("roguelike-start").hidden=false;el("roguelike-start").textContent=run.state==="defeat"?"Start New Expedition":"Reinforce / Change Army";el("roguelike-continue").hidden=true;
 }
 function chooseArmy(){
  if(run.state==="defeat")run=blankRun();
  const initial=run.army?run.army.map(u=>({...u,skills:{...(u.skills||{})},upgrades:{...(u.upgrades||{})},meleeWeapons:[...(u.meleeWeapons||[])]})):null;
  const existingPoints=Number(run.rosterPoints)||0;
  const cap=run.state==="setup"&&!initial?1000:Math.max(0,existingPoints+run.bank);
  save();hide();onBuildArmy(initial,cap,run.faction||"empire");
 }
 function rosterChangeError(army,faction){
  const previous=Array.isArray(run.army)?run.army:[];
  if(!previous.length)return null;
  if(faction!==run.faction)return "You cannot change faction during an expedition.";
  if(army.length<previous.length)return "Veteran units cannot be dismissed. Casualties are permanent; add new units only with available points.";
  for(let i=0;i<previous.length;i++){
   const old=previous[i],next=army[i];
   if(!next||next.type!==old.type)return "Existing units cannot be replaced or changed into a different unit type.";
   if((Number(next.models)||1)<(Number(old.models)||1))return "You cannot remove surviving models from a veteran unit.";
   for(const key of ["champion","lightArmour","heavyArmour","magicArmour","shield","barding","elvenArchery","bow","mounted"]){if(old[key]&&!next[key]&&!(key==="heavyArmour"&&next.magicArmour))return "Existing equipment and upgrades cannot be removed from a veteran unit.";}
   if(old.champion&&old.championBonus&&next.championBonus!==old.championBonus)return "A veteran champion bonus cannot be changed.";
   for(const key of Object.keys(old.upgrades||{}))if(old.upgrades[key]&&!next.upgrades?.[key])return "Existing stat upgrades cannot be removed.";
   for(const key of Object.keys(old.skills||{}))if(old.skills[key]&&!next.skills?.[key])return "Earned skills cannot be removed.";
   if(old.rangedWeapon&&next.rangedWeapon!==old.rangedWeapon)return "Existing ranged weapons cannot be replaced.";
   if(old.mounted&&next.mountType!==old.mountType)return "A veteran model's mount cannot be changed.";
   if(old.type==="cavalry"&&run.faction==="highElves"&&old.freeCavalryOption&&next.freeCavalryOption!==old.freeCavalryOption)return "A veteran cavalry unit's free equipment cannot be changed.";
   const oldWeapons=[...new Set([...(old.meleeWeapons||[]),...(old.weapon&&old.weapon!=="handWeapon"?[old.weapon]:[])])];
   const nextWeapons=[...new Set([...(next.meleeWeapons||[]),...(next.weapon&&next.weapon!=="handWeapon"?[next.weapon]:[])])];
   if(oldWeapons.some(w=>!nextWeapons.includes(w)))return "Existing melee weapons cannot be removed.";
   if(calculatePoints&&calculatePoints([next],faction)<calculatePoints([old],faction))return "Existing units cannot be downgraded to recover points.";
  }
  return null;
 }
 function startBattle(army,faction,armyPoints){
  const previous=Array.isArray(run.army)?run.army:[],previousPoints=Number(run.rosterPoints)||0;
  const changeError=rosterChangeError(army,faction);if(changeError){const note=el("roster-validation");if(note){note.textContent=changeError;note.classList.add("invalid");note.classList.remove("valid");}return;}
  if(run.state==="setup"&&!previous.length&&armyPoints>1000){show();el("roguelike-description").textContent="Your starting army must not exceed 1,000 points.";return;}
  const spend=Math.max(0,armyPoints-previousPoints);if(previous.length&&spend>run.bank){show();el("roguelike-description").textContent="That roster costs more than your available reinforcement points.";return;}
  run.bank=Math.max(0,run.bank-spend);run.army=army.map((u,i)=>({...u,id:"rogue-"+i,skills:{...(u.skills||{})},upgrades:{...(u.upgrades||{})}}));run.faction=faction;run.rosterPoints=armyPoints;run.state="battle";run.lastResult=null;save();const stage=stageForRound(run.round);onStartBattle(run.army,faction,run.round,stage.baseAllowance,stage.battleType,stage.siegeRole);
 }
 function onBattleFinished(won,units){
  run.lostModels=Array.isArray(run.lostModels)?run.lostModels:[];
  run.army.forEach((cfg,i)=>{
   const id="p"+(i+1),u=units.find(x=>x.id===id);
   if(!u||cfg.type==="cannon"||cfg.type==="boltThrower"||["youngDragon","dragon","ancientDragon"].includes(cfg.type))return;
   let lost=Math.max(0,(Number(cfg.models)||1)-(Number(u.models)||0));
   if(cfg.type==="lord"&&["youngDragon","dragon","ancientDragon"].includes(cfg.mountType)){const rider=units.find(x=>x.id===id+"r");lost=rider&&rider.models>0?0:1;}
   if(!lost)return;
   const character=["captain","lord","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric"].includes(cfg.type);
   const kind=character?"character":cfg.type==="cavalry"?"cavalry":"infantry";
   const loss={kind,faction:run.faction,type:cfg.type,mounted:!!cfg.mounted,mountType:cfg.mountType||(cfg.mounted?"horse":"none"),count:lost};
   const same=run.lostModels.find(x=>x.kind===loss.kind&&x.faction===loss.faction&&x.type===loss.type&&x.mounted===loss.mounted&&x.mountType===loss.mountType);
   if(same)same.count+=lost;else run.lostModels.push(loss);
  });
  const surviving=run.army.map((cfg,i)=>{
   const id="p"+(i+1),u=units.find(x=>x.id===id);
   if(cfg.type==="lord"&&["youngDragon","dragon","ancientDragon"].includes(cfg.mountType)){
    const rider=units.find(x=>x.id===id+"r");
    const hostAlive=!!u&&u.models>0,riderAlive=!!rider&&rider.models>0;
    if(hostAlive&&riderAlive)return {...cfg,models:1,currentDamage:u.damage||0,currentWounds:rider.characterWounds??rider.stats.W,currentArtilleryWounds:null,skills:{...(cfg.skills||{})},upgrades:{...(cfg.upgrades||{})}};
    if(hostAlive&&!riderAlive)return {...cfg,type:cfg.mountType,models:1,mounted:false,mountType:"none",currentDamage:u.damage||0,currentWounds:null,currentArtilleryWounds:null,skills:{},upgrades:{}};
    if(!hostAlive&&riderAlive)return {...cfg,mounted:false,mountType:"none",models:1,currentDamage:0,currentWounds:rider.characterWounds??rider.stats.W,currentArtilleryWounds:null,skills:{...(cfg.skills||{})},upgrades:{...(cfg.upgrades||{})}};
    return null;
   }
   if(!u||u.models<=0)return null;
   return {...cfg,models:u.models,currentDamage:u.damage||0,currentWounds:u.isCharacter?(u.characterWounds??u.stats.W):null,currentArtilleryWounds:u.isSiegeEngine?(u.artilleryWounds??null):null,skills:{...(cfg.skills||u.skills||{})},upgrades:{...(cfg.upgrades||{})}};
  }).filter(Boolean);
  run.army=surviving;
  if(!surviving.length){run.state="defeat";run.lastResult="Defeat. No units survived; this expedition has ended.";save();show();render();return;}
  if(!won){run.state="ready";run.rosterPoints=calculatePoints?calculatePoints(run.army,run.faction):run.rosterPoints;run.lastResult="Battle lost. Surviving troops retreat; no rewards are granted, and round "+run.round+" must still be won.";save();show();render();return;}
  const completed=run.round,first=!progress.unlockedRounds.includes(completed);
  let rewards=[];
  if(first){const category=completed%10===0?"character":completed%5===0?"cavalry":"infantry";const reward=grantModel(category,completed);if(reward)rewards.push("Unlocked "+reward+" (first victory at round "+completed+").");progress.unlockedRounds.push(completed);}
  const completedFight=(Number(run.completedFights)||0)+1;run.completedFights=completedFight;
  if((completedFight<=10&&completedFight%2===0)||completedFight>10){grantLootbox("roguelike");rewards.push("One lootbox earned.");}
  run.rosterPoints=calculatePoints?calculatePoints(run.army,run.faction):run.rosterPoints;run.bank+=50;run.round++;run.state="skills";run.pendingSkills=surviving.map((u,i)=>({...u,_sourceIndex:i}));run.lastResult="Victory in round "+completed+". "+rewards.join(" ")+" Gained 50 reinforcement points.";
  save();show();render();
 }
 function applySkills(){
  const selected=[];
  run.pendingSkills.forEach((u,i)=>{const radio=document.querySelector('input[name="rogue-skill-'+i+'"]:checked');if(radio)selected.push([u,radio.value]);});
  if(selected.length!==run.pendingSkills.length){el("roguelike-description").textContent="Choose one skill for each surviving unit before continuing.";return;}
  for(const [unit,key] of selected){const target=run.army.find(x=>x.id===unit.id)||run.army[unit._sourceIndex];if(!target)continue;if(key.startsWith("veteran_")){const stat=key.slice(8);target.campaignStats=target.campaignStats||{};target.campaignStats[stat]=(target.campaignStats[stat]||0)+1;}else{target.skills=target.skills||{};target.skills[key]=true;}}
  run.pendingSkills=[];run.state="ready";run.rosterPoints=calculatePoints?calculatePoints(run.army,run.faction):run.rosterPoints;save();render();
 }
 el("roguelike-start").addEventListener("click",()=>{if(run.state==="defeat")run=blankRun();chooseArmy();});
 el("roguelike-continue").addEventListener("click",()=>{if(run.state==="skills"){applySkills();return;}chooseArmy();});
 el("roguelike-menu").addEventListener("click",()=>{hide();onReturnMenu();});
 return {open,onBattleFinished,beginBattle:startBattle,getLostModels:()=>run.lostModels||[],resetProgress:()=>{progress=freshProgress();run=blankRun();save();resetProgress?.();}};
}
