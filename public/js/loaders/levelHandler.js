const level1 = fetch('')

class Level {
    constructor(worldNum, levelNum) {
        this.worldNum = worldNum;
        this.levelNum = levelNum;
        this.levelData = null;
        this.completed = false;
    }
    async loadLevel() {
        let path = `../../json-levels/world${this.worldNum}/level${this.levelNum}.json`;
        let response = await fetch(path);
        if (response.ok) {
            this.levelData = await response.json();
        } else {
            throw new Error(`Failed to load level ${this.levelNum} in world ${this.worldNum}`);
        }
        // check if the level has been completed
        let key = `world${this.worldNum}level${this.levelNum}`;
        if (localStorage.getItem(key)) {
            this.completed = true;
        } else {
            this.completed = false;
        }
    }
    getJson() {
        return this.levelData;
    }
}

class World {
    constructor() {
        this.levels = [];
    }
    async loadLevels(worldNum) {
        let i = 0;
        while (true) {
            try {
                let level = new Level(worldNum, i + 1);
                await level.loadLevel();
                this.levels.push(level);
                i++;
            } catch (error) {
                break;
            }
        }
        console.log(`World ${worldNum} loaded with ${this.levels.length} levels`);
        // if there are no levels, throw an error
        if (this.levels.length === 0) {
            throw new Error(`Failed to load world ${worldNum}`);
        }
    }
    getLevel(levelNum) {
        return this.levels[levelNum].getJson();
    }
}

class LevelHandler {
    constructor(progressBar) {
        this.worlds = [];
        this.loadWorlds();
        this.progressBar = progressBar;
        this.levelIndex = 0;
    }
    async loadWorlds() {
        let i = 0;
        while (true) {
            try {
                let world = new World();
                await world.loadLevels(i + 1);
                this.worlds.push(world);
                i++;
                this.progressBar.update();
            } catch (error) {
                break;
            }
        }
    }
    getLevel(worldNum, levelNum) {
        this.levelIndex = levelNum;
        console.log(`Getting level ${levelNum} in world ${worldNum}`);
        return this.worlds[worldNum - 1].getLevel(levelNum);
    }
    getLevelCount(worldNum) {
        return this.worlds[worldNum - 1].levels.length;
    }
    getWorldCount() {
        return this.worlds.length;
    }
    getLevelIndex() {
        return this.levelIndex;
    }
    completeLevel(worldNum, levelNum) { // mark a level as complete in local storage
        let key = `world${worldNum}level${levelNum}`;
        localStorage.setItem(key, true);
        console.log(`Level ${levelNum} in world ${worldNum} marked as complete`);
    }
    isLevelCompleted(worldNum, levelNum) {
        let key = `world${worldNum}level${levelNum}`;
        return localStorage.getItem(key);
    }
}

export default LevelHandler;