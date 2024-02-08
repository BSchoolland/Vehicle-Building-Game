import Block from "../../baseBlockClass.js";
import { LocalToWorld, WorldToLocal } from "../../../utils.js";
import { playSound } from "../../../../sounds/playSound.js";

// a rocket booster block that can propel the contraption
class rocketBoosterBlock extends Block {
  constructor(x, y, contraption) {
    super(
      x,
      y,
      contraption,
      20,
      "A rocket booster block",
      100,
      "#3b2004",
      [],
      [],
      ["left"]
    );
    this.secondaryColor = "#3d3d3d";
    this.makeBodies();
    this.makeConstraints();
    this.thrust = 0.65;
    // this block is not simetrical in the x direction
    this.simetricalX = false;
    // by default, the activation key is 'shift'
    this.activationKey = "shift";
    // explosions
    this.exploded = false;
    this.explosionRadius = 100;
    this.explosionDamage = 100;
    // fire damage
    // the number of flames this block can create per second
    this.flameRate = 10;
    this.secondsSinceLastFlame = 0;
    this.flameSize = 20; // the size of the flame
    this.flameRange = 200; // the range of the flame
    this.attackFlameDuration = 3; // the duration of fire this gives to other blocks
    this.attackFlameDamage = 20; // the damage per second this block's flame does to other blocks
    this.flames = [];
  }
  makeBodies() {
    // create a flat surface on the right side of the block
    this.bodies.push(
      Matter.Bodies.rectangle(this.x + 20, this.y, 10, 50, {
        render: { fillStyle: this.color },
      })
    );
    this.bodies[0].block = this;
    // create a triangle on the left side of the block as the rocket nozzle
    let vertices = "50 25 15 46 15 4";
    this.bodies.push(
      Matter.Bodies.fromVertices(
        this.x - 10,
        this.y,
        Matter.Vertices.fromPath(vertices),
        { render: { fillStyle: this.secondaryColor } }
      )
    );
    this.bodies[1].block = this;
    // make the rocket nozzle unable to collide with other blocks
    this.bodies[1].collisionFilter = { mask: 0x0002 };
    // a rectangle for the joint
    this.bodies.push(
      Matter.Bodies.rectangle(this.x, this.y, 30, 20, {
        render: { fillStyle: this.secondaryColor },
      })
    );
    this.bodies[2].block = this;
  }
  makeConstraints() {
    // constrain the joint and the flat surface rigidly using two constraints
    let bodyA = this.bodies[0];
    let bodyB = this.bodies[2];
    let localPointA = {
      x: -(bodyA.bounds.max.x - bodyA.bounds.min.x) / 2,
      y: 10,
    };
    // turn the points into world coordinates
    let worldPointA = LocalToWorld(bodyA, localPointA);
    // turn world coordinates into bodyB local coordinates
    let localPointB = WorldToLocal(bodyB, worldPointA);
    // first constraint
    this.constraints.push(
      Matter.Constraint.create({
        bodyA: this.bodies[0], // the flat surface
        bodyB: this.bodies[2], // the joint
        pointA: localPointA,
        pointB: localPointB,
        stiffness: 0.5,
        length: 0,
        // invisible
        render: {
          visible: false,
        },
      })
    );
    // second constraint
    localPointA = { x: -(bodyA.bounds.max.x - bodyA.bounds.min.x) / 2, y: -10 };
    // turn the points into world coordinates
    worldPointA = LocalToWorld(bodyA, localPointA);
    // turn world coordinates into bodyB local coordinates
    localPointB = WorldToLocal(bodyB, worldPointA);

    this.constraints.push(
      Matter.Constraint.create({
        bodyA: this.bodies[0], // the flat surface
        bodyB: this.bodies[2], // the joint
        pointA: localPointA,
        pointB: localPointB,
        stiffness: 0.5,
        length: 0,
        // invisible
        render: {
          visible: false,
        },
      })
    );
    // constrain the joint and the rocket nozzle, allowing rotation
    this.constraints.push(
      Matter.Constraint.create({
        bodyA: this.bodies[1], // the rocket nozzle
        bodyB: this.bodies[2], // the joint
        pointA: { x: 10, y: 0 },
        pointB: { x: 0, y: 0 },
        stiffness: 1,
        length: 0,
        // invisible
        render: {
          visible: false,
        },
      })
    );

    this.constraints.push(
      Matter.Constraint.create({
        bodyA: this.bodies[1], // the rocket nozzle
        bodyB: this.bodies[2], // the joint
        pointA: { x: 20, y: 0 },
        pointB: { x: 10, y: 0 },
        stiffness: 0.3,
        length: 0,
        // invisible
        render: {
          visible: false,
        },
      })
    );
  }

