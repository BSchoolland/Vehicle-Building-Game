
// a dictionary of bonus objectives and their images
let bonusObjectives = {
  "Beat the Level": "../../img/crown.png",
  "Who needs blocks?": "../../img/bonus-objectives/noBlock.png",
  "Unarmed and Dangerous": "../../img/bonus-objectives/noWeapon.png",
  "Complete Overkill": "../../img/bonus-objectives/overkill.png",
  "Not a Scratch": "../../img/bonus-objectives/noDamage.png",
  "No Wheels": "../../img/bonus-objectives/noWheels.png",
};

// a class for managing medals players earn for completing levels or bunus challenges
class Medal {
  constructor(name, value, description, parent, levelNum) {
    this.name = name;
    this.value = value;
    this.description = description;
    this.parent = parent;
    this.worldNum = this.parent.parent.worldSelected;
    this.levelNum = levelNum;
  }
  // create the medal
  createHTML(box = null, button = null) {
    let medal = document.createElement("img");
    medal.src = bonusObjectives[this.name] || "../../img/crown.png";
    medal.className = "medal";
    medal.style.width = "50px";
    medal.style.height = "50px";
    medal.title = this.description;
    // check if the medal has been earned
    if (this.parent.parent.LevelHandler.isMedalEarned(this.worldNum, this.levelNum, this.name)) {
      medal.style.opacity = "1";
      if (box != null) {
        // make the box and button dark gold
        box.style.backgroundColor = "darkgoldenrod";
        button.style.backgroundColor = "darkgoldenrod";
      }
    } else {
      medal.style.opacity = "0.2";
    }
    return medal;
  }

}
// class for managing the UI of the levels
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
      this.handleBackArrowClick();
    });
    // append to the body
    document.body.appendChild(backArrow);
  }
  handleBackArrowClick() {
    if (this.parent.test) {
      window.location.href = "/editor.html";
    } else if (window.location.href.includes("editor")) {
      window.location.href = "/";
    } else {
      // if the level selector is open, retrun to the main menu
      if (document.getElementById("level-selector")) {
        console.log(document.getElementById("level-selector"));
        window.location.href = "/";
      }
      // if the level selector is not open, quit the level, and return to the level selector
      else {
        let wait = 0;
        if (this.parent.building.camera.doingTour) {
          // if the camera is doing a tour, stop it
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
          this.parent.playerContraption.clear();
          // deactivate build mode if it is active
          if (this.parent.building.buildInProgress) {
            this.parent.building.toggleBuildingMode(true);
          }
          // set the stats to be invisible
          document.getElementById("stats").style.display = "none";
          // set the survival time to 0
          this.parent.secondsSurvived = 0;
          //open the level selector
          this.loadLevelSelector();
        }, wait);
      }
    }
  }

  createWorldSelectButton(worldSelector, i, levelSelector) {
    let button = document.createElement("button");
    button.className = "world-select-button";
    button.innerHTML = `World ${i + 1}`;
    // if this world is already selected, make the button look selected
    if (i + 1 === this.parent.worldSelected) {
      button.className = "world-select-button selected";
    } else {
      button.addEventListener("click", () => {
        levelSelector.remove();
        this.parent.worldSelected = i + 1;
        this.loadLevelSelector();
        return;
      });
    }
    worldSelector.appendChild(button);
  }

  createMedals(levelSelector, i, box, button) {
    let medalsBox = document.createElement("div");
    medalsBox.style.position = "absolute";
    // top 0 right 0
    medalsBox.style.top = "0px";
    medalsBox.style.right = "0px";
    let crown = new Medal("Beat the Level", 1, "Complete the level", this, i + 1).createHTML(box, button);
    

    // the crown is placed in the corner of the image
    medalsBox.appendChild(crown);
    return medalsBox;
  }

  createLevelSelectButton(levelSelector, i) {
    let box = document.createElement("div");
    box.className = "level-select-box";
    box.style.position = "relative";
    let button = document.createElement("button");
    button.className = "level-select-button";
    button.innerHTML = `Level ${i + 1}`;
    button.addEventListener("click", () => {
      this.parent.load(i);
      levelSelector.remove();
    });
    // add an image for the level (it is also clickable)
    let image = document.createElement("img");
    image.className = "level-select-image";
    image.src = `../../img/world${this.parent.worldSelected}.png`;
    image.addEventListener("click", () => {
      this.parent.LevelLoader.load(i);
      levelSelector.remove();
    });
    box.appendChild(image);
    box.appendChild(this.createMedals(levelSelector, i, box, button));
    
    box.appendChild(button);
    levelSelector.appendChild(box);
  }
  // creates the level menu
  loadLevelSelector() {
    // if build mode is active, deactivate it
    if (this.parent.building.buildInProgress) {
      this.parent.building.toggleBuildingMode();
    }
    // prevent build mode
    this.parent.building.canEnterBuildMode = false;
    // a screen to select the level to play
    let levelSelector = document.createElement("div");
    // a list of buttons at the top to select the world
    let worldSelector = document.createElement("div");
    worldSelector.id = "world-selector";
    worldSelector.className = "world-select-menu";
    // get the game object
    let game = document.getElementById("game-container");
    // add the world selector to the game
    game.appendChild(worldSelector);
    // add a button for each world
    let worldCount = this.parent.LevelHandler.getWorldCount();
    for (let i = 0; i < worldCount; i++) {
      this.createWorldSelectButton(worldSelector, i, levelSelector);
    }
    levelSelector.appendChild(worldSelector);
    levelSelector.id = "level-selector";
    levelSelector.className = "level-select-menu";
    // get the game object
    // add the level selector to the game
    game.appendChild(levelSelector);
    // add a button for each level
    let count = this.parent.LevelHandler.getLevelCount(
      this.parent.worldSelected
    );
    for (let i = 0; i < count; i++) {
      this.createLevelSelectButton(levelSelector, i);
    }
  }
}

export default LevelUI;
