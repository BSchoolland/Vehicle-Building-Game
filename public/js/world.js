import { Contraption } from './contraption.js';

// Load terrain from JSON data and add it to the world
export class World {
    constructor(engine, jsonData) {
        this.engine = engine;
        this.jsonData = jsonData;
        this.terrain = [];
    }

    // Load terrain from JSON data
    loadTerrain() {
        var count = 0;
        this.jsonData.terrain.forEach(item => {
            count += 1;
            let body;
            if (item.type === 'rectangle') {
                body = Matter.Bodies.rectangle(item.x, item.y, item.width, item.height, { isStatic: true });
            } else if (item.type === 'circle') {
                body = Matter.Bodies.circle(item.x, item.y, item.radius, { isStatic: true });
            }
            // set the color from the JSON data
            body.render.fillStyle = item.color;

            if (body) {
                this.terrain.push(body);
            }
        });
        console.log(`Loaded ${count} items of terrain`)

        // Add terrain to the world
        Matter.World.add(this.engine.world, this.terrain);
    }

    async LoadEnemyContraption() {
        // Load enemy contraption from JSON data
        this.enemyContraption = new Contraption(this.engine);
        var enemyJson = await (await fetch('../json-contraptions/enemy1.json')).json();
        this.enemyContraption.load(enemyJson);
        // spawn the enemy contraption
        this.enemyContraption.spawn();
    }
}
