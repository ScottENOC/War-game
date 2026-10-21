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
  {id:"human_mage_body",label:"Human mage body",faction:"empire",kind:"mageHero"},
  {id:"human_wizard_lord_body",label:"Human wizard lord body",faction:"empire",kind:"mageLord"},
  {id:"elf_mage_body",label:"High Elf mage body",faction:"highElves",kind:"mageHero"},
  {id:"elf_archmage_body",label:"High Elf archmage body",faction:"highElves",kind:"mageLord"},
  {id:"goblin_shaman_body",label:"Goblin shaman body",faction:"greenskins",kind:"goblinShaman"},
  {id:"goblin_great_shaman_body",label:"Goblin great shaman body",faction:"greenskins",kind:"goblinGreatShaman"},
  {id:"orc_shaman_body",label:"Orc shaman body",faction:"greenskins",kind:"orcShaman"},
  {id:"orc_great_shaman_body",label:"Orc great shaman body",faction:"greenskins",kind:"orcGreatShaman"},
  {id:"dwarf_infantry_body",label:"Dwarf infantry body",faction:"dwarfs",kind:"dwarfInfantry"},
  {id:"dwarf_hero_body",label:"Dwarf thane body",faction:"dwarfs",kind:"dwarfCaptain"},
  {id:"dwarf_lord_body",label:"Dwarf lord body",faction:"dwarfs",kind:"dwarfLord"},
  {id:"haldric_stoneward_body",label:"King Haldric Stoneward (named character)",faction:"dwarfs",kind:"dwarfKingHaldric",namedCharacter:true},
  {id:"edric_voss_body",label:"Lord-Marshal Edric Voss (named character)",faction:"empire",kind:"legendaryLord",namedCharacter:true},
  {id:"lethariel_starweaver_body",label:"Lethariel Starweaver (named character)",faction:"highElves",kind:"shadowElf",namedCharacter:true},
  {id:"aelthir_dawnwing_body",label:"Aelthir, the Dawnwing (named character)",faction:"highElves",kind:"pegasusChampion",namedCharacter:true},
  {id:"eldrin_starwarden_body",label:"Eldrin Starwarden (named spellcasting lord)",faction:"highElves",kind:"starwardenLord",namedCharacter:true},
  {id:"goblin_infantry_body",label:"Goblin infantry body",faction:"greenskins",kind:"goblins"},
  {id:"orc_infantry_body",label:"Orc infantry body",faction:"greenskins",kind:"orcBoyz"},
  {id:"wyvern_body",label:"Wyvern monster body",faction:"greenskins",kind:"wyvern"},
  {id:"goblin_cavalry_body",label:"Goblin wolf-rider body",faction:"greenskins",kind:"wolfRiders"},
  {id:"orc_cavalry_body",label:"Orc boar-rider body",faction:"greenskins",kind:"boarBoyz"},
  {id:"goblin_hero_body",label:"Goblin Big Boss body",faction:"greenskins",kind:"goblinHero"},
  {id:"goblin_lord_body",label:"Goblin Warboss body",faction:"greenskins",kind:"goblinLord"},
  {id:"orc_hero_body",label:"Orc Big Boss body",faction:"greenskins",kind:"orcHero"},
  {id:"orc_lord_body",label:"Orc Warboss body",faction:"greenskins",kind:"orcLord"},
  {id:"goblin_crew_body",label:"Goblin catapult crew body",faction:"greenskins",kind:"catapult"},
  {id:"troll_body",label:"Troll body",faction:"greenskins",kind:"trolls"},
  {id:"giant_body",label:"Giant body",faction:"greenskins",kind:"giant"},
  {id:"human_chariot_body",label:"Empire chariot crew and vehicle",faction:"empire",kind:"humanChariot"},
  {id:"elf_chariot_body",label:"High Elf chariot crew and vehicle",faction:"highElves",kind:"elfChariot"},
  {id:"goblin_chariot_body",label:"Goblin wolf chariot crew and vehicle",faction:"greenskins",kind:"goblinChariot"},
  {id:"orc_chariot_body",label:"Orc boar chariot crew and vehicle",faction:"greenskins",kind:"orcChariot"},
  {id:"undead_zombie_body",label:"Zombie body",faction:"undead",kind:"zombies"},
  {id:"undead_skeleton_body",label:"Skeleton warrior body",faction:"undead",kind:"skeletons"},
  {id:"undead_skeleton_chariot_body",label:"Skeleton chariot crew and vehicle",faction:"undead",kind:"skeletonChariot"},
  {id:"undead_catapult_crew_body",label:"Skeleton catapult crew",faction:"undead",kind:"catapult"},
  {id:"undead_skeletal_steed_body",label:"Skeletal steed and rider",faction:"undead",kind:"skeletonHorses"},
  {id:"undead_skeleton_dragon_body",label:"Skeleton dragon body",faction:"undead",kind:"skeletonDragon"},
  {id:"undead_skeleton_giant_body",label:"Skeleton giant body",faction:"undead",kind:"skeletonGiant"},
  {id:"undead_skeleton_troll_body",label:"Skeleton troll body",faction:"undead",kind:"skeletonTroll"},
  {id:"undead_necromancer_body",label:"Necromancer body",faction:"undead",kind:"necromancer"},
  {id:"undead_master_necromancer_body",label:"Master Necromancer body",faction:"undead",kind:"masterNecromancer"},
  {id:"undead_vampire_hero_body",label:"Vampire Thrall body",faction:"undead",kind:"vampireHero"},
  {id:"undead_vampire_lord_body",label:"Vampire Lord body",faction:"undead",kind:"vampireLord"}
];
const bitDefs=[
 ...bodyKinds.map(x=>({id:x.id,label:x.label,kind:"body"})),
 {id:"horse",label:"Horse",kind:"mount"},{id:"skeletal_steed",label:"Skeletal Steed",kind:"mount",faction:"undead"},{id:"skeleton_chariot",label:"Skeleton Chariot",kind:"vehicle",faction:"undead"},{id:"eagle",label:"Pegasus",kind:"mount"},{id:"unicorn",label:"Unicorn",kind:"mount",faction:"highElves"},{id:"wolf",label:"Wolf",kind:"mount"},{id:"boar",label:"Boar",kind:"mount"},{id:"wyvern",label:"Wyvern",kind:"mount",faction:"greenskins"},
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
 {id:"back_firearm",label:"Firearm carried on back",kind:"backWeapon",weapon:"firearm"},
 {id:"human_cannon_machine",label:"Human cannon",kind:"siegeMachine",faction:"empire",unitType:"cannon"},
 {id:"dwarf_cannon_machine",label:"Dwarf cannon",kind:"siegeMachine",faction:"dwarfs",unitType:"cannon"},
 {id:"elf_bolt_thrower_machine",label:"Elf bolt thrower",kind:"siegeMachine",faction:"highElves",unitType:"boltThrower"},
 {id:"human_chariot_vehicle",label:"Empire horse chariot vehicle",kind:"chariotMachine",faction:"empire",unitType:"humanChariot"},
 {id:"elf_chariot_vehicle",label:"High Elf chariot with elven horses",kind:"chariotMachine",faction:"highElves",unitType:"elfChariot"},
 {id:"goblin_chariot_vehicle",label:"Goblin wolf chariot vehicle",kind:"chariotMachine",faction:"greenskins",unitType:"goblinChariot"},
 {id:"orc_chariot_vehicle",label:"Orc boar chariot vehicle",kind:"chariotMachine",faction:"greenskins",unitType:"orcChariot"},
 {id:"skeleton_chariot_vehicle",label:"Skeleton chariot vehicle",kind:"chariotMachine",faction:"undead",unitType:"skeletonChariot"}
];
const labels={empire:"Human / Empire",highElves:"High Elf",dwarfs:"Dwarf",greenskins:"Greenskins",goblins:"Goblin Mob",orcBoyz:"Orc Boyz",goblinHero:"Goblin Big Boss",goblinLord:"Goblin Warboss",orcHero:"Orc Big Boss",orcLord:"Orc Warboss",mageHero:"Mage",mageLord:"Wizard Lord",goblinShaman:"Goblin Shaman",goblinGreatShaman:"Goblin Great Shaman",orcShaman:"Orc Shaman",orcGreatShaman:"Orc Great Shaman",humanChariot:"Empire War Chariot",elfChariot:"High Elf Chariot",goblinChariot:"Goblin Wolf Chariot",orcChariot:"Orc Boar Chariot",zombies:"Zombies",skeletons:"Skeleton Warriors",skeletonHorses:"Skeletal Steeds",necromancer:"Necromancer",masterNecromancer:"Master Necromancer",vampireHero:"Vampire Thrall",vampireLord:"Vampire Lord",skeletonChariot:"Skeleton Chariot",skeletonDragon:"Skeleton Dragon",skeletonGiant:"Skeleton Giant",skeletonTroll:"Skeleton Troll",catapult:"Skeleton Catapult",wolfRiders:"Wolf Riders",boarBoyz:"Boar Boyz",catapult:"Catapult",trolls:"Troll",giant:"Giant",wyvern:"Wyvern",swordsmen:"Infantry Sword",archers:"Infantry",dwarfInfantry:"Dwarf Infantry",dwarfCaptain:"Dwarf Thane",dwarfLord:"Dwarf Lord",dwarfKingHaldric:"King Haldric Stoneward",starwardenLord:"Eldrin Starwarden",cavalry:"Cavalry",captain:"Hero",lord:"Lord",legendaryLord:"Lord-Marshal Edric Voss",shadowElf:"Lethariel Starweaver",handWeapon:"Sword",magicBow:"Magical longbow",signature:"Signature equipment",spear:"Spear",lance:"Lance",greatWeapon:"Great weapon",halberd:"Halberd",bow:"Bow",crossbow:"Crossbow",firearm:"Firearm",cannon:"Cannon",boltThrower:"Bolt thrower"};
const makeModel=(id,faction,type,weapon,extra={})=>({id,faction,type,weapon,shield:!!extra.shield,mounted:!!extra.mounted,mountType:extra.mountType||(extra.mounted?"horse":"none"),backWeapons:[...(extra.backWeapons||[])],components:["body",weapon,...(extra.shield?["shield"]:[]),...(extra.mounted?[extra.mountType==="eagle"?"eagle":extra.mountType==="greatEagle"?"greatEagle":extra.mountType==="wyvern"?"wyvern":extra.mountType==="wolf"?"wolf":extra.mountType==="boar"?"boar":"horse"]:[]),...(extra.backWeapons||[]).map(w=>w==="bow"?"back_bow":w==="crossbow"?"back_crossbow":w==="greatWeapon"?"back_greatsword":w==="halberd"?"back_halberd":w==="spear"?"back_spear":w==="firearm"?"back_firearm":w)],name:extra.name||((faction==="empire"?"Empire ":faction==="dwarfs"?"Dwarf ":faction==="greenskins"?"Greenskin ":"High Elf ")+labels[type]+(type==="swordsmen"||type==="archers"||type==="cavalry"?"":"")+" · "+labels[weapon])});
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
    const faction=["empire","highElves","dwarfs","greenskins","undead"].includes(m.faction)?m.faction:"empire";
    const weapon=typeof m.weapon==="string"&&m.weapon?m.weapon:"handWeapon";
    const legacyMount=m.mountType==="greatEagle"?"eagle":m.mountType;const safe={...m,id:typeof m.id==="string"&&m.id?m.id:"recovered-"+(i+1),faction,type,weapon:faction==="dwarfs"&&weapon==="bow"?"crossbow":weapon,shield:!!m.shield,mounted:!!m.mounted,mountType:legacyMount||(m.mounted?"horse":"none"),backWeapons:Array.isArray(m.backWeapons)?m.backWeapons.filter(w=>typeof w==="string").map(w=>faction==="dwarfs"&&w==="bow"?"crossbow":w):[],components:Array.isArray(m.components)?m.components.map(x=>x==="greatEagle"?"eagle":faction==="dwarfs"&&x==="both_bow"?"both_crossbow":faction==="dwarfs"&&x==="back_bow"?"back_crossbow":x):[]};
    if(typeof safe.name!=="string"||!safe.name.trim()){
     const typeLabel=labels[type]||String(type).replace(/([a-z])([A-Z])/g,"$1 $2");
     safe.name=(faction==="empire"?"Empire ":faction==="dwarfs"?"Dwarf ":"High Elf ")+typeLabel+" · "+(labels[weapon]||weapon);
    }
    return safe;
   });
   merged.bits=Object.fromEntries(Object.entries(merged.bits).filter(([k,v])=>typeof k==="string"&&Number.isFinite(Number(v))&&Number(v)>0).map(([k,v])=>[k,Math.floor(Number(v))]));if(merged.bits.greatEagle){merged.bits.eagle=(merged.bits.eagle||0)+merged.bits.greatEagle;delete merged.bits.greatEagle;}
   merged.nextId=Math.max(Number(merged.nextId)||1,152);
   return merged;
  }
 }catch{}
 return starterData();
}

