import { FACTIONS } from "./factions.js?v=20261020-thaurgath-v2";

export function unitCost(config, faction) {
  const elf=faction==="highElves",woodElfStyle=!!config.woodElfStyle,dwarf=faction==="dwarfs",green=faction==="greenskins",undead=faction==="undead",type=config.type,models=config.models||1,character=["captain","lord","mageHero","mageLord","starwardenLord","necromancer","masterNecromancer","vampireHero","vampireLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric","goblinHero","goblinLord","orcHero","orcLord"].includes(type),eagleKit=elf&&(character||type==="cavalry")&&(config.mountType==="eagle"||type==="pegasusChampion"),dragonCosts={youngDragon:140,dragon:220,ancientDragon:320,deepflameDragon:450,wyvern:100,unicorn:14,skeletonChariot:75},chariotTypes=["humanChariot","elfChariot","goblinChariot","orcChariot","skeletonChariot"],mageStatCost=["M","BS","T","I","Ld"].reduce((sum,k)=>sum+(config.upgrades?.[k]?({M:dwarf?8:5,BS:5,T:dwarf?5:8,I:dwarf?5:3,Ld:3}[k]||0):0),0);
  if(chariotTypes.includes(type))return ({humanChariot:95,elfChariot:110,goblinChariot:65,orcChariot:100,skeletonChariot:75}[type]||95)+(config.heavyArmour?8:0)+(config.shield?3:0)+(config.rangedWeapon==="bow"?6:0)+(config.weapon==="greatWeapon"?8:config.weapon==="halberd"?4:config.weapon==="spear"?3:0)+(config.woodElfStyle&&config.meleeWeapons?.includes("offhandWeapon")?3:0)+(config.chariotUpgrades?.wounds||0)*12+(config.chariotUpgrades?.impactHits||0)*8+(config.chariotUpgrades?.impactStrength||0)*10+(config.chariotUpgrades?.toughness||0)*12;
  if(undead){const base={zombies:6,skeletons:8,skeletonHorses:12,skeletonChariot:75,skeletonDragon:130,skeletonGiant:150,skeletonTroll:15,catapult:70,necromancer:55,masterNecromancer:100,vampireHero:75,vampireLord:120}[type];if(base!=null)return base*(["zombies","skeletons","skeletonHorses","skeletonTroll"].includes(type)?models:1)+(config.heavyArmour?4:0)+(config.shield?2:0)+(config.weapon==="magicSword"?10:0)+(config.spellcaster?Math.max(0,(config.casterLevel||1)-1)*15:0)+(config.mounted?(dragonCosts[config.mountType]||8):0);}
  if(green){const base={goblins:2,orcBoyz:7,goblinHero:35,goblinLord:65,orcHero:50,orcLord:85,goblinShaman:55,goblinGreatShaman:115,orcShaman:65,orcGreatShaman:180,wolfRiders:11,boarBoyz:18,catapult:70,trolls:50,giant:205,wyvern:100}[type];if(base!=null){const ws=[...new Set([...(config.meleeWeapons||[]),config.weapon||"handWeapon"])];const melee=ws.reduce((n,w)=>n+(w==="greatWeapon"?(character?4:2*models):w==="offhandWeapon"?(character?2:models):0),0);return base*(["goblins","orcBoyz","wolfRiders","boarBoyz","trolls"].includes(type)?models:1)+melee+(["goblins","goblinHero","goblinLord"].includes(type)&&config.rangedWeapon==="bow"?2*(character?1:models):0)+(config.mounted?(config.mountType==="wolf"?8:config.mountType==="boar"?10:config.mountType==="wyvern"?100:0):0)+(config.shield?(character?2:models):0)+(["goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman"].includes(type)?Math.max(0,(config.casterLevel||(["goblinGreatShaman","orcGreatShaman"].includes(type)?3:1))-(["goblinGreatShaman","orcGreatShaman"].includes(type)?3:1))*15+mageStatCost:0);}}
  if(type==="mageHero"&&!elf)return 55+Math.max(0,(config.casterLevel||1)-1)*15+(config.mounted?8:0)+mageStatCost;if(type==="mageLord"&&!elf)return 100+Math.max(0,(config.casterLevel||3)-3)*15+(config.mounted?8:0)+mageStatCost;if(type==="starwardenLord"&&!elf)return 300;if(type==="pegasusChampion")return 110;
  if(type==="dwarfKingHaldric")return 210;
  const dwarfBase={dwarfInfantry:8};
  if(dragonCosts[type])return dragonCosts[type];
  if(type==="cannon")return dwarf?85:80;if(type==="boltThrower")return 60;
  const upgrades=[{key:"M",unit:dwarf?4:2,character:dwarf?8:5},{key:"WS",unit:elf?1:2,character:elf?3:5},{key:"BS",unit:elf?1:2,character:elf?3:5},{key:"S",unit:3,character:6},{key:"T",unit:dwarf?2:elf?6:4,character:dwarf?5:elf?10:8},{key:"I",unit:dwarf?3:1,character:dwarf?5:3},{key:"Ld",unit:1,character:3}].filter(s=>!(["mageHero","mageLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman"].includes(type)&&!elf&&["WS","S"].includes(s.key))).reduce((sum,s)=>sum+(config.upgrades&&config.upgrades[s.key]?(character?s.character:s.unit*models):0),0);
  const skillCost=["rerollOnesMelee","rerollOnesShooting","steadfast","skirmish"].reduce((sum,key)=>sum+(config.skills&&config.skills[key]?(woodElfStyle&&key==="skirmish"?1:3):0),0);
  const weapons=[...new Set([...(config.meleeWeapons||[]),config.weapon||"handWeapon"])];
  const rangedRaw=config.rangedWeapon||(["bow","crossbow","firearm","longRifle"].includes(config.weapon)?config.weapon:(type==="archers"?"bow":config.bow?"bow":null));
  const ranged=dwarf&&rangedRaw==="bow"?"crossbow":rangedRaw;
  const rangedCost=ranged==="bow"?(eagleKit?0:elf&&type==="cavalry"&&(config.freeCavalryOption||"bow")==="bow"?0:(elf?3:2)*(character?1:models)):ranged==="crossbow"?3*(character?1:models):ranged==="firearm"?4*(character?1:models):ranged==="longRifle"?12*(character?1:models):0;
  if(dwarfBase[type]){const meleeCost=[...new Set([...(config.meleeWeapons||[]),config.weapon||"handWeapon"])].reduce((sum,w)=>sum+(w==="greatWeapon"?2*models:w==="halberd"||w==="spear"?models:0),0);return models*dwarfBase[type]+meleeCost+rangedCost+upgrades+skillCost+(config.heavyArmour?2*models:0)+(config.champion?6:0);}
  if(character){
    const meleeCost=weapons.reduce((sum,w)=>sum+(["halberd","greatWeapon"].includes(w)?4:w==="spear"&&config.mounted?(eagleKit?0:2):w==="lance"&&config.mounted?(eagleKit?2:4):0),0);
    return (type==="legendaryLord"?160:type==="shadowElf"?165:type==="mageHero"?(elf?95:55):type==="mageLord"?(elf?225:100):type==="starwardenLord"?300:type==="rifleman"?65:type==="captainWeiss"?70:type==="dwarfCaptain"?55:type==="dwarfLord"?100:(elf?(type==="lord"?120:75):(type==="lord"?80:50)))+(config.heavyArmour&&!eagleKit&&!["legendaryLord","shadowElf"].includes(type)?4:0)+(config.magicArmour&&!eagleKit?10:0)+(config.weapon==="magicSword"?10:0)+meleeCost+(config.mounted?(dragonCosts[config.mountType]||8):0)+(config.mounted&&config.barding&&!eagleKit?4:0)+(config.shield&&type!=="legendaryLord"?2:0)+rangedCost+upgrades+skillCost+(woodElfStyle&&weapons.includes("offhandWeapon")?2:0)+(woodElfStyle&&config.heavyArmour?2:0)+(woodElfStyle&&config.mounted&&config.barding?2:0)+(elf&&["mageHero","mageLord"].includes(type)?(type==="mageHero"?Math.max(0,(config.casterLevel||1)-1):Math.max(0,(config.casterLevel||3)-3))*15:0)+(elf&&["captain","lord"].includes(type)?Math.max(0,Math.min(type==="lord"?2:1,config.casterLevel||0))*15:0);
  }
  if(type==="cavalry"){
    const free=config.freeCavalryOption||"bow";
    const meleeCost=weapons.reduce((sum,w)=>sum+(w==="spear"&&!(elf&&free==="spear")?models:["lance","greatWeapon"].includes(w)?2*models:0),0);
    const bowCost=(config.bow&&!(elf&&free==="bow")&&!eagleKit?2*models:0)+(ranged==="bow"&&!(elf&&free==="bow")&&!config.bow&&!eagleKit?2*models:0);
    const otherRangedCost=ranged==="crossbow"?3*models:ranged==="firearm"?4*models:0;
    return models*(elf?24:16)+(config.elvenArchery&&elf&&(ranged==="bow"||config.bow||free==="bow")?2*models:0)+bowCost+otherRangedCost+(config.heavyArmour?2*models:0)+(config.barding?2*models:0)+(woodElfStyle&&config.barding?models:0)+(config.heavyArmour&&woodElfStyle?models:0)+(config.shield?0.5*models:0)+meleeCost+upgrades+skillCost;
  }
  const meleeCost=weapons.reduce((sum,w)=>sum+(w==="spear"&&!(elf&&type==="swordsmen")?models:w==="greatWeapon"?2*models:w==="halberd"?models:0),0);
  return models*(elf?12:8)+meleeCost+rangedCost+(config.elvenArchery&&elf&&ranged==="bow"?2*models:0)+(config.champion?(elf?9:6):0)+(config.lightArmour&&!elf?models:0)+(config.shield&&!(elf&&type==="swordsmen")?0.5*models:0)+(woodElfStyle&&config.heavyArmour?models:0)+(woodElfStyle&&weapons.includes("offhandWeapon")?models:0)+upgrades+skillCost;
}
function buildUnit(template,config,faction,opposing=false) {
  template=template||Object.values(FACTIONS).map(group=>group.units?.[config.type]).find(Boolean)||{name:String(config.type||"Unknown unit"),short:String(config.type||"Unit"),kind:"melee",models:Math.max(1,Number(config.models)||1),stats:{M:4,WS:3,BS:3,S:3,T:3,W:1,I:3,A:1,Ld:6}};
  if(faction==="dwarfs"&&(config.rangedWeapon==="bow"||config.weapon==="bow"||config.bow)){
    config={...config,rangedWeapon:"crossbow",weapon:config.weapon==="bow"?"handWeapon":config.weapon,bow:false};
  }
  const elf=faction==="highElves"&&!opposing,woodElfStyle=!!config.woodElfStyle,undead=faction==="undead"&&!opposing,dwarf=faction==="dwarfs"&&!opposing,green=faction==="greenskins"&&!opposing,stats={...template.stats};
  const isCannon=config.type==="cannon",isBoltThrower=config.type==="boltThrower",isCatapult=config.type==="catapult",isSiegeEngine=isCannon||isBoltThrower||isCatapult,isDragon=!!template.isDragon,isTroll=!!template.isTroll,isGiant=!!template.isGiant,isUndead=!!template.undead||undead;
  const mountType=config.type==="wolfRiders"?"wolf":config.type==="boarBoyz"?"boar":config.type==="skeletonHorses"?"skeletal_steed":config.type==="pegasusChampion"?"eagle":(config.mountType==="greatEagle"?"eagle":(config.mountType||(config.mounted?"horse":"none"))),isChariot=!!template.chariot||config.type==="skeletonChariot"||mountType==="skeletonChariot",isCharacter=["captain","lord","mageHero","mageLord","starwardenLord","necromancer","masterNecromancer","vampireHero","vampireLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman","legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfCaptain","dwarfLord","dwarfKingHaldric","goblinHero","goblinLord","orcHero","orcLord"].includes(config.type),isCavalry=["cavalry","wolfRiders","boarBoyz","skeletonHorses"].includes(config.type)||isDragon||isChariot,mounted=(isCavalry&&!isDragon&&!isChariot)||(isCharacter&&mountType!=="none"&&mountType!=="skeletonChariot"),isEagleMounted=elf&&mountType==="eagle"&&(isCharacter||isCavalry),isGreatEagleMounted=elf&&mountType==="greatEagle"&&isCharacter,hasHeavyArmour=!!config.heavyArmour&&!green&&(!isEagleMounted||config.type==="pegasusChampion"),hasMagicArmour=!!(config.magicArmour||config.dwarvenEnchantedArmour)&&!isEagleMounted&&!green,hasBarding=!!config.barding&&!isEagleMounted&&!green;
  if(undead&&["zombies","skeletons"].includes(config.type))stats.M=4;
  if(mounted&&!isDragon&&!isChariot)stats.M=mountType==="wolf"?9:mountType==="boar"?7:(isEagleMounted||isGreatEagleMounted)?12:elf?9:8;if(isChariot)stats.M=mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.stats.M:template.stats.M;
  const crewMovementCharacteristic=isCannon?4:isBoltThrower?(elf?5:4):isCatapult?4:null;
  if(isCannon)stats.M=2;
  if(isBoltThrower)stats.M=elf?2.5:2;if(isCatapult)stats.M=2;
  if(mounted&&hasBarding&&!elf)stats.M=7;
  if(isCharacter&&!mounted&&hasHeavyArmour&&!hasMagicArmour&&!elf&&!dwarf)stats.M=Math.max(1,stats.M-1);
  const lightArmour=isBoltThrower||isCatapult||isChariot||dwarf|| (isCavalry||isCharacter?(!hasHeavyArmour&&!green&&!template.spellcaster):(elf||!!config.lightArmour));
  const meleeWeapons=[...new Set([...(config.meleeWeapons||[]),config.weapon||"handWeapon"])].filter(w=>!["bow","crossbow","firearm","longRifle"].includes(w));if(config.dualWield&&!meleeWeapons.includes("offhandWeapon"))meleeWeapons.push("offhandWeapon");const ownsShield=!!config.shield||dwarf;if(!meleeWeapons.includes("handWeapon")&&!(elf&&isChariot))meleeWeapons.unshift("handWeapon");const spears=config.weapon==="spear"&&meleeWeapons.includes("spear");
  let rangedWeapon=isCannon||isCatapult?null:(isBoltThrower?"bow":(config.rangedWeapon||(["bow","crossbow","firearm","longRifle","magicBow"].includes(config.weapon)?config.weapon:(config.type==="archers"?(faction==="dwarfs"?"crossbow":"bow"):(isCavalry&&(!!config.bow||(elf&&(config.freeCavalryOption||"bow")==="bow"))?"bow":null)))));
  if(green&&["orcBoyz","orcHero","orcLord","wolfRiders","boarBoyz","orcChariot"].includes(config.type))rangedWeapon=null;if(green&&["goblins","goblinHero","goblinLord","goblinChariot"].includes(config.type)&&rangedWeapon==="bow"){}else if(green&&rangedWeapon)rangedWeapon=null;
  const hasBow=rangedWeapon==="bow"||rangedWeapon==="magicBow";
  let weapon=(isCharacter||isCavalry||["swordsmen","dwarfInfantry","goblins","orcBoyz"].includes(config.type))?(["bow","crossbow","firearm","longRifle"].includes(config.weapon)?"handWeapon":(config.weapon||"handWeapon")):"handWeapon";
  const factionName=opposing?"Opposing":green?"Greenskin":faction==="highElves"?"High Elf":faction==="dwarfs"?"Dwarf":"Empire";
  const primaryMelee=weapon==="greatWeapon"||(meleeWeapons||[]).includes("greatWeapon")?"greatWeapon":weapon==="halberd"||(meleeWeapons||[]).includes("halberd")?"halberd":weapon==="spear"||(meleeWeapons||[]).includes("spear")?"spear":weapon;
  const unitName=isSiegeEngine||isDragon||isChariot||green?template.name:isCharacter?template.name+(isGreatEagleMounted||isEagleMounted?" (Pegasus)":""):isCavalry?template.name+(isEagleMounted?" (Pegasus)":""):dwarf?template.name:rangedWeapon==="bow"?factionName+" Archers":rangedWeapon==="crossbow"?factionName+" Crossbowmen":rangedWeapon==="firearm"?factionName+" Handgunners":primaryMelee==="greatWeapon"?(factionName==="High Elf"?"High Elf Swordmasters":factionName+" Greatswords"):primaryMelee==="halberd"?factionName+" Halberdiers":primaryMelee==="spear"?factionName+" Spearmen":factionName+" Swordsmen";
  const unitShort=isSiegeEngine?template.short:isCharacter?template.short:isCavalry?template.short:rangedWeapon==="bow"?"Archers":rangedWeapon==="crossbow"?"Crossbows":rangedWeapon==="firearm"?"Handguns":rangedWeapon==="longRifle"?"Long rifle":primaryMelee==="greatWeapon"?"Greatswords":primaryMelee==="halberd"?"Halberds":primaryMelee==="spear"?"Spearmen":"Swordsmen";
  const shield=ownsShield&&!["greatWeapon","halberd"].includes(weapon)&&(!rangedWeapon||(config.rangedMode||(dwarf?"bow":"shield"))!=="bow");
  for(const key of ["M","WS","BS","S","T","I","Ld"])if(config.type!=="pegasusChampion"&&config.upgrades&&config.upgrades[key]&&!(template.spellcaster&&!elf&&["WS","S"].includes(key)))stats[key]+=(isSiegeEngine&&key==="M"?0.5:1);
  
  const campaignStats=config.campaignStats||{};
  for(const key of ["WS","BS","S","T","Ld"])if(!(template.spellcaster&&!elf&&["WS","S"].includes(key)))stats[key]+=Number.isFinite(Number(campaignStats[key]))?Number(campaignStats[key]):0;
  if(isCharacter&&config.campaignRank==="hero"){stats.WS+=1;stats.Ld+=1;}
  else if(isCharacter&&config.campaignRank==="champion"){stats.Ld=Math.max(1,stats.Ld-1);}
  if(campaignStats.M)stats.M+=Math.max(0,campaignStats.M);
  if(campaignStats.I)stats.I+=Math.max(0,campaignStats.I);
  if(campaignStats.MI){stats.M+=isSiegeEngine?campaignStats.MI*0.5:campaignStats.MI;stats.I+=campaignStats.MI;}
  // Halberds are infantry weapons; prevent stale or malformed mounted loadouts.
  if(mounted&&weapon==="halberd")weapon="handWeapon";
  if(isCavalry&&elf&&(config.freeCavalryOption||"bow")==="spear"){if(!meleeWeapons.includes("spear"))meleeWeapons.push("spear");if(weapon==="handWeapon")weapon="spear";}
  const costFaction=opposing?"empire":faction;
  return {id:config.id,name:isSiegeEngine||isDragon||isTroll||isGiant?unitName:(template.namedCharacter?unitName:unitName+" "+config.index),short:unitShort,side:config.side,kind:template.kind,
    isCharacter,isCavalry:isCavalry||isChariot,mounted:mounted||isChariot,isDragon,isChariot,isTroll,isGiant,regeneration:template.regeneration||0,undead:isUndead,crumbling:isUndead,causesFear:!!template.causesFear||isUndead,causesTerror:!!template.causesTerror,stupidity:!!template.stupidity,trollVomit:!!template.trollVomit,trollVomitSelected:!!config.trollVomitSelected,ignoresGreenskinPanic:!!template.ignoresGreenskinPanic,giantSpecialAttacks:!!template.giantSpecialAttacks,fallOver:!!template.fallOver,unitStrength:isChariot?5:undefined,chariotWounds:isChariot?((mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.stats.W:template.stats.W)+(config.chariotUpgrades?.wounds||0)+(config.campaignStats?.chariotWounds||0)):0,chariotStartWounds:isChariot?((mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.stats.W:template.stats.W)+(config.chariotUpgrades?.wounds||0)+(config.campaignStats?.chariotWounds||0)):0,chariotToughness:isChariot?(mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.stats.T:template.stats.T)+(config.chariotUpgrades?.toughness||0)+(config.campaignStats?.chariotToughness||0):0,chariotImpactHits:isChariot?Math.max(1,1+(config.chariotUpgrades?.impactHits||0)+(config.campaignStats?.chariotImpactHits||0)):0,chariotImpactStrength:isChariot?((mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.impactStrength:template.impactStrength||4)+(config.chariotUpgrades?.impactStrength||0)+(config.campaignStats?.chariotImpactStrength||0)):0,chariotCrewModels:isChariot?3:0,crewCapacity:isChariot?3:0,chariotArmourSave:(mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.armourSave:template.armourSave)||4,spellcaster:!!template.spellcaster||(elf&&["captain","lord"].includes(config.type)&&(config.casterLevel||0)>0),dispelBonus:(template.dispelBonus||0)+(mountType==="unicorn"?1:0),castingBonus:(config.castingBonus||0)+(mountType==="unicorn"?1:0),casterLevel:template.spellcaster?Math.max(template.baseCasterLevel||1,Math.min(config.type==="starwardenLord"?5:config.type==="deepflameDragon"?4:(template.baseCasterLevel||1)+1,config.casterLevel||template.baseCasterLevel||1)):elf&&["captain","lord"].includes(config.type)?Math.max(0,Math.min(config.type==="lord"?2:1,config.casterLevel||0)):0,spells:template.spellcaster?(config.spells||["fireBolt"]):elf&&["captain","lord"].includes(config.type)&&(config.casterLevel||0)>0?(config.spells||["fireBolt"]):[],specialSpell:template.specialSpell||null,fatewardArmed:false,castingDiceUsed:0,dragonBreathStrength:template.breathStrength||0,breathUsed:false,intrinsicArmourSave:isChariot?((mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.armourSave:template.armourSave)||4):config.dwarvenEnchantedArmour?(hasHeavyArmour?4:lightArmour?5:null):(template.intrinsicArmourSave||null),isCannon,isBoltThrower,isCatapult,isSiegeEngine,isSiege:isSiegeEngine,crewModels:isCannon||isCatapult?3:isBoltThrower?2:0,artilleryWounds:isCannon?3:isBoltThrower?2:isCatapult?2:0,artilleryStartWounds:isCannon?3:isBoltThrower?2:isCatapult?2:0,artilleryToughness:isSiegeEngine?7:0,crewMovementCharacteristic:isSiegeEngine?crewMovementCharacteristic+(config.upgrades?.M?1:0)+(campaignStats.M||0)+(campaignStats.MI||0):null,artilleryStrength:isCannon?10:isBoltThrower?7:isCatapult?3:0,artilleryArmourPiercing:isCannon?1:0,moveAndFire:!!config.campaignStats?.moveAndFire,artilleryRange:isCannon?60+(config.campaignStats?.range||0):isBoltThrower?48+(config.campaignStats?.range||0):isCatapult?48+(config.campaignStats?.range||0):0,baseMove:stats.M,
    models:isCharacter?1:(config.models??template.models),startModels:isCharacter?1:(config.models??template.models),points:unitCost(config,costFaction),weapon,meleeWeapons,hasSpear:meleeWeapons.includes("spear"),hasGreatWeapon:meleeWeapons.includes("greatWeapon"),hasHalberd:meleeWeapons.includes("halberd"),ownsShield,shield,rangedWeapon,hasRangedWeapon:!!rangedWeapon||isCatapult,rangedMode:ownsShield&&rangedWeapon?(dwarf?"bow":"shield"):rangedWeapon?"bow":"shield",
    rangedStrength:isBoltThrower?5:rangedWeapon==="magicBow"?stats.S:["crossbow","firearm","longRifle"].includes(rangedWeapon)?4:3,rangedUsesUserStats:rangedWeapon==="magicBow",armourPiercing:rangedWeapon==="firearm"&&dwarf?2:["firearm","longRifle"].includes(rangedWeapon)?1:0,
    bsCap:rangedWeapon==="crossbow"?4:rangedWeapon==="firearm"?3:null,
    ranksToShoot:mounted?1:rangedWeapon==="bow"?(elf?4:3):rangedWeapon==="crossbow"||rangedWeapon==="firearm"||rangedWeapon==="longRifle"?2:0,
    overUnitPenalty:rangedWeapon==="bow"?1:rangedWeapon==="crossbow"?2:2,
    spears:weapon==="spear"&&meleeWeapons.includes("spear")&&!mounted&&!isCharacter,spearRanks:elf?3:2,hasBow,minRange:isCatapult?Math.max(0,12-Math.max(0,stats.BS||0)):0,range:isCatapult?(template.range||48):isBoltThrower?48+(config.campaignStats?.range||0):rangedWeapon==="magicBow"?36:rangedWeapon==="bow"?(green&&["goblins","goblinHero","goblinLord"].includes(config.type)?20:elf?30:24):rangedWeapon==="crossbow"?30:rangedWeapon==="firearm"?(dwarf?24:20):rangedWeapon==="longRifle"?36:(template.range||24),lightArmour,heavyArmour:hasHeavyArmour,barding:hasBarding,
    alwaysStrikesFirst:!!template.alwaysStrikesFirst,magicalLance:config.type==="pegasusChampion",reserveDeployRule:config.type==="pegasusChampion",priorityActivation:config.type==="pegasusChampion",canDeployNeutral:config.type==="pegasusChampion",elvenArchery:!!elf&&!!config.elvenArchery,skills:{...(config.skills||{})},skirmishCapable:!!config.skills?.skirmish||!!template.grantsSkirmish,grantsSkirmish:!!template.grantsSkirmish,dualWield:!!template.dualWield||(config.meleeWeapons||[]).includes("offhandWeapon")||!!config.offhandWeapon,gender:template.gender||null,skirmishing:false,skirmishCombatRound:0,faction:elf?"highElves":dwarf?"dwarfs":green?"greenskins":isUndead?"undead":"empire",greenskinType:green?config.type:null,animosityEligible:green&&["goblins","orcBoyz","wolfRiders","boarBoyz","catapult"].includes(config.type),mountType:(mounted||isChariot)?mountType:"none",flyingMount:!!(isEagleMounted||isGreatEagleMounted||isDragon),mountStats:(mounted||isChariot)?{...(mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.mountStats:template.mountStats||{A:1,WS:3,I:3,S:3})}:null,
    baseWidthIn:isGiant?50/25.4:isTroll?40/25.4:isDragon?50/25.4:isChariot?100/25.4:isGreatEagleMounted?25/25.4:isCannon||isCatapult?80/25.4:isBoltThrower?60/25.4:mounted?25/25.4:20/25.4,baseDepthIn:isGiant?50/25.4:isTroll?40/25.4:isDragon?50/25.4:isChariot?50/25.4:isGreatEagleMounted?50/25.4:isCannon||isCatapult?100/25.4:isBoltThrower?80/25.4:mounted?50/25.4:20/25.4,heightIn:config.heightIn??(isGiant?6.5:isTroll?2.4:isDragon?3.5:(mounted||isChariot)?2.5:1.7),flightAltitudeIn:isDragon||isEagleMounted||isGreatEagleMounted?12:0,
    armour:template.spellcaster?"none":isChariot?(hasHeavyArmour?"heavy":lightArmour?"light":"none"):isCharacter&&hasMagicArmour?"fullPlate":(isCavalry||isCharacter||hasHeavyArmour?(hasHeavyArmour?"heavy":"light"):(lightArmour?"light":"none")),magicArmour:hasMagicArmour,ignoreArmourSaves:!!template.ignoreArmourSaves,canDeployAnywhere:!!template.canDeployAnywhere,coverHitPenaltyBonus:!!template.coverHitPenaltyBonus,wardSave:template.wardSave??null,wardSaveFrontOnly:!!template.wardSaveFrontOnly,stubborn:!!template.stubborn,grantsStubbornAura:!!template.grantsStubbornAura,isGeneral:!!template.isGeneral,
    largeTarget:!!template.largeTarget||isDragon,singleCharacter:false,crewArmourBonus:isChariot&&((mountType==="skeletonChariot"?FACTIONS.undead.units.skeletonChariot.stats.W:template.stats.W)+(config.chariotUpgrades?.wounds||0)+(campaignStats.chariotWounds||0)>0)?2:0,skirmisher:false,cover:null,x:config.x,y:config.y,facing:config.facing,deployed:config.side==="ai",
    engaged:false,engagedWith:null,engagedSide:null,chargedSide:null,attackedFromSide:null,flankedBy:null,
    formationWidth:isSiegeEngine?3:5,canCounterCharge:!isSiegeEngine,fleeingCharge:false,rallyingCall:!!template.rallyingCall,rallyingCallUsed:false,rallyAttemptTurn:0,activated:false,moved:false,shot:false,charged:false,fled:false,
    moveUsed:0,damage:0,shootCasualties:0,panicTested:false,terrorTested:false,terrorFledThisTurn:false,failedFearCharge:false,skirmishing:isSiegeEngine||isEagleMounted,cover:isSiegeEngine?"soft":null,stats,champion:{enabled:!!config.champion&&!isCharacter&&!isCavalry,bonus:config.championBonus||(config.type==="archers"?"BS":"A"),stats:null},attachedCharacters:[],
    characterWounds:isCharacter?template.stats.W:null,delayedDeath:false,delayedDeathSnapshot:null,championAlive:!!config.champion,championWounds:config.champion?template.stats.W:0};
}
export function createUnitsFromArmy(army,faction="empire",options={}) {
  const units={},playerFaction=["highElves","dwarfs","greenskins","undead"].includes(faction)?faction:"empire";
  army.forEach((entry,index)=>{
    const n=index+1,y=n/(army.length+1),playerEntry={...entry},aiEntry={...entry};
    if(playerFaction==="highElves"&&entry.type==="cavalry"){
      if((entry.freeCavalryOption||"bow")==="bow")aiEntry.bow=true;
      else if(!["lance","greatWeapon"].includes(aiEntry.weapon))aiEntry.weapon="spear";
    }
    const chariotMount=playerFaction==="undead"&&entry.mountType==="skeletonChariot"&&["necromancer","masterNecromancer","vampireHero","vampireLord"].includes(entry.type);
    const dragonMount=(playerFaction==="highElves"&&entry.type==="lord"&&["youngDragon","dragon","ancientDragon"].includes(entry.mountType))||(playerFaction==="greenskins"&&entry.type==="orcLord"&&entry.mountType==="wyvern");
    if(chariotMount){
      const chariotTemplate=FACTIONS.undead.units.skeletonChariot,host=buildUnit(chariotTemplate,{type:"skeletonChariot",id:"p"+n,index:n,models:3,side:"player",x:.22,y,facing:0},playerFaction,false);
      const rider=buildUnit(FACTIONS.undead.units[entry.type],{...playerEntry,type:entry.type,mounted:false,mountType:"none",id:"p"+n+"r",index:n,side:"player",x:.22,y,facing:0},playerFaction,false);
      host.points=chariotTemplate.points;rider.points=Math.max(0,unitCost(entry,playerFaction)-host.points);rider.mounted=true;rider.mountType="skeletonChariot";rider.isChariotRider=true;rider.baseWidthIn=host.baseWidthIn;rider.baseDepthIn=host.baseDepthIn;rider.heightIn=host.heightIn;rider.attachedTo=host.id;host.attachedCharacters=[rider.id];units[host.id]=host;units[rider.id]=rider;
    }else if(dragonMount){
      const dragonType=entry.mountType,mountFaction=dragonType==="wyvern"?"greenskins":"highElves",dragonTemplate=FACTIONS[mountFaction].units[dragonType],host=buildUnit(dragonTemplate,{type:dragonType,id:"p"+n,index:n,models:1,side:"player",x:.22,y,facing:0},playerFaction,false);
      host.points=dragonTemplate.points;host.isDragonMount=true;host.mounted=true;host.isCavalry=true;host.mountType=dragonType;
      const riderType=entry.type==="orcLord"?"orcLord":"lord",rider=buildUnit(FACTIONS[playerFaction].units[riderType],{...playerEntry,type:riderType,mounted:false,mountType:"none",id:"p"+n+"r",index:n,side:"player",x:.22,y,facing:0},playerFaction,false);
      rider.points=unitCost(entry,playerFaction)-host.points;rider.isDragonRider=true;rider.mounted=true;rider.mountType=dragonType;rider.flyingMount=true;rider.flightAltitudeIn=12;rider.baseWidthIn=host.baseWidthIn;rider.baseDepthIn=host.baseDepthIn;rider.heightIn=3.5;rider.attachedTo=host.id;host.attachedCharacters=[rider.id];units[host.id]=host;units[rider.id]=rider;
    }else units["p"+n]=buildUnit(FACTIONS[playerFaction].units[entry.type],{...playerEntry,id:"p"+n,index:n,side:"player",x:.22,y,facing:0},playerFaction,false);
    const opposingType=options.preserveFactionForOpponent&&FACTIONS[playerFaction].units[entry.type]?entry.type:entry.type==="deepflameDragon"?"deepflameDragon":entry.type==="cannon"&&FACTIONS.empire.units.cannon?"cannon":FACTIONS.opposing.units[entry.type]?entry.type:(["cannon","boltThrower","catapult","skeletonChariot","humanChariot","elfChariot","goblinChariot","orcChariot","wyvern","youngDragon","dragon","ancientDragon","dwarfInfantry","dwarfWarriors","dwarfThunderers","dwarfQuarrellers","dwarfLongbeards","dwarfIronbreakers","goblins","orcBoyz","wolfRiders","boarBoyz","skeletonHorses","trolls","giant","zombies","skeletons"].includes(entry.type)?"swordsmen":["dwarfCaptain","goblinHero","orcHero","goblinShaman","orcShaman","mageHero","necromancer","masterNecromancer","vampireHero"].includes(entry.type)?"captain":(["legendaryLord","shadowElf","pegasusChampion","rifleman","captainWeiss","dwarfLord","goblinLord","orcLord","goblinGreatShaman","orcGreatShaman","mageLord","vampireLord"].includes(entry.type)?"lord":entry.type));const opposingEntry={...aiEntry,type:opposingType};
    const opposingTemplate=options.preserveFactionForOpponent?(FACTIONS[playerFaction].units[opposingType]||Object.values(FACTIONS).map(group=>group.units?.[opposingType]).find(Boolean)||FACTIONS.empire.units.swordsmen):(FACTIONS.opposing.units[opposingType]||FACTIONS.empire.units[opposingType]||FACTIONS.highElves.units[opposingType]||FACTIONS.opposing.units.swordsmen);
    units["a"+n]=buildUnit(opposingTemplate,{...opposingEntry,id:"a"+n,index:n,side:"ai",x:.78,y,facing:Math.PI},options.preserveFactionForOpponent?playerFaction:"empire",!options.preserveFactionForOpponent);
  });
  // Assign AI characters by battlefield role, not by the mere presence of a ranged weapon.
  // A melee lord carrying a backup bow remains a melee/leadership character.
  const aiHosts=Object.values(units).filter(u=>u.side==="ai"&&!u.isCharacter&&u.models>0);
  const aiHeroes=Object.values(units).filter(u=>u.side==="ai"&&u.isCharacter&&!u.attachedTo);
  const characterRole=hero=>{
    const type=hero.type||"";
    if(hero.spellcaster||["mageHero","mageLord","starwardenLord","necromancer","masterNecromancer","vampireLord","goblinShaman","goblinGreatShaman","orcShaman","orcGreatShaman"].includes(type))return "caster";
    if(["rifleman","shadowElf"].includes(type)||hero.characterRole==="ranged")return "ranged";
    // Elf lords/captains with a modest spell level are hybrids; their melee/leadership
    // role takes precedence unless they are explicitly a caster archetype.
    return "melee";
  };
  const assignedHosts=new Set();
  aiHeroes.sort((a,b)=>{
    const roleRank=u=>characterRole(u)==="caster"?0:characterRole(u)==="ranged"?1:2;
    return roleRank(a)-roleRank(b)||(b.stats.Ld||0)-(a.stats.Ld||0);
  }).forEach(hero=>{
    const role=characterRole(hero),mounted=!!hero.mounted;
    const candidates=aiHosts.filter(host=>!!host.isCavalry===mounted);
    const score=host=>{
      const already=(host.attachedCharacters||[]).filter(id=>units[id]?.models>0).length;
      const ranged=!!host.hasRangedWeapon||host.kind==="archer"||host.type==="archers"||host.type==="dwarfThunderers"||host.type==="dwarfQuarrellers";
      const melee=host.kind==="melee"||["swordsmen","dwarfInfantry","dwarfWarriors","dwarfLongbeards","dwarfIronbreakers","orcBoyz","skeletons","zombies","trolls"].includes(host.type)||host.isCavalry&&!ranged;
      let fit=role==="caster"?(ranged?8:melee?2:0):role==="ranged"?(ranged?10:melee?-2:0):(melee?9:ranged?-3:1);
      return fit-already*7+(assignedHosts.has(host.id)?-1:0)+Math.min(2,(host.models||1)/10);
    };
    const host=candidates.filter(h=>!h.attachedCharacters?.some(id=>units[id]?.models>0)).sort((a,b)=>score(b)-score(a))[0]
      ||candidates.sort((a,b)=>score(b)-score(a))[0];
    if(!host)return;
    hero.attachedTo=host.id;hero.x=host.x;hero.y=host.y;
    host.attachedCharacters=[...new Set([...(host.attachedCharacters||[]),hero.id])];
    host.stats.M=Math.min(host.baseMove??host.stats.M,hero.stats.M);
    assignedHosts.add(host.id);
  });
  for(const side of ["player","ai"]){const eligible=Object.values(units).filter(u=>u.side===side&&u.isCharacter);const general=(faction==="undead"&&side==="player"?eligible.filter(u=>u.spellcaster):eligible).sort((a,b)=>b.stats.Ld-a.stats.Ld)[0];if(general)general.isGeneral=true;}
  return units;
}
export function createStartingUnits(){return createUnitsFromArmy([{type:"swordsmen",models:20,champion:false,lightArmour:false}]);}

