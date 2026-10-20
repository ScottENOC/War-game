import { getCollectionSnapshot } from "./collection.js?v=20261020-undead-rules-v3";
import { unitCost, createUnitsFromArmy } from "./units.js?v=20261020-undead-rules-v3";
const FACTIONS = {
 empire:{name:"Human Realms",summary:"The largest and most populous realm, but not a unified kingdom.",strengths:"Broad territory, fertile river valleys, trade roads and the largest pool of settlements.",politics:"Crownfall and Westmere recognise your court. Goldhaven, Stonebridge and Southwatch answer to rival human lords.",playerCities:["Crownfall","Westmere"],armyFaction:"empire"},
 highElves:{name:"High Elves",summary:"An old maritime people whose courts cluster around ancient forests and island harbours.",strengths:"Defensible islands, forest resources, sea access and compact but valuable settlements.",politics:"Aelthir recognises your court. Moonspire and Silvershade retain their own power and may resist your claims.",playerCities:["Aelthir"],armyFaction:"highElves"},
 dwarfs:{name:"Dwarfs",summary:"An old civilisation of mountain holds linked by passes and deep roads. No lowland settlements.",strengths:"Mountain strongholds, mineral wealth and defensible approaches; every hold is strategically important.",politics:"Ironhold follows your clan. Deepdelve is held by a rival thane with his own army and treasury.",playerCities:["Ironhold"],armyFaction:"dwarfs"},
 greenskins:{name:"Greenskin Hordes",summary:"A sprawling, fractured belt of goblin tribes, orc warbands and ogre strongholds occupying the eastern plains and mountain chains.",strengths:"Extensive territory, rough mountain approaches, broad grazing plains and several rival warbosses.",politics:"No single warboss commands every tribe. The starting settlement determines which local power begins the campaign.",playerCities:["Grinhold","Redfang Plain","Skullcrag","Ironjaw Pass","Mudgut","Bonefield"],armyFaction:"empire"},
 undead:{name:"The Undying Courts",summary:"Scattered barrow kingdoms, haunted marshes and ancient necropolises separated by long stretches of hostile country.",strengths:"Widely separated strongholds and defensible ruins; influence is dispersed rather than continuous.",politics:"Each necropolis is a power centre in its own right. No single ruler controls every undead settlement.",playerCities:["Barrowmere","Nightfen","Sepulchre"],armyFaction:"undead"},
 evilHumans:{name:"The Blackened Principalities",summary:"Human tyrants, fallen noble houses and militarised border states that reject the old crowns.",strengths:"Fortified roads, hard country and several independent principalities.",politics:"The princes share enemies more readily than they share authority. Choose which lord's domain begins your campaign.",playerCities:["Blackthorn","Dreadmarch","Varkesh","Ashenford"],armyFaction:"empire"}
};
// Race rules are shared defaults; political factions are the actual campaign actors.
// Individual factions may override their race's roster, diplomacy and economic traits.
const RACES = {
 human:{name:"Human",defaultRoster:"empire",attitudes:{greenskin:-55,undead:-45,elf:0,dwarf:0,human:0}},
 elf:{name:"High Elf",defaultRoster:"highElves",attitudes:{greenskin:-65,undead:-60,human:0,dwarf:-20,elf:15}},
 dwarf:{name:"Dwarf",defaultRoster:"dwarfs",attitudes:{greenskin:-75,undead:-50,elf:-35,human:5,dwarf:15}},
 greenskin:{name:"Greenskin",defaultRoster:"greenskins",attitudes:{human:-65,elf:-70,dwarf:-75,undead:-10,greenskin:10}},
 undead:{name:"Undead",defaultRoster:"undead",attitudes:{human:-45,elf:-55,dwarf:-45,greenskin:-10,undead:15}}
};
const FACTION_PROFILES = {
 1:{id:"valedorn",name:"House Valedorn",race:"human",colours:{main:"#8E2636",accent:"#D6B56D"},emblem:"crown"},
 2:{id:"merrow",name:"House Merrow",race:"human",colours:{main:"#244B55",accent:"#D6B56D"},emblem:"tower"},
 3:{id:"kest",name:"House Kest",race:"human",colours:{main:"#B57B25",accent:"#5D1724"},emblem:"hawk"},
 4:{id:"vane",name:"House Vane",race:"human",colours:{main:"#5A4A7D",accent:"#D9D2C2"},emblem:"bridge"},
 5:{id:"caedmon",name:"Southwatch March",race:"human",colours:{main:"#344B36",accent:"#C5A35C"},emblem:"fortress"},
 6:{id:"verdantCourt",name:"The Verdant Court",race:"elf",colours:{main:"#172B55",accent:"#D7E0EC"},emblem:"star"},
 7:{id:"moonlitPrinces",name:"The Moonlit Princes",race:"elf",colours:{main:"#3D477D",accent:"#D8D4F2"},emblem:"crescent"},
 8:{id:"silverAdmiralty",name:"The Silver Admiralty",race:"elf",colours:{main:"#176A78",accent:"#D7E0EC"},emblem:"swan"},
 9:{id:"barakdur",name:"Clan Barakdur",race:"dwarf",colours:{main:"#245A59",accent:"#AD7945"},emblem:"hammer"},
 10:{id:"kazrinn",name:"Clan Kazrinn",race:"dwarf",colours:{main:"#454B57",accent:"#C9B78A"},emblem:"anvil"},
 11:{id:"grinholdCouncil",name:"Grinhold Warboss Council",race:"greenskin",colours:{main:"#526B3A",accent:"#A62E2E"},emblem:"tusk"},
 12:{id:"redfang",name:"Redfang Warband",race:"greenskin",colours:{main:"#A62E2E",accent:"#D8CFB6"},emblem:"fang"},
 13:{id:"cragBosses",name:"The Crag Bosses",race:"greenskin",colours:{main:"#343A32",accent:"#C7A84B"},emblem:"skull"},
 14:{id:"ironjaw",name:"Ironjaw Tribe",race:"greenskin",colours:{main:"#6D7737",accent:"#292929"},emblem:"jaw"},
 15:{id:"mudgut",name:"Mudgut Clans",race:"greenskin",colours:{main:"#69513C",accent:"#A62E2E"},emblem:"boar"},
 16:{id:"bonefield",name:"Bonefield Warband",race:"greenskin",colours:{main:"#292929",accent:"#D8CFB6"},emblem:"bones"},
 17:{id:"paleRegent",name:"The Pale Regent",race:"undead",colours:{main:"#29272F",accent:"#D8D0C2"},emblem:"skull"},
 18:{id:"fenCourt",name:"The Fen Court",race:"undead",colours:{main:"#4B5550",accent:"#74617D"},emblem:"reed"},
 19:{id:"ashenSepulchre",name:"The Ashen Sepulchre",race:"undead",colours:{main:"#45334F",accent:"#A7A19A"},emblem:"crypt"},
 20:{id:"blackthorn",name:"House Blackthorn",race:"human",colours:{main:"#581F2A",accent:"#98999A"},emblem:"thorn"},
 21:{id:"ironMarshal",name:"The Iron Marshal",race:"human",colours:{main:"#29292D",accent:"#B66A35"},emblem:"spear"},
 22:{id:"varkesh",name:"The Principality of Varkesh",race:"human",colours:{main:"#7C342D",accent:"#D6B77B"},emblem:"sun"},
 23:{id:"ashenCouncil",name:"The Ashen Council",race:"human",colours:{main:"#68645B",accent:"#B66A35"},emblem:"gate"}
};
const FACTION_BY_ID = Object.fromEntries(Object.values(FACTION_PROFILES).map(f=>[f.id,f]));

const FACTION_ROSTER_OVERRIDES={
 valedorn:{roster:"empire",units:["swordsmen","archers","captain","cavalry"]},
 merrow:{roster:"empire",units:["swordsmen","archers","cavalry","cannon"]},
 kest:{roster:"empire",units:["swordsmen","cavalry","archers","captain"]},
 vane:{roster:"empire",units:["swordsmen","archers","cannon","captain"]},
 caedmon:{roster:"empire",units:["swordsmen","cavalry","cannon","archers"]},
 verdantCourt:{roster:"highElves",units:["swordsmen","archers","cavalry","boltThrower"]},
 moonlitPrinces:{roster:"highElves",units:["swordsmen","archers","cavalry","captain"]},
 silverAdmiralty:{roster:"highElves",units:["archers","cavalry","swordsmen","boltThrower"]},
 barakdur:{roster:"dwarfs",units:["dwarfInfantry","dwarfInfantry","dwarfCaptain","cannon"]},
 kazrinn:{roster:"dwarfs",units:["dwarfInfantry","dwarfCaptain","cannon"]},
 grinholdCouncil:{roster:"greenskins",units:["orcBoyz","goblins","boarBoyz","orcHero"]},
 redfang:{roster:"greenskins",units:["goblins","wolfRiders","wolfRiders","goblinHero"]},
 cragBosses:{roster:"greenskins",units:["orcBoyz","orcBoyz","goblins","catapult"]},
 ironjaw:{roster:"greenskins",units:["orcBoyz","boarBoyz","orcBoyz","orcHero"]},
 mudgut:{roster:"greenskins",units:["wolfRiders","goblins","boarBoyz","goblinHero"]},
 bonefield:{roster:"greenskins",units:["goblins","orcBoyz","wolfRiders","orcHero"]},
 paleRegent:{roster:"empire",units:["swordsmen","swordsmen","archers","lord"]},
 fenCourt:{roster:"empire",units:["swordsmen","archers","cavalry","captain"]},
 ashenSepulchre:{roster:"empire",units:["swordsmen","archers","cannon","lord"]},
 blackthorn:{roster:"empire",units:["swordsmen","archers","cavalry","captain"]},
 ironMarshal:{roster:"empire",units:["swordsmen","cannon","archers","captain"]},
 varkesh:{roster:"empire",units:["swordsmen","cavalry","archers","lord"]},
 ashenCouncil:{roster:"empire",units:["swordsmen","archers","cannon","captain"]}
};
function rosterFactionForPoliticalFaction(id){
 const profile=FACTION_BY_ID[id];return FACTION_ROSTER_OVERRIDES[id]?.roster||RACES[profile?.race]?.defaultRoster||"empire";
}
function collectionModels(){try{return (getCollectionSnapshot()?.models||[]).filter(m=>m&&typeof m==="object");}catch{return [];}}
function campaignCharacterConfig(id,commander=null){
 const profile=FACTION_BY_ID[id],race=profile?.race||"human";
 let type=race==="dwarf"?"dwarfCaptain":"captain",model=null;
 if(commander){
  const models=collectionModels();model=models.find(m=>m.id===commander.modelId)||models.find(m=>m.name===commander.name);
  if(commander.id==="edric_voss")type="legendaryLord";
  else if(commander.id==="aelthir_dawnwing")type="pegasusChampion";
  else if(commander.id==="lethariel_starweaver")type="shadowElf";
  else if(commander.id==="haldric_stoneward")type="dwarfKingHaldric";
  else if(model?.type)type=model.type;
 }
 const config={type,models:1,weapon:"handWeapon",meleeWeapons:["handWeapon"],champion:false,upgrades:{},skills:{}};
 if(type==="legendaryLord"){config.heavyArmour=true;config.shield=true;}
 if(type==="pegasusChampion"){config.mounted=true;config.mountType="eagle";config.weapon="lance";config.meleeWeapons=["handWeapon","lance"];config.heavyArmour=true;config.shield=true;}
 if(type==="shadowElf"){config.heavyArmour=true;config.weapon="handWeapon";config.meleeWeapons=["handWeapon","offhandWeapon"];config.rangedWeapon="magicBow";config.skills={skirmish:true};}
 if(type==="dwarfKingHaldric"){config.shield=true;config.magicArmour=true;}
 if(model?.weapon&&type!=="pegasusChampion"&&type!=="shadowElf"&&type!=="dwarfKingHaldric")config.weapon=model.weapon;
 return config;
}
function createCampaignArmyRoster(id,targetPoints=500,{player=false,commander=null}={}){
 const faction=rosterFactionForPoliticalFaction(id),profile=FACTION_BY_ID[id],race=profile?.race||"human";
 const basicType=race==="dwarf"?"dwarfInfantry":race==="greenskin"?"goblins":"swordsmen",rangedType=race==="dwarf"?"dwarfInfantry":race==="greenskin"?"goblins":"archers";
 const character=campaignCharacterConfig(id,player?commander:null);
 let roster=[];
 if(player){
  const models=collectionModels(),count=(type,weaponFilter=null)=>models.filter(m=>m.faction===faction&&m.type===type&&(!weaponFilter||weaponFilter(m))).length;
  const meleeAvailable=count(basicType,m=>m.weapon==="handWeapon");
  const rangedAvailable=race==="dwarf"?count("dwarfInfantry",m=>m.weapon==="crossbow"):count("archers",m=>m.weapon==="bow");
  const pushStartingUnit=(type,models,rangedWeapon=null)=>{
   roster.push({type,models,weapon:"handWeapon",meleeWeapons:["handWeapon"],...(rangedWeapon?{rangedWeapon}:{}),champion:false,upgrades:{},skills:{}});
  };
  // The player's starter army has at most two melee units, balanced to within
  // one model. Infantry units may contain 5-30 models each.
  const meleeDeployed=Math.min(60,meleeAvailable);
  if(meleeDeployed>=5){
   if(meleeDeployed<10)pushStartingUnit(basicType,meleeDeployed);
   else{
    const first=Math.floor(meleeDeployed/2),second=Math.ceil(meleeDeployed/2);
    pushStartingUnit(basicType,first);
    pushStartingUnit(basicType,second);
   }
  }
  // Ranged models form one separate unit, which appears as soon as five
  // compatible archers (or dwarf crossbowmen) are owned.
  const rangedDeployed=Math.min(30,rangedAvailable);
  if(rangedDeployed>=5)pushStartingUnit(rangedType,rangedDeployed,race==="dwarf"?"crossbow":"bow");
  if(commander)roster.push(character);
 }else{
  roster=[
   {type:basicType,models:15,weapon:"handWeapon",meleeWeapons:["handWeapon"],champion:false,upgrades:{},skills:{}},
   {type:basicType,models:15,weapon:"handWeapon",meleeWeapons:["handWeapon"],champion:false,upgrades:{},skills:{}},
   {type:rangedType,models:10,weapon:"handWeapon",meleeWeapons:["handWeapon"],rangedWeapon:race==="dwarf"?"crossbow":"bow",champion:false,upgrades:{},skills:{}},
   character
  ];
 }
 const points=roster.reduce((sum,u)=>sum+unitCost(u,faction),0);
 return {faction,roster,points,politicalFactionId:id};
}
function campaignCityIncome(region){
 const s=region?.settlement;if(!s)return 0;
 const tier=Math.max(1,Number(s.historicalTier)||1),prosperity=Math.max(0,Math.min(100,Number(s.prosperity)||0));
 const population=Math.max(0,Number(s.population?.total)||0);if(population<=0)return 0;
 const buildings=(s.buildings||[]).reduce((sum,b)=>sum+Math.max(0,Math.min(100,Number(b.condition)||0)),0);
 const infrastructureValue=Number(s.infrastructureCondition),infrastructure=Math.max(.25,Math.min(1,Number.isFinite(infrastructureValue)?infrastructureValue/100:1));
 return Math.round((10+tier*10+prosperity*.35+Math.log10(Math.max(1,population))*6+buildings*.04)*infrastructure);
}
function campaignArmyCost(army){
 return Math.max(0,Math.round((army?.roster||[]).reduce((sum,u)=>sum+unitCost(u,army.rosterFaction||"empire"),0)));
}
function campaignArmyUpkeep(army){return Math.ceil(campaignArmyCost(army)*.04);}
function recruitmentRaceForCulture(culture){
 const value=String(culture||"").toLowerCase();
 if(value.includes("elf"))return "elf";
 if(value.includes("dwarf"))return "dwarf";
 if(value.includes("green")||value.includes("goblin")||value.includes("orc"))return "greenskin";
 if(value.includes("undead"))return "undead";
 if(value.includes("human")||value.includes("valedorn")||value.includes("westmere"))return "human";
 return "human";
}
function recruitmentRate(race){
 return race==="elf"?0.00005:race==="dwarf"?0.0002:race==="greenskin"?Infinity:race==="undead"?0.0002:0.0004;
}
function initialRecruitmentRate(race){
 return race==="elf"?0.002:race==="dwarf"?0.0026:race==="greenskin"?Infinity:race==="undead"?0.002:0.004;
}
function recruitmentPoolCapRate(race){
 return race==="elf"?0.003:race==="dwarf"?0.004:race==="greenskin"?Infinity:race==="undead"?0.004:0.006;
}
function ensureSettlementRecruitment(region){
 const settlement=region?.settlement;
 if(!settlement?.population)return null;
 if(!settlement.recruitmentPools||typeof settlement.recruitmentPools!=="object")settlement.recruitmentPools={};
 for(const group of settlement.population.groups||[]){
  const race=recruitmentRaceForCulture(group.culture);
  if(race==="greenskin")continue;
  if(!settlement.recruitmentPools[race]){
   const count=Math.max(0,Number(group.count)||0),rate=initialRecruitmentRate(race);
   settlement.recruitmentPools[race]={available:Math.floor(count*rate),progress:0};
  }
 }
 return settlement.recruitmentPools;
}
function recruitmentPoolAvailable(faction,region){
 const race=faction?.race||FACTION_BY_ID[faction?.id]?.race||"human";
 if(race==="greenskin")return Infinity;
 const pools=ensureSettlementRecruitment(region);
 return Math.max(0,Math.floor(Number(pools?.[race]?.available)||0));
}
function growSettlementRecruitment(region){
 const pools=ensureSettlementRecruitment(region);
 if(!pools)return;
 for(const [race,pool] of Object.entries(pools)){
  const population=(region.settlement.population.groups||[]).filter(g=>recruitmentRaceForCulture(g.culture)===race).reduce((n,g)=>n+Math.max(0,Number(g.count)||0),0);
  const rate=recruitmentRate(race);
  if(!population||!Number.isFinite(rate))continue;
  pool.progress=(Number(pool.progress)||0)+population*rate;
  const gained=Math.floor(pool.progress);
  if(gained>0){
   const cap=Math.floor(population*recruitmentPoolCapRate(race));
   pool.available=Math.min(cap,Math.max(0,Number(pool.available)||0)+gained);
   pool.progress-=gained;
  }
 }
}
function growFactionRecruitment(campaign,faction){
 let gained=0;
 for(const region of campaign?.regions||[]){
  if(politicalOwner(region)!==faction?.id)continue;
  const before=Object.values(ensureSettlementRecruitment(region)||{}).reduce((n,p)=>n+(p.available||0),0);
  growSettlementRecruitment(region);
  const after=Object.values(ensureSettlementRecruitment(region)||{}).reduce((n,p)=>n+(p.available||0),0);
  gained+=after-before;
 }
 return gained;
}
function consumeRecruitmentPool(faction,region,count){
 count=Math.max(0,Math.floor(Number(count)||0));
 if(!faction||!region||count<=0)return false;
 const race=faction.race||FACTION_BY_ID[faction.id]?.race||"human";
 if(race==="greenskin")return true;
 const pools=ensureSettlementRecruitment(region),pool=pools?.[race];
 if(!pool||Math.floor(Number(pool.available)||0)<count)return false;
 pool.available-=count;
 return true;
}
function civilianPopulation(region,race=null){
 const groups=region?.settlement?.population?.groups||[];
 if(race)return Math.max(0,Math.floor(groups.filter(g=>recruitmentRaceForCulture(g.culture)===race).reduce((n,g)=>n+Math.max(0,Number(g.count)||0),0)));
 return Math.max(0,Math.floor(Number(region?.settlement?.population?.total)||0));
}
function consumeCivilianPopulation(region,count,race=null){
 count=Math.max(0,Math.floor(Number(count)||0));
 if(!region?.settlement?.population||civilianPopulation(region,race)<count)return false;
 const population=region.settlement.population;
 const totalBefore=civilianPopulation(region);
 let remaining=count;
 const eligible=(population.groups||[]).filter(g=>!race||recruitmentRaceForCulture(g.culture)===race).sort((a,b)=>(b.count||0)-(a.count||0));
 for(const group of eligible){
  const loss=Math.min(Math.max(0,group.count||0),remaining);
  group.count-=loss;remaining-=loss;if(!remaining)break;
 }
 if(remaining>0)return false;
 population.total=Math.max(0,totalBefore-count);
 return true;
}
function recruitmentCapacity(army){
 const faction=selectedFactionTreasury(),region=activeCampaign?.regions?.find(r=>r.id===army?.region);
 const race=faction?.race||FACTION_BY_ID[faction?.id]?.race||"human";
 return Math.max(0,Math.floor(Math.min(recruitmentPoolAvailable(faction,region),civilianPopulation(region,race))));
}
function availableForRecruitment(option,army){
 const available=availableForOption(option),capacity=recruitmentCapacity(army);
 return option?.fixed?Math.floor(Math.min(available*option.min,capacity)/option.min):Math.min(available,capacity);
}
function recruitArmyModels(army,faction,budget,campaign,factionState){
 let spent=0,added=0;
 const region=campaign?.regions?.find(r=>r.id===army.region),race=factionState?.race||FACTION_BY_ID[factionState?.id]?.race||"human";
 while(added<5&&budget-spent>0&&recruitmentPoolAvailable(factionState,region)>0&&civilianPopulation(region,race)>0){
  const unit=(army.roster||[]).find(u=>["swordsmen","dwarfInfantry","archers","goblins","orcBoyz"].includes(u.type)&&u.models<30);
  if(!unit)break;
  const before=unitCost({...unit,models:unit.models},faction),after=unitCost({...unit,models:unit.models+1},faction),price=Math.max(1,after-before);
  if(budget-spent<price)break;
  if(!consumeRecruitmentPool(factionState,region,1)||!consumeCivilianPopulation(region,1,race))break;
  unit.models++;spent+=price;added++;
 }
 army.points=campaignArmyCost(army);
 return {spent,added};
}

