// a file to handle projectiles

// the Projectile superclass
class Projectile {
    constructor(engine, x, y, target, owner, color = 'red', damage = 1, radius = 5, speed = 10) {
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.target = target;
        this.owner = owner;
        this.color = color;
        this.damage = damage;
        this.radius = radius;
        this.speed = speed;
        this.bodies = [];
    }
    // spawn the projectile in the world
    spawn() {
        // create the body        
        // round the x and y values
        this.x = Math.round(this.x / 1) * 1;
        this.y = Math.round(this.y / 1) * 1;
        this.bodies.push(Matter.Bodies.circle(this.x, this.y, this.radius, { isStatic: false }));
        // set the color
        this.bodies[0].render.fillStyle = this.color;
        // add the body to the world
        Matter.World.add(this.engine.world, this.bodies);
        // set the velocity
        let velocity = Matter.Vector.create(this.target.x - this.x, this.target.y - this.y);
        velocity = Matter.Vector.normalise(velocity);
        velocity = Matter.Vector.mult(velocity, this.speed);
        Matter.Body.setVelocity(this.bodies[0], velocity);

        // watch for collisions
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            // check if the collision is with the cannonball
            if (event.pairs[0].bodyA === this.bodies[0] || event.pairs[0].bodyB === this.bodies[0]) {
                // trigger the hit function
                this.hit(event.pairs[0].bodyA === this.bodies[0] ? event.pairs[0].bodyB : event.pairs[0].bodyA);
            }
        });
        // even if this doesn't hit anything, remove it after 5 seconds
        setTimeout(() => {
            this.remove();
        }, 5000);
    }
    // update the projectile
    update() {
        // check if the projectile is out of bounds
        if (this.body.position.y > 1000 || this.body.position.y < -1000 || this.body.position.x > 1000 || this.body.position.x < -1000) {
            this.remove();
        }
    }
    hit() {
        // defined in subclasses
    }
    // remove the projectile from the world
    remove() {
        Matter.World.remove(this.engine.world, this.bodies[0]);
    }
}

// A heavy, slow projectile that deals a lot of knockback and decent damage
class Cannonball extends Projectile {
    constructor(engine, x, y, velocity, owner) {
        super(engine, x, y, velocity, owner);
        this.damage = 25;
        this.radius = 10;
        this.speed = 10;
        this.color = 'grey';
        this.knockback = 20;
        

    }
    
    hit(body) {
        // check if the body is in a block
        if (body.block) {
            // make sure the body.block.contraption is not the same as the owner
            if (body.block.contraption === this.owner) {
                // wait then remove the projectile
                setTimeout(() => {
                    this.remove();
                }, 1000);
                return;
            }
            // deal knockback to the body
            Matter.Body.setVelocity(body, Matter.Vector.mult(Matter.Vector.normalise(Matter.Vector.sub(body.position, this.bodies[0].position)), this.knockback));
            // damage the block
            body.block.damage(this.damage);
            // remove the projectile immediately
            this.remove();
        }
        // wait then remove the projectile
        setTimeout(() => {
            this.remove();
        }, 200);
        

        
    }
}

// pace for more projectile classes

export {Cannonball};