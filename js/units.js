import { FACTIONS } from "./factions.js";

export function unitCost(config, faction) {
  const elf=faction==="highElves",type=config.type,models=config.models||1,character=["captain","lord","legendaryLord","shadowElf"].includes(type),eagleKit=elf&&(character||type==="cavalry")&&config.mountType==="eagle";
  if(type==="cannon")return 80;if(type==="boltThrower")return 60;
  const upgrades=[{key:"M",unit:2,character:5},{key:"WS",unit:2,character:5},{key:"BS",unit:2,character:5},{key:"S",unit:3,character:6},{key:"T",unit:4,character:8},{key:"I",unit:1,character:3},{key:"Ld",unit:1,character:3}].reduce((sum,s)=>sum+(config.upgrades&&config.upgrades[s.key]?(character?s.character:s.unit*models):0),0);
  const skillCost=["rerollOnesMelee","rerollOnesShooting","steadfast","skirmish"].reduce((sum,key)=>sum+(config.skills&&config.skills[key]?3:0),0);
  const weapons=[...new Set([...(config.meleeWeapons||[]),config.weapon||"handWeapon"])];
  const ranged=config.rangedWeapon||(["bow","crossbow","firearm"].includes(config.weapon)?config.weapon:(type==="archers"?"bow":config.bow?"bow":null));
  const rangedCost=ranged==="bow"?(eagleKit?0:elf&&type==="cavalry"&&(config.freeCavalryOption||"bow")==="bow"?0:(elf?3:2)*(character?1:models)):ranged==="crossbow"?3*(character?1:models):ranged==="firearm"?4*(character?1:models):0;
  if(character){
    const meleeCost=weapons.reduce((sum,w)=>sum+(["halberd","greatWeapon"].includes(w)?4:w==="spear"&&config.mounted?(eagleKit?0:2):w==="lance"&&config.mounted?(eagleKit?2:4):0),0);
    return (type==="legendaryLord"?160:type==="shadowElf"?165:(elf?(type==="lord"?120:75):(type==="lord"?80:50)))+(config.heavyArmour&&!eagleKit&&!["legendaryLord","shadowElf"].includes(type)?4:0)+(config.magicArmour&&!eagleKit?10:0)+(config.weapon==="magicSword"?10:0)+meleeCost+(config.mounted?8:0)+(config.mounted&&config.barding&&!eagleKit?4:0)+(config.shield&&type!=="legendaryLord"?2:0)+rangedCost+upgrades+skillCost;
  }
  if(type==="cavalry"){
    const free=config.freeCavalryOption||"bow";
    const meleeCost=weapons.reduce((sum,w)=>sum+(w==="spear"&&!(elf&&free==="spear")?models:["lance","greatWeapon"].includes(w)?2*models:0),0);
    const bowCost=(config.bow&&!(elf&&free==="bow")&&!eagleKit?2*models:0)+(ranged==="bow"&&!(elf&&free==="bow")&&!config.bow&&!eagleKit?2*models:0);
    const otherRangedCost=ranged==="crossbow"?3*models:ranged==="firearm"?4*models:0;
    return models*(elf?24:16)+(config.elvenArchery&&elf&&(ranged==="bow"||config.bow||free==="bow")?2*models:0)+bowCost+otherRangedCost+(config.heavyArmour?2*models:0)+(config.barding?2*models:0)+(config.shield?0.5*models:0)+meleeCost+upgrades+skillCost;
  }
  const meleeCost=weapons.reduce((sum,w)=>sum+(w==="spear"&&!(elf&&type==="swordsmen")?models:w==="greatWeapon"?2*models:w==="halberd"?models:0),0);
  return models*(elf?12:8)+meleeCost+rangedCost+(config.elvenArchery&&elf&&ranged==="bow"?2*models:0)+(config.champion?(elf?9:6):0)+(config.lightArmour&&!elf?models:0)+(config.shield&&!(elf&&type==="swordsmen")?0.5*models:0)+upgrades+skillCost;
}
function buildUnit(template,config,faction,opposing=false) {
  const elf=faction==="highElves"&&!opposing,stats={...template.stats};
  const isCannon=config.type==="cannon",isBoltThrower=config.type==="boltThrower",isSiegeEngine=isCannon||isBoltThrower;
  const isCharacter=["captain","lord","legendaryLord","shadowElf"].includes(config.type),isCavalry=config.type==="cavalry",mountType=config.mountType||(config.mounted?"horse":"none"),mounted=isCavalry||(isCharacter&&mountType!=="none"),isEagleMounted=elf&&mountType==="eagle"&&(isCharacter||isCavalry),hasHeavyArmour=!!config.heavyArmour&&!isEagleMounted,hasMagicArmour=!!config.magicArmour&&!isEagleMounted,hasBarding=!!config.barding&&!isEagleMounted;
  if(mounted)stats.M=isEagleMounted?12:elf?9:8;
  const crewMovementCharacteristic=isCannon?4:isBoltThrower?(elf?5:4):null;
  if(isCannon)stats.M=2;
  if(isBoltThrower)stats.M=elf?2.5:2;
  if(mounted&&hasBarding&&!elf)stats.M=7;
  if(isCharacter&&!mounted&&hasHeavyArmour&&!hasMagicArmour&&!elf)stats.M=Math.max(1,stats.M-1);
  const lightArmour=isBoltThrower|| (isCavalry||isCharacter?(!hasHeavyArmour):(elf||!!config.lightArmour));
  const meleeWeapons=[...new Set([...(config.meleeWeapons||[]),config.weapon||"handWeapon"])].filter(w=>!["bow","crossbow","firearm"].includes(w)),ownsShield=!!config.shield;if(!meleeWeapons.includes("handWeapon"))meleeWeapons.unshift("handWeapon");const spears=config.weapon==="spear"&&meleeWeapons.includes("spear");
  const rangedWeapon=isCannon?null:(isBoltThrower?"bow":(config.rangedWeapon||(["bow","crossbow","firearm","magicBow"].includes(config.weapon)?config.weapon:(config.type==="archers"?"bow":(isCavalry&&(!!config.bow||(elf&&(config.freeCavalryOption||"bow")==="bow"))?"bow":null)))));
  const hasBow=rangedWeapon==="bow"||rangedWeapon==="magicBow";
  let weapon=(isCharacter||isCavalry||config.type==="swordsmen")?(["bow","crossbow","firearm"].includes(config.weapon)?"handWeapon":(config.weapon||"handWeapon")):"handWeapon";
  const factionName=faction==="highElves"&&!opposing?"High Elf":opposing?"Opposing":faction==="highElves"?"High Elf":"Empire";
  const primaryMelee=weapon==="greatWeapon"||(meleeWeapons||[]).includes("greatWeapon")?"greatWeapon":weapon==="halberd"||(meleeWeapons||[]).includes("halberd")?"halberd":weapon==="spear"||(meleeWeapons||[]).includes("spear")?"spear":weapon;
  const unitName=isSiegeEngine?template.name:isCharacter?template.name+(isEagleMounted?" (Pegasus)":""):isCavalry?template.name+(isEagleMounted?" (Pegasus)":""):rangedWeapon==="bow"?factionName+" Archers":rangedWeapon==="crossbow"?factionName+" Crossbowmen":rangedWeapon==="firearm"?factionName+" Handgunners":primaryMelee==="greatWeapon"?(factionName==="High Elf"?"High Elf Swordmasters":factionName+" Greatswords"):primaryMelee==="halberd"?factionName+" Halberdiers":primaryMelee==="spear"?factionName+" Spearmen":factionName+" Swordsmen";
  const unitShort=isSiegeEngine?template.short:isCharacter?template.short:isCavalry?template.short:rangedWeapon==="bow"?"Archers":rangedWeapon==="crossbow"?"Crossbows":rangedWeapon==="firearm"?"Handguns":primaryMelee==="greatWeapon"?"Greatswords":primaryMelee==="halberd"?"Halberds":primaryMelee==="spear"?"Spearmen":"Swordsmen";
  const shield=ownsShield&&(weapon==="spear"||(!["greatWeapon","halberd"].includes(weapon)&&(!rangedWeapon||config.rangedMode!=="bow")));
  for(const key of ["M","WS","BS","S","T","I","Ld"])if(config.upgrades&&config.upgrades[key])stats[key]+=(isSiegeEngine&&key==="M"?0.5:1);
  
  const campaignStats=config.campaignStats||{};
  for(const key of ["WS","BS","S","T","Ld"])stats[key]+=Math.max(0,campaignStats[key]||0);
  if(campaignStats.MI){stats.M+=isSiegeEngine?campaignStats.MI*0.5:campaignStats.MI;stats.I+=campaignStats.MI;}
  // Halberds are infantry weapons; prevent stale or malformed mounted loadouts.
  if(mounted&&weapon==="halberd")weapon="handWeapon";
  if(isCavalry&&elf&&(config.freeCavalryOption||"bow")==="spear"){if(!meleeWeapons.includes("spear"))meleeWeapons.push("spear");if(weapon==="handWeapon")weapon="spear";}
  const costFaction=opposing?"empire":faction;
  return {id:config.id,name:isSiegeEngine?unitName:(template.namedCharacter?unitName:unitName+" "+config.index),short:unitShort,side:config.side,kind:template.kind,
    isCharacter,isCavalry,mounted,isCannon,isBoltThrower,isSiegeEngine,isSiege:isSiegeEngine,crewModels:isCannon?3:isBoltThrower?2:0,artilleryWounds:isCannon?3:isBoltThrower?2:0,artilleryStartWounds:isCannon?3:isBoltThrower?2:0,artilleryToughness:isSiegeEngine?7:0,crewMovementCharacteristic:isSiegeEngine?crewMovementCharacteristic+(config.upgrades?.M?1:0)+(campaignStats.MI||0):null,artilleryStrength:isCannon?10:isBoltThrower?7:0,artilleryArmourPiercing:isCannon?1:0,moveAndFire:!!config.campaignStats?.moveAndFire,artilleryRange:isCannon?60+(config.campaignStats?.range||0):isBoltThrower?48+(config.campaignStats?.range||0):0,baseMove:stats.M,
    models:isCharacter?1:(config.models??template.models),startModels:isCharacter?1:(config.models??template.models),points:unitCost(config,costFaction),weapon,meleeWeapons,hasSpear:meleeWeapons.includes("spear"),hasGreatWeapon:meleeWeapons.includes("greatWeapon"),hasHalberd:meleeWeapons.includes("halberd"),ownsShield,shield:ownsShield&&(!["greatWeapon","halberd"].includes(weapon)),rangedWeapon,hasRangedWeapon:!!rangedWeapon,rangedMode:ownsShield&&rangedWeapon?"shield":rangedWeapon?"bow":"shield",
    rangedStrength:isBoltThrower?5:rangedWeapon==="magicBow"?stats.S:["crossbow","firearm"].includes(rangedWeapon)?4:3,rangedUsesUserStats:rangedWeapon==="magicBow",armourPiercing:rangedWeapon==="firearm"?1:0,
    bsCap:rangedWeapon==="crossbow"?4:rangedWeapon==="firearm"?3:null,
    ranksToShoot:mounted?1:rangedWeapon==="bow"?(elf?4:3):rangedWeapon==="crossbow"||rangedWeapon==="firearm"?2:0,
    overUnitPenalty:rangedWeapon==="bow"?1:rangedWeapon==="crossbow"?2:2,
    spears:weapon==="spear"&&meleeWeapons.includes("spear")&&!mounted&&!isCharacter,spearRanks:elf?3:2,hasBow,range:isBoltThrower?48+(config.campaignStats?.range||0):rangedWeapon==="magicBow"?36:rangedWeapon==="bow"?(elf?30:24):rangedWeapon==="crossbow"?30:rangedWeapon==="firearm"?20:(template.range||24),lightArmour,heavyArmour:hasHeavyArmour,barding:hasBarding,
    alwaysStrikesFirst:!!template.alwaysStrikesFirst,elvenArchery:!!elf&&!!config.elvenArchery,skills:{...(config.skills||{})},skirmishCapable:!!config.skills?.skirmish||!!template.grantsSkirmish,grantsSkirmish:!!template.grantsSkirmish,dualWield:!!template.dualWield||(config.meleeWeapons||[]).includes("offhandWeapon")||!!config.offhandWeapon,gender:template.gender||null,skirmishing:false,skirmishCombatRound:0,faction:elf?"highElves":"empire",mountType:mounted?(isEagleMounted?"eagle":"horse"):"none",flyingMount:!!isEagleMounted,mountStats:mounted?{...(template.mountStats||{A:1,WS:3,I:3,S:3})}:null,
    baseWidthIn:isCannon?80/25.4:isBoltThrower?60/25.4:mounted?25/25.4:20/25.4,baseDepthIn:isCannon?100/25.4:isBoltThrower?80/25.4:mounted?50/25.4:20/25.4,heightIn:config.heightIn??(mounted?2.5:1.7),flightAltitudeIn:isEagleMounted?12:0,
    armour:isCharacter&&hasMagicArmour?"fullPlate":(isCavalry||isCharacter?(hasHeavyArmour?"heavy":"light"):(lightArmour?"light":"none")),magicArmour:hasMagicArmour,ignoreArmourSaves:!!template.ignoreArmourSaves,canDeployAnywhere:!!template.canDeployAnywhere,coverHitPenaltyBonus:!!template.coverHitPenaltyBonus,wardSave:null,
    largeTarget:false,singleCharacter:false,skirmisher:false,cover:null,x:config.x,y:config.y,facing:config.facing,deployed:config.side==="ai",
    engaged:false,engagedWith:null,engagedSide:null,chargedSide:null,attackedFromSide:null,flankedBy:null,
    formationWidth:isSiegeEngine?3:5,canCounterCharge:!isSiegeEngine,fleeingCharge:false,activated:false,moved:false,shot:false,charged:false,fled:false,
    moveUsed:0,damage:0,shootCasualties:0,panicTested:false,skirmishing:isSiegeEngine||isEagleMounted,cover:isSiegeEngine?"soft":null,stats,champion:{enabled:!!config.champion&&!isCharacter&&!isCavalry,bonus:config.championBonus||(config.type==="archers"?"BS":"A"),stats:null},attachedCharacters:[],
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
    const opposingType=FACTIONS.opposing.units[entry.type]?entry.type:(["cannon","boltThrower"].includes(entry.type)?"swordsmen":(["legendaryLord","shadowElf"].includes(entry.type)?"lord":entry.type));const opposingEntry={...aiEntry,type:opposingType};
    units["a"+n]=buildUnit(FACTIONS.opposing.units[opposingType],{...opposingEntry,id:"a"+n,index:n,side:"ai",x:.78,y,facing:Math.PI},"empire",true);
  });
  Object.values(units).filter(u=>u.side==="ai"&&u.isCharacter&&!u.hasRangedWeapon).forEach(hero=>{
    const host=Object.values(units).find(u=>u.side==="ai"&&!u.isCharacter&&u.models>0&&!!u.isCavalry===!!hero.mounted);
    if(!host)return;hero.attachedTo=host.id;hero.x=host.x;hero.y=host.y;host.attachedCharacters=[...new Set([...(host.attachedCharacters||[]),hero.id])];host.stats.M=Math.min(host.baseMove??host.stats.M,hero.stats.M);
  });
  for(const side of ["player","ai"]){const general=Object.values(units).filter(u=>u.side===side&&u.isCharacter).sort((a,b)=>b.stats.Ld-a.stats.Ld)[0];if(general)general.isGeneral=true;}
  return units;
}
export function createStartingUnits(){return createUnitsFromArmy([{type:"swordsmen",models:20,champion:false,lightArmour:false}]);}