function recruitPlayerArmyFromCollection(army,faction,budget,commander=null){
 const models=collectionModels(),profile=FACTION_BY_ID[army.factionId||army.owner],race=profile?.race||"human";
 let spent=0,added=0;
 const characterTypes=["captain","lord","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric"];
 if(commander&&!(army.roster||[]).some(u=>characterTypes.includes(u.type))){
  const character=campaignCharacterConfig(army.factionId||army.owner,commander),price=unitCost(character,faction);
  if(budget>=price){army.roster.push(character);spent+=price;}
 }
 const categories=[
  {type:race==="dwarf"?"dwarfInfantry":"swordsmen",ranged:null,match:m=>m.type===(race==="dwarf"?"dwarfInfantry":"swordsmen")&&m.weapon==="handWeapon"},
  {type:race==="dwarf"?"dwarfInfantry":"archers",ranged:race==="dwarf"?"crossbow":"bow",match:m=>m.type===(race==="dwarf"?"dwarfInfantry":"archers")&&m.weapon===(race==="dwarf"?"crossbow":"bow")}
 ];
 for(const cat of categories){
  const available=models.filter(m=>m.faction===faction&&cat.match(m)).length;
  let deployed=(army.roster||[]).filter(u=>u.type===cat.type&&(cat.ranged?u.rangedWeapon===cat.ranged:!u.rangedWeapon)).reduce((sum,u)=>sum+(u.models||0),0);
  let remaining=Math.max(0,available-deployed);
  while(remaining>0&&added<5){
   let unit=(army.roster||[]).find(u=>u.type===cat.type&&(cat.ranged?u.rangedWeapon===cat.ranged:!u.rangedWeapon)&&u.models<30);
   if(!unit){
    if(army.roster.length>=6||remaining<5)break;
    const fresh={type:cat.type,models:5,weapon:"handWeapon",meleeWeapons:["handWeapon"],rangedWeapon:cat.ranged,champion:false,upgrades:{},skills:{}};
    const price=unitCost(fresh,faction);
    if(budget-spent<price)break;
    army.roster.push(fresh);spent+=price;added+=5;remaining-=5;continue;
   }
   const before=unitCost({...unit,models:unit.models},faction),after=unitCost({...unit,models:unit.models+1},faction),price=Math.max(1,after-before);
   if(budget-spent<price)break;
   unit.models++;spent+=price;added++;remaining--;deployed++;
  }
  if(added>=5)break;
 }
 army.points=campaignArmyCost(army);
 return {spent,added};
}

const CITIES = [
{id:1,name:"Crownfall",faction:"empire",ruler:"House Valedorn",status:"Player court",terrain:"River confluence; fertile plains",description:"The old human capital sits where two navigable rivers meet. Roads from western farms and central lowlands converge here.",requiredCharacters:["edric_voss"]},
{id:2,name:"Westmere",faction:"empire",ruler:"House Merrow",status:"Player court",terrain:"Western forest edge and river crossing",description:"A prosperous river town guarding the western approach and timber trade.",requiredCharacters:[]},
{id:3,name:"Goldhaven",faction:"empire",ruler:"Prince Odran of House Kest",status:"Rival human lord",terrain:"Eastern grain belt",description:"A rich market city whose prince commands much of the eastern farmland and dislikes Crownfall's taxes.",requiredCharacters:[]},
{id:4,name:"Stonebridge",faction:"empire",ruler:"Duchess Elira Vane",status:"Rival human lord",terrain:"Southern river crossing",description:"A fortified bridge-city controlling the safest crossing into the southern continent. Its duchess bargains as an equal.",requiredCharacters:[]},
{id:5,name:"Southwatch",faction:"empire",ruler:"Lord-Marshal Caedmon",status:"Rival human lord",terrain:"Southern coast and trade road",description:"A coastal fortress and customs port, rich from sea trade and wary of central authority.",requiredCharacters:[]},
{id:6,name:"Aelthir",faction:"highElves",ruler:"The Verdant Court",status:"Player court",terrain:"Ancient forest, north-west coast",description:"An old elven city among giant trees beside a sheltered harbour. Its influence reaches the western woodland.",requiredCharacters:["aelthir_dawnwing"]},
{id:7,name:"Moonspire",faction:"highElves",ruler:"The Moonlit Princes",status:"Rival elven court",terrain:"Wooded Greyward Isles",description:"A secluded island court guarding wooded isles and a valuable sea lane.",requiredCharacters:["lethariel_starweaver"]},
{id:8,name:"Silvershade",faction:"highElves",ruler:"The Silver Admiralty",status:"Autonomous elven court",terrain:"Eastern island forest and deep harbour",description:"A wealthy harbour-city whose admirals command the eastern island passages.",requiredCharacters:[]},
{id:9,name:"Ironhold",faction:"dwarfs",ruler:"Clan Barakdur",status:"Player clan",terrain:"High mountains; iron and silver mines",description:"A deep mountain hold behind a narrow pass. Its mines and forges make it strategically valuable.",requiredCharacters:["haldric_stoneward"]},
{id:10,name:"Deepdelve",faction:"dwarfs",ruler:"Clan Kazrinn",status:"Rival thane",terrain:"Eastern mountain range; deep ore",description:"A fortified hold on the eastern range. Its thane recognises the high council but keeps his own army and treasury.",requiredCharacters:[]},
{id:11,name:"Grinhold",faction:"greenskins",ruler:"The Grinhold warboss council",status:"Greenskin stronghold",terrain:"Eastern highlands; mountain caves",description:"A sprawling orc-and-goblin stronghold built into a broken mountain ridge.",requiredCharacters:[]},
{id:12,name:"Redfang Plain",faction:"greenskins",ruler:"Redfang warband",status:"Tribal territory",terrain:"Open eastern grassland",description:"A vast grazing plain used by roaming greenskin warbands and ogre bands.",requiredCharacters:[]},
{id:13,name:"Skullcrag",faction:"greenskins",ruler:"The Crag Bosses",status:"Contested hold",terrain:"Northern mountain chain",description:"A chain of crags and tunnels that shelters goblin tribes and hard-bitten orc clans.",requiredCharacters:[]},
{id:14,name:"Ironjaw Pass",faction:"greenskins",ruler:"Ironjaw tribe",status:"Tribal territory",terrain:"Mountain pass and rocky uplands",description:"A strategic pass through the eastern mountains, frequently fought over by rival warbands.",requiredCharacters:[]},
{id:15,name:"Mudgut",faction:"greenskins",ruler:"Mudgut clans",status:"Tribal territory",terrain:"Low plains and marsh edge",description:"A muddy lowland camp where goblins, trolls and ogres trade, brawl and gather before raids.",requiredCharacters:[]},
{id:16,name:"Bonefield",faction:"greenskins",ruler:"Bonefield warband",status:"Tribal territory",terrain:"Dry grassland and old battlefield",description:"An open plain littered with old bones and scavenged weapons; a natural gathering place for large warbands.",requiredCharacters:[]},
{id:17,name:"Barrowmere",faction:"undead",ruler:"The Pale Regent",status:"Necropolis",terrain:"Western marsh and ancient barrows",description:"A lonely necropolis rising from misty wetlands, far from the other undead strongholds.",requiredCharacters:[]},
{id:18,name:"Nightfen",faction:"undead",ruler:"The Fen Court",status:"Haunted settlement",terrain:"Southern fenland",description:"A drowned settlement where the dead are said to rise from the reed beds after sunset.",requiredCharacters:[]},
{id:19,name:"Sepulchre",faction:"undead",ruler:"The Ashen Sepulchre",status:"Necropolis",terrain:"Remote eastern ruins",description:"A remote burial-city whose crypts command the surrounding desolate hills.",requiredCharacters:[]},
{id:20,name:"Blackthorn",faction:"evilHumans",ruler:"The Blackthorn ruling house",status:"Blackened principality",terrain:"Southern forest frontier",description:"A fortified human principality whose lords rule through harsh levies and private armies.",requiredCharacters:[]},
{id:21,name:"Dreadmarch",faction:"evilHumans",ruler:"The Iron Marshal",status:"Militarised border state",terrain:"Eastern marches and rough hills",description:"A fortress-state controlling a hard road through the eastern borderlands.",requiredCharacters:[]},
{id:22,name:"Varkesh",faction:"evilHumans",ruler:"The Prince of Varkesh",status:"Independent principality",terrain:"Far southern plains",description:"A distant human principality with fertile plains, mercenary companies and ambitions of conquest.",requiredCharacters:[]},
{id:23,name:"Ashenford",faction:"evilHumans",ruler:"The Ashen Council",status:"Independent principality",terrain:"Southern river crossing",description:"A fortified crossing ruled by a council of rival nobles who cooperate only when threatened.",requiredCharacters:[]}
];
const REGION_NEIGHBORS = {
 1:[2,3,4,6],2:[1,6,17],3:[1,8,10,12,21],4:[1,5,9,20,23],5:[4,8,18,20],
 6:[1,2,7,17],7:[6,8],8:[3,5,7,10],9:[4,10,13,14],10:[3,8,9,13,14,21],
 11:[13,14],12:[3,14,15,16],13:[9,10,11,14],14:[9,10,11,12,13,15,21],
 15:[12,14,16,18],16:[12,15,18,22],17:[2,6,20],18:[5,15,16,20,22,23],
 19:[21,22],20:[4,5,17,18,23],21:[3,10,14,19,22],22:[16,18,19,21,23],23:[4,18,20,22]
};

const CITY_PROFILES = {
 1:{tier:4,population:110000,prosperity:78,fortification:{style:"human-layered",material:"stone",circuits:3,gates:3,wounds:100},buildings:["royal-citadel","great-market","river-port","waterworks"]},
 2:{tier:2,population:24000,prosperity:65,fortification:{style:"human-layered",material:"stone-and-timber",circuits:1,gates:2,wounds:45},buildings:["market","mill","river-crossing"]},
 3:{tier:3,population:62000,prosperity:75,fortification:{style:"human-layered",material:"stone",circuits:2,gates:3,wounds:70},buildings:["grain-market","guildhall","granaries"]},
 4:{tier:3,population:38000,prosperity:70,fortification:{style:"human-layered",material:"stone",circuits:2,gates:2,wounds:80},buildings:["bridgeworks","tollhouse","barracks"]},
 5:{tier:3,population:31000,prosperity:72,fortification:{style:"human-layered",material:"stone",circuits:2,gates:2,wounds:75},buildings:["harbour","customs-house","shipyards"]},
 6:{tier:5,population:68000,prosperity:82,fortification:{style:"elven-star-fort",material:"enchanted-stone",circuits:1,gates:3,wounds:85},buildings:["ancient-groves","star-bastions","arcane-archive","great-harbour"]},
 7:{tier:4,population:34000,prosperity:76,fortification:{style:"elven-star-fort",material:"pale-stone",circuits:1,gates:2,wounds:70},buildings:["island-harbour","star-bastions","moon-shrine"]},
 8:{tier:3,population:46000,prosperity:80,fortification:{style:"elven-star-fort",material:"pale-stone",circuits:1,gates:3,wounds:65},buildings:["deep-harbour","admiralty","arcane-archive"]},
 9:{tier:5,population:52000,prosperity:80,fortification:{style:"dwarven-heavy",material:"deep-cut-stone",circuits:1,gates:1,wounds:180,cannonPlatforms:8},buildings:["deep-mines","great-forges","cannon-galleries","deep-roads"]},
 10:{tier:3,population:29000,prosperity:72,fortification:{style:"dwarven-heavy",material:"deep-cut-stone",circuits:1,gates:1,wounds:140,cannonPlatforms:6},buildings:["deep-mines","forges","ore-lifts"]},
 11:{tier:3,population:27000,prosperity:38,fortification:{style:"greenskin-palisade",material:"timber",circuits:1,gates:1,wounds:24},buildings:["warboss-hall","scrap-pits"]},
 12:{tier:2,population:18000,prosperity:34,fortification:{style:"greenskin-palisade",material:"timber",circuits:1,gates:1,wounds:14},buildings:["war-camp","stock-pens"]},
 13:{tier:2,population:15000,prosperity:32,fortification:{style:"greenskin-palisade",material:"timber",circuits:1,gates:1,wounds:22},buildings:["cave-holds","scrap-pits"]},
 14:{tier:2,population:12000,prosperity:35,fortification:{style:"greenskin-palisade",material:"timber",circuits:1,gates:1,wounds:12},buildings:["pass-camp","watch-platforms"]},
 15:{tier:1,population:9000,prosperity:28,fortification:{style:"greenskin-palisade",material:"timber",circuits:1,gates:1,wounds:10},buildings:["mud-huts","stock-pens"]},
 16:{tier:1,population:11000,prosperity:30,fortification:{style:"greenskin-palisade",material:"timber",circuits:1,gates:1,wounds:10},buildings:["war-camp","bone-piles"]},
 17:{tier:3,population:17000,prosperity:25,fortification:{style:"human-layered",material:"weathered-stone",circuits:1,gates:2,wounds:55},buildings:["barrow-complex","old-walls"]},
 18:{tier:2,population:9000,prosperity:18,fortification:{style:"human-layered",material:"weathered-stone-and-timber",circuits:1,gates:1,wounds:28},buildings:["sunken-shrines","causeways"]},
 19:{tier:4,population:21000,prosperity:22,fortification:{style:"human-layered",material:"ancient-stone",circuits:2,gates:2,wounds:70},buildings:["necropolis","ancient-vaults","old-walls"]},
 20:{tier:3,population:28000,prosperity:55,fortification:{style:"human-layered",material:"stone",circuits:2,gates:2,wounds:65},buildings:["fortified-manor","market","barracks"]},
 21:{tier:3,population:22000,prosperity:43,fortification:{style:"human-layered",material:"stone",circuits:2,gates:2,wounds:72},buildings:["march-fort","barracks","road-station"]},
 22:{tier:2,population:19000,prosperity:60,fortification:{style:"human-layered",material:"stone-and-timber",circuits:1,gates:2,wounds:42},buildings:["market","mercenary-yard"]},
 23:{tier:2,population:16000,prosperity:52,fortification:{style:"human-layered",material:"stone",circuits:1,gates:2,wounds:50},buildings:["river-crossing","tollhouse","market"]}
};
const CULTURE_BY_FACTION = {empire:"Human",highElves:"High Elf",dwarfs:"Dwarf",greenskins:"Greenskin",undead:"Undead",evilHumans:"Human"};
const FACTION_SPECIES = {empire:"human",highElves:"elf",dwarfs:"dwarf",greenskins:"greenskin",undead:"undead",evilHumans:"human"};
function initialSettlement(city){
 const p=CITY_PROFILES[city.id]||{tier:1,population:10000,prosperity:40,fortification:{style:"human-layered",material:"stone",circuits:1,gates:1,wounds:30},buildings:[]};
 const pop=p.population;
 return {historicalTier:p.tier,prosperity:p.prosperity,unrest:0,foodStores:8,maxFoodStores:8,siegeTurns:0,besiegedBy:null,population:{total:pop,groups:[{culture:CULTURE_BY_FACTION[city.faction]||"Local",count:pop}],displaced:0},buildings:p.buildings.map(id=>({id,condition:100})),fortification:{...p.fortification,condition:100,damage:0,upgrades:[]},infrastructureCondition:100,occupationPolicy:"local-administration",monthsUnderOccupation:0};
}
function ensureSettlementState(campaign){
 
 const oldSchemaVersion=Number(campaign.schemaVersion)||0;
 for(const region of campaign.regions||[]){
  const city=CITIES.find(c=>c.id===region.id);if(!city)continue;
  if(!region.settlement)region.settlement=initialSettlement(city);
  if(!region.ownerFaction)region.ownerFaction=region.owner==="player"?(campaign.playerPoliticalFaction||campaign.playerFaction):(region.owner||FACTION_PROFILES[region.id]?.id||city.faction);
  if((campaign.schemaVersion||0)<5&&region.ownerFaction===city.faction)region.ownerFaction=FACTION_PROFILES[region.id]?.id||region.ownerFaction;
  if((campaign.schemaVersion||0)<5&&(region.ownerFaction==="player"||region.ownerFaction===campaign.playerFaction))region.ownerFaction=campaign.playerPoliticalFaction||FACTION_PROFILES[campaign.startingRegion]?.id||FACTION_PROFILES[region.id]?.id;
  if((campaign.schemaVersion||0)<5&&FACTIONS[region.ownerFaction]&&region.ownerFaction!==city.faction)region.ownerFaction=campaign.playerPoliticalFaction||FACTION_PROFILES[campaign.startingRegion]?.id||FACTION_PROFILES[region.id]?.id;
  region.politicalFactionId=region.ownerFaction;region.owner=region.ownerFaction;
  if(!region.nativeFaction)region.nativeFaction=city.faction;
  if(!region.politicalFactionId)region.politicalFactionId=FACTION_PROFILES[region.id]?.id||FACTION_PROFILES[city.id]?.id;
  if(!region.nativeCulture)region.nativeCulture=CULTURE_BY_FACTION[city.faction]||"Local";
  if(!region.settlement.population)region.settlement.population=initialSettlement(city).population;
  if(!Array.isArray(region.settlement.buildings))region.settlement.buildings=initialSettlement(city).buildings;
  if(!region.settlement.fortification)region.settlement.fortification=initialSettlement(city).fortification;
  ensureSettlementRecruitment(region);
 }
 if(campaign.mapId!==MAP_ID||!campaign.graph?.nodes||!campaign.graph?.edges){
  campaign.graph=createMovementGraph();campaign.mapId=MAP_ID;
  for(const army of campaign.armies||[])if(!campaign.graph.nodes[army.nodeId])army.nodeId="city-"+(army.region||army.homeRegion||campaign.startingRegion);
  if(campaign.commander&&!campaign.graph.nodes[campaign.commander.nodeId])campaign.commander.nodeId="city-"+(campaign.commander.region||campaign.startingRegion);
 }
 campaign.schemaVersion=7;
 if(!campaign.factionStates){campaign.factionStates=Object.values(FACTION_PROFILES).map(profile=>{const home=CITIES.find(c=>FACTION_PROFILES[c.id].id===profile.id),generated=createCampaignArmyRoster(profile.id,profile.id===campaign.playerPoliticalFaction?1000:500);return {id:profile.id,name:profile.name,race:profile.race,rosterFaction:generated.faction,roster:generated.roster,homeRegion:home.id,alive:true,treasury:profile.id===campaign.playerPoliticalFaction?Number(campaign.treasury)||500:300,income:100,armyPoints:profile.id===campaign.playerPoliticalFaction?1000:500,turnsTaken:0,relations:{},};});campaign.factionTurnOrder=campaign.factionStates.map(f=>f.id);campaign.playerPoliticalFaction=campaign.playerPoliticalFaction||FACTION_PROFILES[campaign.startingRegion]?.id||FACTION_PROFILES[1].id;campaign.activeFaction=campaign.activeFaction||campaign.playerPoliticalFaction;}
 for(const state of campaign.factionStates){if(!Array.isArray(state.roster)||!state.roster.length){const generated=createCampaignArmyRoster(state.id,state.armyPoints||500);state.rosterFaction=generated.faction;state.roster=generated.roster;}}
 if(oldSchemaVersion<6){
  const previousArmies=campaign.armies||[];
  campaign.armies=campaign.factionStates.map(state=>{
   const previous=previousArmies.find(a=>a.owner===state.id||a.factionId===state.id||a.id===state.id+"-main");
   const isPlayer=state.id===campaign.playerPoliticalFaction;
   const generated=createCampaignArmyRoster(state.id,state.armyPoints||500,{player:isPlayer,commander:isPlayer?campaign.commander:null});
   state.rosterFaction=generated.faction;state.roster=generated.roster;state.armyPoints=generated.points;state.income=campaignCityIncome(campaign.regions.find(r=>r.id===state.homeRegion));state.upkeep=campaignArmyUpkeep({roster:generated.roster,rosterFaction:generated.faction});
   return {id:state.id+"-main",owner:state.id,factionId:state.id,rosterFaction:generated.faction,roster:generated.roster,region:previous?.region||state.homeRegion,nodeId:previous?.nodeId||"city-"+state.homeRegion,points:generated.points};
  });
  const player=campaign.factionStates.find(f=>f.id===campaign.playerPoliticalFaction);if(player)campaign.treasury=player.treasury;
 }
 if(campaign.commander){const selected=(campaign.armies||[]).find(a=>a.id===campaign.selectedArmyId)|| (campaign.armies||[]).find(a=>(a.owner||a.factionId)===campaign.playerPoliticalFaction);campaign.commander.maxMovement=campaignArmyMovementProfile(selected,campaign).points;campaign.commander.movement=Math.min(campaign.commander.maxMovement,Number(campaign.commander.movement)||campaign.commander.maxMovement);}
 for(const army of campaign.armies||[])if(army.owner===campaign.playerPoliticalFaction||army.factionId===campaign.playerPoliticalFaction)army.movement=Math.min(campaignArmyMovementProfile(army,campaign).points,Number(army.movement)||0);
 return campaign;
}
function addDisplacedPeople(settlement,culture,count){
 if(count<=0)return;
 const group=settlement.population.groups.find(g=>g.culture===culture);
 if(group)group.count+=count;else settlement.population.groups.push({culture,count});
 settlement.population.total+=count;
}
function removePopulation(settlement,group,count){
 const lost=Math.min(group.count,Math.max(0,Math.round(count)));
 group.count-=lost;settlement.population.total=Math.max(0,settlement.population.total-lost);
 return lost;
}
/**
 * Resolves political conquest without replacing the city's native architecture or culture.
 * options: {outcome:"occupy"|"sack"|"raze", fleeFraction:0..1, preserveCivilians:boolean}
 */
