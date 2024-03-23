// a class that handles all aspects of level editing
class LevelEditor {
    constructor(parent, blockTypes) {
        this.parent = parent;
        this.blockTypes = blockTypes;
        this.actionStack = [];
        this.undoStack = [];
    }
    
      // save the Level to a JSON object
      save() {
        var LevelJson = {};
        LevelJson.blocks = [];
        this.parent.blocks.forEach((block) => {
          LevelJson.blocks.push(block.save());
        });
        // add an empty commands array to the JSON (this will be filled by devs and used by the AI)
        LevelJson.commands = [];
        return LevelJson;
      }
    
      loadForEditing(LevelJson) {
        // Clear existing blocks in the Level
        this.parent.clear(); // remove all blocks from the Level
        // Load new blocks from JSON
        LevelJson.blocks.forEach((blockJson) => {
          // Get the block type constructor
          const BlockType = this.blockTypes[blockJson.type];
          if (BlockType) {
            // Create a new block instance
            let newBlock = new BlockType(blockJson.x, blockJson.y, this);
            if (BlockType === EnemySpawnBlock) {
              newBlock.enemyType = blockJson.enemyType;
              // spawn in an enemy contraption
              const EnemyContraption = this.loadEnemyContraption(blockJson);
              // add the enemy contraption to the newBlock
              newBlock.enemyContraption = EnemyContraption;
              // make the newBlock invisible
              newBlock.bodies.forEach((body) => {
                body.render.visible = false;
              });
            }
            // Add the block to the Level
            this.addBlock(newBlock);
          } else {
            console.error(`Unknown block type: ${blockJson.type}`);
          }
        });
      }

      undo() {
        if (this.actionStack.length > 0) {
          var lastAction = this.actionStack.pop();
          if (lastAction.action === "add") {
            this.removeBlock(lastAction.block, false);
          } else if (lastAction.action === "flipX") {
            this.flipX(lastAction.block, false);
          } else {
            this.addBlock(lastAction.block, false);
          }
          // Add the reversed action to the undo stack
          this.undoStack.push(lastAction);
        }
      }
    
      redo() {
        if (this.undoStack.length > 0) {
          var lastUndoAction = this.undoStack.pop();
          if (lastUndoAction.action === "add") {
            this.addBlock(lastUndoAction.block);
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