import { bonusObjectives } from "./bonusObjectives.js";
const medalSize = "30px";

const worldGradients = [
  // world 1, a nice blue
  "linear-gradient(0deg, rgba(115,128,142,1) 0%, rgba(84,199,255,1) 100%)",
  // world 2, with some sunset orange
  "linear-gradient(to bottom, #87CEEB 50%, #FF6347)",
  // world 3, ominous purple
  "linear-gradient(0deg, rgba(162,97,113,1) -35%, rgba(64,101,148,1) 59%, rgba(44,38,88,1) 125%)",
];

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
    let src;
    // if it's a who needs blocks medal, use the image that relates to the number of blocks
    if (this.name === "Who needs blocks?") {
      src = bonusObjectives[this.name][this.value - 1];
    } else {
      src = bonusObjectives[this.name];
    }
    medal.src = src; // || "../../img/crown.png";
    medal.className = "medal";
    medal.style.width = medalSize;
    medal.style.height = medalSize;
    medal.style.padding = "10px";
    medal.title = this.description;
    // check if the medal has been earned
    if (
      this.parent.parent.LevelHandler.isMedalEarned(
        this.worldNum,
        this.levelNum,
        this.name
      )
    ) {
      medal.style.opacity = "1";
      if (box != null) {
        // make the box and button dark gold
        box.style.backgroundColor = "darkgoldenrod";
        button.style.backgroundColor = "darkgoldenrod";
      }
    } else {
      medal.style.opacity = "0.5";
      // make the medal slightly grey
      medal.style.filter = "grayscale(100%)";
    }
    // when the medal is clicked, display the description
    medal.addEventListener("click", (event) => {
      // stop the event from bubbling up to the parent
      event.stopPropagation();
      console.log("hovered");
      let description = document.createElement("div");
      description.className = "medal-description";
      let title = document.createElement("h3");
      title.innerHTML = this.name;
      description.appendChild(title);

      let descriptionText = document.createElement("p");
      descriptionText.innerHTML = this.description + " (click to close)";
      description.appendChild(descriptionText);
      // add the description to the body
      document.body.appendChild(description);
      // now if the user clicks anywhere, remove the description, and remove the event listener
      setTimeout(() => {
        document.addEventListener("click", () => {
          description.remove();
          document.removeEventListener("click", () => {});
        });
      }, 250);
    });
    return medal;
  }
}
// class for managing the UI of the levels
class LevelUI {
  constructor(parent, progressBar) {
    this.parent = parent;
    // this.createBackArrow(progressBar);
  }
  createBackArrow(progressBar) {
    // if we are on the home page (/), don't create a back arrow
    if (window.location.pathname === "/") {
      return;
    }
    // wait for the game to load
    const interval = setInterval(() => {
      if (progressBar.loaded) {
        clearInterval(interval);
        // create the back arrow
        let backArrow = document.createElement("img");
        backArrow.src = "../../img/back-arrow.png";
        backArrow.className = "back-arrow";
        backArrow.addEventListener("click", () => {
          this.handleBackArrowClick();
        });
        // add the back arrow to the game
        document.getElementById("game-container").appendChild(backArrow);
      }
    }
    , 100);
  }
  handleBackArrowClick() {
    if (this.parent.test) {
      window.location.href = "/editor.html";
    } else if (window.location.href.includes("editor")) {
      window.location.href = "/";
    } else {
      // if the level selector is open, retrun to the main menu
      if (document.getElementById("level-selector")) {
        window.location.href = "/";
      }
      // if the level selector is not open, quit the level, and return to the level selector
      else {
        let wait = 0;
        if (this.parent.building.camera.doingTour) {
          // if the camera is doing a tour, stop it, and notify that the tour has been cancelled
          this.parent.building.camera.doingTour = false;
          this.parent.building.camera.tourCancelled = true;
        }
        setTimeout(() => {
          // prevent build mode
          this.parent.building.canEnterBuildMode = false;
          // clear the level
          this.parent.LevelLoader.clear();
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
      // set the body gradient to the world gradient
      document.body.style.background = worldGradients[i];
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
  createBonusObjectives(levelSelector, levelNum, box, button) {
    let usedBonusObjectives = this.parent.LevelHandler.getBonusChallenges(
      this.parent.worldSelected,
      levelNum
    );
    if (usedBonusObjectives === undefined) {
      return;
    }
    for (let i = 0; i < usedBonusObjectives.length; i++) {
      let medal = new Medal(
        usedBonusObjectives[i].name,
        usedBonusObjectives[i].value,
        usedBonusObjectives[i].description,
        this,
        levelNum
      ).createHTML();
      box.appendChild(medal);
    }
  }

  createMedalIcons(levelSelector, i, box, button) {
    let medalsBox = document.createElement("div");
    medalsBox.style.position = "absolute";
    // top 0 right 0
    medalsBox.style.top = "0px";
    medalsBox.style.right = "0px";
    // if the medals blox is clicked, start the level
    medalsBox.addEventListener("click", () => {
      this.parent.LevelLoader.load(i);
      levelSelector.remove();
    });
    // display from right to left
    let crown = new Medal(
      "Beat the Level",
      1,
      "Complete the level",
      this,
      i + 1
    ).createHTML(box, button);
    // if the crown is not earned, don't show the other medals
    if (crown.style.opacity === "1") {
      this.createBonusObjectives(levelSelector, i, medalsBox, button);
    }
    // the crown is placed in the corner of the image
    medalsBox.appendChild(crown);
    return medalsBox;
  }

  createForwardArrow(levelSelector, worldSelector, worldCount) {
    let forwardArrow = document.createElement("button");
    forwardArrow.className = "world-arrow";

    let forwardImg = document.createElement("img");
    forwardImg.src = "/img/Arrow.png"; 
    // rotate the arrow 180 degrees
    forwardImg.style.transform = "rotate(180deg)";
    forwardArrow.appendChild(forwardImg);

    forwardArrow.addEventListener("click", () => {
      levelSelector.remove();
      this.parent.worldSelected++;
      this.loadLevelSelector();
      this.updateArrowState(forwardArrow, worldCount);
    });
    worldSelector.appendChild(forwardArrow);
    this.updateArrowState(forwardArrow, worldCount);
  }

  createBackwardArrow(levelSelector, worldSelector, worldCount) {
    let backwardArrow = document.createElement("button");
    backwardArrow.className = "world-arrow";

    let backwardImg = document.createElement("img");
    backwardImg.src = "/img/Arrow.png"; 
    backwardArrow.appendChild(backwardImg);

    backwardArrow.addEventListener("click", () => {
      levelSelector.remove();
      this.parent.worldSelected--;
      this.loadLevelSelector();
      this.updateArrowState(backwardArrow, worldCount, "backward");
    });
    worldSelector.appendChild(backwardArrow);
    this.updateArrowState(backwardArrow, worldCount, "backward");
  }

  updateArrowState(arrow, worldCount, direction = "forward") {
    if (direction === "backward" && this.parent.worldSelected <= 1) {
      arrow.disabled = true;
      arrow.classList.add("disabled");
    } else if (direction === "forward" && this.parent.worldSelected >= worldCount) {
      arrow.disabled = true;
      arrow.classList.add("disabled");
    } else {
      arrow.disabled = false;
      arrow.classList.remove("disabled");
    }
  }

  createLevelSelectButton(levelSelector, i) {
    let box = document.createElement("div");
    box.className = "level-select-box";
    box.style.position = "relative";
    let button = document.createElement("button");
    button.className = "level-select-button";
    button.innerHTML = `Level ${i + 1}`;
    button.addEventListener("click", () => {
      this.parent.LevelLoader.load(i);
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
    box.appendChild(this.createMedalIcons(levelSelector, i, box, button));

    box.appendChild(button);
    // add the box to the element with the id level-container
    document.getElementById("level-container").appendChild(box);
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
    levelSelector.id = "level-selector";
    levelSelector.className = "level-menu-container";
    // a list of buttons at the top to select the world
    let worldSelector = document.createElement("div");
    worldSelector.id = "world-selector";
    worldSelector.className = "level-menu-header";
    // get the game object
    let game = document.getElementById("game-container");
    // add the return to main menu button
    let returnArrow = document.createElement('button');
    returnArrow.className = "return-arrow";

    let returnImg = document.createElement("img");
    returnImg.src = "/img/Arrow.png";
    returnArrow.appendChild(returnImg);
    let returnText = document.createElement("h2");
    returnText.innerText = "Back"
    returnArrow.appendChild(returnText)
    returnArrow.addEventListener("click", () => {
      this.handleBackArrowClick();
    });
    worldSelector.appendChild(returnArrow);
    // add a button for each world
    let worldCount = this.parent.LevelHandler.getWorldCount();

    // use the backward arrow function to create the backward arrow
    this.createBackwardArrow(levelSelector, worldSelector, worldCount);
    // the title of the world
    let worldTitle = document.createElement("h1");
    worldTitle.innerHTML = `World ${this.parent.worldSelected}`;
    worldSelector.appendChild(worldTitle);
    // use the forward arrow function to create the forward arrow
    this.createForwardArrow(levelSelector, worldSelector, worldCount);
    
    levelSelector.appendChild(worldSelector);
    // add a container for the levels
    let levelContainer = document.createElement("div");
    levelContainer.id = "level-container";
    levelContainer.className = "level-container";
    levelSelector.appendChild(levelContainer);
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
