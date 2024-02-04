import Block from '../../baseBlockClass.js';
import { constrainBodyToBody } from '../../../utils.js';
import { playSound } from '../../../../sounds/playSound.js';

// a function that makes a stickman to sit in the seat
function makeStickMan(x, y, color='#FFFFFF') {
    const head = Matter.Bodies.circle(x-5, y-18, 7, { render: { fillStyle: color }, });
    const body = Matter.Bodies.rectangle(x - 5, y - 3, 5, 30, { render: { fillStyle: color } });
    const leftArm = Matter.Bodies.rectangle(x + 2, y - 8, 18, 3, { render: { fillStyle: color } });
    const rightArm = Matter.Bodies.rectangle(x + 2, y - 8, 18, 3, { render: { fillStyle: color } });
    const leftLeg = Matter.Bodies.rectangle(x + 2, y + 12, 18, 3, { render: { fillStyle: color } });
    const rightLeg = Matter.Bodies.rectangle(x + 2, y + 12, 18, 3, { render: { fillStyle: color } });
    // make all the bodies unable to collide with anything
    head.collisionFilter = { mask: 0x0002 };
    body.collisionFilter = { mask: 0x0003 };
    leftArm.collisionFilter = { mask: 0x0004 };
    rightArm.collisionFilter = { mask: 0x0005 };
    // leftLeg.collisionFilter = { mask: 0x0006 };
    rightLeg.collisionFilter = { mask: 0x0007 };

    // constrain the head to the body
    const headConstraints = constrainBodyToBody(head, body, 0.1);
    // constrain the arms to the body
    const leftArmConstraint = Matter.Constraint.create({
        bodyA: body,
        bodyB: leftArm,
        pointA: { x: 0, y: -5 },
        pointB: { x: -10, y: 0 },
        stiffness: 0.1,
        length: 0,
        render: {
            visible: false
        }
    });
    const rightArmConstraint = Matter.Constraint.create({
        bodyA: body,
        bodyB: rightArm,
        pointA: { x: 0, y: -5 },
        pointB: { x: 10, y: 0 },
        stiffness: 0.1,
        length: 0,
        render: {
            visible: false
        }
    });
    const leftLegConstraint = Matter.Constraint.create({
        bodyA: body,
        bodyB: leftLeg,
        pointA: { x: 0, y: 15 },
        pointB: { x: -10, y: 0 },
        stiffness: 0.1,
        length: 0,
        render: {
            visible: false
        }
    });
    const rightLegConstraint = Matter.Constraint.create({
        bodyA: body,
        bodyB: rightLeg,
        pointA: { x: 0, y: 15 },
        pointB: { x: -10, y: 0 },
        stiffness: 0.1,
        length: 0,
        render: {
            visible: false
        }
    });
    const bodies = [head, body, leftArm, rightArm, leftLeg, rightLeg];
    const constraints = [headConstraints[0], headConstraints[1], leftArmConstraint, rightArmConstraint, leftLegConstraint, rightLegConstraint];
    return [bodies, constraints];
}

// a seat block, the core of the vehicle
class SeatBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A seat block', 100, '#3b2004', [], []);
        this.contaption.seat = this;
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['right', 'bottom']; // seat is L shaped
        this.simetricalX = false;
        this.destroyed = true;
    }
    makeBodies() {
        // create a flat surface on the left side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x-20, this.y, 10, 50, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
        // create a flat surface on the bottom side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x + 5, this.y+20, 40, 10, { render: { fillStyle: this.color }}));
        this.bodies[1].block = this;
        // make a stickman to sit in the seat
        let stickMan = null;
        if (!this.contaption.Ai) { 
            stickMan = makeStickMan(this.x, this.y);
        }
        else { // a red stickman for the AI
            stickMan = makeStickMan(this.x, this.y, '#ff0000');
        }
        this.bodies.push(...stickMan[0]);
        this.constraints.push(...stickMan[1]); // don't like that this is in makeBodies() but it works
    }
    damage(amount) {
        super.damage(amount);
        // if the seat is destroyed, play an explosion sound
        if (this.hitPoints <= 0 && !this.destroyed) {
            this.destroyed = true;
            playSound('explosion');
            // if this is an AI
            if (this.contaption.Ai) {
                // increase number of enemy contraptions destroyed
                this.contaption.level.incrementEnemyContraptionsDestroyed();
                
            }
        }
    }
    makeConstraints() {
        // constrain the two bodies together
        const constraints = constrainBodyToBody(this.bodies[0], this.bodies[1]);
        this.constraints.push(constraints[0]);
        this.constraints.push(constraints[1]);
        // constrain the stickman to the seat
        const stickManConstraints = constrainBodyToBody(this.bodies[0], this.bodies[2], 0.1);
        this.constraints.push(stickManConstraints[0]);
        this.constraints.push(stickManConstraints[1]);
        // constrain the stickman's head to the seat
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[2], // the stickman's head
            pointA: { x: 10, y: -20 },
            pointB: { x: 0, y: 0 },
            stiffness: 0.1,
            length: 0,
            render: {
                visible: false
            }
        }));
        // weakly constrain the stickman's arms to the seat
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[4], // the stickman's left arm
            pointA: { x: 40, y: -5 },
            pointB: { x: 20, y: 2 },
            stiffness: 0.001,
            length: 0,
            render: {
                visible: false
            }
        }));
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[5], // the stickman's right arm
            pointA: { x: 40, y: -5 },
            pointB: { x: -20, y: 2 },
            stiffness: 0.001,
            length: 0,
            render: {
                visible: false
            }
        }));
        // weakly constrain the stickman's legs to the seat
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[6], // the stickman's left leg
            pointA: { x: 30, y: 5 },
            pointB: { x: 20, y: 2 },
            stiffness: 0.002,
            length: 0,
            render: {
                visible: false
            }
        }));
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[7], // the stickman's right leg
            pointA: { x: 30, y: 5 },
            pointB: { x: 20, y: 2 },
            stiffness: 0.002,
            length: 0,
            render: {
                visible: false
            }
        }));
        
    }
    getWeldBody(direction = 'right') { // this is redefining the function from the base class
        if (direction === 'right') {
            return this.bodies[0];
        } else if (direction === 'left') {
            return this.bodies[0];
        }
        else if (direction === 'bottom') {
            return this.bodies[1];
        }
    }
    spawn() {
        super.spawn(); 
    }
    checkConnected() { // this block is always connected as it is the core of the vehicle
        this.blocksFromSeat = 0;
    }
    resetValues() {
        super.resetValues();
        this.destroyed = true;
    }
    hit(thisBody, otherBody) { 
        // if the other body is not in this contaption, take damage
        if (otherBody.block.contaption !== this.contaption) {
            this.damage(5);
            // apply an upward force to this body 
            Matter.Body.setVelocity(thisBody, { x: 0, y: -15 });
        }
    }
}


export {
    SeatBlock
}