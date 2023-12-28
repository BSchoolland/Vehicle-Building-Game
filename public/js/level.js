import { GrassBlock, RampBlockL, RampBlockR, GoalBlock } from './mapBlocks.js';
const blockTypes = {
    GrassBlock,
    RampBlockL,
    RampBlockR,
    GoalBlock
};
// This file contains the Level class which is used to represent a Level in the game.
class Level {
    constructor(engine, playerContraption) {
        this.engine = engine;
        this.playerContraption = playerContraption;
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
    celebrate() {
        // make loads of confetti above the goal
        for (let i = 0; i < 100; i++) {
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
    // load a Level from a JSON object
    load(LevelJson) {
        // Clear existing blocks in the Level
        this.clear(); // Assuming this.clear() removes all blocks from the Level
    
        // Load new blocks from JSON
        LevelJson.blocks.forEach(blockJson => {
            // Get the block type constructor
            const BlockType = blockTypes[blockJson.type];
            if (BlockType) {
                // Create a new block instance
                let newBlock = new BlockType(blockJson.x, blockJson.y);
                // flip the block if necessary
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
}

export { Level };