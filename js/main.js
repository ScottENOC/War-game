import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261020-greenskin-monsters-v4";
import { startGrandCampaign } from "./grandCampaign.js?v=20261020-greenskin-campaign-animosity-v4";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
