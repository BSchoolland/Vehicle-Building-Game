// import the Block types
import { EnemySpawnBlock } from "../world/mapBlocks.js";
import ConfigHandler from "./editor/ConfigHandler.js";
// a class that handles all aspects of level editing
class LevelEditor {
    constructor(parent, blockTypes) {
        this.parent = parent;
        this.blockTypes = blockTypes;
        this.actionStack = [];
        this.undoStack = [];
        this.enabled = false;

        // todo: add movement and zoom handler

        // todo: add action type handler

        // add level configuration handler
        this.ConfigHandler = new ConfigHandler(this);
        // todo: add loading and saving handler

        // todo: add building handlers
    }

    init() {
        this.enabled = true;
        this.ConfigHandler.init();
        // todo: more setup
    }

    // save the Level to a JSON object
    save( download = true) {
        var LevelJson = {};
        LevelJson.blocks = [];
        this.parent.blocks.forEach((block) => {
            LevelJson.blocks.push(block.save());
        });
        // objectives
        LevelJson.objectives = this.ConfigHandler.getObjectives();
        //TODO: add bonus objectives
        // allowed blocks
        LevelJson.buildingBlockTypes = this.ConfigHandler.getAllowedBlocks();
        // level details
        LevelJson.title = this.ConfigHandler.getLevelDetails().title;
        LevelJson.tutorialText = this.ConfigHandler.getLevelDetails().tutorialText;
        // save level to local storage
        localStorage.setItem('level', JSON.stringify(LevelJson));
        // download level as JSON
        if (download) {
            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LevelJson));
            let dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "level.json");
            dlAnchorElem.click();
        }
        
    }

    loadForEditing(LevelJson) {
        // Clear existing blocks in the Level
        this.parent.LevelLoader.clear(); // remove all blocks from the Level
        // Load new blocks from JSON
        LevelJson.blocks.forEach((blockJson) => {
            // Get the block type constructor
            const BlockType = this.blockTypes[blockJson.type];
            if (BlockType) {
                // Create a new block instance
                let newBlock = new BlockType(blockJson.x, blockJson.y, this);
                // set the rotatedTimes property
                newBlock.rotatedTimes = blockJson.rotatedTimes;
                console.log(blockJson.rotatedTimes);
                if (BlockType === EnemySpawnBlock) {
                    newBlock.enemyType = blockJson.enemyType;
                    // spawn in an enemy contraption
                    const EnemyContraption =
                        this.parent.LevelLoader.loadEnemyContraption(blockJson);
                    // add the enemy contraption to the newBlock
                    newBlock.enemyContraption = EnemyContraption;
                    // make the newBlock invisible
                    newBlock.bodies.forEach((body) => {
                        body.render.visible = false;
                    });
                }
                // Add the block to the Level
                this.parent.LevelLoader.addBlock(newBlock);
            } else {
                console.error(`Unknown block type: ${blockJson.type}`);
            }
        });
        // Load objectives
        this.ConfigHandler.setObjectives(LevelJson.objectives);
        // Load allowed blocks
        this.ConfigHandler.setAllowedBlocks(LevelJson.buildingBlockTypes);
        // Load level details
        this.ConfigHandler.setLevelDetails(LevelJson.title, LevelJson.tutorialText);
    }

    undo() {
        if (this.actionStack.length > 0) {
            var lastAction = this.actionStack.pop();
            if (lastAction.action === "add") {
                this.removeBlock(lastAction.block, false);
            } else if (lastAction.action === "flipX") {
                this.flipX(lastAction.block, false);
            } else {
                this.parent.LevelLoader.addBlock(lastAction.block, false);
            }
            // Add the reversed action to the undo stack
            this.undoStack.push(lastAction);
        }
    }

    redo() {
        if (this.undoStack.length > 0) {
            var lastUndoAction = this.undoStack.pop();
            if (lastUndoAction.action === "add") {
                this.parent.LevelLoader.addBlock(lastUndoAction.block);
            } else if (lastUndoAction.action === "flipX") {
                this.flipX(lastUndoAction.block);
            } else {
                this.removeBlock(lastUndoAction.block);
            }
            // Add the action back to the action stack
            this.actionStack.push(lastUndoAction);
        }
    }
}

export default LevelEditor;
