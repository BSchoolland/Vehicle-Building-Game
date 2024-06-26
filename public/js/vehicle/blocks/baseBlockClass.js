import { LocalToWorld, WorldToLocal, rotateBodyAroundPoint, rotateConstraintAroundPoint } from "../utils.js";
import { playSound } from "../../sounds/playSound.js";

const constraintsVisible = false; // whether or not the constraints are visible
// the base class for all blocks, may be made of multiple bodies and constraints depending on subclass
class Block {
  constructor(
    x,
    y,
    contraption,
    cost,
    description,
    hitPoints,
    color,
    bodies,
    constraints,
    weldableFaces = []
  ) {
    this.x = x;
    this.y = y;
    this.contraption = contraption;
    this.originalX = x;
    this.originalY = y;
    this.cost = cost;
    this.description = description;
    // health
    this.hitPoints = hitPoints;
    this.maxHitPoints = hitPoints;
    this.invincibleParts = []; // parts that can't be damaged (for example flames from a rocket booster or the grappling hook from a grappling hook block)
    this.color = color;
    this.bodies = bodies;
    this.constraints = constraints;
    this.welds = [];
    // orientation
    this.rotatedTimes = 0; // how many times the block has been rotated (0-3)
    this.flippedX = false;
    this.simetricalX = true; // most blocks are simetrical in the x direction

    this.weldableFaces = weldableFaces; // the faces of the block that can be welded to other blocks
    this.rotatedWeldableFaces = weldableFaces; // the weldable faces after the block has been rotated
    this.blocksFromSeat = 0; // used to determine if the block is connected to the seat
    this.previousBlocksFromSeat = 0;
    this.timing = 0; // used to keep track of how often the block is updated
    this.activationKey = null; // the key that activates the block
    this.reverseActivationKey = null; // the key that activates the block in the opposite direction (if applicable)

    this.flameDuration = 0; // the time the block will be on fire for
    this.flameDamage = 0; // the damage the block will take per second while on fire

    // image for use by the build menu
  }
  getControls() {
    // to be defined in subclasses
    // returns the controls for the block (if applicable)
    return [];
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
  makeInvisible() {
    // make all bodies and constraints invisible
    this.bodies.forEach((body) => {
      body.render.visible = false;
    });
    this.constraints.forEach((constraint) => {
      constraint.render.visible = false;
    });
  }
  makeBodies() {
    // will be defined in subclasses
  }
  makeConstraints() {
    // will be defined in subclasses
  }
  resetValues() {
    // called when the block is reset
    this.hitPoints = this.maxHitPoints;
    this.blocksFromSeat = 0;
    // put out the fire
    this.flameDamage = 0;
    this.flameDuration = 0;
  }

  update(deltaTime) {
    // to be set by subclass
  }

  addToWorld(world, rotate = true) {
    // make all bodies static
    this.bodies.forEach((body) => {
      Matter.Body.setStatic(body, true);
    });
    
    // for each time this was rotated, rotate it
    for (var i = 0; i < this.rotatedTimes; i++) {
      // rotate the bodies using the rotateBodyAroundPoint function and the original position of the block
      this.bodies.forEach((body) => {
        rotateBodyAroundPoint(
          body,
          { x: this.originalX, y: this.originalY },
          90
        );
      });
      // rotate the constraints using the rotateConstraintAroundPoint function and the original position of the block
      this.constraints.forEach((constraint) => {
        rotateConstraintAroundPoint(
            constraint,
            { x: this.originalX, y: this.originalY },
            90
            );
      });
    }

    this.setRotation(this.rotatedTimes);
    // add the bodies and constraints to the world
    Matter.World.add(world, this.bodies);
    Matter.World.add(world, this.constraints);
    // if the body is flipped in the X direction, flip it
    if (this.flippedX){
      this.flipX(false);
    }
  }
  removeFromWorld(world) {
    // remove the bodies and constraints from the world
    Matter.World.remove(world, this.bodies);
    Matter.World.remove(world, this.constraints);
    // remove the welds from the world
    this.welds.forEach((weld) => {
      Matter.World.remove(world, weld);
    });
    // clear the welds array
    this.welds = [];
  }
  damage(amount, typeOfDamage = "normal") {
    // subtract the amount from the hitpoints
    playSound("blockTakesDamage");
    this.hitPoints -= amount;
    let numSparks = amount;
    // add a shower of sparks
    for (var i = 0; i < numSparks; i++) {
      if (this.contraption.currentSparks >= this.contraption.maxSparks) {
        // don't add any more sparks
        break;
      }
      this.contraption.currentSparks++;
      // create a spark with a random position and velocity
      let spark;
      // if the typeOfDamage is fire, make the spark bigger
      if (typeOfDamage === "fire") {
        spark = Matter.Bodies.circle(
          this.bodies[0].position.x + Math.random() * 10 - 5,
          this.bodies[0].position.y + Math.random() * 10 - 5,
          4,
          { render: { fillStyle: "#ff0000" } }
        );
        Matter.Body.setVelocity(spark, {
          x: Math.random() * 10 - 5,
          y: Math.random() * 10 - 15,
        });
      }
      else {
        spark = Matter.Bodies.circle(
          this.bodies[0].position.x + Math.random() * 10 - 5,
          this.bodies[0].position.y + Math.random() * 10 - 5,
          2,
          { render: { fillStyle: "#ff0000" } }
        );
        Matter.Body.setVelocity(spark, {
          x: Math.random() * 10 - 5,
          y: Math.random() * 10 - 10,
        });
      }
      // change the color by a random amount
      spark.render.fillStyle =
        "#ff" + Math.floor(Math.random() * 100).toString(16) + "00";
      // make the spark unable to collide with other blocks
      spark.collisionFilter = { mask: 0x0002 };
      // add the spark to the world
      Matter.World.add(this.contraption.engine.world, spark);
      // remove the spark after 1 second
      setTimeout(() => {
        Matter.World.remove(this.contraption.engine.world, spark);
        this.contraption.currentSparks--;
      }, 1000);
    }
    // check if the block is destroyed
    if (this.hitPoints <= 0) {
      this.flameDamage = 0;
      this.flameDuration = 0;
      // flash the block red
      this.bodies.forEach((body) => {
        // record the original fill style
        body.render.originalFillStyle = body.render.fillStyle;
        // set the fill style to red
        body.render.fillStyle = "red";
      });
      // remove welds to this block across the contraption
      this.contraption.blocks.forEach((block) => {
        // check if the block has welds
        if (block.welds.length > 0) {
          // check if the weld is attached to this block
          block.welds.forEach((weld) => {
            // since welds can now be attached to any body in the block, check if the weld is attached to any of this block's bodies
            let attachedThisBlock = false;
            this.bodies.forEach((body) => {
              if (weld.bodyA === body || weld.bodyB === body) {
                attachedThisBlock = true;
              }
            });
            if (attachedThisBlock) {
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
      // make all bodies unable to collide with other blocks
      this.bodies.forEach((body) => {
        body.collisionFilter = { mask: 0x0002 };
      });
      // tell the seat that a block has been destroyed
      if (this.contraption.seat !== this) {
        this.contraption.seat.triggerBlockDestroyed();
      }
      
      // after a short delay, remove the block from the world
      setTimeout(() => {
        // since a block has been removed, the structure has changed and we need to check connected blocks again
        this.removeFromWorld(this.contraption.engine.world);
        this.contraption.checkConnected();
      }, 200);
    } else {
      // flash the block red
      this.bodies.forEach((body) => {
        // record the original fill style (if it hasn't been recorded yet)
        if (!body.render.originalFillStyle) {
          body.render.originalFillStyle = body.render.fillStyle;
        }
        // set the fill style to red
        body.render.fillStyle = "red";
      });
      // set a timeout to reset the fill style
      setTimeout(() => {
        this.bodies.forEach((body) => {
          // reset the fill style
          body.render.fillStyle = body.render.originalFillStyle;
        });
      }, 100);
    }
  }
  hit(thisBody, otherBody) {
    // to be defined in subclasses
    // called when the block is hit by another body
  }
  flipX(firstTime = true) {
    // make sure the block is not simetrical in the x direction
    if (this.simetricalX) {
      return;
    }
    this.bodies.forEach((body) => {
      // Negate the x-coordinate of the body's position
      Matter.Body.setPosition(body, {
        x: 2 * this.x - body.position.x,
        y: body.position.y,
      });

      // If the body has vertices (like custom shapes), flip each vertex
      if (body.vertices) {
        body.vertices.forEach((vertex) => {
          vertex.x = 2 * this.x - vertex.x;
        });
        Matter.Body.setVertices(body, body.vertices);
      }

      // Invert the angle to maintain the orientation
      Matter.Body.setAngle(body, -body.angle);
    });
    // flip the constraints
    this.constraints.forEach((constraint) => {
      // flip pointA and pointB (X only)
      constraint.pointA.x = -constraint.pointA.x;
      constraint.pointB.x = -constraint.pointB.x;
    });

    if (firstTime) {
      // change the weldable faces, left -> right, right -> left
      if (this.weldableFaces.includes("left")) {
        this.weldableFaces[this.weldableFaces.indexOf("left")] = "right";
      } else if (this.weldableFaces.includes("right")) {
        this.weldableFaces[this.weldableFaces.indexOf("right")] = "left";
      }
      // record that the block has been flipped
      this.flippedX = !this.flippedX;1
    }
  }
  rotate90() {
    this.rotatedTimes++;
    if (this.rotatedTimes > 3) {
      this.rotatedTimes = 0;
    }
    // rotate the bodies using the rotateBodyAroundPoint function and the original position of the block
    this.bodies.forEach((body) => {
      rotateBodyAroundPoint(body, { x: this.originalX, y: this.originalY }, 90);
    });
    // rotate the constraints using the rotateConstraintAroundPoint function and the original position of the block
    this.constraints.forEach((constraint) => {
        rotateConstraintAroundPoint(
            constraint,
            { x: this.originalX, y: this.originalY },
            90
            );
    });
    this.setRotation(this.rotatedTimes);
  }
  setRotation(rotatedTimes) {
    if (rotatedTimes === 0) {
      this.rotatedWeldableFaces = this.weldableFaces;
      return;
    }
    // reset the rotation
    this.rotatedWeldableFaces = this.weldableFaces;
    // this.removeFromWorld(this.contraption.engine.world);
    // this.addToWorld(this.contraption.engine.world, false);
    // rotate the bodies and constraints
    for (var i = 0; i < rotatedTimes; i++) {
      // change the weldable faces
      let newWeldableFaces = [];

      // for how many times the block has been rotated, rotate the weldable faces

      this.rotatedWeldableFaces.forEach((face) => {
        switch (face) {
          case "top":
            newWeldableFaces.push("left");
            break;
          case "left":
            newWeldableFaces.push("bottom");
            break;
          case "bottom":
            newWeldableFaces.push("right");
            break;
          case "right":
            newWeldableFaces.push("top");
            break;
        }
      });
      this.rotatedWeldableFaces = newWeldableFaces;
    }
  }
  // save the block to a JSON object
  save() {
    var blockJson = {};
    blockJson.type = this.constructor.name;
    blockJson.x = this.x;
    blockJson.y = this.y;
    blockJson.rotatedTimes = this.rotatedTimes;
    // record if the block is flipped
    blockJson.flippedX = this.flippedX;
    return blockJson;
  }
  // make bodies movable
  makeMovable() {
    this.bodies.forEach((body) => {
      Matter.Body.setStatic(body, false);
    });
  }
  // weld all bodies together
  makeWelds() {
    if (this.rotatedWeldableFaces.length === 0) {
      this.rotatedWeldableFaces = this.weldableFaces;
    }
    // search through all blocks in the contraption and weld those that meet the criteria
    // criteria: adjacent, weldable face matches
    for (var i = 0; i < this.contraption.blocks.length; i++) {
      // check if the block is adjacent
      // find the x and y distance between the two blocks
      let xDistance = this.originalX - this.contraption.blocks[i].originalX;
      let yDistance = this.originalY - this.contraption.blocks[i].originalY;
      // check if block is to the right
      if (xDistance === 50 && yDistance === 0) {
        // check if the weldable faces match
        if (
          this.rotatedWeldableFaces.includes("right") &&
          this.contraption.blocks[i].rotatedWeldableFaces.includes("left")
        ) {
          // weld the blocks together
          const bodyA = this.getWeldBody("right");
          const bodyB = this.contraption.blocks[i].getWeldBody("left");
          // find the pointA and pointB for the weld constraint
          let localPointA = {
            x: -(bodyA.bounds.max.x - bodyA.bounds.min.x) / 2,
            y: 10,
          };
          // turn the points into world coordinates
          let worldPointA = LocalToWorld(bodyA, localPointA);
          // turn world coordinates into bodyB local coordinates
          let localPointB = WorldToLocal(bodyB, worldPointA);
          // create a weld constraint
          const weld = Matter.Constraint.create({
            bodyA: bodyA,
            bodyB: bodyB,
            pointA: localPointA,
            pointB: localPointB,
            stiffness: 1,
            render: {
              visible: constraintsVisible,
            },
          });
          Matter.World.add(this.contraption.engine.world, weld);
          // add the weld to the welds array
          this.welds.push(weld);
        }
      }
      // check if block is to the left
      if (xDistance === -50 && yDistance === 0) {
        // check if the weldable faces match
        if (
          this.rotatedWeldableFaces.includes("left") &&
          this.contraption.blocks[i].rotatedWeldableFaces.includes("right")
        ) {
          // weld the blocks together
          const bodyA = this.getWeldBody("left");
          const bodyB = this.contraption.blocks[i].getWeldBody("right");
          // find the pointA and pointB for the weld constraint
          let localPointA = {
            x: (bodyA.bounds.max.x - bodyA.bounds.min.x) / 2,
            y: -10,
          };
          // turn the points into world coordinates
          let worldPointA = LocalToWorld(bodyA, localPointA);
          // turn world coordinates into bodyB local coordinates
          let localPointB = WorldToLocal(bodyB, worldPointA);
          // create a weld constraint
          const weld = Matter.Constraint.create({
            bodyA: bodyA,
            bodyB: bodyB,
            pointA: localPointA,
            pointB: localPointB,
            stiffness: 1,
            render: {
              visible: constraintsVisible,
            },
          });
          Matter.World.add(this.contraption.engine.world, weld);
          // add the weld to the welds array
          this.welds.push(weld);
        }
      }
      // check if block is above
      if (xDistance === 0 && yDistance === 50) {
        // check if the weldable faces match
        if (
          this.rotatedWeldableFaces.includes("top") &&
          this.contraption.blocks[i].rotatedWeldableFaces.includes("bottom")
        ) {
          // weld the blocks together
          const bodyA = this.getWeldBody("top");
          const bodyB = this.contraption.blocks[i].getWeldBody("bottom");
          // find the pointA and pointB for the weld constraint
          let localPointA = {
            x: 10,
            y: -(bodyA.bounds.max.y - bodyA.bounds.min.y) / 2,
          };
          // turn the points into world coordinates
          let worldPointA = LocalToWorld(bodyA, localPointA);
          // turn world coordinates into bodyB local coordinates
          let localPointB = WorldToLocal(bodyB, worldPointA);
          // create a weld constraint
          const weld = Matter.Constraint.create({
            bodyA: bodyA,
            bodyB: bodyB,
            pointA: localPointA,
            pointB: localPointB,
            stiffness: 1,
            render: {
              visible: constraintsVisible,
            },
          });
          Matter.World.add(this.contraption.engine.world, weld);
          // add the weld to the welds array
          this.welds.push(weld);
        }
      }
      // check if block is below
      if (xDistance === 0 && yDistance === -50) {
        // check if the weldable faces match
        if (
          this.rotatedWeldableFaces.includes("bottom") &&
          this.contraption.blocks[i].rotatedWeldableFaces.includes("top")
        ) {
          // weld the blocks together
          const bodyA = this.getWeldBody("bottom");
          const bodyB = this.contraption.blocks[i].getWeldBody("top");
          // find the pointA and pointB for the weld constraint
          let localPointA = {
            x: -10,
            y: (bodyA.bounds.max.y - bodyA.bounds.min.y) / 2,
          };
          // turn the points into world coordinates
          let worldPointA = LocalToWorld(bodyA, localPointA);
          // turn world coordinates into bodyB local coordinates
          let localPointB = WorldToLocal(bodyB, worldPointA);
          // create a weld constraint
          const weld = Matter.Constraint.create({
            bodyA: bodyA,
            bodyB: bodyB,
            pointA: localPointA,
            pointB: localPointB,
            stiffness: 1,
            render: {
              visible: constraintsVisible,
            },
          });
          Matter.World.add(this.contraption.engine.world, weld);
          // add the weld to the welds array
          this.welds.push(weld);
        }
      }
    }
  }

  getWeldBody(direction = "unimportant") {
    // this function can be overwritten in subclasses
    return this.bodies[0];
  }
  // function for making sure the block is connected to the seat
  checkConnected() {
    // if the block is destroyed, don't check if it is connected
    if (this.hitPoints <= 0) {
      return;
    }
    // find the adjacent blocks
    // Array to store connected blocks
    let connectedBlocks = [];

    // Iterate over all blocks in the contraption
    this.contraption.blocks.forEach((block) => {
      // Check if the block has welds
      if (block.welds.length > 0) {
        // Check if the weld is attached to the target block
        block.welds.forEach((weld) => {
          // since welds can now be attached to any body in the block, check if the weld is attached to any of this block's bodies
          let attachedThisBlock = false;
          this.bodies.forEach((body) => {
            if (weld.bodyA === body || weld.bodyB === body) {
              attachedThisBlock = true;
            }
          });
          if (attachedThisBlock) {
            // Add the block to the connected blocks array
            connectedBlocks.push(block);
          }
        });
      }
    });
    // check how far each adjacent block is from the seat, choose the closest one, and set this block's blocksFromSeat to 1 more than that
    let closestBlock = null;
    let closestDistance = 1000000;
    connectedBlocks.forEach((block) => {
      // find the distance between the block and the seat
      let distance = block.blocksFromSeat;
      if (distance < closestDistance) {
        closestBlock = block;
        closestDistance = distance;
      }
    });
    this.previousBlocksFromSeat = this.blocksFromSeat;
    // set the blocksFromSeat to 1 more than the closest block
    if (closestBlock) {
      this.blocksFromSeat = closestBlock.blocksFromSeat + 1;
    } else {
      // this has been disconnected from all other blocks, destroy it
      this.damage(this.maxHitPoints);
    }
    // if this is too far from the seat, destroy it
    if (this.blocksFromSeat > 25) {
      this.damage(this.maxHitPoints);
    }
    // if the block has gotten further away, we aren't done here and need to check connected on the contraption again
    if (this.previousBlocksFromSeat < this.blocksFromSeat) {
      this.contraption.checkConnected();
    }
  }
}

export default Block;
