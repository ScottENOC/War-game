const STORAGE_KEY="warGameMiniatureCollectionV1";
const bodyKinds=[
  {id:"human_infantry_body",label:"Human infantry body",faction:"empire",kind:"infantry"},
  {id:"elf_infantry_body",label:"Elf infantry body",faction:"highElves",kind:"infantry"},
  {id:"human_cavalry_body",label:"Human cavalry rider body",faction:"empire",kind:"cavalry"},
  {id:"elf_cavalry_body",label:"Elf cavalry rider body",faction:"highElves",kind:"cavalry"},
  {id:"human_hero_body",label:"Human hero body",faction:"empire",kind:"captain"},
  {id:"elf_hero_body",label:"Elf hero body",faction:"highElves",kind:"captain"},
  {id:"human_lord_body",label:"Human lord body",faction:"empire",kind:"lord"},
  {id:"elf_lord_body",label:"Elf lord body",faction:"highElves",kind:"lord"}
];
const bitDefs=[
 ...bodyKinds.map(x=>({id:x.id,label:x.label,kind:"body"})),
 {id:"horse",label:"Horse",kind:"mount"},
 {id:"right_sword",label:"Right arm · sword",kind:"right",weapon:"handWeapon"},
 {id:"right_spear",label:"Right arm · spear",kind:"right",weapon:"spear"},
 {id:"right_lance",label:"Right arm · lance",kind:"right",weapon:"lance"},
 {id:"left_shield",label:"Left arm · shield",kind:"shield"},
 {id:"both_greatWeapon",label:"Both arms · great weapon",kind:"twohand",weapon:"greatWeapon"},
 {id:"both_halberd",label:"Both arms · halberd",kind:"twohand",weapon:"halberd"},
 {id:"both_bow",label:"Both arms · bow",kind:"twohand",weapon:"bow"}
];
const labels={empire:"Human / Empire",highElves:"High Elf",swordsmen:"Swordsmen",archers:"Archers",cavalry:"Cavalry",captain:"Hero",lord:"Lord",handWeapon:"Sword",spear:"Spear",lance:"Lance",greatWeapon:"Great weapon",halberd:"Halberd",bow:"Bow"};
const makeModel=(id,faction,type,weapon,extra={})=>({id,faction,type,weapon,shield:!!extra.shield,mounted:!!extra.mounted,components:["body",weapon,...(extra.shield?["shield"]:[]),...(extra.mounted?["horse"]:[])],name:extra.name||((faction==="empire"?"Empire ":"High Elf ")+labels[type]+(type==="swordsmen"||type==="archers"||type==="cavalry"?"":"")+" · "+labels[weapon])});
function starterData(){
 const models=[];let id=1;
 for(let i=0;i<100;i++)models.push(makeModel("starter-"+id++,"empire","swordsmen","handWeapon"));
 for(let i=0;i<50;i++)models.push(makeModel("starter-"+id++,"empire","archers","bow"));
 models.push(makeModel("starter-"+id++,"empire","captain","handWeapon",{name:"Empire Hero · Sword only"}));
 return {version:1,nextId:id,models,bits:{},bypass:false};
}
function load(){
 try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");if(saved&&Array.isArray(saved.models)&&saved.bits)return {...starterData(),...saved};}catch{}
 return starterData();
}
export function createCollectionManager({$,onSkirmish,onMainMenu}){
 let data=load(),editingId=null;
 const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch{}};
 const title=s=>labels[s]||s;
 const bitCount=id=>data.bits[id]||0;
 const addBit=(id,n=1)=>{data.bits[id]=(data.bits[id]||0)+n;};
 const consumeBit=id=>{if(bitCount(id)<1)return false;data.bits[id]--;if(!data.bits[id])delete data.bits[id];return true;};
 const modelLabel=m=>(m.faction==="empire"?"Empire ":"High Elf ")+title(m.type)+" · "+title(m.weapon)+(m.shield?" + Shield":"")+(m.mounted?" · Mounted":"");
 const canUseBit=(m,id)=>{
   const b=bitDefs.find(x=>x.id===id);if(!b)return false;
   if(b.kind==="shield")return !m.shield;
   if(b.kind==="mount")return (m.type==="captain"||m.type==="lord"||m.type==="cavalry")&&!m.mounted&&m.weapon!=="halberd";
   if(b.kind==="right")return m.weapon==="none"&&m.type!=="archers"&&m.type!=="swordsmen";
   if(b.kind==="twohand")return m.weapon==="none"&&(b.weapon!=="halberd"||!m.mounted);
   return false;
 };
 function screen(section,heading){const el=document.createElement(section?"section":"div");el.className="inventory-card";const h=document.createElement("h3");h.textContent=heading;el.append(h);return el;}
 function renderSummary(){
  const el=$("collection-summary");el.replaceChildren();
  const stats=[["Models",data.models.length],["Loose bits",Object.values(data.bits).reduce((a,b)=>a+b,0)],["Empire models",data.models.filter(m=>m.faction==="empire").length],["Elf models",data.models.filter(m=>m.faction==="highElves").length]];
  stats.forEach(([k,v])=>{const card=document.createElement("div");card.className="collection-stat";const strong=document.createElement("strong");strong.textContent=v;const span=document.createElement("span");span.textContent=k;card.append(strong,span);el.append(card);});
 }
 function renderModels(){
  const root=$("model-inventory");root.replaceChildren();
  const counts=new Map();data.models.forEach(m=>{const key=[m.faction,m.type,m.weapon,m.shield,m.mounted].join("|");counts.set(key,(counts.get(key)||0)+1);});
  const groups=[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  if(!groups.length){root.textContent="No assembled models yet.";return;}
  groups.forEach(([key,count])=>{
   const [faction,type,weapon,shield,mounted]=key.split("|");
   const card=document.createElement("article");card.className="inventory-model";
   const strong=document.createElement("strong");strong.textContent=(faction==="empire"?"Empire ":"High Elf ")+title(type);
   const meta=document.createElement("span");meta.textContent=title(weapon)+(shield==="true"?" · Shield":"")+(mounted==="true"?" · Mounted":"");
   const qty=document.createElement("b");qty.textContent="×"+count;card.append(strong,meta,qty);
   const edit=document.createElement("button");edit.className="secondary-button";edit.textContent="Add component";
   const model=data.models.find(m=>[m.faction,m.type,m.weapon,String(m.shield),String(m.mounted)].join("|")===key);
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
    if(def.kind==="shield"){model.shield=true;model.components.push("shield");}
    if(def.kind==="mount"){model.mounted=true;model.components.push("horse");}
    if(def.kind==="right"||def.kind==="twohand"){model.weapon=def.weapon;model.components.push(def.id);}
    model.name=modelLabel(model);save();renderAll();editingId=model.id;renderWorkbench();
   });panel.append(add);
   const note=document.createElement("p");note.className="subtle";note.textContent="This is permanent: you can add components, but cannot remove or replace them.";panel.append(note);
  }
  function renderBuild(){
   panel.replaceChildren();
   const faction=field("Faction",[{value:"empire",label:"Human / Empire"},{value:"highElves",label:"High Elf"}],"empire");
   const kind=field("Main body",bodyKinds.map(b=>({value:b.id,label:b.label})),bodyKinds[0].id);
   const weapon=field("Arms / weapon",[], "right_sword");
   const horseWrap=field("Mount",[{value:"no",label:"No horse"},{value:"yes",label:"Add horse"}],"no");
   const refresh=()=>{
    const body=bodyKinds.find(b=>b.id===kind.value);const cavalry=body.kind==="cavalry";const hero=body.kind==="captain"||body.kind==="lord";
    [...weapon.options].forEach(o=>o.remove());
    const arms=cavalry?["right_sword","right_spear","right_lance","both_greatWeapon"]:(hero?(horseWrap.value==="yes"?["right_sword","right_spear","right_lance","both_greatWeapon"]:["right_sword","right_spear","right_lance","both_greatWeapon","both_halberd"]):["right_sword","right_spear","both_bow"]);
    
    arms.forEach(id=>{const d=bitDefs.find(b=>b.id===id);const o=document.createElement("option");o.value=id;o.textContent=d.label+" ("+bitCount(id)+" owned)";weapon.append(o);});
    horseWrap.parentElement.hidden=!cavalry&&!hero;
    if(!cavalry&&!hero)horseWrap.value="no";
    if(cavalry)horseWrap.value="yes";
   };
   kind.addEventListener("change",refresh);horseWrap.addEventListener("change",refresh);refresh();
   const shieldLabel=document.createElement("label");shieldLabel.className="assembly-shield";const shieldCheck=document.createElement("input");shieldCheck.type="checkbox";shieldCheck.checked=false;shieldLabel.append(shieldCheck,document.createTextNode("Add left arm holding a shield (requires a shield bit)"));panel.append(shieldLabel);
   const p=document.createElement("p");p.className="subtle";p.textContent="A finished model consumes its main body, the selected arms, and a horse if mounted. Elf and human arms are interchangeable.";panel.append(p);
   const assemble=document.createElement("button");assemble.className="primary-button";assemble.textContent="Assemble model";
   assemble.addEventListener("click",()=>{
    const body=bodyKinds.find(b=>b.id===kind.value),arms=bitDefs.find(b=>b.id===weapon.value),mounted=horseWrap.value==="yes"&&(body.kind==="cavalry"||body.kind==="captain"||body.kind==="lord");
    if(body.faction!==faction.value){status.textContent="Choose a main body matching the selected faction.";return;}
    if(mounted&&arms.weapon==="halberd"){status.textContent="Halberds cannot be used by mounted models.";return;}
    const addShield=shieldCheck.checked&&arms.kind==="right";if(shieldCheck.checked&&!addShield){status.textContent="Two-handed weapons use both arms and cannot take a shield.";return;}
    const need=[body.id,arms.id];if(addShield)need.push("left_shield");if(mounted)need.push("horse");
    const shortage=need.find(id=>bitCount(id)<1);if(shortage){status.textContent="Not enough bits: "+bitDefs.find(b=>b.id===shortage).label+".";return;}
    if(body.kind==="cavalry"&&!mounted){status.textContent="Cavalry bodies require a horse.";return;}
    need.forEach(consumeBit);
    const type=body.kind==="infantry"?(arms.weapon==="bow"?"archers":"swordsmen"):body.kind;
    const model=makeModel("assembled-"+data.nextId++,body.faction,type,arms.weapon,{mounted,shield:addShield,name:(body.faction==="empire"?"Empire ":"High Elf ")+title(type)+" · "+title(arms.weapon)+(addShield?" + Shield":"")+(mounted?" · Mounted":"")});
    data.models.push(model);save();renderAll();status.textContent="Model assembled and added to your collection.";
   });panel.append(assemble);
   const status=document.createElement("p");status.className="workbench-status";panel.append(status);
  }
  editBtn.addEventListener("click",renderEdit);buildBtn.addEventListener("click",renderBuild);renderEdit();
 }
 function renderAll(){renderSummary();renderModels();renderBits();renderWorkbench();$("bypass-model-check").checked=!!data.bypass;}
 function rarityWeightedModel(){
  const pool=[
   {faction:"empire",type:"swordsmen",weapon:"handWeapon",cost:8},
   {faction:"empire",type:"archers",weapon:"bow",cost:10},
   {faction:"empire",type:"cavalry",weapon:"handWeapon",cost:16,mounted:true},
   {faction:"empire",type:"captain",weapon:"handWeapon",cost:50},
   {faction:"empire",type:"lord",weapon:"handWeapon",cost:80},
   {faction:"highElves",type:"swordsmen",weapon:"handWeapon",cost:12},
   {faction:"highElves",type:"archers",weapon:"bow",cost:15},
   {faction:"highElves",type:"cavalry",weapon:"handWeapon",cost:24,mounted:true},
   {faction:"highElves",type:"captain",weapon:"handWeapon",cost:75},
   {faction:"highElves",type:"lord",weapon:"handWeapon",cost:120}
  ];
  const weights=pool.map(p=>1/p.cost),sum=weights.reduce((a,b)=>a+b,0);let n=Math.random()*sum;
  for(let i=0;i<pool.length;i++){n-=weights[i];if(n<=0)return pool[i];}return pool[0];
 }
 function openLootbox(){
  const bitChance=0.72;
  if(Math.random()<bitChance){
   const valid=bitDefs.filter(b=>b.kind!=="mount"||bodyKinds.some(x=>x.kind==="cavalry"||x.kind==="captain"||x.kind==="lord"));
   const def=valid[Math.floor(Math.random()*valid.length)];addBit(def.id);
   $("lootbox-result").textContent="Lootbox: "+def.label+". Added one bit.";
  }else{
   const p=rarityWeightedModel();const model=makeModel("loot-"+data.nextId++,p.faction,p.type,p.weapon,{mounted:!!p.mounted,name:(p.faction==="empire"?"Empire ":"High Elf ")+title(p.type)+" · "+title(p.weapon)+(p.mounted?" · Mounted":"")});
   data.models.push(model);$("lootbox-result").textContent="Lootbox: "+modelLabel(model)+". Added one complete model.";
  }
  save();renderAll();
 }
 $("open-collection").addEventListener("click",()=>{ $("mainmenu").hidden=true;$("collection-screen").hidden=false;renderAll();});
 $("collection-back").addEventListener("click",onMainMenu);
 $("collection-skirmish").addEventListener("click",onSkirmish);
 $("open-dev").addEventListener("click",()=>{$("dev-panel").hidden=!$("dev-panel").hidden;});
 $("bypass-model-check").addEventListener("change",e=>{data.bypass=e.target.checked;save();});
 $("dev-lootbox").addEventListener("click",openLootbox);
 $("mode-collection").addEventListener("click",()=>{$("mode-screen").hidden=true;$("collection-screen").hidden=false;renderAll();});
 $("mode-back").addEventListener("click",onMainMenu);
 document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  const mode=btn.dataset.mode;
  if(mode==="skirmish"){onSkirmish();return;}
  const info={
   grand:["Grand Campaign","Lead a faction across a living world. Expand territory, manage resources and fight battles with only the miniatures in your collection."],
   narrative:["Narrative Campaign","Fight a connected story of missions, choices and persistent rewards. Mission rewards can add specific models to your collection."],
   roguelike:["Roguelike Expedition","Take a small force through a branching, high-risk campaign. Loot and mission rewards add models and bits between runs."]
  }[mode];
  $("mainmenu").hidden=true;$("mode-screen").hidden=false;$("mode-title").textContent=info[0];$("mode-description").textContent=info[1];
 }));
 renderAll();
 return {getInventory:()=>data.models.map(m=>({...m})),getBypass:()=>!!data.bypass,open:()=>{ $("mainmenu").hidden=true;$("collection-screen").hidden=false;renderAll();}};
}
export function getCollectionSnapshot(){
 try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return d&&Array.isArray(d.models)?d:starterData();}catch{return starterData();}
}
