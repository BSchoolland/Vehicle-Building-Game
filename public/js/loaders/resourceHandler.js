// handles recording and loading player resources from local storage
// FIXME: integrate the crazy games SDK for storing resources to player accounts instead of just local storage
// FIXME: sync the resources with the player's account on the server
import { playSound, setSong } from "../sounds/playSound.js";
const worldCount = 4; // FIXME: this should be dynamic based on the number of worlds in the game
// each world has its own set of obtainable resources
// resources consist of parts that the player can use to build their contraption to beat the world's boss

// dictionary of resource names to image file names
const resourceImages = {
    "SeatBlock": "seat-block.png",
    "WheelBlock": "wheel-block.png",
    "BasicWoodenBlock": "basic-block.png",
    "RemoteBlock": "remote-block.png",
    "SpikeBlock": "spike-block.png",
    "Coins": "coin.png",
    "rocketBoosterBlock": "rocket-booster-block.png",
    "TNTBlock": "tnt-block.png"
}

function checkUserCookie() {
    // Split document.cookie into an array of cookies
    const cookies = document.cookie.split(';');
    // Look for a cookie named "user"
    const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
    // Check if the "user" cookie was found
    if (userCookie) {
        return true;
    } else {
        return false;
    }
}

class ResourceHandler {
    constructor(parent = null) {
        this.resources = {};
        this.parent = parent;
    }
    async init() {
        console.log("INIT RESOURCE HANDLER");
        console.log(await this.loadResources());
        await this.syncResources(1);
    }
    async loadResources() {
        for (let i = 1; i <= worldCount; i++) {
            this.resources[i] = await this.loadWorldResources(i);
        }
        return this.resources;
    }
    async loadWorldResources(worldNum) {
        
        if (checkUserCookie()) {
            // sync the resources with the server

            // fetch the resources from the server
            let response = await fetch(`/api/getResources?world=${worldNum}`);
            let resources = await response.json();
            console.log('resources', resources);
            if (!resources) {
                // if the user has no resources, create a new resource object with only a seat and a wheel
                resources = {
                    SeatBlock: 1,
                    WheelBlock: 1
                };
            }
            // save the resources to local storage
            localStorage.setItem(`world${worldNum}Resources`, JSON.stringify(resources));
            return resources;
        } else if (localStorage.getItem(`world${worldNum}Resources`)) {
            return JSON.parse(localStorage.getItem(`world${worldNum}Resources`));
        } // if the user is logged in with a cookie
        else {
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
            if (!(key === "Coins")){
                n++;
            }
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
    addBlockToResources(worldNum, blockName, count = 1, noShow = false) {
        // to fix the weird bug where resources are letters and numbers, filter out any counts that are not numbers and block names that are not strings
        if (typeof blockName !== "string") {
            console.warn("blockName is not a string");
            return;
        }
        if (typeof count !== "number") {
            console.warn("count is not a number");
            return;
        }
        console.log(`Adding ${count} ${blockName} to world ${worldNum}`);

        let resources = this.resources[worldNum];
        if (resources[blockName]) {
            resources[blockName] += count;
        } else {
            resources[blockName] = count;
        }
        localStorage.setItem(`world${worldNum}Resources`, JSON.stringify(resources));
        // wait till inventory-button is loaded
        if (noShow) {
            return;
        }
        let interval = setInterval(() => {
            let inventory = document.getElementById("inventory-button");
            if (inventory) {
                for (let i = 0; i < count; i++) {
                    // wait random between 0 and 1 seconds
                    setTimeout(() => {
                        this.collectionAnimation(blockName, inventory);   
                    }, Math.random() * 1000); 
                }
                clearInterval(interval);
            } 
        }, 100);

    }

    async syncResources(worldNum) {
        if (!this.parent){
            console.warn("failed to sync resources, parent not set");
            // try again in 1 second
            setTimeout(() => {
                this.syncResources(worldNum);
            }, 1000);
            return;
        }
        if (worldNum === 'all') {
            for (let i = 1; i <= worldCount; i++) {
                await this.syncResources(i);
            }
            return;
        }
        // clear the resources
        this.resources[worldNum] = [];

        // add a seat and a wheel to the player's inventory
        this.addBlockToResources(worldNum, "SeatBlock", 1, true);
        this.addBlockToResources(worldNum, "WheelBlock", 1, true);

        // simply recalculate resources from which levels have been completed

        // get which levels have been completed locally
        let count = this.parent.LevelHandler.getLevelCount(
            worldNum,
        );

        // get the bonus objectives of each level
        for (let i = 1; i < count; i++) {
            let bonusObjectives = this.parent.LevelHandler.getBonusChallenges(
                worldNum,
                i
            );
            let areAllBonusObjectivesCompleted = true;
            for (let j = 0; j < bonusObjectives.length; j++) {
                let objectiveName = bonusObjectives[j].name;
                if (this.parent.LevelHandler.isMedalEarned(
                    worldNum,
                    i,
                    objectiveName
                  )) {
                    // do nothing
                  } else {
                    areAllBonusObjectivesCompleted = false;
                    break;
                  }
            }
            // if all bonus objectives are completed, award the player with the resources
            if (areAllBonusObjectivesCompleted) {
                // award the player with the resources
                // get the level JSON
                let levelJSON = this.parent.LevelHandler.getLevel(
                    worldNum,
                    i
                );
                let resources = levelJSON.reward;
                for (let key in resources) {
                    this.addBlockToResources(worldNum, key, resources[key], true);
                }
            }

            // check if "Beat the Level" is completed
            if (this.parent.LevelHandler.isMedalEarned(
                worldNum,
                i,
                "Beat the Level"
              )) {
                // award the player with the resources again
                let levelJSON = this.parent.LevelHandler.getLevel(
                    worldNum,
                    i
                );
                let resources = levelJSON.reward;
                console.log(resources);

                for (let key in resources) {
                    this.addBlockToResources(worldNum, key, resources[key], true);
                }
            } 
        }
    }

    collectionAnimation(blockName,  to = null, from='auto', fromRandom = 200, toRandom = 0, sound = 'coin') {
        // don't show coins
        if (blockName === "Coins") return;
        
        // Create the resource element
        let resource = document.createElement("div");
        resource.classList.add("resource");
        resource.style.backgroundImage = `url('img/build-buttons/${resourceImages[blockName]}')`;
        // Make sure the background scales with the div
        resource.style.backgroundSize = "cover";
        resource.style.position = "absolute";
        resource.style.left = "50%";
        resource.style.top = "50%";
        resource.style.transform = "translate(-50%, -50%)";
        resource.style.zIndex = "100";
        resource.style.width = "35px";
        resource.style.height = "35px";
        document.body.appendChild(resource);
    
        // Get the position of the resource and the inventory button
        let inventory = to || document.getElementById("inventory-button");
        let inventoryRect = inventory.getBoundingClientRect();
        
        // random offset for the to position
        let randomOffsetXto = (Math.random() - 0.5) * toRandom; 
        let randomOffsetYto = (Math.random() - 0.5) * toRandom; 
        // Calculate the end position
        let endX = inventoryRect.x + inventoryRect.width / 2 + randomOffsetXto;
        let endY = inventoryRect.y + inventoryRect.height / 2 + randomOffsetYto;
    
        // Calculate the distance to move per frame
        let frames = 100;
        let randomOffsetX = (Math.random() - 0.5) * fromRandom; 
        let randomOffsetY = (Math.random() - 0.5) * fromRandom; 
        let startX, startY;
        if (from === 'auto'){
            startX = window.innerWidth / 2 + randomOffsetX;
            startY = window.innerHeight / 2 + randomOffsetY;
        } else {
            // start from the hitbox of the block
            let block = from;
            let blockRect = block.getBoundingClientRect();
            startX = blockRect.x + blockRect.width / 2 + randomOffsetX;
            startY = blockRect.y + blockRect.height / 2 + randomOffsetY;
        }
        let totalDx = endX - startX;
        let totalDy = endY - startY;
    
        let i = 0;
    
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
    
        function animate() {
            if (i < frames) {
                let t = i / frames; // Progress (0 to 1)
                let easedT = easeInOutCubic(t);
    
                resource.style.left = startX + totalDx * easedT + "px";
                resource.style.top = startY + totalDy * easedT + "px";
    
                i++;
                requestAnimationFrame(animate);
            } else {
                // Ensure the final position is set to the exact end position
                resource.style.left = endX + "px";
                resource.style.top = endY + "px";
    
                // Remove the resource element after animation
                document.body.removeChild(resource);
                playSound(sound);
            }
        }
    
        requestAnimationFrame(animate);
    }
    generateInventoryList(worldNum){
        // from te resources, return an array of objects with the src and the count
        let inventory = [];
        let resources = this.resources[worldNum];
        for (let key in resources) {
            // ignore coins
            if (key === "Coins") continue;
            inventory.push({
                src: `img/build-buttons/${resourceImages[key]}`,
                number: resources[key],
                color: key === "Coins" ? "black" : "white"
            });
        }
        return inventory;
    }
    bossAnimation(target, worldNum) {
        // animate sending the resources to the boss level (target)
        // Create the resource element
        let inventory = document.getElementById("inventory-button");
        for (let key in this.resources[worldNum]) {
            // ignore coins
            if (key === "Coins") continue;
            let count = this.resources[worldNum][key];
            for (let i = 0; i < count; i++) {
                // wait random between 0 and 1 seconds
                setTimeout(() => {
                    this.collectionAnimation(key, target, inventory, 50, 200, 'placeBlock');   
                }, Math.random() * 1000); 
            }
            
        }
    }
    
}

export default ResourceHandler;