import  Block  from './baseBlockClass.js';
import { LocalToWorld, WorldToLocal, constrainBodyToBody } from '../utils.js';

// a function that makes a stickman to sit in the seat
function makeStickMan(x, y) {
    const head = Matter.Bodies.circle(x-5, y-18, 7, { render: { fillStyle: '#FFFFFF' }, });
    const body = Matter.Bodies.rectangle(x - 5, y - 3, 5, 30, { render: { fillStyle: '#FFFFFF' } });
    const leftArm = Matter.Bodies.rectangle(x + 2, y - 8, 18, 3, { render: { fillStyle: '#FFFFFF' } });
    const rightArm = Matter.Bodies.rectangle(x + 2, y - 8, 18, 3, { render: { fillStyle: '#FFFFFF' } });
    const leftLeg = Matter.Bodies.rectangle(x + 2, y + 12, 18, 3, { render: { fillStyle: '#FFFFFF' } });
    const rightLeg = Matter.Bodies.rectangle(x + 2, y + 12, 18, 3, { render: { fillStyle: '#FFFFFF' } });
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
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['right', 'bottom']; // seat is L shaped
        this.simetricalX = false;
    }
    makeBodies() {
        // create a flat surface on the left side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x-20, this.y, 10, 50, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
        // create a flat surface on the bottom side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x + 5, this.y+20, 40, 10, { render: { fillStyle: this.color }}));
        this.bodies[1].block = this;
        // make a stickman to sit in the seat
        const stickMan = makeStickMan(this.x, this.y);
        this.bodies.push(...stickMan[0]);
        this.constraints.push(...stickMan[1]); // don't like that this is in makeBodies() but it works
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
    spawn() {
        super.spawn();
    }
    checkConnected() { // this block is always connected as it is the core of the vehicle
        this.blocksFromSeat = 0;
    }
}


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

export
{
    BasicBlock,
    SeatBlock
}