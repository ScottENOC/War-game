import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261019-recruitment-pools-v2";
import { startGrandCampaign } from "./grandCampaign.js?v=20261019-campaign-mobility-v5";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
