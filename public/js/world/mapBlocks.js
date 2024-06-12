import { rotateBodyAroundPoint, rotateConstraintAroundPoint } from "../vehicle/utils.js";

import { playSound } from "../sounds/playSound.js";

// holds the block classes, which are used to create the blocks the map is made of

// the base class for all map blocks
class Block { 
    constructor(x, y, level, color) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.level = level;
        this.color = color;
        this.rotatedTimes = 0; // how many times the block has been rotated (0-3)

        // unused properties for consistency with vehicle blocks
        this.constraints = []; // the constraints that hold the block together (unused for terrain blocks)
        this.weldableFaces = []; // the faces of the block that can be welded to other blocks (unused for terrain blocks)
        this.rotatedWeldableFaces = []; // the faces of the block that can be welded to other blocks, rotated (unused for terrain blocks)
    }
    removeFromWorld(world) {
        // remove the bodies and constraints from the world
        Matter.World.remove(world, this.bodies);
    }
    addToWorld(world) {
        // make all bodies static
        this.bodies.forEach(body => {
            Matter.Body.setStatic(body, true);
        });
        
        // for each time this was rotated, rotate it
        for (var i = 0; i < this.rotatedTimes; i++) {
            // rotate the bodies using the rotateBodyAroundPoint function and the original position of the block
            this.bodies.forEach((body) => {
            rotateBodyAroundPoint(
                body,
                { x: this.originalX, y: this.originalY },
                90
            );
            });
            // rotate the constraints using the rotateConstraintAroundPoint function and the original position of the block
            this.constraints.forEach((constraint) => {
            rotateConstraintAroundPoint(
                constraint,
                { x: this.originalX, y: this.originalY },
                90
                );
            });
        }
    
        this.setRotation(this.rotatedTimes);
        // add the bodies and constraints to the world
        Matter.World.add(world, this.bodies);
    }

    damage(ammount) { // players cannot damage terrain blocks
        console.log("would have damaged block at " + this.x + ", " + this.y + " by " + ammount + " health");
    }
    rotate90() {
        this.rotatedTimes++;
        if (this.rotatedTimes > 3) {
          this.rotatedTimes = 0;
        }
        // rotate the bodies using the rotateBodyAroundPoint function and the original position of the block
        this.bodies.forEach((body) => {
          rotateBodyAroundPoint(body, { x: this.originalX, y: this.originalY }, 90);
        });
        // rotate the constraints using the rotateConstraintAroundPoint function and the original position of the block
        this.constraints.forEach((constraint) => {
            rotateConstraintAroundPoint(
                constraint,
                { x: this.originalX, y: this.originalY },
                90
                );
        });
        this.setRotation(this.rotatedTimes);
      }
      setRotation(rotatedTimes) {
        // reset the rotation
        this.rotatedWeldableFaces = this.weldableFaces;
        // this.removeFromWorld(this.contraption.engine.world);
        // this.addToWorld(this.contraption.engine.world, false);
        // rotate the bodies and constraints
        for (var i = 0; i < rotatedTimes; i++) {
          // change the weldable faces
          let newWeldableFaces = [];
    
          // for how many times the block has been rotated, rotate the weldable faces
    
          this.rotatedWeldableFaces.forEach((face) => {
            switch (face) {
              case "top":
                newWeldableFaces.push("left");
                break;
              case "left":
                newWeldableFaces.push("bottom");
                break;
              case "bottom":
                newWeldableFaces.push("right");
                break;
              case "right":
                newWeldableFaces.push("top");
                break;
            }
          });
          this.rotatedWeldableFaces = newWeldableFaces;
        }
      }
      save() {
        var blockJson = {};
        blockJson.type = this.constructor.name;
        blockJson.x = this.x;
        blockJson.y = this.y;
        blockJson.rotatedTimes = this.rotatedTimes;
        // record if the block is flipped
        blockJson.flippedX = this.flippedX;
        return blockJson;
      }
}


