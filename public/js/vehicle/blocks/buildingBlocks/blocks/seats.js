import Block from '../../baseBlockClass.js';
import { constrainBodyToBody } from '../../../utils.js';
import { playSound } from '../../../../sounds/playSound.js';

const colorChange = 25;
// a function that makes a stickman to sit in the seat
function makeStickMan(x, y, color='#FFFFFF') {
    const head = Matter.Bodies.circle(x-2.5, y-22, 7, { render: { sprite: { texture: './img/textures/robohead.png' }}});
    
    const body = Matter.Bodies.rectangle(x - 5, y - 3, 5, 30, { render: { fillStyle: color } });
    // change color by a few random shades
    let newColor = '#' + (parseInt(color.substring(1), 16) + Math.floor(Math.random() * colorChange )).toString(16);

    const leftArm = Matter.Bodies.rectangle(x + 2, y - 8, 18, 5, { render: { fillStyle: newColor } });
    newColor = '#' + (parseInt(color.substring(1), 16) + Math.floor(Math.random() * colorChange )).toString(16);

    const rightArm = Matter.Bodies.rectangle(x + 2, y - 8, 18, 5, { render: { fillStyle: newColor } });
    newColor = '#' + (parseInt(color.substring(1), 16) + Math.floor(Math.random() * colorChange )).toString(16);

    const leftLeg = Matter.Bodies.rectangle(x + 2, y + 12, 18, 5, { render: { fillStyle: newColor } });
    newColor = '#' + (parseInt(color.substring(1), 16) + Math.floor(Math.random() * colorChange )).toString(16);

    const rightLeg = Matter.Bodies.rectangle(x + 2, y + 12, 18, 5, { render: { fillStyle: newColor } });
    newColor = '#' + (parseInt(color.substring(1), 16) + Math.floor(Math.random() * colorChange )).toString(16);

    // make all the bodies unable to collide with anything
    head.collisionFilter = { mask: 0x0002 };
    body.collisionFilter = { mask: 0x0003 };
    leftArm.collisionFilter = { mask: 0x0004 };
    rightArm.collisionFilter = { mask: 0x0005 };
    // leftLeg.collisionFilter = { mask: 0x0006 };
    rightLeg.collisionFilter = { mask: 0x0007 };
    leftLeg.collisionFilter = { mask: 0x0008 };

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
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A seat block', 100, '#3b2004', [], [], ['right', 'bottom']);
        this.contraption.seat = this;
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.simetricalX = false;
        this.destroyed = true;
        // this.flippedX = true;
        this.interval = null;
        this.intervalCount = 0;
        // take damage while touching other blocks
        this.isColliding = []
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
        if (!this.contraption.Ai) { 
            stickMan = makeStickMan(this.x, this.y, '#3d3d3d');
        }
        else { // a grey for the ai
            stickMan = makeStickMan(this.x, this.y, '#3d3d3d');
        }
        this.bodies.push(...stickMan[0]);
        this.constraints.push(...stickMan[1]); // don't like that this is in makeBodies() but it works
    }
    addToWorld(world, rotate = true) {
        super.addToWorld(world, rotate);
        // record the positions of the seat bodies
        let originalPositions = [];
        for (let i = 0; i < this.bodies.length; i++) {
            originalPositions.push({ x: this.bodies[i].position.x, y: this.bodies[i].position.y, angle: this.bodies[i].angle });
        }

        // make all the parts of the guy not static
        for (let i = 0; i < this.bodies.length; i++) {
            Matter.Body.setStatic(this.bodies[i], false);
        }
        // all the following is a workaround to fix a bug where matter.js doesn't handle constraints connected to static bodies well
        setTimeout(() => {
            Matter.Body.setStatic(this.bodies[0], !this.contraption.spawned);
            Matter.Body.setStatic(this.bodies[1], !this.contraption.spawned);
            Matter.Body.setVelocity(this.bodies[1], { x: 0, y: 0 });
        }, 25);
        if (this.interval !== null) {
            clearInterval(this.interval);
        }
        
        this.interval = setInterval(() => {
            if (this.contraption.spawned) {
                return;
            }
            // move the first two bodies to the correct position and make them static
            Matter.Body.setPosition(this.bodies[0], { x: originalPositions[0].x, y: originalPositions[0].y });
            Matter.Body.setPosition(this.bodies[1], { x: originalPositions[1].x, y: originalPositions[1].y });
            // reset rotation
            Matter.Body.setAngle(this.bodies[0], originalPositions[0].angle);
            Matter.Body.setAngle(this.bodies[1], originalPositions[1].angle);
        }, 1);
        this.intervalCount++;
        const intervalCount = this.intervalCount;
        setTimeout(() => {
            if (intervalCount !== this.intervalCount) {
                return;
            }
            clearInterval(this.interval);
            this.interval = null;
        }, 1000);
    }

    damage(amount) {
        super.damage(amount, "seat");
        // if the seat is destroyed, play an explosion sound
        if (this.hitPoints <= 0 && !this.destroyed) {
            this.destroyed = true;
            playSound('explosion');
            // if this is an AI
            if (this.contraption.Ai) {
                // increase number of enemy contraptions destroyed
                this.contraption.level.GameplayHandler.incrementEnemyContraptionsDestroyed();
            } else {
                // this was the player, so display the game over screen
                this.contraption.level.LevelUI.gameOver();
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
        // this.constraints.push(Matter.Constraint.create({
        //     bodyA: this.bodies[0], // the rectangle
        //     bodyB: this.bodies[2], // the stickman's head
        //     pointA: { x: 10, y: -20 },
        //     pointB: { x: 0, y: 0 },
        //     stiffness: 0.1,
        //     length: 0,
        //     render: {
        //         visible: false
        //     }
        // }));
        // weakly constrain the stickman's arms to the seat
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[4], // the stickman's left arm
            pointA: { x: 30, y: -7 },
            pointB: { x: 20, y: 2 },
            stiffness: 0.002,
            length: 0,
            render: {
                visible: false
            }
        }));
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[5], // the stickman's right arm
            pointA: { x: 30, y: -5 },
            pointB: { x: -10, y: 2 },
            stiffness: 0.002,
            length: 0,
            render: {
                visible: false
            }
        }));
        // weakly constrain the stickman's legs to the seat
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the rectangle
            bodyB: this.bodies[6], // the stickman's left leg
            pointA: { x: 35, y: 25 },
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
            pointA: { x: 35, y: 5 },
            pointB: { x: 20, y: 2 },
            stiffness: 0.002,
            length: 0,
            render: {
                visible: false
            }
        }));
        
    }
    getWeldBody(direction = 'right') { // this is redefining the function from the base class
        if (this.rotatedTimes % 2 === 0) {
            if (direction === 'right' || direction === 'left') {
                return this.bodies[0];
            }
            else{
                return this.bodies[1];
            }
        }
        else {
            if (direction === 'right' || direction === 'left') {
                return this.bodies[1];
            }
            else{
                return this.bodies[0];
            }
        }
    }
    spawn() {
        super.spawn(); 
    }
    update(deltaTime) {
        if (!this.contraption.Ai) {
            console.log(this.hitPoints);
        }
        if (this.isColliding.length > 0) {
            // deal damage times delta time
            this.damage(deltaTime * 0.03);
        }
        // if this too far down, destroy it
        if (this.bodies[0].position.y > this.contraption.killBelow && !this.destroyed) {
            this.damage(this.maxHitPoints);
        }
      }
    checkConnected() { // this block is always connected as it is the core of the vehicle
        this.blocksFromSeat = 0;
    }
    resetValues() {
        super.resetValues();
        this.destroyed = true;
    }
    hit(thisBody, otherBody) { 
        // if the other body is not in this contraption, take damage
        if (!otherBody.Block || otherBody.block.contraption !== this.contraption) {
            if (!this.isColliding.includes(otherBody)) {
                this.isColliding.push(otherBody);
            }
        }
    }
    endHit(thisBody, otherBody) {
        if (this.isColliding.includes(otherBody)) {
            this.isColliding.splice(this.isColliding.indexOf(otherBody), 1);
        }
    }
    triggerBlockDestroyed() {
        // if there are no blocks other than the seat, destroy the contraption
        for (let block of this.contraption.blocks) {
            if (block.hitPoints > 0 && block !== this) {
                return;
            }1
        }
        // if no blocks were found, destroy the contraption
        this.damage(this.maxHitPoints);
    }
}


export {
    SeatBlock
}