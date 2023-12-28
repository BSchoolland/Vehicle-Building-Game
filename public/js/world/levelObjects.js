// a file to hold classes for the level objects
// import the contraption class
import { Contraption } from '../vehicle/contraption.js';
// class for the terrain objects
class terrainObject {
    constructor(x, y, width = 50, height = 50, color = 'green') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    init(engine) {
        this.body = Matter.Bodies.rectangle(this.x, this.y, this.width, this.height, { isStatic: true });
        this.body.render.fillStyle = this.color;
        Matter.World.add(engine.world, this.body);
    }
}

// a class for enemy contraptions
class enemyContraption {
    constructor(engine, x, y, json) {
        this.engine = engine;
        this.init(x, y, json);
        this.active = false;
        this.playerContraption = null;
    }
    init(x, y, json) {
        this.contraption = new Contraption(this.engine);
        this.contraption.load(json);
        this.contraption.spawn(x, y);
        // make all blocks static for now
        this.contraption.blocks.forEach(block => {
            block.body.isStatic = true;
        });
    }
    respawn(x, y) {
        this.active = false;
        this.contraption.despawn();
        this.contraption.spawn(x, y);
    }
    activate(playerContraption){
        this.contraption.blocks.forEach(block => {
            block.body.isStatic = false;
        });
        this.playerContraption = playerContraption;
        this.active = true;
    }
    aiControl() {
        if (this.active) {
            // if the contraption is active, then control it with AI
            // get the contraption's position
            let x = this.contraption.blocks[0].body.position.x;
            let y = this.contraption.blocks[0].body.position.y;
            // get the player's position
            let playerX = this.playerContraption.blocks[0].body.position.x;
            // let playerY = this.playerContraption.blocks[0].body.position.y;
            // drive towards the player
            let xDiff = playerX - x;
            if (xDiff > 100) {
                this.contraption.keysPressed['d'] = true;
                this.contraption.keysPressed['a'] = false;
            }
            else if (xDiff < -100) {
                this.contraption.keysPressed['a'] = true;
                this.contraption.keysPressed['d'] = false;
            }
            else {
                this.contraption.keysPressed['a'] = false;
                this.contraption.keysPressed['d'] = false;
            }
        }
    }   
}