
import Block from '../../baseBlockClass.js';

// a basic square block
class BasicBlock extends Block {
    constructor(x, y, contraption, health = 100, color = '#4d2902', density = 1) {
        super(x, y, contraption, 10, 'A basic block', health, color, [], [], ['top', 'bottom', 'left', 'right']);
        this.density = density;
        this.makeBodies();
        this.makeConstraints();

    }
    makeBodies() {
        // a square that is the color of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 50, 50, { render: { fillStyle: this.color }, density: this.density * 0.001}));
        this.bodies[0].block = this;
    }
    makeConstraints() {
        // no constraints
    }
}

class BasicWoodenBlock extends BasicBlock {
    constructor (x, y, contraption) {
        super(x, y, contraption, 100, '#4d2902');
    }

}

class BasicIronBlock extends BasicBlock {
    constructor (x, y, contraption) { 
        super(x, y, contraption, 300, "#3b3b3b", 3); // 3 times the density of a wooden block
    }
    damage(amount){
        let previousHealth = this.hitPoints;
        super.damage(amount);
        if (this.hitPoints < 150 && previousHealth >= 150){
            // the steel plating breaks, and the color changes to 4d2902
            this.color = "#4d2902";
            // add a bunch of grey sparks
            for (let i = 0; i < 20; i++) {
                // create a spark with a random position and velocity
                let spark = Matter.Bodies.rectangle(this.bodies[0].position.x + Math.random() * 10 - 5, this.bodies[0].position.y + Math.random() * 10 - 5, 15, 15, { render: { fillStyle: '#3b3b3b' }});
                Matter.Body.setVelocity(spark, { x: Math.random() * 10 - 5, y: Math.random() * 10 - 10});
                // make the spark unable to collide with other blocks
                spark.collisionFilter = { mask: 0x0002 };
                // add the spark to the world
                Matter.World.add(this.contraption.engine.world, spark);
                // remove the spark after 2 seconds
                setTimeout(() => {
                    Matter.World.remove(this.contraption.engine.world, spark);
                }, 2000);
            }
            // as a workaround because the color will be changed by the super.damage() method, repeadedly set the color of the body
            let count = 0
            const interval = setInterval(() => {
                this.bodies[0].render.fillStyle = this.color;
                count++;
                if (count >= 20){
                    clearInterval(interval);
                }
            }, 50);
        }
    }
    resetValues(){
        super.resetValues();
        // the steel plating is restored
        this.bodies[0].render.fillStyle = "#3b3b3b";
        this.color = "#3b3b3b";
    }
}

class LightBlock extends BasicBlock {
    constructor (x, y, contraption) {
        super(x, y, contraption, 50, "#00000", 0.25);
        this.density = 0.25
    }

    makeBodies() {
        // a square with this block's sprite
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 50, 50, { render: { strokeStyle: '#ffffff', sprite: { texture: './img/textures/lightBlock.png' }}, density: this.density * 0.001}));
        this.bodies[0].block = this;

    }
}

// this is ununsed, but it could be used to make a block that is even stronger than iron
class BasicDiamondBlock extends BasicBlock {
    constructor (x, y, contraption) {
        super(x, y, contraption, 300, "#00FFFF");
    }
}



export {
    BasicWoodenBlock,
    BasicIronBlock,
    BasicDiamondBlock,
    LightBlock
}