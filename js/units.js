import { FACTIONS } from "./factions.js";

function unitCost(config, faction) {
  const elf=faction==="highElves",type=config.type,models=config.models||1,character=type==="captain"||type==="lord";
  const upgrades=[{key:"M",unit:2,character:5},{key:"WS",unit:2,character:5},{key:"BS",unit:2,character:5},{key:"S",unit:3,character:6},{key:"T",unit:4,character:8},{key:"I",unit:1,character:3},{key:"Ld",unit:1,character:3}].reduce((sum,s)=>sum+(config.upgrades&&config.upgrades[s.key]?(character?s.character:s.unit*models):0),0);
  const skillCost=["rerollOnesMelee","rerollOnesShooting","steadfast","skirmish"].reduce((sum,key)=>sum+(config.skills&&config.skills[key]?3:0),0);
  const weapons=[...new Set([...(config.meleeWeapons||[]),config.weapon||"handWeapon"])];
  const ranged=config.rangedWeapon||(["bow","crossbow","firearm"].includes(config.weapon)?config.weapon:(type==="archers"?"bow":config.bow?"bow":null));
  const rangedCost=ranged==="bow"?(elf&&type==="cavalry"&&(config.freeCavalryOption||"bow")==="bow"?0:(elf?3:2)*(character?1:models)):ranged==="crossbow"?3*(character?1:models):ranged==="firearm"?4*(character?1:models):0;
  if(character){
    const meleeCost=weapons.reduce((sum,w)=>sum+(["halberd","greatWeapon"].includes(w)?4:w==="spear"&&config.mounted?2:w==="lance"&&config.mounted?4:0),0);
    return (elf?(type==="lord"?120:75):(type==="lord"?80:50))+(config.heavyArmour?4:0)+meleeCost+(config.mounted?8:0)+(config.mounted&&config.barding?4:0)+(config.shield?2:0)+rangedCost+upgrades+skillCost;
  }
  if(type==="cavalry"){
    const free=config.freeCavalryOption||"bow";
    const meleeCost=weapons.reduce((sum,w)=>sum+(w==="spear"&&!(elf&&free==="spear")?models:["lance","greatWeapon"].includes(w)?2*models:0),0);
    const bowCost=(config.bow&&!(elf&&free==="bow")?2*models:0)+(ranged==="bow"&&!(elf&&free==="bow")&&!config.bow?2*models:0);
    const otherRangedCost=ranged==="crossbow"?3*models:ranged==="firearm"?4*models:0;
    return models*(elf?24:16)+(config.elvenArchery&&elf&&(ranged==="bow"||config.bow||free==="bow")?2*models:0)+bowCost+otherRangedCost+(config.heavyArmour?2*models:0)+(config.barding?2*models:0)+(config.shield?0.5*models:0)+meleeCost+upgrades+skillCost;
  }
  const meleeCost=weapons.reduce((sum,w)=>sum+(w==="spear"&&!(elf&&type==="swordsmen")?models:w==="greatWeapon"?2*models:w==="halberd"?models:0),0);
  return models*(elf?12:8)+meleeCost+rangedCost+(config.elvenArchery&&elf&&ranged==="bow"?2*models:0)+(config.champion?(elf?9:6):0)+(config.lightArmour&&!elf?models:0)+(config.shield&&!(elf&&type==="swordsmen")?0.5*models:0)+upgrades+skillCost;
}
function buildUnit(template,config,faction,opposing=false) {
  const elf=faction==="highElves"&&!opposing,stats={...template.stats};
  const isCharacter=config.type==="captain"||config.type==="lord",isCavalry=config.type==="cavalry",mounted=isCavalry||(isCharacter&&!!config.mounted);
  if(mounted)stats.M=elf?9:8;
  if(mounted&&config.barding&&!elf)stats.M=7;
  if(isCharacter&&!mounted&&config.heavyArmour&&!elf)stats.M=Math.max(1,stats.M-1);
  const lightArmour=isCavalry||isCharacter?(!config.heavyArmour):(elf||!!config.lightArmour);
  const meleeWeapons=[...new Set([...(config.meleeWeapons||[]),config.weapon||"handWeapon"])],spears=config.type==="swordsmen"&&config.weapon==="spear"&&meleeWeapons.includes("spear"),ownsShield=!!config.shield,shield=ownsShield&&(!["halberd","greatWeapon"].includes(config.weapon)||config.weapon==="spear");
  const rangedWeapon=config.rangedWeapon||(["bow","crossbow","firearm"].includes(config.weapon)?config.weapon:(config.type==="archers"?"bow":(isCavalry&&(!!config.bow||(elf&&(config.freeCavalryOption||"bow")==="bow"))?"bow":null)));
  const hasBow=rangedWeapon==="bow";
  let weapon=(isCharacter||isCavalry||config.type==="swordsmen")?(["bow","crossbow","firearm"].includes(config.weapon)?"handWeapon":(config.weapon||"handWeapon")):"handWeapon";
  const shield=ownsShield&&(weapon==="spear"||(!["greatWeapon","halberd"].includes(weapon)&&(!rangedWeapon||config.rangedMode!=="bow")));
  for(const key of ["M","WS","BS","S","T","I","Ld"])if(config.upgrades&&config.upgrades[key])stats[key]+=1;
  const campaignStats=config.campaignStats||{};
  for(const key of ["WS","BS","S","T","Ld"])stats[key]+=Math.max(0,campaignStats[key]||0);
  if(campaignStats.MI){stats.M+=campaignStats.MI;stats.I+=campaignStats.MI;}
  // Halberds are infantry weapons; prevent stale or malformed mounted loadouts.
  if(mounted&&weapon==="halberd")weapon="handWeapon";
  if(isCavalry&&elf&&(config.freeCavalryOption||"bow")==="spear"&&weapon==="handWeapon"&&!meleeWeapons.includes("spear")){weapon="spear";meleeWeapons.push("spear");}
  const costFaction=opposing?"empire":faction;
  return {id:config.id,name:template.name+" "+config.index,short:template.short,side:config.side,kind:template.kind,
    isCharacter,isCavalry,mounted,isGeneral:false,attachedTo:null,baseMove:stats.M,
    models:isCharacter?1:config.models,startModels:isCharacter?1:config.models,points:unitCost(config,costFaction),weapon,meleeWeapons,hasSpear:meleeWeapons.includes("spear"),hasGreatWeapon:meleeWeapons.includes("greatWeapon"),hasHalberd:meleeWeapons.includes("halberd"),ownsShield,shield:ownsShield&&(!["greatWeapon","halberd"].includes(weapon)),rangedWeapon,hasRangedWeapon:!!rangedWeapon,rangedMode:ownsShield&&rangedWeapon?"shield":rangedWeapon?"bow":"shield",
    rangedStrength:["crossbow","firearm"].includes(rangedWeapon)?4:3,armourPiercing:rangedWeapon==="firearm"?1:0,
    bsCap:rangedWeapon==="crossbow"?4:rangedWeapon==="firearm"?3:null,
    ranksToShoot:mounted?1:rangedWeapon==="bow"?(elf?4:3):rangedWeapon==="crossbow"||rangedWeapon==="firearm"?2:0,
    overUnitPenalty:rangedWeapon==="bow"?1:rangedWeapon==="crossbow"?2:2,
    spears,spearRanks:elf&&spears?3:2,hasBow,range:rangedWeapon==="bow"?(elf?30:24):rangedWeapon==="crossbow"?30:rangedWeapon==="firearm"?20:(template.range||24),lightArmour,heavyArmour:!!config.heavyArmour,barding:!!config.barding,
    alwaysStrikesFirst:!!template.alwaysStrikesFirst,elvenArchery:!!elf&&!!config.elvenArchery,skills:{...(config.skills||{})},skirmishCapable:!!config.skills?.skirmish,skirmishing:false,skirmishCombatRound:0,faction:elf?"highElves":"empire",mountStats:mounted?{...(template.mountStats||{A:1,WS:3,I:3,S:3})}:null,
    baseWidthIn:mounted?25/25.4:20/25.4,baseDepthIn:mounted?50/25.4:20/25.4,
    armour:isCavalry||isCharacter?(config.heavyArmour?"heavy":"light"):(lightArmour?"light":"none"),wardSave:null,
    largeTarget:false,singleCharacter:false,skirmisher:false,cover:null,x:config.x,y:config.y,facing:config.facing,deployed:config.side==="ai",
    engaged:false,engagedWith:null,engagedSide:null,chargedSide:null,attackedFromSide:null,flankedBy:null,
    formationWidth:5,canCounterCharge:true,fleeingCharge:false,activated:false,moved:false,shot:false,charged:false,fled:false,
    moveUsed:0,damage:0,shootCasualties:0,panicTested:false,stats,champion:{enabled:!!config.champion&&!isCharacter&&!isCavalry,bonus:config.championBonus||(config.type==="archers"?"BS":"A"),stats:null},attachedCharacters:[],
    characterWounds:isCharacter?template.stats.W:null,delayedDeath:false,delayedDeathSnapshot:null,championAlive:!!config.champion,championWounds:config.champion?template.stats.W:0};
}
export function createUnitsFromArmy(army,faction="empire") {
  const units={},playerFaction=faction==="highElves"?"highElves":"empire";
  army.forEach((entry,index)=>{
    const n=index+1,y=n/(army.length+1),playerEntry={...entry},aiEntry={...entry};
    if(playerFaction==="highElves"&&entry.type==="cavalry"){
      if((entry.freeCavalryOption||"bow")==="bow")aiEntry.bow=true;
      else if(!["lance","greatWeapon"].includes(aiEntry.weapon))aiEntry.weapon="spear";
    }
    units["p"+n]=buildUnit(FACTIONS[playerFaction].units[entry.type],{...playerEntry,id:"p"+n,index:n,side:"player",x:.22,y,facing:0},playerFaction,false);
    units["a"+n]=buildUnit(FACTIONS.opposing.units[entry.type],{...aiEntry,id:"a"+n,index:n,side:"ai",x:.78,y,facing:Math.PI},"empire",true);
  });
  Object.values(units).filter(u=>u.side==="ai"&&u.isCharacter&&!u.hasRangedWeapon).forEach(hero=>{
    const host=Object.values(units).find(u=>u.side==="ai"&&!u.isCharacter&&u.models>0&&!!u.isCavalry===!!hero.mounted);
    if(!host)return;hero.attachedTo=host.id;hero.x=host.x;hero.y=host.y;host.attachedCharacters=[...new Set([...(host.attachedCharacters||[]),hero.id])];host.stats.M=Math.min(host.baseMove??host.stats.M,hero.stats.M);
  });
  for(const side of ["player","ai"]){const general=Object.values(units).filter(u=>u.side===side&&u.isCharacter).sort((a,b)=>b.stats.Ld-a.stats.Ld)[0];if(general)general.isGeneral=true;}
  return units;
}
export function createStartingUnits(){return createUnitsFromArmy([{type:"swordsmen",models:20,champion:false,lightArmour:false}]);}