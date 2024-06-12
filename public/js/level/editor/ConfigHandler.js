import {
    RemoteBlock,
    BasicWoodenBlock,
    BasicIronBlock,
    BasicDiamondBlock,
    SeatBlock,
    WheelBlock,
    rocketBoosterBlock,
    SpikeBlock,
    TNTBlock,
    GrappleBlock,
    PoweredHingeBlock,
} from "../../vehicle/blocks.js";




// handles all popups for configuring levels (e.g. setting the level name, objectives, and allowed blocks)
class ConfigHandler {
    constructor(levelManager) {
        this.levelManager = levelManager;
        this.levelName = "My Level #1";
        this.levelHint = "This is a hint for the level";
        this.coin_objective = 0;
        this.destroy_objective = 0;
        this.time_objective = 0;
        this.survive_objective = 0;
        this.allowedBlocks = {
            BasicBlock: 3,
            WheelBlock: 2,
            SeatBlock: 1,
        };
        this.killBelow = 0;
    }
    init() {
        this.handlePopups();
    }
    handlePopups() {
        // set up listeners for all the popups

        // objectives html objects
        const objectivesPopup = document.getElementById("objective-popup");
        const objectivesButton = document.getElementById("open-objective");
        const closeObjectivesButton =
            document.getElementById("close-objective");
        // details html objects
        const detailsPopup = document.getElementById("details-popup");
        const detailsButton = document.getElementById("open-details");
        const closeDetailsButton = document.getElementById("close-details");
        // allowed blocks html objects
        const allowedBlocksPopup = document.getElementById("block-popup");
        const allowedBlocksButton = document.getElementById("open-block");
        const closeAllowedBlocksButton = document.getElementById("close-block");
        console.log(
            allowedBlocksPopup,
            allowedBlocksButton,
            closeAllowedBlocksButton
        );
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
            const coinObjective = parseInt(
                document.getElementById("coins").value
            );
            const destroyObjective = parseInt(
                document.getElementById("destroy").value
            );
            const timeObjective = parseInt(
                document.getElementById("time").value
            );
            const surviveObjective = parseInt(
                document.getElementById("survive").value
            );
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
            } catch (error) {
                alert("Invalid JSON");
                return;
            }
            this.allowedBlocks = JSON.parse(blockText);
            // close the popup
            allowedBlocksPopup.classList.add("hidden");
        });
    }
    getObjectives() {
        const objectiveTypes = [
            // different types of levels have different objectives
            { name: "Destroy", value: this.destroy_objective }, // destroy x blocks
            { name: "Collect", value: this.coin_objective }, // collect x coins
            { name: "Survive", value: this.survive_objective }, // survive for x seconds
            { name: "BeforeTime", value: this.time_objective }, // complete the level in x seconds
        ];
        return objectiveTypes;
    }

    setObjectives(objectiveTypes) {
        objectiveTypes.forEach((objective) => {
            switch (objective.name) {
                case "Destroy":
                    this.destroy_objective = objective.value;
                    break;
                case "Collect":
                    this.coin_objective = objective.value;
                    break;
                case "Survive":
                    this.survive_objective = objective.value;
                    break;
                case "BeforeTime":
                    this.time_objective = objective.value;
                    break;
            }
        });
        // update the form values
        document.getElementById("coins").value = this.coin_objective;
        document.getElementById("destroy").value = this.destroy_objective;
        document.getElementById("time").value = this.time_objective;
        document.getElementById("survive").value = this.survive_objective;
    }

    getLevelDetails() {
        return {
            title: this.levelName,
            tutorialText: this.levelHint,
        };
    }

    setLevelDetails(title, tutorialText) {
        this.levelName = title;
        this.levelHint = tutorialText;
        // update the form values
        document.getElementById("details-name").value = this.levelName;
        document.getElementById("details-hint").value = this.levelHint;
    }

    getAllowedBlocks() {
        let num = 0;

        let buildingBlockTypes = [];

        for (const key in this.allowedBlocks) {
            num++;

            buildingBlockTypes.push({
                name: key.replace(/([A-Z])/g, ' $1').trim(),
                key: num.toString(),
                type: key,
                limit: this.allowedBlocks[key],
            });
        }
        return buildingBlockTypes;
    }

    setAllowedBlocks(buildingBlockTypes) {
        this.allowedBlocks = {};
        for (const block of buildingBlockTypes) {
            this.allowedBlocks[block.type] = block.limit;
        }
        // update the form values
        document.getElementById("block-text").value = JSON.stringify(
            this.allowedBlocks
        );
    }
}

export default ConfigHandler;
