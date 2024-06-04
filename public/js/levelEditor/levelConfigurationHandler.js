// handles all popups for configuring levels (e.g. setting the level name, objectives, and allowed blocks)
class LevelConfigurationHandler {
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.levelName = "My Level #1";
        this.levelHint = "This is a hint for the level";
        this.coin_objective = 0;
        this.destroy_objective = 0;
        this.time_objective = 0;
        this.survive_objective = 0;
        this.allowedBlocks = {
            "basicBlock": 3,
            "wheelBlock": 2,
            "seatBlock": 1,
        }
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
        console.log(allowedBlocksPopup, allowedBlocksButton, closeAllowedBlocksButton);
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

        // set up handlers to listen for form submission and update the level configuration (also preset the values)
        // objectives form
        const objectivesForm = document.getElementById("objective-form");
        // preset the values
        document.getElementById("coins").value = this.coin_objective;
        document.getElementById("destroy").value = this.destroy_objective;
        document.getElementById("time").value = this.time_objective;
        document.getElementById("survive").value = this.survive_objective;
        // listen for the form submission
        objectivesForm.addEventListener("submit", (event) => {
            event.preventDefault();
            // get the values from the form
            const coinObjective = document.getElementById("coin").value;
            const destroyObjective = document.getElementById("destroy").value;
            const timeObjective = document.getElementById("time").value;
            const surviveObjective = document.getElementById("survive").value;
            // set the values
            this.coin_objective = coinObjective;
            this.destroy_objective = destroyObjective;
            this.time_objective = timeObjective;
            this.survive_objective = surviveObjective;
            // close the popup
            objectivesPopup.classList.add("hidden");
        });
        // details form
        const detailsForm = document.getElementById("details-form");
        // preset the values
        document.getElementById("details-name").value = this.levelName;
        document.getElementById("details-hint").value = this.levelHint;
        // listen for the form submission
        detailsForm.addEventListener("submit", (event) => {
            event.preventDefault();
            // get the values from the form
            const levelName = document.getElementById("details-name").value;
            const levelHint = document.getElementById("details-hint").value;
            // set the values
            this.levelName = levelName;
            this.levelHint = levelHint;
            // close the popup
            detailsPopup.classList.add("hidden");
        });

        // block form
        const blockForm = document.getElementById("block-form");
        // preset the text area
        const blockTextArea = document.getElementById("block-text");
        blockTextArea.value = JSON.stringify(this.allowedBlocks);
        // listen for the form submission
        blockForm.addEventListener("submit", (event) => {
            event.preventDefault();
            // get the values from the form
            const blockText = blockTextArea.value;
            // set the values
            try {
                JSON.parse(blockText);
            }
            catch (error) {
                alert("Invalid JSON");
                return;
            }
            this.allowedBlocks = JSON.parse(blockText);
            // close the popup
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