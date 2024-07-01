import { bonusObjectives } from "./bonusObjectives.js";

const override = true; // set to true to override the level completion requirement for the last level

const worldGradients = [
  // world 1, a nice blue
  "linear-gradient(0deg, rgba(115,128,142,1) 0%, rgba(84,199,255,1) 100%)",
  // world 2, with some sunset orange
  "linear-gradient(to bottom, #87CEEB 50%, #FF6347)",
  // world 3, ominous purple
  "linear-gradient(0deg, rgba(162,97,113,1) -35%, rgba(64,101,148,1) 59%, rgba(44,38,88,1) 125%)",
  // world 4, night sky
  "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)",
];

function generateInventoryList(images) {
  const ul = document.createElement('ul');
  ul.id = 'inventory-list';

  images.forEach(image => {
    const li = document.createElement('li');

    const img = document.createElement('img');
    img.src = image.src;
    img.alt = 'Image';
    img.style.width = '50px';
    img.style.height = '50px';

    li.appendChild(img);

    if (image.number !== 1) {
      const h3 = document.createElement('h3');
      h3.style.position = 'absolute';
      h3.style.zIndex = '200';
      h3.style.color = image.color || 'black'; // Use the provided color or default to black
      h3.textContent = `x ${image.number}`;
      li.appendChild(h3);
    }

    ul.appendChild(li);
  });

  return ul;
}

// a class for managing medals players earn for completing levels or bunus challenges
class Medal {
  constructor(name, value, description, parent, levelNum) {
    this.name = name;
    this.value = value;
    this.description = description;
    this.parent = parent;
    this.worldNum = this.parent.parent.worldSelected;
    this.levelNum = levelNum;
    this.medalReference = null;
  }
  // create the medal
  createHTML(box = null) {
    let medal = document.createElement("img");
    let src;
    // if it's a who needs blocks medal, use the image that relates to the number of blocks
    if (this.name === "Who needs blocks?") {
      src = bonusObjectives[this.name][this.value - 1];
    } else {
      src = bonusObjectives[this.name];
    }
    medal.src = src; // || "../../img/crown.png";
    // if the medal is a crown, use the crown-image class
    if (this.name === "Beat the Level") {
      medal.className = "crown-image";
    } else {
      medal.className = "bonus-objective-image";
    }
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
        // make the box and button dark gold if this is "beat the level"
        if (this.name === "Beat the Level") {
          box.style.backgroundColor = "#879096";
        }
      }
    } else {
      medal.style.opacity = "0.5";
      // if it's the crown, don't show it at all
      if (this.name === "Beat the Level") {
        medal.style.display = "none";
      }
      // make the medal slightly grey
      medal.style.filter = "grayscale(100%)";
    }
    // when the medal is hovered over, show the description
    medal.addEventListener("mouseover", (event) => {
      // stop the event from bubbling up to the parent
      event.stopPropagation();
      console.log("hovered");
      let description = document.createElement("div");
      description.className = "medal-description";
      let title = document.createElement("h3");
      title.innerHTML = this.name;
      description.appendChild(title);

      let descriptionText = document.createElement("p");
      descriptionText.innerHTML = this.description || "No description available.";
      description.appendChild(descriptionText);
      // if the bonus objective is earned, set the background to gold
      if (medal.style.opacity === "1") {
        description.style.backgroundColor = "darkgoldenrod";
      }
      // add the description to the medal
      box.appendChild(description);

    });
    // if the user moves the mouse off the medal, remove the description
    medal.addEventListener("mouseout", () => {
      let description = box.querySelector(".medal-description");
      if (description) {
        description.remove();
      }
    });
    this.medalReference = medal;
    return medal;
  }
}
// class for managing the UI of the levels
class LevelUI {
  constructor(parent, progressBar) {
    this.parent = parent;
    this.isSandbox = false;
  }

  createBackArrow() {
    // create the back arrow
    let backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.id = 'back-button'
    let backArrow = document.createElement("img");
    backArrow.src = "../../img/Arrow.png";
    backArrow.className = "level-ui-back-arrow";
    backButton.addEventListener("click", () => {
      this.handleBackArrowClick();
      // remove the button
      this.destroyBackArrow();
    });
    backButton.appendChild(backArrow);
    // add the back arrow to the game
    document.getElementById("game-container").appendChild(backButton);
  }

  destroyBackArrow() {
    // get the back button
    let backButton = document.getElementById('back-button');
    // remove the back button from the game
    if (backButton) {
      backButton.remove();
    }
  }

