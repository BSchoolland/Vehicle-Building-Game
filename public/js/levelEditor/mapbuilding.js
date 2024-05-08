// Import the block classes from public/js/world/mapBlocks.js
import { slightRampBlockRUpsideDown, slightRampBlockLUpsideDown, GrassBlock, RampBlockL, RampBlockR, slightRampBlockL, slightRampBlockR, CoinBlock, BuildingAreaBlock, EnemySpawnBlock } from '../world/mapBlocks.js';
import LevelManager from '../level/LevelManager.js'; 
// import the enemyHandler class
import EnemyHandler from '../loaders/enemyHandler.js';
// contraption blocks
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
  } from "../vehicle/blocks.js";

class ObjectivesMenu { // creates objectives for the level
    constructor(building) {
        this.building = building;
        // create the menu
        this.menu = document.createElement('div');
        this.menu.classList.add('objectives-menu');
        this.menu.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        // create a selector for each objective 
        this.objectiveTypes = [ // different types of levels have different objectives
            { name: 'Destroy', value: 0 }, // destroy x enemies
            { name: 'Collect', value: 0 }, // collect x coins
            { name: 'Survive', value: 0 }, // survive for x seconds
            { name: 'BeforeTime', value: 0 }, // reach the end before x seconds
        ];
        this.createObjectivesSelectors();
    }
    createObjectivesSelectors() {
        this.objectivesSelectors = {};
        this.objectiveTypes.forEach(objectiveType => {
            // add a label for the objective type
            let label = document.createElement('label');
            // in uppercase
            label.innerText = objectiveType.name.toUpperCase();
            this.menu.appendChild(label);
            // selectors that allow for the numbers 0-15
            let selector = document.createElement('select');
            selector.classList.add('menu-button', 'build-menu-button');
            // add the options
            for (let i = 0; i < 31; i++) {
                // add the option
                let option = document.createElement('option');
                option.value = i;
                option.innerText = i;
                selector.appendChild(option);
                // set the default value
                if (i === objectiveType.value) {
                    selector.value = i;
                }
            }
            // when the selector changes, update the objective value
            selector.onchange = () => {
                objectiveType.value = Number(selector.value);
            }
            this.menu.appendChild(selector);
            this.objectivesSelectors[objectiveType.name] = selector;
        });
        // get the container
        let gameContainer = document.getElementById('container');
        //add the menu to the container
        gameContainer.appendChild(this.menu);
    }
    setObjectiveTypes(objectiveTypes) {
        this.objectiveTypes = objectiveTypes;
        // clear the menu
        this.menu.innerHTML = '';
        // create the objective selectors
        this.createObjectivesSelectors();
    }
}
            


