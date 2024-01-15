import { LocalToWorld, WorldToLocal } from '../utils.js';

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
    makeInvisible() { // make all bodies and constraints invisible
        this.bodies.forEach(body => {
            body.render.visible = false;
        });
        this.constraints.forEach(constraint => {
            constraint.render.visible = false;
        });
        console.log('made invisible');
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
        let numSparks;
        if (amount > 200){
            numSparks = 200;
        }
        else {
            numSparks = amount;
        }
        // add a shower of sparks
        for (var i = 0; i < numSparks; i++) {
            // create a spark with a random position and velocity
            let spark = Matter.Bodies.circle(this.bodies[0].position.x + Math.random() * 10 - 5, this.bodies[0].position.y + Math.random() * 10 - 5, 2, { render: { fillStyle: '#ff0000' }});
            Matter.Body.setVelocity(spark, { x: Math.random() * 10 - 5, y: Math.random() * 10 - 10});
            // change the color by a random amount
            spark.render.fillStyle = '#ff' + Math.floor(Math.random() * 100).toString(16) + '00';
            // make the spark unable to collide with other blocks
            spark.collisionFilter = { mask: 0x0002 };
            // add the spark to the world
            Matter.World.add(this.contraption.engine.world, spark);
            // remove the spark after 1 second
            setTimeout(() => {
                Matter.World.remove(this.contraption.engine.world, spark);
            }, 1000);
        }
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
            // give a bit of upward velocity to the block
            Matter.Body.setVelocity(this.bodies[0], { x: 0, y: -5 });
            // after 1 second, remove the block from the world
            setTimeout(() => {
                this.removeFromWorld(this.contraption.engine.world);
            }, 200);
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
    hit(thisBody, otherBody) { // to be defined in subclasses
        // called when the block is hit by another body
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

export default Block;