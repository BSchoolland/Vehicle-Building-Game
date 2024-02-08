import Block from '../../baseBlockClass.js';
import { playSound } from '../../../../sounds/playSound.js';

class TNTBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A TNT block', 15, '#780811', [], [], ['left', 'right', 'top', 'bottom']);
        this.makeBodies();
        this.makeConstraints();

        
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
        playSound('blockTakesDamage');
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
        // play the explosion sound
        playSound('explosion');
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
                // make sure the body is not an invincible part of the block
                if (body.block.invincipleParts && body.block.invincipleParts.includes(body)) {
                    return;
                }
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


export {
    TNTBlock
}