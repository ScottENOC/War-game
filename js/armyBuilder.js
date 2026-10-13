export function createArmyBuilder({ $, onStart, onBack }) {
  let faction="empire";
  let army=[{type:"swordsmen",models:20,champion:false,lightArmour:false,heavyArmour:false,weapon:"handWeapon",spears:false,bow:false,barding:false,mounted:false,shield:false,freeCavalryOption:"bow"}];
  const list=$("army-list"),total=$("army-total"),addButton=$("add-unit"),startButton=$("begin-deployment");
  const elf=()=>faction==="highElves",fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1);
  function defaults(u){
    u.champion=false;u.lightArmour=false;u.heavyArmour=false;u.weapon="handWeapon";u.spears=false;u.bow=false;u.barding=false;u.mounted=false;u.shield=false;u.freeCavalryOption="bow";
    if(elf()){if(u.type==="swordsmen"){u.lightArmour=true;u.shield=true;u.spears=true;}if(u.type==="archers")u.lightArmour=true;}
    if(u.type==="captain"||u.type==="lord")u.models=1;else if(u.type==="cavalry")u.models=Math.min(15,Math.max(5,u.models||5));else u.models=Math.min(30,Math.max(5,u.models||10));
  }
  function unitPoints(u){
    const e=elf(),m=u.models||1;
    if(u.type==="captain"||u.type==="lord")return (e?(u.type==="lord"?120:75):(u.type==="lord"?80:50))+(u.heavyArmour?4:0)+(["halberd","greatWeapon"].includes(u.weapon)?4:0)+(u.mounted?8:0)+(u.mounted&&u.weapon==="spear"?2:0)+(u.mounted&&u.weapon==="lance"?4:0)+(u.mounted&&u.barding?4:0)+(u.shield&&!["halberd","greatWeapon"].includes(u.weapon)?2:0);
    if(u.type==="cavalry"){const free=u.freeCavalryOption||"bow";return m*(e?24:16)+(u.bow&&!(e&&free==="bow")?2*m:0)+(u.heavyArmour?2*m:0)+(u.barding?2*m:0)+(u.shield&&u.weapon!=="greatWeapon"?0.5*m:0)+(u.weapon==="spear"&&!(e&&free==="spear")?m:0)+(["lance","greatWeapon"].includes(u.weapon)?2*m:0);}
    return m*(e?(u.type==="swordsmen"?12:15):(u.type==="swordsmen"?8:10))+(u.champion?(e?9:6):0)+(u.lightArmour&&!e?m:0)+(u.spears&&!(e&&u.type==="swordsmen")?m:0)+(u.shield&&!(e&&u.type==="swordsmen")?0.5*m:0);
  }
  function check(label,{cost="",checked=false,disabled=false,onChange}={}){const l=document.createElement("label"),c=document.createElement("input");c.type="checkbox";c.checked=checked;c.disabled=disabled;c.addEventListener("change",()=>onChange(c.checked));l.append(c,document.createTextNode(label+(cost?" ("+cost+")":"")));return l;}
  function select(label,html,value,onChange){const l=document.createElement("label");l.append(document.createTextNode(label+" "));const s=document.createElement("select");s.innerHTML=html;s.value=value;s.addEventListener("change",()=>onChange(s.value));l.append(s);return l;}
  function updateTotals(){let sum=0;list.querySelectorAll(".army-row").forEach((row,i)=>{const cost=unitPoints(army[i]);sum+=cost;row.querySelector(".army-cost").textContent=fmt(cost)+" pts";});total.textContent=fmt(sum)+" pts";addButton.disabled=army.length>=6;addButton.textContent=army.length>=6?"6 / 6 Units":"＋ Add Unit ("+army.length+"/6)";startButton.disabled=!army.length;}
  function renderRows(){
    list.replaceChildren();
    army.forEach((u,index)=>{
      const row=document.createElement("article");row.className="army-row";const main=document.createElement("div");main.className="army-row-main";
      const type=document.createElement("select");type.setAttribute("aria-label","Unit "+(index+1)+" type");
      type.innerHTML='<option value="swordsmen">'+(elf()?"High Elf Spearmen · 12 pts/model":"Swordsmen · 8 pts/model")+'</option><option value="archers">'+(elf()?"High Elf Archers · 15 pts/model":"Archers · 10 pts/model")+'</option><option value="captain">'+(elf()?"High Elf Hero · 75 pts":"Human Captain · 50 pts")+'</option><option value="lord">'+(elf()?"High Elf Lord · 120 pts":"Empire General (Lord) · 80 pts")+'</option><option value="cavalry">'+(elf()?"High Elf Cavalry · 24 pts/model":"Cavalry · 16 pts/model")+'</option>';
      type.value=u.type;type.addEventListener("change",()=>{u.type=type.value;defaults(u);renderRows();});
      const ml=document.createElement("label");ml.append(document.createTextNode("Models "));const models=document.createElement("input");models.type="number";models.min="5";models.max=u.type==="cavalry"?"15":"30";models.step="1";models.value=u.models;models.inputMode="numeric";models.disabled=u.type==="captain"||u.type==="lord";models.setAttribute("aria-label","Unit "+(index+1)+" model count");models.addEventListener("change",()=>{const p=Number.parseInt(models.value,10);u.models=Number.isFinite(p)?Math.max(5,Math.min(u.type==="cavalry"?15:30,p)):5;models.value=u.models;updateTotals();});ml.append(models);
      const options=document.createElement("div");options.className="army-options";const character=u.type==="captain"||u.type==="lord",cavalry=u.type==="cavalry",infantry=u.type==="swordsmen"||u.type==="archers";
      if(!character&&!cavalry)options.append(check("Champion",{cost:"+"+(elf()?9:6)+" pts",checked:!!u.champion,onChange:v=>{u.champion=v;updateTotals();}}));
      if(character){
        if(elf()){const rule=document.createElement("p");rule.textContent="Always Strikes First: +10 Initiative; reroll missed melee hits when natural Initiative exceeds the target’s.";options.append(rule);}
        options.append(check("Heavy armour",{cost:"+4 pts (5+ save)",checked:!!u.heavyArmour,onChange:v=>{u.heavyArmour=v;updateTotals();}}));
        options.append(check("Shield",{cost:"+2 pts, +1 front armour save",checked:!!u.shield,disabled:["halberd","greatWeapon"].includes(u.weapon),onChange:v=>{u.shield=v;updateTotals();}}));
        options.append(select("Weapon",'<option value="handWeapon">Sword/hand weapon (included)</option><option value="halberd">Halberd (+4 pts)</option><option value="greatWeapon">Great weapon (+4 pts, +2 Strength, −10 Initiative)</option>'+(u.mounted?'<option value="spear">Spear (+2 pts, charge)</option><option value="lance">Lance (+4 pts, charge)</option>':""),u.weapon,v=>{u.weapon=v;if(["halberd","greatWeapon"].includes(v))u.shield=false;updateTotals();renderRows();}));
        options.append(check("Warhorse",{cost:"+8 pts",checked:!!u.mounted,onChange:v=>{u.mounted=v;u.barding=false;if(!v&&["spear","lance"].includes(u.weapon))u.weapon="handWeapon";renderRows();}}));
        if(u.mounted)options.append(check("Barding",{cost:"+4 pts, +1 save"+(elf()?", no Move penalty":", −1 Move"),checked:!!u.barding,onChange:v=>{u.barding=v;updateTotals();}}));
      }else if(cavalry){
        const kit=document.createElement("p");kit.textContent=elf()?"Includes sword, light armour and horse. Choose one free: bow or spear. Always Strikes First.":"Includes sword, light armour and horse (+1 armour save).";options.append(kit);
        if(elf()){
          options.append(select("Free equipment",'<option value="bow">Bow (24″ range)</option><option value="spear">Spear (+1 Strength on charge)</option>',u.freeCavalryOption||"bow",v=>{u.freeCavalryOption=v;if(v==="bow")u.bow=false;if(v==="spear"&&u.weapon==="spear")u.weapon="handWeapon";updateTotals();renderRows();}));
          options.append(select("Weapon upgrade",'<option value="handWeapon">No upgrade</option><option value="lance">Lance (+2/model)</option><option value="greatWeapon">Great weapon (+2/model)</option>',["lance","greatWeapon"].includes(u.weapon)?u.weapon:"handWeapon",v=>{u.weapon=v;if(["halberd","greatWeapon"].includes(v))u.shield=false;updateTotals();renderRows();}));
          if(u.freeCavalryOption==="spear")options.append(check("Add bow",{cost:"+2/model",checked:!!u.bow,onChange:v=>{u.bow=v;updateTotals();}}));
        }else{
          options.append(select("Weapon",'<option value="handWeapon">Sword/hand weapon (included)</option><option value="spear">Spear (+1/model)</option><option value="lance">Lance (+2/model)</option><option value="greatWeapon">Great weapon (+2/model)</option>',u.weapon||"handWeapon",v=>{u.weapon=v;if(["halberd","greatWeapon"].includes(v))u.shield=false;updateTotals();renderRows();}));
          options.append(check("Bow",{cost:"+2/model",checked:!!u.bow,onChange:v=>{u.bow=v;updateTotals();}}));
        }
        options.append(check("Heavy armour",{cost:"+2/model",checked:!!u.heavyArmour,onChange:v=>{u.heavyArmour=v;updateTotals();}}));
        options.append(check("Barding",{cost:"+2/model, +1 save"+(elf()?", no Move penalty":", −1 Move"),checked:!!u.barding,onChange:v=>{u.barding=v;updateTotals();}}));
        options.append(check("Shield",{cost:"+0.5/model, +1 front armour save",checked:!!u.shield,disabled:u.weapon==="greatWeapon",onChange:v=>{u.shield=v;updateTotals();}}));
      }else if(infantry){
        if(elf()&&u.type==="swordsmen"){const kit=document.createElement("p");kit.textContent="Includes light armour, shield and spear; fights in three ranks. Always Strikes First.";options.append(kit);}
        else{
          if(elf()&&u.type==="archers"){const kit=document.createElement("p");kit.textContent="Includes light armour and longbow (30″ range). Always Strikes First.";options.append(kit);}
          else options.append(check("Light armour",{cost:"+1/model",checked:!!u.lightArmour,onChange:v=>{u.lightArmour=v;updateTotals();}}));
          options.append(check("Shield",{cost:"+0.5/model, +1 front armour save",checked:!!u.shield,onChange:v=>{u.shield=v;updateTotals();}}));
          if(u.type==="swordsmen"&&!elf())options.append(check("Spears",{cost:"+1/model, fights in two ranks",checked:!!u.spears,onChange:v=>{u.spears=v;updateTotals();}}));
        }
      }
      main.append(type,ml,options);const cost=document.createElement("strong");cost.className="army-cost";const remove=document.createElement("button");remove.className="remove-unit secondary-button";remove.textContent="×";remove.title="Remove unit "+(index+1);remove.setAttribute("aria-label","Remove unit "+(index+1));remove.addEventListener("click",()=>{army.splice(index,1);renderRows();});row.append(main,cost,remove);list.append(row);
    });updateTotals();
  }
  $("faction-select").addEventListener("change",()=>{faction=$("faction-select").value==="highElves"?"highElves":"empire";army.forEach(defaults);renderRows();});
  $("menu-build").addEventListener("click",()=>{$("mainmenu").hidden=true;$("armybuilder").hidden=false;renderRows();});
  $("builder-back").addEventListener("click",onBack);
  addButton.addEventListener("click",()=>{if(army.length>=6)return;const u={type:"swordsmen",models:20};defaults(u);army.push(u);renderRows();});
  startButton.addEventListener("click",()=>{if(army.length)onStart(army.map(u=>({...u})),faction);});
}