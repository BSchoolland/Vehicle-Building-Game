const level1 = fetch('')

class Level {
    constructor(worldNum, levelNum) {
        this.worldNum = worldNum;
        this.levelNum = levelNum;
        this.levelData = null;
    }
    async loadLevel() {
        let path = `../../json-levels/world${this.worldNum}/level${this.levelNum}.json`;
        let response = await fetch(path);
        if (response.ok) {
            this.levelData = await response.json();
        } else {
            throw new Error(`Failed to load level ${this.levelNum} in world ${this.worldNum}`);
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
        // if there are no levels throw an error upwards to stop the world from being added
        if (this.levels.length === 0) {
            throw new Error(`Failed to load world ${worldNum}`);
        }
    }
    getLevel(levelNum) {
        return this.levels[levelNum].getJson();
    }
}

class LevelHandler {
    constructor() {
        this.worlds = [];
        this.loadWorlds();
    }
    async loadWorlds() {
        let i = 0;
        while (true) {
            try {
                let world = new World();
                await world.loadLevels(i + 1);
                this.worlds.push(world);
                i++;
            } catch (error) {
                break;
            }
        }
    }
    getLevel(worldNum, levelNum) {
        return this.worlds[worldNum - 1].getLevel(levelNum);
    }
    getLevelCount(worldNum) {
        return this.worlds[worldNum - 1].levels.length;
    }
    getWorldCount() {
        return this.worlds.length;
    }
}

export default LevelHandler;