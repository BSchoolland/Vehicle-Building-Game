// Import necessary classes from your block definitions
import {
  RemoteBlock,
  BasicWoodenBlock,
  BasicIronBlock,
  BasicDiamondBlock,
  SeatBlock,
  WheelBlock,
  rocketBoosterBlock,
  SpikeBlock,
  GrappleBlock,
  PoweredHingeBlock,
  TNTBlock,
  flameThrower,
  LightBlock
} from "../vehicle/blocks.js";
import { Contraption } from "../vehicle/contraption.js";
import { playSound, setSong } from "../sounds/playSound.js";

const buildClassesToImages = {
  "BasicWoodenBlock": "/img/build-buttons/basic-block.png",
  "BasicIronBlock": "/img/build-buttons/iron-block.png",
  "BasicDiamondBlock": "img/build-buttons/diamond-block.png",
  "WheelBlock": "img/build-buttons/wheel-block.png",
  "TNTBlock": "img/build-buttons/tnt-block.png",
  "rocketBoosterBlock": "img/build-buttons/rocket-booster-block.png",
  "SpikeBlock": "img/build-buttons/spike-block.png",
  "GrappleBlock": "img/build-buttons/grapple-block.png",
  "SeatBlock": "img/build-buttons/seat-block.png",
  "PoweredHingeBlock": "img/build-buttons/powered-hinge-block.png",
  "RemoteBlock": "img/build-buttons/remote-block.png",
  "GrappleBlock": "img/build-buttons/grapple-block.png",
  "PoweredHingeBlock": "img/build-buttons/powered-hinge-block.png",
};

class RightClickMenu {
  constructor(building) {
    this.building = building;
    this.block = null;
    // create a menu for the block
    this.menu = document.createElement("div");
    this.menu.classList.add("menu");
    // create a button to flip the block
    this.flipButton = document.createElement("button");
    this.flipButton.classList.add("menu-button");
    this.flipButton.innerText = "Rotate";
    this.flipButton.onclick = () => {
      this.block.rotate90();
    };
    this.menu.appendChild(this.flipButton);
    // create a button to remove the block
    this.removeButton = document.createElement("button");
    this.removeButton.classList.add("menu-button");
    this.removeButton.innerText = "Remove";
    this.menu.appendChild(this.removeButton);
    this.removeButton.onclick = () => {
      this.block.contraption.removeBlock(this.block);
      // unselect the block
      this.building.removeGhostBlocks();
      // update the button limits
      this.building.buildMenu.updateButtonLimits();
      this.hide();
    };
    // style the menu
    this.menu.classList.add("right-click-menu");
    // set the button class
    this.flipButton.classList.add("right-click-menu-button");
    this.removeButton.classList.add("right-click-menu-button");
    // hide the menu
    this.hide();
    // Add the menu to the game container
    let gameContainer = document.getElementById("game-container");
    gameContainer.appendChild(this.menu);
  }

  startLevel() {
    // bound by the level manager, DO NOT CHANGE
  }
  startBuildModeForLevel() {
    // bound by the level manager, DO NOT CHANGE
  }
  setSelectBlock(block) {
    this.block = block;
  }

