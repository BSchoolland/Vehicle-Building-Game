// handles all popups for configuring levels (e.g. setting the level name, objectives, and allowed blocks)
class LevelConfigurationHandler {
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.levelName = "My Level #1";
        this.objectives = [];
        this.allowedBlocks = [];
        this.handlePopups();
    }
    handlePopups() {
        // set up listeners for all the popups

        // objectives html objects
        const objectivesPopup = document.getElementById("objective-popup");
        const objectivesButton = document.getElementById("open-objective");
        const closeObjectivesButton = document.getElementById("close-objective");
        // details html objects
        const detailsPopup = document.getElementById("details-popup");
        const detailsButton = document.getElementById("open-details");
        const closeDetailsButton = document.getElementById("close-details");
        // allowed blocks html objects
        const allowedBlocksPopup = document.getElementById("block-popup");
        const allowedBlocksButton = document.getElementById("open-block");
        const closeAllowedBlocksButton = document.getElementById("close-block");

        // if the objectives button is clicked, open the objectives popup
        objectivesButton.addEventListener("click", () => {
            // remove the hidden class
            objectivesPopup.classList.remove("hidden");
        });

        // if the close objectives button is clicked, close the objectives popup
        closeObjectivesButton.addEventListener("click", () => {
            // add the hidden class
            objectivesPopup.classList.add("hidden");
        });

        // if the details button is clicked, open the details popup
        detailsButton.addEventListener("click", () => {
            // remove the hidden class
            detailsPopup.classList.remove("hidden");
        });

        // if the close details button is clicked, close the details popup
        closeDetailsButton.addEventListener("click", () => {
            // add the hidden class
            detailsPopup.classList.add("hidden");
        });

        // if the allowed blocks button is clicked, open the allowed blocks popup
        allowedBlocksButton.addEventListener("click", () => {
            // remove the hidden class
            allowedBlocksPopup.classList.remove("hidden");
        });

        // if the close allowed blocks button is clicked, close the allowed blocks popup
        closeAllowedBlocksButton.addEventListener("click", () => {
            // add the hidden class
            allowedBlocksPopup.classList.add("hidden");
        });        
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

export default LevelConfigurationHandler;