import {Contraption} from "../vehicle/contraption.js";

import {
  CoinBlock,
} from "../world/mapBlocks.js";


// a class that handles the loading of levels, including all blocks and entities
class LevelLoader {
  constructor(parent, blockTypes) {
    this.parent = parent;
    this.blockTypes = blockTypes;
    this.enemySpawnPoints = [];
    this.playable = true;
  }
  loadEnemyContraption(blockJson) {
    let enemyType = blockJson.enemyType;
    if (enemyType === undefined) {
      console.error("No enemy type defined for enemy spawn block");
      enemyType = "box";
    }
    // get the enemy contraption's JSON
    let enemyContraptionJson = this.parent.EnemyHandler.getEnemyJSON(enemyType);
    if (enemyContraptionJson === undefined) {
      console.error(`Unknown enemy type: ${enemyType}`);
      return;
    }
    // load the enemy contraption
    const EnemyContraption = new Contraption(this.parent.engine, "AI", this.parent);
    EnemyContraption.load(enemyContraptionJson);
    // load the commands
    EnemyContraption.AiLoadCommands(enemyContraptionJson.commands);
    // move the enemy contraption to the spawn point
    EnemyContraption.moveTo(blockJson.x, blockJson.y);
    // add the enemy contraption to the enemy contraptions array
    this.parent.enemyContraptions.push([EnemyContraption, blockJson.x, blockJson.y]);
    return EnemyContraption;
  }

