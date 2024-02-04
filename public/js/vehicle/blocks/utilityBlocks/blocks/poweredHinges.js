import Block from '../../baseBlockClass.js';
import { constrainBodyToBody } from '../../../utils.js';


// a powered hinge block that can rotate.
class PoweredHingeBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A powered hinge block', 100, '#3b2004', [], []);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['right', 'left'];
        this.maxAngle = Math.PI / 2;
        this.currentAngle = 0;
        this.rotationDirection = 1;
        this.rotationSpeed = 0.03;
        this.angleConstraint = null; // a constraint that controls the current angle of the block
        // by default, the activation key is 'e' and the reverse activation key is 'q'
        this.activationKey = 'e';
        this.reverseActivationKey = 'q';
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
        let constraints = constrainBodyToBody(bodyA, bodyB, 0.5, true);
        this.constraints.push(...constraints);
        // constrain the bearing and the right side of the block rigidly using constrainBodyToBody (for now)
        bodyA = this.bodies[1];
        bodyB = this.bodies[2];
        let constraint = constrainBodyToBody(bodyA, bodyB, 0.5, true);
        // make the second constraint red
        constraint[0].render.strokeStyle = '#ff0000';
        this.angleConstraint = constraint[0];
        this.constraints.push(...constraint);
    }
    getWeldBody(direction = 'right') { // this is redefining the function from the base class
        if (direction === 'right') {
            return this.bodies[0];
        } else if (direction === 'left') {
            return this.bodies[1];
        }
    }
    update() { // rotate the block
        super.update();
        // check if the activation key is pressed
        if (this.contraption.keysPressed[this.activationKey]) {
            this.rotate();
        }
        if (this.contraption.keysPressed[this.reverseActivationKey]) {
            this.rotate(true);
        }
    }
    rotate(reverse = false) {
        // rotate the block by moving the angle constraint
        if (reverse) {
            this.rotationDirection = -1;
        } else {
            this.rotationDirection = 1;
        }
        this.currentAngle += this.rotationSpeed * this.rotationDirection;
        console.log(this.currentAngle);
        // make sure the angle is within the bounds
        if (this.currentAngle > this.maxAngle) {
            this.currentAngle = this.maxAngle;
        } else if (this.currentAngle < -this.maxAngle) {
            this.currentAngle = -this.maxAngle;
        }
        // offset the current angle by the angle of the bearing
        let adjustedAngle = this.currentAngle + this.bodies[2].angle;
        // 0, 0 is the center of the bearing
        const distance = 25;
        this.angleConstraint.pointB = { x: distance * Math.cos(adjustedAngle), y: distance * Math.sin(adjustedAngle) };
        
    }
    resetValues() {
        super.resetValues();
        this.currentAngle = 0;
        this.angleConstraint.pointB = { x: 25, y: 0 };
    }
}

export {
    PoweredHingeBlock
};