// holds the block classes, which are used to create the blocks the map is made of

// the base class for all map blocks
class Block { 
    constructor(x, y, level, color) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.color = color;
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
        // add the bodies and constraints to the world
        Matter.World.add(world, this.bodies);
    }
    save() {
        var blockJson = {};
        blockJson.type = this.constructor.name;
        blockJson.x = this.x;
        blockJson.y = this.y;
        return blockJson;
    }
    damage(ammount) { // players cannot damage terrain blocks
        console.log("would have damaged block at " + this.x + ", " + this.y + " by " + ammount + " health");
    }
}


const grassColors = [
    "rgb(34, 139, 34)",   // Forest Green
    "rgb(0, 128, 0)",    // Green
    "rgb(0, 100, 0)",    // Dark Green
    "rgb(50, 205, 50)"  // Lime Green
  ];

// a basic grass block
class GrassBlock extends Block {
    constructor(x, y, level) {
        // pick random shade of green
        let color = grassColors[Math.floor(Math.random() * grassColors.length)];
        super(x, y, level, color);
        this.width = 100;
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

// a goal block
class GoalBlock extends Block {
    constructor(x, y, level) { // gold color
        super(x, y, level, "rgb(255, 215, 0)");
        this.width = 100;
        this.height = 100;  
        this.bodies = [];
        this.makeBodies();
    }
    makeBodies() {
        // a square that is the color of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, { isStatic: true, render: { fillStyle: this.color } }));
        // make the goal not collide with anything
        this.bodies[0].collisionFilter =  {
            category: 0x0002,
        },
        this.bodies[0].block = this;
    }
    checkForWin(playerContraption) {
        // check if the player contraption is touching the goal
        let bodies = []
        for (let i = 0; i < playerContraption.blocks.length; i++) {
            bodies.push(playerContraption.blocks[i].bodies[0]);
        }
        for (let i = 0; i < bodies.length; i++) {
            // since the goal cannot collide with anything, check if the block is within 25 pixels of the goal
            if (bodies[i].position.x > this.bodies[0].position.x - 25 && bodies[i].position.x < this.bodies[0].position.x + 25 && bodies[i].position.y > this.bodies[0].position.y - 25 && bodies[i].position.y < this.bodies[0].position.y + 25) {
                return true;
            }
        }
        return false;
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

export {GrassBlock, RampBlockL, RampBlockR, slightRampBlockL, slightRampBlockR, GoalBlock, BuildingAreaBlock, EnemySpawnBlock}; 