  // load a Level from a JSON object
  async load(levelIndex, optionalJson = null, playable = true) {
    this.playable = playable;
    // clear the enemy contraptions
    this.parent.enemyContraptions.forEach((enemyContraption) => {
      enemyContraption[0].destroy();
    });
    this.parent.enemyContraptions = [];
    // clear the coins
    this.parent.coins = [];

    if (!this.parent.building.buildArea) {
      this.parent.loadForEditing(levelIndex);
      return;
    }

    // set the building's contraption's level to this
    this.parent.building.contraption.level = this.parent;

    let LevelJson;
    
    if (optionalJson) { // if optionalJson is provided, use that instead of loading from the LevelHandler
      LevelJson = JSON.parse(optionalJson);
    }
    else { // if optionalJson is not provided, load from the LevelHandler
      LevelJson = this.parent.LevelHandler.getLevel(this.parent.worldSelected, levelIndex); // world 1, level levelIndex
    }
    let tutorial = document.getElementById("tutorial-text");

    let string = LevelJson.tutorialText;
    if (string === "") {
      // set the string to the level name
      string = "Level: " + LevelJson.title;
    }
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
    this.parent.building.setBuildArea({
      x: -1,
      y: -1,
      width: 0,
      height: 0,
    });
    LevelJson.blocks.forEach((blockJson) => {
      // Get the block type constructor
      const BlockType = this.blockTypes[blockJson.type];
      if (BlockType) {
        if (blockJson.type === "BuildingAreaBlock") {
          // don't add building area blocks to the level, instead use them to increase the size of the building area
          if (!buildAreaDefined) {
            buildAreaDefined = true;
            this.parent.building.setBuildArea({
              x: blockJson.x - 50,
              y: blockJson.y - 50,
              width: 100,
              height: 100,
            });
          } else {
            // if the square is outside the current build area, expand the build area
            if (
              blockJson.x + 50 >
              this.parent.building.buildArea.x + this.parent.building.buildArea.width
            ) {
              this.parent.building.buildArea.width =
                blockJson.x + 50 - this.parent.building.buildArea.x;
            }
            if (
              blockJson.y + 50 >
              this.parent.building.buildArea.y + this.parent.building.buildArea.height
            ) {
              this.parent.building.buildArea.height =
                blockJson.y + 50 - this.parent.building.buildArea.y;
            }
            // check if the square is above or to the left of the current build area
            if (blockJson.x - 50 < this.parent.building.buildArea.x) {
              this.parent.building.buildArea.width +=
                this.parent.building.buildArea.x - blockJson.x + 50;
              this.parent.building.buildArea.x = blockJson.x - 50;
            }
            if (blockJson.y - 50 < this.parent.building.buildArea.y) {
              this.parent.building.buildArea.height +=
                this.parent.building.buildArea.y - blockJson.y + 50;
              this.parent.building.buildArea.y = blockJson.y - 50;
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
          this.enemySpawnPoints.push(blockJson);
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
          this.parent.coins.push(newBlock);
        }
      } else {
        console.error(`Unknown block type: ${blockJson.type}`);
      }
    });
    // as long as the level is not a floating level, add a line of grass blocks below each lowest block
    if (!LevelJson.floating) {
      // loop through the blocks to find all the lowest blocks in their column
      let lowestBlocks = this.findLowestBlocks();
      // add a line of n dirtBlocks below each lowest block
      this.addDirtBlocks(lowestBlocks);
    }
    else {
      console.log("Floating level");
    }


    if (!playable) {
      // zoom way out with the camera
      this.parent.building.camera.setViewport(
        2000,
        2000
      );
      // set the camera position to the center of the build area

      this.parent.building.camera.setCenterPosition(
        2400,
        400
      );
      this.parent.building.camera.update();
      // print the camera position
      // log the camera size
      // start the level

      return;
    }
    // set the win conditions
    this.parent.GameplayHandler.mustCompleteBefore = 0;
    if (LevelJson.objectives) {
    LevelJson.objectives.forEach((objective) => {
        if (objective.name === "Collect") {
        this.parent.GameplayHandler.mustCollect = objective.value;
        } else if (objective.name === "Destroy") {
        this.parent.GameplayHandler.mustDestroy = objective.value;
        } else if (objective.name === "Survive") {
        this.parent.GameplayHandler.mustSurvive = objective.value;
        } else if (objective.name === "BeforeTime") {
        this.parent.GameplayHandler.mustCompleteBefore = objective.value;
        this.parent.GameplayHandler.remainingTime = objective.value;
        }
    });
    } else {
    this.parent.GameplayHandler.mustCollect = 1;
    this.parent.GameplayHandler.mustDestroy = 0;
    this.parent.GameplayHandler.mustSurvive = 0;
    this.parent.GameplayHandler.mustCompleteBefore = 0; // 0 means there is no time limit
    }
    this.parent.GameplayHandler.updateStats();
    this.parent.building.camera.doingTour = true;
    // do a quick tour of the level to show the player what it looks like
    this.parent.building.camera.levelTour(LevelJson, this.parent.building.buildArea);
    // only do the next part after the tour is done (doingTour is set to false)
    let interval = setInterval(() => {
      if (!this.parent.building.camera.doingTour) {
        if (this.parent.building.camera.tourCancelled) {
          // if the tour was cancelled, don't do anything
          console.log("Tour cancelled");
          // clear the level
          this.clear();
          clearInterval(interval);
          return;
        }
        console.log("Tour done");
        clearInterval(interval);
        this.parent.building.camera.doingTour = false;

        // if the level has buildingBlockTypes, then set the building's buildingBlockTypes
        if (LevelJson.buildingBlockTypes) {
          this.parent.building.makeNewBuildMenu(
            LevelJson.buildingBlockTypes,
            this.isEnemyEditor
          );
        }

        // bind the startLevel function to the building
        this.parent.building.startLevel =
          this.parent.GameplayHandler.startLevel.bind(
            this.parent.GameplayHandler
          );
        // bind the setBuildMode function to the building
        this.parent.building.startBuildModeForLevel =
          this.parent.GameplayHandler.setBuildMode.bind(
            this.parent.GameplayHandler
          );
        // clear the building's contraption
        this.parent.building.contraption.clear();
        // allow the building to enter build mode
        this.parent.building.canEnterBuildMode = true;
        // activate building mode by clicking the building button if it is not already active
        this.parent.building.toggleBuildingMode(true);
        if (!this.parent.building.buildInProgress) {
          this.parent.building.toggleBuildingMode(true);
        }
      }
    });
  }

  findLowestBlocks() {
    let lowestBlocks = [];
    this.parent.blocks.forEach((block) => {
      // if the block's class is GrassBlock, add it to the lowestBlocks array
      if (block instanceof this.blockTypes["GrassBlock"]) {
        let found = false;
        for (let i = 0; i < lowestBlocks.length; i++) {
          let lowestBlock = lowestBlocks[i];
          // if this block is lower than the lowest block at its x position remove the lowest block and add this block
          if (block.x === lowestBlock.x && block.y > lowestBlock.y) {
            lowestBlocks.splice(i, 1);
            lowestBlocks.push(block);
            found = true;
            break;
          }
          // if this block is higher than the lowest block at its x position, don't add it
          else if (block.x === lowestBlock.x && block.y < lowestBlock.y) {
            found = true;
            break;
          }
        }
        // if this block is the only block in its column, add it
        if (!found) {
          lowestBlocks.push(block);
        }
      }
    });
    return lowestBlocks;
  }

  addDirtBlocks(lowestBlocks, n = 10) {
    lowestBlocks.forEach((block) => {
      // determine the number of GrassBlocks to add
      const grassBlocks = Math.floor(Math.random() * 3) + 1;
      for (let i = 1; i <= n; i++) {
        let newBlock;
        // if i is less than or equal to grassBlocks, create a GrassBlock
        if (i <= grassBlocks) {
          newBlock = new this.blockTypes["GrassBlock"](block.x, block.y + i * 100, this);
        } else {
          newBlock = new this.blockTypes["DirtBlock"](block.x, block.y + i * 100, this);
        }
        this.addBlock(newBlock);
      }
    });
  }

  despawnEnemyContraptions(perminant = false) {
    // kill all enemy contraptions
    this.parent.enemyContraptions.forEach((enemyContraption) => {
      enemyContraption[0].despawn();
      enemyContraption[0].moveTo(enemyContraption[1], enemyContraption[2]);
    });
  }
  respawnEnemies() { // spawns an enemy at each enemy spawn point
    this.enemySpawnPoints.forEach((block) => {
      if (block.type === "EnemySpawnBlock") {
        // get the enemyType
        let enemyType = block.enemyType;
        let enemyContraptionJson = this.parent.EnemyHandler.getEnemyJSON(enemyType);
        if (enemyContraptionJson === undefined) {
          console.error(`Unknown enemy type: ${enemyType}`);
          return;
        }
        // load the enemy contraption
        const EnemyContraption = new Contraption(this.parent.engine, "AI", this.parent);
        EnemyContraption.load(enemyContraptionJson);
        // load the commands
        EnemyContraption.AiLoadCommands(enemyContraptionJson.commands);
        // move the enemy contraption to the spawn point
        EnemyContraption.moveTo(block.x, block.y);
        // add the enemy contraption to the enemy contraptions array
        this.parent.enemyContraptions.push([EnemyContraption, block.x, block.y]);
        // make the enemy contraption move
        EnemyContraption.spawn();
      }
    });
  }
  
  clear() {
    // Make a copy of the blocks array and iterate over it
    [...this.parent.blocks].forEach((block) => {
      this.removeBlock(block);
    });
    // Reset the undo stack and action stack
    this.parent.LevelEditor.actionStack = [];
    this.undoStack = [];
    // clear the enemy contraptions
    this.parent.enemyContraptions.forEach((enemyContraption) => {
      enemyContraption[0].destroy();
    });
  }
  addBlock(block, addToActionStack = true) {
    block.Level = this;
    this.parent.blocks.push(block);
    // add the block to the world
    block.addToWorld(this.parent.engine.world);
    // add the action to the action stack
    if (addToActionStack) {
      this.parent.LevelEditor.actionStack.push({ action: "add", block: block });
    }
  }

  removeBlock(block, addToActionStack = true) {
    this.parent.blocks.splice(this.parent.blocks.indexOf(block), 1);
    // remove the block from the world
    block.removeFromWorld(this.parent.engine.world);
    // add the action to the action stack
    if (addToActionStack) {
      this.parent.LevelEditor.actionStack.push({ action: "remove", block: block });
    }
    // if it is an enemy spawn block, remove the enemy contraption

    if (block.enemyContraption) {
      block.enemyContraption.destroy();
    }
  }
}

export default LevelLoader;