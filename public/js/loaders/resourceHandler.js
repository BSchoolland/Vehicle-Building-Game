// handles recording and loading player resources from local storage
// FIXME: integrate teh crazy games SDK for storing resources to player accounts instead of just local storage

const worldCount = 4; // FIXME: this should be dynamic based on the number of worlds in the game
// each world has its own set of obtainable resources
// resources consist of parts that the player can use to build their contraption to beat the world's boss
class ResourceHandler {
    constructor() {
        this.resources = {};
    }
    async init() {
        await this.loadResources();
    }
    async loadResources() {
        for (let i = 1; i <= worldCount; i++) {
            this.resources[i] = await this.loadWorldResources(i);
        }
    }
    async loadWorldResources(worldNum) {
        if (localStorage.getItem(`world${worldNum}Resources`)) {
            return JSON.parse(localStorage.getItem(`world${worldNum}Resources`));
        } else {
            // create a new resource object with only a seat and a wheel
            let resources = {
                SeatBlock: 1,
                WheelBlock: 1
            };
            // save this to local storage
            localStorage.setItem(`world${worldNum}Resources`, JSON.stringify(resources));
            return resources;
        }
    }
    getWorldResources(worldString) {
        // strip the "collected" from the string
        let worldNum = parseInt(worldString.replace("collected", ""));
        let resources = this.resources[worldNum];
        // convert the resources object into an array of objects
        let resourcesArray = [];
        let n = 0;
        for (let key in resources) {
            n++;
            resourcesArray.push(
                {
                    name: key,
                    key: n.toString(),
                    type: key,
                    limit: resources[key]
                });
        }
        console.log(resourcesArray);
        return resourcesArray;
    }
    addBlockToResources(worldNum, blockName, count = 1) {
        let resources = this.resources[worldNum];
        if (resources[blockName]) {
            resources[blockName] += count;
        } else {
            resources[blockName] = count;
        }
        localStorage.setItem(`world${worldNum}Resources`, JSON.stringify(resources));
    }
}

export default ResourceHandler;