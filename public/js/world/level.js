import { GrassBlock, RampBlockL, RampBlockR, GoalBlock, BuildingAreaBlock, EnemySpawnBlock } from './mapBlocks.js';
import { Contraption } from '../vehicle/contraption.js'
const blockTypes = {
    GrassBlock,
    RampBlockL,
    RampBlockR,
    GoalBlock,
    BuildingAreaBlock,
    EnemySpawnBlock
};
// A Level is a collection of blocks that can be saved and loaded
class LevelManager {
    constructor(engine, building) {
        this.engine = engine;
        this.playerContraption = building.contraption;
        this.building = building;
        this.levels = [];
        this.enemyContraptionsJSON = [];
        this.enemyContraptions = [];
        this.blocks = [];
        this.actionStack = [];
        this.undoStack = [];
        this.frameCount = 0;
        // check for a win every 30 frames (to save on performance)
        Matter.Events.on(engine, 'beforeUpdate', () => {
            this.frameCount++;
            if (this.frameCount > 30) {
                this.frameCount = 0;
                if (this.goal != null) {
                    if(this.goal.checkForWin(this.playerContraption)){
                        console.log("You win!");
                        this.celebrate();
                        // TODO: add a win screen, and then load the next level
                    }
                }
            }
        });
    }

    init() {
        this.populateLevels();
        this.populateEnemyContraptions();
    }
    // populate the levels array with the JSON data
    populateLevels() {
        const paths = [
            '../../json-levels/level1.json',
            '../../json-levels/level2.json',
            '../../json-levels/level3.json'
        ];
        paths.forEach(async (path) => {
            var levelJson = await (await fetch(path)).json();
            this.levels.push(levelJson);
        });
    }
    populateEnemyContraptions() {
        const paths = [
            '../../json-contraptions/enemy1.json'
            // '../../json-contraptions/enemy2.json',
            // '../../json-contraptions/enemy3.json'
        ];
        paths.forEach(async (path) => {
            var contraptionJson = await (await fetch(path)).json();
            console.log(contraptionJson);
            this.enemyContraptionsJSON.push(contraptionJson);
        });
    }
    celebrate() {
        // make loads of confetti above the goal
        for (let i = 0; i < 500; i++) {
            let confettiColors = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5"];
            let x = this.goal.x + Math.random() * 100 - 50;
            let y = this.goal.y - Math.random() * 100;
            let color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            let confetti = Matter.Bodies.circle(x, y, 5, { render: { fillStyle: color } });
            Matter.Body.setVelocity(confetti, { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 });
            // make the confetti not collide with anything
            confetti.collisionFilter =  {
                category: 0x0003,
            },
            Matter.World.add(this.engine.world, confetti);
            // remove the confetti after 5 seconds
            setTimeout(() => {
                Matter.World.remove(this.engine.world, confetti);
            }, 5000);
        }
        // after a 1 second delay, load the next level
        this.playerContraption.clear();
        setTimeout(() => {
            // clear the level
            this.clear();
            //open the next level
            this.loadLevelSelector();
        }, 3000);
        
    }
    addBlock(block, addToActionStack = true) {
        block.Level = this;
        this.blocks.push(block);
        // add the block to the world
        block.addToWorld(this.engine.world);
        // add the action to the action stack
        if (addToActionStack){
            this.actionStack.push({ action: 'add', block: block });
        }
    }
    removeBlock(block, addToActionStack = true) {
        this.blocks.splice(this.blocks.indexOf(block), 1);
        // remove the block from the world
        block.removeFromWorld(this.engine.world);
        // add the action to the action stack
        if (addToActionStack){
            this.actionStack.push({ action: 'remove', block: block });
        }
    }
    // save the Level to a JSON object
    save() {
        var LevelJson = {};
        LevelJson.blocks = [];
        this.blocks.forEach(block => {
            LevelJson.blocks.push(block.save());
        });
        return LevelJson;
    }

