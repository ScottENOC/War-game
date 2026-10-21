import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261021-river-crossing-castle-test-v7";
import { startGrandCampaign } from "./grandCampaign.js?v=20261021-deepdelve-south-coast-v2";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
