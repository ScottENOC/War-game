export function createDice({ S }) {
  function roll(n) { return Array.from({ length: Math.max(0, n) }, () => 1 + Math.floor(Math.random() * 6)); }
  function dieHtml(n, pass, kind, friendlyFire=false) {
    return '<span class="die ' + (pass ? "success" : "fail") + (kind === "save" ? " save" : "") + (friendlyFire ? " friendly-fire" : "") +
      '" title="' + (friendlyFire ? "Miss redirects into friendly unit" : pass ? "success" : "failure") + '">' + n + "</span>";
  }
  function lane(label, values, threshold, mode, passFlags, friendlyFlags) {
    return '<div class="dice-lane"><span class="lane-label">' + label + "</span>" +
      values.map((value, index) => dieHtml(value, passFlags ? !!passFlags[index] : value >= threshold, mode, !!friendlyFlags?.[index])).join("") + "</div>";
  }
  function diceStack(u, result) {
    let out = '<div class="dice-stack"><b>' + u.name + "</b>";
    const pools = result.pools && result.pools.length ? result.pools : [result];
    pools.forEach(pool => {
      if (result.pools && result.pools.length) {
        const profile = pool.WS != null ? "WS " + pool.WS + " · S " + pool.S + " · A " + pool.A :
          "BS " + pool.BS + " · S " + pool.S;
        out += '<div class="pool-label">' + (pool.targetLabel ? pool.targetLabel + " · " : "") + pool.label + " — " + profile + "</div>";
      }
      const hitLabel = pool.hitNeed >= 10 ? "To hit — impossible (10+)" :
        pool.hitNeed >= 7 ? "To hit — 6, then " + (pool.hitNeed - 3) + "+" :
        "To hit — need " + pool.hitNeed + "+";
      out += lane(hitLabel, pool.hitRolls || [], pool.hitNeed, "hit", pool.hitPasses, pool.friendlyFireMisses);
      const followUps = (pool.hitFollowUps || []).filter(value => value !== null);
      if (followUps.length) out += lane("Follow-up roll", followUps, 4, "hit",
        (pool.hitFollowUpPasses || []).filter(value => value !== null));
      if ((pool.hitRerolls || []).length) out += lane("Rerolled missed hits", pool.hitRerolls, pool.hitNeed, "hit", pool.hitRerollPasses);
      if (pool.woundNeed === null) {
        out += '<div class="dice-lane"><span class="lane-label">To wound — impossible (no effect)</span></div>';
      } else {
        out += lane("To wound — " + pool.hits + " hits; need " + pool.woundNeed + "+",
          pool.woundRolls || [], pool.woundNeed, "wound");
      }
      if (pool.wardNeed !== null) out += lane("Ward saves — need " + pool.wardNeed + "+", pool.wardRolls || [], pool.wardNeed, "save", (pool.wardRolls || []).map(value => value !== 1 && value >= pool.wardNeed));
      if (pool.saveNeed !== null) {
        const saveLabel = pool.saveNeed > 6 ? "Armour saves — impossible (" + pool.saveNeed + "+)" :
          "Armour saves — " + pool.woundsBeforeSave + " wounds; need " + pool.saveNeed + "+";
        out += lane(saveLabel, pool.saveRolls || [], pool.saveNeed, "save",
          (pool.saveRolls || []).map(value => value !== 1 && value >= pool.saveNeed));
      }
    });
    out += '<div class="unitmeta">Total: ' + result.attacks + " attacks/shots, " + result.hits + " hits, " +
      result.woundsBeforeSave + " wounds, " + result.saved + " saved, <b>" + result.wounds + " unsaved</b>.</div></div>";
    return out;
  }
  function diceDuel(title, r1, r2) {
    const player = Object.values(S.units).find(u => u.side === "player");
    const opponent = Object.values(S.units).find(u => u.side === "ai");
    return "<div><b>" + title + '</b><div class="dice-duel">' +
      (r1 && player ? '<div class="dice-side"><h3>Player</h3>' + diceStack(player, r1) + "</div>" : "") +
      (r2 && opponent ? '<div class="dice-side"><h3>Opponent</h3>' + diceStack(opponent, r2) + "</div>" : "") +
      "</div></div>";
  }
  return { roll, diceStack, diceDuel };
}
