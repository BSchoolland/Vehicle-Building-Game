// holds the block classes, which are used to create the blocks in the game
import { Cannonball } from "./projectiles.js";

function LocalToWorld(body, localPoint) {
    // convert local coordinates to world coordinates
    let worldPoint = Matter.Vector.add(body.position, Matter.Vector.rotate(localPoint, body.angle));
    return worldPoint;
}

function WorldToLocal(body, worldPoint) {
    // convert world coordinates to local coordinates
    let localPoint = Matter.Vector.rotate(Matter.Vector.sub(worldPoint, body.position), -body.angle);
    return localPoint;
}
// the base class for all blocks, may be made of multiple bodies and constraints depending on subclass
class Block { 
    constructor(x, y, contaption, cost, description, hitPoints, color, bodies, constraints, weldableFaces = []) {
        this.x = x; 
        this.y = y;
        this.contaption = contaption;
        this.originalX = x;
        this.originalY = y;
        this.cost = cost;
        this.description = description;
        this.hitPoints = hitPoints;
        this.color = color;
        this.bodies = bodies;
        this.constraints = constraints;
        this.weldableFaces = weldableFaces;
        this.welds = [];
        // orientation
        this.flippedX = false;
        this.simetricalX = true; // most blocks are simetrical in the x direction
    }
    reset(atOriginalPosition = true) {
        // deletes all bodies and constraints then recreates them at the original position
        this.removeFromWorld(this.contraption.engine.world);
        this.bodies = [];
        this.constraints = [];
        if (atOriginalPosition) {
            this.x = this.originalX;
            this.y = this.originalY;
        }
        this.makeBodies();
        this.makeConstraints();
        this.resetValues();
        this.addToWorld(this.contraption.engine.world);
    }
    makeBodies() {
        // will be defined in subclasses
    }
    makeConstraints() {
        // will be defined in subclasses
    }
    resetValues() {
        // will be defined in subclasses
        // called when the block is reset
    }
    update() {
        // will be defined in subclasses
        // called every frame
    }

