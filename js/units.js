import { FACTIONS } from "./factions.js";

function unitCost(config) {
  if (config.type === "captain" || config.type === "lord") return (config.type === "lord" ? 80 : 50) + (config.heavyArmour ? 4 : 0) + ((config.weapon && config.weapon !== "handWeapon") || config.greatWeapon ? 4 : 0);
  const base = config.type === "swordsmen" ? 8 : 10;
  return config.models * base + (config.champion ? 6 : 0) +
    (config.type === "swordsmen" && config.lightArmour ? config.models : 0) +
    (config.type === "swordsmen" && config.spears ? config.models : 0);
}

function buildUnit(template, config) {
  const stats = { ...template.stats };
  if ((config.type === "captain" || config.type === "lord") && config.heavyArmour) stats.M = Math.max(1, stats.M - 1);

  return {
    id: config.id, name: template.name + " " + config.index, short: template.short, side: config.side,
    kind: template.kind, isCharacter: config.type === "captain" || config.type === "lord", isGeneral: config.type === "lord", attachedTo: null, baseMove: stats.M,
    models: config.type === "captain" || config.type === "lord" ? 1 : config.models, startModels: config.type === "captain" || config.type === "lord" ? 1 : config.models, points: unitCost(config), weapon: config.type === "captain" || config.type === "lord" ? (config.weapon || (config.greatWeapon ? "greatWeapon" : "handWeapon")) : "handWeapon",
    spears: config.type === "swordsmen" && !!config.spears,
    lightArmour: !!config.lightArmour, heavyArmour: !!config.heavyArmour,
    armour: config.type === "captain" || config.type === "lord" ? (config.heavyArmour ? "heavy" : "light") : (config.lightArmour ? "light" : "none"), shield: false, wardSave: null,
    // Optional rule tags consumed by shooting modifiers when a unit/profile or
    // future battlefield-terrain interaction sets them.
    largeTarget: false, singleCharacter: false, skirmisher: false, cover: null,
    x: config.x, y: config.y, facing: config.facing, deployed: config.side === "ai",
    engaged: false, engagedWith: null, engagedSide: null, chargedSide: null, attackedFromSide: null, flankedBy: null,
    formationWidth: 5, canCounterCharge: true, fleeingCharge: false, activated: false, moved: false, shot: false, charged: false, fled: false,
    moveUsed: 0, damage: 0, shootCasualties: 0, panicTested: false,
    stats, champion: { enabled: !!config.champion && config.type !== "captain", stats: null },
    attachedCharacters: [], characterWounds: config.type === "captain" || config.type === "lord" ? template.stats.W : null, delayedDeath: false, delayedDeathSnapshot: null, championAlive: !!config.champion, championWounds: config.champion ? template.stats.W : 0
  };
}

export function createUnitsFromArmy(army) {
  const units = {};
  army.forEach((entry, index) => {
    const n = index + 1, y = n / (army.length + 1);
    units["p" + n] = buildUnit(FACTIONS.empire.units[entry.type], {
      ...entry, id: "p" + n, index: n, side: "player", x: 0.22, y, facing: 0
    });
    units["a" + n] = buildUnit(FACTIONS.opposing.units[entry.type], {
      ...entry, id: "a" + n, index: n, side: "ai", x: 0.78, y, facing: Math.PI
    });
  });
  // The AI automatically embeds its heroes in the first available regiment.
  Object.values(units).filter(u=>u.side==="ai"&&u.isCharacter).forEach(hero=>{
    const host=Object.values(units).find(u=>u.side==="ai"&&!u.isCharacter&&u.models>0);
    if(!host)return;
    hero.attachedTo=host.id;hero.x=host.x;hero.y=host.y;
    host.attachedCharacters=[...new Set([...(host.attachedCharacters||[]),hero.id])];
    host.stats.M=Math.min(host.baseMove??host.stats.M,hero.stats.M);
  });
  return units;
}

export function createStartingUnits() {
  return createUnitsFromArmy([
    { type: "swordsmen", models: 20, champion: false, lightArmour: false },
    { type: "archers", models: 10, champion: false, lightArmour: false }
  ]);
}
