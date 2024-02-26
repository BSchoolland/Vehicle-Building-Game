import Block from '../../baseBlockClass.js';
import { constrainBodyToBody } from '../../../utils.js';

// a remote block that can be used to allow disconnected blocks to remain connected
class RemoteBlock extends Block {
    constructor (x, y, contraption) {
        super(x, y, contraption, 20, 'A remote block', 100, '#3b2004', [], [], ['top', 'bottom']);
        this.secondaryColor = '#3d3d3d';
        this.makeBodies();
        this.makeConstraints();

        // by default, the activation key is 'x' 
        this.activationKey = 'x';
        this.activated = false;
    }
    makeBodies(){
        // create a flat surface on the bottom side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y+20, 40, 10, { render: { fillStyle: this.color }}));
        this.bodies[0].block = this;
        // create a flat surface on the top side of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y-20, 40, 10, { render: { fillStyle: this.color }}));
        this.bodies[1].block = this;
        // create a rectangle in the center of the block
        this.bodies.push(Matter.Bodies.rectangle(this.x, this.y, 30, 10, { render: { fillStyle: this.secondaryColor }}));
        this.bodies[2].block = this;
    }
    makeConstraints(){
        // constrain the top side and the center of the block rigidly using constrainBodyToBody
        let bodyA = this.bodies[1];
        let bodyB = this.bodies[2];
        let constraints = constrainBodyToBody(bodyA, bodyB);
        this.constraints.push(...constraints);
        // constrain the bottom side and the center of the block rigidly using constrainBodyToBody
        bodyA = this.bodies[0];
        bodyB = this.bodies[2];
        constraints = constrainBodyToBody(bodyA, bodyB);
        this.constraints.push(...constraints);
    }
    update() { // activate the remote block
        super.update();
        // check if the activation key is pressed
        if (this.contraption.keysPressed[this.activationKey] && !this.activated) {
            this.activated = true;
            this.activate();
        }
    }
    getWeldBody(direction = 'top') { // this is redefining the function from the base class
        if (this.rotatedTimes === 0) {
            if (direction === 'top') {
                return this.bodies[1];
            } else if (direction === 'bottom') {
                return this.bodies[0];
            }
        } else if (this.rotatedTimes === 1) {
            if (direction === 'right') {
                return this.bodies[0];
            } else if (direction === 'left') {
                return this.bodies[1];
            }
        } else if (this.rotatedTimes === 2) {
            if (direction === 'bottom') {
                return this.bodies[1];
            } else if (direction === 'top') {
                return this.bodies[0];
            }
        } else if (this.rotatedTimes === 3) {
            if (direction === 'left') {
                return this.bodies[0];
            } else if (direction === 'right') {
                return this.bodies[1];
            }
        }
    }
    activate() {
        // break the constraints between the top side and the center of the block
        console.log('activated');
        Matter.World.remove(this.contraption.engine.world, this.constraints[0]);
        Matter.World.remove(this.contraption.engine.world, this.constraints[1]);
        // break the constraints between the bottom side and the center of the block
        Matter.World.remove(this.contraption.engine.world, this.constraints[2]);
        Matter.World.remove(this.contraption.engine.world, this.constraints[3]);
        // delete the center body
        setTimeout(() => {
            Matter.World.remove(this.contraption.engine.world, this.bodies[2]);
        }, 500);
        
    }
    resetValues() {
        super.resetValues();
        this.activated = false;
    }
    getControls() {
        return [
            {
                name: 'Drop',
                key: this.activationKey,
                type: 'hold',
                order: 4
            }
        ]
      }
}

export {
    RemoteBlock
}