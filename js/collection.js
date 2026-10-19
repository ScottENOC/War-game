const STORAGE_KEY="warGameMiniatureCollectionV1";
const bodyKinds=[
  {id:"human_infantry_body",label:"Human infantry body",faction:"empire",kind:"infantry"},
  {id:"elf_infantry_body",label:"Elf infantry body",faction:"highElves",kind:"infantry"},
  {id:"human_cavalry_body",label:"Human cavalry rider body",faction:"empire",kind:"cavalry"},
  {id:"elf_cavalry_body",label:"Elf cavalry rider body",faction:"highElves",kind:"cavalry"},
  {id:"human_hero_body",label:"Human hero body",faction:"empire",kind:"captain"},
  {id:"elf_hero_body",label:"Elf hero body",faction:"highElves",kind:"captain"},
  {id:"human_lord_body",label:"Human lord body",faction:"empire",kind:"lord"},
  {id:"elf_lord_body",label:"Elf lord body",faction:"highElves",kind:"lord"},
  {id:"dwarf_infantry_body",label:"Dwarf infantry body",faction:"dwarfs",kind:"dwarfInfantry"},
  {id:"dwarf_hero_body",label:"Dwarf thane body",faction:"dwarfs",kind:"dwarfCaptain"},
  {id:"dwarf_lord_body",label:"Dwarf lord body",faction:"dwarfs",kind:"dwarfLord"},
  {id:"haldric_stoneward_body",label:"King Haldric Stoneward (named character)",faction:"dwarfs",kind:"dwarfKingHaldric",namedCharacter:true},
  {id:"edric_voss_body",label:"Lord-Marshal Edric Voss (named character)",faction:"empire",kind:"legendaryLord",namedCharacter:true},
  {id:"lethariel_starweaver_body",label:"Lethariel Starweaver (named character)",faction:"highElves",kind:"shadowElf",namedCharacter:true},
  {id:"aelthir_dawnwing_body",label:"Aelthir, the Dawnwing (named character)",faction:"highElves",kind:"pegasusChampion",namedCharacter:true},
  {id:"goblin_infantry_body",label:"Goblin infantry body",faction:"greenskins",kind:"goblins"},
  {id:"orc_infantry_body",label:"Orc infantry body",faction:"greenskins",kind:"orcBoyz"},
  {id:"goblin_cavalry_body",label:"Goblin wolf-rider body",faction:"greenskins",kind:"wolfRiders"},
  {id:"orc_cavalry_body",label:"Orc boar-rider body",faction:"greenskins",kind:"boarBoyz"},
  {id:"goblin_hero_body",label:"Goblin Big Boss body",faction:"greenskins",kind:"goblinHero"},
  {id:"goblin_lord_body",label:"Goblin Warboss body",faction:"greenskins",kind:"goblinLord"},
  {id:"orc_hero_body",label:"Orc Big Boss body",faction:"greenskins",kind:"orcHero"},
  {id:"orc_lord_body",label:"Orc Warboss body",faction:"greenskins",kind:"orcLord"},
  {id:"goblin_crew_body",label:"Goblin catapult crew body",faction:"greenskins",kind:"catapult"}
];
const bitDefs=[
 ...bodyKinds.map(x=>({id:x.id,label:x.label,kind:"body"})),
 {id:"horse",label:"Horse",kind:"mount"},{id:"eagle",label:"Pegasus",kind:"mount"},{id:"wolf",label:"Wolf",kind:"mount"},{id:"boar",label:"Boar",kind:"mount"},
 {id:"right_sword",label:"Right arm · sword",kind:"right",weapon:"handWeapon"},
 {id:"right_club",label:"Right arm · crude club",kind:"right",weapon:"handWeapon"},
 {id:"right_spear",label:"Right arm · spear",kind:"right",weapon:"spear"},
 {id:"right_lance",label:"Right arm · lance",kind:"right",weapon:"lance"},
 {id:"left_empty_arm",label:"Left arm · empty hand",kind:"leftEmpty"},
 {id:"left_sword",label:"Left arm · sword",kind:"leftSword",weapon:"offhandWeapon"},
 {id:"left_shield",label:"Left arm · shield",kind:"shield"},
 {id:"both_greatWeapon",label:"Both arms · great weapon",kind:"twohand",weapon:"greatWeapon"},
 {id:"both_halberd",label:"Both arms · halberd",kind:"twohand",weapon:"halberd"},
 {id:"both_bow",label:"Both arms · bow",kind:"twohand",weapon:"bow"},
 {id:"both_crossbow",label:"Both arms · crossbow",kind:"twohand",weapon:"crossbow"},
 {id:"both_firearm",label:"Both arms · firearm",kind:"twohand",weapon:"firearm"},
 {id:"back_bow",label:"Bow carried on back",kind:"backWeapon",weapon:"bow"},
 {id:"back_greatsword",label:"Greatsword carried on back",kind:"backWeapon",weapon:"greatWeapon"},
 {id:"back_crossbow",label:"Crossbow carried on back",kind:"backWeapon",weapon:"crossbow"},
 {id:"back_halberd",label:"Halberd carried on back",kind:"backWeapon",weapon:"halberd"},
 {id:"back_spear",label:"Spear carried on back",kind:"backWeapon",weapon:"spear"},
 {id:"back_firearm",label:"Firearm carried on back",kind:"backWeapon",weapon:"firearm"}
];
const labels={empire:"Human / Empire",highElves:"High Elf",dwarfs:"Dwarf",greenskins:"Greenskins",goblins:"Goblin Mob",orcBoyz:"Orc Boyz",goblinHero:"Goblin Big Boss",goblinLord:"Goblin Warboss",orcHero:"Orc Big Boss",orcLord:"Orc Warboss",wolfRiders:"Wolf Riders",boarBoyz:"Boar Boyz",catapult:"Rock Lobber",swordsmen:"Infantry Sword",archers:"Infantry",dwarfInfantry:"Dwarf Infantry",dwarfCaptain:"Dwarf Thane",dwarfLord:"Dwarf Lord",dwarfKingHaldric:"King Haldric Stoneward",cavalry:"Cavalry",captain:"Hero",lord:"Lord",legendaryLord:"Lord-Marshal Edric Voss",shadowElf:"Lethariel Starweaver",handWeapon:"Sword",magicBow:"Magical longbow",signature:"Signature equipment",spear:"Spear",lance:"Lance",greatWeapon:"Great weapon",halberd:"Halberd",bow:"Bow",crossbow:"Crossbow",firearm:"Firearm"};
const makeModel=(id,faction,type,weapon,extra={})=>({id,faction,type,weapon,shield:!!extra.shield,mounted:!!extra.mounted,mountType:extra.mountType||(extra.mounted?"horse":"none"),backWeapons:[...(extra.backWeapons||[])],components:["body",weapon,...(extra.shield?["shield"]:[]),...(extra.mounted?[extra.mountType==="eagle"?"eagle":"horse"]:[]),...(extra.backWeapons||[]).map(w=>w==="bow"?"back_bow":w==="crossbow"?"back_crossbow":w==="greatWeapon"?"back_greatsword":w==="halberd"?"back_halberd":w==="spear"?"back_spear":w==="firearm"?"back_firearm":w)],name:extra.name||((faction==="empire"?"Empire ":faction==="dwarfs"?"Dwarf ":faction==="greenskins"?"Greenskin ":"High Elf ")+labels[type]+(type==="swordsmen"||type==="archers"||type==="cavalry"?"":"")+" · "+labels[weapon])});
function starterData(){
 const models=[];let id=1;
 for(let i=0;i<100;i++)models.push(makeModel("starter-"+id++,"empire","swordsmen","handWeapon"));
 for(let i=0;i<50;i++)models.push(makeModel("starter-"+id++,"empire","archers","bow"));
 models.push(makeModel("starter-"+id++,"empire","captain","handWeapon",{name:"Empire Hero · Sword only"}));
 models.push(makeModel("starter-"+id++,"dwarfs","dwarfKingHaldric","handWeapon",{shield:true,name:"King Haldric Stoneward"}));
 return {version:1,nextId:id,models,bits:{},bypass:false,lootboxes:0,lastDailyClaim:null};
}
function load(){
 try{
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
  if(saved&&Array.isArray(saved.models)&&saved.bits&&typeof saved.bits==="object"){
   const merged={...starterData(),...saved};
   const legacyTypes={dwarfWarriors:"dwarfInfantry",dwarfThunderers:"dwarfInfantry",dwarfQuarrellers:"dwarfInfantry",dwarfLongbeards:"dwarfInfantry",dwarfIronbreakers:"dwarfInfantry"};
   merged.models=merged.models.filter(m=>m&&typeof m==="object").map((m,i)=>{
    const type=legacyTypes[m.type]||m.type||"swordsmen";
    const faction=["empire","highElves","dwarfs","greenskins"].includes(m.faction)?m.faction:"empire";
    const weapon=typeof m.weapon==="string"&&m.weapon?m.weapon:"handWeapon";
    const safe={...m,id:typeof m.id==="string"&&m.id?m.id:"recovered-"+(i+1),faction,type,weapon:faction==="dwarfs"&&weapon==="bow"?"crossbow":weapon,shield:!!m.shield,mounted:!!m.mounted,mountType:m.mountType||(m.mounted?"horse":"none"),backWeapons:Array.isArray(m.backWeapons)?m.backWeapons.filter(w=>typeof w==="string").map(w=>faction==="dwarfs"&&w==="bow"?"crossbow":w):[],components:Array.isArray(m.components)?m.components.map(x=>faction==="dwarfs"&&x==="both_bow"?"both_crossbow":faction==="dwarfs"&&x==="back_bow"?"back_crossbow":x):[]};
    if(typeof safe.name!=="string"||!safe.name.trim()){
     const typeLabel=labels[type]||String(type).replace(/([a-z])([A-Z])/g,"$1 $2");
     safe.name=(faction==="empire"?"Empire ":faction==="dwarfs"?"Dwarf ":"High Elf ")+typeLabel+" · "+(labels[weapon]||weapon);
    }
    return safe;
   });
   merged.bits=Object.fromEntries(Object.entries(merged.bits).filter(([k,v])=>typeof k==="string"&&Number.isFinite(Number(v))&&Number(v)>0).map(([k,v])=>[k,Math.floor(Number(v))]));
   merged.nextId=Math.max(Number(merged.nextId)||1,152);
   return merged;
  }
 }catch{}
 return starterData();
}

