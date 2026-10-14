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
  {id:"edric_voss_body",label:"Lord-Marshal Edric Voss (named character)",faction:"empire",kind:"legendaryLord",namedCharacter:true},
  {id:"lethariel_starweaver_body",label:"Lethariel Starweaver (named character)",faction:"highElves",kind:"shadowElf",namedCharacter:true},
  {id:"aelthir_dawnwing_body",label:"Aelthir, the Dawnwing (named character)",faction:"highElves",kind:"pegasusChampion",namedCharacter:true}
];
const bitDefs=[
 ...bodyKinds.map(x=>({id:x.id,label:x.label,kind:"body"})),
 {id:"horse",label:"Horse",kind:"mount"},{id:"eagle",label:"Pegasus",kind:"mount"},
 {id:"right_sword",label:"Right arm · sword",kind:"right",weapon:"handWeapon"},
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
const labels={empire:"Human / Empire",highElves:"High Elf",swordsmen:"Swordsmen",archers:"Archers",cavalry:"Cavalry",captain:"Hero",lord:"Lord",legendaryLord:"Lord-Marshal Edric Voss",shadowElf:"Lethariel Starweaver",handWeapon:"Sword",magicBow:"Magical longbow",signature:"Signature equipment",spear:"Spear",lance:"Lance",greatWeapon:"Great weapon",halberd:"Halberd",bow:"Bow",crossbow:"Crossbow",firearm:"Firearm"};
const makeModel=(id,faction,type,weapon,extra={})=>({id,faction,type,weapon,shield:!!extra.shield,mounted:!!extra.mounted,mountType:extra.mountType||(extra.mounted?"horse":"none"),backWeapons:[...(extra.backWeapons||[])],components:["body",weapon,...(extra.shield?["shield"]:[]),...(extra.mounted?[extra.mountType==="eagle"?"eagle":"horse"]:[]),...(extra.backWeapons||[]).map(w=>w==="bow"?"back_bow":w==="crossbow"?"back_crossbow":w==="greatWeapon"?"back_greatsword":w==="halberd"?"back_halberd":w==="spear"?"back_spear":w==="firearm"?"back_firearm":w)],name:extra.name||((faction==="empire"?"Empire ":"High Elf ")+labels[type]+(type==="swordsmen"||type==="archers"||type==="cavalry"?"":"")+" · "+labels[weapon])});
function starterData(){
 const models=[];let id=1;
 for(let i=0;i<100;i++)models.push(makeModel("starter-"+id++,"empire","swordsmen","handWeapon"));
 for(let i=0;i<50;i++)models.push(makeModel("starter-"+id++,"empire","archers","bow"));
 models.push(makeModel("starter-"+id++,"empire","captain","handWeapon",{name:"Empire Hero · Sword only"}));
 return {version:1,nextId:id,models,bits:{},bypass:false,lootboxes:0,lastDailyClaim:null};
}
function load(){
 try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");if(saved&&Array.isArray(saved.models)&&saved.bits)return {...starterData(),...saved};}catch{}
 return starterData();
}
export function createCollectionManager({$,onSkirmish,onMainMenu,onNarrativeCampaign=()=>{}}){
 let data=load(),editingId=null;
 data.lootboxes=Number.isFinite(data.lootboxes)?Math.max(0,data.lootboxes):0;
 data.lastDailyClaim=data.lastDailyClaim||null;
 const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{}};
 const title=s=>labels[s]||s;
 const bitCount=id=>data.bits[id]||0;
 const addBit=(id,n=1)=>{data.bits[id]=(data.bits[id]||0)+n;};
 const consumeBit=id=>{if(bitCount(id)<1)return false;data.bits[id]--;if(!data.bits[id])delete data.bits[id];return true;};
 const modelLabel=m=>(m.name==="Aelthir, the Dawnwing"?"Aelthir, the Dawnwing":(m.faction==="empire"?"Empire ":"High Elf ")+title(m.type))+" · "+title(m.weapon)+(m.offhandWeapon?" + Off-hand sword":"")+(m.shield?" + Shield":"")+((m.backWeapons||[]).length?" · Back: "+m.backWeapons.map(title).join(", "):"")+(m.mountType==="eagle"?" · Pegasus":m.mounted?" · Mounted":"");
 const canUseBit=(m,id)=>{
   const b=bitDefs.find(x=>x.id===id);if(!b)return false;
   if(b.kind==="backWeapon")return m.weapon!==b.weapon&&!(m.backWeapons||[]).includes(b.weapon);
   if(b.kind==="shield")return !m.shield&&!["greatWeapon","halberd","bow"].includes(m.weapon);
   if(b.kind==="mount")return (m.type==="captain"||m.type==="lord"||m.type==="cavalry")&&!m.mounted&&m.weapon!=="halberd"&&(id!=="eagle"||m.faction==="highElves");
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
  const counts=new Map();data.models.forEach(m=>{const key=[m.faction,m.type,m.weapon,m.shield,m.mounted,m.mountType||"none",!!m.offhandWeapon,JSON.stringify(m.backWeapons||[])].join("|");counts.set(key,(counts.get(key)||0)+1);});
  const groups=[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  if(!groups.length){root.textContent="No assembled models yet.";return;}
  groups.forEach(([key,count])=>{
   const [faction,type,weapon,shield,mounted,mountType,offhand,backWeaponsKey]=key.split("|");const backWeapons=JSON.parse(backWeaponsKey||"[]");
   const card=document.createElement("article");card.className="inventory-model";
   const strong=document.createElement("strong");strong.textContent=type==="legendaryLord"?"Lord-Marshal Edric Voss":type==="shadowElf"?"Lethariel Starweaver":(faction==="empire"?"Empire ":"High Elf ")+title(type);
   const meta=document.createElement("span");meta.textContent=title(weapon)+(offhand==="true"?" · Off-hand sword":"")+(shield==="true"?" · Shield":"")+(backWeapons.length?" · Back: "+backWeapons.map(title).join(", "):"")+(mountType==="eagle"?" · Pegasus":mounted==="true"?" · Mounted":"");
   const qty=document.createElement("b");qty.textContent="×"+count;card.append(strong,meta,qty);
   const edit=document.createElement("button");edit.className="secondary-button";edit.textContent="Add component";
   const model=data.models.find(m=>[m.faction,m.type,m.weapon,String(m.shield),String(m.mounted),String(!!m.offhandWeapon),JSON.stringify(m.backWeapons||[])].join("|")===key);
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
   const faction=field("Faction",[{value:"empire",label:"Human / Empire"},{value:"highElves",label:"High Elf"}],"empire");
   const kind=field("Main body",bodyKinds.map(b=>({value:b.id,label:b.label})),bodyKinds[0].id);
   const weapon=field("Arms / weapon",[], "right_sword");
   const horseWrap=field("Mount",[{value:"no",label:"No mount"},{value:"yes",label:"Add horse"},{value:"eagle",label:"Pegasus (High Elves)"}],"no");
   const refresh=()=>{
    const body=bodyKinds.find(b=>b.id===kind.value);const cavalry=body.kind==="cavalry";const named=!!body.namedCharacter;const hero=body.kind==="captain"||body.kind==="lord"||named;
    horseWrap.querySelectorAll("option").forEach(o=>{if(o.value==="eagle")o.disabled=body.faction!=="highElves"||!(cavalry||hero);});
    if(horseWrap.selectedOptions[0]?.disabled)horseWrap.value="no";if(body.kind==="pegasusChampion"){horseWrap.value="eagle";horseWrap.querySelectorAll("option").forEach(o=>{o.disabled=o.value!=="eagle";});}
    offhandLabel.hidden=!(body.faction==="highElves"||((body.kind==="captain"||body.kind==="lord")&&body.faction==="empire"));if(offhandLabel.hidden)offhandCheck.checked=false;
    [...weapon.options].forEach(o=>o.remove());
    const rangedArms=body.faction==="empire"?["both_bow","both_crossbow","both_firearm"]:["both_bow"];
    const arms=named?["signature"]:(cavalry?(body.faction==="empire"?["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms]:["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms]):(hero?(horseWrap.value!=="no"?["right_sword","right_spear","right_lance","both_greatWeapon",...rangedArms]:["right_sword","right_spear","both_greatWeapon","both_halberd",...rangedArms]):(body.faction==="empire"?["right_sword","right_spear","both_bow","both_crossbow","both_firearm","both_greatWeapon","both_halberd"]:["right_sword","right_spear","both_bow","both_greatWeapon","both_halberd"])));
    
    arms.forEach(id=>{const d=bitDefs.find(b=>b.id===id);const o=document.createElement("option");o.value=id;o.textContent=named?(body.kind==="legendaryLord"?"Signature sword and shield (included)":body.kind==="pegasusChampion"?"Magical lance and shield (included)":"Magical longbow and dual swords (included)"):d.label+" ("+bitCount(id)+" owned)";weapon.append(o);});
    horseWrap.parentElement.hidden=named&&body.kind==="shadowElf"?!cavalry:!cavalry&&!hero;
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
    const body=bodyKinds.find(b=>b.id===kind.value),named=!!body.namedCharacter,arms=named?{id:"signature",kind:"signature",weapon:body.kind==="legendaryLord"?"handWeapon":"magicBow"}:bitDefs.find(b=>b.id===weapon.value),mountType=horseWrap.value==="eagle"?"eagle":horseWrap.value==="yes"?"horse":"none",mounted=mountType!=="none"&&(body.kind==="cavalry"||body.kind==="captain"||body.kind==="lord"||body.kind==="legendaryLord");
    if(body.faction!==faction.value){status.textContent="Choose a main body matching the selected faction.";return;}
    if(mounted&&arms.weapon==="halberd"){status.textContent="Halberds cannot be used by mounted models.";return;}
    if(mountType==="eagle"&&(body.faction!=="highElves"||arms.weapon==="halberd")){status.textContent="Pegasi are available to High Elves and cannot carry halberds.";return;}
    const addShield=named?["legendaryLord","pegasusChampion"].includes(body.kind):shieldCheck.checked&&arms.kind==="right";if(!named&&shieldCheck.checked&&!addShield){status.textContent="Two-handed weapons use both arms and cannot take a shield.";return;}
    const addOffhand=named?body.kind==="shadowElf":offhandCheck.checked&&!offhandLabel.hidden;if(!named&&addOffhand&&arms.kind!=="right"){status.textContent="A left-hand sword needs a free right-hand weapon, not a two-handed weapon.";return;}if(addShield&&addOffhand){status.textContent="A model cannot hold both a shield and a sword in its left hand.";return;}
    const need=[body.id];if(!named){need.push(arms.id);if(arms.kind==="right")need.push(addShield?"left_shield":addOffhand?"left_sword":"left_empty_arm");}if(mounted)need.push(mountType==="eagle"?"eagle":"horse");if(mountType==="eagle"&&body.kind!=="pegasusChampion")need.push("back_bow");
    const shortage=need.find(id=>bitCount(id)<1);if(shortage){status.textContent="Not enough bits: "+bitDefs.find(b=>b.id===shortage).label+".";return;}
    if(body.kind==="cavalry"&&!mounted){status.textContent="Cavalry bodies require a horse.";return;}
    if(body.faction==="highElves"&&["crossbow","firearm"].includes(arms.weapon)){status.textContent="High Elves refuse crossbows and firearms.";return;}
    need.forEach(consumeBit);
    const type=body.kind==="infantry"?(arms.weapon==="bow"?"archers":"swordsmen"):body.kind;
    const namedName=body.kind==="legendaryLord"?"Lord-Marshal Edric Voss":body.kind==="shadowElf"?"Lethariel Starweaver":body.kind==="pegasusChampion"?"Aelthir, the Dawnwing":null;
    const model=makeModel("assembled-"+data.nextId++,body.faction,type,arms.weapon,{mounted,mountType,shield:addShield,backWeapons:mountType==="eagle"&&body.kind!=="pegasusChampion"?["bow"]:[],name:namedName||(body.faction==="empire"?"Empire ":"High Elf ")+title(type)+" · "+title(arms.weapon)+(addShield?" + Shield":"")+(mounted?" · Mounted":"")});
    model.components=[body.id,...(!named?[arms.id,...(arms.kind==="right"?[addShield?"left_shield":addOffhand?"left_sword":"left_empty_arm"]:[])]:[]),...(mounted?[mountType==="eagle"?"eagle":"horse"]:[]),...(mountType==="eagle"&&body.kind!=="pegasusChampion"?["back_bow"]:[])];model.offhandWeapon=addOffhand;model.namedCharacter=named;
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
 $("mode-collection").addEventListener("click",()=>{$("mode-screen").hidden=true;$("collection-screen").hidden=false;renderAll();});
 $("mode-back").addEventListener("click",onMainMenu);
 document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  const mode=btn.dataset.mode;
  if(mode==="skirmish"){onSkirmish();return;}
  if(mode==="narrative"){onNarrativeCampaign();return;}
  const info={
   grand:["Grand Campaign","Lead a faction across a living world. Expand territory, manage resources and fight battles with only the miniatures in your collection."],
   narrative:["Narrative Campaign","Fight a connected story of missions, choices and persistent rewards. Mission rewards can add specific models to your collection."],
   roguelike:["Roguelike Expedition","Take a small force through a branching, high-risk campaign. Loot and mission rewards add models and bits between runs."]
  }[mode];
  $("mainmenu").hidden=true;$("mode-screen").hidden=false;$("mode-title").textContent=info[0];$("mode-description").textContent=info[1];
 }));
 renderAll();
 return {getInventory:()=>data.models.map(m=>({...m})),getBypass:()=>!!data.bypass,grantLootbox,open:()=>{ $("mainmenu").hidden=true;$("collection-screen").hidden=false;renderAll();}};
}
export function getCollectionSnapshot(){
 try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return d&&Array.isArray(d.models)?d:starterData();}catch{return starterData();}
}
