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
} from "../vehicle/blocks.js";
import { Contraption } from "../vehicle/contraption.js";
import { playSound, setSong } from "../sounds/playSound.js";

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
    this.flipButton.innerText = "Flip";
    this.flipButton.onclick = () => {
      this.block.rotate90();
      this.hide();
    };
    this.menu.appendChild(this.flipButton);
    // create a button to remove the block
    this.removeButton = document.createElement("button");
    this.removeButton.classList.add("menu-button");
    this.removeButton.innerText = "Remove";
    this.menu.appendChild(this.removeButton);
    this.removeButton.onclick = () => {
      this.block.contraption.removeBlock(this.block);
      // play the remove block sound
      // playSound("removeBlock");
      // update the button limits
      this.building.buildMenu.updateButtonLimits();
      this.hide();
    };
    // create a button to change the block's activation key
    this.keybindButton = document.createElement("button");
    this.keybindButton.classList.add("menu-button");
    this.keybindButton.innerText = "activate: ";
    this.menu.appendChild(this.keybindButton);
    this.keybindButton.onclick = () => {
      // set the button's text to 'Press a key'
      this.keybindButton.innerText = "Press a key";
      // Add the event listener
      document.addEventListener("keydown", this.keydownHandler);
    };
    // by default, the keybind button is hidden
    this.keybindButton.style.display = "none";
    // add a reverse keybind button
    this.reverseKeybindButton = document.createElement("button");
    this.reverseKeybindButton.classList.add("menu-button");
    this.reverseKeybindButton.innerText = "reverse: ";
    this.menu.appendChild(this.reverseKeybindButton);
    this.reverseKeybindButton.onclick = () => {
      // set the button's text to 'Press a key'
      this.reverseKeybindButton.innerText = "Press a key";
      // Add the event listener
      document.addEventListener("keydown", this.reverseKeydownHandler);
    };
    // by default, the reverse keybind button is hidden
    this.reverseKeybindButton.style.display = "none";

    // create a button to cancel
    this.cancelButton = document.createElement("button");
    this.cancelButton.classList.add("menu-button");
    this.cancelButton.innerText = "Cancel";
    this.menu.appendChild(this.cancelButton);
    this.cancelButton.onclick = () => {
      this.hide();
    };
    // if the user clicks outside the menu, hide it
    document.body.addEventListener("click", (event) => {
      if (
        event.target != this.menu &&
        event.target != this.keybindButton &&
        event.target != this.reverseKeybindButton
      ) {
        this.hide();
      }
    });
    // style the menu
    this.menu.classList.add("right-click-menu");
    // set the button class
    this.flipButton.classList.add("right-click-menu-button");
    this.removeButton.classList.add("right-click-menu-button");
    this.cancelButton.classList.add("right-click-menu-button");
    this.keybindButton.classList.add("right-click-menu-button");
    this.reverseKeybindButton.classList.add("right-click-menu-button");
    // hide the menu
    this.hide();
    // Add the menu to the game container
    let gameContainer = document.getElementById("game-container");
    gameContainer.appendChild(this.menu);
  }
  keydownHandler = (event) => {
    // set the block's activation key to the key that was pressed
    this.block.activationKey = event.key;
    // set the button's text to 'Change Keybind'
    this.keybindButton.innerText = `activate: ${this.block.activationKey}`;
    // remove the event listener
    document.removeEventListener("keydown", this.keydownHandler);
    // after a short delay, hide the menu
    setTimeout(() => {
      this.hide();
    }, 500);
  };
  reverseKeydownHandler = (event) => {
    // set the block's reverse activation key to the key that was pressed
    this.block.reverseActivationKey = event.key;
    // set the button's text to 'Change Keybind'
    this.reverseKeybindButton.innerText = `reverse: ${this.block.reverseActivationKey}`;
    // remove the event listener
    document.removeEventListener("keydown", this.reverseKeydownHandler);
    // after a short delay, hide the menu
    setTimeout(() => {
      this.hide();
    }, 500);
  };

  startLevel() {
    // bound by the level manager, DO NOT CHANGE
  }
  startBuildModeForLevel() {
    // bound by the level manager, DO NOT CHANGE
  }
  setSelectBlock(block) {
    this.block = block;
    // if the block has an activation key, show the custom keybind button, otherwise hide it
    if (this.block.activationKey) {
      this.keybindButton.style.display = "block";
      this.keybindButton.innerText = `activate: ${this.block.activationKey}`;
    } else {
      this.keybindButton.style.display = "none";
    }
    // if the block has a reverse activation key, show the custom keybind button, otherwise hide it
    if (this.block.reverseActivationKey) {
      this.reverseKeybindButton.style.display = "block";
      this.reverseKeybindButton.innerText = `reverse: ${this.block.reverseActivationKey}`;
    } else {
      this.reverseKeybindButton.style.display = "none";
    }
  }

  show(x, y) {
    // Position the menu
    this.menu.style.position = "absolute";
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
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
  constructor(building, blockTypes = false) {
    this.building = building;
    // create the build menu
    this.menu = document.createElement("div");
    this.menu.classList.add("menu");
    // create a button for each block type
    if (blockTypes) {
      this.blockTypes = blockTypes;
      // for each "type" replace the string with the actual class
      this.blockTypes.forEach((blockType, index) => {
        try {
          this.blockTypes[index].type = eval(blockType.type);
        } catch (e) {
          // if the block type is not valid, set it to a basic wooden block
          this.blockTypes[index].type = BasicWoodenBlock;
        }
      });
    } else {
      this.blockTypes = [
        { name: "Basic Block", key: "1", type: BasicWoodenBlock, limit: 100 },
        { name: "Wheel Block", key: "2", type: WheelBlock, limit: 100 },
        { name: "TNT Block", key: "3", type: TNTBlock, limit: 100 },
        {
          name: "Rocket Booster Block",
          key: "4",
          type: rocketBoosterBlock,
          limit: 100,
        },
        { name: "Spike Block", key: "5", type: SpikeBlock, limit: 100 },
        { name: "Grapple Block", key: "6", type: GrappleBlock, limit: 100 },
        { name: "Seat Block", key: "7", type: SeatBlock, limit: 100 },
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
    this.createBlockButtons();
    // // create a button to save the contraption
    // this.saveButton = document.createElement("button");
    // this.saveButton.classList.add("menu-button");
    // this.saveButton.innerText = "Save";
    // this.menu.appendChild(this.saveButton);
    // // create a button to load a contraption
    // this.loadButton = document.createElement("button");
    // this.loadButton.classList.add("menu-button");
    // this.loadButton.innerText = "Load";
    // this.menu.appendChild(this.loadButton);
    // create a button to clear the contraption
    this.clearButton = document.createElement("button");
    this.clearButton.classList.add("menu-button");
    this.clearButton.innerText = "Clear";
    this.menu.appendChild(this.clearButton);
    // create a button to toggle build mode
    this.buildModeButton = document.createElement("button");
    this.buildModeButton.classList.add("menu-button");
    this.buildModeButton.innerText = "Start Level (b)";
    this.menu.appendChild(this.buildModeButton);
    // button to toggle fullscreen
    this.fullscreenButton = document.createElement("button");
    this.fullscreenButton.classList.add("menu-button");
    this.fullscreenButton.innerText = "Fullscreen";
    this.menu.appendChild(this.fullscreenButton);
    // style the menu
    this.menu.classList.add("build-menu");
    // // set the button class
    // this.saveButton.classList.add("build-menu-button");
    // this.loadButton.classList.add("build-menu-button");
    this.clearButton.classList.add("build-menu-button");
    this.buildModeButton.classList.add("build-menu-button");
    // Add the menu to the game container
    let gameContainer = document.getElementById("game-container");
    gameContainer.appendChild(this.menu);
    // initialize the menu
    this.init(building);
  }
  hide() {
    // make the menu invisible and unclickable
    this.menu.style.display = "none";
    this.menu.style.pointerEvents = "none";
  }
  levelMode() {
    // hide the menu
    this.hide();
    // add text that says "press B to enter build mode"
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
    this.blockTypes.forEach((blockType) => {
      let button = document.createElement("button");
      button.classList.add("menu-button", "build-menu-button");
      button.innerHTML = `${blockType.name}<br>0/${blockType.limit}`;
      button.setAttribute("data-keycode", blockType.key.charCodeAt(0));
      button.onclick = () => {
        this.building.setCurrentBlockType(blockType.type, blockType.limit);
        // Remove the active class from all the block type buttons
        Object.values(this.blockButtons).forEach((button) =>
          button.classList.remove("active")
        );
        // Set this button's class to active
        button.classList.add("active");
      };
      this.menu.appendChild(button);
      this.blockButtons[blockType.type.name] = button;
    });
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
        this.blockButtons[blockType.type.name].innerHTML = `${
          blockType.name
        }<br>${blockTypeCount[blockType.type.name]}/${blockType.limit}`;
      } else {
        this.blockButtons[
          blockType.type.name
        ].innerHTML = `${blockType.name}<br>0/${blockType.limit}`;
      }
    });
  }
  init(building) {
    // set the button functions
    // this.saveButton.onclick = () => {
    //   // make sure build mode is enabled
    //   if (!building.buildInProgress) {
    //     return;
    //   }
    //   // save the contraption to a JSON object
    //   let contraptionJson = building.contraption.save();
    //   // download the JSON object as a file
    //   let dataStr =
    //     "data:text/json;charset=utf-8," +
    //     encodeURIComponent(JSON.stringify(contraptionJson));
    //   let dlAnchorElem = document.createElement("a");
    //   dlAnchorElem.setAttribute("href", dataStr);
    //   dlAnchorElem.setAttribute("download", "contraption.json");
    //   dlAnchorElem.click();
    // };
    // this.loadButton.onclick = () => {
    //   if (!building.buildInProgress) {
    //     return;
    //   }
    //   // bring up a file input dialog
    //   let fileInput = document.createElement("input");
    //   fileInput.type = "file";
    //   fileInput.click();
    //   // when a file is selected, load the contraption
    //   fileInput.onchange = (event) => {
    //     let file = event.target.files[0];
    //     let reader = new FileReader();
    //     reader.readAsText(file);
    //     reader.onload = () => {
    //       let contraptionJson = JSON.parse(reader.result);
    //       // clear the existing contraption
    //       building.contraption.clear();
    //       // load the contraption from the JSON object
    //       building.contraption.load(contraptionJson);
    //     };
    //   };
    // };
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
    this.buildModeButton.onclick = () => {
      // remove the ghost blocks
      building.removeGhostBlocks();
      building.buildInProgress = !building.buildInProgress;
      if (building.buildInProgress) {
        if (!building.canEnterBuildMode){
          building.buildInProgress = false;
          return;
        }
        building.contraption.despawn(true);
        // set the song to the build theme
        setSong("buildTheme");
        // show the build menu
        this.show();
        // alert the level that we have entered build mode
        try{
          building.startBuildModeForLevel();
        } catch (e) {
          console.log("No level manager found");
        }
        // set this button's class to active
        this.buildModeButton.classList.add("active");
        // activate the first block type button
        Object.values(this.blockButtons)[0].click();
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
        if (!building.contraption.seat && building.canEnterBuildMode) {
          playSound("error");
          building.buildInProgress = true;
          return;
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
        // start the level
        building.startLevel();
        // set the song to the level theme
        setSong("levelTheme");
        // set the camera viewport to the size of the canvas
        const canvas = document.querySelector("canvas");
        building.camera.setViewport(canvas.width*2.5, canvas.height*2.5);
        
        // set the camera target to the seat
        building.camera.setTarget(building.contraption.seat);
        // despawn the contraption after a short delay
        
      }
    };
    this.fullscreenButton.onclick = () => {
      this.building.camera.toggleFullScreen();
    };
    // Assuming this is inside a method where 'this' refers to an object that has 'building' property
    const menu = document.querySelector(".build-menu"); // Adjust the selector as needed

    menu.style.bottom = "0px"; // Distance from the bottom of the canvas
    menu.style.left = 500; //`${rect.left + (rect.width / 2) - (menu.offsetWidth / 2)}px`; // Center horizontally
  }
}

