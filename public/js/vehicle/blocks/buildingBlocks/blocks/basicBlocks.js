
import Block from '../../baseBlockClass.js';

// a basic square block
class BasicBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 10, 'A basic block', 100, '#4d2902', [], []);
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

export {
    BasicBlock
}