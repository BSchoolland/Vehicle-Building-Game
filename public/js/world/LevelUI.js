// class for managing the UI of the level
class LevelUI {
    constructor(parent) {
        this.parent = parent;
        this.createBackArrow();

    }
    createBackArrow() {
        // create a back arrow for leaving levels or returning to the main menu
        let backArrow = document.createElement("img");
        backArrow.src = "../../img/back-arrow.png";
        backArrow.id = "back-arrow";
        backArrow.className = "back-arrow";
        backArrow.addEventListener("click", () => {
        if (this.parent.test) {
            window.location.href = "/editor.html";
        }
        else if (window.location.href.includes("editor")){
            window.location.href = "/";
        }
        else {
            // if the level selector is open, retrun to the main menu
            if (document.getElementById("level-selector")) {
            console.log(document.getElementById("level-selector"));
            window.location.href = "/";
            } 
            // if the level selector is not open, quit the level, and return to the level selector
            else {
                let wait = 0;
                if (this.parent.building.camera.doingTour) { // if the camera is doing a tour, stop it
                    this.parent.building.camera.doingTour = false;
                }
                setTimeout(() => {
                    // prevent build mode
                    this.parent.building.canEnterBuildMode = false;
                    // clear the level
                    this.parent.clear();
                    // remove the tutorial text
                    document.getElementById("tutorial-text").style.display = "none";
                    // clear the player contraption
                    this.playerContraption.clear();
                    // deactivate build mode if it is active
                    if (this.parent.building.buildInProgress) {
                        this.parent.building.toggleBuildingMode(true);
                    }
                    // set the stats to be invisible
                    document.getElementById("stats").style.display = "none";
                    // set the survival time to 0
                    this.parent.secondsSurvived = 0;
                    //open the level selector
                    this.parent.loadLevelSelector();
                }, wait);
            }
        }
        }); // Add closing parenthesis and semicolon
        // append to the body
        document.body.appendChild(backArrow);
    }
    
}
