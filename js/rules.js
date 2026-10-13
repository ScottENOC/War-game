export function createRules({ roll }) {
  function rankBonus(u) { return Math.min(3, Math.max(0, Math.floor(u.models / 5) - 1)); }

  // Warhammer Fantasy 6th edition close-combat Weapon Skill chart:
  // 3+ when attacker WS is higher; 5+ only when defender WS is MORE than double.
  function hitTarget(attacker, defender) {
    if (attacker > defender) return 3;
    if (defender > attacker * 2) return 5;
    return 4;
  }

  // 6th-edition Strength-versus-Toughness chart. null means "no effect".
  function woundTarget(strength, toughness) {
    if (strength <= 0 || toughness <= 0) return null;
    if (strength >= toughness * 2) return 2;
    if (strength > toughness) return 3;
    if (strength === toughness) return 4;
    if (strength * 2 > toughness) return 5;
    if (strength * 2 === toughness) return 6;
    return null;
  }

  function saveTarget(defender, strength) {
    const raw = defender.stats.save;
    if (raw === "-" || raw == null) return null;
    const target = parseInt(raw, 10);
    return Number.isFinite(target) ? target + Math.max(0, strength - 3) : null;
  }

  // Resolve one melee attack roll. A natural 1 always misses and a natural 6
  // always hits unless the attack is explicitly impossible (not the case here).
  function meleeHitRolls(count, need) {
    const rolls = roll(count);
    return { rolls, passes: rolls.map(value => value !== 1 && (value === 6 || value >= need)) };
  }

  // BS uses a target number of 7-BS on the die, with cumulative modifiers
  // applied to the roll. 7+ needs a 6 followed by 4+, 8+ by 5+, 9+ by 6+;
  // 10+ is impossible. A natural 1 always misses.
  function shootingHitRolls(count, bs, modifiers) {
    const baseNeed = 7 - bs;
    const modifiedNeed = baseNeed - modifiers;
    const firstRolls = roll(count);
    const passes = [];
    const followUps = [];
    firstRolls.forEach(value => {
      if (value === 1) {
        passes.push(false);
        followUps.push(null);
      } else if (modifiedNeed <= 6) {
        passes.push(value >= modifiedNeed);
        followUps.push(null);
      } else if (modifiedNeed >= 10 || value !== 6) {
        passes.push(false);
        followUps.push(null);
      } else {
        const followNeed = modifiedNeed - 3;
        const follow = roll(1)[0];
        followUps.push(follow);
        passes.push(follow >= followNeed);
      }
    });
    return { rolls: firstRolls, passes, followUps, baseNeed, modifiedNeed };
  }

  function applyDamage(u, wounds, shooting) {
    const before = u.models, total = (u.damage || 0) + wounds;
    const killed = Math.floor(total / u.stats.W);
    u.models = Math.max(0, u.models - killed);
    u.damage = u.models ? total % u.stats.W : 0;
    if (shooting) u.shootCasualties += before - u.models;
    return before - u.models;
  }

  // Champions replace one rank-and-file model and retain their own attack profile.
  function modelPools(u, mode) {
    const hasChampion = !!(u.champion && u.champion.enabled && u.models > 0);
    const normalModels = Math.max(0, u.models - (hasChampion ? 1 : 0));
    const normalCount = mode === "melee"
      ? Math.min(hasChampion ? 4 : 5, normalModels)
      : normalModels;
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

  function resolveWounds(hits, strength, target) {
    const woundNeed = woundTarget(strength, target.stats.T);
    if (woundNeed === null) {
      return { woundNeed: null, woundRolls: [], woundsBeforeSave: 0 };
    }
    const woundRolls = roll(hits);
    return { woundNeed, woundRolls, woundsBeforeSave: woundRolls.filter(value => value >= woundNeed).length };
  }

  function resolveSaves(woundsBeforeSave, target, strength) {
    const saveNeed = saveTarget(target, strength);
    if (saveNeed === null || saveNeed > 6) {
      return { saveNeed, saveRolls: [], saved: 0 };
    }
    const saveRolls = roll(woundsBeforeSave);
    return { saveNeed, saveRolls, saved: saveRolls.filter(value => value !== 1 && value >= saveNeed).length };
  }

  function meleeAttack(u, target) {
    const pools = modelPools(u, "melee").map(pool => {
      const s = pool.stats.S, attacks = pool.count * pool.stats.A;
      const hitNeed = hitTarget(pool.stats.WS, target.stats.WS);
      const hit = meleeHitRolls(attacks, hitNeed);
      const hits = hit.passes.filter(Boolean).length;
      const wound = resolveWounds(hits, s, target);
      const save = resolveSaves(wound.woundsBeforeSave, target, s);
      return { label: pool.labels.join(" / "), attacks, hitNeed, hitRolls: hit.rolls, hitPasses: hit.passes,
        hitFollowUps: [], hitFollowUpPasses: [], hits, woundNeed: wound.woundNeed,
        woundRolls: wound.woundRolls, woundsBeforeSave: wound.woundsBeforeSave, saveNeed: save.saveNeed,
        saveRolls: save.saveRolls, saved: save.saved, wounds: Math.max(0, wound.woundsBeforeSave - save.saved),
        WS: pool.stats.WS, S: pool.stats.S, A: pool.stats.A };
    });
    const sum = key => pools.reduce((total, pool) => total + pool[key], 0);
    return {
      attacks: sum("attacks"), hitNeed: pools[0]?.hitNeed ?? 7,
      hitRolls: pools.flatMap(pool => pool.hitRolls), hitPasses: pools.flatMap(pool => pool.hitPasses),
      hits: sum("hits"), woundNeed: pools[0]?.woundNeed ?? null,
      woundRolls: pools.flatMap(pool => pool.woundRolls), woundsBeforeSave: sum("woundsBeforeSave"),
      saveNeed: pools.every(pool => pool.saveNeed === null) ? null : pools[0]?.saveNeed,
      saveRolls: pools.flatMap(pool => pool.saveRolls), saved: sum("saved"), wounds: sum("wounds"), pools
    };
  }

  function shootingAttack(u, target, context = {}) {
    const pools = modelPools(u, "shooting").map(pool => {
      const bs = pool.stats.BS, strength = pool.stats.S;
      const modifiers = (context.longRange ? -1 : 0) + (context.moved ? -1 : 0) +
        (context.standShoot ? -1 : 0) + (context.targetCharging ? -1 : 0) +
        (context.singleCharacter || context.skirmisher ? -1 : 0) +
        (context.cover === "soft" ? -1 : context.cover === "hard" ? -2 : 0) +
        (context.largeTarget ? 1 : 0);
      const hit = shootingHitRolls(pool.count, bs, modifiers);
      const hits = hit.passes.filter(Boolean).length;
      const wound = resolveWounds(hits, strength, target);
      const save = resolveSaves(wound.woundsBeforeSave, target, strength);
      return { label: pool.labels.join(" / "), attacks: pool.count, hitNeed: hit.modifiedNeed,
        hitBaseNeed: hit.baseNeed, hitModifier: modifiers, hitRolls: hit.rolls, hitPasses: hit.passes,
        hitFollowUps: hit.followUps, hitFollowUpPasses: hit.followUps.map((value, i) =>
          value === null ? null : hit.passes[i]), hits, woundNeed: wound.woundNeed,
        woundRolls: wound.woundRolls, woundsBeforeSave: wound.woundsBeforeSave, saveNeed: save.saveNeed,
        saveRolls: save.saveRolls, saved: save.saved, wounds: Math.max(0, wound.woundsBeforeSave - save.saved),
        BS: bs, S: strength };
    });
    const sum = key => pools.reduce((total, pool) => total + pool[key], 0);
    return {
      attacks: sum("attacks"), hitNeed: pools[0]?.hitNeed ?? 7,
      hitRolls: pools.flatMap(pool => pool.hitRolls), hitPasses: pools.flatMap(pool => pool.hitPasses),
      hitFollowUps: pools.flatMap(pool => pool.hitFollowUps), hits: sum("hits"),
      woundNeed: pools[0]?.woundNeed ?? null, woundRolls: pools.flatMap(pool => pool.woundRolls),
      woundsBeforeSave: sum("woundsBeforeSave"),
      saveNeed: pools.every(pool => pool.saveNeed === null) ? null : pools[0]?.saveNeed,
      saveRolls: pools.flatMap(pool => pool.saveRolls), saved: sum("saved"), wounds: sum("wounds"), pools
    };
  }

  return { rankBonus, hitTarget, woundTarget, saveTarget, applyDamage, meleeAttack, shootingAttack };
}
