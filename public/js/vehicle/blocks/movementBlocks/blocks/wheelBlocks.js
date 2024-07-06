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
    spawn() {
        // Sorry future me!  This is probably the worst code I've written in this project, but I can't figure out what the real problem is.
        // make the constraints invisible
        this.constraints.forEach(constraint => {
            constraint.render.visible = false;
        });
        // make the real constraints visible
        this.constraints[3].render.visible = true;
        this.constraints[4].render.visible = true;
        this.constraints[3].render.strokeStyle = this.secondaryColor;
        this.constraints[4].render.strokeStyle = this.secondaryColor;
        // set the stiffness of the first 3 constraints to 0
        this.constraints[0].stiffness = 0;
        this.constraints[1].stiffness = 0;
        this.constraints[2].stiffness = 0;
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
        this.bodies[0].collisionFilter = {category: 0x0003, mask: 0x0001};
        this.bodies.push(Matter.Bodies.circle(this.x, this.y, 15, { render: { fillStyle: this.secondaryColor }}));
        // set the friction of the circle very high so it has grip
        this.bodies[1].friction = 100;
        this.bodies[1].block = this;
        this.bodies[1].collisionFilter = {category: 0x0003, mask: 0x0001};

        // to prevent the wheel from glitching into the ground, we need an invisible, nearly massless rectangle
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 40, 20, { render: { visible: false }, density: 0.000001}));
        this.bodies[2].collisionFilter = {category: 0x0002, mask: 0x0001};


    }
    makeConstraints() {
        // the following is a workaround to get the constraints to display correctly in building mode
        let cX = 20
        let cY = 0
        let bX = 0;
        let bY = 25;
        if (this.rotatedTimes === 1) {
            cX = 0;
            cY = 20;
            bX = -25;
            bY = 0;
        } else if (this.rotatedTimes === 2) {
            cX = -20;
            cY = 0;
            bX = 0;
            bY = -25;
        } else if (this.rotatedTimes === 3) {
            cX = 0;
            cY = -20;
            bX = 25;
            bY = 0;
        }
        // two spring constraints
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[1], // the circle
            pointA: { x: cX, y: cY },
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
            pointA: { x: -cX, y: -cY },
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
            pointA: { x: bX, y: bY },
            pointB: { x: 0, y: 0 },
            stiffness: this.stiffness,
            length: 0,
            render: {
                visible: false
            }
        }));
        cX = 20
        cY = 0
        bX = 0;
        bY = 25;
        // two spring constraints
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[1], // the circle
            pointA: { x: cX, y: cY },
            pointB: { x: 0, y: 0 },
            stiffness: this.stiffness,
            length: 35,
            render: {
                visible: false
            }
        }));

        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[1], // the circle
            pointA: { x: -cX, y: -cY },
            pointB: { x: 0, y: 0 },
            stiffness: this.stiffness,
            length: 35,
            render: {
                visible: false
            }
        }));

        // a backup constraint to keep the circle in place
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[1], // the circle
            pointA: { x: bX, y: bY },
            pointB: { x: 0, y: 0 },
            stiffness: this.stiffness,
            length: 0,
            render: {
                visible: false
            }
        }));

        // constrain the invisible rectangle to the other rectangle in two places
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[2], // the invisible rectangle
            pointA: { x: -20, y: 15 },
            pointB: { x: -20, y: 0 },
            stiffness: 0.5,
            length: 0,
            render: {
                visible: false
            }
        }));
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[2], // the invisible rectangle
            pointA: { x: 20, y: 15 },
            pointB: { x: 20, y: 0 },
            stiffness: 0.5,
            length: 0,
            render: {
                visible: false
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