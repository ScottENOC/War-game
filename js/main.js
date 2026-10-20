import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261020-undead-roster-v1";
import { startGrandCampaign } from "./grandCampaign.js?v=20261020-greenskin-momentum-plunder-v2";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
