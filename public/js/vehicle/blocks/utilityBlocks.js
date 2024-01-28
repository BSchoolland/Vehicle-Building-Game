import Block from './baseBlockClass.js';
import { LocalToWorld, WorldToLocal, constrainBodyToBody } from '../utils.js';

// a grappling hook block that can grab onto other blocks, and reel them in
class GrappleBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A grappling hook block', 100, '#3b2004', [], []);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['right', 'bottom'];
        this.maxRopeLength = 500;  // Maximum length of the rope
        this.currentRopeLength = 0;  // Current length of the rope
        this.ropeStiffness = 0.000001;  // Initial low stiffness
        this.rope = null;
        this.readyToHook = false;
        this.readyToShoot = true;
        this.rope = null;
        this.ropeSqrMaxLength = this.maxRopeLength * this.maxRopeLength;  // Squared length for performance
        this.currentSquareLength = 0;
        this.simetricalX = false;
        this.hookWelds = []; // welds between the hook and the block it is attached to
        this.grappleConstraint = null;
        this.grappleAimConstraint = null;
        // by default, the activation key is 'r' and the reverse activation key is 'f'
        this.activationKey = 'r';
        this.reverseActivationKey = 'f';
    }
    makeBodies(){
        // create a flat surface on the left side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x-20, this.y, 10, 50, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
        // create a flat surface on the bottom side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x + 5, this.y+20, 40, 10, { render: { fillStyle: this.color }}));
        this.bodies[1].block = this;
        // create a triangle on the right side of the block as the grappling hook
        let vertices ='50 20 15 36 15 4';
        this.bodies.push(Matter.Bodies.fromVertices(this.x+10, this.y, Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.secondaryColor }}));
        this.bodies[2].block = this;
        // a rectangle for the joint
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 30, 10, { render: { fillStyle: this.secondaryColor }}));
        this.bodies[3].collisionFilter = { mask: 0x0002 };
        this.bodies[3].block = this;
    }
    makeConstraints(){
        // constrain the joint and the grappling hook, allowing rotation
        this.grappleConstraint = (Matter.Constraint.create({
            bodyA: this.bodies[2], // the grappling hook
            bodyB: this.bodies[3], // the joint
            pointA: { x: -10, y: 0 },
            pointB: { x: 0, y: 0 },
            stiffness: 1,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
        // a constraint between the grappling hook and the joint, limiting rotation
        this.grappleAimConstraint = (Matter.Constraint.create({
            bodyA: this.bodies[2], // the grappling hook
            bodyB: this.bodies[3], // the joint
            pointA: { x: 10, y: 0 },
            pointB: { x: 10, y: 0 },
            stiffness: 0.1,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
        // add the constraints to the block
        this.constraints.push(this.grappleConstraint);
        this.constraints.push(this.grappleAimConstraint);

        // constrain the joint and the flat surface rigidly using constrainBodyToBody
        let bodyA = this.bodies[0];
        let bodyB = this.bodies[3];
        let constraints = constrainBodyToBody(bodyA, bodyB);
        this.constraints.push(...constraints);
        // constrain the left side and the bottom side of the block rigidly using constrainBodyToBody
        bodyA = this.bodies[0];
        bodyB = this.bodies[1];
        constraints = constrainBodyToBody(bodyA, bodyB);
        this.constraints.push(...constraints);
    }
    update() { // shoot the grappling hook, or reel it in
        super.update();
        // check if the right mouse button is pressed
        if (this.contraption.keysPressed[this.activationKey]) {
            this.shootGrapplingHook();
        }
        if (this.contraption.keysPressed[this.reverseActivationKey]) {
            this.reelGrapple();
        }
    }
    shootGrapplingHook() {
        if (!this.readyToShoot) {
            return;
        }
        this.readyToShoot = false;
        // shoot the grappling hook forward

        // make the grappling constraints weak
        this.grappleConstraint.stiffness = 0;
        this.grappleAimConstraint.stiffness = 0;
        // set the rope length to the maximum
        this.currentRopeLength = this.maxRopeLength;
        this.currentSquareLength = this.ropeSqrMaxLength;
        // Add a rope constraint between the grappling hook and the joint
        this.rope = Matter.Constraint.create({
            bodyA: this.bodies[2], // the grappling hook
            bodyB: this.bodies[3], // the joint
            pointA: { x: 10, y: 0 },
            pointB: { x: 10, y: 0 },
            stiffness: this.ropeStiffness,
            length: this.currentRopeLength,
            render: {
                visible: true,
                lineWidth: 5
            }
        });

        // Add the rope to the world
        Matter.World.add(this.contraption.engine.world, this.rope);

        // Event listener for dynamic rope adjustment
        Matter.Events.on(this.contraption.engine, 'afterUpdate', this.adjustRopeStiffness);

        // apply a force to the grappling hook
        Matter.Body.applyForce(this.bodies[2], this.bodies[2].position, Matter.Vector.mult(Matter.Vector.normalise(Matter.Vector.sub(this.bodies[2].position, this.bodies[0].position)), 0.05));
        // make the hook able to grab onto blocks
        this.readyToHook = true;
    }
    reelGrapple() { // shorten the rope
        // check if the rope exists
        if (this.rope === null) {
            return;
        }
        // decrease the rope length
        let sqrDistance = (this.bodies[2].position.x - this.bodies[3].position.x) ** 2 +
                          (this.bodies[2].position.y - this.bodies[3].position.y) ** 2;
        
        let LengthA = Math.sqrt(sqrDistance) - 3;
        let LengthB = this.rope.length - 3;
        let newLength = Math.min(LengthA, LengthB);
        this.currentRopeLength = newLength;
        this.currentSquareLength = newLength * newLength;
        // update the rope constraint
        this.rope.length = newLength;
        // check if the rope is too short
        if (this.rope.length <= 0) {
            // reset the values (destroying the rope)
            this.resetValues();
        }
    }
    hit(thisBody, otherBody) {
        if (!this.readyToHook) {
            return;
        }
        // if the grappling hook is this body
        if (thisBody === this.bodies[2]) {
            // if the other body is not in this contraption
            // check if the other body is a block
            if (otherBody.block !== undefined) {
                if (otherBody.block.contaption !== this.contraption) { 
                    // create a weld constraint between the grappling hook and the other body
                    const weld = Matter.Constraint.create({
                        bodyA: this.bodies[2],
                        bodyB: otherBody,
                        pointA: { x: 10, y: 0 },
                        pointB: { x: 0, y: 0 },
                        stiffness: 0.5,
                        render: {
                            visible: false
                        }
                    });
                    // add the weld to the welds array
                    this.hookWelds.push(weld);
                    // add the weld to the world
                    Matter.World.add(this.contraption.engine.world, weld);
                    // after 0.1 seconds, make the hook unable to grab onto blocks
                    setTimeout(() => {
                        this.readyToHook = false;
                    }, 500);
                }
            }
        }
    }
    destroyRope = () => {
        // Remove the event handler and the rope
        try {
            const engine = this.contraption.engine;
            Matter.Events.off(engine, 'afterUpdate', this.adjustRopeStiffness);
            Matter.World.remove(engine.world, this.rope);
            // destroy the welds between the hook and the block it is attached to
            this.hookWelds.forEach(weld => {
                Matter.World.remove(engine.world, weld);
            });
            this.hookWelds = [];
        } catch (error) {
            console.log(error);
        }
    };

    adjustRopeStiffness = () => {
        let sqrDistance = (this.bodies[2].position.x - this.bodies[3].position.x) ** 2 +
                          (this.bodies[2].position.y - this.bodies[3].position.y) ** 2;
        if (sqrDistance > this.currentSquareLength) {
            this.rope.stiffness = 0.1;  // Make rope stiff
        } else {
            this.rope.stiffness = this.ropeStiffness;  // Keep rope loose
        }
    };
    calculateDistance(bodyA, bodyB) {
        const dx = bodyA.position.x - bodyB.position.x;
        const dy = bodyA.position.y - bodyB.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    resetValues() {
        this.destroyRope();
        this.readyToShoot = true;
        // set the stiffness of grapple constraints back to their original values
        this.grappleConstraint.stiffness = 1;
        this.grappleAimConstraint.stiffness = 0.1;
        // make the hook unable to grab onto blocks
        this.readyToHook = false;
    }
}

// a powered hinge block that can rotate.
class PoweredHingeBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A powered hinge block', 100, '#3b2004', [], []);
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

// an unpowered hinge block that can rotate freely.
class UnpoweredHingeBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A powered hinge block', 100, '#3b2004', [], []);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['right', 'left'];
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

// a remote block that can be used to allow disconnected blocks to remain connected
class RemoteBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A remote block', 100, '#3b2004', [], []);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['top', 'bottom'];
        // by default, the activation key is 'x' 
        this.activationKey = 'x';
        this.activated = false;
    }
    makeBodies(){
        // create a flat surface on the bottom side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y+20, 40, 10, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
        // create a flat surface on the top side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y-20, 40, 10, { render: { fillStyle: this.color }}));
        this.bodies[1].block = this;
        // create a rectangle in the center of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 30, 10, { render: { fillStyle: this.secondaryColor }}));
        this.bodies[2].block = this;
    }
    makeConstraints(){
        // constrain the top side and the center of the block rigidly using constrainBodyToBody
        let bodyA = this.bodies[1];
        let bodyB = this.bodies[2];
        let constraints = constrainBodyToBody(bodyA, bodyB);
        this.constraints.push(...constraints);
        // constrain the bottom side and the center of the block rigidly using constrainBodyToBody
        bodyA = this.bodies[0];
        bodyB = this.bodies[2];
        constraints = constrainBodyToBody(bodyA, bodyB);
        this.constraints.push(...constraints);
    }
    update() { // activate the remote block
        super.update();
        // check if the activation key is pressed
        if (this.contraption.keysPressed[this.activationKey] && !this.activated) {
            this.activated = true;
            this.activate();
        }
    }
    getWeldBody(direction = 'top') { // this is redefining the function from the base class
        if (direction === 'top') {
            return this.bodies[1];
        } else if (direction === 'bottom') {
            return this.bodies[0];
        }
    }
    activate() {
        // break the constraints between the top side and the center of the block
        console.log('activated');
        Matter.World.remove(this.contraption.engine.world, this.constraints[0]);
        Matter.World.remove(this.contraption.engine.world, this.constraints[1]);
    }
    resetValues() {
        super.resetValues();
        this.activated = false;
    }
}

export
{
    GrappleBlock,
    PoweredHingeBlock,
    UnpoweredHingeBlock,
    RemoteBlock
}