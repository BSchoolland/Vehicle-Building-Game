import Block from '../../baseBlockClass.js';
import { constrainBodyToBody } from '../../../utils.js';
import { playSound } from '../../../../sounds/playSound.js';
import { rotateBodyAroundPoint } from '../../../utils.js';

// a grappling hook block that can grab onto other blocks, and reel them in
class GrappleBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A grappling hook block', 100, '#3b2004', [], [], ['right', 'bottom']);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.maxRopeLength = 700;  // Maximum length of the rope
        this.currentRopeLength = 0;  // Current length of the rope
        this.ropeStiffness = 0.000001;  // Initial low stiffness
        this.rope = null;
        this.readyToHook = false;
        this.readyToShoot = true;
        this.ropeSqrMaxLength = this.maxRopeLength * this.maxRopeLength;  // Squared length for performance
        this.currentSquareLength = 0;
        this.simetricalX = false;
        this.hookWelds = []; // welds between the hook and the block it is attached to
        this.grappleConstraint = null;
        this.grappleAimConstraint = null;
        // by default, the activation key is 'r' and the reverse activation key is 'f'
        this.activationKey = 'r';
        this.reverseActivationKey = 'f';
        this.firing = false;
        this.hasDamagedBlock = false
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
        this.invincibleParts.push(this.bodies[2]);
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
        // as long as health is not 0
        if (this.hitPoints <= 0) {
            return;
        }
        // if any of the bodies the hookwelds are connected to are destroyed, destroy the welds
        this.hookWelds.forEach(weld => {
            if (weld.bodyA.block.hitPoints <= 0 || weld.bodyB.block.hitPoints <= 0) {
                Matter.World.remove(this.contraption.engine.world, weld);
            }
        });

        // check if the right mouse button is pressed
        if (this.contraption.keysPressed[this.activationKey]) {
            this.shootGrapplingHook();
        } else {
            this.firing = false;
        }
        if (this.contraption.keysPressed[this.reverseActivationKey]) {
            // unused for now
            // this.reelGrapple();
        }
    }
    shootGrapplingHook() {
        if (this.firing) {
            return;
        }
        this.firing = true;

        if (!this.readyToShoot) {
            this.resetRope();
            return;
        }
        this.readyToShoot = false;
        // play the grappling hook sound
        playSound('grappleFire');
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
        else{
            // play the reel sound
            playSound('grappleReel');
        }
    }
    reset(atOriginalPosition = true) {
        // remove the rope
        this.destroyRope();
        super.reset(atOriginalPosition);
    }
    hit(thisBody, otherBody) {
        if (!this.readyToHook) {
            return;
        }
        // if the grappling hook is this body
        if (thisBody === this.bodies[2]) {
            this.reelGrapple();

            // if the other body is not in this contraption
            // check if the other body is a block
            if (otherBody.block === "ground") {
                // make the hook static
                Matter.Body.setStatic(this.bodies[2], true);
                this.readyToHook = false;
            }
            else if (otherBody.block !== undefined) {
                if (otherBody.block.contraption !== this.contraption) { 
                    // damage the other block (if it's not invincible)
                    if (otherBody.block.invincibleParts && otherBody.block.invincibleParts.includes(otherBody)) {
                        // do nothing
                    } else if (!this.hasDamagedBlock) {
                        this.hasDamagedBlock = true;
                        otherBody.block.damage(75);
                    } 

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
        super.resetValues();
        this.destroyRope();
        this.readyToShoot = true;
        // set the stiffness of grapple constraints back to their original values
        this.grappleConstraint.stiffness = 1;
        this.grappleAimConstraint.stiffness = 0.1;
        // make the hook unable to grab onto blocks
        this.readyToHook = false;
        this.hasDamagedBlock = false;
    }
    async resetRope() {
        this.readyToHook = false;
        this.destroyRope();
        // make the hook not static
        // destroy the welds between the hook and the block it is attached to
        this.hookWelds.forEach(weld => {
            Matter.World.remove(this.contraption.engine.world, weld);
        });
        this.hookWelds = [];
        // bring the grappling hook back to the block
        let x = this.bodies[3].position.x;
        let y = this.bodies[3].position.y;
        // delete the constraints from the array
        this.constraints = this.constraints.filter(constraint => constraint !== this.grappleConstraint);
        this.constraints = this.constraints.filter(constraint => constraint !== this.grappleAimConstraint);
        // delete body 2 and create a new one
        Matter.World.remove(this.contraption.engine.world, this.bodies[2]);
        let vertices ='50 20 15 36 15 4';
        this.bodies[2] = Matter.Bodies.fromVertices(x, y, Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.secondaryColor }});
        // for each rotatedTimes, rotate the body 90 degrees
        for (let i = 0; i < this.rotatedTimes; i++) {
            rotateBodyAroundPoint(this.bodies[2], { x: x, y: y }, 90);
        }
        // update the hook constraints with the new body
        this.grappleConstraint.bodyA = this.bodies[2];
        this.grappleAimConstraint.bodyA = this.bodies[2];
        
        this.bodies[2].block = this;
        // set velocity to whatever [3]'s velocity is
        Matter.Body.setVelocity(this.bodies[2], this.bodies[3].velocity);

        this.invincibleParts.push(this.bodies[2]);

        Matter.World.add(this.contraption.engine.world, this.bodies[2]);
        
        setTimeout(() => {
            this.resetValues();     
        }, 5);
        return;
    }
    damage(damage) {
        super.damage(damage);
        if (this.hitPoints <= 0) {
            this.destroyRope();
        }
    }
}

export {
    GrappleBlock
}