class allowedBlockMenu {
    constructor(building) {
        this.building = building;
        // create the menu
        this.menu = document.createElement('div');
        this.menu.classList.add('allowed-block-menu');
        // create a selector for each block type
        this.blockTypes = [
            { name: 'Basic Block', type: BasicWoodenBlock, allowed: 0 },
            { name: 'Wheel Block', type: WheelBlock, allowed: 0 },
            { name: 'Seat Block', type: SeatBlock, allowed: 1 }, // only one seat block is allowed
            { name: 'Spike Block', type: SpikeBlock, allowed: 0 },
            { name: 'TNT Block', type: TNTBlock, allowed: 0 },
            { name: 'Rocket Booster', type: rocketBoosterBlock, allowed: 0 },
            { name: 'Remote Block', type: RemoteBlock, allowed: 0 },
        ];
        this.createBlockSelectors();
    }
    createBlockSelectors() {
        this.blockSelectors = {};
        this.blockTypes.forEach(blockType => {
            // add a label for the block type
            let label = document.createElement('label');
            // in uppercase
            label.innerText = blockType.name.toUpperCase();
            this.menu.appendChild(label);
            // selectors that allow for the numbers 0-15
            let selector = document.createElement('select');
            selector.classList.add('menu-button', 'build-menu-button');
            // add the options
            for (let i = 0; i < 31; i++) {
                // add the option
                let option = document.createElement('option');
                option.value = i;
                option.innerText = i;
                selector.appendChild(option);
                // set the default value
                if (i === blockType.allowed) {
                    selector.value = i;
                }
            }
            // when the selector changes, update the allowed number of blocks
            selector.onchange = () => {
                blockType.allowed = Number(selector.value);
            }
            this.menu.appendChild(selector);
            this.blockSelectors[blockType.type.name] = selector;
        });
        // get the container
        let gameContainer = document.getElementById('container');
        //add the menu to the container
        gameContainer.appendChild(this.menu);
    }
    setBuildingBlockTypes(buildingBlockTypes) {
        // set the block types
        this.blockTypes = [
            { name: 'Basic Block', type: BasicWoodenBlock, allowed: 0 },
            { name: 'Wheel Block', type: WheelBlock, allowed: 0 },
            { name: 'Seat Block', type: SeatBlock, allowed: 1 }, // only one seat block is allowed
            { name: 'Spike Block', type: SpikeBlock, allowed: 0 },
            { name: 'TNT Block', type: TNTBlock, allowed: 0 },
            { name: 'Rocket Booster', type: rocketBoosterBlock, allowed: 0 },
            { name: 'Remote Block', type: RemoteBlock, allowed: 0 },
        ];
        let length = buildingBlockTypes.length;
        for (let i = 0; i < length; i++) {
            let blockType = {};

            // get the block type
            try {
                blockType.type = eval(buildingBlockTypes[i].type);
            } catch (error) {
                console.error(`Unknown block type: ${buildingBlockTypes[i].name} using BasicWoodenBlock instead`);
                blockType.type = BasicWoodenBlock;
            }
            // set the allowed number of blocks
            blockType.allowed = buildingBlockTypes[i].limit;
            // check if the block type is already in the list
            let index = this.blockTypes.findIndex(block => block.type.name === blockType.type.name);
            if (index > -1) {
                // update the allowed number of blocks
                this.blockTypes[index].allowed = blockType.allowed;
            }
            else {
                // add the block type to the list
                blockType.name = buildingBlockTypes[i].name;
                this.blockTypes.push(blockType);
            }
        }
        // clear the menu
        this.menu.innerHTML = '';
        // create the block selectors
        this.createBlockSelectors();
    }
}

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
            { name: 'Coin', key: '6', type: CoinBlock },
            { name: 'Building Area Block', key: '7', type: BuildingAreaBlock },
            { name: 'Enemy Spawn Block', key: '8', type: EnemySpawnBlock },
            { name: 'upsidedown slight ramp', key: '9', type: slightRampBlockLUpsideDown},
            { name: 'upsidedown slight ramp R', key: '0', type: slightRampBlockRUpsideDown},
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
        // create a button to test the level
        this.testButton = document.createElement('button');
        this.testButton.classList.add('menu-button');
        this.testButton.innerText = 'Test Level';
        this.menu.appendChild(this.testButton);
        // create a button to toggle build mode
        this.buildModeButton = document.createElement('button');
        this.buildModeButton.classList.add('menu-button');
        this.buildModeButton.innerText = 'Build Mode (b)';
        // make the button invisible since we are in level editor mode
        this.buildModeButton.style.display = 'none';
        this.menu.appendChild(this.buildModeButton);
        // style the menu
        this.menu.classList.add('build-menu');
        // set the button class
        this.saveButton.classList.add('build-menu-button');
        this.loadButton.classList.add('build-menu-button');
        this.clearButton.classList.add('build-menu-button');
        this.testButton.classList.add('build-menu-button');
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
            let LevelManagerJson = building.level.LevelEditor.save();
            let key = 0;
            // remove the block types that are not allowed
            this.building.blockSelectors.blockTypes = this.building.blockSelectors.blockTypes.filter(blockType => blockType.allowed > 0);
            const buildingBlockTypes = this.building.blockSelectors.blockTypes.map(blockType => {
                key ++;
                return {
                    name: blockType.name,
                    key: key.toString(),
                    type: blockType.type.name,
                    limit: blockType.allowed
                };
            });
            // save the block types to the JSON object
            LevelManagerJson.buildingBlockTypes = buildingBlockTypes;
            // save the objective types to the JSON object
            LevelManagerJson.objectives = this.building.objectivesSelectors.objectiveTypes;
            // add tutorial text
            LevelManagerJson.tutorialText = document.getElementById('tutorial-text').value;
            // download the JSON object as a file
            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LevelManagerJson));
            let dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "level.json");
            dlAnchorElem.click();
            // also save the level to the local storage
            localStorage.setItem('level', JSON.stringify(LevelManagerJson));
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

                    this.loadLevel(LevelManagerJson);
                };
            };
        };
        
        this.clearButton.onclick = () => {
            if (!building.buildInProgress) {
                return;
            }
            building.level.LevelLoader.clear();
        };
        this.testButton.onclick = () => {
            // save the level to the local storage
            let LevelManagerJson = building.level.LevelEditor.save();
            let key = 0;
            // remove the block types that are not allowed
            this.building.blockSelectors.blockTypes = this.building.blockSelectors.blockTypes.filter(blockType => blockType.allowed > 0);
            const buildingBlockTypes = this.building.blockSelectors.blockTypes.map(blockType => {
                key ++;

                return {
                    name: blockType.name,
                    key: key.toString(),
                    type: blockType.type.name,
                    limit: blockType.allowed
                };
            });
            // save the block types to the JSON object
            LevelManagerJson.buildingBlockTypes = buildingBlockTypes;
            // save the objective types to the JSON object
            LevelManagerJson.objectives = this.building.objectivesSelectors.objectiveTypes;
            // add tutorial text
            LevelManagerJson.tutorialText = document.getElementById('tutorial-text').value;
            // save the level to the local storage
            localStorage.setItem('level', JSON.stringify(LevelManagerJson));
            // set the href of the page to the mylevel.html
            window.location.href = 'mylevel.html';
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
                building.camera.setViewport(building.buildArea.width * 1.75, building.buildArea.height * 1.75);
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
        // Assuming this is inside a method where 'this' refers to an object that has 'building' property
        const menu = document.querySelector('.build-menu'); // Adjust the selector as needed
        menu.style.bottom = '0px'; // Distance from the bottom of the canvas
        menu.style.left = 500; //`${rect.left + (rect.width / 2) - (menu.offsetWidth / 2)}px`; // Center horizontally
    }
    loadLevel(LevelManagerJson) {
        // clear the existing level
        this.building.level.LevelLoader.clear();
        // load the level from the JSON object
        this.building.level.LevelEditor.loadForEditing(LevelManagerJson);
        // get the block types from the JSON object
        let buildingBlockTypes = LevelManagerJson.buildingBlockTypes;
        // set the block types
        this.building.blockSelectors.setBuildingBlockTypes(buildingBlockTypes);
        // set the objective types
        this.building.objectivesSelectors.setObjectiveTypes(LevelManagerJson.objectives);
        // set the tutorial text
        document.getElementById('tutorial-text').value = LevelManagerJson.tutorialText;
    }
}       