const grassColors = [
    "rgb(34, 139, 34)",   // Forest Green
    "rgb(0, 128, 0)",    // Green
    "rgb(0, 100, 0)",    // Dark Green
    "rgb(50, 205, 50)"  // Lime Green
  ];

const dirtColors = [
    "rgb(85, 107, 47)",   // Dark Olive Green
    "rgb(107, 142, 35)",  // Olive Drab
    "rgb(101, 67, 33)",   // Dark Brown
    "rgb(139, 90, 43)"    // Saddle Brown
];

// a basic grass block
class GrassBlock extends Block {
    constructor(x, y, level) {
        // pick random shade of green
        let color = grassColors[Math.floor(Math.random() * grassColors.length)];
        super(x, y, level, color);
        this.width = 100;
        this.height =100;  
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
        // a square that is the color of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, { isStatic: true, render: { fillStyle: this.color } }));
        this.bodies[0].block = this;
    }
}

// a dirt block
class DirtBlock extends Block {
    constructor(x, y, level) {
        // pick random shade of brown
        let color = dirtColors[Math.floor(Math.random() * dirtColors.length)];
        super(x, y, level, color);
        this.width = 100;2
        this.height = 100;  
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
        // a square that is the color of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, { isStatic: true, render: { fillStyle: this.color } }));
        this.bodies[0].block = this;
    }
}

