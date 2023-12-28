// Import necessary classes from your block definitions
import {GrassBlock, RampBlockR, RampBlockL, GoalBlock} from '../world/mapBlocks.js';
import { Level } from '../world/level.js';
const RampBlock = RampBlockR;
class rightClickMenu {
    constructor() {
        this.block = null;
        // create a menu for the block
        this.menu = document.createElement('div');
        this.menu.classList.add('menu');
        // create a button to flip the block
        this.flipButton = document.createElement('button');
        this.flipButton.classList.add('menu-button');
        this.flipButton.innerText = 'Flip';
        this.menu.appendChild(this.flipButton);
        // create a button to remove the block
        this.removeButton = document.createElement('button');
        this.removeButton.classList.add('menu-button');
        this.removeButton.innerText = 'Remove';
        this.menu.appendChild(this.removeButton);
        // create a button to cancel
        this.cancelButton = document.createElement('button');
        this.cancelButton.classList.add('menu-button');
        this.cancelButton.innerText = 'Cancel';
        this.menu.appendChild(this.cancelButton);
        // if the user clicks outside the menu, hide it
        document.body.addEventListener('click', (event) => {
            if (event.target != this.menu) {
                this.hide();
            }
        });
        // style the menu
        this.menu.classList.add('right-click-menu');
        // set the button class
        this.flipButton.classList.add('right-click-menu-button');
        this.removeButton.classList.add('right-click-menu-button');
        this.cancelButton.classList.add('right-click-menu-button');
        // hide the menu
        this.hide();
        // Add the menu to the game container
        let gameContainer = document.getElementById('game-container');
        gameContainer.appendChild(this.menu);
    }
    setSelectBlock(block) {
        this.block = block;
        this.block.Level.removeBlock(this.block);
    }

    show(x, y) {
        // Position the menu
        this.menu.style.position = 'absolute';
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
        // display the menu
        this.menu.style.display = 'block';
    }
    hide() {
        // hide the menu
        this.menu.style.display = 'none';
    }
}