  show() {
    // Position the menu
    this.menu.style.position = "absolute";
    this.menu.style.left = '10%'
    this.menu.style.top = '30%'
    // center the menu horizontally
    this.menu.style.transform = "translateX(-50%)";
    // display the menu
    this.menu.style.display = "block";
  }
  hide() {
    // hide the menu
    this.menu.style.display = "none";
    // remove the event listener if it exists
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("keydown", this.reverseKeydownHandler);
  }
}
// a build menu class, for the bottom of the screen.
// the build menu will contain buttons for each block type, a button to save the contraption, a button to load a contraption, a button to clear the contraption, and a button to toggle build mode.
class BuildMenu {
  constructor(building, ResourceHandler = null, blockTypes = false, enemyEditor = true) {
    this.building = building;
    // create the build menu
    this.menu = document.createElement("div");
    this.menu.classList.add("menu");
    this.enemyEditor = enemyEditor;
    this
    // create a button for each block type
    if (blockTypes) {
      this.blockTypes = blockTypes;
      // if the block types is a single string, do something else
      if (typeof blockTypes === "string") {
        console.log('Entering Boss Level! Number of parts determined by player resources.')
        // get the blocks from the Resources object
        this.blockTypes = ResourceHandler.getWorldResources(blockTypes);
        // remove "Coins" from the block types
        this.blockTypes = this.blockTypes.filter((block) => block.name !== "Coins");
      }
      console.log(this.blockTypes);

      
      this.blockTypes.forEach((blockType, index) => {
        try {
          this.blockTypes[index].type = eval(blockType.type);
          this.blockTypes[index].buildImage = buildClassesToImages[blockType.type.name];
        } catch (e) {
          // if the block type is not valid, set it to a basic wooden block
          this.blockTypes[index].type = BasicWoodenBlock;
          this.blockTypes[index].image = "img/build-buttons/basic-block.png";
        }
      });
      

    } else {
      this.blockTypes = [
        {
          name: "Basic Block",
          key: "1",
          type: BasicWoodenBlock,
          limit: 100,
          image: "img/build-buttons/basic-block.png",
        },
        {
          name: "Wheel Block",
          key: "2",
          type: WheelBlock,
          limit: 100,
          image: "img/build-buttons/wheel-block.png",
        },
        {
          name: "TNT Block",
          key: "3",
          type: TNTBlock,
          limit: 100,
          image: "img/build-buttons/tnt-block.png",
        },
        {
          name: "Rocket Booster Block",
          key: "4",
          type: rocketBoosterBlock,
          limit: 100,
          image: "img/build-buttons/rocket-booster-block.png",
        },
        {
          name: "Spike Block",
          key: "5",
          type: SpikeBlock,
          limit: 100,
          image: "img/build-buttons/spike-block.png",
        },
        {
          name: "Grapple Block",
          key: "6",
          type: GrappleBlock,
          limit: 100,
          image: "img/build-buttons/grapple-block.png",
        },
        {
          name: "Seat Block",
          key: "7",
          type: SeatBlock,
          limit: 1,
          image: "img/build-buttons/seat-block.png",
        },
        {
          name: "Powered Hinge Block",
          key: "8",
          type: PoweredHingeBlock,
          limit: 100,
        },
        {
          name: "Remote Block",
          key: "9",
          type: RemoteBlock,
          limit: 100,
        },
      ];
    }
    this.enemyEditor = enemyEditor; // a boolean that determines if the build menu is for the enemy editor

    this.createBlockButtons();

    this.createMenuButtons();
    // initialize the menu
    this.init(building);
    // a variable to prevent build mode from being spammed
    this.buildModeDebounce = false;
  }
  hide() {
    // make the menu invisible and unclickable
    this.menu.style.display = "none";
    this.menu.style.pointerEvents = "none";
  }
  levelMode() {
    // hide the menu
    this.hide();
    // add text if not on mobile
    if (!this.building.mobile) {
      let text = document.createElement("div");
      text.innerText = "Press B to return to builder";
      text.classList.add("build-mode-text");
      text.style.position = "absolute";
      text.style.bottom = "10px";
      text.style.left = "50%";
      text.style.transform = "translateX(-50%)";
      text.style.color = "white";
      text.style.fontSize = "20px";
      text.style.fontFamily = "Arial, sans-serif";
      let gameContainer = document.getElementById("game-container");
      gameContainer.appendChild(text);
    } 
    else {
      
    }
  }
  show() {
    // remove the text that says "press B to enter build mode"
    let text = document.querySelector(".build-mode-text");
    if (text) {
      text.remove();
    }
    // make the menu visible and clickable
    this.menu.style.display = "flex";
    this.menu.style.pointerEvents = "auto";
  }