// a left ramp block
class RampBlockL extends Block {
    constructor(x, y, level) {
        // random green color
        let color = grassColors[Math.floor(Math.random() * grassColors.length)];
        super(x, y, level, color);
        this.width = 100;
        this.height = 100;  
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
       // a right triangle that is the color of the block
       let vertices ='100 0 100 100 0 100';
       this.bodies.push(Matter.Bodies.fromVertices(this.x + (50-33.3333), this.y + (50-33.3333), Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
    }
}

// a longer left ramp block
class slightRampBlockL extends Block {
    constructor(x, y, level) {
        // random green color
        let color = grassColors[Math.floor(Math.random() * grassColors.length)];
        super(x, y, level, color);
        this.width = 100;
        this.height = 100;  
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
        // a right triangle that is the color of the block
        let vertices = '200 100 0 0 0 100';
        this.bodies.push(Matter.Bodies.fromVertices(this.x + (-50+66.6666), this.y + (50-33.3333), Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
    }
}

// slight upside down ramp block L
class slightRampBlockLUpsideDown extends Block {
    constructor(x, y, level) {
        // random green color
        let color = grassColors[Math.floor(Math.random() * grassColors.length)];
        super(x, y, level, color);
        this.width = 100;
        this.height = 100;
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
        // a right triangle that is the color of the block
        let vertices = '0 0 200 0 0 100';
        this.bodies.push(Matter.Bodies.fromVertices(this.x + (50-33.3333), this.y + (-50+33.3333), Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
    }
}

// slight upside down ramp block R
class slightRampBlockRUpsideDown extends Block {
    constructor(x, y, level) {
        // random green color
        let color = grassColors[Math.floor(Math.random() * grassColors.length)];
        super(x, y, level, color);
        this.width = 100;
        this.height = 100;
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
        // a right triangle that is the color of the block
        let vertices = '200 0 0 0 200 100';
        this.bodies.push(Matter.Bodies.fromVertices(this.x + (-50+33.3333), this.y + (-50+33.3333), Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
    }
}

// a right ramp block
class RampBlockR extends Block {
    constructor(x, y, level) {
        // random green color
        let color = grassColors[Math.floor(Math.random() * grassColors.length)];
        super(x, y, level, color);
        this.width = 100;
        this.height = 100;  
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
       // a right triangle that is the color of the block
       let vertices ='0 0 100 100 0 100';
       this.bodies.push(Matter.Bodies.fromVertices(this.x - (50-33.3333), this.y + (50-33.3333), Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
    }
}

// a longer right ramp block
class slightRampBlockR extends Block {
    constructor(x, y, level) {
        // random green color
        let color = grassColors[Math.floor(Math.random() * grassColors.length)];
        super(x, y, level, color);
        this.width = 100;
        this.height = 100;  
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
       // a right triangle that is the color of the block
       let vertices ='200 0 0 100 200 100';
       this.bodies.push(Matter.Bodies.fromVertices(this.x + (50-66.6666), this.y + (50-33.3333), Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
    }
}

// a block that denotates a coin pickup spot
class CoinBlock extends Block {
    constructor(x, y, level) { // gold color
        super(x, y, level, "rgb(255, 215, 0)");
        this.width = 100;
        this.height = 100;  
        this.bodies = [];
        this.coin = null;
        this.makeBodies();
        this.coinExists = false;
    }
    makeBodies() { // spawn a coin at the block's location
        // the coin is a circle
        this.coin = Matter.Bodies.circle(this.x, this.y - 25, 25, { isStatic: false, render: { fillStyle: this.color, sprite: { texture: './img/textures/coin.png' }  } });
        // make the coin not collide with anything
        this.coin.collisionFilter =  {
            category: 0x0002,
        },
        this.bodies.push(this.coin);
        this.coin.block = this;
        this.coinExists = true;
    }
    removeCoin() { // remove the coin from the block
        // remove the coin from the world
        if (!this.coinExists) return; // if the coin doesn't exist, don't try to remove it
        this.coinExists = false;
        // make the coin invisible
        this.coin.render.visible = false;
    }
    checkCollection(playerContraption) { // check if the player contraption is touching the coin
        if (!this.coinExists) return false; // if the coin doesn't exist, it can't be collected

        // check if the player contraption is touching the coin
        let bodies = []
        for (let i = 0; i < playerContraption.blocks.length; i++) {
            bodies.push(playerContraption.blocks[i].bodies[0]);
        }
        for (let i = 0; i < bodies.length; i++) {
            // since the coin cannot collide with anything, check if the block is within 50 pixels of the coin
            if (Math.abs(bodies[i].position.x - this.coin.position.x) < 50 && Math.abs(bodies[i].position.y - this.coin.position.y) < 50) {
                // get rid of the coin
                this.removeCoin();
                // play the coin sound
                playSound("coin");
                return true;
            }
        }
        return false;
    }
    reset() { // reset the coin
        this.removeCoin();
        this.coinExists = true;
        this.coin.render.visible = true;
        // this.addToWorld(this.level.engine.world);
    }

}

// a block that denotates the player's building area
class BuildingAreaBlock extends Block {
    constructor(x, y, level) { 
        super(x, y, level, "rgb(0, 215, 255)");
        this.width = 100;
        this.height = 100;  
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
        // a square that is the color of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, { isStatic: true, render: { fillStyle: this.color } }));
        // make the block not collide with anything
        this.bodies[0].collisionFilter =  {
            category: 0x0002,
        },
        this.bodies[0].block = this;
    }
}

// a block that denotates an enemy vehicle spawn point
class EnemySpawnBlock extends Block {
    constructor(x, y, level) { 
        super(x, y, level, "rgb(255, 0, 0)");
        this.width = 100;
        this.height = 100;  
        this.bodies = [];
        this.makeBodies();
        this.enemyType = "box"
    }
    makeBodies() {
        // a square that is the color of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, { isStatic: true, render: { fillStyle: this.color } }));
        // make the block not collide with anything
        this.bodies[0].collisionFilter =  {
            category: 0x0002,
        },
        this.bodies[0].block = this;
    }
    save() { // override in order to specify the type of enemy to spawn
        var blockJson = {};
        blockJson.type = this.constructor.name;
        blockJson.x = this.x;
        blockJson.y = this.y;
        blockJson.enemyType = this.enemyType;
        return blockJson;
    }
}

export { slightRampBlockRUpsideDown, slightRampBlockLUpsideDown, GrassBlock, DirtBlock, RampBlockL, RampBlockR, slightRampBlockL, slightRampBlockR, CoinBlock, BuildingAreaBlock, EnemySpawnBlock}; 