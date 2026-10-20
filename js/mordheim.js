import { unitCost } from "./units.js?v=20261020-undead-monsters-v2";

const STORAGE_KEY = "warGameMordheimSkirmishV1";
const NEVER_ALLOWED = new Set([
  "lord","mageLord","starwardenLord","masterNecromancer","vampireLord",
  "legendaryLord","shadowElf","pegasusChampion","dwarfLord","dwarfKingHaldric",
  "goblinLord","orcLord","goblinGreatShaman","orcGreatShaman",
  "humanChariot","elfChariot","goblinChariot","orcChariot","skeletonChariot",
  "youngDragon","dragon","ancientDragon","deepflameDragon","skeletonDragon",
  "giant","skeletonGiant","trolls","skeletonTroll","wyvern","cannon","boltThrower","catapult"
]);
const BIG_MOUNTS = new Set(["eagle","greatEagle","wyvern","youngDragon","dragon","ancientDragon","deepflameDragon","skeletonDragon"]);
const CHARACTER_TYPES = new Set([
  "captain","mageHero","necromancer","vampireHero","dwarfCaptain",
  "goblinHero","orcHero","captainWeiss","rifleman"
]);
const RANGED = new Set(["bow","crossbow","firearm","longRifle","magicBow"]);

export function createMordheim({ $, getInventory, getBypass, startBattle, grantLootbox }) {
  let faction = "empire";
  let selected = new Set();
  let inventory = [];
  const $id = id => $(id);
  const eligible = m => m && m.faction === faction && !m.namedCharacter &&
    !m.isNamedCharacter && !m.legendary && !NEVER_ALLOWED.has(m.type) &&
    !BIG_MOUNTS.has(m.mountType) && !m.siegeMachine &&
    !["humanChariot","elfChariot","goblinChariot","orcChariot","skeletonChariot"].includes(m.type) &&
    !(m.mounted && BIG_MOUNTS.has(m.mountType)) &&
    !(m.type === "lord" || m.type === "mageLord" || m.type === "dwarfLord" ||
      m.type === "goblinLord" || m.type === "orcLord");
  function configFor(m) {
    const weapon = m.weapon || "handWeapon";
    const rangedWeapon = RANGED.has(weapon) ? weapon : (m.backWeapons || []).find(w => RANGED.has(w)) || null;
    const meleeWeapons = [weapon, ...(m.offhandWeapon ? ["offhandWeapon"] : []), ...(m.backWeapons || []).filter(w => !RANGED.has(w))].filter(w => !RANGED.has(w));
    return {
      type: m.type, models: 1, weapon: RANGED.has(weapon) ? "handWeapon" : weapon,
      meleeWeapons: [...new Set(meleeWeapons.length ? meleeWeapons : ["handWeapon"])],
      rangedWeapon, faction, mounted: !!m.mounted, mountType: m.mountType || "none",
      shield: !!m.shield, lightArmour: !!m.lightArmour, heavyArmour: !!m.heavyArmour,
      name: m.name || "", mordheimCollectionId: m.id, mordheimFighter: true
    };
  }
  function points(m) {
    const c = configFor(m);
    return Math.max(1, Number(unitCost(c, faction)) || (CHARACTER_TYPES.has(m.type) ? 45 : 8));
  }
  function open() {
    inventory = getInventory() || [];
    selected.clear();
    $id("mainmenu").hidden = true;
    $id("collection-screen").hidden = true;
    $id("armybuilder").hidden = true;
    $id("mordheim-screen").hidden = false;
    render();
  }
  function render() {
    const list = $id("mordheim-model-list");
    const factionSelect = $id("mordheim-faction");
    factionSelect.value = faction;
    const models = inventory.filter(eligible);
    for (const id of [...selected]) if (!models.some(m => m.id === id)) selected.delete(id);
    const selectedModels = models.filter(m => selected.has(m.id));
    const total = selectedModels.reduce((n, m) => n + points(m), 0);
    $id("mordheim-total").textContent = total + " pts · " + selectedModels.length + " fighters";
    $id("mordheim-start").disabled = !selectedModels.length || selectedModels.length > 20;
    $id("mordheim-validation").textContent = models.length
      ? "Choose up to 20 individual fighters. Only miniatures in your collection are available."
      : "No eligible miniatures for this faction. Add models to your collection or choose another faction.";
    list.replaceChildren();
    models.forEach(m => {
      const row = document.createElement("label");
      row.className = "mordheim-model-row";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selected.has(m.id);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked && selected.size >= 20) { checkbox.checked = false; return; }
        checkbox.checked ? selected.add(m.id) : selected.delete(m.id);
        render();
      });
      const text = document.createElement("span");
      const weapon = m.weapon && m.weapon !== "none" ? " · " + m.weapon : "";
      const mount = m.mounted ? " · mounted" : "";
      text.textContent = (m.name || (m.faction + " " + m.type)) + weapon + mount;
      const cost = document.createElement("strong");
      cost.textContent = points(m) + " pts";
      row.append(checkbox, text, cost);
      list.append(row);
    });
  }
  function begin() {
    const models = inventory.filter(eligible).filter(m => selected.has(m.id));
    if (!models.length || models.length > 20) return;
    if (!getBypass()) {
      const current = getInventory() || [];
      if (models.some(m => !current.some(x => x.id === m.id))) {
        $id("mordheim-validation").textContent = "Collection changed; please select your warband again.";
        return;
      }
    }
    const army = models.map(configFor);
    const budget = army.reduce((n, c) => n + unitCost(c, faction), 0);
    $id("mordheim-screen").hidden = true;
    startBattle(army, faction, budget);
  }
  factionSelectSetup();
  function factionSelectSetup() {
    $id("mordheim-faction").addEventListener("change", e => {
      faction = e.target.value;
      selected.clear();
      render();
    });
    $id("mordheim-start").addEventListener("click", begin);
    $id("mordheim-back").addEventListener("click", () => {
      $id("mordheim-screen").hidden = true;
      $id("mainmenu").hidden = false;
    });
  }
  function onBattleFinished(won) {
    if (won) {
      let progress = { wins: 0, boxes: 0 };
      try { progress = { ...progress, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; } catch {}
      progress.wins = (Number(progress.wins) || 0) + 1;
      let message = "Mordheim victory " + progress.wins + " · warband disbanded.";
      if (progress.wins % 3 === 0) {
        grantLootbox("mordheim");
        progress.boxes = (Number(progress.boxes) || 0) + 1;
        message += " Three wins reached: one lootbox earned!";
      } else {
        message += " " + (3 - progress.wins % 3) + " more win(s) until a lootbox.";
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
      $id("mordheim-result").textContent = message;
    } else {
      $id("mordheim-result").textContent = "Defeat · warband disbanded. Your collection is unchanged.";
    }
  }
  return { open, onBattleFinished, isEligible: eligible };
}