export function resolveGrandCampaignConquest(campaign,regionId,conquerorFaction,options={}){
 ensureSettlementState(campaign);
 const region=campaign.regions.find(r=>r.id===Number(regionId)),city=CITIES.find(c=>c.id===Number(regionId));
 if(!region||!city||(!FACTIONS[conquerorFaction]&&!FACTION_BY_ID[conquerorFaction]))throw new Error("Unknown region or conquering faction.");
 const previousOwner=region.ownerFaction||region.owner||region.nativeFaction;
 const conquerorId=FACTION_BY_ID[conquerorFaction]?.id||conquerorFaction;
 if(previousOwner===conquerorId)return {region,summary:city.name+" is already under this faction's control."};
 const settlement=region.settlement,initialPopulation=Math.max(0,Number(region.settlement?.population?.total)||0),conquerorRace=FACTION_BY_ID[conquerorId]?.race||FACTION_SPECIES[conquerorFaction];
 const isGreenskinConqueror=conquerorRace==="greenskin";
 const outcome=options.outcome||(isGreenskinConqueror?"sack":"occupy");
 const sameSpecies=conquerorRace===(FACTION_PROFILES[region.id]?.race||FACTION_SPECIES[region.nativeFaction]);
 const isGreenskinDwarfConquest=(conquerorId==="greenskins"||FACTION_BY_ID[conquerorId]?.race==="greenskin")&&region.nativeFaction==="dwarfs";
 const defaultFleeFraction=isGreenskinConqueror&&outcome==="sack"?0:(isGreenskinDwarfConquest?0.2:(sameSpecies?0.05:0.15));
 const fleeFraction=Math.max(0,Math.min(1,Number.isFinite(options.fleeFraction)?options.fleeFraction:defaultFleeFraction));
 let fled=0,killed=0;
 for(const group of settlement.population.groups){
  if(group.count<=0)continue;
  const culture=group.culture.toLowerCase();
  const isDwarf=culture.includes("dwarf");
  const greenskinDwarfMassacre=(conquerorId==="greenskins"||FACTION_BY_ID[conquerorId]?.race==="greenskin")&&isDwarf;
  const fleeing=Math.round(group.count*fleeFraction);
  if(fleeing){removePopulation(settlement,group,fleeing);settlement.population.displaced+=fleeing;fled+=fleeing;}
  if(greenskinDwarfMassacre){
   const remaining=group.count;killed+=removePopulation(settlement,group,remaining);
  }else if(outcome==="massacre"){
   killed+=removePopulation(settlement,group,group.count);
  }else if(outcome==="sack"){
   const casualties=isGreenskinConqueror?group.count:Math.round(group.count*0.12);
   killed+=removePopulation(settlement,group,casualties);
  }
 }
 const preserve=options.preserveCivilians??(outcome==="occupy"&&!isGreenskinDwarfConquest);
 settlement.prosperity=Math.max(0,settlement.prosperity-(outcome==="raze"?65:outcome==="sack"?35:preserve?5:18));
 settlement.unrest=Math.min(100,settlement.unrest+(preserve?10:outcome==="massacre"?65:40));
 const buildingDamage=outcome==="raze"?100:outcome==="sack"?45:preserve?5:20;
 for(const building of settlement.buildings)building.condition=Math.max(0,building.condition-buildingDamage);
 settlement.fortification.damage=Math.min(100,settlement.fortification.damage+(outcome==="raze"?90:outcome==="sack"?40:outcome==="massacre"?25:10));
 settlement.fortification.condition=Math.max(0,100-settlement.fortification.damage);
 settlement.infrastructureCondition=Math.max(0,settlement.infrastructureCondition-(outcome==="raze"?90:outcome==="sack"?40:preserve?5:20));
 if(outcome==="raze"){settlement.historicalTier=Math.max(1,settlement.historicalTier);settlement.ruins=true;}
 region.ownerFaction=conquerorId;region.politicalFactionId=conquerorId;region.owner=conquerorId;region.occupationPolicy=preserve?"local-administration":"military-occupation";settlement.occupationPolicy=region.occupationPolicy;settlement.monthsUnderOccupation=0;
 let plunder=0;
 if(isGreenskinConqueror&&outcome==="sack"){
  const tier=Math.max(1,Number(settlement.historicalTier)||1),prosperity=Math.max(0,Number(settlement.prosperity)||0);
  const survivingBuildings=(settlement.buildings||[]).reduce((sum,b)=>sum+Math.max(0,Number(b.condition)||0)/100,0);
  plunder=Math.round(tier*100+prosperity*2+Math.log10(Math.max(1,initialPopulation))*80+survivingBuildings*25);
  const treasuryState=campaign.factionStates?.find(f=>f.id===conquerorId);
  if(treasuryState)treasuryState.treasury=Math.max(0,Number(treasuryState.treasury)||0)+plunder;
  if(conquerorId===campaign.playerPoliticalFaction)campaign.treasury=Math.max(0,Number(campaign.treasury)||0)+plunder;
 }
 if(isGreenskinConqueror){if(settlement.population.total<=0)settlement.recruitmentPools={};const army=(campaign.armies||[]).find(a=>(a.owner||a.factionId)===conquerorId&&a.roster?.length);if(army)awardGreenskinMomentum(campaign,army,1);}
 const factionName=FACTION_BY_ID[conquerorId]?.name||FACTIONS[conquerorFaction]?.name||conquerorId;
 const special=(conquerorId==="greenskins"||FACTION_BY_ID[conquerorId]?.race==="greenskin")&&region.nativeFaction==="dwarfs"?" Orcs slaughtered the dwarves who could not escape; surviving escapees are displaced.":"";
 const summary=city.name+" falls to "+factionName+". "+fled.toLocaleString()+" inhabitants flee; "+killed.toLocaleString()+" are killed."+(plunder?" Greenskin plunder: "+plunder.toLocaleString()+" gold; the settlement has no usable population.":"")+special+" Its "+settlement.fortification.style+" fortifications remain in place, damaged but not replaced.";
 campaign.lastEvent=summary;
 return {region,summary,fled,killed,previousOwner,conquerorFaction,plunder,outcome};
}

const MAP_ID="shattered-realms-v5";
function createInitialCampaignState(faction,city,commander){
 const playerPoliticalFaction=FACTION_PROFILES[city.id].id;
 const regions=CITIES.map(r=>{const settlement=initialSettlement(r);return {id:r.id,name:r.name,faction:r.faction,politicalFactionId:FACTION_PROFILES[r.id].id,ownerFaction:FACTION_PROFILES[r.id].id,owner:FACTION_PROFILES[r.id].id,nativeFaction:r.faction,nativeCulture:CULTURE_BY_FACTION[r.faction]||"Local",terrain:r.terrain,neighbors:[...(REGION_NEIGHBORS[r.id]||[])],ruler:r.ruler,status:r.status,settlement};});
 const factionStates=Object.values(FACTION_PROFILES).map(profile=>{
  const home=CITIES.find(x=>FACTION_PROFILES[x.id].id===profile.id),isPlayer=profile.id===playerPoliticalFaction;
  const army=createCampaignArmyRoster(profile.id,isPlayer?1000:500,{player:isPlayer,commander:isPlayer?commander:null});
  return {id:profile.id,name:profile.name,race:profile.race,rosterFaction:army.faction,roster:army.roster,homeRegion:home.id,alive:true,treasury:isPlayer?500:300,income:campaignCityIncome(regions.find(r=>r.id===home.id)),upkeep:Math.ceil(army.points*.04),armyPoints:army.points,turnsTaken:0,relations:{},};
 });
 const diplomacy={};for(const a of factionStates){diplomacy[a.id]={};for(const b of factionStates){if(a.id===b.id)continue;diplomacy[a.id][b.id]=baseFactionRelation(a.id,b.id);}}
 const armies=factionStates.map(state=>({id:state.id+"-main",owner:state.id,factionId:state.id,rosterFaction:state.rosterFaction,roster:state.roster.map(u=>({...u,meleeWeapons:[...(u.meleeWeapons||[])],upgrades:{...(u.upgrades||{})},skills:{...(u.skills||{})}})),region:state.homeRegion,nodeId:"city-"+state.homeRegion,points:state.armyPoints,boredom:-4,momentum:0,foughtThisTurn:false,supplies:3,maxSupplies:3,supplyRaidedUntilTurn:0}));
 const playerState=factionStates.find(f=>f.id===playerPoliticalFaction);
 return {schemaVersion:8,mapId:MAP_ID,turn:1,phase:"player",playerFaction:faction,playerPoliticalFaction,activeFaction:playerPoliticalFaction,factionTurnOrder:factionStates.map(f=>f.id),factionStates,diplomacy,activeAlliances:[],armyFaction:FACTIONS[faction].armyFaction,startingRegion:city.id,treasury:playerState.treasury,regions,graph:createMovementGraph(),commander:{...commander,nodeId:"city-"+city.id,region:city.id,movement:(FACTION_BY_ID[selectedPoliticalFaction]?.race==="elf"?4:3),maxMovement:(FACTION_BY_ID[selectedPoliticalFaction]?.race==="elf"?4:3)},armies,lastEvent:commander.name+" begins the campaign at "+city.name+"."};
}
let selectedFaction="empire",selectedPoliticalFaction="valedorn",selectedCity=1,activeCampaign=null;
const byId=id=>document.getElementById(id);
 const campaignMapNav=new WeakMap();
 function installCampaignMapNavigation(host,map){
  if(!host||!map||campaignMapNav.has(host))return;
  const state={scale:Math.max(host.clientWidth,900)/1300,min:Math.max(host.clientWidth,900)/1300,max:Math.max(host.clientWidth,900)/1300*3,startDistance:0,startScale:1,startX:0,startY:0,anchorX:0,anchorY:0};
  const sizeMap=scale=>{state.scale=Math.max(state.min,Math.min(state.max,scale));map.style.width=(1300*state.scale)+"px";map.style.height=(760*state.scale)+"px";};
  sizeMap(state.scale);
  const distance=(a,b)=>Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
  host.addEventListener("touchstart",e=>{
   if(e.touches.length!==2)return;
   const a=e.touches[0],b=e.touches[1],rect=host.getBoundingClientRect();
   state.startDistance=distance(a,b);state.startScale=state.scale;
   state.anchorX=(a.clientX+b.clientX)/2-rect.left+host.scrollLeft;
   state.anchorY=(a.clientY+b.clientY)/2-rect.top+host.scrollTop;
  },{passive:true});
  host.addEventListener("touchmove",e=>{
   if(e.touches.length!==2||!state.startDistance)return;
   e.preventDefault();
   const a=e.touches[0],b=e.touches[1],rect=host.getBoundingClientRect(),ratio=distance(a,b)/state.startDistance;
   const oldScale=state.scale,midX=(a.clientX+b.clientX)/2-rect.left,midY=(a.clientY+b.clientY)/2-rect.top;
   sizeMap(state.startScale*ratio);
   const factor=state.scale/oldScale;
   host.scrollLeft=Math.max(0,(state.anchorX*factor)-midX);
   host.scrollTop=Math.max(0,(state.anchorY*factor)-midY);
  },{passive:false});
  const reset=()=>{state.startDistance=0;};
  host.addEventListener("touchend",reset,{passive:true});host.addEventListener("touchcancel",reset,{passive:true});
  host.addEventListener("wheel",e=>{
   if(!e.ctrlKey&&!e.metaKey)return;
   e.preventDefault();
   const rect=host.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,old=state.scale;
   sizeMap(old*Math.exp(-e.deltaY*.004));
   const factor=state.scale/old;host.scrollLeft=(host.scrollLeft+x)*factor-x;host.scrollTop=(host.scrollTop+y)*factor-y;
  },{passive:false});
  campaignMapNav.set(host,state);
 }
