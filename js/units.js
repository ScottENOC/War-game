import { FACTIONS } from "./factions.js";

function unitCost(config, faction) {
  const elf=faction==="highElves",type=config.type,models=config.models||1;
  if(type==="captain"||type==="lord"){
    const base=elf?(type==="lord"?120:75):(type==="lord"?80:50);
    return base+(config.heavyArmour?4:0)+(["halberd","greatWeapon"].includes(config.weapon)?4:0)+(config.mounted?8:0)+(config.mounted&&config.weapon==="spear"?2:0)+(config.mounted&&config.weapon==="lance"?4:0)+(config.mounted&&config.barding?4:0)+(config.shield?1:0);
  }
  if(type==="cavalry"){
    const free=config.freeCavalryOption||"bow";
    return models*(elf?24:16)+(config.bow&&!(elf&&free==="bow")?2*models:0)+(config.heavyArmour?2*models:0)+(config.barding?2*models:0)+(config.shield?0.5*models:0)+(config.weapon==="spear"&&!(elf&&free==="spear")?models:0)+(["lance","greatWeapon"].includes(config.weapon)?2*models:0);
  }
  const base=elf?(type==="swordsmen"?12:15):(type==="swordsmen"?8:10);
  return models*base+(config.champion?(elf?9:6):0)+(config.lightArmour&&!elf?models:0)+(config.spears&&!(elf&&type==="swordsmen")?models:0)+(config.shield&&!(elf&&type==="swordsmen")?0.5*models:0);
}
function buildUnit(template,config,faction,opposing=false) {
  const elf=faction==="highElves"&&!opposing,stats={...template.stats};
  const isCharacter=config.type==="captain"||config.type==="lord",isCavalry=config.type==="cavalry",mounted=isCavalry||(isCharacter&&!!config.mounted);
  if(mounted)stats.M=elf?9:8;
  if(mounted&&config.barding&&!elf)stats.M=7;
  const lightArmour=isCavalry||isCharacter?(!config.heavyArmour):(elf||!!config.lightArmour);
  const spears=config.type==="swordsmen"&&(elf||!!config.spears),shield=!!config.shield||(elf&&config.type==="swordsmen");
  const hasBow=isCavalry&&(!!config.bow||(elf&&(config.freeCavalryOption||"bow")==="bow"));
  let weapon=(isCharacter||isCavalry)?(config.weapon||"handWeapon"):"handWeapon";
  if(isCavalry&&elf&&(config.freeCavalryOption||"bow")==="spear"&&weapon==="handWeapon")weapon="spear";
  const costFaction=opposing?"empire":faction;
  return {id:config.id,name:template.name+" "+config.index,short:template.short,side:config.side,kind:template.kind,
    isCharacter,isCavalry,mounted,isGeneral:false,attachedTo:null,baseMove:stats.M,
    models:isCharacter?1:config.models,startModels:isCharacter?1:config.models,points:unitCost(config,costFaction),weapon,
    spears,spearRanks:elf&&spears?3:2,hasBow,range:template.range||24,lightArmour,heavyArmour:!!config.heavyArmour,barding:!!config.barding,shield,
    alwaysStrikesFirst:!!template.alwaysStrikesFirst,mountStats:mounted?{...(template.mountStats||{A:1,WS:3,I:3,S:3})}:null,
    baseWidthIn:mounted?25/25.4:20/25.4,baseDepthIn:mounted?50/25.4:20/25.4,
    armour:isCavalry||isCharacter?(config.heavyArmour?"heavy":"light"):(lightArmour?"light":"none"),wardSave:null,
    largeTarget:false,singleCharacter:false,skirmisher:false,cover:null,x:config.x,y:config.y,facing:config.facing,deployed:config.side==="ai",
    engaged:false,engagedWith:null,engagedSide:null,chargedSide:null,attackedFromSide:null,flankedBy:null,
    formationWidth:5,canCounterCharge:true,fleeingCharge:false,activated:false,moved:false,shot:false,charged:false,fled:false,
    moveUsed:0,damage:0,shootCasualties:0,panicTested:false,stats,champion:{enabled:!!config.champion&&!isCharacter&&!isCavalry,stats:null},attachedCharacters:[],
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
  Object.values(units).filter(u=>u.side==="ai"&&u.isCharacter).forEach(hero=>{
    const host=Object.values(units).find(u=>u.side==="ai"&&!u.isCharacter&&u.models>0&&!!u.isCavalry===!!hero.mounted);
    if(!host)return;hero.attachedTo=host.id;hero.x=host.x;hero.y=host.y;host.attachedCharacters=[...new Set([...(host.attachedCharacters||[]),hero.id])];host.stats.M=Math.min(host.baseMove??host.stats.M,hero.stats.M);
  });
  for(const side of ["player","ai"]){const general=Object.values(units).filter(u=>u.side===side&&u.isCharacter).sort((a,b)=>b.stats.Ld-a.stats.Ld)[0];if(general)general.isGeneral=true;}
  return units;
}
export function createStartingUnits(){return createUnitsFromArmy([{type:"swordsmen",models:20,champion:false,lightArmour:false}]);}