import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261021-river-crossing-castle-test-v4";
import { startGrandCampaign } from "./grandCampaign.js?v=20261021-river-crossing-castles-v3";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