const CITY_POSITIONS={1:[205,214],2:[142,286],3:[335,294],4:[473,428],5:[596,491],6:[160,142],7:[541,182],8:[793,207],9:[515,352],10:[653,329],11:[1000,240],12:[1118,326],13:[1157,210],14:[1204,365],15:[1044,405],16:[1170,430],17:[159,430],18:[737,642],19:[1207,515],20:[548,602],21:[944,462],22:[846,680],23:[629,642]};
const LEGENDARY={empire:[{id:"edric_voss",type:"legendaryLord",name:"Lord-Marshal Edric Voss"}],highElves:[{id:"aelthir_dawnwing",type:"pegasusChampion",name:"Aelthir, the Dawnwing"},{id:"lethariel_starweaver",type:"shadowElf",name:"Lethariel Starweaver"}],dwarfs:[{id:"haldric_stoneward",type:"dwarfKingHaldric",name:"King Haldric Stoneward"}]};
function collectionBypassEnabled(){try{return getCollectionSnapshot()?.bypass===true;}catch{return false;}}
function ownedModels(){try{return (getCollectionSnapshot()?.models||[]).filter(m=>m&&typeof m==="object");}catch{return [];}}
function modelHas(m,c){const name=String(m.name||"").toLowerCase(),parts=Array.isArray(m.components)?m.components:[];return m.type===c.type||name.includes(c.name.toLowerCase())||parts.includes(c.id+"_body");}
function ownedCharacterIds(){const s=new Set();for(const m of ownedModels())for(const cs of Object.values(LEGENDARY))for(const c of cs)if(modelHas(m,c))s.add(c.id);return s;}
function politicalFactionHome(id){return CITIES.find(c=>FACTION_PROFILES[c.id]?.id===id)||null;}
function namedCharacterById(id){for(const list of Object.values(LEGENDARY))for(const character of list)if(character.id===id)return character;return null;}
function genericCommanderTypes(id){
 const roster=rosterFactionForPoliticalFaction(id);
 return roster==="dwarfs"?{faction:"dwarfs",types:["dwarfCaptain","dwarfLord"]}:roster==="highElves"?{faction:"highElves",types:["captain","lord"]}:{faction:"empire",types:["captain","lord"]};
}
function commanderForPoliticalFaction(id){
 const profile=FACTION_BY_ID[id],city=politicalFactionHome(id);
 if(!profile||!city)return null;
 if(collectionBypassEnabled())return {id:"dev-commander-"+id,name:"Developer Commander",kind:"generic",modelId:null};
 const models=ownedModels(),owned=ownedCharacterIds(),required=(city.requiredCharacters||[]).map(namedCharacterById).filter(Boolean);
 if(required.length){
  const character=required.find(x=>owned.has(x.id));
  if(!character)return null;
  const model=models.find(x=>modelHas(x,character));
  return {id:character.id,name:character.name,kind:"legendary",modelId:model?.id||null};
 }
 const spec=genericCommanderTypes(id),model=models.find(x=>x.faction===spec.faction&&spec.types.includes(x.type));
 return model?{id:"generic-"+model.id,name:model.name||"Generic Hero",kind:"generic",modelId:model.id}:null;
}
function gateTextForPoliticalFaction(id){
 const city=politicalFactionHome(id),required=(city?.requiredCharacters||[]).map(namedCharacterById).filter(Boolean);
 if(required.length)return required.map(x=>x.name).join(" or ");
 const spec=genericCommanderTypes(id);
 return spec.faction==="dwarfs"?"a generic Dwarf thane or lord in your collection":spec.faction==="highElves"?"a generic High Elf hero or lord in your collection":"a generic human hero or lord in your collection";
}
function ensureValidCity(){const home=politicalFactionHome(selectedPoliticalFaction);if(home){selectedCity=home.id;selectedFaction=home.faction;}}
function paintFactionBanners(map,campaign=null){
 if(!map)return;
 map.querySelectorAll(".political-faction-banner").forEach(n=>n.remove());
 for(const marker of map.querySelectorAll(".grand-city")){
  const id=Number(marker.dataset.city),profile=FACTION_PROFILES[id];if(!profile)continue;
  const region=campaign?.regions?.find(r=>r.id===id),politicalId=region?.politicalFactionId||profile.id,owner=FACTION_BY_ID[politicalId]||profile;
  const g=svgEl("g",{class:"political-faction-banner","pointer-events":"none",transform:"translate(0 -25)"});
  // Tiny pennant: distinct faction colours and an abstract, text-free heraldic mark.
  g.append(svgEl("path",{d:"M-8 -8 L8 -8 L8 5 L0 1 L-8 5 Z",fill:owner.colours.main,stroke:owner.colours.accent,"stroke-width":1.3,"stroke-linejoin":"round"}));
  const emblem=owner.emblem;
  if(["star","hawk","swan","sun"].includes(emblem)){
   g.append(svgEl("path",{d:"M0 -6 L1.5 -2 L5 -2 L2 0 L3 3 L0 1 L-3 3 L-2 0 L-5 -2 L-1.5 -2 Z",fill:owner.colours.accent,stroke:"none"}));
  }else if(["hammer","anvil","tower","fortress","gate","bridge","spear"].includes(emblem)){
   g.append(svgEl("path",{d:"M-4 -4 L4 -4 L4 -2 L1 -2 L1 3 L-1 3 L-1 -2 L-4 -2 Z",fill:owner.colours.accent}));
  }else if(["crescent","reed","thorn"].includes(emblem)){
   g.append(svgEl("path",{d:"M2 -5 A5 5 0 1 0 2 3 A3.5 3.5 0 1 1 2 -5 Z",fill:owner.colours.accent}));
  }else{
   g.append(svgEl("path",{d:"M-4 -4 L-1 -1 L0 -4 L1 -1 L4 -4 L3 2 L0 4 L-3 2 Z",fill:owner.colours.accent}));
  }
  marker.append(g);
 }
}
function renderCity(){
 const city=CITIES.find(c=>c.id===selectedCity);if(!city)return;
 const commander=commanderForPoliticalFaction(selectedPoliticalFaction),bypass=collectionBypassEnabled(),political=FACTION_BY_ID[selectedPoliticalFaction];
 byId("grand-city-detail").innerHTML='<div class="grand-city-heading"><span class="grand-city-dot '+city.faction+'"></span><div><h3>'+city.name+'</h3><small>'+(political?.name||FACTIONS[city.faction].name)+'</small></div></div><p>'+city.description+'</p><div class="grand-stat"><b>Ruler</b><span>'+city.ruler+'</span></div><div class="grand-stat"><b>Location</b><span>'+city.terrain+'</span></div>'+(commander?'<p class="subtle">Starting character: '+commander.name+'</p>':'<p class="subtle">Locked: collect '+gateTextForPoliticalFaction(selectedPoliticalFaction)+' to start this campaign.</p>')+(bypass?'<p class="subtle">Developer bypass active — character ownership is ignored.</p>':'');
 byId("grand-world-map").querySelectorAll(".grand-city").forEach(m=>{const id=Number(m.dataset.city);m.classList.toggle("selected",id===city.id);m.classList.toggle("other-faction",id!==city.id);m.classList.toggle("character-locked",!collectionBypassEnabled()&&!commanderForPoliticalFaction(FACTION_PROFILES[id]?.id));m.setAttribute("aria-pressed",String(id===city.id));});
 byId("grand-campaign-begin").disabled=!(bypass||!!commander);
}
function saveSelection(){try{const f=FACTIONS[selectedFaction],c=CITIES.find(x=>x.id===selectedCity);localStorage.setItem("warGameGrandCampaignStart",JSON.stringify({schemaVersion:5,mapId:MAP_ID,faction:selectedFaction,politicalFactionId:selectedPoliticalFaction,selectedCity,armyFaction:f.armyFaction,startingRegion:c?.name}));}catch{}}
function renderFaction(){
 const profile=FACTION_BY_ID[selectedPoliticalFaction]||FACTION_PROFILES[1];
 const homeId=Number(Object.keys(FACTION_PROFILES).find(id=>FACTION_PROFILES[id].id===profile.id));
 const home=CITIES.find(c=>c.id===homeId);
 if(home)selectedFaction=home.faction;
 selectedCity=homeId||selectedCity;
 const commander=commanderForPoliticalFaction(selectedPoliticalFaction);
 const choices=byId("grand-faction-choices");
 choices.innerHTML=Object.values(FACTION_PROFILES).map(p=>{
  const id=Number(Object.keys(FACTION_PROFILES).find(k=>FACTION_PROFILES[k].id===p.id));
  const city=CITIES.find(c=>c.id===id);
  const race=RACES[p.race]?.name||p.race;
  return '<button class="grand-faction-choice'+(p.id===selectedPoliticalFaction?' active':'')+'" data-political-faction="'+p.id+'" style="--faction-colour:'+p.colours.main+'"><b>'+p.name+'</b><small>'+race+' · '+(city?.name||'Unknown holding')+' · '+p.emblem+'</small></button>';
 }).join("");
 choices.querySelectorAll("[data-political-faction]").forEach(button=>button.addEventListener("click",()=>{
  selectedPoliticalFaction=button.dataset.politicalFaction;
  const id=Number(Object.keys(FACTION_PROFILES).find(k=>FACTION_PROFILES[k].id===selectedPoliticalFaction));
  selectedCity=id;selectedFaction=CITIES.find(c=>c.id===id)?.faction||"empire";
  saveSelection();renderFaction();
 }));
 byId("grand-faction-detail").innerHTML='<h3>'+profile.name+'</h3><p>'+(home?.description||"An independent political faction in the Shattered Realms.")+'</p><div class="grand-stat"><b>Race</b><span>'+(RACES[profile.race]?.name||profile.race)+'</span></div><div class="grand-stat"><b>Capital</b><span>'+(home?.name||"Unknown")+'</span></div><div class="grand-stat"><b>Commander</b><span>'+(commander?commander.name:"Locked")+'</span></div><p class="subtle">'+(collectionBypassEnabled()?"Developer bypass active — model and character ownership requirements are ignored.":commander?(commander.kind==="legendary"?"Legendary commander unlocked.":"Generic hero unlocked."):"Collect "+gateTextForPoliticalFaction(selectedPoliticalFaction)+" to unlock this faction.")+'</p>';
 byId("grand-campaign-begin").textContent="Start campaign";renderCity();
}
function createMovementGraph(){
 const nodes={},edges={},routes=[];
 const add=n=>{nodes[n.id]=n;edges[n.id]=edges[n.id]||[];};
 const link=(a,b,cost=1)=>{if(!edges[a]||!edges[b]||a===b)return;if(!edges[a].some(e=>e.to===b))edges[a].push({to:b,cost});if(!edges[b].some(e=>e.to===a))edges[b].push({to:a,cost});};
 const route=(a,b,kind="land",regionA=null,regionB=null)=>routes.push({a,b,kind,regionA,regionB,marks:[],cuts:[0,1]});
 const positions=CITY_POSITIONS;
 for(const c of CITIES){const [x,y]=positions[c.id];add({id:"city-"+c.id,region:c.id,type:"city",label:c.name,x,y});}
 for(const c of CITIES){
  const [x,y]=positions[c.id],ns=REGION_NEIGHBORS[c.id]||[];
  const avg=ns.reduce((p,id)=>({x:p.x+positions[id][0]/ns.length,y:p.y+positions[id][1]/ns.length}),{x:0,y:0});
  const jx=Math.max(30,Math.min(1270,x+(avg.x-x)*.12)),jy=Math.max(30,Math.min(720,y+(avg.y-y)*.12));
  add({id:"crossroads-"+c.id,region:c.id,type:"crossroads",label:c.name+" crossroads",x:jx,y:jy});
  route("city-"+c.id,"crossroads-"+c.id,"land",c.id,c.id);
 }
 const ports=[
  {id:"port-5",region:5,type:"port",label:"Southwatch harbour",x:625,y:515,city:5},
  {id:"port-6",region:6,type:"port",label:"Aelthir harbour",x:135,y:126,city:6},
  {id:"port-7",region:7,type:"port",label:"Moonspire harbour",x:561,y:163,city:7},
  {id:"port-8",region:8,type:"port",label:"Silvershade harbour",x:817,y:190,city:8}
 ];
 for(const p of ports){add(p);route("city-"+p.city,p.id,"land",p.city,p.city);}
 const seen=new Set(),seaLinks=new Set(["5-8","6-7","7-8"]);
 for(const c of CITIES)for(const other of REGION_NEIGHBORS[c.id]||[]){
  const key=[c.id,other].sort((a,b)=>a-b).join("-");
  if(seen.has(key))continue;seen.add(key);
  if(seaLinks.has(key)){
   const pA=ports.find(p=>p.city===c.id)||ports.find(p=>p.city===other);
   const pB=ports.find(p=>p.city===other&&p!==pA)||ports.find(p=>p.city===c.id&&p!==pA);
   if(pA&&pB)route(pA.id,pB.id,"sea",c.id,other);
   continue;
  }
  route("crossroads-"+c.id,"crossroads-"+other,"land",c.id,other);
 }
 // Put a visible point of interest on routes through every named terrain feature.
 const featurePattern=[
  {re:/forest|woodland|grove|timber/i,type:"forest",label:"Forest trail"},
  {re:/mountain|highlands|crag|ridge|pass|ore/i,type:"mountain",label:"Mountain pass"},
  {re:/river|crossing|ford/i,type:"river",label:"River crossing"},
  {re:/marsh|fen|wetland|swamp/i,type:"marsh",label:"Marsh track"},
  {re:/coast|harbour|port|island|shoal/i,type:"coast",label:"Coastal track"},
  {re:/plain|grassland|farmland|plains/i,type:"plain",label:"Open-country track"}
 ];
 for(const c of CITIES){
  const terrain=String(c.terrain||"");
  const wanted=featurePattern.filter(f=>f.re.test(terrain));
  const neighbors=REGION_NEIGHBORS[c.id]||[];
  const target=neighbors.map(id=>routes.find(r=>r.kind==="land"&&r.regionA===c.id&&r.regionB===id||r.kind==="land"&&r.regionA===id&&r.regionB===c.id)).find(Boolean);
  if(target){
   wanted.slice(0,3).forEach((f,i)=>{
    const t=target.regionA===c.id?(0.24+i*0.12):(0.76-i*0.12);
    target.marks.push({t,region:c.id,type:f.type,label:c.name+" "+f.label.toLowerCase()});
   });
  }
 }
 // Give every visible geographic feature its own clickable point of interest.
 // These correspond to the forest groves, mountain chains and river courses drawn
 // on the map background; their access paths join the nearest road junction.
 const mapFeatures=[
  {id:"forest-poi-west-1",region:2,type:"forest",label:"Oldreach western forest",x:130,y:215},
  {id:"forest-poi-west-2",region:2,type:"forest",label:"Westmere timber grove",x:170,y:245},
  {id:"forest-poi-central",region:3,type:"forest",label:"Goldhaven woodland",x:350,y:240},
  {id:"forest-poi-north-east",region:10,type:"forest",label:"Deepdelve forest edge",x:730,y:350},
  {id:"forest-poi-east",region:21,type:"forest",label:"Dreadmarch woodland",x:775,y:410},
  {id:"forest-poi-south",region:20,type:"forest",label:"Southlands forest",x:555,y:480},
  {id:"mountain-poi-north",region:13,type:"mountain",label:"Northern mountain chain",x:275,y:115},
  {id:"mountain-poi-west",region:9,type:"mountain",label:"Western high peaks",x:375,y:155},
  {id:"mountain-poi-central",region:9,type:"mountain",label:"Central mountain pass",x:510,y:375},
  {id:"mountain-poi-east",region:10,type:"mountain",label:"Eastern crags",x:645,y:300},
  {id:"river-poi-west",region:1,type:"river",label:"Oldreach upper river",x:195,y:170},
  {id:"river-poi-north",region:3,type:"river",label:"Goldhaven river bend",x:315,y:190},
  {id:"river-poi-south",region:4,type:"river",label:"Southlands river ford",x:530,y:390},
  {id:"river-poi-east",region:10,type:"river",label:"Eastern river crossing",x:690,y:365}
 ];
 for(const p of mapFeatures){
  add(p);
  const junctions=Object.values(nodes).filter(n=>n.type==="crossroads"||n.type==="port");
  const nearest=junctions.reduce((best,n)=>!best||Math.hypot(n.x-p.x,n.y-p.y)<Math.hypot(best.x-p.x,best.y-p.y)?n:best,null);
  if(nearest)route(p.id,nearest.id,"land",p.region,nearest.region);
 }
 // Find every crossing between routes. Both routes receive the same crossroads,

 // so no road is visually allowed to pass through another road without a POI.
 const intersection=(p,p2,q,q2)=>{
  const rx=p2.x-p.x,ry=p2.y-p.y,sx=q2.x-q.x,sy=q2.y-q.y,den=rx*sy-ry*sx;
  if(Math.abs(den)<1e-7)return null;
  const qpx=q.x-p.x,qpy=q.y-p.y,t=(qpx*sy-qpy*sx)/den,u=(qpx*ry-qpy*rx)/den;
  if(t<=0.001||t>=0.999||u<=0.001||u>=0.999)return null;
  return {t,u,x:p.x+t*rx,y:p.y+t*ry};
 };
 for(let i=0;i<routes.length;i++){
  const a=routes[i];
  const p=nodes[a.a],p2=nodes[a.b];
  for(let j=i+1;j<routes.length;j++){
   const b=routes[j];
   const q=nodes[b.a],q2=nodes[b.b],hit=intersection(p,p2,q,q2);if(!hit)continue;
   const sharedId="crossing-"+Math.round(hit.x)+"-"+Math.round(hit.y);
   if(!nodes[sharedId])add({id:sharedId,region:a.regionA||b.regionA,type:"crossroads",label:"Road crossroads",x:hit.x,y:hit.y});
   a.cuts.push(hit.t);b.cuts.push(hit.u);
   a.marks.push({t:hit.t,nodeId:sharedId});b.marks.push({t:hit.u,nodeId:sharedId});
  }
 }
 for(const r of routes){
  const a=nodes[r.a],b=nodes[r.b],distance=Math.hypot(b.x-a.x,b.y-a.y);
  const cuts=[...r.cuts];
  for(let d=48;d<distance;d+=48)cuts.push(d/distance);
  for(const mark of r.marks)cuts.push(mark.t);
  const sorted=[...new Set(cuts.map(t=>Math.max(0,Math.min(1,Number(t.toFixed(5))))))].sort((x,y)=>x-y);
  const ids=[];
  for(let i=0;i<sorted.length;i++){
   const t=sorted[i];
   let id=i===0?r.a:i===sorted.length-1?r.b:null;
   const marks=r.marks.filter(m=>Math.abs(m.t-t)<0.0001);
   const intersectionMark=marks.find(m=>m.nodeId);
   if(intersectionMark)id=intersectionMark.nodeId;
   const featureMark=marks.find(m=>!m.nodeId);
   if(!id){
    id=featureMark?"feature-"+r.regionA+"-"+r.regionB+"-"+r.kind+"-"+i:"waypoint-"+r.a+"-"+r.b+"-"+i;
    const region=featureMark?.region??r.regionA??r.regionB;
    const type=featureMark?.type||(r.kind==="sea"?"seaRoute":r.regionA!==r.regionB?"border":"road");
    const label=featureMark?.label||(r.kind==="sea"?"Sea lane waypoint":r.regionA!==r.regionB?"Road waypoint":"Local road");
    add({id,region,type,label,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
   }
   ids.push(id);
  }
  for(let i=1;i<ids.length;i++)link(ids[i-1],ids[i],1);
 }
 // Coastal travel can only enter or leave the sea at a named harbour.
 // Existing save files are migrated to this graph while city IDs remain stable.
 return {nodes,edges};
}
function svgEl(name,attrs={}){const el=document.createElementNS("http://www.w3.org/2000/svg",name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el;}
function saveCampaign(){try{localStorage.setItem("warGameGrandCampaignStateV1",JSON.stringify(activeCampaign));}catch{}}
function settleMonthlyPopulation(campaign){
 for(const region of campaign.regions||[]){
  const s=region.settlement;if(!s||!s.population)continue;
  const atWar=campaign.warRegions?.includes(region.id)||campaign.regions.some(r=>r.id!==region.id&&r.ownerFaction!==region.ownerFaction&&region.neighbors?.includes(r.id)&&campaign.activeWars?.includes([region.ownerFaction,r.ownerFaction].sort().join(":")));
  const occupationPenalty=region.ownerFaction!==FACTION_PROFILES[region.id]?.id?0.001:0;
  let rate=s.prosperity>=70&&s.unrest<20&&!atWar?0.002:(!atWar&&s.prosperity>=40&&s.unrest<40?0.001:atWar?-0.002:-0.0005);
  if(occupationPenalty)rate-=occupationPenalty;
  if(rate>0){
   const race=FACTION_BY_ID[politicalOwner(region)]?.race||campaign.factionStates?.find(f=>f.id===politicalOwner(region))?.race||"human";
   const growthMultiplier=race==="elf"?0.25:race==="dwarf"?0.5:race==="greenskin"?2:1;
   rate*=growthMultiplier;
  }
  const totalDelta=Math.round(s.population.total*rate);
  if(totalDelta>0){s.population.total+=totalDelta;const largest=[...s.population.groups].sort((a,b)=>b.count-a.count)[0];if(largest)largest.count+=totalDelta;}
  else if(totalDelta<0){let remaining=-totalDelta;for(const group of [...s.population.groups].sort((a,b)=>b.count-a.count)){const loss=Math.min(remaining,group.count);group.count-=loss;remaining-=loss;if(!remaining)break;}s.population.total=Math.max(0,s.population.total+totalDelta);}
  if(region.ownerFaction!==FACTION_PROFILES[region.id]?.id){
   s.monthsUnderOccupation=(s.monthsUnderOccupation||0)+1;
   if(region.ownerFaction==="greenskins"&&region.nativeFaction==="dwarfs"){s.infrastructureCondition=Math.max(0,s.infrastructureCondition-0.35);s.fortification.condition=Math.max(0,s.fortification.condition-0.2);}
  }
 }
}
function nodeCost(n){return n.type==="river"?2:1;}
function supplyOwnerAtNode(campaign,nodeId){const n=campaign.graph?.nodes?.[nodeId];if(!n)return null;const region=campaign.regions.find(r=>r.id===n.region);return region?politicalOwner(region):null;}
function campaignSupplyPath(campaign,army){
 if(!army||!campaign.graph?.nodes||!campaign.graph?.edges)return [];
 const owner=army.owner||army.factionId,start=army.nodeId;if(!start||!campaign.graph.nodes[start])return [];
 const friendly=id=>supplyOwnerAtNode(campaign,id)===owner;
 const queue=[],previous=new Map();for(const r of campaign.regions||[]){if(politicalOwner(r)===owner){const id="city-"+r.id;if(campaign.graph.nodes[id]){queue.push(id);previous.set(id,null);}}}
 while(queue.length){const at=queue.shift();if(at===start){const path=[];let cur=at;while(cur!==null){path.push(cur);cur=previous.get(cur);}path.reverse();return path.length-1<=campaignSupplyRange(army,campaign)?path:[];}
  for(const e of campaign.graph.edges[at]||[]){if(previous.has(e.to))continue;if(!friendly(e.to))continue;previous.set(e.to,at);queue.push(e.to);}
 }
 return [];
}
function ensureLogisticsState(campaign){
 for(const army of campaign.armies||[]){const profile=campaignArmyMovementProfile(army,campaign),max=profile.race==="undead"?3:profile.race==="dwarf"?2:(profile.allCavalry||profile.allFlying)?4:3;if(!Number.isFinite(army.maxSupplies)||army.maxSupplies===3&&profile.race==="dwarf"||army.maxSupplies===3&&(profile.allCavalry||profile.allFlying))army.maxSupplies=max;if(!Number.isFinite(army.supplies))army.supplies=army.maxSupplies;if(army.supplies>army.maxSupplies)army.supplies=army.maxSupplies;if(!Number.isFinite(army.supplyRaidedUntilTurn))army.supplyRaidedUntilTurn=0;}
 for(const region of campaign.regions||[]){if(!region.settlement)continue;const st=region.settlement;if(!Number.isFinite(st.foodStores))st.foodStores=8;if(!Number.isFinite(st.maxFoodStores))st.maxFoodStores=8;if(!Number.isFinite(st.siegeTurns))st.siegeTurns=0;}
}
function processCampaignLogistics(campaign){
 ensureLogisticsState(campaign);
 const armies=campaign.armies||[],regions=campaign.regions||[],events=[];
 for(const army of armies){
  if(!army.roster?.length)continue;
  const owner=army.owner||army.factionId,race=FACTION_BY_ID[owner]?.race||campaign.factionStates?.find(f=>f.id===owner)?.race||"human";
  if(race==="undead"){army.supplyStatus="no provisions required";army.supplies=army.maxSupplies||3;continue;}
  const path=campaignSupplyPath(campaign,army),connected=path.length>0,raided=(army.supplyRaidedUntilTurn||0)>=campaign.turn;
  if(connected&&!raided)army.supplies=army.maxSupplies||3;
  else army.supplies=Math.max(0,(army.supplies||0)-1);
  army.supplyStatus=connected&&!raided?"supplied":raided?"raided":army.supplies>0?"low":"starving";
  if(army.supplies===0){
   const before=army.roster.reduce((n,u)=>n+(u.models||0),0);
   for(const unit of army.roster){if(unit.models>1)unit.models=Math.max(1,Math.floor(unit.models*.9));}
   army.roster=army.roster.filter(u=>u.models>0);army.points=campaignArmyCost(army);
   const lost=before-army.roster.reduce((n,u)=>n+(u.models||0),0);
   if(lost>0)events.push((army.name||army.owner+" army")+" loses "+lost+" models to starvation.");
  }
 }
 for(const region of regions){
  const st=region.settlement;if(!st)continue;
  const owner=politicalOwner(region),besieger=armies.find(a=>a.roster?.length&&a.nodeId==="city-"+region.id&&(a.owner||a.factionId)!==owner);
  const relief=armies.some(a=>a.roster?.length&&a.nodeId==="city-"+region.id&&(a.owner||a.factionId)===owner);
  if(besieger&&!relief){
   st.siegeTurns=(st.siegeTurns||0)+1;st.foodStores=Math.max(0,(st.foodStores||0)-1);st.besiegedBy=besieger.owner||besieger.factionId;
   if(st.foodStores===0&&st.siegeTurns%2===0){st.prosperity=Math.max(0,(st.prosperity||0)-2);st.unrest=Math.min(100,(st.unrest||0)+5);st.fortification.condition=Math.max(0,(st.fortification?.condition||0)-1);events.push(region.name+" is starving under siege; unrest rises and fortifications deteriorate.");}
  }else{st.siegeTurns=0;st.besiegedBy=null;if(!besieger)st.foodStores=Math.min(st.maxFoodStores||8,(st.foodStores||0)+1);}
 }
 for(const state of campaign.factionStates||[]){const army=armies.find(a=>(a.owner||a.factionId)===state.id);if(army){state.roster=army.roster;state.armyPoints=army.points;}}
 return events;
}
function raidEnemySupplyLine(){
 const army=selectedPlayerArmy();if(!army||!activeCampaign)return;
 const graph=activeCampaign.graph,at=army.nodeId,near=new Set([at,...(graph.edges[at]||[]).map(e=>e.to)]);
 const targets=(activeCampaign.armies||[]).filter(a=>{const owner=a.owner||a.factionId,race=FACTION_BY_ID[owner]?.race||activeCampaign.factionStates?.find(f=>f.id===owner)?.race||"human";return owner!==activeCampaign.playerPoliticalFaction&&race!=="undead"&&a.roster?.length&&campaignSupplyPath(activeCampaign,a).some(n=>near.has(n));});
 if(!targets.length){campaignMessage("No enemy supply line is within raiding range. Move beside a road feeding an enemy army.");return;}
 targets.sort((a,b)=>((b.supplies||0)-(a.supplies||0)));
 const target=targets[0];target.supplyRaidedUntilTurn=activeCampaign.turn+2;target.supplies=Math.max(0,(target.supplies||0)-1);target.supplyStatus="raided";
 campaignMessage("Supply line raided! "+(target.name||target.owner+" army")+" loses one supply turn and cannot replenish supplies for two campaign turns.");
}
function playerArmies(){const id=activeCampaign?.playerPoliticalFaction;return (activeCampaign?.armies||[]).filter(a=>a.owner===id||a.factionId===id);}
function selectedPlayerArmy(){
 const armies=playerArmies();if(!armies.length)return null;
 const army=armies.find(a=>a.id===activeCampaign.selectedArmyId)||armies.find(a=>a.id===activeCampaign.playerPoliticalFaction+"-main")||armies[0];
 activeCampaign.selectedArmyId=army.id;army.name=army.name||(army.id===activeCampaign.playerPoliticalFaction+"-main"?"Main army":"Army "+(armies.indexOf(army)+1));
 if(!army.nodeId)army.nodeId=activeCampaign.commander.nodeId||"city-"+(army.region||activeCampaign.startingRegion);
 if(!Number.isFinite(army.region))army.region=activeCampaign.graph.nodes[army.nodeId]?.region||activeCampaign.startingRegion;
 if(!Number.isFinite(army.movement))army.movement=campaignArmyMovementProfile(army,activeCampaign).points;
 return army;
}
function recruitCatalog(){
 const race=FACTION_BY_ID[activeCampaign.playerPoliticalFaction]?.race||"human",basic=race==="greenskin"?"goblins":race==="dwarf"?"dwarfInfantry":"swordsmen";
 const options=[
  {key:"melee",label:race==="dwarf"?"Dwarf melee infantry":race==="elf"?"High Elf spearmen":race==="greenskin"?"Goblin mobs":"Melee infantry",type:basic,weapon:race==="elf"?"spear":"handWeapon",min:5,max:30,modelType:basic,modelWeapon:race==="elf"?"spear":"handWeapon"},
  ...(race==="greenskin"?[
   {key:"orcBoyz",label:"Orc Boyz",type:"orcBoyz",weapon:"handWeapon",min:5,max:30,modelType:"orcBoyz",modelWeapon:"handWeapon"},
   {key:"goblinBows",label:"Goblin short bows",type:"goblins",weapon:"handWeapon",rangedWeapon:"bow",min:5,max:30,modelType:"goblins",modelWeapon:"bow"},
   {key:"wolfRiders",label:"Goblin wolf riders",type:"wolfRiders",weapon:"handWeapon",min:5,max:15,modelType:"wolfRiders",modelWeapon:"handWeapon"},
   {key:"boarBoyz",label:"Orc boar riders",type:"boarBoyz",weapon:"handWeapon",min:5,max:15,modelType:"boarBoyz",modelWeapon:"handWeapon"},
   {key:"goblinHero",label:"Goblin Big Boss",type:"goblinHero",weapon:"handWeapon",min:1,max:1,modelType:"goblinHero",character:true},
   {key:"goblinLord",label:"Goblin Warboss",type:"goblinLord",weapon:"handWeapon",min:1,max:1,modelType:"goblinLord",character:true},
   {key:"orcHero",label:"Orc Big Boss",type:"orcHero",weapon:"handWeapon",min:1,max:1,modelType:"orcHero",character:true},
   {key:"orcLord",label:"Orc Warboss",type:"orcLord",weapon:"handWeapon",min:1,max:1,modelType:"orcLord",character:true},
   {key:"rockLobber",label:"Goblin Rock Lobber",type:"catapult",weapon:"handWeapon",min:3,max:3,modelType:"catapult",modelWeapon:"none",fixed:true,crewType:"goblins",crewWeapon:"handWeapon"}
  ]:[]),
  ...(race==="dwarf"?[
   {key:"crossbows",label:"Dwarf crossbowmen",type:"dwarfInfantry",weapon:"handWeapon",rangedWeapon:"crossbow",min:5,max:30,modelType:"dwarfInfantry",modelWeapon:"crossbow"},
   {key:"dwarfFirearms",label:"Dwarf firearm infantry",type:"dwarfInfantry",weapon:"handWeapon",rangedWeapon:"firearm",min:5,max:30,modelType:"dwarfInfantry",modelWeapon:"firearm"}
  ]:[{key:"archers",label:"Archers",type:"archers",weapon:"handWeapon",rangedWeapon:"bow",min:5,max:30,modelType:"archers",modelWeapon:"bow"}]),
  ...(race==="human"?[
   {key:"crossbowmen",label:"Crossbow infantry",type:"swordsmen",weapon:"handWeapon",rangedWeapon:"crossbow",min:5,max:30,modelType:"swordsmen",modelWeapon:"crossbow"},
   {key:"firearmInfantry",label:"Firearm infantry",type:"swordsmen",weapon:"handWeapon",rangedWeapon:"firearm",min:5,max:30,modelType:"swordsmen",modelWeapon:"firearm"}
  ]:[]),
  ...(race==="elf"||race==="greenskin"?[]:[{key:"spearmen",label:"Spearmen",type:basic,weapon:"spear",min:5,max:30,modelType:basic,modelWeapon:"spear"}]),
  ...(race==="greenskin"?[]:[{key:"halberdiers",label:"Halberdiers",type:basic,weapon:"halberd",min:5,max:30,modelType:basic,modelWeapon:"halberd"}]),
  {key:"greatWeapons",label:"Great-weapon infantry",type:basic,weapon:"greatWeapon",min:5,max:30,modelType:basic,modelWeapon:"greatWeapon"},
  ...(race!=="dwarf"&&race!=="greenskin"?[{key:"cavalry",label:race==="elf"?"High Elf cavalry":"Cavalry",type:"cavalry",weapon:"handWeapon",min:5,max:15,modelType:"cavalry"}]:[]),
  ...(race==="greenskin"?[]:[{key:"artillery",label:race==="elf"?"Bolt thrower":race==="dwarf"?"Dwarf cannon":"Cannon",type:race==="elf"?"boltThrower":"cannon",weapon:"handWeapon",min:race==="elf"?2:3,max:race==="elf"?2:3,modelType:race==="elf"?"boltThrower":"cannon",modelWeapon:"none",fixed:true,crewType:race==="dwarf"?"dwarfInfantry":"swordsmen",crewWeapon:race==="elf"?"spear":"handWeapon"}]),
  ...(race==="greenskin"?[]:race==="dwarf"?[
   {key:"dwarfCaptain",label:"Dwarf thane",type:"dwarfCaptain",weapon:"handWeapon",min:1,max:1,modelType:"dwarfCaptain",character:true},
   {key:"dwarfLord",label:"Dwarf lord",type:"dwarfLord",weapon:"handWeapon",min:1,max:1,modelType:"dwarfLord",character:true},
   {key:"dwarfKingHaldric",label:"King Haldric Stoneward",type:"dwarfKingHaldric",weapon:"handWeapon",min:1,max:1,modelType:"dwarfKingHaldric",character:true}
  ]:[
   {key:"captain",label:race==="elf"?"High Elf hero":"Human captain",type:"captain",weapon:"handWeapon",min:1,max:1,modelType:"captain",character:true},
   {key:"lord",label:race==="elf"?"High Elf lord":"Human lord",type:"lord",weapon:"handWeapon",min:1,max:1,modelType:"lord",character:true},
   ...(race==="elf"?[
    {key:"shadowElf",label:"Lethariel Starweaver",type:"shadowElf",weapon:"handWeapon",rangedWeapon:"magicBow",min:1,max:1,modelType:"shadowElf",character:true},
    {key:"pegasusChampion",label:"Aelthir, the Dawnwing",type:"pegasusChampion",weapon:"lance",min:1,max:1,modelType:"pegasusChampion",character:true},
    ...["youngDragon","dragon","ancientDragon"].map(type=>({key:type,label:type==="youngDragon"?"Young dragon":type==="dragon"?"Dragon":"Ancient dragon",type,weapon:"handWeapon",min:1,max:1,modelType:type,character:true}))
   ]:[
    {key:"legendaryLord",label:"Lord-Marshal Edric Voss",type:"legendaryLord",weapon:"handWeapon",min:1,max:1,modelType:"legendaryLord",character:true},
    {key:"rifleman",label:"Imperial marksman",type:"rifleman",weapon:"handWeapon",rangedWeapon:"longRifle",min:1,max:1,modelType:"rifleman",character:true},
    {key:"captainWeiss",label:"Captain Marta Weiss",type:"captainWeiss",weapon:"handWeapon",min:1,max:1,modelType:"captainWeiss",character:true}
   ])
  ])
 ];
 return options;
}
function assignedSiegeModelIds(){return new Set(playerArmies().flatMap(a=>(a.roster||[]).flatMap(u=>[u.machineModelId,...(u.crewModelIds||[])].filter(Boolean))));}
function optionMatchesModel(o,m){return m?.faction===rosterFactionForPoliticalFaction(activeCampaign.playerPoliticalFaction)&&m.type===o.modelType&&(!o.modelWeapon||m.weapon===o.modelWeapon);}
function deployedForOption(o){
 let total=0;
 for(const a of playerArmies())for(const u of a.roster||[]){
  if(u.type!==o.type)continue;
  if(o.fixed){total++;continue;}
  const matches=o.character||o.key==="cavalry"||(o.rangedWeapon?u.rangedWeapon===o.rangedWeapon:o.modelWeapon&&["spear","halberd","greatWeapon"].includes(o.modelWeapon)?u.weapon===o.modelWeapon:!u.rangedWeapon&&u.weapon===(o.weapon||"handWeapon"));
  if(matches)total+=u.models||0;
 }
 return total;
}
function availableModelsForOption(o){const assigned=assignedSiegeModelIds();return collectionModels().filter(m=>!assigned.has(m.id)&&optionMatchesModel(o,m)).slice(o.fixed?0:deployedForOption(o));}
function availableCrewForOption(o){const assigned=assignedSiegeModelIds(),crewOption={type:o.crewType,modelType:o.crewType,modelWeapon:o.crewWeapon,weapon:o.crewWeapon,key:"crew-"+o.key};return collectionModels().filter(m=>!assigned.has(m.id)&&optionMatchesModel(crewOption,m)&&!m.mounted).slice(deployedForOption(crewOption));}
function availableForOption(o){const machines=availableModelsForOption(o).length;if(!o.fixed)return machines;return Math.min(machines,Math.floor(availableCrewForOption(o).length/o.min));}
function optionConfig(o,models){
 const sample=availableModelsForOption(o)[0];
 if(o.fixed){const crew=availableCrewForOption(o).slice(0,o.min);return {type:o.type,models:o.min,weapon:"handWeapon",meleeWeapons:["handWeapon"],machineModelId:sample?.id||null,crewModelIds:crew.map(m=>m.id),siegeMachine:true};}
 if(o.type==="legendaryLord"||o.type==="shadowElf"||o.type==="pegasusChampion")return campaignCharacterConfig(activeCampaign.playerPoliticalFaction,{id:o.type==="legendaryLord"?"edric_voss":o.type==="shadowElf"?"lethariel_starweaver":"aelthir_dawnwing"});
 let weapon=o.weapon||"handWeapon",meleeWeapons=weapon==="handWeapon"?["handWeapon"]:["handWeapon",weapon],rangedWeapon=o.rangedWeapon||null;
 if(sample&&o.character&&!o.rangedWeapon){
  if(["bow","crossbow","firearm","longRifle"].includes(sample.weapon))rangedWeapon=sample.weapon;
  else if(["spear","lance","greatWeapon","halberd"].includes(sample.weapon)){weapon=sample.weapon;meleeWeapons=["handWeapon",sample.weapon];}
 }
 if(sample&&o.type==="cavalry"&&["spear","lance","greatWeapon","halberd"].includes(sample.weapon)){weapon=sample.weapon;meleeWeapons=["handWeapon",sample.weapon];}
 if(sample&&o.type==="cavalry"&&["bow","crossbow","firearm"].includes(sample.weapon))rangedWeapon=sample.weapon;
 const config={type:o.type,models,weapon,meleeWeapons,champion:false,upgrades:{},skills:{}};
 if(rangedWeapon)config.rangedWeapon=rangedWeapon;
 if(o.type==="cavalry"){config.mounted=true;config.mountType="horse";}if(o.type==="wolfRiders"){config.mounted=true;config.mountType="wolf";}if(o.type==="boarBoyz"){config.mounted=true;config.mountType="boar";}
 if(o.type==="dwarfKingHaldric"){config.shield=true;config.magicArmour=true;}
 return config;
}
function optionForUnit(unit,catalog=recruitCatalog()){
 return catalog.find(o=>o.type===unit?.type&&(o.character||o.key==="cavalry"||(o.rangedWeapon?unit.rangedWeapon===o.rangedWeapon:o.modelWeapon&&["spear","halberd","greatWeapon"].includes(o.modelWeapon)?unit.weapon===o.modelWeapon:!unit.rangedWeapon&&unit.weapon===(o.weapon||"handWeapon"))));
}
function selectedFactionTreasury(){return activeCampaign?.factionStates?.find(f=>f.id===activeCampaign.playerPoliticalFaction);}
function idMainArmy(){return activeCampaign?.playerPoliticalFaction+"-main";}
function syncPlayerArmyState(){
 const p=selectedFactionTreasury();if(!p)return;const armies=playerArmies();
 p.armyPoints=armies.reduce((sum,a)=>sum+campaignArmyCost(a),0);p.roster=(armies.find(a=>a.id===idMainArmy())||armies[0])?.roster||[];
 p.upkeep=armies.reduce((sum,a)=>sum+campaignArmyUpkeep(a),0);activeCampaign.treasury=p.treasury;
}
function campaignMessage(message){activeCampaign.lastEvent=message;saveCampaign();renderCampaignMap();}
function renderArmyManagement(){
 const host=byId("grand-army-management");if(!host||!activeCampaign)return;ensureLogisticsState(activeCampaign);
 const armies=playerArmies(),army=selectedPlayerArmy();if(!army){host.textContent="No field army.";return;}
 const faction=army.rosterFaction||rosterFactionForPoliticalFaction(activeCampaign.playerPoliticalFaction),treasury=selectedFactionTreasury(),catalog=recruitCatalog();
 const labels={goblins:"Goblin mobs",orcBoyz:"Orc Boyz",wolfRiders:"Goblin wolf riders",boarBoyz:"Orc boar riders",goblinHero:"Goblin Big Boss",goblinLord:"Goblin Warboss",orcHero:"Orc Big Boss",orcLord:"Orc Warboss",catapult:"Goblin Rock Lobber",swordsmen:"Melee infantry",archers:"Archers",dwarfInfantry:"Dwarf infantry",cavalry:"Cavalry",cannon:"Cannon",boltThrower:"Bolt thrower",captain:"Captain",lord:"Lord",dwarfCaptain:"Dwarf thane",dwarfLord:"Dwarf lord",dwarfKingHaldric:"King Haldric",legendaryLord:"Edric Voss",shadowElf:"Lethariel Starweaver",pegasusChampion:"Aelthir, the Dawnwing",rifleman:"Marksman",captainWeiss:"Marta Weiss",youngDragon:"Young dragon",dragon:"Dragon",ancientDragon:"Ancient dragon"};
 const options=catalog.map(o=>{const available=availableForRecruitment(o,army),config=optionConfig(o,o.min),price=unitCost(config,faction);return '<option value="'+o.key+'" '+(available<o.min?'disabled':'')+'>'+o.label+' · '+available+' available · '+price+' gold minimum</option>';}).join("");
 const roster=(army.roster||[]).map((u,i)=>{const label=labels[u.type]||u.type,o=optionForUnit(u,catalog),can=!!o&&!o.character&&!o.fixed&&u.models<o.max&&availableForRecruitment(o,army)>0;return '<div class="grand-army-unit"><span><b>'+label+'</b><small>'+u.models+' models · '+unitCost(u,faction)+' gold</small></span><div class="grand-army-unit-actions"><button type="button" class="secondary-button" data-replenish="'+i+'" '+(!can?'disabled':'')+'>Replenish +1</button><button type="button" class="secondary-button grand-disband-button" data-disband="'+i+'">Disband</button></div></div>';}).join("");
 host.innerHTML='<div class="grand-army-management-head"><h3>Armies &amp; recruitment</h3><button type="button" class="secondary-button" id="grand-create-army">＋ Form army</button></div><label class="grand-army-field">Selected army<select id="grand-select-army">'+armies.map(a=>'<option value="'+a.id+'" '+(a.id===army.id?'selected':'')+'>'+(a.name||"Army")+' · '+(CITIES.find(c=>c.id===a.region)?.name||"Field")+'</option>').join("")+'</select></label><div class="grand-army-summary">'+(army.roster||[]).length+' / 6 units · '+(army.points||0)+' pts · '+(FACTION_BY_ID[treasury?.id]?.race==="greenskin"?"unlimited greenskin recruitment":recruitmentPoolAvailable(treasury,activeCampaign.regions.find(r=>r.id===army.region))+" local trained recruits")+' · '+civilianPopulation(activeCampaign.regions.find(r=>r.id===army.region)).toLocaleString()+' civilians at this location · '+(army.movement||0)+' movement left · '+(army.supplies??3)+'/'+(army.maxSupplies||3)+' supply turns · '+({supplied:'supplied',low:'low supplies',starving:'starving',raided:'supply line raided'}[army.supplyStatus]||'supply status unknown')+'</div>'+(roster||'<p class="subtle">This army has no troops yet. Recruit a unit below.</p>')+'<button type="button" class="secondary-button" id="grand-raid-supply">Raid enemy supply line</button><small class="grand-supply-note">Supplies refill while connected to friendly settlements. Cut off armies consume reserves; at zero, starvation causes losses.</small><div class="grand-recruit-box"><label class="grand-army-field">Recruit a new unit<select id="grand-recruit-type">'+options+'</select></label><label class="grand-army-field">Models<input id="grand-recruit-count" type="number" min="1" max="30" value="5"></label><button type="button" class="primary-button" id="grand-recruit-unit" '+((army.roster||[]).length>=6?'disabled':'')+'>Recruit unit</button><small>Recruitment costs gold and requires compatible miniatures you own. Models already deployed in any of your armies cannot be recruited again.</small></div>';
 byId("grand-raid-supply").addEventListener("click",raidEnemySupplyLine);
 byId("grand-select-army").addEventListener("change",e=>{activeCampaign.selectedArmyId=e.target.value;const selected=selectedPlayerArmy();activeCampaign.commander.nodeId=selected.nodeId;activeCampaign.commander.region=selected.region;activeCampaign.commander.movement=selected.movement;campaignMessage("Selected "+selected.name+".");});
 byId("grand-create-army").addEventListener("click",()=>{const id=activeCampaign.playerPoliticalFaction,base=selectedPlayerArmy(),number=playerArmies().length+1,armyId=id+"-army-"+activeCampaign.turn+"-"+number,fresh={id:armyId,owner:id,factionId:id,name:"Army "+number,rosterFaction:rosterFactionForPoliticalFaction(id),roster:[],region:base.region,nodeId:base.nodeId,points:0,movement:0};activeCampaign.armies.push(fresh);activeCampaign.selectedArmyId=armyId;activeCampaign.commander.nodeId=fresh.nodeId;activeCampaign.commander.region=fresh.region;activeCampaign.commander.movement=0;campaignMessage("Formed "+fresh.name+". Recruit troops to build it.");});
 host.querySelectorAll("[data-disband]").forEach(button=>button.addEventListener("click",()=>{const index=Number(button.dataset.disband),unit=army.roster[index];if(!unit)return;const label=labels[unit.type]||unit.type;if(!window.confirm("Disband "+label+" ("+unit.models+" models)? The models return to your available collection. Recruitment gold is not refunded."))return;army.roster.splice(index,1);army.points=campaignArmyCost(army);syncPlayerArmyState();campaignMessage("Disbanded "+label+"; "+unit.models+" models are available for recruitment again. No gold was refunded.");}));
 host.querySelectorAll("[data-replenish]").forEach(button=>button.addEventListener("click",()=>{const unit=army.roster[Number(button.dataset.replenish)],o=optionForUnit(unit,catalog);if(!unit||!o||o.character||o.fixed){campaignMessage("That unit cannot be replenished as ordinary rank-and-file.");return;}if(unit.models>=o.max||availableForRecruitment(o,army)<1){campaignMessage("No compatible unassigned model, recruitment-pool slot or civilian population is available.");return;}const price=Math.max(1,unitCost({...unit,models:unit.models+1},faction)-unitCost(unit,faction));if((treasury?.treasury||0)<price){campaignMessage("Not enough gold to replenish that unit.");return;}const region=activeCampaign.regions.find(r=>r.id===army.region);if(!consumeRecruitmentPool(treasury,region,1)||!consumeCivilianPopulation(region,1,treasury.race||FACTION_BY_ID[treasury.id]?.race||"human")){campaignMessage("Recruitment is limited by the pool and local civilian population.");return;}unit.models++;treasury.treasury-=price;army.points=campaignArmyCost(army);syncPlayerArmyState();campaignMessage("Replenished "+(labels[unit.type]||unit.type)+" by one model for "+price+" gold; one civilian joined the army.");}));
 byId("grand-recruit-type").addEventListener("change",()=>{const o=catalog.find(x=>x.key===byId("grand-recruit-type").value);if(o){const input=byId("grand-recruit-count");input.min=o.min;input.max=o.max;input.value=o.min;}});
 byId("grand-recruit-unit").addEventListener("click",()=>{const o=catalog.find(x=>x.key===byId("grand-recruit-type").value);if(!o){campaignMessage("Choose a troop type first.");return;}if((army.roster||[]).length>=6){campaignMessage("This army already has six units.");return;}const count=o.fixed?o.min:Math.max(o.min,Math.min(o.max,Math.floor(Number(byId("grand-recruit-count").value)||o.min))),available=availableForRecruitment(o,army),populationCost=o.fixed?o.min:count;if(available<count){campaignMessage("You need "+count+" compatible models; only "+available+" are available after collection, recruitment-pool and civilian-population limits.");return;}const config=optionConfig(o,count),price=unitCost(config,faction);if((treasury?.treasury||0)<price){campaignMessage("Not enough gold. This unit costs "+price+".");return;}const region=activeCampaign.regions.find(r=>r.id===army.region);if(!consumeRecruitmentPool(treasury,region,populationCost)||!consumeCivilianPopulation(region,populationCost,treasury.race||FACTION_BY_ID[treasury.id]?.race||"human")){campaignMessage("Recruitment is limited by the pool and local civilian population.");return;}army.roster.push(config);treasury.treasury-=price;army.points=campaignArmyCost(army);syncPlayerArmyState();campaignMessage("Recruited "+o.label+" ("+count+" models) for "+price+" gold; "+populationCost+" civilians joined the army.");});
}
function renderCampaignMap(){
 if(!activeCampaign)return;
 const currentArmy=selectedPlayerArmy();if(currentArmy){activeCampaign.commander.nodeId=currentArmy.nodeId;activeCampaign.commander.region=currentArmy.region;activeCampaign.commander.movement=currentArmy.movement;}
 const host=byId("grand-map-live-wrap");let map=byId("grand-campaign-world-map");
 const firstRender=!map;if(!map){map=byId("grand-world-map").cloneNode(true);map.id="grand-campaign-world-map";map.querySelectorAll(".grand-city").forEach(m=>m.classList.remove("other-faction","selected","character-locked"));host.replaceChildren(map);installCampaignMapNavigation(host,map);}
 map.querySelectorAll("#campaign-road-layer,#campaign-node-layer,#campaign-commander-layer").forEach(e=>e.remove());
 const road=svgEl("g",{id:"campaign-road-layer","pointer-events":"none"}),layer=svgEl("g",{id:"campaign-node-layer"}),token=svgEl("g",{id:"campaign-commander-layer","pointer-events":"none"}),{nodes,edges}=activeCampaign.graph;
 for(const [id,list] of Object.entries(edges))for(const e of list){if(id.localeCompare(e.to)>=0)continue;const a=nodes[id],b=nodes[e.to];road.append(svgEl("path",{d:"M "+a.x+" "+a.y+" L "+b.x+" "+b.y,class:"campaign-road"+(a.type==="river"||b.type==="river"?" river-road":"")}));}
 paintFactionBanners(map,activeCampaign);
 map.querySelector("#grand-city-markers").before(road);
 for(const n of Object.values(nodes)){const isCurrent=n.id===activeCampaign.commander.nodeId,reach=(edges[activeCampaign.commander.nodeId]||[]).some(e=>e.to===n.id&&e.cost+nodeCost(n)-1<=activeCampaign.commander.movement),g=svgEl("g",{class:"campaign-node "+n.type+(isCurrent?" current":"")+(reach?" reachable":""),tabindex:reach?"0":"-1",role:"button","aria-label":n.label,transform:"translate("+n.x+" "+n.y+")","data-node":n.id});g.append(svgEl("circle",{r:16,class:"campaign-node-hit"}));g.append(svgEl("circle",{r:n.type==="city"?5:n.type==="crossroads"?3.5:5.5,class:"campaign-node-visible"}));if(n.type==="port")g.append(svgEl("path",{d:"M-3 0 L3 0 M0 -4 L0 2 M-4 2 L4 2"}));layer.append(g);}
 map.querySelector("#grand-city-markers").after(layer);
 const current=nodes[activeCampaign.commander.nodeId];token.append(svgEl("circle",{cx:current.x,cy:current.y-17,r:11,class:"commander-token"}));const initials=activeCampaign.commander.name.split(/\s+/).map(s=>s[0]).join("").slice(0,2).toUpperCase(),label=svgEl("text",{x:current.x,y:current.y-13,"text-anchor":"middle",class:"commander-initials"});label.textContent=initials;token.append(label);map.append(token);
 layer.querySelectorAll("[data-node]").forEach(g=>{const move=()=>moveCommander(g.dataset.node);g.addEventListener("click",move);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();move();}});});
 const n=nodes[activeCampaign.commander.nodeId];const settlementRegion=activeCampaign.regions.find(r=>r.id===n.region);byId("grand-campaign-turn").textContent="TURN "+activeCampaign.turn;const playerState=activeCampaign.factionStates.find(f=>f.id===activeCampaign.playerPoliticalFaction);if(playerState)playerState.upkeep=playerArmies().reduce((sum,a)=>sum+campaignArmyUpkeep(a),0);byId("grand-campaign-treasury").textContent=activeCampaign.treasury+" gold · +"+(playerState?.income||0)+" / −"+(playerState?.upkeep||0);
 byId("grand-campaign-commander").innerHTML="<strong>♟ "+activeCampaign.commander.name+"</strong><span>"+(activeCampaign.commander.kind==="legendary"?"Legendary":"Commander")+" · "+activeCampaign.commander.movement+"/"+activeCampaign.commander.maxMovement+" MP"+(currentArmy&&campaignArmyRace(currentArmy,activeCampaign)==="greenskin"?" · Boredom "+Math.max(-4,Math.min(10,Number.isFinite(currentArmy.boredom)?currentArmy.boredom:-4)):"")+"</span>";
 byId("grand-campaign-node-detail").innerHTML="<strong>"+(n.type==="city"?"⌂ ":"◆ ")+n.label+"</strong>"+(n.type==="city"&&settlementRegion?.settlement?("<span>"+(FACTION_BY_ID[settlementRegion.ownerFaction]?.name||FACTIONS[settlementRegion.ownerFaction]?.name||settlementRegion.ownerFaction)+" · "+Math.round(settlementRegion.settlement.population.total).toLocaleString()+" · Food "+(settlementRegion.settlement.foodStores??8)+"/"+(settlementRegion.settlement.maxFoodStores||8)+(settlementRegion.settlement.besiegedBy?" · BESIEGED":"")+"</span>"):"<span>"+({crossroads:"Road junction",port:"Port",river:"River crossing",border:"Border"}[n.type]||"Road")+"</span>");
 const battleRegion=n.type==="city"?activeCampaign.regions.find(r=>r.id===n.region):null;
 const playerId=activeCampaign.playerPoliticalFaction,defenderId=battleRegion&&politicalOwner(battleRegion);
 if(battleRegion&&defenderId&&defenderId!==playerId&&activeCampaign.factionStates.some(f=>f.id===defenderId&&f.alive)){
  const battleButton=document.createElement("button");battleButton.type="button";battleButton.className="primary-button grand-campaign-battle-button";battleButton.textContent="Fight for "+battleRegion.name;battleButton.addEventListener("click",()=>launchCampaignBattle(battleRegion));byId("grand-campaign-node-detail").append(battleButton);
 }
 if(battleRegion&&politicalOwner(battleRegion)===playerId&&battleRegion.settlement&&!battleRegion.settlement.besiegedBy){
  const st=battleRegion.settlement,stockButton=document.createElement("button");stockButton.type="button";stockButton.className="secondary-button";stockButton.textContent="Stock city provisions · 40 gold";
  stockButton.disabled=(st.foodStores||0)>=12||(selectedFactionTreasury()?.treasury||0)<40;
  stockButton.addEventListener("click",()=>{const funds=selectedFactionTreasury();if(!funds||funds.treasury<40){campaignMessage("Not enough gold to stock city provisions.");return;}if(st.besiegedBy){campaignMessage("A besieged city cannot receive provisions.");return;}funds.treasury-=40;st.maxFoodStores=12;st.foodStores=Math.min(12,(st.foodStores||0)+3);campaignMessage(battleRegion.name+" stores provisions for "+st.foodStores+" siege turns.");});
  byId("grand-campaign-node-detail").append(stockButton);
 }
 byId("grand-campaign-event").textContent=activeCampaign.lastEvent||"Select a highlighted place connected by road.";renderArmyManagement();renderDiplomacy();if(firstRender){const scale=map.clientWidth/1300;host.scrollLeft=Math.max(0,current.x*scale-host.clientWidth/2);host.scrollTop=Math.max(0,current.y*scale-host.clientHeight/2);}
}
function launchCampaignBattle(region,attackingArmyOverride=null){
 if(!activeCampaign||!region||typeof window.startPoliticalCampaignBattle!=="function")return;
 const playerId=activeCampaign.playerPoliticalFaction,enemyId=politicalOwner(region);
 if(!enemyId||enemyId===playerId)return;
 declareCampaignWar(activeCampaign,playerId,enemyId);
 const playerArmy=attackingArmyOverride||selectedPlayerArmy(),enemyArmy=factionArmy(activeCampaign,enemyId);
 if(!playerArmy?.roster?.length||!enemyArmy?.roster?.length){activeCampaign.lastEvent="Cannot muster a valid army for this battle.";renderCampaignMap();return;}
 const playerFaction=playerArmy.rosterFaction||rosterFactionForPoliticalFaction(playerId),enemyFaction=enemyArmy.rosterFaction||rosterFactionForPoliticalFaction(enemyId);
 const started=window.startPoliticalCampaignBattle({army:playerArmy.roster,faction:playerFaction,enemyArmy:enemyArmy.roster,enemyFaction,onComplete:result=>{
  playerArmy.foughtThisTurn=true;enemyArmy.foughtThisTurn=true;
  const survivors=(result.playerUnits||[]).filter(u=>u.models>0);
  const enemySurvivors=(result.enemyUnits||[]).filter(u=>u.models>0);
  playerArmy.roster=playerArmy.roster.map((config,i)=>({...config,models:Math.max(0,survivors[i]?.models??0),currentDamage:survivors[i]?.damage||0,currentWounds:survivors[i]?.characterWounds})).filter(config=>config.models>0);
  enemyArmy.roster=enemyArmy.roster.map((config,i)=>({...config,models:Math.max(0,enemySurvivors[i]?.models??0),currentDamage:enemySurvivors[i]?.damage||0,currentWounds:enemySurvivors[i]?.characterWounds})).filter(config=>config.models>0);
  playerArmy.points=Math.max(0,Math.round(playerArmy.roster.reduce((sum,u)=>sum+unitCost(u,playerFaction),0)));
  enemyArmy.points=Math.max(0,Math.round(enemyArmy.roster.reduce((sum,u)=>sum+unitCost(u,enemyFaction),0)));
  const playerState=activeCampaign.factionStates.find(f=>f.id===playerId),enemyState=activeCampaign.factionStates.find(f=>f.id===enemyId);
  if(result.won){
   const greenskinPlayer=campaignIsGreenskin(activeCampaign,playerId);
   const sackCity=greenskinPlayer&&window.confirm("Sack "+region.name+" for a large haul of plunder? Its usable population will be destroyed and future city income lost. Choose Cancel to occupy it instead.");
   const outcome=resolveGrandCampaignConquest(activeCampaign,region.id,playerId,{outcome:greenskinPlayer?(sackCity?"sack":"occupy"):"occupy"});
   playerArmy.region=region.id;playerArmy.nodeId="city-"+region.id;if(selectedPlayerArmy()===playerArmy){activeCampaign.commander.region=region.id;activeCampaign.commander.nodeId="city-"+region.id;}
   activeCampaign.lastEvent=!playerArmy.roster.length?"Victory at "+region.name+", but your army has been destroyed. Rebuild from your remaining miniatures and treasury.":"Victory at "+region.name+". "+outcome.summary;
   if(enemyState&&enemyArmy.points<=0)enemyState.alive=false;
  }else{
   const home=playerState?.homeRegion||activeCampaign.startingRegion,homeNode="city-"+home;
   activeCampaign.commander.region=home;activeCampaign.commander.nodeId=homeNode;playerArmy.region=home;playerArmy.nodeId=homeNode;
   activeCampaign.lastEvent=!playerArmy.roster.length?"Defeat at "+region.name+". Your army has been destroyed; rebuild from your remaining miniatures and treasury.":"Defeat at "+region.name+". Your surviving forces retreat to "+(CITIES.find(c=>c.id===home)?.name||"your capital")+".";
   if(enemyState&&enemyArmy.points<=0)enemyState.alive=false;
  }
  if(playerState){playerState.armyPoints=playerArmies().reduce((sum,a)=>sum+campaignArmyCost(a),0);playerState.roster=(playerArmies().find(a=>a.id===idMainArmy())||playerArmy).roster;playerState.upkeep=playerArmies().reduce((sum,a)=>sum+campaignArmyUpkeep(a),0);}
  if(enemyState){enemyState.armyPoints=enemyArmy.points;enemyState.roster=enemyArmy.roster;}
  saveCampaign();byId("grand-campaign-screen").hidden=false;byId("grand-campaign-setup").hidden=true;byId("grand-campaign-world").hidden=false;renderCampaignMap();
 }});
 if(!started){activeCampaign.lastEvent="The tactical battle could not be started.";renderCampaignMap();}
}
function campaignArmyRace(army,campaign=activeCampaign){
 const owner=army?.owner||army?.factionId;
 return FACTION_BY_ID[owner]?.race||campaign?.factionStates?.find(f=>f.id===owner)?.race||"human";
}
function campaignUnitMovementClass(unit){
 const type=String(unit?.type||"").toLowerCase();
 if(["dragon","youngdragon","ancientdragon","pegasuschampion"].includes(type)||unit?.flying||["eagle","pegasus"].includes(unit?.mountType))return "flyer";
 if(["cavalry","wolfriders","boarboyz","wolfrider","horsecavalry"].includes(type)||unit?.mounted||["horse","wolf","boar"].includes(unit?.mountType))return "cavalry";
 return "foot";
}
function campaignArmyMovementProfile(army,campaign=activeCampaign){
 const race=campaignArmyRace(army,campaign),roster=(army?.roster||[]).filter(u=>(u.models||1)>0);
 const characterTypes=new Set(["captain","lord","legendarylord","shadowelf","pegasuschampion","dwarfcaptain","dwarflord","dwarfkinghaldric","goblinhero","goblinlord","orchero","orclord"]);
 const units=roster.filter(u=>!characterTypes.has(String(u?.type||"").toLowerCase()));
 const main=units.length?units:roster;
 const classes=main.map(campaignUnitMovementClass);
 const allFlying=classes.length>0&&classes.every(c=>c==="flyer");
 const allCavalry=classes.length>0&&classes.every(c=>c==="cavalry");
 const cavalry=main.filter(u=>campaignUnitMovementClass(u)==="cavalry");
 const infantry=main.filter(u=>campaignUnitMovementClass(u)==="foot");
 const hasHeavyArmouredInfantry=infantry.some(u=>!!(u.heavyArmour||u.upgrades?.heavyArmour||u.upgrades?.heavy_armour));
 let points=4;
 if(race==="dwarf")points=3;
 else if(race==="elf")points=allCavalry?9:5;
 else if(allCavalry){
  const barded=cavalry.some(u=>!!(u.barding||u.upgrades?.barding));
  points=barded?7:8;
 }else if(race==="human"||race==="undead"||race==="greenskin")points=hasHeavyArmouredInfantry?3:4;
 return {points,allFlying,allCavalry,race,classes};
}
function campaignSupplyRange(army,campaign=activeCampaign){
 const profile=campaignArmyMovementProfile(army,campaign);
 return profile.allCavalry?9:profile.race==="dwarf"?4:6;
}
function campaignMovementPath(campaign,from,to){
 const graph=campaign?.graph;if(!graph?.nodes?.[from]||!graph.nodes[to])return null;
 const queue=[from],previous=new Map([[from,null]]);
 while(queue.length){
  const at=queue.shift();if(at===to)break;
  for(const edge of graph.edges[at]||[]){if(previous.has(edge.to))continue;previous.set(edge.to,at);queue.push(edge.to);}
 }
 if(!previous.has(to))return null;
 const path=[];for(let at=to;at!==null;at=previous.get(at))path.push(at);
 return path.reverse();
}
function moveCommander(id){
 if(!activeCampaign)return;
 const army=selectedPlayerArmy(),from=army?.nodeId||activeCampaign.commander.nodeId,n=activeCampaign.graph.nodes[id],edge=(activeCampaign.graph.edges[from]||[]).find(e=>e.to===id);
 const profile=army?campaignArmyMovementProfile(army,activeCampaign):{allFlying:false};
 const path=campaignMovementPath(activeCampaign,from,id),flying=!!profile.allFlying;
 if(!n||!path||(!edge&&!flying)){activeCampaign.lastEvent="You can only move along connected roads. A flying army can leap over an intervening army, but cannot travel cross-country.";renderCampaignMap();return;}
 if(flying&&path.slice(1,-1).some(nodeId=>{
  const node=activeCampaign.graph.nodes[nodeId];
  if(node?.type!=="city")return false;
  const region=activeCampaign.regions.find(r=>r.id===node.region);
  return region&&politicalOwner(region)!==(army?.owner||army?.factionId);
 })){activeCampaign.lastEvent="Flying armies can leap over an intervening army, but cannot bypass enemy-held settlements.";renderCampaignMap();return;}
 const movement=army?.movement??activeCampaign.commander.movement;
 let cost=0;
 for(let i=1;i<path.length;i++){
  const next=activeCampaign.graph.nodes[path[i]],step=(activeCampaign.graph.edges[path[i-1]]||[]).find(e=>e.to===path[i]);
  cost+=(step?.cost||1)+nodeCost(next)-1;
 }
 if(cost>movement){activeCampaign.lastEvent="Not enough movement remaining to reach "+n.label+".";renderCampaignMap();return;}
 activeCampaign.commander.nodeId=id;activeCampaign.commander.region=n.region;activeCampaign.commander.movement=movement-cost;
 if(army){army.nodeId=id;army.region=n.region;army.movement=movement-cost;}
 activeCampaign.lastEvent=(army?.name||activeCampaign.commander.name)+(flying&&path.length>2?" leaps over an intervening army and moves along the road network to ":" moves to ")+n.label+". "+activeCampaign.commander.movement+" movement remaining.";
 saveCampaign();renderCampaignMap();
}
function politicalOwner(region){return region?.ownerFaction||region?.politicalFactionId||FACTION_PROFILES[region?.id]?.id;}
function profileForFaction(id){return FACTION_BY_ID[id]||null;}
function campaignIsGreenskin(campaign,id){return (FACTION_BY_ID[id]?.race||campaign?.factionStates?.find(f=>f.id===id)?.race)==="greenskin";}
function campaignArmyMomentum(army){return Math.max(0,Math.min(5,Math.round(Number(army?.momentum)||0)));}
function awardGreenskinMomentum(campaign,army,amount){
 if(!army||!campaignIsGreenskin(campaign,army.owner||army.factionId))return 0;
 const before=campaignArmyMomentum(army);army.momentum=Math.max(0,Math.min(5,before+amount));
 if(amount>0)army.lastMomentumActivityTurn=campaign.turn;
 const state=campaign.factionStates?.find(f=>f.id===(army.owner||army.factionId));if(state)state.momentum=army.momentum;
 return army.momentum-before;
}
function campaignFactionStrength(campaign,id){
 const state=campaign.factionStates?.find(f=>f.id===id);
 const armies=(campaign.armies||[]).filter(a=>(a.owner||a.factionId)===id&&a.roster?.length);
 const armyPower=armies.reduce((n,a)=>n+Math.max(Number(a.points)||0,campaignArmyCost(a)),0);
 const territory=(campaign.regions||[]).filter(r=>politicalOwner(r)===id).length;
 return Math.max(1,armyPower+territory*220+Math.max(0,Number(state?.treasury)||0)*0.2);
}
function campaignFactionMomentum(campaign,id){
 const armies=(campaign.armies||[]).filter(a=>(a.owner||a.factionId)===id);
 return armies.length?Math.max(...armies.map(campaignArmyMomentum)):0;
}
function campaignAllianceKey(a,b){return [a,b].sort().join(":");}
function campaignAreAllied(campaign,a,b){return (campaign.activeAlliances||[]).includes(campaignAllianceKey(a,b));}
function establishGreenskinAlliance(campaign,a,b){
 campaign.activeAlliances=campaign.activeAlliances||[];const key=campaignAllianceKey(a,b);
 if(!campaign.activeAlliances.includes(key))campaign.activeAlliances.push(key);
 setCampaignRelation(campaign,a,b,Math.max(campaignRelation(campaign,a,b),55));setCampaignRelation(campaign,b,a,Math.max(campaignRelation(campaign,b,a),55));
}
function confederateGreenskinFaction(campaign,leaderId,absorbedId){
 const leader=campaign.factionStates.find(f=>f.id===leaderId),absorbed=campaign.factionStates.find(f=>f.id===absorbedId);
 if(!leader||!absorbed||!leader.alive||!absorbed.alive||leaderId===absorbedId)return false;
 for(const region of campaign.regions||[])if(politicalOwner(region)===absorbedId){region.ownerFaction=leaderId;region.owner=leaderId;region.politicalFactionId=leaderId;}
 for(const army of campaign.armies||[])if((army.owner||army.factionId)===absorbedId){army.owner=leaderId;army.factionId=leaderId;army.id=leaderId+"-warband-"+String(campaign.turn||1)+"-"+String(campaign.armies.indexOf(army));}
 leader.treasury=Math.max(0,Number(leader.treasury)||0)+Math.max(0,Number(absorbed.treasury)||0);
 absorbed.treasury=0;absorbed.alive=false;absorbed.confederatedInto=leaderId;
 campaign.activeAlliances=(campaign.activeAlliances||[]).filter(k=>!k.split(":").includes(absorbedId));
 campaign.lastEvent=(campaign.lastEvent?campaign.lastEvent+" ":"")+absorbed.name+" joins "+leader.name+" in a Greenskin confederation; its settlements, treasury and surviving armies pass to the dominant warboss.";
 return true;
}
function updateGreenskinDiplomacy(campaign){
 const greens=(campaign.factionStates||[]).filter(f=>f.alive&&f.race==="greenskin");
 for(const a of greens)for(const b of greens){
  if(a.id===b.id)continue;
  const strengthA=campaignFactionStrength(campaign,a.id),strengthB=campaignFactionStrength(campaign,b.id);
  const relative=Math.max(-25,Math.min(35,Math.round(Math.log(strengthB/strengthA)*25)));
  const momentumEffect=Math.max(-30,Math.min(40,(campaignFactionMomentum(campaign,b.id)-campaignFactionMomentum(campaign,a.id))*8));
  const target=Math.max(-85,Math.min(90,baseFactionRelation(a.id,b.id)+relative+momentumEffect));
  const current=campaignRelation(campaign,a.id,b.id);setCampaignRelation(campaign,a.id,b.id,current+Math.max(-8,Math.min(8,target-current)));
 }
 for(const small of greens)for(const large of greens){
  if(small.id===large.id||!small.alive||!large.alive|| (campaign.activeWars||[]).includes(campaignWarKey(small.id,large.id)))continue;
  const smallPower=campaignFactionStrength(campaign,small.id),largePower=campaignFactionStrength(campaign,large.id);
  const relation=campaignRelation(campaign,small.id,large.id),momentum=campaignFactionMomentum(campaign,large.id);
  if(largePower<smallPower*1.35||momentum<2||relation<35)continue;
  if(relation>=65&&largePower>=smallPower*1.8&&momentum>=4){
   if(Math.random()<0.22&&confederateGreenskinFaction(campaign,large.id,small.id))break;
  }else if(relation>=48&&!campaignAreAllied(campaign,small.id,large.id)&&Math.random()<0.2){
   establishGreenskinAlliance(campaign,small.id,large.id);
   campaign.lastEvent=(campaign.lastEvent?campaign.lastEvent+" ":"")+small.name+" allies with "+large.name+", the rising Greenskin power.";
  }
 }
}
function baseFactionRelation(a,b){
 const pa=profileForFaction(a),pb=profileForFaction(b);
 if(!pa||!pb)return 0;
 return (RACES[pa.race]?.attitudes?.[pb.race]??0)+(pa.race===pb.race?10:0);
}
function campaignRelation(campaign,a,b){
 const explicit=campaign.diplomacy?.[a]?.[b];
 if(Number.isFinite(explicit))return explicit;
 return baseFactionRelation(a,b);
}
function setCampaignRelation(campaign,a,b,value){
 campaign.diplomacy=campaign.diplomacy||{};
 campaign.diplomacy[a]=campaign.diplomacy[a]||{};
 campaign.diplomacy[a][b]=Math.max(-100,Math.min(100,Math.round(value)));
}
function campaignWarKey(a,b){return [a,b].sort().join(":");}
function declareCampaignWar(campaign,attackerId,defenderId){
 campaign.activeWars=campaign.activeWars||[];
 const key=campaignWarKey(attackerId,defenderId);
 if(campaign.activeWars.includes(key))return false;
 campaign.activeWars.push(key);
 setCampaignRelation(campaign,attackerId,defenderId,campaignRelation(campaign,attackerId,defenderId)-25);
 setCampaignRelation(campaign,defenderId,attackerId,campaignRelation(campaign,defenderId,attackerId)-25);
 for(const third of campaign.factionStates||[]){
  if(third.id===attackerId||third.id===defenderId)continue;
  const likesDefender=campaignRelation(campaign,third.id,defenderId);
  const dislikesAttacker=campaignRelation(campaign,third.id,attackerId)<=-25;
  if(likesDefender>=10)setCampaignRelation(campaign,third.id,attackerId,campaignRelation(campaign,third.id,attackerId)-12);
  if(dislikesAttacker)setCampaignRelation(campaign,third.id,defenderId,campaignRelation(campaign,third.id,defenderId)+6);
  if(campaignRelation(campaign,defenderId,third.id)>=10)setCampaignRelation(campaign,defenderId,third.id,campaignRelation(campaign,defenderId,third.id)+3);
 }
 campaign.lastEvent=(campaign.factionStates.find(f=>f.id===attackerId)?.name||attackerId)+" declares war on "+(campaign.factionStates.find(f=>f.id===defenderId)?.name||defenderId)+". Diplomatic relations shift across the realms.";
 return true;
}
function updatePeaceAndWarRelations(campaign){
 const states=campaign.factionStates||[],wars=new Set(campaign.activeWars||[]);
 for(const a of states)for(const b of states){
  if(a.id===b.id)continue;
  const atWar=wars.has(campaignWarKey(a.id,b.id)),current=campaignRelation(campaign,a.id,b.id);
  if(atWar)setCampaignRelation(campaign,a.id,b.id,current-3);
  else setCampaignRelation(campaign,a.id,b.id,Math.min(60,current+1));
 }
}
function renderDiplomacy(){
 const host=byId("grand-campaign-diplomacy");if(!host||!activeCampaign)return;
 const playerId=activeCampaign.playerPoliticalFaction,wars=new Set(activeCampaign.activeWars||[]);
 const rows=(activeCampaign.factionStates||[]).filter(f=>f.id!==playerId).map(f=>{
  const score=campaignRelation(activeCampaign,playerId,f.id),war=wars.has(campaignWarKey(playerId,f.id)),allied=campaignAreAllied(activeCampaign,playerId,f.id);
  const label=war?"War":allied?"Allied":score>=35?"Friendly":score>=10?"Cordial":score<=-50?"Hostile":score<=-20?"Strained":"Neutral";
  const colour=war||score<=-50?"#d66b63":score>=35?"#83c58d":score<=-20?"#d6ad65":"#b9c4d0";
  return '<div class="grand-diplomacy-row"><span>'+f.name+'</span><b style="color:'+colour+'">'+label+' · '+(score>0?"+":"")+score+'</b></div>';
 }).join("");
 const playerArmy=(activeCampaign.armies||[]).find(a=>(a.owner||a.factionId)===playerId&&a.roster?.length);
 const momentumNote=campaignIsGreenskin(activeCampaign,playerId)?' <p class="grand-diplomacy-hint">Greenskin momentum: '+campaignArmyMomentum(playerArmy)+'/5. Victories and captures build it; inactivity erodes it. Strong, successful warbosses attract allies and confederations.</p>':"";
 host.innerHTML='<h3>Diplomacy</h3><p class="grand-diplomacy-hint">Greenskin relations respond to relative strength and momentum. Alliances prevent attacks; confederation transfers existing settlements and armies.</p>'+momentumNote+rows;
}
function factionArmy(campaign,id){
 let army=campaign.armies.find(a=>a.owner===id||a.factionId===id||a.id===id+"-main");
 const state=campaign.factionStates.find(f=>f.id===id),isPlayer=id===campaign.playerPoliticalFaction;
 if(!army){if(!state)return null;const generated=createCampaignArmyRoster(id,Math.max(100,state.armyPoints||500),{player:isPlayer,commander:isPlayer?campaign.commander:null});army={id:id+"-main",owner:id,factionId:id,rosterFaction:generated.faction,roster:generated.roster,region:state.homeRegion,nodeId:"city-"+state.homeRegion,points:generated.points};campaign.armies.push(army);}
 if(!Array.isArray(army.roster)){const generated=createCampaignArmyRoster(id,Math.max(100,army.points||state?.armyPoints||500),{player:isPlayer,commander:isPlayer?campaign.commander:null});army.rosterFaction=generated.faction;army.roster=generated.roster;army.points=generated.points;}
 army.owner=id;army.factionId=id;return army;
}
function applyStrategicArmyLosses(army,remainingFraction){
 if(!army)return;
 for(const unit of army.roster||[]){
  const models=Math.max(0,Number(unit.models)||0);
  if(models<=1){
   if(models===1&&remainingFraction<.6&&Math.random()>(remainingFraction+.2))unit.models=0;
  }else unit.models=Math.max(0,Math.round(models*remainingFraction));
 }
 army.roster=(army.roster||[]).filter(u=>u.models>0);
 army.points=campaignArmyCost(army);
}
function resolveStrategicBattle(campaign,attacker,defender,target){
 const attacking=factionArmy(campaign,attacker.id),defending=factionArmy(campaign,defender.id);
 if(attacking)attacking.foughtThisTurn=true;if(defending)defending.foughtThisTurn=true;
 const defenderRegion=campaign.regions.find(r=>r.id===target.id);
 const fort=defenderRegion?.settlement?.fortification;
 const defenceBonus=fort?Math.max(0,Math.min(0.35,(fort.condition||0)/300)):0;
 const attackPower=Math.max(1,attacking?.points||100)*(.8+Math.random()*.4);
 const defencePower=Math.max(1,defending?.points||250)*(.8+Math.random()*.4)*(1+defenceBonus);
 const winner=attackPower>=defencePower?attacker:defender,loser=winner===attacker?defender:attacker;
 awardGreenskinMomentum(campaign,factionArmy(campaign,winner.id),2);
 awardGreenskinMomentum(campaign,factionArmy(campaign,loser.id),-2);
 const winArmy=factionArmy(campaign,winner.id),loseArmy=factionArmy(campaign,loser.id);
 applyStrategicArmyLosses(winArmy,winner===attacker?.72:.82);
 applyStrategicArmyLosses(loseArmy,winner===attacker?.42:.55);
 for(const state of campaign.factionStates){const army=state.id===winner.id?winArmy:state.id===loser.id?loseArmy:null;if(army){state.armyPoints=army.points;state.roster=army.roster;if(!army.roster.length)state.alive=false;}}
 if(winner===attacker){
  const result=resolveGrandCampaignConquest(campaign,target.id,attacker.id);
  if(attacking){attacking.region=target.id;attacking.nodeId="city-"+target.id;}
  campaign.lastEvent=attacker.name+" defeats "+defender.name+" at "+target.name+" and captures the settlement. "+result.summary;
 }else{
  if(attacking){attacking.region=attacker.homeRegion;attacking.nodeId="city-"+attacker.homeRegion;}
  campaign.lastEvent=defender.name+" repels "+attacker.name+" at "+target.name+". Both armies suffer losses.";
 }
}