// a build menu class, for the bottom of the screen.
// the build menu will contain buttons for each block type, a button to save the Level, a button to load a Level, a button to clear the Level, and a button to toggle build mode.
class BuildMenu {
    constructor(building) {
        this.building = building;
        // create the build menu
        this.menu = document.createElement('div');
        this.menu.classList.add('menu');
        // create a button for each block type
        this.GrassBlockButton = document.createElement('button');
        this.GrassBlockButton.classList.add('menu-button');
        this.GrassBlockButton.innerText = 'Basic Block (1)';
        this.menu.appendChild(this.GrassBlockButton);
        this.GoalBlockButton = document.createElement('button');
        this.GoalBlockButton.classList.add('menu-button');
        this.GoalBlockButton.innerText = 'Wheel Block (2)';
        this.menu.appendChild(this.GoalBlockButton);
        this.RampBlockButton = document.createElement('button');
        this.RampBlockButton.classList.add('menu-button');
        this.RampBlockButton.innerText = 'Cannon Block (3)';
        this.menu.appendChild(this.RampBlockButton);
        this.RampBlockLButton = document.createElement('button');
        this.RampBlockLButton.classList.add('menu-button');
        this.RampBlockLButton.innerText = 'Rocket Booster Block (4)';
        this.menu.appendChild(this.RampBlockLButton);
        // create a button to save the Level
        this.saveButton = document.createElement('button');
        this.saveButton.classList.add('menu-button');
        this.saveButton.innerText = 'Save';
        this.menu.appendChild(this.saveButton);
        // create a button to load a Level
        this.loadButton = document.createElement('button');
        this.loadButton.classList.add('menu-button');
        this.loadButton.innerText = 'Load';
        this.menu.appendChild(this.loadButton);
        // create a button to clear the Level
        this.clearButton = document.createElement('button');
        this.clearButton.classList.add('menu-button');
        this.clearButton.innerText = 'Clear';
        this.menu.appendChild(this.clearButton);
        // create a button to toggle build mode
        this.buildModeButton = document.createElement('button');
        this.buildModeButton.classList.add('menu-button');
        this.buildModeButton.innerText = 'Build Mode (b)';
        this.menu.appendChild(this.buildModeButton);
        // button to toggle fullscreen
        this.fullscreenButton = document.createElement('button');
        this.fullscreenButton.classList.add('menu-button');
        this.fullscreenButton.innerText = 'Fullscreen';
        this.menu.appendChild(this.fullscreenButton);
        // style the menu
        this.menu.classList.add('build-menu');
        // set the button class
        this.GrassBlockButton.classList.add('build-menu-button');
        this.GoalBlockButton.classList.add('build-menu-button');
        this.RampBlockButton.classList.add('build-menu-button');
        this.RampBlockLButton.classList.add('build-menu-button');
        this.saveButton.classList.add('build-menu-button');
        this.loadButton.classList.add('build-menu-button');
        this.clearButton.classList.add('build-menu-button');
        this.buildModeButton.classList.add('build-menu-button');
        // Add the menu to the game container
        let gameContainer = document.getElementById('game-container');
        gameContainer.appendChild(this.menu);
        // initialize the menu
        this.init(building);
    }
    init(building) {
        // set the button functions
        this.GrassBlockButton.onclick = () => {
            // make sure build mode is enabled
            if (!building.buildInProgress) {
                return;
            }
            building.setCurrentBlockType(GrassBlock);
            // set this button's class to active
            this.GrassBlockButton.classList.add('active');
            this.GoalBlockButton.classList.remove('active');
            this.RampBlockButton.classList.remove('active');
            this.RampBlockLButton.classList.remove('active');
        };
        this.GoalBlockButton.onclick = () => {
            // make sure build mode is enabled
            if (!building.buildInProgress) {
                return;
            }
            building.setCurrentBlockType(GoalBlock);
            // set this button's class to active
            this.GrassBlockButton.classList.remove('active');
            this.GoalBlockButton.classList.add('active');
            this.RampBlockButton.classList.remove('active');
            this.RampBlockLButton.classList.remove('active');
        };
        this.RampBlockButton.onclick = () => {
            // make sure build mode is enabled
            if (!building.buildInProgress) {
                return;
            }
            building.setCurrentBlockType(RampBlock);
            this.GrassBlockButton.classList.remove('active');
            this.GoalBlockButton.classList.remove('active');
            this.RampBlockButton.classList.add('active');
            this.RampBlockLButton.classList.remove('active');
        };
        this.RampBlockLButton.onclick = () => {
            // make sure build mode is enabled
            if (!building.buildInProgress) {
                return;
            }
            building.setCurrentBlockType(RampBlockL);
            this.GrassBlockButton.classList.remove('active');
            this.GoalBlockButton.classList.remove('active');
            this.RampBlockButton.classList.remove('active');
            this.RampBlockLButton.classList.add('active');
        };
        this.saveButton.onclick = () => {
            // make sure build mode is enabled
            if (!building.buildInProgress) {
                return;
            }
            // save the Level to a JSON object
            let LevelJson = building.Level.save();
            // download the JSON object as a file
            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LevelJson));
            let dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "Level.json");
            dlAnchorElem.click();
        };
        this.loadButton.onclick = () => {
            if (!building.buildInProgress) {
                return;
            }
            // bring up a file input dialog
            let fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.click();
            // when a file is selected, load the Level
            fileInput.onchange = (event) => {
                let file = event.target.files[0];
                let reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    let LevelJson = JSON.parse(reader.result);
                    // clear the existing Level
                    building.Level.clear();
                    // load the Level from the JSON object
                    building.Level.load(LevelJson);
                };
            };
        };
        this.clearButton.onclick = () => {
            if (!building.buildInProgress) {
                return;
            }
            building.Level.clear();
        };
        this.buildModeButton.onclick = () => {
            building.buildInProgress = !building.buildInProgress;
            if (building.buildInProgress) {
                // set this button's class to active
                this.buildModeButton.classList.add('active');
                // activate the basic block button and set the current block type to GrassBlock
                this.GrassBlockButton.classList.add('active');
                building.setCurrentBlockType(GrassBlock);
                console.log('Build mode enabled');
                if (building.Level) {
                    building.Level.despawn();
                }
                else {
                    console.log('Creating new Level');
                    building.Level = new Level(building.engine, building.camera);
                }
                // display a grid over the build area
                building.displayGrid();
                // get rid of the camera target
                building.camera.removeTarget();
                // set the camera viewport to the size of the build area
                building.camera.setViewport(building.buildArea.width * 2, building.buildArea.height * 2);
                // set the camera position to the center of the build area

                building.camera.setCenterPosition(building.buildArea.x + building.buildArea.width / 2, building.buildArea.y + building.buildArea.height / 2);
            } else {
                // remove the active class from all the block type buttons
                this.GrassBlockButton.classList.remove('active');
                this.GoalBlockButton.classList.remove('active');
                this.RampBlockButton.classList.remove('active');
                this.RampBlockLButton.classList.remove('active');
                // remove the active class from this button
                this.buildModeButton.classList.remove('active');
                building.removeGrid();
                console.log('Build mode disabled');
                // spawn the Level
                building.Level.spawn();

                // set the camera viewport to the size of the canvas
                const canvas = document.querySelector('canvas');
                building.camera.setViewport(canvas.width, canvas.height);


                // set the camera target to a block in the Level

                building.camera.setTarget(building.Level.blocks[0]);
            }
        };
        this.fullscreenButton.onclick = () => {
            this.building.camera.toggleFullScreen();
        };
        // Assuming this is inside a method where 'this' refers to an object that has 'building' property
        const menu = document.querySelector('.build-menu'); // Adjust the selector as needed

        menu.style.bottom = '0px'; // Distance from the bottom of the canvas
        menu.style.left = 500; //`${rect.left + (rect.width / 2) - (menu.offsetWidth / 2)}px`; // Center horizontally
        
    }
}

        