    addToWorld(world) {
        // make all bodies static
        this.bodies.forEach(body => {
            Matter.Body.setStatic(body, true);
        });
        // add the bodies and constraints to the world
        Matter.World.add(world, this.bodies);
        Matter.World.add(world, this.constraints);
        // if the block is flipped, make sure it is still flipped
        if (this.flippedX) {
            this.flipX(false);

        }
    }
    removeFromWorld(world) {
        // remove the bodies and constraints from the world
        Matter.World.remove(world, this.bodies);
        Matter.World.remove(world, this.constraints);
        // remove the welds from the world
        this.welds.forEach(weld => {
            Matter.World.remove(world, weld);
        });
        // clear the welds array
        this.welds = [];
    }
    damage(amount) {
        // subtract the amount from the hitpoints
        this.hitPoints -= amount;
        // check if the block is destroyed
        if (this.hitPoints <= 0) {
            // flash the block red
            this.bodies.forEach(body => {
                // record the original fill style
                body.render.originalFillStyle = body.render.fillStyle;
                // set the fill style to red
                body.render.fillStyle = 'red';
            });
            // remove welds to this block across the contraption
            this.contraption.blocks.forEach(block => {
                // check if the block has welds
                if (block.welds.length > 0) {
                    // check if the weld is attached to this block
                    block.welds.forEach(weld => {
                        if (weld.bodyA === this.bodies[0] || weld.bodyB === this.bodies[0]) {
                            // remove the weld
                            Matter.World.remove(this.contraption.engine.world, weld);
                            // remove the weld from the welds array
                            block.welds.splice(block.welds.indexOf(weld), 1);
                        }
                    });
                }
            });
            // after 1 second, remove the block from the world
            setTimeout(() => {
                this.removeFromWorld(this.contraption.engine.world);
            }, 1000);
        } else {
            // flash the block red
            this.bodies.forEach(body => {
                // record the original fill style
                body.render.originalFillStyle = body.render.fillStyle;
                // set the fill style to red
                body.render.fillStyle = 'red';
            }
            );
            // set a timeout to reset the fill style
            setTimeout(() => {
                this.bodies.forEach(body => {
                    // reset the fill style
                    body.render.fillStyle = body.render.originalFillStyle;
                });
            }, 100);
            
        }
    }
    flipX(firstTime = true) {
        // make sure the block is not simetrical in the x direction
        if (this.simetricalX) {
            return;
        }
        this.bodies.forEach(body => {
            // Negate the x-coordinate of the body's position
            Matter.Body.setPosition(body, {
                x: 2 * this.x - body.position.x,
                y: body.position.y
            });
    
            // If the body has vertices (like custom shapes), flip each vertex
            if (body.vertices) {
                body.vertices.forEach(vertex => {
                    vertex.x = 2 * this.x - vertex.x;
                });
                Matter.Body.setVertices(body, body.vertices);
            }
    
            // Invert the angle to maintain the orientation
            Matter.Body.setAngle(body, -body.angle);
        });
        // flip the constraints
        this.constraints.forEach(constraint => {
            // flip pointA and pointB (X only)
            constraint.pointA.x = -constraint.pointA.x;
            constraint.pointB.x = -constraint.pointB.x;
        });

        if (firstTime) {
            // change the weldable faces, left -> right, right -> left
            if (this.weldableFaces.includes('left')) {
                this.weldableFaces[this.weldableFaces.indexOf('left')] = 'right';
            }
            else if (this.weldableFaces.includes('right')) {
                this.weldableFaces[this.weldableFaces.indexOf('right')] = 'left';
            }
            // record that the block has been flipped
            this.flippedX = !this.flippedX;
        }
    }
    // save the block to a JSON object
    save() {
        var blockJson = {};
        blockJson.type = this.constructor.name;
        blockJson.x = this.x;
        blockJson.y = this.y;
        // record if the block is flipped
        blockJson.flippedX = this.flippedX;
        return blockJson;
    }
    // make bodies movable
    makeMovable() {
        this.bodies.forEach(body => {
            Matter.Body.setStatic(body, false);
        });
    }
    // weld all bodies together
    makeWelds(){
        // search through all blocks in the contraption and weld those that meet the criteria
        // criteria: adjacent, weldable face matches
        for (var i = 0; i < this.contraption.blocks.length; i++) {
            // check if the block is adjacent
            // find the x and y distance between the two blocks
            let xDistance = (this.x - this.contraption.blocks[i].x);
            let yDistance = (this.y - this.contraption.blocks[i].y);
            // check if block is to the right
            if (xDistance === 50 && yDistance === 0) {
                // check if the weldable faces match
                if (this.weldableFaces.includes('right') && this.contraption.blocks[i].weldableFaces.includes('left')) {
                    // weld the blocks together
                    const bodyA = this.bodies[0];
                    const bodyB = this.contraption.blocks[i].bodies[0];
                    // find the pointA and pointB for the weld constraint
                    let localPointA = { x: -(bodyA.bounds.max.x - bodyA.bounds.min.x) / 2, y: 10 };
                    // turn the points into world coordinates
                    let worldPointA = LocalToWorld(bodyA, localPointA);
                    // turn world coordinates into bodyB local coordinates
                    let localPointB = WorldToLocal(bodyB, worldPointA);
                    // create a weld constraint
                    const weld = Matter.Constraint.create({
                        bodyA: bodyA,
                        bodyB:  bodyB,
                        pointA: localPointA,
                        pointB: localPointB,
                        stiffness: 1,
                        render: { 
                            visible: true
                        }
                    });
                    Matter.World.add(this.contraption.engine.world, weld);
                    // add the weld to the welds array
                    this.welds.push(weld);
                }
            }
            // check if block is to the left
            if (xDistance === -50 && yDistance === 0) {
                // check if the weldable faces match
                if (this.weldableFaces.includes('left') && this.contraption.blocks[i].weldableFaces.includes('right')) {
                    // weld the blocks together
                    const bodyA = this.bodies[0];
                    const bodyB = this.contraption.blocks[i].bodies[0];
                    // find the pointA and pointB for the weld constraint
                    let localPointA = { x: (bodyA.bounds.max.x - bodyA.bounds.min.x) / 2, y: -10 };
                    // turn the points into world coordinates
                    let worldPointA = LocalToWorld(bodyA, localPointA);
                    // turn world coordinates into bodyB local coordinates
                    let localPointB = WorldToLocal(bodyB, worldPointA);
                    // create a weld constraint
                    const weld = Matter.Constraint.create({
                        bodyA: bodyA,
                        bodyB:  bodyB,
                        pointA: localPointA,
                        pointB: localPointB,
                        stiffness: 1,
                        render: {
                            visible: true
                        }
                    });
                    Matter.World.add(this.contraption.engine.world, weld);
                    // add the weld to the welds array
                    this.welds.push(weld);
                }
            }
            // check if block is above
            if (xDistance === 0 && yDistance === 50) {
                // check if the weldable faces match
                if (this.weldableFaces.includes('top') && this.contraption.blocks[i].weldableFaces.includes('bottom')) {
                    // weld the blocks together
                    const bodyA = this.bodies[0];
                    const bodyB = this.contraption.blocks[i].bodies[0];
                    // find the pointA and pointB for the weld constraint
                    let localPointA = { x: 10, y: -(bodyA.bounds.max.y - bodyA.bounds.min.y) / 2 };
                    // turn the points into world coordinates
                    let worldPointA = LocalToWorld(bodyA, localPointA);
                    // turn world coordinates into bodyB local coordinates
                    let localPointB = WorldToLocal(bodyB, worldPointA);
                    // create a weld constraint
                    const weld = Matter.Constraint.create({
                        bodyA: bodyA,
                        bodyB:  bodyB,
                        pointA: localPointA,
                        pointB: localPointB,
                        stiffness: 1,
                        render: {
                            visible: true
                        }
                    });
                    Matter.World.add(this.contraption.engine.world, weld);
                    // add the weld to the welds array
                    this.welds.push(weld);
                }
            }
            // check if block is below
            if (xDistance === 0 && yDistance === -50) {
                // check if the weldable faces match
                if (this.weldableFaces.includes('bottom') && this.contraption.blocks[i].weldableFaces.includes('top')) {
                    // weld the blocks together
                    const bodyA = this.bodies[0];
                    const bodyB = this.contraption.blocks[i].bodies[0];
                    // find the pointA and pointB for the weld constraint
                    let localPointA = { x: -10, y: (bodyA.bounds.max.y - bodyA.bounds.min.y) / 2 };
                    // turn the points into world coordinates
                    let worldPointA = LocalToWorld(bodyA, localPointA);
                    // turn world coordinates into bodyB local coordinates
                    let localPointB = WorldToLocal(bodyB, worldPointA);
                    // create a weld constraint
                    const weld = Matter.Constraint.create({
                        bodyA: bodyA,
                        bodyB:  bodyB,
                        pointA: localPointA,
                        pointB: localPointB,
                        stiffness: 1,
                        render: {
                            visible: true
                        }
                    });
                    Matter.World.add(this.contraption.engine.world, weld);
                    // add the weld to the welds array
                    this.welds.push(weld);
                }
            }
        }
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

// a spike block that can damage other blocks
class SpikeBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A spike block', 100, '#3b2004', [], []);
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['right'];
        this.damageMultiplier = 1; // does 1 damage times velocity it hits at
        this.damageCooldown = 0.5; // seconds
        this.lastHit = 0; // the last time the block hit something
        // this block is not simetrical in the x direction
        this.simetricalX = false;
        const Events = Matter.Events;
        // watch for collisions
        Events.on(this.contaption.engine, 'collisionStart', event => {
            event.pairs.forEach(pair => {
                // Check if one of the bodies is bodyA
                if (pair.bodyA === this.bodies[0] || pair.bodyB === this.bodies[0]) {
                    // Remove the other body
                    const otherBody = pair.bodyA === this.bodies[0] ? pair.bodyB : pair.bodyA;
                    this.hit(otherBody);
                }
            });
        });
    }
    makeBodies() {
        // create a triangle
        let vertices ='0 0 50 25 0 50';
        this.bodies.push(Matter.Bodies.fromVertices(this.x - 33.333/4, this.y, Matter.Vertices.fromPath(vertices), { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
    }
    makeConstraints() {
        // no constraints
    }
    hit(otherBody) {
        // check if the other body is a block
        if (otherBody.block) {
            // make sure the block is not within the same contraption
            if (otherBody.block.contraption !== this.contraption) {
                // check if this spike block is on cooldown
                if (Date.now() - this.lastHit >= this.damageCooldown * 1000) {
                    // damage the other block
                    let velocityDifference = Matter.Vector.sub(otherBody.velocity, this.bodies[0].velocity);
                    otherBody.block.damage(this.damageMultiplier * Math.abs(velocityDifference.x + velocityDifference.y) ** 2 ); // damage is proportional to the velocity squared
                    // record the time of the hit
                    this.lastHit = Date.now();
                }
            }
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
export { BasicBlock, WheelBlock, rocketBoosterBlock, SpikeBlock };