const CAMPAIGN_CHARACTER_TYPES=new Set(["captain","lord","magehero","magelord","starwardenlord","goblinshaman","goblingreatshaman","orcshaman","orcgreatshaman","legendarylord","shadowelf","pegasuschampion","rifleman","captainweiss","dwarfcaptain","dwarflord","dwarfkinghaldric","goblinhero","goblinlord","orchero","orclord"]);
function campaignArmyBattleUnits(army){
 try{
  const built=createUnitsFromArmy(army.roster||[],army.rosterFaction||rosterFactionForPoliticalFaction(army.owner||army.factionId));
  return (army.roster||[]).map((config,index)=>({config,unit:built["p"+(index+1)],index})).filter(x=>x.unit&&Number(x.config.models)>0);
 }catch{return (army.roster||[]).filter(u=>Number(u.models)>0).map((config,index)=>({config,unit:{name:config.type,stats:{WS:3,BS:3,S:3,T:3,I:3,Ld:5,A:1,W:1},weapon:config.weapon||"handWeapon",hasRangedWeapon:!!config.rangedWeapon,rangedWeapon:config.rangedWeapon,rangedStrength:3,armour:"none",models:config.models,isCharacter:CAMPAIGN_CHARACTER_TYPES.has(String(config.type||"").toLowerCase())},index}));}
}
function campaignArmyLeadership(army){
 return Math.max(0,...campaignArmyBattleUnits(army).map(x=>Number(x.unit.stats?.Ld)||0));
}
function campaignPathCost(campaign,path){
 let cost=0;for(let i=1;i<(path||[]).length;i++){const next=campaign.graph.nodes[path[i]],edge=(campaign.graph.edges[path[i-1]]||[]).find(e=>e.to===path[i]);cost+=(edge?.cost||1)+nodeCost(next)-1;}return cost;
}
function campaignArmyAtNode(campaign,nodeId,except=null){
 return (campaign.armies||[]).filter(a=>a!==except&&a.roster?.length&&(a.nodeId||("city-"+a.region))===nodeId);
}
function campaignGreenskinTargets(campaign,army){
 const own=army.owner||army.factionId,targets=[],seen=new Set();
 const add=(owner,nodeId,region=null,targetArmy=null)=>{
  if(!owner||(!targetArmy&&owner===own)||!campaign.factionStates.some(f=>f.id===owner&&f.alive))return;
  const key=targetArmy?"army:"+targetArmy.id:"city:"+region?.id;
  if(!nodeId||!campaign.graph?.nodes?.[nodeId]||seen.has(key))return;
  const path=campaignMovementPath(campaign,army.nodeId||("city-"+army.region),nodeId);if(!path)return;
  const state=campaign.factionStates.find(f=>f.id===owner),race=state?.race||FACTION_BY_ID[owner]?.race||"human";
  if(campaignAreAllied(campaign,own,owner))return;
  const priority=owner===own?2:race!=="greenskin"?0:1;
  targets.push({owner,nodeId,region,targetArmy,path,cost:campaignPathCost(campaign,path),priority});
  seen.add(key);
 };
 for(const enemy of campaign.armies||[]){
  if(enemy===army||!enemy.roster?.length)continue;
  add(enemy.owner||enemy.factionId,enemy.nodeId||("city-"+enemy.region),campaign.regions.find(r=>r.id===enemy.region)||null,enemy);
 }
 for(const region of campaign.regions||[]){
  const owner=politicalOwner(region);if(!owner||owner===own)continue;
  const cityNode="city-"+region.id;
  if(!campaign.graph.nodes[cityNode])continue;
  add(owner,cityNode,region,null);
 }
 return targets;
}
function campaignRandomChoice(items){return items[Math.floor(Math.random()*items.length)]||null;}
function campaignAttackStrength(unit,mode){
 const config=unit.config,u=unit.unit;
 if(mode==="ranged")return Number(u.rangedStrength)||3;
 const weapon=config.weapon||u.weapon||"handWeapon",greatWeapon=weapon==="greatWeapon"||(config.meleeWeapons||[]).includes("greatWeapon");
 return Math.max(1,(Number(u.stats?.S)||3)+(greatWeapon?2:weapon==="halberd"?1:0));
}
function campaignHitTarget(ws,defenderWs){if(ws>defenderWs)return 3;if(defenderWs>ws*2)return 5;return 4;}
function campaignWoundTarget(strength,toughness){if(strength>=toughness*2)return 2;if(strength>toughness)return 3;if(strength===toughness)return 4;if(strength*2>toughness)return 5;if(strength*2===toughness)return 6;return null;}
function campaignSaveTarget(defender,strength,armourPiercing=0){
 const type=defender.armour||(defender.lightArmour?"light":"none");
 const base=defender.magicSuppressed&&defender.magicArmour?5:(defender.intrinsicArmourSave||(type==="fullPlate"?4:type==="heavy"?5:type==="light"?6:(defender.shield||defender.barding?7:0)));
 if(!base)return null;
 return base+Math.max(0,strength-3)+Math.max(0,armourPiercing)-(defender.shield?1:0)-(defender.mountStats&&!defender.isChariot?1:0)-(defender.barding?1:0)-(defender.crewArmourBonus||0);
}
function campaignAnimosityAttack(attacker,target,mode){
 const au=attacker.unit,tu=target.unit,as=au.stats||{},ts=tu.stats||{};
 const hitRoll=1+Math.floor(Math.random()*6);
 const hitNeed=mode==="ranged"?Math.max(2,7-Math.min(Number(as.BS)||3,Number(au.bsCap)||6)):campaignHitTarget(Number(as.WS)||3,Number(ts.WS)||3);
 if(hitRoll<hitNeed)return {attacker,target,mode,hit:false,reason:"miss"};
 const strength=campaignAttackStrength(attacker,mode),woundRoll=1+Math.floor(Math.random()*6),woundNeed=campaignWoundTarget(strength,Number(ts.T)||3);
 if(woundNeed===null||woundRoll<woundNeed)return {attacker,target,mode,hit:true,wound:false,reason:"no wound"};
 const saveNeed=campaignSaveTarget(tu,strength,mode==="ranged"?(Number(au.armourPiercing)||0):0),saveRoll=1+Math.floor(Math.random()*6);
 if(saveNeed!==null&&saveNeed<=6&&saveRoll>=saveNeed)return {attacker,target,mode,hit:true,wound:true,saved:true};
 if(saveNeed!==null&&saveNeed<=1)return {attacker,target,mode,hit:true,wound:true,saved:true};
 return {attacker,target,mode,hit:true,wound:true,saved:false};
}
function campaignResolveSquabble(campaign,armyA,armyB=null){
 const sides=[campaignArmyBattleUnits(armyA),...(armyB?[campaignArmyBattleUnits(armyB)]:[])];
 const all=sides.flat();if(!all.length)return "The greenskins squabble, but have no units able to fight.";
 const actions=[];
 for(let sideIndex=0;sideIndex<sides.length;sideIndex++){
  const attackers=sides[sideIndex],enemies=sides.length>1?sides[1-sideIndex]:attackers;
  for(const attacker of attackers){
   if(!enemies.length)continue;
   let choices=enemies.filter(t=>t!==attacker);
   if(!choices.length)choices=enemies;
   const troopChoices=choices.filter(t=>!t.unit.isCharacter&&!CAMPAIGN_CHARACTER_TYPES.has(String(t.config.type||"").toLowerCase()));
   if(troopChoices.length)choices=troopChoices;
   const target=campaignRandomChoice(choices);if(!target)continue;
   const ranged=!!attacker.unit.hasRangedWeapon;
   const mode=ranged?"ranged":"melee",weapon=attacker.config.weapon||attacker.unit.weapon,greatWeapon=weapon==="greatWeapon"||(attacker.config.meleeWeapons||[]).includes("greatWeapon");
   const initiative=(Number(attacker.unit.stats?.I)||0)*10-(greatWeapon?10:0);
   actions.push({attacker,target,mode,initiative});
  }
 }
 actions.sort((a,b)=>b.initiative-a.initiative);
 const results=[];
 for(let i=0;i<actions.length;){
  let j=i+1;while(j<actions.length&&actions[j].initiative===actions[i].initiative)j++;
  const tier=actions.slice(i,j),resolved=tier.map(a=>campaignAnimosityAttack(a.attacker,a.target,a.mode));
  const wounds=new Map();
  for(const r of resolved)if(r.wound&&!r.saved)wounds.set(r.target,(wounds.get(r.target)||0)+1);
  for(const [target,count] of wounds){
   const c=target.config,character=target.unit.isCharacter||CAMPAIGN_CHARACTER_TYPES.has(String(c.type||"").toLowerCase());
   if(character){const totalWounds=Math.max(1,Number(target.unit.stats?.W)||1),prior=Number(c.currentWounds)||totalWounds;c.currentWounds=prior-count;if(c.currentWounds<=0)c.models=0;}
   else c.models=Math.max(0,(Number(c.models)||1)-count);
  }
  results.push(...resolved);i=j;
 }
 for(const a of sides)for(const x of a)x.config.models=Math.max(0,Number(x.config.models)||0);
 for(const army of [armyA,armyB].filter(Boolean)){
  army.roster=(army.roster||[]).filter(u=>Number(u.models)>0);army.points=campaignArmyCost(army);
  army.foughtThisTurn=true;
  const state=campaign.factionStates.find(f=>f.id===(army.owner||army.factionId));if(state){state.roster=army.roster;state.armyPoints=army.points;if(!army.roster.length)state.alive=false;}
 }
 const hits=results.filter(r=>r.wound&&!r.saved).length;
 return "Squabble: "+results.length+" attacks are resolved in initiative order; "+hits+" wound(s) get through armour.";
}
function launchCampaignFieldBattle(attackingArmy,defendingArmy){
 if(!activeCampaign||!attackingArmy?.roster?.length||!defendingArmy?.roster?.length||typeof window.startPoliticalCampaignBattle!=="function")return false;
 const attackerId=attackingArmy.owner||attackingArmy.factionId,defenderId=defendingArmy.owner||defendingArmy.factionId;
 declareCampaignWar(activeCampaign,attackerId,defenderId);
 const attackerFaction=attackingArmy.rosterFaction||rosterFactionForPoliticalFaction(attackerId),defenderFaction=defendingArmy.rosterFaction||rosterFactionForPoliticalFaction(defenderId);
 const targetNode=defendingArmy.nodeId||"city-"+defendingArmy.region;
 const started=window.startPoliticalCampaignBattle({army:attackingArmy.roster,faction:attackerFaction,enemyArmy:defendingArmy.roster,enemyFaction:defenderFaction,onComplete:result=>{
  attackingArmy.foughtThisTurn=true;defendingArmy.foughtThisTurn=true;
  const update=(army,units,faction)=>{army.roster=army.roster.map((config,i)=>({...config,models:Math.max(0,units[i]?.models??0),currentDamage:units[i]?.damage||0,currentWounds:units[i]?.characterWounds})).filter(config=>config.models>0);army.points=Math.max(0,Math.round(army.roster.reduce((sum,u)=>sum+unitCost(u,faction),0)));};
  update(attackingArmy,result.playerUnits||[],attackerFaction);update(defendingArmy,result.enemyUnits||[],defenderFaction);
  const winner=result.won?attackingArmy:defendingArmy,loser=result.won?defendingArmy:attackingArmy;
  awardGreenskinMomentum(activeCampaign,winner,2);
  awardGreenskinMomentum(activeCampaign,loser,-2);
  if(result.won){winner.nodeId=targetNode;winner.region=activeCampaign.graph.nodes[targetNode]?.region??defendingArmy.region;}
  const loserState=activeCampaign.factionStates.find(f=>f.id===(loser.owner||loser.factionId)),home=loserState?.homeRegion||loser.region;
  loser.nodeId="city-"+home;loser.region=home;
  for(const army of [attackingArmy,defendingArmy]){const state=activeCampaign.factionStates.find(f=>f.id===(army.owner||army.factionId));if(state){state.roster=army.roster;state.armyPoints=army.points;if(!army.roster.length)state.alive=false;}}
  activeCampaign.lastEvent=result.won?"Greenskin animosity attack wins a field battle. The defeated army retreats.":"Greenskin animosity attack is repelled. The attacking army retreats.";
  saveCampaign();byId("grand-campaign-screen").hidden=false;byId("grand-campaign-setup").hidden=true;byId("grand-campaign-world").hidden=false;renderCampaignMap();
 }});
 if(!started){activeCampaign.lastEvent="The tactical field battle could not be started.";renderCampaignMap();return false;}
 return true;
}

