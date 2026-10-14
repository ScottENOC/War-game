export function createArmyBuilder({ $, onStart, onBack, validateArmy=()=>"" }) {
  let faction="empire";
  let army=[{type:"swordsmen",models:20,champion:false,championBonus:"A",upgrades:{},skills:{},lightArmour:false,heavyArmour:false,weapon:"handWeapon",spears:false,bow:false,barding:false,mounted:false,shield:false,freeCavalryOption:"bow"}];
  const list=$("army-list"),total=$("army-total"),addButton=$("add-unit"),startButton=$("begin-deployment");
  const elf=()=>faction==="highElves",isCharacterType=type=>["captain","lord","legendaryLord","shadowElf"].includes(type),fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1);
  function defaults(u){
    u.champion=false;u.championBonus=u.type==="archers"?"BS":"A";u.upgrades={};u.skills={};u.elvenArchery=false;u.lightArmour=false;u.heavyArmour=["legendaryLord","shadowElf"].includes(u.type);u.magicArmour=false;u.weapon="handWeapon";u.meleeWeapons=u.type==="shadowElf"?["handWeapon","offhandWeapon"]:["handWeapon"];u.extraMeleeWeapons=[];u.rangedWeapon=u.type==="shadowElf"?"magicBow":null;u.spears=false;u.bow=false;u.barding=false;u.mounted=false;u.shield=u.type==="legendaryLord";u.freeCavalryOption="bow";
    if(elf()){if(u.type==="swordsmen"){u.lightArmour=true;u.shield=true;u.spears=true;u.weapon="spear";u.meleeWeapons=["handWeapon","spear"];}if(u.type==="archers")u.lightArmour=true;}
    if(isCharacterType(u.type))u.models=1;else if(u.type==="cavalry")u.models=Math.min(15,Math.max(5,u.models||5));else if(u.type==="cannon")u.models=3;else if(u.type==="boltThrower")u.models=2;else u.models=Math.min(30,Math.max(5,u.models||10));
  }
  const statUpgrades=[
    {key:"M",label:"Movement",unit:2,character:5},
    {key:"WS",label:"Weapon Skill",unit:2,character:5},
    {key:"BS",label:"Ballistic Skill",unit:2,character:5},
    {key:"S",label:"Strength",unit:3,character:6},
    {key:"T",label:"Toughness",unit:4,character:8},
    {key:"I",label:"Initiative",unit:1,character:3},
    {key:"Ld",label:"Leadership",unit:1,character:3}
  ];
  function unitPoints(u){
    const e=elf(),m=u.models||1,character=isCharacterType(u.type);
    if(u.type==="cannon")return 80;if(u.type==="boltThrower")return 60;
    const upgradeCost=statUpgrades.reduce((sum,s)=>sum+(u.upgrades&&u.upgrades[s.key]?(character?s.character:s.unit*m):0),0);
    const skillCost=["rerollOnesMelee","rerollOnesShooting","steadfast","skirmish"].reduce((sum,key)=>sum+(u.skills&&u.skills[key]?3:0),0);
    const weapons=[...new Set([...(u.meleeWeapons||[]),u.weapon||"handWeapon"])];
    const ranged=u.rangedWeapon||(u.type==="archers"?"bow":null);
    const rangedCost=ranged==="bow"?(e&&u.type==="cavalry"&&(u.freeCavalryOption||"bow")==="bow"?0:(e?3:2)*(character?1:m)):ranged==="crossbow"?3*(character?1:m):ranged==="firearm"?4*(character?1:m):0;
    if(character){
      const meleeCost=weapons.reduce((sum,w)=>sum+(["halberd","greatWeapon"].includes(w)?4:w==="spear"&&u.mounted?2:w==="lance"&&u.mounted?4:0),0);
      return (u.type==="legendaryLord"?160:u.type==="shadowElf"?165:(e?(u.type==="lord"?120:75):(u.type==="lord"?80:50)))+(u.heavyArmour&&!["legendaryLord","shadowElf"].includes(u.type)?4:0)+(u.magicArmour?10:0)+(u.weapon==="magicSword"?10:0)+meleeCost+(u.mounted?8:0)+(u.mounted&&u.barding?4:0)+(u.shield&&u.type!=="legendaryLord"?2:0)+rangedCost+upgradeCost+skillCost;
    }
    if(u.type==="cavalry"){
      const free=u.freeCavalryOption||"bow";
      const meleeCost=weapons.reduce((sum,w)=>sum+(w==="spear"&&!(e&&free==="spear")?m:["lance","greatWeapon"].includes(w)?2*m:0),0);
      const bowCost=(u.bow&&!(e&&free==="bow")?2*m:0)+(ranged==="bow"&&!(e&&free==="bow")&&!u.bow?2*m:0);
      const otherRangedCost=ranged==="crossbow"?3*m:ranged==="firearm"?4*m:0;
      return m*(e?24:16)+(u.elvenArchery&&e&&(ranged==="bow"||u.bow||free==="bow")?2*m:0)+bowCost+otherRangedCost+(u.heavyArmour?2*m:0)+(u.barding?2*m:0)+(u.shield?0.5*m:0)+meleeCost+upgradeCost+skillCost;
    }
    const meleeCost=weapons.reduce((sum,w)=>sum+(w==="spear"&&!(e&&u.type==="swordsmen")?m:w==="greatWeapon"?2*m:w==="halberd"?m:0),0);
    return m*(e?12:8)+meleeCost+rangedCost+(u.elvenArchery&&e&&ranged==="bow"?2*m:0)+(u.champion?(e?9:6):0)+(u.lightArmour&&!e?m:0)+(u.shield&&!(e&&u.type==="swordsmen")?0.5*m:0)+upgradeCost+skillCost;
  }
  function check(label,{cost="",checked=false,disabled=false,onChange}={}){const l=document.createElement("label"),c=document.createElement("input");c.type="checkbox";c.checked=checked;c.disabled=disabled;c.addEventListener("change",()=>onChange(c.checked));l.append(c,document.createTextNode(label+(cost?" ("+cost+")":"")));return l;}
  function select(label,html,value,onChange){const l=document.createElement("label");l.append(document.createTextNode(label+" "));const s=document.createElement("select");s.innerHTML=html;s.value=value;s.addEventListener("change",()=>onChange(s.value));l.append(s);return l;}
  function weaponSlotsUsed(u){const melee=[...new Set([...(u.meleeWeapons||[]),u.weapon||"handWeapon"])].filter(w=>!["handWeapon","offhandWeapon"].includes(w));const ranged=u.rangedWeapon||(u.type==="archers"?"bow":null)||(u.type==="cavalry"&&elf()&&(u.freeCavalryOption||"bow")==="bow"?"bow":null);return melee.length+(ranged?1:0);}
  function addMeleeWeapon(u,weapon,enabled){const extras=new Set(u.extraMeleeWeapons||[]);if(enabled)extras.add(weapon);else extras.delete(weapon);u.extraMeleeWeapons=[...extras];u.meleeWeapons=[...new Set(["handWeapon",u.weapon||"handWeapon",...u.extraMeleeWeapons])];if(!enabled&&u.weapon===weapon)u.weapon="handWeapon";}
  function extraWeaponChecks(u,options,available){available.filter(w=>w!==u.weapon).forEach(w=>{const character=isCharacterType(u.type),cavalry=u.type==="cavalry",cost=w==="greatWeapon"?(character?"+4 pts":"+2/model"):w==="halberd"?(character?"+4 pts":"+1/model"):w==="lance"?(character?"+4 pts":"+2/model"):w==="spear"?(character?(u.mounted?"+2 pts":""):(elf()&&(u.type==="swordsmen"||(cavalry&&(u.freeCavalryOption||"bow")==="spear"))?"free":"+1/model")):"";const checked=(u.extraMeleeWeapons||[]).includes(w),disabled=!checked&&weaponSlotsUsed(u)>=2;options.append(check("Also equip "+({"spear":"spear","halberd":"halberd","greatWeapon":"great weapon","lance":"lance"}[w]||w),{cost,checked,disabled,onChange:v=>{if(v&&weaponSlotsUsed(u)>=2)return;addMeleeWeapon(u,w,v);updateTotals();renderRows();}}));});}
  function updateTotals(){let sum=0;list.querySelectorAll(".army-row").forEach((row,i)=>{const cost=unitPoints(army[i]);sum+=cost;row.querySelector(".army-cost").textContent=fmt(cost)+" pts";});total.textContent=fmt(sum)+" pts";addButton.disabled=army.length>=6;addButton.textContent=army.length>=6?"6 / 6 Units":"＋ Add Unit ("+army.length+"/6)";const message=validateArmy(army,faction)||"";const note=$("roster-validation");if(note){note.textContent=message||"Every selected unit is available in your collection.";note.classList.toggle("invalid",!!message);note.classList.toggle("valid",!message);}startButton.disabled=!army.length||!!message;}
  function renderRows(){
    list.replaceChildren();
    army.forEach((u,index)=>{
      const row=document.createElement("article");row.className="army-row";const main=document.createElement("div");main.className="army-row-main";
      const type=document.createElement("select");type.setAttribute("aria-label","Unit "+(index+1)+" type");
      type.innerHTML='<option value="swordsmen">Infantry · melee or ranged equipment</option>'+(elf()?'<option value="boltThrower">Bolt thrower · 60 pts</option>':'<option value="cannon">Cannon · 80 pts</option>')+'<option value="captain">'+(elf()?"High Elf Hero · 75 pts":"Human Captain · 50 pts")+'</option><option value="lord">'+(elf()?"High Elf Lord · 120 pts":"Empire General (Lord) · 80 pts")+'</option>'+(elf()?'<option value="shadowElf">Lethariel Starweaver · 165 pts</option>':'<option value="legendaryLord">Lord-Marshal Edric Voss · 160 pts</option>')+'<option value="cavalry">'+(elf()?"High Elf Cavalry · 24 pts/model":"Cavalry · 16 pts/model")+'</option>';
      type.value=u.type==="archers"?"swordsmen":u.type;type.addEventListener("change",()=>{u.type=type.value;defaults(u);renderRows();});
      const ml=document.createElement("label");ml.append(document.createTextNode("Models "));const models=document.createElement("input");models.type="number";models.min="5";models.max=u.type==="cavalry"?"15":"30";models.step="1";models.value=u.models;models.inputMode="numeric";models.disabled=isCharacterType(u.type)||u.type==="cannon"||u.type==="boltThrower";models.setAttribute("aria-label","Unit "+(index+1)+" model count");models.addEventListener("change",()=>{const p=Number.parseInt(models.value,10);u.models=Number.isFinite(p)?Math.max(5,Math.min(u.type==="cavalry"?15:30,p)):5;models.value=u.models;updateTotals();});ml.append(models);
      const options=document.createElement("div");options.className="army-options";const character=isCharacterType(u.type),cavalry=u.type==="cavalry",siege=u.type==="cannon"||u.type==="boltThrower",infantry=u.type==="swordsmen"||u.type==="archers";
      if(siege){const note=document.createElement("p");note.textContent=u.type==="cannon"?"Three skirmishing crew in soft cover operate the cannon. Cannon: T7, 3 wounds; S10, AP1, D3 wounds and penetrates at −1 Strength. Siege weapons alone can damage walls.":"Two skirmishing crew in soft cover operate the bolt thrower. Bolt thrower: T7, 2 wounds, 48-inch range. Single shot: S7, D3 wounds, penetrates at −1 Strength with no extra armour piercing. Multi-shot: six bow shots at S5. Siege weapons alone can damage walls.";options.append(note);}
      if(!character&&!cavalry&&!siege){
        options.append(check("Champion",{cost:"+"+(elf()?9:6)+" pts",checked:!!u.champion,onChange:v=>{u.champion=v;renderRows();}}));
        if(u.champion)options.append(select("Champion bonus",u.rangedWeapon==="firearm"?'<option value="A">+1 Attack</option>':'<option value="A">+1 Attack</option><option value="BS">+1 Ballistic Skill</option>',u.championBonus||(u.type==="archers"?"BS":"A"),v=>{u.championBonus=v;updateTotals();}));
      }
      if(character){
        if(elf()){const rule=document.createElement("p");rule.textContent="Always Strikes First: +10 Initiative; reroll missed melee hits when your final modified Initiative is at least 11 higher than the target’s.";options.append(rule);if(u.type==="shadowElf"){const scout=document.createElement("p");scout.textContent="May deploy anywhere on the battlefield. She and any unit she joins impose an additional −1 to hit on shooting attacks while in cover. Her unit gains Skirmish. Magical longbow: 36″ range, uses her own Strength and Attack characteristics. Dual wielding adds one melee attack at her base Strength.";options.append(scout);}}
        options.append(check("Heavy armour",{cost:(["legendaryLord","shadowElf"].includes(u.type)?"included":"+4 pts")+" (5+ save"+((elf()||u.mounted||u.type==="shadowElf")?", no Move penalty":", −1 Move")+")",checked:!!u.heavyArmour,disabled:["legendaryLord","shadowElf"].includes(u.type),onChange:v=>{u.heavyArmour=v;if(v)u.magicArmour=false;updateTotals();renderRows();}}));
        options.append(check("Enchanted heavy armour",{cost:"+10 pts (4+ base save, no Move penalty)",checked:!!u.magicArmour,onChange:v=>{u.magicArmour=v;if(v)u.heavyArmour=false;else if(["legendaryLord","shadowElf"].includes(u.type))u.heavyArmour=true;updateTotals();renderRows();}}));
        options.append(check("Shield",{cost:(u.type==="legendaryLord"?"included":"+2 pts")+", +1 front armour save",checked:!!u.shield,disabled:u.type==="legendaryLord",onChange:v=>{u.shield=v;updateTotals();}}));
        if(u.type==="legendaryLord"){const rule=document.createElement("p");rule.textContent="Kingsbane: a normal one-handed sword model; melee hits allow no armour saves.";options.append(rule);}else if(u.type==="shadowElf"){const rule=document.createElement("p");rule.textContent="Two hand weapons: dual wielding grants +1 melee attack at base Strength.";options.append(rule);}else {const meleeOptions='<option value="handWeapon">Sword/hand weapon (included)</option>'+'<option value="magicSword">Magic sword (+10 pts, +1 Attack, +1 Strength)</option>'+(u.mounted?"":'<option value="halberd">Halberd (+4 pts)</option>')+'<option value="greatWeapon">Great weapon (+4 pts, +2 Strength, −10 Initiative)</option>'+(u.mounted?'<option value="spear">Spear (+2 pts, charge)</option><option value="lance">Lance (+4 pts, charge)</option>':"");const mainFull=weaponSlotsUsed(u)-(u.weapon!=="handWeapon"&&u.weapon!=="offhandWeapon"?1:0)>=2;options.append(select("Melee weapon",mainFull?meleeOptions.replace(/<option value="(magicSword|halberd|greatWeapon|spear|lance)"/g,'<option disabled value="$1"'):meleeOptions,u.weapon,v=>{u.weapon=v;u.meleeWeapons=[...new Set(["handWeapon",v,...(u.extraMeleeWeapons||[])])];u.spears=v==="spear";updateTotals();renderRows();}));}
        if(u.type==="shadowElf"){const bow=document.createElement("p");bow.textContent="Magical longbow (included): 36″ range; each shot uses Lethariel’s Strength and Attack characteristics.";options.append(bow);}else {const rangedOptions='<option value="">None</option>'+(elf()?'<option value="bow">Longbow (+3 pts)</option>':'<option value="bow">Bow (+2 pts)</option><option value="crossbow">Crossbow (+3 pts)</option><option value="firearm">Firearm (+4 pts)</option>');const rangedFull=!u.rangedWeapon&&weaponSlotsUsed(u)>=2;options.append(select("Ranged weapon",rangedFull?rangedOptions.replace(/<option value="(bow|crossbow|firearm)"/g,'<option disabled value="$1"'):rangedOptions,u.rangedWeapon||"",v=>{if(v&&!u.rangedWeapon&&weaponSlotsUsed(u)>=2){renderRows();return;}u.rangedWeapon=v||null;updateTotals();renderRows();}));}
        if(!["legendaryLord","shadowElf"].includes(u.type))extraWeaponChecks(u,options,u.mounted?["spear","lance","greatWeapon"]:["halberd","greatWeapon"]);
        options.append(check("Warhorse",{cost:"+8 pts",checked:!!u.mounted,onChange:v=>{u.mounted=v;u.barding=false;if(v&&u.weapon==="halberd")u.weapon="handWeapon";if(!v&&["spear","lance"].includes(u.weapon))u.weapon="handWeapon";renderRows();}}));
        if(u.mounted)options.append(check("Barding",{cost:"+4 pts, +1 save"+(elf()?", no Move penalty":", −1 Move"),checked:!!u.barding,onChange:v=>{u.barding=v;updateTotals();}}));
      }else if(cavalry){
        const kit=document.createElement("p");kit.textContent=elf()?"Includes sword, light armour and horse. Choose one free: bow or spear. Always Strikes First.":"Includes sword, light armour and horse (+1 armour save).";options.append(kit);
        if(elf()){
          options.append(select("Free equipment",'<option value="bow">Bow (24″ range)</option><option value="spear">Spear (+1 Strength on charge)</option>',u.freeCavalryOption||"bow",v=>{u.freeCavalryOption=v;if(v==="bow")u.bow=false;if(v==="spear"&&u.weapon==="spear")u.weapon="handWeapon";updateTotals();renderRows();}));
          options.append(select("Weapon upgrade",'<option value="handWeapon">No upgrade</option><option value="spear">Spear (+1/model, free if selected above)</option><option value="lance">Lance (+2/model)</option><option value="greatWeapon">Great weapon (+2/model)</option>',["spear","lance","greatWeapon"].includes(u.weapon)?u.weapon:"handWeapon",v=>{u.weapon=v;if(["halberd","greatWeapon"].includes(v))u.shield=false;updateTotals();renderRows();}));
          if(u.freeCavalryOption==="spear")options.append(check("Add bow",{cost:"+2/model",checked:!!u.bow,onChange:v=>{u.bow=v;updateTotals();}}));
          if(u.bow||u.freeCavalryOption==="bow")options.append(check("Elven Archery",{cost:"+2/model · cancels up to 2 points of moving, long-range or firing-over-unit penalties",checked:!!u.elvenArchery,onChange:v=>{u.elvenArchery=v;updateTotals();}}));
        }else{
          options.append(select("Melee weapon",'<option value="handWeapon">Sword/hand weapon (included)</option><option value="spear">Spear (+1/model)</option><option value="lance">Lance (+2/model)</option><option value="greatWeapon">Great weapon (+2/model)</option>',u.weapon||"handWeapon",v=>{u.weapon=v;u.meleeWeapons=[...new Set(["handWeapon",v,...(u.extraMeleeWeapons||[])])];updateTotals();renderRows();}));
          const cavRangedOptions='<option value="">None</option><option value="bow">Bow (+2/model)</option><option value="crossbow">Crossbow (+3/model)</option><option value="firearm">Firearm (+4/model)</option>';const cavRangedFull=!(u.rangedWeapon||(u.bow?"bow":""))&&weaponSlotsUsed(u)>=2;options.append(select("Ranged weapon",cavRangedFull?cavRangedOptions.replace(/<option value="(bow|crossbow|firearm)"/g,'<option disabled value="$1"'):cavRangedOptions,u.rangedWeapon||(u.bow?"bow":""),v=>{if(v&&!u.rangedWeapon&&!u.bow&&weaponSlotsUsed(u)>=2){renderRows();return;}u.rangedWeapon=v||null;u.bow=v==="bow";updateTotals();renderRows();}));
          extraWeaponChecks(u,options,["spear","lance","greatWeapon"]);
        }
        options.append(check("Heavy armour",{cost:"+2/model",checked:!!u.heavyArmour,onChange:v=>{u.heavyArmour=v;updateTotals();}}));
        options.append(check("Barding",{cost:"+2/model, +1 save"+(elf()?", no Move penalty":", −1 Move"),checked:!!u.barding,onChange:v=>{u.barding=v;updateTotals();}}));
        options.append(check("Shield",{cost:"+0.5/model, +1 front armour save",checked:!!u.shield,disabled:false,onChange:v=>{u.shield=v;updateTotals();}}));
      }else if(infantry){
        const meleeOptions='<option value="handWeapon">Sword / hand weapon (included)</option><option value="spear">Spear (+1 pt/model)</option><option value="greatWeapon">Great weapon (+2 pts/model)</option><option value="halberd">Halberd (+1 pt/model)</option>';
        options.append(select("Initial melee weapon",meleeOptions,u.weapon||"handWeapon",v=>{u.weapon=v;u.meleeWeapons=[...new Set(["handWeapon",v,...(u.extraMeleeWeapons||[])])];u.spears=v==="spear";updateTotals();renderRows();}));
        extraWeaponChecks(u,options,["spear","greatWeapon","halberd"]);
        const infantryRangedOptions='<option value="">None</option>'+(elf()?'<option value="bow">Longbow (+3 pts/model)</option>':'<option value="bow">Bow (+2 pts/model)</option><option value="crossbow">Crossbow (+3 pts/model)</option><option value="firearm">Firearm (+4 pts/model)</option>');const infantryRangedFull=!(u.rangedWeapon||(u.type==="archers"?"bow":""))&&weaponSlotsUsed(u)>=2;options.append(select("Ranged weapon",infantryRangedFull?infantryRangedOptions.replace(/<option value="(bow|crossbow|firearm)"/g,'<option disabled value="$1"'):infantryRangedOptions,u.rangedWeapon||(u.type==="archers"?"bow":""),v=>{if(v&&!u.rangedWeapon&&u.type!=="archers"&&weaponSlotsUsed(u)>=2){renderRows();return;}u.rangedWeapon=v||null;u.type="swordsmen";if(v==="firearm")u.upgrades.BS=false;updateTotals();renderRows();}));
        if(elf()&&u.rangedWeapon==="bow")options.append(check("Elven Archery",{cost:"+2/model · cancels up to 2 points of moving, long-range or firing-over-unit penalties",checked:!!u.elvenArchery,onChange:v=>{u.elvenArchery=v;updateTotals();}}));
        if(elf()){const kit=document.createElement("p");kit.textContent="Includes light armour. Always Strikes First.";options.append(kit);}
        else options.append(check("Light armour",{cost:"+1/model",checked:!!u.lightArmour,onChange:v=>{u.lightArmour=v;updateTotals();}}));
        options.append(check("Shield",{cost:"+0.5/model, +1 front armour save",checked:!!u.shield,onChange:v=>{u.shield=v;updateTotals();}}));
      }
      {
        const skillBox=document.createElement("div");skillBox.className="stat-upgrades";
        const skillHeading=document.createElement("p");skillHeading.className="stat-upgrades-heading";skillHeading.textContent="Special skills · 3 pts each";skillBox.append(skillHeading);
        skillBox.append(check("Melee Mastery",{cost:"+3 pts · reroll natural 1s to hit in melee",checked:!!u.skills?.rerollOnesMelee,onChange:v=>{u.skills={...(u.skills||{}),rerollOnesMelee:v};updateTotals();}}));
        const hasBow=u.type==="archers"||["bow","crossbow","firearm"].includes(u.weapon)||!!u.rangedWeapon||(u.type==="cavalry"&&(!!u.bow||!!u.rangedWeapon||(elf()&&(u.freeCavalryOption||"bow")==="bow")));
        if(hasBow)skillBox.append(check("Marksman",{cost:"+3 pts · reroll natural 1s to hit when shooting",checked:!!u.skills?.rerollOnesShooting,onChange:v=>{u.skills={...(u.skills||{}),rerollOnesShooting:v};updateTotals();}}));
        skillBox.append(check("Steadfast",{cost:"+3 pts · ignore combat-result penalty on break tests",checked:!!u.skills?.steadfast,onChange:v=>{u.skills={...(u.skills||{}),steadfast:v};updateTotals();}}));
        skillBox.append(check("Skirmish",{cost:"+3 pts · free pivot, 360° shooting and shields",checked:!!u.skills?.skirmish,onChange:v=>{u.skills={...(u.skills||{}),skirmish:v};updateTotals();}}));
        options.append(skillBox);
      }
      {
        const upgradeBox=document.createElement("div");upgradeBox.className="stat-upgrades";
        const heading=document.createElement("p");heading.className="stat-upgrades-heading";heading.textContent="Stat upgrades · +1 each, once per stat";upgradeBox.append(heading);
        statUpgrades.forEach(s=>upgradeBox.append(check("+"+s.key+" "+s.label,{cost:"+"+(character?s.character:s.unit*(u.models||1))+" pts",checked:!!u.upgrades?.[s.key],disabled:u.rangedWeapon==="firearm"&&s.key==="BS",onChange:v=>{u.upgrades={...(u.upgrades||{}),[s.key]:v};updateTotals();}})));
        options.append(upgradeBox);
      }
      main.append(type,ml,options);const cost=document.createElement("strong");cost.className="army-cost";const remove=document.createElement("button");remove.className="remove-unit secondary-button";remove.textContent="×";remove.title="Remove unit "+(index+1);remove.setAttribute("aria-label","Remove unit "+(index+1));remove.addEventListener("click",()=>{army.splice(index,1);renderRows();});row.append(main,cost,remove);list.append(row);
    });updateTotals();
  }
  $("faction-select").addEventListener("change",()=>{faction=$("faction-select").value==="highElves"?"highElves":"empire";army.forEach(u=>{if(faction==="highElves"&&u.type==="legendaryLord")u.type="lord";if(faction==="empire"&&u.type==="shadowElf")u.type="lord";defaults(u);});renderRows();});
  function openBuilder(){ $("mainmenu").hidden=true;$("collection-screen").hidden=true;$("mode-screen").hidden=true;$("armybuilder").hidden=false;renderRows(); }
  $("builder-back").addEventListener("click",onBack);
  addButton.addEventListener("click",()=>{if(army.length>=6)return;const u={type:"swordsmen",models:20};defaults(u);army.push(u);renderRows();});
  startButton.addEventListener("click",()=>{if(army.length&&!validateArmy(army,faction))onStart(army.map(u=>({...u})),faction);});
  return {open:openBuilder,refresh:renderRows};
}