export function createDice({ S }) {
  function roll(n) { return Array.from({ length: Math.max(0, n) }, () => 1 + Math.floor(Math.random() * 6)); }
  function dieHtml(n, pass, kind) {
    return '<span class="die ' + (pass ? "success" : "fail") + (kind === "save" ? " save" : "") +
      '" title="' + (pass ? "success" : "failure") + '">' + n + "</span>";
  }
  function lane(label, values, threshold, mode) {
    return '<div class="dice-lane"><span class="lane-label">' + label + "</span>" +
      values.map(value => dieHtml(value, value >= threshold, mode)).join("") + "</div>";
  }
  function diceStack(u, result) {
    let out = '<div class="dice-stack"><b>' + u.name + "</b>";
    const pools = result.pools && result.pools.length ? result.pools : [result];
    pools.forEach((pool, index) => {
      if (result.pools && result.pools.length) {
        const profile = pool.WS != null ? "WS " + pool.WS + " · S " + pool.S + " · A " + pool.A :
          "BS " + pool.BS + " · S " + pool.S;
        out += '<div class="pool-label">' + pool.label + " — " + profile + "</div>";
      }
      out += lane("To hit — need " + (pool.hitNeed > 6 ? "7+ (impossible)" : pool.hitNeed + "+"), pool.hitRolls, pool.hitNeed, "hit");
      out += lane("To wound — " + pool.hits + " hits; need " + pool.woundNeed + "+", pool.woundRolls, pool.woundNeed, "wound");
      if (pool.saveNeed !== null) out += lane("Armour saves — " + pool.woundsBeforeSave + " wounds; need " +
        (pool.saveNeed > 6 ? "7+ (impossible)" : pool.saveNeed + "+"), pool.saveRolls, pool.saveNeed, "save");
    });
    out += '<div class="unitmeta">Total: ' + result.attacks + " attacks/shots, " + result.hits + " hits, " +
      result.woundsBeforeSave + " wounds, " + result.saved + " saved, <b>" + result.wounds + " unsaved</b>.</div></div>";
    return out;
  }
  function diceDuel(title, r1, r2) {
    return "<div><b>" + title + '</b><div class="dice-duel">' +
      (r1 ? '<div class="dice-side"><h3>Player</h3>' + diceStack(S.units.pSword.side === "player" ? S.units.pSword : S.units.pArch, r1) + "</div>" : "") +
      (r2 ? '<div class="dice-side"><h3>Opponent</h3>' + diceStack(S.units.aSword.side === "ai" ? S.units.aSword : S.units.aArch, r2) + "</div>" : "") +
      "</div></div>";
  }
  return { roll, diceStack, diceDuel };
}
