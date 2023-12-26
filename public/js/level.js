import { GrassBlock } from "./mapBlocks";
const blockTypes = {
    GrassBlock
};
// This file contains the Contraption class which is used to represent a contraption in the game.
class Level {
    constructor(engine, camera = 'AI') {
        this.engine = engine;
        if (camera === 'AI') {
            // the camera is an AI
            this.camera = {
                position: { x: 0, y: 0 },
                mouseDown: false,
                mouseUp: false,
                mousePressed: false
            };
            this.AI = true;
        } else {
            // the mouse is a player
            this.camera = camera;
            this.AI = false;
        }
        this.blocks = [];
        this.actionStack = [];
        this.undoStack = [];
        // basic stats
        this.cost = 0;
        this.totalHitPoints = 0;
        this.spawned = false;
        this.keysPressed = {};
        // while the contraption is spawned, it will be updated
        Matter.Events.on(engine, 'beforeUpdate', () => {
            if (this.spawned) {
                this.update();
            }
        });
        // watch for key presses
        if (!this.AI) {
            document.addEventListener('keydown', (event) => this.pressKey(event.key));
            document.addEventListener('keyup', (event) => this.releaseKey(event.key));
        } 
        
    }
    addBlock(block, addToActionStack = true) {
        block.contraption = this;
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
    // save the contraption to a JSON object
    save() {
        var contraptionJson = {};
        contraptionJson.blocks = [];
        this.blocks.forEach(block => {
            contraptionJson.blocks.push(block.save());
        });
        return contraptionJson;
    }
    // load a contraption from a JSON object
    load(contraptionJson) {
        // Clear existing blocks in the contraption
        this.clear(); // Assuming this.clear() removes all blocks from the contraption
    
        // Load new blocks from JSON
        contraptionJson.blocks.forEach(blockJson => {
            // Get the block type constructor
            const BlockType = blockTypes[blockJson.type];
            if (BlockType) {
                // Create a new block instance
                let newBlock = new BlockType(blockJson.x, blockJson.y);
                // flip the block if necessary
                // Add the block to the contraption
                this.addBlock(newBlock); 

                if (blockJson.flippedX) {
                    newBlock.flipX();
                }
            } else {
                console.error(`Unknown block type: ${blockJson.type}`);
            }
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

    // calculate the total cost of the contraption
    calculateCost() {
        this.cost = 0;
        this.blocks.forEach(block => {
            this.cost += block.cost;
        });
    }
    // calculate the total hit points of the contraption
    calculateHitPoints() {
        this.totalHitPoints = 0;
        this.blocks.forEach(block => {
            this.totalHitPoints += block.hitPoints;
        });
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
}

export { Level };