  update(deltaTime) {
    super.update();
    // make sure the rocket has more than 0 hp
    if (this.hitPoints <= 0) {
      return;
    }
    // check if  the activation key is pressed
    if (this.contraption.keysPressed[this.activationKey]) {
      // play the rocket sound
      playSound("rocketFlame");
      // apply a force to the rocket nozzle
      Matter.Body.applyForce(
        this.bodies[1],
        this.bodies[1].position,
        Matter.Vector.mult(
          Matter.Vector.normalise(
            Matter.Vector.sub(this.bodies[0].position, this.bodies[1].position)
          ),
          (this.thrust * deltaTime) / 1000
        )
      );
      // figure out if we should create a flame
      this.secondsSinceLastFlame += deltaTime;
      if (this.secondsSinceLastFlame > 1000 / this.flameRate) {
        this.createFlame(deltaTime);
        this.secondsSinceLastFlame -= 1000 / this.flameRate;
      }
    }
  }
  createFlame(deltaTime) {
    // make a flame
    let flame = Matter.Bodies.rectangle(
      this.bodies[1].position.x,
      this.bodies[1].position.y,
      this.flameSize,
      this.flameSize,
      { render: { fillStyle: "#ff0000" } }
    );
    // change the color by a random amount
    flame.render.fillStyle =
      "#ff" + Math.floor(Math.random() * 100).toString(16) + "00";
    
    // record when the flame was created
    flame.created = Date.now();
    // add the flame to the world
    Matter.World.add(this.contraption.engine.world, flame);
    // shoot the flame in the opposite direction of the rocket
    Matter.Body.applyForce(
      flame,
      this.bodies[1].position,
      Matter.Vector.mult(
        Matter.Vector.normalise(
          Matter.Vector.sub(this.bodies[0].position, this.bodies[1].position)
        ),
        (-this.thrust * deltaTime) / 1000
      )
    );
    flame.hit = false; // the flame has not hit anything yet
    flame.block = this; // the flame is from this block
    this.flames.push(flame); // add the flame to the list of flames
    this.invincibleParts.push(flame); // make the flame invincible so the rocket won't be destroyed when the flame is hit by a spike or another weapon
    // remove the flame after 0.2 seconds
    setTimeout(() => {
      Matter.World.remove(this.contraption.engine.world, flame);
      // remove the flame from the list of flames
      let index = this.flames.indexOf(flame);
      if (index > -1) {
        this.flames.splice(index, 1);
      }
    }, this.flameRange); // the flame will be removed after flameRange milliseconds
  }
  // rocket boosters can explode
  explode() {
    // if the block has already exploded, don't explode again
    if (this.exploded) return;
    this.exploded = true;
    // play the explosion sound
    playSound("explosion");
    // remove the body from the world
    const world = this.contraption.engine.world;
    let x = this.bodies[0].position.x;
    let y = this.bodies[0].position.y;
    Matter.World.remove(world, this.bodies[0]);
    // create a circle explosion
    // find all the bodies in the explosion
    let bodies = Matter.Query.region(
      world.bodies,
      Matter.Bounds.create([
        { x: x - 100, y: y - 100 },
        { x: x + 100, y: y + 100 },
      ])
    );
    // damage all the bodies in the explosion
    bodies.forEach((body) => {
      // check if the body is a block
      if (body.block) {
        // damage the block
        body.block.damage(100);
      }
    });
    // add a cluster of explosions randomly around the block
    for (var i = 0; i < 30; i++) {
      // create a circle explosion
      let explosion = Matter.Bodies.circle(
        x + Math.random() * 100 - 50,
        y + Math.random() * 100 - 50,
        30 + Math.random() * 50,
        { render: { fillStyle: "#ff0000" } }
      );
      // change the color by a random amount
      explosion.render.fillStyle =
        "#ff" + Math.floor(Math.random() * 100).toString(16) + "00";
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
  hit(flame, otherBody) {
    // if the flame hits another block, damage it over time
    if (!this.flames.includes(flame)) return; // if the flame is not from this block, don't hit the block
    if (flame.hit) return; // if the flame has already hit something, don't hit it again
    if (!otherBody.block) return; // if the other body is not a block, don't hit it
    if (otherBody.block.contraption === this.contraption) return; // if the other block is part of the same contraption, don't hit it
    if (otherBody.block.invincibleParts && otherBody.block.invincibleParts.includes(otherBody)) return; // if the other block is invincible, don't hit it
    if (otherBody.block.flameDuration > this.attackFlameDuration) return; // if the other block is already on fire for longer than this flame, don't hit it
    if (flame.created + this.flameRange < Date.now()) return; // if the flame is older than flameRange, don't hit the block
    otherBody.block.flameDuration = this.attackFlameDuration; // the block will be on fire for 5 seconds
    otherBody.block.flameDamage = this.attackFlameDamage; // the block will take 5 damage per second
    // record that the flame has hit something
    flame.hit = true;
  }
}

export { rocketBoosterBlock };
