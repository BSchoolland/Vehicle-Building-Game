import {
  slightRampBlockRUpsideDown,
  slightRampBlockLUpsideDown,
  GrassBlock,
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

import { Contraption } from "../vehicle/contraption.js";
import LevelHandler from "../loaders/levelHandler.js";
import EnemyHandler from "../loaders/enemyHandler.js";
import LevelUI from "./LevelUI.js";
import Gameplay from "./Gameplay.js";
import LevelEditor from "./LevelEditing.js";
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
    // handles the UI for the level (back arrow and level selector)
    this.LevelUI = new LevelUI(this);
    this.worldSelected = 1;
    this.enemyContraptions = [];
    this.blocks = [];
    this.test = false;
    this.loaded = false;
  }

  init(string='normal') {
    if (string === 'testLevel') {
      this.test = true;
    }
    this.loaded = true;
  }
  
  loadEnemyContraption(blockJson) {
    let enemyType = blockJson.enemyType;
    if (enemyType === undefined) {
      console.error("No enemy type defined for enemy spawn block");
      enemyType = "box";
    }
    // get the enemy contraption's JSON
    let enemyContraptionJson = this.EnemyHandler.getEnemyJSON(enemyType);
    if (enemyContraptionJson === undefined) {
      console.error(`Unknown enemy type: ${enemyType}`);
      return;
    }
    // load the enemy contraption
    const EnemyContraption = new Contraption(this.engine, "AI", this);
    EnemyContraption.load(enemyContraptionJson);
    // load the commands
    EnemyContraption.AiLoadCommands(enemyContraptionJson.commands);
    // move the enemy contraption to the spawn point
    EnemyContraption.moveTo(blockJson.x, blockJson.y);
    // add the enemy contraption to the enemy contraptions array
    this.enemyContraptions.push([EnemyContraption, blockJson.x, blockJson.y]);
    return EnemyContraption;
  }
  // load a Level from a JSON object
  async load(levelIndex, optionalJson = null) {
    // clear the enemy contraptions
    this.enemyContraptions.forEach((enemyContraption) => {
      enemyContraption[0].destroy();
    });
    this.enemyContraptions = [];
    // clear the coins
    this.coins = [];

    if (!this.building.buildArea) {
      console.log("level editing mode");
      this.loadForEditing(levelIndex);
      return;
    } else {
      // set build mode
      // if (!this.building.buildInProgress){
      // }
    }

    let LevelJson;
    
    if (optionalJson) { // if optionalJson is provided, use that instead of loading from the LevelHandler
      LevelJson = JSON.parse(optionalJson);
    }
    else { // if optionalJson is not provided, load from the LevelHandler
      LevelJson = this.LevelHandler.getLevel(this.worldSelected, levelIndex); // world 1, level levelIndex
    }
    let tutorial = document.getElementById("tutorial-text");

    let string = LevelJson.tutorialText;
    let sentences = string.split(/(?<=[\.!])/).map(sentence => {
      let trimmedSentence = sentence.trim();
      if (trimmedSentence) {
        return `<p>${trimmedSentence}</p>`;
      }
    }).join('');
    tutorial.innerHTML = sentences;
    tutorial.style.display = "block";
    // Clear existing blocks in the Level
    this.clear(); // remove all blocks from the Level
    // Load new blocks from JSON
    let buildAreaDefined = false;
    this.building.setBuildArea({
      x: -1,
      y: -1,
      width: 0,
      height: 0,
    });
    LevelJson.blocks.forEach((blockJson) => {
      // Get the block type constructor
      const BlockType = blockTypes[blockJson.type];
      if (BlockType) {
        if (blockJson.type === "BuildingAreaBlock") {
          // don't add building area blocks to the level, instead use them to increase the size of the building area
          if (!buildAreaDefined) {
            buildAreaDefined = true;
            this.building.setBuildArea({
              x: blockJson.x - 50,
              y: blockJson.y - 50,
              width: 100,
              height: 100,
            });
          } else {
            // if the square is outside the current build area, expand the build area
            if (
              blockJson.x + 50 >
              this.building.buildArea.x + this.building.buildArea.width
            ) {
              this.building.buildArea.width =
                blockJson.x + 50 - this.building.buildArea.x;
            }
            if (
              blockJson.y + 50 >
              this.building.buildArea.y + this.building.buildArea.height
            ) {
              this.building.buildArea.height =
                blockJson.y + 50 - this.building.buildArea.y;
            }
            // check if the square is above or to the left of the current build area
            if (blockJson.x - 50 < this.building.buildArea.x) {
              this.building.buildArea.width +=
                this.building.buildArea.x - blockJson.x + 50;
              this.building.buildArea.x = blockJson.x - 50;
            }
            if (blockJson.y - 50 < this.building.buildArea.y) {
              this.building.buildArea.height +=
                this.building.buildArea.y - blockJson.y + 50;
              this.building.buildArea.y = blockJson.y - 50;
            }
          }
          return;
        }
        if (blockJson.type === "EnemySpawnBlock") {
          // spawn in an enemy contraption
          // get the enemyType
          let enemyType = blockJson.enemyType;
          if (enemyType === undefined) {
            console.error("No enemy type defined for enemy spawn block");
            enemyType = "box";
          }
          // load the enemy contraption
          const EnemyContraption = this.loadEnemyContraption(blockJson);
          return;
        }

        // Create a new block instance
        let newBlock = new BlockType(blockJson.x, blockJson.y, this);
        // Add the block to the Level
        this.addBlock(newBlock);

        if (blockJson.flippedX) {
          newBlock.flipX();
        }
        if (BlockType === CoinBlock) {
          this.coins.push(newBlock);
        }
      } else {
        console.error(`Unknown block type: ${blockJson.type}`);
      }
    });

    this.building.camera.doingTour = true;
    // do a quick tour of the level to show the player what it looks like
    this.building.camera.levelTour(LevelJson, this.building.buildArea);
    // only do the next part after the tour is done (doingTour is set to false)
    let interval = setInterval(() => {
        if (!this.building.camera.doingTour) {
            clearInterval(interval);
            this.building.camera.doingTour = false;

            // if the level has buildingBlockTypes, then set the building's buildingBlockTypes
            if (LevelJson.buildingBlockTypes) {
            this.building.makeNewBuildMenu(LevelJson.buildingBlockTypes, this.isEnemyEditor);
            }
            
            // set the win conditions
            this.mustCompleteBefore = 0;
            if (LevelJson.objectives) {
            LevelJson.objectives.forEach((objective) => {
                if (objective.name === "Collect") {
                this.GameplayHandler.mustCollect = objective.value;
                } else if (objective.name === "Destroy") {
                this.GameplayHandler.mustDestroy = objective.value;
                } else if (objective.name === "Survive") {
                this.GameplayHandler.mustSurvive = objective.value;
                } else if (objective.name === "BeforeTime") {
                this.GameplayHandler.mustCompleteBefore = objective.value;
                this.GameplayHandler.remainingTime = objective.value;
                }
            });
            } else {
            this.GameplayHandler.mustCollect = 1;
            this.GameplayHandler.mustDestroy = 0;
            this.GameplayHandler.mustSurvive = 0;
            this.GameplayHandler.mustCompleteBefore = 0; // 0 means there is no time limit
            }
            this.GameplayHandler.updateStats();
            // bind the startLevel function to the building
            this.building.startLevel = this.GameplayHandler.startLevel.bind(this.GameplayHandler);
            // bind the setBuildMode function to the building
            this.building.startBuildModeForLevel = this.GameplayHandler.setBuildMode.bind(this.GameplayHandler);
            // clear the building's contraption
            this.building.contraption.clear();
            // allow the building to enter build mode
            this.building.canEnterBuildMode = true;
            // activate building mode by clicking the building button if it is not already active
            this.building.toggleBuildingMode(true);
            if (!this.building.buildInProgress) {
              this.building.toggleBuildingMode(true);
            }

        }
    });
  }

  despawnEnemyContraptions() {
    // kill all enemy contraptions
    this.enemyContraptions.forEach((enemyContraption) => {
      enemyContraption[0].despawn();
      enemyContraption[0].moveTo(enemyContraption[1], enemyContraption[2]);
    });
  }
  
  clear() {
    // Make a copy of the blocks array and iterate over it
    [...this.blocks].forEach((block) => {
      this.removeBlock(block);
    });
    // Reset the undo stack and action stack
    this.actionStack = [];
    this.undoStack = [];
  }
  addBlock(block, addToActionStack = true) {
    block.Level = this;
    this.blocks.push(block);
    // add the block to the world
    block.addToWorld(this.engine.world);
    // add the action to the action stack
    if (addToActionStack) {
      this.actionStack.push({ action: "add", block: block });
    }
  }

  removeBlock(block, addToActionStack = true) {
    this.blocks.splice(this.blocks.indexOf(block), 1);
    // remove the block from the world
    block.removeFromWorld(this.engine.world);
    // add the action to the action stack
    if (addToActionStack) {
      this.actionStack.push({ action: "remove", block: block });
    }
    // if it is an enemy spawn block, remove the enemy contraption

    if (block.enemyContraption) {
      block.enemyContraption.destroy();
    }
  }

}

export default LevelManager;
