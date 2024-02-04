import Block from '../../baseBlockClass.js';
import { LocalToWorld, WorldToLocal} from '../../../utils.js';
import { playSound } from '../../../../sounds/playSound.js';

// a rocket booster block that can propel the contraption
class rocketBoosterBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A rocket booster block', 100, '#3b2004', [], []);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['left'];
        this.thrust = 0.015;
        this.fuel = -1; 
        this.resetValues(); // set the fuel to max

        // this block is not simetrical in the x direction
        this.simetricalX = false;
        // by default, the activation key is 'Shift'
        this.activationKey = 'Shift';
        // explosions
        this.exploded = false;
        this.explosionRadius = 100;
        this.explosionDamage = 100;
        // fire damage
        this.attackFlameDuration = 5; // the duration of fire this gives to other blocks
        this.attackFlameDamage = 5; // the damage per second this block's flame does to other blocks
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
        super.resetValues();
        this.fuel = 300;
    }
    update() {
        super.update();
        // make sure the rocket has more than 0 hp
        if (this.hitPoints <= 0) {
            return;
        }
        // check if the rocket has fuel and the activation key is pressed
        if (this.contraption.keysPressed[this.activationKey] && this.fuel > 0) {
            // decrease the fuel
            this.fuel--;
            // play the rocket sound
            playSound('rocketFlame');
            // apply a force to the rocket nozzle
            Matter.Body.applyForce(this.bodies[1], this.bodies[1].position, Matter.Vector.mult(Matter.Vector.normalise(Matter.Vector.sub(this.bodies[0].position, this.bodies[1].position)), this.thrust));

            // make a flame
            let flame = Matter.Bodies.rectangle(this.bodies[1].position.x, this.bodies[1].position.y, 10, 10, { render: { fillStyle: '#ff0000' }});
            // change the color by a random amount
            flame.render.fillStyle = '#ff' + Math.floor(Math.random() * 100).toString(16) + '00';
            // make the flame unable to collide with other blocks
            // flame.collisionFilter = { mask: 0x0002 };

            // add the flame to the world
            Matter.World.add(this.contraption.engine.world, flame);
            // shoot the flame in the opposite direction of the rocket (with less force because it looks better while being slightly unrealistic)
            Matter.Body.applyForce(flame, this.bodies[1].position, Matter.Vector.mult(Matter.Vector.normalise(Matter.Vector.sub(this.bodies[0].position, this.bodies[1].position)), -this.thrust/3)); 
            flame.hit = false; // the flame has not hit anything yet
            // if the flame hits another block, damage it over time
            Matter.Events.on(this.contraption.engine, 'collisionStart', (event) => {
                let pairs = event.pairs;
                pairs.forEach(pair => {
                    if (flame.hit) return;
                    if (pair.bodyA === flame || pair.bodyB === flame) {
                        flame.hit = true;
                        if (pair.bodyA.block) {
                            // set the block on fire (unless it's already on fire for longer than this flame lasts)
                            if (pair.bodyA.block.flameDuration > this.attackFlameDuration ) {
                                return;
                            }
                            pair.bodyA.block.flameDuration = this.attackFlameDuration ; // the block will be on fire for 5 seconds
                            pair.bodyA.block.flameDamage = this.attackFlameDamage; // the block will take 5 damage per second
                        }
                        if (pair.bodyB.block) {
                            // set the block on fire (unless it's already on fire for longer than this flame lasts)
                            if (pair.bodyB.block.flameDuration > this.attackFlameDuration ) {
                                return;
                            }
                            pair.bodyB.block.flameDuration = this.attackFlameDuration ; // the block will be on fire for 5 seconds
                            pair.bodyB.block.flameDamage = this.attackFlameDamage; // the block will take 5 damage per second
                        }
                    }
                });
            });
            // remove the flame after 0.2 seconds 
            setTimeout(() => {
                Matter.World.remove(this.contraption.engine.world, flame);
            }, 200);      
        }
    }
    // rocket boosters can explode
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
}

export {
    rocketBoosterBlock
}