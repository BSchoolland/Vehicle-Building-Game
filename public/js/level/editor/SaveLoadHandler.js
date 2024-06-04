// import the Block types
import { EnemySpawnBlock } from "../world/mapBlocks.js";
// a class that handles all aspects of level editing
class SaveLoadHandler {
    constructor(parent, blockTypes) {
        this.parent = parent;
    }


    // save the Level to a JSON object
    save() {
        var LevelJson = {};
        LevelJson.blocks = [];
        this.parent.parent.blocks.forEach((block) => {
            LevelJson.blocks.push(block.save());
        });
        // add an empty commands array to the JSON (this will be filled by devs and used by the AI)
        LevelJson.commands = [];
        return LevelJson;
    }

    loadForEditing(LevelJson) {
        // Clear existing blocks in the Level
        this.parent.parent.LevelLoader.clear(); // remove all blocks from the Level
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
                    const EnemyContraption =
                        this.parent.parent.LevelLoader.loadEnemyContraption(blockJson);
                    // add the enemy contraption to the newBlock
                    newBlock.enemyContraption = EnemyContraption;
                    // make the newBlock invisible
                    newBlock.bodies.forEach((body) => {
                        body.render.visible = false;
                    });
                }
                // Add the block to the Level
                this.parent.parent.LevelLoader.addBlock(newBlock);
            } else {
                console.error(`Unknown block type: ${blockJson.type}`);
            }
        });
    }
}

export default LevelEditor;
