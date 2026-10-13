export const FACTIONS = {
  empire: {
    name: "Empire",
    units: {
      swordsmen: {
        name: "Empire Swordsmen", short: "Swordsmen", kind: "melee", models: 20,
        stats: { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7, save: "-" }
      },
      archers: {
        name: "Empire Archers", short: "Archers", kind: "archer", models: 10,
        stats: { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7, save: "-" }
      ,
      captain: {
        name: "Empire Captain", short: "Captain", kind: "hero", models: 1, points: 50,
        stats: { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8, save: "4+" }
      },
      captain: {
        name: "Empire Captain", short: "Captain", kind: "hero", models: 1,
        stats: { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8, save: "4+" },
        points: 50
      }
    }
  },
  opposing: {
    name: "Opposing Host",
    units: {
      swordsmen: {
        name: "Opposing Swordsmen", short: "Swordsmen", kind: "melee", models: 20,
        stats: { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7, save: "-" }
      },
      archers: {
        name: "Opposing Archers", short: "Archers", kind: "archer", models: 10,
        stats: { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7, save: "-" }
      ,
      captain: {
        name: "Opposing Captain", short: "Captain", kind: "hero", models: 1, points: 50,
        stats: { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8, save: "4+" }
      },
      captain: {
        name: "Opposing Captain", short: "Captain", kind: "hero", models: 1,
        stats: { M: 4, WS: 5, BS: 4, S: 4, T: 4, W: 2, I: 4, A: 2, Ld: 8, save: "4+" },
        points: 50
      }
    }
  }
};
