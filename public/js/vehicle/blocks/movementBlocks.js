import Block from './baseBlockClass.js';
import { LocalToWorld, WorldToLocal } from '../utils.js';
// a wheel block with suspension
class WheelBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A wheel block', 100, '#3b2004', [], []);
        this.secondaryColor = '#3d3d3d';
        this.stiffness = 0.3;
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['top'];
        this.touchingGround = false;
        this.spinSpeed = 0.5;
        this.acceleration = 0.15;

        // this block is not simetrical in the x direction
        this.simetricalX = false;
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
    }   
    update() {
        // drive
        let targetVelocity = this.spinSpeed;
        if (this.flippedX) {
            targetVelocity = -targetVelocity;
        }
        if (this.contraption.keysPressed['a']) {
            targetVelocity = -targetVelocity;
            let currentVelocity = this.bodies[1].angularVelocity;
            let velocityChange = (targetVelocity - currentVelocity) * this.acceleration;
            let spin = velocityChange + currentVelocity;
            Matter.Body.setAngularVelocity(this.bodies[1], spin);
        } else if (this.contraption.keysPressed['d']) {
            // apply a force to the right
            let currentVelocity = this.bodies[1].angularVelocity;
            let velocityChange = (targetVelocity - currentVelocity) * this.acceleration;
            let spin = velocityChange + currentVelocity;
            Matter.Body.setAngularVelocity(this.bodies[1], spin);
        }
        
    }   
}



// a rocket booster block that can propel the contraption
class rocketBoosterBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A rocket booster block', 100, '#3b2004', [], []);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['left'];
        this.thrust = 0.015;
        this.fuel = -1; 
        this.resetValues(); // set the fuel to max

        // this block is not simetrical in the x direction
        this.simetricalX = false;
    }
    makeBodies() {
        // create a flat surface on the right side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x+20, this.y, 10, 50, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
        // create a triangle on the left side of the block as the rocket nozzle
        let vertices ='50 25 15 46 15 4';
        this.bodies.push(Matter.Bodies.fromVertices(this.x-10, this.y, Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.secondaryColor }}));
        this.bodies[1].block = this;
        // make the rocket nozzle unable to collide with other blocks
        this.bodies[1].collisionFilter = { mask: 0x0002 };
        // a rectangle for the joint
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 30, 20, { render: { fillStyle: this.secondaryColor }}));
        this.bodies[2].block = this;
    }
    makeConstraints() {
        // constrain the joint and the flat surface rigidly using two constraints
        let bodyA = this.bodies[0];
        let bodyB = this.bodies[2];
        let localPointA = { x: -(bodyA.bounds.max.x - bodyA.bounds.min.x) / 2, y: 10 };
        // turn the points into world coordinates
        let worldPointA = LocalToWorld(bodyA, localPointA);
        // turn world coordinates into bodyB local coordinates
        let localPointB = WorldToLocal(bodyB, worldPointA);
        // first constraint
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the flat surface
            bodyB: this.bodies[2], // the joint
            pointA: localPointA,
            pointB: localPointB,
            stiffness: 0.5,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
        // second constraint
        localPointA = { x: -(bodyA.bounds.max.x - bodyA.bounds.min.x) / 2, y: -10 };
        // turn the points into world coordinates
        worldPointA = LocalToWorld(bodyA, localPointA);
        // turn world coordinates into bodyB local coordinates
        localPointB = WorldToLocal(bodyB, worldPointA);

        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[0], // the flat surface
            bodyB: this.bodies[2], // the joint
            pointA: localPointA,
            pointB: localPointB,
            stiffness: 0.5,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
        // constrain the joint and the rocket nozzle, allowing rotation
        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[1], // the rocket nozzle
            bodyB: this.bodies[2], // the joint
            pointA: { x: 10, y: 0 },
            pointB: { x: 0, y: 0 },
            stiffness: 1,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));

        this.constraints.push(Matter.Constraint.create({
            bodyA: this.bodies[1], // the rocket nozzle
            bodyB: this.bodies[2], // the joint
            pointA: { x: 20, y: 0 },
            pointB: { x: 10, y: 0 },
            stiffness: 0.3,
            length: 0,
            // invisible
            render: {
                visible: false
            }
        }));
    }
    resetValues() {
        this.fuel = 300;
    }
    update() {
        // check if the rocket has fuel and the shift key is pressed
        if (this.contraption.keysPressed['Shift'] && this.fuel > 0) {
            // decrease the fuel
            this.fuel--;
            // apply a force to the rocket nozzle

            Matter.Body.applyForce(this.bodies[1], this.bodies[1].position, Matter.Vector.mult(Matter.Vector.normalise(Matter.Vector.sub(this.bodies[0].position, this.bodies[1].position)), this.thrust));

            // make a flame
            let flame = Matter.Bodies.rectangle(this.bodies[1].position.x, this.bodies[1].position.y, 10, 10, { render: { fillStyle: '#ff0000' }});
            // change the color by a random amount
            flame.render.fillStyle = '#ff' + Math.floor(Math.random() * 100).toString(16) + '00';
            // make the flame unable to collide with other blocks
            flame.collisionFilter = { mask: 0x0002 };

            // add the flame to the world
            Matter.World.add(this.contraption.engine.world, flame);
            // remove the flame after 0.1 seconds 
            setTimeout(() => {
                Matter.World.remove(this.contraption.engine.world, flame);
            }, 100);      
        }
    }
}


export {
    WheelBlock,
    rocketBoosterBlock
}