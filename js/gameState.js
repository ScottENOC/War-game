export function createGameState(startingUnits = {}) {
  return {
    turn: 1, phase: "menu", selected: null, finished: false,
    moreMovementOptions: false, movementOrder: "forward",
    combatRound: 0, loser: null, crDiff: 0, log: [], mode: null,
    chargeSide: "player", chargePasses: 0, declaredCharges: [],
    activationSide: "player", units: startingUnits
  };
}
