import Block from '../../baseBlockClass.js';
import { constrainBodyToBody } from '../../../utils.js';

// an unpowered hinge block that can rotate freely.
class UnpoweredHingeBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A powered hinge block', 100, '#3b2004', [], [], ['right', 'left']);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();

        // by default, the activation key is 'e' and the reverse activation key is 'q'
    }
    makeBodies(){
        // create a flat surface on the left side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x-20, this.y, 10, 50, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
        // create a flat surface on the right side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x + 20, this.y, 10, 50, { render: { fillStyle: this.color }}));
        this.bodies[1].block = this;
        // create a bearing in the center of the block
        this.bodies.push(Matter.Bodies.circle(this.x, this.y, 15, { render: { fillStyle: this.secondaryColor }}));
        this.bodies[2].block = this;
    }
    makeConstraints(){
        // constrain the bearing and the left side of the block rigidly using constrainBodyToBody
        let bodyA = this.bodies[0];
        let bodyB = this.bodies[2];
        let constraints = constrainBodyToBody(bodyA, bodyB, 0.2, true);
        this.constraints.push(...constraints);
        // constrain the bearing and the right side of the block rigidly using constrainBodyToBody (for now)
        bodyA = this.bodies[1];
        bodyB = this.bodies[2];
        let constraint = constrainBodyToBody(bodyA, bodyB, 0.2, true);
        this.constraints.push(...constraint);
    }
    getWeldBody(direction = 'right') { // this is redefining the function from the base class
        if (direction === 'right') {
            return this.bodies[0];
        } else if (direction === 'left') {
            return this.bodies[1];
        }
    }
}

export { 
    UnpoweredHingeBlock 
};