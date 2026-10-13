export function createArmyBuilder({ $, onStart, onBack, validateArmy=()=>"" }) {
  let faction="empire";
  let army=[{type:"swordsmen",models:20,champion:false,championBonus:"A",upgrades:{},lightArmour:false,heavyArmour:false,weapon:"handWeapon",spears:false,bow:false,barding:false,mounted:false,shield:false,freeCavalryOption:"bow"}];
  const list=$("army-list"),total=$("army-total"),addButton=$("add-unit"),startButton=$("begin-deployment");
  const elf=()=>faction==="highElves",fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1);
  function defaults(u){
    u.champion=false;u.championBonus=u.type==="archers"?"BS":"A";u.upgrades={};u.lightArmour=false;u.heavyArmour=false;u.weapon="handWeapon";u.spears=false;u.bow=false;u.barding=false;u.mounted=false;u.shield=false;u.freeCavalryOption="bow";
    if(elf()){if(u.type==="swordsmen"){u.lightArmour=true;u.shield=true;u.spears=true;u.weapon="spear";}if(u.type==="archers")u.lightArmour=true;}
    if(u.type==="captain"||u.type==="lord")u.models=1;else if(u.type==="cavalry")u.models=Math.min(15,Math.max(5,u.models||5));else u.models=Math.min(30,Math.max(5,u.models||10));
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
    const e=elf(),m=u.models||1;
    const character=u.type==="captain"||u.type==="lord";
    const upgradeCost=statUpgrades.reduce((sum,s)=>sum+(u.upgrades&&u.upgrades[s.key]?(character?s.character:s.unit*m):0),0);
    if(u.type==="captain"||u.type==="lord")return (e?(u.type==="lord"?120:75):(u.type==="lord"?80:50))+(u.heavyArmour?4:0)+(["halberd","greatWeapon"].includes(u.weapon)?4:0)+(u.mounted?8:0)+(u.mounted&&u.weapon==="spear"?2:0)+(u.mounted&&u.weapon==="lance"?4:0)+(u.mounted&&u.barding?4:0)+(u.shield&&!["halberd","greatWeapon"].includes(u.weapon)?2:0)+upgradeCost;
    if(u.type==="cavalry"){const free=u.freeCavalryOption||"bow";return m*(e?24:16)+(u.bow&&!(e&&free==="bow")?2*m:0)+(u.heavyArmour?2*m:0)+(u.barding?2*m:0)+(u.shield&&u.weapon!=="greatWeapon"?0.5*m:0)+(u.weapon==="spear"&&!(e&&free==="spear")?m:0)+(["lance","greatWeapon"].includes(u.weapon)?2*m:0)+upgradeCost;}
    const base=m*(e?12:8);
    const weaponCost=u.type==="archers"?(e?3:2)*m:u.weapon==="spear"&&!(e&&u.type==="swordsmen")?m:u.weapon==="greatWeapon"?2*m:u.weapon==="halberd"?m:0;
    return base+weaponCost+(u.champion?(e?9:6):0)+(u.lightArmour&&!e?m:0)+(u.shield&&!(e&&u.type==="swordsmen")?0.5*m:0)+upgradeCost;
  }
  function check(label,{cost="",checked=false,disabled=false,onChange}={}){const l=document.createElement("label"),c=document.createElement("input");c.type="checkbox";c.checked=checked;c.disabled=disabled;c.addEventListener("change",()=>onChange(c.checked));l.append(c,document.createTextNode(label+(cost?" ("+cost+")":"")));return l;}
  function select(label,html,value,onChange){const l=document.createElement("label");l.append(document.createTextNode(label+" "));const s=document.createElement("select");s.innerHTML=html;s.value=value;s.addEventListener("change",()=>onChange(s.value));l.append(s);return l;}
  function updateTotals(){let sum=0;list.querySelectorAll(".army-row").forEach((row,i)=>{const cost=unitPoints(army[i]);sum+=cost;row.querySelector(".army-cost").textContent=fmt(cost)+" pts";});total.textContent=fmt(sum)+" pts";addButton.disabled=army.length>=6;addButton.textContent=army.length>=6?"6 / 6 Units":"＋ Add Unit ("+army.length+"/6)";const message=validateArmy(army,faction)||"";const note=$("roster-validation");if(note){note.textContent=message||"Every selected unit is available in your collection.";note.classList.toggle("invalid",!!message);note.classList.toggle("valid",!message);}startButton.disabled=!army.length||!!message;}
  function renderRows(){
    list.replaceChildren();
    army.forEach((u,index)=>{
      const row=document.createElement("article");row.className="army-row";const main=document.createElement("div");main.className="army-row-main";
      const type=document.createElement("select");type.setAttribute("aria-label","Unit "+(index+1)+" type");
      type.innerHTML='<option value="swordsmen">Infantry · melee or ranged equipment</option><option value="captain">'+(elf()?"High Elf Hero · 75 pts":"Human Captain · 50 pts")+'</option><option value="lord">'+(elf()?"High Elf Lord · 120 pts":"Empire General (Lord) · 80 pts")+'</option><option value="cavalry">'+(elf()?"High Elf Cavalry · 24 pts/model":"Cavalry · 16 pts/model")+'</option>';
      type.value=u.type==="archers"?"swordsmen":u.type;type.addEventListener("change",()=>{u.type=type.value;defaults(u);renderRows();});
      const ml=document.createElement("label");ml.append(document.createTextNode("Models "));const models=document.createElement("input");models.type="number";models.min="5";models.max=u.type==="cavalry"?"15":"30";models.step="1";models.value=u.models;models.inputMode="numeric";models.disabled=u.type==="captain"||u.type==="lord";models.setAttribute("aria-label","Unit "+(index+1)+" model count");models.addEventListener("change",()=>{const p=Number.parseInt(models.value,10);u.models=Number.isFinite(p)?Math.max(5,Math.min(u.type==="cavalry"?15:30,p)):5;models.value=u.models;updateTotals();});ml.append(models);
      const options=document.createElement("div");options.className="army-options";const character=u.type==="captain"||u.type==="lord",cavalry=u.type==="cavalry",infantry=u.type==="swordsmen"||u.type==="archers";
      if(!character&&!cavalry){
        options.append(check("Champion",{cost:"+"+(elf()?9:6)+" pts",checked:!!u.champion,onChange:v=>{u.champion=v;renderRows();}}));
        if(u.champion)options.append(select("Champion bonus",'<option value="A">+1 Attack</option><option value="BS">+1 Ballistic Skill</option>',u.championBonus||(u.type==="archers"?"BS":"A"),v=>{u.championBonus=v;updateTotals();}));
      }
      if(character){
        if(elf()){const rule=document.createElement("p");rule.textContent="Always Strikes First: +10 Initiative; reroll missed melee hits when your final modified Initiative is at least 11 higher than the target’s.";options.append(rule);}
        options.append(check("Heavy armour",{cost:"+4 pts (5+ save"+((elf()||u.mounted)?", no Move penalty":", −1 Move")+")",checked:!!u.heavyArmour,onChange:v=>{u.heavyArmour=v;updateTotals();}}));
        options.append(check("Shield",{cost:"+2 pts, +1 front armour save",checked:!!u.shield,disabled:["halberd","greatWeapon"].includes(u.weapon),onChange:v=>{u.shield=v;updateTotals();}}));
        options.append(select("Weapon",'<option value="handWeapon">Sword/hand weapon (included)</option>'+(u.mounted?"":'<option value="halberd">Halberd (+4 pts)</option>')+'<option value="greatWeapon">Great weapon (+4 pts, +2 Strength, −10 Initiative)</option>'+(u.mounted?'<option value="spear">Spear (+2 pts, charge)</option><option value="lance">Lance (+4 pts, charge)</option>':""),u.weapon,v=>{u.weapon=v;if(["halberd","greatWeapon"].includes(v))u.shield=false;updateTotals();renderRows();}));
        options.append(check("Warhorse",{cost:"+8 pts",checked:!!u.mounted,onChange:v=>{u.mounted=v;u.barding=false;if(v&&u.weapon==="halberd")u.weapon="handWeapon";if(!v&&["spear","lance"].includes(u.weapon))u.weapon="handWeapon";renderRows();}}));
        if(u.mounted)options.append(check("Barding",{cost:"+4 pts, +1 save"+(elf()?", no Move penalty":", −1 Move"),checked:!!u.barding,onChange:v=>{u.barding=v;updateTotals();}}));
      }else if(cavalry){
        const kit=document.createElement("p");kit.textContent=elf()?"Includes sword, light armour and horse. Choose one free: bow or spear. Always Strikes First.":"Includes sword, light armour and horse (+1 armour save).";options.append(kit);
        if(elf()){
          options.append(select("Free equipment",'<option value="bow">Bow (24″ range)</option><option value="spear">Spear (+1 Strength on charge)</option>',u.freeCavalryOption||"bow",v=>{u.freeCavalryOption=v;if(v==="bow")u.bow=false;if(v==="spear"&&u.weapon==="spear")u.weapon="handWeapon";updateTotals();renderRows();}));
          options.append(select("Weapon upgrade",'<option value="handWeapon">No upgrade</option><option value="spear">Spear (+1/model, free if selected above)</option><option value="lance">Lance (+2/model)</option><option value="greatWeapon">Great weapon (+2/model)</option>',["spear","lance","greatWeapon"].includes(u.weapon)?u.weapon:"handWeapon",v=>{u.weapon=v;if(["halberd","greatWeapon"].includes(v))u.shield=false;updateTotals();renderRows();}));
          if(u.freeCavalryOption==="spear")options.append(check("Add bow",{cost:"+2/model",checked:!!u.bow,onChange:v=>{u.bow=v;updateTotals();}}));
        }else{
          options.append(select("Weapon",'<option value="handWeapon">Sword/hand weapon (included)</option><option value="spear">Spear (+1/model)</option><option value="lance">Lance (+2/model)</option><option value="greatWeapon">Great weapon (+2/model)</option>',u.weapon||"handWeapon",v=>{u.weapon=v;if(["halberd","greatWeapon"].includes(v))u.shield=false;updateTotals();renderRows();}));
          options.append(check("Bow",{cost:"+2/model",checked:!!u.bow,onChange:v=>{u.bow=v;updateTotals();}}));
        }
        options.append(check("Heavy armour",{cost:"+2/model",checked:!!u.heavyArmour,onChange:v=>{u.heavyArmour=v;updateTotals();}}));
        options.append(check("Barding",{cost:"+2/model, +1 save"+(elf()?", no Move penalty":", −1 Move"),checked:!!u.barding,onChange:v=>{u.barding=v;updateTotals();}}));
        options.append(check("Shield",{cost:"+0.5/model, +1 front armour save",checked:!!u.shield,disabled:u.weapon==="greatWeapon",onChange:v=>{u.shield=v;updateTotals();}}));
      }else if(infantry){
        options.append(select("Weapon",'<option value="handWeapon">Sword / hand weapon (included)</option><option value="spear">Spear (+1 pt/model)</option><option value="bow">Bow ('+(elf()?"+3":" +2")+' pts/model)</option><option value="greatWeapon">Great weapon (+2 pts/model)</option><option value="halberd">Halberd (+1 pt/model)</option>',u.type==="archers"?"bow":(u.weapon||"handWeapon"),v=>{u.type=v==="bow"?"archers":"swordsmen";u.weapon=v;u.spears=v==="spear";if(["bow","halberd","greatWeapon"].includes(v))u.shield=false;u.championBonus=v==="bow"?"BS":"A";renderRows();}));
        if(elf()&&u.type==="swordsmen"){const kit=document.createElement("p");kit.textContent="Includes light armour, shield and spear; fights in three ranks. Always Strikes First.";options.append(kit);}
        else{
          if(elf()&&u.type==="archers"){const kit=document.createElement("p");kit.textContent="Includes light armour and longbow (30″ range). Always Strikes First.";options.append(kit);}
          else options.append(check("Light armour",{cost:"+1/model",checked:!!u.lightArmour,onChange:v=>{u.lightArmour=v;updateTotals();}}));
          options.append(check("Shield",{cost:"+0.5/model, +1 front armour save",checked:!!u.shield,onChange:v=>{u.shield=v;updateTotals();}}));
          if(u.type==="swordsmen"&&!elf()&&u.weapon!=="spear")options.append(check("Spears",{cost:"+1/model, fights in two ranks",checked:!!u.spears,onChange:v=>{u.spears=v;u.weapon=v?"spear":"handWeapon";renderRows();}}));
        }
      }
      {
        const upgradeBox=document.createElement("div");upgradeBox.className="stat-upgrades";
        const heading=document.createElement("p");heading.className="stat-upgrades-heading";heading.textContent="Stat upgrades · +1 each, once per stat";upgradeBox.append(heading);
        statUpgrades.forEach(s=>upgradeBox.append(check("+"+s.key+" "+s.label,{cost:"+"+(character?s.character:s.unit*(u.models||1))+" pts",checked:!!u.upgrades?.[s.key],onChange:v=>{u.upgrades={...(u.upgrades||{}),[s.key]:v};updateTotals();}})));
        options.append(upgradeBox);
      }
      main.append(type,ml,options);const cost=document.createElement("strong");cost.className="army-cost";const remove=document.createElement("button");remove.className="remove-unit secondary-button";remove.textContent="×";remove.title="Remove unit "+(index+1);remove.setAttribute("aria-label","Remove unit "+(index+1));remove.addEventListener("click",()=>{army.splice(index,1);renderRows();});row.append(main,cost,remove);list.append(row);
    });updateTotals();
  }
  $("faction-select").addEventListener("change",()=>{faction=$("faction-select").value==="highElves"?"highElves":"empire";army.forEach(defaults);renderRows();});
  function openBuilder(){ $("mainmenu").hidden=true;$("collection-screen").hidden=true;$("mode-screen").hidden=true;$("armybuilder").hidden=false;renderRows(); }
  $("builder-back").addEventListener("click",onBack);
  addButton.addEventListener("click",()=>{if(army.length>=6)return;const u={type:"swordsmen",models:20};defaults(u);army.push(u);renderRows();});
  startButton.addEventListener("click",()=>{if(army.length&&!validateArmy(army,faction))onStart(army.map(u=>({...u})),faction);});
  return {open:openBuilder,refresh:renderRows};
}