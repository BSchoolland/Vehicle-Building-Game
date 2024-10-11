class LevelTutorial{
    constructor(parent) {
        this.parent = parent;
        this.popups = [];
        this.world = null;
        this.level = null;
    }

    setPopups(popups, world, level) {
        this.world = world;
        this.level = level;
        console.log(popups);
        this.popups = popups;
    }
    
    showTutorial(popupNumber){
        // fill the text 
        let test = this.popups[popupNumber].text;
        let tutorialText = document.querySelector("#tutorial-content p");
        tutorialText.innerHTML = test;
        // fill the image
        // let tutorialImage = document.querySelector("#tutorial-content img");
        // let fullSrc = `/img/tutorial/world${this.world}/level${this.level}/${this.popups[popupNumber].image}`
        // tutorialImage.src = fullSrc;
        // show the popup
        let tutorialPopup = document.querySelector("#tutorial-popup");
        tutorialPopup.classList.remove("hidden");
    }

    checkLoad() {
        // check if any of the popups should show when the level is loaded
        for (let i = 0; i < this.popups.length; i++) {
            if (this.popups[i].activates === "load") {
                this.showTutorial(i);
                this.popups[i].activates = "none";
                break;
            }
        }
    }

    checkInteract(type = "interact") { // could use type to determine what kind of interaction
        // check if any of the popups should show when the player interacts with something
        for (let i = 0; i < this.popups.length; i++) {
            if (this.popups[i].activates === type) {
                setTimeout(() => {
                this.showTutorial(i);
                }, 600);
                this.popups[i].activates = "none";
                break;
            }
        }
    }

    checkStart() {
        // check if any of the popups should show when the level starts
        for (let i = 0; i < this.popups.length; i++) {
            if (this.popups[i].activates === "start") {
                this.showTutorial(i);
                this.popups[i].activates = "none";
                break;
            }
        }
    }

    checkVictory() {
        // check if any of the popups should show when the player wins the level
        for (let i = 0; i < this.popups.length; i++) {
            if (this.popups[i].activates === "victory") {
                this.showTutorial(i);
                this.popups[i].activates = "none";
                break;
            }
        }
    }

}

export default LevelTutorial;