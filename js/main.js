import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261022-ai-battle-lab-v1";
import { startGrandCampaign } from "./grandCampaign.js?v=20261021-subfaction-rosters-v1";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