function campaignStrategicFieldBattle(campaign,attackerArmy,defenderArmy){
 const attackerId=attackerArmy.owner||attackerArmy.factionId,defenderId=defenderArmy.owner||defenderArmy.factionId;
 const attacker=campaign.factionStates.find(f=>f.id===attackerId)||{id:attackerId,name:attackerId,homeRegion:attackerArmy.region};
 const defender=campaign.factionStates.find(f=>f.id===defenderId)||{id:defenderId,name:defenderId,homeRegion:defenderArmy.region};
 const attackPower=Math.max(1,attackerArmy.points||campaignArmyCost(attackerArmy)||100)*(.8+Math.random()*.4);
 const defencePower=Math.max(1,defenderArmy.points||campaignArmyCost(defenderArmy)||100)*(.8+Math.random()*.4);
 const winner=attackPower>=defencePower?attackerArmy:defenderArmy,loser=winner===attackerArmy?defenderArmy:attackerArmy;
 applyStrategicArmyLosses(winner,.72);applyStrategicArmyLosses(loser,.42);
 for(const army of [attackerArmy,defenderArmy]){army.foughtThisTurn=true;const state=campaign.factionStates.find(f=>f.id===(army.owner||army.factionId));if(state){state.armyPoints=army.points;state.roster=army.roster;if(!army.roster.length)state.alive=false;}}
 const loserOwner=loser.owner||loser.factionId,loserState=campaign.factionStates.find(f=>f.id===loserOwner),home=loserState?.homeRegion||loser.region;
 loser.region=home;loser.nodeId="city-"+home;
 campaign.lastEvent=(winner.owner||winner.factionId)===attackerId?attacker.name+" defeats "+defender.name+" in a field battle.":" "+defender.name+" repels "+attacker.name+" in a field battle.";
 return campaign.lastEvent.trim();
}
function updateGreenskinBoredom(campaign,army){
 if(!army||campaignArmyRace(army,campaign)!=="greenskin"||!army.roster?.length)return;
 if(army.lastBoredomUpdateTurn===campaign.turn)return;
 army.boredom=Math.max(-4,Math.min(10,Number.isFinite(army.boredom)?army.boredom:-4));
 army.boredom=Math.max(-4,Math.min(10,army.boredom+(army.foughtThisTurn?-3:1)));
 army.foughtThisTurn=false;
 army.lastBoredomUpdateTurn=campaign.turn;
}
function processGreenskinAnimosity(campaign,army){
 if(!army||campaignArmyRace(army,campaign)!=="greenskin"||!army.roster?.length)return {interrupted:false,message:""};
 army.boredom=Math.max(-4,Math.min(10,Number.isFinite(army.boredom)?army.boredom:-4));
 const built=campaignArmyBattleUnits(army),leadership=Math.max(0,...built.map(x=>Number(x.unit.stats?.Ld)||0));
 const dice=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)],total=dice[0]+dice[1],target=leadership-army.boredom;
 const passed=total===2||(total!==12&&total<=target);
 army.lastAnimosityTurn=campaign.turn;
 if(passed)return {interrupted:false,message:(army.name||campaign.factionStates.find(f=>f.id===(army.owner||army.factionId))?.name||"Greenskin army")+" passes its animosity test ("+dice.join("+")+"="+total+"; Ld "+leadership+", boredom "+army.boredom+")."};
 const result=1+Math.floor(Math.random()*6),name=army.name||campaign.factionStates.find(f=>f.id===(army.owner||army.factionId))?.name||"Greenskin army";
 if(result<=2){army.movement=0;return {interrupted:true,message:name+" bickers ("+dice.join("+")+"="+total+", animosity roll "+result+") and does nothing this turn."};}
 if(result<=4){
  army.movement=0;
  const message=campaignResolveSquabble(campaign,army);
  return {interrupted:true,message:name+" squabbles ("+dice.join("+")+"="+total+", animosity roll "+result+"). "+message};
 }
 const targets=campaignGreenskinTargets(campaign,army).filter(t=>t.owner!==(army.owner||army.factionId));
 if(!targets.length)return {interrupted:true,message:name+" wants to attack, but no enemy army or settlement is reachable on the campaign map."};
 targets.sort((a,b)=>a.priority-b.priority||a.cost-b.cost);
 const bestPriority=targets[0].priority,bestCost=targets[0].cost;
 const tied=targets.filter(t=>t.priority===bestPriority&&t.cost===bestCost),choice=campaignRandomChoice(tied);
 const movement=Math.max(0,Number(army.movement)||0);
 if(choice.cost<=movement){
  const own=army.owner||army.factionId;
  if(choice.owner===own){
   const other=choice.targetArmy||campaignArmyAtNode(campaign,choice.nodeId,army)[0];
   if(!other)return {interrupted:true,message:name+" turns on its own forces, but finds no opposing army to fight."};
   return {interrupted:true,message:name+" turns on its own troops! "+campaignResolveSquabble(campaign,army,other)};
  }
  declareCampaignWar(campaign,own,choice.owner);
  const targetRegion=choice.region||campaign.regions.find(r=>r.id===choice.nodeId.replace("city-","")||"city-"+r.id===choice.nodeId);
  if(targetRegion&&choice.nodeId==="city-"+targetRegion.id){
   const defender=factionArmy(campaign,choice.owner);
   if(defender){
    if(own===campaign.playerPoliticalFaction)return {interrupted:true,battleRegion:targetRegion,battleArmy:army,message:name+" attacks "+targetRegion.name+" after failing animosity. A battle is required."};
    army.nodeId=choice.nodeId;army.region=targetRegion.id;resolveStrategicBattle(campaign,campaign.factionStates.find(f=>f.id===own)||{id:own,name},campaign.factionStates.find(f=>f.id===choice.owner)||{id:choice.owner,name:choice.owner},targetRegion);army.foughtThisTurn=true;defender.foughtThisTurn=true;return {interrupted:true,message:name+" attacks "+targetRegion.name+" after failing animosity. "+campaign.lastEvent};
   }
  }
  const defender=choice.targetArmy||campaignArmyAtNode(campaign,choice.nodeId,army)[0];
  if(defender){if(own===campaign.playerPoliticalFaction)return {interrupted:true,fieldBattle:true,battleArmies:[army,defender],message:name+" attacks "+(campaign.factionStates.find(f=>f.id===(defender.owner||defender.factionId))?.name||"an enemy army")+". A tactical field battle is required."};const msg=campaignStrategicFieldBattle(campaign,army,defender);return {interrupted:true,message:name+" attacks "+(campaign.factionStates.find(f=>f.id===(defender.owner||defender.factionId))?.name||"an enemy army")+". "+msg};}
  return {interrupted:true,message:name+" attacks "+(campaign.factionStates.find(f=>f.id===choice.owner)?.name||choice.owner)+", but no defending army is available."};
 }
 const path=choice.path;let spent=0,last=path[0];
 for(let i=1;i<path.length;i++){const stepCost=campaignPathCost(campaign,path.slice(i-1,i+1));if(spent+stepCost>movement)break;spent+=stepCost;last=path[i];}
 if(last!==army.nodeId){army.nodeId=last;army.region=campaign.graph.nodes[last]?.region??army.region;army.movement=Math.max(0,movement-spent);}
 return {interrupted:true,message:name+" attacks! It cannot reach "+(choice.region?.name||choice.targetArmy?.name||choice.nodeId)+" this turn, so it advances "+(last===army.nodeId?"towards its target.":"along the roads towards its target.")};
}

