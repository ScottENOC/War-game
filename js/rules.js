export function createRules({ roll }) {
  function rankBonus(u) { return Math.min(3, Math.max(0, Math.floor(u.models / 5) - 1)); }
  function hitTarget(attacker, defender) {
    const a = attacker, d = defender;
    if (a >= d * 2 || a > d) return 3;
    if (a === d) return 4;
    if (a * 2 <= d) return 5;
    return 4;
  }
  function woundTarget(strength, toughness) {
    if (strength >= toughness * 2) return 2;
    if (strength > toughness) return 3;
    if (strength === toughness) return 4;
    if (strength * 2 <= toughness) return 6;
    return 5;
  }
  function saveTarget(defender, strength) {
    const raw = defender.stats.save;
    if (raw === "-" || raw == null) return null;
    const target = parseInt(raw, 10);
    return Number.isFinite(target) ? target + Math.max(0, strength - 3) : null;
  }
  function applyDamage(u, wounds, shooting) {
    const before = u.models, total = (u.damage || 0) + wounds;
    const killed = Math.floor(total / u.stats.W);
    u.models = Math.max(0, u.models - killed);
    u.damage = u.models ? total % u.stats.W : 0;
    if (shooting) u.shootCasualties += before - u.models;
    return before - u.models;
  }

  // A champion replaces one rank-and-file model. Pools combine models with
  // identical relevant stats, avoiding per-model UI work while retaining
  // separate rolls whenever a profile differs.
  function modelPools(u, mode) {
    const hasChampion = !!(u.champion && u.champion.enabled && u.models > 0);
    const normalCount = Math.max(0, u.models - (hasChampion ? 1 : 0));
    const profiles = [];
    const add = (count, stats, label) => {
      if (!count) return;
      const key = mode === "melee"
        ? [stats.WS, stats.S, stats.A].join("/")
        : [stats.BS, stats.S].join("/");
      let pool = profiles.find(p => p.key === key);
      if (!pool) {
        pool = { key, stats, count: 0, labels: [] };
        profiles.push(pool);
      }
      pool.count += count;
      if (!pool.labels.includes(label)) pool.labels.push(label);
    };
    add(normalCount, { ...u.stats }, "Rank and file");
    if (hasChampion) {
      const overrides = u.champion.stats || {};
      const championStats = { ...u.stats, ...overrides };
      if (mode === "melee" && overrides.A == null) championStats.A = 2;
      if (mode === "shooting" && overrides.BS == null) championStats.BS = u.stats.BS + 1;
      add(1, championStats, "Champion");
    }
    return profiles;
  }

  function meleeAttack(u, target) {
    const pools = modelPools(u, "melee").map(pool => {
      const s = pool.stats.S, attacks = Math.min(5, pool.count) * pool.stats.A;
      const hitNeed = hitTarget(pool.stats.WS, target.stats.WS);
      const woundNeed = woundTarget(s, target.stats.T);
      const saveNeed = saveTarget(target, s);
      const hitRolls = roll(attacks);
      const hits = hitRolls.filter(value => value >= hitNeed).length;
      const woundRolls = roll(hits);
      const woundsBeforeSave = woundRolls.filter(value => value >= woundNeed).length;
      const saveRolls = saveNeed === null ? [] : roll(woundsBeforeSave);
      const saved = saveNeed === null ? 0 : saveRolls.filter(value => value >= saveNeed).length;
      return { label: pool.labels.join(" / "), attacks, hitNeed, hitRolls, hits, woundNeed, woundRolls,
        woundsBeforeSave, saveNeed, saveRolls, saved, wounds: Math.max(0, woundsBeforeSave - saved),
        WS: pool.stats.WS, S: pool.stats.S, A: pool.stats.A };
    });
    const sum = key => pools.reduce((total, pool) => total + pool[key], 0);
    return {
      attacks: sum("attacks"), hitNeed: pools[0]?.hitNeed ?? 7,
      hitRolls: pools.flatMap(pool => pool.hitRolls), hits: sum("hits"),
      woundNeed: pools[0]?.woundNeed ?? 7, woundRolls: pools.flatMap(pool => pool.woundRolls),
      woundsBeforeSave: sum("woundsBeforeSave"), saveNeed: pools.every(pool => pool.saveNeed === null) ? null : pools[0]?.saveNeed,
      saveRolls: pools.flatMap(pool => pool.saveRolls), saved: sum("saved"), wounds: sum("wounds"), pools
    };
  }

  function shootingAttack(u, target, context) {
    const pools = modelPools(u, "shooting").map(pool => {
      const bs = pool.stats.BS, strength = pool.stats.S;
      let hitNeed = bs >= 5 ? 2 : bs === 4 ? 3 : bs === 3 ? 4 : bs === 2 ? 5 : 6;
      if (context.longRange) hitNeed++;
      if (context.moved) hitNeed++;
      if (context.standShoot) hitNeed++;
      hitNeed = Math.min(7, hitNeed);
      const attacks = pool.count;
      const woundNeed = woundTarget(strength, target.stats.T);
      const saveNeed = saveTarget(target, strength);
      const hitRolls = roll(attacks), hits = hitRolls.filter(value => value >= hitNeed).length;
      const woundRolls = roll(hits), woundsBeforeSave = woundRolls.filter(value => value >= woundNeed).length;
      const saveRolls = saveNeed === null ? [] : roll(woundsBeforeSave);
      const saved = saveNeed === null ? 0 : saveRolls.filter(value => value >= saveNeed).length;
      return { label: pool.labels.join(" / "), attacks, hitNeed, hitRolls, hits, woundNeed, woundRolls,
        woundsBeforeSave, saveNeed, saveRolls, saved, wounds: Math.max(0, woundsBeforeSave - saved),
        BS: pool.stats.BS, S: pool.stats.S };
    });
    const sum = key => pools.reduce((total, pool) => total + pool[key], 0);
    return {
      attacks: sum("attacks"), hitNeed: pools[0]?.hitNeed ?? 7,
      hitRolls: pools.flatMap(pool => pool.hitRolls), hits: sum("hits"),
      woundNeed: pools[0]?.woundNeed ?? 7, woundRolls: pools.flatMap(pool => pool.woundRolls),
      woundsBeforeSave: sum("woundsBeforeSave"), saveNeed: pools.every(pool => pool.saveNeed === null) ? null : pools[0]?.saveNeed,
      saveRolls: pools.flatMap(pool => pool.saveRolls), saved: sum("saved"), wounds: sum("wounds"), pools
    };
  }

  return { rankBonus, hitTarget, woundTarget, saveTarget, applyDamage, meleeAttack, shootingAttack };
}
