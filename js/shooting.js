export function createShooting({ S, units, alive, dist, BOW_RANGE, roll, woundTarget, saveTarget, applyDamage, say, diceStack, $ , shootingAttack, panicNearby }) {
  function showAttack(label, u, target, result, kind) {
    const extra = (kind === "shoot" ? " · " + (result.longRange ? "long range " : "") +
      (result.moved ? "moved " : "") + (result.standShoot ? "stand & shoot " : "") +
      (result.hitModifier ? "hit modifier " + (result.hitModifier > 0 ? "+" : "") + result.hitModifier : "") : "");
    const distText = Number.isFinite(result.distance) ? " · " + result.distance.toFixed(1) + '"' : "";
    const stack = diceStack(u, result);
    say("<b>" + label + ": " + u.name + " → " + target.name + "</b><div class=\"rollsummary\">" +
      result.attacks + (kind === "shoot" ? " shots" : " attacks") + distText + extra + "</div>" + stack);
    $("rollcontent").innerHTML = stack;
    $("rollview").classList.add("show");
  }
  function panicTest(target) {
    if (target.panicTested) return;
    const threshold = Math.ceil(target.startModels * .25);
    if (target.shootCasualties < threshold || !alive(target)) return;
    target.panicTested = true;
    const dice = roll(2), total = dice[0] + dice[1], snakeEyes = dice[0] === 1 && dice[1] === 1;
    say("<b>Panic test — " + target.name + "</b>: shooting casualties " + target.shootCasualties + "/" +
      target.startModels + " (25% threshold " + threshold + "). 2D6 <span class=\"dice\">" +
      dice.join(" + ") + " = " + total + "</span>; need " + target.stats.Ld + " or less.");
    if (snakeEyes) say("Snake eyes! A double 1 always passes the morale test.");
    if (!snakeEyes && total > target.stats.Ld) { target.fled = true; target.engaged = false; say(target.name + " fails its unmodified Leadership test and flees."); }
  }
  function shoot(u, target, standShoot) {
    if (!alive(u) || !alive(target) || u.kind !== "archer" || u.shot || u.engaged || target.engaged) return false;
    const distance = dist(u, target);
    if (distance > BOW_RANGE || (standShoot && distance <= 4)) return false;
    const context = {
      longRange: distance > BOW_RANGE / 2,
      moved: u.moved,
      standShoot,
      distance,
      targetCharging: !!target.charged,
      largeTarget: !!target.largeTarget,
      singleCharacter: !!target.isCharacter || !!target.singleCharacter || (target.models <= 0 && (target.attachedCharacters || []).some(id => S.units[id] && S.units[id].models > 0)),
      skirmisher: !!target.skirmisher,
      cover: target.cover === "soft" || target.cover === "hard" ? target.cover : null
    };
    const result = shootingAttack(u, target, context);
    Object.assign(result, context);
    result.hitModifier = result.pools.length ? result.pools[0].hitModifier : 0;
    u.shot = true;
    showAttack(standShoot ? "Stand and shoot" : "Shooting", u, target, result, "shoot");
    const killed = applyDamage(target, result.wounds, true, result.cascadePlan);
    say(target.name + " loses " + killed + " model" + (killed === 1 ? "" : "s") + " to shooting.");
    if (!alive(target)) panicNearby?.(target, "a friendly unit is destroyed by shooting");
    if (!standShoot) panicTest(target);
    return true;
  }
  return { shoot };
}
