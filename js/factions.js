export const FACTIONS = {
  empire: {
    name: "Empire",
    units: {
      swordsmen: {
        name: "Empire Swordsmen", short: "Swordsmen", kind: "melee", models: 20,
        stats: { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7, save: "4+" }
      },
      archers: {
        name: "Empire Archers", short: "Archers", kind: "archer", models: 10,
        stats: { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7, save: "-" }
      }
    }
  },
  opposing: {
    name: "Opposing Host",
    units: {
      swordsmen: {
        name: "Opposing Swordsmen", short: "Swordsmen", kind: "melee", models: 20,
        stats: { M: 4, WS: 4, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7, save: "4+" }
      },
      archers: {
        name: "Opposing Archers", short: "Archers", kind: "archer", models: 10,
        stats: { M: 4, WS: 3, BS: 3, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 7, save: "-" }
      }
    }
  }
};