  createBlockButtons() {
    this.blockButtons = {};
    let blockTypesArray = Array.from(this.blockTypes);
    let currentIndex = 0;

    this.blockTypes.forEach((blockType, index) => {
      let button = document.createElement("button");
      button.classList.add("menu-button", "build-menu-button");
      let buttonImg = document.createElement("img");
      buttonImg.classList.add("build-menu-button-img");
      buttonImg.src = blockType.buildImage;
      let buttonText = document.createElement("p");
      buttonText.innerText = `0/${blockType.limit}`;
      button.appendChild(buttonImg);
      button.appendChild(buttonText);
      button.setAttribute("data-keycode", blockType.key.charCodeAt(0));
      button.onclick = (event) => {
        this.building.setCurrentBlockType(blockType.type, blockType.limit);
        // tell the tutorial that the block has been selected
        try {
          if (!event.synthetic) {
            this.building.levelManager.LevelTutorial.checkInteract("selectBlock");
          }
        } catch (e) {
          console.error("No tutorial found");
        }
        // Remove the active class from all the block type buttons
        Object.values(this.blockButtons).forEach((button) =>
          button.classList.remove("active")
        );
        // Set this button's class to active
        button.classList.add("active");
        currentIndex = index;
      };
      this.menu.appendChild(button);
      this.blockButtons[blockType.type.name] = button;
    });

    // when user scrolls, change the selected block
    window.addEventListener('wheel', (event) => {
      // Determine scroll direction
      let direction = event.deltaY > 0 ? 1 : -1;
      // Calculate new index
      currentIndex = (currentIndex + direction + blockTypesArray.length) % blockTypesArray.length;
      // Simulate a click on the new block button
      let clickEvent = new MouseEvent('click', {
        bubbles: true, // Event bubbles up through the DOM
        cancelable: true, // Event can be canceled
        view: window, // Event's abstract view
      });

      // Add custom property to indicate it's not a real click
      clickEvent.synthetic = true;

      // Dispatch the event on the first block button
      this.blockButtons[blockTypesArray[currentIndex].type.name].dispatchEvent(clickEvent);   
    });
  }
  createMenuButtons() {
    // create a vertical line to separate the block buttons from the other buttons
    let line = document.createElement("div");
    line.classList.add("build-menu-line");
    this.menu.appendChild(line);
    // if this is the enemy editor, show the save and load buttons
    console.log('is enemy editor', this.enemyEditor);
    if (this.enemyEditor) {
      // create a button to save the contraption
      this.saveButton = document.createElement("button");
      this.saveButton.classList.add("menu-button");
      this.saveButton.innerText = "Save";
      this.menu.appendChild(this.saveButton);
      // create a button to load a contraption
      this.loadButton = document.createElement("button");
      this.loadButton.classList.add("menu-button");
      this.loadButton.innerText = "Load";
      this.menu.appendChild(this.loadButton);
    }

    // create a button to toggle build mode
    this.buildModeButton = document.createElement("button");
    this.buildModeButton.classList.add("menu-action-button");
    this.buildModeButton.innerText = "Start";
    this.menu.appendChild(this.buildModeButton);
    // create a button to clear the contraption
    this.clearButton = document.createElement("button");
    this.clearButton.classList.add("menu-action-button");
    this.clearButton.innerText = "Clear";
    this.menu.appendChild(this.clearButton);
    // a button to view the full level
    this.viewLevelButton = document.createElement("button");
    this.viewLevelButton.classList.add("menu-action-button");
    this.viewLevelButton.innerText = "View Level";
    this.menu.appendChild(this.viewLevelButton);

    // style the menu
    this.menu.classList.add("build-menu");
    // // set the button class
    if (this.enemyEditor) {
      this.saveButton.classList.add("build-menu-button");
      this.loadButton.classList.add("build-menu-button");
    }

    // Add the menu to the game container
    let gameContainer = document.getElementById("game-container");
    gameContainer.appendChild(this.menu);
  }

