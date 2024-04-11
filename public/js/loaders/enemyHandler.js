// EnemyHandler.js

class EnemyHandler {
    constructor(progressBar) {
        this.enemies = { // a list of all the enemies in the game and the path to their json file
            box: '../../json-enemies/box.json',
            car: '../../json-enemies/car.json',
            spikeCar: '../../json-enemies/spikeCar.json',
            largeSpikeCar: '../../json-enemies/largeSpikeCar.json',
            movingSpikeWall: '../../json-enemies/movingSpikeWall.json',
            barge: '../../json-enemies/barge.json',
            world1Boss: '../../json-enemies/world1Boss.json',
            flameTank: '../../json-enemies/flameTank.json', 
            tntTank: '../../json-enemies/tntTank.json',
            delayedRocketCar: '../../json-enemies/delayedRocketCar.json',
            missileCar: '../../json-enemies/missileCar.json',
            base: '../../json-enemies/base.json',
            largeSpikeCarL: '../../json-enemies/largeSpikeCarL.json',
            drivingCarL: '../../json-enemies/drivingCarL.json',
            tankL: '../../json-enemies/tankL.json',
            rocketCar: '../../json-enemies/rocketCar.json',
            flierL: '../../json-enemies/flierL.json',
        }
        this.enemyContraptionsJSON = {};
        this.progressBar = progressBar;
        this.preLoadEnemies();
    }
    preLoadEnemies() {
        const enemies = this.enemies;
        Object.keys(enemies).forEach(async (key) => {
            var enemyJson = await (await fetch(enemies[key])).json();
            this.enemyContraptionsJSON[key] = enemyJson;
        });
        this.RightFacingEnemies = [
            'spikeCar',
            'spikeCar',
            'largeSpikeCar',
            'world1Boss',
            'rocketCar',
        ];
        this.LeftFacingEnemies = [
            'largeSpikeCarL',
            'largeSpikeCarL',
            'tankL',
            'flierL',

        ]
        console.log("all enemies preloaded");
        if (this.progressBar) this.progressBar.update();
    }
    getEnemyJSON(enemyName) {
        if (enemyName === "randomR") { // a random enemy facing right
            enemyName = this.RightFacingEnemies[Math.floor(Math.random() * this.RightFacingEnemies.length)];
        }
        if (enemyName === "randomL") { // a random enemy facing left
            enemyName = this.LeftFacingEnemies[Math.floor(Math.random() * this.LeftFacingEnemies.length)];
        }
        if (this.enemyContraptionsJSON[enemyName] === undefined) {
            console.error("Enemy not found, returning default enemy.");
            // return a default enemy (the first one in the list)
            return this.enemyContraptionsJSON[Object.keys(this.enemyContraptionsJSON)[0]];
        }
        // return the enemy JSON
        return this.enemyContraptionsJSON[enemyName];
    }
}

export default EnemyHandler;