function runAIFactionTurn(campaign,faction){
 const factionArmies=(campaign.armies||[]).filter(a=>(a.owner||a.factionId)===faction.id&&a.roster?.length);
 const army=factionArmy(campaign,faction.id);if(!army)return faction.name+" had no field army.";
 if(!factionArmies.includes(army))factionArmies.unshift(army);
 for(const fieldArmy of factionArmies){fieldArmy.movement=campaignArmyMovementProfile(fieldArmy,campaign).points;const animosity=processGreenskinAnimosity(campaign,fieldArmy);if(animosity.interrupted){faction.armyPoints=fieldArmy.points;faction.roster=fieldArmy.roster;return animosity.message;}}
 growFactionRecruitment(campaign,faction);
 const owned=campaign.regions.filter(r=>politicalOwner(r)===faction.id);
 faction.income=owned.reduce((sum,r)=>sum+campaignCityIncome(r),0);
 faction.turnsTaken=(faction.turnsTaken||0)+1;
 faction.upkeep=campaignArmyUpkeep(army);
 faction.treasury=Math.max(0,(faction.treasury||0)+faction.income-faction.upkeep);
 const recruitBudget=Math.min(Math.max(0,faction.treasury-100),Math.max(0,Math.floor(faction.income*.35)));
 const recruitment=recruitArmyModels(army,army.rosterFaction||rosterFactionForPoliticalFaction(faction.id),recruitBudget,campaign,faction);
 faction.treasury=Math.max(0,faction.treasury-recruitment.spent);
 faction.armyPoints=army.points;faction.roster=army.roster;
 const region=campaign.regions.find(r=>r.id===army.region)||campaign.regions.find(r=>r.id===faction.homeRegion);
 if(!region)return faction.name+" could not locate its army.";
 const candidates=(region.neighbors||[]).map(id=>campaign.regions.find(r=>r.id===id)).filter(Boolean);
 const hostile=candidates.filter(r=>politicalOwner(r)!==faction.id&&!campaignAreAllied(campaign,faction.id,politicalOwner(r))).map(r=>({region:r,owner:campaign.factionStates.find(x=>x.id===politicalOwner(r))})).filter(x=>x.owner?.alive);
 if(!hostile.length)return faction.name+" earns "+faction.income+", pays "+faction.upkeep+" upkeep and recruits "+recruitment.added+" models.";
 hostile.sort((a,b)=>{
  const av=campaignRelation(campaign,faction.id,a.owner.id),bv=campaignRelation(campaign,faction.id,b.owner.id);
  return av-bv||(a.region.settlement?.prosperity||0)-(b.region.settlement?.prosperity||0);
 });
 const choice=hostile[0],enemy=choice.owner;
 let relation=campaignRelation(campaign,faction.id,enemy.id);
 const warKey=campaignWarKey(faction.id,enemy.id);
 if(!campaign.activeWars.includes(warKey)){
  const hostility=Math.max(0,Math.min(1,(15-relation)/100));
  const race=faction.race||FACTION_BY_ID[faction.id]?.race||"human";
  const attackChance=race==="dwarf"?Math.max(0.01,Math.min(0.22,0.02+hostility*0.2)):Math.max(0.05,Math.min(0.85,0.08+hostility*0.82));
  if(Math.random()<attackChance)declareCampaignWar(campaign,faction.id,enemy.id);
 }
 if(campaign.activeWars.includes(warKey)){
  const enemyArmy=factionArmy(campaign,enemy.id),race=faction.race||FACTION_BY_ID[faction.id]?.race||"human";
  if(race==="dwarf"&&enemyArmy?.region===choice.region.id&&army.points<(enemyArmy.points||0)*1.15)return faction.name+" holds its defensive line rather than attacking a stronger enemy at "+choice.region.name+".";
  army.region=choice.region.id;army.nodeId="city-"+choice.region.id;
  resolveStrategicBattle(campaign,faction,enemy,choice.region);
  return faction.name+" wages war against "+enemy.name+".";
 }
 return faction.name+" earns "+faction.income+", pays "+faction.upkeep+" upkeep and recruits "+recruitment.added+" models; relations with "+enemy.name+" are "+relation+".";
}
function endCampaignTurn(){
 if(!activeCampaign)return;
 let playerAnimosityMessage="";
 ensureSettlementState(activeCampaign);settleMonthlyPopulation(activeCampaign);
 const order=activeCampaign.factionTurnOrder||[],states=activeCampaign.factionStates||[];
 const playerId=activeCampaign.playerPoliticalFaction||FACTION_PROFILES[activeCampaign.startingRegion]?.id;
 activeCampaign.activeWars=activeCampaign.activeWars||[];
 activeCampaign.diplomacy=activeCampaign.diplomacy||{};
 for(const a of states)for(const b of states)if(a.id!==b.id&&!Number.isFinite(activeCampaign.diplomacy[a.id]?.[b.id]))setCampaignRelation(activeCampaign,a.id,b.id,baseFactionRelation(a.id,b.id));
 updatePeaceAndWarRelations(activeCampaign);
 updateGreenskinDiplomacy(activeCampaign);
 const playerIndex=order.indexOf(playerId),processed=[];
 for(let step=1;step<order.length;step++){
  const id=order[(Math.max(0,playerIndex)+step)%order.length],f=states.find(x=>x.id===id);
  if(!f||!f.alive)continue;
  processed.push(runAIFactionTurn(activeCampaign,f));
 }
 const logisticsEvents=processCampaignLogistics(activeCampaign);
 const player=states.find(f=>f.id===playerId);
 if(player){
  const owned=activeCampaign.regions.filter(r=>politicalOwner(r)===playerId);
  player.income=owned.reduce((sum,r)=>sum+campaignCityIncome(r),0);
  const armies=playerArmies();
  player.upkeep=armies.reduce((sum,a)=>sum+campaignArmyUpkeep(a),0);
  player.treasury=Math.max(0,(player.treasury||0)+player.income-player.upkeep);
  activeCampaign.treasury=player.treasury;
  syncPlayerArmyState();
  player.turnsTaken=(player.turnsTaken||0)+1;
 }
 for(const region of activeCampaign.regions||[])if(politicalOwner(region)===player.id)growSettlementRecruitment(region);
 // Momentum decays by one after a turn without a victory or conquest; boredom is tracked separately.
 for(const army of activeCampaign.armies||[]){
  if(campaignArmyRace(army,activeCampaign)==="greenskin"&&army.lastMomentumDecayTurn!==activeCampaign.turn){
   if(army.lastMomentumActivityTurn!==activeCampaign.turn)army.momentum=Math.max(0,campaignArmyMomentum(army)-1);
   army.lastMomentumDecayTurn=activeCampaign.turn;
   const state=activeCampaign.factionStates.find(f=>f.id===(army.owner||army.factionId));if(state)state.momentum=campaignArmyMomentum(army);
  }
  updateGreenskinBoredom(activeCampaign,army);
 }
 activeCampaign.turn++;activeCampaign.activeFaction=playerId;
 activeCampaign.commander.maxMovement=campaignArmyMovementProfile(selectedPlayerArmy(),activeCampaign).points;activeCampaign.commander.movement=activeCampaign.commander.maxMovement;for(const army of playerArmies())army.movement=campaignArmyMovementProfile(army,activeCampaign).points;
 const activeArmy=selectedPlayerArmy();if(activeArmy){activeCampaign.commander.nodeId=activeArmy.nodeId;activeCampaign.commander.region=activeArmy.region;activeCampaign.commander.movement=activeArmy.movement;}
 // Test Greenskin animosity at the beginning of the newly opened player turn,
 // after each player army has received its movement allowance.
 for(const playerArmy of playerArmies()){
  if(campaignArmyRace(playerArmy,activeCampaign)!=="greenskin"||playerArmy.lastAnimosityTurn===activeCampaign.turn)continue;
  const animosity=processGreenskinAnimosity(activeCampaign,playerArmy);
  if(animosity.message)playerAnimosityMessage+=(playerAnimosityMessage?" ":"")+animosity.message;
  if(animosity.battleRegion){activeCampaign.lastEvent="Turn "+activeCampaign.turn+" begins. "+animosity.message;saveCampaign();launchCampaignBattle(animosity.battleRegion,animosity.battleArmy||playerArmy);return;}
  if(animosity.fieldBattle){activeCampaign.lastEvent="Turn "+activeCampaign.turn+" begins. "+animosity.message;saveCampaign();launchCampaignFieldBattle(animosity.battleArmies[0],animosity.battleArmies[1]);return;}
  if(/ bickers /.test(animosity.message)||/ squabbles /.test(animosity.message))playerArmy.movement=0;
 }
 if(activeArmy)activeCampaign.commander.movement=activeArmy.movement;
 activeCampaign.lastEvent="Turn "+activeCampaign.turn+" begins. Cities provide income; armies cost upkeep and supplies. "+(playerAnimosityMessage?playerAnimosityMessage+" ":"")+processed.length+" AI faction turns completed. "+(logisticsEvents.slice(0,2).join(" ")+ " ") +(processed.slice(0,2).join(" ")||"The realms consolidate their positions.")+" Your movement is replenished.";
 saveCampaign();renderCampaignMap();
}
function showCampaignWorld(c){activeCampaign=c;byId("grand-campaign-setup").hidden=true;byId("grand-campaign-world").hidden=false;renderCampaignMap();}
export function startGrandCampaign(){
 window.resolveGrandCampaignConquest=resolveGrandCampaignConquest;
 try{const s=JSON.parse(localStorage.getItem("warGameGrandCampaignStart")||"null");if(s&&FACTIONS[s.faction]){selectedFaction=s.faction;if(s.politicalFactionId&&FACTION_BY_ID[s.politicalFactionId])selectedPoliticalFaction=s.politicalFactionId;if(CITIES.some(c=>c.id===s.selectedCity))selectedCity=s.selectedCity;}}catch{}
 const screen=byId("grand-campaign-screen"),menu=byId("mainmenu");if(!screen||!menu)return;
 document.addEventListener("click",event=>{const target=event.target instanceof Element?event.target.closest('[data-mode="grand"]'):null;if(!target)return;event.preventDefault();event.stopPropagation();screen.hidden=false;menu.hidden=true;let saved=null;try{saved=JSON.parse(localStorage.getItem("warGameGrandCampaignStateV1")||"null");}catch{}if(saved?.graph?.nodes&&saved?.commander)showCampaignWorld(ensureSettlementState(saved));else{byId("grand-campaign-setup").hidden=false;byId("grand-campaign-world").hidden=true;renderFaction();}},true);
 byId("grand-campaign-back").addEventListener("click",()=>{screen.hidden=true;menu.hidden=false;});byId("grand-world-back").addEventListener("click",()=>{byId("grand-campaign-world").hidden=true;byId("grand-campaign-setup").hidden=false;renderFaction();});byId("grand-world-menu").addEventListener("click",()=>{screen.hidden=true;menu.hidden=false;});byId("grand-campaign-end-turn").addEventListener("click",endCampaignTurn);
 byId("grand-faction-choices").querySelectorAll("[data-faction]").forEach(b=>b.addEventListener("click",()=>{selectedFaction=b.dataset.faction;ensureValidCity();renderFaction();saveSelection();}));
 byId("grand-world-map").querySelectorAll(".grand-city").forEach(m=>{const select=()=>{const c=CITIES.find(x=>x.id===Number(m.dataset.city));if(!c)return;selectedPoliticalFaction=FACTION_PROFILES[c.id]?.id||selectedPoliticalFaction;selectedFaction=c.faction;selectedCity=c.id;saveSelection();renderFaction();};m.addEventListener("click",select);m.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select();}});});
 byId("grand-campaign-begin").addEventListener("click",()=>{const f=FACTIONS[selectedFaction],city=CITIES.find(c=>c.id===selectedCity),commander=commanderForPoliticalFaction(selectedPoliticalFaction);if(!city||city.id!==Number(Object.keys(FACTION_PROFILES).find(id=>FACTION_PROFILES[id].id===selectedPoliticalFaction))||!commander)return;const campaign=createInitialCampaignState(selectedFaction,city,commander);try{localStorage.setItem("warGameGrandCampaignStart",JSON.stringify({schemaVersion:5,mapId:MAP_ID,faction:selectedFaction,politicalFactionId:selectedPoliticalFaction,selectedCity,startingRegion:city.name,commander}));localStorage.setItem("warGameGrandCampaignStateV1",JSON.stringify(campaign));}catch{}showCampaignWorld(campaign);});
}