// a refactored version of the building class
class Building {
  constructor(engine, camera, keybinds = true) {
    this.engine = engine;
    this.camera = camera;
    this.keybinds = keybinds;
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
    this.buildMenu = new BuildMenu(this);
    this.buildMenu.hide();
    this.canEnterBuildMode = false;
    this.ghostBlocks = [];
    this.selectedBlock = null;
  }
  setCamera(camera) {
    this.camera = camera;
  }
  toggleBuildingMode(force = false) { // force is used to force the build mode to be enabled or disabled
    // click the build mode button
    this.buildMenu.buildModeButton.click();
  }
  setCurrentBlockType(blockType, limit) {
    this.currentBlockType = blockType;
    this.currentBlockTypeLimit = limit;
  }
  makeNewBuildMenu(blockTypes) {
    // makes a new build menu with the given block types (for levels that limit the blocks that can be used)
    // remove the old build menu
    this.buildMenu.menu.remove();
    this.buildMenu = new BuildMenu(this, blockTypes);
  }
  init() {
    // Add event listener for canvas click
    const canvas = document.querySelector("canvas");
    // Add event listener for placing blocks
    canvas.addEventListener("click", (event) => this.handleCanvasClick(event));
    // Add event listener for keys
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
    // Add event listener for block editing
    canvas.addEventListener("contextmenu", (event) =>
      this.handleRightClick(event)
    );
  }
  removeGhostBlocks() {
    this.ghostBlocks.forEach((block) => {
      Matter.World.remove(this.engine.world, block);
    });
    // clear the ghost blocks array
    this.ghostBlocks = [];
    // clear the selected block
    this.selectedBlock = null;
  }
  handleCanvasClick(_event) {
    // make sure build mode is enabled
    if (!this.buildInProgress) {
      return;
    }
    // get the click position
    let pos = this.camera.getMousePosition();
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
        return
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
    // playSound("placeBlock");
    // update the button limits
    // make the new block selected
    this.selectBlock(newBlock);
    this.buildMenu.updateButtonLimits();
  }
  selectBlock(block) {
    // if the block is already selected, deselect it
    if (this.selectedBlock === block) {
      this.removeGhostBlocks();
      return;
    }
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
    return;
  }
  showRightClickMenu(block, event) {
    // set the menu's block
    this.RightClickMenu.setSelectBlock(block);
    // get the relative click position using the event
    let pos = {
      x: event.clientX,
      y: event.clientY + this.grid,
    };
    // show the menu
    this.RightClickMenu.show(pos.x, pos.y);
  }

  handleRightClick(event) {
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
    }
    // if there is a block selected, allow rotation and deletion keybinds
    if (this.selectedBlock && this.buildInProgress) {
      // if R is pressed, rotate
      if (event.keyCode === 82) {
        this.selectedBlock.rotate90();
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
