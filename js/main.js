import "./tooltips.js";
import { installSaveBackupControls } from "./saveBackup.js?v=20261016-save-backup-v1";
import { startGame } from "./GameEngine.js?v=20261016-roguelike-v6";
import { startGrandCampaign } from "./grandCampaign.js";

startGrandCampaign();
startGame();
installSaveBackupControls();
