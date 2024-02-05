import {
  RemoteBlock,
  BasicWoodenBlock,
  BasicIronBlock,
  BasicDiamondBlock,
  SeatBlock,
  WheelBlock,
  rocketBoosterBlock,
  SpikeBlock,
  TNTBlock,
  GrappleBlock,
  PoweredHingeBlock,
} from "./blocks.js";
const blockTypes = {
  RemoteBlock,
  BasicWoodenBlock,
  BasicIronBlock,
  BasicDiamondBlock,
  WheelBlock,
  rocketBoosterBlock,
  SpikeBlock,
  TNTBlock,
  SeatBlock,
  GrappleBlock,
  PoweredHingeBlock,
};

// This file contains the Contraption class which is used to represent a contraption in the game.
class Contraption {
  constructor(engine, camera = "AI", level = null) {
    this.engine = engine;
    if (camera === "AI") {
      // the camera is an AI
      this.camera = {
        position: { x: 0, y: 0 },
        mouseDown: false,
        mouseUp: false,
        mousePressed: false,
      };
      this.Ai = true; 
    } else {
      // the mouse is a player
      this.camera = camera;
      this.Ai = false;
    }
    this.level = level;
    this.AiCommands = [];
    this.AiClockStarted = 0; // will keep track of when the commands started
    this.blocks = [];
    this.actionStack = [];
    this.undoStack = [];
    // basic stats
    this.cost = 0;
    this.totalHitPoints = 0;
    this.spawned = false;
    this.keysPressed = {};
    // while the contraption is spawned, it will be updated
    Matter.Events.on(engine, "beforeUpdate", () => {
      if (this.spawned) {
        this.update();
      }
    });
    // watch for key presses
    if (!this.Ai) {
      document.addEventListener("keydown", (event) => this.pressKey(event.key));
      document.addEventListener("keyup", (event) => this.releaseKey(event.key));
    }
    // watch for collisions
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        // check if one of the bodies is a block in the contraption and the other is a block not in the contraption
        if (
          pair.bodyA.block &&
          pair.bodyB.block &&
          this.blocks.includes(pair.bodyA.block) &&
          !this.blocks.includes(pair.bodyB.block)
        ) {
          // trigger hit on the block in the contraption
          pair.bodyA.block.hit(pair.bodyA, pair.bodyB);
        } else if (
          pair.bodyA.block &&
          pair.bodyB.block &&
          !this.blocks.includes(pair.bodyA.block) &&
          this.blocks.includes(pair.bodyB.block)
        ) {
          // trigger hit on the block in the contraption
          pair.bodyB.block.hit(pair.bodyB, pair.bodyA);
        }
      });
    });
    // set the seat
    this.seat = null;
    // variables for calculating delta time
    this.lastTime = 0;
    this.maxSparks = 100;
    this.currentSparks = 0;
  }
  AiLoadCommands(commands) {
    this.AiCommands = commands;
    console.log("loaded commands");
  }
  AiUpdate() {
    this.keysPressed = {};
    // find the number of seconds since the commands started
    let seconds = (Date.now() - this.AiClockStarted) / 1000;
    if (!this.AiCommands) {
      return;
    }
    // loop through the commands to find any with "start" times less than the current time and "end" times greater than the current time
    this.AiCommands.forEach((command) => {
      if (command.start <= seconds && command.end >= seconds) {
        // activate that key
        this.pressKey(command.key);
      }
    });
  }
  destroy() { // remove all traces of this contraption
    console.log('destroying contraption')
    this.clear();
    // delete the object
    delete this;
  }

  addBlock(block, addToActionStack = true) {
    block.contraption = this;
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
    if (block === this.seat) {
      this.seat = null;
    }
  }
  checkConnected(){ // check each block to make sure it is connected
    console.log('check connected')
    this.blocks.forEach((block)=> {
      block.checkConnected();
    })
  }
  flipX(block, addToActionStack = true) {
    block.flipX();
    // add the action to the action stack
    if (addToActionStack) {
      this.actionStack.push({ action: "flipX", block: block });
    }
  }
  // save the contraption to a JSON object
  save() {
    var contraptionJson = {};
    contraptionJson.blocks = [];
    this.blocks.forEach((block) => {
      contraptionJson.blocks.push(block.save());
    });
    return contraptionJson;
  }
  // load a contraption from a JSON object
  load(contraptionJson) {
    // Clear existing blocks in the contraption
    this.clear(); // Assuming this.clear() removes all blocks from the contraption

    // Load new blocks from JSON
    contraptionJson.blocks.forEach((blockJson) => {
      // Get the block type constructor
      const BlockType = blockTypes[blockJson.type];
      if (BlockType) {
        // Create a new block instance
        let newBlock = new BlockType(blockJson.x, blockJson.y, this);
        // flip the block if necessary
        // Add the block to the contraption
        this.addBlock(newBlock);
        if (blockJson.flippedX) {
          newBlock.flipX();
        }
      } else {
        console.error(`Unknown block type: ${blockJson.type} using BasicWoodenBlock instead`);
        // Create a new block instance
        let newBlock = new BasicWoodenBlock(blockJson.x, blockJson.y, this);
        // flip the block if necessary
        // Add the block to the contraption
        this.addBlock(newBlock);
        if (blockJson.flippedX) {
          newBlock.flipX();
        }
      }
    });
  }
  moveTo(x, y) {
    // figure out the center of the contraption
    var centerX = 0;
    var centerY = 0;
    this.blocks.forEach((block) => {
      centerX += block.x;
      centerY += block.y;
    });
    centerX /= this.blocks.length;
    centerY /= this.blocks.length;
    // move the contraption so that the center is at x and y
    x -= centerX;
    y -= centerY;
    this.blocks.forEach((block) => {
      block.x += x;
      block.y += y;
    });
    // reset all blocks to update their positions
    this.blocks.forEach((block) => {
      block.reset(false);
    });
    console.log("moved contraption to " + x + ", " + y);
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

  // calculate the total cost of the contraption
  calculateCost() {
    this.cost = 0;
    this.blocks.forEach((block) => {
      this.cost += block.cost;
    });
  }
  // calculate the total hit points of the contraption
  calculateHitPoints() {
    this.totalHitPoints = 0;
    this.blocks.forEach((block) => {
      this.totalHitPoints += block.hitPoints;
    });
  }
  // spawn the contraption in the world by making all blocks movable
  spawn(x = 0, y = 0) {
    if (!this.seat) { // contraption must have a seat
      console.error("contraption must have a seat");
      return;
    }
    // set the position of each block to be relative to x and y
    // figure out the center of the contraption
    if (!(x === 0 && y === 0)) {
      var centerX = 0;
      var centerY = 0;
      this.blocks.forEach((block) => {
        centerX += block.x;
        centerY += block.y;
      });
      centerX /= this.blocks.length;
      centerY /= this.blocks.length;
      // move the contraption so that the center is at x and y
      x -= centerX;
      y -= centerY;
      this.blocks.forEach((block) => {
        block.x += x;
        block.y += y;
      });
    }
    // reset all blocks (this fixes a bug where blocks would be spawned with incorrect positions)
    this.blocks.forEach((block) => {
      block.reset(false);
    });
    // weld all blocks
    this.blocks.forEach((block) => {
      block.makeWelds();
    });
    // calculate the cost and hit points
    this.calculateCost();
    this.calculateHitPoints();
    // make all blocks movable
    this.blocks.forEach((block) => {
      block.makeMovable();
    });
    // reset the undo stack and action stack
    this.actionStack = [];
    this.undoStack = [];
    // the contraption has been spawned
    this.spawned = true;
    // set the seat as not destroyed
    this.seat.destroyed = false;
    // if this is an AI, start the clock
    if (this.Ai) {
      this.AiClockStarted = Date.now();
    }
    // check connected
    this.checkConnected();
  }
  // despawn the contraption by making all blocks static
  despawn(fancy = false) {
    this.spawned = false;
    if (fancy) {
      // mreset all blocks one by one
      let t = 0;
      this.blocks.forEach((block) => {
        setTimeout(() => {
          block.reset();
        }, t);
        // t += 50;
      });
    }
    else{
    this.blocks.forEach((block) => {
      block.reset();
    });
  }
  // set time to now
  this.lastTime = Date.now();
  }
  // undo the last block placed
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

  // update the contraption
  update() {
    if (!this.seat) return;
    let deltaTime = Date.now() - this.lastTime;
    this.lastTime = Date.now();
    // update all blocks
    this.blocks.forEach((block) => {
      block.update(deltaTime);
    });
    // if this is an AI, update the AI
    if (this.Ai) {
      this.AiUpdate();
    }
    // calculate fire damage for each block
    this.blocks.forEach((block) => {
      if (block.flameDuration > 0) {
        block.damage(block.flameDamage * deltaTime / 1000);
        block.flameDuration -= deltaTime / 1000;
      }
    });

  }
  // press a key
  pressKey(key) {
    this.keysPressed[key] = true;
  }
  // release a key
  releaseKey(key) {
    this.keysPressed[key] = false;
  }
}

export { Contraption };
