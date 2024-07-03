const { db } = require("./db/dbConfig");
// function that handles any migration that needs to happen when a user logs in from an older version
function handleUserGameVersion(user_id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT lastPlayedVersion FROM users WHERE id = ?`, [user_id], async (err, row) => {
            if (err) {
                console.error("Could not get user's last played version:", err.message);
                try {
                    await migrateVersion(user_id, null);
                    resolve();
                } catch (migrateError) {
                    console.error("An error occurred while migrating version:", migrateError.message);
                    reject(migrateError);
                }
            } else {
                try {
                    const version = row ? row.lastPlayedVersion : null;
                    await migrateVersion(user_id, version);
                    resolve();
                } catch (migrateError) {
                    console.error("An error occurred while migrating version:", migrateError.message);
                    reject(migrateError);
                }
            }
        });
    });
}

async function migrateVersion(user_id, version) {
    console.log(version)
    // null -> 1.2.1
    // MAIN CHANGES:
    // - Added this version migration system, and began tracking the user's last played version and first played version.
    if (version === null) {
        version = "1.2.1";
        // record that the user first played in version 1.2.1
        recordUserFirstPlayedVersion(user_id, "1.2.1");
    }
    // 1.2.1 -> 1.3.0
    // MAIN CHANGES:
    // - Added a resource system which awards the player with resources for beating levels.  
    // - Players who beat levels before this update should be awarded resources for those levels upon logging in.
    // - Added a new level in world 1 (level 8) the current level 8 has now been moved to level 9, so players who beat the old level 9 should be awarded completion of the new level 9 instead.

    if (version === "1.2.1") {
        console.log('awarding resources for old levels')
        // award resources for levels beaten before the update
        await awardResourcesForOldLevels(user_id);
        // update the user's version to version 1.3.0
        updateUserGameVersion(user_id, "1.3.0");
        // increment the version
        version = "1.3.0";
        console.log('updated to 1.3.0')
    }

    // perform additional migrations as needed here
}

// award resources for levels beaten before 1.3.0
function awardResourcesForOldLevels(user_id) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM levelsBeat WHERE user_id = ?`, [user_id], (err, rows) => {
            if (err) {
                console.error("Could not get levels beaten by user:", err.message);
                return reject(err);
            } else {
                let world1Resources = { SeatBlock: 1, WheelBlock: 1 };
                let world2Resources = { SeatBlock: 1, WheelBlock: 1 };
                let world3Resources = { SeatBlock: 1, WheelBlock: 1 };
                // world 4 added in 1.3.0
                rows.forEach((row) => {
                    console.log(row);
                    // figure out the world and level number
                    let world = row.world;
                    let level = row.level;
                    let levelData;
                    try {
                        // find the json file for the level in public/json-levels/world{world}/level{level}.json
                        levelData = require(`./public/json-levels/world${world}/level${level}.json`);
                    } catch (error) {
                        console.log("Could not find level data for world", world, "level", level, ":", error.message);
                        return;
                    }
                    
                    // get the reward for beating the level
                    let reward = levelData.reward;
                    let resourcesAdded = {};
                    for (let resource in reward) {
                        resourcesAdded[resource] = reward[resource];
                    }
                    // add the resources to that world's resources
                    if (world === 1) {
                        world1Resources = addResources(world1Resources, resourcesAdded);
                    }

                    if (world === 2) {
                        world2Resources = addResources(world2Resources, resourcesAdded);
                    }

                    if (world === 3) {
                        world3Resources = addResources(world3Resources, resourcesAdded);
                    }

                });

                // convert all resource objects into strings
                world1Resources = JSON.stringify(world1Resources);
                world2Resources = JSON.stringify(world2Resources);
                world3Resources = JSON.stringify(world3Resources);

                // helper function to insert resources into the database
                const insertResources = (resources, user_id, world) => {
                    return new Promise((resolve, reject) => {
                        const insertSql = `INSERT INTO resources (resources, user_id, world) VALUES (?, ?, ?)`;
                        db.run(insertSql, [resources, user_id, world], (insertErr) => {
                            if (insertErr) {
                                console.error(insertErr.message);
                                reject(insertErr);
                            } else {
                                console.log(`World ${world} resources migrated successfully.`);
                                resolve();
                            }
                        });
                    });
                };

                // insert resources for all worlds
                Promise.all([
                    insertResources(world1Resources, user_id, 1),
                    insertResources(world2Resources, user_id, 2),
                    insertResources(world3Resources, user_id, 3)
                ])
                .then(() => {
                    resolve();
                })
                .catch((insertErr) => {
                    reject(insertErr);
                });
            }
        });
    });
}

// helper function to add resources to a world's resources
function addResources(worldResources, resourcesAdded) {
    for (let resource in resourcesAdded) {
        if (worldResources[resource]) {
            worldResources[resource] += resourcesAdded[resource];
        } else {
            worldResources[resource] = resourcesAdded[resource];
        }
    }
    return worldResources;
}

// set the user's last played version
function updateUserGameVersion(user_id, version) {
    db.run(`UPDATE users SET lastPlayedVersion = ? WHERE id = ?`, [version, user_id], (err) => {
        if (err) {
            console.error("Could not update user's last played version:", err.message);
        } else {
            console.log("User's last played version updated successfully.");
        }
    });
}

// record the user's first played version
function recordUserFirstPlayedVersion(user_id, version) {
    db.run(`UPDATE users SET firstPlayedVersion = ? WHERE id = ?`, [version, user_id], (err) => {
        if (err) {
            console.error("Could not record user's first played version:", err.message);
        } else {
            console.log("User's first played version recorded successfully.");
        }
    });
}

module.exports = {
    handleUserGameVersion
};