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

// a ramp block
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
       let vertices ='0 0 0 100 100 100';
       this.bodies.push(Matter.Bodies.fromVertices(this.x - (50-33.3333), this.y + (50-33.3333), Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
    }
}

// a ramp block
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
       let vertices ='100 0 0 100 100 100';
       this.bodies.push(Matter.Bodies.fromVertices(this.x + (50-33.3333), this.y + (50-33.3333), Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
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
        this.bodies[0].block = this;
    }
}



export {GrassBlock, RampBlockL, RampBlockR, GoalBlock};