// a refactored version of the building class for level editing
class Building {
    constructor(engine, camera) {
        this.engine = engine;
        this.camera = camera;
        this.currentBlockType = GrassBlock;
        this.buildInProgress = false;
        this.level = new LevelManager(this.engine, this.camera);
        this.enemyHandler = new EnemyHandler();
        this.buildArea = {
            x: 0,
            y: 0,
            width: 800*6,
            height: 600*3
        };
        this.grid = 100;
        this.gridLines = [];

        // build menu
        this.buildMenu = new BuildMenu(this);
        this.blockSelectors = new allowedBlockMenu(this);
        this.objectivesSelectors = new ObjectivesMenu(this);
        // if level is in local storage, load it
        if (localStorage.getItem('level')) {
            try {
                let LevelManagerJson = JSON.parse(localStorage.getItem('level'));
                setTimeout(() => { // FIXME: This is a workaround for a bug where the level is not loaded properly due to vehicle contraptions not being loaded
                    this.buildMenu.loadLevel(LevelManagerJson);
                },1000);

                
            } catch (error) {
                console.error('Failed to load level from local storage');
            }
        }
    }

    setCurrentBlockType(blockType) {
        this.currentBlockType = blockType;
    }

    init() {
        // Add event listener for canvas click
        const canvas = document.querySelector('canvas');
        // Add event listener for placing blocks
        // canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
        let isMouseDown = false;

        canvas.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                isMouseDown = true;
                this.handleCanvasClick(event);
            }
        });

        canvas.addEventListener('mousemove', (event) => {
            if(isMouseDown && event.button === 0) {
                this.handleCanvasClick(event);
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                isMouseDown = false;
            }
        });

        // Add event listener for keys
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        // Add event listener for block editing
        canvas.addEventListener('contextmenu', (event) => this.handleRightClick(event));
        // ckick the build mode button to enable build mode
        this.buildMenu.buildModeButton.click();
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
            // console.log('Cannot place block here');
            // return;
            console.warn('Cannot place block here (temporarily disabled)');
        }
        if (y < this.buildArea.y || y > this.buildArea.y + this.buildArea.height) {
            // console.log('Cannot place block here');
            // return;
            console.warn('Cannot place block here (temporarily disabled)');
        }
        // make sure there is not already a block in the level here
        for (let i = 0; i < this.level.blocks.length; i++) {
            if (this.level.blocks[i].x === x && this.level.blocks[i].y === y) {
                console.log('Cannot place block here');
                // if the block is an enemy spawn block, show the right click menu
                if (this.level.blocks[i].constructor.name === 'EnemySpawnBlock') {
                    this.showRightClickMenu(this.level.blocks[i], _event);
                }
                return;
            }
        }
        // Create a new block at the click position
        let newBlock = new this.currentBlockType(x, y, this.level);
        if (newBlock.constructor.name === 'EnemySpawnBlock') {
            this.showRightClickMenu(newBlock, _event);
        }
        // Add the block to the level
        this.level.LevelLoader.addBlock(newBlock);
    }
    showRightClickMenu(block, event) { // for when the user places an enemy spawn block

        const enemies = this.enemyHandler.enemies;
        // create a popup with each enemy type
        let popup = document.createElement('div');
        popup.classList.add('popup');
        // position the popup
        popup.className = 'right-click-menu';
        popup.style.position = 'absolute';
        popup.style.top = `${event.clientY}px`;
        popup.style.left = `${event.clientX}px`;
        // add a button for each enemy type
        Object.keys(enemies).forEach(enemy => {
            let button = document.createElement('button');
            button.innerText = enemy;
            button.classList.add('menu-button');
            if (block.enemyType === enemy) {
                button.classList.add('selected');
            }
            button.onclick = () => {
                // set the block's enemy type
                block.enemyType = enemy;
                // set the block's enemy json
                block.enemyJson = enemies[enemy];
                // destroy the current enemy contraption
                if (block.enemyContraption) {
                    block.enemyContraption.destroy();
                };
                // create a new enemy contraption
                block.enemyContraption = this.level.LevelLoader.loadEnemyContraption({enemyType: enemy, x: block.x, y: block.y});
                // remove the popup
                popup.remove();
            };
            popup.appendChild(button);
        });
        // show the popup
        document.body.appendChild(popup);
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
            this.level.LevelLoader.removeBlock(block);
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
