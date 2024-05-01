import {
  slightRampBlockRUpsideDown,
  slightRampBlockLUpsideDown,
  GrassBlock,
  DirtBlock,
  RampBlockL,
  RampBlockR,
  slightRampBlockL,
  slightRampBlockR,
  CoinBlock,
  BuildingAreaBlock,
  EnemySpawnBlock,
} from "../world/mapBlocks.js";
const blockTypes = {
  GrassBlock,
  DirtBlock,
  RampBlockL,
  slightRampBlockL,
  RampBlockR,
  slightRampBlockR,
  CoinBlock,
  BuildingAreaBlock,
  EnemySpawnBlock,
  slightRampBlockRUpsideDown,
  slightRampBlockLUpsideDown,
};

import LevelHandler from "../loaders/levelHandler.js";
import EnemyHandler from "../loaders/enemyHandler.js";
import LevelUI from "./LevelUI.js";
import Gameplay from "./Gameplay.js";
import LevelEditor from "./LevelEditing.js";
import LevelLoader from "./LevelLoader.js";
// A Level is a collection of blocks that can be saved and loaded
class LevelManager {
  constructor(engine, building, progressBar, isEnemyEditor = false) {
    this.engine = engine;
    this.playerContraption = building.contraption;
    this.building = building;
    this.isEnemyEditor = isEnemyEditor;
    // handles gameplay mechanics for the level (objectives, level completion, etc.)
    this.GameplayHandler = new Gameplay(this); 
    // handles loading and saving levels
    this.LevelHandler = new LevelHandler(progressBar);
    // handles loading and saving enemies
    this.EnemyHandler = new EnemyHandler(progressBar);
    // handles level editing
    this.LevelEditor = new LevelEditor(this, blockTypes);
    // handles loading levels
    this.LevelLoader = new LevelLoader(this, blockTypes);
    // handles the UI for the level (back arrow and level selector)
    
    this.LevelUI = new LevelUI(this, progressBar);
    this.worldSelected = 1;
    this.enemyContraptions = [];
    this.blocks = [];
    this.coins = [];
    this.test = false;
    this.loaded = false;
  }

  init(string='normal') {
    if (string === 'testLevel') {
      this.test = true;
    }
    this.loaded = true;
  }
}

export default LevelManager;
