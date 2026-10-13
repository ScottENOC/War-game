import { FACTIONS } from "./factions.js";

function buildUnit(template, config) {
  return {
    id: config.id, name: template.name, short: template.short, side: config.side,
    kind: template.kind, models: template.models, startModels: template.models,
    x: config.x, y: config.y, facing: config.facing,
    engaged: false, activated: false, moved: false, shot: false, charged: false, fled: false,
    moveUsed: 0, damage: 0, shootCasualties: 0, panicTested: false,
    stats: { ...template.stats }
  };
}

export function createStartingUnits() {
  const empire = FACTIONS.empire.units, opposing = FACTIONS.opposing.units;
  return {
    pSword: buildUnit(empire.swordsmen, { id: "pSword", side: "player", x: 0.22, y: 0.36, facing: 0 }),
    pArch: buildUnit(empire.archers, { id: "pArch", side: "player", x: 0.22, y: 0.70, facing: 0 }),
    aSword: buildUnit(opposing.swordsmen, { id: "aSword", side: "ai", x: 0.78, y: 0.36, facing: Math.PI }),
    aArch: buildUnit(opposing.archers, { id: "aArch", side: "ai", x: 0.78, y: 0.70, facing: Math.PI })
  };
}
