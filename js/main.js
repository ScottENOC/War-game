import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=greenskin-roster-v2";
import { startGrandCampaign } from "./grandCampaign.js?v=greenskin-roster-v2";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