  handleBackArrowClick() {
    if (this.parent.test) {
      window.location.href = "/editor.html";
    } else if (window.location.href.includes("editor")) {
      window.location.href = "/";
    } else {
      // if the level selector is open, return to the main menu
      if (document.getElementById("level-selector")) {
        window.location.href = "/";
      }
      // if the level selector is not open, quit the level, and return to the level selector
      else {
        let wait = 0;
        if (this.parent.building.camera.doingTour) {
          console.log("tour cancelled!");
          // if the camera is doing a tour, stop it, and notify that the tour has been cancelled
          this.parent.building.camera.doingTour = false;
          this.parent.building.camera.tourCancelled = true;
        }
        // if we're in view mode, disable it then return to the level selector
        if (this.parent.building.viewMode) {
          this.parent.building.buildMenu.buildModeButton.click();
          this.parent.building.viewMode = false;
        }
        setTimeout(() => {
          // prevent build mode
          this.parent.building.canEnterBuildMode = false;
          // clear the level
          this.parent.LevelLoader.clear(true);
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
          // set the help button to be invisible
          document.getElementById("help-container").style.display = "none";
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
      // make sure the gradient is applied to the whole body
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
  createBonusObjectives(levelSelector, levelNum, medalsBox, box) {
    let usedBonusObjectives = this.parent.LevelHandler.getBonusChallenges(
      this.parent.worldSelected,
      levelNum
    );
    if (usedBonusObjectives === undefined) {
      return true;
    }
    let allEarned = true;
    for (let i = 0; i < usedBonusObjectives.length; i++) {
      let medal = new Medal(
        usedBonusObjectives[i].name,
        usedBonusObjectives[i].value,
        usedBonusObjectives[i].description,
        this,
        levelNum
      ).createHTML(box);
      if (medal.style.opacity === "0.5") {
        allEarned = false;
      }
      medalsBox.appendChild(medal);
    }
    console.log(allEarned);
    return allEarned;
  }

  createMedalIcons(levelSelector, i, box) {
    let medalsBox = document.createElement("div");
    medalsBox.style.position = "absolute";
    // top 0 right 0
    medalsBox.style.top = "0px";
    medalsBox.style.right = "0px";
    // if the medals blox is clicked, start the level
    // medalsBox.addEventListener("click", () => {
    //   this.createBackArrow();
    //   this.parent.LevelLoader.load(i);
    //   levelSelector.remove();
    // });
    // display from right to left
    let crown = new Medal(
      "Beat the Level",
      1,
      "Complete the level",
      this,
      i + 1
    ).createHTML(box);
    let allEarned = false;
    // if the crown is not earned, don't show the other medals
    if (crown.style.opacity === "1") {
      allEarned = this.createBonusObjectives(levelSelector, i, medalsBox, box);
    }
    // if all other medals are earned, display the extra fancy crown
    if (allEarned) {
      crown.src = "../../img/gold-crown.png";
      // set the box to dark gold
      box.style.backgroundColor = "darkgoldenrod";
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
    let lastLevel = this.parent.LevelHandler.getLevelCount(
      this.parent.worldSelected
    );
    if (this.parent.LevelHandler.isLevelCompleted(this.parent.worldSelected, lastLevel) || override) {
      forwardImg.style.transform = "rotate(180deg)";

      forwardArrow.appendChild(forwardImg);
      worldSelector.appendChild(forwardArrow);

    }
    else {
      // show the lock icon if the last level has not been completed
      let lock = document.createElement("img");
      lock.src = "/img/lock.png";
      lock.className = "lock-icon";
      forwardArrow.appendChild(lock);
      worldSelector.appendChild(forwardArrow);
      // add a message explaining that the next world is locked until the last level is completed
      let lockMessage = document.createElement("p");
      lockMessage.style.cursor = "pointer";
      lockMessage.style.maxWidth = "200px";
      lockMessage.innerHTML = "Defeat the boss to unlock the next world!";
      worldSelector.appendChild(lockMessage);
      // if the message is clicked, start the boss level
      lockMessage.addEventListener("click", () => {
        let box = document.querySelector(".level-select-box:last-child");
        // scroll to the last level and click it
        box.scrollIntoView({ behavior: 'smooth' });
        box.click();
      });
    }

    forwardArrow.addEventListener("click", () => {
      // check if the last level in the current world has been completed
      let lastLevel = this.parent.LevelHandler.getLevelCount(
        this.parent.worldSelected
      );
      if (this.parent.LevelHandler.isLevelCompleted(this.parent.worldSelected, lastLevel)) {
        // if the last level has been completed, move to the next world
        levelSelector.remove();

        this.parent.worldSelected++;
        this.loadLevelSelector();
        this.updateArrowState(forwardArrow, worldCount);
      } else {
        // if the last level has not been completed, start the last level as a boss level        
        let box = document.querySelector(".level-select-box:last-child");
        // scroll to the last level and click it
        box.scrollIntoView({ behavior: 'smooth' });
        box.click();

      }
    });

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

  createLevelSelectButton(levelSelector, i, boss = false) {
    let box = document.createElement("div");
    if (boss) {
      box.className = "level-select-box boss";
    } else {
      box.className = "level-select-box";
    }
    box.style.position = "relative";

    // add the level's title
    let title = document.createElement("h2");
    title.className = "level-select-title";
    // get the name of the level from the level handler
    title.innerHTML = this.parent.LevelHandler.getLevelName(
      this.parent.worldSelected,
      i
    );
    box.appendChild(title);
    // add an image for the level (it is also clickable)
    let imageContainer = document.createElement("div");
    imageContainer.className = "level-select-image-container";
    let image = document.createElement("img");
    image.className = "level-select-image";
    image.src = `../../img/levelImages/world${this.parent.worldSelected}/level${i + 1}.png`;
    imageContainer.appendChild(image);

    box.appendChild(imageContainer);
    box.appendChild(this.createMedalIcons(levelSelector, i, box));
    let levelNumber = document.createElement("p");
    levelNumber.className = "level-select-number";
    levelNumber.innerHTML = `Level ${i + 1}`;

    box.appendChild(levelNumber);
    // when the box is clicked, load the level
    box.addEventListener("click", () => {
      // if it's a boss level, load the boss level
      if (boss) {
        console.log("loading boss level");
        this.parent.building.ResourceHandler.bossAnimation(box, this.parent.worldSelected)
        setTimeout(() => {
          this.createBackArrow();
          // create the back arrow
          this.parent.LevelLoader.load(i);
          levelSelector.remove();
        }, 2500);
      } else {
        this.createBackArrow();
        // create the back arrow
        this.parent.LevelLoader.load(i);
        levelSelector.remove();
      }

    });
    // add the box to the element with the id level-container
    document.getElementById("level-container").appendChild(box);
  }
  // creates the level menu
  loadLevelSelector() {
    // remove the back arrow if it exists
    this.destroyBackArrow();
    // if build mode is active, deactivate it
    if (this.parent.building.buildInProgress) {
      this.parent.building.toggleBuildingMode();
    }
    // destroy the back arrow if it exists
    this.destroyBackArrow();
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
    returnText.innerText = "Main Menu"
    returnArrow.appendChild(returnText)
    returnArrow.addEventListener("click", () => {
      this.handleBackArrowClick();
    });
    worldSelector.appendChild(returnArrow);
    if (!this.isSandbox) {

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

      // add a button to open player inventory
      let inventoryButton = document.createElement("button");
      inventoryButton.id = "inventory-button";
      inventoryButton.className = "settings-button";
      inventoryButton.addEventListener("click", () => {
        // create the inventory list
        let inventoryArray = this.parent.building.ResourceHandler.generateInventoryList(this.parent.worldSelected);
        let inventoryList = generateInventoryList(inventoryArray);
        // add the inventory list to the inventory container
        let inventoryContainer = document.getElementById("inventory-list");
        inventoryContainer.innerHTML = "";
        inventoryContainer.appendChild(inventoryList);
        let InventoryPopup = document.getElementById("inventory-popup");
        InventoryPopup.classList.remove("hidden");
      });
      inventoryButton.style.position = "absolute";
      inventoryButton.style.right = "70px";
      let inventoryImage = document.createElement("img");
      inventoryImage.className = "settings-image";
      inventoryImage.src = "/img/inventory.png";
      inventoryImage.alt = "inventory";
      inventoryButton.appendChild(inventoryImage);
      inventoryButton.style.maxWidth = "50px"; // workaround for mobile css bug I didn't want to track down

      worldSelector.appendChild(inventoryButton);
    }
    // add the settings button
    let settingsButton = document.createElement("button");
    settingsButton.id = "settings-button";
    settingsButton.className = "settings-button";
    // use inline styles to make sure the button displays all the way to the right
    settingsButton.style.position = "absolute";
    settingsButton.style.right = "15px";
    settingsButton.style.maxWidth = "50px"; // workaround for mobile css bug I didn't want to track down

    let settingsImage = document.createElement("img");
    settingsImage.className = "settings-image";
    settingsImage.src = "/img/settings.png";
    settingsImage.alt = "settings";
    settingsButton.appendChild(settingsImage);

    // this is a temporary (who am I kidding it will probably stay) solution to the settings button
    // works very similarly to the settings button on the index page, but changed to work with this settings button that does not always exist
    settingsButton.addEventListener("click", () => {
      let settingsPopup = document.getElementById("settings-popup");
      settingsPopup.classList.remove("hidden");
    });

    worldSelector.appendChild(settingsButton);
    levelSelector.appendChild(worldSelector);
    // add a container for the levels
    let levelContainer = document.createElement("div");
    levelContainer.id = "level-container";
    levelContainer.className = "level-container";
    levelSelector.appendChild(levelContainer);
    // add the level selector to the game
    game.appendChild(levelSelector);
    // add a button for each level
    if (this.isSandbox) {
      this.parent.worldSelected = 5; // this is not ideal, but it works
      // currently, the sandbox is the last world, adding more worlds will break this
    }

    let count = this.parent.LevelHandler.getLevelCount(
      this.parent.worldSelected
    );
    for (let i = 0; i < count; i++) {
      // if it's the last one, make it a boss level
      if (i === count - 1) {
        this.createLevelSelectButton(levelSelector, i, true);
      }
      else {
        this.createLevelSelectButton(levelSelector, i);
      }
    }

  }
  gameOver() {
    let gameOver = document.createElement("div");
    gameOver.classList.add("toast-game-over");
    gameOver.innerText = "Click to return to build mode";
    // define the listener as a named function
    const clickListener = () => {
      this.parent.building.toggleBuildingMode();
      gameOver.remove();
      // unblur the game
      document.getElementById("blur").style.filter = "none";
      // remove the listener after it's activated
      document.removeEventListener("click", clickListener);
    };

    // add the listener to the document to listen for any click
    document.addEventListener("click", clickListener);
    // define the listener as a named function
    const keydownListener = (event) => {
      if (event.key === "b") {
        gameOver.remove();
        // remove the listener after it's activated
        document.removeEventListener("keydown", keydownListener);
        // unblur the game
        document.getElementById("blur").style.filter = "none";
      }
    };

    // blur the game
    document.getElementById("blur").style.filter = "blur(5px)";

    // add the listener
    document.addEventListener("keydown", keydownListener);

    // add the game over message to the body so it's on top of everything
    document.body.appendChild(gameOver);
    console.log("game over");
  }

  dialogBox(title, message, confirm, cancel = null, cancelFunction = null) {
    console.log('message:', message);
    // Create backdrop
    let backdrop = document.createElement("div");
    backdrop.classList.add("backdrop");
    document.body.appendChild(backdrop);

    // Create dialog box
    let dialogBox = document.createElement("div");
    dialogBox.classList.add("dialog-box");
    // create the title
    let dialogTitle = document.createElement("h2");
    dialogTitle.innerText = title;
    dialogBox.appendChild(dialogTitle);
    // create the message
    let dialogText = document.createElement("p");
    dialogText.innerText = message;
    dialogBox.appendChild(dialogText);

    // a button container
    let buttonContainer = document.createElement("div");
    buttonContainer.className = "dialog-box-button-container";
    // Confirm button
    let confirmButton = document.createElement("button");
    if (!cancel) {
      confirmButton.className = "preferred";
    }
    confirmButton.innerText = confirm;
    confirmButton.addEventListener("click", () => {
      backdrop.remove(); // Remove backdrop
      dialogBox.remove();
    });
    buttonContainer.appendChild(confirmButton);

    // Cancel button (optional)
    if (cancel) {
      let cancelButton = document.createElement("button");
      cancelButton.className = "preferred";
      cancelButton.innerText = cancel;
      cancelButton.addEventListener("click", () => {
        backdrop.remove(); // Remove backdrop
        dialogBox.remove();
        if (cancelFunction) {
          cancelFunction(); // call the cancel function
        }
      });
      buttonContainer.appendChild(cancelButton);
    }

    dialogBox.appendChild(buttonContainer);

    document.body.appendChild(dialogBox);

    // Center dialog box
    dialogBox.style.position = "fixed";
    dialogBox.style.top = "50%";
    dialogBox.style.left = "50%";
    dialogBox.style.transform = "translate(-50%, -50%)";
    dialogBox.style.zIndex = "1001"; // Ensure it's above the backdrop

    // Style backdrop
    backdrop.style.position = "fixed";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100%";
    backdrop.style.height = "100%";
    backdrop.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black
    backdrop.style.zIndex = "1000"; // Ensure it's below the dialog box
  }
}

export default LevelUI;
