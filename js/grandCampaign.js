import { getCollectionSnapshot } from "./collection.js?v=20261020-wood-elf-v1";
import { unitCost, createUnitsFromArmy } from "./units.js?v=20261020-grinhold-battle-fix-v1";
let lastCampaignNodeTap = null;
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
 23:{id:"ashenCouncil",name:"The Ashen Council",race:"human",colours:{main:"#68645B",accent:"#B66A35"},emblem:"gate"},
 24:{id:"deepflame",name:"Thaurgath the Rune-Eater",race:"dragon",passive:true,colours:{main:"#493A59",accent:"#D7A94D"},emblem:"dragon"},
 25:{id:"eastwatch",name:"Eastwatch Harbour Council",race:"human",colours:{main:"#456B79",accent:"#D9C48A"},emblem:"tower"},
 26:{id:"pirateFreehold",name:"The Freebooters' Haven",race:"human",colours:{main:"#5C4635",accent:"#D8B56D"},emblem:"skull"},
 27:{id:"corsairHaven",name:"The Black Flag Corsairs",race:"human",colours:{main:"#343C48",accent:"#C7D1D9"},emblem:"crossed-swords"}
};
const FACTION_BY_ID = Object.fromEntries(Object.values(FACTION_PROFILES).map(f=>[f.id,f]));

const FACTION_ROSTER_OVERRIDES={
 valedorn:{roster:"empire",units:["swordsmen","archers","captain","cavalry"]},
 merrow:{roster:"empire",units:["swordsmen","archers","cavalry","cannon"]},
 kest:{roster:"empire",units:["swordsmen","cavalry","archers","captain"]},
 vane:{roster:"empire",units:["swordsmen","archers","cannon","captain"]},
 caedmon:{roster:"empire",units:["swordsmen","cavalry","cannon","archers"]},
 verdantCourt:{roster:"highElves",units:["archers","archers","cavalry","swordsmen","captain"]},
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
 paleRegent:{roster:"undead",units:["skeletons","zombies","skeletons","necromancer"]},
 fenCourt:{roster:"undead",units:["skeletons","zombies","skeletons","necromancer"]},
 ashenSepulchre:{roster:"undead",units:["skeletons","zombies","skeletons","masterNecromancer"]},
 blackthorn:{roster:"empire",units:["swordsmen","archers","cavalry","captain"]},
 ironMarshal:{roster:"empire",units:["swordsmen","cannon","archers","captain"]},
 varkesh:{roster:"empire",units:["swordsmen","cavalry","archers","lord"]},
 ashenCouncil:{roster:"empire",units:["swordsmen","archers","cannon","captain"]},
 pirateFreehold:{roster:"empire",units:["swordsmen","firearmInfantry","rifleman","cannon","captain"]},
 corsairHaven:{roster:"empire",units:["swordsmen","firearmInfantry","rifleman","cannon","captain"]}
};
function rosterFactionForPoliticalFaction(id){
 const profile=FACTION_BY_ID[id];return FACTION_ROSTER_OVERRIDES[id]?.roster||RACES[profile?.race]?.defaultRoster||"empire";
}
function collectionModels(){try{return (getCollectionSnapshot()?.models||[]).filter(m=>m&&typeof m==="object");}catch{return [];}}
function undeadCampaignCaster(unit){
 return ["necromancer","masterNecromancer","vampireHero","vampireLord"].includes(String(unit?.type||""));
}
function undeadArmyHasCaster(army){return (army?.roster||[]).some(undeadCampaignCaster);}
function collapseCasterlessUndeadArmy(army,campaign=activeCampaign){
 if(!army||campaignArmyRace(army,campaign)!=="undead"||!army.roster?.length||undeadArmyHasCaster(army))return false;
 const lost=army.roster.reduce((n,u)=>n+Math.max(0,Number(u.models)||0),0);
 army.roster=[];army.points=0;army.necromancyReserve={};army.collapsedByNecromanticLoss=true;
 return lost>0;
}
function necromancyProfile(config){
 const type=String(config?.type||"");
 if(["cavalry","wolfRiders","boarBoyz","skeletonHorses"].includes(type)||config?.mounted||["horse","wolf","boar","skeletal_steed"].includes(config?.mountType))
  return {type:"skeletonHorses",weapon:"handWeapon",rangedWeapon:null,mounted:true,mountType:"skeletal_steed"};
 if(["dragon","youngDragon","ancientDragon","deepflameDragon","skeletonDragon"].includes(type))return {type:"skeletonDragon",weapon:"handWeapon",rangedWeapon:null};
 if(["giant","skeletonGiant"].includes(type))return {type:"skeletonGiant",weapon:"handWeapon",rangedWeapon:null};
 if(["trolls","troll","skeletonTroll"].includes(type))return {type:"skeletonTroll",weapon:"handWeapon",rangedWeapon:null};
 // Reanimated rank-and-file keep permitted kit, but not upgrades, skills or armour bonuses.
 const ranged=["bow"].includes(config?.rangedWeapon)||config?.weapon==="bow";
 const allowedMelee=["handWeapon","spear","halberd","greatWeapon"];
 const weapon=allowedMelee.includes(config?.weapon)?config.weapon:"handWeapon";
 return {type:"skeletons",weapon:ranged?"handWeapon":weapon,rangedWeapon:ranged?"bow":null};
}
function undeadModelAvailable(profile,army){
 const models=collectionModels();
 const assigned=new Set(playerArmies().flatMap(a=>(a.roster||[]).flatMap(u=>[u.machineModelId,...(u.crewModelIds||[])].filter(Boolean))));
 const type=profile.type,weapon=profile.rangedWeapon==="bow"?"bow":profile.weapon;
 const matches=u=>u.type===type&&(profile.rangedWeapon?u.rangedWeapon===profile.rangedWeapon:!u.rangedWeapon&&u.weapon===(profile.weapon||"handWeapon"));
 const deployed=playerArmies().reduce((n,a)=>n+(a.roster||[]).filter(matches).reduce((s,u)=>s+Math.max(0,Number(u.models)||0),0)+Object.values(a.necromancyReserve||{}).filter(matches).reduce((s,u)=>s+Math.max(0,Number(u.models)||0),0),0);
 return models.filter(m=>m.faction==="undead"&&m.type===type&&m.weapon===weapon&&!assigned.has(m.id)).length>deployed;
}
function undeadReserveKey(profile){return [profile.type,profile.weapon||"handWeapon",profile.rangedWeapon||""].join("|");}
function raiseBattleCasualties(army,enemyOriginal,enemySurvivors,campaign=activeCampaign){
 if(!army||campaignArmyRace(army,campaign)!=="undead"||!undeadArmyHasCaster(army))return {raised:0,reserve:0};
 const pending=army.necromancyReserve&&typeof army.necromancyReserve==="object"?army.necromancyReserve:{};
 const reserveBefore=Object.values(pending).reduce((n,v)=>n+Math.max(0,Number(v?.models)||0),0);
 let raised=0;
 (enemyOriginal||[]).forEach((lostUnit,index)=>{
  const survivors=Math.max(0,Number(enemySurvivors?.[index]?.models)||0);
  const casualties=Math.max(0,Math.floor(Number(lostUnit?.models)||0)-survivors);
  if(!casualties)return;
  for(let i=0;i<casualties;i++){
   const profile=necromancyProfile(lostUnit);
   if(!undeadModelAvailable(profile,army)||Math.random()>=0.1)continue;
   const key=undeadReserveKey(profile),existing=pending[key]||{type:profile.type,weapon:profile.weapon||"handWeapon",rangedWeapon:profile.rangedWeapon||null,mounted:!!profile.mounted,mountType:profile.mountType||"none",models:0};
   existing.models++;pending[key]=existing;raised++;
  }
 });
 army.necromancyReserve=pending;
 // Merge first, then deploy only useful groups; avoid one- and two-model units.
 for(const [key,p] of Object.entries(pending)){
  if(p.models<=0)continue;
  const matching=(army.roster||[]).find(u=>u.type===p.type&&u.weapon===(p.weapon||"handWeapon")&&(u.rangedWeapon||null)===(p.rangedWeapon||null)&&(u.models||0)<30);
  if(matching){
   const add=Math.min(p.models,30-matching.models);matching.models+=add;p.models-=add;
  }
 }
 for(const [key,p] of Object.entries(pending)){
  while(p.models>=5&&(army.roster||[]).length<6){
   const count=Math.min(30,p.models);
   if(count<5)break;
   army.roster.push({type:p.type,models:count,weapon:p.weapon||"handWeapon",meleeWeapons:p.weapon&&p.weapon!=="handWeapon"?["handWeapon",p.weapon]:["handWeapon"],...(p.rangedWeapon?{rangedWeapon:p.rangedWeapon}:{}),...(p.mounted?{mounted:true,mountType:p.mountType||"skeletal_steed"}:{}),champion:false,upgrades:{},skills:{},raisedByNecromancy:true});
   p.models-=count;
  }
  if(p.models<=0)delete pending[key];
 }
 army.necromancyReserve=pending;
 const reserveAfter=Object.values(pending).reduce((n,v)=>n+Math.max(0,Number(v?.models)||0),0);
 army.points=campaignArmyCost(army);
 return {raised,reserve:reserveAfter};
}

function campaignCharacterConfig(id,commander=null){
 const profile=FACTION_BY_ID[id],race=profile?.race||"human";
 let type=race==="dwarf"?"dwarfCaptain":race==="undead"?"necromancer":"captain",model=null;
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
 if(id==="verdantCourt"){config.woodElfStyle=true;config.shield=false;config.dualWield=true;config.weapon="handWeapon";config.meleeWeapons=["handWeapon","offhandWeapon"];config.skills={...(config.skills||{}),skirmish:true};if(model?.mounted&&model.mountType){config.mounted=true;config.mountType=model.mountType;config.barding=!!model.barding;}}
 return config;
}
function createCampaignArmyRoster(id,targetPoints=500,{player=false,commander=null}={}){
 const woodElfStyle=id==="verdantCourt";
 if(id==="deepflame"){const roster=[{type:"deepflameDragon",models:1,weapon:"handWeapon",meleeWeapons:["handWeapon"],casterLevel:4,spells:["fireBolt","nullificationDome"],champion:false,upgrades:{},skills:{}}];return {faction:"highElves",roster,points:unitCost(roster[0],"highElves"),politicalFactionId:id};}
 const faction=rosterFactionForPoliticalFaction(id),profile=FACTION_BY_ID[id],race=profile?.race||"human";
 const pirate=["pirateFreehold","corsairHaven"].includes(id);
 const basicType=race==="dwarf"?"dwarfInfantry":race==="greenskin"?"goblins":race==="undead"?"skeletons":"swordsmen",rangedType=race==="dwarf"?"dwarfInfantry":race==="greenskin"?"goblins":race==="undead"?"zombies":"archers";
 const character=campaignCharacterConfig(id,player?commander:null);
 let roster=[];
 if(pirate){
  if(player){
   const owned=collectionModels().filter(m=>m.faction===faction&&m.type==="swordsmen");
   const guns=owned.filter(m=>m.weapon==="firearm").length,deckhands=owned.filter(m=>m.weapon==="handWeapon").length;
   if(guns>=5)roster.push({type:"swordsmen",models:Math.min(30,guns),weapon:"handWeapon",meleeWeapons:["handWeapon"],rangedWeapon:"firearm",champion:false,upgrades:{}});
   if(deckhands>=5)roster.push({type:"swordsmen",models:Math.min(30,deckhands),weapon:"handWeapon",meleeWeapons:["handWeapon"],champion:false,upgrades:{}});
   if(commander)roster.push(character);
  }else{
   roster=[{type:"swordsmen",models:12,weapon:"handWeapon",meleeWeapons:["handWeapon"],rangedWeapon:"firearm",champion:false,upgrades:{},skills:{}},{type:"swordsmen",models:12,weapon:"handWeapon",meleeWeapons:["handWeapon"],rangedWeapon:"firearm",champion:false,upgrades:{},skills:{}},{type:"swordsmen",models:10,weapon:"handWeapon",meleeWeapons:["handWeapon"],champion:false,upgrades:{},skills:{}},{type:"cannon",models:3,weapon:"handWeapon",champion:false,upgrades:{}},{...character,rangedWeapon:"firearm"}];
  }
  const points=roster.reduce((sum,u)=>sum+unitCost(u,faction),0);return {faction,roster,points,politicalFactionId:id};
 }
 if(player){
  const models=collectionModels(),count=(type,weaponFilter=null)=>models.filter(m=>m.faction===faction&&m.type===type&&(!weaponFilter||weaponFilter(m))).length;
  const meleeAvailable=count(basicType,m=>m.weapon==="handWeapon"&&(!woodElfStyle||m.components?.includes("left_sword")||m.offhandWeapon));
  const rangedAvailable=race==="dwarf"?count("dwarfInfantry",m=>m.weapon==="crossbow"):race==="undead"?count("zombies",m=>m.weapon==="handWeapon"):count("archers",m=>m.weapon==="bow");
  const pushStartingUnit=(type,models,rangedWeapon=null)=>{
   roster.push({type,models,weapon:"handWeapon",meleeWeapons:woodElfStyle&&type===basicType?["handWeapon","offhandWeapon"]:["handWeapon"],...(woodElfStyle?{woodElfStyle:true}:{}),...(woodElfStyle&&type===basicType?{dualWield:true,shield:false,skills:{skirmish:true}}:{}),...(woodElfStyle&&rangedWeapon?{skills:{skirmish:true}}:{}),...(rangedWeapon?{rangedWeapon}:{}),champion:false,upgrades:{}});
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
  if(rangedDeployed>=5)pushStartingUnit(rangedType,rangedDeployed,race==="undead"?null:race==="dwarf"?"crossbow":"bow");
  if(commander)roster.push(character);
 }else{
  roster=woodElfStyle?[
   {type:"archers",models:12,weapon:"handWeapon",meleeWeapons:["handWeapon"],rangedWeapon:"bow",woodElfStyle:true,skills:{skirmish:true},champion:false,upgrades:{}},
   {type:"archers",models:12,weapon:"handWeapon",meleeWeapons:["handWeapon"],rangedWeapon:"bow",woodElfStyle:true,skills:{skirmish:true},champion:false,upgrades:{}},
   {type:"cavalry",models:8,weapon:"handWeapon",meleeWeapons:["handWeapon"],mounted:true,mountType:"horse",woodElfStyle:true,skills:{skirmish:true},champion:false,upgrades:{}},
   {type:"swordsmen",models:12,weapon:"handWeapon",meleeWeapons:["handWeapon","offhandWeapon"],dualWield:true,woodElfStyle:true,skills:{skirmish:true},champion:false,upgrades:{}},
   character
  ]:[
   {type:basicType,models:15,weapon:"handWeapon",meleeWeapons:["handWeapon"],champion:false,upgrades:{},skills:{}},
   {type:basicType,models:15,weapon:"handWeapon",meleeWeapons:["handWeapon"],champion:false,upgrades:{},skills:{}},
   {type:rangedType,models:10,weapon:"handWeapon",meleeWeapons:["handWeapon"],...(race==="undead"?{}:{rangedWeapon:race==="dwarf"?"crossbow":"bow"}),champion:false,upgrades:{},skills:{}},
   character
  ];
 }
 const points=roster.reduce((sum,u)=>sum+unitCost(u,faction),0);
 return {faction,roster,points,politicalFactionId:id};
}
function campaignBaseCityIncome(region){
 const s=region?.settlement;if(!s)return 0;
 const tier=Math.max(1,Number(s.historicalTier)||1),prosperity=Math.max(0,Math.min(100,Number(s.prosperity)||0));
 const population=Math.max(0,Number(s.population?.total)||0);if(population<=0)return 0;
 const buildings=(s.buildings||[]).reduce((sum,b)=>sum+Math.max(0,Math.min(100,Number(b.condition)||0)),0);
 const infrastructureValue=Number(s.infrastructureCondition),infrastructure=Math.max(.25,Math.min(1,Number.isFinite(infrastructureValue)?infrastructureValue/100:1));
 return Math.round((10+tier*10+prosperity*.35+Math.log10(Math.max(1,population))*6+buildings*.04)*infrastructure);
}
function campaignMinorSettlementIncome(campaign,ownerId){
 return (campaign?.minorSettlements||[]).reduce((sum,place)=>{const region=campaign.regions?.find(r=>r.id===place.region),population=Math.max(0,Number(place.population)||0);if(!region||politicalOwner(region)!==ownerId||population<=0)return sum;return sum+Math.round(Math.sqrt(population)*.12+Math.max(0,Number(place.prosperity)||0)*.04);},0);
}
function safeTradePath(campaign,startId,endId,ownerId){
 const graph=campaign?.graph;if(!graph?.nodes?.[startId]||!graph?.nodes?.[endId])return null;
 const friendlyOwner=owner=>owner===ownerId||(!((campaign.activeWars||[]).includes(campaignWarKey(ownerId,owner)))&&campaignRelation(campaign,ownerId,owner)>=0);
 const distances=new Map([[startId,0]]),previous=new Map(),used=new Set();
 while(true){
  let at=null,best=Infinity;for(const [id,d] of distances)if(!used.has(id)&&d<best){at=id;best=d;}if(at===null)return null;
  if(at===endId){let cur=at,hasSea=false;while(previous.has(cur)){const prev=previous.get(cur);if(prev.edge.kind==="sea")hasSea=true;cur=prev.id;}return {distance:best,hasSea};}
  used.add(at);
  for(const edge of graph.edges[at]||[]){if(used.has(edge.to))continue;const node=graph.nodes[edge.to];if(!node)continue;
   if(node.type!=="seaRoute"&&node.type!=="river"&&node.region!=null){const region=campaign.regions?.find(r=>r.id===node.region),owner=region?politicalOwner(region):ownerId;if(!friendlyOwner(owner))continue;}
   const candidate=best+(edge.kind==="sea" ? 0.75 : 1)+(node.type==="river" ? 0.5 : 0);if(candidate<(distances.get(edge.to)??Infinity)){distances.set(edge.to,candidate);previous.set(edge.to,{id:at,edge});}
  }
 }
}
function campaignTradeIncome(region,campaign){
 if(!region?.settlement?.population||!campaign?.graph?.nodes)return 0;
 const owner=politicalOwner(region);if(FACTION_BY_ID[owner]?.passive)return 0;let total=0;
 for(const target of campaign.regions||[]){if(target.id===region.id||!target.settlement?.population)continue;const targetOwner=politicalOwner(target);if(FACTION_BY_ID[targetOwner]?.passive)continue;
  if(targetOwner!==owner&&(campaign.activeWars||[]).includes(campaignWarKey(owner,targetOwner)))continue;
  if(targetOwner!==owner&&campaignRelation(campaign,owner,targetOwner)<0)continue;
  const path=safeTradePath(campaign,"city-"+region.id,"city-"+target.id,owner);if(!path)continue;
  const population=Math.max(0,Number(target.settlement.population.total)||0),value=4+Math.min(8,Math.log10(Math.max(1,population))*2);
  total+=value/(1+path.distance*.24)*(path.hasSea?2.4:1);
 }
 return Math.round(total);
}
function campaignCityIncome(region,campaign=null){return campaignBaseCityIncome(region)+(campaign?campaignTradeIncome(region,campaign):0);}
function ensureMinorSettlementState(campaign){
 if(!Array.isArray(campaign.minorSettlements))campaign.minorSettlements=[];
 const existing=new Map(campaign.minorSettlements.map(p=>[p.id,p]));
 for(const node of Object.values(campaign.graph?.nodes||{})){if(!["village","farm"].includes(node.type))continue;const previous=existing.get(node.id);if(previous){previous.region=node.region;previous.type=node.type;previous.name=node.label;continue;}campaign.minorSettlements.push({id:node.id,name:node.label,type:node.type,region:node.region,population:Math.max(0,Number(node.population)||0),prosperity:Math.max(0,Number(node.prosperity)||40)});}
}
function campaignArmyCost(army){
 return Math.max(0,Math.round((army?.roster||[]).reduce((sum,u)=>sum+unitCost(u,army.rosterFaction||"empire"),0)));
}
// Gold pays for training and equipment, not the abstract points value of the soldiers.
function campaignEquipmentGoldCost(config,faction="empire"){
 if(!config)return 0;
 const type=String(config.type||""),models=Math.max(1,Number(config.models)||1);
 const equipmentTypes=["cannon","boltThrower","catapult","humanChariot","elfChariot","goblinChariot","orcChariot","skeletonChariot","dragon","youngDragon","ancientDragon","deepflameDragon","wyvern","giant","trolls","skeletonDragon","skeletonGiant","skeletonTroll"];
 if(config.siegeMachine||equipmentTypes.includes(type))return Math.max(0,Math.round(unitCost(config,faction)));
 const base={type,models,weapon:"handWeapon",meleeWeapons:["handWeapon"],champion:false,upgrades:{},skills:{}};
 if(config.woodElfStyle)base.woodElfStyle=true;
 return Math.max(0,Math.round(unitCost(config,faction)-unitCost(base,faction)));
}
function campaignRecruitmentGoldCost(config,faction="empire"){
 if(!config)return 0;
 const type=String(config.type||""),models=Math.max(1,Number(config.models)||1);
 const character=["captain","lord","mageHero","mageLord","starwardenLord","necromancer","masterNecromancer","vampireHero","vampireLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric","goblinHero","goblinLord","orcHero","orcLord"].includes(type);
 return (character?5:(config.siegeMachine?5:models))+campaignEquipmentGoldCost(config,faction);
}
function campaignArmyUpkeep(army){
 return Math.ceil((army?.roster||[]).reduce((sum,u)=>{
  const type=String(u.type||""),models=Math.max(1,Number(u.models)||1);
  const character=["captain","lord","mageHero","mageLord","starwardenLord","necromancer","masterNecromancer","vampireHero","vampireLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric","goblinHero","goblinLord","orcHero","orcLord"].includes(type);
  const monster=["dragon","youngDragon","ancientDragon","deepflameDragon","wyvern","giant","trolls","skeletonDragon","skeletonGiant","skeletonTroll"].includes(type);
  const cavalry=["cavalry","wolfRiders","boarBoyz","skeletonHorses"].includes(type);
  return sum+(u.siegeMachine?5:monster?8:character?3:cavalry?2:models);
 },0));
}
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
 if(race==="greenskin"||race==="undead")return Infinity;
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
 if(race==="greenskin"||race==="undead")return true;
 const pools=ensureSettlementRecruitment(region),pool=pools?.[race];
 if(!pool||Math.floor(Number(pool.available)||0)<count)return false;
 pool.available-=count;
 return true;
}
function civilianPopulation(region,race=null){
 const groups=region?.settlement?.population?.groups||[];
 if(race==="undead")return Math.max(0,Math.floor(groups.filter(g=>["human","elf","dwarf"].includes(recruitmentRaceForCulture(g.culture))).reduce((n,g)=>n+Math.max(0,Number(g.count)||0),0)));
 if(race)return Math.max(0,Math.floor(groups.filter(g=>recruitmentRaceForCulture(g.culture)===race).reduce((n,g)=>n+Math.max(0,Number(g.count)||0),0)));
 return Math.max(0,Math.floor(Number(region?.settlement?.population?.total)||0));
}
function consumeCivilianPopulation(region,count,race=null){
 count=Math.max(0,Math.floor(Number(count)||0));
 if(!region?.settlement?.population||civilianPopulation(region,race)<count)return false;
 const population=region.settlement.population;
 const totalBefore=civilianPopulation(region);
 let remaining=count;
 const eligible=(population.groups||[]).filter(g=>!race||(race==="undead"?["human","elf","dwarf"].includes(recruitmentRaceForCulture(g.culture)):recruitmentRaceForCulture(g.culture)===race)).sort((a,b)=>(b.count||0)-(a.count||0));
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
  const recruitableTypes=race==="undead"?["skeletons","zombies"]:["swordsmen","dwarfInfantry","archers","goblins","orcBoyz"];
  const unit=(army.roster||[]).find(u=>recruitableTypes.includes(u.type)&&u.models<30);
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
  {type:race==="dwarf"?"dwarfInfantry":"swordsmen",ranged:null,match:m=>m.type===(race==="dwarf"?"dwarfInfantry":"swordsmen")&&m.weapon==="handWeapon"&&(activeCampaign.playerPoliticalFaction!=="verdantCourt"||m.components?.includes("left_sword")||m.offhandWeapon)},
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
{id:3,name:"Goldhaven",faction:"empire",ruler:"Prince Odran of House Kest",status:"Rival human lord",terrain:"Eastern grain belt and coast",description:"A rich coastal market city whose prince commands much of the eastern farmland and dislikes Crownfall's taxes.",requiredCharacters:[]},
{id:4,name:"Stonebridge",faction:"empire",ruler:"Duchess Elira Vane",status:"Rival human lord",terrain:"Southern river crossing",description:"A fortified bridge-city controlling the safest crossing into the southern continent. Its duchess bargains as an equal.",requiredCharacters:[]},
{id:5,name:"Southwatch",faction:"empire",ruler:"Lord-Marshal Caedmon",status:"Rival human lord",terrain:"Southern marches and trade road",description:"A fortified southern watch-city controlling an important overland trade road and wary of central authority.",requiredCharacters:[]},
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
{id:23,name:"Ashenford",faction:"evilHumans",ruler:"The Ashen Council",status:"Independent principality",terrain:"Southern river crossing",description:"A fortified crossing ruled by a council of rival nobles who cooperate only when threatened.",requiredCharacters:[]},
{id:24,name:"Khaz Varrak",faction:"dwarfs",ruler:"Thaurgath the Rune-Eater",status:"Ancient dragon lair",terrain:"High mountains; carved dwarven halls and rune-forges",description:"A vast dwarven hold cut into the high peaks, its bridges, gates and rune-forges still intact beneath the rule of Thaurgath the Rune-Eater, an ancient spellcasting dragon. No dwarven army garrisons the city.",requiredCharacters:[],passiveOccupant:true},
{id:25,name:"Eastwatch",faction:"empire",ruler:"Harbour Council of Eastwatch",status:"Independent human city",terrain:"Eastern coast of the central continent",description:"A coastal city guarding the eastern approaches, trading with the island courts and the mountain holds.",requiredCharacters:[]},
 {id:26,name:"Freebooter's Haven",faction:"empire",ruler:"The Freebooters",status:"Pirate port",terrain:"Far Shoals island; rocky coves and hidden anchorages",description:"A fortified pirate harbour where gun crews, smugglers and freebooters prey on passing merchant vessels.",requiredCharacters:[]},
 {id:27,name:"Blackflag Cay",faction:"empire",ruler:"The Black Flag Corsairs",status:"Pirate port",terrain:"Southern island; sheltered coves and salt cliffs",description:"A corsair stronghold built around a sheltered anchorage, notorious for firearm volleys and fast raids against coastal shipping.",requiredCharacters:[]},
];
const REGION_NEIGHBORS = {
 1:[2,6],2:[1,6],3:[7,8,9,27],4:[5,20,23],5:[4,18,20],
 6:[1,2,7,8,17],7:[3,6],8:[3,6,21,25,26],9:[3,10,24],10:[9,24,25],
 11:[13,14],12:[14,15,16],13:[11,14],14:[11,12,13,15,21],
 15:[12,14,16],16:[12,15],17:[6,27],18:[5,20,22,23],
 19:[21],20:[4,5,18,23],21:[8,14,19,22,25],22:[18,21,23],23:[4,18,20,22],24:[9,10],
 25:[8,10,21,26],26:[8,25],27:[3,17]
};

