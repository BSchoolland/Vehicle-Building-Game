import Block from '../../baseBlockClass.js';

// a spike block that can damage other blocks
class SpikeBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A spike block', 100, '#3b2004', [], []);
        this.makeBodies();
        this.makeConstraints();
        this.weldableFaces = ['right'];
        this.damageMultiplier = 10;
        this.damageCooldown = 0.05; // seconds
        this.lastHit = 0; // the last time the block hit something
        // this block is not simetrical in the x direction
        this.simetricalX = false;
        this.baseDamage = 30; // the base damage of the block, before being increased by velocity
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

export {
    SpikeBlock
}