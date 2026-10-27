import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261027-stuck-charge-history-v1";
import { startGrandCampaign } from "./grandCampaign.js?v=20261027-campaign-ai-v1-impact-report-v1";

startGrandCampaign();
startGame();
installSaveBackupControls();
window.__warGameStartupReady = true;
