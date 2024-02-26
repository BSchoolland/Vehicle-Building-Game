import Block from '../../baseBlockClass.js';
import { LocalToWorld, WorldToLocal } from '../../../utils.js';
// a wheel block with suspension
class WheelBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A wheel block', 100, '#3b2004', [], [],['top']);
        this.secondaryColor = '#3d3d3d';
        this.stiffness = 0.3;
        this.makeBodies();
        this.makeConstraints();
        this.touchingGround = false;
        this.spinSpeed = 0.5;
        this.acceleration = 20;
        // this block is not simetrical in the x direction
        this.simetricalX = false;
        // by default, the activation key is 'd' and the reverse activation key is 'a'
        this.activationKey = 'd';
        this.reverseActivationKey = 'a';
    }
    getControls() {
        return [
            {
                name: '>',
                key: this.activationKey,
                type: 'hold',
                order: 2
            },
            {
                name: '<',
                key: this.reverseActivationKey,
                type: 'hold',
                order: 1 // reverse displays further to the left

            }
        ]
    }
    makeBodies() {
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y-20, 50, 10, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
        this.bodies.push(Matter.Bodies.circle(this.x, this.y, 15, { render: { fillStyle: this.secondaryColor }}));
        // set the friction of the circle very high so it has grip
        this.bodies[1].friction = 100;
        this.bodies[1].block = this;
    }
    makeConstraints() {
        // two spring constraints
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[1], // the circle
            pointA: { x: 20, y: 0 },
            pointB: { x: 0, y: 0 },
            stiffness: this.stiffness,
            length: 35,
            render: {
                strokeStyle: this.secondaryColor
            }
        }));

        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[1], // the circle
            pointA: { x: -20, y: 0 },
            pointB: { x: 0, y: 0 },
            stiffness: this.stiffness,
            length: 35,
            render: {
                strokeStyle: this.secondaryColor
            }
        }));

        // a backup constraint to keep the circle in place
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[1], // the circle
            pointA: { x: 0, y: 25 },
            pointB: { x: 0, y: 0 },
            stiffness: this.stiffness,
            length: 0,
            render: {
                strokeStyle: this.secondaryColor
            }
        }));
    }   
    update(deltaTime) { // deltaTime is in milliseconds
        if (this.hitPoints <= 0) return; // if the block is destroyed, don't update

        if (deltaTime > 100) {
            console.warn('deltaTime too high: ' + deltaTime + ', decreasing to 100');
            deltaTime = 100;
        }
        super.update(deltaTime);
        // drive
        let targetVelocity = this.spinSpeed;
        if (this.flippedX) {
            targetVelocity = -targetVelocity;
        }
        if (this.contraption.keysPressed[this.reverseActivationKey]) {
            targetVelocity = -targetVelocity;
            let currentVelocity = this.bodies[1].angularVelocity;
            let velocityChange = (targetVelocity - currentVelocity) * this.acceleration * deltaTime / 1000;
            let spin = velocityChange + currentVelocity;
            Matter.Body.setAngularVelocity(this.bodies[1], spin);
        } else if (this.contraption.keysPressed[this.activationKey]) {
            // apply a force to the right
            let currentVelocity = this.bodies[1].angularVelocity;
            let velocityChange = (targetVelocity - currentVelocity) * this.acceleration * deltaTime / 1000;
            let spin = velocityChange + currentVelocity;
            Matter.Body.setAngularVelocity(this.bodies[1], spin);
        }
    }   
    resetValues() {
        super.resetValues();
        this.touchingGround = false;
    }
}

export {
    WheelBlock
}