    loadForEditing(LevelJson) {
        // Clear existing blocks in the Level
        this.clear(); // remove all blocks from the Level
        console.log(LevelJson);
        // Load new blocks from JSON
        LevelJson.blocks.forEach(blockJson => {
            // Get the block type constructor
            const BlockType = blockTypes[blockJson.type];
            if (BlockType) {
                // Create a new block instance
                let newBlock = new BlockType(blockJson.x, blockJson.y);
                // Add the block to the Level
                this.addBlock(newBlock); 

                if (blockJson.flippedX) {
                    newBlock.flipX();
                }
                if (BlockType === GoalBlock) {
                    this.goal = newBlock;
                }
            } else {
                console.error(`Unknown block type: ${blockJson.type}`);
            }
        });
    }
    // load a Level from a JSON object
    load(levelIndex) {
        this.enemyContraptions = []; // clear the enemy contraptions

        if (!this.building.buildArea) {
            console.log("level editing mode");
            this.loadForEditing(levelIndex);
            return;
        }
        var LevelJson = this.levels[levelIndex];
        // Clear existing blocks in the Level
        this.clear(); // remove all blocks from the Level
        console.log(LevelJson);
        // Load new blocks from JSON
        let buildAreaDefined = false;
        this.building.setBuildArea(
        {
            x: -1,
            y: -1,
            width: 0,
            height: 0
        }
        )
        console.log(this.building.buildArea)
        LevelJson.blocks.forEach(blockJson => {
            // Get the block type constructor
            const BlockType = blockTypes[blockJson.type];
            if (BlockType) {
                if (blockJson.type === "BuildingAreaBlock") {
                    // don't add building area blocks to the level, instead use them to increase the size of the building area
                    if (!buildAreaDefined) {
                        buildAreaDefined = true;
                        this.building.setBuildArea(
                            {
                                x: blockJson.x - 50,
                                y: blockJson.y - 50,
                                width: 100,
                                height: 100
                            }
                        )
                    }
                    else {
                        // if the square is outside the current build area, expand the build area
                        if (blockJson.x + 50 > this.building.buildArea.x + this.building.buildArea.width) {
                            this.building.buildArea.width = blockJson.x + 50 - this.building.buildArea.x;
                        }
                        if (blockJson.y + 50 > this.building.buildArea.y + this.building.buildArea.height) {
                            this.building.buildArea.height = blockJson.y + 50 - this.building.buildArea.y;
                        }
                        // check if the square is above or to the left of the current build area
                        if (blockJson.x - 50 < this.building.buildArea.x) {
                            this.building.buildArea.width += this.building.buildArea.x - blockJson.x + 50;
                            this.building.buildArea.x = blockJson.x - 50;
                        }
                        if (blockJson.y - 50 < this.building.buildArea.y) {
                            this.building.buildArea.height += this.building.buildArea.y - blockJson.y + 50;
                            this.building.buildArea.y = blockJson.y - 50;
                        }
                    }
                    return;
                }
                if (blockJson.type === "EnemySpawnBlock") { // spawn in an enemy contraption
                    // get the enemyType
                    let enemyType = blockJson.enemyType;
                    if (enemyType === undefined) {
                        enemyType = 1;
                    }
                    console.log(enemyType)
                    // get the enemy contraption's JSON
                    let enemyContraptionJson = this.enemyContraptionsJSON[enemyType - 1];
                    // load the enemy contraption
                    const EnemyContraption = new Contraption(this.engine);
                    EnemyContraption.load(enemyContraptionJson, 'AI');
                    // move the enemy contraption to the spawn point
                    EnemyContraption.moveTo(blockJson.x, blockJson.y);
                    // add the enemy contraption to the enemy contraptions array
                    this.enemyContraptions.push([EnemyContraption, blockJson.x, blockJson.y]);
                    return;
                }

                // Create a new block instance
                let newBlock = new BlockType(blockJson.x, blockJson.y);
                // Add the block to the Level
                this.addBlock(newBlock); 

                if (blockJson.flippedX) {
                    newBlock.flipX();
                }
                if (BlockType === GoalBlock) {
                    this.goal = newBlock;
                }
            } else {
                console.error(`Unknown block type: ${blockJson.type}`);
            }
        });
        this.building.startLevel = this.startLevel.bind(this);
    }
    startLevel() {
        // despawn all enemy contraptions
        this.enemyContraptions.forEach(enemyContraption => {
            enemyContraption[0].despawn();
        });
        // spawn in the enemy contraptions
        this.enemyContraptions.forEach(enemyContraption => {
            enemyContraption[0].spawn(enemyContraption[1], enemyContraption[2]);
        });
    }
    clear() {
        // Make a copy of the blocks array and iterate over it
        [...this.blocks].forEach(block => {
            this.removeBlock(block);
        });    
        // Reset the undo stack and action stack
        this.actionStack = [];
        this.undoStack = [];
    }
    undo() {
        if (this.actionStack.length > 0) {
            var lastAction = this.actionStack.pop();
            if (lastAction.action === 'add') {
                this.removeBlock(lastAction.block, false);
            } else if(lastAction.action === 'flipX') {
                this.flipX(lastAction.block, false);
            }
            else {
                this.addBlock(lastAction.block, false);
            }
            // Add the reversed action to the undo stack
            this.undoStack.push(lastAction);
        }
    }

    redo() {
        if (this.undoStack.length > 0) {
            var lastUndoAction = this.undoStack.pop();
            if (lastUndoAction.action === 'add') {
                this.addBlock(lastUndoAction.block);
            } else if(lastUndoAction.action === 'flipX') {
                this.flipX(lastUndoAction.block);
            }
            else {
                this.removeBlock(lastUndoAction.block);
            }
            // Add the action back to the action stack
            this.actionStack.push(lastUndoAction);
        }
    }
    loadLevelSelector() {
        console.log("load level selector");
        // a screen to select the level to play
        let levelSelector = document.createElement('div');
        levelSelector.id = "level-selector";
        levelSelector.className = "level-select-menu";
        document.body.appendChild(levelSelector);
        // add a title
        let title = document.createElement('h1');
        title.innerHTML = "Select a level";
        levelSelector.appendChild(title);
        // add a button for each level
        this.levels.forEach((level, index) => {
            let button = document.createElement('button');
            button.className = "level-select-button";
            button.innerHTML = `Level ${index + 1}`;
            button.addEventListener('click', () => {
                this.load(index);
                levelSelector.remove();
            });
            levelSelector.appendChild(button);
        });
    }
}

export { LevelManager };