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
        // constrain the joint and the flat surface rigidly using two constraints
        let bodyA = this.bodies[0];
        let bodyB = this.bodies[3];
        let localPointA = { x: -(bodyA.bounds.max.x - bodyA.bounds.min.x) / 2, y: 10 };
        // turn the points into world coordinates
        let worldPointA = LocalToWorld(bodyA, localPointA);
        // turn world coordinates into bodyB local coordinates
        let localPointB = WorldToLocal(bodyB, worldPointA);
        // constraint 0
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the flat surface
            bodyB: this.bodies[3], // the joint
            pointA: localPointA,
            pointB: localPointB,
            stiffness: 0.5,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
        // 
        localPointA = { x: -(bodyA.bounds.max.x - bodyA.bounds.min.x) / 2, y: -10 };
        // turn the points into world coordinates
        worldPointA = LocalToWorld(bodyA, localPointA);
        // turn world coordinates into bodyB local coordinates
        localPointB = WorldToLocal(bodyB, worldPointA);
        // constraint 1
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the flat surface
            bodyB: this.bodies[3], // the joint
            pointA: localPointA,
            pointB: localPointB,
            stiffness: 0.5,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
        // constrain the joint and the grappling hook, allowing rotation (constraint 2)
        this.constraints.push(Matter.Constraint.create({
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
        // constrain the left flat surface and the bottom flat surface, making a right angle (constraint 3)
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the left flat surface
            bodyB: this.bodies[1], // the bottom flat surface
            pointA: { x: 5, y: 20 },
            pointB: { x: -20, y: 0 },
            stiffness: 1,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
        // constraint 4 
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the left flat surface
            bodyB: this.bodies[1], // the bottom flat surface
            pointA: { x: 45, y: 20 },
            pointB: { x: 20, y: 0 },
            stiffness: 1,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
        // a weak constraint between the joint and the grappling hook (constraint 5)
        this.constraints.push(Matter.Constraint.create({
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
    }
    update() { // shoot the grappling hook, or reel it in
        // check if the right mouse button is pressed
        if (this.contraption.keysPressed['r']) {
            this.shootGrapplingHook();
        }
        if (this.contraption.keysPressed['f']) {
            this.reelGrapple();
        }
    }
    shootGrapplingHook() {
        if (!this.readyToShoot) {
            return;
        }
        this.readyToShoot = false;
        // shoot the grappling hook forward

        // make constraints 2, 4, and 5 infinitely weak
        this.constraints[2].stiffness = 0;
        this.constraints[4].stiffness = 0;
        this.constraints[5].stiffness = 0;
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
        
        let LengthA = Math.sqrt(sqrDistance) - 1;
        let LengthB = this.rope.length - 1;
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
                            visible: true
                        }
                    });
                    // add the weld to the welds array
                    this.hookWelds.push(weld);
                    // add the weld to the world
                    Matter.World.add(this.contraption.engine.world, weld);
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
        // set the stiffness of constraints 2, 4, and 5 back to their original values
        this.constraints[2].stiffness = 1;
        this.constraints[4].stiffness = 1;
        this.constraints[5].stiffness = 0.1;
        // make the hook unable to grab onto blocks
        this.readyToHook = false;
    }
}

export
{
    GrappleBlock
}