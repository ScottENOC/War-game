const BACKUP_VERSION = 1;
const PREFIX = "warGame";

function buildBackup() {
  try { window.warGameSaveNow?.(); } catch {}
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) data[key] = localStorage.getItem(key);
  }
  return { app: "War-game", backupVersion: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
}

function addBackupControls(parent, location) {
  if (!parent || parent.querySelector("[data-save-backup-controls]")) return;
  const wrap = document.createElement("details");
  wrap.className = "save-backup-controls";
  wrap.dataset.saveBackupControls = location;
  const summary = document.createElement("summary");
  summary.textContent = "Save backup";
  const actions = document.createElement("div");
  actions.className = "save-backup-actions";
  const exportButton = document.createElement("button");
  exportButton.type = "button";
  exportButton.className = "secondary-button";
  exportButton.textContent = "Export Save Backup";
  const importButton = document.createElement("button");
  importButton.type = "button";
  importButton.className = "secondary-button";
  importButton.textContent = "Import Save Backup";
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.hidden = true;
  const status = document.createElement("p");
  status.className = "save-backup-status";
  status.setAttribute("role", "status");
  status.textContent = "Progress saves automatically on this device. Export a backup occasionally to protect a long campaign.";
  exportButton.addEventListener("click", () => {
    try {
      const payload = JSON.stringify(buildBackup(), null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "war-game-save-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      status.textContent = "Backup prepared. Check your browser's downloads or Files location.";
    } catch (error) {
      status.textContent = "Could not export the backup. Check available device storage and try again.";
      console.error("Save backup export failed", error);
    }
  });
  importButton.addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Backup file is larger than 10 MB.");
      const parsed = JSON.parse(await file.text());
      if (parsed?.app !== "War-game" || parsed?.backupVersion !== BACKUP_VERSION || !parsed.data || typeof parsed.data !== "object" || Array.isArray(parsed.data)) {
        throw new Error("This does not look like a supported War-game backup.");
      }
      const entries = Object.entries(parsed.data);
      if (!entries.length || entries.some(([key, value]) => !key.startsWith(PREFIX) || typeof value !== "string")) {
        throw new Error("The backup contains invalid save data.");
      }
      if (!window.confirm("Import this backup? It will replace War-game progress currently saved on this device.")) return;
      const previous = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(PREFIX)) previous[key] = localStorage.getItem(key);
      }
      try {
        Object.keys(previous).forEach(key => localStorage.removeItem(key));
        entries.forEach(([key, value]) => localStorage.setItem(key, value));
      } catch (storageError) {
        const currentKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(PREFIX)) currentKeys.push(key);
        }
        currentKeys.forEach(key => localStorage.removeItem(key));
        Object.entries(previous).forEach(([key, value]) => { if (value !== null) localStorage.setItem(key, value); });
        throw storageError;
      }
      status.textContent = "Backup imported. Reloading your saved game…";
      window.location.reload();
    } catch (error) {
      status.textContent = error?.message || "Could not import this backup.";
    }
  });
  actions.append(exportButton, importButton, input, status);
  wrap.append(summary, actions);
  parent.append(wrap);
}

export function installSaveBackupControls() {
  const menu = document.querySelector("#mainmenu .menu-panel");
  const game = document.getElementById("game");
  addBackupControls(menu, "menu");
  if (game) addBackupControls(game, "battle");
}