  updateButtonLimits() {
    // get the number of each block in the contraption
    let blockTypeCount = {};
    this.building.contraption.blocks.forEach((block) => {
      if (blockTypeCount[block.constructor.name]) {
        blockTypeCount[block.constructor.name]++;
      } else {
        blockTypeCount[block.constructor.name] = 1;
      }
    });
    // update the button limits
    this.blockTypes.forEach((blockType) => {
      if (blockTypeCount[blockType.type.name]) {
        const buttonText = this.blockButtons[blockType.type.name].querySelector("p");
        buttonText.innerText = `${blockTypeCount[blockType.type.name]}/${blockType.limit}`;
      } else {
        const buttonText = this.blockButtons[blockType.type.name].querySelector("p");
        buttonText.innerText = `0/${blockType.limit}`;
      }
    });
  }
  init(building) {
    // set the button functions
    if (this.enemyEditor) {
      this.saveButton.onclick = () => {
        // make sure build mode is enabled
        if (!building.buildInProgress) {
          return;
        }
        // save the contraption to a JSON object
        let contraptionJson = building.contraption.save();
        // download the JSON object as a file
        let dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(contraptionJson));
        let dlAnchorElem = document.createElement("a");
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "contraption.json");
        dlAnchorElem.click();
      };
      this.loadButton.onclick = () => {
        if (!building.buildInProgress) {
          return;
        }
        // bring up a file input dialog
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.click();
        // when a file is selected, load the contraption
        fileInput.onchange = (event) => {
          let file = event.target.files[0];
          let reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => {
            let contraptionJson = JSON.parse(reader.result);
            // clear the existing contraption
            building.contraption.clear();
            // load the contraption from the JSON object
            building.contraption.load(contraptionJson);
          };
        };
      };
    }
    this.clearButton.onclick = () => {
      // clear the ghost blocks
      building.removeGhostBlocks();
      if (!building.buildInProgress) {
        return;
      }
      building.contraption.clear();
      // update the button limits
      this.updateButtonLimits();
    };

    this.viewLevelButton.onclick = () => {
      // activate view mode
      building.activateViewMode();
    };

    // while in view mode, allow looking around with wasd and arrow keys
    document.addEventListener("keydown", (event) => {
      if (building.viewMode) {
        console.log(event.keyCode);
        this.allowMovement(event);
      }
    });
    

    this.buildModeButton.onclick = () => {
      // prevent the button from being spammed
      if (this.buildModeForce)  {
        console.log("Build mode forced");
      }
      if (this.buildModeDebounce) {
        if (!this.buildModeForce) { // force gets past the debounce
          return;
        }
      }
      this.buildModeDebounce = true;
      // allow the button to be clicked again after some time
      setTimeout(() => {
        this.buildModeDebounce = false;
      }, 1000);

      // remove the ghost blocks
      building.removeGhostBlocks();
      building.buildInProgress = !building.buildInProgress;
      if (building.buildInProgress) {
        if (!building.canEnterBuildMode) {
          if (!this.buildModeForce) { // force gets past the no seat check
            building.buildInProgress = false;
            return;
          }
        }
        building.contraption.despawn(true);
        // remove the control menu if it exists
        if (this.controlMenu) {
          this.controlMenu.remove();
          this.controlMenu = null;
        }
        // set the song to the build theme
        setSong("buildTheme");
        // show the build menu
        this.show();
        // alert the level that we have entered build mode
        try {
          building.startBuildModeForLevel();
        } catch (e) {
          console.error("No level manager found");
        }
        // set this button's class to active
        // this.buildModeButton.classList.add("active");
        // activate the first block type button
        // Create a new click event
        let event = new MouseEvent('click', {
          bubbles: true, // Event bubbles up through the DOM
          cancelable: true, // Event can be canceled
          view: window, // Event's abstract view
        });

        // Add custom property to indicate it's not a real click
        event.synthetic = true;

        // Dispatch the event on the first block button
        Object.values(this.blockButtons)[0].dispatchEvent(event);   

        console.log("Build mode enabled");
        // display a grid over the build area
        building.displayGrid();
        // get rid of the camera target
        building.camera.removeTarget();
        // set the camera viewport to the size of the build area
        building.camera.setViewport(
          building.buildArea.width * 2,
          building.buildArea.height * 2
        );
        // set the camera position to the center of the build area

        building.camera.setCenterPosition(
          building.buildArea.x + building.buildArea.width / 2,
          building.buildArea.y + building.buildArea.height / 2
        );
        setTimeout(() => {
          if (building.buildInProgress) {
            // despawn the contraption
            building.contraption.despawn(true);
          }
        }, 500);
      } else {
        // if the contraption has no seat, don't disable build mode
        if ((!building.contraption.seat) && building.canEnterBuildMode) {
          
          
          if (!this.buildModeForce) { // force gets past the no seat check
            playSound("error");
            // create a toast saying that the contraption needs a seat
            let toast = document.createElement("div");
            toast.classList.add("toast-err"); 
            toast.innerText = "Your contraption needs a seat!";
            document.getElementById("game-container").appendChild(toast);
            setTimeout(() => {
              toast.remove();
            }, 3000);
            building.buildInProgress = true;
            return;
          }
        }
        // if there is exactly 1 block, (the seat), don't disable build mode
        if (building.contraption.blocks.length === 1) {
          if (!this.buildModeForce) { // force gets past the no seat check
            playSound("error");
            let toast = document.createElement("div");
            toast.classList.add("toast-err"); 
            toast.innerText = "You need at least one block other than the seat!";
            document.getElementById("game-container").appendChild(toast);
            setTimeout(() => {
              toast.remove();
            }, 3000);
            building.buildInProgress = true;
            return;
          }
        }
        // check if blocks are disconnected
        let disconnected = building.contraption.showDisconnectedBlocks();
        console.log(disconnected);
        if (disconnected.length > 0) {
          if (!this.buildModeForce) { // force gets past the no seat check
            playSound("error");
            let toast = document.createElement("div");
            toast.classList.add("toast-err");
            toast.innerText = "The highlighted blocks are disconnected! Make sure everything connects to your seat!";
            document.getElementById("game-container").appendChild(toast);

            setTimeout(() => {
              toast.remove();
            }, 5000);
            building.buildInProgress = true;
            return;
          }
        }

        // call levelMode to hide the menu
        this.levelMode();
        // remove the active class from all the block type buttons
        Object.values(this.blockButtons).forEach((button) =>
          button.classList.remove("active")
        );
        // Remove the active class from the build mode button
        this.buildModeButton.classList.remove("active");
        building.removeGrid();
        console.log("Build mode disabled");

        // Spawn the contraption
        building.contraption.spawn();
        // if the user is on mobile, button controls will be shown
        if (building.mobile) {
          // get all controls from the contraption
          let controls = building.contraption.getControls();
          // create buttons so the user can control the contraption on mobile
          let controlMenu = document.createElement("div");
          controlMenu.classList.add("build-menu"); // same class as the build menu
          let controlButtons = {};
          controls.forEach((control) => {
            let button = document.createElement("button");
            button.classList.add("menu-button", "build-menu-button");
            button.innerHTML = control.name;
            button.onmousedown = button.ontouchstart = () => {
              building.contraption.pressKey(control.key); // press the key
              
            };
            button.onmouseup = button.ontouchend = () => {
              building.contraption.releaseKey(control.key); // release the key
            };

  
            // scale the button up compared to the build menu buttons
            button.style.fontSize = "1.5em";
            controlMenu.appendChild(button);
            controlButtons[control.name] = button;
          });
          // add a button to return to build mode
          let returnButton = document.createElement("button");
          returnButton.classList.add("menu-button", "build-menu-button");
          returnButton.innerHTML = "Return to Build Mode";
          returnButton.onclick = () => {
            controlMenu.remove();
            // click the build mode button
            this.buildModeButton.click();
          };
          controlMenu.appendChild(returnButton);
          // add the control menu to the game container
          let gameContainer = document.getElementById("game-container");
          gameContainer.appendChild(controlMenu);
          this.controlMenu = controlMenu;
          
        }
        
        // start the level
        building.startLevel();
        // set the song to the level theme
        setSong("levelTheme");
        // set the camera viewport to the size of the canvas
        const canvas = document.querySelector("canvas");
        // building.camera.setViewport(canvas.width*2.5, canvas.height*2.5);
        building.camera.setViewport(canvas.width * 2, canvas.height * 2);
        // set the camera target to the seat
        building.camera.setTarget(building.contraption.seat);
      }
      this.buildModeForce = false; // reset the force
    };
    // Assuming this is inside a method where 'this' refers to an object that has 'building' property
    const menu = document.querySelector(".build-menu"); // Adjust the selector as needed

    menu.style.bottom = "0px"; // Distance from the bottom of the canvas
    menu.style.left = 500; //`${rect.left + (rect.width / 2) - (menu.offsetWidth / 2)}px`; // Center horizontally
  }
  allowMovement(event) {
    
    // if it is the w key or the up arrow key, move the camera up
    if (event.keyCode === 87 || event.keyCode === 38) {
        this.building.camera.position.y = this.building.camera.position.y - 25;

    }
    // if it is the s key or the down arrow key, move the camera down
    if (event.keyCode === 83 || event.keyCode === 40) {
        this.building.camera.position.y = this.building.camera.position.y + 25;
    }
    // if it is the a key or the left arrow key, move the camera left
    if (event.keyCode === 65 || event.keyCode === 37) {
        this.building.camera.position.x = this.building.camera.position.x - 25;
    }
    // if it is the d key or the right arrow key, move the camera right
    if (event.keyCode === 68 || event.keyCode === 39) {
        this.building.camera.position.x = this.building.camera.position.x + 25;
    }
  }
}