export function createCollectionManager({$,onSkirmish,onMainMenu,onNarrativeCampaign=()=>{},onRoguelike=()=>{},onWarband=()=>{},onWarbandExpedition=()=>{},onResetCollection=()=>{}}){
 let data=load(),editingId=null;
 data.lootboxes=Number.isFinite(data.lootboxes)?Math.max(0,data.lootboxes):0;
 data.lastDailyClaim=data.lastDailyClaim||null;
 const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{}};
 const title=s=>labels[s]||s;
 const bitCount=id=>data.bits[id]||0;
 const addBit=(id,n=1)=>{data.bits[id]=(data.bits[id]||0)+n;};
 const consumeBit=id=>{if(bitCount(id)<1)return false;data.bits[id]--;if(!data.bits[id])delete data.bits[id];return true;};
 const modelLabel=m=>(m.name==="Aelthir, the Dawnwing"?"Aelthir, the Dawnwing":(m.faction==="empire"?"Empire ":m.faction==="dwarfs"?"Dwarf ":m.faction==="greenskins"?"Greenskin ":m.faction==="undead"?"Undead ":"High Elf ")+title(m.type))+" · "+title(m.weapon)+(m.offhandWeapon?" + Off-hand sword":"")+(m.shield?" + Shield":"")+((m.backWeapons||[]).length?" · Back: "+m.backWeapons.map(title).join(", "):"")+(m.mountType==="eagle"||m.mountType==="greatEagle"?" · Pegasus":m.mountType==="wyvern"?" · Wyvern":m.mounted?" · Mounted":"");
 const canUseBit=(m,id)=>{
   const b=bitDefs.find(x=>x.id===id);if(!b||b.kind==="siegeMachine"||b.kind==="chariotMachine"||m.siegeMachine)return false;
   if(m.faction==="dwarfs"&&b.weapon==="bow")return false;
   if(b.kind==="backWeapon")return m.weapon!==b.weapon&&!(m.backWeapons||[]).includes(b.weapon);
   if(b.kind==="shield")return !m.shield&&(!["greatWeapon","halberd","bow"].includes(m.weapon)||m.faction==="dwarfs");
   if(b.kind==="mount")return (m.type==="captain"||m.type==="lord"||m.type==="mageHero"||m.type==="mageLord"||m.type==="dwarfCaptain"||m.type==="dwarfLord"||m.type==="goblinHero"||m.type==="goblinLord"||m.type==="orcHero"||m.type==="orcLord"||["cavalry","wolfRiders","boarBoyz"].includes(m.type))&&!m.mounted&&m.weapon!=="halberd"&&(id!=="eagle"||m.faction==="highElves")&&(id!=="greatEagle"||m.faction==="highElves")&&(id!=="unicorn"||m.faction==="highElves")&&(id!=="wolf"||m.faction==="greenskins"&&["goblins","goblinHero","goblinLord","wolfRiders"].includes(m.type))&&(id!=="boar"||m.faction==="greenskins"&&["orcBoyz","orcHero","orcLord","boarBoyz"].includes(m.type))&&(id!=="wyvern"||m.faction==="greenskins"&&m.type==="orcLord")&&m.faction!=="dwarfs";
   if(b.kind==="right")return m.weapon==="none"&&m.type!=="archers"&&(m.type!=="swordsmen"||m.faction==="highElves");
   if(b.kind==="leftSword")return !m.shield&&!["greatWeapon","halberd","bow","crossbow","firearm"].includes(m.weapon)&&!m.components?.includes("left_sword")&&(m.faction==="highElves"||m.faction==="greenskins"||((m.type==="captain"||m.type==="lord"||m.type==="goblinHero"||m.type==="goblinLord"||m.type==="orcHero"||m.type==="orcLord")&&m.faction==="empire"));
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
   meta.textContent=(labels[weapon]||String(weapon))+(offhand?" · Off-hand sword":"")+(shield?" · Shield":"")+(backWeapons.length?" · Back: "+backWeapons.map(w=>labels[w]||w).join(", "):"")+(mountType==="eagle"||mountType==="greatEagle"?" · Pegasus":mounted?" · Mounted":"");
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
  const buildBtn=document.createElement("button");buildBtn.className="secondary-button";buildBtn.textContent="Assemble new model";const siegeBtn=document.createElement("button");siegeBtn.className="secondary-button";siegeBtn.textContent="Assemble siege engine";tabs.append(editBtn,buildBtn,siegeBtn);root.append(tabs);
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
    if(def.kind==="mount"){model.mounted=true;model.mountType=def.id;model.components.push(def.id==="eagle"?"eagle":def.id==="greatEagle"?"greatEagle":def.id==="unicorn"?"unicorn":def.id==="wyvern"?"wyvern":def.id==="wolf"?"wolf":def.id==="boar"?"boar":"horse");}
    if(def.kind==="right"||def.kind==="twohand"){model.weapon=def.weapon;model.components.push(def.id);}
    if(def.kind==="leftSword"){model.components.push("left_sword");model.offhandWeapon=true;}
    model.name=modelLabel(model);save();renderAll();editingId=model.id;renderWorkbench();
   });panel.append(add);
   const note=document.createElement("p");note.className="subtle";note.textContent="This is permanent: you can add components, but cannot remove or replace them.";panel.append(note);
  }
  function renderBuild(){
   panel.replaceChildren();
   const faction=field("Faction",[{value:"empire",label:"Human / Empire"},{value:"highElves",label:"High Elf"},{value:"dwarfs",label:"Dwarf"},{value:"greenskins",label:"Greenskins"},{value:"undead",label:"Undead"}],"empire");
   const kind=field("Main body",bodyKinds.map(b=>({value:b.id,label:b.label})),bodyKinds[0].id);
   const weapon=field("Arms / weapon",[], "right_sword");
   const horseWrap=field("Mount",[{value:"no",label:"No mount"},{value:"yes",label:"Add horse"},{value:"eagle",label:"Pegasus (High Elves)"},{value:"unicorn",label:"Unicorn (High Elves)"},{value:"wolf",label:"Wolf (Greenskins)"},{value:"boar",label:"Boar (Greenskins)"}],"no");
   const refresh=()=>{
    const body=bodyKinds.find(b=>b.id===kind.value);const cavalry=["cavalry","wolfRiders","boarBoyz"].includes(body.kind);const named=!!body.namedCharacter;const monsterBody=["wyvern","skeletonDragon","skeletonGiant","skeletonTroll"].includes(body.kind);const hero=["captain","lord","mageHero","mageLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","dwarfCaptain","dwarfLord","goblinHero","goblinLord","orcHero","orcLord"].includes(body.kind)||named;
    horseWrap.querySelectorAll("option").forEach(o=>{if(o.value==="eagle"||o.value==="greatEagle"||o.value==="unicorn")o.disabled=body.faction!=="highElves"||!(cavalry||hero);if(o.value==="yes")o.disabled=body.faction==="dwarfs"||!(cavalry||hero);if(o.value==="wolf")o.disabled=body.faction!=="greenskins"||!["wolfRiders","goblinHero","goblinLord","goblinShaman","goblinGreatShaman"].includes(body.kind);if(o.value==="boar")o.disabled=body.faction!=="greenskins"||!["boarBoyz","orcHero","orcLord","orcShaman","orcGreatShaman"].includes(body.kind);});
    if(horseWrap.selectedOptions[0]?.disabled)horseWrap.value="no";if(body.kind==="pegasusChampion"){horseWrap.value="eagle";horseWrap.querySelectorAll("option").forEach(o=>{o.disabled=o.value!=="eagle";});}if(body.kind==="starwardenLord"){horseWrap.value="no";horseWrap.querySelectorAll("option").forEach(o=>{o.disabled=o.value!=="no";});}if(body.kind==="wolfRiders"){horseWrap.value="wolf";horseWrap.querySelectorAll("option").forEach(o=>{o.disabled=o.value!=="wolf";});}if(body.kind==="boarBoyz"){horseWrap.value="boar";horseWrap.querySelectorAll("option").forEach(o=>{o.disabled=o.value!=="boar";});}
    offhandLabel.hidden=body.kind==="elfChariot"||!(body.faction==="highElves"||body.faction==="greenskins"||((body.kind==="captain"||body.kind==="lord")&&body.faction==="empire"));if(offhandLabel.hidden)offhandCheck.checked=false;
    [...weapon.options].forEach(o=>o.remove());
    const rangedArms=body.faction==="empire"?["both_bow","both_crossbow","both_firearm"]:body.faction==="greenskins"?(["goblins","goblinHero","goblinLord"].includes(body.kind)?["both_bow"]:[]):body.faction==="highElves"?["both_bow"]:[];
    let arms;
    if(named||monsterBody) arms=["signature"];
    else if(body.kind==="elfChariot") arms=["right_spear","both_bow"];
    else if(body.kind==="humanChariot") arms=["right_sword","right_spear","both_bow","both_halberd"];
    else if(body.kind==="goblinChariot") arms=["right_club","right_spear","both_bow"];
    else if(body.kind==="orcChariot") arms=["right_club","right_spear"];
    else if(body.kind==="skeletonChariot") arms=["right_sword","right_spear"];
    else if(body.kind==="infantry"&&body.faction==="highElves") arms=["right_sword","right_spear","both_bow","both_greatWeapon","both_halberd"];
    else if(cavalry) arms=body.faction==="empire"?["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms]:["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms];
    else if(hero) arms=horseWrap.value!=="no"?["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms]:["right_sword","right_spear","both_greatWeapon","both_halberd",...rangedArms];
    else if(body.faction==="empire") arms=["right_sword","right_spear","both_bow","both_crossbow","both_firearm","both_greatWeapon","both_halberd"];
    else if(body.faction==="greenskins") arms=body.kind==="catapult"?["right_club"]:["right_club","right_spear","both_greatWeapon","both_halberd",...rangedArms];
    else arms=["right_sword","right_spear","both_bow","both_greatWeapon","both_halberd"];
    
    arms.forEach(id=>{const d=bitDefs.find(b=>b.id===id);const o=document.createElement("option");o.value=id;o.textContent=monsterBody?"Intrinsic monster attacks (no weapon bit)":named?(body.kind==="legendaryLord"?"Signature sword and shield (included)":body.kind==="pegasusChampion"?"Magical lance and shield (included)":body.kind==="starwardenLord"?"Fateward spell (included)":"Magical longbow and dual swords (included)"):d.label+" ("+bitCount(id)+" owned)";weapon.append(o);});
    horseWrap.parentElement.hidden=body.faction==="dwarfs"||monsterBody||(named&&body.kind==="shadowElf"?!cavalry:!cavalry&&!hero);
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
    const body=bodyKinds.find(b=>b.id===kind.value),named=!!body.namedCharacter,monsterBody=["wyvern","skeletonDragon","skeletonGiant","skeletonTroll"].includes(body.kind),chariot=["humanChariot","elfChariot","goblinChariot","orcChariot","skeletonChariot"].includes(body.kind),arms=(named||monsterBody)?{id:"signature",kind:"signature",weapon:"handWeapon"}:bitDefs.find(b=>b.id===weapon.value),mountType=["eagle","greatEagle","wolf","boar"].includes(horseWrap.value)?horseWrap.value:horseWrap.value==="yes"?"horse":"none",mounted=mountType!=="none"&&(body.kind==="cavalry"||["wolfRiders","boarBoyz","captain","lord","mageHero","mageLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","dwarfCaptain","dwarfLord","goblinHero","goblinLord","orcHero","orcLord","legendaryLord","pegasusChampion"].includes(body.kind));
    if(body.faction!==faction.value){status.textContent="Choose a main body matching the selected faction.";return;}
    if(mounted&&arms.weapon==="halberd"){status.textContent="Halberds cannot be used by mounted models.";return;}
    if((mountType==="eagle"||mountType==="greatEagle")&&(body.faction!=="highElves"||arms.weapon==="halberd")){status.textContent="Pegasus and Great Eagle mounts are available only to High Elves; neither can carry a halberd.";return;}
    const addShield=named?["legendaryLord","pegasusChampion"].includes(body.kind):!monsterBody&&shieldCheck.checked&&(arms.kind==="right"||body.faction==="dwarfs");if(!named&&shieldCheck.checked&&!addShield){status.textContent="Two-handed weapons use both arms and cannot take a shield.";return;}
    const addOffhand=named?body.kind==="shadowElf":!monsterBody&&offhandCheck.checked&&!offhandLabel.hidden;if(!named&&addOffhand&&arms.kind!=="right"){status.textContent="A left-hand sword needs a free right-hand weapon, not a two-handed weapon.";return;}if(addShield&&addOffhand){status.textContent="A model cannot hold both a shield and a sword in its left hand.";return;}
    if(named&&data.models.some(m=>m.type===body.kind&&m.faction===body.faction&&!!m.mounted===mounted&&(m.mountType||(m.mounted?"horse":"none"))===mountType)){status.textContent="You already own this named character in that mount configuration.";return;}const need=[body.id];if(chariot)need.push(({humanChariot:"human_chariot_vehicle",elfChariot:"elf_chariot_vehicle",goblinChariot:"goblin_chariot_vehicle",orcChariot:"orc_chariot_vehicle",skeletonChariot:"skeleton_chariot_vehicle"})[body.kind]);if(!named&&!monsterBody){need.push(arms.id);if(arms.kind==="right")need.push(addShield?"left_shield":addOffhand?"left_sword":"left_empty_arm");else if(addShield)need.push("left_shield");}if(mounted)need.push(mountType==="eagle"?"eagle":mountType==="greatEagle"?"greatEagle":mountType==="wolf"?"wolf":mountType==="boar"?"boar":"horse");if(mountType==="eagle"&&body.kind!=="pegasusChampion")need.push("back_bow");
    const shortage=need.find(id=>bitCount(id)<1);if(shortage){status.textContent="Not enough bits: "+bitDefs.find(b=>b.id===shortage).label+".";return;}
    if(["cavalry","wolfRiders","boarBoyz"].includes(body.kind)&&!mounted){status.textContent="Cavalry bodies require their mount.";return;}if(body.kind==="wolfRiders"&&mountType!=="wolf"){status.textContent="Goblin wolf riders require a wolf.";return;}if(body.kind==="boarBoyz"&&mountType!=="boar"){status.textContent="Orc boar riders require a boar.";return;}
    if(body.faction==="highElves"&&["crossbow","firearm"].includes(arms.weapon)){status.textContent="High Elves refuse crossbows and firearms.";return;}
    need.forEach(consumeBit);
    const type=body.kind==="infantry"?(arms.weapon==="bow"?"archers":"swordsmen"):body.kind;
    const namedName=body.kind==="legendaryLord"?"Lord-Marshal Edric Voss":body.kind==="shadowElf"?"Lethariel Starweaver":body.kind==="pegasusChampion"?"Aelthir, the Dawnwing":body.kind==="starwardenLord"?"Eldrin Starwarden":null;
    const model=makeModel("assembled-"+data.nextId++,body.faction,type,monsterBody?"handWeapon":arms.weapon,{mounted,mountType,shield:addShield,backWeapons:mountType==="eagle"&&body.kind!=="pegasusChampion"?["bow"]:[],name:namedName||(body.faction==="empire"?"Empire ":body.faction==="dwarfs"?"Dwarf ":body.faction==="undead"?"Undead ":"High Elf ")+title(type)+" · "+title(arms.weapon)+(addShield?" + Shield":"")+(mounted?" · Mounted":"")});
    model.components=[body.id,...(chariot?[({humanChariot:"human_chariot_vehicle",elfChariot:"elf_chariot_vehicle",goblinChariot:"goblin_chariot_vehicle",orcChariot:"orc_chariot_vehicle"})[body.kind]]:[]),...(!named&&!monsterBody?[arms.id,...(arms.kind==="right"?[addShield?"left_shield":addOffhand?"left_sword":"left_empty_arm"]:addShield?["left_shield"]:[])]:[]),...(mounted?[mountType==="eagle"?"eagle":mountType==="greatEagle"?"greatEagle":mountType==="wolf"?"wolf":mountType==="boar"?"boar":"horse"]:[]),...(mountType==="eagle"&&body.kind!=="pegasusChampion"?["back_bow"]:[])];model.offhandWeapon=addOffhand;model.namedCharacter=named;
    data.models.push(model);save();renderAll();status.textContent="Model assembled and added to your collection.";
   });panel.append(assemble);
   const status=document.createElement("p");status.className="workbench-status";panel.append(status);
  }
  function renderSiegeBuild(){
    panel.replaceChildren();
    const faction=field("Faction",[{value:"empire",label:"Human / Empire"},{value:"highElves",label:"High Elf"},{value:"dwarfs",label:"Dwarf"}],"empire");
    const machine=field("War machine",[], "human_cannon_machine");
    const refresh=()=>{
      [...machine.options].forEach(o=>o.remove());
      const choices=faction.value==="highElves"?[["elf_bolt_thrower_machine","Elf bolt thrower"]]:faction.value==="dwarfs"?[["dwarf_cannon_machine","Dwarf cannon"]]:[["human_cannon_machine","Human cannon"]];
      choices.forEach(([id,label])=>{const o=document.createElement("option");o.value=id;o.textContent=label+" ("+bitCount(id)+" owned)";machine.append(o);});
    };
    faction.addEventListener("change",refresh);refresh();
    const note=document.createElement("p");note.className="subtle";note.textContent="The machine is a separate collectible. It does not include crew: cannons need three compatible crew models; bolt throwers need two. Human crew use a hand weapon; elf crew must carry a spear.";panel.append(note);
    const assemble=document.createElement("button");assemble.className="primary-button";assemble.textContent="Assemble siege engine";
    assemble.addEventListener("click",()=>{
      const def=bitDefs.find(b=>b.id===machine.value);
      if(!def||def.kind!=="siegeMachine"||def.faction!==faction.value){status.textContent="Choose a siege engine matching the selected faction.";return;}
      if(!consumeBit(def.id)){status.textContent="You do not own that machine component.";return;}
      const model=makeModel("assembled-"+data.nextId++,def.faction,def.unitType,"none",{name:def.label});
      model.components=[def.id];model.siegeMachine=true;data.models.push(model);save();renderSummary();renderModels();renderBits();renderDailyReward();status.textContent=def.label+" added to your collection. Assemble compatible crew separately.";
    });panel.append(assemble);
    const status=document.createElement("p");status.className="workbench-status";panel.append(status);
   }
   editBtn.addEventListener("click",renderEdit);buildBtn.addEventListener("click",renderBuild);siegeBtn.addEventListener("click",renderSiegeBuild);renderEdit();
 }
 function renderAll(){renderSummary();renderModels();renderBits();renderWorkbench();renderDailyReward();$("bypass-model-check").checked=!!data.bypass;}
 function rarityWeightedModel(){
  const pool=[
   {faction:"empire",type:"swordsmen",weapon:"handWeapon",cost:8},
   {faction:"empire",type:"archers",weapon:"bow",cost:10},
   {faction:"empire",type:"swordsmen",weapon:"crossbow",cost:11},
   {faction:"empire",type:"swordsmen",weapon:"firearm",cost:12},
   {faction:"empire",type:"cavalry",weapon:"handWeapon",cost:16,mounted:true},
   {faction:"empire",type:"humanChariot",weapon:"handWeapon",cost:95},
   {faction:"highElves",type:"elfChariot",weapon:"spear",cost:110},
   {faction:"greenskins",type:"goblinChariot",weapon:"spear",cost:65},
   {faction:"greenskins",type:"orcChariot",weapon:"handWeapon",cost:100},
   {faction:"empire",type:"captain",weapon:"handWeapon",cost:50},
   {faction:"empire",type:"captain",weapon:"crossbow",cost:53},
   {faction:"empire",type:"captain",weapon:"firearm",cost:54},
   {faction:"empire",type:"mageHero",weapon:"handWeapon",cost:55},
   {faction:"empire",type:"mageLord",weapon:"handWeapon",cost:100},
   {faction:"empire",type:"lord",weapon:"handWeapon",cost:80},
   {faction:"empire",type:"lord",weapon:"crossbow",cost:83},
   {faction:"empire",type:"lord",weapon:"firearm",cost:84},
   {faction:"highElves",type:"swordsmen",weapon:"spear",cost:12},
   {faction:"highElves",type:"archers",weapon:"bow",cost:15},
   {faction:"highElves",type:"cavalry",weapon:"spear",cost:32,mounted:true,mountType:"eagle"},
   {faction:"highElves",type:"captain",weapon:"spear",cost:83,mounted:true,mountType:"eagle"},
   {faction:"highElves",type:"lord",weapon:"spear",cost:128,mounted:true,mountType:"eagle"},
   {faction:"highElves",type:"captain",weapon:"handWeapon",cost:75},
   {faction:"highElves",type:"mageHero",weapon:"handWeapon",cost:95},
   {faction:"highElves",type:"mageLord",weapon:"handWeapon",cost:225},
   {faction:"highElves",type:"lord",weapon:"handWeapon",cost:120},
   {faction:"empire",type:"legendaryLord",weapon:"handWeapon",cost:160,namedCharacter:true},
   {faction:"highElves",type:"shadowElf",weapon:"magicBow",cost:165,namedCharacter:true},
   {faction:"highElves",type:"pegasusChampion",weapon:"lance",cost:110,mounted:true,mountType:"eagle",shield:true,namedCharacter:true},
    {faction:"highElves",type:"starwardenLord",weapon:"handWeapon",cost:300,namedCharacter:true},
    {faction:"greenskins",type:"goblinHero",weapon:"handWeapon",cost:35},
    {faction:"greenskins",type:"goblinShaman",weapon:"handWeapon",cost:55},
    {faction:"greenskins",type:"goblinGreatShaman",weapon:"handWeapon",cost:115},
    {faction:"greenskins",type:"orcShaman",weapon:"handWeapon",cost:65},
    {faction:"greenskins",type:"orcGreatShaman",weapon:"handWeapon",cost:180},
    {faction:"greenskins",type:"goblinLord",weapon:"handWeapon",cost:65},
    {faction:"greenskins",type:"orcHero",weapon:"handWeapon",cost:50},
    {faction:"greenskins",type:"orcLord",weapon:"handWeapon",cost:85}
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
   const p=rarityWeightedModel();if(p.namedCharacter&&data.models.some(m=>m.type===p.type&&m.faction===p.faction&&!!m.mounted===!!p.mounted&&(m.mountType||(m.mounted?"horse":"none"))===(p.mountType||(p.mounted?"horse":"none")))){addBit("right_sword");$("lootbox-result").textContent="Lootbox: duplicate named character converted into a sword component.";save();renderAll();return;}const namedName=p.type==="legendaryLord"?"Lord-Marshal Edric Voss":p.type==="shadowElf"?"Lethariel Starweaver":p.type==="pegasusChampion"?"Aelthir, the Dawnwing":p.type==="starwardenLord"?"Eldrin Starwarden":null;const model=makeModel("loot-"+data.nextId++,p.faction,p.type,p.weapon,{mounted:!!p.mounted,mountType:p.mountType|| (p.mounted?"horse":"none"),shield:p.type==="legendaryLord"||p.type==="pegasusChampion",backWeapons:p.mountType==="eagle"&&p.type!=="pegasusChampion"?["bow"]:[],name:namedName||(p.faction==="empire"?"Empire ":"High Elf ")+title(p.type)+" · "+title(p.weapon)+(p.mountType==="eagle"?" · Pegasus":p.mounted?" · Mounted":"")});model.namedCharacter=!!p.namedCharacter;model.offhandWeapon=p.type==="shadowElf";model.components=p.namedCharacter?[p.type==="legendaryLord"?"edric_voss_body":p.type==="pegasusChampion"?"aelthir_dawnwing_body":p.type==="starwardenLord"?"eldrin_starwarden_body":"lethariel_starweaver_body"]:model.components;
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
   {faction:"empire",type:"humanChariot",weapon:"handWeapon"},
   {faction:"highElves",type:"elfChariot",weapon:"spear"},
   {faction:"greenskins",type:"goblinChariot",weapon:"spear"},
   {faction:"greenskins",type:"orcChariot",weapon:"handWeapon"},
    {faction:"highElves",type:"pegasusChampion",weapon:"lance",mounted:true,mountType:"eagle",shield:true,namedCharacter:true,name:"Aelthir, the Dawnwing"}
   ],
   character:[
        {faction:"empire",type:"mageHero",weapon:"handWeapon"},
    {faction:"empire",type:"mageLord",weapon:"handWeapon"},
    {faction:"highElves",type:"mageHero",weapon:"handWeapon"},
    {faction:"highElves",type:"mageLord",weapon:"handWeapon"},
    {faction:"greenskins",type:"goblinShaman",weapon:"handWeapon"},
    {faction:"greenskins",type:"goblinGreatShaman",weapon:"handWeapon"},
    {faction:"greenskins",type:"orcShaman",weapon:"handWeapon"},
    {faction:"greenskins",type:"orcGreatShaman",weapon:"handWeapon"},
    {faction:"empire",type:"captain",weapon:"handWeapon"},
    {faction:"empire",type:"lord",weapon:"handWeapon"},
    {faction:"highElves",type:"captain",weapon:"handWeapon"},
    {faction:"highElves",type:"lord",weapon:"handWeapon"},
    {faction:"dwarfs",type:"dwarfCaptain",weapon:"handWeapon"},
    {faction:"dwarfs",type:"dwarfLord",weapon:"handWeapon"},
    {faction:"empire",type:"legendaryLord",weapon:"handWeapon",namedCharacter:true,name:"Lord-Marshal Edric Voss"},
    {faction:"empire",type:"legendaryLord",weapon:"handWeapon",mounted:true,mountType:"horse",namedCharacter:true,name:"Lord-Marshal Edric Voss · Mounted"},
    {faction:"highElves",type:"shadowElf",weapon:"magicBow",namedCharacter:true,name:"Lethariel Starweaver"},
     {faction:"highElves",type:"starwardenLord",weapon:"handWeapon",namedCharacter:true,name:"Eldrin Starwarden"},
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
  if(mode==="skirmish"){onSkirmish(null);return;}
  if(mode==="narrative"){onNarrativeCampaign();return;}
   if(mode==="roguelike"){onRoguelike();return;}
  if(mode==="warband"||mode==="warbandSkirmish"){onWarband();return;}
  if(mode==="warbandExpedition"){onWarbandExpedition();return;}
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