export function createCollectionManager({$,onSkirmish,onMainMenu,onNarrativeCampaign=()=>{},onRoguelike=()=>{},onResetCollection=()=>{}}){
 let data=load(),editingId=null;
 data.lootboxes=Number.isFinite(data.lootboxes)?Math.max(0,data.lootboxes):0;
 data.lastDailyClaim=data.lastDailyClaim||null;
 const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{}};
 const title=s=>labels[s]||s;
 const bitCount=id=>data.bits[id]||0;
 const addBit=(id,n=1)=>{data.bits[id]=(data.bits[id]||0)+n;};
 const consumeBit=id=>{if(bitCount(id)<1)return false;data.bits[id]--;if(!data.bits[id])delete data.bits[id];return true;};
 const modelLabel=m=>(m.name==="Aelthir, the Dawnwing"?"Aelthir, the Dawnwing":(m.faction==="empire"?"Empire ":m.faction==="dwarfs"?"Dwarf ":m.faction==="greenskins"?"Greenskin ":"High Elf ")+title(m.type))+" · "+title(m.weapon)+(m.offhandWeapon?" + Off-hand sword":"")+(m.shield?" + Shield":"")+((m.backWeapons||[]).length?" · Back: "+m.backWeapons.map(title).join(", "):"")+(m.mountType==="eagle"?" · Pegasus":m.mounted?" · Mounted":"");
 const canUseBit=(m,id)=>{
   const b=bitDefs.find(x=>x.id===id);if(!b)return false;
   if(m.faction==="dwarfs"&&b.weapon==="bow")return false;
   if(b.kind==="backWeapon")return m.weapon!==b.weapon&&!(m.backWeapons||[]).includes(b.weapon);
   if(b.kind==="shield")return !m.shield&&(!["greatWeapon","halberd","bow"].includes(m.weapon)||m.faction==="dwarfs");
   if(b.kind==="mount")return (m.type==="captain"||m.type==="lord"||m.type==="dwarfCaptain"||m.type==="dwarfLord"||m.type==="goblinHero"||m.type==="goblinLord"||m.type==="orcHero"||m.type==="orcLord"||["cavalry","wolfRiders","boarBoyz"].includes(m.type))&&!m.mounted&&m.weapon!=="halberd"&&(id!=="eagle"||m.faction==="highElves")&&(id!=="wolf"||m.faction==="greenskins"&&["goblins","goblinHero","goblinLord"].includes(m.type))&&(id!=="boar"||m.faction==="greenskins"&&["orcBoyz","orcHero","orcLord"].includes(m.type))&&m.faction!=="dwarfs";
   if(b.kind==="right")return m.weapon==="none"&&m.type!=="archers"&&m.type!=="swordsmen";
   if(b.kind==="leftSword")return !m.shield&&!["greatWeapon","halberd","bow","crossbow","firearm"].includes(m.weapon)&&!m.components?.includes("left_sword")&&(m.faction==="highElves"||((m.type==="captain"||m.type==="lord")&&m.faction==="empire"));
   if(b.kind==="twohand")return m.weapon==="none"&&(b.weapon!=="halberd"||!m.mounted);
   return false;
 };
 function screen(section,heading){const el=document.createElement(section?"section":"div");el.className="inventory-card";const h=document.createElement("h3");h.textContent=heading;el.append(h);return el;}
 function localDayKey(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
 function canClaimDaily(){return data.lastDailyClaim!==localDayKey();}
 function claimDailyLootbox(){
  if(!canClaimDaily())return;
  data.lastDailyClaim=localDayKey();data.lootboxes++;save();renderAll();
  $("daily-lootbox-status").textContent="Daily lootbox claimed. You have "+data.lootboxes+" unopened box"+(data.lootboxes===1?"":"es")+".";
 }
 function renderSummary(){
  const el=$("collection-summary");el.replaceChildren();
  const stats=[["Models",data.models.length],["Loose bits",Object.values(data.bits).reduce((a,b)=>a+b,0)],["Lootboxes",data.lootboxes],["Empire models",data.models.filter(m=>m.faction==="empire").length]];
  stats.forEach(([k,v])=>{const card=document.createElement("div");card.className="collection-stat";const strong=document.createElement("strong");strong.textContent=v;const span=document.createElement("span");span.textContent=k;card.append(strong,span);el.append(card);});
 }
 function renderModels(){
  const root=$("model-inventory");root.replaceChildren();
  const safeModels=data.models.filter(m=>m&&typeof m==="object");
  const modelKey=m=>JSON.stringify([m.faction||"empire",m.type||"swordsmen",m.weapon||"handWeapon",!!m.shield,!!m.mounted,m.mountType||"none",!!m.offhandWeapon,Array.isArray(m.backWeapons)?m.backWeapons:[]]);
  const counts=new Map();
  safeModels.forEach(m=>{const key=modelKey(m);counts.set(key,(counts.get(key)||0)+1);});
  const groups=[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  if(!groups.length){root.textContent="No assembled models yet.";return;}
  groups.forEach(([key,count])=>{
   const [faction,type,weapon,shield,mounted,mountType,offhand,backWeapons]=JSON.parse(key);
   const card=document.createElement("article");card.className="inventory-model";
   const strong=document.createElement("strong");
   strong.textContent=type==="legendaryLord"?"Lord-Marshal Edric Voss":type==="shadowElf"?"Lethariel Starweaver":type==="pegasusChampion"?"Aelthir, the Dawnwing":(faction==="empire"?"Empire ":faction==="dwarfs"?"Dwarf ":"High Elf ")+(labels[type]||String(type).replace(/([a-z])([A-Z])/g,"$1 $2"));
   const meta=document.createElement("span");
   meta.textContent=(labels[weapon]||String(weapon))+(offhand?" · Off-hand sword":"")+(shield?" · Shield":"")+(backWeapons.length?" · Back: "+backWeapons.map(w=>labels[w]||w).join(", "):"")+(mountType==="eagle"?" · Pegasus":mounted?" · Mounted":"");
   const qty=document.createElement("b");qty.textContent="×"+count;card.append(strong,meta,qty);
   const edit=document.createElement("button");edit.className="secondary-button";edit.textContent="Add component";
   const model=safeModels.find(m=>modelKey(m)===key);
   edit.disabled=!bitDefs.some(b=>canUseBit(model,b.id)&&bitCount(b.id)>0);
   edit.addEventListener("click",()=>{editingId=model.id;renderWorkbench();$("model-workbench").scrollIntoView({behavior:"smooth",block:"nearest"});});
   card.append(edit);root.append(card);
  });
 }
 function renderBits(){
  const root=$("bit-inventory");root.replaceChildren();
  const items=bitDefs.filter(b=>bitCount(b.id)>0);
  if(!items.length){root.textContent="No loose bits yet. Open a developer lootbox to test the bit economy.";return;}
  items.forEach(b=>{const el=document.createElement("div");el.className="bit-item";const span=document.createElement("span");span.textContent=b.label;const qty=document.createElement("b");qty.textContent="×"+bitCount(b.id);el.append(span,qty);root.append(el);});
 }
 function renderWorkbench(){
  const root=$("model-workbench");root.replaceChildren();
  const tabs=document.createElement("div");tabs.className="workbench-tabs";
  const editBtn=document.createElement("button");editBtn.className="secondary-button";editBtn.textContent="Upgrade existing model";
  const buildBtn=document.createElement("button");buildBtn.className="secondary-button";buildBtn.textContent="Assemble new model";tabs.append(editBtn,buildBtn);root.append(tabs);
  const panel=document.createElement("div");panel.className="workbench-form";root.append(panel);
  function field(label,options,value){const wrap=document.createElement("label");wrap.textContent=label;const sel=document.createElement("select");options.forEach(o=>{const opt=document.createElement("option");opt.value=o.value;opt.textContent=o.label;sel.append(opt);});if(value!==undefined)sel.value=value;wrap.append(sel);panel.append(wrap);return sel;}
  function renderEdit(){
   panel.replaceChildren();
   const model=data.models.find(m=>m.id===editingId)||data.models[0];
   if(!model){panel.textContent="Assemble a model first.";return;}
   const candidates=data.models.map(m=>({value:m.id,label:modelLabel(m)}));
   const choose=field("Model to upgrade",candidates,model.id);choose.addEventListener("change",()=>{editingId=choose.value;renderWorkbench();});
   const possible=bitDefs.filter(b=>bitCount(b.id)>0&&canUseBit(model,b.id));
   if(!possible.length){const p=document.createElement("p");p.textContent="No compatible bits available. Components already glued to a model cannot be removed or swapped.";panel.append(p);return;}
   const bit=field("Add component permanently",possible.map(b=>({value:b.id,label:b.label+" · "+bitCount(b.id)+" owned"})),possible[0].id);
   const add=document.createElement("button");add.className="primary-button";add.textContent="Glue component onto model";
   add.addEventListener("click",()=>{const def=bitDefs.find(b=>b.id===bit.value);if(!def||!consumeBit(def.id))return;
    if(def.kind==="backWeapon"){model.backWeapons=[...(model.backWeapons||[]),def.weapon];model.components.push(def.id);}
    if(def.kind==="shield"){model.shield=true;model.components.push("left_shield");}
    if(def.kind==="mount"){model.mounted=true;model.mountType=def.id==="eagle"?"eagle":"horse";model.components.push(model.mountType==="eagle"?"eagle":"horse");}
    if(def.kind==="right"||def.kind==="twohand"){model.weapon=def.weapon;model.components.push(def.id);}
    if(def.kind==="leftSword"){model.components.push("left_sword");model.offhandWeapon=true;}
    model.name=modelLabel(model);save();renderAll();editingId=model.id;renderWorkbench();
   });panel.append(add);
   const note=document.createElement("p");note.className="subtle";note.textContent="This is permanent: you can add components, but cannot remove or replace them.";panel.append(note);
  }
  function renderBuild(){
   panel.replaceChildren();
   const faction=field("Faction",[{value:"empire",label:"Human / Empire"},{value:"highElves",label:"High Elf"},{value:"dwarfs",label:"Dwarf"},{value:"greenskins",label:"Greenskins"}],"empire");
   const kind=field("Main body",bodyKinds.map(b=>({value:b.id,label:b.label})),bodyKinds[0].id);
   const weapon=field("Arms / weapon",[], "right_sword");
   const horseWrap=field("Mount",[{value:"no",label:"No mount"},{value:"yes",label:"Add horse"},{value:"eagle",label:"Pegasus (High Elves)"},{value:"wolf",label:"Wolf (Greenskins)"},{value:"boar",label:"Boar (Greenskins)"}],"no");
   const refresh=()=>{
    const body=bodyKinds.find(b=>b.id===kind.value);const cavalry=["cavalry","wolfRiders","boarBoyz"].includes(body.kind);const named=!!body.namedCharacter;const hero=["captain","lord","dwarfCaptain","dwarfLord","goblinHero","goblinLord","orcHero","orcLord"].includes(body.kind)||named;
    horseWrap.querySelectorAll("option").forEach(o=>{if(o.value==="eagle")o.disabled=body.faction!=="highElves"||!(cavalry||hero);if(o.value==="yes")o.disabled=body.faction==="dwarfs"||!(cavalry||hero);if(o.value==="wolf")o.disabled=body.faction!=="greenskins"||!["wolfRiders","goblinHero","goblinLord"].includes(body.kind);if(o.value==="boar")o.disabled=body.faction!=="greenskins"||!["boarBoyz","orcHero","orcLord"].includes(body.kind);});
    if(horseWrap.selectedOptions[0]?.disabled)horseWrap.value="no";if(body.kind==="pegasusChampion"){horseWrap.value="eagle";horseWrap.querySelectorAll("option").forEach(o=>{o.disabled=o.value!=="eagle";});}
    offhandLabel.hidden=!(body.faction==="highElves"||((body.kind==="captain"||body.kind==="lord")&&body.faction==="empire"));if(offhandLabel.hidden)offhandCheck.checked=false;
    [...weapon.options].forEach(o=>o.remove());
    const rangedArms=body.faction==="empire"?["both_bow","both_crossbow","both_firearm"]:["both_bow"];
    const arms=named?["signature"]:(cavalry?(body.faction==="empire"?["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms]:["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms]):(hero?(horseWrap.value!=="no"?["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms]:["right_sword","right_spear","both_greatWeapon","both_halberd",...rangedArms]):(body.faction==="empire"?["right_sword","right_spear","both_bow","both_crossbow","both_firearm","both_greatWeapon","both_halberd"]:["right_sword","right_spear","both_bow","both_greatWeapon","both_halberd"])));
    
    arms.forEach(id=>{const d=bitDefs.find(b=>b.id===id);const o=document.createElement("option");o.value=id;o.textContent=named?(body.kind==="legendaryLord"?"Signature sword and shield (included)":body.kind==="pegasusChampion"?"Magical lance and shield (included)":"Magical longbow and dual swords (included)"):d.label+" ("+bitCount(id)+" owned)";weapon.append(o);});
    horseWrap.parentElement.hidden=body.faction==="dwarfs"||(named&&body.kind==="shadowElf"?!cavalry:!cavalry&&!hero);
    if(!cavalry&&!hero)horseWrap.value="no";
    if(cavalry)horseWrap.value="yes";
    if(named&&body.kind==="shadowElf")horseWrap.value="no";
   };
   kind.addEventListener("change",refresh);horseWrap.addEventListener("change",refresh);refresh();
   const offhandLabel=document.createElement("label");offhandLabel.className="assembly-shield";const offhandCheck=document.createElement("input");offhandCheck.type="checkbox";offhandCheck.checked=false;offhandLabel.append(offhandCheck,document.createTextNode("Add left hand holding a sword (requires a left-hand sword bit)"));panel.append(offhandLabel);
   const shieldLabel=document.createElement("label");shieldLabel.className="assembly-shield";const shieldCheck=document.createElement("input");shieldCheck.type="checkbox";shieldCheck.checked=false;shieldLabel.append(shieldCheck,document.createTextNode("Add left arm holding a shield (requires a shield bit)"));panel.append(shieldLabel);
   const p=document.createElement("p");p.className="subtle";p.textContent="A finished model consumes its main body, the selected arms, and a horse if mounted. Elf and human arms are interchangeable.";panel.append(p);
   const assemble=document.createElement("button");assemble.className="primary-button";assemble.textContent="Assemble model";
   assemble.addEventListener("click",()=>{
    const body=bodyKinds.find(b=>b.id===kind.value),named=!!body.namedCharacter,arms=named?{id:"signature",kind:"signature",weapon:body.kind==="legendaryLord"?"handWeapon":body.kind==="pegasusChampion"?"lance":"magicBow"}:bitDefs.find(b=>b.id===weapon.value),mountType=["eagle","wolf","boar"].includes(horseWrap.value)?horseWrap.value:horseWrap.value==="yes"?"horse":"none",mounted=mountType!=="none"&&(body.kind==="cavalry"||["wolfRiders","boarBoyz","captain","lord","dwarfCaptain","dwarfLord","goblinHero","goblinLord","orcHero","orcLord","legendaryLord","pegasusChampion"].includes(body.kind));
    if(body.faction!==faction.value){status.textContent="Choose a main body matching the selected faction.";return;}
    if(mounted&&arms.weapon==="halberd"){status.textContent="Halberds cannot be used by mounted models.";return;}
    if(mountType==="eagle"&&(body.faction!=="highElves"||arms.weapon==="halberd")){status.textContent="Pegasi are available to High Elves and cannot carry halberds.";return;}
    const addShield=named?["legendaryLord","pegasusChampion"].includes(body.kind):shieldCheck.checked&&(arms.kind==="right"||body.faction==="dwarfs");if(!named&&shieldCheck.checked&&!addShield){status.textContent="Two-handed weapons use both arms and cannot take a shield.";return;}
    const addOffhand=named?body.kind==="shadowElf":offhandCheck.checked&&!offhandLabel.hidden;if(!named&&addOffhand&&arms.kind!=="right"){status.textContent="A left-hand sword needs a free right-hand weapon, not a two-handed weapon.";return;}if(addShield&&addOffhand){status.textContent="A model cannot hold both a shield and a sword in its left hand.";return;}
    const need=[body.id];if(!named){need.push(arms.id);if(arms.kind==="right")need.push(addShield?"left_shield":addOffhand?"left_sword":"left_empty_arm");else if(addShield)need.push("left_shield");}if(mounted)need.push(mountType==="eagle"?"eagle":"horse");if(mountType==="eagle"&&body.kind!=="pegasusChampion")need.push("back_bow");
    const shortage=need.find(id=>bitCount(id)<1);if(shortage){status.textContent="Not enough bits: "+bitDefs.find(b=>b.id===shortage).label+".";return;}
    if(body.kind==="cavalry"&&!mounted){status.textContent="Cavalry bodies require a horse.";return;}
    if(body.faction==="highElves"&&["crossbow","firearm"].includes(arms.weapon)){status.textContent="High Elves refuse crossbows and firearms.";return;}
    need.forEach(consumeBit);
    const type=body.kind==="infantry"?(arms.weapon==="bow"?"archers":"swordsmen"):body.kind;
    const namedName=body.kind==="legendaryLord"?"Lord-Marshal Edric Voss":body.kind==="shadowElf"?"Lethariel Starweaver":body.kind==="pegasusChampion"?"Aelthir, the Dawnwing":null;
    const model=makeModel("assembled-"+data.nextId++,body.faction,type,arms.weapon,{mounted,mountType,shield:addShield,backWeapons:mountType==="eagle"&&body.kind!=="pegasusChampion"?["bow"]:[],name:namedName||(body.faction==="empire"?"Empire ":body.faction==="dwarfs"?"Dwarf ":"High Elf ")+title(type)+" · "+title(arms.weapon)+(addShield?" + Shield":"")+(mounted?" · Mounted":"")});
    model.components=[body.id,...(!named?[arms.id,...(arms.kind==="right"?[addShield?"left_shield":addOffhand?"left_sword":"left_empty_arm"]:addShield?["left_shield"]:[])]:[]),...(mounted?[mountType==="eagle"?"eagle":"horse"]:[]),...(mountType==="eagle"&&body.kind!=="pegasusChampion"?["back_bow"]:[])];model.offhandWeapon=addOffhand;model.namedCharacter=named;
    data.models.push(model);save();renderAll();status.textContent="Model assembled and added to your collection.";
   });panel.append(assemble);
   const status=document.createElement("p");status.className="workbench-status";panel.append(status);
  }
  editBtn.addEventListener("click",renderEdit);buildBtn.addEventListener("click",renderBuild);renderEdit();
 }
 function renderAll(){renderSummary();renderModels();renderBits();renderWorkbench();renderDailyReward();$("bypass-model-check").checked=!!data.bypass;}
 function rarityWeightedModel(){
  const pool=[
   {faction:"empire",type:"swordsmen",weapon:"handWeapon",cost:8},
   {faction:"empire",type:"archers",weapon:"bow",cost:10},
   {faction:"empire",type:"swordsmen",weapon:"crossbow",cost:11},
   {faction:"empire",type:"swordsmen",weapon:"firearm",cost:12},
   {faction:"empire",type:"cavalry",weapon:"handWeapon",cost:16,mounted:true},
   {faction:"empire",type:"captain",weapon:"handWeapon",cost:50},
   {faction:"empire",type:"captain",weapon:"crossbow",cost:53},
   {faction:"empire",type:"captain",weapon:"firearm",cost:54},
   {faction:"empire",type:"lord",weapon:"handWeapon",cost:80},
   {faction:"empire",type:"lord",weapon:"crossbow",cost:83},
   {faction:"empire",type:"lord",weapon:"firearm",cost:84},
   {faction:"highElves",type:"swordsmen",weapon:"handWeapon",cost:12},
   {faction:"highElves",type:"archers",weapon:"bow",cost:15},
   {faction:"highElves",type:"cavalry",weapon:"spear",cost:32,mounted:true,mountType:"eagle"},
   {faction:"highElves",type:"captain",weapon:"spear",cost:83,mounted:true,mountType:"eagle"},
   {faction:"highElves",type:"lord",weapon:"spear",cost:128,mounted:true,mountType:"eagle"},
   {faction:"highElves",type:"captain",weapon:"handWeapon",cost:75},
   {faction:"highElves",type:"lord",weapon:"handWeapon",cost:120},
   {faction:"empire",type:"legendaryLord",weapon:"handWeapon",cost:160,namedCharacter:true},
   {faction:"highElves",type:"shadowElf",weapon:"magicBow",cost:165,namedCharacter:true},
   {faction:"highElves",type:"pegasusChampion",weapon:"lance",cost:110,mounted:true,mountType:"eagle",shield:true,namedCharacter:true}
  ];
  const weights=pool.map(p=>1/p.cost),sum=weights.reduce((a,b)=>a+b,0);let n=Math.random()*sum;
  for(let i=0;i<pool.length;i++){n-=weights[i];if(n<=0)return pool[i];}return pool[0];
 }
 function openLootbox(){
  if(data.lootboxes<1){$("lootbox-result").textContent="No unopened lootboxes. Claim today's free box or win a skirmish.";return;}
  data.lootboxes--;
  rollLootboxItem();
 }
 function rollLootboxItem(){
  const bitChance=0.72;
  if(Math.random()<bitChance){
   const valid=bitDefs.filter(b=>b.kind!=="mount"||bodyKinds.some(x=>x.kind==="cavalry"||x.kind==="captain"||x.kind==="lord"));
   const def=valid[Math.floor(Math.random()*valid.length)];addBit(def.id);
   $("lootbox-result").textContent="Lootbox: "+def.label+". Added one bit.";
  }else{
   const p=rarityWeightedModel();const namedName=p.type==="legendaryLord"?"Lord-Marshal Edric Voss":p.type==="shadowElf"?"Lethariel Starweaver":p.type==="pegasusChampion"?"Aelthir, the Dawnwing":null;const model=makeModel("loot-"+data.nextId++,p.faction,p.type,p.weapon,{mounted:!!p.mounted,mountType:p.mountType|| (p.mounted?"horse":"none"),shield:p.type==="legendaryLord"||p.type==="pegasusChampion",backWeapons:p.mountType==="eagle"&&p.type!=="pegasusChampion"?["bow"]:[],name:namedName||(p.faction==="empire"?"Empire ":"High Elf ")+title(p.type)+" · "+title(p.weapon)+(p.mountType==="eagle"?" · Pegasus":p.mounted?" · Mounted":"")});model.namedCharacter=!!p.namedCharacter;model.offhandWeapon=p.type==="shadowElf";model.components=p.namedCharacter?[p.type==="legendaryLord"?"edric_voss_body":p.type==="pegasusChampion"?"aelthir_dawnwing_body":"lethariel_starweaver_body"]:model.components;
   data.models.push(model);$("lootbox-result").textContent="Lootbox: "+modelLabel(model)+". Added one complete model.";
  }
  save();renderAll();
 }
 function grantLootbox(source="reward"){
  data.lootboxes++;save();
  $("lootbox-result").textContent=source==="skirmish"?"Victory reward: one lootbox added to your collection.":"One lootbox added to your collection.";
  renderAll();
 }
 function grantRoguelikeModel(category,round){
  const pools={
   infantry:[
    {faction:"empire",type:"swordsmen",weapon:"handWeapon"},
    {faction:"empire",type:"archers",weapon:"bow"},
    {faction:"highElves",type:"swordsmen",weapon:"spear"},
    {faction:"highElves",type:"archers",weapon:"bow"},
    {faction:"dwarfs",type:"dwarfInfantry",weapon:"handWeapon"}
   ],
   cavalry:[
    {faction:"empire",type:"cavalry",weapon:"spear",mounted:true,mountType:"horse"},
    {faction:"highElves",type:"cavalry",weapon:"spear",mounted:true,mountType:"horse"},
    {faction:"highElves",type:"cavalry",weapon:"spear",mounted:true,mountType:"eagle"},
    {faction:"highElves",type:"pegasusChampion",weapon:"lance",mounted:true,mountType:"eagle",shield:true,namedCharacter:true,name:"Aelthir, the Dawnwing"}
   ],
   character:[
    {faction:"empire",type:"captain",weapon:"handWeapon"},
    {faction:"empire",type:"lord",weapon:"handWeapon"},
    {faction:"highElves",type:"captain",weapon:"handWeapon"},
    {faction:"highElves",type:"lord",weapon:"handWeapon"},
    {faction:"dwarfs",type:"dwarfCaptain",weapon:"handWeapon"},
    {faction:"dwarfs",type:"dwarfLord",weapon:"handWeapon"},
    {faction:"empire",type:"legendaryLord",weapon:"handWeapon",namedCharacter:true,name:"Lord-Marshal Edric Voss"},
    {faction:"empire",type:"legendaryLord",weapon:"handWeapon",mounted:true,mountType:"horse",namedCharacter:true,name:"Lord-Marshal Edric Voss · Mounted"},
    {faction:"highElves",type:"shadowElf",weapon:"magicBow",namedCharacter:true,name:"Lethariel Starweaver"},
    {faction:"highElves",type:"shadowElf",weapon:"magicBow",mounted:true,mountType:"horse",namedCharacter:true,name:"Lethariel Starweaver · Mounted"},
    {faction:"highElves",type:"shadowElf",weapon:"magicBow",mounted:true,mountType:"eagle",namedCharacter:true,name:"Lethariel Starweaver · Pegasus"},
    {faction:"dwarfs",type:"dwarfKingHaldric",weapon:"handWeapon",shield:true,namedCharacter:true,name:"King Haldric Stoneward"}
   ]
  };
  const legendary=type=>["legendaryLord","shadowElf","pegasusChampion","dwarfKingHaldric"].includes(type);
  let pool=(pools[category]||pools.infantry).filter(p=>{
   if(!legendary(p.type))return true;
   const mount=p.mountType||(p.mounted?"horse":"none");
   return !data.models.some(m=>m.type===p.type&&(m.mountType||(m.mounted?"horse":"none"))===mount);
  });
  if(!pool.length)pool=(pools[category]||pools.infantry).filter(p=>!legendary(p.type));
  if(!pool.length)return null;
  const p=pool[Math.floor(Math.random()*pool.length)];
  const model=makeModel("rogue-"+data.nextId++,p.faction,p.type,p.weapon,{mounted:!!p.mounted,mountType:p.mountType||"none",shield:!!p.shield,name:p.name});
  model.namedCharacter=!!p.namedCharacter;
  if(p.type==="shadowElf"){model.offhandWeapon=true;model.components=[...model.components,"left_sword"];}
  if(p.type==="pegasusChampion")model.components=["aelthir_dawnwing_body","lance","shield","eagle"];
  data.models.push(model);save();renderAll();return modelLabel(model);
 }
 function openDeveloperLootbox(){rollLootboxItem();}
 function renderDailyReward(){
  const button=$("claim-daily-lootbox"),status=$("daily-lootbox-status");
  const ready=canClaimDaily();
  button.disabled=!ready;
  button.textContent=ready?"Claim today's free lootbox":"Daily lootbox already claimed";
  status.textContent=ready?"One free lootbox is available today.":"You've claimed today's free lootbox. Come back tomorrow.";
  $("open-earned-lootbox").disabled=data.lootboxes<1;
  $("open-earned-lootbox").textContent=data.lootboxes>0?"Open a lootbox ("+data.lootboxes+" available)":"No unopened lootboxes";
 }
 $("claim-daily-lootbox").addEventListener("click",claimDailyLootbox);
 $("open-earned-lootbox").addEventListener("click",openLootbox);
 $("open-collection").addEventListener("click",()=>{ $("mainmenu").hidden=true;$("collection-screen").hidden=false;renderAll();});
 $("collection-back").addEventListener("click",onMainMenu);
 $("collection-skirmish").addEventListener("click",onSkirmish);
 $("open-dev").addEventListener("click",()=>{$("dev-panel").hidden=!$("dev-panel").hidden;});
 $("bypass-model-check").addEventListener("change",e=>{data.bypass=e.target.checked;save();});
 $("dev-lootbox").addEventListener("click",openDeveloperLootbox);
 $("dev-reset-collection").addEventListener("click",()=>{
  if(!window.confirm("Reset this device’s collection to the original 152 models? This permanently removes all added models, loose bits, lootboxes and developer bypass settings."))return;
  data=starterData();editingId=null;save();onResetCollection();renderAll();
  $("lootbox-result").textContent="Collection reset complete: 100 Empire swordsmen, 50 Empire archers and 1 sword-only Empire hero (152 models total).";
 });
 $("mode-collection").addEventListener("click",()=>{$("mode-screen").hidden=true;$("collection-screen").hidden=false;renderAll();});
 $("mode-back").addEventListener("click",onMainMenu);
 document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  const mode=btn.dataset.mode;
  if(mode==="skirmish"){onSkirmish();return;}
  if(mode==="narrative"){onNarrativeCampaign();return;}
   if(mode==="roguelike"){onRoguelike();return;}
  const info={
   grand:["Grand Campaign","Lead a faction across a living world. Expand territory, manage resources and fight battles with only the miniatures in your collection."],
   narrative:["Narrative Campaign","Fight a connected story of missions, choices and persistent rewards. Mission rewards can add specific models to your collection."],
   roguelike:["Roguelike Expedition","Take a small force through a branching, high-risk campaign. Loot and mission rewards add models and bits between runs."]
  }[mode];
  $("mainmenu").hidden=true;$("mode-screen").hidden=false;$("mode-title").textContent=info[0];$("mode-description").textContent=info[1];
 }));
 renderAll();
 return {getInventory:()=>data.models.map(m=>({...m})),getBypass:()=>!!data.bypass,grantLootbox,grantRoguelikeModel,open:()=>{ $("mainmenu").hidden=true;$("collection-screen").hidden=false;renderAll();}};
}
export function getCollectionSnapshot(){
 try{
  const d=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");if(!d||!Array.isArray(d.models))return starterData();
  const legacyTypes={dwarfWarriors:"dwarfInfantry",dwarfThunderers:"dwarfInfantry",dwarfQuarrellers:"dwarfInfantry",dwarfLongbeards:"dwarfInfantry",dwarfIronbreakers:"dwarfInfantry"};
  return {...d,models:d.models.map(m=>{
   if(!m||typeof m!=="object")return m;
   const type=legacyTypes[m.type]||m.type;
   return m.faction==="dwarfs"?{...m,type,weapon:m.weapon==="bow"?"crossbow":m.weapon,backWeapons:(m.backWeapons||[]).map(w=>w==="bow"?"crossbow":w),components:(m.components||[]).map(x=>x==="both_bow"?"both_crossbow":x==="back_bow"?"back_crossbow":x)}:{...m,type};
  })};
 }catch{return starterData();}
}