// a refactored version of the building class
class Building {
  constructor(engine, camera, ResourceHandler = null, keybinds = true, isEnemyEditor = false) {
    this.engine = engine;
    this.camera = camera;
    this.keybinds = keybinds;
    this.ResourceHandler = ResourceHandler;

    this.currentBlockType = BasicWoodenBlock; // Default block type
    this.currentBlockTypeLimit = 100; // Default limit for each block type
    this.buildInProgress = false;
    this.contraption = new Contraption(this.engine, this.camera);
    this.buildArea = {
      x: 100,
      y: 200,
      width: 600,
      height: 200,
    };
    this.grid = 50;
    this.gridLines = [];
    // right click menu
    this.RightClickMenu = new RightClickMenu(this);
    // build menu
    this.buildMenu = new BuildMenu(this, ResourceHandler, false, isEnemyEditor);
    this.isEnemyEditor = isEnemyEditor;
    this.buildMenu.hide();
    this.canEnterBuildMode = false;
    this.ghostBlocks = [];
    this.selectedBlock = null;
    this.mobile = screen.width < 600;
    this.controlMenu = null;
    this.viewMode = false;
    // if the user clicks while in view mode, return to build mode
    this.camera.canvas.addEventListener("click", () => {
      if (this.viewMode) {
        // click the build mode button
        this.buildMenu.buildModeButton.click();
        this.viewMode = false;
      }
    });
    this.levelManager = null; // will be set by the level manager
  }
  setCamera(camera) {
    this.camera = camera;
  }
  toggleBuildingMode(force = false) {
    // force is used to force the build mode to be enabled or disabled
    // click the build mode button
    this.buildMenu.buildModeForce = force;
    this.buildMenu.buildModeButton.click();
  }
  activateViewMode() {
    // only allowed if in build mode
    if (!this.buildInProgress) {
      return;
    }
    // remove the ghost blocks
    this.removeGhostBlocks();
    // activate the view mode
    this.viewMode = true;
    this.buildMenu.levelMode();
    const canvas = document.querySelector("canvas");
    // make the view the size it would be when doing the level
    this.camera.setViewport(canvas.width * 2, canvas.height * 2);

    // center the camera on the build area
    this.camera.setCenterPosition(
      this.buildArea.x + this.buildArea.width / 2,
      this.buildArea.y + this.buildArea.height / 2
    );
    this.buildMenu.hide();
    // disable building 
    this.buildInProgress = false;

  }
  setCurrentBlockType(blockType, limit) {
    this.currentBlockType = blockType;
    this.currentBlockTypeLimit = limit;
    // play the select block sound
    // playSound("selectBlock");
  }
  makeNewBuildMenu(blockTypes) {
    // makes a new build menu with the given block types (for levels that limit the blocks that can be used)
    // remove the old build menu
    this.buildMenu.menu.remove();
    this.buildMenu = new BuildMenu(this, this.ResourceHandler, blockTypes, this.isEnemyEditor);
  }
  init() {
    // Add event listener for canvas click
    const canvas = document.querySelector("canvas");
    // Add event listener for placing blocks
    let isMouseDown = false;
    let isRightClick = false;
    canvas.addEventListener("mousedown", (event) => 
    {
      // if it is right click, don't do anything
      if (event.button === 2) {
        isRightClick = true;
        return;
      }
      isMouseDown = true;
      this.handleCanvasClick()
    });
    document.addEventListener("touchend", (event) => this.handleCanvasClick(event)); // for mobile
    // wait for the mouse to be released
    document.addEventListener("mouseup", () => {
      isMouseDown = false;
      isRightClick = false;
    });
    // whenever the mouse moves, remove the ghost blocks
    canvas.addEventListener("mousemove", () => {
      if (isMouseDown) {
        this.handleCanvasClick()
      }
      if (isRightClick) {
        this.handleRightClick()
      }
    });
    // Add event listener for keys
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
    // Add event listener for block editing
    canvas.addEventListener("contextmenu", (event) =>
      this.handleRightClick(event)
    );
  }
  removeGhostBlocks() {
    // hide the right click menu
    this.RightClickMenu.hide();
    // remove the ghost blocks
    this.ghostBlocks.forEach((block) => {
      Matter.World.remove(this.engine.world, block);
    });
    // clear the ghost blocks array
    this.ghostBlocks = [];
    // clear the selected block
    this.selectedBlock = null;
  }
  handleCanvasClick(event = { type: "click" }) {
    // make sure build mode is enabled
    if (!this.buildInProgress) {
      return;
    }
    // prevent the default action for the event
    if (event.type === "touchend") {
      event.preventDefault();
      this.mobile = true;
    }
    else {
      this.mobile = false;
    }
    // get the click or touch end position
    let pos;
    if (event.type === 'click') {
      pos = this.camera.getMousePosition();
    } else if (event.type === 'touchend') {
      let touch = event.changedTouches[0];
      pos = this.camera.getTouchPosition(touch);
    }
    // Round the position to the nearest grid line
    let x = Math.round((pos.x - 25) / this.grid) * this.grid + 25;
    let y = Math.round((pos.y - 25) / this.grid) * this.grid + 25;

    // make sure the position is within the build area
    if (x < this.buildArea.x || x > this.buildArea.x + this.buildArea.width) {
      console.log("Cannot place block here");
      this.removeGhostBlocks();
      // if it is just outside the build area, shift the contraption in that direction
      if (x < this.buildArea.x) {
        this.contraption.shift(-this.grid, 0, this.buildArea);
      }
      if (x > this.buildArea.x + this.buildArea.width) {
        this.contraption.shift(this.grid, 0, this.buildArea);
      }
      if (y < this.buildArea.y) {
        this.contraption.shift(0, -this.grid, this.buildArea);
      }
      if (y > this.buildArea.y + this.buildArea.height) {
        this.contraption.shift(0, this.grid, this.buildArea);
      }
      return;
    }
    if (y < this.buildArea.y || y > this.buildArea.y + this.buildArea.height) {
      console.log("Cannot place block here");
      this.removeGhostBlocks();
      // if it is just outside the build area, shift the contraption in that direction
      if (x < this.buildArea.x) {
        this.contraption.shift(-this.grid, 0, this.buildArea);
      }
      if (x > this.buildArea.x + this.buildArea.width) {
        this.contraption.shift(this.grid, 0, this.buildArea);
      }
      if (y < this.buildArea.y) {
        this.contraption.shift(0, -this.grid, this.buildArea);
      }
      if (y > this.buildArea.y + this.buildArea.height) {
        this.contraption.shift(0, this.grid, this.buildArea);
      }
      return;
    }
    // make sure there is not already a block in the contraption here
    for (let i = 0; i < this.contraption.blocks.length; i++) {
      if (
        this.contraption.blocks[i].x === x &&
        this.contraption.blocks[i].y === y
      ) {
        console.log("Block already here");
        // instead, select this block
        this.selectBlock(this.contraption.blocks[i]);
        return;
      }
    }
    // find how many of each block are already in the contraption, and make sure the limit has not been reached
    let blockTypeCount = {};
    this.contraption.blocks.forEach((block) => {
      if (blockTypeCount[block.constructor.name]) {
        blockTypeCount[block.constructor.name]++;
      } else {
        blockTypeCount[block.constructor.name] = 1;
      }
    });
    if (
      blockTypeCount[this.currentBlockType.name] >= this.currentBlockTypeLimit
    ) {
      console.log("Limit reached for this block type");
      this.removeGhostBlocks();
      return;
    }

    // Create a new block at the click position
    let newBlock = new this.currentBlockType(x, y, this.contraption);
    
    // Add the block to the contraption
    this.contraption.addBlock(newBlock);
    // play the place block sound
    playSound("placeBlock");
    // tell the tutorial that an interaction has occurred
    this.levelManager.LevelTutorial.checkInteract("placeBlock");
    // update the button limits
    // make the new block selected
    this.selectBlock(newBlock);
    this.buildMenu.updateButtonLimits();
    if (this.buildMenu.enemyEditor) {
      // newBlock.flipX();
    }
  }
  selectBlock(block) {

    // remove the ghost blocks
    this.removeGhostBlocks();
    // add a ghost block, a large blue square, to show that the block is selected
    let ghostBlock = Matter.Bodies.rectangle(
      block.x,
      block.y,
      this.grid + 2,
      this.grid + 2,
      {
        isStatic: true,
        render: {
          fillStyle: "rgba(0, 0, 255, 0)",
          strokeStyle: "rgba(17, 90, 209, 0.7)",
          lineWidth: 2,
        },
      }
    );
    this.ghostBlocks.push(ghostBlock);
    Matter.World.add(this.engine.world, ghostBlock);
    // refresh the block, so it displays over the new blocks
    block.bodies.forEach((body) => {
      Matter.World.remove(this.engine.world, body);
      Matter.World.add(this.engine.world, body);
    });
    // make the selected block the block that was clicked
    this.selectedBlock = block;
    // if the user is on a mobile device, show the right click menu
    if (this.mobile) {
      this.showRightClickMenu(block);
    }
    return;
  }
  showRightClickMenu(block, event) {
    // set the menu's block
    this.RightClickMenu.setSelectBlock(block);
    // show the menu
    this.RightClickMenu.show();
  }

