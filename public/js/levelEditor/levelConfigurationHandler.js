// handles all popups for configuring levels (e.g. setting the level name, objectives, and allowed blocks)
class LevelConfigurationHandler {
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.levelName = "My Level #1";
        this.objectives = [];
        this.allowedBlocks = [];
    }
    handlePopups() {
        // set up listeners for all the popups
    }
    // set the level name
    setLevelName(levelName) {
        this.levelName = levelName;
    }
    // get the level name
    getLevelName() {
        return this.levelName;
    }
    // set the objectives
    setObjectives(objectives) {
        this.objectives = objectives;
    }
    // get the objectives
    getObjectives() {
        return this.objectives;
    }
    // set the allowed blocks
    setAllowedBlocks(allowedBlocks) {
        this.allowedBlocks = allowedBlocks;
    }
    // get the allowed blocks
    getAllowedBlocks() {
        return this.allowedBlocks;
    }
}