const CITY_PROFILES = {
 1:{tier:4,population:110000,prosperity:78,fortification:{style:"human-layered",material:"stone",circuits:3,gates:3,wounds:100},buildings:["royal-citadel","great-market","river-port","waterworks"]},
 2:{tier:2,population:24000,prosperity:65,fortification:{style:"human-layered",material:"stone-and-timber",circuits:1,gates:2,wounds:45},buildings:["market","mill","river-crossing"]},
 3:{tier:3,population:62000,prosperity:75,fortification:{style:"human-layered",material:"stone",circuits:2,gates:3,wounds:70},buildings:["grain-market","guildhall","granaries"]},
 4:{tier:3,population:38000,prosperity:70,fortification:{style:"human-layered",material:"stone",circuits:2,gates:2,wounds:80},buildings:["bridgeworks","tollhouse","barracks"]},
 5:{tier:3,population:31000,prosperity:72,fortification:{style:"human-layered",material:"stone",circuits:2,gates:2,wounds:75},buildings:["customs-house","barracks","road-station"]},
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
 21:{tier:3,population:28000,prosperity:43,fortification:{style:"human-layered",material:"weathered-stone",circuits:2,gates:1,wounds:72},buildings:["harbour","barracks","watchtower"]},
 22:{tier:2,population:19000,prosperity:60,fortification:{style:"human-layered",material:"stone-and-timber",circuits:1,gates:2,wounds:42},buildings:["market","mercenary-yard"]},
 23:{tier:2,population:16000,prosperity:52,fortification:{style:"human-layered",material:"stone",circuits:1,gates:2,wounds:50},buildings:["river-crossing","tollhouse","market"]},
 24:{tier:4,population:24000,prosperity:58,fortification:{style:"dwarven-heavy",material:"rune-carved-deep-stone",circuits:2,gates:1,wounds:175,cannonPlatforms:8},buildings:["ancient-deep-mines","rune-forges","sealed-vaults","deep-roads"]},
 25:{tier:3,population:36000,prosperity:70,fortification:{style:"human-layered",material:"stone",circuits:1,gates:2,wounds:60},buildings:["harbour","market","watchtower"]},
 26:{tier:2,population:12500,prosperity:46,fortification:{style:"human-layered",material:"weathered-stone-and-timber",circuits:1,gates:1,wounds:42},buildings:["pirate-harbour","powder-magazine","black-market"]},
 27:{tier:2,population:9800,prosperity:40,fortification:{style:"human-layered",material:"salt-worn-stone",circuits:1,gates:1,wounds:35},buildings:["corsair-harbour","powder-magazine","shipwrights"]},
};
const CULTURE_BY_FACTION = {empire:"Human",highElves:"High Elf",dwarfs:"Dwarf",greenskins:"Greenskin",undead:"Undead",evilHumans:"Human"};
const FACTION_SPECIES = {empire:"human",highElves:"elf",dwarfs:"dwarf",greenskins:"greenskin",undead:"undead",evilHumans:"human"};
function cityArchitectureType(city){
 const race=city?.faction==="undead"?"human":FACTION_SPECIES[city?.faction]||"human";
 return ["human","elf","dwarf","greenskin"].includes(race)?race:"human";
}
function initialSettlement(city){
 const p=CITY_PROFILES[city.id]||{tier:1,population:10000,prosperity:40,fortification:{style:"human-layered",material:"stone",circuits:1,gates:1,wounds:30},buildings:[]};
 const pop=p.population,architectureType=cityArchitectureType(city),culture=city?.faction==="undead"?"Human":CULTURE_BY_FACTION[city.faction]||"Local";
 return {historicalTier:p.tier,architectureType,prosperity:p.prosperity,unrest:0,foodStores:8,maxFoodStores:8,siegeTurns:0,besiegedBy:null,population:{total:pop,capacity:Math.round(pop*1.5),groups:[{culture,count:pop}],displaced:0,displacedGroups:[]},buildings:p.buildings.map(id=>({id,condition:100})),fortification:{...p.fortification,condition:100,damage:0,upgrades:[]},infrastructureCondition:100,occupationPolicy:"local-administration",monthsUnderOccupation:0};
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
  if(!Number.isFinite(Number(region.settlement.population.capacity)))region.settlement.population.capacity=Math.round((CITY_PROFILES[city.id]?.population||region.settlement.population.total||10000)*1.5);
  if(!Array.isArray(region.settlement.population.displacedGroups))region.settlement.population.displacedGroups=[];
  if(!region.settlement.architectureType)region.settlement.architectureType=cityArchitectureType(city);
  if(city.faction==="undead")for(const group of region.settlement.population.groups||[])if(String(group.culture||"").toLowerCase()==="undead")group.culture="Human";
  if(!Array.isArray(region.settlement.buildings))region.settlement.buildings=initialSettlement(city).buildings;
  if(!region.settlement.fortification)region.settlement.fortification=initialSettlement(city).fortification;
  ensureSettlementRecruitment(region);
 }
 // Legacy Deadman data is identified by name below; region 26 is now a pirate island.
 for(const id of [24,25,26,27])if(!(campaign.regions||[]).some(r=>r.id===id)){const city=CITIES.find(c=>c.id===id),profile=FACTION_PROFILES[id],settlement=initialSettlement(city);campaign.regions.push({id:city.id,name:city.name,faction:city.faction,politicalFactionId:profile.id,ownerFaction:profile.id,owner:profile.id,nativeFaction:city.faction,nativeCulture:CULTURE_BY_FACTION[city.faction]||"Local",terrain:city.terrain,neighbors:[...(REGION_NEIGHBORS[id]||[])],ruler:city.ruler,status:city.status,settlement});}
 const legacyDeadman=(campaign.regions||[]).some(region=>region.id===26&&/deadman/i.test(String(region.name||"")));
  if(legacyDeadman)for(const army of campaign.armies||[])if(army.region===26||army.homeRegion===26||army.nodeId==="city-26"||army.owner==="deadman"||army.factionId==="deadman"){army.region=21;army.homeRegion=army.homeRegion===26?21:army.homeRegion;army.nodeId="city-21";if(army.owner==="deadman")army.owner="ironMarshal";if(army.factionId==="deadman")army.factionId="ironMarshal";}
  campaign.regions=(campaign.regions||[]).filter(region=>CITIES.some(city=>city.id===region.id)&&!(region.id===26&&/deadman/i.test(String(region.name||""))));
  for(const region of campaign.regions||[])region.neighbors=[...(REGION_NEIGHBORS[region.id]||[])];
 if(campaign.mapId!==MAP_ID||!campaign.graph?.nodes||!campaign.graph?.edges){
  campaign.graph=createMovementGraph();campaign.mapId=MAP_ID;if(String(campaign.lastEvent||"").includes(" begins the campaign at "))campaign.lastEvent="Campaign map updated.";
  for(const army of campaign.armies||[])if(!campaign.graph.nodes[army.nodeId])army.nodeId="city-"+(army.region||army.homeRegion||campaign.startingRegion);
  if(campaign.commander&&!campaign.graph.nodes[campaign.commander.nodeId])campaign.commander.nodeId="city-"+(campaign.commander.region||campaign.startingRegion);
 }
 ensureMinorSettlementState(campaign);
  campaign.schemaVersion=8;
 if(!campaign.factionStates){campaign.factionStates=Object.values(FACTION_PROFILES).map(profile=>{const home=CITIES.find(c=>FACTION_PROFILES[c.id].id===profile.id),generated=createCampaignArmyRoster(profile.id,profile.id===campaign.playerPoliticalFaction?1000:500);return {id:profile.id,name:profile.name,race:profile.race,rosterFaction:generated.faction,roster:generated.roster,homeRegion:home.id,alive:true,treasury:profile.id===campaign.playerPoliticalFaction?Number(campaign.treasury)||500:300,income:100,armyPoints:profile.id===campaign.playerPoliticalFaction?1000:500,turnsTaken:0,relations:{},};});campaign.factionTurnOrder=campaign.factionStates.map(f=>f.id);campaign.playerPoliticalFaction=campaign.playerPoliticalFaction||FACTION_PROFILES[campaign.startingRegion]?.id||FACTION_PROFILES[1].id;campaign.activeFaction=campaign.activeFaction||campaign.playerPoliticalFaction;}
 for(const state of campaign.factionStates){if((!Array.isArray(state.roster)||!state.roster.length)&&state.alive!==false&&!state.passive){const generated=createCampaignArmyRoster(state.id,state.armyPoints||500);state.rosterFaction=generated.faction;state.roster=generated.roster;}}
 if(!campaign.factionStates.some(f=>f.id==="deepflame")){const profile=FACTION_BY_ID.deepflame,generated=createCampaignArmyRoster("deepflame",500);campaign.factionStates.push({id:profile.id,name:profile.name,race:profile.race,rosterFaction:generated.faction,roster:generated.roster,homeRegion:24,alive:true,passive:true,treasury:0,income:0,upkeep:0,armyPoints:generated.points,turnsTaken:0,relations:{}});campaign.factionTurnOrder=campaign.factionTurnOrder||campaign.factionStates.filter(f=>f.id!=="deepflame").map(f=>f.id);if(!campaign.factionTurnOrder.includes("deepflame"))campaign.factionTurnOrder.push("deepflame");}
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
 campaign.factionStates=campaign.factionStates||[];campaign.armies=campaign.armies||[];campaign.factionTurnOrder=campaign.factionTurnOrder||campaign.factionStates.filter(f=>f.id!=="deepflame").map(f=>f.id);
  for(const profile of Object.values(FACTION_PROFILES)){
   if(campaign.factionStates.some(f=>f.id===profile.id))continue;
   const home=CITIES.find(c=>FACTION_PROFILES[c.id]?.id===profile.id);if(!home)continue;
   const generated=createCampaignArmyRoster(profile.id,500),state={id:profile.id,name:profile.name,race:profile.race,rosterFaction:generated.faction,roster:generated.roster,homeRegion:home.id,alive:true,passive:!!profile.passive,treasury:profile.passive?0:300,income:profile.passive?0:campaignCityIncome(campaign.regions.find(r=>r.id===home.id)),upkeep:profile.passive?0:campaignArmyUpkeep({roster:generated.roster,rosterFaction:generated.faction}),armyPoints:generated.points,turnsTaken:0,relations:{}};
   campaign.factionStates.push(state);if(!campaign.factionTurnOrder.includes(profile.id))campaign.factionTurnOrder.push(profile.id);
   campaign.armies.push({id:profile.id+"-main",owner:profile.id,factionId:profile.id,rosterFaction:generated.faction,roster:generated.roster,region:home.id,nodeId:"city-"+home.id,points:generated.points,passive:!!profile.passive,boredom:-4,momentum:0,foughtThisTurn:false,supplies:3,maxSupplies:3,supplyRaidedUntilTurn:0});
  }
  const dragonState=campaign.factionStates.find(f=>f.id==="deepflame");if(dragonState){dragonState.passive=true;dragonState.race="dragon";dragonState.income=0;dragonState.upkeep=0;dragonState.treasury=0;dragonState.rosterFaction="highElves";if(dragonState.alive!==false&&politicalOwner(campaign.regions.find(r=>r.id===24))==="deepflame"){dragonState.roster=[{type:"deepflameDragon",models:1,weapon:"handWeapon",meleeWeapons:["handWeapon"],casterLevel:4,spells:["fireBolt","nullificationDome"],champion:false,upgrades:{},skills:{}}];dragonState.armyPoints=unitCost(dragonState.roster[0],"highElves");}}const dragonArmy=(campaign.armies||[]).find(a=>(a.owner||a.factionId)==="deepflame");if(dragonArmy){dragonArmy.passive=true;dragonArmy.movement=0;if(politicalOwner(campaign.regions.find(r=>r.id===24))==="deepflame"){dragonArmy.region=24;dragonArmy.nodeId="city-24";}}else if(politicalOwner(campaign.regions.find(r=>r.id===24))==="deepflame"){const generated=createCampaignArmyRoster("deepflame",500);campaign.armies.push({id:"deepflame-main",owner:"deepflame",factionId:"deepflame",rosterFaction:generated.faction,roster:generated.roster,region:24,nodeId:"city-24",points:generated.points,movement:0,supplies:3,maxSupplies:3,passive:true});}
 enforcePopulationResidency(campaign);
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
export function ensureRefugeeState(campaign){
 if(!Array.isArray(campaign.refugeeGroups))campaign.refugeeGroups=[];
 if(!Number.isFinite(campaign.nextRefugeeId))campaign.nextRefugeeId=1;
}
function refugeeMovementForCulture(culture){
 const c=String(culture||"").toLowerCase();
 return c.includes("dwarf")?3:c.includes("elf")?5:4;
}
function refugeeCityAccepts(region,culture,campaign){
 if(!region||!region.settlement||region.settlement.ruins)return false;
 const owner=politicalOwner(region),race=String(culture||"").toLowerCase();
 if(!owner)return false;
 if(race.includes("greenskin")&&!campaignIsGreenskin(campaign,owner))return false;
 const ownerRace=FACTION_BY_ID[owner]?.race||campaign.factionStates?.find(f=>f.id===owner)?.race;
 if(ownerRace==="greenskin"&&!race.includes("greenskin"))return false;
 return true;
}
function refugeeNodeForRegion(campaign,regionId){
 return Object.values(campaign.graph?.nodes||{}).find(n=>n.type==="city"&&Number(n.region)===Number(regionId))?.id||null;
}
function refugeePathCost(campaign,path){
 let cost=0;
 for(let i=1;i<path.length;i++){
  const next=campaign.graph.nodes[path[i]],edge=(campaign.graph.edges[path[i-1]]||[]).find(e=>e.to===path[i]);
  cost+=(edge?.cost||1)+nodeCost(next)-1;
 }
 return cost;
}
function refugeeCitiesWithin(campaign,group,fromNode,within=Infinity){
 const choices=[];
 for(const region of campaign.regions||[]){
  if(Number(region.id)===Number(group.originRegion)||!refugeeCityAccepts(region,group.culture,campaign))continue;
  if(politicalOwner(region)!==group.owner)continue;
  const node=refugeeNodeForRegion(campaign,region.id);if(!node)continue;
  const path=campaignMovementPath(campaign,fromNode,node);if(!path)continue;
  const cost=refugeePathCost(campaign,path);
  if(cost<=within)choices.push({region,node,path,cost,load:Number(region.settlement?.population?.total)||0});
 }
 choices.sort((a,b)=>a.load-b.load||a.cost-b.cost);
 return choices;
}
function nearestRefugeeCity(campaign,group,fromNode,within=Infinity){
 return refugeeCitiesWithin(campaign,group,fromNode,within).sort((a,b)=>a.cost-b.cost||a.load-b.load)[0]||null;
}
function absorbRefugees(campaign,group,region){
 if(!group||!region?.settlement)return 0;
 const count=Math.max(0,Math.floor(Number(group.count)||0));if(!count)return 0;
 ensureSettlementState(campaign);
 const pop=region.settlement.population,cohort=pop.groups.find(g=>g.culture===group.culture);
 if(cohort)cohort.count+=count;else pop.groups.push({culture:group.culture,count});
 pop.total=Math.max(0,Number(pop.total)||0)+count;
 campaign.refugeeGroups=campaign.refugeeGroups.filter(g=>g.id!==group.id);
 return count;
}
function moveRefugeeColumn(campaign,group,destination,allowance){
 const path=campaignMovementPath(campaign,group.nodeId,destination);if(!path)return false;
 let spent=0,last=path[0];
 for(let i=1;i<path.length;i++){
  const edge=(campaign.graph.edges[path[i-1]]||[]).find(e=>e.to===path[i]);
  const step=(edge?.cost||1)+nodeCost(campaign.graph.nodes[path[i]])-1;
  if(spent+step>allowance)break;
  spent+=step;last=path[i];
 }
 if(last===group.nodeId)return false;
 group.nodeId=last;group.region=campaign.graph.nodes[last]?.region??null;group.movement=Math.max(0,allowance-spent);
 const reached=campaign.regions.find(r=>Number(r.id)===Number(group.region));
 if(reached&&politicalOwner(reached)===group.owner&&refugeeCityAccepts(reached,group.culture,campaign)){
  const n=absorbRefugees(campaign,group,reached);campaign.lastEvent=n.toLocaleString()+" refugees from "+group.originName+" reach "+reached.name+" and resettle.";return true;
 }
 return true;
}
function createRefugeeColumn(campaign,{owner,culture,count,originRegion,nodeId}){
 ensureRefugeeState(campaign);
 const movement=refugeeMovementForCulture(culture),region=campaign.regions.find(r=>Number(r.id)===Number(originRegion));
 const group={id:"refugees-"+campaign.nextRefugeeId++,owner,culture,count:Math.max(1,Math.floor(count)),originRegion:Number(originRegion),originName:region?.name||"the fallen city",nodeId,region:Number(originRegion),movement,maxMovement:movement,kind:"refugees"};
 campaign.refugeeGroups.push(group);
 const target=nearestRefugeeCity(campaign,group,nodeId,Infinity);
 if(target)moveRefugeeColumn(campaign,group,target.node,movement);
 return group;
}
function resolveRefugeeEncounter(campaign,group,army){
 if(!group||!army||!campaign.refugeeGroups.some(g=>g.id===group.id))return;
 const captor=army.owner||army.factionId;if(!captor||captor===group.owner)return;
 let action="release";
 if(campaignIsGreenskin(campaign,captor))action="attack";
 else if(captor===campaign.playerPoliticalFaction){
  const choice=window.prompt("You encounter "+group.count.toLocaleString()+" civilian refugees. Choose: 1 = attack, 2 = kidnap, 3 = let them go.","2");
  action=choice==="1"?"attack":choice==="2"?"kidnap":"release";
 }else action="kidnap";
 const power=Math.max(0,Number(army.points)||campaignArmyCost(army)||0);
 const fraction=action==="attack"?Math.min(.65,.18+power/5000):action==="kidnap"?Math.min(.25,.04+power/10000):0;
 const affected=Math.min(group.count,Math.floor(group.count*fraction));
 const targetOwner=group.owner;
 if(action==="attack"){
  group.count-=affected;
  setCampaignRelation(campaign,captor,targetOwner,campaignRelation(campaign,captor,targetOwner)-(campaignIsGreenskin(campaign,captor)?18:24));
  setCampaignRelation(campaign,targetOwner,captor,campaignRelation(campaign,targetOwner,captor)-(campaignIsGreenskin(campaign,captor)?18:24));
  for(const f of campaign.factionStates||[])if(f.id!==captor&&f.id!==targetOwner&&!campaignIsGreenskin(campaign,f.id))setCampaignRelation(campaign,f.id,captor,campaignRelation(campaign,f.id,captor)-10);
 }else if(action==="kidnap"){
  group.count-=affected;
  if(affected>0){
   const race=FACTION_BY_ID[captor]?.race||campaign.factionStates?.find(f=>f.id===captor)?.race||"human";
   const city=campaign.regions.find(r=>politicalOwner(r)===captor&&refugeeCityAccepts(r,race,campaign));
   if(city){const pop=city.settlement.population,existing=pop.groups.find(g=>g.culture===race);if(existing)existing.count+=affected;else pop.groups.push({culture:race,count:affected});pop.total=(Number(pop.total)||0)+affected;}
  }
  setCampaignRelation(campaign,captor,targetOwner,campaignRelation(campaign,captor,targetOwner)-18);
  setCampaignRelation(campaign,targetOwner,captor,campaignRelation(campaign,targetOwner,captor)-18);
  for(const f of campaign.factionStates||[])if(f.id!==captor&&f.id!==targetOwner&&!campaignIsGreenskin(campaign,f.id))setCampaignRelation(campaign,f.id,captor,campaignRelation(campaign,f.id,captor)-7);
 }
 if(group.count<=0)campaign.refugeeGroups=campaign.refugeeGroups.filter(g=>g.id!==group.id);
 else{
  const next=nearestRefugeeCity(campaign,group,group.nodeId,Infinity);
  if(next)moveRefugeeColumn(campaign,group,next.node,group.maxMovement);
 }
 campaign.lastEvent=action==="attack"?army.name+" attacks the refugees, killing "+affected.toLocaleString()+". Survivors flee.":action==="kidnap"?army.name+" kidnaps "+affected.toLocaleString()+" refugees; the rest flee.":"The army allows the refugees to pass unharmed.";
}
function resolveRefugeeArmyEncounters(campaign){
 ensureRefugeeState(campaign);
 for(const group of [...campaign.refugeeGroups]){
  const army=(campaign.armies||[]).find(a=>(a.nodeId||refugeeNodeForRegion(campaign,a.region))===group.nodeId&&(a.owner||a.factionId)!==group.owner&&(a.roster||[]).length);
  if(army)resolveRefugeeEncounter(campaign,group,army);
 }
}
function resolveGrandCampaignConquest(campaign,regionId,conquerorFaction,options={}){
 ensureSettlementState(campaign);
 const region=campaign.regions.find(r=>r.id===Number(regionId)),city=CITIES.find(c=>c.id===Number(regionId));
 if(!region||!city||(!FACTIONS[conquerorFaction]&&!FACTION_BY_ID[conquerorFaction]))throw new Error("Unknown region or conquering faction.");
 const previousOwner=region.ownerFaction||region.owner||region.nativeFaction;
 const conquerorId=FACTION_BY_ID[conquerorFaction]?.id||conquerorFaction;
 if(previousOwner===conquerorId)return {region,summary:city.name+" is already under this faction's control."};
 const settlement=region.settlement,initialPopulation=Math.max(0,Number(region.settlement?.population?.total)||0),conquerorRace=FACTION_BY_ID[conquerorId]?.race||FACTION_SPECIES[conquerorFaction];
 const isGreenskinConqueror=conquerorRace==="greenskin";
 const outcome=options.outcome||(isGreenskinConqueror?"sack":"occupy");
 const sameSpecies=conquerorRace===(FACTION_SPECIES[region.nativeFaction]||FACTION_BY_ID[region.ownerFaction]?.race||FACTION_PROFILES[region.id]?.race);
 const isGreenskinDwarfConquest=(conquerorId==="greenskins"||FACTION_BY_ID[conquerorId]?.race==="greenskin")&&region.nativeFaction==="dwarfs";
 const gates=Math.max(1,Math.min(5,Math.floor(Number(settlement.fortification?.gates)||1)));
 const attackerArmy=options.army||null;
 const attackerStartingModels=Math.max(1,Number(options.attackerStartingModels)||Number(attackerArmy?.startingModels)||Number(attackerArmy?.initialModels)||Number(attackerArmy?.roster?.reduce((n,u)=>n+Math.max(0,Number(u.models)||0),0))||1);
 const attackerSurvivingModels=Math.max(0,Number(attackerArmy?.roster?.reduce((n,u)=>n+Math.max(0,Number(u.models)||0),0))||attackerStartingModels);
 const attackerCasualtyRate=Math.max(0,Math.min(1,1-attackerSurvivingModels/attackerStartingModels));
 const defaultFleeFraction=Math.max(.55,Math.min(.9,.58+gates*.045+attackerCasualtyRate*.12));
 const fleeFraction=Math.max(0,Math.min(1,Number.isFinite(options.fleeFraction)?options.fleeFraction:defaultFleeFraction));
 const escapeSurvival=Math.max(.65,Math.min(.98,.72+gates*.035+attackerCasualtyRate*.16));
 let fled=0,killed=0,escapeCohorts=[];
 ensureRefugeeState(campaign);
 for(const group of settlement.population.groups){
  if(group.count<=0)continue;
  const culture=String(group.culture||"human").toLowerCase();
  const isDwarf=culture.includes("dwarf");
  const greenskinDwarfMassacre=(conquerorId==="greenskins"||FACTION_BY_ID[conquerorId]?.race==="greenskin")&&isDwarf;
  const fleeing=Math.min(group.count,Math.round(group.count*fleeFraction));
  if(fleeing){
   removePopulation(settlement,group,fleeing);settlement.population.displaced+=fleeing;fled+=fleeing;
   const escaped=Math.floor(fleeing*escapeSurvival),lost=fleeing-escaped;
   if(escaped>0)escapeCohorts.push({culture:group.culture,count:escaped});
   killed+=lost;
  }
  if(greenskinDwarfMassacre){
   killed+=removePopulation(settlement,group,group.count);
  }else if(outcome==="massacre"){
   killed+=removePopulation(settlement,group,group.count);
  }else if(outcome==="sack"){
   const casualties=isGreenskinConqueror?group.count:Math.round(group.count*0.12);
   killed+=removePopulation(settlement,group,casualties);
  }
 }
 for(const cohort of escapeCohorts){
  const refugee={owner:previousOwner,culture:cohort.culture,count:cohort.count,originRegion:region.id,nodeId:refugeeNodeForRegion(campaign,region.id)};
  if(!refugee.nodeId)continue;
  const nearby=refugeeCitiesWithin(campaign,refugee,refugee.nodeId,refugeeMovementForCulture(cohort.culture));
  if(nearby.length){
   let remaining=cohort.count;
   for(let i=0;i<nearby.length&&remaining>0;i++){
    const destinationsLeft=nearby.length-i,share=Math.ceil(remaining/destinationsLeft),target=nearby[i],pop=target.region.settlement.population,existing=pop.groups.find(g=>g.culture===cohort.culture);
    if(existing)existing.count+=share;else pop.groups.push({culture:cohort.culture,count:share});
    pop.total=(Number(pop.total)||0)+share;remaining-=share;
   }
  }else createRefugeeColumn(campaign,refugee);
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
 region.ownerFaction=conquerorId;region.politicalFactionId=conquerorId;region.owner=conquerorId;region.occupationPolicy=preserve?"local-administration":"military-occupation";settlement.occupationPolicy=region.occupationPolicy;settlement.monthsUnderOccupation=0;if(region.id===24&&conquerorId!=="deepflame"){const dragonState=campaign.factionStates?.find(f=>f.id==="deepflame");if(dragonState){dragonState.alive=false;dragonState.roster=[];dragonState.armyPoints=0;dragonState.upkeep=0;dragonState.income=0;}for(const dragonArmy of campaign.armies||[])if((dragonArmy.owner||dragonArmy.factionId)==="deepflame"){dragonArmy.roster=[];dragonArmy.points=0;dragonArmy.movement=0;dragonArmy.region=24;dragonArmy.nodeId="city-24";}}
 let plunder=0,dwarfRecallMessage="";
 if(isGreenskinConqueror&&outcome==="sack"){
  const tier=Math.max(1,Number(settlement.historicalTier)||1),prosperity=Math.max(0,Number(settlement.prosperity)||0);
  const survivingBuildings=(settlement.buildings||[]).reduce((sum,b)=>sum+Math.max(0,Number(b.condition)||0)/100,0);
  plunder=Math.round(tier*100+prosperity*2+Math.log10(Math.max(1,initialPopulation))*80+survivingBuildings*25);
  const treasuryState=campaign.factionStates?.find(f=>f.id===conquerorId);
  if(treasuryState)treasuryState.treasury=Math.max(0,Number(treasuryState.treasury)||0)+plunder;
  if(conquerorId===campaign.playerPoliticalFaction)campaign.treasury=Math.max(0,Number(campaign.treasury)||0)+plunder;
 }
 if(region.id===24&&conquerorRace==="dwarf"&&outcome==="occupy"&&!settlement.dwarvenMigrationTriggered){let civiliansMoved=0,reservesMoved=0;ensureSettlementRecruitment(region);for(const source of campaign.regions.filter(r=>r.id!==24&&r.nativeFaction==="dwarfs")){const sourceSettlement=source.settlement;if(sourceSettlement?.population){for(const group of [...(sourceSettlement.population.groups||[])]){const moved=Math.floor(Math.max(0,Number(group.count)||0)*0.05);if(moved<=0)continue;removePopulation(sourceSettlement,group,moved);addDisplacedPeople(settlement,group.culture,moved);civiliansMoved+=moved;}}const sourcePools=ensureSettlementRecruitment(source)||{},targetPools=ensureSettlementRecruitment(region)||{},pool=sourcePools.dwarf;if(pool){const moved=Math.floor(Math.max(0,Number(pool.available)||0)*0.05),progressMoved=Math.max(0,Number(pool.progress)||0)*0.05;pool.available=Math.max(0,(Number(pool.available)||0)-moved);pool.progress=Math.max(0,(Number(pool.progress)||0)-progressMoved);targetPools.dwarf=targetPools.dwarf||{available:0,progress:0};targetPools.dwarf.available+=moved;targetPools.dwarf.progress+=progressMoved;reservesMoved+=moved;}}settlement.dwarvenMigrationTriggered=true;dwarfRecallMessage=" The Dwarven Recall awakens: "+civiliansMoved.toLocaleString()+" civilians and "+reservesMoved+" trained reserves migrate from the other mountain holds to Khaz Varrak.";}
 if(isGreenskinConqueror){if(settlement.population.total<=0)settlement.recruitmentPools={};const army=options.army||(campaign.armies||[]).find(a=>(a.owner||a.factionId)===conquerorId&&a.roster?.length);if(army)awardGreenskinMomentum(campaign,army,1);}
 const factionName=FACTION_BY_ID[conquerorId]?.name||FACTIONS[conquerorFaction]?.name||conquerorId;
 const special=(conquerorId==="greenskins"||FACTION_BY_ID[conquerorId]?.race==="greenskin")&&region.nativeFaction==="dwarfs"?" Orcs slaughtered the dwarves who could not escape; surviving escapees are displaced.":"";
 enforcePopulationResidency(campaign);
 const forcedDisplacement=(settlement.population.displacedGroups||[]).reduce((n,g)=>n+Math.max(0,Number(g.count)||0),0);
 const summary=city.name+" falls to "+factionName+". "+fled.toLocaleString()+" inhabitants flee; "+killed.toLocaleString()+" are killed."+(plunder?" Greenskin plunder: "+plunder.toLocaleString()+" gold; the settlement has no usable population.":"")+(forcedDisplacement?" "+forcedDisplacement.toLocaleString()+" people are displaced because their culture cannot reside under this ruler.":"")+special+dwarfRecallMessage+" Its "+settlement.fortification.style+" fortifications remain in place, damaged but not replaced.";
 campaign.lastEvent=summary;
 return {region,summary,fled,killed,previousOwner,conquerorFaction,plunder,outcome};
}

const MAP_ID="shattered-realms-v17-goldhaven-village-colours";
function createInitialCampaignState(faction,city,commander){
 const playerPoliticalFaction=FACTION_PROFILES[city.id].id;
 const regions=CITIES.map(r=>{const settlement=initialSettlement(r);return {id:r.id,name:r.name,faction:r.faction,politicalFactionId:FACTION_PROFILES[r.id].id,ownerFaction:FACTION_PROFILES[r.id].id,owner:FACTION_PROFILES[r.id].id,nativeFaction:r.faction,nativeCulture:CULTURE_BY_FACTION[r.faction]||"Local",terrain:r.terrain,neighbors:[...(REGION_NEIGHBORS[r.id]||[])],ruler:r.ruler,status:r.status,settlement};});
 const factionStates=Object.values(FACTION_PROFILES).map(profile=>{
  const home=CITIES.find(x=>FACTION_PROFILES[x.id].id===profile.id),isPlayer=profile.id===playerPoliticalFaction;
  const army=createCampaignArmyRoster(profile.id,isPlayer?1000:500,{player:isPlayer,commander:isPlayer?commander:null});
  return {id:profile.id,name:profile.name,race:profile.race,rosterFaction:army.faction,roster:army.roster,homeRegion:home.id,alive:true,passive:!!profile.passive,treasury:profile.passive?0:isPlayer?500:300,income:profile.passive?0:campaignCityIncome(regions.find(r=>r.id===home.id)),upkeep:profile.passive?0:Math.ceil(army.points*.04),armyPoints:army.points,turnsTaken:0,relations:{},};
 });
 const diplomacy={};for(const a of factionStates){diplomacy[a.id]={};for(const b of factionStates){if(a.id===b.id)continue;diplomacy[a.id][b.id]=baseFactionRelation(a.id,b.id);}}
 const armies=factionStates.map(state=>({id:state.id+"-main",owner:state.id,factionId:state.id,rosterFaction:state.rosterFaction,roster:state.roster.map(u=>({...u,meleeWeapons:[...(u.meleeWeapons||[])],upgrades:{...(u.upgrades||{})},skills:{...(u.skills||{})}})),region:state.homeRegion,nodeId:"city-"+state.homeRegion,points:state.armyPoints,passive:!!state.passive,boredom:-4,momentum:0,foughtThisTurn:false,supplies:3,maxSupplies:3,supplyRaidedUntilTurn:0}));
 const playerState=factionStates.find(f=>f.id===playerPoliticalFaction);
 const graph=createMovementGraph(); const campaign={schemaVersion:8,mapId:MAP_ID,turn:1,phase:"player",playerFaction:faction,playerPoliticalFaction,activeFaction:playerPoliticalFaction,factionTurnOrder:factionStates.map(f=>f.id),factionStates,diplomacy,activeAlliances:[],armyFaction:FACTIONS[faction].armyFaction,startingRegion:city.id,treasury:playerState.treasury,regions,graph,commander:{...commander,nodeId:"city-"+city.id,region:city.id,movement:(FACTION_BY_ID[selectedPoliticalFaction]?.race==="elf"?4:3),maxMovement:(FACTION_BY_ID[selectedPoliticalFaction]?.race==="elf"?4:3)},armies,lastEvent:"Your campaign begins at "+city.name+"."}; ensureMinorSettlementState(campaign); for(const state of factionStates){const owned=regions.filter(r=>politicalOwner(r)===state.id);state.income=state.passive?0:owned.reduce((sum,r)=>sum+campaignCityIncome(r,campaign),0)+campaignMinorSettlementIncome(campaign,state.id);} return campaign;
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
   // Use total scale change from touchstart, otherwise repeated touchmove events make the focal point drift.
   const factor=state.scale/state.startScale;
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
const CITY_POSITIONS={1:[205,214],2:[142,286],3:[335,294],4:[473,428],5:[596,491],6:[145,94],7:[541,182],8:[793,207],9:[515,352],10:[653,329],11:[1000,240],12:[1118,326],13:[1157,210],14:[1204,365],15:[1044,405],16:[1170,430],17:[159,430],18:[737,642],19:[1090,466],20:[548,602],21:[1167,420],22:[846,680],23:[629,642],24:[584,260],25:[851,370],26:[925,275],27:[365,435]};
const LEGENDARY={empire:[{id:"edric_voss",type:"legendaryLord",name:"Lord-Marshal Edric Voss"}],highElves:[{id:"aelthir_dawnwing",type:"pegasusChampion",name:"Aelthir, the Dawnwing"},{id:"lethariel_starweaver",type:"shadowElf",name:"Lethariel Starweaver"}],dwarfs:[{id:"haldric_stoneward",type:"dwarfKingHaldric",name:"King Haldric Stoneward"}]};
function collectionBypassEnabled(){try{return getCollectionSnapshot()?.bypass===true;}catch{return false;}}
function ownedModels(){try{return (getCollectionSnapshot()?.models||[]).filter(m=>m&&typeof m==="object");}catch{return [];}}
function modelHas(m,c){const name=String(m.name||"").toLowerCase(),parts=Array.isArray(m.components)?m.components:[];return m.type===c.type||name.includes(c.name.toLowerCase())||parts.includes(c.id+"_body");}
function ownedCharacterIds(){const s=new Set();for(const m of ownedModels())for(const cs of Object.values(LEGENDARY))for(const c of cs)if(modelHas(m,c))s.add(c.id);return s;}
function politicalFactionHome(id){const key=Object.keys(FACTION_PROFILES).find(k=>FACTION_PROFILES[k].id===id);if(FACTION_PROFILES[key]?.passive)return null;return CITIES.find(c=>FACTION_PROFILES[c.id]?.id===id)||null;}
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
 if(city.passiveOccupant){byId("grand-city-detail").innerHTML='<div class="grand-city-heading"><span class="grand-city-dot dwarfs"></span><div><h3>'+city.name+'</h3><small>Neutral passive holding · Thaurgath the Rune-Eater</small></div></div><p>'+city.description+'</p><div class="grand-stat"><b>Ruler</b><span>'+city.ruler+'</span></div><div class="grand-stat"><b>Location</b><span>'+city.terrain+'</span></div><p class="subtle">This city cannot be selected as a starting faction. Its dragon does not move or take campaign turns, but must be defeated to occupy the hold.</p>';byId("grand-world-map").querySelectorAll(".grand-city").forEach(m=>{m.classList.toggle("selected",Number(m.dataset.city)===city.id);m.classList.toggle("other-faction",Number(m.dataset.city)!==city.id);m.setAttribute("aria-pressed",String(Number(m.dataset.city)===city.id));});byId("grand-campaign-begin").disabled=true;return;}
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
 choices.innerHTML=Object.values(FACTION_PROFILES).filter(p=>!p.passive).map(p=>{
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
 const link=(a,b,cost=1,kind="land")=>{if(!edges[a]||!edges[b]||a===b)return;if(!edges[a].some(e=>e.to===b))edges[a].push({to:b,cost,kind});if(!edges[b].some(e=>e.to===a))edges[b].push({to:a,cost,kind});};
 const unlink=(a,b)=>{
  if(edges[a])edges[a]=edges[a].filter(e=>e.to!==b);
  if(edges[b])edges[b]=edges[b].filter(e=>e.to!==a);
 };
 const route=(a,b,kind="land",regionA=null,regionB=null)=>routes.push({a,b,kind,regionA,regionB,marks:[],cuts:[0,1]});
 const positions=CITY_POSITIONS;
 const seaLinks=new Set(["3-7","3-8","3-9","3-27","6-7","6-8","6-17","8-21","8-25","8-26","17-27","21-25","25-26"]);
 const isSeaLink=(a,b)=>seaLinks.has([a,b].sort((x,y)=>x-y).join("-"));
 for(const c of CITIES){const [x,y]=positions[c.id];add({id:"city-"+c.id,region:c.id,type:"city",label:c.name,x,y});}
 for(const c of CITIES){
  // Moonspire and Silvershade are island ports: connect each city directly
  // to its harbour, with no redundant inland crossroads.
  if(c.id===7||c.id===8||c.id===17||c.id===26||c.id===27)continue;
  const [x,y]=positions[c.id],ns=(REGION_NEIGHBORS[c.id]||[]).filter(id=>!isSeaLink(c.id,id)&&id!==7&&id!==8&&id!==17);
  const avg=ns.length?ns.reduce((p,id)=>({x:p.x+positions[id][0]/ns.length,y:p.y+positions[id][1]/ns.length}),{x:0,y:0}):{x:x+18,y:y+12};
  const jx=Math.max(30,Math.min(1270,x+(avg.x-x)*.12)),jy=Math.max(30,Math.min(720,y+(avg.y-y)*.12));
  const junction=c.id===6?{x:205,y:150}:{x:jx,y:jy}; add({id:"crossroads-"+c.id,region:c.id,type:"crossroads",label:c.name+" crossroads",x:junction.x,y:junction.y});
  route("city-"+c.id,"crossroads-"+c.id,"land",c.id,c.id);
 }
 const ports=[
  {id:"port-3",region:3,type:"port",label:"Goldhaven harbour",x:369,y:311,city:3},
  {id:"port-6",region:6,type:"port",label:"Aelthir harbour",x:119,y:76,city:6},
  {id:"port-7",region:7,type:"port",label:"Moonspire harbour",x:561,y:163,city:7},
  {id:"port-8",region:8,type:"port",label:"Silvershade harbour",x:773,y:226,city:8},
  {id:"port-17",region:17,type:"port",label:"Barrowmere harbour",x:150,y:397,city:17},
  {id:"port-9",region:9,type:"port",label:"Ironhold harbour",x:488,y:333,city:9},
  {id:"port-25",region:25,type:"port",label:"Eastwatch harbour",x:882,y:365,city:25},
  {id:"port-21",region:21,type:"port",label:"Dreadmarch harbour",x:1192,y:418,city:21},
  {id:"port-26",region:26,type:"port",label:"Freebooter's Haven harbour",x:952,y:280,city:26},
  {id:"port-27",region:27,type:"port",label:"Blackflag Cay harbour",x:365,y:400,city:27}
 ];
 for(const p of ports){add(p);route("city-"+p.city,p.id,"land",p.city,p.city);}
 const seen=new Set();
 for(const c of CITIES)for(const other of REGION_NEIGHBORS[c.id]||[]){
  const key=[c.id,other].sort((a,b)=>a-b).join("-");
  if(seen.has(key))continue;seen.add(key);
  // Remove the redundant southern sea lane into Moonspire. The northern passage remains.
  if(key==="3-7")continue;
  if(seaLinks.has(key)){
   const pA=ports.find(p=>p.city===c.id)||ports.find(p=>p.city===other);
   const pB=ports.find(p=>p.city===other&&p!==pA)||ports.find(p=>p.city===c.id&&p!==pA);
   if(pA&&pB){
    if(key==="6-7"){
     const join={id:"moonspire-north-sea-waypoint",region:7,type:"seaRoute",label:"Moonspire northern passage",x:440,y:55};add(join);/* The northern route from Aelthir already reaches this junction via the Silvershade–Aelthir sea lane. Keep only the final harbour spur here; the direct southern duplicate is intentionally omitted. */route(join.id,pB.id,"sea",c.id,other);
    }else if(key==="6-8"){
     const waypoints=[{id:"aelthir-north-sea-waypoint",region:6,type:"seaRoute",label:"Northern sea passage",x:190,y:42},{id:"greyward-north-sea-waypoint",region:7,type:"seaRoute",label:"Greyward northern passage",x:315,y:32},{id:"moonspire-north-sea-waypoint",region:7,type:"seaRoute",label:"Moonspire northern passage",x:440,y:55},{id:"eastern-north-sea-waypoint",region:8,type:"seaRoute",label:"Eastern northern sea passage",x:600,y:48},{id:"silvershade-north-sea-waypoint",region:8,type:"seaRoute",label:"Silvershade northern passage",x:720,y:80},{id:"silvershade-coastal-sea-waypoint",region:8,type:"seaRoute",label:"Silvershade coastal approach",x:770,y:150}];
     for(const n of waypoints)add(n);const chain=[pA.id,...waypoints.map(n=>n.id),pB.id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
    }else if(key==="3-8"){
     const waypoints=[{id:"goldhaven-north-sea-1",region:3,type:"seaRoute",label:"Goldhaven northern passage",x:400,y:300},{id:"goldhaven-north-sea-2",region:8,type:"seaRoute",label:"Central coast passage",x:450,y:275},{id:"goldhaven-north-sea-3",region:8,type:"seaRoute",label:"Northern island approach",x:540,y:250},{id:"goldhaven-north-sea-4",region:8,type:"seaRoute",label:"Silvershade approach",x:650,y:245},{id:"goldhaven-north-sea-5",region:8,type:"seaRoute",label:"Silvershade coastal passage",x:730,y:215}];for(const n of waypoints)add(n);const chain=[pA.id,...waypoints.map(n=>n.id),pB.id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
    }else if(key==="3-7"){
     const waypoints=[{id:"goldhaven-moonspire-south-1",region:3,type:"seaRoute",label:"Goldhaven–Moonspire southern passage",x:405,y:330},{id:"goldhaven-moonspire-south-2",region:7,type:"seaRoute",label:"Greyward Isles approach",x:480,y:275},{id:"goldhaven-moonspire-south-3",region:7,type:"seaRoute",label:"Moonspire harbour approach",x:535,y:210}];for(const n of waypoints)add(n);const chain=[ports.find(p=>p.city===3).id,...waypoints.map(n=>n.id),ports.find(p=>p.city===7).id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
    }else if(key==="3-9"){
     const gold={id:"goldhaven-south-sea-waypoint",region:3,type:"seaRoute",label:"Goldhaven southern sea passage",x:340,y:365};
     const iron={id:"ironhold-coastal-sea-waypoint",region:9,type:"seaRoute",label:"Ironhold coastal passage",x:410,y:355};
     const junction={id:"goldhaven-ironhold-sea-junction",region:3,type:"seaRoute",label:"Southern sea-lanes junction",x:275,y:390};
     const barrow={id:"barrowmere-southern-sea-approach",region:17,type:"seaRoute",label:"Barrowmere southern approach",x:205,y:395};
     for(const n of [gold,iron,junction,barrow])add(n);
     route(pA.id,gold.id,"sea",3,9);route(gold.id,junction.id,"sea",3,9);
     route(pB.id,iron.id,"sea",3,9);route(iron.id,junction.id,"sea",3,9);
     route(junction.id,barrow.id,"sea",3,17);route(barrow.id,ports.find(p=>p.city===17).id,"sea",3,17);
    }else if(key==="8-25"){
     const waypoints=[{id:"eastwatch-silvershade-coast-1",region:25,type:"seaRoute",label:"Eastern coast passage",x:861,y:322},{id:"eastwatch-silvershade-coast-2",region:8,type:"seaRoute",label:"Island approach",x:830,y:270}];for(const n of waypoints)add(n);const chain=[ports.find(p=>p.city===25).id,...waypoints.map(n=>n.id),ports.find(p=>p.city===8).id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
    }else if(key==="8-21"){
     const waypoints=[{id:"dreadmarch-silvershade-coast-1",region:21,type:"seaRoute",label:"Dreadmarch northern passage",x:1125,y:300},{id:"dreadmarch-silvershade-coast-2",region:8,type:"seaRoute",label:"Eastern island approach",x:950,y:260},{id:"dreadmarch-silvershade-coast-3",region:8,type:"seaRoute",label:"Silvershade island approach",x:825,y:250}];for(const n of waypoints)add(n);const chain=[ports.find(p=>p.city===8).id,...waypoints.slice().reverse().map(n=>n.id),ports.find(p=>p.city===21).id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
    }else if(key==="21-25"){
     const waypoints=[{id:"eastwatch-dreadmarch-channel",region:21,type:"seaRoute",label:"Eastern channel",x:1120,y:370}];for(const n of waypoints)add(n);const chain=[ports.find(p=>p.city===21).id,...waypoints.map(n=>n.id),ports.find(p=>p.city===25).id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
    }else if(key==="8-26"){
      const waypoints=[{id:"freebooter-north-channel",region:26,type:"seaRoute",label:"Freebooter northern channel",x:865,y:205},{id:"freebooter-west-approach",region:26,type:"seaRoute",label:"Far Shoals approach",x:915,y:230}];for(const n of waypoints)add(n);const chain=[ports.find(p=>p.city===8).id,...waypoints.map(n=>n.id),ports.find(p=>p.city===26).id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
     }else if(key==="25-26"){
      const waypoints=[{id:"eastwatch-far-shoals-channel",region:25,type:"seaRoute",label:"Far Shoals channel",x:900,y:330},{id:"far-shoals-south-approach",region:26,type:"seaRoute",label:"Southern island approach",x:940,y:310}];for(const n of waypoints)add(n);const chain=[ports.find(p=>p.city===25).id,...waypoints.map(n=>n.id),ports.find(p=>p.city===26).id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
     }else if(key==="3-27"){
      const waypoints=[{id:"goldhaven-blackflag-coast-1",region:3,type:"seaRoute",label:"Southern Goldhaven passage",x:385,y:355},{id:"goldhaven-blackflag-coast-2",region:27,type:"seaRoute",label:"Blackflag Cay approach",x:390,y:400}];for(const n of waypoints)add(n);const chain=[ports.find(p=>p.city===3).id,...waypoints.map(n=>n.id),ports.find(p=>p.city===27).id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
     }else if(key==="17-27"){
      const waypoints=[{id:"barrowmere-blackflag-west",region:17,type:"seaRoute",label:"Western pirate passage",x:205,y:405},{id:"barrowmere-blackflag-east",region:27,type:"seaRoute",label:"Blackflag Cay western approach",x:290,y:425}];for(const n of waypoints)add(n);const chain=[ports.find(p=>p.city===17).id,...waypoints.map(n=>n.id),ports.find(p=>p.city===27).id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
     }else if(key==="6-17"){
     const waypoints=[{id:"barrowmere-west-sea-1",region:17,type:"seaRoute",label:"Western coastal passage",x:62,y:155},{id:"barrowmere-west-sea-2",region:17,type:"seaRoute",label:"Western island passage",x:48,y:260},{id:"barrowmere-west-sea-3",region:17,type:"seaRoute",label:"Barrowmere outer passage",x:64,y:365}];
     for(const n of waypoints)add(n);
     const chain=[pA.id,...waypoints.map(n=>n.id),pB.id];for(let i=1;i<chain.length;i++)route(chain[i-1],chain[i],"sea",c.id,other);
    }else route(pA.id,pB.id,"sea",c.id,other);
   }
   continue;
  }
  // Island cities have no mainland road links; onward travel is by sea.
  if(c.id===7||other===7||c.id===8||other===8||c.id===17||other===17||c.id===26||other===26||c.id===27||other===27)continue;
  // Grinhold shares a short approach before the road branches toward Skullcrag
  // and Ironjaw Pass, avoiding two almost parallel roads leaving the stronghold.
  if(c.id===11||other===11)continue;
  route("crossroads-"+c.id,"crossroads-"+other,"land",c.id,other);
 }
 add({id:"grinhold-road-fork",region:11,type:"crossroads",label:"Grinhold western road fork",x:1080,y:264});
 route("crossroads-11","grinhold-road-fork","land",11,11);
 route("grinhold-road-fork","crossroads-13","land",11,13);
 route("grinhold-road-fork","crossroads-14","land",11,14);
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
   wanted.filter(f=>!(f.type==="river"&&(c.id===1||c.id===2))).slice(0,3).forEach((f,i)=>{
    const t=target.regionA===c.id?(0.24+i*0.12):(0.76-i*0.12);
    target.marks.push({t,region:c.id,type:f.type,label:c.name+" "+f.label.toLowerCase()});
   });
  }
 }
 // Give every visible geographic feature its own clickable point of interest.
 // These correspond to the forest groves, mountain chains and river courses drawn
 // on the map background; their access paths join the nearest road junction.
 const mapFeatures=[
   {id:"farm-poi-goldfields",region:3,type:"farm",label:"Goldhaven grain farms",x:405,y:260,population:1800,prosperity:62},
   {id:"village-poi-westmere",region:2,type:"village",label:"Pinewatch village",x:210,y:330,population:950,prosperity:48},
   {id:"farm-poi-southlands",region:4,type:"farm",label:"Southlands farmsteads",x:430,y:505,population:1450,prosperity:54},
   {id:"village-poi-ironhold",region:9,type:"village",label:"Stonepick village",x:455,y:300,population:720,prosperity:50},
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
  {id:"river-poi-north",region:3,type:"river",label:"Goldhaven river bend",x:315,y:190},
  {id:"river-poi-south",region:4,type:"river",label:"Southlands river ford",x:530,y:390},
  {id:"river-poi-east",region:10,type:"river",label:"Eastern river crossing",x:690,y:365}
 ];
 for(const p of mapFeatures){
  add(p);
  // Geographic features join the land road network only; a nearby harbour
  // must not pull an inland trail into a sea lane.
  const junctions=Object.values(nodes).filter(n=>n.type==="crossroads");
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
   // A road and a sea lane may visually cross, but they are not connected.
   // Transfers between land and sea are permitted only at the named harbour
   // POIs (the shared endpoints of the city-road and harbour-sea routes).
   if(a.kind!==b.kind)continue;
    if(a.kind==="land"&&![a.regionA,a.regionB].some(id=>id===b.regionA||id===b.regionB))continue;
   const q=nodes[b.a],q2=nodes[b.b],hit=intersection(p,p2,q,q2);if(!hit)continue;
   const sharedId=(a.kind==="sea"?"sea-crossing-":"crossing-")+Math.round(hit.x)+"-"+Math.round(hit.y);
   if(!nodes[sharedId])add({id:sharedId,region:a.regionA||b.regionA,type:a.kind==="sea"?"seaRoute":"crossroads",label:a.kind==="sea"?"Sea-lane junction":"Road crossroads",x:hit.x,y:hit.y});
   a.cuts.push(hit.t);b.cuts.push(hit.u);
   a.marks.push({t:hit.t,nodeId:sharedId});b.marks.push({t:hit.u,nodeId:sharedId});
  }
 }
 for(const r of routes){
  const a=nodes[r.a],b=nodes[r.b],distance=Math.hypot(b.x-a.x,b.y-a.y);
  // Treat route endpoints, intersections and named POIs as fixed anchors.
  // Fill each span evenly so generated waypoints do not bunch up beside anchors,
  // while long spans still receive intermediate points.
  const anchors=[...new Set([...r.cuts,...r.marks.map(mark=>mark.t)].map(t=>Math.max(0,Math.min(1,Number(t.toFixed(5))))))].sort((x,y)=>x-y);
  const cuts=[...anchors];
  const targetSpacing=62;
  for(let i=1;i<anchors.length;i++){
   const span=(anchors[i]-anchors[i-1])*distance;
   const segments=Math.max(1,Math.ceil(span/targetSpacing));
   for(let j=1;j<segments;j++)cuts.push(anchors[i-1]+(anchors[i]-anchors[i-1])*j/segments);
  }
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
  for(let i=1;i<ids.length;i++)link(ids[i-1],ids[i],1,r.kind);
 }
 // Explicitly merge selected map points into single shared junctions.
 // Average their positions so short adjoining routes remain visually natural.
 const mergeMapPoints=(ids,label)=>{
  const existing=ids.filter(id=>nodes[id]);
  if(existing.length<2)return;
  const keep=existing[0],members=new Set(existing);
  const mergedNodes=existing.map(id=>nodes[id]);
  nodes[keep].x=mergedNodes.reduce((sum,n)=>sum+n.x,0)/mergedNodes.length;
  nodes[keep].y=mergedNodes.reduce((sum,n)=>sum+n.y,0)/mergedNodes.length;
  if(label)nodes[keep].label=label;
  for(const id of existing.slice(1)){
   for(const edge of edges[id]||[])if(edge.to!==keep&&!members.has(edge.to))edges[keep].push({...edge});
  }
  for(const [from,list] of Object.entries(edges)){
   const rewritten=[];
   for(const edge of list){
    const to=members.has(edge.to)?keep:edge.to;
    if(from===to)continue;
    if(!rewritten.some(e=>e.to===to&&e.kind===edge.kind))rewritten.push({...edge,to});
   }
   edges[from]=rewritten;
  }
  for(const id of existing.slice(1)){delete nodes[id];delete edges[id];}
  edges[keep]=edges[keep].filter((edge,index,list)=>edge.to!==keep&&list.findIndex(e=>e.to===edge.to&&e.kind===edge.kind)===index);
 };
 mergeMapPoints(["sea-crossing-386-361","goldhaven-blackflag-coast-1"],"Goldhaven–Blackflag sea junction");
 mergeMapPoints(["waypoint-ironhold-coastal-sea-waypoint-goldhaven-ironhold-sea-junction-2","goldhaven-south-sea-waypoint"],"Goldhaven southern sea junction");
 // Keep Goldhaven's southern sea lane connected through the shared Ironhold waypoint
 // and the named junction, rather than allowing a direct shortcut between them.
 const goldhavenSouthLane="waypoint-goldhaven-south-sea-waypoint-goldhaven-ironhold-sea-junction-1";
 const ironholdCoastalJunction="waypoint-ironhold-coastal-sea-waypoint-goldhaven-ironhold-sea-junction-2";
 const sharedSeaJunction="goldhaven-ironhold-sea-junction";
 if(nodes[goldhavenSouthLane]&&nodes[ironholdCoastalJunction]&&nodes[sharedSeaJunction]){
  // This section runs before the later local unlink helper is initialised, so
  // remove the shortcut directly from the already-built adjacency lists.
  for(const [from,list] of Object.entries(edges)){
   edges[from]=list.filter(edge=>!((from===goldhavenSouthLane&&edge.to===sharedSeaJunction)||(from===sharedSeaJunction&&edge.to===goldhavenSouthLane)));
  }
  link(goldhavenSouthLane,ironholdCoastalJunction,1,"sea");
  link(ironholdCoastalJunction,sharedSeaJunction,1,"sea");
 }
 mergeMapPoints(["feature-1-6-land-3","feature-1-6-land-2","feature-1-6-land-1"],"Oldreach–Aelthir road junction");
 mergeMapPoints(["feature-1-2-land-5","feature-1-2-land-4"],"Oldreach western road junction");
 // Give the Goldhaven river bend a direct road connection to the northern mountain chain.
 const riverRoadPoint={id:"river-north-mountain-road-waypoint",region:3,type:"road",label:"Northern river–mountain road",x:292,y:151};
 if(!nodes[riverRoadPoint.id])add(riverRoadPoint);
 link("river-poi-north",riverRoadPoint.id,1,"land");
 link(riverRoadPoint.id,"mountain-poi-north",1,"land");
 // Promote the existing route waypoint to a named, traversable crossroads.
 const oldreachAelthirCrossroads=nodes["waypoint-crossroads-2-crossroads-6-2"];
 if(oldreachAelthirCrossroads){
  oldreachAelthirCrossroads.type="crossroads";
  oldreachAelthirCrossroads.label="Oldreach–Aelthir Crossroads";
 }
 // Local campaign-map revisions: explicit roads, villages, harbours and river crossings.
 const removeWithoutSplice=(id)=>{
  if(!nodes[id])return;
  for(const list of Object.values(edges))for(let i=list.length-1;i>=0;i--)if(list[i].to===id)list.splice(i,1);
  delete nodes[id];delete edges[id];
 };

 // Keep harbour access as a short dog-leg off the main sea lanes.
 const aelthirSeaDogleg={id:"aelthir-harbour-sea-dogleg",region:6,type:"seaRoute",label:"Aelthir harbour sea spur",x:96,y:57};
 add(aelthirSeaDogleg);
 unlink("port-6","waypoint-port-6-barrowmere-west-sea-1-1");
 unlink("port-6","waypoint-port-6-aelthir-north-sea-waypoint-1");
 link("port-6",aelthirSeaDogleg.id,1,"sea");
 link(aelthirSeaDogleg.id,"waypoint-port-6-barrowmere-west-sea-1-1",1,"sea");
 link(aelthirSeaDogleg.id,"waypoint-port-6-aelthir-north-sea-waypoint-1",1,"sea");
 // Barrowmere gets a single northern sea-lane junction; all existing sea approaches
 // now meet the junction rather than terminating directly at the harbour.
 const barrowmereSeaDogleg={id:"barrowmere-harbour-sea-dogleg",region:17,type:"seaRoute",label:"Barrowmere harbour sea junction",x:150,y:366};
 const barrowmereSeaNeighbours=(edges["port-17"]||[]).filter(e=>e.kind==="sea").map(e=>e.to);
 add(barrowmereSeaDogleg);
 for(const seaNodeId of barrowmereSeaNeighbours){
  unlink("port-17",seaNodeId);
  link(barrowmereSeaDogleg.id,seaNodeId,1,"sea");
 }
 link("port-17",barrowmereSeaDogleg.id,1,"sea");
 const removeAndSplice=(id)=>{
  if(!nodes[id])return;
  const neighbours=(edges[id]||[]).filter(e=>nodes[e.to]).map(e=>({id:e.to,kind:e.kind||"land"}));
  for(let i=0;i<neighbours.length;i++)for(let j=i+1;j<neighbours.length;j++)if(neighbours[i].id!==neighbours[j].id&&neighbours[i].kind===neighbours[j].kind)link(neighbours[i].id,neighbours[j].id,1,neighbours[i].kind);
  removeWithoutSplice(id);
 };
 const renameNode=(oldId,newId,overrides={})=>{
  const node=nodes[oldId];if(!node)return null;
  if(nodes[newId]&&newId!==oldId)removeAndSplice(newId);
  const oldEdges=edges[oldId]||[];delete nodes[oldId];delete edges[oldId];Object.assign(node,overrides,{id:newId});nodes[newId]=node;edges[newId]=oldEdges;
  for(const [from,list] of Object.entries(edges)){for(const edge of list)if(edge.to===oldId)edge.to=newId;const seen=new Set();edges[from]=list.filter(e=>{const k=e.to+"|"+e.kind;if(seen.has(k))return false;seen.add(k);return e.to!==from;});}
  return node;
 };
 const mergeInto=(sourceId,targetId,label)=>{
  const source=nodes[sourceId],target=nodes[targetId];if(!source||!target)return;
  if(label)target.label=label;
  for(const edge of edges[sourceId]||[])if(edge.to!==targetId)link(targetId,edge.to,edge.cost||1,edge.kind||"land");
  for(const list of Object.values(edges))for(const edge of list)if(edge.to===sourceId)edge.to=targetId;
  delete nodes[sourceId];delete edges[sourceId];
  for(const [from,list] of Object.entries(edges)){const seen=new Set();edges[from]=list.filter(e=>{const k=e.to+"|"+e.kind;if(from===e.to||seen.has(k))return false;seen.add(k);return true;});}
 };
 // Remove redundant/meaningless points, keeping their adjoining routes connected.
 removeAndSplice("crossroad-1");
 removeAndSplice("crossroads-1");
 removeAndSplice("feature-1-2-land-2");
 removeAndSplice("forest-poi-central");
 // Remove both shortcuts across the major river without splicing their neighbours together.
 // These nodes must not leave a replacement edge that bypasses the city.
 renameNode("waypoint-crossroads-2-crossroads-6-2","river-crossing-oldreach-aelthir",{type:"river",label:"Oldreach–Aelthir River Crossing"});
 removeWithoutSplice("river-crossing-oldreach-aelthir");
 removeWithoutSplice("waypoint-crossroads-2-crossroads-6-1");
 // Keep both map points, but remove their direct cross-river connection.
 unlink("feature-1-2-land-1","feature-1-6-land-3");
 // Goldhaven itself is the junction; discard the overlapping generated intersection.
 mergeInto("crossing-337-295","city-3","Goldhaven");
 mergeInto("crossing-338-295","city-3","Goldhaven");
 mergeInto("crossroads-3","city-3","Goldhaven");
 if(nodes["city-3"]){nodes["city-3"].type="city";nodes["city-3"].label="Goldhaven";}
 // Human and elven villages lie on the road from the Oldreach forest to Aelthir.
 const oldreachVillage={id:"village-poi-oldreach-human",region:2,type:"village",label:"Oldreach Watch village",x:128,y:177,population:780,prosperity:46,controllerFaction:"empire"};
 const aelthirVillage={id:"village-poi-aelthir-elf",region:6,type:"village",label:"Lethariel's Grove",x:151,y:132,population:620,prosperity:58,controllerFaction:"highElves"};
 for(const n of [oldreachVillage,aelthirVillage])add(n);
 link("forest-poi-west-1",oldreachVillage.id,1,"land");
 link(oldreachVillage.id,aelthirVillage.id,1,"land");
 link(aelthirVillage.id,"city-6",1,"land");
 // Goldhaven's western road crosses the nearby river, then runs north through a village to the northern mountain road.
 const goldhavenWestCrossing={id:"river-crossing-goldhaven-west",region:3,type:"river",label:"Goldhaven Western River Crossing",x:281,y:294};
 const goldhavenNorthVillage={id:"village-poi-goldhaven-north",region:3,type:"village",label:"Northbank village",x:258,y:226,population:840,prosperity:49,controllerFaction:"empire"};
 for(const n of [goldhavenWestCrossing,goldhavenNorthVillage])add(n);
 link("city-3",goldhavenWestCrossing.id,1,"land");
 link(goldhavenWestCrossing.id,goldhavenNorthVillage.id,1,"land");
 link(goldhavenNorthVillage.id,"waypoint-mountain-poi-north-crossroads-6-1",1,"land");
 // The western mountain road and river bend form a connected defensive road network.
 link("waypoint-mountain-poi-west-crossroads-3-1","river-poi-north",1,"land");
 link("farm-poi-goldfields","waypoint-mountain-poi-west-crossroads-3-1",1,"land");
 link("farm-poi-goldfields","goldhaven-north-sea-2",1,"sea");
 link("sea-crossing-386-361","goldhaven-north-sea-1",1,"sea");
 // A small coastal settlement provides a land connection to Goldhaven and a sea-lane connection.
 const southcoastHarbourVillage={id:"village-poi-goldhaven-harbour",region:3,type:"village",label:"Southcoast Harbour Village",x:319,y:344,population:690,prosperity:52,controllerFaction:"empire",harbour:true};
 add(southcoastHarbourVillage);
 link(southcoastHarbourVillage.id,"city-3",1,"land");
 link(southcoastHarbourVillage.id,"waypoint-goldhaven-south-sea-waypoint-goldhaven-ironhold-sea-junction-1",1,"sea");

 // Coastal travel can only enter or leave the sea at a named harbour.
 // Existing save files are migrated to this graph while city IDs remain stable.
 // Give every map point a unique human-readable label while preserving its stable ID.
 // Repeated generic labels receive a numbered suffix.
 const usedLabels=new Set();
 for(const node of Object.values(nodes)){
  const base=String(node.label||node.id||"Map point").trim()||String(node.id);
  let label=base,index=2;
  while(usedLabels.has(label.toLocaleLowerCase()))label=base+" ("+(index++)+")";
  node.label=label;usedLabels.add(label.toLocaleLowerCase());
 }
 // Blackflag Cay is intentionally a multi-exit pirate port. Preserve its existing links and add the requested bypass around the harbour.
 link("waypoint-barrowmere-blackflag-east-port-27-1","waypoint-ironhold-coastal-sea-waypoint-goldhaven-ironhold-sea-junction-2",1,"sea");
 return {nodes,edges};
}
function svgEl(name,attrs={}){const el=document.createElementNS("http://www.w3.org/2000/svg",name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el;}
function saveCampaign(){try{localStorage.setItem("warGameGrandCampaignStateV1",JSON.stringify(activeCampaign));}catch{}}
function populationRace(group){return recruitmentRaceForCulture(group?.culture);}
function ownerRace(owner,campaign){return FACTION_BY_ID[owner]?.race||campaign?.factionStates?.find(f=>f.id===owner)?.race||"human";}
function migrationRisk(region,campaign){
 if(!region)return 1;
 let risk=Math.max(0,Math.min(1,(Number(region.settlement?.unrest)||0)/100))*0.45;
 if(region.settlement?.besiegedBy)risk+=0.8;
 if(campaign.warRegions?.includes(region.id))risk+=0.65;
 for(const neighborId of region.neighbors||[]){
  const neighbor=campaign.regions.find(r=>r.id===neighborId);if(!neighbor)continue;
  const a=politicalOwner(region),b=politicalOwner(neighbor);
  if(a!==b&&campaign.activeWars?.includes(campaignWarKey(a,b)))risk+=0.3;
 }
 if((campaign.armies||[]).some(a=>a.region===region.id&&campaign.activeWars?.some(w=>w.split(":").includes(a.owner||a.factionId))))risk+=0.2;
 return Math.min(1,risk);
}
function migrationOccupancy(region){
 const p=region?.settlement?.population;if(!p)return 1;
 const capacity=Math.max(1,Number(p.capacity)||((CITY_PROFILES[region.id]?.population||Number(p.total)||1)*1.5));
 return Math.max(0,Number(p.total)||0)/capacity;
}
function migrationTargetAccepts(region,group,campaign){
 const race=populationRace(group),rulerRace=ownerRace(politicalOwner(region),campaign);
 return rulerRace==="greenskin"?race==="greenskin":race!=="greenskin";
}
function safeMigrationPath(campaign,from,to,owner){
 if(!from||!to||from.id===to.id||politicalOwner(from)!==owner||politicalOwner(to)!==owner)return null;
 const queue=[[from.id]],seen=new Set([from.id]);
 while(queue.length){
  const path=queue.shift(),id=path[path.length-1];
  if(id===to.id)return path;
  const region=campaign.regions.find(r=>r.id===id);
  for(const nextId of region?.neighbors||[]){
   if(seen.has(nextId))continue;
   const next=campaign.regions.find(r=>r.id===nextId);
   if(!next||politicalOwner(next)!==owner)continue;
   if(next.id!==to.id&&migrationRisk(next,campaign)>=0.55)continue;
   if(next.id===to.id&&migrationRisk(next,campaign)>=0.65)continue;
   seen.add(nextId);queue.push([...path,nextId]);
  }
 }
 return null;
}
function addPopulationGroup(region,culture,count){
 if(count<=0)return;
 const population=region.settlement.population;
 let group=population.groups.find(g=>g.culture===culture);
 if(!group){group={culture,count:0};population.groups.push(group);}
 group.count+=count;population.total=Math.max(0,Number(population.total)||0)+count;
}
function displacePopulationGroup(region,group,count){
 count=Math.min(Math.max(0,Math.floor(Number(count)||0)),Math.max(0,Math.floor(Number(group?.count)||0)));
 if(!count)return 0;
 const population=region.settlement.population;
 group.count-=count;population.total=Math.max(0,(Number(population.total)||0)-count);
 population.displaced=Math.max(0,Number(population.displaced)||0)+count;
 if(!Array.isArray(population.displacedGroups))population.displacedGroups=[];
 let displaced=population.displacedGroups.find(g=>g.culture===group.culture);
 if(!displaced){displaced={culture:group.culture,count:0};population.displacedGroups.push(displaced);}
 displaced.count+=count;
 return count;
}
function enforcePopulationResidency(campaign){
 for(const region of campaign.regions||[]){
  const groups=region.settlement?.population?.groups||[];
  for(const group of groups){
   if(!group||group.count<=0)continue;
   if(!migrationTargetAccepts(region,group,campaign))displacePopulationGroup(region,group,group.count);
  }
  const population=region.settlement?.population;if(population)population.groups=population.groups.filter(g=>g.count>0);
 }
}
function settleMonthlyMigration(campaign){
 const plans=[];
 const regions=(campaign.regions||[]).filter(r=>r.settlement?.population);
 enforcePopulationResidency(campaign);
 for(const source of regions){
  const owner=politicalOwner(source),sourceRisk=migrationRisk(source,campaign),sourceOccupancy=migrationOccupancy(source);
  for(const group of [...(source.settlement.population.groups||[])].sort((a,b)=>(b.count||0)-(a.count||0))){
   if(group.count<=0)continue;
   let best=null;
   for(const target of regions){
    if(target.id===source.id||politicalOwner(target)!==owner||!migrationTargetAccepts(target,group,campaign))continue;
    const path=safeMigrationPath(campaign,source,target,owner);if(!path)continue;
    const targetRisk=migrationRisk(target,campaign),targetOccupancy=migrationOccupancy(target);
    const targetArchitecture=String(target.settlement.architectureType||cityArchitectureType(CITIES.find(c=>c.id===target.id)));
    const sourceArchitecture=String(source.settlement.architectureType||cityArchitectureType(CITIES.find(c=>c.id===source.id)));
    const targetPreference=targetArchitecture===populationRace(group)?1:0,sourcePreference=sourceArchitecture===populationRace(group)?1:0;
    const riskGain=sourceRisk-targetRisk,spaceGain=sourceOccupancy-targetOccupancy;
    const score=riskGain*2+spaceGain+(targetPreference-sourcePreference)*0.5-(path.length-1)*0.025;
    const motivated=riskGain>=0.12||spaceGain>=0.12||(targetPreference>sourcePreference&&targetOccupancy<=sourceOccupancy+0.05);
    if(!motivated||score<=0)continue;
    if(!best||score>best.score)best={target,score};
   }
   if(best)plans.push({source,target:best.target,group,culture:group.culture,count:Math.min(group.count,Math.max(1,Math.floor(Math.min(1000,group.count*0.01))))});
  }
 }
 // Execute planned transfers only after selection; no migrant moves twice in one month.
 for(const plan of plans){
  const current=plan.source.settlement.population.groups.find(g=>g.culture===plan.culture);
  if(!current||current.count<plan.count)continue;
  current.count-=plan.count;plan.source.settlement.population.total=Math.max(0,plan.source.settlement.population.total-plan.count);
  addPopulationGroup(plan.target,plan.culture,plan.count);
 }
 for(const region of regions){
  const p=region.settlement.population;p.groups=p.groups.filter(g=>g.count>0);
  p.total=p.groups.reduce((n,g)=>n+Math.max(0,Number(g.count)||0),0);
 }
}
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
 for(const place of campaign.minorSettlements||[]){const population=Math.max(0,Number(place.population)||0),rate=place.prosperity>=65 ? 0.0015 : 0.0005;place.population=Math.max(0,Math.round(population*(1+rate)));}
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
 const pirate=isPirateFaction(activeCampaign.playerPoliticalFaction);
 const race=FACTION_BY_ID[activeCampaign.playerPoliticalFaction]?.race||"human",basic=race==="undead"?"skeletons":race==="greenskin"?"goblins":race==="dwarf"?"dwarfInfantry":"swordsmen";
 const options=[
  {key:"melee",label:pirate?"Deckhands":activeCampaign.playerPoliticalFaction==="verdantCourt"?"Wood Elf dual-wielders":race==="dwarf"?"Dwarf melee infantry":race==="elf"?"High Elf spearmen":race==="greenskin"?"Goblin mobs":"Melee infantry",type:basic,weapon:race==="elf"&&activeCampaign.playerPoliticalFaction!=="verdantCourt"?"spear":"handWeapon",min:5,max:30,modelType:basic,modelWeapon:race==="elf"&&activeCampaign.playerPoliticalFaction!=="verdantCourt"?"spear":"handWeapon"},
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
  ]:race==="undead"?[
   {key:"zombies",label:"Zombies",type:"zombies",weapon:"handWeapon",min:5,max:30,modelType:"zombies",modelWeapon:"handWeapon"},
   {key:"skeletonBows",label:"Skeleton archers",type:"skeletons",weapon:"handWeapon",rangedWeapon:"bow",min:5,max:30,modelType:"skeletons",modelWeapon:"bow"},
   {key:"skeletonHorses",label:"Skeleton cavalry",type:"skeletonHorses",weapon:"handWeapon",min:5,max:15,modelType:"skeletonHorses",modelWeapon:"handWeapon"},
   {key:"skeletonDragon",label:"Skeleton dragon",type:"skeletonDragon",weapon:"handWeapon",min:1,max:1,modelType:"skeletonDragon",modelWeapon:"handWeapon"},
   {key:"skeletonGiant",label:"Skeleton giant",type:"skeletonGiant",weapon:"handWeapon",min:1,max:1,modelType:"skeletonGiant",modelWeapon:"handWeapon"},
   {key:"skeletonTroll",label:"Skeleton trolls",type:"skeletonTroll",weapon:"handWeapon",min:3,max:6,modelType:"skeletonTroll",modelWeapon:"handWeapon"}
  ]:[{key:"archers",label:"Archers",type:"archers",weapon:"handWeapon",rangedWeapon:"bow",min:5,max:30,modelType:"archers",modelWeapon:"bow"}]),
  ...(race==="human"?[
   {key:"crossbowmen",label:"Crossbow infantry",type:"swordsmen",weapon:"handWeapon",rangedWeapon:"crossbow",min:5,max:30,modelType:"swordsmen",modelWeapon:"crossbow"},
   {key:"firearmInfantry",label:"Firearm infantry",type:"swordsmen",weapon:"handWeapon",rangedWeapon:"firearm",min:5,max:30,modelType:"swordsmen",modelWeapon:"firearm"}
  ]:[]),
  ...(race==="elf"||race==="greenskin"?[]:[{key:"spearmen",label:"Spearmen",type:basic,weapon:"spear",min:5,max:30,modelType:basic,modelWeapon:"spear"}]),
  ...(race==="greenskin"?[]:[{key:"halberdiers",label:"Halberdiers",type:basic,weapon:"halberd",min:5,max:30,modelType:basic,modelWeapon:"halberd"}]),
  {key:"greatWeapons",label:"Great-weapon infantry",type:basic,weapon:"greatWeapon",min:5,max:30,modelType:basic,modelWeapon:"greatWeapon"},
  ...(race!=="dwarf"&&race!=="greenskin"&&race!=="undead"?[{key:"cavalry",label:race==="elf"?"High Elf cavalry":"Cavalry",type:"cavalry",weapon:"handWeapon",min:5,max:15,modelType:"cavalry"}]:[]),
  ...(race==="greenskin"||race==="undead"?[]:[{key:"artillery",label:race==="elf"?"Bolt thrower":race==="dwarf"?"Dwarf cannon":"Cannon",type:race==="elf"?"boltThrower":"cannon",weapon:"handWeapon",min:race==="elf"?2:3,max:race==="elf"?2:3,modelType:race==="elf"?"boltThrower":"cannon",modelWeapon:"none",fixed:true,crewType:race==="dwarf"?"dwarfInfantry":"swordsmen",crewWeapon:race==="elf"?(activeCampaign.playerPoliticalFaction==="verdantCourt"?"handWeapon":"spear"):"handWeapon"}]),
  ...(race==="greenskin"?[]:race==="dwarf"?[
   {key:"dwarfCaptain",label:"Dwarf thane",type:"dwarfCaptain",weapon:"handWeapon",min:1,max:1,modelType:"dwarfCaptain",character:true},
   {key:"dwarfLord",label:"Dwarf lord",type:"dwarfLord",weapon:"handWeapon",min:1,max:1,modelType:"dwarfLord",character:true},
   {key:"dwarfKingHaldric",label:"King Haldric Stoneward",type:"dwarfKingHaldric",weapon:"handWeapon",min:1,max:1,modelType:"dwarfKingHaldric",character:true}
  ]:race==="undead"?[
   {key:"necromancer",label:"Necromancer",type:"necromancer",weapon:"handWeapon",min:1,max:1,modelType:"necromancer",character:true},
   {key:"masterNecromancer",label:"Master Necromancer",type:"masterNecromancer",weapon:"handWeapon",min:1,max:1,modelType:"masterNecromancer",character:true},
   {key:"vampireHero",label:"Vampire Thrall",type:"vampireHero",weapon:"handWeapon",min:1,max:1,modelType:"vampireHero",character:true},
   {key:"vampireLord",label:"Vampire Lord",type:"vampireLord",weapon:"handWeapon",min:1,max:1,modelType:"vampireLord",character:true}
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
 if(activeCampaign.playerPoliticalFaction==="verdantCourt")options.push({key:"woodElfChariot",label:"Wood Elf chariot",type:"elfChariot",weapon:"handWeapon",min:3,max:3,modelType:"elfChariot",fixed:true,crewType:"swordsmen",crewWeapon:"handWeapon"});
 if(pirate)return options.filter(o=>!["archers","crossbowmen","cavalry","spearmen"].includes(o.key)).map(o=>o.key==="firearmInfantry"?{...o,label:"Pirate handgunners"}:o.key==="artillery"?{...o,label:"Shipboard cannon"}:o);
  return options;
}
function assignedSiegeModelIds(){return new Set(playerArmies().flatMap(a=>(a.roster||[]).flatMap(u=>[u.machineModelId,...(u.crewModelIds||[])].filter(Boolean))));}
function optionMatchesModel(o,m){const woodElfStyle=activeCampaign.playerPoliticalFaction==="verdantCourt",needsDualWield=woodElfStyle&&(o.key==="melee"||String(o.key||"").startsWith("crew-"));return m?.faction===rosterFactionForPoliticalFaction(activeCampaign.playerPoliticalFaction)&&m.type===o.modelType&&(!o.modelWeapon||m.weapon===o.modelWeapon)&&(!needsDualWield||m.components?.includes("left_sword")||m.offhandWeapon); }
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
 if(o.fixed){const crew=availableCrewForOption(o).slice(0,o.min),woodElfStyle=activeCampaign.playerPoliticalFaction==="verdantCourt";return {type:o.type,models:o.min,weapon:"handWeapon",meleeWeapons:woodElfStyle?["handWeapon","offhandWeapon"]:["handWeapon"],dualWield:woodElfStyle,woodElfStyle,machineModelId:sample?.id||null,crewModelIds:crew.map(m=>m.id),siegeMachine:true};}
 if(o.type==="legendaryLord"||o.type==="shadowElf"||o.type==="pegasusChampion")return campaignCharacterConfig(activeCampaign.playerPoliticalFaction,{id:o.type==="legendaryLord"?"edric_voss":o.type==="shadowElf"?"lethariel_starweaver":"aelthir_dawnwing"});
 let weapon=o.weapon||"handWeapon",meleeWeapons=weapon==="handWeapon"?["handWeapon"]:["handWeapon",weapon],rangedWeapon=o.rangedWeapon||null;
 if(sample&&o.character&&!o.rangedWeapon){
  if(["bow","crossbow","firearm","longRifle"].includes(sample.weapon))rangedWeapon=sample.weapon;
  else if(["spear","lance","greatWeapon","halberd"].includes(sample.weapon)){weapon=sample.weapon;meleeWeapons=["handWeapon",sample.weapon];}
 }
 if(sample&&o.type==="cavalry"&&["spear","lance","greatWeapon","halberd"].includes(sample.weapon)){weapon=sample.weapon;meleeWeapons=["handWeapon",sample.weapon];}
 if(sample&&o.type==="cavalry"&&["bow","crossbow","firearm"].includes(sample.weapon))rangedWeapon=sample.weapon;
 const woodElfStyle=activeCampaign.playerPoliticalFaction==="verdantCourt";const config={type:o.type,models,weapon,meleeWeapons,champion:false,upgrades:{},skills:{}};if(woodElfStyle){config.woodElfStyle=true;if(o.key==="melee"||o.character){config.dualWield=true;config.weapon="handWeapon";config.meleeWeapons=["handWeapon","offhandWeapon"];config.shield=false;}if(o.key==="melee"||o.rangedWeapon)config.skills={skirmish:true};}
 if(rangedWeapon)config.rangedWeapon=rangedWeapon;if(sample&&o.character&&sample.mounted&&sample.mountType){config.mounted=true;config.mountType=sample.mountType;config.barding=!!sample.barding;}
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
function regionForArmy(army){return activeCampaign?.regions?.find(r=>r.id===army?.region)||null;}
function applyKhazVarrakArmour(config,army,region){if(!config||region?.id!==24||campaignArmyRace(army,activeCampaign)!=="dwarf"||politicalOwner(region)!==(army.owner||army.factionId))return config;if(config.magicArmour||config.dwarvenEnchantedArmour)return config;const type=config.type;if(!["dwarfInfantry","dwarfCaptain","dwarfLord","dwarfKingHaldric"].includes(type))return config;return {...config,dwarvenEnchantedArmour:true,magicArmour:true};}
function createPlayerArmyAtNode(nodeId){
  const node=activeCampaign?.graph?.nodes?.[nodeId],region=activeCampaign?.regions?.find(r=>Number(r.id)===Number(node?.region));
  if(!node||node.type!=="city"||!region||politicalOwner(region)!==activeCampaign.playerPoliticalFaction){campaignMessage("You can only muster a new army in a city you control.");return;}
  const id=activeCampaign.playerPoliticalFaction,number=playerArmies().length+1,armyId=id+"-army-"+activeCampaign.turn+"-"+number;
  const fresh={id:armyId,owner:id,factionId:id,name:"Army "+number,rosterFaction:rosterFactionForPoliticalFaction(id),roster:[],points:0,region:region.id,nodeId,movement:0,supplies:3,maxSupplies:3};
  activeCampaign.armies.push(fresh);activeCampaign.selectedArmyId=armyId;activeCampaign.selectedArmyPanelId=armyId;activeCampaign.selectedCampaignPanel="army";
  activeCampaign.commander.nodeId=nodeId;activeCampaign.commander.region=region.id;activeCampaign.commander.movement=0;
  campaignMessage("Formed "+fresh.name+" at "+region.name+". Recruit troops to build it.");
}
function mergeSelectedArmyWith(armyId){
  const target=selectedPlayerArmy(),source=playerArmies().find(a=>a.id===armyId);
  if(!target||!source||target.id===source.id||target.nodeId!==source.nodeId){campaignMessage("Armies can only merge when they are at the same location.");return;}
  if((target.roster||[]).length+(source.roster||[]).length>6){campaignMessage("These armies cannot merge yet: the combined force would exceed the six-unit limit. Disband or consolidate units first.");return;}
  target.roster.push(...(source.roster||[]));source.roster=[];target.points=campaignArmyCost(target);activeCampaign.armies=activeCampaign.armies.filter(a=>a.id!==source.id);
  activeCampaign.selectedArmyId=target.id;activeCampaign.selectedArmyPanelId=target.id;activeCampaign.selectedCampaignPanel="army";syncPlayerArmyState();
  campaignMessage(target.name+" absorbed "+source.name+". All units have joined the selected army.");
}
function renderArmyManagement(){
 const host=byId("grand-army-management");if(!host||!activeCampaign)return;ensureLogisticsState(activeCampaign);
 const armies=playerArmies(),army=selectedPlayerArmy();if(!army){host.textContent="No field army.";return;}
 const faction=army.rosterFaction||rosterFactionForPoliticalFaction(activeCampaign.playerPoliticalFaction),treasury=selectedFactionTreasury(),catalog=recruitCatalog();
 const labels={goblins:"Goblin mobs",orcBoyz:"Orc Boyz",wolfRiders:"Goblin wolf riders",boarBoyz:"Orc boar riders",goblinHero:"Goblin Big Boss",goblinLord:"Goblin Warboss",orcHero:"Orc Big Boss",orcLord:"Orc Warboss",catapult:"Goblin Rock Lobber",swordsmen:"Melee infantry",archers:"Archers",dwarfInfantry:"Dwarf infantry",cavalry:"Cavalry",cannon:"Cannon",boltThrower:"Bolt thrower",captain:"Captain",lord:"Lord",dwarfCaptain:"Dwarf thane",dwarfLord:"Dwarf lord",dwarfKingHaldric:"King Haldric",legendaryLord:"Edric Voss",shadowElf:"Lethariel Starweaver",pegasusChampion:"Aelthir, the Dawnwing",rifleman:"Marksman",captainWeiss:"Marta Weiss",youngDragon:"Young dragon",dragon:"Dragon",ancientDragon:"Ancient dragon",deepflameDragon:"Thaurgath the Rune-Eater"};
 const options=catalog.map(o=>{const available=availableForRecruitment(o,army),config=optionConfig(o,o.min),price=campaignRecruitmentGoldCost(config,faction);return '<option value="'+o.key+'" '+(available<o.min?'disabled':'')+'>'+o.label+' · '+available+' available · '+price+' gold minimum</option>';}).join("");
 const roster=(army.roster||[]).map((u,i)=>{const label=labels[u.type]||u.type,o=optionForUnit(u,catalog),can=!!o&&!o.character&&!o.fixed&&u.models<o.max&&availableForRecruitment(o,army)>0;return '<div class="grand-army-unit"><span><b>'+label+'</b><small>'+u.models+' models · '+unitCost(u,faction)+' pts · '+campaignArmyUpkeep({roster:[u],rosterFaction:faction})+' gold wages/turn</small></span><div class="grand-army-unit-actions"><button type="button" class="secondary-button" data-replenish="'+i+'" '+(!can?'disabled':'')+'>Replenish +1</button><button type="button" class="secondary-button grand-disband-button" data-disband="'+i+'">Disband</button></div></div>';}).join("");
  host.innerHTML='<div class="grand-army-management-head"><span class="grand-army-summary">'+(army.roster||[]).length+' / 6 units</span></div><div class="grand-army-summary">'+(FACTION_BY_ID[treasury?.id]?.race==="greenskin"?"unlimited greenskin recruitment":recruitmentPoolAvailable(treasury,activeCampaign.regions.find(r=>r.id===army.region))+" local trained recruits")+' · '+civilianPopulation(activeCampaign.regions.find(r=>r.id===army.region)).toLocaleString()+' civilians at this location · '+(army.supplies??3)+'/'+(army.maxSupplies||3)+' supply turns · '+({supplied:"supplied",low:"low supplies",starving:"starving",raided:"supply line raided"}[army.supplyStatus]||"supply status unknown")+'</div>'+(roster||'<p class="subtle">This army has no troops yet. Recruit a unit below.</p>')+'<button type="button" class="secondary-button" id="grand-raid-supply">Raid enemy supply line</button><small class="grand-supply-note">Supplies refill while connected to friendly settlements. Cut off armies consume reserves; at zero, starvation causes losses.</small><div class="grand-recruit-box"><label class="grand-army-field">Train reinforcements<select id="grand-recruit-type">'+options+'</select></label><label class="grand-army-field">Models<input id="grand-recruit-count" type="number" min="1" max="30" value="5"></label><button type="button" class="primary-button" id="grand-recruit-unit" '+((army.roster||[]).length>=6?'disabled':'')+'>Train reinforcements</button><small>Uses compatible miniatures you own, local recruits and gold. Models already deployed in any of your armies cannot be recruited again.</small></div>';
 byId("grand-raid-supply").addEventListener("click",raidEnemySupplyLine);
 
 
 host.querySelectorAll("[data-disband]").forEach(button=>button.addEventListener("click",()=>{const index=Number(button.dataset.disband),unit=army.roster[index];if(!unit)return;const label=labels[unit.type]||unit.type;if(!window.confirm("Disband "+label+" ("+unit.models+" models)? The models return to your available collection. Recruitment gold is not refunded."))return;army.roster.splice(index,1);army.points=campaignArmyCost(army);syncPlayerArmyState();campaignMessage("Disbanded "+label+"; "+unit.models+" models are available for recruitment again. No gold was refunded.");}));
 host.querySelectorAll("[data-replenish]").forEach(button=>button.addEventListener("click",()=>{const unit=army.roster[Number(button.dataset.replenish)],o=optionForUnit(unit,catalog);if(!unit||!o||o.character||o.fixed){campaignMessage("That unit cannot be replenished as ordinary rank-and-file.");return;}if(unit.models>=o.max||availableForRecruitment(o,army)<1){campaignMessage("No compatible unassigned model, recruitment-pool slot or civilian population is available.");return;}const price=Math.max(1,1+campaignEquipmentGoldCost({...unit,models:unit.models+1},faction)-campaignEquipmentGoldCost(unit,faction));if((treasury?.treasury||0)<price){campaignMessage("Not enough gold to replenish that unit.");return;}const region=activeCampaign.regions.find(r=>r.id===army.region);if(!consumeRecruitmentPool(treasury,region,1)||!consumeCivilianPopulation(region,1,treasury.race||FACTION_BY_ID[treasury.id]?.race||"human")){campaignMessage("Recruitment is limited by the pool and local civilian population.");return;}Object.assign(unit,applyKhazVarrakArmour(unit,army,region));unit.models++;treasury.treasury-=price;army.points=campaignArmyCost(army);syncPlayerArmyState();campaignMessage("Replenished "+(labels[unit.type]||unit.type)+" by one model for "+price+" gold; one civilian joined the army."+(unit.dwarvenEnchantedArmour?" Its mundane armour is replaced by rune-enchanted armour.":""));}));
 byId("grand-recruit-type").addEventListener("change",()=>{const o=catalog.find(x=>x.key===byId("grand-recruit-type").value);if(o){const input=byId("grand-recruit-count");input.min=o.min;input.max=o.max;input.value=o.min;}});
 byId("grand-recruit-unit").addEventListener("click",()=>{const o=catalog.find(x=>x.key===byId("grand-recruit-type").value);if(!o){campaignMessage("Choose a troop type first.");return;}if((army.roster||[]).length>=6){campaignMessage("This army already has six units.");return;}const count=o.fixed?o.min:Math.max(o.min,Math.min(o.max,Math.floor(Number(byId("grand-recruit-count").value)||o.min))),available=availableForRecruitment(o,army),populationCost=o.fixed?o.min:count;if(available<count){campaignMessage("You need "+count+" compatible models; only "+available+" are available after collection, recruitment-pool and civilian-population limits.");return;}let config=optionConfig(o,count);config=applyKhazVarrakArmour(config,army,regionForArmy(army));const price=campaignRecruitmentGoldCost(config,faction);if((treasury?.treasury||0)<price){campaignMessage("Not enough gold. This unit costs "+price+".");return;}const region=activeCampaign.regions.find(r=>r.id===army.region);if(!consumeRecruitmentPool(treasury,region,populationCost)||!consumeCivilianPopulation(region,populationCost,treasury.race||FACTION_BY_ID[treasury.id]?.race||"human")){campaignMessage("Recruitment is limited by the pool and local civilian population.");return;}army.roster.push(config);treasury.treasury-=price;army.points=campaignArmyCost(army);syncPlayerArmyState();campaignMessage("Recruited "+o.label+" ("+count+" models) for "+price+" gold; "+populationCost+" civilians joined the army."+(config.dwarvenEnchantedArmour?" Khaz Varrak\u0027s rune-forges replace its mundane armour with a magical version.":""));});
}
function renderCampaignMap(){
 if(!activeCampaign)return;
 const currentArmy=selectedPlayerArmy();if(currentArmy){activeCampaign.commander.nodeId=currentArmy.nodeId;activeCampaign.commander.region=currentArmy.region;activeCampaign.commander.movement=currentArmy.movement;}
 const host=byId("grand-map-live-wrap");let map=byId("grand-campaign-world-map");
 const firstRender=!map;if(!map){map=byId("grand-world-map").cloneNode(true);map.id="grand-campaign-world-map";map.querySelectorAll(".grand-city").forEach(m=>m.classList.remove("other-faction","selected","character-locked"));host.replaceChildren(map);installCampaignMapNavigation(host,map);}
 ensureRefugeeState(activeCampaign);
 const {nodes,edges}=activeCampaign.graph;
 map.querySelectorAll("#campaign-road-layer,#campaign-node-layer,#campaign-commander-layer,#campaign-army-layer,#campaign-refugee-layer").forEach(e=>e.remove());
 const selectedRefugee=activeCampaign.refugeeGroups.find(g=>g.id===activeCampaign.selectedRefugeeId&&g.owner===activeCampaign.playerPoliticalFaction);
 const movementNode=selectedRefugee?.nodeId||currentArmy?.nodeId||activeCampaign.commander.nodeId,movementLeft=selectedRefugee?.movement??currentArmy?.movement??activeCampaign.commander.movement;
 const selectedNodeId=nodes[activeCampaign.selectedMapNodeId]?activeCampaign.selectedMapNodeId:movementNode;activeCampaign.selectedMapNodeId=selectedNodeId;
 const road=svgEl("g",{id:"campaign-road-layer","pointer-events":"none"}),layer=svgEl("g",{id:"campaign-node-layer"}),token=svgEl("g",{id:"campaign-commander-layer","pointer-events":"none"}),armyLayer=svgEl("g",{id:"campaign-army-layer"}),refugeeLayer=svgEl("g",{id:"campaign-refugee-layer"});
 for(const [id,list] of Object.entries(edges))for(const e of list){if(id.localeCompare(e.to)>=0)continue;const a=nodes[id],b=nodes[e.to],isSea=a.type==="seaRoute"||b.type==="seaRoute";road.append(svgEl("path",{d:"M "+a.x+" "+a.y+" L "+b.x+" "+b.y,class:"campaign-road"+(isSea?" sea-road":"")+(a.type==="river"||b.type==="river"?" river-road":"")}));}
 paintFactionBanners(map,activeCampaign);
 for(const marker of map.querySelectorAll(".grand-city")){const cityId=Number(marker.dataset.city),region=activeCampaign.regions.find(r=>Number(r.id)===cityId||Number(r.cityId)===cityId),owner=region?politicalOwner(region):(FACTION_PROFILES[cityId]?.id||null);const circle=marker.querySelector("circle");if(!circle)continue;let border="#c7c7b5";if(owner===activeCampaign.playerPoliticalFaction)border="#79c987";else if(owner){const relation=campaignRelation(activeCampaign,activeCampaign.playerPoliticalFaction,owner),war=(activeCampaign.activeWars||[]).includes(campaignWarKey(activeCampaign.playerPoliticalFaction,owner));border=war||relation<=-50?"#df5b50":relation>=35?"#69c981":relation<=-20?"#e4a14e":"#d9c66e";}circle.setAttribute("stroke",border);circle.setAttribute("stroke-width","4");}
 map.querySelector("#grand-city-markers").before(road);
 for(const n of Object.values(nodes)){const isCurrent=n.id===movementNode,reach=(edges[movementNode]||[]).some(e=>e.to===n.id&&e.cost+nodeCost(n)-1<=movementLeft),g=svgEl("g",{class:"campaign-node "+n.type+(isCurrent?" current":"")+(n.id===selectedNodeId?" selected":"")+(reach?" reachable":""),tabindex:reach?"0":"-1",role:"button","aria-label":n.label+" (map point ID: "+n.id+")",transform:"translate("+n.x+" "+n.y+")","data-node":n.id});const pointTitle=svgEl("title");pointTitle.textContent=n.label+" · "+n.id;g.append(pointTitle);g.append(svgEl("circle",{r:16,class:"campaign-node-hit"}));const visiblePoint=svgEl("circle",{r:n.type==="city"?5:n.type==="crossroads"?3.5:5.5,class:"campaign-node-visible"});
  if(n.type==="village"){
   const villageRegion=activeCampaign.regions.find(r=>Number(r.id)===Number(n.region));
   const villageOwner=villageRegion?politicalOwner(villageRegion):null;
   const villageProfile=FACTION_BY_ID[villageOwner]||FACTION_PROFILES[Number(n.region)];
   if(villageProfile?.colours){visiblePoint.setAttribute("fill",villageProfile.colours.main);visiblePoint.setAttribute("stroke",villageProfile.colours.accent);visiblePoint.setAttribute("stroke-width","2");}
  }
  g.append(visiblePoint);if(n.type==="port")g.append(svgEl("path",{d:"M-3 0 L3 0 M0 -4 L0 2 M-4 2 L4 2"}));if(n.type==="village"||n.type==="farm"){const symbol=svgEl("text",{x:0,y:4,"text-anchor":"middle",class:"campaign-node-symbol"});symbol.textContent=n.type==="farm"?"♧":"⌂";g.append(symbol);}layer.append(g);}
 map.querySelector("#grand-city-markers").after(layer);
 for(const army of activeCampaign.armies||[]){if(!army?.roster?.length)continue;const p=nodes[army.nodeId];if(!p)continue;const owner=army.owner||army.factionId,isPlayer=owner===activeCampaign.playerPoliticalFaction;const g=svgEl("g",{class:"campaign-army-token"+(isPlayer?" player-army-token":" enemy-army-token"),transform:"translate("+p.x+" "+(p.y-18)+")",role:"button",tabindex:"0","aria-label":(army.name||"Army")+" at "+(p.label||"unknown location")});g.append(svgEl("circle",{r:11,class:"campaign-army-token-circle"}));const t=svgEl("text",{x:0,y:4,"text-anchor":"middle",class:"campaign-army-token-label"});t.textContent=isPlayer?"♟":"⚔";g.append(t);const chooseArmy=()=>{lastCampaignNodeTap=null;if(isPlayer){activeCampaign.selectedArmyId=army.id;activeCampaign.commander.nodeId=army.nodeId;activeCampaign.commander.region=army.region;activeCampaign.commander.movement=army.movement||0;}activeCampaign.selectedArmyPanelId=army.id;activeCampaign.selectedCampaignPanel="army";activeCampaign.selectedRefugeeId=null;activeCampaign.selectedMapNodeId=army.nodeId;activeCampaign.lastEvent="Selected "+(army.name||"army")+". Double-tap a destination to move it.";saveCampaign();renderCampaignMap();};g.addEventListener("click",chooseArmy);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();chooseArmy();}});armyLayer.append(g);}
 map.append(armyLayer);
 const current=nodes[activeCampaign.commander.nodeId];token.append(svgEl("circle",{cx:current.x,cy:current.y-17,r:11,class:"commander-token"}));const initials=activeCampaign.commander.name.split(/\s+/).map(s=>s[0]).join("").slice(0,2).toUpperCase(),label=svgEl("text",{x:current.x,y:current.y-13,"text-anchor":"middle",class:"commander-initials"});label.textContent=initials;token.append(label);map.append(token);
 for(const group of activeCampaign.refugeeGroups){
  const p=nodes[group.nodeId];if(!p)continue;
  const own=group.owner===activeCampaign.playerPoliticalFaction,selected=group.id===activeCampaign.selectedRefugeeId;
  const g=svgEl("g",{class:"campaign-refugee-token"+(selected?" selected":"")+(own?" player-refugee":""),transform:"translate("+p.x+" "+(p.y+19)+")",role:"button",tabindex:own?"0":"-1","aria-label":group.count+" refugees from "+group.originName,"pointer-events":own?"all":"none"});
  g.append(svgEl("circle",{r:11,class:"refugee-token-circle"}));
  const t=svgEl("text",{x:0,y:4,"text-anchor":"middle",class:"refugee-token-label"});t.textContent="⚑";g.append(t);
  if(own){const choose=()=>{lastCampaignNodeTap=null;activeCampaign.selectedRefugeeId=group.id;activeCampaign.lastEvent="Selected "+group.count.toLocaleString()+" refugees. Choose a connected road to move them.";renderCampaignMap();};g.addEventListener("click",choose);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose();}});}
  refugeeLayer.append(g);
 }
 map.append(refugeeLayer);
 layer.querySelectorAll("[data-node]").forEach(g=>{const select=()=>{const id=g.dataset.node,now=Date.now(),previous=lastCampaignNodeTap;activeCampaign.selectedMapNodeId=id;activeCampaign.selectedCampaignPanel="location";activeCampaign.selectedArmyPanelId=null;const refugeeSelected=activeCampaign.refugeeGroups.some(group=>group.id===activeCampaign.selectedRefugeeId&&group.owner===activeCampaign.playerPoliticalFaction);if(previous&&previous.id===id&&now-previous.time<=500){lastCampaignNodeTap=null;moveCommander(id);return;}lastCampaignNodeTap={id,time:now};if(!refugeeSelected)activeCampaign.selectedRefugeeId=null;renderCampaignMap();};g.addEventListener("click",select);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activeCampaign.selectedMapNodeId=g.dataset.node;activeCampaign.selectedCampaignPanel="location";activeCampaign.selectedArmyPanelId=null;renderCampaignMap();}});});
 const n=nodes[selectedNodeId]||nodes[activeCampaign.commander.nodeId];const settlementRegion=activeCampaign.regions.find(r=>Number(r.id)===Number(n.region));byId("grand-campaign-turn").textContent="TURN "+activeCampaign.turn;const playerState=activeCampaign.factionStates.find(f=>f.id===activeCampaign.playerPoliticalFaction);if(playerState)playerState.upkeep=playerArmies().reduce((sum,a)=>sum+campaignArmyUpkeep(a),0);byId("grand-campaign-treasury").textContent=activeCampaign.treasury+" gold · +"+(playerState?.income||0)+" / −"+(playerState?.upkeep||0);const compactTreasury=byId("grand-treasury-open");if(compactTreasury)compactTreasury.firstChild.textContent=String(activeCampaign.treasury)+" ";const netTreasury=(playerState?.income||0)-(playerState?.upkeep||0);const netLabel=byId("grand-treasury-net");if(netLabel)netLabel.textContent=(netTreasury>=0?"+":"")+netTreasury;
 byId("grand-campaign-commander").innerHTML=selectedRefugee?"<strong>⚑ Civilian refugees</strong><span>"+selectedRefugee.count.toLocaleString()+" people · "+selectedRefugee.culture+" · "+selectedRefugee.movement+"/"+selectedRefugee.maxMovement+" MP</span>":"<strong>♟ "+activeCampaign.commander.name+"</strong><span>"+(activeCampaign.commander.kind==="legendary"?"Legendary":"Commander")+" · "+activeCampaign.commander.movement+"/"+activeCampaign.commander.maxMovement+" MP"+(currentArmy&&campaignArmyRace(currentArmy,activeCampaign)==="greenskin"?" · Boredom "+Math.max(-4,Math.min(10,Number.isFinite(currentArmy.boredom)?currentArmy.boredom:-4)):"")+"</span>";
  const detailHost=byId("grand-campaign-node-detail");detailHost.replaceChildren();
  const panelMode=activeCampaign.selectedCampaignPanel||"location",selectedArmyId=activeCampaign.selectedArmyPanelId,inspectedArmy=(activeCampaign.armies||[]).find(a=>a.id===selectedArmyId);
  const armyManagement=byId("grand-army-management");let battleRegion=null;
  if(panelMode==="army"&&inspectedArmy){
   const owner=inspectedArmy.owner||inspectedArmy.factionId,state=activeCampaign.factionStates.find(f=>f.id===owner),models=(inspectedArmy.roster||[]).reduce((sum,u)=>sum+Math.max(0,Number(u.models)||0),0);
   const title=document.createElement("strong");title.textContent="♟ "+(inspectedArmy.name||"Army");detailHost.append(title);
   const line=document.createElement("span");line.textContent=(state?.name||owner)+" · "+(nodes[inspectedArmy.nodeId]?.label||"Unknown location")+" · "+models+" models · "+(inspectedArmy.points||campaignArmyCost(inspectedArmy))+" pts · "+(inspectedArmy.movement||0)+" movement left";detailHost.append(line);
   const hint=document.createElement("span");hint.textContent=owner===activeCampaign.playerPoliticalFaction?"Double-tap a map destination to move this army.":"Enemy force — inspection only.";detailHost.append(hint);
   if(owner===activeCampaign.playerPoliticalFaction){
    const coLocated=playerArmies().filter(a=>a.id!==inspectedArmy.id&&a.nodeId===inspectedArmy.nodeId&&a.roster?.length);
    if(coLocated.length){const mergeTitle=document.createElement("span");mergeTitle.textContent="Friendly armies here";detailHost.append(mergeTitle);for(const other of coLocated){const btn=document.createElement("button");btn.type="button";btn.className="secondary-button";btn.textContent="Merge "+(other.name||"army")+" into "+(inspectedArmy.name||"this army");btn.disabled=(inspectedArmy.roster||[]).length+(other.roster||[]).length>6;btn.title=btn.disabled?"Combined army would exceed the six-unit limit":"";btn.addEventListener("click",()=>mergeSelectedArmyWith(other.id));detailHost.append(btn);}}
   }
   if(armyManagement)armyManagement.hidden=owner!==activeCampaign.playerPoliticalFaction;
  }else{
   const title=document.createElement("strong");title.textContent=(n.type==="city"?"⌂ ":"◆ ")+n.label;detailHost.append(title);const pointRef=document.createElement("span");pointRef.className="grand-map-point-reference";pointRef.textContent="Map point ID: "+n.id;detailHost.append(pointRef);
   if(n.type==="city"&&settlementRegion?.settlement){
    const s=settlementRegion.settlement,owner=politicalOwner(settlementRegion),line=document.createElement("span");
    line.textContent=(FACTION_BY_ID[owner]?.name||FACTIONS[owner]?.name||owner||"Unclaimed")+" · "+Math.round(s.population?.total||0).toLocaleString()+" people · Food "+(s.foodStores??8)+"/"+(s.maxFoodStores||8)+(s.besiegedBy?" · BESIEGED":"");detailHost.append(line);
    const cityInfo=document.createElement("span");cityInfo.textContent=(CITIES.find(c=>Number(c.id)===Number(n.region))?.terrain||"Settlement")+" · "+(settlementRegion.status||"Settlement");detailHost.append(cityInfo);const incomeInfo=document.createElement("span");incomeInfo.textContent="Income "+campaignCityIncome(settlementRegion,activeCampaign)+" gold per turn (including trade)";detailHost.append(incomeInfo);
   }else{const typeLabel=({crossroads:"Road junction",port:"Port",river:"River crossing",forest:"Forest trail",mountain:"Mountain pass",marsh:"Marsh track",coast:"Coastal track",plain:"Open-country track",village:"Village",farm:"Farm"}[n.type]||"");if(typeLabel){const typeLine=document.createElement("span");typeLine.textContent=typeLabel;detailHost.append(typeLine);}if(n.type==="village"||n.type==="farm"){const place=(activeCampaign.minorSettlements||[]).find(p=>p.id===n.id);if(place){const owner=politicalOwner(settlementRegion),populationLine=document.createElement("span");populationLine.textContent="Population "+Math.round(place.population).toLocaleString()+" · "+(FACTION_BY_ID[owner]?.name||owner||"Unclaimed");detailHost.append(populationLine);const incomeLine=document.createElement("span");incomeLine.textContent="Local income "+Math.round(Math.sqrt(Math.max(0,place.population))*.12+Math.max(0,place.prosperity)*.04)+" gold per turn · no recruitment or fortifications";detailHost.append(incomeLine);}}}
   if(armyManagement)armyManagement.hidden=true;
   battleRegion=n.type==="city"?settlementRegion:null;
  }
 const playerId=activeCampaign.playerPoliticalFaction,defenderId=battleRegion&&politicalOwner(battleRegion);

 if(panelMode==="location"&&battleRegion&&politicalOwner(battleRegion)===playerId&&battleRegion.settlement&&!battleRegion.settlement.besiegedBy){
  const st=battleRegion.settlement,stockButton=document.createElement("button");stockButton.type="button";stockButton.className="secondary-button";stockButton.textContent="Stock city provisions · 40 gold";
  stockButton.disabled=(st.foodStores||0)>=12||(selectedFactionTreasury()?.treasury||0)<40;
  stockButton.addEventListener("click",()=>{const funds=selectedFactionTreasury();if(!funds||funds.treasury<40){campaignMessage("Not enough gold to stock city provisions.");return;}if(st.besiegedBy){campaignMessage("A besieged city cannot receive provisions.");return;}funds.treasury-=40;st.maxFoodStores=12;st.foodStores=Math.min(12,(st.foodStores||0)+3);campaignMessage(battleRegion.name+" stores provisions for "+st.foodStores+" siege turns.");});
  byId("grand-campaign-node-detail").append(stockButton);
 }
  if(panelMode==="location"&&battleRegion&&politicalOwner(battleRegion)===playerId&&battleRegion.settlement){
   const buildingsButton=document.createElement("button");buildingsButton.type="button";buildingsButton.className="secondary-button";buildingsButton.textContent="Buildings";buildingsButton.addEventListener("click",()=>{const existing=detailHost.querySelector(".grand-building-placeholder");if(existing){existing.remove();return;}const box=document.createElement("div");box.className="grand-building-placeholder";const heading=document.createElement("strong");heading.textContent="City construction";const note=document.createElement("span");note.textContent="Building construction interface reserved for a future update. No buildings can be constructed yet.";box.append(heading,note);detailHost.append(box);});detailHost.append(buildingsButton);
   const recruitArmyButton=document.createElement("button");recruitArmyButton.type="button";recruitArmyButton.className="primary-button";recruitArmyButton.textContent="Recruit new army";recruitArmyButton.addEventListener("click",()=>createPlayerArmyAtNode(n.id));detailHost.append(recruitArmyButton);
  }
 byId("grand-campaign-event").textContent=activeCampaign.lastEvent||"Select a highlighted place connected by road.";renderArmyManagement();renderDiplomacy();if(firstRender){const scale=map.clientWidth/1300;host.scrollLeft=Math.max(0,current.x*scale-host.clientWidth/2);host.scrollTop=Math.max(0,current.y*scale-host.clientHeight/2);}
}
function launchCampaignBattle(region,attackingArmyOverride=null,defendingArmyOverride=null,targetNodeId=null){
 if(!activeCampaign||!region||typeof window.startPoliticalCampaignBattle!=="function")return;
 const playerId=activeCampaign.playerPoliticalFaction,playerArmy=attackingArmyOverride||selectedPlayerArmy();
 const targetId=targetNodeId||"city-"+region.id;
 const node=activeCampaign.graph.nodes[targetId];
 const stationedAtTarget=campaignArmyAtNode(activeCampaign,targetId,playerArmy).filter(a=>(a.owner||a.factionId)!==playerId);
 const enemyId=defendingArmyOverride?(defendingArmyOverride.owner||defendingArmyOverride.factionId):(stationedAtTarget[0]?(stationedAtTarget[0].owner||stationedAtTarget[0].factionId):politicalOwner(region));
 const occupying=stationedAtTarget.filter(a=>(a.owner||a.factionId)===enemyId);
 if(defendingArmyOverride&&!occupying.includes(defendingArmyOverride))occupying.unshift(defendingArmyOverride);
 if(!enemyId||enemyId===playerId||!playerArmy?.roster?.length)return;
 declareCampaignWar(activeCampaign,playerId,enemyId);
 // All hostile armies sharing the battle node fight as one defending force.
 let defenderArmies=occupying.filter(a=>(a.owner||a.factionId)===enemyId&&a.roster?.length);
 if(!defenderArmies.length){
  const fallback=factionArmy(activeCampaign,enemyId);
  if(fallback?.roster?.length)defenderArmies=[fallback];
 }
 if(!defenderArmies.length){activeCampaign.lastEvent="Cannot muster a valid defending army for this battle.";renderCampaignMap();return;}
 // Friendly armies on nodes directly connected to the battle location can volunteer as reinforcements.
 const attackerArmies=[playerArmy],adjacentIds=new Set((activeCampaign.graph.edges[targetId]||[]).map(e=>e.to));
 for(const candidate of playerArmies()){
  if(candidate===playerArmy||!candidate.roster?.length||candidate.foughtThisTurn)continue;
  const candidateNode=candidate.nodeId||("city-"+candidate.region);
  if(!adjacentIds.has(candidateNode))continue;
  if(window.confirm("Commit "+(candidate.name||"a nearby friendly army")+" to this battle at "+(node?.label||region.name)+"?")){
   attackerArmies.push(candidate);
  }
 }
 const attackerFaction=playerArmy.rosterFaction||rosterFactionForPoliticalFaction(playerId);
 const defenderFaction=defenderArmies[0].rosterFaction||rosterFactionForPoliticalFaction(enemyId);
 const combine=(armies)=>{const entries=[];for(const army of armies){const roster=(army.roster||[]).map(u=>({...u}));entries.push({army,start:entries.reduce((n,e)=>n+e.roster.length,0),roster});}return {entries,roster:entries.flatMap(e=>e.roster)};};
 const attackers=combine(attackerArmies),defenders=combine(defenderArmies);
 const started=window.startPoliticalCampaignBattle({army:attackers.roster,faction:attackerFaction,enemyArmy:defenders.roster,enemyFaction:defenderFaction,onComplete:result=>{
  const originalPlayerRoster=attackers.roster.map(u=>({...u})),originalEnemyRoster=defenders.roster.map(u=>({...u}));
  const survivors=result.playerUnits||[],enemySurvivors=result.enemyUnits||[];
  const distribute=(side,units,armies,faction)=>{
   for(const entry of side.entries){
    const end=entry.start+entry.roster.length;
    entry.army.roster=entry.roster.map((config,i)=>{const survivor=units[entry.start+i];return {...config,models:Math.max(0,survivor?.models??0),currentDamage:survivor?.damage||0,currentWounds:survivor?.characterWounds};}).filter(config=>config.models>0);
    entry.army.startingModels=entry.roster.reduce((sum,u)=>sum+Math.max(0,Number(u.models)||0),0);
    entry.army.points=Math.max(0,Math.round(entry.army.roster.reduce((sum,u)=>sum+unitCost(u,entry.army.rosterFaction||faction),0)));
    entry.army.foughtThisTurn=true;
    if(result.won&&side===attackers){entry.army.nodeId=targetId;entry.army.region=node?.region??region.id;}
   }
  };
  distribute(attackers,survivors,attackerArmies,attackerFaction);
  distribute(defenders,enemySurvivors,defenderArmies,defenderFaction);
  const playerCollapsed=attackerArmies.every(a=>collapseCasterlessUndeadArmy(a));
  const enemyCollapsed=defenderArmies.every(a=>collapseCasterlessUndeadArmy(a));
  const winningArmy=result.won?playerArmy:defenderArmies[0],losingArmy=result.won?defenderArmies[0]:playerArmy;
  let necromancyMessage="";
  if(result.won&&campaignArmyRace(playerArmy,activeCampaign)==="undead"&&!playerCollapsed){
   const necromancy=raiseBattleCasualties(playerArmy,originalEnemyRoster,enemySurvivors,activeCampaign);
   necromancyMessage=" Necromancy raised "+necromancy.raised+" model(s)"+(necromancy.reserve?"; "+necromancy.reserve+" remain in the reserve until they can form useful units":"")+".";
  }
  awardGreenskinMomentum(activeCampaign,winningArmy,2);awardGreenskinMomentum(activeCampaign,losingArmy,-2);
  awardGreenskinPlunder(activeCampaign,winningArmy,Math.round(35+Math.max(0,losingArmy.points||0)*0.1));
  const playerState=activeCampaign.factionStates.find(f=>f.id===playerId),enemyState=activeCampaign.factionStates.find(f=>f.id===enemyId);
  if(result.won){
   if(node&&node.type!=="city"){
    if(selectedPlayerArmy()===playerArmy){activeCampaign.commander.nodeId=targetId;activeCampaign.commander.region=playerArmy.region;}
    activeCampaign.lastEvent="Victory at "+(node.label||"the battlefield")+". "+attackerArmies.length+" friendly army/armies engaged; "+defenderArmies.length+" defending army/armies defeated.";
   }else{
    const greenskinPlayer=campaignIsGreenskin(activeCampaign,playerId);
    const sackCity=greenskinPlayer&&window.confirm("Sack "+region.name+" for a large haul of plunder? Its usable population will be destroyed and future city income lost. Choose Cancel to occupy it instead.");
    const outcome=resolveGrandCampaignConquest(activeCampaign,region.id,playerId,{outcome:greenskinPlayer?(sackCity?"sack":"occupy"):"occupy",army:playerArmy});
    for(const army of attackerArmies){army.region=region.id;army.nodeId="city-"+region.id;}
    if(selectedPlayerArmy()===playerArmy){activeCampaign.commander.region=region.id;activeCampaign.commander.nodeId="city-"+region.id;}
    activeCampaign.lastEvent=(playerCollapsed?"Victory at "+region.name+", but your Undead force collapsed after losing its last Vampire or Necromancer.":"Victory at "+region.name+". "+outcome.summary)+necromancyMessage;
   }
   if(enemyState&&defenderArmies.every(a=>a.points<=0))enemyState.alive=false;
  }else{
   const home=playerState?.homeRegion||activeCampaign.startingRegion,homeNode="city-"+home;
   activeCampaign.commander.region=home;activeCampaign.commander.nodeId=homeNode;playerArmy.region=home;playerArmy.nodeId=homeNode;
   activeCampaign.lastEvent=playerCollapsed?"Defeat at "+region.name+". Your Undead force collapsed after losing its last Vampire or Necromancer.":!playerArmy.roster.length?"Defeat at "+region.name+". Your army has been destroyed; rebuild from your remaining miniatures and treasury.":"Defeat at "+region.name+". Your surviving forces retreat to "+(CITIES.find(c=>c.id===home)?.name||"your capital")+".";
   if(enemyState&&defenderArmies.every(a=>a.points<=0))enemyState.alive=false;
  }
  if(playerState){playerState.armyPoints=playerArmies().reduce((sum,a)=>sum+campaignArmyCost(a),0);playerState.roster=(playerArmies().find(a=>a.id===idMainArmy())||playerArmy).roster;playerState.upkeep=playerArmies().reduce((sum,a)=>sum+campaignArmyUpkeep(a),0);}
  if(enemyState){enemyState.armyPoints=(activeCampaign.armies||[]).filter(a=>(a.owner||a.factionId)===enemyId).reduce((sum,a)=>sum+campaignArmyCost(a),0);enemyState.roster=defenderArmies[0]?.roster||[];}
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
 ensureRefugeeState(activeCampaign);
 const {nodes,edges}=activeCampaign.graph;
 const selectedRefugee=activeCampaign.refugeeGroups.find(g=>g.id===activeCampaign.selectedRefugeeId&&g.owner===activeCampaign.playerPoliticalFaction);
 if(selectedRefugee){
  const from=selectedRefugee.nodeId,n=activeCampaign.graph.nodes[id],path=campaignMovementPath(activeCampaign,from,id),edge=(activeCampaign.graph.edges[from]||[]).find(e=>e.to===id);
  if(!n||!path||path.length<2||!edge){activeCampaign.lastEvent="Refugees can only move to an adjacent campaign-map node.";renderCampaignMap();return;}
  const cost=(edge.cost||1)+nodeCost(n)-1;
  if(cost>selectedRefugee.movement){activeCampaign.lastEvent="The refugees do not have enough movement to reach "+n.label+".";renderCampaignMap();return;}
  selectedRefugee.nodeId=id;selectedRefugee.region=n.region;selectedRefugee.movement-=cost;
  const city=activeCampaign.regions.find(r=>Number(r.id)===Number(n.region));
  if(city&&politicalOwner(city)===selectedRefugee.owner&&refugeeCityAccepts(city,selectedRefugee.culture,activeCampaign)){
   const count=absorbRefugees(activeCampaign,selectedRefugee,city);activeCampaign.lastEvent=count.toLocaleString()+" refugees safely resettle in "+city.name+".";
  }else{
   const priorEvent=activeCampaign.lastEvent;
   resolveRefugeeArmyEncounters(activeCampaign);
   if(activeCampaign.refugeeGroups.some(g=>g.id===selectedRefugee.id)&&activeCampaign.lastEvent===priorEvent)activeCampaign.lastEvent="Refugees move to "+n.label+". "+selectedRefugee.movement+" movement remaining.";
  }
  saveCampaign();renderCampaignMap();return;
 }
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
 const ownId=army?.owner||army?.factionId||activeCampaign.playerPoliticalFaction;
 const targetRegion=n.type==="city"?activeCampaign.regions.find(r=>Number(r.id)===Number(n.region)):null;
 const enemyAtDestination=campaignArmyAtNode(activeCampaign,id,army).find(other=>(other.owner||other.factionId)!==ownId);
 const enemyOwner=enemyAtDestination?(enemyAtDestination.owner||enemyAtDestination.factionId):(targetRegion?politicalOwner(targetRegion):null);
 if(enemyOwner&&enemyOwner!==ownId&&activeCampaign.factionStates.some(f=>f.id===enemyOwner&&f.alive)){
  const battleRegion=targetRegion||activeCampaign.regions.find(r=>Number(r.id)===Number(enemyAtDestination?.region))||activeCampaign.regions.find(r=>politicalOwner(r)===enemyOwner);
  if(battleRegion){launchCampaignBattle(battleRegion,army,enemyAtDestination||null,id);return;}
  activeCampaign.lastEvent="Could not find a campaign region for the enemy force at "+n.label+".";renderCampaignMap();return;
 }
 activeCampaign.commander.nodeId=id;activeCampaign.commander.region=n.region;activeCampaign.commander.movement=movement-cost;
 if(army){army.nodeId=id;army.region=n.region;army.movement=movement-cost;}
 activeCampaign.lastEvent=(army?.name||activeCampaign.commander.name)+(flying&&path.length>2?" leaps over an intervening army and moves along the road network to ":" moves to ")+n.label+". "+activeCampaign.commander.movement+" movement remaining.";
 resolveRefugeeArmyEncounters(activeCampaign);
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
function awardGreenskinPlunder(campaign,army,amount){
 if(!army||!campaignIsGreenskin(campaign,army.owner||army.factionId))return 0;
 const loot=Math.max(0,Math.round(amount));if(!loot)return 0;
 const owner=army.owner||army.factionId,state=campaign.factionStates?.find(f=>f.id===owner);
 if(state)state.treasury=Math.max(0,Number(state.treasury)||0)+loot;
 if(owner===campaign.playerPoliticalFaction)campaign.treasury=Math.max(0,Number(campaign.treasury)||0)+loot;
 army.lastPlunderTurn=campaign.turn;
 return loot;
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
function isPirateFaction(id){return id==="pirateFreehold"||id==="corsairHaven";}
function baseFactionRelation(a,b){
 const pa=profileForFaction(a),pb=profileForFaction(b);
 if(!pa||!pb)return 0;
 if(isPirateFaction(a)||isPirateFaction(b)){
  if(isPirateFaction(a)&&isPirateFaction(b))return -10;
  if(pa.race==="human"&&pb.race==="human")return -45;
 }
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
 campaign.activeAlliances=(campaign.activeAlliances||[]).filter(k=>k!==campaignAllianceKey(attackerId,defenderId));
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
  else setCampaignRelation(campaign,a.id,b.id,Math.min(isPirateFaction(a.id)||isPirateFaction(b.id)?baseFactionRelation(a.id,b.id):60,current+1));
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
 host.innerHTML='<h3>Diplomacy</h3>'+momentumNote+rows;
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
 awardGreenskinPlunder(campaign,factionArmy(campaign,winner.id),Math.round(35+Math.max(0,loser.armyPoints||0)*0.1));
 const winArmy=factionArmy(campaign,winner.id),loseArmy=factionArmy(campaign,loser.id);
 applyStrategicArmyLosses(winArmy,winner===attacker?.72:.82);
 applyStrategicArmyLosses(loseArmy,winner===attacker?.42:.55);
 for(const state of campaign.factionStates){const army=state.id===winner.id?winArmy:state.id===loser.id?loseArmy:null;if(army){state.armyPoints=army.points;state.roster=army.roster;if(!army.roster.length)state.alive=false;}}
 if(winner===attacker){
  const result=resolveGrandCampaignConquest(campaign,target.id,attacker.id,{army:attacking});
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
  const originalAttackingRoster=attackingArmy.roster.map(u=>({...u})),originalDefendingRoster=defendingArmy.roster.map(u=>({...u}));
  const update=(army,units,faction)=>{army.roster=army.roster.map((config,i)=>({...config,models:Math.max(0,units[i]?.models??0),currentDamage:units[i]?.damage||0,currentWounds:units[i]?.characterWounds})).filter(config=>config.models>0);};
  update(attackingArmy,result.playerUnits||[],attackerFaction);update(defendingArmy,result.enemyUnits||[],defenderFaction);
  const attackingCollapsed=collapseCasterlessUndeadArmy(attackingArmy),defendingCollapsed=collapseCasterlessUndeadArmy(defendingArmy);
  const winner=result.won?attackingArmy:defendingArmy,loser=result.won?defendingArmy:attackingArmy;
  let necromancyMessage="";
  const playerId=activeCampaign.playerPoliticalFaction;
  if((winner.owner||winner.factionId)===playerId&&campaignArmyRace(winner,activeCampaign)==="undead"&&!(winner===attackingArmy?attackingCollapsed:defendingCollapsed)){
   const defeatedRoster=winner===attackingArmy?originalDefendingRoster:originalAttackingRoster;
   const defeatedUnits=winner===attackingArmy?(result.enemyUnits||[]):(result.playerUnits||[]);
   const necromancy=raiseBattleCasualties(winner,defeatedRoster,defeatedUnits,activeCampaign);
   necromancyMessage=" Necromancy raised "+necromancy.raised+" model(s)"+(necromancy.reserve?"; "+necromancy.reserve+" remain in reserve":"")+".";
  }
  attackingArmy.points=Math.max(0,Math.round(attackingArmy.roster.reduce((sum,u)=>sum+unitCost(u,attackerFaction),0)));
  defendingArmy.points=Math.max(0,Math.round(defendingArmy.roster.reduce((sum,u)=>sum+unitCost(u,defenderFaction),0)));
  awardGreenskinMomentum(activeCampaign,winner,2);
  awardGreenskinMomentum(activeCampaign,loser,-2);
  awardGreenskinPlunder(activeCampaign,winner,Math.round(35+Math.max(0,loser.points||0)*0.1));
  if(result.won){winner.nodeId=targetNode;winner.region=activeCampaign.graph.nodes[targetNode]?.region??defendingArmy.region;}
  const loserState=activeCampaign.factionStates.find(f=>f.id===(loser.owner||loser.factionId)),home=loserState?.homeRegion||loser.region;
  loser.nodeId="city-"+home;loser.region=home;
  for(const army of [attackingArmy,defendingArmy]){const state=activeCampaign.factionStates.find(f=>f.id===(army.owner||army.factionId));if(state){state.roster=army.roster;state.armyPoints=army.points;if(!army.roster.length)state.alive=false;}}
  activeCampaign.lastEvent=(result.won?"Greenskin animosity attack wins a field battle. The defeated army retreats.":"Greenskin animosity attack is repelled. The attacking army retreats.")+necromancyMessage+(attackingCollapsed||defendingCollapsed?" An Undead force without a surviving Vampire or Necromancer collapsed after the battle.":"");
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
 awardGreenskinMomentum(campaign,winner,2);
 awardGreenskinMomentum(campaign,loser,-2);
 awardGreenskinPlunder(campaign,winner,Math.round(35+Math.max(0,loser.points||0)*0.1));
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
 if(faction.passive||FACTION_BY_ID[faction.id]?.passive)return faction.name+" remains passive.";
 const factionArmies=(campaign.armies||[]).filter(a=>(a.owner||a.factionId)===faction.id&&a.roster?.length);
 const army=factionArmy(campaign,faction.id);if(!army)return faction.name+" had no field army.";
 if(!factionArmies.includes(army))factionArmies.unshift(army);
 for(const fieldArmy of factionArmies){fieldArmy.movement=campaignArmyMovementProfile(fieldArmy,campaign).points;const animosity=processGreenskinAnimosity(campaign,fieldArmy);if(animosity.interrupted){faction.armyPoints=fieldArmy.points;faction.roster=fieldArmy.roster;return animosity.message;}}
 growFactionRecruitment(campaign,faction);
 const owned=campaign.regions.filter(r=>politicalOwner(r)===faction.id);
 faction.income=owned.reduce((sum,r)=>sum+campaignCityIncome(r,campaign),0)+campaignMinorSettlementIncome(campaign,faction.id);
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
 ensureSettlementState(activeCampaign);settleMonthlyPopulation(activeCampaign);settleMonthlyMigration(activeCampaign);
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
  if(!f||!f.alive||f.passive||FACTION_BY_ID[id]?.passive)continue;
  processed.push(runAIFactionTurn(activeCampaign,f));
 }
 const logisticsEvents=processCampaignLogistics(activeCampaign);
 ensureRefugeeState(activeCampaign);
 for(const group of [...activeCampaign.refugeeGroups]){
  group.movement=group.maxMovement||refugeeMovementForCulture(group.culture);
  if(group.owner!==activeCampaign.playerPoliticalFaction){
   const target=nearestRefugeeCity(activeCampaign,group,group.nodeId,Infinity);
   if(target)moveRefugeeColumn(activeCampaign,group,target.node,group.movement);
  }
 }
 resolveRefugeeArmyEncounters(activeCampaign);
 const player=states.find(f=>f.id===playerId);
 if(player){
  const owned=activeCampaign.regions.filter(r=>politicalOwner(r)===playerId);
  player.income=owned.reduce((sum,r)=>sum+campaignCityIncome(r,activeCampaign),0)+campaignMinorSettlementIncome(activeCampaign,playerId);
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
 for(const group of activeCampaign.refugeeGroups||[])group.movement=group.maxMovement||refugeeMovementForCulture(group.culture);
 activeCampaign.selectedRefugeeId=null;
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
 byId("grand-campaign-back").addEventListener("click",()=>{screen.hidden=true;menu.hidden=false;});byId("grand-world-back").addEventListener("click",()=>{if(!confirm("Return to campaign setup? Your current run will be replaced if you start a new campaign."))return;byId("grand-campaign-world").hidden=true;byId("grand-campaign-setup").hidden=false;renderFaction();});byId("grand-world-menu").addEventListener("click",()=>{screen.hidden=true;menu.hidden=false;});byId("grand-campaign-end-turn").textContent="End turn";byId("grand-campaign-end-turn").addEventListener("click",endCampaignTurn);
 const menuToggle=byId("grand-world-menu-toggle"),menuDropdown=byId("grand-world-menu-dropdown"),overlay=byId("grand-campaign-overlay"),overlayTitle=byId("grand-overlay-title"),overlayContent=byId("grand-overlay-content");
 const closeOverlay=()=>{overlay.hidden=true;overlayContent.replaceChildren();const diplomacy=byId("grand-campaign-diplomacy");if(diplomacy)byId("grand-world-sidebar").append(diplomacy);};
 menuToggle.addEventListener("click",()=>{menuDropdown.hidden=!menuDropdown.hidden;menuToggle.setAttribute("aria-expanded",String(!menuDropdown.hidden));});
 document.addEventListener("click",e=>{if(!e.target.closest(".grand-world-header-actions")){menuDropdown.hidden=true;menuToggle.setAttribute("aria-expanded","false");}});
 byId("grand-menu-diagnostics").addEventListener("click",()=>{menuDropdown.hidden=true;const toggle=byId("startup-diagnostics-toggle");if(toggle)toggle.click();});
 byId("grand-diplomacy-open").addEventListener("click",()=>{menuDropdown.hidden=true;overlayTitle.textContent="Diplomacy";overlay.hidden=false;overlayContent.replaceChildren();overlayContent.append(byId("grand-campaign-diplomacy"));renderDiplomacy();});
 byId("grand-treasury-open").addEventListener("click",()=>{menuDropdown.hidden=true;overlayTitle.textContent="Treasury";overlay.hidden=false;const state=activeCampaign?.factionStates?.find(f=>f.id===activeCampaign.playerPoliticalFaction);const income=state?.income||0,upkeep=state?.upkeep||0;overlayContent.innerHTML='<div class="grand-treasury-details"><div class="grand-stat"><b>Gold</b><span>'+Number(activeCampaign?.treasury||0).toLocaleString()+'</span></div><div class="grand-stat"><b>Income per turn</b><span>+'+income.toLocaleString()+'</span></div><div class="grand-stat"><b>Army upkeep</b><span>−'+upkeep.toLocaleString()+'</span></div><div class="grand-stat"><b>Net per turn</b><span>'+(income-upkeep>=0?"+":"")+(income-upkeep).toLocaleString()+'</span></div></div>';});
 byId("grand-overlay-close").addEventListener("click",closeOverlay);overlay.addEventListener("click",e=>{if(e.target===overlay)closeOverlay();});
 byId("grand-campaign-abandon").addEventListener("click",()=>{if(!confirm("Abandon this campaign? Your current run will be deleted."))return;try{localStorage.removeItem("warGameGrandCampaignStateV1");localStorage.removeItem("warGameGrandCampaignStart");}catch{}menuDropdown.hidden=true;screen.hidden=true;menu.hidden=false;});

 byId("grand-faction-choices").querySelectorAll("[data-faction]").forEach(b=>b.addEventListener("click",()=>{selectedFaction=b.dataset.faction;ensureValidCity();renderFaction();saveSelection();}));
 byId("grand-world-map").querySelectorAll(".grand-city").forEach(m=>{const select=()=>{const c=CITIES.find(x=>x.id===Number(m.dataset.city));if(!c)return;if(c.passiveOccupant){selectedCity=c.id;renderCity();return;}selectedPoliticalFaction=FACTION_PROFILES[c.id]?.id||selectedPoliticalFaction;selectedFaction=c.faction;selectedCity=c.id;saveSelection();renderFaction();};m.addEventListener("click",select);m.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select();}});});
 byId("grand-campaign-begin").addEventListener("click",()=>{const f=FACTIONS[selectedFaction],city=CITIES.find(c=>c.id===selectedCity),commander=commanderForPoliticalFaction(selectedPoliticalFaction);if(!city||city.id!==Number(Object.keys(FACTION_PROFILES).find(id=>FACTION_PROFILES[id].id===selectedPoliticalFaction))||!commander)return;const campaign=createInitialCampaignState(selectedFaction,city,commander);try{localStorage.setItem("warGameGrandCampaignStart",JSON.stringify({schemaVersion:5,mapId:MAP_ID,faction:selectedFaction,politicalFactionId:selectedPoliticalFaction,selectedCity,startingRegion:city.name,commander}));localStorage.setItem("warGameGrandCampaignStateV1",JSON.stringify(campaign));}catch{}showCampaignWorld(campaign);});
}
