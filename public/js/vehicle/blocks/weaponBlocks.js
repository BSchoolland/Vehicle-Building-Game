import Block from './baseBlockClass.js';
import { LocalToWorld, WorldToLocal } from '../utils.js';

// a spike block that can damage other blocks
class SpikeBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A spike block', 100, '#3b2004', [], []);
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['right'];
        this.damageMultiplier = 10; // does 1 damage times velocity it hits at
        this.damageCooldown = 0.5; // seconds
        this.lastHit = 0; // the last time the block hit something
        // this block is not simetrical in the x direction
        this.simetricalX = false;
        this.baseDamage = 30;
        
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
    hit(thisBody, otherBody) {
        // check if this spike block is on cooldown
        if (Date.now() - this.lastHit >= this.damageCooldown * 1000) {
            // make sure the other block is in a contraption
            if (!otherBody.block) return;
            if (!otherBody.block.contraption) return;
            // make sure the other block is not a spike block
            if (otherBody.block instanceof SpikeBlock) return;
            // damage the other block
            let velocityDifference = Matter.Vector.sub(otherBody.velocity, this.bodies[0].velocity);
            
            otherBody.block.damage(this.baseDamage + this.damageMultiplier * Math.abs(velocityDifference.x + velocityDifference.y) ** 2 ); // damage is proportional to the velocity squared
            // record the time of the hit
            this.lastHit = Date.now();
            // knock both blocks back
            // find the angle between the blocks
            let angle = Matter.Vector.angle(this.bodies[0].position, otherBody.position);
            // find the distance between the blocks
            let distance = Matter.Vector.magnitude(Matter.Vector.sub(this.bodies[0].position, otherBody.position));
            // find the distance to move the blocks
            let moveDistance = (this.bodies[0].circleRadius + otherBody.circleRadius - distance) / 2;
            // add velocity to both blocks3434
            Matter.Body.setVelocity(this.bodies[0], { x: Math.cos(angle) * moveDistance , y: Math.sin(angle) * moveDistance * 0.5});
            Matter.Body.setVelocity(otherBody, { x: -Math.cos(angle) * moveDistance/2, y: -Math.sin(angle) * moveDistance});
        }
    }
}

class TNTBlock extends Block {
    constructor (x, y, contaption) {
        super(x, y, contaption, 20, 'A TNT block', 15, '#780811', [], []);
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['left', 'right', 'top', 'bottom'];
        
        // this block is not simetrical in the x direction
        this.simetricalX = false;
        this.exploded = false;
        // damage cooldown
        this.damageCooldown = 0.5; // seconds
        this.lastHit = 0; // the last time the block hit something
    }
    makeBodies() {
        // create a red square
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 50, 50, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
    }
    makeConstraints() {
        // no constraints
    }
    hit(thisBody, otherBody) {
        // this.explode();
        // damage self if not on cooldown
        if (Date.now() - this.lastHit >= this.damageCooldown * 1000) {
            // damage this block by the relative velocity of the other block
            let velocityDifference = Matter.Vector.sub(otherBody.velocity, this.bodies[0].velocity);
            this.damage(Math.abs(velocityDifference.x + velocityDifference.y) ** 2 ); // damage is proportional to the velocity squared
            console.log('damage: ' + Math.abs(velocityDifference.x + velocityDifference.y) ** 2);
            // record the time of the hit
            this.lastHit = Date.now();
        }
    }
    damage(amount) {
        console.log('damage: ' + amount);
        // subtract the amount from the hitpoints
        this.hitPoints -= amount;
        let numSparks;
        numSparks = 0;
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
            // explode the block
            this.explode();
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
    explode() {
        // if the block has already exploded, don't explode again
        if (this.exploded) return;
        this.exploded = true;
        // remove the body from the world
        const world = this.contraption.engine.world;
        let x = this.bodies[0].position.x;
        let y = this.bodies[0].position.y;
        Matter.World.remove(world, this.bodies[0]);
        // create a circle explosion
        // find all the bodies in the explosion
        let bodies = Matter.Query.region(world.bodies, Matter.Bounds.create([{ x: x - 100, y: y - 100 }, { x: x + 100, y: y + 100 }]));
        // damage all the bodies in the explosion
        bodies.forEach(body => {
            // check if the body is a block
            if (body.block) {
                // damage the block
                body.block.damage(100);
            }
        });
        // add a cluster of explosions randomly around the block
        for (var i = 0; i < 30; i++) {
            // create a circle explosion
            let explosion = Matter.Bodies.circle(x + Math.random() * 100 - 50, y + Math.random() * 100 - 50, 30 + Math.random() * 50, { render: { fillStyle: '#ff0000' }});
            // change the color by a random amount
            explosion.render.fillStyle = '#ff' + Math.floor(Math.random() * 100).toString(16) + '00';
            // make it static
            explosion.isStatic = true;
            // add the explosion to the world
            Matter.World.add(world, explosion);
            // remove the explosion after a random amount of time
            setTimeout(() => {
                Matter.World.remove(world, explosion);
            }, Math.random() * 1000);

        }
        setTimeout(() => {
            this.removeFromWorld(this.contraption.engine.world);
        }, 1000);
        
    }
    resetValues() {
        super.resetValues();
        this.exploded = false;
    }
}

export
{
    SpikeBlock,
    TNTBlock
}