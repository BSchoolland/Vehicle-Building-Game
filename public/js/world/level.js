import { slightRampBlockRUpsideDown, slightRampBlockLUpsideDown, GrassBlock, RampBlockL, RampBlockR, slightRampBlockL, slightRampBlockR, CoinBlock, BuildingAreaBlock, EnemySpawnBlock } from './mapBlocks.js';
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
    EnemySpawnBlock,
    slightRampBlockRUpsideDown, 
    slightRampBlockLUpsideDown,
};
import LevelHandler from '../loaders/levelHandler.js';
// A Level is a collection of blocks that can be saved and loaded
class LevelManager {
    constructor(engine, building) {
        this.engine = engine;
        this.playerContraption = building.contraption;
        this.building = building;
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

        this.mustCompleteBefore = 0; // no limit
        this.remainingTime = 0;
        this.secondsSurvived = 0;
        this.mustSurvive = 0;
        this.startTime = 0;

        this.LevelHandler = new LevelHandler();
        this.worldSelected = 1;
    }

    init() {
        this.populateEnemyContraptions();
    }
    populateEnemyContraptions() {
        console.log("populate enemy contraptions");
        const enemies = {
            box: '../../json-enemies/box.json',
            car: '../../json-enemies/car.json',
            spikeCar: '../../json-enemies/spikeCar.json',
            largeSpikeCar: '../../json-enemies/largeSpikeCar.json',
            movingSpikeWall: '../../json-enemies/movingSpikeWall.json',
            barge: '../../json-enemies/barge.json',
            world1Boss: '../../json-enemies/world1Boss.json',
            flameTank: '../../json-enemies/flameTank.json',
            tntTank: '../../json-enemies/tntTank.json',
            delayedRocketCar: '../../json-enemies/delayedRocketCar.json',
        }
        Object.keys(enemies).forEach(async (key) => {
            var enemyJson = await (await fetch(enemies[key])).json();
            this.enemyContraptionsJSON[key] = enemyJson;
        });
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
            enemyContraption[0].destroy();
        });
        this.enemyContraptions = [];
        // clear the coins
        this.coins = [];

        if (!this.building.buildArea) {
            console.log("level editing mode");
            this.loadForEditing(levelIndex);
            return;
        }
        else {
            // set build mode
            // if (!this.building.buildInProgress){
                
            // }
        }
        
        var LevelJson = this.LevelHandler.getLevel(this.worldSelected, levelIndex); // world 1, level levelIndex

        if (optionalJson) {
            LevelJson = optionalJson;
        }
        let tutorial = document.getElementById('tutorial-text');

        let string = LevelJson.tutorialText;
        tutorial.innerHTML = string;
        tutorial.style.display = "block";
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
                        console.error("No enemy type defined for enemy spawn block");
                        enemyType = "box";
                    }
                    // get the enemy contraption's JSON
                    let enemyContraptionJson = this.enemyContraptionsJSON[enemyType]
                    if (enemyContraptionJson === undefined) {
                        console.error(`Unknown enemy type: ${enemyType}`);
                        return;
                    }
                    // load the enemy contraption
                    const EnemyContraption = new Contraption(this.engine, 'AI', this);
                    EnemyContraption.load(enemyContraptionJson);
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
    this.mustCompleteBefore = 0;
    if (LevelJson.objectives) {
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
            else if (objective.name === "BeforeTime") {
                this.mustCompleteBefore = objective.value;
                this.remainingTime = objective.value;
            }
        });
    }
    else {
        this.mustCollect = 1;
        this.mustDestroy = 0;
        this.mustSurvive = 0;
        this.mustCompleteBefore = 0; // 0 means there is no time limit
    }
    this.updateStats();
    // bind the startLevel function to the building
    this.building.startLevel = this.startLevel.bind(this);
    // bind the setBuildMode function to the building
    this.building.startBuildModeForLevel = this.setBuildMode.bind(this);
    // clear the building's contraption
    this.building.contraption.clear();
    // allow the building to enter build mode
    this.building.canEnterBuildMode = true;
    // activate building mode by clicking the building button if it is not already active
        if (!this.building.buildInProgress) {
            this.building.toggleBuildingMode();
        }
    }
    updateStats(){
        let stats = document.getElementById('stats');
        stats.innerHTML = '';
        if (this.mustCollect > 0) {
            let collect = document.createElement('h1');
            collect.innerHTML = `Coins ${this.coinsCollected}/${this.mustCollect}`;
            stats.appendChild(collect);
        }
        if (this.mustDestroy > 0) {
            let destroy = document.createElement('h1');
            destroy.innerHTML = `Destroyed ${this.enemyContraptionsDestroyed}/${this.mustDestroy}`;
            stats.appendChild(destroy);
        }
        if (this.mustSurvive > 0) {
            let survive = document.createElement('h1');
            survive.innerHTML = `Survive ${this.secondsSurvived}/${this.mustSurvive}`;
            stats.appendChild(survive);
        }
        if (this.mustCompleteBefore > 0) {
            let before = document.createElement('h1');
            if (this.remainingTime <= 0) {
                before.innerHTML = `Complete before FAILED!`;
            }
            else {
            before.innerHTML = `Complete before ${this.remainingTime}`;
            }
            stats.appendChild(before);
        }
        stats.style.display = "block";  
    }
    incrementEnemyContraptionsDestroyed() {
        this.enemyContraptionsDestroyed++;
        this.updateStats();
    }
    despawnEnemyContraptions() {
        // kill all enemy contraptions
        this.enemyContraptions.forEach(enemyContraption => {
            enemyContraption[0].despawn();
            enemyContraption[0].moveTo(enemyContraption[1], enemyContraption[2]);
        });
    }
    startLevel() {
        // set time to normal speed
        this.engine.timing.timeScale = 1;
        this.won = false;
        // despawn all enemy contraptions
        
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
    setBuildMode() {
        // despawn all enemy contraptions
        this.despawnEnemyContraptions();
        // reset the win conditions
        this.coinsCollected = 0;
        this.enemyContraptionsDestroyed = 0;
        this.secondsSurvived = 0;
        this.startTime = 0;
        // update the stats
        this.updateStats();
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
        if (!this.playerContraption.seat) return;
        if (this.startTime === 0) { // if the level hasn't started yet, don't check for win conditions
            return;
        }
        this.coins.forEach(coin => {
            if (coin.checkCollection(this.playerContraption)) {
                // play the coin sound
                this.coinsCollected++;
                // show that coins have been increased
                this.updateStats();
            }
        });
        // check if enough coins have been collected
        if (this.coinsCollected >= this.mustCollect) {
            // check that the playercontraption's seat is not destroyed
            if (this.playerContraption.seat.destroyed) {
                // the player loses
                this.startTime = 0;
                return;
            }
            // check if the player has survived long enough
            let pastSecondsSurvived = this.secondsSurvived;
            this.secondsSurvived = Math.floor((Date.now() - this.startTime) / 1000);
            // if the seconds survived has increased, and has not reached the win condition, play the time sound
            if (this.secondsSurvived > pastSecondsSurvived && this.secondsSurvived <= this.mustSurvive) {
                // playSound("time");
                this.updateStats();
            }
            // check if the time limit has been reached
            if (this.mustCompleteBefore > 0) {
                this.remainingTime = this.mustCompleteBefore - this.secondsSurvived;
                if (this.remainingTime <= 0) {
                    // the player can no longer win
                    return;
                }
            }
                    
            if (this.secondsSurvived >= this.mustSurvive) {
                // check if the player has destroyed enough enemy contraptions
                if (this.enemyContraptionsDestroyed >= this.mustDestroy) {
                    // check if the player has completed the level before the time limit
                    
                    // the player wins!
                    if (this.won) {
                        return;
                    }
                    this.won = true;
                    // slow down time
                    this.engine.timing.timeScale = 0.2;
                    // deactivate build mode if it is somehow active
                    if (this.building.buildInProgress){
                        this.building.toggleBuildingMode();
                    }
                    // prevent build mode
                    this.building.canEnterBuildMode = false;
                    setTimeout(() => {
                    this.completeLevel();
                    }, 500);
                }
            }
        }
        else { // update tbhe stats but don't allow a win
            let pastSecondsSurvived = this.secondsSurvived;
            this.secondsSurvived = Math.floor((Date.now() - this.startTime) / 1000);
            // if the seconds survived has increased, and has not reached the win condition, play the time sound
            if (this.secondsSurvived > pastSecondsSurvived && this.secondsSurvived <= this.mustSurvive) {
                // playSound("time");
                this.updateStats();
            };
            if (this.mustCompleteBefore > 0) {
                this.remainingTime = this.mustCompleteBefore - this.secondsSurvived;
                this.updateStats();
            };
        }
    }
    completeLevel() {
        
        // hide the tutorial text
        document.getElementById('tutorial-text').style.display = "none";
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
            // set the stats to be invisible
            document.getElementById('stats').style.display = "none";
            // set the survival time to 0
            this.secondsSurvived = 0;
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
        // if build mode is active, deactivate it
        if (this.building.buildInProgress){
            this.building.toggleBuildingMode();
        }
        // prevent build mode
        this.building.canEnterBuildMode = false;
        // a screen to select the level to play
        let levelSelector = document.createElement('div');
        // a list of buttons at the top to select the world
        let worldSelector = document.createElement('div');
        worldSelector.id = "world-selector";
        worldSelector.className = "world-select-menu";
        // get the game object
        let game = document.getElementById('game-container');
        // add the world selector to the game
        game.appendChild(worldSelector);
        // add a button for each world
        let worldCount = this.LevelHandler.getWorldCount();
        for (let i = 0; i < worldCount; i++) {
            let button = document.createElement('button');
            button.className = "world-select-button";
            button.innerHTML = `World ${i+1}`;
            // if this world is already selected, make the button look selected
            if (i + 1 === this.worldSelected) {
                button.className = "world-select-button selected";
            }
            else {
                button.addEventListener('click', () => {
                    levelSelector.remove();
                    this.worldSelected = i + 1;
                    this.loadLevelSelector();
                    return;
                    
                });
            }
            worldSelector.appendChild(button);
        }
        levelSelector.appendChild(worldSelector);
        levelSelector.id = "level-selector";
        levelSelector.className = "level-select-menu";
        // get the game object
        // add the level selector to the game
        game.appendChild(levelSelector);
        // add a button for each level
        let count = this.LevelHandler.getLevelCount(this.worldSelected);
        for (let i = 0; i < count; i++) {
            let box = document.createElement('div');
            box.className = "level-select-box";
            let button = document.createElement('button');
            button.className = "level-select-button";
            button.innerHTML = `Level ${i+1}`;
            button.addEventListener('click', () => {
                this.load(i);
                levelSelector.remove();
            });
            // add an image for the level (it is also clickable)
            let image = document.createElement('img');
            image.className = "level-select-image";
            image.src = `../../img/world${this.worldSelected}.png`;
            image.addEventListener('click', () => {
                this.load(i);
                levelSelector.remove();
            });
            box.appendChild(image);
            box.appendChild(button);
            levelSelector.appendChild(box);
        };
    }
}

export { LevelManager };