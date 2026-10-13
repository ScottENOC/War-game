export function createArmyBuilder({ $, onStart, onBack }) {
  let army = [
    { type: "swordsmen", models: 20, champion: false, lightArmour: false },
    { type: "archers", models: 10, champion: false, lightArmour: false }
  ];
  const list = $("army-list"), total = $("army-total"), addButton = $("add-unit"), startButton = $("begin-deployment");

  function unitPoints(unit) {
    if (unit.type === "captain" || unit.type === "lord") return (unit.type === "lord" ? 80 : 50) + (unit.heavyArmour ? 4 : 0) + ((unit.weapon && !["handWeapon","spear","lance"].includes(unit.weapon)) || unit.greatWeapon ? 4 : 0) + (unit.mounted ? 8 : 0) + (unit.mounted && unit.weapon === "spear" ? 2 : 0) + (unit.mounted && unit.weapon === "lance" ? 4 : 0) + (unit.mounted && unit.barding ? 4 : 0);
    if (unit.type === "cavalry") return unit.models * (16 + (unit.bow ? 2 : 0) + (unit.heavyArmour ? 2 : 0) + (unit.barding ? 2 : 0) + (unit.weapon === "spear" ? 1 : ["lance","greatWeapon"].includes(unit.weapon) ? 2 : 0));
    return unit.models * (unit.type === "swordsmen" ? 8 : 10) +
      (unit.champion ? 6 : 0) +
      (unit.type === "swordsmen" && unit.lightArmour ? unit.models : 0) +
      (unit.type === "swordsmen" && unit.spears ? unit.models : 0);
  }
  function updateTotals() {
    let sum = 0;
    list.querySelectorAll(".army-row").forEach((row, index) => {
      const cost = unitPoints(army[index]);
      sum += cost;
      row.querySelector(".army-cost").textContent = cost + " pts";
    });
    total.textContent = sum.toLocaleString() + " pts";
    addButton.disabled = army.length >= 6;
    addButton.textContent = army.length >= 6 ? "6 / 6 Units" : "＋ Add Unit (" + army.length + "/6)";
    startButton.disabled = army.length === 0;
  }
  function renderRows() {
    list.replaceChildren();
    army.forEach((unit, index) => {
      const row = document.createElement("article");
      row.className = "army-row";
      const main = document.createElement("div");
      main.className = "army-row-main";
      const type = document.createElement("select");
      type.setAttribute("aria-label", "Unit " + (index + 1) + " type");
      type.innerHTML = '<option value="swordsmen">Swordsmen · 8 pts/model</option><option value="archers">Archers · 10 pts/model</option><option value="captain">Human Captain · 50 pts</option><option value="lord">Empire General (Lord) · 80 pts</option><option value="cavalry">Cavalry · 16 pts/model</option>';
      type.value = unit.type;
      type.addEventListener("change", () => {
        unit.type = type.value;
        if (unit.type !== "swordsmen") unit.lightArmour = false;
        if (unit.type === "captain" || unit.type === "lord") { unit.models = 1; unit.champion = false; unit.lightArmour = false; unit.heavyArmour = false; unit.greatWeapon = false; unit.weapon = "handWeapon"; unit.spears = false; unit.bow=false; unit.barding=false; unit.mounted=false; }
        else { if (unit.models < 5) unit.models = 5; if (unit.type !== "swordsmen") unit.spears = false; if(unit.type!=="cavalry"){unit.bow=false;unit.barding=false;unit.heavyArmour=false;unit.weapon="handWeapon";} }
        renderRows();
      });
      const modelLabel = document.createElement("label");
      modelLabel.append(document.createTextNode("Models "));
      const models = document.createElement("input");
      models.type = "number"; models.min = "5"; models.max = unit.type === "cavalry" ? "15" : "30"; models.step = "1";
      models.value = unit.models; models.inputMode = "numeric"; models.disabled = unit.type === "captain" || unit.type === "lord";
      models.setAttribute("aria-label", "Unit " + (index + 1) + " model count");
      models.addEventListener("change", () => {
        const parsed = Number.parseInt(models.value, 10);
        unit.models = Number.isFinite(parsed) ? Math.max(5, Math.min(unit.type === "cavalry" ? 15 : 30, parsed)) : 5;
        models.value = unit.models;
        updateTotals();
      });
      modelLabel.append(models);
      const options = document.createElement("div");
      options.className = "army-options";
      const championLabel = document.createElement("label");
      const champion = document.createElement("input");
      champion.type = "checkbox"; champion.checked = unit.champion; champion.disabled = unit.type === "captain" || unit.type === "lord" || unit.type === "cavalry";
      champion.addEventListener("change", () => { unit.champion = champion.checked; updateTotals(); });
      championLabel.append(champion, document.createTextNode("Champion (+6 pts)"));
      options.append(championLabel);
      if (unit.type === "captain" || unit.type === "lord") {
        const armourLabel=document.createElement("label"); const armour=document.createElement("input"); armour.type="checkbox"; armour.checked=!!unit.heavyArmour; armour.addEventListener("change",()=>{unit.heavyArmour=armour.checked;updateTotals();}); armourLabel.append(armour,document.createTextNode("Heavy armour (+4 pts, 5+ save)")); options.append(armourLabel);
        const weaponLabel=document.createElement("label"); weaponLabel.append(document.createTextNode("Weapon ")); const weapon=document.createElement("select"); weapon.innerHTML='<option value="handWeapon">Sword/hand weapon (included)</option><option value="halberd">Halberd (+4 pts, +1 Strength, two-handed)</option><option value="greatWeapon">Great weapon (+4 pts, +2 Strength, −10 Initiative, two-handed)</option>'+(unit.mounted?'<option value="spear">Spear (+2 pts, +1 Strength on charge)</option><option value="lance">Lance (+4 pts, +2 Strength on charge)</option>':''); weapon.value=unit.weapon||(unit.greatWeapon?"greatWeapon":"handWeapon"); weapon.addEventListener("change",()=>{unit.weapon=weapon.value;unit.greatWeapon=weapon.value==="greatWeapon";updateTotals();}); weaponLabel.append(weapon); options.append(weaponLabel);
        const mountLabel=document.createElement("label"),mount=document.createElement("input");mount.type="checkbox";mount.checked=!!unit.mounted;mount.addEventListener("change",()=>{unit.mounted=mount.checked;unit.barding=false;if(!unit.mounted&&["spear","lance"].includes(unit.weapon))unit.weapon="handWeapon";renderRows();});mountLabel.append(mount,document.createTextNode("Warhorse (+8 pts, M8, 1 mount attack, +1 armour save)"));options.append(mountLabel);
        if(unit.mounted){const bardingLabel=document.createElement("label"),barding=document.createElement("input");barding.type="checkbox";barding.checked=!!unit.barding;barding.addEventListener("change",()=>{unit.barding=barding.checked;updateTotals();});bardingLabel.append(barding,document.createTextNode("Barding (+4 pts, +1 save, −1 Move)"));options.append(bardingLabel);}
      }
      if (unit.type === "cavalry") {
        const weaponLabel=document.createElement("label");weaponLabel.append(document.createTextNode("Weapon "));
        const weapon=document.createElement("select");weapon.innerHTML='<option value="handWeapon">Sword/hand weapon (included)</option><option value="spear">Spear (+1/model, +1 Strength on charge)</option><option value="lance">Lance (+2/model, +2 Strength on charge)</option><option value="greatWeapon">Great weapon (+2/model, +2 Strength, −10 Initiative)</option>';weapon.value=unit.weapon||"handWeapon";weapon.addEventListener("change",()=>{unit.weapon=weapon.value;updateTotals();});weaponLabel.append(weapon);options.append(weaponLabel);
        for(const [key,label] of [["bow","Bow (+2/model)"],["heavyArmour","Heavy armour (+2/model, 4+ save when mounted)"],["barding","Barding (+2/model, further +1 save, −1 Move)"]]){const l=document.createElement("label"),c=document.createElement("input");c.type="checkbox";c.checked=!!unit[key];c.addEventListener("change",()=>{unit[key]=c.checked;updateTotals();});l.append(c,document.createTextNode(label));options.append(l);}
      }
      if (unit.type === "swordsmen") {
        const spearLabel = document.createElement("label");
        const spears = document.createElement("input");
        spears.type = "checkbox"; spears.checked = !!unit.spears;
        spears.addEventListener("change", () => { unit.spears = spears.checked; updateTotals(); });
        spearLabel.append(spears, document.createTextNode("Spears (+1/model, fight in an extra rank)"));
        options.append(spearLabel);
        const armourLabel = document.createElement("label");
        const armour = document.createElement("input");
        armour.type = "checkbox"; armour.checked = unit.lightArmour;
        armour.addEventListener("change", () => { unit.lightArmour = armour.checked; updateTotals(); });
        armourLabel.append(armour, document.createTextNode("Light armour (+1/model, 6+ save)"));
        options.append(armourLabel);
      }
      main.append(type, modelLabel, options);
      const cost = document.createElement("strong");
      cost.className = "army-cost";
      const remove = document.createElement("button");
      remove.className = "remove-unit secondary-button";
      remove.textContent = "×";
      remove.title = "Remove unit " + (index + 1);
      remove.setAttribute("aria-label", "Remove unit " + (index + 1));
      remove.addEventListener("click", () => { army.splice(index, 1); renderRows(); });
      row.append(main, cost, remove);
      list.append(row);
    });
    updateTotals();
  }

  $("menu-build").addEventListener("click", () => {
    $("mainmenu").hidden = true;
    $("armybuilder").hidden = false;
    renderRows();
  });
  $("builder-back").addEventListener("click", onBack);
  addButton.addEventListener("click", () => {
    if (army.length >= 6) return;
    army.push({ type: "swordsmen", models: 20, champion: false, lightArmour: false, heavyArmour: false, greatWeapon: false, weapon: "handWeapon", spears: false, bow:false, barding:false, mounted:false });
    renderRows();
  });
  startButton.addEventListener("click", () => {
    if (!army.length) return;
    onStart(army.map(unit => ({ ...unit })));
  });
}
