import { getCollectionSnapshot } from "./collection.js";
const FACTIONS = {
 empire:{name:"Human Realms",summary:"The largest and most populous realm, but not a unified kingdom.",strengths:"Broad territory, fertile river valleys, trade roads and the largest pool of settlements.",politics:"Crownfall and Westmere recognise your court. Goldhaven, Stonebridge and Southwatch answer to rival human lords.",playerCities:["Crownfall","Westmere"],armyFaction:"empire"},
 highElves:{name:"High Elves",summary:"An old maritime people whose courts cluster around ancient forests and island harbours.",strengths:"Defensible islands, forest resources, sea access and compact but valuable settlements.",politics:"Aelthir recognises your court. Moonspire and Silvershade retain their own power and may resist your claims.",playerCities:["Aelthir"],armyFaction:"highElves"},
 dwarfs:{name:"Dwarfs",summary:"An old civilisation of mountain holds linked by passes and deep roads. No lowland settlements.",strengths:"Mountain strongholds, mineral wealth and defensible approaches; every hold is strategically important.",politics:"Ironhold follows your clan. Deepdelve is held by a rival thane with his own army and treasury.",playerCities:["Ironhold"],armyFaction:"dwarfs"},
 greenskins:{name:"Greenskin Hordes",summary:"A sprawling, fractured belt of goblin tribes, orc warbands and ogre strongholds occupying the eastern plains and mountain chains.",strengths:"Extensive territory, rough mountain approaches, broad grazing plains and several rival warbosses.",politics:"No single warboss commands every tribe. The starting settlement determines which local power begins the campaign.",playerCities:["Grinhold","Redfang Plain","Skullcrag","Ironjaw Pass","Mudgut","Bonefield"],armyFaction:"empire"},
 undead:{name:"The Undying Courts",summary:"Scattered barrow kingdoms, haunted marshes and ancient necropolises separated by long stretches of hostile country.",strengths:"Widely separated strongholds and defensible ruins; influence is dispersed rather than continuous.",politics:"Each necropolis is a power centre in its own right. No single ruler controls every undead settlement.",playerCities:["Barrowmere","Nightfen","Sepulchre"],armyFaction:"empire"},
 evilHumans:{name:"The Blackened Principalities",summary:"Human tyrants, fallen noble houses and militarised border states that reject the old crowns.",strengths:"Fortified roads, hard country and several independent principalities.",politics:"The princes share enemies more readily than they share authority. Choose which lord's domain begins your campaign.",playerCities:["Blackthorn","Dreadmarch","Varkesh","Ashenford"],armyFaction:"empire"}
};
// Race rules are shared defaults; political factions are the actual campaign actors.
// Individual factions may override their race's roster, diplomacy and economic traits.
const RACES = {
 human:{name:"Human",defaultRoster:"empire",attitudes:{greenskin:-55,undead:-45,elf:0,dwarf:0,human:0}},
 elf:{name:"High Elf",defaultRoster:"highElves",attitudes:{greenskin:-65,undead:-60,human:0,dwarf:-20,elf:15}},
 dwarf:{name:"Dwarf",defaultRoster:"dwarfs",attitudes:{greenskin:-75,undead:-50,elf:-35,human:5,dwarf:15}},
 greenskin:{name:"Greenskin",defaultRoster:"empire",attitudes:{human:-65,elf:-70,dwarf:-75,undead:-10,greenskin:10}},
 undead:{name:"Undead",defaultRoster:"empire",attitudes:{human:-45,elf:-55,dwarf:-45,greenskin:-10,undead:15}}
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
 return {historicalTier:p.tier,prosperity:p.prosperity,unrest:0,population:{total:pop,groups:[{culture:CULTURE_BY_FACTION[city.faction]||"Local",count:pop}],displaced:0},buildings:p.buildings.map(id=>({id,condition:100})),fortification:{...p.fortification,condition:100,damage:0,upgrades:[]},infrastructureCondition:100,occupationPolicy:"local-administration",monthsUnderOccupation:0};
}
function ensureSettlementState(campaign){
 for(const region of campaign.regions||[]){
  const city=CITIES.find(c=>c.id===region.id);if(!city)continue;
  if(!region.settlement)region.settlement=initialSettlement(city);
  if(!region.ownerFaction)region.ownerFaction=region.owner==="player"?campaign.playerFaction:(region.owner||city.faction);
  if(!region.nativeFaction)region.nativeFaction=city.faction;
  if(!region.nativeCulture)region.nativeCulture=CULTURE_BY_FACTION[city.faction]||"Local";
  if(!region.settlement.population)region.settlement.population=initialSettlement(city).population;
  if(!Array.isArray(region.settlement.buildings))region.settlement.buildings=initialSettlement(city).buildings;
  if(!region.settlement.fortification)region.settlement.fortification=initialSettlement(city).fortification;
 }
 campaign.schemaVersion=4;\n if(!campaign.factionStates){campaign.factionStates=Object.values(FACTION_PROFILES).map(profile=>{const home=CITIES.find(c=>FACTION_PROFILES[c.id].id===profile.id);return {id:profile.id,name:profile.name,race:profile.race,homeRegion:home.id,alive:true,treasury:profile.id===campaign.playerPoliticalFaction?Number(campaign.treasury)||500:300,income:100,armyPoints:profile.id===campaign.playerPoliticalFaction?1000:500,turnsTaken:0,relations:{}};});campaign.factionTurnOrder=campaign.factionStates.map(f=>f.id);campaign.playerPoliticalFaction=campaign.playerPoliticalFaction||FACTION_PROFILES[campaign.startingRegion]?.id||FACTION_PROFILES[1].id;campaign.activeFaction=campaign.activeFaction||campaign.playerPoliticalFaction;}
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
 if(!region||!city||!FACTIONS[conquerorFaction])throw new Error("Unknown region or conquering faction.");
 const previousOwner=region.ownerFaction||region.owner||region.nativeFaction;
 if(previousOwner===conquerorFaction)return {region,summary:city.name+" is already under this faction's control."};
 const settlement=region.settlement,outcome=options.outcome||"occupy";
 const sameSpecies=FACTION_SPECIES[conquerorFaction]===FACTION_SPECIES[region.nativeFaction];
 const isGreenskinDwarfConquest=conquerorFaction==="greenskins"&&region.nativeFaction==="dwarfs";
 const defaultFleeFraction=isGreenskinDwarfConquest?0.2:(sameSpecies?0.05:0.15);
 const fleeFraction=Math.max(0,Math.min(1,Number.isFinite(options.fleeFraction)?options.fleeFraction:defaultFleeFraction));
 let fled=0,killed=0;
 for(const group of settlement.population.groups){
  if(group.count<=0)continue;
  const culture=group.culture.toLowerCase();
  const isDwarf=culture.includes("dwarf");
  const greenskinDwarfMassacre=conquerorFaction==="greenskins"&&isDwarf;
  const fleeing=Math.round(group.count*fleeFraction);
  if(fleeing){removePopulation(settlement,group,fleeing);settlement.population.displaced+=fleeing;fled+=fleeing;}
  if(greenskinDwarfMassacre){
   const remaining=group.count;killed+=removePopulation(settlement,group,remaining);
  }else if(outcome==="massacre"){
   killed+=removePopulation(settlement,group,group.count);
  }else if(outcome==="sack"){
   const casualties=Math.round(group.count*0.12);killed+=removePopulation(settlement,group,casualties);
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
 region.ownerFaction=conquerorFaction;region.owner=conquerorFaction;region.occupationPolicy=preserve?"local-administration":"military-occupation";settlement.occupationPolicy=region.occupationPolicy;settlement.monthsUnderOccupation=0;
 const factionName=FACTIONS[conquerorFaction].name;
 const special=conquerorFaction==="greenskins"&&region.nativeFaction==="dwarfs"?" Orcs slaughtered the dwarves who could not escape; surviving escapees are displaced.":"";
 const summary=city.name+" falls to "+factionName+". "+fled.toLocaleString()+" inhabitants flee; "+killed.toLocaleString()+" are killed."+special+" Its "+settlement.fortification.style+" fortifications remain in place, damaged but not replaced.";
 campaign.lastEvent=summary;
 return {region,summary,fled,killed,previousOwner,conquerorFaction};
}

const MAP_ID="shattered-realms-v4";
function createInitialCampaignState(faction,city,commander){
 const regions=CITIES.map(r=>{const settlement=initialSettlement(r);return {id:r.id,name:r.name,faction:r.faction,politicalFactionId:r.id===city.id?FACTION_PROFILES[city.id].id:FACTION_PROFILES[r.id].id,owner:r.id===city.id?faction:r.faction,ownerFaction:r.id===city.id?faction:r.faction,nativeFaction:r.faction,nativeCulture:CULTURE_BY_FACTION[r.faction]||"Local",terrain:r.terrain,neighbors:[...(REGION_NEIGHBORS[r.id]||[])],ruler:r.ruler,status:r.status,settlement};});
 const factionStates=Object.values(FACTION_PROFILES).map(profile=>{const home=CITIES.find(c=>FACTION_PROFILES[c.id].id===profile.id);return {id:profile.id,name:profile.name,race:profile.race,homeRegion:home.id,alive:true,treasury:profile.id===FACTION_PROFILES[city.id].id?500:300,income:100,armyPoints:profile.id===FACTION_PROFILES[city.id].id?1000:500,turnsTaken:0,relations:{}};});\n const playerPoliticalFaction=FACTION_PROFILES[city.id].id;\n const diplomacy={};for(const a of factionStates){diplomacy[a.id]={};for(const b of factionStates){if(a.id===b.id)continue;const pa=FACTION_BY_ID[a.id],pb=FACTION_BY_ID[b.id],base=RACES[pa.race].attitudes[pb.race]??0;diplomacy[a.id][b.id]=base+(pa.race===pb.race?10:0);}}\n return {schemaVersion:4,mapId:MAP_ID,turn:1,phase:"player",playerFaction:faction,playerPoliticalFaction,activeFaction:playerPoliticalFaction,factionTurnOrder:factionStates.map(f=>f.id),factionStates,diplomacy,armyFaction:FACTIONS[faction].armyFaction,startingRegion:city.id,treasury:500,regions,graph:createMovementGraph(),commander:{...commander,nodeId:"city-"+city.id,region:city.id,movement:3,maxMovement:3},diplomacy:{},armies:[{id:"player-main",owner:"player",region:city.id,nodeId:"city-"+city.id,points:1000}],lastEvent:commander.name+" begins the campaign at "+city.name+"."};
}
let selectedFaction="empire",selectedCity=1,activeCampaign=null;
const byId=id=>document.getElementById(id);
const CITY_POSITIONS={1:[205,214],2:[142,286],3:[335,294],4:[473,428],5:[596,491],6:[160,142],7:[541,182],8:[793,207],9:[515,352],10:[653,329],11:[1000,240],12:[1118,326],13:[1157,210],14:[1204,365],15:[1044,405],16:[1170,430],17:[159,430],18:[737,642],19:[1207,515],20:[548,602],21:[944,462],22:[846,680],23:[629,642]};
const LEGENDARY={empire:[{id:"edric_voss",type:"legendaryLord",name:"Lord-Marshal Edric Voss"}],highElves:[{id:"aelthir_dawnwing",type:"pegasusChampion",name:"Aelthir, the Dawnwing"},{id:"lethariel_starweaver",type:"shadowElf",name:"Lethariel Starweaver"}],dwarfs:[{id:"haldric_stoneward",type:"dwarfKingHaldric",name:"King Haldric Stoneward"}]};
function ownedModels(){try{return (getCollectionSnapshot()?.models||[]).filter(m=>m&&typeof m==="object");}catch{return [];}}
function modelHas(m,c){const name=String(m.name||"").toLowerCase(),parts=Array.isArray(m.components)?m.components:[];return m.type===c.type||name.includes(c.name.toLowerCase())||parts.includes(c.id+"_body");}
function ownedCharacterIds(){const s=new Set();for(const m of ownedModels())for(const cs of Object.values(LEGENDARY))for(const c of cs)if(modelHas(m,c))s.add(c.id);return s;}
function commanderForFaction(f){
 const models=ownedModels(),owned=ownedCharacterIds();
 for(const c of LEGENDARY[f]||[])if(owned.has(c.id)){const m=models.find(x=>modelHas(x,c));return {id:c.id,name:c.name,kind:"legendary",modelId:m?.id||null};}
 if(LEGENDARY[f])return null;
 const m=models.find(x=>["captain","lord","dwarfCaptain","dwarfLord"].includes(x.type));
 return m?{id:"generic-"+m.id,name:m.name||"Generic Hero",kind:"generic",modelId:m.id}:null;
}
function gateText(f){return LEGENDARY[f]?(LEGENDARY[f].map(c=>c.name).join(" or ")):"a generic hero in your collection";}
function availableCities(f=selectedFaction){if(!commanderForFaction(f))return [];const owned=ownedCharacterIds();return CITIES.filter(c=>c.faction===f&&(c.requiredCharacters||[]).every(id=>owned.has(id)));}
function ensureValidCity(){const valid=availableCities();if(!valid.some(c=>c.id===selectedCity))selectedCity=valid[0]?.id??(CITIES.find(c=>c.faction===selectedFaction)?.id||1);}
function renderCity(){
 const city=CITIES.find(c=>c.id===selectedCity);if(!city)return;const commander=commanderForFaction(selectedFaction),valid=availableCities().some(c=>c.id===city.id),owned=ownedCharacterIds(),missing=(city.requiredCharacters||[]).filter(id=>!owned.has(id));
 byId("grand-city-detail").innerHTML='<div class="grand-city-heading"><span class="grand-city-dot '+city.faction+'"></span><div><h3>'+city.name+'</h3><small>'+FACTIONS[city.faction].name+'</small></div></div><p>'+city.description+'</p><div class="grand-stat"><b>Ruler</b><span>'+city.ruler+'</span></div><div class="grand-stat"><b>Location</b><span>'+city.terrain+'</span></div>'+(missing.length?'<p class="subtle">Requires '+missing.join(", ")+'.</p>':"")+(commander?'<p class="subtle">Commander: '+commander.name+'</p>':'<p class="subtle">Faction locked: collect '+gateText(selectedFaction)+' to command this campaign.</p>');
 byId("grand-world-map").querySelectorAll(".grand-city").forEach(m=>{const id=Number(m.dataset.city),c=CITIES.find(x=>x.id===id);m.classList.toggle("selected",id===city.id);m.classList.toggle("other-faction",c?.faction!==selectedFaction);m.classList.toggle("character-locked",(c?.requiredCharacters||[]).some(x=>!ownedCharacterIds().has(x)));m.setAttribute("aria-pressed",String(id===city.id));});
 byId("grand-campaign-begin").disabled=!valid||!commander;renderRegionChoices();
}
function renderRegionChoices(){
 const host=byId("grand-region-choices");if(!host)return;const owned=ownedCharacterIds(),commander=commanderForFaction(selectedFaction);
 host.innerHTML=CITIES.filter(c=>c.faction===selectedFaction).map(c=>{const missing=(c.requiredCharacters||[]).filter(id=>!owned.has(id)),chosen=c.id===selectedCity,locked=!commander||missing.length;return '<button type="button" class="grand-region-choice'+(chosen?' active':'')+(locked?' locked':'')+'" data-region="'+c.id+'" '+(locked?'disabled':'')+'><span class="grand-region-choice-name">'+c.name+'</span><span class="grand-region-choice-meta">'+(!commander?'Requires '+gateText(selectedFaction):missing.length?'Requires '+missing.join(', '):c.status)+'</span>'+(chosen?'<span class="grand-region-selected">SELECTED</span>':'')+'</button>';}).join('');
 host.querySelectorAll("[data-region]").forEach(b=>b.addEventListener("click",()=>{selectedCity=Number(b.dataset.region);saveSelection();renderCity();}));
}
function saveSelection(){try{const f=FACTIONS[selectedFaction],c=CITIES.find(x=>x.id===selectedCity);localStorage.setItem("warGameGrandCampaignStart",JSON.stringify({schemaVersion:4,mapId:MAP_ID,faction:selectedFaction,selectedCity,armyFaction:f.armyFaction,startingRegion:c?.name}));}catch{}}
function renderFaction(){
 const f=FACTIONS[selectedFaction],commander=commanderForFaction(selectedFaction);ensureValidCity();
 byId("grand-faction-choices").querySelectorAll("[data-faction]").forEach(b=>{const active=b.dataset.faction===selectedFaction,locked=!commander;b.classList.toggle("active",active);b.classList.toggle("faction-locked",locked);b.title=locked?"Requires "+gateText(selectedFaction):"";});
 byId("grand-faction-detail").innerHTML='<h3>'+f.name+'</h3><p>'+f.summary+'</p><div class="grand-stat"><b>Commander</b><span>'+(commander?commander.name:"Locked")+'</span></div><div class="grand-stat"><b>Starting regions</b><span>'+availableCities().length+' available</span></div><p class="subtle">'+(commander?(commander.kind==="legendary"?"Legendary commander unlocked.":"Generic hero unlocked."):"Collect "+gateText(selectedFaction)+" to unlock this faction.")+'</p>';
 byId("grand-campaign-begin").textContent="Start campaign";renderCity();
}
function createMovementGraph(){
 const nodes={},edges={},add=n=>{nodes[n.id]=n;edges[n.id]=edges[n.id]||[];},link=(a,b,cost=1)=>{if(!edges[a]||!edges[b])return;if(!edges[a].some(e=>e.to===b))edges[a].push({to:b,cost});if(!edges[b].some(e=>e.to===a))edges[b].push({to:a,cost});};
 for(const c of CITIES){const [x,y]=CITY_POSITIONS[c.id];add({id:"city-"+c.id,region:c.id,type:"city",label:c.name,x,y});}
 const seen=new Set(),features=[
 {id:"port-5",region:5,type:"port",label:"Southwatch harbour",x:625,y:515,city:5},{id:"port-6",region:6,type:"port",label:"Aelthir harbour",x:135,y:126,city:6},{id:"port-7",region:7,type:"port",label:"Moonspire harbour",x:561,y:163,city:7},{id:"port-8",region:8,type:"port",label:"Silvershade harbour",x:817,y:190,city:8},
 {id:"river-1",region:1,type:"river",label:"Crownfall river ford",x:226,y:239,city:1},{id:"river-4",region:4,type:"river",label:"Stonebridge crossing",x:450,y:447,city:4},{id:"river-23",region:23,type:"river",label:"Ashenford crossing",x:608,y:665,city:23}];
 for(const c of CITIES){const [x,y]=CITY_POSITIONS[c.id],ns=REGION_NEIGHBORS[c.id]||[],avg=ns.reduce((p,id)=>({x:p.x+CITY_POSITIONS[id][0]/ns.length,y:p.y+CITY_POSITIONS[id][1]/ns.length}),{x:0,y:0}),jx=Math.max(30,Math.min(1270,x+(avg.x-x)*.12)),jy=Math.max(30,Math.min(720,y+(avg.y-y)*.12));add({id:"crossroads-"+c.id,region:c.id,type:"crossroads",label:c.name+" crossroads",x:jx,y:jy});link("city-"+c.id,"crossroads-"+c.id);}
 for(const c of CITIES)for(const other of REGION_NEIGHBORS[c.id]||[]){const key=[c.id,other].sort((a,b)=>a-b).join("-");if(seen.has(key))continue;seen.add(key);const [x,y]=CITY_POSITIONS[c.id],[ox,oy]=CITY_POSITIONS[other],id="road-"+key,type=(new Set(["1-4","4-5","4-9","4-20","4-23","18-23","20-23"])).has(key)?"river":"border";add({id,region:c.id,type,label:type==="river"?"River crossing":c.name+"–"+CITIES.find(x=>x.id===other).name+" border",x:(x+ox)/2,y:(y+oy)/2});link("crossroads-"+c.id,id);link("crossroads-"+other,id);}
 for(const n of features){add(n);link("city-"+n.city,n.id);}
 return {nodes,edges};
}
function svgEl(name,attrs={}){const el=document.createElementNS("http://www.w3.org/2000/svg",name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el;}
function saveCampaign(){try{localStorage.setItem("warGameGrandCampaignStateV1",JSON.stringify(activeCampaign));}catch{}}
function settleMonthlyPopulation(campaign){
 for(const region of campaign.regions||[]){
  const s=region.settlement;if(!s||!s.population)continue;
  const atWar=campaign.warRegions?.includes(region.id)||campaign.regions.some(r=>r.id!==region.id&&r.ownerFaction!==region.ownerFaction&&r.neighbors?.includes(region.id)&&r.neighbors?.includes(region.id)&&campaign.activeWars?.includes([region.ownerFaction,r.ownerFaction].sort().join(":")));
  const occupationPenalty=region.ownerFaction!==region.nativeFaction?0.001:0;
  let rate=s.prosperity>=70&&s.unrest<20&&!atWar?0.002:(!atWar&&s.prosperity>=40&&s.unrest<40?0.001:atWar?-0.002:-0.0005);
  if(occupationPenalty)rate-=occupationPenalty;
  const totalDelta=Math.round(s.population.total*rate);
  if(totalDelta>0){s.population.total+=totalDelta;const largest=[...s.population.groups].sort((a,b)=>b.count-a.count)[0];if(largest)largest.count+=totalDelta;}
  else if(totalDelta<0){let remaining=-totalDelta;for(const group of [...s.population.groups].sort((a,b)=>b.count-a.count)){const loss=Math.min(remaining,group.count);group.count-=loss;remaining-=loss;if(!remaining)break;}s.population.total=Math.max(0,s.population.total+totalDelta);}
  if(region.ownerFaction!==region.nativeFaction){
   s.monthsUnderOccupation=(s.monthsUnderOccupation||0)+1;
   if(region.ownerFaction==="greenskins"&&region.nativeFaction==="dwarfs"){s.infrastructureCondition=Math.max(0,s.infrastructureCondition-0.35);s.fortification.condition=Math.max(0,s.fortification.condition-0.2);}
  }
 }
}
function nodeCost(n){return n.type==="river"?2:1;}
function renderCampaignMap(){
 if(!activeCampaign)return;const host=byId("grand-map-live-wrap");let map=byId("grand-campaign-world-map");
 const firstRender=!map;if(!map){map=byId("grand-world-map").cloneNode(true);map.id="grand-campaign-world-map";map.querySelectorAll(".grand-city").forEach(m=>m.classList.remove("other-faction","selected","character-locked"));host.replaceChildren(map);}
 map.querySelectorAll("#campaign-road-layer,#campaign-node-layer,#campaign-commander-layer").forEach(e=>e.remove());
 const road=svgEl("g",{id:"campaign-road-layer","pointer-events":"none"}),layer=svgEl("g",{id:"campaign-node-layer"}),token=svgEl("g",{id:"campaign-commander-layer","pointer-events":"none"}),{nodes,edges}=activeCampaign.graph;
 for(const [id,list] of Object.entries(edges))for(const e of list){if(id.localeCompare(e.to)>=0)continue;const a=nodes[id],b=nodes[e.to];road.append(svgEl("path",{d:"M "+a.x+" "+a.y+" L "+b.x+" "+b.y,class:"campaign-road"+(a.type==="river"||b.type==="river"?" river-road":"")}));}
 map.querySelector("#grand-city-markers").before(road);
 for(const n of Object.values(nodes)){const isCurrent=n.id===activeCampaign.commander.nodeId,reach=(edges[activeCampaign.commander.nodeId]||[]).some(e=>e.to===n.id&&e.cost+nodeCost(n)-1<=activeCampaign.commander.movement),g=svgEl("g",{class:"campaign-node "+n.type+(isCurrent?" current":"")+(reach?" reachable":""),tabindex:reach?"0":"-1",role:"button","aria-label":n.label,transform:"translate("+n.x+" "+n.y+")","data-node":n.id});g.append(svgEl("circle",{r:16,class:"campaign-node-hit"}));g.append(svgEl("circle",{r:n.type==="city"?5:n.type==="crossroads"?3.5:5.5,class:"campaign-node-visible"}));if(n.type==="port")g.append(svgEl("path",{d:"M-3 0 L3 0 M0 -4 L0 2 M-4 2 L4 2"}));layer.append(g);}
 map.querySelector("#grand-city-markers").after(layer);
 const current=nodes[activeCampaign.commander.nodeId];token.append(svgEl("circle",{cx:current.x,cy:current.y-17,r:11,class:"commander-token"}));const initials=activeCampaign.commander.name.split(/\\s+/).map(s=>s[0]).join("").slice(0,2).toUpperCase(),label=svgEl("text",{x:current.x,y:current.y-13,"text-anchor":"middle",class:"commander-initials"});label.textContent=initials;token.append(label);map.append(token);
 layer.querySelectorAll("[data-node]").forEach(g=>{const move=()=>moveCommander(g.dataset.node);g.addEventListener("click",move);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();move();}});});
 const n=nodes[activeCampaign.commander.nodeId];const settlementRegion=activeCampaign.regions.find(r=>r.id===n.region);byId("grand-campaign-turn").textContent="TURN "+activeCampaign.turn;byId("grand-campaign-treasury").textContent=activeCampaign.treasury+" gold";
 byId("grand-campaign-commander").innerHTML="<strong>"+activeCampaign.commander.name+"</strong><span>"+(activeCampaign.commander.kind==="legendary"?"Legendary commander":"Generic hero")+"</span><span>Movement "+activeCampaign.commander.movement+"/"+activeCampaign.commander.maxMovement+"</span><span>Location: "+(CITIES.find(c=>c.id===n.region)?.name||"Road")+"</span>";
 byId("grand-campaign-node-detail").innerHTML="<strong>"+n.label+"</strong><span>"+({city:"City and regional seat",crossroads:"Road junction",port:"Port and sea route",river:"River crossing",border:"Regional border"}[n.type]||"Road")+"</span><span>"+(n.type==="river"?"Crossing costs 2 movement points.":"Move along connected roads to highlighted places.")+"</span>"+(n.type==="city"&&settlementRegion?.settlement?("<span>Ruler: "+(FACTIONS[settlementRegion.ownerFaction]?.name||settlementRegion.ownerFaction)+"</span><span>Native culture: "+settlementRegion.nativeCulture+"</span><span>Population: "+Math.round(settlementRegion.settlement.population.total).toLocaleString()+"</span><span>Historic tier: "+settlementRegion.settlement.historicalTier+" · Fort: "+settlementRegion.settlement.fortification.style+" ("+Math.round(settlementRegion.settlement.fortification.condition)+"% condition)</span>"):"");
 byId("grand-campaign-event").textContent=activeCampaign.lastEvent||"Select a highlighted place connected by road.";if(firstRender||host.scrollWidth>host.clientWidth){const scale=map.clientWidth/1300;host.scrollLeft=Math.max(0,current.x*scale-host.clientWidth/2);}
}
function moveCommander(id){
 if(!activeCampaign)return;const from=activeCampaign.commander.nodeId,n=activeCampaign.graph.nodes[id],edge=(activeCampaign.graph.edges[from]||[]).find(e=>e.to===id);
 if(!n||!edge){activeCampaign.lastEvent="You can only move along a connected road.";renderCampaignMap();return;}
 const cost=edge.cost+nodeCost(n)-1;if(cost>activeCampaign.commander.movement){activeCampaign.lastEvent="Not enough movement remaining to reach "+n.label+".";renderCampaignMap();return;}
 activeCampaign.commander.nodeId=id;activeCampaign.commander.region=n.region;activeCampaign.commander.movement-=cost;const army=activeCampaign.armies.find(a=>a.id==="player-main");if(army){army.nodeId=id;army.region=n.region;}
 activeCampaign.lastEvent=activeCampaign.commander.name+" moves to "+n.label+". "+activeCampaign.commander.movement+" movement remaining.";saveCampaign();renderCampaignMap();
}
function endCampaignTurn(){
 if(!activeCampaign)return;
 ensureSettlementState(activeCampaign);settleMonthlyPopulation(activeCampaign);
 const order=activeCampaign.factionTurnOrder||[],states=activeCampaign.factionStates||[];
 // The player ends their own faction's turn; each surviving AI faction then receives its own income and turn.
 let currentIndex=order.indexOf(activeCampaign.activeFaction||activeCampaign.playerPoliticalFaction);
 if(currentIndex<0)currentIndex=0;
 const playerId=activeCampaign.playerPoliticalFaction||FACTION_PROFILES[activeCampaign.startingRegion]?.id;
 const processed=[];
 for(let step=1;step<=order.length;step++){
  const id=order[(currentIndex+step)%order.length],f=states.find(x=>x.id===id);
  if(!f||!f.alive)continue;
  f.turnsTaken=(f.turnsTaken||0)+1;f.treasury=(f.treasury||0)+(f.income||100);
  const owned=activeCampaign.regions.filter(r=>(r.politicalFactionId||FACTION_PROFILES[r.id]?.id)===id);
  // Keep the faction's income grounded in its currently controlled settlements.
  f.income=Math.max(50,owned.length*50);
  processed.push(f.name);
  if(id===playerId)break;
 }
 const player=states.find(f=>f.id===playerId);
 if(player)activeCampaign.treasury=player.treasury;
 activeCampaign.turn++;
 activeCampaign.activeFaction=playerId;
 activeCampaign.commander.movement=activeCampaign.commander.maxMovement;
 activeCampaign.lastEvent="Turn "+activeCampaign.turn+" begins. "+(processed.length?processed.join(", ")+" completed their faction turns. ":"")+"Faction treasuries and settlement populations updated; your movement is replenished.";
 saveCampaign();renderCampaignMap();
}
function showCampaignWorld(c){activeCampaign=c;byId("grand-campaign-setup").hidden=true;byId("grand-campaign-world").hidden=false;renderCampaignMap();}
export function startGrandCampaign(){
 window.resolveGrandCampaignConquest=resolveGrandCampaignConquest;
 try{const s=JSON.parse(localStorage.getItem("warGameGrandCampaignStart")||"null");if(s&&FACTIONS[s.faction]){selectedFaction=s.faction;if(CITIES.some(c=>c.id===s.selectedCity))selectedCity=s.selectedCity;}}catch{}
 const screen=byId("grand-campaign-screen"),menu=byId("mainmenu");if(!screen||!menu)return;
 document.addEventListener("click",event=>{const target=event.target instanceof Element?event.target.closest('[data-mode="grand"]'):null;if(!target)return;event.preventDefault();event.stopPropagation();screen.hidden=false;menu.hidden=true;let saved=null;try{saved=JSON.parse(localStorage.getItem("warGameGrandCampaignStateV1")||"null");}catch{}if(saved?.graph?.nodes&&saved?.commander)showCampaignWorld(ensureSettlementState(saved));else{byId("grand-campaign-setup").hidden=false;byId("grand-campaign-world").hidden=true;renderFaction();}},true);
 byId("grand-campaign-back").addEventListener("click",()=>{screen.hidden=true;menu.hidden=false;});byId("grand-world-back").addEventListener("click",()=>{byId("grand-campaign-world").hidden=true;byId("grand-campaign-setup").hidden=false;renderFaction();});byId("grand-world-menu").addEventListener("click",()=>{screen.hidden=true;menu.hidden=false;});byId("grand-campaign-end-turn").addEventListener("click",endCampaignTurn);
 byId("grand-faction-choices").querySelectorAll("[data-faction]").forEach(b=>b.addEventListener("click",()=>{selectedFaction=b.dataset.faction;ensureValidCity();renderFaction();saveSelection();}));
 byId("grand-world-map").querySelectorAll(".grand-city").forEach(m=>{const select=()=>{const c=CITIES.find(x=>x.id===Number(m.dataset.city));if(!c||c.faction!==selectedFaction||!commanderForFaction(selectedFaction))return;selectedCity=c.id;saveSelection();renderCity();};m.addEventListener("click",select);m.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select();}});});
 byId("grand-campaign-begin").addEventListener("click",()=>{const f=FACTIONS[selectedFaction],city=CITIES.find(c=>c.id===selectedCity),commander=commanderForFaction(selectedFaction);if(!city||!availableCities().some(c=>c.id===city.id)||!commander)return;const campaign=createInitialCampaignState(selectedFaction,city,commander);try{localStorage.setItem("warGameGrandCampaignStart",JSON.stringify({schemaVersion:4,mapId:MAP_ID,faction:selectedFaction,selectedCity,startingRegion:city.name,commander}));localStorage.setItem("warGameGrandCampaignStateV1",JSON.stringify(campaign));}catch{}showCampaignWorld(campaign);});
}