// Build an independent Empire opponent roster for Skirmish. The opponent targets
// the player's points total, but uses its own composition rather than copying units.
export function buildOpponentArmy(playerArmy, playerFaction = "empire") {
  const target = playerArmy.reduce((sum, unit) => sum + unitCost(unit, playerFaction), 0);
  if (target <= 0) return [{ type: "swordsmen", models: 5, weapon: "handWeapon" }];

  const costOf = roster => roster.reduce((sum, unit) => sum + unitCost(unit, "empire"), 0);
  const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const makeUnit = type => {
    if (type === "swordsmen") {
      const weapon = ["handWeapon", "handWeapon", "greatWeapon", "halberd"][randInt(0, 3)];
      return { type, models: randInt(5, 30), weapon, meleeWeapons: ["handWeapon", weapon] };
    }
    if (type === "archers") return { type, models: randInt(5, 30), weapon: "handWeapon", rangedWeapon: "bow" };
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
  const types = ["swordsmen", "archers", "cavalry", "captain", "lord"];
  for (let attempt = 0; attempt < 2400; attempt++) {
    const roster = [makeUnit("swordsmen")];
    const desired = target < 100 ? 1 : target < 220 ? randInt(2, 3) : randInt(3, 5);
    while (roster.length < desired && roster.length < 6) {
      const choices = types.filter(type => {
        if ((type === "captain" || type === "lord") && roster.filter(u => ["captain", "lord"].includes(u.type)).length >= (target >= 360 ? 2 : 1)) return false;
        if (type === "lord" && target < 180) return false;
        if (type === "cavalry" && target < 100) return false;
        return true;
      });
      if (!choices.length) break;
      const weights = choices.map(type => type === "archers" ? 1.35 : type === "cavalry" ? (target >= 240 ? 1.2 : 0.8) : type === "swordsmen" ? 1 : type === "captain" ? (target >= 160 ? 0.8 : 0.25) : 0.45);
      let roll = Math.random() * weights.reduce((a, b) => a + b, 0), picked = choices[0];
      for (let i = 0; i < choices.length; i++) { roll -= weights[i]; if (roll <= 0) { picked = choices[i]; break; } }
      roster.push(makeUnit(picked));
    }
    const candidate = tune(roster);
    const total = costOf(candidate);
    const withinTolerance = Math.abs(total - target) <= target * 0.10;
    const sensible = !(candidate.length === 1 && target >= 120) &&
      (target < 180 || candidate.some(u => u.type === "archers" || u.rangedWeapon));
    const candidateScore = score(candidate);
    if (candidateScore < bestScore) { best = candidate; bestScore = candidateScore; }
    // Accept the first sensible roster within tolerance; no need to optimise further.
    if (withinTolerance && sensible) return candidate;
  }
  return best || [{ type: "swordsmen", models: Math.max(5, Math.min(30, Math.round(target / 8))), weapon: "handWeapon" }];
}