// Build an independent Empire opponent roster for Skirmish. The opponent targets
// the player's points total, but uses its own composition rather than copying units.
export function buildOpponentArmy(playerArmy, playerFaction = "empire", options = {}) {
  const baseTarget = playerArmy.reduce((sum, unit) => sum + unitCost(unit, playerFaction), 0);
  const target = baseTarget * (options.budgetMultiplier || 1);
  const siege = !!options.siege;
  if (target <= 0) return [{ type: "swordsmen", models: 5, weapon: "handWeapon" }];

  const costOf = roster => roster.reduce((sum, unit) => sum + unitCost(unit, "empire"), 0);
  const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const makeUnit = type => {
    if (type === "swordsmen") {
      const weapon = ["handWeapon", "handWeapon", "greatWeapon", "halberd"][randInt(0, 3)];
      return { type, models: randInt(5, 30), weapon, meleeWeapons: ["handWeapon", weapon] };
    }
    if (type === "archers") return { type, models: randInt(5, 30), weapon: "handWeapon", rangedWeapon: "bow" };
    if (type === "cannon") return { type, models: 3, weapon: "handWeapon" };
    if (type === "cavalry") {
      const weapon = ["handWeapon", "handWeapon", "spear", "lance"][randInt(0, 3)];
      return { type, models: randInt(5, 15), weapon, meleeWeapons: ["handWeapon", weapon], freeCavalryOption: "spear" };
    }
    if (type === "captain") {
      const rangedWeapon = Math.random() < 0.28 ? (Math.random() < 0.5 ? "crossbow" : "firearm") : null;
      return { type, models: 1, weapon: "handWeapon", rangedWeapon, mounted: false, heavyArmour: Math.random() < 0.35 };
    }
    return { type: "lord", models: 1, weapon: "handWeapon", mounted: false, heavyArmour: Math.random() < 0.35 };
  };
  const score = roster => {
    const total = costOf(roster), ranged = roster.some(u => u.type === "archers" || u.rangedWeapon);
    const cavalry = roster.some(u => u.type === "cavalry");
    let penalty = Math.abs(total - target);
    if (roster.length === 1 && target >= 120) penalty += target * 0.10;
    if (!ranged && target >= 180) penalty += target * 0.08;
    if (!cavalry && target >= 320) penalty += target * 0.025;
    if (roster.length > 5) penalty += target * 0.015;
    if (total > target * 1.10) penalty += (total - target * 1.10) * 4;
    return penalty;
  };
  const cloneRoster = roster => roster.map(u => ({ ...u, meleeWeapons: u.meleeWeapons ? [...u.meleeWeapons] : undefined }));
  const tune = source => {
    const roster = cloneRoster(source);
    // First tune unit sizes without changing the composition.
    for (let pass = 0; pass < 2; pass++) {
      for (const unit of roster) {
        if (!["swordsmen", "archers", "cavalry"].includes(unit.type)) continue;
        const max = unit.type === "cavalry" ? 15 : 30;
        let bestModels = unit.models, bestGap = Math.abs(costOf(roster) - target);
        for (let n = 5; n <= max; n++) {
          unit.models = n;
          const gap = Math.abs(costOf(roster) - target);
          if (gap < bestGap) { bestGap = gap; bestModels = n; }
        }
        unit.models = bestModels;
      }
    }

    // Then make small, sensible purchases or cuts. Stop as soon as we are within 10%.
    for (let step = 0; step < 80; step++) {
      const total = costOf(roster), gap = Math.abs(total - target);
      if (gap <= target * 0.10) return roster;
      const under = total < target;
      let bestMove = null, bestGap = gap;
      const consider = (next, description) => {
        const nextTotal = costOf(next), nextGap = Math.abs(nextTotal - target);
        // When over budget, only accept a cut; when under, only accept a purchase.
        if (under ? nextTotal <= total : nextTotal >= total) return;
        if (nextGap < bestGap) { bestGap = nextGap; bestMove = { next, description }; }
      };
      for (let i = 0; i < roster.length; i++) {
        const unit = roster[i];
        if (["swordsmen", "archers", "cavalry"].includes(unit.type)) {
          const max = unit.type === "cavalry" ? 15 : 30;
          if (under && unit.models < max) {
            const next = cloneRoster(roster); next[i].models++;
            consider(next, "add model");
          }
          if (!under && unit.models > 5) {
            const next = cloneRoster(roster); next[i].models--;
            consider(next, "remove model");
          }
        }
        // Magical equipment is a useful points sink for characters.
        if (["captain", "lord"].includes(unit.type)) {
          if (under && unit.weapon !== "magicSword") {
            const next = cloneRoster(roster); next[i].weapon = "magicSword";
            next[i].meleeWeapons = [...new Set([...(next[i].meleeWeapons || []), "magicSword"])];
            consider(next, "buy magic sword");
          }
          if (under && !unit.magicArmour) {
            const next = cloneRoster(roster); next[i].magicArmour = true;
            consider(next, "buy magic armour");
          }
          if (!under && unit.weapon === "magicSword") {
            const next = cloneRoster(roster); next[i].weapon = "handWeapon";
            next[i].meleeWeapons = (next[i].meleeWeapons || []).filter(w => w !== "magicSword");
            consider(next, "remove magic sword");
          }
          if (!under && unit.magicArmour) {
            const next = cloneRoster(roster); next[i].magicArmour = false;
            consider(next, "remove magic armour");
          }
        }
        // Drop costly equipment before sacrificing a whole unit.
        if (!under) {
          if (["greatWeapon", "halberd", "lance"].includes(unit.weapon)) {
            const next = cloneRoster(roster); next[i].weapon = "handWeapon";
            next[i].meleeWeapons = (next[i].meleeWeapons || []).filter(w => !["greatWeapon", "halberd", "lance"].includes(w));
            consider(next, "downgrade weapon");
          }
          if (unit.rangedWeapon === "firearm" || unit.rangedWeapon === "crossbow") {
            const next = cloneRoster(roster); next[i].rangedWeapon = unit.type === "archers" ? "bow" : null;
            consider(next, "downgrade ranged weapon");
          }
          if (unit.heavyArmour) {
            const next = cloneRoster(roster); next[i].heavyArmour = false;
            consider(next, "remove heavy armour");
          }
        }
      }
      if (!bestMove) return roster;
      // Keep the best local improvement; next iteration reassesses the remaining gap.
      roster.splice(0, roster.length, ...bestMove.next);
    }
    return roster;
  };

  let best = null, bestScore = Infinity;
  const types = siege ? ["swordsmen", "archers", "cavalry", "captain", "lord", "cannon"] : ["swordsmen", "archers", "cavalry", "captain", "lord"];
  for (let attempt = 0; attempt < 2400; attempt++) {
    const roster = [makeUnit("swordsmen")];
    const desired = target < 100 ? 1 : target < 220 ? randInt(2, 3) : randInt(3, 5);
    while (roster.length < desired && roster.length < 6) {
      const choices = types.filter(type => {
        if ((type === "captain" || type === "lord") && roster.filter(u => ["captain", "lord"].includes(u.type)).length >= (target >= 360 ? 2 : 1)) return false;
        if (type === "lord" && target < 180) return false;
        if (type === "cavalry" && (target < 100 || (siege && roster.filter(u => u.type === "cavalry").length >= 1))) return false;
        if (type === "cannon" && (!siege || roster.some(u => u.type === "cannon") || target < 140)) return false;
        return true;
      });
      if (!choices.length) break;
      const weights = choices.map(type => type === "archers" ? (siege ? 2.7 : 1.35) : type === "cavalry" ? (siege ? 0.18 : target >= 240 ? 1.2 : 0.8) : type === "cannon" ? (siege ? 1.8 : 0) : type === "swordsmen" ? (siege ? 1.05 : 1) : type === "captain" ? (target >= 160 ? 0.8 : 0.25) : 0.45);
      let roll = Math.random() * weights.reduce((a, b) => a + b, 0), picked = choices[0];
      for (let i = 0; i < choices.length; i++) { roll -= weights[i]; if (roll <= 0) { picked = choices[i]; break; } }
      roster.push(makeUnit(picked));
    }
    const candidate = tune(roster);
    const total = costOf(candidate);
    const withinTolerance = Math.abs(total - target) <= target * 0.10;
    const sensible = !(candidate.length === 1 && target >= 120) &&
      (target < 180 || candidate.some(u => u.type === "archers" || u.rangedWeapon || u.type === "cannon")) && (!siege || candidate.some(u => u.type === "archers" || u.rangedWeapon || u.type === "cannon"));
    const candidateScore = score(candidate);
    if (candidateScore < bestScore) { best = candidate; bestScore = candidateScore; }
    // Accept the first sensible roster within tolerance; no need to optimise further.
    if (withinTolerance && sensible) return candidate;
  }
  return best || [{ type: "swordsmen", models: Math.max(5, Math.min(30, Math.round(target / 8))), weapon: "handWeapon" }];
}