  handleRightClick(event=null) {
    // edit the block at the click position
    // make sure build mode is enabled
    if (!this.buildInProgress) {
      return;
    }
    //get the mouse position from the camera
    let pos = this.camera.getMousePosition();

    // Round the position to the nearest grid line
    let x = Math.round((pos.x - 25) / this.grid) * this.grid + 25;
    let y = Math.round((pos.y - 25) / this.grid) * this.grid + 25;
    // find the block at this position
    let block = this.contraption.blocks.find(
      (block) => block.x === x && block.y === y
    );
    if (block) {
      // delete the block
      this.contraption.removeBlock(block);
      this.buildMenu.updateButtonLimits();
      this.removeGhostBlocks();
      // play the remove block sound
      playSound("removeBlock");
      // tell the tutorial that an interaction has occurred
      this.levelManager.LevelTutorial.checkInteract('removeBlock');
    }
  }

  handleKeyDown(event) {
    Object.values(this.buildMenu.blockButtons).forEach((button) => {
      if (button.getAttribute("data-keycode") == event.keyCode) {
        button.click();
      }
    });
    if (!this.keybinds) {
      return;
    }
    // If the Z key is pressed, undo the last block placed
    // if (event.keyCode === 90) {
    //   this.contraption.undo();
    //   // unselect the block
    //   this.removeGhostBlocks();
    // }
    // // If the X key is pressed, redo the last block placed
    // if (event.keyCode === 88) {
    //   this.contraption.redo();
    //   // select the final block
    //   this.selectBlock(this.contraption.blocks[this.contraption.blocks.length - 1]);
    // }

    // if the B key is pressed, toggle build mode
    if (event.keyCode === 66) {
      this.buildMenu.buildModeButton.click();
      this.viewMode = false;
    }
    // if there is a block selected, allow rotation and deletion keybinds
    if (this.selectedBlock && this.buildInProgress) {
      // if R is pressed, rotate
      if (event.keyCode === 82) {
        this.selectedBlock.rotate90();
        // play the rotate block sound
        playSound("rotateBlock");
        // tell the tutorial that an interaction has occurred
        this.levelManager.LevelTutorial.checkInteract("rotateBlock");
      }
      // if backspace, remove the block
      if (event.keyCode === 8) {
        this.contraption.removeBlock(this.selectedBlock);
        this.buildMenu.updateButtonLimits();
        this.removeGhostBlocks();
      }
    }
  }
  setBuildArea(buildArea) {
    this.buildArea = buildArea;
  }
  displayGrid() {
    let buildArea = this.buildArea;
    const gridSpacing = this.grid;

    // Vertical lines
    for (
      let x = buildArea.x;
      x <= buildArea.x + buildArea.width;
      x += gridSpacing
    ) {
      let line = Matter.Bodies.rectangle(
        x + 25 - gridSpacing / 2,
        buildArea.y + buildArea.height / 2,
        1,
        buildArea.height,
        { isStatic: true, render: { visible: true } }
      );
      Matter.World.add(this.engine.world, line);
      this.gridLines.push(line);
    }

    // Horizontal lines
    for (
      let y = buildArea.y;
      y <= buildArea.y + buildArea.height;
      y += gridSpacing
    ) {
      let line = Matter.Bodies.rectangle(
        buildArea.x + buildArea.width / 2,
        y + 25 - gridSpacing / 2,
        buildArea.width,
        1,
        { isStatic: true, render: { visible: true } }
      );
      Matter.World.add(this.engine.world, line);
      this.gridLines.push(line);
    }
    let arrowColor = "#272729";
    // add arrows on each side of the build area which shift the contraption in that direction
    // left arrow
    let leftArrowTop = Matter.Bodies.rectangle(
      buildArea.x - 25,
      buildArea.y + buildArea.height / 2 - 7.1,
      5,
      25,
      { isStatic: true, render: { fillStyle: arrowColor } }
    );
    // rotate the arrow 45 degrees
    Matter.Body.rotate(leftArrowTop, Math.PI / 4);
    // bottom half
    let leftArrowBottom = Matter.Bodies.rectangle(
      buildArea.x - 25,
      buildArea.y + buildArea.height / 2 + 7.1,
      5,
      25,
      { isStatic: true, render: { fillStyle: arrowColor } }
    );
    // rotate the arrow 45 degrees
    Matter.Body.rotate(leftArrowBottom, -Math.PI / 4);
    // add it to the world
    Matter.World.add(this.engine.world, leftArrowTop);
    Matter.World.add(this.engine.world, leftArrowBottom);
    this.gridLines.push(leftArrowTop);
    this.gridLines.push(leftArrowBottom);
    // right arrow
    let rightArrowTop = Matter.Bodies.rectangle(
      buildArea.x + buildArea.width + 25,
      buildArea.y + buildArea.height / 2 - 7.1,
      5,
      25,
      { isStatic: true, render: { fillStyle: arrowColor } }
    );
    // rotate the arrow 45 degrees
    Matter.Body.rotate(rightArrowTop, -Math.PI / 4);
    // bottom half
    let rightArrowBottom = Matter.Bodies.rectangle(
      buildArea.x + buildArea.width + 25,
      buildArea.y + buildArea.height / 2 + 7.1,
      5,
      25,
      { isStatic: true, render: { fillStyle: arrowColor } }
    );
    // rotate the arrow 45 degrees
    Matter.Body.rotate(rightArrowBottom, Math.PI / 4);
    // add it to the world
    Matter.World.add(this.engine.world, rightArrowTop);
    Matter.World.add(this.engine.world, rightArrowBottom);
    this.gridLines.push(rightArrowTop);
    this.gridLines.push(rightArrowBottom);
    // top arrow
    let topArrowLeft = Matter.Bodies.rectangle(
      buildArea.x + buildArea.width / 2 - 7.1,
      buildArea.y - 25,
      25,
      5,
      { isStatic: true, render: { fillStyle: arrowColor } }
    );
    // rotate the arrow 45 degrees
    Matter.Body.rotate(topArrowLeft, -Math.PI / 4);
    // bottom half
    let topArrowRight = Matter.Bodies.rectangle(
      buildArea.x + buildArea.width / 2 + 7.1,
      buildArea.y - 25,
      25,
      5,
      { isStatic: true, render: { fillStyle: arrowColor } }
    );
    // rotate the arrow 45 degrees
    Matter.Body.rotate(topArrowRight, Math.PI / 4);
    // add it to the world
    Matter.World.add(this.engine.world, topArrowLeft);
    Matter.World.add(this.engine.world, topArrowRight);
    this.gridLines.push(topArrowLeft);
    this.gridLines.push(topArrowRight);
    // bottom arrow
    let bottomArrowLeft = Matter.Bodies.rectangle(
      buildArea.x + buildArea.width / 2 - 7.1,
      buildArea.y + buildArea.height + 25,
      25,
      5,
      { isStatic: true, render: { fillStyle: arrowColor } }
    );
    // rotate the arrow 45 degrees
    Matter.Body.rotate(bottomArrowLeft, Math.PI / 4);
    // bottom half
    let bottomArrowRight = Matter.Bodies.rectangle(
      buildArea.x + buildArea.width / 2 + 7.1,
      buildArea.y + buildArea.height + 25,
      25,
      5,
      { isStatic: true, render: { fillStyle: arrowColor } }
    );
    // rotate the arrow 45 degrees
    Matter.Body.rotate(bottomArrowRight, -Math.PI / 4);
    // add it to the world
    Matter.World.add(this.engine.world, bottomArrowLeft);
    Matter.World.add(this.engine.world, bottomArrowRight);
    this.gridLines.push(bottomArrowLeft);
    this.gridLines.push(bottomArrowRight);
  }
  removeGrid() {
    for (let i = 0; i < this.gridLines.length; i++) {
      Matter.World.remove(this.engine.world, this.gridLines[i]);
    }
    this.gridLines = [];
  }
}

export default Building;
