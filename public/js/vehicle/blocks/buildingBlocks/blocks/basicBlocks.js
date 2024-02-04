
import Block from '../../baseBlockClass.js';

// a basic square block
class BasicBlock extends Block {
    constructor (x, y, contraption, health = 100, color = '#4d2902') {
        super(x, y, contraption, 10, 'A basic block', health, color, [], []);
        this.makeBodies();
        this.makeConstraints(); 
        this.weldableFaces = ['top', 'bottom', 'left', 'right'];
    }
    makeBodies() {
        // a square that is the color of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 50, 50, { render: { fillStyle: this.color } }));
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
        super(x, y, contraption, 200, "#984A3C");
    }
}

class BasicDiamondBlock extends BasicBlock {
    constructor (x, y, contraption) {
        super(x, y, contraption, 300, "#00FFFF");
    }
}

export {
    BasicWoodenBlock,
    BasicIronBlock,
    BasicDiamondBlock
}