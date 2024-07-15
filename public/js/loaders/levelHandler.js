const level1 = fetch('')

import migrateVersion from "./versionMigrationFrontend.js";

class Level {
    constructor(worldNum, levelNum) {
        this.worldNum = worldNum;
        this.levelNum = levelNum;
        this.levelData = null;
        this.completed = false;
    }
    async loadLevel() {
        let path;
        if (this.worldNum === 999) {
            path = `../../json-levels/sandbox/level${this.levelNum}.json`
        }
        else {
            path = `../../json-levels/world${this.worldNum}/level${this.levelNum}.json`;
        } 
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
        // load the boss.json file if it exists as the last level
        try {
            let boss = new Level(worldNum, 'WorldBoss');
            await boss.loadLevel();
            this.levels.push(boss);
        } catch (error) {
            // do nothing
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

class FakeProgressBar { // a hacky way to allow the level handler to not need a progress bar passed in
    update() {
        // do nothing
    }
}

class LevelHandler {
    constructor(progressBar = false) {
        this.worlds = [];
        this.levelIndex = 0;
        this.progressBar = progressBar || new FakeProgressBar();
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
                this.progressBar.update();
            } catch (error) {
                break;
            }
        }
        // load the sandbox world as world 999
        let sandbox = new World();
        await sandbox.loadLevels(999);
        this.worlds.push(sandbox);
        // once all the worlds are loaded, sync the levels the player has beaten with the server
        this.syncLevelsBeat();
        this.isLoaded = false;
        // now that all levels are loaded, migrate the user's progress to the latest version
        migrateVersion(this);
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
                
                let worldNum = data[i].world;
                let levelNum = data[i].level;
                // mark the level as complete in local storage if it isn't already
                if (!this.isLevelCompleted(worldNum, levelNum)) {
                    this.completeLevel(worldNum, levelNum);
                }
                // mark the bonus objectives as complete
                if (!data[i].medals) {
                    continue;
                }
                let medals = data[i].medals.split(',');
                for (let j = 0; j < medals.length; j++) {
                    // mark the bonus objective as complete in local storage if it isn't already
                    if (!this.isMedalEarned(worldNum, levelNum - 1, medals[j])) {
                        this.completeBonusObjective(worldNum, levelNum - 1, medals[j]);
                    }
                }
            }
            // now, check for any levels in local storage that the server doesn't know about
            for (let i = 0; i < this.worlds.length; i++) {
                for (let j = 0; j < this.worlds[i].levels.length; j++) {
                    let key = `world${i + 1}level${j + 1}`;
                    if (localStorage.getItem(key)) {
                        let level = this.worlds[i].getLevel(j);
                        if (!level.bonusChallenges) {
                            // check if the level has been synced with the server
                            let existingLevel = data.find(level => level.world === i + 1 && level.level === j + 1);
                            if (existingLevel) {
                                console.log(`Level ${j + 1} in world ${i + 1} already synced with server`);
                                continue;
                            }
                            fetch('/api/beat-level', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ level: j + 1, world: i + 1, medals: ''}),
                            })
                            .then(response => response.json())
                            .then(data => console.log(data))
                            .catch((error) => {
                                console.error('Error:', error);
                            });
                            continue
                        }
                        let medals = level.bonusChallenges.map(challenge => challenge.name);
                        // figure out which medals the player has earned
                        medals = medals.filter(medal => {
                            const isMedalEarned = this.isMedalEarned(i + 1, j, medal);
                            return isMedalEarned;
                        });
                        // convert the medals array to a string
                        medals = medals.join(',');
                        // if this level is in data with the same medals, skip it
                        let existingLevel = data.find(level => level.world === i + 1 && level.level === j + 1);
                        if (existingLevel) {             
                            if (existingLevel.medals === medals) {
                                console.log(`Level ${j + 1} in world ${i + 1} already synced with server`);
                                continue;
                            }
                        }
                        console.log(`Level ${j + 1} in world ${i + 1} syncing with server`);
                        // send a post request to the server to log that the level has been completed
                        // figure out which medals are possible for this level
                        fetch('/api/beat-level', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ level: j + 1, world: i + 1, medals: medals}),
                        })
                        .then(response => response.json())
                        .then(data => console.log(data))
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    }
                }
            }
            console.log('Levels synced with server');
            // update the progress bar
            this.progressBar.update();
        } else {
            console.error('Failed to get levels beat');
            // alert the user that their progress may not be saved
            alert('Error syncing with your account. Your progress may not be saved across devices.');
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
        return this.worlds.length - 1; // one less because the sandbox world is included
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
        let key = `world${worldNum}level${levelNum + 1}medal${medal}`;
        return localStorage.getItem(key);
    }
    completeBonusObjective(worldNum, levelNum, name) {
        console.log("Objective: ", name, " completed! in world ", worldNum, " level ", levelNum + 1 )
        let key = `world${worldNum}level${levelNum + 1}medal${name}`;
        localStorage.setItem(key, true);
    }
    getBonusChallenges(worldNum, levelNum) {
        // look in level json for bonus challenges
        let level = this.getLevel(worldNum, levelNum);
        return level.bonusChallenges;
    }
    getLevelName(worldNum, levelNum) {
        let level = this.getLevel(worldNum, levelNum);
        return level.title || "unnamed level";
    }
}

export default LevelHandler;