import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261027-route-expansion-diagnostics-v1";
import { startGrandCampaign } from "./grandCampaign.js?v=20261027-ai-decision-logging-v4";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
