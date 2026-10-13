export function createArmyBuilder({ $, onStart, onBack }) {
  let army = [
    { type: "swordsmen", models: 20, champion: false, lightArmour: false },
    { type: "archers", models: 10, champion: false, lightArmour: false }
  ];
  const list = $("army-list"), total = $("army-total"), addButton = $("add-unit"), startButton = $("begin-deployment");

  function unitPoints(unit) {
    return unit.models * (unit.type === "swordsmen" ? 8 : 10) +
      (unit.champion ? 6 : 0) +
      (unit.type === "swordsmen" && unit.lightArmour ? unit.models : 0);
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
      type.innerHTML = '<option value="swordsmen">Swordsmen · 8 pts/model</option><option value="archers">Archers · 10 pts/model</option>';
      type.value = unit.type;
      type.addEventListener("change", () => {
        unit.type = type.value;
        if (unit.type !== "swordsmen") unit.lightArmour = false;
        renderRows();
      });
      const modelLabel = document.createElement("label");
      modelLabel.append(document.createTextNode("Models "));
      const models = document.createElement("input");
      models.type = "number"; models.min = "5"; models.max = "30"; models.step = "1";
      models.value = unit.models; models.inputMode = "numeric";
      models.setAttribute("aria-label", "Unit " + (index + 1) + " model count");
      models.addEventListener("change", () => {
        const parsed = Number.parseInt(models.value, 10);
        unit.models = Number.isFinite(parsed) ? Math.max(5, Math.min(30, parsed)) : 5;
        models.value = unit.models;
        updateTotals();
      });
      modelLabel.append(models);
      const options = document.createElement("div");
      options.className = "army-options";
      const championLabel = document.createElement("label");
      const champion = document.createElement("input");
      champion.type = "checkbox"; champion.checked = unit.champion;
      champion.addEventListener("change", () => { unit.champion = champion.checked; updateTotals(); });
      championLabel.append(champion, document.createTextNode("Champion (+6 pts)"));
      options.append(championLabel);
      if (unit.type === "swordsmen") {
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
    army.push({ type: "swordsmen", models: 20, champion: false, lightArmour: false });
    renderRows();
  });
  startButton.addEventListener("click", () => {
    if (!army.length) return;
    onStart(army.map(unit => ({ ...unit })));
  });
}
