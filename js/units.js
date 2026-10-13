import { FACTIONS } from "./factions.js";

function unitCost(config) {
  const base = config.type === "swordsmen" ? 8 : 10;
  return config.models * base + (config.champion ? 6 : 0) +
    (config.type === "swordsmen" && config.lightArmour ? config.models : 0);
}

function buildUnit(template, config) {
  const stats = { ...template.stats };
  if (config.type === "swordsmen" && config.lightArmour) stats.save = "6+";
  return {
    id: config.id, name: template.name + " " + config.index, short: template.short, side: config.side,
    kind: template.kind, models: config.models, startModels: config.models, points: unitCost(config),
    lightArmour: !!config.lightArmour,
    // Optional rule tags consumed by shooting modifiers when a unit/profile or
    // future battlefield-terrain interaction sets them.
    largeTarget: false, singleCharacter: false, skirmisher: false, cover: null,
    x: config.x, y: config.y, facing: config.facing, deployed: config.side === "ai",
    engaged: false, activated: false, moved: false, shot: false, charged: false, fled: false,
    moveUsed: 0, damage: 0, shootCasualties: 0, panicTested: false,
    stats, champion: { enabled: !!config.champion, stats: null }
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
  return units;
}

export function createStartingUnits() {
  return createUnitsFromArmy([
    { type: "swordsmen", models: 20, champion: false, lightArmour: false },
    { type: "archers", models: 10, champion: false, lightArmour: false }
  ]);
}