// a refactored version of the building class
class Building {
    constructor(engine, camera) {
        this.engine = engine;
        this.camera = camera;
        this.currentBlockType = GrassBlock; // Default block type
        this.buildInProgress = false;
        this.Level = null;
        this.buildArea = {
            x: 100,
            y: 200,
            width: 300,
            height: 200
        };
        this.grid = 50;
        this.gridLines = [];
        // right click menu
        this.rightClickMenu = new rightClickMenu();
        // build menu
        this.buildMenu = new BuildMenu(this);
    }

    setCurrentBlockType(blockType) {
        this.currentBlockType = blockType;
    }

    init() {
        // Add event listener for canvas click
        const canvas = document.querySelector('canvas');
        // Add event listener for placing blocks
        canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
        // Add event listener for keys
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        // Add event listener for block editing
        canvas.addEventListener('contextmenu', (event) => this.handleRightClick(event));
    }

    handleCanvasClick(_event) {
        // make sure build mode is enabled
        if (!this.buildInProgress) {
            return;
        }
        // get the click position
        let pos = this.camera.getMousePosition();
        // Round the position to the nearest grid line
        let x = Math.round(pos.x / this.grid) * this.grid;
        let y = Math.round(pos.y / this.grid) * this.grid;
        
        // make sure the position is within the build area
        if (x < this.buildArea.x || x > this.buildArea.x + this.buildArea.width) {
            console.log('Cannot place block here');
            return;
        }
        if (y < this.buildArea.y || y > this.buildArea.y + this.buildArea.height) {
            console.log('Cannot place block here');
            return;
        }
        // make sure there is not already a block in the Level here
        for (let i = 0; i < this.Level.blocks.length; i++) {
            if (this.Level.blocks[i].x === x && this.Level.blocks[i].y === y) {
                console.log('Cannot place block here');
                return;
            }
        }
        // Create a new block at the click position
        let newBlock = new this.currentBlockType(x, y, this.Level);
        // Add the block to the Level
        this.Level.addBlock(newBlock);
    }
    showRightClickMenu(block, event) {
        // set the menu's block
        this.rightClickMenu.setSelectBlock(block);
        // get the relative click position using the event
        let pos = {
            x: event.clientX,
            y: event.clientY
        };
        // show the menu
        this.rightClickMenu.show(pos.x, pos.y);
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
        let x = Math.round(pos.x / this.grid) * this.grid;
        let y = Math.round(pos.y / this.grid) * this.grid;
        // find the block at this position
        let block = this.Level.blocks.find(block => block.x === x && block.y === y);
        if (block) {
            this.showRightClickMenu(block, event);
        }
    }

    handleKeyDown(event) {
        // if the 1 key is pressed, click the basic block button
        if (event.keyCode === 49) {
            this.buildMenu.GrassBlockButton.click();
        }
        // if the 2 key is pressed, click the wheel block button
        if (event.keyCode === 50) {
            this.buildMenu.GoalBlockButton.click();
        }
        // if the 3 key is pressed, click the cannon block button
        if (event.keyCode === 51) {
            this.buildMenu.RampBlockButton.click();
        }
        // if the 4 key is pressed, click the rocket booster block button
        if (event.keyCode === 52) {
            this.buildMenu.RampBlockLButton.click();
        }
        // If the Z key is pressed, undo the last block placed
        if (event.keyCode === 90) {
            this.Level.undo();
        }
        // If the X key is pressed, redo the last block placed
        if (event.keyCode === 88) {
            this.Level.redo();
        }

        // if the B key is pressed, toggle build mode
        if (event.keyCode === 66) {
            this.buildMenu.buildModeButton.click();
        }
    }
    displayGrid() {
        const buildArea = this.buildArea;
        const gridSpacing = this.grid;
    
        // Vertical lines
        for (let x = buildArea.x; x <= buildArea.x + buildArea.width + gridSpacing; x += gridSpacing) {
            let line = Matter.Bodies.rectangle(x - gridSpacing / 2, buildArea.y + buildArea.height / 2, 1, buildArea.height + gridSpacing, { isStatic: true, render: { visible: true }});
            Matter.World.add(this.engine.world, line);
            this.gridLines.push(line);
        }
    
        // Horizontal lines
        for (let y = buildArea.y; y <= buildArea.y + buildArea.height + gridSpacing; y += gridSpacing) {
            let line = Matter.Bodies.rectangle(buildArea.x + buildArea.width / 2, y - gridSpacing / 2, buildArea.width + gridSpacing, 1, { isStatic: true, render: { visible: true }});
            Matter.World.add(this.engine.world, line);
            this.gridLines.push(line);
        }
    }
    removeGrid() {
        for (let i = 0; i < this.gridLines.length; i++) {
            Matter.World.remove(this.engine.world, this.gridLines[i]);
        }
        this.gridLines = [];
    }
        
}

export default Building;
