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
            // damage the other block
            let velocityDifference = Matter.Vector.sub(otherBody.velocity, this.bodies[0].velocity);
            otherBody.block.damage(this.damageMultiplier * Math.abs(velocityDifference.x + velocityDifference.y) ** 2 ); // damage is proportional to the velocity squared
            // record the time of the hit
            this.lastHit = Date.now();
        }
    }
}

export
{
    SpikeBlock
}