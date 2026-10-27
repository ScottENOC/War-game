import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261027-failed-charge-guard-v1";
import { startGrandCampaign } from "./grandCampaign.js?v=20261027-red-blue-ai-v2";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
