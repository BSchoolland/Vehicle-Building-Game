// Import the block classes from public/js/world/mapBlocks.js
import { GrassBlock, RampBlockL, RampBlockR, slightRampBlockL, slightRampBlockR, GoalBlock, BuildingAreaBlock, EnemySpawnBlock } from '../world/mapBlocks.js';
import { LevelManager } from '../world/level.js';

// a build menu class, for the bottom of the screen.
// the build menu will contain buttons for each block type, a button to save the level, a button to load a level, a button to clear the level, and a button to toggle build mode.
class BuildMenu {
    constructor(building) {
        this.building = building;
        // create the build menu
        this.menu = document.createElement('div');
        this.menu.classList.add('menu');
        // create a button for each block type
        this.blockTypes = [
            { name: 'Grass Block', key: '1', type: GrassBlock },
            { name: 'Ramp Block (L)', key: '2', type: RampBlockL },
            { name: 'Ramp Block (R)', key: '3', type: RampBlockR },
            { name: 'Slight Ramp Block (L)', key: '4', type: slightRampBlockL },
            { name: 'Slight Ramp Block (R)', key: '5', type: slightRampBlockR },
            { name: 'Goal Block', key: '6', type: GoalBlock },
            { name: 'Building Area Block', key: '7', type: BuildingAreaBlock },
            { name: 'Enemy Spawn Block', key: '8', type: EnemySpawnBlock }
        ];
        this.createBlockButtons();
        // create a button to save the level
        this.saveButton = document.createElement('button');
        this.saveButton.classList.add('menu-button');
        this.saveButton.innerText = 'Save';
        this.menu.appendChild(this.saveButton);
        // create a button to load a level
        this.loadButton = document.createElement('button');
        this.loadButton.classList.add('menu-button');
        this.loadButton.innerText = 'Load';
        this.menu.appendChild(this.loadButton);
        // create a button to clear the level
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
    createBlockButtons() {
        this.blockButtons = {};
        this.blockTypes.forEach(blockType => {
            let button = document.createElement('button');
            button.classList.add('menu-button', 'build-menu-button');
            button.innerText = `${blockType.name} (${blockType.key})`;
            button.setAttribute('data-keycode', blockType.key.charCodeAt(0)); // Store keycode as a data attribute
            button.onclick = () => {
                this.building.setCurrentBlockType(blockType.type);
                // Remove the active class from all the block type buttons
                Object.values(this.blockButtons).forEach(button => button.classList.remove('active'));
                // Set this button's class to active
                button.classList.add('active');
            }
            this.menu.appendChild(button);
            this.blockButtons[blockType.type.name] = button;
        });
    }

    init(building) {
        // set the button functions
        this.saveButton.onclick = () => {
            // make sure build mode is enabled
            if (!building.buildInProgress) {
                return;
            }
            // save the level to a JSON object
            let LevelManagerJson = building.level.save();
            // download the JSON object as a file
            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LevelManagerJson));
            let dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "level.json");
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
            // when a file is selected, load the level
            fileInput.onchange = (event) => {
                let file = event.target.files[0];
                let reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    let LevelManagerJson = JSON.parse(reader.result);
                    // clear the existing level
                    building.level.clear();
                    // load the level from the JSON object
                    building.level.loadForEditing(LevelManagerJson);
                };
            };
        };
        this.clearButton.onclick = () => {
            if (!building.buildInProgress) {
                return;
            }
            building.level.clear();
        };
        this.buildModeButton.onclick = () => {
            building.buildInProgress = !building.buildInProgress;
            if (building.buildInProgress) {
                // set this button's class to active
                this.buildModeButton.classList.add('active');
                // activate the grass block button
                this.blockButtons['GrassBlock'].click();
                console.log('Build mode enabled');
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
                Object.values(this.blockButtons).forEach(button => button.classList.remove('active'));
                // Remove the active class from the build mode button
                this.buildModeButton.classList.remove('active');
                building.removeGrid();
                console.log('Build mode disabled');

                // Spawn the level
                building.level.spawn();

                // set the camera viewport to the size of the canvas
                const canvas = document.querySelector('canvas');
                building.camera.setViewport(canvas.width, canvas.height);

                // set the camera target to a block in the level

                building.camera.setTarget(building.level.blocks[0]);
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
        this.currentBlockType = GrassBlock;
        this.buildInProgress = false;
        this.level = new LevelManager(this.engine, this.camera);
        this.buildArea = {
            x: 0,
            y: 0,
            width: 800*2,
            height: 600
        };
        this.grid = 100;
        this.gridLines = [];

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
        // make sure there is not already a block in the level here
        for (let i = 0; i < this.level.blocks.length; i++) {
            if (this.level.blocks[i].x === x && this.level.blocks[i].y === y) {
                console.log('Cannot place block here');
                return;
            }
        }
        // Create a new block at the click position
        let newBlock = new this.currentBlockType(x, y, this.level);
        // Add the block to the level
        this.level.addBlock(newBlock);
    }
    showRightClickMenu(block, event) {
        // set the menu's block
        this.RightClickMenu.setSelectBlock(block);
        // get the relative click position using the event
        let pos = {
            x: event.clientX,
            y: event.clientY
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
        let x = Math.round(pos.x / this.grid) * this.grid;
        let y = Math.round(pos.y / this.grid) * this.grid;
        // find the block at this position
        let block = this.level.blocks.find(block => block.x === x && block.y === y);
        if (block) {
            // delete the block
            this.level.removeBlock(block);
        }
    }

    handleKeyDown(event) {
        Object.values(this.buildMenu.blockButtons).forEach(button => {
            if (button.getAttribute('data-keycode') == event.keyCode) {
                button.click();
            }
        });
        // If the Z key is pressed, undo the last block placed
        if (event.keyCode === 90) {
            this.level.undo();
        }
        // If the X key is pressed, redo the last block placed
        if (event.keyCode === 88) {
            this.level.redo();
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
