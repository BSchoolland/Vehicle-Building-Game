import { GrassBlock, RampBlockL, RampBlockR, slightRampBlockL, slightRampBlockR, CoinBlock, BuildingAreaBlock, EnemySpawnBlock } from './mapBlocks.js';
import { Contraption } from '../vehicle/contraption.js'
import { playSound } from '../sounds/playSound.js';
const blockTypes = {
    GrassBlock,
    RampBlockL,
    slightRampBlockL,
    RampBlockR,
    slightRampBlockR,
    CoinBlock,
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
        this.enemyContraptionsJSON = {};

        this.blocks = [];
        this.actionStack = [];
        this.undoStack = [];
        this.frameCount = 0;
        // keep track of win conditions
        this.won = false;

        this.coinsCollected = 0;
        this.mustCollect = 1;
        this.coins = [];

        this.enemyContraptionsDestroyed = 0;
        this.mustDestroy = 0;
        this.enemyContraptions = [];

        this.secondsSurvived = 0;
        this.mustSurvive = 0;
        this.startTime = 0;
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
            '../../json-levels/level3.json',
            '../../json-levels/level4.json',
            '../../json-levels/level5.json',
        ];
        paths.forEach(async (path) => {
            var levelJson = await (await fetch(path)).json();
            this.levels.push(levelJson);
            // if the levelSelector is open, add a button for the new level
            if (document.getElementById('level-selector')) {
                let level = this.levels.length - 1;
                let button = document.createElement('button');
                button.className = "level-select-button";
                button.innerHTML = `Level ${level + 1}`;
                button.addEventListener('click', () => {
                    this.load(level);
                    document.getElementById('level-selector').remove();
                });
                document.getElementById('level-selector').appendChild(button);
            }

        });        
    }
    populateEnemyContraptions() {
        console.log("populate enemy contraptions");
        const enemies = {
            box: '../../json-enemies/box.json',
            smallSpikeCar: '../../json-enemies/small-spike-car.json',
            terrifyingBombCar: '../../json-enemies/terrifying-bomb-car.json',
            W: '../../json-enemies/W.json',
            R: '../../json-enemies/R.json',
            E: '../../json-enemies/E.json',
            C: '../../json-enemies/C.json',
            K: '../../json-enemies/K.json',
            I: '../../json-enemies/I.json',
            N: '../../json-enemies/N.json',
            G: '../../json-enemies/G.json',
            // W
            H: '../../json-enemies/H.json',
            // E
            // E
            L: '../../json-enemies/L.json',
            S: '../../json-enemies/S.json',
        }
        Object.keys(enemies).forEach(async (key) => {
            var enemyJson = await (await fetch(enemies[key])).json();
            this.enemyContraptionsJSON[key] = enemyJson;
        });
        console.log(this.enemyContraptionsJSON);

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
        // add an empty commands array to the JSON (this will be filled by devs and used by the AI)
        LevelJson.commands = [];
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
                let newBlock = new BlockType(blockJson.x, blockJson.y, this);
                // Add the block to the Level
                this.addBlock(newBlock); 

                if (blockJson.flippedX) {
                    newBlock.flipX();
                }
            } else {
                console.error(`Unknown block type: ${blockJson.type}`);

            }
        });
    }
    // load a Level from a JSON object
    load(levelIndex, optionalJson = null) {
        // clear the enemy contraptions
        this.enemyContraptions.forEach(enemyContraption => {
            enemyContraption[0].despawn();
        });
        this.enemyContraptions = [];
        // clear the coins
        this.coins = [];

        if (!this.building.buildArea) {
            console.log("level editing mode");
            this.loadForEditing(levelIndex);
            return;
        }
        var LevelJson = this.levels[levelIndex];

        if (optionalJson) {
            LevelJson = optionalJson;
        }
        // Clear existing blocks in the Level
        this.clear(); // remove all blocks from the Level
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
                        enemyType = "box";
                    }
                    console.log(enemyType)
                    // get the enemy contraption's JSON
                    console.log(this.enemyContraptionsJSON);
                    let enemyContraptionJson = this.enemyContraptionsJSON[enemyType]
                    console.log(enemyContraptionJson);
                    // load the enemy contraption
                    const EnemyContraption = new Contraption(this.engine);
                    EnemyContraption.load(enemyContraptionJson, 'AI');
                    // load the commands
                    EnemyContraption.AiLoadCommands(enemyContraptionJson.commands);
                    // move the enemy contraption to the spawn point
                    EnemyContraption.moveTo(blockJson.x, blockJson.y);
                    // add the enemy contraption to the enemy contraptions array
                    this.enemyContraptions.push([EnemyContraption, blockJson.x, blockJson.y]);
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
        // if the level has buildingBlockTypes, then set the building's buildingBlockTypes
        if (LevelJson.buildingBlockTypes) {
            this.building.makeNewBuildMenu(LevelJson.buildingBlockTypes);
        }
        // set the win conditions
        
        LevelJson.objectives.forEach(objective => {
            if (objective.name === "Collect") {
                this.mustCollect = objective.value;
            }
            else if (objective.name === "Destroy") {
                this.mustDestroy = objective.value;
            }
            else if (objective.name === "Survive") {
                this.mustSurvive = objective.value;
            }
        });
        console.log('must collect: ' + this.mustCollect);

        // bind the startLevel function to the building
        this.building.startLevel = this.startLevel.bind(this);
        // clear the building's contraption
        this.building.contraption.clear();
        // deactivate building mode by clicking the building button if it is active
        if (this.building.buildInProgress) {
            this.building.toggleBuildingMode();
        }
    }
    startLevel() {
        this.won = false;
        // despawn all enemy contraptions
        this.enemyContraptions.forEach(enemyContraption => {
            enemyContraption[0].despawn();
        });

        // spawn in the enemy contraptions
        this.enemyContraptions.forEach(enemyContraption => {
            enemyContraption[0].spawn(enemyContraption[1], enemyContraption[2]);
        });

        // reset the win conditions
        this.coinsCollected = 0;
        this.enemyContraptionsDestroyed = 0;
        this.secondsSurvived = 0;
        this.startTime = Date.now();

        // reset each coin
        this.coins.forEach(coin => {
            coin.reset();
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
    update() { // update the level (check coins, survival time, etc.)
        // check if the player contraption is touching the coin
        if (this.won){
            return;
        }
        this.coins.forEach(coin => {
            if (coin.checkCollection(this.playerContraption)) {
                // play the coin sound
                this.coinsCollected++;
                console.log(this.coinsCollected);
            }
        });
        // check if enough coins have been collected
        if (this.coinsCollected >= this.mustCollect) {
            // check if the player has survived long enough
            this.secondsSurvived = Math.floor((Date.now() - this.startTime) / 1000);
            console.log(this.secondsSurvived);
            // check if the player has destroyed enough enemy contraptions
            if (this.enemyContraptionsDestroyed >= this.mustDestroy) {
                // the player wins!
                this.won = true;
                setTimeout(() => {
                this.completeLevel();
                }, 1500);
                
            }

        }
    }
    completeLevel() {
        // play the level complete sound
        playSound("win");
        // make a bunch of confetti above the player
        for (let i = 0; i < 500; i++) {
            let confettiColors = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5"];
            let x = this.playerContraption.seat.bodies[0].position.x + Math.random() * 200 - 100;
            let y = this.playerContraption.seat.bodies[0].position.y - 300;
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
        setTimeout(() => {
            // clear the level
            this.clear();
            //open the next level
            this.loadLevelSelector();
            // clear the player contraption
            this.playerContraption.clear();
        }, 3000);
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
        // get the game object
        let game = document.getElementById('game-container');
        // add the level selector to the game
        game.appendChild(levelSelector);
        // log the length of the levels array
        console.log(this.levels);
        console.log(this.levels.length);
        // add a button for each level
        this.levels.forEach((level, index) => {
            let box = document.createElement('div');
            box.className = "level-select-box";
            
            console.log(index);
            let button = document.createElement('button');
            button.className = "level-select-button";
            button.innerHTML = `Level ${index + 1}`;
            button.addEventListener('click', () => {
                this.load(index);
                levelSelector.remove();
            });
            console.log(button);
            // add an image for the level (it is also clickable)
            let image = document.createElement('img');
            image.className = "level-select-image";
            image.src = `../../img/level${index + 1}.png`;
            image.addEventListener('click', () => {
                this.load(index);
                levelSelector.remove();
            });
            box.appendChild(image);
            box.appendChild(button);
            levelSelector.appendChild(box);
        });
    }
}

export { LevelManager };