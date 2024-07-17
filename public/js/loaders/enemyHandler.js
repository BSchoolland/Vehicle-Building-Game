// EnemyHandler.js

class EnemyHandler {
    constructor(progressBar, preLoadEnemies = true) {
        this.enemyContraptionsJSON = {};
        this.progressBar = progressBar;
        this.enemies = {};
        if (preLoadEnemies){
            this.preLoadEnemies();
        }
    }

    async preLoadEnemies() {
        this.RightFacingEnemies = [
            'spikeCar',
            'largeSpikeCar',
            'world1Boss',
            'rocketCar',
            'smackerR',
            'mortar',
        ];
        this.LeftFacingEnemies = [
            'largeSpikeCarL',
            'tankL',
            'flierL',
            'whackerL',
            'porcupine',
            'yeet',
        ];
        // Fetch the list of enemies from the API
        const response = await fetch('/api/enemies');
        console.log(response);
        const enemies = await response.json();
        console.log(enemies);
        // Load each enemy's JSON data
        for (const [key, path] of Object.entries(enemies)) {
            const enemyResponse = await fetch(path);
            const enemyJson = await enemyResponse.json();
            this.enemyContraptionsJSON[key] = enemyJson;
        }

        console.log(this.enemyContraptionsJSON)




        this.enemies = enemies

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
        console.log("Getting enemy JSON for: " + enemyName);
        console.log(this.enemyContraptionsJSON);
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