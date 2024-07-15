// functionality for upgrading the user's game version if they don't have an account on the backend
import ResourceHandler from "./resourceHandler.js";
const resourceHandler = new ResourceHandler();
resourceHandler.init();

const currentVersion = '1.3.0';

async function migrateVersion(levelHandler){
    let version = localStorage.getItem('version');
    if (version === null) {
        localStorage.setItem('version', '1.2.1');
        version = '1.2.1';
        console.log('user had no version, must not have played since versioning was added or be a new user')
    }
    if (version === '1.2.1') {
        localStorage.setItem('version', '1.3.0');
        // award resources for levels beaten before the update
        await awardResourcesForOldLevels(levelHandler);
        version = '1.3.0';
        console.log('User was on version 1.2.1, awarded resources for old levels')
    }
    // perform additional migrations as needed here

    // set the current version
    localStorage.setItem('version', currentVersion);
    console.log('Fully updated to', currentVersion);
}

// award resources for levels beaten before 1.3.0
async function awardResourcesForOldLevels(levelHandler) {
    // check that levelHandler.isLoaded is true

    // get all completed levels
    const worldCount = levelHandler.getWorldCount();
    console.log('world count', worldCount)
    for (let world = 0; world < worldCount; world++) {
        const levelCount = levelHandler.getLevelCount(world + 1);
        for (let level = 0; level < levelCount; level++) {
            if (levelHandler.isLevelCompleted(world, level)) {
                console.log('awarding resources for old level', world, level)
                // award resources for the level
                awardResources(world, level, levelHandler);
            }
        }
    }
}

async function awardResources(world, level, levelHandler) {
    const levelData = levelHandler.getLevel(world, level);
    const reward = levelData.reward;
    for (let resource in reward) {
        // add the resource to the user's resources
        resourceHandler.addBlockToResources(resource, reward[resource]);
        console.log('awarded', reward[resource], resource)
    }
}

export default migrateVersion;