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
        this.levelIndex = 0;
        this.progressBar = progressBar;
        this.loadWorlds();
        this.syncLevelsBeat();
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
    // get the levels the player has beaten from the server and tell the server of any levels in local storage
    async syncLevelsBeat() {
        // if the user is not logged in, don't bother
        if (!document.cookie.includes('user')) {
            console.log('User is not logged in. Skipping level sync');
            // update the progress bar
            this.progressBar.update();
            return;
        }
        // request the list of levels the player has beaten from the server
        let response = await fetch('/api/getLevelsBeat', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensures cookies are sent with the request
        });
        if (response.ok) {
            let data = await response.json();
            for (let i = 0; i < data.length; i++) {
                let worldNum = data[i].worldNum;
                let levelNum = data[i].levelNum;
                this.completeLevel(worldNum, levelNum);
            }
            // now, check for any levels in local storage that the server doesn't know about
            for (let i = 0; i < this.worlds.length; i++) {
                for (let j = 0; j < this.worlds[i].levels.length; j++) {
                    let key = `world${i + 1}level${j + 1}`;
                    if (localStorage.getItem(key)) {
                        // if this level is in data, the server already knows about it
                        if (data.some(level => level.worldNum === i + 1 && level.levelNum === j + 1)) {
                            continue;
                        }
                        // send a post request to the server to log that the level has been completed
                        fetch('/api/beat-level', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ level: j + 1, world: i + 1 }),
                        })
                        .then(response => response.json())
                        .then(data => console.log(data))
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    }
                }
            }
            // update the progress bar
            this.progressBar.update();
        } else {
            console.error('Failed to get levels beat');
            // alert the user that their progress may not be saved
            alert('Failed to get levels beat. Your progress may not be saved.');
            // update the progress bar
            this.progressBar.update();
        }
        
    }
    getLevel(worldNum, levelNum) {
        this.levelIndex = levelNum;
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
    isMedalEarned(worldNum, levelNum, medal) {
        if (medal === "Beat the Level") {
            return this.isLevelCompleted(worldNum, levelNum);
        }
        let key = `world${worldNum}level${levelNum}medal${medal}`;
        return localStorage.getItem(key);
    }
    completeBonusObjective(worldNum, levelNum, name) {
        console.log("Objective: ", name, " completed! in world ", worldNum, " level ", levelNum)
        let key = `world${worldNum}level${levelNum}medal${name}`;
        localStorage.setItem(key, true);
    }
    getBonusChallenges(worldNum, levelNum) {
        // look in level json for bonus challenges
        let level = this.getLevel(worldNum, levelNum);
        return level.bonusChallenges;
    }
}

export default LevelHandler;