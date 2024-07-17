import Block from '../../baseBlockClass.js';
import { playSound } from '../../../../sounds/playSound.js';

class TNTBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A TNT block', 15, '#780811', [], [], ['left', 'right', 'top', 'bottom']);
        this.makeBodies();
        this.makeConstraints();

        this.simetricalX = true;
        this.exploded = false;
        this.blastRadius = 300; // the radius of the explosion
        this.blastDamage = 200; // the damage of the explosion
        this.blastForce = 15; // the force of the explosion
        // damage cooldown
        this.damageCooldown = 0.5; // seconds
        this.lastHit = 0; // the last time the block hit something
    }
    makeBodies() {
        // create a red square
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 50, 50, { render: { strokeStyle: '#ffffff', sprite: { texture: './img/textures/tnt.png' }}}));
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
            this.damage(Math.abs(velocityDifference.x + velocityDifference.y) ** 2 + 3 ); // damage is proportional to the velocity squared
            console.log('damage: ' + Math.abs(velocityDifference.x + velocityDifference.y) ** 2);
            // record the time of the hit
            this.lastHit = Date.now();
        }
        // if the other body is a member of a contraption, and the contraption is not the same as this block's contraption, explode
        if (otherBody.block.contraption && otherBody.block.contraption !== this.contraption) {
            // damage the block for it's remaining hitpoints
            this.damage(this.hitPoints);
        }
    }
    damage(amount) {
        playSound('blockTakesDamage');
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
        let bodies = this.getObjectsInExplosion();
        // damage all the bodies in the explosion
        bodies.forEach(body => {
            // check if the body is a block
            if (body.block) {
                // make sure the body is not an invincible part of the block
                if (body.block.invincibleParts && body.block.invincibleParts.includes(body)) {
                    return;
                }
                // damage the block
                if (body.block.damage) {
                    const damageReduction = 1 - body.distanceFromExplosion / this.blastRadius;
                    if (damageReduction < 0) return;
                    body.block.damage(this.blastDamage * damageReduction);
                    // set the block's velocity to the explosion force
                    Matter.Body.setVelocity(body, { x: (body.position.x - x) * this.blastForce / body.distanceFromExplosion, y: (body.position.y - y) * this.blastForce / body.distanceFromExplosion });
                }
            }
        });
        // add a cluster of explosions randomly around the block
        for (var i = 0; i < 30; i++) {
            let blastFactor = this.blastRadius * 0.66;
            // create a circle explosion
            let explosion = Matter.Bodies.circle(x + Math.random() * blastFactor - blastFactor/2, y + Math.random() * blastFactor - blastFactor/2, 30 + Math.random() * blastFactor/2, { render: { fillStyle: '#ff0000' }});
            // change the color by a random amount
            explosion.render.fillStyle = '#ff' + Math.floor(Math.random() * 100).toString(16) + '00';
            // make it static
            explosion.isStatic = true;
            // make the explosion unable to collide with other blocks
            explosion.collisionFilter = { mask: 0x0002 };
            // add the explosion to the world
            Matter.World.add(world, explosion);
            // remove the explosion after a random amount of time
            setTimeout(() => {
                Matter.World.remove(world, explosion);
            }, Math.random() * 1000);
        }
    }
    getObjectsInExplosion() {
        // find all the bodies in the explosion
        let bodies = Matter.Query.region(this.contraption.engine.world.bodies, Matter.Bounds.create([{ x: this.bodies[0].position.x - this.blastRadius, y: this.bodies[0].position.y - this.blastRadius }, { x: this.bodies[0].position.x + this.blastRadius, y: this.bodies[0].position.y + this.blastRadius }]));
        // add the distance from the explosion to each body
        bodies.forEach(body => {
            body.distanceFromExplosion = Matter.Vector.magnitude(Matter.Vector.sub(body.position, this.bodies[0].position));
        });
        // if the distance is greater than the blast radius, remove the body
        bodies = bodies.filter(body => body.distanceFromExplosion <= this.blastRadius);
        return bodies;
    }
    resetValues() {
        super.resetValues();
        this.exploded = false;
    }
}

class knockBackBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A Block that deals high knock back', 15, '#780811', [], [], ['left', 'right', 'top', 'bottom']);
        this.makeBodies();
        this.makeConstraints();

        this.simetricalX = true;
        this.exploded = false;
        this.blastRadius = 300; // the radius of the explosion
        this.blastDamage = 5; // the damage of the explosion
        this.blastForce = 30; // the force of the explosion
        // damage cooldown
        this.damageCooldown = 0.5; // seconds
        this.lastHit = 0; // the last time the block hit something
    }
    makeBodies() {
        // create a red square
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 50, 50, { render: { strokeStyle: '#ffffff', sprite: { texture: './img/textures/knockback.png' }}}));
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
            this.damage(Math.abs(velocityDifference.x + velocityDifference.y) ** 2 + 3 ); // damage is proportional to the velocity squared
            console.log('damage: ' + Math.abs(velocityDifference.x + velocityDifference.y) ** 2);
            // record the time of the hit
            this.lastHit = Date.now();
        }
        // if the other body is a member of a contraption, and the contraption is not the same as this block's contraption, explode
        if (otherBody.block.contraption && otherBody.block.contraption !== this.contraption) {
            // damage the block for it's remaining hitpoints
            this.damage(this.hitPoints);
        }
    }
    damage(amount) {
        playSound('blockTakesDamage');
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
        let bodies = this.getObjectsInExplosion();
        // damage all the bodies in the explosion
        bodies.forEach(body => {
            // check if the body is a block
            if (body.block) {
                // make sure the body is not an invincible part of the block
                if (body.block.invincibleParts && body.block.invincibleParts.includes(body)) {
                    return;
                }
                // damage the block
                if (body.block.damage) {
                    const damageReduction = 1 - body.distanceFromExplosion / this.blastRadius;
                    if (damageReduction < 0) return;
                    body.block.damage(this.blastDamage * damageReduction);
                    // set the block's velocity to the explosion force
                    // Retrieve the body's current velocity
                    const currentVelocity = body.velocity;
                    
                    // Calculate the additional velocity due to the explosion force
                    const additionalVelocityX = (body.position.x - x) * this.blastForce / body.distanceFromExplosion;
                    const additionalVelocityY = (body.position.y - y) * this.blastForce / body.distanceFromExplosion;
                    
                    // Add the additional velocity to the body's current velocity
                    Matter.Body.setVelocity(body, { 
                        x: currentVelocity.x + additionalVelocityX, 
                        y: currentVelocity.y + additionalVelocityY 
                    });
                }
            }
        });
        // add a cluster of explosions randomly around the block
        for (var i = 0; i < 30; i++) {
            let blastFactor = this.blastRadius * 0.66;
            // create a circle explosion
            let explosion = Matter.Bodies.circle(x + Math.random() * blastFactor - blastFactor/2, y + Math.random() * blastFactor - blastFactor/2, 30 + Math.random() * blastFactor/2, { render: { fillStyle: '#ff00ff' }});
            // change the color by a random amount
            explosion.render.fillStyle = '#00' + Math.floor(Math.random() * 100).toString(16) + 'ff'; // blue
            // make it static
            explosion.isStatic = true;
            // make the explosion unable to collide with other blocks
            explosion.collisionFilter = { mask: 0x0002 };
            // add the explosion to the world
            Matter.World.add(world, explosion);
            // remove the explosion after a random amount of time
            setTimeout(() => {
                Matter.World.remove(world, explosion);
            }, Math.random() * 1000);
        }
        this.contraption.checkConnected();
    }
    getObjectsInExplosion() {
        // find all the bodies in the explosion
        let bodies = Matter.Query.region(this.contraption.engine.world.bodies, Matter.Bounds.create([{ x: this.bodies[0].position.x - this.blastRadius, y: this.bodies[0].position.y - this.blastRadius }, { x: this.bodies[0].position.x + this.blastRadius, y: this.bodies[0].position.y + this.blastRadius }]));
        // add the distance from the explosion to each body
        bodies.forEach(body => {
            body.distanceFromExplosion = Matter.Vector.magnitude(Matter.Vector.sub(body.position, this.bodies[0].position));
        });
        // if the distance is greater than the blast radius, remove the body
        bodies = bodies.filter(body => body.distanceFromExplosion <= this.blastRadius);
        return bodies;
    }
    resetValues() {
        super.resetValues();
        this.exploded = false;
    }
}


export {
    TNTBlock,
    knockBackBlock
}