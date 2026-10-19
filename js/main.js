import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261020-chariots-v2";
import { startGrandCampaign } from "./grandCampaign.js?v=20261020-dense-planar-campaign-map-v1";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
